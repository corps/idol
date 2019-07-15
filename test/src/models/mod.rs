pub mod all;
pub mod tests;

pub mod idol {
  use serde::{Deserialize, Serialize};
  use std::collections::HashMap;
  use std::fmt;

  #[derive(PartialEq, Debug, Serialize, Deserialize, Default, Eq, Clone)]
  pub struct i53(pub i64);
  pub struct ValidationError(pub String);
  pub type ValidationResult = Result<(), ValidationError>;

  pub fn get_list_scalar(value: &serde_json::Value) -> Option<serde_json::Value> {
    if let serde_json::Value::Array(array) = value {
      let mut value = Some(value);
      while let Some(serde_json::Value::Array(array)) = value {
        value = array.get(0).or(Some(&serde_json::Value::Null));
      }

      return value.cloned();
    }

    None
  }

  impl fmt::Display for ValidationError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
  }

  pub trait ExpandsJson {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value>;
  }

  pub trait ValidatesJson {
    fn validate_json(value: &serde_json::Value) -> ValidationResult;
  }

  impl<T> ExpandsJson for Option<T>
  where
    T: ExpandsJson,
  {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
      match get_list_scalar(value) {
        Some(mut v) => {
          return match Option::<T>::expand_json(&mut v) {
            Some(v_) => Some(v_),
            None => Some(v),
          };
        }
        None => (),
      };

      if value.is_null() {
        return Some(serde_json::Value::Null);
      }

      T::expand_json(value)
    }
  }

  impl<T> ValidatesJson for Option<T>
  where
    T: ValidatesJson,
  {
    fn validate_json(value: &serde_json::Value) -> ValidationResult {
      if value.is_null() {
        return Ok(());
      }

      T::validate_json(value)
    }
  }

  impl<T> ExpandsJson for Vec<T>
  where
    T: ExpandsJson,
  {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
      if value.is_null() {
        return Some(serde_json::Value::Array(vec![]));
      }

      if let serde_json::Value::Array(contents) = value {
        for i in 0..(contents.len()) {
          if let Some(replacement) = T::expand_json(contents.get_mut(i).unwrap()) {
            contents[i] = replacement;
          }
        }
      } else {
        if let Some(inner) = T::expand_json(value) {
          return Some(serde_json::Value::Array(vec![inner]));;
        } else {
          return Some(serde_json::Value::Array(vec![value.to_owned()]));;
        }
      }

      None
    }
  }

  impl<T> ExpandsJson for HashMap<String, T>
  where
    T: ExpandsJson,
  {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
      match get_list_scalar(value) {
        Some(mut v) => {
          return match HashMap::<String, T>::expand_json(&mut v) {
            Some(v_) => Some(v_),
            None => Some(v),
          };
        }
        None => (),
      };

      if value.is_null() {
        return Some(serde_json::Value::Object(serde_json::Map::new()));
      }

      if let serde_json::Value::Object(contents) = value {
        for k in contents.keys().cloned().collect::<Vec<String>>() {
          if let Some(replacement) = T::expand_json(contents.get_mut(&k).unwrap()) {
            contents[&k] = replacement;
          }
        }
      }

      None
    }
  }

  impl ExpandsJson for i64 {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
      match get_list_scalar(value) {
        Some(mut v) => {
          return match i64::expand_json(&mut v) {
            Some(v_) => Some(v_),
            None => Some(v),
          };
        }
        None => (),
      };

      match value {
        serde_json::Value::Null => serde_json::to_value(0).ok(),
        _ => None,
      }
    }
  }

  impl ExpandsJson for String {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
      match get_list_scalar(value) {
        Some(mut v) => {
          return match String::expand_json(&mut v) {
            Some(v_) => Some(v_),
            None => Some(v),
          };
        }
        None => (),
      };

      match value {
        serde_json::Value::Null => serde_json::to_value("").ok(),
        _ => None,
      }
    }
  }

  impl ExpandsJson for bool {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
      match get_list_scalar(value) {
        Some(mut v) => {
          return match bool::expand_json(&mut v) {
            Some(v_) => Some(v_),
            None => Some(v),
          };
        }
        None => (),
      };

      match value {
        serde_json::Value::Null => serde_json::to_value(false).ok(),
        _ => None,
      }
    }
  }

  impl ExpandsJson for f64 {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
      match get_list_scalar(value) {
        Some(mut v) => {
          return match f64::expand_json(&mut v) {
            Some(v_) => Some(v_),
            None => Some(v),
          };
        }
        None => (),
      };

      match value {
        serde_json::Value::Null => serde_json::to_value(0.0).ok(),
        _ => None,
      }
    }
  }

  impl ExpandsJson for i53 {
    fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value> {
      match get_list_scalar(value) {
        Some(mut v) => {
          return match i53::expand_json(&mut v) {
            Some(v_) => Some(v_),
            None => Some(v),
          };
        }
        None => (),
      };

      match value {
        serde_json::Value::Null => serde_json::to_value(0).ok(),
        _ => None,
      }
    }
  }

  impl ValidatesJson for i53 {
    fn validate_json(value: &serde_json::Value) -> ValidationResult {
      let mut number: Option<Result<i64, ValidationError>> = None;

      if let serde_json::Value::String(s) = value {
        number = Some(
          s.parse::<i64>()
            .map_err(|_| ValidationError("value was not a properly formatted i64.".to_string())),
        );
      }

      if let serde_json::Value::Number(n) = value {
        if n.is_i64() {
          number = Some(serde_json::from_value(value.to_owned()).map_err(|_| unreachable!()));
        };
      }

      match number {
        Some(Ok(i)) => {
          if i > 9007199254740991 {
            Err(ValidationError("value is too large for i53".to_string()))
          } else if i < -9007199254740991 {
            Err(ValidationError("value is too small for i53".to_string()))
          } else {
            Ok(())
          }
        }
        Some(Err(e)) => Err(e),
        None => Err(ValidationError(format!(
          "value was expected to be a ii53, but found {}",
          value
        ))),
      }
    }
  }

  impl ValidatesJson for i64 {
    fn validate_json(value: &serde_json::Value) -> ValidationResult {
      if let serde_json::Value::String(s) = value {
        return s
          .parse::<i64>()
          .map(|_| ())
          .map_err(|_| ValidationError("value was not a properly formatted i64.".to_string()));
      }

      if value.is_i64() {
        Ok(())
      } else {
        Err(ValidationError(format!(
          "value was expected to be a i64, but found {}",
          value
        )))
      }
    }
  }

  impl ValidatesJson for String {
    fn validate_json(value: &serde_json::Value) -> ValidationResult {
      match value {
        serde_json::Value::String(_) => Ok(()),
        _ => Err(ValidationError(format!(
          "value was expected to be a string, but found {}",
          value
        ))),
      }
    }
  }

  impl ValidatesJson for bool {
    fn validate_json(value: &serde_json::Value) -> ValidationResult {
      match value {
        serde_json::Value::Bool(_) => Ok(()),
        _ => Err(ValidationError(format!(
          "value was expected to be a bool, but found {}",
          value
        ))),
      }
    }
  }

  impl ValidatesJson for f64 {
    fn validate_json(value: &serde_json::Value) -> ValidationResult {
      if value.is_f64() || value.is_i64() {
        Ok(())
      } else {
        Err(ValidationError(format!(
          "value was expected to be an double, but found {}",
          value
        )))
      }
    }
  }

  impl<T> ValidatesJson for Vec<T>
  where
    T: ValidatesJson,
  {
    fn validate_json(value: &serde_json::Value) -> ValidationResult {
      if let serde_json::Value::Array(contents) = value {
        for (i, element) in contents.iter().enumerate() {
          T::validate_json(element).map_err(|s| ValidationError(format!("index {}: {}", i, s)))?;
        }

        Ok(())
      } else {
        Err(ValidationError(format!(
          "value was expected to be an array, but found {}",
          value
        )))
      }
    }
  }

  impl<T> ValidatesJson for HashMap<String, T>
  where
    T: ValidatesJson,
  {
    fn validate_json(value: &serde_json::Value) -> ValidationResult {
      if let serde_json::Value::Object(contents) = value {
        for entry in contents.iter() {
          T::validate_json(entry.1).map_err(|s| ValidationError(format!("field {}: {}", entry.0, s)))?;
        }

        Ok(())
      } else {
        Err(ValidationError(format!(
          "value was expected to be an object, but found {}",
          value
        )))
      }
    }
  }
}
