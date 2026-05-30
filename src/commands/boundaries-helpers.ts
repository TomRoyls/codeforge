// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModuleDefinition {
  name: string
  path: string
  files: string[]
  totalLines: number
  exportedSymbols: string[]
  layer: string
}

export interface BoundaryRule {
  from: string
  to: string
  allowed: boolean
  reason: string
}

export interface BoundaryCheck {
  source: string
  target: string
  sourceFile: string
  targetFile: string
  importedSymbols: string[]
  allowed: boolean
  rule: string
}

export interface BoundaryViolation {
  source: string
  target: string
  sourceFile: string
  targetFile: string
  importedSymbols: string[]
  severity: 'warning' | 'error'
  reason: string
  suggestion: string
}

export interface ModuleHealth {
  module: string
  violations: number
  compliance: number
  status: 'healthy' | 'warning' | 'critical'
}

export interface BoundariesStats {
  totalModules: number
  totalChecks: number
  violationsCount: number
  complianceScore: number
  compliantModules: number
  nonCompliantModules: number
  mostViolations: string
}

export interface BoundariesResult {
  modules: ModuleDefinition[]
  rules: BoundaryRule[]
  checks: BoundaryCheck[]
  violations: BoundaryViolation[]
  stats: BoundariesStats
  moduleHealth: ModuleHealth[]
  recommendations: string[]
}

export interface BoundariesOptions {
  verbose?: boolean
}

// ─── Layer Definitions ────────────────────────────────────────────────────────

const LAYER_MAP: Record<string, string> = {
  commands: 'presentation',
  handlers: 'presentation',
  routes: 'presentation',
  controllers: 'presentation',
  core: 'business',
  services: 'business',
  middleware: 'business',
  utils: 'infrastructure',
  helpers: 'infrastructure',
  lib: 'infrastructure',
  shared: 'infrastructure',
  types: 'foundation',
  models: 'foundation',
  interfaces: 'foundation',
}

const LAYER_ORDER: Record<string, number> = {
  presentation: 0,
  business: 1,
  infrastructure: 2,
  foundation: 3,
}

/**
 * Get the architectural layer for a module name.
 *
 * @example
 * getLayer('commands') // 'presentation'
 */
export function getLayer(moduleName: string): string {
  return LAYER_MAP[moduleName] ?? 'business'
}

// ─── discoverModules ──────────────────────────────────────────────────────────

/**
 * Group files by top-level directory under src/.
 *
 * @example
 * discoverModules(['src/commands/a.ts', 'src/core/b.ts']) // [ModuleDefinition, ...]
 */
export function discoverModules(files: string[], contents: string[]): ModuleDefinition[] {
  const moduleMap = new Map<string, { files: string[]; lines: number; exports: string[] }>()

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]!
    const content = contents[i] ?? ''
    const parts = filePath.split('/')
    const srcIdx = parts.indexOf('src')
    if (srcIdx === -1 || srcIdx + 1 >= parts.length) continue
    const moduleName = parts[srcIdx + 1]!

    if (!moduleMap.has(moduleName)) {
      moduleMap.set(moduleName, { files: [], lines: 0, exports: [] })
    }
    const entry = moduleMap.get(moduleName)!
    entry.files.push(filePath)
    entry.lines += content.split('\n').length

    const exportMatches = content.matchAll(/export\s+(?:function|class|const|interface|type|enum)\s+(\w+)/g)
    for (const match of exportMatches) {
      entry.exports.push(match[1] ?? '')
    }
  }

  const modules: ModuleDefinition[] = []
  for (const [name, data] of moduleMap) {
    modules.push({
      name,
      path: `src/${name}`,
      files: data.files,
      totalLines: data.lines,
      exportedSymbols: data.exports,
      layer: getLayer(name),
    })
  }

  return modules
}

// ─── inferBoundaryRules ───────────────────────────────────────────────────────

/**
 * Generate boundary rules based on layer hierarchy.
 *
 * @example
 * inferBoundaryRules(modules) // [BoundaryRule, ...]
 */
export function inferBoundaryRules(modules: ModuleDefinition[]): BoundaryRule[] {
  const rules: BoundaryRule[] = []

  for (const source of modules) {
    for (const target of modules) {
      if (source.name === target.name) continue
      const sourceLayer = LAYER_ORDER[source.layer] ?? 1
      const targetLayer = LAYER_ORDER[target.layer] ?? 1

      if (targetLayer > sourceLayer) {
        rules.push({
          from: source.name,
          to: target.name,
          allowed: true,
          reason: `${source.layer} (${source.name}) can depend on ${target.layer} (${target.name})`,
        })
      } else if (targetLayer === sourceLayer && source.layer === 'presentation') {
        rules.push({
          from: source.name,
          to: target.name,
          allowed: false,
          reason: `Same-layer import between presentation modules is discouraged`,
        })
      } else {
        rules.push({
          from: source.name,
          to: target.name,
          allowed: false,
          reason: `${source.layer} (${source.name}) should not depend on ${target.layer} (${target.name})`,
        })
      }
    }
  }

  return rules
}

