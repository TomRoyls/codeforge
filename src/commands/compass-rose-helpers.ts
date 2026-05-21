// ─── Interfaces ──────────────────────────────────────────────────────────────

export type CardinalDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
export type CompassCondition = 'true-north' | 'well-oriented' | 'slightly-off' | 'disoriented' | 'lost' | 'spinning'
export type RegionType = 'north-star' | 'constellation' | 'trade-winds' | 'doldrums' | 'maelstrom' | 'bermuda-triangle'
export type RegionCondition = 'perfectly-aligned' | 'well-aligned' | 'mostly-aligned' | 'scattered' | 'disoriented' | 'chaotic'
export type Polarity = 'attractive' | 'repulsive' | 'neutral'
export type NavigatorGrade = 'master-navigator' | 'navigator' | 'pilot' | 'deckhand' | 'castaway' | 'shipwrecked'

export interface CardinalInfo {
  north: number
  south: number
  east: number
  west: number
  isCardinallyAligned: boolean
  dominantCardinal: string
}

export interface IntercardinalInfo {
  northeast: number
  southeast: number
  southwest: number
  northwest: number
}

export interface BearingInfo {
  trueNorth: number
  magneticNorth: number
  deviation: number
  isCalibrated: boolean
  needsRecalibration: boolean
}

export interface OrientationInfo {
  isUpright: boolean
  isInverted: boolean
  isTilted: boolean
  isSpinning: boolean
  tiltAngle: number
}

export interface MagneticField {
  range: number
  isStrong: boolean
  isWeak: boolean
  hasInterference: boolean
}

export interface MagnetismInfo {
  strength: number
  polarity: Polarity
  field: MagneticField
}

export interface NavigationInfo {
  hasChart: boolean
  hasWaypoints: boolean
  hasLandmarks: boolean
  hasHazards: boolean
  hazardCount: number
  isNavigable: boolean
}

export interface CompassPoint {
  file: string
  heading: number
  cardinalDirection: CardinalDirection
  magneticNorth: number
  declination: number
  orientationStability: number
  cardinal: CardinalInfo
  intercardinal: IntercardinalInfo
  bearing: BearingInfo
  orientation: OrientationInfo
  magnetism: MagnetismInfo
  navigation: NavigationInfo
  condition: CompassCondition
  qualityScore: number
}

export interface CompassRegion {
  directory: string
  points: CompassPoint[]
  avgMagneticNorth: number
  avgDeclination: number
  avgStability: number
  trueNorthCount: number
  lostCount: number
  spinningCount: number
  dominantDirection: string
  regionAlignment: number
  regionType: RegionType
  condition: RegionCondition
}

export interface HemisphereInfo {
  avgMagneticNorth: number
  avgDeclination: number
  avgStability: number
  isAligned: boolean
  overallOrientation: number
}

export interface CompassRoseStats {
  totalFiles: number
  totalRegions: number
  avgHeading: number
  avgMagneticNorth: number
  avgDeclination: number
  avgStability: number
  trueNorthCount: number
  wellOrientedCount: number
  disorientedCount: number
  lostCount: number
  spinningCount: number
  northDominant: number
  southDominant: number
  eastDominant: number
  westDominant: number
  attractiveCount: number
  repulsiveCount: number
  calibratedCount: number
  needsRecalibrationCount: number
  navigableCount: number
  overallOrientation: number
  navigatorGrade: NavigatorGrade
  bestOriented: string
  mostDisoriented: string
  strongestMagnetism: string
  mostCalibrated: string
}

