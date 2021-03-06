import { binarySearch, sortDocuments } from './utils';
class Index {
    constructor(collection, name, sortData) {
        this._collection = collection;
        this.name = name;
        this._index = this._collection.values() || [];
        this._sortData = sortData;
        if (this._index.length > 1 && this._sortData) {
            sortDocuments(this._index, this._sortData);
        }
    }
    empty() {
        this._index.length = 0;
    }
    insert(doc) {
        if (this._sortData && this._index.length > 0) {
            // Work out where the doc goes based on the sort data
            let i = binarySearch(this._index, doc, this._sortData, true);
            this._index.splice(i, 0, doc);
        }
        else {
            this._index.push(doc);
        }
    }
    remove(doc) {
        if (this._sortData) {
            let i = binarySearch(this._index, doc, this._sortData);
            this._index.splice(i, 1);
        }
        else {
            this._index.splice(this._index.findIndex(d => d._id === doc._id), 1);
        }
    }
    values() {
        return this._index.slice();
    }
}
export { Index };
