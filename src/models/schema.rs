use crate::models::idol;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub enum StructKind {
    Scalar,
    Repeated,
    Map,
}

impl Default for StructKind {
    fn default() -> StructKind {
        StructKind::Scalar
    }
}

impl From<usize> for StructKind {
    fn from(i: usize) -> StructKind {
        if i >= 3 {
            StructKind::Scalar
        } else if i == 0 {
            StructKind::Scalar
        } else if i == 1 {
            StructKind::Repeated
        } else if i == 2 {
            StructKind::Map
        } else {
            unreachable!()
        }
    }
}

impl Into<usize> for StructKind {
    fn into(self) -> usize {
        match self {
            StructKind::Scalar => 0,
            StructKind::Repeated => 1,
            StructKind::Map => 2,
        }
    }
}

impl idol::ExpandsJson for StructKind {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match StructKind::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return serde_json::to_value(StructKind::default()).ok();
        }

        None
    }
}

impl idol::ValidatesJson for StructKind {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        return serde_json::from_value::<StructKind>(value.to_owned())
            .map_err(|_| {
                idol::ValidationError(format!(
                    "expected a valid enum value for StructKind, but found {}",
                    value
                ))
            })
            .map(|_| ());
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub enum PrimitiveType {
    int,
    double,
    string,
    bool,
    any,
}

impl Default for PrimitiveType {
    fn default() -> PrimitiveType {
        PrimitiveType::int
    }
}

impl From<usize> for PrimitiveType {
    fn from(i: usize) -> PrimitiveType {
        if i >= 5 {
            PrimitiveType::int
        } else if i == 0 {
            PrimitiveType::int
        } else if i == 1 {
            PrimitiveType::double
        } else if i == 2 {
            PrimitiveType::string
        } else if i == 3 {
            PrimitiveType::bool
        } else if i == 4 {
            PrimitiveType::any
        } else {
            unreachable!()
        }
    }
}

impl Into<usize> for PrimitiveType {
    fn into(self) -> usize {
        match self {
            PrimitiveType::int => 0,
            PrimitiveType::double => 1,
            PrimitiveType::string => 2,
            PrimitiveType::bool => 3,
            PrimitiveType::any => 4,
        }
    }
}

impl idol::ExpandsJson for PrimitiveType {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match PrimitiveType::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return serde_json::to_value(PrimitiveType::default()).ok();
        }

        None
    }
}

impl idol::ValidatesJson for PrimitiveType {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        return serde_json::from_value::<PrimitiveType>(value.to_owned())
            .map_err(|_| {
                idol::ValidationError(format!(
                    "expected a valid enum value for PrimitiveType, but found {}",
                    value
                ))
            })
            .map(|_| ());
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct Literal {
    pub r#bool: bool,
    pub r#double: f64,
    pub r#int: i64,
    pub r#string: String,
}

impl idol::ExpandsJson for Literal {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match Literal::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return Some(serde_json::value::to_value(Literal::default()).unwrap());
        }

        if !value.is_object() {
            return None;
        }

        match bool::expand_json(&mut value["bool"]) {
            Some(v) => value["bool"] = v,
            None => (),
        }

        match f64::expand_json(&mut value["double"]) {
            Some(v) => value["double"] = v,
            None => (),
        }

        match i64::expand_json(&mut value["int"]) {
            Some(v) => value["int"] = v,
            None => (),
        }

        match String::expand_json(&mut value["string"]) {
            Some(v) => value["string"] = v,
            None => (),
        }

        None
    }
}

impl idol::ValidatesJson for Literal {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        if !value.is_object() {
            return Err(idol::ValidationError(format!(
                "expected an object but found {}",
                value
            )));
        }

        bool::validate_json(&value["bool"])
            .map_err(|e| idol::ValidationError(format!("field bool: {}", e)))?;
        f64::validate_json(&value["double"])
            .map_err(|e| idol::ValidationError(format!("field double: {}", e)))?;
        i64::validate_json(&value["int"])
            .map_err(|e| idol::ValidationError(format!("field int: {}", e)))?;
        String::validate_json(&value["string"])
            .map_err(|e| idol::ValidationError(format!("field string: {}", e)))?;

