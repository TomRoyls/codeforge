// ─── Interfaces ──────────────────────────────────────────────

export interface MazeMeasure {
  complexity: number
  pattern: 'elegant-passage' | 'structured-maze' | 'branching-tunnel' | 'chaotic-corridor' | 'dead-end-network' | 'impenetrable'
  hasLowComplexity: boolean
  hasClearPaths: boolean
  hasProperBranching: boolean
  hasNoDeadEnds: boolean
  hasProperLoops: boolean
  hasNoInfiniteRecursion: boolean
  hasLinearSegments: boolean
  hasNoSpaghetti: boolean
  hasProperGuards: boolean
  hasNoCircularPaths: boolean
  deadEndCount: number
  spaghettiCount: number
}

export interface ThreadMeasure {
  quality: number
  state: 'golden-thread' | 'guided-path' | 'marked-trail' | 'faint-trail' | 'overgrown' | 'invisible'
  hasHighQuality: boolean
  hasAriadneThread: boolean
  hasProperMarkings: boolean
  hasNoFalseLeads: boolean
  hasBreadcrumbTrail: boolean
  hasNoTangling: boolean
  hasStraightPassage: boolean
  hasNoBacktracking: boolean
  hasProgressiveDepth: boolean
  hasNoLooping: boolean
  falseLeadCount: number
  tanglingCount: number
}

export interface MinotaurMeasure {
  danger: number
  threat: 'no-monster' | 'minor-threat' | 'beast-lurks' | 'active-minotaur' | 'multi-minotaur' | 'labyrinth-king'
  hasLowDanger: boolean
  hasNoHiddenTraps: boolean
  hasProperDefenses: boolean
  hasNoSwallowedPaths: boolean
  hasSafePassage: boolean
  hasNoSurpriseAttacks: boolean
  hasProperArmor: boolean
  hasNoAmbushPoints: boolean
  hasEscapeRoutes: boolean
  hasNoDeadlyEncounters: boolean
  trapCount: number
  ambushCount: number
}

export interface ExitMeasure {
  availability: number
  clarity: 'crystal-exit' | 'marked-door' | 'dim-passage' | 'hidden-exit' | 'false-wall' | 'sealed-tomb'
  hasHighAvailability: boolean
  hasProperExits: boolean
  hasEmergencyExits: boolean
  hasNoTrappedExits: boolean
  hasProperSignage: boolean
  hasNoDeadEnds: boolean
  hasMultiplePaths: boolean
  hasNoCollapsing: boolean
  hasEscapePlan: boolean
  hasNoSealed: boolean
  trappedCount: number
  sealedCount: number
}

export interface DepthMeasure {
  level: number
  stratum: 'surface-level' | 'shallow-caves' | 'mid-labyrinth' | 'deep-passages' | 'abyss' | 'tartarus'
  hasModerateDepth: boolean
  hasProperLayering: boolean
  hasNoExcessiveNesting: boolean
  hasManageable: boolean
  hasNoCliff: boolean
  hasGradualDescent: boolean
  hasNoAbyss: boolean
  hasProperVentilation: boolean
  hasNoCollapse: boolean
  hasLightSource: boolean
  cliffCount: number
  abyssCount: number
}

export interface TheseusMeasure {
  score: number
  rank: 'master-navigator' | 'experienced-explorer' | 'competent' | 'wanderer' | 'lost' | 'doomed'
  hasHighScore: boolean
  hasClearMap: boolean
  hasNoConfusion: boolean
  hasProperGuidance: boolean
  hasNoDisorientation: boolean
  hasProgressiveDiscovery: boolean
  hasNoOverwhelming: boolean
  hasStructuredApproach: boolean
  hasNoChaos: boolean
  hasSatisfyingResolution: boolean
  confusionCount: number
  chaosCount: number
}

export interface LabyrinthChamber {
  file: string
  mazeComplexity: number
  threadQuality: number
  minotaurDanger: number
  exitAvailability: number
  architecturalDepth: number
  theseusScore: number
  maze: MazeMeasure
  thread: ThreadMeasure
  minotaur: MinotaurMeasure
  exit: ExitMeasure
  depth: DepthMeasure
  theseus: TheseusMeasure
  condition: 'grand-hall' | 'well-lit-corridor' | 'dim-passage' | 'dark-tunnel' | 'minotaur-lair' | 'bottomless-pit'
  qualityScore: number
}

