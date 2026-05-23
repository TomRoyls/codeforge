// ─── Types ─────────────────────────────────────────────────────────────────

export interface CrystallineMeasure {
  structure: number
  pattern: 'hexagonal-perfection' | 'dendritic-beauty' | 'proper-crystal' | 'rough-ice' | 'slush' | 'formless'
  hasHighStructure: boolean
  hasOrganized: boolean
  hasPatterned: boolean
  hasNoChaos: boolean
  hasCrystalline: boolean
  hasNoAmorphous: boolean
  hasSymmetric: boolean
  hasNoIrregular: boolean
  hasOrdered: boolean
  hasNoDisorder: boolean
  chaosCount: number
  amorphousCount: number
}

export interface FractalMeasure {
  elegance: number
  beauty: 'golden-ratio' | 'elegant-recursion' | 'proper-pattern' | 'basic-repeat' | 'clunky-loop' | 'spaghetti'
  hasHighElegance: boolean
  hasRecursive: boolean
  hasElegant: boolean
  hasNoClumsiness: boolean
  hasGraceful: boolean
  hasNoBrutality: boolean
  hasBeautiful: boolean
  hasNoUgliness: boolean
  hasHarmonious: boolean
  hasNoDissonance: boolean
  clumsinessCount: number
  brutalityCount: number
}

export interface DelicateMeasure {
  design: number
  fineness: 'lacework' | 'fine-filigree' | 'proper-detail' | 'adequate-craft' | 'rough-work' | 'sledgehammer'
  hasHighDesign: boolean
  hasDetailed: boolean
  hasRefined: boolean
  hasNoCrudeness: boolean
  hasFine: boolean
  hasNoCoarseness: boolean
  hasPrecise: boolean
  hasNoSloppiness: boolean
  hasNuanced: boolean
  hasNoBluntness: boolean
  crudenessCount: number
  coarsenessCount: number
}

export interface PreservedMeasure {
  stability: number
  preservation: 'permafrost' | 'deep-freeze' | 'proper-cold-storage' | 'thawing' | 'melting' | 'evaporated'
  hasHighStability: boolean
  hasStable: boolean
  hasFrozen: boolean
  hasNoVolatility: boolean
  hasImmutable: boolean
  hasNoMutation: boolean
  hasPersistent: boolean
  hasNoFragility: boolean
  hasEnduring: boolean
  hasNoErosion: boolean
  volatilityCount: number
  mutationCount: number
}

export interface ResilientMeasure {
  coldStart: number
  toughness: 'arctic-survivor' | 'winter-hardy' | 'proper-coating' | 'thin-skinned' | 'freezing' | 'shattered'
  hasHighColdStart: boolean
  hasRobust: boolean
  hasInitialization: boolean
  hasNoCrash: boolean
  hasDefensive: boolean
  hasNoBrittleness: boolean
  hasGraceful: boolean
  hasNoFailure: boolean
  hasReliable: boolean
  hasNoUnstable: boolean
  crashCount: number
  failureCount: number
}

export interface UniqueMeasure {
  originality: number
  character: 'unique-snowflake' | 'distinctive-pattern' | 'original-design' | 'somewhat-generic' | 'template-copy' | 'cookie-cutter'
  hasHighOriginality: boolean
  hasOriginal: boolean
  hasDistinctive: boolean
  hasNoPlagiarism: boolean
  hasCreative: boolean
  hasNoCopyPaste: boolean
  hasIdiomatic: boolean
  hasNoGeneric: boolean
  hasInventive: boolean
  hasNoDerivative: boolean
  plagiarismCount: number
  copyPasteCount: number
}

export type CrystalCondition = 'frost-masterpiece' | 'crystal-garden' | 'delicate-fern' | 'rough-crystal' | 'melting-ice' | 'puddle'

