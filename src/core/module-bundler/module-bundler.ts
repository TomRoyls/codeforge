import type {
  BundleModule,
  BundleChunk,
  BundleOutput,
  BundleConfig,
  BundleWarning,
  BundleStatistics,
} from './types.js'

const DEFAULT_CONFIG: BundleConfig = {
  entrypoints: [],
  chunkSizeLimit: 1000,
  minChunkSize: 0,
  splitting: 'auto',
}

export class ModuleBundler {
  private modules: Map<string, BundleModule> = new Map()
  private config: BundleConfig

  constructor(config?: Partial<BundleConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  addModule(module: BundleModule): boolean {
    if (this.modules.has(module.id)) {
      return false
    }
    this.modules.set(module.id, {
      id: module.id,
      code: module.code,
      dependencies: [...module.dependencies],
      size: module.size,
    })
    return true
  }

  removeModule(id: string): boolean {
    const removed = this.modules.delete(id)
    if (removed) {
      for (const mod of this.modules.values()) {
        const idx = mod.dependencies.indexOf(id)
        if (idx !== -1) {
          mod.dependencies.splice(idx, 1)
        }
      }
    }
    return removed
  }

  getModule(id: string): BundleModule | undefined {
    return this.modules.get(id)
  }

  getModules(): BundleModule[] {
    return [...this.modules.values()]
  }

  bundle(): BundleOutput {
    const entrypoints = this.config.entrypoints.length > 0
      ? this.config.entrypoints
      : [...this.modules.keys()]

    const sorted = this.topologicalSortAll([...this.modules.keys()])
    const chunks = this.config.splitting === 'single'
      ? [this.createChunk(sorted, 'chunk-0')]
      : this.config.splitting === 'eager'
        ? this.eagerSplit()
        : this.splitChunks([...this.modules.keys()])

    const totalSize = chunks.reduce((sum, c) => sum + c.size, 0)

    return {
      chunks,
      entrypoints,
      totalSize,
      modules: new Map(this.modules),
    }
  }

  createChunk(moduleIds: string[], id: string): BundleChunk {
    const chunkModules: string[] = []
    let size = 0
    const depsSet = new Set<string>()

    for (const mid of moduleIds) {
      const mod = this.modules.get(mid)
      if (mod) {
        chunkModules.push(mid)
        size += mod.size
        for (const dep of mod.dependencies) {
          if (!moduleIds.includes(dep)) {
            depsSet.add(dep)
          }
        }
      }
    }

    return {
      id,
      modules: chunkModules,
      size,
      dependencies: [...depsSet],
    }
  }

  splitChunks(moduleIds: string[]): BundleChunk[] {
    if (moduleIds.length === 0) return []

    const limit = this.config.chunkSizeLimit
    const minSize = this.config.minChunkSize
    const chunks: BundleChunk[] = []
    let currentIds: string[] = []
    let currentSize = 0
    let chunkIndex = 0

    const sorted = this.topologicalSortAll(moduleIds)

    for (const id of sorted) {
      const mod = this.modules.get(id)
      if (!mod) continue

      if (currentSize + mod.size > limit && currentIds.length > 0) {
        if (currentSize >= minSize || chunks.length === 0) {
          chunks.push(this.createChunk(currentIds, `chunk-${chunkIndex}`))
          chunkIndex++
          currentIds = []
          currentSize = 0
        }
      }

      currentIds.push(id)
      currentSize += mod.size
    }

    if (currentIds.length > 0) {
      if (currentSize >= minSize || chunks.length === 0) {
        chunks.push(this.createChunk(currentIds, `chunk-${chunkIndex}`))
      } else {
        const lastChunk = chunks[chunks.length - 1]
        if (lastChunk) {
          lastChunk.modules.push(...currentIds)
          for (const cid of currentIds) {
            const m = this.modules.get(cid)
            if (m) lastChunk.size += m.size
          }
          const depsSet = new Set<string>()
          for (const mid of lastChunk.modules) {
            const m = this.modules.get(mid)
            if (m) {
              for (const dep of m.dependencies) {
                if (!lastChunk.modules.includes(dep)) {
                  depsSet.add(dep)
                }
              }
            }
          }
          lastChunk.dependencies = [...depsSet]
        }
      }
    }

    return chunks.length > 0 ? chunks : [this.createChunk(moduleIds, 'chunk-0')]
  }

  resolveOrder(entrypoint: string): string[] {
    const visited = new Set<string>()
    const order: string[] = []

    const visit = (id: string): void => {
      if (visited.has(id)) return
      visited.add(id)
      const mod = this.modules.get(id)
      if (mod) {
        for (const dep of mod.dependencies) {
          visit(dep)
        }
      }
      order.push(id)
    }

    visit(entrypoint)
    return order
  }

  detectCircular(): string[][] {
    const visited = new Set<string>()
    const inStack = new Set<string>()
    const cycles: string[][] = []

    const dfs = (id: string, path: string[]): void => {
      if (inStack.has(id)) {
        const cycleStart = path.indexOf(id)
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), id])
        }
        return
      }
      if (visited.has(id)) return

      visited.add(id)
      inStack.add(id)
      path.push(id)

      const mod = this.modules.get(id)
      if (mod) {
        for (const dep of mod.dependencies) {
          dfs(dep, [...path])
        }
      }

      inStack.delete(id)
    }

    for (const id of this.modules.keys()) {
      dfs(id, [])
    }

    return cycles
  }

  getModuleSize(id: string): number {
    return this.modules.get(id)?.size ?? 0
  }

  getDependencies(id: string): string[] {
    const mod = this.modules.get(id)
    return mod ? [...mod.dependencies] : []
  }

  getDependents(id: string): string[] {
    const dependents: string[] = []
    for (const mod of this.modules.values()) {
      if (mod.dependencies.includes(id)) {
        dependents.push(mod.id)
      }
    }
    return dependents
  }

  getTransitiveDependencies(id: string): string[] {
    const visited = new Set<string>()
    const result: string[] = []

    const traverse = (moduleId: string): void => {
      const mod = this.modules.get(moduleId)
      if (!mod) return

      for (const dep of mod.dependencies) {
        if (!visited.has(dep)) {
          visited.add(dep)
          result.push(dep)
          traverse(dep)
        }
      }
    }

    traverse(id)
    return result
  }

  getUnusedModules(): string[] {
    const entrypoints = this.config.entrypoints.length > 0
      ? this.config.entrypoints
      : [...this.modules.keys()]

    const reachable = new Set<string>()

    for (const entry of entrypoints) {
      const order = this.resolveOrder(entry)
      for (const id of order) {
        reachable.add(id)
      }
    }

    const unused: string[] = []
    for (const id of this.modules.keys()) {
      if (!reachable.has(id)) {
        unused.push(id)
      }
    }
    return unused
  }

  getStatistics(): BundleStatistics {
    const mods = [...this.modules.values()]
    const totalModules = mods.length
    let totalSize = 0
    let maxSize = 0
    let minSize = mods.length > 0 ? mods[0]!.size : 0
    let dependencyCount = 0
    for (let i = 0; i < mods.length; i++) {
      const m = mods[i]!
      totalSize += m.size
      dependencyCount += m.dependencies.length
      if (m.size > maxSize) maxSize = m.size
      if (m.size < minSize) minSize = m.size
    }
    const avgSize = totalModules > 0 ? totalSize / totalModules : 0

    return { totalModules, totalSize, avgSize, maxSize, minSize, dependencyCount }
  }

  validate(): BundleWarning[] {
    const warnings: BundleWarning[] = []

    for (const mod of this.modules.values()) {
      for (const dep of mod.dependencies) {
        if (!this.modules.has(dep)) {
          warnings.push({
            type: 'missing',
            message: `Module "${mod.id}" depends on missing module "${dep}"`,
            module: mod.id,
          })
        }
      }

      if (mod.size > this.config.chunkSizeLimit) {
        warnings.push({
          type: 'oversized',
          message: `Module "${mod.id}" size ${mod.size} exceeds limit ${this.config.chunkSizeLimit}`,
          module: mod.id,
        })
      }
    }

    const cycles = this.detectCircular()
    for (const cycle of cycles) {
      const firstModule = cycle[0] ?? ''
      warnings.push({
        type: 'circular',
        message: `Circular dependency detected: ${cycle.join(' -> ')}`,
        module: firstModule,
      })
    }

    const unused = this.getUnusedModules()
    for (const id of unused) {
      warnings.push({
        type: 'unused',
        message: `Module "${id}" is not reachable from any entrypoint`,
        module: id,
      })
    }

    return warnings
  }

  clear(): void {
    this.modules.clear()
  }

  private topologicalSortAll(moduleIds: string[]): string[] {
    const idSet = new Set(moduleIds)
    const visited = new Set<string>()
    const order: string[] = []

    const visit = (id: string): void => {
      if (visited.has(id) || !idSet.has(id)) return
      visited.add(id)
      const mod = this.modules.get(id)
      if (mod) {
        for (const dep of mod.dependencies) {
          if (idSet.has(dep)) {
            visit(dep)
          }
        }
      }
      order.push(id)
    }

    for (const id of moduleIds) {
      visit(id)
    }

    return order
  }

  private eagerSplit(): BundleChunk[] {
    const chunks: BundleChunk[] = []
    let chunkIndex = 0

    const entrypoints = this.config.entrypoints.length > 0
      ? this.config.entrypoints
      : [...this.modules.keys()]

    const processed = new Set<string>()

    for (const entry of entrypoints) {
      const order = this.resolveOrder(entry)
      const unprocessed = order.filter((id) => !processed.has(id))
      if (unprocessed.length > 0) {
        for (const id of unprocessed) processed.add(id)
        chunks.push(this.createChunk(unprocessed, `chunk-${chunkIndex}`))
        chunkIndex++
      }
    }

    const remaining = [...this.modules.keys()].filter((id) => !processed.has(id))
    if (remaining.length > 0) {
      chunks.push(this.createChunk(remaining, `chunk-${chunkIndex}`))
    }

    return chunks.length > 0 ? chunks : [this.createChunk([...this.modules.keys()], 'chunk-0')]
  }
}
