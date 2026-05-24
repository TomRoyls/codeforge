import { describe, expect, it } from 'vitest'
import {
  analyzeEmeraldWave,
  analyzeEmeraldOcean,
  buildEmeraldTideResult,
  classifyWaveCondition,
  classifyOceanType,
  classifyOceanCondition,
  classifyNavigatorGrade,
  generateRecommendations,
  measureDiving,
  measurePulsing,
  measureGrowing,
  measureCleansing,
  measureKnowing,
} from '../src/commands/emerald-tide-helpers.js'
import {
  colorGrade,
  colorScore,
  formatWaveTable,
  formatWavesTable,
  formatOceanTable,
  formatOceansTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/emerald-tide-format-helpers.js'

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

// ─── measureDiving ─────────────────────────────────────────────────

describe('measureDiving', () => {
  it('returns depth score for minimal content', () => {
    const m = measureDiving(minimalContent)
    expect(m.depth).toBe(6)
    expect(m.grade).toBe('no-depth')
  })

  it('returns depth score for moderate content', () => {
    const m = measureDiving(moderateContent)
    expect(m.depth).toBe(47)
    expect(m.grade).toBe('shallow-water')
  })

  it('returns depth score for rich content', () => {
    const m = measureDiving(richContent)
    expect(m.depth).toBe(100)
    expect(m.grade).toBe('abyssal-emerald')
  })

  it('detects combos in rich content', () => {
    const m = measureDiving(richContent)
    expect(m.hasProfound).toBe(true)
    expect(m.hasValuable).toBe(true)
    expect(m.hasEssential).toBe(true)
    expect(m.hasMeaningful).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasSubstantive).toBe(true)
  })

  it('minimal content has no combos', () => {
    const m = measureDiving(minimalContent)
    expect(m.hasProfound).toBe(false)
    expect(m.hasValuable).toBe(false)
    expect(m.hasEssential).toBe(false)
  })

  it('detects hasHighDepth', () => {
    expect(measureDiving(richContent).hasHighDepth).toBe(true)
    expect(measureDiving(minimalContent).hasHighDepth).toBe(false)
  })

  it('counts trivial and boilerplate patterns', () => {
    const m = measureDiving('var x: any = 1')
    expect(m.trivialCount).toBe(1)
    expect(m.boilerplateCount).toBe(1)
    expect(m.hasNoTrivial).toBe(false)
    expect(m.hasNoFiller).toBe(false)
  })

  it('hasNoBoilerplate when no eval present', () => {
    expect(measureDiving('const x = 1').hasNoBoilerplate).toBe(true)
  })
})

// ─── measurePulsing ────────────────────────────────────────────────

describe('measurePulsing', () => {
  it('returns rhythm score for minimal content', () => {
    const m = measurePulsing(minimalContent)
    expect(m.rhythm).toBe(8)
    expect(m.tide).toBe('no-rhythm')
  })

  it('returns rhythm score for moderate content', () => {
    const m = measurePulsing(moderateContent)
    expect(m.rhythm).toBe(35)
    expect(m.tide).toBe('arrhythmia')
  })

  it('returns rhythm score for rich content', () => {
    const m = measurePulsing(richContent)
    expect(m.rhythm).toBe(100)
    expect(m.tide).toBe('moon-driven')
  })

  it('detects combos in rich content', () => {
    const m = measurePulsing(richContent)
    expect(m.hasReliable).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasPredictable).toBe(true)
    expect(m.hasSmooth).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasStable).toBe(true)
  })

  it('detects hasHighRhythm', () => {
    expect(measurePulsing(richContent).hasHighRhythm).toBe(true)
    expect(measurePulsing(minimalContent).hasHighRhythm).toBe(false)
  })

  it('counts erratic and wasteful patterns', () => {
    const m = measurePulsing('var x: any = 1')
    expect(m.erraticCount).toBe(1)
    expect(m.wastefulCount).toBe(1)
  })

  it('hasNoJerky when no debugger present', () => {
    expect(measurePulsing('const x = 1').hasNoJerky).toBe(true)
  })
})

