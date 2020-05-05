use crate::generators::acc_monad::AccMonad;
use crate::generators::identifiers::{Escapable, Escaped};
use crate::generators::project::{Declared, ModuleContext, ModuleManager, ProjectContext};
use crate::generators::rust::identifiers::{RustIdentifier, RustModuleName, RustModuleRoot};
use crate::generators::slotted_buffer::BufferManager;
use proc_macro2::TokenStream;
use regex::Regex;
use std::collections::hash_map::RandomState;
use std::collections::HashMap;

pub struct RustFile;

impl BufferManager for RustFile {
    fn escape(s: &str) -> String {
        format!("//### idol: {}", s)
    }

    fn try_unescape(s: &str) -> Option<String> {
        lazy_static! {
            static ref ESCAPE_REGEX: Regex = { Regex::new(r"^//\#\#\# idol: (.+)").unwrap() };
        }

        ESCAPE_REGEX
            .captures(s)
            .and_then(|c| c.get(1).map(|c| c.as_str().to_string()))
    }
}

impl ModuleManager<RustModuleName, RustIdentifier> for RustFile {
    fn render_imports(
        imported: &HashMap<(RustModuleName, RustIdentifier), RustIdentifier, RandomState>,
    ) -> String {
        imported
            .iter()
            .map(|((from_mod, from_ident), to_ident)| -> String {
                if to_ident.eq(from_ident) {
                    format!(
                        "use {}::{};",
                        from_mod.clone().escaped(),
                        from_ident.clone().escaped()
                    )
                } else {
                    format!(
                        "use {}::{} as {};",
                        from_mod.clone().escaped(),
                        from_ident.clone().escaped(),
                        to_ident.clone().escaped(),
                    )
                }
            })
            .collect::<Vec<String>>()
            .join("\n")
    }
}

pub type RustProjectContext = ProjectContext<RustModuleName, RustIdentifier, RustFile>;
pub type RustModuleContext = ModuleContext<RustModuleName, RustIdentifier, RustFile>;
pub type RustProjectMonad<'a, T> = AccMonad<'a, T, RustProjectContext, String>;
pub type RustImportMonad<'a, T> = AccMonad<'a, T, RustModuleContext, String>;
pub type RustDeclarationMonad<'a, R> = RustProjectMonad<'a, Option<RustImportMonad<'a, R>>>;
pub type RustReserved = (Escaped<RustIdentifier>, Escaped<RustIdentifier>);
pub type RustDeclared = Declared<RustModuleName, RustIdentifier>;

pub fn import_from_crate<'a>(
    crate_name: &str,
    path: Vec<&str>,
    ident: &str,
) -> RustDeclarationMonad<'a, TokenStream> {
    let module = (RustModuleName {
        root: RustModuleRoot::RootCrate(crate_name.into()),
        children: path.iter().map(|v| RustIdentifier(v.to_string())).collect(),
    })
    .escaped();

    let ident = RustIdentifier::from(ident).escaped();

    RustDeclarationMonad::lift_value(move || {
        Some(
            Declared(module.clone(), ident.clone())
                .imported()
                .map(move |ident| {
                    quote! { ident }
                }),
        )
    })
}

pub fn import_rust_declared<'a>(
    declared: RustDeclarationMonad<'a, RustDeclared>,
) -> RustDeclarationMonad<'a, TokenStream> {
    declared.map_optional(|acc| {
        acc.map(|dec| {
            quote! { dec }
        })
    })
}
