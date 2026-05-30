// ─── Types ────────────────────────────────────────────────────────────────────

export type ExportType = 'function' | 'class' | 'interface' | 'type' | 'constant' | 'enum' | 'namespace'

export interface ApiParameter {
  name: string
  type: string
  isOptional: boolean
  hasDefault: boolean
  defaultValue: string | null
}

export interface ApiExport {
  name: string
  type: ExportType
  file: string
  line: number
  isDefaultExport: boolean
  isNamedExport: boolean
  isReExport: boolean
  isTypeOnly: boolean
  isDeprecated: boolean
  hasJSDoc: boolean
  jsDocDescription: string | null
  parameters: ApiParameter[]
  returnType: string | null
  usageCount: number
  isUsedInternally: boolean
  isUsedExternally: boolean
}

export interface ApiModule {
  file: string
  exports: ApiExport[]
  exportCount: number
  documentedCount: number
  deprecatedCount: number
  internalCount: number
  externalCount: number
  unusedCount: number
}

export interface SurfaceStats {
  totalExports: number
  totalModules: number
  documentedExports: number
  undocumentedExports: number
  deprecatedExports: number
  unusedExports: number
  defaultExports: number
  namedExports: number
  typeOnlyExports: number
  averageUsageCount: number
  documentationCoverage: number
  surfaceArea: number
}

export interface SurfaceResult {
  modules: ApiModule[]
  exports: ApiExport[]
  stats: SurfaceStats
  unused: ApiExport[]
  undocumented: ApiExport[]
  deprecated: ApiExport[]
  recommendations: string[]
}

export interface SurfaceOptions {
  verbose?: boolean
}

// ─── extractJSDoc ─────────────────────────────────────────────────────────────

/**
 * Extract JSDoc comment block above a given 1-based line number.
 *
 * @example
 * extractJSDoc(['/** docs *\/', 'function foo() {}'], 2)
 * // => { description: 'docs', hasJSDoc: true }
 */
export function extractJSDoc(
  lines: string[],
  targetLine: number,
): { hasJSDoc: boolean; description: string | null } {
  if (targetLine <= 1) return { hasJSDoc: false, description: null }

  const above = lines[targetLine - 2]
  if (!above) return { hasJSDoc: false, description: null }

  const trimmed = above.trim()
  if (trimmed.startsWith('/**') && trimmed.endsWith('*/')) {
    const desc = trimmed.replace(/^\s*\/\*\*\s*/, '').replace(/\s*\*\/$/, '').replace(/\s*\*\s*/g, ' ').trim()
    return { hasJSDoc: true, description: desc || null }
  }

  let jsdocEnd = -1
  for (let i = targetLine - 2; i >= 0; i--) {
    if (lines[i]?.trim().endsWith('*/')) { jsdocEnd = i; break }
  }

  if (jsdocEnd === -1) return { hasJSDoc: false, description: null }

  if (jsdocEnd !== targetLine - 2) {
    let blocked = false
    for (let j = jsdocEnd + 1; j < targetLine - 1; j++) {
      const between = lines[j]?.trim()
      if (between && !between.startsWith('*') && !between.startsWith('//')) {
        blocked = true
        break
      }
    }
    if (blocked) return { hasJSDoc: false, description: null }
  }

  let jsdocStart = jsdocEnd
  for (let i = jsdocEnd; i >= 0; i--) {
    if (lines[i]?.includes('/**')) { jsdocStart = i; break }
  }

  const block = lines.slice(jsdocStart, jsdocEnd + 1).join('\n')
  const descMatch = block.match(/\/\*\*\s*\n?\s*\*\s*([^@\n*]+)/)
  const description = descMatch?.[1]?.trim() ?? null
  return { hasJSDoc: true, description }
}

// ─── checkDeprecated ──────────────────────────────────────────────────────────

/**
 * Check if a JSDoc description contains a @deprecated tag.
 *
 * @example
 * checkDeprecated('@deprecated use bar instead')
 * // => true
 */
export function checkDeprecated(jsDoc: string | null): boolean {
  if (!jsDoc) return false
  return jsDoc.includes('@deprecated')
}

// ─── extractParameters ────────────────────────────────────────────────────────

/**
 * Parse function parameters from a line of code.
 *
 * @example
 * extractParameters('function foo(a: number, b?: string = "hi") {}')
 * // => [{ name: 'a', type: 'number', ... }, ...]
 */
