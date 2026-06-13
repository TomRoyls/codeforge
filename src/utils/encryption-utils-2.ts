import * as crypto from 'crypto'

export class EncryptionUtils2 {
  private algorithm = 'aes-256-cbc'
  private key: Buffer
  private ivLength = 16

  constructor(key: string | Buffer) {
    this.key = typeof key === 'string' ? crypto.scryptSync(key, 'salt', 32) : key
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength)
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  }

  decrypt(encrypted: string): string {
    const [ivHex, data] = encrypted.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv)
    let decrypted = decipher.update(data, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  encryptBuffer(buffer: Buffer): Buffer {
    const iv = crypto.randomBytes(this.ivLength)
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
    return Buffer.concat([iv, encrypted])
  }

  decryptBuffer(encrypted: Buffer): Buffer {
    const iv = encrypted.slice(0, this.ivLength)
    const data = encrypted.slice(this.ivLength)
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv)
    return Buffer.concat([decipher.update(data), decipher.final()])
  }

  setAlgorithm(algo: string): this {
    this.algorithm = algo
    return this
  }

  getAlgorithm(): string {
    return this.algorithm
  }

  randomBytes(length: number): Buffer {
    return crypto.randomBytes(length)
  }

  randomString(length: number): string {
    return crypto.randomBytes(length).toString('hex').slice(0, length)
  }

  uuid(): string {
    return crypto.randomUUID()
  }

  timingSafeEqual(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  }

  toArray(): string[] { return [this.algorithm] }
  toString(): string { return JSON.stringify({ algorithm: this.algorithm }) }
  toJSON(): Record<string, unknown> { return { algorithm: this.algorithm, ivLength: this.ivLength } }
  clone(): EncryptionUtils2 { return new EncryptionUtils2(this.key) }
  equals(other: unknown): boolean {
    if (!(other instanceof EncryptionUtils2)) return false
    return this.algorithm === other.algorithm
  }
  clear(): void { this.algorithm = 'aes-256-cbc' }
}
