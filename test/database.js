/* global describe, it */

const expect = require('unexpected')

const MinDB = require('../dist/mindb.cjs.js')

describe('MinDB.Database', () => {
  describe('MinDB.create()', () => {
    it('Should return a valid Database object', () => {
      const db = MinDB.create('test')
      expect(db, 'to be defined')
    })
  })
})
