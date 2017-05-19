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
    eq(value) {
        return this.op('===', value);
    }
    exec() {
        const q = this._data;
        let c;
        // By ID fetch or whole search
        if (q.byId) {
            c = [this._collection.get(q.byId)];
        }
        else {
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
            // Run sorts
            if (q.sort) {
                c = c.sort((a, b) => {
                    let r = 0;
                    q.sort.every(sort => {
                        // Get document values
                        const _a = a[sort.key];
                        const _b = b[sort.key];
                        // If the values are different
                        if (_a !== _b) {
                            // If numbers, use number sorting comparison
                            if (typeof _a === 'number' && typeof _b === 'number')
                                r = (_a - _b) * sort.order;
                            else
                                r = (_a > _b ? 1 : -1) * sort.order;
                            // Return false, we don't need to sort on further keys
                            return false;
                        }
                        else {
                            // We will need to sort on the next key, as the values were equal
                            return true;
                        }
                    });
                    // Return the resulting sort value
                    return r;
                });
            }
            // Limit & Offset
            if (q.limit || q.offset) {
                c = c.slice(q.offset || 0, (q.offset || 0) + (q.limit || c.length));
            }
        }
        // Return the result set
        return (q.limit === 1 || q.byId) ? c[0] : c;
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
    limit(m) {
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
    sort(...keys) {
        const data = clone(this._data, false);
        data.sort = [];
        keys.forEach(key => {
            const order = key[0] === '-' ? -1 : 1;
            data.sort.push({ key: key.replace(/(\-|\+)/g, ''), order: order });
        });
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