export interface CompassRoseResult {
  points: CompassPoint[]
  regions: CompassRegion[]
  hemisphere: HemisphereInfo
  stats: CompassRoseStats
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
 * Count error handling constructs
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
  let m = 0
  let c = 0
  for (const ch of content) {
    if (ch === '{') { c++; if (c > m) m = c }
    else if (ch === '}') { c = Math.max(0, c - 1) }
  }
  return m
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
 * Classify compass condition from quality score
 * @example
 * classifyCompassCondition(90) // 'true-north'
 */
export function classifyCompassCondition(qualityScore: number): CompassCondition {
  if (qualityScore >= 85) return 'true-north'
  if (qualityScore >= 70) return 'well-oriented'
  if (qualityScore >= 50) return 'slightly-off'
  if (qualityScore >= 30) return 'disoriented'
  if (qualityScore >= 10) return 'lost'
  return 'spinning'
}

/**
 * Classify region type from compass points
 * @example
 * classifyRegionType([]) // 'doldrums'
 */
export function classifyRegionType(points: CompassPoint[]): RegionType {
  if (points.length === 0) return 'doldrums'
  const conditions = points.map(p => p.condition)
  const trueNorth = conditions.filter(c => c === 'true-north').length
  const wellOriented = conditions.filter(c => c === 'well-oriented').length
  const lost = conditions.filter(c => c === 'lost').length
  const spinning = conditions.filter(c => c === 'spinning').length
  const n = points.length

  if (spinning > n / 2) return 'bermuda-triangle'
  if (lost > n / 2) return 'maelstrom'
  if (trueNorth === n) return 'north-star'
  if (trueNorth + wellOriented > n * 0.6) return 'constellation'
  if (trueNorth + wellOriented > n * 0.3) return 'trade-winds'
  return 'doldrums'
}

/**
 * Classify region condition from alignment
 * @example
 * classifyRegionCondition(85) // 'perfectly-aligned'
 */
export function classifyRegionCondition(alignment: number): RegionCondition {
  if (alignment >= 85) return 'perfectly-aligned'
  if (alignment >= 65) return 'well-aligned'
  if (alignment >= 45) return 'mostly-aligned'
  if (alignment >= 25) return 'scattered'
  if (alignment >= 10) return 'disoriented'
  return 'chaotic'
}

/**
 * Classify navigator grade from average orientation
 * @example
 * classifyNavigatorGrade(85) // 'master-navigator'
 */
export function classifyNavigatorGrade(avgOrientation: number): NavigatorGrade {
  if (avgOrientation >= 80) return 'master-navigator'
  if (avgOrientation >= 65) return 'navigator'
  if (avgOrientation >= 45) return 'pilot'
  if (avgOrientation >= 30) return 'deckhand'
  if (avgOrientation >= 15) return 'castaway'
  return 'shipwrecked'
}

/**
 * Classify cardinal direction from heading
 * @example
 * classifyCardinalDirection(0) // 'N'
 */
export function classifyCardinalDirection(heading: number): CardinalDirection {
  const h = ((heading % 360) + 360) % 360
  if (h < 22.5 || h >= 337.5) return 'N'
  if (h < 67.5) return 'NE'
  if (h < 112.5) return 'E'
  if (h < 157.5) return 'SE'
  if (h < 202.5) return 'S'
  if (h < 247.5) return 'SW'
  if (h < 292.5) return 'W'
  return 'NW'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure cardinal directions (N/S/E/W dependency strengths)
 * @example
 * measureCardinal('import { x } from "y"\nexport function a() {}') // CardinalInfo
 */
export function measureCardinal(content: string): CardinalInfo {
  const imports = countImports(content)
  const exports = countExports(content)
  const funcs = countFunctions(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)

  const north = Math.min(100, Math.round(
    (types > 0 ? 30 : 0) +
    (errors > 0 ? 25 : 0) +
    (countComments(content) > 0 ? 20 : 0) +
    (funcs > 0 ? 15 : 0) +
    (countLoc(content) > 0 ? 10 : 0),
  ))

  const south = Math.min(100, Math.round(
    (funcs > 0 ? 30 : 0) +
    (countBranches(content) > 0 ? 25 : 0) +
    (maxNesting(content) > 0 ? 20 : 0) +
    (countConsole(content) > 0 ? 15 : 0) +
    (countLoc(content) > 20 ? 10 : 0),
  ))

  const east = Math.min(100, Math.round(
    exports * 15 +
    (types > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0),
  ))

  const west = Math.min(100, Math.round(
    imports * 15 +
    (errors > 0 ? 15 : 0) +
    (countLoc(content) > 10 ? 10 : 0),
  ))

  const maxVal = Math.max(north, south, east, west)
  const dominantCardinal = maxVal === north ? 'N' : maxVal === east ? 'E' : maxVal === west ? 'W' : 'S'
  const isCardinallyAligned = maxVal > 0 && (maxVal - Math.min(north, south, east, west)) < 50

  return { north, south, east, west, isCardinallyAligned, dominantCardinal }
}

/**
 * Measure bearing (true vs magnetic north)
 * @example
 * measureBearing('export function a(): number { return 1 }') // BearingInfo
 */
export function measureBearing(content: string): BearingInfo {
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)
  const todos = countTodos(content)

  const trueNorth = Math.min(100, Math.round(
    (types > 0 ? 30 : 0) +
    (comments > 0 ? 25 : 0) +
    (errors > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (countLoc(content) > 0 ? 10 : 0),
  ))

  const magneticNorth = Math.min(100, Math.max(0, Math.round(
    trueNorth -
    (todos > 0 ? todos * 8 : 0) -
    (countConsole(content) > 3 ? 10 : 0),
  )))

  const deviation = Math.abs(trueNorth - magneticNorth)
  const isCalibrated = deviation <= 10 && trueNorth >= 50
  const needsRecalibration = deviation > 20 || trueNorth < 30

  return { trueNorth, magneticNorth, deviation, isCalibrated, needsRecalibration }
}

/**
 * Measure magnetism (influence and polarity)
 * @example
 * measureMagnetism('export function a() {}') // MagnetismInfo
 */
export function measureMagnetism(content: string): MagnetismInfo {
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const types = countTypeAnnotations(content)

  const strength = Math.min(100, Math.round(
    exports * 12 +
    funcs * 8 +
    types * 5 +
    (countComments(content) > 0 ? 10 : 0),
  ))

  const polarity: Polarity = exports > imports + 2 ? 'attractive'
    : imports > exports + 2 ? 'repulsive'
    : 'neutral'

  const range = Math.min(100, Math.round(
    (exports + imports) * 8 +
    (funcs > 0 ? 15 : 0) +
    (types > 0 ? 10 : 0),
  ))

  const isStrong = strength >= 60
  const isWeak = strength < 25
  const hasInterference = exports > 0 && imports > 0 && countErrorHandling(content) === 0

  return {
    strength,
    polarity,
    field: { range, isStrong, isWeak, hasInterference },
  }
}

/**
 * Measure orientation (upright, inverted, tilted, spinning)
 * @example
 * measureOrientation('export function a(): number { return 1 }') // OrientationInfo
 */
export function measureOrientation(content: string): OrientationInfo {
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)
  const nest = maxNesting(content)

  const isUpright = exports > 0 && types > 0 && errors > 0
  const isInverted = imports > 3 && exports === 0 && funcs === 0
  const isSpinning = branches > 5 && funcs === 0

  const balanceScore = Math.abs(exports - imports) + Math.abs(funcs - types)
  const isTilted = !isUpright && !isInverted && balanceScore > 5

  const tiltAngle = Math.min(90, Math.round(
    Math.abs(exports - imports) * 3 +
    (nest > 3 ? nest * 5 : 0) +
    (branches > 5 ? 15 : 0),
  ))

  return { isUpright, isInverted, isTilted, isSpinning, tiltAngle }
}

/**
 * Measure navigation features
 * @example
 * measureNavigation('export function a(): number { return 1 }') // NavigationInfo
 */
export function measureNavigation(content: string): NavigationInfo {
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const funcs = countFunctions(content)
  const errors = countErrorHandling(content)
  const todos = countTodos(content)
  const branches = countBranches(content)

  const hasChart = comments > 0 || types > 0
  const hasWaypoints = funcs > 1 || exports > 1
  const hasLandmarks = exports > 0 && types > 0

  const hazardCount = todos +
    (errors === 0 && branches > 3 ? 1 : 0) +
    (maxNesting(content) > 4 ? 1 : 0)

  const hasHazards = hazardCount > 0
  const isNavigable = hasChart && (hasWaypoints || hasLandmarks)

  return { hasChart, hasWaypoints, hasLandmarks, hasHazards, hazardCount, isNavigable }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a compass point
 * @example
 * analyzeCompassPoint('export function calc(): number { return 1 }', 'calc.ts') // CompassPoint
 */
export function analyzeCompassPoint(content: string, filePath: string): CompassPoint {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      heading: 0,
      cardinalDirection: 'N',
      magneticNorth: 0,
      declination: 100,
      orientationStability: 0,
      cardinal: { north: 0, south: 0, east: 0, west: 0, isCardinallyAligned: false, dominantCardinal: 'N' },
      intercardinal: { northeast: 0, southeast: 0, southwest: 0, northwest: 0 },
      bearing: { trueNorth: 0, magneticNorth: 0, deviation: 0, isCalibrated: false, needsRecalibration: true },
      orientation: { isUpright: false, isInverted: false, isTilted: false, isSpinning: false, tiltAngle: 0 },
      magnetism: { strength: 0, polarity: 'neutral', field: { range: 0, isStrong: false, isWeak: true, hasInterference: false } },
      navigation: { hasChart: false, hasWaypoints: false, hasLandmarks: false, hasHazards: false, hazardCount: 0, isNavigable: false },
      condition: 'spinning',
      qualityScore: 0,
    }
  }

