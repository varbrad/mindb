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

  it('Should mean that proxy access === get()', () => {
    col.insert({ _id: 'bonjour', name: 'foobar' })
    expect(col.bonjour, 'to equal', col.get('bonjour'))
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

    it('Should return "undefined" for a non-existant id', () => {
      expect(col.get('not-found'), 'to be undefined')
    })
  })

  describe('#insert()', () => {
    it('Should insert a single document', () => {
      expect(col.list(), 'to be empty')
      col.insert({ _id: 'wow', much: 'memes' })
      expect(col.list(), 'to have length', 1)
      expect(col.wow.much, 'to equal', 'memes')
    })

    it('Should throw error on duplicate id', () => {
      col.insert({ _id: 'hi', bob: true })
      let err
      try {
        col.insert({ _id: 'hi', error: 'hopefully!' })
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })

    it('Should throw error on document with no id', () => {
      let err
      try {
        col.insert({ noId: true })
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })

    it('Should throw error on non-string id', () => {
      let err
      try {
        col.insert({ _id: ['bob'], haha: true, o: 50.5 })
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })

    it('Should ensure document doesnt use reserved word as id', () => {
      let err
      try {
        col.insert({ _id: 'upsert', data: 'fail!' })
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })

    it('Should allow update if overwrite is set', () => {
      col.insert({ _id: 'data', value: 50 })
      col.insert({ _id: 'data', value: 100 }, true)
      expect(col.data.value, 'to equal', 100)
    })
  })

  describe('#list()', () => {
    it('Should show empty list', () => {
      expect(col.list(), 'to be empty')
    })

    it('Should have one named entry', () => {
      col.insert({ _id: 'test', value: 9 })
      expect(col.list(), 'to have length', 1)
      expect(col.list(), 'to contain', 'test')
    })
  })

  describe('#upsert()', () => {
    it('Should use insert(..., true) implementation', () => {
      col.insert({ _id: 'fred', value: 95.2 })
      col.insert({ _id: 'fred', cocoa: 18 }, true)
      expect(col.fred.value, 'to be undefined')
      expect(col.fred.cocoa, 'to equal', 18)
    })
  })

  describe('#values()', () => {
    it('Should show empty values', () => {
      expect(col.values(), 'to be empty')
    })

    it('Should have one entry', () => {
      col.insert({ _id: 'bob', kerbal: true })
      expect(col.values(), 'to have length', 1)
      expect(col.values()[0], 'to have key', 'kerbal')
      expect(col.values()[0], 'to equal', col.bob)
    })
  })
})
