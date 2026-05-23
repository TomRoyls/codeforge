// ─── Types ─────────────────────────────────────────────────────────────────

export interface DeepMeasure {
  complexityHandling: number
  penetration: 'abyssal-depth' | 'deep-understanding' | 'proper-depth' | 'surface-scratch' | 'shallow' | 'puddle'
  hasHighComplexityHandling: boolean
  hasDeep: boolean
  hasThorough: boolean
  hasNoShallowness: boolean
  hasProfound: boolean
  hasNoSuperficial: boolean
  hasLayered: boolean
  hasNoFlatness: boolean
  hasNuanced: boolean
  hasNoSimplistic: boolean
  shallownessCount: number
  flatnessCount: number
}

export interface ClearMeasure {
  darkReadability: number
  vision: 'night-vision' | 'dark-adapted' | 'candlelight-reading' | 'squinting' | 'fumbling' | 'blind'
  hasHighDarkReadability: boolean
  hasReadableInComplexity: boolean
  hasClearInDark: boolean
  hasNoObfuscation: boolean
  hasUnderstandable: boolean
  hasNoImpenetrable: boolean
  hasNavigable: boolean
  hasNoLabyrinth: boolean
  hasInsightful: boolean
  hasNoMystery: boolean
  obfuscationCount: number
  impenetrableCount: number
}

export interface ScriptoriumMeasure {
  workspaceQuality: number
  environment: 'grand-scriptorium' | 'monastery-library' | 'proper-study' | 'cluttered-desk' | 'dark-corner' | 'dungeon'
  hasHighWorkspaceQuality: boolean
  hasOrganized: boolean
  hasClean: boolean
  hasNoMessiness: boolean
  hasStructured: boolean
  hasNoChaos: boolean
  hasTidy: boolean
  hasNoDisorder: boolean
  hasSystematic: boolean
  hasNoScattered: boolean
  messinessCount: number
  chaosCount: number
}

export interface PreservedMeasure {
  documentation: number
  archive: 'vellum-manuscript' | 'bound-codex' | 'proper-scroll' | 'loose-pages' | 'faded-papyrus' | 'dust'
  hasHighDocumentation: boolean
  hasWellDocumented: boolean
  hasPreserved: boolean
  hasNoUndocumented: boolean
  hasAnnotated: boolean
  hasNoSilent: boolean
  hasExamples: boolean
  hasNoBlindSpots: boolean
  hasExplained: boolean
  hasNoMystery: boolean
  undocumentedCount: number
  silentCount: number
}

export interface IlluminatedMeasure {
  highlighting: number
  artistry: 'gold-illuminated' | 'vivid-capitals' | 'proper-headings' | 'plain-text' | 'faded-ink' | 'invisible'
  hasHighHighlighting: boolean
  hasStructured: boolean
  hasHeadings: boolean
  hasNoFlatText: boolean
  hasVisual: boolean
  hasNoWall: boolean
  hasOrganized: boolean
  hasNoMonolith: boolean
  hasSectioned: boolean
  hasNoBlob: boolean
  flatTextCount: number
  wallCount: number
}

export interface ScholarlyMeasure {
  craftsmanship: number
  skill: 'master-scribe' | 'expert-craftsman' | 'skilled-artisan' | 'competent-worker' | 'apprentice' | 'finger-painting'
  hasHighCraftsmanship: boolean
  hasCareful: boolean
  hasPrecise: boolean
  hasNoSloppiness: boolean
  hasRefined: boolean
  hasNoRoughness: boolean
  hasPolished: boolean
  hasNoCrudeness: boolean
  hasMasterful: boolean
  hasNoAmateur: boolean
  sloppinessCount: number
  roughnessCount: number
}

export type StrokeCondition = 'masterpiece-manuscript' | 'fine-codex' | 'proper-scroll' | 'faded-text' | 'crumbling-parchment' | 'dust'

export interface InkStroke {
  file: string
  depth: number
  darkClarity: number
  scriptoriumQuality: number
  manuscriptPreservation: number
  illuminatedText: number
  scholarlyCraft: number
  deep: DeepMeasure
  clear: ClearMeasure
  scriptorium: ScriptoriumMeasure
  preserved: PreservedMeasure
  illuminated: IlluminatedMeasure
  scholarly: ScholarlyMeasure
  condition: StrokeCondition
  qualityScore: number
}