  const cardinal = measureCardinal(content)
  const bearing = measureBearing(content)
  const magnetism = measureMagnetism(content)
  const orientation = measureOrientation(content)
  const navigation = measureNavigation(content)

  const total = cardinal.north + cardinal.east + cardinal.south + cardinal.west
  const heading = total > 0
    ? Math.round(
        (cardinal.north * 0 + cardinal.east * 90 + cardinal.south * 180 + cardinal.west * 270) / total,
      ) % 360
    : 0

  const cardinalDirection = classifyCardinalDirection(heading)

  const intercardinal: IntercardinalInfo = {
    northeast: Math.round((cardinal.north + cardinal.east) / 2),
    southeast: Math.round((cardinal.south + cardinal.east) / 2),
    southwest: Math.round((cardinal.south + cardinal.west) / 2),
    northwest: Math.round((cardinal.north + cardinal.west) / 2),
  }

  const magneticNorth = bearing.magneticNorth
  const declination = Math.min(100, Math.max(0, 100 - magneticNorth))

  const orientationStability = Math.min(100, Math.max(0, Math.round(
    (orientation.isUpright ? 40 : 0) +
    (!orientation.isSpinning ? 20 : 0) +
    (orientation.tiltAngle <= 15 ? 20 : orientation.tiltAngle <= 30 ? 10 : 0) +
    (cardinal.isCardinallyAligned ? 20 : 10),
  )))

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    magneticNorth * 0.25 +
    orientationStability * 0.2 +
    (100 - declination) * 0.15 +
    magnetism.strength * 0.1 +
    (bearing.isCalibrated ? 10 : 0) +
    (navigation.isNavigable ? 10 : 0) +
    (orientation.isUpright ? 5 : 0) +
    (cardinal.isCardinallyAligned ? 5 : 0),
  )))

  const condition = classifyCompassCondition(qualityScore)

  return {
    file: filePath,
    heading,
    cardinalDirection,
    magneticNorth,
    declination,
    orientationStability,
    cardinal,
    intercardinal,
    bearing,
    orientation,
    magnetism,
    navigation,
    condition,
    qualityScore,
  }
}

