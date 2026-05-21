// ─── Interfaces ──────────────────────────────────────────

export interface WallMeasure {
  strength: number
  material: 'granite' | 'limestone' | 'brick' | 'wood' | 'earth' | 'paper'
  isThick: boolean
  hasProperFoundation: boolean
  hasReinforcedSections: boolean
  hasNoCracks: boolean
  hasNoBridges: boolean
  hasParapet: boolean
  hasBattlement: boolean
  hasPortcullis: boolean
  hasArrowSlits: boolean
  hasMurderHoles: boolean
  crackCount: number
  bridgeCount: number
}

export interface MoatMeasure {
  depth: number
  type: 'water' | 'dry' | 'fire' | 'poison' | 'ditch' | 'none'
  isDeep: boolean
  hasDrawbridge: boolean
  hasPortcullisChain: boolean
  hasAlligator: boolean
  hasWaterLevel: boolean
  hasDrainage: boolean
  hasFloodgate: boolean
  hasNoBridges: boolean
  hasNoFordingPoints: boolean
  hasRippleDetection: boolean
  bypassCount: number
}

export interface TowerMeasure {
  coverage: number
  type: 'watchtower' | 'corner-tower' | 'gatehouse-tower' | 'bastion' | 'turret' | 'stump'
  hasFullCoverage: boolean
  hasWatchman: boolean
  hasWarningBell: boolean
  hasLineOfSight: boolean
  hasSignalFire: boolean
  hasSearchlight: boolean
  hasNightWatch: boolean
  hasDayWatch: boolean
  hasGuardRotation: boolean
  hasBlindSpots: boolean
  blindSpotCount: number
}

export interface GateMeasure {
  security: number
  type: 'portcullis' | 'drawbridge' | 'barbican' | 'sally-port' | 'postern' | 'wide-open'
  isGuarded: boolean
  hasAuthentication: boolean
  hasAuthorization: boolean
  hasAudit: boolean
  hasRateLimit: boolean
  hasThrottle: boolean
  hasQuarantine: boolean
  hasVIPentrance: boolean
  hasEmergencyExit: boolean
  hasNoSecretPassage: boolean
  vulnerabilityCount: number
}

export interface SiegeMeasure {
  readiness: number
  state: 'peace' | 'alert' | 'siege' | 'breach' | 'surrender' | 'ruins'
  hasSupplies: boolean
  hasReinforcements: boolean
  hasCounterattack: boolean
  hasMedical: boolean
  hasEvacuation: boolean
  hasSiegeWeapons: boolean
  hasTrebuchet: boolean
  hasBoilingOil: boolean
  hasFortifiedGate: boolean
  hasFallenWall: boolean
  fallenWallCount: number
}

export interface StructureMeasure {
  integrity: number
  design: 'concentric' | 'bastion' | 'star-fort' | 'motte-and-bailey' | 'palisade' | 'sandcastle'
  isStructurallySound: boolean
  hasLoadBearing: boolean
  hasFlyingButtress: boolean
  hasKeystone: boolean
  hasFoundation: boolean
  hasReinforcement: boolean
  hasExpansionJoints: boolean
  hasWeatherProofing: boolean
  hasSeismicResistance: boolean
  hasFireResistance: boolean
  weaknessCount: number
}

export interface FortificationReading {
  file: string
  wallStrength: number
  moatDepth: number
  towerCoverage: number
  gateSecurity: number
  siegeReadiness: number
  structuralIntegrity: number
  wall: WallMeasure
  moat: MoatMeasure
  tower: TowerMeasure
  gate: GateMeasure
  siege: SiegeMeasure
  structure: StructureMeasure
  condition: 'impregnable-fortress' | 'stronghold' | 'castle' | 'fort' | 'stockade' | 'ruins'
  qualityScore: number
}

export interface DefenseZone {
  directory: string
  readings: FortificationReading[]
  avgWallStrength: number
  avgMoatDepth: number
  avgGateSecurity: number
  impregnableCount: number
  ruinsCount: number
  deepMoatCount: number
  guardedGateCount: number
  zoneType: 'citadel' | 'inner-wall' | 'outer-wall' | 'bailey' | 'outpost' | 'no-mans-land'
  condition: 'fortress-network' | 'castle-complex' | 'walled-city' | 'fortified-camp' | 'outpost' | 'open-field'
}