export type CollectionType = 'great-library' | 'monastery-archive' | 'scholars-study' | 'bookshelf' | 'scattered-papers' | 'empty-room'
export type CollectionCondition = 'treasured-archive' | 'valuable-collection' | 'decent-library' | 'fading-shelves' | 'dusty-corner' | 'lost-knowledge'

export interface ManuscriptCollection {
  directory: string
  strokes: InkStroke[]
  avgDepth: number
  avgPreservation: number
  avgCraftsmanship: number
  masterpieceCount: number
  dustCount: number
  fineCodexCount: number
  properScrollCount: number
  collectionType: CollectionType
  condition: CollectionCondition
}

export interface MidnightInkLibrary {
  avgDepth: number
  avgPreservation: number
  avgCraftsmanship: number
  isMasterful: boolean
  overallScholarship: number
}

export type ScribeGrade = 'arch-scribe' | 'master-illuminator' | 'skilled-scribe' | 'apprentice-copier' | 'novice' | 'illiterate'

export interface MidnightInkStats {
  totalFiles: number
  totalCollections: number
  avgDepth: number
  avgDarkClarity: number
  avgScriptoriumQuality: number
  avgManuscriptPreservation: number
  avgIlluminatedText: number
  avgScholarlyCraft: number
  masterpieceManuscriptCount: number
  fineCodexCount: number
  properScrollCount: number
  fadedTextCount: number
  crumblingParchmentCount: number
  dustCount: number
  hasHighComplexityHandlingCount: number
  hasHighDarkReadabilityCount: number
  hasHighWorkspaceQualityCount: number
  hasHighDocumentationCount: number
  hasHighHighlightingCount: number
  hasHighCraftsmanshipCount: number
  overallScholarship: number
  scribeGrade: ScribeGrade
  bestStroke: string
  deepest: string
  clearest: string
  bestWorkspace: string
  bestDocumented: string
  bestStructured: string
}

