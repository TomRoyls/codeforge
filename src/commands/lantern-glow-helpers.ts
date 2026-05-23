// ─── Types ─────────────────────────────────────────────────────────────────

export interface IlluminatedMeasure {
  clarity: number
  brightness: 'blazing-light' | 'bright-glow' | 'steady-flame' | 'flickering' | 'dim-glow' | 'extinguished'
  hasHighClarity: boolean
  hasReadable: boolean
  hasClearNaming: boolean
  hasNoObfuscation: boolean
  hasSelfDocumenting: boolean
  hasNoDarkness: boolean
  hasTransparent: boolean
  hasNoMystery: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  darknessCount: number
  mysteryCount: number
}

export interface WarmMeasure {
  approachability: number
  feeling: 'hearth-fire' | 'warm-welcome' | 'friendly-glow' | 'neutral-light' | 'cold-fluorescent' | 'sterile'
  hasHighApproachability: boolean
  hasInviting: boolean
  hasFriendly: boolean
  hasNoHostility: boolean
  hasWelcoming: boolean
  hasNoIntimidation: boolean
  hasComfortable: boolean
  hasNoHarshness: boolean
  hasGentle: boolean
  hasNoBrutalism: boolean
  hostilityCount: number
  intimidationCount: number
}

export interface GuidingMeasure {
  direction: number
  quality: 'lighthouse-beam' | 'clear-signpost' | 'reliable-compass' | 'vague-hint' | 'misleading-trail' | 'no-guide'
  hasHighDirection: boolean
  hasDocumented: boolean
  hasExamples: boolean
  hasNoUndocumented: boolean
  hasClearInstructions: boolean
  hasNoConfusion: boolean
  hasGuiding: boolean
  hasNoDeadEnd: boolean
  hasProperFlow: boolean
  hasNoOrphan: boolean
  undocumentedCount: number
  confusionCount: number
}

export interface EfficientMeasure {
  performance: number
  consumption: 'perfect-burn' | 'efficient-flame' | 'proper-combustion' | 'wasteful-burn' | 'smoky' | 'burning-out'
  hasHighPerformance: boolean
  hasOptimized: boolean
  hasNoWaste: boolean
  hasEfficient: boolean
  hasNoRedundancy: boolean
  hasLean: boolean
  hasNoBloat: boolean
  hasMinimal: boolean
  hasNoExcess: boolean
  hasTargeted: boolean
  wasteCount: number
  bloatCount: number
}

export interface ReachingMeasure {
  scope: number
  coverage: 'far-reaching' | 'wide-glow' | 'proper-radius' | 'limited-reach' | 'narrow-beam' | 'pocket-light'
  hasHighScope: boolean
  hasBroad: boolean
  hasReusable: boolean
  hasNoNarrow: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasGeneral: boolean
  hasNoSpecific: boolean
  hasAdaptable: boolean
  hasNoBrittle: boolean
  narrowCount: number
  specificCount: number
}

export interface ShadowMeasure {
  management: number
  control: 'shadow-master' | 'controlled-shadows' | 'managed-darkness' | 'lurking-shadows' | 'shadow-overrun' | 'total-darkness'
  hasHighManagement: boolean
  hasErrorHandling: boolean
  hasCaught: boolean
  hasNoUncaught: boolean
  hasEdgeCases: boolean
  hasNoSurprises: boolean
  hasDefensive: boolean
  hasNoBare: boolean
  hasGraceful: boolean
  hasNoCrash: boolean
  uncaughtCount: number
  surpriseCount: number
}

export type FlameCondition = 'beacon-light' | 'steady-lantern' | 'flickering-flame' | 'dying-ember' | 'smoking-wick' | 'darkness'

export interface LanternFlame {
  file: string
  illumination: number
  warmth: number
  guidance: number
  fuelEfficiency: number
  glowReach: number
  shadowManagement: number
  illuminated: IlluminatedMeasure
  warm: WarmMeasure
  guiding: GuidingMeasure
  efficient: EfficientMeasure
  reaching: ReachingMeasure
  shadow: ShadowMeasure
  condition: FlameCondition
  qualityScore: number
}

