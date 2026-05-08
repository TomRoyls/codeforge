import type {
  ImportGraph,
  CrossFileIssue,
  CouplingMetrics,
  ImpactAnalysis,
  ReExportChain,
  CrossFileAnalysisResult,
} from './types.js'

export class CrossFileAnalyzer {
  analyze(graph: ImportGraph): CrossFileAnalysisResult {
    const deadModules = this.findDeadModules(graph)
    const unusedExports = this.findUnusedExports(graph)
    const reExportChains = this.findReExportChains(graph)
    const barrelBloat = this.findBarrelBloat(graph)
    const deepImports = this.findDeepImports(graph)
    const couplingMetrics = this.calculateCouplingMetrics(graph)

    const issues: CrossFileIssue[] = [
      ...unusedExports,
      ...barrelBloat,
      ...deepImports,
    ]

    for (const mod of deadModules) {
      issues.push({
        type: 'dead-module',
        severity: 'warning',
        filePath: mod,
        message: `Module "${mod}" is not reachable from any entry point`,
        details: { filePath: mod },
        suggestion: 'Consider removing this module or adding it as an entry point',
      })
    }

    for (const chain of reExportChains) {
      issues.push({
        type: 're-export-chain',
        severity: 'info',
        filePath: chain.target,
        message: `Re-export chain from "${chain.source}" through ${chain.intermediaries.length} intermediary module(s)`,
        details: {
          source: chain.source,
          intermediaries: chain.intermediaries,
          chainLength: chain.chainLength,
        },
        suggestion: 'Consider importing directly from the source module',
      })
    }

    const totalImports = this.countTotalImports(graph)
    const totalExports = this.countTotalExports(graph)
    const averageCoupling =
      couplingMetrics.length > 0
        ? couplingMetrics.reduce((sum, m) => sum + m.afferentCoupling + m.efferentCoupling, 0) /
          couplingMetrics.length
        : 0

    return {
      graph,
      issues,
      couplingMetrics,
      orphanModules: deadModules,
      summary: {
        totalModules: graph.modules.size,
        totalImports,
        totalExports,
        averageCoupling,
        issueCount: issues.length,
        orphanCount: deadModules.length,
      },
    }
  }

  findDeadModules(graph: ImportGraph): string[] {
    const entryPoints: string[] = []
    for (const [, mod] of graph.modules) {
      if (mod.isEntryPoint) {
        entryPoints.push(mod.filePath)
      }
    }

    if (entryPoints.length === 0) {
      return []
    }

    const adjList = this.buildAdjacencyList(graph)

    const visited = new Set<string>()
    const queue = [...entryPoints]

    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)