export interface FrostCrystal {
  file: string
  crystallinePattern: number
  fractalElegance: number
  delicateStructure: number
  icePreservation: number
  winterResilience: number
  snowflakeUniqueness: number
  crystalline: CrystallineMeasure
  fractal: FractalMeasure
  delicate: DelicateMeasure
  preserved: PreservedMeasure
  resilient: ResilientMeasure
  unique: UniqueMeasure
  condition: CrystalCondition
  qualityScore: number
}

export type GardenType = 'crystal-palace' | 'frost-garden' | 'ice-rink' | 'snowdrift' | 'slush-pile' | 'melted'
export type GardenCondition = 'winter-wonderland' | 'crystal-garden' | 'frosted-field' | 'thawing-ground' | 'slushy-mess' | 'mud'

export interface FrostGarden {
  directory: string
  crystals: FrostCrystal[]
  avgCrystalline: number
  avgPreservation: number
  avgResilience: number
  frostMasterpieceCount: number
  puddleCount: number
  crystalGardenCount: number
  delicateFernCount: number
  gardenType: GardenType
  condition: GardenCondition
}

export interface FrostTundra {
  avgCrystalline: number
  avgPreservation: number
  avgResilience: number
  isCrystalline: boolean
  overallCrystallinity: number
}

export type CrystallographerGrade = 'master-crystallographer' | 'expert-ice-artist' | 'skilled-frost-worker' | 'apprentice' | 'novice' | 'slush-maker'

export interface FrostFernStats {
  totalFiles: number
  totalGardens: number
  avgCrystallinePattern: number
  avgFractalElegance: number
  avgDelicateStructure: number
  avgIcePreservation: number
  avgWinterResilience: number
  avgSnowflakeUniqueness: number
  frostMasterpieceCount: number
  crystalGardenCount: number
  delicateFernCount: number
  roughCrystalCount: number
  meltingIceCount: number
  puddleCount: number
  hasHighStructureCount: number
  hasHighEleganceCount: number
  hasHighDesignCount: number
  hasHighStabilityCount: number
  hasHighColdStartCount: number
  hasHighOriginalityCount: number
  overallCrystallinity: number
  crystallographerGrade: CrystallographerGrade
  bestCrystal: string
  mostStructured: string
  mostElegant: string
  mostDelicate: string
  mostStable: string
  mostOriginal: string
}

export interface FrostFernResult {
  crystals: FrostCrystal[]
  gardens: FrostGarden[]
  tundra: FrostTundra
  stats: FrostFernStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureCrystalline(content) evaluates code structure */
export function measureCrystalline(content: string): CrystallineMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)

  const chaosMatches = content.match(/\bvar\s+/g)
  const chaosCount = chaosMatches ? chaosMatches.length : 0
  const amorphousMatches = content.match(/\bany\b/g)
  const amorphousCount = amorphousMatches ? amorphousMatches.length : 0

  const hasOrganized = hasConst && hasReturnType
  const hasPatterned = hasExport && hasNamedExport
  const hasCrystalline = hasInterface && hasClass
  const hasSymmetric = hasStrictEquality && hasOptionalChaining
  const hasOrdered = hasPrivate && hasReadonly

  let structure = 0
  if (hasExport) structure += 8
  if (hasConst) structure += 10
  if (hasReturnType) structure += 10
  if (hasInterface) structure += 8
  if (hasClass) structure += 8
  if (hasPrivate) structure += 8
  if (hasReadonly) structure += 8
  if (hasStrictEquality) structure += 10
  if (hasNamedExport) structure += 8
  if (hasOptionalChaining) structure += 8
  if (hasOrganized) structure += 5
  if (hasPatterned) structure += 5
  if (hasCrystalline) structure += 5
  if (hasSymmetric) structure += 5
  if (hasOrdered) structure += 5

  structure = Math.min(100, Math.round(structure))

  let pattern: CrystallineMeasure['pattern'] = 'formless'
  if (structure >= 85) pattern = 'hexagonal-perfection'
  else if (structure >= 70) pattern = 'dendritic-beauty'
  else if (structure >= 55) pattern = 'proper-crystal'
  else if (structure >= 40) pattern = 'rough-ice'
  else if (structure >= 25) pattern = 'slush'

  return {
    structure,
    pattern,
    hasHighStructure: structure >= 70,
    hasOrganized,
    hasPatterned,
    hasNoChaos: chaosCount === 0,
    hasCrystalline,
    hasNoAmorphous: amorphousCount === 0,
    hasSymmetric,
    hasNoIrregular: chaosCount === 0,
    hasOrdered,
    hasNoDisorder: chaosCount === 0 && amorphousCount === 0,
    chaosCount,
    amorphousCount,
  }
}

