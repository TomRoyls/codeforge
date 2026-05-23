// ─── Types ─────────────────────────────────────────────────────────────────

export interface EtherealMeasure {
  elegance: number
  beauty: 'transcendent' | 'breathtaking' | 'beautiful' | 'pleasant' | 'ordinary' | 'uninspiring'
  hasHighElegance: boolean
  hasGraceful: boolean
  hasElegant: boolean
  hasNoHarshness: boolean
  hasRefined: boolean
  hasNoCrudeness: boolean
  hasBeautiful: boolean
  hasNoUgliness: boolean
  hasPoetic: boolean
  hasNoBrutalism: boolean
  harshnessCount: number
  crudenessCount: number
}

export interface MagneticMeasure {
  alignment: number
  field: 'perfect-alignment' | 'strong-field' | 'proper-alignment' | 'drifting' | 'misaligned' | 'chaotic'
  hasHighAlignment: boolean
  hasConsistent: boolean
  hasAligned: boolean
  hasNoDeviation: boolean
  hasUniform: boolean
  hasNoContradiction: boolean
  hasHarmonious: boolean
  hasNoConflict: boolean
  hasCoherent: boolean
  hasNoInconsistency: boolean
  deviationCount: number
  conflictCount: number
}

export interface SpectralMeasure {
  richness: number
  spectrum: 'full-spectrum' | 'rich-palette' | 'colorful' | 'adequate-colors' | 'monochrome' | 'colorless'
  hasHighRichness: boolean
  hasDiverse: boolean
  hasVaried: boolean
  hasNoMonotony: boolean
  hasRich: boolean
  hasNoRepetition: boolean
  hasMultiFaceted: boolean
  hasNoSingle: boolean
  hasColorful: boolean
  hasNoBland: boolean
  monotonyCount: number
  repetitionCount: number
}

export interface PolarMeasure {
  clarity: number
  focus: 'laser-focused' | 'sharp-focus' | 'clear-purpose' | 'somewhat-scattered' | 'diffuse' | 'scattered'
  hasHighClarity: boolean
  hasFocused: boolean
  hasPurposeful: boolean
  hasNoDistraction: boolean
  hasTargeted: boolean
  hasNoTangent: boolean
  hasConcentrated: boolean
  hasNoScatter: boolean
  hasClearIntent: boolean
  hasNoWandering: boolean
  distractionCount: number
  tangentCount: number
}

export interface AtmosphericMeasure {
  depth: number
  pressure: 'deep-atmosphere' | 'rich-context' | 'proper-layering' | 'surface-level' | 'thin-air' | 'vacuum'
  hasHighDepth: boolean
  hasContextual: boolean
  hasWellScoped: boolean
  hasNoIsolation: boolean
  hasConnected: boolean
  hasNoDisconnection: boolean
  hasLayered: boolean
  hasNoFlatness: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  isolationCount: number
  flatnessCount: number
}

export interface LuminousMeasure {
  flow: number
  radiance: 'brilliant-flow' | 'bright-stream' | 'clear-current' | 'murky-flow' | 'turbulent' | 'opaque'
  hasHighFlow: boolean
  hasReadable: boolean
  hasFlowing: boolean
  hasNoBlockage: boolean
  hasClear: boolean
  hasNoObfuscation: boolean
  hasTransparent: boolean
  hasNoMuddying: boolean
  hasLuminous: boolean
  hasNoDarkness: boolean
  blockageCount: number
  obfuscationCount: number
}

export type RibbonCondition = 'ethereal-veil' | 'dancing-lights' | 'steady-glow' | 'fading-aurora' | 'dim-light' | 'dark-sky'

export interface AuroraRibbon {
  file: string
  etherealBeauty: number
  magneticAlignment: number
  spectralRichness: number
  polarClarity: number
  atmosphericDepth: number
  luminousFlow: number
  ethereal: EtherealMeasure
  magnetic: MagneticMeasure
  spectral: SpectralMeasure
  polar: PolarMeasure
  atmospheric: AtmosphericMeasure
  luminous: LuminousMeasure
  condition: RibbonCondition
  qualityScore: number
}

