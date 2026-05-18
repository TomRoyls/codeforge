import { describe, it, expect, beforeEach } from 'vitest'
import { AuthManager, SUPPORTED_PROVIDERS } from '../src/core/auth/index.js'
import type { AuthConfig, SAMLAssertion } from '../src/core/auth/index.js'

const mockConfig: AuthConfig = {
  provider: 'github',
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  redirectUri: 'https://example.com/callback',
  authorizeUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  userInfoUrl: 'https://api.github.com/user',
  scope: ['openid', 'profile'],
}

const mockSamlConfig: AuthConfig = {
  provider: 'saml',
  clientId: 'saml-client',
  clientSecret: 'saml-secret',
  redirectUri: 'https://example.com/saml/callback',
  authorizeUrl: 'https://idp.example.com/saml/authorize',
  tokenUrl: 'https://idp.example.com/saml/token',
  userInfoUrl: 'https://idp.example.com/saml/userinfo',
  scope: ['openid'],
  samlEntryPoint: 'https://idp.example.com/saml/entry',
  samlIssuer: 'codeforge',
  samlCallbackUrl: 'https://example.com/saml/callback',
}

// ─── AuthManager Construction ───

describe('AuthManager', () => {
  let auth: AuthManager

  beforeEach(() => {
    auth = new AuthManager()
  })

  describe('construction', () => {
    it('should create an instance with no sessions or configs', () => {
      expect(auth.getActiveSessions()).toEqual([])
      expect(auth.getSupportedProviders()).toEqual(SUPPORTED_PROVIDERS)
    })
  })

  // ─── Provider Registration ───

  describe('registerProvider / removeProvider', () => {
    it('should register a provider', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github')
      expect(result.success).toBe(true)
    })

    it('should remove a registered provider and return true', () => {
      auth.registerProvider(mockConfig)
      expect(auth.removeProvider('github')).toBe(true)
    })

    it('should return false when removing non-existent provider', () => {
      expect(auth.removeProvider('github')).toBe(false)
    })

    it('should fail authentication after provider removal', async () => {
      auth.registerProvider(mockConfig)
      auth.removeProvider('github')
      const result = await auth.authenticate('github')
      expect(result.success).toBe(false)
      expect(result.error).toContain('not registered')
    })
  })

  // ─── Authentication ───

  describe('authenticate', () => {
    it('should fail for unregistered provider', async () => {
      const result = await auth.authenticate('github')
      expect(result.success).toBe(false)
      expect(result.error).toContain('not registered')
    })

    it('should authenticate successfully with a registered provider', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github')
      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
      expect(result.session!.status).toBe('authenticated')
      expect(result.session!.user.provider).toBe('github')
      expect(result.redirectUrl).toBe(mockConfig.redirectUri)
    })

    it('should create a session with valid token on authentication', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github')
      const session = result.session!
      expect(session.token.accessToken).toContain('mock_access_github')
      expect(session.token.refreshToken).toContain('mock_refresh_github')
      expect(session.token.expiresIn).toBe(3600)
      expect(session.token.tokenType).toBe('Bearer')
      expect(session.token.provider).toBe('github')
    })

    it('should populate user info from credentials', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github', { username: 'testuser', password: 'pass123' })
      expect(result.session!.user.email).toBe('testuser@example.com')
      expect(result.session!.user.name).toBe('testuser')
      expect(result.session!.user.displayName).toBe('Testuser')
    })

    it('should use default username when no credentials provided', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github')
      expect(result.session!.user.name).toBe('user_github')
    })

    it('should use SAML callback URL for saml provider', async () => {
      auth.registerProvider(mockSamlConfig)
      const result = await auth.authenticate('saml')
      expect(result.success).toBe(true)
      expect(result.redirectUrl).toBe(mockSamlConfig.samlCallbackUrl)
    })
  })

  // ─── SAML Authentication ───

  describe('authenticateSAML', () => {
    const validAssertion: SAMLAssertion = {
      id: 'assertion_123',
      issuer: 'https://idp.example.com',
      audience: 'https://example.com',
      nameId: 'user@example.com',
      nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      attributes: {
        email: ['user@example.com'],
        name: ['Test User'],
        displayName: ['Tester'],
        roles: ['admin', 'user'],
        groups: ['developers', 'admins'],
        organization: ['TestOrg'],
      },
      notBefore: Date.now() - 60000,
      notOnOrAfter: Date.now() + 60000,
    }

    it('should authenticate with a valid SAML assertion', async () => {
      const result = await auth.authenticateSAML(validAssertion)
      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
      expect(result.session!.user.email).toBe('user@example.com')
      expect(result.session!.user.roles).toEqual(['admin', 'user'])
      expect(result.session!.user.organization).toBe('TestOrg')
    })

    it('should reject an expired SAML assertion', async () => {
      const expired: SAMLAssertion = {
        ...validAssertion,
        notOnOrAfter: Date.now() - 1000,
      }
      const result = await auth.authenticateSAML(expired)
      expect(result.success).toBe(false)
      expect(result.error).toContain('expired')
    })

    it('should reject a not-yet-valid SAML assertion', async () => {
      const notYetValid: SAMLAssertion = {
        ...validAssertion,
        notBefore: Date.now() + 60000,
      }
      const result = await auth.authenticateSAML(notYetValid)
      expect(result.success).toBe(false)
      expect(result.error).toContain('not yet valid')
    })

    it('should fall back to nameId when attributes missing', async () => {
      const minimal: SAMLAssertion = {
        ...validAssertion,
        attributes: {},
      }
      const result = await auth.authenticateSAML(minimal)
      expect(result.success).toBe(true)
      expect(result.session!.user.email).toBe('user@example.com')
      expect(result.session!.user.roles).toEqual(['user'])
    })
  })

  // ─── OAuth2 Authentication ───

  describe('authenticateOAuth2', () => {
    it('should fail for unregistered provider', async () => {
      const result = await auth.authenticateOAuth2('google', 'code123')
      expect(result.success).toBe(false)
      expect(result.error).toContain('not registered')
    })

    it('should fail with empty authorization code', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticateOAuth2('github', '')
      expect(result.success).toBe(false)
      expect(result.error).toContain('required')
    })

    it('should authenticate with valid code', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticateOAuth2('github', 'valid_code')
      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
      expect(result.redirectUrl).toBe(mockConfig.redirectUri)
    })
  })

  // ─── Session Management ───

  describe('session management', () => {
    it('should validate an active session', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github')
      const sessionId = result.session!.id
      expect(auth.validateSession(sessionId)).toBe(true)
    })

    it('should return false for non-existent session', () => {
      expect(auth.validateSession('nonexistent')).toBe(false)
    })

    it('should get a session by id', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github')
      const session = auth.getSession(result.session!.id)
      expect(session).toBeDefined()
      expect(session!.id).toBe(result.session!.id)
    })

    it('should return null for non-existent session', () => {
      expect(auth.getSession('nonexistent')).toBeNull()
    })

    it('should get user from session', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github')
      const user = auth.getUser(result.session!.id)
      expect(user).toBeDefined()
      expect(user!.provider).toBe('github')
    })

    it('should return null user for non-existent session', () => {
      expect(auth.getUser('nonexistent')).toBeNull()
    })

    it('should logout a session', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github')
      const sessionId = result.session!.id
      expect(auth.logout(sessionId)).toBe(true)
      expect(auth.getSession(sessionId)).toBeNull()
    })

    it('should return false when logging out non-existent session', () => {
      expect(auth.logout('nonexistent')).toBe(false)
    })
  })

  // ─── Role and Group Checks ───

  describe('hasRole / hasGroup', () => {
    it('should check if user has a role', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github')
      expect(auth.hasRole(result.session!.id, 'user')).toBe(true)
      expect(auth.hasRole(result.session!.id, 'admin')).toBe(false)
    })

    it('should check if user has a group', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github')
      expect(auth.hasGroup(result.session!.id, 'developers')).toBe(true)
      expect(auth.hasGroup(result.session!.id, 'admins')).toBe(false)
    })

    it('should return false for non-existent session', () => {
      expect(auth.hasRole('nonexistent', 'user')).toBe(false)
      expect(auth.hasGroup('nonexistent', 'developers')).toBe(false)
    })
  })

  // ─── Token Refresh ───

  describe('refreshToken', () => {
    it('should refresh an existing session token', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github')
      const sessionId = result.session!.id
      const oldToken = result.session!.token.accessToken

      const refreshResult = await auth.refreshToken(sessionId)
      expect(refreshResult.success).toBe(true)
      expect(refreshResult.session!.token.accessToken).not.toBe(oldToken)
    })

    it('should fail for non-existent session', async () => {
      const result = await auth.refreshToken('nonexistent')
      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  // ─── Active Sessions & Cleanup ───

  describe('getActiveSessions / cleanExpired', () => {
    it('should list active sessions', async () => {
      auth.registerProvider(mockConfig)
      await auth.authenticate('github')
      const active = auth.getActiveSessions()
      expect(active.length).toBe(1)
    })

    it('should return empty array when no sessions', () => {
      expect(auth.getActiveSessions()).toEqual([])
    })

    it('should clean expired sessions and return count', async () => {
      auth.registerProvider(mockConfig)
      const result = await auth.authenticate('github')
      // Manually expire the session
      const session = auth.getSession(result.session!.id)!
      session.token.expiresAt = Date.now() - 1000
      const removed = auth.cleanExpired()
      expect(removed).toBe(1)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all sessions', async () => {
      auth.registerProvider(mockConfig)
      await auth.authenticate('github')
      auth.clear()
      expect(auth.getActiveSessions()).toEqual([])
    })
  })

  // ─── Supported Providers ───

  describe('getSupportedProviders', () => {
    it('should return all supported providers', () => {
      const providers = auth.getSupportedProviders()
      expect(providers).toContain('github')
      expect(providers).toContain('gitlab')
      expect(providers).toContain('google')
      expect(providers).toContain('saml')
      expect(providers).toContain('oauth2')
      expect(providers).toContain('okta')
      expect(providers).toContain('azure-ad')
      expect(providers.length).toBe(7)
    })
  })
})
