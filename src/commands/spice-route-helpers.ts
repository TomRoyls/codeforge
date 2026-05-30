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
const PROTECTED_REGEX = /protected\s+/g
const STATIC_REGEX = /\bstatic\s+/g
const READONLY_REGEX = /\breadonly\b/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const CONDITIONAL_REGEX = /\bif\s*\(/g
const LOOP_REGEX = /\b(for|while|do)\s*[\({]/g
const PROMISE_REGEX = /\bPromise\b/g
const STRING_TEMPLATE_REGEX = /`[^`]*\$\{/g
const DESTRUCTURE_REGEX = /\{[^}]*\}\s*=/g

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
function countEnumKeywords(content: string): number { return countMatches(content, ENUM_REGEX) }
function countFunctionKeywords(content: string): number { return countMatches(content, FUNCTION_REGEX) }
function countArrowFunctions(content: string): number { return countMatches(content, ARROW_REGEX) }
function countJSDocBlocks(content: string): number { return countMatches(content, JSDOC_REGEX) }
function countAsyncKeywords(content: string): number { return countMatches(content, ASYNC_REGEX) }
function countTryCatch(content: string): number { return countMatches(content, TRY_CATCH_REGEX) }
function countDeepNested(content: string): number { return countMatches(content, DEEP_NESTED_REGEX) }
function countConsoleUsage(content: string): number { return countMatches(content, CONSOLE_REGEX) }
function countTodoComments(content: string): number { return countMatches(content, TODO_REGEX) }
function countGenericsUsage(content: string): number { return countMatches(content, GENERICS_REGEX) }
function countPrivateMembers(content: string): number { return countMatches(content, PRIVATE_REGEX) }
function countProtectedMembers(content: string): number { return countMatches(content, PROTECTED_REGEX) }
function countStaticMembers(content: string): number { return countMatches(content, STATIC_REGEX) }
function countReadonlyMembers(content: string): number { return countMatches(content, READONLY_REGEX) }
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }
function countReExports(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function countConditionals(content: string): number { return countMatches(content, CONDITIONAL_REGEX) }
function countLoops(content: string): number { return countMatches(content, LOOP_REGEX) }
function countPromiseUsage(content: string): number { return countMatches(content, PROMISE_REGEX) }
function countTemplateLiterals(content: string): number { return countMatches(content, STRING_TEMPLATE_REGEX) }
function countDestructures(content: string): number { return countMatches(content, DESTRUCTURE_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface RouteMeasure {
  clarity: number
  type: 'silk-road' | 'maritime' | 'incense-trail' | 'amber-road' | 'salt-route' | 'no-path'
  hasClearFlow: boolean
  hasProperDirection: boolean
  hasNoDeadEnds: boolean
  hasNoBanditZones: boolean
  hasProperSignage: boolean
  hasRestStops: boolean
  hasNoDetours: boolean
  hasProperGrading: boolean
  hasCaravanCapacity: boolean
  hasNoTollPoints: boolean
  deadEndCount: number
  tollPointCount: number
}

export interface CargoMeasure {
  value: number
  type: 'saffron' | 'cinnamon' | 'pepper' | 'nutmeg' | 'cardamom' | 'sawdust'
  hasHighValue: boolean
  isProperlyPackaged: boolean
  hasNoContamination: boolean
  hasProperPreservation: boolean
  hasTradeSecret: boolean
  hasNoSpoilage: boolean
  hasProperWeight: boolean
  hasNoContraband: boolean
  hasProperLabeling: boolean
  hasBulkGoods: boolean
  contaminationCount: number
  contrabandCount: number
}

export interface WaypointMeasure {
  quality: number
  type: 'caravanserai' | 'trading-post' | 'customs-house' | 'toll-booth' | 'bandit-camp' | 'ruins'
  hasQualityControl: boolean
  hasProperInspection: boolean
  hasTestingStation: boolean
  hasValidationGate: boolean
  hasNoCorruptOfficials: boolean
  hasProperDocumentation: boolean
  hasRestFacility: boolean
  hasSupplyDepot: boolean
  hasNoBlockage: boolean
  hasProperSecurity: boolean
  hasCommunicationPost: boolean
  corruptCount: number
  blockageCount: number
}

export interface EfficiencyMeasure {
  level: number
  mode: 'clipper-ship' | 'caravan' | 'galley' | 'cart' | 'portage' | 'abandoned'
  hasHighEfficiency: boolean
  hasProperVelocity: boolean
  hasNoWaste: boolean
  hasProperLoading: boolean
  hasNoOverloading: boolean
  hasOptimalPath: boolean
  hasNoReturnTrips: boolean
  hasWindAssistance: boolean
  hasNoStorms: boolean
  hasProperNavigation: boolean
  wasteCount: number
  stormCount: number
}

export interface ExchangeMeasure {
  level: number
  culture: 'cosmopolitan' | 'multilingual' | 'bilingual' | 'dialect' | 'isolated' | 'xenophobic'
  hasCulturalExchange: boolean
  hasMultiFormat: boolean
  hasProperInterface: boolean
  hasTranslation: boolean
  hasNoTradeBarrier: boolean
  hasCommonCurrency: boolean
  hasNoCulturalImposition: boolean
  hasDiplomaticRelations: boolean
  hasNoEmbargo: boolean
  hasKnowledgeTransfer: boolean
  barrierCount: number
  embargoCount: number
}

export interface JourneyMeasure {
  success: number
  status: 'arrived-wealthy' | 'successful-trade' | 'broke-even' | 'partial-loss' | 'shipwrecked' | 'never-left'
  isSuccessful: boolean
  hasCompleteJourney: boolean
  hasNoLosses: boolean
  hasProperReturn: boolean
  hasNavigationLog: boolean
  hasNoPirates: boolean
  hasTreasure: boolean
  hasProperMaps: boolean
  hasNoDesertion: boolean
  hasLegacy: boolean
  pirateCount: number
  desertionCount: number
}

export interface TradeRoute {
  file: string
  routeClarity: number
  cargoValue: number
  waypointQuality: number
  tradeEfficiency: number
  culturalExchange: number
  journeySuccess: number
  route: RouteMeasure
  cargo: CargoMeasure
  waypoint: WaypointMeasure
  efficiency: EfficiencyMeasure
  exchange: ExchangeMeasure
  journey: JourneyMeasure
  condition: 'golden-age' | 'prosperous' | 'thriving' | 'surviving' | 'struggling' | 'collapsed'
  qualityScore: number
}

export interface RouteNetwork {
  directory: string
  routes: TradeRoute[]
  avgClarity: number
  avgEfficiency: number
  avgSuccess: number
  goldenAgeCount: number
  collapsedCount: number
  clearFlowCount: number
  successfulCount: number
  networkType: 'grand-trunk' | 'maritime-network' | 'silk-network' | 'regional-trade' | 'local-market' | 'dead-end'
  condition: 'global-emporium' | 'trading-bloc' | 'merchant-guild' | 'village-market' | 'barter-system' | 'subsistence'
}

export interface SpiceRouteResult {
  routes: TradeRoute[]
  networks: RouteNetwork[]
  world: {
    avgClarity: number
    avgEfficiency: number
    avgSuccess: number
    isProsperous: boolean
    overallProsperity: number
  }
  stats: {
    totalFiles: number
    totalNetworks: number
    avgRouteClarity: number
    avgCargoValue: number
    avgWaypointQuality: number
    avgTradeEfficiency: number
    avgCulturalExchange: number
    avgJourneySuccess: number
    goldenAgeCount: number
    prosperousCount: number
    thrivingCount: number
    survivingCount: number
    strugglingCount: number
    collapsedCount: number
    hasClearFlowCount: number
    hasHighValueCount: number
    hasQualityControlCount: number
    hasHighEfficiencyCount: number
    hasCulturalExchangeCount: number
    isSuccessfulCount: number
    overallProsperity: number
    merchantGrade: 'grand-merchant' | 'master-trader' | 'merchant' | 'peddler' | 'hawker' | 'beggar'
    bestRoute: string
    clearest: string
    mostValuable: string
    bestWaypoints: string
    mostEfficient: string
    mostExchanged: string
  }
  recommendations: string[]
}

// ─── Route Measurement ──────────────────────────────────────────────────────

/** @example measureRoute(content) returns route analysis */
export function measureRoute(content: string): RouteMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const jsdocCount = countJSDocBlocks(content)
  const asyncCount = countAsyncKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)
  const tryCatchCount = countTryCatch(content)
  const promiseCount = countPromiseUsage(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let clarity = 25
  if (hasStructure) clarity += 15
  if (hasTypes) clarity += 15
  if (hasFunctions) clarity += 10
  if (exportCount > 0) clarity += 5
  if (importCount > 0) clarity += 5
  if (jsdocCount > 0) clarity += 8
  if (asyncCount > 0) clarity += 5
  if (consoleCount === 0) clarity += 5
  if (anyCount === 0) clarity += 4
  if (todoCount === 0) clarity += 3
  clarity = Math.min(100, Math.max(0, Math.round(clarity)))

  const deadEndCount = todoCount + commentedCodeCount
  const tollPointCount = consoleCount + anyCount

  const hasClearFlow = clarity >= 80 && hasStructure && hasTypes
  const hasProperDirection = hasStructure && hasTypes && hasFunctions
  const hasNoDeadEnds = deadEndCount === 0
  const hasNoBanditZones = deepNestedCount === 0
  const hasProperSignage = jsdocCount > 0
  const hasRestStops = tryCatchCount > 0
  const hasNoDetours = deepNestedCount === 0
  const hasProperGrading = hasStructure && hasTypes && hasFunctions
  const hasCaravanCapacity = hasFunctions && (asyncCount > 0 || promiseCount > 0)
  const hasNoTollPoints = tollPointCount === 0

  let type: RouteMeasure['type'] = 'no-path'
  if (hasClearFlow && hasNoDeadEnds && hasNoBanditZones) type = 'silk-road'
  else if (hasClearFlow && hasNoDeadEnds) type = 'maritime'
  else if (hasClearFlow) type = 'incense-trail'
  else if (hasProperDirection) type = 'amber-road'
  else if (clarity > 30) type = 'salt-route'

  return {
    clarity,
    type,
    hasClearFlow,
    hasProperDirection,
    hasNoDeadEnds,
    hasNoBanditZones,
    hasProperSignage,
    hasRestStops,
    hasNoDetours,
    hasProperGrading,
    hasCaravanCapacity,
    hasNoTollPoints,
    deadEndCount,
    tollPointCount,
  }
}

// ─── Cargo Measurement ──────────────────────────────────────────────────────

/** @example measureCargo(content) returns cargo analysis */
export function measureCargo(content: string): CargoMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const readonlyCount = countReadonlyMembers(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const staticCount = countStaticMembers(content)
  const asyncCount = countAsyncKeywords(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const enumCount = countEnumKeywords(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let value = 20
  if (hasStructure) value += 12
  if (hasTypes) value += 12
  if (enumCount > 0) value += 5
  if (hasFunctions) value += 10
  if (jsdocCount > 0) value += 8
  if (genericsCount > 0) value += 5
  if (exportCount > 0) value += 5
  if (importCount > 0) value += 5
  if (readonlyCount > 0) value += 3
  if (privateCount > 0 || protectedCount > 0) value += 3
  if (staticCount > 0) value += 2
  if (asyncCount > 0) value += 3
  if (anyCount === 0) value += 3
  if (consoleCount === 0) value += 3
  value = Math.min(100, Math.max(0, Math.round(value)))

  const contaminationCount = anyCount + consoleCount
  const contrabandCount = todoCount

  const hasHighValue = value >= 80 && hasStructure && hasTypes
  const isProperlyPackaged = hasStructure && exportCount > 0
  const hasNoContamination = contaminationCount === 0
  const hasProperPreservation = hasStructure && hasTypes && anyCount === 0
  const hasTradeSecret = hasStructure && hasTypes && genericsCount > 0
  const hasNoSpoilage = todoCount === 0
  const hasProperWeight = hasStructure && hasTypes && hasFunctions
  const hasNoContraband = contrabandCount === 0
  const hasProperLabeling = jsdocCount > 0 && exportCount > 0
  const hasBulkGoods = hasFunctions && exportCount > 0

  let type: CargoMeasure['type'] = 'sawdust'
  if (hasHighValue && hasTradeSecret && hasNoContamination) type = 'saffron'
  else if (hasHighValue && hasTradeSecret) type = 'cinnamon'
  else if (hasHighValue) type = 'pepper'
  else if (hasStructure && hasTypes && hasFunctions) type = 'nutmeg'
  else if (hasStructure && hasTypes) type = 'cardamom'

  return {
    value,
    type,
    hasHighValue,
    isProperlyPackaged,
    hasNoContamination,
    hasProperPreservation,
    hasTradeSecret,
    hasNoSpoilage,
    hasProperWeight,
    hasNoContraband,
    hasProperLabeling,
    hasBulkGoods,
    contaminationCount,
    contrabandCount,
  }
}

// ─── Waypoint Measurement ───────────────────────────────────────────────────

/** @example measureWaypoint(content) returns waypoint analysis */
export function measureWaypoint(content: string): WaypointMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const asyncCount = countAsyncKeywords(content)
  const conditionalsCount = countConditionals(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let quality = 25
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 8
  if (genericsCount > 0) quality += 5
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (tryCatchCount > 0) quality += 5
  if (asyncCount > 0) quality += 3
  if (conditionalsCount > 0) quality += 3
  if (consoleCount === 0) quality += 3
  if (anyCount === 0) quality += 4
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const corruptCount = anyCount + consoleCount
  const blockageCount = todoCount + deepNestedCount

  const hasQualityControl = quality >= 75 && hasStructure && hasTypes
  const hasProperInspection = hasStructure && hasTypes && hasFunctions
  const hasTestingStation = tryCatchCount > 0
  const hasValidationGate = conditionalsCount > 0
  const hasNoCorruptOfficials = corruptCount === 0
  const hasProperDocumentation = jsdocCount > 0
  const hasRestFacility = tryCatchCount > 0
  const hasSupplyDepot = hasStructure && hasTypes && exportCount > 0
  const hasNoBlockage = blockageCount === 0
  const hasProperSecurity = privateCount > 0 || protectedCount > 0
  const hasCommunicationPost = consoleCount === 0 && jsdocCount > 0

  let type: WaypointMeasure['type'] = 'ruins'
  if (hasQualityControl && hasNoCorruptOfficials && hasNoBlockage) type = 'caravanserai'
  else if (hasQualityControl && hasNoCorruptOfficials) type = 'trading-post'
  else if (hasQualityControl) type = 'customs-house'
  else if (hasProperInspection) type = 'toll-booth'
  else if (quality > 30) type = 'bandit-camp'

  return {
    quality,
    type,
    hasQualityControl,
    hasProperInspection,
    hasTestingStation,
    hasValidationGate,
    hasNoCorruptOfficials,
    hasProperDocumentation,
    hasRestFacility,
    hasSupplyDepot,
    hasNoBlockage,
    hasProperSecurity,
    hasCommunicationPost,
    corruptCount,
    blockageCount,
  }
}

// ─── Efficiency Measurement ─────────────────────────────────────────────────

/** @example measureEfficiency(content) returns efficiency analysis */
export function measureEfficiency(content: string): EfficiencyMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const reExportCount = countReExports(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const conditionalsCount = countConditionals(content)
  const loopsCount = countLoops(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 25
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (reExportCount > 0) level += 5
  if (asyncCount > 0) level += 3
  if (tryCatchCount > 0) level += 5
  if (conditionalsCount > 0) level += 3
  if (loopsCount > 0) level += 2
  if (anyCount === 0) level += 3
  if (consoleCount === 0) level += 2
  level = Math.min(100, Math.max(0, Math.round(level)))

  const wasteCount = todoCount + deepNestedCount
  const stormCount = anyCount + consoleCount

  const hasHighEfficiency = level >= 75 && hasStructure && hasTypes
  const hasProperVelocity = hasFunctions && (asyncCount > 0 || genericsCount > 0)
  const hasNoWaste = wasteCount === 0
  const hasProperLoading = hasStructure && hasTypes && exportCount > 0
  const hasNoOverloading = deepNestedCount === 0
  const hasOptimalPath = hasStructure && hasTypes && hasFunctions && anyCount === 0
  const hasNoReturnTrips = reExportCount > 0 || (exportCount > 0 && importCount > 0)
  const hasWindAssistance = asyncCount > 0 && tryCatchCount > 0
  const hasNoStorms = stormCount === 0
  const hasProperNavigation = hasStructure && hasTypes && tryCatchCount > 0

  let mode: EfficiencyMeasure['mode'] = 'abandoned'
  if (hasHighEfficiency && hasOptimalPath && hasNoWaste) mode = 'clipper-ship'
  else if (hasHighEfficiency && hasOptimalPath) mode = 'caravan'
  else if (hasHighEfficiency) mode = 'galley'
  else if (hasProperLoading) mode = 'cart'
  else if (level > 30) mode = 'portage'

  return {
    level,
    mode,
    hasHighEfficiency,
    hasProperVelocity,
    hasNoWaste,
    hasProperLoading,
    hasNoOverloading,
    hasOptimalPath,
    hasNoReturnTrips,
    hasWindAssistance,
    hasNoStorms,
    hasProperNavigation,
    wasteCount,
    stormCount,
  }
}

// ─── Exchange Measurement ───────────────────────────────────────────────────

/** @example measureExchange(content) returns exchange analysis */
export function measureExchange(content: string): ExchangeMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const asyncCount = countAsyncKeywords(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const reExportCount = countReExports(content)
  const readonlyCount = countReadonlyMembers(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const destructures = countDestructures(content)
  const templateLiterals = countTemplateLiterals(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 5
  if (genericsCount > 0) level += 5
  if (asyncCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (reExportCount > 0) level += 5
  if (readonlyCount > 0) level += 3
  if (destructures > 0) level += 3
  if (templateLiterals > 0) level += 3
  if (anyCount === 0) level += 3
  if (consoleCount === 0) level += 4
  level = Math.min(100, Math.max(0, Math.round(level)))

  const barrierCount = anyCount + consoleCount
  const embargoCount = anyCount

  const hasCulturalExchange = level >= 75 && hasStructure && hasTypes
  const hasMultiFormat = genericsCount > 0 && (destructures > 0 || templateLiterals > 0)
  const hasProperInterface = hasStructure && hasTypes && exportCount > 0
  const hasTranslation = destructures > 0 || templateLiterals > 0
  const hasNoTradeBarrier = barrierCount === 0
  const hasCommonCurrency = exportCount > 0 && importCount > 0
  const hasNoCulturalImposition = anyCount === 0
  const hasDiplomaticRelations = importCount > 0 && exportCount > 0
  const hasNoEmbargo = embargoCount === 0
  const hasKnowledgeTransfer = reExportCount > 0 || (exportCount > 0 && importCount > 0)

  let culture: ExchangeMeasure['culture'] = 'xenophobic'
  if (hasCulturalExchange && hasMultiFormat && hasNoTradeBarrier && hasDiplomaticRelations) culture = 'cosmopolitan'
  else if (hasCulturalExchange && hasMultiFormat && hasNoTradeBarrier) culture = 'multilingual'
  else if (hasCulturalExchange && hasMultiFormat) culture = 'bilingual'
  else if (hasCulturalExchange) culture = 'dialect'
  else if (hasProperInterface) culture = 'isolated'

  return {
    level,
    culture,
    hasCulturalExchange,
    hasMultiFormat,
    hasProperInterface,
    hasTranslation,
    hasNoTradeBarrier,
    hasCommonCurrency,
    hasNoCulturalImposition,
    hasDiplomaticRelations,
    hasNoEmbargo,
    hasKnowledgeTransfer,
    barrierCount,
    embargoCount,
  }
}

// ─── Journey Measurement ────────────────────────────────────────────────────

/** @example measureJourney(content) returns journey analysis */
export function measureJourney(content: string): JourneyMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const staticCount = countStaticMembers(content)
  const readonlyCount = countReadonlyMembers(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let success = 20
  if (hasStructure) success += 12
  if (hasTypes) success += 12
  if (enumCount > 0) success += 5
  if (hasFunctions) success += 10
  if (jsdocCount > 0) success += 8
  if (genericsCount > 0) success += 5
  if (asyncCount > 0) success += 5
  if (tryCatchCount > 0) success += 5
  if (exportCount > 0) success += 5
  if (importCount > 0) success += 5
  if (privateCount > 0 || protectedCount > 0) success += 3
  if (staticCount > 0) success += 3
  if (readonlyCount > 0) success += 2
  if (anyCount === 0) success += 3
  if (consoleCount === 0) success += 3
  success = Math.min(100, Math.max(0, Math.round(success)))

  const pirateCount = consoleCount + deepNestedCount
  const desertionCount = todoCount + commentedCodeCount

  const isSuccessful = success >= 80 && anyCount === 0 && todoCount === 0
  const hasCompleteJourney = hasStructure && hasTypes && hasFunctions && exportCount > 0
  const hasNoLosses = desertionCount === 0
  const hasProperReturn = hasStructure && hasTypes && hasFunctions
  const hasNavigationLog = jsdocCount > 0
  const hasNoPirates = pirateCount === 0
  const hasTreasure = hasStructure && hasTypes && genericsCount > 0 && jsdocCount > 0
  const hasProperMaps = jsdocCount > 0 && exportCount > 0
  const hasNoDesertion = desertionCount === 0
  const hasLegacy = isSuccessful && hasTreasure

  let status: JourneyMeasure['status'] = 'never-left'
  if (isSuccessful && hasCompleteJourney && hasNoPirates && hasLegacy) status = 'arrived-wealthy'
  else if (isSuccessful && hasCompleteJourney && hasNoPirates) status = 'successful-trade'
  else if (isSuccessful && hasCompleteJourney) status = 'broke-even'
  else if (hasCompleteJourney) status = 'partial-loss'
  else if (success > 30) status = 'shipwrecked'

  return {
    success,
    status,
    isSuccessful,
    hasCompleteJourney,
    hasNoLosses,
    hasProperReturn,
    hasNavigationLog,
    hasNoPirates,
    hasTreasure,
    hasProperMaps,
    hasNoDesertion,
    hasLegacy,
    pirateCount,
    desertionCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(route) returns condition string */
export function classifyCondition(route: TradeRoute): TradeRoute['condition'] {
  const { qualityScore } = route
  if (qualityScore >= 80) return 'golden-age'
  if (qualityScore >= 65) return 'prosperous'
  if (qualityScore >= 50) return 'thriving'
  if (qualityScore >= 35) return 'surviving'
  if (qualityScore >= 20) return 'struggling'
  return 'collapsed'
}

// ─── Route Analysis ─────────────────────────────────────────────────────────

/** @example analyzeTradeRoute(content, filePath) returns full route */
export function analyzeTradeRoute(content: string, filePath: string): TradeRoute {
  const route = measureRoute(content)
  const cargo = measureCargo(content)
  const waypoint = measureWaypoint(content)
  const efficiency = measureEfficiency(content)
  const exchange = measureExchange(content)
  const journey = measureJourney(content)

  const routeClarity = route.clarity
  const cargoValue = cargo.value
  const waypointQuality = waypoint.quality
  const tradeEfficiency = efficiency.level
  const culturalExchange = exchange.level
  const journeySuccess = journey.success

  const qualityScore = Math.round(
    routeClarity * 0.15 +
    cargoValue * 0.15 +
    waypointQuality * 0.2 +
    tradeEfficiency * 0.15 +
    culturalExchange * 0.15 +
    journeySuccess * 0.2,
  )

  const tradeRoute: TradeRoute = {
    file: filePath,
    routeClarity,
    cargoValue,
    waypointQuality,
    tradeEfficiency,
    culturalExchange,
    journeySuccess,
    route,
    cargo,
    waypoint,
    efficiency,
    exchange,
    journey,
    condition: 'collapsed',
    qualityScore,
  }

  tradeRoute.condition = classifyCondition(tradeRoute)

  return tradeRoute
}

// ─── Network Analysis ───────────────────────────────────────────────────────

/** @example analyzeRouteNetwork(routes, dirPath) returns network */
export function analyzeRouteNetwork(routes: TradeRoute[], dirPath: string): RouteNetwork {
  if (routes.length === 0) {
    return {
      directory: dirPath,
      routes: [],
      avgClarity: 0,
      avgEfficiency: 0,
      avgSuccess: 0,
      goldenAgeCount: 0,
      collapsedCount: 0,
      clearFlowCount: 0,
      successfulCount: 0,
      networkType: 'dead-end',
      condition: 'subsistence',
    }
  }

  const avgClarity = Math.round(routes.reduce((s, r) => s + r.routeClarity, 0) / routes.length)
  const avgEfficiency = Math.round(routes.reduce((s, r) => s + r.tradeEfficiency, 0) / routes.length)
  const avgSuccess = Math.round(routes.reduce((s, r) => s + r.journeySuccess, 0) / routes.length)

  const goldenAgeCount = routes.filter((r) => r.condition === 'golden-age').length
  const collapsedCount = routes.filter((r) => r.condition === 'collapsed').length
  const clearFlowCount = routes.filter((r) => r.route.hasClearFlow).length
  const successfulCount = routes.filter((r) => r.journey.isSuccessful).length

  const networkType = classifyNetworkType(routes)
  const avgQuality = routes.reduce((s, r) => s + r.qualityScore, 0) / routes.length
  const condition = classifyNetworkCondition(avgQuality)

  return {
    directory: dirPath,
    routes,
    avgClarity,
    avgEfficiency,
    avgSuccess,
    goldenAgeCount,
    collapsedCount,
    clearFlowCount,
    successfulCount,
    networkType,
    condition,
  }
}

// ─── Network Classification ────────────────────────────────────────────────

/** @example classifyNetworkType(routes) returns network type */
export function classifyNetworkType(routes: TradeRoute[]): RouteNetwork['networkType'] {
  if (routes.length === 0) return 'dead-end'
  const avgQuality = routes.reduce((s, r) => s + r.qualityScore, 0) / routes.length
  const goldenCount = routes.filter((r) => r.condition === 'golden-age').length
  if (avgQuality >= 75 && goldenCount >= Math.ceil(routes.length * 0.3)) return 'grand-trunk'
  if (avgQuality >= 60) return 'maritime-network'
  if (avgQuality >= 45) return 'silk-network'
  if (avgQuality >= 30) return 'regional-trade'
  if (avgQuality >= 15) return 'local-market'
  return 'dead-end'
}

/** @example classifyNetworkCondition(avgQuality) returns condition */
export function classifyNetworkCondition(avgQuality: number): RouteNetwork['condition'] {
  if (avgQuality >= 80) return 'global-emporium'
  if (avgQuality >= 65) return 'trading-bloc'
  if (avgQuality >= 50) return 'merchant-guild'
  if (avgQuality >= 35) return 'village-market'
  if (avgQuality >= 20) return 'barter-system'
  return 'subsistence'
}

/** @example classifyMerchantGrade(avgProsperity) returns grade */
export function classifyMerchantGrade(avgProsperity: number): SpiceRouteResult['stats']['merchantGrade'] {
  if (avgProsperity >= 80) return 'grand-merchant'
  if (avgProsperity >= 65) return 'master-trader'
  if (avgProsperity >= 50) return 'merchant'
  if (avgProsperity >= 35) return 'peddler'
  if (avgProsperity >= 20) return 'hawker'
  return 'beggar'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(routes, networks, world, stats) returns recommendations */
export function generateRecommendations(
  routes: TradeRoute[],
  networks: RouteNetwork[],
  world: SpiceRouteResult['world'],
  stats: SpiceRouteResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgRouteClarity < 50) {
    recs.push('Improve route clarity — build clearer code flow and structure')
  }
  if (stats.avgCargoValue < 50) {
    recs.push('Increase cargo value — add more valuable code patterns and exports')
  }
  if (stats.avgWaypointQuality < 50) {
    recs.push('Upgrade waypoint quality — add quality checks and error handling')
  }
  if (stats.avgTradeEfficiency < 50) {
    recs.push('Boost trade efficiency — optimize code performance and reduce waste')
  }
  if (stats.avgCulturalExchange < 50) {
    recs.push('Enhance cultural exchange — improve code interoperability and interfaces')
  }
  if (stats.avgJourneySuccess < 50) {
    recs.push('Improve journey success — strengthen overall code quality')
  }
  if (stats.collapsedCount > routes.length * 0.5) {
    recs.push('Too many collapsed routes — over half the codebase is poor quality')
  }
  if (stats.isSuccessfulCount === 0) {
    recs.push('No successful journeys found — strive for higher code quality')
  }
  if (networks.length > 0 && world.overallProsperity < 60) {
    recs.push('Overall prosperity is low — systematic improvement recommended')
  }
  if (recs.length === 0) {
    recs.push('Golden age of trade — your code routes are prosperously connecting value')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildSpiceRouteResult(files, contents, options) returns full result */
export function buildSpiceRouteResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): SpiceRouteResult {
  const routes: TradeRoute[] = files.map((file, i) =>
    analyzeTradeRoute(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, TradeRoute[]>()
  for (const route of routes) {
    const dir = route.file.includes('/')
      ? route.file.substring(0, route.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(route)
    } else {
      dirMap.set(dir, [route])
    }
  }

  const networks: RouteNetwork[] = Array.from(dirMap.entries()).map(([dir, dirRoutes]) =>
    analyzeRouteNetwork(dirRoutes, dir),
  )

  const avgClarity = routes.length > 0
    ? Math.round(routes.reduce((s, r) => s + r.routeClarity, 0) / routes.length)
    : 0
  const avgEfficiency = routes.length > 0
    ? Math.round(routes.reduce((s, r) => s + r.tradeEfficiency, 0) / routes.length)
    : 0
  const avgSuccess = routes.length > 0
    ? Math.round(routes.reduce((s, r) => s + r.journeySuccess, 0) / routes.length)
    : 0
  const overallProsperity = routes.length > 0
    ? Math.round(routes.reduce((s, r) => s + r.qualityScore, 0) / routes.length)
    : 0
  const isProsperous = overallProsperity >= 65

  const world: SpiceRouteResult['world'] = {
    avgClarity,
    avgEfficiency,
    avgSuccess,
    isProsperous,
    overallProsperity,
  }

  const avgRouteClarity = avgClarity
  const avgCargoValue = routes.length > 0
    ? Math.round(routes.reduce((s, r) => s + r.cargoValue, 0) / routes.length)
    : 0
  const avgWaypointQuality = routes.length > 0
    ? Math.round(routes.reduce((s, r) => s + r.waypointQuality, 0) / routes.length)
    : 0
  const avgTradeEfficiency = avgEfficiency
  const avgCulturalExchange = routes.length > 0
    ? Math.round(routes.reduce((s, r) => s + r.culturalExchange, 0) / routes.length)
    : 0
  const avgJourneySuccess = avgSuccess

  const conditionCounts = {
    goldenAge: 0,
    prosperous: 0,
    thriving: 0,
    surviving: 0,
    struggling: 0,
    collapsed: 0,
  }
  for (const r of routes) {
    switch (r.condition) {
      case 'golden-age': conditionCounts.goldenAge++; break
      case 'prosperous': conditionCounts.prosperous++; break
      case 'thriving': conditionCounts.thriving++; break
      case 'surviving': conditionCounts.surviving++; break
      case 'struggling': conditionCounts.struggling++; break
      case 'collapsed': conditionCounts.collapsed++; break
    }
  }

  const hasClearFlowCount = routes.filter((r) => r.route.hasClearFlow).length
  const hasHighValueCount = routes.filter((r) => r.cargo.hasHighValue).length
  const hasQualityControlCount = routes.filter((r) => r.waypoint.hasQualityControl).length
  const hasHighEfficiencyCount = routes.filter((r) => r.efficiency.hasHighEfficiency).length
  const hasCulturalExchangeCount = routes.filter((r) => r.exchange.hasCulturalExchange).length
  const isSuccessfulCount = routes.filter((r) => r.journey.isSuccessful).length

  const bestRoute = routes.length > 0
    ? routes.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file
    : ''
  const clearest = routes.length > 0
    ? routes.reduce((best, r) => r.routeClarity > best.routeClarity ? r : best).file
    : ''
  const mostValuable = routes.length > 0
    ? routes.reduce((best, r) => r.cargoValue > best.cargoValue ? r : best).file
    : ''
  const bestWaypoints = routes.length > 0
    ? routes.reduce((best, r) => r.waypointQuality > best.waypointQuality ? r : best).file
    : ''
  const mostEfficient = routes.length > 0
    ? routes.reduce((best, r) => r.tradeEfficiency > best.tradeEfficiency ? r : best).file
    : ''
  const mostExchanged = routes.length > 0
    ? routes.reduce((best, r) => r.culturalExchange > best.culturalExchange ? r : best).file
    : ''

  const merchantGrade = classifyMerchantGrade(overallProsperity)

  const stats: SpiceRouteResult['stats'] = {
    totalFiles: files.length,
    totalNetworks: networks.length,
    avgRouteClarity,
    avgCargoValue,
    avgWaypointQuality,
    avgTradeEfficiency,
    avgCulturalExchange,
    avgJourneySuccess,
    goldenAgeCount: conditionCounts.goldenAge,
    prosperousCount: conditionCounts.prosperous,
    thrivingCount: conditionCounts.thriving,
    survivingCount: conditionCounts.surviving,
    strugglingCount: conditionCounts.struggling,
    collapsedCount: conditionCounts.collapsed,
    hasClearFlowCount,
    hasHighValueCount,
    hasQualityControlCount,
    hasHighEfficiencyCount,
    hasCulturalExchangeCount,
    isSuccessfulCount,
    overallProsperity,
    merchantGrade,
    bestRoute,
    clearest,
    mostValuable,
    bestWaypoints,
    mostEfficient,
    mostExchanged,
  }

  const recommendations = generateRecommendations(routes, networks, world, stats)

  return {
    routes,
    networks,
    world,
    stats,
    recommendations,
  }
}
