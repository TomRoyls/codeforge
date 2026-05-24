import { describe, it, expect } from 'vitest'
import {
  measureCushioning,
  measureSecuring,
  measureProtecting,
  measureClarifying,
  measureValidating,
  classifyPouchCondition,
  classifyChamberType,
  classifyChamberCondition,
  classifyKeeperGrade,
  analyzeVelvetPouch,
  analyzeVaultChamber,
  buildVelvetVaultResult,
  generateRecommendations,
} from '../src/commands/velvet-vault-helpers.js'
import {
  colorScore,
  colorGrade,
  formatPouchTable,
  formatPouchesTable,
  formatChamberTable,
  formatChambersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/velvet-vault-format-helpers.js'
import type {
  VelvetPouch,
  VelvetVaultResult,
  VelvetVaultStats,
} from '../src/commands/velvet-vault-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const emptyContent = ''

const minimalContent = `const x = 1`

const moderateContent = `
import { foo } from 'bar'
export interface User {
  name: string
  age: number
}
export type UserRole = 'admin' | 'user'
export function getUser(id: string): User | null {
  if (id === '1') return { name: 'test', age: 20 }
  return null
}
const users: User[] = []
`

const richContent = `
import { z } from 'zod'
import type { Config } from './config.js'

/**
 * User configuration interface
 */
export interface UserConfig {
  readonly name: string
  readonly age: number
  readonly role: UserRole
  nickname?: string
}

export type UserRole = 'admin' | 'user' | 'moderator'
export type Maybe<T> = T | null

/**
 * Create a new user with validation
 */
export async function createUser(input: string): Promise<UserConfig> {
  const config: Config = JSON.parse(input)
  if (config.name === undefined || config.name === null) {
    throw new Error('Name required')
  }
  try {
    const result = await validateConfig(config)
    return result ?? defaultValue()
  } catch (error) {
    return handleDefault(config)
  }
}

export function handleDefault(config: Config): UserConfig {
  return config ?? { name: 'default', age: 0, role: 'user' }
}

export function defaultValue(): UserConfig {
  return { name: 'default', age: 0, role: 'user' }
}

enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}

switch (status) {
  case Status.Active:
    break
  case Status.Inactive:
    break
  default:
    break
}

const filtered = users.filter(u => u.age > 18).map(u => u.name)
const total = users.reduce((sum, u) => sum + u.age, 0)
`

const poorContent = `var x = 1; var y = 2; any; eval("test"); debugger;`

// ─── measureCushioning ────────────────────────────────────────────

describe('measureCushioning', () => {
  it('returns 0 quality for empty content', () => {
    const m = measureCushioning(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('no-lining')
    expect(m.hasHighQuality).toBe(false)
  })

  it('detects readable patterns in rich content', () => {
    const m = measureCushioning(richContent)
    expect(m.hasReadable).toBe(true)
    expect(m.hasWellDocumented).toBe(true)
    expect(m.hasFriendlyAPI).toBe(true)
  })

  it('detects cryptic code in poor content', () => {
    const m = measureCushioning(poorContent)
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
    expect(m.hostileAPICount).toBeGreaterThan(0)
    expect(m.hasNoHostileAPI).toBe(false)
  })

  it('detects intuitive patterns in rich content', () => {
    const m = measureCushioning(richContent)
    expect(m.hasIntuitive).toBe(true)
    expect(m.hasApproachable).toBe(true)
    expect(m.hasWelcoming).toBe(true)
  })

  it('classifies grade correctly', () => {
    expect(measureCushioning(richContent).grade).not.toBe('no-lining')
    expect(measureCushioning(emptyContent).grade).toBe('no-lining')
  })

  it('has quality capped at 100', () => {
    const m = measureCushioning(richContent)
    expect(m.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureSecuring ──────────────────────────────────────────────

describe('measureSecuring', () => {
  it('returns 0 security for empty content', () => {
    const m = measureSecuring(emptyContent)
    expect(m.security).toBe(0)
    expect(m.vault).toBe('no-security')
    expect(m.hasHighSecurity).toBe(false)
  })

  it('detects input validation in rich content', () => {
    const m = measureSecuring(richContent)
    expect(m.hasInputValidation).toBe(true)
    expect(m.hasSanitization).toBe(true)
    expect(m.hasAuthentication).toBe(true)
  })

  it('detects unprotected code in poor content', () => {
    const m = measureSecuring(poorContent)
    expect(m.unprotectedCount).toBeGreaterThan(0)
    expect(m.hasNoUnprotected).toBe(false)
    expect(m.anonymousCount).toBeGreaterThan(0)
    expect(m.hasNoAnonymous).toBe(false)
  })

  it('detects authorization and encryption patterns in rich content', () => {
    const m = measureSecuring(richContent)
    expect(m.hasAuthorization).toBe(true)
    expect(m.hasSanitization).toBe(true)
  })

  it('classifies vault correctly', () => {
    expect(measureSecuring(emptyContent).vault).toBe('no-security')
    expect(measureSecuring(richContent).vault).not.toBe('no-security')
  })

  it('has security capped at 100', () => {
    const m = measureSecuring(richContent)
    expect(m.security).toBeLessThanOrEqual(100)
  })
})

// ─── measureProtecting ────────────────────────────────────────────

describe('measureProtecting', () => {
  it('returns 0 protection for empty content', () => {
    const m = measureProtecting(emptyContent)
    expect(m.protection).toBe(0)
    expect(m.lining).toBe('exposed')
    expect(m.hasHighProtection).toBe(false)
  })

  it('detects encapsulated patterns in rich content', () => {
    const m = measureProtecting(richContent)
    expect(m.hasImmutable).toBe(true)
    expect(m.hasSealed).toBe(true)
    expect(m.hasGuarded).toBe(true)
  })

  it('detects leaked code in poor content', () => {
    const m = measureProtecting(poorContent)
    expect(m.leakedCount).toBeGreaterThan(0)
    expect(m.hasNoLeaked).toBe(false)
    expect(m.mutableCount).toBeGreaterThan(0)
    expect(m.hasNoMutable).toBe(false)
  })

  it('detects sealed and guarded patterns in rich content', () => {
    const m = measureProtecting(richContent)
    expect(m.hasSealed).toBe(true)
    expect(m.hasGuarded).toBe(true)
  })

  it('classifies lining correctly', () => {
    expect(measureProtecting(emptyContent).lining).toBe('exposed')
    expect(measureProtecting(richContent).lining).not.toBe('exposed')
  })

  it('has protection capped at 100', () => {
    const m = measureProtecting(richContent)
    expect(m.protection).toBeLessThanOrEqual(100)
  })
})

// ─── measureClarifying ────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 clarity for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.jewel).toBe('no-jewel')
    expect(m.hasHighClarity).toBe(false)
  })

  it('detects clear purpose in rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasClearPurpose).toBe(true)
    expect(m.hasSingleResponsibility).toBe(true)
    expect(m.hasFocused).toBe(true)
  })

  it('detects mixed concerns in poor content', () => {
    const m = measureClarifying(poorContent)
    expect(m.mixedConcernsCount).toBeGreaterThan(0)
    expect(m.hasNoMixedConcerns).toBe(false)
    expect(m.scatteredCount).toBeGreaterThan(0)
    expect(m.hasNoScattered).toBe(false)
  })

  it('detects valuable and essential patterns in rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasValuable).toBe(true)
    expect(m.hasCoreClear).toBe(true)
    expect(m.hasEssential).toBe(true)
  })

  it('classifies jewel correctly', () => {
    expect(measureClarifying(emptyContent).jewel).toBe('no-jewel')
    expect(measureClarifying(richContent).jewel).not.toBe('no-jewel')
  })

  it('has clarity capped at 100', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeLessThanOrEqual(100)
  })
})

