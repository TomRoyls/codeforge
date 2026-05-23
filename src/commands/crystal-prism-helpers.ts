// ─── Types ─────────────────────────────────────────────────────────────────

export interface RefractiveMeasure {
  transformation: number
  angle: 'perfect-refraction' | 'clean-bend' | 'proper-angle' | 'slight-distortion' | 'warped' | 'shattered'
  hasHighTransformation: boolean
  hasCleanTransform: boolean
  hasProperMapping: boolean
  hasNoDistortion: boolean
  hasFaithful: boolean
  hasNoWarping: boolean
  hasPrecise: boolean
  hasNoApproximation: boolean
  hasAccurate: boolean
  hasNoSkew: boolean
  distortionCount: number
  approximationCount: number
}

export interface SpectralMeasure {
  variety: number
  range: 'full-rainbow' | 'rich-spectrum' | 'proper-range' | 'limited-palette' | 'monochrome' | 'infrared-only'
  hasHighVariety: boolean
  hasDiverse: boolean
  hasMultiApproach: boolean
  hasNoMonotony: boolean
  hasRich: boolean
  hasNoRepetition: boolean
  hasVaried: boolean
  hasNoSingle: boolean
  hasColorful: boolean
  hasNoBland: boolean
  monotonyCount: number
  repetitionCount: number
}

export interface DecompositionMeasure {
  clarity: number
  quality: 'atomic-clarity' | 'clean-breakdown' | 'proper-separation' | 'partial-split' | 'muddled' | 'opaque-mass'
  hasHighClarity: boolean
  hasDecomposed: boolean
  hasSeparation: boolean
  hasNoMonolith: boolean
  hasGranular: boolean
  hasNoBlob: boolean
  hasAtomic: boolean
  hasNoGiant: boolean
  hasModular: boolean
  hasNoConflation: boolean
  monolithCount: number
  blobCount: number
}

export interface ColorfulMeasure {
  distinction: number
  vividness: 'vivid-spectrum' | 'clear-colors' | 'proper-distinction' | 'faded' | 'washed-out' | 'gray'
  hasHighDistinction: boolean
  hasDistinct: boolean
  hasClearBoundaries: boolean
  hasNoBlurring: boolean
  hasSeparated: boolean
  hasNoMixing: boolean
  hasContrast: boolean
  hasNoBleeding: boolean
  hasVivid: boolean
  hasNoMuddy: boolean
  blurringCount: number
  bleedingCount: number
}

export interface FacetedMeasure {
  quality: number
  cut: 'brilliant-cut' | 'fine-facets' | 'proper-angles' | 'rough-cut' | 'chipped' | 'uncut'
  hasHighQuality: boolean
  hasCleanAPI: boolean
  hasSharpEdges: boolean
  hasNoRoughness: boolean
  hasPolished: boolean
  hasNoJagged: boolean
  hasSmooth: boolean
  hasNoSharp: boolean
  hasRefined: boolean
  hasNoCrude: boolean
  roughnessCount: number
  crudeCount: number
}

export interface PureMeasure {
  transparency: number
  clarity: 'flawless-crystal' | 'clear-glass' | 'proper-transparency' | 'slight-haze' | 'cloudy' | 'opaque'
  hasHighTransparency: boolean
  hasTransparent: boolean
  hasNoHiding: boolean
  hasVisible: boolean
  hasNoObfuscation: boolean
  hasClear: boolean
  hasNoMystery: boolean
  hasOpen: boolean
  hasNoConcealment: boolean
  hasHonest: boolean
  hidingCount: number
  obfuscationCount: number
}

export type FacetCondition = 'perfect-prism' | 'fine-crystal' | 'clear-glass' | 'cloudy-prism' | 'cracked-crystal' | 'shattered'

