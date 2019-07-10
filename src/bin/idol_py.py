#! /usr/bin/env python3

from ..models.schema import *
from contextlib import contextmanager
import argparse
import json
import sys
import select
import tempfile
import os
import shutil
from enum import Enum


class ReferenceExt(Reference):
    def display_from(self, root_module, cur_module):
        if self.module_name == cur_module:
            return self.type_name

        return f"{root_module}.{self.qualified_name}"


class TypeStructExt(TypeStruct):
    reference: ReferenceExt

    @property
    def is_primitive(self):
        return bool(self.reference.qualified_name)

    @property
    def is_reference(self):
        return not self.is_primitive

    @property
    def literal_value(self):
        if self.primitive_type == PrimitiveType.bool:
            return self.literal_bool
        elif self.primitive_type == PrimitiveType.double:
            return self.literal_double
        elif self.primitive_type == PrimitiveType.int53:
            return self.literal_int53
        elif self.primitive_type == PrimitiveType.int64:
            return self.literal_int64
        elif self.primitive_type == PrimitiveType.string:
            return self.literal_string


class TypeExt(Type):
    type_struct: TypeStructExt


def main():
    parser = argparse.ArgumentParser()

    if sys.stdin.isatty():
        json = open(sys.argv[1], 'r').read()
    else:
        json = sys.stdin.read()

    modules = json.loads(json)


class BuildEnv:
    def __init__(self, root_python_module):
        self.build_dir = tempfile.mkdtemp()
        self.root_python_module = root_python_module

    def build_module(self, module):
        return ModuleBuildEnv(self, module.module_name).write_module(module)

    def finalize(self, output_dir):
        # self.finalize_mod_files
        return recursive_copy(self.build_dir, output_dir)


class ModuleBuildEnv:
    INDENTIONS = ['', '    ', '        ', '            ', '                ',
                  '                    ']

    def __init__(self, build_env: BuildEnv, module_name: str):
        self.module_name = module_name
        self.build_env = build_env
        self.indention_level = 0

    def write_module(self, module: Module):
        module_file_path = os.path.join(self.build_env.build_dir,
                                        ModuleBuildEnv.to_module_path(self.module_name))
        os.makedirs(os.path.dirname(module_file_path))

        with open(module_file_path, 'w') as file:
            file.write("\n".join(self.indented(l) for l in self.gen_module(module)))

    def gen_module(self, module: Module):
        yield "from .__idol__ import Struct as __Struct, List as __List, Map as __Map, Optional as __Optional, Enum as __Enum, as __Any"
        yield ""
        yield "__all__ = ["

        with self.in_block():
            for type_name in module.types_dependency_ordering:
                yield f"\"{type_name}\","

        yield "]"
        yield ""

        for type_name in module.types_dependency_ordering:
            type = TypeExt(module.types_by_name[type_name])
            yield ""

            if type.is_a:
                type_struct = type.is_a
                if type_struct.struct_kind == StructKind.Scalar:
                    if type_struct.is_literal:
                        yield from self.gen_literal_impl(module, type)
                    else:
                        yield from self.gen_scalar_impl(module, type)
                elif type_struct.struct_kind == StructKind.Repeated:
                    yield from self.gen_repeated_impl(module, type)
                elif type_struct.struct_kind == StructKind.Map:
                    yield from self.gen_map_impl(module, type)
            elif len(type.fields):
                yield from self.gen_struct_impl(module, type)
            elif len(type.options):
                yield from self.gen_enum_impl(module, type)

        yield ""

    def indented(self, line):
        i = self.INDENTIONS[self.indention_level]
        return f'{i}{line}'

    @contextmanager
    def in_block(self):
        self.indention_level += 1
        yield
        self.indention_level -= 1

    @classmethod
    def to_module_path(cls, module_name):
        as_path = "/".join(module_name.split("."))
        return f"{as_path}.py"

    def gen_literal_impl(self, module: Module, type: TypeExt):
        type_struct = type.type_struct
        scalar_type = self.display_scalar_type(type_struct)
        yield f"class {type.type_name}(Literal[{scalar_type}]):"
        with self.in_block():
            yield f"literal: {scalar_type} = {json.dumps(type.type_struct.literal_value)}"

    def gen_scalar_impl(self, module: Module, type: TypeExt):
        type_struct = type.type_struct
        scalar_type = self.display_scalar_type(type_struct)
        yield f"{type.type_name} = {scalar_type}"

    def gen_repeated_impl(self, module: Module, type: TypeExt):
        type_struct = type.type_struct
        scalar_type = self.display_scalar_type(type_struct)
        yield f"{type.type_name} = __List[{scalar_type}]"

    def gen_map_impl(self, module: Module, type: TypeExt):
        type_struct = type.type_struct
        scalar_type = self.display_scalar_type(type_struct)
        yield f"{type.type_name} = __Map[{scalar_type}]"

    scalar_name_mappings = {
        PrimitiveType.int64: 'int',
        PrimitiveType.int53: 'int',
        PrimitiveType.string: 'str',
        PrimitiveType.double: 'float',
        PrimitiveType.any: '__Any',
    }

    def display_scalar_type(self, type_struct: TypeStructExt):
        if type_struct.is_primitive:
            return self.scalar_name_mappings[type_struct.primitive_type]
        else:
            return type_struct.reference.display_from(self.build_env.root_python_module,
                                                      self.module_name)


def recursive_copy(src, dest):
    if os.path.isdir(src):
        if not os.path.isdir(dest):
            os.makedirs(dest)
        files = os.listdir(src)
        for f in files:
            recursive_copy(os.path.join(src, f),
                           os.path.join(dest, f))
    else:
        shutil.copyfile(src, dest)


if __name__ == '__main__':
    main()
