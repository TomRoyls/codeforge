export type DDLState2 = 'valid' | 'invalid' | 'deprecated'

export interface DDLObject2 {
  id: string
  name: string
  type: 'table' | 'index' | 'view' | 'sequence' | 'function' | 'trigger'
  definition: string
  state: DDLState2
  version: number
  createdAt: number
  modifiedAt: number
  dependencies: string[]
  schema: string
}

export class DDLManager2 {
  private objects: Map<string, DDLObject2> = new Map()
  private nameIndex: Map<string, string> = new Map()
  private idCounter = 0
  private listeners: Array<(event: string, obj: DDLObject2) => void> = []

  create(schema: string, name: string, type: DDLObject2['type'], definition: string, dependencies: string[] = []): string {
    const fullName = `${schema}.${name}`
    const id = `ddl_${++this.idCounter}`
    const obj: DDLObject2 = {
      id, name, type, definition, schema,
      state: 'valid',
      version: 1,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      dependencies,
    }
    this.objects.set(id, obj)
    this.nameIndex.set(fullName, id)
    this.notify('created', obj)
    return id
  }

  alter(id: string, newDefinition: string): boolean {
    const obj = this.objects.get(id)
    if (!obj || obj.state === 'deprecated') return false
    obj.definition = newDefinition
    obj.version++
    obj.modifiedAt = Date.now()
    this.notify('altered', obj)
    return true
  }

  drop(id: string): boolean {
    const obj = this.objects.get(id)
    if (!obj) return false
    const dependents = this.getDependents(id)
    if (dependents.length > 0) return false
    this.objects.delete(id)
    this.nameIndex.delete(`${obj.schema}.${obj.name}`)
    this.notify('dropped', obj)
    return true
  }

  deprecate(id: string): boolean {
    const obj = this.objects.get(id)
    if (!obj) return false
    obj.state = 'deprecated'
    this.notify('deprecated', obj)
    return true
  }

  validate(id: string): boolean {
    const obj = this.objects.get(id)
    if (!obj) return false
    obj.state = 'valid'
    this.notify('validated', obj)
    return true
  }

  invalidate(id: string): boolean {
    const obj = this.objects.get(id)
    if (!obj) return false
    obj.state = 'invalid'
    this.notify('invalidated', obj)
    return true
  }

  get(id: string): DDLObject2 | undefined { return this.objects.get(id) }

  getByName(schema: string, name: string): DDLObject2 | undefined {
    const id = this.nameIndex.get(`${schema}.${name}`)
    return id ? this.objects.get(id) : undefined
  }

  getByType(type: DDLObject2['type']): DDLObject2[] {
    return Array.from(this.objects.values()).filter(o => o.type === type)
  }

  getBySchema(schema: string): DDLObject2[] {
    return Array.from(this.objects.values()).filter(o => o.schema === schema)
  }

  getByState(state: DDLState2): DDLObject2[] {
    return Array.from(this.objects.values()).filter(o => o.state === state)
  }

  getDependents(id: string): DDLObject2[] {
    const obj = this.objects.get(id)
    if (!obj) return []
    const fullName = `${obj.schema}.${obj.name}`
    return Array.from(this.objects.values()).filter(o => o.dependencies.includes(fullName))
  }

  checkCircularDeps(id: string, visited: Set<string> = new Set()): boolean {
    if (visited.has(id)) return true
    visited.add(id)
    const obj = this.objects.get(id)
    if (!obj) return false
    for (const depName of obj.dependencies) {
      const depId = this.nameIndex.get(depName)
      if (depId && this.checkCircularDeps(depId, visited)) return true
    }
    return false
  }

  rename(id: string, newName: string): boolean {
    const obj = this.objects.get(id)
    if (!obj) return false
    this.nameIndex.delete(`${obj.schema}.${obj.name}`)
    obj.name = newName
    obj.modifiedAt = Date.now()
    this.nameIndex.set(`${obj.schema}.${newName}`, id)
    this.notify('renamed', obj)
    return true
  }

  listen(fn: (event: string, obj: DDLObject2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, obj: DDLObject2): void {
    this.listeners.forEach(fn => fn(event, obj))
  }

  getStats(): { total: number; valid: number; invalid: number; deprecated: number; tables: number; indexes: number; views: number } {
    return {
      total: this.objects.size,
      valid: this.getByState('valid').length,
      invalid: this.getByState('invalid').length,
      deprecated: this.getByState('deprecated').length,
      tables: this.getByType('table').length,
      indexes: this.getByType('index').length,
      views: this.getByType('view').length,
    }
  }

  count(): number { return this.objects.size }

  toArray(): DDLObject2[] { return Array.from(this.objects.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): DDLManager2 {
    const dm = new DDLManager2()
    this.objects.forEach((o, id) => dm.objects.set(id, { ...o, dependencies: [...o.dependencies] }))
    this.nameIndex.forEach((id, name) => dm.nameIndex.set(name, id))
    dm.idCounter = this.idCounter
    return dm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof DDLManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.objects.clear()
    this.nameIndex.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