export type DisplayType = 'grand-display' | 'aurora-borealis' | 'southern-lights' | 'faint-glow' | 'cloud-cover' | 'clear-night'
export type DisplayCondition = 'magnificent-aurora' | 'beautiful-display' | 'pleasant-lights' | 'fading-glow' | 'barely-visible' | 'invisible'

export interface AuroraDisplay {
  directory: string
  ribbons: AuroraRibbon[]
  avgBeauty: number
  avgClarity: number
  avgFlow: number
  etherealVeilCount: number
  darkSkyCount: number
  dancingLightsCount: number
  steadyGlowCount: number
  displayType: DisplayType
  condition: DisplayCondition
}

export interface AuroraSky {
  avgBeauty: number
  avgClarity: number
  avgFlow: number
  isEthereal: boolean
  overallLuminosity: number
}

export type AstronomerGrade = 'aurora-master' | 'expert-observer' | 'skilled-watcher' | 'amateur-stargazer' | 'casual-viewer' | 'cloudy-night'

export interface AuroraVeilStats {
  totalFiles: number
  totalDisplays: number
  avgEtherealBeauty: number
  avgMagneticAlignment: number
  avgSpectralRichness: number
  avgPolarClarity: number
  avgAtmosphericDepth: number
  avgLuminousFlow: number
  etherealVeilCount: number
  dancingLightsCount: number
  steadyGlowCount: number
  fadingAuroraCount: number
  dimLightCount: number
  darkSkyCount: number
  hasHighEleganceCount: number
  hasHighAlignmentCount: number
  hasHighRichnessCount: number
  hasHighClarityCount: number
  hasHighDepthCount: number
  hasHighFlowCount: number
  overallLuminosity: number
  astronomerGrade: AstronomerGrade
  bestRibbon: string
  mostBeautiful: string
  bestAligned: string
  mostDiverse: string
  mostFocused: string
  deepest: string
}

export interface AuroraVeilResult {
  ribbons: AuroraRibbon[]
  displays: AuroraDisplay[]
  sky: AuroraSky
  stats: AuroraVeilStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureEthereal(content) evaluates code elegance */
export function measureEthereal(content: string): EtherealMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const harshnessMatches = content.match(/\bvar\s+/g)
  const harshnessCount = harshnessMatches ? harshnessMatches.length : 0
  const crudenessMatches = content.match(/\bany\b/g)
  const crudenessCount = crudenessMatches ? crudenessMatches.length : 0

  const hasGraceful = hasOptionalChaining && hasReadonly
  const hasElegant = hasInterface && hasGenerics
  const hasRefined = hasExport && hasNamedExport
  const hasBeautiful = hasClass && hasInterface
  const hasPoetic = hasDocComments && hasTypeAlias

  let elegance = 0
  if (hasExport) elegance += 10
  if (hasImport) elegance += 8
  if (hasClass) elegance += 8
  if (hasInterface) elegance += 10
  if (hasTypeAlias) elegance += 8
  if (hasGenerics) elegance += 10
  if (hasReadonly) elegance += 8
  if (hasOptionalChaining) elegance += 8
  if (hasDocComments) elegance += 8
  if (hasNamedExport) elegance += 8
  if (hasGraceful) elegance += 5
  if (hasElegant) elegance += 5
  if (hasRefined) elegance += 5
  if (hasBeautiful) elegance += 5
  if (hasPoetic) elegance += 5

  elegance = Math.min(100, Math.round(elegance))

  let beauty: EtherealMeasure['beauty'] = 'uninspiring'
  if (elegance >= 85) beauty = 'transcendent'
  else if (elegance >= 70) beauty = 'breathtaking'
  else if (elegance >= 55) beauty = 'beautiful'
  else if (elegance >= 40) beauty = 'pleasant'
  else if (elegance >= 25) beauty = 'ordinary'

