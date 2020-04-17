use crate::generators::slotted_buffer::{Escaper, SlottedBuffer};
use crate::generators::Generator;
use serde::export::Formatter;
use std::borrow::Borrow;
use std::fmt::Debug;
use std::fmt::Display;
use std::path::PathBuf;

pub struct Declared<D>(D);

impl<D: Debug> Debug for Declared<D> {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self.0)
    }
}

pub trait Declarable<E: Escaper + Default, CG: Display, SC: Display, MI, I: Debug> {
    fn render(&self, generator: &mut Generator<'_, E>) -> Result<(CG, SC), String>;
    fn identifiers(&self) -> (MI, I);
}

impl<'a, E: Escaper + Default> Generator<'a, E> {
    pub fn declare<
        I: Debug,
        MI,
        F: Declarable<E, CG, SC, MI, I> + Debug,
        CG: Display,
        SC: Display,
    >(
        &mut self,
        f: F,
    ) -> Result<(Declared<MI>, Declared<I>), String>
    where
        PathBuf: for<'b> From<&'b MI>,
    {
        let (module_identifier, identifier) = f.identifiers();

        if self.rendered.insert(format!("{:?}", f)) {
            let path: PathBuf = module_identifier.borrow().into();

            let (cg, sc) = f.render(self)?;
            let slotted_buffer = self
                .modules
                .entry(path)
                .or_insert_with(|| SlottedBuffer::default());

            slotted_buffer.set_slot(
                format!("{:?}", identifier),
                format!("{}", cg),
                format!("{}", sc),
            );
        }

        Ok((Declared(module_identifier), Declared(identifier)))
    }
}
