import { Collection } from './collection'
import { Document } from './document'

import { QueryData, WheresData } from './types/types'

import { createSortData, sortDocuments } from './utils'

const clone = require('clone')

class Query {
  private _collection:Collection
  private _data:QueryData

  constructor (collection:Collection, data?:QueryData) {
    this._collection = collection
    this._data = data || {}
  }

  byId (id:string):Query {
    const data:QueryData = clone(this._data, false)
    data.byId = id
    return new Query(this._collection, data)
  }

  count ():Query {
    const data:QueryData = clone(this._data, false)
    data.count = true
    return new Query(this._collection, data)
  }

  eq (value:any):Query {
    return this.op('===', value)
  }

  exec ():number|Document|Document[] {
    const q:QueryData = this._data
    let c:Document[]
    let usedIndex:boolean = false
    // By ID fetch or whole search
    if (q.byId) {
      c = [ this._collection.get(q.byId) ]
    } else {
      if (q.sort) {
        // Get key name of sort
        const name = q.sort.map(qd => qd.key).join(',')
        c = this._collection.values(name)
        if (c) usedIndex = true
      }
      if (!c) c = this._collection.values().slice()
      // Run JS filters
      if (q.filters) {
        q.filters.forEach(filter => {
          c = c.filter(filter)
        })
      }
      // Run wheres
      if (q.wheres) {
        q.wheres.forEach(data => {
          c = c.filter(doc => {
            switch (data.op) {
              case '>': return doc[data.key] > data.value
              case '<': return doc[data.key] < data.value
              case '>=': return doc[data.key] >= data.value
              case '<=': return doc[data.key] <= data.value
              case '===': return doc[data.key] === data.value
              case '!==': return doc[data.key] !== data.value
            }
          })
        })
      }
      // Run sorts, only if not counting (dont bother sorting!)
      if (q.sort && !q.count && !usedIndex) {
        sortDocuments(c, q.sort)
      }
      // Limit & Offset
      if (q.limit || q.offset) {
        c = c.slice(q.offset || 0, (q.offset || 0) + (q.limit || c.length))
      }
    }
    // Apply select
    if (q.select) {
      c = c.map(doc => {
        const o:Document = { _id: doc._id }
        q.select.forEach(key => o[key] = doc[key])
        return o
      })
    }
    // Return the result set
    if (q.count) {
      return c.length
    } else {
      return (q.limit === 1 || q.byId) ? c[0]: c
    }
  }

  exists ():Query {
    return this.op('!==', undefined)
  }

  filter (f:((this:void, value:Document, index:number, array:Document[]) => any)) {
    const data:QueryData = clone(this._data, false)
    data.filters = data.filters || []
    data.filters.push(f)
    return new Query(this._collection, data)
  }

  gt (value:any):Query {
    return this.op('>', value)
  }

  gte (value:any):Query {
    return this.op('>=', value)
  }

  is (value:any):Query {
    return this.eq(value)
  }

  limit (m:number):Query {
    const data:QueryData = clone(this._data, false)
    data.limit = m
    return new Query(this._collection, data)
  }

  lt (value:any):Query {
    return this.op('<', value)
  }

  lte (value:any):Query {
    return this.op('<=', value)
  }

  ne (value:any):Query {
    return this.op('!==', value)
  }

  neg ():Query {
    return this.op('<', 0)
  }

  negative ():Query {
    return this.neg()
  }

  not (value:any):Query {
    return this.ne(value)
  }

  offset (n:number):Query {
    const data:QueryData = clone(this._data, false)
    data.offset = n
    return new Query(this._collection, data)
  }

  one ():Query {
    return this.limit(1)
  }

  op (op:string, value:any):Query {
    const data:QueryData = clone(this._data, false)
    data.wheres = data.wheres || []
    data.wheres.push({ key: data.key, value: value, op: op })
    return new Query(this._collection, data)
  }

  populate (...keys:string[]):Query {
    // Do we actually have a schema for this collection
    if(!this._collection.schema) throw new Error(`Cannot populate document without a defined schema for '${this._collection.schema}'.`)
    const data:QueryData = clone(this._data, false)
    data.populate = keys
    return new Query(this._collection, data)
  }

  pos ():Query {
    return this.op('>', 0)
  }

  positive ():Query {
    return this.pos()
  }

  select (...keys:string[]):Query {
    if (keys.indexOf('_id') !== -1) throw new Error(`Document id is always included in the Document, no need to explicity select it.`)
    if (!keys.every(key => typeof key === 'string')) throw new Error(`All select keys must be of type "string".`)
    const data:QueryData = clone(this._data, false)
    data.select = keys
    return new Query(this._collection, data)
  }

  sort (...keys:string[]):Query {
    const data:QueryData = clone(this._data, false)
    data.sort = createSortData(keys)
    return new Query(this._collection, data)
  }

  within (min:any, max:any):Query {
    return this.op('>=', min).op('<=', max)
  }

  where (key:string):Query {
    const data:QueryData = clone(this._data, false)
    data.action = 'where'
    data.key = key
    return new Query(this._collection, data)
  }
}

export { Query }
