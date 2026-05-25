// ─── Types ───────────────────────────────────────────────

import { dirname } from 'node:path'
import fg from 'fast-glob'

// ─── Measure Enums ──────────────────────────────────────

export type ShimmeringAura = 'spectral-brilliance' | 'ethereal-glow' | 'proper-shimmer' | 'faded-outline' | 'invisible-form' | 'no-quality'
export type WardingGhost = 'ghost-tamer' | 'spirit-warden' | 'proper-medium' | 'easily-spooked' | 'haunted-code' | 'no-handling'
export type RevealingMist = 'revealing-mist' | 'clear-haze' | 'proper-fog' | 'obscuring-haze' | 'thick-smog' | 'no-clarity'
export type GroundingRoot = 'world-tree-roots' | 'deep-taproot' | 'proper-roots' | 'surface-roots' | 'floating-weed' | 'no-depth'
export type ShadowingShadow = 'shadow-sage' | 'dark-scholar' | 'proper-twilight' | 'surface-gloom' | 'light-only' | 'no-wisdom'
export type TreeCondition = 'phantom-masterpiece' | 'ethereal-grove' | 'proper-forest' | 'faded-wood' | 'dead-thicket' | 'void'
export type ClearingType = 'enchanted-grove' | 'phantom-glade' | 'proper-clearing' | 'dark-thicket' | 'dead-brush' | 'no-clearing'
export type ClearingCondition = 'ethereal-paradise' | 'mystical-grove' | 'proper-forest' | 'faded-wood' | 'dead-thicket' | 'void'
export type WardenGrade = 'phantom-lord' | 'grove-keeper' | 'forest-guardian' | 'apprentice' | 'novice' | 'lost-soul'

// ─── Measure Interfaces ─────────────────────────────────

export interface ShimmeringMeasure {
  quality: number
  aura: ShimmeringAura
  hasHighQuality: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasLightweight: boolean
  hasNoHeavy: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasRefined: boolean
  hasNoRough: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasGraceful: boolean
  hasNoBrutal: boolean
  hasBeautiful: boolean
  clunkyCount: number
  heavyCount: number
}

export interface WardingMeasure {
  handling: number
  ghost: WardingGhost
  hasHighHandling: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasEdgeCaseHandled: boolean
  hasNoEdgeIgnored: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasNullSafe: boolean
  hasNoNullCrash: boolean
  hasRecoverable: boolean
  bareCrashCount: number
  untestedCount: number
}

export interface RevealingMeasure {
  clarity: number
  mist: RevealingMist
  hasHighClarity: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasExplained: boolean
  hasNoSecret: boolean
  hasOpen: boolean
  mysteryCount: number
  obfuscatedCount: number
}

export interface GroundingMeasure {
  depth: number
  root: GroundingRoot
  hasHighDepth: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasEstablished: boolean
  hackedCount: number
  adHocCount: number
}

export interface ShadowingMeasure {
  wisdom: number
  shadow: ShadowingShadow
  hasHighWisdom: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasAntifragile: boolean
  hasNoBrittle: boolean
  hasAdaptive: boolean
  hasNoRigid: boolean
  hasStrategic: boolean
  hasNoTactical: boolean
  hasVisionary: boolean
  hasNoShortSighted: boolean
  hasDeepUnderstanding: boolean
  hasNoSurfaceOnly: boolean
  hasComplexityTamed: boolean
  hasNoOverwhelmed: boolean
  hasWisdomFromFailure: boolean
  fragileCount: number
  rigidCount: number
}

// ─── Core Types ─────────────────────────────────────────

export interface PhantomTree {
  file: string
  etherealQuality: number
  ghostHandling: number
  mistClarity: number
  rootDepth: number
  shadowWisdom: number
  shimmering: ShimmeringMeasure
  warding: WardingMeasure
  revealing: RevealingMeasure
  grounding: GroundingMeasure
  shadowing: ShadowingMeasure
  condition: TreeCondition
  qualityScore: number
}

export interface PhantomClearing {
  directory: string
  trees: PhantomTree[]
  avgQuality: number
  avgHandling: number
  avgWisdom: number
  phantomMasterpieceCount: number
  voidCount: number
  clearingType: ClearingType
  condition: ClearingCondition
}

export interface PhantomForest {
  avgQuality: number
  avgHandling: number
  avgWisdom: number
  isPhantom: boolean
  overallEthereality: number
}

