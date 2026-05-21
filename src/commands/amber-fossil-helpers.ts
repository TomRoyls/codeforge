// ─── Interfaces ──────────────────────────────────────────

export interface AmberMeasure {
  color: 'golden' | 'cognac' | 'butterscotch' | 'cherry' | 'green' | 'blue' | 'milky' | 'black'
  clarity: number
  isTransparent: boolean
  isTranslucent: boolean
  isOpaque: boolean
  hasInclusions: boolean
  hasBubbles: boolean
  hasCracks: boolean
  hasCloudiness: boolean
  crackCount: number
  bubbleCount: number
  inclusionCount: number
}

export interface FossilMeasure {
  type: 'mosquito' | 'spider' | 'ant' | 'flower' | 'feather' | 'leaf' | 'beetle' | 'scorpion'
  quality: number
  isComplete: boolean
  isFragmentary: boolean
  isWellPreserved: boolean
  isDeteriorating: boolean
  hasSoftTissue: boolean
  hasMineralization: boolean
  completeness: number
}

export interface PreservationMeasure {
  state: number
  isPerfectlyPreserved: boolean
  isWellPreserved: boolean
  isDeteriorating: boolean
  isFossilized: boolean
  hasConservationNeeded: boolean
  hasActiveDecay: boolean
  isFrozenInTime: boolean
}

export interface InclusionMeasure {
  count: number
  types: string[]
  hasAncientPatterns: boolean
  hasModernPatterns: boolean
  hasDeprecatedPatterns: boolean
  hasAntiPatterns: boolean
  hasWorkarounds: boolean
  ancientCount: number
  deprecatedCount: number
  antiPatternCount: number
  workaroundCount: number
}

export interface AgeMeasure {
  estimation: number
  epoch: 'precambrian' | 'paleozoic' | 'mesozoic' | 'cenozoic' | 'modern' | 'cutting-edge'
  isAncient: boolean
  isMature: boolean
  isRecent: boolean
  isDated: boolean
  hasEvolution: boolean
  hasStasis: boolean
}

export interface ExtractionMeasure {
  difficulty: number
  isEasyToExtract: boolean
  isDifficultToExtract: boolean
  hasDependencies: boolean
  hasFragileConnections: boolean
  hasSolidMatrix: boolean
  hasDissolvableMatrix: boolean
  dependencyCount: number
  fragileCount: number
}

export interface AmberSpecimen {
  file: string
  amberClarity: number
  fossilQuality: number
  preservationState: number
  inclusionsCount: number
  ageEstimation: number
  extractionDifficulty: number
  amber: AmberMeasure
  fossil: FossilMeasure
  preservation: PreservationMeasure
  inclusion: InclusionMeasure
  age: AgeMeasure
  extraction: ExtractionMeasure
  condition: 'pristine-amber' | 'clear-specimen' | 'good-fossil' | 'cloudy-amber' | 'cracked-specimen' | 'decayed-remains'
  qualityScore: number
}

export interface AmberDeposit {
  directory: string
  specimens: AmberSpecimen[]
  avgClarity: number
  avgPreservation: number
  avgAge: number
  pristineCount: number
  decayedCount: number
  ancientCount: number
  modernCount: number
  depositType: 'baltic-sea' | 'dominican-mine' | 'burmese-deposit' | 'mexican-quarry' | 'surface-find' | 'barren-ground'
  condition: 'museum-collection' | 'research-collection' | 'collector-stash' | 'beach-combing' | 'scrap-pile' | 'empty-quarry'
}

export interface MuseumMeasure {
  avgClarity: number
  avgPreservation: number
  avgAge: number
  isWellCurated: boolean
  overallPreservation: number
}

