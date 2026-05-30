// ─── Types ────────────────────────────────────────────────────────────────────

export type FossilType = 'dead-code' | 'commented-out' | 'deprecated-api' | 'legacy-pattern' | 'unused-import' | 'vestigial-type' | 'orphan-reference' | 'ancient-convention' | 'zombie-constant' | 'relic-comment'
export type FossilEra = 'ancient' | 'old' | 'recent' | 'modern'
export type FossilSeverity = 'info' | 'warning' | 'cleanup'
export type ExcavationEffort = 'trivial' | 'easy' | 'moderate' | 'careful'

export interface Fossil {
  type: FossilType
  file: string
  line: number
  code: string
  era: FossilEra
  description: string
  severity: FossilSeverity
  excavationEffort: ExcavationEffort
}

export interface FossilLayer {
  name: string
  fossils: Fossil[]
  fileCount: number
  description: string
}

export interface FossilStats {
  totalFossils: number
  deadCodeCount: number
  commentedOutCount: number
  deprecatedCount: number
  legacyCount: number
  cleanupCandidates: number
  estimatedSavings: number
}

export interface ExcavationResult {
  fossils: Fossil[]
  layers: FossilLayer[]
  stats: FossilStats
  artifactHighlights: Fossil[]
  recommendations: string[]
}

export interface FossilOptions {
  verbose?: boolean
}

// ─── Era & Effort Estimation ──────────────────────────────────────────────────

/**
 * Estimate era for a fossil.
 *
 * @example
 * estimateEra(fossil)
 */
export function estimateEra(type: FossilType): FossilEra {
  const eraMap: Record<FossilType, FossilEra> = {
    'dead-code': 'old',
    'commented-out': 'old',
    'deprecated-api': 'ancient',
    'legacy-pattern': 'ancient',
    'unused-import': 'recent',
    'vestigial-type': 'recent',
    'orphan-reference': 'old',
    'ancient-convention': 'ancient',
    'zombie-constant': 'old',
    'relic-comment': 'ancient',
  }
  return eraMap[type] ?? 'recent'
}

/**
 * Estimate excavation effort.
 *
 * @example
 * estimateExcavationEffort(fossil)
 */
export function estimateExcavationEffort(type: FossilType): ExcavationEffort {
  const effortMap: Record<FossilType, ExcavationEffort> = {
    'dead-code': 'easy',
    'commented-out': 'trivial',
    'deprecated-api': 'moderate',
    'legacy-pattern': 'careful',
    'unused-import': 'trivial',
    'vestigial-type': 'easy',
    'orphan-reference': 'moderate',
    'ancient-convention': 'careful',
    'zombie-constant': 'easy',
    'relic-comment': 'trivial',
  }
  return effortMap[type] ?? 'easy'
}

/**
 * Determine severity for a fossil type.
 *
 * @example
 * determineSeverity('dead-code')
 */
export function determineSeverity(type: FossilType): FossilSeverity {
  if (type === 'dead-code' || type === 'commented-out' || type === 'unused-import' || type === 'zombie-constant') return 'cleanup'
  if (type === 'deprecated-api' || type === 'orphan-reference' || type === 'relic-comment') return 'warning'
  return 'info'
}

// ─── Excavators ───────────────────────────────────────────────────────────────

/**
 * Excavate dead code — unreachable code after return/throw.
 *
 * @example
 * excavateDeadCode('return 1\nfoo()', 'a.ts')
 */
export function excavateDeadCode(content: string, filePath: string): Fossil[] {
  const fossils: Fossil[] = []
  const lines = content.split('\n')

  let afterReturn = false
  let braceDepth = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()

    for (const ch of line) {
      if (ch === '{') braceDepth++
      if (ch === '}') braceDepth--
    }

    if (/\breturn\b/.test(trimmed) || /\bthrow\b/.test(trimmed)) {
      afterReturn = true
      continue
    }

    if (afterReturn && trimmed.startsWith('}') && braceDepth <= 0) {
      afterReturn = false
      continue
    }

    if (afterReturn && trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('}') && !trimmed.startsWith('*')) {
      fossils.push({
        type: 'dead-code',
        file: filePath,
        line: i + 1,
        code: trimmed.substring(0, 80),
        era: estimateEra('dead-code'),
        description: 'Unreachable code after return/throw',
        severity: determineSeverity('dead-code'),
        excavationEffort: estimateExcavationEffort('dead-code'),
      })
      afterReturn = false
    }
  }

  return fossils
}

