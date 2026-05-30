// ─── Types ────────────────────────────────────────────────────────────────────

export interface CodeLocation {
  file: string
  line: number
  column: number
  context: string
  surroundingCode: string[]
}

export interface LocatedElement {
  name: string
  type: 'function-definition' | 'function-call' | 'class-definition' | 'class-usage' | 'variable-definition' | 'variable-usage' | 'import' | 'export' | 'type-definition' | 'type-usage' | 'interface-definition' | 'parameter'
  location: CodeLocation
  isDefinition: boolean
  isUsage: boolean
  relevanceScore: number
}

export interface LocatorStats {
  totalMatches: number
  definitionsCount: number
  usagesCount: number
  filesMatched: number
  queryType: string
}

export interface LocatorResult {
  query: string
  definitions: LocatedElement[]
  usages: LocatedElement[]
  imports: LocatedElement[]
  exports: LocatedElement[]
  stats: LocatorStats
  grouped: Record<string, LocatedElement[]>
}

export interface LocatorOptions {
  type?: 'function' | 'class' | 'variable' | 'import' | 'export' | 'all'
}

export interface QueryInfo {
  raw: string
  isRegex: boolean
  isGlob: boolean
  inferredType: string
  pattern: RegExp
}

// ─── parseQuery ───────────────────────────────────────────────────────────────

/**
 * Determine what kind of element to search for from the query string.
 *
 * @example
 * parseQuery('MyClass') // { inferredType: 'class', ... }
 */
