export type AuthProvider = 'saml' | 'oauth2' | 'github' | 'gitlab' | 'google' | 'okta' | 'azure-ad'

export type AuthStatus = 'authenticated' | 'expired' | 'unauthenticated' | 'refreshing'

export interface AuthConfig {
  provider: AuthProvider
  clientId: string
  clientSecret: string
  redirectUri: string
  authorizeUrl: string
  tokenUrl: string
  userInfoUrl: string
  scope: string[]
  samlEntryPoint?: string
  samlIssuer?: string
  samlCallbackUrl?: string
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
  expiresAt: number
  tokenType: string
  scope: string[]
  provider: AuthProvider
}

export interface UserInfo {
  id: string
  email: string
  name: string
  displayName: string
  avatar?: string
  roles: string[]
  groups: string[]
  organization?: string
  provider: AuthProvider
}

export interface AuthSession {
  id: string
  user: UserInfo
  token: AuthToken
  status: AuthStatus
  createdAt: number
  lastRefreshedAt: number
}

export interface AuthResult {
  success: boolean
  session?: AuthSession
  error?: string
  redirectUrl?: string
}

export interface SAMLAssertion {
  id: string
  issuer: string
  audience: string
  nameId: string
  nameIdFormat: string
  attributes: Record<string, string[]>
  notBefore: number
  notOnOrAfter: number
}

export interface OAuth2TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

export const SUPPORTED_PROVIDERS: AuthProvider[] = [
  'saml',
  'oauth2',
  'github',
  'gitlab',
  'google',
  'okta',
  'azure-ad',
]