// ─── Region Analysis ─────────────────────────────────────────────────────────

/**
 * Analyze a directory as a compass region
 * @example
 * analyzeCompassRegion(points, 'src') // CompassRegion
 */
export function analyzeCompassRegion(points: CompassPoint[], dirPath: string): CompassRegion {
  if (points.length === 0) {
    return {
      directory: dirPath, points: [],
      avgMagneticNorth: 0, avgDeclination: 0, avgStability: 0,
      trueNorthCount: 0, lostCount: 0, spinningCount: 0,
      dominantDirection: 'N',
      regionAlignment: 100,
      regionType: 'doldrums',
      condition: 'perfectly-aligned',
    }
  }

  const n = points.length
  const avgMagneticNorth = Math.round(points.reduce((s, p) => s + p.magneticNorth, 0) / n)
  const avgDeclination = Math.round(points.reduce((s, p) => s + p.declination, 0) / n)
  const avgStability = Math.round(points.reduce((s, p) => s + p.orientationStability, 0) / n)
  const trueNorthCount = points.filter(p => p.condition === 'true-north').length
  const lostCount = points.filter(p => p.condition === 'lost').length
  const spinningCount = points.filter(p => p.condition === 'spinning').length

  const dirCounts = new Map<string, number>()
  for (const p of points) {
    const d = p.cardinal.dominantCardinal
    dirCounts.set(d, (dirCounts.get(d) ?? 0) + 1)
  }
  let dominantDirection = 'N'
  let maxCount = 0
  for (const [dir, cnt] of dirCounts) {
    if (cnt > maxCount) { maxCount = cnt; dominantDirection = dir }
  }

  const regionAlignment = Math.min(100, Math.max(0, Math.round(
    avgMagneticNorth * 0.35 +
    avgStability * 0.3 +
    (trueNorthCount / n) * 100 * 0.2 +
    (lostCount === 0 && spinningCount === 0 ? 15 : 0),
  )))

  const regionType = classifyRegionType(points)
  const condition = classifyRegionCondition(regionAlignment)

  return {
    directory: dirPath, points,
    avgMagneticNorth, avgDeclination, avgStability,
    trueNorthCount, lostCount, spinningCount,
    dominantDirection, regionAlignment,
    regionType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate compass rose recommendations
 * @example
 * generateRecommendations(points, regions, hemisphere, stats) // string[]
 */
export function generateRecommendations(
  _points: CompassPoint[],
  _regions: CompassRegion[],
  _hemisphere: HemisphereInfo,
  stats: CompassRoseStats,
): string[] {
  void _points
  void _regions
  void _hemisphere
  const recs: string[] = []

  if (stats.spinningCount > 0) {
    recs.push(`Spinning modules: ${stats.spinningCount} files have no clear direction`)
  }
  if (stats.lostCount > 0) {
    recs.push(`Lost modules: ${stats.lostCount} files are disoriented`)
  }
  if (stats.needsRecalibrationCount > 0) {
    recs.push(`Recalibration needed: ${stats.needsRecalibrationCount} files deviate from true north`)
  }
  if (stats.avgDeclination > 40) {
    recs.push('High declination: significant architectural drift detected')
  }
  if (stats.overallOrientation >= 60) {
    recs.push('Good orientation: the codebase maintains consistent bearings')
  }
  if (stats.westDominant > stats.eastDominant * 2) {
    recs.push('Import-heavy: modules consume more than they produce')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete compass rose result from files and contents
 * @example
 * buildCompassRoseResult(['a.ts'], ['export function a() {}'], {}) // CompassRoseResult
 */
export function buildCompassRoseResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): CompassRoseResult {
  void options

  const points: CompassPoint[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeCompassPoint(content, file)
    } catch {
      return analyzeCompassPoint('', file)
    }
  })

  const dirMap = new Map<string, CompassPoint[]>()
  for (const p of points) {
    const dir = p.file.includes('/') ? p.file.slice(0, p.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(p) } else { dirMap.set(dir, [p]) }
  }

  const regions: CompassRegion[] = Array.from(dirMap.entries()).map(([dir, ps]) =>
    analyzeCompassRegion(ps, dir),
  )

  const n = points.length || 1
  const avgMagneticNorth = Math.round(points.reduce((s, p) => s + p.magneticNorth, 0) / n)
  const avgDeclination = Math.round(points.reduce((s, p) => s + p.declination, 0) / n)
  const avgStability = Math.round(points.reduce((s, p) => s + p.orientationStability, 0) / n)
  const overallOrientation = Math.min(100, Math.max(0, Math.round(
    avgMagneticNorth * 0.35 +
    avgStability * 0.35 +
    (points.filter(p => p.bearing.isCalibrated).length / n) * 100 * 0.15 +
    (points.filter(p => p.navigation.isNavigable).length / n) * 100 * 0.15,
  )))

  const hemisphere: HemisphereInfo = {
    avgMagneticNorth,
    avgDeclination,
    avgStability,
    isAligned: overallOrientation >= 60,
    overallOrientation,
  }

  const avgHeading = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.heading, 0) / n)
    : 0

  const stats: CompassRoseStats = {
    totalFiles: files.length,
    totalRegions: regions.length,
    avgHeading,
    avgMagneticNorth,
    avgDeclination,
    avgStability,
    trueNorthCount: points.filter(p => p.condition === 'true-north').length,
    wellOrientedCount: points.filter(p => p.condition === 'well-oriented').length,
    disorientedCount: points.filter(p => p.condition === 'disoriented').length,
    lostCount: points.filter(p => p.condition === 'lost').length,
    spinningCount: points.filter(p => p.condition === 'spinning').length,
    northDominant: points.filter(p => p.cardinal.dominantCardinal === 'N').length,
    southDominant: points.filter(p => p.cardinal.dominantCardinal === 'S').length,
    eastDominant: points.filter(p => p.cardinal.dominantCardinal === 'E').length,
    westDominant: points.filter(p => p.cardinal.dominantCardinal === 'W').length,
    attractiveCount: points.filter(p => p.magnetism.polarity === 'attractive').length,
    repulsiveCount: points.filter(p => p.magnetism.polarity === 'repulsive').length,
    calibratedCount: points.filter(p => p.bearing.isCalibrated).length,
    needsRecalibrationCount: points.filter(p => p.bearing.needsRecalibration).length,
    navigableCount: points.filter(p => p.navigation.isNavigable).length,
    overallOrientation,
    navigatorGrade: classifyNavigatorGrade(overallOrientation),
    bestOriented: points.length > 0
      ? points.reduce((a, b) => b.qualityScore > a.qualityScore ? b : a, points[0]).file : 'none',
    mostDisoriented: points.length > 0
      ? points.reduce((a, b) => b.qualityScore < a.qualityScore ? b : a, points[0]).file : 'none',
    strongestMagnetism: points.length > 0
      ? points.reduce((a, b) => b.magnetism.strength > a.magnetism.strength ? b : a, points[0]).file : 'none',
    mostCalibrated: points.length > 0
      ? points.reduce((a, b) => b.bearing.deviation < a.bearing.deviation ? b : a, points[0]).file : 'none',
  }

  const recommendations = generateRecommendations(points, regions, hemisphere, stats)

  return { points, regions, hemisphere, stats, recommendations }
}
