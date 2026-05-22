// ─── Interfaces ──────────────────────────────────────────────

export interface ExteriorMeasure {
  impression: number
  roughness: 'polished' | 'smooth' | 'rough' | 'jagged' | 'crumbling' | 'dust'
  hasHighImpression: boolean
  hasCleanExterior: boolean
  hasNoCracks: boolean
  hasProperCoating: boolean
  hasNoWeathering: boolean
  hasUniform: boolean
  hasNoStaining: boolean
  hasPresentable: boolean
  hasNoErosion: boolean
  hasSolidShell: boolean
  crackCount: number
  stainingCount: number
}

export interface InnerMeasure {
  beauty: number
  treasure: 'amethyst-cathedral' | 'crystal-cavity' | 'agate-rings' | 'micro-crystals' | 'druzy' | 'hollow'
  hasHighBeauty: boolean
  hasCrystalline: boolean
  hasProperCavity: boolean
  hasNoDebris: boolean
  hasRadiating: boolean
  hasNoHollow: boolean
  hasLuminescent: boolean
  hasNoInclusions: boolean
  hasDense: boolean
  hasNoFractures: boolean
  debrisCount: number
  fractureCount: number
}

export interface CrystalMeasure {
  formation: number
  type: 'pristine-crystal' | 'well-formed' | 'dendritic' | 'massive' | 'cryptocrystalline' | 'amorphous'
  hasHighFormation: boolean
  hasProperFacets: boolean
  hasTermination: boolean
  hasNoTwinning: boolean
  hasCleanFaces: boolean
  hasNoInclusions: boolean
  hasProperSymmetry: boolean
  hasNoStriations: boolean
  hasPristine: boolean
  hasNoImperfections: boolean
  twinningCount: number
  imperfectionCount: number
}

export interface GeologicalMeasure {
  pressure: number
  era: 'archean' | 'proterozoic' | 'paleozoic' | 'mesozoic' | 'cenozoic' | 'holocene'
  hasHighPressure: boolean
  hasSolidified: boolean
  hasProperStrata: boolean
  hasNoFaults: boolean
  hasMetamorphic: boolean
  hasNoErosion: boolean
  hasStable: boolean
  hasNoSubsidence: boolean
  hasWeathered: boolean
  hasNoVolcanic: boolean
  faultCount: number
  subsidenceCount: number
}

export interface CleavageMeasure {
  quality: number
  plane: 'perfect-cleavage' | 'good-cleavage' | 'distinct' | 'indistinct' | 'difficult' | 'none'
  hasHighQuality: boolean
  hasCleanBreak: boolean
  hasProperPlanes: boolean
  hasNoShattering: boolean
  hasConchoidal: boolean
  hasNoSplintering: boolean
  hasEvenFracture: boolean
  hasNoUnevenBreak: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  shatteringCount: number
  splinteringCount: number
}

export interface MineralMeasure {
  wealth: number
  value: 'precious-gem' | 'semi-precious' | 'industrial' | 'common' | 'low-grade' | 'barren'
  hasHighWealth: boolean
  hasRare: boolean
  hasValuable: boolean
  hasNoWaste: boolean
  hasConcentrated: boolean
  hasNoDilution: boolean
  hasExtractable: boolean
  hasNoContamination: boolean
  hasHighGrade: boolean
  hasNoTailings: boolean
  wasteCount: number
  contaminationCount: number
}

export interface GeodeSpecimen {
  file: string
  innerBeauty: number
  crystalFormation: number
  geologicalPressure: number
  cleavageQuality: number
  mineralWealth: number
  exteriorImpression: number
  exterior: ExteriorMeasure
  inner: InnerMeasure
  crystal: CrystalMeasure
  geological: GeologicalMeasure
  cleavage: CleavageMeasure
  mineral: MineralMeasure
  condition: 'museum-specimen' | 'collector-piece' | 'display-quality' | 'rough-specimen' | 'fragment' | 'dust'
  qualityScore: number
}

export interface MineralVein {
  directory: string
  specimens: GeodeSpecimen[]
  avgBeauty: number
  avgCrystal: number
  avgWealth: number
  museumCount: number
  dustCount: number
  gemCount: number
  crystallineCount: number
  veinType: 'mother-lode' | 'rich-vein' | 'mineral-seam' | 'trace-deposit' | 'barren-rock' | 'void'
  condition: 'treasure-trove' | 'productive-mine' | 'working-quarry' | 'exploratory' | 'exhausted' | 'collapsed'
}