export interface PrismFacet {
  file: string
  refraction: number
  spectrumAnalysis: number
  lightDecomposition: number
  colorClarity: number
  facetQuality: number
  opticalPurity: number
  refractive: RefractiveMeasure
  spectral: SpectralMeasure
  decomposition: DecompositionMeasure
  colorful: ColorfulMeasure
  faceted: FacetedMeasure
  pure: PureMeasure
  condition: FacetCondition
  qualityScore: number
}

export type ArrayType = 'chandelier' | 'prism-array' | 'glass-collection' | 'frosted-glass' | 'broken-glass' | 'shards'
export type ArrayCondition = 'brilliant-display' | 'clear-spectrum' | 'proper-refraction' | 'dim-display' | 'cracked-array' | 'darkness'

export interface PrismArray {
  directory: string
  facets: PrismFacet[]
  avgRefraction: number
  avgClarity: number
  avgPurity: number
  perfectPrismCount: number
  shatteredCount: number
  fineCrystalCount: number
  clearGlassCount: number
  arrayType: ArrayType
  condition: ArrayCondition
}

export interface CrystalSpectrum {
  avgRefraction: number
  avgClarity: number
  avgPurity: number
  isBrilliant: boolean
  overallBrilliance: number
}

export type OpticianGrade = 'master-optician' | 'expert-lapidary' | 'skilled-cutter' | 'apprentice' | 'novice' | 'rock-tumbler'

export interface CrystalPrismStats {
  totalFiles: number
  totalArrays: number
  avgRefraction: number
  avgSpectrumAnalysis: number
  avgLightDecomposition: number
  avgColorClarity: number
  avgFacetQuality: number
  avgOpticalPurity: number
  perfectPrismCount: number
  fineCrystalCount: number
  clearGlassCount: number
  cloudyPrismCount: number
  crackedCrystalCount: number
  shatteredCount: number
  hasHighTransformationCount: number
  hasHighVarietyCount: number
  hasHighClarityCount: number
  hasHighDistinctionCount: number
  hasHighQualityCount: number
  hasHighTransparencyCount: number
  overallBrilliance: number
  opticianGrade: OpticianGrade
  bestFacet: string
  bestRefraction: string
  mostDiverse: string
  clearest: string
  mostDistinct: string
  bestInterface: string
}

export interface CrystalPrismResult {
  facets: PrismFacet[]
  arrays: PrismArray[]
  spectrum: CrystalSpectrum
  stats: CrystalPrismStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureRefractive(content) evaluates code transformation */
export function measureRefractive(content: string): RefractiveMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasArrowFn = /=>\s*[^=]/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)

  const distortionMatches = content.match(/\bvar\s+/g)
  const distortionCount = distortionMatches ? distortionMatches.length : 0
  const approximationMatches = content.match(/\bany\b/g)
  const approximationCount = approximationMatches ? approximationMatches.length : 0

  const hasCleanTransform = hasConst && hasReturnType
  const hasProperMapping = hasExport && hasNamedExport
  const hasFaithful = hasStrictEquality && hasOptionalChaining
  const hasPrecise = hasReturnType && hasAsync
  const hasAccurate = hasArrowFn && hasNullishCoalescing

  let transformation = 0
  if (hasExport) transformation += 8
  if (hasConst) transformation += 10
  if (hasReturnType) transformation += 10
  if (hasAsync) transformation += 8
  if (hasArrowFn) transformation += 8
  if (hasInterface) transformation += 8
  if (hasNamedExport) transformation += 8
  if (hasStrictEquality) transformation += 10
  if (hasOptionalChaining) transformation += 8
  if (hasNullishCoalescing) transformation += 7
  if (hasCleanTransform) transformation += 5
  if (hasProperMapping) transformation += 5
  if (hasFaithful) transformation += 5
  if (hasPrecise) transformation += 5
  if (hasAccurate) transformation += 5

  transformation = Math.min(100, Math.round(transformation))

  let angle: RefractiveMeasure['angle'] = 'shattered'
  if (transformation >= 85) angle = 'perfect-refraction'
  else if (transformation >= 70) angle = 'clean-bend'
  else if (transformation >= 55) angle = 'proper-angle'
  else if (transformation >= 40) angle = 'slight-distortion'
  else if (transformation >= 25) angle = 'warped'

  return {
    transformation,
    angle,
    hasHighTransformation: transformation >= 70,
    hasCleanTransform,
    hasProperMapping,
    hasNoDistortion: distortionCount === 0,
    hasFaithful,
    hasNoWarping: distortionCount === 0,
    hasPrecise,
    hasNoApproximation: approximationCount === 0,
    hasAccurate,
    hasNoSkew: distortionCount === 0 && approximationCount === 0,
    distortionCount,
    approximationCount,
  }
}

