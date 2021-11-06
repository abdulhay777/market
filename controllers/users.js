const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const {JWT, JWT_TIME} = require('../config')

const Message = require('../app/message')
const Database = require('../app/database')
const validateEmail = require('../app/email')

const database = new Database()

const Users = database.model('users')

module.exports.Sign_up = async (req, res) => {

    const email = req.body.email ? req.body.email : false
    const password = req.body.password ? req.body.password : false
    const name = req.body.name ? req.body.name : false

    if (!email) {
        return res.status(404).json(Message.email_empty)
    }

    if (!password) {
        return res.status(404).json(Message.password_empty)
    }

    if (!name) {
        return res.status(404).json(Message.name_empty)
    }

    if (!validateEmail(email)) {
        return res.status(400).json(Message.email_valid)
    }

    const isEmail = await Users.findOne({user_email: email}, {user_email: 1}).lean()

    if (isEmail) {
        return res.status(409).json(Message.is_email)
    } else {

        const salt = bcryptjs.genSaltSync(10)

        const users = new Users({
            user_email: email,
            user_password: bcryptjs.hashSync(password, salt),
            user_name: name,
        })

        try {

            await users.save()

            const token = jwt.sign({
                email: users.user_email,
                id: users._id
            }, JWT, {expiresIn: JWT_TIME})

            res.cookie('token', token)

            res.status(201).json({
                user: users,
                token: `Bearer ${token}`
            })

        } catch (error) {
            return res.status(500).json(Message.error)
        }

    }

}

module.exports.Sign_in = async (req, res) => {
    
    const email = req.body.email ? req.body.email : false
    const password = req.body.password ? req.body.password : false

    if (!email) {
        return res.status(404).json(Message.email_empty)
    }

    if (!password) {
        return res.status(404).json(Message.password_empty)
    }

    if (!validateEmail(email)) {
        return res.status(400).json(Message.email_valid)
    }

    const users = await Users.findOne({user_email: email}).lean()

    if (!users) {
        return res.status(404).json(Message.is_email)
    }

    const passwordResult = bcryptjs.compareSync(password, users.user_password)

    if (passwordResult) {

        const token = jwt.sign({
            email: users.user_email,
            id: users._id
        }, JWT, {expiresIn: JWT_TIME})

        res.cookie('token', token)

        res.status(201).json({
            user: users,
            token: `Bearer ${token}`
        })

    } else {
        return res.status(401).json(Message.password_incorrect)
    }
}