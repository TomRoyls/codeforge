// ─── Types ─────────────────────────────────────────────────────────────────

export interface PathMeasure {
  quality: number
  condition: 'roman-road' | 'well-cobbled' | 'proper-stones' | 'uneven-cobbles' | 'dirt-path' | 'bog'
  hasHighQuality: boolean
  hasSmooth: boolean
  hasNoPotholes: boolean
  hasWellLaid: boolean
  hasNoDeadEnds: boolean
  hasConnected: boolean
  hasNoBroken: boolean
  hasComplete: boolean
  hasNoGaps: boolean
  hasPaved: boolean
  hasNoRough: boolean
  potholeCount: number
  deadEndCount: number
}

export interface JourneyMeasure {
  clarity: number
  view: 'moonlit-panorama' | 'clear-vista' | 'proper-sight' | 'misty-view' | 'foggy' | 'pitch-dark'
  hasHighClarity: boolean
  hasReadable: boolean
  hasObvious: boolean
  hasNoObfuscation: boolean
  hasClearFlow: boolean
  hasNoConfusion: boolean
  hasTransparent: boolean
  hasNoMystery: boolean
  hasSelfExplanatory: boolean
  hasNoSurprise: boolean
  hasGuiding: boolean
  obfuscationCount: number
  confusionCount: number
}

export interface StoneworkMeasure {
  craft: number
  quality: 'master-mason' | 'expert-craftsman' | 'skilled-worker' | 'adequate-builder' | 'amateur' | 'rubble'
  hasHighCraft: boolean
  hasWellBuilt: boolean
  hasSolid: boolean
  hasNoCracks: boolean
  hasDurable: boolean
  hasNoFragility: boolean
  hasProper: boolean
  hasNoSloppiness: boolean
  hasPolished: boolean
  hasNoRoughness: boolean
  hasMasterful: boolean
  crackCount: number
  sloppinessCount: number
}

export interface LanternMeasure {
  markers: number
  brightness: 'beacon-lit' | 'well-lit' | 'proper-lanterns' | 'dim-candles' | 'dying-embers' | 'darkness'
  hasHighMarkers: boolean
  hasDocumented: boolean
  hasMarked: boolean
  hasNoDarkSpots: boolean
  hasExamples: boolean
  hasNoUndocumented: boolean
  hasCommented: boolean
  hasNoBlindSpots: boolean
  hasGuided: boolean
  hasNoMystery: boolean
  darkSpotCount: number
  undocumentedCount: number
}

export interface SafetyMeasure {
  protection: number
  guardrail: 'fortress-walls' | 'proper-railings' | 'safety-rails' | 'warning-signs' | 'unguarded-edge' | 'cliff'
  hasHighProtection: boolean
  hasErrorHandling: boolean
  hasGuardrails: boolean
  hasNoCliffs: boolean
  hasDefensive: boolean
  hasNoExposure: boolean
  hasSafe: boolean
  hasNoCrash: boolean
  hasProtected: boolean
  hasNoVulnerability: boolean
  cliffCount: number
  crashCount: number
}

export interface WayfindingMeasure {
  navigation: number
  signage: 'perfect-signs' | 'clear-markers' | 'proper-directions' | 'vague-hints' | 'confusing' | 'labyrinth'
  hasHighNavigation: boolean
  hasSignposted: boolean
  hasNavigable: boolean
  hasNoMaze: boolean
  hasLandmarks: boolean
  hasNoRabbitHole: boolean
  hasOriented: boolean
  hasNoDisoriented: boolean
  hasMaplike: boolean
  hasNoTangle: boolean
  mazeCount: number
  rabbitHoleCount: number
}

export type StoneCondition = 'moonlit-promenade' | 'well-trodden-path' | 'cobblestone-lane' | 'winding-trail' | 'overgrown-path' | 'lost'

