#! /usr/bin/env babel-node

import { allRequiredAssembled as Assembled } from './idol/codegen/all/required';
import fs from 'fs';
var data = fs.readFileSync(0, 'utf-8');
data = JSON.parse(data);

const expanded = Assembled.expand(data)
console.log(JSON.stringify(expanded));
