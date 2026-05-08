import type { ModuleManifest, RegistryEntry, ModuleState } from './types.js'

export class ModuleRegistry {
  private entries: Map<string, RegistryEntry> = new Map()

  register(manifest: ModuleManifest): RegistryEntry {
    if (this.entries.has(manifest.id)) {
      throw new Error(`Module '${manifest.id}' is already registered`)
    }

    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/
    if (!semverRegex.test(manifest.version)) {
      throw new Error(`Invalid version format: '${manifest.version}'`)
    }

    const entry: RegistryEntry = {
      manifest,
      registeredAt: new Date(),
      state: 'registered',
    }

    this.entries.set(manifest.id, entry)
    return { ...entry }
  }

  unregister(id: string): boolean {
    return this.entries.delete(id)
  }

  get(id: string): RegistryEntry | undefined {
    const entry = this.entries.get(id)
    if (!entry) return undefined
    return { ...entry }
  }

  has(id: string): boolean {
    return this.entries.has(id)
  }

  list(): RegistryEntry[] {
    return Array.from(this.entries.values()).map((e) => ({ ...e }))
  }

  listByState(state: ModuleState): RegistryEntry[] {
    return Array.from(this.entries.values())
      .filter((e) => e.state === state)
      .map((e) => ({ ...e }))
  }

  updateState(id: string, state: ModuleState, error?: string): void {
    const entry = this.entries.get(id)
    if (entry) {
      entry.state = state
      if (error !== undefined) {
        entry.error = error
      }
    }
  }

  clear(): void {
    this.entries.clear()
  }

  get size(): number {
    return this.entries.size
  }
}
