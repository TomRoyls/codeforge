// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface TransparentMeasure {
  visibility: number
  clarity: 'crystal-clear' | 'clear-glass' | 'lightly-frosted' | 'heavily-frosted' | 'opaque-frost' | 'solid-wall'
  hasHighVisibility: boolean
  hasSeeThrough: boolean
  hasNoObfuscation: boolean
  hasClearIntent: boolean
  hasReadable: boolean
  hasNoHiding: boolean
  hasObvious: boolean
  hasNoConcealment: boolean
  hasVisible: boolean
  hasNoCamouflage: boolean
  obfuscationCount: number
  concealmentCount: number
}

export interface FrostMeasure {
  level: number
  coverage: 'pure-crystal' | 'light-frost' | 'medium-frost' | 'heavy-frost' | 'full-coverage' | 'painted-over'
  hasHighLevel: boolean
  hasProperAbstraction: boolean
  hasEncapsulation: boolean
  hasNoOverhiding: boolean
  hasAppropriate: boolean
  hasNoUnderexposing: boolean
  hasBalanced: boolean
  hasNoLeaking: boolean
  hasProtective: boolean
  hasNoRevealing: boolean
  overhidingCount: number
  leakingCount: number
}

export interface RefractiveMeasure {
  indirection: number
  bending: 'no-refraction' | 'slight-bend' | 'moderate-refraction' | 'significant-bend' | 'heavy-distortion' | 'prism-split'
  hasHighIndirection: boolean
  hasProperLayering: boolean
  hasNoExcessiveWrapping: boolean
  hasClean: boolean
  hasNoMaze: boolean
  hasIntentional: boolean
  hasNoAccidental: boolean
  hasFocused: boolean
  hasNoScattering: boolean
  hasDirect: boolean
  wrappingCount: number
  mazeCount: number
}

export interface LightMeasure {
  transmission: number
  brightness: 'full-spectrum' | 'bright-transmission' | 'adequate-light' | 'dim-transmission' | 'barely-glowing' | 'light-blocking'
  hasHighTransmission: boolean
  hasIlluminating: boolean
  hasNoDarkSpots: boolean
  hasProperLighting: boolean
  hasExamples: boolean
  hasNoShadow: boolean
  hasClearExplanations: boolean
  hasNoBlindSpots: boolean
  hasVisibleLogic: boolean
  hasNoObscurity: boolean
  darkSpotCount: number
  blindSpotCount: number
}

export interface SurfaceMeasure {
  quality: number
  finish: 'mirror-finish' | 'polished-surface' | 'smooth-glass' | 'slightly-rough' | 'textured' | 'broken'
  hasHighQuality: boolean
  hasCleanAPI: boolean
  hasNoSharp: boolean
  hasSmooth: boolean
  hasProperTyping: boolean
  hasNoRoughEdges: boolean
  hasConsistent: boolean
  hasNoIrregular: boolean
  hasWellShaped: boolean
  hasNoFragmented: boolean
  sharpEdgeCount: number
  irregularCount: number
}

export interface InsulatingMeasure {
  encapsulation: number
  protection: 'vault-grade' | 'double-glazed' | 'single-pane' | 'film-coated' | 'bare-glass' | 'shattered'
  hasHighEncapsulation: boolean
  hasProperBoundaries: boolean
  hasNoLeaking: boolean
  hasSoundProof: boolean
  hasNoSeepage: boolean
  hasThermal: boolean
  hasNoCracks: boolean
  hasWeatherproof: boolean
  hasNoDrafts: boolean
  hasSealed: boolean
  leakingCount: number
  crackCount: number
}

export interface GlassPane {
  file: string
  transparency: number
  frostLevel: number
  refraction: number
  lightTransmission: number
  surfaceQuality: number
  insulation: number
  transparent: TransparentMeasure
  frost: FrostMeasure
  refractive: RefractiveMeasure
  light: LightMeasure
  surface: SurfaceMeasure
  insulating: InsulatingMeasure
  condition: 'stained-glass-art' | 'clear-pane' | 'frosted-window' | 'clouded-glass' | 'cracked-pane' | 'shattered'
  qualityScore: number
}

