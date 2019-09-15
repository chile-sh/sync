import dotenv from 'dotenv'
dotenv.config()

const {
  PORT = 4000,
  REDIS_PREFIX = 'sync',
  REDIS_HOST = 'localhost',
  REDIS_PASS = 'redis',
  REDIS_DB = 0,
  MAX_MSG_SIZE = 100000,
  MAX_MSG_TTL = 3600 * 24,
} = process.env

export default {
  redis: {
    host: REDIS_HOST,
    pass: REDIS_PASS,
    prefix: REDIS_PREFIX,
    db: Number(REDIS_DB),
  },
  maxSize: Number(MAX_MSG_SIZE),
  maxTTL: Number(MAX_MSG_TTL),
  port: Number(PORT),
}
