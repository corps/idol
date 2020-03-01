use crate::models::declarations::{IncludesDec, ModuleIncludes};
use crate::models::idol::{ValidatesJson, ValidationError};
use crate::models::loaded::{Comments, LoadedModule, ModuleComments, TypeComments};
use is_executable::IsExecutable;
use regex::Regex;
use std::fmt::Display;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

pub struct ModuleFileLoader {
    include_paths: Vec<String>,
    extensions: Vec<String>,
}

impl ModuleFileLoader {
    pub fn new(include_paths: Vec<String>, extensions: Vec<String>) -> ModuleFileLoader {
        ModuleFileLoader {
            include_paths,
            extensions,
        }
    }
}

pub enum LoadError {
    IoError(String, std::io::Error),
    DeserializationError(String, String),
    ValidationError(String, ValidationError),
    ExecutionError(String, i32),
    CouldNotFindError(String),
}

impl Display for LoadError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        (match self {
            LoadError::IoError(m, err) => write!(f, "IO error while loading module {}: {}", m, err),
            LoadError::DeserializationError(m, err) => {
                write!(f, "Error while deserializing module {}: {}", m, err)
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

impl ModuleFileLoader {
    pub fn load_module(&self, module_name: &str) -> Result<LoadedModule, LoadError> {
        let mut result = LoadedModule::default();
        let (mut source, module_comments) = self.load_module_source_from_name(module_name)?;
        let module_includes = parse_includes(&mut source)
            .map_err(|ve| LoadError::ValidationError(format!("{}.includes", module_name), ve))?;

        result.includes = module_includes;
        result.comments = module_comments;
        result.module_name = module_name.to_owned();
        result.declaration = serde_json::from_value(source).map_err(|e| {
            LoadError::DeserializationError(module_name.to_owned(), format!("{}", e))
        })?;

        Ok(result)
    }

    fn load_module_source_from_name(
        &self,
        module_name: &str,
    ) -> Result<(serde_json::Value, ModuleComments), LoadError> {
        let mut checked_files: Vec<String> = vec![];

        for include_root in self.include_paths.iter() {
            let mut path_buf = PathBuf::from(include_root);
            for ext in self.extensions.iter() {
                path_buf.push(format!("{}.{}", module_name, ext));
                let path = path_buf.as_path();

                match self.load_module_source_from_path(path) {
                    Ok(result) => {
                        return Ok(result);
                    }
                    Err(LoadError::CouldNotFindError(path)) => {
                        checked_files.push(path);
                    }
                    Err(e) => {
                        return Err(e);
                    }
                }
            }
        }

        Err(LoadError::CouldNotFindError(format!(
            "Could not find module {}, checked files {}",
            module_name,
            checked_files.join(", ")
        )))
    }

    fn load_module_source_from_path(
        &self,
        path: &Path,
    ) -> Result<(serde_json::Value, ModuleComments), LoadError> {
        let is_executable = path.is_executable();
        let mut file = std::fs::File::open(path)
            .map_err(|_| LoadError::CouldNotFindError(path.to_string_lossy().to_string()))?;

        let mut data = Vec::new();
        file.read_to_end(&mut data)
            .map_err(|e| LoadError::IoError(path.to_string_lossy().to_string(), e))?;

        try_deserialize(path, data.as_slice()).or_else(|orig_err| {
            // If the path is executable, but not parse-able as is, we then run the program and take
            // its output as the potential input source file.
            if !is_executable {
                return Err(orig_err);
            }

            let output = Command::new(path)
                .stderr(Stdio::inherit())
                .output()
                .map_err(|e| LoadError::IoError(path.to_string_lossy().to_string(), e))?;

            if !output.status.success() {
                return Err(LoadError::ExecutionError(
                    path.to_string_lossy().to_string(),
                    output.status.code().unwrap_or(1),
                ));
            }

            try_deserialize(path, output.stdout.as_slice())
        })
    }
}

fn parse_includes(source: &mut serde_json::Value) -> Result<ModuleIncludes, ValidationError> {
    if source
        .as_object()
        .map(|o| o.contains_key("includes"))
        .unwrap_or(false)
    {
        IncludesDec::validate_json(source)?;
        return Ok(serde_json::from_value(
            source.as_object_mut().unwrap().remove("includes").unwrap(),
        )
        .unwrap());
    }

    Ok(ModuleIncludes::default())
}

fn try_deserialize(
    path: &Path,
    data_bytes: &[u8],
) -> Result<(serde_json::Value, ModuleComments), LoadError> {
    try_json(data_bytes)
        .or_else(|e| try_toml(data_bytes).map_err(|e2| format!("{}, {}", e, e2)))
        .map_err(|err_str| {
            LoadError::DeserializationError(path.to_string_lossy().to_string(), err_str)
        })
}

fn try_json(data_bytes: &[u8]) -> Result<(serde_json::Value, ModuleComments), String> {
    serde_json::from_slice(data_bytes)
        .map_err(|e| format!("json parse error: {}", e))
        .map(|v| (v, ModuleComments::default()))
}

fn try_toml(data_bytes: &[u8]) -> Result<(serde_json::Value, ModuleComments), String> {
    toml::from_slice(data_bytes)
        .map_err(|e| format!("toml parse error: {}", e))
        .map(|v| {
            (
                v,
                find_toml_description_comments(std::str::from_utf8(data_bytes).unwrap()),
            )
        })
}

// Would be great if toml parsers handled this themselves.
// For now, we use some regexes to parse out comments made on type and field levels,
// but it is not perfect.
fn find_toml_description_comments(data: &str) -> ModuleComments {
    lazy_static! {
        static ref COMMENT_REGEX: Regex = Regex::new(r"^\s*#\s*(.*)$").unwrap();
        static ref TABLE_REGEX: Regex = Regex::new(r"^\s*\[\s*([^\s\.]*)([^\s]*)\s*\].*$").unwrap();
        static ref ASSIGNMENT_REGEX: Regex = Regex::new(r"^\s*([^\s=]*)\s*=.*").unwrap();
        static ref EMPTY_LINE_REGEX: Regex = Regex::new(r"^\s*$").unwrap();
    }

    let mut comments = ModuleComments::default();
    let mut cur_comments: Vec<String> = Vec::new();
    let mut last_type_comments = &mut TypeComments::default();

    for line in data.split('\n') {
        let m: &str = line.trim();

        if let Some(captures) = COMMENT_REGEX.captures(m) {
            cur_comments.push(captures.get(1).unwrap().as_str().to_string());
        } else if let Some(captures) = TABLE_REGEX.captures(m) {
            let type_name = captures.get(1).unwrap().as_str().to_owned();

            if type_name.len() > 0 {
                let type_comments = comments
                    .0
                    .entry(type_name)
                    .or_insert_with(|| TypeComments::default());

                type_comments.type_comments.0.append(&mut cur_comments);
                last_type_comments = type_comments;
            }

            cur_comments = vec![];
        } else if let Some(captures) = ASSIGNMENT_REGEX.captures(m) {
            let field_name = captures.get(1).unwrap().as_str().to_string();

            last_type_comments
                .field_comments
                .entry(field_name)
                .or_insert_with(|| Comments::default())
                .0
                .append(&mut cur_comments);
            cur_comments = vec![];
        } else if EMPTY_LINE_REGEX.captures(m).is_none() {
            cur_comments = vec![];
        }
    }

    comments
}
