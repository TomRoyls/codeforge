export type ImportType2 = 'default' | 'named' | 'namespace' | 'side-effect'

export interface Import2 {
  id: string
  source: string
  target: string
  type: ImportType2
  imported: string[]
  line: number
  dynamic: boolean
}

export interface Export2 {
  id: string
  source: string
  exported: string
  type: ImportType2
  line: number
  reexport: boolean
}

export class ImportExportAnalyzer2 {
  private imports: Import2[] = []
  private exports: Export2[] = []
  private modules: Set<string> = new Set()

  addImport(source: string, target: string, type: ImportType2, imported: string[] = [], line = 0, dynamic = false): this {
    const id = `imp_${this.imports.length}`
    this.imports.push({ id, source, target, type, imported, line, dynamic })
    this.modules.add(source)
    this.modules.add(target)
    return this
  }

  addExport(source: string, exported: string, type: ImportType2 = 'named', line = 0, reexport = false): this {
    const id = `exp_${this.exports.length}`
    this.exports.push({ id, source, exported, type, line, reexport })
    this.modules.add(source)
    return this
  }

  getImports(): Import2[] { return [...this.imports] }
  getExports(): Export2[] { return [...this.exports] }

  getImportsByModule(module: string): Import2[] {
    return this.imports.filter(i => i.source === module || i.target === module)
  }

  getExportsByModule(module: string): Export2[] {
    return this.exports.filter(e => e.source === module)
  }

  getIncomingImports(module: string): Import2[] {
    return this.imports.filter(i => i.target === module)
  }

  getOutgoingImports(module: string): Import2[] {
    return this.imports.filter(i => i.source === module)
  }

  getImportedModules(module: string): string[] {
    return Array.from(new Set(this.getOutgoingImports(module).map(i => i.target)))
  }

  getImportingModules(module: string): string[] {
    return Array.from(new Set(this.getIncomingImports(module).map(i => i.source)))
  }

  getModules(): string[] { return Array.from(this.modules) }

  getModuleStats(module: string): { imports: number; exports: number; incoming: number; outgoing: number } {
    return {
      imports: this.getImportsByModule(module).length,
      exports: this.getExportsByModule(module).length,
      incoming: this.getIncomingImports(module).length,
      outgoing: this.getOutgoingImports(module).length,
    }
  }

  getDynamicImports(): Import2[] {
    return this.imports.filter(i => i.dynamic)
  }

  getReExports(): Export2[] {
    return this.exports.filter(e => e.reexport)
  }

  getOrphanModules(): string[] {
    return Array.from(this.modules).filter(m => {
      const hasImports = this.imports.some(i => i.source === m || i.target === m)
      const hasExports = this.exports.some(e => e.source === m)
      return !hasImports && !hasExports
    })
  }

  getMostImportedModules(n = 10): Array<{ module: string; count: number }> {
    const counts = new Map<string, number>()
    this.imports.forEach(i => counts.set(i.target, (counts.get(i.target) ?? 0) + 1))
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([module, count]) => ({ module, count }))
  }

  getCircularDependencies(): string[][] {
    const graph = new Map<string, Set<string>>()
    this.imports.forEach(i => {
      if (!graph.has(i.source)) graph.set(i.source, new Set())
      graph.get(i.source)!.add(i.target)
    })

    const cycles: string[][] = []
    const visited = new Set<string>()
    const path: string[] = []
    const pathSet = new Set<string>()

    const dfs = (node: string) => {
      if (pathSet.has(node)) {
        const cycleStart = path.indexOf(node)
        if (cycleStart !== -1) cycles.push([...path.slice(cycleStart), node])
        return
      }
      if (visited.has(node)) return
      visited.add(node)
      pathSet.add(node)
      path.push(node)
      graph.get(node)?.forEach(next => dfs(next))
      path.pop()
      pathSet.delete(node)
    }

    graph.forEach((_, node) => dfs(node))
    return cycles
  }

  getTotalImports(): number { return this.imports.length }
  getTotalExports(): number { return this.exports.length }
  getModuleCount(): number { return this.modules.size }

  count(): number { return this.imports.length + this.exports.length }

  toArray(): string[] { return Array.from(this.modules) }
  toString(): string { return JSON.stringify({ imports: this.getTotalImports(), exports: this.getTotalExports(), modules: this.getModuleCount() }) }
  toJSON(): Record<string, unknown> { return { imports: this.getTotalImports(), exports: this.getTotalExports(), modules: this.getModuleCount(), circular: this.getCircularDependencies().length } }
  clone(): ImportExportAnalyzer2 {
    const a = new ImportExportAnalyzer2()
    a.imports = [...this.imports]
    a.exports = [...this.exports]
    a.modules = new Set(this.modules)
    return a
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ImportExportAnalyzer2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.imports = []
    this.exports = []
    this.modules.clear()
  }
}