export interface Cobblestone {
  file: string
  pathQuality: number
  journeyClarity: number
  stoneworkCraft: number
  lanternMarkers: number
  travelerSafety: number
  wayfinding: number
  path: PathMeasure
  journey: JourneyMeasure
  stonework: StoneworkMeasure
  lantern: LanternMeasure
  safety: SafetyMeasure
  wayfindingMeasure: WayfindingMeasure
  condition: StoneCondition
  qualityScore: number
}

export type RowType = 'grand-boulevard' | 'market-street' | 'village-lane' | 'country-path' | 'overgrown-trail' | 'wilderness'
export type RowCondition = 'illuminated-avenue' | 'lit-street' | 'lantern-lit' | 'dim-alley' | 'dark-passage' | 'nowhere'

export interface CobblestoneRow {
  directory: string
  stones: Cobblestone[]
  avgPathQuality: number
  avgClarity: number
  avgWayfinding: number
  moonlitPromenadeCount: number
  lostCount: number
  wellTroddenCount: number
  cobblestoneLaneCount: number
  rowType: RowType
  condition: RowCondition
}

export interface MoonlitCity {
  avgPathQuality: number
  avgClarity: number
  avgWayfinding: number
  isNavigable: boolean
  overallNavigation: number
}

export type PathfinderGrade = 'grand-pathfinder' | 'master-guide' | 'skilled-navigator' | 'apprentice-guide' | 'lost-traveler' | 'blind-wanderer'

export interface MoonlitCobbleStats {
  totalFiles: number
  totalRows: number
  avgPathQuality: number
  avgJourneyClarity: number
  avgStoneworkCraft: number
  avgLanternMarkers: number
  avgTravelerSafety: number
  avgWayfinding: number
  moonlitPromenadeCount: number
  wellTroddenPathCount: number
  cobblestoneLaneCount: number
  windingTrailCount: number
  overgrownPathCount: number
  lostCount: number
  hasHighQualityCount: number
  hasHighClarityCount: number
  hasHighCraftCount: number
  hasHighMarkersCount: number
  hasHighProtectionCount: number
  hasHighNavigationCount: number
  overallNavigation: number
  pathfinderGrade: PathfinderGrade
  bestStone: string
  smoothestPath: string
  clearestJourney: string
  bestCrafted: string
  bestDocumented: string
  safestPath: string
}

