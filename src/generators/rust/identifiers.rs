use crate::generators::declarable::{Escapable, Escaped, HierarchicalIdentifier};
use crate::generators::generator::GeneratorNode;
use crate::models::schema::Module;
use regex::Regex;
use serde::export::Formatter;
use std::collections::hash_set::HashSet;
use std::fmt::Display;
use std::iter::FromIterator;

fn is_valid_rust_identifier(s: &str) -> bool {
    lazy_static! {
        static ref VALID_RUST_IDENTIFIER: Regex =
            Regex::new(r"^[a-zA-Z][a-zA-Z0-9_]*|_[a-zA-Z0-9_]+$").unwrap();
    }

    VALID_RUST_IDENTIFIER.is_match(s)
}

fn is_restricted_keyword(s: &str) -> bool {
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

pub struct RustModuleName(HierarchicalIdentifier<RustIdentifier>);
impl RustModuleName {
    pub fn from_idol_module_name(module_name: &str) -> Self {
        let mut module_name_parts = module_name.split(".").into_iter();
        let module_root = module_name_parts.next().unwrap();

        RustModuleName(HierarchicalIdentifier(
            module_root.into(),
            module_name_parts.map(|s| s.into()).collect(),
        ))
    }
}

impl Escapable for RustModuleName {
    fn escape(self: Self) -> Option<Escaped<Self>> {
        (self.0).0.escape().map(|root| {})
    }
}

pub struct RustIdentifier(String);

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

impl Escapable for RustIdentifier {
    fn escape(self: Self) -> Option<Self> {
        if self.0.is_empty() {
            return Some(Self::from("unnamed"));
        }

        if is_valid_rust_identifier(&self.0) {
            return Some(self);
        }

        let mut new_raw = self.0;

        if let Some(first_char) = new_raw.chars().next() {
            if (first_char == '_' && new_raw.len() == 1) || first_char.is_numeric() {
                new_raw = format!("a{}", new_raw);
            }
        }

        new_raw = new_raw
            .chars()
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
            .join("");

        if is_restricted_keyword(&new_raw) {
            new_raw = format!("_{}", new_raw);
        }

        if is_reserved_keyword(&new_raw) || is_strict_keyword(&new_raw) {
            new_raw = format!("r#{}", new_raw);
        }

        Some(RustIdentifier::from(new_raw))
    }
}
