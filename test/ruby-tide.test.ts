import { describe, expect, it } from 'vitest'
import {
  analyzeRubyCurrent,
  analyzeTideBasin,
  buildRubyTideResult,
  classifyBasinCondition,
  classifyBasinType,
  classifyCaptainGrade,
  classifyCurrentCondition,
  generateRecommendations,
  measureFlowing,
  measurePulsing,
  measureRevealing,
  measureStriking,
  measureSurging,
} from '../src/commands/ruby-tide-helpers.js'
import {
  colorGrade,
  colorScore,
  formatBasinTable,
  formatBasinsTable,
  formatCurrentTable,
  formatCurrentsTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/ruby-tide-format-helpers.js'

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

// ─── measureSurging ───────────────────────────────────────────────

describe('measureSurging', () => {
  it('returns power score for minimal content', () => {
    const m = measureSurging(minimalContent)
    expect(m.power).toBe(8)
    expect(m.grade).toBe('no-current')
  })

  it('detects high power for rich content', () => {
    const m = measureSurging(richContent)
    expect(m.hasHighPower).toBe(true)
    expect(m.grade).toBe('tidal-bore')
  })

  it('detects no filler in clean content', () => {
    const m = measureSurging(richContent)
    expect(m.hasNoFiller).toBe(true)
    expect(m.fillerCount).toBe(0)
  })

  it('detects impactful and high value for rich content', () => {
    const m = measureSurging(richContent)
    expect(m.hasImpactful).toBe(true)
    expect(m.hasHighValue).toBe(true)
  })

  it('detects meaningful and powerful for rich content', () => {
    const m = measureSurging(richContent)
    expect(m.hasMeaningful).toBe(true)
    expect(m.hasPowerful).toBe(true)
    expect(m.hasStrong).toBe(true)
  })

  it('computes correct power for moderate content', () => {
    const m = measureSurging(moderateContent)
    expect(m.power).toBe(50)
    expect(m.grade).toBe('gentle-flow')
  })

  it('computes correct power for rich content', () => {
    expect(measureSurging(richContent).power).toBe(93)
  })
})

// ─── measurePulsing ───────────────────────────────────────────────

describe('measurePulsing', () => {
  it('returns rhythm score for minimal content', () => {
    const m = measurePulsing(minimalContent)
    expect(m.rhythm).toBe(6)
    expect(m.tide).toBe('no-rhythm')
  })

  it('detects high rhythm for rich content', () => {
    const m = measurePulsing(richContent)
    expect(m.hasHighRhythm).toBe(true)
    expect(m.tide).toBe('moon-driven')
  })

  it('detects no erratic in clean content', () => {
    const m = measurePulsing(richContent)
    expect(m.hasNoErratic).toBe(true)
    expect(m.erraticCount).toBe(0)
  })

  it('detects consistent and predictable for rich content', () => {
    const m = measurePulsing(richContent)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasPredictable).toBe(true)
  })

  it('detects smooth and reliable for rich content', () => {
    const m = measurePulsing(richContent)
    expect(m.hasSmooth).toBe(true)
    expect(m.hasReliable).toBe(true)
  })

  it('computes correct rhythm for moderate content', () => {
    const m = measurePulsing(moderateContent)
    expect(m.rhythm).toBe(54)
    expect(m.tide).toBe('irregular-beat')
  })

  it('computes correct rhythm for rich content', () => {
    expect(measurePulsing(richContent).rhythm).toBe(100)
  })
})

// ─── measureRevealing ─────────────────────────────────────────────

describe('measureRevealing', () => {
  it('returns surfacing score for minimal content', () => {
    const m = measureRevealing(minimalContent)
    expect(m.surfacing).toBe(6)
    expect(m.gem).toBe('no-gem')
  })

  it('detects high surfacing for rich content', () => {
    const m = measureRevealing(richContent)
    expect(m.hasHighSurfacing).toBe(true)
    expect(m.gem).toBe('ruby-revealed')
  })

  it('detects clear purpose and self documenting for rich content', () => {
    const m = measureRevealing(richContent)
    expect(m.hasClearPurpose).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('detects no cryptic in clean content', () => {
    const m = measureRevealing(richContent)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.crypticCount).toBe(0)
  })

  it('detects transparent and revealed for rich content', () => {
    const m = measureRevealing(richContent)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasRevealed).toBe(true)
    expect(m.hasExposed).toBe(true)
  })

  it('computes correct surfacing for moderate content', () => {
    const m = measureRevealing(moderateContent)
    expect(m.surfacing).toBe(47)
    expect(m.gem).toBe('hidden-value')
  })

  it('computes correct surfacing for rich content', () => {
    expect(measureRevealing(richContent).surfacing).toBe(100)
  })
})