export interface LabyrinthLevel {
  directory: string
  chambers: LabyrinthChamber[]
  avgComplexity: number
  avgThread: number
  avgTheseus: number
  grandHallCount: number
  pitCount: number
  navigableCount: number
  clearCount: number
  levelType: 'palace-level' | 'structured-level' | 'branching-level' | 'maze-level' | 'chaotic-level' | 'void'
  condition: 'well-mapped' | 'navigable' | 'explorable' | 'treacherous' | 'dangerous' | 'impassable'
}

export interface LabyrinthDepthsResult {
  chambers: LabyrinthChamber[]
  levels: LabyrinthLevel[]
  labyrinth: {
    avgComplexity: number
    avgThread: number
    avgTheseus: number
    isNavigable: boolean
    overallNavigability: number
  }
  stats: {
    totalFiles: number
    totalLevels: number
    avgMazeComplexity: number
    avgThreadQuality: number
    avgMinotaurDanger: number
    avgExitAvailability: number
    avgArchitecturalDepth: number
    avgTheseusScore: number
    grandHallCount: number
    wellLitCount: number
    dimPassageCount: number
    darkTunnelCount: number
    minotaurLairCount: number
    bottomlessPitCount: number
    hasLowComplexityCount: number
    hasHighQualityCount: number
    hasLowDangerCount: number
    hasHighAvailabilityCount: number
    hasModerateDepthCount: number
    hasHighScoreCount: number
    overallNavigability: number
    navigatorGrade: 'architect-king' | 'master-builder' | 'navigator' | 'explorer' | 'wanderer' | 'sacrifice'
    bestChamber: string
    simplest: string
    clearest: string
    safest: string
    bestExits: string
    mostNavigable: string
  }
  recommendations: string[]
}

// ─── Regex Patterns (no g flag on .test()-only regexes) ──────

