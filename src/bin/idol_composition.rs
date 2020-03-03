extern crate idol;
extern crate structopt;

use idol::config::Configuration;
use idol::loader::ModuleFileLoader;
use idol::modules_store::ModulesStore;
use structopt::StructOpt;

fn main() -> Result<(), i32> {
    let mut opt: Configuration = Configuration::from_args();
    let module_names = opt.process_src_files();

    let file_loader = ModuleFileLoader::new(opt.include_dirs.clone(), opt.extensions.clone());
    let mut store = ModulesStore::new(file_loader);

    store.load_modules(&module_names).map_err(|err| {
        eprintln!("Error processing modules: {}", err);
        1
    })?;

    println!("{}", serde_json::to_string(&store.resolved).unwrap());

    Ok(())
}
