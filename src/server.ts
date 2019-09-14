import fastify from 'fastify'
import nanoid from 'nanoid'

import config from './config'
import logger from './logger'
import redis from './redis'
import { createHash, encrypt } from './helpers'

const app = fastify({ logger })

app.route({
  method: 'POST',
  url: '/create',
  schema: {
    body: {
      type: 'object',
      required: ['content'],
      properties: {
        content: { type: ['string', 'number', 'object'] },
        ttl: { type: 'number', maximum: config.maxTTL },
        deleteAfterOpen: { type: 'number' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          viewHash: { type: 'string' },
          adminHash: { type: 'string' },
          expireDate: { type: 'number' },
          viewed: { type: 'number' },
        },
      },
    },
  },

  handler: async (request, reply) => {
    const { content, ttl = 3600 } = request.body

    const adminHash = createHash(nanoid()).slice(0, 32)
    const viewHash = createHash(adminHash)

    const str =
      typeof content === 'object' ? JSON.stringify(content) : String(content)

    if (str.length > config.maxSize) {
      reply.code(413)
      throw Error(`'content' cannot be larger than ${config.maxSize} bytes`)
    }

    const encodedStr = encrypt(str, adminHash)

    const expireDate = Date.now() + ttl * 1000

    await redis.set(viewHash, encodedStr, 'EX', ttl)

    return {
      viewHash,
      adminHash,
      expireDate,
    }
  },
})

const main = async () => {
  const url = await app.listen({ port: config.port })
  logger.info(`Server ready at ${url.bold}`)
}

main()
