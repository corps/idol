extern crate idol;
extern crate structopt;

use idol::config::Configuration;
use idol::loader::ModuleFileLoader;
use idol::modules_store::ModulesStore;
use idol::utils::ordered_by_keys;
use structopt::StructOpt;

#[derive(StructOpt)]
#[structopt(name = "idol_composition")]
struct CLIConfiguration {
    /// Directories to search for module files within.  This is in addition to the directories of any src files.
    #[structopt(long = "include", short = "I")]
    pub include_dirs: Vec<String>,
    /// Which extensions to search modules by.  This is in addition to those on any src files.
    #[structopt(long = "extension", short = "x")]
    pub extensions: Vec<String>,
    pub src_files: Vec<String>,
    #[structopt(long = "rust_module", short = "m")]
    pub rust_module: String,
}

impl From<&CLIConfiguration> for Configuration {
    fn from(f: &CLIConfiguration) -> Self {
        Configuration {
            include_dirs: f.include_dirs.clone(),
            extensions: f.extensions.clone(),
            src_files: f.src_files.clone(),
        }
    }
}

fn main() -> Result<(), i32> {
    let config = CLIConfiguration::from_args();
    let mut opt: Configuration = Configuration::from(&config);
    let module_names = opt.process_src_files();

    let file_loader = ModuleFileLoader::new(opt.include_dirs.clone(), opt.extensions.clone());
    let mut store = ModulesStore::new(file_loader);

    store.load_modules(&module_names).map_err(|err| {
        eprintln!("Error processing modules: {}", err);
        1
    })?;

    Ok(())
}
