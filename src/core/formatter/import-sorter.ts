import type { FormatterConfig, FormatResult, FormatChange, ImportStatement, ImportGroup } from './types.js'

const BUILTIN_MODULES = new Set([
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
  'constants', 'crypto', 'dgram', 'diagnostics_channel', 'dns', 'domain',
  'events', 'fs', 'http', 'http2', 'https', 'inspector', 'module', 'net',
  'os', 'path', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline',
  'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls', 'trace_events',
  'tty', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib',
  'node:assert', 'node:async_hooks', 'node:buffer', 'node:child_process',
  'node:cluster', 'node:console', 'node:constants', 'node:crypto', 'node:dgram',
  'node:diagnostics_channel', 'node:dns', 'node:domain', 'node:events', 'node:fs',
  'node:http', 'node:http2', 'node:https', 'node:inspector', 'node:module',
  'node:net', 'node:os', 'node:path', 'node:perf_hooks', 'node:process',
  'node:punycode', 'node:querystring', 'node:readline', 'node:repl', 'node:stream',
  'node:string_decoder', 'node:sys', 'node:timers', 'node:tls', 'node:trace_events',
  'node:tty', 'node:url', 'node:util', 'node:v8', 'node:vm', 'node:wasi',
  'node:worker_threads', 'node:zlib',
])

export class ImportSorter {
  sortImports(source: string, config: FormatterConfig): FormatResult {
    const changes: FormatChange[] = []
    const lines = source.split('\n')
    const imports = this.parseImports(source)

    if (imports.length === 0) {
      return { source, changed: false, changes }
    }

    const groups = this.groupImports(imports, config.importGroupOrder)
    const sortedImports: ImportStatement[] = []
    for (const group of groups) {
      const sorted = this.sortWithinGroup(group)
      sortedImports.push(...sorted)
    }

    let changed = false
    for (let i = 0; i < imports.length; i++) {
      const original = imports[i]!
      const sorted = sortedImports[i]
      if (sorted && original.raw !== sorted.raw) {
        changed = true
        changes.push({
          line: original.startIndex + 1,
          type: 'import-sort',
          description: `Reordered import: ${original.module}`,
        })
      } else if (sorted && original.module !== sorted.module) {
        changed = true
        changes.push({
          line: original.startIndex + 1,
          type: 'import-sort',
          description: `Reordered import: ${original.module}`,
        })
      }
    }

    if (!changed && imports.length === sortedImports.length) {
      for (let i = 0; i < imports.length; i++) {
        if (imports[i]!.module !== sortedImports[i]!.module) {
          changed = true
          break
        }
      }
    }

    const firstImportLine = imports[0]!.startIndex
    const lastImportLine = imports[imports.length - 1]!.startIndex

    let importStartLine = firstImportLine
    for (let i = firstImportLine - 1; i >= 0; i--) {
      const line = lines[i]
      if (line !== undefined && line.trim() === '') {
        importStartLine = i + 1
      } else {
        break
      }
    }

    const beforeImports = lines.slice(0, importStartLine)
    const afterImportLines: string[] = []

    let afterStart = lastImportLine + 1
    while (afterStart < lines.length && lines[afterStart]?.trim() === '') {
      afterStart++
    }

    const afterImports = lines.slice(afterStart)

    const rebuiltImports = sortedImports.map((imp) =>
      this.rebuildImportStatement(imp, config.singleQuotes, config.semicolons)
    )

    let newImportBlock: string[]
    if (rebuiltImports.length === 0) {
      newImportBlock = []
    } else {
      newImportBlock = [...rebuiltImports]
    }

    const newSource = [...beforeImports, ...afterImportLines, ...newImportBlock, '', ...afterImports]
      .filter((line, idx, arr) => {
        if (idx > 0 && line === '' && arr[idx - 1] === '') return false
        return true
      })
      .join('\n')

    const originalImportBlock = lines.slice(firstImportLine, lastImportLine + 1).join('\n')
    const newImportBlockStr = rebuiltImports.join('\n')

    if (originalImportBlock === newImportBlockStr && !changed) {
      return { source, changed: false, changes }
    }

    return {
      source: newSource,
      changed: true,
      changes,
    }
  }

  parseImports(source: string): ImportStatement[] {
    const imports: ImportStatement[] = []
    const lines = source.split('\n')

    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      if (line === undefined) {
        i++
        continue
      }

      const trimmed = line.trim()

      const typeOnlyNamedMatch = trimmed.match(
        /^import\s+type\s+\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]\s*;?\s*$/
      )
      if (typeOnlyNamedMatch) {
        const namesStr = typeOnlyNamedMatch[1]!
        const names = namesStr
          .split(',')
          .map((n) => n.trim())
          .filter((n) => n.length > 0)
        imports.push({
          raw: line,
          module: typeOnlyNamedMatch[2]!,
          names,
          isTypeOnly: true,
          startIndex: i,
        })
        i++
        continue
      }

