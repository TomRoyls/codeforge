// ─── Types ─────────────────────────────────────────────────────────────────

export interface BrilliantMeasure {
  excellence: number
  radiance: 'blinding-brilliance' | 'shining-bright' | 'radiant' | 'glowing' | 'dim' | 'dark'
  hasHighExcellence: boolean
  hasOutstanding: boolean
  hasExceptional: boolean
  hasNoMediocrity: boolean
  hasSuperb: boolean
  hasNoSubpar: boolean
  hasStellar: boolean
  hasNoDullness: boolean
  hasMagnificent: boolean
  hasNoOrdinary: boolean
  mediocrityCount: number
  subparCount: number
}

export interface GatewayMeasure {
  quality: number
  entrance: 'golden-gates' | 'welcoming-portal' | 'proper-entrance' | 'side-door' | 'hidden-entrance' | 'walled-off'
  hasHighQuality: boolean
  hasCleanAPI: boolean
  hasInviting: boolean
  hasNoComplexity: boolean
  hasSimple: boolean
  hasNoBarriers: boolean
  hasDocumented: boolean
  hasNoMystery: boolean
  hasConsistent: boolean
  hasNoSurprise: boolean
  complexityCount: number
  barrierCount: number
}

export interface RoadMeasure {
  clarity: number
  path: 'golden-path' | 'clear-road' | 'well-marked' | 'somewhat-clear' | 'winding' | 'maze'
  hasHighClarity: boolean
  hasClearPath: boolean
  hasStraightforward: boolean
  hasNoObfuscation: boolean
  hasWellMarked: boolean
  hasNoDetour: boolean
  hasDirect: boolean
  hasNoDeadEnd: boolean
  hasObvious: boolean
  hasNoConfusion: boolean
  obfuscationCount: number
  deadEndCount: number
}

export interface WizardryMeasure {
  cleverness: number
  magic: 'grand-wizard' | 'powerful-sorcerer' | 'skilled-mage' | 'apprentice-wizard' | 'hedge-mage' | 'muggle'
  hasHighCleverness: boolean
  hasInnovative: boolean
  hasClever: boolean
  hasNoDull: boolean
  hasInsightful: boolean
  hasNoOverClever: boolean
  hasElegant: boolean
  hasNoMagicNumbers: boolean
  hasResourceful: boolean
  hasNoDarkMagic: boolean
  dullCount: number
  overCleverCount: number
}

export interface SplendorMeasure {
  visual: number
  beauty: 'emerald-splendor' | 'beautiful-glow' | 'pleasant-look' | 'adequate' | 'plain' | 'ugly'
  hasHighVisual: boolean
  hasOrganized: boolean
  hasClean: boolean
  hasNoMessiness: boolean
  hasStructured: boolean
  hasNoChaos: boolean
  hasFormatted: boolean
  hasNoClutter: boolean
  hasBeautiful: boolean
  hasNoUgly: boolean
  messinessCount: number
  clutterCount: number
}

export interface HomecomingMeasure {
  maintainability: number
  welcome: 'theres-no-place-like-home' | 'warm-welcome' | 'comfortable-return' | 'manageable' | 'difficult-return' | 'no-way-back'
  hasHighMaintainability: boolean
  hasMaintainable: boolean
  hasDocumented: boolean
  hasNoSpaghetti: boolean
  hasSimple: boolean
  hasNoComplexity: boolean
  hasRefactorable: boolean
  hasNoCoupling: boolean
  hasTestable: boolean
  hasNoRigidity: boolean
  spaghettiCount: number
  couplingCount: number
}

export type TowerCondition = 'emerald-palace' | 'crystal-tower' | 'jade-pavilion' | 'stone-building' | 'wooden-shack' | 'ruins'

export interface EmeraldTower {
  file: string
  brilliance: number
  gatewayQuality: number
  yellowBrickRoad: number
  ozWizardry: number
  emeraldSplendor: number
  homecomingQuality: number
  brilliant: BrilliantMeasure
  gateway: GatewayMeasure
  road: RoadMeasure
  wizardry: WizardryMeasure
  splendor: SplendorMeasure
  homecoming: HomecomingMeasure
  condition: TowerCondition
  qualityScore: number
}

