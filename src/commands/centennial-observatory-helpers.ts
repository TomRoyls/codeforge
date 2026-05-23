// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface TelescopeMeasure {
  resolution: number
  power: 'jwst-grade' | 'hubble-class' | 'great-refractor' | 'standard-scope' | 'binoculars' | 'naked-eye'
  hasHighResolution: boolean
  hasSharpFocus: boolean
  hasNoChromaticAberration: boolean
  hasProperMagnification: boolean
  hasNoDistortion: boolean
  hasDeepField: boolean
  hasNoBlindSpots: boolean
  hasWideField: boolean
  hasNoVignetting: boolean
  hasAdaptiveOptics: boolean
  aberrationCount: number
  blindSpotCount: number
}

export interface StellarMeasure {
  catalog: number
  completeness: 'messier-catalog' | 'ngc-complete' | 'bright-stars' | 'partial-catalog' | 'few-stars' | 'empty-sky'
  hasHighCatalog: boolean
  hasProperClassification: boolean
  hasAccurateMetadata: boolean
  hasNoMissingEntries: boolean
  hasCrossReferenced: boolean
  hasNoContradictions: boolean
  hasHistoricalRecords: boolean
  hasNoStaleData: boolean
  hasObservationNotes: boolean
  hasNoPhantomEntries: boolean
  missingCount: number
  phantomCount: number
}

export interface SkyMeasure {
  mapping: number
  accuracy: 'planetarium-grade' | 'star-atlas' | 'celestial-chart' | 'rough-map' | 'sketch' | 'blank'
  hasHighMapping: boolean
  hasProperCoordinates: boolean
  hasNoMisplacement: boolean
  hasLogicalGrouping: boolean
  hasNoOrphans: boolean
  hasConstellationPatterns: boolean
  hasNoScattered: boolean
  hasProperHierarchy: boolean
  hasClearBoundaries: boolean
  hasNoOverlapping: boolean
  misplacementCount: number
  orphanCount: number
}

export interface CosmicMeasure {
  discovery: number
  significance: 'nobel-prize' | 'major-discovery' | 'notable-finding' | 'incremental' | 'routine' | 'none'
  hasHighDiscovery: boolean
  hasNovelPatterns: boolean
  hasNoStagnation: boolean
  hasBreakthrough: boolean
  hasNoCopyPaste: boolean
  hasElegant: boolean
  hasNoCargoCult: boolean
  hasInnovative: boolean
  hasNoAntipattern: boolean
  hasForwardThinking: boolean
  stagnationCount: number
  antipatternCount: number
}

export interface FoundationMeasure {
  quality: number
  construction: 'mountaintop-observatory' | 'space-telescope' | 'professional-grade' | 'amateur-setup' | 'backyard-scope' | 'cardboard-tube'
  hasHighQuality: boolean
  hasSolidMount: boolean
  hasProperDome: boolean
  hasNoVibration: boolean
  hasClimateControl: boolean
  hasNoDegradation: boolean
  hasProperOptics: boolean
  hasNoMisalignment: boolean
  hasReliableTracking: boolean
  hasNoDrift: boolean
  vibrationCount: number
  misalignmentCount: number
}

export interface LegacyMeasure {
  quality: number
  impact: 'cosmic-legacy' | 'stellar-legacy' | 'planetary-legacy' | 'local-legacy' | 'ephemeral' | 'void'
  hasHighQuality: boolean
  hasEnduring: boolean
  hasNoObsolescence: boolean
  hasFoundational: boolean
  hasNoFragility: boolean
  hasTimeless: boolean
  hasNoTechnicalDebt: boolean
  hasExemplary: boolean
  hasNoRegression: boolean
  hasCelebration: boolean
  obsolescenceCount: number
  regressionCount: number
}

export interface CelestialObservation {
  file: string
  telescopeResolution: number
  stellarCatalog: number
  skyMapping: number
  cosmicDiscovery: number
  observatoryFoundation: number
  astronomicalLegacy: number
  telescope: TelescopeMeasure
  stellar: StellarMeasure
  sky: SkyMeasure
  cosmic: CosmicMeasure
  foundation: FoundationMeasure
  legacy: LegacyMeasure
  condition: 'centennial-masterpiece' | 'landmark-observatory' | 'professional-instrument' | 'amateur-telescope' | 'broken-lens' | 'darkness'
  qualityScore: number
}

export interface ObservatoryDome {
  directory: string
  observations: CelestialObservation[]
  avgResolution: number
  avgMapping: number
  avgLegacy: number
  masterpieceCount: number
  darknessCount: number
  highResCount: number
  completeCatalogCount: number
  domeType: 'centennial-observatory' | 'major-observatory' | 'university-scope' | 'amateur-observatory' | 'backyard-scope' | 'empty-lot'
  condition: 'world-class-observatory' | 'professional-facility' | 'working-observatory' | 'amateur-setup' | 'abandoned' | 'dark-site'
}