export interface KingdomMeasure {
  avgWallStrength: number
  avgMoatDepth: number
  avgGateSecurity: number
  isImpregnable: boolean
  overallDefense: number
}

export interface FortressWallStats {
  totalFiles: number
  totalZones: number
  avgWallStrength: number
  avgMoatDepth: number
  avgTowerCoverage: number
  avgGateSecurity: number
  avgSiegeReadiness: number
  avgStructuralIntegrity: number
  impregnableFortressCount: number
  strongholdCount: number
  castleCount: number
  fortCount: number
  stockadeCount: number
  ruinsCount: number
  isThickCount: number
  hasNoCracksCount: number
  isDeepCount: number
  hasNoBridgesCount: number
  hasFullCoverageCount: number
  hasBlindSpotsCount: number
  isGuardedCount: number
  hasAuthenticationCount: number
  vulnerabilityCount: number
  isStructurallySoundCount: number
  hasKeystoneCount: number
  overallDefense: number
  commanderGrade: 'field-marshal' | 'general' | 'colonel' | 'captain' | 'sergeant' | 'private'
  bestReading: string
  strongestWall: string
  deepestMoat: string
  securestGate: string
  mostReady: string
}

export interface FortressWallResult {
  readings: FortificationReading[]
  zones: DefenseZone[]
  kingdom: KingdomMeasure
  stats: FortressWallStats
  recommendations: string[]
}

// ─── Counting Utilities ─────────────────────────────────

/**
 * Count non-empty lines
 * @example
 * countLoc('const a = 1\n\nconst b = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count function declarations
 * @example
 * countFunctions('function foo() {}') // 1
 */
export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

/**
 * Count class declarations
 * @example
 * countClasses('class Foo {}') // 1
 */
export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count interface declarations
 * @example
 * countInterfaces('interface Foo {}') // 1
 */
export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count type aliases
 * @example
 * countTypes('type Foo = string') // 1
 */
export function countTypes(content: string): number {
  const m = content.match(/\btype\s+\w+\s*=/g)
  return m ? m.length : 0
}

/**
 * Count export statements
 * @example
 * countExports('export const a = 1') // 1
 */
export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

/**
 * Count import statements
 * @example
 * countImports("import { foo } from 'bar'") // 1
 */
export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

/**
 * Count JSDoc blocks
 * @example
 * countJSDoc('/** docs *\/ const x = 1') // 1
 */
export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

/**
 * Count all comments
 * @example
 * countComments('// inline') // 1
 */
export function countComments(content: string): number {
  const line = (content.match(/\/\/.*/g) || []).length
  const block = (content.match(/\/\*[\s\S]*?\*\//g) || []).length
  return line + block
}

/**
 * Count error handling keywords
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  const m = content.match(/\b(catch|finally|throw)\b/g)
  return m ? m.length : 0
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:number|string|boolean|void|any|unknown|never|object)\b/g)
  return m ? m.length : 0
}

/**
 * Count TODO markers
 * @example
 * countTodos('// TODO: fix') // 1
 */
export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b/gi)
  return m ? m.length : 0
}

/**
 * Count console calls
 * @example
 * countConsole('console.log("hi")') // 1
 */
export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

/**
 * Count branches
 * @example
 * countBranches('if (x) {}') // 1
 */
export function countBranches(content: string): number {
  const ifs = (content.match(/\bif\b/g) || []).length
  const switches = (content.match(/\bswitch\b/g) || []).length
  const ternaries = (content.match(/\?\s*[^;:]*\s*:/g) || []).length
  return ifs + switches + ternaries
}

/**
 * Count descriptive names
 * @example
 * countDescriptiveNames('function getData() {}') // 1
 */
export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

/**
 * Count default keywords
 * @example
 * countDefaults('export default class {}') // 1
 */
