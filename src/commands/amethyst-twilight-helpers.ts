// ─── Interfaces ──────────────────────────────────────────

export interface CalmingMeasure {
  serenity: number
  peace: 'deep-meditation' | 'quiet-dusk' | 'proper-calm' | 'restless-evening' | 'turbulent-storm' | 'no-serenity'
  hasHighSerenity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasOrganized: boolean
  hasNoChaotic: boolean
  hasClear: boolean
  hasNoMystery: boolean
  hasCalm: boolean
  hasPeaceful: boolean
  hasComposed: boolean
  hasTranquil: boolean
  hasSerene: boolean
  hasGentle: boolean
  hasQuiet: boolean
  hasHarmonious: boolean
  hasBalanced: boolean
  crypticCount: number
  chaoticCount: number
}

export interface RevealingMeasure {
  clarity: number
  vision: 'purple-clarity' | 'dusk-vision' | 'proper-sight' | 'twilight-haze' | 'night-blindness' | 'no-clarity'
  hasHighClarity: boolean
  hasSelfDocumenting: boolean
  hasNoUndocumented: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasOpen: boolean
  hasDirect: boolean
  hasRevealed: boolean
  hasExposed: boolean
  hasManifest: boolean
  hasApparent: boolean
  hasClean: boolean
  hasObvious: boolean
  hasEvident: boolean
  undocumentedCount: number
  obfuscatedCount: number
}

export interface HoningMeasure {
  precision: number
  edge: 'twilight-sharp' | 'dusk-blade' | 'proper-edge' | 'blunt-tool' | 'dull-stone' | 'no-precision'
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
  hasRefined: boolean
  hasPolished: boolean
  hasHoned: boolean
  hasTooled: boolean
  unsafeCount: number
  approximateCount: number
}

export interface SurvivingMeasure {
  resilience: number
  night: 'eternal-vigil' | 'night-watch' | 'proper-guard' | 'sleeping-sentinel' | 'no-guard' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasDurable: boolean
  hasPersistent: boolean
  hasSteadfast: boolean
  hasRelentless: boolean
  hasUnyielding: boolean
  unhandledCount: number
  untestedCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  depth: 'mystic-sage' | 'twilight-philosopher' | 'proper-scholar' | 'surface-thinker' | 'no-understanding' | 'no-wisdom'
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
  hasTranscendent: boolean
  hasWise: boolean
  hasProfound: boolean
  hackedCount: number
  shallowCount: number
}

export type AmethystCondition =
  | 'amethyst-masterpiece'
  | 'violet-gem'
  | 'proper-amethyst'
  | 'pale-quartz'
  | 'rough-stone'
  | 'void'

export interface AmethystGlow {
  file: string
  violetSerenity: number
  twilightClarity: number
  duskPrecision: number
  eveningResilience: number
  purpleWisdom: number
  calming: CalmingMeasure
  revealing: RevealingMeasure
  honing: HoningMeasure
  surviving: SurvivingMeasure
  understanding: UnderstandingMeasure
  condition: AmethystCondition
  qualityScore: number
}

export type SkyType =
  | 'purple-twilight'
  | 'violet-dusk'
  | 'proper-evening'
  | 'gray-dawn'
  | 'dark-night'
  | 'no-sky'

export type SkyCondition =
  | 'amethyst-palace'
  | 'violet-tower'
  | 'proper-temple'
  | 'stone-chapel'
  | 'wooden-shack'
  | 'void'

export interface AmethystSky {
  directory: string
  glows: AmethystGlow[]
  avgSerenity: number
  avgPrecision: number
  avgWisdom: number
  amethystMasterpieceCount: number
  voidCount: number
  skyType: SkyType
  condition: SkyCondition
}

export type PhilosopherGrade = 'mystic-sage' | 'twilight-scholar' | 'proper-observer' | 'apprentice' | 'novice' | 'daydreamer'

