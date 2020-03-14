use crate::models::idol;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct Comments(pub Vec<String>);

impl idol::ExpandsJson for Comments {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        Vec::<String>::expand_json(value)
    }
}

impl idol::ValidatesJson for Comments {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        Vec::<String>::validate_json(value)
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TypeComments {
    pub r#field_comments: HashMap<String, Comments>,
    pub r#type_comments: Comments,
}

impl idol::ExpandsJson for TypeComments {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match TypeComments::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return Some(serde_json::value::to_value(TypeComments::default()).unwrap());
        }

        if !value.is_object() {
            return None;
        }

        match HashMap::<String, Comments>::expand_json(&mut value["field_comments"]) {
            Some(v) => value["field_comments"] = v,
            None => (),
        }

        match Comments::expand_json(&mut value["type_comments"]) {
            Some(v) => value["type_comments"] = v,
            None => (),
        }

        None
    }
}

impl idol::ValidatesJson for TypeComments {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        if !value.is_object() {
            return Err(idol::ValidationError(format!(
                "expected an object but found {}",
                value
            )));
        }

        HashMap::<String, Comments>::validate_json(&value["field_comments"])
            .map_err(|e| idol::ValidationError(format!("field field_comments: {}", e)))?;
        Comments::validate_json(&value["type_comments"])
            .map_err(|e| idol::ValidationError(format!("field type_comments: {}", e)))?;

        Ok(())
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct ModuleComments(pub HashMap<String, TypeComments>);

impl idol::ExpandsJson for ModuleComments {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        HashMap::<String, TypeComments>::expand_json(value)
    }
}

impl idol::ValidatesJson for ModuleComments {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        HashMap::<String, TypeComments>::validate_json(value)
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct LoadedModule {
    pub r#comments: ModuleComments,
    pub r#declaration: crate::models::declarations::ModuleDec,
    pub r#includes: crate::models::declarations::ModuleIncludes,
    pub r#module_name: String,
}

impl idol::ExpandsJson for LoadedModule {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
        match idol::get_list_scalar(value) {
            Some(mut v) => {
                return match LoadedModule::expand_json(&mut v) {
                    Some(v_) => Some(v_),
                    None => Some(v),
                };
            }
            None => (),
        };

        if value.is_null() {
            return Some(serde_json::value::to_value(LoadedModule::default()).unwrap());
        }

        if !value.is_object() {
            return None;
        }

        match ModuleComments::expand_json(&mut value["comments"]) {
            Some(v) => value["comments"] = v,
            None => (),
        }

        match crate::models::declarations::ModuleDec::expand_json(&mut value["declaration"]) {
            Some(v) => value["declaration"] = v,
            None => (),
        }

        match crate::models::declarations::ModuleIncludes::expand_json(&mut value["includes"]) {
            Some(v) => value["includes"] = v,
            None => (),
        }

        match String::expand_json(&mut value["module_name"]) {
            Some(v) => value["module_name"] = v,
            None => (),
        }

        None
    }
}

impl idol::ValidatesJson for LoadedModule {
    fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
        if !value.is_object() {
            return Err(idol::ValidationError(format!(
                "expected an object but found {}",
                value
            )));
        }

        ModuleComments::validate_json(&value["comments"])
            .map_err(|e| idol::ValidationError(format!("field comments: {}", e)))?;
        crate::models::declarations::ModuleDec::validate_json(&value["declaration"])
            .map_err(|e| idol::ValidationError(format!("field declaration: {}", e)))?;
        crate::models::declarations::ModuleIncludes::validate_json(&value["includes"])
            .map_err(|e| idol::ValidationError(format!("field includes: {}", e)))?;
        String::validate_json(&value["module_name"])
            .map_err(|e| idol::ValidationError(format!("field module_name: {}", e)))?;

        Ok(())
    }
}
