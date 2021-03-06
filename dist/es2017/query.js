import { createSortData, sortDocuments } from './utils';
const clone = require('clone');
class Query {
    constructor(collection, data) {
        this._collection = collection;
        this._data = data || {};
    }
    byId(id) {
        const data = clone(this._data, false);
        data.byId = id;
        return new Query(this._collection, data);
    }
    count() {
        const data = clone(this._data, false);
        data.count = true;
        return new Query(this._collection, data);
    }
    eq(value) {
        return this.op('===', value);
    }
    exec() {
        const q = this._data;
        let c;
        let usedIndex;
        let usedFullIndex = false;
        // By ID fetch or whole search
        if (q.byId) {
            c = [this._collection.get(q.byId)];
        }
        else {
            if (q.sort && !q.count) {
                // Try and get a matching index from the indexes which can reversed for a full index match
                // E.g. index('value') -> sort('value') <- full match
                // index('-value') -> sort('value') <- full match (reversed)
                // index('value', 'data') -> sort('-value', '-data') <- full match (reversed)
                let sortData = q.sort.slice();
                usedFullIndex = true;
                while (sortData.length > 0 || c === undefined) {
                    const sameName = sortData.map(qd => (qd.order === -1 ? '-' : '') + qd.key).join(',');
                    const reverseName = sortData.map(qd => (qd.order === -1 ? '' : '-') + qd.key).join(',');
                    c = this._collection.values(sameName);
                    if (c) {
                        usedIndex = sameName;
                        break;
                    }
                    c = this._collection.values(reverseName);
                    if (c) {
                        usedIndex = reverseName;
                        c = c.reverse();
                        break;
                    }
                    usedFullIndex = false;
                    sortData.pop();
                }
            }
            if (!c)
                c = this._collection.values();
            // Run JS filters
            if (q.filters) {
                q.filters.forEach(filter => {
                    c = c.filter(filter);
                });
            }
            // Run wheres
            if (q.wheres) {
                q.wheres.forEach(data => {
                    c = c.filter(doc => {
                        switch (data.op) {
                            case '>': return doc[data.key] > data.value;
                            case '<': return doc[data.key] < data.value;
                            case '>=': return doc[data.key] >= data.value;
                            case '<=': return doc[data.key] <= data.value;
                            case '===': return doc[data.key] === data.value;
                            case '!==': return doc[data.key] !== data.value;
                        }
                    });
                });
            }
            // Run sorts, only if not counting (dont bother sorting!)
            if (q.sort && !q.count && !(usedIndex && usedFullIndex)) {
                if (usedIndex && !usedFullIndex)
                    sortDocuments(c, q.sort, 'insertion');
                else
                    sortDocuments(c, q.sort, 'native');
            }
            // Limit & Offset
            if (q.limit || q.offset) {
                c = c.slice(q.offset || 0, (q.offset || 0) + (q.limit || c.length));
            }
        }
        // Apply select
        if (!q.count && q.select) {
            c = c.map(doc => {
                const o = { _id: doc._id };
                q.select.forEach(key => o[key] = doc[key]);
                return o;
            });
        }
        // Return the result set
        if (q.count) {
            return c.length;
        }
        else {
            return (q.limit === 1 || q.byId) ? c[0] : c;
        }
    }
    exists() {
        return this.op('!==', undefined);
    }
    filter(f) {
        const data = clone(this._data, false);
        data.filters = data.filters || [];
        data.filters.push(f);
        return new Query(this._collection, data);
    }
    gt(value) {
        return this.op('>', value);
    }
    gte(value) {
        return this.op('>=', value);
    }
    is(value) {
        return this.eq(value);
    }
    limit(m) {
        if (m === undefined)
            throw new Error(`No result limit specified on query.`);
        if (typeof m !== 'number')
            throw new Error(`Limit value must be a "number", not a "${typeof m}".`);
        if (m % 1 !== 0)
            throw new Error(`Result limit must be a whole number.`);
        if (m < 1)
            throw new Error(`Result limit must be larger than 0.`);
        const data = clone(this._data, false);
        data.limit = m;
        return new Query(this._collection, data);
    }
    lt(value) {
        return this.op('<', value);
    }
    lte(value) {
        return this.op('<=', value);
    }
    ne(value) {
        return this.op('!==', value);
    }
    neg() {
        return this.op('<', 0);
    }
    negative() {
        return this.neg();
    }
    not(value) {
        return this.ne(value);
    }
    offset(n) {
        if (n === undefined)
            throw new Error(`No result offset specified on query.`);
        if (typeof n !== 'number')
            throw new Error(`Offset value must be a "number", not a "${typeof n}".`);
        if (n % 1 !== 0)
            throw new Error(`Result offset must be a whole number.`);
        if (n < 0)
            throw new Error(`Result offset must be larger than or equal to 0.`);
        const data = clone(this._data, false);
        data.offset = n;
        return new Query(this._collection, data);
    }
    one() {
        return this.limit(1);
    }
    op(op, value) {
        const data = clone(this._data, false);
        data.wheres = data.wheres || [];
        data.wheres.push({ key: data.key, value: value, op: op });
        return new Query(this._collection, data);
    }
    populate(...keys) {
        // Do we actually have a schema for this collection
        if (!this._collection.schema)
            throw new Error(`Cannot populate document without a defined schema for '${this._collection.schema}'.`);
        const data = clone(this._data, false);
        data.populate = keys;
        return new Query(this._collection, data);
    }
    pos() {
        return this.op('>', 0);
    }
    positive() {
        return this.pos();
    }
    select(...keys) {
        if (keys.indexOf('_id') !== -1)
            throw new Error(`Document id is always included in the Document, no need to explicity select it.`);
        if (!keys.every(key => typeof key === 'string'))
            throw new Error(`All select keys must be of type "string".`);
        const data = clone(this._data, false);
        data.select = keys;
        return new Query(this._collection, data);
    }
    sort(...keys) {
        const data = clone(this._data, false);
        data.sort = createSortData(keys);
        return new Query(this._collection, data);
    }
    within(min, max) {
        return this.op('>=', min).op('<=', max);
    }
    where(key) {
        const data = clone(this._data, false);
        data.action = 'where';
        data.key = key;
        return new Query(this._collection, data);
    }
}
export { Query };