export interface AmethystTwilightResult {
  glows: AmethystGlow[]
  skies: AmethystSky[]
  dusk: {
    avgSerenity: number
    avgPrecision: number
    avgWisdom: number
    isAmethyst: boolean
    overallSerenity: number
  }
  stats: {
    totalFiles: number
    totalSkies: number
    avgVioletSerenity: number
    avgTwilightClarity: number
    avgDuskPrecision: number
    avgEveningResilience: number
    avgPurpleWisdom: number
    amethystMasterpieceCount: number
    violetGemCount: number
    properAmethystCount: number
    paleQuartzCount: number
    roughStoneCount: number
    voidCount: number
    hasHighSerenityCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallSerenity: number
    philosopherGrade: PhilosopherGrade
    bestGlow: string
    mostSerene: string
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

/** @example classifyAmethystCondition(90) */
export function classifyAmethystCondition(score: number): AmethystCondition {
  if (score >= 90) return 'amethyst-masterpiece'
  if (score >= 75) return 'violet-gem'
  if (score >= 60) return 'proper-amethyst'
  if (score >= 40) return 'pale-quartz'
  if (score >= 20) return 'rough-stone'
  return 'void'
}

/** @example classifySkyType(glows) */
export function classifySkyType(glows: AmethystGlow[]): SkyType {
  if (glows.length === 0) return 'no-sky'
  const avg = glows.reduce((s, g) => s + g.qualityScore, 0) / glows.length
  if (avg >= 85) return 'purple-twilight'
  if (avg >= 70) return 'violet-dusk'
  if (avg >= 55) return 'proper-evening'
  if (avg >= 35) return 'gray-dawn'
  return 'dark-night'
}

/** @example classifySkyCondition(85) */
export function classifySkyCondition(score: number): SkyCondition {
  if (score >= 85) return 'amethyst-palace'
  if (score >= 70) return 'violet-tower'
  if (score >= 55) return 'proper-temple'
  if (score >= 35) return 'stone-chapel'
  if (score >= 15) return 'wooden-shack'
  return 'void'
}

/** @example classifyPhilosopherGrade(80) */
export function classifyPhilosopherGrade(avgSerenity: number): PhilosopherGrade {
  if (avgSerenity >= 80) return 'mystic-sage'
  if (avgSerenity >= 65) return 'twilight-scholar'
  if (avgSerenity >= 50) return 'proper-observer'
  if (avgSerenity >= 35) return 'apprentice'
  if (avgSerenity >= 20) return 'novice'
  return 'daydreamer'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureCalming('export class X { readonly y: string }') */
export function measureCalming(content: string): CalmingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane|esoteric)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasOrganized = /\b(import|export)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|disordered|jumbled)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoMystery = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length === 0
  const hasCalm = !/\bany\b/.test(content)
  const hasPeaceful = /\b(readonly|private|protected)\b/.test(content)
  const hasComposed = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTranquil = /\b(if|return)\b/.test(content)
  const hasSerene = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasGentle = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasQuiet = /\b(async|await|Promise)\b/.test(content)
  const hasHarmonious = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasBalanced = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasOrganized, hasNoChaotic, hasClear,
    hasNoMystery, hasCalm, hasPeaceful, hasComposed, hasTranquil,
    hasSerene, hasGentle, hasQuiet, hasHarmonious, hasBalanced,
  ]

  const serenity = computeScore(positiveBooleans)
  const hasHighSerenity = serenity >= 60

  let peace: CalmingMeasure['peace'] = 'no-serenity'
  if (serenity >= 90) peace = 'deep-meditation'
  else if (serenity >= 75) peace = 'quiet-dusk'
  else if (serenity >= 60) peace = 'proper-calm'
  else if (serenity >= 40) peace = 'restless-evening'
  else if (serenity >= 20) peace = 'turbulent-storm'

  return {
    serenity, peace, hasHighSerenity,
    hasReadable, hasNoCryptic, hasOrganized, hasNoChaotic, hasClear,
    hasNoMystery, hasCalm, hasPeaceful, hasComposed, hasTranquil,
    hasSerene, hasGentle, hasQuiet, hasHarmonious, hasBalanced,
    crypticCount, chaoticCount,
  }
}

