// ─── Types ─────────────────────────────────────────────────────────────────────

export type AdaptationType = 'polymorphic' | 'configurable' | 'pluggable' | 'contextual' | 'generic' | 'overridable'
export type RigidType = 'hardcoded' | 'tightly-coupled' | 'concrete-only' | 'no-abstraction' | 'magic-value' | 'fixed-structure'
export type RigidSeverity = 'minor' | 'moderate' | 'major'
export type FileClassification = 'shapeshifter' | 'adaptive' | 'flexible' | 'rigid' | 'fossilized'
export type OverallAdaptability = 'protean' | 'adaptive' | 'moderate' | 'rigid' | 'petrified'

export interface Adaptation {
  type: AdaptationType
  location: number
  description: string
  strength: number
}

export interface RigidPoint {
  type: RigidType
  location: number
  severity: RigidSeverity
  description: string
  flexibility: string
}

export interface AdaptabilityScore {
  file: string
  flexibility: number
  polymorphism: number
  configurability: number
  contextAdaptation: number
  extensibility: number
  rigidity: number
  colorSpectrum: string[]
  adaptations: Adaptation[]
  rigidPoints: RigidPoint[]
  classification: FileClassification
}

export interface ColorShift {
  context: string
  files: string[]
  adaptability: number
  isWellHandled: boolean
}

export interface ChameleonStats {
  totalFiles: number
  avgFlexibility: number
  avgPolymorphism: number
  avgConfigurability: number
  avgExtensibility: number
  avgRigidity: number
  shapeshifterFiles: number
  fossilizedFiles: number
  totalAdaptations: number
  totalRigidPoints: number
  majorRigidPoints: number
  hardcodedValues: number
  magicNumbers: number
  concreteOnlyFiles: number
  contextCount: number
  adaptabilityIndex: number
  flexibilityScore: number
  rigidityIndex: number
  overallAdaptability: OverallAdaptability
}

export interface ChameleonResult {
  scores: AdaptabilityScore[]
  colorShifts: ColorShift[]
  stats: ChameleonStats
  recommendations: string[]
}

// ─── measureFlexibility ────────────────────────────────────────────────────────

/**
 * Measure code flexibility 0-100
 * @example
 * measureFlexibility('interface A {} abstract class B {}') // high
 */
