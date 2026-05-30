// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface CompressiveMeasure {
  strength: number
  grade: 'diamond-pillar' | 'obsidian-strong' | 'basalt-firm' | 'sandstone-moderate' | 'chalk-weak' | 'crumbling'
  hasHighStrength: boolean
  hasLoadDistribution: boolean
  hasNoStressConcentration: boolean
  hasProperBearings: boolean
  hasNoOverloading: boolean
  hasCompressive: boolean
  hasNoCrushing: boolean
  hasEvenDistribution: boolean
  hasNoWeakPoints: boolean
  hasReinforced: boolean
  stressConcentrationCount: number
  crushingCount: number
}

export interface VolcanicMeasure {
  resilience: number
  recovery: 'instant-cooling' | 'rapid-solidification' | 'proper-tempering' | 'slow-cooling' | 'thermal-shock' | 'shattered'
  hasHighResilience: boolean
  hasErrorRecovery: boolean
  hasProperCooling: boolean
  hasNoThermalShock: boolean
  hasGracefulDegradation: boolean
  hasNoBrittleFailure: boolean
  hasRegenerative: boolean
  hasNoCatastrophicFailure: boolean
  hasAdaptive: boolean
  hasNoCascade: boolean
  thermalShockCount: number
  cascadeCount: number
}

export interface DarkMeasure {
  clarity: number
  quality: 'midnight-sun' | 'starlit-clarity' | 'moonlit-readable' | 'dusk-readable' | 'murky-dark' | 'pitch-black'
  hasHighClarity: boolean
  hasReadableComplexity: boolean
  hasProperAbstraction: boolean
  hasNoObfuscation: boolean
  hasClearInDark: boolean
  hasNoImpenetrable: boolean
  hasLogicalFlow: boolean
  hasNoSpaghetti: boolean
  hasCommentary: boolean
  hasNoMystery: boolean
  obfuscationCount: number
  mysteryCount: number
}

export interface AlignmentMeasure {
  level: number
  precision: 'laser-aligned' | 'plumb-perfect' | 'well-aligned' | 'mostly-straight' | 'leaning' | 'crooked'
  hasHighLevel: boolean
  hasConsistentStyle: boolean
  hasNoDeviation: boolean
  hasProperOrientation: boolean
  hasNoMisalignment: boolean
  hasUniform: boolean
  hasNoContradiction: boolean
  hasStraightPaths: boolean
  hasNoWandering: boolean
  hasAligned: boolean
  deviationCount: number
  misalignmentCount: number
}

export interface FoundationMeasure {
  anchoring: number
  depth: 'bedrock-anchored' | 'deep-foundation' | 'proper-footing' | 'shallow-base' | 'surface-rest' | 'floating'
  hasHighAnchoring: boolean
  hasSolidBase: boolean
  hasProperRoots: boolean
  hasNoErosion: boolean
  hasStableDeps: boolean
  hasNoShifting: boolean
  hasProperEmbedding: boolean
  hasNoUndermining: boolean
  hasDeepAnchoring: boolean
  hasNoFloating: boolean
  erosionCount: number
  underminingCount: number
}

export interface SupportMeasure {
  quality: number
  rating: 'structural-masterpiece' | 'load-bearing-pillar' | 'reliable-support' | 'adequate-prop' | 'wobbly-stick' | 'collapsing'
  hasHighQuality: boolean
  hasReliable: boolean
  hasNoFailurePoints: boolean
  hasProvenLoad: boolean
  hasNoFragility: boolean
  hasDurable: boolean
  hasNoDegradation: boolean
  hasEnduring: boolean
  hasNoSinglePoint: boolean
  hasTrustworthy: boolean
  failurePointCount: number
  degradationCount: number
}

export interface PillarSegment {
  file: string
  compressiveStrength: number
  volcanicResilience: number
  darkClarity: number
  pillarAlignment: number
  foundationAnchoring: number
  supportQuality: number
  compressive: CompressiveMeasure
  volcanic: VolcanicMeasure
  dark: DarkMeasure
  alignment: AlignmentMeasure
  foundation: FoundationMeasure
  support: SupportMeasure
  condition: 'monolithic-pillar' | 'strong-column' | 'reliable-post' | 'weathered-pillar' | 'cracked-column' | 'rubble'
  qualityScore: number
}

