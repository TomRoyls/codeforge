// ─── Types ────────────────────────────────────────────────────────────────────

export type RiskType =
  | 'experimental'
  | 'deprecated'
  | 'untested-complex'
  | 'known-bug'
  | 'fragile'
  | 'performance-risk'
  | 'security-risk'
  | 'incomplete'
  | 'workaround'
  | 'unstable-api'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ZoneStatus = 'safe' | 'watch' | 'quarantine' | 'isolate'

export interface QuarantineItem {
  file: string
  line: number
  code: string
  riskType: RiskType
  riskLevel: RiskLevel
  reason: string
  suggestion: string
  dependents: number
  hasTests: boolean
  hasDocumentation: boolean
}

export interface QuarantineZone {
  name: string
  items: QuarantineItem[]
  riskScore: number
  status: ZoneStatus
  description: string
}

export interface QuarantineStats {
  totalItems: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  safeZones: number
  watchZones: number
  quarantineZones: number
  isolateZones: number
  averageRiskScore: number
  totalDependents: number
}

export interface QuarantineResult {
  zones: QuarantineZone[]
  items: QuarantineItem[]
  stats: QuarantineStats
  recommendations: string[]
}

export interface QuarantineOptions {
  verbose?: boolean
}

// ─── Risk Level Mapping ───────────────────────────────────────────────────────

const RISK_LEVEL_MAP: Record<RiskType, RiskLevel> = {
  experimental: 'medium',
  deprecated: 'high',
  'untested-complex': 'high',
  'known-bug': 'critical',
  fragile: 'medium',
  'performance-risk': 'medium',
  'security-risk': 'critical',
  incomplete: 'low',
  workaround: 'medium',
  'unstable-api': 'high',
}

const RISK_SCORE_MAP: Record<RiskLevel, number> = {
  low: 10,
  medium: 30,
  high: 60,
  critical: 90,
}

const SUGGESTION_MAP: Record<RiskType, string> = {
  experimental: 'Isolate in a separate module with a clear experimental marker',
  deprecated: 'Remove or provide a migration guide with a timeline',
  'untested-complex': 'Add comprehensive tests before relying on this code',
  'known-bug': 'Fix the bug or document the known issue with a ticket reference',
  fragile: 'Add defensive checks and error handling',
  'performance-risk': 'Profile and optimize; consider async or batching',
  'security-risk': 'Audit and sanitize inputs; use parameterized queries',
  incomplete: 'Complete the implementation or mark as explicitly partial',
  workaround: 'Replace with a proper fix when possible',
  'unstable-api': 'Stabilize the API or mark as internal-only',
}

// ─── detectExperimental ───────────────────────────────────────────────────────

const EXPERIMENTAL_RE = /(?:EXPERIMENTAL|WIP|POC|prototype|draft)\b/i

/**
 * Find experimental markers in code.
 *
 * @example
 * detectExperimental('// EXPERIMENTAL: new approach', 'file.ts')
 */
export function detectExperimental(content: string, filePath: string): QuarantineItem[] {
  const items: QuarantineItem[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (EXPERIMENTAL_RE.test(line)) {
      const match = line.match(EXPERIMENTAL_RE)
      items.push({
        file: filePath,
        line: i + 1,
        code: line.trim(),
        riskType: 'experimental',
        riskLevel: RISK_LEVEL_MAP.experimental,
        reason: `Experimental code detected: ${match?.[0] ?? 'experimental marker'}`,
        suggestion: SUGGESTION_MAP.experimental,
        dependents: 0,
        hasTests: false,
        hasDocumentation: false,
      })
    }
  }
  return items
}

// ─── detectDeprecated ─────────────────────────────────────────────────────────

const DEPRECATED_RE = /@deprecated|DEPRECATED\b/i

/**
 * Find deprecated markers in code.
 *
 * @example
 * detectDeprecated('// DEPRECATED: old code', 'file.ts')
 */
export function detectDeprecated(content: string, filePath: string): QuarantineItem[] {
  const items: QuarantineItem[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (DEPRECATED_RE.test(line)) {
      items.push({
        file: filePath,
        line: i + 1,
        code: line.trim(),
        riskType: 'deprecated',
        riskLevel: RISK_LEVEL_MAP.deprecated,
        reason: 'Deprecated code detected',
        suggestion: SUGGESTION_MAP.deprecated,
        dependents: 0,
        hasTests: false,
        hasDocumentation: false,
      })
    }
  }
  return items
}

