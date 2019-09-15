#! /usr/bin/env python3

import json
from .idol.py.all.optional import Assembled
import sys

data = sys.stdin.read()
data = json.loads(data)

if not Assembled.is_valid(data):
  exit(1)