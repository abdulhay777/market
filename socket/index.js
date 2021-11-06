const Database = require('../app/database')
const database = new Database()

const Markets = database.model('markets')
const Users = database.model('users')
const Products = database.model('products')

module.exports = function (socket, io) {

    socket.on('IN_MarketAdd', async function (data) {

        const user_id = socket.decoded_token.id
        const name = data

        if (!name) {
            io.to(socket.id).emit('IN_Message', 'Name empty')
            return
        }

        const market = new Markets({
            market_name: name
        })

        market.market_users.push(user_id)

        await market.save()

        io.to(socket.id).emit('OUT_MarketAdd', market)

    })

    socket.on('IN_MarketDelete', async function (data) {
        const market = await Markets.findOne({_id: data}).lean()
        const pro = await Products.deleteMany({market_id: data})
        const del = await Markets.deleteOne({_id: data})
        if (del) {
            for await (let user of market.market_users) {
                const users = await Users.findOne({_id: user}).lean()
                io.to(users.user_email).emit('OUT_MarketDelete', data)
            }
        }
    })

    socket.on('IN_ProductAdd', async function (data) {

        const name = data.name
        const price = data.price
        const count = data.count
        const market_id = data.market_id

        if (!name) {
            io.to(socket.id).emit('IN_Message', 'Name empty')
            return
        }

        if (!price) {
            io.to(socket.id).emit('IN_Message', 'Price empty')
            return
        }

        if (!count) {
            io.to(socket.id).emit('IN_Message', 'Count empty')
            return
        }

        const product = new Products({
            product_name: name,
            product_count: count,
            product_price: price,
            market_id: market_id
        })

        await product.save()

        const market = await Markets.findOne({_id: market_id}).lean()

        for await (let user of market.market_users) {
            const users = await Users.findOne({_id: user}).lean()
            io.to(users.user_email).emit('OUT_ProductAdd', product)
        }

    })


    socket.on('IN_ProductRemove', async function (data) {

        const id = data

        const product = await Products.findOne({_id: id}).lean()
        const market = await Markets.findOne({_id: product.market_id}).lean()
        const deleteProduct = await Products.deleteOne({_id: id})

        if (deleteProduct) {
            for await (let user of market.market_users) {
                const users = await Users.findOne({_id: user}).lean()
                io.to(users.user_email).emit('OUT_ProductRemove', id)
            }
        }

    })

    socket.on('IN_AddUser', async function (data) {

        const email = data.email
        const market_id = data.market_id

        const user = await Users.findOne({user_email: email}).lean()

        if (user) {
            const market = await Markets.findOne({_id: market_id})
            market.market_users.forEach((e) => {
                if (e != user._id) {
                    market.market_users.push(user._id)
                } else {
                    io.to(socket.id).emit('IN_Message', 'user')
                }
            })
            await market.save()
            io.to(email).emit('OUT_MarketAdd', market)
        } else {
            io.to(socket.id).emit('IN_Message', 'No user')
            return
        }

    })

    socket.on('IN_Buy', async function (data) {

        const user_id = data.user_id
        const product_id = data.product_id
        const count = data.count

        const user = await Users.findOne({_id: user_id}).lean()
        const product = await Products.findOne({_id: product_id})
        const market = await Markets.findOne({_id: product.market_id}).lean()

        product.product_count = product.product_count - count
        product.history.push({
            name: user.user_name,
            count: count,
            price: product.product_price,
            total_price: count * product.product_price,
        })

        await product.save()

        for await (let user of market.market_users) {
            const users = await Users.findOne({_id: user}).lean()
            io.to(users.user_email).emit('OUT_ProductEdit', product)
        }

    })

    socket.on('IN_ProductEdit', async function (data) {
        const product_id = data.product_id
        const price = data.price
        const count = data.count
        const name = data.name

        const products = await Products.updateOne(
            {_id: product_id},
            {
                product_name: name,
                product_count: count,
                product_price: price
            }
        )

        const product = await Products.findOne({_id: product_id}).lean()
        const market = await Markets.findOne({_id: product.market_id})

        for await (let user of market.market_users) {
            const users = await Users.findOne({_id: user}).lean()
            io.to(users.user_email).emit('OUT_ProductEdit', product)
        }

    })

    socket.on('IN_History', async function (data) {

        const product = await Products.findOne({_id: data}).lean()
        // const market = await Markets.findOne({_id: product.market_id}).lean()

        if (product.history.length > 0) {
            io.to(socket.id).emit('OUT_History', product.history)
        }

    })

}