extern crate idol;
extern crate structopt;

use idol::config::{apply_defaults, Configuration};
use std::collections::btree_map::Keys;
use std::collections::{BTreeMap, HashMap};

fn main() -> Result<(), i32> {
    let mut opt = Configuration::from_args();
    apply_defaults(opts);

    // A merged covariant field includes all tags
    // a merged contravariant only includes the field, minus tags.

    // first pass: load all modules, find all missing references
    // complete all module loading and produce a Module Tree.
    // second pass: walk dec tree and resolve.
    // find a model,
    //   check if it has a is_a type
    //   and some other type

    Ok(())
}

// Awaiting
//
// FinishedState
//   Needs Module: X
//    /
//  Finished

// FinishedState
// AwaitingModuleData  -> LoadFailure
//

// ModuleRegistry
//
