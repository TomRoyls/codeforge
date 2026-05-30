// ─── Interfaces ──────────────────────────────────────────

export interface DiffractingMeasure {
  color: number
  play: 'kaleidoscope' | 'black-opal' | 'proper-play' | 'common-opal' | 'potch' | 'no-color'
  hasHighColor: boolean
  hasVersatile: boolean
  hasMultiFaceted: boolean
  hasAdaptable: boolean
  hasFlexible: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasDiverse: boolean
  hasRich: boolean
  hasVaried: boolean
  hasDynamic: boolean
  hasMultiDimensional: boolean
  hasLayered: boolean
  hasComplex: boolean
  hasColorful: boolean
  hasShifting: boolean
  monolithicCount: number
  rigidCount: number
}

export interface RevealingMeasure {
  clarity: number
  dawn: 'aurora-dawn' | 'clear-sunrise' | 'proper-dawn' | 'gray-morning' | 'pre-dawn' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasOpen: boolean
  hasRevealed: boolean
  hasIlluminated: boolean
  hasFresh: boolean
  hasClean: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface WarmingMeasure {
  warmth: number
  fire: 'australian-fire' | 'ethiopian-warmth' | 'proper-glow' | 'cool-opal' | 'cold-stone' | 'no-warmth'
  hasHighWarmth: boolean
  hasApproachable: boolean
  hasNoHostile: boolean
  hasWelcoming: boolean
  hasInviting: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasForgiving: boolean
  hasGentle: boolean
  hasPatient: boolean
  hasKind: boolean
  hasComfortable: boolean
  hasHuman: boolean
  hasEmpathetic: boolean
  hasConsiderate: boolean
  hasCaring: boolean
  hostileCount: number
  unhandledCount: number
}

export interface SpanningMeasure {
  richness: number
  spectrum: 'full-rainbow' | 'rich-palette' | 'proper-range' | 'limited-hue' | 'monochrome' | 'no-richness'
  hasHighRichness: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasComprehensive: boolean
  hasThorough: boolean
  hasComplete: boolean
  hasDocumented: boolean
  hasTyped: boolean
  hasTested: boolean
  hasExported: boolean
  hasCovered: boolean
  hasDiverse: boolean
  hasBroad: boolean
  hasWide: boolean
  hasExtensive: boolean
  hasUniversal: boolean
  chaoticCount: number
  untestedCount: number
}

export interface GlowingMeasure {
  opalescence: number
  glow: 'milky-radiance' | 'pearl-glow' | 'proper-luster' | 'dull-sheen' | 'no-light' | 'no-opalescence'
  hasHighOpalescence: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasGraceful: boolean
  hasSubtle: boolean
  hasSophisticated: boolean
  hasHarmonious: boolean
  hasBalanced: boolean
  hasAesthetic: boolean
  hasCrafted: boolean
  hasDeliberate: boolean
  hasArtistic: boolean
  hasBeautiful: boolean
  hasLuminous: boolean
  clunkyCount: number
  roughCount: number
}

export type FragmentCondition =
  | 'opal-masterpiece'
  | 'precious-fire'
  | 'proper-gem'
  | 'common-opal'
  | 'potch-stone'
  | 'void'

export interface OpalFragment {
  file: string
  playOfColor: number
  dawnClarity: number
  fireWarmth: number
  spectrumRichness: number
  opalescenceQuality: number
  diffracting: DiffractingMeasure
  revealing: RevealingMeasure
  warming: WarmingMeasure
  spanning: SpanningMeasure
  glowing: GlowingMeasure
  condition: FragmentCondition
  qualityScore: number
}

export type VeinType =
  | 'precious-seam'
  | 'opal-vein'
  | 'proper-deposit'
  | 'thin-layer'
  | 'barren-rock'
  | 'no-vein'

export type VeinCondition =
  | 'opal-field'
  | 'rainbow-canyon'
  | 'proper-mine'
  | 'gravel-pit'
  | 'empty-hole'
  | 'void'

export interface OpalVein {
  directory: string
  fragments: OpalFragment[]
  avgColor: number
  avgRichness: number
  avgOpalescence: number
  opalMasterpieceCount: number
  voidCount: number
  veinType: VeinType
  condition: VeinCondition
}

export type LapidaryGrade = 'master-lapidary' | 'opal-cutter' | 'proper-gemologist' | 'apprentice' | 'novice' | 'rock-polisher'

export interface OpalHorizonResult {
  fragments: OpalFragment[]
  veins: OpalVein[]
  spectrum: {
    avgColor: number
    avgRichness: number
    avgOpalescence: number
    isOpal: boolean
    overallBrilliance: number
  }
  stats: {
    totalFiles: number
    totalVeins: number
    avgPlayOfColor: number
    avgDawnClarity: number
    avgFireWarmth: number
    avgSpectrumRichness: number
    avgOpalescenceQuality: number
    opalMasterpieceCount: number
    preciousFireCount: number
    properGemCount: number
    commonOpalCount: number
    potchStoneCount: number
    voidCount: number
    hasHighColorCount: number
    hasHighClarityCount: number
    hasHighWarmthCount: number
    hasHighRichnessCount: number
    hasHighOpalescenceCount: number
    overallBrilliance: number
    lapidaryGrade: LapidaryGrade
    bestFragment: string
    mostColorful: string
    clearest: string
    warmest: string
    richest: string
    mostLuminous: string
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

/** @example classifyFragmentCondition(90) */
export function classifyFragmentCondition(score: number): FragmentCondition {
  if (score >= 90) return 'opal-masterpiece'
  if (score >= 75) return 'precious-fire'
  if (score >= 60) return 'proper-gem'
  if (score >= 40) return 'common-opal'
  if (score >= 20) return 'potch-stone'
  return 'void'
}

/** @example classifyVeinType(fragments) */
export function classifyVeinType(fragments: OpalFragment[]): VeinType {
  if (fragments.length === 0) return 'no-vein'
  const avg = fragments.reduce((s, f) => s + f.qualityScore, 0) / fragments.length
  if (avg >= 85) return 'precious-seam'
  if (avg >= 70) return 'opal-vein'
  if (avg >= 55) return 'proper-deposit'
  if (avg >= 35) return 'thin-layer'
  return 'barren-rock'
}

/** @example classifyVeinCondition(85) */
export function classifyVeinCondition(score: number): VeinCondition {
  if (score >= 85) return 'opal-field'
  if (score >= 70) return 'rainbow-canyon'
  if (score >= 55) return 'proper-mine'
  if (score >= 35) return 'gravel-pit'
  if (score >= 15) return 'empty-hole'
  return 'void'
}

/** @example classifyLapidaryGrade(80) */
export function classifyLapidaryGrade(avgBrilliance: number): LapidaryGrade {
  if (avgBrilliance >= 80) return 'master-lapidary'
  if (avgBrilliance >= 65) return 'opal-cutter'
  if (avgBrilliance >= 50) return 'proper-gemologist'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'rock-polisher'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureDiffracting('class X { readonly y: string }') */
export function measureDiffracting(content: string): DiffractingMeasure {
  const hasVersatile = /\b(class|interface|type)\b/.test(content)
  const hasMultiFaceted = /\b(import|export)\b/.test(content)
  const hasAdaptable = /\b(async|await|Promise)\b/.test(content)
  const hasFlexible = /\b(function|=>|return)\b/.test(content)
  const hasModular = !/\bany\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasDiverse = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRich = /\b(readonly|private|protected)\b/.test(content)
  const hasVaried = /\b(const|readonly)\b/.test(content)
  const hasDynamic = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasMultiDimensional = /\b(try|catch|if)\b/.test(content)
  const hasLayered = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasComplex = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasColorful = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasShifting = (content.match(/\b(rigid|inflexible|brittle|stiff)\b/gi) ?? []).length === 0
  const rigidCount = (content.match(/\b(rigid|inflexible|brittle|stiff)\b/gi) ?? []).length

  const positiveBooleans = [
    hasVersatile, hasMultiFaceted, hasAdaptable, hasFlexible, hasModular,
    hasNoMonolithic, hasDiverse, hasRich, hasVaried, hasDynamic,
    hasMultiDimensional, hasLayered, hasComplex, hasColorful, hasShifting,
  ]

  const color = computeScore(positiveBooleans)
  const hasHighColor = color >= 60

  let play: DiffractingMeasure['play'] = 'no-color'
  if (color >= 90) play = 'kaleidoscope'
  else if (color >= 75) play = 'black-opal'
  else if (color >= 60) play = 'proper-play'
  else if (color >= 40) play = 'common-opal'
  else if (color >= 20) play = 'potch'

  return {
    color, play, hasHighColor,
    hasVersatile, hasMultiFaceted, hasAdaptable, hasFlexible, hasModular,
    hasNoMonolithic, hasDiverse, hasRich, hasVaried, hasDynamic,
    hasMultiDimensional, hasLayered, hasComplex, hasColorful, hasShifting,
    monolithicCount, rigidCount,
  }
}

/** @example measureRevealing('const x: string = "test"') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoMystery = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasClear = /\b(import|export)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscated|encoded|minified|scrambled)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasVisible = /\b(function|=>|return)\b/.test(content)
  const hasDirect = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasOpen = /\b(readonly|private|protected)\b/.test(content)
  const hasRevealed = /\b(const|readonly)\b/.test(content)
  const hasIlluminated = /\b(async|await|Promise)\b/.test(content)
  const hasFresh = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasOpen, hasRevealed, hasIlluminated, hasFresh, hasClean,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let dawn: RevealingMeasure['dawn'] = 'no-clarity'
  if (clarity >= 90) dawn = 'aurora-dawn'
  else if (clarity >= 75) dawn = 'clear-sunrise'
  else if (clarity >= 60) dawn = 'proper-dawn'
  else if (clarity >= 40) dawn = 'gray-morning'
  else if (clarity >= 20) dawn = 'pre-dawn'

  return {
    clarity, dawn, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasOpen, hasRevealed, hasIlluminated, hasFresh, hasClean,
    crypticCount, obfuscatedCount,
  }
}

/** @example measureWarming('try { await x() } catch { throw new Error() }') */
export function measureWarming(content: string): WarmingMeasure {
  const hasApproachable = /\b(class|interface|type)\b/.test(content)
  const hostileCount = (content.match(/\b(hostile|aggressive|violent|harsh)\b/gi) ?? []).length
  const hasNoHostile = hostileCount === 0
  const hasWelcoming = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInviting = /\b(import|export)\b/.test(content)
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasForgiving = /\b(if|throw)\b/.test(content)
  const hasGentle = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPatient = !/\bany\b/.test(content)
  const hasKind = /\b(const|readonly)\b/.test(content)
  const hasComfortable = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasHuman = /\b(async|await|Promise)\b/.test(content)
  const hasEmpathetic = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasConsiderate = /\b(readonly|private|protected)\b/.test(content)
  const hasCaring = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasApproachable, hasNoHostile, hasWelcoming, hasInviting, hasErrorHandled,
    hasNoUnhandled, hasForgiving, hasGentle, hasPatient, hasKind,
    hasComfortable, hasHuman, hasEmpathetic, hasConsiderate, hasCaring,
  ]

  const warmth = computeScore(positiveBooleans)
  const hasHighWarmth = warmth >= 60

  let fire: WarmingMeasure['fire'] = 'no-warmth'
  if (warmth >= 90) fire = 'australian-fire'
  else if (warmth >= 75) fire = 'ethiopian-warmth'
  else if (warmth >= 60) fire = 'proper-glow'
  else if (warmth >= 40) fire = 'cool-opal'
  else if (warmth >= 20) fire = 'cold-stone'

  return {
    warmth, fire, hasHighWarmth,
    hasApproachable, hasNoHostile, hasWelcoming, hasInviting, hasErrorHandled,
    hasNoUnhandled, hasForgiving, hasGentle, hasPatient, hasKind,
    hasComfortable, hasHuman, hasEmpathetic, hasConsiderate, hasCaring,
    hostileCount, unhandledCount,
  }
}

/** @example measureSpanning('export class X { readonly y: string }') */
export function measureSpanning(content: string): SpanningMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|disorganized|tangled)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasComprehensive = /\b(import|export)\b/.test(content)
  const hasThorough = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasComplete = /\b(function|=>|return)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTyped = !/\bany\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const hasExported = /\b(export|import)\b/.test(content)
  const hasCovered = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasDiverse = /\b(readonly|private|protected)\b/.test(content)
  const hasBroad = /\b(async|await|Promise)\b/.test(content)
  const hasWide = /\b(const|readonly)\b/.test(content)
  const hasExtensive = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasUniversal = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasComprehensive, hasThorough, hasComplete,
    hasDocumented, hasTyped, hasTested, hasExported, hasCovered,
    hasDiverse, hasBroad, hasWide, hasExtensive, hasUniversal,
  ]

