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
const TERNARY_REGEX = /\?[^:]+:/g
const CONSOLE_REGEX = /\bconsole\.\w+/g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const GENERICS_REGEX = /<[^>]+>/g
const PRIVATE_REGEX = /private\s+/g
const PROTECTED_REGEX = /protected\s+/g
const PUBLIC_REGEX = /public\s+/g
const STATIC_REGEX = /\bstatic\s+/g
const READONLY_REGEX = /\breadonly\b/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const PROMISE_REGEX = /\bPromise\b/g

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface GrowthMeasure {
  rate: number
  stage: 'mature-canopy' | 'adult' | 'juvenile' | 'sporophyte' | 'gametophyte' | 'spore'
  isGrowing: boolean
  hasRapidGrowth: boolean
  hasProperMeristem: boolean
  hasStipeElongation: boolean
  hasFrondExpansion: boolean
  hasNoStunting: boolean
  hasSeasonalGrowth: boolean
  hasNoDieback: boolean
  hasProperBiomass: boolean
  hasNoOvergrowth: boolean
  stuntingCount: number
  diebackCount: number
}

export interface HoldfastMeasure {
  strength: number
  type: 'bedrock' | 'boulder' | 'cobble' | 'sand' | 'mud' | 'drifting'
  isWellAnchored: boolean
  hasRootHaptera: boolean
  hasDeepAttachment: boolean
  hasNoDislodgement: boolean
  hasNoUndermining: boolean
  hasProperSubstrate: boolean
  hasNoScouring: boolean
  hasNoBurial: boolean
  hasStableAttachment: boolean
  hasNoDrift: boolean
  scouringCount: number
  burialCount: number
}

export interface CanopyMeasure {
  density: number
  layer: 'surface-canopy' | 'mid-water' | 'sub-canopy' | 'understory' | 'benthic' | 'bare'
  hasDenseCanopy: boolean
  hasProperShading: boolean
  hasLightCapture: boolean
  hasNoGapFormation: boolean
  hasProperStratification: boolean
  hasFrondOverlap: boolean
  hasNoShadingOut: boolean
  hasWaveAttenuation: boolean
  hasNoCanopyLoss: boolean
  hasProperDistribution: boolean
  gapCount: number
  canopyLossCount: number
}

export interface UnderstoryMeasure {
  richness: number
  diversity: 'high' | 'moderate' | 'low' | 'sparse' | 'depauperate' | 'absent'
  hasRichUnderstory: boolean
  hasEpiphytes: boolean
  hasInvertebrates: boolean
  hasNursery: boolean
  hasRefugeHabitat: boolean
  hasNoBarren: boolean
  hasFilterFeeders: boolean
  hasGrazers: boolean
  hasNoOvergrazing: boolean
  hasSymbiosis: boolean
  barrenCount: number
  overgrazingCount: number
}

export interface BladderMeasure {
  buoyancy: number
  fill: 'fully-inflated' | 'partially-filled' | 'deflated' | 'leaking' | 'collapsed' | 'absent'
  hasProperLift: boolean
  hasGasControl: boolean
  hasNoOverinflation: boolean
  hasNoDeflation: boolean
  hasNoLeaking: boolean
  hasNeutralBuoyancy: boolean
  hasProperPneumatocyst: boolean
  hasNoBurst: boolean
  hasUpwardReach: boolean
  hasNoSinking: boolean
  leakingCount: number
  burstCount: number
}

export interface HealthMeasure {
  score: number
  status: 'thriving' | 'healthy' | 'stressed' | 'declining' | 'bleached' | 'barren'
  isThriving: boolean
  hasGoodWaterQuality: boolean
  hasProperNutrients: boolean
  hasNoPollution: boolean
  hasNoGrazingPressure: boolean
  hasResilience: boolean
  hasRecoveryPotential: boolean
  hasNoElNino: boolean
  hasNoInvasion: boolean
  hasCarbonSequestration: boolean
  pollutionCount: number
  invasionCount: number
}

export interface KelpFrond {
  file: string
  frondGrowth: number
  holdfastStrength: number
  canopyDensity: number
  understoryRichness: number
  gasBladderBuoyancy: number
  forestHealth: number
  growth: GrowthMeasure
  holdfast: HoldfastMeasure
  canopy: CanopyMeasure
  understory: UnderstoryMeasure
  bladder: BladderMeasure
  health: HealthMeasure
  condition: 'giant-kelp' | 'bull-kelp' | 'laminaria' | 'rockweed' | 'sea-lettuce' | 'drift-seaweed'
  qualityScore: number
}

