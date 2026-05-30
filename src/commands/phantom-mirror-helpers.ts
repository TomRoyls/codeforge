// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ReflectiveMeasure {
  awareness: number
  clarity: 'perfect-reflection' | 'clear-mirror' | 'slightly-blurred' | 'distorted' | 'foggy' | 'blank-surface'
  hasHighAwareness: boolean
  hasSelfDescribing: boolean
  hasIntrospective: boolean
  hasNoMystery: boolean
  hasDocumented: boolean
  hasNoSurprise: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasObvious: boolean
  hasNoPhantom: boolean
  mysteryCount: number
  hiddenCount: number
}

export interface GhostMeasure {
  trace: number
  visibility: 'luminous-trail' | 'visible-footprints' | 'fading-traces' | 'dim-signals' | 'barely-visible' | 'invisible'
  hasHighTrace: boolean
  hasTraceable: boolean
  hasLogging: boolean
  hasNoHiddenPaths: boolean
  hasObservable: boolean
  hasNoGhostCode: boolean
  hasDebuggable: boolean
  hasNoPhantom: boolean
  hasVisibleFlow: boolean
  hasNoSilent: boolean
  hiddenPathCount: number
  ghostCodeCount: number
}

export interface ShadowMeasure {
  quality: number
  accuracy: 'sharp-shadow' | 'clear-silhouette' | 'recognizable' | 'blurred-outline' | 'faint-shadow' | 'no-shadow'
  hasHighQuality: boolean
  hasPredictable: boolean
  hasConsistent: boolean
  hasNoSurprise: boolean
  hasDeterministic: boolean
  hasNoRandom: boolean
  hasClearBehavior: boolean
  hasNoAmbiguity: boolean
  hasReliable: boolean
  hasNoChaos: boolean
  surpriseCount: number
  ambiguityCount: number
}

export interface EchoMeasure {
  clarity: number
  resonance: 'crystal-echo' | 'clear-reverberation' | 'audible-feedback' | 'muffled-echo' | 'faint-whisper' | 'silence'
  hasHighClarity: boolean
  hasErrorMessages: boolean
  hasStackTraces: boolean
  hasNoSilentFailure: boolean
  hasHelpful: boolean
  hasNoCryptic: boolean
  hasDiagnostic: boolean
  hasNoBlackHole: boolean
  hasVerbose: boolean
  hasNoUseless: boolean
  silentFailureCount: number
  crypticCount: number
}

export interface PhantomMeasure {
  depth: number
  visibility: 'fully-visible' | 'clearly-seen' | 'partially-visible' | 'translucent' | 'barely-there' | 'invisible'
  hasHighDepth: boolean
  hasVisible: boolean
  hasNoHiddenComplexity: boolean
  hasTransparent: boolean
  hasNoMagic: boolean
  hasExplicit: boolean
  hasNoImplicit: boolean
  hasClear: boolean
  hasNoObfuscation: boolean
  hasRevealing: boolean
  hiddenComplexityCount: number
  magicCount: number
}

export interface FidelityMeasure {
  accuracy: number
  truth: 'perfect-fidelity' | 'high-accuracy' | 'mostly-accurate' | 'slightly-off' | 'misleading' | 'fiction'
  hasHighAccuracy: boolean
  hasTruthful: boolean
  hasMatching: boolean
  hasNoLying: boolean
  hasAccurate: boolean
  hasNoStale: boolean
  hasCurrent: boolean
  hasNoOutdated: boolean
  hasReliable: boolean
  hasNoFiction: boolean
  lyingCount: number
  staleCount: number
}

export interface PhantomReflection {
  file: string
  reflection: number
  ghostTrace: number
  shadowQuality: number
  echoClarity: number
  phantomDepth: number
  mirrorFidelity: number
  reflective: ReflectiveMeasure
  ghost: GhostMeasure
  shadow: ShadowMeasure
  echo: EchoMeasure
  phantom: PhantomMeasure
  fidelity: FidelityMeasure
  condition: 'lucid-mirror' | 'clear-reflection' | 'ghostly-image' | 'distorted-phantom' | 'shadowy-trace' | 'void'
  qualityScore: number
}