/** @example measureSpectral(content) evaluates code variety */
export function measureSpectral(content: string): SpectralMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)

  const monotonyMatches = content.match(/\bvar\s+/g)
  const monotonyCount = monotonyMatches ? monotonyMatches.length : 0
  const repetitionMatches = content.match(/\bany\b/g)
  const repetitionCount = repetitionMatches ? repetitionMatches.length : 0

  const hasDiverse = hasInterface && hasClass
  const hasMultiApproach = hasEnum && hasTypeAlias
  const hasRich = hasExport && hasImport
  const hasVaried = hasGenerics && hasOptionalChaining
  const hasColorful = hasAsync && hasConst

  let variety = 0
  if (hasExport) variety += 8
  if (hasImport) variety += 8
  if (hasInterface) variety += 10
  if (hasClass) variety += 10
  if (hasTypeAlias) variety += 8
  if (hasEnum) variety += 8
  if (hasGenerics) variety += 10
  if (hasAsync) variety += 8
  if (hasConst) variety += 8
  if (hasOptionalChaining) variety += 8
  if (hasDiverse) variety += 5
  if (hasMultiApproach) variety += 5
  if (hasRich) variety += 5
  if (hasVaried) variety += 5
  if (hasColorful) variety += 5

  variety = Math.min(100, Math.round(variety))

  let range: SpectralMeasure['range'] = 'infrared-only'
  if (variety >= 85) range = 'full-rainbow'
  else if (variety >= 70) range = 'rich-spectrum'
  else if (variety >= 55) range = 'proper-range'
  else if (variety >= 40) range = 'limited-palette'
  else if (variety >= 25) range = 'monochrome'

  return {
    variety,
    range,
    hasHighVariety: variety >= 70,
    hasDiverse,
    hasMultiApproach,
    hasNoMonotony: monotonyCount === 0,
    hasRich,
    hasNoRepetition: repetitionCount === 0,
    hasVaried,
    hasNoSingle: monotonyCount === 0 && repetitionCount === 0,
    hasColorful,
    hasNoBland: monotonyCount === 0,
    monotonyCount,
    repetitionCount,
  }
}