// ─── measureGrowing ────────────────────────────────────────────────

describe('measureGrowing', () => {
  it('returns vitality score for minimal content', () => {
    const m = measureGrowing(minimalContent)
    expect(m.vitality).toBe(8)
    expect(m.growth).toBe('no-life')
  })

  it('returns vitality score for moderate content', () => {
    const m = measureGrowing(moderateContent)
    expect(m.vitality).toBe(47)
    expect(m.growth).toBe('wilting-plant')
  })

  it('returns vitality score for rich content', () => {
    const m = measureGrowing(richContent)
    expect(m.vitality).toBe(100)
    expect(m.growth).toBe('lush-garden')
  })

  it('detects combos in rich content', () => {
    const m = measureGrowing(richContent)
    expect(m.hasAlive).toBe(true)
    expect(m.hasMaintained).toBe(true)
    expect(m.hasEvolving).toBe(true)
    expect(m.hasGrowing).toBe(true)
    expect(m.hasFresh).toBe(true)
    expect(m.hasVibrant).toBe(true)
  })

  it('detects hasHighVitality', () => {
    expect(measureGrowing(richContent).hasHighVitality).toBe(true)
    expect(measureGrowing(minimalContent).hasHighVitality).toBe(false)
  })

  it('counts abandoned and stagnant patterns', () => {
    const m = measureGrowing('var x: any = eval("1")')
    expect(m.abandonedCount).toBe(1)
    expect(m.stagnantCount).toBe(1)
  })

  it('hasNoStale when no debugger present', () => {
    expect(measureGrowing('const x = 1').hasNoStale).toBe(true)
  })
})

// ─── measureCleansing ──────────────────────────────────────────────

describe('measureCleansing', () => {
  it('returns purity score for minimal content', () => {
    const m = measureCleansing(minimalContent)
    expect(m.purity).toBe(6)
    expect(m.cleanliness).toBe('no-purity')
  })

  it('returns purity score for moderate content', () => {
    const m = measureCleansing(moderateContent)
    expect(m.purity).toBe(39)
    expect(m.cleanliness).toBe('polluted-water')
  })

  it('returns purity score for rich content', () => {
    const m = measureCleansing(richContent)
    expect(m.purity).toBe(100)
    expect(m.cleanliness).toBe('crystal-clear')
  })

  it('detects combos in rich content', () => {
    const m = measureCleansing(richContent)
    expect(m.hasClean).toBe(true)
    expect(m.hasTidy).toBe(true)
    expect(m.hasFresh).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasPristine).toBe(true)
  })

  it('detects hasHighPurity', () => {
    expect(measureCleansing(richContent).hasHighPurity).toBe(true)
    expect(measureCleansing(minimalContent).hasHighPurity).toBe(false)
  })

  it('counts deadCode and hacky patterns', () => {
    const m = measureCleansing('var x = eval("1")')
    expect(m.deadCodeCount).toBe(1)
    expect(m.hackyCount).toBe(1)
  })

  it('hasNoRough when no TODO present', () => {
    expect(measureCleansing('const x = 1').hasNoRough).toBe(true)
  })

  it('hasNoRough false when TODO present', () => {
    expect(measureCleansing('const x = 1 // TODO fix').hasNoRough).toBe(false)
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns wisdom score for minimal content', () => {
    const m = measureKnowing(minimalContent)
    expect(m.wisdom).toBe(6)
    expect(m.sage).toBe('no-wisdom')
  })

  it('returns wisdom score for moderate content', () => {
    const m = measureKnowing(moderateContent)
    expect(m.wisdom).toBe(39)
    expect(m.sage).toBe('lost-swimmer')
  })

  it('returns wisdom score for rich content', () => {
    const m = measureKnowing(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.sage).toBe('ancient-mariner')
  })

  it('detects combos in rich content', () => {
    const m = measureKnowing(richContent)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasEstablished).toBe(true)
    expect(m.hasBattleTested).toBe(true)
  })

  it('detects hasHighWisdom', () => {
    expect(measureKnowing(richContent).hasHighWisdom).toBe(true)
    expect(measureKnowing(minimalContent).hasHighWisdom).toBe(false)
  })

  it('counts reinvented and adHoc patterns', () => {
    const m = measureKnowing('var x: any = 1')
    expect(m.reinventedCount).toBe(1)
    expect(m.adHocCount).toBe(1)
  })

  it('hasNoExperimental when no eval present', () => {
    expect(measureKnowing('const x = 1').hasNoExperimental).toBe(true)
  })
})

