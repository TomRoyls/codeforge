import type { ModuleInfo, BundleModule, BundleReport, AnalyzeConfig, TreeShakeOpportunity } from './types.js'
import { DEFAULT_ANALYZE_CONFIG } from './types.js'
import { ModuleAnalyzer } from './module-analyzer.js'
import { sortedByDesc } from '../../utils/array-helpers.js'

export class BundleAnalyzer {
  private config: AnalyzeConfig
  private analyzer: ModuleAnalyzer

  constructor(config?: Partial<AnalyzeConfig>) {
    this.config = { ...DEFAULT_ANALYZE_CONFIG, ...config }
    this.analyzer = new ModuleAnalyzer()
  }

  analyze(modules: Map<string, string>): BundleReport {
    const moduleInfos: ModuleInfo[] = []

    for (const [path, content] of modules) {
      const name = this.extractName(path)
      const info = this.analyzer.analyzeModule(name, content)
      info.path = path
      info.usedExports = this.extractUsedExports(content, moduleInfos)
      moduleInfos.push(info)
    }

    this.propagateUsedExports(moduleInfos)

    const bundleModules = this.computeBundleModules(moduleInfos)
    const treeShakeOpportunities = this.analyzer.findUnusedExports(moduleInfos)
    const duplicateDependencies = this.analyzer.findDuplicates(moduleInfos)
    const largestModules = this.getLargestModules({ ...this.emptyReport(), modules: bundleModules } as BundleReport)

    const filteredModules = this.config.excludeExternals
      ? bundleModules.filter((m) => !m.isExternal)
      : bundleModules

    const totalSize = filteredModules.reduce((sum, m) => sum + m.size, 0)
    const externalCount = bundleModules.reduce((c, m) => m.isExternal ? c + 1 : c, 0)
    const estimatedGzipSize = this.config.gzipEstimate
      ? this.analyzer.estimateGzipSize(totalSize)
      : 0

    return {
      totalSize,
      moduleCount: filteredModules.length,
      externalCount,
      modules: filteredModules,
      treeShakeOpportunities,
      duplicateDependencies,
      largestModules,
      estimatedGzipSize,
    }
  }

  getLargestModules(report: BundleReport, count: number = 5): BundleModule[] {
    return sortedByDesc([...report.modules], m => m.size)
      .slice(0, count)
  }

  getTreeShakeReport(report: BundleReport): TreeShakeOpportunity[] {
    return [...report.treeShakeOpportunities].sort(
      (a, b) => b.potentialSavings - a.potentialSavings,
    )
  }

  getDependencyChains(report: BundleReport): Map<string, string[]> {
    const chains = new Map<string, string[]>()

    for (const mod of report.modules) {
      const chain = this.resolveChain(mod, report.modules, new Set<string>())
      chains.set(mod.path, chain)
    }

    return chains
  }

  getConfig(): AnalyzeConfig {
    return { ...this.config }
  }

  private resolveChain(mod: BundleModule, allModules: BundleModule[], visited: Set<string>): string[] {
    if (visited.has(mod.path)) {
      return []
    }
    visited.add(mod.path)

    const chain: string[] = [mod.path]
    for (const dep of mod.dependencies) {
      const depMod = allModules.find((m) => m.path === dep || m.name === dep)
      if (depMod) {
        const subChain = this.resolveChain(depMod, allModules, visited)
        chain.push(...subChain)
      }
    }

    return chain
  }

  private computeBundleModules(moduleInfos: ModuleInfo[]): BundleModule[] {
    const entryPath = this.config.entryPoint
    const depthMap = this.computeDepths(moduleInfos, entryPath)
    const importedSet = this.computeImported(moduleInfos, entryPath)

    return moduleInfos.map((info) => {
      const depth = depthMap.get(info.path) ?? this.config.maxDepth
      const clampedDepth = Math.min(depth, this.config.maxDepth)
      const cost = this.computeCost(info, clampedDepth)

      return {
        name: info.name,
        path: info.path,
        size: info.size,
        dependencies: info.dependencies,
        exports: info.exports,
        usedExports: info.usedExports,
        isExternal: info.isExternal,
        imported: importedSet.has(info.path),
        depth: clampedDepth,
        cost,
      }
    })
  }

