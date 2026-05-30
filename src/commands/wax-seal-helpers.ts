// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Impression {
  depth: number
  sharpness: number
  completeness: number
  symmetry: number
  hasAirBubbles: boolean
  hasSmudges: boolean
  hasCracks: boolean
  hasChips: boolean
  airBubbleCount: number
  smudgeCount: number
  crackCount: number
  chipCount: number
}

export interface Document {
  type: 'charter' | 'decree' | 'contract' | 'letter' | 'record' | 'draft' | 'scrap'
  authority: 'royal' | 'noble' | 'guild' | 'merchant' | 'commoner' | 'forger'
  language: string
  age: 'fresh' | 'recent' | 'mature' | 'aged' | 'ancient'
  isOriginal: boolean
  isCertified: boolean
  certificationLevel: 'none' | 'basic' | 'standard' | 'comprehensive' | 'exhaustive'
}

export interface Forgeries {
  isSuspect: boolean
  copyIndicators: number
  originalityScore: number
  patternOriginality: number
}

export interface SealMark {
  file: string
  sealQuality: number
  waxPurity: number
  impressionClarity: number
  stampAuthority: number
  sealIntegrity: number
  authenticity: number
  waxType: 'beeswax' | 'shellac' | 'paraffin' | 'synthetic' | 'clay' | 'lead'
  sealColor: 'royal-red' | 'gold' | 'silver' | 'blue' | 'green' | 'black' | 'white' | 'unpigmented'
  stampDesign: 'royal-arms' | 'guild-mark' | 'personal-seal' | 'official-stamp' | 'simple-mark' | 'no-stamp'
  impression: Impression
  document: Document
  forgeries: Forgeries
  condition: 'intact' | 'nearly-intact' | 'slightly-damaged' | 'damaged' | 'broken' | 'missing'
  grade: 'royal-seal' | 'guild-certified' | 'merchant-approved' | 'common' | 'suspect' | 'forgery'
  qualityScore: number
  issues: string[]
  endorsements: string[]
}

export interface SealCollection {
  directory: string
  seals: SealMark[]
  avgSealQuality: number
  avgAuthenticity: number
  avgIntegrity: number
  dominantWaxType: string
  dominantStampDesign: string
  royalSeals: number
  guildCertified: number
  suspectCount: number
  forgeryCount: number
  intactCount: number
  brokenCount: number
  originalCount: number
  copyCount: number
  certificationRate: number
  collectionQuality: number
  authority: 'royal-court' | 'guild-hall' | 'marketplace' | 'back-alley' | 'ruins'
}

export interface WaxSealStats {
  totalFiles: number
  totalCollections: number
  avgSealQuality: number
  avgWaxPurity: number
  avgImpressionClarity: number
  avgStampAuthority: number
  avgSealIntegrity: number
  avgAuthenticity: number
  royalSeals: number
  guildCertified: number
  commonSeals: number
  suspectSeals: number
  forgerySeals: number
  intactSeals: number
  brokenSeals: number
  originalFiles: number
  copiedFiles: number
  certifiedFiles: number
  uncertifiedFiles: number
  totalAirBubbles: number
  totalSmudges: number
  totalCracks: number
  totalChips: number
  certificationRate: number
  overallAuthenticity: number
  heraldGrade: 'royal-herald' | 'guild-master' | 'notary' | 'scribe' | 'forger' | 'illiterate'
  bestSeal: string
  worstSeal: string
  mostAuthentic: string
  mostSuspect: string
}

