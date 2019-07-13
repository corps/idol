use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::idol;
use std::convert::TryFrom;

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TipletOfSideImport2 {
  pub r#a: crate::models::tests::abstract::three::SideImport2,
  pub r#b: Vec<crate::models::tests::basic::TestLiteralTop>,
  pub r#c: HashMap<String, crate::models::tests::basic::TestStruct>,
  pub r#side_import: crate::models::tests::abstract::two::SideImport,
}

impl idol::ExpandsJson for TipletOfSideImport2 {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
    if !value.is_object() {
      return Some(serde_json::value::to_value(TipletOfSideImport2::default()).unwrap());
    }

    match crate::models::tests::abstract::three::SideImport2::expand_json(&mut value["a"]) {
      Some(v) => value["a"] = v,
      None => (),
    }

    match Vec::<crate::models::tests::basic::TestLiteralTop>::expand_json(&mut value["b"]) {
      Some(v) => value["b"] = v,
      None => (),
    }

    match HashMap::<String, crate::models::tests::basic::TestStruct>::expand_json(&mut value["c"]) {
      Some(v) => value["c"] = v,
      None => (),
    }

    match crate::models::tests::abstract::two::SideImport::expand_json(&mut value["side_import"]) {
      Some(v) => value["side_import"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for TipletOfSideImport2 {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    crate::models::tests::abstract::three::SideImport2::validate_json(&value["a"]).map_err(|e| idol::ValidationError(format!("field a: {}", e)))?;
    Vec::<crate::models::tests::basic::TestLiteralTop>::validate_json(&value["b"]).map_err(|e| idol::ValidationError(format!("field b: {}", e)))?;
    HashMap::<String, crate::models::tests::basic::TestStruct>::validate_json(&value["c"]).map_err(|e| idol::ValidationError(format!("field c: {}", e)))?;
    crate::models::tests::abstract::two::SideImport::validate_json(&value["side_import"]).map_err(|e| idol::ValidationError(format!("field side_import: {}", e)))?;

    Ok(())
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct ListOfTestKind(pub Vec<crate::models::tests::basic::TestKind>);

impl idol::ExpandsJson for ListOfTestKind {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
    Vec::<crate::models::tests::basic::TestKind>::expand_json(value)
  }
}

impl idol::ValidatesJson for ListOfTestKind {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    Vec::<crate::models::tests::basic::TestKind>::validate_json(value)
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct Assembled {
  pub r#test_atleast_one: crate::models::tests::basic::TestAtleastOne,
  pub r#test_enum: crate::models::tests::basic::TestEnum,
  pub r#test_kind: crate::models::tests::basic::TestKind,
  pub r#test_list_of: ListOfTestKind,
  pub r#test_list_of_list_struct: crate::models::tests::basic::TestListOfListStruct,
  pub r#test_literal_struct: crate::models::tests::basic::TestLiteralStruct,
  pub r#test_literal_top: crate::models::tests::basic::TestLiteralTop,
  pub r#test_map: crate::models::tests::basic::TestMap,
  pub r#test_optional_field: crate::models::tests::basic::TestOptionalField,
  pub r#test_struct: crate::models::tests::basic::TestStruct,
  pub r#test_triplet: TripletOfSideImport2,
}

impl idol::ExpandsJson for Assembled {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
    if !value.is_object() {
      return Some(serde_json::value::to_value(Assembled::default()).unwrap());
    }

    match crate::models::tests::basic::TestAtleastOne::expand_json(&mut value["test_atleast_one"]) {
      Some(v) => value["test_atleast_one"] = v,
      None => (),
    }

    match crate::models::tests::basic::TestEnum::expand_json(&mut value["test_enum"]) {
      Some(v) => value["test_enum"] = v,
      None => (),
    }

    match crate::models::tests::basic::TestKind::expand_json(&mut value["test_kind"]) {
      Some(v) => value["test_kind"] = v,
      None => (),
    }

    match ListOfTestKind::expand_json(&mut value["test_list_of"]) {
      Some(v) => value["test_list_of"] = v,
      None => (),
    }

    match crate::models::tests::basic::TestListOfListStruct::expand_json(&mut value["test_list_of_list_struct"]) {
      Some(v) => value["test_list_of_list_struct"] = v,
      None => (),
    }

    match crate::models::tests::basic::TestLiteralStruct::expand_json(&mut value["test_literal_struct"]) {
      Some(v) => value["test_literal_struct"] = v,
      None => (),
    }

    match crate::models::tests::basic::TestLiteralTop::expand_json(&mut value["test_literal_top"]) {
      Some(v) => value["test_literal_top"] = v,
      None => (),
    }

    match crate::models::tests::basic::TestMap::expand_json(&mut value["test_map"]) {
      Some(v) => value["test_map"] = v,
      None => (),
    }

    match crate::models::tests::basic::TestOptionalField::expand_json(&mut value["test_optional_field"]) {
      Some(v) => value["test_optional_field"] = v,
      None => (),
    }

    match crate::models::tests::basic::TestStruct::expand_json(&mut value["test_struct"]) {
      Some(v) => value["test_struct"] = v,
      None => (),
    }

    match TripletOfSideImport2::expand_json(&mut value["test_triplet"]) {
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

    crate::models::tests::basic::TestAtleastOne::validate_json(&value["test_atleast_one"]).map_err(|e| idol::ValidationError(format!("field test_atleast_one: {}", e)))?;
    crate::models::tests::basic::TestEnum::validate_json(&value["test_enum"]).map_err(|e| idol::ValidationError(format!("field test_enum: {}", e)))?;
    crate::models::tests::basic::TestKind::validate_json(&value["test_kind"]).map_err(|e| idol::ValidationError(format!("field test_kind: {}", e)))?;
    ListOfTestKind::validate_json(&value["test_list_of"]).map_err(|e| idol::ValidationError(format!("field test_list_of: {}", e)))?;
    crate::models::tests::basic::TestListOfListStruct::validate_json(&value["test_list_of_list_struct"]).map_err(|e| idol::ValidationError(format!("field test_list_of_list_struct: {}", e)))?;
    crate::models::tests::basic::TestLiteralStruct::validate_json(&value["test_literal_struct"]).map_err(|e| idol::ValidationError(format!("field test_literal_struct: {}", e)))?;
    crate::models::tests::basic::TestLiteralTop::validate_json(&value["test_literal_top"]).map_err(|e| idol::ValidationError(format!("field test_literal_top: {}", e)))?;
    crate::models::tests::basic::TestMap::validate_json(&value["test_map"]).map_err(|e| idol::ValidationError(format!("field test_map: {}", e)))?;
    crate::models::tests::basic::TestOptionalField::validate_json(&value["test_optional_field"]).map_err(|e| idol::ValidationError(format!("field test_optional_field: {}", e)))?;
    crate::models::tests::basic::TestStruct::validate_json(&value["test_struct"]).map_err(|e| idol::ValidationError(format!("field test_struct: {}", e)))?;
    TripletOfSideImport2::validate_json(&value["test_triplet"]).map_err(|e| idol::ValidationError(format!("field test_triplet: {}", e)))?;

    Ok(())
  }
}