// ─── measureStriking ──────────────────────────────────────────────

describe('measureStriking', () => {
  it('returns precision score for minimal content', () => {
    const m = measureStriking(minimalContent)
    expect(m.precision).toBe(6)
    expect(m.wave).toBe('no-precision')
  })

  it('detects high precision for rich content', () => {
    const m = measureStriking(richContent)
    expect(m.hasHighPrecision).toBe(true)
    expect(m.wave).toBe('surgical-wave')
  })

  it('detects exact and accurate for rich content', () => {
    const m = measureStriking(richContent)
    expect(m.hasExact).toBe(true)
    expect(m.hasAccurate).toBe(true)
  })

  it('detects no approximate in clean content', () => {
    const m = measureStriking(richContent)
    expect(m.hasNoApproximate).toBe(true)
    expect(m.approximateCount).toBe(0)
  })

  it('detects sharp and defined for rich content', () => {
    const m = measureStriking(richContent)
    expect(m.hasSharp).toBe(true)
    expect(m.hasDefined).toBe(true)
    expect(m.hasPrecise).toBe(true)
  })

  it('computes correct precision for moderate content', () => {
    const m = measureStriking(moderateContent)
    expect(m.precision).toBe(54)
    expect(m.wave).toBe('approximate-hit')
  })

  it('computes correct precision for rich content', () => {
    expect(measureStriking(richContent).precision).toBe(100)
  })
})

// ─── measureFlowing ───────────────────────────────────────────────

describe('measureFlowing', () => {
  it('returns current score for minimal content', () => {
    const m = measureFlowing(minimalContent)
    expect(m.current).toBe(6)
    expect(m.deep).toBe('no-flow')
  })

  it('detects high current for rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.hasHighCurrent).toBe(true)
    expect(m.deep).toBe('gulf-stream')
  })

  it('detects efficient flow and streamlined for rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.hasEfficientFlow).toBe(true)
    expect(m.hasStreamlined).toBe(true)
  })

  it('detects no bottlenecks in clean content', () => {
    const m = measureFlowing(richContent)
    expect(m.hasNoBottlenecks).toBe(true)
    expect(m.bottleneckCount).toBe(0)
  })

  it('detects clean pipelines and direct paths for rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.hasCleanPipelines).toBe(true)
    expect(m.hasDirectPaths).toBe(true)
  })

  it('computes correct current for moderate content', () => {
    const m = measureFlowing(moderateContent)
    expect(m.current).toBe(47)
    expect(m.deep).toBe('weak-flow')
  })

  it('computes correct current for rich content', () => {
    expect(measureFlowing(richContent).current).toBe(100)
  })
})

// ─── classifyCurrentCondition ─────────────────────────────────────

describe('classifyCurrentCondition', () => {
  it('returns ruby-masterpiece for high score', () => {
    expect(classifyCurrentCondition(90)).toBe('ruby-masterpiece')
  })

  it('returns crimson-wave for good score', () => {
    expect(classifyCurrentCondition(75)).toBe('crimson-wave')
  })

  it('returns proper-tide for moderate score', () => {
    expect(classifyCurrentCondition(60)).toBe('proper-tide')
  })

  it('returns murky-current for low score', () => {
    expect(classifyCurrentCondition(45)).toBe('murky-current')
  })

  it('returns stagnant-pool for poor score', () => {
    expect(classifyCurrentCondition(30)).toBe('stagnant-pool')
  })

  it('returns dry-bed for very low score', () => {
    expect(classifyCurrentCondition(10)).toBe('dry-bed')
  })
})

// ─── classifyBasinType ────────────────────────────────────────────

describe('classifyBasinType', () => {
  it('returns no-basin for empty array', () => {
    expect(classifyBasinType([])).toBe('no-basin')
  })

  it('returns ruby-bay for all masterpieces with high avg', () => {
    const currents = [analyzeRubyCurrent(richContent, 'a.ts'), analyzeRubyCurrent(richContent, 'b.ts')]
    expect(classifyBasinType(currents)).toBe('ruby-bay')
  })
})

// ─── classifyBasinCondition ───────────────────────────────────────

