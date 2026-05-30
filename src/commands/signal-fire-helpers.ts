// ─── Interfaces ──────────────────────────────────────────────────────────────

export type FlameColor = 'bright-orange' | 'orange' | 'yellow' | 'red' | 'smoky' | 'ember' | 'out'
export type FlameCondition = 'blazing-beacon' | 'bright-signal' | 'steady-flame' | 'smoky' | 'dying-ember' | 'cold-ashes'
export type TowerType = 'watchtower' | 'lighthouse' | 'relay-station' | 'bonfire' | 'campfire' | 'dark-tower'
export type TowerCondition = 'fire-network' | 'well-lit' | 'patchy-coverage' | 'dim' | 'mostly-dark' | 'blackout'
export type SignalmanGrade = 'master-signalman' | 'signalman' | 'fire-keeper' | 'scout' | 'novice' | 'sleeper'

export interface FlameInfo {
  height: number
  color: FlameColor
  isSteady: boolean
  isFlickering: boolean
  isSmoky: boolean
  isDying: boolean
  isOut: boolean
  intensity: number
}

export interface SmokeInfo {
  signals: string[]
  clarity: number
  hasFalseSignals: boolean
  hasNoSignals: boolean
  hasOldSignals: boolean
  hasStrongSignals: boolean
  falseSignalCount: number
  oldSignalCount: number
  strongSignalCount: number
}

export interface FuelInfo {
  nameQuality: number
  commentQuality: number
  docQuality: number
  typeAnnotations: number
  hasSeasoned: boolean
  hasGreen: boolean
  hasWet: boolean
  hasDry: boolean
}

export interface ProtocolInfo {
  followsStyle: boolean
  followsNaming: boolean
  followsStructure: boolean
  violations: string[]
  complianceScore: number
}

export interface BeaconInfo {
  isLit: boolean
  isVisible: boolean
  isMaintained: boolean
  hasKeeper: boolean
  lastTended: string
  visibilityScore: number
}

export interface NetworkInfo {
  signalsToOthers: number
  receivesFromOthers: number
  relayCount: number
  hasDeadRelay: boolean
  isHub: boolean
  isEndpoint: boolean
  isRelay: boolean
}

export interface SignalFlame {
  file: string
  flameHeight: number
  smokeClarity: number
  signalRange: number
  fireConsistency: number
  fuelQuality: number
  protocolCompliance: number
  flame: FlameInfo
  smoke: SmokeInfo
  fuel: FuelInfo
  protocol: ProtocolInfo
  beacon: BeaconInfo
  network: NetworkInfo
  condition: FlameCondition
  qualityScore: number
}

export interface FireTower {
  directory: string
  flames: SignalFlame[]
  avgFlameHeight: number
  avgSmokeClarity: number
  avgSignalRange: number
  avgConsistency: number
  blazingCount: number
  coldCount: number
  litCount: number
  networkDensity: number
  towerType: TowerType
  condition: TowerCondition
}

export interface NetworkOverview {
  avgFlameHeight: number
  avgSmokeClarity: number
  avgSignalRange: number
  avgConsistency: number
  totalSignals: number
  isWellLit: boolean
  overallVisibility: number
}

export interface SignalFireStats {
  totalFiles: number
  totalTowers: number
  avgFlameHeight: number
  avgSmokeClarity: number
  avgSignalRange: number
  avgFireConsistency: number
  avgFuelQuality: number
  avgProtocolCompliance: number
  blazingBeaconCount: number
  brightSignalCount: number
  steadyFlameCount: number
  smokyCount: number
  dyingEmberCount: number
  coldAshesCount: number
  hasFalseSignals: number
  hasOldSignals: number
  hasStrongSignals: number
  litBeacons: number
  maintainedBeacons: number
  hubNodes: number
  endpointNodes: number
  relayNodes: number
  totalProtocolViolations: number
  overallVisibility: number
  signalmanGrade: SignalmanGrade
  brightestFlame: string
  dimmestFlame: string
  clearestSmoke: string
  mostCompliant: string
  mostDeceptive: string
}

