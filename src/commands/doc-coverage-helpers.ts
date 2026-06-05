// ─── Interfaces ──────────────────────────────────────────

export interface JSDocQuality {
  hasDescription: boolean
  hasParams: boolean
  hasReturns: boolean
  hasExample: boolean
}

export interface ExportItem {
  name: string
  type: 'class' | 'const' | 'function' | 'interface' | 'method' | 'property' | 'type' | 'other'
  filePath: string
  line: number
  hasJSDoc: boolean
  jsDocQuality: JSDocQuality
}

export interface FileDocCoverage {
  filePath: string
  relativePath: string
  exports: ExportItem[]
  totalExports: number
  documentedExports: number
  coveragePercentage: number
}

export interface DocCoverageResult {
  files: FileDocCoverage[]
  totalExports: number
  documentedExports: number
  coveragePercentage: number
  byType: { type: string; total: number; documented: number; percentage: number }[]
  byFile: { file: string; total: number; documented: number; percentage: number }[]
  undocumentedItems: ExportItem[]
}

export interface FilterOptions {
  showUndocumented?: boolean
  showDocumented?: boolean
}

// ─── Export detection ────────────────────────────────────

/**
 * Extract all exported items from source file content.
 *
 * @example
 * const items = extractExportedItems('export function hello() {}', 'test.ts')
 * // items[0].name === 'hello', items[0].type === 'function'
 */
export function extractExportedItems(content: string, filePath: string): ExportItem[] {
  const items: ExportItem[] = []
  const lines = content.split('\n')

  const emptyQuality: JSDocQuality = {
    hasDescription: false,
    hasExample: false,
    hasParams: false,
    hasReturns: false,
  }

  // Track class bodies for method/property detection
  const classRanges: { name: string; startLine: number; endLine: number }[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim()
    const lineNum = i + 1

    // export function name(
    const funcMatch = line.match(/^export\s+function\s+(\w+)/)
    if (funcMatch) {
      items.push({
        filePath,
        hasJSDoc: false,
        jsDocQuality: { ...emptyQuality },
        line: lineNum,
        name: funcMatch[1] ?? '',
        type: 'function',
      })
      continue
    }

    // export async function name(
    const asyncFuncMatch = line.match(/^export\s+async\s+function\s+(\w+)/)
    if (asyncFuncMatch) {
      items.push({
        filePath,
        hasJSDoc: false,
        jsDocQuality: { ...emptyQuality },
        line: lineNum,
        name: asyncFuncMatch[1] ?? '',
        type: 'function',
      })
      continue
    }

    // export class Name
    const classMatch = line.match(/^export\s+class\s+(\w+)/)
    if (classMatch) {
      items.push({
        filePath,
        hasJSDoc: false,
        jsDocQuality: { ...emptyQuality },
        line: lineNum,
        name: classMatch[1] ?? '',
        type: 'class',
      })

      // Find class body range
      let braceCount = 0
      let started = false
      let endLine = i
      for (let j = i; j < lines.length; j++) {
        const cl = lines[j]!
        for (const ch of cl) {
          if (ch === '{') {
            braceCount++
            started = true
          }
          if (ch === '}') {
            braceCount--
          }
        }
        if (started && braceCount === 0) {
          endLine = j
          break
        }
      }
      classRanges.push({ endLine, name: classMatch[1] ?? '', startLine: i })
      continue
    }

    // export interface Name
    const ifaceMatch = line.match(/^export\s+interface\s+(\w+)/)
    if (ifaceMatch) {
      items.push({
        filePath,
        hasJSDoc: false,
        jsDocQuality: { ...emptyQuality },
        line: lineNum,
        name: ifaceMatch[1] ?? '',
        type: 'interface',
      })
      continue
    }

    // export type Name
    const typeMatch = line.match(/^export\s+type\s+(\w+)/)
    if (typeMatch) {
      items.push({
        filePath,
        hasJSDoc: false,
        jsDocQuality: { ...emptyQuality },
        line: lineNum,
        name: typeMatch[1] ?? '',
        type: 'type',
      })
      continue
    }

    // export const name
    const constMatch = line.match(/^export\s+const\s+(\w+)/)
    if (constMatch) {
      items.push({
        filePath,
        hasJSDoc: false,
        jsDocQuality: { ...emptyQuality },
        line: lineNum,
        name: constMatch[1] ?? '',
        type: 'const',
      })
      continue
    }

    // export { name1, name2 }
    const namedExportMatch = line.match(/^export\s*\{([^}]+)\}/)
    if (namedExportMatch) {
      const names = (namedExportMatch[1] ?? '').split(',').map((n) => (n.trim().split(/\s+as\s+/).at(-1) ?? '').trim())
      for (const name of names) {
        if (name.length > 0) {
          items.push({
            filePath,
            hasJSDoc: false,
            jsDocQuality: { ...emptyQuality },
            line: lineNum,
            name,
            type: 'other',
          })
        }
      }
      continue
    }

    // export default class Name
    const defaultClassMatch = line.match(/^export\s+default\s+class\s+(\w+)/)
    if (defaultClassMatch) {
      items.push({
        filePath,
        hasJSDoc: false,
        jsDocQuality: { ...emptyQuality },
        line: lineNum,
        name: defaultClassMatch[1] ?? '',
        type: 'class',
      })
      let braceCount = 0
      let started = false
      let endLine = i
      for (let j = i; j < lines.length; j++) {
        const cl = lines[j]!
        for (const ch of cl) {
          if (ch === '{') {
            braceCount++
            started = true
          }
          if (ch === '}') {
            braceCount--
          }
        }
        if (started && braceCount === 0) {
          endLine = j
          break
        }
      }
      classRanges.push({ endLine, name: defaultClassMatch[1] ?? '', startLine: i })
      continue
    }

    // export default function name
    const defaultFuncMatch = line.match(/^export\s+default\s+function\s+(\w+)/)
    if (defaultFuncMatch) {
      items.push({
        filePath,
        hasJSDoc: false,
        jsDocQuality: { ...emptyQuality },
        line: lineNum,
        name: defaultFuncMatch[1] ?? '',
        type: 'function',
      })
      continue
    }
  }

  // Detect methods and properties inside class bodies
  for (const range of classRanges) {
    for (let i = range.startLine + 1; i <= range.endLine; i++) {
      const line = lines[i]!.trim()

      // Method: name(args) or name = (args) => or private/public name(args)
      const methodMatch = line.match(
        /^(?:(?:public|private|protected|readonly|static|abstract|override|async)\s+)*(?:async\s+)?(\w+)\s*[<(]/,
      )
      if (methodMatch && !line.startsWith('//') && !line.startsWith('*') && !line.startsWith('/*')) {
        const methodName = methodMatch[1] ?? ''
        if (methodName !== 'constructor' && methodName !== 'new' && methodName !== 'get' && methodName !== 'set') {
          items.push({
            filePath,
            hasJSDoc: false,
            jsDocQuality: { ...emptyQuality },
            line: i + 1,
            name: `${range.name}#${methodName}`,
            type: 'method',
          })
        }
      }

      // Property: name: type or name = value
      const propMatch = line.match(
        /^(?:public|private|protected|readonly|static|abstract|override)\s+(\w+)\s*[=:]/,
      )
      if (propMatch && !line.startsWith('//') && !line.startsWith('*') && !line.startsWith('/*')) {
        const propName = propMatch[1] ?? ''
        if (propName !== 'constructor' && propName !== 'function' && propName !== 'class') {
          items.push({
            filePath,
            hasJSDoc: false,
            jsDocQuality: { ...emptyQuality },
            line: i + 1,
            name: `${range.name}#${propName}`,
            type: 'property',
          })
        }
      }
    }
  }

  return items
}