export type DistrictType = 'royal-palace' | 'noble-quarter' | 'merchant-district' | 'common-square' | 'slums' | 'wasteland'
export type DistrictCondition = 'magnificent-city' | 'beautiful-district' | 'pleasant-quarter' | 'fading-glory' | 'crumbling' | 'ruined'

export interface EmeraldDistrict {
  directory: string
  towers: EmeraldTower[]
  avgBrilliance: number
  avgRoadClarity: number
  avgHomecoming: number
  emeraldPalaceCount: number
  ruinsCount: number
  crystalTowerCount: number
  jadePavilionCount: number
  districtType: DistrictType
  condition: DistrictCondition
}

export interface EmeraldKingdom {
  avgBrilliance: number
  avgRoadClarity: number
  avgHomecoming: number
  isMagnificent: boolean
  overallSplendor: number
}

export type WizardGrade = 'wizard-of-oz' | 'good-witch' | 'munchkin-elder' | 'traveler' | 'lost-soul' | 'wicked-witch'

export interface EmeraldCityStats {
  totalFiles: number
  totalDistricts: number
  avgBrilliance: number
  avgGatewayQuality: number
  avgYellowBrickRoad: number
  avgOzWizardry: number
  avgEmeraldSplendor: number
  avgHomecomingQuality: number
  emeraldPalaceCount: number
  crystalTowerCount: number
  jadePavilionCount: number
  stoneBuildingCount: number
  woodenShackCount: number
  ruinsCount: number
  hasHighExcellenceCount: number
  hasHighQualityCount: number
  hasHighClarityCount: number
  hasHighClevernessCount: number
  hasHighVisualCount: number
  hasHighMaintainabilityCount: number
  overallSplendor: number
  wizardGrade: WizardGrade
  bestTower: string
  mostBrilliant: string
  bestGateway: string
  clearestPath: string
  mostClever: string
  mostSplendid: string
  celebration: string
}

export interface EmeraldCityResult {
  towers: EmeraldTower[]
  districts: EmeraldDistrict[]
  kingdom: EmeraldKingdom
  stats: EmeraldCityStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureBrilliant(content) evaluates code excellence */
export function measureBrilliant(content: string): BrilliantMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasArrowFn = /=>\s*[^=]/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const mediocrityMatches = content.match(/\bvar\s+/g)
  const mediocrityCount = mediocrityMatches ? mediocrityMatches.length : 0
  const subparMatches = content.match(/\bany\b/g)
  const subparCount = subparMatches ? subparMatches.length : 0

  const hasOutstanding = hasExport && hasConst
  const hasExceptional = hasReturnType && hasAsync
  const hasSuperb = hasInterface && hasClass
  const hasStellar = hasOptionalChaining && hasStrictEquality
  const hasMagnificent = hasAsync && hasArrowFn

  let excellence = 0
  if (hasExport) excellence += 8
  if (hasConst) excellence += 8
  if (hasReturnType) excellence += 10
  if (hasAsync) excellence += 8
  if (hasArrowFn) excellence += 8
  if (hasInterface) excellence += 10
  if (hasClass) excellence += 10
  if (hasOptionalChaining) excellence += 8
  if (hasStrictEquality) excellence += 8
  if (hasNamedExport) excellence += 8
  if (hasOutstanding) excellence += 5
  if (hasExceptional) excellence += 5
  if (hasSuperb) excellence += 5
  if (hasStellar) excellence += 5
  if (hasMagnificent) excellence += 5

  excellence = Math.min(100, Math.round(excellence))

  let radiance: BrilliantMeasure['radiance'] = 'dark'
  if (excellence >= 85) radiance = 'blinding-brilliance'
  else if (excellence >= 70) radiance = 'shining-bright'
  else if (excellence >= 55) radiance = 'radiant'
  else if (excellence >= 40) radiance = 'glowing'
  else if (excellence >= 25) radiance = 'dim'

