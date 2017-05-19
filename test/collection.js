/* global describe, it, beforeEach, before */

const expect = require('unexpected')

const MinDB = require('../dist/mindb.cjs.js')

describe('MinDB.Collection', () => {
  let col

  before(() => {
    MinDB.reset()
    col = MinDB.create('db').collection('col')
  })

  beforeEach(() => {
    col.empty()
  })

  it('Should exist', () => {
    expect(MinDB.db, 'to be defined')
    expect(MinDB.db.col, 'to be defined')
    expect(col, 'to be defined')
  })

  describe('#empty()', () => {
    it('Should empty collection', () => {
      col.insert({ _id: 'test', data: 123 })
      expect(col.list(), 'to have length', 1)
      col.empty()
      expect(col.list(), 'to be empty')
    })
  })

  describe('#find()', () => {
    it('Should create a Query object', () => {
      col.insert({ _id: 'test', data: 400 })
      const query = col.find()
      expect(query, 'to be defined')
      expect(query instanceof MinDB.Query, 'to be true')
    })
  })

  describe('#findOne()', () => {

  })

  describe('#get()', () => {

  })

  describe('#insert()', () => {

  })

  describe('#list()', () => {

  })

  describe('#upsert()', () => {

  })

  describe('#values()', () => {

  })
})
