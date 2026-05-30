// ─── Types ─────────────────────────────────────────────────────────────────

export interface StructuralMeasure {
  integrity: number
  grade: 'aerospace-grade' | 'medical-grade' | 'industrial-grade' | 'commercial-grade' | 'scrap-grade' | 'fail-grade'
  hasHighIntegrity: boolean
  hasSolidArchitecture: boolean
  hasProperLayers: boolean
  hasNoWeakPoints: boolean
  hasLoadBearing: boolean
  hasNoFragile: boolean
  hasReinforced: boolean
  hasNoCracks: boolean
  hasDistributed: boolean
  hasNoSinglePoint: boolean
  weakPointCount: number
  crackCount: number
}

export interface StrengthMeasure {
  ratio: number
  grade2: 'exceptional-ratio' | 'high-efficiency' | 'proper-balance' | 'adequate' | 'heavy-for-purpose' | 'bloated'
  hasHighRatio: boolean
  hasEfficient: boolean
  hasLightweight: boolean
  hasNoOverweight: boolean
  hasOptimized: boolean
  hasNoWaste: boolean
  hasLean: boolean
  hasNoBloat: boolean
  hasPurposeful: boolean
  hasNoPadding: boolean
  overweightCount: number
  bloatCount: number
}

export interface FlexuralMeasure {
  strength: number
  flexibility: 'supertensile' | 'highly-flexible' | 'properly-elastic' | 'moderate-bend' | 'stiff' | 'brittle'
  hasHighStrength: boolean
  hasAdaptable: boolean
  hasFlexible: boolean
  hasNoRigidity: boolean
  hasExtensible: boolean
  hasNoBrittleness: boolean
  hasModular: boolean
  hasNoMonolith: boolean
  hasResilient: boolean
  hasNoStiffness: boolean
  rigidityCount: number
  brittlenessCount: number
}

export interface CorrosionMeasure {
  resistance: number
  protection: 'passive-film' | 'highly-resistant' | 'proper-coating' | 'moderate-resistance' | 'corroding' | 'rusting'
  hasHighResistance: boolean
  hasErrorHandling: boolean
  hasDefensive: boolean
  hasNoVulnerability: boolean
  hasInputValidation: boolean
  hasNoBare: boolean
  hasProtected: boolean
  hasNoExposed: boolean
  hasSanitized: boolean
  hasNoInjection: boolean
  vulnerabilityCount: number
  exposedCount: number
}

export interface BiocompatibleMeasure {
  integration: number
  compatibility: 'universal-donor' | 'highly-compatible' | 'proper-interface' | 'partial-fit' | 'rejection-risk' | 'foreign-body'
  hasHighIntegration: boolean
  hasCleanAPI: boolean
  hasProperInterface: boolean
  hasNoCoupling: boolean
  hasStandardCompliant: boolean
  hasNoProprietary: boolean
  hasCompatible: boolean
  hasNoConflict: boolean
  hasWellTyped: boolean
  hasNoMismatch: boolean
  couplingCount: number
  conflictCount: number
}

export interface FatigueMeasure {
  endurance: number
  limit: 'infinite-life' | 'high-cycle' | 'proper-endurance' | 'limited-life' | 'low-cycle' | 'premature-failure'
  hasHighEndurance: boolean
  hasTested: boolean
  hasNoUncovered: boolean
  hasProven: boolean
  hasNoFragile: boolean
  hasStable: boolean
  hasNoRegression: boolean
  hasReliable: boolean
  hasNoDecay: boolean
  hasEnduring: boolean
  uncoveredCount: number
  regressionCount: number
}

export type VertebraCondition = 'titanium-spine' | 'strong-backbone' | 'solid-structure' | 'weakening' | 'degrading' | 'collapsed'

export interface SpineVertebra {
  file: string
  structuralIntegrity: number
  strengthToWeight: number
  flexuralStrength: number
  corrosionResistance: number
  biocompatibility: number
  fatigueEndurance: number
  structural: StructuralMeasure
  strength: StrengthMeasure
  flexural: FlexuralMeasure
  corrosion: CorrosionMeasure
  biocompatible: BiocompatibleMeasure
  fatigue: FatigueMeasure
  condition: VertebraCondition
  qualityScore: number
}

