// ─── Types ─────────────────────────────────────────────────────────────────

export interface ArchitectMeasure {
  design: number
  scale: 'cosmos-spanning' | 'galactic-scale' | 'solar-system' | 'planetary' | 'orbital' | 'grounded'
  hasHighDesign: boolean
  hasWellDesigned: boolean
  hasProperScale: boolean
  hasNoBloat: boolean
  hasScalable: boolean
  hasNoOversized: boolean
  hasProportioned: boolean
  hasNoMisSized: boolean
  hasElegant: boolean
  hasNoClumsy: boolean
  bloatCount: number
  oversizedCount: number
}

export interface ConstellationMeasure {
  quality: number
  pattern: 'perfect-constellation' | 'clear-star-map' | 'recognizable-pattern' | 'scattered-stars' | 'random-dots' | 'void'
  hasHighQuality: boolean
  hasOrganized: boolean
  hasPatterned: boolean
  hasNoChaos: boolean
  hasStructured: boolean
  hasNoRandomness: boolean
  hasClear: boolean
  hasNoConfusion: boolean
  hasMapped: boolean
  hasNoTangle: boolean
  chaosCount: number
  randomnessCount: number
}

export interface StellarMeasure {
  brightness: number
  magnitude: 'supergiant' | 'bright-star' | 'steady-star' | 'dim-star' | 'brown-dwarf' | 'black-hole'
  hasHighBrightness: boolean
  hasExcellent: boolean
  hasBrilliant: boolean
  hasNoDullness: boolean
  hasOutstanding: boolean
  hasNoMediocrity: boolean
  hasShining: boolean
  hasNoDarkness: boolean
  hasLuminous: boolean
  hasNoObscurity: boolean
  dullnessCount: number
  mediocrityCount: number
}

export interface NebulaMeasure {
  richness: number
  depth: 'orion-nebula' | 'rich-cloud' | 'stellar-nursery' | 'thin-gas' | 'void-space' | 'dark-matter'
  hasHighRichness: boolean
  hasCreative: boolean
  hasInnovative: boolean
  hasNoSterility: boolean
  hasRich: boolean
  hasNoBarrenness: boolean
  hasDeep: boolean
  hasNoShallowness: boolean
  hasExpressive: boolean
  hasNoFlatness: boolean
  hasImaginative: boolean
  sterilityCount: number
  barrennessCount: number
}

export interface GravityMeasure {
  stability: number
  pull: 'stable-orbit' | 'proper-gravity' | 'balanced-pull' | 'wobbly-orbit' | 'chaotic-orbit' | 'collapsed'
  hasHighStability: boolean
  hasStable: boolean
  hasWellManaged: boolean
  hasNoBreakage: boolean
  hasPinned: boolean
  hasNoDrifting: boolean
  hasControlled: boolean
  hasNoChaotic: boolean
  hasSecure: boolean
  hasNoVulnerable: boolean
  breakageCount: number
  driftingCount: number
}

export interface HarmonyMeasure {
  coherence: number
  resonance: 'cosmic-harmony' | 'stellar-resonance' | 'proper-alignment' | 'partial-harmony' | 'dissonance' | 'chaos'
  hasHighCoherence: boolean
  hasCoherent: boolean
  hasHarmonious: boolean
  hasNoConflict: boolean
  hasAligned: boolean
  hasNoContradiction: boolean
  hasConsistent: boolean
  hasNoClash: boolean
  hasUnified: boolean
  hasNoFragmentation: boolean
  hasBalanced: boolean
  conflictCount: number
  contradictionCount: number
}

export type StarCondition = 'cosmic-masterpiece' | 'brilliant-galaxy' | 'stellar-system' | 'dim-nebula' | 'dark-void' | 'black-hole'

export interface StarSystem {
  file: string
  cosmicArchitecture: number
  constellationQuality: number
  stellarBrightness: number
  nebulaRichness: number
  gravityStability: number
  cosmicHarmony: number
  architect: ArchitectMeasure
  constellation: ConstellationMeasure
  stellar: StellarMeasure
  nebula: NebulaMeasure
  gravity: GravityMeasure
  harmony: HarmonyMeasure
  condition: StarCondition
  qualityScore: number
}