export function extractParameters(line: string): ApiParameter[] {
  const params: ApiParameter[] = []
  const match = line.match(/\(([^)]*)\)/)
  if (!match) return params

  const raw = match[1]
  if (!raw || !raw.trim()) return params

  const parts = splitParams(raw)
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed || trimmed === '...' || trimmed.startsWith('...')) continue

    const optional = trimmed.includes('?')
    const hasDefault = trimmed.includes('=')
    const cleaned = trimmed.replace(/\s*\?\s*/, '?').replace(/\s*=\s*[^,)]+/, '')

    const nameMatch = cleaned.match(/^(\.\.\.)?(\w+)\??/)
    const typeMatch = cleaned.match(/:\s*([^,?]+)/)

    const name = nameMatch?.[2] ?? cleaned
    const type = typeMatch?.[1]?.trim() ?? 'unknown'
    const defaultMatch = trimmed.match(/=\s*([^,)]+)/)

    params.push({
      name,
      type,
      isOptional: optional,
      hasDefault,
      defaultValue: defaultMatch?.[1]?.trim() ?? null,
    })
  }

  return params
}

function splitParams(raw: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const ch of raw) {
    if (ch === '(' || ch === '<' || ch === '[') depth++
    if (ch === ')' || ch === '>' || ch === ']') depth--
    if (ch === ',' && depth === 0) {
      parts.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current)
  return parts
}

// ─── extractReturnType ────────────────────────────────────────────────────────

/**
 * Parse return type annotation from a function line.
 *
 * @example
 * extractReturnType('function foo(): string {}')
 * // => 'string'
 */
export function extractReturnType(line: string): string | null {
  const match = line.match(/\)\s*:\s*([^{;\n]+)/)
  return match?.[1]?.trim() ?? null
}

// ─── extractExports ───────────────────────────────────────────────────────────

const EXPORT_PATTERNS: Array<{
  regex: RegExp
  type: ExportType
  extractName: (m: RegExpMatchArray) => string
  isDefault: boolean
  isReExport: boolean
}> = [
  {
    regex: /^export\s+default\s+function\s+(\w+)/,
    type: 'function',
  extractName: (m) => m[1] ?? '',
  isDefault: true,
  isReExport: false,
},
{
  regex: /^export\s+default\s+class\s+(\w+)/,
  type: 'class',
  extractName: (m) => m[1] ?? '',
  isDefault: true,
  isReExport: false,
},
{
  regex: /^export\s+function\s+(\w+)/,
  type: 'function',
  extractName: (m) => m[1] ?? '',
  isDefault: false,
  isReExport: false,
},
{
  regex: /^export\s+(?:async\s+)?function\s+(\w+)/,
  type: 'function',
  extractName: (m) => m[1] ?? '',
  isDefault: false,
  isReExport: false,
},
{
  regex: /^export\s+class\s+(\w+)/,
  type: 'class',
  extractName: (m) => m[1] ?? '',
  isDefault: false,
  isReExport: false,
},
{
  regex: /^export\s+interface\s+(\w+)/,
  type: 'interface',
  extractName: (m) => m[1] ?? '',
  isDefault: false,
  isReExport: false,
},
{
  regex: /^export\s+type\s+(\w+)\s*[=<]/,
  type: 'type',
  extractName: (m) => m[1] ?? '',
  isDefault: false,
  isReExport: false,
},
{
  regex: /^export\s+enum\s+(\w+)/,
  type: 'enum',
  extractName: (m) => m[1] ?? '',
  isDefault: false,
  isReExport: false,
},
{
  regex: /^export\s+namespace\s+(\w+)/,
  type: 'namespace',
  extractName: (m) => m[1] ?? '',
  isDefault: false,
  isReExport: false,
},
{
  regex: /^export\s+const\s+(\w+)/,
  type: 'constant',
  extractName: (m) => m[1] ?? '',
  isDefault: false,
  isReExport: false,
},
{
  regex: /^export\s+let\s+(\w+)/,
  type: 'constant',
  extractName: (m) => m[1] ?? '',
  isDefault: false,
  isReExport: false,
},
{
  regex: /^export\s+var\s+(\w+)/,
  type: 'constant',
  extractName: (m) => m[1] ?? '',
  isDefault: false,
  isReExport: false,
},
]

/**
 * Extract all exports from source content.
 *
 * @example
 * extractExports('export function foo() {}', 'a.ts')
 * // => [{ name: 'foo', type: 'function', ... }]
 */
