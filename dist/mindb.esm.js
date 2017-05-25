function nestedProperty(doc, key) {
    key = key.replace(/\[(\w+)\]/g, '.$1');
    key = key.replace(/^\./, '');
    var parts = key.split('.');
    var val = doc;
    parts.forEach(function (k) {
        // Is k within val?
        if (!val.hasOwnProperty(k)) throw new Error('Nested property \'' + key + '\' could not be resolved at \'' + k + '\' property.');
        val = val[k];
    });
    return val;
}
function sortDocuments(documents, sortData, algorithm) {
    switch (algorithm) {
        case 'insertion':
            insertionSort(documents, sortData);
            return;
        case 'heap':
            heapSort(documents, sortData);
            return;
        case 'native':
            sort(documents, sortData);
            return;
        case 'quick':
            quickSort(documents, sortData);
            return;
        default:
            sort(documents, sortData);
            return;
    }
}
function sort(documents, sortData) {
    documents.sort(evalCompare(sortData));
}
// This function is quite slow!
function comparisonFn(sortData) {
    return function (a, b) {
        var l = sortData.length;
        for (var i = 0; i < l; ++i) {
            var _sort = sortData[i];
            var _a = void 0;
            var _b = void 0;
            if (_sort.nested) {
                _a = nestedProperty(a, _sort.key);
                _b = nestedProperty(b, _sort.key);
            } else {
                _a = a[_sort.key];
                _b = b[_sort.key];
            }
            if (_a !== _b) {
                return (_a > _b ? 1 : -1) * _sort.order;
            }
        }
        return 0;
    };
}
function evalCompare(sortData) {
    var str = '';
    sortData.forEach(function (sort) {
        str += 'if(a.' + sort.key + (sort.order === 1 ? '>' : '<') + 'b.' + sort.key + ')return 1;';
        str += 'if(a.' + sort.key + (sort.order === 1 ? '<' : '>') + 'b.' + sort.key + ')return -1;';
    });
    str += 'return 0;';
    return Function('a', 'b', str);
}
function insertionSort(documents, sortData) {
    var compare = evalCompare(sortData);
    for (var i = 1; i < documents.length; ++i) {
        var j = i;
        while (j > 0 && compare(documents[j - 1], documents[j]) > 0) {
            arraySwap(documents, j, j - 1);
            j--;
        }
    }
}
function heapSort(documents, sortData) {
    var compare = evalCompare(sortData);
    var len = documents.length;
    for (var i = Math.floor(len * .5); i > -1; --i) {
        heapify(documents, i, len, compare);
    }for (var _i = documents.length - 1; _i > 0; --_i) {
        arraySwap(documents, 0, _i);
        len--;
        heapify(documents, 0, len, compare);
    }
}
function heapify(documents, i, len, compare) {
    var l = 2 * i + 1;
    var r = 2 * i + 2;
    var largest = i;
    if (l < len && compare(documents[l], documents[largest]) > 0) largest = l;
    if (r < len && compare(documents[r], documents[largest]) > 0) largest = r;
    if (largest !== i) {
        arraySwap(documents, i, largest);
        heapify(documents, largest, len, compare);
    }
}
function quickSort(documents, sortData) {
    quickSortFn(documents, 0, documents.length - 1, evalCompare(sortData));
}
function quickSortFn(docs, left, right, compare) {
    var iLeft = left;
    var iRight = right;
    var dir = true;
    var pivot = right;
    while (left - right < 0) {
        if (dir) {
            if (compare(docs[pivot], docs[left]) < 0) {
                arraySwap(docs, pivot, left);
                pivot = left;
                right--;
                dir = !dir;
            } else {
                left++;
            }
        } else {
            if (compare(docs[pivot], docs[right]) <= 0) {
                right--;
            } else {
                arraySwap(docs, pivot, right);
                pivot = right;
                left++;
                dir = !dir;
            }
        }
    }
    if (pivot - 1 > iLeft) quickSortFn(docs, iLeft, pivot - 1, compare);
    if (pivot + 1 < iRight) quickSortFn(docs, pivot + 1, iRight, compare);
}
function arraySwap(a, i, j) {
    var t = a[i];
    a[i] = a[j];
    a[j] = t;
}
function createSortData(keys) {
    var sd = [];
    keys.forEach(function (key) {
        var order = key[0] === '-' ? -1 : 1;
        var nested = key.match(/(\[|\]|\.)/g) ? true : false;
        sd.push({ key: key.replace(/(\-|\+)/g, ''), order: order, nested: nested });
    });
    return sd;
}
/**
 * @param index The index to traverse
 * @param document The document to find
 * @param sortData The sorting data for the index
 * @param lastIndex Whether to return the insertion index (false for search, true for insert)
 *
 * @return The index of the item
 */