export function countDefaults(content: string): number {
  const m = content.match(/\bdefault\b/g)
  return m ? m.length : 0
}

/**
 * Count deprecated markers
 * @example
 * countDeprecated('@deprecated') // 1
 */
export function countDeprecated(content: string): number {
  const m = content.match(/\bdeprecated\b|\@deprecated/gi)
  return m ? m.length : 0
}

/**
 * Count return type annotations
 * @example
 * countReturnTypes('function foo(): string {}') // 1
 */
export function countReturnTypes(content: string): number {
  const m = content.match(/\)\s*:\s*\w+/g)
  return m ? m.length : 0
}

/**
 * Count generic type parameters
 * @example
 * countGenerics('function foo<T>() {}') // 1
 */
export function countGenerics(content: string): number {
  const m = content.match(/<\w+>/g)
  return m ? m.length : 0
}

/**
 * Count private members
 * @example
 * countPrivateMembers('private x: number') // 1
 */
export function countPrivateMembers(content: string): number {
  const m = content.match(/\bprivate\s+\w+/g)
  return m ? m.length : 0
}

// ─── Wall Measurement ───────────────────────────────────

/**
 * Measure boundary protection
 * @example
 * measureWall('export function foo(): void {}') // { strength, material, ... }
 */
export function measureWall(content: string): WallMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAnnotations(content)
  const functions = countFunctions(content)
  const errors = countErrorHandling(content)

  const strength = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (errors > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (functions > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0),
  )))

  const isThick = exports > 0 && interfaces > 0 && types > 0
  const hasProperFoundation = imports > 0 && exports > 0
  const hasReinforcedSections = errors > 0 && types > 0
  const crackCount = countTodos(content) + countDeprecated(content)
  const hasNoCracks = crackCount === 0
  const bridgeCount = countConsole(content)
  const hasNoBridges = bridgeCount === 0
  const hasParapet = errors > 0
  const hasBattlement = errors > 0 && countBranches(content) > 0
  const hasPortcullis = countPrivateMembers(content) > 0
  const hasArrowSlits = exports > 0 && imports > 0
  const hasMurderHoles = errors > 0 && countReturnTypes(content) > 0

  let material: WallMeasure['material'] = 'paper'
  if (strength >= 80 && isThick) material = 'granite'
  else if (strength >= 60 && interfaces > 0) material = 'limestone'
  else if (strength >= 45 && exports > 0) material = 'brick'
  else if (strength >= 30) material = 'wood'
  else if (strength >= 15) material = 'earth'

  return {
    strength, material, isThick, hasProperFoundation, hasReinforcedSections,
    hasNoCracks, hasNoBridges, hasParapet, hasBattlement, hasPortcullis,
    hasArrowSlits, hasMurderHoles, crackCount, bridgeCount,
  }
}

// ─── Moat Measurement ───────────────────────────────────

/**
 * Measure input validation depth
 * @example
 * measureMoat('function validate(x: number): boolean { return x > 0 }') // { depth, type, ... }
 */
export function measureMoat(content: string): MoatMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const returns = countReturnTypes(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)
  const descriptives = countDescriptiveNames(content)
  const functions = countFunctions(content)
  const exports = countExports(content)

  const depth = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (returns > 0 ? 15 : 0) +
    (errors > 0 ? 20 : 0) +
    (branches > 0 ? 10 : 0) +
    (descriptives > 0 ? 15 : 0) +
    (functions > 0 ? 10 : 0) +
    (exports > 0 ? 10 : 0),
  )))

  const isDeep = types > 0 && errors > 0 && branches > 0
  const hasDrawbridge = exports > 0 && imports(content) > 0
  const hasPortcullisChain = errors > 0 && branches > 0
  const hasAlligator = errors >= 3
  const hasWaterLevel = types > 0 && returns > 0
  const hasDrainage = errors > 0 && countGenerics(content) > 0
  const hasFloodgate = countAsync(content) > 0
  const bypassCount = countTodos(content) + countDeprecated(content)
  const hasNoBridges = bypassCount === 0
  const hasNoFordingPoints = countConsole(content) === 0
  const hasRippleDetection = countInterfaces(content) > 0 && types > 0

  let type: MoatMeasure['type'] = 'none'
  if (depth >= 80 && isDeep) type = 'poison'
  else if (depth >= 65 && errors > 0) type = 'fire'
  else if (depth >= 50 && types > 0) type = 'water'
  else if (depth >= 35) type = 'dry'
  else if (depth >= 20) type = 'ditch'

  return {
    depth, type, isDeep, hasDrawbridge, hasPortcullisChain,
    hasAlligator, hasWaterLevel, hasDrainage, hasFloodgate,
    hasNoBridges, hasNoFordingPoints, hasRippleDetection, bypassCount,
  }
}