export interface MirrorGallery {
  directory: string
  reflections: PhantomReflection[]
  avgReflection: number
  avgEchoClarity: number
  avgFidelity: number
  lucidCount: number
  voidCount: number
  clearCount: number
  ghostlyCount: number
  galleryType: 'hall-of-mirrors' | 'mirror-maze' | 'gallery-of-reflections' | 'clouded-mirrors' | 'broken-glass' | 'darkness'
  condition: 'perfect-reflections' | 'clear-gallery' | 'haunted-hall' | 'foggy-corridor' | 'shattered-hall' | 'abyss'
}

export interface PhantomMirrorResult {
  reflections: PhantomReflection[]
  galleries: MirrorGallery[]
  mansion: {
    avgReflection: number
    avgEchoClarity: number
    avgFidelity: number
    isClear: boolean
    overallClarity: number
  }
  stats: {
    totalFiles: number
    totalGalleries: number
    avgReflection: number
    avgGhostTrace: number
    avgShadowQuality: number
    avgEchoClarity: number
    avgPhantomDepth: number
    avgMirrorFidelity: number
    lucidMirrorCount: number
    clearReflectionCount: number
    ghostlyImageCount: number
    distortedPhantomCount: number
    shadowyTraceCount: number
    voidCount: number
    hasHighAwarenessCount: number
    hasHighTraceCount: number
    hasHighQualityCount: number
    hasHighClarityCount: number
    hasHighDepthCount: number
    hasHighAccuracyCount: number
    overallClarity: number
    mediumGrade: 'spirit-medium' | 'mirror-master' | 'ghost-whisperer' | 'apprentice-seer' | 'blind-fortune-teller' | 'skeptical-muggle'
    bestReflection: string
    mostSelfAware: string
    mostTraceable: string
    mostPredictable: string
    mostDebuggable: string
    mostTransparent: string
  }
  recommendations: string[]
}

// ─── Measure Reflective (code self-awareness) ───────────────────────────────

