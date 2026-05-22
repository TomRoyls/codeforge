// ─── Interfaces ──────────────────────────────────────────

export interface EnergyMeasure {
  level: number
  intensity: 'solar-flare' | 'geomagnetic-storm' | 'aurora-maximum' | 'substorm' | 'quiet' | 'dormant'
  hasHighLevel: boolean
  hasChargedParticles: boolean
  hasProperFlux: boolean
  hasNoDischarge: boolean
  hasHighActivity: boolean
  hasNoBrownout: boolean
  hasSustained: boolean
  hasNoOutage: boolean
  hasPulsating: boolean
  hasNoDepletion: boolean
  dischargeCount: number
  brownoutCount: number
}

export interface AlignmentMeasure {
  level: number
  field: 'perfect-dipole' | 'strong-alignment' | 'magnetic-field' | 'weak-field' | 'distorted' | 'collapsed'
  hasHighLevel: boolean
  hasProperPoles: boolean
  hasFieldLines: boolean
  hasNoReversal: boolean
  hasStableField: boolean
  hasNoFluctuation: boolean
  hasProperOrbit: boolean
  hasNoDrift: boolean
  hasCoherent: boolean
  hasNoChaos: boolean
  reversalCount: number
  driftCount: number
}

export interface SpectralMeasure {
  beauty: number
  palette: 'full-spectrum' | 'green-curtain' | 'violet-waves' | 'faint-glow' | 'monochrome' | 'invisible'
  hasHighBeauty: boolean
  hasGreenEmission: boolean
  hasRedEmission: boolean
  hasVioletEmission: boolean
  hasNoColorBlindness: boolean
  hasProperWavelength: boolean
  hasNoDistortion: boolean
  hasVibrant: boolean
  hasNoFading: boolean
  hasDancing: boolean
  colorBlindnessCount: number
  fadingCount: number
}

export interface IonizationMeasure {
  quality: number
  process: 'fusion-reactor' | 'high-ionization' | 'partial-ionization' | 'excited-state' | 'ground-state' | 'frozen'
  hasHighQuality: boolean
  hasProperExcitation: boolean
  hasNoIonLoss: boolean
  hasEnergyTransfer: boolean
  hasNoDegradation: boolean
  hasPhotonEmission: boolean
  hasNoAbsorption: boolean
  hasProperCascade: boolean
  hasNoQuenching: boolean
  hasTransformative: boolean
  ionLossCount: number
  quenchingCount: number
}

export interface AtmosphericMeasure {
  clarity: number
  condition: 'crystal-clear' | 'arctic-clear' | 'high-altitude' | 'partly-cloudy' | 'overcast' | 'opaque'
  hasHighClarity: boolean
  hasTransparent: boolean
  hasNoInterference: boolean
  hasProperContrast: boolean
  hasNoLightPollution: boolean
  hasVisible: boolean
  hasNoObfuscation: boolean
  hasDarkSky: boolean
  hasNoSmog: boolean
  hasBreathtaking: boolean
  interferenceCount: number
  lightPollutionCount: number
}

export interface ElectromagneticMeasure {
  force: number
  power: 'mega-flare' | 'strong-force' | 'moderate-field' | 'weak-field' | 'residual' | 'void'
  hasHighForce: boolean
  hasProperInduction: boolean
  hasNoInterference: boolean
  hasStrongSignal: boolean
  hasNoNoise: boolean
  hasProperConductance: boolean
  hasNoResistance: boolean
  hasAmplification: boolean
  hasNoAttenuation: boolean
  hasResonance: boolean
  interferenceCount: number
  attenuationCount: number
}

export interface AuroraFlare {
  file: string
  polarEnergy: number
  magneticAlignment: number
  spectralBeauty: number
  ionizationQuality: number
  atmosphericClarity: number
  electromagneticForce: number
  energy: EnergyMeasure
  alignment: AlignmentMeasure
  spectral: SpectralMeasure
  ionization: IonizationMeasure
  atmospheric: AtmosphericMeasure
  electromagnetic: ElectromagneticMeasure
  condition: 'magnificent-display' | 'brilliant-aurora' | 'visible-shimmer' | 'faint-glow' | 'subvisual' | 'darkness'
  qualityScore: number
}