  return {
    excellence,
    radiance,
    hasHighExcellence: excellence >= 70,
    hasOutstanding,
    hasExceptional,
    hasNoMediocrity: mediocrityCount === 0,
    hasSuperb,
    hasNoSubpar: subparCount === 0,
    hasStellar,
    hasNoDullness: mediocrityCount === 0 && subparCount === 0,
    hasMagnificent,
    hasNoOrdinary: mediocrityCount === 0,
    mediocrityCount,
    subparCount,
  }
}

/** @example measureGateway(content) evaluates code API design */
export function measureGateway(content: string): GatewayMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasOptionalParam = /\w+\?\s*[):\]]/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasConst = /\bconst\s+/.test(content)

  const complexityMatches = content.match(/\bvar\s+/g)
  const complexityCount = complexityMatches ? complexityMatches.length : 0
  const barrierMatches = content.match(/\bany\b/g)
  const barrierCount = barrierMatches ? barrierMatches.length : 0

  const hasCleanAPI = hasExport && hasReturnType
  const hasInviting = hasInterface && hasNamedExport
  const hasSimple = hasConst && hasOptionalParam
  const hasDocumented = hasDocComments && hasReturnType
  const hasConsistent = hasGenerics && hasTypeAnnotation

  let quality = 0
  if (hasExport) quality += 10
  if (hasInterface) quality += 10
  if (hasReturnType) quality += 10
  if (hasNamedExport) quality += 8
  if (hasOptionalParam) quality += 8
  if (hasDefaultParam) quality += 8
  if (hasDocComments) quality += 10
  if (hasGenerics) quality += 8
  if (hasTypeAnnotation) quality += 8
  if (hasConst) quality += 8
  if (hasCleanAPI) quality += 5
  if (hasInviting) quality += 5
  if (hasSimple) quality += 5
  if (hasDocumented) quality += 5
  if (hasConsistent) quality += 5

  quality = Math.min(100, Math.round(quality))

  let entrance: GatewayMeasure['entrance'] = 'walled-off'
  if (quality >= 85) entrance = 'golden-gates'
  else if (quality >= 70) entrance = 'welcoming-portal'
  else if (quality >= 55) entrance = 'proper-entrance'
  else if (quality >= 40) entrance = 'side-door'
  else if (quality >= 25) entrance = 'hidden-entrance'

  return {
    quality,
    entrance,
    hasHighQuality: quality >= 70,
    hasCleanAPI,
    hasInviting,
    hasNoComplexity: complexityCount === 0,
    hasSimple,
    hasNoBarriers: barrierCount === 0,
    hasDocumented,
    hasNoMystery: complexityCount === 0 && barrierCount === 0,
    hasConsistent,
    hasNoSurprise: complexityCount === 0,
    complexityCount,
    barrierCount,
  }
}

