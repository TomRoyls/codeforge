// ─── Regex Constants ────────────────────────────────────────────────────────

const EXPORT_REGEX = /\bexport\s+/g
const IMPORT_REGEX = /\bimport\s+/g
const FUNCTION_REGEX = /\bfunction\s+\w+/g
const ARROW_REGEX = /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
const CLASS_REGEX = /\bclass\s+\w+/g
const INTERFACE_REGEX = /\binterface\s+\w+/g
const TYPE_REGEX = /\btype\s+\w+/g
const ENUM_REGEX = /\benum\s+\w+/g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const ASYNC_REGEX = /\basync\s+/g
const TRY_CATCH_REGEX = /\btry\s*\{/g
const DEEP_NESTED_REGEX = /\{[^{}]*\{[^{}]*\{[^{}]*\}/g
const CONSOLE_REGEX = /\bconsole\.\w+/g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const GENERICS_REGEX = /<[^>]+>/g
const PRIVATE_REGEX = /private\s+/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g

// ─── Helper Functions ───────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countImportKeywords(content: string): number { return countMatches(content, IMPORT_REGEX) }
function countExportKeywords(content: string): number { return countMatches(content, EXPORT_REGEX) }
function countClassKeywords(content: string): number { return countMatches(content, CLASS_REGEX) }
function countInterfaceKeywords(content: string): number { return countMatches(content, INTERFACE_REGEX) }
function countTypeKeywords(content: string): number { return countMatches(content, TYPE_REGEX) }
function countFunctionKeywords(content: string): number { return countMatches(content, FUNCTION_REGEX) }
function countArrowFunctions(content: string): number { return countMatches(content, ARROW_REGEX) }
function countJSDocBlocks(content: string): number { return countMatches(content, JSDOC_REGEX) }
function countAsyncKeywords(content: string): number { return countMatches(content, ASYNC_REGEX) }
function countTryCatch(content: string): number { return countMatches(content, TRY_CATCH_REGEX) }
function countDeepNested(content: string): number { return countMatches(content, DEEP_NESTED_REGEX) }
function countConsoleUsage(content: string): number { return countMatches(content, CONSOLE_REGEX) }
function countTodoComments(content: string): number { return countMatches(content, TODO_REGEX) }
function countPrivateMembers(content: string): number { return countMatches(content, PRIVATE_REGEX) }
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }

function genericsCount_safe(content: string): number { return countMatches(content, GENERICS_REGEX) }
function reExportCount_safe(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function enumCount_safe(content: string): number { return countMatches(content, ENUM_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface TradeMeasure {
  quality: number
  route: 'imperial-highway' | 'major-route' | 'trade-route' | 'branch-path' | 'goat-track' | 'dead-end'
  hasHighQuality: boolean
  hasProperConnections: boolean
  hasBidirectional: boolean
  hasNoTollgate: boolean
  hasOpenTrade: boolean
  hasNoSmuggling: boolean
  hasProperCustoms: boolean
  hasNoContraband: boolean
  hasTradePartners: boolean
  hasNoMonopoly: boolean
  tollgateCount: number
  smugglingCount: number
}

export interface CultureMeasure {
  richness: number
  influence: 'cosmopolitan' | 'multicultural' | 'regional' | 'provincial' | 'isolated' | 'hermit'
  hasRichCulture: boolean
  hasDiversePatterns: boolean
  hasCrossPollination: boolean
  hasNoCulturalImposition: boolean
  hasAdaptive: boolean
  hasNoStagnation: boolean
  hasKnowledgeTransfer: boolean
  hasNoHoarding: boolean
  hasCulturalExchange: boolean
  hasNoInbreeding: boolean
  impositionCount: number
  hoardingCount: number
}

export interface CaravanMeasure {
  strength: number
  formation: 'grand-caravan' | 'well-organized' | 'traveling-party' | 'straggling' | 'lonely-traveler' | 'lost'
  hasHighStrength: boolean
  hasProperFormation: boolean
  hasPackAnimals: boolean
  hasNoStragglers: boolean
  hasProperPacing: boolean
  hasNoOverloading: boolean
  hasGuardDetail: boolean
  hasNoBandits: boolean
  hasProperLogistics: boolean
  hasNoAbandonment: boolean
  stragglerCount: number
  banditCount: number
}

export interface OasisMeasure {
  stability: number
  condition: 'lush-oasis' | 'reliable-spring' | 'well' | 'seasonal-pool' | 'mirage' | 'poisoned-well'
  hasHighStability: boolean
  hasFreshWater: boolean
  hasProperShade: boolean
  hasNoContamination: boolean
  hasAbundant: boolean
  hasNoDepletion: boolean
  hasProperRest: boolean
  hasNoOvercrowding: boolean
  hasSafeHarbor: boolean
  hasNoQuicksand: boolean
  contaminationCount: number
  quicksandCount: number
}

export interface BridgeMeasure {
  quality: number
  engineering: 'masterpiece' | 'well-engineered' | 'functional' | 'rickety' | 'dangerous' | 'collapsed'
  hasHighQuality: boolean
  hasProperSpan: boolean
  hasSolidFoundation: boolean
  hasNoCracks: boolean
  hasProperLoad: boolean
  hasNoSagging: boolean
  hasClearPassage: boolean
  hasNoTolls: boolean
  hasProperLighting: boolean
  hasNoDeadEnd: boolean
  crackCount: number
  deadEndCount: number
}

export interface ProsperityMeasure {
  level: number
  wealth: 'golden-age' | 'prosperous' | 'thriving' | 'modest' | 'struggling' | 'destitute'
  hasHighProsperity: boolean
  hasTradeBalance: boolean
  hasSurplus: boolean
  hasNoDebt: boolean
  hasGrowing: boolean
  hasNoInflation: boolean
  hasStable: boolean
  hasNoRecession: boolean
  hasDiversified: boolean
  hasNoCollapse: boolean
  debtCount: number
  recessionCount: number
}

export interface CaravanStop {
  file: string
  tradeRouteQuality: number
  culturalRichness: number
  caravanStrength: number
  oasisStability: number
  bridgeQuality: number
  mercantileProsperity: number
  trade: TradeMeasure
  culture: CultureMeasure
  caravan: CaravanMeasure
  oasis: OasisMeasure
  bridge: BridgeMeasure
  prosperity: ProsperityMeasure
  condition: 'golden-city' | 'trading-post' | 'waystation' | 'outpost' | 'ruins' | 'ghost-town'
  qualityScore: number
}

export interface TradeRoute {
  directory: string
  stops: CaravanStop[]
  avgTrade: number
  avgCulture: number
  avgProsperity: number
  goldenCount: number
  ghostCount: number
  cosmopolitanCount: number
  prosperousCount: number
  routeType: 'imperial-network' | 'major-route' | 'regional-path' | 'local-road' | 'trail' | 'wilderness'
  condition: 'golden-age' | 'prosperous-era' | 'stable-trade' | 'declining' | 'abandoned' | 'lost'
}

export interface SilkRoadResult {
  stops: CaravanStop[]
  routes: TradeRoute[]
  network: {
    avgTrade: number
    avgCulture: number
    avgProsperity: number
    isProsperous: boolean
    overallProsperity: number
  }
  stats: {
    totalFiles: number
    totalRoutes: number
    avgTradeRouteQuality: number
    avgCulturalRichness: number
    avgCaravanStrength: number
    avgOasisStability: number
    avgBridgeQuality: number
    avgMercantileProsperity: number
    goldenCityCount: number
    tradingPostCount: number
    waystationCount: number
    outpostCount: number
    ruinsCount: number
    ghostTownCount: number
    hasHighTradeCount: number
    hasRichCultureCount: number
    hasHighStrengthCount: number
    hasHighStabilityCount: number
    hasHighBridgeCount: number
    hasHighProsperityCount: number
    overallProsperity: number
    merchantGrade: 'grand-merchant' | 'master-trader' | 'merchant' | 'peddler' | 'beggar' | 'bandit'
    bestStop: string
    bestConnected: string
    mostDiverse: string
    mostCohesive: string
    mostStable: string
    bestAPI: string
  }
  recommendations: string[]
}

// ─── Trade Measurement ──────────────────────────────────────────────────────

/** @example measureTrade(content) returns trade analysis */
export function measureTrade(content: string): TradeMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let quality = 20
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 8
  if (tryCatchCount > 0) quality += 8
  if (genericsCount > 0) quality += 5
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (asyncCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const tollgateCount = consoleCount + anyCount
  const smugglingCount = deepNestedCount

  const hasHighQuality = quality >= 75 && hasStructure && hasTypes
  const hasProperConnections = hasFunctions && exportCount > 0
  const hasBidirectional = exportCount > 0 && importCount > 0
  const hasNoTollgate = tollgateCount === 0
  const hasOpenTrade = exportCount > 0
  const hasNoSmuggling = smugglingCount === 0
  const hasProperCustoms = tryCatchCount > 0 && asyncCount > 0
  const hasNoContraband = consoleCount === 0 && deepNestedCount === 0
  const hasTradePartners = importCount > 0
  const hasNoMonopoly = exportCount > 0 && importCount > 0

  let route: TradeMeasure['route'] = 'dead-end'
  if (hasHighQuality && hasNoTollgate && hasNoSmuggling && hasBidirectional) route = 'imperial-highway'
  else if (hasHighQuality && hasNoTollgate) route = 'major-route'
  else if (hasHighQuality) route = 'trade-route'
  else if (hasProperConnections && hasBidirectional) route = 'branch-path'
  else if (quality > 30) route = 'goat-track'

  return {
    quality, route, hasHighQuality, hasProperConnections, hasBidirectional,
    hasNoTollgate, hasOpenTrade, hasNoSmuggling, hasProperCustoms, hasNoContraband,
    hasTradePartners, hasNoMonopoly, tollgateCount, smugglingCount,
  }
}

// ─── Culture Measurement ────────────────────────────────────────────────────

/** @example measureCulture(content) returns culture analysis */
export function measureCulture(content: string): CultureMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let richness = 20
  if (hasStructure) richness += 12
  if (hasTypes) richness += 12
  if (hasFunctions) richness += 10
  if (jsdocCount > 0) richness += 8
  if (exportCount > 0) richness += 8
  if (genericsCount > 0) richness += 5
  if (importCount > 0) richness += 5
  if (anyCount === 0) richness += 5
  if (consoleCount === 0) richness += 5
  if (todoCount === 0) richness += 5
  if (deepNestedCount === 0) richness += 5
  richness = Math.min(100, Math.max(0, Math.round(richness)))

  const impositionCount = anyCount + todoCount
  const hoardingCount = deepNestedCount + commentedCodeCount

  const hasRichCulture = richness >= 75 && hasStructure && hasTypes
  const hasDiversePatterns = hasStructure && hasTypes && hasFunctions
  const hasCrossPollination = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoCulturalImposition = impositionCount === 0
  const hasAdaptive = hasStructure && hasTypes && genericsCount > 0
  const hasNoStagnation = hasFunctions && exportCount > 0
  const hasKnowledgeTransfer = jsdocCount > 0 && hasFunctions
  const hasNoHoarding = hoardingCount === 0
  const hasCulturalExchange = exportCount > 0 && importCount > 0
  const hasNoInbreeding = importCount > 0 && genericsCount > 0

  let influence: CultureMeasure['influence'] = 'hermit'
  if (hasRichCulture && hasNoCulturalImposition && hasNoHoarding && hasDiversePatterns) influence = 'cosmopolitan'
  else if (hasRichCulture && hasNoCulturalImposition) influence = 'multicultural'
  else if (hasRichCulture) influence = 'regional'
  else if (hasDiversePatterns && hasKnowledgeTransfer) influence = 'provincial'
  else if (richness > 30) influence = 'isolated'

  return {
    richness, influence, hasRichCulture, hasDiversePatterns, hasCrossPollination,
    hasNoCulturalImposition, hasAdaptive, hasNoStagnation, hasKnowledgeTransfer,
    hasNoHoarding, hasCulturalExchange, hasNoInbreeding, impositionCount, hoardingCount,
  }
}

// ─── Caravan Measurement ────────────────────────────────────────────────────

/** @example measureCaravan(content) returns caravan analysis */
export function measureCaravan(content: string): CaravanMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)
  const todoCount = countTodoComments(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let strength = 20
  if (hasStructure) strength += 12
  if (hasTypes) strength += 12
  if (hasFunctions) strength += 10
  if (jsdocCount > 0) strength += 8
  if (exportCount > 0) strength += 8
  if (genericsCount > 0) strength += 5
  if (importCount > 0) strength += 5
  if (anyCount === 0) strength += 5
  if (consoleCount === 0) strength += 5
  if (deepNestedCount === 0) strength += 5
  if (privateCount === 0) strength += 5
  strength = Math.min(100, Math.max(0, Math.round(strength)))

  const stragglerCount = deepNestedCount + privateCount
  const banditCount = todoCount + anyCount

  const hasHighStrength = strength >= 75 && hasStructure && hasTypes
  const hasProperFormation = hasStructure && hasTypes && hasFunctions
  const hasPackAnimals = hasFunctions && exportCount > 0
  const hasNoStragglers = stragglerCount === 0
  const hasProperPacing = hasStructure && hasTypes && genericsCount > 0
  const hasNoOverloading = consoleCount === 0 && deepNestedCount === 0
  const hasGuardDetail = countTryCatch(content) > 0
  const hasNoBandits = banditCount === 0
  const hasProperLogistics = exportCount > 0 && importCount > 0
  const hasNoAbandonment = hasFunctions && importCount > 0

  let formation: CaravanMeasure['formation'] = 'lost'
  if (hasHighStrength && hasNoStragglers && hasNoBandits && hasProperLogistics) formation = 'grand-caravan'
  else if (hasHighStrength && hasNoStragglers) formation = 'well-organized'
  else if (hasHighStrength) formation = 'traveling-party'
  else if (hasProperFormation && hasPackAnimals) formation = 'straggling'
  else if (strength > 30) formation = 'lonely-traveler'

  return {
    strength, formation, hasHighStrength, hasProperFormation, hasPackAnimals,
    hasNoStragglers, hasProperPacing, hasNoOverloading, hasGuardDetail, hasNoBandits,
    hasProperLogistics, hasNoAbandonment, stragglerCount, banditCount,
  }
}

// ─── Oasis Measurement ──────────────────────────────────────────────────────

/** @example measureOasis(content) returns oasis analysis */
export function measureOasis(content: string): OasisMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let stability = 20
  if (hasStructure) stability += 12
  if (hasTypes) stability += 12
  if (hasFunctions) stability += 10
  if (jsdocCount > 0) stability += 8
  if (exportCount > 0) stability += 8
  if (genericsCount > 0) stability += 5
  if (importCount > 0) stability += 5
  if (anyCount === 0) stability += 5
  if (consoleCount === 0) stability += 5
  if (todoCount === 0) stability += 5
  if (deepNestedCount === 0) stability += 5
  stability = Math.min(100, Math.max(0, Math.round(stability)))

  const contaminationCount = anyCount + consoleCount + todoCount
  const quicksandCount = deepNestedCount

  const hasHighStability = stability >= 75 && hasStructure && hasTypes
  const hasFreshWater = hasFunctions && exportCount > 0
  const hasProperShade = hasStructure && hasTypes && genericsCount > 0
  const hasNoContamination = contaminationCount === 0
  const hasAbundant = hasStructure && hasTypes && hasFunctions
  const hasNoDepletion = hasFunctions && importCount > 0
  const hasProperRest = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoOvercrowding = consoleCount === 0 && deepNestedCount === 0
  const hasSafeHarbor = countTryCatch(content) > 0
  const hasNoQuicksand = quicksandCount === 0

  let condition: OasisMeasure['condition'] = 'poisoned-well'
  if (hasHighStability && hasNoContamination && hasNoQuicksand && hasAbundant) condition = 'lush-oasis'
  else if (hasHighStability && hasNoContamination) condition = 'reliable-spring'
  else if (hasHighStability) condition = 'well'
  else if (hasAbundant && hasFreshWater) condition = 'seasonal-pool'
  else if (stability > 30) condition = 'mirage'

  return {
    stability, condition, hasHighStability, hasFreshWater, hasProperShade,
    hasNoContamination, hasAbundant, hasNoDepletion, hasProperRest, hasNoOvercrowding,
    hasSafeHarbor, hasNoQuicksand, contaminationCount, quicksandCount,
  }
}

// ─── Bridge Measurement ─────────────────────────────────────────────────────

/** @example measureBridge(content) returns bridge analysis */
export function measureBridge(content: string): BridgeMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let quality = 20
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 10
  if (exportCount > 0) quality += 8
  if (importCount > 0) quality += 5
  if (genericsCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  if (deepNestedCount === 0) quality += 5
  if (privateCount === 0) quality += 3
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const crackCount = anyCount + consoleCount
  const deadEndCount = deepNestedCount + commentedCodeCount

  const hasHighQuality = quality >= 75 && hasStructure && hasTypes
  const hasProperSpan = hasFunctions && exportCount > 0
  const hasSolidFoundation = hasStructure && hasTypes && hasFunctions
  const hasNoCracks = crackCount === 0
  const hasProperLoad = hasStructure && hasTypes && genericsCount > 0
  const hasNoSagging = deepNestedCount === 0
  const hasClearPassage = consoleCount === 0 && anyCount === 0
  const hasNoTolls = consoleCount === 0 && deepNestedCount === 0
  const hasProperLighting = jsdocCount > 0 && hasFunctions
  const hasNoDeadEnd = deadEndCount === 0

  let engineering: BridgeMeasure['engineering'] = 'collapsed'
  if (hasHighQuality && hasNoCracks && hasNoDeadEnd && hasProperSpan) engineering = 'masterpiece'
  else if (hasHighQuality && hasNoCracks) engineering = 'well-engineered'
  else if (hasHighQuality) engineering = 'functional'
  else if (hasSolidFoundation && hasProperLighting) engineering = 'rickety'
  else if (quality > 30) engineering = 'dangerous'

  return {
    quality, engineering, hasHighQuality, hasProperSpan, hasSolidFoundation,
    hasNoCracks, hasProperLoad, hasNoSagging, hasClearPassage, hasNoTolls,
    hasProperLighting, hasNoDeadEnd, crackCount, deadEndCount,
  }
}

// ─── Prosperity Measurement ─────────────────────────────────────────────────

/** @example measureProsperity(content) returns prosperity analysis */
export function measureProsperity(content: string): ProsperityMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (exportCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (importCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  if (todoCount === 0) level += 5
  if (deepNestedCount === 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const debtCount = anyCount + todoCount
  const recessionCount = deepNestedCount + commentedCodeCount

  const hasHighProsperity = level >= 75 && hasStructure && hasTypes
  const hasTradeBalance = exportCount > 0 && importCount > 0
  const hasSurplus = hasFunctions && exportCount > 0
  const hasNoDebt = debtCount === 0
  const hasGrowing = hasStructure && hasTypes && genericsCount > 0
  const hasNoInflation = consoleCount === 0 && commentedCodeCount === 0
  const hasStable = hasStructure && hasTypes && jsdocCount > 0
  const hasNoRecession = recessionCount === 0
  const hasDiversified = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoCollapse = consoleCount === 0 && deepNestedCount === 0

  let wealth: ProsperityMeasure['wealth'] = 'destitute'
  if (hasHighProsperity && hasNoDebt && hasNoRecession && hasSurplus) wealth = 'golden-age'
  else if (hasHighProsperity && hasNoDebt) wealth = 'prosperous'
  else if (hasHighProsperity) wealth = 'thriving'
  else if (hasStable && hasSurplus) wealth = 'modest'
  else if (level > 30) wealth = 'struggling'

  return {
    level, wealth, hasHighProsperity, hasTradeBalance, hasSurplus, hasNoDebt,
    hasGrowing, hasNoInflation, hasStable, hasNoRecession, hasDiversified,
    hasNoCollapse, debtCount, recessionCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(stop) returns condition string */
export function classifyCondition(stop: CaravanStop): CaravanStop['condition'] {
  const { qualityScore } = stop
  if (qualityScore >= 80) return 'golden-city'
  if (qualityScore >= 65) return 'trading-post'
  if (qualityScore >= 50) return 'waystation'
  if (qualityScore >= 35) return 'outpost'
  if (qualityScore >= 20) return 'ruins'
  return 'ghost-town'
}

// ─── Stop Analysis ──────────────────────────────────────────────────────────

/** @example analyzeCaravanStop(content, filePath) returns full stop */
export function analyzeCaravanStop(content: string, filePath: string): CaravanStop {
  const trade = measureTrade(content)
  const culture = measureCulture(content)
  const caravan = measureCaravan(content)
  const oasis = measureOasis(content)
  const bridge = measureBridge(content)
  const prosperity = measureProsperity(content)

  const tradeRouteQuality = trade.quality
  const culturalRichness = culture.richness
  const caravanStrength = caravan.strength
  const oasisStability = oasis.stability
  const bridgeQuality = bridge.quality
  const mercantileProsperity = prosperity.level

  const qualityScore = Math.round(
    tradeRouteQuality * 0.15 +
    culturalRichness * 0.15 +
    caravanStrength * 0.15 +
    oasisStability * 0.2 +
    bridgeQuality * 0.15 +
    mercantileProsperity * 0.2,
  )

  const result: CaravanStop = {
    file: filePath,
    tradeRouteQuality, culturalRichness, caravanStrength,
    oasisStability, bridgeQuality, mercantileProsperity,
    trade, culture, caravan, oasis, bridge, prosperity,
    condition: 'ghost-town',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Route Analysis ─────────────────────────────────────────────────────────

/** @example analyzeTradeRoute(stops, dirPath) returns route */
export function analyzeTradeRoute(stops: CaravanStop[], dirPath: string): TradeRoute {
  if (stops.length === 0) {
    return {
      directory: dirPath, stops: [], avgTrade: 0, avgCulture: 0, avgProsperity: 0,
      goldenCount: 0, ghostCount: 0, cosmopolitanCount: 0, prosperousCount: 0,
      routeType: 'wilderness', condition: 'lost',
    }
  }

  const avgTrade = Math.round(stops.reduce((s, l) => s + l.tradeRouteQuality, 0) / stops.length)
  const avgCulture = Math.round(stops.reduce((s, l) => s + l.culturalRichness, 0) / stops.length)
  const avgProsperity = Math.round(stops.reduce((s, l) => s + l.mercantileProsperity, 0) / stops.length)

  const goldenCount = stops.filter((s) => s.condition === 'golden-city').length
  const ghostCount = stops.filter((s) => s.condition === 'ghost-town').length
  const cosmopolitanCount = stops.filter((s) => s.culture.influence === 'cosmopolitan').length
  const prosperousCount = stops.filter((s) => s.prosperity.wealth === 'golden-age').length

  const routeType = classifyRouteType(stops)
  const avgScore = stops.reduce((s, l) => s + l.qualityScore, 0) / stops.length
  const condition = classifyRouteCondition(avgScore)

  return {
    directory: dirPath, stops, avgTrade, avgCulture, avgProsperity,
    goldenCount, ghostCount, cosmopolitanCount, prosperousCount,
    routeType, condition,
  }
}

// ─── Route Classification ───────────────────────────────────────────────────

/** @example classifyRouteType(stops) returns route type */
export function classifyRouteType(stops: CaravanStop[]): TradeRoute['routeType'] {
  if (stops.length === 0) return 'wilderness'
  const avgScore = stops.reduce((s, l) => s + l.qualityScore, 0) / stops.length
  const goldenCnt = stops.filter((l) => l.condition === 'golden-city').length
  if (avgScore >= 75 && goldenCnt >= Math.ceil(stops.length * 0.3)) return 'imperial-network'
  if (avgScore >= 60) return 'major-route'
  if (avgScore >= 45) return 'regional-path'
  if (avgScore >= 30) return 'local-road'
  if (avgScore >= 15) return 'trail'
  return 'wilderness'
}

/** @example classifyRouteCondition(avgScore) returns condition */
export function classifyRouteCondition(avgScore: number): TradeRoute['condition'] {
  if (avgScore >= 80) return 'golden-age'
  if (avgScore >= 65) return 'prosperous-era'
  if (avgScore >= 50) return 'stable-trade'
  if (avgScore >= 35) return 'declining'
  if (avgScore >= 20) return 'abandoned'
  return 'lost'
}

/** @example classifyMerchantGrade(avgProsperity) returns grade */
export function classifyMerchantGrade(avgProsperity: number): SilkRoadResult['stats']['merchantGrade'] {
  if (avgProsperity >= 80) return 'grand-merchant'
  if (avgProsperity >= 65) return 'master-trader'
  if (avgProsperity >= 50) return 'merchant'
  if (avgProsperity >= 35) return 'peddler'
  if (avgProsperity >= 20) return 'beggar'
  return 'bandit'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(stops, routes, network, stats) returns recommendations */
export function generateRecommendations(
  stops: CaravanStop[],
  routes: TradeRoute[],
  network: SilkRoadResult['network'],
  stats: SilkRoadResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgTradeRouteQuality < 50) recs.push('Improve trade route quality — strengthen code connections')
  if (stats.avgCulturalRichness < 50) recs.push('Enrich cultural diversity — expand code pattern variety')
  if (stats.avgCaravanStrength < 50) recs.push('Strengthen caravan formation — improve module cohesion')
  if (stats.avgOasisStability < 50) recs.push('Stabilize oasis reliability — improve dependency health')
  if (stats.avgBridgeQuality < 50) recs.push('Reinforce bridge engineering — improve API design')
  if (stats.avgMercantileProsperity < 50) recs.push('Boost mercantile prosperity — improve overall code health')
  if (stats.ghostTownCount > stops.length * 0.5) recs.push('Too many ghost towns — over half the codebase is lifeless')
  if (stats.hasHighProsperityCount === 0) recs.push('No prosperous stops found — cultivate your code with patience')
  if (routes.length > 0 && network.overallProsperity < 60) recs.push('Overall prosperity is low — consult the grand merchant')
  if (recs.length === 0) recs.push('Golden city achieved — your silk road spans the known world')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildSilkRoadResult(files, contents, options) returns full result */
export function buildSilkRoadResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): SilkRoadResult {
  const stops: CaravanStop[] = files.map((file, i) =>
    analyzeCaravanStop(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CaravanStop[]>()
  for (const stop of stops) {
    const dir = stop.file.includes('/')
      ? stop.file.substring(0, stop.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(stop)
    } else {
      dirMap.set(dir, [stop])
    }
  }

  const routes: TradeRoute[] = Array.from(dirMap.entries()).map(([dir, dirStops]) =>
    analyzeTradeRoute(dirStops, dir),
  )

  const avgTrade = stops.length > 0
    ? Math.round(stops.reduce((s, l) => s + l.tradeRouteQuality, 0) / stops.length)
    : 0
  const avgCulture = stops.length > 0
    ? Math.round(stops.reduce((s, l) => s + l.culturalRichness, 0) / stops.length)
    : 0
  const avgProsperity = stops.length > 0
    ? Math.round(stops.reduce((s, l) => s + l.mercantileProsperity, 0) / stops.length)
    : 0
  const overallProsperity = stops.length > 0
    ? Math.round(stops.reduce((s, l) => s + l.qualityScore, 0) / stops.length)
    : 0
  const isProsperous = overallProsperity >= 65

  const network: SilkRoadResult['network'] = {
    avgTrade, avgCulture, avgProsperity, isProsperous, overallProsperity,
  }

  const avgTradeRouteQuality = avgTrade
  const avgCulturalRichness = avgCulture
  const avgCaravanStrength = stops.length > 0
    ? Math.round(stops.reduce((s, l) => s + l.caravanStrength, 0) / stops.length)
    : 0
  const avgOasisStability = stops.length > 0
    ? Math.round(stops.reduce((s, l) => s + l.oasisStability, 0) / stops.length)
    : 0
  const avgBridgeQuality = stops.length > 0
    ? Math.round(stops.reduce((s, l) => s + l.bridgeQuality, 0) / stops.length)
    : 0
  const avgMercantileProsperity = avgProsperity

  const conditionCounts = {
    goldenCity: 0, tradingPost: 0, waystation: 0,
    outpost: 0, ruins: 0, ghostTown: 0,
  }
  for (const s of stops) {
    switch (s.condition) {
      case 'golden-city': conditionCounts.goldenCity++; break
      case 'trading-post': conditionCounts.tradingPost++; break
      case 'waystation': conditionCounts.waystation++; break
      case 'outpost': conditionCounts.outpost++; break
      case 'ruins': conditionCounts.ruins++; break
      case 'ghost-town': conditionCounts.ghostTown++; break
    }
  }

  const hasHighTradeCount = stops.filter((s) => s.trade.hasHighQuality).length
  const hasRichCultureCount = stops.filter((s) => s.culture.hasRichCulture).length
  const hasHighStrengthCount = stops.filter((s) => s.caravan.hasHighStrength).length
  const hasHighStabilityCount = stops.filter((s) => s.oasis.hasHighStability).length
  const hasHighBridgeCount = stops.filter((s) => s.bridge.hasHighQuality).length
  const hasHighProsperityCount = stops.filter((s) => s.prosperity.hasHighProsperity).length

  const bestStop = stops.length > 0
    ? stops.reduce((best, s) => s.qualityScore > best.qualityScore ? s : best).file
    : ''
  const bestConnected = stops.length > 0
    ? stops.reduce((best, s) => s.tradeRouteQuality > best.tradeRouteQuality ? s : best).file
    : ''
  const mostDiverse = stops.length > 0
    ? stops.reduce((best, s) => s.culturalRichness > best.culturalRichness ? s : best).file
    : ''
  const mostCohesive = stops.length > 0
    ? stops.reduce((best, s) => s.caravanStrength > best.caravanStrength ? s : best).file
    : ''
  const mostStable = stops.length > 0
    ? stops.reduce((best, s) => s.oasisStability > best.oasisStability ? s : best).file
    : ''
  const bestAPI = stops.length > 0
    ? stops.reduce((best, s) => s.bridgeQuality > best.bridgeQuality ? s : best).file
    : ''

  const merchantGrade = classifyMerchantGrade(overallProsperity)

  const stats: SilkRoadResult['stats'] = {
    totalFiles: files.length, totalRoutes: routes.length,
    avgTradeRouteQuality, avgCulturalRichness, avgCaravanStrength,
    avgOasisStability, avgBridgeQuality, avgMercantileProsperity,
    goldenCityCount: conditionCounts.goldenCity,
    tradingPostCount: conditionCounts.tradingPost,
    waystationCount: conditionCounts.waystation,
    outpostCount: conditionCounts.outpost,
    ruinsCount: conditionCounts.ruins,
    ghostTownCount: conditionCounts.ghostTown,
    hasHighTradeCount, hasRichCultureCount, hasHighStrengthCount,
    hasHighStabilityCount, hasHighBridgeCount, hasHighProsperityCount,
    overallProsperity, merchantGrade,
    bestStop, bestConnected, mostDiverse, mostCohesive, mostStable, bestAPI,
  }

  const recommendations = generateRecommendations(stops, routes, network, stats)

  return { stops, routes, network, stats, recommendations }
}
