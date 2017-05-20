# MinDB.Collection

A Collection is a container of Documents and a schema (optional).

## Insert
Used to insert data into the Collection. Documents __must__ have a defined `_id` in order to be added (an error will be thrown if they do not have one). An `_id` __must__ be a string, and cannot be a MinDB internally reserved word (listed here).

By default, the `_id` must also be unique to this collection, but it is possible to override this (shown below).

````javascript
MinDB.create('cool').collection('hi')

MinDB.cool.hi.insert({ _id: 'bob', data: 123 })
````

If an `_id` already exists within a collection, an Error is thrown.

````javascript
MinDB.create('cool').collection('hi')

MinDB.cool.hi.insert({ _id: 'pete', name: 'Pete McPeterson' })
MinDB.cool.hi.insert({ _id: 'pete', name: 'McPete Peterson' }) // An error will be thrown
````

It is possible to insert in _overwrite_ mode whereby the original data object will be overwritten.

````javascript
MinDB.create('cool').collection('hi')

MinDB.cool.hi.insert({ _id: 'pete', name: 'Pete McPeterson' })
MinDB.cool.hi.insert({ _id: 'pete', name: 'McPete Peterson' }, true) // True flag to overwrite

// Pete McPeterson no longer exists :(
````

### Multiple Insert
__Not yet implemented__

## Upsert
An alias for `insert(_, true)`. Inserts the document in overwrite mode, either inserting it (if the `_id` does not exist), or overwriting the previous object (if the `_id` does exist).

````javascript
MinDB.create('cool').collection('hi')

MinDB.cool.hi.upsert({ _id: 'pete', name: 'Pete McPeterson' })
MinDB.cool.hi.upsert({ _id: 'pete', name: 'McPete Peterson' })

MinDB.cool.hi.pete // { _id: 'pete', name: 'McPete Peterson' }
````

## Retrieval (Known ID)
To retreive an object that you know the `_id` of, you can use `get()` or the collection proxy.

````javascript
MinDB.create('test').collection('wubwub')

MinDB.test.wubwub.insert({ _id: 'bob' })

const doc1 = MinDB.test.wubwub.get('bob')
const doc2 = MinDB.test.wubwub.bob

doc1 === doc2 // true
````

### `get()` vs Proxy
The `get()` function is more strict with it's usage. It will throw an error if the given `_id` is not a string or is empty. Both methods will return `undefined` if the given `_id` could not be found within the collection.

## Retrieval (Query)
MinDB features a powerful query system (via `find()` or `findOne()`) that allows you to query the collection for data.

````javascript
MinDB.create('a').collection('b')

for (let i = 0; i < 10; ++i) {
  MinDB.a.b.insert({ _id: 'id' + i, value: i })
}

const result = MinDB.a.b.find().where('value').gte(8).sort('-value').exec()
// [ { _id: 'id9', value: 9 }, { _id: 'id8', value: 8 } ]
````

The query system and what it can do is explained in much more detail here.

## Remove
Allows for data to be deleted from the collection.

### By ID
Can remove a single document given a document `_id`. This will do nothing if the `_id` was not found on the collection.

````javascript
const c = MinDB.create('a').collection('b')

c.insert({ _id: 'dave' })
c.remove('dave') // c will now be empty again
````

### By Document
Can remove a document by giving the entire document itself, usually as a result of caching an object or as a result from a query.

````javascript
const c = MinDB.create('a').collection('b')

const doc = c.insert({ _id: 'dave' })
c.remove(doc) // c will now be empty again
````

__TODO:__ Removal by document should ensure that the document signature is the same. This avoids being able to delete documents with the same ID but different contents (if the object has been changed). You __must__ have the up-to-date document signature for deletion to occur.

### By Documents
Can remove many documents by giving multiple documents (as an Array), usually as a result of caching multiple objects or as a result from a query.

````javascript
const c = MinDB.create('a').collection('b')

c.insert({ _id: 'bob' })
c.insert({ _id: 'fred' })
c.insert({ _id: 'dave' })

const docs = c.find().where('_id').not('bob').exec()
c.remove(docs) // c = [ { _id: 'bob' } ]
````


## Document ID's
A list of all document `_id`'s can be accessed through the `list()` method.

````javascript
const c = MinDB.create('a').collection('b')

c.insert({ _id: 'bob' })
c.insert({ _id: 'baz' })

c.list() // [ 'bob', 'baz' ]
````

## Document Contents
Returns a list of all document objects as an array. Faster than executing an unsorted `col.find().exec()` query. The order of the documents within the array is not guaranteed.

````javascript
const c = MinDB.create('a').collection('b')

c.insert({ _id: 'bob' })
c.insert({ _id: 'baz' })

c.values() // [ { _id: 'bob' }, { _id: 'baz' } ]
````