// ─── measureValidating ────────────────────────────────────────────

describe('measureValidating', () => {
  it('returns 0 reliability for empty content', () => {
    const m = measureValidating(emptyContent)
    expect(m.reliability).toBe(0)
    expect(m.lock).toBe('no-lock')
    expect(m.hasHighReliability).toBe(false)
  })

  it('detects thorough validation in rich content', () => {
    const m = measureValidating(richContent)
    expect(m.hasThoroughValidation).toBe(true)
    expect(m.hasTypeChecked).toBe(true)
    expect(m.hasBoundaryChecked).toBe(true)
  })

  it('detects casts in poor content', () => {
    const m = measureValidating(poorContent)
    expect(m.castsCount).toBeGreaterThan(0)
    expect(m.hasNoCasts).toBe(false)
    expect(m.uncheckedCount).toBeGreaterThan(0)
    expect(m.hasNoUnchecked).toBe(false)
  })

  it('detects error handling and consistency in rich content', () => {
    const m = measureValidating(richContent)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasReliable).toBe(true)
  })

  it('classifies lock correctly', () => {
    expect(measureValidating(emptyContent).lock).toBe('no-lock')
    expect(measureValidating(richContent).lock).not.toBe('no-lock')
  })

  it('has reliability capped at 100', () => {
    const m = measureValidating(richContent)
    expect(m.reliability).toBeLessThanOrEqual(100)
  })
})

