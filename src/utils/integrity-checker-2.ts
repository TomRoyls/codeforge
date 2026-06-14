export type IntegrityStatus2 = 'verified' | 'mismatch' | 'missing' | 'expired' | 'unknown'

export interface IntegrityRecord2 {
  id: string
  artifact: string
  version: string
  algorithm: string
  expectedHash: string
  actualHash: string | null
  status: IntegrityStatus2
  verifiedAt: number | null
  timestamp: number
  signature: string | null
  signer: string | null
}

export class IntegrityChecker2 {
  private records: Map<string, IntegrityRecord2> = new Map()
  private trustedKeys: Set<string> = new Set()
  private algorithms: string[] = ['sha256', 'sha512', 'sha1']
  private expiryMs: number = 30 * 24 * 60 * 60 * 1000

  register(artifact: string, version: string, algorithm: string, expectedHash: string, signature: string | null = null, signer: string | null = null): string {
    const id = `${artifact}@${version}`
    this.records.set(id, {
      id, artifact, version, algorithm,
      expectedHash, actualHash: null,
      status: 'missing', verifiedAt: null,
      timestamp: Date.now(), signature, signer,
    })
    return id
  }

  trustKey(keyId: string): this { this.trustedKeys.add(keyId); return this }
  revokeKey(keyId: string): this { this.trustedKeys.delete(keyId); return this }
  isTrusted(keyId: string): boolean { return this.trustedKeys.has(keyId) }

  verify(id: string, actualHash: string): boolean {
    const r = this.records.get(id)
    if (!r) return false
    r.actualHash = actualHash
    if (r.expectedHash === actualHash) {
      r.status = 'verified'
      r.verifiedAt = Date.now()
      return true
    }
    r.status = 'mismatch'
    return false
  }

  verifyBatch(items: Array<{ id: string; hash: string }>): { verified: number; failed: number } {
    let verified = 0
    let failed = 0
    items.forEach(item => {
      if (this.verify(item.id, item.hash)) verified++
      else failed++
    })
    return { verified, failed }
  }

  checkExpiry(id: string): boolean {
    const r = this.records.get(id)
    if (!r || !r.verifiedAt) return false
    const elapsed = Date.now() - r.verifiedAt
    if (elapsed >= this.expiryMs) {
      r.status = 'expired'
      return true
    }
    return false
  }

  checkAllExpiry(): string[] {
    const expired: string[] = []
    this.records.forEach((_, id) => {
      if (this.checkExpiry(id)) expired.push(id)
    })
    return expired
  }

  setExpiry(ms: number): this { this.expiryMs = ms; return this }
  getExpiry(): number { return this.expiryMs }

  addAlgorithm(algorithm: string): this { this.algorithms.push(algorithm); return this }
  getAlgorithms(): string[] { return [...this.algorithms] }

  get(id: string): IntegrityRecord2 | undefined { return this.records.get(id) }
  getByArtifact(artifact: string): IntegrityRecord2[] {
    return Array.from(this.records.values()).filter(r => r.artifact === artifact)
  }
  getByStatus(status: IntegrityStatus2): IntegrityRecord2[] {
    return Array.from(this.records.values()).filter(r => r.status === status)
  }

  getVerified(): IntegrityRecord2[] { return this.getByStatus('verified') }
  getMismatches(): IntegrityRecord2[] { return this.getByStatus('mismatch') }
  getMissing(): IntegrityRecord2[] { return this.getByStatus('missing') }
  getExpired(): IntegrityRecord2[] { return this.getByStatus('expired') }

  isVerified(id: string): boolean {
    const r = this.records.get(id)
    return r ? r.status === 'verified' : false
  }

  verifySignature(id: string): boolean {
    const r = this.records.get(id)
    if (!r || !r.signature || !r.signer) return false
    return this.isTrusted(r.signer)
  }

  getStats(): Record<IntegrityStatus2, number> {
    const stats: Record<string, number> = { verified: 0, mismatch: 0, missing: 0, expired: 0, unknown: 0 }
    this.records.forEach(r => { stats[r.status]++ })
    return stats as Record<IntegrityStatus2, number>
  }

  getComplianceScore(): number {
    if (this.records.size === 0) return 1
    return this.getVerified().length / this.records.size
  }

  remove(id: string): boolean { return this.records.delete(id) }
  count(): number { return this.records.size }

  toArray(): IntegrityRecord2[] { return Array.from(this.records.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): IntegrityChecker2 {
    const ic = new IntegrityChecker2()
    this.records.forEach((r, id) => ic.records.set(id, { ...r }))
    this.trustedKeys.forEach(k => ic.trustedKeys.add(k))
    ic.algorithms = [...this.algorithms]
    ic.expiryMs = this.expiryMs
    return ic
  }
  equals(other: unknown): boolean {
    if (!(other instanceof IntegrityChecker2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.records.clear()
    this.trustedKeys.clear()
  }
}
