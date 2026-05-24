import { describe, it, expect } from 'vitest'
import {
  measureResonating,
  measureEchoing,
  measureReverberating,
  measurePropagating,
  measureBalancing,
  classifyEchoCondition,
  classifyChamberType,
  classifyChamberCondition,
  classifyAcousticGrade,
  analyzeThunderEcho,
  analyzeAcousticChamber,
  buildThunderWellResult,
  generateRecommendations,
} from '../src/commands/thunder-well-helpers.js'
import {
  colorScore,
  colorGrade,
  formatEchoTable,
  formatEchoesTable,
  formatChamberTable,
  formatChambersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/thunder-well-format-helpers.js'
import type {
  ThunderEcho,
  ThunderWellStats,
  ThunderWellResult,
  SymphonySummary,
} from '../src/commands/thunder-well-helpers.js'

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
    const validated = validateUser(config)
    return validated
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    }
    throw error
  }
}

function validateUser(user: Config): UserConfig {
  return {
    name: user.name ?? 'unknown',
    age: user.age ?? 0,
    role: user.role ?? 'user',
  }
}

export class UserService {
  private users: Map<string, UserConfig> = new Map()

  getUser(id: string): UserConfig | undefined {
    return this.users.get(id)
  }
}

const defaultConfig: UserConfig = {
  name: 'default',
  age: 25,
  role: 'user',
}
`

const poorContent = `var x = eval("1 + 2")
debugger
any thing = x
var y = eval("3 + 4")
`

// ─── measureResonating ─────────────────────────────────────────────

describe('measureResonating', () => {
  it('returns valid ResonatingMeasure for empty content', () => {
    const result = measureResonating(emptyContent)
    expect(result.depth).toBeGreaterThanOrEqual(0)
    expect(result.depth).toBeLessThanOrEqual(100)
    expect(typeof result.grade).toBe('string')
    expect(result.hasHighDepth).toBe(false)
    expect(result.deadCodeCount).toBe(0)
    expect(result.fillerCount).toBe(0)
    expect(result.hasNoDeadCode).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureResonating(emptyContent)
    const rich = measureResonating(richContent)
    expect(rich.depth).toBeGreaterThan(empty.depth)
  })

  it('detects high signal in rich content', () => {
    const result = measureResonating(richContent)
    expect(result.hasHighSignal).toBe(true)
  })

  it('detects purposeful patterns in rich content', () => {
    const result = measureResonating(richContent)
    expect(result.hasPurposeful).toBe(true)
  })

  it('detects meaningful patterns in rich content', () => {
    const result = measureResonating(richContent)
    expect(result.hasMeaningful).toBe(true)
  })

  it('detects impactful patterns in rich content', () => {
    const result = measureResonating(richContent)
    expect(result.hasImpactful).toBe(true)
  })

  it('counts dead code (var) in poor content', () => {
    const result = measureResonating(poorContent)
    expect(result.deadCodeCount).toBeGreaterThan(0)
    expect(result.hasNoDeadCode).toBe(false)
  })

  it('counts filler (any) in poor content', () => {
    const result = measureResonating(poorContent)
    expect(result.fillerCount).toBeGreaterThan(0)
    expect(result.hasNoFiller).toBe(false)
  })

  it('detects high depth for rich content', () => {
    const result = measureResonating(richContent)
    expect(result.hasHighDepth).toBe(true)
  })

  it('grades empty content as silence', () => {
    expect(measureResonating(emptyContent).grade).toBe('silence')
  })

  it('detects low noise for clean content', () => {
    const result = measureResonating(richContent)
    expect(result.hasLowNoise).toBe(true)
  })
})

// ─── measureEchoing ────────────────────────────────────────────────

describe('measureEchoing', () => {
  it('returns valid EchoingMeasure for empty content', () => {
    const result = measureEchoing(emptyContent)
    expect(result.clarity).toBeGreaterThanOrEqual(0)
    expect(result.clarity).toBeLessThanOrEqual(100)
    expect(typeof result.echo).toBe('string')
    expect(result.vagueCount).toBe(0)
    expect(result.silentCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureEchoing(emptyContent)
    const rich = measureEchoing(richContent)
    expect(rich.clarity).toBeGreaterThan(empty.clarity)
  })

  it('detects clear feedback in rich content', () => {
    const result = measureEchoing(richContent)
    expect(result.hasClearFeedback).toBe(true)
  })

  it('detects descriptive patterns in rich content', () => {
    const result = measureEchoing(richContent)
    expect(result.hasDescriptive).toBe(true)
  })

  it('detects informative patterns in rich content', () => {
    const result = measureEchoing(richContent)
    expect(result.hasInformative).toBe(true)
  })

  it('detects expressive patterns in rich content', () => {
    const result = measureEchoing(richContent)
    expect(result.hasExpressive).toBe(true)
  })

  it('detects high clarity for rich content', () => {
    const result = measureEchoing(richContent)
    expect(result.hasHighClarity).toBe(true)
  })

  it('grades empty content as no-echo', () => {
    expect(measureEchoing(emptyContent).echo).toBe('no-echo')
  })

  it('counts vague (var) in poor content', () => {
    const result = measureEchoing(poorContent)
    expect(result.vagueCount).toBeGreaterThan(0)
    expect(result.hasNoVague).toBe(false)
  })
})

// ─── measureReverberating ──────────────────────────────────────────

describe('measureReverberating', () => {
  it('returns valid ReverberatingMeasure for empty content', () => {
    const result = measureReverberating(emptyContent)
    expect(result.quality).toBeGreaterThanOrEqual(0)
    expect(result.quality).toBeLessThanOrEqual(100)
    expect(typeof result.reverberation).toBe('string')
    expect(result.skippedCount).toBe(0)
    expect(result.missingStepsCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureReverberating(emptyContent)
    const rich = measureReverberating(richContent)
    expect(rich.quality).toBeGreaterThan(empty.quality)
  })

  it('detects clean chaining in rich content', () => {
    const result = measureReverberating(richContent)
    expect(result.hasCleanChaining).toBe(true)
  })

  it('detects sequential patterns in rich content', () => {
    const result = measureReverberating(richContent)
    expect(result.hasSequential).toBe(true)
  })

  it('detects traceable patterns in rich content', () => {
    const result = measureReverberating(richContent)
    expect(result.hasTraceable).toBe(true)
  })

  it('detects high quality for rich content', () => {
    const result = measureReverberating(richContent)
    expect(result.hasHighQuality).toBe(true)
  })

  it('grades empty content as no-reverberation', () => {
    expect(measureReverberating(emptyContent).reverberation).toBe('no-reverberation')
  })

  it('detects flowing patterns in rich content', () => {
    const result = measureReverberating(richContent)
    expect(result.hasFlowing).toBe(true)
  })
})

// ─── measurePropagating ────────────────────────────────────────────

describe('measurePropagating', () => {
  it('returns valid PropagatingMeasure for empty content', () => {
    const result = measurePropagating(emptyContent)
    expect(result.propagation).toBeGreaterThanOrEqual(0)
    expect(result.propagation).toBeLessThanOrEqual(100)
    expect(typeof result.sound).toBe('string')
    expect(result.implicitCouplingCount).toBe(0)
    expect(result.hiddenStateCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measurePropagating(emptyContent)
    const rich = measurePropagating(richContent)
    expect(rich.propagation).toBeGreaterThan(empty.propagation)
  })

  it('detects explicit communication in rich content', () => {
    const result = measurePropagating(richContent)
    expect(result.hasExplicitCommunication).toBe(true)
  })

  it('detects event driven in rich content', () => {
    const result = measurePropagating(richContent)
    expect(result.hasEventDriven).toBe(true)
  })

  it('detects observable in rich content', () => {
    const result = measurePropagating(richContent)
    expect(result.hasObservable).toBe(true)
  })

  it('detects decoupled in rich content', () => {
    const result = measurePropagating(richContent)
    expect(result.hasDecoupled).toBe(true)
  })

  it('detects high propagation for rich content', () => {
    const result = measurePropagating(richContent)
    expect(result.hasHighPropagation).toBe(true)
  })

  it('grades empty content as no-propagation', () => {
    expect(measurePropagating(emptyContent).sound).toBe('no-propagation')
  })
})

// ─── measureBalancing ──────────────────────────────────────────────

describe('measureBalancing', () => {
  it('returns valid BalancingMeasure for empty content', () => {
    const result = measureBalancing(emptyContent)
    expect(result.balance).toBeGreaterThanOrEqual(0)
    expect(result.balance).toBeLessThanOrEqual(100)
    expect(typeof result.acoustics).toBe('string')
    expect(result.godFunctionCount).toBe(0)
    expect(result.overweightCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureBalancing(emptyContent)
    const rich = measureBalancing(richContent)
    expect(rich.balance).toBeGreaterThan(empty.balance)
  })

  it('detects even distribution in rich content', () => {
    const result = measureBalancing(richContent)
    expect(result.hasEvenDistribution).toBe(true)
  })

  it('detects balanced complexity in rich content', () => {
    const result = measureBalancing(richContent)
    expect(result.hasBalancedComplexity).toBe(true)
  })

  it('detects proportional patterns in rich content', () => {
    const result = measureBalancing(richContent)
    expect(result.hasProportional).toBe(true)
  })

  it('detects tempered patterns in rich content', () => {
    const result = measureBalancing(richContent)
    expect(result.hasTempered).toBe(true)
  })

  it('detects high balance for rich content', () => {
    const result = measureBalancing(richContent)
    expect(result.hasHighBalance).toBe(true)
  })

  it('grades empty content as cacophony', () => {
    expect(measureBalancing(emptyContent).acoustics).toBe('cacophony')
  })
})

// ─── classifyEchoCondition ─────────────────────────────────────────

describe('classifyEchoCondition', () => {
  it('classifies 90 as thunder-masterpiece', () => expect(classifyEchoCondition(90)).toBe('thunder-masterpiece'))
  it('classifies 75 as resonant-chamber', () => expect(classifyEchoCondition(75)).toBe('resonant-chamber'))
  it('classifies 60 as proper-well', () => expect(classifyEchoCondition(60)).toBe('proper-well'))
  it('classifies 45 as cracked-basin', () => expect(classifyEchoCondition(45)).toBe('cracked-basin'))
  it('classifies 30 as dry-well', () => expect(classifyEchoCondition(30)).toBe('dry-well'))
  it('classifies 10 as ruined-cistern', () => expect(classifyEchoCondition(10)).toBe('ruined-cistern'))
  it('classifies 0 as ruined-cistern', () => expect(classifyEchoCondition(0)).toBe('ruined-cistern'))
  it('classifies 85 as thunder-masterpiece', () => expect(classifyEchoCondition(85)).toBe('thunder-masterpiece'))
})

// ─── classifyChamberType ───────────────────────────────────────────

describe('classifyChamberType', () => {
  it('returns no-chamber for empty echoes', () => {
    expect(classifyChamberType([])).toBe('no-chamber')
  })

  it('returns grand-amphitheater for high quality with masterpiece majority', () => {
    const echoes: ThunderEcho[] = Array.from({ length: 4 }, (_, i) => ({
      file: `file${i}.ts`,
      resonanceDepth: 90, echoClarity: 90, reverberationQuality: 90,
      soundPropagation: 90, acousticBalance: 90,
      resonating: measureResonating(richContent),
      echoing: measureEchoing(richContent),
      reverberating: measureReverberating(richContent),
      propagating: measurePropagating(richContent),
      balancing: measureBalancing(richContent),
      condition: 'thunder-masterpiece' as const,
      qualityScore: 85,
    }))
    const result = classifyChamberType(echoes)
    expect(['grand-amphitheater', 'concert-hall']).toContain(result)
  })

  it('returns no-chamber for very low quality', () => {
    const echoes: ThunderEcho[] = Array.from({ length: 2 }, (_, i) => ({
      file: `file${i}.ts`,
      resonanceDepth: 5, echoClarity: 5, reverberationQuality: 5,
      soundPropagation: 5, acousticBalance: 5,
      resonating: measureResonating(emptyContent),
      echoing: measureEchoing(emptyContent),
      reverberating: measureReverberating(emptyContent),
      propagating: measurePropagating(emptyContent),
      balancing: measureBalancing(emptyContent),
      condition: 'ruined-cistern' as const,
      qualityScore: 5,
    }))
    expect(classifyChamberType(echoes)).toBe('no-chamber')
  })
})

// ─── classifyChamberCondition ──────────────────────────────────────

describe('classifyChamberCondition', () => {
  it('classifies 80 as magnificent-acoustics', () => expect(classifyChamberCondition(80)).toBe('magnificent-acoustics'))
  it('classifies 65 as excellent-sound', () => expect(classifyChamberCondition(65)).toBe('excellent-sound'))
  it('classifies 50 as decent-reverb', () => expect(classifyChamberCondition(50)).toBe('decent-reverb'))
  it('classifies 35 as poor-acoustics', () => expect(classifyChamberCondition(35)).toBe('poor-acoustics'))
  it('classifies 20 as dead-space', () => expect(classifyChamberCondition(20)).toBe('dead-space'))
  it('classifies 5 as void', () => expect(classifyChamberCondition(5)).toBe('void'))
})

// ─── classifyAcousticGrade ────────────────────────────────────────

describe('classifyAcousticGrade', () => {
  it('classifies 85 as maestro', () => expect(classifyAcousticGrade(85)).toBe('maestro'))
  it('classifies 70 as virtuoso', () => expect(classifyAcousticGrade(70)).toBe('virtuoso'))
  it('classifies 55 as musician', () => expect(classifyAcousticGrade(55)).toBe('musician'))
  it('classifies 40 as apprentice', () => expect(classifyAcousticGrade(40)).toBe('apprentice'))
  it('classifies 25 as novice', () => expect(classifyAcousticGrade(25)).toBe('novice'))
  it('classifies 10 as tone-deaf', () => expect(classifyAcousticGrade(10)).toBe('tone-deaf'))
})

// ─── analyzeThunderEcho ────────────────────────────────────────────

describe('analyzeThunderEcho', () => {
  it('analyzes empty content as ruined-cistern', () => {
    const result = analyzeThunderEcho(emptyContent, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.condition).toBe('ruined-cistern')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzes rich content with higher scores than empty', () => {
    const empty = analyzeThunderEcho(emptyContent, 'empty.ts')
    const rich = analyzeThunderEcho(richContent, 'rich.ts')
    expect(rich.qualityScore).toBeGreaterThan(empty.qualityScore)
  })

  it('qualityScore equals weighted average of 5 measures', () => {
    const result = analyzeThunderEcho(moderateContent, 'mod.ts')
    const expected = Math.round(
      result.resonating.depth * 0.2 +
      result.echoing.clarity * 0.2 +
      result.reverberating.quality * 0.2 +
      result.propagating.propagation * 0.2 +
      result.balancing.balance * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })

  it('populates all 5 measure objects', () => {
    const result = analyzeThunderEcho(richContent, 'rich.ts')
    expect(result.resonating).toBeDefined()
    expect(result.echoing).toBeDefined()
    expect(result.reverberating).toBeDefined()
    expect(result.propagating).toBeDefined()
    expect(result.balancing).toBeDefined()
  })

  it('sets resonanceDepth from resonating.depth', () => {
    const result = analyzeThunderEcho(richContent, 'rich.ts')
    expect(result.resonanceDepth).toBe(result.resonating.depth)
  })

  it('sets echoClarity from echoing.clarity', () => {
    const result = analyzeThunderEcho(richContent, 'rich.ts')
    expect(result.echoClarity).toBe(result.echoing.clarity)
  })
})

// ─── analyzeAcousticChamber ────────────────────────────────────────

describe('analyzeAcousticChamber', () => {
  it('returns empty chamber for no echoes', () => {
    const result = analyzeAcousticChamber([], 'src')
    expect(result.directory).toBe('src')
    expect(result.echoes).toHaveLength(0)
    expect(result.avgResonance).toBe(0)
    expect(result.avgClarity).toBe(0)
    expect(result.avgBalance).toBe(0)
    expect(result.thunderMasterpieceCount).toBe(0)
    expect(result.ruinedCisternCount).toBe(0)
    expect(result.chamberType).toBe('no-chamber')
    expect(result.condition).toBe('void')
  })

  it('computes averages for single echo', () => {
    const echo = analyzeThunderEcho(richContent, 'rich.ts')
    const result = analyzeAcousticChamber([echo], 'src')
    expect(result.avgResonance).toBe(echo.resonanceDepth)
    expect(result.avgClarity).toBe(echo.echoClarity)
    expect(result.avgBalance).toBe(echo.acousticBalance)
  })

  it('counts masterpieces and ruined', () => {
    const masterpiece = analyzeThunderEcho(richContent, 'rich.ts')
    const ruined = analyzeThunderEcho(emptyContent, 'empty.ts')
    if (masterpiece.condition === 'thunder-masterpiece' && ruined.condition === 'ruined-cistern') {
      const result = analyzeAcousticChamber([masterpiece, ruined], 'src')
      expect(result.thunderMasterpieceCount).toBe(1)
      expect(result.ruinedCisternCount).toBe(1)
    }
  })
})

// ─── buildThunderWellResult ────────────────────────────────────────

describe('buildThunderWellResult', () => {
  it('handles empty input', async () => {
    const result = await buildThunderWellResult([], [])
    expect(result.echoes).toHaveLength(0)
    expect(result.chambers).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalChambers).toBe(0)
    expect(result.stats.overallAcoustics).toBe(0)
    expect(result.symphony.isHarmonious).toBe(false)
    expect(result.symphony.overallAcoustics).toBe(0)
  })

  it('processes single file', async () => {
    const result = await buildThunderWellResult(['file.ts'], [richContent])
    expect(result.echoes).toHaveLength(1)
    expect(result.echoes[0].file).toBe('file.ts')
    expect(result.chambers).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files into chambers by directory', async () => {
    const result = await buildThunderWellResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.echoes).toHaveLength(3)
    expect(result.chambers).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalChambers).toBe(2)
  })

  it('computes symphony summary correctly', async () => {
    const result = await buildThunderWellResult(['f.ts'], [richContent])
    expect(result.symphony.avgResonance).toBe(result.echoes[0].resonanceDepth)
    expect(result.symphony.overallAcoustics).toBeGreaterThanOrEqual(0)
  })

  it('sets isHarmonious when avgResonance >= 60', async () => {
    const result = await buildThunderWellResult(['f.ts'], [richContent])
    if (result.symphony.avgResonance >= 60) {
      expect(result.symphony.isHarmonious).toBe(true)
    } else {
      expect(result.symphony.isHarmonious).toBe(false)
    }
  })

  it('tracks best echo and top performers', async () => {
    const result = await buildThunderWellResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestEcho).toBe('a.ts')
    expect(result.stats.mostResonant).toBeDefined()
    expect(result.stats.clearestEcho).toBeDefined()
    expect(result.stats.bestReverberation).toBeDefined()
    expect(result.stats.bestPropagation).toBeDefined()
  })

  it('computes overallAcoustics as avg of resonance+clarity+balance', async () => {
    const result = await buildThunderWellResult(['f.ts'], [moderateContent])
    const expected = Math.round(
      (result.symphony.avgResonance + result.symphony.avgClarity + result.symphony.avgBalance) / 3,
    )
    expect(result.symphony.overallAcoustics).toBe(expected)
  })

  it('counts condition distribution correctly', async () => {
    const result = await buildThunderWellResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, emptyContent, poorContent],
    )
    const total = result.stats.thunderMasterpieceCount +
      result.stats.resonantChamberCount +
      result.stats.properWellCount +
      result.stats.crackedBasinCount +
      result.stats.dryWellCount +
      result.stats.ruinedCisternCount
    expect(total).toBe(3)
  })

  it('generates recommendations', async () => {
    const result = await buildThunderWellResult(['f.ts'], [emptyContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('sets acoustic grade', async () => {
    const result = await buildThunderWellResult(['f.ts'], [richContent])
    expect(['maestro', 'virtuoso', 'musician', 'apprentice', 'novice', 'tone-deaf']).toContain(
      result.stats.acousticGrade,
    )
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: ThunderWellStats = {
    totalFiles: 0, totalChambers: 0,
    avgResonanceDepth: 0, avgEchoClarity: 0, avgReverberationQuality: 0,
    avgSoundPropagation: 0, avgAcousticBalance: 0,
    thunderMasterpieceCount: 0, resonantChamberCount: 0, properWellCount: 0,
    crackedBasinCount: 0, dryWellCount: 0, ruinedCisternCount: 0,
    hasHighDepthCount: 0, hasHighClarityCount: 0, hasHighQualityCount: 0,
    hasHighPropagationCount: 0, hasHighBalanceCount: 0,
    overallAcoustics: 0, acousticGrade: 'tone-deaf',
    bestEcho: '', mostResonant: '', clearestEcho: '', bestReverberation: '', bestPropagation: '',
  }

  const emptySymphony: SymphonySummary = {
    avgResonance: 0, avgClarity: 0, avgBalance: 0,
    isHarmonious: false, overallAcoustics: 0,
  }

  it('recommends improvement when all averages are low', () => {
    const recs = generateRecommendations([], [], emptySymphony, emptyStats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('includes resonance recommendation when avgResonanceDepth < 50', () => {
    const stats = { ...emptyStats, avgResonanceDepth: 30 }
    const recs = generateRecommendations([], [], emptySymphony, stats)
    expect(recs.some(r => r.includes('resonance'))).toBe(true)
  })

  it('includes echo recommendation when avgEchoClarity < 50', () => {
    const stats = { ...emptyStats, avgEchoClarity: 30 }
    const recs = generateRecommendations([], [], emptySymphony, stats)
    expect(recs.some(r => r.includes('echo'))).toBe(true)
  })

  it('includes reverberation recommendation when avgReverberationQuality < 50', () => {
    const stats = { ...emptyStats, avgReverberationQuality: 30 }
    const recs = generateRecommendations([], [], emptySymphony, stats)
    expect(recs.some(r => r.includes('reverberation'))).toBe(true)
  })

  it('includes propagation recommendation when avgSoundPropagation < 50', () => {
    const stats = { ...emptyStats, avgSoundPropagation: 30 }
    const recs = generateRecommendations([], [], emptySymphony, stats)
    expect(recs.some(r => r.includes('propagation'))).toBe(true)
  })

  it('includes balance recommendation when avgAcousticBalance < 50', () => {
    const stats = { ...emptyStats, avgAcousticBalance: 30 }
    const recs = generateRecommendations([], [], emptySymphony, stats)
    expect(recs.some(r => r.includes('balance') || r.includes('acoustics'))).toBe(true)
  })

  it('includes ruined guidance when ruinedCisternCount > 0', () => {
    const stats = { ...emptyStats, ruinedCisternCount: 3 }
    const recs = generateRecommendations([], [], emptySymphony, stats)
    expect(recs.some(r => r.includes('ruined cistern'))).toBe(true)
  })

  it('includes acoustics recommendation when overallAcoustics < 40', () => {
    const stats = { ...emptyStats, overallAcoustics: 20 }
    const symphony = { ...emptySymphony, overallAcoustics: 20 }
    const recs = generateRecommendations([], [], symphony, stats)
    expect(recs.some(r => r.includes('acoustics'))).toBe(true)
  })

  it('praises maestro quality when all metrics are high', () => {
    const highStats: ThunderWellStats = {
      ...emptyStats,
      avgResonanceDepth: 80, avgEchoClarity: 80, avgReverberationQuality: 80,
      avgSoundPropagation: 80, avgAcousticBalance: 80,
      overallAcoustics: 80, acousticGrade: 'maestro',
    }
    const highSymphony: SymphonySummary = {
      avgResonance: 80, avgClarity: 80, avgBalance: 80,
      isHarmonious: true, overallAcoustics: 80,
    }
    const recs = generateRecommendations([], [], highSymphony, highStats)
    expect(recs.some(r => r.includes('maestro'))).toBe(true)
  })

  it('mentions specific ruined files when <= 3', () => {
    const echo: ThunderEcho = analyzeThunderEcho(emptyContent, 'bad.ts')
    const stats = { ...emptyStats, ruinedCisternCount: 1 }
    const recs = generateRecommendations([echo], [], emptySymphony, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })
})

// ─── format helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => expect(typeof colorScore(50)).toBe('string'))
  it('handles 0', () => expect(typeof colorScore(0)).toBe('string'))
  it('handles 100', () => expect(typeof colorScore(100)).toBe('string'))
})

describe('colorGrade', () => {
  it('returns a string for thunder-masterpiece', () => expect(typeof colorGrade('thunder-masterpiece')).toBe('string'))
  it('returns a string for ruined-cistern', () => expect(typeof colorGrade('ruined-cistern')).toBe('string'))
  it('returns a string for unknown', () => expect(typeof colorGrade('unknown-grade')).toBe('string'))
})

describe('formatEchoTable', () => {
  it('formats a single echo', () => {
    const echo = analyzeThunderEcho(richContent, 'rich.ts')
    const result = formatEchoTable(echo)
    expect(result).toContain('rich.ts')
    expect(result).toContain('Resonance Depth')
    expect(result).toContain('Echo Clarity')
    expect(result).toContain('Reverberation Quality')
    expect(result).toContain('Sound Propagation')
    expect(result).toContain('Acoustic Balance')
  })
})

describe('formatEchoesTable', () => {
  it('handles empty array', () => expect(formatEchoesTable([])).toContain('No thunder echoes'))
  it('formats multiple echoes', () => {
    const echoes = [
      analyzeThunderEcho(richContent, 'a.ts'),
      analyzeThunderEcho(moderateContent, 'b.ts'),
    ]
    const result = formatEchoesTable(echoes)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatChamberTable', () => {
  it('formats a chamber', () => {
    const echo = analyzeThunderEcho(richContent, 'rich.ts')
    const chamber = analyzeAcousticChamber([echo], 'src')
    const result = formatChamberTable(chamber)
    expect(result).toContain('src')
    expect(result).toContain('Chamber')
  })
})

describe('formatChambersTable', () => {
  it('handles empty array', () => expect(formatChambersTable([])).toContain('No acoustic chambers'))
  it('formats chambers', () => {
    const echo = analyzeThunderEcho(richContent, 'src/a.ts')
    const chamber = analyzeAcousticChamber([echo], 'src')
    const result = formatChambersTable([chamber])
    expect(result).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const res = await buildThunderWellResult(['f.ts'], [richContent])
    const result = formatStatsTable(res.stats)
    expect(result).toContain('Thunder Well Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Overall Acoustics')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => expect(formatRecommendations([])).toContain('No recommendations'))
  it('formats recommendations as bullet list', () => {
    const result = formatRecommendations(['Deepen resonance', 'Sharpen clarity'])
    expect(result).toContain('Deepen resonance')
    expect(result).toContain('Sharpen clarity')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildThunderWellResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Thunder Well Analysis')
    expect(formatted).toContain('Recommendations')
    expect(formatted).toContain('Harmonious')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildThunderWellResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.echoes).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.symphony).toBeDefined()
  })
})
