// ─── Types ──────────────────────────────────────────────────────────────────

export type TrafficPattern = 'ocean-liner' | 'container-ship' | 'ferry' | 'fishing-boat' | 'rowboat' | 'driftwood'
export type CargoType = 'containerized' | 'bulk' | 'break-bulk' | 'liquid' | 'perishable' | 'hazardous'
export type PortType = 'deepwater' | 'river-port' | 'harbor' | 'marina' | 'pier' | 'beach'
export type NavSystem = 'gps' | 'radar' | 'lighthouse' | 'compass' | 'dead-reckoning' | 'hope'
export type FleetVessel = 'supertanker' | 'cruiser' | 'destroyer' | 'submarine' | 'sailboat' | 'raft'
export type VesselCondition = 'luxury-cruise' | 'ocean-liner' | 'coastal-freighter' | 'fishing-vessel' | 'lifeboat' | 'shipwreck'
export type ZoneType = 'international-hub' | 'regional-port' | 'coastal-harbor' | 'river-dock' | 'fishing-wharf' | 'abandoned-pier'
export type ZoneCondition = 'world-port' | 'major-port' | 'regional-port' | 'local-harbor' | 'marina' | 'ghost-port'
export type CaptainGrade = 'admiral' | 'captain' | 'first-officer' | 'boatswain' | 'deckhand' | 'landlubber'

export interface ChannelMeasure {
  depth: number
  isDeepWater: boolean
  isShallowDraft: boolean
  hasNavigableChannel: boolean
  hasSandbars: boolean
  hasReefs: boolean
  hasStrongCurrents: boolean
  hasSlackWater: boolean
  hasTidalVariation: boolean
  hasDredged: boolean
  sandbarCount: number
  reefCount: number
}

export interface TrafficMeasure {
  density: number
  pattern: TrafficPattern
  isOrganized: boolean
  hasRightOfWay: boolean
  hasTrafficLanes: boolean
  hasSeparationZone: boolean
  hasCongestion: boolean
  hasBottleneck: boolean
  hasCollisionRisk: boolean
  hasDerelict: boolean
  bottleneckCount: number
  collisionRiskCount: number
}

export interface CargoMeasure {
  handling: number
  type: CargoType
  isProperlyPacked: boolean
  hasCorrectManifest: boolean
  hasCargoSecuring: boolean
  hasLoadingPlan: boolean
  hasUnloadingPlan: boolean
  hasTransshipment: boolean
  hasDamage: boolean
  hasContraband: boolean
  hasCustomsInspection: boolean
  damageCount: number
}

export interface PortMeasure {
  efficiency: number
  type: PortType
  hasEfficientDocking: boolean
  hasCargoCrane: boolean
  hasWarehouse: boolean
  hasContainerYard: boolean
  hasPilotService: boolean
  hasTugboatAssist: boolean
  hasCustomsHouse: boolean
  hasLighthouse: boolean
  hasBreakwater: boolean
  hasFuelDock: boolean
  craneCount: number
}

export interface NavigationMeasure {
  safety: number
  system: NavSystem
  hasClearChart: boolean
  hasBuoys: boolean
  hasLighthouse: boolean
  hasFogHorn: boolean
  hasLifeRaft: boolean
  hasWatertightDoors: boolean
  hasManOverboard: boolean
  hasSOS: boolean
  hasAnchorage: boolean
  hasStormShelter: boolean
  buoyCount: number
  lifeRaftCount: number
}

export interface FleetMeasure {
  management: number
  vessel: FleetVessel
  isWellMaintained: boolean
  hasScheduledMaintenance: boolean
  hasCrewTraining: boolean
  hasEmergencyProcedures: boolean
  hasFuelEfficiency: boolean
  hasBallastControl: boolean
  hasWeatherRouting: boolean
  hasAIS: boolean
  hasAutomaticPilot: boolean
  maintenanceScore: number
}

export interface CargoVessel {
  file: string
  channelDepth: number
  trafficDensity: number
  cargoHandling: number
  portEfficiency: number
  navigationSafety: number
  fleetManagement: number
  channel: ChannelMeasure
  traffic: TrafficMeasure
  cargo: CargoMeasure
  port: PortMeasure
  navigation: NavigationMeasure
  fleet: FleetMeasure
  condition: VesselCondition
  qualityScore: number
}

