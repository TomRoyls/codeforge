// ─── Interfaces ──────────────────────────────────────────

export interface CargoMeasure {
  type: 'silk' | 'spice' | 'gold' | 'gems' | 'ivory' | 'textiles' | 'tea' | 'salt'
  value: number
  weight: number
  isPerishable: boolean
  isDurable: boolean
  isFragile: boolean
  isValuable: boolean
  isExotic: boolean
  isCommon: boolean
}

export interface RouteMeasure {
  inboundPaths: number
  outboundPaths: number
  totalPaths: number
  efficiency: number
  hasDirectRoutes: boolean
  hasCircuitousRoutes: boolean
  hasDeadEnds: boolean
  hasPiracy: boolean
  circuitousCount: number
  deadEndCount: number
}

export interface TollMeasure {
  count: number
  totalToll: number
  hasLegitimateTolls: boolean
  hasExcessiveTolls: boolean
  hasTollFraud: boolean
  isReasonable: boolean
  legitimateCount: number
  excessiveCount: number
}

export interface TradeMeasure {
  volume: number
  hasWholesale: boolean
  hasRetail: boolean
  hasMonopoly: boolean
  hasCompetition: boolean
  hasEmbargo: boolean
  isTradeHub: boolean
  exportCount: number
  importCount: number
}

export interface SafetyMeasure {
  level: number
  hasEscorts: boolean
  hasNavalPatrol: boolean
  hasSafeHarbors: boolean
  hasPirateZones: boolean
  hasShipwrecks: boolean
  hasStormWarnings: boolean
  pirateZoneCount: number
  shipwreckCount: number
}

export interface TrustMeasure {
  level: number
  hasGuildSeal: boolean
  hasLetterOfCredit: boolean
  hasMerchantCharter: boolean
  hasBrokenPromise: boolean
  hasReliableWeights: boolean
  isTrustedMerchant: boolean
}

export interface CaravanMeasure {
  size: number
  hasScouts: boolean
  hasGuards: boolean
  hasPackAnimals: boolean
  isOverloaded: boolean
  hasLostCargo: boolean
  lostCargoCount: number
}

export interface TradeWaypoint {
  file: string
  cargoValue: number
  routeEfficiency: number
  tollStationCount: number
  tradeVolume: number
  routeSafety: number
  merchantTrust: number
  cargo: CargoMeasure
  route: RouteMeasure
  tolls: TollMeasure
  trade: TradeMeasure
  safety: SafetyMeasure
  trust: TrustMeasure
  caravan: CaravanMeasure
  condition: 'silk-road-hub' | 'major-port' | 'trading-post' | 'waystation' | 'ghost-town' | 'shipwreck'
  qualityScore: number
}

export interface TradeRoute {
  directory: string
  waypoints: TradeWaypoint[]
  avgCargoValue: number
  avgRouteEfficiency: number
  avgSafety: number
  avgTrust: number
  hubCount: number
  shipwreckCount: number
  totalTradeVolume: number
  routeType: 'silk-road' | 'maritime-highway' | 'caravan-route' | 'river-trade' | 'smuggling-trail' | 'dead-route'
  condition: 'golden-age' | 'prosperous-trade' | 'active-commerce' | 'declining-trade' | 'dangerous-passage' | 'abandoned-route'
}

export interface SpiceRouteNetwork {
  avgCargoValue: number
  avgRouteEfficiency: number
  avgSafety: number
  avgTrust: number
  isProsperous: boolean
  overallTradeHealth: number
}

