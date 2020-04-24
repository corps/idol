use crate::dep_mapper::DepMapper;
use std::collections::HashMap;
use std::hash::Hash;
use std::ops::Deref;

pub trait Acc: Default {
    fn concat(self, b: Self) -> Self;
}

impl<A: Acc> Acc for Option<A> {
    fn concat(self, b: Self) -> Self {
        match self {
            Some(a) => match b {
                Some(b) => Some(a.concat(b)),
                _ => Some(a),
            },
            _ => b,
        }
    }
}

impl<K: Eq + Hash + Clone, V: Clone> Acc for HashMap<K, V> {
    fn concat(self, b: Self) -> Self {
        self.iter()
            .chain(b.iter())
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect()
    }
}

pub struct AccMonad<'a, R, A> {
    inner: Box<dyn Fn(A) -> (A, R) + 'a>,
}

impl<'a, R, A: Acc> AccMonad<'a, R, A> {
    pub fn unit<F: Fn() -> R + 'a>(f: F) -> AccMonad<'a, R, A> {
        AccMonad {
            inner: Box::new(move |_| (A::default(), f())),
        }
    }

    pub fn and_then<'b, S, F: Fn(R) -> AccMonad<'b, S, A> + 'b>(
        &'b self,
        f: F,
    ) -> AccMonad<'b, S, A> {
        AccMonad {
            inner: Box::new(move |acc| -> (A, S) {
                let (acc, r) = self.inner.deref()(acc);
                f(r).inner.deref()(acc)
            }),
        }
    }

    pub fn and_then_acc<F: Fn(A) -> (A, R) + 'a>(f: F) -> AccMonad<'a, R, A> {
        AccMonad {
            inner: Box::new(move |acc| f(acc)),
        }
    }

    pub fn render<F: Fn(A) -> B, B>(self, f: F) -> B {
        let (acc, _) = self.inner.deref()(A::default());
        f(acc)
    }
}