/**
 * Count imports inline
 */
function imports(content: string): number {
  return countImports(content)
}

/**
 * Count async inline
 */
function countAsync(content: string): number {
  const m = content.match(/\basync\b/g)
  return m ? m.length : 0
}

// ─── Tower Measurement ──────────────────────────────────

/**
 * Measure monitoring coverage
 * @example
 * measureTower('/** docs *\/ export function foo(): void {}') // { coverage, type, ... }
 */
export function measureTower(content: string): TowerMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)
  const descriptives = countDescriptiveNames(content)

  const coverage = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (comments > 0 ? 10 : 0) +
    (types > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (errors > 0 ? 15 : 0) +
    (descriptives > 0 ? 15 : 0) +
    (countReturnTypes(content) > 0 ? 10 : 0),
  )))

  const hasFullCoverage = jsdoc >= 3 && exports > 0 && types > 0
  const hasWatchman = jsdoc > 0
  const hasWarningBell = errors > 0 && jsdoc > 0
  const hasLineOfSight = countInterfaces(content) > 0 && exports > 0
  const hasSignalFire = errors > 0
  const hasSearchlight = descriptives > 0 && jsdoc > 0
  const hasNightWatch = errors > 0
  const hasDayWatch = exports > 0 && types > 0
  const hasGuardRotation = countFunctions(content) > 0 && jsdoc > 0
  const blindSpotCount = countTodos(content) + countConsole(content)
  const hasBlindSpots = blindSpotCount > 0

  let type: TowerMeasure['type'] = 'stump'
  if (coverage >= 80 && hasFullCoverage) type = 'watchtower'
  else if (coverage >= 65 && exports > 0) type = 'corner-tower'
  else if (coverage >= 50 && types > 0) type = 'gatehouse-tower'
  else if (coverage >= 35) type = 'bastion'
  else if (coverage >= 20) type = 'turret'

  return {
    coverage, type, hasFullCoverage, hasWatchman, hasWarningBell,
    hasLineOfSight, hasSignalFire, hasSearchlight, hasNightWatch,
    hasDayWatch, hasGuardRotation, hasBlindSpots, blindSpotCount,
  }
}

// ─── Gate Measurement ───────────────────────────────────

/**
 * Measure access control security
 * @example
 * measureGate('private x: number\nexport function getX(): number { return this.x }') // { security, type, ... }
 */
export function measureGate(content: string): GateMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)
  const interfaces = countInterfaces(content)
  const errors = countErrorHandling(content)
  const descriptives = countDescriptiveNames(content)
  const privates = countPrivateMembers(content)
  const defaults = countDefaults(content)

  const security = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (privates > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (imports > 0 ? 10 : 0) +
    (types > 0 ? 15 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (errors > 0 ? 15 : 0) +
    (descriptives > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0),
  )))

  const isGuarded = privates > 0 && exports > 0
  const hasAuthentication = privates > 0
  const hasAuthorization = interfaces > 0 && privates > 0
  const hasAudit = errors > 0 && countConsole(content) > 0
  const hasRateLimit = countGenerics(content) > 0
  const hasThrottle = countAsync(content) > 0
  const hasQuarantine = errors > 0 && countBranches(content) > 0
  const hasVIPentrance = defaults > 0 && exports > 0
  const hasEmergencyExit = errors > 0
  const hasNoSecretPassage = countTodos(content) === 0
  const vulnerabilityCount = countDeprecated(content) + countTodos(content)

  let type: GateMeasure['type'] = 'wide-open'
  if (security >= 80 && isGuarded) type = 'portcullis'
  else if (security >= 65 && privates > 0) type = 'drawbridge'
  else if (security >= 50 && interfaces > 0) type = 'barbican'
  else if (security >= 35 && errors > 0) type = 'sally-port'
  else if (security >= 20) type = 'postern'

  return {
    security, type, isGuarded, hasAuthentication, hasAuthorization,
    hasAudit, hasRateLimit, hasThrottle, hasQuarantine, hasVIPentrance,
    hasEmergencyExit, hasNoSecretPassage, vulnerabilityCount,
  }
}

