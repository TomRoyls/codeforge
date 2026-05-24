// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type CushionGrade = 'silk-velvet' | 'soft-cotton' | 'proper-lining' | 'rough-cloth' | 'bare-metal' | 'no-lining'
export type VaultGrade = 'fort-knox' | 'strong-vault' | 'proper-safe' | 'weak-lock' | 'open-door' | 'no-security'
export type LiningGrade = 'silk-lining' | 'proper-padding' | 'decent-wrap' | 'thin-layer' | 'no-protection' | 'exposed'
export type JewelGrade = 'flawless-diamond' | 'clear-gem' | 'proper-stone' | 'cloudy-crystal' | 'rough-rock' | 'no-jewel'
export type LockGrade = 'unbreakable-lock' | 'reliable-mechanism' | 'proper-lock' | 'sticky-latch' | 'broken-lock' | 'no-lock'
export type PouchCondition = 'royal-vault' | 'luxury-safe' | 'proper-vault' | 'basic-locker' | 'wooden-box' | 'dusty-shelf'
export type ChamberType = 'treasury' | 'strongroom' | 'proper-vault' | 'closet-safe' | 'drawer' | 'no-chamber'
export type ChamberCondition = 'impenetrable-fortress' | 'secure-vault' | 'decent-safe' | 'basic-storage' | 'unsecured' | 'void'
export type KeeperGrade = 'master-keeper' | 'expert-vault' | 'skilled-guardian' | 'apprentice' | 'novice' | 'thief'

export interface CushioningMeasure {
  quality: number
  grade: CushionGrade
  hasHighQuality: boolean
  hasReadable: boolean
  hasWellDocumented: boolean
  hasNoCryptic: boolean
  hasFriendlyAPI: boolean
  hasNoHostileAPI: boolean
  hasIntuitive: boolean
  hasNoCounterintuitive: boolean
  hasApproachable: boolean
  hasNoIntimidating: boolean
  hasWelcoming: boolean
  crypticCount: number
  hostileAPICount: number
}

export interface SecuringMeasure {
  security: number
  vault: VaultGrade
  hasHighSecurity: boolean
  hasInputValidation: boolean
  hasAccessControl: boolean
  hasNoUnprotected: boolean
  hasAuthentication: boolean
  hasNoAnonymous: boolean
  hasSanitization: boolean
  hasNoRawInput: boolean
  hasAuthorization: boolean
  hasNoPrivilegeEscalation: boolean
  hasEncrypted: boolean
  unprotectedCount: number
  anonymousCount: number
}

export interface ProtectingMeasure {
  protection: number
  lining: LiningGrade
  hasHighProtection: boolean
  hasEncapsulated: boolean
  hasPrivateByDefault: boolean
  hasNoLeaked: boolean
  hasImmutable: boolean
  hasNoMutable: boolean
  hasSealed: boolean
  hasNoOpen: boolean
  hasHiddenInternals: boolean
  hasNoExposedGuts: boolean
  hasGuarded: boolean
  leakedCount: number
  mutableCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  jewel: JewelGrade
  hasHighClarity: boolean
  hasClearPurpose: boolean
  hasSingleResponsibility: boolean
  hasNoMixedConcerns: boolean
  hasFocused: boolean
  hasNoScattered: boolean
  hasValuable: boolean
  hasNoFiller: boolean
  hasCoreClear: boolean
  hasNoObfuscatedCore: boolean
  hasEssential: boolean
  mixedConcernsCount: number
  scatteredCount: number
}

export interface ValidatingMeasure {
  reliability: number
  lock: LockGrade
  hasHighReliability: boolean
  hasThoroughValidation: boolean
  hasTypeChecked: boolean
  hasNoCasts: boolean
  hasBoundaryChecked: boolean
  hasNoUnchecked: boolean
  hasErrorHandled: boolean
  hasNoBareThrow: boolean
  hasConsistent: boolean
  hasNoInconsistent: boolean
  hasReliable: boolean
  castsCount: number
  uncheckedCount: number
}