export interface ForestRegion {
  directory: string
  fronds: KelpFrond[]
  avgGrowth: number
  avgAnchoring: number
  avgHealth: number
  giantKelpCount: number
  driftCount: number
  growingCount: number
  thrivingCount: number
  regionType: 'old-growth' | 'mature-forest' | 'young-forest' | 'restoration' | 'meadow' | 'barrens'
  condition: 'marine-reserve' | 'protected-area' | 'harvest-zone' | 'recreational' | 'degraded' | 'urchin-barren'
}

export interface KelpForestResult {
  fronds: KelpFrond[]
  regions: ForestRegion[]
  ocean: {
    avgGrowth: number
    avgAnchoring: number
    avgHealth: number
    isThriving: boolean
    overallHealth: number
  }
  stats: {
    totalFiles: number
    totalRegions: number
    avgFrondGrowth: number
    avgHoldfastStrength: number
    avgCanopyDensity: number
    avgUnderstoryRichness: number
    avgGasBladderBuoyancy: number
    avgForestHealth: number
    giantKelpCount: number
    bullKelpCount: number
    laminariaCount: number
    rockweedCount: number
    seaLettuceCount: number
    driftSeaweedCount: number
    isGrowingCount: number
    isWellAnchoredCount: number
    hasDenseCanopyCount: number
    hasRichUnderstoryCount: number
    hasProperLiftCount: number
    isThrivingCount: number
    overallHealth: number
    marineBiologistGrade: 'research-director' | 'senior-biologist' | 'marine-biologist' | 'diver' | 'snorkeler' | 'beachcomber'
    bestFrond: string
    fastestGrowth: string
    bestAnchored: string
    densestCanopy: string
    richestUnderstory: string
    healthiest: string
  }
  recommendations: string[]
}

// ─── Counter Helpers ────────────────────────────────────────────────────────

/** @example countExports('export const x = 1') returns 1 */
export function countExports(content: string): number {
  return (content.match(EXPORT_REGEX) ?? []).length
}

/** @example countImportKeywords('import { x }') returns 1 */
export function countImportKeywords(content: string): number {
  return (content.match(IMPORT_REGEX) ?? []).length
}

/** @example countFunctions('function foo()') returns 1 */
export function countFunctions(content: string): number {
  return (content.match(FUNCTION_REGEX) ?? []).length
}

/** @example countArrows('const f = () => 1') returns 1 */
export function countArrows(content: string): number {
  return (content.match(ARROW_REGEX) ?? []).length
}

/** @example countClasses('class Foo') returns 1 */
export function countClasses(content: string): number {
  return (content.match(CLASS_REGEX) ?? []).length
}

/** @example countInterfaces('interface Foo') returns 1 */
export function countInterfaces(content: string): number {
  return (content.match(INTERFACE_REGEX) ?? []).length
}

/** @example countTypeAliases('type X = string') returns 1 */
export function countTypeAliases(content: string): number {
  return (content.match(TYPE_REGEX) ?? []).length
}

/** @example countEnums('enum X') returns 1 */
export function countEnums(content: string): number {
  return (content.match(ENUM_REGEX) ?? []).length
}

/** @example countJSDoc(content) returns JSDoc count */
export function countJSDoc(content: string): number {
  return (content.match(JSDOC_REGEX) ?? []).length
}

/** @example countAsync('async function') returns count */
export function countAsync(content: string): number {
  return (content.match(ASYNC_REGEX) ?? []).length
}

/** @example countTryCatch('try {') returns count */
export function countTryCatch(content: string): number {
  return (content.match(TRY_CATCH_REGEX) ?? []).length
}

/** @example countDeepNested(code) returns count */
export function countDeepNested(content: string): number {
  return (content.match(DEEP_NESTED_REGEX) ?? []).length
}

/** @example countTernaries('x ? 1 : 2') returns count */
export function countTernaries(content: string): number {
  return (content.match(TERNARY_REGEX) ?? []).length
}

/** @example countConsole('console.log()') returns count */
export function countConsole(content: string): number {
  return (content.match(CONSOLE_REGEX) ?? []).length
}

/** @example countTodos('// TODO') returns count */
export function countTodos(content: string): number {
  return (content.match(TODO_REGEX) ?? []).length
}

