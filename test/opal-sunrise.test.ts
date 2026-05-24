import { describe, expect, it } from 'vitest'
import {
  analyzeOpalShard,
  analyzeSunriseField,
  buildOpalSunriseResult,
  classifyShardCondition,
  classifyFieldType,
  classifyFieldCondition,
  classifyLapidaryGrade,
  generateRecommendations,
  measureDiffracting,
  measureIlluminating,
  measureWarming,
  measureSpanning,
  measureGlowing,
} from '../src/commands/opal-sunrise-helpers.js'
import {
  colorGrade,
  colorScore,
  formatShardTable,
  formatShardsTable,
  formatFieldTable,
  formatFieldsTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/opal-sunrise-format-helpers.js'

// ─── Test Fixtures ────────────────────────────────────────────────

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

// ─── measureDiffracting ───────────────────────────────────────────

describe('measureDiffracting', () => {
  it('returns play score for minimal content', () => {
    const m = measureDiffracting(minimalContent)
    expect(m.play).toBe(6)
    expect(m.grade).toBe('no-play')
  })

  it('returns play score for moderate content', () => {
    const m = measureDiffracting(moderateContent)
    expect(m.play).toBe(56)
    expect(m.grade).toBe('proper-color')
  })

  it('returns play score for rich content', () => {
    const m = measureDiffracting(richContent)
    expect(m.play).toBe(100)
    expect(m.grade).toBe('kaleidoscopic')
  })

  it('detects diverse and expressive in rich content', () => {
    const m = measureDiffracting(richContent)
    expect(m.hasDiverse).toBe(true)
    expect(m.hasExpressive).toBe(true)
    expect(m.hasColorful).toBe(true)
    expect(m.hasVaried).toBe(true)
    expect(m.hasCreative).toBe(true)
    expect(m.hasVibrant).toBe(true)
  })

  it('minimal content has no combos', () => {
    const m = measureDiffracting(minimalContent)
    expect(m.hasDiverse).toBe(false)
    expect(m.hasExpressive).toBe(false)
    expect(m.hasColorful).toBe(false)
    expect(m.hasVaried).toBe(false)
    expect(m.hasCreative).toBe(false)
    expect(m.hasVibrant).toBe(false)
  })

  it('detects hasHighPlay for rich content', () => {
    expect(measureDiffracting(richContent).hasHighPlay).toBe(true)
    expect(measureDiffracting(minimalContent).hasHighPlay).toBe(false)
  })

  it('counts monotone and drab patterns', () => {
    const m = measureDiffracting('var x: any = 1')
    expect(m.monotoneCount).toBe(1)
    expect(m.drabCount).toBe(1)
    expect(m.hasNoMonotone).toBe(false)
    expect(m.hasNoDrab).toBe(false)
  })

  it('hasNoUniform when no debugger present', () => {
    expect(measureDiffracting('const x = 1').hasNoUniform).toBe(true)
  })
})

// ─── measureIlluminating ──────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns clarity score for minimal content', () => {
    const m = measureIlluminating(minimalContent)
    expect(m.clarity).toBe(6)
    expect(m.dawn).toBe('no-light')
  })

  it('returns clarity score for moderate content', () => {
    const m = measureIlluminating(moderateContent)
    expect(m.clarity).toBe(47)
    expect(m.dawn).toBe('misty-dawn')
  })

  it('returns clarity score for rich content', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBe(100)
    expect(m.dawn).toBe('crystal-dawn')
  })

  it('detects combos in rich content', () => {
    const m = measureIlluminating(richContent)
    expect(m.hasReadable).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasApproachable).toBe(true)
    expect(m.hasInviting).toBe(true)
  })

  it('minimal content has no combos', () => {
    const m = measureIlluminating(minimalContent)
    expect(m.hasReadable).toBe(false)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasClear).toBe(false)
  })

  it('detects hasHighClarity', () => {
    expect(measureIlluminating(richContent).hasHighClarity).toBe(true)
    expect(measureIlluminating(minimalContent).hasHighClarity).toBe(false)
  })

  it('counts cryptic and obfuscated patterns', () => {
    const m = measureIlluminating('var x: any = 1')
    expect(m.crypticCount).toBe(1)
    expect(m.obfuscatedCount).toBe(1)
  })
})

// ─── measureWarming ───────────────────────────────────────────────