export interface PhantomStats {
  totalFiles: number
  totalClearings: number
  avgEtherealQuality: number
  avgGhostHandling: number
  avgMistClarity: number
  avgRootDepth: number
  avgShadowWisdom: number
  phantomMasterpieceCount: number
  etherealGroveCount: number
  properForestCount: number
  fadedWoodCount: number
  deadThicketCount: number
  voidCount: number
  hasHighQualityCount: number
  hasHighHandlingCount: number
  hasHighClarityCount: number
  hasHighDepthCount: number
  hasHighWisdomCount: number
  overallEthereality: number
  wardenGrade: WardenGrade
  bestTree: string
  mostEthereal: string
  bestWarded: string
  clearest: string
  deepest: string
  wisest: string
}

export interface PhantomGroveResult {
  trees: PhantomTree[]
  clearings: PhantomClearing[]
  forest: PhantomForest
  stats: PhantomStats
  recommendations: string[]
}

// ─── Utility ────────────────────────────────────────────

function hasPattern(content: string, re: RegExp): boolean {
  return re.test(content)
}

function countPattern(content: string, re: RegExp): number {
  return (content.match(new RegExp(re.source, 'g')) ?? []).length
}

// ─── Grade Classifiers ──────────────────────────────────

function classifyShimmeringAura(quality: number): ShimmeringAura {
  if (quality >= 90) return 'spectral-brilliance'
  if (quality >= 75) return 'ethereal-glow'
  if (quality >= 60) return 'proper-shimmer'
  if (quality >= 40) return 'faded-outline'
  if (quality >= 20) return 'invisible-form'
  return 'no-quality'
}

function classifyWardingGhost(handling: number): WardingGhost {
  if (handling >= 90) return 'ghost-tamer'
  if (handling >= 75) return 'spirit-warden'
  if (handling >= 60) return 'proper-medium'
  if (handling >= 40) return 'easily-spooked'
  if (handling >= 20) return 'haunted-code'
  return 'no-handling'
}

function classifyRevealingMist(clarity: number): RevealingMist {
  if (clarity >= 90) return 'revealing-mist'
  if (clarity >= 75) return 'clear-haze'
  if (clarity >= 60) return 'proper-fog'
  if (clarity >= 40) return 'obscuring-haze'
  if (clarity >= 20) return 'thick-smog'
  return 'no-clarity'
}

function classifyGroundingRoot(depth: number): GroundingRoot {
  if (depth >= 90) return 'world-tree-roots'
  if (depth >= 75) return 'deep-taproot'
  if (depth >= 60) return 'proper-roots'
  if (depth >= 40) return 'surface-roots'
  if (depth >= 20) return 'floating-weed'
  return 'no-depth'
}

function classifyShadowingShadow(wisdom: number): ShadowingShadow {
  if (wisdom >= 90) return 'shadow-sage'
  if (wisdom >= 75) return 'dark-scholar'
  if (wisdom >= 60) return 'proper-twilight'
  if (wisdom >= 40) return 'surface-gloom'
  if (wisdom >= 20) return 'light-only'
  return 'no-wisdom'
}

/**
 * @example classifyTreeCondition(85) // 'phantom-masterpiece'
 */
export function classifyTreeCondition(score: number): TreeCondition {
  if (score >= 90) return 'phantom-masterpiece'
  if (score >= 75) return 'ethereal-grove'
  if (score >= 60) return 'proper-forest'
  if (score >= 40) return 'faded-wood'
  if (score >= 20) return 'dead-thicket'
  return 'void'
}

/**
 * @example classifyClearingType(trees)
 */
export function classifyClearingType(trees: PhantomTree[]): ClearingType {
  if (trees.length === 0) return 'no-clearing'
  const avg = trees.reduce((s, t) => s + t.qualityScore, 0) / trees.length
  if (avg >= 85) return 'enchanted-grove'
  if (avg >= 70) return 'phantom-glade'
  if (avg >= 55) return 'proper-clearing'
  if (avg >= 35) return 'dark-thicket'
  if (avg >= 15) return 'dead-brush'
  return 'no-clearing'
}

/**
 * @example classifyWardenGrade(80) // 'phantom-lord'
 */
export function classifyWardenGrade(avgEthereality: number): WardenGrade {
  if (avgEthereality >= 80) return 'phantom-lord'
  if (avgEthereality >= 65) return 'grove-keeper'
  if (avgEthereality >= 50) return 'forest-guardian'
  if (avgEthereality >= 35) return 'apprentice'
  if (avgEthereality >= 20) return 'novice'
  return 'lost-soul'
}

