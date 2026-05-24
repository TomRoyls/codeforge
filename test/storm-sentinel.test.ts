import { describe, it, expect } from 'vitest'
import {
  measureObserving,
  measureWarning,
  measureResponding,
  measureEnduring,
  measureGuarding,
  classifyWatchCondition,
  classifyOutpostType,
  classifyOutpostCondition,
  classifyCommanderGrade,
  analyzeSentinelWatch,
  analyzeSentinelOutpost,
  buildStormSentinelResult,
  generateRecommendations,
} from '../src/commands/storm-sentinel-helpers.js'
import {
  colorScore,
  colorGrade,
  formatWatchTable,
  formatWatchesTable,
  formatOutpostTable,
  formatOutpostsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/storm-sentinel-format-helpers.js'
import type { SentinelWatch, StormSentinelStats, StormNetwork, SentinelOutpost } from '../src/commands/storm-sentinel-helpers.js'

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

export const DEFAULT_CONFIG: UserConfig = {
  name: 'default',
  age: 0,
}

export function createConfig(name: string, age: number): UserConfig {
  return { name, age }
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string }
`

// ─── measureObserving ──────────────────────────────────────────────

describe('measureObserving', () => {
  it('returns 0 watch for empty content', () => {
    const m = measureObserving(emptyContent)
    expect(m.watch).toBe(0)
  })

  it('returns low watch for minimal content', () => {
    const m = measureObserving(minimalContent)
    expect(m.watch).toBeLessThan(20)
  })

  it('returns moderate watch for moderate content', () => {
    const m = measureObserving(moderateContent)
    expect(m.watch).toBeGreaterThanOrEqual(40)
    expect(m.watch).toBeLessThan(80)
  })

  it('returns high watch for rich content', () => {
    const m = measureObserving(richContent)
    expect(m.watch).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureObserving(emptyContent)
    expect(m.grade).toBe('no-watch')
  })

  it('detects hasLogging for rich content', () => {
    const m = measureObserving(richContent)
    expect(m.hasLogging).toBe(true)
  })

  it('detects hasHighWatch for rich content', () => {
    const m = measureObserving(richContent)
    expect(m.hasHighWatch).toBe(true)
  })

  it('detects hasNoSilentOps for clean content', () => {
    const m = measureObserving(richContent)
    expect(m.hasNoSilentOps).toBe(true)
  })

  it('detects hasNoBlackBoxes for clean content', () => {
    const m = measureObserving(richContent)
    expect(m.hasNoBlackBoxes).toBe(true)
  })

  it('detects silentOpsCount for var usage', () => {
    const m = measureObserving('var x = 1')
    expect(m.silentOpsCount).toBeGreaterThan(0)
  })

  it('caps watch at 100', () => {
    const m = measureObserving(richContent)
    expect(m.watch).toBeLessThanOrEqual(100)
  })
})

// ─── measureWarning ────────────────────────────────────────────────

describe('measureWarning', () => {
  it('returns 0 anticipation for empty content', () => {
    const m = measureWarning(emptyContent)
    expect(m.anticipation).toBe(0)
  })

  it('returns low anticipation for minimal content', () => {
    const m = measureWarning(minimalContent)
    expect(m.anticipation).toBe(0)
  })

  it('returns moderate anticipation for moderate content', () => {
    const m = measureWarning(moderateContent)
    expect(m.anticipation).toBeGreaterThanOrEqual(40)
  })

  it('returns high anticipation for rich content', () => {
    const m = measureWarning(richContent)
    expect(m.anticipation).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureWarning(emptyContent)
    expect(m.warning).toBe('no-alert')
  })

  it('detects hasErrorAnticipation for moderate content', () => {
    const m = measureWarning(moderateContent)
    expect(m.hasErrorAnticipation).toBe(true)
  })

  it('detects hasHighWarning for rich content', () => {
    const m = measureWarning(richContent)
    expect(m.hasHighWarning).toBe(true)
  })

  it('caps anticipation at 100', () => {
    const m = measureWarning(richContent)
    expect(m.anticipation).toBeLessThanOrEqual(100)
  })
})

// ─── measureResponding ─────────────────────────────────────────────

describe('measureResponding', () => {
  it('returns 0 response for empty content', () => {
    const m = measureResponding(emptyContent)
    expect(m.response).toBe(0)
  })

  it('returns low response for minimal content', () => {
    const m = measureResponding(minimalContent)
    expect(m.response).toBeLessThan(20)
  })

  it('returns high response for rich content', () => {
    const m = measureResponding(richContent)
    expect(m.response).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureResponding(emptyContent)
    expect(m.lightning).toBe('no-response')
  })

  it('detects hasErrorHandling for rich content', () => {
    const m = measureResponding(richContent)
    expect(m.hasErrorHandling).toBe(true)
  })

  it('detects hasTryCatch for rich content', () => {
    const m = measureResponding(richContent)
    expect(m.hasTryCatch).toBe(true)
  })

  it('detects hasErrorHandling for rich content (try+throw)', () => {
    const m = measureResponding(richContent)
    expect(m.hasErrorHandling).toBe(true)
  })

  it('caps response at 100', () => {
    const m = measureResponding(richContent)
    expect(m.response).toBeLessThanOrEqual(100)
  })
})

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns 0 resilience for empty content', () => {
    const m = measureEnduring(emptyContent)
    expect(m.resilience).toBe(0)
  })

  it('returns high resilience for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureEnduring(emptyContent)
    expect(m.thunder).toBe('no-endurance')
  })

  it('detects hasCircuitBreaker false for rich content (no if)', () => {
    const m = measureEnduring(richContent)
    expect(m.hasCircuitBreaker).toBe(false)
  })

  it('detects hasRetryLogic for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.hasRetryLogic).toBe(true)
  })

  it('detects hasNoCascadeFail for clean content', () => {
    const m = measureEnduring(richContent)
    expect(m.hasNoCascadeFail).toBe(true)
  })

  it('caps resilience at 100', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBeLessThanOrEqual(100)
  })
})

// ─── measureGuarding ───────────────────────────────────────────────

describe('measureGuarding', () => {
  it('returns 0 vigilance for empty content', () => {
    const m = measureGuarding(emptyContent)
    expect(m.vigilance).toBe(0)
  })

  it('returns high vigilance for rich content', () => {
    const m = measureGuarding(richContent)
    expect(m.vigilance).toBeGreaterThanOrEqual(80)
  })

  it('grades correctly for empty content', () => {
    const m = measureGuarding(emptyContent)
    expect(m.guardian).toBe('no-guard')
  })

  it('detects hasInputSanitization for rich content', () => {
    const m = measureGuarding(richContent)
    expect(m.hasInputSanitization).toBe(true)
  })

  it('detects hasSecurityChecks for rich content', () => {
    const m = measureGuarding(richContent)
    expect(m.hasSecurityChecks).toBe(true)
  })

  it('detects hasNoRawExposure for clean content', () => {
    const m = measureGuarding(richContent)
    expect(m.hasNoRawExposure).toBe(true)
  })

  it('caps vigilance at 100', () => {
    const m = measureGuarding(richContent)
    expect(m.vigilance).toBeLessThanOrEqual(100)
  })
})

// ─── classifyWatchCondition ────────────────────────────────────────

describe('classifyWatchCondition', () => {
  it('classifies perfect-sentinel for 85+', () => {
    expect(classifyWatchCondition(90)).toBe('perfect-sentinel')
  })

  it('classifies storm-tower for 70-84', () => {
    expect(classifyWatchCondition(75)).toBe('storm-tower')
  })

  it('classifies proper-watchtower for 55-69', () => {
    expect(classifyWatchCondition(60)).toBe('proper-watchtower')
  })

  it('classifies weathered-post for 40-54', () => {
    expect(classifyWatchCondition(45)).toBe('weathered-post')
  })

  it('classifies fallen-tower for 25-39', () => {
    expect(classifyWatchCondition(30)).toBe('fallen-tower')
  })

  it('classifies rubble for <25', () => {
    expect(classifyWatchCondition(10)).toBe('rubble')
  })

  it('classifies rubble for 0', () => {
    expect(classifyWatchCondition(0)).toBe('rubble')
  })
})

// ─── classifyCommanderGrade ────────────────────────────────────────

describe('classifyCommanderGrade', () => {
  it('classifies sentinel-supreme for 80+', () => {
    expect(classifyCommanderGrade(85)).toBe('sentinel-supreme')
  })

  it('classifies deserter for <20', () => {
    expect(classifyCommanderGrade(10)).toBe('deserter')
  })

  it('classifies watch-commander for 65-79', () => {
    expect(classifyCommanderGrade(70)).toBe('watch-commander')
  })

  it('classifies skilled-guard for 50-64', () => {
    expect(classifyCommanderGrade(55)).toBe('skilled-guard')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyCommanderGrade(40)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyCommanderGrade(25)).toBe('novice')
  })
})

// ─── classifyOutpostType ───────────────────────────────────────────

describe('classifyOutpostType', () => {
  it('returns no-outpost for empty watches', () => {
    expect(classifyOutpostType([])).toBe('no-outpost')
  })

  it('returns fortress-watch for high quality watches', () => {
    const watches: SentinelWatch[] = [
      { file: 'a.ts', watchfulness: 90, stormWarning: 90, lightningResponse: 90, thunderResilience: 90, guardianVigilance: 90, observing: {} as any, warning: {} as any, responding: {} as any, enduring: {} as any, guarding: {} as any, condition: 'perfect-sentinel', qualityScore: 90 },
      { file: 'b.ts', watchfulness: 95, stormWarning: 95, lightningResponse: 95, thunderResilience: 95, guardianVigilance: 95, observing: {} as any, warning: {} as any, responding: {} as any, enduring: {} as any, guarding: {} as any, condition: 'perfect-sentinel', qualityScore: 95 },
    ]
    expect(classifyOutpostType(watches)).toBe('fortress-watch')
  })
})

// ─── classifyOutpostCondition ──────────────────────────────────────

describe('classifyOutpostCondition', () => {
  it('classifies impregnable-watch for 75+', () => {
    expect(classifyOutpostCondition(80)).toBe('impregnable-watch')
  })

  it('classifies void for <15', () => {
    expect(classifyOutpostCondition(10)).toBe('void')
  })
})

// ─── analyzeSentinelWatch ──────────────────────────────────────────

describe('analyzeSentinelWatch', () => {
  it('returns correct file path', () => {
    const w = analyzeSentinelWatch(richContent, 'test.ts')
    expect(w.file).toBe('test.ts')
  })

  it('computes qualityScore as weighted average', () => {
    const w = analyzeSentinelWatch(richContent, 'test.ts')
    const expected = Math.round(
      measureObserving(richContent).watch * 0.2 +
      measureWarning(richContent).anticipation * 0.2 +
      measureResponding(richContent).response * 0.2 +
      measureEnduring(richContent).resilience * 0.2 +
      measureGuarding(richContent).vigilance * 0.2,
    )
    expect(w.qualityScore).toBe(expected)
  })

  it('classifies rich content as perfect-sentinel', () => {
    const w = analyzeSentinelWatch(richContent, 'test.ts')
    expect(w.condition).toBe('perfect-sentinel')
  })

  it('classifies minimal content as rubble', () => {
    const w = analyzeSentinelWatch(minimalContent, 'test.ts')
    expect(w.condition).toBe('rubble')
  })

  it('classifies empty content as rubble', () => {
    const w = analyzeSentinelWatch(emptyContent, 'test.ts')
    expect(w.condition).toBe('rubble')
  })

  it('stores watchfulness from observing', () => {
    const w = analyzeSentinelWatch(richContent, 'test.ts')
    expect(w.watchfulness).toBe(measureObserving(richContent).watch)
  })

  it('stores stormWarning from warning', () => {
    const w = analyzeSentinelWatch(richContent, 'test.ts')
    expect(w.stormWarning).toBe(measureWarning(richContent).anticipation)
  })

  it('stores lightningResponse from responding', () => {
    const w = analyzeSentinelWatch(richContent, 'test.ts')
    expect(w.lightningResponse).toBe(measureResponding(richContent).response)
  })

  it('stores thunderResilience from enduring', () => {
    const w = analyzeSentinelWatch(richContent, 'test.ts')
    expect(w.thunderResilience).toBe(measureEnduring(richContent).resilience)
  })

  it('stores guardianVigilance from guarding', () => {
    const w = analyzeSentinelWatch(richContent, 'test.ts')
    expect(w.guardianVigilance).toBe(measureGuarding(richContent).vigilance)
  })
})

// ─── analyzeSentinelOutpost ────────────────────────────────────────

describe('analyzeSentinelOutpost', () => {
  it('returns empty outpost for no watches', () => {
    const o = analyzeSentinelOutpost([], '/empty')
    expect(o.directory).toBe('/empty')
    expect(o.watches).toHaveLength(0)
    expect(o.avgWatchfulness).toBe(0)
    expect(o.outpostType).toBe('no-outpost')
    expect(o.condition).toBe('void')
  })

  it('computes avgWatchfulness correctly', () => {
    const w = analyzeSentinelWatch(richContent, 'test.ts')
    const o = analyzeSentinelOutpost([w], '/src')
    expect(o.avgWatchfulness).toBe(w.watchfulness)
  })

  it('counts perfectSentinelCount', () => {
    const w = analyzeSentinelWatch(richContent, 'test.ts')
    const o = analyzeSentinelOutpost([w], '/src')
    expect(o.perfectSentinelCount).toBe(1)
  })

  it('counts rubbleCount', () => {
    const w = analyzeSentinelWatch(minimalContent, 'test.ts')
    const o = analyzeSentinelOutpost([w], '/src')
    expect(o.rubbleCount).toBe(1)
  })

  it('returns fortress-watch for perfect-sentinel watches', () => {
    const w1 = analyzeSentinelWatch(richContent, 'a.ts')
    const w2 = analyzeSentinelWatch(richContent, 'b.ts')
    const o = analyzeSentinelOutpost([w1, w2], '/src')
    expect(o.outpostType).toBe('fortress-watch')
  })
})

// ─── buildStormSentinelResult ──────────────────────────────────────

describe('buildStormSentinelResult', () => {
  it('returns watches for each file', async () => {
    const result = await buildStormSentinelResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    expect(result.watches).toHaveLength(2)
  })

  it('returns outposts grouped by directory', async () => {
    const result = await buildStormSentinelResult(
      ['/src/a.ts', '/src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.outposts).toHaveLength(1)
    expect(result.outposts[0]!.directory).toBe('/src')
  })

  it('returns multiple outposts for different directories', async () => {
    const result = await buildStormSentinelResult(
      ['/src/a.ts', '/lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.outposts).toHaveLength(2)
  })

  it('computes stats correctly', async () => {
    const result = await buildStormSentinelResult(['a.ts'], [richContent])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalOutposts).toBe(1)
  })

  it('computes network correctly', async () => {
    const result = await buildStormSentinelResult(['a.ts'], [richContent])
    expect(result.network.isVigilant).toBe(true)
    expect(result.network.overallProtection).toBeGreaterThan(0)
  })

  it('computes bestWatch correctly', async () => {
    const result = await buildStormSentinelResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.bestWatch).toBe('a.ts')
  })

  it('computes mostWatchful correctly', async () => {
    const result = await buildStormSentinelResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.mostWatchful).toBe('a.ts')
  })

  it('computes bestWarning correctly', async () => {
    const result = await buildStormSentinelResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.bestWarning).toBe('a.ts')
  })

  it('computes fastestResponse correctly', async () => {
    const result = await buildStormSentinelResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.fastestResponse).toBe('a.ts')
  })

  it('computes mostVigilant correctly', async () => {
    const result = await buildStormSentinelResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.mostVigilant).toBe('a.ts')
  })

  it('computes perfectSentinelCount in stats', async () => {
    const result = await buildStormSentinelResult(['a.ts'], [richContent])
    expect(result.stats.perfectSentinelCount).toBe(1)
  })

  it('computes rubbleCount in stats', async () => {
    const result = await buildStormSentinelResult(
      ['a.ts', 'b.ts'],
      [minimalContent, minimalContent],
    )
    expect(result.stats.rubbleCount).toBe(2)
  })

  it('computes commanderGrade for rich content', async () => {
    const result = await buildStormSentinelResult(['a.ts'], [richContent])
    expect(result.stats.commanderGrade).toBe('sentinel-supreme')
  })

  it('computes commanderGrade for minimal content', async () => {
    const result = await buildStormSentinelResult(['a.ts'], [minimalContent])
    expect(result.stats.commanderGrade).toBe('deserter')
  })

  it('generates positive recommendation for all-rich', async () => {
    const result = await buildStormSentinelResult(['a.ts'], [richContent])
    expect(result.recommendations).toContain(
      'The storm sentinel stands eternal! Perfect watchfulness, warning, response, resilience, and vigilance across the entire network',
    )
  })

  it('handles empty file list', async () => {
    const result = await buildStormSentinelResult([], [])
    expect(result.watches).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallProtection).toBe(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends improving watchfulness when low', () => {
    const stats = { avgWatchfulness: 30, avgStormWarning: 80, avgLightningResponse: 80, avgThunderResilience: 80, avgGuardianVigilance: 80, rubbleCount: 0 } as unknown as StormSentinelStats
    const recs = generateRecommendations([], [], {} as StormNetwork, stats)
    expect(recs.some(r => r.includes('watchfulness'))).toBe(true)
  })

  it('recommends improving storm warning when low', () => {
    const stats = { avgWatchfulness: 80, avgStormWarning: 30, avgLightningResponse: 80, avgThunderResilience: 80, avgGuardianVigilance: 80, rubbleCount: 0 } as unknown as StormSentinelStats
    const recs = generateRecommendations([], [], {} as StormNetwork, stats)
    expect(recs.some(r => r.includes('storm warning'))).toBe(true)
  })

  it('mentions rubble files', () => {
    const stats = { avgWatchfulness: 80, avgStormWarning: 80, avgLightningResponse: 80, avgThunderResilience: 80, avgGuardianVigilance: 80, rubbleCount: 3 } as unknown as StormSentinelStats
    const recs = generateRecommendations([], [], {} as StormNetwork, stats)
    expect(recs.some(r => r.includes('rubble'))).toBe(true)
  })

  it('recommends overall protection improvement when low', () => {
    const network: StormNetwork = { avgWatchfulness: 80, avgResponse: 80, avgVigilance: 80, isVigilant: true, overallProtection: 30 }
    const stats = { avgWatchfulness: 80, avgStormWarning: 80, avgLightningResponse: 80, avgThunderResilience: 80, avgGuardianVigilance: 80, rubbleCount: 0 } as unknown as StormSentinelStats
    const recs = generateRecommendations([], [], network, stats)
    expect(recs.some(r => r.includes('Overall protection'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(50)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('colors perfect-sentinel as best', () => {
    expect(typeof colorGrade('perfect-sentinel')).toBe('string')
  })

  it('colors rubble as worst', () => {
    expect(typeof colorGrade('rubble')).toBe('string')
  })

  it('colors unknown grade with fallback', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatWatchTable', () => {
  it('formats a single watch', () => {
    const w = analyzeSentinelWatch(richContent, 'test.ts')
    const output = formatWatchTable(w)
    expect(output).toContain('test.ts')
    expect(output).toContain('Watchfulness')
    expect(output).toContain('Storm Warning')
    expect(output).toContain('Lightning Response')
    expect(output).toContain('Thunder Resilience')
    expect(output).toContain('Guardian Vigilance')
    expect(output).toContain('Score')
  })
})

describe('formatWatchesTable', () => {
  it('formats multiple watches', () => {
    const watches = [
      analyzeSentinelWatch(richContent, 'a.ts'),
      analyzeSentinelWatch(moderateContent, 'b.ts'),
    ]
    const output = formatWatchesTable(watches)
    expect(output).toContain('Storm Sentinel Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })

  it('returns message for empty watches', () => {
    const output = formatWatchesTable([])
    expect(output).toContain('No sentinel watches found')
  })
})

describe('formatOutpostTable', () => {
  it('formats a outpost', () => {
    const w = analyzeSentinelWatch(richContent, 'test.ts')
    const o = analyzeSentinelOutpost([w], '/src')
    const output = formatOutpostTable(o)
    expect(output).toContain('/src')
    expect(output).toContain('Outpost:')
  })
})

describe('formatOutpostsTable', () => {
  it('returns message for empty outposts', () => {
    const output = formatOutpostsTable([])
    expect(output).toContain('No sentinel outposts found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildStormSentinelResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Storm Sentinel Statistics')
    expect(output).toContain('Overall Protection')
    expect(output).toContain('Commander Grade')
  })
})

describe('formatRecommendations', () => {
  it('formats recommendations list', () => {
    const output = formatRecommendations(['Rec 1', 'Rec 2'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Rec 1')
  })

  it('returns message for empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildStormSentinelResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Storm Sentinel Analysis')
    expect(output).toContain('Sentinel Outposts')
    expect(output).toContain('Storm Sentinel Statistics')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildStormSentinelResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.watches).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Score computation consistency ─────────────────────────────────

describe('score consistency', () => {
  it('emptyContent: all scores are 0', () => {
    const w = analyzeSentinelWatch(emptyContent, 'test.ts')
    expect(w.watchfulness).toBe(0)
    expect(w.stormWarning).toBe(0)
    expect(w.lightningResponse).toBe(0)
    expect(w.thunderResilience).toBe(0)
    expect(w.guardianVigilance).toBe(0)
    expect(w.qualityScore).toBe(0)
  })

  it('richContent: all measures capped at 100', () => {
    const ob = measureObserving(richContent)
    const wa = measureWarning(richContent)
    const re = measureResponding(richContent)
    const en = measureEnduring(richContent)
    const gu = measureGuarding(richContent)
    expect(ob.watch).toBeLessThanOrEqual(100)
    expect(wa.anticipation).toBeLessThanOrEqual(100)
    expect(re.response).toBeLessThanOrEqual(100)
    expect(en.resilience).toBeLessThanOrEqual(100)
    expect(gu.vigilance).toBeLessThanOrEqual(100)
  })

  it('moderateContent: warning has conditional + strictEq', () => {
    const m = measureWarning(moderateContent)
    expect(m.hasErrorAnticipation).toBe(true)
    expect(m.anticipation).toBeGreaterThan(30)
  })
})