export interface GeodeSphereResult {
  specimens: GeodeSpecimen[]
  veins: MineralVein[]
  quarry: {
    avgBeauty: number
    avgCrystal: number
    avgWealth: number
    isGemQuality: boolean
    overallQuality: number
  }
  stats: {
    totalFiles: number
    totalVeins: number
    avgInnerBeauty: number
    avgCrystalFormation: number
    avgGeologicalPressure: number
    avgCleavageQuality: number
    avgMineralWealth: number
    avgExteriorImpression: number
    museumSpecimenCount: number
    collectorPieceCount: number
    displayQualityCount: number
    roughSpecimenCount: number
    fragmentCount: number
    dustCount: number
    hasHighBeautyCount: number
    hasHighFormationCount: number
    hasHighPressureCount: number
    hasHighQualityCount: number
    hasHighWealthCount: number
    hasHighImpressionCount: number
    overallQuality: number
    prospectorGrade: 'master-prospector' | 'gemologist' | 'miner' | 'rockhound' | 'amateur' | 'tourist'
    bestSpecimen: string
    mostBeautiful: string
    bestCrystals: string
    mostMature: string
    bestCleavage: string
    mostValuable: string
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
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g

// ─── measureExterior ────────────────────────────────────────

/** @example measureExterior(content) returns ExteriorMeasure */
export function measureExterior(content: string): ExteriorMeasure {
  let score = 0

  const lines = content.split('\n')
  const avgLineLen = lines.length > 0 ? lines.reduce((s, l) => s + l.length, 0) / lines.length : 0
  const hasCleanExterior = avgLineLen < 80
  const crackCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoCracks = crackCount === 0
  const hasProperCoating = lines.every((l) => l.length < 120)
  const hasNoWeathering = (content.match(DEPRECATED_RE) || []).length === 0
  const hasUniform = lines.every((l) => l.length < 300)
  const stainingCount = (content.match(CONSOLE_RE) || []).length
  const hasNoStaining = stainingCount === 0
  const hasPresentable = content.length > 0 && (EXPORT_RE.test(content) || FUNCTION_RE.test(content))
  const hasNoErosion = !NESTED_TERNARY_RE.test(content)
  const hasSolidShell = INTERFACE_RE.test(content) || CLASS_RE.test(content) || TYPE_RE.test(content)

  if (content.length > 0) score += 5
  if (hasCleanExterior) score += 12
  if (hasNoCracks) score += 12
  if (hasProperCoating) score += 10
  if (hasNoWeathering) score += 10
  if (hasUniform) score += 10
  if (hasNoStaining) score += 10
  if (hasPresentable) score += 10
  if (hasNoErosion) score += 11
  if (hasSolidShell) score += 10

  const impression = Math.min(100, Math.max(0, score))
  const hasHighImpression = impression >= 70

  let roughness: ExteriorMeasure['roughness'] = 'dust'
  if (hasHighImpression && hasNoCracks && hasNoStaining && hasSolidShell) roughness = 'polished'
  else if (hasHighImpression && hasNoCracks) roughness = 'smooth'
  else if (hasHighImpression) roughness = 'rough'
  else if (hasSolidShell && hasNoErosion) roughness = 'jagged'
  else if (impression > 30) roughness = 'crumbling'

  return {
    impression, roughness, hasHighImpression, hasCleanExterior, hasNoCracks,
    hasProperCoating, hasNoWeathering, hasUniform, hasNoStaining,
    hasPresentable, hasNoErosion, hasSolidShell, crackCount, stainingCount,
  }
}

// ─── measureInner ───────────────────────────────────────────

/** @example measureInner(content) returns InnerMeasure */
export function measureInner(content: string): InnerMeasure {
  let score = 0

  const hasCrystalline = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasProperCavity = CLASS_RE.test(content) && (INTERFACE_RE.test(content) || TYPE_RE.test(content))
  const debrisCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDebris = debrisCount === 0
  const hasRadiating = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoHollow = content.length > 0 && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const hasLuminescent = (content.match(DOC_COMMENT_RE) || []).length > 0
  const fractureCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoFractures = fractureCount === 0
  const hasNoInclusions = (content.match(EVAL_RE) || []).length === 0
  const hasDense = TRY_RE.test(content) && CATCH_RE.test(content)

  if (content.length > 0) score += 5
  if (hasCrystalline) score += 12
  if (hasProperCavity) score += 12
  if (hasNoDebris) score += 10
  if (hasRadiating) score += 10
  if (hasNoHollow) score += 10
  if (hasLuminescent) score += 10
  if (hasNoFractures) score += 10
  if (hasNoInclusions) score += 11
  if (hasDense) score += 10

  const beauty = Math.min(100, Math.max(0, score))
  const hasHighBeauty = beauty >= 70

  let treasure: InnerMeasure['treasure'] = 'hollow'
  if (hasHighBeauty && hasCrystalline && hasProperCavity && hasNoDebris) treasure = 'amethyst-cathedral'
  else if (hasHighBeauty && hasCrystalline) treasure = 'crystal-cavity'
  else if (hasHighBeauty) treasure = 'agate-rings'
  else if (hasProperCavity && hasNoDebris) treasure = 'micro-crystals'
  else if (beauty > 30) treasure = 'druzy'

  return {
    beauty, treasure, hasHighBeauty, hasCrystalline, hasProperCavity,
    hasNoDebris, hasRadiating, hasNoHollow, hasLuminescent,
    hasNoInclusions, hasDense, hasNoFractures, debrisCount, fractureCount,
  }
}

// ─── measureCrystal ─────────────────────────────────────────

/** @example measureCrystal(content) returns CrystalMeasure */
export function measureCrystal(content: string): CrystalMeasure {
  let score = 0

  const hasProperFacets = INTERFACE_RE.test(content) || TYPE_RE.test(content)
  const hasTermination = RETURN_RE.test(content)
  const twinningCount = linesOverThreshold(content, 3)
  const hasNoTwinning = twinningCount === 0
  const hasCleanFaces = linesOverThreshold(content, 5) <= 1
  const hasNoInclusions = (content.match(EVAL_RE) || []).length === 0
  const hasProperSymmetry = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoStriations = !NESTED_TERNARY_RE.test(content)
  const hasPristine = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const imperfectionCount = (content.match(HACK_RE) || []).length + (content.match(ANY_RE) || []).length
  const hasNoImperfections = imperfectionCount === 0

  if (content.length > 0) score += 5
  if (hasProperFacets) score += 12
  if (hasTermination) score += 10
  if (hasNoTwinning) score += 12
  if (hasCleanFaces) score += 10
  if (hasNoInclusions) score += 10
  if (hasProperSymmetry) score += 12
  if (hasNoStriations) score += 10
  if (hasPristine) score += 11
  if (hasNoImperfections) score += 10

  const formation = Math.min(100, Math.max(0, score))
  const hasHighFormation = formation >= 70

  let crystalType: CrystalMeasure['type'] = 'amorphous'
  if (hasHighFormation && hasNoTwinning && hasNoImperfections && hasProperFacets) crystalType = 'pristine-crystal'
  else if (hasHighFormation && hasNoTwinning) crystalType = 'well-formed'
  else if (hasHighFormation) crystalType = 'dendritic'
  else if (hasProperFacets && hasProperSymmetry) crystalType = 'massive'
  else if (formation > 30) crystalType = 'cryptocrystalline'

  return {
    formation, type: crystalType, hasHighFormation, hasProperFacets, hasTermination,
    hasNoTwinning, hasCleanFaces, hasNoInclusions, hasProperSymmetry,
    hasNoStriations, hasPristine, hasNoImperfections, twinningCount, imperfectionCount,
  }
}

function linesOverThreshold(content: string, minDuplicateLen: number): number {
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l.length > minDuplicateLen)
  const seen = new Map<string, number>()
  for (const line of lines) {
    seen.set(line, (seen.get(line) ?? 0) + 1)
  }
  let count = 0
  for (const v of seen.values()) {
    if (v > 1) count += v - 1
  }
  return count
}

// ─── measureGeological ──────────────────────────────────────

/** @example measureGeological(content) returns GeologicalMeasure */
export function measureGeological(content: string): GeologicalMeasure {
  let score = 0

  const hasSolidified = TYPE_RE.test(content) || INTERFACE_RE.test(content) || CLASS_RE.test(content)
  const hasProperStrata = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const faultCount = (content.match(EVAL_RE) || []).length + (content.match(ANY_RE) || []).length
  const hasNoFaults = faultCount === 0
  const hasMetamorphic = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoErosion = (content.match(DEPRECATED_RE) || []).length === 0
  const hasStable = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const subsidenceCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoSubsidence = subsidenceCount === 0
  const hasWeathered = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoVolcanic = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasSolidified) score += 12
  if (hasProperStrata) score += 12
  if (hasNoFaults) score += 10
  if (hasMetamorphic) score += 10
  if (hasNoErosion) score += 10
  if (hasStable) score += 10
  if (hasNoSubsidence) score += 10
  if (hasWeathered) score += 11
  if (hasNoVolcanic) score += 10

