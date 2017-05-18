class Database {
  public _collections:{ [key:string]: Object }

  constructor (name:string) {

  }
}

function createDatabaseProxy (name:string):Database {
  const db:Database = new Database(name)
  return new Proxy(db, {
    get (target:Database, name) {
      if (name in target) return target[name]
      if (name in target._collections) return target._collections[name]
    }
  })
}

export { Database, createDatabaseProxy }
