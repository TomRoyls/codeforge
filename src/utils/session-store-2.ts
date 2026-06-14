export type SessionState2 = 'active' | 'expired' | 'revoked' | 'idle'
export type TokenType2 = 'access' | 'refresh' | 'id' | 'service'

export interface Session2 {
  id: string
  userId: string
  state: SessionState2
  createdAt: number
  lastAccessedAt: number
  expiresAt: number
  idleTimeout: number
  tokens: Map<TokenType2, { value: string; expiresAt: number; revoked: boolean }>
  ip: string
  userAgent: string
  metadata: Record<string, unknown>
}

export interface SessionPolicy2 {
  maxSessions: number
  sessionTimeout: number
  idleTimeout: number
  refreshThreshold: number
  revokeOnPasswordChange: boolean
}

export class SessionStore2 {
  private sessions: Map<string, Session2> = new Map()
  private userSessions: Map<string, Set<string>> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private policy: SessionPolicy2 = {
    maxSessions: 5,
    sessionTimeout: 86400000,
    idleTimeout: 1800000,
    refreshThreshold: 3600000,
    revokeOnPasswordChange: true,
  }

  setPolicy(policy: Partial<SessionPolicy2>): this {
    this.policy = { ...this.policy, ...policy }
    return this
  }

  getPolicy(): SessionPolicy2 { return { ...this.policy } }

  create(userId: string, ip: string, userAgent: string, metadata: Record<string, unknown> = {}): string {
    const existing = this.getUserSessions(userId)
    if (existing.length >= this.policy.maxSessions) {
      const oldest = existing.sort((a, b) => a.createdAt - b.createdAt)[0]
      this.revoke(oldest.id, 'max-sessions-exceeded')
    }

    const id = `sess_${++this.idCounter}`
    const now = Date.now()
    const session: Session2 = {
      id, userId,
      state: 'active',
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: now + this.policy.sessionTimeout,
      idleTimeout: this.policy.idleTimeout,
      tokens: new Map(),
      ip, userAgent,
      metadata,
    }
    this.sessions.set(id, session)
    let userSet = this.userSessions.get(userId)
    if (!userSet) { userSet = new Set(); this.userSessions.set(userId, userSet) }
    userSet.add(id)
    this.notify('session-created', { id, userId })
    return id
  }

  setToken(sessionId: string, type: TokenType2, value: string, expiresAt: number): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    session.tokens.set(type, { value, expiresAt, revoked: false })
    return true
  }

  getToken(sessionId: string, type: TokenType2): string | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null
    const token = session.tokens.get(type)
    if (!token || token.revoked) return null
    if (Date.now() >= token.expiresAt) return null
    return token.value
  }

  revokeToken(sessionId: string, type: TokenType2): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    const token = session.tokens.get(type)
    if (!token) return false
    token.revoked = true
    return true
  }

  touch(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session || session.state !== 'active') return false
    const now = Date.now()
    session.lastAccessedAt = now
    if (now >= session.expiresAt) {
      session.state = 'expired'
      this.notify('session-expired', { id: sessionId })
    }
    return true
  }

  refresh(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session || session.state !== 'active') return false
    const now = Date.now()
    if (session.expiresAt - now < this.policy.refreshThreshold) {
      session.expiresAt = now + this.policy.sessionTimeout
      this.notify('session-refreshed', { id: sessionId })
      return true
    }
    return false
  }

  revoke(sessionId: string, reason: string = 'manual'): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    session.state = 'revoked'
    session.tokens.forEach(t => { t.revoked = true })
    this.notify('session-revoked', { id: sessionId, reason })
    return true
  }

  revokeAllForUser(userId: string, reason: string = 'bulk'): number {
    const sessionIds = this.userSessions.get(userId)
    if (!sessionIds) return 0
    let count = 0
    for (const sid of sessionIds) {
      if (this.revoke(sid, reason)) count++
    }
    return count
  }

  revokeIdle(): number {
    const now = Date.now()
    let count = 0
    this.sessions.forEach(session => {
      if (session.state === 'active' && now - session.lastAccessedAt >= session.idleTimeout) {
        session.state = 'idle'
        this.notify('session-idle', { id: session.id })
        count++
      }
    })
    return count
  }

  sweepExpired(): number {
    const now = Date.now()
    let count = 0
    this.sessions.forEach(session => {
      if (session.state === 'active' && now >= session.expiresAt) {
        session.state = 'expired'
        this.notify('session-expired', { id: session.id })
        count++
      }
    })
    return count
  }

  get(id: string): Session2 | undefined { return this.sessions.get(id) }
  getUserSessions(userId: string): Session2[] {
    const ids = this.userSessions.get(userId)
    if (!ids) return []
    return Array.from(ids).map(id => this.sessions.get(id)).filter(Boolean) as Session2[]
  }
  getActive(): Session2[] { return Array.from(this.sessions.values()).filter(s => s.state === 'active') }
  getByState(state: SessionState2): Session2[] { return Array.from(this.sessions.values()).filter(s => s.state === state) }

  isValid(id: string): boolean {
    const session = this.sessions.get(id)
    if (!session || session.state !== 'active') return false
    return Date.now() < session.expiresAt
  }

  setMetadata(sessionId: string, key: string, value: unknown): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    session.metadata[key] = value
    return true
  }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { total: number; active: number; expired: number; revoked: number; uniqueUsers: number } {
    return {
      total: this.sessions.size,
      active: this.getActive().length,
      expired: this.getByState('expired').length,
      revoked: this.getByState('revoked').length,
      uniqueUsers: this.userSessions.size,
    }
  }

  count(): number { return this.sessions.size }

  toArray(): Session2[] { return Array.from(this.sessions.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): SessionStore2 {
    const ss = new SessionStore2()
    ss.idCounter = this.idCounter
    ss.policy = { ...this.policy }
    return ss
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SessionStore2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.sessions.clear()
    this.userSessions.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