/** @example measureReflective(content) returns ReflectiveMeasure */
export function measureReflective(content: string): ReflectiveMeasure {
  let score = 0
  const hasExports = /\bexport\b/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasReturnType = /\)\s*:\s*(?!void\s*\{)(?!{)\w+/.test(content)
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTypedParams = /\(\s*\w+\s*:/.test(content)
  const hasConst = /\bconst\b/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasPrivate = /\bprivate\b/.test(content)
  const hasOptional = /\?\s*:/.test(content)

  if (hasExports) score += 10
  if (hasInterfaces) score += 10
  if (hasTypes) score += 8
  if (hasReturnType) score += 10
  if (hasJSDoc) score += 10
  if (hasTypedParams) score += 8
  if (hasConst) score += 8
  if (hasClasses) score += 7
  if (hasGenerics) score += 8
  if (hasReadonly) score += 7
  if (hasPrivate) score += 7
  if (hasOptional) score += 7
  score = Math.min(100, score)

  const mysteryPatterns = [/\bany\b/, /\bvar\b/]
  const hiddenPatterns = [/\bTODO\b/, /\bFIXME\b/]
  const mysteryCount = mysteryPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const hiddenCount = hiddenPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let clarity: ReflectiveMeasure['clarity'] = 'blank-surface'
  if (score >= 80) clarity = 'perfect-reflection'
  else if (score >= 65) clarity = 'clear-mirror'
  else if (score >= 50) clarity = 'slightly-blurred'
  else if (score >= 35) clarity = 'distorted'
  else if (score >= 20) clarity = 'foggy'

  return {
    awareness: score,
    clarity,
    hasHighAwareness: score >= 70,
    hasSelfDescribing: hasInterfaces || hasTypes,
    hasIntrospective: hasReturnType && hasTypedParams,
    hasNoMystery: mysteryCount === 0,
    hasDocumented: hasJSDoc,
    hasNoSurprise: mysteryCount === 0 && hiddenCount === 0,
    hasTransparent: hasExports && (hasInterfaces || hasTypes),
    hasNoHidden: hiddenCount === 0,
    hasObvious: hasConst && hasExports,
    hasNoPhantom: mysteryCount === 0 && hiddenCount === 0,
    mysteryCount,
    hiddenCount,
  }
}

// ─── Measure Ghost (code execution path) ────────────────────────────────────

/** @example measureGhost(content) returns GhostMeasure */
export function measureGhost(content: string): GhostMeasure {
  let score = 0
  const hasExports = /\bexport\b/.test(content)
  const hasFunctions = /\bfunction\b/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasReturn = /\breturn\b/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content)
  const hasReturnType = /\)\s*:\s*(?!void\s*\{)(?!{)\w+/.test(content)
  const hasArrow = /=>/.test(content)
  const hasConst = /\bconst\b/.test(content)
  const hasThrow = /\bthrow\b/.test(content)
  const hasIfStatements = /\bif\s*\(/.test(content)
  const hasImports = /\bimport\b/.test(content)

  if (hasExports) score += 10
  if (hasFunctions) score += 8
  if (hasAsync) score += 8
  if (hasAwait) score += 7
  if (hasReturn) score += 7
  if (hasErrorHandling) score += 10
  if (hasReturnType) score += 10
  if (hasArrow) score += 8
  if (hasConst) score += 8
  if (hasThrow) score += 8
  if (hasIfStatements) score += 8
  if (hasImports) score += 8
  score = Math.min(100, score)

  const hiddenPathPatterns = [/\bany\b/, /\beval\b/]
  const ghostCodePatterns = [/\bdebugger\b/, /\bconsole\.log\b/]
  const hiddenPathCount = hiddenPathPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const ghostCodeCount = ghostCodePatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let visibility: GhostMeasure['visibility'] = 'invisible'
  if (score >= 80) visibility = 'luminous-trail'
  else if (score >= 65) visibility = 'visible-footprints'
  else if (score >= 50) visibility = 'fading-traces'
  else if (score >= 35) visibility = 'dim-signals'
  else if (score >= 20) visibility = 'barely-visible'

  return {
    trace: score,
    visibility,
    hasHighTrace: score >= 70,
    hasTraceable: hasReturn || hasErrorHandling,
    hasLogging: ghostCodeCount > 0,
    hasNoHiddenPaths: hiddenPathCount === 0,
    hasObservable: hasExports && hasReturnType,
    hasNoGhostCode: ghostCodeCount === 0,
    hasDebuggable: hasErrorHandling || hasThrow,
    hasNoPhantom: hiddenPathCount === 0 && ghostCodeCount === 0,
    hasVisibleFlow: hasReturn && hasIfStatements,
    hasNoSilent: ghostCodeCount === 0,
    hiddenPathCount,
    ghostCodeCount,
  }
}

// ─── Measure Shadow (code behavior prediction) ──────────────────────────────

/** @example measureShadow(content) returns ShadowMeasure */
export function measureShadow(content: string): ShadowMeasure {
  let score = 0
  const hasConst = /\bconst\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasReturnType = /\)\s*:\s*(?!void\s*\{)(?!{)\w+/.test(content)
  const hasStrictChecks = /!==|===/.test(content)
  const hasNullSafety = /\?\?|\?\.\w/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasTypedParams = /\(\s*\w+\s*:/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content)
  const hasOptional = /\?\s*:/.test(content)
  const hasGenerics = /<\w+>/.test(content)

  if (hasConst) score += 10
  if (hasReadonly) score += 8
  if (hasReturnType) score += 10
  if (hasStrictChecks) score += 8
  if (hasNullSafety) score += 8
  if (hasInterfaces) score += 10
  if (hasTypes) score += 8
  if (hasTypedParams) score += 8
  if (hasExports) score += 8
  if (hasErrorHandling) score += 8
  if (hasOptional) score += 7
  if (hasGenerics) score += 7
  score = Math.min(100, score)

  const surprisePatterns = [/\bvar\b/, /\bany\b/]
  const ambiguityPatterns = [/\bTODO\b/, /\bFIXME\b/]
  const surpriseCount = surprisePatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const ambiguityCount = ambiguityPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let accuracy: ShadowMeasure['accuracy'] = 'no-shadow'
  if (score >= 80) accuracy = 'sharp-shadow'
  else if (score >= 65) accuracy = 'clear-silhouette'
  else if (score >= 50) accuracy = 'recognizable'
  else if (score >= 35) accuracy = 'blurred-outline'
  else if (score >= 20) accuracy = 'faint-shadow'

  return {
    quality: score,
    accuracy,
    hasHighQuality: score >= 70,
    hasPredictable: hasConst && hasReturnType,
    hasConsistent: hasStrictChecks || hasNullSafety,
    hasNoSurprise: surpriseCount === 0,
    hasDeterministic: hasConst && hasReadonly,
    hasNoRandom: surpriseCount === 0 && ambiguityCount === 0,
    hasClearBehavior: hasReturnType && hasTypedParams,
    hasNoAmbiguity: ambiguityCount === 0,
    hasReliable: hasErrorHandling && hasExports,
    hasNoChaos: surpriseCount === 0 && ambiguityCount === 0,
    surpriseCount,
    ambiguityCount,
  }
}

// ─── Measure Echo (code debugging clarity) ──────────────────────────────────

/** @example measureEcho(content) returns EchoMeasure */
export function measureEcho(content: string): EchoMeasure {
  let score = 0
  const hasErrorHandling = /\btry\s*\{/.test(content)
  const hasThrow = /\bthrow\b/.test(content)
  const hasErrorInstance = /new Error\(/.test(content)
  const hasReturnType = /\)\s*:\s*(?!void\s*\{)(?!{)\w+/.test(content)
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasConst = /\bconst\b/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasCatch = /\bcatch\s*\(/.test(content)
  const hasFinally = /\bfinally\s*\{/.test(content)

  if (hasErrorHandling) score += 12
  if (hasThrow) score += 10
  if (hasErrorInstance) score += 8
  if (hasReturnType) score += 8
  if (hasJSDoc) score += 10
  if (hasExports) score += 7
  if (hasInterfaces) score += 8
  if (hasTypes) score += 7
  if (hasConst) score += 7
  if (hasAsync) score += 7
  if (hasCatch) score += 8
  if (hasFinally) score += 8
  score = Math.min(100, score)

  const silentFailurePatterns = [/\bany\b/, /\bvoid\s*\(/]
  const crypticPatterns = [/\bvar\b/, /\bdebugger\b/]
  const silentFailureCount = silentFailurePatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const crypticCount = crypticPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let resonance: EchoMeasure['resonance'] = 'silence'
  if (score >= 80) resonance = 'crystal-echo'
  else if (score >= 65) resonance = 'clear-reverberation'
  else if (score >= 50) resonance = 'audible-feedback'
  else if (score >= 35) resonance = 'muffled-echo'
  else if (score >= 20) resonance = 'faint-whisper'

  return {
    clarity: score,
    resonance,
    hasHighClarity: score >= 70,
    hasErrorMessages: hasThrow || hasErrorInstance,
    hasStackTraces: hasErrorInstance,
    hasNoSilentFailure: silentFailureCount === 0,
    hasHelpful: hasErrorInstance && hasJSDoc,
    hasNoCryptic: crypticCount === 0,
    hasDiagnostic: hasErrorHandling && hasCatch,
    hasNoBlackHole: silentFailureCount === 0 && crypticCount === 0,
    hasVerbose: hasJSDoc || hasReturnType,
    hasNoUseless: crypticCount === 0,
    silentFailureCount,
    crypticCount,
  }
}

// ─── Measure Phantom (code abstraction visibility) ──────────────────────────

/** @example measurePhantom(content) returns PhantomMeasure */
export function measurePhantom(content: string): PhantomMeasure {
  let score = 0
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasFunctions = /\bfunction\b/.test(content)
  const hasReturnType = /\)\s*:\s*(?!void\s*\{)(?!{)\w+/.test(content)
  const hasPrivate = /\bprivate\b/.test(content)
  const hasConst = /\bconst\b/.test(content)
  const hasArrow = /=>/.test(content)
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)

  if (hasInterfaces) score += 10
  if (hasTypes) score += 8
  if (hasGenerics) score += 10
  if (hasExports) score += 8
  if (hasImports) score += 7
  if (hasClasses) score += 7
  if (hasFunctions) score += 7
  if (hasReturnType) score += 10
  if (hasPrivate) score += 8
  if (hasConst) score += 8
  if (hasArrow) score += 9
  if (hasJSDoc) score += 8
  score = Math.min(100, score)

  const hiddenComplexityPatterns = [/\beval\b/, /\bwith\s*\(/]
  const magicPatterns = [/\bany\b/, /\bvar\b/]
  const hiddenComplexityCount = hiddenComplexityPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const magicCount = magicPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let visibility: PhantomMeasure['visibility'] = 'invisible'
  if (score >= 80) visibility = 'fully-visible'
  else if (score >= 65) visibility = 'clearly-seen'
  else if (score >= 50) visibility = 'partially-visible'
  else if (score >= 35) visibility = 'translucent'
  else if (score >= 20) visibility = 'barely-there'

  return {
    depth: score,
    visibility,
    hasHighDepth: score >= 70,
    hasVisible: hasInterfaces || hasTypes,
    hasNoHiddenComplexity: hiddenComplexityCount === 0,
    hasTransparent: hasExports && hasReturnType,
    hasNoMagic: magicCount === 0,
    hasExplicit: hasReturnType && hasConst,
    hasNoImplicit: magicCount === 0 && hiddenComplexityCount === 0,
    hasClear: hasInterfaces && hasExports,
    hasNoObfuscation: hiddenComplexityCount === 0,
    hasRevealing: hasJSDoc && hasExports,
    hiddenComplexityCount,
    magicCount,
  }
}

// ─── Measure Fidelity (code documentation accuracy) ─────────────────────────

/** @example measureFidelity(content) returns FidelityMeasure */
export function measureFidelity(content: string): FidelityMeasure {
  let score = 0
  const hasExports = /\bexport\b/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasParamDocs = /@param\b/.test(content)
  const hasReturnDocs = /@returns?\b/.test(content)
  const hasExampleDocs = /@example\b/.test(content)
  const hasReturnType = /\)\s*:\s*(?!void\s*\{)(?!{)\w+/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasFunctions = /\bfunction\b/.test(content)
  const hasConst = /\bconst\b/.test(content)
  const hasAsync = /\basync\b/.test(content)

  if (hasExports) score += 8
  if (hasInterfaces) score += 10
  if (hasTypes) score += 8
  if (hasJSDoc) score += 12
  if (hasParamDocs) score += 10
  if (hasReturnDocs) score += 10
  if (hasExampleDocs) score += 8
  if (hasReturnType) score += 10
  if (hasClasses) score += 6
  if (hasFunctions) score += 6
  if (hasConst) score += 6
  if (hasAsync) score += 6
  score = Math.min(100, score)

  const lyingPatterns = [/\bTODO\b/, /\bFIXME\b/]
  const stalePatterns = [/@deprecated\b/, /\bconsole\.log\b/]
  const lyingCount = lyingPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const staleCount = stalePatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let truth: FidelityMeasure['truth'] = 'fiction'
  if (score >= 80) truth = 'perfect-fidelity'
  else if (score >= 65) truth = 'high-accuracy'
  else if (score >= 50) truth = 'mostly-accurate'
  else if (score >= 35) truth = 'slightly-off'
  else if (score >= 20) truth = 'misleading'

  return {
    accuracy: score,
    truth,
    hasHighAccuracy: score >= 70,
    hasTruthful: hasJSDoc && hasReturnType,
    hasMatching: hasParamDocs && hasReturnDocs,
    hasNoLying: lyingCount === 0,
    hasAccurate: hasJSDoc && hasExports,
    hasNoStale: staleCount === 0,
    hasCurrent: lyingCount === 0 && staleCount === 0,
    hasNoOutdated: staleCount === 0,
    hasReliable: hasExports && hasInterfaces,
    hasNoFiction: lyingCount === 0 && staleCount === 0,
    lyingCount,
    staleCount,
  }
}

// ─── classifyCondition ──────────────────────────────────────────────────────

/** @example classifyCondition(score) returns condition string */
export function classifyCondition(score: number): PhantomReflection['condition'] {
  if (score >= 90) return 'lucid-mirror'
  if (score >= 75) return 'clear-reflection'
  if (score >= 60) return 'ghostly-image'
  if (score >= 45) return 'distorted-phantom'
  if (score >= 30) return 'shadowy-trace'
  return 'void'
}

// ─── classifyGalleryType ────────────────────────────────────────────────────

/** @example classifyGalleryType(reflections) returns gallery type string */
export function classifyGalleryType(reflections: PhantomReflection[]): MirrorGallery['galleryType'] {
  if (reflections.length === 0) return 'darkness'
  const avg = reflections.reduce((s, r) => s + r.qualityScore, 0) / reflections.length
  const lucidCount = reflections.filter((r) => r.condition === 'lucid-mirror').length
  const ratio = lucidCount / reflections.length
  if (avg >= 80 && ratio >= 0.5) return 'hall-of-mirrors'
  if (avg >= 70) return 'mirror-maze'
  if (avg >= 55) return 'gallery-of-reflections'
  if (avg >= 40) return 'clouded-mirrors'
  if (avg >= 25) return 'broken-glass'
  return 'darkness'
}

// ─── classifyMediumGrade ────────────────────────────────────────────────────

/** @example classifyMediumGrade(avg) returns grade string */
export function classifyMediumGrade(avg: number): PhantomMirrorResult['stats']['mediumGrade'] {
  if (avg >= 80) return 'spirit-medium'
  if (avg >= 65) return 'mirror-master'
  if (avg >= 50) return 'ghost-whisperer'
  if (avg >= 35) return 'apprentice-seer'
  if (avg >= 20) return 'blind-fortune-teller'
  return 'skeptical-muggle'
}

// ─── classifyGalleryCondition ───────────────────────────────────────────────

/** @example classifyGalleryCondition(avg) returns condition string */
export function classifyGalleryCondition(avg: number): MirrorGallery['condition'] {
  if (avg >= 80) return 'perfect-reflections'
  if (avg >= 65) return 'clear-gallery'
  if (avg >= 50) return 'haunted-hall'
  if (avg >= 35) return 'foggy-corridor'
  if (avg >= 20) return 'shattered-hall'
  return 'abyss'
}

// ─── analyzePhantomReflection ───────────────────────────────────────────────

/** @example analyzePhantomReflection(content, filePath) returns PhantomReflection */
export function analyzePhantomReflection(content: string, filePath: string): PhantomReflection {
  const reflective = measureReflective(content)
  const ghost = measureGhost(content)
  const shadow = measureShadow(content)
  const echo = measureEcho(content)
  const phantom = measurePhantom(content)
  const fidelity = measureFidelity(content)

  const reflection = reflective.awareness
  const ghostTrace = ghost.trace
  const shadowQuality = shadow.quality
  const echoClarity = echo.clarity
  const phantomDepth = phantom.depth
  const mirrorFidelity = fidelity.accuracy

  const qualityScore = Math.round(
    reflection * 0.2 +
    ghostTrace * 0.15 +
    shadowQuality * 0.15 +
    echoClarity * 0.2 +
    phantomDepth * 0.15 +
    mirrorFidelity * 0.15,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    reflection,
    ghostTrace,
    shadowQuality,
    echoClarity,
    phantomDepth,
    mirrorFidelity,
    reflective,
    ghost,
    shadow,
    echo,
    phantom,
    fidelity,
    condition,
    qualityScore,
  }
}

// ─── analyzeMirrorGallery ───────────────────────────────────────────────────

/** @example analyzeMirrorGallery(reflections, dirPath) returns MirrorGallery */
export function analyzeMirrorGallery(reflections: PhantomReflection[], dirPath: string): MirrorGallery {
  if (reflections.length === 0) {
    return {
      directory: dirPath,
      reflections,
      avgReflection: 0,
      avgEchoClarity: 0,
      avgFidelity: 0,
      lucidCount: 0,
      voidCount: 0,
      clearCount: 0,
      ghostlyCount: 0,
      galleryType: 'darkness',
      condition: 'abyss',
    }
  }

  const avgReflection = Math.round(reflections.reduce((s, r) => s + r.reflection, 0) / reflections.length)
  const avgEchoClarity = Math.round(reflections.reduce((s, r) => s + r.echoClarity, 0) / reflections.length)
  const avgFidelity = Math.round(reflections.reduce((s, r) => s + r.mirrorFidelity, 0) / reflections.length)
  const lucidCount = reflections.filter((r) => r.condition === 'lucid-mirror').length
  const voidCount = reflections.filter((r) => r.condition === 'void').length
  const clearCount = reflections.filter((r) => r.condition === 'clear-reflection').length
  const ghostlyCount = reflections.filter((r) => r.condition === 'ghostly-image').length
  const galleryType = classifyGalleryType(reflections)
  const overallAvg = Math.round(reflections.reduce((s, r) => s + r.qualityScore, 0) / reflections.length)
  const condition = classifyGalleryCondition(overallAvg)

  return {
    directory: dirPath,
    reflections,
    avgReflection,
    avgEchoClarity,
    avgFidelity,
    lucidCount,
    voidCount,
    clearCount,
    ghostlyCount,
    galleryType,
    condition,
  }
}

// ─── generateRecommendations ────────────────────────────────────────────────

/** @example generateRecommendations(reflections, galleries, mansion, stats) returns string[] */
export function generateRecommendations(
  _reflections: PhantomReflection[],
  _galleries: MirrorGallery[],
  mansion: PhantomMirrorResult['mansion'],
  stats: PhantomMirrorResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgReflection < 40) {
    recs.push('Improve code self-awareness with interfaces, return types, and JSDoc documentation')
  }
  if (stats.avgGhostTrace < 35) {
    recs.push('Make execution paths visible with return types, error handling, and explicit flows')
  }
  if (stats.avgShadowQuality < 40) {
    recs.push('Increase code predictability with const, readonly, strict equality, and null safety')
  }
  if (stats.avgEchoClarity < 40) {
    recs.push('Enhance debugging clarity with proper error messages, try/catch, and diagnostic patterns')
  }
  if (stats.avgPhantomDepth < 40) {
    recs.push('Make abstractions visible with explicit return types, exports, and clear layering')
  }
  if (stats.avgMirrorFidelity < 35) {
    recs.push('Improve documentation accuracy with JSDoc @param, @returns, and matching return types')
  }
  if (mansion.overallClarity < 50) {
    recs.push('Overall mirror clarity is low — invest in type safety, error handling, and documentation')
  }
  if (stats.voidCount > stats.totalFiles * 0.3) {
    recs.push('Too many void-quality files — refactor to improve code reflection and transparency')
  }
  if (recs.length === 0) {
    recs.push('Phantom mirror clarity is excellent — code reflects its intentions with perfect fidelity')
  }

  return recs
}

// ─── buildPhantomMirrorResult ───────────────────────────────────────────────

/** @example buildPhantomMirrorResult(files, contents) returns PhantomMirrorResult */
export function buildPhantomMirrorResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): PhantomMirrorResult {
  const reflections = files.map((file, i) => analyzePhantomReflection(contents[i] ?? '', file))

  const dirMap = new Map<string, PhantomReflection[]>()
  reflections.forEach((reflection) => {
    const parts = reflection.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(reflection)
    } else {
      dirMap.set(dir, [reflection])
    }
  })

  const galleries = Array.from(dirMap.entries()).map(
    ([dir, dirReflections]) => analyzeMirrorGallery(dirReflections, dir),
  )

  const totalFiles = reflections.length
  const avgReflection = totalFiles > 0 ? Math.round(reflections.reduce((s, r) => s + r.reflection, 0) / totalFiles) : 0
  const avgGhostTrace = totalFiles > 0 ? Math.round(reflections.reduce((s, r) => s + r.ghostTrace, 0) / totalFiles) : 0
  const avgShadowQuality = totalFiles > 0 ? Math.round(reflections.reduce((s, r) => s + r.shadowQuality, 0) / totalFiles) : 0
  const avgEchoClarity = totalFiles > 0 ? Math.round(reflections.reduce((s, r) => s + r.echoClarity, 0) / totalFiles) : 0
  const avgPhantomDepth = totalFiles > 0 ? Math.round(reflections.reduce((s, r) => s + r.phantomDepth, 0) / totalFiles) : 0
  const avgMirrorFidelity = totalFiles > 0 ? Math.round(reflections.reduce((s, r) => s + r.mirrorFidelity, 0) / totalFiles) : 0

  const overallClarity = totalFiles > 0
    ? Math.round(reflections.reduce((s, r) => s + r.qualityScore, 0) / totalFiles)
    : 0

  const mansion: PhantomMirrorResult['mansion'] = {
    avgReflection,
    avgEchoClarity,
    avgFidelity: avgMirrorFidelity,
    isClear: avgReflection >= 60,
    overallClarity,
  }

  const findBest = (fn: (r: PhantomReflection) => number): string => {
    if (reflections.length === 0) return ''
    const best = reflections.reduce((a, b) => fn(a) >= fn(b) ? a : b)
    return best.file
  }

  const stats: PhantomMirrorResult['stats'] = {
    totalFiles,
    totalGalleries: galleries.length,
    avgReflection,
    avgGhostTrace,
    avgShadowQuality,
    avgEchoClarity,
    avgPhantomDepth,
    avgMirrorFidelity,
    lucidMirrorCount: reflections.filter((r) => r.condition === 'lucid-mirror').length,
    clearReflectionCount: reflections.filter((r) => r.condition === 'clear-reflection').length,
    ghostlyImageCount: reflections.filter((r) => r.condition === 'ghostly-image').length,
    distortedPhantomCount: reflections.filter((r) => r.condition === 'distorted-phantom').length,
    shadowyTraceCount: reflections.filter((r) => r.condition === 'shadowy-trace').length,
    voidCount: reflections.filter((r) => r.condition === 'void').length,
    hasHighAwarenessCount: reflections.filter((r) => r.reflective.hasHighAwareness).length,
    hasHighTraceCount: reflections.filter((r) => r.ghost.hasHighTrace).length,
    hasHighQualityCount: reflections.filter((r) => r.shadow.hasHighQuality).length,
    hasHighClarityCount: reflections.filter((r) => r.echo.hasHighClarity).length,
    hasHighDepthCount: reflections.filter((r) => r.phantom.hasHighDepth).length,
    hasHighAccuracyCount: reflections.filter((r) => r.fidelity.hasHighAccuracy).length,
    overallClarity,
    mediumGrade: classifyMediumGrade(overallClarity),
    bestReflection: findBest((r) => r.qualityScore),
    mostSelfAware: findBest((r) => r.reflection),
    mostTraceable: findBest((r) => r.ghostTrace),
    mostPredictable: findBest((r) => r.shadowQuality),
    mostDebuggable: findBest((r) => r.echoClarity),
    mostTransparent: findBest((r) => r.phantomDepth),
  }

  const recommendations = generateRecommendations(reflections, galleries, mansion, stats)

  return { reflections, galleries, mansion, stats, recommendations }
}
