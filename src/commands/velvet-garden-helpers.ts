// ─── Types ─────────────────────────────────────────────────────────────────

export interface SofteningMeasure {
  softness: number
  texture: 'silken-velvet' | 'soft-petal' | 'gentle-touch' | 'rough-bark' | 'thorny-stem' | 'sandpaper'
  hasHighSoftness: boolean
  hasGentle: boolean
  hasSmooth: boolean
  hasNoHarshness: boolean
  hasTender: boolean
  hasNoAbrasion: boolean
  hasDelicate: boolean
  hasNoRoughness: boolean
  hasPliable: boolean
  hasNoRigidity: boolean
  hasSupple: boolean
  harshnessCount: number
  abrasionCount: number
}

export interface PetalMeasure {
  quality: number
  bloom: 'perfect-bloom' | 'lovely-petal' | 'pretty-flower' | 'fading-petal' | 'wilted-flower' | 'dead-bloom'
  hasHighQuality: boolean
  hasBeautiful: boolean
  hasElegant: boolean
  hasNoUgliness: boolean
  hasColorful: boolean
  hasNoDrab: boolean
  hasVibrant: boolean
  hasNoDull: boolean
  hasRadiant: boolean
  hasNoFaded: boolean
  hasLuminous: boolean
  uglinessCount: number
  drabCount: number
}

export interface RootingMeasure {
  depth: number
  system: 'deep-taproot' | 'strong-roots' | 'proper-rootball' | 'shallow-roots' | 'surface-roots' | 'no-roots'
  hasHighDepth: boolean
  hasDeep: boolean
  hasAnchored: boolean
  hasNoShallow: boolean
  hasGrounded: boolean
  hasNoFloating: boolean
  hasStable: boolean
  hasNoWobbly: boolean
  hasSecure: boolean
  hasNoUnstable: boolean
  hasFirm: boolean
  shallowCount: number
  floatingCount: number
}

export interface FragranceMeasure {
  level: number
  scent: 'intoxicating' | 'heavenly-aroma' | 'sweet-fragrance' | 'faint-scent' | 'no-fragrance' | 'foul-odor'
  hasHighLevel: boolean
  hasAromatic: boolean
  hasAppealing: boolean
  hasNoStench: boolean
  hasInviting: boolean
  hasNoRepellent: boolean
  hasAttractive: boolean
  hasNoOffensive: boolean
  hasPleasant: boolean
  hasNoBitter: boolean
  hasSweet: boolean
  stenchCount: number
  repellentCount: number
}

export interface BloomingMeasure {
  potential: number
  stage: 'full-bloom' | 'opening-bud' | 'growing-shoot' | 'dormant-seed' | 'wilted-stem' | 'dead-branch'
  hasHighPotential: boolean
  hasGrowing: boolean
  hasExpanding: boolean
  hasNoStagnant: boolean
  hasThriving: boolean
  hasNoDeclining: boolean
  hasVigorous: boolean
  hasNoWithering: boolean
  hasFlourishing: boolean
  hasNoDying: boolean
  hasSprouting: boolean
  stagnantCount: number
  decliningCount: number
}

export type GardenCondition = 'master-garden' | 'flourishing-bed' | 'growing-garden' | 'wild-patch' | 'barren-soil' | 'dead-zone'

export interface GardenPetal {
  file: string
  softness: number
  petalQuality: number
  rootDepth: number
  fragranceLevel: number
  bloomPotential: number
  softening: SofteningMeasure
  petal: PetalMeasure
  rooting: RootingMeasure
  fragrance: FragranceMeasure
  blooming: BloomingMeasure
  condition: GardenCondition
  qualityScore: number
}

export type BedType = 'royal-garden' | 'cottage-garden' | 'window-box' | 'plant-pot' | 'weed-patch' | 'concrete-slab'
export type BedCondition = 'kew-gardens' | 'well-tended' | 'decent-plot' | 'overgrown' | 'neglected' | 'wasteland'

