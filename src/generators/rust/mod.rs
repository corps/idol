//###
use crate::generators::slotted_buffer::Escaper;
use regex::Regex;

pub mod identifiers;
pub mod idol_serde_rs;
pub mod type_declarable;
pub mod writer;

#[derive(Default)]
pub struct RustEscaper;

impl Escaper for RustEscaper {
    fn escape(&self, s: &str) -> String {
        format!("//### idol: {}", s)
    }

    fn try_unescape(&self, s: &str) -> Option<String> {
        lazy_static! {
            static ref ESCAPE_REGEX: Regex = { Regex::new(r"^\/\/\#\#\#\ idol\:\ (.+)").unwrap() };
        }

        ESCAPE_REGEX
            .captures(s)
            .and_then(|c| c.get(1).map(|c| c.as_str().to_string()))
    }
}
