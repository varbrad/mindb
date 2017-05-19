import { Database } from './database'
import { Document } from './document'
import { Query } from './query'

class Collection {
  private static _RESERVED:string[] = [
    '_database',
    '_name',
    '_schema',
    '_documents',
    'get',
    'insert',
    'list',
    'upsert'
  ]

  private _database:Database
  private _name:string
  private _schema:object
  private _documents:{ [_id:string]: Document }

  constructor (database:Database, name:string, schema?:object) {
    this._database = database
    this._name = name
    this._schema = schema
    this._documents = {}
  }

  public find ():Query {
    return new Query(this)
  }

  public findOne (id?:string):Query {
    // Ensure the id is a string
    if (typeof id !== 'string') throw new Error(`The document is must be a "string", not a "${typeof id}".`)
    let q = this.find()
    return q
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
    if (!overwrite && document._id in this._documents) throw new Error(`The document _id '${document._id}' already exists within the '${this._name}' collection.`)
    // Add the document
    this._documents[document._id] = document
    // Return the document
    return document
  }

  public list ():string[] {
    return Object.keys(this._documents)
  }

  public upsert (document:Document):Document {
    return this.insert(document, true)
  }
}

function createCollectionProxy (database:Database, name:string, schema?:object):Collection {
  const col:Collection = new Collection(database, name, schema)
  return new Proxy(col, {
    get (target:Collection, name) {
      if (name in target) return target[name]
      if (typeof name === 'string' && target.list().indexOf(name) !== -1) return target.get[name]
    }
  })
}

export { Collection, createCollectionProxy }