/** @example countAny('any') returns count */
export function countAny(content: string): number {
  return (content.match(ANY_REGEX) ?? []).length
}

/** @example countCommentedCode('// function') returns count */
export function countCommentedCode(content: string): number {
  return (content.match(COMMENTED_CODE_REGEX) ?? []).length
}

/** @example countGenerics('<T>') returns count */
export function countGenerics(content: string): number {
  return (content.match(GENERICS_REGEX) ?? []).length
}

/** @example countAccessModifiers('private x') returns count */
export function countAccessModifiers(content: string): number {
  return (
    (content.match(PRIVATE_REGEX) ?? []).length +
    (content.match(PROTECTED_REGEX) ?? []).length +
    (content.match(PUBLIC_REGEX) ?? []).length
  )
}

/** @example countStatic('static x') returns count */
export function countStatic(content: string): number {
  return (content.match(STATIC_REGEX) ?? []).length
}

/** @example countReadonly('readonly') returns count */
export function countReadonly(content: string): number {
  return (content.match(READONLY_REGEX) ?? []).length
}

/** @example countReexports("export { x } from 'y'") returns count */
export function countReexports(content: string): number {
  return (content.match(REEXPORT_REGEX) ?? []).length
}

// ─── Internal Helpers ───────────────────────────────────────────────────────


function accessModsCount(content: string): number {
  return (
    (content.match(PRIVATE_REGEX) ?? []).length +
    (content.match(PROTECTED_REGEX) ?? []).length +
    (content.match(PUBLIC_REGEX) ?? []).length
  )
}

function enumCount(content: string): number {
  return (content.match(ENUM_REGEX) ?? []).length
}



function promiseCount(content: string): number {
  return (content.match(PROMISE_REGEX) ?? []).length
}



// ─── Measure Functions ──────────────────────────────────────────────────────

/** @example measureGrowth(content) returns GrowthMeasure */
export function measureGrowth(content: string): GrowthMeasure {
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const asyncCount = countAsync(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)

  const stuntingCount = consoleCount + anyCount
  const diebackCount = deepNested
  const isGrowing = functionCount > 0 || arrowCount > 0 || classCount > 0
  const hasRapidGrowth = (functionCount + arrowCount) >= 3
  const hasProperMeristem = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasStipeElongation = asyncCount > 0
  const hasFrondExpansion = exportCount > 2
  const hasNoStunting = stuntingCount === 0
  const hasSeasonalGrowth = importCount > 0 && exportCount > 0
  const hasNoDieback = diebackCount === 0
  const hasProperBiomass = (functionCount + arrowCount + classCount) >= 3
  const hasNoOvergrowth = deepNested === 0

  let rate = 0
  if (isGrowing) rate += 15
  if (hasRapidGrowth) rate += 10
  if (hasProperMeristem) rate += 15
  if (hasStipeElongation) rate += 10
  if (hasFrondExpansion) rate += 10
  if (hasNoStunting) rate += 10
  if (hasSeasonalGrowth) rate += 10
  if (hasNoDieback) rate += 10
  if (hasProperBiomass) rate += 10
  rate = Math.min(rate, 100)
  rate = Math.max(rate, 0)

  let stage: GrowthMeasure['stage'] = 'spore'
  if (rate >= 80 && hasProperMeristem) stage = 'mature-canopy'
  else if (rate >= 65 && isGrowing) stage = 'adult'
  else if (rate >= 50) stage = 'juvenile'
  else if (rate >= 35) stage = 'sporophyte'
  else if (rate >= 20) stage = 'gametophyte'

  return {
    diebackCount,
    hasFrondExpansion,
    hasNoDieback,
    hasNoOvergrowth,
    hasNoStunting,
    hasProperBiomass,
    hasProperMeristem,
    hasRapidGrowth,
    hasSeasonalGrowth,
    hasStipeElongation,
    isGrowing,
    rate,
    stage,
    stuntingCount,
  }
}

