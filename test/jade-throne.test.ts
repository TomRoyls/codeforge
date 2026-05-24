import { describe, it, expect } from 'vitest'
import {
  measureKnowing,
  measureCommanding,
  measureCrafting,
  measurePurifying,
  measureEnduring,
  analyzeJadeSeat,
  analyzeJadePalace,
  classifySeatCondition,
  classifyPalaceType,
  classifyPalaceCondition,
  classifyEmperorGrade,
  generateRecommendations,
  buildJadeThroneResult,
  gatherFiles,
} from '../src/commands/jade-throne-helpers.js'
import {
  colorScore,
  colorGrade,
  formatSeatTable,
  formatSeatsTable,
  formatPalaceTable,
  formatPalacesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/jade-throne-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const minimalContent = 'const x = 1'

const moderateContent = `export interface Foo {
  bar: string
}

export function greet(name: string): string {
  return 'hello ' + name
}

const foo: Foo = { bar: 'baz' }
`

const richContent = `/**
 * A type alias for string or number
 */
type StringOrNumber = string | number

export enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

export interface Widget<T> {
  readonly id: string
  name: string
  value: T
  optional?: boolean
}

export class Processor {
  private status: string = 'idle'

  async process(input: string): Promise<string> {
    try {
      this.status = 'running'
      return input.toUpperCase()
    } catch (err) {
      throw new Error('Processing failed')
    }
  }
}

export function findWidget(widgets: Widget<string>[], id: string): Widget<string> | undefined {
  return widgets.find(w => w.id === id)
}

const DEFAULT_COLOR = Color.Red
`

// ─── Knowing Measure ──────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns low score for minimal content', () => {
    const m = measureKnowing(minimalContent)
    expect(m.wisdom).toBeLessThanOrEqual(10)
    expect(m.hasHighWisdom).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellStructured).toBe(false)
    expect(m.hasPatterned).toBe(false)
    expect(m.hasPrincipled).toBe(false)
    expect(m.hasMature).toBe(false)
    expect(m.hasEnlightened).toBe(false)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hasNoReinvented).toBe(true)
    expect(m.hasNoHacky).toBe(true)
    expect(m.adHocCount).toBe(0)
    expect(m.hackyCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureKnowing(moderateContent)
    expect(m.wisdom).toBeGreaterThan(20)
    expect(m.wisdom).toBeLessThan(70)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasPatterned).toBe(false)
    expect(m.sage).toBe('foolish-youth')
  })

  it('returns high score for rich content', () => {
    const m = measureKnowing(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasEnlightened).toBe(true)
    expect(m.sage).toBe('imperial-sage')
  })

  it('detects var as ad-hoc', () => {
    const m = measureKnowing('var x = 1')
    expect(m.hasNoAdHoc).toBe(false)
    expect(m.adHocCount).toBe(1)
  })

  it('detects eval as hacky', () => {
    const m = measureKnowing('eval("1+2")')
    expect(m.hasNoHacky).toBe(false)
    expect(m.hackyCount).toBe(1)
  })
})

// ─── Commanding Measure ───────────────────────────────────────────

describe('measureCommanding', () => {
  it('returns low score for minimal content', () => {
    const m = measureCommanding(minimalContent)
    expect(m.authority).toBeLessThanOrEqual(10)
    expect(m.hasHighAuthority).toBe(false)
    expect(m.hasReliable).toBe(false)
    expect(m.hasTested).toBe(false)
    expect(m.hasDeterministic).toBe(false)
    expect(m.hasConsistent).toBe(false)
    expect(m.hasPowerful).toBe(false)
    expect(m.hasCommanding).toBe(false)
    expect(m.untestedCount).toBe(0)
    expect(m.flakyCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureCommanding(moderateContent)
    expect(m.authority).toBeGreaterThan(20)
    expect(m.authority).toBeLessThan(70)
    expect(m.hasTested).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureCommanding(richContent)
    expect(m.authority).toBe(100)
    expect(m.hasHighAuthority).toBe(true)
    expect(m.hasReliable).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasDeterministic).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasPowerful).toBe(true)
    expect(m.hasCommanding).toBe(true)
    expect(m.sovereignty).toBe('divine-mandate')
  })

  it('detects var as untested', () => {
    const m = measureCommanding('var x = 1')
    expect(m.hasNoUntested).toBe(false)
    expect(m.untestedCount).toBe(1)
  })
})