// ─── JSDoc detection ─────────────────────────────────────

/**
 * Check if a given line number has a JSDoc comment above it.
 *
 * @example
 * const result = checkJSDoc(lines, targetLine)
 */
export function checkJSDoc(lines: string[], lineNumber: number): { hasJSDoc: boolean; jsDocQuality: JSDocQuality } {
  const quality: JSDocQuality = {
    hasDescription: false,
    hasExample: false,
    hasParams: false,
    hasReturns: false,
  }

  if (lineNumber < 1 || lineNumber > lines.length) {
    return { hasJSDoc: false, jsDocQuality: quality }
  }

  // Walk backwards from the line to find a JSDoc block
  let idx = lineNumber - 2 // 0-indexed, one above the target line

  // Skip blank lines
  while (idx >= 0 && lines[idx]!.trim() === '') {
    idx--
  }

  if (idx < 0) {
    return { hasJSDoc: false, jsDocQuality: quality }
  }

  // Check if the line above ends with */
  const lineAbove = lines[idx]!.trim()
  if (!lineAbove.endsWith('*/')) {
    // Maybe it's a single-line JSDoc: /** description */
    if (lineAbove.startsWith('/**') && lineAbove.endsWith('*/')) {
      const content = lineAbove.slice(3, -2).trim()
      return {
        hasJSDoc: true,
        jsDocQuality: {
          hasDescription: hasDescriptionText(content),
          hasExample: content.includes('@example'),
          hasParams: content.includes('@param'),
          hasReturns: content.includes('@returns') || content.includes('@return'),
        },
      }
    }
    return { hasJSDoc: false, jsDocQuality: quality }
  }

  // Multi-line JSDoc — walk backwards to find the start /**
  const jsDocLines: string[] = [lineAbove]
  let j = idx - 1
  while (j >= 0) {
    const currentLine = lines[j]!.trim()
    jsDocLines.unshift(currentLine)
    if (currentLine.startsWith('/**')) {
      break
    }
    j--
  }

  // Verify we found /**
  const firstLine = jsDocLines[0]
  if (!firstLine || !firstLine.startsWith('/**')) {
    return { hasJSDoc: false, jsDocQuality: quality }
  }

  // Combine all lines into a single JSDoc string
  const fullJSDoc = jsDocLines
    .join('\n')
    .replace(/^\/\*\*/, '')
    .replace(/\*\/$/, '')
    .split('\n')
    .map((l) => l.trim().replace(/^\*\s?/, ''))
    .join('\n')
    .trim()

  return {
    hasJSDoc: true,
    jsDocQuality: {
      hasDescription: hasDescriptionText(fullJSDoc),
      hasExample: fullJSDoc.includes('@example'),
      hasParams: fullJSDoc.includes('@param'),
      hasReturns: fullJSDoc.includes('@returns') || fullJSDoc.includes('@return'),
    },
  }
}

