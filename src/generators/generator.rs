use std::collections::HashSet;

pub struct GeneratorState<Identifier, Context> {
    seen: HashSet<GeneratorNode<Identifier, Context>>,
    q: Vec<GeneratorNode<Identifier, Context>>,
}

pub struct GeneratorNode<Identifier, Context> {
    context: Context,
    identifier: Identifier,
}

// MyCalls deps parent
