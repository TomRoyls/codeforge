import type { PluginManifest, ResolutionResult } from './version-types.js'
import { parseConstraint, parseSemVer, satisfiesConstraint } from './version-checker.js'

export class DependencyResolver {
  private plugins = new Map<string, PluginManifest>()

  addPlugin(manifest: PluginManifest): void {
    this.plugins.set(manifest.name, manifest)
  }

  removePlugin(name: string): void {
    this.plugins.delete(name)
  }

  hasPlugin(name: string): boolean {
    return this.plugins.has(name)
  }

  getPlugin(name: string): PluginManifest | undefined {
    return this.plugins.get(name)
  }

  getAllPlugins(): PluginManifest[] {
    return [...this.plugins.values()]
  }

  resolve(rootPlugins: string[]): ResolutionResult {
    const resolved = new Map<string, PluginManifest>()
    const conflicts: Array<{ plugin: string; constraint1: string; constraint2: string }> = []
    const missing: Array<{ plugin: string; requiredBy: string; constraint: string }> = []
    const constraintMap = new Map<string, Array<{ constraint: string; from: string }>>()
    const visited = new Set<string>()
    const inStack = new Set<string>()

    const visit = (name: string, constraintStr: string, from: string): void => {
      if (inStack.has(name)) return

      if (!constraintMap.has(name)) constraintMap.set(name, [])
      constraintMap.get(name)!.push({ constraint: constraintStr, from })

      const plugin = this.plugins.get(name)
      if (!plugin) {
        missing.push({ plugin: name, requiredBy: from, constraint: constraintStr })
        return
      }

      const existing = resolved.get(name)
      if (existing) {
        const ver = parseSemVer(plugin.version)
        const allConstraints = constraintMap.get(name)!
        for (const entry of allConstraints) {
          const c = parseConstraint(entry.constraint)
          if (ver && !satisfiesConstraint(ver, c)) {
            const already = conflicts.some(
              (cf) =>
                cf.plugin === name &&
                (cf.constraint1 === entry.constraint || cf.constraint2 === entry.constraint),
            )
            if (!already) {
              const prev = allConstraints.find((e) => e.from !== entry.from)
              conflicts.push({
                plugin: name,
                constraint1: entry.constraint,
                constraint2: prev?.constraint ?? entry.constraint,
              })
            }
          }
        }
        return
      }

      resolved.set(name, plugin)
      visited.add(name)
      inStack.add(name)

      const deps = plugin.dependencies ?? {}
      for (const [depName, depConstraint] of Object.entries(deps)) {
        visit(depName, depConstraint, name)
      }

      inStack.delete(name)
    }

    for (const root of rootPlugins) {
      const plugin = this.plugins.get(root)
      if (plugin) {
        resolved.set(root, plugin)
        visited.add(root)
        inStack.add(root)

        const deps = plugin.dependencies ?? {}
        for (const [depName, depConstraint] of Object.entries(deps)) {
          visit(depName, depConstraint, root)
        }

        inStack.delete(root)
      } else {
        missing.push({ plugin: root, requiredBy: '<root>', constraint: '*' })
      }
    }

    return {
      resolved,
      conflicts,
      missing,
      valid: conflicts.length === 0 && missing.length === 0,
    }
  }

  getDependencyOrder(pluginName: string): string[] {
    const result: string[] = []
    const visited = new Set<string>()
    const inStack = new Set<string>()

    const visit = (name: string): void => {
      if (visited.has(name)) return
      if (inStack.has(name)) return

      inStack.add(name)
      const plugin = this.plugins.get(name)
      if (plugin) {
        const deps = plugin.dependencies ?? {}
        for (const depName of Object.keys(deps)) {
          visit(depName)
        }
      }
      inStack.delete(name)
      visited.add(name)
      result.push(name)
    }

    visit(pluginName)
    return result
  }

  detectConflicts(): Array<{ plugin: string; constraint1: string; constraint2: string }> {
    const conflicts: Array<{ plugin: string; constraint1: string; constraint2: string }> = []

    const allConstraints = new Map<string, Array<{ constraint: string; from: string }>>()

    for (const plugin of this.plugins.values()) {
      const deps = plugin.dependencies ?? {}
      for (const [depName, depConstraint] of Object.entries(deps)) {
        if (!allConstraints.has(depName)) allConstraints.set(depName, [])
        allConstraints.get(depName)!.push({ constraint: depConstraint, from: plugin.name })
      }
    }

    for (const [depName, entries] of allConstraints) {
      if (entries.length < 2) continue

      const dep = this.plugins.get(depName)
      if (!dep) continue

      const ver = parseSemVer(dep.version)
      if (!ver) continue

      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const a = entries[i]!
          const b = entries[j]!
          const ca = parseConstraint(a.constraint)
          const cb = parseConstraint(b.constraint)

          const aSat = satisfiesConstraint(ver, ca)
          const bSat = satisfiesConstraint(ver, cb)

          if (!aSat || !bSat) {
            conflicts.push({
              plugin: depName,
              constraint1: a.constraint,
              constraint2: b.constraint,
            })
          }
        }
      }
    }

    return conflicts
  }
}
