#! /usr/bin/env node

var required = require('./idol/all/required.js');
var data = fs.readFileSync(0, 'utf-8');
data = JSON.parse(data);

console.log(JSON.stringify(required.Assembled.expand(data)));