export function extractExports(content: string, filePath: string): ApiExport[] {
  const results: ApiExport[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim()
    if (!line) continue
    if (!line.startsWith('export')) continue
    if (line.startsWith('//')) continue

    let matched = false

    for (const pattern of EXPORT_PATTERNS) {
      const m = line.match(pattern.regex)
      if (m) {
        const name = pattern.extractName(m)
        const { hasJSDoc, description } = extractJSDoc(lines, i + 1)
        const params = pattern.type === 'function' ? extractParameters(line) : []
        const retType = pattern.type === 'function' ? extractReturnType(line) : null

        results.push({
          name,
          type: pattern.type,
          file: filePath,
          line: i + 1,
          isDefaultExport: pattern.isDefault,
          isNamedExport: !pattern.isDefault,
          isReExport: pattern.isReExport,
          isTypeOnly: false,
          isDeprecated: checkDeprecated(description),
          hasJSDoc,
          jsDocDescription: description,
          parameters: params,
          returnType: retType,
          usageCount: 0,
          isUsedInternally: false,
          isUsedExternally: false,
        })
        matched = true
        break
      }
    }

    if (!matched) {
      const typeOnlyMatch = line.match(/^export\s+type\s+\{([^}]+)\}/)
      if (typeOnlyMatch) {
        const captured = typeOnlyMatch[1] ?? ''
        const names = captured.split(',').map((n) => n.trim().split(/\s+as\s+/).pop() ?? '')
        for (const name of names) {
          results.push({
            name, type: 'type', file: filePath, line: i + 1,
            isDefaultExport: false, isNamedExport: true, isReExport: false, isTypeOnly: true,
            isDeprecated: false, hasJSDoc: false, jsDocDescription: null,
            parameters: [], returnType: null, usageCount: 0,
            isUsedInternally: false, isUsedExternally: false,
          })
        }
        continue
      }

      const reExportMatch = line.match(/^export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/)
      if (reExportMatch) {
        const captured = reExportMatch[1] ?? ''
        const names = captured.split(',').map((n) => n.trim().split(/\s+as\s+/).pop() ?? '')
        for (const name of names) {
          results.push({
            name, type: 'constant', file: filePath, line: i + 1,
            isDefaultExport: false, isNamedExport: true, isReExport: true, isTypeOnly: false,
            isDeprecated: false, hasJSDoc: false, jsDocDescription: null,
            parameters: [], returnType: null, usageCount: 0,
            isUsedInternally: false, isUsedExternally: false,
          })
        }
        continue
      }

      const namedMatch = line.match(/^export\s+\{([^}]+)\}/)
      if (namedMatch) {
        const captured = namedMatch[1] ?? ''
        const names = captured.split(',').map((n) => n.trim().split(/\s+as\s+/).pop() ?? '')
        for (const name of names) {
          results.push({
            name, type: 'constant', file: filePath, line: i + 1,
            isDefaultExport: false, isNamedExport: true, isReExport: false, isTypeOnly: false,
            isDeprecated: false, hasJSDoc: false, jsDocDescription: null,
            parameters: [], returnType: null, usageCount: 0,
            isUsedInternally: false, isUsedExternally: false,
          })
        }
        continue
      }

      const defaultExprMatch = line.match(/^export\s+default\s+(\w+)/)
      if (defaultExprMatch) {
        const name = defaultExprMatch[1] ?? ''
        results.push({
          name, type: 'constant', file: filePath, line: i + 1,
          isDefaultExport: true, isNamedExport: false, isReExport: false, isTypeOnly: false,
          isDeprecated: false, hasJSDoc: false, jsDocDescription: null,
          parameters: [], returnType: null, usageCount: 0,
          isUsedInternally: false, isUsedExternally: false,
        })
      }
    }
  }

  return results
}

// ─── computeUsageCount ────────────────────────────────────────────────────────

/**
 * Count how many files import a given export name.
 *
 * @example
 * computeUsageCount('foo', ['a.ts', 'b.ts'], ["import { foo } from 'a'", "import bar from 'x'"])
 * // => 1
 */
