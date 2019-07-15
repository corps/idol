use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::idol;
use std::convert::TryFrom;

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub enum TestEnum {
  a,
  b,
  c,
}

impl Default for TestEnum {
  fn default() -> TestEnum {
    TestEnum::a
  }
}

impl From<usize> for TestEnum {
  fn from(i: usize) -> TestEnum {
    if i >= 3 {
      TestEnum::a
    } else if i == 0 {
      TestEnum::a
    } else if i == 1 {
      TestEnum::b
    } else if i == 2 {
      TestEnum::c
    } else {
      unreachable!()
    }
  }
}

impl Into<usize> for TestEnum {
  fn into(self) -> usize {
    match self {
      TestEnum::a => 0,
      TestEnum::b => 1,
      TestEnum::c => 2,
    }
  }
}

impl idol::ExpandsJson for TestEnum {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match TestEnum::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;

    if value.is_null() {
      return serde_json::to_value(TestEnum::default()).ok();
    }

    None
  }
}

impl idol::ValidatesJson for TestEnum {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    return serde_json::from_value::<TestEnum>(value.to_owned()).map_err(|_| idol::ValidationError(format!("expected a valid enum value for TestEnum, but found {}", value))).map(|_| ());
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub struct TestLiteralTop(String);

impl TestLiteralTop {
  pub fn val(&self) -> String {
    self.0.to_owned()
  }
}

impl Default for TestLiteralTop {
  fn default() -> TestLiteralTop {
    TestLiteralTop(("mooo").to_owned())
  }
}

impl idol::ExpandsJson for TestLiteralTop {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match TestLiteralTop::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;

    if value.is_null() || value.is_string() {
      Some(serde_json::Value::from("mooo"))
    } else {
      None
    }
  }
}

impl idol::ValidatesJson for TestLiteralTop {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if &serde_json::Value::from("mooo") == value {
      Ok(())
    } else {
      Err(idol::ValidationError(format!("expected literal {} but found {}", "mooo", value)))
    }
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TestOptionalField {
  pub r#optional: Option<String>,
}

impl idol::ExpandsJson for TestOptionalField {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match TestOptionalField::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;


    if value.is_null() {
      return Some(serde_json::value::to_value(TestOptionalField::default()).unwrap());
    }

    if !value.is_object() {
      return None;
    }

