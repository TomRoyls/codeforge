export type Permission2 = string

export class PermissionManager2 {
  private userRoles: Map<string, Set<string>> = new Map()
  private rolePermissions: Map<string, Set<Permission2>> = new Map()
  private roleHierarchy: Map<string, Set<string>> = new Map()

  assignRole(userId: string, role: string): this {
    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, new Set())
    }
    this.userRoles.get(userId)!.add(role)
    return this
  }

  revokeRole(userId: string, role: string): boolean {
    return this.userRoles.get(userId)?.delete(role) ?? false
  }

  getUserRoles(userId: string): string[] {
    return Array.from(this.userRoles.get(userId) ?? [])
  }

  getEffectiveRoles(userId: string): string[] {
    const direct = this.userRoles.get(userId) ?? new Set<string>()
    const effective = new Set<string>(direct)
    for (const role of direct) {
      this.collectParentRoles(role, effective)
    }
    return Array.from(effective)
  }

  private collectParentRoles(role: string, collected: Set<string>): void {
    const parents = this.roleHierarchy.get(role) ?? new Set<string>()
    for (const parent of parents) {
      if (!collected.has(parent)) {
        collected.add(parent)
        this.collectParentRoles(parent, collected)
      }
    }
  }

  setRoleParent(role: string, parent: string): this {
    if (!this.roleHierarchy.has(role)) {
      this.roleHierarchy.set(role, new Set())
    }
    this.roleHierarchy.get(role)!.add(parent)
    return this
  }

  grantPermission(role: string, permission: Permission2): this {
    if (!this.rolePermissions.has(role)) {
      this.rolePermissions.set(role, new Set())
    }
    this.rolePermissions.get(role)!.add(permission)
    return this
  }

  revokePermission(role: string, permission: Permission2): boolean {
    return this.rolePermissions.get(role)?.delete(permission) ?? false
  }

  getRolePermissions(role: string): Permission2[] {
    return Array.from(this.rolePermissions.get(role) ?? [])
  }

  getUserPermissions(userId: string): Permission2[] {
    const roles = this.getEffectiveRoles(userId)
    const permissions = new Set<Permission2>()
    for (const role of roles) {
      const perms = this.rolePermissions.get(role) ?? new Set<Permission2>()
      perms.forEach(p => permissions.add(p))
    }
    return Array.from(permissions)
  }

  hasPermission(userId: string, permission: Permission2): boolean {
    return this.getUserPermissions(userId).includes(permission)
  }

  hasAnyPermission(userId: string, permissions: Permission2[]): boolean {
    const userPerms = new Set(this.getUserPermissions(userId))
    return permissions.some(p => userPerms.has(p))
  }

  hasAllPermissions(userId: string, permissions: Permission2[]): boolean {
    const userPerms = new Set(this.getUserPermissions(userId))
    return permissions.every(p => userPerms.has(p))
  }

  getRoles(): string[] {
    return Array.from(this.rolePermissions.keys())
  }

  getUsers(): string[] {
    return Array.from(this.userRoles.keys())
  }

  count(): number { return this.userRoles.size }

  toArray(): string[] { return this.getUsers() }
  toString(): string { return JSON.stringify({ users: this.userRoles.size, roles: this.rolePermissions.size }) }
  toJSON(): Record<string, unknown> { return { users: this.getUsers(), roles: this.getRoles() } }
  clone(): PermissionManager2 {
    const pm = new PermissionManager2()
    this.userRoles.forEach((roles, user) => roles.forEach(r => pm.assignRole(user, r)))
    this.rolePermissions.forEach((perms, role) => perms.forEach(p => pm.grantPermission(role, p)))
    return pm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof PermissionManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.userRoles.clear()
    this.rolePermissions.clear()
    this.roleHierarchy.clear()
  }
}
