use crate::deconstructors::TypeDeconstructor;
use crate::models::declarations::Variance;
use crate::models::schema::{Module, Reference, Type, TypeStruct};
use crate::modules_store::{ModulesStore, TypeLookup};
use crate::type_comparison::{compare_types, TypeComparison};
use crate::type_dec_parser::ParsedTypeDec;
use regex::Regex;
use std::borrow::Borrow;
use std::collections::HashMap;

pub struct TypeResolver<'a> {
    store: &'a ModulesStore,
    module_name: &'a String,
    parsed_type_decs: &'a HashMap<String, ParsedTypeDec<'a>>,
    resolved: HashMap<String, Type>,
}

impl<'a> TypeResolver<'a> {
    pub fn resolve_types(
        store: &'a ModulesStore,
        module_name: &'a String,
        parsed_type_decs: &'a HashMap<String, ParsedTypeDec<'a>>,
        types_ordering: &'a Vec<String>,
    ) -> Result<HashMap<String, Type>, String> {
        let mut resolver: TypeResolver<'a> = TypeResolver {
            store,
            module_name,
            parsed_type_decs,
            resolved: HashMap::new(),
        };

        for type_name in types_ordering.iter() {
            if !is_valid_type_name(type_name) {
                return Err(format!(
                    "Invalid type name {} in module {}",
                    type_name, module_name
                ));
            }

            resolver.resolved.insert(
                type_name.to_owned(),
                resolver.resolve_type(
                    type_name.to_owned(),
                    parsed_type_decs.get(type_name).unwrap(),
                )?,
            );
        }

        Ok(resolver.resolved)
    }

    fn resolve_type(
        &self,
        type_name: String,
        parsed_type_dec: &ParsedTypeDec,
    ) -> Result<Type, String> {
        let mut result = Type::default();

        result.named = Reference::from((self.module_name.to_owned(), type_name));

        Ok(result)
    }

    fn resolve_tail_type(
        &mut self,
        type_name: &str,
        parsed_type_dec: &ParsedTypeDec,
    ) -> Result<Option<Type>, String> {
        let is_a: &Vec<TypeStruct> = parsed_type_dec.is_a.borrow();
        if is_a.len() == 0 {
            return Ok(None);
        }

        let mut result = self.copy_material_type(&is_a[0])?;

        for (i, next_type_struct) in is_a.iter().enumerate().skip(1) {
            let mut next_type = self.copy_material_type(next_type_struct)?;
        }

        Ok(Some(Type::default()))
    }

    fn copy_material_type(&mut self, type_struct: &TypeStruct) -> Result<Type, String> {
        let wrapped_type = Type {
            is_a: Some(type_struct.clone()),
            ..Type::default()
        };

        self.material_type(TypeDeconstructor(&wrapped_type))
            .map(|t| t.clone())
    }
}

impl<'a: 'b, 'b> TypeLookup<'b> for TypeResolver<'a> {
    fn lookup_reference(&'b self, reference: &Reference) -> Result<&'b Type, String> {
        if &reference.module_name == self.module_name {
            return self.resolved.get(&reference.type_name).ok_or_else(|| {
                format!(
                    "Type {} does not exist in module {}",
                    reference.type_name, reference.module_name
                )
            });
        }

        self.store.lookup_reference(reference)
    }
}

pub fn is_valid_type_name(type_name: &str) -> bool {
    lazy_static! {
        static ref TYPE_NAME_REGEX: Regex = Regex::new(r"^[A-Z]+[a-zA-Z_]*[0123456789]*$").unwrap();
    }

    TYPE_NAME_REGEX.is_match(type_name)
}

pub fn is_valid_field_name(field_name: &str) -> bool {
    lazy_static! {
        static ref FIELD_NAME_REGEX: Regex = Regex::new(r"^[a-zA-Z_]+[0123456789]*$").unwrap();
    }

    FIELD_NAME_REGEX.is_match(field_name)
}
