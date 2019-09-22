#! /usr/bin/env babel-node

import { AssembledRequired } from './idol/js/all/target/AssembledRequired';
import fs from 'fs';
var data = fs.readFileSync(0, 'utf-8');
data = JSON.parse(data);

const expanded = AssembledRequired.expand(data)
console.log(JSON.stringify(expanded));