// ─── Siege Measurement ──────────────────────────────────

/**
 * Measure error handling readiness
 * @example
 * measureSiege('try {} catch(e) { console.error(e) }') // { readiness, state, ... }
 */
export function measureSiege(content: string): SiegeMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const defaults = countDefaults(content)
  const branches = countBranches(content)
  const descriptives = countDescriptiveNames(content)

  const readiness = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (types > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (imports > 0 ? 10 : 0) +
    (defaults > 0 ? 10 : 0) +
    (descriptives > 0 ? 10 : 0) +
    (branches > 0 ? 10 : 0) +
    (functions > 0 ? 10 : 0),
  )))

  const hasSupplies = errors > 0 && types > 0
  const hasReinforcements = errors > 0 && defaults > 0
  const hasCounterattack = errors > 0 && descriptives > 0
  const hasMedical = errors > 0 && branches > 0
  const hasEvacuation = errors > 0 && countGenerics(content) > 0
  const hasSiegeWeapons = errors > 0 && functions > 0
  const hasTrebuchet = errors >= 3
  const hasBoilingOil = errors > 0 && countConsole(content) > 0
  const hasFortifiedGate = errors > 0 && exports > 0 && types > 0
  const fallenWallCount = countTodos(content) + countDeprecated(content)
  const hasFallenWall = fallenWallCount > 2

  let state: SiegeMeasure['state'] = 'ruins'
  if (readiness >= 80 && hasFortifiedGate) state = 'peace'
  else if (readiness >= 65 && errors > 0) state = 'alert'
  else if (readiness >= 50) state = 'siege'
  else if (readiness >= 35) state = 'breach'
  else if (readiness >= 20) state = 'surrender'

  return {
    readiness, state, hasSupplies, hasReinforcements, hasCounterattack,
    hasMedical, hasEvacuation, hasSiegeWeapons, hasTrebuchet, hasBoilingOil,
    hasFortifiedGate, hasFallenWall, fallenWallCount,
  }
}

// ─── Structure Measurement ──────────────────────────────

/**
 * Measure code structural integrity
 * @example
 * measureStructure('interface Foo {} class Bar implements Foo {}') // { integrity, design, ... }
 */
export function measureStructure(content: string): StructureMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const classes = countClasses(content)
  const functions = countFunctions(content)
  const generics = countGenerics(content)
  const errors = countErrorHandling(content)

  const integrity = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 15 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (imports > 0 ? 10 : 0) +
    (classes > 0 ? 10 : 0) +
    (functions > 0 ? 10 : 0) +
    (errors > 0 ? 15 : 0) +
    (generics > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 5 : 0),
  )))

  const isStructurallySound = interfaces > 0 && exports > 0 && types > 0
  const hasLoadBearing = exports > 0 && imports > 0
  const hasFlyingButtress = imports > 0 && errors > 0
  const hasKeystone = classes > 0 && interfaces > 0
  const hasFoundation = imports > 0 && exports > 0
  const hasReinforcement = generics > 0 && types > 0
  const hasExpansionJoints = countDescriptiveNames(content) > 0 && functions > 0
  const hasWeatherProofing = errors > 0 && countBranches(content) > 0
  const hasSeismicResistance = errors > 0 && types > 0
  const hasFireResistance = countAsync(content) > 0 || countAwait(content) > 0
  const weaknessCount = countTodos(content) + countConsole(content) + countDeprecated(content)

  let design: StructureMeasure['design'] = 'sandcastle'
  if (integrity >= 80 && isStructurallySound) design = 'concentric'
  else if (integrity >= 65 && classes > 0) design = 'bastion'
  else if (integrity >= 50 && interfaces > 0) design = 'star-fort'
  else if (integrity >= 35 && exports > 0) design = 'motte-and-bailey'
  else if (integrity >= 20) design = 'palisade'

  return {
    integrity, design, isStructurallySound, hasLoadBearing, hasFlyingButtress,
    hasKeystone, hasFoundation, hasReinforcement, hasExpansionJoints,
    hasWeatherProofing, hasSeismicResistance, hasFireResistance, weaknessCount,
  }
}

