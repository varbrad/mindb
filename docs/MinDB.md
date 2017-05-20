# MinDB

MinDB contains methods for creating/accesing Databases.

## Database Creation

````javascript
const db = MinDB.create('myCoolDb')
````

There are some reserved names that you can not call a database, these can be found here.

__Note:__ It is possible to create a Database through the available `MinDB.Database` class, however this is not recommended as MinDB will not cache the instance and will not be able to proxy the database. Only use the Database class if you know what you are doing.

## Retrieving Instances
You can retrieve the Database after having been created through using the `.get()` function, or by making use of the proxy access provided through the MinDB class.

````javascript
const dbGet = MinDB.get('myCoolDb')
const dbPxy = MinDB.myCoolDb

dbGet === dbPxy // true
````

## Listing Instances
You can retrieve a list of all defined databases (as their names) via `list()`.

````javascript
MinDB.create('db1')
MinDB.create('db2')
MinDB.create('db3')

MinDB.list() // [ 'db1', 'db2', 'db3' ]
````

## Global Reset
This can be used to globally reset all attached MinDB.Database instances, and wipe all attached Collections. There is little use for this in practice, but is provided for testing purposes.

````javascript
MinDB.create('hello')
MinDB.hello // A Database instance
MinDB.reset()
MinDB.hello // undefined
````
