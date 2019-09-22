#! /usr/bin/env babel-node

import { AssembledOptional } from './idol/js/all/target/AssembledOptional';
import fs from 'fs';

var data = fs.readFileSync(0, 'utf-8');
data = JSON.parse(data);

// Assembled.validate(data);

if (!AssembledOptional.isValid(data)) {
    process.exit(1);
}

