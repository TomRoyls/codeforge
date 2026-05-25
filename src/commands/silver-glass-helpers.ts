// ─── Interfaces ──────────────────────────────────────────

export interface IntrospectingMeasure {
  quality: number
  reflection: 'perfect-mirror' | 'clear-silver' | 'proper-reflection' | 'cloudy-glass' | 'dark-surface' | 'no-reflection'
  hasHighQuality: boolean
  hasSelfAware: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasIntrospective: boolean
  hasOrganized: boolean
  hasClean: boolean
  hasMaintainable: boolean
  hasRefactorable: boolean
  hasSelfContained: boolean
  hasCoherent: boolean
  hasConsistent: boolean
  hasReflective: boolean
  hasHonest: boolean
  undocumentedCount: number
  chaoticCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  surface: 'flawless-silver' | 'polished-surface' | 'proper-clarity' | 'smudged-glass' | 'foggy' | 'no-clarity'
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
  hasExpressive: boolean
  hasCommunicative: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface ResistingMeasure {
  resistance: number
  tarnish: 'sterling-silver' | 'rhodium-plated' | 'proper-coating' | 'tarnishing' | 'corroded' | 'no-resistance'
  hasHighResistance: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasConsistent: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasMaintained: boolean
  hasPreserved: boolean
  hasEnduring: boolean
  hasDurable: boolean
  hasProtected: boolean
  hasHardened: boolean
  hasReinforced: boolean
  hasResilient: boolean
  volatileCount: number
  untestedCount: number
}

export interface FramingMeasure {
  elegance: number
  frame: 'ornate-frame' | 'elegant-border' | 'proper-edge' | 'rough-border' | 'no-frame' | 'no-elegance'
  hasHighElegance: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasOrganized: boolean
  hasClean: boolean
  hasElegant: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasGraceful: boolean
  hasHarmonious: boolean
  hasBalanced: boolean
  hasAesthetic: boolean
  hasCrafted: boolean
  hasBeautiful: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface RepresentingMeasure {
  fidelity: number
  image: 'perfect-fidelity' | 'faithful-render' | 'proper-representation' | 'distorted' | 'warped' | 'no-fidelity'
  hasHighFidelity: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasCorrect: boolean
  hasFaithful: boolean
  hasPrecise: boolean
  hasClean: boolean
  hasHonest: boolean
  hasTrue: boolean
  hasAuthentic: boolean
  hasGenuine: boolean
  hasUnambiguous: boolean
  hasUnDistorted: boolean
  hasSharp: boolean
  hasCrisp: boolean
  approximateCount: number
  distortedCount: number
}

export type ReflectionCondition =
  | 'silver-masterpiece'
  | 'perfect-reflection'
  | 'proper-mirror'
  | 'tarnished-silver'
  | 'cracked-glass'
  | 'void'

export interface SilverReflection {
  file: string
  reflectionQuality: number
  surfaceClarity: number
  tarnishResistance: number
  frameElegance: number
  imageFidelity: number
  introspecting: IntrospectingMeasure
  clarifying: ClarifyingMeasure
  resisting: ResistingMeasure
  framing: FramingMeasure
  representing: RepresentingMeasure
  condition: ReflectionCondition
  qualityScore: number
}

export type GalleryType =
  | 'hall-of-mirrors'
  | 'silver-gallery'
  | 'proper-exhibition'
  | 'small-display'
  | 'empty-room'
  | 'no-gallery'

export type GalleryCondition =
  | 'grand-gallery'
  | 'silver-hall'
  | 'proper-room'
  | 'dark-corner'
  | 'empty-space'
  | 'void'

export interface SilverGallery {
  directory: string
  reflections: SilverReflection[]
  avgClarity: number
  avgElegance: number
  avgFidelity: number
  silverMasterpieceCount: number
  voidCount: number
  galleryType: GalleryType
  condition: GalleryCondition
}

export type MirrorMakerGrade =
  | 'master-silversmith'
  | 'mirror-crafter'
  | 'proper-glassmaker'
  | 'apprentice'
  | 'novice'
  | 'tin-foil-folder'

export interface SilverMirrorResult {
  reflections: SilverReflection[]
  galleries: SilverGallery[]
  mirror: {
    avgClarity: number
    avgElegance: number
    avgFidelity: number
    isSilver: boolean
    overallReflection: number
  }
  stats: {
    totalFiles: number
    totalGalleries: number
    avgReflectionQuality: number
    avgSurfaceClarity: number
    avgTarnishResistance: number
    avgFrameElegance: number
    avgImageFidelity: number
    silverMasterpieceCount: number
    perfectReflectionCount: number
    properMirrorCount: number
    tarnishedSilverCount: number
    crackedGlassCount: number
    voidCount: number
    hasHighQualityCount: number
    hasHighClarityCount: number
    hasHighResistanceCount: number
    hasHighEleganceCount: number
    hasHighFidelityCount: number
    overallReflection: number
    mirrorMakerGrade: MirrorMakerGrade
    bestReflection: string
    mostReflective: string
    clearest: string
    mostResistant: string
    mostElegant: string
    mostFaithful: string
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

/** @example classifyReflectionCondition(90) */
export function classifyReflectionCondition(score: number): ReflectionCondition {
  if (score >= 90) return 'silver-masterpiece'
  if (score >= 75) return 'perfect-reflection'
  if (score >= 60) return 'proper-mirror'
  if (score >= 40) return 'tarnished-silver'
  if (score >= 20) return 'cracked-glass'
  return 'void'
}

/** @example classifyGalleryType(reflections) */
export function classifyGalleryType(reflections: SilverReflection[]): GalleryType {
  if (reflections.length === 0) return 'no-gallery'
  const avg =
    reflections.reduce((s, r) => s + r.qualityScore, 0) / reflections.length
  if (avg >= 85) return 'hall-of-mirrors'
  if (avg >= 70) return 'silver-gallery'
  if (avg >= 55) return 'proper-exhibition'
  if (avg >= 35) return 'small-display'
  return 'empty-room'
}

/** @example classifyGalleryCondition(85) */
export function classifyGalleryCondition(score: number): GalleryCondition {
  if (score >= 85) return 'grand-gallery'
  if (score >= 70) return 'silver-hall'
  if (score >= 55) return 'proper-room'
  if (score >= 35) return 'dark-corner'
  if (score >= 15) return 'empty-space'
  return 'void'
}

/** @example classifyMirrorMakerGrade(80) */
export function classifyMirrorMakerGrade(avgReflection: number): MirrorMakerGrade {
  if (avgReflection >= 80) return 'master-silversmith'
  if (avgReflection >= 65) return 'mirror-crafter'
  if (avgReflection >= 50) return 'proper-glassmaker'
  if (avgReflection >= 35) return 'apprentice'
  if (avgReflection >= 20) return 'novice'
  return 'tin-foil-folder'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureIntrospecting('class X { readonly y: string }') */
export function measureIntrospecting(content: string): IntrospectingMeasure {
  const hasSelfAware = /\b(class|interface|type)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = 0
  const hasNoUndocumented = true
  const hasWellStructured = /\b(import|export)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasIntrospective = /\b(readonly|private|protected)\b/.test(content)
  const hasOrganized = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasMaintainable = /\b(const|readonly)\b/.test(content)
  const hasRefactorable = /\b(function|=>)\b/.test(content)
  const hasSelfContained = /\b(async|await|Promise)\b/.test(content)
  const hasCoherent = /\b(try|catch|if)\b/.test(content)
  const hasConsistent = !/\bany\b/.test(content)
  const hasReflective = /\b(return|throw)\b/.test(content)
  const hasHonest = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasSelfAware,
    hasDocumented,
    hasNoUndocumented,
    hasWellStructured,
    hasNoChaotic,
    hasIntrospective,
    hasOrganized,
    hasClean,
    hasMaintainable,
    hasRefactorable,
    hasSelfContained,
    hasCoherent,
    hasConsistent,
    hasReflective,
    hasHonest,
  ]

  const quality = computeScore(positiveBooleans)
  const hasHighQuality = quality >= 60

  let reflection: IntrospectingMeasure['reflection'] = 'no-reflection'
  if (quality >= 90) reflection = 'perfect-mirror'
  else if (quality >= 75) reflection = 'clear-silver'
  else if (quality >= 60) reflection = 'proper-reflection'
  else if (quality >= 40) reflection = 'cloudy-glass'
  else if (quality >= 20) reflection = 'dark-surface'

  return {
    quality,
    reflection,
    hasHighQuality,
    hasSelfAware,
    hasDocumented,
    hasNoUndocumented,
    hasWellStructured,
    hasNoChaotic,
    hasIntrospective,
    hasOrganized,
    hasClean,
    hasMaintainable,
    hasRefactorable,
    hasSelfContained,
    hasCoherent,
    hasConsistent,
    hasReflective,
    hasHonest,
    undocumentedCount,
    chaoticCount,
  }
}

/** @example measureClarifying('export class X { readonly y: string }') */
export function measureClarifying(content: string): ClarifyingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoMystery = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasClear = /\/\*\*[\s\S]*?\*\//.test(content)
  const obfuscatedCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /\b(import|export)\b/.test(content)
  const hasVisible = /\b(readonly|private|protected)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasOpen = /\b(const|readonly)\b/.test(content)
  const hasRevealed = /\b(try|catch|if)\b/.test(content)
  const hasIlluminated = /\b(async|await|Promise)\b/.test(content)
  const hasExpressive = /\b(interface)\b/.test(content)
  const hasCommunicative = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasOpen,
    hasRevealed,
    hasIlluminated,
    hasExpressive,
    hasCommunicative,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let surface: ClarifyingMeasure['surface'] = 'no-clarity'
  if (clarity >= 90) surface = 'flawless-silver'
  else if (clarity >= 75) surface = 'polished-surface'
  else if (clarity >= 60) surface = 'proper-clarity'
  else if (clarity >= 40) surface = 'smudged-glass'
  else if (clarity >= 20) surface = 'foggy'

  return {
    clarity,
    surface,
    hasHighClarity,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasOpen,
    hasRevealed,
    hasIlluminated,
    hasExpressive,
    hasCommunicative,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureResisting('try { x } catch { y }') */
export function measureResisting(content: string): ResistingMeasure {
  const hasStable = /\b(const|readonly)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|fragile)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasConsistent = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval|Function)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasMaintained = /\b(import|export)\b/.test(content)
  const hasPreserved = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasDurable = /\b(class|interface|type)\b/.test(content)
  const hasProtected = /\b(readonly|as const)\b/.test(content)
  const hasHardened = /\b(async|await|Promise)\b/.test(content)
  const hasReinforced = /\b(function|=>|return)\b/.test(content)
  const hasResilient = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasStable,
    hasNoVolatile,
    hasConsistent,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasMaintained,
    hasPreserved,
    hasEnduring,
    hasDurable,
    hasProtected,
    hasHardened,
    hasReinforced,
    hasResilient,
  ]