export interface GlassInstallation {
  directory: string
  panes: GlassPane[]
  avgTransparency: number
  avgSurfaceQuality: number
  avgInsulation: number
  clearPaneCount: number
  shatteredCount: number
  frostedCount: number
  cloudedCount: number
  installationType: 'cathedral-window' | 'modern-facade' | 'office-partition' | 'bathroom-window' | 'boarded-up' | 'hole-in-wall'
  condition: 'architectural-marvel' | 'clean-installation' | 'functional-glazing' | 'patchy-panes' | 'failing-seals' | 'broken-glass'
}

export interface FrostedGlassResult {
  panes: GlassPane[]
  installations: GlassInstallation[]
  building: {
    avgTransparency: number
    avgSurfaceQuality: number
    avgInsulation: number
    isTransparent: boolean
    overallClarity: number
  }
  stats: {
    totalFiles: number
    totalInstallations: number
    avgTransparency: number
    avgFrostLevel: number
    avgRefraction: number
    avgLightTransmission: number
    avgSurfaceQuality: number
    avgInsulation: number
    stainedGlassArtCount: number
    clearPaneCount: number
    frostedWindowCount: number
    cloudedGlassCount: number
    crackedPaneCount: number
    shatteredCount: number
    hasHighVisibilityCount: number
    hasHighLevelCount: number
    hasHighIndirectionCount: number
    hasHighTransmissionCount: number
    hasHighQualityCount: number
    hasHighEncapsulationCount: number
    overallClarity: number
    glazierGrade: 'master-glazier' | 'expert-craftsman' | 'skilled-worker' | 'competent-installer' | 'apprentice' | 'vandal'
    bestPane: string
    mostTransparent: string
    bestAbstracted: string
    leastIndirect: string
    bestDocumented: string
    bestInterface: string
  }
  recommendations: string[]
}

// ─── Measure Transparent (code visibility) ─────────────────────────────────

