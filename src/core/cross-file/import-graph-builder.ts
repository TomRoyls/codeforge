import type { ModuleExport, ModuleImport, ModuleInfo, ImportGraph } from './types.js'
import { createEmptyImportGraph } from './types.js'

const ES_IMPORT_PATTERN =
  /^import\s+(?:type\s+)?(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+))?)\s+from\s+)?['"]([^'"]+)['"]/gm

const RE_EXPORT_PATTERN =
  /^export\s+(?:(?:\{[^}]*\}|\*)\s+from\s+)['"]([^'"]+)['"]/gm

const DYNAMIC_IMPORT_PATTERN = /import\(['"]([^'"]+)['"]\)/gm

const REQUIRE_PATTERN = /require\(['"]([^'"]+)['"]\)/gm

const NAMED_IMPORT_PATTERN = /\{([^}]+)\}/
const NAMESPACE_IMPORT_PATTERN = /\*\s+as\s+(\w+)/
const DEFAULT_IMPORT_PATTERN = /^import\s+(\w+)/

const EXTENSION_ALTERNATIVES = ['.ts', '.tsx', '.js', '.jsx']
const INDEX_ALTERNATIVES = ['/index.ts', '/index.tsx', '/index.js', '/index.jsx']

export class ImportGraphBuilder {
  private graph: ImportGraph
  private entryPoints: Set<string>
  private resolvedPaths: Map<string, string>

  constructor() {
    this.graph = createEmptyImportGraph()
    this.entryPoints = new Set<string>()
    this.resolvedPaths = new Map<string, string>()
  }

  addModule(filePath: string, source: string, isEntryPoint?: boolean): void {
    const imports = this.parseImports(source)
    const exports = this.parseExports(source)
    const dependencies = new Set<string>()

    for (const imp of imports) {
      dependencies.add(imp.fromModule)
    }

    const reExportCount = exports.filter((e) => e.isReExport).length
    const nonReExportCode = this.hasNonReExportCode(source)
    const isBarrel = reExportCount > 0 && !nonReExportCode

    const moduleInfo: ModuleInfo = {
      filePath,
      imports,
      exports,
      isBarrel,
      isEntryPoint: isEntryPoint ?? false,
      dependencies,
      dependents: new Set<string>(),
      depth: 0,
    }

    this.graph.modules.set(filePath, moduleInfo)

    if (isEntryPoint) {
      this.entryPoints.add(filePath)
      moduleInfo.isEntryPoint = true
    }
  }

  addEntryPoint(filePath: string): void {
    this.entryPoints.add(filePath)
    const module = this.graph.modules.get(filePath)
    if (module) {
      module.isEntryPoint = true
    }
  }

  resolve(): ImportGraph {
    this.resolvedPaths = new Map<string, string>()

    for (const [, module] of this.graph.modules) {
      module.dependents = new Set<string>()
    }

    for (const [filePath, module] of this.graph.modules) {
      for (const dep of module.dependencies) {
        const resolvedPath = this.resolveImportPath(filePath, dep)
        if (resolvedPath) {
          const depModule = this.graph.modules.get(resolvedPath)
          if (depModule) {
            depModule.dependents.add(filePath)
          }
        }
      }
    }

    this.computeDepths()
    this.buildEdges()
    this.detectBarrels()

    return this.graph
  }

  getGraph(): ImportGraph {
    return this.graph
  }

  reset(): void {
    this.graph = createEmptyImportGraph()
    this.entryPoints = new Set<string>()
    this.resolvedPaths = new Map<string, string>()
  }

