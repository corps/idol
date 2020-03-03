extern crate idol;
extern crate structopt;

use idol::config::Configuration;
use std::collections::btree_map::Keys;
use std::collections::{BTreeMap, HashMap};
use structopt::StructOpt;

fn main() -> Result<(), i32> {
    let mut opt = Configuration::from_args();
    opt.apply_configuration();

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
