const {
  PORT = 4000,
  REDIS_PREFIX = 'sync',
  REDIS_HOST = 'localhost',
  REDIS_PASS = 'redis',
  REDIS_DB = 0,
} = process.env

export default {
  redis: {
    host: REDIS_HOST,
    pass: REDIS_PASS,
    prefix: REDIS_PREFIX,
    db: Number(REDIS_DB),
  },
  port: Number(PORT),
}
