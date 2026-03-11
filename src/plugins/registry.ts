import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Plugin } from './types.js'
import { PluginLoadError } from './types.js'
import { logger } from '../utils/logger.js'

interface ImportedModule {
  default?: Plugin
  plugin?: Plugin
}

const PLUGIN_PREFIX = 'codeforge-plugin-'
const SCOPED_PLUGIN_PATTERN = /^@[^/]+\/codeforge-plugin-/

export class PluginRegistry {
  private readonly plugins: Map<string, Plugin> = new Map()

  register(plugin: Plugin): void {
    if (!plugin.name) {
      throw new PluginLoadError('unknown', 'Plugin must have a valid name property')
    }

    if (!plugin.version) {
      throw new PluginLoadError(plugin.name, 'Plugin must have a valid version property')
    }

    if (this.plugins.has(plugin.name)) {
      throw new PluginLoadError(plugin.name, `Plugin "${plugin.name}" is already registered`)
    }

    this.plugins.set(plugin.name, plugin)
  }

  unregister(name: string): void {
    if (!this.plugins.has(name)) {
      throw new PluginLoadError(name, `Plugin "${name}" is not registered`)
    }
    this.plugins.delete(name)
  }

  get(name: string): Plugin | undefined {
    return this.plugins.get(name)
  }

  has(name: string): boolean {
    return this.plugins.has(name)
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  getNames(): string[] {
    return Array.from(this.plugins.keys())
  }

  clear(): void {
    this.plugins.clear()
  }

  get size(): number {
    return this.plugins.size
  }

  async discover(workspaceRoot: string): Promise<string[]> {
    const discovered: string[] = []
    const nodeModulesPath = join(workspaceRoot, 'node_modules')

    try {
      const entries = await readdir(nodeModulesPath, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (entry.name.startsWith('@')) {
            const scopePath = join(nodeModulesPath, entry.name)
            const scopedEntries = await readdir(scopePath, { withFileTypes: true })

            for (const scopedEntry of scopedEntries) {
              if (scopedEntry.isDirectory() && scopedEntry.name.startsWith(PLUGIN_PREFIX)) {
                const pluginName = `${entry.name}/${scopedEntry.name}`
                if (!this.has(pluginName)) {
                  discovered.push(pluginName)
                }
              }
            }
          } else if (entry.name.startsWith(PLUGIN_PREFIX)) {
            if (!this.has(entry.name)) {
              discovered.push(entry.name)
            }
          }
        }
      }
    } catch {
      return []
    }

    return discovered
  }

