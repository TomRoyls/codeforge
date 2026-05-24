import { describe, it, expect } from 'vitest'
import {
  measurePerfecting,
  measureClarifying,
  measureStrengthening,
  measurePrecisioning,
  measureKnowing,
  classifyPeakCondition,
  classifyRangeType,
  classifyRangeCondition,
  classifyClimberGrade,
  analyzePlatinumPeak,
  analyzeMountainRange,
  buildPlatinumZenithResult,
  generateRecommendations,
} from '../src/commands/platinum-zenith-helpers.js'
import {
  colorScore,
  colorGrade,
  formatPeakTable,
  formatPeaksTable,
  formatRangeTable,
  formatRangesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/platinum-zenith-format-helpers.js'
import type {
  PlatinumPeak,
  MountainRange,
  PlatinumZenithStats,
  PlatinumExpedition,
  PlatinumZenithResult,
} from '../src/commands/platinum-zenith-helpers.js'

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
  email?: string
}

export enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export type Status = 'active' | 'inactive' | 'pending'

export class UserService<T extends UserConfig> {
  private users: T[] = []

  async addUser(user: T): Promise<void> {
    try {
      this.users.push(user)
    } catch (error) {
      throw new Error('Failed to add user')
    }
  }

  getUser(id: string): T | undefined {
    return this.users.find(u => u.name === id)
  }
}

export function processUsers<T>(items: T[], fn: (item: T) => boolean): T[] {
  return items.filter(fn).map(item => item)
}

const config: Config = {
  name: 'test',
  version: 1,
}

