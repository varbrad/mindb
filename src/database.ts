import { Collection, createCollectionProxy } from './collection'

class Database {
  private static _RESERVED:string[] = [
    '_RESERVED',
    'name',
    '_collections',
    '_options',
    'collection',
    'get',
    'list'
  ]

  public name:string

  private _collections:{ [key:string]: Collection }
  private _options:object

  constructor (name:string, options?:object) {
    this.name = name
    this._collections = {}
    this._options = options
  }

  public collection (name:string, schema?:object):Collection {
    // Check the name is actually a string
    if (typeof name !== 'string') throw new Error(`The collection name must be a "string", not "${typeof name}".`)
    // Can't call it any of the reserved names
    Database._RESERVED.forEach(word => {
      if (name === word) throw new Error(`Collection name '${name}' is an internal reserved name and cannot be used.`)
    })
    // Is there already a database with this name?
    if (name in this._collections) throw new Error(`A collection with name '${name}' already exists on database '${this.name}'.`)
    // Create the collection
    const col:Collection = createCollectionProxy(this, name, schema)
    this._collections[name] = col
    // Return the collection ref
    return col
  }

  public get (name:string):Collection {
    // Check the name is actually a string
    if (typeof name !== 'string') throw new Error(`The collection name must be a "string", "not a "${typeof name}".`)
    // Return the col if it exists
    if (name in this._collections) return this._collections[name]
    // Else throw an error
    throw new Error(`Collection name '${name}' has not been created and does not exist on database '${this.name}'.`)
  }

  public list ():string[] {
    return Object.keys(this._collections)
  }

}

function createDatabaseProxy (name:string, options?:object):Database {
  const db:Database = new Database(name, options)
  return new Proxy(db, {
    get (target:Database, name:PropertyKey) {
      if (name in target) return target[name]
      // Return collection if name is a string and found within the collections list
      if (typeof name === 'string' && target.list().indexOf(name) !== -1) return target.get(name)
    },
    set (obj:Database, prop:PropertyKey, val:any):boolean {
      if (prop in obj) {
        obj[prop] = val
        return true
      }
      throw new Error(`Do not dynamically set values on MinDB.Database.`)
    }
  })
}

export { Database, createDatabaseProxy }