/** @example measureFractal(content) evaluates code recursive beauty */
export function measureFractal(content: string): FractalMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasAsync = /\basync\s+/.test(content)

  const clumsinessMatches = content.match(/\bvar\s+/g)
  const clumsinessCount = clumsinessMatches ? clumsinessMatches.length : 0
  const brutalityMatches = content.match(/\bany\b/g)
  const brutalityCount = brutalityMatches ? brutalityMatches.length : 0

  const hasRecursive = hasExport && hasReturnType
  const hasElegant = hasInterface && hasClass
  const hasGraceful = hasConst && hasTypeAnnotation
  const hasBeautiful = hasNamedExport && hasAsync
  const hasHarmonious = hasImport && hasDocComments

  let elegance = 0
  if (hasExport) elegance += 10
  if (hasImport) elegance += 10
  if (hasReturnType) elegance += 10
  if (hasInterface) elegance += 8
  if (hasClass) elegance += 8
  if (hasConst) elegance += 8
  if (hasDocComments) elegance += 10
  if (hasTypeAnnotation) elegance += 8
  if (hasNamedExport) elegance += 8
  if (hasAsync) elegance += 8
  if (hasRecursive) elegance += 5
  if (hasElegant) elegance += 5
  if (hasGraceful) elegance += 5
  if (hasBeautiful) elegance += 5
  if (hasHarmonious) elegance += 5

  elegance = Math.min(100, Math.round(elegance))

  let beauty: FractalMeasure['beauty'] = 'spaghetti'
  if (elegance >= 85) beauty = 'golden-ratio'
  else if (elegance >= 70) beauty = 'elegant-recursion'
  else if (elegance >= 55) beauty = 'proper-pattern'
  else if (elegance >= 40) beauty = 'basic-repeat'
  else if (elegance >= 25) beauty = 'clunky-loop'

  return {
    elegance,
    beauty,
    hasHighElegance: elegance >= 70,
    hasRecursive,
    hasElegant,
    hasNoClumsiness: clumsinessCount === 0,
    hasGraceful,
    hasNoBrutality: brutalityCount === 0,
    hasBeautiful,
    hasNoUgliness: clumsinessCount === 0,
    hasHarmonious,
    hasNoDissonance: clumsinessCount === 0 && brutalityCount === 0,
    clumsinessCount,
    brutalityCount,
  }
}

