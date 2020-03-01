#[macro_use]
extern crate lazy_static;
extern crate is_executable;
extern crate regex;
extern crate structopt;

pub mod config;
pub mod deconstructors;
pub mod dep_mapper;
pub mod loader;
pub mod models;
pub mod module_resolver;
pub mod modules_store;
pub mod type_comparison;
pub mod type_composer;
pub mod type_dec_parser;
pub mod type_resolver;