export interface GardenBed {
  directory: string
  petals: GardenPetal[]
  avgSoftness: number
  avgDepth: number
  avgBloom: number
  masterGardenCount: number
  deadZoneCount: number
  bedType: BedType
  condition: BedCondition
}

export interface VelvetGarden {
  avgSoftness: number
  avgDepth: number
  avgBloom: number
  isFlourishing: boolean
  overallLushness: number
}

export type GardenerGrade = 'master-gardener' | 'expert-horticulturist' | 'skilled-gardener' | 'apprentice' | 'novice' | 'black-thumb'

export interface VelvetGardenStats {
  totalFiles: number
  totalBeds: number
  avgSoftness: number
  avgPetalQuality: number
  avgRootDepth: number
  avgFragranceLevel: number
  avgBloomPotential: number
  masterGardenCount: number
  flourishingBedCount: number
  growingGardenCount: number
  wildPatchCount: number
  barrenSoilCount: number
  deadZoneCount: number
  hasHighSoftnessCount: number
  hasHighQualityCount: number
  hasHighDepthCount: number
  hasHighLevelCount: number
  hasHighPotentialCount: number
  overallLushness: number
  gardenerGrade: GardenerGrade
  bestPetal: string
  softest: string
  mostBeautiful: string
  deepestRooted: string
  mostFragrant: string
}

export interface VelvetGardenResult {
  petals: GardenPetal[]
  beds: GardenBed[]
  garden: VelvetGarden
  stats: VelvetGardenStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureSoftening(content) evaluates code gentleness */
export function measureSoftening(content: string): SofteningMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)

  const harshnessMatches = content.match(/\bvar\s+/g)
  const harshnessCount = harshnessMatches ? harshnessMatches.length : 0
  const abrasionMatches = content.match(/\bany\b/g)
  const abrasionCount = abrasionMatches ? abrasionMatches.length : 0

  const hasGentle = hasExport && hasConst
  const hasSmooth = hasReturnType && hasConst
  const hasTender = hasInterface && hasStrictEquality
  const hasDelicate = hasAsync && hasTryCatch
  const hasPliable = hasNullishCoalescing && hasReadonly
  const hasSupple = hasExport && hasDefaultParam

  let softness = 0
  if (hasExport) softness += 10
  if (hasConst) softness += 10
  if (hasReturnType) softness += 10
  if (hasInterface) softness += 8
  if (hasStrictEquality) softness += 8
  if (hasAsync) softness += 8
  if (hasTryCatch) softness += 8
  if (hasNullishCoalescing) softness += 8
  if (hasReadonly) softness += 8
  if (hasDefaultParam) softness += 8
  if (hasGentle) softness += 5
  if (hasSmooth) softness += 5
  if (hasTender) softness += 5
  if (hasDelicate) softness += 5
  if (hasPliable) softness += 5
  if (hasSupple) softness += 5

  softness = Math.min(100, Math.round(softness))

  let texture: SofteningMeasure['texture'] = 'sandpaper'
  if (softness >= 85) texture = 'silken-velvet'
  else if (softness >= 70) texture = 'soft-petal'
  else if (softness >= 55) texture = 'gentle-touch'
  else if (softness >= 40) texture = 'rough-bark'
  else if (softness >= 25) texture = 'thorny-stem'

  return {
    softness, texture,
    hasHighSoftness: softness >= 70,
    hasGentle, hasSmooth, hasNoHarshness: harshnessCount === 0,
    hasTender, hasNoAbrasion: abrasionCount === 0,
    hasDelicate, hasNoRoughness: harshnessCount === 0 && abrasionCount === 0,
    hasPliable, hasNoRigidity: harshnessCount === 0,
    hasSupple,
    harshnessCount, abrasionCount,
  }
}

