// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface AbstractMeasure {
  separation: number
  level: 'transcendent' | 'elevated' | 'proper-abstraction' | 'grounded' | 'earthy' | 'bedrock'
  hasHighSeparation: boolean
  hasProperAbstraction: boolean
  hasNoOverAbstraction: boolean
  hasClean: boolean
  hasNoUnnecessary: boolean
  hasIntentional: boolean
  hasNoSpeculative: boolean
  hasValuable: boolean
  hasNoCeremony: boolean
  hasPurposeful: boolean
  overAbstractionCount: number
  speculativeCount: number
}

export interface IsolatedMeasure {
  independence: number
  autonomy: 'self-sufficient' | 'largely-independent' | 'properly-coupled' | 'somewhat-dependent' | 'tightly-coupled' | 'entangled'
  hasHighIndependence: boolean
  hasSelfContained: boolean
  hasNoExternalLeaks: boolean
  hasProperBoundaries: boolean
  hasNoSideEffects: boolean
  hasEncapsulated: boolean
  hasNoSpaghetti: boolean
  hasAutonomous: boolean
  hasNoHiddenDeps: boolean
  hasPortable: boolean
  leakCount: number
  sideEffectCount: number
}

export interface PureMeasure {
  correctness: number
  rigor: 'mathematical-proof' | 'formal-verification' | 'well-reasoned' | 'plausible' | 'approximate' | 'guessed'
  hasHighCorrectness: boolean
  hasTypeSafe: boolean
  hasNoTypeCasts: boolean
  hasProperTypes: boolean
  hasNoAny: boolean
  hasImmutable: boolean
  hasNoMutations: boolean
  hasPure: boolean
  hasNoImpurities: boolean
  hasSound: boolean
  typeCastCount: number
  mutationCount: number
}

export interface ScholarlyMeasure {
  depth: number
  scholarship: 'doctoral-thesis' | 'research-paper' | 'textbook' | 'lecture-notes' | 'readme' | 'no-documentation'
  hasHighDepth: boolean
  hasThoroughDocs: boolean
  hasExamples: boolean
  hasNoUndocumented: boolean
  hasJSDoc: boolean
  hasNoSilent: boolean
  hasExplained: boolean
  hasNoMystery: boolean
  hasAnnotated: boolean
  hasNoGuesswork: boolean
  undocumentedCount: number
  mysteryCount: number
}

export interface ElevatedMeasure {
  level: number
  height: 'stratospheric' | 'high-altitude' | 'proper-elevation' | 'ground-level' | 'basement' | 'subterranean'
  hasHighLevel: boolean
  hasLayered: boolean
  hasProperHierarchy: boolean
  hasNoFlatness: boolean
  hasStructured: boolean
  hasNoSpaghetti: boolean
  hasAbstracted: boolean
  hasNoTanglement: boolean
  hasOrganized: boolean
  hasNoChaos: boolean
  flatnessCount: number
  tanglementCount: number
}

export interface RiskyMeasure {
  disconnect: number
  danger: 'pragmatic-balance' | 'minor-ivory' | 'moderate-tower' | 'significant-tower' | 'ivory-fortress' | 'cloud-cuckoo'
  hasHighDisconnect: boolean
  hasPractical: boolean
  hasNoOverEngineering: boolean
  hasRealWorld: boolean
  hasNoSpeculative: boolean
  hasGrounded: boolean
  hasNoFantasy: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasUseful: boolean
  overEngineeringCount: number
  fantasyCount: number
}

export interface TowerLevel {
  file: string
  abstraction: number
  isolation: number
  theoreticalPurity: number
  scholarlyDepth: number
  elevation: number
  isolationRisk: number
  abstract: AbstractMeasure
  isolated: IsolatedMeasure
  pure: PureMeasure
  scholarly: ScholarlyMeasure
  elevated: ElevatedMeasure
  risky: RiskyMeasure
  condition: 'enlightened-tower' | 'scholarly-retreat' | 'balanced-observatory' | 'ivory-isolation' | 'disconnected-spire' | 'ruined-tower'
  qualityScore: number
}