export interface PillarGallery {
  directory: string
  segments: PillarSegment[]
  avgStrength: number
  avgAlignment: number
  avgSupport: number
  monolithicCount: number
  rubbleCount: number
  strongCount: number
  reliableCount: number
  galleryType: 'great-hall' | 'cathedral-nave' | 'temple-colonnade' | 'portico' | 'ruins' | 'void'
  condition: 'structural-marvel' | 'solid-colonnade' | 'adequate-support' | 'weathered-gallery' | 'crumbling-hall' | 'collapsed'
}

export interface ObsidianPillarResult {
  segments: PillarSegment[]
  galleries: PillarGallery[]
  structure: {
    avgStrength: number
    avgAlignment: number
    avgSupport: number
    isStructural: boolean
    overallStructuralIntegrity: number
  }
  stats: {
    totalFiles: number
    totalGalleries: number
    avgCompressiveStrength: number
    avgVolcanicResilience: number
    avgDarkClarity: number
    avgPillarAlignment: number
    avgFoundationAnchoring: number
    avgSupportQuality: number
    monolithicPillarCount: number
    strongColumnCount: number
    reliablePostCount: number
    weatheredPillarCount: number
    crackedColumnCount: number
    rubbleCount: number
    hasHighStrengthCount: number
    hasHighResilienceCount: number
    hasHighClarityCount: number
    hasHighLevelCount: number
    hasHighAnchoringCount: number
    hasHighQualityCount: number
    overallStructuralIntegrity: number
    architectGrade: 'master-architect' | 'structural-engineer' | 'builder' | 'mason' | 'apprentice' | 'demolition'
    bestSegment: string
    strongest: string
    mostResilient: string
    clearest: string
    mostAligned: string
    deepestAnchored: string
  }
  recommendations: string[]
}

// ─── measureCompressive ────────────────────────────────────────────────────

