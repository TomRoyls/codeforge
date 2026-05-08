import { describe, it, expect, beforeEach } from 'vitest'
import { AuthManager } from '../../src/core/auth/auth-manager.js'
import type {
  AuthConfig,
  AuthProvider,
  AuthResult,
  SAMLAssertion,
} from '../../src/core/auth/types.js'
import { SUPPORTED_PROVIDERS } from '../../src/core/auth/types.js'

function makeConfig(overrides?: Partial<AuthConfig>): AuthConfig {
  return {
    provider: 'github',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback',
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scope: ['read:user', 'user:email'],
    ...overrides,
  }
}

function makeSAMLAssertion(overrides?: Partial<SAMLAssertion>): SAMLAssertion {
  const now = Date.now()
  return {
    id: 'assertion_123',
    issuer: 'https://idp.example.com',
    audience: 'https://codeforge.dev',
    nameId: 'user@example.com',
    nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    attributes: {
      email: ['user@example.com'],
      name: ['Test User'],
      displayName: ['Test User'],
      roles: ['admin', 'user'],
      groups: ['engineering', 'admins'],
      organization: ['CodeForge'],
    },
    notBefore: now - 60000,
    notOnOrAfter: now + 3600000,
    ...overrides,
  }
}

describe('AuthManager', () => {
  let manager: AuthManager

  beforeEach(() => {
    manager = new AuthManager()
  })

  describe('constructor', () => {
    it('should create an instance with empty sessions and configs', () => {
      expect(manager.getActiveSessions()).toEqual([])
    })

    it('should return supported providers', () => {
      const providers = manager.getSupportedProviders()
      expect(providers).toContain('saml')
      expect(providers).toContain('oauth2')
      expect(providers).toContain('github')
      expect(providers).toContain('gitlab')
      expect(providers).toContain('google')
      expect(providers).toContain('okta')
      expect(providers).toContain('azure-ad')
    })
  })

  describe('registerProvider', () => {
    it('should register a provider configuration', () => {
      const config = makeConfig()
      manager.registerProvider(config)
      expect(manager.getSupportedProviders()).toContain('github')
    })

    it('should allow registering multiple providers', () => {
      manager.registerProvider(makeConfig({ provider: 'github' }))
      manager.registerProvider(makeConfig({ provider: 'gitlab', clientId: 'gitlab-id' }))
      expect(manager.getSupportedProviders()).toContain('github')
      expect(manager.getSupportedProviders()).toContain('gitlab')
    })

    it('should overwrite config when registering same provider twice', () => {
      manager.registerProvider(makeConfig({ clientId: 'first' }))
      manager.registerProvider(makeConfig({ clientId: 'second' }))
      const result = manager.authenticate('github')
      expect(result).resolves.toBeDefined()
    })
  })

  describe('removeProvider', () => {
    it('should remove a registered provider', () => {
      manager.registerProvider(makeConfig())
      const removed = manager.removeProvider('github')
      expect(removed).toBe(true)
    })

    it('should return false when removing non-existent provider', () => {
      const removed = manager.removeProvider('github')
      expect(removed).toBe(false)
    })

    it('should prevent authentication after removal', async () => {
      manager.registerProvider(makeConfig())
      manager.removeProvider('github')
      const result = await manager.authenticate('github')
      expect(result.success).toBe(false)
      expect(result.error).toContain('not registered')
    })
  })

  describe('authenticate', () => {
    it('should authenticate with a registered provider', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
    })

    it('should fail for unregistered provider', async () => {
      const result = await manager.authenticate('github')
      expect(result.success).toBe(false)
      expect(result.error).toContain('not registered')
    })

    it('should create a session with correct provider', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      expect(result.session!.token.provider).toBe('github')
    })

    it('should create a session with user info', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      expect(result.session!.user).toBeDefined()
      expect(result.session!.user.email).toContain('@example.com')
    })

    it('should create a session with token info', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      expect(result.session!.token.accessToken).toBeDefined()
      expect(result.session!.token.refreshToken).toBeDefined()
      expect(result.session!.token.tokenType).toBe('Bearer')
    })

    it('should store the session', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      const session = manager.getSession(result.session!.id)
      expect(session).toBeDefined()
      expect(session!.id).toBe(result.session!.id)
    })

    it('should return a redirect URL', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      expect(result.redirectUrl).toBe('http://localhost:3000/callback')
    })

    it('should use SAML callback URL for saml provider', async () => {
      manager.registerProvider(
        makeConfig({
          provider: 'saml',
          samlCallbackUrl: 'https://codeforge.dev/saml/callback',
        }),
      )
      const result = await manager.authenticate('saml')
      expect(result.redirectUrl).toBe('https://codeforge.dev/saml/callback')
    })

    it('should use credentials for user generation', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github', {
        username: 'johndoe',
        password: 'secret',
      })
      expect(result.session!.user.email).toBe('johndoe@example.com')
      expect(result.session!.user.name).toBe('johndoe')
    })

    it('should set session status to authenticated', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      expect(result.session!.status).toBe('authenticated')
    })

    it('should set createdAt and lastRefreshedAt', async () => {
      manager.registerProvider(makeConfig())
      const before = Date.now()
      const result = await manager.authenticate('github')
      const after = Date.now()
      expect(result.session!.createdAt).toBeGreaterThanOrEqual(before)
      expect(result.session!.createdAt).toBeLessThanOrEqual(after)
      expect(result.session!.lastRefreshedAt).toBeGreaterThanOrEqual(before)
    })

    it('should work with each supported provider', async () => {
      const providers: AuthProvider[] = ['github', 'gitlab', 'google', 'okta', 'azure-ad', 'oauth2']
      for (const provider of providers) {
        manager.registerProvider(makeConfig({ provider }))
        const result = await manager.authenticate(provider)
        expect(result.success, `Provider ${provider} should succeed`).toBe(true)
        expect(result.session!.token.provider).toBe(provider)
      }
    })
  })

  describe('authenticateSAML', () => {
    it('should authenticate with a valid SAML assertion', async () => {
      const assertion = makeSAMLAssertion()
      const result = await manager.authenticateSAML(assertion)
      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
    })

    it('should use assertion attributes for user info', async () => {
      const assertion = makeSAMLAssertion()
      const result = await manager.authenticateSAML(assertion)
      expect(result.session!.user.email).toBe('user@example.com')
      expect(result.session!.user.name).toBe('Test User')
      expect(result.session!.user.displayName).toBe('Test User')
    })

    it('should set roles from assertion attributes', async () => {
      const assertion = makeSAMLAssertion()
      const result = await manager.authenticateSAML(assertion)
      expect(result.session!.user.roles).toEqual(['admin', 'user'])
    })

    it('should set groups from assertion attributes', async () => {
      const assertion = makeSAMLAssertion()
      const result = await manager.authenticateSAML(assertion)
      expect(result.session!.user.groups).toEqual(['engineering', 'admins'])
    })

    it('should set organization from assertion attributes', async () => {
      const assertion = makeSAMLAssertion()
      const result = await manager.authenticateSAML(assertion)
      expect(result.session!.user.organization).toBe('CodeForge')
    })

    it('should set provider to saml', async () => {
      const assertion = makeSAMLAssertion()
      const result = await manager.authenticateSAML(assertion)
      expect(result.session!.user.provider).toBe('saml')
      expect(result.session!.token.provider).toBe('saml')
    })

    it('should fail with expired assertion', async () => {
      const assertion = makeSAMLAssertion({
        notOnOrAfter: Date.now() - 10000,
      })
      const result = await manager.authenticateSAML(assertion)
      expect(result.success).toBe(false)
      expect(result.error).toContain('expired')
    })

    it('should fail with not-yet-valid assertion', async () => {
      const assertion = makeSAMLAssertion({
        notBefore: Date.now() + 3600000,
      })
      const result = await manager.authenticateSAML(assertion)
      expect(result.success).toBe(false)
      expect(result.error).toContain('not yet valid')
    })

    it('should fall back to nameId when email attribute missing', async () => {
      const assertion = makeSAMLAssertion({
        attributes: {
          name: ['Test User'],
        },
      })
      const result = await manager.authenticateSAML(assertion)
      expect(result.success).toBe(true)
      expect(result.session!.user.email).toBe('user@example.com')
    })

    it('should default roles to ["user"] when missing', async () => {
      const assertion = makeSAMLAssertion({
        attributes: {
          email: ['user@example.com'],
        },
      })
      const result = await manager.authenticateSAML(assertion)
      expect(result.success).toBe(true)
      expect(result.session!.user.roles).toEqual(['user'])
    })

    it('should default groups to ["developers"] when missing', async () => {
      const assertion = makeSAMLAssertion({
        attributes: {
          email: ['user@example.com'],
        },
      })
      const result = await manager.authenticateSAML(assertion)
      expect(result.success).toBe(true)
      expect(result.session!.user.groups).toEqual(['developers'])
    })

    it('should store the SAML session', async () => {
      const assertion = makeSAMLAssertion()
      const result = await manager.authenticateSAML(assertion)
      const stored = manager.getSession(result.session!.id)
      expect(stored).toBeDefined()
      expect(stored!.user.id).toBe('user@example.com')
    })
  })

  describe('authenticateOAuth2', () => {
    it('should authenticate with a valid code', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticateOAuth2('github', 'auth_code_123')
      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
    })

    it('should fail for unregistered provider', async () => {
      const result = await manager.authenticateOAuth2('github', 'auth_code_123')
      expect(result.success).toBe(false)
      expect(result.error).toContain('not registered')
    })

    it('should fail with empty authorization code', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticateOAuth2('github', '')
      expect(result.success).toBe(false)
      expect(result.error).toContain('required')
    })

    it('should return the redirect URL', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticateOAuth2('github', 'auth_code_123')
      expect(result.redirectUrl).toBe('http://localhost:3000/callback')
    })

    it('should create session with correct provider', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticateOAuth2('github', 'auth_code_123')
      expect(result.session!.token.provider).toBe('github')
      expect(result.session!.user.provider).toBe('github')
    })
  })

  describe('validateSession', () => {
    it('should return true for valid session', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      expect(manager.validateSession(result.session!.id)).toBe(true)
    })

    it('should return false for non-existent session', () => {
      expect(manager.validateSession('nonexistent')).toBe(false)
    })

    it('should return false for expired session', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      const session = manager.getSession(result.session!.id)!
      session.token.expiresAt = Date.now() - 1000
      expect(manager.validateSession(session.id)).toBe(false)
    })

    it('should update status to expired for expired session', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      const session = manager.getSession(result.session!.id)!
      session.token.expiresAt = Date.now() - 1000
      manager.validateSession(session.id)
      expect(session.status).toBe('expired')
    })

    it('should update status to authenticated for valid session', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      manager.validateSession(result.session!.id)
      expect(result.session!.status).toBe('authenticated')
    })
  })

  describe('refreshToken', () => {
    it('should refresh a valid session token', async () => {
      manager.registerProvider(makeConfig())
      const authResult = await manager.authenticate('github')
      const refreshResult = await manager.refreshToken(authResult.session!.id)
      expect(refreshResult.success).toBe(true)
      expect(refreshResult.session).toBeDefined()
    })

    it('should update the access token', async () => {
      manager.registerProvider(makeConfig())
      const authResult = await manager.authenticate('github')
      const oldToken = authResult.session!.token.accessToken
      const refreshResult = await manager.refreshToken(authResult.session!.id)
      expect(refreshResult.session!.token.accessToken).not.toBe(oldToken)
    })

    it('should update lastRefreshedAt', async () => {
      manager.registerProvider(makeConfig())
      const authResult = await manager.authenticate('github')
      const oldRefreshedAt = authResult.session!.lastRefreshedAt
      await new Promise((resolve) => setTimeout(resolve, 10))
      const refreshResult = await manager.refreshToken(authResult.session!.id)
      expect(refreshResult.session!.lastRefreshedAt).toBeGreaterThan(oldRefreshedAt)
    })

    it('should reset status to authenticated', async () => {
      manager.registerProvider(makeConfig())
      const authResult = await manager.authenticate('github')
      const session = manager.getSession(authResult.session!.id)!
      session.status = 'refreshing'
      const refreshResult = await manager.refreshToken(authResult.session!.id)
      expect(refreshResult.session!.status).toBe('authenticated')
    })

    it('should fail for non-existent session', async () => {
      const result = await manager.refreshToken('nonexistent')
      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('getSession', () => {
    it('should return session by ID', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      const session = manager.getSession(result.session!.id)
      expect(session).toBeDefined()
      expect(session!.id).toBe(result.session!.id)
    })

    it('should return null for non-existent session', () => {
      expect(manager.getSession('nonexistent')).toBeNull()
    })
  })

  describe('getUser', () => {
    it('should return user info from session', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      const user = manager.getUser(result.session!.id)
      expect(user).toBeDefined()
      expect(user!.email).toContain('@example.com')
    })

    it('should return null for non-existent session', () => {
      expect(manager.getUser('nonexistent')).toBeNull()
    })
  })

  describe('logout', () => {
    it('should remove a session', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      const loggedOut = manager.logout(result.session!.id)
      expect(loggedOut).toBe(true)
      expect(manager.getSession(result.session!.id)).toBeNull()
    })

    it('should return false for non-existent session', () => {
      expect(manager.logout('nonexistent')).toBe(false)
    })
  })

  describe('hasRole', () => {
    it('should return true if user has the role', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      expect(manager.hasRole(result.session!.id, 'user')).toBe(true)
    })

    it('should return false if user does not have the role', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      expect(manager.hasRole(result.session!.id, 'admin')).toBe(false)
    })

    it('should return false for non-existent session', () => {
      expect(manager.hasRole('nonexistent', 'user')).toBe(false)
    })
  })

  describe('hasGroup', () => {
    it('should return true if user is in the group', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      expect(manager.hasGroup(result.session!.id, 'developers')).toBe(true)
    })

    it('should return false if user is not in the group', async () => {
      manager.registerProvider(makeConfig())
      const result = await manager.authenticate('github')
      expect(manager.hasGroup(result.session!.id, 'admins')).toBe(false)
    })

    it('should return false for non-existent session', () => {
      expect(manager.hasGroup('nonexistent', 'developers')).toBe(false)
    })

    it('should detect SAML user groups', async () => {
      const assertion = makeSAMLAssertion()
      const result = await manager.authenticateSAML(assertion)
      expect(manager.hasGroup(result.session!.id, 'engineering')).toBe(true)
      expect(manager.hasGroup(result.session!.id, 'admins')).toBe(true)
    })

    it('should detect SAML user roles', async () => {
      const assertion = makeSAMLAssertion()
      const result = await manager.authenticateSAML(assertion)
      expect(manager.hasRole(result.session!.id, 'admin')).toBe(true)
      expect(manager.hasRole(result.session!.id, 'user')).toBe(true)
    })
  })

  describe('getActiveSessions', () => {
    it('should return empty array when no sessions', () => {
      expect(manager.getActiveSessions()).toEqual([])
    })

    it('should return all active sessions', async () => {
      manager.registerProvider(makeConfig({ provider: 'github' }))
      manager.registerProvider(makeConfig({ provider: 'gitlab', clientId: 'gl-id' }))
      await manager.authenticate('github')
      await manager.authenticate('gitlab')
      expect(manager.getActiveSessions()).toHaveLength(2)
    })

    it('should exclude expired sessions', async () => {
      manager.registerProvider(makeConfig())
      const r1 = await manager.authenticate('github')
      const session = manager.getSession(r1.session!.id)!
      session.token.expiresAt = Date.now() - 1000
      session.status = 'expired'
      expect(manager.getActiveSessions()).toHaveLength(0)
    })
  })

  describe('cleanExpired', () => {
    it('should remove expired sessions and return count', async () => {
      manager.registerProvider(makeConfig())
      const r1 = await manager.authenticate('github')
      const session = manager.getSession(r1.session!.id)!
      session.token.expiresAt = Date.now() - 1000
      const removed = manager.cleanExpired()
      expect(removed).toBe(1)
      expect(manager.getSession(r1.session!.id)).toBeNull()
    })

    it('should not remove active sessions', async () => {
      manager.registerProvider(makeConfig())
      await manager.authenticate('github')
      const removed = manager.cleanExpired()
      expect(removed).toBe(0)
    })

    it('should return 0 when no sessions exist', () => {
      expect(manager.cleanExpired()).toBe(0)
    })
  })

  describe('clear', () => {
    it('should remove all sessions', async () => {
      manager.registerProvider(makeConfig())
      await manager.authenticate('github')
      manager.clear()
      expect(manager.getActiveSessions()).toEqual([])
    })

    it('should not affect registered providers', async () => {
      manager.registerProvider(makeConfig())
      manager.clear()
      const result = await manager.authenticate('github')
      expect(result.success).toBe(true)
    })
  })

  describe('SUPPORTED_PROVIDERS', () => {
    it('should export all expected providers', () => {
      expect(SUPPORTED_PROVIDERS).toHaveLength(7)
      expect(SUPPORTED_PROVIDERS).toEqual(
        expect.arrayContaining(['saml', 'oauth2', 'github', 'gitlab', 'google', 'okta', 'azure-ad']),
      )
    })
  })

  describe('edge cases', () => {
    it('should handle multiple sessions independently', async () => {
      manager.registerProvider(makeConfig({ provider: 'github' }))
      manager.registerProvider(makeConfig({ provider: 'gitlab', clientId: 'gl-id' }))
      const r1 = await manager.authenticate('github')
      const r2 = await manager.authenticate('gitlab')
      expect(r1.session!.id).not.toBe(r2.session!.id)
      expect(r1.session!.token.provider).toBe('github')
      expect(r2.session!.token.provider).toBe('gitlab')
    })

    it('should handle logout of one session without affecting others', async () => {
      manager.registerProvider(makeConfig())
      const r1 = await manager.authenticate('github')
      const r2 = await manager.authenticate('github')
      manager.logout(r1.session!.id)
      expect(manager.getSession(r1.session!.id)).toBeNull()
      expect(manager.getSession(r2.session!.id)).toBeDefined()
    })

    it('should allow re-authentication after logout', async () => {
      manager.registerProvider(makeConfig())
      const r1 = await manager.authenticate('github')
      manager.logout(r1.session!.id)
      const r2 = await manager.authenticate('github')
      expect(r2.success).toBe(true)
      expect(r2.session!.id).not.toBe(r1.session!.id)
    })

    it('should handle validate + refresh of same session', async () => {
      manager.registerProvider(makeConfig())
      const r1 = await manager.authenticate('github')
      expect(manager.validateSession(r1.session!.id)).toBe(true)
      const refreshed = await manager.refreshToken(r1.session!.id)
      expect(refreshed.success).toBe(true)
      expect(manager.validateSession(r1.session!.id)).toBe(true)
    })

    it('should handle cleanExpired with mix of expired and active', async () => {
      manager.registerProvider(makeConfig())
      const r1 = await manager.authenticate('github')
      const r2 = await manager.authenticate('github')
      const s1 = manager.getSession(r1.session!.id)!
      s1.token.expiresAt = Date.now() - 1000
      const removed = manager.cleanExpired()
      expect(removed).toBe(1)
      expect(manager.getSession(r1.session!.id)).toBeNull()
      expect(manager.getSession(r2.session!.id)).toBeDefined()
    })
  })
})
