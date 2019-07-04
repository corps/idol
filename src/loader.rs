use crate::models::declarations::*;
use crate::models::idol::{ExpandsJson, ValidatesJson};
use is_executable::IsExecutable;
use std::fmt::Display;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

pub struct Loader {
  include_paths: Vec<String>,
  extensions: Vec<String>,
}

impl Loader {
  pub fn new(include_paths: Vec<String>, extensions: Vec<String>) -> Loader {
    Loader {
      include_paths,
      extensions,
    }
  }
}

pub enum LoadError {
  IoError(String, std::io::Error),
  DeserializationError(String, String),
  ValidationError(String, crate::models::idol::ValidationError),
  ExecutionError(String, i32),
}

impl Display for LoadError {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
    (match self {
      LoadError::IoError(m, err) => write!(f, "IO error while loading module {}: {}", m, err),
      LoadError::DeserializationError(m, err) => {
        write!(f, "Error while deserializing from module {}: {}", m, err)
      }
      LoadError::ExecutionError(m, code) => write!(
        f,
        "Error code {} returned when executing module {}",
        code, m
      ),
      LoadError::ValidationError(m, err) => write!(
        f,
        "input was not a valid ModuleDec for module {}: {}",
        m, err
      ),
    })
  }
}

impl Loader {
  pub fn module_name_from_filename<P>(p: P) -> String
  where
    P: AsRef<Path>,
  {
    let path: &Path = p.as_ref();
    return String::from(path.file_stem().unwrap().to_string_lossy());
  }

  fn try_toml_or_json(&self, path: &str, data: &[u8]) -> Result<serde_json::Value, LoadError> {
    serde_json::from_slice(data)
      .map_err(|e| format!("json parse error: {}", e))
      .or_else(|first_err| {
        toml::from_slice(data).map_err(|e| format!("{}, toml parse error: {}", first_err, e))
      })
      .map_err(|err_message| LoadError::DeserializationError(path.to_owned(), err_message))
  }

  pub fn load_module(&self, module_name: &String) -> Result<Option<serde_json::Value>, LoadError> {
    for include_root in self.include_paths.iter() {
      let mut path_buf = PathBuf::from(include_root);
      for ext in self.extensions.iter() {
        path_buf.push(format!("{}.{}", module_name, ext));
        let path = path_buf.as_path();

        let is_executable = path.is_executable();

        let file = std::fs::File::open(path);
        if file.is_err() {
          path_buf.pop();
          continue;
        }

        let mut file = file.unwrap();
        let mut data: Vec<u8> = vec![];
        let path = path.to_str().unwrap();

        file
          .read_to_end(&mut data)
          .map_err(|e| LoadError::IoError(path.to_owned(), e))?;

        let mut value: Result<serde_json::Value, LoadError> =
          self.try_toml_or_json(path, data.as_slice());
        if value.is_err() && is_executable {
          let output = Command::new(path)
            .stderr(Stdio::inherit())
            .output()
            .map_err(|e| LoadError::IoError(path.to_owned(), e))?;

          if !output.status.success() {
            return Err(LoadError::ExecutionError(
              path.to_owned(),
              output.status.code().unwrap_or(1),
            ));
          }

          value = self.try_toml_or_json(path, output.stdout.as_slice());
        }

        let value = value.and_then(|mut v| match ModuleDec::expand_json(&mut v) {
          Some(v) => Ok(v),
          None => Ok(v),
        });

        let value = value?;

        ModuleDec::validate_json(&value)
          .map_err(|e| LoadError::ValidationError(path.to_owned(), e))?;

        return Ok(Some(value));
      }
    }

    return Ok(None);
  }
}
