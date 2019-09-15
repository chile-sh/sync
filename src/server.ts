import fastify from 'fastify'

import config from './config'
import logger from './lib/logger'
import routes from './routes'

const app = fastify({ logger })

routes(app)

const main = async () => {
  const url = await app.listen({ port: config.port })
  logger.info(`Server ready at ${url.bold}`)
}

main()
