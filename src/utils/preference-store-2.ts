export type PreferenceType2 = 'string' | 'number' | 'boolean' | 'object' | 'array'

export interface Preference2 {
  key: string
  value: unknown
  type: PreferenceType2
  defaultValue: unknown
  description: string
  readonly: boolean
  scope: 'global' | 'workspace' | 'project' | 'user'
  override: boolean
}

export class PreferenceStore2 {
  private prefs: Map<string, Preference2> = new Map()
  private profiles: Map<string, Map<string, unknown>> = new Map()
  private activeProfile: string | null = null
  private listeners: Array<(key: string, value: unknown) => void> = []

  define(key: string, type: PreferenceType2, defaultValue: unknown, description = '', readonly = false, scope: Preference2['scope'] = 'global'): this {
    this.prefs.set(key, { key, value: defaultValue, type, defaultValue, description, readonly, scope, override: false })
    return this
  }

  set(key: string, value: unknown): boolean {
    const pref = this.prefs.get(key)
    if (!pref || pref.readonly) return false
    if (!this.validateType(value, pref.type)) return false
    pref.value = value
    pref.override = value !== pref.defaultValue
    if (this.activeProfile) {
      let profile = this.profiles.get(this.activeProfile)
      if (!profile) { profile = new Map(); this.profiles.set(this.activeProfile, profile) }
      profile.set(key, value)
    }
    this.listeners.forEach(cb => cb(key, value))
    return true
  }

  get(key: string): unknown {
    const pref = this.prefs.get(key)
    return pref ? pref.value : undefined
  }

  getTyped<T>(key: string): T | undefined {
    return this.get(key) as T | undefined
  }

  getOrDefault(key: string): unknown {
    const pref = this.prefs.get(key)
    return pref ? pref.defaultValue : undefined
  }

  reset(key: string): boolean {
    const pref = this.prefs.get(key)
    if (!pref) return false
    pref.value = pref.defaultValue
    pref.override = false
    return true
  }

  isReadonly(key: string): boolean {
    return this.prefs.get(key)?.readonly ?? false
  }

  isOverridden(key: string): boolean {
    return this.prefs.get(key)?.override ?? false
  }

  has(key: string): boolean { return this.prefs.has(key) }

  remove(key: string): boolean { return this.prefs.delete(key) }

  getByScope(scope: Preference2['scope']): Preference2[] {
    return Array.from(this.prefs.values()).filter(p => p.scope === scope)
  }

  getOverridden(): Preference2[] {
    return Array.from(this.prefs.values()).filter(p => p.override)
  }

  getKeys(): string[] { return Array.from(this.prefs.keys()) }

  private validateType(value: unknown, type: PreferenceType2): boolean {
    switch (type) {
      case 'string': return typeof value === 'string'
      case 'number': return typeof value === 'number'
      case 'boolean': return typeof value === 'boolean'
      case 'object': return typeof value === 'object' && value !== null && !Array.isArray(value)
      case 'array': return Array.isArray(value)
      default: return false
    }
  }

  createProfile(name: string): boolean {
    if (this.profiles.has(name)) return false
    this.profiles.set(name, new Map())
    return true
  }

  deleteProfile(name: string): boolean {
    if (name === this.activeProfile) this.activeProfile = null
    return this.profiles.delete(name)
  }

  switchProfile(name: string): boolean {
    if (!this.profiles.has(name)) return false
    this.activeProfile = name
    const profile = this.profiles.get(name)!
    this.prefs.forEach(pref => {
      if (profile.has(pref.key)) {
        pref.value = profile.get(pref.key)
        pref.override = pref.value !== pref.defaultValue
      } else {
        pref.value = pref.defaultValue
        pref.override = false
      }
    })
    return true
  }

  getActiveProfile(): string | null { return this.activeProfile }
  getProfiles(): string[] { return Array.from(this.profiles.keys()) }

  listen(callback: (key: string, value: unknown) => void): this {
    this.listeners.push(callback)
    return this
  }

  unlisten(callback: (key: string, value: unknown) => void): boolean {
    const idx = this.listeners.indexOf(callback)
    if (idx === -1) return false
    this.listeners.splice(idx, 1)
    return true
  }

  exportJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    this.prefs.forEach((p, k) => { result[k] = p.value })
    return result
  }

  importJSON(data: Record<string, unknown>): number {
    let count = 0
    Object.entries(data).forEach(([key, value]) => {
      if (this.set(key, value)) count++
    })
    return count
  }

  getStats(): { total: number; overridden: number; readonly: number; profiles: number } {
    return {
      total: this.prefs.size,
      overridden: this.getOverridden().length,
      readonly: Array.from(this.prefs.values()).filter(p => p.readonly).length,
      profiles: this.profiles.size,
    }
  }

  count(): number { return this.prefs.size }

  toArray(): Preference2[] { return Array.from(this.prefs.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): PreferenceStore2 {
    const ps = new PreferenceStore2()
    this.prefs.forEach((p, k) => ps.prefs.set(k, { ...p }))
    this.profiles.forEach((profile, name) => {
      const m = new Map<string, unknown>()
      profile.forEach((v, k) => m.set(k, v))
      ps.profiles.set(name, m)
    })
    ps.activeProfile = this.activeProfile
    return ps
  }
  equals(other: unknown): boolean {
    if (!(other instanceof PreferenceStore2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.prefs.clear()
    this.profiles.clear()
    this.activeProfile = null
    this.listeners = []
  }
}
