use crate::generators::acc_monad::AccMonad;
use crate::generators::project::{DeclarationContext, Declared, ProjectContext};
use crate::generators::rust::identifiers::{RustIdentifier, RustModuleName};
use crate::generators::slotted_buffer::{BufferManager, SlottedBuffer};
use regex::Regex;

pub struct RustFile;

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

pub type RustProjectContext = ProjectContext<RustModuleName, RustIdentifier, RustFile>;
pub type RustDeclarationContext = DeclarationContext<RustModuleName, RustIdentifier, RustFile>;
pub type RustProjectMonad<'a, T> = AccMonad<'a, T, RustProjectContext, String>;
pub type RustDeclarationMonad<'a, T> = AccMonad<'a, T, RustDeclarationContext, String>;
pub type RustDeclared = Declared<RustModuleName, RustIdentifier>;
