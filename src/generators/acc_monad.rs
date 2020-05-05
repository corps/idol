use std::ops::Deref;
use std::sync::Arc;

pub struct AccMonad<'a, R, A, E> {
    inner: Arc<dyn Fn(A) -> Result<(A, R), E> + 'a>,
}

impl<'a, A: 'a, E: 'a> Default for AccMonad<'a, (), A, E> {
    fn default() -> Self {
        AccMonad::lift_value(|| ())
    }
}

impl<'a, A: 'a, R: 'a, E: 'a> From<Option<AccMonad<'a, R, A, E>>>
    for AccMonad<'a, Option<R>, A, E>
{
    fn from(o: Option<AccMonad<'a, R, A, E>>) -> Self {
        match o {
            None => AccMonad::lift_value(|| None),
            Some(v) => v.map(|v| Some(v)),
        }
    }
}

impl<'a, A: 'a, R: 'a, E: 'a> Default for AccMonad<'a, Option<R>, A, E> {
    fn default() -> Self {
        AccMonad::lift_value(|| None)
    }
}

impl<'a, R: 'a, A: 'a, E: 'a> Clone for AccMonad<'a, R, A, E> {
    fn clone(&self) -> Self {
        AccMonad {
            inner: self.inner.clone(),
        }
    }
}

impl<'a, R: Clone + 'a, A: 'a, E: Clone + 'a> From<Result<R, E>> for AccMonad<'a, R, A, E> {
    fn from(r: Result<R, E>) -> Self {
        match r {
            Ok(v) => AccMonad::lift_value(move || v.clone()),
            Err(e) => AccMonad::with_acc(move |_| Err(e.clone())),
        }
    }
}

impl<'a, R: 'a, A: 'a, E: 'a> AccMonad<'a, R, A, E> {
    pub fn lift_value<F: Fn() -> R + 'a>(f: F) -> AccMonad<'a, R, A, E> {
        AccMonad {
            inner: Arc::new(move |a| Ok((a, f()))),
        }
    }

    pub fn for_each<I: Iterator<Item = AccMonad<'a, R, A, E>>>(iter: I) -> AccMonad<'a, (), A, E> {
        iter.fold(AccMonad::default(), |r, n| r.chain(n.result_ignored()))
    }

    pub fn collect<I: Iterator<Item = AccMonad<'a, R, A, E>>>(
        iter: I,
    ) -> AccMonad<'a, Vec<R>, A, E> {
        iter.fold(AccMonad::lift_value(|| vec![]), |r, n| {
            n.concat(r).map(|(i, mut vec)| {
                vec.push(i);
                vec
            })
        })
    }

    pub fn concat<S: 'a>(self, other: AccMonad<'a, S, A, E>) -> AccMonad<'a, (R, S), A, E> {
        AccMonad {
            inner: Arc::new(move |acc| {
                let (acc, r) = self.run(acc)?;
                let (acc, s) = other.run(acc)?;

                Ok((acc, (r, s)))
            }),
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
            inner: Arc::new(move |acc| {
                let (acc, _) = self.inner.deref()(acc)?;
                next.inner.deref()(acc)
            }),
        }
    }

    pub fn map<S, F: Fn(R) -> S + 'a>(self, f: F) -> AccMonad<'a, S, A, E>
    where
        E: 'a,
        A: 'a,
        S: 'a,
        R: 'a,
    {
        AccMonad {
            inner: Arc::new(move |acc| {
                let (acc, r) = self.inner.deref()(acc)?;
                Ok((acc, f(r)))
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
            inner: Arc::new(move |acc| {
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
        self.chain(AccMonad::lift_value(|| ()))
    }

    pub fn map_err<'b, EE, F: Fn(E) -> EE + 'b>(&'b self, f: F) -> AccMonad<'b, R, A, EE> {
        AccMonad {
            inner: Arc::new(move |acc| self.inner.deref()(acc).map_err(|e| f(e))),
        }
    }

    pub fn with_acc<F: Fn(A) -> Result<(A, R), E> + 'a>(f: F) -> AccMonad<'a, R, A, E> {
        AccMonad {
            inner: Arc::new(move |acc| f(acc)),
        }
    }

    pub fn run_acc(&self, a: A) -> Result<A, E> {
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

impl<'a, R: 'a, A: Default + 'a, E: 'a> AccMonad<'a, R, A, E> {
    pub fn render(&self) -> Result<A, E> {
        let (acc, _) = self.inner.deref()(A::default())?;
        Ok(acc)
    }
}

impl<'a, R: 'a, A: 'a, B: 'a, E: 'a> AccMonad<'a, Option<AccMonad<'a, R, B, E>>, A, E> {
    pub fn deep_lift_some<F: Fn() -> R + 'a>(f: F) -> Self {
        let inner = Arc::new(move |a: B| Ok((a, f())));
        AccMonad::with_acc(move |a| {
            Ok((
                a,
                Some(AccMonad {
                    inner: inner.clone(),
                }),
            ))
        })
    }
}