export interface SignalFireResult {
  flames: SignalFlame[]
  towers: FireTower[]
  network: NetworkOverview
  stats: SignalFireStats
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

/**
 * Count JSDoc blocks
 * @example
 * countJSDoc('/** doc * slash /') // 1
 */
export function countJSDoc(content: string): number {
  return (content.match(/\/\*\*/g) ?? []).length
}

/**
 * Count descriptive names (camelCase longer than 3 chars)
 * @example
 * countDescriptiveNames('function calculateTotal() {}') // 1
 */
export function countDescriptiveNames(content: string): number {
  return (content.match(/\b(?:function|const|let|var)\s+[a-z]{1}[a-zA-Z]{3,}\b/g) ?? []).length
}

/**
 * Count short names (1-2 chars)
 * @example
 * countShortNames('const x = 1') // 1
 */
export function countShortNames(content: string): number {
  return (content.match(/\b(?:const|let|var)\s+[a-z]{1,2}\b/g) ?? []).length
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify flame condition from quality score
 * @example
 * classifyFlameCondition(90) // 'blazing-beacon'
 */
export function classifyFlameCondition(qualityScore: number): FlameCondition {
  if (qualityScore >= 85) return 'blazing-beacon'
  if (qualityScore >= 65) return 'bright-signal'
  if (qualityScore >= 45) return 'steady-flame'
  if (qualityScore >= 25) return 'smoky'
  if (qualityScore >= 10) return 'dying-ember'
  return 'cold-ashes'
}

/**
 * Classify flame color from intensity
 * @example
 * classifyFlameColor(90) // 'bright-orange'
 */
export function classifyFlameColor(intensity: number): FlameColor {
  if (intensity >= 80) return 'bright-orange'
  if (intensity >= 60) return 'orange'
  if (intensity >= 45) return 'yellow'
  if (intensity >= 30) return 'red'
  if (intensity >= 15) return 'smoky'
  if (intensity >= 5) return 'ember'
  return 'out'
}

/**
 * Classify tower type from flames
 * @example
 * classifyTowerType([]) // 'dark-tower'
 */
export function classifyTowerType(flames: SignalFlame[]): TowerType {
  if (flames.length === 0) return 'dark-tower'
  const n = flames.length
  const blazing = flames.filter(f => f.condition === 'blazing-beacon' || f.condition === 'bright-signal').length
  const cold = flames.filter(f => f.condition === 'cold-ashes' || f.condition === 'dying-ember').length
  const hubs = flames.filter(f => f.network.isHub).length

  if (cold > n * 0.6) return 'dark-tower'
  if (hubs > 0 && blazing > n * 0.5) return 'watchtower'
  if (blazing > n * 0.7) return 'lighthouse'
  if (flames.filter(f => f.network.isRelay).length > n * 0.5) return 'relay-station'
  if (blazing > n * 0.3) return 'bonfire'
  return 'campfire'
}

/**
 * Classify tower condition from averages
 * @example
 * classifyTowerCondition(85) // 'fire-network'
 */
export function classifyTowerCondition(avgHeight: number): TowerCondition {
  if (avgHeight >= 75) return 'fire-network'
  if (avgHeight >= 55) return 'well-lit'
  if (avgHeight >= 35) return 'patchy-coverage'
  if (avgHeight >= 20) return 'dim'
  if (avgHeight >= 8) return 'mostly-dark'
  return 'blackout'
}

/**
 * Classify signalman grade from average visibility
 * @example
 * classifySignalmanGrade(85) // 'master-signalman'
 */
export function classifySignalmanGrade(avgVisibility: number): SignalmanGrade {
  if (avgVisibility >= 80) return 'master-signalman'
  if (avgVisibility >= 65) return 'signalman'
  if (avgVisibility >= 45) return 'fire-keeper'
  if (avgVisibility >= 30) return 'scout'
  if (avgVisibility >= 15) return 'novice'
  return 'sleeper'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure flame (purpose visibility, intensity)
 * @example
 * measureFlame('export function a(): number { return 1 }') // FlameInfo
 */
export function measureFlame(content: string): FlameInfo {
  const loc = countLoc(content)
  const exports = countExports(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const todos = countTodos(content)

  const height = Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (comments > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (loc > 5 ? 10 : 0) +
    (countFunctions(content) > 0 ? 10 : 0),
  )))

  const intensity = Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 30 : 0) +
    (types > 0 ? 20 : 0) +
    (comments > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (errors > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const color = classifyFlameColor(intensity)
  const isSteady = todos === 0 && errors > 0
  const isFlickering = todos > 0 && exports > 0
  const isSmoky = comments === 0 && loc > 5
  const isDying = todos > 2
  const isOut = loc === 0

  return { height, color, isSteady, isFlickering, isSmoky, isDying, isOut, intensity }
}

/**
 * Measure smoke (signals, clarity, false/old/strong)
 * @example
 * measureSmoke('export function a(): number { return 1 }') // SmokeInfo
 */
export function measureSmoke(content: string): SmokeInfo {
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const todos = countTodos(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)

  const signals: string[] = []
  if (jsdoc > 0) signals.push('JSDoc documentation')
  if (comments > 0) signals.push('Inline comments')
  if (types > 0) signals.push('Type annotations')
  if (exports > 0) signals.push('Export declarations')

  const clarity = Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 30 : 0) +
    (types > 0 ? 25 : 0) +
    (comments > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const hasFalseSignals = todos > 0 && comments > todos * 3
  const hasNoSignals = comments === 0 && types === 0 && exports === 0
  const hasOldSignals = todos > 0
  const hasStrongSignals = jsdoc > 0 && types > 0 && exports > 0

  return {
    signals, clarity,
    hasFalseSignals, hasNoSignals, hasOldSignals, hasStrongSignals,
    falseSignalCount: hasFalseSignals ? 1 : 0,
    oldSignalCount: hasOldSignals ? 1 : 0,
    strongSignalCount: hasStrongSignals ? 1 : 0,
  }
}

/**
 * Measure fuel (name quality, comment quality, doc quality)
 * @example
 * measureFuel('export function calc(): number { return 1 }') // FuelInfo
 */
export function measureFuel(content: string): FuelInfo {
  const descriptive = countDescriptiveNames(content)
  const short = countShortNames(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)
  const loc = countLoc(content)

  const nameQuality = Math.min(100, Math.max(0, Math.round(
    (descriptive > 0 ? 40 : 0) +
    (short === 0 ? 30 : descriptive > short ? 20 : 0) +
    (countFunctions(content) > 0 ? 15 : 0) +
    (loc > 0 ? 15 : 0),
  )))

  const commentQuality = Math.min(100, Math.max(0, Math.round(
    (comments > 0 ? 40 : 0) +
    (jsdoc > 0 ? 30 : 0) +
    (comments > countTodos(content) * 2 ? 20 : 0) +
    (loc > 0 ? 10 : 0),
  )))

  const docQuality = Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 40 : 0) +
    (types > 0 ? 30 : 0) +
    (comments > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 10 : 0),
  )))

  const typeAnnotations = Math.min(100, Math.round((types / Math.max(loc, 1)) * 100))

  const hasSeasoned = descriptive > 0 && short === 0
  const hasGreen = short > descriptive
  const hasWet = descriptive > 3 && comments === 0
  const hasDry = descriptive > 0 && comments > 0 && short === 0

  return { nameQuality, commentQuality, docQuality, typeAnnotations, hasSeasoned, hasGreen, hasWet, hasDry }
}

