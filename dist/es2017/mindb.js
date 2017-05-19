import { createDatabaseProxy } from './database';
class MinDB {
    constructor() {
        this._databases = {};
    }
    create(name) {
        // Check the name is actually a string
        if (typeof name !== 'string')
            throw new Error(`The database name must be a "string", not "${typeof name}".`);
        // Can't call it any of the reserved names
        MinDB._RESERVED.forEach(word => {
            if (name === word)
                throw new Error(`Database name '${name}' is an internal reserved name and cannot be used.`);
        });
        // Is there already a database with this name?
        if (name in this._databases)
            throw new Error(`A database with name '${name}' already exists.`);
        // Create the database
        const db = createDatabaseProxy(name);
        this._databases[name] = db;
        // Return the database ref
        return db;
    }
    get(name) {
        // Check the name is actually a string
        if (typeof name !== 'string')
            throw new Error(`The database name must be a "string", "not a "${typeof name}".`);
        // Return the db if it exists
        if (name in this._databases)
            return this._databases[name];
        // Else throw an error
        throw new Error(`Database name '${name}' has not been created and does not exist.`);
    }
    list() {
        return Object.keys(this._databases);
    }
}
MinDB._RESERVED = [
    '_RESERVED',
    '_databases',
    'create',
    'get',
    'list'
];
export { MinDB };
