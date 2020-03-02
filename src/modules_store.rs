use crate::deconstructors::TypeDeconstructor;
use crate::loader::ModuleFileLoader;
use crate::models::schema::{Module, Reference, Type};
use crate::module_resolver::ModuleResolver;
use std::collections::HashMap;

pub struct ModulesStore {
    pub resolved: HashMap<String, Module>,
    loader: ModuleFileLoader,
}

pub trait TypeLookup<'a> {
    fn lookup_reference(&'a self, reference: &Reference) -> Result<&'a Type, String>;

    fn material_type(&'a self, type_decon: TypeDeconstructor<'a>) -> Result<&'a Type, String> {
        type_decon
            .type_struct()
            .and_then(|ts| ts.scalar())
            .and_then(|sc| sc.reference())
            .map(|reference| {
                self.lookup_reference(reference)
                    .and_then(|t| self.material_type(TypeDeconstructor(t)))
            })
            .unwrap_or_else(|| Ok(type_decon.0))
    }
}

impl<'a> TypeLookup<'a> for ModulesStore {
    fn lookup_reference(&'a self, reference: &Reference) -> Result<&'a Type, String> {
        self.resolved
            .get(&reference.module_name)
            .ok_or_else(|| format!("Module {} is not loaded", reference.module_name))
            .and_then(|m| {
                m.types_by_name.get(&reference.type_name).ok_or_else(|| {
                    format!(
                        "Type {} does not exist in module {}",
                        reference.type_name, reference.module_name
                    )
                })
            })
    }
}

impl ModulesStore {
    pub fn new(loader: ModuleFileLoader) -> ModulesStore {
        ModulesStore {
            loader,
            resolved: HashMap::new(),
        }
    }

    pub fn load(&mut self, module_name: &str) -> Result<(), String> {
        // Already resolved
        if let Some(loaded) = self.resolved.get(module_name) {
            return Ok(());
        }

        let loaded = self
            .loader
            .load_module(module_name)
            .map_err(|e| format!("Error loading module: {}", e))?;

        let module = ModuleResolver::new(self, &loaded).resolve()?;
        self.resolved.insert(module_name.to_owned(), module);
        debug_assert!(self.resolved.contains_key(module_name));
        Ok(())
    }
}