/**
 * @example classifyClearingCondition(75) // 'ethereal-paradise'
 */
export function classifyClearingCondition(avg: number): ClearingCondition {
  if (avg >= 85) return 'ethereal-paradise'
  if (avg >= 70) return 'mystical-grove'
  if (avg >= 55) return 'proper-forest'
  if (avg >= 35) return 'faded-wood'
  if (avg >= 15) return 'dead-thicket'
  return 'void'
}

// ─── measureShimmering ──────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasReturnType, hasGenerics,
//   hasReadonly, hasPrivate, hasTryCatch = 7 → 100

/**
 * @example measureShimmering('export function shimmer(input: string): Result { try { return parse(input) } catch { throw new Error("fail") } }')
 */
export function measureShimmering(content: string): ShimmeringMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)

  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 15
  if (hasExport) score += 15
  if (hasReturnType) score += 14
  if (hasGenerics) score += 14
  if (hasReadonly) score += 14
  if (hasPrivate) score += 14
  if (hasTryCatch) score += 14

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const clunkyCount = hasVar
  const heavyCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)

  const quality = Math.min(100, Math.max(0, score))

  return {
    quality,
    aura: classifyShimmeringAura(quality),
    hasHighQuality: quality >= 80,
    hasElegant: hasReturnType && hasExport,
    hasNoClunky: clunkyCount === 0,
    hasLightweight: hasGenerics && !hasAny,
    hasNoHeavy: heavyCount === 0,
    hasReadable: hasDoc && hasExport,
    hasNoCryptic: !hasEval,
    hasClean: !hasAny && !hasEval,
    hasNoDirty: !hasAny,
    hasRefined: hasReturnType && hasGenerics && !hasAny,
    hasNoRough: !hasAny,
    hasEfficient: hasReturnType && hasExport,
    hasNoWasteful: !hasAny,
    hasGraceful: hasTryCatch && hasReturnType,
    hasNoBrutal: !hasEval,
    hasBeautiful: hasDoc && hasReturnType && hasGenerics && !hasAny,
    clunkyCount,
    heavyCount,
  }
}

// ─── measureWarding ─────────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasReturnType, hasGenerics,
//   hasTryCatch, hasReadonly, hasStrictChecks = 7 → 100

/**
 * @example measureWarding('export function ward(input: string): Result { try { if (input === "test") return parse(input) } catch { throw new Error("fail") } }')
 */
export function measureWarding(content: string): WardingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasStrictChecks = hasPattern(content, /===|!==/)

  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 15
  if (hasExport) score += 15
  if (hasReturnType) score += 14
  if (hasGenerics) score += 14
  if (hasTryCatch) score += 14
  if (hasReadonly) score += 14
  if (hasStrictChecks) score += 14

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const bareCrashCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const untestedCount = hasVar

  const handling = Math.min(100, Math.max(0, score))

  return {
    handling,
    ghost: classifyWardingGhost(handling),
    hasHighHandling: handling >= 80,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: bareCrashCount === 0,
    hasTested: hasTryCatch,
    hasNoUntested: untestedCount === 0,
    hasDefensive: hasTryCatch && !hasAny,
    hasNoNaive: !hasAny,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: !hasAny,
    hasEdgeCaseHandled: hasStrictChecks && hasTryCatch,
    hasNoEdgeIgnored: hasStrictChecks,
    hasGraceful: hasTryCatch && hasReturnType,
    hasNoHarshFail: !hasEval,
    hasNullSafe: hasStrictChecks && hasReturnType,
    hasNoNullCrash: hasStrictChecks,
    hasRecoverable: hasTryCatch && hasReturnType,
    bareCrashCount,
    untestedCount,
  }
}

// ─── measureRevealing ───────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasReturnType, hasGenerics,
//   hasNamed, hasInterface = 6 → 100

/**
 * @example measureRevealing('export function reveal(input: string): Result {}')
 */
