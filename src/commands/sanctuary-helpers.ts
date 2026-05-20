// ─── Types ──────────────────────────────────────────────────────────────────────

export type ZoneClassification = 'sanctuary' | 'protected' | 'natural' | 'wild' | 'danger'
export type ProtectionType = 'type-guard' | 'error-boundary' | 'input-validation' | 'null-check' | 'assertion' | 'default-value' | 'try-catch' | 'edge-case'
export type ProtectionStrength = 'basic' | 'moderate' | 'strong' | 'fortress'
export type ThreatType = 'untyped' | 'uncaught-exception' | 'unvalidated-input' | 'null-dereference' | 'implicit-any' | 'unchecked-return' | 'side-effect' | 'mutation'
export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical'
export type RiskLevel = 'stable' | 'watch' | 'vulnerable' | 'endangered' | 'critical'
export type OverallSafety = 'fortress' | 'secure' | 'guarded' | 'exposed' | 'dangerous'

export interface Protection {
  type: ProtectionType
  location: number
  description: string
  strength: ProtectionStrength
}

export interface Threat {
  type: ThreatType
  location: number
  severity: ThreatSeverity
  description: string
  mitigation: string
}

export interface SafetyZone {
  file: string
  classification: ZoneClassification
  safetyScore: number
  protections: Protection[]
  threats: Threat[]
  typeSafety: number
  errorBoundaries: number
  validationCoverage: number
  defensiveScore: number
}

export interface EndangeredPattern {
  pattern: string
  files: string[]
  riskLevel: RiskLevel
  hasProtection: boolean
  protectionType: string | null
  recommendation: string
}

export interface SanctuaryStats {
  totalZones: number
  sanctuaryZones: number
  protectedZones: number
  wildZones: number
  dangerZones: number
  totalProtections: number
  totalThreats: number
  criticalThreats: number
  avgSafetyScore: number
  avgTypeSafety: number
  avgValidationCoverage: number
  avgDefensiveScore: number
  endangeredCount: number
  criticalCount: number
  overallSafety: OverallSafety
  sanctuaryIndex: number
  threatDensity: number
  protectionRatio: number
}

export interface SanctuaryResult {
  zones: SafetyZone[]
  endangeredPatterns: EndangeredPattern[]
  stats: SanctuaryStats
  recommendations: string[]
}

export interface SanctuaryOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Protection Detection ──────────────────────────────────────────────────────

/**
 * Detect safety protections in code.
 *
 * @example
 * detectProtections('if (typeof x === "string") {}') // => Protection[]
 */
