const fs = require('fs')
const mongoose = require('mongoose')

module.exports = class Database {

    connect (db_connect_url, cb) {

        mongoose.connect(db_connect_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        const db = mongoose.connection

        db.on('error', console.error.bind(console, 'connection error:'))

        db.once('open', cb)

    }

    model (model) {
        fs.stat(`./models/${model}.js`, function(err) {
            if (err) return console.log(err)
        })
        return require(`../models/${model}`)
    }

    drop (model) {
        mongoose.connection.db.dropCollection(model, function(err, result) {
            if (err) return console.log(err)
            return result
        })
    }

}