import http from 'http'
import App from './app'

const port = process.env.PORT

App.set('port', port)

const server = http.createServer(App)
server.listen(port, () => {
    const addr = server.address()
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port ?? '?'}`

    console.info('Listening on: ', bind)
})

module.exports = App
