use crate::generators::slotted_buffer::{BufferManager, SlottedBuffer};
use std::collections::{HashMap, HashSet};
use std::fmt::Debug;
use std::hash::Hash;

pub struct ModuleAcc<ModuleIdent: Hash + Eq, Ident: Hash + Eq, M: BufferManager> {
    imported: HashSet<(ModuleIdent, Ident)>,
    idents: HashMap<Ident, Box<dyn Debug>>,
    rendered: SlottedBuffer<M>,
}