export type RowType = 'illuminated-path' | 'lantern-lined-street' | 'spotty-lighting' | 'dim-corridor' | 'dark-alley' | 'pitch-black'
export type RowCondition = 'well-lit-path' | 'navigable-trail' | 'dimly-lit' | 'shadowy-path' | 'groping-in-dark' | 'lost'

export interface LanternRow {
  directory: string
  flames: LanternFlame[]
  avgIllumination: number
  avgGuidance: number
  avgEfficiency: number
  beaconCount: number
  darknessCount: number
  steadyCount: number
  flickeringCount: number
  rowType: RowType
  condition: RowCondition
}

export interface Village {
  avgIllumination: number
  avgGuidance: number
  avgEfficiency: number
  isBright: boolean
  overallIllumination: number
}

export type LamplighterGrade = 'master-lamplighter' | 'expert-lightkeeper' | 'skilled-lamplighter' | 'apprentice' | 'novice' | 'arsonist'

export interface LanternGlowStats {
  totalFiles: number
  totalRows: number
  avgIllumination: number
  avgWarmth: number
  avgGuidance: number
  avgFuelEfficiency: number
  avgGlowReach: number
  avgShadowManagement: number
  beaconLightCount: number
  steadyLanternCount: number
  flickeringFlameCount: number
  dyingEmberCount: number
  smokingWickCount: number
  darknessCount: number
  hasHighClarityCount: number
  hasHighApproachabilityCount: number
  hasHighDirectionCount: number
  hasHighPerformanceCount: number
  hasHighScopeCount: number
  hasHighManagementCount: number
  overallIllumination: number
  lamplighterGrade: LamplighterGrade
  bestFlame: string
  brightest: string
  warmest: string
  bestGuided: string
  mostEfficient: string
  farthestReaching: string
}

export interface LanternGlowResult {
  flames: LanternFlame[]
  rows: LanternRow[]
  village: Village
  stats: LanternGlowStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureIlluminated(content) evaluates code clarity */
export function measureIlluminated(content: string): IlluminatedMeasure {
  const hasConst = /\bconst\s+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)

  const darknessMatches = content.match(/\bvar\s+/g)
  const darknessCount = darknessMatches ? darknessMatches.length : 0
  const mysteryMatches = content.match(/\bany\b/g)
  const mysteryCount = mysteryMatches ? mysteryMatches.length : 0

  const hasReadable = hasConst && hasTypeAnnotation
  const hasClearNaming = hasInterface || hasEnum
  const hasSelfDocumenting = hasReturnType && hasTypeAnnotation
  const hasTransparent = hasReadonly && hasConst
  const hasVisible = hasOptionalChaining || hasNullishCoalescing

  let clarity = 0
  if (hasConst) clarity += 10
  if (hasTypeAnnotation) clarity += 10
  if (hasReturnType) clarity += 10
  if (hasInterface) clarity += 8
  if (hasReadonly) clarity += 8
  if (hasOptionalChaining) clarity += 7
  if (hasNullishCoalescing) clarity += 7
  if (hasGenerics) clarity += 8
  if (hasEnum) clarity += 7
  if (hasReadable) clarity += 5
  if (hasClearNaming) clarity += 5
  if (hasSelfDocumenting) clarity += 5
  if (hasTransparent) clarity += 5
  if (hasVisible) clarity += 5

  clarity = Math.min(100, Math.round(clarity))

  let brightness: IlluminatedMeasure['brightness'] = 'extinguished'
  if (clarity >= 85) brightness = 'blazing-light'
  else if (clarity >= 70) brightness = 'bright-glow'
  else if (clarity >= 55) brightness = 'steady-flame'
  else if (clarity >= 40) brightness = 'flickering'
  else if (clarity >= 25) brightness = 'dim-glow'

