import { Database } from './database'
import { Document } from './document'
import { Index } from './index'
import { Query } from './query'

import { createSortData } from './utils'

class Collection {
  private static _DEFAULT_INDEX:string = '__default'

  private static _RESERVED:string[] = [
    '_DEFAULT_INDEX',
    '_RESERVED',
    'name',
    'schema',
    '_database',
    '_documents',
    '_indexes',
    'get',
    'insert',
    'list',
    'upsert',
    'values'
  ]

  public name:string
  public schema:object

  private _database:Database
  private _documents:{ [_id:string]: Document }
  private _indexes:{ [name:string]: Index }

  constructor (database:Database, name:string, schema?:object) {
    this._database = database
    this.name = name
    this.schema = schema
    this._documents = {}
    this._indexes = { [Collection._DEFAULT_INDEX]: new Index(this, Collection._DEFAULT_INDEX) }
  }

  public count ():Query {
    return this.find().count()
  }

  public empty ():void {
    this._documents = {}
    Object.keys(this._indexes).forEach(key => {
      this._indexes[key].empty()
    })
  }

  public exportJSON ():string {
    return JSON.stringify(this.values())
  }

  public find ():Query {
    return new Query(this)
  }

  public findOne (id?:string):Query {
    // Ensure the id is a string
    if (id && typeof id !== 'string') throw new Error(`The document is must be a "string", not a "${typeof id}".`)
    if (id) return this.find().byId(id)
    else return this.find().limit(1)
  }

  public get (id:string):Document {
    // Check the id is actually a string
    if (typeof id !== 'string') throw new Error(`The document id must be a "string", not a "${typeof name}".`)
    // Return the object if it exists
    if (id in this._documents) return this._documents[id]
    // Else return undefined, don't throw an error
    return undefined
  }

  public importJSON (json:string, overwrite:boolean = false):void {
    if (json === undefined) throw new Error(`No json string was provided to import.`)
    let o
    try {
      o = JSON.parse(json)
    } catch (e) {
      throw new Error(`Unable to parse the given json string.`)
    }
    o.forEach(doc => {
      this.insert(doc, overwrite)
    })
  }

  public index (...keys:string[]):void {
    const sortData = createSortData(keys)
    const name = keys.map(k => k.replace(/^\+/, '')).join(',')
    this._indexes[name] = new Index(this, name, sortData)
  }

  public insert (document:Document, overwrite:boolean = false):Document {
    // Does the document have an _id?
    if (!document._id) throw new Error(`The document to be inserted has no '_id'.`)
    // Ensure the _id is a string
    if (typeof document._id !== 'string') throw new Error(`A document must have a "string" _id, not a "${typeof name}".`)
    // Avoid reserved words
    Collection._RESERVED.forEach(word => {
      if (document._id === word) throw new Error(`The document _id '${document._id}' is an internal reserved name and cannot be used.`)
    })
    // Is this _id already in the collection?
    if (document._id in this._documents) {
      if (overwrite) {
        this.remove(document)
      } else {
        throw new Error(`The document _id '${document._id}' already exists within the '${this.name}' collection.`)
      }
    }
    // Add the document to the document object
    this._documents[document._id] = document
    // Add the document to all indexes
    Object.keys(this._indexes).forEach(key => {
      this._indexes[key].insert(document)
    })
    // Return the document
    return document
  }

  public list ():string[] {
    return Object.keys(this._documents)
  }

  public remove (id:string):void
  public remove (doc:Document):void
  public remove (docs:Document[]):void
  public remove (a:string|Document|Document[]):void {
    if (!a) throw new Error(`No argument provided to remove from collection.`)
    if (Array.isArray(a)) {
      a.forEach(doc => {
        this.remove(doc)
      })
    } else if (typeof a === 'object') {
      if (!('_id' in a)) throw new Error(`The provided document to remove has no '_id'.`)
      if (typeof a._id !== 'string') throw new Error(`The provided document to remove has a non-string '_id'.`)
      // Delete from dictionary
      delete this._documents[a._id]
      // Delete from indexes
      Object.keys(this._indexes).forEach(key => {
        this._indexes[key].remove(a)
      })
    } else if (typeof a === 'string') {
      const doc = this.get(a)
      if (doc) this.remove(doc)
    } else {
      throw new Error(`Incorrect argument provided to remove, must be either "string", "Document" or "Document[]", not "${typeof a}".`)
    }
  }

  public upsert (document:Document):Document {
    return this.insert(document, true)
  }

  public values (name?:string):Document[] {
    if (!name) {
      if (!this._indexes || !(Collection._DEFAULT_INDEX in this._indexes)) return undefined
      return this._indexes[Collection._DEFAULT_INDEX].values()
    }
    if (name in this._indexes) return this._indexes[name].values()
    return undefined
  }
}

function createCollectionProxy (database:Database, name:string, schema?:object):Collection {
  const col:Collection = new Collection(database, name, schema)
  return new Proxy(col, {
    get (target:Collection, name:PropertyKey) {
      if (name in target) return target[name]
      if (typeof name === 'string' && target.list().indexOf(name) !== -1) return target.get(name)
    },
    set (obj:Collection, prop:PropertyKey, val:any):boolean {
      if (prop in obj) {
        obj[prop] = val
        return true
      }
      throw new Error(`Do not dynamically set values on MinDB.Collection.`)
    }
  })
}

export { Collection, createCollectionProxy }