/**
 * Count await inline
 */
function countAwait(content: string): number {
  const m = content.match(/\bawait\b/g)
  return m ? m.length : 0
}

// ─── Reading Analysis ───────────────────────────────────

/**
 * Analyze a single file as a fortification reading
 * @example
 * analyzeFortificationReading(content, 'file.ts') // FortificationReading
 */
export function analyzeFortificationReading(content: string, filePath: string): FortificationReading {
  const wall = measureWall(content)
  const moat = measureMoat(content)
  const tower = measureTower(content)
  const gate = measureGate(content)
  const siege = measureSiege(content)
  const structure = measureStructure(content)

  const wallStrength = wall.strength
  const moatDepth = moat.depth
  const towerCoverage = tower.coverage
  const gateSecurity = gate.security
  const siegeReadiness = siege.readiness
  const structuralIntegrity = structure.integrity

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (wallStrength * 0.20) +
    (moatDepth * 0.15) +
    (towerCoverage * 0.15) +
    (gateSecurity * 0.15) +
    (siegeReadiness * 0.20) +
    (structuralIntegrity * 0.15),
  )))

  const condition = classifyReadingCondition(qualityScore, wall, gate)

  return {
    file: filePath,
    wallStrength, moatDepth, towerCoverage, gateSecurity,
    siegeReadiness, structuralIntegrity,
    wall, moat, tower, gate, siege, structure,
    condition, qualityScore,
  }
}

/**
 * Classify reading condition
 * @example
 * classifyReadingCondition(90, wall, gate) // 'impregnable-fortress'
 */
export function classifyReadingCondition(
  score: number,
  wall: WallMeasure,
  gate: GateMeasure,
): FortificationReading['condition'] {
  if (score >= 80 && wall.isThick && gate.isGuarded) return 'impregnable-fortress'
  if (score >= 65 && wall.hasProperFoundation) return 'stronghold'
  if (score >= 50 && wall.hasParapet) return 'castle'
  if (score >= 35) return 'fort'
  if (score >= 20) return 'stockade'
  return 'ruins'
}

// ─── Zone Analysis ──────────────────────────────────────

/**
 * Analyze a directory as a defense zone
 * @example
 * analyzeDefenseZone(readings, 'src/') // DefenseZone
 */
export function analyzeDefenseZone(readings: FortificationReading[], dirPath: string): DefenseZone {
  const count = readings.length
  if (count === 0) {
    return {
      directory: dirPath, readings: [],
      avgWallStrength: 0, avgMoatDepth: 0, avgGateSecurity: 0,
      impregnableCount: 0, ruinsCount: 0, deepMoatCount: 0, guardedGateCount: 0,
      zoneType: 'no-mans-land', condition: 'open-field',
    }
  }

  const avgWallStrength = Math.round(readings.reduce((s, r) => s + r.wallStrength, 0) / count)
  const avgMoatDepth = Math.round(readings.reduce((s, r) => s + r.moatDepth, 0) / count)
  const avgGateSecurity = Math.round(readings.reduce((s, r) => s + r.gateSecurity, 0) / count)

  const impregnableCount = readings.filter(r => r.condition === 'impregnable-fortress').length
  const ruinsCount = readings.filter(r => r.condition === 'ruins').length
  const deepMoatCount = readings.filter(r => r.moat.isDeep).length
  const guardedGateCount = readings.filter(r => r.gate.isGuarded).length

  const zoneType = classifyZoneType(readings, avgWallStrength)
  const condition = classifyZoneCondition(avgWallStrength)

  return {
    directory: dirPath, readings,
    avgWallStrength, avgMoatDepth, avgGateSecurity,
    impregnableCount, ruinsCount, deepMoatCount, guardedGateCount,
    zoneType, condition,
  }
}

