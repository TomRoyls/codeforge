// ─── Interfaces ──────────────────────────────────────────

export type DimensionName = 'complexity' | 'type-safety' | 'documentation' | 'coupling' | 'size' | 'consistency' | 'error-handling' | 'abstraction'

export interface DriftDimension {
  dimension: DimensionName
  currentScore: number
  trend: 'improving' | 'stable' | 'degrading' | 'rapidly-degrading'
  velocity: number
  direction: number
  filesContributing: string[]
  description: string
}

export interface FileDrift {
  file: string
  dimensions: Record<string, number>
  overallDrift: number
  driftDirection: 'northward' | 'eastward' | 'southward' | 'westward' | 'stable'
  isDriftingWell: boolean
  isDriftingPoorly: boolean
  isAnchored: boolean
  largestDrift: string
  classification: 'beacon' | 'steady' | 'drifter' | 'sinking' | 'adrift'
}

export interface DriftZone {
  directory: string
  avgDrift: number
  dominantDirection: string
  fileCount: number
  improvingFiles: number
  degradingFiles: number
  stableFiles: number
  health: 'ascending' | 'stable-good' | 'stable-fair' | 'declining' | 'falling'
}

export interface CompassNeedleStats {
  totalFiles: number
  totalDimensions: number
  improvingDimensions: number
  degradingDimensions: number
  stableDimensions: number
  avgOverallDrift: number
  beaconFiles: number
  sinkingFiles: number
  adriftFiles: number
  totalZones: number
  ascendingZones: number
  decliningZones: number
  strongestImprovement: string
  strongestDegradation: string
  overallDrift: number
  driftVelocity: number
  compassHeading: 'true-north' | 'northward' | 'eastward' | 'stable' | 'southward' | 'westward' | 'lost'
  navigationGrade: 'on-course' | 'mostly-on-course' | 'drifting' | 'off-course' | 'lost-at-sea'
}

