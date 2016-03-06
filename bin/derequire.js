#!/usr/bin/env node

//
// wrapper for derequire because there's no simple CLI. grrrr.... >:(
//
var derequire = require('derequire');
var fs = require('fs');

var file = process.argv[2];

var code = fs.readFileSync(file, 'utf8');

var derequired = derequire(code);

fs.writeFileSync(file, derequired, 'utf8');