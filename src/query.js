const _ = require('lodash')

class Query {
  /** Constructs a query object
   * @param {Collection} collection The collection this query is for.
   * @param {Query} query The query to chain from.
   */
  constructor (collection, query) {
    this._collection = collection
    this._query = query || {}
  }

  byId (value) {
    let q = _.cloneDeep(this._query)
    q.byId = value
    return new Query(this._collection, q)
  }

  where (key) {
    let q = _.cloneDeep(this._query)
    q.action = 'where'
    q.key = key
    return new Query(this._collection, q)
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

  ne (value) {
    return this.op('!==', value)
  }

  op (op, value) {
    let q = _.cloneDeep(this._query)
    q.filters = q.filters || []
    q.filters.push({ key: q.key, value: value, op: op })
    return new Query(this._collection, q)
  }

  filter (f) {
    let q = _.cloneDeep(this._query)
    q.defaultFilters = q.defaultFilters || []
    q.defaultFilters.push(f)
    return new Query(this._collection, q)
  }

  sort (...keys) {
    let q = _.cloneDeep(this._query)
    q.sort = []
    keys.forEach(key => {
      const order = key[0] === '-' ? -1 : 1
      q.sort.push({ key: key.replace(/(\-|\+)/g, ''), order: order })
    })
    return new Query(this._collection, q)
  }

  limit (n) {
    let q = _.cloneDeep(this._query)
    q.limit = n
    return new Query(this._collection, q)
  }

  one () {
    return this.limit(1)
  }

  select (...keys) {
    let q = _.cloneDeep(this._query)
    q.select = keys
    return new Query(this._collection, q)
  }

  populate (...keys) {
    // Is this collection defined by a schema?
    if (this._collection.schema) {
      console.log('schema present!')
    }
    // Which keys should be populated
    let q = _.cloneDeep(this._query)
    q.populate = keys
    return new Query(this._collection, q)
  }

  exec (collection) {
    // Quick return if set byId
    if (this._query.byId) return this._collection._documents[this._query.byId]

    let c = _.values((collection && collection._documents) || this._collection._documents)
    // Run default filters first, because they are a little faster
    if (this._query.defaultFilters) {
      this._query.defaultFilters.forEach(filter => {
        c = c.filter(filter)
      })
    }
    if (this._query.filters) {
      // Apply filters
      this._query.filters.forEach(filter => {
        c = c.filter(o => {
          switch (filter.op) {
            case '>': return o[filter.key] > filter.value
            case '<': return o[filter.key] < filter.value
            case '===': return o[filter.key] === filter.value
            case '!==': return o[filter.key] !== filter.value
          }
        })
      })
    }
    if (this._query.sort) {
      c = c.sort((a, b) => {
        let r = 0
        for (let i = 0; i < this._query.sort.length; ++i) {
          const s = this._query.sort[i]
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
    if (this._query.limit) {
      c = c.slice(0, this._query.limit > c.length ? c.length : this._query.limit)
    }

    // Select specific columns only
    if (this._query.select) {
      c = c.map(row => {
        let o = {}
        this._query.select.forEach(key => {
          o[key] = row[key]
        })
        return o
      })
    }

    // Single object if limited to 1
    if (this._query.limit === 1 && c.length === 1) {
      c = c[0]
    }
    return c
  }
}

module.exports = Query
