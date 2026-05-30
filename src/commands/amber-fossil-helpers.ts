// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface PreservedMeasure {
  stability: number
  state: 'perfectly-preserved' | 'well-preserved' | 'good-condition' | 'weathered' | 'degraded' | 'decomposed'
  hasHighStability: boolean
  hasIntact: boolean
  hasNoDecay: boolean
  hasOriginal: boolean
  hasPristine: boolean
  hasNoCorruption: boolean
  hasWellMaintained: boolean
  hasNoErosion: boolean
  hasStable: boolean
  hasNoDrift: boolean
  decayCount: number
  corruptionCount: number
}

export interface EssenceMeasure {
  quality: number
  purity: 'pure-essence' | 'rich-inclusion' | 'clear-specimen' | 'cloudy-inclusion' | 'murky' | 'opaque-mass'
  hasHighQuality: boolean
  hasPure: boolean
  hasValuable: boolean
  hasNoContamination: boolean
  hasCore: boolean
  hasNoPollution: boolean
  hasEssential: boolean
  hasNoWaste: boolean
  hasConcentrated: boolean
  hasNoDilution: boolean
  contaminationCount: number
  pollutionCount: number
}

export interface AgingMeasure {
  grace: number
  quality: 'vintage-masterpiece' | 'well-aged' | 'properly-matured' | 'showing-age' | 'deteriorating' | 'ancient-ruin'
  hasHighGrace: boolean
  hasTimeless: boolean
  hasAgedWell: boolean
  hasNoBitrot: boolean
  hasClassic: boolean
  hasNoObsolescence: boolean
  hasEnduring: boolean
  hasNoDegradation: boolean
  hasProven: boolean
  hasNoDecay: boolean
  bitrotCount: number
  obsolescenceCount: number
}

export interface FossilMeasure {
  immutability: number
  state: 'petrified-perfection' | 'solid-fossil' | 'well-mineralized' | 'partially-fossilized' | 'soft-sediment' | 'still-decaying'
  hasHighImmutability: boolean
  hasImmutable: boolean
  hasNoMutation: boolean
  hasStable: boolean
  hasConstant: boolean
  hasNoVolatility: boolean
  hasFixed: boolean
  hasNoChange: boolean
  hasPersistent: boolean
  hasNoInstability: boolean
  mutationCount: number
  volatilityCount: number
}

export interface CrystallineMeasure {
  quality: number
  form: 'perfect-crystal' | 'well-formed' | 'good-structure' | 'rough-crystal' | 'amorphous' | 'chaotic'
  hasHighQuality: boolean
  hasOrdered: boolean
  hasLattice: boolean
  hasNoAmorphous: boolean
  hasSymmetric: boolean
  hasNoDefects: boolean
  hasRegular: boolean
  hasNoIrregularity: boolean
  hasClean: boolean
  hasNoFractures: boolean
  defectCount: number
  fractureCount: number
}

export interface WisdomMeasure {
  maturity: number
  level: 'ancient-sage' | 'wise-elder' | 'experienced' | 'maturing' | 'young' | 'naive'
  hasHighMaturity: boolean
  hasProven: boolean
  hasTested: boolean
  hasNoNaivety: boolean
  hasRobust: boolean
  hasNoFragility: boolean
  hasBattle: boolean
  hasNoInnocence: boolean
  hasRefined: boolean
  hasNoRoughness: boolean
  naivetyCount: number
  fragilityCount: number
}

export interface AmberSpecimen {
  file: string
  preservation: number
  trappedEssence: number
  agingGrace: number
  fossilization: number
  crystallineQuality: number
  ancientWisdom: number
  preserved: PreservedMeasure
  essence: EssenceMeasure
  aging: AgingMeasure
  fossil: FossilMeasure
  crystalline: CrystallineMeasure
  wisdom: WisdomMeasure
  condition: 'museum-piece' | 'fine-specimen' | 'good-fossil' | 'weathered-amber' | 'degrading' | 'dust'
  qualityScore: number
}

export interface AmberCollection {
  directory: string
  specimens: AmberSpecimen[]
  avgPreservation: number
  avgCrystalline: number
  avgWisdom: number
  museumPieceCount: number
  dustCount: number
  fineSpecimenCount: number
  goodFossilCount: number
  collectionType: 'natural-history-museum' | 'private-collection' | 'jewelry-box' | 'curiosity-cabinet' | 'beach-combing' | 'empty-display'
  condition: 'world-class-collection' | 'valuable-hoard' | 'decent-exhibit' | 'mixed-bag' | 'dusty-shelf' | 'empty-case'
}