describe('measureWarming', () => {
  it('returns warmth score for minimal content', () => {
    const m = measureWarming(minimalContent)
    expect(m.warmth).toBe(6)
    expect(m.fire).toBe('no-fire')
  })

  it('returns warmth score for moderate content', () => {
    const m = measureWarming(moderateContent)
    expect(m.warmth).toBe(50)
    expect(m.fire).toBe('cool-flame')
  })

  it('returns warmth score for rich content', () => {
    const m = measureWarming(richContent)
    expect(m.warmth).toBe(100)
    expect(m.fire).toBe('blazing-hearth')
  })

  it('detects combos in rich content', () => {
    const m = measureWarming(richContent)
    expect(m.hasPassionate).toBe(true)
    expect(m.hasEnthusiastic).toBe(true)
    expect(m.hasEngaged).toBe(true)
    expect(m.hasAlive).toBe(true)
    expect(m.hasVibrant).toBe(true)
    expect(m.hasWarm).toBe(true)
  })

  it('minimal content has no combos', () => {
    const m = measureWarming(minimalContent)
    expect(m.hasPassionate).toBe(false)
    expect(m.hasEnthusiastic).toBe(false)
    expect(m.hasEngaged).toBe(false)
  })

  it('detects hasHighWarmth', () => {
    expect(measureWarming(richContent).hasHighWarmth).toBe(true)
    expect(measureWarming(minimalContent).hasHighWarmth).toBe(false)
  })

  it('counts apathetic and sterile patterns', () => {
    const m = measureWarming('var x: any = 1')
    expect(m.apatheticCount).toBe(1)
    expect(m.sterileCount).toBe(1)
  })
})

// ─── measureSpanning ──────────────────────────────────────────────

describe('measureSpanning', () => {
  it('returns richness score for minimal content', () => {
    const m = measureSpanning(minimalContent)
    expect(m.richness).toBe(6)
    expect(m.spectrum).toBe('no-spectrum')
  })

  it('returns richness score for moderate content', () => {
    const m = measureSpanning(moderateContent)
    expect(m.richness).toBe(57)
    expect(m.spectrum).toBe('proper-variety')
  })

  it('returns richness score for rich content', () => {
    const m = measureSpanning(richContent)
    expect(m.richness).toBe(99)
    expect(m.spectrum).toBe('full-spectrum')
  })

  it('detects combos in rich content', () => {
    const m = measureSpanning(richContent)
    expect(m.hasTypeHandling).toBe(true)
    expect(m.hasGeneric).toBe(true)
    expect(m.hasFlexible).toBe(true)
    expect(m.hasAdaptive).toBe(true)
    expect(m.hasVersatile).toBe(true)
    expect(m.hasCaseCoverage).toBe(false)
  })

  it('detects hasHighRichness', () => {
    expect(measureSpanning(richContent).hasHighRichness).toBe(true)
    expect(measureSpanning(minimalContent).hasHighRichness).toBe(false)
  })

  it('counts hardcoded and single path patterns', () => {
    const m = measureSpanning('eval("x"); var y: any')
    expect(m.hardcodedCount).toBe(1)
    expect(m.singlePathCount).toBe(1)
  })

  it('hasNoStatic when no var present', () => {
    expect(measureSpanning('const x = 1').hasNoStatic).toBe(true)
    expect(measureSpanning('var x = 1').hasNoStatic).toBe(false)
  })
})

// ─── measureGlowing ───────────────────────────────────────────────

describe('measureGlowing', () => {
  it('returns opalescence score for minimal content', () => {
    const m = measureGlowing(minimalContent)
    expect(m.opalescence).toBe(6)
    expect(m.quality).toBe('no-opalescence')
  })

  it('returns opalescence score for moderate content', () => {
    const m = measureGlowing(moderateContent)
    expect(m.opalescence).toBe(52)
    expect(m.quality).toBe('dull-shine')
  })

  it('returns opalescence score for rich content', () => {
    const m = measureGlowing(richContent)
    expect(m.opalescence).toBe(100)
    expect(m.quality).toBe('dreamlike-glow')
  })

  it('detects combos in rich content', () => {
    const m = measureGlowing(richContent)
    expect(m.hasBeautiful).toBe(true)
    expect(m.hasElegant).toBe(true)
    expect(m.hasWellCrafted).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasLuminous).toBe(true)
  })

  it('detects hasHighOpalescence', () => {
    expect(measureGlowing(richContent).hasHighOpalescence).toBe(true)
    expect(measureGlowing(minimalContent).hasHighOpalescence).toBe(false)
  })

  it('counts clunky and hacked patterns', () => {
    const m = measureGlowing('var x = eval("1")')
    expect(m.clunkyCount).toBe(1)
    expect(m.hackedCount).toBe(1)
    expect(m.hasNoClunky).toBe(false)
    expect(m.hasNoHacked).toBe(false)
  })
})

