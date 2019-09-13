import Redis from 'ioredis'
import config from './config'

const { prefix, db } = config.redis

const client = new Redis({
  host: config.redis.host,
  password: config.redis.pass,
  db,
  keyPrefix: prefix ? `${prefix}:` : undefined,
})

export default client