export interface AmberFossilResult {
  specimens: AmberSpecimen[]
  collections: AmberCollection[]
  museum: {
    avgPreservation: number
    avgCrystalline: number
    avgWisdom: number
    isPreserved: boolean
    overallPreservation: number
  }
  stats: {
    totalFiles: number
    totalCollections: number
    avgPreservation: number
    avgTrappedEssence: number
    avgAgingGrace: number
    avgFossilization: number
    avgCrystallineQuality: number
    avgAncientWisdom: number
    museumPieceCount: number
    fineSpecimenCount: number
    goodFossilCount: number
    weatheredAmberCount: number
    degradingCount: number
    dustCount: number
    hasHighStabilityCount: number
    hasHighQualityCount: number
    hasHighGraceCount: number
    hasHighImmutabilityCount: number
    hasHighStructureCount: number
    hasHighMaturityCount: number
    overallPreservation: number
    paleontologistGrade: 'master-paleontologist' | 'expert-collector' | 'skilled-finder' | 'amateur-collector' | 'beachcomber' | 'tourist'
    bestSpecimen: string
    bestPreserved: string
    bestEssence: string
    bestAged: string
    mostImmutable: string
    bestStructured: string
  }
  recommendations: string[]
}

// ─── Measure Preserved (code stability) ────────────────────────────────────