// ─── Crafting Measure ─────────────────────────────────────────────

describe('measureCrafting', () => {
  it('returns low score for minimal content', () => {
    const m = measureCrafting(minimalContent)
    expect(m.precision).toBeLessThanOrEqual(10)
    expect(m.hasHighPrecision).toBe(false)
    expect(m.hasExact).toBe(false)
    expect(m.hasPrecise).toBe(false)
    expect(m.hasSharp).toBe(false)
    expect(m.hasDetailed).toBe(false)
    expect(m.hasRefined).toBe(false)
    expect(m.hasImmaculate).toBe(false)
    expect(m.approximateCount).toBe(0)
    expect(m.sloppyCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureCrafting(moderateContent)
    expect(m.precision).toBeGreaterThan(20)
    expect(m.precision).toBeLessThan(70)
    expect(m.hasExact).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureCrafting(richContent)
    expect(m.precision).toBe(100)
    expect(m.hasHighPrecision).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasSharp).toBe(true)
    expect(m.hasDetailed).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasImmaculate).toBe(true)
    expect(m.craftsmanship).toBe('master-carver')
  })
})

// ─── Purifying Measure ────────────────────────────────────────────

describe('measurePurifying', () => {
  it('returns low score for minimal content', () => {
    const m = measurePurifying(minimalContent)
    expect(m.purity).toBeLessThanOrEqual(10)
    expect(m.hasHighPurity).toBe(false)
    expect(m.hasReadable).toBe(false)
    expect(m.hasTransparent).toBe(false)
    expect(m.hasClear).toBe(false)
    expect(m.hasClean).toBe(false)
    expect(m.hasPristine).toBe(false)
    expect(m.hasFlawless).toBe(false)
    expect(m.obfuscatedCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measurePurifying(moderateContent)
    expect(m.purity).toBeGreaterThan(20)
    expect(m.purity).toBeLessThan(70)
    expect(m.hasReadable).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measurePurifying(richContent)
    expect(m.purity).toBe(100)
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasPristine).toBe(true)
    expect(m.hasFlawless).toBe(true)
    expect(m.clarity).toBe('flawless-jade')
  })
})

// ─── Enduring Measure ─────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns low score for minimal content', () => {
    const m = measureEnduring(minimalContent)
    expect(m.endurance).toBeLessThanOrEqual(10)
    expect(m.hasHighEndurance).toBe(false)
    expect(m.hasMaintainable).toBe(false)
    expect(m.hasExtensible).toBe(false)
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasStableAPI).toBe(false)
    expect(m.fragileCount).toBe(0)
    expect(m.rigidCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureEnduring(moderateContent)
    expect(m.endurance).toBeGreaterThan(10)
    expect(m.endurance).toBeLessThan(70)
    expect(m.hasStableAPI).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.endurance).toBe(100)
    expect(m.hasHighEndurance).toBe(true)
    expect(m.hasMaintainable).toBe(true)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasStableAPI).toBe(true)
    expect(m.legacy).toBe('thousand-year-dynasty')
  })
})

// ─── Classify Functions ───────────────────────────────────────────

describe('classifyWisdomSage (via measureKnowing)', () => {
  it('classifies imperial-sage for rich content', () => {
    expect(measureKnowing(richContent).sage).toBe('imperial-sage')
  })
  it('classifies no-wisdom for minimal content', () => {
    expect(measureKnowing(minimalContent).sage).toBe('no-wisdom')
  })
})

describe('classifyAuthoritySovereignty (via measureCommanding)', () => {
  it('classifies divine-mandate for rich content', () => {
    expect(measureCommanding(richContent).sovereignty).toBe('divine-mandate')
  })
  it('classifies no-authority for minimal content', () => {
    expect(measureCommanding(minimalContent).sovereignty).toBe('no-authority')
  })
})

describe('classifyPrecisionCraftsmanship (via measureCrafting)', () => {
  it('classifies master-carver for rich content', () => {
    expect(measureCrafting(richContent).craftsmanship).toBe('master-carver')
  })
  it('classifies no-craft for minimal content', () => {
    expect(measureCrafting(minimalContent).craftsmanship).toBe('no-craft')
  })
})

