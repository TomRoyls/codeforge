// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface PreciousMeasure {
  value: number
  grade: 'imperial-jade' | 'gem-quality' | 'fine-stone' | 'commercial-grade' | 'industrial' | 'aggregate'
  hasHighValue: boolean
  hasRare: boolean
  hasImperial: boolean
  hasNoFlaws: boolean
  hasProperCut: boolean
  hasInclusions: boolean
  hasNoCracks: boolean
  hasHighTransparency: boolean
  hasProperWeight: boolean
  hasNoWaste: boolean
  flawCount: number
  crackCount: number
}

export interface DurableMeasure {
  strength: number
  hardness: 'diamond-hard' | 'corundum-tough' | 'jade-resilient' | 'quartz-steady' | 'calcite-soft' | 'talc-fragile'
  hasHighStrength: boolean
  hasResistant: boolean
  hasNoWeathering: boolean
  hasTough: boolean
  hasNoChipping: boolean
  hasPolish: boolean
  hasNoScratching: boolean
  hasSolid: boolean
  hasNoErosion: boolean
  hasImpervious: boolean
  weatheringCount: number
  chippingCount: number
}

export interface LustrousMeasure {
  quality: number
  shine: 'brilliant-luster' | 'vitreous-shine' | 'pearly-glow' | 'silky-sheen' | 'dull' | 'earthy'
  hasHighQuality: boolean
  hasReflective: boolean
  hasNoCloudiness: boolean
  hasBright: boolean
  hasNoDullness: boolean
  hasGlossy: boolean
  hasNoFogginess: boolean
  hasRadiant: boolean
  hasNoMurkiness: boolean
  hasShimmering: boolean
  cloudinessCount: number
  fogginessCount: number
}

export interface FacetedMeasure {
  complexity: number
  cut: 'brilliant-cut' | 'emerald-cut' | 'princess-cut' | 'cabochon' | 'rough' | 'uncut'
  hasHighComplexity: boolean
  hasWellFaceted: boolean
  hasProperAngles: boolean
  hasNoMisaligned: boolean
  hasSymmetrical: boolean
  hasNoAsymmetry: boolean
  hasPrecise: boolean
  hasNoRoughness: boolean
  hasRefined: boolean
  hasNoAmateur: boolean
  misalignedCount: number
  roughnessCount: number
}

export interface ClarityMeasure {
  value: number
  grade: 'flawless' | 'vvs' | 'vs' | 'si' | 'i' | 'opaque'
  hasHighValue: boolean
  hasTransparent: boolean
  hasNoInclusions: boolean
  hasClean: boolean
  hasNoSpecks: boolean
  hasPure: boolean
  hasNoFeathers: boolean
  hasClear: boolean
  hasNoVeils: boolean
  hasCrystal: boolean
  inclusionCount: number
  featherCount: number
}

export interface CarvingMeasure {
  quality: number
  skill: 'master-carver' | 'expert-artisan' | 'skilled-craftsman' | 'apprentice' | 'novice' | 'machine-cut'
  hasHighQuality: boolean
  hasIntricate: boolean
  hasDetailed: boolean
  hasNoRough: boolean
  hasFine: boolean
  hasProperFinish: boolean
  hasNoToolMarks: boolean
  hasElegant: boolean
  hasNoClumsy: boolean
  hasMasterful: boolean
  roughCount: number
  toolMarkCount: number
}

export interface Gemstone {
  file: string
  preciousness: number
  durability: number
  luster: number
  facetCount: number
  clarityValue: number
  carvingQuality: number
  precious: PreciousMeasure
  durable: DurableMeasure
  lustrous: LustrousMeasure
  faceted: FacetedMeasure
  clarity: ClarityMeasure
  carving: CarvingMeasure
  condition: 'masterpiece' | 'fine-gem' | 'quality-stone' | 'commercial' | 'industrial-grade' | 'raw-stone'
  qualityScore: number
}

export interface GemstoneCollection {
  directory: string
  gemstones: Gemstone[]
  avgPreciousness: number
  avgDurability: number
  avgCarvingQuality: number
  masterpieceCount: number
  rawStoneCount: number
  fineGemCount: number
  qualityStoneCount: number
  collectionType: 'imperial-collection' | 'treasure-vault' | 'jewelry-box' | 'gem-pouch' | 'quarry-tailings' | 'gravel'
  condition: 'crown-jewels' | 'precious-collection' | 'valuable-hoard' | 'modest-collection' | 'scattered-stones' | 'rubble'
}

