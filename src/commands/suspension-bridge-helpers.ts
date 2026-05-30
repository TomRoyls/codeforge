// ─── Types ──────────────────────────────────────────────────────────────────

export type CableType = 'strand' | 'wire-rope' | 'chain' | 'bar' | 'flat-braid' | 'frayed-rope'
export type DeckMaterial = 'steel' | 'concrete' | 'composite' | 'timber' | 'bamboo' | 'rope'
export type AnchorType = 'bedrock' | 'concrete-block' | 'gravity-anchor' | 'pile' | 'deadman' | 'sand-anchor'
export type SpanCondition = 'golden-gate' | 'modern-marvel' | 'sound-structure' | 'needs-maintenance' | 'structurally-deficient' | 'condemned'
export type NetworkType = 'interstate-system' | 'state-highway' | 'county-road' | 'city-street' | 'footbridge' | 'rope-bridge'
export type NetworkCondition = 'engineering-marvel' | 'well-engineered' | 'adequate' | 'substandard' | 'dangerous' | 'collapsed'
export type EngineerGrade = 'chief-engineer' | 'senior-engineer' | 'engineer' | 'technician' | 'handyman' | 'demolition'

export interface CableMeasure {
  strength: number
  type: CableType
  isTaut: boolean
  hasProperTension: boolean
  hasCorrosion: boolean
  hasFraying: boolean
  hasKinks: boolean
  hasProperAnchoring: boolean
  hasEvenLoad: boolean
  corrosionCount: number
  kinkCount: number
}

export interface DeckMeasure {
  stability: number
  material: DeckMaterial
  isLevel: boolean
  hasSmoothSurface: boolean
  hasExpansionJoints: boolean
  hasDrainage: boolean
  hasRailings: boolean
  hasWearPatterns: boolean
  hasPotHoles: boolean
  jointCount: number
  potHoleCount: number
}

export interface TowerMeasure {
  integrity: number
  isPlumb: boolean
  hasSolidFoundation: boolean
  hasReinforcedConcrete: boolean
  hasStructuralSteel: boolean
  hasGuyWires: boolean
  hasCracks: boolean
  hasLeaning: boolean
  hasSettling: boolean
  crackCount: number
}

export interface AnchorMeasure {
  security: number
  type: AnchorType
  isSolid: boolean
  isDeep: boolean
  hasRedundancy: boolean
  hasCorrosion: boolean
  hasStress: boolean
  hasMovement: boolean
  hasCavitation: boolean
  redundancyCount: number
}

export interface LoadMeasure {
  distribution: number
  isBalanced: boolean
  hasEvenDistribution: boolean
  hasOverloadedSection: boolean
  hasUnderloadedSection: boolean
  hasDynamicLoad: boolean
  hasStaticLoad: boolean
  hasResonance: boolean
  hasFatigueRisk: boolean
  overloadedCount: number
}

export interface SpanMeasure {
  clarity: number
  length: number
  isClear: boolean
  hasVisibility: boolean
  hasProperSignage: boolean
  hasLaneMarkings: boolean
  hasTrafficFlow: boolean
  hasTollPlaza: boolean
  hasScenicViews: boolean
  signageCount: number
}

export interface BridgeSpan {
  file: string
  cableStrength: number
  deckStability: number
  towerIntegrity: number
  anchorSecurity: number
  loadDistribution: number
  spanClarity: number
  cable: CableMeasure
  deck: DeckMeasure
  tower: TowerMeasure
  anchor: AnchorMeasure
  load: LoadMeasure
  span: SpanMeasure
  condition: SpanCondition
  qualityScore: number
}

export interface BridgeNetwork {
  directory: string
  spans: BridgeSpan[]
  avgCableStrength: number
  avgDeckStability: number
  avgTowerIntegrity: number
  goldenGateCount: number
  condemnedCount: number
  balancedLoadCount: number
  clearSpanCount: number
  networkType: NetworkType
  condition: NetworkCondition
}

