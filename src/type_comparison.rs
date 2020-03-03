use crate::models::schema::{Field, PrimitiveType, Reference, StructKind, Type, TypeStruct};
use crate::modules_store::TypeLookup;
use crate::type_composer::{categorized_field_tags, field_tag_modifier_kind, CategorizedFieldTags};
use std::borrow::Borrow;
use std::cmp::Ordering;
use std::collections::{BTreeSet, HashMap};

/*
  Partial ordering of TypeStructures by considering only the 'any'-ness of that type structure.
    Does not consider any other attribute of the type structure.
  None implies no ordering between the two.
*/
fn compare_by_any(one: &TypeStruct, other: &TypeStruct) -> Option<Ordering> {
    if one.primitive_type == PrimitiveType::any {
        if other.primitive_type != PrimitiveType::any {
            return Some(Ordering::Greater);
        }

        return Some(Ordering::Equal);
    } else if other.primitive_type == PrimitiveType::any {
        return Some(Ordering::Less);
    }

    None
}

/*
  Partial ordering of TypeStructures by considering only the struct_kind (container).
    Does not consider any other attribute of the type structure.
  None implies no ordering between the two.
*/
fn compare_by_struct_kind(one: &TypeStruct, other: &TypeStruct) -> Option<Ordering> {
    if one.struct_kind == other.struct_kind {
        return Some(Ordering::Equal);
    }

    if one.struct_kind == StructKind::Scalar {
        return Some(Ordering::Greater);
    }

    if other.struct_kind == StructKind::Scalar {
        return Some(Ordering::Less);
    }

    None
}

/*
  Attempts partial ordering of two type structs by comparing all of its attributes.
  Ok implies a confident answer, of which Ok(None) implies a confident non ordering.
  Err implies that an inner reference of one of the type structures is require to
  determining an ordering.  An inner OK implies that the left side (one)'s inner reference
  must be resolved in order to determine ordering.  An inner Err implies the right side (two)'s
  inner reference must be resolved in order to determine ordering.
*/
fn compare_type_structs(
    one: &TypeStruct,
    other: &TypeStruct,
) -> Result<Option<Ordering>, Result<Reference, Reference>> {
    let by_struct_kind = compare_by_struct_kind(one, other);
    let by_any = compare_by_any(one, other);

    match (by_struct_kind, by_any) {
        (Some(_), Some(Ordering::Equal)) => return Ok(by_struct_kind),
        (Some(Ordering::Equal), Some(_)) => return Ok(by_any),
        (Some(Ordering::Equal), None) => (),
        (_, _) => return Ok(None),
    }

    if !one.reference.qualified_name.is_empty() {
        return Err(Err(one.reference.clone()));
    }

    if !other.reference.qualified_name.is_empty() {
        return Err(Err(other.reference.clone()));
    }

    if one.primitive_type != other.primitive_type {
        return Ok(None);
    }

    Ok(match (one.literal.as_ref(), other.literal.as_ref()) {
        (None, None) => Some(Ordering::Equal),
        (Some(a), Some(b)) => {
            if a == b {
                Some(Ordering::Equal)
            } else {
                None
            }
        }
        (Some(_), _) => Some(Ordering::Less),
        (_, Some(_)) => Some(Ordering::Greater),
    })
}

pub enum TypeComparison {
    // The left side is strictly wider, it accepts all inhabitants of the right side and then some.
    LeftIsWider,
    // The right side is strictly wider, it accepts all inhabitants of the left side and then some.
    RightIsWider,
    // The inhabitants from either side are identical.  Extensial identity.
    Equal,
    // the fields of two structs are disjoint, each unique field of either exists in the hash map
    // with the comparison result.  A field that is empty from say the left side will be LeftIsWider
    // while a field that is empty from the right side would be RightIsWider.
    FieldsDiffer(HashMap<String, Box<TypeComparison>>),
    // Two types are completely uncomparable
    Incompatible,
    // This comparison should only apply to field level comparison and is not returned from any
    // type or typestruct level comparison.
    DisjointFieldModifiers {
        uniq_left: Vec<String>,
        uniq_right: Vec<String>,
        shared: Vec<String>,
    },
}

impl TypeComparison {
    pub fn flip(&self) -> TypeComparison {
        match self {
            TypeComparison::LeftIsWider => TypeComparison::RightIsWider,
            TypeComparison::RightIsWider => TypeComparison::LeftIsWider,
            TypeComparison::FieldsDiffer(map) => TypeComparison::FieldsDiffer(
                map.iter()
                    .map(|(k, v)| (k.to_owned(), Box::new(v.flip())))
                    .collect(),
            ),
            TypeComparison::Equal => TypeComparison::Equal,
            TypeComparison::Incompatible => TypeComparison::Incompatible,
            TypeComparison::DisjointFieldModifiers {
                uniq_left,
                uniq_right,
                shared,
            } => TypeComparison::DisjointFieldModifiers {
                uniq_right: uniq_left.clone(),
                uniq_left: uniq_right.clone(),
                shared: shared.clone(),
            },
        }
    }
}

macro_rules! base_ts_compare_handlers {
    ($ident:ident) => {
        match $ident {
            Ok(None) => return Ok(TypeComparison::Incompatible),
            Ok(Some(Ordering::Equal)) => return Ok(TypeComparison::Equal),
            Ok(Some(Ordering::Greater)) => return Ok(TypeComparison::LeftIsWider),
            Ok(Some(Ordering::Less)) => return Ok(TypeComparison::RightIsWider),
            _ => (),
        }
    };
}

macro_rules! on_left_ref {
    ($cmp:ident, $match_ident:ident, $action:block) => {
        if let Err(Ok($match_ident)) = $cmp.borrow() {
            $action
        }
    };
}