export interface AmberFossilStats {
  totalFiles: number
  totalDeposits: number
  avgAmberClarity: number
  avgFossilQuality: number
  avgPreservationState: number
  avgInclusionsCount: number
  avgAgeEstimation: number
  avgExtractionDifficulty: number
  pristineAmberCount: number
  clearSpecimenCount: number
  goodFossilCount: number
  cloudyAmberCount: number
  crackedSpecimenCount: number
  decayedRemainsCount: number
  goldenCount: number
  cognacCount: number
  milkyCount: number
  blackColor: number
  isCompleteCount: number
  isFragmentaryCount: number
  isWellPreservedCount: number
  isDeterioratingCount: number
  ancientPatternsCount: number
  deprecatedCount: number
  antiPatternCount: number
  workaroundCount: number
  isAncientCount: number
  isMatureCount: number
  isRecentCount: number
  isEasyToExtractCount: number
  isDifficultToExtractCount: number
  overallPreservation: number
  paleontologistGrade: 'chief-paleontologist' | 'paleontologist' | 'archaeologist' | 'collector' | 'tourist' | 'grave-robber'
  clearestSpecimen: string
  bestPreserved: string
  mostAncient: string
  mostModern: string
  easiestToExtract: string
}

export interface AmberFossilResult {
  specimens: AmberSpecimen[]
  deposits: AmberDeposit[]
  museum: MuseumMeasure
  stats: AmberFossilStats
  recommendations: string[]
}

// ─── Utility helpers ────────────────────────────────────

export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

export function countEnums(content: string): number {
  const m = content.match(/\benum\s+\w+/g)
  return m ? m.length : 0
}

export function countTypes(content: string): number {
  const m = content.match(/\btype\s+\w+\s*=/g)
  return m ? m.length : 0
}

export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

export function countComments(content: string): number {
  const line = (content.match(/\/\/.*/g) || []).length
  const block = (content.match(/\/\*[\s\S]*?\*\//g) || []).length
  return line + block
}

export function countErrorHandling(content: string): number {
  const m = content.match(/\b(catch|finally|throw)\b/g)
  return m ? m.length : 0
}

export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:number|string|boolean|void|any|unknown|never|object)\b/g)
  return m ? m.length : 0
}

export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b/gi)
  return m ? m.length : 0
}

export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

export function countBranches(content: string): number {
  const ifs = (content.match(/\bif\b/g) || []).length
  const switches = (content.match(/\bswitch\b/g) || []).length
  const ternaries = (content.match(/\?[^:]*:/g) || []).length
  return ifs + switches + ternaries
}

export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

export function countReturnTypes(content: string): number {
  const m = content.match(/\)\s*:\s*\w+/g)
  return m ? m.length : 0
}

export function countDeprecated(content: string): number {
  const m = content.match(/\bdeprecated\b|\@deprecated/gi)
  return m ? m.length : 0
}

export function countAsync(content: string): number {
  const m = content.match(/\basync\b/g)
  return m ? m.length : 0
}

export function countAny(content: string): number {
  const m = content.match(/:\s*any\b/g)
  return m ? m.length : 0
}

export function countGenerics(content: string): number {
  const m = content.match(/<\w+>/g)
  return m ? m.length : 0
}

export function countNestingDepth(content: string): number {
  let maxDepth = 0
  let currentDepth = 0
  for (const ch of content) {
    if (ch === '{' || ch === '(' || ch === '[') {
      currentDepth++
      if (currentDepth > maxDepth) maxDepth = currentDepth
    } else if (ch === '}' || ch === ')' || ch === ']') {
      currentDepth = Math.max(0, currentDepth - 1)
    }
  }
  return maxDepth
}

// ─── Amber Measurement ──────────────────────────────────

/**
 * Measure code transparency like amber clarity
 * @example
 * measureAmber(codeString) // { color, clarity, isTransparent, ... }
 */
export function measureAmber(content: string): AmberMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const todos = countTodos(content)
  const consoles = countConsole(content)
  const anys = countAny(content)

  const clarity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (comments > 0 ? 10 : 0) +
    (types > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (countReturnTypes(content) > 0 ? 10 : 0) +
    (todos === 0 ? 10 : 0),
  )))

  const isTransparent = clarity >= 70
  const isOpaque = clarity < 30 && loc > 0
  const isTranslucent = !isTransparent && !isOpaque

  const crackCount = todos + countDeprecated(content)
  const bubbleCount = consoles + anys
  const inclusionCount = countFunctions(content) + countClasses(content) + countInterfaces(content) + countEnums(content) + countTypes(content)

  const hasInclusions = inclusionCount > 0
  const hasBubbles = bubbleCount > 0
  const hasCracks = crackCount > 0
  const hasCloudiness = comments === 0 && jsdoc === 0 && loc > 10

  let color: AmberMeasure['color'] = 'golden'
  if (isOpaque) color = 'black'
  else if (hasCloudiness) color = 'milky'
  else if (countAsync(content) > 0 && clarity >= 50) color = 'blue'
  else if (countGenerics(content) > 0 && clarity >= 60) color = 'green'
  else if (hasCracks && !isOpaque) color = 'cherry'
  else if (clarity >= 60) color = 'cognac'
  else if (clarity >= 40) color = 'butterscotch'
  else color = 'milky'

  return {
    color,
    clarity,
    isTransparent,
    isTranslucent,
    isOpaque,
    hasInclusions,
    hasBubbles,
    hasCracks,
    hasCloudiness,
    crackCount,
    bubbleCount,
    inclusionCount,
  }
}