export interface CentennialObservatoryResult {
  observations: CelestialObservation[]
  domes: ObservatoryDome[]
  cosmos: {
    avgResolution: number
    avgMapping: number
    avgLegacy: number
    isWorldClass: boolean
    overallCosmic: number
  }
  stats: {
    totalFiles: number
    totalDomes: number
    avgTelescopeResolution: number
    avgStellarCatalog: number
    avgSkyMapping: number
    avgCosmicDiscovery: number
    avgObservatoryFoundation: number
    avgAstronomicalLegacy: number
    centennialMasterpieceCount: number
    landmarkObservatoryCount: number
    professionalInstrumentCount: number
    amateurTelescopeCount: number
    brokenLensCount: number
    darknessCount: number
    hasHighResolutionCount: number
    hasHighCatalogCount: number
    hasHighMappingCount: number
    hasHighDiscoveryCount: number
    hasHighQualityCount: number
    hasHighLegacyCount: number
    overallCosmic: number
    astronomerGrade: 'laureate-astronomer' | 'chief-astronomer' | 'observatory-director' | 'astronomer' | 'stargazer' | 'grounded'
    bestObservation: string
    sharpest: string
    bestDocumented: string
    bestOrganized: string
    mostInnovative: string
    bestFoundation: string
    celebration: string
  }
  recommendations: string[]
}

// ─── measureTelescope ──────────────────────────────────────────────────────