export interface SpiceRouteStats {
  totalFiles: number
  totalRoutes: number
  avgCargoValue: number
  avgRouteEfficiency: number
  avgTollStationCount: number
  avgTradeVolume: number
  avgRouteSafety: number
  avgMerchantTrust: number
  silkRoadHubCount: number
  majorPortCount: number
  tradingPostCount: number
  waystationCount: number
  ghostTownCount: number
  shipwreckCount: number
  silkCargoCount: number
  spiceCargoCount: number
  goldCargoCount: number
  hasPiracyCount: number
  hasDeadEndsCount: number
  hasExcessiveTollsCount: number
  hasPirateZonesCount: number
  hasShipwrecksCount: number
  isTradeHubCount: number
  isTrustedMerchantCount: number
  hasGuildSealCount: number
  hasLetterOfCreditCount: number
  overallTradeHealth: number
  merchantGrade: 'grand-merchant' | 'guild-master' | 'merchant' | 'trader' | 'peddler' | 'beggar'
  mostValuable: string
  mostEfficient: string
  safestRoute: string
  mostTrusted: string
  busiestHub: string
}

export interface SpiceRouteResult {
  waypoints: TradeWaypoint[]
  routes: TradeRoute[]
  network: SpiceRouteNetwork
  stats: SpiceRouteStats
  recommendations: string[]
}

// ─── Utility helpers ──────────────────────────────────────

const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n))

function countLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').length
}

function countImports(content: string): number {
  return (content.match(/^import\s/gm) || []).length
}

function countExports(content: string): number {
  return (content.match(/^export\s/gm) || []).length
}

function countFunctions(content: string): number {
  return (content.match(/\bfunction\s+\w+/g) || []).length + (content.match(/\b\w+\s*=\s*(?:async\s+)?\(/g) || []).length
}

function countClasses(content: string): number {
  return (content.match(/\bclass\s+\w+/g) || []).length
}

function countInterfaces(content: string): number {
  return (content.match(/\binterface\s+\w+/g) || []).length
}

function countTypeAliases(content: string): number {
  return (content.match(/\btype\s+\w+\s*=/g) || []).length
}

function countTryCatch(content: string): number {
  return (content.match(/\btry\s*\{/g) || []).length
}

function countThrow(content: string): number {
  return (content.match(/\bthrow\s/g) || []).length
}

function countErrorHandling(content: string): number {
  return countTryCatch(content) + countThrow(content) + (content.match(/\.catch\s*\(/g) || []).length
}

function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object|undefined|null|null)\b/g) || []).length
    + (content.match(/:\s*\w+\[/g) || []).length
    + (content.match(/:\s*\{[^}]*\}/g) || []).length
}