// ─── Fossil Measurement ─────────────────────────────────

/**
 * Measure legacy code quality like a fossil
 * @example
 * measureFossil(codeString) // { type, quality, isComplete, ... }
 */
export function measureFossil(content: string): FossilMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)

  const quality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (exports > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (errors > 0 ? 15 : 0) +
    (functions > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const completeness = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (functions > 0 || classes > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0),
  )))

  const isComplete = completeness >= 70
  const isFragmentary = completeness < 40 && loc > 0
  const isWellPreserved = quality >= 60 && countTodos(content) === 0
  const isDeteriorating = countTodos(content) > 0 || countDeprecated(content) > 0
  const hasSoftTissue = countAsync(content) > 0 || countBranches(content) > 3
  const hasMineralization = classes > 0 && interfaces > 0

  let type: FossilMeasure['type'] = 'leaf'
  if (functions > 5 && classes === 0) type = 'ant'
  else if (classes > 0 && errors > 0) type = 'beetle'
  else if (hasSoftTissue && errors === 0) type = 'mosquito'
  else if (interfaces > 0 && classes > 0) type = 'spider'
  else if (countAsync(content) > 0) type = 'scorpion'
  else if (countJSDoc(content) > 0 && exports > 0) type = 'flower'
  else if (classes > 0) type = 'feather'

  return {
    type,
    quality,
    isComplete,
    isFragmentary,
    isWellPreserved,
    isDeteriorating,
    hasSoftTissue,
    hasMineralization,
    completeness,
  }
}

// ─── Preservation Measurement ───────────────────────────

/**
 * Measure code maintenance level
 * @example
 * measurePreservation(codeString) // { state, isPerfectlyPreserved, ... }
 */
export function measurePreservation(content: string): PreservationMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const todos = countTodos(content)
  const deprecated = countDeprecated(content)

  const state = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (todos === 0 ? 15 : 0) +
    (deprecated === 0 ? 10 : 0) +
    (countInterfaces(content) > 0 ? 10 : 0) +
    (countExports(content) > 0 ? 10 : 0),
  )))

  const isPerfectlyPreserved = state >= 80 && todos === 0 && deprecated === 0
  const isWellPreserved = state >= 60 && todos === 0
  const isDeteriorating = todos > 0 || deprecated > 0
  const isFossilized = loc > 0 && countComments(content) === 0 && countJSDoc(content) === 0 && countExports(content) === 0
  const hasConservationNeeded = state < 50 && loc > 0
  const hasActiveDecay = deprecated > 0 || (todos > 3)
  const isFrozenInTime = loc > 0 && types === 0 && jsdoc === 0 && exports === 0

  return {
    state,
    isPerfectlyPreserved,
    isWellPreserved,
    isDeteriorating,
    isFossilized,
    hasConservationNeeded,
    hasActiveDecay,
    isFrozenInTime,
  }
}

// ─── Inclusion Measurement ──────────────────────────────

/**
 * Measure embedded code patterns
 * @example
 * measureInclusion(codeString) // { count, types, hasAncientPatterns, ... }
 */
