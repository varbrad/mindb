const Query = require('./query')

class Collection {
  constructor (database, name, schema) {
    this._database = database
    this._name = name
    this._schema = schema
    this._documents = {}
  }

  /**
   * Insert a document into the collection.
   * @param {Object} document The document (object) to insert.
   */
  insert (document) {
    // Does this document have an _id?
    if (!document._id) throw new Error(`The document to be inserted has no '_id'.`)
    // Is this _id already in the collection?
    if (document._id in this._documents) throw new Error(`The document _id '${document._id}' already exists within the collection.`)
    // _id cant be '_documents', because reasons
    if (document._id === '_documents') throw new Error(`Document _id '_documents' is an internal reserved name and cannot be used.`)
    // Add the document
    this._documents[document._id] = document
    // Returns the document
    return document
  }

  upsert (document) {
    // Does this document have an _id?
    if (!document._id) throw new Error(`The document to be inserted has no '_id'.`)
    // _id cant be '_documents', because reasons
    if (document._id === '_documents') throw new Error(`Document _id '_documents' is an internal reserved name and cannot be used.`)
    // Add or overwrite the document
    this._documents[document._id] = document
    // Returns the document
    return document
  }

  find () {
    return new Query(this)
  }

  findOne (id) {
    let query = new Query(this)
    if (id) return query.byId(id)
    return new Query(this).limit(1)
  }

  export () {
    return JSON.stringify(this.exportRaw())
  }

  exportRaw () {
    const o = { name: this._name, documents: [] }
    for (let key in this._documents) {
      o.documents.push(this._documents[key])
    }
    return o
  }
}

module.exports = function (name, schema) {
  const col = new Collection(name, schema)

  return new Proxy(col, {
    get (target, name) {
      if (name in target) return target[name]
      if (name in target._documents) return target._documents[name]
    },

    set (obj, prop, val) {
      throw new Error(`Do not dynamically set values on a MinDB collection.`)
    }
  })
}