  const richness = computeScore(positiveBooleans)
  const hasHighRichness = richness >= 60

  let spectrum: SpanningMeasure['spectrum'] = 'no-richness'
  if (richness >= 90) spectrum = 'full-rainbow'
  else if (richness >= 75) spectrum = 'rich-palette'
  else if (richness >= 60) spectrum = 'proper-range'
  else if (richness >= 40) spectrum = 'limited-hue'
  else if (richness >= 20) spectrum = 'monochrome'

  return {
    richness, spectrum, hasHighRichness,
    hasWellStructured, hasNoChaotic, hasComprehensive, hasThorough, hasComplete,
    hasDocumented, hasTyped, hasTested, hasExported, hasCovered,
    hasDiverse, hasBroad, hasWide, hasExtensive, hasUniversal,
    chaoticCount, untestedCount,
  }
}

/** @example measureGlowing('export class X { readonly y: string }') */
export function measureGlowing(content: string): GlowingMeasure {
  const hasElegant = /\b(class|interface|type)\b/.test(content)
  const clunkyCount = (content.match(/\b(clunky|ugly|crude|slapped)\b/gi) ?? []).length
  const hasNoClunky = clunkyCount === 0
  const hasRefined = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPolished = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGraceful = !/\bany\b/.test(content)
  const hasSubtle = /\b(readonly|private|protected)\b/.test(content)
  const hasSophisticated = /\b(import|export)\b/.test(content)
  const hasHarmonious = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasBalanced = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasAesthetic = /\b(async|await|Promise)\b/.test(content)
  const hasCrafted = /\b(function|=>|return)\b/.test(content)
  const hasDeliberate = /\b(const|readonly)\b/.test(content)
  const hasArtistic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasBeautiful = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasLuminous = /\b(try|catch|if)\b/.test(content)
  const roughCount = (content.match(/\b(rough|crude|raw|unfinished)\b/gi) ?? []).length

  const positiveBooleans = [
    hasElegant, hasNoClunky, hasRefined, hasPolished, hasGraceful,
    hasSubtle, hasSophisticated, hasHarmonious, hasBalanced, hasAesthetic,
    hasCrafted, hasDeliberate, hasArtistic, hasBeautiful, hasLuminous,
  ]

  const opalescence = computeScore(positiveBooleans)
  const hasHighOpalescence = opalescence >= 60

  let glow: GlowingMeasure['glow'] = 'no-opalescence'
  if (opalescence >= 90) glow = 'milky-radiance'
  else if (opalescence >= 75) glow = 'pearl-glow'
  else if (opalescence >= 60) glow = 'proper-luster'
  else if (opalescence >= 40) glow = 'dull-sheen'
  else if (opalescence >= 20) glow = 'no-light'

  return {
    opalescence, glow, hasHighOpalescence,
    hasElegant, hasNoClunky, hasRefined, hasPolished, hasGraceful,
    hasSubtle, hasSophisticated, hasHarmonious, hasBalanced, hasAesthetic,
    hasCrafted, hasDeliberate, hasArtistic, hasBeautiful, hasLuminous,
    clunkyCount, roughCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeOpalFragment(content, 'app.ts') */
export function analyzeOpalFragment(content: string, filePath: string): OpalFragment {
  const diffracting = measureDiffracting(content)
  const revealing = measureRevealing(content)
  const warming = measureWarming(content)
  const spanning = measureSpanning(content)
  const glowing = measureGlowing(content)

  const playOfColor = diffracting.color
  const dawnClarity = revealing.clarity
  const fireWarmth = warming.warmth
  const spectrumRichness = spanning.richness
  const opalescenceQuality = glowing.opalescence

  const qualityScore = Math.round(
    playOfColor * 0.2 +
    dawnClarity * 0.2 +
    fireWarmth * 0.2 +
    spectrumRichness * 0.2 +
    opalescenceQuality * 0.2,
  )

  const condition = classifyFragmentCondition(qualityScore)

  return {
    file: filePath,
    playOfColor, dawnClarity, fireWarmth, spectrumRichness, opalescenceQuality,
    diffracting, revealing, warming, spanning, glowing,
    condition, qualityScore,
  }
}

/** @example analyzeOpalVein(fragments, 'src') */
export function analyzeOpalVein(fragments: OpalFragment[], dirPath: string): OpalVein {
  if (fragments.length === 0) {
    return {
      directory: dirPath, fragments: [],
      avgColor: 0, avgRichness: 0, avgOpalescence: 0,
      opalMasterpieceCount: 0, voidCount: 0,
      veinType: 'no-vein', condition: 'void',
    }
  }

  const avgColor = Math.round(fragments.reduce((s, f) => s + f.playOfColor, 0) / fragments.length)
  const avgRichness = Math.round(fragments.reduce((s, f) => s + f.spectrumRichness, 0) / fragments.length)
  const avgOpalescence = Math.round(fragments.reduce((s, f) => s + f.opalescenceQuality, 0) / fragments.length)
  const opalMasterpieceCount = fragments.filter((f) => f.condition === 'opal-masterpiece').length
  const voidCount = fragments.filter((f) => f.condition === 'void').length
  const veinType = classifyVeinType(fragments)
  const avgQuality = Math.round(fragments.reduce((s, f) => s + f.qualityScore, 0) / fragments.length)
  const condition = classifyVeinCondition(avgQuality)

  return {
    directory: dirPath, fragments,
    avgColor, avgRichness, avgOpalescence,
    opalMasterpieceCount, voidCount,
    veinType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildOpalHorizonResult(['a.ts'], [content]) */
export async function buildOpalHorizonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OpalHorizonResult> {
  const fragments: OpalFragment[] = files.map((file, i) =>
    analyzeOpalFragment(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, OpalFragment[]>()
  for (const fragment of fragments) {
    const dir = fragment.file.includes('/')
      ? fragment.file.substring(0, fragment.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(fragment)
    } else {
      dirMap.set(dir, [fragment])
    }
  }

  const veins: OpalVein[] = Array.from(dirMap.entries()).map(([dir, dirFragments]) =>
    analyzeOpalVein(dirFragments, dir),
  )

  const avgPlayOfColor = fragments.length > 0
    ? Math.round(fragments.reduce((s, f) => s + f.playOfColor, 0) / fragments.length) : 0
  const avgDawnClarity = fragments.length > 0
    ? Math.round(fragments.reduce((s, f) => s + f.dawnClarity, 0) / fragments.length) : 0
  const avgFireWarmth = fragments.length > 0
    ? Math.round(fragments.reduce((s, f) => s + f.fireWarmth, 0) / fragments.length) : 0
  const avgSpectrumRichness = fragments.length > 0
    ? Math.round(fragments.reduce((s, f) => s + f.spectrumRichness, 0) / fragments.length) : 0
  const avgOpalescenceQuality = fragments.length > 0
    ? Math.round(fragments.reduce((s, f) => s + f.opalescenceQuality, 0) / fragments.length) : 0

  const overallBrilliance = fragments.length > 0
    ? Math.round(fragments.reduce((s, f) => s + f.qualityScore, 0) / fragments.length) : 0
  const isOpal = overallBrilliance >= 60

  const spectrum = { avgColor: avgPlayOfColor, avgRichness: avgSpectrumRichness, avgOpalescence: avgOpalescenceQuality, isOpal, overallBrilliance }

  const opalMasterpieceCount = fragments.filter((f) => f.condition === 'opal-masterpiece').length
  const preciousFireCount = fragments.filter((f) => f.condition === 'precious-fire').length
  const properGemCount = fragments.filter((f) => f.condition === 'proper-gem').length
  const commonOpalCount = fragments.filter((f) => f.condition === 'common-opal').length
  const potchStoneCount = fragments.filter((f) => f.condition === 'potch-stone').length
  const voidCount = fragments.filter((f) => f.condition === 'void').length

  const hasHighColorCount = fragments.filter((f) => f.diffracting.hasHighColor).length
  const hasHighClarityCount = fragments.filter((f) => f.revealing.hasHighClarity).length
  const hasHighWarmthCount = fragments.filter((f) => f.warming.hasHighWarmth).length
  const hasHighRichnessCount = fragments.filter((f) => f.spanning.hasHighRichness).length
  const hasHighOpalescenceCount = fragments.filter((f) => f.glowing.hasHighOpalescence).length

  const lapidaryGrade = classifyLapidaryGrade(overallBrilliance)

  const bestFragment = fragments.length > 0
    ? fragments.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best)).file : ''
  const mostColorful = fragments.length > 0
    ? fragments.reduce((best, f) => (f.playOfColor > best.playOfColor ? f : best)).file : ''
  const clearest = fragments.length > 0
    ? fragments.reduce((best, f) => (f.dawnClarity > best.dawnClarity ? f : best)).file : ''
  const warmest = fragments.length > 0
    ? fragments.reduce((best, f) => (f.fireWarmth > best.fireWarmth ? f : best)).file : ''
  const richest = fragments.length > 0
    ? fragments.reduce((best, f) => (f.spectrumRichness > best.spectrumRichness ? f : best)).file : ''
  const mostLuminous = fragments.length > 0
    ? fragments.reduce((best, f) => (f.opalescenceQuality > best.opalescenceQuality ? f : best)).file : ''

  const stats: OpalHorizonResult['stats'] = {
    totalFiles: files.length, totalVeins: veins.length,
    avgPlayOfColor, avgDawnClarity, avgFireWarmth, avgSpectrumRichness, avgOpalescenceQuality,
    opalMasterpieceCount, preciousFireCount, properGemCount, commonOpalCount, potchStoneCount, voidCount,
    hasHighColorCount, hasHighClarityCount, hasHighWarmthCount, hasHighRichnessCount, hasHighOpalescenceCount,
    overallBrilliance, lapidaryGrade,
    bestFragment, mostColorful, clearest, warmest, richest, mostLuminous,
  }

  const recommendations = generateRecommendations(fragments, veins, spectrum, stats)

  return { fragments, veins, spectrum, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(fragments, veins, spectrum, stats) */
export function generateRecommendations(
  fragments: OpalFragment[],
  veins: OpalVein[],
  _spectrum: OpalHorizonResult['spectrum'],
  stats: OpalHorizonResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgPlayOfColor >= 90 &&
    stats.avgDawnClarity >= 90 &&
    stats.avgFireWarmth >= 90 &&
    stats.avgSpectrumRichness >= 90 &&
    stats.avgOpalescenceQuality >= 90
  ) {
    recs.push(
      'Your opal horizon blazes with kaleidoscopic brilliance! Every fragment plays with color, the dawn reveals perfect clarity, the fire radiates warmth, the spectrum spans the full rainbow, and the opalescence glows with milky radiance!',
    )
    return recs
  }

  if (stats.avgPlayOfColor < 60) {
    recs.push(
      'Enhance play of color — your code needs more versatility, modularity, and multi-dimensional design to diffract the full spectrum of quality',
    )
  }

  if (stats.avgDawnClarity < 60) {
    recs.push(
      'Bring dawn clarity — let new light reveal your code; it needs better documentation, clearer naming, and more transparent structure',
    )
  }

  if (stats.avgFireWarmth < 60) {
    recs.push(
      'Warm the fire — opals glow with warmth; your code needs error handling, forgiving patterns, and a more inviting approach',
    )
  }

  if (stats.avgSpectrumRichness < 60) {
    recs.push(
      'Enrich the spectrum — a rich opal shows every color; your code needs more comprehensive coverage, thorough typing, and broader testing',
    )
  }

  if (stats.avgOpalescenceQuality < 60) {
    recs.push(
      'Polish the opalescence — the glow of fine opal comes from careful craftsmanship; your code needs more elegance, refinement, and deliberate artistry',
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The opal horizon has faded to potch — common opal and potch stones outnumber the precious gems, and the fire has gone out',
    )
  }

  const voidFragments = fragments.filter((f) => f.condition === 'void')
  if (voidFragments.length > 0 && voidFragments.length <= 5) {
    recs.push(`Polish these potch stones: ${voidFragments.map((f) => f.file).join(', ')}`)
  } else if (voidFragments.length > 5) {
    recs.push(`Polish ${voidFragments.length} potch stones before the entire horizon goes dark`)
  }

  const poorVeins = veins.filter((v) => v.condition === 'void' || v.condition === 'empty-hole')
  if (poorVeins.length === veins.length && veins.length > 0) {
    recs.push('All veins are empty holes — the opal horizon needs a complete geological survey to find new deposits')
  }

  if (recs.length === 0) {
    recs.push('Your opal horizon gleams with spectral brilliance — every fragment diffracts color, clarity, warmth, richness, and luminous opalescence')
  }

  return recs
}