export function measureRevealing(content: string): RevealingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)

  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasTsIgnore = hasPattern(content, /\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/)

  if (hasDoc) score += 17
  if (hasExport) score += 17
  if (hasReturnType) score += 17
  if (hasGenerics) score += 17
  if (hasNamed) score += 16
  if (hasInterface) score += 16

  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const mysteryCount = (hasEval ? 1 : 0) + (hasTsIgnore ? 1 : 0)
  const obfuscatedCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)

  const clarity = Math.min(100, Math.max(0, score))

  return {
    clarity,
    mist: classifyRevealingMist(clarity),
    hasHighClarity: clarity >= 80,
    hasSelfDocumenting: hasNamed && hasReturnType,
    hasNoMystery: mysteryCount === 0,
    hasClear: hasReturnType || hasDoc,
    hasNoObfuscated: obfuscatedCount === 0,
    hasTransparent: hasExport && hasReturnType,
    hasNoHidden: !hasAny,
    hasUnderstandable: hasDoc || hasNamed,
    hasNoArcane: !hasEval && !hasAny,
    hasVisible: hasExport,
    hasNoInvisible: !hasEval,
    hasDocumented: hasDoc,
    hasNoUndocumented: !hasAny,
    hasExplained: hasDoc && hasReturnType,
    hasNoSecret: !hasTsIgnore,
    hasOpen: hasExport && hasDoc,
    mysteryCount,
    obfuscatedCount,
  }
}

// ─── measureGrounding ───────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasInterface, hasReturnType,
//   hasGenerics, hasReadonly, hasClass, hasPrivate, hasTryCatch = 9 → 100

/**
 * @example measureGrounding('export interface Config<T> { readonly items: ReadonlyArray<T> }')
 */
export function measureGrounding(content: string): GroundingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 11
  if (hasExport) score += 11
  if (hasInterface) score += 11
  if (hasReturnType) score += 11
  if (hasGenerics) score += 11
  if (hasReadonly) score += 11
  if (hasClass) score += 11
  if (hasPrivate) score += 11
  if (hasTryCatch) score += 12

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const hackedCount = hasVar
  const adHocCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)

  const depth = Math.min(100, Math.max(0, score))

  return {
    depth,
    root: classifyGroundingRoot(depth),
    hasHighDepth: depth >= 80,
    hasWellArchitected: hasInterface && !hasAny,
    hasNoHacked: hackedCount === 0,
    hasPrincipled: hasGenerics && hasReturnType,
    hasNoAdHoc: adHocCount === 0,
    hasPatterned: hasInterface || hasClass,
    hasNoReinvented: !hasAny,
    hasMature: hasDoc && hasExport,
    hasNoNaive: !hasAny,
    hasProven: hasTryCatch && hasReturnType,
    hasNoExperimental: hackedCount === 0,
    hasDeep: hasGenerics && hasReadonly,
    hasNoShallow: !hasAny,
    hasInsightful: hasDoc && hasReturnType,
    hasNoObvious: !hasAny,
    hasEstablished: hasDoc && hasReturnType && hasExport,
    hackedCount,
    adHocCount,
  }
}

// ─── measureShadowing ───────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasReturnType, hasGenerics,
//   hasReadonly, hasTryCatch, hasStrictChecks = 7 → 100

/**
 * @example measureShadowing('export function shadow(input: Readonly<Type>): Type { try { if (input === 0) return input } catch { throw new Error("fail") } }')
 */