export interface MoonlitCobbleResult {
  stones: Cobblestone[]
  rows: CobblestoneRow[]
  city: MoonlitCity
  stats: MoonlitCobbleStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measurePath(content) evaluates code execution paths */
export function measurePath(content: string): PathMeasure {
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

  const potholeMatches = content.match(/\bvar\s+/g)
  const potholeCount = potholeMatches ? potholeMatches.length : 0
  const deadEndMatches = content.match(/\bany\b/g)
  const deadEndCount = deadEndMatches ? deadEndMatches.length : 0

  const hasSmooth = hasConst && hasReturnType
  const hasWellLaid = hasExport && hasNamedExport
  const hasConnected = hasInterface && hasClass
  const hasComplete = hasStrictEquality && hasOptionalChaining
  const hasPaved = hasPrivate && hasReadonly

  let quality = 0
  if (hasExport) quality += 8
  if (hasConst) quality += 10
  if (hasReturnType) quality += 10
  if (hasInterface) quality += 8
  if (hasClass) quality += 8
  if (hasPrivate) quality += 8
  if (hasReadonly) quality += 8
  if (hasStrictEquality) quality += 10
  if (hasNamedExport) quality += 8
  if (hasOptionalChaining) quality += 8
  if (hasSmooth) quality += 5
  if (hasWellLaid) quality += 5
  if (hasConnected) quality += 5
  if (hasComplete) quality += 5
  if (hasPaved) quality += 5

  quality = Math.min(100, Math.round(quality))

  let condition: PathMeasure['condition'] = 'bog'
  if (quality >= 85) condition = 'roman-road'
  else if (quality >= 70) condition = 'well-cobbled'
  else if (quality >= 55) condition = 'proper-stones'
  else if (quality >= 40) condition = 'uneven-cobbles'
  else if (quality >= 25) condition = 'dirt-path'

  return {
    quality, condition,
    hasHighQuality: quality >= 70,
    hasSmooth, hasNoPotholes: potholeCount === 0,
    hasWellLaid, hasNoDeadEnds: deadEndCount === 0,
    hasConnected, hasNoBroken: potholeCount === 0,
    hasComplete, hasNoGaps: potholeCount === 0 && deadEndCount === 0,
    hasPaved, hasNoRough: potholeCount === 0,
    potholeCount, deadEndCount,
  }
}

/** @example measureJourney(content) evaluates code readability */
export function measureJourney(content: string): JourneyMeasure {
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

  const obfuscationMatches = content.match(/\bvar\s+/g)
  const obfuscationCount = obfuscationMatches ? obfuscationMatches.length : 0
  const confusionMatches = content.match(/\bany\b/g)
  const confusionCount = confusionMatches ? confusionMatches.length : 0

  const hasReadable = hasExport && hasReturnType
  const hasObvious = hasInterface && hasClass
  const hasClearFlow = hasConst && hasTypeAnnotation
  const hasTransparent = hasNamedExport && hasAsync
  const hasSelfExplanatory = hasImport && hasDocComments

  let clarity = 0
  if (hasExport) clarity += 10
  if (hasImport) clarity += 10
  if (hasReturnType) clarity += 10
  if (hasInterface) clarity += 8
  if (hasClass) clarity += 8
  if (hasConst) clarity += 8
  if (hasDocComments) clarity += 10
  if (hasTypeAnnotation) clarity += 8
  if (hasNamedExport) clarity += 8
  if (hasAsync) clarity += 8
  if (hasReadable) clarity += 5
  if (hasObvious) clarity += 5
  if (hasClearFlow) clarity += 5
  if (hasTransparent) clarity += 5
  if (hasSelfExplanatory) clarity += 5

  clarity = Math.min(100, Math.round(clarity))

  let view: JourneyMeasure['view'] = 'pitch-dark'
  if (clarity >= 85) view = 'moonlit-panorama'
  else if (clarity >= 70) view = 'clear-vista'
  else if (clarity >= 55) view = 'proper-sight'
  else if (clarity >= 40) view = 'misty-view'
  else if (clarity >= 25) view = 'foggy'

  return {
    clarity, view,
    hasHighClarity: clarity >= 70,
    hasReadable, hasObvious, hasNoObfuscation: obfuscationCount === 0,
    hasClearFlow, hasNoConfusion: confusionCount === 0,
    hasTransparent, hasNoMystery: obfuscationCount === 0,
    hasSelfExplanatory, hasNoSurprise: obfuscationCount === 0 && confusionCount === 0,
    hasGuiding: obfuscationCount === 0,
    obfuscationCount, confusionCount,
  }
}

/** @example measureStonework(content) evaluates code construction */
export function measureStonework(content: string): StoneworkMeasure {
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

  const crackMatches = content.match(/\bvar\s+/g)
  const crackCount = crackMatches ? crackMatches.length : 0
  const sloppinessMatches = content.match(/\bany\b/g)
  const sloppinessCount = sloppinessMatches ? sloppinessMatches.length : 0

  const hasWellBuilt = hasExport && hasReturnType
  const hasSolid = hasInterface && hasConst
  const hasDurable = hasPrivate && hasReadonly
  const hasProper = hasGenerics && hasTypeAlias
  const hasPolished = hasEnum && hasNamedExport

  let craft = 0
  if (hasExport) craft += 10
  if (hasInterface) craft += 10
  if (hasReturnType) craft += 10
  if (hasConst) craft += 8
  if (hasTypeAlias) craft += 8
  if (hasEnum) craft += 8
  if (hasGenerics) craft += 8
  if (hasPrivate) craft += 8
  if (hasReadonly) craft += 8
  if (hasNamedExport) craft += 10
  if (hasWellBuilt) craft += 5
  if (hasSolid) craft += 5
  if (hasDurable) craft += 5
  if (hasProper) craft += 5
  if (hasPolished) craft += 5

  craft = Math.min(100, Math.round(craft))

  let quality: StoneworkMeasure['quality'] = 'rubble'
  if (craft >= 85) quality = 'master-mason'
  else if (craft >= 70) quality = 'expert-craftsman'
  else if (craft >= 55) quality = 'skilled-worker'
  else if (craft >= 40) quality = 'adequate-builder'
  else if (craft >= 25) quality = 'amateur'

  return {
    craft, quality,
    hasHighCraft: craft >= 70,
    hasWellBuilt, hasSolid, hasNoCracks: crackCount === 0,
    hasDurable, hasNoFragility: sloppinessCount === 0,
    hasProper, hasNoSloppiness: crackCount === 0 && sloppinessCount === 0,
    hasPolished, hasNoRoughness: crackCount === 0,
    hasMasterful: crackCount === 0 && sloppinessCount === 0,
    crackCount, sloppinessCount,
  }
}

/** @example measureLantern(content) evaluates code documentation */
export function measureLantern(content: string): LanternMeasure {
  const hasExport = /export\s/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)