/**
 * Measure protocol (style, naming, structure compliance)
 * @example
 * measureProtocol('export function a(): number { return 1 }') // ProtocolInfo
 */
export function measureProtocol(content: string): ProtocolInfo {
  const exports = countExports(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const comments = countComments(content)
  const descriptive = countDescriptiveNames(content)
  const short = countShortNames(content)

  const violations: string[] = []
  if (exports > 0 && errors === 0) violations.push('Exported functions without error handling')
  if (short > descriptive && countLoc(content) > 5) violations.push('Short variable names in non-trivial code')
  if (comments === 0 && countLoc(content) > 20) violations.push('No comments in large file')

  const followsStyle = types > 0 && comments > 0
  const followsNaming = descriptive > 0 && short <= descriptive
  const followsStructure = imports <= exports + 2 || exports === 0

  const complianceScore = Math.min(100, Math.max(0, Math.round(
    (followsStyle ? 30 : 0) +
    (followsNaming ? 30 : 0) +
    (followsStructure ? 25 : 0) +
    (violations.length === 0 ? 15 : 0),
  )))

  return { followsStyle, followsNaming, followsStructure, violations, complianceScore }
}

/**
 * Measure beacon (lit, visible, maintained)
 * @example
 * measureBeacon('export function a(): number { return 1 }') // BeaconInfo
 */
export function measureBeacon(content: string): BeaconInfo {
  const comments = countComments(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const todos = countTodos(content)

  const isLit = exports > 0 || comments > 0 || types > 0
  const isVisible = exports > 0 && (comments > 0 || types > 0)
  const isMaintained = todos === 0 && exports > 0
  const hasKeeper = /@author|@owner|@maintainer/i.test(content)
  const lastTended = todos > 0 ? 'needs-attention' : 'recent'

  const visibilityScore = Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 30 : 0) +
    (comments > 0 ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (isMaintained ? 20 : 0),
  )))

  return { isLit, isVisible, isMaintained, hasKeeper, lastTended, visibilityScore }
}