export interface JadeEmeraldResult {
  gemstones: Gemstone[]
  collections: GemstoneCollection[]
  treasure: {
    avgPreciousness: number
    avgDurability: number
    avgCarvingQuality: number
    isPrecious: boolean
    overallTreasureValue: number
  }
  stats: {
    totalFiles: number
    totalCollections: number
    avgPreciousness: number
    avgDurability: number
    avgLuster: number
    avgFacetCount: number
    avgClarityValue: number
    avgCarvingQuality: number
    masterpieceCount: number
    fineGemCount: number
    qualityStoneCount: number
    commercialCount: number
    industrialGradeCount: number
    rawStoneCount: number
    hasHighValueCount: number
    hasHighStrengthCount: number
    hasHighQualityCount: number
    hasHighComplexityCount: number
    hasHighClarityCount: number
    hasHighCraftsmanshipCount: number
    overallTreasureValue: number
    lapidaryGrade: 'grand-lapidary' | 'master-gemcutter' | 'expert-cutter' | 'skilled-artisan' | 'apprentice-cutter' | 'rock-tumbler'
    bestGemstone: string
    mostPrecious: string
    mostDurable: string
    mostLustrous: string
    mostFaceted: string
    clearest: string
    bestCarved: string
  }
  recommendations: string[]
}

// ─── measurePrecious ─────────────────────────────────────────────────────────

