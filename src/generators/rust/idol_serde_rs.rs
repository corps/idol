use crate::deconstructors::TypeDeconstructor;
use crate::generators::build_env::BuildEnv;
use crate::generators::project::Declared;
use crate::generators::rust::identifiers::{RustIdentifier, RustModuleName};
use crate::generators::rust::rust_file::{
    RustDeclarationContext, RustDeclarationMonad, RustDeclared, RustProjectContext,
    RustProjectMonad,
};
use crate::generators::rust::type_declarable::TypeDeclarable;
use crate::models::schema::{Module, Reference, Type};
use crate::modules_store::ModulesStore;

#[derive(PartialOrd, Eq, PartialEq, Hash, Debug)]
pub struct ImplExpandsJson(Reference);
#[derive(PartialOrd, Eq, PartialEq, Hash, Debug)]
pub struct ImplValidatesJson(Reference);
#[derive(PartialOrd, Eq, PartialEq, Hash, Debug)]
pub struct ImplDefault(Reference);

pub struct IdolSerdeRs<'a> {
    store: &'a ModulesStore,
}

impl<'a> IdolSerdeRs<'a> {
    pub fn new(store: &'a ModulesStore) -> Self {
        IdolSerdeRs { store }
    }

    pub fn generate(&self) -> RustProjectMonad<()> {
        RustProjectMonad::from(
            self.store
                .module_dep_mapper
                .order_dependencies()
                .iter()
                .map(|module_name| {
                    self.generate_module(self.store.resolved.get(module_name).unwrap())
                }),
        )
    }

    pub fn generate_module<'b: 'c, 'c>(&'b self, module: &'c Module) -> RustProjectMonad<'c, ()> {
        RustProjectMonad::from(
            module
                .types_dependency_ordering
                .iter()
                .map(|type_name| self.generate_type(module.types_by_name.get(type_name).unwrap())),
        )
    }

    pub fn generate_type(&self, t: &'a Type) -> RustProjectMonad<'a, RustDeclared> {
        // let ctx = RustModuleMonad::from(
        //     TypeDeconstructor(t).struct_fields()
        // )
        //
        RustProjectContext::get_declaration(RustProjectContext::declare_ident(
            TypeDeclarable(t.named.clone()),
            RustDeclarationMonad::unit(|| (|_| "".to_string(), |_| "".to_string())),
        ))
    }
}

pub fn generate(m: &ModulesStore) -> Result<(), String> {
    let mut build_env = BuildEnv::new();

    for module_name in m.module_dep_mapper.order_dependencies().iter() {}

    Ok(())
}
