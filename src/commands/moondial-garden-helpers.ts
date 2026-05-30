// ─── Interfaces ──────────────────────────────────────────

export interface LunarMeasure {
  reflection: number
  phase: 'full-moon' | 'gibbous' | 'half-moon' | 'crescent' | 'new-moon' | 'eclipse'
  hasHighReflection: boolean
  hasProperGlow: boolean
  hasNoShadow: boolean
  hasSilverLight: boolean
  hasNoDarkSide: boolean
  hasReflective: boolean
  hasNoEclipse: boolean
  hasProperPhase: boolean
  hasConsistent: boolean
  hasNoWaning: boolean
  shadowCount: number
  eclipseCount: number
}

export interface CircadianMeasure {
  rhythm: number
  cycle: 'circadian-perfect' | 'diurnal' | 'crepuscular' | 'nocturnal' | 'arrhythmic' | 'chaotic'
  hasHighRhythm: boolean
  hasProperCycle: boolean
  hasRhythmic: boolean
  hasNoJetlag: boolean
  hasConsistent: boolean
  hasNoInsomnia: boolean
  hasProperPulse: boolean
  hasNoArrhythmia: boolean
  hasBiological: boolean
  hasNoExhaustion: boolean
  jetlagCount: number
  arrhythmiaCount: number
}

export interface NocturnalMeasure {
  wisdom: number
  sight: 'owl-vision' | 'night-eyes' | 'low-light' | 'dim-sight' | 'near-blind' | 'blind'
  hasHighWisdom: boolean
  hasDarkAdaptation: boolean
  hasProperNightVision: boolean
  hasNoBlindSpots: boolean
  hasAcuteHearing: boolean
  hasNoDeafness: boolean
  hasSilentFlight: boolean
  hasNoCrashLanding: boolean
  hasPredatorAwareness: boolean
  hasNoVulnerability: boolean
  blindSpotCount: number
  crashLandingCount: number
}

export interface GardenMeasure {
  cultivation: number
  health: 'flourishing' | 'blooming' | 'growing' | 'dormant' | 'wilting' | 'dead'
  hasHighCultivation: boolean
  hasProperPruning: boolean
  hasRichSoil: boolean
  hasNoWeeds: boolean
  hasProperWatering: boolean
  hasNoOvergrowth: boolean
  hasSeasonalAwareness: boolean
  hasNoPests: boolean
  hasCompanion: boolean
  hasNoRootRot: boolean
  weedCount: number
  pestCount: number
}

export interface ClarityMeasure {
  level: number
  light: 'moonlit-path' | 'starlight' | 'twilight' | 'deep-dusk' | 'pitch-dark' | 'void'
  hasHighLevel: boolean
  hasClearPath: boolean
  hasNoObfuscation: boolean
  hasProperIllumination: boolean
  hasNoDarkAlleys: boolean
  hasVisible: boolean
  hasNoShadowCode: boolean
  hasLanterns: boolean
  hasNoDeadEnds: boolean
  hasNavigable: boolean
  obfuscationCount: number
  darkAlleyCount: number
}

export interface StarlightMeasure {
  guidance: number
  quality: 'pole-star' | 'constellation' | 'star-chart' | 'random-stars' | 'cloud-cover' | 'void'
  hasHighGuidance: boolean
  hasNorthStar: boolean
  hasConstellations: boolean
  hasProperMapping: boolean
  hasNoLostNavigation: boolean
  hasStarmap: boolean
  hasNoCloudCover: boolean
  hasWaypoints: boolean
  hasNoWandering: boolean
  hasClearDirection: boolean
  lostCount: number
  wanderingCount: number
}

export interface MoonlitPlant {
  file: string
  lunarReflection: number
  circadianRhythm: number
  nocturnalWisdom: number
  gardenCultivation: number
  moonlitClarity: number
  starlightGuidance: number
  lunar: LunarMeasure
  circadian: CircadianMeasure
  nocturnal: NocturnalMeasure
  garden: GardenMeasure
  clarity: ClarityMeasure
  starlight: StarlightMeasure
  condition: 'moonlit-paradise' | 'silver-garden' | 'moonlit-path' | 'dark-garden' | 'shadow-patch' | 'barren-ground'
  qualityScore: number
}

