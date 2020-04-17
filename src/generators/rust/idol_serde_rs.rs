use crate::generators::build_env::BuildEnv;
use crate::generators::rust::identifiers::RustModuleName;
use crate::generators::rust::RustEscaper;
use crate::generators::slotted_buffer::SlottedBuffer;
use crate::models::schema::Reference;
use crate::modules_store::ModulesStore;
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(PartialOrd, Eq, PartialEq, Hash, Debug)]
pub struct ImplExpandsJson(Reference);
#[derive(PartialOrd, Eq, PartialEq, Hash, Debug)]
pub struct ImplValidatesJson(Reference);
#[derive(PartialOrd, Eq, PartialEq, Hash, Debug)]
pub struct ImplDefault(Reference);

pub fn generate(m: &ModulesStore) -> Result<(), String> {
    let mut build_env = BuildEnv::new();

    for module_name in m.module_dep_mapper.order_dependencies().iter() {}

    Ok(())
}