export function parseQuery(query: string): QueryInfo {
  const isRegex = query.includes('/')
  const isGlob = query.includes('*')

  let inferredType = 'all'
  if (/^[A-Z]/.test(query)) {
    inferredType = 'class'
  } else if (/^[A-Z_][A-Z0-9_]*$/.test(query)) {
    inferredType = 'variable'
  } else if (/^[a-z]/.test(query)) {
    inferredType = 'function'
  }

  let pattern: RegExp
  if (isGlob) {
    const regexStr = query.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')
    pattern = new RegExp(`\\b${regexStr}\\b`, 'i')
  } else if (isRegex) {
    const inner = query.replace(/^\//, '').replace(/\/$/, '')
    pattern = new RegExp(inner)
  } else {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    pattern = new RegExp(`\\b${escaped}\\b`)
  }

  return { raw: query, isRegex, isGlob, inferredType, pattern }
}

// ─── getSurroundingLines ──────────────────────────────────────────────────────

/**
 * Get 2 lines before and after a given line index.
 *
 * @example
 * getSurroundingLines(lines, 5) // lines[3..7]
 */
export function getSurroundingLines(lines: string[], index: number): string[] {
  const start = Math.max(0, index - 2)
  const end = Math.min(lines.length - 1, index + 2)
  const result: string[] = []
  for (let i = start; i <= end; i++) {
    result.push(lines[i]!)
  }
  return result
}

// ─── computeRelevance ─────────────────────────────────────────────────────────

/**
 * Score how well an element name matches the query.
 *
 * @example
 * computeRelevance('myFunc', 'myFunc') // 1.0
 */
export function computeRelevance(name: string, query: string): number {
  if (name === query) return 1.0
  if (name.toLowerCase() === query.toLowerCase()) return 0.8
  if (name.toLowerCase().includes(query.toLowerCase())) return 0.5
  if (query.toLowerCase().includes(name.toLowerCase())) return 0.4
  return 0.1
}

// ─── findDefinitions ──────────────────────────────────────────────────────────

/**
 * Find where elements matching the query are defined.
 *
 * @example
 * findDefinitions('function foo() {}', 'foo', 'a.ts') // [LocatedElement]
 */
export function findDefinitions(content: string, query: string, filePath: string): LocatedElement[] {
  const results: LocatedElement[] = []
  const lines = content.split('\n')
  const queryInfo = parseQuery(query)
  const pattern = queryInfo.pattern

  const defPatterns: { regex: RegExp; type: LocatedElement['type'] }[] = [
    { regex: /export\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/, type: 'function-definition' },
    { regex: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/, type: 'function-definition' },
    { regex: /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*/, type: 'variable-definition' },
    { regex: /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/, type: 'variable-definition' },
    { regex: /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/, type: 'variable-definition' },
    { regex: /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[{<\s]/, type: 'class-definition' },
    { regex: /interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[{<\s]/, type: 'interface-definition' },
    { regex: /type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=<]/, type: 'type-definition' },
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    for (const dp of defPatterns) {
      const match = line.match(dp.regex)
      if (match && match[1] && pattern.test(match[1])) {
        results.push({
          name: match[1],
          type: dp.type,
          location: {
            file: filePath,
            line: i + 1,
            column: line.indexOf(match[1]) + 1,
            context: line.trim(),
            surroundingCode: getSurroundingLines(lines, i),
          },
          isDefinition: true,
          isUsage: false,
          relevanceScore: computeRelevance(match[1], query),
        })
        break
      }
    }
  }

  return results
}

// ─── findUsages ───────────────────────────────────────────────────────────────

/**
 * Find where elements matching the query are used/called.
 *
 * @example
 * findUsages('foo(1, 2)', 'foo', 'a.ts') // [LocatedElement]
 */
export function findUsages(content: string, query: string, filePath: string): LocatedElement[] {
  const results: LocatedElement[] = []
  const lines = content.split('\n')
  const queryInfo = parseQuery(query)
  const pattern = queryInfo.pattern

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) continue

    const funcCallMatch = line.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g)
    if (funcCallMatch) {
      for (const m of funcCallMatch) {
        const name = m.replace(/\s*\($/, '')
        if (pattern.test(name)) {
          const isDef = /^\s*(export\s+)?(async\s+)?function\s/.test(line) || /^\s*(const|let|var)\s/.test(line)
          if (!isDef) {
            results.push({
              name,
              type: name[0] === name[0]?.toUpperCase() && name[0] !== name[0]?.toLowerCase() ? 'class-usage' : 'function-call',
              location: {
                file: filePath,
                line: i + 1,
                column: line.indexOf(name) + 1,
                context: line.trim(),
                surroundingCode: getSurroundingLines(lines, i),
              },
              isDefinition: false,
              isUsage: true,
              relevanceScore: computeRelevance(name, query),
            })
          }
        }
      }
    }

    const propAccessMatch = line.match(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g)
    if (propAccessMatch) {
      for (const m of propAccessMatch) {
        const name = m.slice(1)!
        if (pattern.test(name) && !/^\s*(function|const|let|var|class|interface|type)\s/.test(line)) {
          const alreadyAdded = results.some(
            (r) => r.location.line === i + 1 && r.name === name && r.type === 'variable-usage',
          )
          if (!alreadyAdded) {
            results.push({
              name,
              type: 'variable-usage',
              location: {
                file: filePath,
                line: i + 1,
                column: line.indexOf(`.${name}`) + 2,
                context: line.trim(),
                surroundingCode: getSurroundingLines(lines, i),
              },
              isDefinition: false,
              isUsage: true,
              relevanceScore: computeRelevance(name, query),
            })
          }
        }
      }
    }

    const typeUsageMatch = line.match(/:\s*([A-Z][a-zA-Z0-9_$]*)/g)
    if (typeUsageMatch) {
      for (const m of typeUsageMatch) {
        const name = m.replace(/^:\s*/, '')
        if (pattern.test(name)) {
          const alreadyAdded = results.some(
            (r) => r.location.line === i + 1 && r.name === name && r.type === 'type-usage',
          )
          if (!alreadyAdded) {
            results.push({
              name,
              type: 'type-usage',
              location: {
                file: filePath,
                line: i + 1,
                column: line.indexOf(name) + 1,
                context: line.trim(),
                surroundingCode: getSurroundingLines(lines, i),
              },
              isDefinition: false,
              isUsage: true,
              relevanceScore: computeRelevance(name, query),
            })
          }
        }
      }
    }

    const paramMatch = line.match(/(?:function|(?:=>))[^{]*\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g)
    if (paramMatch) {
      for (const m of paramMatch) {
        const nameMatch = m.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b$/)
        if (nameMatch) {
          const name = nameMatch[1] ?? ''
          if (pattern.test(name) && !/^\s*(function|const|let|var|class|interface|type)\s/.test(line)) {
            const alreadyAdded = results.some(
              (r) => r.location.line === i + 1 && r.name === name,
            )
            if (!alreadyAdded) {
              results.push({
                name,
                type: 'parameter',
                location: {
                  file: filePath,
                  line: i + 1,
                  column: line.lastIndexOf(name) + 1,
                  context: line.trim(),
                  surroundingCode: getSurroundingLines(lines, i),
                },
                isDefinition: false,
                isUsage: true,
                relevanceScore: computeRelevance(name, query),
              })
            }
          }
        }
      }
    }
  }

  return results
}

// ─── findImports ──────────────────────────────────────────────────────────────

/**
 * Find import statements mentioning the query.
 *
 * @example
 * findImports("import { foo } from 'bar'", 'foo', 'a.ts') // [LocatedElement]
 */