/** @example measureRevealing('export class X { readonly y: string }') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasSelfDocumenting = /\b(class|interface|type)\b/.test(content)
  const undocumentedCount = (content.match(/\b(undocumented|undocumented|undocumented)\b/gi) ?? []).length
  const hasNoUndocumented = (content.match(/\b(undocumented|unexplained|unclear|obscured)\b/gi) ?? []).length === 0
  const hasTransparent = !/\bany\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscated|encoded|encrypted|mangled)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasUnderstandable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasVisible = /\b(import|export)\b/.test(content)
  const hasOpen = /\b(readonly|private|protected)\b/.test(content)
  const hasDirect = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRevealed = /\b(function|=>|return)\b/.test(content)
  const hasExposed = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasManifest = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasApparent = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasObvious = /\b(try|catch|if)\b/.test(content)
  const hasEvident = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasSelfDocumenting, hasNoUndocumented, hasTransparent, hasNoObfuscated, hasUnderstandable,
    hasVisible, hasOpen, hasDirect, hasRevealed, hasExposed,
    hasManifest, hasApparent, hasClean, hasObvious, hasEvident,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let vision: RevealingMeasure['vision'] = 'no-clarity'
  if (clarity >= 90) vision = 'purple-clarity'
  else if (clarity >= 75) vision = 'dusk-vision'
  else if (clarity >= 60) vision = 'proper-sight'
  else if (clarity >= 40) vision = 'twilight-haze'
  else if (clarity >= 20) vision = 'night-blindness'

  return {
    clarity, vision, hasHighClarity,
    hasSelfDocumenting, hasNoUndocumented, hasTransparent, hasNoObfuscated, hasUnderstandable,
    hasVisible, hasOpen, hasDirect, hasRevealed, hasExposed,
    hasManifest, hasApparent, hasClean, hasObvious, hasEvident,
    undocumentedCount, obfuscatedCount,
  }
}

/** @example measureHoning('export class X { readonly y: string }') */
export function measureHoning(content: string): HoningMeasure {
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
  const hasRefined = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPolished = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasHoned = /\b(try|catch|if)\b/.test(content)
  const hasTooled = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasRefined, hasPolished, hasHoned, hasTooled,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let edge: HoningMeasure['edge'] = 'no-precision'
  if (precision >= 90) edge = 'twilight-sharp'
  else if (precision >= 75) edge = 'dusk-blade'
  else if (precision >= 60) edge = 'proper-edge'
  else if (precision >= 40) edge = 'blunt-tool'
  else if (precision >= 20) edge = 'dull-stone'

  return {
    precision, edge, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasRefined, hasPolished, hasHoned, hasTooled,
    unsafeCount, approximateCount,
  }
}

