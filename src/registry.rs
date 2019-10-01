use crate::dep_mapper::DepMapper;
use crate::err::{FieldDecError, ModuleError, ProcessingError, TypeDecError};
use crate::models::declarations::*;
use crate::schema::*;
use crate::type_builder::TypeBuilder;
use regex::Regex;
use std::collections::HashMap;
use std::collections::HashSet;

#[derive(Debug)]
pub struct SchemaRegistry<'a> {
    pub modules: HashMap<String, Module>,
    pub types: HashMap<Reference, Type>,
    pub missing_module_lookups: HashSet<String>,
    pub missing_type_lookups: HashMap<Reference, HashSet<Reference>>,
    pub type_builders: HashMap<Reference, TypeBuilder<'a>>,
    pub type_dep_mapper: DepMapper,
}

impl SchemaRegistry {
    pub fn new() -> SchemaRegistry {
        return SchemaRegistry {
            modules: HashMap::new(),
            types: HashMap::new(),
            missing_type_lookups: HashMap::new(),
            missing_module_lookups: HashSet::new(),
            type_builders: HashMap::new(),
            type_dep_mapper: DepMapper::new(),
        };
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

        SchemaRegistry::add_types_to_module(&mut module, module_dec)
            .map_err(|e| ProcessingError::ModuleError(module_name.to_owned(), e))?;

        module.order_local_dependencies().map_err(|m| {
            ProcessingError::ModuleError(module_name.to_owned(), ModuleError::CircularDependency(m))
        })?;

        self.missing_module_lookups.remove(&module_name);
        self.modules.insert(module.module_name.to_owned(), module);

        Ok(())
    }

    pub fn resolve(&self, model_reference: &Reference) -> Option<&Type> {
        self.modules
            .get(&model_reference.module_name)
            .and_then(|module| module.types_by_name.get(&model_reference.type_name))
    }

    fn add_types_to_module(module: &mut Module, module_dec: &ModuleDec) -> Result<(), ModuleError> {
        let module_resolver = ModuleResolver(module.module_name.to_owned());
        let mut type_names: Vec<&String> = module_dec.0.keys().collect();
        type_names.sort();

        for next in type_names {
            let t = module_resolver.type_from_dec(next, &module_dec.0[next])?;
        }

        Ok(())
    }

    fn prepare_type_builder(
        &self,
        module_name: &str,
        type_name: &str,
        t: TypeDec,
    ) -> Result<TypeBuilder, ModuleError> {
        TypeBuilder::validate_type_name(type_name)?;
        let reference = Reference::from(format!("{}.{}", module_name, type_name).as_str());
        Ok(TypeBuilder::new(&reference, t, &self.types))
    }

    fn process_type_builder(
        &mut self,
        type_builder: &TypeBuilder,
        secondary_dependents: &mut HashSet<Reference>,
    ) -> Result<(), ModuleError> {
        // attempt to build this type
        let result = type_builder.process().map_err(|te| {
            ModuleError::TypeDecError(type_builder.reference.type_name.to_owned(), te)
        })?;

        if let Ok(t) = result {
            self.modules.get_mut(&reference.module_name).map(|m| {
                m.types_by_name
                    .insert(type_builder.reference.type_name.to_owned(), t.to_owned())
            });

            self.types
                .insert(type_builder.reference.to_owned(), t.to_owned());

            let dependents = self.missing_type_lookups.get(&type_builder.reference);
            if let Some(dependents) = dependents {
                secondary_dependents.extend(dependents);
            }

            self.missing_type_lookups.remove(&type_builder.reference);
            Ok(())
        } else {
            let missing_dependency = result.unwrap_err();

            if !self.modules.contains_key(&missing_dependency.module_name) {
                self.missing_module_lookups
                    .insert(missing_dependency.module_name.to_owned());
            }

            self.missing_type_lookups
                .entry(missing_dependency.to_owned())
                .or_default()
                .insert(type_builder.reference.to_owned());

            Ok(())
        }
    }
}