export function measureFlexibility(content: string): number {
  let score = 40
  if (/interface\s+\w+/.test(content)) score += 10
  if (/abstract\s+(class|function)/.test(content)) score += 10
  if (/<\w+>/.test(content) || /extends\s+\w+/.test(content)) score += 10
  if (/implements\s+\w+/.test(content)) score += 8
  if (/factory|create\w*\s*\(/.test(content)) score += 7
  if (/strategy|plugin|hook/.test(content)) score += 5
  const hardcoded = (content.match(/['"][A-Z]\w+['"]\s*[;)\]]/g) || []).length
  score -= Math.min(15, hardcoded * 3)
  const fixedPaths = (content.match(/['"]\/[\w/]+\.(ts|js|json)['"]/g) || []).length
  score -= Math.min(10, fixedPaths * 3)
  return Math.max(0, Math.min(100, score))
}

// ─── measurePolymorphism ───────────────────────────────────────────────────────

/**
 * Measure polymorphism 0-100
 * @example
 * measurePolymorphism('type X = A | B | C') // high
 */
export function measurePolymorphism(content: string): number {
  let score = 35
  if (/type\s+\w+\s*=/.test(content)) score += 10
  if (/\w+\s*\|\s*\w+/.test(content)) score += 10
  if (/<\w+>/.test(content)) score += 10
  if (/overload|signature/.test(content)) score += 8
  if (/instanceof\s+\w/.test(content)) score += 5
  if (/typeof\s+\w/.test(content)) score += 7
  const concreteOnly = (content.match(/:\s*\w{3,}(?!\s*[\|&])/g) || []).length
  score -= Math.min(10, Math.max(0, concreteOnly - 3) * 2)
  if (/as\s+\w/.test(content)) score -= 5
  return Math.max(0, Math.min(100, score))
}

// ─── measureConfigurability ────────────────────────────────────────────────────

/**
 * Measure configurability 0-100
 * @example
 * measureConfigurability('const x = process.env.KEY') // high
 */
export function measureConfigurability(content: string): number {
  let score = 35
  if (/process\.env/.test(content)) score += 15
  if (/options|config|settings/i.test(content)) score += 10
  if (/\w+\?\.\w+/.test(content)) score += 5
  if (/default\s*:/.test(content)) score += 5
  if (/\?\?/.test(content)) score += 5
  if (/arguments\.|argv/.test(content)) score += 5
  const magicNumbers = (content.match(/(?<![.\w])\d{2,}(?![.\w])/g) || []).length
  score -= Math.min(15, magicNumbers * 3)
  const hardcodedStrings = (content.match(/['"][A-Z][A-Z_]+['"]/g) || []).length
  score -= Math.min(10, hardcodedStrings * 2)
  return Math.max(0, Math.min(100, score))
}

// ─── measureContextAdaptation ──────────────────────────────────────────────────

/**
 * Measure context adaptation 0-100
 * @example
 * measureContextAdaptation('if (isProd) {} else {}') // high
 */
export function measureContextAdaptation(content: string): number {
  let score = 30
  if (/process\.env/.test(content)) score += 10
  if (/NODE_ENV|environment|env/i.test(content)) score += 10
  if (/platform|OS|os\./.test(content)) score += 8
  if (/feature.?flag|toggle|enabled/i.test(content)) score += 10
  if (/if\s*\([^)]*\|\|[^)]*\)/.test(content)) score += 5
  if (/typeof\s+window|typeof\s+document/.test(content)) score += 7
  if (/process\.env\.NODE_ENV/.test(content)) score += 10
  return Math.max(0, Math.min(100, score))
}

// ─── measureExtensibility ──────────────────────────────────────────────────────

/**
 * Measure extensibility 0-100
 * @example
 * measureExtensibility('export function plugin() {}') // high
 */
export function measureExtensibility(content: string): number {
  let score = 35
  if (/export\s+(function|class|const|interface)/.test(content)) score += 10
  if (/callback|handler|listener/.test(content)) score += 8
  if (/plugin|extension|middleware/.test(content)) score += 10
  if (/\.\.\./.test(content)) score += 5
  if (/extends\s+\w+/.test(content)) score += 7
  if (/override|virtual/.test(content)) score += 5
  if (/sealed|final/.test(content)) score -= 10
  const privateCount = (content.match(/private\s+/g) || []).length
  score -= Math.min(10, privateCount * 2)
  return Math.max(0, Math.min(100, score))
}

// ─── findAdaptations ───────────────────────────────────────────────────────────

/**
 * Find flexible adaptation patterns
 * @example
 * findAdaptations('interface A {}') // Adaptation[]
 */
export function findAdaptations(content: string): Adaptation[] {
  const adaptations: Adaptation[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    if (/interface\s+\w+/.test(line)) {
      adaptations.push({ type: 'polymorphic', location: lineNum, description: 'Interface definition enables polymorphism', strength: 80 })
    }
    if (/<\w+>/.test(line) && !/import|from/.test(line)) {
      adaptations.push({ type: 'generic', location: lineNum, description: 'Generic type parameter', strength: 75 })
    }
    if (/process\.env/.test(line)) {
      adaptations.push({ type: 'configurable', location: lineNum, description: 'Environment variable usage', strength: 70 })
    }
    if (/options|config|settings/i.test(line) && /=/.test(line)) {
      adaptations.push({ type: 'configurable', location: lineNum, description: 'Configuration object', strength: 65 })
    }
    if (/callback|handler|listener/i.test(line) && /=|:/.test(line)) {
      adaptations.push({ type: 'pluggable', location: lineNum, description: 'Callback/handler pattern', strength: 70 })
    }
    if (/\.then\(|\.catch\(|=>\s*[{(]/.test(line)) {
      adaptations.push({ type: 'contextual', location: lineNum, description: 'Async context handling', strength: 60 })
    }
    if (/typeof\s+\w/.test(line)) {
      adaptations.push({ type: 'overridable', location: lineNum, description: 'Runtime type check for adaptation', strength: 55 })
    }
    if (/default\s*:/.test(line)) {
      adaptations.push({ type: 'configurable', location: lineNum, description: 'Default configuration value', strength: 50 })
    }
  }

  return adaptations
}

// ─── findRigidPoints ───────────────────────────────────────────────────────────

/**
 * Find rigid inflexible patterns
 * @example
 * findRigidPoints('const url = "http://localhost:3000"') // RigidPoint[]
 */
export function findRigidPoints(content: string): RigidPoint[] {
  const rigidPoints: RigidPoint[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    const hardcodedUrls = line.match(/['"][A-Z]\w+['"]\s*[;)\]]/g)
    if (hardcodedUrls) {
      for (const h of hardcodedUrls) {
        rigidPoints.push({
          type: 'hardcoded', location: lineNum, severity: 'moderate',
          description: `Hardcoded value: ${h.trim()}`,
          flexibility: 'Move to configuration',
        })
      }
    }

    const magicNums = line.match(/(?<![.\w])\d{2,}(?![.\w])/g)
    if (magicNums && !/import|export|const\s+\w+\s*=\s*\d/.test(line)) {
      for (const n of magicNums) {
        rigidPoints.push({
          type: 'magic-value', location: lineNum, severity: 'minor',
          description: `Magic number: ${n}`,
          flexibility: 'Extract to named constant',
        })
      }
    }

    if (/new\s+\w+[^(]*\(\)/.test(line) && !/Error|Map|Set|Date|Array|Promise|RegExp/.test(line)) {
      rigidPoints.push({
        type: 'tightly-coupled', location: lineNum, severity: 'major',
        description: 'Direct instantiation — tight coupling',
        flexibility: 'Use dependency injection or factory',
      })
    }

    if (line.includes(': ') && !/interface|type\s|: string|: number|: boolean|: void|: any|<|=>/.test(line)) {
      const concreteMatch = line.match(/:\s*[A-Z]\w+(?!\s*[<|(\[])/)
      if (concreteMatch && !/import|export type|interface|type\s+\w+/.test(line)) {
        rigidPoints.push({
          type: 'concrete-only', location: lineNum, severity: 'moderate',
          description: `Concrete type only: ${concreteMatch[0]}`,
          flexibility: 'Use interface or union type',
        })
      }
    }

    const funcLines = lines.filter(l => /function|=>/.test(l))
    if (funcLines.length > 15 && i === lines.length - 1) {
      rigidPoints.push({
        type: 'no-abstraction', location: 1, severity: 'major',
        description: 'Many functions without clear module boundaries',
        flexibility: 'Split into focused modules with interfaces',
      })
    }
  }

  if (lines.length > 300 && !/import\s+/.test(content)) {
    rigidPoints.push({
      type: 'fixed-structure', location: 1, severity: 'moderate',
      description: 'Large file without imports — monolithic structure',
      flexibility: 'Break into smaller, importable modules',
    })
  }

  return rigidPoints
}

// ─── detectColorShifts ─────────────────────────────────────────────────────────

/**
 * Detect context-handling patterns
 * @example
 * detectColorShifts(['a.ts'], ['process.env.NODE_ENV']) // ColorShift[]
 */
export function detectColorShifts(files: string[], contents: string[]): ColorShift[] {
  const shifts: ColorShift[] = []

  const envFiles: string[] = []
  const platformFiles: string[] = []
  const featureFlagFiles: string[] = []
  const configFiles: string[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i]
    if (/process\.env|NODE_ENV/.test(content)) envFiles.push(files[i])
    if (/platform|os\.|typeof\s+window/.test(content)) platformFiles.push(files[i])
    if (/feature.?flag|toggle|isEnabled|isDisabled/i.test(content)) featureFlagFiles.push(files[i])
    if (/options|config|settings/i.test(content)) configFiles.push(files[i])
  }

  if (envFiles.length > 0) {
    shifts.push({
      context: 'environment',
      files: envFiles,
      adaptability: 70,
      isWellHandled: envFiles.length > 0,
    })
  }

  if (platformFiles.length > 0) {
    shifts.push({
      context: 'platform',
      files: platformFiles,
      adaptability: 60,
      isWellHandled: platformFiles.length > 0,
    })
  }

  if (featureFlagFiles.length > 0) {
    shifts.push({
      context: 'feature-flags',
      files: featureFlagFiles,
      adaptability: 80,
      isWellHandled: true,
    })
  }

  if (configFiles.length > 0) {
    shifts.push({
      context: 'configuration',
      files: configFiles,
      adaptability: 75,
      isWellHandled: configFiles.length > 0,
    })
  }

  return shifts
}

// ─── classifyFile ──────────────────────────────────────────────────────────────

/**
 * Classify file adaptability
 * @example
 * classifyFile(score) // 'shapeshifter'
 */
export function classifyFile(score: AdaptabilityScore): FileClassification {
  const avg = (score.flexibility + score.polymorphism + score.configurability + score.extensibility) / 4
  if (avg >= 75 && score.rigidity <= 20) return 'shapeshifter'
  if (avg >= 60 && score.rigidity <= 35) return 'adaptive'
  if (avg >= 45) return 'flexible'
  if (avg >= 25) return 'rigid'
  return 'fossilized'
}

// ─── computeAdaptabilityIndex ──────────────────────────────────────────────────

/**
 * Compute overall adaptability index 0-100
 * @example
 * computeAdaptabilityIndex(scores) // 72
 */
export function computeAdaptabilityIndex(scores: AdaptabilityScore[]): number {
  if (scores.length === 0) return 50
  const avg = scores.reduce((s, sc) => s + (sc.flexibility + sc.polymorphism + sc.configurability + sc.extensibility) / 4, 0) / scores.length
  const avgRigidity = scores.reduce((s, sc) => s + sc.rigidity, 0) / scores.length
  return Math.max(0, Math.min(100, Math.round(avg * 0.7 + (100 - avgRigidity) * 0.3)))
}

/**
 * Compute flexibility score 0-100
 * @example
 * computeFlexibilityScore(scores) // 65
 */
export function computeFlexibilityScore(scores: AdaptabilityScore[]): number {
  if (scores.length === 0) return 50
  return Math.round(scores.reduce((s, sc) => s + sc.flexibility, 0) / scores.length)
}

/**
 * Compute rigidity index 0-100
 * @example
 * computeRigidityIndex(scores) // 30
 */
export function computeRigidityIndex(scores: AdaptabilityScore[]): number {
  if (scores.length === 0) return 50
  return Math.round(scores.reduce((s, sc) => s + sc.rigidity, 0) / scores.length)
}

/**
 * Classify overall adaptability
 * @example
 * classifyOverall(80, 20) // 'protean'
 */
export function classifyOverall(adaptability: number, rigidity: number): OverallAdaptability {
  if (adaptability >= 75 && rigidity <= 25) return 'protean'
  if (adaptability >= 60 && rigidity <= 40) return 'adaptive'
  if (adaptability >= 40) return 'moderate'
  if (adaptability >= 20) return 'rigid'
  return 'petrified'
}

// ─── generateRecommendations ───────────────────────────────────────────────────

/**
 * Generate chameleon recommendations
 * @example
 * generateRecommendations(scores, rigidPoints, stats) // string[]
 */
export function generateRecommendations(
  scores: AdaptabilityScore[],
  rigidPoints: RigidPoint[],
  stats: ChameleonStats,
): string[] {
  const recs: string[] = []

  const fossilized = scores.filter(s => s.classification === 'fossilized')
  if (fossilized.length > 0) {
    recs.push(`Add abstractions and configuration to ${fossilized.length} fossilized file(s)`)
  }

  const hardcoded = rigidPoints.filter(r => r.type === 'hardcoded')
  if (hardcoded.length > 0) {
    recs.push(`Externalize ${hardcoded.length} hardcoded value(s) to configuration`)
  }

  const major = rigidPoints.filter(r => r.severity === 'major')
  if (major.length > 0) {
    recs.push(`Refactor ${major.length} major rigid point(s) for flexibility`)
  }

  if (stats.avgPolymorphism < 40) {
    recs.push('Low polymorphism — introduce interfaces, generics, or union types')
  }

  if (stats.rigidityIndex > 60) {
    recs.push('High rigidity index — reduce tight coupling and hardcoded values')
  }

  if (stats.concreteOnlyFiles > 0) {
    recs.push(`${stats.concreteOnlyFiles} file(s) use only concrete types — add interfaces`)
  }

  if (stats.magicNumbers > 5) {
    recs.push(`Extract ${stats.magicNumbers} magic number(s) to named constants`)
  }

  return Array.from(new Set(recs))
}

// ─── Build Score ───────────────────────────────────────────────────────────────

/**
 * Build adaptability score for a single file
 * @example
 * buildScore('interface A {}', 'a.ts') // AdaptabilityScore
 */
export function buildScore(content: string, filePath: string): AdaptabilityScore {
  const flexibility = measureFlexibility(content)
  const polymorphism = measurePolymorphism(content)
  const configurability = measureConfigurability(content)
  const contextAdaptation = measureContextAdaptation(content)
  const extensibility = measureExtensibility(content)

  const adaptations = findAdaptations(content)
  const rigidPoints = findRigidPoints(content)

  const rigidity = Math.max(0, Math.min(100, Math.round(
    rigidPoints.filter(r => r.severity === 'major').length * 15 +
    rigidPoints.filter(r => r.severity === 'moderate').length * 8 +
    rigidPoints.filter(r => r.severity === 'minor').length * 3
  )))

  const colorSpectrum: string[] = []
  if (/process\.env|NODE_ENV/.test(content)) colorSpectrum.push('environment')
  if (/platform|os\./.test(content)) colorSpectrum.push('platform')
  if (/feature.?flag|toggle/i.test(content)) colorSpectrum.push('feature-flags')
  if (/options|config/i.test(content)) colorSpectrum.push('configuration')
  if (/async|await|Promise/.test(content)) colorSpectrum.push('async')
  if (colorSpectrum.length === 0) colorSpectrum.push('single-context')

  const score: AdaptabilityScore = {
    file: filePath,
    flexibility,
    polymorphism,
    configurability,
    contextAdaptation,
    extensibility,
    rigidity,
    colorSpectrum: Array.from(new Set(colorSpectrum)),
    adaptations,
    rigidPoints,
    classification: 'flexible',
  }
  score.classification = classifyFile(score)
  return score
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the complete chameleon result
 * @example
 * buildChameleonResult(['a.ts'], ['const x = 1'], {}) // ChameleonResult
 */
export function buildChameleonResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): ChameleonResult {
  const scores: AdaptabilityScore[] = []
  for (let i = 0; i < files.length; i++) {
    scores.push(buildScore(contents[i], files[i]))
  }

  const colorShifts = detectColorShifts(files, contents)

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const allRigidPoints = scores.flatMap(s => s.rigidPoints)
  const allAdaptations = scores.flatMap(s => s.adaptations)

  const adaptabilityIndex = computeAdaptabilityIndex(scores)
  const flexibilityScore = computeFlexibilityScore(scores)
  const rigidityIndex = computeRigidityIndex(scores)
  const overallAdaptability = classifyOverall(adaptabilityIndex, rigidityIndex)

  const concreteOnlyFiles = scores.filter(s => s.polymorphism < 30).length

  const stats: ChameleonStats = {
    totalFiles: files.length,
    avgFlexibility: avg(scores.map(s => s.flexibility)),
    avgPolymorphism: avg(scores.map(s => s.polymorphism)),
    avgConfigurability: avg(scores.map(s => s.configurability)),
    avgExtensibility: avg(scores.map(s => s.extensibility)),
    avgRigidity: avg(scores.map(s => s.rigidity)),
    shapeshifterFiles: scores.filter(s => s.classification === 'shapeshifter').length,
    fossilizedFiles: scores.filter(s => s.classification === 'fossilized').length,
    totalAdaptations: allAdaptations.length,
    totalRigidPoints: allRigidPoints.length,
    majorRigidPoints: allRigidPoints.filter(r => r.severity === 'major').length,
    hardcodedValues: allRigidPoints.filter(r => r.type === 'hardcoded').length,
    magicNumbers: allRigidPoints.filter(r => r.type === 'magic-value').length,
    concreteOnlyFiles,
    contextCount: colorShifts.length,
    adaptabilityIndex,
    flexibilityScore,
    rigidityIndex,
    overallAdaptability,
  }

  const recommendations = generateRecommendations(scores, allRigidPoints, stats)

  return { scores, colorShifts, stats, recommendations }
}