// ─── classifyPouchCondition ───────────────────────────────────────

describe('classifyPouchCondition', () => {
  it('classifies royal-vault for high scores', () => {
    expect(classifyPouchCondition(90)).toBe('royal-vault')
    expect(classifyPouchCondition(85)).toBe('royal-vault')
  })

  it('classifies luxury-safe for good scores', () => {
    expect(classifyPouchCondition(70)).toBe('luxury-safe')
    expect(classifyPouchCondition(75)).toBe('luxury-safe')
  })

  it('classifies proper-vault for moderate scores', () => {
    expect(classifyPouchCondition(55)).toBe('proper-vault')
    expect(classifyPouchCondition(60)).toBe('proper-vault')
  })

  it('classifies basic-locker for low scores', () => {
    expect(classifyPouchCondition(40)).toBe('basic-locker')
    expect(classifyPouchCondition(45)).toBe('basic-locker')
  })

  it('classifies wooden-box for poor scores', () => {
    expect(classifyPouchCondition(25)).toBe('wooden-box')
    expect(classifyPouchCondition(30)).toBe('wooden-box')
  })

  it('classifies dusty-shelf for very low scores', () => {
    expect(classifyPouchCondition(0)).toBe('dusty-shelf')
    expect(classifyPouchCondition(10)).toBe('dusty-shelf')
    expect(classifyPouchCondition(24)).toBe('dusty-shelf')
  })
})

// ─── classifyChamberType ──────────────────────────────────────────

describe('classifyChamberType', () => {
  it('returns no-chamber for empty pouches', () => {
    expect(classifyChamberType([])).toBe('no-chamber')
  })

  it('classifies treasury for high quality with royal ratio', () => {
    const pouch: VelvetPouch = {
      file: 'a.ts', softnessQuality: 90, vaultSecurity: 90, liningProtection: 90,
      jewelClarity: 90, lockReliability: 90,
      cushioning: { quality: 90, grade: 'silk-velvet', hasHighQuality: true, hasReadable: true, hasWellDocumented: true, hasNoCryptic: true, hasFriendlyAPI: true, hasNoHostileAPI: true, hasIntuitive: true, hasNoCounterintuitive: true, hasApproachable: true, hasNoIntimidating: true, hasWelcoming: true, crypticCount: 0, hostileAPICount: 0 },
      securing: { security: 90, vault: 'fort-knox', hasHighSecurity: true, hasInputValidation: true, hasAccessControl: true, hasNoUnprotected: true, hasAuthentication: true, hasNoAnonymous: true, hasSanitization: true, hasNoRawInput: true, hasAuthorization: true, hasNoPrivilegeEscalation: true, hasEncrypted: true, unprotectedCount: 0, anonymousCount: 0 },
      protecting: { protection: 90, lining: 'silk-lining', hasHighProtection: true, hasEncapsulated: true, hasPrivateByDefault: true, hasNoLeaked: true, hasImmutable: true, hasNoMutable: true, hasSealed: true, hasNoOpen: true, hasHiddenInternals: true, hasNoExposedGuts: true, hasGuarded: true, leakedCount: 0, mutableCount: 0 },
      clarifying: { clarity: 90, jewel: 'flawless-diamond', hasHighClarity: true, hasClearPurpose: true, hasSingleResponsibility: true, hasNoMixedConcerns: true, hasFocused: true, hasNoScattered: true, hasValuable: true, hasNoFiller: true, hasCoreClear: true, hasNoObfuscatedCore: true, hasEssential: true, mixedConcernsCount: 0, scatteredCount: 0 },
      validating: { reliability: 90, lock: 'unbreakable-lock', hasHighReliability: true, hasThoroughValidation: true, hasTypeChecked: true, hasNoCasts: true, hasBoundaryChecked: true, hasNoUnchecked: true, hasErrorHandled: true, hasNoBareThrow: true, hasConsistent: true, hasNoInconsistent: true, hasReliable: true, castsCount: 0, uncheckedCount: 0 },
      condition: 'royal-vault', qualityScore: 90,
    }
    const result = classifyChamberType([pouch])
    expect(result).toBe('treasury')
  })
})

