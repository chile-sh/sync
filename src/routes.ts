import { FastifyInstance } from 'fastify'
import nanoid from 'nanoid'

import config from './config'
import redis from './lib/redis'
import { encrypt, createHash, decrypt } from './lib/helpers'

export default (app: FastifyInstance) => {
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

      const adminHash = createHash(nanoid())
      const viewHash = createHash(adminHash)

      const str =
        typeof content === 'object' ? JSON.stringify(content) : String(content)

      if (str.length > config.maxSize) {
        reply.code(413)
        throw Error(`'content' cannot be larger than ${config.maxSize} bytes`)
      }

      const encodedStr = encrypt(str, viewHash)
      const expireDate = Date.now() + ttl * 1000

      await redis.set(
        createHash(viewHash),
        JSON.stringify({
          type: typeof content,
          content: encodedStr,
          viewed: 0,
          expireDate,
        }),
        'EX',
        ttl
      )

      return {
        viewHash,
        adminHash,
        expireDate,
      }
    },
  })

  app.route({
    method: 'GET',
    url: '/n/:viewHash',
    schema: {
      params: {
        type: 'object',
        required: ['viewHash'],
        properties: {
          viewHash: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          raw: { type: 'number' },
        },
      },
    },

    handler: async (request, reply) => {
      const { viewHash } = request.params
      const { raw } = request.query

      const str = await redis.get(createHash(viewHash))
      if (!str) {
        reply.code(404)
        throw Error('Record not found')
      }

      const parsed = JSON.parse(str)
      const isObj = parsed.type === 'object'
      const isNum = parsed.type === 'number'

      let payload: any = decrypt(parsed.content, viewHash)

      if (raw && isObj) return JSON.parse(payload)
      if (raw) return payload

      if (isObj) payload = JSON.parse(payload)
      if (isNum) payload = Number(payload)

      return {
        viewed: parsed.viewed,
        expireDate: parsed.expireDate,
        payload,
      }
    },
  })
}