export interface SuspensionBridgeStats {
  totalFiles: number
  totalNetworks: number
  avgCableStrength: number
  avgDeckStability: number
  avgTowerIntegrity: number
  avgAnchorSecurity: number
  avgLoadDistribution: number
  avgSpanClarity: number
  goldenGateCount: number
  modernMarvelCount: number
  soundStructureCount: number
  needsMaintenanceCount: number
  structurallyDeficientCount: number
  condemnedCount: number
  isTautCount: number
  hasCorrosionCount: number
  hasFrayingCount: number
  isLevelCount: number
  hasRailingsCount: number
  hasSolidFoundationCount: number
  hasCracksCount: number
  isSolidCount: number
  isBalancedCount: number
  hasFatigueRiskCount: number
  isClearCount: number
  overallIntegrity: number
  engineerGrade: EngineerGrade
  bestSpan: string
  strongestCable: string
  stablestDeck: string
  strongestTower: string
  clearestSpan: string
}

export interface SuspensionBridgeResult {
  spans: BridgeSpan[]
  networks: BridgeNetwork[]
  authority: {
    avgCableStrength: number
    avgDeckStability: number
    avgTowerIntegrity: number
    isStructurallySound: boolean
    overallIntegrity: number
  }
  stats: SuspensionBridgeStats
  recommendations: string[]
}

// ─── Regex Patterns ─────────────────────────────────────────────────────────

