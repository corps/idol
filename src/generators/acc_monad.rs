use std::error::Error;
use std::ops::Deref;

pub struct AccMonad<'a, R, A, E> {
    inner: Box<dyn Fn(A) -> Result<(A, R), E> + 'a>,
}

impl<'a, R, A, E> AccMonad<'a, R, A, E> {
    pub fn unit<F: Fn() -> R + 'a>(f: F) -> AccMonad<'a, R, A, E> {
        AccMonad {
            inner: Box::new(move |a| Ok((a, f()))),
        }
    }

    pub fn and_then<'b, S, F: Fn(R) -> AccMonad<'b, S, A, E> + 'b>(
        &'b self,
        f: F,
    ) -> AccMonad<'b, S, A, E> {
        AccMonad {
            inner: Box::new(move |acc| {
                let (acc, r) = self.inner.deref()(acc)?;
                f(r).inner.deref()(acc)
            }),
        }
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
