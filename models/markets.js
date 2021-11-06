const {Schema, model} = require('mongoose')

const schema = new Schema({
    market_name: {
        type: String,
        required: true
    },
    market_users: [{
        ref: 'users',
        type: Schema.Types.ObjectId
    }]
})

module.exports = model('markets', schema)