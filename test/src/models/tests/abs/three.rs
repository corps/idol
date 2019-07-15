use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::idol;
use std::convert::TryFrom;

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct SideImport2 {
  pub r#side_import2: idol::i53,
}

impl idol::ExpandsJson for SideImport2 {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match SideImport2::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;


    if value.is_null() {
      return Some(serde_json::value::to_value(SideImport2::default()).unwrap());
    }

    if !value.is_object() {
      return None;
    }

    match idol::i53::expand_json(&mut value["side_import2"]) {
      Some(v) => value["side_import2"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for SideImport2 {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    idol::i53::validate_json(&value["side_import2"]).map_err(|e| idol::ValidationError(format!("field side_import2: {}", e)))?;

    Ok(())
  }
}
