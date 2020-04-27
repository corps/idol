use crate::deconstructors::{TypeDeconstructor, TypeStructDeconstructor};
use crate::generators::rust::identifiers::{RustIdentifier, RustModuleName, RustModuleRoot};
use crate::generators::rust::rust_file::RustFile;
use crate::models::schema::Reference;
use crate::modules_store::TypeLookup;

#[derive(Debug)]
pub struct TypeDeclarable(pub Reference);

impl From<&TypeDeclarable> for RustModuleName {
    fn from(td: &TypeDeclarable) -> Self {
        RustModuleName::from_idol_module_name(RustModuleRoot::RootSelf, &td.0.module_name)
    }
}

impl From<&TypeDeclarable> for RustIdentifier {
    fn from(td: &TypeDeclarable) -> Self {
        RustIdentifier::new(td.0.type_name.clone())
    }
}