export function measureShadowing(content: string): ShadowingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasStrictChecks = hasPattern(content, /===|!==/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 15
  if (hasExport) score += 15
  if (hasReturnType) score += 14
  if (hasGenerics) score += 14
  if (hasReadonly) score += 14
  if (hasTryCatch) score += 14
  if (hasStrictChecks) score += 14

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const fragileCount = hasVar + (hasAny ? 1 : 0)
  const rigidCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  const wisdom = Math.min(100, Math.max(0, score))

  return {
    wisdom,
    shadow: classifyShadowingShadow(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasRobust: hasTryCatch && hasReturnType && !hasAny,
    hasNoFragile: fragileCount === 0,
    hasAntifragile: hasTryCatch && hasGenerics && hasStrictChecks,
    hasNoBrittle: !hasAny,
    hasAdaptive: hasGenerics && hasTryCatch,
    hasNoRigid: !hasEval,
    hasStrategic: hasGenerics && hasReturnType,
    hasNoTactical: !hasAny,
    hasVisionary: hasReadonly && hasGenerics && !hasAny,
    hasNoShortSighted: !hasEval,
    hasDeepUnderstanding: hasDoc && hasReturnType && hasTryCatch,
    hasNoSurfaceOnly: !hasAny,
    hasComplexityTamed: hasGenerics && hasReadonly && hasTryCatch,
    hasNoOverwhelmed: !hasAny,
    hasWisdomFromFailure: hasTryCatch && hasStrictChecks,
    fragileCount,
    rigidCount,
  }
}

// ─── analyzePhantomTree ─────────────────────────────────

/**
 * @example analyzePhantomTree(richContent, 'tree.ts')
 */
export function analyzePhantomTree(content: string, filePath: string): PhantomTree {
  const shimmering = measureShimmering(content)
  const warding = measureWarding(content)
  const revealing = measureRevealing(content)
  const grounding = measureGrounding(content)
  const shadowing = measureShadowing(content)

  const etherealQuality = shimmering.quality
  const ghostHandling = warding.handling
  const mistClarity = revealing.clarity
  const rootDepth = grounding.depth
  const shadowWisdom = shadowing.wisdom

  const qualityScore = Math.round(
    etherealQuality * 0.2 +
    ghostHandling * 0.2 +
    mistClarity * 0.2 +
    rootDepth * 0.2 +
    shadowWisdom * 0.2,
  )

  return {
    file: filePath,
    etherealQuality,
    ghostHandling,
    mistClarity,
    rootDepth,
    shadowWisdom,
    shimmering,
    warding,
    revealing,
    grounding,
    shadowing,
    condition: classifyTreeCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzePhantomClearing ─────────────────────────────

/**
 * @example analyzePhantomClearing(trees, 'src')
 */
export function analyzePhantomClearing(trees: PhantomTree[], dirPath: string): PhantomClearing {
  if (trees.length === 0) {
    return {
      directory: dirPath,
      trees: [],
      avgQuality: 0,
      avgHandling: 0,
      avgWisdom: 0,
      phantomMasterpieceCount: 0,
      voidCount: 0,
      clearingType: 'no-clearing',
      condition: 'void',
    }
  }

  const avgQuality = Math.round(trees.reduce((s, t) => s + t.etherealQuality, 0) / trees.length)
  const avgHandling = Math.round(trees.reduce((s, t) => s + t.ghostHandling, 0) / trees.length)
  const avgWisdom = Math.round(trees.reduce((s, t) => s + t.shadowWisdom, 0) / trees.length)

  const phantomMasterpieceCount = trees.filter(t => t.condition === 'phantom-masterpiece').length
  const voidCount = trees.filter(t => t.condition === 'void').length

  const clearingType = classifyClearingType(trees)
  const overallAvg = Math.round((avgQuality + avgHandling + avgWisdom) / 3)

  return {
    directory: dirPath,
    trees,
    avgQuality,
    avgHandling,
    avgWisdom,
    phantomMasterpieceCount,
    voidCount,
    clearingType,
    condition: classifyClearingCondition(overallAvg),
  }
}

// ─── generateRecommendations ────────────────────────────

/**
 * @example generateRecommendations(trees, clearings, forest, stats)
 */
export function generateRecommendations(
  trees: PhantomTree[],
  clearings: PhantomClearing[],
  forest: PhantomForest,
  stats: PhantomStats,
): string[] {
  const recs: string[] = []

  if (forest.overallEthereality >= 90 && stats.voidCount === 0) {
    recs.push('Your phantom grove shimmers with ethereal perfection! Every tree glows with spectral brilliance')
    return recs
  }

  if (stats.avgEtherealQuality < 50) {
    recs.push('Enhance ethereal quality — add exports, return types, and elegant patterns for weightless code')
  }
  if (stats.avgGhostHandling < 50) {
    recs.push('Improve ghost handling — add error handling, type safety, and defensive patterns for the unexpected')
  }
  if (stats.avgMistClarity < 50) {
    recs.push('Clear the mist — add documentation, clear naming, and transparent logic for revealing clarity')
  }
  if (stats.avgRootDepth < 50) {
    recs.push('Deepen the roots — add interfaces, generics, and proven patterns for foundational depth')
  }
  if (stats.avgShadowWisdom < 50) {
    recs.push('Seek shadow wisdom — add error handling, strict checks, and adaptive patterns for dark knowledge')
  }

  const dead = trees.filter(t => t.condition === 'void' || t.condition === 'dead-thicket')
  if (dead.length > 0 && dead.length <= 3) {
    recs.push(`Revive these dead thickets: ${dead.map(t => t.file).join(', ')}`)
  } else if (dead.length > 3) {
    recs.push(`${dead.length} dead thickets need reviving — prioritize the darkest groves`)
  }

  const darkClearings = clearings.filter(c => c.clearingType === 'dark-thicket' || c.clearingType === 'no-clearing')
  if (darkClearings.length > 0) {
    recs.push(`${darkClearings.length} clearing(s) are dark or empty — consider restructuring or removing dead code`)
  }

  if (!forest.isPhantom) {
    recs.push('Overall ethereality is below 60 — focus on improving core code quality')
  }

  if (recs.length === 0) {
    recs.push('The phantom grove endures — keep shimmering with ethereal quality')
  }

  return recs
}

// ─── gatherFiles ────────────────────────────────────────

/**
 * @example gatherFiles('/path', ['.ts'], ['ignore-patterns'])
 */
export async function gatherFiles(
  rootDir: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  const patterns = extensions.map(ext => `**/*${ext}`)
  const entries = await fg(patterns, {
    cwd: rootDir,
    ignore: ignorePatterns,
    absolute: false,
    onlyFiles: true,
  })
  return entries.sort()
}

// ─── buildPhantomGroveResult ────────────────────────────

/**
 * @example buildPhantomGroveResult(['a.ts'], [content])
 */
export async function buildPhantomGroveResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PhantomGroveResult> {
  const trees = files.map((file, i) =>
    analyzePhantomTree(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, PhantomTree[]>()
  for (const t of trees) {
    const dir = dirname(t.file) || '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(t)
    } else {
      dirMap.set(dir, [t])
    }
  }

  const clearings = Array.from(dirMap.entries()).map(([dir, ts]) =>
    analyzePhantomClearing(ts, dir),
  )

  const totalFiles = trees.length
  const avgEtherealQuality = totalFiles > 0 ? Math.round(trees.reduce((s, t) => s + t.etherealQuality, 0) / totalFiles) : 0
  const avgGhostHandling = totalFiles > 0 ? Math.round(trees.reduce((s, t) => s + t.ghostHandling, 0) / totalFiles) : 0
  const avgMistClarity = totalFiles > 0 ? Math.round(trees.reduce((s, t) => s + t.mistClarity, 0) / totalFiles) : 0
  const avgRootDepth = totalFiles > 0 ? Math.round(trees.reduce((s, t) => s + t.rootDepth, 0) / totalFiles) : 0
  const avgShadowWisdom = totalFiles > 0 ? Math.round(trees.reduce((s, t) => s + t.shadowWisdom, 0) / totalFiles) : 0

  const overallEthereality = Math.round(
    (avgEtherealQuality + avgGhostHandling + avgMistClarity + avgRootDepth + avgShadowWisdom) / 5,
  )

  const bestBy = (fn: (t: PhantomTree) => number) =>
    trees.length > 0 ? trees.reduce((best, t) => fn(t) > fn(best) ? t : best).file : 'none'

  const stats: PhantomStats = {
    totalFiles,
    totalClearings: clearings.length,
    avgEtherealQuality,
    avgGhostHandling,
    avgMistClarity,
    avgRootDepth,
    avgShadowWisdom,
    phantomMasterpieceCount: trees.filter(t => t.condition === 'phantom-masterpiece').length,
    etherealGroveCount: trees.filter(t => t.condition === 'ethereal-grove').length,
    properForestCount: trees.filter(t => t.condition === 'proper-forest').length,
    fadedWoodCount: trees.filter(t => t.condition === 'faded-wood').length,
    deadThicketCount: trees.filter(t => t.condition === 'dead-thicket').length,
    voidCount: trees.filter(t => t.condition === 'void').length,
    hasHighQualityCount: trees.filter(t => t.shimmering.hasHighQuality).length,
    hasHighHandlingCount: trees.filter(t => t.warding.hasHighHandling).length,
    hasHighClarityCount: trees.filter(t => t.revealing.hasHighClarity).length,
    hasHighDepthCount: trees.filter(t => t.grounding.hasHighDepth).length,
    hasHighWisdomCount: trees.filter(t => t.shadowing.hasHighWisdom).length,
    overallEthereality,
    wardenGrade: classifyWardenGrade(overallEthereality),
    bestTree: bestBy(t => t.qualityScore),
    mostEthereal: bestBy(t => t.etherealQuality),
    bestWarded: bestBy(t => t.ghostHandling),
    clearest: bestBy(t => t.mistClarity),
    deepest: bestBy(t => t.rootDepth),
    wisest: bestBy(t => t.shadowWisdom),
  }

  const forest: PhantomForest = {
    avgQuality: avgEtherealQuality,
    avgHandling: avgGhostHandling,
    avgWisdom: avgShadowWisdom,
    isPhantom: overallEthereality >= 60,
    overallEthereality,
  }

  const recommendations = generateRecommendations(trees, clearings, forest, stats)

  return { trees, clearings, forest, stats, recommendations }
}