describe('classifyPurityClarity (via measurePurifying)', () => {
  it('classifies flawless-jade for rich content', () => {
    expect(measurePurifying(richContent).clarity).toBe('flawless-jade')
  })
  it('classifies no-purity for minimal content', () => {
    expect(measurePurifying(minimalContent).clarity).toBe('no-purity')
  })
})

describe('classifyEnduranceLegacy (via measureEnduring)', () => {
  it('classifies thousand-year-dynasty for rich content', () => {
    expect(measureEnduring(richContent).legacy).toBe('thousand-year-dynasty')
  })
  it('classifies no-legacy for minimal content', () => {
    expect(measureEnduring(minimalContent).legacy).toBe('no-legacy')
  })
})

describe('classifySeatCondition', () => {
  it('classifies imperial-jade', () => expect(classifySeatCondition(90)).toBe('imperial-jade'))
  it('classifies court-treasure', () => expect(classifySeatCondition(75)).toBe('court-treasure'))
  it('classifies proper-throne', () => expect(classifySeatCondition(60)).toBe('proper-throne'))
  it('classifies carved-stone', () => expect(classifySeatCondition(45)).toBe('carved-stone'))
  it('classifies rough-rock', () => expect(classifySeatCondition(30)).toBe('rough-rock'))
  it('classifies dust', () => expect(classifySeatCondition(10)).toBe('dust'))
})

describe('classifyPalaceCondition', () => {
  it('classifies golden-age', () => expect(classifyPalaceCondition(80)).toBe('golden-age'))
  it('classifies prosperous-reign', () => expect(classifyPalaceCondition(65)).toBe('prosperous-reign'))
  it('classifies stable-dynasty', () => expect(classifyPalaceCondition(50)).toBe('stable-dynasty'))
  it('classifies declining-era', () => expect(classifyPalaceCondition(35)).toBe('declining-era'))
  it('classifies fallen-ruins', () => expect(classifyPalaceCondition(20)).toBe('fallen-ruins'))
  it('classifies void', () => expect(classifyPalaceCondition(5)).toBe('void'))
})

describe('classifyEmperorGrade', () => {
  it('classifies jade-emperor', () => expect(classifyEmperorGrade(85)).toBe('jade-emperor'))
  it('classifies court-minister', () => expect(classifyEmperorGrade(70)).toBe('court-minister'))
  it('classifies skilled-artisan', () => expect(classifyEmperorGrade(55)).toBe('skilled-artisan'))
  it('classifies apprentice', () => expect(classifyEmperorGrade(40)).toBe('apprentice'))
  it('classifies novice', () => expect(classifyEmperorGrade(25)).toBe('novice'))
  it('classifies peasant', () => expect(classifyEmperorGrade(10)).toBe('peasant'))
})

// ─── analyzeJadeSeat ──────────────────────────────────────────────

describe('analyzeJadeSeat', () => {
  it('analyzes minimal content', () => {
    const seat = analyzeJadeSeat(minimalContent, 'mini.ts')
    expect(seat.file).toBe('mini.ts')
    expect(seat.qualityScore).toBeLessThanOrEqual(10)
    expect(seat.condition).toBe('dust')
    expect(seat.wisdomDepth).toBeLessThanOrEqual(10)
    expect(seat.throneAuthority).toBeLessThanOrEqual(10)
    expect(seat.carvingPrecision).toBeLessThanOrEqual(10)
    expect(seat.jadePurity).toBeLessThanOrEqual(10)
    expect(seat.dynastyEndurance).toBeLessThanOrEqual(10)
  })

  it('analyzes moderate content', () => {
    const seat = analyzeJadeSeat(moderateContent, 'mod.ts')
    expect(seat.file).toBe('mod.ts')
    expect(seat.qualityScore).toBeGreaterThan(20)
    expect(seat.qualityScore).toBeLessThan(70)
  })

  it('analyzes rich content', () => {
    const seat = analyzeJadeSeat(richContent, 'rich.ts')
    expect(seat.file).toBe('rich.ts')
    expect(seat.qualityScore).toBe(100)
    expect(seat.condition).toBe('imperial-jade')
    expect(seat.wisdomDepth).toBe(100)
    expect(seat.throneAuthority).toBe(100)
    expect(seat.carvingPrecision).toBe(100)
    expect(seat.jadePurity).toBe(100)
    expect(seat.dynastyEndurance).toBe(100)
  })
})