/** @example measureDecomposition(content) evaluates code breakdown clarity */
export function measureDecomposition(content: string): DecompositionMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasGenerics = /<\w+>/.test(content)

  const monolithMatches = content.match(/\bvar\s+/g)
  const monolithCount = monolithMatches ? monolithMatches.length : 0
  const blobMatches = content.match(/\bany\b/g)
  const blobCount = blobMatches ? blobMatches.length : 0

  const hasDecomposed = hasInterface && hasClass
  const hasSeparation = hasExport && hasNamedExport
  const hasGranular = hasReturnType && hasConst
  const hasAtomic = hasEnum && hasTypeAlias
  const hasModular = hasGenerics && hasAsync

  let clarity = 0
  if (hasExport) clarity += 10
  if (hasInterface) clarity += 10
  if (hasClass) clarity += 8
  if (hasReturnType) clarity += 10
  if (hasNamedExport) clarity += 8
  if (hasTypeAlias) clarity += 8
  if (hasEnum) clarity += 8
  if (hasAsync) clarity += 8
  if (hasConst) clarity += 8
  if (hasGenerics) clarity += 8
  if (hasDecomposed) clarity += 5
  if (hasSeparation) clarity += 5
  if (hasGranular) clarity += 5
  if (hasAtomic) clarity += 5
  if (hasModular) clarity += 5

  clarity = Math.min(100, Math.round(clarity))

  let quality: DecompositionMeasure['quality'] = 'opaque-mass'
  if (clarity >= 85) quality = 'atomic-clarity'
  else if (clarity >= 70) quality = 'clean-breakdown'
  else if (clarity >= 55) quality = 'proper-separation'
  else if (clarity >= 40) quality = 'partial-split'
  else if (clarity >= 25) quality = 'muddled'

  return {
    clarity,
    quality,
    hasHighClarity: clarity >= 70,
    hasDecomposed,
    hasSeparation,
    hasNoMonolith: monolithCount === 0,
    hasGranular,
    hasNoBlob: blobCount === 0,
    hasAtomic,
    hasNoGiant: monolithCount === 0,
    hasModular,
    hasNoConflation: monolithCount === 0 && blobCount === 0,
    monolithCount,
    blobCount,
  }
}

/** @example measureColorful(content) evaluates code distinction */
export function measureColorful(content: string): ColorfulMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)

  const blurringMatches = content.match(/\bvar\s+/g)
  const blurringCount = blurringMatches ? blurringMatches.length : 0
  const bleedingMatches = content.match(/\bany\b/g)
  const bleedingCount = bleedingMatches ? bleedingMatches.length : 0

  const hasDistinct = hasInterface && hasClass
  const hasClearBoundaries = hasPrivate && hasReadonly
  const hasSeparated = hasExport && hasImport
  const hasContrast = hasNamedExport && hasReturnType
  const hasVivid = hasDocComments && hasTypeAlias

  let distinction = 0
  if (hasExport) distinction += 10
  if (hasImport) distinction += 10
  if (hasInterface) distinction += 8
  if (hasClass) distinction += 8
  if (hasPrivate) distinction += 10
  if (hasReadonly) distinction += 8
  if (hasNamedExport) distinction += 8
  if (hasTypeAlias) distinction += 8
  if (hasReturnType) distinction += 8
  if (hasDocComments) distinction += 8
  if (hasDistinct) distinction += 5
  if (hasClearBoundaries) distinction += 5
  if (hasSeparated) distinction += 5
  if (hasContrast) distinction += 5
  if (hasVivid) distinction += 5

  distinction = Math.min(100, Math.round(distinction))

  let vividness: ColorfulMeasure['vividness'] = 'gray'
  if (distinction >= 85) vividness = 'vivid-spectrum'
  else if (distinction >= 70) vividness = 'clear-colors'
  else if (distinction >= 55) vividness = 'proper-distinction'
  else if (distinction >= 40) vividness = 'faded'
  else if (distinction >= 25) vividness = 'washed-out'

  return {
    distinction,
    vividness,
    hasHighDistinction: distinction >= 70,
    hasDistinct,
    hasClearBoundaries,
    hasNoBlurring: blurringCount === 0,
    hasSeparated,
    hasNoMixing: blurringCount === 0 && bleedingCount === 0,
    hasContrast,
    hasNoBleeding: bleedingCount === 0,
    hasVivid,
    hasNoMuddy: blurringCount === 0,
    blurringCount,
    bleedingCount,
  }
}

