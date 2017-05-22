import { Document } from './document'

import { SortData } from './types/types'

import { binaryInsert, binarySearch, quickSort } from './utils'

class Index {
  public name:string

  private _index:Document[]
  private _sortData:SortData[]

  constructor (name:string, sortData?:SortData[]) {
    this.name = name
    this._index = []
    this._sortData = sortData
  }

  public empty():void {
    this._index.length = 0
  }

  public insert(doc:Document):void {
    if (this._sortData && this._index.length > 0) {
      // Work out where the doc goes based on the sort data
      binaryInsert(this._index, doc, this._sortData)
    } else {
       this._index.push(doc)
    }
  }

  public remove(doc:Document):void {
    if (this._sortData) {
      let i = binarySearch(this._index, doc, this._sortData)
    } else {
      this._index.splice(this._index.findIndex(d => d._id === doc._id), 1)
    }
  }

  public values():Document[] {
    return this._index
  }

}

export { Index }
