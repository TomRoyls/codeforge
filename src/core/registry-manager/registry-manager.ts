import type { ModuleManifest, RegistryEntry, RegistryConfig, ResolveResult, ModuleState } from './types.js'
import { DEFAULT_REGISTRY_CONFIG } from './types.js'
import { ModuleRegistry } from './module-registry.js'

export class RegistryManager {
  private config: RegistryConfig
  private registry: ModuleRegistry

  constructor(config: Partial<RegistryConfig> = {}) {
    this.config = { ...DEFAULT_REGISTRY_CONFIG, ...config }
    this.registry = new ModuleRegistry()
  }

  register(manifest: ModuleManifest): RegistryEntry {
    if (this.config.validateOnRegister) {
      const errors = this.validate(manifest)
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`)
      }
    }

    if (this.registry.size >= this.config.maxModules) {
      throw new Error(`Maximum module limit (${this.config.maxModules}) reached`)
    }

    return this.registry.register(manifest)
  }

  unregister(id: string): boolean {
    return this.registry.unregister(id)
  }

  resolve(id: string): ResolveResult {
    const entry = this.registry.get(id)
    if (!entry) {
      return { resolved: false, missingDeps: [], resolvedOrder: [] }
    }

    const visited = new Set<string>()
    const resolvedOrder: string[] = []
    const missingDeps: string[] = []
    const inStack = new Set<string>()

    const visit = (moduleId: string): boolean => {
      if (visited.has(moduleId)) return true
      if (inStack.has(moduleId)) return false

      inStack.add(moduleId)

      const mod = this.registry.get(moduleId)
      if (!mod) {
        if (!missingDeps.includes(moduleId)) {
          missingDeps.push(moduleId)
        }
        inStack.delete(moduleId)
        return false
      }

      let allDepsResolved = true
      for (const dep of mod.manifest.dependencies) {
        const depVisit = visit(dep)
        if (!depVisit) {
          allDepsResolved = false
        }
      }

      if (!allDepsResolved) {
        inStack.delete(moduleId)
        return false
      }

      inStack.delete(moduleId)
      visited.add(moduleId)
      resolvedOrder.push(moduleId)
      this.registry.updateState(moduleId, 'resolved')

      return true
    }

    const success = visit(id)
    return {
      resolved: success,
      missingDeps,
      resolvedOrder,
    }
  }

  resolveAll(): Map<string, ResolveResult> {
    const results = new Map<string, ResolveResult>()
    const entries = this.registry.list()

    for (const entry of entries) {
      const result = this.resolve(entry.manifest.id)
      results.set(entry.manifest.id, result)
    }

    return results
  }

  get(id: string): RegistryEntry | undefined {
    return this.registry.get(id)
  }

  list(): RegistryEntry[] {
    return this.registry.list()
  }

  listByState(state: ModuleState): RegistryEntry[] {
    return this.registry.listByState(state)
  }

  getDependencyGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>()
    const entries = this.registry.list()

    for (const entry of entries) {
      graph.set(entry.manifest.id, [...entry.manifest.dependencies])
    }

    return graph
  }

  getDependents(id: string): string[] {
    const dependents: string[] = []
    const entries = this.registry.list()

    for (const entry of entries) {
      if (entry.manifest.dependencies.includes(id)) {
        dependents.push(entry.manifest.id)
      }
    }

    return dependents
  }

  validate(manifest: ModuleManifest): string[] {
    const errors: string[] = []

    if (!manifest.id || manifest.id.trim().length === 0) {
      errors.push('Module id is required')
    } else {
      const idRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/
      if (!idRegex.test(manifest.id)) {
        errors.push('Module id must start with a letter and contain only letters, numbers, hyphens, and underscores')
      }
    }

    if (!manifest.name || manifest.name.trim().length === 0) {
      errors.push('Module name is required')
    }

    if (!manifest.version || manifest.version.trim().length === 0) {
      errors.push('Module version is required')
    } else {
      const basicSemverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/
      if (this.config.strictSemver) {
        const strictSemverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-((0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(\+([0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*))?$/
        if (!strictSemverRegex.test(manifest.version)) {
          errors.push('Module version must follow strict semver format')
        }
      } else if (!basicSemverRegex.test(manifest.version)) {
        errors.push('Module version must follow semver format (e.g., 1.0.0)')
      }
    }

    if (!manifest.description || manifest.description.trim().length === 0) {
      errors.push('Module description is required')
    }

    if (!manifest.author || manifest.author.trim().length === 0) {
      errors.push('Module author is required')
    }

    if (!manifest.license || manifest.license.trim().length === 0) {
      errors.push('Module license is required')
    }

    if (!manifest.main || manifest.main.trim().length === 0) {
      errors.push('Module main entry point is required')
    }

    if (!Array.isArray(manifest.dependencies)) {
      errors.push('Module dependencies must be an array')
    }

    if (!Array.isArray(manifest.exports)) {
      errors.push('Module exports must be an array')
    }

    return errors
  }

  getConfig(): RegistryConfig {
    return { ...this.config }
  }
}
