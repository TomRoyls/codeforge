import { PermissionManager2 } from './permission-manager-2.js'

export type Action2 = 'create' | 'read' | 'update' | 'delete' | 'execute' | '*'

export interface AclEntry2 {
  subject: string
  resource: string
  actions: Action2[]
  effect: 'allow' | 'deny'
}

export class AccessControl2 {
  private acl: AclEntry2[] = []
  private permissions: PermissionManager2
  private resourceOwners: Map<string, string> = new Map()

  constructor(permissions?: PermissionManager2) {
    this.permissions = permissions ?? new PermissionManager2()
  }

  setOwner(resource: string, userId: string): this {
    this.resourceOwners.set(resource, userId)
    return this
  }

  getOwner(resource: string): string | undefined {
    return this.resourceOwners.get(resource)
  }

  isOwner(resource: string, userId: string): boolean {
    return this.resourceOwners.get(resource) === userId
  }

  allow(subject: string, resource: string, actions: Action2[]): this {
    this.acl.push({ subject, resource, actions, effect: 'allow' })
    return this
  }

  deny(subject: string, resource: string, actions: Action2[]): this {
    this.acl.push({ subject, resource, actions, effect: 'deny' })
    return this
  }

  removeEntry(subject: string, resource: string): number {
    const before = this.acl.length
    this.acl = this.acl.filter(e => !(e.subject === subject && e.resource === resource))
    return before - this.acl.length
  }

  can(subject: string, action: Action2, resource: string): boolean {
    if (this.isOwner(resource, subject)) return true

    const permKey = `${resource}:${action}`
    if (this.permissions.hasPermission(subject, permKey)) return true

    let allowed = false
    let denied = false

    for (const entry of this.acl) {
      const subjectMatch = entry.subject === subject || entry.subject === '*'
      const resourceMatch = entry.resource === resource || entry.resource === '*'
      const actionMatch = entry.actions.includes(action) || entry.actions.includes('*')

      if (subjectMatch && resourceMatch && actionMatch) {
        if (entry.effect === 'deny') {
          denied = true
        } else {
          allowed = true
        }
      }
    }

    if (denied) return false
    return allowed
  }

  canAll(subject: string, actions: Action2[], resource: string): boolean {
    return actions.every(a => this.can(subject, a, resource))
  }

  canAny(subject: string, actions: Action2[], resource: string): boolean {
    return actions.some(a => this.can(subject, a, resource))
  }

  getEntries(): AclEntry2[] {
    return [...this.acl]
  }

  getEntriesForSubject(subject: string): AclEntry2[] {
    return this.acl.filter(e => e.subject === subject)
  }

  getEntriesForResource(resource: string): AclEntry2[] {
    return this.acl.filter(e => e.resource === resource)
  }

  getPermissions(): PermissionManager2 {
    return this.permissions
  }

  count(): number { return this.acl.length }

  toArray(): AclEntry2[] { return this.getEntries() }
  toString(): string { return JSON.stringify({ entries: this.count() }) }
  toJSON(): Record<string, unknown> { return { entries: this.count(), resources: this.resourceOwners.size } }
  clone(): AccessControl2 {
    const ac = new AccessControl2(this.permissions.clone())
    this.acl.forEach(e => {
      if (e.effect === 'allow') ac.allow(e.subject, e.resource, e.actions)
      else ac.deny(e.subject, e.resource, e.actions)
    })
    this.resourceOwners.forEach((owner, res) => ac.setOwner(res, owner))
    return ac
  }
  equals(other: unknown): boolean {
    if (!(other instanceof AccessControl2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.acl = []
    this.resourceOwners.clear()
    this.permissions.clear()
  }
}