// ─── extractImports ───────────────────────────────────────────────────────────

/**
 * Extract import targets from file content, resolving to project files.
 *
 * @example
 * extractImports('a.ts', content, fileSet) // ['b.ts']
 */
export function extractImports(
  filePath: string,
  content: string,
  fileSet: Set<string>,
): string[] {
  const dir = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : ''
  const dirParts = dir ? dir.split('/') : []
  const imports: string[] = []

  const importMatches = content.matchAll(/from\s+['"](\.[^'"]+)['"]/g)
  for (const match of importMatches) {
    const rawPath = match[1] ?? ''
    const resolved = resolvePath(rawPath, dirParts, fileSet)
    if (resolved) {
      imports.push(resolved)
    }
  }

  return imports
}

/**
 * Resolve a relative import path to a project file.
 *
 * @example
 * resolvePath('./b', ['src', 'commands'], fileSet) // 'src/commands/b.ts'
 */
export function resolvePath(
  rawPath: string,
  dirParts: string[],
  fileSet: Set<string>,
): string | null {
  const segments = rawPath.split('/')
  const current = [...dirParts]

  for (const seg of segments) {
    if (seg === '..') {
      current.pop()
    } else if (seg !== '.') {
      current.push(seg)
    }
  }

  const joined = current.join('/')
  const extRemoved = joined.replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '')

  const candidates = [
    extRemoved + '.ts',
    extRemoved + '.tsx',
    extRemoved + '.js',
    extRemoved + '/index.ts',
    extRemoved + '/index.js',
    joined,
  ]

  for (const candidate of candidates) {
    if (fileSet.has(candidate)) return candidate
  }

  return null
}

// ─── getModuleForFile ─────────────────────────────────────────────────────────

/**
 * Get the module name for a file path.
 *
 * @example
 * getModuleForFile('src/commands/a.ts') // 'commands'
 */
export function getModuleForFile(filePath: string): string {
  const parts = filePath.split('/')
  const srcIdx = parts.indexOf('src')
  if (srcIdx === -1 || srcIdx + 1 >= parts.length) return ''
  return parts[srcIdx + 1]!
}

// ─── checkBoundaries ──────────────────────────────────────────────────────────

/**
 * Check each import against boundary rules.
 *
 * @example
 * checkBoundaries(modules, files, contents, rules) // [BoundaryCheck, ...]
 */
export function checkBoundaries(
  _modules: ModuleDefinition[],
  files: string[],
  contents: string[],
  rules: BoundaryRule[],
): BoundaryCheck[] {
  const checks: BoundaryCheck[] = []
  const fileSet = new Set(files)

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]!
    const content = contents[i] ?? ''
    const sourceModule = getModuleForFile(filePath)

    if (!sourceModule) continue
    if (filePath.includes('.test.') || filePath.includes('.spec.')) continue

    const importedFiles = extractImports(filePath, content, fileSet)

    for (const importedFile of importedFiles) {
      const targetModule = getModuleForFile(importedFile)
      if (!targetModule || targetModule === sourceModule) continue

      const rule = rules.find((r) => r.from === sourceModule && r.to === targetModule)
      const allowed = rule ? rule.allowed : true
      const reason = rule ? rule.reason : 'No explicit rule (allowed by default)'

      const symbolMatches = content.matchAll(new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+['"]\\.[^'"]*${importedFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|[^'"]*['"]`, 'g'))
      const symbols: string[] = []
      for (const sm of symbolMatches) {
        const syms = (sm[1] ?? '').split(',').map((s: string) => s.trim()).filter(Boolean)
        symbols.push(...syms)
      }

      checks.push({
        source: sourceModule,
        target: targetModule,
        sourceFile: filePath,
        targetFile: importedFile,
        importedSymbols: symbols.length > 0 ? symbols : ['*'],
        allowed,
        rule: reason,
      })
    }
  }

  return checks
}

// ─── detectBoundaryViolation ──────────────────────────────────────────────────

/**
 * Determine if a check is a violation and produce a violation object.
 *
 * @example
 * detectBoundaryViolation(check) // BoundaryViolation | null
 */
export function detectBoundaryViolation(check: BoundaryCheck): BoundaryViolation | null {
  if (check.allowed) return null

  const severity: 'warning' | 'error' = check.rule.includes('discouraged') ? 'warning' : 'error'

  return {
    source: check.source,
    target: check.target,
    sourceFile: check.sourceFile,
    targetFile: check.targetFile,
    importedSymbols: check.importedSymbols,
    severity,
    reason: check.rule,
    suggestion: generateSuggestion(check.source, check.target),
  }
}

// ─── generateSuggestion ───────────────────────────────────────────────────────