/** @example measureDelicate(content) evaluates code fine-grained design */
export function measureDelicate(content: string): DelicateMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const crudenessMatches = content.match(/\bvar\s+/g)
  const crudenessCount = crudenessMatches ? crudenessMatches.length : 0
  const coarsenessMatches = content.match(/\bany\b/g)
  const coarsenessCount = coarsenessMatches ? coarsenessMatches.length : 0

  const hasDetailed = hasExport && hasReturnType
  const hasRefined = hasInterface && hasConst
  const hasFine = hasPrivate && hasReadonly
  const hasPrecise = hasGenerics && hasTypeAlias
  const hasNuanced = hasEnum && hasNamedExport

  let design = 0
  if (hasExport) design += 10
  if (hasInterface) design += 10
  if (hasReturnType) design += 10
  if (hasConst) design += 8
  if (hasTypeAlias) design += 8
  if (hasEnum) design += 8
  if (hasGenerics) design += 8
  if (hasPrivate) design += 8
  if (hasReadonly) design += 8
  if (hasNamedExport) design += 10
  if (hasDetailed) design += 5
  if (hasRefined) design += 5
  if (hasFine) design += 5
  if (hasPrecise) design += 5
  if (hasNuanced) design += 5

  design = Math.min(100, Math.round(design))

  let fineness: DelicateMeasure['fineness'] = 'sledgehammer'
  if (design >= 85) fineness = 'lacework'
  else if (design >= 70) fineness = 'fine-filigree'
  else if (design >= 55) fineness = 'proper-detail'
  else if (design >= 40) fineness = 'adequate-craft'
  else if (design >= 25) fineness = 'rough-work'

  return {
    design,
    fineness,
    hasHighDesign: design >= 70,
    hasDetailed,
    hasRefined,
    hasNoCrudeness: crudenessCount === 0,
    hasFine,
    hasNoCoarseness: coarsenessCount === 0,
    hasPrecise,
    hasNoSloppiness: crudenessCount === 0 && coarsenessCount === 0,
    hasNuanced,
    hasNoBluntness: crudenessCount === 0,
    crudenessCount,
    coarsenessCount,
  }
}

/** @example measurePreserved(content) evaluates code freezing stability */
export function measurePreserved(content: string): PreservedMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const volatilityMatches = content.match(/\bvar\s+/g)
  const volatilityCount = volatilityMatches ? volatilityMatches.length : 0
  const mutationMatches = content.match(/\bany\b/g)
  const mutationCount = mutationMatches ? mutationMatches.length : 0

  const hasStable = hasExport && hasConst
  const hasFrozen = hasReturnType && hasNamedExport
  const hasImmutable = hasDocComments && hasTypeAnnotation
  const hasPersistent = hasInterface && hasClass
  const hasEnduring = hasStrictEquality && hasReadonly

  let stability = 0
  if (hasExport) stability += 10
  if (hasConst) stability += 10
  if (hasReturnType) stability += 10
  if (hasNamedExport) stability += 8
  if (hasDocComments) stability += 8
  if (hasTypeAnnotation) stability += 8
  if (hasInterface) stability += 10
  if (hasClass) stability += 8
  if (hasStrictEquality) stability += 8
  if (hasReadonly) stability += 8
  if (hasStable) stability += 5
  if (hasFrozen) stability += 5
  if (hasImmutable) stability += 5
  if (hasPersistent) stability += 5
  if (hasEnduring) stability += 5

  stability = Math.min(100, Math.round(stability))

  let preservation: PreservedMeasure['preservation'] = 'evaporated'
  if (stability >= 85) preservation = 'permafrost'
  else if (stability >= 70) preservation = 'deep-freeze'
  else if (stability >= 55) preservation = 'proper-cold-storage'
  else if (stability >= 40) preservation = 'thawing'
  else if (stability >= 25) preservation = 'melting'

  return {
    stability,
    preservation,
    hasHighStability: stability >= 70,
    hasStable,
    hasFrozen,
    hasNoVolatility: volatilityCount === 0,
    hasImmutable,
    hasNoMutation: mutationCount === 0,
    hasPersistent,
    hasNoFragility: volatilityCount === 0 && mutationCount === 0,
    hasEnduring,
    hasNoErosion: volatilityCount === 0,
    volatilityCount,
    mutationCount,
  }
}

