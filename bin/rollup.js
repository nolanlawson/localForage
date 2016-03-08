#!/usr/bin/env node

//
// wrapper because grunt-rollup doesn't let us do two separate rollup tasks
//

var rollup = require('rollup');
var rollupBabel = require('rollup-plugin-babel');
var rollupResolve = require('rollup-plugin-node-resolve');
var rollupCJS = require('rollup-plugin-commonjs');
var rollupTransform = require('rollup-plugin-browserify-transform');
var inlineProcessBrowser = require('inline-process-browser');
var unreachableBranchTransform = require('unreachable-branch-transform');
var fs = require('fs');
var Promise = require('lie');

function doRollup(noPromises) {
    return rollup.rollup({
        entry: 'src/localforage.js',
        plugins: [
            rollupResolve({
                jsnext: true,
                main: true,
                browser: true,
                skip: noPromises ? ['lie-pretransform'] : []
            }),
            rollupCJS({
                include: './node_modules/**'
            }),
            rollupBabel({
                exclude: './node_modules/**'
            }),
            rollupTransform(inlineProcessBrowser),
            rollupTransform(unreachableBranchTransform)
        ]
    }).then(function (bundle) {
        var code = bundle.generate({
            format: 'umd',
            moduleName: 'localforage',
        }).code;
        var dest = noPromises ? 'dist/localforage.nopromises.js' : 'dist/localforage.js';

        return new Promise(function (resolve, reject) {
            fs.writeFile(dest, code, 'utf8', function (err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

Promise.resolve().then(function () {
    return doRollup(false);
}).then(function () {
    return doRollup(true);
}).catch(console.log.bind(console));