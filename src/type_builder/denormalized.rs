use crate::err::{FieldDecError, ModuleError, TypeDecError};
use crate::models::declarations::*;
use crate::schema::*;
use crate::type_builder::denormalized::AnonymousType::Primitive;
use crate::type_builder::denormalized::DenormalizedType::{Annotated, Anonymous};
use regex::Regex;
use std::cmp::Ordering;
use std::collections::{BTreeSet, HashMap, HashSet};
use std::iter::FromIterator;
use std::ops::Deref;

// A denormalized form of Type that contains resolved dependency information and is designed
// for handling idol's type system.
pub enum ComposeResult {
    TakeLeft,
    TakeRight,
    TakeEither,
    WidenTo(AnonymousType),
    ComposeFields(HashMap<String, Box<ComposeResult>>),
}

#[derive(Clone)]
pub enum AnonymousType {
    Literal(Literal, PrimitiveType),
    Primitive(PrimitiveType),

    // An alias to a potentially referenced annotated type.
    // the outer annotated may refer to annotations on the reference's field
    // the inner ones may refer to the type being forwarded.
    Reference(Reference, Box<DenormalizedType>),

    Fields(HashMap<String, Box<DenormalizedType>>),
    Enum(Vec<String>),

    Repeated(Box<AnonymousType>),
    Map(Box<AnonymousType>),
}

#[derive(Clone)]
pub enum DenormalizedType {
    Annotated(AnonymousType, Vec<String>, bool),
    Anonymous(AnonymousType),
}

impl DenormalizedType {
    pub fn has_specialization(tags: &Vec<String>) -> bool {
        tags.iter().any(|i| !i.contains(":"))
    }

    pub fn from_type_struct(
        is_a: &TypeStruct,
        tags: &Vec<String>,
        types: &HashMap<Reference, Type>,
    ) -> Result<DenormalizedType, Reference> {
        let scalar_kind: AnonymousType = if !is_a.is_reference() {
            if is_a.literal.is_some() {
                AnonymousType::Literal(
                    is_a.literal.to_owned().unwrap(),
                    is_a.primitive_type.to_owned(),
                )
            } else {
                AnonymousType::Primitive(is_a.primitive_type.to_owned())
            }
        } else {
            let inner_kind = types
                .get(&is_a.reference)
                .map(|t| DenormalizedType::from_type(t, types))
                .unwrap_or(Err(is_a.reference.to_owned()))?;

            AnonymousType::Reference(is_a.reference.to_owned(), Box::new(inner_kind))
        };

        return Ok(DenormalizedType::wrap_with_annotations(
            match is_a.struct_kind {
                StructKind::Map => (AnonymousType::Map(Box::new(scalar_kind))),
                StructKind::Repeated => (AnonymousType::Repeated(Box::new(scalar_kind))),
                StructKind::Scalar => scalar_kind,
            },
            tags,
        ));
    }

    fn wrap_with_annotations(anon_type: AnonymousType, tags: &Vec<String>) -> DenormalizedType {
        DenormalizedType::Annotated(
            anon_type,
            tags.to_owned(),
            DenormalizedType::has_specialization(tags),
        )
    }

    pub fn from_type(
        t: &Type,
        types: &HashMap<Reference, Type>,
    ) -> Result<DenormalizedType, Reference> {
        Ok(if t.is_struct() {
            let mut map: HashMap<String, Box<DenormalizedType>> = HashMap::new();
            for (k, v) in t.fields.iter() {
                map.insert(
                    k.to_owned(),
                    Box::new(DenormalizedType::from_field(v, types)?),
                );
            }

            DenormalizedType::wrap_with_annotations(AnonymousType::Fields(map), &t.tags)
        } else if t.is_enum() {
            DenormalizedType::wrap_with_annotations(
                AnonymousType::Enum(t.options.to_owned()),
                &t.tags,
            )
        } else {
            DenormalizedType::from_type_struct(&t.is_a.to_owned().unwrap(), &t.tags, types)?
        })
    }

    pub fn from_field(
        field: &Field,
        types: &HashMap<Reference, Type>,
    ) -> Result<DenormalizedType, Reference> {
        DenormalizedType::from_type_struct(&field.type_struct, &field.tags, types)
    }

    pub fn is_specialized(&self) -> bool {
        match self {
            DenormalizedType::Anonymous(_) => false,
            _ => true,
        }
    }

    pub fn as_type_struct(&self) -> Result<(TypeStruct, Vec<String>), FieldDecError> {
        let (anon_type, tags) = match self {
            DenormalizedType::Annotated(inner, tags, _) => (inner, tags.to_owned()),
            DenormalizedType::Anonymous(inner) => (inner, Vec::new()),
        };

        let (struct_kind, anon_type) = match anon_type {
            AnonymousType::Map(inner) => (StructKind::Map, inner.deref()),
            AnonymousType::Repeated(inner) => (StructKind::Repeated, inner.deref()),
            _ => (StructKind::Scalar, anon_type),
        };

        Ok((
            match anon_type {
                AnonymousType::Reference(reference, _) => Ok(TypeStruct {
                    reference: reference.to_owned(),
                    struct_kind,
                    ..TypeStruct::default()
                }),
                AnonymousType::Primitive(pt) => Ok(TypeStruct {
                    primitive_type: pt.to_owned(),
                    struct_kind,
                    ..TypeStruct::default()
                }),
                AnonymousType::Literal(lit, pt) => Ok(TypeStruct {
                    literal: Some(lit.to_owned()),
                    primitive_type: pt.to_owned(),
                    struct_kind,
                    ..TypeStruct::default()
                }),
                _ => Err(FieldDecError::CompositionError(format!(
                    "Composition would result in a new complex type, but a field is expected."
                ))),
            }?,
            tags.to_owned(),
        ))
    }

    pub fn as_fields(&self) -> Result<(HashMap<String, Field>, Vec<String>), TypeDecError> {
        let (anon_type, tags) = match self {
            DenormalizedType::Annotated(inner, tags, _) => (inner, tags.to_owned()),
            DenormalizedType::Anonymous(inner) => (inner, Vec::new()),
        };

        match anon_type {
            AnonymousType::Fields(constructed_fields) => {
                let mut result: HashMap<String, Field> = HashMap::new();
                for (k, field_type) in constructed_fields.iter() {
                    let (type_struct, tags) = field_type
                        .as_type_struct()
                        .map_err(|te| TypeDecError::FieldError(k.to_owned(), te))?;
                    result.insert(
                        k.to_owned(),
                        Field {
                            field_name: k.to_owned(),
                            type_struct,
                            tags,
                        },
                    );
                }
                return Ok((result, tags.to_owned()));
            }
            _ => {
                return Err(TypeDecError::MixedDec(format!(
                    "Expected a struct with fields, but composition produced different type"
                )))
            }
        }
    }

    pub fn as_enum(&self) -> Result<(Vec<String>, Vec<String>), TypeDecError> {
        let (anon_type, tags) = match self {
            DenormalizedType::Annotated(inner, tags, _) => (inner, tags.to_owned()),
            DenormalizedType::Anonymous(inner) => (inner, Vec::new()),
        };

        match anon_type {
            AnonymousType::Enum(options) => {
                return Ok((options.to_owned(), tags.to_owned()));
            }
            _ => {
                return Err(TypeDecError::MixedDec(format!(
                    "Expected an enum, but composition produced different type"
                )))
            }
        }
    }
}
