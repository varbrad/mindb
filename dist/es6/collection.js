class Collection {
    constructor(database, name, schema) {
    }
}
function createCollectionProxy(database, name, schema) {
    const col = new Collection(database, name, schema);
    return new Proxy(col, {
        get(target, name) {
            if (name in target)
                return target[name];
            if (name in target._documents)
                return target._documents[name];
        }
    });
}
export { Collection, createCollectionProxy };