describe('classifyBasinCondition', () => {
  it('returns void for zero', () => {
    expect(classifyBasinCondition(0)).toBe('void')
  })

  it('returns magnificent-bay for high avg', () => {
    expect(classifyBasinCondition(80)).toBe('magnificent-bay')
  })

  it('returns crimson-shore for good avg', () => {
    expect(classifyBasinCondition(65)).toBe('crimson-shore')
  })
})

// ─── classifyCaptainGrade ─────────────────────────────────────────

describe('classifyCaptainGrade', () => {
  it('returns tide-captain for high surge', () => {
    expect(classifyCaptainGrade(90)).toBe('tide-captain')
  })

  it('returns landlubber for very low surge', () => {
    expect(classifyCaptainGrade(5)).toBe('landlubber')
  })

  it('returns sea-commander for good surge', () => {
    expect(classifyCaptainGrade(70)).toBe('sea-commander')
  })

  it('returns skilled-sailor for moderate surge', () => {
    expect(classifyCaptainGrade(55)).toBe('skilled-sailor')
  })
})

// ─── analyzeRubyCurrent ───────────────────────────────────────────

describe('analyzeRubyCurrent', () => {
  it('computes expected minimal content scores', () => {
    const c = analyzeRubyCurrent(minimalContent, 'minimal.ts')
    expect(c.crimsonPower).toBe(8)
    expect(c.tidalRhythm).toBe(6)
    expect(c.gemSurfacing).toBe(6)
    expect(c.wavePrecision).toBe(6)
    expect(c.deepCurrent).toBe(6)
    expect(c.qualityScore).toBe(6)
    expect(c.condition).toBe('dry-bed')
  })

  it('computes expected moderate content scores', () => {
    const c = analyzeRubyCurrent(moderateContent, 'moderate.ts')
    expect(c.crimsonPower).toBe(50)
    expect(c.tidalRhythm).toBe(54)
    expect(c.gemSurfacing).toBe(47)
    expect(c.wavePrecision).toBe(54)
    expect(c.deepCurrent).toBe(47)
    expect(c.qualityScore).toBe(50)
    expect(c.condition).toBe('murky-current')
  })

  it('computes expected rich content scores', () => {
    const c = analyzeRubyCurrent(richContent, 'rich.ts')
    expect(c.crimsonPower).toBe(93)
    expect(c.tidalRhythm).toBe(100)
    expect(c.gemSurfacing).toBe(100)
    expect(c.wavePrecision).toBe(100)
    expect(c.deepCurrent).toBe(100)
    expect(c.qualityScore).toBe(99)
    expect(c.condition).toBe('ruby-masterpiece')
  })

  it('stores file path', () => {
    const c = analyzeRubyCurrent(minimalContent, 'my-file.ts')
    expect(c.file).toBe('my-file.ts')
  })

  it('includes all measure objects', () => {
    const c = analyzeRubyCurrent(richContent, 'rich.ts')
    expect(c.surging).toBeDefined()
    expect(c.pulsing).toBeDefined()
    expect(c.revealing).toBeDefined()
    expect(c.striking).toBeDefined()
    expect(c.flowing).toBeDefined()
  })
})

// ─── analyzeTideBasin ─────────────────────────────────────────────

describe('analyzeTideBasin', () => {
  it('returns empty basin for no currents', () => {
    const b = analyzeTideBasin([], 'src')
    expect(b.currents).toHaveLength(0)
    expect(b.avgPower).toBe(0)
    expect(b.avgRhythm).toBe(0)
    expect(b.avgCurrent).toBe(0)
    expect(b.basinType).toBe('no-basin')
    expect(b.condition).toBe('void')
    expect(b.rubyMasterpieceCount).toBe(0)
    expect(b.dryBedCount).toBe(0)
  })

  it('returns correct directory', () => {
    const currents = [analyzeRubyCurrent(richContent, 'src/a.ts')]
    expect(analyzeTideBasin(currents, 'src').directory).toBe('src')
  })

  it('computes averages from currents', () => {
    const currents = [analyzeRubyCurrent(richContent, 'src/a.ts')]
    const b = analyzeTideBasin(currents, 'src')
    expect(b.avgPower).toBe(93)
    expect(b.avgRhythm).toBe(100)
    expect(b.avgCurrent).toBe(100)
  })

  it('counts ruby masterpiece files', () => {
    const currents = [analyzeRubyCurrent(richContent, 'src/a.ts')]
    expect(analyzeTideBasin(currents, 'src').rubyMasterpieceCount).toBe(1)
  })

  it('classifies rich content basin as ruby-bay', () => {
    const currents = [analyzeRubyCurrent(richContent, 'src/a.ts')]
    const b = analyzeTideBasin(currents, 'src')
    expect(b.basinType).toBe('ruby-bay')
    expect(b.condition).toBe('magnificent-bay')
  })

  it('averages across multiple currents', () => {
    const c1 = analyzeRubyCurrent(richContent, 'src/a.ts')
    const c2 = analyzeRubyCurrent(minimalContent, 'src/b.ts')
    const b = analyzeTideBasin([c1, c2], 'src')
    expect(b.avgPower).toBe(Math.round((93 + 8) / 2))
    expect(b.rubyMasterpieceCount).toBe(1)
    expect(b.dryBedCount).toBe(1)
  })
})