// ─── classifyWaveCondition ────────────────────────────────────────

describe('classifyWaveCondition', () => {
  it('classifies emerald-masterpiece at 85+', () => {
    expect(classifyWaveCondition(90)).toBe('emerald-masterpiece')
  })
  it('classifies jade-wave at 70-84', () => {
    expect(classifyWaveCondition(75)).toBe('jade-wave')
  })
  it('classifies green-tide at 55-69', () => {
    expect(classifyWaveCondition(60)).toBe('green-tide')
  })
  it('classifies murky-current at 40-54', () => {
    expect(classifyWaveCondition(45)).toBe('murky-current')
  })
  it('classifies stagnant-pool at 25-39', () => {
    expect(classifyWaveCondition(30)).toBe('stagnant-pool')
  })
  it('classifies dry-bed below 25', () => {
    expect(classifyWaveCondition(20)).toBe('dry-bed')
  })
})

// ─── classifyOceanType ────────────────────────────────────────────

describe('classifyOceanType', () => {
  it('returns no-ocean for empty waves', () => {
    expect(classifyOceanType([])).toBe('no-ocean')
  })
  it('returns emerald-sea for high qs with many masterpieces', () => {
    const waves = Array.from({ length: 4 }, () => ({ qualityScore: 90, condition: 'emerald-masterpiece' } as any))
    expect(classifyOceanType(waves)).toBe('emerald-sea')
  })
  it('returns jade-ocean for avgQs >= 60', () => {
    expect(classifyOceanType([{ qualityScore: 65, condition: 'jade-wave' }] as any[])).toBe('jade-ocean')
  })
  it('returns proper-gulf for avgQs >= 45', () => {
    expect(classifyOceanType([{ qualityScore: 50, condition: 'green-tide' }] as any[])).toBe('proper-gulf')
  })
  it('returns small-bay for avgQs >= 30', () => {
    expect(classifyOceanType([{ qualityScore: 35, condition: 'murky-current' }] as any[])).toBe('small-bay')
  })
  it('returns pond for avgQs >= 15', () => {
    expect(classifyOceanType([{ qualityScore: 20, condition: 'stagnant-pool' }] as any[])).toBe('pond')
  })
  it('returns no-ocean for very low avgQs', () => {
    expect(classifyOceanType([{ qualityScore: 5, condition: 'dry-bed' }] as any[])).toBe('no-ocean')
  })
})

// ─── classifyOceanCondition ───────────────────────────────────────

describe('classifyOceanCondition', () => {
  it('classifies magnificent-ocean at 75+', () => { expect(classifyOceanCondition(80)).toBe('magnificent-ocean') })
  it('classifies beautiful-sea at 60-74', () => { expect(classifyOceanCondition(65)).toBe('beautiful-sea') })
  it('classifies decent-bay at 45-59', () => { expect(classifyOceanCondition(50)).toBe('decent-bay') })
  it('classifies murky-waters at 30-44', () => { expect(classifyOceanCondition(35)).toBe('murky-waters') })
  it('classifies dried-up at 15-29', () => { expect(classifyOceanCondition(20)).toBe('dried-up') })
  it('classifies void below 15', () => { expect(classifyOceanCondition(10)).toBe('void') })
})

// ─── classifyNavigatorGrade ───────────────────────────────────────

