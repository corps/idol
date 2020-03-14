use crate::models::schema::{Field, Reference, StructKind, Type, TypeStruct};
use std::borrow::Borrow;
use std::collections::HashMap;

pub struct TypeDeconstructor<'a>(pub &'a Type);

impl<'a> TypeDeconstructor<'a> {
    pub fn type_struct(&self) -> Option<TypeStructDeconstructor<'a>> {
        if let Some(m) = self.0.is_a.borrow() {
            return Some(TypeStructDeconstructor(m, false));
        }

        None
    }

    pub fn struct_fields(&self) -> Option<&'a HashMap<String, Field>> {
        if self.0.is_a.is_none() && self.0.options.is_empty() {
            return Some(&self.0.fields);
        }

        None
    }
}

pub struct TypeStructDeconstructor<'a>(pub &'a TypeStruct, pub bool);

impl<'a> TypeStructDeconstructor<'a> {
    pub fn scalar(&self) -> Option<ScalarDeconstructor<'a>> {
        if self.0.struct_kind == StructKind::Scalar {
            return Some(ScalarDeconstructor(&self.0));
        }

        None
    }

    pub fn contained(&self) -> Option<ScalarDeconstructor<'a>> {
        Some(ScalarDeconstructor(&self.0))
    }
}

pub struct ScalarDeconstructor<'a>(pub &'a TypeStruct);

impl<'a> ScalarDeconstructor<'a> {
    pub fn reference(&self) -> Option<&'a Reference> {
        if self.0.reference.qualified_name.is_empty() {
            return None;
        }

        Some(&self.0.reference)
    }
}

impl<'a> From<&'a Type> for Vec<Reference> {
    fn from(t: &'a Type) -> Self {
        let t_decon = TypeDeconstructor(t);
        let is_a_ref = t_decon
            .type_struct()
            .and_then(|ts_dec| ts_dec.contained())
            .and_then(|s_decon| s_decon.reference());

        if is_a_ref.is_some() {
            return is_a_ref.iter().cloned().cloned().collect();
        }

        t_decon
            .struct_fields()
            .map(|fields| {
                fields
                    .values()
                    .filter_map(|f| {
                        TypeStructDeconstructor(&f.type_struct, f.optional)
                            .contained()
                            .and_then(|s_decon| s_decon.reference())
                    })
                    .cloned()
                    .collect()
            })
            .unwrap_or_else(|| vec![])
    }
}