export default config
`

const negativeContent = `
var x = 1
var y: any = null
eval("test")
debugger
`

// ─── measurePerfecting ──────────────────────────────────────────────

describe('measurePerfecting', () => {
  it('returns 0 for empty content', () => {
    const m = measurePerfecting(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('no-ascent')
    expect(m.hasHighQuality).toBe(false)
  })

  it('measures minimal content with const', () => {
    const m = measurePerfecting(minimalContent)
    expect(m.quality).toBe(4)
    expect(m.grade).toBe('no-ascent')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores moderate content with exports and interfaces', () => {
    const m = measurePerfecting(moderateContent)
    expect(m.quality).toBeGreaterThan(0)
    expect(m.hasExcellent).toBe(true)
    expect(m.hasPolished).toBe(false)
  })

  it('scores rich content highly', () => {
    const m = measurePerfecting(richContent)
    expect(m.quality).toBeGreaterThan(60)
    expect(m.hasExcellent).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasMasterful).toBe(true)
    expect(m.hasProduction).toBe(true)
    expect(m.hasPerfect).toBe(true)
  })

  it('detects hasExcellent requires export, interface, typeAlias', () => {
    const m = measurePerfecting(moderateContent)
    expect(m.hasExcellent).toBe(true)
  })

  it('detects hasPolished requires namedExport, returnType, generics', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasPolished).toBe(true)
  })

  it('detects hasRefined requires docComments, enum, readonly', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasRefined).toBe(true)
  })

  it('detects hasMasterful requires private, class, optional', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasMasterful).toBe(true)
  })

  it('detects hasProduction requires const, import, unionType', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasProduction).toBe(true)
  })

  it('detects hasPerfect requires async, export, docComments', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasPerfect).toBe(true)
  })

  it('counts rough (var) occurrences', () => {
    const m = measurePerfecting(negativeContent)
    expect(m.roughCount).toBe(2)
  })

  it('counts crude (any) occurrences', () => {
    const m = measurePerfecting(negativeContent)
    expect(m.crudeCount).toBe(1)
  })

  it('detects hasNoRough when no var', () => {
    const m = measurePerfecting(minimalContent)
    expect(m.hasNoRough).toBe(true)
  })

  it('detects hasNoCrude when no any', () => {
    const m = measurePerfecting(minimalContent)
    expect(m.hasNoCrude).toBe(true)
  })

  it('detects hasNoAmateur when no eval', () => {
    const m = measurePerfecting(minimalContent)
    expect(m.hasNoAmateur).toBe(true)
  })

  it('detects hasNoPrototype when no debugger', () => {
    const m = measurePerfecting(minimalContent)
    expect(m.hasNoPrototype).toBe(true)
  })

  it('negative content has rough and crude', () => {
    const m = measurePerfecting(negativeContent)
    expect(m.hasNoRough).toBe(false)
    expect(m.hasNoCrude).toBe(false)
    expect(m.hasNoAmateur).toBe(false)
    expect(m.hasNoPrototype).toBe(false)
  })

  it('grade is platinum-peak for very high quality', () => {
    const m = measurePerfecting(richContent)
    expect(m.grade).toBe('platinum-peak')
  })
})

// ─── measureClarifying ──────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.pinnacle).toBe('no-view')
    expect(m.hasHighClarity).toBe(false)
  })

  it('measures minimal content', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBe(6)
    expect(m.pinnacle).toBe('no-view')
  })

  it('detects hasReadable requires docComments and returnType', () => {
    const m = measureClarifying(richContent)
    expect(m.hasReadable).toBe(true)
  })

  it('detects hasTransparent requires interface and namedExport', () => {
    const m = measureClarifying(richContent)
    expect(m.hasTransparent).toBe(true)
  })

  it('detects hasSelfDocumenting requires typeAlias and generics', () => {
    const m = measureClarifying(richContent)
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('detects hasUnderstandable requires const and export', () => {
    const m = measureClarifying(richContent)
    expect(m.hasUnderstandable).toBe(true)
  })

  it('detects hasClear requires strictEq and optional', () => {
    const m = measureClarifying(richContent)
    expect(m.hasClear).toBe(true)
  })

  it('detects hasVisible requires readonly and enum', () => {
    const m = measureClarifying(richContent)
    expect(m.hasVisible).toBe(true)
  })

  it('counts obfuscated (var) occurrences', () => {
    const m = measureClarifying(negativeContent)
    expect(m.obfuscatedCount).toBe(2)
  })

  it('counts cryptic (any) occurrences', () => {
    const m = measureClarifying(negativeContent)
    expect(m.crypticCount).toBe(1)
  })

  it('detects hasNoObfuscated when no var', () => {
    const m = measureClarifying(minimalContent)
    expect(m.hasNoObfuscated).toBe(true)
  })

  it('detects hasNoCryptic when no any', () => {
    const m = measureClarifying(minimalContent)
    expect(m.hasNoCryptic).toBe(true)
  })

  it('detects hasNoImpenetrable when no eval', () => {
    const m = measureClarifying(minimalContent)
    expect(m.hasNoImpenetrable).toBe(true)
  })

  it('detects hasNoDense when no debugger', () => {
    const m = measureClarifying(minimalContent)
    expect(m.hasNoDense).toBe(true)
  })

  it('negative content fails obfuscated and cryptic checks', () => {
    const m = measureClarifying(negativeContent)
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.hasNoCryptic).toBe(false)
    expect(m.hasNoImpenetrable).toBe(false)
    expect(m.hasNoDense).toBe(false)
  })

  it('rich content has high clarity', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeGreaterThan(60)
    expect(m.hasHighClarity).toBe(true)
  })

  it('grade is zenith-clarity for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.pinnacle).toBe('zenith-clarity')
  })
})

// ─── measureStrengthening ───────────────────────────────────────────

describe('measureStrengthening', () => {
  it('returns 0 for empty content', () => {
    const m = measureStrengthening(emptyContent)
    expect(m.resilience).toBe(0)
    expect(m.summit).toBe('no-summit')
    expect(m.hasHighResilience).toBe(false)
  })

  it('measures minimal content with const', () => {
    const m = measureStrengthening(minimalContent)
    expect(m.resilience).toBe(6)
  })

  it('detects hasErrorHandled requires strictEq and tryCatch', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasErrorHandled).toBe(true)
  })

  it('detects hasEdgeCaseCovered requires throw and conditional', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasEdgeCaseCovered).toBe(false)
  })

  it('detects hasDefensive requires nullishCoalescing and returnType', () => {
    const m = measureStrengthening(moderateContent)
    expect(m.hasDefensive).toBe(false)
  })

  it('detects hasValidated requires interface and optional', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasValidated).toBe(true)
  })

  it('detects hasRobust requires const and readonly', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasRobust).toBe(true)
  })

  it('detects hasFortified requires enum and private', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasFortified).toBe(true)
  })

  it('counts bareCrash (var) occurrences', () => {
    const m = measureStrengthening(negativeContent)
    expect(m.bareCrashCount).toBe(2)
  })

  it('counts unchecked (any) occurrences', () => {
    const m = measureStrengthening(negativeContent)
    expect(m.uncheckedCount).toBe(1)
  })

  it('detects hasNoBareCrash when no var', () => {
    const m = measureStrengthening(minimalContent)
    expect(m.hasNoBareCrash).toBe(true)
  })

  it('detects hasNoTrusting when no eval', () => {
    const m = measureStrengthening(minimalContent)
    expect(m.hasNoTrusting).toBe(true)
  })

  it('detects hasNoUnchecked when no any', () => {
    const m = measureStrengthening(minimalContent)
    expect(m.hasNoUnchecked).toBe(true)
  })

  it('detects hasNoFragile when no debugger', () => {
    const m = measureStrengthening(minimalContent)
    expect(m.hasNoFragile).toBe(true)
  })

  it('rich content has high resilience', () => {
    const m = measureStrengthening(richContent)
    expect(m.resilience).toBeGreaterThan(60)
    expect(m.hasHighResilience).toBe(true)
  })

  it('grade is granite-summit for rich content', () => {
    const m = measureStrengthening(richContent)
    expect(m.summit).toBe('granite-summit')
  })
})

// ─── measurePrecisioning ────────────────────────────────────────────

describe('measurePrecisioning', () => {
  it('returns 0 for empty content', () => {
    const m = measurePrecisioning(emptyContent)
    expect(m.precision).toBe(0)
    expect(m.altitude).toBe('no-measurement')
    expect(m.hasHighPrecision).toBe(false)
  })

  it('measures minimal content with const', () => {
    const m = measurePrecisioning(minimalContent)
    expect(m.precision).toBe(8)
  })

  it('detects hasExact requires strictEq and returnType', () => {
    const m = measurePrecisioning(moderateContent)
    expect(m.hasExact).toBe(true)
  })

  it('detects hasAccurate requires interface and const', () => {
    const m = measurePrecisioning(moderateContent)
    expect(m.hasAccurate).toBe(true)
  })

  it('detects hasPrecise requires conditional and tryCatch', () => {
    const m = measurePrecisioning(moderateContent)
    expect(m.hasPrecise).toBe(false)
  })

  it('detects hasCorrect requires throw and enum', () => {
    const m = measurePrecisioning(richContent)
    expect(m.hasCorrect).toBe(true)
  })

  it('detects hasSharp requires readonly and optional', () => {
    const m = measurePrecisioning(richContent)
    expect(m.hasSharp).toBe(true)
  })

  it('detects hasDefined requires generics and nullishCoalescing', () => {
    const m = measurePrecisioning(richContent)
    expect(m.hasDefined).toBe(false)
  })

  it('counts approximate (var) occurrences', () => {
    const m = measurePrecisioning(negativeContent)
    expect(m.approximateCount).toBe(2)
  })

  it('counts sloppy (any) occurrences', () => {
    const m = measurePrecisioning(negativeContent)
    expect(m.sloppyCount).toBe(1)
  })

  it('detects hasNoApproximate when no var', () => {
    const m = measurePrecisioning(minimalContent)
    expect(m.hasNoApproximate).toBe(true)
  })

  it('detects hasNoAlmostRight when no any', () => {
    const m = measurePrecisioning(minimalContent)
    expect(m.hasNoAlmostRight).toBe(true)
  })

  it('detects hasNoVague when no eval', () => {
    const m = measurePrecisioning(minimalContent)
    expect(m.hasNoVague).toBe(true)
  })

  it('detects hasNoSloppy when no debugger', () => {
    const m = measurePrecisioning(minimalContent)
    expect(m.hasNoSloppy).toBe(true)
  })

  it('rich content has high precision', () => {
    const m = measurePrecisioning(richContent)
    expect(m.precision).toBeGreaterThan(50)
  })

  it('grade is atomic-clock for very precise content', () => {
    const m = measurePrecisioning(richContent)
    expect(m.altitude).toBe('atomic-clock')
  })
})

// ─── measureKnowing ─────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns 0 for empty content', () => {
    const m = measureKnowing(emptyContent)
    expect(m.wisdom).toBe(0)
    expect(m.zenith).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('measures minimal content with const', () => {
    const m = measureKnowing(minimalContent)
    expect(m.wisdom).toBe(6)
  })

  it('detects hasDocumented requires docComments and export', () => {
    const m = measureKnowing(richContent)
    expect(m.hasDocumented).toBe(true)
  })

  it('detects hasWellNamed requires interface and returnType', () => {
    const m = measureKnowing(richContent)
    expect(m.hasWellNamed).toBe(true)
  })

  it('detects hasDomainAware requires typeAlias and namedExport', () => {
    const m = measureKnowing(richContent)
    expect(m.hasDomainAware).toBe(true)
  })

  it('detects hasPatternBased requires enum and const', () => {
    const m = measureKnowing(richContent)
    expect(m.hasPatternBased).toBe(true)
  })

  it('detects hasInformed requires strictEq and generics', () => {
    const m = measureKnowing(richContent)
    expect(m.hasInformed).toBe(true)
  })

  it('detects hasComprehensive requires async and private', () => {
    const m = measureKnowing(richContent)
    expect(m.hasComprehensive).toBe(true)
  })

  it('counts cryptic (var) occurrences', () => {
    const m = measureKnowing(negativeContent)
    expect(m.crypticCount).toBe(2)
  })

  it('counts adhoc (any) occurrences', () => {
    const m = measureKnowing(negativeContent)
    expect(m.adhocCount).toBe(1)
  })

  it('detects hasNoCryptic when no var', () => {
    const m = measureKnowing(minimalContent)
    expect(m.hasNoCryptic).toBe(true)
  })

  it('detects hasNoAdhoc when no any', () => {
    const m = measureKnowing(minimalContent)
    expect(m.hasNoAdhoc).toBe(true)
  })

  it('detects hasNoContextFree when no eval', () => {
    const m = measureKnowing(minimalContent)
    expect(m.hasNoContextFree).toBe(true)
  })

  it('detects hasNoUninformed when no debugger', () => {
    const m = measureKnowing(minimalContent)
    expect(m.hasNoUninformed).toBe(true)
  })

  it('rich content has high wisdom', () => {
    const m = measureKnowing(richContent)
    expect(m.wisdom).toBeGreaterThan(60)
    expect(m.hasHighWisdom).toBe(true)
  })

  it('grade is omniscient-view for rich content', () => {
    const m = measureKnowing(richContent)
    expect(m.zenith).toBe('omniscient-view')
  })
})

// ─── classifyPeakCondition ──────────────────────────────────────────

describe('classifyPeakCondition', () => {
  it('classifies platinum-masterpiece for 85+', () => {
    expect(classifyPeakCondition(85)).toBe('platinum-masterpiece')
    expect(classifyPeakCondition(100)).toBe('platinum-masterpiece')
  })

  it('classifies golden-summit for 70-84', () => {
    expect(classifyPeakCondition(70)).toBe('golden-summit')
    expect(classifyPeakCondition(84)).toBe('golden-summit')
  })

  it('classifies proper-peak for 55-69', () => {
    expect(classifyPeakCondition(55)).toBe('proper-peak')
    expect(classifyPeakCondition(69)).toBe('proper-peak')
  })

  it('classifies rocky-ridge for 40-54', () => {
    expect(classifyPeakCondition(40)).toBe('rocky-ridge')
    expect(classifyPeakCondition(54)).toBe('rocky-ridge')
  })

  it('classifies gravel-slope for 25-39', () => {
    expect(classifyPeakCondition(25)).toBe('gravel-slope')
    expect(classifyPeakCondition(39)).toBe('gravel-slope')
  })

  it('classifies valley-floor for below 25', () => {
    expect(classifyPeakCondition(0)).toBe('valley-floor')
    expect(classifyPeakCondition(24)).toBe('valley-floor')
  })
})

// ─── classifyRangeType ──────────────────────────────────────────────

describe('classifyRangeType', () => {
  it('returns no-range for empty peaks', () => {
    expect(classifyRangeType([])).toBe('no-range')
  })

  it('returns himalayan-range for high avgQS and high masterpiece ratio', () => {
    const peak = { qualityScore: 90, condition: 'platinum-masterpiece' } as PlatinumPeak
    expect(classifyRangeType([peak, peak])).toBe('himalayan-range')
  })

  it('returns alpine-ridge for avgQS >= 60', () => {
    const peak = { qualityScore: 65, condition: 'golden-summit' } as PlatinumPeak
    expect(classifyRangeType([peak])).toBe('alpine-ridge')
  })

  it('returns proper-mountains for avgQS >= 45', () => {
    const peak = { qualityScore: 50, condition: 'proper-peak' } as PlatinumPeak
    expect(classifyRangeType([peak])).toBe('proper-mountains')
  })

  it('returns rolling-hills for avgQS >= 30', () => {
    const peak = { qualityScore: 35, condition: 'rocky-ridge' } as PlatinumPeak
    expect(classifyRangeType([peak])).toBe('rolling-hills')
  })

  it('returns flat-plain for avgQS >= 15', () => {
    const peak = { qualityScore: 20, condition: 'gravel-slope' } as PlatinumPeak
    expect(classifyRangeType([peak])).toBe('flat-plain')
  })

  it('returns no-range for avgQS below 15', () => {
    const peak = { qualityScore: 5, condition: 'valley-floor' } as PlatinumPeak
    expect(classifyRangeType([peak])).toBe('no-range')
  })
})

// ─── classifyRangeCondition ─────────────────────────────────────────

describe('classifyRangeCondition', () => {
  it('classifies platinum-summit for 75+', () => {
    expect(classifyRangeCondition(75)).toBe('platinum-summit')
    expect(classifyRangeCondition(100)).toBe('platinum-summit')
  })

  it('classifies golden-peak for 60-74', () => {
    expect(classifyRangeCondition(60)).toBe('golden-peak')
    expect(classifyRangeCondition(74)).toBe('golden-peak')
  })

  it('classifies decent-mountain for 45-59', () => {
    expect(classifyRangeCondition(45)).toBe('decent-mountain')
    expect(classifyRangeCondition(59)).toBe('decent-mountain')
  })

  it('classifies rocky-hill for 30-44', () => {
    expect(classifyRangeCondition(30)).toBe('rocky-hill')
    expect(classifyRangeCondition(44)).toBe('rocky-hill')
  })

  it('classifies flatland for 15-29', () => {
    expect(classifyRangeCondition(15)).toBe('flatland')
    expect(classifyRangeCondition(29)).toBe('flatland')
  })

  it('classifies void for below 15', () => {
    expect(classifyRangeCondition(0)).toBe('void')
    expect(classifyRangeCondition(14)).toBe('void')
  })
})

// ─── classifyClimberGrade ───────────────────────────────────────────

describe('classifyClimberGrade', () => {
  it('classifies mountain-master for 80+', () => {
    expect(classifyClimberGrade(80)).toBe('mountain-master')
    expect(classifyClimberGrade(100)).toBe('mountain-master')
  })

  it('classifies expert-alpinist for 65-79', () => {
    expect(classifyClimberGrade(65)).toBe('expert-alpinist')
    expect(classifyClimberGrade(79)).toBe('expert-alpinist')
  })

  it('classifies skilled-climber for 50-64', () => {
    expect(classifyClimberGrade(50)).toBe('skilled-climber')
    expect(classifyClimberGrade(64)).toBe('skilled-climber')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyClimberGrade(35)).toBe('apprentice')
    expect(classifyClimberGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyClimberGrade(20)).toBe('novice')
    expect(classifyClimberGrade(34)).toBe('novice')
  })

  it('classifies armchair-mountaineer for below 20', () => {
    expect(classifyClimberGrade(0)).toBe('armchair-mountaineer')
    expect(classifyClimberGrade(19)).toBe('armchair-mountaineer')
  })
})

// ─── analyzePlatinumPeak ────────────────────────────────────────────

describe('analyzePlatinumPeak', () => {
  it('analyzes empty content', () => {
    const peak = analyzePlatinumPeak(emptyContent, 'empty.ts')
    expect(peak.file).toBe('empty.ts')
    expect(peak.peakQuality).toBe(0)
    expect(peak.pinnacleClarity).toBe(0)
    expect(peak.summitResilience).toBe(0)
    expect(peak.altitudePrecision).toBe(0)
    expect(peak.zenithWisdom).toBe(0)
    expect(peak.qualityScore).toBe(0)
    expect(peak.condition).toBe('valley-floor')
  })

  it('analyzes minimal content', () => {
    const peak = analyzePlatinumPeak(minimalContent, 'mini.ts')
    expect(peak.file).toBe('mini.ts')
    expect(peak.peakQuality).toBe(4)
    expect(peak.pinnacleClarity).toBe(6)
    expect(peak.summitResilience).toBe(6)
    expect(peak.altitudePrecision).toBe(8)
    expect(peak.zenithWisdom).toBe(6)
    expect(peak.qualityScore).toBe(Math.round((4 * 0.2 + 6 * 0.2 + 6 * 0.2 + 8 * 0.2 + 6 * 0.2)))
  })

  it('analyzes rich content with high scores', () => {
    const peak = analyzePlatinumPeak(richContent, 'rich.ts')
    expect(peak.file).toBe('rich.ts')
    expect(peak.peakQuality).toBeGreaterThan(60)
    expect(peak.pinnacleClarity).toBeGreaterThan(60)
    expect(peak.summitResilience).toBeGreaterThan(60)
    expect(peak.altitudePrecision).toBeGreaterThan(50)
    expect(peak.zenithWisdom).toBeGreaterThan(60)
  })

  it('calculates qualityScore as weighted average of 5 measures', () => {
    const peak = analyzePlatinumPeak(richContent, 'scored.ts')
    const expected = Math.round(
      peak.peakQuality * 0.2 +
      peak.pinnacleClarity * 0.2 +
      peak.summitResilience * 0.2 +
      peak.altitudePrecision * 0.2 +
      peak.zenithWisdom * 0.2,
    )
    expect(peak.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const peak = analyzePlatinumPeak(richContent, 'measures.ts')
    expect(peak.perfecting).toBeDefined()
    expect(peak.clarifying).toBeDefined()
    expect(peak.strengthening).toBeDefined()
    expect(peak.precisioning).toBeDefined()
    expect(peak.knowing).toBeDefined()
  })

  it('classifies rich content as platinum-masterpiece', () => {
    const peak = analyzePlatinumPeak(richContent, 'master.ts')
    expect(peak.condition).toBe('platinum-masterpiece')
  })
})

// ─── analyzeMountainRange ───────────────────────────────────────────

describe('analyzeMountainRange', () => {
  it('returns empty range for no peaks', () => {
    const range = analyzeMountainRange([], 'empty-dir')
    expect(range.directory).toBe('empty-dir')
    expect(range.peaks).toHaveLength(0)
    expect(range.avgQuality).toBe(0)
    expect(range.avgClarity).toBe(0)
    expect(range.avgWisdom).toBe(0)
    expect(range.platinumMasterpieceCount).toBe(0)
    expect(range.valleyFloorCount).toBe(0)
    expect(range.rangeType).toBe('no-range')
    expect(range.condition).toBe('void')
  })

  it('analyzes range with single peak', () => {
    const peak = analyzePlatinumPeak(richContent, 'dir/file.ts')
    const range = analyzeMountainRange([peak], 'dir')
    expect(range.peaks).toHaveLength(1)
    expect(range.avgQuality).toBe(peak.peakQuality)
    expect(range.avgClarity).toBe(peak.pinnacleClarity)
    expect(range.avgWisdom).toBe(peak.zenithWisdom)
  })

  it('averages multiple peaks', () => {
    const p1 = analyzePlatinumPeak(richContent, 'dir/a.ts')
    const p2 = analyzePlatinumPeak(minimalContent, 'dir/b.ts')
    const range = analyzeMountainRange([p1, p2], 'dir')
    expect(range.avgQuality).toBe(Math.round((p1.peakQuality + p2.peakQuality) / 2))
    expect(range.avgClarity).toBe(Math.round((p1.pinnacleClarity + p2.pinnacleClarity) / 2))
  })

  it('counts platinum masterpieces', () => {
    const peak = analyzePlatinumPeak(richContent, 'dir/rich.ts')
    const range = analyzeMountainRange([peak], 'dir')
    expect(range.platinumMasterpieceCount).toBe(1)
  })

  it('counts valley floor files', () => {
    const peak = analyzePlatinumPeak(emptyContent, 'dir/empty.ts')
    const range = analyzeMountainRange([peak], 'dir')
    expect(range.valleyFloorCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns success message when everything is great', () => {
    const peak = analyzePlatinumPeak(richContent, 'great.ts')
    const range = analyzeMountainRange([peak], 'dir')
    const result = buildPlatinumZenithResultSync([peak])
    const recs = generateRecommendations([peak], [range], result.expedition, result.stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('platinum zenith')
  })

  it('recommends elevating peak quality when low', () => {
    const peak = analyzePlatinumPeak(emptyContent, 'low.ts')
    const range = analyzeMountainRange([peak], 'dir')
    const result = buildPlatinumZenithResultSync([peak])
    const recs = generateRecommendations([peak], [range], result.expedition, result.stats)
    expect(recs.some(r => r.includes('Elevate peak quality'))).toBe(true)
  })

  it('recommends sharpening pinnacle clarity when low', () => {
    const peak = analyzePlatinumPeak(emptyContent, 'low.ts')
    const result = buildPlatinumZenithResultSync([peak])
    const recs = generateRecommendations([peak], [], result.expedition, result.stats)
    expect(recs.some(r => r.includes('Sharpen pinnacle clarity'))).toBe(true)
  })

  it('recommends fortifying summit resilience when low', () => {
    const peak = analyzePlatinumPeak(emptyContent, 'low.ts')
    const result = buildPlatinumZenithResultSync([peak])
    const recs = generateRecommendations([peak], [], result.expedition, result.stats)
    expect(recs.some(r => r.includes('Fortify summit resilience'))).toBe(true)
  })

  it('recommends refining altitude precision when low', () => {
    const peak = analyzePlatinumPeak(emptyContent, 'low.ts')
    const result = buildPlatinumZenithResultSync([peak])
    const recs = generateRecommendations([peak], [], result.expedition, result.stats)
    expect(recs.some(r => r.includes('Refine altitude precision'))).toBe(true)
  })

  it('recommends expanding zenith wisdom when low', () => {
    const peak = analyzePlatinumPeak(emptyContent, 'low.ts')
    const result = buildPlatinumZenithResultSync([peak])
    const recs = generateRecommendations([peak], [], result.expedition, result.stats)
    expect(recs.some(r => r.includes('Expand zenith wisdom'))).toBe(true)
  })

  it('recommends for valley floor files', () => {
    const peak = analyzePlatinumPeak(emptyContent, 'valley.ts')
    const result = buildPlatinumZenithResultSync([peak])
    const recs = generateRecommendations([peak], [], result.expedition, result.stats)
    expect(recs.some(r => r.includes('valley floor'))).toBe(true)
  })

  it('recommends for low expedition altitude', () => {
    const peak = analyzePlatinumPeak(emptyContent, 'low.ts')
    const result = buildPlatinumZenithResultSync([peak])
    const recs = generateRecommendations([peak], [], result.expedition, result.stats)
    expect(recs.some(r => r.includes('Expedition altitude'))).toBe(true)
  })

  it('recommends specific valley files when 3 or fewer', () => {
    const p1 = analyzePlatinumPeak(emptyContent, 'a.ts')
    const p2 = analyzePlatinumPeak(emptyContent, 'b.ts')
    const result = buildPlatinumZenithResultSync([p1, p2])
    const recs = generateRecommendations([p1, p2], [], result.expedition, result.stats)
    expect(recs.some(r => r.includes('Begin ascent'))).toBe(true)
  })

  it('does not recommend specific files when more than 3 valley files', () => {
    const peaks = Array.from({ length: 4 }, (_, i) => analyzePlatinumPeak(emptyContent, `v${i}.ts`))
    const result = buildPlatinumZenithResultSync(peaks)
    const recs = generateRecommendations(peaks, [], result.expedition, result.stats)
    expect(recs.some(r => r.includes('Begin ascent'))).toBe(false)
  })

  it('recommends expedition reconstruction when all ranges are flat', () => {
    const peak = analyzePlatinumPeak(minimalContent, 'flat.ts')
    const range = analyzeMountainRange([peak], 'dir')
    const result = buildPlatinumZenithResultSync([peak])
    const recs = generateRecommendations([peak], [range], result.expedition, result.stats)
    const allFlat = [range].every(r => r.rangeType === 'no-range' || r.rangeType === 'flat-plain')
    if (allFlat) {
      expect(recs.some(r => r.includes('flat'))).toBe(true)
    }
  })
})

// ─── Helper for sync build ──────────────────────────────────────────

function buildPlatinumZenithResultSync(peaks: PlatinumPeak[]): { expedition: PlatinumExpedition; stats: PlatinumZenithStats } {
  const avgQuality = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.peakQuality, 0) / peaks.length) : 0
  const avgClarity = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.pinnacleClarity, 0) / peaks.length) : 0
  const avgWisdom = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.zenithWisdom, 0) / peaks.length) : 0
  const overallAltitude = peaks.length > 0
    ? Math.round((avgQuality + avgClarity + avgWisdom) / 3) : 0
  const isSummit = avgQuality >= 60

  const expedition: PlatinumExpedition = { avgQuality, avgClarity, avgWisdom, isSummit, overallAltitude }

  const avgSummitResilience = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.summitResilience, 0) / peaks.length) : 0
  const avgAltitudePrecision = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.altitudePrecision, 0) / peaks.length) : 0

  const bestPeak = peaks.length > 0
    ? peaks.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const highestQuality = peaks.length > 0
    ? peaks.reduce((best, p) => p.peakQuality > best.peakQuality ? p : best).file : ''
  const clearestView = peaks.length > 0
    ? peaks.reduce((best, p) => p.pinnacleClarity > best.pinnacleClarity ? p : best).file : ''
  const strongest = peaks.length > 0
    ? peaks.reduce((best, p) => p.summitResilience > best.summitResilience ? p : best).file : ''
  const wisest = peaks.length > 0
    ? peaks.reduce((best, p) => p.zenithWisdom > best.zenithWisdom ? p : best).file : ''

  const stats: PlatinumZenithStats = {
    totalFiles: peaks.length,
    totalRanges: 0,
    avgPeakQuality: avgQuality,
    avgPinnacleClarity: avgClarity,
    avgSummitResilience,
    avgAltitudePrecision,
    avgZenithWisdom: avgWisdom,
    platinumMasterpieceCount: peaks.filter(p => p.condition === 'platinum-masterpiece').length,
    goldenSummitCount: peaks.filter(p => p.condition === 'golden-summit').length,
    properPeakCount: peaks.filter(p => p.condition === 'proper-peak').length,
    rockyRidgeCount: peaks.filter(p => p.condition === 'rocky-ridge').length,
    gravelSlopeCount: peaks.filter(p => p.condition === 'gravel-slope').length,
    valleyFloorCount: peaks.filter(p => p.condition === 'valley-floor').length,
    hasHighQualityCount: peaks.filter(p => p.perfecting.hasHighQuality).length,
    hasHighClarityCount: peaks.filter(p => p.clarifying.hasHighClarity).length,
    hasHighResilienceCount: peaks.filter(p => p.strengthening.hasHighResilience).length,
    hasHighPrecisionCount: peaks.filter(p => p.precisioning.hasHighPrecision).length,
    hasHighWisdomCount: peaks.filter(p => p.knowing.hasHighWisdom).length,
    overallAltitude,
    climberGrade: classifyClimberGrade(overallAltitude),
    bestPeak, highestQuality, clearestView, strongest, wisest,
  }

  return { expedition, stats }
}

// ─── buildPlatinumZenithResult ──────────────────────────────────────

describe('buildPlatinumZenithResult', () => {
  it('handles empty input', async () => {
    const result = await buildPlatinumZenithResult([], [])
    expect(result.peaks).toHaveLength(0)
    expect(result.ranges).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalRanges).toBe(0)
    expect(result.stats.overallAltitude).toBe(0)
    expect(result.stats.climberGrade).toBe('armchair-mountaineer')
    expect(result.expedition.isSummit).toBe(false)
    expect(result.expedition.overallAltitude).toBe(0)
  })

  it('analyzes single file', async () => {
    const result = await buildPlatinumZenithResult(['test.ts'], [richContent])
    expect(result.peaks).toHaveLength(1)
    expect(result.peaks[0].file).toBe('test.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into ranges', async () => {
    const result = await buildPlatinumZenithResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, minimalContent],
    )
    expect(result.ranges.length).toBe(2)
  })

  it('creates celebration field with milestone 510', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    expect(result.celebration.milestone).toBe(510)
    expect(result.celebration.name).toBe('platinum-zenith')
    expect(result.celebration.previousMilestones).toEqual([420, 430, 440, 450, 460, 470, 480, 490, 500])
    expect(result.celebration.totalTests).toBe(89000)
    expect(result.celebration.message).toContain('510')
  })

  it('computes expedition averages', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    expect(result.expedition.avgQuality).toBeGreaterThan(0)
    expect(result.expedition.avgClarity).toBeGreaterThan(0)
    expect(result.expedition.avgWisdom).toBeGreaterThan(0)
  })

  it('computes stats bestPeak and highestQuality', async () => {
    const result = await buildPlatinumZenithResult(
      ['rich.ts', 'poor.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestPeak).toBe('rich.ts')
    expect(result.stats.highestQuality).toBe('rich.ts')
  })

  it('computes stats clearestView', async () => {
    const result = await buildPlatinumZenithResult(
      ['rich.ts', 'poor.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.clearestView).toBe('rich.ts')
  })

  it('computes stats strongest', async () => {
    const result = await buildPlatinumZenithResult(
      ['rich.ts', 'poor.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.strongest).toBe('rich.ts')
  })

  it('computes stats wisest', async () => {
    const result = await buildPlatinumZenithResult(
      ['rich.ts', 'poor.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.wisest).toBe('rich.ts')
  })

  it('computes condition counts', async () => {
    const result = await buildPlatinumZenithResult(
      ['rich.ts', 'empty.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.platinumMasterpieceCount + result.stats.goldenSummitCount +
      result.stats.properPeakCount + result.stats.rockyRidgeCount +
      result.stats.gravelSlopeCount + result.stats.valleyFloorCount).toBe(2)
  })

  it('computes high measure counts', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    expect(result.stats.hasHighQualityCount).toBeGreaterThan(0)
  })

  it('generates recommendations', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles missing content gracefully', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [])
    expect(result.peaks).toHaveLength(1)
    expect(result.peaks[0].peakQuality).toBe(0)
  })
})

// ─── colorScore ─────────────────────────────────────────────────────

describe('colorScore', () => {
  it('colors high scores (>= 80)', () => {
    const result = colorScore(90)
    expect(result).toContain('90')
  })

  it('colors mid-high scores (>= 60)', () => {
    const result = colorScore(70)
    expect(result).toContain('70')
  })

  it('colors mid scores (>= 40)', () => {
    const result = colorScore(50)
    expect(result).toContain('50')
  })

  it('colors low-mid scores (>= 20)', () => {
    const result = colorScore(30)
    expect(result).toContain('30')
  })

  it('colors low scores (< 20)', () => {
    const result = colorScore(10)
    expect(result).toContain('10')
  })

  it('colors zero', () => {
    const result = colorScore(0)
    expect(result).toContain('0')
  })
})

// ─── colorGrade ─────────────────────────────────────────────────────

describe('colorGrade', () => {
  it('colors platinum-peak as best', () => {
    const result = colorGrade('platinum-peak')
    expect(result).toContain('platinum-peak')
  })

  it('colors golden-summit as good', () => {
    const result = colorGrade('golden-summit')
    expect(result).toContain('golden-summit')
  })

  it('colors proper-peak as okay', () => {
    const result = colorGrade('proper-peak')
    expect(result).toContain('proper-peak')
  })

  it('colors foothill-quality as poor', () => {
    const result = colorGrade('foothill-quality')
    expect(result).toContain('foothill-quality')
  })

  it('colors base-camp as worst', () => {
    const result = colorGrade('base-camp')
    expect(result).toContain('base-camp')
  })

  it('colors valley-floor as worst', () => {
    const result = colorGrade('valley-floor')
    expect(result).toContain('valley-floor')
  })

  it('colors mountain-master as best', () => {
    const result = colorGrade('mountain-master')
    expect(result).toContain('mountain-master')
  })

  it('colors himalayan-range as best', () => {
    const result = colorGrade('himalayan-range')
    expect(result).toContain('himalayan-range')
  })

  it('handles unknown grade gracefully', () => {
    const result = colorGrade('unknown-grade')
    expect(result).toContain('unknown-grade')
  })
})

// ─── formatPeakTable ────────────────────────────────────────────────

describe('formatPeakTable', () => {
  it('formats a peak with all fields', () => {
    const peak = analyzePlatinumPeak(richContent, 'test.ts')
    const output = formatPeakTable(peak)
    expect(output).toContain('test.ts')
    expect(output).toContain('Peak Quality')
    expect(output).toContain('Pinnacle Clarity')
    expect(output).toContain('Summit Resilience')
    expect(output).toContain('Altitude Precision')
    expect(output).toContain('Zenith Wisdom')
    expect(output).toContain('Score')
  })
})

// ─── formatPeaksTable ───────────────────────────────────────────────

describe('formatPeaksTable', () => {
  it('shows message for empty peaks', () => {
    const output = formatPeaksTable([])
    expect(output).toContain('No platinum peaks found')
  })

  it('formats multiple peaks', () => {
    const p1 = analyzePlatinumPeak(richContent, 'a.ts')
    const p2 = analyzePlatinumPeak(moderateContent, 'b.ts')
    const output = formatPeaksTable([p1, p2])
    expect(output).toContain('Platinum Zenith Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

// ─── formatRangeTable ───────────────────────────────────────────────

describe('formatRangeTable', () => {
  it('formats a range with all fields', () => {
    const peak = analyzePlatinumPeak(richContent, 'src/test.ts')
    const range = analyzeMountainRange([peak], 'src')
    const output = formatRangeTable(range)
    expect(output).toContain('src')
    expect(output).toContain('Type')
    expect(output).toContain('Condition')
    expect(output).toContain('Avg Quality')
    expect(output).toContain('Avg Clarity')
    expect(output).toContain('Avg Wisdom')
    expect(output).toContain('Platinum Masterpieces')
    expect(output).toContain('Valley Floor')
  })
})

// ─── formatRangesTable ──────────────────────────────────────────────

describe('formatRangesTable', () => {
  it('shows message for empty ranges', () => {
    const output = formatRangesTable([])
    expect(output).toContain('No mountain ranges found')
  })

  it('formats multiple ranges', () => {
    const p1 = analyzePlatinumPeak(richContent, 'src/a.ts')
    const p2 = analyzePlatinumPeak(moderateContent, 'lib/b.ts')
    const r1 = analyzeMountainRange([p1], 'src')
    const r2 = analyzeMountainRange([p2], 'lib')
    const output = formatRangesTable([r1, r2])
    expect(output).toContain('Mountain Ranges')
    expect(output).toContain('src')
    expect(output).toContain('lib')
  })
})

// ─── formatStatsTable ───────────────────────────────────────────────

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Platinum Zenith Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Total Ranges')
    expect(output).toContain('Avg Peak Quality')
    expect(output).toContain('Avg Pinnacle Clarity')
    expect(output).toContain('Avg Summit Resilience')
    expect(output).toContain('Avg Altitude Precision')
    expect(output).toContain('Avg Zenith Wisdom')
    expect(output).toContain('Platinum Masterpiece')
    expect(output).toContain('Golden Summit')
    expect(output).toContain('Proper Peak')
    expect(output).toContain('Rocky Ridge')
    expect(output).toContain('Gravel Slope')
    expect(output).toContain('Valley Floor')
    expect(output).toContain('High Quality')
    expect(output).toContain('High Clarity')
    expect(output).toContain('High Resilience')
    expect(output).toContain('High Precision')
    expect(output).toContain('High Wisdom')
    expect(output).toContain('Overall Altitude')
    expect(output).toContain('Climber Grade')
    expect(output).toContain('Best Peak')
    expect(output).toContain('Highest Quality')
    expect(output).toContain('Clearest View')
    expect(output).toContain('Strongest')
    expect(output).toContain('Wisest')
  })
})

// ─── formatRecommendations ──────────────────────────────────────────

describe('formatRecommendations', () => {
  it('shows message for empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const output = formatRecommendations(['First rec', 'Second rec'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('First rec')
    expect(output).toContain('Second rec')
    expect(output).toContain('\u2022')
  })
})

// ─── formatResultTable ──────────────────────────────────────────────

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Platinum Zenith Analysis')
    expect(output).toContain('Mountain Ranges')
    expect(output).toContain('Platinum Zenith Statistics')
    expect(output).toContain('Expedition')
    expect(output).toContain('Celebration #510')
    expect(output).toContain('Recommendations')
  })

  it('includes celebration message', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Platinum Zenith')
    expect(output).toContain('510')
  })
})

// ─── formatResultJson ───────────────────────────────────────────────

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.peaks).toHaveLength(1)
    expect(parsed.celebration.milestone).toBe(510)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('includes all top-level fields', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('peaks')
    expect(parsed).toHaveProperty('ranges')
    expect(parsed).toHaveProperty('expedition')
    expect(parsed).toHaveProperty('celebration')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })
})

// ─── Integration / Edge Cases ───────────────────────────────────────

describe('integration edge cases', () => {
  it('handles files with only var and any', async () => {
    const result = await buildPlatinumZenithResult(['bad.ts'], [negativeContent])
    expect(result.peaks).toHaveLength(1)
    expect(result.peaks[0].condition).toBe('valley-floor')
    expect(result.stats.valleyFloorCount).toBe(1)
  })

  it('handles mixed quality files', async () => {
    const result = await buildPlatinumZenithResult(
      ['rich.ts', 'empty.ts', 'moderate.ts'],
      [richContent, emptyContent, moderateContent],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.valleyFloorCount).toBeGreaterThan(0)
  })

  it('computes climberGrade correctly for rich content', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    expect(['mountain-master', 'expert-alpinist', 'skilled-climber']).toContain(result.stats.climberGrade)
  })

  it('expedition isSummit for rich content', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    expect(result.expedition.isSummit).toBe(true)
  })

  it('expedition isSummit is false for empty content', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [emptyContent])
    expect(result.expedition.isSummit).toBe(false)
  })

  it('stats overallAltitude equals expedition overallAltitude', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    expect(result.stats.overallAltitude).toBe(result.expedition.overallAltitude)
  })

  it('qualityScore is capped by measure scores', () => {
    const peak = analyzePlatinumPeak(richContent, 'cap.ts')
    expect(peak.qualityScore).toBeLessThanOrEqual(100)
  })

  it('all measure scores are capped at 100', () => {
    const peak = analyzePlatinumPeak(richContent, 'cap.ts')
    expect(peak.peakQuality).toBeLessThanOrEqual(100)
    expect(peak.pinnacleClarity).toBeLessThanOrEqual(100)
    expect(peak.summitResilience).toBeLessThanOrEqual(100)
    expect(peak.altitudePrecision).toBeLessThanOrEqual(100)
    expect(peak.zenithWisdom).toBeLessThanOrEqual(100)
  })

  it('expedition altitude is average of 3 expedition measures', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    const expected = Math.round(
      (result.expedition.avgQuality + result.expedition.avgClarity + result.expedition.avgWisdom) / 3,
    )
    expect(result.expedition.overallAltitude).toBe(expected)
  })

  it('celebration has correct milestone number', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    expect(result.celebration.milestone).toBe(510)
    expect(typeof result.celebration.milestone).toBe('number')
  })

  it('celebration message is non-empty', async () => {
    const result = await buildPlatinumZenithResult(['a.ts'], [richContent])
    expect(result.celebration.message.length).toBeGreaterThan(0)
  })

  it('handles many files in same directory', async () => {
    const files = Array.from({ length: 10 }, (_, i) => `src/file${i}.ts`)
    const contents = Array.from({ length: 10 }, () => moderateContent)
    const result = await buildPlatinumZenithResult(files, contents)
    expect(result.stats.totalFiles).toBe(10)
    expect(result.ranges.length).toBe(1)
    expect(result.ranges[0].peaks.length).toBe(10)
  })

  it('handles files across many directories', async () => {
    const files = ['a/f.ts', 'b/f.ts', 'c/f.ts', 'd/f.ts', 'e/f.ts']
    const contents = Array.from({ length: 5 }, () => minimalContent)
    const result = await buildPlatinumZenithResult(files, contents)
    expect(result.ranges.length).toBe(5)
  })

  it('moderate content has moderate scores', () => {
    const peak = analyzePlatinumPeak(moderateContent, 'mod.ts')
    expect(peak.peakQuality).toBeGreaterThan(0)
    expect(peak.peakQuality).toBeLessThan(100)
  })

  it('moderate content perfecting detects export/interface/typeAlias', () => {
    const m = measurePerfecting(moderateContent)
    expect(m.hasExcellent).toBe(true)
  })

  it('moderate content strengthening detects strictEq and conditional', () => {
    const m = measureStrengthening(moderateContent)
    expect(m.hasErrorHandled).toBe(false)
  })

  it('empty content has no measures true', () => {
    const m = measurePerfecting(emptyContent)
    expect(m.hasExcellent).toBe(false)
    expect(m.hasPolished).toBe(false)
    expect(m.hasRefined).toBe(false)
    expect(m.hasMasterful).toBe(false)
    expect(m.hasProduction).toBe(false)
    expect(m.hasPerfect).toBe(false)
    expect(m.hasHighQuality).toBe(false)
  })

  it('empty clarifying has no flags', () => {
    const m = measureClarifying(emptyContent)
    expect(m.hasReadable).toBe(false)
    expect(m.hasTransparent).toBe(false)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasUnderstandable).toBe(false)
    expect(m.hasClear).toBe(false)
    expect(m.hasVisible).toBe(false)
  })

  it('empty strengthening has no flags', () => {
    const m = measureStrengthening(emptyContent)
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasEdgeCaseCovered).toBe(false)
    expect(m.hasDefensive).toBe(false)
    expect(m.hasValidated).toBe(false)
    expect(m.hasRobust).toBe(false)
    expect(m.hasFortified).toBe(false)
  })

  it('empty precisioning has no flags', () => {
    const m = measurePrecisioning(emptyContent)
    expect(m.hasExact).toBe(false)
    expect(m.hasAccurate).toBe(false)
    expect(m.hasPrecise).toBe(false)
    expect(m.hasCorrect).toBe(false)
    expect(m.hasSharp).toBe(false)
    expect(m.hasDefined).toBe(false)
  })

  it('empty knowing has no flags', () => {
    const m = measureKnowing(emptyContent)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellNamed).toBe(false)
    expect(m.hasDomainAware).toBe(false)
    expect(m.hasPatternBased).toBe(false)
    expect(m.hasInformed).toBe(false)
    expect(m.hasComprehensive).toBe(false)
  })
})
