import { Index } from './index';
import { Query } from './query';
import { createSortData } from './utils';
class Collection {
    constructor(database, name, schema) {
        this._database = database;
        this.name = name;
        this.schema = schema;
        this._documents = {};
        this._indexes = { [Collection._DEFAULT_INDEX]: new Index(Collection._DEFAULT_INDEX) };
    }
    empty() {
        this._documents = {};
        Object.keys(this._indexes).forEach(key => {
            this._indexes[key].empty();
        });
    }
    find() {
        return new Query(this);
    }
    findOne(id) {
        // Ensure the id is a string
        if (id && typeof id !== 'string')
            throw new Error(`The document is must be a "string", not a "${typeof id}".`);
        if (id)
            return this.find().byId(id);
        else
            return this.find().limit(1);
    }
    get(id) {
        // Check the id is actually a string
        if (typeof id !== 'string')
            throw new Error(`The document id must be a "string", not a "${typeof name}".`);
        // Return the object if it exists
        if (id in this._documents)
            return this._documents[id];
        // Else return undefined, don't throw an error
        return undefined;
    }
    index(...keys) {
        const sortData = createSortData(keys);
        const name = keys.join(',');
        this._indexes[name] = new Index(name, sortData);
    }
    insert(document, overwrite = false) {
        // Does the document have an _id?
        if (!document._id)
            throw new Error(`The document to be inserted has no '_id'.`);
        // Ensure the _id is a string
        if (typeof document._id !== 'string')
            throw new Error(`A document must have a "string" _id, not a "${typeof name}".`);
        // Avoid reserved words
        Collection._RESERVED.forEach(word => {
            if (document._id === word)
                throw new Error(`The document _id '${document._id}' is an internal reserved name and cannot be used.`);
        });
        // Is this _id already in the collection?
        if (document._id in this._documents) {
            if (overwrite) {
                this.remove(document);
            }
            else {
                throw new Error(`The document _id '${document._id}' already exists within the '${this.name}' collection.`);
            }
        }
        // Add the document to the document object
        this._documents[document._id] = document;
        // Add the document to all indexes
        Object.keys(this._indexes).forEach(key => {
            this._indexes[key].insert(document);
        });
        // Return the document
        return document;
    }
    list() {
        return Object.keys(this._documents);
    }
    remove(a) {
        if (!a)
            throw new Error(`No argument provided to remove from collection.`);
        if (Array.isArray(a)) {
            a.forEach(doc => {
                this.remove(doc);
            });
        }
        else if (typeof a === 'object' && '_id' in a) {
            // Delete from dictionary
            delete this._documents[a._id];
            // Delete from indexes
            Object.keys(this._indexes).forEach(key => {
                this._indexes[key].remove(a);
            });
        }
        else if (typeof a === 'string') {
            const doc = this.get(a);
            if (doc)
                this.remove(doc);
        }
        else {
            throw new Error(`Incorrect argument provided to remove, must be either "string", "Document" or "Document[]", not "${typeof a}".`);
        }
    }
    upsert(document) {
        return this.insert(document, true);
    }
    values(name) {
        if (!name)
            return this._indexes[Collection._DEFAULT_INDEX].values();
        if (name in this._indexes)
            return this._indexes[name].values();
        return undefined;
    }
}
Collection._DEFAULT_INDEX = '__default';
Collection._RESERVED = [
    '_DEFAULT_INDEX',
    '_RESERVED',
    'name',
    'schema',
    '_database',
    '_documents',
    '_indexes',
    'get',
    'insert',
    'list',
    'upsert',
    'values'
];
function createCollectionProxy(database, name, schema) {
    const col = new Collection(database, name, schema);
    return new Proxy(col, {
        get(target, name) {
            if (name in target)
                return target[name];
            if (typeof name === 'string' && target.list().indexOf(name) !== -1)
                return target.get(name);
        },
        set(obj, prop, val) {
            if (prop in obj) {
                obj[prop] = val;
                return true;
            }
            throw new Error(`Do not dynamically set values on MinDB.Collection.`);
        }
    });
}
export { Collection, createCollectionProxy };