export function measureInclusion(content: string): InclusionMeasure {
  const types: string[] = []
  if (countFunctions(content) > 0) types.push('function')
  if (countClasses(content) > 0) types.push('class')
  if (countInterfaces(content) > 0) types.push('interface')
  if (countEnums(content) > 0) types.push('enum')
  if (countTypes(content) > 0) types.push('type-alias')
  if (countExports(content) > 0) types.push('export')
  if (countImports(content) > 0) types.push('import')
  if (countAsync(content) > 0) types.push('async')
  if (countGenerics(content) > 0) types.push('generic')

  const deprecatedCount = countDeprecated(content)
  const workaroundCount = countTodos(content) + countConsole(content)
  const anyCount = countAny(content)
  const antiPatternCount = anyCount + (countNestingDepth(content) > 5 ? 1 : 0)

  const hasAncientPatterns = countNestingDepth(content) > 4 || anyCount > 0
  const hasModernPatterns = countGenerics(content) > 0 || countAsync(content) > 0
  const hasDeprecatedPatterns = deprecatedCount > 0
  const hasAntiPatterns = antiPatternCount > 0
  const hasWorkarounds = workaroundCount > 0

  const ancientCount = (hasAncientPatterns ? 1 : 0) + anyCount

  return {
    count: types.length,
    types: Array.from(new Set(types)),
    hasAncientPatterns,
    hasModernPatterns,
    hasDeprecatedPatterns,
    hasAntiPatterns,
    hasWorkarounds,
    ancientCount,
    deprecatedCount,
    antiPatternCount,
    workaroundCount,
  }
}

// ─── Age Measurement ────────────────────────────────────

/**
 * Measure code maturity
 * @example
 * measureAge(codeString) // { estimation, epoch, isAncient, ... }
 */
export function measureAge(content: string): AgeMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const generics = countGenerics(content)
  const asyncs = countAsync(content)
  const anys = countAny(content)
  const deprecated = countDeprecated(content)

  const estimation = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 10 : 0) +
    (types > 0 ? 10 : 0) +
    (exports > 0 ? 10 : 0) +
    (imports > 0 ? 10 : 0) +
    (anys * 15) +
    (deprecated * 20) +
    (loc > 50 ? 10 : 0) +
    (countBranches(content) > 5 ? 10 : 0) +
    (countNestingDepth(content) > 3 ? 10 : 0) +
    (countComments(content) === 0 && loc > 10 ? 10 : 0),
  )))

  let epoch: AgeMeasure['epoch'] = 'modern'
  if (estimation >= 80) epoch = 'precambrian'
  else if (estimation >= 60) epoch = 'paleozoic'
  else if (estimation >= 40) epoch = 'mesozoic'
  else if (estimation >= 25) epoch = 'cenozoic'
  else if (generics > 0 || asyncs > 0) epoch = 'cutting-edge'
  else epoch = 'modern'

  const isAncient = estimation >= 70
  const isMature = estimation >= 40 && estimation < 70
  const isRecent = estimation < 25
  const isDated = anys > 0 || deprecated > 0
  const hasEvolution = jsdoc > 0 && types > 0 && (deprecated > 0 || countTodos(content) > 0)
  const hasStasis = loc > 0 && exports === 0 && imports === 0 && jsdoc === 0

  return {
    estimation,
    epoch,
    isAncient,
    isMature,
    isRecent,
    isDated,
    hasEvolution,
    hasStasis,
  }
}

// ─── Extraction Measurement ─────────────────────────────

/**
 * Measure refactoring difficulty
 * @example
 * measureExtraction(codeString) // { difficulty, isEasyToExtract, ... }
 */
export function measureExtraction(content: string): ExtractionMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const branches = countBranches(content)
  const nesting = countNestingDepth(content)
  const globals = (content.match(/^(?:const|let|var)\s+\w+/gm) || []).length

  const difficulty = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (nesting * 8) +
    (branches * 5) +
    (functions > 10 ? 10 : 0) +
    (imports > 5 ? 10 : 0) +
    (globals > 5 ? 10 : 0) +
    (countAny(content) * 15) +
    (classes > 0 && exports === 0 ? 10 : 0),
  )))

  const dependencyCount = imports + exports
  const fragileCount = countAny(content) + (nesting > 4 ? 1 : 0)

  const isEasyToExtract = difficulty < 30 && loc > 0
  const isDifficultToExtract = difficulty >= 60
  const hasDependencies = dependencyCount > 0
  const hasFragileConnections = fragileCount > 0
  const hasSolidMatrix = classes > 0 && countInterfaces(content) > 0
  const hasDissolvableMatrix = functions > 0 && exports > 0 && countErrorHandling(content) > 0

  return {
    difficulty,
    isEasyToExtract,
    isDifficultToExtract,
    hasDependencies,
    hasFragileConnections,
    hasSolidMatrix,
    hasDissolvableMatrix,
    dependencyCount,
    fragileCount,
  }
}