struct ModuleResolver(String);

impl ModuleResolver {
    fn qualify(&self, name: &str) -> String {
        if name.find(".").is_some() {
            return name.to_owned();
        }

        if name.chars().next().unwrap_or(' ').is_ascii_uppercase() {
            return format!("{}.{}", self.0, name);
        }

        return name.to_owned();
    }

    fn type_from_dec(&self, type_name: &str, type_dec: &TypeDec) -> Result<Type, ModuleError> {
        lazy_static! {
            static ref TYPE_NAME_REGEX: Regex =
                Regex::new(r"^[A-Z]+[a-zA-Z_]*[0123456789]*$").unwrap();
        }

        if !TYPE_NAME_REGEX.is_match(type_name) {
            return Err(ModuleError::BadTypeNameError(type_name.to_owned()));
        }

        let type_resolver = TypeResolver {
            module_resolver: &self,
        };

        let named = Reference::from(self.qualify(type_name).as_ref());

        Ok(Type {
            named,
            ..type_resolver
                .type_of_dec(type_dec)
                .map_err(|fe| ModuleError::TypeDecError(type_name.to_owned(), fe))?
        })
    }
}

struct TypeResolver<'a> {
    module_resolver: &'a ModuleResolver,
}

impl<'a> TypeResolver<'a> {
    fn qualify(&self, name: &str) -> String {
        return self.module_resolver.qualify(name);
    }

    fn type_of_dec(&self, type_dec: &TypeDec) -> Result<Type, TypeDecError> {
        lazy_static! {
            static ref FIELD_NAME_REGEX: Regex = Regex::new(r"^[a-zA-Z_]+[0123456789]*$").unwrap();
        }

        let mut result = Type::default();
        result.tags = type_dec.tags.to_owned();

        return Ok(result);
        //        if type_dec.is_a.len() > 0 {
        //            result.is_a = Some(
        //                self.type_struct_of_dec(&type_dec.is_a)
        //                    .map_err(|e| TypeDecError::IsAError(e))?,
        //            );
        //            return Ok(result);
        //        }
        //
        //        if type_dec.r#enum.len() > 0 {
        //            result.options = type_dec.r#enum.to_owned();
        //            return Ok(result);
        //        }
        //
        //        for field in type_dec.fields.iter() {
        //            let field_name = field.0.to_owned();
        //
        //            if !FIELD_NAME_REGEX.is_match(&field_name) {
        //                return Err(TypeDecError::BadFieldNameError(field_name.to_owned()));
        //            }
        //
        //            let field_dec = field.1;
        //            let tags = Vec::from(&field_dec.0[1..]);
        //            if field_dec.0.len() < 1 {
        //                return Err(TypeDecError::FieldError(
        //                    field_name.to_owned(),
        //                    FieldDecError::UnspecifiedType,
        //                ));
        //            }
        //
        //            let type_struct = self
        //                .type_struct_of_dec(&field_dec.0[0])
        //                .map_err(|e| TypeDecError::FieldError(field_name.to_owned(), e))?;
        //
        //            if type_struct.literal.is_some() {
        //                return Err(TypeDecError::FieldError(
        //                    field_name.to_owned(),
        //                    FieldDecError::LiteralInStructError,
        //                ));
        //            }
        //
        //            result.fields.insert(
        //                field_name.to_owned(),
        //                Field {
        //                    field_name,
        //                    tags,
        //                    type_struct,
        //                },
        //            );
        //        }
        //
        //        return Ok(result);
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
            HashSet::from_iter(vec!["b".to_owned()])
        );
        assert_eq!(
            registry
                .missing_type_lookups
                .keys()
                .map(|r| r.qualified_name.to_owned())
                .collect::<Vec<String>>(),
            vec!["b.B".to_owned()]
        );
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

        assert!(result.is_err());

        match result {
            Err(ProcessingError::CircularImportError(desc)) => assert_eq!(desc, "b <- c <- a <- b"),
            _ => assert!(false),
        }
    }
}