export interface PolarRegion {
  directory: string
  flares: AuroraFlare[]
  avgEnergy: number
  avgAlignment: number
  avgElectromagnetic: number
  magnificentCount: number
  darknessCount: number
  highEnergyCount: number
  alignedCount: number
  regionType: 'aurora-oval' | 'polar-cap' | 'sub-auroral' | 'mid-latitude' | 'equatorial' | 'void'
  condition: 'spectacular-display' | 'active-aurora' | 'quiet-aurora' | 'faint-glimmer' | 'dark-sky' | 'void'
}

export interface AuroraBorealisResult {
  flares: AuroraFlare[]
  regions: PolarRegion[]
  magnetosphere: {
    avgEnergy: number
    avgAlignment: number
    avgElectromagnetic: number
    isBrilliant: boolean
    overallBrilliance: number
  }
  stats: {
    totalFiles: number
    totalRegions: number
    avgPolarEnergy: number
    avgMagneticAlignment: number
    avgSpectralBeauty: number
    avgIonizationQuality: number
    avgAtmosphericClarity: number
    avgElectromagneticForce: number
    magnificentDisplayCount: number
    brilliantAuroraCount: number
    visibleShimmerCount: number
    faintGlowCount: number
    subvisualCount: number
    darknessCount: number
    hasHighEnergyCount: number
    hasHighAlignmentCount: number
    hasHighBeautyCount: number
    hasHighQualityCount: number
    hasHighClarityCount: number
    hasHighForceCount: number
    overallBrilliance: number
    observerGrade: 'aurora-master' | 'polar-observer' | 'aurora-hunter' | 'sky-watcher' | 'novice' | 'indoor'
    bestFlare: string
    mostEnergetic: string
    mostAligned: string
    mostBeautiful: string
    mostTransformative: string
    strongestForce: string
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

// ─── measureEnergy ──────────────────────────────────────────

/** @example measureEnergy(content) returns EnergyMeasure */
export function measureEnergy(content: string): EnergyMeasure {
  let score = 0

  const hasChargedParticles = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const dischargeCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDischarge = dischargeCount === 0
  const hasProperFlux = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const brownoutCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoBrownout = brownoutCount === 0
  const hasHighActivity = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasSustained = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoOutage = !NESTED_TERNARY_RE.test(content)
  const hasPulsating = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const hasNoDepletion = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasChargedParticles) score += 12
  if (hasNoDischarge) score += 12
  if (hasProperFlux) score += 10
  if (hasNoBrownout) score += 10
  if (hasHighActivity) score += 10
  if (hasSustained) score += 10
  if (hasNoOutage) score += 10
  if (hasPulsating) score += 11
  if (hasNoDepletion) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let intensity: EnergyMeasure['intensity'] = 'dormant'
  if (hasHighLevel && hasNoDischarge && hasChargedParticles && hasSustained) intensity = 'solar-flare'
  else if (hasHighLevel && hasNoDischarge) intensity = 'geomagnetic-storm'
  else if (hasHighLevel) intensity = 'aurora-maximum'
  else if (hasChargedParticles && hasHighActivity) intensity = 'substorm'
  else if (level > 30) intensity = 'quiet'

  return {
    level, intensity, hasHighLevel, hasChargedParticles, hasProperFlux,
    hasNoDischarge, hasHighActivity, hasNoBrownout, hasSustained,
    hasNoOutage, hasPulsating, hasNoDepletion, dischargeCount, brownoutCount,
  }
}

// ─── measureAlignment ───────────────────────────────────────

/** @example measureAlignment(content) returns AlignmentMeasure */
export function measureAlignment(content: string): AlignmentMeasure {
  let score = 0

  const hasProperPoles = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasFieldLines = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const reversalCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoReversal = reversalCount === 0
  const hasStableField = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoFluctuation = !NESTED_TERNARY_RE.test(content)
  const hasProperOrbit = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const driftCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoDrift = driftCount === 0
  const hasCoherent = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoChaos = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperPoles) score += 12
  if (hasFieldLines) score += 12
  if (hasNoReversal) score += 10
  if (hasStableField) score += 10
  if (hasNoFluctuation) score += 10
  if (hasProperOrbit) score += 10
  if (hasNoDrift) score += 10
  if (hasCoherent) score += 11
  if (hasNoChaos) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let field: AlignmentMeasure['field'] = 'collapsed'
  if (hasHighLevel && hasNoReversal && hasProperPoles && hasStableField) field = 'perfect-dipole'
  else if (hasHighLevel && hasNoReversal) field = 'strong-alignment'
  else if (hasHighLevel) field = 'magnetic-field'
  else if (hasProperPoles && hasProperOrbit) field = 'weak-field'
  else if (level > 30) field = 'distorted'

