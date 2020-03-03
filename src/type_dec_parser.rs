use crate::deconstructors::TypeStructDeconstructor;
use crate::dep_mapper::DepMapper;
use crate::models::declarations::TypeDec;
use crate::models::schema::{Literal, PrimitiveType, Reference, StructKind, Type, TypeStruct};
use crate::modules_store::ModulesStore;
use regex::Regex;
use std::collections::HashMap;

pub struct ParsedTypeDec<'a> {
    pub type_dec: &'a TypeDec,
    pub is_a: Vec<TypeStruct>,
    pub fields: HashMap<String, TypeStruct>,
    pub field_tags: HashMap<String, Vec<String>>,
}

impl<'a> Into<Vec<Reference>> for &ParsedTypeDec<'a> {
    fn into(self) -> Vec<Reference> {
        self.is_a
            .iter()
            .filter_map(|ts| {
                TypeStructDeconstructor(ts)
                    .contained()
                    .and_then(|s_dec| s_dec.reference())
            })
            .chain(self.fields.values().filter_map(|ts| {
                TypeStructDeconstructor(ts)
                    .contained()
                    .and_then(|s_dec| s_dec.reference())
            }))
            .cloned()
            .collect()
    }
}

pub fn parse_type_dec<'a>(
    type_dec: &'a TypeDec,
    module_name: &str,
) -> Result<ParsedTypeDec<'a>, String> {
    lazy_static! {
        static ref FIELD_NAME_REGEX: Regex = Regex::new(r"^[a-zA-Z_]+[0123456789]*$").unwrap();
    }

    let mut result = ParsedTypeDec {
        type_dec,
        is_a: Vec::new(),
        fields: HashMap::new(),
        field_tags: HashMap::new(),
    };

    let dep_mapper = DepMapper::new();

    for is_a_dec in type_dec.is_a.iter() {
        result.is_a.push(
            parse_field_dec(module_name, is_a_dec.as_str())
                .map_err(|e| format!("is_a declaration {}: {}", is_a_dec, e))?,
        );
    }

    for fields in type_dec.fields.iter() {
        for (field_name, field_dec) in fields.iter() {
            if !FIELD_NAME_REGEX.is_match(field_name) {
                return Err(format!("field {} is not a valid field name.", field_name));
            }

            let mut field_dec_and_tags = field_dec.0.iter();
            let field_dec = field_dec_and_tags
                .next()
                .ok_or_else(|| format!("field {} is empty!", field_name))?;

            result.fields.insert(
                field_name.to_owned(),
                parse_field_dec(module_name, field_dec.as_str()).and_then(|ts| {
                    if ts.literal.is_some() {
                        Err(format!("field {} does not support literals", field_name))
                    } else {
                        Ok(ts)
                    }
                })?,
            );

            result
                .field_tags
                .insert(field_name.to_owned(), field_dec_and_tags.cloned().collect());
        }
    }

    Ok(result)
}

pub(crate) fn parse_field_dec(module_name: &str, field_dec: &str) -> Result<TypeStruct, String> {
    let (mut type_struct, unused) = parse_type_annotation(field_dec)?;

    if let Some(field_val) = unused {
        if let Some(reference) = parse_reference(module_name, field_val) {
            type_struct.reference = reference;
        } else {
            type_struct.primitive_type = parse_primitive_type(field_val)?;
        }
    }

    Ok(type_struct)
}

fn parse_reference(module_name: &str, field_dec: &str) -> Option<Reference> {
    lazy_static! {
        static ref REFERENCE_REGEX: Regex = Regex::new(r"^([a-z_.]*)([A-Z][a-zA-Z_]+)+$").unwrap();
    }

    REFERENCE_REGEX.captures(field_dec).map(|c| {
        let mut result = Reference::default();
        let mn = c.get(1).unwrap().as_str();

        if mn.len() > 0 {
            result.module_name = mn.to_owned();
        } else {
            result.module_name = module_name.to_owned();
        }
        result.type_name = c.get(2).unwrap().as_str().to_owned();
        result.qualified_name = format!("{}.{}", result.module_name, result.type_name);
        result
    })
}

fn parse_type_annotation(field_dec: &str) -> Result<(TypeStruct, Option<&str>), String> {
    lazy_static! {
        static ref TYPE_ANNOTATION_REGEX: Regex =
            Regex::new(r"^literal:(.*):(.*)$|(.+)\{\}$|(.+)\[\]$").unwrap();
    }

    TYPE_ANNOTATION_REGEX
        .captures(field_dec)
        .and_then(|c| {
            c.get(1)
                .map(|t| {
                    parse_literal_annotation(t.as_str(), c.get(2).unwrap().as_str())
                        .map(|s| (s, None))
                })
                .or_else(|| {
                    c.get(3).map(|t| {
                        Ok((
                            TypeStruct {
                                struct_kind: StructKind::Map,
                                ..TypeStruct::default()
                            },
                            Some(t.as_str()),
                        ))
                    })
                })
                .or_else(|| {
                    c.get(4).map(|t| {
                        Ok((
                            TypeStruct {
                                struct_kind: StructKind::Repeated,
                                ..TypeStruct::default()
                            },
                            Some(t.as_str()),
                        ))
                    })
                })
        })
        .or_else(|| Some(Ok((TypeStruct::default(), Some(field_dec)))))
        .unwrap()
}

fn parse_literal_annotation<'x>(lit_type: &'x str, val: &'x str) -> Result<TypeStruct, String> {
    let mut result = TypeStruct::default();
    result.struct_kind = StructKind::Scalar;
    result.primitive_type = parse_primitive_type(lit_type)?;

    let mut literal = Literal::default();

    match result.primitive_type {
        PrimitiveType::int => {
            literal.int = serde_json::from_str(val)
                .map_err(|e| format!("error parsing literal int: {}", e))?
        }
        PrimitiveType::string => literal.string = val.to_owned(),
        PrimitiveType::double => {
            literal.double = serde_json::from_str(val)
                .map_err(|e| format!("error parsing literal double: {}", e))?
        }
        PrimitiveType::bool => {
            literal.bool = serde_json::from_str(val)
                .map_err(|e| format!("error parsing literal bool: {}", e))?
        }
        PrimitiveType::any => return Err("Literal values cannot be annotated as 'any'".to_string()),
    }

    result.literal = Some(literal);
    Ok(result)
}

fn parse_primitive_type(prim_kind: &str) -> Result<PrimitiveType, String> {
    serde_json::from_value(serde_json::Value::String(prim_kind.to_owned()))
        .map_err(|e| format!("when parsing primitive {}", e))
}
