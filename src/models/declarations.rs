use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::idol;
use std::convert::TryFrom;

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub enum Variance {
  Covariant,
  Invariant,
  Contravariant,
}

impl Default for Variance {
  fn default() -> Variance {
    Variance::Covariant
  }
}

impl From<usize> for Variance {
  fn from(i: usize) -> Variance {
    if i >= 3 {
      Variance::Covariant
    } else if i == 0 {
      Variance::Covariant
    } else if i == 1 {
      Variance::Invariant
    } else if i == 2 {
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
      Variance::Invariant => 1,
      Variance::Contravariant => 2,
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
        }
        ;
      }
      None => (),
    }
    ;

    if value.is_null() {
      return serde_json::to_value(Variance::default()).ok();
    }

    None
  }
}

impl idol::ValidatesJson for Variance {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    return serde_json::from_value::<Variance>(value.to_owned()).map_err(|_| idol::ValidationError(format!("expected a valid enum value for Variance, but found {}", value))).map(|_| ());
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
        }
        ;
      }
      None => (),
    }
    ;


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
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    Vec::<String>::validate_json(&value["enum"]).map_err(|e| idol::ValidationError(format!("field enum: {}", e)))?;
    Option::<HashMap<String, FieldDec>>::validate_json(&value["fields"]).map_err(|e| idol::ValidationError(format!("field fields: {}", e)))?;
    Vec::<String>::validate_json(&value["is_a"]).map_err(|e| idol::ValidationError(format!("field is_a: {}", e)))?;
    Vec::<String>::validate_json(&value["tags"]).map_err(|e| idol::ValidationError(format!("field tags: {}", e)))?;
    bool::validate_json(&value["trim"]).map_err(|e| idol::ValidationError(format!("field trim: {}", e)))?;
    Variance::validate_json(&value["variance"]).map_err(|e| idol::ValidationError(format!("field variance: {}", e)))?;

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
