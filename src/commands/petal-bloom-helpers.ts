// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface BeautifulMeasure {
  elegance: number
  form: 'orchid-perfection' | 'rose-elegance' | 'lily-grace' | 'daisy-charm' | 'weed-rough' | 'wilted'
  hasHighElegance: boolean
  hasGraceful: boolean
  hasHarmonious: boolean
  hasNoUgliness: boolean
  hasProportioned: boolean
  hasNoClumsiness: boolean
  hasAesthetic: boolean
  hasNoDisorder: boolean
  hasPleasing: boolean
  hasNoOffense: boolean
  uglinessCount: number
  clumsinessCount: number
}

export interface BlossomMeasure {
  development: number
  stage: 'full-bloom' | 'opening' | 'budding' | 'sprouting' | 'dormant' | 'dead-seed'
  hasHighDevelopment: boolean
  hasMature: boolean
  hasExpanding: boolean
  hasNoStagnation: boolean
  hasGrowing: boolean
  hasNoWithering: boolean
  hasFlourishing: boolean
  hasNoRegression: boolean
  hasProgressing: boolean
  hasNoDecay: boolean
  stagnationCount: number
  regressionCount: number
}

export interface GrowthMeasure {
  potential: number
  capacity: 'unlimited-canopy' | 'strong-vine' | 'healthy-shrub' | 'moderate-growth' | 'stunted' | 'barren-soil'
  hasHighPotential: boolean
  hasExtensible: boolean
  hasModular: boolean
  hasNoRigidity: boolean
  hasAdaptable: boolean
  hasNoBrittleness: boolean
  hasScalable: boolean
  hasNoCeiling: boolean
  hasOpen: boolean
  hasNoBlockage: boolean
  rigidityCount: number
  ceilingCount: number
}

export interface FragrantMeasure {
  appeal: number
  scent: 'intoxicating' | 'sweet-fragrance' | 'pleasant' | 'mild-scent' | 'odorless' | 'unpleasant'
  hasHighAppeal: boolean
  hasInviting: boolean
  hasClear: boolean
  hasNoRepellent: boolean
  hasAttractive: boolean
  hasNoOffensive: boolean
  hasWelcoming: boolean
  hasNoBarrier: boolean
  hasApproachable: boolean
  hasNoIntimidation: boolean
  repellentCount: number
  barrierCount: number
}

export interface PollinatingMeasure {
  reuse: number
  spread: 'cross-pollination' | 'wide-spread' | 'local-sharing' | 'limited-contact' | 'isolated' | 'walled-garden'
  hasHighReuse: boolean
  hasShareable: boolean
  hasExportable: boolean
  hasNoSilos: boolean
  hasReusable: boolean
  hasNoMonopoly: boolean
  hasConnector: boolean
  hasNoIsolation: boolean
  hasCommunity: boolean
  hasNoExclusion: boolean
  siloCount: number
  isolationCount: number
}

export interface SeasonalMeasure {
  rhythm: number
  phase: 'perpetual-bloom' | 'long-season' | 'proper-cycle' | 'short-season' | 'irregular' | 'never-blooms'
  hasHighRhythm: boolean
  hasCyclic: boolean
  hasProperTiming: boolean
  hasNoPremature: boolean
  hasSeasoned: boolean
  hasNoUntimely: boolean
  hasRhythmic: boolean
  hasNoChaos: boolean
  hasNatural: boolean
  hasNoForced: boolean
  prematureCount: number
  chaosCount: number
}

export interface Petal {
  file: string
  beauty: number
  blossoming: number
  growthPotential: number
  fragrance: number
  pollination: number
  seasonalRhythm: number
  beautiful: BeautifulMeasure
  blossom: BlossomMeasure
  growth: GrowthMeasure
  fragrant: FragrantMeasure
  pollinating: PollinatingMeasure
  seasonal: SeasonalMeasure
  condition: 'prize-bloom' | 'healthy-flower' | 'growing-plant' | 'fading-petals' | 'wilting' | 'dried-arrangement'
  qualityScore: number
}

export interface Bouquet {
  directory: string
  petals: Petal[]
  avgBeauty: number
  avgGrowthPotential: number
  avgFragrance: number
  prizeBloomCount: number
  driedCount: number
  healthyCount: number
  growingCount: number
  bouquetType: 'botanical-garden' | 'flower-arrangement' | 'wildflower-meadow' | 'potted-plants' | 'dried-flowers' | 'barren-ground'
  condition: 'spectacular-bloom' | 'beautiful-garden' | 'pleasant-meadow' | 'fading-garden' | 'wilting-bed' | 'dead-garden'
}

