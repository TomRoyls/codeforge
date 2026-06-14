export type Role2 = 'admin' | 'editor' | 'viewer' | 'guest' | 'custom'
export type PermissionResult2 = 'allow' | 'deny' | 'prompt'

export interface Permission2 {
  resource: string
  action: string
  effect: 'allow' | 'deny'
  conditions: string[]
}

export interface RoleDefinition2 {
  name: string
  type: Role2
  permissions: Permission2[]
  inherits: string[]
  description: string
}

export class RBACEngine2 {
  private roles: Map<string, RoleDefinition2> = new Map()
  private assignments: Map<string, Set<string>> = new Map()
  private resourceTree: Map<string, Set<string>> = new Map()
  private policyVersion: number = 0

  defineRole(name: string, type: Role2, permissions: Permission2[] = [], inherits: string[] = [], description = ''): this {
    this.roles.set(name, { name, type, permissions, inherits, description })
    this.policyVersion++
    return this
  }

  removeRole(name: string): boolean {
    const deleted = this.roles.delete(name)
    if (deleted) {
      this.assignments.forEach(roles => roles.delete(name))
      this.policyVersion++
    }
    return deleted
  }

  getRole(name: string): RoleDefinition2 | undefined { return this.roles.get(name) }
  hasRole(name: string): boolean { return this.roles.has(name) }

  addPermission(roleName: string, permission: Permission2): boolean {
    const role = this.roles.get(roleName)
    if (!role) return false
    role.permissions.push(permission)
    this.policyVersion++
    return true
  }

  removePermission(roleName: string, resource: string, action: string): boolean {
    const role = this.roles.get(roleName)
    if (!role) return false
    const idx = role.permissions.findIndex(p => p.resource === resource && p.action === action)
    if (idx === -1) return false
    role.permissions.splice(idx, 1)
    this.policyVersion++
    return true
  }

  assignRole(userId: string, roleName: string): boolean {
    if (!this.roles.has(roleName)) return false
    if (!this.assignments.has(userId)) this.assignments.set(userId, new Set())
    this.assignments.get(userId)!.add(roleName)
    return true
  }

  revokeRole(userId: string, roleName: string): boolean {
    const roles = this.assignments.get(userId)
    if (!roles) return false
    return roles.delete(roleName)
  }

  getUserRoles(userId: string): string[] {
    const direct = this.assignments.get(userId)
    if (!direct) return []
    const allRoles = new Set<string>(direct)
    const resolve = (roleName: string) => {
      const role = this.roles.get(roleName)
      if (role) {
        role.inherits.forEach(parent => {
          if (!allRoles.has(parent)) {
            allRoles.add(parent)
            resolve(parent)
          }
        })
      }
    }
    direct.forEach(r => resolve(r))
    return Array.from(allRoles)
  }

  getAllPermissions(userId: string): Permission2[] {
    const roles = this.getUserRoles(userId)
    const perms: Permission2[] = []
    roles.forEach(r => {
      const role = this.roles.get(r)
      if (role) perms.push(...role.permissions)
    })
    return perms
  }

  can(userId: string, action: string, resource: string): PermissionResult2 {
    const perms = this.getAllPermissions(userId)
    let hasAllow = false
    for (const p of perms) {
      const resourceMatch = this.matchResource(p.resource, resource)
      const actionMatch = p.action === '*' || p.action === action
      if (resourceMatch && actionMatch) {
        if (p.effect === 'deny') return 'deny'
        if (p.effect === 'allow') hasAllow = true
      }
    }
    return hasAllow ? 'allow' : 'deny'
  }

  private matchResource(pattern: string, resource: string): boolean {
    if (pattern === '*') return true
    if (pattern === resource) return true
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2)
      return resource.startsWith(prefix)
    }
    return false
  }

  addResourceChild(parent: string, child: string): this {
    if (!this.resourceTree.has(parent)) this.resourceTree.set(parent, new Set())
    this.resourceTree.get(parent)!.add(child)
    return this
  }

  getResourceChildren(parent: string): string[] {
    return Array.from(this.resourceTree.get(parent) ?? [])
  }

  getUsersByRole(roleName: string): string[] {
    return Array.from(this.assignments.entries())
      .filter(([_, roles]) => roles.has(roleName))
      .map(([userId]) => userId)
  }

  getPolicyVersion(): number { return this.policyVersion }

  getStats(): { roles: number; assignments: number; permissions: number } {
    let permCount = 0
    this.roles.forEach(r => { permCount += r.permissions.length })
    return {
      roles: this.roles.size,
      assignments: Array.from(this.assignments.values()).reduce((s, r) => s + r.size, 0),
      permissions: permCount,
    }
  }

  count(): number { return this.roles.size }

  toArray(): RoleDefinition2[] { return Array.from(this.roles.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): RBACEngine2 {
    const rbac = new RBACEngine2()
    this.roles.forEach((r, name) => rbac.roles.set(name, { ...r, permissions: [...r.permissions], inherits: [...r.inherits] }))
    this.assignments.forEach((roles, userId) => rbac.assignments.set(userId, new Set(roles)))
    rbac.policyVersion = this.policyVersion
    return rbac
  }
  equals(other: unknown): boolean {
    if (!(other instanceof RBACEngine2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.roles.clear()
    this.assignments.clear()
    this.resourceTree.clear()
    this.policyVersion = 0
  }
}
