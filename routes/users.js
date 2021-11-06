const {Router} = require('express')
const {Sign_up, Sign_in} = require('../controllers/users')

const router = Router()

router.post('/sign-in', Sign_in)

router.post('/sign-up', Sign_up)

module.exports = router