export function computeUsageCount(
  exportName: string,
  files: string[],
  contents: string[],
  sourceFile: string,
): number {
  let count = 0
  for (let i = 0; i < contents.length; i++) {
    if (files[i] === sourceFile) continue
    const content = contents[i]
    if (!content) continue

    const namedImportRegex = new RegExp(`\\bimport\\s*\\{[^}]*\\b${escapeRegex(exportName)}\\b[^}]*\\}`, 'm')
    const defaultImportRegex = new RegExp(`\\bimport\\s+${escapeRegex(exportName)}\\s+from`, 'm')
    const starImportRegex = new RegExp(`\\bimport\\s+\\*\\s+as\\s+\\w+\\s+from`, 'm')
    const dynamicImportRegex = new RegExp(`\\bimport\\s*\\(`, 'm')

    if (namedImportRegex.test(content) || defaultImportRegex.test(content)) {
      count++
    } else if (starImportRegex.test(content) || dynamicImportRegex.test(content)) {
      count++
    }
  }
  return count
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─── classifyUsage ────────────────────────────────────────────────────────────

/**
 * Classify export usage as internal, external, or unused.
 *
 * @example
 * classifyUsage(3, 'utils.ts')
 * // => { isUsedInternally: true, isUsedExternally: true }
 */
export function classifyUsage(
  usageCount: number,
  _moduleName: string,
): { isUsedInternally: boolean; isUsedExternally: boolean } {
  return {
    isUsedInternally: usageCount > 0,
    isUsedExternally: usageCount > 1,
  }
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate recommendations based on surface analysis.
 *
 * @example
 * generateRecommendations(unused, undocumented, stats)
 * // => ['Consider removing 3 unused exports...']
 */
export function generateRecommendations(
  unused: ApiExport[],
  undocumented: ApiExport[],
  stats: SurfaceStats,
): string[] {
  const recs: string[] = []

  if (unused.length > 0) {
    recs.push(`Consider removing ${unused.length} unused export(s): ${unused.slice(0, 5).map((e) => e.name).join(', ')}${unused.length > 5 ? '...' : ''}`)
  }

  if (undocumented.length > 0) {
    const coverage = Math.round(stats.documentationCoverage)
    recs.push(`Add JSDoc to ${undocumented.length} undocumented export(s) (current coverage: ${coverage}%)`)
  }

  if (stats.deprecatedExports > 0) {
    recs.push(`Clean up ${stats.deprecatedExports} deprecated export(s) still in public API`)
  }

  if (stats.surfaceArea > 100) {
    recs.push(`Large API surface (${stats.surfaceArea} symbols) — consider splitting into smaller modules`)
  }

  if (stats.defaultExports > 0 && stats.namedExports > stats.defaultExports * 10) {
    recs.push('Prefer named exports over default exports for better tree-shaking')
  }

  if (recs.length === 0) {
    recs.push('API surface looks well-maintained and documented')
  }

  return recs
}

// ─── buildSurfaceResult ───────────────────────────────────────────────────────

/**
 * Build the complete API surface analysis result.
 *
 * @example
 * buildSurfaceResult(['a.ts'], ['export function foo() {}'])
 */
export function buildSurfaceResult(
  filePaths: string[],
  contents: string[],
  _options?: SurfaceOptions,
): SurfaceResult {
  const allExports: ApiExport[] = []

  for (let i = 0; i < filePaths.length; i++) {
    const content = contents[i] ?? ''
    const filePath = filePaths[i] ?? ''
    const exports = extractExports(content, filePath)
    allExports.push(...exports)
  }

  for (const exp of allExports) {
    const usage = computeUsageCount(exp.name, filePaths, contents, exp.file)
    exp.usageCount = usage
    const classification = classifyUsage(usage, exp.file)
    exp.isUsedInternally = classification.isUsedInternally
    exp.isUsedExternally = classification.isUsedExternally
  }

  const moduleMap = new Map<string, ApiExport[]>()
  for (const exp of allExports) {
    if (!moduleMap.has(exp.file)) moduleMap.set(exp.file, [])
    moduleMap.get(exp.file)!.push(exp)
  }

  const modules: ApiModule[] = []
  for (const [file, exports] of moduleMap) {
    modules.push({
      file,
      exports,
      exportCount: exports.length,
      documentedCount: exports.filter((e) => e.hasJSDoc).length,
      deprecatedCount: exports.filter((e) => e.isDeprecated).length,
      internalCount: exports.filter((e) => e.isUsedInternally).length,
      externalCount: exports.filter((e) => e.isUsedExternally).length,
      unusedCount: exports.filter((e) => e.usageCount === 0).length,
    })
  }

  const totalExports = allExports.length
  const documentedExports = allExports.filter((e) => e.hasJSDoc).length
  const deprecatedExports = allExports.filter((e) => e.isDeprecated).length
  const unusedExports = allExports.filter((e) => e.usageCount === 0).length
  const defaultExports = allExports.filter((e) => e.isDefaultExport).length
  const namedExports = allExports.filter((e) => e.isNamedExport).length
  const typeOnlyExports = allExports.filter((e) => e.isTypeOnly).length
  const avgUsage = totalExports > 0
    ? Math.round((allExports.reduce((s, e) => s + e.usageCount, 0) / totalExports) * 10) / 10
    : 0
  const docCoverage = totalExports > 0
    ? Math.round((documentedExports / totalExports) * 1000) / 10
    : 100

  const stats: SurfaceStats = {
    totalExports,
    totalModules: modules.length,
    documentedExports,
    undocumentedExports: totalExports - documentedExports,
    deprecatedExports,
    unusedExports,
    defaultExports,
    namedExports,
    typeOnlyExports,
    averageUsageCount: avgUsage,
    documentationCoverage: docCoverage,
    surfaceArea: totalExports,
  }

  const unused = allExports.filter((e) => e.usageCount === 0)
  const undocumented = allExports.filter((e) => !e.hasJSDoc)
  const deprecated = allExports.filter((e) => e.isDeprecated)
  const recommendations = generateRecommendations(unused, undocumented, stats)

  return { modules, exports: allExports, stats, unused, undocumented, deprecated, recommendations }
}