  const resistance = computeScore(positiveBooleans)
  const hasHighResistance = resistance >= 60

  let tarnish: ResistingMeasure['tarnish'] = 'no-resistance'
  if (resistance >= 90) tarnish = 'sterling-silver'
  else if (resistance >= 75) tarnish = 'rhodium-plated'
  else if (resistance >= 60) tarnish = 'proper-coating'
  else if (resistance >= 40) tarnish = 'tarnishing'
  else if (resistance >= 20) tarnish = 'corroded'

  return {
    resistance,
    tarnish,
    hasHighResistance,
    hasStable,
    hasNoVolatile,
    hasConsistent,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasMaintained,
    hasPreserved,
    hasEnduring,
    hasDurable,
    hasProtected,
    hasHardened,
    hasReinforced,
    hasResilient,
    volatileCount,
    untestedCount,
  }
}

/** @example measureFraming('export class X { readonly y: string }') */
export function measureFraming(content: string): FramingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasElegant = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRefined = /\b(const|readonly)\b/.test(content)
  const hasPolished = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGraceful = /\b(async|await|Promise)\b/.test(content)
  const hasHarmonious = /\b(function|=>)\b/.test(content)
  const hasBalanced = /\b(try|catch|if)\b/.test(content)
  const hasAesthetic = /\b(interface)\b/.test(content)
  const hasCrafted = !/\bany\b/.test(content)
  const hasBeautiful = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasOrganized,
    hasClean,
    hasElegant,
    hasRefined,
    hasPolished,
    hasGraceful,
    hasHarmonious,
    hasBalanced,
    hasAesthetic,
    hasCrafted,
    hasBeautiful,
  ]