/** @example measureRoad(content) evaluates code clarity */
export function measureRoad(content: string): RoadMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasArrowFn = /=>\s*[^=]/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)

  const obfuscationMatches = content.match(/\bvar\s+/g)
  const obfuscationCount = obfuscationMatches ? obfuscationMatches.length : 0
  const deadEndMatches = content.match(/\bany\b/g)
  const deadEndCount = deadEndMatches ? deadEndMatches.length : 0

  const hasClearPath = hasExport && hasImport
  const hasStraightforward = hasConst && hasStrictEquality
  const hasWellMarked = hasReturnType && hasNamedExport
  const hasDirect = hasAsync && hasArrowFn
  const hasObvious = hasOptionalChaining && hasNullishCoalescing

  let clarity = 0
  if (hasExport) clarity += 10
  if (hasImport) clarity += 10
  if (hasConst) clarity += 10
  if (hasReturnType) clarity += 10
  if (hasAsync) clarity += 8
  if (hasArrowFn) clarity += 8
  if (hasNamedExport) clarity += 8
  if (hasStrictEquality) clarity += 8
  if (hasOptionalChaining) clarity += 8
  if (hasNullishCoalescing) clarity += 7
  if (hasClearPath) clarity += 5
  if (hasStraightforward) clarity += 5
  if (hasWellMarked) clarity += 5
  if (hasDirect) clarity += 5
  if (hasObvious) clarity += 5

  clarity = Math.min(100, Math.round(clarity))

  let path: RoadMeasure['path'] = 'maze'
  if (clarity >= 85) path = 'golden-path'
  else if (clarity >= 70) path = 'clear-road'
  else if (clarity >= 55) path = 'well-marked'
  else if (clarity >= 40) path = 'somewhat-clear'
  else if (clarity >= 25) path = 'winding'

  return {
    clarity,
    path,
    hasHighClarity: clarity >= 70,
    hasClearPath,
    hasStraightforward,
    hasNoObfuscation: obfuscationCount === 0,
    hasWellMarked,
    hasNoDetour: obfuscationCount === 0,
    hasDirect,
    hasNoDeadEnd: deadEndCount === 0,
    hasObvious,
    hasNoConfusion: obfuscationCount === 0 && deadEndCount === 0,
    obfuscationCount,
    deadEndCount,
  }
}

/** @example measureWizardry(content) evaluates code cleverness */
export function measureWizardry(content: string): WizardryMeasure {
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)

  const dullMatches = content.match(/\bvar\s+/g)
  const dullCount = dullMatches ? dullMatches.length : 0
  const overCleverMatches = content.match(/\bany\b/g)
  const overCleverCount = overCleverMatches ? overCleverMatches.length : 0

  const hasInnovative = hasGenerics && hasTypeAlias
  const hasClever = hasOptionalChaining && hasNullishCoalescing
  const hasInsightful = hasEnum && hasReadonly
  const hasElegant = hasInterface && hasAsync
  const hasResourceful = hasConst && hasReturnType

  let cleverness = 0
  if (hasGenerics) cleverness += 10
  if (hasTypeAlias) cleverness += 10
  if (hasEnum) cleverness += 8
  if (hasOptionalChaining) cleverness += 10
  if (hasNullishCoalescing) cleverness += 8
  if (hasAsync) cleverness += 8
  if (hasInterface) cleverness += 10
  if (hasReadonly) cleverness += 8
  if (hasConst) cleverness += 8
  if (hasReturnType) cleverness += 8
  if (hasInnovative) cleverness += 5
  if (hasClever) cleverness += 5
  if (hasInsightful) cleverness += 5
  if (hasElegant) cleverness += 5
  if (hasResourceful) cleverness += 5

  cleverness = Math.min(100, Math.round(cleverness))

  let magic: WizardryMeasure['magic'] = 'muggle'
  if (cleverness >= 85) magic = 'grand-wizard'
  else if (cleverness >= 70) magic = 'powerful-sorcerer'
  else if (cleverness >= 55) magic = 'skilled-mage'
  else if (cleverness >= 40) magic = 'apprentice-wizard'
  else if (cleverness >= 25) magic = 'hedge-mage'

  return {
    cleverness,
    magic,
    hasHighCleverness: cleverness >= 70,
    hasInnovative,
    hasClever,
    hasNoDull: dullCount === 0,
    hasInsightful,
    hasNoOverClever: overCleverCount === 0,
    hasElegant,
    hasNoMagicNumbers: dullCount === 0,
    hasResourceful,
    hasNoDarkMagic: dullCount === 0 && overCleverCount === 0,
    dullCount,
    overCleverCount,
  }
}

