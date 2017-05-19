import { Database, createDatabaseProxy } from './database'

class MinDB {
  private static _RESERVED:string[] = [
    '_databases',
    'create',
    'get',
    'list'
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
    if (typeof name !== 'string') throw new Error(`The database name must be a "string", "not a "${typeof name}".`)
    // Return the db if it exists
    if (name in this._databases) return this._databases[name]
    // Else throw an error
    throw new Error(`Database name '${name}' has not been created and does not exist.`)
  }

  public list ():string[] {
    return Object.keys(this._databases)
  }
}

// Export the proxied class
export default new Proxy(new MinDB(), {
  get (target:MinDB, name:PropertyKey) {
    if (name in target) return target[name]
    // Return database if name is a string and found within the database list
    if (typeof name === 'string' && target.list().indexOf(name) !== -1) return target.get(name)
  },
  set (obj, prop, val):boolean {
    throw new Error(`Do not dynamically set values on MinDB.`)
  }
})