function binarySearch(index, document, sortData, lastIndex) {
    var compare = comparisonFn(sortData);
    var min = 0;
    var max = index.length - 1;
    var i = void 0;
    var d = void 0;
    var comp = void 0;
    while (true) {
        i = min + Math.floor((max - min) / 2);
        comp = compare(document, index[i]);
        if (comp === 0) return i;
        if (comp > 0) {
            // Move to the right if we can
            if (i === max) return lastIndex ? i + 1 : -1;
            min += Math.ceil((max - min + 1) / 2);
        } else {
            // Move to the left if we can
            if (i === min) return lastIndex ? i : -1;
            max -= Math.ceil((max - min + 1) / 2);
        }
    }
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var Index = function () {
    function Index(collection, name, sortData) {
        classCallCheck(this, Index);

        this._collection = collection;
        this.name = name;
        this._index = this._collection.values() || [];
        this._sortData = sortData;
        if (this._index.length > 1 && this._sortData) {
            sortDocuments(this._index, this._sortData);
        }
    }

    createClass(Index, [{
        key: 'empty',
        value: function empty() {
            this._index.length = 0;
        }
    }, {
        key: 'insert',
        value: function insert(doc) {
            if (this._sortData && this._index.length > 0) {
                // Work out where the doc goes based on the sort data
                var i = binarySearch(this._index, doc, this._sortData, true);
                this._index.splice(i, 0, doc);
            } else {
                this._index.push(doc);
            }
        }
    }, {
        key: 'remove',
        value: function remove(doc) {
            if (this._sortData) {
                var i = binarySearch(this._index, doc, this._sortData);
                this._index.splice(i, 1);
            } else {
                this._index.splice(this._index.findIndex(function (d) {
                    return d._id === doc._id;
                }), 1);
            }
        }
    }, {
        key: 'values',
        value: function values() {
            return this._index.slice();
        }
    }]);
    return Index;
}();

var clone = require('clone');

var Query = function () {
    function Query(collection, data) {
        classCallCheck(this, Query);

        this._collection = collection;
        this._data = data || {};
    }

    createClass(Query, [{
        key: 'byId',
        value: function byId(id) {
            var data = clone(this._data, false);
            data.byId = id;
            return new Query(this._collection, data);
        }
    }, {
        key: 'count',
        value: function count() {
            var data = clone(this._data, false);
            data.count = true;
            return new Query(this._collection, data);
        }
    }, {
        key: 'eq',
        value: function eq(value) {
            return this.op('===', value);
        }
    }, {
        key: 'exec',
        value: function exec() {
            var q = this._data;
            var c = void 0;
            var usedIndex = void 0;
            var usedFullIndex = false;
            // By ID fetch or whole search
            if (q.byId) {
                c = [this._collection.get(q.byId)];
            } else {
                if (q.sort && !q.count) {
                    // Try and get a matching index from the indexes which can reversed for a full index match
                    // E.g. index('value') -> sort('value') <- full match
                    // index('-value') -> sort('value') <- full match (reversed)
                    // index('value', 'data') -> sort('-value', '-data') <- full match (reversed)
                    var sortData = q.sort.slice();
                    usedFullIndex = true;
                    while (sortData.length > 0 || c === undefined) {
                        var sameName = sortData.map(function (qd) {
                            return (qd.order === -1 ? '-' : '') + qd.key;
                        }).join(',');
                        var reverseName = sortData.map(function (qd) {
                            return (qd.order === -1 ? '' : '-') + qd.key;
                        }).join(',');
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
                if (!c) c = this._collection.values();
                // Run JS filters
                if (q.filters) {
                    q.filters.forEach(function (filter) {
                        c = c.filter(filter);
                    });
                }
                // Run wheres
                if (q.wheres) {
                    q.wheres.forEach(function (data) {
                        c = c.filter(function (doc) {
                            switch (data.op) {
                                case '>':
                                    return doc[data.key] > data.value;
                                case '<':
                                    return doc[data.key] < data.value;
                                case '>=':
                                    return doc[data.key] >= data.value;
                                case '<=':
                                    return doc[data.key] <= data.value;
                                case '===':
                                    return doc[data.key] === data.value;
                                case '!==':
                                    return doc[data.key] !== data.value;
                            }
                        });
                    });
                }
                // Run sorts, only if not counting (dont bother sorting!)
                if (q.sort && !q.count && !(usedIndex && usedFullIndex)) {
                    if (usedIndex && !usedFullIndex) sortDocuments(c, q.sort, 'insertion');else sortDocuments(c, q.sort, 'native');
                }
                // Limit & Offset
                if (q.limit || q.offset) {
                    c = c.slice(q.offset || 0, (q.offset || 0) + (q.limit || c.length));
                }
            }
            // Apply select
            if (!q.count && q.select) {
                c = c.map(function (doc) {
                    var o = { _id: doc._id };
                    q.select.forEach(function (key) {
                        return o[key] = doc[key];
                    });
                    return o;
                });
            }
            // Return the result set
            if (q.count) {
                return c.length;
            } else {
                return q.limit === 1 || q.byId ? c[0] : c;
            }
        }
    }, {
        key: 'exists',
        value: function exists() {
            return this.op('!==', undefined);
        }
    }, {
        key: 'filter',
        value: function filter(f) {
            var data = clone(this._data, false);
            data.filters = data.filters || [];
            data.filters.push(f);
            return new Query(this._collection, data);
        }
    }, {
        key: 'gt',
        value: function gt(value) {
            return this.op('>', value);
        }
    }, {
        key: 'gte',
        value: function gte(value) {
            return this.op('>=', value);
        }
    }, {
        key: 'is',
        value: function is(value) {
            return this.eq(value);
        }
    }, {
        key: 'limit',
        value: function limit(m) {
            if (m === undefined) throw new Error('No result limit specified on query.');
            if (typeof m !== 'number') throw new Error('Limit value must be a "number", not a "' + (typeof m === 'undefined' ? 'undefined' : _typeof(m)) + '".');
            if (m % 1 !== 0) throw new Error('Result limit must be a whole number.');
            if (m < 1) throw new Error('Result limit must be larger than 0.');
            var data = clone(this._data, false);
            data.limit = m;
            return new Query(this._collection, data);
        }
    }, {
        key: 'lt',
        value: function lt(value) {
            return this.op('<', value);
        }
    }, {
        key: 'lte',
        value: function lte(value) {
            return this.op('<=', value);
        }
    }, {
        key: 'ne',
        value: function ne(value) {
            return this.op('!==', value);
        }
    }, {
        key: 'neg',
        value: function neg() {
            return this.op('<', 0);
        }
    }, {
        key: 'negative',
        value: function negative() {
            return this.neg();
        }
    }, {
        key: 'not',
        value: function not(value) {
            return this.ne(value);
        }
    }, {
        key: 'offset',
        value: function offset(n) {
            if (n === undefined) throw new Error('No result offset specified on query.');
            if (typeof n !== 'number') throw new Error('Offset value must be a "number", not a "' + (typeof n === 'undefined' ? 'undefined' : _typeof(n)) + '".');
            if (n % 1 !== 0) throw new Error('Result offset must be a whole number.');
            if (n < 0) throw new Error('Result offset must be larger than or equal to 0.');
            var data = clone(this._data, false);
            data.offset = n;
            return new Query(this._collection, data);
        }
    }, {
        key: 'one',
        value: function one() {
            return this.limit(1);
        }
    }, {
        key: 'op',
        value: function op(_op, value) {
            var data = clone(this._data, false);
            data.wheres = data.wheres || [];
            data.wheres.push({ key: data.key, value: value, op: _op });
            return new Query(this._collection, data);
        }
    }, {
        key: 'populate',
        value: function populate() {
            // Do we actually have a schema for this collection
            if (!this._collection.schema) throw new Error('Cannot populate document without a defined schema for \'' + this._collection.schema + '\'.');
            var data = clone(this._data, false);

            for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
                keys[_key] = arguments[_key];
            }

            data.populate = keys;
            return new Query(this._collection, data);
        }
    }, {
        key: 'pos',
        value: function pos() {
            return this.op('>', 0);
        }
    }, {
        key: 'positive',
        value: function positive() {
            return this.pos();
        }
    }, {
        key: 'select',
        value: function select() {
            for (var _len2 = arguments.length, keys = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                keys[_key2] = arguments[_key2];
            }

            if (keys.indexOf('_id') !== -1) throw new Error('Document id is always included in the Document, no need to explicity select it.');
            if (!keys.every(function (key) {
                return typeof key === 'string';
            })) throw new Error('All select keys must be of type "string".');
            var data = clone(this._data, false);
            data.select = keys;
            return new Query(this._collection, data);
        }
    }, {
        key: 'sort',
        value: function sort() {
            var data = clone(this._data, false);

            for (var _len3 = arguments.length, keys = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                keys[_key3] = arguments[_key3];
            }

            data.sort = createSortData(keys);
            return new Query(this._collection, data);
        }
    }, {
        key: 'within',
        value: function within(min, max) {
            return this.op('>=', min).op('<=', max);
        }
    }, {
        key: 'where',
        value: function where(key) {
            var data = clone(this._data, false);
            data.action = 'where';
            data.key = key;
            return new Query(this._collection, data);
        }
    }]);
    return Query;
}();

var Collection = function () {
    function Collection(database, name, schema) {
        classCallCheck(this, Collection);

        this._database = database;
        this.name = name;
        this.schema = schema;
        this._documents = {};
        this._indexes = defineProperty({}, Collection._DEFAULT_INDEX, new Index(this, Collection._DEFAULT_INDEX));
    }

    createClass(Collection, [{
        key: 'count',
        value: function count() {
            return this.find().count();
        }
    }, {
        key: 'empty',
        value: function empty() {
            var _this = this;

            this._documents = {};
            Object.keys(this._indexes).forEach(function (key) {
                _this._indexes[key].empty();
            });
        }
    }, {
        key: 'exportJSON',
        value: function exportJSON() {
            return JSON.stringify(this.values());
        }
    }, {
        key: 'find',
        value: function find() {
            return new Query(this);
        }
    }, {
        key: 'findOne',
        value: function findOne(id) {
            // Ensure the id is a string
            if (id && typeof id !== 'string') throw new Error('The document is must be a "string", not a "' + (typeof id === 'undefined' ? 'undefined' : _typeof(id)) + '".');
            if (id) return this.find().byId(id);else return this.find().limit(1);
        }
    }, {
        key: 'get',
        value: function get$$1(id) {
            // Check the id is actually a string
            if (typeof id !== 'string') throw new Error('The document id must be a "string", not a "' + (typeof name === 'undefined' ? 'undefined' : _typeof(name)) + '".');
            // Return the object if it exists
            if (id in this._documents) return this._documents[id];
            // Else return undefined, don't throw an error
            return undefined;
        }
    }, {
        key: 'importJSON',
        value: function importJSON(json) {
            var _this2 = this;

            var overwrite = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (json === undefined) throw new Error('No json string was provided to import.');
            var o = void 0;
            try {
                o = JSON.parse(json);
            } catch (e) {
                throw new Error('Unable to parse the given json string.');
            }
            o.forEach(function (doc) {
                _this2.insert(doc, overwrite);
            });
        }
    }, {
        key: 'index',
        value: function index() {
            for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
                keys[_key] = arguments[_key];
            }

            var sortData = createSortData(keys);
            var name = keys.map(function (k) {
                return k.replace(/^\+/, '');
            }).join(',');
            this._indexes[name] = new Index(this, name, sortData);
        }
    }, {
        key: 'insert',
        value: function insert(document) {
            var _this3 = this;

            var overwrite = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            // Does the document have an _id?
            if (!document._id) throw new Error('The document to be inserted has no \'_id\'.');
            // Ensure the _id is a string
            if (typeof document._id !== 'string') throw new Error('A document must have a "string" _id, not a "' + (typeof name === 'undefined' ? 'undefined' : _typeof(name)) + '".');
            // Avoid reserved words
            Collection._RESERVED.forEach(function (word) {
                if (document._id === word) throw new Error('The document _id \'' + document._id + '\' is an internal reserved name and cannot be used.');
            });
            // Is this _id already in the collection?
            if (document._id in this._documents) {
                if (overwrite) {
                    this.remove(document);
                } else {
                    throw new Error('The document _id \'' + document._id + '\' already exists within the \'' + this.name + '\' collection.');
                }
            }
            // Add the document to the document object
            this._documents[document._id] = document;
            // Add the document to all indexes
            Object.keys(this._indexes).forEach(function (key) {
                _this3._indexes[key].insert(document);
            });
            // Return the document
            return document;
        }
    }, {
        key: 'list',
        value: function list() {
            return Object.keys(this._documents);
        }
    }, {
        key: 'remove',
        value: function remove(a) {
            var _this4 = this;

            if (!a) throw new Error('No argument provided to remove from collection.');
            if (Array.isArray(a)) {
                a.forEach(function (doc) {
                    _this4.remove(doc);
                });
            } else if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object') {
                if (!('_id' in a)) throw new Error('The provided document to remove has no \'_id\'.');
                if (typeof a._id !== 'string') throw new Error('The provided document to remove has a non-string \'_id\'.');
                // Delete from dictionary
                delete this._documents[a._id];
                // Delete from indexes
                Object.keys(this._indexes).forEach(function (key) {
                    _this4._indexes[key].remove(a);
                });
            } else if (typeof a === 'string') {
                var doc = this.get(a);
                if (doc) this.remove(doc);
            } else {
                throw new Error('Incorrect argument provided to remove, must be either "string", "Document" or "Document[]", not "' + (typeof a === 'undefined' ? 'undefined' : _typeof(a)) + '".');
            }
        }
    }, {
        key: 'upsert',
        value: function upsert(document) {
            return this.insert(document, true);
        }
    }, {
        key: 'values',
        value: function values(name) {
            if (!name) {
                if (!this._indexes || !(Collection._DEFAULT_INDEX in this._indexes)) return undefined;
                return this._indexes[Collection._DEFAULT_INDEX].values();
            }
            if (name in this._indexes) return this._indexes[name].values();
            return undefined;
        }
    }]);
    return Collection;
}();