// ─── buildRubyTideResult ──────────────────────────────────────────

describe('buildRubyTideResult', () => {
  it('handles empty input', async () => {
    const result = await buildRubyTideResult([], [])
    expect(result.currents).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.captainGrade).toBe('landlubber')
  })

  it('processes single file', async () => {
    const result = await buildRubyTideResult(['test.ts'], [richContent])
    expect(result.currents).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('computes stats for rich content', async () => {
    const result = await buildRubyTideResult(['test.ts'], [richContent])
    expect(result.stats.avgCrimsonPower).toBe(93)
    expect(result.stats.avgTidalRhythm).toBe(100)
    expect(result.stats.avgGemSurfacing).toBe(100)
    expect(result.stats.avgWavePrecision).toBe(100)
    expect(result.stats.avgDeepCurrent).toBe(100)
    expect(result.stats.rubyMasterpieceCount).toBe(1)
  })

  it('computes sea for rich content', async () => {
    const result = await buildRubyTideResult(['test.ts'], [richContent])
    expect(result.sea.avgPower).toBe(93)
    expect(result.sea.avgRhythm).toBe(100)
    expect(result.sea.isCrimson).toBe(true)
    expect(result.sea.overallSurge).toBe(98)
  })

  it('identifies best current', async () => {
    const result = await buildRubyTideResult(['bad.ts', 'good.ts'], [minimalContent, richContent])
    expect(result.stats.bestCurrent).toBe('good.ts')
  })

  it('identifies most powerful', async () => {
    const result = await buildRubyTideResult(['low.ts', 'high.ts'], [minimalContent, richContent])
    expect(result.stats.mostPowerful).toBe('high.ts')
  })

  it('identifies best rhythm', async () => {
    const result = await buildRubyTideResult(['low.ts', 'high.ts'], [minimalContent, richContent])
    expect(result.stats.bestRhythm).toBe('high.ts')
  })

  it('identifies most revealing', async () => {
    const result = await buildRubyTideResult(['low.ts', 'high.ts'], [minimalContent, richContent])
    expect(result.stats.mostRevealing).toBe('high.ts')
  })

  it('identifies deepest', async () => {
    const result = await buildRubyTideResult(['low.ts', 'high.ts'], [minimalContent, richContent])
    expect(result.stats.deepest).toBe('high.ts')
  })

  it('groups files by directory', async () => {
    const result = await buildRubyTideResult(['src/a.ts', 'lib/b.ts'], [richContent, moderateContent])
    expect(result.basins.length).toBeGreaterThanOrEqual(2)
  })

  it('counts high measure flags', async () => {
    const result = await buildRubyTideResult(['test.ts'], [richContent])
    expect(result.stats.hasHighPowerCount).toBe(1)
    expect(result.stats.hasHighRhythmCount).toBe(1)
    expect(result.stats.hasHighSurfacingCount).toBe(1)
    expect(result.stats.hasHighPrecisionCount).toBe(1)
    expect(result.stats.hasHighCurrentCount).toBe(1)
  })

  it('classifies captain grade for rich content', async () => {
    const result = await buildRubyTideResult(['test.ts'], [richContent])
    expect(result.stats.captainGrade).toBe('tide-captain')
  })

  it('computes overall surge correctly', async () => {
    const result = await buildRubyTideResult(['test.ts'], [richContent])
    expect(result.stats.overallSurge).toBe(98)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message for healthy codebase', () => {
    const c = analyzeRubyCurrent(richContent, 'test.ts')
    const currents = [c]
    const basin = analyzeTideBasin(currents, 'src')
    const sea = { avgPower: 93, avgRhythm: 100, avgCurrent: 100, isCrimson: true, overallSurge: 98 }
    const stats = {
      totalFiles: 1, totalBasins: 1, avgCrimsonPower: 93, avgTidalRhythm: 100,
      avgGemSurfacing: 100, avgWavePrecision: 100, avgDeepCurrent: 100,
      rubyMasterpieceCount: 1, crimsonWaveCount: 0, properTideCount: 0,
      murkyCurrentCount: 0, stagnantPoolCount: 0, dryBedCount: 0,
      hasHighPowerCount: 1, hasHighRhythmCount: 1, hasHighSurfacingCount: 1,
      hasHighPrecisionCount: 1, hasHighCurrentCount: 1,
      overallSurge: 98, captainGrade: 'tide-captain' as const,
      bestCurrent: 'test.ts', mostPowerful: 'test.ts', bestRhythm: 'test.ts',
      mostRevealing: 'test.ts', deepest: 'test.ts',
    }
    const recs = generateRecommendations(currents, [basin], sea, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('suggests improving low power', () => {
    const c = analyzeRubyCurrent(minimalContent, 'bad.ts')
    const currents = [c]
    const basin = analyzeTideBasin(currents, 'src')
    const sea = { avgPower: 8, avgRhythm: 6, avgCurrent: 6, isCrimson: false, overallSurge: 7 }
    const stats = {
      totalFiles: 1, totalBasins: 1, avgCrimsonPower: 8, avgTidalRhythm: 6,
      avgGemSurfacing: 6, avgWavePrecision: 6, avgDeepCurrent: 6,
      rubyMasterpieceCount: 0, crimsonWaveCount: 0, properTideCount: 0,
      murkyCurrentCount: 0, stagnantPoolCount: 0, dryBedCount: 1,
      hasHighPowerCount: 0, hasHighRhythmCount: 0, hasHighSurfacingCount: 0,
      hasHighPrecisionCount: 0, hasHighCurrentCount: 0,
      overallSurge: 7, captainGrade: 'landlubber' as const,
      bestCurrent: 'bad.ts', mostPowerful: 'bad.ts', bestRhythm: 'bad.ts',
      mostRevealing: 'bad.ts', deepest: 'bad.ts',
    }
    const recs = generateRecommendations(currents, [basin], sea, stats)
    expect(recs.some(r => r.includes('crimson power'))).toBe(true)
    expect(recs.some(r => r.includes('dry bed'))).toBe(true)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for any grade', () => {
    expect(typeof colorGrade('ruby-masterpiece')).toBe('string')
    expect(typeof colorGrade('dry-bed')).toBe('string')
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatCurrentTable', () => {
  it('formats a current with all fields', () => {
    const c = analyzeRubyCurrent(richContent, 'rich.ts')
    const formatted = formatCurrentTable(c)
    expect(formatted).toContain('rich.ts')
    expect(formatted).toContain('Crimson Power')
    expect(formatted).toContain('Tidal Rhythm')
    expect(formatted).toContain('Gem Surfacing')
    expect(formatted).toContain('Wave Precision')
    expect(formatted).toContain('Deep Current')
  })
})

describe('formatCurrentsTable', () => {
  it('returns empty message for no currents', () => {
    expect(formatCurrentsTable([])).toContain('No ruby currents')
  })

  it('formats multiple currents', () => {
    const currents = [analyzeRubyCurrent(richContent, 'a.ts')]
    const formatted = formatCurrentsTable(currents)
    expect(formatted).toContain('Ruby Tide Analysis')
  })
})

describe('formatBasinTable', () => {
  it('formats a basin with all fields', () => {
    const currents = [analyzeRubyCurrent(richContent, 'src/a.ts')]
    const basin = analyzeTideBasin(currents, 'src')
    const formatted = formatBasinTable(basin)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Masterpieces')
  })
})

describe('formatBasinsTable', () => {
  it('returns empty message for no basins', () => {
    expect(formatBasinsTable([])).toContain('No tide basins')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildRubyTideResult(['test.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Captain Grade')
    expect(formatted).toContain('Overall Surge')
  })
})

describe('formatRecommendations', () => {
  it('returns empty message for no recs', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as list', () => {
    const formatted = formatRecommendations(['Fix power', 'Add types'])
    expect(formatted).toContain('Recommendations')
    expect(formatted).toContain('Fix power')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildRubyTideResult(['test.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Ruby Tide Analysis')
    expect(formatted).toContain('Sea')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats as valid JSON', async () => {
    const result = await buildRubyTideResult(['test.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.currents).toHaveLength(1)
    expect(parsed.sea.overallSurge).toBe(98)
  })
})