export type ClusterType = 'galactic-filament' | 'galaxy-cluster' | 'star-cluster' | 'binary-system' | 'rogue-planet' | 'void'
export type ClusterCondition = 'universe-marvel' | 'galactic-wonder' | 'stellar-collection' | 'dim-cluster' | 'dark-region' | 'void'

export interface GalaxyCluster {
  directory: string
  systems: StarSystem[]
  avgArchitecture: number
  avgBrightness: number
  avgHarmony: number
  cosmicMasterpieceCount: number
  blackHoleCount: number
  brilliantGalaxyCount: number
  stellarSystemCount: number
  clusterType: ClusterType
  condition: ClusterCondition
}

export interface Universe {
  avgArchitecture: number
  avgBrightness: number
  avgHarmony: number
  isCosmic: boolean
  overallCosmic: number
}

export type AstronomerGrade = 'cosmic-architect' | 'master-astronomer' | 'expert-stargazer' | 'amateur-observer' | 'cloudy-night' | 'blind'

export interface StarryVaultStats {
  totalFiles: number
  totalClusters: number
  avgCosmicArchitecture: number
  avgConstellationQuality: number
  avgStellarBrightness: number
  avgNebulaRichness: number
  avgGravityStability: number
  avgCosmicHarmony: number
  cosmicMasterpieceCount: number
  brilliantGalaxyCount: number
  stellarSystemCount: number
  dimNebulaCount: number
  darkVoidCount: number
  blackHoleCount: number
  hasHighDesignCount: number
  hasHighQualityCount: number
  hasHighBrightnessCount: number
  hasHighRichnessCount: number
  hasHighStabilityCount: number
  hasHighCoherenceCount: number
  overallCosmic: number
  astronomerGrade: AstronomerGrade
  bestSystem: string
  bestArchitected: string
  bestOrganized: string
  brightest: string
  richest: string
  mostStable: string
  celebration: string
}

export interface StarryVaultResult {
  systems: StarSystem[]
  clusters: GalaxyCluster[]
  universe: Universe
  stats: StarryVaultStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureArchitect(content) evaluates code high-level design */
export function measureArchitect(content: string): ArchitectMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)

  const bloatMatches = content.match(/\bvar\s+/g)
  const bloatCount = bloatMatches ? bloatMatches.length : 0
  const oversizedMatches = content.match(/\bany\b/g)
  const oversizedCount = oversizedMatches ? oversizedMatches.length : 0

  const hasWellDesigned = hasExport && hasInterface
  const hasProperScale = hasReturnType && hasConst
  const hasScalable = hasGenerics && hasTypeAlias
  const hasProportioned = hasClass && hasReadonly
  const hasElegant = hasAsync && hasOptionalChaining

  let design = 0
  if (hasExport) design += 10
  if (hasInterface) design += 10
  if (hasClass) design += 8
  if (hasTypeAlias) design += 8
  if (hasGenerics) design += 10
  if (hasReadonly) design += 8
  if (hasReturnType) design += 10
  if (hasConst) design += 8
  if (hasAsync) design += 8
  if (hasOptionalChaining) design += 8
  if (hasWellDesigned) design += 5
  if (hasProperScale) design += 5
  if (hasScalable) design += 5
  if (hasProportioned) design += 5
  if (hasElegant) design += 5

  design = Math.min(100, Math.round(design))

  let scale: ArchitectMeasure['scale'] = 'grounded'
  if (design >= 85) scale = 'cosmos-spanning'
  else if (design >= 70) scale = 'galactic-scale'
  else if (design >= 55) scale = 'solar-system'
  else if (design >= 40) scale = 'planetary'
  else if (design >= 25) scale = 'orbital'

  return {
    design, scale,
    hasHighDesign: design >= 70,
    hasWellDesigned, hasProperScale,
    hasNoBloat: bloatCount === 0,
    hasScalable, hasNoOversized: oversizedCount === 0,
    hasProportioned, hasNoMisSized: bloatCount === 0 && oversizedCount === 0,
    hasElegant, hasNoClumsy: bloatCount === 0,
    bloatCount, oversizedCount,
  }
}