// ─── analyzeJadePalace ────────────────────────────────────────────

describe('analyzeJadePalace', () => {
  it('handles empty seats', () => {
    const palace = analyzeJadePalace([], 'empty')
    expect(palace.directory).toBe('empty')
    expect(palace.seats).toHaveLength(0)
    expect(palace.avgWisdom).toBe(0)
    expect(palace.avgAuthority).toBe(0)
    expect(palace.avgPurity).toBe(0)
    expect(palace.imperialJadeCount).toBe(0)
    expect(palace.dustCount).toBe(0)
    expect(palace.palaceType).toBe('no-palace')
    expect(palace.condition).toBe('void')
  })

  it('classifies palace with rich seats', () => {
    const seat = analyzeJadeSeat(richContent, 'rich.ts')
    const palace = analyzeJadePalace([seat], 'src')
    expect(palace.palaceType).toBe('forbidden-city')
    expect(palace.imperialJadeCount).toBe(1)
    expect(palace.dustCount).toBe(0)
    expect(palace.avgWisdom).toBe(100)
    expect(palace.condition).toBe('golden-age')
  })

  it('classifies palace with mixed seats', () => {
    const rich = analyzeJadeSeat(richContent, 'rich.ts')
    const minimal = analyzeJadeSeat(minimalContent, 'mini.ts')
    const palace = analyzeJadePalace([rich, minimal], 'src')
    expect(palace.seats).toHaveLength(2)
    expect(palace.imperialJadeCount).toBe(1)
    expect(palace.dustCount).toBe(1)
  })
})

describe('classifyPalaceType', () => {
  it('returns no-palace for empty', () => {
    expect(classifyPalaceType([])).toBe('no-palace')
  })

  it('returns forbidden-city for all imperial-jade', () => {
    const seats = [
      { ...analyzeJadeSeat(richContent, 'a.ts'), condition: 'imperial-jade' as const },
      { ...analyzeJadeSeat(richContent, 'b.ts'), condition: 'imperial-jade' as const },
    ]
    expect(classifyPalaceType(seats)).toBe('forbidden-city')
  })
})

// ─── buildJadeThroneResult ────────────────────────────────────────

describe('buildJadeThroneResult', async () => {
  it('handles empty input', async () => {
    const result = await buildJadeThroneResult([], [])
    expect(result.seats).toHaveLength(0)
    expect(result.palaces).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallSovereignty).toBe(0)
    expect(result.stats.emperorGrade).toBe('peasant')
    expect(result.court.isImperial).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildJadeThroneResult(['test.ts'], [richContent])
    expect(result.seats).toHaveLength(1)
    expect(result.seats[0].condition).toBe('imperial-jade')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.imperialJadeCount).toBe(1)
    expect(result.stats.dustCount).toBe(0)
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildJadeThroneResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.seats).toHaveLength(2)
    expect(result.palaces).toHaveLength(2)
    expect(result.stats.totalPalaces).toBe(2)
  })

  it('computes overall stats correctly for rich content', async () => {
    const result = await buildJadeThroneResult(['rich.ts'], [richContent])
    expect(result.stats.overallSovereignty).toBe(100)
    expect(result.stats.emperorGrade).toBe('jade-emperor')
    expect(result.stats.bestSeat).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
    expect(result.stats.mostAuthoritative).toBe('rich.ts')
    expect(result.stats.mostPrecise).toBe('rich.ts')
    expect(result.stats.purest).toBe('rich.ts')
  })

  it('computes court correctly', async () => {
    const result = await buildJadeThroneResult(['rich.ts'], [richContent])
    expect(result.court.avgWisdom).toBe(100)
    expect(result.court.avgAuthority).toBe(100)
    expect(result.court.avgPurity).toBe(100)
    expect(result.court.isImperial).toBe(true)
    expect(result.court.overallSovereignty).toBe(100)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', async () => {
  it('returns perfect message when all good', async () => {
    const result = await buildJadeThroneResult(['rich.ts'], [richContent])
    const recs = generateRecommendations(result.seats, result.palaces, result.court, result.stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('imperial perfection')
  })

  it('recommends improving wisdom when low', async () => {
    const result = await buildJadeThroneResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('wisdom'))).toBe(true)
  })

  it('recommends improving authority when low', async () => {
    const result = await buildJadeThroneResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('authority') || r.includes('throne'))).toBe(true)
  })

  it('recommends improving precision when low', async () => {
    const result = await buildJadeThroneResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('precision') || r.includes('carving'))).toBe(true)
  })

  it('recommends improving purity when low', async () => {
    const result = await buildJadeThroneResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('purity') || r.includes('jade'))).toBe(true)
  })

  it('recommends improving endurance when low', async () => {
    const result = await buildJadeThroneResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('endurance') || r.includes('dynasty'))).toBe(true)
  })

  it('notes dust files', async () => {
    const result = await buildJadeThroneResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('dust'))).toBe(true)
  })

  it('lists specific dust files when <=3', async () => {
    const result = await buildJadeThroneResult(
      ['a.ts', 'b.ts'],
      [minimalContent, minimalContent],
    )
    expect(result.recommendations.some(r => r.includes('a.ts') || r.includes('b.ts'))).toBe(true)
  })
})

