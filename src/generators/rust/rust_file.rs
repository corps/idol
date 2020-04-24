use crate::generators::slotted_buffer::{BufferManager, SlottedBuffer};
use regex::Regex;

pub struct RustFile;

#[derive(Debug)]
pub struct RustUses;

impl BufferManager for RustFile {
    fn escape(s: &str) -> String {
        format!("//### idol: {}", s)
    }

    fn try_unescape(s: &str) -> Option<String> {
        lazy_static! {
            static ref ESCAPE_REGEX: Regex = { Regex::new(r"^\/\/\#\#\#\ idol\:\ (.+)").unwrap() };
        }

        ESCAPE_REGEX
            .captures(s)
            .and_then(|c| c.get(1).map(|c| c.as_str().to_string()))
    }
}