macro_rules! on_right_ref {
    ($cmp:ident, $match_ident:ident, $action:block) => {
        if let Err(Err($match_ident)) = $cmp.borrow() {
            $action
        }
    };
}

pub fn compare_types<'a, 'b: 'a, T>(
    mut one: &'a Type,
    mut other: &'a Type,
    type_lookup: &'b T,
) -> Result<TypeComparison, String>
where
    T: TypeLookup<'b>,
{
    loop {
        if let Some(type_struct) = one.is_a.borrow() {
            if let Some(type_struct_two) = other.is_a.borrow() {
                let cmp = compare_type_structs(type_struct, type_struct_two);
                base_ts_compare_handlers!(cmp);
                on_left_ref!(cmp, left_ref, {
                    one = type_lookup.lookup_reference(&left_ref)?;
                });
                on_right_ref!(cmp, right_ref, {
                    other = type_lookup.lookup_reference(&right_ref)?;
                });

                continue;
            }

            let cmp = compare_type_structs(
                type_struct,
                &TypeStruct {
                    reference: other.named.clone(),
                    ..TypeStruct::default()
                },
            );
            base_ts_compare_handlers!(cmp);
            on_left_ref!(cmp, left_ref, {
                one = type_lookup.lookup_reference(&left_ref)?;
            });
            on_right_ref!(cmp, right_ref, {
                unreachable!();
            });

            continue;
        } else if let Some(type_struct_two) = other.is_a.borrow() {
            return Ok(compare_types(other, one, type_lookup)?.flip());
        }

        if one.options.len() > 0 {
            if other.options.len() > 0 && one.options == other.options {
                return Ok(TypeComparison::Equal);
            }
            return Ok(TypeComparison::Incompatible);
        } else if other.options.len() > 0 {
            return Ok(TypeComparison::Incompatible);
        }

        // Fields comparison
        let mut field_results: HashMap<String, Box<TypeComparison>> = HashMap::new();

        for (field_name, field) in one.fields.iter() {
            let comparison = compare_fields(field, field_name, &other.fields, type_lookup)
                .unwrap_or(Ok(TypeComparison::RightIsWider))?;
            field_results.insert(field_name.to_owned(), Box::new(comparison));
        }

        for (field_name, field) in other.fields.iter() {
            let comparison = compare_fields(field, field_name, &one.fields, type_lookup)
                .unwrap_or(Ok(TypeComparison::RightIsWider))?
                .flip();
            field_results.insert(field_name.to_owned(), Box::new(comparison));
        }

        return Ok(TypeComparison::FieldsDiffer(field_results));
    }

    unreachable!()
}

fn compare_fields<'a, T>(
    field: &Field,
    field_name: &String,
    other_fields: &HashMap<String, Field>,
    type_lookup: &'a T,
) -> Option<Result<TypeComparison, String>>
where
    T: TypeLookup<'a>,
{
    other_fields.get(field_name).map(|other_field| {
        let wrapper = Type {
            is_a: Some(field.type_struct.to_owned()),
            ..Type::default()
        };

        let other_wrapper = Type {
            is_a: Some(other_field.type_struct.to_owned()),
            ..Type::default()
        };

        let field_tags = categorized_field_tags(&field.tags);
        let other_tags = categorized_field_tags(&other_field.tags);

        Ok(compare_by_field_tags(
            &field_tags,
            &other_tags,
            compare_types(&wrapper, &other_wrapper, type_lookup)?,
        ))
    })
}

fn compare_by_field_tags(
    field_tags: &CategorizedFieldTags,
    other_tags: &CategorizedFieldTags,
    type_struct_comp: TypeComparison,
) -> TypeComparison {
    match type_struct_comp {
        TypeComparison::Incompatible => {
            return TypeComparison::Incompatible;
        }
        TypeComparison::FieldsDiffer(_) => {
            // Don't support field level negotiation if the underlying material types
            // would also require structural merging.
            return TypeComparison::Incompatible;
        }
        _ => {}
    }

    let left_specializers: Vec<&&str> = field_tags
        .specializers
        .difference(&other_tags.specializers)
        .collect();
    let right_specializers: Vec<&&str> = field_tags
        .specializers
        .difference(&field_tags.specializers)
        .collect();
    let shared_specializers: Vec<&&str> = field_tags
        .specializers
        .intersection(&other_tags.specializers)
        .collect();

    let left_generalizers: Vec<&&str> = field_tags
        .generalizers
        .difference(&other_tags.generalizers)
        .collect();
    let right_generalizers: Vec<&&str> = field_tags
        .generalizers
        .difference(&field_tags.generalizers)
        .collect();
    let shared_generalizers: Vec<&&str> = field_tags
        .generalizers
        .intersection(&other_tags.generalizers)
        .collect();

    match type_struct_comp {
        // [any, optional?, date!]  vs [int, date!, flat?] or [int, optional?]
        TypeComparison::LeftIsWider => {
            if right_generalizers.is_empty() && left_specializers.is_empty() {
                return type_struct_comp;
            }
        }

        TypeComparison::RightIsWider => {
            if left_generalizers.is_empty() && right_specializers.is_empty() {
                return type_struct_comp;
            }
        }
        _ => {}
    }

    TypeComparison::DisjointFieldModifiers {
        uniq_left: left_specializers
            .into_iter()
            .chain(left_generalizers)
            .cloned()
            .map(|s| s.to_string())
            .collect(),
        uniq_right: right_specializers
            .into_iter()
            .chain(right_generalizers)
            .cloned()
            .map(|s| s.to_string())
            .collect(),
        shared: shared_specializers
            .into_iter()
            .chain(shared_generalizers)
            .cloned()
            .map(|s| s.to_string())
            .collect(),
    }
}
