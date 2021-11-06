const {Schema, model} = require('mongoose')

const schema = new Schema({
    product_name: {
        type: String,
        required: true
    },
    product_count: {
        type: String,
        required: true
    },
    product_price: {
        type: String,
        required: true
    },
    market_id: {
        type: String
    },
    history: [
        {
            name: {
                type: String
            },
            count: {
                type: String
            },
            price: {
                type: String
            },
            total_price: {
                type: String
            },
            date: {
                type: String,
                default: Date.now
            }
        }
    ]
})

module.exports = model('products', schema)