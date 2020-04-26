use serde::export::fmt::Debug;
use serde::export::Formatter;
use std::fmt::Display;
use std::hash::{Hash, Hasher};

pub struct Escaped<T: Sized>(T);

impl<T: Sized + Clone> Clone for Escaped<T> {
    fn clone(&self) -> Self {
        Escaped(self.0.clone())
    }
}

impl<T: Sized + Display> Display for Escaped<T> {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl<T: Sized + Debug> Debug for Escaped<T> {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self.0)
    }
}

impl<T: Sized + Hash> Hash for Escaped<T> {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.0.hash(state)
    }
}

impl<T: Sized + PartialEq> PartialEq for Escaped<T> {
    fn eq(&self, other: &Self) -> bool {
        self.0.eq(&other.0)
    }
}

impl<T: Sized + Eq> Eq for Escaped<T> {}

pub trait Escapable: Sized {
    fn escape(&self) -> Self;
    fn escaped(self) -> Escaped<Self> {
        Escaped(self.escape())
    }
}

pub trait CodegenIdentifier: Escapable + Hash + Eq + Display + Clone {
    fn codegen_variant(&self) -> Self;
}

pub trait ModuleIdentifier: Escapable + Hash + Eq + Display + Clone {}
