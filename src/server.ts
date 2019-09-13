import fastify from 'fastify'
import config from './config'
import logger from './logger'

const app = fastify({ logger })

app.get('/', async () => {
  return { success: true }
})

const main = async () => {
  const url = await app.listen({ port: config.port })
  logger.info(`Server ready at ${url.bold}`)
}

main()
