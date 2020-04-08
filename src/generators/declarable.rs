pub trait Scope {
    type Declaration;
    type Symbol;

    fn write(self) -> Result<(), String>;
    fn declare<T, D>(t: T) -> Result<Self::Declaration, String>
    where
        D: Declarable<Declaration = Self::Declaration, Symbol = Self::Symbol>,
        T: Into<D>;
}

pub trait Declarable {
    type Declaration;
    type Symbol;

    fn suggested_name() -> Self::Symbol;
    fn named(name: Self::Symbol) -> Self::Declaration;
}