/** @example measurePetal(content) evaluates code surface beauty */
export function measurePetal(content: string): PetalMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const uglinessMatches = content.match(/\bvar\s+/g)
  const uglinessCount = uglinessMatches ? uglinessMatches.length : 0
  const drabMatches = content.match(/\bany\b/g)
  const drabCount = drabMatches ? drabMatches.length : 0

  const hasBeautiful = hasExport && hasImport
  const hasElegant = hasReturnType && hasConst
  const hasColorful = hasInterface && hasClass
  const hasVibrant = hasPrivate && hasReadonly
  const hasRadiant = hasNamedExport && hasDocComments
  const hasLuminous = hasOptionalChaining && hasConst

  let quality = 0
  if (hasExport) quality += 10
  if (hasImport) quality += 10
  if (hasInterface) quality += 8
  if (hasClass) quality += 8
  if (hasReturnType) quality += 10
  if (hasConst) quality += 8
  if (hasPrivate) quality += 8
  if (hasReadonly) quality += 8
  if (hasDocComments) quality += 8
  if (hasOptionalChaining) quality += 8
  if (hasNamedExport) quality += 8
  if (hasBeautiful) quality += 5
  if (hasElegant) quality += 5
  if (hasColorful) quality += 5
  if (hasVibrant) quality += 5
  if (hasRadiant) quality += 5
  if (hasLuminous) quality += 5

  quality = Math.min(100, Math.round(quality))

  let bloom: PetalMeasure['bloom'] = 'dead-bloom'
  if (quality >= 85) bloom = 'perfect-bloom'
  else if (quality >= 70) bloom = 'lovely-petal'
  else if (quality >= 55) bloom = 'pretty-flower'
  else if (quality >= 40) bloom = 'fading-petal'
  else if (quality >= 25) bloom = 'wilted-flower'

  return {
    quality, bloom,
    hasHighQuality: quality >= 70,
    hasBeautiful, hasElegant, hasNoUgliness: uglinessCount === 0,
    hasColorful, hasNoDrab: drabCount === 0,
    hasVibrant, hasNoDull: uglinessCount === 0 && drabCount === 0,
    hasRadiant, hasNoFaded: uglinessCount === 0,
    hasLuminous,
    uglinessCount, drabCount,
  }
}

/** @example measureRooting(content) evaluates code foundation depth */
export function measureRooting(content: string): RootingMeasure {
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasExport = /export\s/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)

  const shallowMatches = content.match(/\bvar\s+/g)
  const shallowCount = shallowMatches ? shallowMatches.length : 0
  const floatingMatches = content.match(/\bany\b/g)
  const floatingCount = floatingMatches ? floatingMatches.length : 0

  const hasDeep = hasGenerics && hasTypeAlias
  const hasAnchored = hasInterface && hasPrivate
  const hasGrounded = hasOptionalChaining && hasNullishCoalescing
  const hasStable = hasAsync && hasGenerics
  const hasSecure = hasExport && hasDocComments
  const hasFirm = hasReadonly && hasGenerics

  let depth = 0
  if (hasGenerics) depth += 10
  if (hasTypeAlias) depth += 8
  if (hasInterface) depth += 10
  if (hasPrivate) depth += 8
  if (hasReadonly) depth += 8
  if (hasOptionalChaining) depth += 10
  if (hasNullishCoalescing) depth += 8
  if (hasAsync) depth += 8
  if (hasExport) depth += 8
  if (hasDocComments) depth += 8
  if (hasDeep) depth += 5
  if (hasAnchored) depth += 5
  if (hasGrounded) depth += 5
  if (hasStable) depth += 5
  if (hasSecure) depth += 5
  if (hasFirm) depth += 5

  depth = Math.min(100, Math.round(depth))

  let system: RootingMeasure['system'] = 'no-roots'
  if (depth >= 85) system = 'deep-taproot'
  else if (depth >= 70) system = 'strong-roots'
  else if (depth >= 55) system = 'proper-rootball'
  else if (depth >= 40) system = 'shallow-roots'
  else if (depth >= 25) system = 'surface-roots'

  return {
    depth, system,
    hasHighDepth: depth >= 70,
    hasDeep, hasAnchored, hasNoShallow: shallowCount === 0,
    hasGrounded, hasNoFloating: floatingCount === 0,
    hasStable, hasNoWobbly: shallowCount === 0 && floatingCount === 0,
    hasSecure, hasNoUnstable: shallowCount === 0,
    hasFirm,
    shallowCount, floatingCount,
  }
}

