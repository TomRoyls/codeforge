import { randomUUID } from 'node:crypto'
import type {
  AuthConfig,
  AuthProvider,
  AuthResult,
  AuthSession,
  AuthToken,
  SAMLAssertion,
  UserInfo,
} from './types.js'
import { SUPPORTED_PROVIDERS } from './types.js'

function generateMockToken(provider: AuthProvider, expiresIn: number): AuthToken {
  const now = Date.now()
  return {
    accessToken: `mock_access_${provider}_${randomUUID()}`,
    refreshToken: `mock_refresh_${provider}_${randomUUID()}`,
    expiresIn,
    expiresAt: now + expiresIn * 1000,
    tokenType: 'Bearer',
    scope: ['openid', 'profile', 'email'],
    provider,
  }
}

function generateMockUser(provider: AuthProvider, credentials?: { username: string; password: string }): UserInfo {
  const username = credentials?.username ?? `user_${provider}`
  return {
    id: `usr_${randomUUID()}`,
    email: `${username}@example.com`,
    name: username,
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
    avatar: `https://avatars.example.com/${username}`,
    roles: ['user'],
    groups: ['developers'],
    organization: 'CodeForge',
    provider,
  }
}

function createSession(user: UserInfo, token: AuthToken): AuthSession {
  const now = Date.now()
  return {
    id: `ses_${randomUUID()}`,
    user,
    token,
    status: 'authenticated',
    createdAt: now,
    lastRefreshedAt: now,
  }
}

export class AuthManager {
  private sessions: Map<string, AuthSession> = new Map()
  private configs: Map<AuthProvider, AuthConfig> = new Map()

  constructor() {
    this.sessions = new Map()
    this.configs = new Map()
  }

  registerProvider(config: AuthConfig): void {
    this.configs.set(config.provider, config)
  }

  removeProvider(provider: AuthProvider): boolean {
    return this.configs.delete(provider)
  }

  async authenticate(
    provider: AuthProvider,
    credentials?: { username: string; password: string },
  ): Promise<AuthResult> {
    const config = this.configs.get(provider)
    if (!config) {
      return {
        success: false,
        error: `Provider "${provider}" is not registered`,
      }
    }

    if (!SUPPORTED_PROVIDERS.includes(provider)) {
      return {
        success: false,
        error: `Provider "${provider}" is not supported`,
      }
    }

    const expiresIn = 3600
    const token = generateMockToken(provider, expiresIn)
    const user = generateMockUser(provider, credentials)
    const session = createSession(user, token)

    this.sessions.set(session.id, session)

    const redirectUrl =
      provider === 'saml'
        ? config.samlCallbackUrl
        : config.redirectUri

    return {
      success: true,
      session,
      redirectUrl,
    }
  }

  async authenticateSAML(assertion: SAMLAssertion): Promise<AuthResult> {
    const now = Date.now()

    if (assertion.notOnOrAfter < now) {
      return {
        success: false,
        error: 'SAML assertion has expired',
      }
    }

    if (assertion.notBefore > now) {
      return {
        success: false,
        error: 'SAML assertion is not yet valid',
      }
    }

    const email = assertion.attributes['email']?.[0] ?? assertion.nameId
    const name = assertion.attributes['name']?.[0] ?? assertion.nameId
    const displayName = assertion.attributes['displayName']?.[0] ?? name
    const roles = assertion.attributes['roles'] ?? ['user']
    const groups = assertion.attributes['groups'] ?? ['developers']
    const organization = assertion.attributes['organization']?.[0]

    const user: UserInfo = {
      id: assertion.nameId,
      email,
      name,
      displayName,
      avatar: `https://avatars.example.com/${assertion.nameId}`,
      roles,
      groups,
      organization,
      provider: 'saml',
    }

    const expiresIn = 3600
    const token = generateMockToken('saml', expiresIn)
    const session = createSession(user, token)

    this.sessions.set(session.id, session)

    return {
      success: true,
      session,
    }
  }

  async authenticateOAuth2(provider: AuthProvider, code: string): Promise<AuthResult> {
    const config = this.configs.get(provider)
    if (!config) {
      return {
        success: false,
        error: `Provider "${provider}" is not registered`,
      }
    }

    if (!code || code.length === 0) {
      return {
        success: false,
        error: 'Authorization code is required',
      }
    }

    const expiresIn = 3600
    const token = generateMockToken(provider, expiresIn)
    const user = generateMockUser(provider)
    const session = createSession(user, token)

    this.sessions.set(session.id, session)

    return {
      success: true,
      session,
      redirectUrl: config.redirectUri,
    }
  }

  async refreshToken(sessionId: string): Promise<AuthResult> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return {
        success: false,
        error: `Session "${sessionId}" not found`,
      }
    }

    const newExpiresIn = 3600
    const newToken = generateMockToken(session.token.provider, newExpiresIn)

    session.token = newToken
    session.status = 'authenticated'
    session.lastRefreshedAt = Date.now()

    return {
      success: true,
      session,
    }
  }

  validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return false
    }

    const now = Date.now()
    if (session.token.expiresAt < now) {
      session.status = 'expired'
      return false
    }

    session.status = 'authenticated'
    return true
  }

  getSession(sessionId: string): AuthSession | null {
    return this.sessions.get(sessionId) ?? null
  }

  getUser(sessionId: string): UserInfo | null {
    const session = this.sessions.get(sessionId)
    return session?.user ?? null
  }

  logout(sessionId: string): boolean {
    return this.sessions.delete(sessionId)
  }

  hasRole(sessionId: string, role: string): boolean {
    const user = this.getUser(sessionId)
    if (!user) return false
    return user.roles.includes(role)
  }

  hasGroup(sessionId: string, group: string): boolean {
    const user = this.getUser(sessionId)
    if (!user) return false
    return user.groups.includes(group)
  }

  getActiveSessions(): AuthSession[] {
    const now = Date.now()
    const active: AuthSession[] = []
    for (const session of this.sessions.values()) {
      if (session.token.expiresAt >= now && session.status !== 'expired') {
        active.push(session)
      }
    }
    return active
  }

  cleanExpired(): number {
    const now = Date.now()
    let removed = 0
    for (const [id, session] of this.sessions) {
      if (session.token.expiresAt < now) {
        this.sessions.delete(id)
        removed++
      }
    }
    return removed
  }

  getSupportedProviders(): AuthProvider[] {
    return [...SUPPORTED_PROVIDERS]
  }

  clear(): void {
    this.sessions.clear()
  }
}
