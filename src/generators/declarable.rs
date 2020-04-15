use regex::Regex;
use std::fmt::Display;
use std::iter::{repeat, repeat_with, Map};
use std::marker::PhantomData;

#[derive(Hash, PartialOrd, PartialEq, Ord, Eq)]
pub struct HierarchicalIdentifier<T>(pub T, pub Vec<T>);
pub struct Escaped<T: Sized>(T, T);

pub trait Escapable: Sized {
    fn escape(self: Self) -> Option<Self>;
    fn escaped(self: Self) -> Option<Escaped<Self>> {
        self.escape().map(|escaped| Escaped(escaped, self))
    }
}

pub trait Symbol: Sized + Escapable {
    type Iter: Iterator<Item = Self>;
    fn alternatives(self: Self) -> Self::Iter;
}

impl<T> Symbol for T
where
    T: Display + From<String> + Escapable,
{
    type Iter = UnderscoreAlternatives<T>;

    fn alternatives(self: Self) -> UnderscoreAlternatives<T> {
        UnderscoreAlternatives {
            last_raw: self.to_string(),
            orig: PhantomData,
        }
    }
}

pub struct UnderscoreAlternatives<T> {
    last_raw: String,
    orig: PhantomData<T>,
}

impl<T> Iterator for UnderscoreAlternatives<T>
where
    T: Display + From<String> + Escapable,
{
    type Item = T;

    fn next(&mut self) -> Option<Self::Item> {
        self.last_raw = format!("{}_", self.last_raw);
        T::from(self.last_raw.clone())
    }
}

// Entrypoint -> Give me a identifier from a Type
// for each identifier, do not re-enter
