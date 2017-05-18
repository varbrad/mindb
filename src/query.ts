import { Collection } from './collection'

class Query {
  private _collection:Collection
  private _data:Object

  constructor (collection:Collection, data:Object) {
    this._collection = collection
    this._data = data || {}
  }
}

export { Query }