/** @example measureHoldfast(content) returns HoldfastMeasure */
export function measureHoldfast(content: string): HoldfastMeasure {
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)
  const accessMods = countAccessModifiers(content)
  const readonlyCount = countReadonly(content)
  const staticCount = countStatic(content)

  const scouringCount = anyCount + consoleCount
  const burialCount = deepNested
  const isWellAnchored = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasRootHaptera = interfaceCount > 0 && typeCount > 0
  const hasDeepAttachment = classCount > 0 && interfaceCount > 0
  const hasNoDislodgement = readonlyCount > 0 || staticCount > 0
  const hasNoUndermining = anyCount === 0
  const hasProperSubstrate = accessMods > 0
  const hasNoScouring = scouringCount === 0
  const hasNoBurial = burialCount === 0
  const hasStableAttachment = exportCount > 0 && importCount > 0
  const hasNoDrift = exportCount > 0

  let strength = 0
  if (isWellAnchored) strength += 15
  if (hasRootHaptera) strength += 15
  if (hasDeepAttachment) strength += 10
  if (hasNoDislodgement) strength += 10
  if (hasNoUndermining) strength += 10
  if (hasProperSubstrate) strength += 10
  if (hasNoScouring) strength += 10
  if (hasNoBurial) strength += 10
  if (hasStableAttachment) strength += 10
  strength = Math.min(strength, 100)
  strength = Math.max(strength, 0)

  let type: HoldfastMeasure['type'] = 'drifting'
  if (strength >= 80 && isWellAnchored) type = 'bedrock'
  else if (strength >= 65 && hasRootHaptera) type = 'boulder'
  else if (strength >= 50) type = 'cobble'
  else if (strength >= 35) type = 'sand'
  else if (strength >= 20) type = 'mud'

  return {
    burialCount,
    hasDeepAttachment,
    hasNoBurial,
    hasNoDislodgement,
    hasNoDrift,
    hasNoScouring,
    hasNoUndermining,
    hasProperSubstrate,
    hasRootHaptera,
    hasStableAttachment,
    isWellAnchored,
    scouringCount,
    strength,
    type,
  }
}

/** @example measureCanopy(content) returns CanopyMeasure */
export function measureCanopy(content: string): CanopyMeasure {
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)

  const gapCount = anyCount + consoleCount
  const canopyLossCount = deepNested
  const hasDenseCanopy = classCount > 0 && (interfaceCount > 0 || typeCount > 0) && functionCount > 0
  const hasProperShading = accessModsCount(content) > 0
  const hasLightCapture = exportCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasNoGapFormation = gapCount === 0
  const hasProperStratification = interfaceCount > 0 && typeCount > 0
  const hasFrondOverlap = importCount > 0 && exportCount > 0
  const hasNoShadingOut = anyCount === 0
  const hasWaveAttenuation = countTryCatch(content) > 0
  const hasNoCanopyLoss = canopyLossCount === 0
  const hasProperDistribution = (functionCount + arrowCount) >= 2 && exportCount > 0

  let density = 0
  if (hasDenseCanopy) density += 15
  if (hasProperShading) density += 10
  if (hasLightCapture) density += 10
  if (hasNoGapFormation) density += 10
  if (hasProperStratification) density += 15
  if (hasFrondOverlap) density += 10
  if (hasNoShadingOut) density += 10
  if (hasWaveAttenuation) density += 10
  if (hasNoCanopyLoss) density += 10
  density = Math.min(density, 100)
  density = Math.max(density, 0)

  let layer: CanopyMeasure['layer'] = 'bare'
  if (density >= 80 && hasDenseCanopy) layer = 'surface-canopy'
  else if (density >= 65 && hasProperStratification) layer = 'mid-water'
  else if (density >= 50) layer = 'sub-canopy'
  else if (density >= 35) layer = 'understory'
  else if (density >= 20) layer = 'benthic'

  return {
    canopyLossCount,
    density,
    gapCount,
    hasDenseCanopy,
    hasFrondOverlap,
    hasLightCapture,
    hasNoCanopyLoss,
    hasNoGapFormation,
    hasNoShadingOut,
    hasProperDistribution,
    hasProperShading,
    hasProperStratification,
    hasWaveAttenuation,
    layer,
  }
}