/**
 * Measure network (connections, hub/endpoint/relay)
 * @example
 * measureNetwork('import { x } from "y"\nexport function a() {}') // NetworkInfo
 */
export function measureNetwork(content: string): NetworkInfo {
  const exports = countExports(content)
  const imports = countImports(content)

  const reExports = (content.match(/export\s+\{[^}]*\}\s+from/g) ?? []).length
  const relayCount = reExports

  const hasDeadRelay = reExports > 0 && countFunctions(content) === 0 && countLoc(content) <= reExports * 2 + imports + 2

  const isHub = exports >= 3 && imports >= 2
  const isEndpoint = imports === 0 && exports <= 1
  const isRelay = reExports > 0 && countFunctions(content) === 0

  return {
    signalsToOthers: exports,
    receivesFromOthers: imports,
    relayCount, hasDeadRelay, isHub, isEndpoint, isRelay,
  }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a signal flame
 * @example
 * analyzeSignalFlame('export function calc(): number { return 1 }', 'calc.ts') // SignalFlame
 */
export function analyzeSignalFlame(content: string, filePath: string): SignalFlame {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      flameHeight: 0, smokeClarity: 0, signalRange: 0,
      fireConsistency: 0, fuelQuality: 0, protocolCompliance: 0,
      flame: { height: 0, color: 'out', isSteady: false, isFlickering: false, isSmoky: false, isDying: false, isOut: true, intensity: 0 },
      smoke: { signals: [], clarity: 0, hasFalseSignals: false, hasNoSignals: true, hasOldSignals: false, hasStrongSignals: false, falseSignalCount: 0, oldSignalCount: 0, strongSignalCount: 0 },
      fuel: { nameQuality: 0, commentQuality: 0, docQuality: 0, typeAnnotations: 0, hasSeasoned: false, hasGreen: false, hasWet: false, hasDry: false },
      protocol: { followsStyle: false, followsNaming: false, followsStructure: true, violations: [], complianceScore: 0 },
      beacon: { isLit: false, isVisible: false, isMaintained: false, hasKeeper: false, lastTended: 'never', visibilityScore: 0 },
      network: { signalsToOthers: 0, receivesFromOthers: 0, relayCount: 0, hasDeadRelay: false, isHub: false, isEndpoint: true, isRelay: false },
      condition: 'cold-ashes',
      qualityScore: 0,
    }
  }

  const flame = measureFlame(content)
  const smoke = measureSmoke(content)
  const fuel = measureFuel(content)
  const protocol = measureProtocol(content)
  const beacon = measureBeacon(content)
  const network = measureNetwork(content)

  const flameHeight = flame.height
  const smokeClarity = smoke.clarity
  const signalRange = Math.min(100, Math.max(0, Math.round(
    (countJSDoc(content) > 0 ? 30 : 0) +
    (countComments(content) > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))
  const fireConsistency = Math.min(100, Math.max(0, Math.round(
    (flame.isSteady ? 25 : 0) +
    (protocol.complianceScore * 0.25) +
    (smoke.hasStrongSignals ? 25 : 0) +
    (fuel.hasDry ? 15 : 0) +
    (beacon.isMaintained ? 10 : 0),
  )))
  const fuelQuality = Math.min(100, Math.max(0, Math.round(
    fuel.nameQuality * 0.35 +
    fuel.commentQuality * 0.3 +
    fuel.docQuality * 0.2 +
    fuel.typeAnnotations * 0.15,
  )))
  const protocolCompliance = protocol.complianceScore

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    flameHeight * 0.2 +
    smokeClarity * 0.15 +
    signalRange * 0.15 +
    fireConsistency * 0.15 +
    fuelQuality * 0.15 +
    protocolCompliance * 0.1 +
    beacon.visibilityScore * 0.1,
  )))

  const condition = classifyFlameCondition(qualityScore)

  return {
    file: filePath,
    flameHeight, smokeClarity, signalRange,
    fireConsistency, fuelQuality, protocolCompliance,
    flame, smoke, fuel, protocol, beacon, network,
    condition, qualityScore,
  }
}

