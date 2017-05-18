class Database {
    constructor(name) {
    }
}
function createDatabaseProxy(name) {
    const db = new Database(name);
    return new Proxy(db, {
        get(target, name) {
            if (name in target)
                return target[name];
            if (name in target._collections)
                return target._collections[name];
        }
    });
}
export { Database, createDatabaseProxy };