Collection._DEFAULT_INDEX = '__default';
Collection._RESERVED = ['_DEFAULT_INDEX', '_RESERVED', 'name', 'schema', '_database', '_documents', '_indexes', 'get', 'insert', 'list', 'upsert', 'values'];
function createCollectionProxy(database, name, schema) {
    var col = new Collection(database, name, schema);
    return new Proxy(col, {
        get: function get$$1(target, name) {
            if (name in target) return target[name];
            if (typeof name === 'string' && target.list().indexOf(name) !== -1) return target.get(name);
        },
        set: function set$$1(obj, prop, val) {
            if (prop in obj) {
                obj[prop] = val;
                return true;
            }
            throw new Error('Do not dynamically set values on MinDB.Collection.');
        }
    });
}

var Database = function () {
    function Database(name, options) {
        classCallCheck(this, Database);

        this.name = name;
        this._collections = {};
        this._options = options;
    }

    createClass(Database, [{
        key: 'collection',
        value: function collection(name, schema) {
            // Check the name is actually a string
            if (typeof name !== 'string') throw new Error('The collection name must be a "string", not "' + (typeof name === 'undefined' ? 'undefined' : _typeof(name)) + '".');
            // Can't call it any of the reserved names
            Database._RESERVED.forEach(function (word) {
                if (name === word) throw new Error('Collection name \'' + name + '\' is an internal reserved name and cannot be used.');
            });
            // Is there already a database with this name?
            if (name in this._collections) throw new Error('A collection with name \'' + name + '\' already exists on database \'' + this.name + '\'.');
            // Create the collection
            var col = createCollectionProxy(this, name, schema);
            this._collections[name] = col;
            // Return the collection ref
            return col;
        }
    }, {
        key: 'exportJSON',
        value: function exportJSON() {
            var _this = this;

            var o = {
                collections: []
            };
            // For every collection
            Object.keys(this._collections).map(function (key) {
                return _this._collections[key];
            }).forEach(function (clx) {
                o.collections.push({
                    name: clx.name,
                    values: clx.values()
                });
            });
            return JSON.stringify(o);
        }
    }, {
        key: 'get',
        value: function get$$1(name) {
            // Check the name is actually a string
            if (typeof name !== 'string') throw new Error('The collection name must be a "string", "not a "' + (typeof name === 'undefined' ? 'undefined' : _typeof(name)) + '".');
            // Return the col if it exists
            if (name in this._collections) return this._collections[name];
            // Else throw an error
            throw new Error('Collection name \'' + name + '\' has not been created and does not exist on database \'' + this.name + '\'.');
        }
    }, {
        key: 'importJSON',
        value: function importJSON(json) {
            var _this2 = this;

            var overwrite = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var o = JSON.parse(json);
            o.collections.forEach(function (clxData) {
                var clx = _this2.get(clxData.name);
                clxData.values.forEach(function (doc) {
                    return clx.insert(doc, overwrite);
                });
            });
        }
    }, {
        key: 'list',
        value: function list() {
            return Object.keys(this._collections);
        }
    }]);
    return Database;
}();