/** @example measureFaceted(content) evaluates code interface */
export function measureFaceted(content: string): FacetedMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasOptionalParam = /\w+\?\s*[):\]]/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasConst = /\bconst\s+/.test(content)

  const roughnessMatches = content.match(/\bvar\s+/g)
  const roughnessCount = roughnessMatches ? roughnessMatches.length : 0
  const crudeMatches = content.match(/\bany\b/g)
  const crudeCount = crudeMatches ? crudeMatches.length : 0

  const hasCleanAPI = hasExport && hasReturnType
  const hasSharpEdges = hasInterface && hasReturnType
  const hasPolished = hasDocComments && hasOptionalParam
  const hasSmooth = hasDefaultParam && hasTypeAnnotation
  const hasRefined = hasGenerics && hasNamedExport

  let quality = 0
  if (hasExport) quality += 10
  if (hasInterface) quality += 10
  if (hasReturnType) quality += 10
  if (hasOptionalParam) quality += 8
  if (hasDefaultParam) quality += 8
  if (hasDocComments) quality += 10
  if (hasGenerics) quality += 8
  if (hasNamedExport) quality += 8
  if (hasTypeAnnotation) quality += 8
  if (hasConst) quality += 8
  if (hasCleanAPI) quality += 5
  if (hasSharpEdges) quality += 5
  if (hasPolished) quality += 5
  if (hasSmooth) quality += 5
  if (hasRefined) quality += 5

  quality = Math.min(100, Math.round(quality))

  let cut: FacetedMeasure['cut'] = 'uncut'
  if (quality >= 85) cut = 'brilliant-cut'
  else if (quality >= 70) cut = 'fine-facets'
  else if (quality >= 55) cut = 'proper-angles'
  else if (quality >= 40) cut = 'rough-cut'
  else if (quality >= 25) cut = 'chipped'

  return {
    quality,
    cut,
    hasHighQuality: quality >= 70,
    hasCleanAPI,
    hasSharpEdges,
    hasNoRoughness: roughnessCount === 0,
    hasPolished,
    hasNoJagged: roughnessCount === 0,
    hasSmooth,
    hasNoSharp: roughnessCount === 0 && crudeCount === 0,
    hasRefined,
    hasNoCrude: crudeCount === 0,
    roughnessCount,
    crudeCount,
  }
}

