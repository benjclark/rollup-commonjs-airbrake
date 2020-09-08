const gulp = require('gulp');
const rollup = require('rollup');
const builtins = require('rollup-plugin-node-builtins');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

gulp.task('bundle', function() {
    return rollup.rollup({
        input: 'entry-point.js',
        plugins: [ builtins(), nodeResolve(), commonjs() ],
        context: 'window'
    }).then(function(bundle) {
        return bundle.write({
            file: 'output/dist.js',
            format: 'iife'
        });
    });
});
