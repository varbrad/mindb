import { Collection } from './collection'
import { Document } from './document'

import { QueryData, WheresData } from './types/types'

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

  eq (value:any):Query {
    return this.op('===', value)
  }

  exec ():Document|Document[] {
    const q:QueryData = this._data
    let c:Document[]
    // By ID fetch or whole search
    if (q.byId) {
      c = [ this._collection.get(q.byId) ]
    } else {
      c = this._collection.values()
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
      // Run sorts
      if (q.sort) {
        c = c.sort((a:Document, b:Document):number => {
          let r:number = 0
          q.sort.every(sort => {
            // Get document values
            const _a = a[sort.key]
            const _b = b[sort.key]
            // If the values are different
            if (_a !== _b) {
              // If numbers, use number sorting comparison
              if (typeof _a === 'number' && typeof _b === 'number') r = (_a - _b) * sort.order
              // Else just use standard gt/lt comparison
              else r = (_a > _b ? 1 : -1) * sort.order
              // Return false, we don't need to sort on further keys
              return false
            } else {
              // We will need to sort on the next key, as the values were equal
              return true
            }
          })
          // Return the resulting sort value
          return r
        })
      }
      // Limit & Offset
      if (q.limit || q.offset) {
        c = c.slice(q.offset || 0, (q.offset || 0) + (q.limit || c.length))
      }
    }
    // Return the result set
    return (q.limit === 1 || q.byId) ? c[0]: c
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

  gte (value: any):Query {
    return this.op('>=', value)
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

  sort (...keys:string[]):Query {
    const data:QueryData = clone(this._data, false)
    data.sort = []
    keys.forEach(key => {
      const order:1|-1 = key[0] === '-' ? -1 : 1
      data.sort.push({ key: key.replace(/(\-|\+)/g, ''), order: order })
    })
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