/** @example measureCompressive(content) returns CompressiveMeasure */
export function measureCompressive(content: string): CompressiveMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasClasses = /\bclass\s+\w+/.test(content)
  const hasFunctions = /\bfunction\s+\w+/.test(content) || /=>\s*[{(]/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasPrivate = /\bprivate\b/.test(content) || /\bprotected\b/.test(content)
  const hasStatic = /\bstatic\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const stressConcentrationCount = hasContent ? (/\bany\b/.test(content) ? 1 : 0) + (/\beval\s*\(/.test(content) ? 1 : 0) : 0
  const crushingCount = hasContent ? (/\bconsole\.log\s*\(/.test(content) ? 1 : 0) + (/\bdebugger\b/.test(content) ? 1 : 0) : 0

  let score = 0
  if (hasContent) score += 30
  if (hasTypes) score += 8
  if (hasInterfaces) score += 8
  if (hasClasses) score += 7
  if (hasFunctions) score += 5
  if (hasAsync && hasAwait) score += 6
  if (hasGenerics) score += 6
  if (hasPrivate) score += 5
  if (hasStatic) score += 3
  if (hasReadonly) score += 5
  score -= stressConcentrationCount * 3
  score -= crushingCount * 2

  const strength = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighStrength = strength >= 80
  const hasLoadDistribution = hasFunctions || hasClasses
  const hasNoStressConcentration = stressConcentrationCount === 0
  const hasProperBearings = hasInterfaces || hasTypes
  const hasNoOverloading = !/\bany\b/.test(content)
  const hasCompressive = hasContent
  const hasNoCrushing = crushingCount === 0
  const hasEvenDistribution = (hasTypes ? 1 : 0) + (hasInterfaces ? 1 : 0) + (hasClasses ? 1 : 0) >= 2
  const hasNoWeakPoints = stressConcentrationCount === 0 && crushingCount === 0
  const hasReinforced = hasPrivate || hasReadonly

  let grade: CompressiveMeasure['grade'] = 'crumbling'
  if (strength >= 90) grade = 'diamond-pillar'
  else if (strength >= 75) grade = 'obsidian-strong'
  else if (strength >= 60) grade = 'basalt-firm'
  else if (strength >= 45) grade = 'sandstone-moderate'
  else if (strength >= 30) grade = 'chalk-weak'

  return { strength, grade, hasHighStrength, hasLoadDistribution, hasNoStressConcentration, hasProperBearings, hasNoOverloading, hasCompressive, hasNoCrushing, hasEvenDistribution, hasNoWeakPoints, hasReinforced, stressConcentrationCount, crushingCount }
}

// ─── measureVolcanic ────────────────────────────────────────────────────────

/** @example measureVolcanic(content) returns VolcanicMeasure */
export function measureVolcanic(content: string): VolcanicMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasTryCatch = /\btry\s*\{/.test(content) && /\bcatch\b/.test(content)
  const hasFinally = /\bfinally\s*\{/.test(content)
  const hasErrorTypes = /\bError\b/.test(content) || /\bthrow\b/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content) || /\?\.\[/.test(content)
  const hasDefaultParams = /\(\s*\w+\s*=\s*/.test(content)
  const hasFallbackValues = /\|\|/.test(content) || /\?\?/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasPromiseAll = /\bPromise\.all\b/.test(content) || /\bPromise\.allSettled\b/.test(content)
  const hasCleanup = hasFinally || /\bdispose\b/.test(content) || /\bclose\b/.test(content)
  const hasRetry = /\bretry\b/i.test(content) || /\btimeout\b/i.test(content)

  const thermalShockCount = hasContent ? (hasTryCatch ? 0 : 1) + (hasAsync && !hasTryCatch ? 1 : 0) : 0
  const cascadeCount = hasContent ? (/\bany\b/.test(content) ? 1 : 0) + (!hasErrorTypes && hasContent ? 1 : 0) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasTryCatch) score += 12
  if (hasFinally) score += 5
  if (hasErrorTypes) score += 8
  if (hasNullishCoalescing) score += 5
  if (hasOptionalChaining) score += 5
  if (hasDefaultParams) score += 5
  if (hasFallbackValues) score += 5
  if (hasAsync && hasAwait) score += 5
  if (hasPromiseAll) score += 5
  if (hasCleanup) score += 5
  if (hasRetry) score += 5
  score -= thermalShockCount * 3
  score -= cascadeCount * 3

  const resilience = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighResilience = resilience >= 80
  const hasErrorRecovery = hasTryCatch
  const hasProperCooling = hasFinally || hasCleanup
  const hasNoThermalShock = thermalShockCount === 0
  const hasGracefulDegradation = hasNullishCoalescing || hasFallbackValues
  const hasNoBrittleFailure = hasErrorTypes || !hasContent
  const hasRegenerative = hasRetry
  const hasNoCatastrophicFailure = cascadeCount === 0
  const hasAdaptive = hasPromiseAll || hasDefaultParams
  const hasNoCascade = cascadeCount === 0

  let recovery: VolcanicMeasure['recovery'] = 'shattered'
  if (resilience >= 90) recovery = 'instant-cooling'
  else if (resilience >= 75) recovery = 'rapid-solidification'
  else if (resilience >= 60) recovery = 'proper-tempering'
  else if (resilience >= 45) recovery = 'slow-cooling'
  else if (resilience >= 30) recovery = 'thermal-shock'

  return { resilience, recovery, hasHighResilience, hasErrorRecovery, hasProperCooling, hasNoThermalShock, hasGracefulDegradation, hasNoBrittleFailure, hasRegenerative, hasNoCatastrophicFailure, hasAdaptive, hasNoCascade, thermalShockCount, cascadeCount }
}

// ─── measureDark ────────────────────────────────────────────────────────────

/** @example measureDark(content) returns DarkMeasure */
export function measureDark(content: string): DarkMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasJsDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInlineComments = /\/\/.*$/.test(content)
  const hasTypeAnnotations = /:\s*(string|number|boolean|void|never|unknown)\b/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasDescriptiveNames = /\b(get|set|is|has|can|should|will|handle|process|validate|transform|create|build|parse|format)\w*\s*\(/.test(content)
  const hasReturnTypes = /\)\s*:\s*\w/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasProperFunctions = /\bfunction\s+\w+/.test(content) || /const\s+\w+\s*=\s*(\([^)]*\)|[^=])\s*=>/.test(content)
  const hasNoAny = !/\bany\b/.test(content)

  const obfuscationCount = hasContent ? (/\bany\b/.test(content) ? 1 : 0) + (/\beval\s*\(/.test(content) ? 1 : 0) : 0
  const mysteryCount = hasContent ? (hasJsDoc ? 0 : 1) + (hasInlineComments ? 0 : 1) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasJsDoc) score += 12
  if (hasInlineComments) score += 5
  if (hasTypeAnnotations) score += 8
  if (hasInterfaces) score += 8
  if (hasTypes) score += 5
  if (hasDescriptiveNames) score += 8
  if (hasReturnTypes) score += 8
  if (hasExports) score += 5
  if (hasImports) score += 4
  if (hasProperFunctions) score += 5
  if (hasNoAny) score += 3
  score -= obfuscationCount * 3
  score -= mysteryCount * 2

  const clarity = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighClarity = clarity >= 80
  const hasReadableComplexity = hasTypeAnnotations && (hasInterfaces || hasTypes)
  const hasProperAbstraction = hasInterfaces || hasTypes
  const hasNoObfuscation = obfuscationCount === 0
  const hasClearInDark = hasJsDoc || hasInlineComments
  const hasNoImpenetrable = !/\beval\s*\(/.test(content)
  const hasLogicalFlow = hasProperFunctions || hasImports
  const hasNoSpaghetti = hasExports || hasImports || !hasContent
  const hasCommentary = hasJsDoc || hasInlineComments
  const hasNoMystery = mysteryCount === 0

  let quality: DarkMeasure['quality'] = 'pitch-black'
  if (clarity >= 90) quality = 'midnight-sun'
  else if (clarity >= 75) quality = 'starlit-clarity'
  else if (clarity >= 60) quality = 'moonlit-readable'
  else if (clarity >= 45) quality = 'dusk-readable'
  else if (clarity >= 30) quality = 'murky-dark'

  return { clarity, quality, hasHighClarity, hasReadableComplexity, hasProperAbstraction, hasNoObfuscation, hasClearInDark, hasNoImpenetrable, hasLogicalFlow, hasNoSpaghetti, hasCommentary, hasNoMystery, obfuscationCount, mysteryCount }
}

// ─── measureAlignment ───────────────────────────────────────────────────────

/** @example measureAlignment(content) returns AlignmentMeasure */
export function measureAlignment(content: string): AlignmentMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasConsistentQuotes = hasContent ? (() => {
    const single = (content.match(/'/g) || []).length
    const double = (content.match(/"/g) || []).length
    return single === 0 || double === 0 || single / double > 3 || double / single > 3
  })() : true
  const hasConsistentSemicolons = hasContent ? (() => {
    const withSemi = nonEmpty.filter((l) => l.trim().endsWith(';')).length
    const withoutSemi = nonEmpty.length - withSemi
    return withSemi === 0 || withoutSemi === 0 || withSemi / withoutSemi > 3 || withoutSemi / withSemi > 3
  })() : true
  const hasExports = /\bexport\b/.test(content)
  const hasNamedExports = /export\s+(const|let|function|class|interface|type|enum)\s+\w+/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasConsistentIndentation = hasContent ? (() => {
    const spaceIndent = nonEmpty.filter((l) => /^ {2,}/.test(l)).length
    const tabIndent = nonEmpty.filter((l) => /^\t/.test(l)).length
    return spaceIndent === 0 || tabIndent === 0
  })() : true
  const hasModules = hasImports || hasExports

  const deviationCount = hasContent ? (hasConsistentQuotes ? 0 : 1) + (hasConsistentSemicolons ? 0 : 1) : 0
  const misalignmentCount = hasContent ? (hasConsistentIndentation ? 0 : 1) + (hasModules ? 0 : 1) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasConsistentQuotes) score += 8
  if (hasConsistentSemicolons) score += 8
  if (hasExports) score += 8
  if (hasNamedExports) score += 8
  if (hasImports) score += 6
  if (hasConsistentIndentation) score += 8
  if (hasModules) score += 5
  score -= deviationCount * 4
  score -= misalignmentCount * 4

  const level = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighLevel = level >= 80
  const hasConsistentStyle = hasConsistentQuotes && hasConsistentSemicolons
  const hasNoDeviation = deviationCount === 0
  const hasProperOrientation = hasNamedExports && hasImports
  const hasNoMisalignment = misalignmentCount === 0
  const hasUniform = hasConsistentIndentation && hasConsistentQuotes
  const hasNoContradiction = deviationCount === 0 && misalignmentCount === 0
  const hasStraightPaths = hasModules
  const hasNoWandering = hasConsistentIndentation
  const hasAligned = hasConsistentStyle && hasConsistentIndentation

  let precision: AlignmentMeasure['precision'] = 'crooked'
  if (level >= 90) precision = 'laser-aligned'
  else if (level >= 75) precision = 'plumb-perfect'
  else if (level >= 60) precision = 'well-aligned'
  else if (level >= 45) precision = 'mostly-straight'
  else if (level >= 30) precision = 'leaning'

  return { level, precision, hasHighLevel, hasConsistentStyle, hasNoDeviation, hasProperOrientation, hasNoMisalignment, hasUniform, hasNoContradiction, hasStraightPaths, hasNoWandering, hasAligned, deviationCount, misalignmentCount }
}

// ─── measureFoundation ──────────────────────────────────────────────────────

/** @example measureFoundation(content) returns FoundationMeasure */
export function measureFoundation(content: string): FoundationMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasImports = /\bimport\b/.test(content)
  const hasNamedImports = /import\s*\{/.test(content)
  const hasTypeImports = /import\s+type\s+/.test(content) || /import\s*\{[^}]*(?:type\s+\w)/.test(content)
  const hasReExports = /export\s*\{/.test(content) || /export\s+\*\s+from/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasClasses = /\bclass\s+\w+/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content) && /\bcatch\b/.test(content)
  const hasConfigPatterns = /\bconfig\b|\benv\b|\bConfig\b/.test(content)
  const hasDiPatterns = /\binject\b|\bInjectable\b|\binjectable\b/.test(content)
  const hasPrivateMembers = /\bprivate\b/.test(content) || /\bprotected\b/.test(content)

  const erosionCount = hasContent ? (hasErrorHandling ? 0 : 1) + (hasPrivateMembers || hasInterfaces ? 0 : 1) : 0
  const underminingCount = hasContent ? (hasImports ? 0 : 1) + (hasConfigPatterns || hasDiPatterns ? 0 : 1) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasImports) score += 8
  if (hasNamedImports) score += 6
  if (hasTypeImports) score += 5
  if (hasReExports) score += 5
  if (hasInterfaces) score += 8
  if (hasClasses) score += 5
  if (hasErrorHandling) score += 8
  if (hasConfigPatterns) score += 5
  if (hasDiPatterns) score += 5
  if (hasPrivateMembers) score += 5
  score -= erosionCount * 3
  score -= underminingCount * 3

  const anchoring = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighAnchoring = anchoring >= 80
  const hasSolidBase = hasInterfaces || hasClasses
  const hasProperRoots = hasNamedImports || hasTypeImports
  const hasNoErosion = erosionCount === 0
  const hasStableDeps = hasImports
  const hasNoShifting = hasErrorHandling
  const hasProperEmbedding = hasPrivateMembers || hasInterfaces
  const hasNoUndermining = underminingCount === 0
  const hasDeepAnchoring = hasInterfaces && hasErrorHandling && hasImports
  const hasNoFloating = hasImports || !hasContent

  let depth: FoundationMeasure['depth'] = 'floating'
  if (anchoring >= 90) depth = 'bedrock-anchored'
  else if (anchoring >= 75) depth = 'deep-foundation'
  else if (anchoring >= 60) depth = 'proper-footing'
  else if (anchoring >= 45) depth = 'shallow-base'
  else if (anchoring >= 30) depth = 'surface-rest'

  return { anchoring, depth, hasHighAnchoring, hasSolidBase, hasProperRoots, hasNoErosion, hasStableDeps, hasNoShifting, hasProperEmbedding, hasNoUndermining, hasDeepAnchoring, hasNoFloating, erosionCount, underminingCount }
}

// ─── measureSupport ─────────────────────────────────────────────────────────

/** @example measureSupport(content) returns SupportMeasure */
export function measureSupport(content: string): SupportMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasExports = /\bexport\b/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasClasses = /\bclass\s+\w+/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasDocs = /\/\*\*/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content) && /\bcatch\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasConst = /\bconst\b/.test(content)
  const hasNoLet = !/\blet\b/.test(content)
  const hasNoVar = !/\bvar\b/.test(content)

  const failurePointCount = hasContent ? (hasTryCatch ? 0 : 1) + (/\bany\b/.test(content) ? 1 : 0) : 0
  const degradationCount = hasContent ? (hasDocs ? 0 : 1) + (hasReadonly || hasConst ? 0 : 1) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasExports) score += 8
  if (hasInterfaces) score += 8
  if (hasTypes) score += 5
  if (hasClasses) score += 5
  if (hasAsync) score += 8
  if (hasDocs) score += 8
  if (hasTryCatch) score += 8
  if (hasReadonly) score += 5
  if (hasConst) score += 3
  if (hasNoLet && hasNoVar) score += 5
  score -= failurePointCount * 4
  score -= degradationCount * 3

  const quality = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighQuality = quality >= 80
  const hasReliable = hasTryCatch || !hasContent
  const hasNoFailurePoints = failurePointCount === 0
  const hasProvenLoad = hasDocs || hasConst
  const hasNoFragility = hasTryCatch || hasAsync
  const hasDurable = hasReadonly || (hasConst && hasNoLet)
  const hasNoDegradation = degradationCount === 0
  const hasEnduring = hasExports && (hasInterfaces || hasTypes)
  const hasNoSinglePoint = failurePointCount === 0
  const hasTrustworthy = hasExports && hasDocs

  let rating: SupportMeasure['rating'] = 'collapsing'
  if (quality >= 90) rating = 'structural-masterpiece'
  else if (quality >= 75) rating = 'load-bearing-pillar'
  else if (quality >= 60) rating = 'reliable-support'
  else if (quality >= 45) rating = 'adequate-prop'
  else if (quality >= 30) rating = 'wobbly-stick'

  return { quality, rating, hasHighQuality, hasReliable, hasNoFailurePoints, hasProvenLoad, hasNoFragility, hasDurable, hasNoDegradation, hasEnduring, hasNoSinglePoint, hasTrustworthy, failurePointCount, degradationCount }
}

// ─── analyzePillarSegment ──────────────────────────────────────────────────

/** @example analyzePillarSegment(content, filePath) returns PillarSegment */
export function analyzePillarSegment(content: string, filePath: string): PillarSegment {
  const compressive = measureCompressive(content)
  const volcanic = measureVolcanic(content)
  const dark = measureDark(content)
  const alignment = measureAlignment(content)
  const foundation = measureFoundation(content)
  const support = measureSupport(content)

  const compressiveStrength = compressive.strength
  const volcanicResilience = volcanic.resilience
  const darkClarity = dark.clarity
  const pillarAlignment = alignment.level
  const foundationAnchoring = foundation.anchoring
  const supportQuality = support.quality

  const qualityScore = Math.round(
    compressiveStrength * 0.2 +
    volcanicResilience * 0.15 +
    darkClarity * 0.15 +
    pillarAlignment * 0.15 +
    foundationAnchoring * 0.15 +
    supportQuality * 0.2,
  )

  let condition: PillarSegment['condition'] = 'rubble'
  if (qualityScore >= 90) condition = 'monolithic-pillar'
  else if (qualityScore >= 75) condition = 'strong-column'
  else if (qualityScore >= 60) condition = 'reliable-post'
  else if (qualityScore >= 45) condition = 'weathered-pillar'
  else if (qualityScore >= 30) condition = 'cracked-column'

  return {
    file: filePath, compressiveStrength, volcanicResilience, darkClarity, pillarAlignment, foundationAnchoring, supportQuality,
    compressive, volcanic, dark, alignment, foundation, support, condition, qualityScore,
  }
}

// ─── classifySegmentCondition ───────────────────────────────────────────────

/** @example classifySegmentCondition(segment) returns condition string */
export function classifySegmentCondition(segment: PillarSegment): PillarSegment['condition'] {
  const qs = segment.qualityScore
  if (qs >= 90) return 'monolithic-pillar'
  if (qs >= 75) return 'strong-column'
  if (qs >= 60) return 'reliable-post'
  if (qs >= 45) return 'weathered-pillar'
  if (qs >= 30) return 'cracked-column'
  return 'rubble'
}

// ─── classifyGalleryType ────────────────────────────────────────────────────

/** @example classifyGalleryType(segments) returns gallery type string */
export function classifyGalleryType(segments: PillarSegment[]): PillarGallery['galleryType'] {
  if (segments.length === 0) return 'void'
  const avg = segments.reduce((s, seg) => s + seg.qualityScore, 0) / segments.length
  const monoliths = segments.filter((s) => s.condition === 'monolithic-pillar').length
  const ratio = monoliths / segments.length

  if (avg >= 80 && ratio >= 0.5) return 'great-hall'
  if (avg >= 70) return 'cathedral-nave'
  if (avg >= 55) return 'temple-colonnade'
  if (avg >= 40) return 'portico'
  if (avg >= 25) return 'ruins'
  return 'void'
}

// ─── analyzePillarGallery ──────────────────────────────────────────────────

/** @example analyzePillarGallery(segments, dirPath) returns PillarGallery */
export function analyzePillarGallery(segments: PillarSegment[], dirPath: string): PillarGallery {
  if (segments.length === 0) {
    return { directory: dirPath, segments, avgStrength: 0, avgAlignment: 0, avgSupport: 0, monolithicCount: 0, rubbleCount: 0, strongCount: 0, reliableCount: 0, galleryType: 'void', condition: 'collapsed' }
  }

  const avgStrength = Math.round(segments.reduce((s, seg) => s + seg.compressiveStrength, 0) / segments.length)
  const avgAlignment = Math.round(segments.reduce((s, seg) => s + seg.pillarAlignment, 0) / segments.length)
  const avgSupport = Math.round(segments.reduce((s, seg) => s + seg.supportQuality, 0) / segments.length)
  const monolithicCount = segments.filter((s) => s.condition === 'monolithic-pillar').length
  const rubbleCount = segments.filter((s) => s.condition === 'rubble').length
  const strongCount = segments.filter((s) => s.condition === 'strong-column').length
  const reliableCount = segments.filter((s) => s.condition === 'reliable-post').length

  const galleryType = classifyGalleryType(segments)
  const overallAvg = Math.round(segments.reduce((s, seg) => s + seg.qualityScore, 0) / segments.length)

  let condition: PillarGallery['condition'] = 'collapsed'
  if (overallAvg >= 80) condition = 'structural-marvel'
  else if (overallAvg >= 65) condition = 'solid-colonnade'
  else if (overallAvg >= 50) condition = 'adequate-support'
  else if (overallAvg >= 35) condition = 'weathered-gallery'
  else if (overallAvg >= 20) condition = 'crumbling-hall'

  return { directory: dirPath, segments, avgStrength, avgAlignment, avgSupport, monolithicCount, rubbleCount, strongCount, reliableCount, galleryType, condition }
}

// ─── classifyArchitectGrade ────────────────────────────────────────────────

/** @example classifyArchitectGrade(85) returns 'master-architect' */
export function classifyArchitectGrade(avgIntegrity: number): ObsidianPillarResult['stats']['architectGrade'] {
  if (avgIntegrity >= 80) return 'master-architect'
  if (avgIntegrity >= 65) return 'structural-engineer'
  if (avgIntegrity >= 50) return 'builder'
  if (avgIntegrity >= 35) return 'mason'
  if (avgIntegrity >= 20) return 'apprentice'
  return 'demolition'
}

// ─── generateRecommendations ────────────────────────────────────────────────

/** @example generateRecommendations(segments, galleries, structure, stats) returns string[] */
export function generateRecommendations(
  segments: PillarSegment[],
  galleries: PillarGallery[],
  structure: ObsidianPillarResult['structure'],
  stats: ObsidianPillarResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgCompressiveStrength < 50) recs.push('Increase compressive strength — improve code load handling and type precision')
  if (stats.avgVolcanicResilience < 50) recs.push('Enhance volcanic resilience — add error recovery and graceful degradation')
  if (stats.avgDarkClarity < 50) recs.push('Improve dark clarity — enhance documentation and code readability')
  if (stats.avgPillarAlignment < 50) recs.push('Straighten pillar alignment — improve code style consistency')
  if (stats.avgFoundationAnchoring < 50) recs.push('Deepen foundation anchoring — improve dependency stability and infrastructure')
  if (stats.avgSupportQuality < 50) recs.push('Strengthen support quality — improve code reliability and durability')
  if (stats.rubbleCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of files are rubble — consider major structural reinforcement')
  if (stats.crackedColumnCount > 0) recs.push('Warning: cracked columns detected — these need immediate repair')
  if (structure.overallStructuralIntegrity < 40) recs.push('Overall structural integrity is critically low — establish a pillar reinforcement regimen')
  if (galleries.length > 0 && galleries.every((g) => g.condition === 'collapsed')) recs.push('All galleries have collapsed — your codebase needs fundamental reconstruction')

  if (segments.length > 0) {
    const highCrushing = segments.filter((s) => s.compressive.crushingCount > 2)
    if (highCrushing.length > segments.length * 0.5) recs.push('Over 50% of segments have high crushing — reduce console.log and debugger usage')
  }

  return recs
}

// ─── buildObsidianPillarResult ──────────────────────────────────────────────

/** @example buildObsidianPillarResult(files, contents, options) returns full result */
export function buildObsidianPillarResult(files: string[], contents: string[], _options?: Record<string, unknown>): ObsidianPillarResult {
  const segments = files.map((file, i) => analyzePillarSegment(contents[i] ?? '', file))

  const galleryMap = new Map<string, PillarSegment[]>()
  segments.forEach((seg) => {
    const parts = seg.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = galleryMap.get(dir)
    if (existing) existing.push(seg)
    else galleryMap.set(dir, [seg])
  })

  const galleries = Array.from(galleryMap.entries()).map(([dir, segs]) => analyzePillarGallery(segs, dir))

  const avgCompressiveStrength = segments.length > 0 ? Math.round(segments.reduce((s, seg) => s + seg.compressiveStrength, 0) / segments.length) : 0
  const avgVolcanicResilience = segments.length > 0 ? Math.round(segments.reduce((s, seg) => s + seg.volcanicResilience, 0) / segments.length) : 0
  const avgDarkClarity = segments.length > 0 ? Math.round(segments.reduce((s, seg) => s + seg.darkClarity, 0) / segments.length) : 0
  const avgPillarAlignment = segments.length > 0 ? Math.round(segments.reduce((s, seg) => s + seg.pillarAlignment, 0) / segments.length) : 0
  const avgFoundationAnchoring = segments.length > 0 ? Math.round(segments.reduce((s, seg) => s + seg.foundationAnchoring, 0) / segments.length) : 0
  const avgSupportQuality = segments.length > 0 ? Math.round(segments.reduce((s, seg) => s + seg.supportQuality, 0) / segments.length) : 0

  const overallStructuralIntegrity = Math.round(
    avgCompressiveStrength * 0.2 +
    avgVolcanicResilience * 0.15 +
    avgDarkClarity * 0.15 +
    avgPillarAlignment * 0.15 +
    avgFoundationAnchoring * 0.15 +
    avgSupportQuality * 0.2,
  )

  const structure = {
    avgStrength: avgCompressiveStrength,
    avgAlignment: avgPillarAlignment,
    avgSupport: avgSupportQuality,
    isStructural: overallStructuralIntegrity >= 70,
    overallStructuralIntegrity,
  }

  const stats = {
    totalFiles: files.length,
    totalGalleries: galleries.length,
    avgCompressiveStrength, avgVolcanicResilience, avgDarkClarity, avgPillarAlignment, avgFoundationAnchoring, avgSupportQuality,
    monolithicPillarCount: segments.filter((s) => s.condition === 'monolithic-pillar').length,
    strongColumnCount: segments.filter((s) => s.condition === 'strong-column').length,
    reliablePostCount: segments.filter((s) => s.condition === 'reliable-post').length,
    weatheredPillarCount: segments.filter((s) => s.condition === 'weathered-pillar').length,
    crackedColumnCount: segments.filter((s) => s.condition === 'cracked-column').length,
    rubbleCount: segments.filter((s) => s.condition === 'rubble').length,
    hasHighStrengthCount: segments.filter((s) => s.compressive.hasHighStrength).length,
    hasHighResilienceCount: segments.filter((s) => s.volcanic.hasHighResilience).length,
    hasHighClarityCount: segments.filter((s) => s.dark.hasHighClarity).length,
    hasHighLevelCount: segments.filter((s) => s.alignment.hasHighLevel).length,
    hasHighAnchoringCount: segments.filter((s) => s.foundation.hasHighAnchoring).length,
    hasHighQualityCount: segments.filter((s) => s.support.hasHighQuality).length,
    overallStructuralIntegrity,
    architectGrade: classifyArchitectGrade(overallStructuralIntegrity),
    bestSegment: segments.length > 0 ? segments.reduce((b, s) => s.qualityScore > b.qualityScore ? s : b).file : '',
    strongest: segments.length > 0 ? segments.reduce((b, s) => s.compressiveStrength > b.compressiveStrength ? s : b).file : '',
    mostResilient: segments.length > 0 ? segments.reduce((b, s) => s.volcanicResilience > b.volcanicResilience ? s : b).file : '',
    clearest: segments.length > 0 ? segments.reduce((b, s) => s.darkClarity > b.darkClarity ? s : b).file : '',
    mostAligned: segments.length > 0 ? segments.reduce((b, s) => s.pillarAlignment > b.pillarAlignment ? s : b).file : '',
    deepestAnchored: segments.length > 0 ? segments.reduce((b, s) => s.foundationAnchoring > b.foundationAnchoring ? s : b).file : '',
  }

  const recommendations = generateRecommendations(segments, galleries, structure, stats)

  return { segments, galleries, structure, stats, recommendations }
}
