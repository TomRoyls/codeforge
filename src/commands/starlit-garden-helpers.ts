// ─── Types ─────────────────────────────────────────────────────────────────

export interface WondrousMeasure {
  inspiration: number
  awe: 'transcendent-wonder' | 'inspiring' | 'noteworthy' | 'pleasant' | 'ordinary' | 'uninspiring'
  hasHighInspiration: boolean
  hasClever: boolean
  hasElegant: boolean
  hasNoPlodding: boolean
  hasInnovative: boolean
  hasNoBoring: boolean
  hasBeautiful: boolean
  hasNoUgly: boolean
  hasImpressive: boolean
  hasNoMediocre: boolean
  ploddingCount: number
  boringCount: number
}

export interface ConstellationMeasure {
  mapping: number
  pattern: 'perfect-constellation' | 'clear-star-map' | 'recognizable-pattern' | 'scattered-stars' | 'random-dots' | 'void'
  hasHighMapping: boolean
  hasOrganized: boolean
  hasPatterned: boolean
  hasNoChaos: boolean
  hasStructured: boolean
  hasNoRandomness: boolean
  hasClear: boolean
  hasNoConfusion: boolean
  hasMapped: boolean
  hasNoWandering: boolean
  chaosCount: number
  randomnessCount: number
}

export interface CelestialMeasure {
  organization: number
  order: 'celestial-harmony' | 'orbital-precision' | 'proper-orbits' | 'drifting' | 'tumbling' | 'chaotic-orbit'
  hasHighOrganization: boolean
  hasHierarchical: boolean
  hasLayered: boolean
  hasNoFlatness: boolean
  hasCategorized: boolean
  hasNoMixedUp: boolean
  hasSystematic: boolean
  hasNoAdHoc: boolean
  hasOrdered: boolean
  hasNoScrambled: boolean
  flatnessCount: number
  mixedUpCount: number
}

export interface NocturnalMeasure {
  beauty: number
  radiance: 'moonlit-splendor' | 'starlit-elegance' | 'twilight-charm' | 'dim-glow' | 'dark-shadow' | 'pitch-black'
  hasHighBeauty: boolean
  hasElegant: boolean
  hasGraceful: boolean
  hasNoHarshness: boolean
  hasAesthetic: boolean
  hasNoBrutalism: boolean
  hasRefined: boolean
  hasNoCrudeness: boolean
  hasPolished: boolean
  hasNoRoughness: boolean
  harshnessCount: number
  crudenessCount: number
}

export interface BloomingMeasure {
  nightValue: number
  bloom: 'night-orchid' | 'moonflower' | 'evening-primrose' | 'twilight-jasmine' | 'shade-plant' | 'never-blooms'
  hasHighNightValue: boolean
  hasValuable: boolean
  hasNoDeadCode: boolean
  hasUseful: boolean
  hasNoWaste: boolean
  hasPurposeful: boolean
  hasNoOrphan: boolean
  hasMeaningful: boolean
  hasNoFiller: boolean
  hasEssential: boolean
  deadCodeCount: number
  fillerCount: number
}

export interface GuidingMeasure {
  light: number
  brightness: 'lighthouse-beam' | 'bright-star' | 'lantern-glow' | 'candle-flicker' | 'dying-ember' | 'darkness'
  hasHighLight: boolean
  hasDocumented: boolean
  hasExamples: boolean
  hasNoUndocumented: boolean
  hasClear: boolean
  hasNoMystery: boolean
  hasIlluminating: boolean
  hasNoShadow: boolean
  hasGuiding: boolean
  hasNoBlindSpot: boolean
  undocumentedCount: number
  mysteryCount: number
}

export type StarCondition =
  | 'celestial-masterpiece'
  | 'starlit-paradise'
  | 'moonlit-garden'
  | 'twilight-patch'
  | 'dark-corner'
  | 'lightless-void'

export interface StarFlower {
  file: string
  wonder: number
  constellationMapping: number
  celestialOrganization: number
  nocturnalBeauty: number
  nightBloom: number
  guidingLight: number
  wondrous: WondrousMeasure
  constellation: ConstellationMeasure
  celestial: CelestialMeasure
  nocturnal: NocturnalMeasure
  blooming: BloomingMeasure
  guiding: GuidingMeasure
  condition: StarCondition
  qualityScore: number
}