  return {
    level, field, hasHighLevel, hasProperPoles, hasFieldLines,
    hasNoReversal, hasStableField, hasNoFluctuation, hasProperOrbit,
    hasNoDrift, hasCoherent, hasNoChaos, reversalCount, driftCount,
  }
}

// ─── measureSpectral ────────────────────────────────────────

/** @example measureSpectral(content) returns SpectralMeasure */
export function measureSpectral(content: string): SpectralMeasure {
  let score = 0

  const hasGreenEmission = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasRedEmission = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasVioletEmission = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const colorBlindnessCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoColorBlindness = colorBlindnessCount === 0
  const hasProperWavelength = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasNoDistortion = !NESTED_TERNARY_RE.test(content)
  const hasVibrant = (content.match(DOC_COMMENT_RE) || []).length > 0
  const fadingCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoFading = fadingCount === 0
  const hasDancing = TRY_RE.test(content) && CATCH_RE.test(content)

  if (content.length > 0) score += 5
  if (hasGreenEmission) score += 12
  if (hasRedEmission) score += 10
  if (hasVioletEmission) score += 10
  if (hasNoColorBlindness) score += 12
  if (hasProperWavelength) score += 10
  if (hasNoDistortion) score += 10
  if (hasVibrant) score += 10
  if (hasNoFading) score += 11
  if (hasDancing) score += 10

  const beauty = Math.min(100, Math.max(0, score))
  const hasHighBeauty = beauty >= 70

  let palette: SpectralMeasure['palette'] = 'invisible'
  if (hasHighBeauty && hasNoColorBlindness && hasGreenEmission && hasVibrant) palette = 'full-spectrum'
  else if (hasHighBeauty && hasNoColorBlindness && hasGreenEmission) palette = 'green-curtain'
  else if (hasHighBeauty && hasNoColorBlindness) palette = 'violet-waves'
  else if (hasGreenEmission && hasProperWavelength) palette = 'faint-glow'
  else if (beauty > 30) palette = 'monochrome'

  return {
    beauty, palette, hasHighBeauty, hasGreenEmission, hasRedEmission,
    hasVioletEmission, hasNoColorBlindness, hasProperWavelength, hasNoDistortion,
    hasVibrant, hasNoFading, hasDancing, colorBlindnessCount, fadingCount,
  }
}

// ─── measureIonization ──────────────────────────────────────

/** @example measureIonization(content) returns IonizationMeasure */
export function measureIonization(content: string): IonizationMeasure {
  let score = 0

  const hasProperExcitation = TRY_RE.test(content) && CATCH_RE.test(content)
  const ionLossCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoIonLoss = ionLossCount === 0
  const hasEnergyTransfer = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoDegradation = !NESTED_TERNARY_RE.test(content)
  const hasPhotonEmission = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoAbsorption = (content.match(FIXME_RE) || []).length === 0
  const hasProperCascade = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const quenchingCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoQuenching = quenchingCount === 0
  const hasTransformative = ASYNC_RE.test(content) && AWAIT_RE.test(content)

  if (content.length > 0) score += 5
  if (hasProperExcitation) score += 12
  if (hasNoIonLoss) score += 12
  if (hasEnergyTransfer) score += 10
  if (hasNoDegradation) score += 10
  if (hasPhotonEmission) score += 10
  if (hasNoAbsorption) score += 11
  if (hasProperCascade) score += 10
  if (hasNoQuenching) score += 10
  if (hasTransformative) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let process: IonizationMeasure['process'] = 'frozen'
  if (hasHighQuality && hasNoIonLoss && hasProperExcitation && hasPhotonEmission) process = 'fusion-reactor'
  else if (hasHighQuality && hasNoIonLoss) process = 'high-ionization'
  else if (hasHighQuality) process = 'partial-ionization'
  else if (hasProperCascade && hasProperExcitation) process = 'excited-state'
  else if (quality > 30) process = 'ground-state'

  return {
    quality, process, hasHighQuality, hasProperExcitation, hasNoIonLoss,
    hasEnergyTransfer, hasNoDegradation, hasPhotonEmission, hasNoAbsorption,
    hasProperCascade, hasNoQuenching, hasTransformative, ionLossCount, quenchingCount,
  }
}