  return {
    elegance,
    beauty,
    hasHighElegance: elegance >= 70,
    hasGraceful,
    hasElegant,
    hasNoHarshness: harshnessCount === 0,
    hasRefined,
    hasNoCrudeness: crudenessCount === 0,
    hasBeautiful,
    hasNoUgliness: harshnessCount === 0 && crudenessCount === 0,
    hasPoetic,
    hasNoBrutalism: harshnessCount === 0,
    harshnessCount,
    crudenessCount,
  }
}

/** @example measureMagnetic(content) evaluates code consistency */
export function measureMagnetic(content: string): MagneticMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const deviationMatches = content.match(/\bvar\s+/g)
  const deviationCount = deviationMatches ? deviationMatches.length : 0
  const conflictMatches = content.match(/\bany\b/g)
  const conflictCount = conflictMatches ? conflictMatches.length : 0

  const hasConsistent = hasConst && hasStrictEquality
  const hasAligned = hasExport && hasImport
  const hasUniform = hasReturnType && hasTypeAnnotation
  const hasHarmonious = hasInterface && hasGenerics
  const hasCoherent = hasNamedExport && hasReadonly

  let alignment = 0
  if (hasExport) alignment += 10
  if (hasImport) alignment += 8
  if (hasConst) alignment += 10
  if (hasReturnType) alignment += 10
  if (hasTypeAnnotation) alignment += 8
  if (hasStrictEquality) alignment += 10
  if (hasNamedExport) alignment += 8
  if (hasGenerics) alignment += 8
  if (hasInterface) alignment += 8
  if (hasReadonly) alignment += 8
  if (hasConsistent) alignment += 5
  if (hasAligned) alignment += 5
  if (hasUniform) alignment += 5
  if (hasHarmonious) alignment += 5
  if (hasCoherent) alignment += 5

  alignment = Math.min(100, Math.round(alignment))

  let field: MagneticMeasure['field'] = 'chaotic'
  if (alignment >= 85) field = 'perfect-alignment'
  else if (alignment >= 70) field = 'strong-field'
  else if (alignment >= 55) field = 'proper-alignment'
  else if (alignment >= 40) field = 'drifting'
  else if (alignment >= 25) field = 'misaligned'

  return {
    alignment,
    field,
    hasHighAlignment: alignment >= 70,
    hasConsistent,
    hasAligned,
    hasNoDeviation: deviationCount === 0,
    hasUniform,
    hasNoContradiction: conflictCount === 0,
    hasHarmonious,
    hasNoConflict: deviationCount === 0 && conflictCount === 0,
    hasCoherent,
    hasNoInconsistency: deviationCount === 0,
    deviationCount,
    conflictCount,
  }
}

/** @example measureSpectral(content) evaluates code diversity */
export function measureSpectral(content: string): SpectralMeasure {
  const hasExport = /export\s/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasPromise = /\bPromise\b/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)

  const monotonyMatches = content.match(/\bvar\s+/g)
  const monotonyCount = monotonyMatches ? monotonyMatches.length : 0
  const repetitionMatches = content.match(/\bany\b/g)
  const repetitionCount = repetitionMatches ? repetitionMatches.length : 0

  const hasDiverse = hasInterface && hasGenerics && hasEnum
  const hasVaried = hasAsync && hasPromise
  const hasRich = hasExport && hasNamedExport && hasTypeAlias
  const hasMultiFaceted = hasClass && hasInterface && hasTypeAlias
  const hasColorful = hasEnum && hasOptionalChaining

  let richness = 0
  if (hasExport) richness += 10
  if (hasClass) richness += 8
  if (hasInterface) richness += 10
  if (hasTypeAlias) richness += 8
  if (hasEnum) richness += 10
  if (hasGenerics) richness += 10
  if (hasAsync) richness += 8
  if (hasPromise) richness += 8
  if (hasNamedExport) richness += 8
  if (hasOptionalChaining) richness += 8
  if (hasDiverse) richness += 5
  if (hasVaried) richness += 5
  if (hasRich) richness += 5
  if (hasMultiFaceted) richness += 5
  if (hasColorful) richness += 5

  richness = Math.min(100, Math.round(richness))

  let spectrum: SpectralMeasure['spectrum'] = 'colorless'
  if (richness >= 85) spectrum = 'full-spectrum'
  else if (richness >= 70) spectrum = 'rich-palette'
  else if (richness >= 55) spectrum = 'colorful'
  else if (richness >= 40) spectrum = 'adequate-colors'
  else if (richness >= 25) spectrum = 'monochrome'

  return {
    richness,
    spectrum,
    hasHighRichness: richness >= 70,
    hasDiverse,
    hasVaried,
    hasNoMonotony: monotonyCount === 0,
    hasRich,
    hasNoRepetition: monotonyCount === 0 && repetitionCount === 0,
    hasMultiFaceted,
    hasNoSingle: monotonyCount === 0,
    hasColorful,
    hasNoBland: repetitionCount === 0,
    monotonyCount,
    repetitionCount,
  }
}