/** @example measureSplendor(content) evaluates code visual quality */
export function measureSplendor(content: string): SplendorMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const messinessMatches = content.match(/\bvar\s+/g)
  const messinessCount = messinessMatches ? messinessMatches.length : 0
  const clutterMatches = content.match(/\bany\b/g)
  const clutterCount = clutterMatches ? clutterMatches.length : 0

  const hasOrganized = hasInterface && hasClass
  const hasClean = hasExport && hasNamedExport
  const hasStructured = hasEnum && hasTypeAlias
  const hasFormatted = hasReturnType && hasDocComments
  const hasBeautiful = hasConst && hasReadonly

  let visual = 0
  if (hasExport) visual += 10
  if (hasInterface) visual += 10
  if (hasClass) visual += 10
  if (hasReturnType) visual += 8
  if (hasDocComments) visual += 10
  if (hasEnum) visual += 8
  if (hasTypeAlias) visual += 8
  if (hasNamedExport) visual += 8
  if (hasConst) visual += 8
  if (hasReadonly) visual += 8
  if (hasOrganized) visual += 5
  if (hasClean) visual += 5
  if (hasStructured) visual += 5
  if (hasFormatted) visual += 5
  if (hasBeautiful) visual += 5

  visual = Math.min(100, Math.round(visual))

  let beauty: SplendorMeasure['beauty'] = 'ugly'
  if (visual >= 85) beauty = 'emerald-splendor'
  else if (visual >= 70) beauty = 'beautiful-glow'
  else if (visual >= 55) beauty = 'pleasant-look'
  else if (visual >= 40) beauty = 'adequate'
  else if (visual >= 25) beauty = 'plain'

  return {
    visual,
    beauty,
    hasHighVisual: visual >= 70,
    hasOrganized,
    hasClean,
    hasNoMessiness: messinessCount === 0,
    hasStructured,
    hasNoChaos: messinessCount === 0 && clutterCount === 0,
    hasFormatted,
    hasNoClutter: clutterCount === 0,
    hasBeautiful,
    hasNoUgly: messinessCount === 0,
    messinessCount,
    clutterCount,
  }
}