/** @example measureUnderstory(content) returns UnderstoryMeasure */
export function measureUnderstory(content: string): UnderstoryMeasure {
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const enumCount = countEnums(content)
  const generics = countGenerics(content)
  const jsdoc = countJSDoc(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const ternaries = countTernaries(content)

  const barrenCount = consoleCount + anyCount
  const overgrazingCount = ternaries > 5 ? 1 : 0
  const hasRichUnderstory = (functionCount + arrowCount) >= 3 && exportCount > 0
  const hasEpiphytes = jsdoc > 0
  const hasInvertebrates = (functionCount + arrowCount) >= 2
  const hasNursery = generics > 0
  const hasRefugeHabitat = countTryCatch(content) > 0
  const hasNoBarren = barrenCount === 0
  const hasFilterFeeders = importCount > 0 && (functionCount > 0 || arrowCount > 0)
  const hasGrazers = enumCount > 0
  const hasNoOvergrazing = overgrazingCount === 0
  const hasSymbiosis = interfaceCount > 0 && typeCount > 0

  let richness = 0
  if (hasRichUnderstory) richness += 15
  if (hasEpiphytes) richness += 10
  if (hasInvertebrates) richness += 10
  if (hasNursery) richness += 10
  if (hasRefugeHabitat) richness += 10
  if (hasNoBarren) richness += 10
  if (hasFilterFeeders) richness += 10
  if (hasGrazers) richness += 10
  if (hasNoOvergrazing) richness += 10
  if (hasSymbiosis) richness += 5
  richness = Math.min(richness, 100)
  richness = Math.max(richness, 0)

  let diversity: UnderstoryMeasure['diversity'] = 'absent'
  if (richness >= 80 && hasRichUnderstory) diversity = 'high'
  else if (richness >= 65) diversity = 'moderate'
  else if (richness >= 50) diversity = 'low'
  else if (richness >= 35) diversity = 'sparse'
  else if (richness >= 20) diversity = 'depauperate'

  return {
    barrenCount,
    diversity,
    hasEpiphytes,
    hasFilterFeeders,
    hasGrazers,
    hasInvertebrates,
    hasNoBarren,
    hasNoOvergrazing,
    hasNursery,
    hasRefugeHabitat,
    hasRichUnderstory,
    hasSymbiosis,
    overgrazingCount,
    richness,
  }
}

/** @example measureBladder(content) returns BladderMeasure */
export function measureBladder(content: string): BladderMeasure {
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const asyncCount = countAsync(content)
  const promiseCount = countPromises(content)
  const generics = countGenerics(content)
  const anyCount = countAny(content)
  const deepNested = countDeepNested(content)
  const abstractCount = interfaceCount + typeCount

  const leakingCount = anyCount
  const burstCount = deepNested
  const hasProperLift = abstractCount > 0 && exportCount > 0
  const hasGasControl = generics > 0
  const hasNoOverinflation = deepNested === 0
  const hasNoDeflation = exportCount > 0 && importCount > 0
  const hasNoLeaking = leakingCount === 0
  const hasNeutralBuoyancy = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasProperPneumatocyst = accessModsCount(content) > 0
  const hasNoBurst = burstCount === 0
  const hasUpwardReach = asyncCount > 0 || promiseCount > 0
  const hasNoSinking = classCount > 0

  let buoyancy = 0
  if (hasProperLift) buoyancy += 15
  if (hasGasControl) buoyancy += 10
  if (hasNoOverinflation) buoyancy += 10
  if (hasNoDeflation) buoyancy += 10
  if (hasNoLeaking) buoyancy += 10
  if (hasNeutralBuoyancy) buoyancy += 15
  if (hasProperPneumatocyst) buoyancy += 10
  if (hasNoBurst) buoyancy += 10
  if (hasUpwardReach) buoyancy += 10
  buoyancy = Math.min(buoyancy, 100)
  buoyancy = Math.max(buoyancy, 0)

  let fill: BladderMeasure['fill'] = 'absent'
  if (buoyancy >= 80 && hasProperLift) fill = 'fully-inflated'
  else if (buoyancy >= 65 && hasNeutralBuoyancy) fill = 'partially-filled'
  else if (buoyancy >= 50) fill = 'deflated'
  else if (buoyancy >= 35) fill = 'leaking'
  else if (buoyancy >= 20) fill = 'collapsed'

  return {
    burstCount,
    buoyancy,
    fill,
    hasGasControl,
    hasNeutralBuoyancy,
    hasNoBurst,
    hasNoDeflation,
    hasNoLeaking,
    hasNoOverinflation,
    hasNoSinking,
    hasProperLift,
    hasProperPneumatocyst,
    hasUpwardReach,
    leakingCount,
  }
}

/** @example measureHealth(content) returns HealthMeasure */
export function measureHealth(content: string): HealthMeasure {
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const asyncCount = countAsync(content)
  const tryCatch = countTryCatch(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const commentedCode = countCommentedCode(content)
  const deepNested = countDeepNested(content)

  const pollutionCount = anyCount + consoleCount
  const invasionCount = commentedCode
  const isThriving = classCount > 0 && (interfaceCount > 0 || typeCount > 0) && pollutionCount === 0
  const hasGoodWaterQuality = pollutionCount === 0
  const hasProperNutrients = exportCount > 0 && importCount > 0
  const hasNoPollution = pollutionCount === 0
  const hasNoGrazingPressure = deepNested === 0
  const hasResilience = tryCatch > 0
  const hasRecoveryPotential = asyncCount > 0
  const hasNoElNino = anyCount === 0
  const hasNoInvasion = invasionCount === 0
  const hasCarbonSequestration = enumCount(content) > 0

  let score = 0
  if (isThriving) score += 15
  if (hasGoodWaterQuality) score += 10
  if (hasProperNutrients) score += 10
  if (hasNoPollution) score += 10
  if (hasNoGrazingPressure) score += 10
  if (hasResilience) score += 10
  if (hasRecoveryPotential) score += 10
  if (hasNoElNino) score += 10
  if (hasNoInvasion) score += 5
  score = Math.min(score, 100)
  score = Math.max(score, 0)

  let status: HealthMeasure['status'] = 'barren'
  if (isThriving && score >= 80) status = 'thriving'
  else if (score >= 65) status = 'healthy'
  else if (score >= 50) status = 'stressed'
  else if (score >= 35) status = 'declining'
  else if (score >= 20) status = 'bleached'

  return {
    hasCarbonSequestration,
    hasGoodWaterQuality,
    hasNoElNino,
    hasNoGrazingPressure,
    hasNoInvasion,
    hasNoPollution,
    hasProperNutrients,
    hasRecoveryPotential,
    hasResilience,
    invasionCount,
    isThriving,
    pollutionCount,
    score,
    status,
  }
}

/** @example countPromises(content) returns Promise count */
export function countPromises(content: string): number {
  return promiseCount(content)
}

// ─── Classifiers ────────────────────────────────────────────────────────────

/** @example classifyCondition(score) returns condition string */
export function classifyCondition(score: number): KelpFrond['condition'] {
  if (score >= 80) return 'giant-kelp'
  if (score >= 65) return 'bull-kelp'
  if (score >= 50) return 'laminaria'
  if (score >= 35) return 'rockweed'
  if (score >= 20) return 'sea-lettuce'
  return 'drift-seaweed'
}

/** @example classifyRegionType(fronds) returns region type */
export function classifyRegionType(fronds: KelpFrond[]): ForestRegion['regionType'] {
  if (fronds.length === 0) return 'barrens'
  const avgQuality = fronds.reduce((s, f) => s + f.qualityScore, 0) / fronds.length
  const giantCount = fronds.filter((f) => f.condition === 'giant-kelp').length
  if (avgQuality >= 75 && giantCount >= Math.ceil(fronds.length * 0.3)) return 'old-growth'
  if (avgQuality >= 60) return 'mature-forest'
  if (avgQuality >= 45) return 'young-forest'
  if (avgQuality >= 30) return 'restoration'
  if (avgQuality >= 15) return 'meadow'
  return 'barrens'
}

/** @example classifyRegionCondition(avgQuality) returns condition */
export function classifyRegionCondition(avgQuality: number): ForestRegion['condition'] {
  if (avgQuality >= 80) return 'marine-reserve'
  if (avgQuality >= 65) return 'protected-area'
  if (avgQuality >= 50) return 'harvest-zone'
  if (avgQuality >= 35) return 'recreational'
  if (avgQuality >= 20) return 'degraded'
  return 'urchin-barren'
}

/** @example classifyMarineBiologistGrade(avgHealth) returns grade */
export function classifyMarineBiologistGrade(avgHealth: number): KelpForestResult['stats']['marineBiologistGrade'] {
  if (avgHealth >= 80) return 'research-director'
  if (avgHealth >= 65) return 'senior-biologist'
  if (avgHealth >= 50) return 'marine-biologist'
  if (avgHealth >= 35) return 'diver'
  if (avgHealth >= 20) return 'snorkeler'
  return 'beachcomber'
}

// ─── Frond Analysis ─────────────────────────────────────────────────────────

/** @example analyzeKelpFrond(content, filePath) returns KelpFrond */
export function analyzeKelpFrond(content: string, filePath: string): KelpFrond {
  const growth = measureGrowth(content)
  const holdfast = measureHoldfast(content)
  const canopy = measureCanopy(content)
  const understory = measureUnderstory(content)
  const bladder = measureBladder(content)
  const health = measureHealth(content)

  const qualityScore = Math.round(
    growth.rate * 0.2 + holdfast.strength * 0.2 + canopy.density * 0.15 +
    understory.richness * 0.15 + bladder.buoyancy * 0.15 + health.score * 0.15,
  )

  return {
    bladder,
    canopy,
    canopyDensity: canopy.density,
    condition: classifyCondition(qualityScore),
    file: filePath,
    forestHealth: health.score,
    frondGrowth: growth.rate,
    gasBladderBuoyancy: bladder.buoyancy,
    growth,
    health,
    holdfast,
    holdfastStrength: holdfast.strength,
    qualityScore,
    understory,
    understoryRichness: understory.richness,
  }
}

/** @example analyzeForestRegion(fronds, dirPath) returns ForestRegion */
export function analyzeForestRegion(fronds: KelpFrond[], dirPath: string): ForestRegion {
  const avgGrowth = fronds.length > 0 ? Math.round(fronds.reduce((s, f) => s + f.frondGrowth, 0) / fronds.length) : 0
  const avgAnchoring = fronds.length > 0 ? Math.round(fronds.reduce((s, f) => s + f.holdfastStrength, 0) / fronds.length) : 0
  const avgHealth = fronds.length > 0 ? Math.round(fronds.reduce((s, f) => s + f.forestHealth, 0) / fronds.length) : 0
  const giantKelpCount = fronds.filter((f) => f.condition === 'giant-kelp').length
  const driftCount = fronds.filter((f) => f.condition === 'drift-seaweed').length
  const growingCount = fronds.filter((f) => f.growth.isGrowing).length
  const thrivingCount = fronds.filter((f) => f.health.isThriving).length
  const regionType = classifyRegionType(fronds)
  const avgQuality = fronds.length > 0 ? Math.round(fronds.reduce((s, f) => s + f.qualityScore, 0) / fronds.length) : 0
  const condition = classifyRegionCondition(avgQuality)

  return {
    avgAnchoring,
    avgGrowth,
    avgHealth,
    condition,
    directory: dirPath,
    driftCount,
    fronds,
    giantKelpCount,
    growingCount,
    regionType,
    thrivingCount,
  }
}

/** @example generateRecommendations(fronds, regions, ocean, stats) returns string[] */
export function generateRecommendations(
  fronds: KelpFrond[],
  _regions: ForestRegion[],
  ocean: KelpForestResult['ocean'],
  _stats: KelpForestResult['stats'],
): string[] {
  const recommendations: string[] = []

  if (ocean.overallHealth < 50) {
    recommendations.push('Forest health is low — add types, interfaces, and error handling to strengthen the ecosystem')
  }

  const drifting = fronds.filter((f) => f.condition === 'drift-seaweed')
  if (drifting.length > 0) {
    recommendations.push(`${drifting.length} frond/fronds are drift seaweed — add meaningful code structure and exports`)
  }

  const weakHoldfast = fronds.filter((f) => !f.holdfast.isWellAnchored)
  if (weakHoldfast.length > 0) {
    recommendations.push(`${weakHoldfast.length} frond/fronds have weak holdfasts — anchor code with classes, interfaces, and proper typing`)
  }

  const polluted = fronds.filter((f) => f.health.pollutionCount > 0)
  if (polluted.length > 0) {
    recommendations.push(`${polluted.length} frond/fronds have pollution — remove any types, console logs, and clean up technical debt`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Kelp forest is thriving with rich biodiversity — maintain current ecosystem health')
  }

  return recommendations
}

// ─── Builder ────────────────────────────────────────────────────────────────

/** @example buildKelpForestResult(files, contents, options) returns KelpForestResult */
export function buildKelpForestResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): KelpForestResult {
  const fronds: KelpFrond[] = files.map((file, i) =>
    analyzeKelpFrond(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, KelpFrond[]>()
  for (const frond of fronds) {
    const dir = frond.file.includes('/') ? frond.file.substring(0, frond.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(frond)
    } else {
      dirMap.set(dir, [frond])
    }
  }

  const regions: ForestRegion[] = Array.from(dirMap.entries()).map(([dir, dirFronds]) =>
    analyzeForestRegion(dirFronds, dir),
  )

  const avgFrondGrowth = fronds.length > 0 ? Math.round(fronds.reduce((s, f) => s + f.frondGrowth, 0) / fronds.length) : 0
  const avgHoldfastStrength = fronds.length > 0 ? Math.round(fronds.reduce((s, f) => s + f.holdfastStrength, 0) / fronds.length) : 0
  const avgCanopyDensity = fronds.length > 0 ? Math.round(fronds.reduce((s, f) => s + f.canopyDensity, 0) / fronds.length) : 0
  const avgUnderstoryRichness = fronds.length > 0 ? Math.round(fronds.reduce((s, f) => s + f.understoryRichness, 0) / fronds.length) : 0
  const avgGasBladderBuoyancy = fronds.length > 0 ? Math.round(fronds.reduce((s, f) => s + f.gasBladderBuoyancy, 0) / fronds.length) : 0
  const avgForestHealth = fronds.length > 0 ? Math.round(fronds.reduce((s, f) => s + f.forestHealth, 0) / fronds.length) : 0
  const overallHealth = fronds.length > 0 ? Math.round(fronds.reduce((s, f) => s + f.qualityScore, 0) / fronds.length) : 0

  const ocean = {
    avgGrowth: avgFrondGrowth,
    avgAnchoring: avgHoldfastStrength,
    avgHealth: avgForestHealth,
    isThriving: overallHealth >= 65,
    overallHealth,
  }

  const giantKelpCount = fronds.filter((f) => f.condition === 'giant-kelp').length
  const bullKelpCount = fronds.filter((f) => f.condition === 'bull-kelp').length
  const laminariaCount = fronds.filter((f) => f.condition === 'laminaria').length
  const rockweedCount = fronds.filter((f) => f.condition === 'rockweed').length
  const seaLettuceCount = fronds.filter((f) => f.condition === 'sea-lettuce').length
  const driftSeaweedCount = fronds.filter((f) => f.condition === 'drift-seaweed').length
  const isGrowingCount = fronds.filter((f) => f.growth.isGrowing).length
  const isWellAnchoredCount = fronds.filter((f) => f.holdfast.isWellAnchored).length
  const hasDenseCanopyCount = fronds.filter((f) => f.canopy.hasDenseCanopy).length
  const hasRichUnderstoryCount = fronds.filter((f) => f.understory.hasRichUnderstory).length
  const hasProperLiftCount = fronds.filter((f) => f.bladder.hasProperLift).length
  const isThrivingCount = fronds.filter((f) => f.health.isThriving).length

  const marineBiologistGrade = classifyMarineBiologistGrade(overallHealth)

  const bestFrond = fronds.length > 0
    ? fronds.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file : ''
  const fastestGrowth = fronds.length > 0
    ? fronds.reduce((best, f) => f.frondGrowth > best.frondGrowth ? f : best).file : ''
  const bestAnchored = fronds.length > 0
    ? fronds.reduce((best, f) => f.holdfastStrength > best.holdfastStrength ? f : best).file : ''
  const densestCanopy = fronds.length > 0
    ? fronds.reduce((best, f) => f.canopyDensity > best.canopyDensity ? f : best).file : ''
  const richestUnderstory = fronds.length > 0
    ? fronds.reduce((best, f) => f.understoryRichness > best.understoryRichness ? f : best).file : ''
  const healthiest = fronds.length > 0
    ? fronds.reduce((best, f) => f.forestHealth > best.forestHealth ? f : best).file : ''

  const stats = {
    avgCanopyDensity,
    avgForestHealth,
    avgFrondGrowth,
    avgGasBladderBuoyancy,
    avgHoldfastStrength,
    avgUnderstoryRichness,
    bestAnchored,
    bestFrond,
    bullKelpCount,
    densestCanopy,
    driftSeaweedCount,
    fastestGrowth,
    giantKelpCount,
    hasDenseCanopyCount,
    hasProperLiftCount,
    hasRichUnderstoryCount,
    healthiest,
    isGrowingCount,
    isThrivingCount,
    isWellAnchoredCount,
    laminariaCount,
    marineBiologistGrade,
    overallHealth,
    richestUnderstory,
    rockweedCount,
    seaLettuceCount,
    totalFiles: files.length,
    totalRegions: regions.length,
  }

  const recommendations = generateRecommendations(fronds, regions, ocean, stats)

  return { fronds, ocean, recommendations, regions, stats }
}