function countJSDoc(content: string): number {
  return (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
}

function countTests(content: string): number {
  return (content.match(/\b(it|test|describe)\s*\(/g) || []).length
}

function countConditions(content: string): number {
  return (content.match(/\bif\s*\(/g) || []).length
}

function countLoops(content: string): number {
  return (content.match(/\b(for|while)\s*\(/g) || []).length
}

function countAsyncAwait(content: string): number {
  return (content.match(/\basync\s/g) || []).length + (content.match(/\bawait\s/g) || []).length
}

function countNesting(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('}') || trimmed.endsWith('}')) {
      depth = Math.max(0, depth - 1)
    }
    if (trimmed.includes('{')) {
      depth++
      maxDepth = Math.max(maxDepth, depth)
    }
  }
  return maxDepth
}

function countMiddlewarePatterns(content: string): number {
  return (content.match(/\bmiddleware\b/gi) || []).length
    + (content.match(/\btransformer\b/gi) || []).length
    + (content.match(/\binterceptor\b/gi) || []).length
    + (content.match(/\bdecorator\b/gi) || []).length
    + (content.match(/\.use\s*\(/g) || []).length
    + (content.match(/\.pipe\s*\(/g) || []).length
}

function countTypeGuards(content: string): number {
  return (content.match(/\btypeof\s+\w+\s*(===|!==)\s*/g) || []).length
    + (content.match(/\binstanceof\s+/g) || []).length
    + (content.match(/\bis\w+\(/g) || []).length
}

function countValidation(content: string): number {
  return (content.match(/\bvalidate\w*\s*\(/gi) || []).length
    + (content.match(/\bassert\w*\s*\(/gi) || []).length
    + (content.match(/\bcheck\w*\s*\(/gi) || []).length
}

function countDeprecation(content: string): number {
  return (content.match(/@deprecated\b/g) || []).length
}

function countCircularImports(content: string): number {
  const reexports = (content.match(/^export\s+\*\s+from/gm) || []).length
  return reexports
}

function countUnusedImports(content: string): number {
  const imports = content.match(/^import\s+\{([^}]+)\}\s+from/gm) || []
  let unused = 0
  for (const imp of imports) {
    const match = imp.match(/\{([^}]+)\}/)
    if (match) {
      const names = match[1].split(',').map((s) => s.trim())
      for (const name of names) {
        const bareName = name.replace(/\s+as\s+\w+/, '').trim()
        if (bareName) {
          const usageRegex = new RegExp('\\b' + bareName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g')
          const usages = (content.match(usageRegex) || []).length
          if (usages <= 2) unused++
        }
      }
    }
  }
  return unused
}

// ─── Measure functions ────────────────────────────────────

/**
 * @example
 * const cargo = measureCargo('export function core() {}')
 * // cargo.type = 'gold', cargo.value > 0
 */
export function measureCargo(content: string): CargoMeasure {
  const loc = countLines(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)

  const value = loc === 0 ? 0 : clamp(Math.round(
    (exports * 15) + (functions * 5) + (classes * 10) + (interfaces * 8) + (types * 3)
  ), 0, 100)

  const weight = clamp(Math.round(loc / 5), 0, 100)

  const totalExportable = exports + functions + classes + interfaces
  const isPerishable = totalExportable > 5
  const isDurable = !isPerishable && value < 60
  const isFragile = countErrorHandling(content) === 0 && loc > 10
  const isValuable = value >= 50
  const isExotic = types > 3 || interfaces > 2
  const isCommon = value < 20 && functions <= 2

  let type: CargoMeasure['type']
  if (value >= 80) type = 'gold'
  else if (value >= 60) type = 'gems'
  else if (isExotic) type = 'silk'
  else if (value >= 40) type = 'spice'
  else if (value >= 30) type = 'ivory'
  else if (value >= 20) type = 'textiles'
  else if (value >= 10) type = 'tea'
  else type = 'salt'

  return {
    isCommon,
    isDurable,
    isExotic,
    isFragile,
    isPerishable,
    isValuable,
    type,
    value,
    weight,
  }
}

/**
 * @example
 * const route = measureRoute('import { x } from "./a"\nexport { y }')
 * // route.inboundPaths > 0, route.outboundPaths > 0
 */
export function measureRoute(content: string): RouteMeasure {
  const imports = countImports(content)
  const exports = countExports(content)
  const totalPaths = imports + exports

  const deadEndCount = countUnusedImports(content)
  const circuitousCount = countCircularImports(content)
  const hasPiracy = circuitousCount > 0
  const hasDeadEnds = deadEndCount > 0
  const hasDirectRoutes = imports > 0 && deadEndCount === 0
  const hasCircuitousRoutes = circuitousCount > 0

  const rawEfficiency = totalPaths === 0
    ? 100
    : clamp(Math.round(100 - (deadEndCount * 15) - (circuitousCount * 20)), 0, 100)

  return {
    circuitousCount,
    deadEndCount,
    efficiency: rawEfficiency,
    hasCircuitousRoutes,
    hasDeadEnds,
    hasDirectRoutes,
    hasPiracy,
    inboundPaths: imports,
    outboundPaths: exports,
    totalPaths,
  }
}

/**
 * @example
 * const tolls = measureTolls('app.use(middleware())')
 * // tolls.count > 0
 */
export function measureTolls(content: string): TollMeasure {
  const loc = countLines(content)
  const middleware = countMiddlewarePatterns(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)

  const count = middleware
  const totalToll = loc === 0 ? 0 : clamp(Math.round(
    (middleware * 20) + (classes > 3 ? 15 : 0) + (functions > 10 ? 10 : 0)
  ), 0, 100)

  const legitimateCount = middleware > 0 && middleware <= 3 ? middleware : 0
  const excessiveCount = middleware > 5 ? middleware - 3 : 0
  const hasLegitimateTolls = legitimateCount > 0
  const hasExcessiveTolls = excessiveCount > 0
  const hasTollFraud = middleware > 0 && countErrorHandling(content) === 0
  const isReasonable = middleware <= 3

  return {
    count,
    excessiveCount,
    hasExcessiveTolls,
    hasLegitimateTolls,
    hasTollFraud,
    isReasonable,
    legitimateCount,
    totalToll,
  }
}

/**
 * @example
 * const trade = measureTrade('export function a() {}\nexport function b() {}')
 * // trade.exportCount >= 2, trade.hasWholesale = true
 */
export function measureTrade(content: string): TradeMeasure {
  const imports = countImports(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)

  const exportCount = exports
  const importCount = imports
  const volume = clamp(Math.round((exports * 12) + (functions * 5) + (classes * 8)), 0, 100)

  const hasWholesale = exports >= 3
  const hasRetail = exports === 1
  const hasMonopoly = functions >= 5 && exports >= 3
  const hasCompetition = functions >= 3 && exports <= 1
  const hasEmbargo = exports === 0 && functions >= 2
  const isTradeHub = imports >= 3 && exports >= 3

  return {
    exportCount,
    hasCompetition,
    hasEmbargo,
    hasMonopoly,
    hasRetail,
    hasWholesale,
    importCount,
    isTradeHub,
    volume,
  }
}

/**
 * @example
 * const safety = measureSafety('try { x() } catch(e) { handle(e) }')
 * // safety.hasEscorts = true, safety.level > 50
 */
export function measureSafety(content: string): SafetyMeasure {
  const loc = countLines(content)
  const tryCatch = countTryCatch(content)
  const throws = countThrow(content)
  const catches = (content.match(/\.catch\s*\(/g) || []).length
  const errorHandling = countErrorHandling(content)
  const conditions = countConditions(content)
  const deprecations = countDeprecation(content)

  const level = loc === 0 ? 100 : clamp(Math.round(
    (errorHandling > 0 ? 30 : 0) +
    (tryCatch > 0 ? 20 : 0) +
    (catches > 0 ? 15 : 0) +
    (throws > 0 ? 10 : 0) +
    (conditions > 0 ? 10 : 0) +
    (loc > 20 && errorHandling > 2 ? 15 : 0)
  ), 0, 100)

  const pirateZoneCount = loc > 20 && errorHandling === 0 ? 1 : 0
  const shipwreckCount = (content.match(/\bTODO\b/g) || []).length + (content.match(/\bFIXME\b/g) || []).length
  const hasEscorts = tryCatch > 0
  const hasNavalPatrol = errorHandling >= 3
  const hasSafeHarbors = catches > 0 || tryCatch > 1
  const hasPirateZones = pirateZoneCount > 0
  const hasShipwrecks = shipwreckCount > 0
  const hasStormWarnings = deprecations > 0

  return {
    hasEscorts,
    hasNavalPatrol,
    hasPirateZones,
    hasSafeHarbors,
    hasShipwrecks,
    hasStormWarnings,
    level,
    pirateZoneCount,
    shipwreckCount,
  }
}

/**
 * @example
 * const trust = measureTrust('export function f(x: number): void {}')
 * // trust.hasGuildSeal = true, trust.level > 50
 */
export function measureTrust(content: string): TrustMeasure {
  const loc = countLines(content)
  const typeAnnotations = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const tests = countTests(content)
  const functions = countFunctions(content)

  const hasGuildSeal = typeAnnotations > 0
  const hasLetterOfCredit = tests > 0
  const hasMerchantCharter = jsdoc > 0
  const hasBrokenPromise = typeAnnotations > 0 && (content.match(/:\s*any\b/g) || []).length > 0
  const hasReliableWeights = functions > 0 && typeAnnotations >= functions

  const level = loc === 0 ? 100 : clamp(Math.round(
    (hasGuildSeal ? 30 : 0) +
    (hasLetterOfCredit ? 25 : 0) +
    (hasMerchantCharter ? 20 : 0) +
    (hasReliableWeights ? 15 : 0) +
    (!hasBrokenPromise ? 10 : 0)
  ), 0, 100)

  const isTrustedMerchant = hasGuildSeal && hasLetterOfCredit && hasMerchantCharter

  return {
    hasBrokenPromise,
    hasGuildSeal,
    hasLetterOfCredit,
    hasMerchantCharter,
    hasReliableWeights,
    isTrustedMerchant,
    level,
  }
}

/**
 * @example
 * const caravan = measureCaravan('import { a, b, c } from "x"')
 * // caravan.size > 0, caravan.isOverloaded = false
 */
export function measureCaravan(content: string): CaravanMeasure {
  const imports = countImports(content)
  const typeGuards = countTypeGuards(content)
  const validation = countValidation(content)
  const helpers = (content.match(/\bhelper\w*\b/gi) || []).length + (content.match(/\butil\w*\b/gi) || []).length

  const size = imports
  const hasScouts = typeGuards > 0
  const hasGuards = validation > 0
  const hasPackAnimals = helpers > 0
  const isOverloaded = imports > 10
  const lostCargoCount = countUnusedImports(content)
  const hasLostCargo = lostCargoCount > 0

  return {
    hasGuards,
    hasLostCargo,
    hasPackAnimals,
    hasScouts,
    isOverloaded,
    lostCargoCount,
    size,
  }
}

// ─── Classification ───────────────────────────────────────

/**
 * @example
 * classifyWaypointCondition(85, 90, 80) // 'silk-road-hub'
 */
export function classifyWaypointCondition(
  cargoValue: number,
  routeEfficiency: number,
  routeSafety: number,
): TradeWaypoint['condition'] {
  const score = (cargoValue + routeEfficiency + routeSafety) / 3
  if (score >= 75 && cargoValue >= 70) return 'silk-road-hub'
  if (score >= 60 && routeEfficiency >= 50) return 'major-port'
  if (score >= 45) return 'trading-post'
  if (score >= 25) return 'waystation'
  if (routeSafety >= 30) return 'ghost-town'
  return 'shipwreck'
}

/**
 * @example
 * classifyRouteType(waypoints) // 'silk-road'
 */
export function classifyRouteType(waypoints: TradeWaypoint[]): TradeRoute['routeType'] {
  if (waypoints.length === 0) return 'dead-route'
  const avgCargo = waypoints.reduce((s, w) => s + w.cargoValue, 0) / waypoints.length
  const avgSafety = waypoints.reduce((s, w) => s + w.routeSafety, 0) / waypoints.length
  const hubRatio = waypoints.filter((w) => w.condition === 'silk-road-hub' || w.condition === 'major-port').length / waypoints.length

  if (avgCargo >= 60 && hubRatio >= 0.3) return 'silk-road'
  if (avgCargo >= 50 && avgSafety >= 50) return 'maritime-highway'
  if (avgCargo >= 35) return 'caravan-route'
  if (avgSafety >= 40) return 'river-trade'
  if (avgCargo >= 15) return 'smuggling-trail'
  return 'dead-route'
}

/**
 * @example
 * classifyRouteCondition(avgValue, avgSafety) // 'golden-age'
 */
export function classifyRouteCondition(
  avgCargoValue: number,
  avgSafety: number,
): TradeRoute['condition'] {
  const score = (avgCargoValue + avgSafety) / 2
  if (score >= 80) return 'golden-age'
  if (score >= 65) return 'prosperous-trade'
  if (score >= 50) return 'active-commerce'
  if (score >= 35) return 'declining-trade'
  if (score >= 20) return 'dangerous-passage'
  return 'abandoned-route'
}

/**
 * @example
 * classifyMerchantGrade(85) // 'grand-merchant'
 */
export function classifyMerchantGrade(avgHealth: number): SpiceRouteStats['merchantGrade'] {
  if (avgHealth >= 85) return 'grand-merchant'
  if (avgHealth >= 70) return 'guild-master'
  if (avgHealth >= 55) return 'merchant'
  if (avgHealth >= 40) return 'trader'
  if (avgHealth >= 20) return 'peddler'
  return 'beggar'
}

// ─── Analyze functions ────────────────────────────────────

/**
 * @example
 * const wp = analyzeTradeWaypoint(content, 'src/core.ts')
 * // wp.cargoValue >= 0, wp.condition is defined
 */
export function analyzeTradeWaypoint(content: string, filePath: string): TradeWaypoint {
  const cargo = measureCargo(content)
  const route = measureRoute(content)
  const tolls = measureTolls(content)
  const trade = measureTrade(content)
  const safety = measureSafety(content)
  const trust = measureTrust(content)
  const caravan = measureCaravan(content)

  const cargoValue = cargo.value
  const routeEfficiency = route.efficiency
  const tollStationCount = tolls.count
  const tradeVolume = trade.volume
  const routeSafety = safety.level
  const merchantTrust = trust.level

  const condition = classifyWaypointCondition(cargoValue, routeEfficiency, routeSafety)

  const qualityScore = clamp(Math.round(
    (cargoValue * 0.2) +
    (routeEfficiency * 0.2) +
    (routeSafety * 0.2) +
    (merchantTrust * 0.2) +
    (tradeVolume * 0.1) +
    ((100 - tolls.totalToll) * 0.1)
  ), 0, 100)

  return {
    caravan,
    cargo,
    cargoValue,
    condition,
    merchantTrust,
    qualityScore,
    route,
    routeEfficiency,
    routeSafety,
    safety,
    tollStationCount,
    tolls,
    trade,
    tradeVolume,
    trust,
    file: filePath,
  }
}

/**
 * @example
 * const route = analyzeTradeRoute(waypoints, 'src')
 * // route.routeType = 'silk-road'
 */
export function analyzeTradeRoute(waypoints: TradeWaypoint[], dirPath: string): TradeRoute {
  if (waypoints.length === 0) {
    return {
      avgCargoValue: 0,
      avgRouteEfficiency: 0,
      avgSafety: 0,
      avgTrust: 0,
      condition: 'abandoned-route',
      directory: dirPath,
      hubCount: 0,
      routeType: 'dead-route',
      shipwreckCount: 0,
      totalTradeVolume: 0,
      waypoints: [],
    }
  }

  const avgCargoValue = Math.round(waypoints.reduce((s, w) => s + w.cargoValue, 0) / waypoints.length)
  const avgRouteEfficiency = Math.round(waypoints.reduce((s, w) => s + w.routeEfficiency, 0) / waypoints.length)
  const avgSafety = Math.round(waypoints.reduce((s, w) => s + w.routeSafety, 0) / waypoints.length)
  const avgTrust = Math.round(waypoints.reduce((s, w) => s + w.merchantTrust, 0) / waypoints.length)
  const hubCount = waypoints.filter((w) => w.condition === 'silk-road-hub' || w.condition === 'major-port').length
  const shipwreckCount = waypoints.filter((w) => w.condition === 'shipwreck').length
  const totalTradeVolume = Math.round(waypoints.reduce((s, w) => s + w.tradeVolume, 0) / waypoints.length)
  const routeType = classifyRouteType(waypoints)
  const condition = classifyRouteCondition(avgCargoValue, avgSafety)

  return {
    avgCargoValue,
    avgRouteEfficiency,
    avgSafety,
    avgTrust,
    condition,
    directory: dirPath,
    hubCount,
    routeType,
    shipwreckCount,
    totalTradeVolume,
    waypoints,
  }
}

// ─── Recommendation generation ────────────────────────────

/**
 * @example
 * const recs = generateRecommendations(waypoints, routes, network, stats)
 * // recs.length > 0
 */
export function generateRecommendations(
  waypoints: TradeWaypoint[],
  _routes: TradeRoute[],
  network: SpiceRouteNetwork,
  stats: SpiceRouteStats,
): string[] {
  const recs: string[] = []

  if (network.overallTradeHealth < 40) {
    recs.push('Trade network health is critically low - consider restructuring your module architecture')
  }

  if (stats.hasPiracyCount > 0) {
    recs.push(`${stats.hasPiracyCount} waypoint(s) have circular import dependencies - break these cycles`)
  }

  if (stats.hasDeadEndsCount > 2) {
    recs.push('Many unused imports detected - clean up dead-end routes to improve efficiency')
  }

  if (stats.hasExcessiveTollsCount > 0) {
    recs.push(`${stats.hasExcessiveTollsCount} waypoint(s) have excessive middleware - consider simplifying`)
  }

  if (stats.hasPirateZonesCount > 0) {
    recs.push('Unprotected error zones detected - add error handling to prevent shipwrecks')
  }

  if (stats.hasShipwrecksCount > 3) {
    recs.push('Many TODO/FIXME markers found - resolve technical debt to stabilize routes')
  }

  if (stats.ghostTownCount > stats.totalFiles * 0.3) {
    recs.push('Many low-value files detected - consider consolidating or removing ghost-town modules')
  }

  if (stats.isTrustedMerchantCount < stats.totalFiles * 0.2) {
    recs.push('Few files have full documentation, types, and tests - invest in merchant trust')
  }

  if (network.avgRouteEfficiency < 50) {
    recs.push('Route efficiency is low - review import patterns and remove circuitous paths')
  }

  const hubWaypoints = waypoints.filter((w) => w.condition === 'silk-road-hub')
  if (hubWaypoints.length === 0 && waypoints.length >= 5) {
    recs.push('No central trade hubs found - consider creating a well-typed, well-documented core module')
  }

  if (recs.length === 0) {
    recs.push('Trade routes are in excellent condition - your codebase has healthy module architecture')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────

/**
 * @example
 * const result = buildSpiceRouteResult(files, contents, {})
 * // result.stats.totalFiles > 0
 */
export function buildSpiceRouteResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): SpiceRouteResult {
  const waypoints: TradeWaypoint[] = files.map((file, i) =>
    analyzeTradeWaypoint(contents[i] ?? '', file),
  )

  // Group by directory
  const dirMap = new Map<string, TradeWaypoint[]>()
  for (const wp of waypoints) {
    const dir = wp.file.includes('/') ? wp.file.substring(0, wp.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(wp)
    } else {
      dirMap.set(dir, [wp])
    }
  }

  const routes: TradeRoute[] = Array.from(dirMap.entries()).map(([dir, wps]) =>
    analyzeTradeRoute(wps, dir),
  )

  const avgCargoValue = waypoints.length === 0 ? 0 : Math.round(waypoints.reduce((s, w) => s + w.cargoValue, 0) / waypoints.length)
  const avgRouteEfficiency = waypoints.length === 0 ? 0 : Math.round(waypoints.reduce((s, w) => s + w.routeEfficiency, 0) / waypoints.length)
  const avgSafety = waypoints.length === 0 ? 0 : Math.round(waypoints.reduce((s, w) => s + w.routeSafety, 0) / waypoints.length)
  const avgTrust = waypoints.length === 0 ? 0 : Math.round(waypoints.reduce((s, w) => s + w.merchantTrust, 0) / waypoints.length)
  const overallTradeHealth = clamp(Math.round(
    (avgCargoValue * 0.25) + (avgRouteEfficiency * 0.2) + (avgSafety * 0.25) + (avgTrust * 0.3)
  ), 0, 100)

  const network: SpiceRouteNetwork = {
    avgCargoValue,
    avgRouteEfficiency,
    avgSafety,
    avgTrust,
    isProsperous: overallTradeHealth >= 60,
    overallTradeHealth,
  }

  const avgTollStationCount = waypoints.length === 0 ? 0 : Math.round(waypoints.reduce((s, w) => s + w.tollStationCount, 0) / waypoints.length)
  const avgTradeVolume = waypoints.length === 0 ? 0 : Math.round(waypoints.reduce((s, w) => s + w.tradeVolume, 0) / waypoints.length)
  const avgRouteSafety = avgSafety
  const avgMerchantTrust = avgTrust

  const conditions = {
    ghostTown: waypoints.filter((w) => w.condition === 'ghost-town').length,
    majorPort: waypoints.filter((w) => w.condition === 'major-port').length,
    shipwreck: waypoints.filter((w) => w.condition === 'shipwreck').length,
    silkRoadHub: waypoints.filter((w) => w.condition === 'silk-road-hub').length,
    tradingPost: waypoints.filter((w) => w.condition === 'trading-post').length,
    waystation: waypoints.filter((w) => w.condition === 'waystation').length,
  }

  const cargoTypes = {
    gold: waypoints.filter((w) => w.cargo.type === 'gold').length,
    silk: waypoints.filter((w) => w.cargo.type === 'silk').length,
    spice: waypoints.filter((w) => w.cargo.type === 'spice').length,
  }

  const stats: SpiceRouteStats = {
    avgCargoValue,
    avgMerchantTrust,
    avgRouteEfficiency,
    avgRouteSafety,
    avgTollStationCount,
    avgTradeVolume,
    busiestHub: waypoints.reduce((best, w) => w.route.totalPaths > (best ? waypoints.find((x) => x.file === best)?.route.totalPaths ?? 0 : 0) ? w.file : best, waypoints[0]?.file ?? 'none'),
    ghostTownCount: conditions.ghostTown,
    goldCargoCount: cargoTypes.gold,
    hasDeadEndsCount: waypoints.filter((w) => w.route.hasDeadEnds).length,
    hasExcessiveTollsCount: waypoints.filter((w) => w.tolls.hasExcessiveTolls).length,
    hasGuildSealCount: waypoints.filter((w) => w.trust.hasGuildSeal).length,
    hasLetterOfCreditCount: waypoints.filter((w) => w.trust.hasLetterOfCredit).length,
    hasPiracyCount: waypoints.filter((w) => w.route.hasPiracy).length,
    hasPirateZonesCount: waypoints.filter((w) => w.safety.hasPirateZones).length,
    hasShipwrecksCount: waypoints.filter((w) => w.safety.hasShipwrecks).length,
    isTradeHubCount: waypoints.filter((w) => w.trade.isTradeHub).length,
    isTrustedMerchantCount: waypoints.filter((w) => w.trust.isTrustedMerchant).length,
    majorPortCount: conditions.majorPort,
    merchantGrade: classifyMerchantGrade(overallTradeHealth),
    mostEfficient: waypoints.reduce((best, w) => w.routeEfficiency > (best ? waypoints.find((x) => x.file === best)?.routeEfficiency ?? 0 : 0) ? w.file : best, waypoints[0]?.file ?? 'none'),
    mostTrusted: waypoints.reduce((best, w) => w.merchantTrust > (best ? waypoints.find((x) => x.file === best)?.merchantTrust ?? 0 : 0) ? w.file : best, waypoints[0]?.file ?? 'none'),
    mostValuable: waypoints.reduce((best, w) => w.cargoValue > (best ? waypoints.find((x) => x.file === best)?.cargoValue ?? 0 : 0) ? w.file : best, waypoints[0]?.file ?? 'none'),
    overallTradeHealth,
    safestRoute: waypoints.reduce((best, w) => w.routeSafety > (best ? waypoints.find((x) => x.file === best)?.routeSafety ?? 0 : 0) ? w.file : best, waypoints[0]?.file ?? 'none'),
    shipwreckCount: conditions.shipwreck,
    silkCargoCount: cargoTypes.silk,
    silkRoadHubCount: conditions.silkRoadHub,
    spiceCargoCount: cargoTypes.spice,
    totalFiles: files.length,
    totalRoutes: routes.length,
    tradingPostCount: conditions.tradingPost,
    waystationCount: conditions.waystation,
  }

  const recommendations = generateRecommendations(waypoints, routes, network, stats)

  return {
    network,
    recommendations,
    routes,
    stats,
    waypoints,
  }
}
