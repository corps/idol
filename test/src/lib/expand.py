#! /usr/bin/env python3

import json
from idol.all.required import Assembled
import sys

if sys.stdin.isatty():
    data = open(args.input_json, 'r').read()
else:
    data = sys.stdin.read()

data = json.loads(data)

print(json.dumps(Assembled.expand(data)))