export interface CompassNeedleResult {
  dimensions: DriftDimension[]
  files: FileDrift[]
  zones: DriftZone[]
  stats: CompassNeedleStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────

const FUNCTION_RE = /(?:function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:async\s+)?\(|=>\s*\{)/g
const IF_RE = /\bif\s*\(/g
const FOR_RE = /\bfor\s*\(/g
const WHILE_RE = /\bwhile\s*\(/g
const SWITCH_RE = /\bswitch\s*\(/g
const TYPE_ANNOTATION_RE = /:\s*(?:string|number|boolean|void|Promise|Record|Map|Set|Array|Date|RegExp|Error|[A-Z]\w+)/
const ANY_TYPE_RE = /:\s*any\b/
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const COMMENT_RE = /\/\/.*$/gm
const IMPORT_RE = /import\s+(?:\{[^}]*\}|\w+)\s+from\s+['"]([^'"]+)['"]/g
const EXPORT_RE = /export\s+(?:default\s+)?(?:function|const|class|interface|type|enum|async\s+function)\s+(\w+)/g
const TRY_CATCH_RE = /try\s*\{/g
const NULL_CHECK_RE = /(?:===\s*null|!==\s*null|===\s*undefined|!==\s*undefined|\?\.\w|\?\?\s)/g
const INTERFACE_RE = /(?:interface|type)\s+\w+\s*(?:<[^>]+>)?\s*\{/
const CLASS_RE = /\bclass\s+\w+/
const ASYNC_RE = /\basync\s+/
const AWAIT_RE = /\bawait\s+/
const GENERIC_RE = /<\w+>/

// ─── measureDimension ────────────────────────────────────

/**
 * Measure a specific quality dimension for content (0-100)
 * @example
 * measureDimension('const x: number = 1', 'a.ts', 'type-safety') // 80
 */
export function measureDimension(content: string, _filePath: string, dimension: DimensionName): number {
  if (content.trim().length === 0) return 50

  switch (dimension) {
    case 'complexity':
      return measureComplexity(content)
    case 'type-safety':
      return measureTypeSafety(content)
    case 'documentation':
      return measureDocumentation(content)
    case 'coupling':
      return measureCoupling(content)
    case 'size':
      return measureSize(content)
    case 'consistency':
      return measureConsistency(content)
    case 'error-handling':
      return measureErrorHandling(content)
    case 'abstraction':
      return measureAbstraction(content)
  }
}

function measureComplexity(content: string): number {
  const branches = ((content.match(IF_RE) ?? []).length +
    (content.match(FOR_RE) ?? []).length +
    (content.match(WHILE_RE) ?? []).length +
    (content.match(SWITCH_RE) ?? []).length)
  const functions = (content.match(FUNCTION_RE) ?? []).length

  if (functions === 0 && branches === 0) return 80

  const avgComplexity = functions > 0 ? branches / functions : branches
  if (avgComplexity <= 2) return 90
  if (avgComplexity <= 4) return 75
  if (avgComplexity <= 6) return 60
  if (avgComplexity <= 10) return 45
  return 30
}

function measureTypeSafety(content: string): number {
  let score = 60

  if (TYPE_ANNOTATION_RE.test(content)) score += 15

  if (ANY_TYPE_RE.test(content)) {
    const anyCount = (content.match(ANY_TYPE_RE) ?? []).length
    score -= Math.min(30, anyCount * 10)
  }

  if (GENERIC_RE.test(content)) score += 10
  if (INTERFACE_RE.test(content)) score += 10

  return Math.max(0, Math.min(100, score))
}

function measureDocumentation(content: string): number {
  let score = 30

  const jsdocCount = (content.match(JSDOC_RE) ?? []).length
  const commentCount = (content.match(COMMENT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length

  if (functions === 0) return 70

  if (jsdocCount > 0) score += 30
  if (jsdocCount >= functions * 0.5) score += 15
  if (commentCount > functions * 0.3) score += 10

  return Math.max(0, Math.min(100, score))
}

function measureCoupling(content: string): string extends 'infer' ? never : number {
  IMPORT_RE.lastIndex = 0
  EXPORT_RE.lastIndex = 0
  const importCount = (content.match(IMPORT_RE) ?? []).length
  const exportCount = (content.match(EXPORT_RE) ?? []).length

  const total = importCount + exportCount

  if (total <= 3) return 90
  if (total <= 6) return 75
  if (total <= 10) return 60
  if (total <= 15) return 45
  return 30
}

function measureSize(content: string): number {
  const lines = content.split('\n').length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const effectiveFunctions = Math.max(1, functions)

  const linesPerFunction = lines / effectiveFunctions

  if (linesPerFunction <= 30) return 90
  if (linesPerFunction <= 60) return 75
  if (linesPerFunction <= 100) return 60
  if (linesPerFunction <= 200) return 45
  return 30
}

function measureConsistency(content: string): number {
  let score = 70

  const singleQuotes = (content.match(/'/g) ?? []).length
  const doubleQuotes = (content.match(/"/g) ?? []).length
  const totalQuotes = singleQuotes + doubleQuotes
  if (totalQuotes > 0) {
    const ratio = Math.min(singleQuotes, doubleQuotes) / totalQuotes
    if (ratio < 0.2) score += 10
    else if (ratio > 0.4) score -= 15
  }

  const semicolons = (content.match(/;/g) ?? []).length
  const statements = (content.match(/\n/g) ?? []).length
  if (statements > 0 && semicolons > 0) {
    const semiRatio = semicolons / statements
    if (semiRatio > 0.8 || semiRatio < 0.1) score += 5
  }

  const hasConst = content.includes('const ')
  const hasLet = content.includes('let ')
  const hasVar = content.includes('var ')
  if (hasVar) score -= 15
  if (hasConst && !hasLet && !hasVar) score += 5

  return Math.max(0, Math.min(100, score))
}

function measureErrorHandling(content: string): number {
  let score = 50

  const tryCount = (content.match(TRY_CATCH_RE) ?? []).length
  const nullChecks = (content.match(NULL_CHECK_RE) ?? []).length

  if (tryCount > 0) score += 15
  if (nullChecks > 0) score += Math.min(15, nullChecks * 5)
  if (content.includes('throw ')) score += 10
  if (content.includes('.catch(')) score += 5

  const emptyCatch = /catch\s*\([^)]*\)\s*\{\s*\}/
  if (emptyCatch.test(content)) score -= 20

  return Math.max(0, Math.min(100, score))
}

function measureAbstraction(content: string): number {
  let score = 50

  if (CLASS_RE.test(content)) score += 10
  if (INTERFACE_RE.test(content)) score += 15
  if (GENERIC_RE.test(content)) score += 10
  if (ASYNC_RE.test(content)) score += 5
  if (AWAIT_RE.test(content)) score += 5

  const functions = (content.match(FUNCTION_RE) ?? []).length
  if (functions >= 3 && functions <= 15) score += 10
  else if (functions > 25) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ─── computeDriftDirection ───────────────────────────────

/**
 * Compute drift trend from a dimension score
 * @example
 * computeDriftDirection(85) // 'improving'
 */
export function computeDriftDirection(currentScore: number): DriftDimension['trend'] {
  if (currentScore >= 75) return 'improving'
  if (currentScore >= 55) return 'stable'
  if (currentScore >= 35) return 'degrading'
  return 'rapidly-degrading'
}

/**
 * Compute direction value from score (-1 to +1)
 * @example
 * computeDirectionValue(80) // 0.6
 */
export function computeDirectionValue(currentScore: number): number {
  return (currentScore - 50) / 50
}

// ─── computeFileDrift ────────────────────────────────────

/**
 * Compute drift analysis for a single file
 * @example
 * computeFileDrift('const x = 1', 'a.ts') // FileDrift
 */
export function computeFileDrift(content: string, filePath: string): FileDrift {
  const dimensions: Record<string, number> = {}
  const dimensionNames: DimensionName[] = [
    'complexity', 'type-safety', 'documentation', 'coupling',
    'size', 'consistency', 'error-handling', 'abstraction',
  ]

  for (const dim of dimensionNames) {
    dimensions[dim] = measureDimension(content, filePath, dim)
  }

  const scores = Object.values(dimensions)
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length
  const overallDrift = Math.round((avg - 50) * 2)

  const driftDirection = classifyDriftDirection(overallDrift)
  const isDriftingWell = overallDrift > 20
  const isDriftingPoorly = overallDrift < -20
  const isAnchored = Math.abs(overallDrift) <= 10

  const entries = Object.entries(dimensions)
  const largestEntry = entries.reduce<[string, number]>(
    (worst, [k, v]) => v < worst[1] ? [k, v] : worst,
    entries[0] ?? ['', 100],
  )
  const largestDrift = largestEntry[0]

  const classification = classifyFile(overallDrift, avg)

  return {
    classification,
    dimensions,
    driftDirection,
    file: filePath,
    isAnchored,
    isDriftingPoorly,
    isDriftingWell,
    largestDrift,
    overallDrift,
  }
}

function classifyDriftDirection(drift: number): FileDrift['driftDirection'] {
  if (drift > 30) return 'northward'
  if (drift > 10) return 'eastward'
  if (drift < -30) return 'southward'
  if (drift < -10) return 'westward'
  return 'stable'
}

function classifyFile(drift: number, avg: number): FileDrift['classification'] {
  if (avg >= 80) return 'beacon'
  if (Math.abs(drift) <= 10) return 'steady'
  if (drift > 10) return 'drifter'
  if (drift < -30) return 'sinking'
  return 'adrift'
}

// ─── analyzeZone ─────────────────────────────────────────

/**
 * Analyze drift for a directory zone
 * @example
 * analyzeZone([fileDrift1, fileDrift2], 'src/utils') // DriftZone
 */
export function analyzeZone(files: FileDrift[], dirPath: string): DriftZone {
  if (files.length === 0) {
    return {
      avgDrift: 0,
      degradingFiles: 0,
      directory: dirPath,
      dominantDirection: 'stable',
      fileCount: 0,
      health: 'stable-fair',
      improvingFiles: 0,
      stableFiles: 0,
    }
  }

  const avgDrift = Math.round(files.reduce((sum, f) => sum + f.overallDrift, 0) / files.length)
  const improving = files.filter((f) => f.isDriftingWell).length
  const degrading = files.filter((f) => f.isDriftingPoorly).length
  const stable = files.filter((f) => f.isAnchored).length

  const directions = files.map((f) => f.driftDirection)
  const directionCounts = new Map<string, number>()
  for (const d of directions) {
    directionCounts.set(d, (directionCounts.get(d) ?? 0) + 1)
  }
  let dominantDirection = 'stable'
  let maxCount = 0
  for (const [dir, count] of directionCounts) {
    if (count > maxCount) {
      maxCount = count
      dominantDirection = dir
    }
  }

  const health = classifyZoneHealth(avgDrift)

  return {
    avgDrift,
    degradingFiles: degrading,
    directory: dirPath,
    dominantDirection,
    fileCount: files.length,
    health,
    improvingFiles: improving,
    stableFiles: stable,
  }
}

function classifyZoneHealth(avgDrift: number): DriftZone['health'] {
  if (avgDrift > 30) return 'ascending'
  if (avgDrift > 10) return 'stable-good'
  if (avgDrift > -10) return 'stable-fair'
  if (avgDrift > -30) return 'declining'
  return 'falling'
}

// ─── computeOverallDrift ─────────────────────────────────

/**
 * Compute overall drift score (-100 to +100)
 * @example
 * computeOverallDrift([fileDrift1, fileDrift2]) // 25
 */
export function computeOverallDrift(files: FileDrift[]): number {
  if (files.length === 0) return 0
  return Math.round(files.reduce((sum, f) => sum + f.overallDrift, 0) / files.length)
}

// ─── computeDriftVelocity ────────────────────────────────

/**
 * Compute drift velocity (absolute rate of change)
 * @example
 * computeDriftVelocity(dimensions) // 15
 */
export function computeDriftVelocity(dimensions: DriftDimension[]): number {
  if (dimensions.length === 0) return 0
  return Math.round(dimensions.reduce((sum, d) => sum + Math.abs(d.velocity), 0) / dimensions.length)
}

// ─── computeCompassHeading ───────────────────────────────

/**
 * Compute compass heading from overall drift and velocity
 * @example
 * computeCompassHeading(50, 10) // 'true-north'
 */
export function computeCompassHeading(
  overallDrift: number,
  velocity: number,
): CompassNeedleStats['compassHeading'] {
  if (overallDrift > 50 && velocity > 10) return 'true-north'
  if (overallDrift > 20) return 'northward'
  if (overallDrift > -20) {
    if (velocity < 5) return 'stable'
    return 'eastward'
  }
  if (overallDrift > -50) return 'southward'
  return 'westward'
}

// ─── classifyNavigationGrade ─────────────────────────────

/**
 * Classify navigation grade based on heading and drift
 * @example
 * classifyNavigationGrade('true-north', 60) // 'on-course'
 */
export function classifyNavigationGrade(
  heading: CompassNeedleStats['compassHeading'],
  drift: number,
): CompassNeedleStats['navigationGrade'] {
  if (heading === 'true-north') return 'on-course'
  if (heading === 'northward') return 'mostly-on-course'
  if (heading === 'eastward' || heading === 'stable') {
    return drift > 0 ? 'mostly-on-course' : 'drifting'
  }
  if (heading === 'southward') return 'off-course'
  return 'lost-at-sea'
}

// ─── generateRecommendations ────────────────────────────

/**
 * Generate recommendations for drift correction
 * @example
 * generateRecommendations(dimensions, files, zones, stats) // ['Improve type safety...']
 */
export function generateRecommendations(
  dimensions: DriftDimension[],
  files: FileDrift[],
  zones: DriftZone[],
  stats: CompassNeedleStats,
): string[] {
  const recs: string[] = []

  const degrading = dimensions.filter((d) => d.trend === 'degrading' || d.trend === 'rapidly-degrading')
  if (degrading.length > 0) {
    const names = degrading.map((d) => d.dimension).join(', ')
    recs.push(`Focus improvement on degrading dimensions: ${names}`)
  }

  const sinking = files.filter((f) => f.classification === 'sinking')
  if (sinking.length > 0) {
    recs.push(`Priority refactoring needed for ${sinking.length} sinking file(s): ${sinking.slice(0, 3).map((f) => f.file).join(', ')}`)
  }

  const declining = zones.filter((z) => z.health === 'declining' || z.health === 'falling')
  if (declining.length > 0) {
    recs.push(`Stabilize declining zone(s): ${declining.map((z) => z.directory).join(', ')}`)
  }

  if (stats.navigationGrade === 'lost-at-sea') {
    recs.push('Critical: Establish clear coding standards and direction before adding new features.')
  } else if (stats.navigationGrade === 'off-course') {
    recs.push('Course correction needed: address the strongest degrading dimension first.')
  }

  if (stats.strongestDegradation) {
    const dim = dimensions.find((d) => d.dimension === stats.strongestDegradation)
    if (dim) {
      recs.push(`Strongest degradation in '${dim.dimension}': ${dim.description}`)
    }
  }

  return recs
}

// ─── buildCompassNeedleResult ────────────────────────────

/**
 * Build the full compass needle analysis result
 * @example
 * buildCompassNeedleResult(['foo.ts'], ['export function foo(): void {}'], {}) // CompassNeedleResult
 */
export function buildCompassNeedleResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): CompassNeedleResult {
  const allDimensions: DimensionName[] = [
    'complexity', 'type-safety', 'documentation', 'coupling',
    'size', 'consistency', 'error-handling', 'abstraction',
  ]

  // Build file drifts
  const fileDrifts: FileDrift[] = []
  for (let i = 0; i < files.length; i++) {
    fileDrifts.push(computeFileDrift(contents[i] ?? '', files[i] ?? ''))
  }

  // Build dimension aggregations
  const dimensions: DriftDimension[] = allDimensions.map((dim) => {
    const scores: number[] = []
    const contributing: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i] ?? ''
      const score = measureDimension(contents[i] ?? '', file, dim)
      scores.push(score)
      if (score < 50) contributing.push(file)
    }

    const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 50
    const trend = computeDriftDirection(avg)
    const direction = computeDirectionValue(avg)
    const velocity = Math.round(Math.abs(direction) * 20)

    return {
      currentScore: Math.round(avg),
      description: `${dim} quality across ${files.length} file(s)`,
      dimension: dim,
      direction: Math.round(direction * 100) / 100,
      filesContributing: contributing,
      trend,
      velocity,
    }
  })

  // Build zones by directory
  const dirMap = new Map<string, FileDrift[]>()
  for (const fd of fileDrifts) {
    const dir = fd.file.includes('/') ? fd.file.substring(0, fd.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(fd)
    else dirMap.set(dir, [fd])
  }

  const zones: DriftZone[] = []
  for (const [dir, fds] of dirMap) {
    zones.push(analyzeZone(fds, dir))
  }

  // Stats
  const overallDrift = computeOverallDrift(fileDrifts)
  const driftVelocity = computeDriftVelocity(dimensions)
  const compassHeading = computeCompassHeading(overallDrift, driftVelocity)
  const navigationGrade = classifyNavigationGrade(compassHeading, overallDrift)

  const improvingDims = dimensions.filter((d) => d.trend === 'improving').length
  const degradingDims = dimensions.filter((d) => d.trend === 'degrading' || d.trend === 'rapidly-degrading').length
  const stableDims = dimensions.filter((d) => d.trend === 'stable').length

  const sentinelDim: DriftDimension = { dimension: 'complexity', currentScore: -1, trend: 'stable', velocity: 0, direction: 0, filesContributing: [], description: '' }
  const worstSentinel: DriftDimension = { dimension: 'complexity', currentScore: 101, trend: 'stable', velocity: 0, direction: 0, filesContributing: [], description: '' }
  const strongestImprovement = dimensions.length > 0
    ? dimensions.reduce((best, d) => d.currentScore > best.currentScore ? d : best, sentinelDim).dimension
    : 'none'
  const weakest = dimensions.length > 0
    ? dimensions.reduce((worst, d) => d.currentScore < worst.currentScore ? d : worst, worstSentinel)
    : null
  const strongestDegradation = weakest && weakest.currentScore < 60 ? weakest.dimension : ''

  const stats: CompassNeedleStats = {
    adriftFiles: fileDrifts.filter((f) => f.classification === 'adrift').length,
    ascendingZones: zones.filter((z) => z.health === 'ascending').length,
    avgOverallDrift: overallDrift,
    beaconFiles: fileDrifts.filter((f) => f.classification === 'beacon').length,
    compassHeading,
    decliningZones: zones.filter((z) => z.health === 'declining' || z.health === 'falling').length,
    degradingDimensions: degradingDims,
    driftVelocity,
    improvingDimensions: improvingDims,
    navigationGrade,
    overallDrift,
    sinkingFiles: fileDrifts.filter((f) => f.classification === 'sinking').length,
    stableDimensions: stableDims,
    strongestDegradation,
    strongestImprovement,
    totalDimensions: dimensions.length,
    totalFiles: files.length,
    totalZones: zones.length,
  }

  const recommendations = generateRecommendations(dimensions, fileDrifts, zones, stats)

  return {
    dimensions,
    files: fileDrifts,
    recommendations,
    stats,
    zones,
  }
}