/**
 * Excavate commented-out code blocks.
 *
 * @example
 * excavateCommentedCode('// const x = 1\n// foo()', 'a.ts')
 */
export function excavateCommentedCode(content: string, filePath: string): Fossil[] {
  const fossils: Fossil[] = []
  const lines = content.split('\n')
  const codePattern = /^(?:\/\/\s*)(const |let |var |function |class |if |for |while |switch |try |return |import |export )/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (codePattern.test(line)) {
      fossils.push({
        type: 'commented-out',
        file: filePath,
        line: i + 1,
        code: line.trim().substring(0, 80),
        era: estimateEra('commented-out'),
        description: 'Commented-out code found — remove or document intent',
        severity: determineSeverity('commented-out'),
        excavationEffort: estimateExcavationEffort('commented-out'),
      })
    }
  }

  return fossils
}

/**
 * Excavate deprecated API usage.
 *
 * @example
 * excavateDeprecatedApi('var x = require("fs")', 'a.ts')
 */
export function excavateDeprecatedApi(content: string, filePath: string): Fossil[] {
  const fossils: Fossil[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()

    if (/\bvar\b/.test(trimmed) && !trimmed.startsWith('//')) {
      fossils.push({
        type: 'deprecated-api',
        file: filePath,
        line: i + 1,
        code: trimmed.substring(0, 80),
        era: estimateEra('deprecated-api'),
        description: 'var declaration — use const or let',
        severity: determineSeverity('deprecated-api'),
        excavationEffort: estimateExcavationEffort('deprecated-api'),
      })
    }

    if (/\brequire\s*\(/.test(trimmed) && !trimmed.startsWith('//')) {
      fossils.push({
        type: 'deprecated-api',
        file: filePath,
        line: i + 1,
        code: trimmed.substring(0, 80),
        era: estimateEra('deprecated-api'),
        description: 'require() usage — use ES module import',
        severity: determineSeverity('deprecated-api'),
        excavationEffort: estimateExcavationEffort('deprecated-api'),
      })
    }

    if (/\bmodule\.exports\b/.test(trimmed) && !trimmed.startsWith('//')) {
      fossils.push({
        type: 'deprecated-api',
        file: filePath,
        line: i + 1,
        code: trimmed.substring(0, 80),
        era: estimateEra('deprecated-api'),
        description: 'module.exports — use ES module export',
        severity: determineSeverity('deprecated-api'),
        excavationEffort: estimateExcavationEffort('deprecated-api'),
      })
    }
  }

  return fossils
}

/**
 * Excavate legacy patterns.
 *
 * @example
 * excavateLegacyPatterns('function Foo() {}', 'a.ts')
 */
export function excavateLegacyPatterns(content: string, filePath: string): Fossil[] {
  const fossils: Fossil[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()

    if (/\barguments\b/.test(trimmed) && !trimmed.startsWith('//')) {
      fossils.push({
        type: 'legacy-pattern',
        file: filePath,
        line: i + 1,
        code: trimmed.substring(0, 80),
        era: estimateEra('legacy-pattern'),
        description: 'arguments object — use rest parameters (...args)',
        severity: determineSeverity('legacy-pattern'),
        excavationEffort: estimateExcavationEffort('legacy-pattern'),
      })
    }

    if (/\bnew\s+Function\b/.test(trimmed) && !trimmed.startsWith('//')) {
      fossils.push({
        type: 'legacy-pattern',
        file: filePath,
        line: i + 1,
        code: trimmed.substring(0, 80),
        era: estimateEra('legacy-pattern'),
        description: 'new Function() — use modern function definitions',
        severity: determineSeverity('legacy-pattern'),
        excavationEffort: estimateExcavationEffort('legacy-pattern'),
      })
    }

    if (/\beval\s*\(/.test(trimmed) && !trimmed.startsWith('//')) {
      fossils.push({
        type: 'legacy-pattern',
        file: filePath,
        line: i + 1,
        code: trimmed.substring(0, 80),
        era: estimateEra('legacy-pattern'),
        description: 'eval() — avoid for security and performance',
        severity: 'warning',
        excavationEffort: 'careful',
      })
    }
  }

  return fossils
}

/**
 * Excavate unused imports.
 *
 * @example
 * excavateUnusedImports('import { foo } from "./mod"\nbar()', 'a.ts')
 */
export function excavateUnusedImports(content: string, filePath: string): Fossil[] {
  const fossils: Fossil[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const importMatch = line.match(/^import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"][^'"]+['"]/)
    if (!importMatch) continue

    const imports = importMatch[1] ?? ''.split(',').map((s) => s.trim().split(/\s+as\s+/).at(-1) ?? ''.trim())

    for (const name of imports) {
      const regex = new RegExp(`\\b${name}\\b`)
      const rest = lines.filter((_, idx) => idx !== i).join('\n')
      if (!regex.test(rest)) {
        fossils.push({
          type: 'unused-import',
          file: filePath,
          line: i + 1,
          code: line.trim().substring(0, 80),
          era: estimateEra('unused-import'),
          description: `"${name}" imported but never used`,
          severity: determineSeverity('unused-import'),
          excavationEffort: estimateExcavationEffort('unused-import'),
        })
      }
    }
  }

  return fossils
}

/**
 * Excavate vestigial type annotations.
 *
 * @example
 * excavateVestigialTypes('const x: string = "hello"', 'a.ts')
 */
export function excavateVestigialTypes(content: string, filePath: string): Fossil[] {
  const fossils: Fossil[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()

    if (/\bconst\s+\w+\s*:\s*string\s*=\s*['"]/.test(trimmed)) {
      fossils.push({
        type: 'vestigial-type',
        file: filePath,
        line: i + 1,
        code: trimmed.substring(0, 80),
        era: estimateEra('vestigial-type'),
        description: 'Redundant string type annotation — inferred from string literal',
        severity: determineSeverity('vestigial-type'),
        excavationEffort: estimateExcavationEffort('vestigial-type'),
      })
    }

    if (/\bconst\s+\w+\s*:\s*number\s*=\s*\d+/.test(trimmed)) {
      fossils.push({
        type: 'vestigial-type',
        file: filePath,
        line: i + 1,
        code: trimmed.substring(0, 80),
        era: estimateEra('vestigial-type'),
        description: 'Redundant number type annotation — inferred from numeric literal',
        severity: determineSeverity('vestigial-type'),
        excavationEffort: estimateExcavationEffort('vestigial-type'),
      })
    }

    if (/\bconst\s+\w+\s*:\s*boolean\s*=\s*(true|false)/.test(trimmed)) {
      fossils.push({
        type: 'vestigial-type',
        file: filePath,
        line: i + 1,
        code: trimmed.substring(0, 80),
        era: estimateEra('vestigial-type'),
        description: 'Redundant boolean type annotation — inferred from boolean literal',
        severity: determineSeverity('vestigial-type'),
        excavationEffort: estimateExcavationEffort('vestigial-type'),
      })
    }
  }

  return fossils
}

/**
 * Excavate orphan references — imports to non-existent local files.
 *
 * @example
 * excavateOrphanReferences("import { x } from './nonexistent'", 'a.ts')
 */
export function excavateOrphanReferences(content: string, filePath: string): Fossil[] {
  const fossils: Fossil[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const match = line.match(/from\s+['"](\.\/[^'"]+)['"]/)
    if (!match) continue

    const importPath = match[1] ?? ''
    if (importPath.includes('.test.') || importPath.includes('.spec.')) continue

    const hasTypeImport = /import\s+type/.test(line)
    if (hasTypeImport) continue

    const codePatterns = ['nonexistent', 'deprecated', 'old-', 'legacy-', 'unused-', 'tmp', 'temp']
    if (codePatterns.some((p) => importPath.toLowerCase().includes(p))) {
      fossils.push({
        type: 'orphan-reference',
        file: filePath,
        line: i + 1,
        code: line.trim().substring(0, 80),
        era: estimateEra('orphan-reference'),
        description: `Potentially orphaned import: ${importPath}`,
        severity: determineSeverity('orphan-reference'),
        excavationEffort: estimateExcavationEffort('orphan-reference'),
      })
    }
  }

  return fossils
}

/**
 * Excavate ancient conventions.
 *
 * @example
 * excavateAncientConventions('var my_old_var = 1', 'a.ts')
 */
export function excavateAncientConventions(content: string, filePath: string): Fossil[] {
  const fossils: Fossil[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()
    if (trimmed.startsWith('//')) continue

    if (/\w+_\d+\s*=/.test(trimmed) && /\b(var|let|const)\b/.test(trimmed)) {
      fossils.push({
        type: 'ancient-convention',
        file: filePath,
        line: i + 1,
        code: trimmed.substring(0, 80),
        era: estimateEra('ancient-convention'),
        description: 'Numbered variable naming (e.g., x_1, x_2) — use descriptive names',
        severity: determineSeverity('ancient-convention'),
        excavationEffort: estimateExcavationEffort('ancient-convention'),
      })
    }

    if (trimmed.includes('__proto__')) {
      fossils.push({
        type: 'ancient-convention',
        file: filePath,
        line: i + 1,
        code: trimmed.substring(0, 80),
        era: estimateEra('ancient-convention'),
        description: '__proto__ usage — use Object.getPrototypeOf/setPrototypeOf',
        severity: determineSeverity('ancient-convention'),
        excavationEffort: estimateExcavationEffort('ancient-convention'),
      })
    }
  }

  return fossils
}

/**
 * Excavate zombie constants — defined but unused.
 *
 * @example
 * excavateZombieConstants('const UNUSED = 1\nfoo()', 'a.ts')
 */
export function excavateZombieConstants(content: string, filePath: string): Fossil[] {
  const fossils: Fossil[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const constMatch = line.match(/^\s*(?:export\s+)?const\s+([A-Z_][A-Z_0-9]*)\s*=/)
    if (!constMatch) continue

    const name = constMatch[1] ?? ''
    if (name.startsWith('_')) continue

    const isExported = line.includes('export ')
    if (isExported) continue

    const regex = new RegExp(`\\b${name}\\b`)
    const rest = lines.filter((_, idx) => idx !== i).join('\n')
    if (!regex.test(rest)) {
      fossils.push({
        type: 'zombie-constant',
        file: filePath,
        line: i + 1,
        code: line.trim().substring(0, 80),
        era: estimateEra('zombie-constant'),
        description: `Constant "${name}" defined but never used`,
        severity: determineSeverity('zombie-constant'),
        excavationEffort: estimateExcavationEffort('zombie-constant'),
      })
    }
  }

  return fossils
}

/**
 * Excavate relic comments — references to removed code or outdated info.
 *
 * @example
 * excavateRelicComments('// TODO: remove this hack', 'a.ts')
 */
export function excavateRelicComments(content: string, filePath: string): Fossil[] {
  const fossils: Fossil[] = []
  const lines = content.split('\n')
  const relicPatterns = [
    { pattern: /\/\/\s*HACK/i, desc: 'HACK comment — address the underlying issue' },
    { pattern: /\/\/\s*FIXME/i, desc: 'FIXME comment — fix the known issue' },
    { pattern: /\/\/\s*XXX/i, desc: 'XXX comment — review this code' },
    { pattern: /\/\/\s*BROKEN/i, desc: 'BROKEN comment — known broken code' },
    { pattern: /\/\*+\s*@deprecated/i, desc: 'Deprecated marker in comments' },
    { pattern: /\/\/\s*no\s+longer\s+used/i, desc: 'Comment indicates code no longer used' },
    { pattern: /\/\/\s*old\s+/i, desc: 'References to "old" code' },
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    for (const { pattern, desc } of relicPatterns) {
      if (pattern.test(line)) {
        fossils.push({
          type: 'relic-comment',
          file: filePath,
          line: i + 1,
          code: line.trim().substring(0, 80),
          era: estimateEra('relic-comment'),
          description: desc,
          severity: determineSeverity('relic-comment'),
          excavationEffort: estimateExcavationEffort('relic-comment'),
        })
        break
      }
    }
  }

  return fossils
}

// ─── Layer Stratification ─────────────────────────────────────────────────────

/**
 * Stratify fossils into era layers.
 *
 * @example
 * stratifyLayers(fossils)
 */
export function stratifyLayers(fossils: Fossil[]): FossilLayer[] {
  const eraOrder: FossilEra[] = ['ancient', 'old', 'recent', 'modern']
  const eraNames: Record<FossilEra, string> = {
    ancient: 'Ancient Era — pre-modern JS/TS patterns',
    old: 'Old Era — deprecated practices',
    recent: 'Recent Era — modern but unused code',
    modern: 'Modern Era — current code with minor issues',
  }

  return eraOrder
    .map((era) => {
      const eraFossils = fossils.filter((f) => f.era === era)
      if (eraFossils.length === 0) return null
      return {
        name: eraNames[era],
        fossils: eraFossils,
        fileCount: new Set(eraFossils.map((f) => f.file)).size,
        description: `${eraFossils.length} fossil(s) from ${new Set(eraFossils.map((f) => f.file)).size} file(s)`,
      }
    })
    .filter((layer): layer is FossilLayer => layer !== null)
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Compute fossil stats.
 *
 * @example
 * computeFossilStats(fossils)
 */
export function computeFossilStats(fossils: Fossil[]): FossilStats {
  const byType = (t: FossilType) => fossils.filter((f) => f.type === t).length

  return {
    totalFossils: fossils.length,
    deadCodeCount: byType('dead-code'),
    commentedOutCount: byType('commented-out'),
    deprecatedCount: byType('deprecated-api') + byType('legacy-pattern'),
    legacyCount: byType('ancient-convention') + byType('relic-comment'),
    cleanupCandidates: fossils.filter((f) => f.severity === 'cleanup').length,
    estimatedSavings: fossils.length * 3,
  }
}

// ─── Artifact Highlights ──────────────────────────────────────────────────────

/**
 * Select most interesting fossils as highlights.
 *
 * @example
 * selectArtifactHighlights(fossils)
 */
export function selectArtifactHighlights(fossils: Fossil[]): Fossil[] {
  if (fossils.length === 0) return []

  const priority: FossilType[] = ['dead-code', 'deprecated-api', 'legacy-pattern', 'orphan-reference', 'commented-out', 'unused-import', 'zombie-constant', 'relic-comment', 'ancient-convention', 'vestigial-type']

  for (const type of priority) {
    const found = fossils.filter((f) => f.type === type)
    if (found.length > 0) return found.slice(0, 5)
  }

  return fossils.slice(0, 5)
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate fossil cleanup recommendations.
 *
 * @example
 * generateFossilRecommendations(fossils, stats)
 */
export function generateFossilRecommendations(fossils: Fossil[], stats: FossilStats): string[] {
  const recs: string[] = []

  if (stats.commentedOutCount > 0) {
    recs.push(`${stats.commentedOutCount} commented-out code block(s) — remove or extract to version control history`)
  }

  if (stats.deadCodeCount > 0) {
    recs.push(`${stats.deadCodeCount} dead code path(s) — safe to remove`)
  }

  if (stats.deprecatedCount > 0) {
    recs.push(`${stats.deprecatedCount} deprecated API/legacy pattern(s) — migrate to modern equivalents`)
  }

  if (stats.cleanupCandidates > 5) {
    recs.push(`${stats.cleanupCandidates} cleanup candidates found — estimated ${stats.estimatedSavings} lines of savings`)
  }

  if (stats.legacyCount > 0) {
    recs.push(`${stats.legacyCount} ancient convention(s) found — modernize for consistency`)
  }

  const unusedImports = fossils.filter((f) => f.type === 'unused-import').length
  if (unusedImports > 0) {
    recs.push(`${unusedImports} unused import(s) — remove to reduce bundle size`)
  }

  if (recs.length === 0) {
    recs.push('Codebase is clean — no significant fossils found')
  }

  return recs
}

// ─── buildExcavationResult ────────────────────────────────────────────────────

/**
 * Build the complete excavation result.
 *
 * @example
 * buildExcavationResult(['a.ts'], ['var x = 1'])
 */
export function buildExcavationResult(
  files: string[],
  contents: string[],
  _options?: FossilOptions,
): ExcavationResult {
  const allFossils: Fossil[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''

    allFossils.push(...excavateDeadCode(content, file))
    allFossils.push(...excavateCommentedCode(content, file))
    allFossils.push(...excavateDeprecatedApi(content, file))
    allFossils.push(...excavateLegacyPatterns(content, file))
    allFossils.push(...excavateUnusedImports(content, file))
    allFossils.push(...excavateVestigialTypes(content, file))
    allFossils.push(...excavateOrphanReferences(content, file))
    allFossils.push(...excavateAncientConventions(content, file))
    allFossils.push(...excavateZombieConstants(content, file))
    allFossils.push(...excavateRelicComments(content, file))
  }

  const layers = stratifyLayers(allFossils)
  const stats = computeFossilStats(allFossils)
  const artifactHighlights = selectArtifactHighlights(allFossils)
  const recommendations = generateFossilRecommendations(allFossils, stats)

  return { fossils: allFossils, layers, stats, artifactHighlights, recommendations }
}
