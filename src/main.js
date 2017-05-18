// const faker = require('faker')

const MinDB = require('./mindb')

MinDB.create('test')

const cool = MinDB.test.collection('cool')

cool.insert({ _id: 'brad', data: 123, o: [3, 2, 1] })
cool.insert({ _id: 'david', data: 193, o: [1, 2, 3] })
cool.insert({ _id: 'kevin', data: 33, o: [3, 2, 1] })
cool.insert({ _id: 'bob', data: 44, o: [4, 1, 5] })
cool.insert({ _id: 'ke', data: 44, o: [4, 3] })

console.log(cool.find().filter(d => d.data).sort('-o', '+data').populate().exec())
