# MinDB.Query.sort(...)

The MinDB.Query system allows for sorting of the query data via the `sort()` method. This method allows for sorting of the result set at execution time, but has some features that can drastically increase the speed of the data sorting and also more easily explain the sort criteria.

## Sort Order
By default, any non-prefixed property name will be sorted in __ascending__ order.

````javascript
const clx = MinDB.db.clx
// Will list all people over 21 and sort them by smallest height to largest height
clx.find().where('age').gt(21).sort('height').exec()
````

You can prefix the property name with a `+` or `-` to explicitly define the sort order.

### + (Ascending Sort)
This will simply sort in ascending order (the default), so can be omitted unless you wish to explicitly define the sort order.

````javascript
const clx = MinDB.db.clx
// Will list all people over 21 and sort them by smallest height to largest height
clx.find().where('age').gt(21).sort('+height').exec()
````

### - (Descending Sort)

````javascript
const clx = MinDB.db.clx
// Will list all people over 21 and sort them by largest height to smallest height
clx.find().where('age').gt(21).sort('-height').exec()
````

## Multiple Sort Criteria
The sort method allows for multiple sort criteria to be defined, for more fine control of the order of returned documents.

````javascript
const clx = MinDB.db.clx
// Will list all people sorted by age (from high to low), but any ties resolved by height (largest to smallest)
clx.find().sort('-age', '-height').exec()
````

## Collection Indexes
For any large collections (with many thousands of documents) that are frequently sorted, it is recomended to define an `index` on the [Collection](./Collection.md).

An index will result in near-instantenous sorts on most sensible document formats, and also can be used as the basis of a more specific sort. See the [Collection](./Collection.md) documentation for more information about the best way to define indexes.
