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

  it('Should allow document proxy access', () => {
    col.insert({ _id: 'hello', data: 'bonjour' })
    expect(col.hello, 'to be defined')
    expect(col.hello, 'not to be empty')
  })

  describe('#empty()', () => {
    it('Should empty the collection', () => {
      col.insert({ _id: 'test', data: 123 })
      expect(col.list(), 'to have length', 1)
      col.empty()
      expect(col.list(), 'to be empty')
    })
  })

  describe('#find()', () => {
    it('Should create a Query object', () => {
      const query = col.find()
      expect(query, 'to be defined')
      expect(query instanceof MinDB.Query, 'to be true')
    })
  })

  describe('#findOne()', () => {
    it('Should create a Query object', () => {
      const query = col.findOne()
      expect(query, 'to be defined')
      expect(query instanceof MinDB.Query, 'to be true')
    })

    it('Should create a Query object (param)', () => {
      const query = col.findOne('hello')
      expect(query, 'to be defined')
      expect(query instanceof MinDB.Query, 'to be true')
    })

    it('Should throw error on non-string id', () => {
      let err
      try {
        col.findOne(-8.5)
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })
  })

  describe('#get()', () => {
    it('Should get the document with a valid id', () => {
      col.insert({ _id: 'test', data: 50 })
      expect(col.get('test').data, 'to equal', 50)
    })

    it('Should throw error on non-string id', () => {
      let err
      try {
        col.get({ a: 50 })
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })
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
