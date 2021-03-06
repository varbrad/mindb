import { createCollectionProxy } from './collection';
class Database {
    constructor(name, options) {
        this.name = name;
        this._collections = {};
        this._options = options;
    }
    collection(name, schema) {
        // Check the name is actually a string
        if (typeof name !== 'string')
            throw new Error(`The collection name must be a "string", not "${typeof name}".`);
        // Can't call it any of the reserved names
        Database._RESERVED.forEach(word => {
            if (name === word)
                throw new Error(`Collection name '${name}' is an internal reserved name and cannot be used.`);
        });
        // Is there already a database with this name?
        if (name in this._collections)
            throw new Error(`A collection with name '${name}' already exists on database '${this.name}'.`);
        // Create the collection
        const col = createCollectionProxy(this, name, schema);
        this._collections[name] = col;
        // Return the collection ref
        return col;
    }
    exportJSON() {
        const o = {
            collections: []
        };
        // For every collection
        Object.keys(this._collections).map(key => this._collections[key]).forEach(clx => {
            o.collections.push({
                name: clx.name,
                values: clx.values()
            });
        });
        return JSON.stringify(o);
    }
    get(name) {
        // Check the name is actually a string
        if (typeof name !== 'string')
            throw new Error(`The collection name must be a "string", "not a "${typeof name}".`);
        // Return the col if it exists
        if (name in this._collections)
            return this._collections[name];
        // Else throw an error
        throw new Error(`Collection name '${name}' has not been created and does not exist on database '${this.name}'.`);
    }
    importJSON(json, overwrite = false) {
        const o = JSON.parse(json);
        o.collections.forEach(clxData => {
            const clx = this.get(clxData.name);
            clxData.values.forEach(doc => clx.insert(doc, overwrite));
        });
    }
    list() {
        return Object.keys(this._collections);
    }
}
Database._RESERVED = [
    '_RESERVED',
    'name',
    '_collections',
    '_options',
    'collection',
    'get',
    'list'
];
function createDatabaseProxy(name, options) {
    const db = new Database(name, options);
    return new Proxy(db, {
        get(target, name) {
            if (name in target)
                return target[name];
            // Return collection if name is a string and found within the collections list
            if (typeof name === 'string' && target.list().indexOf(name) !== -1)
                return target.get(name);
        },
        set(obj, prop, val) {
            if (prop in obj) {
                obj[prop] = val;
                return true;
            }
            throw new Error(`Do not dynamically set values on MinDB.Database.`);
        }
    });
}
export { Database, createDatabaseProxy };
