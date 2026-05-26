// ─── Interfaces ──────────────────────────────────────────

export interface ThrivingMeasure {
  vitality: number
  growth: 'lush-forest' | 'spring-garden' | 'proper-green' | 'wilting-leaf' | 'barren-ground' | 'no-vitality'
  hasHighVitality: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasGrowing: boolean
  hasNoStagnant: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasEvolving: boolean
  hasThriving: boolean
  hasFlourishing: boolean
  hasVibrant: boolean
  hasEnergetic: boolean
  hasActive: boolean
  hasBlooming: boolean
  hasBlossoming: boolean
  hasSurging: boolean
  deadCount: number
  stagnantCount: number
}

export interface GlowingMeasure {
  radiance: number
  light: 'solar-flare' | 'bright-aurora' | 'proper-glow' | 'dim-light' | 'darkness' | 'no-radiance'
  hasHighRadiance: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoMystery: boolean
  hasLuminous: boolean
  hasRadiant: boolean
  hasBrilliant: boolean
  hasGlowing: boolean
  hasShining: boolean
  hasBright: boolean
  hasDazzling: boolean
  hasResplendent: boolean
  hasIlluminated: boolean
  hasEffulgent: boolean
  hasIncandescent: boolean
  crypticCount: number
  mysteryCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  spectrum: 'full-spectrum' | 'bright-band' | 'proper-color' | 'faded-hue' | 'gray-scale' | 'no-clarity'
  hasHighClarity: boolean
  hasSelfDocumenting: boolean
  hasNoUndocumented: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasUnderstandable: boolean
  hasObvious: boolean
  hasEvident: boolean
  hasVisible: boolean
  hasOpen: boolean
  hasRevealed: boolean
  hasExposed: boolean
  hasManifest: boolean
  hasApparent: boolean
  hasClean: boolean
  hasDirect: boolean
  undocumentedCount: number
  obfuscatedCount: number
}

export interface AligningMeasure {
  precision: number
  orbit: 'perfect-orbit' | 'precise-trajectory' | 'proper-course' | 'wobbly-path' | 'chaotic-drift' | 'no-precision'
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
  hasCalculated: boolean
  hasComputed: boolean
  hasStrict: boolean
  hasCalibrated: boolean
  hasSynchronized: boolean
  hasAligned: boolean
  unsafeCount: number
  approximateCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  magnetosphere: 'cosmic-understanding' | 'atmospheric-sage' | 'proper-observer' | 'sky-gazer' | 'blind-watcher' | 'no-wisdom'
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
  hasFarSighted: boolean
  hasWise: boolean
  hasTranscendent: boolean
  hackedCount: number
  shallowCount: number
}

export type CurtainCondition =
  | 'aurora-masterpiece'
  | 'emerald-lights'
  | 'proper-aurora'
  | 'faint-glow'
  | 'dark-sky'
  | 'void'

export interface AuroraCurtain {
  file: string
  greenVitality: number
  northernRadiance: number
  spectrumClarity: number
  celestialPrecision: number
  auroraWisdom: number
  thriving: ThrivingMeasure
  glowing: GlowingMeasure
  clarifying: ClarifyingMeasure
  aligning: AligningMeasure
  understanding: UnderstandingMeasure
  condition: CurtainCondition
  qualityScore: number
}

export type BandType =
  | 'polar-curtain'
  | 'aurora-band'
  | 'proper-glow'
  | 'faint-light'
  | 'dark-patch'
  | 'no-band'

export type BandCondition =
  | 'emerald-sky'
  | 'northern-lights'
  | 'proper-horizon'
  | 'gray-dawn'
  | 'black-night'
  | 'void'

export interface AuroraBand {
  directory: string
  curtains: AuroraCurtain[]
  avgVitality: number
  avgRadiance: number
  avgWisdom: number
  auroraMasterpieceCount: number
  voidCount: number
  bandType: BandType
  condition: BandCondition
}

