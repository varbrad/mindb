import { Database } from './database'

class Collection {
  public _database:Database
  public _name:string
  public _schema:Object
  public _documents:{ [_id:string]: Object }

  constructor (database:Database, name:string, schema:Object) {

  }
}

function createCollectionProxy (database:Database, name:string, schema:Object):Collection {
  const col:Collection = new Collection(database, name, schema)
  return new Proxy(col, {
    get (target:Collection, name) {
      if (name in target) return target[name]
      if (name in target._documents) return target._documents[name]
    }
  })
}

export { Collection, createCollectionProxy }
