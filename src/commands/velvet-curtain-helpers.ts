// ─── Types ─────────────────────────────────────────────────────────────────

export interface PrivateMeasure {
  encapsulation: number
  grade: 'vault-sealed' | 'well-hidden' | 'properly-curtained' | 'partially-exposed' | 'transparent' | 'naked'
  hasHighEncapsulation: boolean
  hasEncapsulated: boolean
  hasHiddenImpl: boolean
  hasNoLeaking: boolean
  hasProperVisibility: boolean
  hasNoExposure: boolean
  hasSealed: boolean
  hasNoSpilling: boolean
  hasContained: boolean
  hasNoBleed: boolean
  leakingCount: number
  exposureCount: number
}

export interface EnvelopeMeasure {
  boundary: number
  quality: 'perfect-envelope' | 'clean-boundary' | 'proper-border' | 'fuzzy-edge' | 'porous' | 'no-boundary'
  hasHighBoundary: boolean
  hasClearBorders: boolean
  hasProperInterface: boolean
  hasNoLeaking: boolean
  hasDefined: boolean
  hasNoBlurring: boolean
  hasSharp: boolean
  hasNoBleeding: boolean
  hasContained: boolean
  hasNoSpillover: boolean
  leakingCount: number
  blurringCount: number
}

export interface ElegantMeasure {
  beauty: number
  drape: 'regal-drape' | 'elegant-fold' | 'proper-hang' | 'slightly-wrinkled' | 'sagging' | 'tattered'
  hasHighBeauty: boolean
  hasBeautiful: boolean
  hasElegant: boolean
  hasNoUgliness: boolean
  hasGraceful: boolean
  hasNoClumsiness: boolean
  hasRefined: boolean
  hasNoRoughness: boolean
  hasPolished: boolean
  hasNoCrudeness: boolean
  uglinessCount: number
  clumsinessCount: number
}

export interface BackstageMeasure {
  documentation: number
  access: 'full-program' | 'detailed-notes' | 'proper-script' | 'stage-directions' | 'scribbled-notes' | 'no-script'
  hasHighDocumentation: boolean
  hasDocumented: boolean
  hasCommented: boolean
  hasNoMystery: boolean
  hasExplained: boolean
  hasNoUndocumented: boolean
  hasAnnotated: boolean
  hasNoSilent: boolean
  hasGuided: boolean
  hasNoBlackBox: boolean
  mysteryCount: number
  undocumentedCount: number
}

export interface PublicMeasure {
  api: number
  call: 'standing-ovation' | 'enthusiastic-applause' | 'warm-reception' | 'polite-clapping' | 'crickets' | 'booed'
  hasHighApi: boolean
  hasCleanAPI: boolean
  hasSimple: boolean
  hasNoComplexity: boolean
  hasIntuitive: boolean
  hasNoSurprise: boolean
  hasDocumented: boolean
  hasNoConfusion: boolean
  hasConsistent: boolean
  hasNoInconsistency: boolean
  complexityCount: number
  surpriseCount: number
}

export interface TheatricalMeasure {
  presentation: number
  quality: 'masterpiece-theater' | 'fine-performance' | 'proper-show' | 'amateur-hour' | 'rehearsal' | 'disaster'
  hasHighPresentation: boolean
  hasWellStructured: boolean
  hasOrganized: boolean
  hasNoChaos: boolean
  hasClearFlow: boolean
  hasNoDisorder: boolean
  hasPolished: boolean
  hasNoMessiness: boolean
  hasProfessional: boolean
  hasNoSloppiness: boolean
  chaosCount: number
  disorderCount: number
}

export type FoldCondition = 'velvet-masterpiece' | 'fine-curtain' | 'proper-drape' | 'worn-fabric' | 'tattered-curtain' | 'no-curtain'

