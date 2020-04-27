use std::borrow::Borrow;
use std::error::Error;
use std::ops::Deref;

pub struct AccMonad<'a, R, A, E> {
    inner: Box<dyn Fn(A) -> Result<(A, R), E> + 'a>,
}

impl<'a, A, E> Default for AccMonad<'a, (), A, E> {
    fn default() -> Self {
        AccMonad::unit(|| ())
    }
}

impl<'a, A: 'a, E: 'a, I: Iterator<Item = AccMonad<'a, R, A, E>>, R: 'a> From<I>
    for AccMonad<'a, (), A, E>
{
    fn from(iter: I) -> Self {
        iter.fold(Self::default(), |r, n| r.chain(n.result_ignored()))
    }
}

impl<'a, R, A, E> AccMonad<'a, R, A, E> {
    pub fn unit<F: Fn() -> R + 'a>(f: F) -> AccMonad<'a, R, A, E> {
        AccMonad {
            inner: Box::new(move |a| Ok((a, f()))),
        }
    }

    pub fn chain<S>(self, next: AccMonad<'a, S, A, E>) -> AccMonad<'a, S, A, E>
    where
        S: 'a,
        A: 'a,
        E: 'a,
        R: 'a,
    {
        AccMonad {
            inner: Box::new(move |acc| {
                let (acc, _) = self.inner.deref()(acc)?;
                next.inner.deref()(acc)
            }),
        }
    }

    pub fn and_then<S, F: Fn(R) -> AccMonad<'a, S, A, E> + 'a>(self, f: F) -> AccMonad<'a, S, A, E>
    where
        E: 'a,
        A: 'a,
        S: 'a,
        R: 'a,
    {
        AccMonad {
            inner: Box::new(move |acc| {
                let (acc, r) = self.inner.deref()(acc)?;
                f(r).inner.deref()(acc)
            }),
        }
    }

    pub fn result_ignored(self) -> AccMonad<'a, (), A, E>
    where
        A: 'a,
        E: 'a,
        R: 'a,
    {
        self.chain(AccMonad::unit(|| ()))
    }

    pub fn map_err<'b, EE, F: Fn(E) -> EE + 'b>(&'b self, f: F) -> AccMonad<'b, R, A, EE> {
        AccMonad {
            inner: Box::new(move |acc| self.inner.deref()(acc).map_err(|e| f(e))),
        }
    }

    pub fn with_acc<F: Fn(A) -> Result<(A, R), E> + 'a>(f: F) -> AccMonad<'a, R, A, E> {
        AccMonad {
            inner: Box::new(move |acc| f(acc)),
        }
    }

    pub fn render(&self, a: A) -> Result<A, E> {
        let (acc, _) = self.inner.deref()(a)?;
        Ok(acc)
    }

    pub fn unwrap(&self, a: A) -> Result<R, E> {
        let (_, r) = self.inner.deref()(a)?;
        Ok(r)
    }

    pub fn run(&self, a: A) -> Result<(A, R), E> {
        self.inner.deref()(a)
    }
}
