// ─── Interfaces ──────────────────────────────────────────────────────────────

export type BeamColor = 'white' | 'red' | 'green' | 'amber' | 'blue' | 'dim' | 'off'
export type BeamPattern = 'fixed' | 'flashing' | 'occulting' | 'quick-flash' | 'isophase' | 'morse'
export type LensType = 'fresnel' | 'bullseye' | 'prismatic' | 'reflective' | 'simple' | 'none'
export type BeaconCondition = 'brilliant' | 'bright' | 'adequate' | 'dim' | 'dark' | 'extinguished'
export type CoastlineCondition = 'well-lit-coast' | 'navigable' | 'partial-coverage' | 'dark-stretch' | 'blackout' | 'shipwreck-coast'
export type KeeperGrade = 'head-keeper' | 'lighthouse-keeper' | 'watchman' | 'sailor' | 'castaway' | 'lost-at-sea'

export interface BeamInfo {
  isOn: boolean
  intensity: number
  color: BeamColor
  pattern: BeamPattern
  rotationSpeed: number
  hasDeadZones: boolean
  deadZoneCount: number
}

export interface LensInfo {
  type: LensType
  quality: number
  focusClarity: number
  hasCracks: boolean
  hasCloudiness: boolean
  crackCount: number
}

export interface FogInfo {
  hasHorn: boolean
  hornVolume: number
  fogDensity: number
  penetrationDepth: number
  isNavigableInFog: boolean
}

export interface GuidanceInfo {
  hasEntryPoint: boolean
  hasNavigationAids: boolean
  hasWarningSignals: boolean
  hasLandingInstructions: boolean
  hasKeepOutSignals: boolean
  navigationAidCount: number
  warningCount: number
  exampleCount: number
}

export interface VisibilityInfo {
  fromShore: number
  fromSea: number
  inDarkness: number
  inStorm: number
  avgVisibility: number
}

export interface KeeperInfo {
  isMaintained: boolean
  maintenanceQuality: number
  isAutomated: boolean
  hasKeeper: boolean
  lastMaintenance: string
}

export interface TowerInfo {
  height: number
  isStable: boolean
  hasFoundation: boolean
  foundationDepth: number
}

export interface BeaconSignal {
  file: string
  beamIntensity: number
  sweepRange: number
  reachDistance: number
  fresnelQuality: number
  fogPenetration: number
  beaconReliability: number
  beam: BeamInfo
  lens: LensInfo
  fog: FogInfo
  guidance: GuidanceInfo
  visibility: VisibilityInfo
  keeper: KeeperInfo
  tower: TowerInfo
  condition: BeaconCondition
  qualityScore: number
}

export interface CoastLine {
  directory: string
  beacons: BeaconSignal[]
  avgBeamIntensity: number
  avgFogPenetration: number
  avgBeaconReliability: number
  brilliantCount: number
  extinguishedCount: number
  hasCoverage: boolean
  coverageGaps: number
  deadZones: number
  coastlineSafety: number
  condition: CoastlineCondition
}

export interface CoastguardInfo {
  avgBeamIntensity: number
  avgFogPenetration: number
  coverageGaps: number
  deadZones: number
  isSafeToNavigate: boolean
  overallVisibility: number
}

export interface LighthouseBeamStats {
  totalFiles: number
  totalCoastlines: number
  avgBeamIntensity: number
  avgSweepRange: number
  avgReachDistance: number
  avgFresnelQuality: number
  avgFogPenetration: number
  avgBeaconReliability: number
  brilliantCount: number
  adequateCount: number
  dimCount: number
  darkCount: number
  extinguishedCount: number
  totalDeadZones: number
  totalCoverageGaps: number
  hasEntryPoint: number
  hasNavigationAids: number
  hasWarningSignals: number
  hasExamples: number
  fresnelLenses: number
  noLenses: number
  navigableInFog: number
  isMaintained: number
  overallVisibility: number
  keeperGrade: KeeperGrade
  brightestBeacon: string
  darkestBeacon: string
  bestPenetration: string
  mostReliable: string
}

export interface LighthouseBeamResult {
  beacons: BeaconSignal[]
  coastlines: CoastLine[]
  coastguard: CoastguardInfo
  stats: LighthouseBeamStats
  recommendations: string[]
}

