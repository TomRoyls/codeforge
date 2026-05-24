import { describe, it, expect } from 'vitest'
import {
  measurePurifying,
  measureCommanding,
  measureSetting,
  measureEnduring,
  measureReigning,
  analyzePlatinumJewel,
  analyzePlatinumThrone,
  classifyJewelCondition,
  classifyThroneType,
  classifyThroneCondition,
  classifyMonarchGrade,
  generateRecommendations,
  buildPlatinumCrownResult,
  gatherFiles,
} from '../src/commands/platinum-crown-helpers.js'
import {
  colorScore,
  colorGrade,
  formatJewelTable,
  formatJewelsTable,
  formatThroneTable,
  formatThronesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/platinum-crown-format-helpers.js'

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

// ─── Purifying Measure ─────────────────────────────────────────────

describe('measurePurifying', () => {
  it('returns low score for minimal content', () => {
    const m = measurePurifying(minimalContent)
    expect(m.purity).toBeLessThanOrEqual(10)
    expect(m.hasHighPurity).toBe(false)
    expect(m.hasClean).toBe(false)
    expect(m.hasNoDeadCode).toBe(true)
    expect(m.hasNoHacky).toBe(true)
    expect(m.hasNoDuplicates).toBe(false)
    expect(m.hasPristine).toBe(false)
    expect(m.hasNoMessy).toBe(true)
    expect(m.hasReadable).toBe(false)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasClear).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasLuminous).toBe(false)
    expect(m.deadCodeCount).toBe(0)
    expect(m.hackyCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measurePurifying(moderateContent)
    expect(m.purity).toBeGreaterThan(20)
    expect(m.purity).toBeLessThan(70)
    expect(m.hasClean).toBe(true)
    expect(m.hasPristine).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measurePurifying(richContent)
    expect(m.purity).toBe(100)
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasNoDeadCode).toBe(true)
    expect(m.hasNoHacky).toBe(true)
    expect(m.hasNoDuplicates).toBe(true)
    expect(m.hasPristine).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasLuminous).toBe(true)
    expect(m.crown).toBe('flawless-platinum')
  })

  it('detects eval as deadCode', () => {
    const m = measurePurifying('eval("1")')
    expect(m.hasNoDeadCode).toBe(false)
    expect(m.deadCodeCount).toBe(1)
  })

  it('detects any as hacky', () => {
    const m = measurePurifying('const x: any = 1')
    expect(m.hasNoHacky).toBe(false)
    expect(m.hackyCount).toBe(1)
  })
})

// ─── Commanding Measure ────────────────────────────────────────────

describe('measureCommanding', () => {
  it('returns low score for minimal content', () => {
    const m = measureCommanding(minimalContent)
    expect(m.authority).toBeLessThanOrEqual(10)
    expect(m.hasHighAuthority).toBe(false)
    expect(m.hasReliable).toBe(false)
    expect(m.hasTested).toBe(false)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasDeterministic).toBe(false)
    expect(m.hasNoRandom).toBe(true)
    expect(m.hasConsistent).toBe(false)
    expect(m.hasNoFlaky).toBe(true)
    expect(m.hasPowerful).toBe(false)
    expect(m.hasNoWeak).toBe(true)
    expect(m.hasCommanding).toBe(false)
    expect(m.untestedCount).toBe(0)
    expect(m.flakyCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureCommanding(moderateContent)
    expect(m.authority).toBeGreaterThan(10)
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
    expect(m.crest).toBe('imperial-seal')
  })

  it('detects var as untested', () => {
    const m = measureCommanding('var x = 1')
    expect(m.hasNoUntested).toBe(false)
    expect(m.untestedCount).toBe(1)
  })
})

// ─── Setting Measure ───────────────────────────────────────────────

describe('measureSetting', () => {
  it('returns low score for minimal content', () => {
    const m = measureSetting(minimalContent)
    expect(m.precision).toBeLessThanOrEqual(10)
    expect(m.hasHighPrecision).toBe(false)
    expect(m.hasExact).toBe(false)
    expect(m.hasAccurate).toBe(false)
    expect(m.hasNoApproximate).toBe(true)
    expect(m.hasCorrect).toBe(false)
    expect(m.hasNoAlmostRight).toBe(true)
    expect(m.hasPrecise).toBe(false)
    expect(m.hasNoVague).toBe(true)
    expect(m.hasSharp).toBe(false)
    expect(m.hasNoSloppy).toBe(true)
    expect(m.hasFlawless).toBe(false)
    expect(m.approximateCount).toBe(0)
    expect(m.sloppyCount).toBe(0)
  })

  it('returns high score for rich content', () => {
    const m = measureSetting(richContent)
    expect(m.precision).toBe(100)
    expect(m.hasHighPrecision).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasCorrect).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasSharp).toBe(true)
    expect(m.hasFlawless).toBe(true)
    expect(m.setting).toBe('master-jeweler')
  })
})

