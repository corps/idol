use crate::generators::acc_monad::AccMonad;
use crate::generators::identifiers::{CodegenIdentifier, Escapable, Escaped, ModuleIdentifier};
use crate::generators::slotted_buffer::{BufferManager, SlottedBuffer};
use fs_extra::dir::DirEntryAttr::Accessed;
use std::borrow::Borrow;
use std::cell::Cell;
use std::collections::{HashMap, HashSet};
use std::fmt::{Debug, Display, Formatter};
use std::hash::{Hash, Hasher};

pub struct Module<MI: ModuleIdentifier, I: CodegenIdentifier, M: BufferManager> {
    imported: HashMap<(MI, I), Imported<I>>,
    rendered: HashSet<String>,
    idents: HashMap<Escaped<I>, String>,
    buffer: SlottedBuffer<M>,
}

impl<MI: ModuleIdentifier, I: CodegenIdentifier, M: BufferManager> Default for Module<MI, I, M> {
    fn default() -> Self {
        Module {
            imported: HashMap::default(),
            rendered: HashSet::default(),
            idents: HashMap::default(),
            buffer: SlottedBuffer::default(),
        }
    }
}

impl<MI: ModuleIdentifier, I: CodegenIdentifier, M: BufferManager> Module<MI, I, M> {
    pub fn try_add_ident(&mut self, ident: &Escaped<I>, feature_name: &str) -> Result<(), String> {
        if let Some(existing_feature_name) = self.idents.get(ident) {
            return Err(format!(
                "Conflict for identifier {} between {} and {}",
                ident.to_owned(),
                feature_name,
                existing_feature_name
            ));
        } else {
            self.idents
                .insert(ident.to_owned(), feature_name.to_owned());
        }

        Ok(())
    }
}

#[derive(Debug)]
pub struct Declared<MI: ModuleIdentifier, I: CodegenIdentifier>(Escaped<MI>, Escaped<I>);

impl<MI: ModuleIdentifier, I: CodegenIdentifier> Hash for Declared<MI, I> {
    fn hash<H: Hasher>(&self, state: &mut H) {
        (&self.0, &self.1).hash(state)
    }
}

impl<MI: ModuleIdentifier, I: CodegenIdentifier> PartialEq for Declared<MI, I> {
    fn eq(&self, other: &Self) -> bool {
        let other_pair = (&other.0, &other.1);
        (&self.0, &self.1).eq(&other_pair)
    }
}

impl<MI: ModuleIdentifier, I: CodegenIdentifier> Eq for Declared<MI, I> {}

impl<MI: ModuleIdentifier, I: CodegenIdentifier> Clone for Declared<MI, I> {
    fn clone(&self) -> Self {
        Declared(self.0.clone(), self.1.clone())
    }
}

#[derive(Debug)]
pub struct Imported<I: CodegenIdentifier>(Escaped<I>);

impl<I: CodegenIdentifier> Hash for Imported<I> {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.0.hash(state)
    }
}

impl<I: CodegenIdentifier> PartialEq for Imported<I> {
    fn eq(&self, other: &Self) -> bool {
        self.0.eq(&other.0)
    }
}

impl<I: CodegenIdentifier> Eq for Imported<I> {}

impl<I: CodegenIdentifier> Clone for Imported<I> {
    fn clone(&self) -> Self {
        Imported(self.0.clone())
    }
}

pub struct Project<MI: ModuleIdentifier, I: CodegenIdentifier, M: BufferManager> {
    modules: HashMap<MI, Cell<Module<MI, I, M>>>,
}

pub trait Declaration {}
impl Declaration for () {}
impl<MI: ModuleIdentifier, I: CodegenIdentifier> Declaration for Declared<MI, I> {}

