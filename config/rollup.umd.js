const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')

export default {
  entry: 'dist/es2017/mindb.js',
  format: 'umd',
  dest: 'dist/mindb.min.js',
  moduleName: 'mindb',
  plugins: [
    babel(),
    uglify()
  ]
}