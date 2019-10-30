import { FastifyInstance } from 'fastify'

import config from './config'
import { create, get, pair, initPair, remove } from './controller'

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
            viewUrl: { type: 'string' },
            expireDate: { type: 'number' },
            pairCode: { type: 'string' },
            viewed: { type: 'number' },
          },
        },
      },
    },

    handler: create,
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

    handler: get,
  })

  app.route({
    method: 'GET',
    url: '/pair/:code',
    schema: {
      params: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string' },
        },
      },
    },

    handler: pair,
  })

  app.route({
    method: 'POST',
    url: '/pair/:adminHash',
    schema: {
      params: {
        type: 'object',
        required: ['adminHash'],
        properties: {
          adminHash: { type: 'string' },
        },
      },
    },

    handler: initPair,
  })

  app.route({
    method: 'DELETE',
    url: '/n/:adminHash',
    schema: {
      params: {
        type: 'object',
        required: ['adminHash'],
        properties: {
          adminHash: { type: 'string' },
        },
      },
    },

    handler: remove,
  })
}
