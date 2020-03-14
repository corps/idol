use crate::models::schema::{Field, PrimitiveType, Reference, StructKind, Type, TypeStruct};
use serde::export::fmt::Error;
use serde::export::Formatter;
use std::borrow::Borrow;
use std::collections::HashMap;
use std::fmt;

impl fmt::Display for Type {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}: {} # {}",
            self.named,
            TypeDeconstructor(self),
            self.docs.join("  ")
        )
    }
}

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

impl fmt::Display for Reference {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.qualified_name)
    }
}

impl<'a> fmt::Display for TypeDeconstructor<'a> {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        if let Some(ts) = self.type_struct() {
            write!(f, "{}", ts)
        } else if let Some(fields) = self.struct_fields() {
            write!(
                f,
                "{{\n{}\n}}",
                fields
                    .iter()
                    .map(|(k, f)| format!(
                        "  {}: {} # {}",
                        k,
                        TypeStructDeconstructor(&f.type_struct, f.optional.into()),
                        f.docs.join("  ")
                    ))
                    .collect::<Vec<String>>()
                    .join("\n")
            )
        } else {
            write!(f, "[ {} ]", self.0.options.join(", "))
        }
    }
}

pub struct Optional(bool);

impl fmt::Display for Optional {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        if self.0 {
            write!(f, "?")
        } else {
            Ok(())
        }
    }
}

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

pub struct TypeStructDeconstructor<'a>(pub &'a TypeStruct, pub Optional);

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

impl<'a> fmt::Display for TypeStructDeconstructor<'a> {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}{}{}",
            ScalarDeconstructor(&self.0),
            self.0.struct_kind,
            self.1
        )
    }
}

impl fmt::Display for StructKind {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            StructKind::Scalar => Ok(()),
            StructKind::Map => write!(f, "{{}}"),
            StructKind::Repeated => write!(f, "[]"),
        }
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

impl<'a> fmt::Display for ScalarDeconstructor<'a> {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        if !self.0.reference.qualified_name.is_empty() {
            write!(f, "{}", self.0.reference.qualified_name)
        } else if let Some(lit) = self.0.literal.borrow() {
            match self.0.primitive_type {
                PrimitiveType::bool => write!(f, "lit:{}", lit.bool),
                PrimitiveType::int => write!(f, "lit:{}", lit.int),
                PrimitiveType::double => write!(f, "lit:{}", lit.double),
                PrimitiveType::string => write!(f, "lit:string:{}", lit.string),
                PrimitiveType::any => unreachable!(),
            }
        } else {
            write!(f, "{:?}", self.0.primitive_type)
        }
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