export interface WaxSealResult {
  seals: SealMark[]
  collections: SealCollection[]
  stats: WaxSealStats
  recommendations: string[]
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify wax type from code quality
 * @example
 * classifyWaxType(90) // 'beeswax'
 */
export function classifyWaxType(quality: number): SealMark['waxType'] {
  if (quality >= 80) return 'beeswax'
  if (quality >= 65) return 'shellac'
  if (quality >= 50) return 'paraffin'
  if (quality >= 35) return 'synthetic'
  if (quality >= 20) return 'clay'
  return 'lead'
}

/**
 * Classify seal color from quality score
 * @example
 * classifySealColor(90) // 'royal-red'
 */
export function classifySealColor(quality: number): SealMark['sealColor'] {
  if (quality >= 85) return 'royal-red'
  if (quality >= 75) return 'gold'
  if (quality >= 65) return 'silver'
  if (quality >= 50) return 'blue'
  if (quality >= 35) return 'green'
  if (quality >= 20) return 'black'
  if (quality >= 10) return 'white'
  return 'unpigmented'
}

/**
 * Classify stamp design from code structure
 * @example
 * classifyStampDesign(3, 5, 2) // 'royal-arms'
 */
export function classifyStampDesign(
  exports: number,
  functions: number,
  classes: number,
): SealMark['stampDesign'] {
  if (exports >= 5 && classes >= 2 && functions >= 3) return 'royal-arms'
  if (exports >= 4 && classes >= 1) return 'guild-mark'
  if (exports >= 3 && functions >= 3) return 'official-stamp'
  if (exports >= 2 || classes >= 1) return 'personal-seal'
  if (functions >= 1) return 'simple-mark'
  return 'no-stamp'
}

/**
 * Classify herald grade from average quality
 * @example
 * classifyHeraldGrade(90) // 'royal-herald'
 */
export function classifyHeraldGrade(quality: number): WaxSealStats['heraldGrade'] {
  if (quality >= 85) return 'royal-herald'
  if (quality >= 70) return 'guild-master'
  if (quality >= 55) return 'notary'
  if (quality >= 40) return 'scribe'
  if (quality >= 20) return 'forger'
  return 'illiterate'
}

/**
 * Classify authority from average authenticity
 * @example
 * classifyAuthority(80) // 'royal-court'
 */
export function classifyAuthority(authenticity: number): SealCollection['authority'] {
  if (authenticity >= 75) return 'royal-court'
  if (authenticity >= 55) return 'guild-hall'
  if (authenticity >= 35) return 'marketplace'
  if (authenticity >= 15) return 'back-alley'
  return 'ruins'
}

// ─── Detection Functions ─────────────────────────────────────────────────────

/**
 * Detect forgery indicators in code
 * @example
 * detectForgeries('copy-paste from stack overflow') // { isSuspect: true, ... }
 */
export function detectForgeries(content: string): Forgeries {
  let copyIndicators = 0

  const duplicateLines = new Map<string, number>()
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.length > 10) {
      duplicateLines.set(trimmed, (duplicateLines.get(trimmed) ?? 0) + 1)
    }
  }
  for (const count of duplicateLines.values()) {
    if (count > 1) copyIndicators += count - 1
  }

  const boilerplate = (content.match(/copyright|license|all rights reserved/gi) ?? []).length
  if (boilerplate > 2) copyIndicators += 1

  const urlRefs = (content.match(/https?:\/\/(stackoverflow|github|medium)\.com/gi) ?? []).length
  copyIndicators += urlRefs

  const originalityScore = Math.min(100, Math.max(0, 100 - copyIndicators * 15))
  const patternOriginality = Math.min(100, Math.max(0, 90 - copyIndicators * 10 - (content.length > 1000 && content.split('\n').filter(l => l.trim().length === 0).length > 20 ? 10 : 0)))
  const isSuspect = copyIndicators >= 3 || originalityScore < 40

  return { isSuspect, copyIndicators, originalityScore, patternOriginality }
}

/**
 * Assess impression quality of code
 * @example
 * assessImpression('export function f() {}') // { depth: 10, ... }
 */