  private resolveImportPath(importerPath: string, importPath: string): string | null {
    const cacheKey = `${importerPath}::${importPath}`
    const cached = this.resolvedPaths.get(cacheKey)
    if (cached !== undefined) return cached

    let resolved: string | null = null

    if (this.graph.modules.has(importPath)) {
      resolved = importPath
    } else if (importPath.startsWith('.')) {
      const importerDir = importerPath.includes('/')
        ? importerPath.substring(0, importerPath.lastIndexOf('/'))
        : '.'
      const normalized = this.normalizePath(`${importerDir}/${importPath}`)

      if (this.graph.modules.has(normalized)) {
        resolved = normalized
      }

      if (!resolved) {
        const withoutExt = normalized.replace(/\.[^.]+$/, '')
        for (const ext of EXTENSION_ALTERNATIVES) {
          const candidate = withoutExt + ext
          if (this.graph.modules.has(candidate)) {
            resolved = candidate
            break
          }
        }
      }

      if (!resolved) {
        for (const indexExt of INDEX_ALTERNATIVES) {
          const candidate = normalized + indexExt
          if (this.graph.modules.has(candidate)) {
            resolved = candidate
            break
          }
        }
      }
    }

    this.resolvedPaths.set(cacheKey, resolved ?? '')
    return resolved || null
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

  private parseImports(source: string): ModuleImport[] {
    const imports: ModuleImport[] = []
    const seen = new Set<string>()
    const lines = source.split('\n')

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]!
      const lineNumber = lineIndex + 1

      const esMatch = this.matchLine(ES_IMPORT_PATTERN, line)
      if (esMatch) {
        const modulePath = esMatch
        if (modulePath && !seen.has(`es:${modulePath}:${lineNumber}`)) {
          seen.add(`es:${modulePath}:${lineNumber}`)
          const trimmedLine = line.trim()
          const isTypeOnly = /^import\s+type\s+/.test(trimmedLine)
          const namespaceMatch = NAMESPACE_IMPORT_PATTERN.exec(trimmedLine)
          const isNamespace = namespaceMatch !== null
          const defaultMatch = DEFAULT_IMPORT_PATTERN.exec(trimmedLine)
          const isDefault = defaultMatch !== null && !isNamespace
          const namedMatch = NAMED_IMPORT_PATTERN.exec(trimmedLine)
          let name = ''
          if (namedMatch?.[1]) {
            const names = namedMatch[1].split(',').map((n) => n.trim().split(/\s+as\s+/)[0]!.trim())
            name = names.join(', ')
          } else if (namespaceMatch?.[1]) {
            name = namespaceMatch[1]
          } else if (defaultMatch?.[1]) {
            name = defaultMatch[1]
          }

          imports.push({
            name,
            fromModule: modulePath,
            isDefault,
            isTypeOnly,
            isNamespace,
            isDynamic: false,
            line: lineNumber,
          })
        }
        continue
      }

      const reExportMatch = this.matchLine(RE_EXPORT_PATTERN, line)
      if (reExportMatch) {
        const modulePath = reExportMatch
        if (modulePath && !seen.has(`re:${modulePath}:${lineNumber}`)) {
          seen.add(`re:${modulePath}:${lineNumber}`)
          const trimmedLine = line.trim()
          const namedMatch = NAMED_IMPORT_PATTERN.exec(trimmedLine)
          const isStar = /\*\s+from/.test(trimmedLine)
          let name = isStar ? '*' : ''
          if (namedMatch?.[1]) {
            const names = namedMatch[1].split(',').map((n) => n.trim().split(/\s+as\s+/)[0]!.trim())
            name = names.join(', ')
          }

          imports.push({
            name,
            fromModule: modulePath,
            isDefault: false,
            isTypeOnly: false,
            isNamespace: isStar,
            isDynamic: false,
            line: lineNumber,
          })
        }
        continue
      }

      const dynamicMatches = this.matchAll(DYNAMIC_IMPORT_PATTERN, line)
      for (const modulePath of dynamicMatches) {
        if (modulePath && !seen.has(`dyn:${modulePath}:${lineNumber}`)) {
          seen.add(`dyn:${modulePath}:${lineNumber}`)
          imports.push({
            name: '',
            fromModule: modulePath,
            isDefault: false,
            isTypeOnly: false,
            isNamespace: false,
            isDynamic: true,
            line: lineNumber,
          })
        }
      }

      const requireMatches = this.matchAll(REQUIRE_PATTERN, line)
      for (const modulePath of requireMatches) {
        if (modulePath && !seen.has(`req:${modulePath}:${lineNumber}`)) {
          seen.add(`req:${modulePath}:${lineNumber}`)
          imports.push({
            name: '',
            fromModule: modulePath,
            isDefault: false,
            isTypeOnly: false,
            isNamespace: false,
            isDynamic: false,
            line: lineNumber,
          })
        }
      }
    }

