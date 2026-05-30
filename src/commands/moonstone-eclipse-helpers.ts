// ─── Interfaces ──────────────────────────────────────────

export interface GlowingMeasure {
  luminescence: number
  light: 'full-moon-glow' | 'moonstone-shimmer' | 'proper-adularescence' | 'cloudy-moon' | 'new-moon' | 'no-luminescence'
  hasHighLuminescence: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoMystery: boolean
  hasLuminous: boolean
  hasRadiant: boolean
  hasGlowing: boolean
  hasEthereal: boolean
  hasShimmering: boolean
  hasIridescent: boolean
  hasBrilliant: boolean
  hasSoft: boolean
  hasGentle: boolean
  hasLustrous: boolean
  hasOpalescent: boolean
  crypticCount: number
  mysteryCount: number
}

export interface RevealingMeasure {
  clarity: number
  shadow: 'umbra-clear' | 'penumbra-visible' | 'proper-eclipse' | 'dark-shadow' | 'total-blackout' | 'no-clarity'
  hasHighClarity: boolean
  hasSelfDocumenting: boolean
  hasNoUndocumented: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasOpen: boolean
  hasRevealed: boolean
  hasExposed: boolean
  hasDirect: boolean
  hasObvious: boolean
  hasApparent: boolean
  hasEvident: boolean
  hasClean: boolean
  hasManifest: boolean
  undocumentedCount: number
  obfuscatedCount: number
}

export interface AligningMeasure {
  precision: number
  alignment: 'perfect-syzygy' | 'precise-alignment' | 'proper-orbit' | 'wobbly-path' | 'chaotic-drift' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasPrecise: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasClean: boolean
  hasCorrect: boolean
  hasCalculated: boolean
  hasCalibrated: boolean
  hasSynchronized: boolean
  hasAligned: boolean
  unsafeCount: number
  approximateCount: number
}

export interface EnduringMeasure {
  resilience: number
  phase: 'blood-moon' | 'total-eclipse' | 'proper-shadow' | 'partial-eclipse' | 'no-eclipse' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasDurable: boolean
  hasEnduring: boolean
  hasLasting: boolean
  hasPersistent: boolean
  hasSteadfast: boolean
  hasUnwavering: boolean
  hasResilient: boolean
  unhandledCount: number
  untestedCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  cycle: 'lunar-master' | 'tide-sage' | 'proper-astronomer' | 'sky-watcher' | 'lost-wanderer' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasStrategic: boolean
  hasHolistic: boolean
  hasProven: boolean
  hasMature: boolean
  hasInsightful: boolean
  hasVisionary: boolean
  hasComprehensive: boolean
  hasConnected: boolean
  hasCyclical: boolean
  hasWise: boolean
  hasRhythmic: boolean
  hackedCount: number
  shallowCount: number
}

export type MoonstoneCondition =
  | 'moonstone-masterpiece'
  | 'lunar-gem'
  | 'proper-moonstone'
  | 'cloudy-stone'
  | 'dark-rock'
  | 'void'

export interface MoonstoneRay {
  file: string
  lunarLuminescence: number
  shadowClarity: number
  tidePrecision: number
  eclipseResilience: number
  lunarWisdom: number
  glowing: GlowingMeasure
  revealing: RevealingMeasure
  aligning: AligningMeasure
  enduring: EnduringMeasure
  understanding: UnderstandingMeasure
  condition: MoonstoneCondition
  qualityScore: number
}

export type PhaseType =
  | 'full-moon'
  | 'waxing-gibbous'
  | 'proper-quarter'
  | 'waning-crescent'
  | 'new-moon'
  | 'no-phase'

export type PhaseCondition =
  | 'moonstone-palace'
  | 'lunar-tower'
  | 'proper-observatory'
  | 'stone-circle'
  | 'empty-field'
  | 'void'

export interface MoonstonePhase {
  directory: string
  rays: MoonstoneRay[]
  avgLuminescence: number
  avgPrecision: number
  avgWisdom: number
  moonstoneMasterpieceCount: number
  voidCount: number
  phaseType: PhaseType
  condition: PhaseCondition
}

export type AstronomerGrade = 'eclipse-master' | 'lunar-scholar' | 'proper-observer' | 'amateur' | 'novice' | 'blind-folded'