  return {
    clarity,
    brightness,
    hasHighClarity: clarity >= 70,
    hasReadable,
    hasClearNaming,
    hasNoObfuscation: mysteryCount === 0,
    hasSelfDocumenting,
    hasNoDarkness: darknessCount === 0,
    hasTransparent,
    hasNoMystery: mysteryCount === 0 && darknessCount === 0,
    hasVisible,
    hasNoHidden: darknessCount === 0,
    darknessCount,
    mysteryCount,
  }
}

/** @example measureWarm(content) evaluates code approachability */
export function measureWarm(content: string): WarmMeasure {
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasExport = /export\s/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasOptionalParam = /\w+\?\s*[):\]]/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)

  const hostilityMatches = content.match(/\bvar\s+/g)
  const hostilityCount = hostilityMatches ? hostilityMatches.length : 0
  const intimidationMatches = content.match(/\bany\b/g)
  const intimidationCount = intimidationMatches ? intimidationMatches.length : 0

  const hasInviting = hasExport && hasNamedExport
  const hasFriendly = hasOptionalChaining && hasNullishCoalescing
  const hasWelcoming = hasDefaultParam || hasOptionalParam
  const hasComfortable = hasDocComments && hasInterface
  const hasGentle = hasAsync && hasOptionalChaining

  let approachability = 0
  if (hasDocComments) approachability += 10
  if (hasExport) approachability += 8
  if (hasNamedExport) approachability += 8
  if (hasDefaultParam) approachability += 7
  if (hasOptionalChaining) approachability += 8
  if (hasNullishCoalescing) approachability += 7
  if (hasOptionalParam) approachability += 7
  if (hasInterface) approachability += 8
  if (hasTypeAlias) approachability += 7
  if (hasAsync) approachability += 5
  if (hasInviting) approachability += 5
  if (hasFriendly) approachability += 5
  if (hasWelcoming) approachability += 5
  if (hasComfortable) approachability += 5
  if (hasGentle) approachability += 5

  approachability = Math.min(100, Math.round(approachability))

  let feeling: WarmMeasure['feeling'] = 'sterile'
  if (approachability >= 85) feeling = 'hearth-fire'
  else if (approachability >= 70) feeling = 'warm-welcome'
  else if (approachability >= 55) feeling = 'friendly-glow'
  else if (approachability >= 40) feeling = 'neutral-light'
  else if (approachability >= 25) feeling = 'cold-fluorescent'

  return {
    approachability,
    feeling,
    hasHighApproachability: approachability >= 70,
    hasInviting,
    hasFriendly,
    hasNoHostility: hostilityCount === 0,
    hasWelcoming,
    hasNoIntimidation: intimidationCount === 0,
    hasComfortable,
    hasNoHarshness: hostilityCount === 0 && intimidationCount === 0,
    hasGentle,
    hasNoBrutalism: hostilityCount === 0,
    hostilityCount,
    intimidationCount,
  }
}

