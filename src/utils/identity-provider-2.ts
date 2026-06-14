export type ProviderType2 = 'oauth2' | 'saml' | 'oidc' | 'ldap' | 'apikey'

export interface IdentityProvider2 {
  id: string
  name: string
  type: ProviderType2
  enabled: boolean
  config: Record<string, unknown>
  domains: string[]
  createdAt: number
  lastUsedAt: number | null
  userCount: number
}

export interface ExternalIdentity2 {
  id: string
  providerId: string
  externalId: string
  email: string | null
  name: string | null
  attributes: Record<string, unknown>
  linkedAt: number
  lastSeenAt: number
  groups: string[]
}

export interface Permission2 {
  resource: string
  action: string
  effect: 'allow' | 'deny'
  conditions: Record<string, unknown>
}

export interface Role2 {
  id: string
  name: string
  permissions: Permission2[]
  parent: string | null
}

export class IdentityProviderManager2 {
  private providers: Map<string, IdentityProvider2> = new Map()
  private identities: Map<string, ExternalIdentity2> = new Map()
  private roles: Map<string, Role2> = new Map()
  private userRoles: Map<string, Set<string>> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private identityCounter = 0
  private roleCounter = 0

  addProvider(name: string, type: ProviderType2, config: Record<string, unknown> = {}, domains: string[] = []): string {
    const id = `prov_${++this.idCounter}`
    const provider: IdentityProvider2 = {
      id, name, type,
      enabled: true,
      config,
      domains,
      createdAt: Date.now(),
      lastUsedAt: null,
      userCount: 0,
    }
    this.providers.set(id, provider)
    this.notify('provider-added', { id })
    return id
  }

  removeProvider(id: string): boolean {
    const provider = this.providers.get(id)
    if (!provider) return false
    provider.enabled = false
    this.providers.delete(id)
    this.notify('provider-removed', { id })
    return true
  }

  enableProvider(id: string): boolean {
    const provider = this.providers.get(id)
    if (!provider) return false
    provider.enabled = true
    return true
  }

  disableProvider(id: string): boolean {
    const provider = this.providers.get(id)
    if (!provider) return false
    provider.enabled = false
    return true
  }

  linkIdentity(providerId: string, externalId: string, email: string | null = null, name: string | null = null, attributes: Record<string, unknown> = {}): string | null {
    const provider = this.providers.get(providerId)
    if (!provider || !provider.enabled) return null
    const id = `extid_${++this.identityCounter}`
    const identity: ExternalIdentity2 = {
      id, providerId, externalId, email, name,
      attributes,
      linkedAt: Date.now(),
      lastSeenAt: Date.now(),
      groups: [],
    }
    this.identities.set(id, identity)
    provider.userCount++
    provider.lastUsedAt = Date.now()
    this.notify('identity-linked', { id, providerId })
    return id
  }

  unlinkIdentity(id: string): boolean {
    const identity = this.identities.get(id)
    if (!identity) return false
    const provider = this.providers.get(identity.providerId)
    if (provider) provider.userCount = Math.max(0, provider.userCount - 1)
    this.identities.delete(id)
    this.notify('identity-unlinked', { id })
    return true
  }

  addGroup(identityId: string, group: string): boolean {
    const identity = this.identities.get(identityId)
    if (!identity) return false
    if (!identity.groups.includes(group)) identity.groups.push(group)
    return true
  }

  touchIdentity(id: string): boolean {
    const identity = this.identities.get(id)
    if (!identity) return false
    identity.lastSeenAt = Date.now()
    return true
  }

  createRole(name: string, permissions: Permission2[] = [], parent: string | null = null): string {
    const id = `role_${++this.roleCounter}`
    const role: Role2 = { id, name, permissions, parent }
    this.roles.set(id, role)
    this.notify('role-created', { id })
    return id
  }

  addPermission(roleId: string, permission: Permission2): boolean {
    const role = this.roles.get(roleId)
    if (!role) return false
    role.permissions.push(permission)
    return true
  }

  assignRole(userId: string, roleId: string): boolean {
    const role = this.roles.get(roleId)
    if (!role) return false
    let userSet = this.userRoles.get(userId)
    if (!userSet) { userSet = new Set(); this.userRoles.set(userId, userSet) }
    userSet.add(roleId)
    this.notify('role-assigned', { userId, roleId })
    return true
  }

  revokeRole(userId: string, roleId: string): boolean {
    const userSet = this.userRoles.get(userId)
    if (!userSet) return false
    const removed = userSet.delete(roleId)
    if (removed) this.notify('role-revoked', { userId, roleId })
    return removed
  }

  getUserRoles(userId: string): Role2[] {
    const roleIds = this.userRoles.get(userId)
    if (!roleIds) return []
    return Array.from(roleIds).map(id => this.roles.get(id)).filter(Boolean) as Role2[]
  }

  getAllPermissions(userId: string): Permission2[] {
    const roles = this.getUserRoles(userId)
    const allPerms: Permission2[] = []
    const visited = new Set<string>()
    const collect = (role: Role2) => {
      if (visited.has(role.id)) return
      visited.add(role.id)
      allPerms.push(...role.permissions)
      if (role.parent) {
        const parent = this.roles.get(role.parent)
        if (parent) collect(parent)
      }
    }
    roles.forEach(collect)
    return allPerms
  }

  hasPermission(userId: string, resource: string, action: string): boolean {
    const perms = this.getAllPermissions(userId)
    const matching = perms.filter(p => p.resource === resource && p.action === action)
    if (matching.length === 0) return false
    return matching.some(p => p.effect === 'allow')
  }

  getProvider(id: string): IdentityProvider2 | undefined { return this.providers.get(id) }
  getProviderByDomain(domain: string): IdentityProvider2 | undefined {
    return Array.from(this.providers.values()).find(p => p.enabled && p.domains.includes(domain))
  }
  getIdentity(id: string): ExternalIdentity2 | undefined { return this.identities.get(id) }
  getIdentitiesByProvider(providerId: string): ExternalIdentity2[] {
    return Array.from(this.identities.values()).filter(i => i.providerId === providerId)
  }
  getRole(id: string): Role2 | undefined { return this.roles.get(id) }
  getRoleByName(name: string): Role2 | undefined { return Array.from(this.roles.values()).find(r => r.name === name) }
  getEnabledProviders(): IdentityProvider2[] { return Array.from(this.providers.values()).filter(p => p.enabled) }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { providers: number; identities: number; roles: number; assignments: number } {
    return {
      providers: this.providers.size,
      identities: this.identities.size,
      roles: this.roles.size,
      assignments: Array.from(this.userRoles.values()).reduce((s, roles) => s + roles.size, 0),
    }
  }

  count(): number { return this.identities.size }

  toArray(): ExternalIdentity2[] { return Array.from(this.identities.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): IdentityProviderManager2 {
    const im = new IdentityProviderManager2()
    im.idCounter = this.idCounter
    im.identityCounter = this.identityCounter
    im.roleCounter = this.roleCounter
    return im
  }
  equals(other: unknown): boolean {
    if (!(other instanceof IdentityProviderManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.providers.clear()
    this.identities.clear()
    this.roles.clear()
    this.userRoles.clear()
    this.listeners = []
    this.idCounter = 0
    this.identityCounter = 0
    this.roleCounter = 0
  }
}
