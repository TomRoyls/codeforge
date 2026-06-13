import * as crypto from 'crypto'

export class HashUtils2 {
  private algorithm = 'sha256'
  private encoding: 'hex' | 'base64' = 'hex'

  setAlgorithm(algo: string): this {
    this.algorithm = algo
    return this
  }

  getAlgorithm(): string {
    return this.algorithm
  }

  setEncoding(enc: 'hex' | 'base64'): this {
    this.encoding = enc
    return this
  }

  hash(text: string): string {
    return crypto.createHash(this.algorithm).update(text).digest(this.encoding)
  }

  hashBuffer(buffer: Buffer): string {
    return crypto.createHash(this.algorithm).update(buffer).digest(this.encoding)
  }

  hashFile(content: string): string {
    return this.hash(content)
  }

  hmac(text: string, key: string | Buffer): string {
    return crypto.createHmac(this.algorithm, key).update(text).digest(this.encoding)
  }

  hmacBuffer(buffer: Buffer, key: string | Buffer): string {
    return crypto.createHmac(this.algorithm, key).update(buffer).digest(this.encoding)
  }

  verifyHash(text: string, expectedHash: string): boolean {
    return this.hash(text) === expectedHash
  }

  verifyHmac(text: string, key: string | Buffer, expectedHmac: string): boolean {
    return this.hmac(text, key) === expectedHmac
  }

  pbkdf2(password: string, salt: string, iterations = 100000, keyLength = 32): string {
    return crypto.pbkdf2Sync(password, salt, iterations, keyLength, this.algorithm).toString(this.encoding)
  }

  verifyPbkdf2(password: string, salt: string, expected: string, iterations = 100000, keyLength = 32): boolean {
    return this.pbkdf2(password, salt, iterations, keyLength) === expected
  }

  bcryptLikeHash(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 32).toString(this.encoding)
  }

  verifyBcryptLike(password: string, salt: string, expected: string): boolean {
    return this.bcryptLikeHash(password, salt) === expected
  }

  checksum(data: unknown): string {
    const text = typeof data === 'string' ? data : JSON.stringify(data)
    return this.hash(text)
  }

  shortHash(text: string, length = 8): string {
    return this.hash(text).substring(0, length)
  }

  generateSalt(length = 16): string {
    return crypto.randomBytes(length).toString(this.encoding)
  }

  toArray(): string[] { return [this.algorithm, this.encoding] }
  toString(): string { return JSON.stringify({ algorithm: this.algorithm, encoding: this.encoding }) }
  toJSON(): Record<string, unknown> { return { algorithm: this.algorithm, encoding: this.encoding } }
  clone(): HashUtils2 {
    const h = new HashUtils2()
    h.algorithm = this.algorithm
    h.encoding = this.encoding
    return h
  }
  equals(other: unknown): boolean {
    if (!(other instanceof HashUtils2)) return false
    return this.algorithm === other.algorithm
  }
  clear(): void {
    this.algorithm = 'sha256'
    this.encoding = 'hex'
  }
}