/** @example measureResilient(content) evaluates code cold-start reliability */
export function measureResilient(content: string): ResilientMeasure {
  const hasExport = /export\s/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const crashMatches = content.match(/\bvar\s+/g)
  const crashCount = crashMatches ? crashMatches.length : 0
  const failureMatches = content.match(/\bany\b/g)
  const failureCount = failureMatches ? failureMatches.length : 0

  const hasRobust = hasTryCatch && hasAsync
  const hasInitialization = hasReturnType && hasOptionalChaining
  const hasDefensive = hasNullishCoalescing && hasConst
  const hasGraceful = hasInterface && hasDefaultParam
  const hasReliable = hasNamedExport && hasExport

  let coldStart = 0
  if (hasExport) coldStart += 8
  if (hasTryCatch) coldStart += 10
  if (hasReturnType) coldStart += 10
  if (hasOptionalChaining) coldStart += 10
  if (hasNullishCoalescing) coldStart += 8
  if (hasInterface) coldStart += 8
  if (hasAsync) coldStart += 8
  if (hasConst) coldStart += 8
  if (hasDefaultParam) coldStart += 8
  if (hasNamedExport) coldStart += 8
  if (hasRobust) coldStart += 5
  if (hasInitialization) coldStart += 5
  if (hasDefensive) coldStart += 5
  if (hasGraceful) coldStart += 5
  if (hasReliable) coldStart += 5

  coldStart = Math.min(100, Math.round(coldStart))

  let toughness: ResilientMeasure['toughness'] = 'shattered'
  if (coldStart >= 85) toughness = 'arctic-survivor'
  else if (coldStart >= 70) toughness = 'winter-hardy'
  else if (coldStart >= 55) toughness = 'proper-coating'
  else if (coldStart >= 40) toughness = 'thin-skinned'
  else if (coldStart >= 25) toughness = 'freezing'

  return {
    coldStart,
    toughness,
    hasHighColdStart: coldStart >= 70,
    hasRobust,
    hasInitialization,
    hasNoCrash: crashCount === 0,
    hasDefensive,
    hasNoBrittleness: failureCount === 0,
    hasGraceful,
    hasNoFailure: crashCount === 0 && failureCount === 0,
    hasReliable,
    hasNoUnstable: crashCount === 0,
    crashCount,
    failureCount,
  }
}

