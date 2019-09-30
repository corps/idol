mod composer;
mod denormalized;

use crate::err::{FieldDecError, ModuleError, TypeDecError};
use crate::models::declarations::*;
use crate::schema::*;
use crate::type_builder::denormalized::AnonymousType::Primitive;
use crate::type_builder::denormalized::DenormalizedType::Anonymous;
use crate::type_builder::denormalized::{AnonymousType, ComposeResult, DenormalizedType};
use regex::Regex;
use std::cmp::Ordering;
use std::collections::{HashMap, HashSet};
use std::ops::Deref;

pub struct TypeBuilder<'a> {
    resolver: ModuleResolver,
    type_dec: TypeDec,
    types_map: &'a HashMap<Reference, Type>,
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

impl<'a> TypeBuilder<'a> {
    pub fn new(
        module_name: &str,
        type_dec: TypeDec,
        types_map: &'a HashMap<Reference, Type>,
    ) -> TypeBuilder<'a> {
        TypeBuilder {
            type_dec,
            resolver: ModuleResolver(module_name.to_string()),
            types_map,
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

    pub fn process(&mut self, type_name: &str) -> Result<Result<Type, Reference>, TypeDecError> {
        lazy_static! {
            static ref FIELD_NAME_REGEX: Regex = Regex::new(r"^[a-zA-Z_]+[0123456789]*$").unwrap();
        }

        let mut t = Type::default();

        //        TypeBuilder::validate_type_name(type_name)?;
        t.named = Reference::from(self.resolver.qualify(type_name).as_ref());
        t.tags = self.type_dec.tags.to_owned();

        let mut has_head_type = false;

        if self.type_dec.r#enum.len() > 0 {
            t.options = self.type_dec.r#enum.to_owned();
            has_head_type = true;
        }

        if self.type_dec.fields.len() > 0 {
            if has_head_type {
                return Err(TypeDecError::MixedDec(format!(
                    "Type dec had both fields and options set, cannot mix enum and struct"
                )));
            }

            has_head_type = true;

            for (field_name, field_dec) in self.type_dec.fields.iter() {
                if !FIELD_NAME_REGEX.is_match(field_name) {
                    return Err(TypeDecError::BadFieldNameError(field_name.to_owned()));
                }

                let tags = Vec::from(&field_dec.0[1..]);
                if field_dec.0.len() < 1 {
                    return Err(TypeDecError::FieldError(
                        field_name.to_owned(),
                        FieldDecError::UnspecifiedType,
                    ));
                }

                let type_struct = self
                    .parse_type_struct(&field_dec.0[0])
                    .map_err(|e| TypeDecError::FieldError(field_name.to_owned(), e))?;

                if type_struct.literal.is_some() {
                    return Err(TypeDecError::FieldError(
                        field_name.to_owned(),
                        FieldDecError::LiteralInStructError,
                    ));
                }

                t.fields.insert(
                    field_name.to_owned(),
                    Field {
                        field_name: field_name.to_owned(),
                        tags,
                        type_struct,
                    },
                );
            }
        }

        if !has_head_type {
            if self.type_dec.is_a.len() == 1 {
                t.is_a = Some(
                    self.parse_type_struct(self.type_dec.is_a[0].as_str())
                        .map_err(|fe| TypeDecError::IsAError(fe))?,
                );

                return Ok(Ok(t));
            }
        }

        let is_a_kind = self.compose_is_a_kind()?;
        if let Err(missing_reference) = is_a_kind {
            return Ok(Err(missing_reference.to_owned()));
        }
        let is_a_kind = is_a_kind.unwrap();

        if has_head_type {
            if let Some(is_a_kind) = is_a_kind {
                let kind = DenormalizedType::from_type(&t, self.types_map);
                if let Err(missing_reference) = kind {
                    return Ok(Err(missing_reference));
                }
                let kind = kind.unwrap();

                let composed = (
                    kind.compose(&is_a_kind, &self.type_dec.variance)
                        .map_err(|e| TypeDecError::IsAError(FieldDecError::CompositionError(e)))?,
                    &is_a_kind,
                );

                if t.options.len() > 0 {
                    match composed {
                        (ComposeResult::TakeLeft, _) => {}
                        (ComposeResult::TakeEither, _) => {}
                        (
                            ComposeResult::TakeRight,
                            DenormalizedType::Anonymous(AnonymousType::Enum(options)),
                        ) => {
                            t.options = options.to_owned();
                        }
                        (ComposeResult::WidenTo(AnonymousType::Enum(options)), _) => {
                            t.options = options.to_owned();
                        }
                        _ => {
                            return Err(TypeDecError::MixedDec(format!(
                                "Declaration was for an enum but types of is_a differ"
                            )));
                        }
                    }
                }

                if t.fields.len() > 0 {
                    //                    match composed {
                    //                        (ComposeResult::TakeLeft, _) => {}
                    //                        (ComposeResult::TakeEither, _) => {}
                    //                        (
                    //                            ComposeResult::TakeRight,
                    //                            Kind::Unspecialized(UnspecializedKind::Fields(fields)),
                    //                        ) => {
                    //                            let new_fields: HashMap<String, Field> = HashMap::new();
                    //                        }
                    //                    }
                }
            }
        } else {

        }

        Ok(Ok(t.to_owned()))
    }