export type ColumnType = 'perfect-spine' | 'healthy-backbone' | 'proper-alignment' | 'scoliotic' | 'degenerating' | 'shattered'
export type ColumnCondition = 'structural-marvel' | 'strong-support' | 'adequate-backbone' | 'weakening-structure' | 'failing-support' | 'collapsed'

export interface SpinalColumn {
  directory: string
  vertebrae: SpineVertebra[]
  avgIntegrity: number
  avgFlexural: number
  avgEndurance: number
  titaniumCount: number
  collapsedCount: number
  strongCount: number
  solidCount: number
  columnType: ColumnType
  condition: ColumnCondition
}

export interface Skeleton {
  avgIntegrity: number
  avgFlexural: number
  avgEndurance: number
  isTitanium: boolean
  overallStrength: number
}

export type MetallurgistGrade = 'materials-scientist' | 'master-metallurgist' | 'expert-engineer' | 'structural-engineer' | 'apprentice' | 'quack'

export interface TitaniumSpineStats {
  totalFiles: number
  totalColumns: number
  avgStructuralIntegrity: number
  avgStrengthToWeight: number
  avgFlexuralStrength: number
  avgCorrosionResistance: number
  avgBiocompatibility: number
  avgFatigueEndurance: number
  titaniumSpineCount: number
  strongBackboneCount: number
  solidStructureCount: number
  weakeningCount: number
  degradingCount: number
  collapsedCount: number
  hasHighIntegrityCount: number
  hasHighRatioCount: number
  hasHighStrengthCount: number
  hasHighResistanceCount: number
  hasHighIntegrationCount: number
  hasHighEnduranceCount: number
  overallStrength: number
  metallurgistGrade: MetallurgistGrade
  bestVertebra: string
  strongest: string
  mostEfficient: string
  mostAdaptable: string
  mostResilient: string
  bestIntegrated: string
}

export interface TitaniumSpineResult {
  vertebrae: SpineVertebra[]
  columns: SpinalColumn[]
  skeleton: Skeleton
  stats: TitaniumSpineStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureStructural(content) evaluates code architecture */
export function measureStructural(content: string): StructuralMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const weakPointMatches = content.match(/\bvar\s+/g)
  const weakPointCount = weakPointMatches ? weakPointMatches.length : 0
  const crackMatches = content.match(/\bany\b/g)
  const crackCount = crackMatches ? crackMatches.length : 0

  const hasSolidArchitecture = hasExport && hasImport
  const hasProperLayers = hasClass && hasInterface
  const hasLoadBearing = hasNamedExport && hasGenerics
  const hasReinforced = hasReadonly && hasPrivate
  const hasDistributed = hasTypeAlias && hasNamedExport

  let integrity = 0
  if (hasExport) integrity += 10
  if (hasImport) integrity += 8
  if (hasClass) integrity += 10
  if (hasInterface) integrity += 10
  if (hasTypeAlias) integrity += 8
  if (hasGenerics) integrity += 10
  if (hasReadonly) integrity += 8
  if (hasPrivate) integrity += 8
  if (hasNamedExport) integrity += 8
  if (hasSolidArchitecture) integrity += 5
  if (hasProperLayers) integrity += 5
  if (hasLoadBearing) integrity += 5
  if (hasReinforced) integrity += 5

  integrity = Math.min(100, Math.round(integrity))

  let grade: StructuralMeasure['grade'] = 'fail-grade'
  if (integrity >= 85) grade = 'aerospace-grade'
  else if (integrity >= 70) grade = 'medical-grade'
  else if (integrity >= 55) grade = 'industrial-grade'
  else if (integrity >= 40) grade = 'commercial-grade'
  else if (integrity >= 25) grade = 'scrap-grade'

  return {
    integrity,
    grade,
    hasHighIntegrity: integrity >= 70,
    hasSolidArchitecture,
    hasProperLayers,
    hasNoWeakPoints: weakPointCount === 0,
    hasLoadBearing,
    hasNoFragile: crackCount === 0,
    hasReinforced,
    hasNoCracks: crackCount === 0 && weakPointCount === 0,
    hasDistributed,
    hasNoSinglePoint: weakPointCount === 0,
    weakPointCount,
    crackCount,
  }
}