        Ok(())
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct Reference {
    pub r#module_name: String,
    pub r#qualified_name: String,
    pub r#type_name: String,
}

impl idol::ExpandsJson for Reference {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match Reference::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return Some(serde_json::value::to_value(Reference::default()).unwrap());
        }

        if !value.is_object() {
            return None;
        }

        match String::expand_json(&mut value["module_name"]) {
            Some(v) => value["module_name"] = v,
            None => (),
        }

        match String::expand_json(&mut value["qualified_name"]) {
            Some(v) => value["qualified_name"] = v,
            None => (),
        }

        match String::expand_json(&mut value["type_name"]) {
            Some(v) => value["type_name"] = v,
            None => (),
        }

        None
    }
}

impl idol::ValidatesJson for Reference {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        if !value.is_object() {
            return Err(idol::ValidationError(format!(
                "expected an object but found {}",
                value
            )));
        }

        String::validate_json(&value["module_name"])
            .map_err(|e| idol::ValidationError(format!("field module_name: {}", e)))?;
        String::validate_json(&value["qualified_name"])
            .map_err(|e| idol::ValidationError(format!("field qualified_name: {}", e)))?;
        String::validate_json(&value["type_name"])
            .map_err(|e| idol::ValidationError(format!("field type_name: {}", e)))?;

        Ok(())
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TypeStruct {
    pub r#literal: Option<Literal>,
    pub r#primitive_type: PrimitiveType,
    pub r#reference: Reference,
    pub r#struct_kind: StructKind,
}

impl idol::ExpandsJson for TypeStruct {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match TypeStruct::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return Some(serde_json::value::to_value(TypeStruct::default()).unwrap());
        }

        if !value.is_object() {
            return None;
        }

        match Option::<Literal>::expand_json(&mut value["literal"]) {
            Some(v) => value["literal"] = v,
            None => (),
        }

        match PrimitiveType::expand_json(&mut value["primitive_type"]) {
            Some(v) => value["primitive_type"] = v,
            None => (),
        }

        match Reference::expand_json(&mut value["reference"]) {
            Some(v) => value["reference"] = v,
            None => (),
        }

        match StructKind::expand_json(&mut value["struct_kind"]) {
            Some(v) => value["struct_kind"] = v,
            None => (),
        }

        None
    }
}

impl idol::ValidatesJson for TypeStruct {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        if !value.is_object() {
            return Err(idol::ValidationError(format!(
                "expected an object but found {}",
                value
            )));
        }

        Option::<Literal>::validate_json(&value["literal"])
            .map_err(|e| idol::ValidationError(format!("field literal: {}", e)))?;
        PrimitiveType::validate_json(&value["primitive_type"])
            .map_err(|e| idol::ValidationError(format!("field primitive_type: {}", e)))?;
        Reference::validate_json(&value["reference"])
            .map_err(|e| idol::ValidationError(format!("field reference: {}", e)))?;
        StructKind::validate_json(&value["struct_kind"])
            .map_err(|e| idol::ValidationError(format!("field struct_kind: {}", e)))?;

        Ok(())
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct Field {
    pub r#field_name: String,
    pub r#docs: Vec<String>,
    pub r#type_struct: TypeStruct,
    pub r#optional: bool,
}

impl idol::ExpandsJson for Field {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match Field::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return Some(serde_json::value::to_value(Field::default()).unwrap());
        }

        if !value.is_object() {
            return None;
        }

        match String::expand_json(&mut value["field_name"]) {
            Some(v) => value["field_name"] = v,
            None => (),
        }

        match Vec::<String>::expand_json(&mut value["docs"]) {
            Some(v) => value["docs"] = v,
            None => (),
        }

        match TypeStruct::expand_json(&mut value["type_struct"]) {
            Some(v) => value["type_struct"] = v,
            None => (),
        }

        None
    }
}

impl idol::ValidatesJson for Field {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        if !value.is_object() {
            return Err(idol::ValidationError(format!(
                "expected an object but found {}",
                value
            )));
        }

