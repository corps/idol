use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::idol;
use std::convert::TryFrom;

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
      return Some(serde_json::Value::Array(vec![serde_json::value::to_value(String::default()).unwrap()]));
    } if let serde_json::Value::Array(contents) = value {
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
        return Err(idol::ValidationError("expected atleast one value, but none was found.".to_string()));
      }
    }

    Vec::<String>::validate_json(value)
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TypeDec {
  pub r#enum: Vec<String>,
  pub r#fields: HashMap<String, FieldDec>,
  pub r#is_a: String,
  pub r#tags: Vec<String>,
  pub r#type_vars: Vec<String>,
}

impl idol::ExpandsJson for TypeDec {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
    if !value.is_object() {
      return Some(serde_json::value::to_value(TypeDec::default()).unwrap());
    }

    match Vec::<String>::expand_json(&mut value["enum"]) {
      Some(v) => value["enum"] = v,
      None => (),
    }

    match HashMap::<String, FieldDec>::expand_json(&mut value["fields"]) {
      Some(v) => value["fields"] = v,
      None => (),
    }

    match String::expand_json(&mut value["is_a"]) {
      Some(v) => value["is_a"] = v,
      None => (),
    }

    match Vec::<String>::expand_json(&mut value["tags"]) {
      Some(v) => value["tags"] = v,
      None => (),
    }

    match Vec::<String>::expand_json(&mut value["type_vars"]) {
      Some(v) => value["type_vars"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for TypeDec {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    Vec::<String>::validate_json(&value["enum"]).map_err(|e| idol::ValidationError(format!("field enum: {}", e)))?;
    HashMap::<String, FieldDec>::validate_json(&value["fields"]).map_err(|e| idol::ValidationError(format!("field fields: {}", e)))?;
    String::validate_json(&value["is_a"]).map_err(|e| idol::ValidationError(format!("field is_a: {}", e)))?;
    Vec::<String>::validate_json(&value["tags"]).map_err(|e| idol::ValidationError(format!("field tags: {}", e)))?;
    Vec::<String>::validate_json(&value["type_vars"]).map_err(|e| idol::ValidationError(format!("field type_vars: {}", e)))?;

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
