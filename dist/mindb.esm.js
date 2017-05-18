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

var Database = function Database(name) {
    classCallCheck(this, Database);
};

function createDatabaseProxy(name) {
    var db = new Database(name);
    return new Proxy(db, {
        get: function get$$1(target, name) {
            if (name in target) return target[name];
            if (name in target._collections) return target._collections[name];
        }
    });
}

var MinDB = function () {
    function MinDB() {
        classCallCheck(this, MinDB);
    }

    createClass(MinDB, null, [{
        key: 'create',
        value: function create(name) {
            // Is there already a database with this name?
            if (name in this._databases) throw new Error('A database with name \'' + name + '\' already exists.');
            // Can't call it "_databases" because of reasons
            if (name === '_databases') throw new Error('Database name \'_databases\' is an internal reserved name and cannot be used.');
            // Create the database
            var db = createDatabaseProxy(name);
            this._databases[name] = db;
            return db;
        }
    }]);
    return MinDB;
}();

export default MinDB;
