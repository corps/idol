use crate::deconstructors::TypeDeconstructor;
use crate::dep_mapper::DepMapper;
use crate::models::declarations::TypeDec;
use crate::models::loaded::LoadedModule;
use crate::models::schema::{Module, Reference, Type};
use crate::modules_store::{ModulesStore, TypeLookup};
use crate::type_dec_parser::{parse_type_dec, ParsedTypeDec};
use crate::type_resolver::resolve_types;
use crate::utils::ordered_by_keys;
use regex::{escape, Regex};
use std::collections::HashMap;
use std::str::FromStr;

pub struct ModuleResolver<'a> {
    store: &'a mut ModulesStore,
    loaded: &'a LoadedModule,
}

impl From<(String, String)> for Reference {
    fn from(pair: (String, String)) -> Self {
        let qualified_name = format!("{}.{}", pair.0, pair.1);
        Reference {
            module_name: pair.0,
            type_name: pair.1,
            qualified_name,
        }
    }
}

pub fn resolve_module(store: &mut ModulesStore, loaded: &LoadedModule) -> Result<Module, String> {
    (ModuleResolver { store, loaded }).resolve()
}

impl<'a> ModuleResolver<'a> {
    fn resolve(&mut self) -> Result<Module, String> {
        let mut result = Module::default();
        result.module_name = self.loaded.module_name.to_owned();
        let mut local_type_dep_mapper = DepMapper::new();

        let included_types = self.resolve_includes(&mut local_type_dep_mapper)?;
        let parsed_type_decs = self.parse_type_decs(&mut local_type_dep_mapper)?;

        for (type_name, t) in included_types {
            if parsed_type_decs.contains_key(&type_name) {
                return Err(format!(
                    "Included type {} conflicts with locally defined type",
                    type_name
                ));
            }

            result.types_by_name.insert(type_name, t);
        }

        for (type_name, _) in parsed_type_decs.iter() {
            self.ensure_dependencies_of(
                Reference::from((result.module_name.to_owned(), type_name.to_owned())),
                &parsed_type_decs,
            )?;
        }

        result.types_dependency_ordering = local_type_dep_mapper.order_dependencies();

        result.types_by_name = resolve_types(
            self.store,
            &result.module_name,
            &parsed_type_decs,
            &result.types_dependency_ordering,
        )
        .map_err(|msg| format!("While resolving module {}: {}", result.module_name, msg))?;

        for (type_name, comments) in self.loaded.comments.0.iter() {
            if let Some(t) = result.types_by_name.get_mut(type_name) {
                t.docs.extend(comments.type_comments.0.iter().cloned());

                if TypeDeconstructor(&t).struct_fields().is_some() {
                    for (k, field) in t.fields.iter_mut() {
                        let fields_key = format!("fields.{}", k);
                        let k = if comments.field_comments.contains_key(k) {
                            k
                        } else {
                            &fields_key
                        };

                        if let Some(field_comments) = comments.field_comments.get(k) {
                            field.docs.extend(field_comments.0.iter().cloned())
                        }
                    }
                }
            }
        }

        Ok(result)
    }

    fn resolve_includes(
        &mut self,
        local_type_dep_mapper: &mut DepMapper,
    ) -> Result<HashMap<String, Type>, String> {
        let mut result = HashMap::new();
        for include in self.loaded.includes.0.iter() {
            // Ensure no circular dependency from include.
            self.store
                .module_dep_mapper
                .add_dependency(&self.loaded.module_name, &include.from)?;

            self.store.load(&include.from)?;
            let include_module = self.store.resolved.get(&include.from).unwrap();

            for (type_name, t) in resolve_include_matching(&include.matching, include_module).iter()
            {
                let type_name = type_name.clone();
                local_type_dep_mapper.key_entry(type_name);
                if result.contains_key(type_name) {
                    return Err(format!(
                        "Included type {} from {} collides with other definition",
                        type_name, include.from
                    ));
                }
                result.insert(type_name.to_owned(), t.to_owned().to_owned());
            }
        }

        Ok(result)
    }

    fn parse_type_decs(
        &mut self,
        local_type_dep_mapper: &mut DepMapper,
    ) -> Result<HashMap<String, ParsedTypeDec<'a>>, String> {
        let mut parsed_type_decs = HashMap::new();
        for (type_name, t) in ordered_by_keys(&self.loaded.declaration.0) {
            let parsed_dec = parse_type_dec(t, &self.loaded.module_name)?;
            local_type_dep_mapper.key_entry(type_name);

            for type_dec in parsed_dec.is_a.iter() {
                if type_dec.reference.qualified_name.len() > 0
                    && type_dec.reference.module_name == self.loaded.module_name
                {
                    local_type_dep_mapper
                        .add_dependency(type_name, &type_dec.reference.type_name)?;
                }
            }

            parsed_type_decs.insert(type_name.to_owned(), parsed_dec);
        }

        Ok(parsed_type_decs)
    }

    fn resolve_reference_dependencies(
        &mut self,
        reference: &Reference,
        parent_ref: Option<Reference>,
        parsed_type_decs: &HashMap<String, ParsedTypeDec<'a>>,
    ) -> Result<Vec<Reference>, String> {
        (if reference.module_name == self.loaded.module_name {
            parsed_type_decs
                .get(&reference.type_name)
                .map(|ptd| ptd.into())
                .ok_or_else(|| format!("local type {} does not exist", reference.type_name))
        } else {
            self.store.load(&reference.module_name)?;
            self.store.lookup_reference(reference).map(|t| t.into())
        })
        .map_err(|err| {
            if let Some(parent_ref) = parent_ref {
                format!(
                    "While resolving type {} in module {}: {}",
                    parent_ref.type_name, parent_ref.module_name, err
                )
            } else {
                err
            }
        })
    }

    fn ensure_dependencies_of(
        &mut self,
        reference: Reference,
        parsed_type_decs: &HashMap<String, ParsedTypeDec<'a>>,
    ) -> Result<(), String> {
        let mut ref_queue: Vec<(Reference, Option<Reference>)> = vec![(reference, None)];

        while let Some((next_ref, parent_ref)) = ref_queue.pop() {
            let inner_refs =
                self.resolve_reference_dependencies(&next_ref, parent_ref, parsed_type_decs)?;

            for inner_ref in inner_refs {
                if inner_ref.module_name != next_ref.module_name {
                    self.store
                        .module_dep_mapper
                        .add_dependency(&next_ref.module_name, &inner_ref.module_name)?;
                }
                ref_queue.push((inner_ref, Some(next_ref.to_owned())));
            }
        }

        Ok(())
    }
}

fn resolve_include_matching<'a>(
    matching: &str,
    from_module: &'a Module,
) -> HashMap<&'a String, &'a Type> {
    let mut result = HashMap::new();

    if matching.is_empty() {
        return result;
    }

    let matching_regex = compile_matching_regex(matching);
    for (type_name, t) in from_module.types_by_name.iter() {
        if matching_regex.is_match(type_name) {
            result.insert(type_name, t);
        }
    }

    result
}

fn compile_matching_regex(matching: &str) -> Regex {
    let regex_str: String = matching
        .split('*')
        .enumerate()
        .map(|(i, lit)| {
            if lit.len() == 0 {
                return lit.to_owned();
            }
            if i > 0 {
                format!(".*{}", escape(lit))
            } else {
                escape(lit)
            }
        })
        .collect::<Vec<String>>()
        .join("");

    Regex::from_str(&regex_str).unwrap()
}
