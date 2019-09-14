import crypto from 'crypto'

const IV_LENGTH = 16

export const encrypt = (text: string, key: string) => {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
  let encrypted = cipher.update(text)

  encrypted = Buffer.concat([encrypted, cipher.final()])

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

export const decrypt = (text: string, key: string) => {
  const textParts = text.split(':')
  const iv = Buffer.from(textParts.shift(), 'hex')
  const encryptedText = Buffer.from(textParts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv)
  let decrypted = decipher.update(encryptedText)

  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}

export const createHash = (str: string, digest?) =>
  crypto
    .createHash('sha256')
    .update(str)
    .digest(digest || 'hex')
