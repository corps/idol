#! /usr/bin/env python3

import argparse
import json
import select
import tempfile
import os
import shutil
from enum import Enum

class PrimitiveType(Enum):
  int53 = 'int53'
  int64 = 'int64'
  double = 'double'
  string = 'string'
  bool = 'bool'
  any = 'any'

class StructKind(Enum):
  Scalar = 'Scalar'
  Repeated = 'Repeated'
  Map = 'Map'

class Reference:
  __slots__ = ('module_name', 'qualified_name', 'type_name')

  def __init__(self, obj=None):
    if obj is None:
      return
    
    if not isinstance(obj, dict):
      raise TypeError("can only be constructed with a dict.")

    self.__dict__ = obj


class Dependency:
  __slots__ = ('from', 'to', 'is_local')

  def __init__(self, obj=None):
    if obj is None:
      return
    
    if not isinstance(obj, dict):
      raise TypeError("can only be constructed with a dict.")

    self.__dict__ = obj

class TypeStruct:
  __slots__ = ('is_literal', 'literal_bool', 'literal_double', 'literal_int53', 'literal_int64',
               'literal_string', 'primitive_type', 'reference', 'struct_kind')

  def __init__(self, obj=None):
    if obj is None:
      return
    
    if not isinstance(obj, dict):
      raise TypeError("can only be constructed with a dict.")

    self.__dict__ = obj

class TypeStruct:
  __slots__ = ('is_literal', 'literal_bool', 'literal_double', 'literal_int53', 'literal_int64',
               'literal_string', 'primitive_type', 'reference', 'struct_kind')

  def __init__(self, obj=None):
    if obj is None:
      return
    
    if not isinstance(obj, dict):
      raise TypeError("can only be constructed with a dict.")

    self.__dict__ = obj

class Field:
  __slots__ = ('fields', 'field_name', 'type_struct')

  def __init__(self, obj=None):
    if obj is None:
      return
    
    if not isinstance(obj, dict):
      raise TypeError("can only be constructed with a dict.")

    self.__dict__ = obj

class Type:
  __slots__ = ('fields', 'is_a', 'options', 'tags', 'type_name')

  def __init__(self, obj=None):
    if obj is None:
      return
    
    if not isinstance(obj, dict):
      raise TypeError("can only be constructed with a dict.")

    self.__dict__ = obj

class Module:
  __slots__ = ('dependencies', 'module_name', 'types_by_name', 'types_dependency_ordering')

  def __init__(self, obj=None):
    if obj is None:
      return
    
    if not isinstance(obj, dict):
      raise TypeError("can only be constructed with a dict.")

    self.__dict__ = obj

def main():
  parser = argparse.ArgumentParser()

  if sys.stdin.isatty():
    json = open(sys.argv[1], 'r').read()
  else:
    json = sys.stdin.read()

  modules = json.loads(json)

class BuildEnv:
  def __init__(self):
    self.build_dir = tempfile.mkdtemp()
    # self.root_python_module

  def build_module(self, module):
    return ModuleBuildEnv(module.module_name).gen_module(module)

  def finalize(self, output_dir):
    # self.finalize_mod_files
    return recursive_copy(self.build_dir, output_dir)


class ModuleBuildEnv:
  INDENTIONS = ['', '  ', '    ', '      ', '        ', '          ']

  def __init__(self, build_env, module_name):
    self.module_name = module_name
    self.build_env = build_env
    self.module_path = ModuleBuildEnv.to_module_path(module_name)
    self.indention_level = 0

  def gen_module(self, module):
    # os.makedirs(os.path.dirname(self.))
    pass

  def indent(self, line):
    i = self.INDENTIONS[self.indention_level]
    return f'{i}{line}'

  def start_block(self, line):


  @classmethod
  def to_module_path(cls, module_name):
    as_path = "/".join(module_name.split("."))
    return f"{as_path}.py"

 def recursive_copy(src, dest):
    if os.path.isdir(src):
        if not os.path.isdir(dest):
            os.makedirs(dest)
        files = os.listdir(src)
        for f in files:
            recursive_overwrite(os.path.join(src, f), 
                                os.path.join(dest, f), 
                                ignore)
    else:
        shutil.copyfile(src, dest)

if __name__ == '__main__':
  main()