export interface CurtainFold {
  file: string
  privacy: number
  envelopeQuality: number
  drapeElegance: number
  backstageAccess: number
  curtainCall: number
  theatricalQuality: number
  private: PrivateMeasure
  envelope: EnvelopeMeasure
  elegant: ElegantMeasure
  backstage: BackstageMeasure
  public: PublicMeasure
  theatrical: TheatricalMeasure
  condition: FoldCondition
  qualityScore: number
}

export type RowType = 'grand-theater' | 'opera-house' | 'playhouse' | 'community-theater' | 'backstage' | 'empty-stage'
export type RowCondition = 'broadway-quality' | 'fine-performance' | 'proper-production' | 'amateur-show' | 'failing-act' | 'dark-stage'

export interface CurtainRow {
  directory: string
  folds: CurtainFold[]
  avgPrivacy: number
  avgElegance: number
  avgTheatrical: number
  velvetMasterpieceCount: number
  noCurtainCount: number
  fineCurtainCount: number
  properDrapeCount: number
  rowType: RowType
  condition: RowCondition
}

export interface VelvetTheater {
  avgPrivacy: number
  avgElegance: number
  avgTheatrical: number
  isElegant: boolean
  overallElegance: number
}

export type DirectorGrade = 'master-director' | 'expert-producer' | 'skilled-director' | 'stage-manager' | 'apprentice' | 'audience-member'

export interface VelvetCurtainStats {
  totalFiles: number
  totalRows: number
  avgPrivacy: number
  avgEnvelopeQuality: number
  avgDrapeElegance: number
  avgBackstageAccess: number
  avgCurtainCall: number
  avgTheatricalQuality: number
  velvetMasterpieceCount: number
  fineCurtainCount: number
  properDrapeCount: number
  wornFabricCount: number
  tatteredCurtainCount: number
  noCurtainCount: number
  hasHighEncapsulationCount: number
  hasHighBoundaryCount: number
  hasHighBeautyCount: number
  hasHighDocumentationCount: number
  hasHighApiCount: number
  hasHighPresentationCount: number
  overallElegance: number
  directorGrade: DirectorGrade
  bestFold: string
  mostPrivate: string
  bestBoundary: string
  mostElegant: string
  bestDocumented: string
  bestAPI: string
}

export interface VelvetCurtainResult {
  folds: CurtainFold[]
  rows: CurtainRow[]
  theater: VelvetTheater
  stats: VelvetCurtainStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measurePrivate(content) evaluates code encapsulation */
export function measurePrivate(content: string): PrivateMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)

  const leakingMatches = content.match(/\bvar\s+/g)
  const leakingCount = leakingMatches ? leakingMatches.length : 0
  const exposureMatches = content.match(/\bany\b/g)
  const exposureCount = exposureMatches ? exposureMatches.length : 0

  const hasEncapsulated = hasInterface && hasClass
  const hasHiddenImpl = hasPrivate && hasReadonly
  const hasProperVisibility = hasExport && hasNamedExport
  const hasSealed = hasReturnType && hasConst
  const hasContained = hasTypeAnnotation && hasOptionalChaining

  let encapsulation = 0
  if (hasExport) encapsulation += 8
  if (hasInterface) encapsulation += 10
  if (hasClass) encapsulation += 8
  if (hasPrivate) encapsulation += 10
  if (hasReadonly) encapsulation += 10
  if (hasReturnType) encapsulation += 8
  if (hasConst) encapsulation += 8
  if (hasNamedExport) encapsulation += 8
  if (hasTypeAnnotation) encapsulation += 8
  if (hasOptionalChaining) encapsulation += 8
  if (hasEncapsulated) encapsulation += 5
  if (hasHiddenImpl) encapsulation += 5
  if (hasProperVisibility) encapsulation += 5
  if (hasSealed) encapsulation += 5
  if (hasContained) encapsulation += 5

  encapsulation = Math.min(100, Math.round(encapsulation))

  let grade: PrivateMeasure['grade'] = 'naked'
  if (encapsulation >= 85) grade = 'vault-sealed'
  else if (encapsulation >= 70) grade = 'well-hidden'
  else if (encapsulation >= 55) grade = 'properly-curtained'
  else if (encapsulation >= 40) grade = 'partially-exposed'
  else if (encapsulation >= 25) grade = 'transparent'

  return {
    encapsulation,
    grade,
    hasHighEncapsulation: encapsulation >= 70,
    hasEncapsulated,
    hasHiddenImpl,
    hasNoLeaking: leakingCount === 0,
    hasProperVisibility,
    hasNoExposure: exposureCount === 0,
    hasSealed,
    hasNoSpilling: leakingCount === 0 && exposureCount === 0,
    hasContained,
    hasNoBleed: leakingCount === 0,
    leakingCount,
    exposureCount,
  }
}

