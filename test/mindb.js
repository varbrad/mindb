/* global describe, it */

const expect = require('unexpected')

const MinDB = require('../dist/mindb.cjs.js')

describe('MinDB', () => {
  it('Should exist', () => {
    expect(MinDB, 'to be defined')
  })
  it('Should have a public "create" method', () => {
    expect(MinDB, 'to have property', 'create')
  })
})