// ─── Specimen Analysis ──────────────────────────────────

/**
 * Analyze a single file as amber specimen
 * @example
 * analyzeAmberSpecimen(content, filePath) // AmberSpecimen
 */
export function analyzeAmberSpecimen(content: string, filePath: string): AmberSpecimen {
  const amber = measureAmber(content)
  const fossil = measureFossil(content)
  const preservation = measurePreservation(content)
  const inclusion = measureInclusion(content)
  const age = measureAge(content)
  const extraction = measureExtraction(content)

  const amberClarity = amber.clarity
  const fossilQuality = fossil.quality
  const preservationState = preservation.state
  const inclusionsCount = inclusion.count
  const ageEstimation = age.estimation
  const extractionDifficulty = extraction.difficulty

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (amberClarity * 0.2) +
    (fossilQuality * 0.2) +
    (preservationState * 0.2) +
    ((100 - extractionDifficulty) * 0.15) +
    (fossil.completeness * 0.15) +
    ((100 - ageEstimation) * 0.1),
  )))

  const condition = classifySpecimenCondition(qualityScore, amber, preservation)

  return {
    file: filePath,
    amberClarity,
    fossilQuality,
    preservationState,
    inclusionsCount,
    ageEstimation,
    extractionDifficulty,
    amber,
    fossil,
    preservation,
    inclusion,
    age,
    extraction,
    condition,
    qualityScore,
  }
}

/**
 * Classify specimen condition
 * @example
 * classifySpecimenCondition(90, amber, preservation) // 'pristine-amber'
 */
export function classifySpecimenCondition(
  score: number,
  amber: AmberMeasure,
  preservation: PreservationMeasure,
): AmberSpecimen['condition'] {
  if (score >= 80 && amber.isTransparent && preservation.isPerfectlyPreserved) return 'pristine-amber'
  if (score >= 65 && amber.isTransparent) return 'clear-specimen'
  if (score >= 50) return 'good-fossil'
  if (score >= 30 && !preservation.hasActiveDecay) return 'cloudy-amber'
  if (score >= 15) return 'cracked-specimen'
  return 'decayed-remains'
}

// ─── Deposit Analysis ───────────────────────────────────

/**
 * Analyze a directory as amber deposit
 * @example
 * analyzeAmberDeposit(specimens, dirPath) // AmberDeposit
 */
export function analyzeAmberDeposit(specimens: AmberSpecimen[], dirPath: string): AmberDeposit {
  const count = specimens.length
  if (count === 0) {
    return {
      directory: dirPath,
      specimens: [],
      avgClarity: 0,
      avgPreservation: 0,
      avgAge: 0,
      pristineCount: 0,
      decayedCount: 0,
      ancientCount: 0,
      modernCount: 0,
      depositType: 'barren-ground',
      condition: 'empty-quarry',
    }
  }

  const avgClarity = Math.round(specimens.reduce((s, sp) => s + sp.amberClarity, 0) / count)
  const avgPreservation = Math.round(specimens.reduce((s, sp) => s + sp.preservationState, 0) / count)
  const avgAge = Math.round(specimens.reduce((s, sp) => s + sp.ageEstimation, 0) / count)

  const pristineCount = specimens.filter(s => s.condition === 'pristine-amber').length
  const decayedCount = specimens.filter(s => s.condition === 'decayed-remains').length
  const ancientCount = specimens.filter(s => s.age.isAncient).length
  const modernCount = specimens.filter(s => s.age.isRecent).length

  const depositType = classifyDepositType(specimens, avgClarity)
  const condition = classifyDepositCondition(avgClarity)

  return {
    directory: dirPath,
    specimens,
    avgClarity,
    avgPreservation,
    avgAge,
    pristineCount,
    decayedCount,
    ancientCount,
    modernCount,
    depositType,
    condition,
  }
}

