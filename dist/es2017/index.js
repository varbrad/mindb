import { binaryInsert, binarySearch } from './utils';
class Index {
    constructor(name, sortData) {
        this.name = name;
        this._index = [];
        this._sortData = sortData;
    }
    empty() {
        this._index.length = 0;
    }
    insert(doc) {
        if (this._sortData && this._index.length > 0) {
            // Work out where the doc goes based on the sort data
            binaryInsert(this._index, doc, this._sortData);
        }
        else {
            this._index.push(doc);
        }
    }
    remove(doc) {
        if (this._sortData) {
            let i = binarySearch(this._index, doc, this._sortData);
        }
        else {
            this._index.splice(this._index.findIndex(d => d._id === doc._id), 1);
        }
    }
    values() {
        return this._index;
    }
}
export { Index };