/** @example measureStrength(content) evaluates code efficiency */
export function measureStrength(content: string): StrengthMeasure {
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)

  const overweightMatches = content.match(/\bvar\s+/g)
  const overweightCount = overweightMatches ? overweightMatches.length : 0
  const bloatMatches = content.match(/\bconsole\.\w+\s*\(/g)
  const bloatCount = bloatMatches ? bloatMatches.length : 0

  const hasEfficient = hasConst && hasStrictEquality
  const hasLightweight = hasOptionalChaining && hasNullishCoalescing
  const hasOptimized = hasReturnType && hasTypeAnnotation
  const hasLean = hasReadonly && hasConst
  const hasPurposeful = hasGenerics && hasEnum

  let ratio = 0
  if (hasConst) ratio += 10
  if (hasReturnType) ratio += 10
  if (hasTypeAnnotation) ratio += 8
  if (hasStrictEquality) ratio += 10
  if (hasOptionalChaining) ratio += 8
  if (hasNullishCoalescing) ratio += 7
  if (hasReadonly) ratio += 8
  if (hasGenerics) ratio += 8
  if (hasInterface) ratio += 8
  if (hasEnum) ratio += 7
  if (hasEfficient) ratio += 5
  if (hasLightweight) ratio += 5
  if (hasOptimized) ratio += 5
  if (hasLean) ratio += 5
  if (hasPurposeful) ratio += 5

  ratio = Math.min(100, Math.round(ratio))

  let grade2: StrengthMeasure['grade2'] = 'bloated'
  if (ratio >= 85) grade2 = 'exceptional-ratio'
  else if (ratio >= 70) grade2 = 'high-efficiency'
  else if (ratio >= 55) grade2 = 'proper-balance'
  else if (ratio >= 40) grade2 = 'adequate'
  else if (ratio >= 25) grade2 = 'heavy-for-purpose'

  return {
    ratio,
    grade2,
    hasHighRatio: ratio >= 70,
    hasEfficient,
    hasLightweight,
    hasNoOverweight: overweightCount === 0,
    hasOptimized,
    hasNoWaste: overweightCount === 0 && bloatCount === 0,
    hasLean,
    hasNoBloat: bloatCount === 0,
    hasPurposeful,
    hasNoPadding: bloatCount === 0,
    overweightCount,
    bloatCount,
  }
}

/** @example measureFlexural(content) evaluates code adaptability */
export function measureFlexural(content: string): FlexuralMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasOptionalParam = /\w+\?\s*[):\]]/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const rigidityMatches = content.match(/\bvar\s+/g)
  const rigidityCount = rigidityMatches ? rigidityMatches.length : 0
  const brittlenessMatches = content.match(/\bany\b/g)
  const brittlenessCount = brittlenessMatches ? brittlenessMatches.length : 0

  const hasAdaptable = hasInterface && hasGenerics
  const hasFlexible = hasOptionalChaining && hasNullishCoalescing
  const hasExtensible = hasTypeAlias && hasEnum
  const hasModular = hasExport && hasNamedExport
  const hasResilient = hasDefaultParam || hasOptionalParam

  let strength = 0
  if (hasExport) strength += 10
  if (hasInterface) strength += 10
  if (hasGenerics) strength += 10
  if (hasTypeAlias) strength += 8
  if (hasOptionalChaining) strength += 8
  if (hasNullishCoalescing) strength += 7
  if (hasOptionalParam) strength += 8
  if (hasDefaultParam) strength += 7
  if (hasEnum) strength += 7
  if (hasNamedExport) strength += 8
  if (hasAdaptable) strength += 5
  if (hasFlexible) strength += 5
  if (hasExtensible) strength += 5
  if (hasModular) strength += 5
  if (hasResilient) strength += 5

  strength = Math.min(100, Math.round(strength))

  let flexibility: FlexuralMeasure['flexibility'] = 'brittle'
  if (strength >= 85) flexibility = 'supertensile'
  else if (strength >= 70) flexibility = 'highly-flexible'
  else if (strength >= 55) flexibility = 'properly-elastic'
  else if (strength >= 40) flexibility = 'moderate-bend'
  else if (strength >= 25) flexibility = 'stiff'

  return {
    strength,
    flexibility,
    hasHighStrength: strength >= 70,
    hasAdaptable,
    hasFlexible,
    hasNoRigidity: rigidityCount === 0,
    hasExtensible,
    hasNoBrittleness: brittlenessCount === 0,
    hasModular,
    hasNoMonolith: rigidityCount === 0 && brittlenessCount === 0,
    hasResilient,
    hasNoStiffness: rigidityCount === 0,
    rigidityCount,
    brittlenessCount,
  }
}

