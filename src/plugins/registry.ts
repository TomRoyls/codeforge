import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Plugin } from './types.js'
import { PluginLoadError } from './types.js'

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
      return JSON.parse(content) as Record<string, unknown>
    } catch (error) {
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
