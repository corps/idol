use std::path::PathBuf;
use std::vec::Vec;
use structopt::StructOpt;

#[derive(StructOpt)]
#[structopt(name = "idol")]
pub struct Configuration {
    /// Directories to search for module files within.  This is in addition to the directories of any src files.
    #[structopt(long = "include", short = "I")]
    pub include_dirs: Vec<String>,
    /// Which extensions to search modules by.  This is in addition to those on any src files.
    #[structopt(long = "extension", short = "x")]
    pub extensions: Vec<String>,
    pub src_files: Vec<String>,
}

impl Configuration {
    pub fn process_src_files(&mut self) -> Vec<String> {
        let mut result = vec![];
        for src in self.src_files.iter() {
            let src_path = PathBuf::from(src);
            let dir = src_path
                .parent()
                .map(|p| String::from(p.to_str().unwrap()))
                .unwrap_or_else(|| String::from(""));

            if !self.include_dirs.contains(&dir) {
                self.include_dirs.push(dir);
            }

            let ext = src_path
                .extension()
                .map(|oss| String::from(oss.to_string_lossy()))
                .unwrap_or_else(|| String::from(""));

            if !self.extensions.contains(&ext) {
                self.extensions.push(ext);
            }

            let module_name = src_path
                .file_stem()
                .map(|oss| String::from(oss.to_string_lossy()))
                .unwrap_or_else(|| String::from(""));

            result.push(module_name);
        }

        result
    }
}
