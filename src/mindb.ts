import { Database, createDatabaseProxy } from './database'

class MinDB {
  private static _databases:{ [key:string]: Database }

  public static create (name:string):Database {
    // Is there already a database with this name?
    if (name in this._databases) throw new Error(`A database with name '${name}' already exists.`)
    // Can't call it "_databases" because of reasons
    if (name === '_databases') throw new Error(`Database name '_databases' is an internal reserved name and cannot be used.`)
    // Create the database
    const db:Database = createDatabaseProxy(name)
    this._databases[name] = db
    return db
  }
}

export default MinDB
