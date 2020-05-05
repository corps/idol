use crate::models::declarations::Variance;
use crate::models::schema::{Field, Reference, Type};
use crate::modules_store::TypeLookup;
use crate::type_comparison::{compare_types, TypeComparison};
use crate::utils::ordered_by_keys;
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

    return match (cmp, variance) {
        (TypeComparison::Incompatible, _) => Err(format!(
            "{} is incompatible for composition with {}",
            left.named.qualified_name, right.named.qualified_name
        )),

        (TypeComparison::Equal, _) => Ok(left.clone()),
        (TypeComparison::LeftIsWider, Variance::Covariant) => Ok(right.clone()),
        (TypeComparison::RightIsWider, Variance::Contravariant) => Ok(right.clone()),
        (TypeComparison::LeftIsWider, Variance::Contravariant) => Ok(left.clone()),
        (TypeComparison::RightIsWider, Variance::Covariant) => Ok(left.clone()),
        (TypeComparison::FieldsDiffer(differing_fields), variance) => {
            compose_fields(left, right, variance.clone(), differing_fields)
        }
    };
}

fn compose_fields(
    left: &Type,
    right: &Type,
    variance: Variance,
    differing_fields: HashMap<String, Box<TypeComparison>>,
) -> Result<Type, String> {
    let mut fields: HashMap<String, Field> = HashMap::new();

    for (k, v) in left.fields.iter() {
        fields.insert(k.to_owned(), v.clone());
    }

    for (k, v) in right.fields.iter() {
        fields.insert(k.to_owned(), v.clone());
    }

    for (k, field_comp) in ordered_by_keys(&differing_fields) {
        compose_field(
            &mut fields,
            k,
            field_comp.deref(),
            left.fields.get(k),
            right.fields.get(k),
            &variance,
        )
        .map_err(|msg| {
            format!(
                "error composing {} and {}: {}",
                left.named.qualified_name, right.named.qualified_name, msg
            )
        })?;
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

fn compose_field(
    fields: &mut HashMap<String, Field>,
    k: &String,
    field_comp: &TypeComparison,
    left_field: Option<&Field>,
    right_field: Option<&Field>,
    variance: &Variance,
) -> Result<(), String> {
    match (field_comp, left_field, right_field, variance) {
        (TypeComparison::Incompatible, _, _, _) => {
            return Err(format!(
                "field {} is incompatible between left and right",
                k
            ));
        }
        (TypeComparison::Equal, Some(left), _, _) => {
            fields.insert(k.to_owned(), left.clone());
        }
        (TypeComparison::LeftIsWider, Some(left), _, Variance::Contravariant) => {
            fields.insert(k.to_owned(), left.clone());
        }
        (TypeComparison::LeftIsWider, _, Some(right), Variance::Contravariant) => {
            fields.insert(k.to_owned(), with_optional(right.clone()));
        }
        (TypeComparison::RightIsWider, _, _, Variance::Contravariant) => {
            return compose_field(
                fields,
                k,
                &TypeComparison::LeftIsWider,
                right_field,
                left_field,
                variance,
            );
        }
        (TypeComparison::RightIsWider, Some(left), None, Variance::Covariant) => {
            fields.insert(k.to_owned(), left.clone());
        }
        (TypeComparison::RightIsWider, _, Some(_), Variance::Covariant) => {
            return Err(format!(
                "field {} on the right side is not a subtype of the left side, cannot perform covariant composition",
                k
            ));
        }
        (TypeComparison::LeftIsWider, _, Some(right), Variance::Covariant) => {
            fields.insert(k.to_owned(), right.clone());
        }
        (TypeComparison::LeftIsWider, Some(left), None, Variance::Covariant) => {
            fields.insert(k.to_owned(), left.clone());
        }
        _ => unreachable!(),
    }

    Ok(())
}

fn with_optional(f: Field) -> Field {
    Field {
        optional: true,
        ..f
    }
}
