#! /usr/bin/env python3

import json
from .idol.py.all.required import Assembled
import sys

data = sys.stdin.read()
data = json.loads(data)

print(json.dumps(Assembled.expand(data)))