/** @example measureConstellation(content) evaluates code pattern organization */
export function measureConstellation(content: string): ConstellationMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)

  const chaosMatches = content.match(/\bvar\s+/g)
  const chaosCount = chaosMatches ? chaosMatches.length : 0
  const randomnessMatches = content.match(/\bany\b/g)
  const randomnessCount = randomnessMatches ? randomnessMatches.length : 0

  const hasOrganized = hasExport && hasImport
  const hasPatterned = hasInterface && hasReturnType
  const hasStructured = hasClass && hasConst
  const hasClear = hasNamedExport && hasDocComments
  const hasMapped = hasReadonly && hasPrivate

  let quality = 0
  if (hasExport) quality += 8
  if (hasImport) quality += 10
  if (hasInterface) quality += 10
  if (hasNamedExport) quality += 8
  if (hasReturnType) quality += 10
  if (hasConst) quality += 8
  if (hasClass) quality += 8
  if (hasReadonly) quality += 8
  if (hasPrivate) quality += 8
  if (hasDocComments) quality += 8
  if (hasOrganized) quality += 5
  if (hasPatterned) quality += 5
  if (hasStructured) quality += 5
  if (hasClear) quality += 5
  if (hasMapped) quality += 5

  quality = Math.min(100, Math.round(quality))

  let pattern: ConstellationMeasure['pattern'] = 'void'
  if (quality >= 85) pattern = 'perfect-constellation'
  else if (quality >= 70) pattern = 'clear-star-map'
  else if (quality >= 55) pattern = 'recognizable-pattern'
  else if (quality >= 40) pattern = 'scattered-stars'
  else if (quality >= 25) pattern = 'random-dots'

  return {
    quality, pattern,
    hasHighQuality: quality >= 70,
    hasOrganized, hasPatterned, hasNoChaos: chaosCount === 0,
    hasStructured, hasNoRandomness: randomnessCount === 0,
    hasClear, hasNoConfusion: chaosCount === 0 && randomnessCount === 0,
    hasMapped, hasNoTangle: chaosCount === 0,
    chaosCount, randomnessCount,
  }
}

/** @example measureStellar(content) evaluates code excellence */
export function measureStellar(content: string): StellarMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)

  const dullnessMatches = content.match(/\bvar\s+/g)
  const dullnessCount = dullnessMatches ? dullnessMatches.length : 0
  const mediocrityMatches = content.match(/\bany\b/g)
  const mediocrityCount = mediocrityMatches ? mediocrityMatches.length : 0

  const hasExcellent = hasStrictEquality && hasConst
  const hasBrilliant = hasOptionalChaining && hasNullishCoalescing
  const hasOutstanding = hasAsync && hasTryCatch
  const hasShining = hasExport && hasReturnType
  const hasLuminous = hasInterface && hasDefaultParam

  let brightness = 0
  if (hasExport) brightness += 8
  if (hasConst) brightness += 10
  if (hasReturnType) brightness += 10
  if (hasStrictEquality) brightness += 8
  if (hasOptionalChaining) brightness += 10
  if (hasNullishCoalescing) brightness += 8
  if (hasAsync) brightness += 8
  if (hasTryCatch) brightness += 10
  if (hasInterface) brightness += 8
  if (hasDefaultParam) brightness += 8
  if (hasExcellent) brightness += 5
  if (hasBrilliant) brightness += 5
  if (hasOutstanding) brightness += 5
  if (hasShining) brightness += 5
  if (hasLuminous) brightness += 5

  brightness = Math.min(100, Math.round(brightness))

  let magnitude: StellarMeasure['magnitude'] = 'black-hole'
  if (brightness >= 85) magnitude = 'supergiant'
  else if (brightness >= 70) magnitude = 'bright-star'
  else if (brightness >= 55) magnitude = 'steady-star'
  else if (brightness >= 40) magnitude = 'dim-star'
  else if (brightness >= 25) magnitude = 'brown-dwarf'

  return {
    brightness, magnitude,
    hasHighBrightness: brightness >= 70,
    hasExcellent, hasBrilliant, hasNoDullness: dullnessCount === 0,
    hasOutstanding, hasNoMediocrity: mediocrityCount === 0,
    hasShining, hasNoDarkness: dullnessCount === 0 && mediocrityCount === 0,
    hasLuminous, hasNoObscurity: dullnessCount === 0,
    dullnessCount, mediocrityCount,
  }
}

