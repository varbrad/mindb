import { Collection } from './collection'
import { Document } from './document'

import { SortData } from './types/types'

import { binarySearch, sortDocuments } from './utils'

class Index {
  public name:string

  private _collection:Collection
  private _index:Document[]
  private _sortData:SortData[]

  constructor (collection:Collection, name:string, sortData?:SortData[]) {
    this._collection = collection
    this.name = name
    this._index = this._collection.values() || []
    this._sortData = sortData
    if (this._index.length > 1 && this._sortData) {
      sortDocuments(this._index, this._sortData)
    }
  }

  public empty():void {
    this._index.length = 0
  }

  public insert(doc:Document):void {
    if (this._sortData && this._index.length > 0) {
      // Work out where the doc goes based on the sort data
      let i = binarySearch(this._index, doc, this._sortData, true)
      this._index.splice(i, 0, doc)
    } else {
       this._index.push(doc)
    }
  }

  public remove(doc:Document):void {
    if (this._sortData) {
      let i = binarySearch(this._index, doc, this._sortData)
      this._index.splice(i, 1)
    } else {
      this._index.splice(this._index.findIndex(d => d._id === doc._id), 1)
    }
  }

  public values():Document[] {
    return this._index.slice()
  }

}

export { Index }