  async discoverAndValidate(workspaceRoot: string): Promise<{
    valid: string[]
    invalid: Array<{ name: string; reason: string }>
  }> {
    const discovered = await this.discover(workspaceRoot)
    const valid: string[] = []
    const invalid: Array<{ name: string; reason: string }> = []

    for (const pluginName of discovered) {
      try {
        const manifest = await this.readPluginManifest(workspaceRoot, pluginName)
        if (this.validatePluginManifest(manifest)) {
          valid.push(pluginName)
        } else {
          invalid.push({ name: pluginName, reason: 'Invalid plugin manifest structure' })
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown error'
        invalid.push({ name: pluginName, reason })
      }
    }

    return { valid, invalid }
  }

  private async readPluginManifest(
    workspaceRoot: string,
    pluginName: string,
  ): Promise<Record<string, unknown>> {
    const nodeModulesPath = join(workspaceRoot, 'node_modules')
    const packagePath = join(nodeModulesPath, pluginName, 'package.json')

    try {
      const content = await readFile(packagePath, 'utf-8')
      try {
        return JSON.parse(content) as Record<string, unknown>
      } catch (jsonError) {
        const message = jsonError instanceof Error ? jsonError.message : 'Unknown error'
        logger.error(`Failed to parse package.json for plugin "${pluginName}": ${message}`)
        throw new PluginLoadError(pluginName, `Invalid JSON in package.json: ${message}`)
      }
    } catch (error) {
      if (error instanceof PluginLoadError) {
        throw error
      }
      throw new PluginLoadError(
        pluginName,
        `Failed to read package.json: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  private validatePluginManifest(manifest: Record<string, unknown>): boolean {
    if (typeof manifest.name !== 'string' || manifest.name.length === 0) {
      return false
    }

    if (typeof manifest.version !== 'string' || manifest.version.length === 0) {
      return false
    }

    if (typeof manifest.main !== 'string' || manifest.main.length === 0) {
      return false
    }

    return true
  }

  /**
   * Dynamically imports and loads a plugin from node_modules
   * @param pluginName - The full name of the plugin (e.g., 'codeforge-plugin-foo' or '@scope/codeforge-plugin-foo')
   * @param workspaceRoot - The workspace root directory containing node_modules
   * @returns The loaded and registered Plugin
   * @throws PluginLoadError if the plugin cannot be loaded or is invalid
   */
  async loadFromNodeModules(pluginName: string, workspaceRoot: string): Promise<Plugin> {
    const existing = this.plugins.get(pluginName)
    if (existing) {
      return existing
    }

    const pluginPath = join(workspaceRoot, 'node_modules', pluginName)

    try {
      const module = (await import(pluginPath)) as ImportedModule
      const plugin = this.extractPluginFromModule(module, pluginName)
      this.validateImportedPlugin(plugin, pluginName)
      this.plugins.set(plugin.name, plugin)

      return plugin
    } catch (error) {
      if (error instanceof PluginLoadError) {
        throw error
      }

      const message = error instanceof Error ? error.message : 'Unknown error during import'
      throw new PluginLoadError(
        pluginName,
        `Failed to load plugin: ${message}`,
        error instanceof Error ? error : undefined,
      )
    }
  }

  private extractPluginFromModule(module: ImportedModule, pluginName: string): Plugin {
    const plugin = module.default ?? module.plugin

    if (!plugin) {
      throw new PluginLoadError(
        pluginName,
        'Plugin module must export a Plugin object as default or as named export "plugin"',
      )
    }

    return plugin
  }

  private validateImportedPlugin(plugin: unknown, pluginName: string): asserts plugin is Plugin {
    if (!plugin || typeof plugin !== 'object') {
      throw new PluginLoadError(pluginName, 'Plugin must be a valid object')
    }

    const p = plugin as Partial<Plugin>

    if (!p.name || typeof p.name !== 'string') {
      throw new PluginLoadError(pluginName, 'Plugin must have a valid "name" property')
    }

    if (!p.version || typeof p.version !== 'string') {
      throw new PluginLoadError(pluginName, 'Plugin must have a valid "version" property')
    }

    // Validate rules if present
    if (p.rules) {
      if (typeof p.rules !== 'object') {
        throw new PluginLoadError(pluginName, 'Plugin "rules" must be an object')
      }

      for (const [ruleName, ruleDef] of Object.entries(p.rules)) {
        if (!ruleDef || typeof ruleDef !== 'object') {
          throw new PluginLoadError(pluginName, `Rule "${ruleName}" must be a valid object`)
        }
        if (!ruleDef.meta) {
          throw new PluginLoadError(pluginName, `Rule "${ruleName}" must have a "meta" property`)
        }
        if (!ruleDef.create || typeof ruleDef.create !== 'function') {
          throw new PluginLoadError(pluginName, `Rule "${ruleName}" must have a "create" function`)
        }
      }
    }

    // Validate transforms if present
    if (p.transforms) {
      if (typeof p.transforms !== 'object') {
        throw new PluginLoadError(pluginName, 'Plugin "transforms" must be an object')
      }

      for (const [transformName, transformDef] of Object.entries(p.transforms)) {
        if (!transformDef || typeof transformDef !== 'object') {
          throw new PluginLoadError(
            pluginName,
            `Transform "${transformName}" must be a valid object`,
          )
        }
        if (!transformDef.transform || typeof transformDef.transform !== 'function') {
          throw new PluginLoadError(
            pluginName,
            `Transform "${transformName}" must have a "transform" function`,
          )
        }
      }
    }
  }
}

export function isPluginName(name: string): boolean {
  return name.startsWith(PLUGIN_PREFIX) || SCOPED_PLUGIN_PATTERN.test(name)
}

export function parsePluginName(fullName: string): { scope: string | null; name: string } {
  if (fullName.startsWith('@')) {
    const [scope, name] = fullName.split('/')
    if (!scope || !name) {
      throw new PluginLoadError(fullName, `Invalid scoped plugin name: ${fullName}`)
    }
    return { scope, name }
  }

  return { scope: null, name: fullName }
}

export const PLUGIN_PATTERNS = {
  prefix: PLUGIN_PREFIX,
  scoped: SCOPED_PLUGIN_PATTERN,
} as const