// ─── measureAtmospheric ─────────────────────────────────────

/** @example measureAtmospheric(content) returns AtmosphericMeasure */
export function measureAtmospheric(content: string): AtmosphericMeasure {
  let score = 0

  const hasTransparent = (content.match(DOC_COMMENT_RE) || []).length > 0
  const interferenceCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoInterference = interferenceCount === 0
  const hasProperContrast = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const lightPollutionCount = (content.match(CONSOLE_RE) || []).length
  const hasNoLightPollution = lightPollutionCount === 0
  const hasVisible = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoObfuscation = !NESTED_TERNARY_RE.test(content)
  const hasDarkSky = (content.match(HACK_RE) || []).length === 0
  const hasNoSmog = (content.match(TODO_RE) || []).length === 0
  const hasBreathtaking = (content.match(DOC_COMMENT_RE) || []).length > 0 && hasNoLightPollution

  if (content.length > 0) score += 5
  if (hasTransparent) score += 10
  if (hasNoInterference) score += 12
  if (hasProperContrast) score += 10
  if (hasNoLightPollution) score += 12
  if (hasVisible) score += 10
  if (hasNoObfuscation) score += 10
  if (hasDarkSky) score += 10
  if (hasNoSmog) score += 11
  if (hasBreathtaking) score += 10

  const clarity = Math.min(100, Math.max(0, score))
  const hasHighClarity = clarity >= 70

  let condition: AtmosphericMeasure['condition'] = 'opaque'
  if (hasHighClarity && hasNoInterference && hasNoLightPollution && hasTransparent) condition = 'crystal-clear'
  else if (hasHighClarity && hasNoInterference) condition = 'arctic-clear'
  else if (hasHighClarity) condition = 'high-altitude'
  else if (hasVisible && hasProperContrast) condition = 'partly-cloudy'
  else if (clarity > 30) condition = 'overcast'

  return {
    clarity, condition, hasHighClarity, hasTransparent, hasNoInterference,
    hasProperContrast, hasNoLightPollution, hasVisible, hasNoObfuscation,
    hasDarkSky, hasNoSmog, hasBreathtaking, interferenceCount, lightPollutionCount,
  }
}

// ─── measureElectromagnetic ─────────────────────────────────

