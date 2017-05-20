# MinDB.Database

A Database is a container of Collections and optional configuration settings.

## Create a Collection

A collection can be defined 'vanilla', or can have a Schema defined upon it.

### Vanilla - Plain Collection
````javascript
const db = MinDB.create('foobar')
db.collection('baz')
````

### Schema-Defined Collection
````javascript
const db = MinDB.create('bazfoo')
db.collection('wub', schemaObject)
````

Plain collections will have no constraints upon the data that is inserted into the collection, but do not allow for certain features such as population, and also means that potentially unsafe operations such as nested sorting are never checked and may result in query errors.

## Retrieving Instances
After a collection has been created on a database, it can be accessed either through the database's `get()` method, or just via the database proxy.

````javascript
MinDB.create('cooldb').collection('awesome')
const c1 = MinDB.cooldb.awesome
const c2 = MinDB.get('cooldb').get('awesome')
const c3 = MinDB.get('cooldb').awesome
const c4 = MinDB.cooldb.get('awesome')

// c1, c2, c3 and c4 are all equivalent and refer to the same object
````

## Listing Instances
A database can list all of it's defined collections (as their names).

````javascript
const db = MinDB.create('cooldb')
db.collection('col1')
db.collection('col2')
db.collection('col3')

db.list() // [ 'col1', 'col2', 'col3' ]
````