export interface TowerFloor {
  directory: string
  levels: TowerLevel[]
  avgAbstraction: number
  avgPurity: number
  avgScholarly: number
  enlightenedCount: number
  ruinedCount: number
  scholarlyCount: number
  balancedCount: number
  floorType: 'grand-university' | 'research-institute' | 'think-tank' | 'study-room' | 'closet-office' | 'empty-room'
  condition: 'tower-of-wisdom' | 'center-of-learning' | 'proper-institution' | 'struggling-academy' | 'crumbling-tower' | 'ruins'
}

export interface IvoryTowerResult {
  levels: TowerLevel[]
  floors: TowerFloor[]
  campus: {
    avgAbstraction: number
    avgPurity: number
    avgScholarly: number
    isEnlightened: boolean
    overallElevation: number
  }
  stats: {
    totalFiles: number
    totalFloors: number
    avgAbstraction: number
    avgIsolation: number
    avgTheoreticalPurity: number
    avgScholarlyDepth: number
    avgElevation: number
    avgIsolationRisk: number
    enlightenedTowerCount: number
    scholarlyRetreatCount: number
    balancedObservatoryCount: number
    ivoryIsolationCount: number
    disconnectedSpireCount: number
    ruinedTowerCount: number
    hasHighSeparationCount: number
    hasHighIndependenceCount: number
    hasHighCorrectnessCount: number
    hasHighDepthCount: number
    hasHighLevelCount: number
    hasHighDisconnectCount: number
    overallElevation: number
    scholarGrade: 'nobel-laureate' | 'full-professor' | 'associate-professor' | 'adjunct' | 'teaching-assistant' | 'undergraduate'
    bestLevel: string
    mostAbstract: string
    mostIndependent: string
    mostPure: string
    bestDocumented: string
    mostElevated: string
  }
  recommendations: string[]
}

// ─── Measure Abstract (code separation) ─────────────────────────────────────

