use crate::generators::acc_monad::AccMonad;
use crate::generators::identifiers::{CodegenIdentifier, Escapable, Escaped, ModuleIdentifier};
use crate::generators::slotted_buffer::{BufferManager, SlottedBuffer};
use std::borrow::Borrow;
use std::collections::{HashMap, HashSet};
use std::fmt::{Debug, Display, Formatter};
use std::hash::{Hash, Hasher};

pub struct Module<MI: ModuleIdentifier, I: CodegenIdentifier, M: BufferManager> {
    imported: HashSet<(Escaped<MI>, Imported<I>)>,
    rendered: HashSet<String>,
    idents: HashMap<Escaped<I>, String>,
    buffer: SlottedBuffer<M>,
}

impl<MI: ModuleIdentifier, I: CodegenIdentifier, M: BufferManager> Default for Module<MI, I, M> {
    fn default() -> Self {
        Module {
            imported: HashSet::default(),
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

pub struct Declared<I: Escapable>(Escaped<I>);

impl<T: Sized + Display + Escapable> Display for Declared<T> {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl<T: Sized + Debug + Escapable> Debug for Declared<T> {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self.0)
    }
}

impl<T: Sized + Hash + Escapable> Hash for Declared<T> {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.0.hash(state)
    }
}

impl<T: Sized + PartialEq + Escapable> PartialEq for Declared<T> {
    fn eq(&self, other: &Self) -> bool {
        self.0.eq(&other.0)
    }
}

impl<T: Sized + Eq + Escapable> Eq for Declared<T> {}

impl<T: Sized + Clone + Escapable> Clone for Declared<T> {
    fn clone(&self) -> Self {
        Declared(self.0.clone())
    }
}

pub struct Imported<I: Escapable>(Escaped<I>);

impl<T: Sized + Display + Escapable> Display for Imported<T> {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl<T: Sized + Debug + Escapable> Debug for Imported<T> {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self.0)
    }
}

impl<T: Sized + Hash + Escapable> Hash for Imported<T> {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.0.hash(state)
    }
}

impl<T: Sized + PartialEq + Escapable> PartialEq for Imported<T> {
    fn eq(&self, other: &Self) -> bool {
        self.0.eq(&other.0)
    }
}

impl<T: Sized + Eq + Escapable> Eq for Imported<T> {}

impl<T: Sized + Clone + Escapable> Clone for Imported<T> {
    fn clone(&self) -> Self {
        Imported(self.0.clone())
    }
}

pub struct Project<MI: ModuleIdentifier, I: CodegenIdentifier, M: BufferManager> {
    modules: HashMap<MI, Module<MI, I, M>>,
}

impl<MI: ModuleIdentifier, I: CodegenIdentifier, M: BufferManager> Project<MI, I, M> {
    pub fn declare_ident<
        'a,
        Feature: Debug + 'a,
        CG: (Fn(Declared<I>) -> String) + 'a,
        SC: (Fn(Declared<I>) -> String) + 'a,
    >(
        feature: Feature,
        cg: CG,
        sc: SC,
    ) -> AccMonad<'a, Declared<I>, Module<MI, I, M>, String>
    where
        I: for<'c> From<&'c Feature> + 'a,
    {
        let ident: I = feature.borrow().into();

        AccMonad::with_acc(move |mut m: Module<MI, I, M>| {
            let feature_name = format!("{:?}", feature);
            let codegen_ident = ident.codegen_variant();
            let ident = ident.clone().escaped();
            let codegen_ident = codegen_ident.escaped();

            let declared_ident = Declared(ident.clone());
            let declared_codegen_ident = Declared(codegen_ident.clone());

            if m.rendered.insert(feature_name.clone()) {
                m.try_add_ident(&ident, &feature_name)?;
                m.try_add_ident(&codegen_ident, &format!("Codegen({})", &feature_name))?;

                m.buffer.set_slot(
                    &feature_name,
                    cg(declared_codegen_ident),
                    sc(declared_ident.clone()),
                );
            }

            Ok((m, declared_ident))
        })
    }

    pub fn declare_feature<'a, Feature: Debug + 'a, CG: Display + 'a, SC: Display + 'a>(
        feature: Feature,
        cg: CG,
        sc: SC,
    ) -> AccMonad<'a, (), Module<MI, I, M>, String> {
        AccMonad::with_acc(move |mut m: Module<MI, I, M>| {
            let feature_name = format!("{:?}", feature);

            if m.rendered.insert(feature_name.clone()) {
                m.buffer
                    .set_slot(&feature_name, format!("{}", cg), format!("{}", sc));
            }

            Ok((m, ()))
        })
    }
}
