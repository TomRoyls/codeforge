import { describe, it, expect } from 'vitest'

import {
  measureIlluminating,
  measureDraping,
  measurePurifying,
  measureEnduring,
  measureAccumulating,
  analyzeGoldenThread,
  analyzeGoldenPalace,
  buildGoldenCurtainResult,
  classifyThreadCondition,
  classifyPalaceType,
  classifyPalaceCondition,
  classifyGoldsmithGrade,
  generateRecommendations,
  type GoldenThread,
} from '../src/commands/golden-curtain-helpers.js'

import {
  colorScore,
  colorCondition,
  colorPalaceCondition,
  formatThreadTable,
  formatThreadsTable,
  formatPalaceTable,
  formatPalacesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/golden-curtain-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const emptyContent = ''

const richContent = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/** Documentation */
export interface Config {
  readonly name: string
  private?: boolean
}

export type Options = Record<string, unknown>

export class Analyzer<T> {
  async analyze(input: string): Promise<Result> {
    try {
      const result = readFileSync(input, 'utf8')
      if (result === 'test') {
        return JSON.parse(result) as Result
      }
      return {} as Result
    } catch (err) {
      throw new Error('fail')
    }
  }
}

export const defaultConfig: Options = { name: 'test' }
`

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('returns all fields', () => {
    const result = measureIlluminating(richContent)
    expect(result).toHaveProperty('clarity')
    expect(result).toHaveProperty('radiance')
    expect(result).toHaveProperty('hasHighClarity')
    expect(result).toHaveProperty('hasReadable')
    expect(result).toHaveProperty('hasNoCryptic')
    expect(result).toHaveProperty('hasSelfDocumenting')
    expect(result).toHaveProperty('hasNoMystery')
    expect(result).toHaveProperty('hasClear')
    expect(result).toHaveProperty('hasNoObfuscated')
    expect(result).toHaveProperty('hasTransparent')
    expect(result).toHaveProperty('hasUnderstandable')
    expect(result).toHaveProperty('hasVisible')
    expect(result).toHaveProperty('hasDirect')
    expect(result).toHaveProperty('hasIlluminated')
    expect(result).toHaveProperty('hasRevealed')
    expect(result).toHaveProperty('hasWarm')
    expect(result).toHaveProperty('hasInviting')
    expect(result).toHaveProperty('hasOpen')
    expect(result).toHaveProperty('crypticCount')
    expect(result).toHaveProperty('obfuscatedCount')
  })

  it('detects readable code', () => {
    expect(measureIlluminating(richContent).hasReadable).toBe(true)
  })

  it('detects cryptic names', () => {
    const result = measureIlluminating('const a = 1')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects mystery patterns', () => {
    expect(measureIlluminating('const magic = 42').hasNoMystery).toBe(false)
  })

  it('detects illuminated code (documentation)', () => {
    expect(measureIlluminating(richContent).hasIlluminated).toBe(true)
  })

  it('detects warm code (async)', () => {
    expect(measureIlluminating(richContent).hasWarm).toBe(true)
  })

  it('classifies radiance correctly', () => {
    expect(measureIlluminating(richContent).radiance).toBeDefined()
  })
})

// ─── measureDraping ─────────────────────────────────────

describe('measureDraping', () => {
  it('returns all fields', () => {
    const result = measureDraping(richContent)
    expect(result).toHaveProperty('elegance')
    expect(result).toHaveProperty('drape')
    expect(result).toHaveProperty('hasHighElegance')
    expect(result).toHaveProperty('hasElegant')
    expect(result).toHaveProperty('hasNoClunky')
    expect(result).toHaveProperty('hasRefined')
    expect(result).toHaveProperty('hasPolished')
    expect(result).toHaveProperty('hasClean')
    expect(result).toHaveProperty('hasGraceful')
    expect(result).toHaveProperty('hasSimple')
    expect(result).toHaveProperty('hasNoOvercomplicated')
    expect(result).toHaveProperty('hasTasteful')
    expect(result).toHaveProperty('hasSubtle')
    expect(result).toHaveProperty('hasBalanced')
    expect(result).toHaveProperty('hasHarmonious')
    expect(result).toHaveProperty('hasAesthetic')
    expect(result).toHaveProperty('hasLight')
    expect(result).toHaveProperty('hasSophisticated')
    expect(result).toHaveProperty('clunkyCount')
    expect(result).toHaveProperty('overcomplicatedCount')
  })

  it('detects elegant code', () => {
    expect(measureDraping(richContent).hasElegant).toBe(true)
  })

  it('detects clunky patterns (eval)', () => {
    const result = measureDraping('eval("code")')
    expect(result.clunkyCount).toBe(1)
    expect(result.hasNoClunky).toBe(false)
  })

  it('detects refined code', () => {
    expect(measureDraping(richContent).hasRefined).toBe(true)
  })

  it('detects overcomplicated patterns', () => {
    const result = measureDraping('nested callback hell pyramid')
    expect(result.overcomplicatedCount).toBeGreaterThan(0)
  })

  it('detects aesthetic code (no any)', () => {
    expect(measureDraping(richContent).hasAesthetic).toBe(true)
  })

  it('classifies drape correctly', () => {
    expect(measureDraping(richContent).drape).toBeDefined()
  })
})

// ─── measurePurifying ───────────────────────────────────

describe('measurePurifying', () => {
  it('returns all fields', () => {
    const result = measurePurifying(richContent)
    expect(result).toHaveProperty('purity')
    expect(result).toHaveProperty('karat')
    expect(result).toHaveProperty('hasHighPurity')
    expect(result).toHaveProperty('hasTypeSafe')
    expect(result).toHaveProperty('hasNoUnsafe')
    expect(result).toHaveProperty('hasClean')
    expect(result).toHaveProperty('hasNoDirty')
    expect(result).toHaveProperty('hasAccurate')
    expect(result).toHaveProperty('hasNoApproximate')
    expect(result).toHaveProperty('hasConsistent')
    expect(result).toHaveProperty('hasNoContradictory')
    expect(result).toHaveProperty('hasPure')
    expect(result).toHaveProperty('hasHonest')
    expect(result).toHaveProperty('hasFaithful')
    expect(result).toHaveProperty('hasUncontaminated')
    expect(result).toHaveProperty('hasUnadulterated')
    expect(result).toHaveProperty('hasGenuine')
    expect(result).toHaveProperty('hasAuthentic')
    expect(result).toHaveProperty('unsafeCount')
    expect(result).toHaveProperty('contradictoryCount')
  })

  it('detects type-safe code', () => {
    expect(measurePurifying(richContent).hasTypeSafe).toBe(true)
  })

  it('detects unsafe (any)', () => {
    const result = measurePurifying('const x: any = 1')
    expect(result.unsafeCount).toBe(1)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects dirty patterns', () => {
    expect(measurePurifying('dirty hacky gross').hasNoDirty).toBe(false)
  })

  it('detects contaminated code (var, eval)', () => {
    expect(measurePurifying('var x = eval("1")').hasUncontaminated).toBe(false)
  })

  it('detects authentic code (documentation)', () => {
    expect(measurePurifying(richContent).hasAuthentic).toBe(true)
  })

  it('classifies karat correctly', () => {
    expect(measurePurifying(richContent).karat).toBeDefined()
  })
})

// ─── measureEnduring ────────────────────────────────────

describe('measureEnduring', () => {
  it('returns all fields', () => {
    const result = measureEnduring(richContent)
    expect(result).toHaveProperty('resilience')
    expect(result).toHaveProperty('permanence')
    expect(result).toHaveProperty('hasHighResilience')
    expect(result).toHaveProperty('hasErrorHandled')
    expect(result).toHaveProperty('hasNoUnhandled')
    expect(result).toHaveProperty('hasDefensive')
    expect(result).toHaveProperty('hasRobust')
    expect(result).toHaveProperty('hasStable')
    expect(result).toHaveProperty('hasNoVolatile')
    expect(result).toHaveProperty('hasTested')
    expect(result).toHaveProperty('hasNoUntested')
    expect(result).toHaveProperty('hasMaintained')
    expect(result).toHaveProperty('hasEnduring')
    expect(result).toHaveProperty('hasDurable')
    expect(result).toHaveProperty('hasPermanent')
    expect(result).toHaveProperty('hasTimeless')
    expect(result).toHaveProperty('hasLasting')
    expect(result).toHaveProperty('unhandledCount')
    expect(result).toHaveProperty('volatileCount')
  })

  it('detects error handling', () => {
    expect(measureEnduring(richContent).hasErrorHandled).toBe(true)
  })

  it('detects volatile patterns', () => {
    const result = measureEnduring('volatile unstable fragile')
    expect(result.volatileCount).toBeGreaterThan(0)
    expect(result.hasNoVolatile).toBe(false)
  })

  it('detects stable code', () => {
    expect(measureEnduring(richContent).hasStable).toBe(true)
  })

  it('detects maintained code (documentation)', () => {
    expect(measureEnduring(richContent).hasMaintained).toBe(true)
  })

  it('classifies permanence correctly', () => {
    expect(measureEnduring(richContent).permanence).toBeDefined()
  })
})

// ─── measureAccumulating ────────────────────────────────

describe('measureAccumulating', () => {
  it('returns all fields', () => {
    const result = measureAccumulating(richContent)
    expect(result).toHaveProperty('wisdom')
    expect(result).toHaveProperty('legacy')
    expect(result).toHaveProperty('hasHighWisdom')
    expect(result).toHaveProperty('hasWellArchitected')
    expect(result).toHaveProperty('hasNoHacked')
    expect(result).toHaveProperty('hasPrincipled')
    expect(result).toHaveProperty('hasNoAdHoc')
    expect(result).toHaveProperty('hasProven')
    expect(result).toHaveProperty('hasDeep')
    expect(result).toHaveProperty('hasMature')
    expect(result).toHaveProperty('hasStrategic')
    expect(result).toHaveProperty('hasInsightful')
    expect(result).toHaveProperty('hasEvolved')
    expect(result).toHaveProperty('hasHistorical')
    expect(result).toHaveProperty('hasTimeless')
    expect(result).toHaveProperty('hasValuable')
    expect(result).toHaveProperty('hasWise')
    expect(result).toHaveProperty('hasAccumulated')
    expect(result).toHaveProperty('hackedCount')
    expect(result).toHaveProperty('adHocCount')
  })

  it('detects hacked patterns', () => {
    const result = measureAccumulating('hack: workaround')
    expect(result.hackedCount).toBeGreaterThan(0)
  })

  it('detects ad-hoc patterns', () => {
    const result = measureAccumulating('quick dirty temporary')
    expect(result.adHocCount).toBeGreaterThan(0)
  })

  it('detects insightful code', () => {
    expect(measureAccumulating(richContent).hasInsightful).toBe(true)
  })

  it('detects timeless code (no any)', () => {
    expect(measureAccumulating(richContent).hasTimeless).toBe(true)
  })

  it('classifies legacy correctly', () => {
    expect(measureAccumulating(richContent).legacy).toBeDefined()
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyThreadCondition', () => {
  it('returns golden-masterpiece for 90+', () => {
    expect(classifyThreadCondition(90)).toBe('golden-masterpiece')
  })
  it('returns royal-standard for 75-89', () => {
    expect(classifyThreadCondition(75)).toBe('royal-standard')
  })
  it('returns proper-gold for 60-74', () => {
    expect(classifyThreadCondition(60)).toBe('proper-gold')
  })
  it('returns brass-finish for 40-59', () => {
    expect(classifyThreadCondition(40)).toBe('brass-finish')
  })
  it('returns tarnished-copper for 20-39', () => {
    expect(classifyThreadCondition(20)).toBe('tarnished-copper')
  })
  it('returns void for 0-19', () => {
    expect(classifyThreadCondition(0)).toBe('void')
  })
})

describe('classifyPalaceType', () => {
  it('returns no-palace for empty', () => {
    expect(classifyPalaceType([])).toBe('no-palace')
  })
  it('returns treasury for high avg', () => {
    const threads = [{ qualityScore: 90 }].map((t) => ({ ...t } as GoldenThread))
    expect(classifyPalaceType(threads)).toBe('treasury')
  })
})

describe('classifyPalaceCondition', () => {
  it('returns golden-throne-room for 85+', () => {
    expect(classifyPalaceCondition(85)).toBe('golden-throne-room')
  })
  it('returns void for 0-14', () => {
    expect(classifyPalaceCondition(0)).toBe('void')
  })
})

describe('classifyGoldsmithGrade', () => {
  it('returns master-goldsmith for 80+', () => {
    expect(classifyGoldsmithGrade(80)).toBe('master-goldsmith')
  })
  it('returns tin-smith for 0-19', () => {
    expect(classifyGoldsmithGrade(0)).toBe('tin-smith')
  })
  it('returns royal-jeweler for 65-79', () => {
    expect(classifyGoldsmithGrade(65)).toBe('royal-jeweler')
  })
  it('returns proper-craftsman for 50-64', () => {
    expect(classifyGoldsmithGrade(50)).toBe('proper-craftsman')
  })
  it('returns apprentice for 35-49', () => {
    expect(classifyGoldsmithGrade(35)).toBe('apprentice')
  })
  it('returns novice for 20-34', () => {
    expect(classifyGoldsmithGrade(20)).toBe('novice')
  })
})

// ─── analyzeGoldenThread ────────────────────────────────

describe('analyzeGoldenThread', () => {
  it('returns a complete thread', () => {
    const thread = analyzeGoldenThread(richContent, 'app.ts')
    expect(thread.file).toBe('app.ts')
    expect(thread.radiantClarity).toBeGreaterThanOrEqual(0)
    expect(thread.veilElegance).toBeGreaterThanOrEqual(0)
    expect(thread.aurumPurity).toBeGreaterThanOrEqual(0)
    expect(thread.goldenResilience).toBeGreaterThanOrEqual(0)
    expect(thread.legacyWisdom).toBeGreaterThanOrEqual(0)
    expect(thread.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('computes qualityScore as 0.2 weighted average', () => {
    const thread = analyzeGoldenThread(richContent, 'test.ts')
    const expected = Math.round(
      thread.radiantClarity * 0.2 +
      thread.veilElegance * 0.2 +
      thread.aurumPurity * 0.2 +
      thread.goldenResilience * 0.2 +
      thread.legacyWisdom * 0.2,
    )
    expect(thread.qualityScore).toBe(expected)
  })

  it('handles empty content', () => {
    expect(analyzeGoldenThread(emptyContent, 'e.ts').qualityScore).toBeLessThan(40)
  })
})

// ─── analyzeGoldenPalace ────────────────────────────────

describe('analyzeGoldenPalace', () => {
  it('returns empty palace for no threads', () => {
    const palace = analyzeGoldenPalace([], 'src')
    expect(palace.palaceType).toBe('no-palace')
    expect(palace.condition).toBe('void')
  })

  it('computes averages from threads', () => {
    const thread = analyzeGoldenThread(richContent, 'app.ts')
    const palace = analyzeGoldenPalace([thread], 'src')
    expect(palace.avgClarity).toBe(thread.radiantClarity)
  })
})

// ─── buildGoldenCurtainResult ───────────────────────────

describe('buildGoldenCurtainResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildGoldenCurtainResult([], [])
    expect(result.threads).toHaveLength(0)
    expect(result.treasury.isGolden).toBe(false)
    expect(result.stats.goldsmithGrade).toBe('tin-smith')
  })

  it('returns complete result for rich content', async () => {
    const result = await buildGoldenCurtainResult(['app.ts'], [richContent])
    expect(result.threads).toHaveLength(1)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into palaces by directory', async () => {
    const result = await buildGoldenCurtainResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    expect(result.palaces).toHaveLength(2)
  })

  it('computes all stats fields', async () => {
    const result = await buildGoldenCurtainResult(['a.ts'], [richContent])
    expect(result.stats.avgRadiantClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgVeilElegance).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgAurumPurity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgGoldenResilience).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgLegacyWisdom).toBeGreaterThanOrEqual(0)
    expect(typeof result.stats.bestThread).toBe('string')
    expect(typeof result.stats.clearest).toBe('string')
    expect(typeof result.stats.mostElegant).toBe('string')
    expect(typeof result.stats.purest).toBe('string')
    expect(typeof result.stats.mostResilient).toBe('string')
    expect(typeof result.stats.wisest).toBe('string')
  })

  it('scores rich content at max (100)', async () => {
    const result = await buildGoldenCurtainResult(['a.ts'], [richContent])
    const thread = result.threads[0]
    expect(thread.radiantClarity).toBe(100)
    expect(thread.veilElegance).toBe(100)
    expect(thread.aurumPurity).toBe(100)
    expect(thread.goldenResilience).toBe(100)
    expect(thread.legacyWisdom).toBe(100)
    expect(thread.qualityScore).toBe(100)
  })

  it('sets treasury.isGolden when brilliance >= 60', async () => {
    const result = await buildGoldenCurtainResult(['a.ts'], [richContent])
    expect(result.treasury.isGolden).toBe(true)
  })

  it('files in root map to . palace', async () => {
    const result = await buildGoldenCurtainResult(['app.ts'], [richContent])
    expect(result.palaces[0].directory).toBe('.')
  })

  it('sets bestThread to highest qualityScore', async () => {
    const result = await buildGoldenCurtainResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestThread).toBe('rich.ts')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece when all >= 90', async () => {
    const result = await buildGoldenCurtainResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends illumination when clarity low', async () => {
    const result = await buildGoldenCurtainResult(['a.ts'], ['var x = 1'])
    const hasRec = result.recommendations.some((r) => r.includes('Illuminate'))
    expect(hasRec).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorCondition('golden-masterpiece')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorPalaceCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorPalaceCondition('golden-throne-room')).toBe('string')
    expect(typeof colorPalaceCondition('void')).toBe('string')
  })
})

describe('formatThreadTable', () => {
  it('formats a thread', async () => {
    const result = await buildGoldenCurtainResult(['a.ts'], [richContent])
    const output = formatThreadTable(result.threads[0])
    expect(output).toContain('Golden Thread')
    expect(output).toContain('Radiant Clarity')
  })
})

describe('formatThreadsTable', () => {
  it('returns no threads for empty', () => {
    expect(formatThreadsTable([])).toContain('No golden threads')
  })
})

describe('formatPalaceTable', () => {
  it('formats a palace', async () => {
    const result = await buildGoldenCurtainResult(['a.ts'], [richContent])
    expect(formatPalaceTable(result.palaces[0])).toContain('Golden Palace')
  })
})

describe('formatPalacesTable', () => {
  it('returns no palaces for empty', () => {
    expect(formatPalacesTable([])).toContain('No golden palaces')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildGoldenCurtainResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Goldsmith Grade')
    expect(output).toContain('Best Thread')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildGoldenCurtainResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Golden Curtain Analysis')
    expect(output).toContain('Treasury Overview')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildGoldenCurtainResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.threads).toHaveLength(1)
  })
})
