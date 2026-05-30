// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type PathType = 'clear-corridor' | 'marked-trail' | 'proper-passage' | 'dark-tunnel' | 'dead-end' | 'no-path'
export type Patina = 'noble-verdigris' | 'aged-copper' | 'proper-patina' | 'tarnished-metal' | 'raw-copper' | 'no-patience'
export type Logic = 'perfect-spiral' | 'logical-maze' | 'proper-pattern' | 'random-walk' | 'chaotic-path' | 'no-logic'
export type Wall = 'copper-bastion' | 'strong-barrier' | 'proper-wall' | 'thin-partition' | 'paper-thin' | 'no-wall'
export type Center = 'minotaur-sage' | 'labyrinth-keeper' | 'proper-guide' | 'lost-wanderer' | 'blind-alley' | 'no-wisdom'
export type CopperCondition = 'golden-labyrinth' | 'copper-maze' | 'proper-passage' | 'tangled-wires' | 'dark-corridor' | 'collapse'
export type ChamberType = 'grand-labyrinth' | 'copper-maze' | 'proper-corridor' | 'small-hallway' | 'dead-end' | 'no-chamber'
export type ChamberCondition = 'magnificent-maze' | 'copper-palace' | 'proper-hall' | 'tangled-tunnel' | 'collapsed-shaft' | 'void'
export type ArchitectGrade = 'master-architect' | 'labyrinth-designer' | 'skilled-builder' | 'apprentice' | 'novice' | 'wall-banger'