/** @example measurePolar(content) evaluates code focus */
export function measurePolar(content: string): PolarMeasure {
  const hasExport = /export\s/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)

  const distractionMatches = content.match(/\bvar\s+/g)
  const distractionCount = distractionMatches ? distractionMatches.length : 0
  const tangentMatches = content.match(/\bany\b/g)
  const tangentCount = tangentMatches ? tangentMatches.length : 0

  const hasFocused = hasConst && hasReturnType
  const hasPurposeful = hasExport && hasNamedExport
  const hasTargeted = hasInterface && hasGenerics
  const hasConcentrated = hasReadonly && hasConst
  const hasClearIntent = hasDocComments && hasReturnType

  let clarity = 0
  if (hasExport) clarity += 10
  if (hasNamedExport) clarity += 8
  if (hasReturnType) clarity += 10
  if (hasTypeAnnotation) clarity += 10
  if (hasConst) clarity += 8
  if (hasReadonly) clarity += 8
  if (hasInterface) clarity += 10
  if (hasGenerics) clarity += 8
  if (hasDocComments) clarity += 8
  if (hasEnum) clarity += 8
  if (hasFocused) clarity += 5
  if (hasPurposeful) clarity += 5
  if (hasTargeted) clarity += 5
  if (hasConcentrated) clarity += 5
  if (hasClearIntent) clarity += 5

  clarity = Math.min(100, Math.round(clarity))

  let focus: PolarMeasure['focus'] = 'scattered'
  if (clarity >= 85) focus = 'laser-focused'
  else if (clarity >= 70) focus = 'sharp-focus'
  else if (clarity >= 55) focus = 'clear-purpose'
  else if (clarity >= 40) focus = 'somewhat-scattered'
  else if (clarity >= 25) focus = 'diffuse'

  return {
    clarity,
    focus,
    hasHighClarity: clarity >= 70,
    hasFocused,
    hasPurposeful,
    hasNoDistraction: distractionCount === 0,
    hasTargeted,
    hasNoTangent: tangentCount === 0,
    hasConcentrated,
    hasNoScatter: distractionCount === 0 && tangentCount === 0,
    hasClearIntent,
    hasNoWandering: distractionCount === 0,
    distractionCount,
    tangentCount,
  }
}

