const babel = require('rollup-plugin-babel')

export default {
  entry: 'dist/es2017/main.js',
  format: 'es',
  dest: 'dist/mindb.esm.js',
  external: ['clone'],
  plugins: [
    babel()
  ]
}
