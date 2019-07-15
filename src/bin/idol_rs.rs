extern crate fs_extra;
extern crate idol;
extern crate serde_json;
extern crate structopt;

use crate::structopt::StructOpt;
use fs_extra::copy_items;
use fs_extra::dir::CopyOptions;
use idol::registry::*;
use idol::schema::*;
use std::collections::HashMap;
use std::fs;
use std::io;
use std::io::Write;
use std::path::PathBuf;
use tempdir::TempDir;

#[derive(StructOpt)]
#[structopt(name = "idol_rs")]
struct Opt {
  /// Directory to output the generated rust files.
  #[structopt(long = "output", short = "o")]
  output_dir: String,
  /// Module path (use path) used to cross reference idol modules
  #[structopt(long = "mod", short = "m")]
  module: String,
  input_file: Option<String>,
}

type BResult = Result<(), std::io::Error>;

fn main() -> Result<(), i32> {
  let opt = Opt::from_args();

  let input: Box<io::Read> = if opt.input_file.is_none() {
    Box::new(io::stdin())
  } else {
    Box::new(
      fs::File::open(opt.input_file.unwrap().to_owned()).map_err(|e| {
        eprintln!("Problem reading file: {}", e);
        1
      })?,
    )
  };

  let modules: HashMap<String, Module> = serde_json::from_reader(input).map_err(|e| {
    eprintln!("Problem parsing schema registry json: {}", e);
    1
  })?;

  let registry = SchemaRegistry::from_modules(modules);

  let build_env = BuildEnv::new(opt.module);
  for entry in registry.modules.iter() {
    build_env.build_module(entry.1).map_err(|e| {
      eprintln!("Problem building rust file: {}", e);
      1
    })?;
  }

  build_env
    .finalize(PathBuf::from(opt.output_dir))
    .map_err(|e| {
      eprintln!("Problem copying build files into place: {}", e);
      1
    })?;

  return Ok(());
}

struct BuildEnv {
  build_dir: TempDir,
  root_rust_module: String,
}

impl BuildEnv {
  pub fn new(root_rust_module: String) -> BuildEnv {
    BuildEnv {
      build_dir: TempDir::new("idol_rs").unwrap(),
      root_rust_module,
    }
  }

  pub fn build_module(&self, module: &Module) -> BResult {
    let mut mbe = ModuleBuildEnv::new(self, &module.module_name);
    mbe.gen_module(module)
  }

  pub fn finalize(&self, output_dir: PathBuf) -> Result<(), fs_extra::error::Error> {
    self.finalize_mod_rs_files()?;

    let options = CopyOptions {
      overwrite: true,
      copy_inside: true,
      ..CopyOptions::new()
    };

    copy_items(
      &self
        .build_dir
        .path()
        .read_dir()?
        .map(|e| e.unwrap().path())
        .collect(),
      output_dir,
      &options,
    )?;

    Ok(())
  }

  fn finalize_mod_rs_files(&self) -> BResult {
    let root_path = PathBuf::from(self.build_dir.path());
    self._finalize_mod_rs_files(&root_path, true)
  }

  fn _finalize_mod_rs_files(&self, path: &PathBuf, is_root: bool) -> BResult {
    let (dirs, mut files): (Vec<(PathBuf, fs::FileType)>, Vec<(PathBuf, fs::FileType)>) = path
      .read_dir()?
      .filter_map(|e| e.ok())
      .filter_map(|e| e.file_type().ok().map(|ft| (e.path(), ft)))
      .partition(|(_, ft)| ft.is_dir());

    files.sort_by(|f1, f2| f1.0.to_string_lossy().cmp(&f2.0.to_string_lossy()));

    let mut file = fs::File::create(path.join("mod.rs"))?;

    for (mod_dir, _) in dirs.iter() {
      write!(
        file,
        "pub mod {};\n",
        String::from(mod_dir.file_stem().unwrap().to_string_lossy())
      )?;
    }

    for (mod_file, _) in files.iter() {
      write!(
        file,
        "pub mod {};\n",
        String::from(mod_file.file_stem().unwrap().to_string_lossy())
      )?;
    }

    if is_root {
      write!(file, "{}", root_mod_extras)?;
    }

    for (subdir, _) in dirs.iter() {
      self._finalize_mod_rs_files(subdir, false)?;
    }

    Ok(())
  }
}

