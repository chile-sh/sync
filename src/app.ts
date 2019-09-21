import fastify from 'fastify'
import WebSocket from 'ws'

import config from './config'
import logger from './lib/logger'

import wss from './wss'
import routes from './routes'

const app = fastify({ logger })

wss(new WebSocket.Server({ server: app.server }))
routes(app)

app.listen({ port: config.port }).then(url => {
  logger.info(`Server ready at ${url}`)
})