export interface MoonstoneEclipseResult {
  rays: MoonstoneRay[]
  phases: MoonstonePhase[]
  eclipse: {
    avgLuminescence: number
    avgPrecision: number
    avgWisdom: number
    isMoonstone: boolean
    overallLuminescence: number
  }
  stats: {
    totalFiles: number
    totalPhases: number
    avgLunarLuminescence: number
    avgShadowClarity: number
    avgTidePrecision: number
    avgEclipseResilience: number
    avgLunarWisdom: number
    moonstoneMasterpieceCount: number
    lunarGemCount: number
    properMoonstoneCount: number
    cloudyStoneCount: number
    darkRockCount: number
    voidCount: number
    hasHighLuminescenceCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallLuminescence: number
    astronomerGrade: AstronomerGrade
    bestRay: string
    brightest: string
    clearest: string
    mostPrecise: string
    mostResilient: string
    wisest: string
  }
  recommendations: string[]
}

// ─── Score computation ──────────────────────────────────

function computeScore(positiveBooleans: boolean[]): number {
  const total = positiveBooleans.length
  const perFeature = total > 0 ? Math.floor(100 / total) : 0
  const remainder = total > 0 ? 100 - perFeature * total : 0
  let score = 0
  for (let i = 0; i < total; i++) {
    if (positiveBooleans[i]) {
      score += perFeature + (i < remainder ? 1 : 0)
    }
  }
  return score
}

// ─── Classifiers ────────────────────────────────────────

/** @example classifyMoonstoneCondition(90) */
export function classifyMoonstoneCondition(score: number): MoonstoneCondition {
  if (score >= 90) return 'moonstone-masterpiece'
  if (score >= 75) return 'lunar-gem'
  if (score >= 60) return 'proper-moonstone'
  if (score >= 40) return 'cloudy-stone'
  if (score >= 20) return 'dark-rock'
  return 'void'
}

/** @example classifyPhaseType(rays) */
export function classifyPhaseType(rays: MoonstoneRay[]): PhaseType {
  if (rays.length === 0) return 'no-phase'
  const avg = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  if (avg >= 85) return 'full-moon'
  if (avg >= 70) return 'waxing-gibbous'
  if (avg >= 55) return 'proper-quarter'
  if (avg >= 35) return 'waning-crescent'
  return 'new-moon'
}

/** @example classifyPhaseCondition(85) */
export function classifyPhaseCondition(score: number): PhaseCondition {
  if (score >= 85) return 'moonstone-palace'
  if (score >= 70) return 'lunar-tower'
  if (score >= 55) return 'proper-observatory'
  if (score >= 35) return 'stone-circle'
  if (score >= 15) return 'empty-field'
  return 'void'
}

/** @example classifyAstronomerGrade(80) */
export function classifyAstronomerGrade(avgLuminescence: number): AstronomerGrade {
  if (avgLuminescence >= 80) return 'eclipse-master'
  if (avgLuminescence >= 65) return 'lunar-scholar'
  if (avgLuminescence >= 50) return 'proper-observer'
  if (avgLuminescence >= 35) return 'amateur'
  if (avgLuminescence >= 20) return 'novice'
  return 'blind-folded'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureGlowing('export class X { readonly y: string }') */
export function measureGlowing(content: string): GlowingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane|esoteric)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasLuminous = /\b(import|export)\b/.test(content)
  const hasRadiant = !/\bany\b/.test(content)
  const hasGlowing = /\b(readonly|private|protected)\b/.test(content)
  const hasEthereal = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasShimmering = /\b(async|await|Promise)\b/.test(content)
  const hasIridescent = /\b(if|return)\b/.test(content)
  const hasBrilliant = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSoft = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasGentle = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasLustrous = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasOpalescent = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasLuminous,
    hasRadiant, hasGlowing, hasEthereal, hasShimmering, hasIridescent,
    hasBrilliant, hasSoft, hasGentle, hasLustrous, hasOpalescent,
  ]

  const luminescence = computeScore(positiveBooleans)
  const hasHighLuminescence = luminescence >= 60

  let light: GlowingMeasure['light'] = 'no-luminescence'
  if (luminescence >= 90) light = 'full-moon-glow'
  else if (luminescence >= 75) light = 'moonstone-shimmer'
  else if (luminescence >= 60) light = 'proper-adularescence'
  else if (luminescence >= 40) light = 'cloudy-moon'
  else if (luminescence >= 20) light = 'new-moon'

  return {
    luminescence, light, hasHighLuminescence,
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasLuminous,
    hasRadiant, hasGlowing, hasEthereal, hasShimmering, hasIridescent,
    hasBrilliant, hasSoft, hasGentle, hasLustrous, hasOpalescent,
    crypticCount, mysteryCount,
  }
}

