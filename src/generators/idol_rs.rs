use crate::models::schema::Module;
use crate::modules_store::ModulesStore;
use std::hash::Hash;

#[derive(PartialEq, PartialOrd, Hash, Ord, Eq)]
pub struct RustSymbolName(String);

#[derive(PartialEq, PartialOrd, Hash, Ord, Eq)]
pub struct RustModuleNodeName(String);

impl<T: ToString> From<T> for RustModuleNodeName {
    fn from(i: T) -> Self {
        // TODO: rename invalid rust module names?
        RustModuleNodeName(i.to_string())
    }
}

#[derive(PartialEq, PartialOrd, Hash, Ord, Eq)]
pub enum RustRootModuleNode {
    ModSelf,
    Crate,
    Named(RustModuleNodeName),
}

#[derive(Hash, PartialOrd, PartialEq, Ord, Eq)]
pub struct RustFileIdentifier(RustModuleNodeName, Vec<RustModuleNodeName>);
pub type RustFilePart<T> = (RustFileIdentifier, T);

impl From<&Module> for RustFileIdentifier {
    fn from(module: &Module) -> Self {
        let mut module_name_parts = module.module_name.split(".").into_iter();
        let module_root = module_name_parts.next().expect("Moo");
        RustFileIdentifier(
            module_root.into(),
            module_name_parts.map(|s| s.into()).collect(),
        )
    }
}

pub fn generate(store: &ModulesStore) -> Result<(), String> {
    Ok(())
}

pub fn module_output(module: &Module) -> Vec<RustFilePart<()>> {
    vec![(module.into(), ())]
}