export interface GardenPlot {
  directory: string
  plants: MoonlitPlant[]
  avgLunar: number
  avgCircadian: number
  avgStarlight: number
  paradiseCount: number
  barrenCount: number
  moonlitCount: number
  wiseCount: number
  plotType: 'formal-garden' | 'moonlight-garden' | 'wild-garden' | 'neglected-plot' | 'wasteland' | 'void'
  condition: 'ethereal-paradise' | 'silver-oasis' | 'moonlit-retreat' | 'dim-garden' | 'dark-corner' | 'barren'
}

export interface MoondialGardenResult {
  plants: MoonlitPlant[]
  plots: GardenPlot[]
  estate: {
    avgLunar: number
    avgCircadian: number
    avgStarlight: number
    isLuminous: boolean
    overallLuminance: number
  }
  stats: {
    totalFiles: number
    totalPlots: number
    avgLunarReflection: number
    avgCircadianRhythm: number
    avgNocturnalWisdom: number
    avgGardenCultivation: number
    avgMoonlitClarity: number
    avgStarlightGuidance: number
    moonlitParadiseCount: number
    silverGardenCount: number
    moonlitPathCount: number
    darkGardenCount: number
    shadowPatchCount: number
    barrenGroundCount: number
    hasHighReflectionCount: number
    hasHighRhythmCount: number
    hasHighWisdomCount: number
    hasHighCultivationCount: number
    hasHighLevelCount: number
    hasHighGuidanceCount: number
    overallLuminance: number
    gardenerGrade: 'lunar-master' | 'night-gardener' | 'moon-gazer' | 'stargazer' | 'wanderer' | 'sleepwalker'
    bestPlant: string
    bestDocumented: string
    mostRhythmic: string
    wisest: string
    bestCultivated: string
    clearest: string
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

// ─── measureLunar ───────────────────────────────────────────

/** @example measureLunar(content) returns LunarMeasure */
export function measureLunar(content: string): LunarMeasure {
  let score = 0

  const hasProperGlow = (content.match(DOC_COMMENT_RE) || []).length > 0
  const shadowCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoShadow = shadowCount === 0
  const hasSilverLight = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoDarkSide = !NESTED_TERNARY_RE.test(content)
  const hasReflective = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const eclipseCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoEclipse = eclipseCount === 0
  const hasProperPhase = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const hasConsistent = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoWaning = (content.match(FIXME_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperGlow) score += 12
  if (hasNoShadow) score += 12
  if (hasSilverLight) score += 10
  if (hasNoDarkSide) score += 10
  if (hasReflective) score += 10
  if (hasNoEclipse) score += 10
  if (hasProperPhase) score += 10
  if (hasConsistent) score += 11
  if (hasNoWaning) score += 10

  const reflection = Math.min(100, Math.max(0, score))
  const hasHighReflection = reflection >= 70

  let phase: LunarMeasure['phase'] = 'eclipse'
  if (hasHighReflection && hasNoShadow && hasProperGlow && hasSilverLight) phase = 'full-moon'
  else if (hasHighReflection && hasNoShadow) phase = 'gibbous'
  else if (hasHighReflection) phase = 'half-moon'
  else if (hasSilverLight && hasReflective) phase = 'crescent'
  else if (reflection > 30) phase = 'new-moon'

  return {
    reflection, phase, hasHighReflection, hasProperGlow, hasNoShadow,
    hasSilverLight, hasNoDarkSide, hasReflective, hasNoEclipse,
    hasProperPhase, hasConsistent, hasNoWaning, shadowCount, eclipseCount,
  }
}

// ─── measureCircadian ───────────────────────────────────────

/** @example measureCircadian(content) returns CircadianMeasure */
export function measureCircadian(content: string): CircadianMeasure {
  let score = 0

  const hasProperCycle = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasRhythmic = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const jetlagCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoJetlag = jetlagCount === 0
  const hasConsistent = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoInsomnia = !NESTED_TERNARY_RE.test(content)
  const hasProperPulse = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const arrhythmiaCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoArrhythmia = arrhythmiaCount === 0
  const hasBiological = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const hasNoExhaustion = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperCycle) score += 12
  if (hasRhythmic) score += 10
  if (hasNoJetlag) score += 12
  if (hasConsistent) score += 10
  if (hasNoInsomnia) score += 10
  if (hasProperPulse) score += 10
  if (hasNoArrhythmia) score += 10
  if (hasBiological) score += 11
  if (hasNoExhaustion) score += 10

  const rhythm = Math.min(100, Math.max(0, score))
  const hasHighRhythm = rhythm >= 70

  let cycle: CircadianMeasure['cycle'] = 'chaotic'
  if (hasHighRhythm && hasNoJetlag && hasProperCycle && hasRhythmic) cycle = 'circadian-perfect'
  else if (hasHighRhythm && hasNoJetlag) cycle = 'diurnal'
  else if (hasHighRhythm) cycle = 'crepuscular'
  else if (hasConsistent && hasProperCycle) cycle = 'nocturnal'
  else if (rhythm > 30) cycle = 'arrhythmic'

  return {
    rhythm, cycle, hasHighRhythm, hasProperCycle, hasRhythmic,
    hasNoJetlag, hasConsistent, hasNoInsomnia, hasProperPulse,
    hasNoArrhythmia, hasBiological, hasNoExhaustion, jetlagCount, arrhythmiaCount,
  }
}

// ─── measureNocturnal ───────────────────────────────────────

/** @example measureNocturnal(content) returns NocturnalMeasure */
export function measureNocturnal(content: string): NocturnalMeasure {
  let score = 0

  const hasDarkAdaptation = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasProperNightVision = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const blindSpotCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoBlindSpots = blindSpotCount === 0
  const hasAcuteHearing = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoDeafness = (content.match(FIXME_RE) || []).length === 0
  const hasSilentFlight = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const crashLandingCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoCrashLanding = crashLandingCount === 0
  const hasPredatorAwareness = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasNoVulnerability = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasDarkAdaptation) score += 12
  if (hasProperNightVision) score += 10
  if (hasNoBlindSpots) score += 12
  if (hasAcuteHearing) score += 10
  if (hasNoDeafness) score += 10
  if (hasSilentFlight) score += 10
  if (hasNoCrashLanding) score += 10
  if (hasPredatorAwareness) score += 11
  if (hasNoVulnerability) score += 10

  const wisdom = Math.min(100, Math.max(0, score))
  const hasHighWisdom = wisdom >= 70

  let sight: NocturnalMeasure['sight'] = 'blind'
  if (hasHighWisdom && hasNoBlindSpots && hasDarkAdaptation && hasAcuteHearing) sight = 'owl-vision'
  else if (hasHighWisdom && hasNoBlindSpots) sight = 'night-eyes'
  else if (hasHighWisdom) sight = 'low-light'
  else if (hasProperNightVision && hasPredatorAwareness) sight = 'dim-sight'
  else if (wisdom > 30) sight = 'near-blind'

  return {
    wisdom, sight, hasHighWisdom, hasDarkAdaptation, hasProperNightVision,
    hasNoBlindSpots, hasAcuteHearing, hasNoDeafness, hasSilentFlight,
    hasNoCrashLanding, hasPredatorAwareness, hasNoVulnerability,
    blindSpotCount, crashLandingCount,
  }
}

// ─── measureGarden ──────────────────────────────────────────

/** @example measureGarden(content) returns GardenMeasure */
export function measureGarden(content: string): GardenMeasure {
  let score = 0

  const hasProperPruning = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const hasRichSoil = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const weedCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoWeeds = weedCount === 0
  const hasProperWatering = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoOvergrowth = !NESTED_TERNARY_RE.test(content)
  const hasSeasonalAwareness = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const pestCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoPests = pestCount === 0
  const hasCompanion = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoRootRot = (content.match(TODO_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperPruning) score += 12
  if (hasRichSoil) score += 12
  if (hasNoWeeds) score += 10
  if (hasProperWatering) score += 10
  if (hasNoOvergrowth) score += 10
  if (hasSeasonalAwareness) score += 10
  if (hasNoPests) score += 10
  if (hasCompanion) score += 11
  if (hasNoRootRot) score += 10

  const cultivation = Math.min(100, Math.max(0, score))
  const hasHighCultivation = cultivation >= 70

  let health: GardenMeasure['health'] = 'dead'
  if (hasHighCultivation && hasNoWeeds && hasProperPruning && hasCompanion) health = 'flourishing'
  else if (hasHighCultivation && hasNoWeeds) health = 'blooming'
  else if (hasHighCultivation) health = 'growing'
  else if (hasProperPruning && hasRichSoil) health = 'dormant'
  else if (cultivation > 30) health = 'wilting'

  return {
    cultivation, health, hasHighCultivation, hasProperPruning, hasRichSoil,
    hasNoWeeds, hasProperWatering, hasNoOvergrowth, hasSeasonalAwareness,
    hasNoPests, hasCompanion, hasNoRootRot, weedCount, pestCount,
  }
}

// ─── measureClarity ─────────────────────────────────────────

/** @example measureClarity(content) returns ClarityMeasure */
export function measureClarity(content: string): ClarityMeasure {
  let score = 0

  const hasClearPath = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const obfuscationCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoObfuscation = obfuscationCount === 0
  const hasProperIllumination = (content.match(DOC_COMMENT_RE) || []).length > 0
  const darkAlleyCount = (content.match(CONSOLE_RE) || []).length
  const hasNoDarkAlleys = darkAlleyCount === 0
  const hasVisible = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoShadowCode = !NESTED_TERNARY_RE.test(content)
  const hasLanterns = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoDeadEnds = (content.match(TODO_RE) || []).length === 0
  const hasNavigable = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)

  if (content.length > 0) score += 5
  if (hasClearPath) score += 10
  if (hasNoObfuscation) score += 12
  if (hasProperIllumination) score += 12
  if (hasNoDarkAlleys) score += 12
  if (hasVisible) score += 10
  if (hasNoShadowCode) score += 10
  if (hasLanterns) score += 10
  if (hasNoDeadEnds) score += 7
  if (hasNavigable) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let light: ClarityMeasure['light'] = 'void'
  if (hasHighLevel && hasNoObfuscation && hasNoDarkAlleys && hasProperIllumination) light = 'moonlit-path'
  else if (hasHighLevel && hasNoObfuscation) light = 'starlight'
  else if (hasHighLevel) light = 'twilight'
  else if (hasVisible && hasClearPath) light = 'deep-dusk'
  else if (level > 30) light = 'pitch-dark'

  return {
    level, light, hasHighLevel, hasClearPath, hasNoObfuscation,
    hasProperIllumination, hasNoDarkAlleys, hasVisible, hasNoShadowCode,
    hasLanterns, hasNoDeadEnds, hasNavigable, obfuscationCount, darkAlleyCount,
  }
}

// ─── measureStarlight ───────────────────────────────────────

/** @example measureStarlight(content) returns StarlightMeasure */
export function measureStarlight(content: string): StarlightMeasure {
  let score = 0

  const hasNorthStar = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasConstellations = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasProperMapping = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const lostCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoLostNavigation = lostCount === 0
  const hasStarmap = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoCloudCover = (content.match(HACK_RE) || []).length === 0
  const hasWaypoints = TRY_RE.test(content) && CATCH_RE.test(content)
  const wanderingCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoWandering = wanderingCount === 0
  const hasClearDirection = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasNorthStar) score += 12
  if (hasConstellations) score += 10
  if (hasProperMapping) score += 12
  if (hasNoLostNavigation) score += 10
  if (hasStarmap) score += 10
  if (hasNoCloudCover) score += 10
  if (hasWaypoints) score += 10
  if (hasNoWandering) score += 11
  if (hasClearDirection) score += 10