/** @example measureRevealing('export class X { readonly y: string }') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasSelfDocumenting = /\b(class|interface|type)\b/.test(content)
  const undocumentedCount = (content.match(/\b(undocumented|unexplained|unclear|obscured)\b/gi) ?? []).length
  const hasNoUndocumented = undocumentedCount === 0
  const hasTransparent = !/\bany\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscated|encoded|encrypted|mangled)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasUnderstandable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasVisible = /\b(import|export)\b/.test(content)
  const hasOpen = /\b(readonly|private|protected)\b/.test(content)
  const hasRevealed = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasExposed = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasObvious = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasApparent = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasEvident = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasClean = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasManifest = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasSelfDocumenting, hasNoUndocumented, hasTransparent, hasNoObfuscated, hasUnderstandable,
    hasVisible, hasOpen, hasRevealed, hasExposed, hasDirect,
    hasObvious, hasApparent, hasEvident, hasClean, hasManifest,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let shadow: RevealingMeasure['shadow'] = 'no-clarity'
  if (clarity >= 90) shadow = 'umbra-clear'
  else if (clarity >= 75) shadow = 'penumbra-visible'
  else if (clarity >= 60) shadow = 'proper-eclipse'
  else if (clarity >= 40) shadow = 'dark-shadow'
  else if (clarity >= 20) shadow = 'total-blackout'

  return {
    clarity, shadow, hasHighClarity,
    hasSelfDocumenting, hasNoUndocumented, hasTransparent, hasNoObfuscated, hasUnderstandable,
    hasVisible, hasOpen, hasRevealed, hasExposed, hasDirect,
    hasObvious, hasApparent, hasEvident, hasClean, hasManifest,
    undocumentedCount, obfuscatedCount,
  }
}

/** @example measureAligning('export class X { readonly y: string }') */
export function measureAligning(content: string): AligningMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|vague|imprecise)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)
  const hasSharp = /\b(import|export)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = /\b(function|=>|return)\b/.test(content)
  const hasClean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasCorrect = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasCalculated = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCalibrated = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasSynchronized = /\b(try|catch|if)\b/.test(content)
  const hasAligned = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasCalculated, hasCalibrated, hasSynchronized, hasAligned,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let alignment: AligningMeasure['alignment'] = 'no-precision'
  if (precision >= 90) alignment = 'perfect-syzygy'
  else if (precision >= 75) alignment = 'precise-alignment'
  else if (precision >= 60) alignment = 'proper-orbit'
  else if (precision >= 40) alignment = 'wobbly-path'
  else if (precision >= 20) alignment = 'chaotic-drift'

  return {
    precision, alignment, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasCalculated, hasCalibrated, hasSynchronized, hasAligned,
    unsafeCount, approximateCount,
  }
}