// ─── classifyChamberCondition ─────────────────────────────────────

describe('classifyChamberCondition', () => {
  it('classifies impenetrable-fortress for high avg', () => {
    expect(classifyChamberCondition(80)).toBe('impenetrable-fortress')
    expect(classifyChamberCondition(75)).toBe('impenetrable-fortress')
  })

  it('classifies secure-vault for good avg', () => {
    expect(classifyChamberCondition(60)).toBe('secure-vault')
    expect(classifyChamberCondition(70)).toBe('secure-vault')
  })

  it('classifies decent-safe for moderate avg', () => {
    expect(classifyChamberCondition(45)).toBe('decent-safe')
    expect(classifyChamberCondition(55)).toBe('decent-safe')
  })

  it('classifies void for zero avg', () => {
    expect(classifyChamberCondition(0)).toBe('void')
    expect(classifyChamberCondition(10)).toBe('void')
  })
})

// ─── classifyKeeperGrade ──────────────────────────────────────────

describe('classifyKeeperGrade', () => {
  it('classifies master-keeper for high treasure', () => {
    expect(classifyKeeperGrade(85)).toBe('master-keeper')
    expect(classifyKeeperGrade(80)).toBe('master-keeper')
  })

  it('classifies expert-vault for good treasure', () => {
    expect(classifyKeeperGrade(65)).toBe('expert-vault')
    expect(classifyKeeperGrade(70)).toBe('expert-vault')
  })

  it('classifies skilled-guardian for moderate treasure', () => {
    expect(classifyKeeperGrade(50)).toBe('skilled-guardian')
    expect(classifyKeeperGrade(55)).toBe('skilled-guardian')
  })

  it('classifies apprentice for low treasure', () => {
    expect(classifyKeeperGrade(35)).toBe('apprentice')
    expect(classifyKeeperGrade(40)).toBe('apprentice')
  })

  it('classifies novice for poor treasure', () => {
    expect(classifyKeeperGrade(20)).toBe('novice')
    expect(classifyKeeperGrade(25)).toBe('novice')
  })

  it('classifies thief for zero treasure', () => {
    expect(classifyKeeperGrade(0)).toBe('thief')
    expect(classifyKeeperGrade(10)).toBe('thief')
  })
})

// ─── analyzeVelvetPouch ───────────────────────────────────────────