// ─── Content Primitives ──────────────────────────────────────────────────────

/**
 * Count lines of code
 * @example
 * countLoc('const x = 1\nconst y = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count exports
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function a() {}') // 1
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) ?? []).length
}

/**
 * Count error handling
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)/g) ?? []).length
}

/**
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
}

/**
 * Count max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let max = 0
  let cur = 0
  for (const ch of content) {
    if (ch === '{') { cur++; if (cur > max) max = cur }
    else if (ch === '}') { cur = Math.max(0, cur - 1) }
  }
  return max
}

/**
 * Count console statements
 * @example
 * countConsole('console.log("x")') // 1
 */
export function countConsole(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count comments
 * @example
 * countComments('// hello') // 1
 */
export function countComments(content: string): number {
  return (content.match(/\/\//g) ?? []).length + (content.match(/\/\*/g) ?? []).length
}

/**
 * Count TODO markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify beacon condition from quality score
 * @example
 * classifyBeaconCondition(90) // 'brilliant'
 */
export function classifyBeaconCondition(qualityScore: number): BeaconCondition {
  if (qualityScore >= 85) return 'brilliant'
  if (qualityScore >= 70) return 'bright'
  if (qualityScore >= 50) return 'adequate'
  if (qualityScore >= 30) return 'dim'
  if (qualityScore >= 10) return 'dark'
  return 'extinguished'
}

/**
 * Classify coastline condition from safety score
 * @example
 * classifyCoastlineCondition(85) // 'well-lit-coast'
 */
export function classifyCoastlineCondition(safety: number): CoastlineCondition {
  if (safety >= 80) return 'well-lit-coast'
  if (safety >= 60) return 'navigable'
  if (safety >= 40) return 'partial-coverage'
  if (safety >= 20) return 'dark-stretch'
  if (safety >= 10) return 'blackout'
  return 'shipwreck-coast'
}

/**
 * Classify keeper grade from average visibility
 * @example
 * classifyKeeperGrade(85) // 'head-keeper'
 */
export function classifyKeeperGrade(avgVisibility: number): KeeperGrade {
  if (avgVisibility >= 80) return 'head-keeper'
  if (avgVisibility >= 65) return 'lighthouse-keeper'
  if (avgVisibility >= 45) return 'watchman'
  if (avgVisibility >= 30) return 'sailor'
  if (avgVisibility >= 15) return 'castaway'
  return 'lost-at-sea'
}

/**
 * Classify lens type from code quality
 * @example
 * classifyLensType(80, 70) // 'fresnel'
 */
export function classifyLensType(quality: number, focusClarity: number): LensType {
  if (quality >= 70 && focusClarity >= 60) return 'fresnel'
  if (quality >= 55 && focusClarity >= 50) return 'bullseye'
  if (quality >= 40) return 'prismatic'
  if (quality >= 25) return 'reflective'
  if (quality >= 10) return 'simple'
  return 'none'
}

/**
 * Classify beam color from intensity
 * @example
 * classifyBeamColor(85) // 'white'
 */
export function classifyBeamColor(intensity: number): BeamColor {
  if (intensity >= 80) return 'white'
  if (intensity >= 60) return 'green'
  if (intensity >= 40) return 'amber'
  if (intensity >= 20) return 'blue'
  if (intensity >= 10) return 'red'
  if (intensity > 0) return 'dim'
  return 'off'
}

/**
 * Classify beam pattern from export/complexity ratio
 * @example
 * classifyBeamPattern(5, 3) // 'quick-flash'
 */
export function classifyBeamPattern(exports: number, functions: number): BeamPattern {
  if (exports > 5 && functions > 3) return 'quick-flash'
  if (exports > 3) return 'flashing'
  if (exports > 1 && functions > 1) return 'isophase'
  if (exports > 1) return 'occulting'
  if (exports > 0) return 'fixed'
  if (functions > 0) return 'morse'
  return 'fixed'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure beam intensity (documentation clarity)
 * @example
 * measureBeamIntensity('export function a() {}') // number
 */
export function measureBeamIntensity(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)

  return Math.min(100, Math.round(
    (comments > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (countFunctions(content) > 0 ? 10 : 0) +
    (loc > 0 ? 10 : 0),
  ))
}

/**
 * Measure fog penetration (clarity through complexity)
 * @example
 * measureFogPenetration('if (a) { return 1 }') // number
 */
export function measureFogPenetration(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const nest = maxNesting(content)
  const branches = countBranches(content)

  const fogDensity = Math.min(100, Math.round(
    nest * 8 +
    branches * 5 +
    (loc > 50 ? 15 : 0),
  ))

  const hornVolume = Math.min(100, Math.round(
    (comments > 0 ? 35 : 0) +
    (types > 0 ? 30 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 15 : 0),
  ))

  const penetrationDepth = Math.min(100, Math.max(0, Math.round(
    hornVolume - (fogDensity * 0.3),
  )))

  return penetrationDepth
}

/**
 * Assess guidance features
 * @example
 * assessGuidance('export function a(): number { return 1 }') // GuidanceInfo
 */
export function assessGuidance(content: string): GuidanceInfo {
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)
  const hasDeprecated = /\bdeprecated\b|\b@deprecated\b/i.test(content)
  const hasInternal = /\binternal\b|\b@internal\b/i.test(content)
  const exampleCount = (content.match(/@example/g) ?? []).length
  const navAids = types + (comments > 0 ? 1 : 0) + (exports > 0 ? 1 : 0)
  const warningCount = (hasDeprecated ? 1 : 0) + (errors > 0 ? 1 : 0)

  return {
    hasEntryPoint: exports > 0,
    hasNavigationAids: types > 0 || comments > 0,
    hasWarningSignals: hasDeprecated || errors > 0,
    hasLandingInstructions: exampleCount > 0 || comments > 0,
    hasKeepOutSignals: hasInternal,
    navigationAidCount: navAids,
    warningCount,
    exampleCount,
  }
}

/**
 * Measure visibility from different angles
 * @example
 * measureVisibility('export function a() {}') // VisibilityInfo
 */
export function measureVisibility(content: string): VisibilityInfo {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const errors = countErrorHandling(content)
  const funcs = countFunctions(content)

  const fromShore = Math.min(100, Math.round(
    (exports > 0 ? 35 : 0) +
    (types > 0 ? 25 : 0) +
    (comments > 0 ? 20 : 0) +
    (errors > 0 ? 10 : 0) +
    (loc > 0 ? 10 : 0),
  ))

  const fromSea = Math.min(100, Math.round(
    (funcs > 0 ? 25 : 0) +
    (comments > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (countImports(content) > 0 ? 10 : 0) +
    (loc > 0 ? 10 : 0),
  ))

  const inDarkness = Math.min(100, Math.round(
    (comments > 0 ? 30 : 0) +
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (loc > 0 ? 10 : 0) +
    (errors > 0 ? 10 : 0),
  ))

  const inStorm = Math.min(100, Math.round(
    (errors > 0 ? 30 : 0) +
    (types > 0 ? 20 : 0) +
    (comments > 0 ? 20 : 0) +
    (maxNesting(content) <= 3 ? 15 : maxNesting(content) <= 5 ? 8 : 0) +
    (countBranches(content) <= 5 ? 15 : countBranches(content) <= 10 ? 8 : 0),
  ))

  const avgVisibility = Math.round((fromShore + fromSea + inDarkness + inStorm) / 4)

  return { fromShore, fromSea, inDarkness, inStorm, avgVisibility }
}

/**
 * Detect dead zones (undocumented areas)
 * @example
 * detectDeadZones('const a = 1\nconst b = 2') // number
 */
export function detectDeadZones(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  let count = 0
  if (countComments(content) === 0 && loc > 10) count++
  if (countTypeAnnotations(content) === 0 && countFunctions(content) > 0) count++
  if (countExports(content) === 0 && loc > 20) count++
  if (countErrorHandling(content) === 0 && countBranches(content) > 3) count++
  return count
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a beacon signal
 * @example
 * analyzeBeaconSignal('export function calc() { return 1 }', 'calc.ts') // BeaconSignal
 */
export function analyzeBeaconSignal(content: string, filePath: string): BeaconSignal {
  const beamIntensity = measureBeamIntensity(content)
  const fogPenetration = measureFogPenetration(content)
  const visibility = measureVisibility(content)
  const guidance = assessGuidance(content)

  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const errors = countErrorHandling(content)

  const sweepRange = Math.min(100, Math.round(
    (exports > 0 ? 30 : 0) +
    (types > 0 ? 20 : 0) +
    (funcs > 0 ? 15 : 0) +
    (comments > 0 ? 15 : 0) +
    (errors > 0 ? 10 : 0) +
    (imports > 0 ? 10 : 0),
  ))

  const reachDistance = Math.min(100, Math.round(
    (exports * 8) +
    (imports * 4) +
    (guidance.hasLandingInstructions ? 15 : 0) +
    (types > 0 ? 10 : 0),
  ))

  const focusClarity = Math.min(100, Math.round(
    (types > 0 ? 25 : 0) +
    (comments > 0 ? 25 : 0) +
    (exports > 0 ? 20 : 0) +
    (maxNesting(content) <= 3 ? 15 : maxNesting(content) <= 5 ? 8 : 0) +
    (countBranches(content) <= 5 ? 15 : countBranches(content) <= 10 ? 8 : 0),
  ))

  const loc = countLoc(content)
  const lensQuality = Math.min(100, Math.round(
    (comments > 0 ? 30 : 0) +
    (types > 0 ? 25 : 0) +
    (exports > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (loc > 0 ? 10 : 0),
  ))

  const fresnelQuality = Math.round((lensQuality + focusClarity) / 2)

  const beaconReliability = Math.min(100, Math.round(
    (beamIntensity > 0 ? 20 : 0) +
    (fogPenetration > 30 ? 20 : 0) +
    (visibility.avgVisibility > 40 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (countTodos(content) === 0 ? 15 : countTodos(content) <= 2 ? 8 : 0) +
    (loc > 0 ? 10 : 0),
  ))

  const deadZoneCount = detectDeadZones(content)

  const beam: BeamInfo = {
    isOn: comments > 0 || exports > 0 || types > 0,
    intensity: beamIntensity,
    color: classifyBeamColor(beamIntensity),
    pattern: classifyBeamPattern(exports, funcs),
    rotationSpeed: Math.min(100, Math.round((exports + funcs) * 5)),
    hasDeadZones: deadZoneCount > 0,
    deadZoneCount,
  }

  const lens: LensInfo = {
    type: classifyLensType(lensQuality, focusClarity),
    quality: lensQuality,
    focusClarity,
    hasCracks: comments === 0 && loc > 10,
    hasCloudiness: types === 0 && exports > 0,
    crackCount: (comments === 0 && loc > 10 ? 1 : 0) + (types === 0 && loc > 5 ? 1 : 0),
  }

  const fogDensity = Math.min(100, Math.round(
    maxNesting(content) * 8 +
    countBranches(content) * 5 +
    (loc > 50 ? 15 : 0),
  ))

  const fog: FogInfo = {
    hasHorn: comments > 0,
    hornVolume: Math.min(100, Math.round(
      (comments > 0 ? 35 : 0) +
      (types > 0 ? 30 : 0) +
      (errors > 0 ? 20 : 0) +
      (exports > 0 ? 15 : 0),
    )),
    fogDensity,
    penetrationDepth: fogPenetration,
    isNavigableInFog: fogPenetration >= 40,
  }

  const keeper: KeeperInfo = {
    isMaintained: countTodos(content) <= 2,
    maintenanceQuality: Math.min(100, Math.round(
      (countTodos(content) === 0 ? 30 : countTodos(content) <= 2 ? 15 : 0) +
      (comments > 0 ? 25 : 0) +
      (errors > 0 ? 20 : 0) +
      (types > 0 ? 15 : 0) +
      (loc > 0 ? 10 : 0),
    )),
    isAutomated: types > 0 && errors > 0,
    hasKeeper: comments > 0,
    lastMaintenance: countTodos(content) === 0 ? 'fresh' : countTodos(content) <= 2 ? 'recent' : 'stale',
  }

  const tower: TowerInfo = {
    height: Math.min(100, Math.round(
      funcs * 6 + exports * 8 + maxNesting(content) * 5,
    )),
    isStable: errors > 0 && countTodos(content) <= 2,
    hasFoundation: errors > 0,
    foundationDepth: Math.min(100, Math.round(
      errors * 10 + (countBranches(content) <= 5 ? 20 : 0) + (types > 0 ? 15 : 0),
    )),
  }

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    beamIntensity * 0.2 +
    fogPenetration * 0.15 +
    visibility.avgVisibility * 0.2 +
    beaconReliability * 0.15 +
    fresnelQuality * 0.1 +
    (beam.isOn ? 10 : 0) +
    (fog.isNavigableInFog ? 5 : 0) +
    (tower.isStable ? 5 : 0),
  )))

  const condition = classifyBeaconCondition(qualityScore)

  return {
    file: filePath, beamIntensity, sweepRange, reachDistance,
    fresnelQuality, fogPenetration, beaconReliability,
    beam, lens, fog, guidance, visibility, keeper, tower,
    condition, qualityScore,
  }
}

// ─── Coastline Analysis ──────────────────────────────────────────────────────

/**
 * Analyze a directory as a coastline
 * @example
 * analyzeCoastLine(beacons, 'src') // CoastLine
 */
export function analyzeCoastLine(beacons: BeaconSignal[], dirPath: string): CoastLine {
  if (beacons.length === 0) {
    return {
      directory: dirPath, beacons: [], avgBeamIntensity: 0,
      avgFogPenetration: 0, avgBeaconReliability: 0,
      brilliantCount: 0, extinguishedCount: 0,
      hasCoverage: true, coverageGaps: 0, deadZones: 0,
      coastlineSafety: 100, condition: 'well-lit-coast',
    }
  }

  const n = beacons.length
  const avgBeamIntensity = Math.round(beacons.reduce((s, b) => s + b.beamIntensity, 0) / n)
  const avgFogPenetration = Math.round(beacons.reduce((s, b) => s + b.fogPenetration, 0) / n)
  const avgBeaconReliability = Math.round(beacons.reduce((s, b) => s + b.beaconReliability, 0) / n)
  const brilliantCount = beacons.filter(b => b.condition === 'brilliant' || b.condition === 'bright').length
  const extinguishedCount = beacons.filter(b => b.condition === 'extinguished' || b.condition === 'dark').length
  const coverageGaps = beacons.filter(b => !b.beam.isOn).length
  const deadZones = beacons.reduce((s, b) => s + b.beam.deadZoneCount, 0)

  const coastlineSafety = Math.min(100, Math.max(0, Math.round(
    avgBeamIntensity * 0.3 +
    avgFogPenetration * 0.2 +
    avgBeaconReliability * 0.2 +
    (coverageGaps === 0 ? 15 : 0) +
    (brilliantCount > extinguishedCount ? 15 : 0),
  )))

  const condition = classifyCoastlineCondition(coastlineSafety)

  return {
    directory: dirPath, beacons, avgBeamIntensity, avgFogPenetration,
    avgBeaconReliability, brilliantCount, extinguishedCount,
    hasCoverage: coverageGaps === 0, coverageGaps, deadZones,
    coastlineSafety, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate lighthouse beam recommendations
 * @example
 * generateRecommendations(beacons, coasts, cg, stats) // string[]
 */
export function generateRecommendations(
  _beacons: BeaconSignal[],
  _coastlines: CoastLine[],
  _coastguard: CoastguardInfo,
  stats: LighthouseBeamStats,
): string[] {
  void _beacons
  void _coastlines
  void _coastguard
  const recs: string[] = []

  if (stats.extinguishedCount > 0) {
    recs.push(`Extinguished beacons: ${stats.extinguishedCount} files have no visibility or guidance`)
  }
  if (stats.totalDeadZones > 0) {
    recs.push(`Dead zones: ${stats.totalDeadZones} areas lack documentation in complex code`)
  }
  if (stats.totalCoverageGaps > 0) {
    recs.push(`Coverage gaps: ${stats.totalCoverageGaps} files have no beam (no docs, exports, or types)`)
  }
  if (stats.noLenses > 0) {
    recs.push(`No lenses: ${stats.noLenses} files have no documentation focus`)
  }
  if (stats.overallVisibility >= 60) {
    recs.push('Good visibility: the codebase provides adequate guidance for navigation')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete lighthouse beam result from files and contents
 * @example
 * buildLighthouseBeamResult(['a.ts'], ['export function a() {}'], {}) // LighthouseBeamResult
 */
export function buildLighthouseBeamResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): LighthouseBeamResult {
  void options

  const beacons: BeaconSignal[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeBeaconSignal(content, file)
    } catch {
      return analyzeBeaconSignal('', file)
    }
  })

  const dirMap = new Map<string, BeaconSignal[]>()
  for (const b of beacons) {
    const dir = b.file.includes('/') ? b.file.slice(0, b.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(b) } else { dirMap.set(dir, [b]) }
  }

  const coastlines: CoastLine[] = Array.from(dirMap.entries()).map(([dir, bs]) =>
    analyzeCoastLine(bs, dir),
  )

  const n = beacons.length || 1
  const avgBeamIntensity = Math.round(beacons.reduce((s, b) => s + b.beamIntensity, 0) / n)
  const avgFogPenetration = Math.round(beacons.reduce((s, b) => s + b.fogPenetration, 0) / n)
  const overallVisibility = Math.round(beacons.reduce((s, b) => s + b.visibility.avgVisibility, 0) / n)
  const totalDeadZones = beacons.reduce((s, b) => s + b.beam.deadZoneCount, 0)
  const totalCoverageGaps = beacons.filter(b => !b.beam.isOn).length

  const coastguard: CoastguardInfo = {
    avgBeamIntensity,
    avgFogPenetration,
    coverageGaps: totalCoverageGaps,
    deadZones: totalDeadZones,
    isSafeToNavigate: avgBeamIntensity >= 40,
    overallVisibility,
  }

  const stats: LighthouseBeamStats = {
    totalFiles: files.length,
    totalCoastlines: coastlines.length,
    avgBeamIntensity,
    avgSweepRange: Math.round(beacons.reduce((s, b) => s + b.sweepRange, 0) / n),
    avgReachDistance: Math.round(beacons.reduce((s, b) => s + b.reachDistance, 0) / n),
    avgFresnelQuality: Math.round(beacons.reduce((s, b) => s + b.fresnelQuality, 0) / n),
    avgFogPenetration,
    avgBeaconReliability: Math.round(beacons.reduce((s, b) => s + b.beaconReliability, 0) / n),
    brilliantCount: beacons.filter(b => b.condition === 'brilliant' || b.condition === 'bright').length,
    adequateCount: beacons.filter(b => b.condition === 'adequate').length,
    dimCount: beacons.filter(b => b.condition === 'dim').length,
    darkCount: beacons.filter(b => b.condition === 'dark').length,
    extinguishedCount: beacons.filter(b => b.condition === 'extinguished').length,
    totalDeadZones,
    totalCoverageGaps,
    hasEntryPoint: beacons.filter(b => b.guidance.hasEntryPoint).length,
    hasNavigationAids: beacons.filter(b => b.guidance.hasNavigationAids).length,
    hasWarningSignals: beacons.filter(b => b.guidance.hasWarningSignals).length,
    hasExamples: beacons.filter(b => b.guidance.hasLandingInstructions).length,
    fresnelLenses: beacons.filter(b => b.lens.type === 'fresnel' || b.lens.type === 'bullseye').length,
    noLenses: beacons.filter(b => b.lens.type === 'none').length,
    navigableInFog: beacons.filter(b => b.fog.isNavigableInFog).length,
    isMaintained: beacons.filter(b => b.keeper.isMaintained).length,
    overallVisibility,
    keeperGrade: classifyKeeperGrade(overallVisibility),
    brightestBeacon: beacons.length > 0
      ? beacons.reduce((a, b) => b.beamIntensity > a.beamIntensity ? b : a, beacons[0] as typeof beacons[number]).file : 'none',
    darkestBeacon: beacons.length > 0
      ? beacons.reduce((a, b) => b.beamIntensity < a.beamIntensity ? b : a, beacons[0] as typeof beacons[number]).file : 'none',
    bestPenetration: beacons.length > 0
      ? beacons.reduce((a, b) => b.fogPenetration > a.fogPenetration ? b : a, beacons[0] as typeof beacons[number]).file : 'none',
    mostReliable: beacons.length > 0
      ? beacons.reduce((a, b) => b.beaconReliability > a.beaconReliability ? b : a, beacons[0] as typeof beacons[number]).file : 'none',
  }

  const recommendations = generateRecommendations(beacons, coastlines, coastguard, stats)

  return { beacons, coastlines, coastguard, stats, recommendations }
}