/** @example measureFragrance(content) evaluates code attractiveness */
export function measureFragrance(content: string): FragranceMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const stenchMatches = content.match(/\bvar\s+/g)
  const stenchCount = stenchMatches ? stenchMatches.length : 0
  const repellentMatches = content.match(/\bany\b/g)
  const repellentCount = repellentMatches ? repellentMatches.length : 0

  const hasAromatic = hasExport && hasImport
  const hasAppealing = hasInterface && hasClass
  const hasInviting = hasTypeAlias && hasGenerics
  const hasAttractive = hasAsync && hasDocComments
  const hasPleasant = hasConst && hasReadonly
  const hasSweet = hasExport && hasClass

  let level = 0
  if (hasExport) level += 10
  if (hasImport) level += 10
  if (hasInterface) level += 8
  if (hasClass) level += 8
  if (hasTypeAlias) level += 8
  if (hasConst) level += 8
  if (hasAsync) level += 8
  if (hasGenerics) level += 10
  if (hasDocComments) level += 8
  if (hasReadonly) level += 8
  if (hasAromatic) level += 5
  if (hasAppealing) level += 5
  if (hasInviting) level += 5
  if (hasAttractive) level += 5
  if (hasPleasant) level += 5
  if (hasSweet) level += 5

  level = Math.min(100, Math.round(level))

  let scent: FragranceMeasure['scent'] = 'foul-odor'
  if (level >= 85) scent = 'intoxicating'
  else if (level >= 70) scent = 'heavenly-aroma'
  else if (level >= 55) scent = 'sweet-fragrance'
  else if (level >= 40) scent = 'faint-scent'
  else if (level >= 25) scent = 'no-fragrance'

  return {
    level, scent,
    hasHighLevel: level >= 70,
    hasAromatic, hasAppealing, hasNoStench: stenchCount === 0,
    hasInviting, hasNoRepellent: repellentCount === 0,
    hasAttractive, hasNoOffensive: stenchCount === 0 && repellentCount === 0,
    hasPleasant, hasNoBitter: stenchCount === 0,
    hasSweet,
    stenchCount, repellentCount,
  }
}