  const elegance = computeScore(positiveBooleans)
  const hasHighElegance = elegance >= 60

  let frame: FramingMeasure['frame'] = 'no-elegance'
  if (elegance >= 90) frame = 'ornate-frame'
  else if (elegance >= 75) frame = 'elegant-border'
  else if (elegance >= 60) frame = 'proper-edge'
  else if (elegance >= 40) frame = 'rough-border'
  else if (elegance >= 20) frame = 'no-frame'

  return {
    elegance,
    frame,
    hasHighElegance,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasOrganized,
    hasClean,
    hasElegant,
    hasRefined,
    hasPolished,
    hasGraceful,
    hasHarmonious,
    hasBalanced,
    hasAesthetic,
    hasCrafted,
    hasBeautiful,
    chaoticCount,
    monolithicCount,
  }
}

/** @example measureRepresenting('const x: string = ""') */
export function measureRepresenting(content: string): RepresentingMeasure {
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(roughly|approximately|guesstimate)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(readonly|as const)\b/.test(content)
  const hasCorrect = /\b(import|export)\b/.test(content)
  const hasFaithful = /\b(function|=>|return)\b/.test(content)
  const hasPrecise = /\b(class|interface|type)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasHonest = !/\bany\b/.test(content)
  const hasTrue = /\b(const|readonly)\b/.test(content)
  const hasAuthentic = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGenuine = /\b(readonly|private|protected)\b/.test(content)
  const hasUnambiguous = /\b(try|catch|if)\b/.test(content)
  const hasUnDistorted = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasSharp = /\b(async|await|Promise)\b/.test(content)
  const hasCrisp = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const distortedCount = (content.match(/\b(distorted|warped|skewed)\b/gi) ?? []).length

  const positiveBooleans = [
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasCorrect,
    hasFaithful,
    hasPrecise,
    hasClean,
    hasHonest,
    hasTrue,
    hasAuthentic,
    hasGenuine,
    hasUnambiguous,
    hasUnDistorted,
    hasSharp,
    hasCrisp,
  ]

  const fidelity = computeScore(positiveBooleans)
  const hasHighFidelity = fidelity >= 60

  let image: RepresentingMeasure['image'] = 'no-fidelity'
  if (fidelity >= 90) image = 'perfect-fidelity'
  else if (fidelity >= 75) image = 'faithful-render'
  else if (fidelity >= 60) image = 'proper-representation'
  else if (fidelity >= 40) image = 'distorted'
  else if (fidelity >= 20) image = 'warped'

  return {
    fidelity,
    image,
    hasHighFidelity,
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasCorrect,
    hasFaithful,
    hasPrecise,
    hasClean,
    hasHonest,
    hasTrue,
    hasAuthentic,
    hasGenuine,
    hasUnambiguous,
    hasUnDistorted,
    hasSharp,
    hasCrisp,
    approximateCount,
    distortedCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeSilverReflection(content, 'app.ts') */
export function analyzeSilverReflection(content: string, filePath: string): SilverReflection {
  const introspecting = measureIntrospecting(content)
  const clarifying = measureClarifying(content)
  const resisting = measureResisting(content)
  const framing = measureFraming(content)
  const representing = measureRepresenting(content)

  const reflectionQuality = introspecting.quality
  const surfaceClarity = clarifying.clarity
  const tarnishResistance = resisting.resistance
  const frameElegance = framing.elegance
  const imageFidelity = representing.fidelity

  const qualityScore = Math.round(
    reflectionQuality * 0.2 +
    surfaceClarity * 0.2 +
    tarnishResistance * 0.2 +
    frameElegance * 0.2 +
    imageFidelity * 0.2,
  )

  const condition = classifyReflectionCondition(qualityScore)

  return {
    file: filePath,
    reflectionQuality,
    surfaceClarity,
    tarnishResistance,
    frameElegance,
    imageFidelity,
    introspecting,
    clarifying,
    resisting,
    framing,
    representing,
    condition,
    qualityScore,
  }
}

/** @example analyzeSilverGallery(reflections, 'src') */
export function analyzeSilverGallery(reflections: SilverReflection[], dirPath: string): SilverGallery {
  if (reflections.length === 0) {
    return {
      directory: dirPath,
      reflections: [],
      avgClarity: 0,
      avgElegance: 0,
      avgFidelity: 0,
      silverMasterpieceCount: 0,
      voidCount: 0,
      galleryType: 'no-gallery',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(
    reflections.reduce((s, r) => s + r.surfaceClarity, 0) / reflections.length,
  )
  const avgElegance = Math.round(
    reflections.reduce((s, r) => s + r.frameElegance, 0) / reflections.length,
  )
  const avgFidelity = Math.round(
    reflections.reduce((s, r) => s + r.imageFidelity, 0) / reflections.length,
  )

  const silverMasterpieceCount = reflections.filter(
    (r) => r.condition === 'silver-masterpiece',
  ).length
  const voidCount = reflections.filter((r) => r.condition === 'void').length

  const galleryType = classifyGalleryType(reflections)
  const avgQuality = Math.round(
    reflections.reduce((s, r) => s + r.qualityScore, 0) / reflections.length,
  )
  const condition = classifyGalleryCondition(avgQuality)

  return {
    directory: dirPath,
    reflections,
    avgClarity,
    avgElegance,
    avgFidelity,
    silverMasterpieceCount,
    voidCount,
    galleryType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildSilverMirrorResult(['a.ts'], [content]) */
export async function buildSilverMirrorResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SilverMirrorResult> {
  const reflections: SilverReflection[] = files.map((file, i) =>
    analyzeSilverReflection(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, SilverReflection[]>()
  for (const reflection of reflections) {
    const dir = reflection.file.includes('/')
      ? reflection.file.substring(0, reflection.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(reflection)
    } else {
      dirMap.set(dir, [reflection])
    }
  }

  const galleries: SilverGallery[] = Array.from(dirMap.entries()).map(([dir, dirReflections]) =>
    analyzeSilverGallery(dirReflections, dir),
  )

  const avgReflectionQuality =
    reflections.length > 0
      ? Math.round(reflections.reduce((s, r) => s + r.reflectionQuality, 0) / reflections.length)
      : 0
  const avgSurfaceClarity =
    reflections.length > 0
      ? Math.round(reflections.reduce((s, r) => s + r.surfaceClarity, 0) / reflections.length)
      : 0
  const avgTarnishResistance =
    reflections.length > 0
      ? Math.round(reflections.reduce((s, r) => s + r.tarnishResistance, 0) / reflections.length)
      : 0
  const avgFrameElegance =
    reflections.length > 0
      ? Math.round(reflections.reduce((s, r) => s + r.frameElegance, 0) / reflections.length)
      : 0
  const avgImageFidelity =
    reflections.length > 0
      ? Math.round(reflections.reduce((s, r) => s + r.imageFidelity, 0) / reflections.length)
      : 0

  const overallReflection =
    reflections.length > 0
      ? Math.round(reflections.reduce((s, r) => s + r.qualityScore, 0) / reflections.length)
      : 0
  const isSilver = overallReflection >= 60

  const mirror = {
    avgClarity: avgSurfaceClarity,
    avgElegance: avgFrameElegance,
    avgFidelity: avgImageFidelity,
    isSilver,
    overallReflection,
  }

  const silverMasterpieceCount = reflections.filter(
    (r) => r.condition === 'silver-masterpiece',
  ).length
  const perfectReflectionCount = reflections.filter(
    (r) => r.condition === 'perfect-reflection',
  ).length
  const properMirrorCount = reflections.filter(
    (r) => r.condition === 'proper-mirror',
  ).length
  const tarnishedSilverCount = reflections.filter(
    (r) => r.condition === 'tarnished-silver',
  ).length
  const crackedGlassCount = reflections.filter(
    (r) => r.condition === 'cracked-glass',
  ).length
  const voidCount = reflections.filter((r) => r.condition === 'void').length

  const hasHighQualityCount = reflections.filter(
    (r) => r.introspecting.hasHighQuality,
  ).length
  const hasHighClarityCount = reflections.filter(
    (r) => r.clarifying.hasHighClarity,
  ).length
  const hasHighResistanceCount = reflections.filter(
    (r) => r.resisting.hasHighResistance,
  ).length
  const hasHighEleganceCount = reflections.filter(
    (r) => r.framing.hasHighElegance,
  ).length
  const hasHighFidelityCount = reflections.filter(
    (r) => r.representing.hasHighFidelity,
  ).length

  const mirrorMakerGrade = classifyMirrorMakerGrade(overallReflection)

  const bestReflection = reflections.length > 0
    ? reflections.reduce((best, r) => (r.qualityScore > best.qualityScore ? r : best)).file
    : ''
  const mostReflective = reflections.length > 0
    ? reflections.reduce((best, r) => (r.reflectionQuality > best.reflectionQuality ? r : best)).file
    : ''
  const clearest = reflections.length > 0
    ? reflections.reduce((best, r) => (r.surfaceClarity > best.surfaceClarity ? r : best)).file
    : ''
  const mostResistant = reflections.length > 0
    ? reflections.reduce((best, r) => (r.tarnishResistance > best.tarnishResistance ? r : best)).file
    : ''
  const mostElegant = reflections.length > 0
    ? reflections.reduce((best, r) => (r.frameElegance > best.frameElegance ? r : best)).file
    : ''
  const mostFaithful = reflections.length > 0
    ? reflections.reduce((best, r) => (r.imageFidelity > best.imageFidelity ? r : best)).file
    : ''

  const stats: SilverMirrorResult['stats'] = {
    totalFiles: files.length,
    totalGalleries: galleries.length,
    avgReflectionQuality,
    avgSurfaceClarity,
    avgTarnishResistance,
    avgFrameElegance,
    avgImageFidelity,
    silverMasterpieceCount,
    perfectReflectionCount,
    properMirrorCount,
    tarnishedSilverCount,
    crackedGlassCount,
    voidCount,
    hasHighQualityCount,
    hasHighClarityCount,
    hasHighResistanceCount,
    hasHighEleganceCount,
    hasHighFidelityCount,
    overallReflection,
    mirrorMakerGrade,
    bestReflection,
    mostReflective,
    clearest,
    mostResistant,
    mostElegant,
    mostFaithful,
  }

  const recommendations = generateRecommendations(reflections, galleries, mirror, stats)

  return { reflections, galleries, mirror, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(reflections, galleries, mirror, stats) */
export function generateRecommendations(
  reflections: SilverReflection[],
  galleries: SilverGallery[],
  mirror: SilverMirrorResult['mirror'],
  stats: SilverMirrorResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgReflectionQuality >= 90 &&
    stats.avgSurfaceClarity >= 90 &&
    stats.avgTarnishResistance >= 90 &&
    stats.avgFrameElegance >= 90 &&
    stats.avgImageFidelity >= 90
  ) {
    recs.push(
      'Your silver mirror is a masterpiece of reflection! Every surface combines reflection quality, surface clarity, tarnish resistance, frame elegance, and image fidelity into a mirror that reflects truth perfectly!',
    )
    return recs
  }

  if (stats.avgReflectionQuality < 60) {
    recs.push(
      'Deepen the reflection quality — a silver mirror exists for self-awareness; your code should be introspective, documented, and honest about its own nature',
    )
  }

  if (stats.avgSurfaceClarity < 60) {
    recs.push(
      'Polish the surface clarity — silver is the most reflective metal when clean; your code should be transparent, readable, and clear to every reader',
    )
  }

  if (stats.avgTarnishResistance < 60) {
    recs.push(
      'Strengthen tarnish resistance — silver tarnishes in air but sterling endures; your code should resist degradation through type safety, testing, and stable patterns',
    )
  }

  if (stats.avgFrameElegance < 60) {
    recs.push(
      'Refine the frame elegance — a mirror frame elevates its function; your code should be well-structured, modular, and beautiful in its organization',
    )
  }

  if (stats.avgImageFidelity < 60) {
    recs.push(
      'Improve image fidelity — a mirror that distorts is worse than no mirror; your code should faithfully and precisely represent its intent without approximation',
    )
  }

  if (stats.overallReflection < 40) {
    recs.push(
      'The mirror is cracked — until the silver is re-laid on glass, no clear reflection is possible',
    )
  }

  const voidReflections = reflections.filter((r) => r.condition === 'void')
  if (voidReflections.length > 0 && voidReflections.length <= 5) {
    recs.push(
      `Re-silver these cracked glasses: ${voidReflections.map((r) => r.file).join(', ')}`,
    )
  } else if (voidReflections.length > 5) {
    recs.push(
      `Re-silver these ${voidReflections.length} cracked glasses before the entire gallery goes dark`,
    )
  }

  const poorGalleries = galleries.filter(
    (g) => g.condition === 'void' || g.condition === 'empty-space',
  )
  if (poorGalleries.length === galleries.length && galleries.length > 0) {
    recs.push(
      'All galleries are empty spaces — the silver mirror needs a complete restoration from frame to surface',
    )
  }

  if (recs.length === 0) {
    recs.push('Your silver mirror reflects with clarity — each surface combines reflection quality, surface clarity, tarnish resistance, frame elegance, and image fidelity')
  }

  return recs
}