  private computeDepths(moduleInfos: ModuleInfo[], entryPath: string): Map<string, number> {
    const depthMap = new Map<string, number>()
    const pathToInfo = new Map<string, ModuleInfo>()
    for (const info of moduleInfos) {
      pathToInfo.set(info.path, info)
    }

    if (entryPath === '') {
      for (const info of moduleInfos) {
        depthMap.set(info.path, 0)
      }
      return depthMap
    }

    const queue: Array<{ path: string; depth: number }> = [{ path: entryPath, depth: 0 }]
    const visited = new Set<string>()
    let _qi = 0

    while (_qi < queue.length) {
      const item = queue[_qi++]!
      if (visited.has(item.path)) continue
      visited.add(item.path)
      depthMap.set(item.path, item.depth)

      const info = pathToInfo.get(item.path)
      if (info) {
        for (const dep of info.dependencies) {
          const depPath = this.resolveDepPath(dep, moduleInfos, item.path)
          if (depPath && !visited.has(depPath)) {
            queue.push({ path: depPath, depth: item.depth + 1 })
          }
        }
      }
    }

    for (const info of moduleInfos) {
      if (!depthMap.has(info.path)) {
        depthMap.set(info.path, this.config.maxDepth)
      }
    }

    return depthMap
  }

  private resolveDepPath(dep: string, moduleInfos: ModuleInfo[], fromPath?: string): string | undefined {
    if (fromPath && (dep.startsWith('./') || dep.startsWith('../'))) {
      const slashIdx = fromPath.lastIndexOf('/')
      const dir = slashIdx >= 0 ? fromPath.substring(0, slashIdx) : ''
      const resolved = this.normalizePath(dir ? `${dir}/${dep}` : dep.substring(2))
      for (const info of moduleInfos) {
        const moduleBase = info.path.replace(/\.[^/.]+$/, '')
        if (moduleBase === resolved) {
          return info.path
        }
      }
    }
    for (const info of moduleInfos) {
      if (info.path === dep || info.name === dep) {
        return info.path
      }
    }
    return undefined
  }

  private normalizePath(p: string): string {
    const parts = p.split('/')
    const result: string[] = []
    for (const part of parts) {
      if (part === '..') {
        result.pop()
      } else if (part !== '.') {
        result.push(part)
      }
    }
    return result.join('/')
  }

  private computeImported(moduleInfos: ModuleInfo[], entryPath: string): Set<string> {
    const imported = new Set<string>()
    if (entryPath === '') {
      for (const info of moduleInfos) {
        imported.add(info.path)
      }
      return imported
    }

    const pathToInfo = new Map<string, ModuleInfo>()
    for (const info of moduleInfos) {
      pathToInfo.set(info.path, info)
    }

    const stack = [entryPath]
    while (stack.length > 0) {
      const current = stack.pop()!
      if (imported.has(current)) continue
      imported.add(current)

      const info = pathToInfo.get(current)
      if (info) {
        for (const dep of info.dependencies) {
          const depPath = this.resolveDepPath(dep, moduleInfos, current)
          if (depPath && !imported.has(depPath)) {
            stack.push(depPath)
          }
        }
      }
    }

    return imported
  }

  private computeCost(info: ModuleInfo, depth: number): number {
    if (depth === 0) return info.size
    return Math.round(info.size / depth)
  }

  private extractName(path: string): string {
    const parts = path.split('/')
    const last = parts[parts.length - 1] ?? path
    return last.replace(/\.[^/.]+$/, '')
  }

  private extractUsedExports(content: string, _existingModules: ModuleInfo[]): string[] {
    const used: string[] = []
    const namedImportRegex = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g
    let match: RegExpExecArray | null
    while ((match = namedImportRegex.exec(content)) !== null) {
      if (match[1]) {
        const names = match[1].split(',').map((s: string) => s.trim().split(/\s+as\s+/)[0]!.trim()).filter(Boolean)
        used.push(...names)
      }
    }
    return used
  }

  private propagateUsedExports(moduleInfos: ModuleInfo[]): void {
    const pathToInfo = new Map<string, ModuleInfo>()
    for (const info of moduleInfos) {
      pathToInfo.set(info.path, info)
    }

    for (const info of moduleInfos) {
      for (const dep of info.dependencies) {
        const depInfo = pathToInfo.get(dep)
        if (!depInfo) {
          const byName = moduleInfos.find((m) => m.name === dep)
          if (byName) {
            for (const exp of byName.exports) {
              if (!byName.usedExports.includes(exp)) {
                byName.usedExports.push(exp)
              }
            }
          }
        } else {
          for (const exp of depInfo.exports) {
            if (!depInfo.usedExports.includes(exp)) {
              depInfo.usedExports.push(exp)
            }
          }
        }
      }
    }
  }

  private emptyReport(): Omit<BundleReport, 'modules'> {
    return {
      totalSize: 0,
      moduleCount: 0,
      externalCount: 0,
      treeShakeOpportunities: [],
      duplicateDependencies: [],
      largestModules: [],
      estimatedGzipSize: 0,
    }
  }
}
