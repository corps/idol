use crate::generators::identifiers::{CodegenIdentifier, Escapable, ModuleIdentifier};
use crate::models::schema::Module;
use regex::Regex;
use serde::export::Formatter;
use std::collections::hash_set::HashSet;
use std::collections::HashMap;
use std::fmt::{Debug, Display};
use std::hash::Hash;
use std::iter::FromIterator;
use std::path::PathBuf;

#[derive(Clone, PartialOrd, PartialEq, Eq, Hash, Debug)]
pub struct RustIdentifier(pub String);

fn is_module_keyword(s: &str) -> bool {
    s == "crate" || s == "self" || s == "super" || s == "Super"
}

fn is_strict_keyword(s: &str) -> bool {
    lazy_static! {
        static ref STRICT_KEYWORDS: HashSet<&'static str> = {
            HashSet::from_iter(vec![
                "as", "break", "const", "create", "else", "enum", "extern", "false", "fn", "for",
                "if", "impl", "in", "let", "loop", "match", "mod", "move", "mut", "pub", "ref",
                "return", "self", "Self", "static", "struct", "super", "trait", "true", "type",
                "unsafe", "use", "where", "while", "async", "await", "dyn",
            ])
        };
    }

    STRICT_KEYWORDS.contains(s)
}

fn is_reserved_keyword(s: &str) -> bool {
    lazy_static! {
        static ref RESERVED_KEYWORDS: HashSet<&'static str> = {
            HashSet::from_iter(vec![
                "abstract", "become", "box", "do", "final", "macro", "override", "priv", "typeof",
                "unsized", "virtual", "yield",
            ])
        };
    }

    RESERVED_KEYWORDS.contains(s)
}

#[derive(Clone, PartialOrd, PartialEq, Eq, Hash)]
pub enum RustModuleRoot {
    RootCrate(RustIdentifier),
    RootSelf,
}

impl Display for RustModuleRoot {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            RustModuleRoot::RootCrate(i) => write!(f, "{}", i),
            RustModuleRoot::RootSelf => write!(f, "self"),
        }
    }
}

#[derive(Clone, PartialOrd, PartialEq, Eq, Hash)]
pub struct RustModuleName {
    pub root: RustModuleRoot,
    pub children: Vec<RustIdentifier>,
}

impl From<&RustModuleName> for PathBuf {
    fn from(mn: &RustModuleName) -> Self {
        match &mn.root {
            RustModuleRoot::RootSelf => PathBuf::from(
                mn.children
                    .iter()
                    .map(|c| c.escape().to_string())
                    .collect::<Vec<String>>()
                    .join("/"),
            ),
            _ => unreachable!("RustModuleName from external crate cannot have a path generated!"),
        }
    }
}

impl RustModuleName {
    pub fn from_idol_module_name(root: RustModuleRoot, module_name: &str) -> Self {
        let mut module_name_parts = module_name.split(".");

        RustModuleName {
            root,
            children: module_name_parts.map(|s| s.into()).collect(),
        }
    }
}

impl Escapable for RustModuleName {
    fn escape(&self) -> Self {
        let original_len = self.children.len();
        let escaped_children: Vec<RustIdentifier> =
            self.children.iter().map(|ident| ident.escape()).collect();

        let module_root = match &self.root {
            RustModuleRoot::RootCrate(ident) => RustModuleRoot::RootCrate(ident.escape()),
            root => root.clone(),
        };

        RustModuleName {
            root: module_root,
            children: escaped_children,
        }
    }
}

impl Display for RustModuleName {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.write_fmt(format_args!("{}", self.root))?;

        for child in self.children.iter() {
            f.write_fmt(format_args!("::{}", child))?;
        }

        Ok(())
    }
}

impl ModuleIdentifier for RustModuleName {}

impl Display for RustIdentifier {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<String> for RustIdentifier {
    fn from(s: String) -> Self {
        RustIdentifier(s)
    }
}

impl From<&str> for RustIdentifier {
    fn from(s: &str) -> Self {
        RustIdentifier(s.to_string())
    }
}

fn apply_empty_replacement(s: String) -> String {
    if s.is_empty() {
        "unnamed".to_string()
    } else {
        s
    }
}

fn apply_first_char_escape(s: String) -> String {
    if let Some(first_char) = s.chars().next() {
        if (first_char == '_' && s.len() == 1) || first_char.is_numeric() {
            return format!("a{}", s);
        }
    }

    s
}

fn apply_unicode_escaping(s: String) -> String {
    s.chars()
        .map(|c| {
            if c.is_alphanumeric() {
                c.to_string()
            } else {
                c.escape_unicode()
                    .filter(|c| c.is_numeric() || *c == 'u')
                    .collect::<String>()
            }
        })
        .collect::<Vec<String>>()
        .join("")
}

fn apply_restricted_escaping(s: String) -> String {
    if is_module_keyword(&s) {
        return format!("_{}", s);
    }
    s
}

fn apply_raw_escaping(s: String) -> String {
    if is_reserved_keyword(&s) || is_strict_keyword(&s) {
        return format!("r#{}", s);
    }

    s
}

impl Escapable for RustIdentifier {
    fn escape(&self) -> Self {
        let mut new_raw = self.0.clone();
        new_raw = apply_empty_replacement(new_raw);
        new_raw = apply_restricted_escaping(new_raw);
        new_raw = apply_first_char_escape(new_raw);
        new_raw = apply_unicode_escaping(new_raw);
        new_raw = apply_raw_escaping(new_raw);
        RustIdentifier::from(new_raw)
    }
}

impl CodegenIdentifier for RustIdentifier {
    fn codegen_variant(&self) -> Self {
        if self
            .0
            .chars()
            .next()
            .map(|c| c.is_uppercase())
            .unwrap_or(false)
        {
            RustIdentifier(format!("Generated_{}", self.0))
        } else {
            RustIdentifier(format!("_generated_{}", self.0))
        }
    }

    fn import_variant(&self) -> Self {
        RustIdentifier(format!("{}_", self.0))
    }
}