export function findImports(content: string, query: string, filePath: string): LocatedElement[] {
  const results: LocatedElement[] = []
  const lines = content.split('\n')
  const queryInfo = parseQuery(query)
  const pattern = queryInfo.pattern

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (!line.includes('import ')) continue

    const namedMatch = line.match(/import\s+(?:type\s+)?\{([^}]+)\}/)
    if (namedMatch) {
      const names = namedMatch[1] ?? ''.split(',').map((n) => n.trim().split(/\s+as\s+/).at(-1) ?? ''.trim())
      for (const name of names) {
        if (pattern.test(name)) {
          results.push({
            name,
            type: 'import',
            location: {
              file: filePath,
              line: i + 1,
              column: line.indexOf(name) + 1,
              context: line.trim(),
              surroundingCode: getSurroundingLines(lines, i),
            },
            isDefinition: false,
            isUsage: true,
            relevanceScore: computeRelevance(name, query),
          })
        }
      }
    }

    const defaultMatch = line.match(/import\s+(?:type\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)/)
    if (defaultMatch && defaultMatch[1]) {
      const name = defaultMatch[1]
      if (pattern.test(name) && !namedMatch) {
        results.push({
          name,
          type: 'import',
          location: {
            file: filePath,
            line: i + 1,
            column: line.indexOf(name) + 1,
            context: line.trim(),
            surroundingCode: getSurroundingLines(lines, i),
          },
          isDefinition: false,
          isUsage: true,
          relevanceScore: computeRelevance(name, query),
        })
      }
    }

    const starMatch = line.match(/import\s+\*\s+as\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)
    if (starMatch && starMatch[1]) {
      const name = starMatch[1]
      if (pattern.test(name)) {
        results.push({
          name,
          type: 'import',
          location: {
            file: filePath,
            line: i + 1,
            column: line.indexOf(name) + 1,
            context: line.trim(),
            surroundingCode: getSurroundingLines(lines, i),
          },
          isDefinition: false,
          isUsage: true,
          relevanceScore: computeRelevance(name, query),
        })
      }
    }
  }

  return results
}

// ─── findExports ──────────────────────────────────────────────────────────────

/**
 * Find export statements mentioning the query.
 *
 * @example
 * findExports("export { foo }", 'foo', 'a.ts') // [LocatedElement]
 */