export interface MidnightInkResult {
  strokes: InkStroke[]
  collections: ManuscriptCollection[]
  library: MidnightInkLibrary
  stats: MidnightInkStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureDeep(content) evaluates code complexity handling */
export function measureDeep(content: string): DeepMeasure {
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

  const shallownessMatches = content.match(/\bvar\s+/g)
  const shallownessCount = shallownessMatches ? shallownessMatches.length : 0
  const flatnessMatches = content.match(/\bany\b/g)
  const flatnessCount = flatnessMatches ? flatnessMatches.length : 0

  const hasDeep = hasConst && hasReturnType
  const hasThorough = hasExport && hasNamedExport
  const hasProfound = hasInterface && hasClass
  const hasLayered = hasStrictEquality && hasOptionalChaining
  const hasNuanced = hasPrivate && hasReadonly

  let complexityHandling = 0
  if (hasExport) complexityHandling += 8
  if (hasConst) complexityHandling += 10
  if (hasReturnType) complexityHandling += 10
  if (hasInterface) complexityHandling += 8
  if (hasClass) complexityHandling += 8
  if (hasPrivate) complexityHandling += 8
  if (hasReadonly) complexityHandling += 8
  if (hasStrictEquality) complexityHandling += 10
  if (hasNamedExport) complexityHandling += 8
  if (hasOptionalChaining) complexityHandling += 8
  if (hasDeep) complexityHandling += 5
  if (hasThorough) complexityHandling += 5
  if (hasProfound) complexityHandling += 5
  if (hasLayered) complexityHandling += 5
  if (hasNuanced) complexityHandling += 5

  complexityHandling = Math.min(100, Math.round(complexityHandling))

  let penetration: DeepMeasure['penetration'] = 'puddle'
  if (complexityHandling >= 85) penetration = 'abyssal-depth'
  else if (complexityHandling >= 70) penetration = 'deep-understanding'
  else if (complexityHandling >= 55) penetration = 'proper-depth'
  else if (complexityHandling >= 40) penetration = 'surface-scratch'
  else if (complexityHandling >= 25) penetration = 'shallow'

  return {
    complexityHandling,
    penetration,
    hasHighComplexityHandling: complexityHandling >= 70,
    hasDeep,
    hasThorough,
    hasNoShallowness: shallownessCount === 0,
    hasProfound,
    hasNoSuperficial: flatnessCount === 0,
    hasLayered,
    hasNoFlatness: shallownessCount === 0,
    hasNuanced,
    hasNoSimplistic: shallownessCount === 0 && flatnessCount === 0,
    shallownessCount,
    flatnessCount,
  }
}

/** @example measureClear(content) evaluates code readability in complexity */
export function measureClear(content: string): ClearMeasure {
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
  const impenetrableMatches = content.match(/\bany\b/g)
  const impenetrableCount = impenetrableMatches ? impenetrableMatches.length : 0

  const hasReadableInComplexity = hasExport && hasReturnType
  const hasClearInDark = hasInterface && hasClass
  const hasUnderstandable = hasConst && hasTypeAnnotation
  const hasNavigable = hasNamedExport && hasAsync
  const hasInsightful = hasImport && hasDocComments

  let darkReadability = 0
  if (hasExport) darkReadability += 10
  if (hasImport) darkReadability += 10
  if (hasReturnType) darkReadability += 10
  if (hasInterface) darkReadability += 8
  if (hasClass) darkReadability += 8
  if (hasConst) darkReadability += 8
  if (hasDocComments) darkReadability += 10
  if (hasTypeAnnotation) darkReadability += 8
  if (hasNamedExport) darkReadability += 8
  if (hasAsync) darkReadability += 8
  if (hasReadableInComplexity) darkReadability += 5
  if (hasClearInDark) darkReadability += 5
  if (hasUnderstandable) darkReadability += 5
  if (hasNavigable) darkReadability += 5
  if (hasInsightful) darkReadability += 5

  darkReadability = Math.min(100, Math.round(darkReadability))

  let vision: ClearMeasure['vision'] = 'blind'
  if (darkReadability >= 85) vision = 'night-vision'
  else if (darkReadability >= 70) vision = 'dark-adapted'
  else if (darkReadability >= 55) vision = 'candlelight-reading'
  else if (darkReadability >= 40) vision = 'squinting'
  else if (darkReadability >= 25) vision = 'fumbling'

  return {
    darkReadability,
    vision,
    hasHighDarkReadability: darkReadability >= 70,
    hasReadableInComplexity,
    hasClearInDark,
    hasNoObfuscation: obfuscationCount === 0,
    hasUnderstandable,
    hasNoImpenetrable: impenetrableCount === 0,
    hasNavigable,
    hasNoLabyrinth: obfuscationCount === 0 && impenetrableCount === 0,
    hasInsightful,
    hasNoMystery: obfuscationCount === 0,
    obfuscationCount,
    impenetrableCount,
  }
}

/** @example measureScriptorium(content) evaluates code workspace quality */
export function measureScriptorium(content: string): ScriptoriumMeasure {
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

  const messinessMatches = content.match(/\bvar\s+/g)
  const messinessCount = messinessMatches ? messinessMatches.length : 0
  const chaosMatches = content.match(/\bany\b/g)
  const chaosCount = chaosMatches ? chaosMatches.length : 0

  const hasOrganized = hasExport && hasReturnType
  const hasClean = hasInterface && hasConst
  const hasStructured = hasPrivate && hasReadonly
  const hasTidy = hasGenerics && hasTypeAlias
  const hasSystematic = hasEnum && hasNamedExport

  let workspaceQuality = 0
  if (hasExport) workspaceQuality += 10
  if (hasInterface) workspaceQuality += 10
  if (hasReturnType) workspaceQuality += 10
  if (hasConst) workspaceQuality += 8
  if (hasTypeAlias) workspaceQuality += 8
  if (hasEnum) workspaceQuality += 8
  if (hasGenerics) workspaceQuality += 8
  if (hasPrivate) workspaceQuality += 8
  if (hasReadonly) workspaceQuality += 8
  if (hasNamedExport) workspaceQuality += 10
  if (hasOrganized) workspaceQuality += 5
  if (hasClean) workspaceQuality += 5
  if (hasStructured) workspaceQuality += 5
  if (hasTidy) workspaceQuality += 5
  if (hasSystematic) workspaceQuality += 5

  workspaceQuality = Math.min(100, Math.round(workspaceQuality))

  let environment: ScriptoriumMeasure['environment'] = 'dungeon'
  if (workspaceQuality >= 85) environment = 'grand-scriptorium'
  else if (workspaceQuality >= 70) environment = 'monastery-library'
  else if (workspaceQuality >= 55) environment = 'proper-study'
  else if (workspaceQuality >= 40) environment = 'cluttered-desk'
  else if (workspaceQuality >= 25) environment = 'dark-corner'

  return {
    workspaceQuality,
    environment,
    hasHighWorkspaceQuality: workspaceQuality >= 70,
    hasOrganized,
    hasClean,
    hasNoMessiness: messinessCount === 0,
    hasStructured,
    hasNoChaos: chaosCount === 0,
    hasTidy,
    hasNoDisorder: messinessCount === 0 && chaosCount === 0,
    hasSystematic,
    hasNoScattered: messinessCount === 0,
    messinessCount,
    chaosCount,
  }
}

/** @example measurePreserved(content) evaluates code documentation */
export function measurePreserved(content: string): PreservedMeasure {
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

  const undocumentedMatches = content.match(/\bvar\s+/g)
  const undocumentedCount = undocumentedMatches ? undocumentedMatches.length : 0
  const silentMatches = content.match(/\bany\b/g)
  const silentCount = silentMatches ? silentMatches.length : 0

  const hasWellDocumented = hasDocComments && hasReturnType
  const hasPreserved = hasExport && hasConst
  const hasAnnotated = hasInterface && hasClass
  const hasExamples = hasNamedExport && hasTypeAnnotation
  const hasExplained = hasPrivate && hasReadonly

  let documentation = 0
  if (hasExport) documentation += 8
  if (hasDocComments) documentation += 15
  if (hasReturnType) documentation += 10
  if (hasConst) documentation += 8
  if (hasInterface) documentation += 8
  if (hasClass) documentation += 8
  if (hasNamedExport) documentation += 8
  if (hasTypeAnnotation) documentation += 8
  if (hasReadonly) documentation += 8
  if (hasPrivate) documentation += 8
  if (hasWellDocumented) documentation += 5
  if (hasPreserved) documentation += 5
  if (hasAnnotated) documentation += 5
  if (hasExamples) documentation += 5
  if (hasExplained) documentation += 5

  documentation = Math.min(100, Math.round(documentation))

  let archive: PreservedMeasure['archive'] = 'dust'
  if (documentation >= 85) archive = 'vellum-manuscript'
  else if (documentation >= 70) archive = 'bound-codex'
  else if (documentation >= 55) archive = 'proper-scroll'
  else if (documentation >= 40) archive = 'loose-pages'
  else if (documentation >= 25) archive = 'faded-papyrus'

  return {
    documentation,
    archive,
    hasHighDocumentation: documentation >= 70,
    hasWellDocumented,
    hasPreserved,
    hasNoUndocumented: undocumentedCount === 0,
    hasAnnotated,
    hasNoSilent: silentCount === 0,
    hasExamples,
    hasNoBlindSpots: undocumentedCount === 0 && silentCount === 0,
    hasExplained,
    hasNoMystery: undocumentedCount === 0,
    undocumentedCount,
    silentCount,
  }
}

/** @example measureIlluminated(content) evaluates code highlighting/structure */
export function measureIlluminated(content: string): IlluminatedMeasure {
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

  const flatTextMatches = content.match(/\bvar\s+/g)
  const flatTextCount = flatTextMatches ? flatTextMatches.length : 0
  const wallMatches = content.match(/\bany\b/g)
  const wallCount = wallMatches ? wallMatches.length : 0

  const hasStructured = hasExport && hasConst
  const hasHeadings = hasReturnType && hasNamedExport
  const hasVisual = hasDocComments && hasTypeAnnotation
  const hasOrganized = hasInterface && hasClass
  const hasSectioned = hasStrictEquality && hasReadonly

  let highlighting = 0
  if (hasExport) highlighting += 10
  if (hasConst) highlighting += 10
  if (hasReturnType) highlighting += 10
  if (hasNamedExport) highlighting += 8
  if (hasDocComments) highlighting += 8
  if (hasTypeAnnotation) highlighting += 8
  if (hasInterface) highlighting += 10
  if (hasClass) highlighting += 8
  if (hasStrictEquality) highlighting += 8
  if (hasReadonly) highlighting += 8
  if (hasStructured) highlighting += 5
  if (hasHeadings) highlighting += 5
  if (hasVisual) highlighting += 5
  if (hasOrganized) highlighting += 5
  if (hasSectioned) highlighting += 5

  highlighting = Math.min(100, Math.round(highlighting))

  let artistry: IlluminatedMeasure['artistry'] = 'invisible'
  if (highlighting >= 85) artistry = 'gold-illuminated'
  else if (highlighting >= 70) artistry = 'vivid-capitals'
  else if (highlighting >= 55) artistry = 'proper-headings'
  else if (highlighting >= 40) artistry = 'plain-text'
  else if (highlighting >= 25) artistry = 'faded-ink'

  return {
    highlighting,
    artistry,
    hasHighHighlighting: highlighting >= 70,
    hasStructured,
    hasHeadings,
    hasNoFlatText: flatTextCount === 0,
    hasVisual,
    hasNoWall: wallCount === 0,
    hasOrganized,
    hasNoMonolith: flatTextCount === 0 && wallCount === 0,
    hasSectioned,
    hasNoBlob: flatTextCount === 0,
    flatTextCount,
    wallCount,
  }
}

/** @example measureScholarly(content) evaluates code craftsmanship */
export function measureScholarly(content: string): ScholarlyMeasure {
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

  const sloppinessMatches = content.match(/\bvar\s+/g)
  const sloppinessCount = sloppinessMatches ? sloppinessMatches.length : 0
  const roughnessMatches = content.match(/\bany\b/g)
  const roughnessCount = roughnessMatches ? roughnessMatches.length : 0

  const hasCareful = hasExport && hasConst
  const hasPrecise = hasReturnType && hasDocComments
  const hasRefined = hasInterface && hasClass
  const hasPolished = hasPrivate && hasReadonly
  const hasMasterful = hasNamedExport && hasTypeAnnotation

  let craftsmanship = 0
  if (hasExport) craftsmanship += 10
  if (hasInterface) craftsmanship += 8
  if (hasClass) craftsmanship += 8
  if (hasPrivate) craftsmanship += 10
  if (hasReadonly) craftsmanship += 8
  if (hasReturnType) craftsmanship += 10
  if (hasConst) craftsmanship += 8
  if (hasDocComments) craftsmanship += 10
  if (hasNamedExport) craftsmanship += 8
  if (hasTypeAnnotation) craftsmanship += 8
  if (hasCareful) craftsmanship += 5
  if (hasPrecise) craftsmanship += 5
  if (hasRefined) craftsmanship += 5
  if (hasPolished) craftsmanship += 5
  if (hasMasterful) craftsmanship += 5

  craftsmanship = Math.min(100, Math.round(craftsmanship))

  let skill: ScholarlyMeasure['skill'] = 'finger-painting'
  if (craftsmanship >= 85) skill = 'master-scribe'
  else if (craftsmanship >= 70) skill = 'expert-craftsman'
  else if (craftsmanship >= 55) skill = 'skilled-artisan'
  else if (craftsmanship >= 40) skill = 'competent-worker'
  else if (craftsmanship >= 25) skill = 'apprentice'

  return {
    craftsmanship,
    skill,
    hasHighCraftsmanship: craftsmanship >= 70,
    hasCareful,
    hasPrecise,
    hasNoSloppiness: sloppinessCount === 0,
    hasRefined,
    hasNoRoughness: roughnessCount === 0,
    hasPolished,
    hasNoCrudeness: sloppinessCount === 0 && roughnessCount === 0,
    hasMasterful,
    hasNoAmateur: sloppinessCount === 0,
    sloppinessCount,
    roughnessCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'masterpiece-manuscript' */
export function classifyCondition(score: number): StrokeCondition {
  if (score >= 85) return 'masterpiece-manuscript'
  if (score >= 70) return 'fine-codex'
  if (score >= 55) return 'proper-scroll'
  if (score >= 40) return 'faded-text'
  if (score >= 25) return 'crumbling-parchment'
  return 'dust'
}

/** @example classifyCollectionType(strokes) returns collection classification */
export function classifyCollectionType(strokes: InkStroke[]): CollectionType {
  if (strokes.length === 0) return 'empty-room'
  const avgQs = strokes.reduce((s, st) => s + st.qualityScore, 0) / strokes.length
  const masterpieceCount = strokes.filter((st) => st.condition === 'masterpiece-manuscript').length
  const ratio = masterpieceCount / strokes.length
  if (avgQs >= 75 && ratio >= 0.5) return 'great-library'
  if (avgQs >= 60) return 'monastery-archive'
  if (avgQs >= 45) return 'scholars-study'
  if (avgQs >= 30) return 'bookshelf'
  if (avgQs >= 15) return 'scattered-papers'
  return 'empty-room'
}

/** @example classifyCollectionCondition(avgQs) returns collection condition */
export function classifyCollectionCondition(avgQs: number): CollectionCondition {
  if (avgQs >= 75) return 'treasured-archive'
  if (avgQs >= 60) return 'valuable-collection'
  if (avgQs >= 45) return 'decent-library'
  if (avgQs >= 30) return 'fading-shelves'
  if (avgQs >= 15) return 'dusty-corner'
  return 'lost-knowledge'
}

/** @example classifyScribeGrade(80) returns 'arch-scribe' */
export function classifyScribeGrade(avgScholarship: number): ScribeGrade {
  if (avgScholarship >= 80) return 'arch-scribe'
  if (avgScholarship >= 65) return 'master-illuminator'
  if (avgScholarship >= 50) return 'skilled-scribe'
  if (avgScholarship >= 35) return 'apprentice-copier'
  if (avgScholarship >= 20) return 'novice'
  return 'illiterate'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeInkStroke(content, filePath) evaluates single file */
export function analyzeInkStroke(content: string, filePath: string): InkStroke {
  const deep = measureDeep(content)
  const clear = measureClear(content)
  const scriptorium = measureScriptorium(content)
  const preserved = measurePreserved(content)
  const illuminated = measureIlluminated(content)
  const scholarly = measureScholarly(content)

  const qualityScore = Math.round(
    deep.complexityHandling * 0.2 +
    clear.darkReadability * 0.15 +
    scriptorium.workspaceQuality * 0.15 +
    preserved.documentation * 0.15 +
    illuminated.highlighting * 0.15 +
    scholarly.craftsmanship * 0.2,
  )

  return {
    file: filePath,
    depth: deep.complexityHandling,
    darkClarity: clear.darkReadability,
    scriptoriumQuality: scriptorium.workspaceQuality,
    manuscriptPreservation: preserved.documentation,
    illuminatedText: illuminated.highlighting,
    scholarlyCraft: scholarly.craftsmanship,
    deep,
    clear,
    scriptorium,
    preserved,
    illuminated,
    scholarly,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeManuscriptCollection(strokes, dirPath) evaluates directory */
export function analyzeManuscriptCollection(strokes: InkStroke[], dirPath: string): ManuscriptCollection {
  if (strokes.length === 0) {
    return {
      directory: dirPath,
      strokes: [],
      avgDepth: 0,
      avgPreservation: 0,
      avgCraftsmanship: 0,
      masterpieceCount: 0,
      dustCount: 0,
      fineCodexCount: 0,
      properScrollCount: 0,
      collectionType: 'empty-room',
      condition: 'lost-knowledge',
    }
  }

  const avgDepth = Math.round(strokes.reduce((s, st) => s + st.depth, 0) / strokes.length)
  const avgPreservation = Math.round(strokes.reduce((s, st) => s + st.manuscriptPreservation, 0) / strokes.length)
  const avgCraftsmanship = Math.round(strokes.reduce((s, st) => s + st.scholarlyCraft, 0) / strokes.length)

  const masterpieceCount = strokes.filter((st) => st.condition === 'masterpiece-manuscript').length
  const dustCount = strokes.filter((st) => st.condition === 'dust').length
  const fineCodexCount = strokes.filter((st) => st.condition === 'fine-codex').length
  const properScrollCount = strokes.filter((st) => st.condition === 'proper-scroll').length

  const avgQs = strokes.reduce((s, st) => s + st.qualityScore, 0) / strokes.length

  return {
    directory: dirPath,
    strokes,
    avgDepth,
    avgPreservation,
    avgCraftsmanship,
    masterpieceCount,
    dustCount,
    fineCodexCount,
    properScrollCount,
    collectionType: classifyCollectionType(strokes),
    condition: classifyCollectionCondition(avgQs),
  }
}

/** @example generateRecommendations(strokes, collections, library, stats) generates advice */
export function generateRecommendations(
  strokes: InkStroke[],
  collections: ManuscriptCollection[],
  library: MidnightInkLibrary,
  stats: MidnightInkStats,
): string[] {
  const recs: string[] = []

  if (stats.avgDepth < 50) {
    recs.push('Deepen code with const declarations, return types, and strict equality patterns')
  }
  if (stats.avgDarkClarity < 50) {
    recs.push('Improve dark clarity with clear exports, documentation, and typed interfaces')
  }
  if (stats.avgScriptoriumQuality < 50) {
    recs.push('Clean up the scriptorium with private fields, generics, and essential type patterns')
  }
  if (stats.avgManuscriptPreservation < 50) {
    recs.push('Preserve manuscripts with JSDoc comments, return types, and thorough documentation')
  }
  if (stats.avgIlluminatedText < 50) {
    recs.push('Illuminate code with structured exports, interfaces, and section headings')
  }
  if (stats.avgScholarlyCraft < 50) {
    recs.push('Improve craftsmanship with interfaces, classes, documentation, and battle-tested patterns')
  }
  if (stats.dustCount > 0) {
    recs.push(`${String(stats.dustCount)} file(s) are dust — consider significant refactoring`)
  }
  if (library.overallScholarship < 40) {
    recs.push('Overall scholarship is low — prioritize depth and craftsmanship')
  }
  if (collections.length > 0 && collections.every((c) => c.collectionType === 'empty-room' || c.collectionType === 'scattered-papers')) {
    recs.push('All collections are degraded — consider a major quality improvement effort')
  }

  const dustFiles = strokes.filter((st) => st.condition === 'dust')
  if (dustFiles.length > 0 && dustFiles.length <= 3) {
    const names = dustFiles.map((st) => st.file).join(', ')
    recs.push(`Restore these dust files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your code is a masterfully illuminated manuscript! Scholarly craft at its finest')
  }

  return Array.from(new Set(recs))
}

/** @example buildMidnightInkResult(files, contents, options) orchestrates analysis */
export function buildMidnightInkResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): MidnightInkResult {
  const strokes = files.map((file, i) => analyzeInkStroke(contents[i] ?? '', file))

  const cMap = new Map<string, InkStroke[]>()
  for (const stroke of strokes) {
    const dir = stroke.file.includes('/') ? stroke.file.split('/').slice(0, -1).join('/') : '.'
    const existing = cMap.get(dir)
    if (existing) {
      existing.push(stroke)
    } else {
      cMap.set(dir, [stroke])
    }
  }

  const collections = Array.from(cMap.entries()).map(([dir, dirStrokes]) =>
    analyzeManuscriptCollection(dirStrokes, dir),
  )

  const totalFiles = strokes.length
  const avgDepth = totalFiles > 0 ? Math.round(strokes.reduce((s, st) => s + st.depth, 0) / totalFiles) : 0
  const avgDarkClarity = totalFiles > 0 ? Math.round(strokes.reduce((s, st) => s + st.darkClarity, 0) / totalFiles) : 0
  const avgScriptoriumQuality = totalFiles > 0 ? Math.round(strokes.reduce((s, st) => s + st.scriptoriumQuality, 0) / totalFiles) : 0
  const avgManuscriptPreservation = totalFiles > 0 ? Math.round(strokes.reduce((s, st) => s + st.manuscriptPreservation, 0) / totalFiles) : 0
  const avgIlluminatedText = totalFiles > 0 ? Math.round(strokes.reduce((s, st) => s + st.illuminatedText, 0) / totalFiles) : 0
  const avgScholarlyCraft = totalFiles > 0 ? Math.round(strokes.reduce((s, st) => s + st.scholarlyCraft, 0) / totalFiles) : 0

  const avgPreservation = avgManuscriptPreservation
  const avgCraftsmanship = avgScholarlyCraft

  const overallScholarship = totalFiles > 0
    ? Math.round((avgDepth + avgPreservation + avgCraftsmanship) / 3)
    : 0

  const library: MidnightInkLibrary = {
    avgDepth,
    avgPreservation,
    avgCraftsmanship,
    isMasterful: avgDepth >= 60,
    overallScholarship,
  }

  const bestStroke = totalFiles > 0
    ? strokes.reduce((best, st) => (st.qualityScore > best.qualityScore ? st : best), strokes[0]).file
    : ''
  const deepest = totalFiles > 0
    ? strokes.reduce((best, st) => (st.depth > best.depth ? st : best), strokes[0]).file
    : ''
  const clearest = totalFiles > 0
    ? strokes.reduce((best, st) => (st.darkClarity > best.darkClarity ? st : best), strokes[0]).file
    : ''
  const bestWorkspace = totalFiles > 0
    ? strokes.reduce((best, st) => (st.scriptoriumQuality > best.scriptoriumQuality ? st : best), strokes[0]).file
    : ''
  const bestDocumented = totalFiles > 0
    ? strokes.reduce((best, st) => (st.manuscriptPreservation > best.manuscriptPreservation ? st : best), strokes[0]).file
    : ''
  const bestStructured = totalFiles > 0
    ? strokes.reduce((best, st) => (st.illuminatedText > best.illuminatedText ? st : best), strokes[0]).file
    : ''

  const stats: MidnightInkStats = {
    totalFiles,
    totalCollections: collections.length,
    avgDepth,
    avgDarkClarity,
    avgScriptoriumQuality,
    avgManuscriptPreservation,
    avgIlluminatedText,
    avgScholarlyCraft,
    masterpieceManuscriptCount: strokes.filter((st) => st.condition === 'masterpiece-manuscript').length,
    fineCodexCount: strokes.filter((st) => st.condition === 'fine-codex').length,
    properScrollCount: strokes.filter((st) => st.condition === 'proper-scroll').length,
    fadedTextCount: strokes.filter((st) => st.condition === 'faded-text').length,
    crumblingParchmentCount: strokes.filter((st) => st.condition === 'crumbling-parchment').length,
    dustCount: strokes.filter((st) => st.condition === 'dust').length,
    hasHighComplexityHandlingCount: strokes.filter((st) => st.deep.hasHighComplexityHandling).length,
    hasHighDarkReadabilityCount: strokes.filter((st) => st.clear.hasHighDarkReadability).length,
    hasHighWorkspaceQualityCount: strokes.filter((st) => st.scriptorium.hasHighWorkspaceQuality).length,
    hasHighDocumentationCount: strokes.filter((st) => st.preserved.hasHighDocumentation).length,
    hasHighHighlightingCount: strokes.filter((st) => st.illuminated.hasHighHighlighting).length,
    hasHighCraftsmanshipCount: strokes.filter((st) => st.scholarly.hasHighCraftsmanship).length,
    overallScholarship,
    scribeGrade: classifyScribeGrade(overallScholarship),
    bestStroke,
    deepest,
    clearest,
    bestWorkspace,
    bestDocumented,
    bestStructured,
  }

  const recommendations = generateRecommendations(strokes, collections, library, stats)

  return { strokes, collections, library, stats, recommendations }
}
