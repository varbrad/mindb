const Database = require('./database')

class MinDB {
  constructor () {
    this._databases = {}
  }

  /**
   * Create a new database.
   *
   * @param {String} name The name of the database.
   */
  create (name) {
    // Is there already a database with this name?
    if (name in this._databases) throw new Error(`A database with name '${name}' already exists.`)
    // Can't call it "databases", because reasons
    if (name === '_databases') throw new Error(`Database name '_databases' is an internal reserved name and cannot be used.`)
    // Create the database
    const db = Database(name)
    this._databases[name] = db
    // Return the database
    return db
  }
}

module.exports = new Proxy(new MinDB(), {
  get (target, name) {
    if (name in target) return target[name]
    if (name in target._databases) return target._databases[name]
  },

  set (obj, prop, val) {
    throw new Error(`Do not dynamically set values on MinDB.`)
  }
})