      const neighbors = adjList.get(current)
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor)
          }
        }
      }
    }

    const dead: string[] = []
    for (const [filePath] of graph.modules) {
      if (!visited.has(filePath)) {
        dead.push(filePath)
      }
    }

    return dead
  }

  findUnusedExports(graph: ImportGraph): CrossFileIssue[] {
    const issues: CrossFileIssue[] = []
    const importedNames = new Set<string>()

    for (const [, module] of graph.modules) {
      for (const imp of module.imports) {
        if (imp.name && imp.name !== '*') {
          const names = imp.name.split(',').map((n) => n.trim())
          for (const name of names) {
            if (name) importedNames.add(name)
          }
        }
      }
    }

    for (const [filePath, module] of graph.modules) {
      for (const exp of module.exports) {
        if (exp.isReExport) continue
        if (exp.name === '*') continue
        if (!importedNames.has(exp.name)) {
          issues.push({
            type: 'unused-export',
            severity: 'warning',
            filePath,
            message: `Export "${exp.name}" is never imported by any module`,
            details: { exportName: exp.name, kind: exp.kind, isDefault: exp.isDefault },
            suggestion: 'Consider removing this export if it is not needed',
          })
        }
      }
    }

    return issues
  }

  findReExportChains(graph: ImportGraph): ReExportChain[] {
    const chains: ReExportChain[] = []

    for (const [filePath, module] of graph.modules) {
      for (const exp of module.exports) {
        if (exp.isReExport && exp.reExportFrom) {
          const sourceChain = this.traceReExportSource(graph, exp.reExportFrom, [filePath])
          if (sourceChain && sourceChain.intermediaries.length >= 1) {
            chains.push(sourceChain)
          }
        }
      }
    }

    return chains
  }

  private traceReExportSource(
    graph: ImportGraph,
    currentModule: string,
    visited: string[],
  ): ReExportChain | null {
    const module = graph.modules.get(currentModule)
    if (!module) {
      const resolved = this.findModuleByImportPath(graph, visited[visited.length - 1] ?? '', currentModule)
      if (resolved) {
        const resolvedModule = graph.modules.get(resolved)
        if (resolvedModule) {
          return this.traceReExportSourceFromModule(graph, { filePath: resolved, exports: resolvedModule.exports }, visited)
        }
      }
      return {
        source: currentModule,
        target: visited[0]!,
        intermediaries: visited.slice(1),
        chainLength: visited.length,
      }
    }

    return this.traceReExportSourceFromModule(graph, module, visited)
  }

  private traceReExportSourceFromModule(
    graph: ImportGraph,
    module: { filePath: string; exports: Array<{ isReExport: boolean; reExportFrom?: string }> },
    visited: string[],
  ): ReExportChain | null {
    const reExports = module.exports.filter((e) => e.isReExport)
    if (reExports.length === 0) {
      return {
        source: module.filePath,
        target: visited[0]!,
        intermediaries: visited.slice(1),
        chainLength: visited.length,
      }
    }

    if (visited.includes(module.filePath)) {
      return null
    }

    const chains: ReExportChain[] = []
    for (const exp of reExports) {
      if (exp.reExportFrom) {
        const chain = this.traceReExportSource(graph, exp.reExportFrom, [...visited, module.filePath])
        if (chain) {
          chains.push(chain)
        }
      }
    }

    return chains.length > 0 ? chains[0]! : null
  }

  findBarrelBloat(graph: ImportGraph, threshold: number = 20): CrossFileIssue[] {
    const issues: CrossFileIssue[] = []

    for (const [filePath, module] of graph.modules) {
      if (module.isBarrel) {
        const reExportCount = module.exports.filter((e) => e.isReExport).length
        if (reExportCount > threshold) {
          issues.push({
            type: 'barrel-bloat',
            severity: 'warning',
            filePath,
            message: `Barrel file re-exports ${reExportCount} modules (threshold: ${threshold})`,
            details: { reExportCount, threshold },
            suggestion: 'Consider splitting this barrel file into smaller, more focused modules',
          })
        }
      }
    }

    return issues
  }

  findDeepImports(graph: ImportGraph, maxDepth: number = 3): CrossFileIssue[] {
    const issues: CrossFileIssue[] = []

    for (const [filePath, module] of graph.modules) {
      for (const imp of module.imports) {
        if (!this.isRelativeImport(imp.fromModule)) continue

        const segmentCount = imp.fromModule.split('/').filter((s) => s.length > 0).length
        if (segmentCount > maxDepth) {
          issues.push({
            type: 'deep-import',
            severity: 'info',
            filePath,
            message: `Deep import from "${imp.fromModule}" (${segmentCount} path segments, max: ${maxDepth})`,
            details: { importPath: imp.fromModule, segmentCount, maxDepth, line: imp.line },
            suggestion: 'Consider importing from a barrel file closer to the module root',
          })
        }
      }
    }

    return issues
  }

  calculateCouplingMetrics(graph: ImportGraph): CouplingMetrics[] {
    const metrics: CouplingMetrics[] = []

    for (const [filePath, module] of graph.modules) {
      const afferentCoupling = module.dependents.size
      const efferentCoupling = module.dependencies.size
      const total = afferentCoupling + efferentCoupling
      const instability = total > 0 ? efferentCoupling / total : 0

      const abstractExports = module.exports.filter(
        (e) => e.kind === 'interface' || e.kind === 'type',
      ).length
      const totalExports = module.exports.filter((e) => !e.isReExport).length
      const abstractness = totalExports > 0 ? abstractExports / totalExports : 0

      const distance = Math.abs(abstractness + instability - 1)

      metrics.push({
        filePath,
        afferentCoupling,
        efferentCoupling,
        instability,
        abstractness,
        distance,
      })
    }

    return metrics
  }

  analyzeImpact(graph: ImportGraph, filePath: string): ImpactAnalysis {
    const directlyAffected = this.getDirectDependents(graph, filePath)
    const transitivelyAffected = this.getTransitiveDependents(graph, directlyAffected)
    const allAffected = new Set([...directlyAffected, ...transitivelyAffected])

    const changedModule = graph.modules.get(filePath)
    const affectedExports: string[] = []

    if (changedModule) {
      for (const exp of changedModule.exports) {
        if (exp.isReExport) continue
        for (const affectedPath of allAffected) {
          const affectedModule = graph.modules.get(affectedPath)
          if (affectedModule) {
            for (const imp of affectedModule.imports) {
              const impResolved = this.findModuleByImportPath(graph, affectedPath, imp.fromModule)
              if (impResolved === filePath && imp.name) {
                const names = imp.name.split(',').map((n) => n.trim())
                if (names.includes(exp.name)) {
                  affectedExports.push(exp.name)
                }
              }
            }
          }
        }
      }
    }

    return {
      changedFile: filePath,
      directlyAffected,
      transitivelyAffected,
      totalAffected: allAffected.size,
      affectedExports: [...new Set(affectedExports)],
    }
  }

  formatReport(result: CrossFileAnalysisResult): string {
    const lines: string[] = []

    lines.push('=== Cross-File Analysis Report ===')
    lines.push('')
    lines.push('--- Summary ---')
    lines.push(`Total modules: ${result.summary.totalModules}`)
    lines.push(`Total imports: ${result.summary.totalImports}`)
    lines.push(`Total exports: ${result.summary.totalExports}`)
    lines.push(`Average coupling: ${result.summary.averageCoupling.toFixed(2)}`)
    lines.push(`Issues found: ${result.summary.issueCount}`)
    lines.push(`Orphan modules: ${result.summary.orphanCount}`)
    lines.push('')

    if (result.issues.length > 0) {
      const grouped = new Map<string, CrossFileIssue[]>()
      for (const issue of result.issues) {
        const existing = grouped.get(issue.type)
        if (existing) {
          existing.push(issue)
        } else {
          grouped.set(issue.type, [issue])
        }
      }

      lines.push('--- Issues ---')
      for (const [type, issues] of grouped) {
        lines.push('')
        lines.push(`[${type}] (${issues.length} issue(s))`)
        for (const issue of issues) {
          lines.push(`  ${issue.severity.toUpperCase()}: ${issue.message}`)
          lines.push(`    File: ${issue.filePath}`)
          if (issue.suggestion) {
            lines.push(`    Suggestion: ${issue.suggestion}`)
          }
        }
      }
      lines.push('')
    }

    const sortedMetrics = [...result.couplingMetrics].sort(
      (a, b) => b.afferentCoupling + b.efferentCoupling - (a.afferentCoupling + a.efferentCoupling),
    )

    if (sortedMetrics.length > 0) {
      lines.push('--- Top 10 Most Coupled Modules ---')
      const top10 = sortedMetrics.slice(0, 10)
      for (const metric of top10) {
        lines.push(
          `  ${metric.filePath}: afferent=${metric.afferentCoupling}, efferent=${metric.efferentCoupling}, instability=${metric.instability.toFixed(2)}, abstractness=${metric.abstractness.toFixed(2)}`,
        )
      }
      lines.push('')
    }

    if (result.orphanModules.length > 0) {
      lines.push('--- Orphan Modules ---')
      for (const mod of result.orphanModules) {
        lines.push(`  ${mod}`)
      }
      lines.push('')
    }

    return lines.join('\n')
  }

  private buildAdjacencyList(graph: ImportGraph): Map<string, Set<string>> {
    const adj = new Map<string, Set<string>>()

    for (const [filePath] of graph.modules) {
      adj.set(filePath, new Set<string>())
    }

    for (const edge of graph.edges) {
      const neighbors = adj.get(edge.from)
      if (neighbors) {
        neighbors.add(edge.to)
      }
    }

    return adj
  }

  private getDirectDependents(graph: ImportGraph, filePath: string): string[] {
    const module = graph.modules.get(filePath)
    if (!module) return []
    return [...module.dependents]
  }

  private getTransitiveDependents(graph: ImportGraph, directDependents: string[]): string[] {
    const visited = new Set<string>(directDependents)
    const queue = [...directDependents]

    while (queue.length > 0) {
      const current = queue.shift()!
      const module = graph.modules.get(current)
      if (module) {
        for (const dep of module.dependents) {
          if (!visited.has(dep) && graph.modules.has(dep)) {
            visited.add(dep)
            queue.push(dep)
          }
        }
      }
    }

    return [...visited].filter((d) => !directDependents.includes(d))
  }

  private countTotalImports(graph: ImportGraph): number {
    let total = 0
    for (const [, module] of graph.modules) {
      total += module.imports.length
    }
    return total
  }

  private countTotalExports(graph: ImportGraph): number {
    let total = 0
    for (const [, module] of graph.modules) {
      total += module.exports.length
    }
    return total
  }

  private isRelativeImport(path: string): boolean {
    return path.startsWith('./') || path.startsWith('../')
  }

  private findModuleByImportPath(graph: ImportGraph, importerPath: string, importPath: string): string | null {
    if (graph.modules.has(importPath)) return importPath

    if (!importPath.startsWith('.')) return null

    const importerDir = importerPath.includes('/')
      ? importerPath.substring(0, importerPath.lastIndexOf('/'))
      : '.'
    const normalized = this.normalizePath(`${importerDir}/${importPath}`)

    if (graph.modules.has(normalized)) return normalized

    const withoutExt = normalized.replace(/\.[^.]+$/, '')
    const extensions = ['.ts', '.tsx', '.js', '.jsx']
    for (const ext of extensions) {
      const candidate = withoutExt + ext
      if (graph.modules.has(candidate)) return candidate
    }

    const indexExts = ['/index.ts', '/index.tsx', '/index.js', '/index.jsx']
    for (const indexExt of indexExts) {
      const candidate = normalized + indexExt
      if (graph.modules.has(candidate)) return candidate
    }

    return null
  }

  private normalizePath(path: string): string {
    const parts = path.split('/')
    const result: string[] = []
    for (const part of parts) {
      if (part === '..') {
        result.pop()
      } else if (part !== '.' && part !== '') {
        result.push(part)
      }
    }
    return result.join('/')
  }
}