export function detectProtections(content: string): Protection[] {
  if (content.trim().length === 0) return []

  const protections: Protection[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    if (/typeof\s+\w+\s*===?\s*['"]/.test(line)) {
      protections.push({ type: 'type-guard', location: lineNum, description: 'typeof check', strength: 'moderate' })
    }

    if (/instanceof\s+\w+/.test(line)) {
      protections.push({ type: 'type-guard', location: lineNum, description: 'instanceof check', strength: 'strong' })
    }

    if (/try\s*\{/.test(line)) {
      protections.push({ type: 'try-catch', location: lineNum, description: 'try-catch block', strength: 'strong' })
    }

    if (/catch\s*\(/.test(line)) {
      protections.push({ type: 'error-boundary', location: lineNum, description: 'catch handler', strength: 'moderate' })
    }

    if (/\.catch\s*\(/.test(line)) {
      protections.push({ type: 'error-boundary', location: lineNum, description: 'promise catch', strength: 'moderate' })
    }

    if (/if\s*\([^)]*!==?\s*null/.test(line) || /if\s*\([^)]*!==?\s*undefined/.test(line)) {
      protections.push({ type: 'null-check', location: lineNum, description: 'null/undefined check', strength: 'moderate' })
    }

    if (/\?\.\w/.test(line)) {
      protections.push({ type: 'null-check', location: lineNum, description: 'optional chaining', strength: 'basic' })
    }

    if (/\?\?/.test(line)) {
      protections.push({ type: 'default-value', location: lineNum, description: 'nullish coalescing', strength: 'basic' })
    }

    if (/console\.assert|invariant|assert\(/.test(line)) {
      protections.push({ type: 'assertion', location: lineNum, description: 'assertion', strength: 'strong' })
    }

    if (/if\s*\([^)]*(?:==|!=|>|<|>=|<=)/.test(line) && !/typeof/.test(line) && !/null/.test(line) && !/undefined/.test(line)) {
      protections.push({ type: 'input-validation', location: lineNum, description: 'conditional validation', strength: 'basic' })
    }

    if (/\b(decodeURIComponent|parseInt|Number|parseFloat)\s*\(/.test(line) && /if|isNaN|!isNaN/.test(line)) {
      protections.push({ type: 'edge-case', location: lineNum, description: 'parse validation', strength: 'moderate' })
    }
  }

  return protections
}

// ─── Threat Detection ──────────────────────────────────────────────────────────

/**
 * Detect safety threats in code.
 *
 * @example
 * detectThreats('const x: any = 1') // => Threat[]
 */
export function detectThreats(content: string): Threat[] {
  if (content.trim().length === 0) return []

  const threats: Threat[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    if (/:\s*any\b/.test(line)) {
      threats.push({ type: 'implicit-any', location: lineNum, severity: 'high', description: 'Explicit any type', mitigation: 'Replace with specific type' })
    }

    if (/as\s+any\b/.test(line)) {
      threats.push({ type: 'untyped', location: lineNum, severity: 'high', description: 'Cast to any', mitigation: 'Use proper type assertion' })
    }

    if (/\w+\.\w+\(/.test(line) && !/try|catch|if|null|undefined|\?\.|console/.test(line)) {
      const bareCalls = Array.from(line.matchAll(/\w+\.\w+\(/g))
      if (bareCalls.length > 0 && !/^(const|let|var|function|class|import|export|\/\/|\/\*)/.test(line.trim())) {
        // skip for now — too noisy
      }
    }

    if (/(?:globalThis|window|global)\.\w+\s*=/.test(line)) {
      threats.push({ type: 'side-effect', location: lineNum, severity: 'medium', description: 'Global mutation', mitigation: 'Use module-scoped state' })
    }

    if (/\bnew\s+Date\(\)/.test(line) || /\bMath\.random\(\)/.test(line)) {
      // These are side effects but generally benign, skip
    }

    if (/\bprocess\.env\b/.test(line) && !/if\s*\(/.test(line) && !/\?\./.test(line) && !/\?\?/.test(line)) {
      threats.push({ type: 'unvalidated-input', location: lineNum, severity: 'medium', description: 'Unvalidated env variable', mitigation: 'Validate and provide defaults' })
    }

    if (/\bJSON\.parse\s*\(/.test(line) && !/try/.test(line)) {
      threats.push({ type: 'uncaught-exception', location: lineNum, severity: 'high', description: 'JSON.parse without try-catch', mitigation: 'Wrap in try-catch' })
    }

    if (/\bparseInt\s*\(/.test(line) && !/radix/.test(line) && !/,\s*10/.test(line)) {
      threats.push({ type: 'untyped', location: lineNum, severity: 'low', description: 'parseInt without radix', mitigation: 'Always specify radix: parseInt(x, 10)' })
    }

    if (/\b\w+\s*\|\s*0\b/.test(line) || />>>\s*0/.test(line)) {
      threats.push({ type: 'untyped', location: lineNum, severity: 'low', description: 'Bitwise type coercion', mitigation: 'Use explicit type conversion' })
    }

    if (/\bdelete\s+\w+/.test(line)) {
      threats.push({ type: 'mutation', location: lineNum, severity: 'medium', description: 'Delete operation', mitigation: 'Use immutable patterns' })
    }

    if (/\b\.sort\s*\(\s*\)/.test(line)) {
      threats.push({ type: 'mutation', location: lineNum, severity: 'medium', description: 'Array.sort() mutates in place', mitigation: 'Use [...arr].sort() or toSorted()' })
    }

    if (/\b\.splice\s*\(/.test(line)) {
      threats.push({ type: 'mutation', location: lineNum, severity: 'medium', description: 'Array.splice() mutates', mitigation: 'Use filter/slice for immutable operations' })
    }
  }

  return threats
}

// ─── Safety Zone Analysis ──────────────────────────────────────────────────────

/**
 * Analyze safety zone for a single file.
 *
 * @example
 * analyzeSafetyZone('const x: any = 1', 'a.ts') // => SafetyZone
 */
export function analyzeSafetyZone(content: string, filePath: string): SafetyZone {
  if (content.trim().length === 0) {
    return {
      file: filePath, classification: 'sanctuary', safetyScore: 100,
      protections: [], threats: [], typeSafety: 100,
      errorBoundaries: 0, validationCoverage: 100, defensiveScore: 100,
    }
  }

  const protections = detectProtections(content)
  const threats = detectThreats(content)

  const typedDecls = Array.from(content.matchAll(/:\s*(?:string|number|boolean|void|object|unknown|never|bigint|symbol)\b/g)).length
  const anyDecls = Array.from(content.matchAll(/:\s*any\b/g)).length
  const totalTyped = typedDecls + anyDecls
  const typeSafety = totalTyped > 0 ? Math.round((typedDecls / totalTyped) * 100) : 100

  const tryCatchCount = protections.filter(p => p.type === 'try-catch' || p.type === 'error-boundary').length
  const errorBoundaries = tryCatchCount

  const validationProtections = protections.filter(p =>
    p.type === 'input-validation' || p.type === 'null-check' || p.type === 'edge-case',
  ).length
  const paramsCount = Array.from(content.matchAll(/\(\s*(?:\w+(?:\s*:\s*\w+)?\s*,?\s*)+\)/g)).length
  const validationCoverage = paramsCount > 0
    ? Math.min(100, Math.round((validationProtections / paramsCount) * 100))
    : 100

  const strongProtections = protections.filter(p => p.strength === 'strong' || p.strength === 'fortress').length
  const defensiveScore = protections.length > 0
    ? Math.min(100, Math.round((strongProtections / Math.max(1, protections.length)) * 100))
    : 0

  const criticalThreats = threats.filter(t => t.severity === 'critical' || t.severity === 'high').length
  const threatPenalty = Math.min(40, threats.length * 3 + criticalThreats * 5)
  const protectionBonus = Math.min(30, protections.length * 3)
  const safetyScore = Math.max(0, Math.min(100, 60 - threatPenalty + protectionBonus + Math.round(typeSafety * 0.1)))

  const classification = classifyZone(safetyScore, typeSafety, threats.length)

  return {
    file: filePath,
    classification,
    safetyScore,
    protections,
    threats,
    typeSafety,
    errorBoundaries,
    validationCoverage,
    defensiveScore,
  }
}

function classifyZone(safetyScore: number, typeSafety: number, threatCount: number): ZoneClassification {
  if (safetyScore >= 80 && typeSafety >= 80 && threatCount === 0) return 'sanctuary'
  if (safetyScore >= 60 && typeSafety >= 60) return 'protected'
  if (safetyScore >= 40) return 'natural'
  if (safetyScore >= 20) return 'wild'
  return 'danger'
}

// ─── Endangered Patterns ───────────────────────────────────────────────────────

/**
 * Find endangered code patterns across files.
 *
 * @example
 * findEndangeredPatterns(zones, ['a.ts'], ['JSON.parse(x)']) // => EndangeredPattern[]
 */
export function findEndangeredPatterns(zones: SafetyZone[], files: string[], contents: string[]): EndangeredPattern[] {
  if (files.length === 0) return []

  const patterns: EndangeredPattern[] = []
  const patternMap = new Map<string, { files: string[], hasProtection: boolean, protectionType: string | null }>()

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const zone = zones[i]

    const jsonParseUnprotected = Array.from(content.matchAll(/JSON\.parse\s*\(/g))
    if (jsonParseUnprotected.length > 0) {
      const hasTry = /try\s*\{/.test(content)
      const existing = patternMap.get('JSON.parse') ?? { files: [] as string[], hasProtection: false, protectionType: null as string | null }
      existing.files.push(files[i])
      if (hasTry) { existing.hasProtection = true; existing.protectionType = 'try-catch' }
      patternMap.set('JSON.parse', existing)
    }

    const evalUsage = Array.from(content.matchAll(/\beval\s*\(/g))
    if (evalUsage.length > 0) {
      const existing = patternMap.get('eval') ?? { files: [] as string[], hasProtection: false, protectionType: null as string | null }
      existing.files.push(files[i])
      patternMap.set('eval', existing)
    }

    const globalMutation = Array.from(content.matchAll(/(?:globalThis|window|global)\.\w+\s*=/g))
    if (globalMutation.length > 0) {
      const existing = patternMap.get('global-mutation') ?? { files: [] as string[], hasProtection: false, protectionType: null as string | null }
      existing.files.push(files[i])
      patternMap.set('global-mutation', existing)
    }

    const anyTypes = Array.from(content.matchAll(/:\s*any\b/g))
    if (anyTypes.length > 0) {
      const existing = patternMap.get('any-type') ?? { files: [] as string[], hasProtection: false, protectionType: null as string | null }
      existing.files.push(files[i])
      patternMap.set('any-type', existing)
    }

    if (zone && zone.threats.filter(t => t.severity === 'critical').length > 0) {
      const existing = patternMap.get('critical-threats') ?? { files: [] as string[], hasProtection: false, protectionType: null as string | null }
      existing.files.push(files[i])
      patternMap.set('critical-threats', existing)
    }
  }

  for (const [pattern, data] of patternMap) {
    const fileCount = Array.from(new Set(data.files)).length
    let riskLevel: RiskLevel = 'stable'
    if (!data.hasProtection && fileCount > 2) riskLevel = 'critical'
    else if (!data.hasProtection && fileCount > 1) riskLevel = 'endangered'
    else if (!data.hasProtection) riskLevel = 'vulnerable'
    else if (fileCount > 3) riskLevel = 'watch'

    const recommendations: Record<string, string> = {
      'JSON.parse': 'Wrap JSON.parse in try-catch blocks',
      'eval': 'Replace eval with safer alternatives',
      'global-mutation': 'Use module-scoped state instead of global mutations',
      'any-type': 'Replace any with specific types',
      'critical-threats': 'Address critical threats immediately',
    }

    patterns.push({
      pattern,
      files: Array.from(new Set(data.files)),
      riskLevel,
      hasProtection: data.hasProtection,
      protectionType: data.protectionType,
      recommendation: recommendations[pattern] ?? 'Add safety protections',
    })
  }

  return patterns
}

// ─── Computed Metrics ──────────────────────────────────────────────────────────

/**
 * Compute sanctuary index (0-100).
 *
 * @example
 * computeSanctuaryIndex(zones) // => 75
 */
export function computeSanctuaryIndex(zones: SafetyZone[]): number {
  if (zones.length === 0) return 100

  const avgSafety = zones.reduce((s, z) => s + z.safetyScore, 0) / zones.length
  const avgType = zones.reduce((s, z) => s + z.typeSafety, 0) / zones.length
  const avgDefensive = zones.reduce((s, z) => s + z.defensiveScore, 0) / zones.length

  return Math.round((avgSafety * 0.4) + (avgType * 0.3) + (avgDefensive * 0.3))
}

/**
 * Compute threat density (threats per 100 lines).
 *
 * @example
 * computeThreatDensity(10, 500) // => 2
 */
export function computeThreatDensity(threats: number, totalLines: number): number {
  if (totalLines === 0) return 0
  return Math.round((threats / totalLines) * 100 * 100) / 100
}

/**
 * Compute protection ratio.
 *
 * @example
 * computeProtectionRatio(20, 10) // => 2
 */
export function computeProtectionRatio(protections: number, threats: number): number {
  if (threats === 0) return protections > 0 ? protections : 1
  return Math.round((protections / threats) * 100) / 100
}

/**
 * Classify overall safety.
 *
 * @example
 * classifyOverallSafety(90, 2.5) // => 'fortress'
 */
export function classifyOverallSafety(sanctuaryIndex: number, protectionRatio: number): OverallSafety {
  if (sanctuaryIndex >= 80 && protectionRatio >= 2) return 'fortress'
  if (sanctuaryIndex >= 60 && protectionRatio >= 1) return 'secure'
  if (sanctuaryIndex >= 40) return 'guarded'
  if (sanctuaryIndex >= 20) return 'exposed'
  return 'dangerous'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate sanctuary recommendations.
 *
 * @example
 * generateRecommendations(zones, endangered, 5, stats) // => string[]
 */
export function generateRecommendations(
  zones: SafetyZone[],
  endangered: EndangeredPattern[],
  _totalThreats: number,
  stats: SanctuaryStats,
): string[] {
  const recs: string[] = []

  const dangerZones = zones.filter(z => z.classification === 'danger' || z.classification === 'wild')
  if (dangerZones.length > 0) {
    recs.push(`${dangerZones.length} danger/wild zone${dangerZones.length > 1 ? 's' : ''} found — add type safety, validation, and error handling`)
  }

  if (stats.criticalThreats > 0) {
    recs.push(`${stats.criticalThreats} critical threat${stats.criticalThreats > 1 ? 's' : ''} — address immediately with proper type guards and error boundaries`)
  }

  const criticalEndangered = endangered.filter(e => e.riskLevel === 'critical' || e.riskLevel === 'endangered')
  if (criticalEndangered.length > 0) {
    recs.push(`${criticalEndangered.length} endangered pattern${criticalEndangered.length > 1 ? 's' : ''} — add protections for: ${criticalEndangered.map(e => e.pattern).join(', ')}`)
  }

  if (stats.protectionRatio < 1) {
    recs.push('Low protection ratio — increase defensive programming with type guards, null checks, and error boundaries')
  }

  if (stats.avgTypeSafety < 60) {
    recs.push('Low type safety — replace `any` types with specific types and add type annotations')
  }

  if (stats.overallSafety === 'exposed' || stats.overallSafety === 'dangerous') {
    recs.push('Overall safety is poor — establish a safety baseline with strict TypeScript config and code review')
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete sanctuary analysis result.
 *
 * @example
 * buildSanctuaryResult(['a.ts'], ['code'], {}) // => SanctuaryResult
 */
export function buildSanctuaryResult(files: string[], contents: string[], _options: SanctuaryOptions): SanctuaryResult {
  if (files.length === 0) {
    const emptyStats: SanctuaryStats = {
      totalZones: 0, sanctuaryZones: 0, protectedZones: 0, wildZones: 0, dangerZones: 0,
      totalProtections: 0, totalThreats: 0, criticalThreats: 0,
      avgSafetyScore: 0, avgTypeSafety: 0, avgValidationCoverage: 0, avgDefensiveScore: 0,
      endangeredCount: 0, criticalCount: 0,
      overallSafety: 'fortress', sanctuaryIndex: 100, threatDensity: 0, protectionRatio: 1,
    }
    return { zones: [], endangeredPatterns: [], stats: emptyStats, recommendations: [] }
  }

  const zones: SafetyZone[] = []
  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const zone = analyzeSafetyZone(content, files[i])
    zones.push(zone)
  }

  const endangeredPatterns = findEndangeredPatterns(zones, files, contents)

  const totalProtections = zones.reduce((s, z) => s + z.protections.length, 0)
  const totalThreats = zones.reduce((s, z) => s + z.threats.length, 0)
  const criticalThreats = zones.reduce((s, z) => s + z.threats.filter(t => t.severity === 'critical' || t.severity === 'high').length, 0)
  const totalLines = contents.reduce((s, c) => s + c.split('\n').length, 0)

  const avgSafetyScore = Math.round(zones.reduce((s, z) => s + z.safetyScore, 0) / zones.length)
  const avgTypeSafety = Math.round(zones.reduce((s, z) => s + z.typeSafety, 0) / zones.length)
  const avgValidationCoverage = Math.round(zones.reduce((s, z) => s + z.validationCoverage, 0) / zones.length)
  const avgDefensiveScore = Math.round(zones.reduce((s, z) => s + z.defensiveScore, 0) / zones.length)

  const sanctuaryIndex = computeSanctuaryIndex(zones)
  const threatDensity = computeThreatDensity(totalThreats, totalLines)
  const protectionRatio = computeProtectionRatio(totalProtections, totalThreats)
  const overallSafety = classifyOverallSafety(sanctuaryIndex, protectionRatio)

  const stats: SanctuaryStats = {
    totalZones: zones.length,
    sanctuaryZones: zones.filter(z => z.classification === 'sanctuary').length,
    protectedZones: zones.filter(z => z.classification === 'protected').length,
    wildZones: zones.filter(z => z.classification === 'wild').length,
    dangerZones: zones.filter(z => z.classification === 'danger').length,
    totalProtections,
    totalThreats,
    criticalThreats,
    avgSafetyScore,
    avgTypeSafety,
    avgValidationCoverage,
    avgDefensiveScore,
    endangeredCount: endangeredPatterns.filter(e => e.riskLevel === 'endangered' || e.riskLevel === 'critical').length,
    criticalCount: endangeredPatterns.filter(e => e.riskLevel === 'critical').length,
    overallSafety,
    sanctuaryIndex,
    threatDensity,
    protectionRatio,
  }

  const recommendations = generateRecommendations(zones, endangeredPatterns, totalThreats, stats)

  return { zones, endangeredPatterns, stats, recommendations }
}