export type PlotType = 'royal-gardens' | 'botanical-garden' | 'cottage-garden' | 'window-box' | 'weed-patch' | 'barren-soil'
export type PlotCondition = 'paradise-under-stars' | 'beautiful-night-garden' | 'pleasant-evening-garden' | 'dimly-lit-patch' | 'dark-weeds' | 'lightless'

export interface GardenPlot {
  directory: string
  flowers: StarFlower[]
  avgWonder: number
  avgOrganization: number
  avgGuidingLight: number
  celestialMasterpieceCount: number
  lightlessVoidCount: number
  starlitCount: number
  moonlitCount: number
  plotType: PlotType
  condition: PlotCondition
}

export interface Observatory {
  avgWonder: number
  avgOrganization: number
  avgGuidingLight: number
  isWondrous: boolean
  overallLuminosity: number
}

export type AstronomerGrade = 'master-astronomer' | 'expert-stargazer' | 'skilled-observer' | 'amateur-astronomer' | 'casual-gazer' | 'cloudy-night'

export interface StarlitGardenStats {
  totalFiles: number
  totalPlots: number
  avgWonder: number
  avgConstellationMapping: number
  avgCelestialOrganization: number
  avgNocturnalBeauty: number
  avgNightBloom: number
  avgGuidingLight: number
  celestialMasterpieceCount: number
  starlitParadiseCount: number
  moonlitGardenCount: number
  twilightPatchCount: number
  darkCornerCount: number
  lightlessVoidCount: number
  hasHighInspirationCount: number
  hasHighMappingCount: number
  hasHighOrganizationCount: number
  hasHighBeautyCount: number
  hasHighNightValueCount: number
  hasHighLightCount: number
  overallLuminosity: number
  astronomerGrade: AstronomerGrade
  bestFlower: string
  mostInspiring: string
  bestOrganized: string
  bestStructured: string
  mostBeautiful: string
  bestDocumented: string
}

