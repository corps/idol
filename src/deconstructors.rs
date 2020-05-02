use crate::models::schema::{
    Field, Literal, Module, PrimitiveType, Reference, StructKind, Type, TypeStruct,
};
use std::borrow::Borrow;
use std::collections::BTreeMap;

pub struct TypeDeconstructor<'a>(pub &'a Type);

impl<'a> TypeDeconstructor<'a> {
    pub fn type_struct(&self) -> Option<TypeStructDeconstructor<'a>> {
        if let Some(m) = self.0.is_a.borrow() {
            return Some(TypeStructDeconstructor(m, false.into()));
        }

        None
    }

    pub fn struct_fields(&self) -> Option<BTreeMap<String, &'a Field>> {
        if self.0.is_a.is_none() && self.0.options.is_empty() {
            return Some(self.0.fields.iter().map(|(k, v)| (k.clone(), v)).collect());
        }

        None
    }
}

pub struct Optional(bool);

impl From<bool> for Optional {
    fn from(a: bool) -> Self {
        return Optional(a);
    }
}

impl Into<bool> for Optional {
    fn into(self) -> bool {
        self.0
    }
}

impl Into<bool> for &Optional {
    fn into(self) -> bool {
        self.0
    }
}

pub struct TypeStructDeconstructor<'a>(pub &'a TypeStruct, pub Optional);

impl<'a> From<&'a Field> for TypeStructDeconstructor<'a> {
    fn from(f: &'a Field) -> Self {
        TypeStructDeconstructor(&f.type_struct, f.optional.into())
    }
}

impl<'a> TypeStructDeconstructor<'a> {
    pub fn scalar(&self) -> Option<ScalarDeconstructor<'a>> {
        if self.0.struct_kind == StructKind::Scalar {
            return Some(ScalarDeconstructor(&self.0));
        }

        None
    }

    pub fn repeated(&self) -> Option<()> {
        match self.0.struct_kind {
            StructKind::Repeated => Some(()),
            _ => None,
        }
    }

    pub fn map(&self) -> Option<()> {
        match self.0.struct_kind {
            StructKind::Map => Some(()),
            _ => None,
        }
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

    pub fn primitive(&self) -> Option<PrimitiveType> {
        if !self.0.reference.qualified_name.is_empty() {
            return None;
        }

        if self.0.literal.is_some() {
            return None;
        }

        Some(self.0.primitive_type.clone())
    }

    pub fn literal(&self) -> Option<Literal> {
        if self.primitive().is_some() || self.reference().is_some() {
            return None;
        }

        return self.0.literal.clone();
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
                        TypeStructDeconstructor(&f.type_struct, f.optional.into())
                            .contained()
                            .and_then(|s_decon| s_decon.reference())
                    })
                    .cloned()
                    .collect()
            })
            .unwrap_or_else(|| vec![])
    }
}

pub trait ModuleNameOf {
    fn idol_module_name(&self) -> &str;
}

impl ModuleNameOf for Module {
    fn idol_module_name(&self) -> &str {
        &self.module_name
    }
}

impl ModuleNameOf for Reference {
    fn idol_module_name(&self) -> &str {
        &self.module_name
    }
}

impl ModuleNameOf for Type {
    fn idol_module_name(&self) -> &str {
        self.named.idol_module_name()
    }
}

pub trait ReferenceOf {
    fn idol_reference_for(&self) -> &Reference;
}

impl ReferenceOf for Type {
    fn idol_reference_for(&self) -> &Reference {
        &self.named
    }
}

impl ReferenceOf for Reference {
    fn idol_reference_for(&self) -> &Reference {
        self
    }
}
