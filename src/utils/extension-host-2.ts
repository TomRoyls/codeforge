export type ExtensionStatus2 = 'loaded' | 'activating' | 'active' | 'deactivating' | 'inactive' | 'error'
export type ExtensionType2 = 'ui' | 'backend' | 'theme' | 'language' | 'debugger' | 'formatter' | 'linter' | 'snippet'

export interface Extension2 {
  id: string
  name: string
  version: string
  type: ExtensionType2
  status: ExtensionStatus2
  mainEntry: string
  dependencies: string[]
  contributes: Record<string, unknown>
  activationEvents: string[]
  enabled: boolean
  installedAt: number
  activatedAt: number | null
  error: string | null
}

export interface ExtensionPoint2 {
  id: string
  name: string
  extensions: string[]
}

export class ExtensionHost2 {
  private extensions: Map<string, Extension2> = new Map()
  private points: Map<string, ExtensionPoint2> = new Map()
  private hooks: Map<string, Array<(context: unknown) => unknown>> = new Map()
  private apiVersion: string = '1.0.0'
  private idCounter = 0

  install(ext: Omit<Extension2, 'id' | 'status' | 'installedAt' | 'activatedAt' | 'error'> & { id?: string }): string {
    const id = ext.id ?? `ext_${++this.idCounter}`
    this.extensions.set(id, {
      ...ext, id,
      status: 'loaded',
      installedAt: Date.now(),
      activatedAt: null,
      error: null,
    })
    return id
  }

  uninstall(id: string): boolean {
    const ext = this.extensions.get(id)
    if (!ext) return false
    if (ext.status === 'active') this.deactivate(id)
    return this.extensions.delete(id)
  }

  get(id: string): Extension2 | undefined { return this.extensions.get(id) }
  has(id: string): boolean { return this.extensions.has(id) }

  enable(id: string): boolean {
    const ext = this.extensions.get(id)
    if (!ext) return false
    ext.enabled = true
    return true
  }

  disable(id: string): boolean {
    const ext = this.extensions.get(id)
    if (!ext) return false
    if (ext.status === 'active') this.deactivate(id)
    ext.enabled = false
    return true
  }

  activate(id: string): boolean {
    const ext = this.extensions.get(id)
    if (!ext || !ext.enabled || ext.status === 'active') return false
    ext.status = 'activating'
    for (const dep of ext.dependencies) {
      const depExt = this.extensions.get(dep)
      if (!depExt || depExt.status !== 'active') {
        if (depExt) this.activate(dep)
        else { ext.status = 'error'; ext.error = `Missing dependency: ${dep}`; return false }
      }
    }
    ext.status = 'active'
    ext.activatedAt = Date.now()
    return true
  }

  deactivate(id: string): boolean {
    const ext = this.extensions.get(id)
    if (!ext || ext.status !== 'active') return false
    ext.status = 'deactivating'
    const dependents = this.getDependents(id)
    dependents.forEach(d => this.deactivate(d.id))
    ext.status = 'inactive'
    return true
  }

  private getDependents(id: string): Extension2[] {
    return Array.from(this.extensions.values()).filter(e => e.dependencies.includes(id) && e.status === 'active')
  }

  registerPoint(pointId: string, name: string): this {
    this.points.set(pointId, { id: pointId, name, extensions: [] })
    return this
  }

  contributeTo(pointId: string, extensionId: string): boolean {
    const point = this.points.get(pointId)
    if (!point || !this.extensions.has(extensionId)) return false
    if (!point.extensions.includes(extensionId)) point.extensions.push(extensionId)
    return true
  }

  getPointContributors(pointId: string): Extension2[] {
    const point = this.points.get(pointId)
    if (!point) return []
    return point.extensions.map(id => this.extensions.get(id)!).filter(Boolean)
  }

  registerHook(name: string, fn: (context: unknown) => unknown): this {
    if (!this.hooks.has(name)) this.hooks.set(name, [])
    this.hooks.get(name)!.push(fn)
    return this
  }

  runHooks(name: string, context: unknown): unknown[] {
    const hooks = this.hooks.get(name)
    if (!hooks) return []
    return hooks.map(fn => fn(context))
  }

  unregisterHook(name: string): boolean { return this.hooks.delete(name) }

  getByType(type: ExtensionType2): Extension2[] {
    return Array.from(this.extensions.values()).filter(e => e.type === type)
  }

  getActive(): Extension2[] { return Array.from(this.extensions.values()).filter(e => e.status === 'active') }
  getInactive(): Extension2[] { return Array.from(this.extensions.values()).filter(e => e.status === 'inactive') }
  getErrored(): Extension2[] { return Array.from(this.extensions.values()).filter(e => e.status === 'error') }
  getEnabled(): Extension2[] { return Array.from(this.extensions.values()).filter(e => e.enabled) }
  getDisabled(): Extension2[] { return Array.from(this.extensions.values()).filter(e => !e.enabled) }

  setApiVersion(version: string): this { this.apiVersion = version; return this }
  getApiVersion(): string { return this.apiVersion }

  getStats(): { total: number; active: number; inactive: number; errored: number; points: number } {
    return {
      total: this.extensions.size,
      active: this.getActive().length,
      inactive: this.getInactive().length,
      errored: this.getErrored().length,
      points: this.points.size,
    }
  }

  count(): number { return this.extensions.size }

  toArray(): Extension2[] { return Array.from(this.extensions.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ExtensionHost2 {
    const eh = new ExtensionHost2()
    this.extensions.forEach((e, id) => eh.extensions.set(id, { ...e, dependencies: [...e.dependencies], activationEvents: [...e.activationEvents], contributes: { ...e.contributes } }))
    this.points.forEach((p, id) => eh.points.set(id, { ...p, extensions: [...p.extensions] }))
    this.hooks.forEach((fns, name) => eh.hooks.set(name, [...fns]))
    eh.apiVersion = this.apiVersion
    eh.idCounter = this.idCounter
    return eh
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ExtensionHost2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.extensions.clear()
    this.points.clear()
    this.hooks.clear()
    this.idCounter = 0
  }
}
