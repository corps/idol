#! /usr/bin/env python3

import sys
import json

from .idol.py_data.codegen.tests.basic.test_enum import TestsBasicTestEnumEnum as TestsBasicTestEnumEnumData
from .idol.py_mar.all.target.assembled_optional import AssembledOptional
from .idol.py_data.all.target.assembled_optional import AssembledOptional as Dataclass
import dacite

data = sys.stdin.read()
data = json.loads(data)

result, err = AssembledOptional().load(data)

Dataclass()
as_dataclass = dacite.from_dict(Dataclass, result, config=dacite.Config(type_hooks={TestsBasicTestEnumEnumData: lambda v: TestsBasicTestEnumEnumData(v.value)}))
assert not AssembledOptional().dump(as_dataclass)[1]

if err:
    print(err)
    sys.exit(1)

dumped, err = AssembledOptional().dump(result)

if err:
    print(err)
    sys.exit(1)