/** @example measureAtmospheric(content) evaluates code context */
export function measureAtmospheric(content: string): AtmosphericMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasOptionalParam = /\w+\?\s*[):\]]/.test(content)

  const isolationMatches = content.match(/\bvar\s+/g)
  const isolationCount = isolationMatches ? isolationMatches.length : 0
  const flatnessMatches = content.match(/\bany\b/g)
  const flatnessCount = flatnessMatches ? flatnessMatches.length : 0

  const hasContextual = hasExport && hasImport
  const hasWellScoped = hasReturnType && hasOptionalParam
  const hasConnected = hasInterface && hasGenerics
  const hasLayered = hasClass && hasInterface && hasTypeAlias
  const hasDeep = hasDocComments && hasEnum

  let depth = 0
  if (hasExport) depth += 10
  if (hasImport) depth += 8
  if (hasInterface) depth += 10
  if (hasClass) depth += 8
  if (hasTypeAlias) depth += 8
  if (hasDocComments) depth += 10
  if (hasGenerics) depth += 8
  if (hasReturnType) depth += 8
  if (hasEnum) depth += 8
  if (hasOptionalParam) depth += 7
  if (hasContextual) depth += 5
  if (hasWellScoped) depth += 5
  if (hasConnected) depth += 5
  if (hasLayered) depth += 5
  if (hasDeep) depth += 5

  depth = Math.min(100, Math.round(depth))

  let pressure: AtmosphericMeasure['pressure'] = 'vacuum'
  if (depth >= 85) pressure = 'deep-atmosphere'
  else if (depth >= 70) pressure = 'rich-context'
  else if (depth >= 55) pressure = 'proper-layering'
  else if (depth >= 40) pressure = 'surface-level'
  else if (depth >= 25) pressure = 'thin-air'

  return {
    depth,
    pressure,
    hasHighDepth: depth >= 70,
    hasContextual,
    hasWellScoped,
    hasNoIsolation: isolationCount === 0,
    hasConnected,
    hasNoDisconnection: isolationCount === 0 && flatnessCount === 0,
    hasLayered,
    hasNoFlatness: flatnessCount === 0,
    hasDeep,
    hasNoShallow: isolationCount === 0,
    isolationCount,
    flatnessCount,
  }
}

