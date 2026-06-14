export interface Credential2 {
  id: string
  type: string
  name: string
  value: string
  expiresAt: number | null
  metadata: Record<string, string>
  createdAt: number
  lastRotated: number | null
  rotationCount: number
}

export class CredentialVault2 {
  private credentials: Map<string, Credential2> = new Map()
  private idCounter = 0
  private encrypted: boolean = true
  private accessLog: { id: string; time: number; action: string }[] = []

  store(type: string, name: string, value: string, expiresAt: number | null = null): string {
    const id = `cred_${++this.idCounter}`
    const cred: Credential2 = {
      id, type, name, value,
      expiresAt,
      metadata: {},
      createdAt: Date.now(),
      lastRotated: null,
      rotationCount: 0,
    }
    this.credentials.set(id, cred)
    return id
  }

  retrieve(id: string): string | null {
    const cred = this.credentials.get(id)
    if (!cred) return null
    if (cred.expiresAt && Date.now() > cred.expiresAt) return null
    this.accessLog.push({ id, time: Date.now(), action: 'retrieve' })
    return cred.value
  }

  rotate(id: string, newValue: string): boolean {
    const cred = this.credentials.get(id)
    if (!cred) return false
    cred.value = newValue
    cred.lastRotated = Date.now()
    cred.rotationCount++
    this.accessLog.push({ id, time: Date.now(), action: 'rotate' })
    return true
  }

  delete(id: string): boolean {
    this.accessLog.push({ id, time: Date.now(), action: 'delete' })
    return this.credentials.delete(id)
  }

  get(id: string): Omit<Credential2, 'value'> | undefined {
    const cred = this.credentials.get(id)
    if (!cred) return undefined
    const { value: _, ...rest } = cred
    return rest
  }

  getByName(name: string): string | undefined {
    const cred = Array.from(this.credentials.values()).find(c => c.name === name)
    return cred?.id
  }

  getByType(type: string): string[] {
    return Array.from(this.credentials.values()).filter(c => c.type === type).map(c => c.id)
  }

  isExpired(id: string): boolean {
    const cred = this.credentials.get(id)
    if (!cred || !cred.expiresAt) return false
    return Date.now() > cred.expiresAt
  }

  getExpiring(withinMs: number): string[] {
    const threshold = Date.now() + withinMs
    return Array.from(this.credentials.values())
      .filter(c => c.expiresAt !== null && c.expiresAt <= threshold && !this.isExpired(c.id))
      .map(c => c.id)
  }

  getExpired(): string[] {
    return Array.from(this.credentials.values()).filter(c => this.isExpired(c.id)).map(c => c.id)
  }

  setMetadata(id: string, key: string, value: string): boolean {
    const cred = this.credentials.get(id)
    if (!cred) return false
    cred.metadata[key] = value
    return true
  }

  getMetadata(id: string, key: string): string | undefined {
    return this.credentials.get(id)?.metadata[key]
  }

  setExpiry(id: string, expiresAt: number): boolean {
    const cred = this.credentials.get(id)
    if (!cred) return false
    cred.expiresAt = expiresAt
    return true
  }

  getAccessLog(): typeof this.accessLog { return [...this.accessLog] }

  count(): number { return this.credentials.size }
  isEncrypted(): boolean { return this.encrypted }

  setEncrypted(encrypted: boolean): this {
    this.encrypted = encrypted
    return this
  }

  toArray(): string[] { return Array.from(this.credentials.keys()) }
  toString(): string { return JSON.stringify({ credentials: this.count(), encrypted: this.encrypted }) }
  toJSON(): Record<string, unknown> { return { credentials: this.count(), encrypted: this.encrypted, expired: this.getExpired().length } }
  clone(): CredentialVault2 {
    const v = new CredentialVault2()
    this.credentials.forEach((c, id) => v.credentials.set(id, { ...c, metadata: { ...c.metadata } }))
    v.idCounter = this.idCounter
    v.encrypted = this.encrypted
    v.accessLog = [...this.accessLog]
    return v
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CredentialVault2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.credentials.clear()
    this.accessLog = []
    this.idCounter = 0
  }
}
