use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::idol;
use std::convert::TryFrom;

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct SideImport {
  pub r#side_import: String,
}

impl idol::ExpandsJson for SideImport {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match SideImport::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;


    if !value.is_object() {
      return Some(serde_json::value::to_value(SideImport::default()).unwrap());
    }

    match String::expand_json(&mut value["side_import"]) {
      Some(v) => value["side_import"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for SideImport {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    String::validate_json(&value["side_import"]).map_err(|e| idol::ValidationError(format!("field side_import: {}", e)))?;

    Ok(())
  }
}