impl<MI: ModuleIdentifier, I: CodegenIdentifier, M: BufferManager> Project<MI, I, M> {
    pub fn get_declaration<'a, R: Declaration>(
        dec: (MI, AccMonad<'a, R, Module<MI, I, M>, String>),
    ) -> AccMonad<'a, R, Project<MI, I, M>, String>
    where
        I: 'a,
        MI: 'a,
        M: 'a,
        R: 'a,
    {
        let (module_ident, acc) = dec;

        AccMonad::with_acc(move |mut p: Project<MI, I, M>| {
            if let Some(existing) = p.modules.get_mut(&module_ident) {
                let m = existing.take();
                let (m, r) = acc.run(m)?;
                existing.replace(m);
                return Ok((p, r));
            }

            let m = Module::default();
            let (m, r) = acc.run(m)?;
            p.modules.insert(module_ident.clone(), Cell::new(m));

            Ok((p, r))
        })
    }

    pub fn declare_ident<
        'a,
        Feature: Debug + 'a,
        CG: (Fn(Escaped<I>) -> String) + 'a,
        SC: (Fn(Escaped<I>) -> String) + 'a,
    >(
        feature: Feature,
        cg: CG,
        sc: SC,
    ) -> (MI, AccMonad<'a, Declared<MI, I>, Module<MI, I, M>, String>)
    where
        I: for<'c> From<&'c Feature> + 'a,
        MI: for<'c> From<&'c Feature> + 'a,
    {
        let ident: I = feature.borrow().into();
        let module_ident: MI = feature.borrow().into();

        (
            module_ident.clone(),
            AccMonad::with_acc(move |mut m: Module<MI, I, M>| {
                let feature_name = format!("{:?}", feature);
                let codegen_ident = ident.codegen_variant();
                let ident = ident.clone().escaped();
                let codegen_ident = codegen_ident.escaped();

                let declared_ident = Declared(module_ident.clone().escaped(), ident.clone());

                if m.rendered.insert(feature_name.clone()) {
                    m.try_add_ident(&ident, &feature_name)?;
                    m.try_add_ident(&codegen_ident, &format!("Codegen({})", &feature_name))?;

                    m.buffer
                        .set_slot(&feature_name, cg(codegen_ident), sc(ident.clone()));
                }

                Ok((m, declared_ident))
            }),
        )
    }

    pub fn declare_feature<'a, Feature: Debug + 'a, CG: Display + 'a, SC: Display + 'a>(
        feature: Feature,
        cg: CG,
        sc: SC,
    ) -> (MI, AccMonad<'a, (), Module<MI, I, M>, String>)
    where
        MI: for<'c> From<&'c Feature> + 'a,
    {
        let module_ident: MI = feature.borrow().into();

        (
            module_ident,
            AccMonad::with_acc(move |mut m: Module<MI, I, M>| {
                let feature_name = format!("{:?}", feature);

                if m.rendered.insert(feature_name.clone()) {
                    m.buffer
                        .set_slot(&feature_name, format!("{}", cg), format!("{}", sc));
                }

                Ok((m, ()))
            }),
        )
    }

    pub fn import_ident<'a>(
        ident: Declared<MI, I>,
    ) -> AccMonad<'a, Imported<I>, Module<MI, I, M>, String>
    where
        I: 'a,
        MI: 'a,
    {
        AccMonad::with_acc(move |mut m: Module<MI, I, M>| {
            let import_key = (ident.0.clone().unwrap(), ident.1.clone().unwrap());
            if let Some(existing) = m.imported.get(&import_key) {
                let existing = existing.to_owned();
                return Ok((m, existing));
            }

            let mut local_ident = ident.1.clone().unwrap().import_variant().escaped();
            let import_feature_name = format!("Imported({}, {})", &ident.0, &ident.1);
            while m.try_add_ident(&local_ident, &import_feature_name).is_err() {
                local_ident = local_ident.unwrap().import_variant().escaped();
            }

            let imported = m
                .imported
                .entry(import_key)
                .or_insert(Imported(local_ident))
                .clone();

            Ok((m, imported))
        })
    }
}
