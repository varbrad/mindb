const babel = require('rollup-plugin-babel')

export default {
  entry: 'dist/es2017/mindb.js',
  format: 'cjs',
  dest: 'dist/mindb.cjs.js',
  plugins: [
    babel()
  ]
}