  const pressure = Math.min(100, Math.max(0, score))
  const hasHighPressure = pressure >= 70

  let era: GeologicalMeasure['era'] = 'holocene'
  if (hasHighPressure && hasNoFaults && hasMetamorphic && hasWeathered) era = 'archean'
  else if (hasHighPressure && hasNoFaults) era = 'proterozoic'
  else if (hasHighPressure) era = 'paleozoic'
  else if (hasSolidified && hasMetamorphic) era = 'mesozoic'
  else if (pressure > 30) era = 'cenozoic'

  return {
    pressure, era, hasHighPressure, hasSolidified, hasProperStrata,
    hasNoFaults, hasMetamorphic, hasNoErosion, hasStable,
    hasNoSubsidence, hasWeathered, hasNoVolcanic, faultCount, subsidenceCount,
  }
}

// ─── measureCleavage ────────────────────────────────────────

/** @example measureCleavage(content) returns CleavageMeasure */
export function measureCleavage(content: string): CleavageMeasure {
  let score = 0

  const exportCount = (content.match(/\bexport\b/g) || []).length
  const hasCleanBreak = exportCount > 0 && exportCount <= 20
  const hasProperPlanes = INTERFACE_RE.test(content) || TYPE_RE.test(content)
  const shatteringCount = (content.match(NESTED_TERNARY_RE) || []).length
  const hasNoShattering = shatteringCount === 0
  const hasConchoidal = TRY_RE.test(content) && CATCH_RE.test(content)
  const splinteringCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoSplintering = splinteringCount === 0
  const hasEvenFracture = content.length === 0 || (FUNCTION_RE.test(content) && RETURN_RE.test(content))
  const hasNoUnevenBreak = !EVAL_RE.test(content)
  const hasModular = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const lineCount = content.split('\n').length
  const hasNoMonolithic = lineCount < 500

  if (content.length > 0) score += 5
  if (hasCleanBreak) score += 12
  if (hasProperPlanes) score += 12
  if (hasNoShattering) score += 10
  if (hasConchoidal) score += 10
  if (hasNoSplintering) score += 10
  if (hasEvenFracture) score += 10
  if (hasNoUnevenBreak) score += 10
  if (hasModular) score += 11
  if (hasNoMonolithic) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let plane: CleavageMeasure['plane'] = 'none'
  if (hasHighQuality && hasCleanBreak && hasProperPlanes && hasNoShattering) plane = 'perfect-cleavage'
  else if (hasHighQuality && hasCleanBreak) plane = 'good-cleavage'
  else if (hasHighQuality) plane = 'distinct'
  else if (hasProperPlanes && hasModular) plane = 'indistinct'
  else if (quality > 30) plane = 'difficult'

  return {
    quality, plane, hasHighQuality, hasCleanBreak, hasProperPlanes,
    hasNoShattering, hasConchoidal, hasNoSplintering, hasEvenFracture,
    hasNoUnevenBreak, hasModular, hasNoMonolithic, shatteringCount, splinteringCount,
  }
}

