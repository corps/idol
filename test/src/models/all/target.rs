use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::idol;
use std::convert::TryFrom;

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct AssembledRequired(pub crate::models::all::required::Assembled);

impl idol::ExpandsJson for AssembledRequired {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
    crate::models::all::required::Assembled::expand_json(value)
  }
}

impl idol::ValidatesJson for AssembledRequired {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    crate::models::all::required::Assembled::validate_json(value)
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct AssembledOptional(pub crate::models::all::optional::Assembled);

impl idol::ExpandsJson for AssembledOptional {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
    crate::models::all::optional::Assembled::expand_json(value)
  }
}

impl idol::ValidatesJson for AssembledOptional {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    crate::models::all::optional::Assembled::validate_json(value)
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct OptionalParams {
  pub r#optional: AssembledOptional,
}

impl idol::ExpandsJson for OptionalParams {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match OptionalParams::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;


    if value.is_null() {
      return Some(serde_json::value::to_value(OptionalParams::default()).unwrap());
    }

    if !value.is_object() {
      return None;
    }

    match AssembledOptional::expand_json(&mut value["optional"]) {
      Some(v) => value["optional"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for OptionalParams {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    AssembledOptional::validate_json(&value["optional"]).map_err(|e| idol::ValidationError(format!("field optional: {}", e)))?;

    Ok(())
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct OptionalMethod {
  pub r#input: OptionalParams,
  pub r#output: AssembledOptional,
}

impl idol::ExpandsJson for OptionalMethod {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match OptionalMethod::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;


    if value.is_null() {
      return Some(serde_json::value::to_value(OptionalMethod::default()).unwrap());
    }

    if !value.is_object() {
      return None;
    }

    match OptionalParams::expand_json(&mut value["input"]) {
      Some(v) => value["input"] = v,
      None => (),
    }

    match AssembledOptional::expand_json(&mut value["output"]) {
      Some(v) => value["output"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for OptionalMethod {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    OptionalParams::validate_json(&value["input"]).map_err(|e| idol::ValidationError(format!("field input: {}", e)))?;
    AssembledOptional::validate_json(&value["output"]).map_err(|e| idol::ValidationError(format!("field output: {}", e)))?;

    Ok(())
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct OptionalService {
  pub r#optional: OptionalMethod,
}

impl idol::ExpandsJson for OptionalService {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match OptionalService::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;


    if value.is_null() {
      return Some(serde_json::value::to_value(OptionalService::default()).unwrap());
    }

    if !value.is_object() {
      return None;
    }

    match OptionalMethod::expand_json(&mut value["optional"]) {
      Some(v) => value["optional"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for OptionalService {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    OptionalMethod::validate_json(&value["optional"]).map_err(|e| idol::ValidationError(format!("field optional: {}", e)))?;

    Ok(())
  }
}