  const darkSpotMatches = content.match(/\bvar\s+/g)
  const darkSpotCount = darkSpotMatches ? darkSpotMatches.length : 0
  const undocumentedMatches = content.match(/\bany\b/g)
  const undocumentedCount = undocumentedMatches ? undocumentedMatches.length : 0

  const hasDocumented = hasDocComments && hasReturnType
  const hasMarked = hasExport && hasConst
  const hasExamples = hasInterface && hasClass
  const hasCommented = hasNamedExport && hasTypeAnnotation
  const hasGuided = hasPrivate && hasReadonly

  let markers = 0
  if (hasExport) markers += 8
  if (hasDocComments) markers += 15
  if (hasReturnType) markers += 10
  if (hasConst) markers += 8
  if (hasInterface) markers += 8
  if (hasClass) markers += 8
  if (hasNamedExport) markers += 8
  if (hasTypeAnnotation) markers += 8
  if (hasReadonly) markers += 8
  if (hasPrivate) markers += 8
  if (hasDocumented) markers += 5
  if (hasMarked) markers += 5
  if (hasExamples) markers += 5
  if (hasCommented) markers += 5
  if (hasGuided) markers += 5

  markers = Math.min(100, Math.round(markers))

  let brightness: LanternMeasure['brightness'] = 'darkness'
  if (markers >= 85) brightness = 'beacon-lit'
  else if (markers >= 70) brightness = 'well-lit'
  else if (markers >= 55) brightness = 'proper-lanterns'
  else if (markers >= 40) brightness = 'dim-candles'
  else if (markers >= 25) brightness = 'dying-embers'

  return {
    markers, brightness,
    hasHighMarkers: markers >= 70,
    hasDocumented, hasMarked, hasNoDarkSpots: darkSpotCount === 0,
    hasExamples, hasNoUndocumented: undocumentedCount === 0,
    hasCommented, hasNoBlindSpots: darkSpotCount === 0 && undocumentedCount === 0,
    hasGuided, hasNoMystery: darkSpotCount === 0,
    darkSpotCount, undocumentedCount,
  }
}

