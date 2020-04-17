use serde::export::Formatter;
use std::fmt::Display;

pub struct Escaped<T: Sized>(T, T);

impl<T: Sized + Display> Display for Escaped<T> {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl<T: Sized> Escaped<T> {
    pub fn original(&self) -> &T {
        &self.1
    }

    pub fn unwrap(self) -> T {
        self.0
    }
}

pub trait Escapable: Sized {
    fn escape(&self) -> Option<Self>;
    fn escaped(self) -> Option<Escaped<Self>> {
        self.escape().map(|escaped| Escaped(escaped, self))
    }
}
