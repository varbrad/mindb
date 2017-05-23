# MinDB.Query

A Query is an immutable object that can be used to retrieve documents from the collection. They allow for powerful access of data within collections.

__All code snippets in this section assume a collection named `clx` exists within a database named `db` and has some data in it.__

__Note:__ Query objects are immutable and hold their own state. For example;

````javascript
const clx = MinDB.db.clx

const query = clx.find().where('name').eq('fred')
query.where('age').gt(30)

query.exec() // Will NOT include the WHERE AGE > 30 clause
query = query.where('age').gt(30)
query.exec() // Will include the clause as query object has been assigned
````

## Get All Documents
__Note:__ The `clx.values()` method is faster than using a Query object if no further functionality is required (see here).

````javascript
const clx = MinDB.db.clx
clx.find().exec() // Returns a list of all documents within the collection
````

## Sorting
See the dedicated [Sorting documentation](./Sorting.md).

## Where
The `where()` method allows for powerful filtering of contents based upon various conditions.

````javascript
const clx = MinDB.db.clx
clx.find().where('age').gt(18).exec() // Returns docs where age > 18
````

The `where()` method must define a property to 'query' (`age` in the above query). These properties can be nested properties. See the Nested Properties section for more information about nested properties.

````javascript
const clx = MinDB.db.clx
clx.find().where('city.name').eq('London').exec() // Returns docs where the city.name is 18
````

The `where()` method is useless without using it's associated condition functions.

### `eq(val), is(val)`
Requires that the property value is exactly equal (===) to the given value.

### `gt(val)`
Requires that the property value is greater than (>) the given value.

### `gte(val)`
Requires that the property value is greater than or equal (>=) to the given value.

### `lt(val)`
Requires that the property value is less than (>) the given value.

### `lte(val)`
Requires that the property value is less than or equal (>=) to the given value.

### `ne(val), not(val)`
Requires that the property value is not equal (!==) to the given value.

### `neg(), negative()`
Requires that the property value is negative (< 0).

### `pos(), positive()`
Requires that the property value is positive (> 0).

### `within(min, max)`
Requires that the property value is within the min->max bound (inclusive).

## Result Count
If you only want to know the number of matching documents based upon a query, you can invoke the `count()` method to return the matching document total rather than the documents themselves. If all you want to query is the result set length, this is faster than executing the query and then getting the length of the results.

````javascript
const ctx = MinDB.db.ctx
const total = ctx.find().where('age').lt(40).count().exec() // Will be a number
````

Alternatively, the [Collection](./Collection.md) itself exposes the `count()` method which works much the same way.

````javascript
const ctx = MinDB.db.ctx
const total = ctx.count().where('age').lt('40').exec() // Will be a number
````

## Limiting Results
It is possible to limit the maximum total number of results that are returned via `limit()`.

````javascript
const ctx = MinDB.db.ctx
ctx.find().where('city').is('London').limit(5).exec() // Will only return 0 <= n <= 5 results.
````

__Note:__ If the limit is set to just one (via `limit(1)`, `.one()` or the collection `.findOne()`) then a single document (or `undefined` if no matches) will be returned, rather than an array of documents.

## Offsetting Results
It is also possible to offset the result set via `offset()`. When used with `limit()`, this can provide good pagination capabilities.

````javascript
const page = 2
const resultsPerPage = 10
const ctx = MinDB.db.ctx
ctx.find().offset((page - 1) * resultsPerPage).limit(resultsPerPage).exec()
````

## Select
It may only be desriable to return an object with particular properties of the original document. This can be achieved via the `select()` method.

__Note:__ You do not need to `select` the '_id' property, this is always included in any returned results.

````javascript
const ctx = MinDB.db.ctx
ctx.insert({ _id: 'bob', name: 'Bob', age: 30, gender: 'M', height: 177 })
ctx.findOne('bob').select('name').exec() // { _id: 'bob', name: 'Bob' }
````

````javascript
const ctx = MinDB.db.ctx
ctx.insert({ _id: 'alice', name: 'Alice', age: 22, gender: 'F', height: 165 })
ctx.find().select('name', 'height').exec() // [ { _id: 'alice', name: 'Alice', height: 165 } ]
````

# Examples
````javascript
// Get documents where age is between 18 and 50 (inclusive)
const ctx = MinDB.db.ctx
const results = ctx.find().where('age').within(18, 50).exec()
````

````javascript
// Get documents where age is greater than 22, and sort in descending age order
const ctx = MinDB.db.ctx
const results = ctx.find().where('age').gt(22).sort('-age').exec()
````

````javascript
// Get documents where city.name is London and salary is larger than £50,000.
const ctx = MinDB.db.ctx
const results = ctx.find().where('city.name').is('London').where('salary').gt(50000).exec()
````