describe('classifyNavigatorGrade', () => {
  it('classifies master-navigator at 80+', () => { expect(classifyNavigatorGrade(85)).toBe('master-navigator') })
  it('classifies sea-captain at 65-79', () => { expect(classifyNavigatorGrade(70)).toBe('sea-captain') })
  it('classifies skilled-sailor at 50-64', () => { expect(classifyNavigatorGrade(55)).toBe('skilled-sailor') })
  it('classifies apprentice at 35-49', () => { expect(classifyNavigatorGrade(40)).toBe('apprentice') })
  it('classifies novice at 20-34', () => { expect(classifyNavigatorGrade(25)).toBe('novice') })
  it('classifies landlubber below 20', () => { expect(classifyNavigatorGrade(10)).toBe('landlubber') })
})

// ─── analyzeEmeraldWave ────────────────────────────────────────────

describe('analyzeEmeraldWave', () => {
  it('analyzes minimal content correctly', () => {
    const wave = analyzeEmeraldWave(minimalContent, 'minimal.ts')
    expect(wave.file).toBe('minimal.ts')
    expect(wave.gemDepth).toBe(6)
    expect(wave.tidalRhythm).toBe(8)
    expect(wave.greenVitality).toBe(8)
    expect(wave.wavePurity).toBe(6)
    expect(wave.oceanWisdom).toBe(6)
    expect(wave.qualityScore).toBe(7)
    expect(wave.condition).toBe('dry-bed')
  })

  it('analyzes moderate content correctly', () => {
    const wave = analyzeEmeraldWave(moderateContent, 'moderate.ts')
    expect(wave.gemDepth).toBe(47)
    expect(wave.tidalRhythm).toBe(35)
    expect(wave.greenVitality).toBe(47)
    expect(wave.wavePurity).toBe(39)
    expect(wave.oceanWisdom).toBe(39)
    expect(wave.qualityScore).toBe(41)
    expect(wave.condition).toBe('murky-current')
  })

  it('analyzes rich content correctly', () => {
    const wave = analyzeEmeraldWave(richContent, 'rich.ts')
    expect(wave.gemDepth).toBe(100)
    expect(wave.tidalRhythm).toBe(100)
    expect(wave.greenVitality).toBe(100)
    expect(wave.wavePurity).toBe(100)
    expect(wave.oceanWisdom).toBe(100)
    expect(wave.qualityScore).toBe(100)
    expect(wave.condition).toBe('emerald-masterpiece')
  })

  it('populates all measure sub-objects', () => {
    const wave = analyzeEmeraldWave(richContent, 'rich.ts')
    expect(wave.diving.grade).toBe('abyssal-emerald')
    expect(wave.pulsing.tide).toBe('moon-driven')
    expect(wave.growing.growth).toBe('lush-garden')
    expect(wave.cleansing.cleanliness).toBe('crystal-clear')
    expect(wave.knowing.sage).toBe('ancient-mariner')
  })
})

// ─── analyzeEmeraldOcean ──────────────────────────────────────────

