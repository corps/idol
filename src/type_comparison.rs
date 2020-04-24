use crate::models::schema::{Field, PrimitiveType, Reference, StructKind, Type, TypeStruct};
use crate::modules_store::TypeLookup;
use crate::utils::ordered_by_keys;
use std::borrow::Borrow;
use std::cmp::Ordering;
use std::collections::HashMap;

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
        return Err(Ok(one.reference.clone()));
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

#[derive(Debug)]
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
        }
    }
}

pub fn compare_types<'a, 'b: 'a, T>(
    mut one: &'a Type,
    mut other: &'a Type,
    type_lookup: &'b T,
) -> Result<TypeComparison, String>
where
    T: TypeLookup<'b>,
{
    let mut left_parents: Vec<Reference> = vec![];
    let mut right_parents: Vec<Reference> = vec![];

    loop {
        if let Some(type_struct) = one.is_a.borrow() {
            if let Some(type_struct_two) = other.is_a.borrow() {
                let cmp = compare_type_structs(type_struct, type_struct_two);
                if let Some(result) =
                    handle_resolved_ts_comparison(&left_parents, &right_parents, &cmp)
                {
                    return Ok(result);
                }

                match cmp {
                    Err(Ok(left_ref)) => {
                        one = type_lookup.lookup_reference(&left_ref)?;
                        if type_struct.struct_kind == StructKind::Scalar {
                            left_parents.push(one.named.clone());
                        }
                    }
                    Err(Err(right_ref)) => {
                        other = type_lookup.lookup_reference(&right_ref)?;
                        if type_struct_two.struct_kind == StructKind::Scalar {
                            right_parents.push(other.named.clone());
                        }
                    }
                    _ => unreachable!(),
                }

                continue;
            }

            let cmp = compare_type_structs(
                type_struct,
                &TypeStruct {
                    reference: other.named.clone(),
                    ..TypeStruct::default()
                },
            );

            if let Some(result) = handle_resolved_ts_comparison(&left_parents, &right_parents, &cmp)
            {
                return Ok(result);
            }

            match cmp {
                Err(Ok(left_ref)) => {
                    one = type_lookup.lookup_reference(&left_ref)?;
                    if type_struct.struct_kind == StructKind::Scalar {
                        left_parents.push(one.named.clone());
                    }
                }
                _ => unreachable!(),
            }

            continue;
        } else if other.is_a.is_some() {
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

        for (field_name, field) in ordered_by_keys(&one.fields) {
            let comparison = compare_fields(field, field_name, &other.fields, type_lookup)
                .unwrap_or(Ok(TypeComparison::RightIsWider))?;
            field_results.insert(field_name.to_owned(), Box::new(comparison));
        }

        for (field_name, field) in ordered_by_keys(&other.fields) {
            let comparison = compare_fields(field, field_name, &one.fields, type_lookup)
                .unwrap_or(Ok(TypeComparison::RightIsWider))?
                .flip();
            field_results.insert(field_name.to_owned(), Box::new(comparison));
        }

        return Ok(TypeComparison::FieldsDiffer(field_results));
    }

    unreachable!()
}

fn handle_resolved_ts_comparison(
    left_parents: &Vec<Reference>,
    right_parents: &Vec<Reference>,
    cmp: &Result<Option<Ordering>, Result<Reference, Reference>>,
) -> Option<TypeComparison> {
    match cmp {
        Ok(None) => return Some(TypeComparison::Incompatible),
        Ok(Some(Ordering::Equal)) => {
            if left_parents == right_parents {
                return Some(TypeComparison::Equal);
            }

            if left_parents.ends_with(&right_parents) {
                return Some(TypeComparison::RightIsWider);
            }

            if right_parents.ends_with(&left_parents) {
                return Some(TypeComparison::LeftIsWider);
            }
        }
        Ok(Some(Ordering::Greater)) => {
            if right_parents.ends_with(&left_parents) {
                return Some(TypeComparison::LeftIsWider);
            }

            return Some(TypeComparison::Incompatible);
        }
        Ok(Some(Ordering::Less)) => {
            if left_parents.ends_with(&right_parents) {
                return Some(TypeComparison::RightIsWider);
            }

            return Some(TypeComparison::Incompatible);
        }
        _ => {}
    }

    None
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

        Ok(
            match compare_types(&wrapper, &other_wrapper, type_lookup)? {
                TypeComparison::Equal => {
                    if field.optional {
                        if other_field.optional {
                            TypeComparison::Equal
                        } else {
                            TypeComparison::LeftIsWider
                        }
                    } else if other_field.optional {
                        TypeComparison::RightIsWider
                    } else {
                        TypeComparison::Equal
                    }
                }
                TypeComparison::LeftIsWider => {
                    if field.optional {
                        TypeComparison::LeftIsWider
                    } else if other_field.optional {
                        TypeComparison::Incompatible
                    } else {
                        TypeComparison::LeftIsWider
                    }
                }
                TypeComparison::RightIsWider => {
                    if other_field.optional {
                        TypeComparison::RightIsWider
                    } else if field.optional {
                        TypeComparison::Incompatible
                    } else {
                        TypeComparison::RightIsWider
                    }
                }
                c => c,
            },
        )
    })
}