/**
 * Classify deposit type
 * @example
 * classifyDepositType(specimens, 70) // 'baltic-sea'
 */
export function classifyDepositType(specimens: AmberSpecimen[], avgClarity: number): AmberDeposit['depositType'] {
  if (specimens.length === 0) return 'barren-ground'
  const pristineRatio = specimens.filter(s => s.condition === 'pristine-amber').length / specimens.length

  if (pristineRatio >= 0.5 && avgClarity >= 70) return 'baltic-sea'
  if (avgClarity >= 55) return 'dominican-mine'
  if (avgClarity >= 40) return 'burmese-deposit'
  if (avgClarity >= 25) return 'mexican-quarry'
  if (avgClarity >= 10) return 'surface-find'
  return 'barren-ground'
}

/**
 * Classify deposit condition
 * @example
 * classifyDepositCondition(80) // 'museum-collection'
 */
export function classifyDepositCondition(avgClarity: number): AmberDeposit['condition'] {
  if (avgClarity >= 75) return 'museum-collection'
  if (avgClarity >= 60) return 'research-collection'
  if (avgClarity >= 45) return 'collector-stash'
  if (avgClarity >= 30) return 'beach-combing'
  if (avgClarity >= 15) return 'scrap-pile'
  return 'empty-quarry'
}

// ─── Paleontologist Grade ───────────────────────────────

/**
 * Classify paleontologist grade
 * @example
 * classifyPaleontologistGrade(90) // 'chief-paleontologist'
 */
export function classifyPaleontologistGrade(avgPreservation: number): AmberFossilStats['paleontologistGrade'] {
  if (avgPreservation >= 80) return 'chief-paleontologist'
  if (avgPreservation >= 65) return 'paleontologist'
  if (avgPreservation >= 50) return 'archaeologist'
  if (avgPreservation >= 35) return 'collector'
  if (avgPreservation >= 20) return 'tourist'
  return 'grave-robber'
}

// ─── Recommendations ────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(specimens, deposits, museum, stats) // ['Add JSDoc...']
 */
