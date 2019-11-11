#! /usr/bin/env python3

import sys
import json
from .idol.py_mar.all.target.assembled_optional import AssembledOptional

data = sys.stdin.read()
data = json.loads(data)

result, err = AssembledOptional().load(data)

if err:
    print(err)
    sys.exit(1)

dumped, err = AssembledOptional().dump(result)

if err:
    print(err)
    sys.exit(1)