/** @example measureGuiding(content) evaluates code documentation */
export function measureGuiding(content: string): GuidingMeasure {
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInlineDoc = /\/\/.*$/.test(content)
  const hasExport = /export\s/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasExamples = /@example/.test(content)
  const hasParamDoc = /@param/.test(content)
  const hasReturnsDoc = /@returns/.test(content)

  const undocumentedMatches = content.match(/\bTODO\b|\bFIXME\b/g)
  const undocumentedCount = undocumentedMatches ? undocumentedMatches.length : 0
  const confusionMatches = content.match(/\bany\b/g)
  const confusionCount = confusionMatches ? confusionMatches.length : 0

  const hasDocumented = hasDocComments && hasExport
  const hasClearInstructions = hasReturnType && hasTypeAnnotation
  const hasGuiding = hasParamDoc || hasReturnsDoc
  const hasProperFlow = hasInterface && hasNamedExport

  let direction = 0
  if (hasDocComments) direction += 12
  if (hasInlineDoc) direction += 5
  if (hasExport) direction += 8
  if (hasReturnType) direction += 10
  if (hasTypeAnnotation) direction += 8
  if (hasInterface) direction += 8
  if (hasNamedExport) direction += 7
  if (hasExamples) direction += 10
  if (hasParamDoc) direction += 8
  if (hasReturnsDoc) direction += 7
  if (hasDocumented) direction += 5
  if (hasClearInstructions) direction += 5
  if (hasGuiding) direction += 5
  if (hasProperFlow) direction += 5

  direction = Math.min(100, Math.round(direction))

  let quality: GuidingMeasure['quality'] = 'no-guide'
  if (direction >= 85) quality = 'lighthouse-beam'
  else if (direction >= 70) quality = 'clear-signpost'
  else if (direction >= 55) quality = 'reliable-compass'
  else if (direction >= 40) quality = 'vague-hint'
  else if (direction >= 25) quality = 'misleading-trail'

  return {
    direction,
    quality,
    hasHighDirection: direction >= 70,
    hasDocumented,
    hasExamples,
    hasNoUndocumented: undocumentedCount === 0,
    hasClearInstructions,
    hasNoConfusion: confusionCount === 0,
    hasGuiding,
    hasNoDeadEnd: undocumentedCount === 0,
    hasProperFlow,
    hasNoOrphan: confusionCount === 0,
    undocumentedCount,
    confusionCount,
  }
}

/** @example measureEfficient(content) evaluates code performance */
export function measureEfficient(content: string): EfficientMeasure {
  const hasConst = /\bconst\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)

  const wasteMatches = content.match(/\bvar\s+/g)
  const wasteCount = wasteMatches ? wasteMatches.length : 0
  const bloatMatches = content.match(/\bconsole\.\w+\s*\(/g)
  const bloatCount = bloatMatches ? bloatMatches.length : 0

  const hasOptimized = hasConst && hasStrictEquality
  const hasEfficient = hasOptionalChaining && hasNullishCoalescing
  const hasLean = hasReadonly && hasConst
  const hasMinimal = hasReturnType && hasTypeAnnotation
  const hasTargeted = hasGenerics && hasEnum

  let performance = 0
  if (hasConst) performance += 10
  if (hasReadonly) performance += 8
  if (hasReturnType) performance += 10
  if (hasTypeAnnotation) performance += 8
  if (hasStrictEquality) performance += 10
  if (hasOptionalChaining) performance += 7
  if (hasNullishCoalescing) performance += 7
  if (hasInterface) performance += 8
  if (hasGenerics) performance += 8
  if (hasEnum) performance += 7
  if (hasOptimized) performance += 5
  if (hasEfficient) performance += 5
  if (hasLean) performance += 5
  if (hasMinimal) performance += 5
  if (hasTargeted) performance += 5

  performance = Math.min(100, Math.round(performance))

  let consumption: EfficientMeasure['consumption'] = 'burning-out'
  if (performance >= 85) consumption = 'perfect-burn'
  else if (performance >= 70) consumption = 'efficient-flame'
  else if (performance >= 55) consumption = 'proper-combustion'
  else if (performance >= 40) consumption = 'wasteful-burn'
  else if (performance >= 25) consumption = 'smoky'

  return {
    performance,
    consumption,
    hasHighPerformance: performance >= 70,
    hasOptimized,
    hasNoWaste: wasteCount === 0,
    hasEfficient,
    hasNoRedundancy: bloatCount === 0,
    hasLean,
    hasNoBloat: bloatCount === 0,
    hasMinimal,
    hasNoExcess: wasteCount === 0 && bloatCount === 0,
    hasTargeted,
    wasteCount,
    bloatCount,
  }
}