/**
 * Check if JSDoc content has a description (text beyond just tags).
 */
function hasDescriptionText(content: string): boolean {
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    if (trimmed.startsWith('@')) continue
    return true
  }
  return false
}

// ─── File analysis ───────────────────────────────────────

/**
 * Analyze documentation coverage for a single file.
 *
 * @example
 * const result = analyzeFileDocCoverage(content, 'src/foo.ts')
 * // result.coveragePercentage === 75.0
 */
export function analyzeFileDocCoverage(content: string, filePath: string): FileDocCoverage {
  const lines = content.split('\n')
  const exports = extractExportedItems(content, filePath)

  for (const item of exports) {
    const jsDocResult = checkJSDoc(lines, item.line)
    item.hasJSDoc = jsDocResult.hasJSDoc
    item.jsDocQuality = jsDocResult.jsDocQuality
  }

  const totalExports = exports.length
  const documentedExports = exports.filter((e) => e.hasJSDoc).length
  const coveragePercentage = totalExports > 0 ? Math.round((documentedExports / totalExports) * 10000) / 100 : 100

  return {
    coveragePercentage,
    documentedExports,
    exports,
    filePath,
    relativePath: filePath,
    totalExports,
  }
}

// ─── Aggregation ─────────────────────────────────────────

/**
 * Build aggregated documentation coverage result from file results.
 *
 * @example
 * const result = buildDocCoverageResult([fileResult1, fileResult2])
 * // result.totalExports === 10
 */
export function buildDocCoverageResult(fileResults: FileDocCoverage[]): DocCoverageResult {
  const allExports = fileResults.flatMap((f) => f.exports)
  const totalExports = allExports.length
  const documentedExports = allExports.filter((e) => e.hasJSDoc).length
  const coveragePercentage = totalExports > 0 ? Math.round((documentedExports / totalExports) * 10000) / 100 : 100

  // byType breakdown
  const typeMap = new Map<string, { documented: number; total: number }>()
  for (const item of allExports) {
    const existing = typeMap.get(item.type)
    if (existing) {
      existing.total++
      if (item.hasJSDoc) existing.documented++
    } else {
      typeMap.set(item.type, { documented: item.hasJSDoc ? 1 : 0, total: 1 })
    }
  }

  const byType = Array.from(typeMap.entries()).map(([type, counts]) => ({
    documented: counts.documented,
    percentage: counts.total > 0 ? Math.round((counts.documented / counts.total) * 10000) / 100 : 100,
    total: counts.total,
    type,
  }))

  // byFile summary
  const byFile = fileResults
    .filter((f) => f.totalExports > 0)
    .map((f) => ({
      documented: f.documentedExports,
      file: f.relativePath,
      percentage: f.coveragePercentage,
      total: f.totalExports,
    }))

  // undocumented items
  const undocumentedItems = allExports.filter((e) => !e.hasJSDoc)

  return {
    byFile,
    byType,
    coveragePercentage,
    documentedExports,
    files: fileResults,
    totalExports,
    undocumentedItems,
  }
}

// ─── Filtering ───────────────────────────────────────────

/**
 * Filter results by documentation status.
 *
 * @example
 * const filtered = filterResults(result, { showUndocumented: true })
 * // filtered.files only contain items without JSDoc
 */
export function filterResults(result: DocCoverageResult, options: FilterOptions): DocCoverageResult {
  const filteredFiles = result.files.map((file) => {
    let filteredExports = file.exports
    if (options.showUndocumented) {
      filteredExports = file.exports.filter((e) => !e.hasJSDoc)
    } else if (options.showDocumented) {
      filteredExports = file.exports.filter((e) => e.hasJSDoc)
    }
    const totalExports = filteredExports.length
    const documentedExports = filteredExports.filter((e) => e.hasJSDoc).length
    const coveragePercentage =
      totalExports > 0 ? Math.round((documentedExports / totalExports) * 10000) / 100 : 100
    return {
      ...file,
      coveragePercentage,
      documentedExports,
      exports: filteredExports,
      totalExports,
    }
  })

  return buildDocCoverageResult(filteredFiles)
}