/** @example measureAbstract(content) returns AbstractMeasure */
export function measureAbstract(content: string): AbstractMeasure {
  let score = 0
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasFunctions = /\bfunction\b/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasArrow = /=>/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasOptional = /\?\s*:/.test(content)
  const hasRest = /\.\.\./.test(content)
  const hasExtends = /\bextends\b/.test(content)
  const hasImplements = /\bimplements\b/.test(content)

  if (hasInterfaces) score += 12
  if (hasTypes) score += 10
  if (hasGenerics) score += 10
  if (hasExports) score += 8
  if (hasFunctions) score += 7
  if (hasClasses) score += 7
  if (hasArrow) score += 8
  if (hasAsync) score += 5
  if (hasOptional) score += 8
  if (hasRest) score += 5
  if (hasExtends) score += 10
  if (hasImplements) score += 10
  score = Math.min(100, score)

  const overAbstractionPatterns = [/\babstract\s+class\b/, /\bimplements\b.*\bimplements\b/]
  const speculativePatterns = [/\bany\b/, /\bvoid\s*\(/]
  const overAbstractionCount = overAbstractionPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const speculativeCount = speculativePatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let level: AbstractMeasure['level'] = 'bedrock'
  if (score >= 80) level = 'transcendent'
  else if (score >= 65) level = 'elevated'
  else if (score >= 50) level = 'proper-abstraction'
  else if (score >= 35) level = 'grounded'
  else if (score >= 20) level = 'earthy'

  return {
    separation: score,
    level,
    hasHighSeparation: score >= 70,
    hasProperAbstraction: hasInterfaces || hasTypes,
    hasNoOverAbstraction: overAbstractionCount === 0,
    hasClean: hasExports && (hasInterfaces || hasTypes),
    hasNoUnnecessary: overAbstractionCount === 0,
    hasIntentional: hasInterfaces || hasGenerics,
    hasNoSpeculative: speculativeCount === 0,
    hasValuable: hasFunctions || hasClasses,
    hasNoCeremony: speculativeCount === 0 && overAbstractionCount === 0,
    hasPurposeful: hasExports || hasFunctions,
    overAbstractionCount,
    speculativeCount,
  }
}

// ─── Measure Isolated (code independence) ───────────────────────────────────

/** @example measureIsolated(content) returns IsolatedMeasure */
export function measureIsolated(content: string): IsolatedMeasure {
  let score = 0
  const hasExports = /\bexport\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasPrivate = /\bprivate\b/.test(content)
  const hasProtected = /\bprotected\b/.test(content)
  const hasConsts = /\bconst\b/.test(content)
  const hasFunctions = /\bfunction\b/.test(content)
  const hasReturnTypes = /\)\s*:\s*(?!void\s*\{)(?!{)\w+/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  if (hasExports) score += 12
  if (hasImports) score += 7
  if (hasInterfaces) score += 10
  if (hasTypes) score += 10
  if (hasPrivate) score += 10
  if (hasProtected) score += 8
  if (hasConsts) score += 7
  if (hasFunctions) score += 8
  if (hasReturnTypes) score += 10
  if (hasClasses) score += 5
  if (hasErrorHandling) score += 8
  if (hasReadonly) score += 5
  score = Math.min(100, score)

  const leakPatterns = [/\bglobal\./, /\bprocess\.env\b/]
  const sideEffectPatterns = [/\bconsole\.log\b/, /\bdebugger\b/]
  const leakCount = leakPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const sideEffectCount = sideEffectPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let autonomy: IsolatedMeasure['autonomy'] = 'entangled'
  if (score >= 80) autonomy = 'self-sufficient'
  else if (score >= 65) autonomy = 'largely-independent'
  else if (score >= 50) autonomy = 'properly-coupled'
  else if (score >= 35) autonomy = 'somewhat-dependent'
  else if (score >= 20) autonomy = 'tightly-coupled'

  return {
    independence: score,
    autonomy,
    hasHighIndependence: score >= 70,
    hasSelfContained: hasInterfaces || hasTypes,
    hasNoExternalLeaks: leakCount === 0,
    hasProperBoundaries: hasExports && hasPrivate,
    hasNoSideEffects: sideEffectCount === 0,
    hasEncapsulated: hasPrivate || hasProtected,
    hasNoSpaghetti: leakCount === 0 && sideEffectCount === 0,
    hasAutonomous: hasExports && hasReturnTypes,
    hasNoHiddenDeps: leakCount === 0,
    hasPortable: hasConsts || hasFunctions,
    leakCount,
    sideEffectCount,
  }
}

// ─── Measure Pure (code correctness) ────────────────────────────────────────

/** @example measurePure(content) returns PureMeasure */
export function measurePure(content: string): PureMeasure {
  let score = 0
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasConsts = /\bconst\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasReturnType = /\)\s*:\s*(?!void\s*\{)(?!{)\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasEnums = /\benum\b/.test(content)
  const hasLiteralTypes = /'[^']'\s*\|/.test(content) || /\btype\s+\w+\s*=\s*'/.test(content)
  const hasOptional = /\?\s*:/.test(content)
  const hasStrictChecks = /!==|===/.test(content)
  const hasNullSafety = /\?\?|\?\.\w/.test(content)
  const hasTypedParams = /\(\s*\w+\s*:/.test(content)

  if (hasInterfaces) score += 10
  if (hasTypes) score += 10
  if (hasConsts) score += 8
  if (hasReadonly) score += 10
  if (hasReturnType) score += 10
  if (hasGenerics) score += 10
  if (hasEnums) score += 7
  if (hasLiteralTypes) score += 7
  if (hasOptional) score += 7
  if (hasStrictChecks) score += 7
  if (hasNullSafety) score += 7
  if (hasTypedParams) score += 7
  score = Math.min(100, score)

  const typeCastPatterns = [/\bas\s+\w+\b/, /<\w+>\(/]
  const mutationPatterns = [/\blet\b/, /\bvar\b/]
  const typeCastCount = typeCastPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const mutationCount = mutationPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let rigor: PureMeasure['rigor'] = 'guessed'
  if (score >= 80) rigor = 'mathematical-proof'
  else if (score >= 65) rigor = 'formal-verification'
  else if (score >= 50) rigor = 'well-reasoned'
  else if (score >= 35) rigor = 'plausible'
  else if (score >= 20) rigor = 'approximate'

  return {
    correctness: score,
    rigor,
    hasHighCorrectness: score >= 70,
    hasTypeSafe: hasTypedParams || hasReturnType,
    hasNoTypeCasts: typeCastCount === 0,
    hasProperTypes: hasInterfaces || hasTypes,
    hasNoAny: !/\bany\b/.test(content),
    hasImmutable: hasConsts || hasReadonly,
    hasNoMutations: mutationCount === 0,
    hasPure: sideEffectCount() === 0,
    hasNoImpurities: mutationCount === 0 && typeCastCount === 0,
    hasSound: hasStrictChecks && hasNullSafety,
    typeCastCount,
    mutationCount,
  }

  function sideEffectCount(): number {
    return [/\bconsole\.log\b/, /\bdebugger\b/].reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  }
}

// ─── Measure Scholarly (code documentation depth) ───────────────────────────

/** @example measureScholarly(content) returns ScholarlyMeasure */
export function measureScholarly(content: string): ScholarlyMeasure {
  let score = 0
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasParamDocs = /@param\b/.test(content)
  const hasReturnDocs = /@returns?\b/.test(content)
  const hasExampleDocs = /@example\b/.test(content)
  const hasThrowsDocs = /@throws?\b/.test(content)
  const hasSeeDocs = /@see\b/.test(content)
  const hasDeprecated = /@deprecated\b/.test(content)
  const hasLineComments = /\/\//.test(content)
  const hasDescriptions = /\/\*\*[\s\S]*?\*\/[\s\S]*?(?:function|class|interface|type|const)/.test(content)
  const hasTypeParamDocs = /@typeParam\b/.test(content)
  const hasInlineComments = /\/\/.*$/.test(content)
  const hasBlockComments = /\/\*[\s\S]*?\*\//.test(content)

  if (hasJSDoc) score += 15
  if (hasParamDocs) score += 10
  if (hasReturnDocs) score += 10
  if (hasExampleDocs) score += 10
  if (hasThrowsDocs) score += 8
  if (hasSeeDocs) score += 5
  if (hasDeprecated) score += 3
  if (hasLineComments) score += 5
  if (hasDescriptions) score += 10
  if (hasTypeParamDocs) score += 8
  if (hasInlineComments) score += 5
  if (hasBlockComments) score += 11
  score = Math.min(100, score)

  const undocumentedPatterns = [/\bTODO\b/, /\bFIXME\b/]
  const mysteryPatterns = [/\bany\b/, /\bvar\b/]
  const undocumentedCount = undocumentedPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const mysteryCount = mysteryPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let scholarship: ScholarlyMeasure['scholarship'] = 'no-documentation'
  if (score >= 80) scholarship = 'doctoral-thesis'
  else if (score >= 65) scholarship = 'research-paper'
  else if (score >= 50) scholarship = 'textbook'
  else if (score >= 35) scholarship = 'lecture-notes'
  else if (score >= 20) scholarship = 'readme'

  return {
    depth: score,
    scholarship,
    hasHighDepth: score >= 70,
    hasThoroughDocs: hasJSDoc && hasParamDocs && hasReturnDocs,
    hasExamples: hasExampleDocs,
    hasNoUndocumented: undocumentedCount === 0,
    hasJSDoc,
    hasNoSilent: mysteryCount === 0,
    hasExplained: hasDescriptions || hasBlockComments,
    hasNoMystery: mysteryCount === 0,
    hasAnnotated: hasParamDocs || hasReturnDocs,
    hasNoGuesswork: undocumentedCount === 0 && mysteryCount === 0,
    undocumentedCount,
    mysteryCount,
  }
}

// ─── Measure Elevated (code abstraction level) ──────────────────────────────

/** @example measureElevated(content) returns ElevatedMeasure */
export function measureElevated(content: string): ElevatedMeasure {
  let score = 0
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasExtends = /\bextends\b/.test(content)
  const hasImplements = /\bimplements\b/.test(content)
  const hasAbstract = /\babstract\b/.test(content)
  const hasNamespaces = /\bnamespace\b/.test(content)
  const hasModules = /\bmodule\b/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasEnums = /\benum\b/.test(content)
  const hasDecorators = /@\w+/.test(content)
  const hasHigherOrder = /\(\s*\w+\s*\)\s*=>/.test(content)

  if (hasInterfaces) score += 12
  if (hasTypes) score += 10
  if (hasGenerics) score += 12
  if (hasExtends) score += 10
  if (hasImplements) score += 10
  if (hasAbstract) score += 10
  if (hasNamespaces) score += 7
  if (hasModules) score += 5
  if (hasClasses) score += 5
  if (hasEnums) score += 5
  if (hasDecorators) score += 7
  if (hasHigherOrder) score += 7
  score = Math.min(100, score)

  const flatnessPatterns = [/\bvar\b/, /\bany\b/]
  const tanglementPatterns = [/\beval\b/, /\bwith\s*\(/]
  const flatnessCount = flatnessPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const tanglementCount = tanglementPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let height: ElevatedMeasure['height'] = 'subterranean'
  if (score >= 80) height = 'stratospheric'
  else if (score >= 65) height = 'high-altitude'
  else if (score >= 50) height = 'proper-elevation'
  else if (score >= 35) height = 'ground-level'
  else if (score >= 20) height = 'basement'

  return {
    level: score,
    height,
    hasHighLevel: score >= 70,
    hasLayered: hasInterfaces && hasClasses,
    hasProperHierarchy: hasExtends || hasImplements,
    hasNoFlatness: flatnessCount === 0,
    hasStructured: hasInterfaces || hasTypes,
    hasNoSpaghetti: tanglementCount === 0,
    hasAbstracted: hasAbstract || hasGenerics,
    hasNoTanglement: tanglementCount === 0,
    hasOrganized: hasNamespaces || hasDecorators,
    hasNoChaos: flatnessCount === 0 && tanglementCount === 0,
    flatnessCount,
    tanglementCount,
  }
}

// ─── Measure Risky (code disconnect from practice) ──────────────────────────

/** @example measureRisky(content) returns RiskyMeasure */
export function measureRisky(content: string): RiskyMeasure {
  let score = 0
  const hasTests = /\bdescribe\b|\bit\s*\(|\btest\s*\(/.test(content)
  const hasAssertions = /\bexpect\b|\bassert\b/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content)
  const hasConsoleLog = /\bconsole\.log\b/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasFunctions = /\bfunction\b/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasClasses = /\bclass\b/.test(content)
  const hasInterfaces = /\binterface\b/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)

  if (!hasTests) score += 15
  if (!hasAssertions) score += 10
  if (!hasErrorHandling) score += 10
  if (hasConsoleLog) score += 8
  if (!hasExports) score += 7
  if (!hasFunctions) score += 5
  if (!hasAsync) score += 5
  if (!hasImports) score += 8
  if (!hasClasses) score += 5
  if (!hasInterfaces) score += 7
  if (!hasTypes) score += 10
  if (!hasJSDoc) score += 10
  score = Math.min(100, score)

  const overEngineeringPatterns = [/\babstract\s+class\b/, /\bextends\b.*\bextends\b/]
  const fantasyPatterns = [/\bTODO\b/, /\bFIXME\b/]
  const overEngineeringCount = overEngineeringPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)
  const fantasyCount = fantasyPatterns.reduce((c, p) => c + (p.test(content) ? 1 : 0), 0)

  let danger: RiskyMeasure['danger'] = 'cloud-cuckoo'
  if (score <= 20) danger = 'pragmatic-balance'
  else if (score <= 35) danger = 'minor-ivory'
  else if (score <= 50) danger = 'moderate-tower'
  else if (score <= 65) danger = 'significant-tower'
  else if (score <= 80) danger = 'ivory-fortress'

  return {
    disconnect: score,
    danger,
    hasHighDisconnect: score >= 70,
    hasPractical: hasTests || hasErrorHandling,
    hasNoOverEngineering: overEngineeringCount === 0,
    hasRealWorld: hasExports && hasFunctions,
    hasNoSpeculative: fantasyCount === 0,
    hasGrounded: hasTests && hasAssertions,
    hasNoFantasy: fantasyCount === 0,
    hasTested: hasTests,
    hasNoUntested: hasTests,
    hasUseful: hasExports || hasFunctions,
    overEngineeringCount,
    fantasyCount,
  }
}

// ─── classifyCondition ──────────────────────────────────────────────────────

/** @example classifyCondition(score) returns condition string */
export function classifyCondition(score: number): TowerLevel['condition'] {
  if (score >= 90) return 'enlightened-tower'
  if (score >= 75) return 'scholarly-retreat'
  if (score >= 60) return 'balanced-observatory'
  if (score >= 45) return 'ivory-isolation'
  if (score >= 30) return 'disconnected-spire'
  return 'ruined-tower'
}

// ─── classifyFloorType ──────────────────────────────────────────────────────

/** @example classifyFloorType(levels) returns floor type string */
export function classifyFloorType(levels: TowerLevel[]): TowerFloor['floorType'] {
  if (levels.length === 0) return 'empty-room'
  const avg = levels.reduce((s, l) => s + l.qualityScore, 0) / levels.length
  const enlightenedCount = levels.filter((l) => l.condition === 'enlightened-tower').length
  const ratio = enlightenedCount / levels.length
  if (avg >= 80 && ratio >= 0.5) return 'grand-university'
  if (avg >= 70) return 'research-institute'
  if (avg >= 55) return 'think-tank'
  if (avg >= 40) return 'study-room'
  if (avg >= 25) return 'closet-office'
  return 'empty-room'
}

// ─── classifyScholarGrade ───────────────────────────────────────────────────

/** @example classifyScholarGrade(avg) returns grade string */
export function classifyScholarGrade(avg: number): IvoryTowerResult['stats']['scholarGrade'] {
  if (avg >= 80) return 'nobel-laureate'
  if (avg >= 65) return 'full-professor'
  if (avg >= 50) return 'associate-professor'
  if (avg >= 35) return 'adjunct'
  if (avg >= 20) return 'teaching-assistant'
  return 'undergraduate'
}

// ─── classifyFloorCondition ─────────────────────────────────────────────────

/** @example classifyFloorCondition(avg) returns condition string */
export function classifyFloorCondition(avg: number): TowerFloor['condition'] {
  if (avg >= 80) return 'tower-of-wisdom'
  if (avg >= 65) return 'center-of-learning'
  if (avg >= 50) return 'proper-institution'
  if (avg >= 35) return 'struggling-academy'
  if (avg >= 20) return 'crumbling-tower'
  return 'ruins'
}

// ─── analyzeTowerLevel ──────────────────────────────────────────────────────

/** @example analyzeTowerLevel(content, filePath) returns TowerLevel */
export function analyzeTowerLevel(content: string, filePath: string): TowerLevel {
  const abstract = measureAbstract(content)
  const isolated = measureIsolated(content)
  const pure = measurePure(content)
  const scholarly = measureScholarly(content)
  const elevated = measureElevated(content)
  const risky = measureRisky(content)

  const abstraction = abstract.separation
  const isolation = isolated.independence
  const theoreticalPurity = pure.correctness
  const scholarlyDepth = scholarly.depth
  const elevation = elevated.level
  const isolationRisk = risky.disconnect

  const qualityScore = Math.round(
    abstraction * 0.2 +
    isolation * 0.15 +
    theoreticalPurity * 0.15 +
    scholarlyDepth * 0.2 +
    elevation * 0.15 +
    (100 - isolationRisk) * 0.15,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    abstraction,
    isolation,
    theoreticalPurity,
    scholarlyDepth,
    elevation,
    isolationRisk,
    abstract,
    isolated,
    pure,
    scholarly,
    elevated,
    risky,
    condition,
    qualityScore,
  }
}

// ─── analyzeTowerFloor ──────────────────────────────────────────────────────

/** @example analyzeTowerFloor(levels, dirPath) returns TowerFloor */
export function analyzeTowerFloor(levels: TowerLevel[], dirPath: string): TowerFloor {
  if (levels.length === 0) {
    return {
      directory: dirPath,
      levels,
      avgAbstraction: 0,
      avgPurity: 0,
      avgScholarly: 0,
      enlightenedCount: 0,
      ruinedCount: 0,
      scholarlyCount: 0,
      balancedCount: 0,
      floorType: 'empty-room',
      condition: 'ruins',
    }
  }

  const avgAbstraction = Math.round(levels.reduce((s, l) => s + l.abstraction, 0) / levels.length)
  const avgPurity = Math.round(levels.reduce((s, l) => s + l.theoreticalPurity, 0) / levels.length)
  const avgScholarly = Math.round(levels.reduce((s, l) => s + l.scholarlyDepth, 0) / levels.length)
  const enlightenedCount = levels.filter((l) => l.condition === 'enlightened-tower').length
  const ruinedCount = levels.filter((l) => l.condition === 'ruined-tower').length
  const scholarlyCount = levels.filter((l) => l.condition === 'scholarly-retreat').length
  const balancedCount = levels.filter((l) => l.condition === 'balanced-observatory').length
  const floorType = classifyFloorType(levels)
  const overallAvg = Math.round(levels.reduce((s, l) => s + l.qualityScore, 0) / levels.length)
  const condition = classifyFloorCondition(overallAvg)

  return {
    directory: dirPath,
    levels,
    avgAbstraction,
    avgPurity,
    avgScholarly,
    enlightenedCount,
    ruinedCount,
    scholarlyCount,
    balancedCount,
    floorType,
    condition,
  }
}

// ─── generateRecommendations ────────────────────────────────────────────────

/** @example generateRecommendations(levels, floors, campus, stats) returns string[] */
export function generateRecommendations(
  levels: TowerLevel[],
  floors: TowerFloor[],
  campus: IvoryTowerResult['campus'],
  stats: IvoryTowerResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgAbstraction < 40) {
    recs.push('Improve code abstraction with interfaces, generics, and proper type hierarchies')
  }
  if (stats.avgIsolation < 30) {
    recs.push('Reduce coupling with private access modifiers, clear exports, and encapsulation')
  }
  if (stats.avgTheoreticalPurity < 40) {
    recs.push('Strengthen type safety with strict types, const declarations, and null safety')
  }
  if (stats.avgScholarlyDepth < 30) {
    recs.push('Add JSDoc with @param, @returns, and @example for better documentation')
  }
  if (stats.avgElevation < 40) {
    recs.push('Increase abstraction levels with interfaces, generics, and extends/implements')
  }
  if (stats.avgIsolationRisk > 60) {
    recs.push('Reduce isolation risk — add tests, error handling, and practical implementations')
  }
  if (campus.overallElevation < 50) {
    recs.push('Overall elevation is low — invest in abstraction quality and documentation')
  }
  if (stats.ruinedTowerCount > stats.totalFiles * 0.3) {
    recs.push('Too many ruined-tower files — refactor to improve code quality fundamentals')
  }
  if (recs.length === 0) {
    recs.push('Code tower quality is excellent — maintain current scholarly standards')
  }

  return recs
}

// ─── buildIvoryTowerResult ──────────────────────────────────────────────────

/** @example buildIvoryTowerResult(files, contents) returns IvoryTowerResult */
export function buildIvoryTowerResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): IvoryTowerResult {
  const levels = files.map((file, i) => analyzeTowerLevel(contents[i] ?? '', file))

  const dirMap = new Map<string, TowerLevel[]>()
  levels.forEach((level) => {
    const parts = level.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(level)
    } else {
      dirMap.set(dir, [level])
    }
  })

  const floors = Array.from(dirMap.entries()).map(
    ([dir, dirLevels]) => analyzeTowerFloor(dirLevels, dir),
  )

  const totalFiles = levels.length
  const avgAbstraction = totalFiles > 0 ? Math.round(levels.reduce((s, l) => s + l.abstraction, 0) / totalFiles) : 0
  const avgIsolation = totalFiles > 0 ? Math.round(levels.reduce((s, l) => s + l.isolation, 0) / totalFiles) : 0
  const avgTheoreticalPurity = totalFiles > 0 ? Math.round(levels.reduce((s, l) => s + l.theoreticalPurity, 0) / totalFiles) : 0
  const avgScholarlyDepth = totalFiles > 0 ? Math.round(levels.reduce((s, l) => s + l.scholarlyDepth, 0) / totalFiles) : 0
  const avgElevation = totalFiles > 0 ? Math.round(levels.reduce((s, l) => s + l.elevation, 0) / totalFiles) : 0
  const avgIsolationRisk = totalFiles > 0 ? Math.round(levels.reduce((s, l) => s + l.isolationRisk, 0) / totalFiles) : 0

  const overallElevation = totalFiles > 0
    ? Math.round(levels.reduce((s, l) => s + l.qualityScore, 0) / totalFiles)
    : 0

  const avgPure = totalFiles > 0
    ? Math.round(levels.reduce((s, l) => s + l.theoreticalPurity, 0) / totalFiles)
    : 0
  const avgSchol = totalFiles > 0
    ? Math.round(levels.reduce((s, l) => s + l.scholarlyDepth, 0) / totalFiles)
    : 0

  const campus: IvoryTowerResult['campus'] = {
    avgAbstraction,
    avgPurity: avgPure,
    avgScholarly: avgSchol,
    isEnlightened: avgAbstraction >= 60,
    overallElevation,
  }

  const findBest = (fn: (l: TowerLevel) => number): string => {
    if (levels.length === 0) return ''
    const best = levels.reduce((a, b) => fn(a) >= fn(b) ? a : b)
    return best.file
  }

  const stats: IvoryTowerResult['stats'] = {
    totalFiles,
    totalFloors: floors.length,
    avgAbstraction,
    avgIsolation,
    avgTheoreticalPurity,
    avgScholarlyDepth,
    avgElevation,
    avgIsolationRisk,
    enlightenedTowerCount: levels.filter((l) => l.condition === 'enlightened-tower').length,
    scholarlyRetreatCount: levels.filter((l) => l.condition === 'scholarly-retreat').length,
    balancedObservatoryCount: levels.filter((l) => l.condition === 'balanced-observatory').length,
    ivoryIsolationCount: levels.filter((l) => l.condition === 'ivory-isolation').length,
    disconnectedSpireCount: levels.filter((l) => l.condition === 'disconnected-spire').length,
    ruinedTowerCount: levels.filter((l) => l.condition === 'ruined-tower').length,
    hasHighSeparationCount: levels.filter((l) => l.abstract.hasHighSeparation).length,
    hasHighIndependenceCount: levels.filter((l) => l.isolated.hasHighIndependence).length,
    hasHighCorrectnessCount: levels.filter((l) => l.pure.hasHighCorrectness).length,
    hasHighDepthCount: levels.filter((l) => l.scholarly.hasHighDepth).length,
    hasHighLevelCount: levels.filter((l) => l.elevated.hasHighLevel).length,
    hasHighDisconnectCount: levels.filter((l) => l.risky.hasHighDisconnect).length,
    overallElevation,
    scholarGrade: classifyScholarGrade(overallElevation),
    bestLevel: findBest((l) => l.qualityScore),
    mostAbstract: findBest((l) => l.abstraction),
    mostIndependent: findBest((l) => l.isolation),
    mostPure: findBest((l) => l.theoreticalPurity),
    bestDocumented: findBest((l) => l.scholarlyDepth),
    mostElevated: findBest((l) => l.elevation),
  }

  const recommendations = generateRecommendations(levels, floors, campus, stats)

  return { levels, floors, campus, stats, recommendations }
}
