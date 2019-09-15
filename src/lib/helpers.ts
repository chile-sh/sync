import crypto from 'crypto'

const IV_LENGTH = 16

// key must be 256 bits (32 characters)
export const encrypt = (text: string, key: string) => {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
  let encrypted = cipher.update(text)

  encrypted = Buffer.concat([encrypted, cipher.final()])

  return `${iv.toString('base64')}:${encrypted.toString('base64')}`
}

export const decrypt = (text: string, key: string) => {
  const textParts = text.split(':')
  const iv = Buffer.from(textParts.shift(), 'base64')
  const encryptedText = Buffer.from(textParts.join(':'), 'base64')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv)
  let decrypted = decipher.update(encryptedText)

  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}

export const createHash = (str: string, length = 32, digest?) =>
  crypto
    .createHash('sha256')
    .update(str)
    .digest(digest || 'hex')
    .slice(0, length)
