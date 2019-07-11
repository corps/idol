extern crate libtest;

use serde_json;
use std::io;

use libtest::models::all::required::Assembled;
use libtest::models::idol::ExpandsJson;

fn main() -> Result<(), i32> {
  let mut value: serde_json::Value =
    serde_json::from_reader(io::stdin()).expect("Invalid json input");

  let expanded = Assembled::expand_json(&mut value);
  let expanded = match expanded {
    Some(new) => new,
    None => value,
  };

  println!("{}", serde_json::to_string_pretty(&expanded).expect(""));
  Ok(())
}
