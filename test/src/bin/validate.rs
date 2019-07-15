extern crate libtest;

use serde_json;
use std::io;

use libtest::models::all::optional::Assembled;
use libtest::models::idol::ValidatesJson;

fn main() -> Result<(), i32> {
  let value: serde_json::Value = serde_json::from_reader(io::stdin()).expect("Invalid json input");

  let result = Assembled::validate_json(&value);
  match result {
    Ok(_) => Ok(()),
    Err(libtest::models::idol::ValidationError(e)) => {
      eprintln!("{}", e);
      Err(1)
    }
  }
}