// ─── detectUntestedComplex ────────────────────────────────────────────────────

/**
 * Find high-complexity code without tests.
 *
 * @example
 * detectUntestedComplex('function complex(a,b,c,d,e) { if(a){if(b){if(c){}}} }', 'file.ts', false)
 */
export function detectUntestedComplex(content: string, filePath: string, hasTestFile: boolean): QuarantineItem[] {
  if (hasTestFile) return []
  const items: QuarantineItem[] = []
  const lines = content.split('\n')
  let depth = 0
  let maxDepth = 0
  let funcStart = -1
  let funcName = ''

  const emitItem = () => {
    if (funcStart >= 0 && maxDepth > 4) {
      items.push({
        file: filePath,
        line: funcStart + 1,
        code: lines[funcStart]?.trim() ?? '',
        riskType: 'untested-complex',
        riskLevel: RISK_LEVEL_MAP['untested-complex'],
        reason: `Untested complex function '${funcName}' (nesting depth: ${maxDepth})`,
        suggestion: SUGGESTION_MAP['untested-complex'],
        dependents: 0,
        hasTests: false,
        hasDocumentation: false,
      })
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const funcMatch = line.match(/(?:function\s+(\w+)|(?:const|let)\s+(\w+)\s*=.*(?:=>|\bfunction\b))/)
    if (funcMatch) {
      emitItem()
      funcStart = i
      funcName = funcMatch[1] ?? funcMatch[2] ?? 'anonymous'
      depth = 0
      maxDepth = 0
    }
    for (const ch of line) {
      if (ch === '{') { depth++; if (depth > maxDepth) maxDepth = depth }
      if (ch === '}') depth--
    }
    if (depth < 0) depth = 0
  }

  emitItem()
  return items
}

// ─── detectKnownBugs ──────────────────────────────────────────────────────────

const BUG_RE = /(?:BUG|FIXME|ISSUE\s*#?\d*)\b/i

/**
 * Find known bug markers in code.
 *
 * @example
 * detectKnownBugs('// FIXME: this breaks on edge case', 'file.ts')
 */
export function detectKnownBugs(content: string, filePath: string): QuarantineItem[] {
  const items: QuarantineItem[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (BUG_RE.test(line)) {
      const match = line.match(BUG_RE)
      items.push({
        file: filePath,
        line: i + 1,
        code: line.trim(),
        riskType: 'known-bug',
        riskLevel: RISK_LEVEL_MAP['known-bug'],
        reason: `Known bug marker: ${match?.[0] ?? 'bug marker'}`,
        suggestion: SUGGESTION_MAP['known-bug'],
        dependents: 0,
        hasTests: false,
        hasDocumentation: false,
      })
    }
  }
  return items
}

// ─── detectFragile ────────────────────────────────────────────────────────────


/**
 * Find fragile patterns in code.
 *
 * @example
 * detectFragile('try { x() } catch(e) { }', 'file.ts')
 */
export function detectFragile(content: string, filePath: string): QuarantineItem[] {
  const items: QuarantineItem[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (/\/\/\s*fragile/i.test(line)) {
      items.push({
        file: filePath,
        line: i + 1,
        code: line.trim(),
        riskType: 'fragile',
        riskLevel: RISK_LEVEL_MAP.fragile,
        reason: 'Fragile code marker detected',
        suggestion: SUGGESTION_MAP.fragile,
        dependents: 0,
        hasTests: false,
        hasDocumentation: false,
      })
    }
  }

  const fullContent = content
  const silentCatchRe = /try\s*\{[^}]*\}\s*catch\s*\(\s*\w+\s*\)\s*\{\s*\}/g
  let scMatch: RegExpExecArray | null
  while ((scMatch = silentCatchRe.exec(fullContent)) !== null) {
    const pos = scMatch.index
    const lineNum = fullContent.substring(0, pos).split('\n').length
    const matched = scMatch[0]
    const existing = items.find((it) => it.line === lineNum && it.riskType === 'fragile')
    if (!existing) {
      items.push({
        file: filePath,
        line: lineNum,
        code: matched.length > 60 ? matched.substring(0, 60) + '...' : matched,
        riskType: 'fragile',
        riskLevel: RISK_LEVEL_MAP.fragile,
        reason: 'Silent catch detected — errors may be swallowed',
        suggestion: SUGGESTION_MAP.fragile,
        dependents: 0,
        hasTests: false,
        hasDocumentation: false,
      })
    }
  }

  return items
}

// ─── detectPerformanceRisk ────────────────────────────────────────────────────

const PERF_RE = /for\s*\(.*await|while\s*\(.*await|\.forEach\s*\(\s*async|readFileSync|writeFileSync/

/**
 * Find performance risk patterns in code.
 *
 * @example
 * detectPerformanceRisk('for (const x of arr) { await fetch(x) }', 'file.ts')
 */
export function detectPerformanceRisk(content: string, filePath: string): QuarantineItem[] {
  const items: QuarantineItem[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (PERF_RE.test(line)) {
      items.push({
        file: filePath,
        line: i + 1,
        code: line.trim(),
        riskType: 'performance-risk',
        riskLevel: RISK_LEVEL_MAP['performance-risk'],
        reason: 'Performance risk: potential N+1 or synchronous I/O pattern',
        suggestion: SUGGESTION_MAP['performance-risk'],
        dependents: 0,
        hasTests: false,
        hasDocumentation: false,
      })
    }
  }
  return items
}

// ─── detectSecurityRisk ───────────────────────────────────────────────────────

const SECURITY_RE = /\beval\s*\(|\.innerHTML\s*=|\.exec\s*\(|(?:SELECT|INSERT|UPDATE|DELETE).*\+\s*\w+|password\s*[:=]\s*['"]|api[_-]?key\s*[:=]\s*['"]|secret\s*[:=]\s*['"]/

/**
 * Find security risk patterns in code.
 *
 * @example
 * detectSecurityRisk('eval(userInput)', 'file.ts')
 */
export function detectSecurityRisk(content: string, filePath: string): QuarantineItem[] {
  const items: QuarantineItem[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (SECURITY_RE.test(line) && !/\/\/\s*(?:eslint-disable|ts-ignore)/.test(line)) {
      let reason = 'Security risk pattern detected'
      if (/\beval\s*\(/.test(line)) reason = 'Use of eval() — potential code injection'
      if (/\.innerHTML\s*=/.test(line)) reason = 'Use of innerHTML — potential XSS'
      if (/\.exec\s*\(/.test(line)) reason = 'Use of exec() — potential command injection'
      if (/(?:SELECT|INSERT|UPDATE|DELETE).*\+/.test(line)) reason = 'SQL string concatenation — potential SQL injection'
      if (/password\s*[:=]\s*['"]/.test(line)) reason = 'Hardcoded password detected'
      if (/api[_-]?key\s*[:=]\s*['"]/.test(line)) reason = 'Hardcoded API key detected'
      if (/secret\s*[:=]\s*['"]/.test(line)) reason = 'Hardcoded secret detected'

      items.push({
        file: filePath,
        line: i + 1,
        code: line.trim(),
        riskType: 'security-risk',
        riskLevel: RISK_LEVEL_MAP['security-risk'],
        reason,
        suggestion: SUGGESTION_MAP['security-risk'],
        dependents: 0,
        hasTests: false,
        hasDocumentation: false,
      })
    }
  }
  return items
}

// ─── detectIncomplete ─────────────────────────────────────────────────────────

const INCOMPLETE_RE = /\/\/\s*TODO(?!\s*\(\w+\))|STUB|PLACEHOLDER|throw new Error\s*\(\s*['"]not implemented/i

/**
 * Find incomplete code markers.
 *
 * @example
 * detectIncomplete('// TODO: implement this', 'file.ts')
 */
export function detectIncomplete(content: string, filePath: string): QuarantineItem[] {
  const items: QuarantineItem[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (INCOMPLETE_RE.test(line)) {
      items.push({
        file: filePath,
        line: i + 1,
        code: line.trim(),
        riskType: 'incomplete',
        riskLevel: RISK_LEVEL_MAP.incomplete,
        reason: 'Incomplete implementation detected',
        suggestion: SUGGESTION_MAP.incomplete,
        dependents: 0,
        hasTests: false,
        hasDocumentation: false,
      })
    }
  }
  return items
}

// ─── detectWorkarounds ────────────────────────────────────────────────────────

const WORKAROUND_RE = /\/\/\s*(?:HACK|WORKAROUND|TEMP(?:ORARY)?\b)/i

/**
 * Find workaround markers in code.
 *
 * @example
 * detectWorkarounds('// HACK: workaround for bug #123', 'file.ts')
 */
export function detectWorkarounds(content: string, filePath: string): QuarantineItem[] {
  const items: QuarantineItem[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (WORKAROUND_RE.test(line)) {
      const match = line.match(WORKAROUND_RE)
      items.push({
        file: filePath,
        line: i + 1,
        code: line.trim(),
        riskType: 'workaround',
        riskLevel: RISK_LEVEL_MAP.workaround,
        reason: `Workaround detected: ${match?.[0]?.trim() ?? 'workaround'}`,
        suggestion: SUGGESTION_MAP.workaround,
        dependents: 0,
        hasTests: false,
        hasDocumentation: false,
      })
    }
  }
  return items
}

// ─── detectUnstableApi ────────────────────────────────────────────────────────

const UNSTABLE_RE = /\/\/\s*(?:may change|not stable|breaking change|unstable|subject to change)/i

/**
 * Find unstable API markers.
 *
 * @example
 * detectUnstableApi('// may change in next version', 'file.ts')
 */
export function detectUnstableApi(content: string, filePath: string): QuarantineItem[] {
  const items: QuarantineItem[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (UNSTABLE_RE.test(line)) {
      items.push({
        file: filePath,
        line: i + 1,
        code: line.trim(),
        riskType: 'unstable-api',
        riskLevel: RISK_LEVEL_MAP['unstable-api'],
        reason: 'Unstable API — may change without notice',
        suggestion: SUGGESTION_MAP['unstable-api'],
        dependents: 0,
        hasTests: false,
        hasDocumentation: false,
      })
    }
  }
  return items
}

// ─── computeRiskScore ─────────────────────────────────────────────────────────

/**
 * Compute aggregate risk score 0-100 for a zone.
 *
 * @example
 * computeRiskScore(items)
 */
export function computeRiskScore(items: QuarantineItem[]): number {
  if (items.length === 0) return 0
  const total = items.reduce((s, item) => s + RISK_SCORE_MAP[item.riskLevel], 0)
  return Math.min(Math.round(total / items.length), 100)
}

// ─── classifyZone ─────────────────────────────────────────────────────────────

/**
 * Classify zone status based on risk score.
 *
 * @example
 * classifyZone(75)
 */
export function classifyZone(score: number): ZoneStatus {
  if (score <= 20) return 'safe'
  if (score <= 40) return 'watch'
  if (score <= 65) return 'quarantine'
  return 'isolate'
}

// ─── countDependents ──────────────────────────────────────────────────────────

const IMPORT_RE = /import\s+(?:type\s+)?(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/

function resolveSimpleImport(raw: string, fromFile: string, knownFiles: Set<string>): string | null {
  if (!raw.startsWith('.')) return null
  const fromDir = fromFile.includes('/') ? fromFile.substring(0, fromFile.lastIndexOf('/')) : '.'
  const parts = fromDir === '.' ? raw.split('/') : [...fromDir.split('/'), ...raw.split('/')]
  const normalized: string[] = []
  for (const part of parts) {
    if (part === '..') { normalized.pop(); continue }
    if (part === '.' || part === '') continue
    normalized.push(part)
  }
  const candidates = [
    normalized.join('/'),
    normalized.join('/') + '.ts',
    normalized.join('/') + '.tsx',
    normalized.join('/') + '.js',
    normalized.join('/') + '/index.ts',
  ]
  for (const c of candidates) {
    if (knownFiles.has(c)) return c
  }
  return null
}

function buildDependentCounts(files: string[], contents: string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const f of files) counts.set(f, 0)
  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    for (const line of content.split('\n')) {
      const match = line.match(IMPORT_RE)
      if (match) {
        const importPath = match[1]
        if (importPath) {
          const resolved = resolveSimpleImport(importPath, file, new Set(files))
          if (resolved) {
            counts.set(resolved, (counts.get(resolved) ?? 0) + 1)
          }
        }
      }
    }
  }
  return counts
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate recommendations from quarantine analysis.
 *
 * @example
 * generateRecommendations(zones, stats)
 */
export function generateRecommendations(zones: QuarantineZone[], stats: QuarantineStats): string[] {
  const recs: string[] = []

  if (stats.criticalCount > 0) {
    recs.push(`Isolate ${stats.criticalCount} critical-risk item(s) behind stable interfaces`)
  }

  const untestedItems = zones.flatMap((z) => z.items).filter((i) => i.riskType === 'untested-complex')
  if (untestedItems.length > 0) {
    recs.push(`Add tests for ${untestedItems.length} untested complex function(s)`)
  }

  const deprecatedItems = zones.flatMap((z) => z.items).filter((i) => i.riskType === 'deprecated')
  if (deprecatedItems.length > 0) {
    recs.push(`Remove or document migration path for ${deprecatedItems.length} deprecated item(s)`)
  }

  const experimentalItems = zones.flatMap((z) => z.items).filter((i) => i.riskType === 'experimental')
  if (experimentalItems.length > 0) {
    recs.push(`Quarantine ${experimentalItems.length} experimental item(s) in separate modules`)
  }

  if (stats.isolateZones > 0) {
    recs.push(`${stats.isolateZones} zone(s) need immediate isolation — review and address`)
  }

  const securityItems = zones.flatMap((z) => z.items).filter((i) => i.riskType === 'security-risk')
  if (securityItems.length > 0) {
    recs.push(`Audit ${securityItems.length} security risk(s) — these may be exploitable`)
  }

  if (recs.length === 0) {
    recs.push('No quarantine risks detected — codebase looks healthy')
  }

  return recs
}

// ─── buildQuarantineResult ────────────────────────────────────────────────────

/**
 * Build the complete quarantine analysis result.
 *
 * @example
 * buildQuarantineResult(['file.ts'], ['// FIXME: broken'])
 */
export function buildQuarantineResult(
  files: string[],
  contents: string[],
  _options?: QuarantineOptions,
): QuarantineResult {
  const allItems: QuarantineItem[] = []
  const fileItemMap = new Map<string, QuarantineItem[]>()

  const dependentCounts = buildDependentCounts(files, contents)
  const testFiles = new Set(files.filter((f) => /\.(?:test|spec)\.(ts|tsx|js|jsx)$/.test(f)))
  const sourceFiles = new Set(files.filter((f) => !testFiles.has(f)))

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    if (testFiles.has(file)) continue

    const hasTestFile = sourceFiles.has(file) && files.some(
      (tf) => testFiles.has(tf) && tf.replace(/\.(?:test|spec)\./, '.') === file,
    )
    const hasDocs = /\/\*\*[\s\S]*?\*\//.test(content)

    const fileItems = [
      ...detectExperimental(content, file),
      ...detectDeprecated(content, file),
      ...detectUntestedComplex(content, file, hasTestFile),
      ...detectKnownBugs(content, file),
      ...detectFragile(content, file),
      ...detectPerformanceRisk(content, file),
      ...detectSecurityRisk(content, file),
      ...detectIncomplete(content, file),
      ...detectWorkarounds(content, file),
      ...detectUnstableApi(content, file),
    ]

    for (const item of fileItems) {
      item.dependents = dependentCounts.get(file) ?? 0
      item.hasTests = hasTestFile
      item.hasDocumentation = hasDocs
    }

    fileItemMap.set(file, fileItems)
    allItems.push(...fileItems)
  }

  const zones: QuarantineZone[] = []
  for (const [file, items] of fileItemMap) {
    if (items.length === 0) continue
    const score = computeRiskScore(items)
    zones.push({
      name: file,
      items,
      riskScore: score,
      status: classifyZone(score),
      description: `${items.length} risk item(s) in ${file}`,
    })
  }

  zones.sort((a, b) => b.riskScore - a.riskScore)

  const stats: QuarantineStats = {
    totalItems: allItems.length,
    criticalCount: allItems.filter((i) => i.riskLevel === 'critical').length,
    highCount: allItems.filter((i) => i.riskLevel === 'high').length,
    mediumCount: allItems.filter((i) => i.riskLevel === 'medium').length,
    lowCount: allItems.filter((i) => i.riskLevel === 'low').length,
    safeZones: zones.filter((z) => z.status === 'safe').length,
    watchZones: zones.filter((z) => z.status === 'watch').length,
    quarantineZones: zones.filter((z) => z.status === 'quarantine').length,
    isolateZones: zones.filter((z) => z.status === 'isolate').length,
    averageRiskScore: zones.length > 0 ? Math.round(zones.reduce((s, z) => s + z.riskScore, 0) / zones.length) : 0,
    totalDependents: allItems.reduce((s, i) => s + i.dependents, 0),
  }

  const recommendations = generateRecommendations(zones, stats)

  return { zones, items: allItems, stats, recommendations }
}