export interface NavigatingMeasure {
  clarity: number
  path: PathType
  hasHighClarity: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasDirectFlow: boolean
  hasNoCircuits: boolean
  hasNavigable: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface AgingMeasure {
  patience: number
  patina: Patina
  hasHighPatience: boolean
  hasDocumented: boolean
  hasWellStructured: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasEstablished: boolean
  hasNoNovel: boolean
  hasBattleTested: boolean
  hasNoUnproven: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasTimeless: boolean
  adHocCount: number
  experimentalCount: number
}

export interface TwistingMeasure {
  coherence: number
  logic: Logic
  hasHighCoherence: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasLogical: boolean
  hasNoIllogical: boolean
  hasPredictable: boolean
  hasNoSurprising: boolean
  hasStructured: boolean
  hasNoChaotic: boolean
  hasOrdered: boolean
  hasNoRandom: boolean
  hasSystematic: boolean
  hasNoHaphazard: boolean
  hasCoherent: boolean
  hasNoConfusing: boolean
  contradictoryCount: number
  chaoticCount: number
}

export interface ShieldingMeasure {
  resilience: number
  wall: Wall
  hasHighResilience: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasEncapsulated: boolean
  hasNoLeaked: boolean
  hasPrivate: boolean
  hasNoExposed: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface KnowingMeasure {
  wisdom: number
  center: Center
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasStrategic: boolean
  hasNoTactical: boolean
  hasVisionary: boolean
  hasNoTunnelVision: boolean
  hackedCount: number
  adHocCount: number
}

export interface CopperPath {
  file: string
  pathClarity: number
  copperPatience: number
  twistCoherence: number
  wallResilience: number
  centerWisdom: number
  navigating: NavigatingMeasure
  aging: AgingMeasure
  twisting: TwistingMeasure
  shielding: ShieldingMeasure
  knowing: KnowingMeasure
  condition: CopperCondition
  qualityScore: number
}

export interface CopperChamber {
  directory: string
  paths: CopperPath[]
  avgClarity: number
  avgCoherence: number
  avgWisdom: number
  goldenLabyrinthCount: number
  collapseCount: number
  chamberType: ChamberType
  condition: ChamberCondition
}

export interface CopperLabyrinthResult {
  paths: CopperPath[]
  chambers: CopperChamber[]
  maze: {
    avgClarity: number
    avgCoherence: number
    avgWisdom: number
    isGolden: boolean
    overallNavigability: number
  }
  stats: {
    totalFiles: number
    totalChambers: number
    avgPathClarity: number
    avgCopperPatience: number
    avgTwistCoherence: number
    avgWallResilience: number
    avgCenterWisdom: number
    goldenLabyrinthCount: number
    copperMazeCount: number
    properPassageCount: number
    tangledWiresCount: number
    darkCorridorCount: number
    collapseCount: number
    hasHighClarityCount: number
    hasHighPatienceCount: number
    hasHighCoherenceCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallNavigability: number
    architectGrade: ArchitectGrade
    bestPath: string
    clearest: string
    mostPatient: string
    mostCoherent: string
    wisest: string
  }
  recommendations: string[]
}

// ─── Detectors ─────────────────────────────────────────────────────

function hasPattern(content: string, pattern: RegExp): boolean {
  return pattern.test(content)
}

function countPattern(content: string, pattern: RegExp): number {
  const matches = content.match(pattern)
  return matches ? matches.length : 0
}

// ─── measureNavigating ─────────────────────────────────────────────

/**
 * @example measureNavigating('export function calculateTotal(items: Item[]): Number')
 */
export function measureNavigating(content: string): NavigatingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasArrow = hasPattern(content, /=>/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 6
  if (hasConst) score += 4
  if (hasReturnType) score += 8
  if (hasTypeAnnotation) score += 6
  if (hasDoc) score += 6
  if (hasInterface) score += 6
  if (hasNamed) score += 4
  if (hasGenerics) score += 4
  if (hasPipeline) score += 4
  if (hasArrow) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const crypticCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const obfuscatedCount = (hasVar > 0 ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    clarity,
    path: classifyPath(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasReturnType && hasNamed,
    hasSelfDocumenting: hasReturnType && hasNamed,
    hasNoCryptic: !hasEval && !hasAny,
    hasClear: hasReturnType && !hasAny,
    hasNoObfuscated: !hasEval && !hasAny,
    hasTransparent: hasExport && !hasAny,
    hasNoHidden: !hasEval,
    hasUnderstandable: hasTypeAnnotation && hasConst,
    hasNoArcane: !hasEval && !hasAny,
    hasVisible: hasExport,
    hasNoInvisible: !hasDebugger,
    hasDirectFlow: hasPipeline && hasArrow,
    hasNoCircuits: hasVar === 0,
    hasNavigable: hasReturnType && hasConst && !hasAny,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measureAging ──────────────────────────────────────────────────

/**
 * @example measureAging('/** docs *\\/ export class Store extends Base implements IStore {}')
 */
export function measureAging(content: string): AgingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasDoc) score += 8
  if (hasExport) score += 6
  if (hasInterface) score += 6
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 4
  if (hasTryCatch) score += 4
  if (hasReturnType) score += 4
  if (hasGenerics) score += 4
  if (hasClass) score += 4
  if (hasPrivate) score += 4
  if (hasReadonly) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4

  const patience = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = (hasVar > 0 ? 1 : 0) + (hasEval ? 1 : 0)
  const experimentalCount = hasAny ? 1 : 0

  return {
    patience,
    patina: classifyPatina(patience),
    hasHighPatience: patience >= 80,
    hasDocumented: hasDoc,
    hasWellStructured: hasInterface && hasExtends && !hasAny,
    hasNoAdHoc: hasVar === 0,
    hasProven: hasTryCatch && hasReturnType,
    hasNoExperimental: !hasAny,
    hasMature: hasDoc && hasExport,
    hasNoNaive: !hasEval && !hasAny,
    hasEstablished: hasExtends && hasImplements,
    hasNoNovel: !hasEval,
    hasBattleTested: hasTryCatch && hasDoc && !hasAny,
    hasNoUnproven: hasVar === 0 && !hasAny,
    hasMaintained: hasDoc && hasReturnType,
    hasNoAbandoned: !hasEval && !/\bdebugger\b/.test(content),
    hasTimeless: hasAbstract && hasExtends && !hasAny,
    adHocCount,
    experimentalCount,
  }
}

// ─── measureTwisting ───────────────────────────────────────────────

/**
 * @example measureTwisting('export interface Guard<T> { validate(i: T): Boolean }')
 */
export function measureTwisting(content: string): TwistingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 4
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasClass) score += 4
  if (hasEnum) score += 4
  if (hasGenerics) score += 6
  if (hasOptional) score += 6
  if (hasReturnType) score += 6
  if (hasConst) score += 4
  if (hasAsync) score += 4
  if (hasPipeline) score += 4
  if (hasReadonly) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const coherence = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const contradictoryCount = (hasVar > 0 ? 1 : 0) + (hasEval ? 1 : 0)
  const chaoticCount = (hasAny ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    coherence,
    logic: classifyLogic(coherence),
    hasHighCoherence: coherence >= 80,
    hasConsistent: hasReturnType && hasConst,
    hasNoContradictory: hasVar === 0 && !hasEval,
    hasLogical: hasReturnType && !hasAny,
    hasNoIllogical: !hasEval && !hasAny,
    hasPredictable: hasReturnType && hasConst && !hasAny,
    hasNoSurprising: !hasEval,
    hasStructured: hasInterface && hasExport,
    hasNoChaotic: hasVar === 0 && !hasEval,
    hasOrdered: hasExport && hasConst,
    hasNoRandom: !hasAny,
    hasSystematic: hasGenerics && hasOptional,
    hasNoHaphazard: hasVar === 0,
    hasCoherent: hasReturnType && hasPipeline,
    hasNoConfusing: !hasEval && !hasAny,
    contradictoryCount,
    chaoticCount,
  }
}

// ─── measureShielding ──────────────────────────────────────────────

/**
 * @example measureShielding('try { const result = parse(data) } catch { return fallback }')
 */
export function measureShielding(content: string): ShieldingMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExtends = hasPattern(content, /\bextends\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasTryCatch) score += 6
  if (hasReturnType) score += 6
  if (hasTypeAnnotation) score += 4
  if (hasConst) score += 4
  if (hasExport) score += 4
  if (hasOptional) score += 6
  if (hasReadonly) score += 4
  if (hasPrivate) score += 6
  if (hasInterface) score += 4
  if (hasGenerics) score += 4
  if (hasDoc) score += 4
  if (hasExtends) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 6

