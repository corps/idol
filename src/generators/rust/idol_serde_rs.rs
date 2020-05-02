use crate::deconstructors::TypeDeconstructor;
use crate::generators::acc_monad::AccMonad;
use crate::generators::build_env::BuildEnv;
use crate::generators::features::Feature;
use crate::generators::project::Declared;
use crate::generators::rust::identifiers::{RustIdentifier, RustModuleName};
use crate::generators::rust::rust_file::{
    RustDeclared, RustModuleContext, RustProjectContext, RustProjectMonad,
};
use crate::generators::rust::rust_pojo::{DefaultRustPojoRenderable, RustPojo};
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
        RustProjectMonad::for_each(
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
        RustProjectMonad::for_each(module.types_dependency_ordering.iter().map(|type_name| {
            RustPojo::new(Reference::from((
                module.module_name.to_string(),
                type_name.to_string(),
            )))
            .declare(self.store)
        }))
    }
}

pub fn generate(m: &ModulesStore) -> Result<(), String> {
    let mut build_env = BuildEnv::new();

    for module_name in m.module_dep_mapper.order_dependencies().iter() {}

    Ok(())
}
