const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const cors = require('cors')
const socketioJwt = require('socketio-jwt')
const mongoose = require('mongoose')

const TokenParse = require('./app/token_parse')
const Database = require('./app/database')
const { PORT, corsOptions, JWT } = require('./config')

const app = express()
const database = new Database()

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: corsOptions,
    allowEIO3: true
})

const Markets = database.model('markets')
const Users = database.model('users')
const Products = database.model('products')
// mongodb+srv://bruce:HX!HetN67jV@cluster0.zcm24.mongodb.net/market
// mongodb://localhost:27017/project
database.connect('mongodb+srv://bruce:HX!HetN67jV@cluster0.zcm24.mongodb.net/onedb', function () {

    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
    app.use(passport.initialize())
    app.use(cors(corsOptions))
    app.use('/public', express.static('views'))
    app.set('view engine', 'ejs')

    app.get('/login', (req, res) => {
        // if (!req.headers.cookie) {
        //     res.redirect('/')
        //     return
        // }
        res.render('login')
    })

    app.get('/register', (req, res) => {
        // if (!req.headers.cookie) {
        //     res.redirect('/')
        //     return
        // }
        res.render('register')
    })

    app.get('/', async (req, res) => {

        if (!req.headers.cookie) {
            res.redirect('/login')
            return
        }

        const token = TokenParse(req.headers.cookie)

        const user = await Users.findOne({_id: token.id}, {_id: 1}).lean()
        // const user = '';
        if (!user) {
            res.redirect('/login')
            return
        }

        const market = await Markets.find({market_users: {$eq: token.id}}).lean()
        res.render('index', {market: market, product: ''})
    })

    app.get('/market/:id', async (req, res) => {

        if (!req.headers.cookie) {
            res.redirect('/login')
            return
        }

        const token = TokenParse(req.headers.cookie)

        const user = await Users.findOne({_id: token.id}, {_id: 1}).lean()

        if (!user) {
            res.redirect('/login')
            return
        }

        const market = await Markets.find({market_users: {$eq: token.id}}).lean()
        const product = await Products.find({market_id: req.params.id}).lean()
        
        var isValid = mongoose.Types.ObjectId.isValid(req.params.id);
        if (isValid) {
            res.render('market', {market: market, product: product})
        } else {
            res.redirect('/')
        }
    })

    app.get('/logout', (req, res) => {
        res.clearCookie("token")
        // res.send('')
        res.redirect('/')
    })

    require('./middleware/passport')(passport)

    app.use('/api/users', require('./routes/users'))

    io.use(socketioJwt.authorize({secret: JWT, handshake: true}))

    io.on('connection', (socket) => {
        socket.join(socket.decoded_token.email)
        require('./socket/index')(socket, io)
    })

    server.listen(PORT, () => {
        console.log(`Start server: ${PORT}`)
    })

})