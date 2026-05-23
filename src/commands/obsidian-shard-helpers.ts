// ─── Types ─────────────────────────────────────────────────────────────────

export interface SharpMeasure {
  precision: number
  edge: 'razor-edge' | 'surgical-precision' | 'keen-blade' | 'moderately-sharp' | 'dull-edge' | 'blunt'
  hasHighPrecision: boolean
  hasExact: boolean
  hasPrecise: boolean
  hasNoSloppiness: boolean
  hasTargeted: boolean
  hasNoScatter: boolean
  hasSharpLogic: boolean
  hasNoFuzziness: boolean
  hasCrisp: boolean
  hasNoBlurriness: boolean
  sloppinessCount: number
  scatterCount: number
}

export interface EdgeMeasure {
  handling: number
  coverage: 'complete-coverage' | 'thorough-edge' | 'proper-boundary' | 'partial-coverage' | 'gaps-found' | 'no-coverage'
  hasHighHandling: boolean
  hasBoundaryChecks: boolean
  hasInputValidation: boolean
  hasNoUnchecked: boolean
  hasErrorHandling: boolean
  hasNoBlindSpots: boolean
  hasNullChecks: boolean
  hasNoAssumptions: boolean
  hasTypeGuards: boolean
  hasNoGaps: boolean
  uncheckedCount: number
  blindSpotCount: number
}

export interface FractureMeasure {
  pattern: number
  quality: 'clean-break' | 'controlled-fracture' | 'expected-pattern' | 'jagged-break' | 'shatter' | 'explosion'
  hasHighPattern: boolean
  hasGracefulErrors: boolean
  hasPredictable: boolean
  hasNoUnexpected: boolean
  hasContained: boolean
  hasNoCascade: boolean
  hasRecoverable: boolean
  hasNoSilent: boolean
  hasDiagnostic: boolean
  hasNoSwallowed: boolean
  unexpectedCount: number
  cascadeCount: number
}

export interface CuttingMeasure {
  precision: number
  accuracy: 'laser-cut' | 'scalpel-precise' | 'clean-cut' | 'rough-cut' | 'hacked' | 'torn'
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoApproximation: boolean
  hasExact: boolean
  hasNoGuesswork: boolean
  hasCorrect: boolean
  hasNoApproximate: boolean
  hasPrecise: boolean
  hasNoRounding: boolean
  hasTrue: boolean
  approximationCount: number
  guessworkCount: number
}

export interface VolcanicMeasure {
  formation: number
  quality: 'perfect-glass' | 'rapid-cool' | 'proper-form' | 'slow-cool' | 'devitrified' | 'slag'
  hasHighFormation: boolean
  hasWellFormed: boolean
  hasClean: boolean
  hasNoImpurities: boolean
  hasProper: boolean
  hasNoBubbles: boolean
  hasSolid: boolean
  hasNoCracks: boolean
  hasDense: boolean
  hasNoHoles: boolean
  impurityCount: number
  bubbleCount: number
}

export interface DangerousMeasure {
  riskManagement: number
  quality: 'calculated-risk' | 'managed-danger' | 'proper-caution' | 'reckless' | 'hazardous' | 'catastrophic'
  hasHighRiskManagement: boolean
  hasSafe: boolean
  hasNoUnsafe: boolean
  hasGuarded: boolean
  hasNoBare: boolean
  hasProtected: boolean
  hasNoExposed: boolean
  hasCareful: boolean
  hasNoReckless: boolean
  hasSecure: boolean
  unsafeCount: number
  exposedCount: number
}

export type ShardCondition = 'surgical-shard' | 'razor-edge' | 'sharp-flake' | 'dull-piece' | 'blunt-stone' | 'gravel'

export interface ShardEdge {
  file: string
  sharpness: number
  edgeCaseHandling: number
  fracturePattern: number
  cuttingPrecision: number
  volcanicGlass: number
  dangerQuality: number
  sharp: SharpMeasure
  edge: EdgeMeasure
  fracture: FractureMeasure
  cutting: CuttingMeasure
  volcanic: VolcanicMeasure
  dangerous: DangerousMeasure
  condition: ShardCondition
  qualityScore: number
}