/** @example measurePrecious(content) returns PreciousMeasure */
export function measurePrecious(content: string): PreciousMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasClasses = /\bclass\s+\w+/.test(content)
  const hasFunctions = /\bfunction\s+\w+/.test(content) || /=>\s*[{(]/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasPrivate = /\bprivate\b/.test(content) || /\bprotected\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasStatic = /\bstatic\b/.test(content)

  const flawCount = hasContent ? (/\bany\b/.test(content) ? 1 : 0) + (/\beval\s*\(/.test(content) ? 1 : 0) : 0
  const crackCount = hasContent ? (/\bconsole\.log\s*\(/.test(content) ? 1 : 0) + (/\bdebugger\b/.test(content) ? 1 : 0) : 0

  let score = 0
  if (hasContent) score += 30
  if (hasTypes) score += 8
  if (hasInterfaces) score += 8
  if (hasClasses) score += 7
  if (hasFunctions) score += 5
  if (hasAsync && hasAwait) score += 6
  if (hasGenerics) score += 6
  if (hasPrivate) score += 5
  if (hasReadonly) score += 5
  if (hasStatic) score += 3
  score -= flawCount * 3
  score -= crackCount * 2

  const value = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighValue = value >= 80
  const hasRare = hasGenerics && hasAsync
  const hasImperial = hasInterfaces && hasTypes && hasClasses
  const hasNoFlaws = flawCount === 0
  const hasProperCut = hasFunctions || hasClasses
  const hasInclusions = hasInterfaces || hasTypes
  const hasNoCracks = crackCount === 0
  const hasHighTransparency = !/\bany\b/.test(content)
  const hasProperWeight = hasContent
  const hasNoWaste = flawCount === 0 && crackCount === 0

  let grade: PreciousMeasure['grade'] = 'aggregate'
  if (value >= 90) grade = 'imperial-jade'
  else if (value >= 75) grade = 'gem-quality'
  else if (value >= 60) grade = 'fine-stone'
  else if (value >= 45) grade = 'commercial-grade'
  else if (value >= 30) grade = 'industrial'

  return { value, grade, hasHighValue, hasRare, hasImperial, hasNoFlaws, hasProperCut, hasInclusions, hasNoCracks, hasHighTransparency, hasProperWeight, hasNoWaste, flawCount, crackCount }
}

// ─── measureDurable ──────────────────────────────────────────────────────────

/** @example measureDurable(content) returns DurableMeasure */
export function measureDurable(content: string): DurableMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasTryCatch = /\btry\s*\{/.test(content) && /\bcatch\b/.test(content)
  const hasFinally = /\bfinally\s*\{/.test(content)
  const hasErrorTypes = /\bError\b/.test(content) || /\bthrow\b/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content) || /\?\.\[/.test(content)
  const hasDefaultParams = /\(\s*\w+\s*=\s*/.test(content)
  const hasFallbackValues = /\|\|/.test(content) || /\?\?/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasAwait = /\bawait\b/.test(content)
  const hasPromiseAll = /\bPromise\.all\b/.test(content) || /\bPromise\.allSettled\b/.test(content)
  const hasCleanup = hasFinally || /\bdispose\b/.test(content) || /\bclose\b/.test(content)
  const hasRetry = /\bretry\b/i.test(content) || /\btimeout\b/i.test(content)

  const weatheringCount = hasContent ? (hasTryCatch ? 0 : 1) + (hasAsync && !hasTryCatch ? 1 : 0) : 0
  const chippingCount = hasContent ? (/\bany\b/.test(content) ? 1 : 0) + (!hasErrorTypes && hasContent ? 1 : 0) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasTryCatch) score += 12
  if (hasFinally) score += 5
  if (hasErrorTypes) score += 8
  if (hasNullishCoalescing) score += 5
  if (hasOptionalChaining) score += 5
  if (hasDefaultParams) score += 5
  if (hasFallbackValues) score += 5
  if (hasAsync && hasAwait) score += 5
  if (hasPromiseAll) score += 5
  if (hasCleanup) score += 5
  if (hasRetry) score += 5
  score -= weatheringCount * 3
  score -= chippingCount * 3

  const strength = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighStrength = strength >= 80
  const hasResistant = hasTryCatch
  const hasNoWeathering = weatheringCount === 0
  const hasTough = hasErrorTypes
  const hasNoChipping = chippingCount === 0
  const hasPolish = hasFinally || hasCleanup
  const hasNoScratching = !/\bany\b/.test(content)
  const hasSolid = hasNullishCoalescing || hasFallbackValues
  const hasNoErosion = chippingCount === 0
  const hasImpervious = weatheringCount === 0 && chippingCount === 0

  let hardness: DurableMeasure['hardness'] = 'talc-fragile'
  if (strength >= 90) hardness = 'diamond-hard'
  else if (strength >= 75) hardness = 'corundum-tough'
  else if (strength >= 60) hardness = 'jade-resilient'
  else if (strength >= 45) hardness = 'quartz-steady'
  else if (strength >= 30) hardness = 'calcite-soft'

  return { strength, hardness, hasHighStrength, hasResistant, hasNoWeathering, hasTough, hasNoChipping, hasPolish, hasNoScratching, hasSolid, hasNoErosion, hasImpervious, weatheringCount, chippingCount }
}

// ─── measureLustrous ─────────────────────────────────────────────────────────

/** @example measureLustrous(content) returns LustrousMeasure */
export function measureLustrous(content: string): LustrousMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasJsDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInlineComments = /\/\/.*$/.test(content)
  const hasTypeAnnotations = /:\s*(string|number|boolean|void|never|unknown)\b/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasDescriptiveNames = /\b(get|set|is|has|can|should|will|handle|process|validate|transform|create|build|parse|format)\w*\s*\(/.test(content)
  const hasReturnTypes = /\)\s*:\s*\w/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasProperFunctions = /\bfunction\s+\w+/.test(content) || /const\s+\w+\s*=\s*(\([^)]*\)|[^=])\s*=>/.test(content)
  const hasNoAny = !/\bany\b/.test(content)

  const cloudinessCount = hasContent ? (hasJsDoc ? 0 : 1) + (hasInlineComments ? 0 : 1) : 0
  const fogginessCount = hasContent ? (/\bany\b/.test(content) ? 1 : 0) + (/\beval\s*\(/.test(content) ? 1 : 0) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasJsDoc) score += 12
  if (hasInlineComments) score += 5
  if (hasTypeAnnotations) score += 8
  if (hasInterfaces) score += 8
  if (hasTypes) score += 5
  if (hasDescriptiveNames) score += 8
  if (hasReturnTypes) score += 8
  if (hasExports) score += 5
  if (hasImports) score += 4
  if (hasProperFunctions) score += 5
  if (hasNoAny) score += 3
  score -= cloudinessCount * 3
  score -= fogginessCount * 2

  const quality = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighQuality = quality >= 80
  const hasReflective = hasJsDoc || hasInlineComments
  const hasNoCloudiness = cloudinessCount === 0
  const hasBright = hasTypeAnnotations && (hasInterfaces || hasTypes)
  const hasNoDullness = hasDescriptiveNames
  const hasGlossy = hasJsDoc && hasTypeAnnotations
  const hasNoFogginess = fogginessCount === 0
  const hasRadiant = hasExports && hasImports
  const hasNoMurkiness = !/\beval\s*\(/.test(content)
  const hasShimmering = hasProperFunctions && hasNoAny

  let shine: LustrousMeasure['shine'] = 'earthy'
  if (quality >= 90) shine = 'brilliant-luster'
  else if (quality >= 75) shine = 'vitreous-shine'
  else if (quality >= 60) shine = 'pearly-glow'
  else if (quality >= 45) shine = 'silky-sheen'
  else if (quality >= 30) shine = 'dull'

  return { quality, shine, hasHighQuality, hasReflective, hasNoCloudiness, hasBright, hasNoDullness, hasGlossy, hasNoFogginess, hasRadiant, hasNoMurkiness, hasShimmering, cloudinessCount, fogginessCount }
}

// ─── measureFaceted ──────────────────────────────────────────────────────────

/** @example measureFaceted(content) returns FacetedMeasure */
export function measureFaceted(content: string): FacetedMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasConsistentQuotes = hasContent ? (() => {
    const single = (content.match(/'/g) || []).length
    const double = (content.match(/"/g) || []).length
    return single === 0 || double === 0 || single / double > 3 || double / single > 3
  })() : true
  const hasConsistentSemicolons = hasContent ? (() => {
    const withSemi = nonEmpty.filter((l) => l.trim().endsWith(';')).length
    const withoutSemi = nonEmpty.length - withSemi
    return withSemi === 0 || withoutSemi === 0 || withSemi / withoutSemi > 3 || withoutSemi / withSemi > 3
  })() : true
  const hasExports = /\bexport\b/.test(content)
  const hasNamedExports = /export\s+(const|let|function|class|interface|type|enum)\s+\w+/.test(content)
  const hasImports = /\bimport\b/.test(content)
  const hasConsistentIndentation = hasContent ? (() => {
    const spaceIndent = nonEmpty.filter((l) => /^ {2,}/.test(l)).length
    const tabIndent = nonEmpty.filter((l) => /^\t/.test(l)).length
    return spaceIndent === 0 || tabIndent === 0
  })() : true
  const hasModules = hasImports || hasExports

  const misalignedCount = hasContent ? (hasConsistentQuotes ? 0 : 1) + (hasConsistentSemicolons ? 0 : 1) : 0
  const roughnessCount = hasContent ? (hasConsistentIndentation ? 0 : 1) + (hasModules ? 0 : 1) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasConsistentQuotes) score += 8
  if (hasConsistentSemicolons) score += 8
  if (hasExports) score += 8
  if (hasNamedExports) score += 8
  if (hasImports) score += 6
  if (hasConsistentIndentation) score += 8
  if (hasModules) score += 5
  score -= misalignedCount * 4
  score -= roughnessCount * 4

  const complexity = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighComplexity = complexity >= 80
  const hasWellFaceted = hasConsistentQuotes && hasConsistentSemicolons
  const hasProperAngles = hasConsistentIndentation
  const hasNoMisaligned = misalignedCount === 0
  const hasSymmetrical = hasNamedExports && hasImports
  const hasNoAsymmetry = roughnessCount === 0
  const hasPrecise = misalignedCount === 0 && roughnessCount === 0
  const hasNoRoughness = roughnessCount === 0
  const hasRefined = hasConsistentQuotes && hasConsistentSemicolons && hasConsistentIndentation
  const hasNoAmateur = misalignedCount === 0 && roughnessCount === 0

  let cut: FacetedMeasure['cut'] = 'uncut'
  if (complexity >= 90) cut = 'brilliant-cut'
  else if (complexity >= 75) cut = 'emerald-cut'
  else if (complexity >= 60) cut = 'princess-cut'
  else if (complexity >= 45) cut = 'cabochon'
  else if (complexity >= 30) cut = 'rough'

  return { complexity, cut, hasHighComplexity, hasWellFaceted, hasProperAngles, hasNoMisaligned, hasSymmetrical, hasNoAsymmetry, hasPrecise, hasNoRoughness, hasRefined, hasNoAmateur, misalignedCount, roughnessCount }
}

// ─── measureClarity ──────────────────────────────────────────────────────────

/** @example measureClarity(content) returns ClarityMeasure */
export function measureClarity(content: string): ClarityMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasImports = /\bimport\b/.test(content)
  const hasNamedImports = /import\s*\{/.test(content)
  const hasTypeImports = /import\s+type\s+/.test(content) || /import\s*\{[^}]*(?:type\s+\w)/.test(content)
  const hasReExports = /export\s*\{/.test(content) || /export\s+\*\s+from/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasClasses = /\bclass\s+\w+/.test(content)
  const hasErrorHandling = /\btry\s*\{/.test(content) && /\bcatch\b/.test(content)
  const hasConfigPatterns = /\bconfig\b|\benv\b|\bConfig\b/.test(content)
  const hasDiPatterns = /\binject\b|\bInjectable\b|\binjectable\b/.test(content)
  const hasPrivateMembers = /\bprivate\b/.test(content) || /\bprotected\b/.test(content)

  const inclusionCount = hasContent ? (hasErrorHandling ? 0 : 1) + (hasPrivateMembers || hasInterfaces ? 0 : 1) : 0
  const featherCount = hasContent ? (hasImports ? 0 : 1) + (hasConfigPatterns || hasDiPatterns ? 0 : 1) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasImports) score += 8
  if (hasNamedImports) score += 6
  if (hasTypeImports) score += 5
  if (hasReExports) score += 5
  if (hasInterfaces) score += 8
  if (hasClasses) score += 5
  if (hasErrorHandling) score += 8
  if (hasConfigPatterns) score += 5
  if (hasDiPatterns) score += 5
  if (hasPrivateMembers) score += 5
  score -= inclusionCount * 3
  score -= featherCount * 3

  const value = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighValue = value >= 80
  const hasTransparent = hasImports && hasInterfaces
  const hasNoInclusions = inclusionCount === 0
  const hasClean = hasErrorHandling
  const hasNoSpecks = !/\bany\b/.test(content)
  const hasPure = hasNamedImports || hasTypeImports
  const hasNoFeathers = featherCount === 0
  const hasClear = hasInterfaces || /\btype\s+\w+\s*=/.test(content)
  const hasNoVeils = !/\beval\s*\(/.test(content)
  const hasCrystal = hasImports && hasErrorHandling && hasInterfaces

  let clarityGrade: ClarityMeasure['grade'] = 'opaque'
  if (value >= 90) clarityGrade = 'flawless'
  else if (value >= 75) clarityGrade = 'vvs'
  else if (value >= 60) clarityGrade = 'vs'
  else if (value >= 45) clarityGrade = 'si'
  else if (value >= 30) clarityGrade = 'i'

  return { value, grade: clarityGrade, hasHighValue, hasTransparent, hasNoInclusions, hasClean, hasNoSpecks, hasPure, hasNoFeathers, hasClear, hasNoVeils, hasCrystal, inclusionCount, featherCount }
}

// ─── measureCarving ──────────────────────────────────────────────────────────

/** @example measureCarving(content) returns CarvingMeasure */
export function measureCarving(content: string): CarvingMeasure {
  const lines = content.split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const hasContent = nonEmpty.length > 0

  const hasExports = /\bexport\b/.test(content)
  const hasInterfaces = /\binterface\s+\w+/.test(content)
  const hasTypes = /\btype\s+\w+\s*=/.test(content)
  const hasClasses = /\bclass\s+\w+/.test(content)
  const hasAsync = /\basync\b/.test(content)
  const hasDocs = /\/\*\*/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content) && /\bcatch\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasConst = /\bconst\b/.test(content)
  const hasNoLet = !/\blet\b/.test(content)
  const hasNoVar = !/\bvar\b/.test(content)

  const roughCount = hasContent ? (hasDocs ? 0 : 1) + (hasReadonly || hasConst ? 0 : 1) : 0
  const toolMarkCount = hasContent ? (hasTryCatch ? 0 : 1) + (/\bany\b/.test(content) ? 1 : 0) : 0

  let score = 0
  if (hasContent) score += 25
  if (hasExports) score += 8
  if (hasInterfaces) score += 8
  if (hasTypes) score += 5
  if (hasClasses) score += 5
  if (hasAsync) score += 8
  if (hasDocs) score += 8
  if (hasTryCatch) score += 8
  if (hasReadonly) score += 5
  if (hasConst) score += 3
  if (hasNoLet && hasNoVar) score += 5
  score -= roughCount * 3
  score -= toolMarkCount * 4

  const quality = Math.max(0, Math.min(100, Math.round(score)))
  const hasHighQuality = quality >= 80
  const hasIntricate = hasExports && (hasInterfaces || hasTypes)
  const hasDetailed = hasAsync || hasClasses
  const hasNoRough = roughCount === 0
  const hasFine = hasTryCatch || hasDocs
  const hasProperFinish = hasReadonly || (hasConst && hasNoLet)
  const hasNoToolMarks = toolMarkCount === 0
  const hasElegant = hasExports && hasDocs
  const hasNoClumsy = toolMarkCount === 0 && roughCount === 0
  const hasMasterful = hasExports && hasDocs && hasTryCatch

  let skill: CarvingMeasure['skill'] = 'machine-cut'
  if (quality >= 90) skill = 'master-carver'
  else if (quality >= 75) skill = 'expert-artisan'
  else if (quality >= 60) skill = 'skilled-craftsman'
  else if (quality >= 45) skill = 'apprentice'
  else if (quality >= 30) skill = 'novice'

  return { quality, skill, hasHighQuality, hasIntricate, hasDetailed, hasNoRough, hasFine, hasProperFinish, hasNoToolMarks, hasElegant, hasNoClumsy, hasMasterful, roughCount, toolMarkCount }
}

// ─── analyzeGemstone ─────────────────────────────────────────────────────────

/** @example analyzeGemstone(content, filePath) returns Gemstone */
export function analyzeGemstone(content: string, filePath: string): Gemstone {
  const precious = measurePrecious(content)
  const durable = measureDurable(content)
  const lustrous = measureLustrous(content)
  const faceted = measureFaceted(content)
  const clarity = measureClarity(content)
  const carving = measureCarving(content)

  const preciousness = precious.value
  const durability = durable.strength
  const luster = lustrous.quality
  const facetCount = faceted.complexity
  const clarityValue = clarity.value
  const carvingQuality = carving.quality

  const qualityScore = Math.round(
    preciousness * 0.2 +
    durability * 0.15 +
    luster * 0.15 +
    facetCount * 0.15 +
    clarityValue * 0.15 +
    carvingQuality * 0.2,
  )

  const condition = classifyGemstoneCondition(qualityScore)

  return {
    file: filePath, preciousness, durability, luster, facetCount, clarityValue, carvingQuality,
    precious, durable, lustrous, faceted, clarity, carving, condition, qualityScore,
  }
}

// ─── classifyGemstoneCondition ───────────────────────────────────────────────

/** @example classifyGemstoneCondition(score) returns condition string */
export function classifyGemstoneCondition(score: number): Gemstone['condition'] {
  if (score >= 90) return 'masterpiece'
  if (score >= 75) return 'fine-gem'
  if (score >= 60) return 'quality-stone'
  if (score >= 45) return 'commercial'
  if (score >= 30) return 'industrial-grade'
  return 'raw-stone'
}

// ─── classifyCollectionType ──────────────────────────────────────────────────

/** @example classifyCollectionType(gemstones) returns collection type string */
export function classifyCollectionType(gemstones: Gemstone[]): GemstoneCollection['collectionType'] {
  if (gemstones.length === 0) return 'gravel'
  const avg = gemstones.reduce((s, g) => s + g.qualityScore, 0) / gemstones.length
  const masterpieces = gemstones.filter((g) => g.condition === 'masterpiece').length
  const ratio = masterpieces / gemstones.length

  if (avg >= 80 && ratio >= 0.5) return 'imperial-collection'
  if (avg >= 70) return 'treasure-vault'
  if (avg >= 55) return 'jewelry-box'
  if (avg >= 40) return 'gem-pouch'
  if (avg >= 25) return 'quarry-tailings'
  return 'gravel'
}

// ─── analyzeGemstoneCollection ───────────────────────────────────────────────

/** @example analyzeGemstoneCollection(gemstones, dirPath) returns GemstoneCollection */
export function analyzeGemstoneCollection(gemstones: Gemstone[], dirPath: string): GemstoneCollection {
  if (gemstones.length === 0) {
    return { directory: dirPath, gemstones, avgPreciousness: 0, avgDurability: 0, avgCarvingQuality: 0, masterpieceCount: 0, rawStoneCount: 0, fineGemCount: 0, qualityStoneCount: 0, collectionType: 'gravel', condition: 'rubble' }
  }

  const avgPreciousness = Math.round(gemstones.reduce((s, g) => s + g.preciousness, 0) / gemstones.length)
  const avgDurability = Math.round(gemstones.reduce((s, g) => s + g.durability, 0) / gemstones.length)
  const avgCarvingQuality = Math.round(gemstones.reduce((s, g) => s + g.carvingQuality, 0) / gemstones.length)
  const masterpieceCount = gemstones.filter((g) => g.condition === 'masterpiece').length
  const rawStoneCount = gemstones.filter((g) => g.condition === 'raw-stone').length
  const fineGemCount = gemstones.filter((g) => g.condition === 'fine-gem').length
  const qualityStoneCount = gemstones.filter((g) => g.condition === 'quality-stone').length

  const collectionType = classifyCollectionType(gemstones)
  const overallAvg = Math.round(gemstones.reduce((s, g) => s + g.qualityScore, 0) / gemstones.length)

  let condition: GemstoneCollection['condition'] = 'rubble'
  if (overallAvg >= 80) condition = 'crown-jewels'
  else if (overallAvg >= 65) condition = 'precious-collection'
  else if (overallAvg >= 50) condition = 'valuable-hoard'
  else if (overallAvg >= 35) condition = 'modest-collection'
  else if (overallAvg >= 20) condition = 'scattered-stones'

  return { directory: dirPath, gemstones, avgPreciousness, avgDurability, avgCarvingQuality, masterpieceCount, rawStoneCount, fineGemCount, qualityStoneCount, collectionType, condition }
}

// ─── classifyLapidaryGrade ───────────────────────────────────────────────────

/** @example classifyLapidaryGrade(85) returns 'grand-lapidary' */
export function classifyLapidaryGrade(avgTreasure: number): JadeEmeraldResult['stats']['lapidaryGrade'] {
  if (avgTreasure >= 80) return 'grand-lapidary'
  if (avgTreasure >= 65) return 'master-gemcutter'
  if (avgTreasure >= 50) return 'expert-cutter'
  if (avgTreasure >= 35) return 'skilled-artisan'
  if (avgTreasure >= 20) return 'apprentice-cutter'
  return 'rock-tumbler'
}

// ─── generateRecommendations ─────────────────────────────────────────────────

/** @example generateRecommendations(gemstones, collections, treasure, stats) returns string[] */
export function generateRecommendations(
  gemstones: Gemstone[],
  collections: GemstoneCollection[],
  treasure: JadeEmeraldResult['treasure'],
  stats: JadeEmeraldResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgPreciousness < 50) recs.push('Increase preciousness — improve code value with types, interfaces, and modern patterns')
  if (stats.avgDurability < 50) recs.push('Enhance durability — add error handling and recovery mechanisms')
  if (stats.avgLuster < 50) recs.push('Improve luster — enhance documentation and code clarity')
  if (stats.avgFacetCount < 50) recs.push('Refine facets — improve code style consistency and module structure')
  if (stats.avgClarityValue < 50) recs.push('Increase clarity value — improve dependency management and infrastructure')
  if (stats.avgCarvingQuality < 50) recs.push('Improve carving quality — enhance code craftsmanship with exports, docs, and error handling')
  if (stats.rawStoneCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of files are raw stone — consider major code polishing')
  if (stats.industrialGradeCount > 0) recs.push('Warning: industrial-grade files detected — these need immediate refinement')
  if (treasure.overallTreasureValue < 40) recs.push('Overall treasure value is critically low — establish a code quality improvement regimen')
  if (collections.length > 0 && collections.every((c) => c.condition === 'rubble')) recs.push('All collections are rubble — your codebase needs fundamental lapidary work')

  if (gemstones.length > 0) {
    const highFlaws = gemstones.filter((g) => g.precious.flawCount > 2)
    if (highFlaws.length > gemstones.length * 0.5) recs.push('Over 50% of gemstones have high flaw count — reduce `any` and `eval` usage')
  }

  return recs
}

// ─── buildJadeEmeraldResult ──────────────────────────────────────────────────

/** @example buildJadeEmeraldResult(files, contents, options) returns full result */
export function buildJadeEmeraldResult(files: string[], contents: string[], _options?: Record<string, unknown>): JadeEmeraldResult {
  const gemstones = files.map((file, i) => analyzeGemstone(contents[i] ?? '', file))

  const collectionMap = new Map<string, Gemstone[]>()
  gemstones.forEach((g) => {
    const parts = g.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = collectionMap.get(dir)
    if (existing) existing.push(g)
    else collectionMap.set(dir, [g])
  })

  const collections = Array.from(collectionMap.entries()).map(([dir, gs]) => analyzeGemstoneCollection(gs, dir))

  const avgPreciousness = gemstones.length > 0 ? Math.round(gemstones.reduce((s, g) => s + g.preciousness, 0) / gemstones.length) : 0
  const avgDurability = gemstones.length > 0 ? Math.round(gemstones.reduce((s, g) => s + g.durability, 0) / gemstones.length) : 0
  const avgLuster = gemstones.length > 0 ? Math.round(gemstones.reduce((s, g) => s + g.luster, 0) / gemstones.length) : 0
  const avgFacetCount = gemstones.length > 0 ? Math.round(gemstones.reduce((s, g) => s + g.facetCount, 0) / gemstones.length) : 0
  const avgClarityValue = gemstones.length > 0 ? Math.round(gemstones.reduce((s, g) => s + g.clarityValue, 0) / gemstones.length) : 0
  const avgCarvingQuality = gemstones.length > 0 ? Math.round(gemstones.reduce((s, g) => s + g.carvingQuality, 0) / gemstones.length) : 0

  const overallTreasureValue = Math.round(
    avgPreciousness * 0.2 +
    avgDurability * 0.15 +
    avgLuster * 0.15 +
    avgFacetCount * 0.15 +
    avgClarityValue * 0.15 +
    avgCarvingQuality * 0.2,
  )

  const treasure = {
    avgPreciousness,
    avgDurability,
    avgCarvingQuality,
    isPrecious: overallTreasureValue >= 70,
    overallTreasureValue,
  }

  const stats = {
    totalFiles: files.length,
    totalCollections: collections.length,
    avgPreciousness, avgDurability, avgLuster, avgFacetCount, avgClarityValue, avgCarvingQuality,
    masterpieceCount: gemstones.filter((g) => g.condition === 'masterpiece').length,
    fineGemCount: gemstones.filter((g) => g.condition === 'fine-gem').length,
    qualityStoneCount: gemstones.filter((g) => g.condition === 'quality-stone').length,
    commercialCount: gemstones.filter((g) => g.condition === 'commercial').length,
    industrialGradeCount: gemstones.filter((g) => g.condition === 'industrial-grade').length,
    rawStoneCount: gemstones.filter((g) => g.condition === 'raw-stone').length,
    hasHighValueCount: gemstones.filter((g) => g.precious.hasHighValue).length,
    hasHighStrengthCount: gemstones.filter((g) => g.durable.hasHighStrength).length,
    hasHighQualityCount: gemstones.filter((g) => g.lustrous.hasHighQuality).length,
    hasHighComplexityCount: gemstones.filter((g) => g.faceted.hasHighComplexity).length,
    hasHighClarityCount: gemstones.filter((g) => g.clarity.hasHighValue).length,
    hasHighCraftsmanshipCount: gemstones.filter((g) => g.carving.hasHighQuality).length,
    overallTreasureValue,
    lapidaryGrade: classifyLapidaryGrade(overallTreasureValue),
    bestGemstone: gemstones.length > 0 ? gemstones.reduce((b, g) => g.qualityScore > b.qualityScore ? g : b).file : '',
    mostPrecious: gemstones.length > 0 ? gemstones.reduce((b, g) => g.preciousness > b.preciousness ? g : b).file : '',
    mostDurable: gemstones.length > 0 ? gemstones.reduce((b, g) => g.durability > b.durability ? g : b).file : '',
    mostLustrous: gemstones.length > 0 ? gemstones.reduce((b, g) => g.luster > b.luster ? g : b).file : '',
    mostFaceted: gemstones.length > 0 ? gemstones.reduce((b, g) => g.facetCount > b.facetCount ? g : b).file : '',
    clearest: gemstones.length > 0 ? gemstones.reduce((b, g) => g.clarityValue > b.clarityValue ? g : b).file : '',
    bestCarved: gemstones.length > 0 ? gemstones.reduce((b, g) => g.carvingQuality > b.carvingQuality ? g : b).file : '',
  }

  const recommendations = generateRecommendations(gemstones, collections, treasure, stats)

  return { gemstones, collections, treasure, stats, recommendations }
}