  const guidance = Math.min(100, Math.max(0, score))
  const hasHighGuidance = guidance >= 70

  let quality: StarlightMeasure['quality'] = 'void'
  if (hasHighGuidance && hasNoLostNavigation && hasNorthStar && hasStarmap) quality = 'pole-star'
  else if (hasHighGuidance && hasNoLostNavigation) quality = 'constellation'
  else if (hasHighGuidance) quality = 'star-chart'
  else if (hasConstellations && hasWaypoints) quality = 'random-stars'
  else if (guidance > 30) quality = 'cloud-cover'

  return {
    guidance, quality, hasHighGuidance, hasNorthStar, hasConstellations,
    hasProperMapping, hasNoLostNavigation, hasStarmap, hasNoCloudCover,
    hasWaypoints, hasNoWandering, hasClearDirection, lostCount, wanderingCount,
  }
}

// ─── classifyCondition ──────────────────────────────────────

/** @example classifyCondition(plant) returns condition */
export function classifyCondition(plant: MoonlitPlant): MoonlitPlant['condition'] {
  const { qualityScore } = plant
  if (qualityScore >= 80) return 'moonlit-paradise'
  if (qualityScore >= 65) return 'silver-garden'
  if (qualityScore >= 50) return 'moonlit-path'
  if (qualityScore >= 35) return 'dark-garden'
  if (qualityScore >= 20) return 'shadow-patch'
  return 'barren-ground'
}

