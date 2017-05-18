const babel = require('rollup-plugin-babel')

export default {
  entry: 'dist/es6/mindb.js',
  format: 'umd',
  dest: 'dist/umd/mindb.js',
  moduleName: 'mindb',
  plugins: [
    babel()
  ]
}