  const resilience = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const untestedCount = hasVar > 0 ? 1 : 0
  const bareCrashCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    resilience,
    wall: classifyWall(resilience),
    hasHighResilience: resilience >= 80,
    hasTested: hasTryCatch,
    hasNoUntested: hasVar === 0,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: hasVar === 0 && !hasAny,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: !hasEval,
    hasEncapsulated: hasPrivate,
    hasNoLeaked: !hasEval && !hasAny,
    hasPrivate: hasPrivate,
    hasNoExposed: !hasEval,
    hasDefensive: hasOptional && !hasAny,
    hasNoNaive: !hasEval && !hasAny,
    hasRobust: hasTryCatch && hasReturnType && !hasAny,
    hasNoFragile: hasVar === 0 && !hasEval && !hasDebugger,
    untestedCount,
    bareCrashCount,
  }
}

// ─── measureKnowing ────────────────────────────────────────────────

/**
 * @example measureKnowing('export abstract class Repository<T> extends Base implements IRepo {}')
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasDoc) score += 8
  if (hasExport) score += 6
  if (hasInterface) score += 6
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 6
  if (hasTryCatch) score += 4
  if (hasReturnType) score += 4
  if (hasGenerics) score += 4
  if (hasClass) score += 4
  if (hasNamed) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const hackedCount = hasHackyCast
  const adHocCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    wisdom,
    center: classifyCenter(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasWellArchitected: hasInterface && hasExtends && !hasAny,
    hasNoHacked: hasHackyCast === 0,
    hasPrincipled: hasAbstract || hasExtends,
    hasNoAdHoc: hasVar === 0,
    hasPatterned: hasExtends || hasImplements,
    hasNoReinvented: !hasEval,
    hasDeep: hasGenerics && hasReturnType,
    hasNoShallow: !hasAny,
    hasInsightful: hasDoc && hasReturnType && hasGenerics,
    hasNoObvious: !hasAny,
    hasStrategic: hasAbstract && hasExtends,
    hasNoTactical: !hasEval,
    hasVisionary: hasAbstract && hasExtends && hasImplements && !hasAny,
    hasNoTunnelVision: !hasEval && !hasAny,
    hackedCount,
    adHocCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyPath(clarity: number): PathType {
  if (clarity >= 90) return 'clear-corridor'
  if (clarity >= 75) return 'marked-trail'
  if (clarity >= 60) return 'proper-passage'
  if (clarity >= 40) return 'dark-tunnel'
  if (clarity >= 20) return 'dead-end'
  return 'no-path'
}

function classifyPatina(patience: number): Patina {
  if (patience >= 90) return 'noble-verdigris'
  if (patience >= 75) return 'aged-copper'
  if (patience >= 60) return 'proper-patina'
  if (patience >= 40) return 'tarnished-metal'
  if (patience >= 20) return 'raw-copper'
  return 'no-patience'
}

function classifyLogic(coherence: number): Logic {
  if (coherence >= 90) return 'perfect-spiral'
  if (coherence >= 75) return 'logical-maze'
  if (coherence >= 60) return 'proper-pattern'
  if (coherence >= 40) return 'random-walk'
  if (coherence >= 20) return 'chaotic-path'
  return 'no-logic'
}

function classifyWall(resilience: number): Wall {
  if (resilience >= 90) return 'copper-bastion'
  if (resilience >= 75) return 'strong-barrier'
  if (resilience >= 60) return 'proper-wall'
  if (resilience >= 40) return 'thin-partition'
  if (resilience >= 20) return 'paper-thin'
  return 'no-wall'
}

function classifyCenter(wisdom: number): Center {
  if (wisdom >= 90) return 'minotaur-sage'
  if (wisdom >= 75) return 'labyrinth-keeper'
  if (wisdom >= 60) return 'proper-guide'
  if (wisdom >= 40) return 'lost-wanderer'
  if (wisdom >= 20) return 'blind-alley'
  return 'no-wisdom'
}

export function classifyCopperCondition(qualityScore: number): CopperCondition {
  if (qualityScore >= 90) return 'golden-labyrinth'
  if (qualityScore >= 75) return 'copper-maze'
  if (qualityScore >= 60) return 'proper-passage'
  if (qualityScore >= 40) return 'tangled-wires'
  if (qualityScore >= 20) return 'dark-corridor'
  return 'collapse'
}

export function classifyChamberType(paths: CopperPath[]): ChamberType {
  if (paths.length === 0) return 'no-chamber'
  const avgQs = paths.reduce((s, p) => s + p.qualityScore, 0) / paths.length
  const masterpieceRatio = paths.filter(p => p.condition === 'golden-labyrinth').length / paths.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'grand-labyrinth'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'copper-maze'
  if (avgQs >= 55) return 'proper-corridor'
  if (avgQs >= 35) return 'small-hallway'
  if (avgQs >= 15) return 'dead-end'
  return 'no-chamber'
}

export function classifyChamberCondition(avgClarity: number): ChamberCondition {
  if (avgClarity >= 85) return 'magnificent-maze'
  if (avgClarity >= 70) return 'copper-palace'
  if (avgClarity >= 55) return 'proper-hall'
  if (avgClarity >= 35) return 'tangled-tunnel'
  if (avgClarity >= 15) return 'collapsed-shaft'
  return 'void'
}

export function classifyArchitectGrade(avgNavigability: number): ArchitectGrade {
  if (avgNavigability >= 85) return 'master-architect'
  if (avgNavigability >= 70) return 'labyrinth-designer'
  if (avgNavigability >= 55) return 'skilled-builder'
  if (avgNavigability >= 40) return 'apprentice'
  if (avgNavigability >= 20) return 'novice'
  return 'wall-banger'
}

// ─── analyzeCopperPath ─────────────────────────────────────────────

/**
 * @example analyzeCopperPath(content, 'src/foo.ts')
 */