export type ObserverGrade = 'aurora-master' | 'veteran-observer' | 'proper-watcher' | 'amateur' | 'novice' | 'blinked'

export interface EmeraldAuroraResult {
  curtains: AuroraCurtain[]
  bands: AuroraBand[]
  sky: {
    avgVitality: number
    avgRadiance: number
    avgWisdom: number
    isEmerald: boolean
    overallLuminosity: number
  }
  stats: {
    totalFiles: number
    totalBands: number
    avgGreenVitality: number
    avgNorthernRadiance: number
    avgSpectrumClarity: number
    avgCelestialPrecision: number
    avgAuroraWisdom: number
    auroraMasterpieceCount: number
    emeraldLightsCount: number
    properAuroraCount: number
    faintGlowCount: number
    darkSkyCount: number
    voidCount: number
    hasHighVitalityCount: number
    hasHighRadianceCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighWisdomCount: number
    overallLuminosity: number
    observerGrade: ObserverGrade
    bestCurtain: string
    mostVital: string
    mostRadiant: string
    clearest: string
    mostPrecise: string
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

/** @example classifyCurtainCondition(90) */
export function classifyCurtainCondition(score: number): CurtainCondition {
  if (score >= 90) return 'aurora-masterpiece'
  if (score >= 75) return 'emerald-lights'
  if (score >= 60) return 'proper-aurora'
  if (score >= 40) return 'faint-glow'
  if (score >= 20) return 'dark-sky'
  return 'void'
}

/** @example classifyBandType(curtains) */
export function classifyBandType(curtains: AuroraCurtain[]): BandType {
  if (curtains.length === 0) return 'no-band'
  const avg = curtains.reduce((s, c) => s + c.qualityScore, 0) / curtains.length
  if (avg >= 85) return 'polar-curtain'
  if (avg >= 70) return 'aurora-band'
  if (avg >= 55) return 'proper-glow'
  if (avg >= 35) return 'faint-light'
  return 'dark-patch'
}

/** @example classifyBandCondition(85) */
export function classifyBandCondition(score: number): BandCondition {
  if (score >= 85) return 'emerald-sky'
  if (score >= 70) return 'northern-lights'
  if (score >= 55) return 'proper-horizon'
  if (score >= 35) return 'gray-dawn'
  if (score >= 15) return 'black-night'
  return 'void'
}

/** @example classifyObserverGrade(80) */
export function classifyObserverGrade(avgLuminosity: number): ObserverGrade {
  if (avgLuminosity >= 80) return 'aurora-master'
  if (avgLuminosity >= 65) return 'veteran-observer'
  if (avgLuminosity >= 50) return 'proper-watcher'
  if (avgLuminosity >= 35) return 'amateur'
  if (avgLuminosity >= 20) return 'novice'
  return 'blinked'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureThriving('export class X { readonly y: string }') */
export function measureThriving(content: string): ThrivingMeasure {
  const hasAlive = /\b(class|interface|type)\b/.test(content)
  const deadCount = (content.match(/\b(dead|lifeless|inert|dormant)\b/gi) ?? []).length
  const hasNoDead = deadCount === 0
  const hasGrowing = /\b(import|export)\b/.test(content)
  const stagnantCount = (content.match(/\b(stagnant|stale|frozen|static)\b/gi) ?? []).length
  const hasNoStagnant = stagnantCount === 0
  const hasDynamic = /\b(async|await|Promise)\b/.test(content)
  const hasNoStatic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasEvolving = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasThriving = /\b(readonly|private|protected)\b/.test(content)
  const hasFlourishing = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVibrant = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasEnergetic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasActive = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasBlooming = !/\bany\b/.test(content)
  const hasBlossoming = /\b(try|catch|if)\b/.test(content)
  const hasSurging = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasAlive, hasNoDead, hasGrowing, hasNoStagnant, hasDynamic,
    hasNoStatic, hasEvolving, hasThriving, hasFlourishing, hasVibrant,
    hasEnergetic, hasActive, hasBlooming, hasBlossoming, hasSurging,
  ]

  const vitality = computeScore(positiveBooleans)
  const hasHighVitality = vitality >= 60

  let growth: ThrivingMeasure['growth'] = 'no-vitality'
  if (vitality >= 90) growth = 'lush-forest'
  else if (vitality >= 75) growth = 'spring-garden'
  else if (vitality >= 60) growth = 'proper-green'
  else if (vitality >= 40) growth = 'wilting-leaf'
  else if (vitality >= 20) growth = 'barren-ground'

  return {
    vitality, growth, hasHighVitality,
    hasAlive, hasNoDead, hasGrowing, hasNoStagnant, hasDynamic,
    hasNoStatic, hasEvolving, hasThriving, hasFlourishing, hasVibrant,
    hasEnergetic, hasActive, hasBlooming, hasBlossoming, hasSurging,
    deadCount, stagnantCount,
  }
}

/** @example measureGlowing('export class X { readonly y: string }') */
export function measureGlowing(content: string): GlowingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const mysteryCount = (content.match(/\b(secret|hidden|concealed|undisclosed)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasLuminous = /\b(import|export)\b/.test(content)
  const hasRadiant = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasBrilliant = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasGlowing = !/\bany\b/.test(content)
  const hasShining = /\b(readonly|private|protected)\b/.test(content)
  const hasBright = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasDazzling = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasResplendent = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasIlluminated = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEffulgent = /\b(try|catch|if)\b/.test(content)
  const hasIncandescent = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasLuminous,
    hasRadiant, hasBrilliant, hasGlowing, hasShining, hasBright,
    hasDazzling, hasResplendent, hasIlluminated, hasEffulgent, hasIncandescent,
  ]

  const radiance = computeScore(positiveBooleans)
  const hasHighRadiance = radiance >= 60

  let light: GlowingMeasure['light'] = 'no-radiance'
  if (radiance >= 90) light = 'solar-flare'
  else if (radiance >= 75) light = 'bright-aurora'
  else if (radiance >= 60) light = 'proper-glow'
  else if (radiance >= 40) light = 'dim-light'
  else if (radiance >= 20) light = 'darkness'

  return {
    radiance, light, hasHighRadiance,
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasLuminous,
    hasRadiant, hasBrilliant, hasGlowing, hasShining, hasBright,
    hasDazzling, hasResplendent, hasIlluminated, hasEffulgent, hasIncandescent,
    crypticCount, mysteryCount,
  }
}

/** @example measureClarifying('export class X { readonly y: string }') */
export function measureClarifying(content: string): ClarifyingMeasure {
  const hasSelfDocumenting = /\b(import|export)\b/.test(content)
  const undocumentedCount = (content.match(/\b(undocumented|undocumented|unexplained|uncommented)\b/gi) ?? []).length
  const hasNoUndocumented = undocumentedCount === 0
  const hasTransparent = /\b(readonly|private|protected)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscated|encoded|mangled|minified)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasUnderstandable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasObvious = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEvident = /\b(class|interface|type)\b/.test(content)
  const hasVisible = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasOpen = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasRevealed = !/\bany\b/.test(content)
  const hasExposed = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasManifest = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasApparent = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasClean = (content.match(/\b(cryptic|mysterious|obscure)\b/gi) ?? []).length === 0
  const hasDirect = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasSelfDocumenting, hasNoUndocumented, hasTransparent, hasNoObfuscated, hasUnderstandable,
    hasObvious, hasEvident, hasVisible, hasOpen, hasRevealed,
    hasExposed, hasManifest, hasApparent, hasClean, hasDirect,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let spectrum: ClarifyingMeasure['spectrum'] = 'no-clarity'
  if (clarity >= 90) spectrum = 'full-spectrum'
  else if (clarity >= 75) spectrum = 'bright-band'
  else if (clarity >= 60) spectrum = 'proper-color'
  else if (clarity >= 40) spectrum = 'faded-hue'
  else if (clarity >= 20) spectrum = 'gray-scale'

  return {
    clarity, spectrum, hasHighClarity,
    hasSelfDocumenting, hasNoUndocumented, hasTransparent, hasNoObfuscated, hasUnderstandable,
    hasObvious, hasEvident, hasVisible, hasOpen, hasRevealed,
    hasExposed, hasManifest, hasApparent, hasClean, hasDirect,
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
  const hasCalculated = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasComputed = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasStrict = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCalibrated = /\b(try|catch|if)\b/.test(content)
  const hasSynchronized = /\b(async|await|Promise)\b/.test(content)
  const hasAligned = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasCalculated,
    hasComputed, hasStrict, hasCalibrated, hasSynchronized, hasAligned,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let orbit: AligningMeasure['orbit'] = 'no-precision'
  if (precision >= 90) orbit = 'perfect-orbit'
  else if (precision >= 75) orbit = 'precise-trajectory'
  else if (precision >= 60) orbit = 'proper-course'
  else if (precision >= 40) orbit = 'wobbly-path'
  else if (precision >= 20) orbit = 'chaotic-drift'

  return {
    precision, orbit, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasCalculated,
    hasComputed, hasStrict, hasCalibrated, hasSynchronized, hasAligned,
    unsafeCount, approximateCount,
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
  const hasConnected = /\b(function|=>|return)\b/.test(content)
  const hasFarSighted = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasTranscendent = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasFarSighted, hasWise, hasTranscendent,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let magnetosphere: UnderstandingMeasure['magnetosphere'] = 'no-wisdom'
  if (wisdom >= 90) magnetosphere = 'cosmic-understanding'
  else if (wisdom >= 75) magnetosphere = 'atmospheric-sage'
  else if (wisdom >= 60) magnetosphere = 'proper-observer'
  else if (wisdom >= 40) magnetosphere = 'sky-gazer'
  else if (wisdom >= 20) magnetosphere = 'blind-watcher'

  return {
    wisdom, magnetosphere, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasFarSighted, hasWise, hasTranscendent,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeAuroraCurtain(content, 'app.ts') */
export function analyzeAuroraCurtain(content: string, filePath: string): AuroraCurtain {
  const thriving = measureThriving(content)
  const glowing = measureGlowing(content)
  const clarifying = measureClarifying(content)
  const aligning = measureAligning(content)
  const understanding = measureUnderstanding(content)

  const greenVitality = thriving.vitality
  const northernRadiance = glowing.radiance
  const spectrumClarity = clarifying.clarity
  const celestialPrecision = aligning.precision
  const auroraWisdom = understanding.wisdom

  const qualityScore = Math.round(
    greenVitality * 0.2 +
    northernRadiance * 0.2 +
    spectrumClarity * 0.2 +
    celestialPrecision * 0.2 +
    auroraWisdom * 0.2,
  )

  const condition = classifyCurtainCondition(qualityScore)

  return {
    file: filePath,
    greenVitality, northernRadiance, spectrumClarity, celestialPrecision, auroraWisdom,
    thriving, glowing, clarifying, aligning, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeAuroraBand(curtains, 'src') */
export function analyzeAuroraBand(curtains: AuroraCurtain[], dirPath: string): AuroraBand {
  if (curtains.length === 0) {
    return {
      directory: dirPath, curtains: [],
      avgVitality: 0, avgRadiance: 0, avgWisdom: 0,
      auroraMasterpieceCount: 0, voidCount: 0,
      bandType: 'no-band', condition: 'void',
    }
  }

  const avgVitality = Math.round(curtains.reduce((s, c) => s + c.greenVitality, 0) / curtains.length)
  const avgRadiance = Math.round(curtains.reduce((s, c) => s + c.northernRadiance, 0) / curtains.length)
  const avgWisdom = Math.round(curtains.reduce((s, c) => s + c.auroraWisdom, 0) / curtains.length)
  const auroraMasterpieceCount = curtains.filter((c) => c.condition === 'aurora-masterpiece').length
  const voidCount = curtains.filter((c) => c.condition === 'void').length
  const bandType = classifyBandType(curtains)
  const avgQuality = Math.round(curtains.reduce((s, c) => s + c.qualityScore, 0) / curtains.length)
  const condition = classifyBandCondition(avgQuality)

  return {
    directory: dirPath, curtains,
    avgVitality, avgRadiance, avgWisdom,
    auroraMasterpieceCount, voidCount,
    bandType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildEmeraldAuroraResult(['a.ts'], [content]) */
export async function buildEmeraldAuroraResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldAuroraResult> {
  const curtains: AuroraCurtain[] = files.map((file, i) =>
    analyzeAuroraCurtain(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AuroraCurtain[]>()
  for (const curtain of curtains) {
    const dir = curtain.file.includes('/')
      ? curtain.file.substring(0, curtain.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(curtain)
    } else {
      dirMap.set(dir, [curtain])
    }
  }

  const bands: AuroraBand[] = Array.from(dirMap.entries()).map(([dir, dirCurtains]) =>
    analyzeAuroraBand(dirCurtains, dir),
  )

  const avgGreenVitality = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.greenVitality, 0) / curtains.length) : 0
  const avgNorthernRadiance = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.northernRadiance, 0) / curtains.length) : 0
  const avgSpectrumClarity = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.spectrumClarity, 0) / curtains.length) : 0
  const avgCelestialPrecision = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.celestialPrecision, 0) / curtains.length) : 0
  const avgAuroraWisdom = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.auroraWisdom, 0) / curtains.length) : 0

  const overallLuminosity = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.qualityScore, 0) / curtains.length) : 0
  const isEmerald = overallLuminosity >= 60

  const sky: EmeraldAuroraResult['sky'] = {
    avgVitality: avgGreenVitality, avgRadiance: avgNorthernRadiance, avgWisdom: avgAuroraWisdom,
    isEmerald, overallLuminosity,
  }

  const auroraMasterpieceCount = curtains.filter((c) => c.condition === 'aurora-masterpiece').length
  const emeraldLightsCount = curtains.filter((c) => c.condition === 'emerald-lights').length
  const properAuroraCount = curtains.filter((c) => c.condition === 'proper-aurora').length
  const faintGlowCount = curtains.filter((c) => c.condition === 'faint-glow').length
  const darkSkyCount = curtains.filter((c) => c.condition === 'dark-sky').length
  const voidCount = curtains.filter((c) => c.condition === 'void').length

  const hasHighVitalityCount = curtains.filter((c) => c.thriving.hasHighVitality).length
  const hasHighRadianceCount = curtains.filter((c) => c.glowing.hasHighRadiance).length
  const hasHighClarityCount = curtains.filter((c) => c.clarifying.hasHighClarity).length
  const hasHighPrecisionCount = curtains.filter((c) => c.aligning.hasHighPrecision).length
  const hasHighWisdomCount = curtains.filter((c) => c.understanding.hasHighWisdom).length

  const observerGrade = classifyObserverGrade(overallLuminosity)

  const bestCurtain = curtains.length > 0
    ? curtains.reduce((best, c) => (c.qualityScore > best.qualityScore ? c : best)).file : ''
  const mostVital = curtains.length > 0
    ? curtains.reduce((best, c) => (c.greenVitality > best.greenVitality ? c : best)).file : ''
  const mostRadiant = curtains.length > 0
    ? curtains.reduce((best, c) => (c.northernRadiance > best.northernRadiance ? c : best)).file : ''
  const clearest = curtains.length > 0
    ? curtains.reduce((best, c) => (c.spectrumClarity > best.spectrumClarity ? c : best)).file : ''
  const mostPrecise = curtains.length > 0
    ? curtains.reduce((best, c) => (c.celestialPrecision > best.celestialPrecision ? c : best)).file : ''
  const wisest = curtains.length > 0
    ? curtains.reduce((best, c) => (c.auroraWisdom > best.auroraWisdom ? c : best)).file : ''

  const stats: EmeraldAuroraResult['stats'] = {
    totalFiles: files.length, totalBands: bands.length,
    avgGreenVitality, avgNorthernRadiance, avgSpectrumClarity, avgCelestialPrecision, avgAuroraWisdom,
    auroraMasterpieceCount, emeraldLightsCount, properAuroraCount, faintGlowCount, darkSkyCount, voidCount,
    hasHighVitalityCount, hasHighRadianceCount, hasHighClarityCount, hasHighPrecisionCount, hasHighWisdomCount,
    overallLuminosity, observerGrade,
    bestCurtain, mostVital, mostRadiant, clearest, mostPrecise, wisest,
  }

  const recommendations = generateRecommendations(curtains, bands, sky, stats)

  return {
    curtains, bands, sky, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(curtains, bands, sky, stats) */
export function generateRecommendations(
  curtains: AuroraCurtain[],
  bands: AuroraBand[],
  sky: EmeraldAuroraResult['sky'],
  stats: EmeraldAuroraResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgGreenVitality >= 90 &&
    stats.avgNorthernRadiance >= 90 &&
    stats.avgSpectrumClarity >= 90 &&
    stats.avgCelestialPrecision >= 90 &&
    stats.avgAuroraWisdom >= 90
  ) {
    recs.push(
      'Your emerald aurora illuminates the entire sky! The vitality is lush, the radiance solar, the clarity full-spectrum, the precision orbital, and the wisdom cosmic!',
    )
    return recs
  }

  if (stats.avgGreenVitality < 60) {
    recs.push(
      'Revive green vitality — the aurora needs oxygen to glow green; your code needs living patterns, growing structures, and dynamic energy'
    )
  }

  if (stats.avgNorthernRadiance < 60) {
    recs.push(
      'Brighten northern radiance — the aurora must shine across the polar sky; your code needs clearer naming, better documentation, and luminous readability'
    )
  }

  if (stats.avgSpectrumClarity < 60) {
    recs.push(
      'Sharpen spectrum clarity — every color band must be distinct; your code needs self-documenting patterns, transparent logic, and unambiguous intent'
    )
  }

  if (stats.avgCelestialPrecision < 60) {
    recs.push(
      'Tighten celestial precision — orbital mechanics tolerate no error; your code needs stricter types, exact definitions, and calibrated logic'
    )
  }

  if (stats.avgAuroraWisdom < 60) {
    recs.push(
      'Deepen aurora wisdom — understanding the magnetosphere takes cosmic perspective; your code needs principled architecture, proven patterns, and far-sighted design'
    )
  }

  if (stats.overallLuminosity < 40) {
    recs.push(
      'The sky is dark — faint glows and dark skies outnumber the emerald lights, and the aurora cannot form'
    )
  }

  const voidCurtains = curtains.filter((c) => c.condition === 'void')
  if (voidCurtains.length > 0 && voidCurtains.length <= 5) {
    recs.push(`Ignite these dark curtains: ${voidCurtains.map((c) => c.file).join(', ')}`)
  } else if (voidCurtains.length > 5) {
    recs.push(`Ignite ${voidCurtains.length} dark curtains before the aurora fades completely`)
  }

  const poorBands = bands.filter((b) => b.condition === 'void' || b.condition === 'black-night')
  if (poorBands.length === bands.length && bands.length > 0) {
    recs.push('All bands are black nights — the emerald aurora needs polar-curtain quality curtains throughout')
  }

  if (recs.length === 0) {
    recs.push('Your emerald aurora dances with perfection — every curtain embodies vitality, radiance, clarity, precision, and cosmic wisdom')
  }

  return recs
}