    return imports
  }

  private parseExports(source: string): ModuleExport[] {
    const exports: ModuleExport[] = []
    const lines = source.split('\n')

    for (const line of lines) {
      const trimmedLine = line.trim()

      const reExportNamedMatch = trimmedLine.match(
        /^export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/,
      )
      if (reExportNamedMatch) {
        const names = reExportNamedMatch[1]!.split(',').map((n) => {
          const parts = n.trim().split(/\s+as\s+/)
          return parts[0]!.trim()
        })
        const fromModule = reExportNamedMatch[2]!
        for (const name of names) {
          exports.push({
            name,
            kind: 'value',
            isDefault: false,
            isReExport: true,
            reExportFrom: fromModule,
            isTypeOnly: false,
          })
        }
        continue
      }

      const reExportStarMatch = trimmedLine.match(/^export\s+\*\s+from\s+['"]([^'"]+)['"]/)
      if (reExportStarMatch) {
        exports.push({
          name: '*',
          kind: 'value',
          isDefault: false,
          isReExport: true,
          reExportFrom: reExportStarMatch[1]!,
          isTypeOnly: false,
        })
        continue
      }

      const reExportTypeMatch = trimmedLine.match(
        /^export\s+type\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/,
      )
      if (reExportTypeMatch) {
        const names = reExportTypeMatch[1]!.split(',').map((n) => {
          const parts = n.trim().split(/\s+as\s+/)
          return parts[0]!.trim()
        })
        const fromModule = reExportTypeMatch[2]!
        for (const name of names) {
          exports.push({
            name,
            kind: 'type',
            isDefault: false,
            isReExport: true,
            reExportFrom: fromModule,
            isTypeOnly: true,
          })
        }
        continue
      }

      const namedExportMatch = trimmedLine.match(
        /^export\s+(?:default\s+)?(?:(?:const|let|var|function|class|interface|type|enum)\s+)(\w+)/,
      )
      if (namedExportMatch) {
        const name = namedExportMatch[1]!
        const isDefault = /^export\s+default\s+/.test(trimmedLine)
        let kind: ModuleExport['kind'] = 'value'
        if (/^export\s+(?:default\s+)?function\s+/.test(trimmedLine)) kind = 'function'
        else if (/^export\s+(?:default\s+)?class\s+/.test(trimmedLine)) kind = 'class'
        else if (/^export\s+(?:default\s+)?const\s+/.test(trimmedLine)) kind = 'const'
        else if (/^export\s+(?:default\s+)?let\s+/.test(trimmedLine)) kind = 'const'
        else if (/^export\s+(?:default\s+)?var\s+/.test(trimmedLine)) kind = 'const'
        else if (/^export\s+(?:default\s+)?enum\s+/.test(trimmedLine)) kind = 'enum'
        else if (/^export\s+(?:default\s+)?interface\s+/.test(trimmedLine)) kind = 'interface'
        else if (/^export\s+(?:default\s+)?type\s+/.test(trimmedLine)) kind = 'type'

        const isTypeOnly = /^export\s+type\s+/.test(trimmedLine)

        exports.push({
          name,
          kind,
          isDefault,
          isReExport: false,
          isTypeOnly,
        })
        continue
      }

      const defaultExportMatch = trimmedLine.match(
        /^export\s+default\s+(?!const|let|var|function|class|interface|type|enum)(\w+)/,
      )
      if (defaultExportMatch) {
        exports.push({
          name: defaultExportMatch[1]!,
          kind: 'value',
          isDefault: true,
          isReExport: false,
          isTypeOnly: false,
        })
      }
    }

    return exports
  }

  private matchLine(pattern: RegExp, line: string): string | null {
    const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
    const regex = new RegExp(pattern.source, flags)
    regex.lastIndex = 0
    const match = regex.exec(line)
    return match?.[1] ?? null
  }

  private matchAll(pattern: RegExp, line: string): string[] {
    const results: string[] = []
    const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
    const regex = new RegExp(pattern.source, flags)
    regex.lastIndex = 0
    let match = regex.exec(line)
    while (match !== null) {
      if (match[1]) {
        results.push(match[1])
      }
      match = regex.exec(line)
    }
    return results
  }

  private hasNonReExportCode(source: string): boolean {
    const lines = source.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (
        trimmed.length > 0 &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/*') &&
        !trimmed.startsWith('*') &&
        !trimmed.startsWith('*/') &&
        !trimmed.startsWith("'") &&
        !trimmed.startsWith('"') &&
        !trimmed.startsWith('export ') &&
        !trimmed.startsWith('import ') &&
        trimmed !== ''
      ) {
        return true
      }
      if (trimmed.startsWith('export ') && !this.isReExportLine(trimmed)) {
        return true
      }
    }
    return false
  }

  private isReExportLine(line: string): boolean {
    return /^export\s+(?:\{[^}]*\}|\*)\s+from\s+/.test(line) || /^export\s+type\s+\{[^}]*\}\s+from\s+/.test(line)
  }

  private computeDepths(): void {
    if (this.entryPoints.size === 0) {
      return
    }

    const visited = new Set<string>()
    const queue: Array<{ path: string; depth: number }> = []

    for (const ep of this.entryPoints) {
      queue.push({ path: ep, depth: 0 })
      visited.add(ep)
    }

    while (queue.length > 0) {
      const item = queue.shift()!
      const module = this.graph.modules.get(item.path)
      if (module) {
        module.depth = item.depth
        for (const dep of module.dependencies) {
          const resolvedDep = this.resolveImportPath(item.path, dep)
          const depPath = resolvedDep ?? dep
          if (!visited.has(depPath) && this.graph.modules.has(depPath)) {
            visited.add(depPath)
            queue.push({ path: depPath, depth: item.depth + 1 })
          }
        }
      }
    }
  }

  private buildEdges(): void {
    this.graph.edges = []
    for (const [filePath, module] of this.graph.modules) {
      for (const dep of module.dependencies) {
        const resolvedDep = this.resolveImportPath(filePath, dep)
        const depPath = resolvedDep ?? dep
        const depModule = this.graph.modules.get(depPath)
        if (depModule) {
          const edgeImports = module.imports.filter((imp) => imp.fromModule === dep)
          this.graph.edges.push({
            from: filePath,
            to: depPath,
            imports: edgeImports,
            weight: edgeImports.length,
          })
        }
      }
    }
  }

  private detectBarrels(): void {
    for (const [, module] of this.graph.modules) {
      if (module.exports.length > 0) {
        const reExports = module.exports.filter((e) => e.isReExport)
        const nonReExportCode = this.hasModuleBody(module.filePath)
        module.isBarrel = reExports.length > 0 && reExports.length === module.exports.length && !nonReExportCode
      }
    }
  }

  private hasModuleBody(filePath: string): boolean {
    const module = this.graph.modules.get(filePath)
    if (!module) return false
    const nonReExports = module.exports.filter((e) => !e.isReExport)
    return nonReExports.length > 0
  }
}
