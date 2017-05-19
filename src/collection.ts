import { Database } from './database'
import { Document } from './document'
import { Query } from './query'

class Collection {
  private static _RESERVED:string[] = [
    '_RESERVED',
    'name',
    'schema',
    '_database',
    '_documents',
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

  constructor (database:Database, name:string, schema?:object) {
    this._database = database
    this.name = name
    this.schema = schema
    this._documents = {}
  }

  public empty ():void {
    this._documents = {}
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
    if (!overwrite && document._id in this._documents) throw new Error(`The document _id '${document._id}' already exists within the '${this.name}' collection.`)
    // Add the document
    this._documents[document._id] = document
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
    if (typeof a === 'string') {
      // Remove by id
      delete this._documents[a]
    } else if (a instanceof Array) {
      a.forEach(doc => {
        this.remove(doc._id)
      })
    } else if (typeof a === 'object') {
      this.remove(a._id)
    } else {
      throw new Error(`Incorrect argument provided to remove, must be either "string", "Document" or "Document[]", not "${typeof a}".`)
    }
  }

  public upsert (document:Document):Document {
    return this.insert(document, true)
  }

  public values ():Document[] {
    return Object.keys(this._documents).map(k => this._documents[k])
  }
}

function createCollectionProxy (database:Database, name:string, schema?:object):Collection {
  const col:Collection = new Collection(database, name, schema)
  return new Proxy(col, {
    get (target:Collection, name) {
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