/** @example measureTelescope(content) returns TelescopeMeasure */
export function measureTelescope(content: string): TelescopeMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasClasses = /\bclass\s+\w+/.test(content)
  const hasFunctions = /\bfunction\s+\w+/.test(content) || /\b\w+\s*\([^)]*\)\s*(?::\s|{)/.test(content)
  const hasArrowFns = /=>\s*[{(]/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasGenerics = /<\w+>/.test(content) || /<\w+\s*,/.test(content)
  const hasEnums = /\benum\s+\w+/.test(content)
  const hasGenerators = /\byield\b/.test(content) || /\*\s*\w+\s*\(/.test(content)
  const hasConditionalTypes = /\bextends\s+\w+\s*\?/.test(content)
  const hasDecorators = /@\w+/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content) && /\bcatch\b/.test(content)
  const hasErrorTypes = /\bError\b/.test(content) || /\bthrow\b/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasOptionalChaining = /\?\.\[/.test(content) || /\?\.\w/.test(content)
  const hasConstAssertions = /\bas\s+const\b/.test(content)
  const hasSatisfies = /\bsatisfies\b/.test(content)
  const hasAssertions = /\basserts\b/.test(content)
  const hasOverloads = /function\s+\w+[^}]*;\s*\n\s*function\s+\w+/.test(content)

  const aberrationCount =
    (/\beval\s*\(/.test(content) ? 1 : 0) +
    (/\bany\b/.test(content) ? 1 : 0)
  const blindSpotCount =
    (/\bconsole\.log\s*\(/.test(content) ? 1 : 0) +
    (/\bdebugger\b/.test(content) ? 1 : 0)

  let score = 0
  if (hasContent) score += 30
  if (hasTypes) score += 8
  if (hasInterfaces) score += 8
  if (hasClasses) score += 7
  if (hasFunctions) score += 5
  if (hasArrowFns) score += 3
  if (hasAsync && hasAwait) score += 6
  if (hasGenerics) score += 6
  if (hasEnums) score += 3
  if (hasGenerators) score += 3
  if (hasConditionalTypes) score += 4
  if (hasDecorators) score += 3
  if (hasTryCatch) score += 5
  if (hasErrorTypes) score += 3
  if (hasNullishCoalescing) score += 2
  if (hasOptionalChaining) score += 2
  if (hasConstAssertions) score += 2
  if (hasSatisfies) score += 2
  if (hasAssertions) score += 2
  if (hasOverloads) score += 2

  score -= aberrationCount * 3
  score -= blindSpotCount * 2

  const resolution = Math.max(0, Math.min(100, Math.round(score)))

  const hasHighResolution = resolution >= 80
  const hasSharpFocus = hasTypes || hasInterfaces
  const hasNoChromaticAberration = aberrationCount === 0
  const hasProperMagnification = hasFunctions || hasArrowFns
  const hasNoDistortion = !/\bany\b/.test(content)
  const hasDeepField = hasAsync && hasAwait && hasTryCatch
  const hasNoBlindSpots = blindSpotCount === 0
  const hasWideField = (hasTypes ? 1 : 0) + (hasInterfaces ? 1 : 0) + (hasClasses ? 1 : 0) + (hasEnums ? 1 : 0) >= 3
  const hasNoVignetting = hasNullishCoalescing || hasOptionalChaining || hasTryCatch
  const hasAdaptiveOptics = hasTryCatch && hasErrorTypes

  let power: TelescopeMeasure['power'] = 'naked-eye'
  if (resolution >= 90) power = 'jwst-grade'
  else if (resolution >= 75) power = 'hubble-class'
  else if (resolution >= 60) power = 'great-refractor'
  else if (resolution >= 45) power = 'standard-scope'
  else if (resolution >= 30) power = 'binoculars'

  return {
    resolution,
    power,
    hasHighResolution,
    hasSharpFocus,
    hasNoChromaticAberration,
    hasProperMagnification,
    hasNoDistortion,
    hasDeepField,
    hasNoBlindSpots,
    hasWideField,
    hasNoVignetting,
    hasAdaptiveOptics,
    aberrationCount,
    blindSpotCount,
  }
}

// ─── measureStellar ─────────────────────────────────────────────────────────

/** @example measureStellar(content) returns StellarMeasure */
export function measureStellar(content: string): StellarMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasJsDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInlineComments = /\/\/.*$/.test(content)
  const hasDocAnnotations = /@(param|returns|example|description|remarks|since|deprecated|see)/.test(content)
  const hasTypeAnnotations = /:\s*(string|number|boolean|void|never|unknown|any)\b/.test(content)
  const hasReturnTypes = /\)\s*:\s*\w/.test(content)
  const hasExportDocs = /\/\*\*[\s\S]*?\*\/\s*\n\s*export/.test(content)
  const hasModuleDocs = /\/\*\*[\s\S]*?@module/.test(content)
  const hasTodoComments = /\/\/\s*(TODO|FIXME|HACK|XXX)/.test(content)
  const hasFunctionDocs = /\/\*\*[\s\S]*?\*\/\s*\n\s*(export\s+)?function/.test(content)
  const hasClassDocs = /\/\*\*[\s\S]*?\*\/\s*\n\s*(export\s+)?(abstract\s+)?class/.test(content)
  const hasPropertyDocs = /\/\*\*[\s\S]*?\*\/\s*\n\s*(public|private|protected|readonly)\s/.test(content)

  const missingCount = hasContent ? (hasJsDoc ? 0 : 1) + (hasInlineComments ? 0 : 1) : 0
  const phantomCount = (/\bTODO\b/.test(content) && !/\/\/.*TODO/.test(content) ? 1 : 0)

  let score = 0
  if (hasContent) score += 30
  if (hasJsDoc) score += 12
  if (hasInlineComments) score += 5
  if (hasDocAnnotations) score += 10
  if (hasTypeAnnotations) score += 8
  if (hasReturnTypes) score += 8
  if (hasExportDocs) score += 8
  if (hasModuleDocs) score += 5
  if (hasFunctionDocs) score += 5
  if (hasClassDocs) score += 5
  if (hasPropertyDocs) score += 4
  score -= missingCount * 3
  score -= phantomCount * 2

  const catalog = Math.max(0, Math.min(100, Math.round(score)))

  const hasHighCatalog = catalog >= 80
  const hasProperClassification = hasJsDoc || hasTypeAnnotations
  const hasAccurateMetadata = hasDocAnnotations
  const hasNoMissingEntries = missingCount === 0
  const hasCrossReferenced = hasExportDocs || hasModuleDocs
  const hasNoContradictions = !hasTodoComments
  const hasHistoricalRecords = hasInlineComments
  const hasNoStaleData = !/\/\/\s*FIXME/.test(content)
  const hasObservationNotes = hasJsDoc || hasInlineComments
  const hasNoPhantomEntries = phantomCount === 0

  let completeness: StellarMeasure['completeness'] = 'empty-sky'
  if (catalog >= 90) completeness = 'messier-catalog'
  else if (catalog >= 75) completeness = 'ngc-complete'
  else if (catalog >= 60) completeness = 'bright-stars'
  else if (catalog >= 45) completeness = 'partial-catalog'
  else if (catalog >= 30) completeness = 'few-stars'

  return {
    catalog,
    completeness,
    hasHighCatalog,
    hasProperClassification,
    hasAccurateMetadata,
    hasNoMissingEntries,
    hasCrossReferenced,
    hasNoContradictions,
    hasHistoricalRecords,
    hasNoStaleData,
    hasObservationNotes,
    hasNoPhantomEntries,
    missingCount,
    phantomCount,
  }
}

// ─── measureSky ─────────────────────────────────────────────────────────────

/** @example measureSky(content) returns SkyMeasure */
export function measureSky(content: string): SkyMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasExports = /\bexport\b/.test(content)
  const hasNamedExports = /export\s+(const|let|function|class|interface|type|enum)\s+\w+/.test(content)
  const hasDefaultExport = /export\s+default\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasNamedImports = /import\s*\{/.test(content) || /import\s+\w+\s*,/.test(content)
  const hasReExports = /export\s*\{/.test(content) || /export\s+\*\s+from/.test(content)
  const hasNamespace = /import\s*\*\s*as/.test(content) || /namespace\s+\w+/.test(content)
  const hasModules = hasImports || hasExports
  const hasNestedBlocks = (content.match(/\{/g) || []).length >= 3
  const hasProperIndentation = nonEmpty.length > 0 ? nonEmpty.every((l) => l === l.trimStart() || l.startsWith(' ') || l.startsWith('\t')) : true
  const hasConsistentStyle = !(/\t/.test(content) && / {2}/.test(content))

  const misplacementCount = hasContent ? (hasNamedExports ? 0 : 1) + (hasConsistentStyle ? 0 : 1) : 0
  const orphanCount = hasContent ? (hasModules ? 0 : 1) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasExports) score += 10
  if (hasNamedExports) score += 10
  if (hasDefaultExport) score += 3
  if (hasImports) score += 8
  if (hasNamedImports) score += 6
  if (hasReExports) score += 5
  if (hasNamespace) score += 4
  if (hasNestedBlocks) score += 5
  if (hasProperIndentation) score += 5
  if (hasConsistentStyle) score += 4
  score -= misplacementCount * 3
  score -= orphanCount * 4

  const mapping = Math.max(0, Math.min(100, Math.round(score)))

  const hasHighMapping = mapping >= 80
  const hasProperCoordinates = hasNamedExports && hasImports
  const hasNoMisplacement = misplacementCount === 0
  const hasLogicalGrouping = hasModules
  const hasNoOrphans = orphanCount === 0
  const hasConstellationPatterns = hasNestedBlocks && hasModules
  const hasNoScattered = hasConsistentStyle
  const hasProperHierarchy = hasNestedBlocks
  const hasClearBoundaries = hasExports
  const hasNoOverlapping = hasNamedExports || hasDefaultExport

  let accuracy: SkyMeasure['accuracy'] = 'blank'
  if (mapping >= 90) accuracy = 'planetarium-grade'
  else if (mapping >= 75) accuracy = 'star-atlas'
  else if (mapping >= 60) accuracy = 'celestial-chart'
  else if (mapping >= 45) accuracy = 'rough-map'
  else if (mapping >= 30) accuracy = 'sketch'

  return {
    mapping,
    accuracy,
    hasHighMapping,
    hasProperCoordinates,
    hasNoMisplacement,
    hasLogicalGrouping,
    hasNoOrphans,
    hasConstellationPatterns,
    hasNoScattered,
    hasProperHierarchy,
    hasClearBoundaries,
    hasNoOverlapping,
    misplacementCount,
    orphanCount,
  }
}

// ─── measureCosmic ──────────────────────────────────────────────────────────

/** @example measureCosmic(content) returns CosmicMeasure */
export function measureCosmic(content: string): CosmicMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasAsyncIter = /\bfor\s+await\b/.test(content) || /\bAsyncIterable\b/.test(content)
  const hasSymbols = /\bSymbol\.\w+/.test(content)
  const hasProxies = /\bProxy\b/.test(content)
  const hasWeakRefs = /\bWeakRef\b/.test(content) || /\bFinalizationRegistry\b/.test(content)
  const hasTemplateLiteralTypes = /`[^`]*\$\{/.test(content) && /\btype\s+\w/.test(content)
  const hasMappedTypes = /\[\w+\s+in\s+/.test(content)
  const hasConditionalTypes = /\b\w+\s+extends\s+\w+\s*\?/.test(content)
  const hasInfer = /\binfer\b/.test(content)
  const hasDecoratorFactories = /@\w+\(/.test(content)
  const hasIterators = /\bSymbol\.iterator\b/.test(content) || /\byield\b/.test(content)
  const hasObserverPattern = /subscribe|Observer|Observable/.test(content)
  const hasBuilderPattern = /Builder|builder|\.build\s*\(/.test(content)
  const hasPipelinePattern = /\.pipe\s*\(/.test(content) || /pipeline/.test(content)

  const hasDuplicates = hasContent ? (() => {
    const stringLines = nonEmpty.map((l) => l.trim()).filter((l) => l.length > 10)
    return stringLines.length !== Array.from(new Set(stringLines)).length
  })() : false

  const stagnationCount = (hasDuplicates ? 1 : 0) + (hasContent && nonEmpty.length < 3 ? 1 : 0)
  const antipatternCount =
    (/\beval\s*\(/.test(content) ? 1 : 0) +
    (/\bany\b/.test(content) ? 1 : 0) +
    (/\bconsole\.log\s*\(/.test(content) ? 1 : 0)

  let score = 0
  if (hasContent) score += 25
  if (hasAsyncIter) score += 8
  if (hasSymbols) score += 5
  if (hasProxies) score += 5
  if (hasWeakRefs) score += 4
  if (hasTemplateLiteralTypes) score += 7
  if (hasMappedTypes) score += 7
  if (hasConditionalTypes) score += 6
  if (hasInfer) score += 6
  if (hasDecoratorFactories) score += 5
  if (hasIterators) score += 5
  if (hasObserverPattern) score += 4
  if (hasBuilderPattern) score += 4
  if (hasPipelinePattern) score += 4
  score -= stagnationCount * 3
  score -= antipatternCount * 3

  const discovery = Math.max(0, Math.min(100, Math.round(score)))

  const hasHighDiscovery = discovery >= 80
  const hasNovelPatterns = hasAsyncIter || hasSymbols || hasProxies || hasWeakRefs
  const hasNoStagnation = stagnationCount === 0
  const hasBreakthrough = hasTemplateLiteralTypes || hasMappedTypes || hasConditionalTypes
  const hasNoCopyPaste = !hasDuplicates
  const hasElegant = hasInfer || hasConditionalTypes || hasMappedTypes
  const hasNoCargoCult = antipatternCount === 0
  const hasInnovative = hasDecoratorFactories || hasIterators || hasObserverPattern
  const hasNoAntipattern = antipatternCount === 0
  const hasForwardThinking = hasBuilderPattern || hasPipelinePattern || hasObserverPattern

  let significance: CosmicMeasure['significance'] = 'none'
  if (discovery >= 90) significance = 'nobel-prize'
  else if (discovery >= 75) significance = 'major-discovery'
  else if (discovery >= 60) significance = 'notable-finding'
  else if (discovery >= 45) significance = 'incremental'
  else if (discovery >= 30) significance = 'routine'

  return {
    discovery,
    significance,
    hasHighDiscovery,
    hasNovelPatterns,
    hasNoStagnation,
    hasBreakthrough,
    hasNoCopyPaste,
    hasElegant,
    hasNoCargoCult,
    hasInnovative,
    hasNoAntipattern,
    hasForwardThinking,
    stagnationCount,
    antipatternCount,
  }
}

// ─── measureFoundation ──────────────────────────────────────────────────────

/** @example measureFoundation(content) returns FoundationMeasure */
export function measureFoundation(content: string): FoundationMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasPrivateMembers = /\bprivate\b/.test(content) || /\bprotected\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasAbstract = /\babstract\b/.test(content)
  const hasAccessors = /\bget\s+\w+|set\s+\w+/.test(content)
  const hasStaticMembers = /\bstatic\b/.test(content)
  const hasImplements = /\bimplements\b/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content) && /\bcatch\b/.test(content)
  const hasConfigPatterns = /\bconfig\b|\benv\b|\bConfig\b/.test(content)
  const hasDependencyInjection = /\binject\b|\bInjectable\b|\binjectable\b/.test(content)
  const hasTypeGuards = /\bis\w+\(|\basserts\b/.test(content)
  const hasImmutability = /\bconst\b/.test(content) && !/\blet\b/.test(content) && !/\bvar\b/.test(content)
  const hasStrictNullChecks = /\bnull\s*!\s*\.|\?\.\w|undefined\s*\?/.test(content)

  const vibrationCount = hasContent ? (hasImmutability ? 0 : 1) + (hasStrictNullChecks ? 0 : 1) : 0
  const misalignmentCount = hasContent ? (hasErrorHandling ? 0 : 1) + (hasPrivateMembers || hasInterfaces ? 0 : 1) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasPrivateMembers) score += 8
  if (hasReadonly) score += 5
  if (hasInterfaces) score += 8
  if (hasAbstract) score += 5
  if (hasAccessors) score += 4
  if (hasStaticMembers) score += 3
  if (hasImplements) score += 5
  if (hasErrorHandling) score += 8
  if (hasConfigPatterns) score += 5
  if (hasDependencyInjection) score += 5
  if (hasTypeGuards) score += 5
  if (hasImmutability) score += 5
  if (hasStrictNullChecks) score += 4
  score -= vibrationCount * 3
  score -= misalignmentCount * 3

  const quality = Math.max(0, Math.min(100, Math.round(score)))

  const hasHighQuality = quality >= 80
  const hasSolidMount = hasErrorHandling
  const hasProperDome = hasPrivateMembers || hasInterfaces
  const hasNoVibration = vibrationCount === 0
  const hasClimateControl = hasConfigPatterns
  const hasNoDegradation = hasReadonly || hasImmutability
  const hasProperOptics = hasInterfaces
  const hasNoMisalignment = misalignmentCount === 0
  const hasReliableTracking = hasTypeGuards || hasDependencyInjection
  const hasNoDrift = hasImmutability

  let construction: FoundationMeasure['construction'] = 'cardboard-tube'
  if (quality >= 90) construction = 'mountaintop-observatory'
  else if (quality >= 75) construction = 'space-telescope'
  else if (quality >= 60) construction = 'professional-grade'
  else if (quality >= 45) construction = 'amateur-setup'
  else if (quality >= 30) construction = 'backyard-scope'

  return {
    quality,
    construction,
    hasHighQuality,
    hasSolidMount,
    hasProperDome,
    hasNoVibration,
    hasClimateControl,
    hasNoDegradation,
    hasProperOptics,
    hasNoMisalignment,
    hasReliableTracking,
    hasNoDrift,
    vibrationCount,
    misalignmentCount,
  }
}

// ─── measureLegacy ───────────────────────────────────────────────────────────

/** @example measureLegacy(content) returns LegacyMeasure */
export function measureLegacy(content: string): LegacyMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasExports = /\bexport\b/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasClasses = /\bclass\s+\w+/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasDocs = /\/\*\*/.test(content)
  const hasTests = /\bdescribe\b|\bit\b|\bexpect\b/.test(content)
  const hasPatterns = hasInterfaces && hasClasses
  const hasVersioning = /\bversion\b|\bVersion\b|\bsemver\b/.test(content)
  const hasChangelog = /\/\*\*[\s\S]*?@since/.test(content) || /\bCHANGELOG\b/i.test(content)

  const obsolescenceCount = hasContent ? (hasAsync ? 0 : 1) + (hasExports ? 0 : 1) : 0
  const regressionCount = hasContent ? (hasTests ? 0 : 1) + (hasDocs ? 0 : 1) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasExports) score += 10
  if (hasInterfaces) score += 8
  if (hasTypes) score += 5
  if (hasClasses) score += 5
  if (hasAsync) score += 8
  if (hasDocs) score += 10
  if (hasTests) score += 8
  if (hasPatterns) score += 8
  if (hasVersioning) score += 5
  if (hasChangelog) score += 5
  score -= obsolescenceCount * 3
  score -= regressionCount * 2

  const legacyQuality = Math.max(0, Math.min(100, Math.round(score)))

  const hasHighQuality = legacyQuality >= 80
  const hasEnduring = hasExports && hasInterfaces
  const hasNoObsolescence = obsolescenceCount === 0
  const hasFoundational = hasInterfaces || hasTypes || hasClasses
  const hasNoFragility = hasAsync || hasErrorHandling(content)
  const hasTimeless = hasPatterns && hasDocs
  const hasNoTechnicalDebt = !/\bTODO\b/.test(content) && !/\bFIXME\b/.test(content)
  const hasExemplary = hasExports && hasInterfaces && hasDocs && hasAsync
  const hasNoRegression = regressionCount === 0
  const hasCelebration = legacyQuality >= 90

  let impact: LegacyMeasure['impact'] = 'void'
  if (legacyQuality >= 90) impact = 'cosmic-legacy'
  else if (legacyQuality >= 75) impact = 'stellar-legacy'
  else if (legacyQuality >= 60) impact = 'planetary-legacy'
  else if (legacyQuality >= 45) impact = 'local-legacy'
  else if (legacyQuality >= 30) impact = 'ephemeral'

  return {
    quality: legacyQuality,
    impact,
    hasHighQuality,
    hasEnduring,
    hasNoObsolescence,
    hasFoundational,
    hasNoFragility,
    hasTimeless,
    hasNoTechnicalDebt,
    hasExemplary,
    hasNoRegression,
    hasCelebration,
    obsolescenceCount,
    regressionCount,
  }
}

function hasErrorHandling(content: string): boolean {
  return /\btry\s*\{/.test(content) && /\bcatch\b/.test(content)
}

// ─── analyzeCelestialObservation ────────────────────────────────────────────

/** @example analyzeCelestialObservation(content, filePath) returns CelestialObservation */
export function analyzeCelestialObservation(content: string, filePath: string): CelestialObservation {
  const telescope = measureTelescope(content)
  const stellar = measureStellar(content)
  const sky = measureSky(content)
  const cosmic = measureCosmic(content)
  const foundation = measureFoundation(content)
  const legacy = measureLegacy(content)

  const telescopeResolution = telescope.resolution
  const stellarCatalog = stellar.catalog
  const skyMapping = sky.mapping
  const cosmicDiscovery = cosmic.discovery
  const observatoryFoundation = foundation.quality
  const astronomicalLegacy = legacy.quality

  const qualityScore = Math.round(
    telescopeResolution * 0.2 +
    stellarCatalog * 0.15 +
    skyMapping * 0.15 +
    cosmicDiscovery * 0.15 +
    observatoryFoundation * 0.15 +
    astronomicalLegacy * 0.2,
  )

  const condition = classifyObservationCondition(qualityScore)

  return {
    file: filePath,
    telescopeResolution,
    stellarCatalog,
    skyMapping,
    cosmicDiscovery,
    observatoryFoundation,
    astronomicalLegacy,
    telescope,
    stellar,
    sky,
    cosmic,
    foundation,
    legacy,
    condition,
    qualityScore,
  }
}

// ─── classifyObservationCondition ────────────────────────────────────────────

/** @example classifyObservationCondition(observation) returns condition string */
export function classifyObservationCondition(observation: CelestialObservation): CelestialObservation['condition'] {
  const qs = observation.qualityScore
  if (qs >= 90) return 'centennial-masterpiece'
  if (qs >= 75) return 'landmark-observatory'
  if (qs >= 60) return 'professional-instrument'
  if (qs >= 45) return 'amateur-telescope'
  if (qs >= 30) return 'broken-lens'
  return 'darkness'
}

// ─── classifyDomeType ───────────────────────────────────────────────────────

/** @example classifyDomeType(observations) returns dome type string */
export function classifyDomeType(observations: CelestialObservation[]): ObservatoryDome['domeType'] {
  if (observations.length === 0) return 'empty-lot'
  const avg = observations.reduce((s, o) => s + o.qualityScore, 0) / observations.length
  const masterpieces = observations.filter((o) => o.condition === 'centennial-masterpiece').length
  const ratio = masterpieces / observations.length

  if (avg >= 80 && ratio >= 0.5) return 'centennial-observatory'
  if (avg >= 70) return 'major-observatory'
  if (avg >= 55) return 'university-scope'
  if (avg >= 40) return 'amateur-observatory'
  if (avg >= 25) return 'backyard-scope'
  return 'empty-lot'
}

// ─── analyzeObservatoryDome ─────────────────────────────────────────────────

/** @example analyzeObservatoryDome(observations, dirPath) returns ObservatoryDome */
export function analyzeObservatoryDome(observations: CelestialObservation[], dirPath: string): ObservatoryDome {
  if (observations.length === 0) {
    return {
      directory: dirPath,
      observations,
      avgResolution: 0,
      avgMapping: 0,
      avgLegacy: 0,
      masterpieceCount: 0,
      darknessCount: 0,
      highResCount: 0,
      completeCatalogCount: 0,
      domeType: 'empty-lot',
      condition: 'dark-site',
    }
  }

  const avgResolution = Math.round(observations.reduce((s, o) => s + o.telescopeResolution, 0) / observations.length)
  const avgMapping = Math.round(observations.reduce((s, o) => s + o.skyMapping, 0) / observations.length)
  const avgLegacy = Math.round(observations.reduce((s, o) => s + o.astronomicalLegacy, 0) / observations.length)

  const masterpieceCount = observations.filter((o) => o.condition === 'centennial-masterpiece').length
  const darknessCount = observations.filter((o) => o.condition === 'darkness').length
  const highResCount = observations.filter((o) => o.telescope.hasHighResolution).length
  const completeCatalogCount = observations.filter((o) => o.stellar.hasHighCatalog).length

  const domeType = classifyDomeType(observations)

  const overallAvg = Math.round(observations.reduce((s, o) => s + o.qualityScore, 0) / observations.length)
  let condition: ObservatoryDome['condition'] = 'dark-site'
  if (overallAvg >= 80) condition = 'world-class-observatory'
  else if (overallAvg >= 65) condition = 'professional-facility'
  else if (overallAvg >= 50) condition = 'working-observatory'
  else if (overallAvg >= 35) condition = 'amateur-setup'
  else if (overallAvg >= 20) condition = 'abandoned'

  return {
    directory: dirPath,
    observations,
    avgResolution,
    avgMapping,
    avgLegacy,
    masterpieceCount,
    darknessCount,
    highResCount,
    completeCatalogCount,
    domeType,
    condition,
  }
}

// ─── classifyAstronomerGrade ────────────────────────────────────────────────

/** @example classifyAstronomerGrade(85) returns 'laureate-astronomer' */
export function classifyAstronomerGrade(avgCosmic: number): CentennialObservatoryResult['stats']['astronomerGrade'] {
  if (avgCosmic >= 80) return 'laureate-astronomer'
  if (avgCosmic >= 65) return 'chief-astronomer'
  if (avgCosmic >= 50) return 'observatory-director'
  if (avgCosmic >= 35) return 'astronomer'
  if (avgCosmic >= 20) return 'stargazer'
  return 'grounded'
}

// ─── generateRecommendations ────────────────────────────────────────────────

/** @example generateRecommendations(observations, domes, cosmos, stats) returns string[] */
export function generateRecommendations(
  observations: CelestialObservation[],
  domes: ObservatoryDome[],
  cosmos: CentennialObservatoryResult['cosmos'],
  stats: CentennialObservatoryResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgTelescopeResolution < 50) recs.push('Upgrade telescope optics — improve code detail and type precision')
  if (stats.avgStellarCatalog < 50) recs.push('Expand stellar catalog — improve code documentation coverage')
  if (stats.avgSkyMapping < 50) recs.push('Improve sky mapping — enhance code organization and structure')
  if (stats.avgCosmicDiscovery < 50) recs.push('Pursue cosmic discovery — introduce more innovative code patterns')
  if (stats.avgObservatoryFoundation < 50) recs.push('Strengthen observatory foundation — improve code infrastructure quality')
  if (stats.avgAstronomicalLegacy < 50) recs.push('Build astronomical legacy — improve code maintainability and documentation')
  if (stats.darknessCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of files are in darkness — consider major codebase illumination')
  if (stats.brokenLensCount > 0) recs.push('Warning: broken-lens files detected — these need immediate repair')
  if (cosmos.overallCosmic < 40) recs.push('Overall cosmic quality is critically low — establish a comprehensive observatory regimen')
  if (domes.length > 0 && domes.every((d) => d.condition === 'dark-site')) recs.push('All domes are dark — your codebase needs fundamental illumination')

  if (observations.length > 0) {
    const highStagnation = observations.filter((o) => o.cosmic.stagnationCount > 2)
    if (highStagnation.length > observations.length * 0.5) recs.push('Over 50% of files show stagnation — reduce code duplication and increase innovation')
  }

  return recs
}

// ─── buildCentennialObservatoryResult ───────────────────────────────────────

/** @example buildCentennialObservatoryResult(files, contents, options) returns full result */
export function buildCentennialObservatoryResult(files: string[], contents: string[], _options?: Record<string, unknown>): CentennialObservatoryResult {
  const observations = files.map((file, i) => analyzeCelestialObservation(contents[i] ?? '', file))

  const domeMap = new Map<string, CelestialObservation[]>()
  observations.forEach((obs) => {
    const parts = obs.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = domeMap.get(dir)
    if (existing) existing.push(obs)
    else domeMap.set(dir, [obs])
  })

  const domes = Array.from(domeMap.entries()).map(([dir, obs]) => analyzeObservatoryDome(obs, dir))

  const avgTelescopeResolution = observations.length > 0 ? Math.round(observations.reduce((s, o) => s + o.telescopeResolution, 0) / observations.length) : 0
  const avgStellarCatalog = observations.length > 0 ? Math.round(observations.reduce((s, o) => s + o.stellarCatalog, 0) / observations.length) : 0
  const avgSkyMapping = observations.length > 0 ? Math.round(observations.reduce((s, o) => s + o.skyMapping, 0) / observations.length) : 0
  const avgCosmicDiscovery = observations.length > 0 ? Math.round(observations.reduce((s, o) => s + o.cosmicDiscovery, 0) / observations.length) : 0
  const avgObservatoryFoundation = observations.length > 0 ? Math.round(observations.reduce((s, o) => s + o.observatoryFoundation, 0) / observations.length) : 0
  const avgAstronomicalLegacy = observations.length > 0 ? Math.round(observations.reduce((s, o) => s + o.astronomicalLegacy, 0) / observations.length) : 0

  const overallCosmic = Math.round(
    avgTelescopeResolution * 0.2 +
    avgStellarCatalog * 0.15 +
    avgSkyMapping * 0.15 +
    avgCosmicDiscovery * 0.15 +
    avgObservatoryFoundation * 0.15 +
    avgAstronomicalLegacy * 0.2,
  )

  const cosmos = {
    avgResolution: avgTelescopeResolution,
    avgMapping: avgSkyMapping,
    avgLegacy: avgAstronomicalLegacy,
    isWorldClass: overallCosmic >= 70,
    overallCosmic,
  }

  const centennialMasterpieceCount = observations.filter((o) => o.condition === 'centennial-masterpiece').length
  const landmarkObservatoryCount = observations.filter((o) => o.condition === 'landmark-observatory').length
  const professionalInstrumentCount = observations.filter((o) => o.condition === 'professional-instrument').length
  const amateurTelescopeCount = observations.filter((o) => o.condition === 'amateur-telescope').length
  const brokenLensCount = observations.filter((o) => o.condition === 'broken-lens').length
  const darknessCount = observations.filter((o) => o.condition === 'darkness').length

  const bestObservation = observations.length > 0 ? observations.reduce((b, o) => o.qualityScore > b.qualityScore ? o : b).file : ''
  const sharpest = observations.length > 0 ? observations.reduce((b, o) => o.telescopeResolution > b.telescopeResolution ? o : b).file : ''
  const bestDocumented = observations.length > 0 ? observations.reduce((b, o) => o.stellarCatalog > b.stellarCatalog ? o : b).file : ''
  const bestOrganized = observations.length > 0 ? observations.reduce((b, o) => o.skyMapping > b.skyMapping ? o : b).file : ''
  const mostInnovative = observations.length > 0 ? observations.reduce((b, o) => o.cosmicDiscovery > b.cosmicDiscovery ? o : b).file : ''
  const bestFoundation = observations.length > 0 ? observations.reduce((b, o) => o.observatoryFoundation > b.observatoryFoundation ? o : b).file : ''

  const astronomerGrade = classifyAstronomerGrade(overallCosmic)

  const stats = {
    totalFiles: files.length,
    totalDomes: domes.length,
    avgTelescopeResolution,
    avgStellarCatalog,
    avgSkyMapping,
    avgCosmicDiscovery,
    avgObservatoryFoundation,
    avgAstronomicalLegacy,
    centennialMasterpieceCount,
    landmarkObservatoryCount,
    professionalInstrumentCount,
    amateurTelescopeCount,
    brokenLensCount,
    darknessCount,
    hasHighResolutionCount: observations.filter((o) => o.telescope.hasHighResolution).length,
    hasHighCatalogCount: observations.filter((o) => o.stellar.hasHighCatalog).length,
    hasHighMappingCount: observations.filter((o) => o.sky.hasHighMapping).length,
    hasHighDiscoveryCount: observations.filter((o) => o.cosmic.hasHighDiscovery).length,
    hasHighQualityCount: observations.filter((o) => o.foundation.hasHighQuality).length,
    hasHighLegacyCount: observations.filter((o) => o.legacy.hasHighQuality).length,
    overallCosmic,
    astronomerGrade,
    bestObservation,
    sharpest,
    bestDocumented,
    bestOrganized,
    mostInnovative,
    bestFoundation,
    celebration: '400 commands - a constellation of code analysis excellence',
  }

  const recommendations = generateRecommendations(observations, domes, cosmos, stats)

  return { observations, domes, cosmos, stats, recommendations }
}