const INTERFACE_RE = /\binterface\b/
const CLASS_RE = /\bclass\b/
const TYPE_RE = /\btype\b/
const EXPORT_RE = /\bexport\b/
const IMPORT_RE = /\bimport\b/
const FUNCTION_RE = /\bfunction\b/
const ARROW_RE = /=>/
const TRY_RE = /\btry\b/
const CATCH_RE = /\bcatch\b/
const FINALLY_RE = /\bfinally\b/
const IF_RE = /\bif\b/
const RETURN_RE = /\breturn\b/
const THROW_RE = /\bthrow\b/
const GENERIC_RE = /<[A-Z]\w*[,>]/
const OPTIONAL_RE = /\?\s*:/
const NESTED_TERNARY_RE = /\?.*:.*\?.*:/
const CONSOLE_RE = /\bconsole\.\w+/g
const ANY_RE = /:\s*any\b/g
const EVAL_RE = /\beval\s*\(/g
const TODO_RE = /\bTODO\b/gi
const HACK_RE = /\bHACK\b/gi
const FIXME_RE = /\bFIXME\b/gi
const DEPRECATED_RE = /@deprecated/g
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g
const COMMENT_RE = /\/\*[\s\S]*?\*\//g
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g

// ─── measureMaze ────────────────────────────────────────────

/** @example measureMaze(content) returns MazeMeasure */
export function measureMaze(content: string): MazeMeasure {
  let score = 0

  const hasClearPaths = content.length === 0 || (IF_RE.test(content) && !NESTED_TERNARY_RE.test(content))
  const branchCount = (content.match(/\bif\b/g) || []).length + (content.match(/\bswitch\b/g) || []).length
  const hasProperBranching = branchCount > 0 && branchCount <= 20
  const deadEndCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoDeadEnds = deadEndCount === 0
  const loopCount = (content.match(/\bfor\b/g) || []).length + (content.match(/\bwhile\b/g) || []).length
  const hasProperLoops = loopCount <= 10
  const recursiveCount = (content.match(/\bfunction\s+(\w+)\b/g) || []).filter((m) => {
    const name = m.split(/\s+/)[1]
    return content.includes(name + '(')
  }).length
  const hasNoInfiniteRecursion = recursiveCount <= 5
  const hasLinearSegments = content.length > 0 && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const spaghettiCount = (content.match(NESTED_TERNARY_RE) || []).length
  const hasNoSpaghetti = spaghettiCount === 0
  const hasProperGuards = IF_RE.test(content) || content.includes('&&') || content.includes('||')
  const circularCount = (content.match(/\bwhile\s*\(\s*true\s*\)/g) || []).length
  const hasNoCircularPaths = circularCount === 0

  if (content.length > 0) score += 5
  if (hasClearPaths) score += 10
  if (hasProperBranching) score += 12
  if (hasNoDeadEnds) score += 10
  if (hasProperLoops) score += 10
  if (hasNoInfiniteRecursion) score += 10
  if (hasLinearSegments) score += 10
  if (hasNoSpaghetti) score += 12
  if (hasProperGuards) score += 11
  if (hasNoCircularPaths) score += 10

  const complexity = Math.min(100, Math.max(0, score))
  const hasLowComplexity = complexity >= 70

  let pattern: MazeMeasure['pattern'] = 'impenetrable'
  if (hasLowComplexity && hasNoDeadEnds && hasNoSpaghetti && hasClearPaths) pattern = 'elegant-passage'
  else if (hasLowComplexity && hasNoSpaghetti) pattern = 'structured-maze'
  else if (hasLowComplexity) pattern = 'branching-tunnel'
  else if (hasClearPaths && hasNoSpaghetti) pattern = 'chaotic-corridor'
  else if (complexity > 30) pattern = 'dead-end-network'

  return {
    complexity, pattern, hasLowComplexity, hasClearPaths, hasProperBranching,
    hasNoDeadEnds, hasProperLoops, hasNoInfiniteRecursion, hasLinearSegments,
    hasNoSpaghetti, hasProperGuards, hasNoCircularPaths, deadEndCount, spaghettiCount,
  }
}

// ─── measureThread ──────────────────────────────────────────

/** @example measureThread(content) returns ThreadMeasure */
export function measureThread(content: string): ThreadMeasure {
  let score = 0

  const hasAriadneThread = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const docCommentCount = (content.match(DOC_COMMENT_RE) || []).length
  const hasProperMarkings = docCommentCount > 0
  const falseLeadCount = (content.match(DEPRECATED_RE) || []).length
  const hasNoFalseLeads = falseLeadCount === 0
  const hasBreadcrumbTrail = (content.match(COMMENT_RE) || []).length > 0
  const tanglingCount = (content.match(ANY_RE) || []).length
  const hasNoTangling = tanglingCount === 0
  const lines = content.split('\n')
  const avgLineLen = lines.length > 0 ? lines.reduce((s, l) => s + l.length, 0) / lines.length : 0
  const hasStraightPassage = avgLineLen < 80
  const hasNoBacktracking = (content.match(/\beval\b/g) || []).length === 0
  const hasProgressiveDepth = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const hasNoLooping = (content.match(/\bwhile\s*\(\s*true\s*\)/g) || []).length === 0

  if (content.length > 0) score += 5
  if (hasAriadneThread) score += 12
  if (hasProperMarkings) score += 12
  if (hasNoFalseLeads) score += 10
  if (hasBreadcrumbTrail) score += 10
  if (hasNoTangling) score += 10
  if (hasStraightPassage) score += 10
  if (hasNoBacktracking) score += 10
  if (hasProgressiveDepth) score += 11
  if (hasNoLooping) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let state: ThreadMeasure['state'] = 'invisible'
  if (hasHighQuality && hasAriadneThread && hasProperMarkings && hasNoTangling) state = 'golden-thread'
  else if (hasHighQuality && hasAriadneThread) state = 'guided-path'
  else if (hasHighQuality) state = 'marked-trail'
  else if (hasProgressiveDepth && hasNoTangling) state = 'faint-trail'
  else if (quality > 30) state = 'overgrown'

  return {
    quality, state, hasHighQuality, hasAriadneThread, hasProperMarkings,
    hasNoFalseLeads, hasBreadcrumbTrail, hasNoTangling, hasStraightPassage,
    hasNoBacktracking, hasProgressiveDepth, hasNoLooping,
    falseLeadCount, tanglingCount,
  }
}

// ─── measureMinotaur ────────────────────────────────────────

/** @example measureMinotaur(content) returns MinotaurMeasure */
export function measureMinotaur(content: string): MinotaurMeasure {
  let score = 0

  const trapCount = (content.match(EVAL_RE) || []).length + (content.match(ANY_RE) || []).length
  const hasNoHiddenTraps = trapCount === 0
  const hasProperDefenses = TRY_RE.test(content) && CATCH_RE.test(content)
  const emptyCatchCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoSwallowedPaths = emptyCatchCount === 0
  const hasSafePassage = !EVAL_RE.test(content)
  const consoleCount = (content.match(CONSOLE_RE) || []).length
  const hasNoSurpriseAttacks = consoleCount === 0
  const hasProperArmor = OPTIONAL_RE.test(content) || GENERIC_RE.test(content)
  const ambushCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length + (content.match(HACK_RE) || []).length
  const hasNoAmbushPoints = ambushCount === 0
  const hasEscapeRoutes = THROW_RE.test(content) || (TRY_RE.test(content) && CATCH_RE.test(content))
  const hasNoDeadlyEncounters = (content.match(EVAL_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasNoHiddenTraps) score += 12
  if (hasProperDefenses) score += 12
  if (hasNoSwallowedPaths) score += 10
  if (hasSafePassage) score += 10
  if (hasNoSurpriseAttacks) score += 10
  if (hasProperArmor) score += 10
  if (hasNoAmbushPoints) score += 10
  if (hasEscapeRoutes) score += 11
  if (hasNoDeadlyEncounters) score += 10

  const danger = Math.min(100, Math.max(0, score))
  const hasLowDanger = danger >= 70

  let threat: MinotaurMeasure['threat'] = 'labyrinth-king'
  if (hasLowDanger && hasNoHiddenTraps && hasNoAmbushPoints && hasProperDefenses) threat = 'no-monster'
  else if (hasLowDanger && hasNoHiddenTraps) threat = 'minor-threat'
  else if (hasLowDanger) threat = 'beast-lurks'
  else if (hasProperDefenses && hasEscapeRoutes) threat = 'active-minotaur'
  else if (danger > 30) threat = 'multi-minotaur'

  return {
    danger, threat, hasLowDanger, hasNoHiddenTraps, hasProperDefenses,
    hasNoSwallowedPaths, hasSafePassage, hasNoSurpriseAttacks, hasProperArmor,
    hasNoAmbushPoints, hasEscapeRoutes, hasNoDeadlyEncounters,
    trapCount, ambushCount,
  }
}

// ─── measureExit ────────────────────────────────────────────

/** @example measureExit(content) returns ExitMeasure */
export function measureExit(content: string): ExitMeasure {
  let score = 0

  const hasProperExits = RETURN_RE.test(content)
  const hasEmergencyExits = THROW_RE.test(content)
  const trappedCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoTrappedExits = trappedCount === 0
  const hasProperSignage = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoDeadEnds = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasMultiplePaths = TRY_RE.test(content) && CATCH_RE.test(content) && FINALLY_RE.test(content)
  const hasNoCollapsing = !NESTED_TERNARY_RE.test(content)
  const hasEscapePlan = TRY_RE.test(content) && CATCH_RE.test(content)
  const sealedCount = (content.match(EVAL_RE) || []).length
  const hasNoSealed = sealedCount === 0

  if (content.length > 0) score += 5
  if (hasProperExits) score += 12
  if (hasEmergencyExits) score += 10
  if (hasNoTrappedExits) score += 12
  if (hasProperSignage) score += 10
  if (hasNoDeadEnds) score += 10
  if (hasMultiplePaths) score += 12
  if (hasNoCollapsing) score += 10
  if (hasEscapePlan) score += 11
  if (hasNoSealed) score += 10

  const availability = Math.min(100, Math.max(0, score))
  const realHighAvailability = availability >= 70

  let clarity: ExitMeasure['clarity'] = 'sealed-tomb'
  if (realHighAvailability && hasMultiplePaths && hasNoTrappedExits && hasProperSignage) clarity = 'crystal-exit'
  else if (realHighAvailability && hasEscapePlan) clarity = 'marked-door'
  else if (realHighAvailability) clarity = 'dim-passage'
  else if (hasProperExits && hasEscapePlan) clarity = 'hidden-exit'
  else if (availability > 30) clarity = 'false-wall'

  return {
    availability, clarity, hasHighAvailability: realHighAvailability, hasProperExits,
    hasEmergencyExits, hasNoTrappedExits, hasProperSignage, hasNoDeadEnds,
    hasMultiplePaths, hasNoCollapsing, hasEscapePlan, hasNoSealed,
    trappedCount, sealedCount,
  }
}

// ─── measureDepth ───────────────────────────────────────────

/** @example measureDepth(content) returns DepthMeasure */
export function measureDepth(content: string): DepthMeasure {
  let score = 0

  const lines = content.split('\n')
  const maxIndent = lines.reduce((max, line) => {
    const spaces = line.match(/^(\s*)/)?.[1]?.length ?? 0
    return Math.max(max, spaces)
  }, 0)
  const hasModerateDepth = maxIndent <= 24
  const hasProperLayering = INTERFACE_RE.test(content) || CLASS_RE.test(content) || TYPE_RE.test(content)
  const deeplyNestedCount = lines.filter((l) => (l.match(/^(\s*)/)?.[1]?.length ?? 0) > 20).length
  const hasNoExcessiveNesting = deeplyNestedCount === 0
  const hasManageable = maxIndent <= 16
  const cliffCount = lines.filter((l) => (l.match(/^(\s*)/)?.[1]?.length ?? 0) > 24).length
  const hasNoCliff = cliffCount === 0
  const hasGradualDescent = maxIndent <= 12 || (INTERFACE_RE.test(content) && maxIndent <= 20)
  const abyssCount = lines.filter((l) => (l.match(/^(\s*)/)?.[1]?.length ?? 0) > 32).length
  const hasNoAbyss = abyssCount === 0
  const hasProperVentilation = content.includes('\n\n') || content.length === 0
  const hasNoCollapse = deeplyNestedCount <= 5
  const hasLightSource = (content.match(DOC_COMMENT_RE) || []).length > 0 || (content.match(COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasModerateDepth) score += 12
  if (hasProperLayering) score += 12
  if (hasNoExcessiveNesting) score += 10
  if (hasManageable) score += 10
  if (hasNoCliff) score += 10
  if (hasGradualDescent) score += 10
  if (hasNoAbyss) score += 10
  if (hasProperVentilation) score += 11
  if (hasNoCollapse) score += 10

  const level = Math.min(100, Math.max(0, score))
  const realHasModerateDepth = level >= 70

  let stratum: DepthMeasure['stratum'] = 'tartarus'
  if (realHasModerateDepth && hasNoExcessiveNesting && hasNoAbyss && hasProperLayering) stratum = 'surface-level'
  else if (realHasModerateDepth && hasNoExcessiveNesting) stratum = 'shallow-caves'
  else if (realHasModerateDepth) stratum = 'mid-labyrinth'
  else if (hasProperLayering && hasNoAbyss) stratum = 'deep-passages'
  else if (level > 30) stratum = 'abyss'

  return {
    level, stratum, hasModerateDepth: realHasModerateDepth, hasProperLayering,
    hasNoExcessiveNesting, hasManageable, hasNoCliff, hasGradualDescent,
    hasNoAbyss, hasProperVentilation, hasNoCollapse, hasLightSource,
    cliffCount, abyssCount,
  }
}

// ─── measureTheseus ─────────────────────────────────────────

/** @example measureTheseus(content) returns TheseusMeasure */
export function measureTheseus(content: string): TheseusMeasure {
  let score = 0

  const hasClearMap = EXPORT_RE.test(content) && (INTERFACE_RE.test(content) || TYPE_RE.test(content))
  const confusionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoConfusion = confusionCount === 0
  const hasProperGuidance = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoDisorientation = !NESTED_TERNARY_RE.test(content)
  const hasProgressiveDiscovery = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const longLines = content.split('\n').filter((l) => l.length > 150).length
  const hasNoOverwhelming = longLines <= 3
  const hasStructuredApproach = TRY_RE.test(content) && CATCH_RE.test(content)
  const chaosCount = (content.match(EMPTY_CATCH_RE) || []).length + (content.match(CONSOLE_RE) || []).length
  const hasNoChaos = chaosCount === 0
  const hasSatisfyingResolution = RETURN_RE.test(content) && (TRY_RE.test(content) || content.length === 0)

  if (content.length > 0) score += 5
  if (hasClearMap) score += 12
  if (hasNoConfusion) score += 12
  if (hasProperGuidance) score += 10
  if (hasNoDisorientation) score += 10
  if (hasProgressiveDiscovery) score += 10
  if (hasNoOverwhelming) score += 10
  if (hasStructuredApproach) score += 10
  if (hasNoChaos) score += 11
  if (hasSatisfyingResolution) score += 10

  const theseusScore = Math.min(100, Math.max(0, score))
  const hasHighScore = theseusScore >= 70

  let rank: TheseusMeasure['rank'] = 'doomed'
  if (hasHighScore && hasClearMap && hasNoConfusion && hasStructuredApproach) rank = 'master-navigator'
  else if (hasHighScore && hasClearMap) rank = 'experienced-explorer'
  else if (hasHighScore) rank = 'competent'
  else if (hasProgressiveDiscovery && hasNoDisorientation) rank = 'wanderer'
  else if (theseusScore > 30) rank = 'lost'

  return {
    score: theseusScore, rank, hasHighScore, hasClearMap, hasNoConfusion,
    hasProperGuidance, hasNoDisorientation, hasProgressiveDiscovery,
    hasNoOverwhelming, hasStructuredApproach, hasNoChaos, hasSatisfyingResolution,
    confusionCount, chaosCount,
  }
}

// ─── classifyCondition ──────────────────────────────────────

/** @example classifyCondition(chamber) returns condition */
export function classifyCondition(chamber: LabyrinthChamber): LabyrinthChamber['condition'] {
  const { qualityScore } = chamber
  if (qualityScore >= 80) return 'grand-hall'
  if (qualityScore >= 65) return 'well-lit-corridor'
  if (qualityScore >= 50) return 'dim-passage'
  if (qualityScore >= 35) return 'dark-tunnel'
  if (qualityScore >= 20) return 'minotaur-lair'
  return 'bottomless-pit'
}

// ─── Chamber Analysis ───────────────────────────────────────

/** @example analyzeLabyrinthChamber(content, filePath) returns full chamber */
export function analyzeLabyrinthChamber(content: string, filePath: string): LabyrinthChamber {
  const maze = measureMaze(content)
  const thread = measureThread(content)
  const minotaur = measureMinotaur(content)
  const exit = measureExit(content)
  const depth = measureDepth(content)
  const theseus = measureTheseus(content)

  const mazeComplexity = maze.complexity
  const threadQuality = thread.quality
  const minotaurDanger = minotaur.danger
  const exitAvailability = exit.availability
  const architecturalDepth = depth.level
  const theseusScore = theseus.score

  const qualityScore = Math.round(
    mazeComplexity * 0.15 +
    threadQuality * 0.15 +
    minotaurDanger * 0.15 +
    exitAvailability * 0.2 +
    architecturalDepth * 0.15 +
    theseusScore * 0.2,
  )

  const result: LabyrinthChamber = {
    file: filePath,
    mazeComplexity, threadQuality, minotaurDanger,
    exitAvailability, architecturalDepth, theseusScore,
    maze, thread, minotaur, exit, depth, theseus,
    qualityScore,
    condition: 'bottomless-pit',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── Level Analysis ─────────────────────────────────────────

/** @example analyzeLabyrinthLevel(chambers, dirPath) returns LabyrinthLevel */
export function analyzeLabyrinthLevel(chambers: LabyrinthChamber[], dirPath: string): LabyrinthLevel {
  if (chambers.length === 0) {
    return {
      directory: dirPath, chambers: [], avgComplexity: 0, avgThread: 0,
      avgTheseus: 0, grandHallCount: 0, pitCount: 0, navigableCount: 0,
      clearCount: 0, levelType: 'void', condition: 'impassable',
    }
  }

  const avgComplexity = Math.round(chambers.reduce((s, c) => s + c.mazeComplexity, 0) / chambers.length)
  const avgThread = Math.round(chambers.reduce((s, c) => s + c.threadQuality, 0) / chambers.length)
  const avgTheseus = Math.round(chambers.reduce((s, c) => s + c.theseusScore, 0) / chambers.length)
  const grandHallCount = chambers.filter((c) => c.condition === 'grand-hall').length
  const pitCount = chambers.filter((c) => c.condition === 'bottomless-pit').length
  const navigableCount = chambers.filter((c) => c.theseus.hasHighScore).length
  const clearCount = chambers.filter((c) => c.maze.hasLowComplexity).length

  const levelType = classifyLevelType(chambers)
  const avgScore = chambers.reduce((s, c) => s + c.qualityScore, 0) / chambers.length
  let condition: LabyrinthLevel['condition'] = 'impassable'
  if (avgScore >= 75) condition = 'well-mapped'
  else if (avgScore >= 60) condition = 'navigable'
  else if (avgScore >= 45) condition = 'explorable'
  else if (avgScore >= 30) condition = 'treacherous'
  else if (avgScore >= 15) condition = 'dangerous'

  return {
    directory: dirPath, chambers, avgComplexity, avgThread, avgTheseus,
    grandHallCount, pitCount, navigableCount, clearCount,
    levelType, condition,
  }
}

// ─── Level Classification ───────────────────────────────────

/** @example classifyLevelType(chambers) returns level type */
export function classifyLevelType(chambers: LabyrinthChamber[]): LabyrinthLevel['levelType'] {
  if (chambers.length === 0) return 'void'
  const avgScore = chambers.reduce((s, c) => s + c.qualityScore, 0) / chambers.length
  const grandCnt = chambers.filter((c) => c.condition === 'grand-hall').length
  if (avgScore >= 75 && grandCnt >= Math.ceil(chambers.length * 0.3)) return 'palace-level'
  if (avgScore >= 60) return 'structured-level'
  if (avgScore >= 45) return 'branching-level'
  if (avgScore >= 30) return 'maze-level'
  if (avgScore >= 15) return 'chaotic-level'
  return 'void'
}

// ─── Navigator Grade ────────────────────────────────────────

/** @example classifyNavigatorGrade(avgNav) returns grade */
export function classifyNavigatorGrade(avgNav: number): LabyrinthDepthsResult['stats']['navigatorGrade'] {
  if (avgNav >= 80) return 'architect-king'
  if (avgNav >= 65) return 'master-builder'
  if (avgNav >= 50) return 'navigator'
  if (avgNav >= 35) return 'explorer'
  if (avgNav >= 20) return 'wanderer'
  return 'sacrifice'
}

// ─── Recommendations ────────────────────────────────────────

/** @example generateRecommendations(chambers, levels, labyrinth, stats) returns string[] */
export function generateRecommendations(
  chambers: LabyrinthChamber[],
  levels: LabyrinthLevel[],
  labyrinth: LabyrinthDepthsResult['labyrinth'],
  stats: LabyrinthDepthsResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgMazeComplexity < 50) recs.push('Simplify the maze — reduce branching complexity and control flow nesting')
  if (stats.avgThreadQuality < 50) recs.push('Strengthen the thread — add proper documentation and type annotations')
  if (stats.avgMinotaurDanger < 50) recs.push('Beware the minotaur — remove eval, any, and hidden traps')
  if (stats.avgExitAvailability < 50) recs.push('Mark the exits — add proper error handling and return paths')
  if (stats.avgArchitecturalDepth < 50) recs.push('Reduce depth — flatten excessive nesting and add proper layering')
  if (stats.avgTheseusScore < 50) recs.push('Guide Theseus — improve overall code navigability with clear structure')
  if (stats.bottomlessPitCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of chambers are bottomless pits — major refactoring needed')
  if (stats.minotaurLairCount > 0) recs.push('Warning: minotaur lairs detected — these files need immediate attention')
  if (labyrinth.overallNavigability < 40) recs.push('Overall navigability is critical — establish a clear architecture plan')
  if (levels.length > 0 && levels.every((l) => l.condition === 'impassable')) recs.push('All levels are impassable — your codebase needs fundamental restructuring')

  if (chambers.length > 0) {
    const trappedChambers = chambers.filter((c) => c.maze.deadEndCount > 2)
    if (trappedChambers.length > chambers.length * 0.5) recs.push('Over 50% of chambers have dead ends — fix empty catch blocks')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────

/** @example buildLabyrinthDepthsResult(files, contents) returns full result */
export function buildLabyrinthDepthsResult(files: string[], contents: string[]): LabyrinthDepthsResult {
  const chambers = files.map((file, i) => analyzeLabyrinthChamber(contents[i] ?? '', file))

  const levelMap = new Map<string, LabyrinthChamber[]>()
  chambers.forEach((chamber) => {
    const parts = chamber.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = levelMap.get(dir)
    if (existing) existing.push(chamber)
    else levelMap.set(dir, [chamber])
  })

  const levels = Array.from(levelMap.entries()).map(([dir, cs]) => analyzeLabyrinthLevel(cs, dir))

  const avgMazeComplexity = chambers.length > 0 ? Math.round(chambers.reduce((s, c) => s + c.mazeComplexity, 0) / chambers.length) : 0
  const avgThreadQuality = chambers.length > 0 ? Math.round(chambers.reduce((s, c) => s + c.threadQuality, 0) / chambers.length) : 0
  const avgMinotaurDanger = chambers.length > 0 ? Math.round(chambers.reduce((s, c) => s + c.minotaurDanger, 0) / chambers.length) : 0
  const avgExitAvailability = chambers.length > 0 ? Math.round(chambers.reduce((s, c) => s + c.exitAvailability, 0) / chambers.length) : 0
  const avgArchitecturalDepth = chambers.length > 0 ? Math.round(chambers.reduce((s, c) => s + c.architecturalDepth, 0) / chambers.length) : 0
  const avgTheseusScore = chambers.length > 0 ? Math.round(chambers.reduce((s, c) => s + c.theseusScore, 0) / chambers.length) : 0

  const overallNavigability = Math.round(
    avgMazeComplexity * 0.15 +
    avgThreadQuality * 0.15 +
    avgMinotaurDanger * 0.15 +
    avgExitAvailability * 0.2 +
    avgArchitecturalDepth * 0.15 +
    avgTheseusScore * 0.2,
  )

  const labyrinth = {
    avgComplexity: avgMazeComplexity,
    avgThread: avgThreadQuality,
    avgTheseus: avgTheseusScore,
    isNavigable: overallNavigability >= 60,
    overallNavigability,
  }

  const stats = {
    totalFiles: files.length,
    totalLevels: levels.length,
    avgMazeComplexity,
    avgThreadQuality,
    avgMinotaurDanger,
    avgExitAvailability,
    avgArchitecturalDepth,
    avgTheseusScore,
    grandHallCount: chambers.filter((c) => c.condition === 'grand-hall').length,
    wellLitCount: chambers.filter((c) => c.condition === 'well-lit-corridor').length,
    dimPassageCount: chambers.filter((c) => c.condition === 'dim-passage').length,
    darkTunnelCount: chambers.filter((c) => c.condition === 'dark-tunnel').length,
    minotaurLairCount: chambers.filter((c) => c.condition === 'minotaur-lair').length,
    bottomlessPitCount: chambers.filter((c) => c.condition === 'bottomless-pit').length,
    hasLowComplexityCount: chambers.filter((c) => c.maze.hasLowComplexity).length,
    hasHighQualityCount: chambers.filter((c) => c.thread.hasHighQuality).length,
    hasLowDangerCount: chambers.filter((c) => c.minotaur.hasLowDanger).length,
    hasHighAvailabilityCount: chambers.filter((c) => c.exit.hasHighAvailability).length,
    hasModerateDepthCount: chambers.filter((c) => c.depth.hasModerateDepth).length,
    hasHighScoreCount: chambers.filter((c) => c.theseus.hasHighScore).length,
    overallNavigability,
    navigatorGrade: classifyNavigatorGrade(overallNavigability),
    bestChamber: '',
    simplest: '',
    clearest: '',
    safest: '',
    bestExits: '',
    mostNavigable: '',
  }

  if (chambers.length > 0) {
    stats.bestChamber = chambers.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.simplest = chambers.reduce((a, b) => a.mazeComplexity >= b.mazeComplexity ? a : b).file
    stats.clearest = chambers.reduce((a, b) => a.threadQuality >= b.threadQuality ? a : b).file
    stats.safest = chambers.reduce((a, b) => a.minotaurDanger >= b.minotaurDanger ? a : b).file
    stats.bestExits = chambers.reduce((a, b) => a.exitAvailability >= b.exitAvailability ? a : b).file
    stats.mostNavigable = chambers.reduce((a, b) => a.theseusScore >= b.theseusScore ? a : b).file
  }

  const recommendations = generateRecommendations(chambers, levels, labyrinth, stats)

  return { chambers, levels, labyrinth, stats, recommendations }
}