/** @example measureEnvelope(content) evaluates code boundaries */
export function measureEnvelope(content: string): EnvelopeMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)

  const leakingMatches = content.match(/\bvar\s+/g)
  const leakingCount = leakingMatches ? leakingMatches.length : 0
  const blurringMatches = content.match(/\bany\b/g)
  const blurringCount = blurringMatches ? blurringMatches.length : 0

  const hasClearBorders = hasInterface && hasReturnType
  const hasProperInterface = hasExport && hasImport
  const hasDefined = hasTypeAlias && hasEnum
  const hasSharp = hasGenerics && hasDefaultParam
  const hasContained = hasNamedExport && hasClass

  let boundary = 0
  if (hasExport) boundary += 10
  if (hasImport) boundary += 10
  if (hasInterface) boundary += 10
  if (hasClass) boundary += 8
  if (hasReturnType) boundary += 10
  if (hasNamedExport) boundary += 8
  if (hasTypeAlias) boundary += 8
  if (hasEnum) boundary += 8
  if (hasGenerics) boundary += 8
  if (hasDefaultParam) boundary += 8
  if (hasClearBorders) boundary += 5
  if (hasProperInterface) boundary += 5
  if (hasDefined) boundary += 5
  if (hasSharp) boundary += 5
  if (hasContained) boundary += 5

  boundary = Math.min(100, Math.round(boundary))

  let quality: EnvelopeMeasure['quality'] = 'no-boundary'
  if (boundary >= 85) quality = 'perfect-envelope'
  else if (boundary >= 70) quality = 'clean-boundary'
  else if (boundary >= 55) quality = 'proper-border'
  else if (boundary >= 40) quality = 'fuzzy-edge'
  else if (boundary >= 25) quality = 'porous'

  return {
    boundary,
    quality,
    hasHighBoundary: boundary >= 70,
    hasClearBorders,
    hasProperInterface,
    hasNoLeaking: leakingCount === 0,
    hasDefined,
    hasNoBlurring: blurringCount === 0,
    hasSharp,
    hasNoBleeding: blurringCount === 0 && leakingCount === 0,
    hasContained,
    hasNoSpillover: leakingCount === 0,
    leakingCount,
    blurringCount,
  }
}

