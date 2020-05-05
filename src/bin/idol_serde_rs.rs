extern crate idol;
extern crate structopt;

use idol::generators::features::Feature;
use idol::generators::rust::rust_file::{RustProjectContext, RustProjectMonad};
use idol::generators::rust::rust_pojo::RustPojo;
use idol::models::schema::{Module, Reference};
use idol::modules_store::ModulesStore;

use idol::config::Configuration;
use idol::generators::project::ProjectContext;
use idol::loader::ModuleFileLoader;
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
    #[structopt(long = "out", short = "o")]
    pub out: String,
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

    let idol_serde = IdolSerdeRs::new(&store);
    let project = idol_serde.generate().render().map_err(|err| {
        eprintln!("Error while running code generator: {}", err);
        1
    })?;

    project.write(config.out.into()).map_err(|err| {
        eprintln!("Error writing generator output: {}", err);
        1
    })?;

    Ok(())
}

pub struct IdolSerdeRs<'a> {
    store: &'a ModulesStore,
}

impl<'a> IdolSerdeRs<'a> {
    pub fn new(store: &'a ModulesStore) -> Self {
        IdolSerdeRs { store }
    }

    pub fn generate(&self) -> RustProjectMonad<()> {
        // Consistent ordering.
        let mut keys: Vec<String> = self.store.resolved.keys().cloned().collect();
        keys.sort();

        RustProjectMonad::for_each(
            keys.iter().map(|module_name| {
                self.generate_module(self.store.resolved.get(module_name).unwrap())
            }),
        )
    }

    pub fn generate_module<'b: 'c, 'c>(&'b self, module: &'c Module) -> RustProjectMonad<'c, ()> {
        RustProjectMonad::for_each(module.types_dependency_ordering.iter().map(|type_name| {
            RustPojo::new(Reference::from((
                module.module_name.to_string(),
                type_name.to_string(),
            )))
            .declare(self.store)
        }))
    }
}