/**
 * Classify zone type
 * @example
 * classifyZoneType(readings, 80) // 'citadel'
 */
export function classifyZoneType(readings: FortificationReading[], avgWall: number): DefenseZone['zoneType'] {
  if (readings.length === 0) return 'no-mans-land'
  const impregnableRatio = readings.filter(r => r.condition === 'impregnable-fortress').length / readings.length
  const allGood = readings.every(r => r.qualityScore >= 50)

  if (impregnableRatio >= 0.5 && avgWall >= 70) return 'citadel'
  if (allGood && avgWall >= 55) return 'inner-wall'
  if (avgWall >= 45) return 'outer-wall'
  if (avgWall >= 30) return 'bailey'
  if (avgWall >= 15) return 'outpost'
  return 'no-mans-land'
}

/**
 * Classify zone condition
 * @example
 * classifyZoneCondition(80) // 'fortress-network'
 */
export function classifyZoneCondition(avgWall: number): DefenseZone['condition'] {
  if (avgWall >= 75) return 'fortress-network'
  if (avgWall >= 60) return 'castle-complex'
  if (avgWall >= 45) return 'walled-city'
  if (avgWall >= 30) return 'fortified-camp'
  if (avgWall >= 15) return 'outpost'
  return 'open-field'
}

// ─── Commander Grade ────────────────────────────────────

/**
 * Classify commander grade
 * @example
 * classifyCommanderGrade(90) // 'field-marshal'
 */
export function classifyCommanderGrade(avgDefense: number): FortressWallStats['commanderGrade'] {
  if (avgDefense >= 75) return 'field-marshal'
  if (avgDefense >= 60) return 'general'
  if (avgDefense >= 45) return 'colonel'
  if (avgDefense >= 30) return 'captain'
  if (avgDefense >= 15) return 'sergeant'
  return 'private'
}

// ─── Recommendations ────────────────────────────────────

/**
 * Generate fortress recommendations
 * @example
 * generateRecommendations(readings, zones, kingdom, stats) // ['Add error handling...']
 */