/** @example measurePreserved(content) returns PreservedMeasure */
export function measurePreserved(content: string): PreservedMeasure {
  let score = 0
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasConsts = /\bconst\b/.test(content)
  const hasFunctions = /\bfunction\b/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasReturns = /\breturn\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasDefaultParams = /\w+\s*=\s*[^=]/.test(content)

  if (hasInterfaces) score += 12
  if (hasTypes) score += 8
  if (hasClasses) score += 10
  if (hasExports) score += 10
  if (hasImports) score += 7
  if (hasConsts) score += 5
  if (hasFunctions) score += 8
  if (hasAsync) score += 8
  if (hasTryCatch) score += 10
  if (hasReturns) score += 5
  if (hasGenerics) score += 10
  if (hasDefaultParams) score += 7
  score = Math.min(100, score)

  const decayPatterns = [/\bTODO\b/, /\bFIXME\b/, /\bHACK\b/]
  const corruptionPatterns = [/\beval\b/, /\bFunction\s*\(/, /\bwith\s*\(/]
  const decayCount = decayPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const corruptionCount = corruptionPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let state: PreservedMeasure['state'] = 'decomposed'
  if (score >= 80) state = 'perfectly-preserved'
  else if (score >= 65) state = 'well-preserved'
  else if (score >= 50) state = 'good-condition'
  else if (score >= 35) state = 'weathered'
  else if (score >= 20) state = 'degraded'

  return {
    stability: score,
    state,
    hasHighStability: score >= 70,
    hasIntact: hasExports || hasClasses,
    hasNoDecay: decayCount === 0,
    hasOriginal: hasInterfaces || hasTypes,
    hasPristine: corruptionCount === 0,
    hasNoCorruption: corruptionCount === 0,
    hasWellMaintained: hasTryCatch && hasExports,
    hasNoErosion: !/\bvar\b/.test(content),
    hasStable: hasConsts || hasClasses,
    hasNoDrift: !/\bany\b/.test(content),
    decayCount,
    corruptionCount,
  }
}

// ─── Measure Essence (code core quality) ───────────────────────────────────

/** @example measureEssence(content) returns EssenceMeasure */
export function measureEssence(content: string): EssenceMeasure {
  let score = 0
  const hasJsDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasParamDocs = /@param\b/.test(content)
  const hasReturnDocs = /@returns?\b/.test(content)
  const hasTypedParams = /\(\s*\w+\s*:/.test(content)
  const hasTypedReturns = /\)\s*:\s*(?!void\s*\{)(?!{)\w+/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasEnums = /\benum\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasOptional = /\?\s*:/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasExamples = /@example\b/.test(content)

  if (hasJsDoc) score += 12
  if (hasParamDocs) score += 10
  if (hasReturnDocs) score += 10
  if (hasTypedParams) score += 10
  if (hasTypedReturns) score += 10
  if (hasInterfaces) score += 10
  if (hasTypes) score += 8
  if (hasEnums) score += 5
  if (hasReadonly) score += 7
  if (hasOptional) score += 5
  if (hasGenerics) score += 8
  if (hasExamples) score += 5
  score = Math.min(100, score)

  const contaminationPatterns = [/\bconsole\.log\b/, /\bdebugger\b/]
  const pollutionPatterns = [/\bany\b/, /\bas\s+any\b/]
  const contaminationCount = contaminationPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const pollutionCount = pollutionPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let purity: EssenceMeasure['purity'] = 'opaque-mass'
  if (score >= 80) purity = 'pure-essence'
  else if (score >= 65) purity = 'rich-inclusion'
  else if (score >= 50) purity = 'clear-specimen'
  else if (score >= 35) purity = 'cloudy-inclusion'
  else if (score >= 20) purity = 'murky'

  return {
    quality: score,
    purity,
    hasHighQuality: score >= 70,
    hasPure: hasInterfaces || hasTypes,
    hasValuable: hasJsDoc && hasParamDocs,
    hasNoContamination: contaminationCount === 0,
    hasCore: hasTypedParams || hasTypedReturns,
    hasNoPollution: pollutionCount === 0,
    hasEssential: hasExports(),
    hasNoWaste: contaminationCount === 0 && pollutionCount === 0,
    hasConcentrated: hasEnums || hasReadonly,
    hasNoDilution: !/\bvar\b/.test(content),
    contaminationCount,
    pollutionCount,
  }

  function hasExports(): boolean {
    return /\bexport\b/.test(content)
  }
}

// ─── Measure Aging (code longevity) ────────────────────────────────────────

/** @example measureAging(content) returns AgingMeasure */
export function measureAging(content: string): AgingMeasure {
  let score = 0
  const hasTests = /\bdescribe\b|\bit\s*\(|\btest\s*\(/.test(content)
  const hasAssertions = /\bexpect\b|\bassert\b/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content)
  const hasTypeGuards = /\binstanceof\b|\btypeof\b/.test(content)
  const hasNullChecks = /\?\?|\bnull\b|\bundefined\b/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasConsts = /\bconst\b/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasPrivate = /\bprivate\b/.test(content)
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)

  if (hasTests) score += 12
  if (hasAssertions) score += 10
  if (hasErrorHandling) score += 10
  if (hasTypeGuards) score += 8
  if (hasNullChecks) score += 8
  if (hasInterfaces) score += 8
  if (hasTypes) score += 7
  if (hasReadonly) score += 7
  if (hasConsts) score += 5
  if (hasAsync) score += 5
  if (hasPrivate) score += 10
  if (hasJSDoc) score += 10
  score = Math.min(100, score)

  const bitrotPatterns = [/\bvar\b/, /\barguments\b/]
  const obsolescencePatterns = [/\brequire\s*\(/, /\bmodule\.exports\b/]
  const bitrotCount = bitrotPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const obsolescenceCount = obsolescencePatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let quality: AgingMeasure['quality'] = 'ancient-ruin'
  if (score >= 80) quality = 'vintage-masterpiece'
  else if (score >= 65) quality = 'well-aged'
  else if (score >= 50) quality = 'properly-matured'
  else if (score >= 35) quality = 'showing-age'
  else if (score >= 20) quality = 'deteriorating'

  return {
    grace: score,
    quality,
    hasHighGrace: score >= 70,
    hasTimeless: hasInterfaces && hasTypes,
    hasAgedWell: hasErrorHandling || hasNullChecks,
    hasNoBitrot: bitrotCount === 0,
    hasClassic: hasConsts && !/\bvar\b/.test(content),
    hasNoObsolescence: obsolescenceCount === 0,
    hasEnduring: hasPrivate || hasReadonly,
    hasNoDegradation: bitrotCount === 0 && obsolescenceCount === 0,
    hasProven: hasTests || hasAssertions,
    hasNoDecay: !/\bTODO\b/.test(content),
    bitrotCount,
    obsolescenceCount,
  }
}

// ─── Measure Fossil (code immutability) ────────────────────────────────────

/** @example measureFossil(content) returns FossilMeasure */
export function measureFossil(content: string): FossilMeasure {
  let score = 0
  const hasConst = /\bconst\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasEnums = /\benum\b/.test(content)
  const hasLiteralTypes = /'[^']'\s*\|/.test(content) || /\btype\s+\w+\s*=\s*'/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasPrivate = /\bprivate\b/.test(content)
  const hasProtected = /\bprotected\b/.test(content)
  const hasSealed = /\bObject\.freeze\b|\bObject\.seal\b/.test(content)
  const hasAssertions = /\bas\s+const\b/.test(content)
  const hasFinal = /\bfinal\b/.test(content)
  const hasNoVar = !/\bvar\b/.test(content)
  const hasNoLet = !/\blet\b/.test(content)

  if (hasConst) score += 10
  if (hasReadonly) score += 12
  if (hasEnums) score += 10
  if (hasLiteralTypes) score += 10
  if (hasInterfaces) score += 8
  if (hasTypes) score += 8
  if (hasPrivate) score += 10
  if (hasProtected) score += 8
  if (hasSealed) score += 10
  if (hasAssertions) score += 8
  if (hasFinal) score += 6
  if (hasNoVar && hasNoLet) score += 0
  else if (hasNoVar) score += 5
  score = Math.min(100, score)

  const mutationPatterns = [/\blet\b/, /\bvar\b/]
  const volatilityPatterns = [/\bany\b/, /\bvoid\s*\(/]
  const mutationCount = mutationPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const volatilityCount = volatilityPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let state: FossilMeasure['state'] = 'still-decaying'
  if (score >= 80) state = 'petrified-perfection'
  else if (score >= 65) state = 'solid-fossil'
  else if (score >= 50) state = 'well-mineralized'
  else if (score >= 35) state = 'partially-fossilized'
  else if (score >= 20) state = 'soft-sediment'

  return {
    immutability: score,
    state,
    hasHighImmutability: score >= 70,
    hasImmutable: hasConst && hasReadonly,
    hasNoMutation: mutationCount === 0,
    hasStable: hasInterfaces || hasTypes,
    hasConstant: hasConst,
    hasNoVolatility: volatilityCount === 0,
    hasFixed: hasEnums || hasLiteralTypes,
    hasNoChange: mutationCount === 0 && volatilityCount === 0,
    hasPersistent: hasPrivate || hasProtected,
    hasNoInstability: !/\bvar\b/.test(content),
    mutationCount,
    volatilityCount,
  }
}

// ─── Measure Crystalline (code structure) ──────────────────────────────────

/** @example measureCrystalline(content) returns CrystallineMeasure */
export function measureCrystalline(content: string): CrystallineMeasure {
  let score = 0
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasOptional = /\?\s*:/.test(content)
  const hasSemicolons = /;\s*\n/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasStrictChecks = /!\==|===/.test(content)
  const hasNamespaces = /\bnamespace\b/.test(content)

  if (hasInterfaces) score += 12
  if (hasTypes) score += 10
  if (hasClasses) score += 8
  if (hasExports) score += 8
  if (hasImports) score += 7
  if (hasGenerics) score += 10
  if (hasOptional) score += 7
  if (hasSemicolons) score += 5
  if (hasAsync) score += 5
  if (hasTryCatch) score += 10
  if (hasStrictChecks) score += 10
  if (hasNamespaces) score += 8
  score = Math.min(100, score)

  const defectPatterns = [/\bas\s+any\b/, /\/\/\s*@ts-ignore/]
  const fracturePatterns = [/\bvar\b/, /\bany\b/]
  const defectCount = defectPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const fractureCount = fracturePatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let form: CrystallineMeasure['form'] = 'chaotic'
  if (score >= 80) form = 'perfect-crystal'
  else if (score >= 65) form = 'well-formed'
  else if (score >= 50) form = 'good-structure'
  else if (score >= 35) form = 'rough-crystal'
  else if (score >= 20) form = 'amorphous'

  return {
    quality: score,
    form,
    hasHighQuality: score >= 70,
    hasOrdered: hasInterfaces && hasExports,
    hasLattice: hasInterfaces || hasTypes,
    hasNoAmorphous: defectCount === 0,
    hasSymmetric: (hasInterfaces ? 1 : 0) + (hasTypes ? 1 : 0) + (hasClasses ? 1 : 0) >= 2,
    hasNoDefects: defectCount === 0,
    hasRegular: hasSemicolons || hasStrictChecks,
    hasNoIrregularity: fractureCount === 0,
    hasClean: !/\bany\b/.test(content),
    hasNoFractures: fractureCount === 0,
    defectCount,
    fractureCount,
  }
}

// ─── Measure Wisdom (code maturity) ────────────────────────────────────────

/** @example measureWisdom(content) returns WisdomMeasure */
export function measureWisdom(content: string): WisdomMeasure {
  let score = 0
  const hasTests = /\bdescribe\b|\bit\s*\(|\btest\s*\(/.test(content)
  const hasMocks = /\bmock\b|\bstub\b|\bspy\b/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content)
  const hasTypeGuards = /\binstanceof\b|\btypeof\b/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasNullSafety = /\?\?|\?\.\w/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPrivate = /\bprivate\b/.test(content)
  const hasStrictNull = /!\s*\.|\?\.\w/.test(content)

  if (hasTests) score += 12
  if (hasMocks) score += 5
  if (hasErrorHandling) score += 10
  if (hasTypeGuards) score += 8
  if (hasAsync) score += 8
  if (hasAwait) score += 5
  if (hasNullSafety) score += 10
  if (hasInterfaces) score += 8
  if (hasGenerics) score += 10
  if (hasJSDoc) score += 10
  if (hasPrivate) score += 8
  if (hasStrictNull) score += 6
  score = Math.min(100, score)

  const naivetyPatterns = [/\bvar\b/, /\bany\b/]
  const fragilityPatterns = [/\beval\b/, /!\s*\[/]
  const naivetyCount = naivetyPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const fragilityCount = fragilityPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let level: WisdomMeasure['level'] = 'naive'
  if (score >= 80) level = 'ancient-sage'
  else if (score >= 65) level = 'wise-elder'
  else if (score >= 50) level = 'experienced'
  else if (score >= 35) level = 'maturing'
  else if (score >= 20) level = 'young'

  return {
    maturity: score,
    level,
    hasHighMaturity: score >= 70,
    hasProven: hasTests || hasErrorHandling,
    hasTested: hasTests,
    hasNoNaivety: naivetyCount === 0,
    hasRobust: hasErrorHandling && hasTypeGuards,
    hasNoFragility: fragilityCount === 0,
    hasBattle: hasTests && hasErrorHandling,
    hasNoInnocence: naivetyCount === 0 && fragilityCount === 0,
    hasRefined: hasInterfaces || hasGenerics,
    hasNoRoughness: !/\bvar\b/.test(content),
    naivetyCount,
    fragilityCount,
  }
}

// ─── classifySpecimenCondition ──────────────────────────────────────────────

/** @example classifySpecimenCondition(score) returns condition string */
export function classifySpecimenCondition(score: number): AmberSpecimen['condition'] {
  if (score >= 90) return 'museum-piece'
  if (score >= 75) return 'fine-specimen'
  if (score >= 60) return 'good-fossil'
  if (score >= 45) return 'weathered-amber'
  if (score >= 30) return 'degrading'
  return 'dust'
}

// ─── classifyCollectionType ────────────────────────────────────────────────

/** @example classifyCollectionType(specimens) returns collection type string */
export function classifyCollectionType(specimens: AmberSpecimen[]): AmberCollection['collectionType'] {
  if (specimens.length === 0) return 'empty-display'
  const avg = specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length
  const museumCount = specimens.filter((sp) => sp.condition === 'museum-piece').length
  const ratio = museumCount / specimens.length
  if (avg >= 80 && ratio >= 0.5) return 'natural-history-museum'
  if (avg >= 70) return 'private-collection'
  if (avg >= 55) return 'jewelry-box'
  if (avg >= 40) return 'curiosity-cabinet'
  if (avg >= 25) return 'beach-combing'
  return 'empty-display'
}

// ─── classifyCollectionCondition ───────────────────────────────────────────

/** @example classifyCollectionCondition(avg) returns condition string */
export function classifyCollectionCondition(avg: number): AmberCollection['condition'] {
  if (avg >= 80) return 'world-class-collection'
  if (avg >= 65) return 'valuable-hoard'
  if (avg >= 50) return 'decent-exhibit'
  if (avg >= 35) return 'mixed-bag'
  if (avg >= 20) return 'dusty-shelf'
  return 'empty-case'
}

// ─── classifyPaleontologistGrade ───────────────────────────────────────────

/** @example classifyPaleontologistGrade(avg) returns grade string */
export function classifyPaleontologistGrade(avg: number): AmberFossilResult['stats']['paleontologistGrade'] {
  if (avg >= 80) return 'master-paleontologist'
  if (avg >= 65) return 'expert-collector'
  if (avg >= 50) return 'skilled-finder'
  if (avg >= 35) return 'amateur-collector'
  if (avg >= 20) return 'beachcomber'
  return 'tourist'
}

// ─── analyzeAmberSpecimen ──────────────────────────────────────────────────

/** @example analyzeAmberSpecimen(content, filePath) returns AmberSpecimen */
export function analyzeAmberSpecimen(content: string, filePath: string): AmberSpecimen {
  const preserved = measurePreserved(content)
  const essence = measureEssence(content)
  const aging = measureAging(content)
  const fossil = measureFossil(content)
  const crystalline = measureCrystalline(content)
  const wisdom = measureWisdom(content)

  const preservation = preserved.stability
  const trappedEssence = essence.quality
  const agingGrace = aging.grace
  const fossilization = fossil.immutability
  const crystallineQuality = crystalline.quality
  const ancientWisdom = wisdom.maturity

  const qualityScore = Math.round(
    preservation * 0.2 +
    trappedEssence * 0.15 +
    agingGrace * 0.15 +
    fossilization * 0.15 +
    crystallineQuality * 0.15 +
    ancientWisdom * 0.2,
  )

  const condition = classifySpecimenCondition(qualityScore)

  return {
    file: filePath,
    preservation,
    trappedEssence,
    agingGrace,
    fossilization,
    crystallineQuality,
    ancientWisdom,
    preserved,
    essence,
    aging,
    fossil,
    crystalline,
    wisdom,
    condition,
    qualityScore,
  }
}

// ─── analyzeAmberCollection ────────────────────────────────────────────────

/** @example analyzeAmberCollection(specimens, dirPath) returns AmberCollection */
export function analyzeAmberCollection(specimens: AmberSpecimen[], dirPath: string): AmberCollection {
  if (specimens.length === 0) {
    return {
      directory: dirPath,
      specimens,
      avgPreservation: 0,
      avgCrystalline: 0,
      avgWisdom: 0,
      museumPieceCount: 0,
      dustCount: 0,
      fineSpecimenCount: 0,
      goodFossilCount: 0,
      collectionType: 'empty-display',
      condition: 'empty-case',
    }
  }

  const avgPreservation = Math.round(specimens.reduce((s, sp) => s + sp.preservation, 0) / specimens.length)
  const avgCrystalline = Math.round(specimens.reduce((s, sp) => s + sp.crystallineQuality, 0) / specimens.length)
  const avgWisdom = Math.round(specimens.reduce((s, sp) => s + sp.ancientWisdom, 0) / specimens.length)
  const museumPieceCount = specimens.filter((sp) => sp.condition === 'museum-piece').length
  const dustCount = specimens.filter((sp) => sp.condition === 'dust').length
  const fineSpecimenCount = specimens.filter((sp) => sp.condition === 'fine-specimen').length
  const goodFossilCount = specimens.filter((sp) => sp.condition === 'good-fossil').length
  const collectionType = classifyCollectionType(specimens)
  const overallAvg = Math.round(specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length)
  const condition = classifyCollectionCondition(overallAvg)

  return {
    directory: dirPath,
    specimens,
    avgPreservation,
    avgCrystalline,
    avgWisdom,
    museumPieceCount,
    dustCount,
    fineSpecimenCount,
    goodFossilCount,
    collectionType,
    condition,
  }
}

// ─── generateRecommendations ───────────────────────────────────────────────

/** @example generateRecommendations(specimens, collections, museum, stats) returns string[] */
export function generateRecommendations(
  _specimens: AmberSpecimen[],
  _collections: AmberCollection[],
  museum: AmberFossilResult['museum'],
  stats: AmberFossilResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgPreservation < 40) {
    recs.push('Improve code stability with type interfaces and error handling')
  }
  if (stats.avgTrappedEssence < 30) {
    recs.push('Add JSDoc documentation with @param and @returns for better core quality')
  }
  if (stats.avgAgingGrace < 40) {
    recs.push('Strengthen longevity with tests, null checks, and private access modifiers')
  }
  if (stats.avgFossilization < 30) {
    recs.push('Use const, readonly, and enums for better immutability')
  }
  if (stats.avgCrystallineQuality < 40) {
    recs.push('Improve structure with strict type checks and consistent patterns')
  }
  if (stats.avgAncientWisdom < 30) {
    recs.push('Add tests, error handling, and type guards for code maturity')
  }
  if (museum.overallPreservation < 50) {
    recs.push('Overall preservation is low — invest in code quality fundamentals')
  }
  if (stats.dustCount > stats.totalFiles * 0.3) {
    recs.push('Too many dust-grade files — refactor or remove dead code')
  }
  if (recs.length === 0) {
    recs.push('Code preservation quality is excellent — maintain current standards')
  }

  return recs
}

// ─── buildAmberFossilResult ────────────────────────────────────────────────

/** @example buildAmberFossilResult(files, contents) returns AmberFossilResult */
export function buildAmberFossilResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): AmberFossilResult {
  const specimens = files.map((file, i) => analyzeAmberSpecimen(contents[i] ?? '', file))

  const dirMap = new Map<string, AmberSpecimen[]>()
  specimens.forEach((spec) => {
    const parts = spec.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(spec)
    } else {
      dirMap.set(dir, [spec])
    }
  })

  const collections = Array.from(dirMap.entries()).map(
    ([dir, dirSpecs]) => analyzeAmberCollection(dirSpecs, dir),
  )

  const totalFiles = specimens.length
  const avgPreservation = totalFiles > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.preservation, 0) / totalFiles) : 0
  const avgTrappedEssence = totalFiles > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.trappedEssence, 0) / totalFiles) : 0
  const avgAgingGrace = totalFiles > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.agingGrace, 0) / totalFiles) : 0
  const avgFossilization = totalFiles > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.fossilization, 0) / totalFiles) : 0
  const avgCrystallineQuality = totalFiles > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.crystallineQuality, 0) / totalFiles) : 0
  const avgAncientWisdom = totalFiles > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.ancientWisdom, 0) / totalFiles) : 0

  const overallPreservation = totalFiles > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.qualityScore, 0) / totalFiles)
    : 0

  const avgCrystal = totalFiles > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.crystallineQuality, 0) / totalFiles)
    : 0
  const avgWis = totalFiles > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.ancientWisdom, 0) / totalFiles)
    : 0

  const museum: AmberFossilResult['museum'] = {
    avgPreservation,
    avgCrystalline: avgCrystal,
    avgWisdom: avgWis,
    isPreserved: avgPreservation >= 60,
    overallPreservation,
  }

  const findBest = (fn: (sp: AmberSpecimen) => number): string => {
    if (specimens.length === 0) return ''
    const best = specimens.reduce((a, b) => fn(a) >= fn(b) ? a : b)
    return best.file
  }

  const stats: AmberFossilResult['stats'] = {
    totalFiles,
    totalCollections: collections.length,
    avgPreservation,
    avgTrappedEssence,
    avgAgingGrace,
    avgFossilization,
    avgCrystallineQuality,
    avgAncientWisdom,
    museumPieceCount: specimens.filter((sp) => sp.condition === 'museum-piece').length,
    fineSpecimenCount: specimens.filter((sp) => sp.condition === 'fine-specimen').length,
    goodFossilCount: specimens.filter((sp) => sp.condition === 'good-fossil').length,
    weatheredAmberCount: specimens.filter((sp) => sp.condition === 'weathered-amber').length,
    degradingCount: specimens.filter((sp) => sp.condition === 'degrading').length,
    dustCount: specimens.filter((sp) => sp.condition === 'dust').length,
    hasHighStabilityCount: specimens.filter((sp) => sp.preserved.hasHighStability).length,
    hasHighQualityCount: specimens.filter((sp) => sp.essence.hasHighQuality).length,
    hasHighGraceCount: specimens.filter((sp) => sp.aging.hasHighGrace).length,
    hasHighImmutabilityCount: specimens.filter((sp) => sp.fossil.hasHighImmutability).length,
    hasHighStructureCount: specimens.filter((sp) => sp.crystalline.hasHighQuality).length,
    hasHighMaturityCount: specimens.filter((sp) => sp.wisdom.hasHighMaturity).length,
    overallPreservation,
    paleontologistGrade: classifyPaleontologistGrade(overallPreservation),
    bestSpecimen: findBest((sp) => sp.qualityScore),
    bestPreserved: findBest((sp) => sp.preservation),
    bestEssence: findBest((sp) => sp.trappedEssence),
    bestAged: findBest((sp) => sp.agingGrace),
    mostImmutable: findBest((sp) => sp.fossilization),
    bestStructured: findBest((sp) => sp.crystallineQuality),
  }

  const recommendations = generateRecommendations(specimens, collections, museum, stats)

  return { specimens, collections, museum, stats, recommendations }
}
