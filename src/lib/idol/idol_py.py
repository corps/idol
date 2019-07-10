#! /usr/bin/env python3

import sys
import os.path

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
print(sys.path)

from idol.schema import *
from idol.__idol__ import Map, Optional, KEYWORDS
import idol.__idol__
from contextlib import contextmanager
import argparse
import json
import sys
import tempfile
import os
import shutil


class ReferenceExt(Reference):
    def display_from(self, root_module, cur_module):
        if self.module_name == cur_module:
            return self.type_name

        return f"{root_module}.{self.qualified_name}"


class TypeStructExt(TypeStruct):
    reference: ReferenceExt

    @property
    def is_primitive(self):
        return not bool(self.reference.qualified_name)

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


class FieldExt(Field):
    type_struct: TypeStructExt


class TypeExt(Type):
    is_a: Optional[TypeStructExt]
    fields: Map[FieldExt]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--module', type=str,
                        help='The dotted module base that the output python classes should be packaged into.')
    parser.add_argument('--output', type=str,
                        help='The dotted module base that the output python classes should be packaged into.')
    parser.add_argument('input_json', type=str,
                        help='Output from idol to generate python classes from.', nargs='?')
    args = parser.parse_args(sys.argv)

    if sys.stdin.isatty():
        data = open(args.input_json, 'r').read()
    else:
        data = sys.stdin.read()

    modules = json.loads(data)
    modules: Map[Module] = Map[Module](modules)

    build_env = BuildEnv(args.module)
    for module in modules.values():
        build_env.build_module(module)

    build_env.finalize(args.output)


class BuildEnv:
    def __init__(self, root_python_module):
        self.build_dir = tempfile.mkdtemp()
        self.root_python_module = root_python_module

    def build_module(self, module: Module):
        return ModuleBuildEnv(self, module.module_name).write_module(module)

    def finalize(self, output_dir):
        self.finalize_idol_file(output_dir)
        return recursive_copy(self.build_dir, output_dir)

    def finalize_idol_file(self, output_dir):
        os.makedirs(output_dir, exist_ok=True)
        content = open(idol.__idol__.__file__, 'r').read()
        with open(os.path.join(output_dir, '__idol__.py'), 'w') as file:
            file.write(content)


class ModuleBuildEnv:
    INDENTIONS = ['', '    ', '        ', '            ', '                ',
                  '                    ']

    def __init__(self, build_env: BuildEnv, module_name: str):
        self.module_name = module_name
        self.build_env = build_env
        self.indention_level = 0

    @property
    def root_python_module(self):
        return self.build_env.root_python_module

    def write_module(self, module: Module):
        module_file_path = os.path.join(self.build_env.build_dir,
                                        ModuleBuildEnv.to_module_path(self.module_name))
        os.makedirs(os.path.dirname(module_file_path), exist_ok=True)

        with open(module_file_path, 'w') as file:
            file.write("\n".join(self.indented(l) for l in self.gen_module(module)))

    def format_idol_import(self, item):
        return f"{item} as _{item}"

    def gen_module(self, module: Module):
        joined_imports = ", ".join(self.format_idol_import(item) for item in [
            "Struct",
            "List",
            "Map",
            "Optional",
            "Enum",
            "Any",
            "Literal"
        ])
        yield f"from {self.root_python_module}.__idol__ import {joined_imports}"
        yield ""
        yield "__all__ = ["

        with self.in_block():
            for type_name in module.types_dependency_ordering:
                yield f"\"{type_name}\","

        yield "]"

        for type_name in module.types_dependency_ordering:
            type = TypeExt(module.types_by_name[type_name])
            yield ""
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

    def gen_enum_impl(self, module: Module, type: TypeExt):
        yield f"class {type.type_name}(_Enum):"
        with self.in_block():
            options = sorted(type.options)
            for option in options:
                option_name = option
                if option in KEYWORDS:
                    option_name += "_"

                yield f"{option_name} = {json.dumps(option)}"

    def gen_struct_impl(self, module: Module, type: TypeExt):
        yield f"class {type.type_name}(_Struct):"
        with self.in_block():
            field_names = sorted(type.fields.keys())
            for field_name in field_names:
                field = type.fields[field_name]

                if field_name in KEYWORDS:
                    field_name += "_"

                yield f"{field_name}: {self.display_type(field.type_struct)}"

    def gen_literal_impl(self, module: Module, type: TypeExt):
        type_struct = type.is_a
        scalar_type = self.display_scalar_type(type_struct)
        yield f"class {type.type_name}(_Literal[{scalar_type}]):"
        with self.in_block():
            yield f"literal: {scalar_type} = {json.dumps(type.is_a.literal_value)}"

    def gen_scalar_impl(self, module: Module, type: TypeExt):
        type_struct = type.is_a
        scalar_type = self.display_scalar_type(type_struct)
        yield f"{type.type_name} = {scalar_type}"

    def gen_repeated_impl(self, module: Module, type: TypeExt):
        type_struct = type.is_a
        scalar_type = self.display_scalar_type(type_struct)
        yield f"{type.type_name} = _List[{scalar_type}]"

    def gen_map_impl(self, module: Module, type: TypeExt):
        type_struct = type.is_a
        scalar_type = self.display_scalar_type(type_struct)
        yield f"{type.type_name} = _Map[{scalar_type}]"

    scalar_name_mappings = {
        PrimitiveType.bool: 'bool',
        PrimitiveType.int64: 'int',
        PrimitiveType.int53: 'int',
        PrimitiveType.string: 'str',
        PrimitiveType.double: 'float',
        PrimitiveType.any: '_Any',
    }

    def display_type(self, type_struct: TypeStructExt):
        if type_struct.struct_kind == StructKind.Scalar:
            return self.display_scalar_type(type_struct)
        elif type_struct.struct_kind == StructKind.Map:
            return f"_Map[{self.display_scalar_type(type_struct)}]"
        elif type_struct.struct_kind == StructKind.Repeated:
            return f"_List[{self.display_scalar_type(type_struct)}]"

    def display_scalar_type(self, type_struct: TypeStructExt):
        if type_struct.is_primitive:
            return self.scalar_name_mappings[type_struct.primitive_type]
        else:
            return type_struct.reference.display_from(self.root_python_module,
                                                      self.module_name)


def recursive_copy(src, dest):
    if os.path.isdir(src):
        if not os.path.isdir(dest):
            os.makedirs(dest, exist_ok=True)
        files = os.listdir(src)
        for f in files:
            recursive_copy(os.path.join(src, f),
                           os.path.join(dest, f))
    else:
        shutil.copyfile(src, dest)


if __name__ == '__main__':
    main()