/** @example measureNebula(content) evaluates code creative depth */
export function measureNebula(content: string): NebulaMeasure {
  const hasExport = /export\s/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)

  const sterilityMatches = content.match(/\bvar\s+/g)
  const sterilityCount = sterilityMatches ? sterilityMatches.length : 0
  const barrennessMatches = content.match(/\bany\b/g)
  const barrennessCount = barrennessMatches ? barrennessMatches.length : 0

  const hasCreative = hasGenerics && hasTypeAlias
  const hasInnovative = hasOptionalChaining && hasNullishCoalescing
  const hasRich = hasInterface && hasReadonly
  const hasDeep = hasPrivate && hasGenerics
  const hasExpressive = hasExport && hasDocComments
  const hasImaginative = hasClass && hasTypeAlias

  let richness = 0
  if (hasExport) richness += 8
  if (hasGenerics) richness += 10
  if (hasTypeAlias) richness += 8
  if (hasInterface) richness += 10
  if (hasReadonly) richness += 8
  if (hasPrivate) richness += 8
  if (hasOptionalChaining) richness += 10
  if (hasNullishCoalescing) richness += 8
  if (hasDocComments) richness += 8
  if (hasClass) richness += 8
  if (hasCreative) richness += 5
  if (hasInnovative) richness += 5
  if (hasRich) richness += 5
  if (hasDeep) richness += 5
  if (hasExpressive) richness += 5

  richness = Math.min(100, Math.round(richness))

  let depth: NebulaMeasure['depth'] = 'dark-matter'
  if (richness >= 85) depth = 'orion-nebula'
  else if (richness >= 70) depth = 'rich-cloud'
  else if (richness >= 55) depth = 'stellar-nursery'
  else if (richness >= 40) depth = 'thin-gas'
  else if (richness >= 25) depth = 'void-space'

  return {
    richness, depth,
    hasHighRichness: richness >= 70,
    hasCreative, hasInnovative, hasNoSterility: sterilityCount === 0,
    hasRich, hasNoBarrenness: barrennessCount === 0,
    hasDeep, hasNoShallowness: sterilityCount === 0 && barrennessCount === 0,
    hasExpressive, hasNoFlatness: sterilityCount === 0,
    hasImaginative,
    sterilityCount, barrennessCount,
  }
}

