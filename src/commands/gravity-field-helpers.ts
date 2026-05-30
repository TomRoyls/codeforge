// ─── Interfaces ────────────────────────────────────────────────────────────

export interface MassMeasure {
  pull: number
  classification: 'black-hole' | 'neutron-star' | 'main-sequence' | 'red-dwarf' | 'brown-dwarf' | 'asteroid'
  isMassive: boolean
  hasStrongPull: boolean
  hasWeakPull: boolean
  hasEventHorizon: boolean
  hasAccretionDisk: boolean
  hasGravitationalLens: boolean
  hasProperMass: boolean
  hasBinaryCompanion: boolean
  hasTidalLocking: boolean
  companionCount: number
}

export interface OrbitMeasure {
  stability: number
  type: 'circular' | 'elliptical' | 'parabolic' | 'hyperbolic' | 'chaotic' | 'collision-course'
  isStable: boolean
  hasCleanOrbit: boolean
  hasResonance: boolean
  hasRetrograde: boolean
  hasPrecession: boolean
  hasPerturbation: boolean
  hasEccentricity: boolean
  hasProperPeriod: boolean
  hasOrbitalMechanics: boolean
  perturbationCount: number
}

export interface TidalMeasure {
  force: number
  type: 'spring' | 'neap' | 'equilibrium' | 'dynamic' | 'destructive' | 'none'
  isManageable: boolean
  hasTidalBulge: boolean
  hasTidalLocking: boolean
  hasTidalHeating: boolean
  hasTidalStripping: boolean
  hasRocheLimit: boolean
  hasTidalResonance: boolean
  hasCushionEffect: boolean
  hasNoStress: boolean
  stressPointCount: number
}

export interface EscapeMeasure {
  velocity: number
  difficulty: 'trivial' | 'easy' | 'moderate' | 'difficult' | 'extreme' | 'impossible'
  isDecouplable: boolean
  hasLowCoupling: boolean
  hasHighCoupling: boolean
  hasCircularReference: boolean
  hasDiamondDependency: boolean
  hasInterfaceBarrier: boolean
  hasDependencyInjection: boolean
  hasPlugInArchitecture: boolean
  hasCleanSeparation: boolean
  circularRefCount: number
  diamondCount: number
}

export interface FieldMeasure {
  strength: number
  type: 'uniform' | 'radial' | 'dipole' | 'multipole' | 'chaotic' | 'absent'
  hasStrongField: boolean
  hasWeakField: boolean
  hasFieldLines: boolean
  hasFluxDensity: boolean
  hasMagneticMoment: boolean
  hasInducedField: boolean
  hasShielding: boolean
  hasFieldCollapse: boolean
  hasIsotropic: boolean
  hasAnisotropic: boolean
  shieldingCount: number
}

export interface DecayMeasure {
  health: number
  type: 'stable' | 'slow-decay' | 'moderate-decay' | 'rapid-decay' | 'degenerate' | 'collapsed'
  isHealthy: boolean
  hasNoDecay: boolean
  hasSlowDecay: boolean
  hasRadiationPressure: boolean
  hasOrbitalLowering: boolean
  hasAtmosphericDrag: boolean
  hasSolarWind: boolean
  hasPoyntingRobertson: boolean
  hasYarkovskyEffect: boolean
  hasTidalDissipation: boolean
  dragCount: number
}

export interface GravitationalBody {
  file: string
  gravitationalPull: number
  orbitalStability: number
  tidalForce: number
  escapeVelocity: number
  fieldStrength: number
  orbitalDecay: number
  mass: MassMeasure
  orbit: OrbitMeasure
  tidal: TidalMeasure
  escape: EscapeMeasure
  field: FieldMeasure
  decay: DecayMeasure
  condition: 'stable-star' | 'planetary-system' | 'binary-system' | 'chaotic-orbit' | 'black-hole' | 'supernova-remnant'
  qualityScore: number
}

export interface StellarRegion {
  directory: string
  bodies: GravitationalBody[]
  avgPull: number
  avgStability: number
  avgFieldStrength: number
  stableStarCount: number
  blackHoleCount: number
  decouplableCount: number
  cleanOrbitCount: number
  regionType: 'galaxy-core' | 'spiral-arm' | 'open-cluster' | 'globular-cluster' | 'binary-system' | 'void'
  condition: 'stable-system' | 'evolving-system' | 'dynamic-system' | 'unstable-system' | 'chaotic-system' | 'collapsed-system'
}

export interface GravityCosmos {
  avgPull: number
  avgStability: number
  avgFieldStrength: number
  isStable: boolean
  overallStability: number
}

