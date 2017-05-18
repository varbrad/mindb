// const faker = require('faker')

const MinDB = require('./mindb')

MinDB.create('test')

const cool = MinDB.test.collection('cool')

cool.insert({ _id: 'brad', data: 123 })
cool.insert({ _id: 'david', data: 193 })
cool.insert({ _id: 'kevin', data: 53 })
cool.insert({ _id: 'bob', data: 133 })

console.log(cool.find().exec())
