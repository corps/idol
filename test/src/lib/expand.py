#! /usr/bin/env python3

import json
from idol.py.all.target.assembled_required import AssembledRequired
import sys

data = sys.stdin.read()
data = json.loads(data)

print(json.dumps(AssembledRequired.expand(data)))
