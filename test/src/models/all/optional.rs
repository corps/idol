use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::idol;
use std::convert::TryFrom;

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct Assembled {
  pub r#test_atleast_one: Option<crate::models::tests::basic::TestAtleastOne>,
  pub r#test_enum: Option<crate::models::tests::basic::TestEnum>,
  pub r#test_kind: Option<crate::models::tests::basic::TestKind>,
  pub r#test_list_of: Option<crate::models::all::required::ListOfTestKind>,
  pub r#test_list_of_list_struct: Option<crate::models::tests::basic::TestListOfListStruct>,
  pub r#test_literal_struct: Option<crate::models::tests::basic::TestLiteralStruct>,
  pub r#test_literal_top: Option<crate::models::tests::basic::TestLiteralTop>,
  pub r#test_map: Option<crate::models::tests::basic::TestMap>,
  pub r#test_optional_field: Option<crate::models::tests::basic::TestOptionalField>,
  pub r#test_struct: Option<crate::models::tests::basic::TestStruct>,
  pub r#test_triplet: Option<crate::models::all::required::TripletOfSideImport2>,
}

impl idol::ExpandsJson for Assembled {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match Assembled::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;


    if value.is_null() {
      return Some(serde_json::value::to_value(Assembled::default()).unwrap());
    }

    if !value.is_object() {
      return None;
    }

    match Option::<crate::models::tests::basic::TestAtleastOne>::expand_json(&mut value["test_atleast_one"]) {
      Some(v) => value["test_atleast_one"] = v,
      None => (),
    }

    match Option::<crate::models::tests::basic::TestEnum>::expand_json(&mut value["test_enum"]) {
      Some(v) => value["test_enum"] = v,
      None => (),
    }

    match Option::<crate::models::tests::basic::TestKind>::expand_json(&mut value["test_kind"]) {
      Some(v) => value["test_kind"] = v,
      None => (),
    }

    match Option::<crate::models::all::required::ListOfTestKind>::expand_json(&mut value["test_list_of"]) {
      Some(v) => value["test_list_of"] = v,
      None => (),
    }

    match Option::<crate::models::tests::basic::TestListOfListStruct>::expand_json(&mut value["test_list_of_list_struct"]) {
      Some(v) => value["test_list_of_list_struct"] = v,
      None => (),
    }

    match Option::<crate::models::tests::basic::TestLiteralStruct>::expand_json(&mut value["test_literal_struct"]) {
      Some(v) => value["test_literal_struct"] = v,
      None => (),
    }

    match Option::<crate::models::tests::basic::TestLiteralTop>::expand_json(&mut value["test_literal_top"]) {
      Some(v) => value["test_literal_top"] = v,
      None => (),
    }

    match Option::<crate::models::tests::basic::TestMap>::expand_json(&mut value["test_map"]) {
      Some(v) => value["test_map"] = v,
      None => (),
    }

    match Option::<crate::models::tests::basic::TestOptionalField>::expand_json(&mut value["test_optional_field"]) {
      Some(v) => value["test_optional_field"] = v,
      None => (),
    }

    match Option::<crate::models::tests::basic::TestStruct>::expand_json(&mut value["test_struct"]) {
      Some(v) => value["test_struct"] = v,
      None => (),
    }

    match Option::<crate::models::all::required::TripletOfSideImport2>::expand_json(&mut value["test_triplet"]) {
      Some(v) => value["test_triplet"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for Assembled {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    Option::<crate::models::tests::basic::TestAtleastOne>::validate_json(&value["test_atleast_one"]).map_err(|e| idol::ValidationError(format!("field test_atleast_one: {}", e)))?;
    Option::<crate::models::tests::basic::TestEnum>::validate_json(&value["test_enum"]).map_err(|e| idol::ValidationError(format!("field test_enum: {}", e)))?;
    Option::<crate::models::tests::basic::TestKind>::validate_json(&value["test_kind"]).map_err(|e| idol::ValidationError(format!("field test_kind: {}", e)))?;
    Option::<crate::models::all::required::ListOfTestKind>::validate_json(&value["test_list_of"]).map_err(|e| idol::ValidationError(format!("field test_list_of: {}", e)))?;
    Option::<crate::models::tests::basic::TestListOfListStruct>::validate_json(&value["test_list_of_list_struct"]).map_err(|e| idol::ValidationError(format!("field test_list_of_list_struct: {}", e)))?;
    Option::<crate::models::tests::basic::TestLiteralStruct>::validate_json(&value["test_literal_struct"]).map_err(|e| idol::ValidationError(format!("field test_literal_struct: {}", e)))?;
    Option::<crate::models::tests::basic::TestLiteralTop>::validate_json(&value["test_literal_top"]).map_err(|e| idol::ValidationError(format!("field test_literal_top: {}", e)))?;
    Option::<crate::models::tests::basic::TestMap>::validate_json(&value["test_map"]).map_err(|e| idol::ValidationError(format!("field test_map: {}", e)))?;
    Option::<crate::models::tests::basic::TestOptionalField>::validate_json(&value["test_optional_field"]).map_err(|e| idol::ValidationError(format!("field test_optional_field: {}", e)))?;
    Option::<crate::models::tests::basic::TestStruct>::validate_json(&value["test_struct"]).map_err(|e| idol::ValidationError(format!("field test_struct: {}", e)))?;
    Option::<crate::models::all::required::TripletOfSideImport2>::validate_json(&value["test_triplet"]).map_err(|e| idol::ValidationError(format!("field test_triplet: {}", e)))?;

    Ok(())
  }
}
