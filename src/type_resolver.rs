use crate::deconstructors::TypeDeconstructor;
use crate::models::schema::{Field, Reference, Type, TypeStruct};
use crate::modules_store::{ModulesStore, TypeLookup};
use crate::type_composer::compose_types;
use crate::type_dec_parser::ParsedTypeDec;
use regex::Regex;
use std::borrow::Borrow;
use std::collections::HashMap;

pub struct TypeResolver<'a> {
    store: &'a ModulesStore,
    module_name: &'a String,
    resolved: HashMap<String, Type>,
}

pub fn resolve_types<'a>(
    store: &'a ModulesStore,
    module_name: &'a String,
    parsed_type_decs: &'a HashMap<String, ParsedTypeDec<'a>>,
    types_ordering: &'a Vec<String>,
) -> Result<HashMap<String, Type>, String> {
    let mut resolver: TypeResolver<'a> = TypeResolver {
        store,
        module_name,
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
            resolver
                .resolve_type(
                    type_name.to_owned(),
                    parsed_type_decs.get(type_name).unwrap(),
                )
                .map_err(|msg| format!("While resolving type {}: {}", type_name, msg))?,
        );
    }

    Ok(resolver.resolved)
}

impl<'a> TypeResolver<'a> {
    fn resolve_type(
        &self,
        type_name: String,
        parsed_type_dec: &ParsedTypeDec,
    ) -> Result<Type, String> {
        let head_struct = self.resolve_head_struct(parsed_type_dec)?;
        let tail_type = self.resolve_tail_type(parsed_type_dec)?;

        if head_struct.is_none() && tail_type.is_none() {
            return Err(format!("Missing fields, enum, or is_a definitions.",));
        }

        let mut result = if let Some(head) = head_struct {
            if let Some(tail) = tail_type {
                compose_types(
                    &head,
                    &tail,
                    self,
                    parsed_type_dec.type_dec.variance.clone(),
                )?
            } else {
                head
            }
        } else if let Some(tail) = tail_type {
            tail
        } else {
            unreachable!()
        };

        result.named = Reference::from((self.module_name.to_owned(), type_name));
        result.tags = parsed_type_dec.type_dec.tags.clone();
        // result.tags.append(parsed_type_dec.type_dec)

        Ok(result)
    }

    fn resolve_head_struct(&self, parsed_type_dec: &ParsedTypeDec) -> Result<Option<Type>, String> {
        if parsed_type_dec.type_dec.fields.is_some() {
            for bad_field in parsed_type_dec
                .fields
                .keys()
                .find(|field_name| !is_valid_field_name(field_name))
                .iter()
            {
                return Err(format!("Invalid field name {}", bad_field));
            }

            return Ok(Some(Type {
                fields: parsed_type_dec
                    .fields
                    .iter()
                    .map(|(k, type_struct)| {
                        (
                            k.to_owned(),
                            Field {
                                field_name: k.clone(),
                                tags: parsed_type_dec
                                    .field_tags
                                    .get(k)
                                    .cloned()
                                    .unwrap_or_else(|| vec![]),
                                type_struct: type_struct.clone(),
                            },
                        )
                    })
                    .collect(),
                ..Type::default()
            }));
        }

        if !parsed_type_dec.type_dec.r#enum.is_empty() {
            return Ok(Some(Type {
                options: parsed_type_dec.type_dec.r#enum.clone(),
                ..Type::default()
            }));
        }

        Ok(None)
    }

    fn resolve_tail_type(&self, parsed_type_dec: &ParsedTypeDec) -> Result<Option<Type>, String> {
        let is_a: &Vec<TypeStruct> = parsed_type_dec.is_a.borrow();
        if is_a.len() == 0 {
            return Ok(None);
        }

        if is_a.len() == 1 {
            return Ok(Some(Type {
                is_a: Some(is_a[0].clone()),
                ..Type::default()
            }));
        }

        let mut result = self.copy_material_type(&is_a[0])?;

        for next_type_struct in is_a.iter().skip(1) {
            let next_type = self.copy_material_type(next_type_struct)?;
            result = compose_types(
                &result,
                &next_type,
                self,
                parsed_type_dec.type_dec.variance.clone(),
            )?;
        }

        Ok(Some(result))
    }

    fn copy_material_type(&self, type_struct: &TypeStruct) -> Result<Type, String> {
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