export interface VelvetPouch {
  file: string
  softnessQuality: number
  vaultSecurity: number
  liningProtection: number
  jewelClarity: number
  lockReliability: number
  cushioning: CushioningMeasure
  securing: SecuringMeasure
  protecting: ProtectingMeasure
  clarifying: ClarifyingMeasure
  validating: ValidatingMeasure
  condition: PouchCondition
  qualityScore: number
}

export interface VaultChamber {
  directory: string
  pouches: VelvetPouch[]
  avgSoftness: number
  avgSecurity: number
  avgClarity: number
  royalVaultCount: number
  dustyShelfCount: number
  chamberType: ChamberType
  condition: ChamberCondition
}

export interface TreasurySummary {
  avgSoftness: number
  avgSecurity: number
  avgClarity: number
  isSecure: boolean
  overallTreasure: number
}

export interface VelvetVaultStats {
  totalFiles: number
  totalChambers: number
  avgSoftnessQuality: number
  avgVaultSecurity: number
  avgLiningProtection: number
  avgJewelClarity: number
  avgLockReliability: number
  royalVaultCount: number
  luxurySafeCount: number
  properVaultCount: number
  basicLockerCount: number
  woodenBoxCount: number
  dustyShelfCount: number
  hasHighSoftnessCount: number
  hasHighSecurityCount: number
  hasHighProtectionCount: number
  hasHighClarityCount: number
  hasHighReliabilityCount: number
  overallTreasure: number
  keeperGrade: KeeperGrade
  bestPouch: string
  softest: string
  mostSecure: string
  mostProtected: string
  clearest: string
}