struct ModuleBuildEnv<'a> {
  pub module_file: Box<std::io::Write>,
  build_env: &'a BuildEnv,
  idol_module_name: String,
  indention_level: usize,
}

impl<'a> ModuleBuildEnv<'a> {
  pub fn new(build_env: &'a BuildEnv, idol_module_name: &str) -> ModuleBuildEnv<'a> {
    let module_path = ModuleBuildEnv::to_module_path(idol_module_name);
    let module_build_path = build_env.build_dir.path().join(module_path);

    fs::DirBuilder::new()
      .recursive(true)
      .create(module_build_path.parent().unwrap())
      .unwrap();

    ModuleBuildEnv {
      module_file: Box::new(fs::File::create(module_build_path).unwrap()),
      build_env,
      idol_module_name: idol_module_name.to_owned(),
      indention_level: 0,
    }
  }

  fn write_nl(&mut self) -> BResult {
    write!(self.module_file, "\n")
  }

  fn write<S>(&mut self, line: S) -> BResult
  where
    S: std::fmt::Display,
  {
    let i = indentions[self.indention_level];
    write!(self.module_file, "{}{}\n", i, line)
  }

  fn start_block<S>(&mut self, line: S) -> BResult
  where
    S: std::fmt::Display,
  {
    let i = indentions[self.indention_level];
    write!(self.module_file, "{}{} {{\n", i, line)?;
    self.indention_level += 1;
    Ok(())
  }

  fn branch_block<S>(&mut self, line: S) -> BResult
  where
    S: std::fmt::Display,
  {
    let i = indentions[self.indention_level - 1];
    write!(self.module_file, "{}}} {} {{\n", i, line)
  }

  fn end_block(&mut self) -> BResult {
    self.indention_level -= 1;
    let i = indentions[self.indention_level];
    write!(self.module_file, "{}}}\n", i)?;
    Ok(())
  }

  pub fn gen_module(&mut self, module: &Module) -> BResult {
    self.write("use serde::{Deserialize, Serialize};")?;
    self.write("use std::collections::HashMap;")?;
    self.write(format!("use {}::idol;", self.build_env.root_rust_module))?;
    self.write("use std::convert::TryFrom;")?;

    for type_name in module.types_dependency_ordering.iter() {
      if let Some(t) = module.types_by_name.get(type_name) {
        self.write_nl()?;
        self.write(format!("#[derive({})]", t.derives().join(", ")))?;
        self.gen_type_dec(t)?;

        if let Some(type_struct) = &t.is_a {
          match type_struct.struct_kind {
            StructKind::Scalar => {
              if type_struct.is_literal {
                self.gen_literal_impls(t, type_struct)?;
              } else {
                self.gen_scalar_impls(t, type_struct)?;
              }
            }
            StructKind::Repeated => {
              if t.is_atleast_one_type() {
                self.gen_atleast_one_impls(t, type_struct)?;
              } else {
                self.gen_repeated_impls(t, type_struct)?;
              }
            }
            StructKind::Map => {
              self.gen_map_impls(t, type_struct)?;
            }
          }
        } else if !t.fields.is_empty() {
          self.gen_struct_impls(t)?;
        } else if t.options.len() > 0 {
          self.gen_enum_impls(t)?;
        }
      }
    }

    Ok(())
  }

  fn gen_struct_impls(&mut self, t: &Type) -> BResult {
    self.write_nl()?;
    self.start_block(format!("impl idol::ExpandsJson for {}", t.type_name))?;
    self
      .start_block("fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value>")?;

    self.gen_get_scalar(&t.type_name)?;
    self.write_nl()?;
    self.start_block(format!("if !value.is_object()"))?;
    self.write(format!(
      "return Some(serde_json::value::to_value({}::default()).unwrap());",
      t.type_name
    ))?;
    self.end_block()?;

    let mut field_names = t.fields.keys().cloned().collect::<Vec<String>>();
    field_names.sort();

    for field_name in field_names.iter() {
      let field = t.fields.get(field_name).unwrap();
      let field_type_root =
        field.display_type_root(&self.build_env.root_rust_module, &self.idol_module_name);

      self.write_nl()?;
      self.start_block(format!(
        "match {}::expand_json(&mut value[\"{}\"])",
        field_type_root, field_name
      ))?;
      self.write(format!("Some(v) => value[\"{}\"] = v,", field_name))?;
      self.write("None => (),")?;
      self.end_block()?;
    }

    self.write_nl()?;
    self.write("None")?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl idol::ValidatesJson for {}", t.type_name))?;
    self.start_block("fn validate_json(value: &serde_json::Value) -> idol::ValidationResult")?;

    self.start_block(format!("if !value.is_object()"))?;
    self.write(
      "return Err(idol::ValidationError(format!(\"expected an object but found {}\", value)));",
    )?;
    self.end_block()?;
    self.write_nl()?;

    for field_name in field_names.iter() {
      let field = t.fields.get(field_name).unwrap();
      let field_type_root =
        field.display_type_root(&self.build_env.root_rust_module, &self.idol_module_name);

      self.write(format!(
        "{}::validate_json(&value[\"{}\"]).map_err(|e| {})?;",
        field_type_root,
        field_name,
        format!(
          "idol::ValidationError(format!(\"field {}: {{}}\", e))",
          field_name
        )
      ))?;
    }

    self.write_nl()?;
    self.write("Ok(())")?;
    self.end_block()?;
    self.end_block()?;

    Ok(())
  }

  fn gen_scalar_impls(&mut self, t: &Type, type_struct: &TypeStruct) -> BResult {
    let scalar_type =
      type_struct.display_scalar_type(&self.build_env.root_rust_module, &self.idol_module_name);

    self.write_nl()?;
    self.start_block(format!("impl idol::ExpandsJson for {}", t.type_name))?;
    self
      .start_block("fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value>")?;
    self.write(format!("{}::expand_json(value)", scalar_type))?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl idol::ValidatesJson for {}", t.type_name))?;
    self.start_block("fn validate_json(value: &serde_json::Value) -> idol::ValidationResult")?;
    self.write(format!("{}::validate_json(value)", scalar_type))?;
    self.end_block()?;
    self.end_block()?;
    Ok(())
  }

  fn gen_get_scalar(&mut self, type_root: &String) -> BResult {
    self.write_nl()?;
    self.start_block("match idol::get_list_scalar(value)".to_string())?;
    self.start_block("Some(mut v) =>".to_string())?;
    self.start_block(format!("return match {}::expand_json(&mut v)", type_root))?;
    self.write("Some(v_) => Some(v_),".to_string())?;
    self.write("None => Some(v),".to_string())?;
    self.end_block()?;
    self.write(";".to_string())?;
    self.end_block()?;
    self.write("None => (),".to_string())?;
    self.end_block()?;
    self.write(";".to_string())?;
    self.write_nl()?;
    Ok(())
  }

  fn gen_literal_impls(&mut self, t: &Type, type_struct: &TypeStruct) -> BResult {
    let scalar_type =
      type_struct.display_scalar_type(&self.build_env.root_rust_module, &self.idol_module_name);

    self.write_nl()?;
    self.start_block(format!("impl {}", t.type_name))?;
    self.start_block(format!("pub fn val(&self) -> {}", scalar_type))?;
    self.write("self.0.to_owned()")?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl Default for {}", t.type_name))?;
    self.start_block(format!("fn default() -> {}", t.type_name))?;

    let literal_wrapper = type_struct.literal_value();
    if type_struct.primitive_type == PrimitiveType::int53 {
      literal_wrapper = format!()
    }

    self.write(format!("{}(({}).to_owned())", t.type_name, literal_wrapper))?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl idol::ExpandsJson for {}", t.type_name))?;
    self
      .start_block("fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value>")?;
    self.gen_get_scalar(
      &type_struct.display_type_root(&self.build_env.root_rust_module, &self.idol_module_name),
    )?;

    match type_struct.primitive_type {
      PrimitiveType::bool => {
        self.start_block(format!("if value.is_null() || value.is_boolean()"))?
      }
      PrimitiveType::double => {
        self.start_block(format!("if value.is_null() || value.is_boolean()"))?
      }
      PrimitiveType::int53 => self.start_block(format!("if value.is_null() || value.is_i64()"))?,
      PrimitiveType::int64 => self.start_block(format!("if value.is_null() || value.is_i64()"))?,
      PrimitiveType::string => {
        self.start_block(format!("if value.is_null() || value.is_string()"))?
      }
      PrimitiveType::any => (),
    };

    self.write(format!(
      "Some(serde_json::Value::from({}))",
      type_struct.literal_value()
    ))?;

    self.branch_block("else".to_string())?;
    self.write("None".to_string())?;
    self.end_block()?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl idol::ValidatesJson for {}", t.type_name))?;
    self.start_block("fn validate_json(value: &serde_json::Value) -> idol::ValidationResult")?;

    self.start_block(format!(
      "if &serde_json::Value::from({}) == value",
      type_struct.literal_value()
    ))?;
    self.write("Ok(())")?;
    self.branch_block("else")?;
    self.write(format!(
      "Err(idol::ValidationError(format!(\"expected literal {{}} but found {{}}\", {}, value)))",
      type_struct.literal_value()
    ))?;
    self.end_block()?;
    self.end_block()?;
    self.end_block()?;
    Ok(())
  }

  fn gen_map_impls(&mut self, t: &Type, type_struct: &TypeStruct) -> BResult {
    let scalar_type =
      type_struct.display_scalar_type(&self.build_env.root_rust_module, &self.idol_module_name);

    self.write_nl()?;
    self.start_block(format!("impl idol::ExpandsJson for {}", t.type_name))?;
    self
      .start_block("fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value>")?;
    self.write(format!(
      "HashMap::<String, {}>::expand_json(value)",
      scalar_type
    ))?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl idol::ValidatesJson for {}", t.type_name))?;
    self.start_block("fn validate_json(value: &serde_json::Value) -> idol::ValidationResult")?;
    self.write(format!(
      "HashMap::<String, {}>::validate_json(value)",
      scalar_type
    ))?;
    self.end_block()?;
    self.end_block()?;

    Ok(())
  }

  fn gen_repeated_impls(&mut self, t: &Type, type_struct: &TypeStruct) -> BResult {
    let scalar_type =
      type_struct.display_scalar_type(&self.build_env.root_rust_module, &self.idol_module_name);

    self.write_nl()?;
    self.start_block(format!("impl idol::ExpandsJson for {}", t.type_name))?;
    self
      .start_block("fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value>")?;
    self.write(format!("Vec::<{}>::expand_json(value)", scalar_type))?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl idol::ValidatesJson for {}", t.type_name))?;
    self.start_block("fn validate_json(value: &serde_json::Value) -> idol::ValidationResult")?;
    self.write(format!("Vec::<{}>::validate_json(value)", scalar_type))?;
    self.end_block()?;
    self.end_block()?;

    Ok(())
  }

  fn gen_atleast_one_impls(&mut self, t: &Type, type_struct: &TypeStruct) -> BResult {
    let scalar_type =
      type_struct.display_scalar_type(&self.build_env.root_rust_module, &self.idol_module_name);

    self.write_nl()?;
    self.start_block(format!("impl Default for {}", t.type_name))?;
    self.start_block(format!("fn default() -> {}", t.type_name))?;
    self.write(format!("{}(vec![{}::default()])", t.type_name, scalar_type))?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl idol::ExpandsJson for {}", t.type_name))?;
    self
      .start_block("fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value>")?;
    self.start_block("if value.is_null()")?;
    self.write(format!(
      "return Some(serde_json::Value::Array(vec![serde_json::value::to_value({}::default()).unwrap()]));",
      scalar_type
    ))?;
    self.branch_block("if let serde_json::Value::Array(contents) = value")?;
    self.start_block("if contents.is_empty()")?;
    self.write("contents.push(serde_json::Value::Null);")?;
    self.end_block()?;
    self.branch_block("else")?;
    self.write(format!("let inner = {}::expand_json(value);", scalar_type))?;
    self.start_block("if inner.is_some()")?;
    self.write("return Some(serde_json::Value::Array(vec![inner.unwrap()]));")?;
    self.branch_block("else")?;
    self.write("return Some(serde_json::Value::Array(vec![value.to_owned()]));")?;
    self.end_block()?;
    self.end_block()?;
    self.write_nl()?;
    self.write(format!("Vec::<{}>::expand_json(value)", scalar_type))?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl idol::ValidatesJson for {}", t.type_name))?;
    self.start_block("fn validate_json(value: &serde_json::Value) -> idol::ValidationResult")?;
    self.start_block("if let serde_json::Value::Array(contents) = value")?;
    self.start_block("if contents.is_empty()")?;
    self.write(
      "return Err(idol::ValidationError(\"expected atleast one value, but none was found.\".to_string()));",
    )?;
    self.end_block()?;
    self.end_block()?;
    self.write_nl()?;
    self.write(format!("Vec::<{}>::validate_json(value)", scalar_type))?;
    self.end_block()?;
    self.end_block()?;

    Ok(())
  }

  fn gen_enum_impls(&mut self, t: &Type) -> BResult {
    self.write_nl()?;
    self.start_block(format!("impl Default for {}", t.type_name))?;
    self.start_block(format!("fn default() -> {}", t.type_name))?;
    self.write(format!("{}::{}", t.type_name, t.options.get(0).unwrap()))?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl From<usize> for {}", t.type_name))?;
    self.start_block(format!("fn from(i: usize) -> {}", t.type_name))?;
    self.start_block(format!("if i >= {}", t.options.len()))?;
    self.write(format!("{}::{}", t.type_name, t.options.get(0).unwrap()))?;
    for (i, opt) in t.options.iter().enumerate() {
      self.branch_block(format!("else if i == {}", i))?;
      self.write(format!("{}::{}", t.type_name, opt))?;
    }
    self.branch_block("else")?;
    self.write("unreachable!()")?;
    self.end_block()?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl Into<usize> for {}", t.type_name))?;
    self.start_block("fn into(self) -> usize")?;
    self.start_block("match self")?;
    for (i, opt) in t.options.iter().enumerate() {
      self.write(format!("{}::{} => {},", t.type_name, opt, i))?;
    }
    self.end_block()?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl idol::ExpandsJson for {}", t.type_name))?;
    self
      .start_block("fn expand_json(value: &mut serde_json::Value) -> Option<serde_json::Value>")?;
    self.gen_get_scalar(&t.type_name)?;
    self.start_block("if value.is_null()")?;
    self.write(format!(
      "return serde_json::to_value({}::default()).ok();",
      t.type_name
    ))?;
    self.end_block()?;

    self.write_nl()?;
    self.write("None")?;
    self.end_block()?;
    self.end_block()?;

    self.write_nl()?;
    self.start_block(format!("impl idol::ValidatesJson for {}", t.type_name))?;
    self.start_block("fn validate_json(value: &serde_json::Value) -> idol::ValidationResult")?;
    self.write(format!(
      "return serde_json::from_value::<{}>(value.to_owned()).map_err(|_| {}).map(|_| ());",
      t.type_name,
      format!(
        "idol::ValidationError(format!(\"expected a valid enum value for {}, but found {{}}\", value))",
        t.type_name
      )))?;
    self.end_block()?;
    self.end_block()?;

    Ok(())
  }

  fn gen_type_dec(&mut self, t: &Type) -> BResult {
    if let Some(alias) = &t.is_a {
      let display_type =
        alias.display_type(&self.build_env.root_rust_module, &self.idol_module_name);

      if alias.is_literal {
        self.write(format!("pub struct {}({});", t.type_name, display_type))?;
      } else {
        self.write(format!("pub struct {}(pub {});", t.type_name, display_type))?;
      }

      return Ok(());
    };

    if t.is_enum() {
      self.start_block(format!("pub enum {}", t.type_name))?;

      for option in t.options.iter() {
        self.write(format!("{},", option))?;
      }
      self.end_block()?;

      return Ok(());
    }

    self.start_block(format!("pub struct {}", t.type_name))?;

    let mut field_names = t.fields.keys().cloned().collect::<Vec<String>>();
    field_names.sort();

    for field_name in field_names.iter() {
      let field = t.fields.get(field_name).unwrap();
      let display_type =
        field.display_type(&self.build_env.root_rust_module, &self.idol_module_name);
      self.write(format!("pub r#{}: {},", field_name, display_type))?;
    }

    self.end_block()
  }

  pub fn to_module_path(module_name: &str) -> PathBuf {
    PathBuf::from(format!(
      "{}.rs",
      module_name.split('.').collect::<Vec<&str>>().join("/")
    ))
  }
}

trait TypeExt {
  fn is_atleast_one_type(&self) -> bool;
  fn derives(&self) -> Vec<&str>;
  fn is_literal(&self) -> bool;
}

impl TypeExt for Type {
  fn is_atleast_one_type(&self) -> bool {
    if let Some(type_struct) = &self.is_a {
      return type_struct.struct_kind == StructKind::Repeated
        && self.tags.contains(&"atleast_one".to_string());
    }

    false
  }