/** @example measureBlooming(content) evaluates code growth potential */
export function measureBlooming(content: string): BloomingMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)

  const stagnantMatches = content.match(/\bvar\s+/g)
  const stagnantCount = stagnantMatches ? stagnantMatches.length : 0
  const decliningMatches = content.match(/\bany\b/g)
  const decliningCount = decliningMatches ? decliningMatches.length : 0

  const hasGrowing = hasExport && hasConst
  const hasExpanding = hasReturnType && hasStrictEquality
  const hasThriving = hasOptionalChaining && hasDefaultParam
  const hasVigorous = hasInterface && hasTypeAlias
  const hasFlourishing = hasNamedExport && hasTypeAnnotation
  const hasSprouting = hasExport && hasReturnType

  let potential = 0
  if (hasExport) potential += 8
  if (hasConst) potential += 10
  if (hasReturnType) potential += 10
  if (hasStrictEquality) potential += 10
  if (hasOptionalChaining) potential += 8
  if (hasDefaultParam) potential += 8
  if (hasInterface) potential += 8
  if (hasTypeAlias) potential += 8
  if (hasNamedExport) potential += 8
  if (hasTypeAnnotation) potential += 8
  if (hasGrowing) potential += 5
  if (hasExpanding) potential += 5
  if (hasThriving) potential += 5
  if (hasVigorous) potential += 5
  if (hasFlourishing) potential += 5
  if (hasSprouting) potential += 5

  potential = Math.min(100, Math.round(potential))

  let stage: BloomingMeasure['stage'] = 'dead-branch'
  if (potential >= 85) stage = 'full-bloom'
  else if (potential >= 70) stage = 'opening-bud'
  else if (potential >= 55) stage = 'growing-shoot'
  else if (potential >= 40) stage = 'dormant-seed'
  else if (potential >= 25) stage = 'wilted-stem'

  return {
    potential, stage,
    hasHighPotential: potential >= 70,
    hasGrowing, hasExpanding, hasNoStagnant: stagnantCount === 0,
    hasThriving, hasNoDeclining: decliningCount === 0,
    hasVigorous, hasNoWithering: stagnantCount === 0 && decliningCount === 0,
    hasFlourishing, hasNoDying: stagnantCount === 0,
    hasSprouting,
    stagnantCount, decliningCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'master-garden' */
export function classifyCondition(score: number): GardenCondition {
  if (score >= 85) return 'master-garden'
  if (score >= 70) return 'flourishing-bed'
  if (score >= 55) return 'growing-garden'
  if (score >= 40) return 'wild-patch'
  if (score >= 25) return 'barren-soil'
  return 'dead-zone'
}

/** @example classifyBedType(petals) returns bed classification */
export function classifyBedType(petals: GardenPetal[]): BedType {
  if (petals.length === 0) return 'concrete-slab'
  const avgQs = petals.reduce((s, p) => s + p.qualityScore, 0) / petals.length
  const masterCount = petals.filter((p) => p.condition === 'master-garden').length
  const ratio = masterCount / petals.length
  if (avgQs >= 75 && ratio >= 0.5) return 'royal-garden'
  if (avgQs >= 60) return 'cottage-garden'
  if (avgQs >= 45) return 'window-box'
  if (avgQs >= 30) return 'plant-pot'
  if (avgQs >= 15) return 'weed-patch'
  return 'concrete-slab'
}

/** @example classifyBedCondition(avgQs) returns bed condition */
export function classifyBedCondition(avgQs: number): BedCondition {
  if (avgQs >= 75) return 'kew-gardens'
  if (avgQs >= 60) return 'well-tended'
  if (avgQs >= 45) return 'decent-plot'
  if (avgQs >= 30) return 'overgrown'
  if (avgQs >= 15) return 'neglected'
  return 'wasteland'
}

/** @example classifyGardenerGrade(80) returns 'master-gardener' */
export function classifyGardenerGrade(avgLushness: number): GardenerGrade {
  if (avgLushness >= 80) return 'master-gardener'
  if (avgLushness >= 65) return 'expert-horticulturist'
  if (avgLushness >= 50) return 'skilled-gardener'
  if (avgLushness >= 35) return 'apprentice'
  if (avgLushness >= 20) return 'novice'
  return 'black-thumb'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeGardenPetal(content, filePath) evaluates single file */
export function analyzeGardenPetal(content: string, filePath: string): GardenPetal {
  const softeningMeasure = measureSoftening(content)
  const petalMeasure = measurePetal(content)
  const rootingMeasure = measureRooting(content)
  const fragranceMeasure = measureFragrance(content)
  const bloomingMeasure = measureBlooming(content)

  const qualityScore = Math.round(
    softeningMeasure.softness * 0.2 +
    petalMeasure.quality * 0.2 +
    rootingMeasure.depth * 0.2 +
    fragranceMeasure.level * 0.2 +
    bloomingMeasure.potential * 0.2,
  )

  return {
    file: filePath,
    softness: softeningMeasure.softness,
    petalQuality: petalMeasure.quality,
    rootDepth: rootingMeasure.depth,
    fragranceLevel: fragranceMeasure.level,
    bloomPotential: bloomingMeasure.potential,
    softening: softeningMeasure,
    petal: petalMeasure,
    rooting: rootingMeasure,
    fragrance: fragranceMeasure,
    blooming: bloomingMeasure,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeGardenBed(petals, dirPath) evaluates directory */
export function analyzeGardenBed(petals: GardenPetal[], dirPath: string): GardenBed {
  if (petals.length === 0) {
    return {
      directory: dirPath, petals: [],
      avgSoftness: 0, avgDepth: 0, avgBloom: 0,
      masterGardenCount: 0, deadZoneCount: 0,
      bedType: 'concrete-slab', condition: 'wasteland',
    }
  }

  const avgSoftness = Math.round(petals.reduce((s, p) => s + p.softness, 0) / petals.length)
  const avgDepth = Math.round(petals.reduce((s, p) => s + p.rootDepth, 0) / petals.length)
  const avgBloom = Math.round(petals.reduce((s, p) => s + p.bloomPotential, 0) / petals.length)
  const masterGardenCount = petals.filter((p) => p.condition === 'master-garden').length
  const deadZoneCount = petals.filter((p) => p.condition === 'dead-zone').length
  const avgQs = petals.reduce((s, p) => s + p.qualityScore, 0) / petals.length

  return {
    directory: dirPath, petals,
    avgSoftness, avgDepth, avgBloom,
    masterGardenCount, deadZoneCount,
    bedType: classifyBedType(petals),
    condition: classifyBedCondition(avgQs),
  }
}

/** @example generateRecommendations(petals, beds, garden, stats) generates advice */
export function generateRecommendations(
  petals: GardenPetal[],
  beds: GardenBed[],
  garden: VelvetGarden,
  stats: VelvetGardenStats,
): string[] {
  const recs: string[] = []

  if (stats.avgSoftness < 50) {
    recs.push('Soften code with gentle patterns, clean exports, and smooth control flow')
  }
  if (stats.avgPetalQuality < 50) {
    recs.push('Beautify petals with elegant interfaces, vibrant classes, and colorful exports')
  }
  if (stats.avgRootDepth < 50) {
    recs.push('Deepen roots with strong type foundations, generics, and deep abstractions')
  }
  if (stats.avgFragranceLevel < 50) {
    recs.push('Enhance fragrance with aromatic imports, appealing patterns, and inviting structure')
  }
  if (stats.avgBloomPotential < 50) {
    recs.push('Boost bloom potential with growing patterns, expanding types, and thriving exports')
  }
  if (stats.deadZoneCount > 0) {
    recs.push(`${String(stats.deadZoneCount)} file(s) in dead zone — consider significant refactoring`)
  }
  if (garden.overallLushness < 40) {
    recs.push('Overall lushness is low — focus on softening code and deepening root foundations')
  }
  if (beds.length > 0 && beds.every((b) => b.bedType === 'concrete-slab' || b.bedType === 'weed-patch')) {
    recs.push('All garden beds are barren — consider a major quality improvement effort')
  }

  const deadFiles = petals.filter((p) => p.condition === 'dead-zone')
  if (deadFiles.length > 0 && deadFiles.length <= 3) {
    const names = deadFiles.map((p) => p.file).join(', ')
    recs.push(`Revitalize these dead-zone files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your velvet garden is in full bloom! Every petal radiates beauty and grace')
  }

  return Array.from(new Set(recs))
}

/** @example buildVelvetGardenResult(files, contents, options) orchestrates analysis */
export function buildVelvetGardenResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): VelvetGardenResult {
  const petals = files.map((file, i) => analyzeGardenPetal(contents[i] ?? '', file))

  const bMap = new Map<string, GardenPetal[]>()
  for (const petal of petals) {
    const dir = petal.file.includes('/') ? petal.file.split('/').slice(0, -1).join('/') : '.'
    const existing = bMap.get(dir)
    if (existing) {
      existing.push(petal)
    } else {
      bMap.set(dir, [petal])
    }
  }

  const beds = Array.from(bMap.entries()).map(([dir, dirPetals]) =>
    analyzeGardenBed(dirPetals, dir),
  )

  const totalFiles = petals.length
  const avgSoftness = totalFiles > 0 ? Math.round(petals.reduce((s, p) => s + p.softness, 0) / totalFiles) : 0
  const avgPetalQuality = totalFiles > 0 ? Math.round(petals.reduce((s, p) => s + p.petalQuality, 0) / totalFiles) : 0
  const avgRootDepth = totalFiles > 0 ? Math.round(petals.reduce((s, p) => s + p.rootDepth, 0) / totalFiles) : 0
  const avgFragranceLevel = totalFiles > 0 ? Math.round(petals.reduce((s, p) => s + p.fragranceLevel, 0) / totalFiles) : 0
  const avgBloomPotential = totalFiles > 0 ? Math.round(petals.reduce((s, p) => s + p.bloomPotential, 0) / totalFiles) : 0

  const overallLushness = totalFiles > 0
    ? Math.round((avgSoftness + avgRootDepth + avgBloomPotential) / 3)
    : 0

  const gardenData: VelvetGarden = {
    avgSoftness,
    avgDepth: avgRootDepth,
    avgBloom: avgBloomPotential,
    isFlourishing: avgSoftness >= 60,
    overallLushness,
  }

  const bestPetal = totalFiles > 0
    ? petals.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best), petals[0]).file
    : ''
  const softest = totalFiles > 0
    ? petals.reduce((best, p) => (p.softness > best.softness ? p : best), petals[0]).file
    : ''
  const mostBeautiful = totalFiles > 0
    ? petals.reduce((best, p) => (p.petalQuality > best.petalQuality ? p : best), petals[0]).file
    : ''
  const deepestRooted = totalFiles > 0
    ? petals.reduce((best, p) => (p.rootDepth > best.rootDepth ? p : best), petals[0]).file
    : ''
  const mostFragrant = totalFiles > 0
    ? petals.reduce((best, p) => (p.fragranceLevel > best.fragranceLevel ? p : best), petals[0]).file
    : ''

  const stats: VelvetGardenStats = {
    totalFiles,
    totalBeds: beds.length,
    avgSoftness, avgPetalQuality, avgRootDepth,
    avgFragranceLevel, avgBloomPotential,
    masterGardenCount: petals.filter((p) => p.condition === 'master-garden').length,
    flourishingBedCount: petals.filter((p) => p.condition === 'flourishing-bed').length,
    growingGardenCount: petals.filter((p) => p.condition === 'growing-garden').length,
    wildPatchCount: petals.filter((p) => p.condition === 'wild-patch').length,
    barrenSoilCount: petals.filter((p) => p.condition === 'barren-soil').length,
    deadZoneCount: petals.filter((p) => p.condition === 'dead-zone').length,
    hasHighSoftnessCount: petals.filter((p) => p.softening.hasHighSoftness).length,
    hasHighQualityCount: petals.filter((p) => p.petal.hasHighQuality).length,
    hasHighDepthCount: petals.filter((p) => p.rooting.hasHighDepth).length,
    hasHighLevelCount: petals.filter((p) => p.fragrance.hasHighLevel).length,
    hasHighPotentialCount: petals.filter((p) => p.blooming.hasHighPotential).length,
    overallLushness,
    gardenerGrade: classifyGardenerGrade(overallLushness),
    bestPetal, softest, mostBeautiful, deepestRooted, mostFragrant,
  }

  const recommendations = generateRecommendations(petals, beds, gardenData, stats)

  return { petals, beds, garden: gardenData, stats, recommendations }
}