    fn get_resolved_composition_type(
        &self,
        type_name: &str,
        ts: &TypeStruct,
    ) -> Result<Type, Reference> {
        if ts.is_reference() {
            return self
                .types_map
                .get(&ts.reference)
                .map(|t| Ok(t.to_owned()))
                .unwrap_or_else(|| Err(ts.reference.to_owned()));
        }

        Ok(Type {
            is_a: Some(ts.to_owned()),
            ..Type::default()
        })
    }

    fn compose_is_a_kind(
        &self,
    ) -> Result<Result<Option<DenormalizedType>, Reference>, TypeDecError> {
        let mut cur_kind: Option<DenormalizedType> = None;

        for type_dec in self.type_dec.is_a.iter() {
            let ts = self
                .parse_type_struct(type_dec)
                .map_err(|fe| TypeDecError::IsAError(fe))?;

            let next_kind = DenormalizedType::from_type_struct(&ts, self.types_map);
            if let Err(missing_ref) = next_kind {
                return Ok(Err(missing_ref));
            }
            let next_kind = next_kind.unwrap();

            match cur_kind.clone() {
                None => {
                    cur_kind = Some(next_kind);
                }
                Some(left_kind) => {
                    let compose_result = cur_kind
                        .clone()
                        .unwrap()
                        .compose(&next_kind, &self.type_dec.variance)
                        .map_err(|s| TypeDecError::IsAError(FieldDecError::CompositionError(s)))?;

                    match compose_result {
                        ComposeResult::TakeEither => {
                            continue;
                        }
                        ComposeResult::TakeLeft => {
                            continue;
                        }
                        ComposeResult::WidenTo(k) => {
                            cur_kind = Some(DenormalizedType::Anonymous(k));
                        }
                        ComposeResult::TakeRight => {
                            cur_kind = Some(next_kind);
                        }
                        ComposeResult::ComposeFields(fields_result) => {
                            cur_kind = Some(DenormalizedType::apply_compose_fields(
                                &left_kind,
                                &next_kind,
                                &fields_result,
                            )?);
                        }
                    }
                }
            }
        }

        return Ok(Ok(cur_kind));
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
                Regex::new(r"^literal:(.*):(.*)$|(.+)\{\}$|(.+)\[\]$").unwrap();
        }

        TYPE_ANNOTATION_REGEX
            .captures(field_val)
            .and_then(|c| {
                c.get(1)
                    .map(|t| {
                        TypeBuilder::parse_literal_annotation(
                            t.as_str(),
                            c.get(2).unwrap().as_str(),
                        )
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

    pub fn parse_literal_annotation<'x>(
        lit_type: &'x str,
        val: &'x str,
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

    pub fn is_model_ref<'x>(type_val: &'x str) -> bool {
        return type_val.find(".").is_some()
            || type_val.chars().next().unwrap_or(' ').is_ascii_uppercase();
    }
}