/** @example measureElegant(content) evaluates code interface beauty */
export function measureElegant(content: string): ElegantMeasure {
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

  const uglinessMatches = content.match(/\bvar\s+/g)
  const uglinessCount = uglinessMatches ? uglinessMatches.length : 0
  const clumsinessMatches = content.match(/\bany\b/g)
  const clumsinessCount = clumsinessMatches ? clumsinessMatches.length : 0

  const hasBeautiful = hasExport && hasReturnType
  const hasElegant = hasInterface && hasOptionalParam
  const hasGraceful = hasDocComments && hasDefaultParam
  const hasRefined = hasGenerics && hasNamedExport
  const hasPolished = hasTypeAnnotation && hasConst

  let beauty = 0
  if (hasExport) beauty += 10
  if (hasInterface) beauty += 10
  if (hasReturnType) beauty += 10
  if (hasOptionalParam) beauty += 8
  if (hasDefaultParam) beauty += 8
  if (hasDocComments) beauty += 10
  if (hasGenerics) beauty += 8
  if (hasNamedExport) beauty += 8
  if (hasTypeAnnotation) beauty += 8
  if (hasConst) beauty += 8
  if (hasBeautiful) beauty += 5
  if (hasElegant) beauty += 5
  if (hasGraceful) beauty += 5
  if (hasRefined) beauty += 5
  if (hasPolished) beauty += 5

  beauty = Math.min(100, Math.round(beauty))

  let drape: ElegantMeasure['drape'] = 'tattered'
  if (beauty >= 85) drape = 'regal-drape'
  else if (beauty >= 70) drape = 'elegant-fold'
  else if (beauty >= 55) drape = 'proper-hang'
  else if (beauty >= 40) drape = 'slightly-wrinkled'
  else if (beauty >= 25) drape = 'sagging'

  return {
    beauty,
    drape,
    hasHighBeauty: beauty >= 70,
    hasBeautiful,
    hasElegant,
    hasNoUgliness: uglinessCount === 0,
    hasGraceful,
    hasNoClumsiness: clumsinessCount === 0,
    hasRefined,
    hasNoRoughness: uglinessCount === 0,
    hasPolished,
    hasNoCrudeness: uglinessCount === 0 && clumsinessCount === 0,
    uglinessCount,
    clumsinessCount,
  }
}

/** @example measureBackstage(content) evaluates code internal documentation */
export function measureBackstage(content: string): BackstageMeasure {
  const hasExport = /export\s/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInlineComments = /\/\/.*$/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)

  const mysteryMatches = content.match(/\bvar\s+/g)
  const mysteryCount = mysteryMatches ? mysteryMatches.length : 0
  const undocumentedMatches = content.match(/\bany\b/g)
  const undocumentedCount = undocumentedMatches ? undocumentedMatches.length : 0

  const hasDocumented = hasDocComments && hasReturnType
  const hasCommented = hasInlineComments && hasConst
  const hasExplained = hasNamedExport && hasTypeAnnotation
  const hasAnnotated = hasInterface && hasEnum
  const hasGuided = hasTypeAlias && hasExport

  let documentation = 0
  if (hasExport) documentation += 8
  if (hasDocComments) documentation += 10
  if (hasInlineComments) documentation += 8
  if (hasReturnType) documentation += 10
  if (hasNamedExport) documentation += 8
  if (hasTypeAnnotation) documentation += 8
  if (hasInterface) documentation += 10
  if (hasConst) documentation += 8
  if (hasEnum) documentation += 8
  if (hasTypeAlias) documentation += 8
  if (hasDocumented) documentation += 5
  if (hasCommented) documentation += 5
  if (hasExplained) documentation += 5
  if (hasAnnotated) documentation += 5
  if (hasGuided) documentation += 5

  documentation = Math.min(100, Math.round(documentation))

  let access: BackstageMeasure['access'] = 'no-script'
  if (documentation >= 85) access = 'full-program'
  else if (documentation >= 70) access = 'detailed-notes'
  else if (documentation >= 55) access = 'proper-script'
  else if (documentation >= 40) access = 'stage-directions'
  else if (documentation >= 25) access = 'scribbled-notes'

  return {
    documentation,
    access,
    hasHighDocumentation: documentation >= 70,
    hasDocumented,
    hasCommented,
    hasNoMystery: mysteryCount === 0,
    hasExplained,
    hasNoUndocumented: undocumentedCount === 0,
    hasAnnotated,
    hasNoSilent: mysteryCount === 0 && undocumentedCount === 0,
    hasGuided,
    hasNoBlackBox: mysteryCount === 0,
    mysteryCount,
    undocumentedCount,
  }
}

