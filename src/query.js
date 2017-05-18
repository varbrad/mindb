const _ = require('lodash')

class Query {
  /** Constructs a query object
   * @param {Collection} collection The collection this query is for.
   * @param {Query} query The query to chain from.
   */
  constructor (collection, query) {
    this.collection = collection
    this.query = query || {}
  }

  byId (value) {
    let q = _.cloneDeep(this.query)
    q.byId = value
    return new Query(this.collection, q)
  }

  where (key) {
    let q = _.cloneDeep(this.query)
    q.action = 'where'
    q.key = key
    return new Query(this.collection, q)
  }

  gt (value) {
    return this.op('>', value)
  }

  lt (value) {
    return this.op('<', value)
  }

  eq (value) {
    return this.op('===', value)
  }

  op (op, value) {
    let q = _.cloneDeep(this.query)
    q.filters = q.filters || []
    q.filters.push({ key: q.key, value: value, op: op })
    return new Query(this.collection, q)
  }

  sort (...keys) {
    let q = _.cloneDeep(this.query)
    q.sort = []
    keys.forEach(key => {
      const order = key[0] === '-' ? -1 : 1
      q.sort.push({ key: key.replace(/(\-|\+)/g, ''), order: order })
    })
    return new Query(this.collection, q)
  }

  limit (n) {
    let q = _.cloneDeep(this.query)
    q.limit = n
    return new Query(this.collection, q)
  }

  one () {
    return this.limit(1)
  }

  select (...keys) {
    let q = _.cloneDeep(this.query)
    q.select = keys
    return new Query(this.collection, q)
  }

  exec (collection) {
    // Quick return if set byId
    if (this.query.byId) return this.collection._documents[this.query.byId]

    let c = _.values((collection && collection._documents) || this.collection._documents)
    if (this.query.filters) {
      // Apply filters
      this.query.filters.forEach(filter => {
        c = c.filter(o => {
          switch (filter.op) {
            case '>': return o[filter.key] > filter.value
            case '<': return o[filter.key] < filter.value
            case '===': return o[filter.key] === filter.value
          }
        })
      })
    }
    if (this.query.sort) {
      c = c.sort((a, b) => {
        let r = 0
        for (let i = 0; i < this.query.sort.length; ++i) {
          const s = this.query.sort[i]
          const _a = a[s.key]
          const _b = b[s.key]
          if (_a !== _b) {
            if (typeof _a === 'number' && typeof _b === 'number') {
              r = (_a - _b) * s.order
              break
            } else {
              if (s.order > 0) r = _a > _b
              else r = _b > _a
              break
            }
          }
        }
        return r
      })
    }
    if (this.query.limit) {
      c = c.slice(0, this.query.limit > c.length ? c.length : this.query.limit)
    }

    // Select specific columns only
    if (this.query.select) {
      c = c.map(row => {
        let o = {}
        this.query.select.forEach(key => {
          o[key] = row[key]
        })
        return o
      })
    }

    // Single object if limited to 1
    if (this.query.limit === 1 && c.length === 1) {
      c = c[0]
    }
    return c
  }
}

module.exports = Query