export interface PetalBloomResult {
  petals: Petal[]
  bouquets: Bouquet[]
  garden: {
    avgBeauty: number
    avgGrowthPotential: number
    avgFragrance: number
    isBlooming: boolean
    overallBloom: number
  }
  stats: {
    totalFiles: number
    totalBouquets: number
    avgBeauty: number
    avgBlossoming: number
    avgGrowthPotential: number
    avgFragrance: number
    avgPollination: number
    avgSeasonalRhythm: number
    prizeBloomCount: number
    healthyFlowerCount: number
    growingPlantCount: number
    fadingPetalsCount: number
    wiltingCount: number
    driedArrangementCount: number
    hasHighEleganceCount: number
    hasHighDevelopmentCount: number
    hasHighPotentialCount: number
    hasHighAppealCount: number
    hasHighReuseCount: number
    hasHighRhythmCount: number
    overallBloom: number
    gardenerGrade: 'master-gardener' | 'expert-botanist' | 'skilled-horticulturist' | 'weekend-gardener' | 'plant-novice' | 'brown-thumb'
    bestPetal: string
    mostBeautiful: string
    mostDeveloped: string
    mostExtensible: string
    mostAppealing: string
    mostReusable: string
  }
  recommendations: string[]
}

// ─── Measure Beautiful (code elegance) ──────────────────────────────────────

