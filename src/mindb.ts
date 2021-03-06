import { Database, createDatabaseProxy } from './database'
import { Collection } from './collection'
import { Index } from './index'
import { Query } from './query'

class MinDB {
  public Database:(typeof Database) = Database
  public Collection:(typeof Collection) = Collection
  public Index:(typeof Index) = Index
  public Query:(typeof Query) = Query

  private static _RESERVED:string[] = [
    'Database',
    'Collection',
    'Query',
    '_RESERVED',
    '_databases',
    'create',
    'get',
    'list',
    'reset'
  ]

  private _databases:{ [key:string]: Database }

  constructor () {
    this._databases = {}
  }

  public create (name:string):Database {
    // Check the name is actually a string
    if (typeof name !== 'string') throw new Error(`The database name must be a "string", not "${typeof name}".`)
    // Can't call it any of the reserved names
    MinDB._RESERVED.forEach(word => {
      if (name === word) throw new Error(`Database name '${name}' is an internal reserved name and cannot be used.`)
    })
    // Is there already a database with this name?
    if (name in this._databases) throw new Error(`A database with name '${name}' already exists.`)
    // Create the database
    const db:Database = createDatabaseProxy(name)
    this._databases[name] = db
    // Return the database ref
    return db
  }

  public get (name:string):Database {
    // Check the name is actually a string
    if (typeof name !== 'string') throw new Error(`The database name must be a "string", not a "${typeof name}".`)
    // Return the db if it exists
    if (name in this._databases) return this._databases[name]
    // Else throw an error
    throw new Error(`Database name '${name}' has not been created and does not exist.`)
  }

  public list ():string[] {
    return Object.keys(this._databases)
  }

  public reset (name?:string):void {
    if (name) {
      if (typeof name !== 'string') throw new Error(`The database name must be a "string", not a "${typeof name}".`)
      if (!(name in this._databases)) throw new Error(`Database name '${name}' does not exist and cannot be reset.`)
      delete this._databases[name]
    } else {
      this._databases = {}
    }
  }
}

export { MinDB }