// ─── Enduring Measure ──────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns low score for minimal content', () => {
    const m = measureEnduring(minimalContent)
    expect(m.resilience).toBeLessThanOrEqual(10)
    expect(m.hasHighResilience).toBe(false)
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasRobust).toBe(false)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasDefensive).toBe(false)
    expect(m.hasNoNaive).toBe(true)
    expect(m.hasBattleTested).toBe(false)
    expect(m.unsafeCount).toBe(0)
    expect(m.bareCrashCount).toBe(0)
  })

  it('returns high score for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBe(100)
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasBattleTested).toBe(true)
    expect(m.circlet).toBe('indestructible')
  })
})

// ─── Reigning Measure ──────────────────────────────────────────────

describe('measureReigning', () => {
  it('returns low score for minimal content', () => {
    const m = measureReigning(minimalContent)
    expect(m.endurance).toBeLessThanOrEqual(10)
    expect(m.hasHighEndurance).toBe(false)
    expect(m.hasMaintainable).toBe(false)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasExtensible).toBe(false)
    expect(m.hasNoRigid).toBe(true)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasNoUndocumented).toBe(true)
    expect(m.hasWellStructured).toBe(false)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hasStableAPI).toBe(false)
    expect(m.hasProven).toBe(false)
    expect(m.fragileCount).toBe(0)
    expect(m.adHocCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureReigning(moderateContent)
    expect(m.endurance).toBeGreaterThan(20)
    expect(m.endurance).toBeLessThan(70)
    expect(m.hasMaintainable).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureReigning(richContent)
    expect(m.endurance).toBe(100)
    expect(m.hasHighEndurance).toBe(true)
    expect(m.hasMaintainable).toBe(true)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasStableAPI).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.reign).toBe('eternal-dynasty')
  })
})

// ─── Classification Functions ──────────────────────────────────────

describe('classifyJewelCondition', () => {
  it('classifies imperial-crown', () => expect(classifyJewelCondition(90)).toBe('imperial-crown'))
  it('classifies royal-tiara', () => expect(classifyJewelCondition(75)).toBe('royal-tiara'))
  it('classifies proper-circlet', () => expect(classifyJewelCondition(60)).toBe('proper-circlet'))
  it('classifies metal-band', () => expect(classifyJewelCondition(45)).toBe('metal-band'))
  it('classifies rusty-ring', () => expect(classifyJewelCondition(30)).toBe('rusty-ring'))
  it('classifies scrap', () => expect(classifyJewelCondition(10)).toBe('scrap'))
})

describe('classifyThroneCondition', () => {
  it('classifies golden-age', () => expect(classifyThroneCondition(80)).toBe('golden-age'))
  it('classifies prosperous-reign', () => expect(classifyThroneCondition(65)).toBe('prosperous-reign'))
  it('classifies stable-kingdom', () => expect(classifyThroneCondition(50)).toBe('stable-kingdom'))
  it('classifies declining-realm', () => expect(classifyThroneCondition(35)).toBe('declining-realm'))
  it('classifies fallen-empire', () => expect(classifyThroneCondition(20)).toBe('fallen-empire'))
  it('classifies void', () => expect(classifyThroneCondition(5)).toBe('void'))
})

describe('classifyMonarchGrade', () => {
  it('classifies emperor', () => expect(classifyMonarchGrade(85)).toBe('emperor'))
  it('classifies king', () => expect(classifyMonarchGrade(70)).toBe('king'))
  it('classifies duke', () => expect(classifyMonarchGrade(55)).toBe('duke'))
  it('classifies baron', () => expect(classifyMonarchGrade(40)).toBe('baron'))
  it('classifies knight', () => expect(classifyMonarchGrade(25)).toBe('knight'))
  it('classifies peasant', () => expect(classifyMonarchGrade(10)).toBe('peasant'))
})

describe('classifyThroneType', () => {
  it('returns no-throne for empty', () => {
    expect(classifyThroneType([])).toBe('no-throne')
  })

  it('returns grand-throne for all imperial-crown', () => {
    const jewels = [
      { ...analyzePlatinumJewel(richContent, 'a.ts'), condition: 'imperial-crown' as const },
      { ...analyzePlatinumJewel(richContent, 'b.ts'), condition: 'imperial-crown' as const },
    ]
    expect(classifyThroneType(jewels)).toBe('grand-throne')
  })
})

// ─── analyzePlatinumJewel ──────────────────────────────────────────