        String::validate_json(&value["field_name"])
            .map_err(|e| idol::ValidationError(format!("field field_name: {}", e)))?;
        Vec::<String>::validate_json(&value["docs"])
            .map_err(|e| idol::ValidationError(format!("field docs: {}", e)))?;
        TypeStruct::validate_json(&value["type_struct"])
            .map_err(|e| idol::ValidationError(format!("field type_struct: {}", e)))?;

        Ok(())
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct Type {
    pub r#fields: HashMap<String, Field>,
    pub r#is_a: Option<TypeStruct>,
    pub r#named: Reference,
    pub r#options: Vec<String>,
    pub r#tags: Vec<String>,
    pub r#docs: Vec<String>,
}

impl idol::ExpandsJson for Type {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match Type::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return Some(serde_json::value::to_value(Type::default()).unwrap());
        }

        if !value.is_object() {
            return None;
        }

        match HashMap::<String, Field>::expand_json(&mut value["fields"]) {
            Some(v) => value["fields"] = v,
            None => (),
        }

        match Option::<TypeStruct>::expand_json(&mut value["is_a"]) {
            Some(v) => value["is_a"] = v,
            None => (),
        }

        match Reference::expand_json(&mut value["named"]) {
            Some(v) => value["named"] = v,
            None => (),
        }

        match Vec::<String>::expand_json(&mut value["options"]) {
            Some(v) => value["options"] = v,
            None => (),
        }

        match Vec::<String>::expand_json(&mut value["tags"]) {
            Some(v) => value["tags"] = v,
            None => (),
        }

        match Vec::<String>::expand_json(&mut value["docs"]) {
            Some(v) => value["docs"] = v,
            None => (),
        }

        None
    }
}

impl idol::ValidatesJson for Type {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        if !value.is_object() {
            return Err(idol::ValidationError(format!(
                "expected an object but found {}",
                value
            )));
        }

        HashMap::<String, Field>::validate_json(&value["fields"])
            .map_err(|e| idol::ValidationError(format!("field fields: {}", e)))?;
        Option::<TypeStruct>::validate_json(&value["is_a"])
            .map_err(|e| idol::ValidationError(format!("field is_a: {}", e)))?;
        Reference::validate_json(&value["named"])
            .map_err(|e| idol::ValidationError(format!("field named: {}", e)))?;
        Vec::<String>::validate_json(&value["options"])
            .map_err(|e| idol::ValidationError(format!("field options: {}", e)))?;
        Vec::<String>::validate_json(&value["tags"])
            .map_err(|e| idol::ValidationError(format!("field tags: {}", e)))?;
        Vec::<String>::validate_json(&value["docs"])
            .map_err(|e| idol::ValidationError(format!("field docs: {}", e)))?;

        Ok(())
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct Module {
    pub r#module_name: String,
    pub r#types_by_name: HashMap<String, Type>,
    pub r#types_dependency_ordering: Vec<String>,
}

impl idol::ExpandsJson for Module {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match Module::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return Some(serde_json::value::to_value(Module::default()).unwrap());
        }

        if !value.is_object() {
            return None;
        }

        match String::expand_json(&mut value["module_name"]) {
            Some(v) => value["module_name"] = v,
            None => (),
        }

        match HashMap::<String, Type>::expand_json(&mut value["types_by_name"]) {
            Some(v) => value["types_by_name"] = v,
            None => (),
        }

        match Vec::<String>::expand_json(&mut value["types_dependency_ordering"]) {
            Some(v) => value["types_dependency_ordering"] = v,
            None => (),
        }

        None
    }
}

impl idol::ValidatesJson for Module {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        if !value.is_object() {
            return Err(idol::ValidationError(format!(
                "expected an object but found {}",
                value
            )));
        }

        String::validate_json(&value["module_name"])
            .map_err(|e| idol::ValidationError(format!("field module_name: {}", e)))?;
        HashMap::<String, Type>::validate_json(&value["types_by_name"])
            .map_err(|e| idol::ValidationError(format!("field types_by_name: {}", e)))?;
        Vec::<String>::validate_json(&value["types_dependency_ordering"]).map_err(|e| {
            idol::ValidationError(format!("field types_dependency_ordering: {}", e))
        })?;

        Ok(())
    }
}