export interface GravityStats {
  totalFiles: number
  totalRegions: number
  avgGravitationalPull: number
  avgOrbitalStability: number
  avgTidalForce: number
  avgEscapeVelocity: number
  avgFieldStrength: number
  avgOrbitalDecay: number
  stableStarCount: number
  planetarySystemCount: number
  binarySystemCount: number
  chaoticOrbitCount: number
  blackHoleCount: number
  supernovaRemnantCount: number
  isMassiveCount: number
  hasStrongPullCount: number
  isStableCount: number
  hasPerturbationCount: number
  isManageableCount: number
  isDecouplableCount: number
  hasCircularReferenceCount: number
  hasStrongFieldCount: number
  isHealthyCount: number
  hasSlowDecayCount: number
  overallStability: number
  astrophysicistGrade: 'chief-astrophysicist' | 'astrophysicist' | 'astronomer' | 'stargazer' | 'amateur' | 'lost-in-space'
  bestBody: string
  mostStable: string
  mostDecouplable: string
  strongestField: string
  healthiestDecay: string
}

export interface GravityFieldResult {
  bodies: GravitationalBody[]
  regions: StellarRegion[]
  cosmos: GravityCosmos
  stats: GravityStats
  recommendations: string[]
}

// ─── Regex Constants ───────────────────────────────────────────────────────