const IMPORT_RE = /import\s+(?:\{[^}]*\}|\w+)\s+from\s+['"]([^'"]+)['"]/g
const EXPORT_RE = /export\s+(?:default\s+)?(?:function|const|class|interface|type|enum|async\s+function)\s+(\w+)/g
const FUNCTION_RE = /\bfunction\s+(\w+)/g
const ARROW_RE = /=>\s*[{(]/g
const TYPE_ANNOTATION_RE = /:\s*(?:string|number|boolean|void|Promise|Record|Map|Set|Array|Date|RegExp|Error|[A-Z]\w+)/
const INTERFACE_RE = /(?:interface|type)\s+\w+\s*(?:<[^>]+>)?\s*\{/
const CLASS_RE = /\bclass\s+\w+/
const TRY_CATCH_RE = /try\s*\{/g
const IF_RE = /\bif\s*\(/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const CONST_RE = /\bconst\s+/g
const LET_RE = /\blet\s+/g
const MUTATION_RE = /\.\s*(push|pop|shift|unshift|splice|sort|reverse)\s*\(/g
const SIDE_EFFECT_RE = /\b(console|process|fs|fetch|http|writeFile|readFile)\b/g
const GENERIC_RE = /<\w+>/
const ASYNC_RE = /\basync\s+/
const PIPE_RE = /[.\s](map|filter|reduce|forEach|flatMap|find|some|every)\s*\(/g
const RETURN_RE = /\breturn\b/g
const PARAM_RE = /\(\s*(?:\.\.\.)?(\w+)(?:\s*:\s*\w+)?(?:\s*,\s*(?:\.\.\.)?\w+(?:\s*:\s*\w+)?)*\s*\)/g

// ─── measureCable ───────────────────────────────────────────────────────────

/**
 * Measure connection strength
 * @example
 * measureCable('import { x } from "y"; export function a() {}') // { strength: 70, ... }
 */
export function measureCable(content: string): CableMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      strength: 0, type: 'frayed-rope', isTaut: false, hasProperTension: false,
      hasCorrosion: false, hasFraying: false, hasKinks: false,
      hasProperAnchoring: false, hasEvenLoad: false, corrosionCount: 0, kinkCount: 0,
    }
  }

  const imports = (content.match(IMPORT_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const mutations = (content.match(MUTATION_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length

  const connectionRatio = functions > 0 ? Math.min((imports + exports) / functions, 2) : 0
  let strength = Math.round(connectionRatio * 25 + Math.min(exports * 5, 20) + Math.min(imports * 3, 15))
  strength = Math.max(0, Math.min(100, strength - mutations * 3 - sideEffects * 2))

  const hasCorrosion = mutations > 0
  const hasFraying = sideEffects > 0
  const hasKinks = imports > exports * 3 && exports > 0
  const hasProperAnchoring = imports > 0 && exports > 0
  const hasEvenLoad = Math.abs(imports - exports) <= imports * 0.5 + 1

  let type: CableType = 'frayed-rope'
  if (strength >= 80) type = 'strand'
  else if (strength >= 65) type = 'wire-rope'
  else if (strength >= 50) type = 'chain'
  else if (strength >= 35) type = 'bar'
  else if (strength >= 20) type = 'flat-braid'

  return {
    strength,
    type,
    isTaut: strength >= 70,
    hasProperTension: hasEvenLoad,
    hasCorrosion,
    hasFraying,
    hasKinks,
    hasProperAnchoring,
    hasEvenLoad,
    corrosionCount: mutations,
    kinkCount: imports > exports * 3 ? imports - exports : 0,
  }
}

// ─── measureDeck ─────────────────────────────────────────────────────────────

/**
 * Measure interface stability
 * @example
 * measureDeck('export function add(a: number, b: number): number { return a + b }') // { stability: 80, ... }
 */
export function measureDeck(content: string): DeckMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      stability: 0, material: 'rope', isLevel: false, hasSmoothSurface: false,
      hasExpansionJoints: false, hasDrainage: false, hasRailings: false,
      hasWearPatterns: false, hasPotHoles: false, jointCount: 0, potHoleCount: 0,
    }
  }

  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const ifs = (content.match(IF_RE) ?? []).length
  const params = (content.match(PARAM_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length

  const hasSmoothSurface = types > 0 && exports > 0
  const hasExpansionJoints = interfaces > 0
  const hasDrainage = tryCatch > 0
  const hasRailings = ifs > 0 && types > 0
  const hasPotHoles = exports === 0 && loc > 5
  const hasWearPatterns = params > 5

  let stability = 0
  if (hasSmoothSurface) stability += 25
  if (hasExpansionJoints) stability += 20
  if (hasDrainage) stability += 20
  if (hasRailings) stability += 20
  stability += Math.min(jsdoc * 5, 15)
  if (hasPotHoles) stability -= 10
  stability = Math.max(0, Math.min(100, stability))

  let material: DeckMaterial = 'rope'
  if (stability >= 85) material = 'steel'
  else if (stability >= 65) material = 'concrete'
  else if (stability >= 45) material = 'composite'
  else if (stability >= 25) material = 'timber'
  else if (stability >= 10) material = 'bamboo'

  return {
    stability,
    material,
    isLevel: stability >= 70,
    hasSmoothSurface,
    hasExpansionJoints,
    hasDrainage,
    hasRailings,
    hasWearPatterns,
    hasPotHoles,
    jointCount: interfaces,
    potHoleCount: hasPotHoles ? Math.floor(loc / 20) : 0,
  }
}

// ─── measureTower ────────────────────────────────────────────────────────────

/**
 * Measure core module integrity
 * @example
 * measureTower('class Engine { constructor() {} run() {} }') // { integrity: 60, ... }
 */
export function measureTower(content: string): TowerMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      integrity: 0, isPlumb: false, hasSolidFoundation: false,
      hasReinforcedConcrete: false, hasStructuralSteel: false,
      hasGuyWires: false, hasCracks: false, hasLeaning: false,
      hasSettling: false, crackCount: 0,
    }
  }

  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length

  const hasSolidFoundation = classes > 0 || functions >= 3
  const hasReinforcedConcrete = tryCatch > 0
  const hasStructuralSteel = types > 0 && (classes > 0 || interfaces > 0)
  const hasGuyWires = generics > 0
  const hasCracks = lets > consts && functions > 0
  const hasLeaning = lets > consts * 2
  const hasSettling = functions > 0 && consts > lets

  let integrity = 0
  if (hasSolidFoundation) integrity += 25
  if (hasReinforcedConcrete) integrity += 20
  if (hasStructuralSteel) integrity += 25
  if (hasGuyWires) integrity += 15
  if (hasSettling) integrity += 10
  if (hasCracks) integrity -= 15
  if (hasLeaning) integrity -= 10
  integrity = Math.max(0, Math.min(100, integrity))

  return {
    integrity,
    isPlumb: integrity >= 70,
    hasSolidFoundation,
    hasReinforcedConcrete,
    hasStructuralSteel,
    hasGuyWires,
    hasCracks,
    hasLeaning,
    hasSettling,
    crackCount: hasCracks ? lets - Math.min(consts, lets) : 0,
  }
}

// ─── measureAnchor ───────────────────────────────────────────────────────────

/**
 * Measure dependency security
 * @example
 * measureAnchor('import { x } from "react"') // { security: 60, ... }
 */
export function measureAnchor(content: string): AnchorMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      security: 0, type: 'sand-anchor', isSolid: false, isDeep: false,
      hasRedundancy: false, hasCorrosion: false, hasStress: false,
      hasMovement: false, hasCavitation: false, redundancyCount: 0,
    }
  }

  const imports = (content.match(IMPORT_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length

  const isSolid = imports > 0 && sideEffects === 0
  const isDeep = types > 0 && imports > 0
  const hasRedundancy = tryCatch > 0
  const hasCorrosion = sideEffects > 0
  const hasStress = lets > imports && lets > 0
  const hasMovement = lets > 0 && consts > 0
  const hasCavitation = lets > consts && lets > 2

  let security = 0
  if (isSolid) security += 25
  if (isDeep) security += 20
  if (hasRedundancy) security += 20
  security += Math.min(imports * 5, 15)
  security += Math.min(types * 2, 10)
  if (hasCorrosion) security -= 15
  if (hasCavitation) security -= 10
  security = Math.max(0, Math.min(100, security))

  let type: AnchorType = 'sand-anchor'
  if (security >= 80) type = 'bedrock'
  else if (security >= 65) type = 'concrete-block'
  else if (security >= 50) type = 'gravity-anchor'
  else if (security >= 35) type = 'pile'
  else if (security >= 15) type = 'deadman'

  return {
    security,
    type,
    isSolid,
    isDeep,
    hasRedundancy,
    hasCorrosion,
    hasStress,
    hasMovement,
    hasCavitation,
    redundancyCount: tryCatch,
  }
}

// ─── measureLoad ─────────────────────────────────────────────────────────────

/**
 * Measure responsibility balance
 * @example
 * measureLoad('function a() {} function b() {} function c() {}') // { distribution: 60, ... }
 */
export function measureLoad(content: string): LoadMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      distribution: 0, isBalanced: false, hasEvenDistribution: false,
      hasOverloadedSection: false, hasUnderloadedSection: false,
      hasDynamicLoad: false, hasStaticLoad: false,
      hasResonance: false, hasFatigueRisk: false, overloadedCount: 0,
    }
  }

  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const ifs = (content.match(IF_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const asyncs = (content.match(ASYNC_RE) ?? []).length

  const linesPerFunction = functions > 0 ? loc / functions : loc
  const hasOverloadedSection = functions > 0 && linesPerFunction > 30
  const hasUnderloadedSection = functions > 5 && linesPerFunction < 5
  const hasEvenDistribution = functions > 0 && linesPerFunction >= 5 && linesPerFunction <= 25
  const hasDynamicLoad = asyncs > 0 || pipes > 0
  const hasStaticLoad = !hasDynamicLoad && functions > 0
  const hasResonance = pipes > functions * 2 && functions > 0
  const hasFatigueRisk = ifs > functions * 3 && functions > 0

  let distribution = 50
  if (hasEvenDistribution) distribution += 20
  else if (hasOverloadedSection) distribution -= 15
  else if (hasUnderloadedSection) distribution -= 10
  if (hasDynamicLoad) distribution += 10
  if (hasResonance) distribution -= 10
  if (hasFatigueRisk) distribution -= 10
  distribution = Math.max(0, Math.min(100, distribution))

  return {
    distribution,
    isBalanced: hasEvenDistribution && !hasResonance,
    hasEvenDistribution,
    hasOverloadedSection,
    hasUnderloadedSection,
    hasDynamicLoad,
    hasStaticLoad,
    hasResonance,
    hasFatigueRisk,
    overloadedCount: hasOverloadedSection ? functions : 0,
  }
}

// ─── measureSpan ─────────────────────────────────────────────────────────────

/**
 * Measure API clarity
 * @example
 * measureSpan('export function add(a: number, b: number): number { return a + b }') // { clarity: 80, ... }
 */
export function measureSpan(content: string): SpanMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      clarity: 0, length: 0, isClear: false, hasVisibility: false,
      hasProperSignage: false, hasLaneMarkings: false, hasTrafficFlow: false,
      hasTollPlaza: false, hasScenicViews: false, signageCount: 0,
    }
  }

  const exports = (content.match(EXPORT_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const params = (content.match(PARAM_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length

  const hasVisibility = exports > 0
  const hasProperSignage = jsdoc > 0
  const hasLaneMarkings = types > 0 && params > 0
  const hasTrafficFlow = returns > 0 && pipes_count(content) > 0
  const hasTollPlaza = exports > 0 && consts > 0
  const hasScenicViews = interfaces > 0 && exports > 0

  let clarity = 0
  if (hasVisibility) clarity += 20
  if (hasProperSignage) clarity += 20
  if (hasLaneMarkings) clarity += 20
  if (hasTrafficFlow) clarity += 15
  if (hasScenicViews) clarity += 15
  clarity += Math.min(types * 2, 10)
  clarity = Math.max(0, Math.min(100, clarity))

  const length = Math.min(100, Math.round(loc / 2))

  return {
    clarity,
    length,
    isClear: clarity >= 70,
    hasVisibility,
    hasProperSignage,
    hasLaneMarkings,
    hasTrafficFlow,
    hasTollPlaza,
    hasScenicViews,
    signageCount: jsdoc,
  }
}

function pipes_count(content: string): number {
  return (content.match(PIPE_RE) ?? []).length
}

// ─── analyzeBridgeSpan ───────────────────────────────────────────────────────

/**
 * Analyze a single file as a bridge span
 * @example
 * analyzeBridgeSpan('const x = 1', 'test.ts') // { qualityScore: 30, ... }
 */
export function analyzeBridgeSpan(content: string, filePath: string): BridgeSpan {
  const cable = measureCable(content)
  const deck = measureDeck(content)
  const tower = measureTower(content)
  const anchor = measureAnchor(content)
  const load = measureLoad(content)
  const span = measureSpan(content)

  const cableStrength = cable.strength
  const deckStability = deck.stability
  const towerIntegrity = tower.integrity
  const anchorSecurity = anchor.security
  const loadDistribution = load.distribution
  const spanClarity = span.clarity

  const qualityScore = Math.round(
    (cableStrength + deckStability + towerIntegrity + anchorSecurity + loadDistribution + spanClarity) / 6,
  )

  let condition: SpanCondition = 'condemned'
  if (qualityScore >= 90) condition = 'golden-gate'
  else if (qualityScore >= 75) condition = 'modern-marvel'
  else if (qualityScore >= 60) condition = 'sound-structure'
  else if (qualityScore >= 40) condition = 'needs-maintenance'
  else if (qualityScore >= 20) condition = 'structurally-deficient'

  return {
    file: filePath,
    cableStrength,
    deckStability,
    towerIntegrity,
    anchorSecurity,
    loadDistribution,
    spanClarity,
    cable,
    deck,
    tower,
    anchor,
    load,
    span,
    condition,
    qualityScore,
  }
}

// ─── classifyNetworkType ─────────────────────────────────────────────────────

/**
 * Classify network type based on spans
 * @example
 * classifyNetworkType(spans) // 'state-highway'
 */
export function classifyNetworkType(spans: BridgeSpan[]): NetworkType {
  if (spans.length === 0) return 'rope-bridge'

  const avgQuality = spans.reduce((s, x) => s + x.qualityScore, 0) / spans.length
  const goldenCount = spans.filter((s) => s.condition === 'golden-gate').length

  if (avgQuality >= 80 && goldenCount >= 2) return 'interstate-system'
  if (avgQuality >= 65) return 'state-highway'
  if (avgQuality >= 50) return 'county-road'
  if (avgQuality >= 35) return 'city-street'
  if (avgQuality >= 15) return 'footbridge'
  return 'rope-bridge'
}

// ─── classifyEngineerGrade ───────────────────────────────────────────────────

/**
 * Classify engineer grade based on average integrity
 * @example
 * classifyEngineerGrade(85) // 'senior-engineer'
 */
export function classifyEngineerGrade(avgIntegrity: number): EngineerGrade {
  if (avgIntegrity >= 90) return 'chief-engineer'
  if (avgIntegrity >= 75) return 'senior-engineer'
  if (avgIntegrity >= 55) return 'engineer'
  if (avgIntegrity >= 35) return 'technician'
  if (avgIntegrity >= 15) return 'handyman'
  return 'demolition'
}

// ─── classifyNetworkCondition ────────────────────────────────────────────────

function classifyNetworkCondition(avgIntegrity: number): NetworkCondition {
  if (avgIntegrity >= 85) return 'engineering-marvel'
  if (avgIntegrity >= 65) return 'well-engineered'
  if (avgIntegrity >= 45) return 'adequate'
  if (avgIntegrity >= 25) return 'substandard'
  if (avgIntegrity >= 10) return 'dangerous'
  return 'collapsed'
}

// ─── analyzeBridgeNetwork ────────────────────────────────────────────────────

/**
 * Analyze a directory as a bridge network
 * @example
 * analyzeBridgeNetwork(spans, 'src/') // { networkType: 'county-road', ... }
 */
export function analyzeBridgeNetwork(spans: BridgeSpan[], dirPath: string): BridgeNetwork {
  if (spans.length === 0) {
    return {
      directory: dirPath,
      spans: [],
      avgCableStrength: 0,
      avgDeckStability: 0,
      avgTowerIntegrity: 0,
      goldenGateCount: 0,
      condemnedCount: 0,
      balancedLoadCount: 0,
      clearSpanCount: 0,
      networkType: 'rope-bridge',
      condition: 'collapsed',
    }
  }

  const avgCableStrength = Math.round(spans.reduce((s, x) => s + x.cableStrength, 0) / spans.length)
  const avgDeckStability = Math.round(spans.reduce((s, x) => s + x.deckStability, 0) / spans.length)
  const avgTowerIntegrity = Math.round(spans.reduce((s, x) => s + x.towerIntegrity, 0) / spans.length)
  const avgQuality = Math.round(spans.reduce((s, x) => s + x.qualityScore, 0) / spans.length)

  return {
    directory: dirPath,
    spans,
    avgCableStrength,
    avgDeckStability,
    avgTowerIntegrity,
    goldenGateCount: spans.filter((s) => s.condition === 'golden-gate').length,
    condemnedCount: spans.filter((s) => s.condition === 'condemned').length,
    balancedLoadCount: spans.filter((s) => s.load.isBalanced).length,
    clearSpanCount: spans.filter((s) => s.span.isClear).length,
    networkType: classifyNetworkType(spans),
    condition: classifyNetworkCondition(avgQuality),
  }
}

// ─── generateRecommendations ─────────────────────────────────────────────────

/**
 * Generate improvement recommendations
 * @example
 * generateRecommendations(spans, networks, authority, stats) // ['Strengthen cables...']
 */
export function generateRecommendations(
  spans: BridgeSpan[],
  networks: BridgeNetwork[],
  _authority: { avgCableStrength: number; avgDeckStability: number; avgTowerIntegrity: number; isStructurallySound: boolean; overallIntegrity: number },
  stats: SuspensionBridgeStats,
): string[] {
  const recs: string[] = []

  if (stats.hasCorrosionCount > stats.totalFiles * 0.5) {
    recs.push('Cable corrosion detected — reduce mutations and side effects in connections')
  }
  if (stats.avgDeckStability < 40) {
    recs.push('Deck instability — add type annotations and error handling to stabilize interfaces')
  }
  if (stats.hasCracksCount > stats.totalFiles * 0.3) {
    recs.push('Tower cracks found — reduce let bindings and prefer const for structural integrity')
  }
  if (stats.avgAnchorSecurity < 40) {
    recs.push('Anchor insecurity — review dependency usage and add error boundaries')
  }
  if (stats.condemnedCount > stats.totalFiles * 0.3) {
    recs.push('Too many condemned spans — major refactoring needed for structural safety')
  }
  if (stats.hasFatigueRiskCount > stats.totalFiles * 0.2) {
    recs.push('Fatigue risk detected — simplify conditional logic to reduce wear')
  }
  if (stats.isTautCount < stats.totalFiles * 0.3) {
    recs.push('Slack cables — improve import/export balance for stronger connections')
  }
  if (stats.hasRailingsCount < stats.totalFiles * 0.3) {
    recs.push('Missing railings — add validation checks and type guards')
  }

  const worst = spans.length > 0
    ? spans.reduce((w, s) => s.qualityScore < w.qualityScore ? s : w, spans[0] as typeof spans[number])
    : null
  if (worst && worst.qualityScore < 25) {
    recs.push(`Weakest span "${worst.file}" needs urgent structural repair (score: ${worst.qualityScore})`)
  }

  if (networks.some((n) => n.condition === 'collapsed')) {
    recs.push('Some networks have collapsed — consider architectural redesign')
  }

  return recs.length > 0 ? recs : ['Bridge structure is sound — continue regular maintenance']
}

// ─── buildSuspensionBridgeResult ─────────────────────────────────────────────

/**
 * Build the complete suspension bridge result
 * @example
 * buildSuspensionBridgeResult(['a.ts'], ['const x = 1'], {}) // { spans: [...], ... }
 */
export function buildSuspensionBridgeResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): SuspensionBridgeResult {
  const spans: BridgeSpan[] = []
  for (let i = 0; i < files.length; i++) {
    spans.push(analyzeBridgeSpan(contents[i] ?? '', files[i] ?? ''))
  }

  const dirMap = new Map<string, BridgeSpan[]>()
  for (const span of spans) {
    const dir = span.file.includes('/') ? span.file.substring(0, span.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(span)
    } else {
      dirMap.set(dir, [span])
    }
  }

  const networks: BridgeNetwork[] = []
  for (const [dir, dirSpans] of dirMap) {
    networks.push(analyzeBridgeNetwork(dirSpans, dir))
  }

  const avgCableStrength = spans.length > 0 ? Math.round(spans.reduce((s, x) => s + x.cableStrength, 0) / spans.length) : 0
  const avgDeckStability = spans.length > 0 ? Math.round(spans.reduce((s, x) => s + x.deckStability, 0) / spans.length) : 0
  const avgTowerIntegrity = spans.length > 0 ? Math.round(spans.reduce((s, x) => s + x.towerIntegrity, 0) / spans.length) : 0
  const overallIntegrity = spans.length > 0 ? Math.round(spans.reduce((s, x) => s + x.qualityScore, 0) / spans.length) : 0

  const authority = {
    avgCableStrength,
    avgDeckStability,
    avgTowerIntegrity,
    isStructurallySound: overallIntegrity >= 60,
    overallIntegrity,
  }

  const conditions = spans.map((s) => s.condition)
  const bestSpan = spans.length > 0
    ? spans.reduce((b, s) => s.qualityScore > b.qualityScore ? s : b, spans[0] as typeof spans[number])
    : null
  const strongestCable = spans.length > 0
    ? spans.reduce((b, s) => s.cableStrength > b.cableStrength ? s : b, spans[0] as typeof spans[number])
    : null
  const stablestDeck = spans.length > 0
    ? spans.reduce((b, s) => s.deckStability > b.deckStability ? s : b, spans[0] as typeof spans[number])
    : null
  const strongestTower = spans.length > 0
    ? spans.reduce((b, s) => s.towerIntegrity > b.towerIntegrity ? s : b, spans[0] as typeof spans[number])
    : null
  const clearest = spans.length > 0
    ? spans.reduce((b, s) => s.spanClarity > b.spanClarity ? s : b, spans[0] as typeof spans[number])
    : null

  const stats: SuspensionBridgeStats = {
    totalFiles: spans.length,
    totalNetworks: networks.length,
    avgCableStrength,
    avgDeckStability,
    avgTowerIntegrity,
    avgAnchorSecurity: spans.length > 0 ? Math.round(spans.reduce((s, x) => s + x.anchorSecurity, 0) / spans.length) : 0,
    avgLoadDistribution: spans.length > 0 ? Math.round(spans.reduce((s, x) => s + x.loadDistribution, 0) / spans.length) : 0,
    avgSpanClarity: spans.length > 0 ? Math.round(spans.reduce((s, x) => s + x.spanClarity, 0) / spans.length) : 0,
    goldenGateCount: conditions.filter((c) => c === 'golden-gate').length,
    modernMarvelCount: conditions.filter((c) => c === 'modern-marvel').length,
    soundStructureCount: conditions.filter((c) => c === 'sound-structure').length,
    needsMaintenanceCount: conditions.filter((c) => c === 'needs-maintenance').length,
    structurallyDeficientCount: conditions.filter((c) => c === 'structurally-deficient').length,
    condemnedCount: conditions.filter((c) => c === 'condemned').length,
    isTautCount: spans.filter((s) => s.cable.isTaut).length,
    hasCorrosionCount: spans.filter((s) => s.cable.hasCorrosion).length,
    hasFrayingCount: spans.filter((s) => s.cable.hasFraying).length,
    isLevelCount: spans.filter((s) => s.deck.isLevel).length,
    hasRailingsCount: spans.filter((s) => s.deck.hasRailings).length,
    hasSolidFoundationCount: spans.filter((s) => s.tower.hasSolidFoundation).length,
    hasCracksCount: spans.filter((s) => s.tower.hasCracks).length,
    isSolidCount: spans.filter((s) => s.anchor.isSolid).length,
    isBalancedCount: spans.filter((s) => s.load.isBalanced).length,
    hasFatigueRiskCount: spans.filter((s) => s.load.hasFatigueRisk).length,
    isClearCount: spans.filter((s) => s.span.isClear).length,
    overallIntegrity,
    engineerGrade: classifyEngineerGrade(overallIntegrity),
    bestSpan: bestSpan?.file ?? '',
    strongestCable: strongestCable?.file ?? '',
    stablestDeck: stablestDeck?.file ?? '',
    strongestTower: strongestTower?.file ?? '',
    clearestSpan: clearest?.file ?? '',
  }

  const recommendations = generateRecommendations(spans, networks, authority, stats)

  return { spans, networks, authority, stats, recommendations }
}