export interface HarborZone {
  directory: string
  vessels: CargoVessel[]
  avgChannelDepth: number
  avgCargoHandling: number
  avgNavigationSafety: number
  luxuryCruiseCount: number
  shipwreckCount: number
  safeNavigationCount: number
  efficientPortCount: number
  zoneType: ZoneType
  condition: ZoneCondition
}

export interface ShippingLaneStats {
  totalFiles: number
  totalZones: number
  avgChannelDepth: number
  avgTrafficDensity: number
  avgCargoHandling: number
  avgPortEfficiency: number
  avgNavigationSafety: number
  avgFleetManagement: number
  luxuryCruiseCount: number
  oceanLinerCount: number
  coastalFreighterCount: number
  fishingVesselCount: number
  lifeboatCount: number
  shipwreckCount: number
  isDeepWaterCount: number
  hasSandbarsCount: number
  hasCongestionCount: number
  isProperlyPackedCount: number
  hasDamageCount: number
  hasEfficientDockingCount: number
  hasLighthouseCount: number
  hasLifeRaftCount: number
  hasStormShelterCount: number
  isWellMaintainedCount: number
  hasScheduledMaintenanceCount: number
  overallMaritime: number
  captainGrade: CaptainGrade
  bestVessel: string
  deepestChannel: string
  bestCargo: string
  safestNavigation: string
  bestFleet: string
}

export interface ShippingLaneResult {
  vessels: CargoVessel[]
  zones: HarborZone[]
  authority: {
    avgChannelDepth: number
    avgCargoHandling: number
    avgNavigationSafety: number
    isNavigable: boolean
    overallMaritime: number
  }
  stats: ShippingLaneStats
  recommendations: string[]
}

// ─── Regex Patterns ─────────────────────────────────────────────────────────