/** @example measureSafety(content) evaluates code error handling */
export function measureSafety(content: string): SafetyMeasure {
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

  const cliffMatches = content.match(/\bvar\s+/g)
  const cliffCount = cliffMatches ? cliffMatches.length : 0
  const crashMatches = content.match(/\bany\b/g)
  const crashCount = crashMatches ? crashMatches.length : 0

  const hasErrorHandling = hasTryCatch && hasAsync
  const hasGuardrails = hasReturnType && hasOptionalChaining
  const hasDefensive = hasNullishCoalescing && hasConst
  const hasSafe = hasInterface && hasDefaultParam
  const hasProtected = hasNamedExport && hasExport

  let protection = 0
  if (hasExport) protection += 8
  if (hasTryCatch) protection += 10
  if (hasReturnType) protection += 10
  if (hasOptionalChaining) protection += 10
  if (hasNullishCoalescing) protection += 8
  if (hasInterface) protection += 8
  if (hasAsync) protection += 8
  if (hasConst) protection += 8
  if (hasDefaultParam) protection += 8
  if (hasNamedExport) protection += 8
  if (hasErrorHandling) protection += 5
  if (hasGuardrails) protection += 5
  if (hasDefensive) protection += 5
  if (hasSafe) protection += 5
  if (hasProtected) protection += 5

  protection = Math.min(100, Math.round(protection))

  let guardrail: SafetyMeasure['guardrail'] = 'cliff'
  if (protection >= 85) guardrail = 'fortress-walls'
  else if (protection >= 70) guardrail = 'proper-railings'
  else if (protection >= 55) guardrail = 'safety-rails'
  else if (protection >= 40) guardrail = 'warning-signs'
  else if (protection >= 25) guardrail = 'unguarded-edge'

  return {
    protection, guardrail,
    hasHighProtection: protection >= 70,
    hasErrorHandling, hasGuardrails, hasNoCliffs: cliffCount === 0,
    hasDefensive, hasNoExposure: crashCount === 0,
    hasSafe, hasNoCrash: cliffCount === 0 && crashCount === 0,
    hasProtected, hasNoVulnerability: cliffCount === 0,
    cliffCount, crashCount,
  }
}