export function analyzeCopperPath(content: string, filePath: string): CopperPath {
  const navigating = measureNavigating(content)
  const aging = measureAging(content)
  const twisting = measureTwisting(content)
  const shielding = measureShielding(content)
  const knowing = measureKnowing(content)

  const pathClarity = navigating.clarity
  const copperPatience = aging.patience
  const twistCoherence = twisting.coherence
  const wallResilience = shielding.resilience
  const centerWisdom = knowing.wisdom

  const qualityScore = Math.round(
    pathClarity * 0.2 +
    copperPatience * 0.2 +
    twistCoherence * 0.2 +
    wallResilience * 0.2 +
    centerWisdom * 0.2,
  )

  return {
    file: filePath,
    pathClarity,
    copperPatience,
    twistCoherence,
    wallResilience,
    centerWisdom,
    navigating,
    aging,
    twisting,
    shielding,
    knowing,
    condition: classifyCopperCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeCopperChamber ──────────────────────────────────────────

/**
 * @example analyzeCopperChamber(paths, 'src')
 */
export function analyzeCopperChamber(paths: CopperPath[], dirPath: string): CopperChamber {
  if (paths.length === 0) {
    return {
      directory: dirPath,
      paths: [],
      avgClarity: 0,
      avgCoherence: 0,
      avgWisdom: 0,
      goldenLabyrinthCount: 0,
      collapseCount: 0,
      chamberType: 'no-chamber',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(paths.reduce((s, p) => s + p.pathClarity, 0) / paths.length)
  const avgCoherence = Math.round(paths.reduce((s, p) => s + p.twistCoherence, 0) / paths.length)
  const avgWisdom = Math.round(paths.reduce((s, p) => s + p.centerWisdom, 0) / paths.length)
  const goldenLabyrinthCount = paths.filter(p => p.condition === 'golden-labyrinth').length
  const collapseCount = paths.filter(p => p.condition === 'collapse').length

  return {
    directory: dirPath,
    paths,
    avgClarity,
    avgCoherence,
    avgWisdom,
    goldenLabyrinthCount,
    collapseCount,
    chamberType: classifyChamberType(paths),
    condition: classifyChamberCondition(avgClarity),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(paths, chambers, maze, stats)
 */
export function generateRecommendations(
  paths: CopperPath[],
  chambers: CopperChamber[],
  _maze: CopperLabyrinthResult['maze'],
  stats: CopperLabyrinthResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallNavigability >= 85 && stats.collapseCount === 0) {
    recs.push('Copper labyrinth perfection — the maze gleams with golden paths')
    return recs
  }

  if (stats.avgPathClarity < 60) {
    recs.push('Illuminate the paths — add return types, named exports, docs, remove eval and any')
  }
  if (stats.avgCopperPatience < 60) {
    recs.push('Age the copper — add documentation, abstractions, proven patterns, remove eval and any')
  }
  if (stats.avgTwistCoherence < 60) {
    recs.push('Straighten the twists — add generics, optionals, consistent types, remove eval and var')
  }
  if (stats.avgWallResilience < 60) {
    recs.push('Fortify the walls — add error handling, type safety, encapsulation, remove eval and debugger')
  }
  if (stats.avgCenterWisdom < 60) {
    recs.push('Deepen the wisdom — add abstractions, proven patterns, architectural insight, remove eval and any')
  }

  if (stats.collapseCount > 0) {
    const collapseFiles = paths.filter(p => p.condition === 'collapse').map(p => p.file)
    if (collapseFiles.length <= 3) {
      recs.push(`Collapse detected: ${collapseFiles.join(', ')} — these need labyrinth energy`)
    } else {
      recs.push(`${collapseFiles.length} collapsed files detected — they need labyrinth energy`)
    }
  }

  if (chambers.length > 1) {
    const dimChambers = chambers.filter(c => c.condition === 'tangled-tunnel' || c.condition === 'collapsed-shaft')
    if (dimChambers.length > 0) {
      recs.push(`${dimChambers.length} chamber(s) have tangled or collapsed conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The copper labyrinth holds steady — maintain current navigability')
  }

  return recs
}

// ─── gatherFiles ───────────────────────────────────────────────────

/**
 * @example gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  try {
    const patterns = extensions.length > 0
      ? extensions.map(ext => `**/*${ext}`)
      : ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = Array.from(new Set([...defaultIgnore, ...ignorePatterns]))

    const files = await fg(patterns, {
      absolute: false,
      cwd: targetPath,
      ignore,
      onlyFiles: true,
    })

    return files.sort()
  } catch {
    return []
  }
}

// ─── buildCopperLabyrinthResult ────────────────────────────────────

/**
 * @example buildCopperLabyrinthResult(['a.ts'], [content])
 */
export async function buildCopperLabyrinthResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CopperLabyrinthResult> {
  const paths: CopperPath[] = files.map((file, i) =>
    analyzeCopperPath(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CopperPath[]>()
  for (const copperPath of paths) {
    const dir = path.dirname(copperPath.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(copperPath)
    } else {
      dirMap.set(dir, [copperPath])
    }
  }

  const chambers: CopperChamber[] = Array.from(dirMap.entries()).map(([dir, dirPaths]) =>
    analyzeCopperChamber(dirPaths, dir),
  )

  const avgPathClarity = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.pathClarity, 0) / paths.length)
    : 0
  const avgCopperPatience = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.copperPatience, 0) / paths.length)
    : 0
  const avgTwistCoherence = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.twistCoherence, 0) / paths.length)
    : 0
  const avgWallResilience = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.wallResilience, 0) / paths.length)
    : 0
  const avgCenterWisdom = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.centerWisdom, 0) / paths.length)
    : 0

  const overallNavigability = Math.round(
    (avgPathClarity + avgTwistCoherence + avgCenterWisdom) / 3,
  )

  const maze = {
    avgClarity: avgPathClarity,
    avgCoherence: avgTwistCoherence,
    avgWisdom: avgCenterWisdom,
    isGolden: overallNavigability >= 80,
    overallNavigability,
  }

  const bestPath = paths.length > 0
    ? paths.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file
    : ''
  const clearest = paths.length > 0
    ? paths.reduce((best, p) => p.pathClarity > best.pathClarity ? p : best).file
    : ''
  const mostPatient = paths.length > 0
    ? paths.reduce((best, p) => p.copperPatience > best.copperPatience ? p : best).file
    : ''
  const mostCoherent = paths.length > 0
    ? paths.reduce((best, p) => p.twistCoherence > best.twistCoherence ? p : best).file
    : ''
  const wisest = paths.length > 0
    ? paths.reduce((best, p) => p.centerWisdom > best.centerWisdom ? p : best).file
    : ''

  const stats = {
    totalFiles: paths.length,
    totalChambers: chambers.length,
    avgPathClarity,
    avgCopperPatience,
    avgTwistCoherence,
    avgWallResilience,
    avgCenterWisdom,
    goldenLabyrinthCount: paths.filter(p => p.condition === 'golden-labyrinth').length,
    copperMazeCount: paths.filter(p => p.condition === 'copper-maze').length,
    properPassageCount: paths.filter(p => p.condition === 'proper-passage').length,
    tangledWiresCount: paths.filter(p => p.condition === 'tangled-wires').length,
    darkCorridorCount: paths.filter(p => p.condition === 'dark-corridor').length,
    collapseCount: paths.filter(p => p.condition === 'collapse').length,
    hasHighClarityCount: paths.filter(p => p.navigating.hasHighClarity).length,
    hasHighPatienceCount: paths.filter(p => p.aging.hasHighPatience).length,
    hasHighCoherenceCount: paths.filter(p => p.twisting.hasHighCoherence).length,
    hasHighResilienceCount: paths.filter(p => p.shielding.hasHighResilience).length,
    hasHighWisdomCount: paths.filter(p => p.knowing.hasHighWisdom).length,
    overallNavigability,
    architectGrade: classifyArchitectGrade(overallNavigability),
    bestPath,
    clearest,
    mostPatient,
    mostCoherent,
    wisest,
  }

  const recommendations = generateRecommendations(paths, chambers, maze, { ...stats, recommendations: [] } as CopperLabyrinthResult['stats'])

  return {
    paths,
    chambers,
    maze,
    stats,
    recommendations,
  }
}