export interface VelvetVaultResult {
  pouches: VelvetPouch[]
  chambers: VaultChamber[]
  treasury: TreasurySummary
  stats: VelvetVaultStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const countMatches = (pattern: RegExp, content: string): number => {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  const globalPattern = new RegExp(pattern.source, flags)
  return (content.match(globalPattern) ?? []).length
}

// ─── Boolean Detectors ─────────────────────────────────────────────

const hasExport = (c: string) => has(/\bexport\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasSwitch = (c: string) => has(/\bswitch\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure softness quality (cushioning)
 * @example
 * const m = measureCushioning(content)
 * console.log(m.grade) // 'silk-velvet'
 */
export function measureCushioning(content: string): CushioningMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0

  const hasReadable = hasExport(content) && hasReturnType(content)
  const hasWellDocumented = hasDocComments(content) && hasReturnType(content)
  const hasFriendlyAPI = hasOptional(content) && hasDefaultParam(content)
  const hasIntuitive = hasNamedExport(content) && hasReturnType(content)
  const hasApproachable = hasDocComments(content) && hasOptional(content)
  const hasWelcoming = hasExport(content) && hasImport(content)

  score += hasReadable ? 5 : 0
  score += hasWellDocumented ? 5 : 0
  score += hasFriendlyAPI ? 5 : 0
  score += hasIntuitive ? 5 : 0
  score += hasApproachable ? 5 : 0
  score += hasWelcoming ? 5 : 0

  const quality = Math.min(score, 100)
  const crypticCount = countMatches(/\bvar\b/, content)
  const hostileAPICount = countMatches(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoHostileAPI = hostileAPICount === 0
  const hasNoCounterintuitive = !has(/\beval\b/, content)
  const hasNoIntimidating = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: CushionGrade
  if (quality >= 85) grade = 'silk-velvet'
  else if (quality >= 70) grade = 'soft-cotton'
  else if (quality >= 55) grade = 'proper-lining'
  else if (quality >= 40) grade = 'rough-cloth'
  else if (quality >= 25) grade = 'bare-metal'
  else grade = 'no-lining'

  return {
    quality, grade, hasHighQuality, hasReadable, hasWellDocumented,
    hasNoCryptic, hasFriendlyAPI, hasNoHostileAPI, hasIntuitive,
    hasNoCounterintuitive, hasApproachable, hasNoIntimidating, hasWelcoming,
    crypticCount, hostileAPICount,
  }
}

/**
 * Measure vault security (securing)
 * @example
 * const m = measureSecuring(content)
 * console.log(m.vault) // 'fort-knox'
 */
export function measureSecuring(content: string): SecuringMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0

  const hasInputValidation = hasStrictEq(content) && hasConditional(content)
  const hasAccessControl = hasPrivate(content) && hasReadonly(content)
  const hasAuthentication = hasTryCatch(content) && hasThrow(content)
  const hasSanitization = hasReturnType(content) && hasStrictEq(content)
  const hasAuthorization = hasInterface(content) && hasConst(content)
  const hasEncrypted = hasPrivate(content) && hasConst(content)

  score += hasInputValidation ? 5 : 0
  score += hasAccessControl ? 5 : 0
  score += hasAuthentication ? 5 : 0
  score += hasSanitization ? 5 : 0
  score += hasAuthorization ? 5 : 0
  score += hasEncrypted ? 5 : 0

  const security = Math.min(score, 100)
  const unprotectedCount = countMatches(/\bvar\b/, content)
  const anonymousCount = countMatches(/\bany\b/, content)

  const hasNoUnprotected = unprotectedCount === 0
  const hasNoAnonymous = anonymousCount === 0
  const hasNoRawInput = !has(/\beval\b/, content)
  const hasNoPrivilegeEscalation = !has(/\bdebugger\b/, content)
  const hasHighSecurity = security >= 70

  let vault: VaultGrade
  if (security >= 85) vault = 'fort-knox'
  else if (security >= 70) vault = 'strong-vault'
  else if (security >= 55) vault = 'proper-safe'
  else if (security >= 40) vault = 'weak-lock'
  else if (security >= 25) vault = 'open-door'
  else vault = 'no-security'

  return {
    security, vault, hasHighSecurity, hasInputValidation, hasAccessControl,
    hasNoUnprotected, hasAuthentication, hasNoAnonymous, hasSanitization,
    hasNoRawInput, hasAuthorization, hasNoPrivilegeEscalation, hasEncrypted,
    unprotectedCount, anonymousCount,
  }
}

/**
 * Measure lining protection (protecting)
 * @example
 * const m = measureProtecting(content)
 * console.log(m.lining) // 'silk-lining'
 */
export function measureProtecting(content: string): ProtectingMeasure {
  let score = 0
  score += hasPrivate(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0

  const hasEncapsulated = hasPrivate(content) && hasInterface(content)
  const hasPrivateByDefault = hasPrivate(content) && hasReadonly(content)
  const hasImmutable = hasReadonly(content) && hasConst(content)
  const hasSealed = hasInterface(content) && hasExport(content)
  const hasHiddenInternals = hasPrivate(content) && hasClass(content)
  const hasGuarded = hasReturnType(content) && hasStrictEq(content)

  score += hasEncapsulated ? 5 : 0
  score += hasPrivateByDefault ? 5 : 0
  score += hasImmutable ? 5 : 0
  score += hasSealed ? 5 : 0
  score += hasHiddenInternals ? 5 : 0
  score += hasGuarded ? 5 : 0

  const protection = Math.min(score, 100)
  const leakedCount = countMatches(/\bvar\b/, content)
  const mutableCount = countMatches(/\bany\b/, content)

  const hasNoLeaked = leakedCount === 0
  const hasNoMutable = mutableCount === 0
  const hasNoOpen = !has(/\beval\b/, content)
  const hasNoExposedGuts = !has(/\bdebugger\b/, content)
  const hasHighProtection = protection >= 70

  let lining: LiningGrade
  if (protection >= 85) lining = 'silk-lining'
  else if (protection >= 70) lining = 'proper-padding'
  else if (protection >= 55) lining = 'decent-wrap'
  else if (protection >= 40) lining = 'thin-layer'
  else if (protection >= 25) lining = 'no-protection'
  else lining = 'exposed'

  return {
    protection, lining, hasHighProtection, hasEncapsulated, hasPrivateByDefault,
    hasNoLeaked, hasImmutable, hasNoMutable, hasSealed, hasNoOpen,
    hasHiddenInternals, hasNoExposedGuts, hasGuarded, leakedCount, mutableCount,
  }
}

/**
 * Measure jewel clarity (clarifying)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.jewel) // 'flawless-diamond'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0

  const hasClearPurpose = hasExport(content) && hasReturnType(content)
  const hasSingleResponsibility = hasNamedExport(content) && hasInterface(content)
  const hasFocused = hasExport(content) && hasImport(content)
  const hasValuable = hasReturnType(content) && hasConst(content)
  const hasCoreClear = hasDocComments(content) && hasReturnType(content)
  const hasEssential = hasNamedExport(content) && hasStrictEq(content)

  score += hasClearPurpose ? 5 : 0
  score += hasSingleResponsibility ? 5 : 0
  score += hasFocused ? 5 : 0
  score += hasValuable ? 5 : 0
  score += hasCoreClear ? 5 : 0
  score += hasEssential ? 5 : 0

  const clarity = Math.min(score, 100)
  const mixedConcernsCount = countMatches(/\bvar\b/, content)
  const scatteredCount = countMatches(/\bany\b/, content)

  const hasNoMixedConcerns = mixedConcernsCount === 0
  const hasNoScattered = scatteredCount === 0
  const hasNoFiller = !has(/\beval\b/, content)
  const hasNoObfuscatedCore = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let jewel: JewelGrade
  if (clarity >= 85) jewel = 'flawless-diamond'
  else if (clarity >= 70) jewel = 'clear-gem'
  else if (clarity >= 55) jewel = 'proper-stone'
  else if (clarity >= 40) jewel = 'cloudy-crystal'
  else if (clarity >= 25) jewel = 'rough-rock'
  else jewel = 'no-jewel'

  return {
    clarity, jewel, hasHighClarity, hasClearPurpose, hasSingleResponsibility,
    hasNoMixedConcerns, hasFocused, hasNoScattered, hasValuable, hasNoFiller,
    hasCoreClear, hasNoObfuscatedCore, hasEssential, mixedConcernsCount, scatteredCount,
  }
}

/**
 * Measure lock reliability (validating)
 * @example
 * const m = measureValidating(content)
 * console.log(m.lock) // 'unbreakable-lock'
 */
export function measureValidating(content: string): ValidatingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasConditional(content) ? 10 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasSwitch(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0

  const hasThoroughValidation = hasStrictEq(content) && hasConditional(content)
  const hasTypeChecked = hasReturnType(content) && hasStrictEq(content)
  const hasBoundaryChecked = hasConditional(content) && hasStrictEq(content)
  const hasErrorHandled = hasTryCatch(content) && hasThrow(content)
  const hasConsistent = hasEnum(content) && hasSwitch(content)
  const hasReliable = hasOptional(content) && hasDefaultParam(content)

  score += hasThoroughValidation ? 5 : 0
  score += hasTypeChecked ? 5 : 0
  score += hasBoundaryChecked ? 5 : 0
  score += hasErrorHandled ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasReliable ? 5 : 0

  const reliability = Math.min(score, 100)
  const castsCount = countMatches(/\bvar\b/, content)
  const uncheckedCount = countMatches(/\bany\b/, content)

  const hasNoCasts = castsCount === 0
  const hasNoUnchecked = uncheckedCount === 0
  const hasNoBareThrow = !has(/\beval\b/, content)
  const hasNoInconsistent = !has(/\bdebugger\b/, content)
  const hasHighReliability = reliability >= 70

  let lock: LockGrade
  if (reliability >= 85) lock = 'unbreakable-lock'
  else if (reliability >= 70) lock = 'reliable-mechanism'
  else if (reliability >= 55) lock = 'proper-lock'
  else if (reliability >= 40) lock = 'sticky-latch'
  else if (reliability >= 25) lock = 'broken-lock'
  else lock = 'no-lock'

  return {
    reliability, lock, hasHighReliability, hasThoroughValidation, hasTypeChecked,
    hasNoCasts, hasBoundaryChecked, hasNoUnchecked, hasErrorHandled, hasNoBareThrow,
    hasConsistent, hasNoInconsistent, hasReliable, castsCount, uncheckedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify pouch condition
 * @example
 * classifyPouchCondition(90) // 'royal-vault'
 */
export function classifyPouchCondition(score: number): PouchCondition {
  if (score >= 85) return 'royal-vault'
  if (score >= 70) return 'luxury-safe'
  if (score >= 55) return 'proper-vault'
  if (score >= 40) return 'basic-locker'
  if (score >= 25) return 'wooden-box'
  return 'dusty-shelf'
}

/**
 * Classify chamber type
 * @example
 * classifyChamberType(pouches) // 'treasury'
 */
export function classifyChamberType(pouches: VelvetPouch[]): ChamberType {
  if (pouches.length === 0) return 'no-chamber'
  const avgQs = Math.round(pouches.reduce((s, p) => s + p.qualityScore, 0) / pouches.length)
  const royalRatio = pouches.filter(p => p.condition === 'royal-vault').length / pouches.length
  if (avgQs >= 75 && royalRatio >= 0.5) return 'treasury'
  if (avgQs >= 60) return 'strongroom'
  if (avgQs >= 45) return 'proper-vault'
  if (avgQs >= 30) return 'closet-safe'
  if (avgQs >= 15) return 'drawer'
  return 'no-chamber'
}

/**
 * Classify chamber condition
 * @example
 * classifyChamberCondition(80) // 'impenetrable-fortress'
 */
export function classifyChamberCondition(avgQs: number): ChamberCondition {
  if (avgQs >= 75) return 'impenetrable-fortress'
  if (avgQs >= 60) return 'secure-vault'
  if (avgQs >= 45) return 'decent-safe'
  if (avgQs >= 30) return 'basic-storage'
  if (avgQs >= 15) return 'unsecured'
  return 'void'
}

/**
 * Classify keeper grade
 * @example
 * classifyKeeperGrade(85) // 'master-keeper'
 */
export function classifyKeeperGrade(avgTreasure: number): KeeperGrade {
  if (avgTreasure >= 80) return 'master-keeper'
  if (avgTreasure >= 65) return 'expert-vault'
  if (avgTreasure >= 50) return 'skilled-guardian'
  if (avgTreasure >= 35) return 'apprentice'
  if (avgTreasure >= 20) return 'novice'
  return 'thief'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(pouches, chambers, treasury, stats)
 */
export function generateRecommendations(
  pouches: VelvetPouch[],
  chambers: VaultChamber[],
  treasury: TreasurySummary,
  stats: VelvetVaultStats,
): string[] {
  const recs: string[] = []
  if (stats.avgSoftnessQuality < 50) {
    recs.push('Improve softness quality with readable APIs, documentation, and intuitive interfaces')
  }
  if (stats.avgVaultSecurity < 50) {
    recs.push('Strengthen vault security with input validation, access control, and proper authentication')
  }
  if (stats.avgLiningProtection < 50) {
    recs.push('Enhance lining protection with encapsulation, immutability, and hidden internals')
  }
  if (stats.avgJewelClarity < 50) {
    recs.push('Sharpen jewel clarity with clear purpose, single responsibility, and focused exports')
  }
  if (stats.avgLockReliability < 50) {
    recs.push('Reinforce lock reliability with thorough validation, type checking, and error handling')
  }
  if (stats.dustyShelfCount > 0) {
    recs.push(`${stats.dustyShelfCount} file(s) are dusty shelves — they need complete vault restoration`)
  }
  if (treasury.overallTreasure < 40) {
    recs.push('Overall treasure quality is poor — focus on security and clarity first')
  }
  const allDusty = chambers.every(c => c.chamberType === 'no-chamber' || c.chamberType === 'drawer')
  if (allDusty && chambers.length > 0) {
    recs.push('All chambers are unsecured — consider a major vault reconstruction')
  }
  const dustyFiles = pouches.filter(p => p.condition === 'dusty-shelf').map(p => p.file)
  if (dustyFiles.length > 0 && dustyFiles.length <= 3) {
    recs.push(`Restore these dusty shelves into vault pouches: ${dustyFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your velvet vault achieves master-keeper grade! Every gem rests securely on silk velvet')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as velvet pouch
 * @example
 * const p = analyzeVelvetPouch(content, 'index.ts')
 * console.log(p.condition) // 'royal-vault'
 */
export function analyzeVelvetPouch(content: string, filePath: string): VelvetPouch {
  const cushioning = measureCushioning(content)
  const securing = measureSecuring(content)
  const protecting = measureProtecting(content)
  const clarifying = measureClarifying(content)
  const validating = measureValidating(content)

  const qualityScore = Math.round(
    cushioning.quality * 0.2 +
    securing.security * 0.2 +
    protecting.protection * 0.2 +
    clarifying.clarity * 0.2 +
    validating.reliability * 0.2,
  )

  return {
    file: filePath,
    softnessQuality: cushioning.quality,
    vaultSecurity: securing.security,
    liningProtection: protecting.protection,
    jewelClarity: clarifying.clarity,
    lockReliability: validating.reliability,
    cushioning,
    securing,
    protecting,
    clarifying,
    validating,
    condition: classifyPouchCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as vault chamber
 * @example
 * const c = analyzeVaultChamber(pouches, 'src')
 * console.log(c.chamberType) // 'treasury'
 */
export function analyzeVaultChamber(pouches: VelvetPouch[], dirPath: string): VaultChamber {
  if (pouches.length === 0) {
    return {
      directory: dirPath, pouches: [], avgSoftness: 0, avgSecurity: 0,
      avgClarity: 0, royalVaultCount: 0, dustyShelfCount: 0,
      chamberType: 'no-chamber', condition: 'void',
    }
  }

  const avgSoftness = Math.round(pouches.reduce((s, p) => s + p.softnessQuality, 0) / pouches.length)
  const avgSecurity = Math.round(pouches.reduce((s, p) => s + p.vaultSecurity, 0) / pouches.length)
  const avgClarity = Math.round(pouches.reduce((s, p) => s + p.jewelClarity, 0) / pouches.length)
  const royalVaultCount = pouches.filter(p => p.condition === 'royal-vault').length
  const dustyShelfCount = pouches.filter(p => p.condition === 'dusty-shelf').length
  const avgQs = Math.round(pouches.reduce((s, p) => s + p.qualityScore, 0) / pouches.length)

  return {
    directory: dirPath, pouches, avgSoftness, avgSecurity, avgClarity,
    royalVaultCount, dustyShelfCount,
    chamberType: classifyChamberType(pouches),
    condition: classifyChamberCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete velvet vault result
 * @example
 * const result = await buildVelvetVaultResult(files, contents)
 * console.log(result.stats.keeperGrade) // 'master-keeper'
 */
export async function buildVelvetVaultResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<VelvetVaultResult> {
  const pouches = files.map((file, i) => analyzeVelvetPouch(contents[i] ?? '', file))

  const dirMap = new Map<string, VelvetPouch[]>()
  for (const pouch of pouches) {
    const dir = path.dirname(pouch.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(pouch) } else { dirMap.set(dir, [pouch]) }
  }

  const chambers = Array.from(dirMap.entries()).map(([dir, dirPouches]) =>
    analyzeVaultChamber(dirPouches, dir),
  )

  const avgSoftness = pouches.length > 0
    ? Math.round(pouches.reduce((s, p) => s + p.softnessQuality, 0) / pouches.length) : 0
  const avgSecurity = pouches.length > 0
    ? Math.round(pouches.reduce((s, p) => s + p.vaultSecurity, 0) / pouches.length) : 0
  const avgClarity = pouches.length > 0
    ? Math.round(pouches.reduce((s, p) => s + p.jewelClarity, 0) / pouches.length) : 0

  const overallTreasure = pouches.length > 0
    ? Math.round((avgSoftness + avgSecurity + avgClarity) / 3) : 0
  const isSecure = avgSecurity >= 60

  const treasury: TreasurySummary = { avgSoftness, avgSecurity, avgClarity, isSecure, overallTreasure }

  const avgLiningProtection = pouches.length > 0
    ? Math.round(pouches.reduce((s, p) => s + p.liningProtection, 0) / pouches.length) : 0
  const avgLockReliability = pouches.length > 0
    ? Math.round(pouches.reduce((s, p) => s + p.lockReliability, 0) / pouches.length) : 0

  const bestPouch = pouches.length > 0
    ? pouches.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const softest = pouches.length > 0
    ? pouches.reduce((best, p) => p.softnessQuality > best.softnessQuality ? p : best).file : ''
  const mostSecure = pouches.length > 0
    ? pouches.reduce((best, p) => p.vaultSecurity > best.vaultSecurity ? p : best).file : ''
  const mostProtected = pouches.length > 0
    ? pouches.reduce((best, p) => p.liningProtection > best.liningProtection ? p : best).file : ''
  const clearest = pouches.length > 0
    ? pouches.reduce((best, p) => p.jewelClarity > best.jewelClarity ? p : best).file : ''

  const stats: VelvetVaultStats = {
    totalFiles: pouches.length,
    totalChambers: chambers.length,
    avgSoftnessQuality: avgSoftness,
    avgVaultSecurity: avgSecurity,
    avgLiningProtection,
    avgJewelClarity: avgClarity,
    avgLockReliability,
    royalVaultCount: pouches.filter(p => p.condition === 'royal-vault').length,
    luxurySafeCount: pouches.filter(p => p.condition === 'luxury-safe').length,
    properVaultCount: pouches.filter(p => p.condition === 'proper-vault').length,
    basicLockerCount: pouches.filter(p => p.condition === 'basic-locker').length,
    woodenBoxCount: pouches.filter(p => p.condition === 'wooden-box').length,
    dustyShelfCount: pouches.filter(p => p.condition === 'dusty-shelf').length,
    hasHighSoftnessCount: pouches.filter(p => p.cushioning.hasHighQuality).length,
    hasHighSecurityCount: pouches.filter(p => p.securing.hasHighSecurity).length,
    hasHighProtectionCount: pouches.filter(p => p.protecting.hasHighProtection).length,
    hasHighClarityCount: pouches.filter(p => p.clarifying.hasHighClarity).length,
    hasHighReliabilityCount: pouches.filter(p => p.validating.hasHighReliability).length,
    overallTreasure,
    keeperGrade: classifyKeeperGrade(overallTreasure),
    bestPouch, softest, mostSecure, mostProtected, clearest,
  }

  const recommendations = generateRecommendations(pouches, chambers, treasury, stats)

  return { pouches, chambers, treasury, stats, recommendations }
}

/**
 * Gather files matching patterns
 * @example
 * const files = gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string, exts: string[], ignore: string[],
): Promise<string[]> {
  const extensions = exts.length > 0 ? exts : ['.ts', '.js', '.tsx', '.jsx']
  const patterns = extensions.map(ext => `**/*${ext}`)
  const ignorePatterns = ignore.length > 0 ? ignore : ['**/node_modules/**', '**/dist/**', '**/.git/**']
  const entries = await fg(patterns, { cwd: targetPath, ignore: ignorePatterns, absolute: true })
  return Array.from(new Set(entries)).sort()
}