/** @example measureBeautiful(content) returns BeautifulMeasure */
export function measureBeautiful(content: string): BeautifulMeasure {
  let score = 0
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasReturnType = /\)\s*:\s*(?!void\s*\{)(?!{)\w+/.test(content)
  const hasOptional = /\?\s*:/.test(content)

  if (hasInterfaces) score += 12
  if (hasTypes) score += 8
  if (hasClasses) score += 8
  if (hasExports) score += 10
  if (hasImports) score += 7
  if (hasAsync) score += 8
  if (hasAwait) score += 5
  if (hasTryCatch) score += 10
  if (hasJSDoc) score += 10
  if (hasGenerics) score += 8
  if (hasReturnType) score += 8
  if (hasOptional) score += 6
  score = Math.min(100, score)

  const uglinessPatterns = [/\bvar\b/, /\bany\b/]
  const clumsinessPatterns = [/\beval\b/, /\bFunction\s*\(/]
  const uglinessCount = uglinessPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const clumsinessCount = clumsinessPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let form: BeautifulMeasure['form'] = 'wilted'
  if (score >= 80) form = 'orchid-perfection'
  else if (score >= 65) form = 'rose-elegance'
  else if (score >= 50) form = 'lily-grace'
  else if (score >= 35) form = 'daisy-charm'
  else if (score >= 20) form = 'weed-rough'

  return {
    elegance: score,
    form,
    hasHighElegance: score >= 70,
    hasGraceful: hasInterfaces || hasTypes,
    hasHarmonious: hasExports && hasImports,
    hasNoUgliness: uglinessCount === 0,
    hasProportioned: hasInterfaces && hasClasses,
    hasNoClumsiness: clumsinessCount === 0,
    hasAesthetic: hasJSDoc || hasReturnType,
    hasNoDisorder: uglinessCount === 0 && clumsinessCount === 0,
    hasPleasing: hasTryCatch || hasOptional,
    hasNoOffense: clumsinessCount === 0,
    uglinessCount,
    clumsinessCount,
  }
}

// ─── Measure Blossom (code development) ─────────────────────────────────────

/** @example measureBlossom(content) returns BlossomMeasure */
export function measureBlossom(content: string): BlossomMeasure {
  let score = 0
  const hasTests = /\bdescribe\b|\bit\s*\(|\btest\s*\(/.test(content)
  const hasAssertions = /\bexpect\b|\bassert\b/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasFunctions = /\bfunction\b/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasConsts = /\bconst\b/.test(content)
  const hasArrow = /=>/.test(content)

  if (hasTests) score += 12
  if (hasAssertions) score += 10
  if (hasExports) score += 10
  if (hasImports) score += 7
  if (hasFunctions) score += 8
  if (hasClasses) score += 8
  if (hasAsync) score += 8
  if (hasAwait) score += 5
  if (hasErrorHandling) score += 10
  if (hasInterfaces) score += 8
  if (hasConsts) score += 5
  if (hasArrow) score += 9
  score = Math.min(100, score)

  const stagnationPatterns = [/\bTODO\b/, /\bFIXME\b/]
  const regressionPatterns = [/\bvar\b/, /\barguments\b/]
  const stagnationCount = stagnationPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const regressionCount = regressionPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let stage: BlossomMeasure['stage'] = 'dead-seed'
  if (score >= 80) stage = 'full-bloom'
  else if (score >= 65) stage = 'opening'
  else if (score >= 50) stage = 'budding'
  else if (score >= 35) stage = 'sprouting'
  else if (score >= 20) stage = 'dormant'

  return {
    development: score,
    stage,
    hasHighDevelopment: score >= 70,
    hasMature: hasTests && hasExports,
    hasExpanding: hasAsync || hasAwait,
    hasNoStagnation: stagnationCount === 0,
    hasGrowing: hasFunctions || hasClasses,
    hasNoWithering: regressionCount === 0,
    hasFlourishing: hasExports && hasErrorHandling,
    hasNoRegression: regressionCount === 0,
    hasProgressing: hasConsts || hasArrow,
    hasNoDecay: stagnationCount === 0 && regressionCount === 0,
    stagnationCount,
    regressionCount,
  }
}

// ─── Measure Growth (code extensibility) ────────────────────────────────────

/** @example measureGrowth(content) returns GrowthMeasure */
export function measureGrowth(content: string): GrowthMeasure {
  let score = 0
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasExtends = /\bextends\b/.test(content)
  const hasImplements = /\bimplements\b/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasAbstract = /\babstract\b/.test(content)
  const hasOptional = /\?\s*:/.test(content)
  const hasRest = /\.\.\./.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasDefaultExport = /\bexport\s+default\b/.test(content)

  if (hasInterfaces) score += 12
  if (hasTypes) score += 10
  if (hasGenerics) score += 10
  if (hasExtends) score += 10
  if (hasImplements) score += 10
  if (hasExports) score += 8
  if (hasImports) score += 7
  if (hasAbstract) score += 10
  if (hasOptional) score += 8
  if (hasRest) score += 5
  if (hasClasses) score += 5
  if (hasDefaultExport) score += 5
  score = Math.min(100, score)

  const rigidityPatterns = [/\bprivate\b.*:\s*any/, /\bvar\b/]
  const ceilingPatterns = [/\bas\s+any\b/, /\bObject\.freeze\b/]
  const rigidityCount = rigidityPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const ceilingCount = ceilingPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let capacity: GrowthMeasure['capacity'] = 'barren-soil'
  if (score >= 80) capacity = 'unlimited-canopy'
  else if (score >= 65) capacity = 'strong-vine'
  else if (score >= 50) capacity = 'healthy-shrub'
  else if (score >= 35) capacity = 'moderate-growth'
  else if (score >= 20) capacity = 'stunted'

  return {
    potential: score,
    capacity,
    hasHighPotential: score >= 70,
    hasExtensible: hasInterfaces || hasGenerics,
    hasModular: hasExports && hasImports,
    hasNoRigidity: rigidityCount === 0,
    hasAdaptable: hasExtends || hasImplements,
    hasNoBrittleness: rigidityCount === 0 && ceilingCount === 0,
    hasScalable: hasAbstract || hasOptional,
    hasNoCeiling: ceilingCount === 0,
    hasOpen: hasExports || hasDefaultExport,
    hasNoBlockage: rigidityCount === 0,
    rigidityCount,
    ceilingCount,
  }
}

// ─── Measure Fragrant (code appeal) ─────────────────────────────────────────

/** @example measureFragrant(content) returns FragrantMeasure */
export function measureFragrant(content: string): FragrantMeasure {
  let score = 0
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasParamDocs = /@param\b/.test(content)
  const hasReturnDocs = /@returns?\b/.test(content)
  const hasExampleDocs = /@example\b/.test(content)
  const hasConsts = /\bconst\b/.test(content)
  const hasDescriptive = /\bgetUser\b|\bprocessData\b|\bcalculateTotal\b|\bhandleClick\b/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content)
  const hasTypedParams = /\(\s*\w+\s*:/.test(content)
  const hasReturnType = /\)\s*:\s*(?!void\s*\{)(?!{)\w+/.test(content)
  const hasEnums = /\benum\b/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)

  if (hasJSDoc) score += 12
  if (hasParamDocs) score += 10
  if (hasReturnDocs) score += 10
  if (hasExampleDocs) score += 8
  if (hasConsts) score += 5
  if (hasDescriptive) score += 10
  if (hasAsync) score += 7
  if (hasErrorHandling) score += 8
  if (hasTypedParams) score += 10
  if (hasReturnType) score += 10
  if (hasEnums) score += 5
  if (hasInterfaces) score += 5
  score = Math.min(100, score)

  const repellentPatterns = [/\bconsole\.log\b/, /\bdebugger\b/]
  const barrierPatterns = [/\bany\b/, /\bvar\b/]
  const repellentCount = repellentPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const barrierCount = barrierPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let scent: FragrantMeasure['scent'] = 'unpleasant'
  if (score >= 80) scent = 'intoxicating'
  else if (score >= 65) scent = 'sweet-fragrance'
  else if (score >= 50) scent = 'pleasant'
  else if (score >= 35) scent = 'mild-scent'
  else if (score >= 20) scent = 'odorless'

  return {
    appeal: score,
    scent,
    hasHighAppeal: score >= 70,
    hasInviting: hasJSDoc || hasExampleDocs,
    hasClear: hasTypedParams || hasReturnType,
    hasNoRepellent: repellentCount === 0,
    hasAttractive: hasDescriptive || hasInterfaces,
    hasNoOffensive: repellentCount === 0 && barrierCount === 0,
    hasWelcoming: hasConsts || hasAsync,
    hasNoBarrier: barrierCount === 0,
    hasApproachable: hasParamDocs || hasReturnDocs,
    hasNoIntimidation: barrierCount === 0,
    repellentCount,
    barrierCount,
  }
}

// ─── Measure Pollinating (code reuse) ───────────────────────────────────────

/** @example measurePollinating(content) returns PollinatingMeasure */
export function measurePollinating(content: string): PollinatingMeasure {
  let score = 0
  const hasExports = /\bexport\b/.test(content)
  const hasNamedExport = /\bexport\s+(function|class|const|interface|type)\b/.test(content)
  const hasDefaultExport = /\bexport\s+default\b/.test(content)
  const hasReExport = /\bexport\s+\*\s+from\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasFunctions = /\bfunction\b/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasArrow = /=>/.test(content)
  const hasDestructure = /\{[^}]+\}\s*=/.test(content)

  if (hasExports) score += 12
  if (hasNamedExport) score += 10
  if (hasDefaultExport) score += 8
  if (hasReExport) score += 10
  if (hasImports) score += 10
  if (hasInterfaces) score += 8
  if (hasTypes) score += 7
  if (hasGenerics) score += 8
  if (hasFunctions) score += 7
  if (hasClasses) score += 5
  if (hasArrow) score += 5
  if (hasDestructure) score += 10
  score = Math.min(100, score)

  const siloPatterns = [/\brequire\s*\(/, /\bmodule\.exports\b/]
  const isolationPatterns = [/\beval\b/, /\bFunction\s*\(/]
  const siloCount = siloPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const isolationCount = isolationPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let spread: PollinatingMeasure['spread'] = 'walled-garden'
  if (score >= 80) spread = 'cross-pollination'
  else if (score >= 65) spread = 'wide-spread'
  else if (score >= 50) spread = 'local-sharing'
  else if (score >= 35) spread = 'limited-contact'
  else if (score >= 20) spread = 'isolated'

  return {
    reuse: score,
    spread,
    hasHighReuse: score >= 70,
    hasShareable: hasExports || hasNamedExport,
    hasExportable: hasNamedExport || hasDefaultExport,
    hasNoSilos: siloCount === 0,
    hasReusable: hasFunctions || hasClasses,
    hasNoMonopoly: siloCount === 0,
    hasConnector: hasImports && hasExports,
    hasNoIsolation: isolationCount === 0,
    hasCommunity: hasInterfaces || hasTypes,
    hasNoExclusion: siloCount === 0 && isolationCount === 0,
    siloCount,
    isolationCount,
  }
}

// ─── Measure Seasonal (code lifecycle) ──────────────────────────────────────

/** @example measureSeasonal(content) returns SeasonalMeasure */
export function measureSeasonal(content: string): SeasonalMeasure {
  let score = 0
  const hasTests = /\bdescribe\b|\bit\s*\(|\btest\s*\(/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasPromises = /\bPromise\b/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content)
  const hasFinally = /\bfinally\s*\{/.test(content)
  const hasConsts = /\bconst\b/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasNullSafety = /\?\?|\?\.\w/.test(content)

  if (hasTests) score += 12
  if (hasAsync) score += 8
  if (hasAwait) score += 8
  if (hasPromises) score += 7
  if (hasErrorHandling) score += 10
  if (hasFinally) score += 8
  if (hasConsts) score += 5
  if (hasExports) score += 8
  if (hasInterfaces) score += 10
  if (hasTypes) score += 7
  if (hasReadonly) score += 9
  if (hasNullSafety) score += 8
  score = Math.min(100, score)

  const prematurePatterns = [/\bvar\b/, /\bany\b/]
  const chaosPatterns = [/\beval\b/, /\bdebugger\b/]
  const prematureCount = prematurePatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const chaosCount = chaosPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let phase: SeasonalMeasure['phase'] = 'never-blooms'
  if (score >= 80) phase = 'perpetual-bloom'
  else if (score >= 65) phase = 'long-season'
  else if (score >= 50) phase = 'proper-cycle'
  else if (score >= 35) phase = 'short-season'
  else if (score >= 20) phase = 'irregular'

  return {
    rhythm: score,
    phase,
    hasHighRhythm: score >= 70,
    hasCyclic: hasTests || hasAsync,
    hasProperTiming: hasAsync && hasAwait,
    hasNoPremature: prematureCount === 0,
    hasSeasoned: hasInterfaces || hasTypes,
    hasNoUntimely: prematureCount === 0,
    hasRhythmic: hasErrorHandling && hasConsts,
    hasNoChaos: chaosCount === 0,
    hasNatural: hasNullSafety || hasReadonly,
    hasNoForced: chaosCount === 0,
    prematureCount,
    chaosCount,
  }
}

// ─── classifyPetalCondition ─────────────────────────────────────────────────

/** @example classifyPetalCondition(score) returns condition string */
export function classifyPetalCondition(score: number): Petal['condition'] {
  if (score >= 90) return 'prize-bloom'
  if (score >= 75) return 'healthy-flower'
  if (score >= 60) return 'growing-plant'
  if (score >= 45) return 'fading-petals'
  if (score >= 30) return 'wilting'
  return 'dried-arrangement'
}

// ─── classifyBouquetType ────────────────────────────────────────────────────

/** @example classifyBouquetType(petals) returns bouquet type string */
export function classifyBouquetType(petals: Petal[]): Bouquet['bouquetType'] {
  if (petals.length === 0) return 'barren-ground'
  const avg = petals.reduce((s, p) => s + p.qualityScore, 0) / petals.length
  const prizeCount = petals.filter((p) => p.condition === 'prize-bloom').length
  const ratio = prizeCount / petals.length
  if (avg >= 80 && ratio >= 0.5) return 'botanical-garden'
  if (avg >= 70) return 'flower-arrangement'
  if (avg >= 55) return 'wildflower-meadow'
  if (avg >= 40) return 'potted-plants'
  if (avg >= 25) return 'dried-flowers'
  return 'barren-ground'
}

// ─── classifyGardenerGrade ──────────────────────────────────────────────────

/** @example classifyGardenerGrade(avg) returns grade string */
export function classifyGardenerGrade(avg: number): PetalBloomResult['stats']['gardenerGrade'] {
  if (avg >= 80) return 'master-gardener'
  if (avg >= 65) return 'expert-botanist'
  if (avg >= 50) return 'skilled-horticulturist'
  if (avg >= 35) return 'weekend-gardener'
  if (avg >= 20) return 'plant-novice'
  return 'brown-thumb'
}

// ─── classifyBouquetCondition ───────────────────────────────────────────────

/** @example classifyBouquetCondition(avg) returns condition string */
export function classifyBouquetCondition(avg: number): Bouquet['condition'] {
  if (avg >= 80) return 'spectacular-bloom'
  if (avg >= 65) return 'beautiful-garden'
  if (avg >= 50) return 'pleasant-meadow'
  if (avg >= 35) return 'fading-garden'
  if (avg >= 20) return 'wilting-bed'
  return 'dead-garden'
}

// ─── analyzePetal ───────────────────────────────────────────────────────────

/** @example analyzePetal(content, filePath) returns Petal */
export function analyzePetal(content: string, filePath: string): Petal {
  const beautiful = measureBeautiful(content)
  const blossom = measureBlossom(content)
  const growth = measureGrowth(content)
  const fragrant = measureFragrant(content)
  const pollinating = measurePollinating(content)
  const seasonal = measureSeasonal(content)

  const beauty = beautiful.elegance
  const blossoming = blossom.development
  const growthPotential = growth.potential
  const fragrance = fragrant.appeal
  const pollination = pollinating.reuse
  const seasonalRhythm = seasonal.rhythm

  const qualityScore = Math.round(
    beauty * 0.2 +
    blossoming * 0.15 +
    growthPotential * 0.15 +
    fragrance * 0.15 +
    pollination * 0.15 +
    seasonalRhythm * 0.2,
  )

  const condition = classifyPetalCondition(qualityScore)

  return {
    file: filePath,
    beauty,
    blossoming,
    growthPotential,
    fragrance,
    pollination,
    seasonalRhythm,
    beautiful,
    blossom,
    growth,
    fragrant,
    pollinating,
    seasonal,
    condition,
    qualityScore,
  }
}

// ─── analyzeBouquet ─────────────────────────────────────────────────────────

/** @example analyzeBouquet(petals, dirPath) returns Bouquet */
export function analyzeBouquet(petals: Petal[], dirPath: string): Bouquet {
  if (petals.length === 0) {
    return {
      directory: dirPath,
      petals,
      avgBeauty: 0,
      avgGrowthPotential: 0,
      avgFragrance: 0,
      prizeBloomCount: 0,
      driedCount: 0,
      healthyCount: 0,
      growingCount: 0,
      bouquetType: 'barren-ground',
      condition: 'dead-garden',
    }
  }

  const avgBeauty = Math.round(petals.reduce((s, p) => s + p.beauty, 0) / petals.length)
  const avgGrowthPotential = Math.round(petals.reduce((s, p) => s + p.growthPotential, 0) / petals.length)
  const avgFragrance = Math.round(petals.reduce((s, p) => s + p.fragrance, 0) / petals.length)
  const prizeBloomCount = petals.filter((p) => p.condition === 'prize-bloom').length
  const driedCount = petals.filter((p) => p.condition === 'dried-arrangement').length
  const healthyCount = petals.filter((p) => p.condition === 'healthy-flower').length
  const growingCount = petals.filter((p) => p.condition === 'growing-plant').length
  const bouquetType = classifyBouquetType(petals)
  const overallAvg = Math.round(petals.reduce((s, p) => s + p.qualityScore, 0) / petals.length)
  const condition = classifyBouquetCondition(overallAvg)

  return {
    directory: dirPath,
    petals,
    avgBeauty,
    avgGrowthPotential,
    avgFragrance,
    prizeBloomCount,
    driedCount,
    healthyCount,
    growingCount,
    bouquetType,
    condition,
  }
}

// ─── generateRecommendations ────────────────────────────────────────────────

/** @example generateRecommendations(petals, bouquets, garden, stats) returns string[] */
export function generateRecommendations(
  petals: Petal[],
  bouquets: Bouquet[],
  garden: PetalBloomResult['garden'],
  stats: PetalBloomResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgBeauty < 40) {
    recs.push('Improve code elegance with interfaces, JSDoc, and error handling')
  }
  if (stats.avgBlossoming < 30) {
    recs.push('Add tests, exports, and async patterns for better code development')
  }
  if (stats.avgGrowthPotential < 40) {
    recs.push('Use generics, extends, and optional types for better extensibility')
  }
  if (stats.avgFragrance < 30) {
    recs.push('Add documentation with @param, @returns, and descriptive naming')
  }
  if (stats.avgPollination < 30) {
    recs.push('Increase code reuse with named exports, interfaces, and destructuring')
  }
  if (stats.avgSeasonalRhythm < 30) {
    recs.push('Strengthen lifecycle with tests, null safety, and readonly properties')
  }
  if (garden.overallBloom < 50) {
    recs.push('Overall bloom quality is low — invest in code quality fundamentals')
  }
  if (stats.driedArrangementCount > stats.totalFiles * 0.3) {
    recs.push('Too many dried-arrangement files — refactor or remove dead code')
  }
  if (recs.length === 0) {
    recs.push('Code bloom quality is excellent — maintain current gardening standards')
  }

  return recs
}

// ─── buildPetalBloomResult ──────────────────────────────────────────────────

/** @example buildPetalBloomResult(files, contents) returns PetalBloomResult */
export function buildPetalBloomResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): PetalBloomResult {
  const petals = files.map((file, i) => analyzePetal(contents[i] ?? '', file))

  const dirMap = new Map<string, Petal[]>()
  petals.forEach((petal) => {
    const parts = petal.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(petal)
    } else {
      dirMap.set(dir, [petal])
    }
  })

  const bouquets = Array.from(dirMap.entries()).map(
    ([dir, dirPetals]) => analyzeBouquet(dirPetals, dir),
  )

  const totalFiles = petals.length
  const avgBeauty = totalFiles > 0 ? Math.round(petals.reduce((s, p) => s + p.beauty, 0) / totalFiles) : 0
  const avgBlossoming = totalFiles > 0 ? Math.round(petals.reduce((s, p) => s + p.blossoming, 0) / totalFiles) : 0
  const avgGrowthPotential = totalFiles > 0 ? Math.round(petals.reduce((s, p) => s + p.growthPotential, 0) / totalFiles) : 0
  const avgFragrance = totalFiles > 0 ? Math.round(petals.reduce((s, p) => s + p.fragrance, 0) / totalFiles) : 0
  const avgPollination = totalFiles > 0 ? Math.round(petals.reduce((s, p) => s + p.pollination, 0) / totalFiles) : 0
  const avgSeasonalRhythm = totalFiles > 0 ? Math.round(petals.reduce((s, p) => s + p.seasonalRhythm, 0) / totalFiles) : 0

  const overallBloom = totalFiles > 0
    ? Math.round(petals.reduce((s, p) => s + p.qualityScore, 0) / totalFiles)
    : 0

  const avgGrowth = totalFiles > 0
    ? Math.round(petals.reduce((s, p) => s + p.growthPotential, 0) / totalFiles)
    : 0
  const avgFrag = totalFiles > 0
    ? Math.round(petals.reduce((s, p) => s + p.fragrance, 0) / totalFiles)
    : 0

  const garden: PetalBloomResult['garden'] = {
    avgBeauty,
    avgGrowthPotential: avgGrowth,
    avgFragrance: avgFrag,
    isBlooming: avgBeauty >= 60,
    overallBloom,
  }

  const findBest = (fn: (p: Petal) => number): string => {
    if (petals.length === 0) return ''
    const best = petals.reduce((a, b) => fn(a) >= fn(b) ? a : b)
    return best.file
  }

  const stats: PetalBloomResult['stats'] = {
    totalFiles,
    totalBouquets: bouquets.length,
    avgBeauty,
    avgBlossoming,
    avgGrowthPotential,
    avgFragrance,
    avgPollination,
    avgSeasonalRhythm,
    prizeBloomCount: petals.filter((p) => p.condition === 'prize-bloom').length,
    healthyFlowerCount: petals.filter((p) => p.condition === 'healthy-flower').length,
    growingPlantCount: petals.filter((p) => p.condition === 'growing-plant').length,
    fadingPetalsCount: petals.filter((p) => p.condition === 'fading-petals').length,
    wiltingCount: petals.filter((p) => p.condition === 'wilting').length,
    driedArrangementCount: petals.filter((p) => p.condition === 'dried-arrangement').length,
    hasHighEleganceCount: petals.filter((p) => p.beautiful.hasHighElegance).length,
    hasHighDevelopmentCount: petals.filter((p) => p.blossom.hasHighDevelopment).length,
    hasHighPotentialCount: petals.filter((p) => p.growth.hasHighPotential).length,
    hasHighAppealCount: petals.filter((p) => p.fragrant.hasHighAppeal).length,
    hasHighReuseCount: petals.filter((p) => p.pollinating.hasHighReuse).length,
    hasHighRhythmCount: petals.filter((p) => p.seasonal.hasHighRhythm).length,
    overallBloom,
    gardenerGrade: classifyGardenerGrade(overallBloom),
    bestPetal: findBest((p) => p.qualityScore),
    mostBeautiful: findBest((p) => p.beauty),
    mostDeveloped: findBest((p) => p.blossoming),
    mostExtensible: findBest((p) => p.growthPotential),
    mostAppealing: findBest((p) => p.fragrance),
    mostReusable: findBest((p) => p.pollination),
  }

  const recommendations = generateRecommendations(petals, bouquets, garden, stats)

  return { petals, bouquets, garden, stats, recommendations }
}
