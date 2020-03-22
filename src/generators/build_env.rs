use fs_extra::copy_items;
use fs_extra::dir::CopyOptions;
use std::path::PathBuf;
use std::{fs, io};
use tempdir::TempDir;

struct BuildEnv {
    build_dir: TempDir,
}

impl BuildEnv {
    pub fn new() -> BuildEnv {
        BuildEnv {
            build_dir: TempDir::new("idol-build").unwrap(),
        }
    }

    pub fn start_write(&self, rel_path: PathBuf) -> io::Result<Box<dyn io::Write>> {
        let abs_path = self.build_dir.path().join(rel_path);
        fs::DirBuilder::new()
            .recursive(true)
            .create(abs_path.parent().unwrap())?;

        Ok(Box::new(fs::File::create(abs_path)?))
    }

    pub fn copy_into(&self, output_dir: PathBuf) -> Result<(), fs_extra::error::Error> {
        let options = CopyOptions {
            overwrite: true,
            copy_inside: true,
            ..CopyOptions::new()
        };

        copy_items(
            &self
                .build_dir
                .path()
                .read_dir()?
                .map(|e| e.unwrap().path())
                .collect(),
            output_dir,
            &options,
        )?;

        Ok(())
    }
}
