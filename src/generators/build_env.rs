use fs_extra::copy_items;
use fs_extra::dir::CopyOptions;
use std::collections::HashSet;
use std::path::PathBuf;
use std::{fs, io};
use tempdir::TempDir;

pub struct BuildEnv {
    build_dir: TempDir,
    written: HashSet<PathBuf>,
}

impl BuildEnv {
    pub fn new() -> std::io::Result<BuildEnv> {
        Ok(BuildEnv {
            build_dir: TempDir::new("idol-build")?,
            written: HashSet::new(),
        })
    }

    pub fn start_write(&mut self, rel_path: PathBuf) -> io::Result<Box<dyn io::Write>> {
        let abs_path = self.build_dir.path().join(&rel_path);

        if self.written.contains(&rel_path) {
            return Err(io::Error::new(
                io::ErrorKind::AlreadyExists,
                format!(
                    "Path {} was written to twice!  Conflicting module -> path mapping detected",
                    rel_path.as_os_str().to_string_lossy().to_string()
                ),
            ));
        }

        self.written.insert(rel_path.clone());

        fs::DirBuilder::new()
            .recursive(true)
            .create(abs_path.parent().unwrap())?;

        Ok(Box::new(fs::File::create(abs_path)?))
    }

    pub fn copy_into(&self, output_dir: PathBuf) -> Result<(), fs_extra::error::Error> {
        fs::DirBuilder::new()
            .recursive(true)
            .create(output_dir.clone())?;

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