const IMPORT_RE = /import\s+(?:\{[^}]*\}|\w+)\s+from\s+['"]([^'"]+)['"]/g
const EXPORT_RE = /export\s+(?:default\s+)?(?:function|const|class|interface|type|enum|async\s+function)\s+(\w+)/g
const FUNCTION_RE = /\bfunction\s+(\w+)/g
const ARROW_RE = /=>\s*[{(]/g
const CLASS_RE = /\bclass\s+\w+/g
const INTERFACE_RE = /(?:interface|type)\s+\w+\s*(?:<[^>]+>)?\s*\{/g
const TYPE_ANNOTATION_RE = /:\s*(?:string|number|boolean|void|Promise|Record|Map|Set|Array|Date|RegExp|Error|[A-Z]\w+)/g
const GENERIC_RE = /<\w+>/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const COMMENT_RE = /\/\/.*$/gm
const TRY_CATCH_RE = /try\s*\{/g
const IF_RE = /\bif\s*\(/g
const PIPE_RE = /[.\s](map|filter|reduce|forEach|flatMap|find|some|every)\s*\(/g
const RETURN_RE = /\breturn\b/g
const THROW_RE = /\bthrow\b/g
const ASYNC_RE = /\basync\s+/
const CONST_RE = /\bconst\s+/g
const LET_RE = /\blet\s+/g
const MUTATION_RE = /\.\s*(push|pop|shift|unshift|splice|sort|reverse)\s*\(/g
const SIDE_EFFECT_RE = /\b(console|process|fs|fetch|http|writeFile|readFile)\b/g
const ANY_TYPE_RE = /:\s*any\b/g
const DEAD_CODE_RE = /\b(debugger|with)\s*[(;]/
const NESTED_BLOCK_RE = /\{[^{}]*\{[^{}]*\{/g

// ─── measureChannel ─────────────────────────────────────────────────────────

/**
 * Measure data capacity and flow depth
 * @example
 * measureChannel('function process(data: Complex): Result {}') // { depth: 60, ... }
 */
export function measureChannel(content: string): ChannelMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      depth: 0, isDeepWater: false, isShallowDraft: true, hasNavigableChannel: false,
      hasSandbars: false, hasReefs: false, hasStrongCurrents: false, hasSlackWater: true,
      hasTidalVariation: false, hasDredged: false, sandbarCount: 0, reefCount: 0,
    }
  }

  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const nestedBlocks = (content.match(NESTED_BLOCK_RE) ?? []).length

  const isDeepWater = types >= 5 && interfaces >= 1
  const isShallowDraft = types === 0
  const hasNavigableChannel = pipes > 0 && functions > 0
  const hasSandbars = anyTypes > 0
  const hasReefs = nestedBlocks > 2
  const hasStrongCurrents = pipes >= 3
  const hasSlackWater = pipes === 0 && functions <= 1
  const hasTidalVariation = functions > 3
  const hasDredged = generics > 0 && types > 0

  let depth = 10
  if (isDeepWater) depth += 20
  if (hasNavigableChannel) depth += 15
  if (hasDredged) depth += 10
  if (hasStrongCurrents) depth += 10
  if (types > 0) depth += 10
  if (interfaces > 0) depth += 10
  if (hasTidalVariation) depth += 5
  if (hasSandbars) depth -= 10
  if (hasReefs) depth -= 10
  depth = Math.max(0, Math.min(100, depth))

  return {
    depth, isDeepWater, isShallowDraft, hasNavigableChannel, hasSandbars, hasReefs,
    hasStrongCurrents, hasSlackWater, hasTidalVariation, hasDredged,
    sandbarCount: anyTypes, reefCount: nestedBlocks,
  }
}

// ─── measureTraffic ─────────────────────────────────────────────────────────

/**
 * Measure function density and organization
 * @example
 * measureTraffic('function a() {} function b() {} function c() {}') // { density: 50, ... }
 */
export function measureTraffic(content: string): TrafficMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      density: 0, pattern: 'driftwood', isOrganized: false, hasRightOfWay: false,
      hasTrafficLanes: false, hasSeparationZone: false, hasCongestion: false,
      hasBottleneck: false, hasCollisionRisk: false, hasDerelict: false,
      bottleneckCount: 0, collisionRiskCount: 0,
    }
  }

  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length
  const nestedBlocks = (content.match(NESTED_BLOCK_RE) ?? []).length

  const isOrganized = exports > 0 && functions > 0
  const hasRightOfWay = exports > 0
  const hasTrafficLanes = classes > 0 || functions >= 3
  const hasSeparationZone = consts > 0 && lets === 0
  const hasCongestion = functions > 10
  const hasBottleneck = nestedBlocks > 2
  const hasCollisionRisk = lets > consts
  const hasDerelict = deadCode > 0

  const densityRatio = loc > 0 ? (functions / loc) * 100 : 0
  let density = Math.round(Math.min(densityRatio * 20 + (exports > 0 ? 20 : 0) + (classes > 0 ? 15 : 0), 100))
  if (hasCongestion) density = Math.min(density, 85)
  if (hasDerelict) density -= 10
  density = Math.max(0, Math.min(100, density))

  let pattern: TrafficPattern = 'driftwood'
  if (density >= 80 && isOrganized) pattern = 'ocean-liner'
  else if (density >= 60) pattern = 'container-ship'
  else if (density >= 40) pattern = 'ferry'
  else if (density >= 20) pattern = 'fishing-boat'
  else if (density >= 10) pattern = 'rowboat'

  return {
    density, pattern, isOrganized, hasRightOfWay, hasTrafficLanes, hasSeparationZone,
    hasCongestion, hasBottleneck, hasCollisionRisk, hasDerelict,
    bottleneckCount: nestedBlocks, collisionRiskCount: Math.max(0, lets - consts),
  }
}

// ─── measureCargo ───────────────────────────────────────────────────────────

/**
 * Measure data transformation quality
 * @example
 * measureCargo('function transform(input: Data): Result { return process(input) }') // { handling: 60, ... }
 */
export function measureCargo(content: string): CargoMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      handling: 0, type: 'hazardous', isProperlyPacked: false, hasCorrectManifest: false,
      hasCargoSecuring: false, hasLoadingPlan: false, hasUnloadingPlan: false,
      hasTransshipment: false, hasDamage: false, hasContraband: false,
      hasCustomsInspection: false, damageCount: 0,
    }
  }

  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length

  const isProperlyPacked = types > 0 && interfaces > 0
  const hasCorrectManifest = types > 0 && exports > 0
  const hasCargoSecuring = tryCatch > 0
  const hasLoadingPlan = imports > 0
  const hasUnloadingPlan = returns > 0 && types > 0
  const hasTransshipment = pipes > 0
  const hasDamage = anyTypes > 0
  const hasContraband = sideEffects > 0 && tryCatch === 0
  const hasCustomsInspection = if_count(content) > 0 && types > 0

  let handling = 10
  if (isProperlyPacked) handling += 15
  if (hasCorrectManifest) handling += 15
  if (hasCargoSecuring) handling += 10
  if (hasLoadingPlan) handling += 10
  if (hasUnloadingPlan) handling += 10
  if (hasTransshipment) handling += 10
  if (hasCustomsInspection) handling += 10
  if (hasDamage) handling -= 10
  if (hasContraband) handling -= 10
  if (deadCode > 0) handling -= 5
  handling = Math.max(0, Math.min(100, handling))

  let type: CargoType = 'hazardous'
  if (handling >= 80) type = 'containerized'
  else if (handling >= 65) type = 'bulk'
  else if (handling >= 50) type = 'break-bulk'
  else if (handling >= 35) type = 'liquid'
  else if (handling >= 20) type = 'perishable'

  return {
    handling, type, isProperlyPacked, hasCorrectManifest, hasCargoSecuring,
    hasLoadingPlan, hasUnloadingPlan, hasTransshipment, hasDamage, hasContraband,
    hasCustomsInspection, damageCount: anyTypes,
  }
}

function if_count(content: string): number {
  return (content.match(IF_RE) ?? []).length
}

// ─── measurePort ────────────────────────────────────────────────────────────

/**
 * Measure I/O efficiency and facilities
 * @example
 * measurePort('import { X } from "y"; export function run(): void {}') // { efficiency: 60, ... }
 */
export function measurePort(content: string): PortMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      efficiency: 0, type: 'beach', hasEfficientDocking: false, hasCargoCrane: false,
      hasWarehouse: false, hasContainerYard: false, hasPilotService: false,
      hasTugboatAssist: false, hasCustomsHouse: false, hasLighthouse: false,
      hasBreakwater: false, hasFuelDock: false, craneCount: 0,
    }
  }

  const imports = (content.match(IMPORT_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length

  const hasEfficientDocking = exports > 0 && imports > 0
  const hasCargoCrane = pipes > 0
  const hasWarehouse = classes > 0 || interfaces > 0
  const hasContainerYard = interfaces > 0 && types > 0
  const hasPilotService = functions > 0 && jsdoc > 0
  const hasTugboatAssist = consts > 0 && functions > 0
  const hasCustomsHouse = types > 0 && tryCatch > 0
  const hasLighthouse = jsdoc > 0
  const hasBreakwater = tryCatch > 0
  const hasFuelDock = consts > 0 && lets_count(content) === 0

  let efficiency = 10
  if (hasEfficientDocking) efficiency += 15
  if (hasCargoCrane) efficiency += 10
  if (hasWarehouse) efficiency += 10
  if (hasContainerYard) efficiency += 10
  if (hasPilotService) efficiency += 10
  if (hasTugboatAssist) efficiency += 10
  if (hasCustomsHouse) efficiency += 10
  if (hasLighthouse) efficiency += 10
  if (hasBreakwater) efficiency += 5
  efficiency = Math.max(0, Math.min(100, efficiency))

  let type: PortType = 'beach'
  if (efficiency >= 80) type = 'deepwater'
  else if (efficiency >= 60) type = 'river-port'
  else if (efficiency >= 45) type = 'harbor'
  else if (efficiency >= 30) type = 'marina'
  else if (efficiency >= 15) type = 'pier'

  return {
    efficiency, type, hasEfficientDocking, hasCargoCrane, hasWarehouse,
    hasContainerYard, hasPilotService, hasTugboatAssist, hasCustomsHouse,
    hasLighthouse, hasBreakwater, hasFuelDock, craneCount: pipes,
  }
}

function lets_count(content: string): number {
  return (content.match(LET_RE) ?? []).length
}

// ─── measureNavigation ──────────────────────────────────────────────────────

/**
 * Measure error handling and safety
 * @example
 * measureNavigation('try { run() } catch (e) { throw new Error("fail") }') // { safety: 70, ... }
 */
export function measureNavigation(content: string): NavigationMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      safety: 0, system: 'hope', hasClearChart: false, hasBuoys: false, hasLighthouse: false,
      hasFogHorn: false, hasLifeRaft: false, hasWatertightDoors: false, hasManOverboard: false,
      hasSOS: false, hasAnchorage: false, hasStormShelter: false, buoyCount: 0, lifeRaftCount: 0,
    }
  }

  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const throws = (content.match(THROW_RE) ?? []).length
  const ifs = (content.match(IF_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const comments = (content.match(COMMENT_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length

  const hasClearChart = functions > 0 && returns > 0
  const hasBuoys = ifs > 0
  const hasLighthouse = jsdoc > 0
  const hasFogHorn = comments > 2
  const hasLifeRaft = tryCatch > 0
  const hasWatertightDoors = tryCatch > 0 && throws > 0
  const hasManOverboard = throws > 0
  const hasSOS = throws > 0 && tryCatch > 0
  const hasAnchorage = returns > 0
  const hasStormShelter = tryCatch > 0 && functions > 0

  let safety = 15
  if (hasClearChart) safety += 10
  if (hasBuoys) safety += 10
  if (hasLighthouse) safety += 10
  if (hasLifeRaft) safety += 15
  if (hasWatertightDoors) safety += 10
  if (hasManOverboard) safety += 5
  if (hasSOS) safety += 10
  if (hasAnchorage) safety += 5
  if (hasStormShelter) safety += 10
  if (anyTypes > 0) safety -= 10
  if (sideEffects > 0 && tryCatch === 0) safety -= 10
  safety = Math.max(0, Math.min(100, safety))

  let system: NavSystem = 'hope'
  if (safety >= 85) system = 'gps'
  else if (safety >= 70) system = 'radar'
  else if (safety >= 55) system = 'lighthouse'
  else if (safety >= 40) system = 'compass'
  else if (safety >= 20) system = 'dead-reckoning'

  return {
    safety, system, hasClearChart, hasBuoys, hasLighthouse, hasFogHorn,
    hasLifeRaft, hasWatertightDoors, hasManOverboard, hasSOS, hasAnchorage,
    hasStormShelter, buoyCount: ifs, lifeRaftCount: tryCatch,
  }
}

// ─── measureFleet ───────────────────────────────────────────────────────────

/**
 * Measure resource management quality
 * @example
 * measureFleet('const x: number = 1; export function run(): Promise<void> {}') // { management: 60, ... }
 */
export function measureFleet(content: string): FleetMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      management: 0, vessel: 'raft', isWellMaintained: false, hasScheduledMaintenance: false,
      hasCrewTraining: false, hasEmergencyProcedures: false, hasFuelEfficiency: false,
      hasBallastControl: false, hasWeatherRouting: false, hasAIS: false,
      hasAutomaticPilot: false, maintenanceScore: 0,
    }
  }

  const consts = (content.match(CONST_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const asyncs = (content.match(ASYNC_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length
  const comments = (content.match(COMMENT_RE) ?? []).length
  const mutations = (content.match(MUTATION_RE) ?? []).length

  const isWellMaintained = consts > 0 && lets === 0 && deadCode === 0
  const hasScheduledMaintenance = comments > 0 || jsdoc > 0
  const hasCrewTraining = jsdoc > 0 && types > 0
  const hasEmergencyProcedures = tryCatch > 0
  const hasFuelEfficiency = pipes > 0 && mutations === 0
  const hasBallastControl = consts > 0 && lets === 0
  const hasWeatherRouting = asyncs > 0 || tryCatch > 0
  const hasAIS = exports > 0 && types > 0
  const hasAutomaticPilot = pipes > 0 && (content.match(ARROW_RE) ?? []).length > 0

  let management = 10
  if (isWellMaintained) management += 15
  if (hasScheduledMaintenance) management += 10
  if (hasCrewTraining) management += 10
  if (hasEmergencyProcedures) management += 10
  if (hasFuelEfficiency) management += 10
  if (hasBallastControl) management += 10
  if (hasAIS) management += 10
  if (hasAutomaticPilot) management += 5
  if (anyTypes > 0) management -= 10
  if (deadCode > 0) management -= 10
  management = Math.max(0, Math.min(100, management))

  const maintenanceScore = Math.max(0, Math.min(100, Math.round(
    (isWellMaintained ? 30 : 0) + (hasBallastControl ? 20 : 0) +
    (hasScheduledMaintenance ? 20 : 0) + (deadCode === 0 ? 15 : 0) +
    (anyTypes === 0 ? 15 : 0),
  )))

  let vessel: FleetVessel = 'raft'
  if (management >= 85) vessel = 'supertanker'
  else if (management >= 70) vessel = 'cruiser'
  else if (management >= 55) vessel = 'destroyer'
  else if (management >= 40) vessel = 'submarine'
  else if (management >= 20) vessel = 'sailboat'

  return {
    management, vessel, isWellMaintained, hasScheduledMaintenance, hasCrewTraining,
    hasEmergencyProcedures, hasFuelEfficiency, hasBallastControl, hasWeatherRouting,
    hasAIS, hasAutomaticPilot, maintenanceScore,
  }
}

// ─── analyzeCargoVessel ─────────────────────────────────────────────────────

/**
 * Analyze a single file as a cargo vessel
 * @example
 * analyzeCargoVessel('export function run(): void {}', 'main.ts') // { qualityScore: 60, ... }
 */
export function analyzeCargoVessel(content: string, filePath: string): CargoVessel {
  const channel = measureChannel(content)
  const traffic = measureTraffic(content)
  const cargo = measureCargo(content)
  const port = measurePort(content)
  const navigation = measureNavigation(content)
  const fleet = measureFleet(content)

  const channelDepth = channel.depth
  const trafficDensity = traffic.density
  const cargoHandling = cargo.handling
  const portEfficiency = port.efficiency
  const navigationSafety = navigation.safety
  const fleetManagement = fleet.management

  const qualityScore = Math.round(
    (channelDepth + trafficDensity + cargoHandling + portEfficiency + navigationSafety + fleetManagement) / 6,
  )

  let condition: VesselCondition = 'shipwreck'
  if (qualityScore >= 90) condition = 'luxury-cruise'
  else if (qualityScore >= 75) condition = 'ocean-liner'
  else if (qualityScore >= 55) condition = 'coastal-freighter'
  else if (qualityScore >= 35) condition = 'fishing-vessel'
  else if (qualityScore >= 15) condition = 'lifeboat'

  return {
    file: filePath,
    channelDepth, trafficDensity, cargoHandling, portEfficiency, navigationSafety, fleetManagement,
    channel, traffic, cargo, port, navigation, fleet,
    condition, qualityScore,
  }
}

// ─── classifyZoneType ───────────────────────────────────────────────────────

/**
 * Classify zone type based on vessels
 * @example
 * classifyZoneType(vessels) // 'international-hub'
 */
export function classifyZoneType(vessels: CargoVessel[]): ZoneType {
  if (vessels.length === 0) return 'abandoned-pier'
  const avgQuality = vessels.reduce((s, v) => s + v.qualityScore, 0) / vessels.length
  const luxuryCount = vessels.filter((v) => v.condition === 'luxury-cruise').length

  if (avgQuality >= 80 && luxuryCount >= 2) return 'international-hub'
  if (avgQuality >= 65) return 'regional-port'
  if (avgQuality >= 50) return 'coastal-harbor'
  if (avgQuality >= 35) return 'river-dock'
  if (avgQuality >= 15) return 'fishing-wharf'
  return 'abandoned-pier'
}

// ─── classifyCaptainGrade ───────────────────────────────────────────────────

/**
 * Classify captain grade based on average maritime quality
 * @example
 * classifyCaptainGrade(85) // 'captain'
 */
export function classifyCaptainGrade(avgMaritime: number): CaptainGrade {
  if (avgMaritime >= 90) return 'admiral'
  if (avgMaritime >= 75) return 'captain'
  if (avgMaritime >= 55) return 'first-officer'
  if (avgMaritime >= 35) return 'boatswain'
  if (avgMaritime >= 15) return 'deckhand'
  return 'landlubber'
}

// ─── classifyZoneCondition ──────────────────────────────────────────────────

function classifyZoneCondition(avgQuality: number): ZoneCondition {
  if (avgQuality >= 80) return 'world-port'
  if (avgQuality >= 65) return 'major-port'
  if (avgQuality >= 45) return 'regional-port'
  if (avgQuality >= 25) return 'local-harbor'
  if (avgQuality >= 10) return 'marina'
  return 'ghost-port'
}

// ─── analyzeHarborZone ──────────────────────────────────────────────────────

/**
 * Analyze a directory as a harbor zone
 * @example
 * analyzeHarborZone(vessels, 'src/') // { zoneType: 'regional-port', ... }
 */
export function analyzeHarborZone(vessels: CargoVessel[], dirPath: string): HarborZone {
  if (vessels.length === 0) {
    return {
      directory: dirPath, vessels: [],
      avgChannelDepth: 0, avgCargoHandling: 0, avgNavigationSafety: 0,
      luxuryCruiseCount: 0, shipwreckCount: 0, safeNavigationCount: 0, efficientPortCount: 0,
      zoneType: 'abandoned-pier', condition: 'ghost-port',
    }
  }

  const avgChannelDepth = Math.round(vessels.reduce((s, v) => s + v.channelDepth, 0) / vessels.length)
  const avgCargoHandling = Math.round(vessels.reduce((s, v) => s + v.cargoHandling, 0) / vessels.length)
  const avgNavigationSafety = Math.round(vessels.reduce((s, v) => s + v.navigationSafety, 0) / vessels.length)
  const avgQuality = Math.round(vessels.reduce((s, v) => s + v.qualityScore, 0) / vessels.length)

  return {
    directory: dirPath, vessels,
    avgChannelDepth, avgCargoHandling, avgNavigationSafety,
    luxuryCruiseCount: vessels.filter((v) => v.condition === 'luxury-cruise').length,
    shipwreckCount: vessels.filter((v) => v.condition === 'shipwreck').length,
    safeNavigationCount: vessels.filter((v) => v.navigation.safety >= 60).length,
    efficientPortCount: vessels.filter((v) => v.port.hasEfficientDocking).length,
    zoneType: classifyZoneType(vessels),
    condition: classifyZoneCondition(avgQuality),
  }
}

// ─── generateRecommendations ────────────────────────────────────────────────

/**
 * Generate improvement recommendations
 * @example
 * generateRecommendations(vessels, zones, authority, stats) // ['Deepen channels...']
 */
export function generateRecommendations(
  vessels: CargoVessel[],
  zones: HarborZone[],
  _authority: { avgChannelDepth: number; avgCargoHandling: number; avgNavigationSafety: number; isNavigable: boolean; overallMaritime: number },
  stats: ShippingLaneStats,
): string[] {
  const recs: string[] = []

  if (stats.shipwreckCount > stats.totalFiles * 0.3) {
    recs.push('Too many shipwrecks — salvage or remove critically damaged files')
  }
  if (stats.avgChannelDepth < 40) {
    recs.push('Shallow channels — add type annotations, interfaces, and generics for deeper data flow')
  }
  if (stats.avgCargoHandling < 40) {
    recs.push('Poor cargo handling — improve data transformation with proper typing and validation')
  }
  if (stats.hasSandbarsCount > stats.totalFiles * 0.2) {
    recs.push('Sandbars detected — remove any types blocking data flow')
  }
  if (stats.avgNavigationSafety < 40) {
    recs.push('Unsafe navigation — add try-catch blocks, error handling, and throw statements')
  }
  if (stats.hasDamageCount > stats.totalFiles * 0.3) {
    recs.push('Cargo damage reported — fix any types and add proper type guards')
  }
  if (stats.avgFleetManagement < 40) {
    recs.push('Poor fleet management — use const, add JSDoc, and eliminate dead code')
  }

  const firstVessel = vessels[0]
  const worst = vessels.length > 0 && firstVessel
    ? vessels.reduce((w, v) => v.qualityScore < w.qualityScore ? v : w, firstVessel)
    : null
  if (worst && worst.qualityScore < 25) {
    recs.push(`Vessel "${worst.file}" is taking on water (score: ${worst.qualityScore}) — needs major refit`)
  }

  if (zones.some((z) => z.condition === 'ghost-port')) {
    recs.push('Ghost ports detected — some directories need complete overhaul')
  }

  return recs.length > 0 ? recs : ['Shipping lanes are clear and efficient — full steam ahead!']
}

// ─── buildShippingLaneResult ────────────────────────────────────────────────

/**
 * Build the complete shipping lane result
 * @example
 * buildShippingLaneResult(['a.ts'], ['export function run(): void {}'], {}) // { vessels: [...], ... }
 */
export function buildShippingLaneResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): ShippingLaneResult {
  const vessels: CargoVessel[] = []
  for (let i = 0; i < files.length; i++) {
    vessels.push(analyzeCargoVessel(contents[i] ?? '', files[i] ?? ''))
  }

  const dirMap = new Map<string, CargoVessel[]>()
  for (const vessel of vessels) {
    const dir = vessel.file.includes('/') ? vessel.file.substring(0, vessel.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(vessel)
    } else {
      dirMap.set(dir, [vessel])
    }
  }

  const zones: HarborZone[] = []
  for (const [dir, dirVessels] of dirMap) {
    zones.push(analyzeHarborZone(dirVessels, dir))
  }

  const avgChannelDepth = vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.channelDepth, 0) / vessels.length) : 0
  const avgCargoHandling = vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.cargoHandling, 0) / vessels.length) : 0
  const avgNavigationSafety = vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.navigationSafety, 0) / vessels.length) : 0
  const overallMaritime = vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.qualityScore, 0) / vessels.length) : 0

  const authority = {
    avgChannelDepth, avgCargoHandling, avgNavigationSafety,
    isNavigable: overallMaritime >= 60,
    overallMaritime,
  }

  const conditions = vessels.map((v) => v.condition)
  const firstV = vessels[0]
  const bestVessel = vessels.length > 0 && firstV
    ? vessels.reduce((b, v) => v.qualityScore > b.qualityScore ? v : b, firstV)
    : null
  const deepestChannel = vessels.length > 0 && firstV
    ? vessels.reduce((b, v) => v.channelDepth > b.channelDepth ? v : b, firstV)
    : null
  const bestCargo = vessels.length > 0 && firstV
    ? vessels.reduce((b, v) => v.cargoHandling > b.cargoHandling ? v : b, firstV)
    : null
  const safestNavigation = vessels.length > 0 && firstV
    ? vessels.reduce((b, v) => v.navigationSafety > b.navigationSafety ? v : b, firstV)
    : null
  const bestFleet = vessels.length > 0 && firstV
    ? vessels.reduce((b, v) => v.fleetManagement > b.fleetManagement ? v : b, firstV)
    : null

  const stats: ShippingLaneStats = {
    totalFiles: vessels.length,
    totalZones: zones.length,
    avgChannelDepth,
    avgTrafficDensity: vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.trafficDensity, 0) / vessels.length) : 0,
    avgCargoHandling,
    avgPortEfficiency: vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.portEfficiency, 0) / vessels.length) : 0,
    avgNavigationSafety,
    avgFleetManagement: vessels.length > 0 ? Math.round(vessels.reduce((s, v) => s + v.fleetManagement, 0) / vessels.length) : 0,
    luxuryCruiseCount: conditions.filter((c) => c === 'luxury-cruise').length,
    oceanLinerCount: conditions.filter((c) => c === 'ocean-liner').length,
    coastalFreighterCount: conditions.filter((c) => c === 'coastal-freighter').length,
    fishingVesselCount: conditions.filter((c) => c === 'fishing-vessel').length,
    lifeboatCount: conditions.filter((c) => c === 'lifeboat').length,
    shipwreckCount: conditions.filter((c) => c === 'shipwreck').length,
    isDeepWaterCount: vessels.filter((v) => v.channel.isDeepWater).length,
    hasSandbarsCount: vessels.filter((v) => v.channel.hasSandbars).length,
    hasCongestionCount: vessels.filter((v) => v.traffic.hasCongestion).length,
    isProperlyPackedCount: vessels.filter((v) => v.cargo.isProperlyPacked).length,
    hasDamageCount: vessels.filter((v) => v.cargo.hasDamage).length,
    hasEfficientDockingCount: vessels.filter((v) => v.port.hasEfficientDocking).length,
    hasLighthouseCount: vessels.filter((v) => v.port.hasLighthouse).length,
    hasLifeRaftCount: vessels.filter((v) => v.navigation.hasLifeRaft).length,
    hasStormShelterCount: vessels.filter((v) => v.navigation.hasStormShelter).length,
    isWellMaintainedCount: vessels.filter((v) => v.fleet.isWellMaintained).length,
    hasScheduledMaintenanceCount: vessels.filter((v) => v.fleet.hasScheduledMaintenance).length,
    overallMaritime,
    captainGrade: classifyCaptainGrade(overallMaritime),
    bestVessel: bestVessel?.file ?? '',
    deepestChannel: deepestChannel?.file ?? '',
    bestCargo: bestCargo?.file ?? '',
    safestNavigation: safestNavigation?.file ?? '',
    bestFleet: bestFleet?.file ?? '',
  }

  const recommendations = generateRecommendations(vessels, zones, authority, stats)

  return { vessels, zones, authority, stats, recommendations }
}