export function generateRecommendations(
  specimens: AmberSpecimen[],
  _deposits: AmberDeposit[],
  _museum: MuseumMeasure,
  stats: AmberFossilStats,
): string[] {
  const recs: string[] = []

  if (stats.decayedRemainsCount > 0) {
    recs.push('Excavate decayed remains: add documentation, types, and error handling')
  }
  if (stats.avgAmberClarity < 40) {
    recs.push('Improve amber clarity with JSDoc documentation and type annotations')
  }
  if (stats.deprecatedCount > 0) {
    recs.push('Remove deprecated patterns trapped in the amber')
  }
  if (stats.antiPatternCount > 0) {
    recs.push('Clean anti-patterns: replace any types and reduce nesting depth')
  }
  if (stats.isDeterioratingCount > stats.totalFiles * 0.3) {
    recs.push('Apply conservation: resolve TODOs to prevent further deterioration')
  }
  if (stats.avgExtractionDifficulty > 60) {
    recs.push('Reduce extraction difficulty by refactoring deep nesting and tangled dependencies')
  }
  if (stats.workaroundCount > stats.totalFiles * 0.3) {
    recs.push('Replace workaround code with proper solutions')
  }

  if (recs.length === 0) {
    recs.push('Maintain current preservation standards for the collection')
  }

  return recs
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * Build the full amber fossil result
 * @example
 * buildAmberFossilResult(files, contents, {}) // AmberFossilResult
 */
export function buildAmberFossilResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown> = {},
): AmberFossilResult {
  const specimens: AmberSpecimen[] = files.map((file, i) =>
    analyzeAmberSpecimen(contents[i] ?? '', file),
  )

  const depositMap = new Map<string, AmberSpecimen[]>()
  for (const sp of specimens) {
    const dir = sp.file.includes('/') ? sp.file.substring(0, sp.file.lastIndexOf('/')) : '.'
    const existing = depositMap.get(dir)
    if (existing) {
      existing.push(sp)
    } else {
      depositMap.set(dir, [sp])
    }
  }

  const deposits: AmberDeposit[] = Array.from(depositMap.entries()).map(([dir, dSpecs]) =>
    analyzeAmberDeposit(dSpecs, dir),
  )

  const totalFiles = specimens.length
  const avg = (fn: (sp: AmberSpecimen) => number) =>
    totalFiles === 0 ? 0 : Math.round(specimens.reduce((s, sp) => s + fn(sp), 0) / totalFiles)

  const museum: MuseumMeasure = {
    avgClarity: avg(sp => sp.amberClarity),
    avgPreservation: avg(sp => sp.preservationState),
    avgAge: avg(sp => sp.ageEstimation),
    isWellCurated: avg(sp => sp.preservationState) >= 60,
    overallPreservation: avg(sp => sp.qualityScore),
  }

  const overallPreservation = museum.overallPreservation

  const clearestSpecimen = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.amberClarity > best.amberClarity ? sp : best, specimens[0]).file
    : ''
  const bestPreserved = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.preservationState > best.preservationState ? sp : best, specimens[0]).file
    : ''
  const mostAncient = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.ageEstimation > best.ageEstimation ? sp : best, specimens[0]).file
    : ''
  const mostModern = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.ageEstimation < best.ageEstimation ? sp : best, specimens[0]).file
    : ''
  const easiestToExtract = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.extractionDifficulty < best.extractionDifficulty ? sp : best, specimens[0]).file
    : ''

  const stats: AmberFossilStats = {
    totalFiles,
    totalDeposits: deposits.length,
    avgAmberClarity: museum.avgClarity,
    avgFossilQuality: avg(sp => sp.fossilQuality),
    avgPreservationState: museum.avgPreservation,
    avgInclusionsCount: avg(sp => sp.inclusionsCount),
    avgAgeEstimation: museum.avgAge,
    avgExtractionDifficulty: avg(sp => sp.extractionDifficulty),
    pristineAmberCount: specimens.filter(s => s.condition === 'pristine-amber').length,
    clearSpecimenCount: specimens.filter(s => s.condition === 'clear-specimen').length,
    goodFossilCount: specimens.filter(s => s.condition === 'good-fossil').length,
    cloudyAmberCount: specimens.filter(s => s.condition === 'cloudy-amber').length,
    crackedSpecimenCount: specimens.filter(s => s.condition === 'cracked-specimen').length,
    decayedRemainsCount: specimens.filter(s => s.condition === 'decayed-remains').length,
    goldenCount: specimens.filter(s => s.amber.color === 'golden').length,
    cognacCount: specimens.filter(s => s.amber.color === 'cognac').length,
    milkyCount: specimens.filter(s => s.amber.color === 'milky').length,
    blackColor: specimens.filter(s => s.amber.color === 'black').length,
    isCompleteCount: specimens.filter(s => s.fossil.isComplete).length,
    isFragmentaryCount: specimens.filter(s => s.fossil.isFragmentary).length,
    isWellPreservedCount: specimens.filter(s => s.preservation.isWellPreserved).length,
    isDeterioratingCount: specimens.filter(s => s.preservation.isDeteriorating).length,
    ancientPatternsCount: specimens.filter(s => s.inclusion.hasAncientPatterns).length,
    deprecatedCount: specimens.reduce((s, sp) => s + sp.inclusion.deprecatedCount, 0),
    antiPatternCount: specimens.reduce((s, sp) => s + sp.inclusion.antiPatternCount, 0),
    workaroundCount: specimens.reduce((s, sp) => s + sp.inclusion.workaroundCount, 0),
    isAncientCount: specimens.filter(s => s.age.isAncient).length,
    isMatureCount: specimens.filter(s => s.age.isMature).length,
    isRecentCount: specimens.filter(s => s.age.isRecent).length,
    isEasyToExtractCount: specimens.filter(s => s.extraction.isEasyToExtract).length,
    isDifficultToExtractCount: specimens.filter(s => s.extraction.isDifficultToExtract).length,
    overallPreservation,
    paleontologistGrade: classifyPaleontologistGrade(overallPreservation),
    clearestSpecimen,
    bestPreserved,
    mostAncient,
    mostModern,
    easiestToExtract,
  }

  const recommendations = generateRecommendations(specimens, deposits, museum, stats)

  return { specimens, deposits, museum, stats, recommendations }
}
