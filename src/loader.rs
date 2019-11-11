use crate::models::declarations::*;
use crate::models::idol::{ExpandsJson, ValidatesJson};
use is_executable::IsExecutable;
use regex::Regex;
use std::collections::HashMap;
use std::fmt::Display;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::str;

pub struct Loader {
    include_paths: Vec<String>,
    extensions: Vec<String>,
}

pub trait LoadsModules {
    fn load_module(&self, module_name: &String) -> Result<ModuleDec, LoadError>;
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
    CouldNotFindError(String),
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
            LoadError::CouldNotFindError(m) => {
                write!(f, "Could not find module {} in search directories", m)
            }
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

    fn find_description_comments(data: &str, comments: &mut HashMap<String, Vec<String>>) {
        lazy_static! {
            static ref COMMENT_REGEX: Regex = Regex::new(r"^\s*#\s*(.*)$").unwrap();
            static ref TABLE_REGEX: Regex = Regex::new(r"^\s*\[\s*([^\s]*)\s*\].*$").unwrap();
            static ref ASSIGNMENT_REGEX: Regex = Regex::new(r"^\s*([^\s=]*)\s*=.*").unwrap();
            static ref EMPTY_LINE_REGEX: Regex = Regex::new(r"^\s*$").unwrap();
        }

        let mut cur_comments: Vec<String> = vec![];
        let mut last_key: String = "".to_string();
        for line in data.split('\n') {
            let m: &str = line.trim();

            if let Some(captures) = COMMENT_REGEX.captures(m) {
                cur_comments.push(captures.get(1).unwrap().as_str().to_string());
            } else if let Some(captures) = TABLE_REGEX.captures(m) {
                last_key = captures.get(1).unwrap().as_str().to_string();
                if cur_comments.len() > 0 {
                    comments.insert(last_key.to_owned(), cur_comments.to_owned());
                    cur_comments = vec![];
                }
            } else if let Some(captures) = ASSIGNMENT_REGEX.captures(m) {
                let subkey = captures.get(1).unwrap().as_str().to_string();
                if cur_comments.len() > 0 {
                    comments.insert(format!("{}.{}", last_key, subkey), cur_comments.to_owned());
                    cur_comments = vec![];
                }
            } else if EMPTY_LINE_REGEX.captures(m).is_none() {
                if cur_comments.len() > 0 {
                    cur_comments = vec![];
                }
            }
        }
    }

    fn apply_description_comments(
        comments: &HashMap<String, Vec<String>>,
        module_dec: &mut ModuleDec,
    ) {
        for (type_name, t) in module_dec.0.iter_mut() {
            if let Some(description_comments) = comments
                .get(type_name)
                .or_else(|| comments.get(&format!("{}.fields", type_name).to_string()))
            {
                t.tags = t
                    .tags
                    .to_owned()
                    .into_iter()
                    .chain(
                        description_comments
                            .iter()
                            .map(|c| format!("description:{}", c)),
                    )
                    .collect();
            }

            if t.fields.is_some() {
                for (field_name, field) in t.fields.as_mut().unwrap().iter_mut() {
                    if let Some(description_comments) =
                        comments.get(&format!("{}.fields.{}", type_name, field_name))
                    {
                        field.0 = field
                            .0
                            .to_owned()
                            .into_iter()
                            .chain(
                                description_comments
                                    .iter()
                                    .map(|c| format!("description:{}", c)),
                            )
                            .collect();
                    }
                }
            }
        }
    }

    fn try_toml_or_json(
        &self,
        path: &str,
        data_bytes: &[u8],
        comments: &mut HashMap<String, Vec<String>>,
    ) -> Result<serde_json::Value, LoadError> {
        serde_json::from_slice(data_bytes)
            .map_err(|e| format!("json parse error: {}", e))
            .or_else(|first_err| {
                toml::from_slice(data_bytes)
                    .map_err(|e| format!("{}, toml parse error: {}", first_err, e))
                    .map(|r| {
                        Loader::find_description_comments(
                            str::from_utf8(data_bytes).unwrap(),
                            comments,
                        );
                        r
                    })
            })
            .map_err(|err_message| LoadError::DeserializationError(path.to_owned(), err_message))
    }
}

impl LoadsModules for Loader {
    fn load_module(&self, module_name: &String) -> Result<ModuleDec, LoadError> {
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

                file.read_to_end(&mut data)
                    .map_err(|e| LoadError::IoError(path.to_owned(), e))?;

                let mut comments: HashMap<String, Vec<String>> = HashMap::new();
                let mut value: Result<serde_json::Value, LoadError> =
                    self.try_toml_or_json(path, data.as_slice(), &mut comments);

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

                    value = self.try_toml_or_json(path, output.stdout.as_slice(), &mut comments);
                }

                let value = value.and_then(|mut v| match ModuleDec::expand_json(&mut v) {
                    Some(v) => Ok(v),
                    None => Ok(v),
                });

                let value = value?;

                ModuleDec::validate_json(&value)
                    .map_err(|e| LoadError::ValidationError(path.to_owned(), e))?;

                let mut value: ModuleDec = serde_json::from_value(value).map_err(|e| {
                    LoadError::DeserializationError(path.to_owned(), format!("{}", e))
                })?;

                Loader::apply_description_comments(&comments, &mut value);

                return Ok(value);
            }
        }

        return Err(LoadError::CouldNotFindError(module_name.to_owned()));
    }
}
