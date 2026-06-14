export type SecretStatus2 = 'active' | 'expired' | 'revoked' | 'rotating'
export type SecretType2 = 'password' | 'api_key' | 'certificate' | 'token' | 'key_pair' | 'connection_string'

export interface Secret2 {
  id: string
  name: string
  type: SecretType2
  value: string
  version: number
  status: SecretStatus2
  createdAt: number
  rotatedAt: number | null
  expiresAt: number | null
  tags: string[]
  metadata: Record<string, string>
}

export interface RotationPolicy2 {
  intervalMs: number
  autoRotate: boolean
  notifyBefore: number
}

export class SecretVault2 {
  private secrets: Map<string, Secret2> = new Map()
  private history: Map<string, Secret2[]> = new Map()
  private policies: Map<string, RotationPolicy2> = new Map()
  private accessLog: Array<{ secretId: string; action: string; timestamp: number }> = []
  private idCounter = 0

  store(name: string, type: SecretType2, value: string, tags: string[] = [], expiresAt: number | null = null): string {
    const id = `secret_${++this.idCounter}`
    const secret: Secret2 = {
      id, name, type, value, version: 1,
      status: 'active', createdAt: Date.now(),
      rotatedAt: null, expiresAt, tags, metadata: {},
    }
    this.secrets.set(id, secret)
    this.log(id, 'stored')
    return id
  }

  get(id: string): Secret2 | undefined {
    const secret = this.secrets.get(id)
    if (secret) this.log(id, 'read')
    return secret
  }

  getValue(id: string): string | undefined { return this.secrets.get(id)?.value }

  getByName(name: string): Secret2 | undefined {
    return Array.from(this.secrets.values()).find(s => s.name === name)
  }

  getByType(type: SecretType2): Secret2[] {
    return Array.from(this.secrets.values()).filter(s => s.type === type)
  }

  getByTag(tag: string): Secret2[] {
    return Array.from(this.secrets.values()).filter(s => s.tags.includes(tag))
  }

  update(id: string, value: string): boolean {
    const secret = this.secrets.get(id)
    if (!secret) return false
    if (!this.history.has(id)) this.history.set(id, [])
    this.history.get(id)!.push({ ...secret })
    secret.value = value
    secret.version++
    secret.rotatedAt = Date.now()
    this.log(id, 'updated')
    return true
  }

  rotate(id: string, newValue: string): boolean {
    const secret = this.secrets.get(id)
    if (!secret) return false
    secret.status = 'rotating'
    this.update(id, newValue)
    secret.status = 'active'
    this.log(id, 'rotated')
    return true
  }

  setRotationPolicy(id: string, policy: RotationPolicy2): boolean {
    if (!this.secrets.has(id)) return false
    this.policies.set(id, policy)
    return true
  }

  getRotationPolicy(id: string): RotationPolicy2 | undefined { return this.policies.get(id) }

  checkExpiry(): string[] {
    const now = Date.now()
    const expired: string[] = []
    this.secrets.forEach((secret, id) => {
      if (secret.expiresAt && secret.expiresAt <= now && secret.status === 'active') {
        secret.status = 'expired'
        expired.push(id)
      }
    })
    return expired
  }

  checkRotationNeeded(): string[] {
    const now = Date.now()
    const needRotation: string[] = []
    this.policies.forEach((policy, id) => {
      const secret = this.secrets.get(id)
      if (!secret || !policy.autoRotate) return
      const lastRotated = secret.rotatedAt ?? secret.createdAt
      if (now - lastRotated >= policy.intervalMs) {
        needRotation.push(id)
      }
    })
    return needRotation
  }

  revoke(id: string): boolean {
    const secret = this.secrets.get(id)
    if (!secret) return false
    secret.status = 'revoked'
    secret.value = ''
    this.log(id, 'revoked')
    return true
  }

  restore(id: string): boolean {
    const secret = this.secrets.get(id)
    if (!secret || secret.status !== 'revoked') return false
    secret.status = 'active'
    this.log(id, 'restored')
    return true
  }

  getHistory(id: string): Secret2[] {
    return [...(this.history.get(id) ?? [])]
  }

  getAccessLog(secretId?: string): Array<{ secretId: string; action: string; timestamp: number }> {
    if (secretId) return this.accessLog.filter(e => e.secretId === secretId)
    return [...this.accessLog]
  }

  private log(secretId: string, action: string): void {
    this.accessLog.push({ secretId, action, timestamp: Date.now() })
  }

  setMetadata(id: string, key: string, value: string): boolean {
    const secret = this.secrets.get(id)
    if (!secret) return false
    secret.metadata[key] = value
    return true
  }

  remove(id: string): boolean {
    this.history.delete(id)
    this.policies.delete(id)
    return this.secrets.delete(id)
  }

  getActive(): Secret2[] { return Array.from(this.secrets.values()).filter(s => s.status === 'active') }
  getExpired(): Secret2[] { return Array.from(this.secrets.values()).filter(s => s.status === 'expired') }
  getRevoked(): Secret2[] { return Array.from(this.secrets.values()).filter(s => s.status === 'revoked') }

  getStats(): { total: number; active: number; expired: number; revoked: number } {
    return {
      total: this.secrets.size,
      active: this.getActive().length,
      expired: this.getExpired().length,
      revoked: this.getRevoked().length,
    }
  }

  count(): number { return this.secrets.size }

  toArray(): Secret2[] { return Array.from(this.secrets.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): SecretVault2 {
    const sv = new SecretVault2()
    this.secrets.forEach((s, id) => sv.secrets.set(id, { ...s, tags: [...s.tags], metadata: { ...s.metadata } }))
    this.history.forEach((h, id) => sv.history.set(id, h.map(s => ({ ...s }))))
    this.policies.forEach((p, id) => sv.policies.set(id, { ...p }))
    sv.accessLog = [...this.accessLog]
    sv.idCounter = this.idCounter
    return sv
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SecretVault2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.secrets.clear()
    this.history.clear()
    this.policies.clear()
    this.accessLog = []
    this.idCounter = 0
  }
}