Database._RESERVED = ['_RESERVED', 'name', '_collections', '_options', 'collection', 'get', 'list'];
function createDatabaseProxy(name, options) {
    var db = new Database(name, options);
    return new Proxy(db, {
        get: function get$$1(target, name) {
            if (name in target) return target[name];
            // Return collection if name is a string and found within the collections list
            if (typeof name === 'string' && target.list().indexOf(name) !== -1) return target.get(name);
        },
        set: function set$$1(obj, prop, val) {
            if (prop in obj) {
                obj[prop] = val;
                return true;
            }
            throw new Error('Do not dynamically set values on MinDB.Database.');
        }
    });
}

var MinDB = function () {
    function MinDB() {
        classCallCheck(this, MinDB);

        this.Database = Database;
        this.Collection = Collection;
        this.Index = Index;
        this.Query = Query;
        this._databases = {};
    }

    createClass(MinDB, [{
        key: 'create',
        value: function create(name) {
            // Check the name is actually a string
            if (typeof name !== 'string') throw new Error('The database name must be a "string", not "' + (typeof name === 'undefined' ? 'undefined' : _typeof(name)) + '".');
            // Can't call it any of the reserved names
            MinDB._RESERVED.forEach(function (word) {
                if (name === word) throw new Error('Database name \'' + name + '\' is an internal reserved name and cannot be used.');
            });
            // Is there already a database with this name?
            if (name in this._databases) throw new Error('A database with name \'' + name + '\' already exists.');
            // Create the database
            var db = createDatabaseProxy(name);
            this._databases[name] = db;
            // Return the database ref
            return db;
        }
    }, {
        key: 'get',
        value: function get$$1(name) {
            // Check the name is actually a string
            if (typeof name !== 'string') throw new Error('The database name must be a "string", not a "' + (typeof name === 'undefined' ? 'undefined' : _typeof(name)) + '".');
            // Return the db if it exists
            if (name in this._databases) return this._databases[name];
            // Else throw an error
            throw new Error('Database name \'' + name + '\' has not been created and does not exist.');
        }
    }, {
        key: 'list',
        value: function list() {
            return Object.keys(this._databases);
        }
    }, {
        key: 'reset',
        value: function reset(name) {
            if (name) {
                if (typeof name !== 'string') throw new Error('The database name must be a "string", not a "' + (typeof name === 'undefined' ? 'undefined' : _typeof(name)) + '".');
                if (!(name in this._databases)) throw new Error('Database name \'' + name + '\' does not exist and cannot be reset.');
                delete this._databases[name];
            } else {
                this._databases = {};
            }
        }
    }]);
    return MinDB;
}();

MinDB._RESERVED = ['Database', 'Collection', 'Query', '_RESERVED', '_databases', 'create', 'get', 'list', 'reset'];

// Export the proxied class
var main = new Proxy(new MinDB(), {
    get: function get(target, name) {
        if (name in target) return target[name];
        // Return database if name is a string and found within the database list
        if (typeof name === 'string' && target.list().indexOf(name) !== -1) return target.get(name);
    },
    set: function set(obj, prop, val) {
        if (prop in obj) {
            obj[prop] = val;
            return true;
        }
        throw new Error('Do not dynamically set values on MinDB.');
    }
});

export default main;