export function findExports(content: string, query: string, filePath: string): LocatedElement[] {
  const results: LocatedElement[] = []
  const lines = content.split('\n')
  const queryInfo = parseQuery(query)
  const pattern = queryInfo.pattern

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    if (line.match(/^export\s+default\s+/)) {
      const nameMatch = line.match(/^export\s+default\s+(?:function\s+|class\s+|const\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)/)
      if (nameMatch && nameMatch[1] && pattern.test(nameMatch[1])) {
        results.push({
          name: nameMatch[1],
          type: 'export',
          location: {
            file: filePath,
            line: i + 1,
            column: line.indexOf(nameMatch[1]) + 1,
            context: line.trim(),
            surroundingCode: getSurroundingLines(lines, i),
          },
          isDefinition: false,
          isUsage: false,
          relevanceScore: computeRelevance(nameMatch[1], query),
        })
      }
    }

    if (line.match(/^export\s+\{/)) {
      const namedExport = line.match(/\{([^}]+)\}/)
      if (namedExport) {
        const names = namedExport[1] ?? ''.split(',').map((n) => n.trim().split(/\s+as\s+/)[0]!.trim())
        for (const name of names) {
          if (pattern.test(name)) {
            results.push({
              name,
              type: 'export',
              location: {
                file: filePath,
                line: i + 1,
                column: line.indexOf(name) + 1,
                context: line.trim(),
                surroundingCode: getSurroundingLines(lines, i),
              },
              isDefinition: false,
              isUsage: false,
              relevanceScore: computeRelevance(name, query),
            })
          }
        }
      }
    }

    if (line.match(/^export\s+(?:async\s+)?function\s+/)) {
      const fnMatch = line.match(/^export\s+(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)
      if (fnMatch && fnMatch[1] && pattern.test(fnMatch[1])) {
        results.push({
          name: fnMatch[1],
          type: 'export',
          location: {
            file: filePath,
            line: i + 1,
            column: line.indexOf(fnMatch[1]) + 1,
            context: line.trim(),
            surroundingCode: getSurroundingLines(lines, i),
          },
          isDefinition: false,
          isUsage: false,
          relevanceScore: computeRelevance(fnMatch[1], query),
        })
      }
    }

    if (line.match(/^export\s+(?!default\b).*class\s+/)) {
      const clsMatch = line.match(/^export\s+class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)
      if (clsMatch && clsMatch[1] && pattern.test(clsMatch[1])) {
        const already = results.some((r) => r.name === clsMatch[1] && r.location.line === i + 1)
        if (!already) {
          results.push({
            name: clsMatch[1],
            type: 'export',
            location: {
              file: filePath,
              line: i + 1,
              column: line.indexOf(clsMatch[1]) + 1,
              context: line.trim(),
              surroundingCode: getSurroundingLines(lines, i),
            },
            isDefinition: false,
            isUsage: false,
            relevanceScore: computeRelevance(clsMatch[1], query),
          })
        }
      }
    }

    if (line.match(/^export\s+(?:const|let|var)\s+/)) {
      const varMatch = line.match(/^export\s+(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)
      if (varMatch && varMatch[1] && pattern.test(varMatch[1])) {
        results.push({
          name: varMatch[1],
          type: 'export',
          location: {
            file: filePath,
            line: i + 1,
            column: line.indexOf(varMatch[1]) + 1,
            context: line.trim(),
            surroundingCode: getSurroundingLines(lines, i),
          },
          isDefinition: false,
          isUsage: false,
          relevanceScore: computeRelevance(varMatch[1], query),
        })
      }
    }
  }

  return results
}

// ─── groupElementsByFile ──────────────────────────────────────────────────────

/**
 * Group located elements by their file path.
 *
 * @example
 * groupElementsByFile(elements) // { 'a.ts': [...], 'b.ts': [...] }
 */
export function groupElementsByFile(elements: LocatedElement[]): Record<string, LocatedElement[]> {
  const grouped: Record<string, LocatedElement[]> = {}
  for (const el of elements) {
    const file = el.location.file
    if (!grouped[file]) grouped[file] = []
    grouped[file]!.push(el)
  }
  return grouped
}

// ─── filterByType ─────────────────────────────────────────────────────────────

/**
 * Filter located elements by user-specified type category.
 *
 * @example
 * filterByType(elements, 'function') // only function defs and calls
 */
export function filterByType(elements: LocatedElement[], type?: string): LocatedElement[] {
  if (!type || type === 'all') return elements
  const typeMap: Record<string, string[]> = {
    function: ['function-definition', 'function-call'],
    class: ['class-definition', 'class-usage'],
    variable: ['variable-definition', 'variable-usage'],
    import: ['import'],
    export: ['export'],
  }
  const allowed = typeMap[type] ?? []
  return elements.filter((e) => allowed.includes(e.type))
}

// ─── buildLocatorResult ───────────────────────────────────────────────────────

/**
 * Orchestrate full locator search across files.
 *
 * @example
 * buildLocatorResult(['a.ts'], ['code...'], 'foo') // LocatorResult
 */
export function buildLocatorResult(
  files: string[],
  contents: string[],
  query: string,
  options?: LocatorOptions,
): LocatorResult {
  const allDefinitions: LocatedElement[] = []
  const allUsages: LocatedElement[] = []
  const allImports: LocatedElement[] = []
  const allExports: LocatedElement[] = []

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]!
    const content = contents[i] ?? ''

    const defs = findDefinitions(content, query, filePath)
    const usages = findUsages(content, query, filePath)
    const imports = findImports(content, query, filePath)
    const exports = findExports(content, query, filePath)

    allDefinitions.push(...defs)
    allUsages.push(...usages)
    allImports.push(...imports)
    allExports.push(...exports)
  }

  const queryInfo = parseQuery(query)
  const typeFilter = options?.type ?? 'all'

  const filteredDefs = filterByType(allDefinitions, typeFilter)
  const filteredUsages = filterByType(allUsages, typeFilter)
  const filteredImports = filterByType(allImports, typeFilter)
  const filteredExports = filterByType(allExports, typeFilter)

  const allFiltered = [...filteredDefs, ...filteredUsages, ...filteredImports, ...filteredExports]
  const filesMatched = new Set(allFiltered.map((e) => e.location.file)).size

  const stats: LocatorStats = {
    totalMatches: allFiltered.length,
    definitionsCount: filteredDefs.length,
    usagesCount: filteredUsages.length,
    filesMatched,
    queryType: queryInfo.inferredType,
  }

  return {
    query,
    definitions: filteredDefs,
    usages: filteredUsages,
    imports: filteredImports,
    exports: filteredExports,
    stats,
    grouped: groupElementsByFile(allFiltered),
  }
}