  fn is_literal(&self) -> bool {
    if let Some(type_struct) = &self.is_a {
      return type_struct.is_literal;
    }

    false
  }

  fn derives(&self) -> Vec<&str> {
    let mut result = vec!["PartialEq", "Serialize", "Deserialize", "Debug", "Clone"];
    if !(self.is_atleast_one_type() || self.is_enum() || self.is_literal()) {
      result.push("Default");
    }

    result
  }
}

trait TypeStructExt {
  fn display_scalar_type(&self, root_rust_module: &String, cur_idol_module: &String) -> String;
  fn display_type(&self, root_rust_module: &String, cur_idol_module: &String) -> String;
  fn display_type_root(&self, root_rust_module: &String, cur_idol_module: &String) -> String;
}

impl TypeStructExt for TypeStruct {
  fn display_scalar_type(&self, root_rust_module: &String, cur_idol_module: &String) -> String {
    if self.is_primitive() {
      match self.primitive_type {
        PrimitiveType::string => "String".to_string(),
        PrimitiveType::int64 => "i64".to_string(),
        PrimitiveType::int53 => "idol::i53".to_string(),
        PrimitiveType::double => "f64".to_string(),
        PrimitiveType::bool => "bool".to_string(),
        PrimitiveType::any => "serde_json::Value".to_string(),
      }
    } else {
      self
        .reference
        .display_from(root_rust_module, cur_idol_module)
    }
  }

