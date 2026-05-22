// ─── Interfaces ──────────────────────────────────────────────

export interface BridgeMeasure {
  strength: number
  span: 'bifrost' | 'golden-gate' | 'stone-arch' | 'rope-bridge' | 'plank' | 'broken'
  hasHighStrength: boolean
  hasSolidPillars: boolean
  hasProperCabling: boolean
  hasNoStructuralWeakness: boolean
  hasLoadDistribution: boolean
  hasNoSinglePoint: boolean
  hasProperSpan: boolean
  hasNoSagging: boolean
  hasExpansionJoints: boolean
  hasNoCorrosion: boolean
  weaknessCount: number
  corrosionCount: number
}

export interface SpectrumMeasure {
  breadth: number
  colors: 'full-spectrum' | 'rich-palette' | 'primary' | 'monochrome' | 'faded' | 'invisible'
  hasHighBreadth: boolean
  hasRed: boolean
  hasOrange: boolean
  hasYellow: boolean
  hasGreen: boolean
  hasBlue: boolean
  hasIndigo: boolean
  hasViolet: boolean
  hasNoColorBlindness: boolean
  hasProperDistribution: boolean
  hasNoMonochrome: boolean
  missingColorCount: number
  monochromeCount: number
}

export interface TransitionMeasure {
  grace: number
  elegance: 'ballet' | 'waltz' | 'smooth' | 'stiff' | 'clumsy' | 'falling'
  hasHighGrace: boolean
  hasFluidMotion: boolean
  hasProperPacing: boolean
  hasNoJarring: boolean
  hasSmoothHandoff: boolean
  hasNoAbrupt: boolean
  hasProperCrescendo: boolean
  hasNoChaos: boolean
  hasNaturalFlow: boolean
  hasNoDeadStop: boolean
  jarringCount: number
  abruptCount: number
}

export interface AtmosphereMeasure {
  clarity: number
  condition: 'crystal-clear' | 'clear-sky' | 'light-haze' | 'cloudy' | 'foggy' | 'opaque'
  hasHighClarity: boolean
  hasGoodVisibility: boolean
  hasNoFog: boolean
  hasProperLighting: boolean
  hasNoGlare: boolean
  hasCleanAir: boolean
  hasNoSmog: boolean
  hasWideHorizon: boolean
  hasNoBlindSpots: boolean
  hasBreathable: boolean
  fogCount: number
  smogCount: number
}

export interface VisionMeasure {
  quality: number
  clarity: 'panoramic' | 'eagle-eye' | 'clear-vision' | 'near-sighted' | 'tunnel-vision' | 'blind'
  hasHighQuality: boolean
  hasDepth: boolean
  hasBreadth: boolean
  hasNoBlindSpots: boolean
  hasProperPerspective: boolean
  hasNoDistortion: boolean
  hasForesight: boolean
  hasNoMyopia: boolean
  hasHolisticView: boolean
  hasNoTunnelVision: boolean
  blindSpotCount: number
  myopiaCount: number
}

export interface LuminanceMeasure {
  level: number
  brightness: 'blinding' | 'bright' | 'luminous' | 'dim' | 'dark' | 'void'
  hasHighLuminance: boolean
  hasRadiance: boolean
  hasProperGlow: boolean
  hasNoShadow: boolean
  hasWarmLight: boolean
  hasNoDarkness: boolean
  hasConsistent: boolean
  hasNoFlickering: boolean
  hasInviting: boolean
  hasNoHarsh: boolean
  shadowCount: number
  flickeringCount: number
}

export interface BridgeSpan {
  file: string
  bridgeStrength: number
  spectrumBreadth: number
  transitionGrace: number
  atmosphericClarity: number
  visionQuality: number
  luminance: number
  bridge: BridgeMeasure
  spectrum: SpectrumMeasure
  transition: TransitionMeasure
  atmosphere: AtmosphereMeasure
  vision: VisionMeasure
  luminanceMeasure: LuminanceMeasure
  condition: 'divine-rainbow' | 'vibrant-arc' | 'painted-bridge' | 'faded-arch' | 'misty-outline' | 'no-bridge'
  qualityScore: number
}