/** @example measureGravity(content) evaluates code dependency management */
export function measureGravity(content: string): GravityMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)

  const breakageMatches = content.match(/\bvar\s+/g)
  const breakageCount = breakageMatches ? breakageMatches.length : 0
  const driftingMatches = content.match(/\bany\b/g)
  const driftingCount = driftingMatches ? driftingMatches.length : 0

  const hasStable = hasStrictEquality && hasConst
  const hasWellManaged = hasExport && hasImport
  const hasPinned = hasReadonly && hasPrivate
  const hasControlled = hasInterface && hasReturnType
  const hasSecure = hasOptionalChaining && hasDefaultParam

  let stability = 0
  if (hasExport) stability += 8
  if (hasImport) stability += 10
  if (hasConst) stability += 10
  if (hasReturnType) stability += 10
  if (hasReadonly) stability += 8
  if (hasPrivate) stability += 8
  if (hasInterface) stability += 8
  if (hasStrictEquality) stability += 8
  if (hasOptionalChaining) stability += 8
  if (hasDefaultParam) stability += 8
  if (hasStable) stability += 5
  if (hasWellManaged) stability += 5
  if (hasPinned) stability += 5
  if (hasControlled) stability += 5
  if (hasSecure) stability += 5

  stability = Math.min(100, Math.round(stability))

  let pull: GravityMeasure['pull'] = 'collapsed'
  if (stability >= 85) pull = 'stable-orbit'
  else if (stability >= 70) pull = 'proper-gravity'
  else if (stability >= 55) pull = 'balanced-pull'
  else if (stability >= 40) pull = 'wobbly-orbit'
  else if (stability >= 25) pull = 'chaotic-orbit'

  return {
    stability, pull,
    hasHighStability: stability >= 70,
    hasStable, hasWellManaged, hasNoBreakage: breakageCount === 0,
    hasPinned, hasNoDrifting: driftingCount === 0,
    hasControlled, hasNoChaotic: breakageCount === 0 && driftingCount === 0,
    hasSecure, hasNoVulnerable: breakageCount === 0,
    breakageCount, driftingCount,
  }
}