// ─── Tower Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as a fire tower
 * @example
 * analyzeFireTower(flames, 'src') // FireTower
 */
export function analyzeFireTower(flames: SignalFlame[], dirPath: string): FireTower {
  if (flames.length === 0) {
    return {
      directory: dirPath, flames: [],
      avgFlameHeight: 100, avgSmokeClarity: 100, avgSignalRange: 100, avgConsistency: 100,
      blazingCount: 0, coldCount: 0, litCount: 0, networkDensity: 100,
      towerType: 'dark-tower', condition: 'blackout',
    }
  }

  const n = flames.length
  const avgFlameHeight = Math.round(flames.reduce((s, f) => s + f.flameHeight, 0) / n)
  const avgSmokeClarity = Math.round(flames.reduce((s, f) => s + f.smokeClarity, 0) / n)
  const avgSignalRange = Math.round(flames.reduce((s, f) => s + f.signalRange, 0) / n)
  const avgConsistency = Math.round(flames.reduce((s, f) => s + f.fireConsistency, 0) / n)

  const blazingCount = flames.filter(f => f.condition === 'blazing-beacon' || f.condition === 'bright-signal').length
  const coldCount = flames.filter(f => f.condition === 'cold-ashes' || f.condition === 'dying-ember').length
  const litCount = flames.filter(f => f.beacon.isLit).length

  const totalConnections = flames.reduce((s, f) => s + f.network.signalsToOthers + f.network.receivesFromOthers, 0)
  const networkDensity = Math.min(100, Math.round((totalConnections / (n * 2)) * 100))

  const towerType = classifyTowerType(flames)
  const condition = classifyTowerCondition(avgFlameHeight)

  return {
    directory: dirPath, flames,
    avgFlameHeight, avgSmokeClarity, avgSignalRange, avgConsistency,
    blazingCount, coldCount, litCount, networkDensity,
    towerType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate signal fire recommendations
 * @example
 * generateRecommendations(flames, towers, network, stats) // string[]
 */
export function generateRecommendations(
  _flames: SignalFlame[],
  _towers: FireTower[],
  _network: NetworkOverview,
  stats: SignalFireStats,
): string[] {
  void _flames
  void _towers
  void _network
  const recs: string[] = []

  if (stats.coldAshesCount > 0) {
    recs.push(`Cold ashes: ${stats.coldAshesCount} files have no visible signaling`)
  }
  if (stats.hasFalseSignals > 0) {
    recs.push(`False signals: ${stats.hasFalseSignals} files have misleading documentation`)
  }
  if (stats.totalProtocolViolations > 0) {
    recs.push(`Protocol violations: ${stats.totalProtocolViolations} standards violations detected`)
  }
  if (stats.hasOldSignals > 0) {
    recs.push(`Stale signals: ${stats.hasOldSignals} files have outdated documentation markers`)
  }
  if (stats.overallVisibility >= 60) {
    recs.push('Clear signals: code intent is well-communicated across the codebase')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete signal fire result from files and contents
 * @example
 * buildSignalFireResult(['a.ts'], ['export function a() {}'], {}) // SignalFireResult
 */
export function buildSignalFireResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): SignalFireResult {
  void options

  const flames: SignalFlame[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeSignalFlame(content, file)
    } catch {
      return analyzeSignalFlame('', file)
    }
  })

  const dirMap = new Map<string, SignalFlame[]>()
  for (const f of flames) {
    const dir = f.file.includes('/') ? f.file.slice(0, f.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(f) } else { dirMap.set(dir, [f]) }
  }

  const towers: FireTower[] = Array.from(dirMap.entries()).map(([dir, fs]) =>
    analyzeFireTower(fs, dir),
  )

  const n = flames.length || 1
  const avgFlameHeight = Math.round(flames.reduce((s, f) => s + f.flameHeight, 0) / n)
  const avgSmokeClarity = Math.round(flames.reduce((s, f) => s + f.smokeClarity, 0) / n)
  const avgSignalRange = Math.round(flames.reduce((s, f) => s + f.signalRange, 0) / n)
  const avgConsistency = Math.round(flames.reduce((s, f) => s + f.fireConsistency, 0) / n)
  const totalSignals = flames.reduce((s, f) => s + f.smoke.signals.length, 0)

  const overallVisibility = Math.min(100, Math.max(0, Math.round(
    avgFlameHeight * 0.25 +
    avgSmokeClarity * 0.2 +
    avgSignalRange * 0.2 +
    avgConsistency * 0.2 +
    (flames.filter(f => f.beacon.isVisible).length / n) * 100 * 0.15,
  )))

  const network: NetworkOverview = {
    avgFlameHeight, avgSmokeClarity, avgSignalRange, avgConsistency,
    totalSignals, isWellLit: overallVisibility >= 60, overallVisibility,
  }

  const stats: SignalFireStats = {
    totalFiles: files.length,
    totalTowers: towers.length,
    avgFlameHeight, avgSmokeClarity, avgSignalRange,
    avgFireConsistency: avgConsistency,
    avgFuelQuality: Math.round(flames.reduce((s, f) => s + f.fuelQuality, 0) / n),
    avgProtocolCompliance: Math.round(flames.reduce((s, f) => s + f.protocolCompliance, 0) / n),
    blazingBeaconCount: flames.filter(f => f.condition === 'blazing-beacon').length,
    brightSignalCount: flames.filter(f => f.condition === 'bright-signal').length,
    steadyFlameCount: flames.filter(f => f.condition === 'steady-flame').length,
    smokyCount: flames.filter(f => f.condition === 'smoky').length,
    dyingEmberCount: flames.filter(f => f.condition === 'dying-ember').length,
    coldAshesCount: flames.filter(f => f.condition === 'cold-ashes').length,
    hasFalseSignals: flames.filter(f => f.smoke.hasFalseSignals).length,
    hasOldSignals: flames.filter(f => f.smoke.hasOldSignals).length,
    hasStrongSignals: flames.filter(f => f.smoke.hasStrongSignals).length,
    litBeacons: flames.filter(f => f.beacon.isLit).length,
    maintainedBeacons: flames.filter(f => f.beacon.isMaintained).length,
    hubNodes: flames.filter(f => f.network.isHub).length,
    endpointNodes: flames.filter(f => f.network.isEndpoint).length,
    relayNodes: flames.filter(f => f.network.isRelay).length,
    totalProtocolViolations: flames.reduce((s, f) => s + f.protocol.violations.length, 0),
    overallVisibility,
    signalmanGrade: classifySignalmanGrade(overallVisibility),
    brightestFlame: flames.length > 0
      ? flames.reduce((a, b) => b.flameHeight > a.flameHeight ? b : a, flames[0] as typeof flames[number]).file : 'none',
    dimmestFlame: flames.length > 0
      ? flames.reduce((a, b) => b.flameHeight < a.flameHeight ? b : a, flames[0] as typeof flames[number]).file : 'none',
    clearestSmoke: flames.length > 0
      ? flames.reduce((a, b) => b.smokeClarity > a.smokeClarity ? b : a, flames[0] as typeof flames[number]).file : 'none',
    mostCompliant: flames.length > 0
      ? flames.reduce((a, b) => b.protocolCompliance > a.protocolCompliance ? b : a, flames[0] as typeof flames[number]).file : 'none',
    mostDeceptive: flames.length > 0
      ? flames.reduce((a, b) => b.smoke.falseSignalCount > a.smoke.falseSignalCount ? b : a, flames[0] as typeof flames[number]).file : 'none',
  }

  const recommendations = generateRecommendations(flames, towers, network, stats)

  return { flames, towers, network, stats, recommendations }
}
