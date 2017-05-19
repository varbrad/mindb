import { Collection } from './collection'

const clone = require('clone')

interface QueryData {
  byId?:string // Used to uniquely find a document by it's _id
}

class Query {
  private _collection:Collection
  private _data:QueryData

  constructor (collection:Collection, data?:QueryData) {
    this._collection = collection
    this._data = data || {}
  }

  byId (id:string) {
    const data:QueryData = clone(this._data, false)
    data.byId = id
    return data
  }
}

export { Query }
