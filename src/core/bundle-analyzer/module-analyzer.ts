import type { ModuleInfo, TreeShakeOpportunity } from './types.js'

const IMPORT_FROM_REGEX = /import\s+(?:(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g
const RE_EXPORT_FROM_REGEX = /export\s+(?:\{[^}]*\}\s+from|\*\s+from)\s+['"]([^'"]+)['"]/g
const EXPORT_REGEX = /export\s+(?:(?:const|let|var|function|class|interface|type|enum)\s+(\w+)|\{([^}]+)\})/g
const EXPORT_DEFAULT_REGEX = /export\s+default\s+(?:function\s+(\w+)|class\s+(\w+))/g

export class ModuleAnalyzer {
  analyzeModule(name: string, content: string): ModuleInfo {
    const dependencies = this.extractImports(content)
    const exports = this.extractExports(content)
    const size = this.calculateSize(content)
    const isExternal = this.detectExternal(name)

    return {
      name,
      path: name,
      size,
      dependencies,
      exports,
      usedExports: [],
      isExternal,
    }
  }

  findUnusedExports(modules: ModuleInfo[]): TreeShakeOpportunity[] {
    const opportunities: TreeShakeOpportunity[] = []

    for (const mod of modules) {
      const unused = mod.exports.filter(
        (exp) => !mod.usedExports.includes(exp),
      )
      if (unused.length > 0) {
        const potentialSavings = Math.round(
          (mod.size / Math.max(mod.exports.length, 1)) * unused.length,
        )
        opportunities.push({
          module: mod.name,
          unusedExports: unused,
          potentialSavings,
        })
      }
    }

    return opportunities
  }

  findDuplicates(modules: ModuleInfo[]): string[][] {
    const nameMap = new Map<string, string[]>()

    for (const mod of modules) {
      const existing = nameMap.get(mod.name)
      if (existing) {
        existing.push(mod.path)
      } else {
        nameMap.set(mod.name, [mod.path])
      }
    }

    const duplicates: string[][] = []
    for (const paths of nameMap.values()) {
      if (paths.length > 1) {
        duplicates.push(paths)
      }
    }

    return duplicates
  }

  estimateGzipSize(size: number): number {
    return Math.round(size * 0.3)
  }

  private extractImports(content: string): string[] {
    const imports = new Set<string>()

    let match: RegExpExecArray | null

    IMPORT_FROM_REGEX.lastIndex = 0
    while ((match = IMPORT_FROM_REGEX.exec(content)) !== null) {
      if (match[1]) {
        imports.add(match[1])
      }
    }

    RE_EXPORT_FROM_REGEX.lastIndex = 0
    while ((match = RE_EXPORT_FROM_REGEX.exec(content)) !== null) {
      if (match[1]) {
        imports.add(match[1])
      }
    }

    return Array.from(imports)
  }

  private extractExports(content: string): string[] {
    const exports = new Set<string>()

    let match: RegExpExecArray | null

    EXPORT_REGEX.lastIndex = 0
    while ((match = EXPORT_REGEX.exec(content)) !== null) {
      if (match[1]) {
        exports.add(match[1])
      } else if (match[2]) {
        const names = match[2].split(',').map((s: string) => s.trim().split(/\s+as\s+/)[0]!.trim()).filter(Boolean)
        for (const n of names) {
          exports.add(n)
        }
      }
    }

    EXPORT_DEFAULT_REGEX.lastIndex = 0
    while ((match = EXPORT_DEFAULT_REGEX.exec(content)) !== null) {
      if (match[1]) {
        exports.add(match[1])
      } else if (match[2]) {
        exports.add(match[2])
      }
    }

    return Array.from(exports)
  }

  private calculateSize(content: string): number {
    return Buffer.byteLength(content, 'utf-8')
  }

  private detectExternal(name: string): boolean {
    if (name.startsWith('.') || name.startsWith('/')) {
      return false
    }
    if (name.includes('/') && !name.startsWith('@')) {
      return false
    }
    return !name.startsWith('./') && !name.startsWith('../')
  }
}