// ─── analyzeMoonlitPlant ────────────────────────────────────

/** @example analyzeMoonlitPlant(content, filePath) returns full plant */
export function analyzeMoonlitPlant(content: string, filePath: string): MoonlitPlant {
  const lunar = measureLunar(content)
  const circadian = measureCircadian(content)
  const nocturnal = measureNocturnal(content)
  const garden = measureGarden(content)
  const clarity = measureClarity(content)
  const starlight = measureStarlight(content)

  const lunarReflection = lunar.reflection
  const circadianRhythm = circadian.rhythm
  const nocturnalWisdom = nocturnal.wisdom
  const gardenCultivation = garden.cultivation
  const moonlitClarity = clarity.level
  const starlightGuidance = starlight.guidance

  const qualityScore = Math.round(
    lunarReflection * 0.15 +
    circadianRhythm * 0.15 +
    nocturnalWisdom * 0.2 +
    gardenCultivation * 0.15 +
    moonlitClarity * 0.2 +
    starlightGuidance * 0.15,
  )

  const result: MoonlitPlant = {
    file: filePath,
    lunarReflection, circadianRhythm, nocturnalWisdom,
    gardenCultivation, moonlitClarity, starlightGuidance,
    lunar, circadian, nocturnal, garden, clarity, starlight,
    qualityScore,
    condition: 'barren-ground',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── analyzeGardenPlot ──────────────────────────────────────

/** @example analyzeGardenPlot(plants, dirPath) returns GardenPlot */
export function analyzeGardenPlot(plants: MoonlitPlant[], dirPath: string): GardenPlot {
  if (plants.length === 0) {
    return {
      directory: dirPath, plants: [], avgLunar: 0, avgCircadian: 0,
      avgStarlight: 0, paradiseCount: 0, barrenCount: 0,
      moonlitCount: 0, wiseCount: 0,
      plotType: 'void', condition: 'barren',
    }
  }

  const avgLunar = Math.round(plants.reduce((s, p) => s + p.lunarReflection, 0) / plants.length)
  const avgCircadian = Math.round(plants.reduce((s, p) => s + p.circadianRhythm, 0) / plants.length)
  const avgStarlight = Math.round(plants.reduce((s, p) => s + p.starlightGuidance, 0) / plants.length)
  const paradiseCount = plants.filter((p) => p.condition === 'moonlit-paradise').length
  const barrenCount = plants.filter((p) => p.condition === 'barren-ground').length
  const moonlitCount = plants.filter((p) => p.lunar.hasHighReflection).length
  const wiseCount = plants.filter((p) => p.nocturnal.hasHighWisdom).length

  const plotType = classifyPlotType(plants)
  const avgScore = plants.reduce((s, p) => s + p.qualityScore, 0) / plants.length
  let condition: GardenPlot['condition'] = 'barren'
  if (avgScore >= 75) condition = 'ethereal-paradise'
  else if (avgScore >= 60) condition = 'silver-oasis'
  else if (avgScore >= 45) condition = 'moonlit-retreat'
  else if (avgScore >= 30) condition = 'dim-garden'
  else if (avgScore >= 15) condition = 'dark-corner'

  return {
    directory: dirPath, plants, avgLunar, avgCircadian, avgStarlight,
    paradiseCount, barrenCount, moonlitCount, wiseCount,
    plotType, condition,
  }
}

// ─── classifyPlotType ───────────────────────────────────────

/** @example classifyPlotType(plants) returns plot type */
export function classifyPlotType(plants: MoonlitPlant[]): GardenPlot['plotType'] {
  if (plants.length === 0) return 'void'
  const avgScore = plants.reduce((s, p) => s + p.qualityScore, 0) / plants.length
  const paradiseCnt = plants.filter((p) => p.condition === 'moonlit-paradise').length
  if (avgScore >= 75 && paradiseCnt >= Math.ceil(plants.length * 0.3)) return 'formal-garden'
  if (avgScore >= 60) return 'moonlight-garden'
  if (avgScore >= 45) return 'wild-garden'
  if (avgScore >= 30) return 'neglected-plot'
  if (avgScore >= 15) return 'wasteland'
  return 'void'
}

// ─── classifyGardenerGrade ──────────────────────────────────

/** @example classifyGardenerGrade(avgLuminance) returns grade */
export function classifyGardenerGrade(avgLuminance: number): MoondialGardenResult['stats']['gardenerGrade'] {
  if (avgLuminance >= 80) return 'lunar-master'
  if (avgLuminance >= 65) return 'night-gardener'
  if (avgLuminance >= 50) return 'moon-gazer'
  if (avgLuminance >= 35) return 'stargazer'
  if (avgLuminance >= 20) return 'wanderer'
  return 'sleepwalker'
}

// ─── generateRecommendations ────────────────────────────────

/** @example generateRecommendations(plants, plots, estate, stats) returns string[] */
export function generateRecommendations(
  plants: MoonlitPlant[],
  plots: GardenPlot[],
  estate: MoondialGardenResult['estate'],
  stats: MoondialGardenResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgLunarReflection < 50) recs.push('Increase lunar reflection — add documentation to illuminate your code')
  if (stats.avgCircadianRhythm < 50) recs.push('Improve circadian rhythm — add proper async/await cycles for code timing')
  if (stats.avgNocturnalWisdom < 50) recs.push('Enhance nocturnal wisdom — add error handling for dark code paths')
  if (stats.avgGardenCultivation < 50) recs.push('Cultivate your garden — add interfaces and types for rich code soil')
  if (stats.avgMoonlitClarity < 50) recs.push('Improve moonlit clarity — remove console statements and any types')
  if (stats.avgStarlightGuidance < 50) recs.push('Guide by starlight — add proper imports and exports for code navigation')
  if (stats.barrenGroundCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of plants are barren ground — consider major refactoring')
  if (stats.shadowPatchCount > 0) recs.push('Warning: shadow patches detected — these files need illumination')
  if (estate.overallLuminance < 40) recs.push('Overall luminance is critically low — establish a moonlit recovery plan')
  if (plots.length > 0 && plots.every((p) => p.condition === 'barren')) recs.push('All plots are barren — your codebase needs fundamental garden revival')

  if (plants.length > 0) {
    const shadowed = plants.filter((p) => p.lunar.shadowCount > 2)
    if (shadowed.length > plants.length * 0.5) recs.push('Over 50% of plants have heavy shadows — reduce any/eval usage')
  }

  return recs
}

// ─── buildMoondialGardenResult ──────────────────────────────

/** @example buildMoondialGardenResult(files, contents) returns full result */
export function buildMoondialGardenResult(files: string[], contents: string[]): MoondialGardenResult {
  const plants = files.map((file, i) => analyzeMoonlitPlant(contents[i] ?? '', file))

  const plotMap = new Map<string, MoonlitPlant[]>()
  plants.forEach((plant) => {
    const parts = plant.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = plotMap.get(dir)
    if (existing) existing.push(plant)
    else plotMap.set(dir, [plant])
  })

  const plots = Array.from(plotMap.entries()).map(([dir, ps]) => analyzeGardenPlot(ps, dir))

  const avgLunarReflection = plants.length > 0 ? Math.round(plants.reduce((s, p) => s + p.lunarReflection, 0) / plants.length) : 0
  const avgCircadianRhythm = plants.length > 0 ? Math.round(plants.reduce((s, p) => s + p.circadianRhythm, 0) / plants.length) : 0
  const avgNocturnalWisdom = plants.length > 0 ? Math.round(plants.reduce((s, p) => s + p.nocturnalWisdom, 0) / plants.length) : 0
  const avgGardenCultivation = plants.length > 0 ? Math.round(plants.reduce((s, p) => s + p.gardenCultivation, 0) / plants.length) : 0
  const avgMoonlitClarity = plants.length > 0 ? Math.round(plants.reduce((s, p) => s + p.moonlitClarity, 0) / plants.length) : 0
  const avgStarlightGuidance = plants.length > 0 ? Math.round(plants.reduce((s, p) => s + p.starlightGuidance, 0) / plants.length) : 0

  const overallLuminance = Math.round(
    avgLunarReflection * 0.15 +
    avgCircadianRhythm * 0.15 +
    avgNocturnalWisdom * 0.2 +
    avgGardenCultivation * 0.15 +
    avgMoonlitClarity * 0.2 +
    avgStarlightGuidance * 0.15,
  )

  const estate = {
    avgLunar: avgLunarReflection,
    avgCircadian: avgCircadianRhythm,
    avgStarlight: avgStarlightGuidance,
    isLuminous: overallLuminance >= 60,
    overallLuminance,
  }

  const stats = {
    totalFiles: files.length,
    totalPlots: plots.length,
    avgLunarReflection,
    avgCircadianRhythm,
    avgNocturnalWisdom,
    avgGardenCultivation,
    avgMoonlitClarity,
    avgStarlightGuidance,
    moonlitParadiseCount: plants.filter((p) => p.condition === 'moonlit-paradise').length,
    silverGardenCount: plants.filter((p) => p.condition === 'silver-garden').length,
    moonlitPathCount: plants.filter((p) => p.condition === 'moonlit-path').length,
    darkGardenCount: plants.filter((p) => p.condition === 'dark-garden').length,
    shadowPatchCount: plants.filter((p) => p.condition === 'shadow-patch').length,
    barrenGroundCount: plants.filter((p) => p.condition === 'barren-ground').length,
    hasHighReflectionCount: plants.filter((p) => p.lunar.hasHighReflection).length,
    hasHighRhythmCount: plants.filter((p) => p.circadian.hasHighRhythm).length,
    hasHighWisdomCount: plants.filter((p) => p.nocturnal.hasHighWisdom).length,
    hasHighCultivationCount: plants.filter((p) => p.garden.hasHighCultivation).length,
    hasHighLevelCount: plants.filter((p) => p.clarity.hasHighLevel).length,
    hasHighGuidanceCount: plants.filter((p) => p.starlight.hasHighGuidance).length,
    overallLuminance,
    gardenerGrade: classifyGardenerGrade(overallLuminance),
    bestPlant: '',
    bestDocumented: '',
    mostRhythmic: '',
    wisest: '',
    bestCultivated: '',
    clearest: '',
  }

  if (plants.length > 0) {
    stats.bestPlant = plants.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.bestDocumented = plants.reduce((a, b) => a.lunarReflection >= b.lunarReflection ? a : b).file
    stats.mostRhythmic = plants.reduce((a, b) => a.circadianRhythm >= b.circadianRhythm ? a : b).file
    stats.wisest = plants.reduce((a, b) => a.nocturnalWisdom >= b.nocturnalWisdom ? a : b).file
    stats.bestCultivated = plants.reduce((a, b) => a.gardenCultivation >= b.gardenCultivation ? a : b).file
    stats.clearest = plants.reduce((a, b) => a.moonlitClarity >= b.moonlitClarity ? a : b).file
  }

  const recommendations = generateRecommendations(plants, plots, estate, stats)

  return { plants, plots, estate, stats, recommendations }
}