export function assessImpression(content: string): Impression {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('//') && !l.trim().startsWith('*'))

  const exportCount = (content.match(/\bexport\s+/g) ?? []).length
  const functionCount = (content.match(/(?:function\s+\w+|=>\s*[{(])/g) ?? []).length
  const interfaceCount = (content.match(/\binterface\s+\w+/g) ?? []).length
  const typeCount = (content.match(/\btype\s+\w+/g) ?? []).length
  const classCount = (content.match(/\bclass\s+\w+/g) ?? []).length

  const depth = Math.min(100, codeLines.length + functionCount * 5 + classCount * 10)
  const sharpness = Math.min(100, Math.round(
    (interfaceCount > 0 ? 20 : 0) + (typeCount > 0 ? 15 : 0) + (exportCount > 0 ? 20 : 0) +
    (functionCount > 0 ? 15 : 0) + (classCount > 0 ? 15 : 0) + Math.min(15, exportCount * 3),
  ))
  const totalElements = functionCount + classCount + interfaceCount + typeCount + exportCount
  const completeness = Math.min(100, Math.round(totalElements > 0 ? Math.min(100, totalElements * 15) : 0))

  const maxType = Math.max(interfaceCount, typeCount, classCount, functionCount)
  const totalTypes = interfaceCount + typeCount + classCount + functionCount
  const symmetry = totalTypes > 0 ? Math.min(100, Math.round((1 - maxType / totalTypes) * 100)) : 0

  const hasAny = /\bany\b/.test(content)
  const hasConsole = /console\.\w+\s*\(/.test(content)
  const hasEval = /\beval\s*\(/.test(content)
  const hasTsIgnore = /@ts-ignore|@ts-expect-error/.test(content)

  const airBubbleCount = (content.match(/TODO|FIXME|HACK/gi) ?? []).length
  const smudgeCount = (hasConsole ? 1 : 0) + (hasTsIgnore ? 1 : 0)
  const crackCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)
  const chipCount = (content.match(/function\s+\w+\s*\([^)]*\)\s*\{\s*\}/g) ?? []).length

  return {
    depth, sharpness, completeness, symmetry,
    hasAirBubbles: airBubbleCount > 0,
    hasSmudges: smudgeCount > 0,
    hasCracks: crackCount > 0,
    hasChips: chipCount > 0,
    airBubbleCount, smudgeCount, crackCount, chipCount,
  }
}

/**
 * Assess certification level from tests and documentation
 * @example
 * assessCertification('describe("test", () => {})')
 */
export function assessCertification(content: string): Document['certificationLevel'] {
  const testCount = (content.match(/describe\s*\(|it\s*\(|test\s*\(/g) ?? []).length
  const jsdocCount = (content.match(/\/\*\*[\s\S]*?\*\//g) ?? []).length
  const score = testCount * 2 + jsdocCount
  if (score >= 10) return 'exhaustive'
  if (score >= 6) return 'comprehensive'
  if (score >= 3) return 'standard'
  if (score >= 1) return 'basic'
  return 'none'
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a seal mark
 * @example
 * analyzeSealMark('export function f() {}', 'f.ts') // SealMark
 */
export function analyzeSealMark(content: string, filePath: string): SealMark {
  const lines = content.split('\n')
  const totalLines = lines.length

  const exportCount = (content.match(/\bexport\s+/g) ?? []).length
  const functionCount = (content.match(/(?:function\s+\w+|=>\s*[{(])/g) ?? []).length
  const classCount = (content.match(/\bclass\s+\w+/g) ?? []).length
  const interfaceCount = (content.match(/\binterface\s+\w+/g) ?? []).length
  const typeCount = (content.match(/\btype\s+\w+/g) ?? []).length
  const importCount = (content.match(/\bimport\s+/g) ?? []).length
  const jsdocCount = (content.match(/\/\*\*[\s\S]*?\*\//g) ?? []).length
  const testCount = (content.match(/describe\s*\(|it\s*\(|test\s*\(/g) ?? []).length

  const hasJSDoc = jsdocCount > 0
  const hasTypes = interfaceCount + typeCount > 0
  const hasExports = exportCount > 0
  const hasTests = testCount > 0
  const hasAny = /\bany\b/.test(content)
  const hasConsole = /console\.\w+\s*\(/.test(content)
  const hasEval = /\beval\s*\(/.test(content)

  const waxPurity = Math.min(100, Math.max(0, Math.round(
    80 - (hasAny ? 15 : 0) - (hasConsole ? 10 : 0) - (hasEval ? 15 : 0) -
    (content.match(/@ts-ignore|@ts-expect-error/g) ?? []).length * 10 +
    (hasJSDoc ? 10 : 0) + (hasTypes ? 10 : 0),
  )))

  const impressionClarity = Math.min(100, Math.max(0, Math.round(
    (hasExports ? 20 : 0) + (hasTypes ? 20 : 0) + (hasJSDoc ? 20 : 0) +
    (hasTests ? 15 : 0) + Math.min(15, exportCount * 3) + Math.min(10, jsdocCount * 4),
  )))

  const stampAuthority = Math.min(100, Math.max(0, Math.round(
    (hasExports ? 15 : 0) + (hasTypes ? 20 : 0) + (hasJSDoc ? 15 : 0) +
    (hasTests ? 15 : 0) + (importCount > 0 ? 10 : 0) +
    (functionCount > 0 && functionCount <= 10 ? 15 : 5) +
    Math.min(10, interfaceCount * 5),
  )))

  const impression = assessImpression(content)
  const sealIntegrity = Math.min(100, Math.max(0, Math.round(
    100 - impression.crackCount * 15 - impression.chipCount * 10 -
    impression.smudgeCount * 8 - impression.airBubbleCount * 5,
  )))

  const forgeries = detectForgeries(content)
  const authenticity = Math.min(100, Math.max(0, Math.round(
    (forgeries.originalityScore * 0.4) + (forgeries.patternOriginality * 0.3) +
    (hasJSDoc ? 10 : 0) + (hasTypes ? 10 : 0) + (hasExports ? 10 : 0),
  )))

  const sealQuality = Math.min(100, Math.max(0, Math.round(
    (waxPurity * 0.2) + (impressionClarity * 0.2) + (stampAuthority * 0.2) +
    (sealIntegrity * 0.2) + (authenticity * 0.2),
  )))

  const waxType = classifyWaxType(sealQuality)
  const sealColor = classifySealColor(sealQuality)
  const stampDesign = classifyStampDesign(exportCount, functionCount, classCount)

  const docTypeCounts = [
    ['charter', interfaceCount + typeCount] as [string, number],
    ['decree', exportCount] as [string, number],
    ['contract', classCount] as [string, number],
    ['letter', functionCount] as [string, number],
    ['record', importCount] as [string, number],
    ['draft', testCount] as [string, number],
  ].sort((a, b) => b[1] - a[1])
  const docType = (totalLines === 0 ? 'scrap' : (docTypeCounts[0]?.[1] ?? 0) > 0 ? (docTypeCounts[0]?.[0] ?? 'scrap') : 'scrap') as Document['type']

  let authority: Document['authority']
  if (sealQuality >= 80) authority = 'royal'
  else if (sealQuality >= 65) authority = 'noble'
  else if (sealQuality >= 50) authority = 'guild'
  else if (sealQuality >= 30) authority = 'merchant'
  else if (sealQuality >= 15) authority = 'commoner'
  else authority = 'forger'

  let age: Document['age']
  if (totalLines >= 300) age = 'ancient'
  else if (totalLines >= 150) age = 'aged'
  else if (totalLines >= 80) age = 'mature'
  else if (totalLines >= 30) age = 'recent'
  else age = 'fresh'

  const certificationLevel = assessCertification(content)
  const isCertified = certificationLevel !== 'none'
  const isOriginal = !forgeries.isSuspect

  const language = filePath.endsWith('.ts') || filePath.endsWith('.tsx') ? 'TypeScript'
    : filePath.endsWith('.js') || filePath.endsWith('.jsx') ? 'JavaScript'
    : filePath.endsWith('.py') ? 'Python'
    : filePath.endsWith('.rs') ? 'Rust'
    : filePath.endsWith('.go') ? 'Go'
    : 'Unknown'

  const qualityScore = sealQuality

  let condition: SealMark['condition']
  if (qualityScore >= 80 && impression.crackCount === 0) condition = 'intact'
  else if (qualityScore >= 65) condition = 'nearly-intact'
  else if (qualityScore >= 50) condition = 'slightly-damaged'
  else if (qualityScore >= 30) condition = 'damaged'
  else if (qualityScore >= 10) condition = 'broken'
  else condition = 'missing'

  let grade: SealMark['grade']
  if (qualityScore >= 80 && isCertified && isOriginal) grade = 'royal-seal'
  else if (qualityScore >= 65 && isCertified) grade = 'guild-certified'
  else if (qualityScore >= 50) grade = 'merchant-approved'
  else if (qualityScore >= 30 && !forgeries.isSuspect) grade = 'common'
  else if (forgeries.isSuspect) grade = 'suspect'
  else grade = 'common'

  const issues: string[] = []
  if (impression.hasCracks) issues.push('Cracks detected: type safety issues present')
  if (impression.hasSmudges) issues.push('Smudges: unclear code patterns')
  if (impression.hasAirBubbles) issues.push(`Air bubbles: ${impression.airBubbleCount} TODO/FIXME markers`)
  if (impression.hasChips) issues.push('Chips: incomplete implementations')
  if (forgeries.isSuspect) issues.push('Suspect: potential copy-paste code detected')
  if (!isCertified) issues.push('Uncertified: no tests or documentation')

  const endorsements: string[] = []
  if (hasJSDoc) endorsements.push('Documented with JSDoc')
  if (hasTypes) endorsements.push('Uses TypeScript types')
  if (hasTests) endorsements.push('Has test coverage')
  if (hasExports) endorsements.push('Exports public API')
  if (isOriginal && !forgeries.isSuspect) endorsements.push('Original code')
  if (isCertified) endorsements.push(`Certified: ${certificationLevel}`)

  return {
    file: filePath, sealQuality, waxPurity, impressionClarity,
    stampAuthority, sealIntegrity, authenticity,
    waxType, sealColor, stampDesign,
    impression, document: {
      type: docType, authority, language, age,
      isOriginal, isCertified, certificationLevel,
    },
    forgeries, condition, grade, qualityScore, issues, endorsements,
  }
}

// ─── Collection Analysis ─────────────────────────────────────────────────────

/**
 * Analyze a directory as a seal collection
 * @example
 * analyzeSealCollection(seals, 'src') // SealCollection
 */
export function analyzeSealCollection(seals: SealMark[], dirPath: string): SealCollection {
  if (seals.length === 0) {
    return {
      directory: dirPath, seals: [],
      avgSealQuality: 0, avgAuthenticity: 0, avgIntegrity: 0,
      dominantWaxType: 'lead', dominantStampDesign: 'no-stamp',
      royalSeals: 0, guildCertified: 0, suspectCount: 0, forgeryCount: 0,
      intactCount: 0, brokenCount: 0, originalCount: 0, copyCount: 0,
      certificationRate: 0, collectionQuality: 0, authority: 'ruins',
    }
  }

  const avgSealQuality = Math.round(seals.reduce((s, m) => s + m.sealQuality, 0) / seals.length)
  const avgAuthenticity = Math.round(seals.reduce((s, m) => s + m.authenticity, 0) / seals.length)
  const avgIntegrity = Math.round(seals.reduce((s, m) => s + m.sealIntegrity, 0) / seals.length)

  const waxCounts = new Map<string, number>()
  const stampCounts = new Map<string, number>()
  for (const s of seals) {
    waxCounts.set(s.waxType, (waxCounts.get(s.waxType) ?? 0) + 1)
    stampCounts.set(s.stampDesign, (stampCounts.get(s.stampDesign) ?? 0) + 1)
  }
  const dominantWaxType = Array.from(waxCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'lead'
  const dominantStampDesign = Array.from(stampCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'no-stamp'

  const royalSeals = seals.filter(s => s.grade === 'royal-seal').length
  const guildCertified = seals.filter(s => s.grade === 'guild-certified').length
  const suspectCount = seals.filter(s => s.grade === 'suspect').length
  const forgeryCount = seals.filter(s => s.grade === 'forgery').length
  const intactCount = seals.filter(s => s.condition === 'intact').length
  const brokenCount = seals.filter(s => s.condition === 'broken' || s.condition === 'missing').length
  const originalCount = seals.filter(s => s.document.isOriginal).length
  const copyCount = seals.filter(s => !s.document.isOriginal).length
  const certifiedFiles = seals.filter(s => s.document.isCertified).length
  const certificationRate = Math.round((certifiedFiles / seals.length) * 100)

  const collectionQuality = avgSealQuality
  const authority = classifyAuthority(avgAuthenticity)

  return {
    directory: dirPath, seals,
    avgSealQuality, avgAuthenticity, avgIntegrity,
    dominantWaxType, dominantStampDesign,
    royalSeals, guildCertified, suspectCount, forgeryCount,
    intactCount, brokenCount, originalCount, copyCount,
    certificationRate, collectionQuality, authority,
  }
}

// ─── Recommendations ────────────────────────────────────────────────────────

/**
 * Generate wax seal recommendations
 * @example
 * generateRecommendations(seals, collections, stats) // string[]
 */
export function generateRecommendations(
  seals: SealMark[],
  collections: SealCollection[],
  stats: WaxSealStats,
): string[] {
  const recs: string[] = []

  if (stats.overallAuthenticity >= 75) {
    recs.push('High authenticity: codebase shows strong original work')
  }

  if (stats.brokenSeals > 0) {
    recs.push(`Broken seals: ${stats.brokenSeals} files need major repair`)
  }

  if (stats.suspectSeals > 0) {
    recs.push(`Suspect files: ${stats.suspectSeals} files may contain copied code`)
  }

  if (stats.uncertifiedFiles > 0) {
    recs.push(`Uncertified: ${stats.uncertifiedFiles} files lack tests or documentation`)
  }

  if (stats.totalCracks > 0) {
    recs.push(`Cracks detected: ${stats.totalCracks} type safety issues across codebase`)
  }

  if (stats.totalSmudges > 0) {
    recs.push(`Smudges: ${stats.totalSmudges} unclear code patterns need cleanup`)
  }

  if (stats.totalAirBubbles > 0) {
    recs.push(`Air bubbles: ${stats.totalAirBubbles} TODO/FIXME markers need resolution`)
  }

  if (stats.avgWaxPurity < 40) {
    recs.push('Low purity: remove anti-patterns and code smells')
  }

  if (stats.avgImpressionClarity < 40) {
    recs.push('Unclear impressions: improve API documentation and exports')
  }

  if (stats.certificationRate < 30) {
    recs.push('Low certification rate: add tests and JSDoc documentation')
  }

  if (stats.royalSeals > 0) {
    recs.push(`Royal seals: ${stats.royalSeals} exemplary files to use as templates`)
  }

  if (stats.overallAuthenticity < 40) {
    recs.push('Low authenticity: review codebase for originality and quality')
  } else if (stats.overallAuthenticity < 60) {
    recs.push('Moderate authenticity: targeted improvements will raise quality')
  }

  const damaged = seals.filter(s => s.condition === 'damaged' || s.condition === 'slightly-damaged')
  if (damaged.length > 0) {
    recs.push(`Damaged seals: ${damaged.length} files need restoration work`)
  }

  const badCollections = collections.filter(c => c.authority === 'ruins' || c.authority === 'back-alley')
  if (badCollections.length > 0) {
    recs.push(`Low-authority directories: ${badCollections.length} need quality improvements`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete wax seal result from files and contents
 * @example
 * buildWaxSealResult(['a.ts'], ['export function a() {}'], {}) // WaxSealResult
 */
export function buildWaxSealResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): WaxSealResult {
  const seals: SealMark[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeSealMark(content, file)
    } catch {
      return analyzeSealMark('', file)
    }
  })

  const dirMap = new Map<string, SealMark[]>()
  for (const seal of seals) {
    const dir = seal.file.includes('/') ? seal.file.slice(0, seal.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(seal)
    } else {
      dirMap.set(dir, [seal])
    }
  }

  const collections: SealCollection[] = Array.from(dirMap.entries()).map(([dir, ss]) =>
    analyzeSealCollection(ss, dir),
  )

  const n = seals.length || 1
  const avgSealQuality = Math.round(seals.reduce((s, m) => s + m.sealQuality, 0) / n)
  const avgWaxPurity = Math.round(seals.reduce((s, m) => s + m.waxPurity, 0) / n)
  const avgImpressionClarity = Math.round(seals.reduce((s, m) => s + m.impressionClarity, 0) / n)
  const avgStampAuthority = Math.round(seals.reduce((s, m) => s + m.stampAuthority, 0) / n)
  const avgSealIntegrity = Math.round(seals.reduce((s, m) => s + m.sealIntegrity, 0) / n)
  const avgAuthenticity = Math.round(seals.reduce((s, m) => s + m.authenticity, 0) / n)

  const royalSeals = seals.filter(s => s.grade === 'royal-seal').length
  const guildCertified = seals.filter(s => s.grade === 'guild-certified').length
  const commonSeals = seals.filter(s => s.grade === 'common' || s.grade === 'merchant-approved').length
  const suspectSeals = seals.filter(s => s.grade === 'suspect').length
  const forgerySeals = seals.filter(s => s.grade === 'forgery').length
  const intactSeals = seals.filter(s => s.condition === 'intact' || s.condition === 'nearly-intact').length
  const brokenSeals = seals.filter(s => s.condition === 'broken' || s.condition === 'missing').length
  const originalFiles = seals.filter(s => s.document.isOriginal).length
  const copiedFiles = seals.filter(s => !s.document.isOriginal).length
  const certifiedFiles = seals.filter(s => s.document.isCertified).length
  const uncertifiedFiles = files.length - certifiedFiles
  const totalAirBubbles = seals.reduce((s, m) => s + m.impression.airBubbleCount, 0)
  const totalSmudges = seals.reduce((s, m) => s + m.impression.smudgeCount, 0)
  const totalCracks = seals.reduce((s, m) => s + m.impression.crackCount, 0)
  const totalChips = seals.reduce((s, m) => s + m.impression.chipCount, 0)
  const certificationRate = files.length > 0 ? Math.round((certifiedFiles / files.length) * 100) : 0
  const overallAuthenticity = avgAuthenticity

  const firstSeal = seals[0]
  const bestSeal = seals.length > 0 && firstSeal
    ? seals.reduce((b, s) => s.sealQuality > b.sealQuality ? s : b, firstSeal).file : 'none'
  const worstSeal = seals.length > 0 && firstSeal
    ? seals.reduce((w, s) => s.sealQuality < w.sealQuality ? s : w, firstSeal).file : 'none'
  const mostAuthentic = seals.length > 0 && firstSeal
    ? seals.reduce((m, s) => s.authenticity > m.authenticity ? s : m, firstSeal).file : 'none'
  const mostSuspect = seals.length > 0 && firstSeal
    ? seals.reduce((m, s) => s.forgeries.copyIndicators > m.forgeries.copyIndicators ? s : m, firstSeal).file : 'none'

  const stats: WaxSealStats = {
    totalFiles: files.length, totalCollections: collections.length,
    avgSealQuality, avgWaxPurity, avgImpressionClarity, avgStampAuthority,
    avgSealIntegrity, avgAuthenticity,
    royalSeals, guildCertified, commonSeals, suspectSeals, forgerySeals,
    intactSeals, brokenSeals, originalFiles, copiedFiles,
    certifiedFiles, uncertifiedFiles,
    totalAirBubbles, totalSmudges, totalCracks, totalChips,
    certificationRate, overallAuthenticity,
    heraldGrade: classifyHeraldGrade(overallAuthenticity),
    bestSeal, worstSeal, mostAuthentic, mostSuspect,
  }

  const recommendations = generateRecommendations(seals, collections, stats)

  void options

  return { seals, collections, stats, recommendations }
}