/** @example measureTransparent(content) returns TransparentMeasure */
export function measureTransparent(content: string): TransparentMeasure {
  let score = 0
  const hasExports = /\bexport\b/.test(content)
  const hasFunctions = /\bfunction\b/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasConsts = /\bconst\b|\blet\b|\bvar\b/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasReturns = /\breturn\b/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasTemplateLiterals = /`[^`]*\$\{/.test(content)
  const hasArrow = /=>\s*\{/.test(content)
  const hasGenerics = /<\w+>/.test(content)

  if (hasExports) score += 15
  if (hasFunctions) score += 10
  if (hasClasses) score += 10
  if (hasConsts) score += 5
  if (hasInterfaces) score += 10
  if (hasTypes) score += 8
  if (hasReturns) score += 7
  if (hasAsync) score += 5
  if (hasAwait) score += 5
  if (hasImports) score += 5
  if (hasTemplateLiterals) score += 5
  if (hasArrow) score += 5
  if (hasGenerics) score += 5
  score = Math.min(100, score + (content.length > 100 ? 5 : 0))

  const obfuscationPatterns = [/\beval\b/, /\bFunction\s*\(/, /\bwith\s*\(/, /\b__proto__\b/]
  const concealmentPatterns = [/\bTODO\b/, /\bHACK\b/, /\bFIXME\b/, /\bXXX\b/]
  const obfuscationCount = obfuscationPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const concealmentCount = concealmentPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let clarity: TransparentMeasure['clarity'] = 'solid-wall'
  if (score >= 80) clarity = 'crystal-clear'
  else if (score >= 65) clarity = 'clear-glass'
  else if (score >= 50) clarity = 'lightly-frosted'
  else if (score >= 35) clarity = 'heavily-frosted'
  else if (score >= 20) clarity = 'opaque-frost'

  return {
    visibility: score,
    clarity,
    hasHighVisibility: score >= 70,
    hasSeeThrough: hasExports || hasFunctions,
    hasNoObfuscation: obfuscationCount === 0,
    hasClearIntent: hasReturns || hasAsync,
    hasReadable: hasConsts || hasFunctions,
    hasNoHiding: concealmentCount === 0,
    hasObvious: hasClasses || hasInterfaces,
    hasNoConcealment: !/\bTODO\b/.test(content),
    hasVisible: hasImports || hasExports,
    hasNoCamouflage: !/\beval\b/.test(content),
    obfuscationCount,
    concealmentCount,
  }
}

// ─── Measure Frost (code abstraction) ──────────────────────────────────────

/** @example measureFrost(content) returns FrostMeasure */
export function measureFrost(content: string): FrostMeasure {
  let score = 0
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasAbstract = /\babstract\b/.test(content)
  const hasPrivate = /\bprivate\b/.test(content)
  const hasProtected = /\bprotected\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasEnums = /\benum\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasImplements = /\bimplements\b/.test(content)
  const hasExtends = /\bextends\b/.test(content)
  const hasNamespaces = /\bnamespace\b/.test(content)
  const hasModules = /\bmodule\b/.test(content)

  if (hasInterfaces) score += 15
  if (hasTypes) score += 10
  if (hasAbstract) score += 10
  if (hasPrivate) score += 10
  if (hasProtected) score += 8
  if (hasGenerics) score += 10
  if (hasEnums) score += 5
  if (hasReadonly) score += 7
  if (hasImplements) score += 8
  if (hasExtends) score += 7
  if (hasNamespaces) score += 5
  if (hasModules) score += 5
  score = Math.min(100, score)

  const overhidingPatterns = [/\/\/\s*@ts-ignore/, /\/\/\s*@ts-nocheck/, /as\s+any\b/]
  const leakingPatterns = [/\bconsole\.log\b/, /\bdebugger\b/, /\bany\b/]
  const overhidingCount = overhidingPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const leakingCount = leakingPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let coverage: FrostMeasure['coverage'] = 'painted-over'
  if (score >= 80) coverage = 'pure-crystal'
  else if (score >= 65) coverage = 'light-frost'
  else if (score >= 50) coverage = 'medium-frost'
  else if (score >= 35) coverage = 'heavy-frost'
  else if (score >= 20) coverage = 'full-coverage'

  return {
    level: score,
    coverage,
    hasHighLevel: score >= 70,
    hasProperAbstraction: hasInterfaces || hasTypes,
    hasEncapsulation: hasPrivate || hasProtected,
    hasNoOverhiding: overhidingCount === 0,
    hasAppropriate: hasAbstract || hasGenerics,
    hasNoUnderexposing: /\bexport\b/.test(content) || hasInterfaces,
    hasBalanced: (hasInterfaces ? 1 : 0) + (hasTypes ? 1 : 0) + (/\bclass\b/.test(content) ? 1 : 0) >= 2,
    hasNoLeaking: leakingCount === 0,
    hasProtective: hasPrivate || hasReadonly,
    hasNoRevealing: !/\bpublic\s+\w+\s*:/.test(content),
    overhidingCount,
    leakingCount,
  }
}

// ─── Measure Refractive (code indirection) ─────────────────────────────────

/** @example measureRefractive(content) returns RefractiveMeasure */
export function measureRefractive(content: string): RefractiveMeasure {
  let score = 0
  const hasCallbacks = /\bcallback\b|\bcb\b/.test(content)
  const hasPromises = /\bPromise\b/.test(content)
  const hasEventEmitter = /\bEventEmitter\b|\b\.on\s*\(/.test(content)
  const hasProxy = /\bProxy\b/.test(content)
  const hasMaps = /\bMap\s*</.test(content)
  const hasWeakRef = /\bWeakRef\b|\bWeakMap\b/.test(content)
  const hasFactories = /\bcreate\w+\s*\(/.test(content)
  const hasBuilders = /\bbuild\w+\s*\(/.test(content)
  const hasWrappers = /\bwrap\w+\s*\(/.test(content)
  const hasMiddlewares = /\bmiddleware\b|\buse\s*\(/.test(content)
  const hasDecorators = /@\w+/.test(content)
  const hasGetters = /\bget\s+\w+\s*\(/.test(content)

  if (hasCallbacks) score += 8
  if (hasPromises) score += 10
  if (hasEventEmitter) score += 8
  if (hasProxy) score += 10
  if (hasMaps) score += 7
  if (hasWeakRef) score += 8
  if (hasFactories) score += 10
  if (hasBuilders) score += 8
  if (hasWrappers) score += 7
  if (hasMiddlewares) score += 8
  if (hasDecorators) score += 8
  if (hasGetters) score += 8
  score = Math.min(100, score)

  const wrappingPatterns = [/\bwrap\w+\(/, /\bdecorate\b/, /\bintercept\b/]
  const mazePatterns = [/\bcallback.*callback/, /\.then\s*\(/g]
  const wrappingCount = wrappingPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const mazeCount = mazePatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let bending: RefractiveMeasure['bending'] = 'prism-split'
  if (score >= 80) bending = 'no-refraction'
  else if (score >= 65) bending = 'slight-bend'
  else if (score >= 50) bending = 'moderate-refraction'
  else if (score >= 35) bending = 'significant-bend'
  else if (score >= 20) bending = 'heavy-distortion'

  return {
    indirection: score,
    bending,
    hasHighIndirection: score >= 70,
    hasProperLayering: /\binterface\b/.test(content) || /\bclass\b/.test(content),
    hasNoExcessiveWrapping: wrappingCount === 0,
    hasClean: !hasCallbacks || hasPromises,
    hasNoMaze: mazeCount === 0,
    hasIntentional: hasFactories || hasBuilders,
    hasNoAccidental: !/\bvoid\s+\w+\s*\(/.test(content),
    hasFocused: !hasMiddlewares || hasFactories,
    hasNoScattering: !hasProxy || /\binterface\b/.test(content),
    hasDirect: hasPromises || hasAsync(),
    wrappingCount,
    mazeCount,
  }

  function hasAsync(): boolean {
    return /\basync\b/.test(content)
  }
}

// ─── Measure Light (code documentation) ────────────────────────────────────

/** @example measureLight(content) returns LightMeasure */
export function measureLight(content: string): LightMeasure {
  let score = 0
  const hasJsDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInlineComments = /\/\/.*/.test(content)
  const hasDocParams = /@param\b/.test(content)
  const hasDocReturns = /@returns?\b/.test(content)
  const hasExamples = /@example\b/.test(content)
  const hasDocThrows = /@throws\b/.test(content)
  const hasDocDeprecated = /@deprecated\b/.test(content)
  const hasDocSee = /@see\b/.test(content)
  const hasDescriptions = /\/\*\*[\s\S]*?\*\//g.test(content) && content.length > 200
  const hasReadme = /\breadme\b/i.test(content)
  const hasTypeAnnotations = /:\s*(string|number|boolean|void|never|unknown)\b/.test(content)

  if (hasJsDoc) score += 15
  if (hasInlineComments) score += 8
  if (hasDocParams) score += 10
  if (hasDocReturns) score += 10
  if (hasExamples) score += 12
  if (hasDocThrows) score += 5
  if (hasDocDeprecated) score += 3
  if (hasDocSee) score += 5
  if (hasDescriptions) score += 7
  if (hasReadme) score += 5
  if (hasTypeAnnotations) score += 10
  if (content.length > 100) score += 10
  score = Math.min(100, score)

  const darkSpotPatterns = [/\bTODO\b/, /\bFIXME\b/]
  const blindSpotPatterns = [/\bany\b/, /\bunknown\b/]
  const darkSpotCount = darkSpotPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const blindSpotCount = blindSpotPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let brightness: LightMeasure['brightness'] = 'light-blocking'
  if (score >= 80) brightness = 'full-spectrum'
  else if (score >= 65) brightness = 'bright-transmission'
  else if (score >= 50) brightness = 'adequate-light'
  else if (score >= 35) brightness = 'dim-transmission'
  else if (score >= 20) brightness = 'barely-glowing'

  return {
    transmission: score,
    brightness,
    hasHighTransmission: score >= 70,
    hasIlluminating: hasJsDoc,
    hasNoDarkSpots: darkSpotCount === 0,
    hasProperLighting: hasDocParams && hasDocReturns,
    hasExamples: hasExamples,
    hasNoShadow: !/\bFIXME\b/.test(content),
    hasClearExplanations: hasJsDoc && hasDocParams,
    hasNoBlindSpots: blindSpotCount === 0,
    hasVisibleLogic: hasTypeAnnotations,
    hasNoObscurity: !/\beval\b/.test(content),
    darkSpotCount,
    blindSpotCount,
  }
}

// ─── Measure Surface (code interface) ──────────────────────────────────────

/** @example measureSurface(content) returns SurfaceMeasure */
export function measureSurface(content: string): SurfaceMeasure {
  let score = 0
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasDefaultExport = /\bexport\s+default\b/.test(content)
  const hasNamedExports = /\bexport\s+(function|class|const|interface|type)\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasOptional = /\?\s*:/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasAsyncFunctions = /\basync\s+function\b/.test(content)
  const hasReturnTypes = /\)\s*:\s*(?!void\s*\{)(?!{)\w+/.test(content)
  const hasParamTypes = /\(\s*\w+\s*:/.test(content)
  const hasOverloads = /\bfunction\s+\w+\s*\([^)]*\)\s*:\s*\w+\s*;/.test(content)

  if (hasInterfaces) score += 15
  if (hasTypes) score += 10
  if (hasExports) score += 8
  if (hasDefaultExport) score += 3
  if (hasNamedExports) score += 10
  if (hasGenerics) score += 10
  if (hasOptional) score += 8
  if (hasReadonly) score += 5
  if (hasAsyncFunctions) score += 5
  if (hasReturnTypes) score += 10
  if (hasParamTypes) score += 8
  if (hasOverloads) score += 8
  score = Math.min(100, score)

  const sharpEdgePatterns = [/\bas\s+any\b/, /\/\/\s*@ts-ignore/]
  const irregularPatterns = [/\bvar\b/, /\bfunction\s+\w+\s*\(/g]
  const sharpEdgeCount = sharpEdgePatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const irregularCount = irregularPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let finish: SurfaceMeasure['finish'] = 'broken'
  if (score >= 80) finish = 'mirror-finish'
  else if (score >= 65) finish = 'polished-surface'
  else if (score >= 50) finish = 'smooth-glass'
  else if (score >= 35) finish = 'slightly-rough'
  else if (score >= 20) finish = 'textured'

  return {
    quality: score,
    finish,
    hasHighQuality: score >= 70,
    hasCleanAPI: hasNamedExports || hasInterfaces,
    hasNoSharp: sharpEdgeCount === 0,
    hasSmooth: hasInterfaces && hasExports,
    hasProperTyping: hasParamTypes || hasReturnTypes,
    hasNoRoughEdges: !/\bas\s+any\b/.test(content),
    hasConsistent: (hasInterfaces ? 1 : 0) + (hasTypes ? 1 : 0) + (hasExports ? 1 : 0) >= 2,
    hasNoIrregular: irregularCount === 0,
    hasWellShaped: hasOptional || hasGenerics,
    hasNoFragmented: !/\bexport\s+default\b/.test(content) || hasNamedExports,
    sharpEdgeCount,
    irregularCount,
  }
}

// ─── Measure Insulating (code encapsulation) ───────────────────────────────

/** @example measureInsulating(content) returns InsulatingMeasure */
export function measureInsulating(content: string): InsulatingMeasure {
  let score = 0
  const hasPrivate = /\bprivate\b/.test(content)
  const hasProtected = /\bprotected\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasStatic = /\bstatic\b/.test(content)
  const hasGetters = /\bget\s+\w+\s*\(/.test(content)
  const hasSetters = /\bset\s+\w+\s*\(/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasModules = /\bimport\b/.test(content)
  const hasNamespaces = /\bnamespace\b/.test(content)
  const hasWeakMaps = /\bWeakMap\b|\bWeakSet\b/.test(content)
  const hasSymbols = /\bSymbol\b/.test(content)
  const hasClosures = /\(\s*\)\s*=>\s*\{/.test(content) || /\bfunction\s*\(/.test(content)

  if (hasPrivate) score += 15
  if (hasProtected) score += 10
  if (hasReadonly) score += 8
  if (hasStatic) score += 5
  if (hasGetters) score += 8
  if (hasSetters) score += 5
  if (hasClasses) score += 10
  if (hasModules) score += 7
  if (hasNamespaces) score += 7
  if (hasWeakMaps) score += 8
  if (hasSymbols) score += 7
  if (hasClosures) score += 10
  score = Math.min(100, score)

  const leakingPatterns = [/\bconsole\.log\b/, /\bglobal\./, /\bwindow\./]
  const crackPatterns = [/\bany\b/, /\bnull\s*!/, /\bas\s+any\b/]
  const leakingCount = leakingPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const crackCount = crackPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let protection: InsulatingMeasure['protection'] = 'shattered'
  if (score >= 80) protection = 'vault-grade'
  else if (score >= 65) protection = 'double-glazed'
  else if (score >= 50) protection = 'single-pane'
  else if (score >= 35) protection = 'film-coated'
  else if (score >= 20) protection = 'bare-glass'

  return {
    encapsulation: score,
    protection,
    hasHighEncapsulation: score >= 70,
    hasProperBoundaries: hasPrivate || hasProtected,
    hasNoLeaking: leakingCount === 0,
    hasSoundProof: hasModules && hasClosures,
    hasNoSeepage: !/\bglobal\./.test(content),
    hasThermal: hasStatic || hasGetters,
    hasNoCracks: crackCount === 0,
    hasWeatherproof: hasTryCatch(),
    hasNoDrafts: !/\bany\b/.test(content),
    hasSealed: hasPrivate && hasReadonly,
    leakingCount,
    crackCount,
  }

  function hasTryCatch(): boolean {
    return /\btry\s*\{/.test(content)
  }
}

// ─── classifyPaneCondition ─────────────────────────────────────────────────

/** @example classifyPaneCondition(score) returns condition string */
export function classifyPaneCondition(score: number): GlassPane['condition'] {
  if (score >= 90) return 'stained-glass-art'
  if (score >= 75) return 'clear-pane'
  if (score >= 60) return 'frosted-window'
  if (score >= 45) return 'clouded-glass'
  if (score >= 30) return 'cracked-pane'
  return 'shattered'
}

// ─── classifyInstallationType ──────────────────────────────────────────────

/** @example classifyInstallationType(panes) returns installation type string */
export function classifyInstallationType(panes: GlassPane[]): GlassInstallation['installationType'] {
  if (panes.length === 0) return 'hole-in-wall'
  const avg = panes.reduce((s, p) => s + p.qualityScore, 0) / panes.length
  const stainedCount = panes.filter((p) => p.condition === 'stained-glass-art').length
  const ratio = stainedCount / panes.length
  if (avg >= 80 && ratio >= 0.5) return 'cathedral-window'
  if (avg >= 70) return 'modern-facade'
  if (avg >= 55) return 'office-partition'
  if (avg >= 40) return 'bathroom-window'
  if (avg >= 25) return 'boarded-up'
  return 'hole-in-wall'
}

// ─── classifyInstallationCondition ─────────────────────────────────────────

/** @example classifyInstallationCondition(avg) returns condition string */
export function classifyInstallationCondition(avg: number): GlassInstallation['condition'] {
  if (avg >= 80) return 'architectural-marvel'
  if (avg >= 65) return 'clean-installation'
  if (avg >= 50) return 'functional-glazing'
  if (avg >= 35) return 'patchy-panes'
  if (avg >= 20) return 'failing-seals'
  return 'broken-glass'
}

// ─── classifyGlazierGrade ──────────────────────────────────────────────────

/** @example classifyGlazierGrade(avgClarity) returns grade string */
export function classifyGlazierGrade(avgClarity: number): FrostedGlassResult['stats']['glazierGrade'] {
  if (avgClarity >= 80) return 'master-glazier'
  if (avgClarity >= 65) return 'expert-craftsman'
  if (avgClarity >= 50) return 'skilled-worker'
  if (avgClarity >= 35) return 'competent-installer'
  if (avgClarity >= 20) return 'apprentice'
  return 'vandal'
}

// ─── analyzeGlassPane ──────────────────────────────────────────────────────

/** @example analyzeGlassPane(content, filePath) returns GlassPane */
export function analyzeGlassPane(content: string, filePath: string): GlassPane {
  const transparent = measureTransparent(content)
  const frost = measureFrost(content)
  const refractive = measureRefractive(content)
  const light = measureLight(content)
  const surface = measureSurface(content)
  const insulating = measureInsulating(content)

  const transparency = transparent.visibility
  const frostLevel = frost.level
  const refraction = refractive.indirection
  const lightTransmission = light.transmission
  const surfaceQuality = surface.quality
  const insulation = insulating.encapsulation

  const qualityScore = Math.round(
    transparency * 0.2 +
    frostLevel * 0.15 +
    refraction * 0.15 +
    lightTransmission * 0.15 +
    surfaceQuality * 0.15 +
    insulation * 0.2,
  )

  const condition = classifyPaneCondition(qualityScore)

  return {
    file: filePath,
    transparency,
    frostLevel,
    refraction,
    lightTransmission,
    surfaceQuality,
    insulation,
    transparent,
    frost,
    refractive,
    light,
    surface,
    insulating,
    condition,
    qualityScore,
  }
}

// ─── analyzeGlassInstallation ──────────────────────────────────────────────

/** @example analyzeGlassInstallation(panes, dirPath) returns GlassInstallation */
export function analyzeGlassInstallation(panes: GlassPane[], dirPath: string): GlassInstallation {
  if (panes.length === 0) {
    return {
      directory: dirPath,
      panes,
      avgTransparency: 0,
      avgSurfaceQuality: 0,
      avgInsulation: 0,
      clearPaneCount: 0,
      shatteredCount: 0,
      frostedCount: 0,
      cloudedCount: 0,
      installationType: 'hole-in-wall',
      condition: 'broken-glass',
    }
  }

  const avgTransparency = Math.round(panes.reduce((s, p) => s + p.transparency, 0) / panes.length)
  const avgSurfaceQuality = Math.round(panes.reduce((s, p) => s + p.surfaceQuality, 0) / panes.length)
  const avgInsulation = Math.round(panes.reduce((s, p) => s + p.insulation, 0) / panes.length)
  const clearPaneCount = panes.filter((p) => p.condition === 'clear-pane' || p.condition === 'stained-glass-art').length
  const shatteredCount = panes.filter((p) => p.condition === 'shattered').length
  const frostedCount = panes.filter((p) => p.condition === 'frosted-window').length
  const cloudedCount = panes.filter((p) => p.condition === 'clouded-glass').length
  const installationType = classifyInstallationType(panes)
  const overallAvg = Math.round(panes.reduce((s, p) => s + p.qualityScore, 0) / panes.length)
  const condition = classifyInstallationCondition(overallAvg)

  return {
    directory: dirPath,
    panes,
    avgTransparency,
    avgSurfaceQuality,
    avgInsulation,
    clearPaneCount,
    shatteredCount,
    frostedCount,
    cloudedCount,
    installationType,
    condition,
  }
}

// ─── generateRecommendations ───────────────────────────────────────────────

/** @example generateRecommendations(panes, installations, building, stats) returns string[] */
export function generateRecommendations(
  panes: GlassPane[],
  installations: GlassInstallation[],
  building: FrostedGlassResult['building'],
  stats: FrostedGlassResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgTransparency < 40) {
    recs.push('Increase code transparency by adding more exports and visible interfaces')
  }
  if (stats.avgFrostLevel < 30) {
    recs.push('Consider adding type abstractions for better code structure')
  }
  if (stats.avgRefraction > 70) {
    recs.push('Reduce code indirection — simplify complex callback chains')
  }
  if (stats.avgLightTransmission < 40) {
    recs.push('Add JSDoc documentation with @param and @returns annotations')
  }
  if (stats.avgSurfaceQuality < 40) {
    recs.push('Improve API interfaces with proper TypeScript typing')
  }
  if (stats.avgInsulation < 30) {
    recs.push('Strengthen encapsulation with private/protected access modifiers')
  }
  if (building.overallClarity < 50) {
    recs.push('Overall clarity is low — focus on readability and documentation')
  }
  if (stats.shatteredCount > stats.totalFiles * 0.3) {
    recs.push('Too many shattered files — refactor empty or poorly structured code')
  }
  if (recs.length === 0) {
    recs.push('Code glass quality is excellent — maintain current standards')
  }

  return recs
}

// ─── buildFrostedGlassResult ───────────────────────────────────────────────

/** @example buildFrostedGlassResult(files, contents) returns FrostedGlassResult */
export function buildFrostedGlassResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): FrostedGlassResult {
  const panes = files.map((file, i) => analyzeGlassPane(contents[i] ?? '', file))

  const dirMap = new Map<string, GlassPane[]>()
  panes.forEach((pane) => {
    const parts = pane.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(pane)
    } else {
      dirMap.set(dir, [pane])
    }
  })

  const installations = Array.from(dirMap.entries()).map(
    ([dir, dirPanes]) => analyzeGlassInstallation(dirPanes, dir),
  )

  const totalFiles = panes.length
  const avgTransparency = totalFiles > 0 ? Math.round(panes.reduce((s, p) => s + p.transparency, 0) / totalFiles) : 0
  const avgFrostLevel = totalFiles > 0 ? Math.round(panes.reduce((s, p) => s + p.frostLevel, 0) / totalFiles) : 0
  const avgRefraction = totalFiles > 0 ? Math.round(panes.reduce((s, p) => s + p.refraction, 0) / totalFiles) : 0
  const avgLightTransmission = totalFiles > 0 ? Math.round(panes.reduce((s, p) => s + p.lightTransmission, 0) / totalFiles) : 0
  const avgSurfaceQuality = totalFiles > 0 ? Math.round(panes.reduce((s, p) => s + p.surfaceQuality, 0) / totalFiles) : 0
  const avgInsulation = totalFiles > 0 ? Math.round(panes.reduce((s, p) => s + p.insulation, 0) / totalFiles) : 0

  const overallClarity = totalFiles > 0
    ? Math.round(panes.reduce((s, p) => s + p.qualityScore, 0) / totalFiles)
    : 0

  const avgSurface = totalFiles > 0
    ? Math.round(panes.reduce((s, p) => s + p.surfaceQuality, 0) / totalFiles)
    : 0
  const avgIns = totalFiles > 0
    ? Math.round(panes.reduce((s, p) => s + p.insulation, 0) / totalFiles)
    : 0

  const building: FrostedGlassResult['building'] = {
    avgTransparency,
    avgSurfaceQuality: avgSurface,
    avgInsulation: avgIns,
    isTransparent: avgTransparency >= 60,
    overallClarity,
  }

  const findBest = (fn: (p: GlassPane) => number): string => {
    if (panes.length === 0) return ''
    const best = panes.reduce((a, b) => fn(a) >= fn(b) ? a : b)
    return best.file
  }

  const stats: FrostedGlassResult['stats'] = {
    totalFiles,
    totalInstallations: installations.length,
    avgTransparency,
    avgFrostLevel,
    avgRefraction,
    avgLightTransmission,
    avgSurfaceQuality,
    avgInsulation,
    stainedGlassArtCount: panes.filter((p) => p.condition === 'stained-glass-art').length,
    clearPaneCount: panes.filter((p) => p.condition === 'clear-pane').length,
    frostedWindowCount: panes.filter((p) => p.condition === 'frosted-window').length,
    cloudedGlassCount: panes.filter((p) => p.condition === 'clouded-glass').length,
    crackedPaneCount: panes.filter((p) => p.condition === 'cracked-pane').length,
    shatteredCount: panes.filter((p) => p.condition === 'shattered').length,
    hasHighVisibilityCount: panes.filter((p) => p.transparent.hasHighVisibility).length,
    hasHighLevelCount: panes.filter((p) => p.frost.hasHighLevel).length,
    hasHighIndirectionCount: panes.filter((p) => p.refractive.hasHighIndirection).length,
    hasHighTransmissionCount: panes.filter((p) => p.light.hasHighTransmission).length,
    hasHighQualityCount: panes.filter((p) => p.surface.hasHighQuality).length,
    hasHighEncapsulationCount: panes.filter((p) => p.insulating.hasHighEncapsulation).length,
    overallClarity,
    glazierGrade: classifyGlazierGrade(overallClarity),
    bestPane: findBest((p) => p.qualityScore),
    mostTransparent: findBest((p) => p.transparency),
    bestAbstracted: findBest((p) => p.frostLevel),
    leastIndirect: panes.length > 0
      ? panes.reduce((a, b) => a.refraction <= b.refraction ? a : b).file
      : '',
    bestDocumented: findBest((p) => p.lightTransmission),
    bestInterface: findBest((p) => p.surfaceQuality),
  }

  const recommendations = generateRecommendations(panes, installations, building, stats)

  return { panes, installations, building, stats, recommendations }
}
