import { Document } from './document'

import { SortData } from './types/types'

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
    if (this._sortData) {
      // Work out where the doc goes based on the sort data
    } else {
       this._index.push(doc)
    }
  }

  public remove(doc:Document):void {
    if (this._sortData) {
      // Work out where the document should be and remove it
    } else {
      this._index.splice(this._index.findIndex(d => d._id === doc._id), 1)
    }
  }

  public values():Document[] {
    return this._index
  }

}

export { Index }