// ─── classifyShardCondition ───────────────────────────────────────

describe('classifyShardCondition', () => {
  it('classifies black-opal at 85+', () => {
    expect(classifyShardCondition(90)).toBe('black-opal')
    expect(classifyShardCondition(85)).toBe('black-opal')
  })
  it('classifies precious-opal at 70-84', () => {
    expect(classifyShardCondition(75)).toBe('precious-opal')
  })
  it('classifies common-opal at 55-69', () => {
    expect(classifyShardCondition(60)).toBe('common-opal')
  })
  it('classifies fire-opal at 40-54', () => {
    expect(classifyShardCondition(45)).toBe('fire-opal')
  })
  it('classifies wood-opal at 25-39', () => {
    expect(classifyShardCondition(30)).toBe('wood-opal')
  })
  it('classifies potch below 25', () => {
    expect(classifyShardCondition(20)).toBe('potch')
  })
})

// ─── classifyFieldType ────────────────────────────────────────────

describe('classifyFieldType', () => {
  it('returns no-field for empty shards', () => {
    expect(classifyFieldType([])).toBe('no-field')
  })
  it('returns lightning-ridge for high qs with many black opals', () => {
    const shards = Array.from({ length: 4 }, () => ({ qualityScore: 90, condition: 'black-opal' } as any))
    expect(classifyFieldType(shards)).toBe('lightning-ridge')
  })
  it('returns coober-pedy for avgQs >= 60', () => {
    expect(classifyFieldType([{ qualityScore: 65, condition: 'precious-opal' }] as any[])).toBe('coober-pedy')
  })
  it('returns proper-deposit for avgQs >= 45', () => {
    expect(classifyFieldType([{ qualityScore: 50, condition: 'common-opal' }] as any[])).toBe('proper-deposit')
  })
  it('returns small-seam for avgQs >= 30', () => {
    expect(classifyFieldType([{ qualityScore: 35, condition: 'fire-opal' }] as any[])).toBe('small-seam')
  })
  it('returns surface-find for avgQs >= 15', () => {
    expect(classifyFieldType([{ qualityScore: 20, condition: 'wood-opal' }] as any[])).toBe('surface-find')
  })
  it('returns no-field for very low avgQs', () => {
    expect(classifyFieldType([{ qualityScore: 5, condition: 'potch' }] as any[])).toBe('no-field')
  })
})

// ─── classifyFieldCondition ───────────────────────────────────────

describe('classifyFieldCondition', () => {
  it('classifies magnificent-sunrise at 75+', () => {
    expect(classifyFieldCondition(80)).toBe('magnificent-sunrise')
  })
  it('classifies beautiful-dawn at 60-74', () => {
    expect(classifyFieldCondition(65)).toBe('beautiful-dawn')
  })
  it('classifies decent-morning at 45-59', () => {
    expect(classifyFieldCondition(50)).toBe('decent-morning')
  })
  it('classifies grey-dawn at 30-44', () => {
    expect(classifyFieldCondition(35)).toBe('grey-dawn')
  })
  it('classifies dark-morning at 15-29', () => {
    expect(classifyFieldCondition(20)).toBe('dark-morning')
  })
  it('classifies void below 15', () => {
    expect(classifyFieldCondition(10)).toBe('void')
  })
})

// ─── classifyLapidaryGrade ────────────────────────────────────────

describe('classifyLapidaryGrade', () => {
  it('classifies master-lapidary at 80+', () => {
    expect(classifyLapidaryGrade(85)).toBe('master-lapidary')
  })
  it('classifies expert-cutter at 65-79', () => {
    expect(classifyLapidaryGrade(70)).toBe('expert-cutter')
  })
  it('classifies skilled-polisher at 50-64', () => {
    expect(classifyLapidaryGrade(55)).toBe('skilled-polisher')
  })
  it('classifies apprentice at 35-49', () => {
    expect(classifyLapidaryGrade(40)).toBe('apprentice')
  })
  it('classifies novice at 20-34', () => {
    expect(classifyLapidaryGrade(25)).toBe('novice')
  })
  it('classifies rock-tumbler below 20', () => {
    expect(classifyLapidaryGrade(10)).toBe('rock-tumbler')
  })
})