/** @example measureHomecoming(content) evaluates code maintainability */
export function measureHomecoming(content: string): HomecomingMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const spaghettiMatches = content.match(/\bvar\s+/g)
  const spaghettiCount = spaghettiMatches ? spaghettiMatches.length : 0
  const couplingMatches = content.match(/\bany\b/g)
  const couplingCount = couplingMatches ? couplingMatches.length : 0

  const hasMaintainable = hasExport && hasImport
  const hasDocumented = hasDocComments && hasReturnType
  const hasSimple = hasConst && hasReturnType
  const hasRefactorable = hasInterface && hasClass
  const hasTestable = hasTryCatch && hasAsync

  let maintainability = 0
  if (hasExport) maintainability += 8
  if (hasImport) maintainability += 8
  if (hasConst) maintainability += 10
  if (hasReturnType) maintainability += 10
  if (hasAsync) maintainability += 8
  if (hasTryCatch) maintainability += 10
  if (hasDocComments) maintainability += 10
  if (hasInterface) maintainability += 8
  if (hasClass) maintainability += 8
  if (hasNamedExport) maintainability += 8
  if (hasMaintainable) maintainability += 5
  if (hasDocumented) maintainability += 5
  if (hasSimple) maintainability += 5
  if (hasRefactorable) maintainability += 5
  if (hasTestable) maintainability += 5

  maintainability = Math.min(100, Math.round(maintainability))

  let welcome: HomecomingMeasure['welcome'] = 'no-way-back'
  if (maintainability >= 85) welcome = 'theres-no-place-like-home'
  else if (maintainability >= 70) welcome = 'warm-welcome'
  else if (maintainability >= 55) welcome = 'comfortable-return'
  else if (maintainability >= 40) welcome = 'manageable'
  else if (maintainability >= 25) welcome = 'difficult-return'

  return {
    maintainability,
    welcome,
    hasHighMaintainability: maintainability >= 70,
    hasMaintainable,
    hasDocumented,
    hasNoSpaghetti: spaghettiCount === 0,
    hasSimple,
    hasNoComplexity: spaghettiCount === 0 && couplingCount === 0,
    hasRefactorable,
    hasNoCoupling: couplingCount === 0,
    hasTestable,
    hasNoRigidity: spaghettiCount === 0,
    spaghettiCount,
    couplingCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'emerald-palace' */
export function classifyCondition(score: number): TowerCondition {
  if (score >= 85) return 'emerald-palace'
  if (score >= 70) return 'crystal-tower'
  if (score >= 55) return 'jade-pavilion'
  if (score >= 40) return 'stone-building'
  if (score >= 25) return 'wooden-shack'
  return 'ruins'
}

/** @example classifyDistrictType(towers) returns district classification */
export function classifyDistrictType(towers: EmeraldTower[]): DistrictType {
  if (towers.length === 0) return 'wasteland'
  const avgQs = towers.reduce((s, t) => s + t.qualityScore, 0) / towers.length
  const palaceCount = towers.filter((t) => t.condition === 'emerald-palace').length
  const ratio = palaceCount / towers.length
  if (avgQs >= 75 && ratio >= 0.5) return 'royal-palace'
  if (avgQs >= 60) return 'noble-quarter'
  if (avgQs >= 45) return 'merchant-district'
  if (avgQs >= 30) return 'common-square'
  if (avgQs >= 15) return 'slums'
  return 'wasteland'
}

/** @example classifyDistrictCondition(avgQs) returns district condition */
export function classifyDistrictCondition(avgQs: number): DistrictCondition {
  if (avgQs >= 75) return 'magnificent-city'
  if (avgQs >= 60) return 'beautiful-district'
  if (avgQs >= 45) return 'pleasant-quarter'
  if (avgQs >= 30) return 'fading-glory'
  if (avgQs >= 15) return 'crumbling'
  return 'ruined'
}

/** @example classifyWizardGrade(80) returns 'wizard-of-oz' */
export function classifyWizardGrade(avgSplendor: number): WizardGrade {
  if (avgSplendor >= 80) return 'wizard-of-oz'
  if (avgSplendor >= 65) return 'good-witch'
  if (avgSplendor >= 50) return 'munchkin-elder'
  if (avgSplendor >= 35) return 'traveler'
  if (avgSplendor >= 20) return 'lost-soul'
  return 'wicked-witch'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeEmeraldTower(content, filePath) evaluates single file */
export function analyzeEmeraldTower(content: string, filePath: string): EmeraldTower {
  const brilliant = measureBrilliant(content)
  const gateway = measureGateway(content)
  const road = measureRoad(content)
  const wizardry = measureWizardry(content)
  const splendor = measureSplendor(content)
  const homecoming = measureHomecoming(content)

  const qualityScore = Math.round(
    brilliant.excellence * 0.2 +
    gateway.quality * 0.15 +
    road.clarity * 0.15 +
    wizardry.cleverness * 0.15 +
    splendor.visual * 0.15 +
    homecoming.maintainability * 0.2,
  )

  return {
    file: filePath,
    brilliance: brilliant.excellence,
    gatewayQuality: gateway.quality,
    yellowBrickRoad: road.clarity,
    ozWizardry: wizardry.cleverness,
    emeraldSplendor: splendor.visual,
    homecomingQuality: homecoming.maintainability,
    brilliant,
    gateway,
    road,
    wizardry,
    splendor,
    homecoming,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeEmeraldDistrict(towers, dirPath) evaluates directory */
export function analyzeEmeraldDistrict(towers: EmeraldTower[], dirPath: string): EmeraldDistrict {
  if (towers.length === 0) {
    return {
      directory: dirPath,
      towers: [],
      avgBrilliance: 0,
      avgRoadClarity: 0,
      avgHomecoming: 0,
      emeraldPalaceCount: 0,
      ruinsCount: 0,
      crystalTowerCount: 0,
      jadePavilionCount: 0,
      districtType: 'wasteland',
      condition: 'ruined',
    }
  }

  const avgBrilliance = Math.round(towers.reduce((s, t) => s + t.brilliance, 0) / towers.length)
  const avgRoadClarity = Math.round(towers.reduce((s, t) => s + t.yellowBrickRoad, 0) / towers.length)
  const avgHomecoming = Math.round(towers.reduce((s, t) => s + t.homecomingQuality, 0) / towers.length)

  const emeraldPalaceCount = towers.filter((t) => t.condition === 'emerald-palace').length
  const ruinsCount = towers.filter((t) => t.condition === 'ruins').length
  const crystalTowerCount = towers.filter((t) => t.condition === 'crystal-tower').length
  const jadePavilionCount = towers.filter((t) => t.condition === 'jade-pavilion').length

  const avgQs = towers.reduce((s, t) => s + t.qualityScore, 0) / towers.length

  return {
    directory: dirPath,
    towers,
    avgBrilliance,
    avgRoadClarity,
    avgHomecoming,
    emeraldPalaceCount,
    ruinsCount,
    crystalTowerCount,
    jadePavilionCount,
    districtType: classifyDistrictType(towers),
    condition: classifyDistrictCondition(avgQs),
  }
}

/** @example generateRecommendations(towers, districts, kingdom, stats) generates advice */
export function generateRecommendations(
  towers: EmeraldTower[],
  districts: EmeraldDistrict[],
  kingdom: EmeraldKingdom,
  stats: EmeraldCityStats,
): string[] {
  const recs: string[] = []

  if (stats.avgBrilliance < 50) {
    recs.push('Increase brilliance with exports, interfaces, and typed functions')
  }
  if (stats.avgGatewayQuality < 50) {
    recs.push('Improve gateway quality with clean APIs, optional parameters, and documentation')
  }
  if (stats.avgYellowBrickRoad < 50) {
    recs.push('Pave the yellow brick road with clear imports, const declarations, and strict equality')
  }
  if (stats.avgOzWizardry < 50) {
    recs.push('Enhance wizardry with generics, type aliases, and advanced TypeScript patterns')
  }
  if (stats.avgEmeraldSplendor < 50) {
    recs.push('Boost emerald splendor with organized classes, interfaces, and documented exports')
  }
  if (stats.avgHomecomingQuality < 50) {
    recs.push('Improve homecoming quality with maintainable patterns, try/catch, and documentation')
  }
  if (stats.ruinsCount > 0) {
    recs.push(`${String(stats.ruinsCount)} file(s) are in ruins — consider significant refactoring`)
  }
  if (kingdom.overallSplendor < 40) {
    recs.push('Overall kingdom splendor is low — prioritize code quality improvements')
  }
  if (districts.length > 0 && districts.every((d) => d.districtType === 'wasteland' || d.districtType === 'slums')) {
    recs.push('All districts are degraded — consider a major quality improvement effort')
  }

  const ruined = towers.filter((t) => t.condition === 'ruins')
  if (ruined.length > 0 && ruined.length <= 3) {
    const names = ruined.map((t) => t.file).join(', ')
    recs.push(`Rebuild these ruins: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your code is a magnificent Emerald City! Brilliance shines from every tower')
  }

  return Array.from(new Set(recs))
}

/** @example buildEmeraldCityResult(files, contents, options) orchestrates analysis */
export function buildEmeraldCityResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): EmeraldCityResult {
  const towers = files.map((file, i) => analyzeEmeraldTower(contents[i] ?? '', file))

  const dMap = new Map<string, EmeraldTower[]>()
  for (const tower of towers) {
    const dir = tower.file.includes('/') ? tower.file.split('/').slice(0, -1).join('/') : '.'
    const existing = dMap.get(dir)
    if (existing) {
      existing.push(tower)
    } else {
      dMap.set(dir, [tower])
    }
  }

  const districts = Array.from(dMap.entries()).map(([dir, dirTowers]) =>
    analyzeEmeraldDistrict(dirTowers, dir),
  )

  const totalFiles = towers.length
  const avgBrilliance = totalFiles > 0 ? Math.round(towers.reduce((s, t) => s + t.brilliance, 0) / totalFiles) : 0
  const avgGatewayQuality = totalFiles > 0 ? Math.round(towers.reduce((s, t) => s + t.gatewayQuality, 0) / totalFiles) : 0
  const avgYellowBrickRoad = totalFiles > 0 ? Math.round(towers.reduce((s, t) => s + t.yellowBrickRoad, 0) / totalFiles) : 0
  const avgOzWizardry = totalFiles > 0 ? Math.round(towers.reduce((s, t) => s + t.ozWizardry, 0) / totalFiles) : 0
  const avgEmeraldSplendor = totalFiles > 0 ? Math.round(towers.reduce((s, t) => s + t.emeraldSplendor, 0) / totalFiles) : 0
  const avgHomecomingQuality = totalFiles > 0 ? Math.round(towers.reduce((s, t) => s + t.homecomingQuality, 0) / totalFiles) : 0

  const avgRoadClarity = avgYellowBrickRoad
  const avgHomecoming = avgHomecomingQuality

  const overallSplendor = totalFiles > 0
    ? Math.round((avgBrilliance + avgRoadClarity + avgHomecoming) / 3)
    : 0

  const kingdom: EmeraldKingdom = {
    avgBrilliance,
    avgRoadClarity,
    avgHomecoming,
    isMagnificent: avgBrilliance >= 60,
    overallSplendor,
  }

  const bestTower = totalFiles > 0
    ? towers.reduce((best, t) => (t.qualityScore > best.qualityScore ? t : best), towers[0] as typeof towers[number]).file
    : ''
  const mostBrilliant = totalFiles > 0
    ? towers.reduce((best, t) => (t.brilliance > best.brilliance ? t : best), towers[0] as typeof towers[number]).file
    : ''
  const bestGateway = totalFiles > 0
    ? towers.reduce((best, t) => (t.gatewayQuality > best.gatewayQuality ? t : best), towers[0] as typeof towers[number]).file
    : ''
  const clearestPath = totalFiles > 0
    ? towers.reduce((best, t) => (t.yellowBrickRoad > best.yellowBrickRoad ? t : best), towers[0] as typeof towers[number]).file
    : ''
  const mostClever = totalFiles > 0
    ? towers.reduce((best, t) => (t.ozWizardry > best.ozWizardry ? t : best), towers[0] as typeof towers[number]).file
    : ''
  const mostSplendid = totalFiles > 0
    ? towers.reduce((best, t) => (t.emeraldSplendor > best.emeraldSplendor ? t : best), towers[0] as typeof towers[number]).file
    : ''

  const stats: EmeraldCityStats = {
    totalFiles,
    totalDistricts: districts.length,
    avgBrilliance,
    avgGatewayQuality,
    avgYellowBrickRoad,
    avgOzWizardry,
    avgEmeraldSplendor,
    avgHomecomingQuality,
    emeraldPalaceCount: towers.filter((t) => t.condition === 'emerald-palace').length,
    crystalTowerCount: towers.filter((t) => t.condition === 'crystal-tower').length,
    jadePavilionCount: towers.filter((t) => t.condition === 'jade-pavilion').length,
    stoneBuildingCount: towers.filter((t) => t.condition === 'stone-building').length,
    woodenShackCount: towers.filter((t) => t.condition === 'wooden-shack').length,
    ruinsCount: towers.filter((t) => t.condition === 'ruins').length,
    hasHighExcellenceCount: towers.filter((t) => t.brilliant.hasHighExcellence).length,
    hasHighQualityCount: towers.filter((t) => t.gateway.hasHighQuality).length,
    hasHighClarityCount: towers.filter((t) => t.road.hasHighClarity).length,
    hasHighClevernessCount: towers.filter((t) => t.wizardry.hasHighCleverness).length,
    hasHighVisualCount: towers.filter((t) => t.splendor.hasHighVisual).length,
    hasHighMaintainabilityCount: towers.filter((t) => t.homecoming.hasHighMaintainability).length,
    overallSplendor,
    wizardGrade: classifyWizardGrade(overallSplendor),
    bestTower,
    mostBrilliant,
    bestGateway,
    clearestPath,
    mostClever,
    mostSplendid,
    celebration: '420 commands - an emerald city of code analysis excellence',
  }

  const recommendations = generateRecommendations(towers, districts, kingdom, stats)

  return { towers, districts, kingdom, stats, recommendations }
}