export function generateRecommendations(
  readings: FortificationReading[],
  _zones: DefenseZone[],
  _kingdom: KingdomMeasure,
  stats: FortressWallStats,
): string[] {
  const recs: string[] = []

  if (stats.ruinsCount > 0) {
    recs.push('Add exports, types, and error handling to rebuild ruins into fortifications')
  }
  if (stats.vulnerabilityCount > stats.totalFiles * 0.3) {
    recs.push('Remove deprecated markers and TODOs to patch gate vulnerabilities')
  }
  if (stats.avgWallStrength < 35) {
    recs.push('Add interfaces and type annotations to strengthen boundary walls')
  }
  if (stats.avgMoatDepth < 35) {
    recs.push('Add input validation and type guards to deepen the defensive moat')
  }
  if (stats.hasBlindSpotsCount > stats.totalFiles * 0.4) {
    recs.push('Remove console calls and TODOs to eliminate tower blind spots')
  }
  if (stats.avgSiegeReadiness < 35) {
    recs.push('Add try-catch blocks and error recovery to improve siege readiness')
  }
  if (stats.isGuardedCount < stats.totalFiles * 0.3) {
    recs.push('Use private members with public accessors to guard your gates')
  }

  if (recs.length === 0) {
    recs.push('This fortress stands impregnable — maintain your defenses vigilantly')
  }

  return recs
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * Build the full fortress wall result
 * @example
 * buildFortressWallResult(files, contents, {}) // FortressWallResult
 */
export function buildFortressWallResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown> = {},
): FortressWallResult {
  const readings: FortificationReading[] = files.map((file, i) =>
    analyzeFortificationReading(contents[i] ?? '', file),
  )

  const zoneMap = new Map<string, FortificationReading[]>()
  for (const reading of readings) {
    const dir = reading.file.includes('/') ? reading.file.substring(0, reading.file.lastIndexOf('/')) : '.'
    const existing = zoneMap.get(dir)
    if (existing) {
      existing.push(reading)
    } else {
      zoneMap.set(dir, [reading])
    }
  }

  const zones: DefenseZone[] = Array.from(zoneMap.entries()).map(([dir, zReadings]) =>
    analyzeDefenseZone(zReadings, dir),
  )

  const totalFiles = readings.length
  const avg = (fn: (r: FortificationReading) => number) =>
    totalFiles === 0 ? 0 : Math.round(readings.reduce((s, r) => s + fn(r), 0) / totalFiles)

  const overallDefense = avg(r => r.qualityScore)

  const kingdom: KingdomMeasure = {
    avgWallStrength: avg(r => r.wallStrength),
    avgMoatDepth: avg(r => r.moatDepth),
    avgGateSecurity: avg(r => r.gateSecurity),
    isImpregnable: overallDefense >= 60,
    overallDefense,
  }

  const bestReading = readings.length > 0
    ? readings.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best, readings[0]).file
    : ''
  const strongestWall = readings.length > 0
    ? readings.reduce((best, r) => r.wallStrength > best.wallStrength ? r : best, readings[0]).file
    : ''
  const deepestMoat = readings.length > 0
    ? readings.reduce((best, r) => r.moatDepth > best.moatDepth ? r : best, readings[0]).file
    : ''
  const securestGate = readings.length > 0
    ? readings.reduce((best, r) => r.gateSecurity > best.gateSecurity ? r : best, readings[0]).file
    : ''
  const mostReady = readings.length > 0
    ? readings.reduce((best, r) => r.siegeReadiness > best.siegeReadiness ? r : best, readings[0]).file
    : ''

  const stats: FortressWallStats = {
    totalFiles,
    totalZones: zones.length,
    avgWallStrength: kingdom.avgWallStrength,
    avgMoatDepth: kingdom.avgMoatDepth,
    avgTowerCoverage: avg(r => r.towerCoverage),
    avgGateSecurity: kingdom.avgGateSecurity,
    avgSiegeReadiness: avg(r => r.siegeReadiness),
    avgStructuralIntegrity: avg(r => r.structuralIntegrity),
    impregnableFortressCount: readings.filter(r => r.condition === 'impregnable-fortress').length,
    strongholdCount: readings.filter(r => r.condition === 'stronghold').length,
    castleCount: readings.filter(r => r.condition === 'castle').length,
    fortCount: readings.filter(r => r.condition === 'fort').length,
    stockadeCount: readings.filter(r => r.condition === 'stockade').length,
    ruinsCount: readings.filter(r => r.condition === 'ruins').length,
    isThickCount: readings.filter(r => r.wall.isThick).length,
    hasNoCracksCount: readings.filter(r => r.wall.hasNoCracks).length,
    isDeepCount: readings.filter(r => r.moat.isDeep).length,
    hasNoBridgesCount: readings.filter(r => r.moat.hasNoBridges).length,
    hasFullCoverageCount: readings.filter(r => r.tower.hasFullCoverage).length,
    hasBlindSpotsCount: readings.filter(r => r.tower.hasBlindSpots).length,
    isGuardedCount: readings.filter(r => r.gate.isGuarded).length,
    hasAuthenticationCount: readings.filter(r => r.gate.hasAuthentication).length,
    vulnerabilityCount: readings.reduce((s, r) => s + r.gate.vulnerabilityCount, 0),
    isStructurallySoundCount: readings.filter(r => r.structure.isStructurallySound).length,
    hasKeystoneCount: readings.filter(r => r.structure.hasKeystone).length,
    overallDefense,
    commanderGrade: classifyCommanderGrade(overallDefense),
    bestReading, strongestWall, deepestMoat, securestGate, mostReady,
  }

  const recommendations = generateRecommendations(readings, zones, kingdom, stats)

  return { readings, zones, kingdom, stats, recommendations }
}
