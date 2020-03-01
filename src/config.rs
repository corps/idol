use std::path::PathBuf;
use std::vec::Vec;
use structopt::StructOpt;

#[derive(StructOpt)]
#[structopt(name = "idol")]
pub struct Configuration {
    /// Directories to search for module files within.  This is in addition to the directories of any src files.
    #[structopt(long = "include", short = "I")]
    include_dirs: Vec<String>,
    /// Which extensions to search modules by.  This is in addition to those on any src files.
    #[structopt(long = "extension", short = "x")]
    extensions: Vec<String>,
    /// output the resulting types as normalized declarations
    #[structopt(long = "as-declaration", short = "D")]
    as_declarations: bool,
    src_files: Vec<String>,
}

/*
_ -> a -> b -> c -> d
       -> c

zero arity type: _ => t
needs

BaseType
BaseType


TypeStruct

Structure
Enumeration
TypeStruct


a  b c
b  d
c  d
d

*/

pub fn apply_defaults(conf: &mut Configuration) -> () {
    for src in conf.src_files.iter() {
        let src_path = PathBuf::from(src);
        let dir = src_path
            .parent()
            .map(|p| String::from(p.to_str().unwrap()))
            .unwrap_or_else(|| String::from(""));

        if !conf.include_dirs.contains(&dir) {
            conf.include_dirs.push(dir);
        }

        let ext = src_path
            .extension()
            .map(|oss| String::from(oss.to_string_lossy()))
            .unwrap_or_else(|| String::from(""));

        if !conf.extensions.contains(&ext) {
            conf.extensions.push(ext);
        }
    }

    ()
}