export interface RainbowArc {
  directory: string
  spans: BridgeSpan[]
  avgStrength: number
  avgSpectrum: number
  avgVision: number
  divineCount: number
  noBridgeCount: number
  strongCount: number
  diverseCount: number
  arcType: 'grand-rainbow' | 'double-rainbow' | 'single-arc' | 'sun-dog' | 'mist-arc' | 'no-light'
  condition: 'celestial-bridge' | 'vibrant-arc' | 'steady-span' | 'fading-light' | 'dim-outline' | 'darkness'
}

export interface RainbowBridgeResult {
  spans: BridgeSpan[]
  arcs: RainbowArc[]
  sky: {
    avgStrength: number
    avgSpectrum: number
    avgVision: number
    isConnected: boolean
    overallConnection: number
  }
  stats: {
    totalFiles: number
    totalArcs: number
    avgBridgeStrength: number
    avgSpectrumBreadth: number
    avgTransitionGrace: number
    avgAtmosphericClarity: number
    avgVisionQuality: number
    avgLuminance: number
    divineRainbowCount: number
    vibrantArcCount: number
    paintedBridgeCount: number
    fadedArchCount: number
    mistyOutlineCount: number
    noBridgeCount: number
    hasHighStrengthCount: number
    hasHighBreadthCount: number
    hasHighGraceCount: number
    hasHighClarityCount: number
    hasHighQualityCount: number
    hasHighLuminanceCount: number
    overallConnection: number
    architectGrade: 'bridge-architect' | 'rainbow-weaver' | 'span-builder' | 'apprentice' | 'observer' | 'colorblind'
    bestSpan: string
    strongest: string
    mostDiverse: string
    mostGraceful: string
    clearest: string
    brightest: string
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
const ASYNC_RE = /\basync\b/
const AWAIT_RE = /\bawait\b/
const TRY_RE = /\btry\b/
const CATCH_RE = /\bcatch\b/
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
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g

// ─── measureBridge ───────────────────────────────────────────

/** @example measureBridge(content) returns BridgeMeasure */
export function measureBridge(content: string): BridgeMeasure {
  let score = 0

  const hasSolidPillars = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const hasProperCabling = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const weaknessCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoStructuralWeakness = weaknessCount === 0
  const hasLoadDistribution = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoSinglePoint = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasProperSpan = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const hasNoSagging = !NESTED_TERNARY_RE.test(content)
  const hasExpansionJoints = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const corrosionCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoCorrosion = corrosionCount === 0

  if (content.length > 0) score += 5
  if (hasSolidPillars) score += 12
  if (hasProperCabling) score += 12
  if (hasNoStructuralWeakness) score += 10
  if (hasLoadDistribution) score += 10
  if (hasNoSinglePoint) score += 10
  if (hasProperSpan) score += 10
  if (hasNoSagging) score += 10
  if (hasExpansionJoints) score += 11
  if (hasNoCorrosion) score += 10

  const strength = Math.min(100, Math.max(0, score))
  const hasHighStrength = strength >= 70

  let span: BridgeMeasure['span'] = 'broken'
  if (hasHighStrength && hasNoStructuralWeakness && hasNoCorrosion && hasSolidPillars) span = 'bifrost'
  else if (hasHighStrength && hasNoStructuralWeakness) span = 'golden-gate'
  else if (hasHighStrength) span = 'stone-arch'
  else if (hasSolidPillars && hasProperSpan) span = 'rope-bridge'
  else if (strength > 30) span = 'plank'

  return {
    strength, span, hasHighStrength, hasSolidPillars, hasProperCabling,
    hasNoStructuralWeakness, hasLoadDistribution, hasNoSinglePoint,
    hasProperSpan, hasNoSagging, hasExpansionJoints, hasNoCorrosion,
    weaknessCount, corrosionCount,
  }
}

// ─── measureSpectrum ─────────────────────────────────────────

/** @example measureSpectrum(content) returns SpectrumMeasure */
export function measureSpectrum(content: string): SpectrumMeasure {
  let score = 0

  const hasRed = CLASS_RE.test(content)
  const hasOrange = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const hasYellow = INTERFACE_RE.test(content) || TYPE_RE.test(content)
  const hasGreen = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasBlue = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasIndigo = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasViolet = (content.match(DOC_COMMENT_RE) || []).length > 0
  const missingColorCount = [hasRed, hasOrange, hasYellow, hasGreen, hasBlue, hasIndigo, hasViolet].filter((c) => !c).length
  const hasNoColorBlindness = missingColorCount <= 2
  const hasProperDistribution = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const monochromeCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoMonochrome = monochromeCount === 0

  if (content.length > 0) score += 5
  if (hasRed) score += 10
  if (hasOrange) score += 10
  if (hasYellow) score += 10
  if (hasGreen) score += 10
  if (hasBlue) score += 10
  if (hasIndigo) score += 10
  if (hasViolet) score += 10
  if (hasNoColorBlindness) score += 10
  if (hasProperDistribution) score += 5

  const breadth = Math.min(100, Math.max(0, score))
  const hasHighBreadth = breadth >= 70

  let colors: SpectrumMeasure['colors'] = 'invisible'
  if (hasHighBreadth && missingColorCount === 0 && hasNoMonochrome) colors = 'full-spectrum'
  else if (hasHighBreadth && missingColorCount <= 2) colors = 'rich-palette'
  else if (hasHighBreadth) colors = 'primary'
  else if (hasProperDistribution && hasYellow) colors = 'monochrome'
  else if (breadth > 30) colors = 'faded'

  return {
    breadth, colors, hasHighBreadth, hasRed, hasOrange, hasYellow,
    hasGreen, hasBlue, hasIndigo, hasViolet, hasNoColorBlindness,
    hasProperDistribution, hasNoMonochrome, missingColorCount, monochromeCount,
  }
}

// ─── measureTransition ───────────────────────────────────────

/** @example measureTransition(content) returns TransitionMeasure */
export function measureTransition(content: string): TransitionMeasure {
  let score = 0

  const hasFluidMotion = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasProperPacing = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const jarringCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoJarring = jarringCount === 0
  const hasSmoothHandoff = INTERFACE_RE.test(content) || TYPE_RE.test(content)
  const abruptCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoAbrupt = abruptCount === 0
  const hasProperCrescendo = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasNoChaos = !NESTED_TERNARY_RE.test(content)
  const hasNaturalFlow = content.length > 0 && (RETURN_RE.test(content) || THROW_RE.test(content))
  const hasNoDeadStop = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasFluidMotion) score += 12
  if (hasProperPacing) score += 12
  if (hasNoJarring) score += 10
  if (hasSmoothHandoff) score += 10
  if (hasNoAbrupt) score += 10
  if (hasProperCrescendo) score += 10
  if (hasNoChaos) score += 10
  if (hasNaturalFlow) score += 11
  if (hasNoDeadStop) score += 10

  const grace = Math.min(100, Math.max(0, score))
  const hasHighGrace = grace >= 70

  let elegance: TransitionMeasure['elegance'] = 'falling'
  if (hasHighGrace && hasNoJarring && hasNoAbrupt && hasFluidMotion) elegance = 'ballet'
  else if (hasHighGrace && hasNoJarring) elegance = 'waltz'
  else if (hasHighGrace) elegance = 'smooth'
  else if (hasSmoothHandoff && hasProperPacing) elegance = 'stiff'
  else if (grace > 30) elegance = 'clumsy'

  return {
    grace, elegance, hasHighGrace, hasFluidMotion, hasProperPacing,
    hasNoJarring, hasSmoothHandoff, hasNoAbrupt, hasProperCrescendo,
    hasNoChaos, hasNaturalFlow, hasNoDeadStop, jarringCount, abruptCount,
  }
}

// ─── measureAtmosphere ───────────────────────────────────────

/** @example measureAtmosphere(content) returns AtmosphereMeasure */
export function measureAtmosphere(content: string): AtmosphereMeasure {
  let score = 0

  const lines = content.split('\n')
  const avgLineLen = lines.length > 0 ? lines.reduce((s, l) => s + l.length, 0) / lines.length : 0
  const hasGoodVisibility = avgLineLen < 80
  const fogCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoFog = fogCount === 0
  const hasProperLighting = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoGlare = lines.every((l) => l.length < 120)
  const smogCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasCleanAir = smogCount === 0
  const hasNoSmog = (content.match(DEPRECATED_RE) || []).length === 0
  const hasWideHorizon = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const hasNoBlindSpots = !NESTED_TERNARY_RE.test(content)
  const hasBreathable = content.length > 0 && (FUNCTION_RE.test(content) || ARROW_RE.test(content))

  if (content.length > 0) score += 5
  if (hasGoodVisibility) score += 12
  if (hasNoFog) score += 10
  if (hasProperLighting) score += 12
  if (hasNoGlare) score += 10
  if (hasCleanAir) score += 10
  if (hasNoSmog) score += 10
  if (hasWideHorizon) score += 10
  if (hasNoBlindSpots) score += 11
  if (hasBreathable) score += 10

  const clarity = Math.min(100, Math.max(0, score))
  const hasHighClarity = clarity >= 70

  let condition: AtmosphereMeasure['condition'] = 'opaque'
  if (hasHighClarity && hasNoFog && hasCleanAir && hasGoodVisibility) condition = 'crystal-clear'
  else if (hasHighClarity && hasNoFog) condition = 'clear-sky'
  else if (hasHighClarity) condition = 'light-haze'
  else if (hasWideHorizon && hasGoodVisibility) condition = 'cloudy'
  else if (clarity > 30) condition = 'foggy'

  return {
    clarity, condition, hasHighClarity, hasGoodVisibility, hasNoFog,
    hasProperLighting, hasNoGlare, hasCleanAir, hasNoSmog,
    hasWideHorizon, hasNoBlindSpots, hasBreathable, fogCount, smogCount,
  }
}

// ─── measureVision ───────────────────────────────────────────

/** @example measureVision(content) returns VisionMeasure */
export function measureVision(content: string): VisionMeasure {
  let score = 0

  const hasDepth = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const hasBreadth = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const blindSpotCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoBlindSpots = blindSpotCount === 0
  const hasProperPerspective = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoDistortion = !NESTED_TERNARY_RE.test(content)
  const hasForesight = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const myopiaCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length + (content.match(HACK_RE) || []).length
  const hasNoMyopia = myopiaCount === 0
  const hasHolisticView = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoTunnelVision = (content.match(DEPRECATED_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasDepth) score += 12
  if (hasBreadth) score += 12
  if (hasNoBlindSpots) score += 10
  if (hasProperPerspective) score += 10
  if (hasNoDistortion) score += 10
  if (hasForesight) score += 10
  if (hasNoMyopia) score += 10
  if (hasHolisticView) score += 11
  if (hasNoTunnelVision) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let clarity: VisionMeasure['clarity'] = 'blind'
  if (hasHighQuality && hasNoBlindSpots && hasDepth && hasForesight) clarity = 'panoramic'
  else if (hasHighQuality && hasNoBlindSpots) clarity = 'eagle-eye'
  else if (hasHighQuality) clarity = 'clear-vision'
  else if (hasDepth && hasHolisticView) clarity = 'near-sighted'
  else if (quality > 30) clarity = 'tunnel-vision'

  return {
    quality, clarity, hasHighQuality, hasDepth, hasBreadth,
    hasNoBlindSpots, hasProperPerspective, hasNoDistortion,
    hasForesight, hasNoMyopia, hasHolisticView, hasNoTunnelVision,
    blindSpotCount, myopiaCount,
  }
}

// ─── measureLuminance ────────────────────────────────────────

/** @example measureLuminance(content) returns LuminanceMeasure */
export function measureLuminance(content: string): LuminanceMeasure {
  let score = 0

  const hasRadiance = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasProperGlow = (content.match(DOC_COMMENT_RE) || []).length > 0
  const shadowCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoShadow = shadowCount === 0
  const hasWarmLight = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoDarkness = (content.match(DEPRECATED_RE) || []).length === 0
  const hasConsistent = content.length > 0 && (RETURN_RE.test(content) || THROW_RE.test(content))
  const flickeringCount = (content.match(CONSOLE_RE) || []).length
  const hasNoFlickering = flickeringCount === 0
  const hasInviting = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const hasNoHarsh = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasRadiance) score += 12
  if (hasProperGlow) score += 12
  if (hasNoShadow) score += 10
  if (hasWarmLight) score += 10
  if (hasNoDarkness) score += 10
  if (hasConsistent) score += 10
  if (hasNoFlickering) score += 10
  if (hasInviting) score += 11
  if (hasNoHarsh) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLuminance = level >= 70

  let brightness: LuminanceMeasure['brightness'] = 'void'
  if (hasHighLuminance && hasNoShadow && hasProperGlow && hasRadiance) brightness = 'blinding'
  else if (hasHighLuminance && hasNoShadow) brightness = 'bright'
  else if (hasHighLuminance) brightness = 'luminous'
  else if (hasInviting && hasConsistent) brightness = 'dim'
  else if (level > 30) brightness = 'dark'

  return {
    level, brightness, hasHighLuminance, hasRadiance, hasProperGlow,
    hasNoShadow, hasWarmLight, hasNoDarkness, hasConsistent,
    hasNoFlickering, hasInviting, hasNoHarsh, shadowCount, flickeringCount,
  }
}

// ─── classifyCondition ───────────────────────────────────────

/** @example classifyCondition(span) returns condition */
export function classifyCondition(span: BridgeSpan): BridgeSpan['condition'] {
  const { qualityScore } = span
  if (qualityScore >= 80) return 'divine-rainbow'
  if (qualityScore >= 65) return 'vibrant-arc'
  if (qualityScore >= 50) return 'painted-bridge'
  if (qualityScore >= 35) return 'faded-arch'
  if (qualityScore >= 20) return 'misty-outline'
  return 'no-bridge'
}

// ─── analyzeBridgeSpan ───────────────────────────────────────

/** @example analyzeBridgeSpan(content, filePath) returns full span */
export function analyzeBridgeSpan(content: string, filePath: string): BridgeSpan {
  const bridge = measureBridge(content)
  const spectrum = measureSpectrum(content)
  const transition = measureTransition(content)
  const atmosphere = measureAtmosphere(content)
  const vision = measureVision(content)
  const luminanceMeasure = measureLuminance(content)

  const bridgeStrength = bridge.strength
  const spectrumBreadth = spectrum.breadth
  const transitionGrace = transition.grace
  const atmosphericClarity = atmosphere.clarity
  const visionQuality = vision.quality
  const luminance = luminanceMeasure.level

  const qualityScore = Math.round(
    bridgeStrength * 0.2 +
    spectrumBreadth * 0.15 +
    transitionGrace * 0.15 +
    atmosphericClarity * 0.15 +
    visionQuality * 0.2 +
    luminance * 0.15,
  )

  const result: BridgeSpan = {
    file: filePath,
    bridgeStrength, spectrumBreadth, transitionGrace,
    atmosphericClarity, visionQuality, luminance,
    bridge, spectrum, transition, atmosphere, vision, luminanceMeasure,
    qualityScore,
    condition: 'no-bridge',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── Rainbow Arc Analysis ────────────────────────────────────

/** @example analyzeRainbowArc(spans, dirPath) returns RainbowArc */
export function analyzeRainbowArc(spans: BridgeSpan[], dirPath: string): RainbowArc {
  if (spans.length === 0) {
    return {
      directory: dirPath, spans: [], avgStrength: 0, avgSpectrum: 0, avgVision: 0,
      divineCount: 0, noBridgeCount: 0, strongCount: 0, diverseCount: 0,
      arcType: 'no-light', condition: 'darkness',
    }
  }

  const avgStrength = Math.round(spans.reduce((s, sp) => s + sp.bridgeStrength, 0) / spans.length)
  const avgSpectrum = Math.round(spans.reduce((s, sp) => s + sp.spectrumBreadth, 0) / spans.length)
  const avgVision = Math.round(spans.reduce((s, sp) => s + sp.visionQuality, 0) / spans.length)
  const divineCount = spans.filter((sp) => sp.condition === 'divine-rainbow').length
  const noBridgeCount = spans.filter((sp) => sp.condition === 'no-bridge').length
  const strongCount = spans.filter((sp) => sp.bridge.hasHighStrength).length
  const diverseCount = spans.filter((sp) => sp.spectrum.hasHighBreadth).length

  const arcType = classifyArcType(spans)
  const avgScore = spans.reduce((s, sp) => s + sp.qualityScore, 0) / spans.length
  let condition: RainbowArc['condition'] = 'darkness'
  if (avgScore >= 75) condition = 'celestial-bridge'
  else if (avgScore >= 60) condition = 'vibrant-arc'
  else if (avgScore >= 45) condition = 'steady-span'
  else if (avgScore >= 30) condition = 'fading-light'
  else if (avgScore >= 15) condition = 'dim-outline'

  return {
    directory: dirPath, spans, avgStrength, avgSpectrum, avgVision,
    divineCount, noBridgeCount, strongCount, diverseCount, arcType, condition,
  }
}

// ─── classifyArcType ─────────────────────────────────────────

/** @example classifyArcType(spans) returns arc type */
export function classifyArcType(spans: BridgeSpan[]): RainbowArc['arcType'] {
  if (spans.length === 0) return 'no-light'
  const avgScore = spans.reduce((s, sp) => s + sp.qualityScore, 0) / spans.length
  const divineCnt = spans.filter((sp) => sp.condition === 'divine-rainbow').length
  if (avgScore >= 75 && divineCnt >= Math.ceil(spans.length * 0.3)) return 'grand-rainbow'
  if (avgScore >= 60) return 'double-rainbow'
  if (avgScore >= 45) return 'single-arc'
  if (avgScore >= 30) return 'sun-dog'
  if (avgScore >= 15) return 'mist-arc'
  return 'no-light'
}

// ─── classifyArchitectGrade ──────────────────────────────────

/** @example classifyArchitectGrade(avgConnection) returns grade */
export function classifyArchitectGrade(avgConnection: number): RainbowBridgeResult['stats']['architectGrade'] {
  if (avgConnection >= 80) return 'bridge-architect'
  if (avgConnection >= 65) return 'rainbow-weaver'
  if (avgConnection >= 50) return 'span-builder'
  if (avgConnection >= 35) return 'apprentice'
  if (avgConnection >= 20) return 'observer'
  return 'colorblind'
}

// ─── generateRecommendations ─────────────────────────────────

/** @example generateRecommendations(spans, arcs, sky, stats) returns string[] */
export function generateRecommendations(
  spans: BridgeSpan[],
  arcs: RainbowArc[],
  sky: RainbowBridgeResult['sky'],
  stats: RainbowBridgeResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgBridgeStrength < 50) recs.push('Strengthen bridge pillars — add interfaces, types, and classes for solid foundations')
  if (stats.avgSpectrumBreadth < 50) recs.push('Broaden your spectrum — increase code diversity across all feature dimensions')
  if (stats.avgTransitionGrace < 50) recs.push('Improve transition grace — reduce any/eval and add smooth async flow')
  if (stats.avgAtmosphericClarity < 50) recs.push('Clear the atmosphere — reduce line length and remove TODOs/FIXMEs')
  if (stats.avgVisionQuality < 50) recs.push('Sharpen your vision — add depth with interfaces, types, and classes together')
  if (stats.avgLuminance < 50) recs.push('Increase luminance — add exports, documentation, and reduce code shadows')
  if (stats.noBridgeCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of spans have no bridge — consider major refactoring')
  if (stats.mistyOutlineCount > 0) recs.push('Warning: misty outlines detected — these files need stronger connections')
  if (sky.overallConnection < 40) recs.push('Overall connection is critical — establish a code bridge-building plan')
  if (arcs.length > 0 && arcs.every((a) => a.condition === 'darkness')) recs.push('All arcs are in darkness — your codebase needs fundamental connectivity')

  if (spans.length > 0) {
    const weak = spans.filter((sp) => sp.bridge.weaknessCount > 2)
    if (weak.length > spans.length * 0.5) recs.push('Over 50% of spans have structural weakness — reduce any/eval usage')
  }

  return recs
}

// ─── buildRainbowBridgeResult ────────────────────────────────

/** @example buildRainbowBridgeResult(files, contents) returns full result */
export function buildRainbowBridgeResult(files: string[], contents: string[]): RainbowBridgeResult {
  const spans = files.map((file, i) => analyzeBridgeSpan(contents[i] ?? '', file))

  const arcMap = new Map<string, BridgeSpan[]>()
  spans.forEach((span) => {
    const parts = span.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = arcMap.get(dir)
    if (existing) existing.push(span)
    else arcMap.set(dir, [span])
  })

  const arcs = Array.from(arcMap.entries()).map(([dir, ss]) => analyzeRainbowArc(ss, dir))

  const avgBridgeStrength = spans.length > 0 ? Math.round(spans.reduce((s, sp) => s + sp.bridgeStrength, 0) / spans.length) : 0
  const avgSpectrumBreadth = spans.length > 0 ? Math.round(spans.reduce((s, sp) => s + sp.spectrumBreadth, 0) / spans.length) : 0
  const avgTransitionGrace = spans.length > 0 ? Math.round(spans.reduce((s, sp) => s + sp.transitionGrace, 0) / spans.length) : 0
  const avgAtmosphericClarity = spans.length > 0 ? Math.round(spans.reduce((s, sp) => s + sp.atmosphericClarity, 0) / spans.length) : 0
  const avgVisionQuality = spans.length > 0 ? Math.round(spans.reduce((s, sp) => s + sp.visionQuality, 0) / spans.length) : 0
  const avgLuminance = spans.length > 0 ? Math.round(spans.reduce((s, sp) => s + sp.luminance, 0) / spans.length) : 0

  const overallConnection = Math.round(
    avgBridgeStrength * 0.2 +
    avgSpectrumBreadth * 0.15 +
    avgTransitionGrace * 0.15 +
    avgAtmosphericClarity * 0.15 +
    avgVisionQuality * 0.2 +
    avgLuminance * 0.15,
  )

  const sky = {
    avgStrength: avgBridgeStrength,
    avgSpectrum: avgSpectrumBreadth,
    avgVision: avgVisionQuality,
    isConnected: overallConnection >= 60,
    overallConnection,
  }

  const stats = {
    totalFiles: files.length,
    totalArcs: arcs.length,
    avgBridgeStrength,
    avgSpectrumBreadth,
    avgTransitionGrace,
    avgAtmosphericClarity,
    avgVisionQuality,
    avgLuminance,
    divineRainbowCount: spans.filter((sp) => sp.condition === 'divine-rainbow').length,
    vibrantArcCount: spans.filter((sp) => sp.condition === 'vibrant-arc').length,
    paintedBridgeCount: spans.filter((sp) => sp.condition === 'painted-bridge').length,
    fadedArchCount: spans.filter((sp) => sp.condition === 'faded-arch').length,
    mistyOutlineCount: spans.filter((sp) => sp.condition === 'misty-outline').length,
    noBridgeCount: spans.filter((sp) => sp.condition === 'no-bridge').length,
    hasHighStrengthCount: spans.filter((sp) => sp.bridge.hasHighStrength).length,
    hasHighBreadthCount: spans.filter((sp) => sp.spectrum.hasHighBreadth).length,
    hasHighGraceCount: spans.filter((sp) => sp.transition.hasHighGrace).length,
    hasHighClarityCount: spans.filter((sp) => sp.atmosphere.hasHighClarity).length,
    hasHighQualityCount: spans.filter((sp) => sp.vision.hasHighQuality).length,
    hasHighLuminanceCount: spans.filter((sp) => sp.luminanceMeasure.hasHighLuminance).length,
    overallConnection,
    architectGrade: classifyArchitectGrade(overallConnection),
    bestSpan: '',
    strongest: '',
    mostDiverse: '',
    mostGraceful: '',
    clearest: '',
    brightest: '',
  }

  if (spans.length > 0) {
    stats.bestSpan = spans.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.strongest = spans.reduce((a, b) => a.bridgeStrength >= b.bridgeStrength ? a : b).file
    stats.mostDiverse = spans.reduce((a, b) => a.spectrumBreadth >= b.spectrumBreadth ? a : b).file
    stats.mostGraceful = spans.reduce((a, b) => a.transitionGrace >= b.transitionGrace ? a : b).file
    stats.clearest = spans.reduce((a, b) => a.atmosphericClarity >= b.atmosphericClarity ? a : b).file
    stats.brightest = spans.reduce((a, b) => a.luminance >= b.luminance ? a : b).file
  }

  const recommendations = generateRecommendations(spans, arcs, sky, stats)

  return { spans, arcs, sky, stats, recommendations }
}
