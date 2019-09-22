#! /usr/bin/env python3

import json
from .idol.py.all.target.assembled_optional import AssembledOptional
import sys

data = sys.stdin.read()
data = json.loads(data)

if not AssembledOptional.is_valid(data):
    exit(1)