const IMPORT_REGEX = /import\s/g
const EXPORT_REGEX = /export\s/g
const FROM_REGEX = /from\s+['"]/g
const REQUIRE_REGEX = /require\s*\(/g
const CLASS_REGEX = /\bclass\s+\w+/g
const INTERFACE_REGEX = /\binterface\s+\w+/g
const TYPE_REGEX = /\btype\s+\w+/g
const FUNCTION_REGEX = /\b(function|const\s+\w+\s*=\s*(\(|[^=]=>))\b/g
const ASYNC_REGEX = /\basync\b/g
const AWAIT_REGEX = /\bawait\b/g
const RETURN_REGEX = /\breturn\b/g
const TRY_CATCH_REGEX = /\btry\s*\{/g
const IF_REGEX = /\bif\s*\(/g
const FOR_REGEX = /\bfor\s*\(/g
const WHILE_REGEX = /\bwhile\s*\(/g
const NEW_REGEX = /\bnew\s+\w+/g
const EXTENDS_REGEX = /\bextends\s+/g
const IMPLEMENTS_REGEX = /\bimplements\s+/g
const CONSOLE_REGEX = /\bconsole\./g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const DEPRECATED_REGEX = /@deprecated/g
const ANY_REGEX = /:\s*any\b/g
const TS_IGNORE_REGEX = /@ts-ignore/g
const TYPE_ANNOTATION_REGEX = /:\s*(string|number|boolean|void|never|unknown|any|null|undefined|object)/g
const GENERIC_REGEX = /<\w+/g
const ARROW_REGEX = /=>/g
const SPREAD_REGEX = /\.\.\./g
const DESTRUCTURE_REGEX = /\{\s*\w+/g
const OPTIONAL_CHAIN_REGEX = /\?\.\w/g
const NULLISH_REGEX = /\?\?/g
const PRIVATE_REGEX = /\bprivate\s/g
const PROTECTED_REGEX = /\bprotected\s/g
const PUBLIC_REGEX = /\bpublic\s/g
const ABSTRACT_REGEX = /\babstract\s/g
const EMIT_REGEX = /\.emit\s*\(/g
const LISTEN_REGEX = /\.on\s*\(/g
const SUBSCRIBE_REGEX = /\.subscribe\s*\(/g
const DEFAULT_EXPORT_REGEX = /export\s+default/g
const RE_EXPORT_REGEX = /export\s+\*\s+from/g
const DYNAMIC_IMPORT_REGEX = /import\s*\(/g
const INJECT_REGEX = /@inject|inject\s*\(/g
const PLUGIN_REGEX = /plugin|Plugin/g
const STRATEGY_REGEX = /strategy|Strategy/g
const FACTORY_REGEX = /factory|Factory/g
const OBSERVER_REGEX = /observer|Observer|subscribe|Subscribe/g

// ─── Helper Counting Functions ─────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countNonEmptyLines(content: string): number {
  let count = 0
  for (const line of content.split('\n')) {
    if (line.trim().length > 0) count++
  }
  return count
}

function countImports(content: string): number {
  return countMatches(content, IMPORT_REGEX) + countMatches(content, REQUIRE_REGEX)
}

function countExports(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

function countFunctions(content: string): number {
  return countMatches(content, FUNCTION_REGEX) + countMatches(content, ARROW_REGEX)
}

function countClasses(content: string): number {
  return countMatches(content, CLASS_REGEX)
}

function countInterfaces(content: string): number {
  return countMatches(content, INTERFACE_REGEX)
}

function countTypeAnnotations(content: string): number {
  return countMatches(content, TYPE_ANNOTATION_REGEX)
}

function countConditionals(content: string): number {
  return countMatches(content, IF_REGEX)
}

function countLoops(content: string): number {
  return countMatches(content, FOR_REGEX) + countMatches(content, WHILE_REGEX)
}

function countErrorHandling(content: string): number {
  return countMatches(content, TRY_CATCH_REGEX)
}

function countSmells(content: string): number {
  return countMatches(content, CONSOLE_REGEX) + countMatches(content, TODO_REGEX) + countMatches(content, DEPRECATED_REGEX) + countMatches(content, ANY_REGEX) + countMatches(content, TS_IGNORE_REGEX)
}

function countTodos(content: string): number {
  return countMatches(content, TODO_REGEX)
}

// ─── measureMass ───────────────────────────────────────────────────────────

/** @example measureMass('import { Foo } from "bar"; export class Baz extends Foo {}') returns MassMeasure */
export function measureMass(content: string): MassMeasure {
  const imports = countImports(content)
  const exports = countExports(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const funcs = countFunctions(content)
  const lines = countNonEmptyLines(content)
  const extends_ = countMatches(content, EXTENDS_REGEX)
  const implements_ = countMatches(content, IMPLEMENTS_REGEX)
  const newUsage = countMatches(content, NEW_REGEX)
  const fromRefs = countMatches(content, FROM_REGEX)
  const dynamicImports = countMatches(content, DYNAMIC_IMPORT_REGEX)
  const reExports = countMatches(content, RE_EXPORT_REGEX)

  const couplingSignals = imports + fromRefs + extends_ + implements_ + newUsage + dynamicImports
  const basePull = lines === 0 ? 5 : Math.min(60, couplingSignals * 6 + classes * 8 + funcs * 2)
  const exportBonus = Math.min(20, exports * 3 + reExports * 5)
  const companionBonus = Math.min(15, fromRefs * 3 + dynamicImports * 4)
  const pull = Math.min(100, basePull + exportBonus + companionBonus)

  const isMassive = pull >= 70
  const hasStrongPull = pull >= 50
  const hasWeakPull = pull < 30
  const hasEventHorizon = pull >= 90
  const hasAccretionDisk = imports >= 5
  const hasGravitationalLens = classes >= 2 && interfaces >= 1
  const hasProperMass = pull >= 30 && pull <= 70
  const hasBinaryCompanion = extends_ >= 1 && implements_ >= 1
  const hasTidalLocking = imports >= 3 && lines > 0 && exports === 0

  let classification: MassMeasure['classification']
  if (pull >= 90) classification = 'black-hole'
  else if (pull >= 70) classification = 'neutron-star'
  else if (pull >= 50) classification = 'main-sequence'
  else if (pull >= 30) classification = 'red-dwarf'
  else if (pull >= 15) classification = 'brown-dwarf'
  else classification = 'asteroid'

  return {
    pull,
    classification,
    isMassive,
    hasStrongPull,
    hasWeakPull,
    hasEventHorizon,
    hasAccretionDisk,
    hasGravitationalLens,
    hasProperMass,
    hasBinaryCompanion,
    hasTidalLocking,
    companionCount: fromRefs + dynamicImports,
  }
}

// ─── measureOrbit ──────────────────────────────────────────────────────────

/** @example measureOrbit('export async function run(): Promise<void> { if (true) { return; } }') returns OrbitMeasure */
export function measureOrbit(content: string): OrbitMeasure {
  const lines = countNonEmptyLines(content)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const errorHandling = countErrorHandling(content)
  const returns = countMatches(content, RETURN_REGEX)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const awaits = countMatches(content, AWAIT_REGEX)
  const funcs = countFunctions(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const classes = countClasses(content)

  const hasCode = lines > 0
  const baseStability = lines === 0 ? 5 : Math.min(40, errorHandling * 8 + returns * 2)
  const flowBonus = Math.min(20, conditionals * 2 + loops * 3)
  const asyncBonus = Math.min(15, (asyncs + awaits) * 4)
  const structureBonus = Math.min(20, classes * 4 + funcs * 2 + exports * 2)
  const importPenalty = Math.min(10, imports > 10 ? (imports - 10) * 2 : 0)
  const stability = Math.max(0, Math.min(100, baseStability + flowBonus + asyncBonus + structureBonus - importPenalty))

  const isStable = stability >= 60
  const hasCleanOrbit = hasCode && errorHandling > 0 && returns > 0
  const hasResonance = asyncs > 0 && awaits > 0
  const hasRetrograde = loops > 0 && conditionals > loops * 3
  const hasPrecession = imports > 5 && exports > 0
  const hasPerturbation = countMatches(content, CONSOLE_REGEX) > 0 || countTodos(content) > 0
  const hasEccentricity = conditionals > 5 && loops < 2
  const hasProperPeriod = funcs > 0 && returns > 0
  const hasOrbitalMechanics = hasCode && (conditionals > 0 || loops > 0) && errorHandling > 0

  let type: OrbitMeasure['type']
  if (stability >= 80) type = 'circular'
  else if (stability >= 60) type = 'elliptical'
  else if (stability >= 40) type = 'parabolic'
  else if (stability >= 25) type = 'hyperbolic'
  else if (stability >= 10) type = 'chaotic'
  else type = 'collision-course'

  const perturbationCount = countMatches(content, CONSOLE_REGEX) + countTodos(content)

  return {
    stability,
    type,
    isStable,
    hasCleanOrbit,
    hasResonance,
    hasRetrograde,
    hasPrecession,
    hasPerturbation,
    hasEccentricity,
    hasProperPeriod,
    hasOrbitalMechanics,
    perturbationCount,
  }
}

// ─── measureTidal ──────────────────────────────────────────────────────────

/** @example measureTidal('export class Foo { constructor(private bar: Bar) {} method() { return this.bar.baz(); } }') returns TidalMeasure */
export function measureTidal(content: string): TidalMeasure {
  const lines = countNonEmptyLines(content)
  const params = countMatches(content, /\([^)]*\)/g)
  const methodChains = countMatches(content, /\.\w+\s*\(\s*\)\s*\.\w+/g)
  const nestedCalls = countMatches(content, /\w+\.\w+\.\w+/g)
  const generics = countMatches(content, GENERIC_REGEX)
  const spreads = countMatches(content, SPREAD_REGEX)
  const destructures = countMatches(content, DESTRUCTURE_REGEX)
  const optionalChains = countMatches(content, OPTIONAL_CHAIN_REGEX)
  const nullish = countMatches(content, NULLISH_REGEX)
  const privateMembers = countMatches(content, PRIVATE_REGEX) + countMatches(content, PROTECTED_REGEX)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)

  const baseForce = lines === 0 ? 5 : Math.min(40, methodChains * 10 + nestedCalls * 5 + params * 2)
  const interfaceStress = Math.min(20, generics * 4 + spreads * 3)
  const accessStress = Math.min(20, privateMembers * 3)
  const complexityStress = Math.min(15, destructures * 2 + optionalChains * 3 + nullish * 2)
  const mitigation = Math.min(20, interfaces * 5 + optionalChains * 2 + nullish * 2)
  const force = Math.max(0, Math.min(100, baseForce + interfaceStress + accessStress + complexityStress - mitigation))

  const isManageable = force < 50
  const hasTidalBulge = methodChains > 0
  const hasTidalLocking = privateMembers > 2 && classes > 0
  const hasTidalHeating = nestedCalls > 3
  const hasTidalStripping = spreads > 2 && destructures > 2
  const hasRocheLimit = force >= 80
  const hasTidalResonance = force >= 60 && generics > 2
  const hasCushionEffect = interfaces > 0 && optionalChains > 0
  const hasNoStress = force < 20

  let type: TidalMeasure['type']
  if (force >= 80) type = 'destructive'
  else if (force >= 60) type = 'dynamic'
  else if (force >= 40) type = 'spring'
  else if (force >= 20) type = 'neap'
  else if (force > 5) type = 'equilibrium'
  else type = 'none'

  const stressPointCount = methodChains + nestedCalls + spreads

  return {
    force,
    type,
    isManageable,
    hasTidalBulge,
    hasTidalLocking,
    hasTidalHeating,
    hasTidalStripping,
    hasRocheLimit,
    hasTidalResonance,
    hasCushionEffect,
    hasNoStress,
    stressPointCount,
  }
}

// ─── measureEscape ─────────────────────────────────────────────────────────

/** @example measureEscape('import { Foo } from "bar"; export class Baz { constructor(foo: Foo) {} }') returns EscapeMeasure */
export function measureEscape(content: string): EscapeMeasure {
  const imports = countImports(content)
  const exports = countExports(content)
  const fromRefs = countMatches(content, FROM_REGEX)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countMatches(content, TYPE_REGEX)
  const extends_ = countMatches(content, EXTENDS_REGEX)
  const implements_ = countMatches(content, IMPLEMENTS_REGEX)
  const injects = countMatches(content, INJECT_REGEX)
  const plugins = countMatches(content, PLUGIN_REGEX)
  const strategies = countMatches(content, STRATEGY_REGEX)
  const factories = countMatches(content, FACTORY_REGEX)
  const abstracts = countMatches(content, ABSTRACT_REGEX)
  const defaultExports = countMatches(content, DEFAULT_EXPORT_REGEX)
  const reExports = countMatches(content, RE_EXPORT_REGEX)
  const lines = countNonEmptyLines(content)

  const couplingRaw = imports + fromRefs + extends_ + implements_
  const baseVelocity = lines === 0 ? 5 : Math.min(50, couplingRaw * 5 + defaultExports * 3 + reExports * 4)
  const inheritancePenalty = Math.min(20, (extends_ + implements_) * 8)
  const abstractionBonus = Math.min(25, interfaces * 5 + types * 3 + abstracts * 5)
  const patternBonus = Math.min(15, injects * 5 + plugins * 3 + strategies * 3 + factories * 3)
  const velocity = Math.max(0, Math.min(100, baseVelocity + inheritancePenalty - abstractionBonus - patternBonus))

  const hasLowCoupling = velocity < 30
  const hasHighCoupling = velocity >= 70
  const hasCircularReference = imports > 0 && extends_ > 0 && exports === 0
  const hasDiamondDependency = extends_ >= 2
  const hasInterfaceBarrier = interfaces > 0 && classes > 0
  const hasDependencyInjection = injects > 0
  const hasPlugInArchitecture = plugins > 0 || strategies > 0 || factories > 0
  const hasCleanSeparation = interfaces > 0 && implements_ > 0 && couplingRaw < 5
  const isDecouplable = velocity < 40 || (interfaces > 0 && hasCleanSeparation)

  let difficulty: EscapeMeasure['difficulty']
  if (velocity >= 90) difficulty = 'impossible'
  else if (velocity >= 70) difficulty = 'extreme'
  else if (velocity >= 50) difficulty = 'difficult'
  else if (velocity >= 30) difficulty = 'moderate'
  else if (velocity >= 15) difficulty = 'easy'
  else difficulty = 'trivial'

  const circularRefCount = hasCircularReference ? 1 : 0
  const diamondCount = hasDiamondDependency ? Math.max(0, extends_ - 1) : 0

  return {
    velocity,
    difficulty,
    isDecouplable,
    hasLowCoupling,
    hasHighCoupling,
    hasCircularReference,
    hasDiamondDependency,
    hasInterfaceBarrier,
    hasDependencyInjection,
    hasPlugInArchitecture,
    hasCleanSeparation,
    circularRefCount,
    diamondCount,
  }
}

// ─── measureField ──────────────────────────────────────────────────────────

/** @example measureField('export { Foo, Bar, Baz }; export type Config = {};') returns FieldMeasure */
export function measureField(content: string): FieldMeasure {
  const exports = countExports(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countMatches(content, TYPE_REGEX)
  const defaultExports = countMatches(content, DEFAULT_EXPORT_REGEX)
  const reExports = countMatches(content, RE_EXPORT_REGEX)
  const observers = countMatches(content, OBSERVER_REGEX)
  const emits = countMatches(content, EMIT_REGEX)
  const listens = countMatches(content, LISTEN_REGEX)
  const subscribes = countMatches(content, SUBSCRIBE_REGEX)
  const lines = countNonEmptyLines(content)
  const publicMembers = countMatches(content, PUBLIC_REGEX)

  const influenceSignals = exports + reExports + defaultExports + observers + emits
  const baseStrength = lines === 0 ? 5 : Math.min(50, influenceSignals * 3 + classes * 5)
  const typeInfluence = Math.min(20, interfaces * 4 + types * 3)
  const eventInfluence = Math.min(20, (emits + listens + subscribes) * 5)
  const visibilityInfluence = Math.min(15, publicMembers * 2)
  const strength = Math.min(100, baseStrength + typeInfluence + eventInfluence + visibilityInfluence)

  const hasStrongField = strength >= 60
  const hasWeakField = strength < 30
  const hasFieldLines = exports > 0
  const hasFluxDensity = classes > 0 && exports > 3
  const hasMagneticMoment = emits > 0 || subscribes > 0
  const hasInducedField = observers > 0
  const hasShielding = interfaces > 0 && publicMembers === 0
  const hasFieldCollapse = exports === 0 && classes === 0 && lines > 0
  const hasIsotropic = exports > 0 && emits === 0 && listens === 0
  const hasAnisotropic = emits > 0 || listens > 0

  let type: FieldMeasure['type']
  if (strength >= 80) type = 'multipole'
  else if (strength >= 60) type = 'dipole'
  else if (strength >= 40) type = 'radial'
  else if (strength >= 20) type = 'uniform'
  else if (strength > 5) type = 'absent'
  else type = 'absent'

  const shieldingCount = interfaces + types

  return {
    strength,
    type,
    hasStrongField,
    hasWeakField,
    hasFieldLines,
    hasFluxDensity,
    hasMagneticMoment,
    hasInducedField,
    hasShielding,
    hasFieldCollapse,
    hasIsotropic,
    hasAnisotropic,
    shieldingCount,
  }
}

// ─── measureDecay ──────────────────────────────────────────────────────────

/** @example measureDecay('// TODO: refactor\nconsole.log("debug");\nany') returns DecayMeasure */
export function measureDecay(content: string): DecayMeasure {
  const lines = countNonEmptyLines(content)
  const todos = countTodos(content)
  const deprecated = countMatches(content, DEPRECATED_REGEX)
  const anys = countMatches(content, ANY_REGEX)
  const tsIgnores = countMatches(content, TS_IGNORE_REGEX)
  const console_ = countMatches(content, CONSOLE_REGEX)
  const smells = countSmells(content)
  const errorHandling = countErrorHandling(content)
  const classes = countClasses(content)
  const funcs = countFunctions(content)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const typeAnnotations = countTypeAnnotations(content)

  const decaySignals = todos + deprecated + anys + tsIgnores + console_
  const baseHealth = lines === 0 ? 5 : Math.min(50, errorHandling * 5 + typeAnnotations * 2 + classes * 3 + funcs * 2)
  const asyncBonus = Math.min(15, asyncs * 4)
  const healthBonus = Math.min(20, Math.max(0, 20 - decaySignals * 4))
  const smellPenalty = Math.min(30, smells * 5)
  const health = Math.max(0, Math.min(100, baseHealth + asyncBonus + healthBonus - smellPenalty))

  const isHealthy = health >= 60
  const hasNoDecay = decaySignals === 0 && lines > 0
  const hasSlowDecay = decaySignals > 0 && decaySignals <= 2
  const hasRadiationPressure = deprecated > 0
  const hasOrbitalLowering = anys > 0
  const hasAtmosphericDrag = console_ > 0
  const hasSolarWind = tsIgnores > 0
  const hasPoyntingRobertson = todos > 0 && anys > 0
  const hasYarkovskyEffect = todos > 0 && deprecated > 0
  const hasTidalDissipation = smells > 5

  let type: DecayMeasure['type']
  if (health >= 80) type = 'stable'
  else if (health >= 60) type = 'slow-decay'
  else if (health >= 40) type = 'moderate-decay'
  else if (health >= 20) type = 'rapid-decay'
  else if (health >= 10) type = 'degenerate'
  else type = 'collapsed'

  const dragCount = todos + deprecated + anys + console_

  return {
    health,
    type,
    isHealthy,
    hasNoDecay,
    hasSlowDecay,
    hasRadiationPressure,
    hasOrbitalLowering,
    hasAtmosphericDrag,
    hasSolarWind,
    hasPoyntingRobertson,
    hasYarkovskyEffect,
    hasTidalDissipation,
    dragCount,
  }
}

// ─── classifyCondition ─────────────────────────────────────────────────────

/** @example classifyCondition(90) returns 'stable-star' */
export function classifyCondition(score: number): GravitationalBody['condition'] {
  if (score >= 80) return 'stable-star'
  if (score >= 65) return 'planetary-system'
  if (score >= 50) return 'binary-system'
  if (score >= 35) return 'chaotic-orbit'
  if (score >= 20) return 'black-hole'
  return 'supernova-remnant'
}

// ─── classifyRegionType ────────────────────────────────────────────────────

/** @example classifyRegionType([body1, body2]) returns 'spiral-arm' */
export function classifyRegionType(bodies: GravitationalBody[]): StellarRegion['regionType'] {
  if (bodies.length === 0) return 'void'
  const avgPull = Math.round(bodies.reduce((s, b) => s + b.gravitationalPull, 0) / bodies.length)
  if (avgPull >= 70) return 'galaxy-core'
  if (avgPull >= 50) return 'globular-cluster'
  if (bodies.length >= 3) return 'open-cluster'
  if (bodies.length === 2) return 'binary-system'
  return 'spiral-arm'
}

// ─── classifyRegionCondition ───────────────────────────────────────────────

/** @example classifyRegionCondition(70) returns 'evolving-system' */
export function classifyRegionCondition(avgStability: number): StellarRegion['condition'] {
  if (avgStability >= 80) return 'stable-system'
  if (avgStability >= 65) return 'evolving-system'
  if (avgStability >= 50) return 'dynamic-system'
  if (avgStability >= 35) return 'unstable-system'
  if (avgStability >= 20) return 'chaotic-system'
  return 'collapsed-system'
}

// ─── classifyAstrophysicistGrade ───────────────────────────────────────────

/** @example classifyAstrophysicistGrade(85) returns 'chief-astrophysicist' */
export function classifyAstrophysicistGrade(avgStability: number): GravityStats['astrophysicistGrade'] {
  if (avgStability >= 80) return 'chief-astrophysicist'
  if (avgStability >= 65) return 'astrophysicist'
  if (avgStability >= 50) return 'astronomer'
  if (avgStability >= 35) return 'stargazer'
  if (avgStability >= 20) return 'amateur'
  return 'lost-in-space'
}

// ─── analyzeGravitationalBody ──────────────────────────────────────────────

/** @example analyzeGravitationalBody('export function foo(): void {}', 'test.ts') returns GravitationalBody */
export function analyzeGravitationalBody(content: string, filePath: string): GravitationalBody {
  const mass = measureMass(content)
  const orbit = measureOrbit(content)
  const tidal = measureTidal(content)
  const escape = measureEscape(content)
  const field = measureField(content)
  const decay = measureDecay(content)

  const gravitationalPull = mass.pull
  const orbitalStability = orbit.stability
  const tidalForce = tidal.force
  const escapeVelocity = escape.velocity
  const fieldStrength = field.strength
  const orbitalDecay = decay.health

  const qualityScore = Math.round((gravitationalPull + orbitalStability + tidalForce + escapeVelocity + fieldStrength + orbitalDecay) / 6)
  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    gravitationalPull,
    orbitalStability,
    tidalForce,
    escapeVelocity,
    fieldStrength,
    orbitalDecay,
    mass,
    orbit,
    tidal,
    escape,
    field,
    decay,
    condition,
    qualityScore,
  }
}

// ─── analyzeStellarRegion ──────────────────────────────────────────────────

/** @example analyzeStellarRegion([body1], 'src') returns StellarRegion */
export function analyzeStellarRegion(bodies: GravitationalBody[], dirPath: string): StellarRegion {
  const count = bodies.length
  const avgPull = count > 0 ? Math.round(bodies.reduce((s, b) => s + b.gravitationalPull, 0) / count) : 0
  const avgStability = count > 0 ? Math.round(bodies.reduce((s, b) => s + b.orbitalStability, 0) / count) : 0
  const avgFieldStrength = count > 0 ? Math.round(bodies.reduce((s, b) => s + b.fieldStrength, 0) / count) : 0

  const stableStarCount = bodies.filter((b) => b.condition === 'stable-star').length
  const blackHoleCount = bodies.filter((b) => b.condition === 'black-hole' || b.mass.classification === 'black-hole').length
  const decouplableCount = bodies.filter((b) => b.escape.isDecouplable).length
  const cleanOrbitCount = bodies.filter((b) => b.orbit.hasCleanOrbit).length

  const regionType = classifyRegionType(bodies)
  const avgScore = count > 0 ? Math.round(bodies.reduce((s, b) => s + b.qualityScore, 0) / count) : 0
  const condition = classifyRegionCondition(avgScore)

  return {
    directory: dirPath,
    bodies,
    avgPull,
    avgStability,
    avgFieldStrength,
    stableStarCount,
    blackHoleCount,
    decouplableCount,
    cleanOrbitCount,
    regionType,
    condition,
  }
}

// ─── generateRecommendations ───────────────────────────────────────────────

/** @example generateRecommendations(bodies, regions, cosmos, stats) returns string[] */
export function generateRecommendations(
  bodies: GravitationalBody[],
  _regions: StellarRegion[],
  _cosmos: GravityCosmos,
  _stats: GravityStats,
): string[] {
  const recommendations: string[] = []

  const hasBlackHoles = bodies.some((b) => b.mass.classification === 'black-hole')
  if (hasBlackHoles) {
    recommendations.push('Break free from black holes — reduce coupling in highly-tangled modules')
  }

  const hasCollisionCourse = bodies.some((b) => b.orbit.type === 'collision-course')
  if (hasCollisionCourse) {
    recommendations.push('Avoid collision course — stabilize dependency orbits with error handling and returns')
  }

  const hasDestructive = bodies.some((b) => b.tidal.type === 'destructive')
  if (hasDestructive) {
    recommendations.push('Reduce destructive tidal forces — simplify method chains and nested calls')
  }

  const hasImpossible = bodies.some((b) => b.escape.difficulty === 'impossible')
  if (hasImpossible) {
    recommendations.push('Lower escape velocity — introduce interfaces and dependency injection to decouple')
  }

  const hasFieldCollapse = bodies.some((b) => b.field.hasFieldCollapse)
  if (hasFieldCollapse) {
    recommendations.push('Restore gravitational field — add exports to orphaned code bodies')
  }

  const hasRapidDecay = bodies.some((b) => b.decay.type === 'rapid-decay' || b.decay.type === 'collapsed')
  if (hasRapidDecay) {
    recommendations.push('Stop orbital decay — remove TODOs, deprecated markers, and console calls')
  }

  const hasCircularRef = bodies.some((b) => b.escape.hasCircularReference)
  if (hasCircularRef) {
    recommendations.push('Resolve circular references — break import cycles between modules')
  }

  const hasSupernovaRemnant = bodies.some((b) => b.condition === 'supernova-remnant')
  if (hasSupernovaRemnant) {
    recommendations.push('Clear supernova remnants — rebuild collapsed files with proper structure')
  }

  if (recommendations.length === 0) {
    recommendations.push('The gravity field is a stable star system — clean orbits achieved')
  }

  return recommendations
}

// ─── Build Result ──────────────────────────────────────────────────────────

/** @example buildGravityFieldResult(['a.ts'], ['export function foo(): void {}']) returns GravityFieldResult */
export function buildGravityFieldResult(
  files: string[],
  contents: string[],
  _options?: { ignore?: string[]; ext?: string[] },
): GravityFieldResult {

  const bodies: GravitationalBody[] = files.map((file, i) =>
    analyzeGravitationalBody(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, GravitationalBody[]>()
  for (const body of bodies) {
    const dir = body.file.includes('/') ? body.file.substring(0, body.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(body)
    } else {
      dirMap.set(dir, [body])
    }
  }

  const regions: StellarRegion[] = Array.from(dirMap.entries()).map(
    ([dir, dirBodies]) => analyzeStellarRegion(dirBodies, dir),
  )

  const count = bodies.length
  const avgGravitationalPull = count > 0 ? Math.round(bodies.reduce((s, b) => s + b.gravitationalPull, 0) / count) : 0
  const avgOrbitalStability = count > 0 ? Math.round(bodies.reduce((s, b) => s + b.orbitalStability, 0) / count) : 0
  const avgTidalForce = count > 0 ? Math.round(bodies.reduce((s, b) => s + b.tidalForce, 0) / count) : 0
  const avgEscapeVelocity = count > 0 ? Math.round(bodies.reduce((s, b) => s + b.escapeVelocity, 0) / count) : 0
  const avgFieldStrength = count > 0 ? Math.round(bodies.reduce((s, b) => s + b.fieldStrength, 0) / count) : 0
  const avgOrbitalDecay = count > 0 ? Math.round(bodies.reduce((s, b) => s + b.orbitalDecay, 0) / count) : 0
  const overallStability = count > 0 ? Math.round(bodies.reduce((s, b) => s + b.qualityScore, 0) / count) : 0

  const cosmos: GravityCosmos = {
    avgPull: avgGravitationalPull,
    avgStability: avgOrbitalStability,
    avgFieldStrength: avgFieldStrength,
    isStable: overallStability >= 60,
    overallStability,
  }

  const conditionCounts = {
    stableStar: bodies.filter((b) => b.condition === 'stable-star').length,
    planetarySystem: bodies.filter((b) => b.condition === 'planetary-system').length,
    binarySystem: bodies.filter((b) => b.condition === 'binary-system').length,
    chaoticOrbit: bodies.filter((b) => b.condition === 'chaotic-orbit').length,
    blackHole: bodies.filter((b) => b.condition === 'black-hole').length,
    supernovaRemnant: bodies.filter((b) => b.condition === 'supernova-remnant').length,
  }

  const bestBy = <T>(arr: T[], fn: (item: T) => number): T => arr.reduce((a, b) => (fn(a) >= fn(b) ? a : b))

  const stats: GravityStats = {
    totalFiles: count,
    totalRegions: regions.length,
    avgGravitationalPull,
    avgOrbitalStability,
    avgTidalForce,
    avgEscapeVelocity,
    avgFieldStrength,
    avgOrbitalDecay,
    stableStarCount: conditionCounts.stableStar,
    planetarySystemCount: conditionCounts.planetarySystem,
    binarySystemCount: conditionCounts.binarySystem,
    chaoticOrbitCount: conditionCounts.chaoticOrbit,
    blackHoleCount: conditionCounts.blackHole,
    supernovaRemnantCount: conditionCounts.supernovaRemnant,
    isMassiveCount: bodies.filter((b) => b.mass.isMassive).length,
    hasStrongPullCount: bodies.filter((b) => b.mass.hasStrongPull).length,
    isStableCount: bodies.filter((b) => b.orbit.isStable).length,
    hasPerturbationCount: bodies.filter((b) => b.orbit.hasPerturbation).length,
    isManageableCount: bodies.filter((b) => b.tidal.isManageable).length,
    isDecouplableCount: bodies.filter((b) => b.escape.isDecouplable).length,
    hasCircularReferenceCount: bodies.filter((b) => b.escape.hasCircularReference).length,
    hasStrongFieldCount: bodies.filter((b) => b.field.hasStrongField).length,
    isHealthyCount: bodies.filter((b) => b.decay.isHealthy).length,
    hasSlowDecayCount: bodies.filter((b) => b.decay.hasSlowDecay).length,
    overallStability,
    astrophysicistGrade: classifyAstrophysicistGrade(overallStability),
    bestBody: count > 0 ? bestBy(bodies, (b) => b.qualityScore)?.file ?? '' : '',
    mostStable: count > 0 ? bestBy(bodies, (b) => b.orbitalStability)?.file ?? '' : '',
    mostDecouplable: count > 0 ? (Array.from(bodies).sort((a, b) => a.escapeVelocity - b.escapeVelocity)[0]?.file ?? '') : '',
    strongestField: count > 0 ? bestBy(bodies, (b) => b.fieldStrength)?.file ?? '' : '',
    healthiestDecay: count > 0 ? bestBy(bodies, (b) => b.orbitalDecay)?.file ?? '' : '',
  }

  const recommendations = generateRecommendations(bodies, regions, cosmos, stats)

  return { bodies, regions, cosmos, stats, recommendations }
}
