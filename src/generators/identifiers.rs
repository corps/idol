use proc_macro2::{Ident, Literal, Punct, Spacing, Span, TokenStream};
use quote::{ToTokens, TokenStreamExt};
use serde::export::fmt::Debug;
use serde::export::Formatter;
use std::fmt::Display;
use std::hash::{Hash, Hasher};
use std::path::PathBuf;

pub struct Escaped<T: Sized>(T);

impl<T: Sized> Escaped<T> {
    pub fn unwrap(self) -> T {
        self.0
    }
}

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

impl<T: Sized + Display> ToTokens for Escaped<T> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let formatted = format!("{}", self);
        tokens.append(Ident::new(&formatted, Span::call_site()))
    }
}

impl<T: Sized + Eq> Eq for Escaped<T> {}

pub trait Escapable: Sized {
    fn escape(&self) -> Self;
    fn escaped(self) -> Escaped<Self> {
        Escaped(self.escape())
    }
}

pub trait CodegenIdentifier: Escapable + Hash + Eq + Display + Clone + Sized {
    fn codegen_variant(&self) -> Self;
    fn import_variant(&self) -> Self;
}

pub trait ModuleIdentifier: Escapable + Hash + Eq + Display + Clone + Sized {
    fn path(&self) -> PathBuf;
}

pub struct SlashComment(pub String);

impl Escapable for SlashComment {
    fn escape(&self) -> Self {
        SlashComment(self.0.replace("\n", "\\n"))
    }
}

// Unfortunately TokenStreams may be convenient for many purposes, they don't
// represent Rust comments (because comments can't be an input to a macro), thus
// we regress to creating 'fake' comments by combining slash operators and
// string literals.
impl ToTokens for SlashComment {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        tokens.append(Punct::new('/', Spacing::Joint));
        tokens.append(Punct::new('/', Spacing::Joint));
        tokens.append(Literal::string(&self.0));
    }
}

impl Display for SlashComment {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "// {}", self.0)
    }
}