/** @example measureLuminous(content) evaluates code readability */
export function measureLuminous(content: string): LuminousMeasure {
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)

  const blockageMatches = content.match(/\bvar\s+/g)
  const blockageCount = blockageMatches ? blockageMatches.length : 0
  const obfuscationMatches = content.match(/\bany\b/g)
  const obfuscationCount = obfuscationMatches ? obfuscationMatches.length : 0

  const hasReadable = hasConst && hasReturnType
  const hasFlowing = hasOptionalChaining && hasNullishCoalescing
  const hasClear = hasTypeAnnotation && hasDocComments
  const hasTransparent = hasNamedExport && hasInterface
  const hasLuminous = hasReadonly && hasEnum

  let flow = 0
  if (hasConst) flow += 10
  if (hasReturnType) flow += 10
  if (hasTypeAnnotation) flow += 8
  if (hasOptionalChaining) flow += 8
  if (hasNullishCoalescing) flow += 7
  if (hasDocComments) flow += 10
  if (hasNamedExport) flow += 8
  if (hasInterface) flow += 8
  if (hasReadonly) flow += 8
  if (hasEnum) flow += 7
  if (hasReadable) flow += 5
  if (hasFlowing) flow += 5
  if (hasClear) flow += 5
  if (hasTransparent) flow += 5
  if (hasLuminous) flow += 5

  flow = Math.min(100, Math.round(flow))

  let radiance: LuminousMeasure['radiance'] = 'opaque'
  if (flow >= 85) radiance = 'brilliant-flow'
  else if (flow >= 70) radiance = 'bright-stream'
  else if (flow >= 55) radiance = 'clear-current'
  else if (flow >= 40) radiance = 'murky-flow'
  else if (flow >= 25) radiance = 'turbulent'

  return {
    flow,
    radiance,
    hasHighFlow: flow >= 70,
    hasReadable,
    hasFlowing,
    hasNoBlockage: blockageCount === 0,
    hasClear,
    hasNoObfuscation: obfuscationCount === 0,
    hasTransparent,
    hasNoMuddying: blockageCount === 0 && obfuscationCount === 0,
    hasLuminous,
    hasNoDarkness: blockageCount === 0,
    blockageCount,
    obfuscationCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'ethereal-veil' */
export function classifyCondition(score: number): RibbonCondition {
  if (score >= 85) return 'ethereal-veil'
  if (score >= 70) return 'dancing-lights'
  if (score >= 55) return 'steady-glow'
  if (score >= 40) return 'fading-aurora'
  if (score >= 25) return 'dim-light'
  return 'dark-sky'
}

/** @example classifyDisplayType(ribbons) returns display classification */
export function classifyDisplayType(ribbons: AuroraRibbon[]): DisplayType {
  if (ribbons.length === 0) return 'clear-night'
  const avgQs = ribbons.reduce((s, r) => s + r.qualityScore, 0) / ribbons.length
  const etherealCount = ribbons.filter((r) => r.condition === 'ethereal-veil').length
  const ratio = etherealCount / ribbons.length
  if (avgQs >= 75 && ratio >= 0.5) return 'grand-display'
  if (avgQs >= 60) return 'aurora-borealis'
  if (avgQs >= 45) return 'southern-lights'
  if (avgQs >= 30) return 'faint-glow'
  if (avgQs >= 15) return 'cloud-cover'
  return 'clear-night'
}

/** @example classifyDisplayCondition(avgQs) returns display condition */
export function classifyDisplayCondition(avgQs: number): DisplayCondition {
  if (avgQs >= 75) return 'magnificent-aurora'
  if (avgQs >= 60) return 'beautiful-display'
  if (avgQs >= 45) return 'pleasant-lights'
  if (avgQs >= 30) return 'fading-glow'
  if (avgQs >= 15) return 'barely-visible'
  return 'invisible'
}

/** @example classifyAstronomerGrade(80) returns 'aurora-master' */
export function classifyAstronomerGrade(avgLuminosity: number): AstronomerGrade {
  if (avgLuminosity >= 80) return 'aurora-master'
  if (avgLuminosity >= 65) return 'expert-observer'
  if (avgLuminosity >= 50) return 'skilled-watcher'
  if (avgLuminosity >= 35) return 'amateur-stargazer'
  if (avgLuminosity >= 20) return 'casual-viewer'
  return 'cloudy-night'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeAuroraRibbon(content, filePath) evaluates single file */
export function analyzeAuroraRibbon(content: string, filePath: string): AuroraRibbon {
  const ethereal = measureEthereal(content)
  const magnetic = measureMagnetic(content)
  const spectral = measureSpectral(content)
  const polar = measurePolar(content)
  const atmospheric = measureAtmospheric(content)
  const luminous = measureLuminous(content)

  const qualityScore = Math.round(
    ethereal.elegance * 0.2 +
    magnetic.alignment * 0.15 +
    spectral.richness * 0.15 +
    polar.clarity * 0.15 +
    atmospheric.depth * 0.15 +
    luminous.flow * 0.2,
  )

  return {
    file: filePath,
    etherealBeauty: ethereal.elegance,
    magneticAlignment: magnetic.alignment,
    spectralRichness: spectral.richness,
    polarClarity: polar.clarity,
    atmosphericDepth: atmospheric.depth,
    luminousFlow: luminous.flow,
    ethereal,
    magnetic,
    spectral,
    polar,
    atmospheric,
    luminous,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeAuroraDisplay(ribbons, dirPath) evaluates directory */
export function analyzeAuroraDisplay(ribbons: AuroraRibbon[], dirPath: string): AuroraDisplay {
  if (ribbons.length === 0) {
    return {
      directory: dirPath,
      ribbons: [],
      avgBeauty: 0,
      avgClarity: 0,
      avgFlow: 0,
      etherealVeilCount: 0,
      darkSkyCount: 0,
      dancingLightsCount: 0,
      steadyGlowCount: 0,
      displayType: 'clear-night',
      condition: 'invisible',
    }
  }

  const avgBeauty = Math.round(ribbons.reduce((s, r) => s + r.etherealBeauty, 0) / ribbons.length)
  const avgClarity = Math.round(ribbons.reduce((s, r) => s + r.polarClarity, 0) / ribbons.length)
  const avgFlow = Math.round(ribbons.reduce((s, r) => s + r.luminousFlow, 0) / ribbons.length)

  const etherealVeilCount = ribbons.filter((r) => r.condition === 'ethereal-veil').length
  const darkSkyCount = ribbons.filter((r) => r.condition === 'dark-sky').length
  const dancingLightsCount = ribbons.filter((r) => r.condition === 'dancing-lights').length
  const steadyGlowCount = ribbons.filter((r) => r.condition === 'steady-glow').length

  const avgQs = ribbons.reduce((s, r) => s + r.qualityScore, 0) / ribbons.length

  return {
    directory: dirPath,
    ribbons,
    avgBeauty,
    avgClarity,
    avgFlow,
    etherealVeilCount,
    darkSkyCount,
    dancingLightsCount,
    steadyGlowCount,
    displayType: classifyDisplayType(ribbons),
    condition: classifyDisplayCondition(avgQs),
  }
}

/** @example generateRecommendations(ribbons, displays, sky, stats) generates advice */
export function generateRecommendations(
  ribbons: AuroraRibbon[],
  displays: AuroraDisplay[],
  sky: AuroraSky,
  stats: AuroraVeilStats,
): string[] {
  const recs: string[] = []

  if (stats.avgEtherealBeauty < 50) {
    recs.push('Improve ethereal beauty with interfaces, generics, and expressive patterns')
  }
  if (stats.avgMagneticAlignment < 50) {
    recs.push('Strengthen magnetic alignment with const, strict equality, and consistent types')
  }
  if (stats.avgSpectralRichness < 50) {
    recs.push('Enhance spectral richness with enums, async patterns, and diverse code constructs')
  }
  if (stats.avgPolarClarity < 50) {
    recs.push('Sharpen polar clarity with return types, doc comments, and focused exports')
  }
  if (stats.avgAtmosphericDepth < 50) {
    recs.push('Deepen atmospheric depth with imports, documentation, and layered abstractions')
  }
  if (stats.avgLuminousFlow < 50) {
    recs.push('Improve luminous flow with readable patterns, optional chaining, and clear naming')
  }
  if (stats.darkSkyCount > 0) {
    recs.push(`${String(stats.darkSkyCount)} file(s) are in dark sky — consider significant improvement`)
  }
  if (sky.overallLuminosity < 40) {
    recs.push('Overall luminosity is low — prioritize code elegance and readability')
  }
  if (displays.length > 0 && displays.every((d) => d.displayType === 'clear-night' || d.displayType === 'cloud-cover')) {
    recs.push('All displays are dim — consider a major quality improvement effort')
  }

  const dark = ribbons.filter((r) => r.condition === 'dark-sky')
  if (dark.length > 0 && dark.length <= 3) {
    const names = dark.map((r) => r.file).join(', ')
    recs.push(`Illuminate these dark files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your code has an ethereal veil! Luminous quality is exceptional')
  }

  return Array.from(new Set(recs))
}

/** @example buildAuroraVeilResult(files, contents, options) orchestrates analysis */
export function buildAuroraVeilResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): AuroraVeilResult {
  const ribbons = files.map((file, i) => analyzeAuroraRibbon(contents[i] ?? '', file))

  const dispMap = new Map<string, AuroraRibbon[]>()
  for (const ribbon of ribbons) {
    const dir = ribbon.file.includes('/') ? ribbon.file.split('/').slice(0, -1).join('/') : '.'
    const existing = dispMap.get(dir)
    if (existing) {
      existing.push(ribbon)
    } else {
      dispMap.set(dir, [ribbon])
    }
  }

  const displays = Array.from(dispMap.entries()).map(([dir, dirRibbons]) =>
    analyzeAuroraDisplay(dirRibbons, dir),
  )

  const totalFiles = ribbons.length
  const avgEtherealBeauty = totalFiles > 0 ? Math.round(ribbons.reduce((s, r) => s + r.etherealBeauty, 0) / totalFiles) : 0
  const avgMagneticAlignment = totalFiles > 0 ? Math.round(ribbons.reduce((s, r) => s + r.magneticAlignment, 0) / totalFiles) : 0
  const avgSpectralRichness = totalFiles > 0 ? Math.round(ribbons.reduce((s, r) => s + r.spectralRichness, 0) / totalFiles) : 0
  const avgPolarClarity = totalFiles > 0 ? Math.round(ribbons.reduce((s, r) => s + r.polarClarity, 0) / totalFiles) : 0
  const avgAtmosphericDepth = totalFiles > 0 ? Math.round(ribbons.reduce((s, r) => s + r.atmosphericDepth, 0) / totalFiles) : 0
  const avgLuminousFlow = totalFiles > 0 ? Math.round(ribbons.reduce((s, r) => s + r.luminousFlow, 0) / totalFiles) : 0

  const overallLuminosity = totalFiles > 0
    ? Math.round((avgEtherealBeauty + avgPolarClarity + avgLuminousFlow) / 3)
    : 0

  const sky: AuroraSky = {
    avgBeauty: avgEtherealBeauty,
    avgClarity: avgPolarClarity,
    avgFlow: avgLuminousFlow,
    isEthereal: avgEtherealBeauty >= 60,
    overallLuminosity,
  }

  const etherealVeilCount = ribbons.filter((r) => r.condition === 'ethereal-veil').length
  const dancingLightsCount = ribbons.filter((r) => r.condition === 'dancing-lights').length
  const steadyGlowCount = ribbons.filter((r) => r.condition === 'steady-glow').length
  const fadingAuroraCount = ribbons.filter((r) => r.condition === 'fading-aurora').length
  const dimLightCount = ribbons.filter((r) => r.condition === 'dim-light').length
  const darkSkyCount = ribbons.filter((r) => r.condition === 'dark-sky').length

  const bestRibbon = totalFiles > 0
    ? ribbons.reduce((best, r) => (r.qualityScore > best.qualityScore ? r : best), ribbons[0]).file
    : ''
  const mostBeautiful = totalFiles > 0
    ? ribbons.reduce((best, r) => (r.etherealBeauty > best.etherealBeauty ? r : best), ribbons[0]).file
    : ''
  const bestAligned = totalFiles > 0
    ? ribbons.reduce((best, r) => (r.magneticAlignment > best.magneticAlignment ? r : best), ribbons[0]).file
    : ''
  const mostDiverse = totalFiles > 0
    ? ribbons.reduce((best, r) => (r.spectralRichness > best.spectralRichness ? r : best), ribbons[0]).file
    : ''
  const mostFocused = totalFiles > 0
    ? ribbons.reduce((best, r) => (r.polarClarity > best.polarClarity ? r : best), ribbons[0]).file
    : ''
  const deepest = totalFiles > 0
    ? ribbons.reduce((best, r) => (r.atmosphericDepth > best.atmosphericDepth ? r : best), ribbons[0]).file
    : ''

  const stats: AuroraVeilStats = {
    totalFiles,
    totalDisplays: displays.length,
    avgEtherealBeauty,
    avgMagneticAlignment,
    avgSpectralRichness,
    avgPolarClarity,
    avgAtmosphericDepth,
    avgLuminousFlow,
    etherealVeilCount,
    dancingLightsCount,
    steadyGlowCount,
    fadingAuroraCount,
    dimLightCount,
    darkSkyCount,
    hasHighEleganceCount: ribbons.filter((r) => r.ethereal.hasHighElegance).length,
    hasHighAlignmentCount: ribbons.filter((r) => r.magnetic.hasHighAlignment).length,
    hasHighRichnessCount: ribbons.filter((r) => r.spectral.hasHighRichness).length,
    hasHighClarityCount: ribbons.filter((r) => r.polar.hasHighClarity).length,
    hasHighDepthCount: ribbons.filter((r) => r.atmospheric.hasHighDepth).length,
    hasHighFlowCount: ribbons.filter((r) => r.luminous.hasHighFlow).length,
    overallLuminosity,
    astronomerGrade: classifyAstronomerGrade(overallLuminosity),
    bestRibbon,
    mostBeautiful,
    bestAligned,
    mostDiverse,
    mostFocused,
    deepest,
  }

  const recommendations = generateRecommendations(ribbons, displays, sky, stats)

  return { ribbons, displays, sky, stats, recommendations }
}
