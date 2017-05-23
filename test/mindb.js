/* global describe, it, beforeEach */
require('ts-node/register')

const expect = require('unexpected')

const MinDB = require('../src/main').default

describe('MinDB', () => {
  beforeEach(() => {
    MinDB.reset()
  })

  it('Should exist', () => {
    expect(MinDB, 'to be defined')
  })

  it('Should allow database proxy access', () => {
    MinDB.create('test')
    expect(MinDB.test, 'to be defined')
    expect(MinDB.test, 'not to be empty')
  })

  it('Should mean that proxy access === get()', () => {
    MinDB.create('test')
    expect(MinDB.test, 'to equal', MinDB.get('test'))
  })

  describe('#create()', () => {
    it('Should error if reserved name used', () => {
      let err
      try {
        MinDB.create('_databases')
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })

    it('Should error if duplicate name used', () => {
      let err
      try {
        MinDB.create('test')
        MinDB.create('test') // Already defined
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })

    it('Should error if non-string name used', () => {
      let err
      try {
        MinDB.create(28)
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })
  })

  describe('#get()', () => {
    it('Should error if accessing non-existant name', () => {
      let err
      try {
        MinDB.get('non-existant-db')
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })

    it('Should error if accessing non-string name', () => {
      let err
      try {
        MinDB.get(['a', 123])
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })
  })

  describe('#list()', () => {
    it('Should show empty list', () => {
      expect(MinDB.list(), 'to be empty')
    })

    it('Should have one named entry', () => {
      MinDB.create('test')
      expect(MinDB.list(), 'to have length', 1)
      expect(MinDB.list(), 'to contain', 'test')
    })
  })

  describe('#reset()', () => {
    it('Should empty the entire database map', () => {
      MinDB.create('test')
      MinDB.create('test2')
      expect(MinDB.test, 'to be defined')
      expect(MinDB.test2, 'to be defined')
      MinDB.reset()
      expect(MinDB.list(), 'to be empty')
      expect(MinDB.test, 'to be undefined')
      expect(MinDB.test2, 'to be undefined')
    })
    it('Should only empty the named database', () => {
      MinDB.create('test')
      MinDB.create('test2')
      expect(MinDB.list(), 'to have length', 2)
      MinDB.reset('test')
      expect(MinDB.list(), 'to have length', 1)
      expect(MinDB.test, 'to be undefined')
      expect(MinDB.test2, 'to be defined')
    })
  })
})
