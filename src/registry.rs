use crate::dep_mapper::DepMapper;
use crate::err::{FieldDecError, ModuleError, ProcessingError, TypeDecError};
use crate::models::declarations::*;
use crate::schema::*;
use crate::type_builder::TypeBuilder;
use regex::Regex;
use std::collections::HashSet;
use std::collections::{BTreeSet, HashMap};

pub struct SchemaRegistry {
    pub modules: HashMap<String, Module>,

    pub types: HashMap<Reference, Type>,

    pub missing_module_lookups: HashSet<String>,
    // Added after attempting to build a type
    // BTreeSet here is used for the consistent ordering property.
    pub missing_type_lookups: HashMap<Reference, BTreeSet<Reference>>,
    pub incomplete_types: HashMap<Reference, TypeDec>,

    // These are updated on every pass of a module, and not just when a type is fully resolved.
    pub type_dep_mapper: DepMapper,
    pub module_dep_mapper: DepMapper,
}

// in order of their local dependency (so no dependencies in self module)

impl SchemaRegistry {
    pub fn new() -> SchemaRegistry {
        return SchemaRegistry {
            modules: HashMap::new(),
            types: HashMap::new(),
            missing_type_lookups: HashMap::new(),
            missing_module_lookups: HashSet::new(),

            incomplete_types: HashMap::new(),

            type_dep_mapper: DepMapper::new(),
            module_dep_mapper: DepMapper::new(),
        };
    }

    pub fn as_type_decs(&self) -> Vec<(String, HashMap<String, TypeDec>)> {
        self.modules
            .iter()
            .map(|(module_name, module)| {
                let mut types: HashMap<String, TypeDec> = HashMap::new();
                for t in module.types_by_name.values() {
                    types.insert(t.named.type_name.to_owned(), t.as_typedec());
                }
                return (module_name.to_owned(), types);
            })
            .collect()
    }

    pub fn process_module(
        &mut self,
        module_name: String,
        module_dec: &ModuleDec,
    ) -> Result<(), ProcessingError> {
        if self.modules.contains_key(&module_name) {
            return Err(ProcessingError::DuplicateImportError(
                module_name.to_owned(),
            ));
        }

        let mut module = Module::default();
        module.module_name = module_name.to_owned();
        module
            .order_local_dependencies(module_dec)
            .map_err(|m| ProcessingError::CircularTypeError(m))?;

        // TODO: OMG DRY this up.
        for (from_dep, to_dep) in module.get_all_declaration_dependencies(module_dec) {
            if from_dep.module_name != to_dep.module_name {
                self.module_dep_mapper
                    .add_dependency(
                        from_dep.module_name.to_owned(),
                        to_dep.module_name.to_owned(),
                    )
                    .map_err(|msg| ProcessingError::CircularImportError(msg))?;
            }

            self.type_dep_mapper
                .add_dependency(
                    from_dep.qualified_name.to_owned(),
                    to_dep.qualified_name.to_owned(),
                )
                .map_err(|msg| ProcessingError::CircularTypeError(msg))?;
        }

        let queue = self.prepare_resolution_queue(module, module_dec);
        self.run_resolution_queue(queue)?;
        Ok(())
    }

    fn prepare_resolution_queue(
        &mut self,
        module: Module,
        module_dec: &ModuleDec,
    ) -> Vec<Reference> {
        let queue: Vec<Reference> = module
            .types_dependency_ordering
            .iter()
            .map(|type_name| {
                let named = Reference::from((&module.module_name, type_name));
                self.incomplete_types.insert(
                    named.to_owned(),
                    module_dec.0.get(type_name).unwrap().to_owned(),
                );
                named
            })
            .collect();

        self.missing_module_lookups.remove(&module.module_name);
        self.modules.insert(module.module_name.to_owned(), module);

        return queue;
    }