/** @example measureReaching(content) evaluates code scope */
export function measureReaching(content: string): ReachingMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasAsync = /\basync\s+/.test(content)

  const narrowMatches = content.match(/\bvar\s+/g)
  const narrowCount = narrowMatches ? narrowMatches.length : 0
  const specificMatches = content.match(/\bany\b/g)
  const specificCount = specificMatches ? specificMatches.length : 0

  const hasBroad = hasExport && hasImport
  const hasReusable = hasInterface && hasGenerics
  const hasFlexible = hasTypeAlias && hasEnum
  const hasGeneral = hasNamedExport && hasClass
  const hasAdaptable = hasReadonly && hasAsync

  let scope = 0
  if (hasExport) scope += 10
  if (hasImport) scope += 8
  if (hasInterface) scope += 10
  if (hasGenerics) scope += 10
  if (hasTypeAlias) scope += 8
  if (hasNamedExport) scope += 8
  if (hasClass) scope += 7
  if (hasEnum) scope += 7
  if (hasReadonly) scope += 7
  if (hasAsync) scope += 5
  if (hasBroad) scope += 5
  if (hasReusable) scope += 5
  if (hasFlexible) scope += 5
  if (hasGeneral) scope += 5
  if (hasAdaptable) scope += 5

  scope = Math.min(100, Math.round(scope))

  let coverage: ReachingMeasure['coverage'] = 'pocket-light'
  if (scope >= 85) coverage = 'far-reaching'
  else if (scope >= 70) coverage = 'wide-glow'
  else if (scope >= 55) coverage = 'proper-radius'
  else if (scope >= 40) coverage = 'limited-reach'
  else if (scope >= 25) coverage = 'narrow-beam'

  return {
    scope,
    coverage,
    hasHighScope: scope >= 70,
    hasBroad,
    hasReusable,
    hasNoNarrow: narrowCount === 0,
    hasFlexible,
    hasNoRigid: narrowCount === 0 && specificCount === 0,
    hasGeneral,
    hasNoSpecific: specificCount === 0,
    hasAdaptable,
    hasNoBrittle: narrowCount === 0,
    narrowCount,
    specificCount,
  }
}