  fn display_type(&self, root_rust_module: &String, cur_idol_module: &String) -> String {
    let scalar = self.display_scalar_type(root_rust_module, cur_idol_module);
    match self.struct_kind {
      StructKind::Scalar => scalar,
      StructKind::Map => format!("HashMap<String, {}>", scalar),
      StructKind::Repeated => format!("Vec<{}>", scalar),
    }
  }

  fn display_type_root(&self, root_rust_module: &String, cur_idol_module: &String) -> String {
    let scalar_type = self.display_scalar_type(root_rust_module, cur_idol_module);
    match self.struct_kind {
      StructKind::Scalar => scalar_type,
      StructKind::Map => format!("HashMap::<String, {}>", scalar_type),
      StructKind::Repeated => format!("Vec::<{}>", scalar_type),
    }
  }
}

trait ReferenceExt {
  fn display_from(&self, root_rust_module: &String, cur_idol_module: &String) -> String;
}

impl ReferenceExt for Reference {
  fn display_from(&self, root_rust_module: &String, cur_idol_module: &String) -> String {
    if &self.module_name == cur_idol_module {
      return self.type_name.to_owned();
    }

    format!(
      "{}::{}",
      root_rust_module,
      self
        .qualified_name
        .split('.')
        .collect::<Vec<&str>>()
        .join("::")
    )
  }
}

trait FieldExt {
  fn is_optional(&self) -> bool;
  fn display_type(&self, root_rust_module: &String, cur_idol_module: &String) -> String;
  fn display_type_root(&self, root_rust_module: &String, cur_idol_module: &String) -> String;
}

impl FieldExt for Field {
  fn is_optional(&self) -> bool {
    self.tags.contains(&"optional".to_string())
  }