/** @example measurePublic(content) evaluates code public API */
export function measurePublic(content: string): PublicMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasOptionalParam = /\w+\?\s*[):\]]/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasConst = /\bconst\s+/.test(content)

  const complexityMatches = content.match(/\bvar\s+/g)
  const complexityCount = complexityMatches ? complexityMatches.length : 0
  const surpriseMatches = content.match(/\bany\b/g)
  const surpriseCount = surpriseMatches ? surpriseMatches.length : 0

  const hasCleanAPI = hasExport && hasReturnType
  const hasSimple = hasOptionalParam && hasDefaultParam
  const hasIntuitive = hasNamedExport && hasDocComments
  const hasDocumented = hasDocComments && hasInterface
  const hasConsistent = hasAsync && hasGenerics

  let api = 0
  if (hasExport) api += 10
  if (hasInterface) api += 8
  if (hasReturnType) api += 10
  if (hasNamedExport) api += 10
  if (hasOptionalParam) api += 8
  if (hasDefaultParam) api += 8
  if (hasDocComments) api += 10
  if (hasAsync) api += 8
  if (hasGenerics) api += 8
  if (hasConst) api += 8
  if (hasCleanAPI) api += 5
  if (hasSimple) api += 5
  if (hasIntuitive) api += 5
  if (hasDocumented) api += 5
  if (hasConsistent) api += 5

  api = Math.min(100, Math.round(api))

  let call: PublicMeasure['call'] = 'booed'
  if (api >= 85) call = 'standing-ovation'
  else if (api >= 70) call = 'enthusiastic-applause'
  else if (api >= 55) call = 'warm-reception'
  else if (api >= 40) call = 'polite-clapping'
  else if (api >= 25) call = 'crickets'

  return {
    api,
    call,
    hasHighApi: api >= 70,
    hasCleanAPI,
    hasSimple,
    hasNoComplexity: complexityCount === 0,
    hasIntuitive,
    hasNoSurprise: surpriseCount === 0,
    hasDocumented,
    hasNoConfusion: surpriseCount === 0,
    hasConsistent,
    hasNoInconsistency: complexityCount === 0 && surpriseCount === 0,
    complexityCount,
    surpriseCount,
  }
}