    match Option::<String>::expand_json(&mut value["optional"]) {
      Some(v) => value["optional"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for TestOptionalField {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    Option::<String>::validate_json(&value["optional"]).map_err(|e| idol::ValidationError(format!("field optional: {}", e)))?;

    Ok(())
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TestTagsStruct {
  pub r#a: idol::i53,
}

impl idol::ExpandsJson for TestTagsStruct {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match TestTagsStruct::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;


    if value.is_null() {
      return Some(serde_json::value::to_value(TestTagsStruct::default()).unwrap());
    }

    if !value.is_object() {
      return None;
    }

    match idol::i53::expand_json(&mut value["a"]) {
      Some(v) => value["a"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for TestTagsStruct {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    idol::i53::validate_json(&value["a"]).map_err(|e| idol::ValidationError(format!("field a: {}", e)))?;

    Ok(())
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TestStructInner {
  pub r#d: bool,
  pub r#e: f64,
  pub r#f: i64,
}

impl idol::ExpandsJson for TestStructInner {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match TestStructInner::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;


    if value.is_null() {
      return Some(serde_json::value::to_value(TestStructInner::default()).unwrap());
    }

    if !value.is_object() {
      return None;
    }

    match bool::expand_json(&mut value["d"]) {
      Some(v) => value["d"] = v,
      None => (),
    }

    match f64::expand_json(&mut value["e"]) {
      Some(v) => value["e"] = v,
      None => (),
    }

    match i64::expand_json(&mut value["f"]) {
      Some(v) => value["f"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for TestStructInner {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    bool::validate_json(&value["d"]).map_err(|e| idol::ValidationError(format!("field d: {}", e)))?;
    f64::validate_json(&value["e"]).map_err(|e| idol::ValidationError(format!("field e: {}", e)))?;
    i64::validate_json(&value["f"]).map_err(|e| idol::ValidationError(format!("field f: {}", e)))?;

    Ok(())
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TestStruct {
  pub r#a: String,
  pub r#b: idol::i53,
  pub r#c: TestStructInner,
}

impl idol::ExpandsJson for TestStruct {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match TestStruct::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;


    if value.is_null() {
      return Some(serde_json::value::to_value(TestStruct::default()).unwrap());
    }

    if !value.is_object() {
      return None;
    }

    match String::expand_json(&mut value["a"]) {
      Some(v) => value["a"] = v,
      None => (),
    }

    match idol::i53::expand_json(&mut value["b"]) {
      Some(v) => value["b"] = v,
      None => (),
    }

    match TestStructInner::expand_json(&mut value["c"]) {
      Some(v) => value["c"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for TestStruct {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    String::validate_json(&value["a"]).map_err(|e| idol::ValidationError(format!("field a: {}", e)))?;
    idol::i53::validate_json(&value["b"]).map_err(|e| idol::ValidationError(format!("field b: {}", e)))?;
    TestStructInner::validate_json(&value["c"]).map_err(|e| idol::ValidationError(format!("field c: {}", e)))?;

    Ok(())
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TestKind(pub String);

impl idol::ExpandsJson for TestKind {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
    String::expand_json(value)
  }
}

impl idol::ValidatesJson for TestKind {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    String::validate_json(value)
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub struct TestAtleastOne(pub Vec<TestKind>);

impl Default for TestAtleastOne {
  fn default() -> TestAtleastOne {
    TestAtleastOne(vec![TestKind::default()])
  }
}

impl idol::ExpandsJson for TestAtleastOne {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
    if value.is_null() {
      return Some(serde_json::Value::Array(vec![serde_json::value::to_value(TestKind::default()).unwrap()]));
    } if let serde_json::Value::Array(contents) = value {
      if contents.is_empty() {
        contents.push(serde_json::Value::Null);
      }
    } else {
      let inner = TestKind::expand_json(value);
      if inner.is_some() {
        return Some(serde_json::Value::Array(vec![inner.unwrap()]));
      } else {
        return Some(serde_json::Value::Array(vec![value.to_owned()]));
      }
    }

    Vec::<TestKind>::expand_json(value)
  }
}

impl idol::ValidatesJson for TestAtleastOne {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if let serde_json::Value::Array(contents) = value {
      if contents.is_empty() {
        return Err(idol::ValidationError("expected atleast one value, but none was found.".to_string()));
      }
    }

    Vec::<TestKind>::validate_json(value)
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TestMap(pub HashMap<String, TestAtleastOne>);

impl idol::ExpandsJson for TestMap {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
    HashMap::<String, TestAtleastOne>::expand_json(value)
  }
}

impl idol::ValidatesJson for TestMap {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    HashMap::<String, TestAtleastOne>::validate_json(value)
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub struct LiteralHello(String);

impl LiteralHello {
  pub fn val(&self) -> String {
    self.0.to_owned()
  }
}

impl Default for LiteralHello {
  fn default() -> LiteralHello {
    LiteralHello(("hello").to_owned())
  }
}

impl idol::ExpandsJson for LiteralHello {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match LiteralHello::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;

    if value.is_null() || value.is_string() {
      Some(serde_json::Value::from("hello"))
    } else {
      None
    }
  }
}

impl idol::ValidatesJson for LiteralHello {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if &serde_json::Value::from("hello") == value {
      Ok(())
    } else {
      Err(idol::ValidationError(format!("expected literal {} but found {}", "hello", value)))
    }
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub struct LiteralThreeO(f64);

impl LiteralThreeO {
  pub fn val(&self) -> f64 {
    self.0.to_owned()
  }
}

impl Default for LiteralThreeO {
  fn default() -> LiteralThreeO {
    LiteralThreeO((3.0).to_owned())
  }
}

impl idol::ExpandsJson for LiteralThreeO {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match LiteralThreeO::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;

    if value.is_null() || value.is_f64() {
      Some(serde_json::Value::from(3.0))
    } else {
      None
    }
  }
}

impl idol::ValidatesJson for LiteralThreeO {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if &serde_json::Value::from(3.0) == value {
      Ok(())
    } else {
      Err(idol::ValidationError(format!("expected literal {} but found {}", 3.0, value)))
    }
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub struct Literal1(idol::i53);

impl Literal1 {
  pub fn val(&self) -> idol::i53 {
    self.0.to_owned()
  }
}

impl Default for Literal1 {
  fn default() -> Literal1 {
    Literal1((idol::i53(1)).to_owned())
  }
}

impl idol::ExpandsJson for Literal1 {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match Literal1::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;

    if value.is_null() || value.is_i64() {
      Some(serde_json::Value::from(1))
    } else {
      None
    }
  }
}

impl idol::ValidatesJson for Literal1 {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if &serde_json::Value::from(1) == value {
      Ok(())
    } else {
      Err(idol::ValidationError(format!("expected literal {} but found {}", 1, value)))
    }
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub struct LiteralTrue(bool);

impl LiteralTrue {
  pub fn val(&self) -> bool {
    self.0.to_owned()
  }
}

impl Default for LiteralTrue {
  fn default() -> LiteralTrue {
    LiteralTrue((true).to_owned())
  }
}

impl idol::ExpandsJson for LiteralTrue {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match LiteralTrue::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;

    if value.is_null() || value.is_boolean() {
      Some(serde_json::Value::from(true))
    } else {
      None
    }
  }
}

impl idol::ValidatesJson for LiteralTrue {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if &serde_json::Value::from(true) == value {
      Ok(())
    } else {
      Err(idol::ValidationError(format!("expected literal {} but found {}", true, value)))
    }
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone)]
pub struct LiteralFive(i64);

impl LiteralFive {
  pub fn val(&self) -> i64 {
    self.0.to_owned()
  }
}

impl Default for LiteralFive {
  fn default() -> LiteralFive {
    LiteralFive((5).to_owned())
  }
}

impl idol::ExpandsJson for LiteralFive {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match LiteralFive::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;

    if value.is_null() || value.is_i64() {
      Some(serde_json::Value::from(5))
    } else {
      None
    }
  }
}

impl idol::ValidatesJson for LiteralFive {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if &serde_json::Value::from(5) == value {
      Ok(())
    } else {
      Err(idol::ValidationError(format!("expected literal {} but found {}", 5, value)))
    }
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TestLiteralStruct {
  pub r#five: Option<LiteralFive>,
  pub r#four: LiteralTrue,
  pub r#one: Literal1,
  pub r#three: LiteralThreeO,
  pub r#two: LiteralHello,
}

impl idol::ExpandsJson for TestLiteralStruct {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match TestLiteralStruct::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;


    if value.is_null() {
      return Some(serde_json::value::to_value(TestLiteralStruct::default()).unwrap());
    }

    if !value.is_object() {
      return None;
    }

    match Option::<LiteralFive>::expand_json(&mut value["five"]) {
      Some(v) => value["five"] = v,
      None => (),
    }

    match LiteralTrue::expand_json(&mut value["four"]) {
      Some(v) => value["four"] = v,
      None => (),
    }

    match Literal1::expand_json(&mut value["one"]) {
      Some(v) => value["one"] = v,
      None => (),
    }

    match LiteralThreeO::expand_json(&mut value["three"]) {
      Some(v) => value["three"] = v,
      None => (),
    }

    match LiteralHello::expand_json(&mut value["two"]) {
      Some(v) => value["two"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for TestLiteralStruct {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    Option::<LiteralFive>::validate_json(&value["five"]).map_err(|e| idol::ValidationError(format!("field five: {}", e)))?;
    LiteralTrue::validate_json(&value["four"]).map_err(|e| idol::ValidationError(format!("field four: {}", e)))?;
    Literal1::validate_json(&value["one"]).map_err(|e| idol::ValidationError(format!("field one: {}", e)))?;
    LiteralThreeO::validate_json(&value["three"]).map_err(|e| idol::ValidationError(format!("field three: {}", e)))?;
    LiteralHello::validate_json(&value["two"]).map_err(|e| idol::ValidationError(format!("field two: {}", e)))?;

    Ok(())
  }
}

#[derive(PartialEq, Serialize, Deserialize, Debug, Clone, Default)]
pub struct TestListOfListStruct {
  pub r#list_of_list: Vec<TestAtleastOne>,
}

impl idol::ExpandsJson for TestListOfListStruct {
  fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {

    match idol::get_list_scalar(value) {
      Some(mut v) => {
        return match TestListOfListStruct::expand_json(&mut v) {
          Some(v_) => Some(v_),
          None => Some(v),
        }
        ;
      }
      None => (),
    }
    ;


    if value.is_null() {
      return Some(serde_json::value::to_value(TestListOfListStruct::default()).unwrap());
    }

    if !value.is_object() {
      return None;
    }

    match Vec::<TestAtleastOne>::expand_json(&mut value["list_of_list"]) {
      Some(v) => value["list_of_list"] = v,
      None => (),
    }

    None
  }
}

impl idol::ValidatesJson for TestListOfListStruct {
  fn validate_json(value: &serde_json::Value) -> idol::ValidationResult {
    if !value.is_object() {
      return Err(idol::ValidationError(format!("expected an object but found {}", value)));
    }

    Vec::<TestAtleastOne>::validate_json(&value["list_of_list"]).map_err(|e| idol::ValidationError(format!("field list_of_list: {}", e)))?;

    Ok(())
  }
}
