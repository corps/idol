use crate::models::declarations::Variance;
use crate::models::schema::{Field, Reference, Type};
use crate::modules_store::TypeLookup;
use crate::type_comparison::{compare_types, TypeComparison};
use crate::type_dec_parser::ParsedTypeDec;
use serde::export::fmt::Debug;
use std::collections::btree_set::BTreeSet;
use std::collections::HashMap;
use std::ops::Deref;

#[derive(PartialOrd, PartialEq)]
pub enum FieldModifierKind {
    Specializer,
    Generalizer,
    Metadata,
}

pub struct CategorizedFieldTags<'a> {
    pub specializers: BTreeSet<&'a str>,
    pub generalizers: BTreeSet<&'a str>,
    pub metadata: Vec<&'a str>,
}

pub fn field_tag_modifier_kind(tag: &str) -> FieldModifierKind {
    if tag.contains(":") {
        return FieldModifierKind::Metadata;
    }

    if tag.ends_with("!") {
        return FieldModifierKind::Specializer;
    }

    if tag.ends_with("?") {
        return FieldModifierKind::Generalizer;
    }

    return FieldModifierKind::Metadata;
}

pub fn categorized_field_tags(tags: &Vec<String>) -> CategorizedFieldTags {
    let mut result = CategorizedFieldTags {
        specializers: BTreeSet::new(),
        generalizers: BTreeSet::new(),
        metadata: vec![],
    };

    for tag in tags.iter() {
        match field_tag_modifier_kind(tag) {
            FieldModifierKind::Specializer => {
                result.specializers.insert(tag);
            }
            FieldModifierKind::Generalizer => {
                result.generalizers.insert(tag);
            }
            FieldModifierKind::Metadata => {
                result.metadata.push(tag);
            }
        }
    }

    result
}

/*
    None => comparison incomplete,
    Some(Err) => Incompatible
    Some(Ok((A, true)) => took A, but they are equal
    Some(Ok((A, false)) => took A, but they were not equal.
*/
fn take_by_comparison<A>(
    left: &A,
    right: &A,
    cmp: &TypeComparison,
    variance: &Variance,
) -> Option<Result<(A, bool), ()>>
where
    A: Clone,
{
    match (cmp, variance) {
        (TypeComparison::Incompatible, _) => Some(Err(())),

        (TypeComparison::Equal, _) => Some(Ok((left.clone(), true))),
        (TypeComparison::LeftIsWider, Variance::Covariant) => Some(Ok((right.clone(), false))),
        (TypeComparison::RightIsWider, Variance::Contravariant) => Some(Ok((right.clone(), false))),
        (TypeComparison::LeftIsWider, Variance::Contravariant) => Some(Ok((left.clone(), false))),
        (TypeComparison::RightIsWider, Variance::Covariant) => Some(Ok((left.clone(), false))),
        _ => None,
    }
}

pub fn compose_types<'a, 'b: 'a, 'c, T>(
    left: &'c Type,
    right: &'c Type,
    type_lookup: &'b T,
    variance: Variance,
) -> Result<Type, String>
where
    T: TypeLookup<'a>,
{
    let cmp = compare_types(left, right, type_lookup)?;

    if let Some(taken_type) = take_by_comparison(left, right, &cmp, &variance) {
        return Ok(taken_type
            .map_err(|_| {
                format!(
                    "{} is incompatible for composition with {}",
                    left.named.qualified_name, right.named.qualified_name
                )
            })?
            .0);
    }

    match (cmp, &variance) {
        (TypeComparison::FieldsDiffer(differing_fields), variance) => {
            let mut fields: HashMap<String, Field> = HashMap::new();
            let mut last_left_field: Option<String> = None;
            let mut last_right_field: Option<String> = None;

            for (k, field_comp) in differing_fields.iter() {
                if let Some(taken_side) = take_by_comparison(&true, &false, field_comp, &variance) {
                    let (take_left, was_equal) = taken_side.map_err(|_| {
                        format!(
                            "the {} fields of {} and {} are incompatible for composition",
                            k, &left.named.qualified_name, &right.named.qualified_name
                        )
                    })?;

                    if take_left {
                        if was_equal || last_right_field.is_none() {
                            fields.insert(k.to_owned(), left.fields.get(k).unwrap().clone());
                            if !was_equal {
                                last_left_field = Some(k.clone());
                            }
                        } else {
                            return Err(format!(
                                "{} is incompatible for composition with {}",
                                &left.named.qualified_name, &right.named.qualified_name
                            ));
                        }
                    } else {
                        if was_equal || !last_left_field.is_none() {
                            fields.insert(k.to_owned(), right.fields.get(k).unwrap().clone());
                            if !was_equal {
                                last_right_field = Some(k.clone());
                            }
                        } else {
                            return Err(format!(
                                "{} is incompatible for composition with {}",
                                &left.named.qualified_name, &right.named.qualified_name
                            ));
                        }
                    }
                } else if let TypeComparison::DisjointFieldModifiers {
                    uniq_left,
                    uniq_right,
                    shared,
                } = field_comp.deref()
                {
                    match variance {
                        Variance::Contravariant => {
                            fields.insert(
                                k.to_owned(),
                                Field {
                                    field_name: k.to_owned(),
                                    type_struct: left.fields.get(k).unwrap().type_struct.clone(),
                                    tags: shared
                                        .iter()
                                        .chain(uniq_left.iter().filter(|t| {
                                            field_tag_modifier_kind(t)
                                                == FieldModifierKind::Generalizer
                                        }))
                                        .chain(uniq_right.iter().filter(|t| {
                                            field_tag_modifier_kind(t)
                                                == FieldModifierKind::Generalizer
                                        }))
                                        .cloned()
                                        .collect(),
                                    ..Field::default()
                                },
                            );
                        }
                        _ => {
                            return Err(format!(
                                "the {} fields of {} and {} are incompatible for covariant composition",
                                k, &left.named.qualified_name, &right.named.qualified_name
                            ));
                        }
                    }
                } else {
                    unreachable!();
                }
            }

            for (k, v) in left.fields.iter() {
                fields.insert(k.to_owned(), v.clone());
            }

            for (k, v) in right.fields.iter() {
                fields.insert(k.to_owned(), v.clone());
            }

            Ok(Type {
                fields,
                // Synthesized name to make error messages more useful.
                named: Reference::from((
                    "".to_string(),
                    format!(
                        "{}+{}",
                        &left.named.qualified_name, &right.named.qualified_name
                    ),
                )),
                ..Type::default()
            })
        }
        _ => unreachable!(),
    }
}