      const typeOnlyDefaultMatch = trimmed.match(
        /^import\s+type\s+(\w+)\s+from\s*['"]([^'"]+)['"]\s*;?\s*$/
      )
      if (typeOnlyDefaultMatch) {
        imports.push({
          raw: line,
          module: typeOnlyDefaultMatch[2]!,
          names: [typeOnlyDefaultMatch[1]!],
          isTypeOnly: true,
          startIndex: i,
        })
        i++
        continue
      }

      const namedMatch = trimmed.match(
        /^import\s+\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]\s*;?\s*$/
      )
      if (namedMatch) {
        const namesStr = namedMatch[1]!
        const names = namesStr
          .split(',')
          .map((n) => n.trim())
          .filter((n) => n.length > 0)
        imports.push({
          raw: line,
          module: namedMatch[2]!,
          names,
          isTypeOnly: false,
          startIndex: i,
        })
        i++
        continue
      }

      const defaultMatch = trimmed.match(
        /^import\s+(\w+)\s*,?\s*(?:\{([^}]*)\})?\s*from\s*['"]([^'"]+)['"]\s*;?\s*$/
      )
      if (defaultMatch) {
        const defaultName = defaultMatch[1]!
        const namesStr = defaultMatch[2]
        const names = namesStr
          ? [defaultName, ...namesStr.split(',').map((n) => n.trim()).filter((n) => n.length > 0)]
          : [defaultName]
        imports.push({
          raw: line,
          module: defaultMatch[3]!,
          names,
          isTypeOnly: false,
          startIndex: i,
        })
        i++
        continue
      }

      const sideEffectMatch = trimmed.match(/^import\s+['"]([^'"]+)['"]\s*;?\s*$/)
      if (sideEffectMatch) {
        imports.push({
          raw: line,
          module: sideEffectMatch[1]!,
          names: [],
          isTypeOnly: false,
          startIndex: i,
        })
        i++
        continue
      }

      const namespaceMatch = trimmed.match(
        /^import\s+\*\s+as\s+(\w+)\s+from\s*['"]([^'"]+)['"]\s*;?\s*$/
      )
      if (namespaceMatch) {
        imports.push({
          raw: line,
          module: namespaceMatch[2]!,
          names: [namespaceMatch[1]!],
          isTypeOnly: false,
          startIndex: i,
        })
        i++
        continue
      }

      i++
    }

    return imports
  }

  groupImports(imports: ImportStatement[], order: string[]): ImportGroup[] {
    const groupMap = new Map<string, ImportStatement[]>()

    for (const imp of imports) {
      const type = this.classifyImport(imp.module)
      const existing = groupMap.get(type)
      if (existing) {
        existing.push(imp)
      } else {
        groupMap.set(type, [imp])
      }
    }

    const result: ImportGroup[] = []
    for (const groupType of order) {
      const groupImports = groupMap.get(groupType)
      if (groupImports && groupImports.length > 0) {
        result.push({ type: groupType as ImportGroup['type'], imports: groupImports })
      }
    }

    for (const [type, groupImports] of groupMap) {
      if (!order.includes(type) && groupImports.length > 0) {
        result.push({ type: type as ImportGroup['type'], imports: groupImports })
      }
    }

    return result
  }

  sortWithinGroup(group: ImportGroup): ImportStatement[] {
    return [...group.imports].sort((a, b) => {
      if (a.isTypeOnly !== b.isTypeOnly) {
        return a.isTypeOnly ? 1 : -1
      }
      return a.module.localeCompare(b.module)
    })
  }

  classifyImport(modulePath: string): ImportGroup['type'] {
    if (modulePath.startsWith('node:') || BUILTIN_MODULES.has(modulePath.split('/')[0] ?? '')) {
      return 'builtin'
    }

    if (modulePath.startsWith('.')) {
      return 'relative'
    }

    if (modulePath.startsWith('@/') || modulePath.startsWith('#') || modulePath.startsWith('~')) {
      return 'internal'
    }

    return 'external'
  }

  rebuildImportStatement(imp: ImportStatement, singleQuotes: boolean, semicolons: boolean): string {
    const quote = singleQuotes ? "'" : '"'
    const semi = semicolons ? ';' : ''

    if (imp.names.length === 0) {
      return `import ${quote}${imp.module}${quote}${semi}`
    }

    if (imp.isTypeOnly && imp.names.length > 0) {
      const namesStr = imp.names.join(', ')
      return `import type { ${namesStr} } from ${quote}${imp.module}${quote}${semi}`
    }

    if (imp.raw.includes('* as')) {
      return `import * as ${imp.names[0]} from ${quote}${imp.module}${quote}${semi}`
    }

    if (imp.raw.includes('{') && imp.raw.includes('}')) {
      const namesStr = imp.names.join(', ')
      return `import { ${namesStr} } from ${quote}${imp.module}${quote}${semi}`
    }

    if (imp.names.length === 1 && !imp.raw.includes('{')) {
      return `import ${imp.names[0]} from ${quote}${imp.module}${quote}${semi}`
    }

    const defaultName = imp.names[0]!
    const rest = imp.names.slice(1)
    if (rest.length > 0) {
      return `import ${defaultName}, { ${rest.join(', ')} } from ${quote}${imp.module}${quote}${semi}`
    }

    return `import ${defaultName} from ${quote}${imp.module}${quote}${semi}`
  }
}