export type CollectionType = 'master-workshop' | 'flintknapper-studio' | 'tool-shed' | 'rock-pile' | 'gravel-pit' | 'empty-quarry'
export type CollectionCondition = 'precision-tools' | 'sharp-collection' | 'usable-edges' | 'mixed-quality' | 'dull-rocks' | 'rubble'

export interface ShardCollection {
  directory: string
  edges: ShardEdge[]
  avgSharpness: number
  avgCuttingPrecision: number
  avgDangerQuality: number
  surgicalCount: number
  gravelCount: number
  razorEdgeCount: number
  sharpFlakeCount: number
  collectionType: CollectionType
  condition: CollectionCondition
}

export interface Workshop {
  avgSharpness: number
  avgCuttingPrecision: number
  avgDangerQuality: number
  isSharp: boolean
  overallSharpness: number
}

export type FlintknapperGrade = 'master-flintknapper' | 'expert-knapper' | 'skilled-worker' | 'apprentice' | 'novice' | 'hazard'

export interface ObsidianShardStats {
  totalFiles: number
  totalCollections: number
  avgSharpness: number
  avgEdgeCaseHandling: number
  avgFracturePattern: number
  avgCuttingPrecision: number
  avgVolcanicGlass: number
  avgDangerQuality: number
  surgicalShardCount: number
  razorEdgeCount: number
  sharpFlakeCount: number
  dullPieceCount: number
  bluntStoneCount: number
  gravelCount: number
  hasHighPrecisionCount: number
  hasHighHandlingCount: number
  hasHighPatternCount: number
  hasHighAccuracyCount: number
  hasHighFormationCount: number
  hasHighRiskManagementCount: number
  overallSharpness: number
  flintknapperGrade: FlintknapperGrade
  bestEdge: string
  sharpest: string
  bestEdgeCases: string
  bestErrorPatterns: string
  mostAccurate: string
  safest: string
}