describe('analyzeVelvetPouch', () => {
  it('analyzes empty content', () => {
    const pouch = analyzeVelvetPouch(emptyContent, 'empty.ts')
    expect(pouch.file).toBe('empty.ts')
    expect(pouch.qualityScore).toBe(0)
    expect(pouch.condition).toBe('dusty-shelf')
  })

  it('analyzes rich content with high scores', () => {
    const pouch = analyzeVelvetPouch(richContent, 'rich.ts')
    expect(pouch.qualityScore).toBeGreaterThan(50)
    expect(pouch.condition).not.toBe('dusty-shelf')
  })

  it('computes qualityScore as weighted average of 5 measures', () => {
    const pouch = analyzeVelvetPouch(moderateContent, 'mod.ts')
    const expected = Math.round(
      pouch.cushioning.quality * 0.2 +
      pouch.securing.security * 0.2 +
      pouch.protecting.protection * 0.2 +
      pouch.clarifying.clarity * 0.2 +
      pouch.validating.reliability * 0.2,
    )
    expect(pouch.qualityScore).toBe(expected)
  })

  it('propagates measure scores to pouch fields', () => {
    const pouch = analyzeVelvetPouch(richContent, 'rich.ts')
    expect(pouch.softnessQuality).toBe(pouch.cushioning.quality)
    expect(pouch.vaultSecurity).toBe(pouch.securing.security)
    expect(pouch.liningProtection).toBe(pouch.protecting.protection)
    expect(pouch.jewelClarity).toBe(pouch.clarifying.clarity)
    expect(pouch.lockReliability).toBe(pouch.validating.reliability)
  })
})

// ─── analyzeVaultChamber ──────────────────────────────────────────

describe('analyzeVaultChamber', () => {
  it('returns empty chamber for no pouches', () => {
    const chamber = analyzeVaultChamber([], 'empty-dir')
    expect(chamber.directory).toBe('empty-dir')
    expect(chamber.pouches).toHaveLength(0)
    expect(chamber.chamberType).toBe('no-chamber')
    expect(chamber.condition).toBe('void')
  })

  it('computes averages from pouches', () => {
    const pouch = analyzeVelvetPouch(richContent, 'dir/rich.ts')
    const chamber = analyzeVaultChamber([pouch], 'dir')
    expect(chamber.avgSoftness).toBe(pouch.softnessQuality)
    expect(chamber.avgSecurity).toBe(pouch.vaultSecurity)
    expect(chamber.avgClarity).toBe(pouch.jewelClarity)
  })
})

// ─── buildVelvetVaultResult ───────────────────────────────────────

describe('buildVelvetVaultResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildVelvetVaultResult([], [])
    expect(result.pouches).toHaveLength(0)
    expect(result.chambers).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.treasury.isSecure).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildVelvetVaultResult(['index.ts'], [richContent])
    expect(result.pouches).toHaveLength(1)
    expect(result.chambers).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('analyzes multiple files in same directory', async () => {
    const result = await buildVelvetVaultResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.pouches).toHaveLength(2)
    expect(result.chambers).toHaveLength(1)
  })

  it('computes treasury summary correctly', async () => {
    const result = await buildVelvetVaultResult(['a.ts'], [richContent])
    expect(result.treasury.avgSoftness).toBeGreaterThan(0)
    expect(result.treasury.avgSecurity).toBeGreaterThan(0)
    expect(result.treasury.avgClarity).toBeGreaterThan(0)
    expect(result.treasury.overallTreasure).toBeGreaterThan(0)
  })

  it('computes condition counts', async () => {
    const result = await buildVelvetVaultResult(
      ['g.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.royalVaultCount +
      result.stats.luxurySafeCount +
      result.stats.properVaultCount +
      result.stats.basicLockerCount +
      result.stats.woodenBoxCount +
      result.stats.dustyShelfCount
    expect(total).toBe(2)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildVelvetVaultResult(['a.ts'], [richContent])
    expect(result.stats.hasHighSoftnessCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighSecurityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighProtectionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighReliabilityCount).toBeGreaterThanOrEqual(0)
  })

  it('computes best fields', async () => {
    const result = await buildVelvetVaultResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.bestPouch).toBeDefined()
    expect(result.stats.softest).toBeDefined()
    expect(result.stats.mostSecure).toBeDefined()
    expect(result.stats.mostProtected).toBeDefined()
    expect(result.stats.clearest).toBeDefined()
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive recommendation for good code', async () => {
    const result = await buildVelvetVaultResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('suggests softness quality improvement for low quality', async () => {
    const result = await buildVelvetVaultResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('softness quality') || r.includes('Softness'))
    expect(rec).toBe(true)
  })

  it('suggests vault security improvement for low security', async () => {
    const result = await buildVelvetVaultResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('vault security') || r.includes('security'))
    expect(rec).toBe(true)
  })

  it('suggests jewel clarity improvement for low clarity', async () => {
    const result = await buildVelvetVaultResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('jewel clarity') || r.includes('clarity'))
    expect(rec).toBe(true)
  })

  it('mentions dusty shelves', async () => {
    const result = await buildVelvetVaultResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('dusty'))
    expect(rec).toBe(true)
  })
})