/** @example measureWayfinding(content) evaluates code navigation */
export function measureWayfinding(content: string): WayfindingMeasure {
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

  const mazeMatches = content.match(/\bvar\s+/g)
  const mazeCount = mazeMatches ? mazeMatches.length : 0
  const rabbitHoleMatches = content.match(/\bany\b/g)
  const rabbitHoleCount = rabbitHoleMatches ? rabbitHoleMatches.length : 0

  const hasSignposted = hasExport && hasConst
  const hasNavigable = hasReturnType && hasDocComments
  const hasLandmarks = hasInterface && hasClass
  const hasOriented = hasPrivate && hasReadonly
  const hasMaplike = hasNamedExport && hasTypeAnnotation

  let navigation = 0
  if (hasExport) navigation += 10
  if (hasInterface) navigation += 8
  if (hasClass) navigation += 8
  if (hasPrivate) navigation += 10
  if (hasReadonly) navigation += 8
  if (hasReturnType) navigation += 10
  if (hasConst) navigation += 8
  if (hasDocComments) navigation += 10
  if (hasNamedExport) navigation += 8
  if (hasTypeAnnotation) navigation += 8
  if (hasSignposted) navigation += 5
  if (hasNavigable) navigation += 5
  if (hasLandmarks) navigation += 5
  if (hasOriented) navigation += 5
  if (hasMaplike) navigation += 5

  navigation = Math.min(100, Math.round(navigation))

  let signage: WayfindingMeasure['signage'] = 'labyrinth'
  if (navigation >= 85) signage = 'perfect-signs'
  else if (navigation >= 70) signage = 'clear-markers'
  else if (navigation >= 55) signage = 'proper-directions'
  else if (navigation >= 40) signage = 'vague-hints'
  else if (navigation >= 25) signage = 'confusing'

  return {
    navigation, signage,
    hasHighNavigation: navigation >= 70,
    hasSignposted, hasNavigable, hasNoMaze: mazeCount === 0,
    hasLandmarks, hasNoRabbitHole: rabbitHoleCount === 0,
    hasOriented, hasNoDisoriented: mazeCount === 0,
    hasMaplike, hasNoTangle: mazeCount === 0 && rabbitHoleCount === 0,
    mazeCount, rabbitHoleCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'moonlit-promenade' */
export function classifyCondition(score: number): StoneCondition {
  if (score >= 85) return 'moonlit-promenade'
  if (score >= 70) return 'well-trodden-path'
  if (score >= 55) return 'cobblestone-lane'
  if (score >= 40) return 'winding-trail'
  if (score >= 25) return 'overgrown-path'
  return 'lost'
}

/** @example classifyRowType(stones) returns row classification */
export function classifyRowType(stones: Cobblestone[]): RowType {
  if (stones.length === 0) return 'wilderness'
  const avgQs = stones.reduce((s, st) => s + st.qualityScore, 0) / stones.length
  const promenadeCount = stones.filter((st) => st.condition === 'moonlit-promenade').length
  const ratio = promenadeCount / stones.length
  if (avgQs >= 75 && ratio >= 0.5) return 'grand-boulevard'
  if (avgQs >= 60) return 'market-street'
  if (avgQs >= 45) return 'village-lane'
  if (avgQs >= 30) return 'country-path'
  if (avgQs >= 15) return 'overgrown-trail'
  return 'wilderness'
}

/** @example classifyRowCondition(avgQs) returns row condition */
export function classifyRowCondition(avgQs: number): RowCondition {
  if (avgQs >= 75) return 'illuminated-avenue'
  if (avgQs >= 60) return 'lit-street'
  if (avgQs >= 45) return 'lantern-lit'
  if (avgQs >= 30) return 'dim-alley'
  if (avgQs >= 15) return 'dark-passage'
  return 'nowhere'
}

/** @example classifyPathfinderGrade(80) returns 'grand-pathfinder' */
export function classifyPathfinderGrade(avgNavigation: number): PathfinderGrade {
  if (avgNavigation >= 80) return 'grand-pathfinder'
  if (avgNavigation >= 65) return 'master-guide'
  if (avgNavigation >= 50) return 'skilled-navigator'
  if (avgNavigation >= 35) return 'apprentice-guide'
  if (avgNavigation >= 20) return 'lost-traveler'
  return 'blind-wanderer'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeCobblestone(content, filePath) evaluates single file */
export function analyzeCobblestone(content: string, filePath: string): Cobblestone {
  const pathMeasure = measurePath(content)
  const journeyMeasure = measureJourney(content)
  const stoneworkMeasure = measureStonework(content)
  const lanternMeasure = measureLantern(content)
  const safetyMeasure = measureSafety(content)
  const wayfindingMeasure = measureWayfinding(content)

  const qualityScore = Math.round(
    pathMeasure.quality * 0.2 +
    journeyMeasure.clarity * 0.15 +
    stoneworkMeasure.craft * 0.15 +
    lanternMeasure.markers * 0.15 +
    safetyMeasure.protection * 0.15 +
    wayfindingMeasure.navigation * 0.2,
  )

  return {
    file: filePath,
    pathQuality: pathMeasure.quality,
    journeyClarity: journeyMeasure.clarity,
    stoneworkCraft: stoneworkMeasure.craft,
    lanternMarkers: lanternMeasure.markers,
    travelerSafety: safetyMeasure.protection,
    wayfinding: wayfindingMeasure.navigation,
    path: pathMeasure,
    journey: journeyMeasure,
    stonework: stoneworkMeasure,
    lantern: lanternMeasure,
    safety: safetyMeasure,
    wayfindingMeasure,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeCobblestoneRow(stones, dirPath) evaluates directory */
export function analyzeCobblestoneRow(stones: Cobblestone[], dirPath: string): CobblestoneRow {
  if (stones.length === 0) {
    return {
      directory: dirPath, stones: [],
      avgPathQuality: 0, avgClarity: 0, avgWayfinding: 0,
      moonlitPromenadeCount: 0, lostCount: 0, wellTroddenCount: 0, cobblestoneLaneCount: 0,
      rowType: 'wilderness', condition: 'nowhere',
    }
  }

  const avgPathQuality = Math.round(stones.reduce((s, st) => s + st.pathQuality, 0) / stones.length)
  const avgClarity = Math.round(stones.reduce((s, st) => s + st.journeyClarity, 0) / stones.length)
  const avgWayfinding = Math.round(stones.reduce((s, st) => s + st.wayfinding, 0) / stones.length)
  const moonlitPromenadeCount = stones.filter((st) => st.condition === 'moonlit-promenade').length
  const lostCount = stones.filter((st) => st.condition === 'lost').length
  const wellTroddenCount = stones.filter((st) => st.condition === 'well-trodden-path').length
  const cobblestoneLaneCount = stones.filter((st) => st.condition === 'cobblestone-lane').length
  const avgQs = stones.reduce((s, st) => s + st.qualityScore, 0) / stones.length

  return {
    directory: dirPath, stones,
    avgPathQuality, avgClarity, avgWayfinding,
    moonlitPromenadeCount, lostCount, wellTroddenCount, cobblestoneLaneCount,
    rowType: classifyRowType(stones),
    condition: classifyRowCondition(avgQs),
  }
}

/** @example generateRecommendations(stones, rows, city, stats) generates advice */
export function generateRecommendations(
  stones: Cobblestone[],
  rows: CobblestoneRow[],
  city: MoonlitCity,
  stats: MoonlitCobbleStats,
): string[] {
  const recs: string[] = []

  if (stats.avgPathQuality < 50) {
    recs.push('Smooth code paths with const declarations, return types, and strict equality')
  }
  if (stats.avgJourneyClarity < 50) {
    recs.push('Clarify the journey with clear exports, documentation, and typed interfaces')
  }
  if (stats.avgStoneworkCraft < 50) {
    recs.push('Improve stonework with private fields, generics, and essential type patterns')
  }
  if (stats.avgLanternMarkers < 50) {
    recs.push('Light the way with JSDoc comments, return types, and thorough documentation')
  }
  if (stats.avgTravelerSafety < 50) {
    recs.push('Build guardrails with try/catch, optional chaining, and defensive coding')
  }
  if (stats.avgWayfinding < 50) {
    recs.push('Improve wayfinding with interfaces, classes, documentation, and clear landmarks')
  }
  if (stats.lostCount > 0) {
    recs.push(`${String(stats.lostCount)} file(s) are lost — consider significant refactoring`)
  }
  if (city.overallNavigation < 40) {
    recs.push('Overall navigation is poor — prioritize path quality and wayfinding')
  }
  if (rows.length > 0 && rows.every((r) => r.rowType === 'wilderness' || r.rowType === 'overgrown-trail')) {
    recs.push('All rows are overgrown — consider a major quality improvement effort')
  }

  const lostFiles = stones.filter((st) => st.condition === 'lost')
  if (lostFiles.length > 0 && lostFiles.length <= 3) {
    const names = lostFiles.map((st) => st.file).join(', ')
    recs.push(`Rescue these lost files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your code paths are moonlit perfection! Every cobblestone guides the way')
  }

  return Array.from(new Set(recs))
}

/** @example buildMoonlitCobbleResult(files, contents, options) orchestrates analysis */
export function buildMoonlitCobbleResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): MoonlitCobbleResult {
  const stones = files.map((file, i) => analyzeCobblestone(contents[i] ?? '', file))

  const rMap = new Map<string, Cobblestone[]>()
  for (const stone of stones) {
    const dir = stone.file.includes('/') ? stone.file.split('/').slice(0, -1).join('/') : '.'
    const existing = rMap.get(dir)
    if (existing) {
      existing.push(stone)
    } else {
      rMap.set(dir, [stone])
    }
  }

  const rows = Array.from(rMap.entries()).map(([dir, dirStones]) =>
    analyzeCobblestoneRow(dirStones, dir),
  )

  const totalFiles = stones.length
  const avgPathQuality = totalFiles > 0 ? Math.round(stones.reduce((s, st) => s + st.pathQuality, 0) / totalFiles) : 0
  const avgJourneyClarity = totalFiles > 0 ? Math.round(stones.reduce((s, st) => s + st.journeyClarity, 0) / totalFiles) : 0
  const avgStoneworkCraft = totalFiles > 0 ? Math.round(stones.reduce((s, st) => s + st.stoneworkCraft, 0) / totalFiles) : 0
  const avgLanternMarkers = totalFiles > 0 ? Math.round(stones.reduce((s, st) => s + st.lanternMarkers, 0) / totalFiles) : 0
  const avgTravelerSafety = totalFiles > 0 ? Math.round(stones.reduce((s, st) => s + st.travelerSafety, 0) / totalFiles) : 0
  const avgWayfinding = totalFiles > 0 ? Math.round(stones.reduce((s, st) => s + st.wayfinding, 0) / totalFiles) : 0

  const avgClarity = avgJourneyClarity

  const overallNavigation = totalFiles > 0
    ? Math.round((avgPathQuality + avgClarity + avgWayfinding) / 3)
    : 0

  const city: MoonlitCity = {
    avgPathQuality, avgClarity, avgWayfinding,
    isNavigable: avgPathQuality >= 60,
    overallNavigation,
  }

  const bestStone = totalFiles > 0
    ? stones.reduce((best, st) => (st.qualityScore > best.qualityScore ? st : best), stones[0]).file
    : ''
  const smoothestPath = totalFiles > 0
    ? stones.reduce((best, st) => (st.pathQuality > best.pathQuality ? st : best), stones[0]).file
    : ''
  const clearestJourney = totalFiles > 0
    ? stones.reduce((best, st) => (st.journeyClarity > best.journeyClarity ? st : best), stones[0]).file
    : ''
  const bestCrafted = totalFiles > 0
    ? stones.reduce((best, st) => (st.stoneworkCraft > best.stoneworkCraft ? st : best), stones[0]).file
    : ''
  const bestDocumented = totalFiles > 0
    ? stones.reduce((best, st) => (st.lanternMarkers > best.lanternMarkers ? st : best), stones[0]).file
    : ''
  const safestPath = totalFiles > 0
    ? stones.reduce((best, st) => (st.travelerSafety > best.travelerSafety ? st : best), stones[0]).file
    : ''

  const stats: MoonlitCobbleStats = {
    totalFiles,
    totalRows: rows.length,
    avgPathQuality, avgJourneyClarity, avgStoneworkCraft,
    avgLanternMarkers, avgTravelerSafety, avgWayfinding,
    moonlitPromenadeCount: stones.filter((st) => st.condition === 'moonlit-promenade').length,
    wellTroddenPathCount: stones.filter((st) => st.condition === 'well-trodden-path').length,
    cobblestoneLaneCount: stones.filter((st) => st.condition === 'cobblestone-lane').length,
    windingTrailCount: stones.filter((st) => st.condition === 'winding-trail').length,
    overgrownPathCount: stones.filter((st) => st.condition === 'overgrown-path').length,
    lostCount: stones.filter((st) => st.condition === 'lost').length,
    hasHighQualityCount: stones.filter((st) => st.path.hasHighQuality).length,
    hasHighClarityCount: stones.filter((st) => st.journey.hasHighClarity).length,
    hasHighCraftCount: stones.filter((st) => st.stonework.hasHighCraft).length,
    hasHighMarkersCount: stones.filter((st) => st.lantern.hasHighMarkers).length,
    hasHighProtectionCount: stones.filter((st) => st.safety.hasHighProtection).length,
    hasHighNavigationCount: stones.filter((st) => st.wayfindingMeasure.hasHighNavigation).length,
    overallNavigation,
    pathfinderGrade: classifyPathfinderGrade(overallNavigation),
    bestStone, smoothestPath, clearestJourney, bestCrafted, bestDocumented, safestPath,
  }

  const recommendations = generateRecommendations(stones, rows, city, stats)

  return { stones, rows, city, stats, recommendations }
}
