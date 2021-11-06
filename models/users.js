const {Schema, model} = require('mongoose')

const schema = new Schema({
    user_name: {
        type: String,
        required: true
    },
    user_email: {
        type: String,
        required: true
    },
    user_password: {
        type: String,
        required: true
    }
})

module.exports = model('users', schema)