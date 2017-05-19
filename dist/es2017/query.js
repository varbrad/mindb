const clone = require('clone');
class Query {
    constructor(collection, data) {
        this._collection = collection;
        this._data = data || {};
    }
    byId(id) {
        const data = clone(this._data, false);
        data.byId = id;
        return data;
    }
}
export { Query };
