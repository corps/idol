use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::idol;
use std::convert::TryFrom;

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