/** @example measureShadow(content) evaluates code error handling */
export function measureShadow(content: string): ShadowMeasure {
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  const hasThrow = /\bthrow\s+/.test(content)
  const hasErrorType = /Error\b/.test(content)
  const hasFinally = /finally\s*\{/.test(content)
  const hasPromiseCatch = /\.catch\s*\(/.test(content)
  const hasNullCheck = /\?\.\w/.test(content) || /!==?\s*null/.test(content)
  const hasUndefinedCheck = /!==?\s*undefined/.test(content)
  const hasTypeofCheck = /typeof\s+\w+\s*[!=]==?\s*['"]/.test(content)
  const hasInstanceof = /\binstanceof\b/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)

  const uncaughtMatches = content.match(/\bany\b/g)
  const uncaughtCount = uncaughtMatches ? uncaughtMatches.length : 0
  const surpriseMatches = content.match(/\bprocess\.exit\b/g)
  const surpriseCount = surpriseMatches ? surpriseMatches.length : 0

  const hasCaught = hasTryCatch && hasThrow
  const hasEdgeCases = hasNullCheck || hasUndefinedCheck
  const hasDefensive = hasTypeofCheck || hasInstanceof
  const hasGraceful = hasFinally || hasPromiseCatch

  let management = 0
  if (hasTryCatch) management += 12
  if (hasThrow) management += 10
  if (hasErrorType) management += 8
  if (hasFinally) management += 8
  if (hasPromiseCatch) management += 8
  if (hasNullCheck) management += 8
  if (hasUndefinedCheck) management += 7
  if (hasTypeofCheck) management += 7
  if (hasInstanceof) management += 7
  if (hasDefaultParam) management += 5
  if (hasCaught) management += 5
  if (hasEdgeCases) management += 5
  if (hasDefensive) management += 5
  if (hasGraceful) management += 5

  management = Math.min(100, Math.round(management))

  let control: ShadowMeasure['control'] = 'total-darkness'
  if (management >= 85) control = 'shadow-master'
  else if (management >= 70) control = 'controlled-shadows'
  else if (management >= 55) control = 'managed-darkness'
  else if (management >= 40) control = 'lurking-shadows'
  else if (management >= 25) control = 'shadow-overrun'

  return {
    management,
    control,
    hasHighManagement: management >= 70,
    hasErrorHandling: hasTryCatch || hasThrow,
    hasCaught,
    hasNoUncaught: uncaughtCount === 0,
    hasEdgeCases,
    hasNoSurprises: surpriseCount === 0,
    hasDefensive,
    hasNoBare: uncaughtCount === 0,
    hasGraceful,
    hasNoCrash: surpriseCount === 0,
    uncaughtCount,
    surpriseCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'beacon-light' */
export function classifyCondition(score: number): FlameCondition {
  if (score >= 85) return 'beacon-light'
  if (score >= 70) return 'steady-lantern'
  if (score >= 55) return 'flickering-flame'
  if (score >= 40) return 'dying-ember'
  if (score >= 25) return 'smoking-wick'
  return 'darkness'
}

/** @example classifyRowType(flames) returns row classification */
export function classifyRowType(flames: LanternFlame[]): RowType {
  if (flames.length === 0) return 'pitch-black'
  const avgQs = flames.reduce((s, f) => s + f.qualityScore, 0) / flames.length
  const beaconCount = flames.filter((f) => f.condition === 'beacon-light').length
  const ratio = beaconCount / flames.length
  if (avgQs >= 75 && ratio >= 0.5) return 'illuminated-path'
  if (avgQs >= 60) return 'lantern-lined-street'
  if (avgQs >= 45) return 'spotty-lighting'
  if (avgQs >= 30) return 'dim-corridor'
  if (avgQs >= 15) return 'dark-alley'
  return 'pitch-black'
}

/** @example classifyRowCondition(avgQs) returns row condition */
export function classifyRowCondition(avgQs: number): RowCondition {
  if (avgQs >= 75) return 'well-lit-path'
  if (avgQs >= 60) return 'navigable-trail'
  if (avgQs >= 45) return 'dimly-lit'
  if (avgQs >= 30) return 'shadowy-path'
  if (avgQs >= 15) return 'groping-in-dark'
  return 'lost'
}

/** @example classifyLamplighterGrade(80) returns 'master-lamplighter' */
export function classifyLamplighterGrade(avgIllumination: number): LamplighterGrade {
  if (avgIllumination >= 80) return 'master-lamplighter'
  if (avgIllumination >= 65) return 'expert-lightkeeper'
  if (avgIllumination >= 50) return 'skilled-lamplighter'
  if (avgIllumination >= 35) return 'apprentice'
  if (avgIllumination >= 20) return 'novice'
  return 'arsonist'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeLanternFlame(content, filePath) evaluates single file */
export function analyzeLanternFlame(content: string, filePath: string): LanternFlame {
  const illuminated = measureIlluminated(content)
  const warm = measureWarm(content)
  const guiding = measureGuiding(content)
  const efficient = measureEfficient(content)
  const reaching = measureReaching(content)
  const shadow = measureShadow(content)

  const qualityScore = Math.round(
    illuminated.clarity * 0.2 +
    warm.approachability * 0.15 +
    guiding.direction * 0.15 +
    efficient.performance * 0.15 +
    reaching.scope * 0.15 +
    shadow.management * 0.2,
  )

  return {
    file: filePath,
    illumination: illuminated.clarity,
    warmth: warm.approachability,
    guidance: guiding.direction,
    fuelEfficiency: efficient.performance,
    glowReach: reaching.scope,
    shadowManagement: shadow.management,
    illuminated,
    warm,
    guiding,
    efficient,
    reaching,
    shadow,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeLanternRow(flames, dirPath) evaluates directory */
export function analyzeLanternRow(flames: LanternFlame[], dirPath: string): LanternRow {
  if (flames.length === 0) {
    return {
      directory: dirPath,
      flames: [],
      avgIllumination: 0,
      avgGuidance: 0,
      avgEfficiency: 0,
      beaconCount: 0,
      darknessCount: 0,
      steadyCount: 0,
      flickeringCount: 0,
      rowType: 'pitch-black',
      condition: 'lost',
    }
  }

  const avgIllumination = Math.round(flames.reduce((s, f) => s + f.illumination, 0) / flames.length)
  const avgGuidance = Math.round(flames.reduce((s, f) => s + f.guidance, 0) / flames.length)
  const avgEfficiency = Math.round(flames.reduce((s, f) => s + f.fuelEfficiency, 0) / flames.length)

  const beaconCount = flames.filter((f) => f.condition === 'beacon-light').length
  const darknessCount = flames.filter((f) => f.condition === 'darkness').length
  const steadyCount = flames.filter((f) => f.condition === 'steady-lantern').length
  const flickeringCount = flames.filter((f) => f.condition === 'flickering-flame').length

  const avgQs = flames.reduce((s, f) => s + f.qualityScore, 0) / flames.length

  return {
    directory: dirPath,
    flames,
    avgIllumination,
    avgGuidance,
    avgEfficiency,
    beaconCount,
    darknessCount,
    steadyCount,
    flickeringCount,
    rowType: classifyRowType(flames),
    condition: classifyRowCondition(avgQs),
  }
}

/** @example generateRecommendations(flames, rows, village, stats) generates advice */
export function generateRecommendations(
  flames: LanternFlame[],
  rows: LanternRow[],
  village: Village,
  stats: LanternGlowStats,
): string[] {
  const recs: string[] = []

  if (stats.avgIllumination < 50) {
    recs.push('Brighten code illumination with type annotations, const declarations, and clear naming')
  }
  if (stats.avgWarmth < 50) {
    recs.push('Warm up code approachability with documentation, optional parameters, and friendly APIs')
  }
  if (stats.avgGuidance < 50) {
    recs.push('Improve code guidance with JSDoc comments, return types, and interface documentation')
  }
  if (stats.avgFuelEfficiency < 50) {
    recs.push('Optimize code efficiency with strict equality, readonly properties, and lean patterns')
  }
  if (stats.avgGlowReach < 50) {
    recs.push('Expand code reach with exports, generics, interfaces, and reusable abstractions')
  }
  if (stats.avgShadowManagement < 50) {
    recs.push('Improve shadow management with try/catch blocks, null checks, and error handling')
  }
  if (stats.darknessCount > 0) {
    recs.push(`${String(stats.darknessCount)} file(s) are in total darkness — consider significant refactoring`)
  }
  if (village.overallIllumination < 40) {
    recs.push('Overall village illumination is low — prioritize clarity and error handling')
  }
  if (rows.length > 0 && rows.every((r) => r.rowType === 'pitch-black' || r.rowType === 'dark-alley')) {
    recs.push('All rows are dark — consider a major quality improvement effort')
  }

  const darkFlames = flames.filter((f) => f.condition === 'darkness')
  if (darkFlames.length > 0 && darkFlames.length <= 3) {
    const names = darkFlames.map((f) => f.file).join(', ')
    recs.push(`Relight these dark files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your code is a beacon of light! Keep the lanterns burning bright')
  }

  return Array.from(new Set(recs))
}

/** @example buildLanternGlowResult(files, contents, options) orchestrates analysis */
export function buildLanternGlowResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): LanternGlowResult {
  const flames = files.map((file, i) => analyzeLanternFlame(contents[i] ?? '', file))

  const rowMap = new Map<string, LanternFlame[]>()
  for (const flame of flames) {
    const dir = flame.file.includes('/') ? flame.file.split('/').slice(0, -1).join('/') : '.'
    const existing = rowMap.get(dir)
    if (existing) {
      existing.push(flame)
    } else {
      rowMap.set(dir, [flame])
    }
  }

  const rows = Array.from(rowMap.entries()).map(([dir, dirFlames]) =>
    analyzeLanternRow(dirFlames, dir),
  )

  const totalFiles = flames.length
  const avgIllumination = totalFiles > 0 ? Math.round(flames.reduce((s, f) => s + f.illumination, 0) / totalFiles) : 0
  const avgWarmth = totalFiles > 0 ? Math.round(flames.reduce((s, f) => s + f.warmth, 0) / totalFiles) : 0
  const avgGuidance = totalFiles > 0 ? Math.round(flames.reduce((s, f) => s + f.guidance, 0) / totalFiles) : 0
  const avgFuelEfficiency = totalFiles > 0 ? Math.round(flames.reduce((s, f) => s + f.fuelEfficiency, 0) / totalFiles) : 0
  const avgGlowReach = totalFiles > 0 ? Math.round(flames.reduce((s, f) => s + f.glowReach, 0) / totalFiles) : 0
  const avgShadowManagement = totalFiles > 0 ? Math.round(flames.reduce((s, f) => s + f.shadowManagement, 0) / totalFiles) : 0

  const overallIllumination = totalFiles > 0
    ? Math.round((avgIllumination + avgGuidance + avgFuelEfficiency) / 3)
    : 0

  const village: Village = {
    avgIllumination,
    avgGuidance,
    avgEfficiency: avgFuelEfficiency,
    isBright: avgIllumination >= 60,
    overallIllumination,
  }

  const beaconLightCount = flames.filter((f) => f.condition === 'beacon-light').length
  const steadyLanternCount = flames.filter((f) => f.condition === 'steady-lantern').length
  const flickeringFlameCount = flames.filter((f) => f.condition === 'flickering-flame').length
  const dyingEmberCount = flames.filter((f) => f.condition === 'dying-ember').length
  const smokingWickCount = flames.filter((f) => f.condition === 'smoking-wick').length
  const darknessCount = flames.filter((f) => f.condition === 'darkness').length

  const bestFlame = totalFiles > 0
    ? flames.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best), flames[0]).file
    : ''
  const brightest = totalFiles > 0
    ? flames.reduce((best, f) => (f.illumination > best.illumination ? f : best), flames[0]).file
    : ''
  const warmest = totalFiles > 0
    ? flames.reduce((best, f) => (f.warmth > best.warmth ? f : best), flames[0]).file
    : ''
  const bestGuided = totalFiles > 0
    ? flames.reduce((best, f) => (f.guidance > best.guidance ? f : best), flames[0]).file
    : ''
  const mostEfficient = totalFiles > 0
    ? flames.reduce((best, f) => (f.fuelEfficiency > best.fuelEfficiency ? f : best), flames[0]).file
    : ''
  const farthestReaching = totalFiles > 0
    ? flames.reduce((best, f) => (f.glowReach > best.glowReach ? f : best), flames[0]).file
    : ''

  const stats: LanternGlowStats = {
    totalFiles,
    totalRows: rows.length,
    avgIllumination,
    avgWarmth,
    avgGuidance,
    avgFuelEfficiency,
    avgGlowReach,
    avgShadowManagement,
    beaconLightCount,
    steadyLanternCount,
    flickeringFlameCount,
    dyingEmberCount,
    smokingWickCount,
    darknessCount,
    hasHighClarityCount: flames.filter((f) => f.illuminated.hasHighClarity).length,
    hasHighApproachabilityCount: flames.filter((f) => f.warm.hasHighApproachability).length,
    hasHighDirectionCount: flames.filter((f) => f.guiding.hasHighDirection).length,
    hasHighPerformanceCount: flames.filter((f) => f.efficient.hasHighPerformance).length,
    hasHighScopeCount: flames.filter((f) => f.reaching.hasHighScope).length,
    hasHighManagementCount: flames.filter((f) => f.shadow.hasHighManagement).length,
    overallIllumination,
    lamplighterGrade: classifyLamplighterGrade(overallIllumination),
    bestFlame,
    brightest,
    warmest,
    bestGuided,
    mostEfficient,
    farthestReaching,
  }

  const recommendations = generateRecommendations(flames, rows, village, stats)

  return { flames, rows, village, stats, recommendations }
}
