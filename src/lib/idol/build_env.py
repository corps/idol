import tempfile
import os.path
import os
import shutil


class BuildEnv:
    codegen_root: str
    build_dir: str

    def __init__(self, name: str, codegen_root: str):
        self.build_dir = tempfile.mkdtemp(prefix=name)
        self.codegen_root = codegen_root

    def abs_path(self, rel_path):
        return os.path.abspath(os.path.join(self.build_dir, rel_path))

    def write_build_file(self, rel_path: str, contents: str):
        abs_path = self.abs_path(rel_path)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "w") as file:
            file.write(contents)

    def finalize(self, output_dir: str, replace: bool = False):
        existing_codegen = os.path.join(output_dir, self.codegen_root)
        if os.path.exists(existing_codegen):
            shutil.rmtree(existing_codegen)

        recursive_copy(self.build_dir, output_dir, replace)


def recursive_copy(src: str, dest: str, replace: bool):
    if os.path.isdir(src):
        if not os.path.isdir(dest):
            os.makedirs(dest, exist_ok=True)
        files = os.listdir(src)
        for f in files:
            recursive_copy(os.path.join(src, f), os.path.join(dest, f), replace)
    else:
        if not replace and os.path.exists(dest):
            print("Skipping", dest, "...")
        else:
            shutil.copyfile(src, dest)