    fn run_resolution_queue(&mut self, queue: Vec<Reference>) -> Result<(), ProcessingError> {
        let mut queue = queue;
        while let Some(next) = queue.pop() {
            if self.types.contains_key(&next) {
                continue;
            }

            TypeBuilder::validate_type_name(&next.type_name)
                .map_err(|me| ProcessingError::ModuleError(next.module_name.to_owned(), me))?;
            let type_dec = self.incomplete_types.get(&next).unwrap();

            let result = {
                let type_builder = TypeBuilder::new(&next, type_dec.to_owned(), &self.types);
                type_builder.process().map_err(|te| {
                    ProcessingError::ModuleError(
                        next.module_name.to_owned(),
                        ModuleError::TypeDecError(next.type_name.to_owned(), te),
                    )
                })?
            };

            if let Ok(t) = result {
                self.modules.get_mut(&next.module_name).map(|m| {
                    m.types_by_name
                        .insert(next.type_name.to_owned(), t.to_owned())
                });
                self.types.insert(next.to_owned(), t.to_owned());
                self.incomplete_types.remove(&next);
                let dependents = self.missing_type_lookups.remove(&next);
                queue.extend(dependents.iter().flat_map(|d| d.iter().cloned()));
            } else {
                let missing_dependency = result.unwrap_err();

                if !self.modules.contains_key(&missing_dependency.module_name) {
                    self.missing_module_lookups
                        .insert(missing_dependency.module_name.to_owned());
                }

                self.missing_type_lookups
                    .entry(missing_dependency.to_owned())
                    .or_default()
                    .insert(next.to_owned());

                self.incomplete_types
                    .insert(next.to_owned(), type_dec.to_owned());
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;
    use std::iter::FromIterator;

    macro_rules! map(
        { $($key:expr => $value:expr),+ } => {
            {
                let mut m = ::std::collections::HashMap::new();
                $(
                    m.insert($key, $value);
                )+
                m
            }
        };
    );

    #[test]
    fn test_missing_imports() {
        let mut registry = SchemaRegistry::new();
        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: vec!["b.B".to_string()],
            ..TypeDec::default()
        };
        module_dec.0.insert("A".to_owned(), type_dec);

        let type_dec = TypeDec {
            is_a: vec!["c.C".to_string()],
            ..TypeDec::default()
        };
        module_dec.0.insert("AA".to_owned(), type_dec);

        let result = registry.process_module("a".to_owned(), &module_dec);
        assert_eq!(result, Ok(()));
        assert_eq!(
            registry.missing_module_lookups,
            HashSet::from_iter(vec!["b".to_owned(), "c".to_owned()])
        );

        let mut missing_type_names = registry
            .missing_type_lookups
            .keys()
            .map(|r| r.qualified_name.to_owned())
            .collect::<Vec<String>>();
        missing_type_names.sort();
        assert_eq!(missing_type_names, vec!["b.B".to_owned(), "c.C".to_owned()]);
    }

    #[test]
    fn test_duplicate_import_error() {
        let mut registry = SchemaRegistry::new();
        let module_dec = ModuleDec::default();
        let result = registry.process_module("My_module".to_owned(), &module_dec);
        assert!(result.is_ok());

        let result = registry.process_module("My_module".to_owned(), &module_dec);
        assert_eq!(
            result,
            Err(ProcessingError::DuplicateImportError(
                "My_module".to_string(),
            ))
        );
    }

    #[test]
    fn test_field_names() {
        let mut registry = SchemaRegistry::new();
        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            fields: map! { "ok_field".to_owned() => FieldDec(vec!["string".to_owned()]) },
            ..TypeDec::default()
        };
        module_dec.0.insert("My_model".to_owned(), type_dec);

        let result = registry.process_module("My_module".to_owned(), &module_dec);
        assert!(result.is_ok());

        let type_dec = TypeDec {
            fields: map! { "not.ok.field".to_owned() => FieldDec(vec!["string".to_owned()]) },
            ..TypeDec::default()
        };
        module_dec.0.insert("My_model2".to_owned(), type_dec);

        let result = registry.process_module("My_module2".to_owned(), &module_dec);

        assert_eq!(
            result,
            Err(ProcessingError::ModuleError(
                "My_module2".to_string(),
                ModuleError::TypeDecError(
                    "My_model2".to_string(),
                    TypeDecError::BadFieldNameError("not.ok.field".to_string())
                ),
            ))
        );
    }

    #[test]
    fn test_type_names() {
        let mut registry = SchemaRegistry::new();
        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: vec!["string".to_owned()],
            ..TypeDec::default()
        };
        module_dec.0.insert("My_model".to_owned(), type_dec);

        let result = registry.process_module("my_module".to_owned(), &module_dec);
        assert!(result.is_ok());

        let type_dec = TypeDec {
            is_a: vec!["string".to_owned()],
            ..TypeDec::default()
        };
        module_dec
            .0
            .insert("my_model".to_owned(), TypeDec { ..type_dec });

        let result = registry.process_module("my_module2".to_owned(), &module_dec);

        assert_eq!(
            result,
            Err(ProcessingError::ModuleError(
                "my_module2".to_string(),
                ModuleError::BadTypeNameError("my_model".to_string())
            ))
        )
    }

    #[test]
    fn test_literal_struct_restrictions() {
        let mut registry = SchemaRegistry::new();

        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            fields: map! { "a".to_string() => FieldDec(vec!["literal:string:1[]".to_owned()]) },
            ..TypeDec::default()
        };
        module_dec.0.insert("A".to_owned(), type_dec);
        let result = registry.process_module("a".to_owned(), &module_dec);

        assert_eq!(
            result,
            Err(ProcessingError::ModuleError(
                "a".to_string(),
                ModuleError::TypeDecError(
                    "A".to_string(),
                    TypeDecError::FieldError("a".to_owned(), FieldDecError::LiteralInStructError)
                )
            ))
        )
    }

    #[test]
    fn test_circular_import() {
        let mut registry = SchemaRegistry::new();

        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: vec!["a.A".to_owned()],
            ..TypeDec::default()
        };
        module_dec.0.insert("A".to_owned(), type_dec);
        registry
            .process_module("b".to_owned(), &module_dec)
            .unwrap();

        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: vec!["c.A".to_owned()],
            ..TypeDec::default()
        };
        module_dec.0.insert("A".to_owned(), type_dec);
        registry
            .process_module("a".to_owned(), &module_dec)
            .unwrap();

        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: vec!["b.A".to_owned()],
            ..TypeDec::default()
        };
        module_dec.0.insert("A".to_owned(), type_dec);

        let result = registry.process_module("c".to_owned(), &module_dec);

        assert_eq!(
            result,
            Err(ProcessingError::CircularImportError(
                "b <- c <- a <- b".to_string()
            ))
        );
    }
}
