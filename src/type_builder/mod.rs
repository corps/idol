mod composer;
mod denormalized;

use crate::err::{FieldDecError, ModuleError, TypeDecError};
use crate::models::declarations::*;
use crate::schema::*;
use crate::type_builder::denormalized::AnonymousType::Primitive;
use crate::type_builder::denormalized::ComposeResult::{
    ComposeFields, TakeEither, TakeLeft, TakeRight, WidenTo,
};
use crate::type_builder::denormalized::DenormalizedType::{Annotated, Anonymous};
use crate::type_builder::denormalized::{AnonymousType, ComposeResult, DenormalizedType};
use regex::Regex;
use std::cmp::Ordering;
use std::collections::{HashMap, HashSet};
use std::ops::Deref;

pub struct TypeBuilder<'a> {
    qualifier: ModuleQualifier,
    type_dec: TypeDec,
    pub reference: Reference,
    types_map: &'a HashMap<Reference, Type>,
}

impl<'a> TypeBuilder<'a> {
    pub fn new(
        reference: &Reference,
        type_dec: TypeDec,
        types_map: &'a HashMap<Reference, Type>,
    ) -> TypeBuilder<'a> {
        TypeBuilder {
            type_dec,
            reference: reference.to_owned(),
            qualifier: ModuleQualifier(reference.module_name.to_owned()),
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

    pub fn process(&self) -> Result<Result<Type, Reference>, TypeDecError> {
        lazy_static! {
            static ref FIELD_NAME_REGEX: Regex = Regex::new(r"^[a-zA-Z_]+[0123456789]*$").unwrap();
        }

        let mut t = Type::default();
        t.named = self.reference.to_owned();
        t.tags = self.type_dec.tags.to_owned();

        let mut has_head_type = false;

        if self.type_dec.r#enum.len() > 0 {
            t.options = self.type_dec.r#enum.to_owned();
            has_head_type = true;
        }

        if self.type_dec.fields.is_some() {
            if has_head_type {
                return Err(TypeDecError::MixedDec(format!(
                    "Type dec had both fields and options set, cannot mix enum and struct"
                )));
            }

            has_head_type = true;

            for (field_name, field_dec) in self.type_dec.fields.as_ref().unwrap().iter() {
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

                let type_struct = parse_type_struct(&self.qualifier, &field_dec.0[0])
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

                let compose_result = kind
                    .compose(&is_a_kind, &self.type_dec.variance)
                    .map_err(|e| TypeDecError::IsAError(FieldDecError::CompositionError(e)))?;

                let composed = TypeBuilder::apply_compose_result(
                    kind,
                    is_a_kind,
                    &compose_result,
                    &self.type_dec.variance,
                )?;

                if t.options.len() > 0 {
                    let (options, _) = composed.as_enum()?;
                    t.options = options;
                } else {
                    let (fields, _) = composed.as_fields()?;
                    t.fields = fields;
                }
            }
        } else {
            if is_a_kind.is_none() {
                return Err(TypeDecError::IsAError(FieldDecError::UnspecifiedType));
            }

            let is_a_kind = is_a_kind.unwrap();

            is_a_kind
                .as_enum()
                .map(|(options, tags)| {
                    t.options = options;
                })
                .or_else(|_| {
                    is_a_kind.as_fields().map(|(fields, tags)| {
                        t.fields = fields;
                    })
                })
                .or_else(|_| {
                    is_a_kind
                        .as_type_struct()
                        .map(|(ts, tags)| {
                            t.is_a = Some(ts);
                        })
                        .map_err(|fe| TypeDecError::IsAError(fe))
                })?;
        }

        if self.type_dec.trim {
            let keys_to_remove = t
                .fields
                .keys()
                .filter(|k| {
                    !self
                        .type_dec
                        .fields
                        .as_ref()
                        .unwrap()
                        .contains_key(k.to_owned())
                })
                .cloned()
                .collect::<Vec<String>>();

            for key in keys_to_remove.iter() {
                t.fields.remove(key);
            }
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

    fn apply_compose_result(
        left_kind: DenormalizedType,
        right_kind: DenormalizedType,
        compose_result: &ComposeResult,
        variance: &Variance,
    ) -> Result<DenormalizedType, TypeDecError> {
        match compose_result {
            ComposeResult::TakeEither => Ok(left_kind),
            ComposeResult::TakeLeft(_) => Ok(left_kind),
            ComposeResult::TakeRight(_) => Ok(right_kind),
            ComposeResult::WidenTo(k) => Ok(DenormalizedType::Anonymous(k.to_owned())),
            ComposeResult::ComposeFields(fields_result) => {
                TypeBuilder::apply_compose_fields(&left_kind, &right_kind, &fields_result, variance)
            }
        }
    }

    fn compose_is_a_kind(
        &self,
    ) -> Result<Result<Option<DenormalizedType>, Reference>, TypeDecError> {
        let mut cur_kind: Option<DenormalizedType> = None;

        for type_dec in self.type_dec.is_a.iter() {
            let ts = parse_type_struct(&self.qualifier, type_dec)
                .map_err(|fe| TypeDecError::IsAError(fe))?;

            let next_kind = DenormalizedType::from_type_struct(&ts, &Vec::new(), self.types_map);
            if let Err(missing_ref) = next_kind {
                return Ok(Err(missing_ref));
            }
            let next_kind = next_kind.unwrap();

            if cur_kind.is_none() {
                cur_kind = Some(next_kind);
                continue;
            }

            let left_kind = cur_kind.clone().unwrap();
            let compose_result = left_kind
                .compose(&next_kind, &self.type_dec.variance)
                .map_err(|s| TypeDecError::IsAError(FieldDecError::CompositionError(s)))?;

            cur_kind = Some(TypeBuilder::apply_compose_result(
                left_kind,
                next_kind,
                &compose_result,
                &self.type_dec.variance,
            )?);
        }

        return Ok(Ok(cur_kind));
    }

    fn apply_optionality(
        t: DenormalizedType,
        inheritted: bool,
        variance: &Variance,
    ) -> DenormalizedType {
        match (t, inheritted, variance) {
            (t, false, _) => t,
            (t, _, Variance::Invariant) => t,
            (t, _, Variance::Covariant) => t,
            (DenormalizedType::Anonymous(anon), _, _) => {
                DenormalizedType::Annotated(anon, vec!["optional".to_owned()], true)
            }
            (DenormalizedType::Annotated(anon, tags, specialized), _, _) => {
                if !tags.contains(&"optional".to_string()) {
                    let mut new_tags = tags.clone();
                    new_tags.push("optional".to_owned());
                    DenormalizedType::Annotated(anon, new_tags, true)
                } else {
                    DenormalizedType::Annotated(anon, tags, specialized)
                }
            }
        }
    }

    fn apply_compose_fields(
        left: &DenormalizedType,
        right: &DenormalizedType,
        fields_result: &HashMap<String, Box<ComposeResult>>,
        variance: &Variance,
    ) -> Result<DenormalizedType, TypeDecError> {
        let mut result_fields: HashMap<String, Box<DenormalizedType>> = HashMap::new();

        let left_fields = left.find_fields().unwrap();
        let right_fields = right.find_fields().unwrap();

        for (k, v) in fields_result.iter() {
            match v.deref() {
                TakeLeft(inheritted) => {
                    let t = left_fields.get(k).unwrap().deref().to_owned();
                    let t = TypeBuilder::apply_optionality(t, inheritted.to_owned(), variance);
                    result_fields.insert(k.to_owned(), Box::new(t));
                }
                TakeEither => {
                    result_fields.insert(k.to_owned(), left_fields.get(k).unwrap().to_owned());
                }
                TakeRight(inheritted) => {
                    let t = right_fields.get(k).unwrap().deref().to_owned();
                    let t = TypeBuilder::apply_optionality(t, inheritted.to_owned(), variance);
                    result_fields.insert(k.to_owned(), Box::new(t));
                }
                WidenTo(t) => {
                    result_fields.insert(k.to_owned(), Box::new(Anonymous(t.to_owned())));
                }
                ComposeFields(_) => {
                    return Err(TypeDecError::FieldError(k.to_owned(), FieldDecError::CompositionError(format!("field requires further struct merging, but recursive struct merging is not allowed."))));
                }
            }
        }

        Ok(Anonymous(AnonymousType::Fields(result_fields)))
    }
}
