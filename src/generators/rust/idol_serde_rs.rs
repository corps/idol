use crate::generators::rust::identifiers::RustModuleName;
use crate::models::schema::Type;

pub struct IdolSerdeRs;
type ModuleContext = (RustModuleName, IdolSerdeRs);

pub fn module_context_for(t: Type) -> ModuleContext {
    (
        RustModuleName::from_idol_module_name(&t.named.module_name),
        IdolSerdeRs,
    )
}