/** @example measurePure(content) evaluates code transparency */
export function measurePure(content: string): PureMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const hidingMatches = content.match(/\bvar\s+/g)
  const hidingCount = hidingMatches ? hidingMatches.length : 0
  const obfuscationMatches = content.match(/\bany\b/g)
  const obfuscationCount = obfuscationMatches ? obfuscationMatches.length : 0

  const hasTransparent = hasExport && hasConst
  const hasVisible = hasReturnType && hasNamedExport
  const hasClear = hasDocComments && hasTypeAnnotation
  const hasOpen = hasInterface && hasStrictEquality
  const hasHonest = hasOptionalChaining && hasReadonly

  let transparency = 0
  if (hasExport) transparency += 10
  if (hasConst) transparency += 10
  if (hasReturnType) transparency += 10
  if (hasNamedExport) transparency += 8
  if (hasDocComments) transparency += 10
  if (hasTypeAnnotation) transparency += 8
  if (hasInterface) transparency += 8
  if (hasStrictEquality) transparency += 8
  if (hasOptionalChaining) transparency += 8
  if (hasReadonly) transparency += 8
  if (hasTransparent) transparency += 5
  if (hasVisible) transparency += 5
  if (hasClear) transparency += 5
  if (hasOpen) transparency += 5
  if (hasHonest) transparency += 5

  transparency = Math.min(100, Math.round(transparency))

  let clarity: PureMeasure['clarity'] = 'opaque'
  if (transparency >= 85) clarity = 'flawless-crystal'
  else if (transparency >= 70) clarity = 'clear-glass'
  else if (transparency >= 55) clarity = 'proper-transparency'
  else if (transparency >= 40) clarity = 'slight-haze'
  else if (transparency >= 25) clarity = 'cloudy'

  return {
    transparency,
    clarity,
    hasHighTransparency: transparency >= 70,
    hasTransparent,
    hasNoHiding: hidingCount === 0,
    hasVisible,
    hasNoObfuscation: obfuscationCount === 0,
    hasClear,
    hasNoMystery: hidingCount === 0 && obfuscationCount === 0,
    hasOpen,
    hasNoConcealment: hidingCount === 0,
    hasHonest,
    hidingCount,
    obfuscationCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'perfect-prism' */
export function classifyCondition(score: number): FacetCondition {
  if (score >= 85) return 'perfect-prism'
  if (score >= 70) return 'fine-crystal'
  if (score >= 55) return 'clear-glass'
  if (score >= 40) return 'cloudy-prism'
  if (score >= 25) return 'cracked-crystal'
  return 'shattered'
}

/** @example classifyArrayType(facets) returns array classification */
export function classifyArrayType(facets: PrismFacet[]): ArrayType {
  if (facets.length === 0) return 'shards'
  const avgQs = facets.reduce((s, f) => s + f.qualityScore, 0) / facets.length
  const perfectCount = facets.filter((f) => f.condition === 'perfect-prism').length
  const ratio = perfectCount / facets.length
  if (avgQs >= 75 && ratio >= 0.5) return 'chandelier'
  if (avgQs >= 60) return 'prism-array'
  if (avgQs >= 45) return 'glass-collection'
  if (avgQs >= 30) return 'frosted-glass'
  if (avgQs >= 15) return 'broken-glass'
  return 'shards'
}

/** @example classifyArrayCondition(avgQs) returns array condition */
export function classifyArrayCondition(avgQs: number): ArrayCondition {
  if (avgQs >= 75) return 'brilliant-display'
  if (avgQs >= 60) return 'clear-spectrum'
  if (avgQs >= 45) return 'proper-refraction'
  if (avgQs >= 30) return 'dim-display'
  if (avgQs >= 15) return 'cracked-array'
  return 'darkness'
}

/** @example classifyOpticianGrade(80) returns 'master-optician' */
export function classifyOpticianGrade(avgBrilliance: number): OpticianGrade {
  if (avgBrilliance >= 80) return 'master-optician'
  if (avgBrilliance >= 65) return 'expert-lapidary'
  if (avgBrilliance >= 50) return 'skilled-cutter'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'rock-tumbler'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzePrismFacet(content, filePath) evaluates single file */
export function analyzePrismFacet(content: string, filePath: string): PrismFacet {
  const refractive = measureRefractive(content)
  const spectral = measureSpectral(content)
  const decomposition = measureDecomposition(content)
  const colorful = measureColorful(content)
  const faceted = measureFaceted(content)
  const pure = measurePure(content)

  const qualityScore = Math.round(
    refractive.transformation * 0.2 +
    spectral.variety * 0.15 +
    decomposition.clarity * 0.15 +
    colorful.distinction * 0.15 +
    faceted.quality * 0.15 +
    pure.transparency * 0.2,
  )

  return {
    file: filePath,
    refraction: refractive.transformation,
    spectrumAnalysis: spectral.variety,
    lightDecomposition: decomposition.clarity,
    colorClarity: colorful.distinction,
    facetQuality: faceted.quality,
    opticalPurity: pure.transparency,
    refractive,
    spectral,
    decomposition,
    colorful,
    faceted,
    pure,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzePrismArray(facets, dirPath) evaluates directory */
export function analyzePrismArray(facets: PrismFacet[], dirPath: string): PrismArray {
  if (facets.length === 0) {
    return {
      directory: dirPath,
      facets: [],
      avgRefraction: 0,
      avgClarity: 0,
      avgPurity: 0,
      perfectPrismCount: 0,
      shatteredCount: 0,
      fineCrystalCount: 0,
      clearGlassCount: 0,
      arrayType: 'shards',
      condition: 'darkness',
    }
  }

  const avgRefraction = Math.round(facets.reduce((s, f) => s + f.refraction, 0) / facets.length)
  const avgClarity = Math.round(facets.reduce((s, f) => s + f.lightDecomposition, 0) / facets.length)
  const avgPurity = Math.round(facets.reduce((s, f) => s + f.opticalPurity, 0) / facets.length)

  const perfectPrismCount = facets.filter((f) => f.condition === 'perfect-prism').length
  const shatteredCount = facets.filter((f) => f.condition === 'shattered').length
  const fineCrystalCount = facets.filter((f) => f.condition === 'fine-crystal').length
  const clearGlassCount = facets.filter((f) => f.condition === 'clear-glass').length

  const avgQs = facets.reduce((s, f) => s + f.qualityScore, 0) / facets.length

  return {
    directory: dirPath,
    facets,
    avgRefraction,
    avgClarity,
    avgPurity,
    perfectPrismCount,
    shatteredCount,
    fineCrystalCount,
    clearGlassCount,
    arrayType: classifyArrayType(facets),
    condition: classifyArrayCondition(avgQs),
  }
}

/** @example generateRecommendations(facets, arrays, spectrum, stats) generates advice */
export function generateRecommendations(
  facets: PrismFacet[],
  arrays: PrismArray[],
  spectrum: CrystalSpectrum,
  stats: CrystalPrismStats,
): string[] {
  const recs: string[] = []

  if (stats.avgRefraction < 50) {
    recs.push('Improve refraction with typed functions, strict equality, and clean transformations')
  }
  if (stats.avgSpectrumAnalysis < 50) {
    recs.push('Broaden spectrum with interfaces, classes, generics, and varied type patterns')
  }
  if (stats.avgLightDecomposition < 50) {
    recs.push('Improve decomposition with granular types, enums, and clear module separation')
  }
  if (stats.avgColorClarity < 50) {
    recs.push('Enhance color clarity with private fields, readonly, and clear boundaries')
  }
  if (stats.avgFacetQuality < 50) {
    recs.push('Refine facet quality with optional parameters, documentation, and clean APIs')
  }
  if (stats.avgOpticalPurity < 50) {
    recs.push('Boost optical purity with exports, const, return types, and transparent patterns')
  }
  if (stats.shatteredCount > 0) {
    recs.push(`${String(stats.shatteredCount)} file(s) are shattered — consider significant refactoring`)
  }
  if (spectrum.overallBrilliance < 40) {
    recs.push('Overall brilliance is low — prioritize transformation quality and transparency')
  }
  if (arrays.length > 0 && arrays.every((a) => a.arrayType === 'shards' || a.arrayType === 'broken-glass')) {
    recs.push('All arrays are degraded — consider a major quality improvement effort')
  }

  const shattered = facets.filter((f) => f.condition === 'shattered')
  if (shattered.length > 0 && shattered.length <= 3) {
    const names = shattered.map((f) => f.file).join(', ')
    recs.push(`Repair these shattered files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your code is a perfect prism! Every facet refracts light into brilliant clarity')
  }

  return Array.from(new Set(recs))
}

/** @example buildCrystalPrismResult(files, contents, options) orchestrates analysis */
export function buildCrystalPrismResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): CrystalPrismResult {
  const facets = files.map((file, i) => analyzePrismFacet(contents[i] ?? '', file))

  const aMap = new Map<string, PrismFacet[]>()
  for (const facet of facets) {
    const dir = facet.file.includes('/') ? facet.file.split('/').slice(0, -1).join('/') : '.'
    const existing = aMap.get(dir)
    if (existing) {
      existing.push(facet)
    } else {
      aMap.set(dir, [facet])
    }
  }

  const arrays = Array.from(aMap.entries()).map(([dir, dirFacets]) =>
    analyzePrismArray(dirFacets, dir),
  )

  const totalFiles = facets.length
  const avgRefraction = totalFiles > 0 ? Math.round(facets.reduce((s, f) => s + f.refraction, 0) / totalFiles) : 0
  const avgSpectrumAnalysis = totalFiles > 0 ? Math.round(facets.reduce((s, f) => s + f.spectrumAnalysis, 0) / totalFiles) : 0
  const avgLightDecomposition = totalFiles > 0 ? Math.round(facets.reduce((s, f) => s + f.lightDecomposition, 0) / totalFiles) : 0
  const avgColorClarity = totalFiles > 0 ? Math.round(facets.reduce((s, f) => s + f.colorClarity, 0) / totalFiles) : 0
  const avgFacetQuality = totalFiles > 0 ? Math.round(facets.reduce((s, f) => s + f.facetQuality, 0) / totalFiles) : 0
  const avgOpticalPurity = totalFiles > 0 ? Math.round(facets.reduce((s, f) => s + f.opticalPurity, 0) / totalFiles) : 0

  const avgClarity = avgLightDecomposition
  const avgPurity = avgOpticalPurity

  const overallBrilliance = totalFiles > 0
    ? Math.round((avgRefraction + avgClarity + avgPurity) / 3)
    : 0

  const spectrum: CrystalSpectrum = {
    avgRefraction,
    avgClarity,
    avgPurity,
    isBrilliant: avgRefraction >= 60,
    overallBrilliance,
  }

  const bestFacet = totalFiles > 0
    ? facets.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best), facets[0]).file
    : ''
  const bestRefraction = totalFiles > 0
    ? facets.reduce((best, f) => (f.refraction > best.refraction ? f : best), facets[0]).file
    : ''
  const mostDiverse = totalFiles > 0
    ? facets.reduce((best, f) => (f.spectrumAnalysis > best.spectrumAnalysis ? f : best), facets[0]).file
    : ''
  const clearest = totalFiles > 0
    ? facets.reduce((best, f) => (f.lightDecomposition > best.lightDecomposition ? f : best), facets[0]).file
    : ''
  const mostDistinct = totalFiles > 0
    ? facets.reduce((best, f) => (f.colorClarity > best.colorClarity ? f : best), facets[0]).file
    : ''
  const bestInterface = totalFiles > 0
    ? facets.reduce((best, f) => (f.facetQuality > best.facetQuality ? f : best), facets[0]).file
    : ''

  const stats: CrystalPrismStats = {
    totalFiles,
    totalArrays: arrays.length,
    avgRefraction,
    avgSpectrumAnalysis,
    avgLightDecomposition,
    avgColorClarity,
    avgFacetQuality,
    avgOpticalPurity,
    perfectPrismCount: facets.filter((f) => f.condition === 'perfect-prism').length,
    fineCrystalCount: facets.filter((f) => f.condition === 'fine-crystal').length,
    clearGlassCount: facets.filter((f) => f.condition === 'clear-glass').length,
    cloudyPrismCount: facets.filter((f) => f.condition === 'cloudy-prism').length,
    crackedCrystalCount: facets.filter((f) => f.condition === 'cracked-crystal').length,
    shatteredCount: facets.filter((f) => f.condition === 'shattered').length,
    hasHighTransformationCount: facets.filter((f) => f.refractive.hasHighTransformation).length,
    hasHighVarietyCount: facets.filter((f) => f.spectral.hasHighVariety).length,
    hasHighClarityCount: facets.filter((f) => f.decomposition.hasHighClarity).length,
    hasHighDistinctionCount: facets.filter((f) => f.colorful.hasHighDistinction).length,
    hasHighQualityCount: facets.filter((f) => f.faceted.hasHighQuality).length,
    hasHighTransparencyCount: facets.filter((f) => f.pure.hasHighTransparency).length,
    overallBrilliance,
    opticianGrade: classifyOpticianGrade(overallBrilliance),
    bestFacet,
    bestRefraction,
    mostDiverse,
    clearest,
    mostDistinct,
    bestInterface,
  }

  const recommendations = generateRecommendations(facets, arrays, spectrum, stats)

  return { facets, arrays, spectrum, stats, recommendations }
}