  fn display_type(&self, root_rust_module: &String, cur_idol_module: &String) -> String {
    let inner_type = self
      .type_struct
      .display_type(root_rust_module, cur_idol_module);

    if self.is_optional() {
      return format!("Option<{}>", inner_type);
    }

    inner_type
  }

  fn display_type_root(&self, root_rust_module: &String, cur_idol_module: &String) -> String {
    if self.is_optional() {
      let inner_type = self
        .type_struct
        .display_type(root_rust_module, cur_idol_module);

      return format!("Option::<{}>", inner_type);
    }

    self
      .type_struct
      .display_type_root(root_rust_module, cur_idol_module)
  }
}

static indentions: [&str; 10] = [
  "",
  "  ",
  "    ",
  "      ",
  "        ",
  "          ",
  "            ",
  "              ",
  "                ",
  "                  ",
];

static root_mod_extras: &str = "
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
        write!(f, \"{}\", self.0)
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
        serde_json::Value::Null => serde_json::to_value(\"\").ok(),
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
            .map_err(|_| ValidationError(\"value was not a properly formatted i64.\".to_string())),
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
            Err(ValidationError(\"value is too large for i53\".to_string()))
          } else if i < -9007199254740991 {
            Err(ValidationError(\"value is too small for i53\".to_string()))
          } else {
            Ok(())
          }
        }
        Some(Err(e)) => Err(e),
        None => Err(ValidationError(format!(
          \"value was expected to be a ii53, but found {}\",
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
          .map_err(|_| ValidationError(\"value was not a properly formatted i64.\".to_string()));
      }

      if value.is_i64() {
        Ok(())
      } else {
        Err(ValidationError(format!(
          \"value was expected to be a i64, but found {}\",
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
          \"value was expected to be a string, but found {}\",
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
          \"value was expected to be a bool, but found {}\",
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
          \"value was expected to be an double, but found {}\",
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
          T::validate_json(element).map_err(|s| ValidationError(format!(\"index {}: {}\", i, s)))?;
        }

        Ok(())
      } else {
        Err(ValidationError(format!(
          \"value was expected to be an array, but found {}\",
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
          T::validate_json(entry.1).map_err(|s| ValidationError(format!(\"field {}: {}\", entry.0, s)))?;
        }

        Ok(())
      } else {
        Err(ValidationError(format!(
          \"value was expected to be an object, but found {}\",
          value
        )))
      }
    }
  }
}
";