/** @example measureHarmony(content) evaluates code system coherence */
export function measureHarmony(content: string): HarmonyMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const conflictMatches = content.match(/\bvar\s+/g)
  const conflictCount = conflictMatches ? conflictMatches.length : 0
  const contradictionMatches = content.match(/\bany\b/g)
  const contradictionCount = contradictionMatches ? contradictionMatches.length : 0

  const hasCoherent = hasExport && hasImport
  const hasHarmonious = hasConst && hasReturnType
  const hasAligned = hasInterface && hasClass
  const hasConsistent = hasNamedExport && hasReadonly
  const hasUnified = hasDocComments && hasAsync
  const hasBalanced = hasExport && hasConst

  let coherence = 0
  if (hasExport) coherence += 10
  if (hasImport) coherence += 10
  if (hasConst) coherence += 8
  if (hasReturnType) coherence += 10
  if (hasInterface) coherence += 8
  if (hasClass) coherence += 8
  if (hasDocComments) coherence += 8
  if (hasAsync) coherence += 8
  if (hasNamedExport) coherence += 8
  if (hasReadonly) coherence += 8
  if (hasCoherent) coherence += 5
  if (hasHarmonious) coherence += 5
  if (hasAligned) coherence += 5
  if (hasConsistent) coherence += 5
  if (hasUnified) coherence += 5

  coherence = Math.min(100, Math.round(coherence))

  let resonance: HarmonyMeasure['resonance'] = 'chaos'
  if (coherence >= 85) resonance = 'cosmic-harmony'
  else if (coherence >= 70) resonance = 'stellar-resonance'
  else if (coherence >= 55) resonance = 'proper-alignment'
  else if (coherence >= 40) resonance = 'partial-harmony'
  else if (coherence >= 25) resonance = 'dissonance'

  return {
    coherence, resonance,
    hasHighCoherence: coherence >= 70,
    hasCoherent, hasHarmonious, hasNoConflict: conflictCount === 0,
    hasAligned, hasNoContradiction: contradictionCount === 0,
    hasConsistent, hasNoClash: conflictCount === 0 && contradictionCount === 0,
    hasUnified, hasNoFragmentation: conflictCount === 0,
    hasBalanced,
    conflictCount, contradictionCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'cosmic-masterpiece' */
export function classifyCondition(score: number): StarCondition {
  if (score >= 85) return 'cosmic-masterpiece'
  if (score >= 70) return 'brilliant-galaxy'
  if (score >= 55) return 'stellar-system'
  if (score >= 40) return 'dim-nebula'
  if (score >= 25) return 'dark-void'
  return 'black-hole'
}

/** @example classifyClusterType(systems) returns cluster classification */
export function classifyClusterType(systems: StarSystem[]): ClusterType {
  if (systems.length === 0) return 'void'
  const avgQs = systems.reduce((s, sys) => s + sys.qualityScore, 0) / systems.length
  const masterCount = systems.filter((sys) => sys.condition === 'cosmic-masterpiece').length
  const ratio = masterCount / systems.length
  if (avgQs >= 75 && ratio >= 0.5) return 'galactic-filament'
  if (avgQs >= 60) return 'galaxy-cluster'
  if (avgQs >= 45) return 'star-cluster'
  if (avgQs >= 30) return 'binary-system'
  if (avgQs >= 15) return 'rogue-planet'
  return 'void'
}

/** @example classifyClusterCondition(avgQs) returns cluster condition */
export function classifyClusterCondition(avgQs: number): ClusterCondition {
  if (avgQs >= 75) return 'universe-marvel'
  if (avgQs >= 60) return 'galactic-wonder'
  if (avgQs >= 45) return 'stellar-collection'
  if (avgQs >= 30) return 'dim-cluster'
  if (avgQs >= 15) return 'dark-region'
  return 'void'
}

/** @example classifyAstronomerGrade(80) returns 'cosmic-architect' */
export function classifyAstronomerGrade(avgCosmic: number): AstronomerGrade {
  if (avgCosmic >= 80) return 'cosmic-architect'
  if (avgCosmic >= 65) return 'master-astronomer'
  if (avgCosmic >= 50) return 'expert-stargazer'
  if (avgCosmic >= 35) return 'amateur-observer'
  if (avgCosmic >= 20) return 'cloudy-night'
  return 'blind'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeStarSystem(content, filePath) evaluates single file */
export function analyzeStarSystem(content: string, filePath: string): StarSystem {
  const architectMeasure = measureArchitect(content)
  const constellationMeasure = measureConstellation(content)
  const stellarMeasure = measureStellar(content)
  const nebulaMeasure = measureNebula(content)
  const gravityMeasure = measureGravity(content)
  const harmonyMeasure = measureHarmony(content)

  const qualityScore = Math.round(
    architectMeasure.design * 0.2 +
    constellationMeasure.quality * 0.15 +
    stellarMeasure.brightness * 0.15 +
    nebulaMeasure.richness * 0.15 +
    gravityMeasure.stability * 0.15 +
    harmonyMeasure.coherence * 0.2,
  )

  return {
    file: filePath,
    cosmicArchitecture: architectMeasure.design,
    constellationQuality: constellationMeasure.quality,
    stellarBrightness: stellarMeasure.brightness,
    nebulaRichness: nebulaMeasure.richness,
    gravityStability: gravityMeasure.stability,
    cosmicHarmony: harmonyMeasure.coherence,
    architect: architectMeasure,
    constellation: constellationMeasure,
    stellar: stellarMeasure,
    nebula: nebulaMeasure,
    gravity: gravityMeasure,
    harmony: harmonyMeasure,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeGalaxyCluster(systems, dirPath) evaluates directory */
export function analyzeGalaxyCluster(systems: StarSystem[], dirPath: string): GalaxyCluster {
  if (systems.length === 0) {
    return {
      directory: dirPath, systems: [],
      avgArchitecture: 0, avgBrightness: 0, avgHarmony: 0,
      cosmicMasterpieceCount: 0, blackHoleCount: 0, brilliantGalaxyCount: 0, stellarSystemCount: 0,
      clusterType: 'void', condition: 'void',
    }
  }

  const avgArchitecture = Math.round(systems.reduce((s, sys) => s + sys.cosmicArchitecture, 0) / systems.length)
  const avgBrightness = Math.round(systems.reduce((s, sys) => s + sys.stellarBrightness, 0) / systems.length)
  const avgHarmony = Math.round(systems.reduce((s, sys) => s + sys.cosmicHarmony, 0) / systems.length)
  const cosmicMasterpieceCount = systems.filter((sys) => sys.condition === 'cosmic-masterpiece').length
  const blackHoleCount = systems.filter((sys) => sys.condition === 'black-hole').length
  const brilliantGalaxyCount = systems.filter((sys) => sys.condition === 'brilliant-galaxy').length
  const stellarSystemCount = systems.filter((sys) => sys.condition === 'stellar-system').length
  const avgQs = systems.reduce((s, sys) => s + sys.qualityScore, 0) / systems.length

  return {
    directory: dirPath, systems,
    avgArchitecture, avgBrightness, avgHarmony,
    cosmicMasterpieceCount, blackHoleCount, brilliantGalaxyCount, stellarSystemCount,
    clusterType: classifyClusterType(systems),
    condition: classifyClusterCondition(avgQs),
  }
}

/** @example generateRecommendations(systems, clusters, universe, stats) generates advice */
export function generateRecommendations(
  systems: StarSystem[],
  clusters: GalaxyCluster[],
  universe: Universe,
  stats: StarryVaultStats,
): string[] {
  const recs: string[] = []

  if (stats.avgCosmicArchitecture < 50) {
    recs.push('Elevate cosmic architecture with interfaces, generics, and well-designed abstractions')
  }
  if (stats.avgConstellationQuality < 50) {
    recs.push('Improve constellation quality with organized imports, exports, and clear patterns')
  }
  if (stats.avgStellarBrightness < 50) {
    recs.push('Boost stellar brightness with strict equality, optional chaining, and error handling')
  }
  if (stats.avgNebulaRichness < 50) {
    recs.push('Deepen nebula richness with generics, type aliases, and creative type compositions')
  }
  if (stats.avgGravityStability < 50) {
    recs.push('Stabilize gravity with readonly fields, strict equality, and secure dependency patterns')
  }
  if (stats.avgCosmicHarmony < 50) {
    recs.push('Enhance cosmic harmony with consistent imports/exports, documentation, and async patterns')
  }
  if (stats.blackHoleCount > 0) {
    recs.push(`${String(stats.blackHoleCount)} file(s) are black holes — consider significant refactoring`)
  }
  if (universe.overallCosmic < 40) {
    recs.push('Overall cosmic quality is low — focus on architecture and harmony fundamentals')
  }
  if (clusters.length > 0 && clusters.every((cl) => cl.clusterType === 'void' || cl.clusterType === 'rogue-planet')) {
    recs.push('All clusters are void or rogue — consider a major quality improvement effort')
  }

  const blackHoles = systems.filter((sys) => sys.condition === 'black-hole')
  if (blackHoles.length > 0 && blackHoles.length <= 3) {
    const names = blackHoles.map((sys) => sys.file).join(', ')
    recs.push(`Rescue these black holes: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your starry vault shines with cosmic brilliance! Every star system is magnificent')
  }

  return Array.from(new Set(recs))
}

/** @example buildStarryVaultResult(files, contents, options) orchestrates analysis */
export function buildStarryVaultResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): StarryVaultResult {
  const systems = files.map((file, i) => analyzeStarSystem(contents[i] ?? '', file))

  const cMap = new Map<string, StarSystem[]>()
  for (const sys of systems) {
    const dir = sys.file.includes('/') ? sys.file.split('/').slice(0, -1).join('/') : '.'
    const existing = cMap.get(dir)
    if (existing) {
      existing.push(sys)
    } else {
      cMap.set(dir, [sys])
    }
  }

  const clusters = Array.from(cMap.entries()).map(([dir, dirSystems]) =>
    analyzeGalaxyCluster(dirSystems, dir),
  )

  const totalFiles = systems.length
  const avgCosmicArchitecture = totalFiles > 0 ? Math.round(systems.reduce((s, sys) => s + sys.cosmicArchitecture, 0) / totalFiles) : 0
  const avgConstellationQuality = totalFiles > 0 ? Math.round(systems.reduce((s, sys) => s + sys.constellationQuality, 0) / totalFiles) : 0
  const avgStellarBrightness = totalFiles > 0 ? Math.round(systems.reduce((s, sys) => s + sys.stellarBrightness, 0) / totalFiles) : 0
  const avgNebulaRichness = totalFiles > 0 ? Math.round(systems.reduce((s, sys) => s + sys.nebulaRichness, 0) / totalFiles) : 0
  const avgGravityStability = totalFiles > 0 ? Math.round(systems.reduce((s, sys) => s + sys.gravityStability, 0) / totalFiles) : 0
  const avgCosmicHarmony = totalFiles > 0 ? Math.round(systems.reduce((s, sys) => s + sys.cosmicHarmony, 0) / totalFiles) : 0

  const overallCosmic = totalFiles > 0
    ? Math.round((avgCosmicArchitecture + avgStellarBrightness + avgCosmicHarmony) / 3)
    : 0

  const universe: Universe = {
    avgArchitecture: avgCosmicArchitecture,
    avgBrightness: avgStellarBrightness,
    avgHarmony: avgCosmicHarmony,
    isCosmic: avgCosmicArchitecture >= 60,
    overallCosmic,
  }

  const bestSystem = totalFiles > 0
    ? systems.reduce((best, sys) => (sys.qualityScore > best.qualityScore ? sys : best), systems[0] as typeof systems[number]).file
    : ''
  const bestArchitected = totalFiles > 0
    ? systems.reduce((best, sys) => (sys.cosmicArchitecture > best.cosmicArchitecture ? sys : best), systems[0] as typeof systems[number]).file
    : ''
  const bestOrganized = totalFiles > 0
    ? systems.reduce((best, sys) => (sys.constellationQuality > best.constellationQuality ? sys : best), systems[0] as typeof systems[number]).file
    : ''
  const brightest = totalFiles > 0
    ? systems.reduce((best, sys) => (sys.stellarBrightness > best.stellarBrightness ? sys : best), systems[0] as typeof systems[number]).file
    : ''
  const richest = totalFiles > 0
    ? systems.reduce((best, sys) => (sys.nebulaRichness > best.nebulaRichness ? sys : best), systems[0] as typeof systems[number]).file
    : ''
  const mostStable = totalFiles > 0
    ? systems.reduce((best, sys) => (sys.gravityStability > best.gravityStability ? sys : best), systems[0] as typeof systems[number]).file
    : ''

  const stats: StarryVaultStats = {
    totalFiles,
    totalClusters: clusters.length,
    avgCosmicArchitecture, avgConstellationQuality, avgStellarBrightness,
    avgNebulaRichness, avgGravityStability, avgCosmicHarmony,
    cosmicMasterpieceCount: systems.filter((sys) => sys.condition === 'cosmic-masterpiece').length,
    brilliantGalaxyCount: systems.filter((sys) => sys.condition === 'brilliant-galaxy').length,
    stellarSystemCount: systems.filter((sys) => sys.condition === 'stellar-system').length,
    dimNebulaCount: systems.filter((sys) => sys.condition === 'dim-nebula').length,
    darkVoidCount: systems.filter((sys) => sys.condition === 'dark-void').length,
    blackHoleCount: systems.filter((sys) => sys.condition === 'black-hole').length,
    hasHighDesignCount: systems.filter((sys) => sys.architect.hasHighDesign).length,
    hasHighQualityCount: systems.filter((sys) => sys.constellation.hasHighQuality).length,
    hasHighBrightnessCount: systems.filter((sys) => sys.stellar.hasHighBrightness).length,
    hasHighRichnessCount: systems.filter((sys) => sys.nebula.hasHighRichness).length,
    hasHighStabilityCount: systems.filter((sys) => sys.gravity.hasHighStability).length,
    hasHighCoherenceCount: systems.filter((sys) => sys.harmony.hasHighCoherence).length,
    overallCosmic,
    astronomerGrade: classifyAstronomerGrade(overallCosmic),
    bestSystem, bestArchitected, bestOrganized, brightest, richest, mostStable,
    celebration: '430 commands - a starry vault of code analysis excellence',
  }

  const recommendations = generateRecommendations(systems, clusters, universe, stats)

  return { systems, clusters, universe, stats, recommendations }
}