/** @example measureCorrosion(content) evaluates code error resilience */
export function measureCorrosion(content: string): CorrosionMeasure {
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  const hasThrow = /\bthrow\s+/.test(content)
  const hasErrorType = /Error\b/.test(content)
  const hasNullCheck = /\?\.\w/.test(content) || /!==?\s*null/.test(content)
  const hasUndefinedCheck = /!==?\s*undefined/.test(content)
  const hasTypeofCheck = /typeof\s+\w+\s*[!=]==?\s*['"]/.test(content)
  const hasInstanceof = /\binstanceof\b/.test(content)
  const hasFinally = /finally\s*\{/.test(content)
  const hasPromiseCatch = /\.catch\s*\(/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)

  const vulnerabilityMatches = content.match(/\beval\s*\(/g)
  const vulnerabilityCount = vulnerabilityMatches ? vulnerabilityMatches.length : 0
  const exposedMatches = content.match(/\bany\b/g)
  const exposedCount = exposedMatches ? exposedMatches.length : 0

  const hasDefensive = hasNullCheck || hasUndefinedCheck
  const hasInputValidation = hasTypeofCheck || hasInstanceof
  const hasProtected = hasTryCatch && hasThrow
  const hasSanitized = hasOptionalChaining || hasNullCheck

  let resistance = 0
  if (hasTryCatch) resistance += 12
  if (hasThrow) resistance += 10
  if (hasErrorType) resistance += 8
  if (hasNullCheck) resistance += 8
  if (hasUndefinedCheck) resistance += 7
  if (hasTypeofCheck) resistance += 8
  if (hasInstanceof) resistance += 7
  if (hasFinally) resistance += 8
  if (hasPromiseCatch) resistance += 7
  if (hasOptionalChaining) resistance += 5
  if (hasDefensive) resistance += 5
  if (hasInputValidation) resistance += 5
  if (hasProtected) resistance += 5
  if (hasSanitized) resistance += 5

  resistance = Math.min(100, Math.round(resistance))

  let protection: CorrosionMeasure['protection'] = 'rusting'
  if (resistance >= 85) protection = 'passive-film'
  else if (resistance >= 70) protection = 'highly-resistant'
  else if (resistance >= 55) protection = 'proper-coating'
  else if (resistance >= 40) protection = 'moderate-resistance'
  else if (resistance >= 25) protection = 'corroding'

  return {
    resistance,
    protection,
    hasHighResistance: resistance >= 70,
    hasErrorHandling: hasTryCatch || hasThrow,
    hasDefensive,
    hasNoVulnerability: vulnerabilityCount === 0,
    hasInputValidation,
    hasNoBare: exposedCount === 0,
    hasProtected,
    hasNoExposed: exposedCount === 0 && vulnerabilityCount === 0,
    hasSanitized,
    hasNoInjection: vulnerabilityCount === 0,
    vulnerabilityCount,
    exposedCount,
  }
}

/** @example measureBiocompatible(content) evaluates code integration */
export function measureBiocompatible(content: string): BiocompatibleMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasOptionalParam = /\w+\?\s*[):\]]/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)

  const couplingMatches = content.match(/\bvar\s+/g)
  const couplingCount = couplingMatches ? couplingMatches.length : 0
  const conflictMatches = content.match(/\bany\b/g)
  const conflictCount = conflictMatches ? conflictMatches.length : 0

  const hasCleanAPI = hasExport && hasNamedExport
  const hasProperInterface = hasInterface && hasTypeAnnotation
  const hasStandardCompliant = hasReturnType && hasDocComments
  const hasCompatible = hasOptionalParam || hasDefaultParam
  const hasWellTyped = hasGenerics && hasInterface

  let integration = 0
  if (hasExport) integration += 10
  if (hasImport) integration += 8
  if (hasInterface) integration += 10
  if (hasTypeAnnotation) integration += 8
  if (hasReturnType) integration += 10
  if (hasNamedExport) integration += 8
  if (hasGenerics) integration += 8
  if (hasDocComments) integration += 8
  if (hasOptionalParam) integration += 7
  if (hasDefaultParam) integration += 7
  if (hasCleanAPI) integration += 5
  if (hasProperInterface) integration += 5
  if (hasStandardCompliant) integration += 5
  if (hasCompatible) integration += 5
  if (hasWellTyped) integration += 5

  integration = Math.min(100, Math.round(integration))

  let compatibility: BiocompatibleMeasure['compatibility'] = 'foreign-body'
  if (integration >= 85) compatibility = 'universal-donor'
  else if (integration >= 70) compatibility = 'highly-compatible'
  else if (integration >= 55) compatibility = 'proper-interface'
  else if (integration >= 40) compatibility = 'partial-fit'
  else if (integration >= 25) compatibility = 'rejection-risk'

  return {
    integration,
    compatibility,
    hasHighIntegration: integration >= 70,
    hasCleanAPI,
    hasProperInterface,
    hasNoCoupling: couplingCount === 0,
    hasStandardCompliant,
    hasNoProprietary: couplingCount === 0,
    hasCompatible,
    hasNoConflict: conflictCount === 0,
    hasWellTyped,
    hasNoMismatch: couplingCount === 0 && conflictCount === 0,
    couplingCount,
    conflictCount,
  }
}

