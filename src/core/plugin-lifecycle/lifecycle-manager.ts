import type { InstallOptions, InstallResult, PluginEvent, PluginInfo, PluginState } from './types.js'
import { PluginRegistry } from './plugin-registry.js'
import { VersionResolver } from './version-resolver.js'

export class LifecycleManager {
  private registry: PluginRegistry
  private versionResolver: VersionResolver
  private eventLog: PluginEvent[] = []
  private pluginStore: Map<string, PluginInfo> = new Map()

  constructor(registry?: PluginRegistry, versionResolver?: VersionResolver) {
    this.registry = registry ?? new PluginRegistry()
    this.versionResolver = versionResolver ?? new VersionResolver()
  }

  install(name: string, options: InstallOptions): InstallResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (this.registry.exists(name) && !options.force) {
      errors.push(`Plugin "${name}" is already installed. Use force option to reinstall.`)
      this.logEvent('error', name, 'Install failed: already exists')
      return { success: false, errors, warnings }
    }

    if (this.registry.exists(name) && options.force) {
      this.registry.unregister(name)
      this.pluginStore.delete(name)
    }

    const now = Date.now()
    const version = options.version ?? '1.0.0'

    const plugin: PluginInfo = {
      name,
      version,
      description: `Plugin ${name}`,
      author: 'unknown',
      dependencies: new Map(),
      entryPoint: `./plugins/${name}/index.js`,
      license: 'MIT',
      installedAt: now,
      updatedAt: now,
      state: 'installed',
    }

    this.pluginStore.set(name, plugin)
    const registered = this.registry.register(plugin)
    if (!registered) {
      errors.push(`Failed to register plugin "${name}".`)
      this.logEvent('error', name, 'Registration failed')
      return { success: false, errors, warnings }
    }

    if (!options.peerDeps) {
      warnings.push('Peer dependencies were not installed. Some functionality may be limited.')
    }

    this.logEvent('install', name, `Installed plugin "${name}" at version ${version}`)
    return { success: true, plugin, errors, warnings }
  }

  uninstall(name: string): InstallResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!this.registry.exists(name)) {
      errors.push(`Plugin "${name}" is not installed.`)
      this.logEvent('error', name, 'Uninstall failed: not found')
      return { success: false, errors, warnings }
    }

    const dependents = this.getDependents(name)
    if (dependents.length > 0) {
      errors.push(`Cannot uninstall "${name}": plugins [${dependents.join(', ')}] depend on it.`)
      this.logEvent('error', name, `Uninstall failed: depended on by [${dependents.join(', ')}]`)
      return { success: false, errors, warnings }
    }

    this.registry.unregister(name)
    this.pluginStore.delete(name)
    this.logEvent('uninstall', name, `Uninstalled plugin "${name}"`)
    return { success: true, errors, warnings }
  }

  enable(name: string): boolean {
    const entry = this.registry.get(name)
    if (!entry) return false

    if (entry.plugin.state === 'error') {
      return false
    }

    const deps = this.getDependencies(name)
    for (const dep of deps) {
      const depEntry = this.registry.get(dep)
      if (!depEntry || !depEntry.enabled) {
        this.logEvent('error', name, `Enable failed: dependency "${dep}" not enabled`)
        return false
      }
    }

    entry.enabled = true
    entry.plugin = { ...entry.plugin, state: 'enabled' }
    this.registry.updatePlugin(name, entry.plugin)
    this.registry.updateEntry(name, { enabled: true })
    this.logEvent('enable', name, `Enabled plugin "${name}"`)
    return true
  }

  disable(name: string): boolean {
    const entry = this.registry.get(name)
    if (!entry) return false

    entry.enabled = false
    entry.plugin = { ...entry.plugin, state: 'disabled' }
    this.registry.updatePlugin(name, entry.plugin)
    this.registry.updateEntry(name, { enabled: false })
    this.logEvent('disable', name, `Disabled plugin "${name}"`)
    return true
  }

  update(name: string, targetVersion?: string): InstallResult {
    const errors: string[] = []
    const warnings: string[] = []

    const entry = this.registry.get(name)
    if (!entry) {
      errors.push(`Plugin "${name}" is not installed.`)
      this.logEvent('error', name, 'Update failed: not found')
      return { success: false, errors, warnings }
    }

    const newVersion = targetVersion ?? this.incrementVersion(entry.plugin.version)
    const updatedPlugin: PluginInfo = {
      ...entry.plugin,
      version: newVersion,
      updatedAt: Date.now(),
    }

    this.registry.updatePlugin(name, updatedPlugin)
    this.pluginStore.set(name, updatedPlugin)
    this.logEvent('update', name, `Updated plugin "${name}" to version ${newVersion}`)
    return { success: true, plugin: updatedPlugin, errors, warnings }
  }

  getState(name: string): PluginState {
    const entry = this.registry.get(name)
    if (!entry) return 'pending'
    return entry.plugin.state
  }

  getDependencies(name: string): string[] {
    const entry = this.registry.get(name)
    if (!entry) return []
    return Array.from(entry.plugin.dependencies.keys())
  }

  getDependents(name: string): string[] {
    const dependents: string[] = []
    for (const entry of this.registry.getAll()) {
      if (entry.plugin.dependencies.has(name)) {
        dependents.push(entry.plugin.name)
      }
    }
    return dependents
  }

  getEventLog(): PluginEvent[] {
    return [...this.eventLog]
  }

  getLoadOrder(): string[] {
    return this.registry
      .getAll()
      .filter(e => e.enabled)
      .sort((a, b) => a.loadOrder - b.loadOrder)
      .map(e => e.plugin.name)
  }

  validate(name: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const entry = this.registry.get(name)

    if (!entry) {
      return { valid: false, errors: [`Plugin "${name}" not found.`] }
    }

    const plugin = entry.plugin

    if (!plugin.name || plugin.name.trim().length === 0) {
      errors.push('Plugin name is empty.')
    }

    if (!plugin.version || plugin.version.trim().length === 0) {
      errors.push('Plugin version is empty.')
    }

    if (!plugin.entryPoint || plugin.entryPoint.trim().length === 0) {
      errors.push('Plugin entry point is empty.')
    }

    if (!plugin.license || plugin.license.trim().length === 0) {
      errors.push('Plugin license is empty.')
    }

    const semverPattern = /^\d+\.\d+\.\d+/
    if (plugin.version && !semverPattern.test(plugin.version)) {
      errors.push(`Plugin version "${plugin.version}" is not a valid semver.`)
    }

    for (const [depName, depVersion] of plugin.dependencies) {
      if (!depName || depName.trim().length === 0) {
        errors.push('Dependency name is empty.')
      }
      if (!depVersion || depVersion.trim().length === 0) {
        errors.push(`Dependency "${depName}" has empty version.`)
      }
    }

    return { valid: errors.length === 0, errors }
  }

  getRegistry(): PluginRegistry {
    return this.registry
  }

  getVersionResolver(): VersionResolver {
    return this.versionResolver
  }

  private logEvent(type: PluginEvent['type'], pluginName: string, details: string): void {
    this.eventLog.push({
      type,
      pluginName,
      timestamp: Date.now(),
      details,
    })
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.')
    if (parts.length < 3) return version
    const patch = parseInt(parts[2] ?? '0', 10) + 1
    return `${parts[0]}.${parts[1]}.${patch}`
  }
}
