const SOCKET_URL = [
    'http://localhost:8081',
    'http://localhost:8080',
]

module.exports = {
    PORT: process.env.PORT || 8001,
    JWT: '007700',
    JWT_TIME: (60 * 60) * 24,
    corsOptions: {
        origin: function (origin, callback) {
            if (SOCKET_URL.indexOf(origin) !== -1) {
                callback(null, true)
            } else {
                callback(null, false)
            }
        },
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
        optionsSucccessStatus: 200,
        credentials: true,
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'device-remember-token',
            'Access-Control-Allow-Origin',
            'Origin',
            'Accept',
        ],
    }
}