/**
 * Generate a suggestion for fixing a boundary violation.
 *
 * @example
 * generateSuggestion('core', 'commands') // 'Move shared logic...'
 */
export function generateSuggestion(source: string, target: string): string {
  const sourceLayer = LAYER_ORDER[getLayer(source)] ?? 1
  const targetLayer = LAYER_ORDER[getLayer(target)] ?? 1

  if (targetLayer < sourceLayer) {
    return `Move shared logic from ${target} to a lower layer (utils/helpers) that ${source} can depend on`
  }
  return `Consider using an event system or shared interface instead of direct import from ${target}`
}

// ─── computeModuleHealth ──────────────────────────────────────────────────────

/**
 * Compute per-module compliance health.
 *
 * @example
 * computeModuleHealth(modules, violations) // [ModuleHealth, ...]
 */
export function computeModuleHealth(
  modules: ModuleDefinition[],
  violations: BoundaryViolation[],
): ModuleHealth[] {
  return modules.map((mod) => {
    const modViolations = violations.filter((v) => v.source === mod.name)
    const count = modViolations.length
    const compliance = Math.max(0, 100 - count * 20)

    let status: 'healthy' | 'warning' | 'critical'
    if (compliance >= 80) status = 'healthy'
    else if (compliance >= 50) status = 'warning'
    else status = 'critical'

    return { module: mod.name, violations: count, compliance, status }
  })
}

// ─── computeComplianceScore ───────────────────────────────────────────────────

/**
 * Compute overall compliance score (0-100).
 *
 * @example
 * computeComplianceScore(10, 2) // 80
 */
export function computeComplianceScore(totalChecks: number, violationsCount: number): number {
  if (totalChecks === 0) return 100
  return Math.max(0, Math.round((1 - violationsCount / totalChecks) * 100))
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate actionable recommendations from violations.
 *
 * @example
 * generateRecommendations(violations, stats) // ['Fix 3 violations...']
 */
export function generateRecommendations(
  violations: BoundaryViolation[],
  stats: BoundariesStats,
): string[] {
  const recs: string[] = []

  if (stats.violationsCount === 0) {
    recs.push('All module boundaries are respected. No violations found.')
    return recs
  }

  const errorViolations = violations.filter((v) => v.severity === 'error')
  if (errorViolations.length > 0) {
    recs.push(`Fix ${errorViolations.length} error-level violation${errorViolations.length > 1 ? 's' : ''} — these break the layer hierarchy`)
  }

  const warningViolations = violations.filter((v) => v.severity === 'warning')
  if (warningViolations.length > 0) {
    recs.push(`Review ${warningViolations.length} warning${warningViolations.length > 1 ? 's' : ''} — same-layer imports between modules are discouraged`)
  }

  const violationMap = new Map<string, number>()
  for (const v of violations) {
    violationMap.set(v.source, (violationMap.get(v.source) ?? 0) + 1)
  }
  const worst = [...violationMap.entries()].sort((a, b) => b[1] - a[1])[0]
  if (worst) {
    recs.push(`Focus on ${worst[0]} — it has ${worst[1]} violation${worst[1] > 1 ? 's' : ''}, the most of any module`)
  }

  if (stats.complianceScore < 50) {
    recs.push('Compliance score is critically low — consider restructuring the module hierarchy')
  }

  return recs
}

// ─── buildBoundariesResult ────────────────────────────────────────────────────

/**
 * Orchestrate full boundary analysis.
 *
 * @example
 * buildBoundariesResult(files, contents, {}) // BoundariesResult
 */
export function buildBoundariesResult(
  files: string[],
  contents: string[],
  _options?: BoundariesOptions,
): BoundariesResult {
  const modules = discoverModules(files, contents)
  const rules = inferBoundaryRules(modules)
  const checks = checkBoundaries(modules, files, contents, rules)

  const violations: BoundaryViolation[] = []
  for (const check of checks) {
    const v = detectBoundaryViolation(check)
    if (v) violations.push(v)
  }

  const totalChecks = checks.length
  const violationsCount = violations.length
  const complianceScore = computeComplianceScore(totalChecks, violationsCount)
  const moduleHealth = computeModuleHealth(modules, violations)

  const compliantModules = moduleHealth.filter((mh) => mh.status === 'healthy').length
  const nonCompliantModules = moduleHealth.filter((mh) => mh.status !== 'healthy').length

  let mostViolations = 'none'
  let maxV = 0
  for (const mh of moduleHealth) {
    if (mh.violations > maxV) {
      maxV = mh.violations
      mostViolations = mh.module
    }
  }

  const stats: BoundariesStats = {
    totalModules: modules.length,
    totalChecks,
    violationsCount,
    complianceScore,
    compliantModules,
    nonCompliantModules,
    mostViolations,
  }

  const recommendations = generateRecommendations(violations, stats)

  return { modules, rules, checks, violations, stats, moduleHealth, recommendations }
}