/** @example measureEnduring('export class X { readonly y: string }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|bare-throw|raw-error)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|return)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(class|interface|type)\b/.test(content)
  const hasDurable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasLasting = !/\bany\b/.test(content)
  const hasPersistent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasSteadfast = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasUnwavering = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasResilient = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasDurable, hasEnduring, hasLasting,
    hasPersistent, hasSteadfast, hasUnwavering, hasResilient,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let phase: EnduringMeasure['phase'] = 'no-resilience'
  if (resilience >= 90) phase = 'blood-moon'
  else if (resilience >= 75) phase = 'total-eclipse'
  else if (resilience >= 60) phase = 'proper-shadow'
  else if (resilience >= 40) phase = 'partial-eclipse'
  else if (resilience >= 20) phase = 'no-eclipse'

  return {
    resilience, phase, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasDurable, hasEnduring, hasLasting,
    hasPersistent, hasSteadfast, hasUnwavering, hasResilient,
    unhandledCount, untestedCount,
  }
}

/** @example measureUnderstanding('export class X { readonly y: string }') */
export function measureUnderstanding(content: string): UnderstandingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasStrategic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasHolistic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasProven = /\b(readonly|private|protected)\b/.test(content)
  const hasMature = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVisionary = /\b(async|await|Promise)\b/.test(content)
  const hasComprehensive = /\b(try|catch|if)\b/.test(content)
  const hasConnected = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasCyclical = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasRhythmic = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasCyclical, hasWise, hasRhythmic,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let cycle: UnderstandingMeasure['cycle'] = 'no-wisdom'
  if (wisdom >= 90) cycle = 'lunar-master'
  else if (wisdom >= 75) cycle = 'tide-sage'
  else if (wisdom >= 60) cycle = 'proper-astronomer'
  else if (wisdom >= 40) cycle = 'sky-watcher'
  else if (wisdom >= 20) cycle = 'lost-wanderer'

  return {
    wisdom, cycle, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasCyclical, hasWise, hasRhythmic,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeMoonstoneRay(content, 'app.ts') */
export function analyzeMoonstoneRay(content: string, filePath: string): MoonstoneRay {
  const glowing = measureGlowing(content)
  const revealing = measureRevealing(content)
  const aligning = measureAligning(content)
  const enduring = measureEnduring(content)
  const understanding = measureUnderstanding(content)

  const lunarLuminescence = glowing.luminescence
  const shadowClarity = revealing.clarity
  const tidePrecision = aligning.precision
  const eclipseResilience = enduring.resilience
  const lunarWisdom = understanding.wisdom

  const qualityScore = Math.round(
    lunarLuminescence * 0.2 +
    shadowClarity * 0.2 +
    tidePrecision * 0.2 +
    eclipseResilience * 0.2 +
    lunarWisdom * 0.2,
  )

  const condition = classifyMoonstoneCondition(qualityScore)

  return {
    file: filePath,
    lunarLuminescence, shadowClarity, tidePrecision, eclipseResilience, lunarWisdom,
    glowing, revealing, aligning, enduring, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeMoonstonePhase(rays, 'src') */
export function analyzeMoonstonePhase(rays: MoonstoneRay[], dirPath: string): MoonstonePhase {
  if (rays.length === 0) {
    return {
      directory: dirPath, rays: [],
      avgLuminescence: 0, avgPrecision: 0, avgWisdom: 0,
      moonstoneMasterpieceCount: 0, voidCount: 0,
      phaseType: 'no-phase', condition: 'void',
    }
  }

  const avgLuminescence = Math.round(rays.reduce((s, r) => s + r.lunarLuminescence, 0) / rays.length)
  const avgPrecision = Math.round(rays.reduce((s, r) => s + r.tidePrecision, 0) / rays.length)
  const avgWisdom = Math.round(rays.reduce((s, r) => s + r.lunarWisdom, 0) / rays.length)
  const moonstoneMasterpieceCount = rays.filter((r) => r.condition === 'moonstone-masterpiece').length
  const voidCount = rays.filter((r) => r.condition === 'void').length
  const phaseType = classifyPhaseType(rays)
  const avgQuality = Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)
  const condition = classifyPhaseCondition(avgQuality)

  return {
    directory: dirPath, rays,
    avgLuminescence, avgPrecision, avgWisdom,
    moonstoneMasterpieceCount, voidCount,
    phaseType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildMoonstoneEclipseResult(['a.ts'], [content]) */
export async function buildMoonstoneEclipseResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<MoonstoneEclipseResult> {
  const rays: MoonstoneRay[] = files.map((file, i) =>
    analyzeMoonstoneRay(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, MoonstoneRay[]>()
  for (const ray of rays) {
    const dir = ray.file.includes('/')
      ? ray.file.substring(0, ray.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ray)
    } else {
      dirMap.set(dir, [ray])
    }
  }

  const phases: MoonstonePhase[] = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzeMoonstonePhase(dirRays, dir),
  )

  const avgLunarLuminescence = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.lunarLuminescence, 0) / rays.length) : 0
  const avgShadowClarity = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.shadowClarity, 0) / rays.length) : 0
  const avgTidePrecision = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.tidePrecision, 0) / rays.length) : 0
  const avgEclipseResilience = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.eclipseResilience, 0) / rays.length) : 0
  const avgLunarWisdom = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.lunarWisdom, 0) / rays.length) : 0

  const overallLuminescence = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length) : 0
  const isMoonstone = overallLuminescence >= 60

  const eclipse: MoonstoneEclipseResult['eclipse'] = {
    avgLuminescence: avgLunarLuminescence, avgPrecision: avgTidePrecision, avgWisdom: avgLunarWisdom,
    isMoonstone, overallLuminescence,
  }

  const moonstoneMasterpieceCount = rays.filter((r) => r.condition === 'moonstone-masterpiece').length
  const lunarGemCount = rays.filter((r) => r.condition === 'lunar-gem').length
  const properMoonstoneCount = rays.filter((r) => r.condition === 'proper-moonstone').length
  const cloudyStoneCount = rays.filter((r) => r.condition === 'cloudy-stone').length
  const darkRockCount = rays.filter((r) => r.condition === 'dark-rock').length
  const voidCount = rays.filter((r) => r.condition === 'void').length

  const hasHighLuminescenceCount = rays.filter((r) => r.glowing.hasHighLuminescence).length
  const hasHighClarityCount = rays.filter((r) => r.revealing.hasHighClarity).length
  const hasHighPrecisionCount = rays.filter((r) => r.aligning.hasHighPrecision).length
  const hasHighResilienceCount = rays.filter((r) => r.enduring.hasHighResilience).length
  const hasHighWisdomCount = rays.filter((r) => r.understanding.hasHighWisdom).length

  const astronomerGrade = classifyAstronomerGrade(overallLuminescence)

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => (r.qualityScore > best.qualityScore ? r : best)).file : ''
  const brightest = rays.length > 0
    ? rays.reduce((best, r) => (r.lunarLuminescence > best.lunarLuminescence ? r : best)).file : ''
  const clearest = rays.length > 0
    ? rays.reduce((best, r) => (r.shadowClarity > best.shadowClarity ? r : best)).file : ''
  const mostPrecise = rays.length > 0
    ? rays.reduce((best, r) => (r.tidePrecision > best.tidePrecision ? r : best)).file : ''
  const mostResilient = rays.length > 0
    ? rays.reduce((best, r) => (r.eclipseResilience > best.eclipseResilience ? r : best)).file : ''
  const wisest = rays.length > 0
    ? rays.reduce((best, r) => (r.lunarWisdom > best.lunarWisdom ? r : best)).file : ''

  const stats: MoonstoneEclipseResult['stats'] = {
    totalFiles: files.length, totalPhases: phases.length,
    avgLunarLuminescence, avgShadowClarity, avgTidePrecision, avgEclipseResilience, avgLunarWisdom,
    moonstoneMasterpieceCount, lunarGemCount, properMoonstoneCount, cloudyStoneCount, darkRockCount, voidCount,
    hasHighLuminescenceCount, hasHighClarityCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallLuminescence, astronomerGrade,
    bestRay, brightest, clearest, mostPrecise, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(rays, phases, eclipse, stats)

  return {
    rays, phases, eclipse, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(rays, phases, eclipse, stats) */
export function generateRecommendations(
  rays: MoonstoneRay[],
  phases: MoonstonePhase[],
  _eclipse: MoonstoneEclipseResult['eclipse'],
  stats: MoonstoneEclipseResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgLunarLuminescence >= 90 &&
    stats.avgShadowClarity >= 90 &&
    stats.avgTidePrecision >= 90 &&
    stats.avgEclipseResilience >= 90 &&
    stats.avgLunarWisdom >= 90
  ) {
    recs.push(
      'Your moonstone eclipse radiates with eclipse-master precision! Lunar luminescence is full-moon-glow, shadow clarity is umbra-clear, tide precision is perfect-syzygy, eclipse resilience is blood-moon, and lunar wisdom is lunar-master!',
    )
    return recs
  }

  if (stats.avgLunarLuminescence < 60) {
    recs.push(
      'Brighten lunar luminescence — the moonstone must glow from within; eliminate cryptic patterns, embrace clear naming, and cultivate adularescent radiance'
    )
  }

  if (stats.avgShadowClarity < 60) {
    recs.push(
      'Illuminate shadow clarity — the eclipse must reveal, not conceal; document thoroughly, eliminate obfuscation, and let understanding penetrate the umbra'
    )
  }

  if (stats.avgTidePrecision < 60) {
    recs.push(
      'Align tide precision — the gravitational pull must be exact; tighten types, eliminate unsafe patterns, and achieve perfect-syzygy alignment'
    )
  }

  if (stats.avgEclipseResilience < 60) {
    recs.push(
      'Strengthen eclipse resilience — the code must endure the shadow; add error handling, test thoroughly, and build blood-moon endurance'
    )
  }

  if (stats.avgLunarWisdom < 60) {
    recs.push(
      'Deepen lunar wisdom — the astronomer must understand the cycles; build with principled architecture, proven patterns, and lunar-master insight'
    )
  }

  if (stats.overallLuminescence < 40) {
    recs.push(
      'The eclipse is total darkness — dark rock and cloudy stone outnumber the moonstones, and no light escapes'
    )
  }

  const voidRays = rays.filter((r) => r.condition === 'void')
  if (voidRays.length > 0 && voidRays.length <= 5) {
    recs.push(`Return these dark rocks to the eclipse: ${voidRays.map((r) => r.file).join(', ')}`)
  } else if (voidRays.length > 5) {
    recs.push(`Return ${voidRays.length} dark rocks to the eclipse before the last light fades completely`)
  }

  const poorPhases = phases.filter((p) => p.condition === 'void' || p.condition === 'empty-field')
  if (poorPhases.length === phases.length && phases.length > 0) {
    recs.push('All phases are empty fields — the moonstone eclipse needs moonstone-palace quality rays throughout')
  }

  if (recs.length === 0) {
    recs.push('Your moonstone eclipse glows with lunar perfection — every ray carries lunar luminescence, shadow clarity, tide precision, eclipse resilience, and lunar wisdom')
  }

  return recs
}