/** @example measureSurviving('export class X { readonly y: string }') */
export function measureSurviving(content: string): SurvivingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|bare-throw|raw-error)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|return)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(class|interface|type)\b/.test(content)
  const hasHardened = !/\bany\b/.test(content)
  const hasEnduring = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasDurable = /\b(readonly|private|protected)\b/.test(content)
  const hasPersistent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasSteadfast = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasRelentless = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUnyielding = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasEnduring, hasDurable,
    hasPersistent, hasSteadfast, hasRelentless, hasUnyielding,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let night: SurvivingMeasure['night'] = 'no-resilience'
  if (resilience >= 90) night = 'eternal-vigil'
  else if (resilience >= 75) night = 'night-watch'
  else if (resilience >= 60) night = 'proper-guard'
  else if (resilience >= 40) night = 'sleeping-sentinel'
  else if (resilience >= 20) night = 'no-guard'

  return {
    resilience, night, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasEnduring, hasDurable,
    hasPersistent, hasSteadfast, hasRelentless, hasUnyielding,
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
  const hasTranscendent = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasProfound = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTranscendent, hasWise, hasProfound,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let depth: UnderstandingMeasure['depth'] = 'no-wisdom'
  if (wisdom >= 90) depth = 'mystic-sage'
  else if (wisdom >= 75) depth = 'twilight-philosopher'
  else if (wisdom >= 60) depth = 'proper-scholar'
  else if (wisdom >= 40) depth = 'surface-thinker'
  else if (wisdom >= 20) depth = 'no-understanding'

  return {
    wisdom, depth, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTranscendent, hasWise, hasProfound,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeAmethystGlow(content, 'app.ts') */
export function analyzeAmethystGlow(content: string, filePath: string): AmethystGlow {
  const calming = measureCalming(content)
  const revealing = measureRevealing(content)
  const honing = measureHoning(content)
  const surviving = measureSurviving(content)
  const understanding = measureUnderstanding(content)

  const violetSerenity = calming.serenity
  const twilightClarity = revealing.clarity
  const duskPrecision = honing.precision
  const eveningResilience = surviving.resilience
  const purpleWisdom = understanding.wisdom

  const qualityScore = Math.round(
    violetSerenity * 0.2 +
    twilightClarity * 0.2 +
    duskPrecision * 0.2 +
    eveningResilience * 0.2 +
    purpleWisdom * 0.2,
  )

  const condition = classifyAmethystCondition(qualityScore)

  return {
    file: filePath,
    violetSerenity, twilightClarity, duskPrecision, eveningResilience, purpleWisdom,
    calming, revealing, honing, surviving, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeAmethystSky(glows, 'src') */
export function analyzeAmethystSky(glows: AmethystGlow[], dirPath: string): AmethystSky {
  if (glows.length === 0) {
    return {
      directory: dirPath, glows: [],
      avgSerenity: 0, avgPrecision: 0, avgWisdom: 0,
      amethystMasterpieceCount: 0, voidCount: 0,
      skyType: 'no-sky', condition: 'void',
    }
  }

  const avgSerenity = Math.round(glows.reduce((s, g) => s + g.violetSerenity, 0) / glows.length)
  const avgPrecision = Math.round(glows.reduce((s, g) => s + g.duskPrecision, 0) / glows.length)
  const avgWisdom = Math.round(glows.reduce((s, g) => s + g.purpleWisdom, 0) / glows.length)
  const amethystMasterpieceCount = glows.filter((g) => g.condition === 'amethyst-masterpiece').length
  const voidCount = glows.filter((g) => g.condition === 'void').length
  const skyType = classifySkyType(glows)
  const avgQuality = Math.round(glows.reduce((s, g) => s + g.qualityScore, 0) / glows.length)
  const condition = classifySkyCondition(avgQuality)

  return {
    directory: dirPath, glows,
    avgSerenity, avgPrecision, avgWisdom,
    amethystMasterpieceCount, voidCount,
    skyType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildAmethystTwilightResult(['a.ts'], [content]) */
export async function buildAmethystTwilightResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmethystTwilightResult> {
  const glows: AmethystGlow[] = files.map((file, i) =>
    analyzeAmethystGlow(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AmethystGlow[]>()
  for (const glow of glows) {
    const dir = glow.file.includes('/')
      ? glow.file.substring(0, glow.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(glow)
    } else {
      dirMap.set(dir, [glow])
    }
  }

  const skies: AmethystSky[] = Array.from(dirMap.entries()).map(([dir, dirGlows]) =>
    analyzeAmethystSky(dirGlows, dir),
  )

  const avgVioletSerenity = glows.length > 0
    ? Math.round(glows.reduce((s, g) => s + g.violetSerenity, 0) / glows.length) : 0
  const avgTwilightClarity = glows.length > 0
    ? Math.round(glows.reduce((s, g) => s + g.twilightClarity, 0) / glows.length) : 0
  const avgDuskPrecision = glows.length > 0
    ? Math.round(glows.reduce((s, g) => s + g.duskPrecision, 0) / glows.length) : 0
  const avgEveningResilience = glows.length > 0
    ? Math.round(glows.reduce((s, g) => s + g.eveningResilience, 0) / glows.length) : 0
  const avgPurpleWisdom = glows.length > 0
    ? Math.round(glows.reduce((s, g) => s + g.purpleWisdom, 0) / glows.length) : 0

  const overallSerenity = glows.length > 0
    ? Math.round(glows.reduce((s, g) => s + g.qualityScore, 0) / glows.length) : 0
  const isAmethyst = overallSerenity >= 60

  const dusk: AmethystTwilightResult['dusk'] = {
    avgSerenity: avgVioletSerenity, avgPrecision: avgDuskPrecision, avgWisdom: avgPurpleWisdom,
    isAmethyst, overallSerenity,
  }

  const amethystMasterpieceCount = glows.filter((g) => g.condition === 'amethyst-masterpiece').length
  const violetGemCount = glows.filter((g) => g.condition === 'violet-gem').length
  const properAmethystCount = glows.filter((g) => g.condition === 'proper-amethyst').length
  const paleQuartzCount = glows.filter((g) => g.condition === 'pale-quartz').length
  const roughStoneCount = glows.filter((g) => g.condition === 'rough-stone').length
  const voidCount = glows.filter((g) => g.condition === 'void').length

  const hasHighSerenityCount = glows.filter((g) => g.calming.hasHighSerenity).length
  const hasHighClarityCount = glows.filter((g) => g.revealing.hasHighClarity).length
  const hasHighPrecisionCount = glows.filter((g) => g.honing.hasHighPrecision).length
  const hasHighResilienceCount = glows.filter((g) => g.surviving.hasHighResilience).length
  const hasHighWisdomCount = glows.filter((g) => g.understanding.hasHighWisdom).length

  const philosopherGrade = classifyPhilosopherGrade(overallSerenity)

  const bestGlow = glows.length > 0
    ? glows.reduce((best, g) => (g.qualityScore > best.qualityScore ? g : best)).file : ''
  const mostSerene = glows.length > 0
    ? glows.reduce((best, g) => (g.violetSerenity > best.violetSerenity ? g : best)).file : ''
  const clearest = glows.length > 0
    ? glows.reduce((best, g) => (g.twilightClarity > best.twilightClarity ? g : best)).file : ''
  const mostPrecise = glows.length > 0
    ? glows.reduce((best, g) => (g.duskPrecision > best.duskPrecision ? g : best)).file : ''
  const mostResilient = glows.length > 0
    ? glows.reduce((best, g) => (g.eveningResilience > best.eveningResilience ? g : best)).file : ''
  const wisest = glows.length > 0
    ? glows.reduce((best, g) => (g.purpleWisdom > best.purpleWisdom ? g : best)).file : ''

  const stats: AmethystTwilightResult['stats'] = {
    totalFiles: files.length, totalSkies: skies.length,
    avgVioletSerenity, avgTwilightClarity, avgDuskPrecision, avgEveningResilience, avgPurpleWisdom,
    amethystMasterpieceCount, violetGemCount, properAmethystCount, paleQuartzCount, roughStoneCount, voidCount,
    hasHighSerenityCount, hasHighClarityCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallSerenity, philosopherGrade,
    bestGlow, mostSerene, clearest, mostPrecise, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(glows, skies, dusk, stats)

  return {
    glows, skies, dusk, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(glows, skies, dusk, stats) */
export function generateRecommendations(
  glows: AmethystGlow[],
  skies: AmethystSky[],
  _dusk: AmethystTwilightResult['dusk'],
  stats: AmethystTwilightResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgVioletSerenity >= 90 &&
    stats.avgTwilightClarity >= 90 &&
    stats.avgDuskPrecision >= 90 &&
    stats.avgEveningResilience >= 90 &&
    stats.avgPurpleWisdom >= 90
  ) {
    recs.push(
      'Your amethyst twilight glows with mystic perfection! Violet serenity is deep-meditation, twilight clarity is purple-clarity, dusk precision is twilight-sharp, evening resilience is eternal-vigil, and purple wisdom is mystic-sage!',
    )
    return recs
  }

  if (stats.avgVioletSerenity < 60) {
    recs.push(
      'Deepen violet serenity — the twilight must be calm; eliminate cryptic patterns, organize chaos, and build with peaceful clarity'
    )
  }

  if (stats.avgTwilightClarity < 60) {
    recs.push(
      'Sharpen twilight clarity — the dusk must reveal, not obscure; document thoroughly, eliminate obfuscation, and let understanding shine through'
    )
  }

  if (stats.avgDuskPrecision < 60) {
    recs.push(
      'Hone dusk precision — every detail must be exact as light fades; tighten types, eliminate unsafe patterns, and craft with twilight-sharp edges'
    )
  }

  if (stats.avgEveningResilience < 60) {
    recs.push(
      'Strengthen evening resilience — the code must endure through the night; add error handling, test thoroughly, and build eternal vigilance'
    )
  }

  if (stats.avgPurpleWisdom < 60) {
    recs.push(
      'Elevate purple wisdom — the amethyst must transcend the mundane; build with principled architecture, deep understanding, and mystic-sage insight'
    )
  }

  if (stats.overallSerenity < 40) {
    recs.push(
      'The twilight is dark — rough stone and pale quartz outnumber the amethysts, and the sky is fading'
    )
  }

  const voidGlows = glows.filter((g) => g.condition === 'void')
  if (voidGlows.length > 0 && voidGlows.length <= 5) {
    recs.push(`Return these rough stones to the twilight: ${voidGlows.map((g) => g.file).join(', ')}`)
  } else if (voidGlows.length > 5) {
    recs.push(`Return ${voidGlows.length} rough stones to the twilight before the purple light fades completely`)
  }

  const poorSkies = skies.filter((s) => s.condition === 'void' || s.condition === 'wooden-shack')
  if (poorSkies.length === skies.length && skies.length > 0) {
    recs.push('All skies are wooden shacks — the amethyst twilight needs amethyst-palace quality glows throughout')
  }

  if (recs.length === 0) {
    recs.push('Your amethyst twilight glows serenely — every file carries violet serenity, twilight clarity, dusk precision, evening resilience, and purple wisdom')
  }

  return recs
}