// ─── analyzeOpalShard ─────────────────────────────────────────────

describe('analyzeOpalShard', () => {
  it('analyzes minimal content correctly', () => {
    const shard = analyzeOpalShard(minimalContent, 'minimal.ts')
    expect(shard.file).toBe('minimal.ts')
    expect(shard.playOfColor).toBe(6)
    expect(shard.dawnClarity).toBe(6)
    expect(shard.fireWarmth).toBe(6)
    expect(shard.spectrumRichness).toBe(6)
    expect(shard.opalescenceQuality).toBe(6)
    expect(shard.qualityScore).toBe(6)
    expect(shard.condition).toBe('potch')
  })

  it('analyzes moderate content correctly', () => {
    const shard = analyzeOpalShard(moderateContent, 'moderate.ts')
    expect(shard.playOfColor).toBe(56)
    expect(shard.dawnClarity).toBe(47)
    expect(shard.fireWarmth).toBe(50)
    expect(shard.spectrumRichness).toBe(57)
    expect(shard.opalescenceQuality).toBe(52)
    expect(shard.qualityScore).toBe(52)
    expect(shard.condition).toBe('fire-opal')
  })

  it('analyzes rich content correctly', () => {
    const shard = analyzeOpalShard(richContent, 'rich.ts')
    expect(shard.playOfColor).toBe(100)
    expect(shard.dawnClarity).toBe(100)
    expect(shard.fireWarmth).toBe(100)
    expect(shard.spectrumRichness).toBe(99)
    expect(shard.opalescenceQuality).toBe(100)
    expect(shard.qualityScore).toBe(100)
    expect(shard.condition).toBe('black-opal')
  })

  it('populates all measure sub-objects', () => {
    const shard = analyzeOpalShard(richContent, 'rich.ts')
    expect(shard.diffracting.grade).toBe('kaleidoscopic')
    expect(shard.illuminating.dawn).toBe('crystal-dawn')
    expect(shard.warming.fire).toBe('blazing-hearth')
    expect(shard.spanning.spectrum).toBe('full-spectrum')
    expect(shard.glowing.quality).toBe('dreamlike-glow')
  })
})

// ─── analyzeSunriseField ──────────────────────────────────────────