/** @example measureTheatrical(content) evaluates code overall presentation */
export function measureTheatrical(content: string): TheatricalMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content)

  const chaosMatches = content.match(/\bvar\s+/g)
  const chaosCount = chaosMatches ? chaosMatches.length : 0
  const disorderMatches = content.match(/\bany\b/g)
  const disorderCount = disorderMatches ? disorderMatches.length : 0

  const hasWellStructured = hasExport && hasImport
  const hasOrganized = hasInterface && hasClass
  const hasClearFlow = hasReturnType && hasAsync
  const hasPolished = hasDocComments && hasConst
  const hasProfessional = hasNamedExport && hasTryCatch

  let presentation = 0
  if (hasExport) presentation += 8
  if (hasImport) presentation += 8
  if (hasInterface) presentation += 10
  if (hasClass) presentation += 10
  if (hasReturnType) presentation += 10
  if (hasAsync) presentation += 8
  if (hasConst) presentation += 8
  if (hasDocComments) presentation += 10
  if (hasNamedExport) presentation += 8
  if (hasTryCatch) presentation += 8
  if (hasWellStructured) presentation += 5
  if (hasOrganized) presentation += 5
  if (hasClearFlow) presentation += 5
  if (hasPolished) presentation += 5
  if (hasProfessional) presentation += 5

  presentation = Math.min(100, Math.round(presentation))

  let quality: TheatricalMeasure['quality'] = 'disaster'
  if (presentation >= 85) quality = 'masterpiece-theater'
  else if (presentation >= 70) quality = 'fine-performance'
  else if (presentation >= 55) quality = 'proper-show'
  else if (presentation >= 40) quality = 'amateur-hour'
  else if (presentation >= 25) quality = 'rehearsal'

  return {
    presentation,
    quality,
    hasHighPresentation: presentation >= 70,
    hasWellStructured,
    hasOrganized,
    hasNoChaos: chaosCount === 0,
    hasClearFlow,
    hasNoDisorder: disorderCount === 0,
    hasPolished,
    hasNoMessiness: chaosCount === 0,
    hasProfessional,
    hasNoSloppiness: chaosCount === 0 && disorderCount === 0,
    chaosCount,
    disorderCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'velvet-masterpiece' */
export function classifyCondition(score: number): FoldCondition {
  if (score >= 85) return 'velvet-masterpiece'
  if (score >= 70) return 'fine-curtain'
  if (score >= 55) return 'proper-drape'
  if (score >= 40) return 'worn-fabric'
  if (score >= 25) return 'tattered-curtain'
  return 'no-curtain'
}

/** @example classifyRowType(folds) returns row classification */
export function classifyRowType(folds: CurtainFold[]): RowType {
  if (folds.length === 0) return 'empty-stage'
  const avgQs = folds.reduce((s, f) => s + f.qualityScore, 0) / folds.length
  const masterpieceCount = folds.filter((f) => f.condition === 'velvet-masterpiece').length
  const ratio = masterpieceCount / folds.length
  if (avgQs >= 75 && ratio >= 0.5) return 'grand-theater'
  if (avgQs >= 60) return 'opera-house'
  if (avgQs >= 45) return 'playhouse'
  if (avgQs >= 30) return 'community-theater'
  if (avgQs >= 15) return 'backstage'
  return 'empty-stage'
}

/** @example classifyRowCondition(avgQs) returns row condition */
export function classifyRowCondition(avgQs: number): RowCondition {
  if (avgQs >= 75) return 'broadway-quality'
  if (avgQs >= 60) return 'fine-performance'
  if (avgQs >= 45) return 'proper-production'
  if (avgQs >= 30) return 'amateur-show'
  if (avgQs >= 15) return 'failing-act'
  return 'dark-stage'
}

/** @example classifyDirectorGrade(80) returns 'master-director' */
export function classifyDirectorGrade(avgElegance: number): DirectorGrade {
  if (avgElegance >= 80) return 'master-director'
  if (avgElegance >= 65) return 'expert-producer'
  if (avgElegance >= 50) return 'skilled-director'
  if (avgElegance >= 35) return 'stage-manager'
  if (avgElegance >= 20) return 'apprentice'
  return 'audience-member'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeCurtainFold(content, filePath) evaluates single file */
export function analyzeCurtainFold(content: string, filePath: string): CurtainFold {
  const priv = measurePrivate(content)
  const envelope = measureEnvelope(content)
  const elegant = measureElegant(content)
  const backstage = measureBackstage(content)
  const pub = measurePublic(content)
  const theatrical = measureTheatrical(content)

  const qualityScore = Math.round(
    priv.encapsulation * 0.2 +
    envelope.boundary * 0.15 +
    elegant.beauty * 0.15 +
    backstage.documentation * 0.15 +
    pub.api * 0.15 +
    theatrical.presentation * 0.2,
  )

  return {
    file: filePath,
    privacy: priv.encapsulation,
    envelopeQuality: envelope.boundary,
    drapeElegance: elegant.beauty,
    backstageAccess: backstage.documentation,
    curtainCall: pub.api,
    theatricalQuality: theatrical.presentation,
    private: priv,
    envelope,
    elegant,
    backstage,
    public: pub,
    theatrical,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeCurtainRow(folds, dirPath) evaluates directory */
export function analyzeCurtainRow(folds: CurtainFold[], dirPath: string): CurtainRow {
  if (folds.length === 0) {
    return {
      directory: dirPath,
      folds: [],
      avgPrivacy: 0,
      avgElegance: 0,
      avgTheatrical: 0,
      velvetMasterpieceCount: 0,
      noCurtainCount: 0,
      fineCurtainCount: 0,
      properDrapeCount: 0,
      rowType: 'empty-stage',
      condition: 'dark-stage',
    }
  }

  const avgPrivacy = Math.round(folds.reduce((s, f) => s + f.privacy, 0) / folds.length)
  const avgElegance = Math.round(folds.reduce((s, f) => s + f.drapeElegance, 0) / folds.length)
  const avgTheatrical = Math.round(folds.reduce((s, f) => s + f.theatricalQuality, 0) / folds.length)

  const velvetMasterpieceCount = folds.filter((f) => f.condition === 'velvet-masterpiece').length
  const noCurtainCount = folds.filter((f) => f.condition === 'no-curtain').length
  const fineCurtainCount = folds.filter((f) => f.condition === 'fine-curtain').length
  const properDrapeCount = folds.filter((f) => f.condition === 'proper-drape').length

  const avgQs = folds.reduce((s, f) => s + f.qualityScore, 0) / folds.length

  return {
    directory: dirPath,
    folds,
    avgPrivacy,
    avgElegance,
    avgTheatrical,
    velvetMasterpieceCount,
    noCurtainCount,
    fineCurtainCount,
    properDrapeCount,
    rowType: classifyRowType(folds),
    condition: classifyRowCondition(avgQs),
  }
}

/** @example generateRecommendations(folds, rows, theater, stats) generates advice */
export function generateRecommendations(
  folds: CurtainFold[],
  rows: CurtainRow[],
  theater: VelvetTheater,
  stats: VelvetCurtainStats,
): string[] {
  const recs: string[] = []

  if (stats.avgPrivacy < 50) {
    recs.push('Improve privacy with private fields, readonly modifiers, and proper encapsulation')
  }
  if (stats.avgEnvelopeQuality < 50) {
    recs.push('Strengthen envelope with clear interfaces, type boundaries, and module separation')
  }
  if (stats.avgDrapeElegance < 50) {
    recs.push('Enhance elegance with optional parameters, documentation, and beautiful APIs')
  }
  if (stats.avgBackstageAccess < 50) {
    recs.push('Improve backstage with JSDoc comments, return types, and internal documentation')
  }
  if (stats.avgCurtainCall < 50) {
    recs.push('Refine curtain call with clean exports, intuitive APIs, and consistent naming')
  }
  if (stats.avgTheatricalQuality < 50) {
    recs.push('Boost theatrical quality with structured imports, error handling, and polished presentation')
  }
  if (stats.noCurtainCount > 0) {
    recs.push(`${String(stats.noCurtainCount)} file(s) have no curtain — consider significant refactoring`)
  }
  if (theater.overallElegance < 40) {
    recs.push('Overall elegance is low — prioritize encapsulation and presentation quality')
  }
  if (rows.length > 0 && rows.every((r) => r.rowType === 'empty-stage' || r.rowType === 'backstage')) {
    recs.push('All rows are degraded — consider a major quality improvement effort')
  }

  const noCurtain = folds.filter((f) => f.condition === 'no-curtain')
  if (noCurtain.length > 0 && noCurtain.length <= 3) {
    const names = noCurtain.map((f) => f.file).join(', ')
    recs.push(`Repair these curtain-less files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your code is a velvet masterpiece! The curtain rises to reveal elegant perfection')
  }

  return Array.from(new Set(recs))
}

/** @example buildVelvetCurtainResult(files, contents, options) orchestrates analysis */
export function buildVelvetCurtainResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): VelvetCurtainResult {
  const folds = files.map((file, i) => analyzeCurtainFold(contents[i] ?? '', file))

  const rMap = new Map<string, CurtainFold[]>()
  for (const fold of folds) {
    const dir = fold.file.includes('/') ? fold.file.split('/').slice(0, -1).join('/') : '.'
    const existing = rMap.get(dir)
    if (existing) {
      existing.push(fold)
    } else {
      rMap.set(dir, [fold])
    }
  }

  const rows = Array.from(rMap.entries()).map(([dir, dirFolds]) =>
    analyzeCurtainRow(dirFolds, dir),
  )

  const totalFiles = folds.length
  const avgPrivacy = totalFiles > 0 ? Math.round(folds.reduce((s, f) => s + f.privacy, 0) / totalFiles) : 0
  const avgEnvelopeQuality = totalFiles > 0 ? Math.round(folds.reduce((s, f) => s + f.envelopeQuality, 0) / totalFiles) : 0
  const avgDrapeElegance = totalFiles > 0 ? Math.round(folds.reduce((s, f) => s + f.drapeElegance, 0) / totalFiles) : 0
  const avgBackstageAccess = totalFiles > 0 ? Math.round(folds.reduce((s, f) => s + f.backstageAccess, 0) / totalFiles) : 0
  const avgCurtainCall = totalFiles > 0 ? Math.round(folds.reduce((s, f) => s + f.curtainCall, 0) / totalFiles) : 0
  const avgTheatricalQuality = totalFiles > 0 ? Math.round(folds.reduce((s, f) => s + f.theatricalQuality, 0) / totalFiles) : 0

  const avgElegance = avgDrapeElegance

  const overallElegance = totalFiles > 0
    ? Math.round((avgPrivacy + avgElegance + avgTheatricalQuality) / 3)
    : 0

  const theater: VelvetTheater = {
    avgPrivacy,
    avgElegance,
    avgTheatrical: avgTheatricalQuality,
    isElegant: avgPrivacy >= 60,
    overallElegance,
  }

  const bestFold = totalFiles > 0
    ? folds.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best), folds[0] as typeof folds[number]).file
    : ''
  const mostPrivate = totalFiles > 0
    ? folds.reduce((best, f) => (f.privacy > best.privacy ? f : best), folds[0] as typeof folds[number]).file
    : ''
  const bestBoundary = totalFiles > 0
    ? folds.reduce((best, f) => (f.envelopeQuality > best.envelopeQuality ? f : best), folds[0] as typeof folds[number]).file
    : ''
  const mostElegant = totalFiles > 0
    ? folds.reduce((best, f) => (f.drapeElegance > best.drapeElegance ? f : best), folds[0] as typeof folds[number]).file
    : ''
  const bestDocumented = totalFiles > 0
    ? folds.reduce((best, f) => (f.backstageAccess > best.backstageAccess ? f : best), folds[0] as typeof folds[number]).file
    : ''
  const bestAPI = totalFiles > 0
    ? folds.reduce((best, f) => (f.curtainCall > best.curtainCall ? f : best), folds[0] as typeof folds[number]).file
    : ''

  const stats: VelvetCurtainStats = {
    totalFiles,
    totalRows: rows.length,
    avgPrivacy,
    avgEnvelopeQuality,
    avgDrapeElegance,
    avgBackstageAccess,
    avgCurtainCall,
    avgTheatricalQuality,
    velvetMasterpieceCount: folds.filter((f) => f.condition === 'velvet-masterpiece').length,
    fineCurtainCount: folds.filter((f) => f.condition === 'fine-curtain').length,
    properDrapeCount: folds.filter((f) => f.condition === 'proper-drape').length,
    wornFabricCount: folds.filter((f) => f.condition === 'worn-fabric').length,
    tatteredCurtainCount: folds.filter((f) => f.condition === 'tattered-curtain').length,
    noCurtainCount: folds.filter((f) => f.condition === 'no-curtain').length,
    hasHighEncapsulationCount: folds.filter((f) => f.private.hasHighEncapsulation).length,
    hasHighBoundaryCount: folds.filter((f) => f.envelope.hasHighBoundary).length,
    hasHighBeautyCount: folds.filter((f) => f.elegant.hasHighBeauty).length,
    hasHighDocumentationCount: folds.filter((f) => f.backstage.hasHighDocumentation).length,
    hasHighApiCount: folds.filter((f) => f.public.hasHighApi).length,
    hasHighPresentationCount: folds.filter((f) => f.theatrical.hasHighPresentation).length,
    overallElegance,
    directorGrade: classifyDirectorGrade(overallElegance),
    bestFold,
    mostPrivate,
    bestBoundary,
    mostElegant,
    bestDocumented,
    bestAPI,
  }

  const recommendations = generateRecommendations(folds, rows, theater, stats)

  return { folds, rows, theater, stats, recommendations }
}