/** @example measureUnique(content) evaluates code originality */
export function measureUnique(content: string): UniqueMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)

  const plagiarismMatches = content.match(/\bvar\s+/g)
  const plagiarismCount = plagiarismMatches ? plagiarismMatches.length : 0
  const copyPasteMatches = content.match(/\bany\b/g)
  const copyPasteCount = copyPasteMatches ? copyPasteMatches.length : 0

  const hasOriginal = hasExport && hasConst
  const hasDistinctive = hasReturnType && hasDocComments
  const hasCreative = hasInterface && hasClass
  const hasIdiomatic = hasPrivate && hasReadonly
  const hasInventive = hasNamedExport && hasTypeAnnotation

  let originality = 0
  if (hasExport) originality += 10
  if (hasInterface) originality += 8
  if (hasClass) originality += 8
  if (hasPrivate) originality += 10
  if (hasReadonly) originality += 8
  if (hasReturnType) originality += 10
  if (hasConst) originality += 8
  if (hasDocComments) originality += 10
  if (hasNamedExport) originality += 8
  if (hasTypeAnnotation) originality += 8
  if (hasOriginal) originality += 5
  if (hasDistinctive) originality += 5
  if (hasCreative) originality += 5
  if (hasIdiomatic) originality += 5
  if (hasInventive) originality += 5

  originality = Math.min(100, Math.round(originality))

  let character: UniqueMeasure['character'] = 'cookie-cutter'
  if (originality >= 85) character = 'unique-snowflake'
  else if (originality >= 70) character = 'distinctive-pattern'
  else if (originality >= 55) character = 'original-design'
  else if (originality >= 40) character = 'somewhat-generic'
  else if (originality >= 25) character = 'template-copy'

  return {
    originality,
    character,
    hasHighOriginality: originality >= 70,
    hasOriginal,
    hasDistinctive,
    hasNoPlagiarism: plagiarismCount === 0,
    hasCreative,
    hasNoCopyPaste: copyPasteCount === 0,
    hasIdiomatic,
    hasNoGeneric: plagiarismCount === 0,
    hasInventive,
    hasNoDerivative: plagiarismCount === 0 && copyPasteCount === 0,
    plagiarismCount,
    copyPasteCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'frost-masterpiece' */
export function classifyCondition(score: number): CrystalCondition {
  if (score >= 85) return 'frost-masterpiece'
  if (score >= 70) return 'crystal-garden'
  if (score >= 55) return 'delicate-fern'
  if (score >= 40) return 'rough-crystal'
  if (score >= 25) return 'melting-ice'
  return 'puddle'
}

/** @example classifyGardenType(crystals) returns garden classification */
export function classifyGardenType(crystals: FrostCrystal[]): GardenType {
  if (crystals.length === 0) return 'melted'
  const avgQs = crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length
  const masterpieceCount = crystals.filter((c) => c.condition === 'frost-masterpiece').length
  const ratio = masterpieceCount / crystals.length
  if (avgQs >= 75 && ratio >= 0.5) return 'crystal-palace'
  if (avgQs >= 60) return 'frost-garden'
  if (avgQs >= 45) return 'ice-rink'
  if (avgQs >= 30) return 'snowdrift'
  if (avgQs >= 15) return 'slush-pile'
  return 'melted'
}

/** @example classifyGardenCondition(avgQs) returns garden condition */
export function classifyGardenCondition(avgQs: number): GardenCondition {
  if (avgQs >= 75) return 'winter-wonderland'
  if (avgQs >= 60) return 'crystal-garden'
  if (avgQs >= 45) return 'frosted-field'
  if (avgQs >= 30) return 'thawing-ground'
  if (avgQs >= 15) return 'slushy-mess'
  return 'mud'
}

/** @example classifyCrystallographerGrade(80) returns 'master-crystallographer' */
export function classifyCrystallographerGrade(avgCrystallinity: number): CrystallographerGrade {
  if (avgCrystallinity >= 80) return 'master-crystallographer'
  if (avgCrystallinity >= 65) return 'expert-ice-artist'
  if (avgCrystallinity >= 50) return 'skilled-frost-worker'
  if (avgCrystallinity >= 35) return 'apprentice'
  if (avgCrystallinity >= 20) return 'novice'
  return 'slush-maker'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeFrostCrystal(content, filePath) evaluates single file */
export function analyzeFrostCrystal(content: string, filePath: string): FrostCrystal {
  const crystalline = measureCrystalline(content)
  const fractal = measureFractal(content)
  const delicate = measureDelicate(content)
  const preserved = measurePreserved(content)
  const resilient = measureResilient(content)
  const unique = measureUnique(content)

  const qualityScore = Math.round(
    crystalline.structure * 0.2 +
    fractal.elegance * 0.15 +
    delicate.design * 0.15 +
    preserved.stability * 0.15 +
    resilient.coldStart * 0.15 +
    unique.originality * 0.2,
  )

  return {
    file: filePath,
    crystallinePattern: crystalline.structure,
    fractalElegance: fractal.elegance,
    delicateStructure: delicate.design,
    icePreservation: preserved.stability,
    winterResilience: resilient.coldStart,
    snowflakeUniqueness: unique.originality,
    crystalline,
    fractal,
    delicate,
    preserved,
    resilient,
    unique,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeFrostGarden(crystals, dirPath) evaluates directory */
export function analyzeFrostGarden(crystals: FrostCrystal[], dirPath: string): FrostGarden {
  if (crystals.length === 0) {
    return {
      directory: dirPath,
      crystals: [],
      avgCrystalline: 0,
      avgPreservation: 0,
      avgResilience: 0,
      frostMasterpieceCount: 0,
      puddleCount: 0,
      crystalGardenCount: 0,
      delicateFernCount: 0,
      gardenType: 'melted',
      condition: 'mud',
    }
  }

  const avgCrystalline = Math.round(crystals.reduce((s, c) => s + c.crystallinePattern, 0) / crystals.length)
  const avgPreservation = Math.round(crystals.reduce((s, c) => s + c.icePreservation, 0) / crystals.length)
  const avgResilience = Math.round(crystals.reduce((s, c) => s + c.winterResilience, 0) / crystals.length)

  const frostMasterpieceCount = crystals.filter((c) => c.condition === 'frost-masterpiece').length
  const puddleCount = crystals.filter((c) => c.condition === 'puddle').length
  const crystalGardenCount = crystals.filter((c) => c.condition === 'crystal-garden').length
  const delicateFernCount = crystals.filter((c) => c.condition === 'delicate-fern').length

  const avgQs = crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length

  return {
    directory: dirPath,
    crystals,
    avgCrystalline,
    avgPreservation,
    avgResilience,
    frostMasterpieceCount,
    puddleCount,
    crystalGardenCount,
    delicateFernCount,
    gardenType: classifyGardenType(crystals),
    condition: classifyGardenCondition(avgQs),
  }
}

/** @example generateRecommendations(crystals, gardens, tundra, stats) generates advice */
export function generateRecommendations(
  crystals: FrostCrystal[],
  gardens: FrostGarden[],
  tundra: FrostTundra,
  stats: FrostFernStats,
): string[] {
  const recs: string[] = []

  if (stats.avgCrystallinePattern < 50) {
    recs.push('Improve crystalline patterns with const declarations, return types, and strict equality')
  }
  if (stats.avgFractalElegance < 50) {
    recs.push('Enhance fractal elegance with clear exports, documentation, and typed interfaces')
  }
  if (stats.avgDelicateStructure < 50) {
    recs.push('Refine delicate structure with private fields, generics, and essential type patterns')
  }
  if (stats.avgIcePreservation < 50) {
    recs.push('Improve ice preservation with durable exports, readonly, and persistent patterns')
  }
  if (stats.avgWinterResilience < 50) {
    recs.push('Strengthen winter resilience with try/catch, optional chaining, and defensive coding')
  }
  if (stats.avgSnowflakeUniqueness < 50) {
    recs.push('Boost snowflake uniqueness with interfaces, classes, documentation, and idiomatic patterns')
  }
  if (stats.puddleCount > 0) {
    recs.push(`${String(stats.puddleCount)} file(s) are puddles — consider significant refactoring`)
  }
  if (tundra.overallCrystallinity < 40) {
    recs.push('Overall crystallinity is low — prioritize structure and stability')
  }
  if (gardens.length > 0 && gardens.every((g) => g.gardenType === 'melted' || g.gardenType === 'slush-pile')) {
    recs.push('All gardens are degraded — consider a major quality improvement effort')
  }

  const puddleFiles = crystals.filter((c) => c.condition === 'puddle')
  if (puddleFiles.length > 0 && puddleFiles.length <= 3) {
    const names = puddleFiles.map((c) => c.file).join(', ')
    recs.push(`Freeze these puddle files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your code is a frost masterpiece! Crystalline beauty in every line')
  }

  return Array.from(new Set(recs))
}

/** @example buildFrostFernResult(files, contents, options) orchestrates analysis */
export function buildFrostFernResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): FrostFernResult {
  const crystals = files.map((file, i) => analyzeFrostCrystal(contents[i] ?? '', file))

  const gMap = new Map<string, FrostCrystal[]>()
  for (const crystal of crystals) {
    const dir = crystal.file.includes('/') ? crystal.file.split('/').slice(0, -1).join('/') : '.'
    const existing = gMap.get(dir)
    if (existing) {
      existing.push(crystal)
    } else {
      gMap.set(dir, [crystal])
    }
  }

  const gardens = Array.from(gMap.entries()).map(([dir, dirCrystals]) =>
    analyzeFrostGarden(dirCrystals, dir),
  )

  const totalFiles = crystals.length
  const avgCrystallinePattern = totalFiles > 0 ? Math.round(crystals.reduce((s, c) => s + c.crystallinePattern, 0) / totalFiles) : 0
  const avgFractalElegance = totalFiles > 0 ? Math.round(crystals.reduce((s, c) => s + c.fractalElegance, 0) / totalFiles) : 0
  const avgDelicateStructure = totalFiles > 0 ? Math.round(crystals.reduce((s, c) => s + c.delicateStructure, 0) / totalFiles) : 0
  const avgIcePreservation = totalFiles > 0 ? Math.round(crystals.reduce((s, c) => s + c.icePreservation, 0) / totalFiles) : 0
  const avgWinterResilience = totalFiles > 0 ? Math.round(crystals.reduce((s, c) => s + c.winterResilience, 0) / totalFiles) : 0
  const avgSnowflakeUniqueness = totalFiles > 0 ? Math.round(crystals.reduce((s, c) => s + c.snowflakeUniqueness, 0) / totalFiles) : 0

  const avgPreservation = avgIcePreservation
  const avgResilience = avgWinterResilience

  const overallCrystallinity = totalFiles > 0
    ? Math.round((avgCrystallinePattern + avgPreservation + avgResilience) / 3)
    : 0

  const tundra: FrostTundra = {
    avgCrystalline: avgCrystallinePattern,
    avgPreservation,
    avgResilience,
    isCrystalline: avgCrystallinePattern >= 60,
    overallCrystallinity,
  }

  const bestCrystal = totalFiles > 0
    ? crystals.reduce((best, c) => (c.qualityScore > best.qualityScore ? c : best), crystals[0]).file
    : ''
  const mostStructured = totalFiles > 0
    ? crystals.reduce((best, c) => (c.crystallinePattern > best.crystallinePattern ? c : best), crystals[0]).file
    : ''
  const mostElegant = totalFiles > 0
    ? crystals.reduce((best, c) => (c.fractalElegance > best.fractalElegance ? c : best), crystals[0]).file
    : ''
  const mostDelicate = totalFiles > 0
    ? crystals.reduce((best, c) => (c.delicateStructure > best.delicateStructure ? c : best), crystals[0]).file
    : ''
  const mostStable = totalFiles > 0
    ? crystals.reduce((best, c) => (c.icePreservation > best.icePreservation ? c : best), crystals[0]).file
    : ''
  const mostOriginal = totalFiles > 0
    ? crystals.reduce((best, c) => (c.snowflakeUniqueness > best.snowflakeUniqueness ? c : best), crystals[0]).file
    : ''

  const stats: FrostFernStats = {
    totalFiles,
    totalGardens: gardens.length,
    avgCrystallinePattern,
    avgFractalElegance,
    avgDelicateStructure,
    avgIcePreservation,
    avgWinterResilience,
    avgSnowflakeUniqueness,
    frostMasterpieceCount: crystals.filter((c) => c.condition === 'frost-masterpiece').length,
    crystalGardenCount: crystals.filter((c) => c.condition === 'crystal-garden').length,
    delicateFernCount: crystals.filter((c) => c.condition === 'delicate-fern').length,
    roughCrystalCount: crystals.filter((c) => c.condition === 'rough-crystal').length,
    meltingIceCount: crystals.filter((c) => c.condition === 'melting-ice').length,
    puddleCount: crystals.filter((c) => c.condition === 'puddle').length,
    hasHighStructureCount: crystals.filter((c) => c.crystalline.hasHighStructure).length,
    hasHighEleganceCount: crystals.filter((c) => c.fractal.hasHighElegance).length,
    hasHighDesignCount: crystals.filter((c) => c.delicate.hasHighDesign).length,
    hasHighStabilityCount: crystals.filter((c) => c.preserved.hasHighStability).length,
    hasHighColdStartCount: crystals.filter((c) => c.resilient.hasHighColdStart).length,
    hasHighOriginalityCount: crystals.filter((c) => c.unique.hasHighOriginality).length,
    overallCrystallinity,
    crystallographerGrade: classifyCrystallographerGrade(overallCrystallinity),
    bestCrystal,
    mostStructured,
    mostElegant,
    mostDelicate,
    mostStable,
    mostOriginal,
  }

  const recommendations = generateRecommendations(crystals, gardens, tundra, stats)

  return { crystals, gardens, tundra, stats, recommendations }
}