// ─── gatherFiles ──────────────────────────────────────────────────

describe('gatherFiles', () => {
  it('returns empty for non-existent path', async () => {
    const files = await gatherFiles('/nonexistent', ['.ts'], [])
    expect(files).toHaveLength(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for any grade', () => {
    expect(typeof colorGrade('imperial-jade')).toBe('string')
    expect(typeof colorGrade('dust')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatSeatTable', () => {
  it('formats a seat', () => {
    const seat = analyzeJadeSeat(richContent, 'rich.ts')
    const output = formatSeatTable(seat)
    expect(output).toContain('rich.ts')
    expect(output).toContain('Wisdom Depth')
    expect(output).toContain('Throne Authority')
    expect(output).toContain('Carving Precision')
    expect(output).toContain('Jade Purity')
    expect(output).toContain('Dynasty Endurance')
  })
})

describe('formatSeatsTable', () => {
  it('returns message for empty seats', () => {
    expect(formatSeatsTable([])).toContain('No jade seats')
  })

  it('formats multiple seats', () => {
    const seats = [
      analyzeJadeSeat(richContent, 'rich.ts'),
      analyzeJadeSeat(minimalContent, 'mini.ts'),
    ]
    const output = formatSeatsTable(seats)
    expect(output).toContain('rich.ts')
    expect(output).toContain('mini.ts')
  })
})

describe('formatPalaceTable', () => {
  it('formats a palace', () => {
    const seat = analyzeJadeSeat(richContent, 'rich.ts')
    const palace = analyzeJadePalace([seat], 'src')
    const output = formatPalaceTable(palace)
    expect(output).toContain('src')
    expect(output).toContain('Type')
  })
})

describe('formatPalacesTable', () => {
  it('returns message for empty palaces', () => {
    expect(formatPalacesTable([])).toContain('No jade palaces')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildJadeThroneResult(['rich.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Jade Throne Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Emperor Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty recs', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['improve X', 'fix Y'])
    expect(output).toContain('improve X')
    expect(output).toContain('fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildJadeThroneResult(['rich.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Jade Seat Analysis')
    expect(output).toContain('Jade Palaces')
    expect(output).toContain('Jade Throne Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildJadeThroneResult(['rich.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.seats).toHaveLength(1)
    expect(parsed.stats.emperorGrade).toBe('jade-emperor')
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with var and any', () => {
    const m = measureKnowing('var x: any = 1 as any')
    expect(m.hasNoAdHoc).toBe(false)
    expect(m.hasNoReinvented).toBe(false)
  })

  it('handles content with debugger', () => {
    const m = measureKnowing('function f() { debugger }')
    expect(m.hasNoNaive).toBe(false)
  })

  it('handles content with console.log in purifying', () => {
    const m = measurePurifying('console.log("hi")')
    expect(m.hasNoDuplicates).toBe(false)
  })

  it('handles content with eval in enduring', () => {
    const m = measureEnduring('eval("1")')
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('seat quality score is average of 5 measures', () => {
    const seat = analyzeJadeSeat(richContent, 'rich.ts')
    const expected = Math.round(
      seat.wisdomDepth * 0.2 +
      seat.throneAuthority * 0.2 +
      seat.carvingPrecision * 0.2 +
      seat.jadePurity * 0.2 +
      seat.dynastyEndurance * 0.2,
    )
    expect(seat.qualityScore).toBe(expected)
  })
})