// ─── measureMineral ─────────────────────────────────────────

/** @example measureMineral(content) returns MineralMeasure */
export function measureMineral(content: string): MineralMeasure {
  let score = 0

  const hasRare = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const hasValuable = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const wasteCount = (content.match(CONSOLE_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoWaste = wasteCount === 0
  const hasConcentrated = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasNoDilution = (content.match(ANY_RE) || []).length === 0
  const hasExtractable = EXPORT_RE.test(content)
  const contaminationCount = (content.match(ANY_RE) || []).length + (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoContamination = contaminationCount === 0
  const hasHighGrade = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoTailings = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasRare) score += 12
  if (hasValuable) score += 12
  if (hasNoWaste) score += 10
  if (hasConcentrated) score += 10
  if (hasNoDilution) score += 10
  if (hasExtractable) score += 10
  if (hasNoContamination) score += 10
  if (hasHighGrade) score += 11
  if (hasNoTailings) score += 10

  const wealth = Math.min(100, Math.max(0, score))
  const hasHighWealth = wealth >= 70

  let mineralValue: MineralMeasure['value'] = 'barren'
  if (hasHighWealth && hasRare && hasConcentrated && hasNoContamination) mineralValue = 'precious-gem'
  else if (hasHighWealth && hasRare) mineralValue = 'semi-precious'
  else if (hasHighWealth) mineralValue = 'industrial'
  else if (hasValuable && hasExtractable) mineralValue = 'common'
  else if (wealth > 30) mineralValue = 'low-grade'

  return {
    wealth, value: mineralValue, hasHighWealth, hasRare, hasValuable,
    hasNoWaste, hasConcentrated, hasNoDilution, hasExtractable,
    hasNoContamination, hasHighGrade, hasNoTailings, wasteCount, contaminationCount,
  }
}

// ─── classifyCondition ──────────────────────────────────────

/** @example classifyCondition(specimen) returns condition */
export function classifyCondition(specimen: GeodeSpecimen): GeodeSpecimen['condition'] {
  const { qualityScore } = specimen
  if (qualityScore >= 80) return 'museum-specimen'
  if (qualityScore >= 65) return 'collector-piece'
  if (qualityScore >= 50) return 'display-quality'
  if (qualityScore >= 35) return 'rough-specimen'
  if (qualityScore >= 20) return 'fragment'
  return 'dust'
}

// ─── Specimen Analysis ──────────────────────────────────────

/** @example analyzeGeodeSpecimen(content, filePath) returns full specimen */
export function analyzeGeodeSpecimen(content: string, filePath: string): GeodeSpecimen {
  const exterior = measureExterior(content)
  const inner = measureInner(content)
  const crystal = measureCrystal(content)
  const geological = measureGeological(content)
  const cleavage = measureCleavage(content)
  const mineral = measureMineral(content)

  const exteriorImpression = exterior.impression
  const innerBeauty = inner.beauty
  const crystalFormation = crystal.formation
  const geologicalPressure = geological.pressure
  const cleavageQuality = cleavage.quality
  const mineralWealth = mineral.wealth

  const qualityScore = Math.round(
    exteriorImpression * 0.15 +
    innerBeauty * 0.2 +
    crystalFormation * 0.15 +
    geologicalPressure * 0.15 +
    cleavageQuality * 0.15 +
    mineralWealth * 0.2,
  )

  const result: GeodeSpecimen = {
    file: filePath,
    innerBeauty, crystalFormation, geologicalPressure,
    cleavageQuality, mineralWealth, exteriorImpression,
    exterior, inner, crystal, geological, cleavage, mineral,
    qualityScore,
    condition: 'dust',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── Vein Analysis ──────────────────────────────────────────

/** @example analyzeMineralVein(specimens, dirPath) returns MineralVein */
export function analyzeMineralVein(specimens: GeodeSpecimen[], dirPath: string): MineralVein {
  if (specimens.length === 0) {
    return {
      directory: dirPath, specimens: [], avgBeauty: 0, avgCrystal: 0,
      avgWealth: 0, museumCount: 0, dustCount: 0, gemCount: 0,
      crystallineCount: 0, veinType: 'void', condition: 'collapsed',
    }
  }

  const avgBeauty = Math.round(specimens.reduce((s, sp) => s + sp.innerBeauty, 0) / specimens.length)
  const avgCrystal = Math.round(specimens.reduce((s, sp) => s + sp.crystalFormation, 0) / specimens.length)
  const avgWealth = Math.round(specimens.reduce((s, sp) => s + sp.mineralWealth, 0) / specimens.length)
  const museumCount = specimens.filter((sp) => sp.condition === 'museum-specimen').length
  const dustCount = specimens.filter((sp) => sp.condition === 'dust').length
  const gemCount = specimens.filter((sp) => sp.mineral.hasHighWealth).length
  const crystallineCount = specimens.filter((sp) => sp.crystal.hasHighFormation).length

  const veinType = classifyVeinType(specimens)
  const avgScore = specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length
  let condition: MineralVein['condition'] = 'collapsed'
  if (avgScore >= 75) condition = 'treasure-trove'
  else if (avgScore >= 60) condition = 'productive-mine'
  else if (avgScore >= 45) condition = 'working-quarry'
  else if (avgScore >= 30) condition = 'exploratory'
  else if (avgScore >= 15) condition = 'exhausted'

  return {
    directory: dirPath, specimens, avgBeauty, avgCrystal, avgWealth,
    museumCount, dustCount, gemCount, crystallineCount, veinType, condition,
  }
}

// ─── Vein Classification ────────────────────────────────────

/** @example classifyVeinType(specimens) returns vein type */
export function classifyVeinType(specimens: GeodeSpecimen[]): MineralVein['veinType'] {
  if (specimens.length === 0) return 'void'
  const avgScore = specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length
  const museumCnt = specimens.filter((sp) => sp.condition === 'museum-specimen').length
  if (avgScore >= 75 && museumCnt >= Math.ceil(specimens.length * 0.3)) return 'mother-lode'
  if (avgScore >= 60) return 'rich-vein'
  if (avgScore >= 45) return 'mineral-seam'
  if (avgScore >= 30) return 'trace-deposit'
  if (avgScore >= 15) return 'barren-rock'
  return 'void'
}

// ─── Prospector Grade ───────────────────────────────────────

/** @example classifyProspectorGrade(avgQuality) returns grade */
export function classifyProspectorGrade(avgQuality: number): GeodeSphereResult['stats']['prospectorGrade'] {
  if (avgQuality >= 80) return 'master-prospector'
  if (avgQuality >= 65) return 'gemologist'
  if (avgQuality >= 50) return 'miner'
  if (avgQuality >= 35) return 'rockhound'
  if (avgQuality >= 20) return 'amateur'
  return 'tourist'
}

// ─── Recommendations ────────────────────────────────────────

/** @example generateRecommendations(specimens, veins, quarry, stats) returns string[] */
export function generateRecommendations(
  specimens: GeodeSpecimen[],
  veins: MineralVein[],
  quarry: GeodeSphereResult['quarry'],
  stats: GeodeSphereResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgExteriorImpression < 50) recs.push('Polish the exterior — improve formatting and remove surface-level issues')
  if (stats.avgInnerBeauty < 50) recs.push('Reveal inner beauty — add interfaces, types, and proper encapsulation')
  if (stats.avgCrystalFormation < 50) recs.push('Improve crystal formation — reduce code duplication and add proper structure')
  if (stats.avgGeologicalPressure < 50) recs.push('Apply geological pressure — add error handling and async patterns for maturity')
  if (stats.avgCleavageQuality < 50) recs.push('Improve cleavage quality — split monolithic code into modular exports')
  if (stats.avgMineralWealth < 50) recs.push('Increase mineral wealth — add generics, optional types, and valuable patterns')
  if (stats.dustCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of specimens are dust — consider major refactoring')
  if (stats.fragmentCount > 0) recs.push('Warning: fragments detected — these files need immediate attention')
  if (quarry.overallQuality < 40) recs.push('Overall quarry quality is critical — establish an improvement plan')
  if (veins.length > 0 && veins.every((v) => v.condition === 'collapsed')) recs.push('All veins are collapsed — your codebase needs fundamental restructuring')

  if (specimens.length > 0) {
    const crackedSpecimens = specimens.filter((sp) => sp.exterior.crackCount > 2)
    if (crackedSpecimens.length > specimens.length * 0.5) recs.push('Over 50% of specimens have cracks — reduce TODOs and FIXMEs')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────

/** @example buildGeodeSphereResult(files, contents) returns full result */
export function buildGeodeSphereResult(files: string[], contents: string[]): GeodeSphereResult {
  const specimens = files.map((file, i) => analyzeGeodeSpecimen(contents[i] ?? '', file))

  const veinMap = new Map<string, GeodeSpecimen[]>()
  specimens.forEach((specimen) => {
    const parts = specimen.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = veinMap.get(dir)
    if (existing) existing.push(specimen)
    else veinMap.set(dir, [specimen])
  })

  const veins = Array.from(veinMap.entries()).map(([dir, sps]) => analyzeMineralVein(sps, dir))

  const avgInnerBeauty = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.innerBeauty, 0) / specimens.length) : 0
  const avgCrystalFormation = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.crystalFormation, 0) / specimens.length) : 0
  const avgGeologicalPressure = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.geologicalPressure, 0) / specimens.length) : 0
  const avgCleavageQuality = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.cleavageQuality, 0) / specimens.length) : 0
  const avgMineralWealth = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.mineralWealth, 0) / specimens.length) : 0
  const avgExteriorImpression = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.exteriorImpression, 0) / specimens.length) : 0

  const overallQuality = Math.round(
    avgExteriorImpression * 0.15 +
    avgInnerBeauty * 0.2 +
    avgCrystalFormation * 0.15 +
    avgGeologicalPressure * 0.15 +
    avgCleavageQuality * 0.15 +
    avgMineralWealth * 0.2,
  )

  const quarry = {
    avgBeauty: avgInnerBeauty,
    avgCrystal: avgCrystalFormation,
    avgWealth: avgMineralWealth,
    isGemQuality: overallQuality >= 60,
    overallQuality,
  }

  const stats = {
    totalFiles: files.length,
    totalVeins: veins.length,
    avgInnerBeauty,
    avgCrystalFormation,
    avgGeologicalPressure,
    avgCleavageQuality,
    avgMineralWealth,
    avgExteriorImpression,
    museumSpecimenCount: specimens.filter((sp) => sp.condition === 'museum-specimen').length,
    collectorPieceCount: specimens.filter((sp) => sp.condition === 'collector-piece').length,
    displayQualityCount: specimens.filter((sp) => sp.condition === 'display-quality').length,
    roughSpecimenCount: specimens.filter((sp) => sp.condition === 'rough-specimen').length,
    fragmentCount: specimens.filter((sp) => sp.condition === 'fragment').length,
    dustCount: specimens.filter((sp) => sp.condition === 'dust').length,
    hasHighBeautyCount: specimens.filter((sp) => sp.inner.hasHighBeauty).length,
    hasHighFormationCount: specimens.filter((sp) => sp.crystal.hasHighFormation).length,
    hasHighPressureCount: specimens.filter((sp) => sp.geological.hasHighPressure).length,
    hasHighQualityCount: specimens.filter((sp) => sp.cleavage.hasHighQuality).length,
    hasHighWealthCount: specimens.filter((sp) => sp.mineral.hasHighWealth).length,
    hasHighImpressionCount: specimens.filter((sp) => sp.exterior.hasHighImpression).length,
    overallQuality,
    prospectorGrade: classifyProspectorGrade(overallQuality),
    bestSpecimen: '',
    mostBeautiful: '',
    bestCrystals: '',
    mostMature: '',
    bestCleavage: '',
    mostValuable: '',
  }

  if (specimens.length > 0) {
    stats.bestSpecimen = specimens.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.mostBeautiful = specimens.reduce((a, b) => a.innerBeauty >= b.innerBeauty ? a : b).file
    stats.bestCrystals = specimens.reduce((a, b) => a.crystalFormation >= b.crystalFormation ? a : b).file
    stats.mostMature = specimens.reduce((a, b) => a.geologicalPressure >= b.geologicalPressure ? a : b).file
    stats.bestCleavage = specimens.reduce((a, b) => a.cleavageQuality >= b.cleavageQuality ? a : b).file
    stats.mostValuable = specimens.reduce((a, b) => a.mineralWealth >= b.mineralWealth ? a : b).file
  }

  const recommendations = generateRecommendations(specimens, veins, quarry, stats)

  return { specimens, veins, quarry, stats, recommendations }
}
