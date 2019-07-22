#! /usr/bin/env node

var optional = require('./idol/all/optional.js');
var data = fs.readFileSync(0, 'utf-8');
data = JSON.parse(data);

optional.Assembled.validate(data);

if (!optional.Assembled.isValid(data)) {
    process.exit(1);
}

