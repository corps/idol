use crate::generators::slotted_buffer::{Escaper, SlottedBuffer};
use crate::modules_store::ModulesStore;
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

pub mod build_env;
pub mod declarable;
pub mod escaped;
pub mod rust;
pub mod slotted_buffer;

pub struct Generator<'a, E: Escaper + Default> {
    module_store: &'a ModulesStore,
    modules: HashMap<PathBuf, SlottedBuffer<E>>,
    rendered: HashSet<String>,
}
