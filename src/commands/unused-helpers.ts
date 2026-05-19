// ─── Interfaces ──────────────────────────────────────────

export type ExportType = 'class' | 'const' | 'function' | 'interface' | 'other' | 'type'

export interface ExportInfo {
  name: string
  type: ExportType
  filePath: string
  line: number
  isDefault: boolean
}

export interface UnusedExport {
  export: ExportInfo
  usages: number
}

export interface UnusedResult {
  unused: UnusedExport[]
  totalExports: number
  totalUnused: number
  unusedPercentage: number
  byType: { type: string; count: number }[]
}

// ─── Export extraction ──────────────────────────────────

/**
 * Extract named exports from a source file.
 *
 * @example
 *   extractExports('export function hello() {}', 'src/index.ts')
 *   // => [{ name: 'hello', type: 'function', filePath: 'src/index.ts', line: 1, isDefault: false }]
 */
export function extractExports(content: string, filePath: string): ExportInfo[] {
  const exports: ExportInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lineNum = i + 1
    const trimmed = line.trim()

    // Skip comment-only lines
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue
    }

    // export function name
    const funcMatch = trimmed.match(/^export\s+function\s+(\w+)/)
    if (funcMatch) {
      exports.push({
        filePath,
        isDefault: false,
        line: lineNum,
        name: funcMatch[1]!,
        type: 'function',
      })
      continue
    }

    // export async function name
    const asyncFuncMatch = trimmed.match(/^export\s+async\s+function\s+(\w+)/)
    if (asyncFuncMatch) {
      exports.push({
        filePath,
        isDefault: false,
        line: lineNum,
        name: asyncFuncMatch[1]!,
        type: 'function',
      })
      continue
    }

    // export class Name
    const classMatch = trimmed.match(/^export\s+class\s+(\w+)/)
    if (classMatch) {
      exports.push({
        filePath,
        isDefault: false,
        line: lineNum,
        name: classMatch[1]!,
        type: 'class',
      })
      continue
    }

    // export interface Name
    const interfaceMatch = trimmed.match(/^export\s+interface\s+(\w+)/)
    if (interfaceMatch) {
      exports.push({
        filePath,
        isDefault: false,
        line: lineNum,
        name: interfaceMatch[1]!,
        type: 'interface',
      })
      continue
    }

    // export type Name
    const typeMatch = trimmed.match(/^export\s+type\s+(\w+)/)
    if (typeMatch) {
      exports.push({
        filePath,
        isDefault: false,
        line: lineNum,
        name: typeMatch[1]!,
        type: 'type',
      })
      continue
    }

    // export const name
    const constMatch = trimmed.match(/^export\s+const\s+(\w+)/)
    if (constMatch) {
      exports.push({
        filePath,
        isDefault: false,
        line: lineNum,
        name: constMatch[1]!,
        type: 'const',
      })
      continue
    }

    // export let / export var
    const letMatch = trimmed.match(/^export\s+(let|var)\s+(\w+)/)
    if (letMatch) {
      exports.push({
        filePath,
        isDefault: false,
        line: lineNum,
        name: letMatch[2]!,
        type: 'const',
      })
      continue
    }

    // export default ...
    const defaultMatch = trimmed.match(/^export\s+default\s+/)
    if (defaultMatch) {
      // Try to get the name after export default
      const defaultNameMatch = trimmed.match(/^export\s+default\s+function\s+(\w+)/)
      if (defaultNameMatch) {
        exports.push({
          filePath,
          isDefault: true,
          line: lineNum,
          name: defaultNameMatch[1]!,
          type: 'function',
        })
        continue
      }

      const defaultClassMatch = trimmed.match(/^export\s+default\s+class\s+(\w+)/)
      if (defaultClassMatch) {
        exports.push({
          filePath,
          isDefault: true,
          line: lineNum,
          name: defaultClassMatch[1]!,
          type: 'class',
        })
        continue
      }

      // Anonymous default export — record as "default"
      exports.push({
        filePath,
        isDefault: true,
        line: lineNum,
        name: 'default',
        type: 'other',
      })
      continue
    }

    // export { name1, name2 } — named re-exports (not from '...')
    const namedExportMatch = trimmed.match(/^export\s+\{([^}]+)\}\s*(?:;)?\s*$/)
    if (namedExportMatch) {
      const names = namedExportMatch[1]!
      for (const part of names.split(',')) {
        const trimmedPart = part.trim()
        // Handle "name as alias" — take the alias (exported name)
        const aliasMatch = trimmedPart.match(/^\s*(\w+)\s+as\s+(\w+)\s*$/)
        if (aliasMatch) {
          exports.push({
            filePath,
            isDefault: false,
            line: lineNum,
            name: aliasMatch[2]!,
            type: 'other',
          })
        } else if (trimmedPart) {
          exports.push({
            filePath,
            isDefault: false,
            line: lineNum,
            name: trimmedPart,
            type: 'other',
          })
        }
      }
      continue
    }

    // export { name1, name2 } from 'module' — re-export, mark specially
    // We still extract these but they won't count as "own" exports for unused detection
    const reExportMatch = trimmed.match(/^export\s+\{([^}]+)\}\s+from\s+['"]/)
    if (reExportMatch) {
      const names = reExportMatch[1]!
      for (const part of names.split(',')) {
        const trimmedPart = part.trim()
        if (trimmedPart) {
          // Re-exports use the local name (before "as")
          const localName = trimmedPart.split(/\s+as\s+/)[0]!.trim()
          exports.push({
            filePath,
            isDefault: false,
            line: lineNum,
            name: localName,
            type: 'other',
          })
        }
      }
      continue
    }

    // export * from 'module' — wildcard re-export, skip
    const wildcardMatch = trimmed.match(/^export\s+\*\s+from\s+['"]/)
    if (wildcardMatch) {
      continue
    }
  }

  return exports
}

// ─── Import extraction ──────────────────────────────────

/**
 * Extract all imported names from a source file.
 *
 * @example
 *   extractAllImports("import { foo } from './mod'")
 *   // => Set(['foo'])
 */
export function extractAllImports(content: string): Set<string> {
  const imports = new Set<string>()
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    // import { name1, name2 } from '...'
    const namedImportMatch = trimmed.match(/^import\s+\{([^}]+)\}\s+from\s+['"]/)
    if (namedImportMatch) {
      const names = namedImportMatch[1]!
      for (const part of names.split(',')) {
        const trimmedPart = part.trim()
        // Handle "a as b" — track original name 'a'
        const originalName = trimmedPart.split(/\s+as\s+/)[0]!.trim()
        if (originalName) {
          imports.add(originalName)
        }
      }
      continue
    }

    // import Name from '...'
    const defaultImportMatch = trimmed.match(/^import\s+(\w+)\s+from\s+['"]/)
    if (defaultImportMatch) {
      imports.add(defaultImportMatch[1]!)
      continue
    }

    // import * as Name from '...'
    const namespaceMatch = trimmed.match(/^import\s+\*\s+as\s+(\w+)\s+from\s+['"]/)
    if (namespaceMatch) {
      imports.add(namespaceMatch[1]!)
      continue
    }

    // import '...' (side-effect import)
    const sideEffectMatch = trimmed.match(/^import\s+['"]/)
    if (sideEffectMatch) {
      continue
    }

    // import Name, { named } from '...'
    const combinedMatch = trimmed.match(/^import\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+['"]/)
    if (combinedMatch) {
      imports.add(combinedMatch[1]!)
      const names = combinedMatch[2]!
      for (const part of names.split(',')) {
        const trimmedPart = part.trim()
        const originalName = trimmedPart.split(/\s+as\s+/)[0]!.trim()
        if (originalName) {
          imports.add(originalName)
        }
      }
      continue
    }
  }

  return imports
}

// ─── Usage map ───────────────────────────────────────────

/**
 * Build a map counting how many files import each export name.
 *
 * @example
 *   buildUsageMap(fileContents, allExports)
 *   // => Map { 'hello' => 3, 'World' => 1 }
 */
export function buildUsageMap(
  fileContents: Map<string, string>,
  exports: ExportInfo[],
): Map<string, number> {
  const usageMap = new Map<string, number>()

  // Initialize all exports with 0
  for (const exp of exports) {
    const key = exp.name
    if (!usageMap.has(key)) {
      usageMap.set(key, 0)
    }
  }

  // Count imports across all files
  for (const content of fileContents.values()) {
    const imports = extractAllImports(content)
    for (const importName of imports) {
      const current = usageMap.get(importName)
      if (current !== undefined) {
        usageMap.set(importName, current + 1)
      }
    }
  }

  return usageMap
}

// ─── Find unused ─────────────────────────────────────────

/**
 * Identify exports that have zero usages across all import statements.
 *
 * @example
 *   findUnused(exports, usageMap)
 *   // => UnusedExport[] — sorted by filePath then line
 */
export function findUnused(
  exports: ExportInfo[],
  usageMap: Map<string, number>,
  typeFilter?: string[],
): UnusedExport[] {
  const unused: UnusedExport[] = []

  for (const exp of exports) {
    if (typeFilter && typeFilter.length > 0 && !typeFilter.includes(exp.type)) {
      continue
    }

    const usages = usageMap.get(exp.name) ?? 0
    if (usages === 0) {
      unused.push({ export: exp, usages: 0 })
    }
  }
  unused.sort((a, b) => {
    const pathCompare = a.export.filePath.localeCompare(b.export.filePath)
    if (pathCompare !== 0) return pathCompare
    return a.export.line - b.export.line
  })

  return unused
}

// ─── Statistics ───────────────────────────────────────────

/**
 * Calculate statistics about unused exports.
 *
 * @example
 *   calculateStats(unusedExports, 100)
 *   // => { unused: [...], totalExports: 100, totalUnused: 5, unusedPercentage: 5, byType: [...] }
 */
export function calculateStats(unused: UnusedExport[], totalExports: number): UnusedResult {
  const totalUnused = unused.length
  const unusedPercentage = totalExports > 0 ? Math.round((totalUnused / totalExports) * 10000) / 100 : 0

  // Count by type
  const typeCountMap = new Map<string, number>()
  for (const item of unused) {
    const current = typeCountMap.get(item.export.type) ?? 0
    typeCountMap.set(item.export.type, current + 1)
  }

  const byType = Array.from(typeCountMap.entries())
    .map(([type, count]) => ({ count, type }))
    .sort((a, b) => b.count - a.count)

  return {
    byType,
    totalExports,
    totalUnused,
    unused,
    unusedPercentage,
  }
}
