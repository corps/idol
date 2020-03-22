pub trait Scope {
    type Declaration;
    fn write(self, writer: Box<Writer>);
    fn declare<T>(t: T) -> Result<Declaration, String>;
}

pub trait Declarable {
    type Declaration;
}

// FileScope HashSet<Declarable>
//
// Semantic -> CodeParts (Scope) -> Writers
// Semantic Hashes
//

// File impl Scope<RustFileDecalaration>
//  declare(Type.into())

// TypeA { suggestedName: "