/** @example measureFatigue(content) evaluates code reliability */
export function measureFatigue(content: string): FatigueMeasure {
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  const hasThrow = /\bthrow\s+/.test(content)
  const hasErrorClass = /extends\s+(?:Error|TypeError|RangeError)/.test(content)
  const hasFinally = /finally\s*\{/.test(content)
  const hasPromiseCatch = /\.catch\s*\(/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)

  const uncoveredMatches = content.match(/\bany\b/g)
  const uncoveredCount = uncoveredMatches ? uncoveredMatches.length : 0
  const regressionMatches = content.match(/\bTODO\b|\bFIXME\b/g)
  const regressionCount = regressionMatches ? regressionMatches.length : 0

  const hasTested = hasTryCatch && hasThrow
  const hasProven = hasErrorClass || hasFinally
  const hasStable = hasConst && hasReadonly
  const hasReliable = hasReturnType && hasTypeAnnotation
  const hasEnduring = hasInterface && hasConst

  let endurance = 0
  if (hasTryCatch) endurance += 12
  if (hasThrow) endurance += 10
  if (hasErrorClass) endurance += 10
  if (hasFinally) endurance += 8
  if (hasPromiseCatch) endurance += 8
  if (hasConst) endurance += 8
  if (hasReadonly) endurance += 8
  if (hasReturnType) endurance += 7
  if (hasTypeAnnotation) endurance += 7
  if (hasInterface) endurance += 7
  if (hasTested) endurance += 5
  if (hasProven) endurance += 5
  if (hasStable) endurance += 5
  if (hasReliable) endurance += 5

  endurance = Math.min(100, Math.round(endurance))

  let limit: FatigueMeasure['limit'] = 'premature-failure'
  if (endurance >= 85) limit = 'infinite-life'
  else if (endurance >= 70) limit = 'high-cycle'
  else if (endurance >= 55) limit = 'proper-endurance'
  else if (endurance >= 40) limit = 'limited-life'
  else if (endurance >= 25) limit = 'low-cycle'

  return {
    endurance,
    limit,
    hasHighEndurance: endurance >= 70,
    hasTested,
    hasNoUncovered: uncoveredCount === 0,
    hasProven,
    hasNoFragile: uncoveredCount === 0,
    hasStable,
    hasNoRegression: regressionCount === 0,
    hasReliable,
    hasNoDecay: regressionCount === 0,
    hasEnduring,
    uncoveredCount,
    regressionCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'titanium-spine' */
export function classifyCondition(score: number): VertebraCondition {
  if (score >= 85) return 'titanium-spine'
  if (score >= 70) return 'strong-backbone'
  if (score >= 55) return 'solid-structure'
  if (score >= 40) return 'weakening'
  if (score >= 25) return 'degrading'
  return 'collapsed'
}

/** @example classifyColumnType(vertebrae) returns column classification */
export function classifyColumnType(vertebrae: SpineVertebra[]): ColumnType {
  if (vertebrae.length === 0) return 'shattered'
  const avgQs = vertebrae.reduce((s, v) => s + v.qualityScore, 0) / vertebrae.length
  const titaniumCount = vertebrae.filter((v) => v.condition === 'titanium-spine').length
  const ratio = titaniumCount / vertebrae.length
  if (avgQs >= 75 && ratio >= 0.5) return 'perfect-spine'
  if (avgQs >= 60) return 'healthy-backbone'
  if (avgQs >= 45) return 'proper-alignment'
  if (avgQs >= 30) return 'scoliotic'
  if (avgQs >= 15) return 'degenerating'
  return 'shattered'
}

/** @example classifyColumnCondition(avgQs) returns column condition */
export function classifyColumnCondition(avgQs: number): ColumnCondition {
  if (avgQs >= 75) return 'structural-marvel'
  if (avgQs >= 60) return 'strong-support'
  if (avgQs >= 45) return 'adequate-backbone'
  if (avgQs >= 30) return 'weakening-structure'
  if (avgQs >= 15) return 'failing-support'
  return 'collapsed'
}

/** @example classifyMetallurgistGrade(80) returns 'materials-scientist' */
export function classifyMetallurgistGrade(avgStrength: number): MetallurgistGrade {
  if (avgStrength >= 80) return 'materials-scientist'
  if (avgStrength >= 65) return 'master-metallurgist'
  if (avgStrength >= 50) return 'expert-engineer'
  if (avgStrength >= 35) return 'structural-engineer'
  if (avgStrength >= 20) return 'apprentice'
  return 'quack'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeSpineVertebra(content, filePath) evaluates single file */
export function analyzeSpineVertebra(content: string, filePath: string): SpineVertebra {
  const structural = measureStructural(content)
  const strength = measureStrength(content)
  const flexural = measureFlexural(content)
  const corrosion = measureCorrosion(content)
  const biocompatible = measureBiocompatible(content)
  const fatigue = measureFatigue(content)

  const qualityScore = Math.round(
    structural.integrity * 0.2 +
    strength.ratio * 0.15 +
    flexural.strength * 0.15 +
    corrosion.resistance * 0.15 +
    biocompatible.integration * 0.15 +
    fatigue.endurance * 0.2,
  )

  return {
    file: filePath,
    structuralIntegrity: structural.integrity,
    strengthToWeight: strength.ratio,
    flexuralStrength: flexural.strength,
    corrosionResistance: corrosion.resistance,
    biocompatibility: biocompatible.integration,
    fatigueEndurance: fatigue.endurance,
    structural,
    strength,
    flexural,
    corrosion,
    biocompatible,
    fatigue,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeSpinalColumn(vertebrae, dirPath) evaluates directory */
export function analyzeSpinalColumn(vertebrae: SpineVertebra[], dirPath: string): SpinalColumn {
  if (vertebrae.length === 0) {
    return {
      directory: dirPath,
      vertebrae: [],
      avgIntegrity: 0,
      avgFlexural: 0,
      avgEndurance: 0,
      titaniumCount: 0,
      collapsedCount: 0,
      strongCount: 0,
      solidCount: 0,
      columnType: 'shattered',
      condition: 'collapsed',
    }
  }

  const avgIntegrity = Math.round(vertebrae.reduce((s, v) => s + v.structuralIntegrity, 0) / vertebrae.length)
  const avgFlexural = Math.round(vertebrae.reduce((s, v) => s + v.flexuralStrength, 0) / vertebrae.length)
  const avgEndurance = Math.round(vertebrae.reduce((s, v) => s + v.fatigueEndurance, 0) / vertebrae.length)

  const titaniumCount = vertebrae.filter((v) => v.condition === 'titanium-spine').length
  const collapsedCount = vertebrae.filter((v) => v.condition === 'collapsed').length
  const strongCount = vertebrae.filter((v) => v.condition === 'strong-backbone').length
  const solidCount = vertebrae.filter((v) => v.condition === 'solid-structure').length

  const avgQs = vertebrae.reduce((s, v) => s + v.qualityScore, 0) / vertebrae.length

  return {
    directory: dirPath,
    vertebrae,
    avgIntegrity,
    avgFlexural,
    avgEndurance,
    titaniumCount,
    collapsedCount,
    strongCount,
    solidCount,
    columnType: classifyColumnType(vertebrae),
    condition: classifyColumnCondition(avgQs),
  }
}

/** @example generateRecommendations(vertebrae, columns, skeleton, stats) generates advice */
export function generateRecommendations(
  vertebrae: SpineVertebra[],
  columns: SpinalColumn[],
  skeleton: Skeleton,
  stats: TitaniumSpineStats,
): string[] {
  const recs: string[] = []

  if (stats.avgStructuralIntegrity < 50) {
    recs.push('Improve structural integrity with exports, imports, classes, and interfaces')
  }
  if (stats.avgStrengthToWeight < 50) {
    recs.push('Optimize strength-to-weight ratio with const, strict equality, and lean patterns')
  }
  if (stats.avgFlexuralStrength < 50) {
    recs.push('Increase flexural strength with generics, optional parameters, and extensible types')
  }
  if (stats.avgCorrosionResistance < 50) {
    recs.push('Boost corrosion resistance with try/catch, null checks, and defensive programming')
  }
  if (stats.avgBiocompatibility < 50) {
    recs.push('Improve biocompatibility with clean APIs, proper interfaces, and standard patterns')
  }
  if (stats.avgFatigueEndurance < 50) {
    recs.push('Enhance fatigue endurance with error handling, readonly properties, and stable patterns')
  }
  if (stats.collapsedCount > 0) {
    recs.push(`${String(stats.collapsedCount)} file(s) have collapsed — consider significant refactoring`)
  }
  if (skeleton.overallStrength < 40) {
    recs.push('Overall skeleton strength is low — prioritize architecture and error handling')
  }
  if (columns.length > 0 && columns.every((c) => c.columnType === 'shattered' || c.columnType === 'degenerating')) {
    recs.push('All columns are degenerating — consider a major quality improvement effort')
  }

  const collapsed = vertebrae.filter((v) => v.condition === 'collapsed')
  if (collapsed.length > 0 && collapsed.length <= 3) {
    const names = collapsed.map((v) => v.file).join(', ')
    recs.push(`Rebuild these collapsed files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your code has a titanium spine! Structural integrity is exceptional')
  }

  return Array.from(new Set(recs))
}

/** @example buildTitaniumSpineResult(files, contents, options) orchestrates analysis */
export function buildTitaniumSpineResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): TitaniumSpineResult {
  const vertebrae = files.map((file, i) => analyzeSpineVertebra(contents[i] ?? '', file))

  const colMap = new Map<string, SpineVertebra[]>()
  for (const vertebra of vertebrae) {
    const dir = vertebra.file.includes('/') ? vertebra.file.split('/').slice(0, -1).join('/') : '.'
    const existing = colMap.get(dir)
    if (existing) {
      existing.push(vertebra)
    } else {
      colMap.set(dir, [vertebra])
    }
  }

  const columns = Array.from(colMap.entries()).map(([dir, dirVertebrae]) =>
    analyzeSpinalColumn(dirVertebrae, dir),
  )

  const totalFiles = vertebrae.length
  const avgStructuralIntegrity = totalFiles > 0 ? Math.round(vertebrae.reduce((s, v) => s + v.structuralIntegrity, 0) / totalFiles) : 0
  const avgStrengthToWeight = totalFiles > 0 ? Math.round(vertebrae.reduce((s, v) => s + v.strengthToWeight, 0) / totalFiles) : 0
  const avgFlexuralStrength = totalFiles > 0 ? Math.round(vertebrae.reduce((s, v) => s + v.flexuralStrength, 0) / totalFiles) : 0
  const avgCorrosionResistance = totalFiles > 0 ? Math.round(vertebrae.reduce((s, v) => s + v.corrosionResistance, 0) / totalFiles) : 0
  const avgBiocompatibility = totalFiles > 0 ? Math.round(vertebrae.reduce((s, v) => s + v.biocompatibility, 0) / totalFiles) : 0
  const avgFatigueEndurance = totalFiles > 0 ? Math.round(vertebrae.reduce((s, v) => s + v.fatigueEndurance, 0) / totalFiles) : 0

  const overallStrength = totalFiles > 0
    ? Math.round((avgStructuralIntegrity + avgFlexuralStrength + avgFatigueEndurance) / 3)
    : 0

  const skeleton: Skeleton = {
    avgIntegrity: avgStructuralIntegrity,
    avgFlexural: avgFlexuralStrength,
    avgEndurance: avgFatigueEndurance,
    isTitanium: avgStructuralIntegrity >= 60,
    overallStrength,
  }

  const titaniumSpineCount = vertebrae.filter((v) => v.condition === 'titanium-spine').length
  const strongBackboneCount = vertebrae.filter((v) => v.condition === 'strong-backbone').length
  const solidStructureCount = vertebrae.filter((v) => v.condition === 'solid-structure').length
  const weakeningCount = vertebrae.filter((v) => v.condition === 'weakening').length
  const degradingCount = vertebrae.filter((v) => v.condition === 'degrading').length
  const collapsedCount = vertebrae.filter((v) => v.condition === 'collapsed').length

  const bestVertebra = totalFiles > 0
    ? vertebrae.reduce((best, v) => (v.qualityScore > best.qualityScore ? v : best), vertebrae[0] as typeof vertebrae[number]).file
    : ''
  const strongest = totalFiles > 0
    ? vertebrae.reduce((best, v) => (v.structuralIntegrity > best.structuralIntegrity ? v : best), vertebrae[0] as typeof vertebrae[number]).file
    : ''
  const mostEfficient = totalFiles > 0
    ? vertebrae.reduce((best, v) => (v.strengthToWeight > best.strengthToWeight ? v : best), vertebrae[0] as typeof vertebrae[number]).file
    : ''
  const mostAdaptable = totalFiles > 0
    ? vertebrae.reduce((best, v) => (v.flexuralStrength > best.flexuralStrength ? v : best), vertebrae[0] as typeof vertebrae[number]).file
    : ''
  const mostResilient = totalFiles > 0
    ? vertebrae.reduce((best, v) => (v.corrosionResistance > best.corrosionResistance ? v : best), vertebrae[0] as typeof vertebrae[number]).file
    : ''
  const bestIntegrated = totalFiles > 0
    ? vertebrae.reduce((best, v) => (v.biocompatibility > best.biocompatibility ? v : best), vertebrae[0] as typeof vertebrae[number]).file
    : ''

  const stats: TitaniumSpineStats = {
    totalFiles,
    totalColumns: columns.length,
    avgStructuralIntegrity,
    avgStrengthToWeight,
    avgFlexuralStrength,
    avgCorrosionResistance,
    avgBiocompatibility,
    avgFatigueEndurance,
    titaniumSpineCount,
    strongBackboneCount,
    solidStructureCount,
    weakeningCount,
    degradingCount,
    collapsedCount,
    hasHighIntegrityCount: vertebrae.filter((v) => v.structural.hasHighIntegrity).length,
    hasHighRatioCount: vertebrae.filter((v) => v.strength.hasHighRatio).length,
    hasHighStrengthCount: vertebrae.filter((v) => v.flexural.hasHighStrength).length,
    hasHighResistanceCount: vertebrae.filter((v) => v.corrosion.hasHighResistance).length,
    hasHighIntegrationCount: vertebrae.filter((v) => v.biocompatible.hasHighIntegration).length,
    hasHighEnduranceCount: vertebrae.filter((v) => v.fatigue.hasHighEndurance).length,
    overallStrength,
    metallurgistGrade: classifyMetallurgistGrade(overallStrength),
    bestVertebra,
    strongest,
    mostEfficient,
    mostAdaptable,
    mostResilient,
    bestIntegrated,
  }

  const recommendations = generateRecommendations(vertebrae, columns, skeleton, stats)

  return { vertebrae, columns, skeleton, stats, recommendations }
}