describe('analyzePlatinumJewel', () => {
  it('analyzes minimal content', () => {
    const jewel = analyzePlatinumJewel(minimalContent, 'mini.ts')
    expect(jewel.file).toBe('mini.ts')
    expect(jewel.qualityScore).toBeLessThanOrEqual(10)
    expect(jewel.condition).toBe('scrap')
    expect(jewel.royalPurity).toBeLessThanOrEqual(10)
    expect(jewel.crestAuthority).toBeLessThanOrEqual(10)
    expect(jewel.jewelPrecision).toBeLessThanOrEqual(10)
    expect(jewel.circletResilience).toBeLessThanOrEqual(10)
    expect(jewel.reignEndurance).toBeLessThanOrEqual(10)
  })

  it('analyzes rich content', () => {
    const jewel = analyzePlatinumJewel(richContent, 'rich.ts')
    expect(jewel.file).toBe('rich.ts')
    expect(jewel.qualityScore).toBe(100)
    expect(jewel.condition).toBe('imperial-crown')
    expect(jewel.royalPurity).toBe(100)
    expect(jewel.crestAuthority).toBe(100)
    expect(jewel.jewelPrecision).toBe(100)
    expect(jewel.circletResilience).toBe(100)
    expect(jewel.reignEndurance).toBe(100)
  })
})

// ─── analyzePlatinumThrone ─────────────────────────────────────────

describe('analyzePlatinumThrone', () => {
  it('handles empty jewels', () => {
    const throne = analyzePlatinumThrone([], 'empty')
    expect(throne.directory).toBe('empty')
    expect(throne.jewels).toHaveLength(0)
    expect(throne.avgPurity).toBe(0)
    expect(throne.avgAuthority).toBe(0)
    expect(throne.avgEndurance).toBe(0)
    expect(throne.imperialCrownCount).toBe(0)
    expect(throne.scrapCount).toBe(0)
    expect(throne.throneType).toBe('no-throne')
    expect(throne.condition).toBe('void')
  })

  it('classifies throne with rich jewels', () => {
    const jewel = analyzePlatinumJewel(richContent, 'rich.ts')
    const throne = analyzePlatinumThrone([jewel], 'src')
    expect(throne.throneType).toBe('grand-throne')
    expect(throne.imperialCrownCount).toBe(1)
    expect(throne.scrapCount).toBe(0)
    expect(throne.avgPurity).toBe(100)
    expect(throne.condition).toBe('golden-age')
  })

  it('classifies throne with mixed jewels', () => {
    const rich = analyzePlatinumJewel(richContent, 'rich.ts')
    const minimal = analyzePlatinumJewel(minimalContent, 'mini.ts')
    const throne = analyzePlatinumThrone([rich, minimal], 'src')
    expect(throne.jewels).toHaveLength(2)
    expect(throne.imperialCrownCount).toBe(1)
    expect(throne.scrapCount).toBe(1)
  })
})

// ─── buildPlatinumCrownResult ──────────────────────────────────────

describe('buildPlatinumCrownResult', async () => {
  it('handles empty input', async () => {
    const result = await buildPlatinumCrownResult([], [])
    expect(result.jewels).toHaveLength(0)
    expect(result.thrones).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallSovereignty).toBe(0)
    expect(result.stats.monarchGrade).toBe('peasant')
    expect(result.kingdom.isImperial).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildPlatinumCrownResult(['test.ts'], [richContent])
    expect(result.jewels).toHaveLength(1)
    expect(result.jewels[0].condition).toBe('imperial-crown')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.imperialCrownCount).toBe(1)
    expect(result.stats.scrapCount).toBe(0)
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildPlatinumCrownResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.jewels).toHaveLength(2)
    expect(result.thrones).toHaveLength(2)
    expect(result.stats.totalThrones).toBe(2)
  })

  it('computes overall stats for rich content', async () => {
    const result = await buildPlatinumCrownResult(['rich.ts'], [richContent])
    expect(result.stats.overallSovereignty).toBe(100)
    expect(result.stats.monarchGrade).toBe('emperor')
    expect(result.stats.bestJewel).toBe('rich.ts')
    expect(result.stats.purest).toBe('rich.ts')
    expect(result.stats.mostAuthoritative).toBe('rich.ts')
    expect(result.stats.mostPrecise).toBe('rich.ts')
    expect(result.stats.mostEnduring).toBe('rich.ts')
  })

  it('computes kingdom correctly', async () => {
    const result = await buildPlatinumCrownResult(['rich.ts'], [richContent])
    expect(result.kingdom.avgPurity).toBe(100)
    expect(result.kingdom.avgAuthority).toBe(100)
    expect(result.kingdom.avgEndurance).toBe(100)
    expect(result.kingdom.isImperial).toBe(true)
    expect(result.kingdom.overallSovereignty).toBe(100)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', async () => {
  it('returns perfect message when all good', async () => {
    const result = await buildPlatinumCrownResult(['rich.ts'], [richContent])
    const recs = generateRecommendations(result.jewels, result.thrones, result.kingdom, result.stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('imperial perfection')
  })

  it('recommends improving purity when low', async () => {
    const result = await buildPlatinumCrownResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('Purify') || r.includes('clean'))).toBe(true)
  })

  it('recommends improving authority when low', async () => {
    const result = await buildPlatinumCrownResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('authority') || r.includes('crest'))).toBe(true)
  })

  it('recommends improving precision when low', async () => {
    const result = await buildPlatinumCrownResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('precision') || r.includes('jewel'))).toBe(true)
  })

  it('recommends improving resilience when low', async () => {
    const result = await buildPlatinumCrownResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('resilience') || r.includes('circlet'))).toBe(true)
  })

  it('recommends improving endurance when low', async () => {
    const result = await buildPlatinumCrownResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('endurance') || r.includes('reign'))).toBe(true)
  })

  it('notes scrap files', async () => {
    const result = await buildPlatinumCrownResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('scrap'))).toBe(true)
  })

  it('lists specific scrap files when <=3', async () => {
    const result = await buildPlatinumCrownResult(
      ['a.ts', 'b.ts'],
      [minimalContent, minimalContent],
    )
    expect(result.recommendations.some(r => r.includes('a.ts') || r.includes('b.ts'))).toBe(true)
  })
})