/** @example measureElectromagnetic(content) returns ElectromagneticMeasure */
export function measureElectromagnetic(content: string): ElectromagneticMeasure {
  let score = 0

  const hasProperInduction = TRY_RE.test(content) && CATCH_RE.test(content)
  const interferenceCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoInterference = interferenceCount === 0
  const hasStrongSignal = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const hasNoNoise = (content.match(HACK_RE) || []).length === 0
  const hasProperConductance = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoResistance = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasAmplification = (content.match(DOC_COMMENT_RE) || []).length > 0
  const attenuationCount = (content.match(DEPRECATED_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoAttenuation = attenuationCount === 0
  const hasResonance = ASYNC_RE.test(content) && AWAIT_RE.test(content)

  if (content.length > 0) score += 5
  if (hasProperInduction) score += 12
  if (hasNoInterference) score += 12
  if (hasStrongSignal) score += 10
  if (hasNoNoise) score += 10
  if (hasProperConductance) score += 10
  if (hasNoResistance) score += 10
  if (hasAmplification) score += 10
  if (hasNoAttenuation) score += 11
  if (hasResonance) score += 10

  const force = Math.min(100, Math.max(0, score))
  const hasHighForce = force >= 70

  let power: ElectromagneticMeasure['power'] = 'void'
  if (hasHighForce && hasNoInterference && hasProperInduction && hasAmplification) power = 'mega-flare'
  else if (hasHighForce && hasNoInterference) power = 'strong-force'
  else if (hasHighForce) power = 'moderate-field'
  else if (hasStrongSignal && hasProperInduction) power = 'weak-field'
  else if (force > 30) power = 'residual'

  return {
    force, power, hasHighForce, hasProperInduction, hasNoInterference,
    hasStrongSignal, hasNoNoise, hasProperConductance, hasNoResistance,
    hasAmplification, hasNoAttenuation, hasResonance, interferenceCount, attenuationCount,
  }
}

// ─── classifyCondition ──────────────────────────────────────

/** @example classifyCondition(flare) returns condition */
export function classifyCondition(flare: AuroraFlare): AuroraFlare['condition'] {
  const { qualityScore } = flare
  if (qualityScore >= 80) return 'magnificent-display'
  if (qualityScore >= 65) return 'brilliant-aurora'
  if (qualityScore >= 50) return 'visible-shimmer'
  if (qualityScore >= 35) return 'faint-glow'
  if (qualityScore >= 20) return 'subvisual'
  return 'darkness'
}

// ─── analyzeAuroraFlare ─────────────────────────────────────

/** @example analyzeAuroraFlare(content, filePath) returns full flare */
export function analyzeAuroraFlare(content: string, filePath: string): AuroraFlare {
  const energy = measureEnergy(content)
  const alignment = measureAlignment(content)
  const spectral = measureSpectral(content)
  const ionization = measureIonization(content)
  const atmospheric = measureAtmospheric(content)
  const electromagnetic = measureElectromagnetic(content)

  const polarEnergy = energy.level
  const magneticAlignment = alignment.level
  const spectralBeauty = spectral.beauty
  const ionizationQuality = ionization.quality
  const atmosphericClarity = atmospheric.clarity
  const electromagneticForce = electromagnetic.force

  const qualityScore = Math.round(
    polarEnergy * 0.15 +
    magneticAlignment * 0.15 +
    spectralBeauty * 0.2 +
    ionizationQuality * 0.15 +
    atmosphericClarity * 0.2 +
    electromagneticForce * 0.15,
  )

  const result: AuroraFlare = {
    file: filePath,
    polarEnergy, magneticAlignment, spectralBeauty,
    ionizationQuality, atmosphericClarity, electromagneticForce,
    energy, alignment, spectral, ionization, atmospheric, electromagnetic,
    qualityScore,
    condition: 'darkness',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── analyzePolarRegion ─────────────────────────────────────

/** @example analyzePolarRegion(flares, dirPath) returns PolarRegion */
export function analyzePolarRegion(flares: AuroraFlare[], dirPath: string): PolarRegion {
  if (flares.length === 0) {
    return {
      directory: dirPath, flares: [], avgEnergy: 0, avgAlignment: 0,
      avgElectromagnetic: 0, magnificentCount: 0, darknessCount: 0,
      highEnergyCount: 0, alignedCount: 0,
      regionType: 'void', condition: 'void',
    }
  }

  const avgEnergy = Math.round(flares.reduce((s, f) => s + f.polarEnergy, 0) / flares.length)
  const avgAlignment = Math.round(flares.reduce((s, f) => s + f.magneticAlignment, 0) / flares.length)
  const avgElectromagnetic = Math.round(flares.reduce((s, f) => s + f.electromagneticForce, 0) / flares.length)
  const magnificentCount = flares.filter((f) => f.condition === 'magnificent-display').length
  const darknessCount = flares.filter((f) => f.condition === 'darkness').length
  const highEnergyCount = flares.filter((f) => f.energy.hasHighLevel).length
  const alignedCount = flares.filter((f) => f.alignment.hasHighLevel).length

  const regionType = classifyRegionType(flares)
  const avgScore = flares.reduce((s, f) => s + f.qualityScore, 0) / flares.length
  let condition: PolarRegion['condition'] = 'void'
  if (avgScore >= 75) condition = 'spectacular-display'
  else if (avgScore >= 60) condition = 'active-aurora'
  else if (avgScore >= 45) condition = 'quiet-aurora'
  else if (avgScore >= 30) condition = 'faint-glimmer'
  else if (avgScore >= 15) condition = 'dark-sky'

  return {
    directory: dirPath, flares, avgEnergy, avgAlignment, avgElectromagnetic,
    magnificentCount, darknessCount, highEnergyCount, alignedCount,
    regionType, condition,
  }
}

// ─── classifyRegionType ─────────────────────────────────────

/** @example classifyRegionType(flares) returns region type */
export function classifyRegionType(flares: AuroraFlare[]): PolarRegion['regionType'] {
  if (flares.length === 0) return 'void'
  const avgScore = flares.reduce((s, f) => s + f.qualityScore, 0) / flares.length
  const magnificentCnt = flares.filter((f) => f.condition === 'magnificent-display').length
  if (avgScore >= 75 && magnificentCnt >= Math.ceil(flares.length * 0.3)) return 'aurora-oval'
  if (avgScore >= 60) return 'polar-cap'
  if (avgScore >= 45) return 'sub-auroral'
  if (avgScore >= 30) return 'mid-latitude'
  if (avgScore >= 15) return 'equatorial'
  return 'void'
}

// ─── classifyObserverGrade ──────────────────────────────────

/** @example classifyObserverGrade(avgBrilliance) returns grade */
export function classifyObserverGrade(avgBrilliance: number): AuroraBorealisResult['stats']['observerGrade'] {
  if (avgBrilliance >= 80) return 'aurora-master'
  if (avgBrilliance >= 65) return 'polar-observer'
  if (avgBrilliance >= 50) return 'aurora-hunter'
  if (avgBrilliance >= 35) return 'sky-watcher'
  if (avgBrilliance >= 20) return 'novice'
  return 'indoor'
}

// ─── generateRecommendations ────────────────────────────────

/** @example generateRecommendations(flares, regions, magnetosphere, stats) returns string[] */
export function generateRecommendations(
  flares: AuroraFlare[],
  regions: PolarRegion[],
  magnetosphere: AuroraBorealisResult['magnetosphere'],
  stats: AuroraBorealisResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgPolarEnergy < 50) recs.push('Increase polar energy — add interfaces and types to energize your code')
  if (stats.avgMagneticAlignment < 50) recs.push('Improve magnetic alignment — organize code with proper import/export poles')
  if (stats.avgSpectralBeauty < 50) recs.push('Enhance spectral beauty — add documentation for vibrant code colors')
  if (stats.avgIonizationQuality < 50) recs.push('Boost ionization quality — add error handling for proper code transformation')
  if (stats.avgAtmosphericClarity < 50) recs.push('Clear atmospheric conditions — remove console statements and any types')
  if (stats.avgElectromagneticForce < 50) recs.push('Strengthen electromagnetic force — add type safety and proper code conductance')
  if (stats.darknessCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of flares are in darkness — consider major refactoring')
  if (stats.subvisualCount > 0) recs.push('Warning: subvisual flares detected — these files need illumination')
  if (magnetosphere.overallBrilliance < 40) recs.push('Overall brilliance is critically low — establish an aurora recovery plan')
  if (regions.length > 0 && regions.every((r) => r.condition === 'void')) recs.push('All regions are void — your codebase needs fundamental aurora activation')

  if (flares.length > 0) {
    const highDischarge = flares.filter((f) => f.energy.dischargeCount > 2)
    if (highDischarge.length > flares.length * 0.5) recs.push('Over 50% of flares have high discharge — reduce any/eval usage')
  }

  return recs
}

// ─── buildAuroraBorealisResult ──────────────────────────────

/** @example buildAuroraBorealisResult(files, contents) returns full result */
export function buildAuroraBorealisResult(files: string[], contents: string[]): AuroraBorealisResult {
  const flares = files.map((file, i) => analyzeAuroraFlare(contents[i] ?? '', file))

  const regionMap = new Map<string, AuroraFlare[]>()
  flares.forEach((flare) => {
    const parts = flare.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = regionMap.get(dir)
    if (existing) existing.push(flare)
    else regionMap.set(dir, [flare])
  })

  const regions = Array.from(regionMap.entries()).map(([dir, fs]) => analyzePolarRegion(fs, dir))

  const avgPolarEnergy = flares.length > 0 ? Math.round(flares.reduce((s, f) => s + f.polarEnergy, 0) / flares.length) : 0
  const avgMagneticAlignment = flares.length > 0 ? Math.round(flares.reduce((s, f) => s + f.magneticAlignment, 0) / flares.length) : 0
  const avgSpectralBeauty = flares.length > 0 ? Math.round(flares.reduce((s, f) => s + f.spectralBeauty, 0) / flares.length) : 0
  const avgIonizationQuality = flares.length > 0 ? Math.round(flares.reduce((s, f) => s + f.ionizationQuality, 0) / flares.length) : 0
  const avgAtmosphericClarity = flares.length > 0 ? Math.round(flares.reduce((s, f) => s + f.atmosphericClarity, 0) / flares.length) : 0
  const avgElectromagneticForce = flares.length > 0 ? Math.round(flares.reduce((s, f) => s + f.electromagneticForce, 0) / flares.length) : 0

  const overallBrilliance = Math.round(
    avgPolarEnergy * 0.15 +
    avgMagneticAlignment * 0.15 +
    avgSpectralBeauty * 0.2 +
    avgIonizationQuality * 0.15 +
    avgAtmosphericClarity * 0.2 +
    avgElectromagneticForce * 0.15,
  )

  const magnetosphere = {
    avgEnergy: avgPolarEnergy,
    avgAlignment: avgMagneticAlignment,
    avgElectromagnetic: avgElectromagneticForce,
    isBrilliant: overallBrilliance >= 60,
    overallBrilliance,
  }

  const stats = {
    totalFiles: files.length,
    totalRegions: regions.length,
    avgPolarEnergy,
    avgMagneticAlignment,
    avgSpectralBeauty,
    avgIonizationQuality,
    avgAtmosphericClarity,
    avgElectromagneticForce,
    magnificentDisplayCount: flares.filter((f) => f.condition === 'magnificent-display').length,
    brilliantAuroraCount: flares.filter((f) => f.condition === 'brilliant-aurora').length,
    visibleShimmerCount: flares.filter((f) => f.condition === 'visible-shimmer').length,
    faintGlowCount: flares.filter((f) => f.condition === 'faint-glow').length,
    subvisualCount: flares.filter((f) => f.condition === 'subvisual').length,
    darknessCount: flares.filter((f) => f.condition === 'darkness').length,
    hasHighEnergyCount: flares.filter((f) => f.energy.hasHighLevel).length,
    hasHighAlignmentCount: flares.filter((f) => f.alignment.hasHighLevel).length,
    hasHighBeautyCount: flares.filter((f) => f.spectral.hasHighBeauty).length,
    hasHighQualityCount: flares.filter((f) => f.ionization.hasHighQuality).length,
    hasHighClarityCount: flares.filter((f) => f.atmospheric.hasHighClarity).length,
    hasHighForceCount: flares.filter((f) => f.electromagnetic.hasHighForce).length,
    overallBrilliance,
    observerGrade: classifyObserverGrade(overallBrilliance),
    bestFlare: '',
    mostEnergetic: '',
    mostAligned: '',
    mostBeautiful: '',
    mostTransformative: '',
    strongestForce: '',
  }

  if (flares.length > 0) {
    stats.bestFlare = flares.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.mostEnergetic = flares.reduce((a, b) => a.polarEnergy >= b.polarEnergy ? a : b).file
    stats.mostAligned = flares.reduce((a, b) => a.magneticAlignment >= b.magneticAlignment ? a : b).file
    stats.mostBeautiful = flares.reduce((a, b) => a.spectralBeauty >= b.spectralBeauty ? a : b).file
    stats.mostTransformative = flares.reduce((a, b) => a.ionizationQuality >= b.ionizationQuality ? a : b).file
    stats.strongestForce = flares.reduce((a, b) => a.electromagneticForce >= b.electromagneticForce ? a : b).file
  }

  const recommendations = generateRecommendations(flares, regions, magnetosphere, stats)

  return { flares, regions, magnetosphere, stats, recommendations }
}
