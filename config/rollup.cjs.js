const babel = require('rollup-plugin-babel')

export default {
  entry: 'dist/es2017/main.js',
  format: 'cjs',
  dest: 'dist/mindb.cjs.js',
  external: ['clone'],
  plugins: [
    babel()
  ]
}