// ─── colorScore ───────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

// ─── colorGrade ───────────────────────────────────────────────────

describe('colorGrade', () => {
  it('returns a string for any grade', () => {
    expect(typeof colorGrade('silk-velvet')).toBe('string')
    expect(typeof colorGrade('dusty-shelf')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

// ─── formatPouchTable ─────────────────────────────────────────────

describe('formatPouchTable', () => {
  it('formats a pouch', () => {
    const pouch = analyzeVelvetPouch(richContent, 'rich.ts')
    const formatted = formatPouchTable(pouch)
    expect(formatted).toContain('rich.ts')
    expect(formatted).toContain('Softness Quality')
    expect(formatted).toContain('Vault Security')
    expect(formatted).toContain('Lining Protection')
    expect(formatted).toContain('Score')
  })
})

// ─── formatPouchesTable ──────────────────────────────────────────

describe('formatPouchesTable', () => {
  it('returns message for empty pouches', () => {
    expect(formatPouchesTable([])).toContain('No velvet pouches')
  })
})

// ─── formatChamberTable ──────────────────────────────────────────

describe('formatChamberTable', () => {
  it('formats a chamber', () => {
    const pouch = analyzeVelvetPouch(richContent, 'src/a.ts')
    const chamber = analyzeVaultChamber([pouch], 'src')
    const formatted = formatChamberTable(chamber)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Chamber:')
    expect(formatted).toContain('Type:')
  })
})

// ─── formatChambersTable ─────────────────────────────────────────

describe('formatChambersTable', () => {
  it('returns message for empty chambers', () => {
    expect(formatChambersTable([])).toContain('No vault chambers')
  })
})

// ─── formatStatsTable ─────────────────────────────────────────────

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildVelvetVaultResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Overall Treasure')
    expect(formatted).toContain('Keeper Grade')
    expect(formatted).toContain('Best Pouch')
  })
})

// ─── formatRecommendations ────────────────────────────────────────

describe('formatRecommendations', () => {
  it('returns message for empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

// ─── formatResultTable ────────────────────────────────────────────

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildVelvetVaultResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Velvet Vault Analysis')
    expect(formatted).toContain('Vault Chambers')
    expect(formatted).toContain('Velvet Vault Statistics')
    expect(formatted).toContain('Treasury')
    expect(formatted).toContain('Recommendations')
  })
})

// ─── formatResultJson ─────────────────────────────────────────────

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildVelvetVaultResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.pouches).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.treasury).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── integration ──────────────────────────────────────────────────

describe('integration', () => {
  it('full pipeline with mixed content', async () => {
    const result = await buildVelvetVaultResult(
      ['src/good.ts', 'src/bad.ts', 'lib/mod.ts'],
      [richContent, poorContent, moderateContent],
    )
    expect(result.pouches).toHaveLength(3)
    expect(result.chambers).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.treasury.overallTreasure).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('treasury isSecure for high security', async () => {
    const result = await buildVelvetVaultResult(
      Array.from({ length: 5 }, (_, i) => `file${i}.ts`),
      Array.from({ length: 5 }, () => richContent),
    )
    expect(result.treasury.isSecure).toBe(true)
  })

  it('treasury is not secure for low security', async () => {
    const result = await buildVelvetVaultResult(['empty.ts'], [emptyContent])
    expect(result.treasury.isSecure).toBe(false)
  })

  it('overallTreasure equals avg of softness, security, clarity', async () => {
    const result = await buildVelvetVaultResult(['a.ts'], [moderateContent])
    const expected = Math.round((result.treasury.avgSoftness + result.treasury.avgSecurity + result.treasury.avgClarity) / 3)
    expect(result.treasury.overallTreasure).toBe(expected)
  })
})