export interface StarlitGardenResult {
  flowers: StarFlower[]
  plots: GardenPlot[]
  observatory: Observatory
  stats: StarlitGardenStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureWondrous(content) evaluates code inspiration */
export function measureWondrous(content: string): WondrousMeasure {
  const hasExport = /export\s/.test(content)
  const hasAsync = /async\s/.test(content)
  const hasGeneric = /<\w+>/.test(content)
  const hasMap = /Map\s*</.test(content)
  const hasSet = /Set\s*</.test(content)
  const hasPromise = /Promise/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasDestructuring = /(?:const|let)\s*\{/.test(content) || /(?:const|let)\s*\[/.test(content)

  const ploddingMatches = content.match(/\bfor\s*\(/g)
  const ploddingCount = ploddingMatches ? ploddingMatches.length : 0
  const boringMatches = content.match(/\bvar\s+/g)
  const boringCount = boringMatches ? boringMatches.length : 0

  const hasClever = hasNullishCoalescing || hasOptionalChaining
  const hasElegant = hasDestructuring || hasGeneric
  const hasInnovative = hasMap || hasSet || hasPromise
  const hasBeautiful = hasExport && hasAsync
  const hasImpressive = hasGeneric && hasAsync && hasPromise

  let inspiration = 0
  if (hasExport) inspiration += 15
  if (hasAsync) inspiration += 10
  if (hasGeneric) inspiration += 12
  if (hasMap) inspiration += 8
  if (hasSet) inspiration += 5
  if (hasPromise) inspiration += 10
  if (hasNullishCoalescing) inspiration += 8
  if (hasOptionalChaining) inspiration += 7
  if (hasDestructuring) inspiration += 10
  if (hasClever) inspiration += 5
  if (hasElegant) inspiration += 5
  if (hasInnovative) inspiration += 5

  inspiration = Math.min(100, Math.round(inspiration))

  let awe: WondrousMeasure['awe'] = 'uninspiring'
  if (inspiration >= 85) awe = 'transcendent-wonder'
  else if (inspiration >= 70) awe = 'inspiring'
  else if (inspiration >= 55) awe = 'noteworthy'
  else if (inspiration >= 40) awe = 'pleasant'
  else if (inspiration >= 25) awe = 'ordinary'

  return {
    inspiration,
    awe,
    hasHighInspiration: inspiration >= 70,
    hasClever,
    hasElegant,
    hasNoPlodding: ploddingCount === 0,
    hasInnovative,
    hasNoBoring: boringCount === 0,
    hasBeautiful,
    hasNoUgly: !(/\beval\s*\(/.test(content)),
    hasImpressive,
    hasNoMediocre: inspiration >= 30,
    ploddingCount,
    boringCount,
  }
}

/** @example measureConstellation(content) evaluates code organization */
export function measureConstellation(content: string): ConstellationMeasure {
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDefaultExport = /export\s+default\s/.test(content)
  const hasImport = /import\s+/.test(content)

  const chaosMatches = content.match(/\bany\b/g)
  const chaosCount = chaosMatches ? chaosMatches.length : 0
  const randomnessMatches = content.match(/\bTODO\b|\bFIXME\b|\bHACK\b/g)
  const randomnessCount = randomnessMatches ? randomnessMatches.length : 0

  const hasOrganized = hasInterface || hasClass
  const hasPatterned = hasNamedExport && hasImport
  const hasStructured = hasClass && hasInterface
  const hasClear = hasTypeAlias || hasEnum
  const hasMapped = hasNamedExport || hasDefaultExport

  let mapping = 0
  if (hasInterface) mapping += 15
  if (hasClass) mapping += 15
  if (hasTypeAlias) mapping += 12
  if (hasEnum) mapping += 8
  if (hasNamedExport) mapping += 12
  if (hasDefaultExport) mapping += 5
  if (hasImport) mapping += 10
  if (hasOrganized) mapping += 5
  if (hasPatterned) mapping += 5
  if (hasStructured) mapping += 5
  if (hasClear) mapping += 3
  if (hasMapped) mapping += 5

  mapping = Math.min(100, Math.round(mapping))

  let pattern: ConstellationMeasure['pattern'] = 'void'
  if (mapping >= 85) pattern = 'perfect-constellation'
  else if (mapping >= 70) pattern = 'clear-star-map'
  else if (mapping >= 55) pattern = 'recognizable-pattern'
  else if (mapping >= 40) pattern = 'scattered-stars'
  else if (mapping >= 20) pattern = 'random-dots'

  return {
    mapping,
    pattern,
    hasHighMapping: mapping >= 70,
    hasOrganized,
    hasPatterned,
    hasNoChaos: chaosCount === 0,
    hasStructured,
    hasNoRandomness: randomnessCount === 0,
    hasClear,
    hasNoConfusion: chaosCount === 0 && randomnessCount === 0,
    hasMapped,
    hasNoWandering: randomnessCount === 0,
    chaosCount,
    randomnessCount,
  }
}

/** @example measureCelestial(content) evaluates code structure */
export function measureCelestial(content: string): CelestialMeasure {
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasExtends = /\bextends\s+/.test(content)
  const hasImplements = /\bimplements\s+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasProtected = /\bprotected\s+/.test(content)
  const hasPublic = /\bpublic\s+/.test(content)
  const hasStatic = /\bstatic\s+/.test(content)
  const hasReadonly = /\breadonly\s+/.test(content)
  const hasAbstract = /\babstract\s+/.test(content)
  const hasNamespace = /\bnamespace\s+/.test(content)

  const flatnessMatches = content.match(/^function\s+/m)
  const flatnessCount = flatnessMatches ? flatnessMatches.length : 0
  const mixedUpMatches = content.match(/\bany\b/g)
  const mixedUpCount = mixedUpMatches ? mixedUpMatches.length : 0

  const hasHierarchical = hasClass && (hasExtends || hasImplements)
  const hasLayered = hasPrivate || hasProtected
  const hasCategorized = hasStatic || hasReadonly
  const hasSystematic = hasClass && hasPrivate
  const hasOrdered = hasPublic || hasProtected || hasPrivate

  let organization = 0
  if (hasClass) organization += 15
  if (hasExtends) organization += 12
  if (hasImplements) organization += 10
  if (hasPrivate) organization += 8
  if (hasProtected) organization += 7
  if (hasPublic) organization += 5
  if (hasStatic) organization += 8
  if (hasReadonly) organization += 7
  if (hasAbstract) organization += 10
  if (hasNamespace) organization += 8
  if (hasHierarchical) organization += 5
  if (hasLayered) organization += 5

  organization = Math.min(100, Math.round(organization))

  let order: CelestialMeasure['order'] = 'chaotic-orbit'
  if (organization >= 85) order = 'celestial-harmony'
  else if (organization >= 70) order = 'orbital-precision'
  else if (organization >= 55) order = 'proper-orbits'
  else if (organization >= 40) order = 'drifting'
  else if (organization >= 25) order = 'tumbling'

  return {
    organization,
    order,
    hasHighOrganization: organization >= 70,
    hasHierarchical,
    hasLayered,
    hasNoFlatness: flatnessCount === 0,
    hasCategorized,
    hasNoMixedUp: mixedUpCount === 0,
    hasSystematic,
    hasNoAdHoc: flatnessCount === 0 && mixedUpCount === 0,
    hasOrdered,
    hasNoScrambled: mixedUpCount === 0,
    flatnessCount,
    mixedUpCount,
  }
}

/** @example measureNocturnal(content) evaluates code aesthetics */
export function measureNocturnal(content: string): NocturnalMeasure {
  const hasArrowFunctions = /=>\s*{/.test(content) || /=>\s*\S/.test(content)
  const hasTemplateLiterals = /`[^`]*\$\{/.test(content)
  const hasSpreadOperator = /\.\.\./.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasDestructuring = /(?:const|let)\s*\{/.test(content) || /(?:const|let)\s*\[/.test(content)
  const hasAsyncAwait = /async\s+/.test(content) && /await\s+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasConst = /\bconst\s+/.test(content)

  const harshnessMatches = content.match(/\b!important\b/g)
  const harshnessCount = harshnessMatches ? harshnessMatches.length : 0
  const crudenessMatches = content.match(/\beval\s*\(/g)
  const crudenessCount = crudenessMatches ? crudenessMatches.length : 0

  const hasElegant = hasArrowFunctions && hasDestructuring
  const hasGraceful = hasOptionalChaining || hasNullishCoalescing
  const hasAesthetic = hasTemplateLiterals || hasSpreadOperator
  const hasRefined = hasAsyncAwait && hasGenerics
  const hasPolished = hasConst && hasArrowFunctions

  let beauty = 0
  if (hasArrowFunctions) beauty += 12
  if (hasTemplateLiterals) beauty += 8
  if (hasSpreadOperator) beauty += 7
  if (hasOptionalChaining) beauty += 8
  if (hasNullishCoalescing) beauty += 7
  if (hasDestructuring) beauty += 10
  if (hasAsyncAwait) beauty += 10
  if (hasGenerics) beauty += 8
  if (hasConst) beauty += 5
  if (hasElegant) beauty += 5
  if (hasGraceful) beauty += 5
  if (hasAesthetic) beauty += 5
  if (hasRefined) beauty += 5
  if (hasPolished) beauty += 5

  beauty = Math.min(100, Math.round(beauty))

  let radiance: NocturnalMeasure['radiance'] = 'pitch-black'
  if (beauty >= 85) radiance = 'moonlit-splendor'
  else if (beauty >= 70) radiance = 'starlit-elegance'
  else if (beauty >= 55) radiance = 'twilight-charm'
  else if (beauty >= 40) radiance = 'dim-glow'
  else if (beauty >= 25) radiance = 'dark-shadow'

  return {
    beauty,
    radiance,
    hasHighBeauty: beauty >= 70,
    hasElegant,
    hasGraceful,
    hasNoHarshness: harshnessCount === 0,
    hasAesthetic,
    hasNoBrutalism: crudenessCount === 0,
    hasRefined,
    hasNoCrudeness: crudenessCount === 0,
    hasPolished,
    hasNoRoughness: harshnessCount === 0,
    harshnessCount,
    crudenessCount,
  }
}

/** @example measureBlooming(content) evaluates code value in dark areas */
export function measureBlooming(content: string): BloomingMeasure {
  const hasExport = /export\s/.test(content)
  const hasReturn = /\breturn\s+/.test(content)
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  const hasPromise = /Promise/.test(content)
  const hasAsync = /async\s+/.test(content)
  const hasFunction = /\bfunction\s+\w+/.test(content) || /=>\s*{/.test(content)
  const hasParams = /\([^)]+\)\s*:/.test(content)
  const hasErrorHandling = /throw\s+/.test(content) || /Error\b/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)

  const deadCodeMatches = content.match(/\/\/\s*(?:eslint-disable|ts-ignore|ts-expect-error)/g)
  const deadCodeCount = deadCodeMatches ? deadCodeMatches.length : 0
  const fillerMatches = content.match(/console\.(log|warn|error|debug)\s*\(/g)
  const fillerCount = fillerMatches ? fillerMatches.length : 0

  const hasValuable = hasExport && hasReturn
  const hasUseful = hasTryCatch || hasErrorHandling
  const hasPurposeful = hasFunction && hasExport
  const hasMeaningful = hasParams && hasTypeAnnotation
  const hasEssential = hasAsync && hasPromise

  let nightValue = 0
  if (hasExport) nightValue += 12
  if (hasReturn) nightValue += 8
  if (hasTryCatch) nightValue += 10
  if (hasPromise) nightValue += 8
  if (hasAsync) nightValue += 8
  if (hasFunction) nightValue += 7
  if (hasParams) nightValue += 7
  if (hasErrorHandling) nightValue += 8
  if (hasTypeAnnotation) nightValue += 7
  if (hasValuable) nightValue += 5
  if (hasPurposeful) nightValue += 5
  if (hasEssential) nightValue += 5
  if (hasUseful) nightValue += 5
  if (hasMeaningful) nightValue += 5

  nightValue = Math.min(100, Math.round(nightValue))

  let bloom: BloomingMeasure['bloom'] = 'never-blooms'
  if (nightValue >= 85) bloom = 'night-orchid'
  else if (nightValue >= 70) bloom = 'moonflower'
  else if (nightValue >= 55) bloom = 'evening-primrose'
  else if (nightValue >= 40) bloom = 'twilight-jasmine'
  else if (nightValue >= 25) bloom = 'shade-plant'

  return {
    nightValue,
    bloom,
    hasHighNightValue: nightValue >= 70,
    hasValuable,
    hasNoDeadCode: deadCodeCount === 0,
    hasUseful,
    hasNoWaste: fillerCount === 0,
    hasPurposeful,
    hasNoOrphan: deadCodeCount === 0,
    hasMeaningful,
    hasNoFiller: fillerCount === 0,
    hasEssential,
    deadCodeCount,
    fillerCount,
  }
}

/** @example measureGuiding(content) evaluates code documentation */
export function measureGuiding(content: string): GuidingMeasure {
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInlineComments = /\/\/.*$/.test(content)
  const hasExamples = /@example/.test(content)
  const hasParamDocs = /@param/.test(content)
  const hasReturnDocs = /@returns?/.test(content)
  const hasTypeDocs = /@type/.test(content)
  const hasThrowsDocs = /@throws/.test(content)
  const hasSeeDocs = /@see/.test(content)
  const hasDescription = /\/\*\*[\s\S]*?\*\//.test(content) && !/@param|@returns?|@type/.test(content)

  const undocumentedMatches = content.match(/\bfunction\s+\w+\s*\([^)]*\)\s*\{/g)
  const undocumentedCount = undocumentedMatches
    ? undocumentedMatches.filter((m) => {
        const idx = content.indexOf(m)
        const before = content.slice(Math.max(0, idx - 100))
        return !before.includes('/**')
      }).length
    : 0

  const mysteryMatches = content.match(/\bany\b/g)
  const mysteryCount = mysteryMatches ? mysteryMatches.length : 0

  const hasDocumented = hasDocComments
  const hasClear = hasParamDocs || hasReturnDocs
  const hasIlluminating = hasExamples || hasSeeDocs
  const hasGuiding = hasDocComments && hasInlineComments

  let light = 0
  if (hasDocComments) light += 18
  if (hasInlineComments) light += 7
  if (hasExamples) light += 12
  if (hasParamDocs) light += 10
  if (hasReturnDocs) light += 8
  if (hasTypeDocs) light += 5
  if (hasThrowsDocs) light += 7
  if (hasSeeDocs) light += 5
  if (hasDescription) light += 8
  if (hasDocumented) light += 5
  if (hasClear) light += 5
  if (hasIlluminating) light += 5
  if (hasGuiding) light += 7

  light = Math.min(100, Math.round(light))

  let brightness: GuidingMeasure['brightness'] = 'darkness'
  if (light >= 85) brightness = 'lighthouse-beam'
  else if (light >= 70) brightness = 'bright-star'
  else if (light >= 55) brightness = 'lantern-glow'
  else if (light >= 40) brightness = 'candle-flicker'
  else if (light >= 25) brightness = 'dying-ember'

  return {
    light,
    brightness,
    hasHighLight: light >= 70,
    hasDocumented,
    hasExamples,
    hasNoUndocumented: undocumentedCount === 0,
    hasClear,
    hasNoMystery: mysteryCount === 0,
    hasIlluminating,
    hasNoShadow: undocumentedCount === 0 && mysteryCount === 0,
    hasGuiding,
    hasNoBlindSpot: undocumentedCount === 0,
    undocumentedCount,
    mysteryCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'celestial-masterpiece' */
export function classifyCondition(score: number): StarCondition {
  if (score >= 85) return 'celestial-masterpiece'
  if (score >= 70) return 'starlit-paradise'
  if (score >= 55) return 'moonlit-garden'
  if (score >= 40) return 'twilight-patch'
  if (score >= 25) return 'dark-corner'
  return 'lightless-void'
}

/** @example classifyPlotType(flowers) returns plot classification */
export function classifyPlotType(flowers: StarFlower[]): PlotType {
  if (flowers.length === 0) return 'barren-soil'
  const avgQs = flowers.reduce((s, f) => s + f.qualityScore, 0) / flowers.length
  const masterCount = flowers.filter((f) => f.condition === 'celestial-masterpiece').length
  const ratio = masterCount / flowers.length
  if (avgQs >= 75 && ratio >= 0.5) return 'royal-gardens'
  if (avgQs >= 60) return 'botanical-garden'
  if (avgQs >= 40) return 'cottage-garden'
  if (avgQs >= 25) return 'window-box'
  if (avgQs >= 10) return 'weed-patch'
  return 'barren-soil'
}

/** @example classifyPlotCondition(avgQs) returns plot condition */
export function classifyPlotCondition(avgQs: number): PlotCondition {
  if (avgQs >= 75) return 'paradise-under-stars'
  if (avgQs >= 60) return 'beautiful-night-garden'
  if (avgQs >= 45) return 'pleasant-evening-garden'
  if (avgQs >= 30) return 'dimly-lit-patch'
  if (avgQs >= 15) return 'dark-weeds'
  return 'lightless'
}

/** @example classifyAstronomerGrade(80) returns 'master-astronomer' */
export function classifyAstronomerGrade(avgLuminosity: number): AstronomerGrade {
  if (avgLuminosity >= 80) return 'master-astronomer'
  if (avgLuminosity >= 65) return 'expert-stargazer'
  if (avgLuminosity >= 50) return 'skilled-observer'
  if (avgLuminosity >= 35) return 'amateur-astronomer'
  if (avgLuminosity >= 20) return 'casual-gazer'
  return 'cloudy-night'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeStarFlower(content, filePath) evaluates single file */
export function analyzeStarFlower(content: string, filePath: string): StarFlower {
  const wondrous = measureWondrous(content)
  const constellation = measureConstellation(content)
  const celestial = measureCelestial(content)
  const nocturnal = measureNocturnal(content)
  const blooming = measureBlooming(content)
  const guiding = measureGuiding(content)

  const qualityScore = Math.round(
    wondrous.inspiration * 0.2 +
    constellation.mapping * 0.15 +
    celestial.organization * 0.15 +
    nocturnal.beauty * 0.15 +
    blooming.nightValue * 0.15 +
    guiding.light * 0.2,
  )

  return {
    file: filePath,
    wonder: wondrous.inspiration,
    constellationMapping: constellation.mapping,
    celestialOrganization: celestial.organization,
    nocturnalBeauty: nocturnal.beauty,
    nightBloom: blooming.nightValue,
    guidingLight: guiding.light,
    wondrous,
    constellation,
    celestial,
    nocturnal,
    blooming,
    guiding,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeGardenPlot(flowers, dirPath) evaluates directory */
export function analyzeGardenPlot(flowers: StarFlower[], dirPath: string): GardenPlot {
  if (flowers.length === 0) {
    return {
      directory: dirPath,
      flowers: [],
      avgWonder: 0,
      avgOrganization: 0,
      avgGuidingLight: 0,
      celestialMasterpieceCount: 0,
      lightlessVoidCount: 0,
      starlitCount: 0,
      moonlitCount: 0,
      plotType: 'barren-soil',
      condition: 'lightless',
    }
  }

  const avgWonder = Math.round(flowers.reduce((s, f) => s + f.wonder, 0) / flowers.length)
  const avgOrganization = Math.round(flowers.reduce((s, f) => s + f.celestialOrganization, 0) / flowers.length)
  const avgGuidingLight = Math.round(flowers.reduce((s, f) => s + f.guidingLight, 0) / flowers.length)

  const celestialMasterpieceCount = flowers.filter((f) => f.condition === 'celestial-masterpiece').length
  const lightlessVoidCount = flowers.filter((f) => f.condition === 'lightless-void').length
  const starlitCount = flowers.filter((f) => f.condition === 'starlit-paradise').length
  const moonlitCount = flowers.filter((f) => f.condition === 'moonlit-garden').length

  const avgQs = flowers.reduce((s, f) => s + f.qualityScore, 0) / flowers.length

  return {
    directory: dirPath,
    flowers,
    avgWonder,
    avgOrganization,
    avgGuidingLight,
    celestialMasterpieceCount,
    lightlessVoidCount,
    starlitCount,
    moonlitCount,
    plotType: classifyPlotType(flowers),
    condition: classifyPlotCondition(avgQs),
  }
}

/** @example generateRecommendations(flowers, plots, observatory, stats) generates advice */
export function generateRecommendations(
  flowers: StarFlower[],
  plots: GardenPlot[],
  observatory: Observatory,
  stats: StarlitGardenStats,
): string[] {
  const recs: string[] = []

  if (observatory.avgWonder < 50) {
    recs.push('Consider using modern TypeScript patterns like optional chaining, nullish coalescing, and generics to boost code wonder')
  }
  if (stats.avgConstellationMapping < 50) {
    recs.push('Add interfaces, type aliases, and consistent exports to improve constellation mapping')
  }
  if (stats.avgCelestialOrganization < 50) {
    recs.push('Introduce class hierarchies with proper access modifiers for better celestial organization')
  }
  if (stats.avgNocturnalBeauty < 50) {
    recs.push('Adopt arrow functions, template literals, and destructuring to enhance nocturnal beauty')
  }
  if (stats.avgNightBloom < 50) {
    recs.push('Ensure all functions have proper error handling and return types to improve night bloom')
  }
  if (stats.avgGuidingLight < 50) {
    recs.push('Add JSDoc documentation with @param, @returns, and @example tags to brighten guiding light')
  }
  if (stats.lightlessVoidCount > 0) {
    recs.push(`${String(stats.lightlessVoidCount)} file(s) are in lightless-void condition — consider rewriting or documenting them`)
  }
  if (observatory.overallLuminosity < 40) {
    recs.push('Overall garden luminosity is low — prioritize documentation and modern patterns')
  }
  if (plots.length > 0 && plots.every((p) => p.plotType === 'barren-soil' || p.plotType === 'weed-patch')) {
    recs.push('All garden plots are barren or weedy — consider a major refactoring effort')
  }

  const voidFlowers = flowers.filter((f) => f.condition === 'lightless-void')
  if (voidFlowers.length > 0 && voidFlowers.length <= 3) {
    const names = voidFlowers.map((f) => f.file).join(', ')
    recs.push(`Focus on brightening these dark files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your starlit garden is flourishing beautifully! Keep nurturing your code')
  }

  return Array.from(new Set(recs))
}

/** @example buildStarlitGardenResult(files, contents, options) orchestrates analysis */
export function buildStarlitGardenResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): StarlitGardenResult {
  const flowers = files.map((file, i) => analyzeStarFlower(contents[i] ?? '', file))

  const plotMap = new Map<string, StarFlower[]>()
  for (const flower of flowers) {
    const dir = flower.file.includes('/') ? flower.file.split('/').slice(0, -1).join('/') : '.'
    const existing = plotMap.get(dir)
    if (existing) {
      existing.push(flower)
    } else {
      plotMap.set(dir, [flower])
    }
  }

  const plots = Array.from(plotMap.entries()).map(([dir, plotFlowers]) =>
    analyzeGardenPlot(plotFlowers, dir),
  )

  const totalFiles = flowers.length
  const avgWonder = totalFiles > 0 ? Math.round(flowers.reduce((s, f) => s + f.wonder, 0) / totalFiles) : 0
  const avgConstellationMapping = totalFiles > 0 ? Math.round(flowers.reduce((s, f) => s + f.constellationMapping, 0) / totalFiles) : 0
  const avgCelestialOrganization = totalFiles > 0 ? Math.round(flowers.reduce((s, f) => s + f.celestialOrganization, 0) / totalFiles) : 0
  const avgNocturnalBeauty = totalFiles > 0 ? Math.round(flowers.reduce((s, f) => s + f.nocturnalBeauty, 0) / totalFiles) : 0
  const avgNightBloom = totalFiles > 0 ? Math.round(flowers.reduce((s, f) => s + f.nightBloom, 0) / totalFiles) : 0
  const avgGuidingLight = totalFiles > 0 ? Math.round(flowers.reduce((s, f) => s + f.guidingLight, 0) / totalFiles) : 0

  const avgOrganization = totalFiles > 0 ? Math.round((avgConstellationMapping + avgCelestialOrganization) / 2) : 0
  const overallLuminosity = totalFiles > 0
    ? Math.round((avgWonder + avgOrganization + avgGuidingLight) / 3)
    : 0

  const observatory: Observatory = {
    avgWonder,
    avgOrganization,
    avgGuidingLight,
    isWondrous: avgWonder >= 60,
    overallLuminosity,
  }

  const celestialMasterpieceCount = flowers.filter((f) => f.condition === 'celestial-masterpiece').length
  const starlitParadiseCount = flowers.filter((f) => f.condition === 'starlit-paradise').length
  const moonlitGardenCount = flowers.filter((f) => f.condition === 'moonlit-garden').length
  const twilightPatchCount = flowers.filter((f) => f.condition === 'twilight-patch').length
  const darkCornerCount = flowers.filter((f) => f.condition === 'dark-corner').length
  const lightlessVoidCount = flowers.filter((f) => f.condition === 'lightless-void').length

  const bestFlower = totalFiles > 0
    ? flowers.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best), flowers[0]).file
    : ''
  const mostInspiring = totalFiles > 0
    ? flowers.reduce((best, f) => (f.wonder > best.wonder ? f : best), flowers[0]).file
    : ''
  const bestOrganized = totalFiles > 0
    ? flowers.reduce((best, f) => (f.constellationMapping > best.constellationMapping ? f : best), flowers[0]).file
    : ''
  const bestStructured = totalFiles > 0
    ? flowers.reduce((best, f) => (f.celestialOrganization > best.celestialOrganization ? f : best), flowers[0]).file
    : ''
  const mostBeautiful = totalFiles > 0
    ? flowers.reduce((best, f) => (f.nocturnalBeauty > best.nocturnalBeauty ? f : best), flowers[0]).file
    : ''
  const bestDocumented = totalFiles > 0
    ? flowers.reduce((best, f) => (f.guidingLight > best.guidingLight ? f : best), flowers[0]).file
    : ''

  const stats: StarlitGardenStats = {
    totalFiles,
    totalPlots: plots.length,
    avgWonder,
    avgConstellationMapping,
    avgCelestialOrganization,
    avgNocturnalBeauty,
    avgNightBloom,
    avgGuidingLight,
    celestialMasterpieceCount,
    starlitParadiseCount,
    moonlitGardenCount,
    twilightPatchCount,
    darkCornerCount,
    lightlessVoidCount,
    hasHighInspirationCount: flowers.filter((f) => f.wondrous.hasHighInspiration).length,
    hasHighMappingCount: flowers.filter((f) => f.constellation.hasHighMapping).length,
    hasHighOrganizationCount: flowers.filter((f) => f.celestial.hasHighOrganization).length,
    hasHighBeautyCount: flowers.filter((f) => f.nocturnal.hasHighBeauty).length,
    hasHighNightValueCount: flowers.filter((f) => f.blooming.hasHighNightValue).length,
    hasHighLightCount: flowers.filter((f) => f.guiding.hasHighLight).length,
    overallLuminosity,
    astronomerGrade: classifyAstronomerGrade(overallLuminosity),
    bestFlower,
    mostInspiring,
    bestOrganized,
    bestStructured,
    mostBeautiful,
    bestDocumented,
  }

  const recommendations = generateRecommendations(flowers, plots, observatory, stats)

  return { flowers, plots, observatory, stats, recommendations }
}