describe('analyzeSunriseField', () => {
  it('returns empty field for no shards', () => {
    const field = analyzeSunriseField([], 'empty-dir')
    expect(field.directory).toBe('empty-dir')
    expect(field.shards).toEqual([])
    expect(field.avgPlay).toBe(0)
    expect(field.fieldType).toBe('no-field')
    expect(field.condition).toBe('void')
  })

  it('analyzes single rich shard field', () => {
    const shard = analyzeOpalShard(richContent, 'src/rich.ts')
    const field = analyzeSunriseField([shard], 'src')
    expect(field.avgPlay).toBe(100)
    expect(field.avgClarity).toBe(100)
    expect(field.blackOpalCount).toBe(1)
    expect(field.potchCount).toBe(0)
    expect(field.fieldType).toBe('lightning-ridge')
    expect(field.condition).toBe('magnificent-sunrise')
  })

  it('counts potch files correctly', () => {
    const shard = analyzeOpalShard(minimalContent, 'bad.ts')
    const field = analyzeSunriseField([shard], 'bad-dir')
    expect(field.potchCount).toBe(1)
    expect(field.blackOpalCount).toBe(0)
  })

  it('computes averages across multiple shards', () => {
    const s1 = analyzeOpalShard(richContent, 'a.ts')
    const s2 = analyzeOpalShard(minimalContent, 'b.ts')
    const field = analyzeSunriseField([s1, s2], 'mixed')
    expect(field.avgPlay).toBe(Math.round((100 + 6) / 2))
    expect(field.shards.length).toBe(2)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message when all scores are high', () => {
    const shard = analyzeOpalShard(richContent, 'perfect.ts')
    const shards = [shard]
    const field = analyzeSunriseField(shards, 'src')
    const sunrise = { avgPlay: 100, avgClarity: 100, avgOpalescence: 100, isLuminous: true, overallBrilliance: 100 }
    const stats = {
      avgPlayOfColor: 100, avgDawnClarity: 100, avgFireWarmth: 100,
      avgSpectrumRichness: 99, avgOpalescenceQuality: 100,
      potchCount: 0, totalFiles: 1, totalFields: 1,
      blackOpalCount: 1, preciousOpalCount: 0, commonOpalCount: 0,
      fireOpalCount: 0, woodOpalCount: 0,
      hasHighPlayCount: 1, hasHighClarityCount: 1, hasHighWarmthCount: 1,
      hasHighRichnessCount: 1, hasHighOpalescenceCount: 1,
      overallBrilliance: 100, lapidaryGrade: 'master-lapidary' as const,
      bestShard: 'perfect.ts', mostColorful: 'perfect.ts', clearest: 'perfect.ts',
      warmest: 'perfect.ts', mostLuminous: 'perfect.ts',
    }
    const recs = generateRecommendations(shards, [field], sunrise, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('kaleidoscopic perfection')
  })

  it('recommends improvements for low scores', () => {
    const shard = analyzeOpalShard(minimalContent, 'a.ts')
    const field = analyzeSunriseField([shard], 'src')
    const sunrise = { avgPlay: 6, avgClarity: 6, avgOpalescence: 6, isLuminous: false, overallBrilliance: 6 }
    const stats = {
      avgPlayOfColor: 6, avgDawnClarity: 6, avgFireWarmth: 6,
      avgSpectrumRichness: 6, avgOpalescenceQuality: 6,
      potchCount: 1, totalFiles: 1, totalFields: 1,
      blackOpalCount: 0, preciousOpalCount: 0, commonOpalCount: 0,
      fireOpalCount: 0, woodOpalCount: 0,
      hasHighPlayCount: 0, hasHighClarityCount: 0, hasHighWarmthCount: 0,
      hasHighRichnessCount: 0, hasHighOpalescenceCount: 0,
      overallBrilliance: 6, lapidaryGrade: 'rock-tumbler' as const,
      bestShard: 'a.ts', mostColorful: 'a.ts', clearest: 'a.ts',
      warmest: 'a.ts', mostLuminous: 'a.ts',
    }
    const recs = generateRecommendations([shard], [field], sunrise, stats)
    expect(recs.some(r => r.includes('play of color'))).toBe(true)
    expect(recs.some(r => r.includes('dawn clarity'))).toBe(true)
    expect(recs.some(r => r.includes('potch'))).toBe(true)
    expect(recs.some(r => r.includes('Overall brilliance'))).toBe(true)
  })
})

// ─── buildOpalSunriseResult ───────────────────────────────────────

describe('buildOpalSunriseResult', () => {
  it('handles empty file list', async () => {
    const result = await buildOpalSunriseResult([], [])
    expect(result.shards).toEqual([])
    expect(result.fields).toEqual([])
    expect(result.sunrise.overallBrilliance).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes single rich file correctly', async () => {
    const result = await buildOpalSunriseResult(['rich.ts'], [richContent])
    expect(result.shards).toHaveLength(1)
    expect(result.shards[0].qualityScore).toBe(100)
    expect(result.sunrise.avgPlay).toBe(100)
    expect(result.sunrise.avgClarity).toBe(100)
    expect(result.sunrise.overallBrilliance).toBe(100)
    expect(result.sunrise.isLuminous).toBe(true)
    expect(result.stats.lapidaryGrade).toBe('master-lapidary')
    expect(result.stats.blackOpalCount).toBe(1)
  })

  it('computes stats correctly for mixed files', async () => {
    const result = await buildOpalSunriseResult(
      ['rich.ts', 'minimal.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.potchCount).toBe(1)
    expect(result.stats.blackOpalCount).toBe(1)
    expect(result.stats.bestShard).toBe('rich.ts')
    expect(result.stats.mostColorful).toBe('rich.ts')
  })

  it('computes recommendations', async () => {
    const result = await buildOpalSunriseResult(['minimal.ts'], [minimalContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('colors high scores', () => {
    expect(colorScore(90)).toBeTruthy()
    expect(colorScore(80)).toBeTruthy()
  })
  it('colors low scores', () => {
    expect(colorScore(20)).toBeTruthy()
    expect(colorScore(10)).toBeTruthy()
  })
})

describe('colorGrade', () => {
  it('colors best grades', () => {
    expect(colorGrade('black-opal')).toBeTruthy()
    expect(colorGrade('master-lapidary')).toBeTruthy()
  })
  it('colors worst grades', () => {
    expect(colorGrade('potch')).toBeTruthy()
    expect(colorGrade('rock-tumbler')).toBeTruthy()
  })
  it('colors unknown grades', () => {
    expect(colorGrade('unknown-tier')).toBeTruthy()
  })
})

describe('formatShardTable', () => {
  it('formats a single shard', () => {
    const shard = analyzeOpalShard(richContent, 'test.ts')
    const result = formatShardTable(shard)
    expect(result).toContain('test.ts')
    expect(result).toContain('Play of Color')
    expect(result).toContain('Score')
  })
})

describe('formatShardsTable', () => {
  it('returns message for empty shards', () => {
    expect(formatShardsTable([])).toContain('No opal shards found')
  })
  it('formats multiple shards', () => {
    const s1 = analyzeOpalShard(richContent, 'a.ts')
    const s2 = analyzeOpalShard(minimalContent, 'b.ts')
    const result = formatShardsTable([s1, s2])
    expect(result).toContain('Opal Shard Analysis')
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatFieldTable', () => {
  it('formats a single field', () => {
    const shard = analyzeOpalShard(richContent, 'test.ts')
    const field = analyzeSunriseField([shard], 'src')
    const result = formatFieldTable(field)
    expect(result).toContain('src')
    expect(result).toContain('Black Opals')
  })
})

describe('formatFieldsTable', () => {
  it('returns message for empty fields', () => {
    expect(formatFieldsTable([])).toContain('No sunrise fields found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildOpalSunriseResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Opal Sunrise Statistics')
    expect(formatted).toContain('Lapidary Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const result = formatRecommendations(['Test rec 1', 'Test rec 2'])
    expect(result).toContain('Recommendations')
    expect(result).toContain('Test rec 1')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildOpalSunriseResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Opal Shard Analysis')
    expect(formatted).toContain('Sunrise Fields')
    expect(formatted).toContain('Opal Sunrise Statistics')
    expect(formatted).toContain('Sunrise')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats as valid JSON', async () => {
    const result = await buildOpalSunriseResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.shards).toHaveLength(1)
    expect(parsed.stats.lapidaryGrade).toBe('master-lapidary')
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with var, any, eval, debugger', () => {
    const badContent = 'var x: any = eval("1"); debugger;'
    const shard = analyzeOpalShard(badContent, 'bad.ts')
    expect(shard.diffracting.monotoneCount).toBeGreaterThan(0)
    expect(shard.diffracting.drabCount).toBeGreaterThan(0)
    expect(shard.illuminating.crypticCount).toBeGreaterThan(0)
    expect(shard.glowing.clunkyCount).toBeGreaterThan(0)
    expect(shard.glowing.hackedCount).toBeGreaterThan(0)
  })

  it('all scores capped at 100', () => {
    const shard = analyzeOpalShard(richContent, 'rich.ts')
    expect(shard.playOfColor).toBeLessThanOrEqual(100)
    expect(shard.dawnClarity).toBeLessThanOrEqual(100)
    expect(shard.fireWarmth).toBeLessThanOrEqual(100)
    expect(shard.spectrumRichness).toBeLessThanOrEqual(100)
    expect(shard.opalescenceQuality).toBeLessThanOrEqual(100)
  })

  it('qualityScore weights sum to 1.0', () => {
    const shard = analyzeOpalShard(richContent, 'test.ts')
    const expected = Math.round(
      shard.playOfColor * 0.2 +
      shard.dawnClarity * 0.2 +
      shard.fireWarmth * 0.2 +
      shard.spectrumRichness * 0.2 +
      shard.opalescenceQuality * 0.2,
    )
    expect(shard.qualityScore).toBe(expected)
  })

  it('overallBrilliance is average of three key measures', async () => {
    const result = await buildOpalSunriseResult(['a.ts'], [richContent])
    const expected = Math.round(
      (result.sunrise.avgPlay + result.sunrise.avgClarity + result.sunrise.avgOpalescence) / 3,
    )
    expect(result.sunrise.overallBrilliance).toBe(expected)
  })

  it('isLuminous is based on avgPlay >= 60', async () => {
    const rich = await buildOpalSunriseResult(['a.ts'], [richContent])
    expect(rich.sunrise.isLuminous).toBe(true)
    const minimal = await buildOpalSunriseResult(['a.ts'], [minimalContent])
    expect(minimal.sunrise.isLuminous).toBe(false)
  })
})
