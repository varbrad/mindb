/* global describe, it, before */

const expect = require('unexpected')

const MinDB = require('../dist/mindb.cjs.js')

describe('MinDB.Query', () => {
  let col

  before(() => {
    MinDB.reset()
    col = MinDB.create('db').collection('col')
    for (let i = 0; i < 500; ++i) {
      col.insert({ _id: 'doc' + i, i: i, k: i % 2, data: Math.random(), obj: { a: Math.random() }, arr: [ Math.random(), Math.random(), Math.random() ] })
    }
  })

  describe('#byId()', () => {
    it('Should return a single document', () => {
      expect(col.findOne('doc5').exec(), 'to be defined')
    })

    it('Should return undefined if not found', () => {
      expect(col.findOne('doc928').exec(), 'to be undefined')
    })
  })

  describe('#count()', () => {
    it('Should return number of results', () => {
      expect(col.find().where('i').lt(250).count().exec(), 'to equal', 250)
    })
    it('Should return zero if no results', () => {
      expect(col.find().where('i').gt(820).count().exec(), 'to equal', 0)
    })
  })

  describe('#eq()', () => {
    it('Should only match properties with values equal to the given value', () => {
      const result = col.find().where('k').eq(1).exec()
      expect(result, 'to have length', 250)
    })
  })

  describe('#exec()', () => {
    it('Should always return something if called', () => {
      expect(col.find().exec(), 'to be defined')
      expect(col.findOne().exec(), 'to be defined')
    })
  })

  describe('#exists()', () => {
    it('Should filter documents by an existing property', () => {
      col.insert({ _id: 'added', i: 5922 })
      expect(col.find().exec(), 'to have length', 501)
      expect(col.find().where('k').exists().exec(), 'to have length', 500)
      col.remove('added')
    })
  })

  describe('#filter()', () => {
    it('Should filter documents based on a custom filter', () => {
      col.insert({ _id: 'pete', location: 'London' })
      col.insert({ _id: 'jon', location: 'France' })
      expect(col.find().filter(d => d.location === 'London').exec(), 'to have length', 1)
      col.remove(['pete', 'jon'])
    })
  })

  describe('#gt()', () => {
    it('Should only match properties with values greater than the given value', () => {
      expect(col.list().length, 'to be greater than', col.find().where('data').gt(0.5).count().exec())
    })
  })

  describe('#gte()', () => {
    it('Should only match properties with values greater than or equal to the given value', () => {
      expect(col.list().length, 'to be greater than', col.find().where('data').gte(0.5).count().exec())
    })
  })

  describe('#limit(), #one()', () => {
    it('Should return only ten documents (as Documents[])', () => {
      expect(col.find().limit(10).exec(), 'to have length', 10)
    })
    it('Should return one document (as Document) when used as .limit(1)', () => {
      expect(col.find().limit(1).exec(), 'to have keys', '_id', 'i')
    })
    it('Should return one document (as Document) when used as .one()', () => {
      expect(col.find().one().exec(), 'to have keys', '_id', 'i')
    })
    it('Should return one document (as Document) when using findOne() on Collection', () => {
      expect(col.findOne().exec(), 'to have keys', '_id', 'i')
    })
    it('Should throw an error on limit of less than 1')
    it('Should throw an error if limit is a non-number')
  })

  describe('#lt()', () => {
    it('Should only match properties with values less than the given value')
  })

  describe('#lte()', () => {
    it('Should only match properties with values less than or equal to the given value')
  })

  describe('#ne(), #not()', () => {
    it('Should only match properties with values not equal to the given value')
  })

  describe('#neg(), #negative()', () => {
    it('Should only match properties with negative values')
  })

  describe('#offset()', () => {
    it('Should offset the result set by ten documents')
    it('Should offset the result set by twenty documents')
    it('Should throw an error if offset by a negative number')
    it('Should throw an error if offset by a non-number')
  })

  describe('#populate()', () => {
    it('Should populate ref properties with the relevant document')
    it('Should populate ref properties recursively')
  })

  describe('#pos(), #positive()', () => {
    it('Should only match properties with positive values')
  })

  describe('#select()', () => {
    it('Should select only the requested fields')
    it('Should only return ids if no fields selected')
    it('Should throw an error if id field is included', () => {
      let err
      try {
        col.find().select('data', '_id').exec()
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })
    it('Should throw an error if any fields are non-string', () => {
      let err
      try {
        col.find().select('data', 43, 'info').exec()
      } catch (e) {
        err = e
      }
      expect(err, 'to be defined')
    })
  })

  describe('#sort()', () => {
    it('Should sort numeric fields', () => {
      const r = col.find().where('data').exists().sort('data').exec()
      for (let i = 0; i < r.length - 1; ++i) {
        expect(r[i].data, 'to be less than or equal to', r[i + 1].data)
      }
    })
    it('Should sort non-numeric fields', () => {
      const r = col.find().sort('_id').exec()
      for (let i = 0; i < r.length - 1; ++i) {
        expect(r[i]._id, 'to be less than or equal to', r[i + 1]._id)
      }
    })
    it('Should be able to sort in descending order', () => {
      const r = col.find().sort('-data').exec()
      for (let i = 0; i < r.length - 1; ++i) {
        expect(r[i].data, 'to be greater than or equal to', r[i + 1].data)
      }
    })
    it('Should allow multi-criteria sorting', () => {
      const r = col.find().sort('-k', '-i').exec()
      for (let i = 0; i < r.length - 1; ++i) {
        expect(r[i].k, 'to be greater than or equal to', r[i + 1].k)
        if (r[i].k === r[i + 1].k) {
          expect(r[i].i, 'to be greater than or equal to', r[i + 1].i)
        }
      }
    })
    it('Should allow sorting based on nested document properties', () => {
      const r = col.find().sort('obj.a').exec()
      for (let i = 0; i < r.length - 1; ++i) {
        expect(r[i].obj.a, 'to be less than or equal to', r[i + 1].obj.a)
      }
    })
  })

  describe('#within()', () => {
    it('Should only match properties within the min->max range (inclusive)', () => {
      col.find().where('data').within(0.4, 0.8).exec().forEach(d => {
        expect(d.data, 'to be greater than or equal to', 0.4)
        expect(d.data, 'to be less than or equal to', 0.8)
      })
    })
  })

  describe('#where()', () => {
    it('Should focus directives to the associated property', () => {
      expect(col.find().where('i').lt(2).exec(), 'to have length', 2)
    })
  })
})
