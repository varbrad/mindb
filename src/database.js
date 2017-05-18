const Collection = require('./collection')

class Database {
  constructor (name) {
    this._name = name
    this._collections = {}
  }

  /**
   * Create a collection within this database.
   * @param {string} name The name of this collection.
   * @param {Schema|Object} schema The schema to use for this collection.
   */
  collection (name, schema) {
    // Is it just passing a name? If so, just return the collection if it already exists.
    if (name in this._collections) {
      if (schema) {
        // Schema is set, throw an error because this is not valid
        throw new Error(`A collection with name '${name}' already exists within this database.`)
      } else {
        // Just return the collection
        return this._collections[name]
      }
    }
    // Can't call it "collections", because reasons
    if (name === '_collections') throw new Error(`Collection name '_collections' is an internal reserved name and cannot be used.`)
    // Create the collection
    const col = Collection(this, name, schema)
    this._collections[name] = col
    // Return the collection
    return col
  }

  export () {
    return JSON.stringify(this.exportRaw())
  }

  exportRaw () {
    const o = { name: this._name, collections: [] }
    for (let key in this._collections) {
      o.collections.push(this._collections[key].exportRaw())
    }
    return o
  }
}

module.exports = function (name) {
  let db = new Database(name)

  return new Proxy(db, {
    get (target, name) {
      if (name in target) return target[name]
      if (name in target._collections) return target._collections[name]
    },

    set (obj, prop, val) {
      throw new Error(`Do not dynamically set values on a MinDB database.`)
    }
  })
}