describe('analyzeEmeraldOcean', () => {
  it('returns empty ocean for no waves', () => {
    const ocean = analyzeEmeraldOcean([], 'empty-dir')
    expect(ocean.directory).toBe('empty-dir')
    expect(ocean.oceanType).toBe('no-ocean')
    expect(ocean.condition).toBe('void')
  })

  it('analyzes single rich wave ocean', () => {
    const wave = analyzeEmeraldWave(richContent, 'src/rich.ts')
    const ocean = analyzeEmeraldOcean([wave], 'src')
    expect(ocean.avgDepth).toBe(100)
    expect(ocean.emeraldMasterpieceCount).toBe(1)
    expect(ocean.dryBedCount).toBe(0)
    expect(ocean.oceanType).toBe('emerald-sea')
    expect(ocean.condition).toBe('magnificent-ocean')
  })

  it('counts dry beds correctly', () => {
    const wave = analyzeEmeraldWave(minimalContent, 'bad.ts')
    const ocean = analyzeEmeraldOcean([wave], 'bad-dir')
    expect(ocean.dryBedCount).toBe(1)
  })

  it('computes averages across multiple waves', () => {
    const w1 = analyzeEmeraldWave(richContent, 'a.ts')
    const w2 = analyzeEmeraldWave(minimalContent, 'b.ts')
    const ocean = analyzeEmeraldOcean([w1, w2], 'mixed')
    expect(ocean.avgDepth).toBe(Math.round((100 + 6) / 2))
    expect(ocean.waves.length).toBe(2)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message when all scores are high', () => {
    const wave = analyzeEmeraldWave(richContent, 'perfect.ts')
    const ocean = analyzeEmeraldOcean([wave], 'src')
    const sea = { avgDepth: 100, avgRhythm: 100, avgWisdom: 100, isEmerald: true, overallVitality: 100 }
    const stats = {
      avgGemDepth: 100, avgTidalRhythm: 100, avgGreenVitality: 100,
      avgWavePurity: 100, avgOceanWisdom: 100,
      dryBedCount: 0, totalFiles: 1, totalOceans: 1,
      emeraldMasterpieceCount: 1, jadeWaveCount: 0, greenTideCount: 0,
      murkyCurrentCount: 0, stagnantPoolCount: 0,
      hasHighDepthCount: 1, hasHighRhythmCount: 1, hasHighVitalityCount: 1,
      hasHighPurityCount: 1, hasHighWisdomCount: 1,
      overallVitality: 100, navigatorGrade: 'master-navigator' as const,
      bestWave: 'perfect.ts', deepest: 'perfect.ts', bestRhythm: 'perfect.ts',
      mostVital: 'perfect.ts', wisest: 'perfect.ts',
    }
    const recs = generateRecommendations([wave], [ocean], sea, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('magnificent power')
  })

  it('recommends improvements for low scores', () => {
    const wave = analyzeEmeraldWave(minimalContent, 'a.ts')
    const ocean = analyzeEmeraldOcean([wave], 'src')
    const sea = { avgDepth: 6, avgRhythm: 8, avgWisdom: 6, isEmerald: false, overallVitality: 7 }
    const stats = {
      avgGemDepth: 6, avgTidalRhythm: 8, avgGreenVitality: 8,
      avgWavePurity: 6, avgOceanWisdom: 6,
      dryBedCount: 1, totalFiles: 1, totalOceans: 1,
      emeraldMasterpieceCount: 0, jadeWaveCount: 0, greenTideCount: 0,
      murkyCurrentCount: 0, stagnantPoolCount: 0,
      hasHighDepthCount: 0, hasHighRhythmCount: 0, hasHighVitalityCount: 0,
      hasHighPurityCount: 0, hasHighWisdomCount: 0,
      overallVitality: 7, navigatorGrade: 'landlubber' as const,
      bestWave: 'a.ts', deepest: 'a.ts', bestRhythm: 'a.ts',
      mostVital: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([wave], [ocean], sea, stats)
    expect(recs.some(r => r.includes('gem depth'))).toBe(true)
    expect(recs.some(r => r.includes('dry beds'))).toBe(true)
  })
})

// ─── buildEmeraldTideResult ────────────────────────────────────────

describe('buildEmeraldTideResult', () => {
  it('handles empty file list', async () => {
    const result = await buildEmeraldTideResult([], [])
    expect(result.waves).toEqual([])
    expect(result.sea.overallVitality).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes single rich file correctly', async () => {
    const result = await buildEmeraldTideResult(['rich.ts'], [richContent])
    expect(result.waves).toHaveLength(1)
    expect(result.waves[0].qualityScore).toBe(100)
    expect(result.sea.avgDepth).toBe(100)
    expect(result.sea.overallVitality).toBe(100)
    expect(result.sea.isEmerald).toBe(true)
    expect(result.stats.navigatorGrade).toBe('master-navigator')
    expect(result.stats.emeraldMasterpieceCount).toBe(1)
  })

  it('computes stats correctly for mixed files', async () => {
    const result = await buildEmeraldTideResult(
      ['rich.ts', 'minimal.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.dryBedCount).toBe(1)
    expect(result.stats.emeraldMasterpieceCount).toBe(1)
    expect(result.stats.bestWave).toBe('rich.ts')
  })

  it('computes recommendations', async () => {
    const result = await buildEmeraldTideResult(['minimal.ts'], [minimalContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('colors high and low scores', () => {
    expect(colorScore(90)).toBeTruthy()
    expect(colorScore(10)).toBeTruthy()
  })
})

describe('colorGrade', () => {
  it('colors best and worst grades', () => {
    expect(colorGrade('emerald-masterpiece')).toBeTruthy()
    expect(colorGrade('dry-bed')).toBeTruthy()
    expect(colorGrade('unknown')).toBeTruthy()
  })
})

describe('formatWaveTable', () => {
  it('formats a single wave', () => {
    const wave = analyzeEmeraldWave(richContent, 'test.ts')
    const result = formatWaveTable(wave)
    expect(result).toContain('test.ts')
    expect(result).toContain('Gem Depth')
  })
})

describe('formatWavesTable', () => {
  it('returns message for empty waves', () => {
    expect(formatWavesTable([])).toContain('No emerald waves found')
  })
})

describe('formatOceanTable', () => {
  it('formats a single ocean', () => {
    const wave = analyzeEmeraldWave(richContent, 'test.ts')
    const ocean = analyzeEmeraldOcean([wave], 'src')
    const result = formatOceanTable(ocean)
    expect(result).toContain('src')
    expect(result).toContain('Emerald Masterpieces')
  })
})

describe('formatOceansTable', () => {
  it('returns message for empty oceans', () => {
    expect(formatOceansTable([])).toContain('No emerald oceans found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildEmeraldTideResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Emerald Tide Statistics')
    expect(formatted).toContain('Navigator Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty recs', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const result = formatRecommendations(['Test rec 1'])
    expect(result).toContain('Recommendations')
    expect(result).toContain('Test rec 1')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildEmeraldTideResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Emerald Wave Analysis')
    expect(formatted).toContain('Emerald Oceans')
    expect(formatted).toContain('Sea')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats as valid JSON', async () => {
    const result = await buildEmeraldTideResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.waves).toHaveLength(1)
    expect(parsed.stats.navigatorGrade).toBe('master-navigator')
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles bad content patterns', () => {
    const badContent = 'var x: any = eval("1"); debugger;'
    const wave = analyzeEmeraldWave(badContent, 'bad.ts')
    expect(wave.diving.trivialCount).toBeGreaterThan(0)
    expect(wave.diving.boilerplateCount).toBeGreaterThan(0)
    expect(wave.pulsing.erraticCount).toBeGreaterThan(0)
    expect(wave.pulsing.wastefulCount).toBeGreaterThan(0)
  })

  it('all scores capped at 100', () => {
    const wave = analyzeEmeraldWave(richContent, 'rich.ts')
    expect(wave.gemDepth).toBeLessThanOrEqual(100)
    expect(wave.tidalRhythm).toBeLessThanOrEqual(100)
    expect(wave.greenVitality).toBeLessThanOrEqual(100)
    expect(wave.wavePurity).toBeLessThanOrEqual(100)
    expect(wave.oceanWisdom).toBeLessThanOrEqual(100)
  })

  it('qualityScore weights sum to 1.0', () => {
    const wave = analyzeEmeraldWave(moderateContent, 'test.ts')
    const expected = Math.round(
      wave.gemDepth * 0.2 +
      wave.tidalRhythm * 0.2 +
      wave.greenVitality * 0.2 +
      wave.wavePurity * 0.2 +
      wave.oceanWisdom * 0.2,
    )
    expect(wave.qualityScore).toBe(expected)
  })

  it('overallVitality is average of three key measures', async () => {
    const result = await buildEmeraldTideResult(['a.ts'], [richContent])
    const expected = Math.round(
      (result.sea.avgDepth + result.sea.avgRhythm + result.sea.avgWisdom) / 3,
    )
    expect(result.sea.overallVitality).toBe(expected)
  })

  it('isEmerald is based on avgDepth >= 60', async () => {
    const rich = await buildEmeraldTideResult(['a.ts'], [richContent])
    expect(rich.sea.isEmerald).toBe(true)
    const minimal = await buildEmeraldTideResult(['a.ts'], [minimalContent])
    expect(minimal.sea.isEmerald).toBe(false)
  })
})
