use crate::dep_mapper::DepMapper;
use crate::models::loaded::LoadedModule;
use crate::models::schema::{Module, Reference, Type};
use crate::modules_store::{ModulesStore, TypeLookup};
use crate::type_dec_parser::{parse_type_dec, ParsedTypeDec};
use regex::{escape, Regex};
use std::collections::HashMap;
use std::str::FromStr;

pub struct ModuleResolver<'a> {
    store: &'a mut ModulesStore,
    loaded: &'a LoadedModule,
    module_dep_mapper: DepMapper,
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

impl<'a> ModuleResolver<'a> {
    pub fn new(store: &'a mut ModulesStore, loaded: &'a LoadedModule) -> ModuleResolver<'a> {
        ModuleResolver {
            store,
            loaded,
            module_dep_mapper: DepMapper::new(),
        }
    }

    pub fn resolve(&mut self) -> Result<Module, String> {
        let mut result = Module::default();
        result.module_name = self.loaded.module_name.to_owned();
        let mut local_type_dep_mapper = DepMapper::new();

        self.resolve_includes(&mut local_type_dep_mapper)?;
        let parsed_type_decs = self.parse_type_decs(&mut local_type_dep_mapper)?;

        for (type_name, ptd) in parsed_type_decs.iter() {
            self.ensure_dependencies_of(
                Reference::from((result.module_name.to_owned(), type_name.to_owned())),
                &parsed_type_decs,
            )?;
        }

        result.types_dependency_ordering = local_type_dep_mapper.order_dependencies();

        Ok(result)
    }

    fn resolve_includes(
        &mut self,
        local_type_dep_mapper: &mut DepMapper,
    ) -> Result<HashMap<String, Type>, String> {
        let mut result = HashMap::new();
        for include in self.loaded.includes.0.iter() {
            // Ensure no circular dependency from include.
            self.module_dep_mapper
                .add_dependency(&self.loaded.module_name, &include.from)?;

            self.store.load(&include.from)?;
            let include_module = self.store.resolved.get(&include.from).unwrap();

            for (type_name, t) in resolve_include_matching(&include.matching, include_module).iter()
            {
                local_type_dep_mapper.key_entry(type_name);
                result.insert(type_name.to_owned().to_owned(), t.to_owned().to_owned());
            }
        }

        Ok(result)
    }

    fn parse_type_decs(
        &mut self,
        local_type_dep_mapper: &mut DepMapper,
    ) -> Result<HashMap<String, ParsedTypeDec<'a>>, String> {
        let mut parsed_type_decs = HashMap::new();
        for (type_name, t) in self.loaded.declaration.0.iter() {
            let parsed_dec = parse_type_dec(t, &self.loaded.module_name)?;
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
                self.module_dep_mapper
                    .add_dependency(&next_ref.module_name, &inner_ref.module_name)?;
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
