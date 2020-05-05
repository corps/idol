use crate::generators::acc_monad::AccMonad;
use crate::generators::build_env::BuildEnv;
use crate::generators::identifiers::{CodegenIdentifier, Escaped, ModuleIdentifier};
use crate::generators::slotted_buffer::{BufferManager, SlottedBuffer};
use proc_macro2::{Ident, Span, TokenStream};
use quote::{ToTokens, TokenStreamExt};
use std::cell::Cell;
use std::collections::{HashMap, HashSet};
use std::fmt::Debug;
use std::hash::{Hash, Hasher};
use std::path::PathBuf;

pub trait ModuleManager<MI: ModuleIdentifier, I: CodegenIdentifier>: BufferManager {
    fn render_imports(imported: &HashMap<(MI, I), I>) -> String;
}

pub struct ModuleContext<MI: ModuleIdentifier, I: CodegenIdentifier, M: ModuleManager<MI, I>> {
    pub(crate) rendered: HashSet<String>,
    pub(crate) idents: HashMap<Escaped<I>, String>,
    pub(crate) imported: HashMap<(MI, I), I>,
    pub(crate) buffer: SlottedBuffer<M>,
}

pub struct ProjectContext<MI: ModuleIdentifier, I: CodegenIdentifier, M: ModuleManager<MI, I>> {
    pub modules: HashMap<MI, Cell<Option<ModuleContext<MI, I, M>>>>,
}

impl<MI: ModuleIdentifier, I: CodegenIdentifier, M: ModuleManager<MI, I>> Default
    for ModuleContext<MI, I, M>
{
    fn default() -> Self {
        ModuleContext {
            rendered: HashSet::default(),
            imported: HashMap::default(),
            idents: HashMap::default(),
            buffer: SlottedBuffer::default(),
        }
    }
}

impl<MI: ModuleIdentifier, I: CodegenIdentifier, M: ModuleManager<MI, I>> ModuleContext<MI, I, M> {
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
pub struct Imported<I: CodegenIdentifier>(Escaped<I>);

impl<I: CodegenIdentifier> ToTokens for Imported<I> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let ident_str = format!("{}", self.0);
        tokens.append(Ident::new(&ident_str, Span::call_site()))
    }
}

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

#[derive(Debug)]
pub struct Declared<MI: ModuleIdentifier, I: CodegenIdentifier>(
    pub(crate) Escaped<MI>,
    pub(crate) Escaped<I>,
);

impl<MI: ModuleIdentifier, I: CodegenIdentifier> Declared<MI, I> {
    pub fn extrn(mi: &MI, i: &I) -> Declared<MI, I> {
        Declared(mi.clone().escaped(), i.clone().escaped())
    }
}

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

impl<MI: ModuleIdentifier, I: CodegenIdentifier> Declared<MI, I> {
    pub fn imported<'a, M: ModuleManager<MI, I>>(
        self,
    ) -> AccMonad<'a, Imported<I>, ModuleContext<MI, I, M>, String>
    where
        I: 'a,
        MI: 'a,
        M: 'a,
    {
        ProjectContext::import_ident(self)
    }
}

impl<'a, MI: ModuleIdentifier + 'a, I: CodegenIdentifier + 'a, M: ModuleManager<MI, I> + 'a> Default
    for ProjectContext<MI, I, M>
{
    fn default() -> Self {
        Self::new()
    }
}

impl<'a, MI: ModuleIdentifier + 'a, I: CodegenIdentifier + 'a, M: ModuleManager<MI, I> + 'a>
    ProjectContext<MI, I, M>
{
    pub fn new() -> Self {
        ProjectContext {
            modules: HashMap::new(),
        }
    }

    pub fn write(mut self, target_dir: PathBuf) -> std::io::Result<()> {
        let mut build_env = BuildEnv::new()?;

        let pairs: Vec<(MI, Cell<Option<ModuleContext<MI, I, M>>>)> =
            self.modules.drain().collect();

        // TODO: MAKE THIS BETTERER.
        // It sucks that import handling is so adhoc and out of band, strapped onto the side of
        // the rendering processing.  That said, when is a clearly better time to do it?
        // Would hate to push that responsibility back onto the individual features.
        // Possibly the render accumulator would learn how to build up the rendered imports
        // into the buffer inside of the import call.
        // What if rendering imports needs to know about the final set of imports to correctly
        // render?  IE: grouping up imports from the same module.
        for (mi, mut m) in pairs {
            let mut m = m.take().unwrap();
            m.buffer
                .prepend_slot("imports", M::render_imports(&m.imported), "".to_string());

            m.buffer.update_from_target(target_dir.join(mi.path()))?;

            let mut writer = build_env.start_write(mi.path())?;
            m.buffer.write(&mut writer);
        }

        build_env
            .copy_into(target_dir)
            .map_err(|fe| std::io::Error::new(std::io::ErrorKind::Other, fe))?;

        Ok(())
    }

    pub fn run_in_module<R: 'a>(
        module_ident: MI,
        acc: AccMonad<'a, R, ModuleContext<MI, I, M>, String>,
    ) -> AccMonad<'a, R, ProjectContext<MI, I, M>, String> {
        AccMonad::with_acc(move |mut p: ProjectContext<MI, I, M>| {
            if let Some(existing) = p.modules.get_mut(&module_ident) {
                let m = existing.take();
                let (m, r) = acc.run(m.expect("Re-entry inside of get_declaration!"))?;
                existing.replace(Some(m));
                return Ok((p, r));
            }

            let m = ModuleContext::default();
            let (m, r) = acc.run(m)?;
            p.modules.insert(module_ident.clone(), Cell::new(Some(m)));

            Ok((p, r))
        })
    }

    fn import_ident(
        ident: Declared<MI, I>,
    ) -> AccMonad<'a, Imported<I>, ModuleContext<MI, I, M>, String> {
        AccMonad::with_acc(move |mut m: ModuleContext<MI, I, M>| {
            let import_key = (ident.0.clone().unwrap(), ident.1.clone().unwrap());

            if let Some(existing) = m.imported.get(&import_key) {
                let existing = existing.to_owned();
                return Ok((m, Imported(existing.escaped())));
            }

            let mut local_ident = ident.1.clone().unwrap().import_variant().escaped();
            let import_feature_name = format!("Imported({}, {})", &ident.0, &ident.1);
            while m.try_add_ident(&local_ident, &import_feature_name).is_err() {
                local_ident = local_ident.unwrap().import_variant().escaped();
            }

            let imported = m
                .imported
                .entry(import_key)
                .or_insert(local_ident.unwrap().clone())
                .clone();

            Ok((m, Imported(imported.escaped())))
        })
    }
}