// ─── gatherFiles ───────────────────────────────────────────────────

describe('gatherFiles', () => {
  it('returns empty for non-existent path', async () => {
    const files = await gatherFiles('/nonexistent', ['.ts'], [])
    expect(files).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for any grade', () => {
    expect(typeof colorGrade('imperial-crown')).toBe('string')
    expect(typeof colorGrade('scrap')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatJewelTable', () => {
  it('formats a jewel', () => {
    const jewel = analyzePlatinumJewel(richContent, 'rich.ts')
    const output = formatJewelTable(jewel)
    expect(output).toContain('rich.ts')
    expect(output).toContain('Royal Purity')
    expect(output).toContain('Crest Authority')
    expect(output).toContain('Jewel Precision')
    expect(output).toContain('Circlet Resilience')
    expect(output).toContain('Reign Endurance')
  })
})

describe('formatJewelsTable', () => {
  it('returns message for empty jewels', () => {
    expect(formatJewelsTable([])).toContain('No platinum jewels')
  })
})

describe('formatThroneTable', () => {
  it('formats a throne', () => {
    const jewel = analyzePlatinumJewel(richContent, 'rich.ts')
    const throne = analyzePlatinumThrone([jewel], 'src')
    const output = formatThroneTable(throne)
    expect(output).toContain('src')
    expect(output).toContain('Type')
  })
})

describe('formatThronesTable', () => {
  it('returns message for empty thrones', () => {
    expect(formatThronesTable([])).toContain('No platinum thrones')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildPlatinumCrownResult(['rich.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Platinum Crown Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Monarch Grade')
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
    const result = await buildPlatinumCrownResult(['rich.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Platinum Jewel Analysis')
    expect(output).toContain('Platinum Thrones')
    expect(output).toContain('Platinum Crown Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildPlatinumCrownResult(['rich.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.jewels).toHaveLength(1)
    expect(parsed.stats.monarchGrade).toBe('emperor')
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with var and any in purifying', () => {
    const m = measurePurifying('var x: any = 1 as any')
    expect(m.hasNoMessy).toBe(false)
    expect(m.hasNoHacky).toBe(false)
  })

  it('handles content with debugger in commanding', () => {
    const m = measureCommanding('function f() { debugger }')
    expect(m.hasNoWeak).toBe(false)
  })

  it('handles content with eval in setting', () => {
    const m = measureSetting('eval("1")')
    expect(m.hasNoVague).toBe(false)
  })

  it('handles content with var in enduring', () => {
    const m = measureEnduring('var x = 1')
    expect(m.hasNoUnsafe).toBe(false)
    expect(m.unsafeCount).toBe(1)
  })

  it('handles content with var in reigning', () => {
    const m = measureReigning('var x = 1')
    expect(m.hasNoFragile).toBe(false)
    expect(m.fragileCount).toBe(1)
  })

  it('jewel quality score is average of 5 measures', () => {
    const jewel = analyzePlatinumJewel(richContent, 'rich.ts')
    const expected = Math.round(
      jewel.royalPurity * 0.2 +
      jewel.crestAuthority * 0.2 +
      jewel.jewelPrecision * 0.2 +
      jewel.circletResilience * 0.2 +
      jewel.reignEndurance * 0.2,
    )
    expect(jewel.qualityScore).toBe(expected)
  })

  it('overall sovereignty is average of purity, authority, endurance', async () => {
    const result = await buildPlatinumCrownResult(['rich.ts'], [richContent])
    const expected = Math.round((100 + 100 + 100) / 3)
    expect(result.stats.overallSovereignty).toBe(expected)
  })
})
