use crate::dep_mapper::DepMapper;
use crate::models::declarations::*;
use crate::schema::*;
use regex::Regex;
use std::collections::HashMap;
use std::collections::HashSet;
use std::error::Error;
use std::fmt::Display;
use crate::err::{ModuleError, TypeDecError, FieldDecError, ProcessingError};

pub struct TypeBuilder {
    t: Type,
    resolver: ModuleResolver,
    type_dec: TypeDec,
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
}

impl TypeBuilder {
    pub fn new(module_name: &str, type_dec: TypeDec) -> TypeBuilder {
        TypeBuilder {
            type_dec,
            t: Type::default(),
            resolver: ModuleResolver(module_name.to_string()),
        }
    }

    pub fn validate_type_name(type_name: &str) -> Result<(), ModuleError> {
        lazy_static! {
            static ref TYPE_NAME_REGEX: Regex =
                Regex::new(r"^[A-Z]+[a-zA-Z_]*[0123456789]*$").unwrap();
        }

        if !TYPE_NAME_REGEX.is_match(type_name) {
            return Err(ModuleError::BadTypeNameError(type_name.to_string()));
        }

        Ok(())
    }

    pub fn process(&mut self, type_name: &str) -> Result<Result<Type, Vec<Reference>>, ModuleError> {
        self.set_name(type_name)?;
        let is_a_structs = self.handle_is_a().map_err(|err| ModuleError::TypeDecError(type_name.to_string(), err))?;

        Ok(Ok(self.t.to_owned()))
    }

    fn set_name(&mut self, type_name: &str) -> Result<(), ModuleError> {
        TypeBuilder::validate_type_name(type_name)?;
        let named = Reference::from(self.resolver.qualify(type_name).as_ref());
        self.t.named = named;

        Ok(())
    }

    fn handle_is_a(&mut self) -> Result<Vec<TypeStruct>, TypeDecError> {
        let mut result = vec!();
        for type_dec in self.type_dec.is_a.iter() {
            result.push(self.parse_type_struct(type_dec.as_str()).map_err(|err| TypeDecError::IsAError(err))?.to_owned());
        }

        return Ok(result);
    }

    pub fn parse_type_struct(&self, field_val: &str) -> Result<TypeStruct, FieldDecError> {
        let (mut type_struct, unused) = self.parse_type_annotation(field_val)?;

        if let Some(field_val) = unused {
            if TypeBuilder::is_model_ref(field_val) {
                type_struct.reference = Reference::from(self.resolver.qualify(field_val).as_ref());
            } else {
                type_struct.primitive_type = TypeBuilder::parse_primitive_type(field_val)?;
            }
        }

        return Ok(type_struct);
    }

    fn parse_type_annotation<'b>(
        &self,
        field_val: &'b str,
    ) -> Result<(TypeStruct, Option<&'b str>), FieldDecError> {
        lazy_static! {
            static ref TYPE_ANNOTATION_REGEX: Regex =
                Regex::new(r"^literal:(.*):(.*)$|(.+)\{\}$|(.+)\[\]$")
                    .unwrap();
        }

        TYPE_ANNOTATION_REGEX
            .captures(field_val)
            .and_then(|c| {
                c.get(1)
                    .map(|t| {
                        TypeBuilder::parse_literal_annotation(t.as_str(), c.get(2).unwrap().as_str())
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
            .or_else(|| Some(Ok((TypeStruct::default(), Some(field_val)))))
            .unwrap()
    }

    pub fn parse_literal_annotation<'a>(
        lit_type: &'a str,
        val: &'a str,
    ) -> Result<TypeStruct, FieldDecError> {
        let mut result = TypeStruct::default();
        result.struct_kind = StructKind::Scalar;
        result.primitive_type = TypeBuilder::parse_primitive_type(lit_type)?;

        let mut literal = Literal::default();

        match result.primitive_type {
            PrimitiveType::int => literal.int = serde_json::from_str(val)?,
            PrimitiveType::string => literal.string = val.to_owned(),
            PrimitiveType::double => literal.double = serde_json::from_str(val)?,
            PrimitiveType::bool => literal.bool = serde_json::from_str(val)?,
            PrimitiveType::any => return Err(FieldDecError::LiteralAnyError),
        }

        result.literal = Some(literal);
        return Ok(result);
    }

    pub fn parse_primitive_type(prim_kind: &str) -> Result<PrimitiveType, FieldDecError> {
        serde_json::from_value(serde_json::Value::String(prim_kind.to_owned()))
            .map_err(|e| FieldDecError::UnknownPrimitiveType(e.to_string()))
    }

    pub fn is_model_ref<'a>(type_val: &'a str) -> bool {
        return type_val.find(".").is_some()
            || type_val.chars().next().unwrap_or(' ').is_ascii_uppercase();
    }
}