export interface ObsidianShardResult {
  edges: ShardEdge[]
  collections: ShardCollection[]
  workshop: Workshop
  stats: ObsidianShardStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureSharp(content) evaluates code precision */
export function measureSharp(content: string): SharpMeasure {
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasLiteralTypes = /(?:'[^']*'\s*\|\s*){2,}'[^']*'/.test(content)

  const sloppinessMatches = content.match(/\bvar\s+/g)
  const sloppinessCount = sloppinessMatches ? sloppinessMatches.length : 0
  const scatterMatches = content.match(/\bany\b/g)
  const scatterCount = scatterMatches ? scatterMatches.length : 0

  const hasExact = hasConst && hasTypeAnnotation
  const hasPrecise = hasReturnType && hasTypeAnnotation
  const hasTargeted = hasOptionalChaining || hasNullishCoalescing
  const hasSharpLogic = hasEnum || hasLiteralTypes
  const hasCrisp = hasReadonly && hasConst

  let precision = 0
  if (hasConst) precision += 10
  if (hasReturnType) precision += 10
  if (hasTypeAnnotation) precision += 10
  if (hasGenerics) precision += 8
  if (hasReadonly) precision += 7
  if (hasOptionalChaining) precision += 8
  if (hasNullishCoalescing) precision += 7
  if (hasEnum) precision += 7
  if (hasLiteralTypes) precision += 8
  if (hasExact) precision += 5
  if (hasPrecise) precision += 5
  if (hasTargeted) precision += 5
  if (hasSharpLogic) precision += 5
  if (hasCrisp) precision += 5

  precision = Math.min(100, Math.round(precision))

  let edge: SharpMeasure['edge'] = 'blunt'
  if (precision >= 85) edge = 'razor-edge'
  else if (precision >= 70) edge = 'surgical-precision'
  else if (precision >= 55) edge = 'keen-blade'
  else if (precision >= 40) edge = 'moderately-sharp'
  else if (precision >= 25) edge = 'dull-edge'

  return {
    precision,
    edge,
    hasHighPrecision: precision >= 70,
    hasExact,
    hasPrecise,
    hasNoSloppiness: sloppinessCount === 0,
    hasTargeted,
    hasNoScatter: scatterCount === 0,
    hasSharpLogic,
    hasNoFuzziness: scatterCount === 0 && sloppinessCount === 0,
    hasCrisp,
    hasNoBlurriness: sloppinessCount === 0,
    sloppinessCount,
    scatterCount,
  }
}

/** @example measureEdge(content) evaluates boundary handling */
export function measureEdge(content: string): EdgeMeasure {
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  const hasNullCheck = /\?\.\w/.test(content) || /!==?\s*null/.test(content) || /===?\s*null/.test(content)
  const hasUndefinedCheck = /!==?\s*undefined/.test(content) || /===?\s*undefined/.test(content)
  const hasTypeofCheck = /typeof\s+\w+\s*[!=]==?\s*['"]/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasThrow = /\bthrow\s+/.test(content)
  const hasErrorType = /Error\b/.test(content)
  const hasOptionalParam = /\w+\?\s*[):\]]/.test(content)
  const hasInstanceof = /\binstanceof\b/.test(content)

  const uncheckedMatches = content.match(/\bany\b/g)
  const uncheckedCount = uncheckedMatches ? uncheckedMatches.length : 0
  const blindSpotMatches = content.match(/\bTODO\b|\bFIXME\b/g)
  const blindSpotCount = blindSpotMatches ? blindSpotMatches.length : 0

  const hasBoundaryChecks = hasNullCheck || hasUndefinedCheck
  const hasInputValidation = hasTypeofCheck || hasInstanceof
  const hasErrorHandling = hasTryCatch || hasThrow
  const hasTypeGuards = hasInstanceof || hasTypeofCheck

  let handling = 0
  if (hasTryCatch) handling += 12
  if (hasNullCheck) handling += 10
  if (hasUndefinedCheck) handling += 8
  if (hasTypeofCheck) handling += 8
  if (hasDefaultParam) handling += 7
  if (hasThrow) handling += 8
  if (hasErrorType) handling += 5
  if (hasOptionalParam) handling += 7
  if (hasInstanceof) handling += 8
  if (hasBoundaryChecks) handling += 5
  if (hasInputValidation) handling += 5
  if (hasErrorHandling) handling += 5
  if (hasTypeGuards) handling += 5

  handling = Math.min(100, Math.round(handling))

  let coverage: EdgeMeasure['coverage'] = 'no-coverage'
  if (handling >= 85) coverage = 'complete-coverage'
  else if (handling >= 70) coverage = 'thorough-edge'
  else if (handling >= 55) coverage = 'proper-boundary'
  else if (handling >= 40) coverage = 'partial-coverage'
  else if (handling >= 25) coverage = 'gaps-found'

  return {
    handling,
    coverage,
    hasHighHandling: handling >= 70,
    hasBoundaryChecks,
    hasInputValidation,
    hasNoUnchecked: uncheckedCount === 0,
    hasErrorHandling,
    hasNoBlindSpots: blindSpotCount === 0,
    hasNullChecks: hasNullCheck,
    hasNoAssumptions: uncheckedCount === 0 && blindSpotCount === 0,
    hasTypeGuards,
    hasNoGaps: uncheckedCount === 0,
    uncheckedCount,
    blindSpotCount,
  }
}

/** @example measureFracture(content) evaluates error patterns */
export function measureFracture(content: string): FractureMeasure {
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  const hasErrorClass = /extends\s+(?:Error|TypeError|RangeError)/.test(content)
  const hasThrow = /\bthrow\s+new\s+/.test(content)
  const hasFinally = /finally\s*\{/.test(content)
  const hasCustomError = /class\s+\w*Error\w*\s+extends/.test(content)
  const hasPromiseCatch = /\.catch\s*\(/.test(content)
  const hasErrorMessage = /Error\(['"]/.test(content)
  const hasResultType = /Result\b/.test(content) || /Either\b/.test(content)
  const hasAssertFunction = /\bassert\w*\s*\(/.test(content)

  const unexpectedMatches = content.match(/\beval\s*\(/g)
  const unexpectedCount = unexpectedMatches ? unexpectedMatches.length : 0
  const cascadeMatches = content.match(/\bprocess\.exit\b/g)
  const cascadeCount = cascadeMatches ? cascadeMatches.length : 0

  const hasGracefulErrors = hasTryCatch && hasThrow
  const hasPredictable = hasErrorClass || hasCustomError
  const hasContained = hasFinally || hasPromiseCatch
  const hasRecoverable = hasTryCatch || hasResultType
  const hasDiagnostic = hasErrorMessage || hasAssertFunction

  let pattern = 0
  if (hasTryCatch) pattern += 12
  if (hasErrorClass) pattern += 10
  if (hasThrow) pattern += 10
  if (hasFinally) pattern += 8
  if (hasCustomError) pattern += 10
  if (hasPromiseCatch) pattern += 8
  if (hasErrorMessage) pattern += 7
  if (hasResultType) pattern += 8
  if (hasAssertFunction) pattern += 5
  if (hasGracefulErrors) pattern += 5
  if (hasPredictable) pattern += 5
  if (hasContained) pattern += 5
  if (hasRecoverable) pattern += 5

  pattern = Math.min(100, Math.round(pattern))

  let quality: FractureMeasure['quality'] = 'explosion'
  if (pattern >= 85) quality = 'clean-break'
  else if (pattern >= 70) quality = 'controlled-fracture'
  else if (pattern >= 55) quality = 'expected-pattern'
  else if (pattern >= 40) quality = 'jagged-break'
  else if (pattern >= 25) quality = 'shatter'

  return {
    pattern,
    quality,
    hasHighPattern: pattern >= 70,
    hasGracefulErrors,
    hasPredictable,
    hasNoUnexpected: unexpectedCount === 0,
    hasContained,
    hasNoCascade: cascadeCount === 0,
    hasRecoverable,
    hasNoSilent: cascadeCount === 0 && unexpectedCount === 0,
    hasDiagnostic,
    hasNoSwallowed: unexpectedCount === 0,
    unexpectedCount,
    cascadeCount,
  }
}

/** @example measureCutting(content) evaluates code accuracy */
export function measureCutting(content: string): CuttingMeasure {
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasStrictEquality = /!==/.test(content) || /===/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasLiteralTypes = /(?:'[^']*'\s*\|\s*){2,}'[^']*'/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const approximationMatches = content.match(/\bany\b/g)
  const approximationCount = approximationMatches ? approximationMatches.length : 0
  const guessworkMatches = content.match(/\bas\s+any\b/g)
  const guessworkCount = guessworkMatches ? guessworkMatches.length : 0

  const hasAccurate = hasTypeAnnotation && hasReturnType
  const hasExact = hasConst && hasStrictEquality
  const hasCorrect = hasInterface && hasTypeAnnotation
  const hasPrecise = hasGenerics && hasReadonly
  const hasTrue = hasLiteralTypes || hasEnum

  let precision = 0
  if (hasTypeAnnotation) precision += 10
  if (hasReturnType) precision += 10
  if (hasGenerics) precision += 8
  if (hasConst) precision += 8
  if (hasStrictEquality) precision += 10
  if (hasInterface) precision += 10
  if (hasLiteralTypes) precision += 8
  if (hasEnum) precision += 7
  if (hasReadonly) precision += 7
  if (hasAccurate) precision += 5
  if (hasExact) precision += 5
  if (hasCorrect) precision += 5
  if (hasPrecise) precision += 5

  precision = Math.min(100, Math.round(precision))

  let accuracy: CuttingMeasure['accuracy'] = 'torn'
  if (precision >= 85) accuracy = 'laser-cut'
  else if (precision >= 70) accuracy = 'scalpel-precise'
  else if (precision >= 55) accuracy = 'clean-cut'
  else if (precision >= 40) accuracy = 'rough-cut'
  else if (precision >= 25) accuracy = 'hacked'

  return {
    precision,
    accuracy,
    hasHighPrecision: precision >= 70,
    hasAccurate,
    hasNoApproximation: approximationCount === 0,
    hasExact,
    hasNoGuesswork: guessworkCount === 0,
    hasCorrect,
    hasNoApproximate: approximationCount === 0,
    hasPrecise,
    hasNoRounding: guessworkCount === 0,
    hasTrue,
    approximationCount,
    guessworkCount,
  }
}

/** @example measureVolcanic(content) evaluates formation quality */
export function measureVolcanic(content: string): VolcanicMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasStrictTypes = /:\s*(?:string|number|boolean|void|never)\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)

  const impurityMatches = content.match(/\bvar\s+/g)
  const impurityCount = impurityMatches ? impurityMatches.length : 0
  const bubbleMatches = content.match(/\bconsole\.\w+\s*\(/g)
  const bubbleCount = bubbleMatches ? bubbleMatches.length : 0

  const hasWellFormed = hasExport && hasImport
  const hasClean = hasNamedExport && hasDocComments
  const hasProper = hasClass && hasPrivate
  const hasSolid = hasInterface && hasStrictTypes
  const hasDense = hasGenerics && hasExport

  let formation = 0
  if (hasExport) formation += 10
  if (hasImport) formation += 8
  if (hasClass) formation += 10
  if (hasInterface) formation += 10
  if (hasTypeAlias) formation += 7
  if (hasNamedExport) formation += 8
  if (hasDocComments) formation += 8
  if (hasPrivate) formation += 7
  if (hasStrictTypes) formation += 7
  if (hasGenerics) formation += 8
  if (hasWellFormed) formation += 5
  if (hasClean) formation += 5
  if (hasProper) formation += 5
  if (hasSolid) formation += 5
  if (hasDense) formation += 5

  formation = Math.min(100, Math.round(formation))

  let quality: VolcanicMeasure['quality'] = 'slag'
  if (formation >= 85) quality = 'perfect-glass'
  else if (formation >= 70) quality = 'rapid-cool'
  else if (formation >= 55) quality = 'proper-form'
  else if (formation >= 40) quality = 'slow-cool'
  else if (formation >= 25) quality = 'devitrified'

  return {
    formation,
    quality,
    hasHighFormation: formation >= 70,
    hasWellFormed,
    hasClean,
    hasNoImpurities: impurityCount === 0,
    hasProper,
    hasNoBubbles: bubbleCount === 0,
    hasSolid,
    hasNoCracks: impurityCount === 0,
    hasDense,
    hasNoHoles: bubbleCount === 0,
    impurityCount,
    bubbleCount,
  }
}

/** @example measureDangerous(content) evaluates risk management */
export function measureDangerous(content: string): DangerousMeasure {
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasNullCheck = /\?\.\w/.test(content) || /\?\?/.test(content)
  const hasErrorHandling = /\bthrow\s+/.test(content) || /Error\b/.test(content)
  const hasStrictMode = /===/.test(content) || /!==/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasFinalConst = /\bconst\s+/.test(content)

  const unsafeMatches = content.match(/\bany\b/g)
  const unsafeCount = unsafeMatches ? unsafeMatches.length : 0
  const exposedMatches = content.match(/\beval\s*\(/g)
  const exposedCount = exposedMatches ? exposedMatches.length : 0

  const hasSafe = hasTypeAnnotation && hasNullCheck
  const hasGuarded = hasTryCatch && hasErrorHandling
  const hasProtected = hasPrivate && hasReadonly
  const hasCareful = hasInterface && hasTypeAnnotation
  const hasSecure = hasStrictMode && hasFinalConst

  let riskManagement = 0
  if (hasTryCatch) riskManagement += 10
  if (hasTypeAnnotation) riskManagement += 10
  if (hasReadonly) riskManagement += 8
  if (hasPrivate) riskManagement += 7
  if (hasNullCheck) riskManagement += 10
  if (hasErrorHandling) riskManagement += 8
  if (hasStrictMode) riskManagement += 8
  if (hasInterface) riskManagement += 8
  if (hasGenerics) riskManagement += 7
  if (hasFinalConst) riskManagement += 5
  if (hasSafe) riskManagement += 5
  if (hasGuarded) riskManagement += 5
  if (hasProtected) riskManagement += 5
  if (hasCareful) riskManagement += 5

  riskManagement = Math.min(100, Math.round(riskManagement))

  let quality: DangerousMeasure['quality'] = 'catastrophic'
  if (riskManagement >= 85) quality = 'calculated-risk'
  else if (riskManagement >= 70) quality = 'managed-danger'
  else if (riskManagement >= 55) quality = 'proper-caution'
  else if (riskManagement >= 40) quality = 'reckless'
  else if (riskManagement >= 25) quality = 'hazardous'

  return {
    riskManagement,
    quality,
    hasHighRiskManagement: riskManagement >= 70,
    hasSafe,
    hasNoUnsafe: unsafeCount === 0,
    hasGuarded,
    hasNoBare: exposedCount === 0,
    hasProtected,
    hasNoExposed: exposedCount === 0,
    hasCareful,
    hasNoReckless: unsafeCount === 0 && exposedCount === 0,
    hasSecure,
    unsafeCount,
    exposedCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'surgical-shard' */
export function classifyCondition(score: number): ShardCondition {
  if (score >= 85) return 'surgical-shard'
  if (score >= 70) return 'razor-edge'
  if (score >= 55) return 'sharp-flake'
  if (score >= 40) return 'dull-piece'
  if (score >= 25) return 'blunt-stone'
  return 'gravel'
}

/** @example classifyCollectionType(edges) returns collection classification */
export function classifyCollectionType(edges: ShardEdge[]): CollectionType {
  if (edges.length === 0) return 'empty-quarry'
  const avgQs = edges.reduce((s, e) => s + e.qualityScore, 0) / edges.length
  const surgicalCount = edges.filter((e) => e.condition === 'surgical-shard').length
  const ratio = surgicalCount / edges.length
  if (avgQs >= 75 && ratio >= 0.5) return 'master-workshop'
  if (avgQs >= 60) return 'flintknapper-studio'
  if (avgQs >= 45) return 'tool-shed'
  if (avgQs >= 30) return 'rock-pile'
  if (avgQs >= 15) return 'gravel-pit'
  return 'empty-quarry'
}

/** @example classifyCollectionCondition(avgQs) returns collection condition */
export function classifyCollectionCondition(avgQs: number): CollectionCondition {
  if (avgQs >= 75) return 'precision-tools'
  if (avgQs >= 60) return 'sharp-collection'
  if (avgQs >= 45) return 'usable-edges'
  if (avgQs >= 30) return 'mixed-quality'
  if (avgQs >= 15) return 'dull-rocks'
  return 'rubble'
}

/** @example classifyFlintknapperGrade(80) returns 'master-flintknapper' */
export function classifyFlintknapperGrade(avgSharpness: number): FlintknapperGrade {
  if (avgSharpness >= 80) return 'master-flintknapper'
  if (avgSharpness >= 65) return 'expert-knapper'
  if (avgSharpness >= 50) return 'skilled-worker'
  if (avgSharpness >= 35) return 'apprentice'
  if (avgSharpness >= 20) return 'novice'
  return 'hazard'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeShardEdge(content, filePath) evaluates single file */
export function analyzeShardEdge(content: string, filePath: string): ShardEdge {
  const sharp = measureSharp(content)
  const edge = measureEdge(content)
  const fracture = measureFracture(content)
  const cutting = measureCutting(content)
  const volcanic = measureVolcanic(content)
  const dangerous = measureDangerous(content)

  const qualityScore = Math.round(
    sharp.precision * 0.2 +
    edge.handling * 0.15 +
    fracture.pattern * 0.15 +
    cutting.precision * 0.2 +
    volcanic.formation * 0.15 +
    dangerous.riskManagement * 0.15,
  )

  return {
    file: filePath,
    sharpness: sharp.precision,
    edgeCaseHandling: edge.handling,
    fracturePattern: fracture.pattern,
    cuttingPrecision: cutting.precision,
    volcanicGlass: volcanic.formation,
    dangerQuality: dangerous.riskManagement,
    sharp,
    edge,
    fracture,
    cutting,
    volcanic,
    dangerous,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeShardCollection(edges, dirPath) evaluates directory */
export function analyzeShardCollection(edges: ShardEdge[], dirPath: string): ShardCollection {
  if (edges.length === 0) {
    return {
      directory: dirPath,
      edges: [],
      avgSharpness: 0,
      avgCuttingPrecision: 0,
      avgDangerQuality: 0,
      surgicalCount: 0,
      gravelCount: 0,
      razorEdgeCount: 0,
      sharpFlakeCount: 0,
      collectionType: 'empty-quarry',
      condition: 'rubble',
    }
  }

  const avgSharpness = Math.round(edges.reduce((s, e) => s + e.sharpness, 0) / edges.length)
  const avgCuttingPrecision = Math.round(edges.reduce((s, e) => s + e.cuttingPrecision, 0) / edges.length)
  const avgDangerQuality = Math.round(edges.reduce((s, e) => s + e.dangerQuality, 0) / edges.length)

  const surgicalCount = edges.filter((e) => e.condition === 'surgical-shard').length
  const gravelCount = edges.filter((e) => e.condition === 'gravel').length
  const razorEdgeCount = edges.filter((e) => e.condition === 'razor-edge').length
  const sharpFlakeCount = edges.filter((e) => e.condition === 'sharp-flake').length

  const avgQs = edges.reduce((s, e) => s + e.qualityScore, 0) / edges.length

  return {
    directory: dirPath,
    edges,
    avgSharpness,
    avgCuttingPrecision,
    avgDangerQuality,
    surgicalCount,
    gravelCount,
    razorEdgeCount,
    sharpFlakeCount,
    collectionType: classifyCollectionType(edges),
    condition: classifyCollectionCondition(avgQs),
  }
}

/** @example generateRecommendations(edges, collections, workshop, stats) generates advice */
export function generateRecommendations(
  edges: ShardEdge[],
  collections: ShardCollection[],
  workshop: Workshop,
  stats: ObsidianShardStats,
): string[] {
  const recs: string[] = []

  if (stats.avgSharpness < 50) {
    recs.push('Add type annotations, const declarations, and strict types to sharpen code precision')
  }
  if (stats.avgEdgeCaseHandling < 50) {
    recs.push('Improve edge case handling with null checks, try/catch blocks, and input validation')
  }
  if (stats.avgFracturePattern < 50) {
    recs.push('Strengthen error patterns with custom error classes, graceful error handling, and diagnostics')
  }
  if (stats.avgCuttingPrecision < 50) {
    recs.push('Increase cutting precision with strict equality, interfaces, and literal types')
  }
  if (stats.avgVolcanicGlass < 50) {
    recs.push('Improve code formation with proper exports, imports, documentation, and structure')
  }
  if (stats.avgDangerQuality < 50) {
    recs.push('Reduce risk with type safety, error handling, private members, and null checks')
  }
  if (stats.gravelCount > 0) {
    recs.push(`${String(stats.gravelCount)} file(s) are gravel — consider significant refactoring`)
  }
  if (workshop.overallSharpness < 40) {
    recs.push('Overall workshop sharpness is low — prioritize type safety and error handling')
  }
  if (collections.length > 0 && collections.every((c) => c.collectionType === 'empty-quarry' || c.collectionType === 'gravel-pit')) {
    recs.push('All collections are empty or gravel — consider a major quality improvement effort')
  }

  const gravelEdges = edges.filter((e) => e.condition === 'gravel')
  if (gravelEdges.length > 0 && gravelEdges.length <= 3) {
    const names = gravelEdges.map((e) => e.file).join(', ')
    recs.push(`Sharpen these blunt files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your obsidian shards are razor-sharp! Keep honing your craft')
  }

  return Array.from(new Set(recs))
}

/** @example buildObsidianShardResult(files, contents, options) orchestrates analysis */
export function buildObsidianShardResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): ObsidianShardResult {
  const edges = files.map((file, i) => analyzeShardEdge(contents[i] ?? '', file))

  const collMap = new Map<string, ShardEdge[]>()
  for (const edge of edges) {
    const dir = edge.file.includes('/') ? edge.file.split('/').slice(0, -1).join('/') : '.'
    const existing = collMap.get(dir)
    if (existing) {
      existing.push(edge)
    } else {
      collMap.set(dir, [edge])
    }
  }

  const collections = Array.from(collMap.entries()).map(([dir, dirEdges]) =>
    analyzeShardCollection(dirEdges, dir),
  )

  const totalFiles = edges.length
  const avgSharpness = totalFiles > 0 ? Math.round(edges.reduce((s, e) => s + e.sharpness, 0) / totalFiles) : 0
  const avgEdgeCaseHandling = totalFiles > 0 ? Math.round(edges.reduce((s, e) => s + e.edgeCaseHandling, 0) / totalFiles) : 0
  const avgFracturePattern = totalFiles > 0 ? Math.round(edges.reduce((s, e) => s + e.fracturePattern, 0) / totalFiles) : 0
  const avgCuttingPrecision = totalFiles > 0 ? Math.round(edges.reduce((s, e) => s + e.cuttingPrecision, 0) / totalFiles) : 0
  const avgVolcanicGlass = totalFiles > 0 ? Math.round(edges.reduce((s, e) => s + e.volcanicGlass, 0) / totalFiles) : 0
  const avgDangerQuality = totalFiles > 0 ? Math.round(edges.reduce((s, e) => s + e.dangerQuality, 0) / totalFiles) : 0

  const overallSharpness = totalFiles > 0
    ? Math.round((avgSharpness + avgCuttingPrecision + avgDangerQuality) / 3)
    : 0

  const workshop: Workshop = {
    avgSharpness,
    avgCuttingPrecision,
    avgDangerQuality,
    isSharp: avgSharpness >= 60,
    overallSharpness,
  }

  const surgicalShardCount = edges.filter((e) => e.condition === 'surgical-shard').length
  const razorEdgeCount = edges.filter((e) => e.condition === 'razor-edge').length
  const sharpFlakeCount = edges.filter((e) => e.condition === 'sharp-flake').length
  const dullPieceCount = edges.filter((e) => e.condition === 'dull-piece').length
  const bluntStoneCount = edges.filter((e) => e.condition === 'blunt-stone').length
  const gravelCount = edges.filter((e) => e.condition === 'gravel').length

  const bestEdge = totalFiles > 0
    ? edges.reduce((best, e) => (e.qualityScore > best.qualityScore ? e : best), edges[0]).file
    : ''
  const sharpest = totalFiles > 0
    ? edges.reduce((best, e) => (e.sharpness > best.sharpness ? e : best), edges[0]).file
    : ''
  const bestEdgeCases = totalFiles > 0
    ? edges.reduce((best, e) => (e.edgeCaseHandling > best.edgeCaseHandling ? e : best), edges[0]).file
    : ''
  const bestErrorPatterns = totalFiles > 0
    ? edges.reduce((best, e) => (e.fracturePattern > best.fracturePattern ? e : best), edges[0]).file
    : ''
  const mostAccurate = totalFiles > 0
    ? edges.reduce((best, e) => (e.cuttingPrecision > best.cuttingPrecision ? e : best), edges[0]).file
    : ''
  const safest = totalFiles > 0
    ? edges.reduce((best, e) => (e.dangerQuality > best.dangerQuality ? e : best), edges[0]).file
    : ''

  const stats: ObsidianShardStats = {
    totalFiles,
    totalCollections: collections.length,
    avgSharpness,
    avgEdgeCaseHandling,
    avgFracturePattern,
    avgCuttingPrecision,
    avgVolcanicGlass,
    avgDangerQuality,
    surgicalShardCount,
    razorEdgeCount,
    sharpFlakeCount,
    dullPieceCount,
    bluntStoneCount,
    gravelCount,
    hasHighPrecisionCount: edges.filter((e) => e.sharp.hasHighPrecision).length,
    hasHighHandlingCount: edges.filter((e) => e.edge.hasHighHandling).length,
    hasHighPatternCount: edges.filter((e) => e.fracture.hasHighPattern).length,
    hasHighAccuracyCount: edges.filter((e) => e.cutting.hasHighPrecision).length,
    hasHighFormationCount: edges.filter((e) => e.volcanic.hasHighFormation).length,
    hasHighRiskManagementCount: edges.filter((e) => e.dangerous.hasHighRiskManagement).length,
    overallSharpness,
    flintknapperGrade: classifyFlintknapperGrade(overallSharpness),
    bestEdge,
    sharpest,
    bestEdgeCases,
    bestErrorPatterns,
    mostAccurate,
    safest,
  }

  const recommendations = generateRecommendations(edges, collections, workshop, stats)

  return { edges, collections, workshop, stats, recommendations }
}
