use crate::models::idol;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub enum Variance {
    Covariant,
    Contravariant,
}

impl Default for Variance {
    fn default() -> Variance {
        Variance::Covariant
    }
}

impl From<usize> for Variance {
    fn from(i: usize) -> Variance {
        if i >= 2 {
            Variance::Covariant
        } else if i == 0 {
            Variance::Covariant
        } else if i == 1 {
            Variance::Contravariant
        } else {
            unreachable!()
        }
    }
}

impl Into<usize> for Variance {
    fn into(self) -> usize {
        match self {
            Variance::Covariant => 0,
            Variance::Contravariant => 1,
        }
    }
}

impl idol::ExpandsJson for Variance {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match Variance::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return serde_json::to_value(Variance::default()).ok();
        }

        None
    }
}

impl idol::ValidatesJson for Variance {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        return serde_json::from_value::<Variance>(value.to_owned())
            .map_err(|_| {
                idol::ValidationError(format!(
                    "expected a valid enum value for Variance, but found {}",
                    value
                ))
            })
            .map(|_| ());
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub struct FieldDec(pub Vec<String>);

impl Default for FieldDec {
    fn default() -> FieldDec {
        FieldDec(vec![String::default()])
    }
}

impl idol::ExpandsJson for FieldDec {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        if value.is_null() {
            return Some(serde_json::Value::Array(vec![serde_json::value::to_value(
                String::default(),
            )
            .unwrap()]));
        }
        if let serde_json::Value::Array(contents) = value {
            if contents.is_empty() {
                contents.push(serde_json::Value::Null);
            }
        } else {
            let inner = String::expand_json(value);
            if inner.is_some() {
                return Some(serde_json::Value::Array(vec![inner.unwrap()]));
            } else {
                return Some(serde_json::Value::Array(vec![value.to_owned()]));
            }
        }

        Vec::<String>::expand_json(value)
    }
}

impl idol::ValidatesJson for FieldDec {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        if let serde_json::Value::Array(contents) = value {
            if contents.is_empty() {
                return Err(idol::ValidationError(
                    "expected atleast one value, but none was found.".to_string(),
                ));
            }
        }

        Vec::<String>::validate_json(value)
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct ModuleInclude {
    pub r#from: String,
    pub r#matching: String,
}

impl idol::ExpandsJson for ModuleInclude {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match ModuleInclude::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return Some(serde_json::value::to_value(ModuleInclude::default()).unwrap());
        }

        if !value.is_object() {
            return None;
        }

        match String::expand_json(&mut value["from"]) {
            Some(v) => value["from"] = v,
            None => (),
        }

        match String::expand_json(&mut value["matching"]) {
            Some(v) => value["matching"] = v,
            None => (),
        }

        None
    }
}

impl idol::ValidatesJson for ModuleInclude {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        if !value.is_object() {
            return Err(idol::ValidationError(format!(
                "expected an object but found {}",
                value
            )));
        }

        String::validate_json(&value["from"])
            .map_err(|e| idol::ValidationError(format!("field from: {}", e)))?;
        String::validate_json(&value["matching"])
            .map_err(|e| idol::ValidationError(format!("field matching: {}", e)))?;

        Ok(())
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TypeDec {
    pub r#enum: Vec<String>,
    pub r#fields: Option<HashMap<String, FieldDec>>,
    pub r#is_a: Vec<String>,
    pub r#tags: Vec<String>,
    pub r#trim: bool,
    pub r#variance: Variance,
}

impl idol::ExpandsJson for TypeDec {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match TypeDec::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return Some(serde_json::value::to_value(TypeDec::default()).unwrap());
        }

        if !value.is_object() {
            return None;
        }

        match Vec::<String>::expand_json(&mut value["enum"]) {
            Some(v) => value["enum"] = v,
            None => (),
        }

        match Option::<HashMap<String, FieldDec>>::expand_json(&mut value["fields"]) {
            Some(v) => value["fields"] = v,
            None => (),
        }

        match Vec::<String>::expand_json(&mut value["is_a"]) {
            Some(v) => value["is_a"] = v,
            None => (),
        }

        match Vec::<String>::expand_json(&mut value["tags"]) {
            Some(v) => value["tags"] = v,
            None => (),
        }

        match bool::expand_json(&mut value["trim"]) {
            Some(v) => value["trim"] = v,
            None => (),
        }

        match Variance::expand_json(&mut value["variance"]) {
            Some(v) => value["variance"] = v,
            None => (),
        }

        None
    }
}

impl idol::ValidatesJson for TypeDec {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        if !value.is_object() {
            return Err(idol::ValidationError(format!(
                "expected an object but found {}",
                value
            )));
        }

        Vec::<String>::validate_json(&value["enum"])
            .map_err(|e| idol::ValidationError(format!("field enum: {}", e)))?;
        Option::<HashMap<String, FieldDec>>::validate_json(&value["fields"])
            .map_err(|e| idol::ValidationError(format!("field fields: {}", e)))?;
        Vec::<String>::validate_json(&value["is_a"])
            .map_err(|e| idol::ValidationError(format!("field is_a: {}", e)))?;
        Vec::<String>::validate_json(&value["tags"])
            .map_err(|e| idol::ValidationError(format!("field tags: {}", e)))?;
        bool::validate_json(&value["trim"])
            .map_err(|e| idol::ValidationError(format!("field trim: {}", e)))?;
        Variance::validate_json(&value["variance"])
            .map_err(|e| idol::ValidationError(format!("field variance: {}", e)))?;

        Ok(())
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct ModuleDec(pub HashMap<String, TypeDec>);

impl idol::ExpandsJson for ModuleDec {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        HashMap::<String, TypeDec>::expand_json(value)
    }
}

impl idol::ValidatesJson for ModuleDec {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        HashMap::<String, TypeDec>::validate_json(value)
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct ModuleIncludes(pub Vec<ModuleInclude>);

impl idol::ExpandsJson for ModuleIncludes {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        Vec::<ModuleInclude>::expand_json(value)
    }
}

impl idol::ValidatesJson for ModuleIncludes {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        Vec::<ModuleInclude>::validate_json(value)
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct IncludesDec {
    pub r#includes: ModuleIncludes,
}

impl idol::ExpandsJson for IncludesDec {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match IncludesDec::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return Some(serde_json::value::to_value(IncludesDec::default()).unwrap());
        }

        if !value.is_object() {
            return None;
        }

        match ModuleIncludes::expand_json(&mut value["includes"]) {
            Some(v) => value["includes"] = v,
            None => (),
        }

        None
    }
}

impl idol::ValidatesJson for IncludesDec {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        if !value.is_object() {
            return Err(idol::ValidationError(format!(
                "expected an object but found {}",
                value
            )));
        }

        ModuleIncludes::validate_json(&value["includes"])
            .map_err(|e| idol::ValidationError(format!("field includes: {}", e)))?;

        Ok(())
    }
}
