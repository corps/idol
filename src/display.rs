use crate::deconstructors::{
    Optional, ScalarDeconstructor, TypeDeconstructor, TypeStructDeconstructor,
};
use crate::models::schema::{Module, PrimitiveType, Reference, StructKind, Type};
use std::borrow::Borrow;
use std::fmt;
use std::fmt::Formatter;

impl fmt::Display for Module {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "=== module {}\n{}",
            self.module_name,
            self.types_dependency_ordering
                .iter()
                .filter_map(|type_name| {
                    self.types_by_name.get(type_name).map(|t| format!("{}", t))
                })
                .collect::<Vec<String>>()
                .join("\n")
        )
    }
}

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

impl fmt::Display for Optional {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        if self.into() {
            write!(f, "?")
        } else {
            Ok(())
        }
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
