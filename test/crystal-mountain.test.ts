import { describe, it, expect } from 'vitest'
import {
  measureStructuring,
  measureAscending,
  measureFaceting,
  measureEnduring,
  measureElevating,
  analyzeCrystalPeak,
  analyzeCrystalRange,
  classifyPeakCondition,
  classifyRangeType,
  classifyRangeCondition,
  classifyAlpinistGrade,
  generateRecommendations,
  buildCrystalMountainResult,
  gatherFiles,
} from '../src/commands/crystal-mountain-helpers.js'
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
} from '../src/commands/crystal-mountain-format-helpers.js'

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

// ─── Structuring Measure ───────────────────────────────────────────

describe('measureStructuring', () => {
  it('returns low score for minimal content', () => {
    const m = measureStructuring(minimalContent)
    expect(m.structure).toBeLessThanOrEqual(10)
    expect(m.hasHighStructure).toBe(false)
    expect(m.hasOrganized).toBe(false)
    expect(m.hasWellStructured).toBe(false)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasLayered).toBe(false)
    expect(m.hasNoFlat).toBe(true)
    expect(m.hasModular).toBe(false)
    expect(m.hasNoMonolithic).toBe(true)
    expect(m.hasSystematic).toBe(false)
    expect(m.hasNoHaphazard).toBe(true)
    expect(m.hasOrdered).toBe(false)
    expect(m.chaoticCount).toBe(0)
    expect(m.monolithicCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureStructuring(moderateContent)
    expect(m.structure).toBeGreaterThan(20)
    expect(m.structure).toBeLessThan(70)
    expect(m.hasOrganized).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureStructuring(richContent)
    expect(m.structure).toBe(100)
    expect(m.hasHighStructure).toBe(true)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasLayered).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasSystematic).toBe(true)
    expect(m.hasOrdered).toBe(true)
    expect(m.lattice).toBe('perfect-crystal')
  })

  it('detects var as chaotic', () => {
    const m = measureStructuring('var x = 1')
    expect(m.hasNoChaotic).toBe(false)
    expect(m.chaoticCount).toBe(1)
  })
})

// ─── Ascending Measure ─────────────────────────────────────────────

describe('measureAscending', () => {
  it('returns low score for minimal content', () => {
    const m = measureAscending(minimalContent)
    expect(m.clarity).toBeLessThanOrEqual(10)
    expect(m.hasHighClarity).toBe(false)
    expect(m.hasReadable).toBe(false)
    expect(m.hasTransparent).toBe(false)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasClear).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasUnderstandable).toBe(false)
    expect(m.hasNoArcane).toBe(true)
    expect(m.hasVisible).toBe(false)
    expect(m.hasNoHidden).toBe(true)
    expect(m.hasLuminous).toBe(false)
    expect(m.obfuscatedCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureAscending(moderateContent)
    expect(m.clarity).toBeGreaterThan(20)
    expect(m.clarity).toBeLessThan(70)
    expect(m.hasReadable).toBe(true)
    expect(m.hasClear).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureAscending(richContent)
    expect(m.clarity).toBe(100)
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasLuminous).toBe(true)
    expect(m.altitude).toBe('summit-view')
  })

  it('detects any as obfuscated', () => {
    const m = measureAscending('const x: any = 1 as any')
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.obfuscatedCount).toBe(2)
  })
})

// ─── Faceting Measure ──────────────────────────────────────────────

describe('measureFaceting', () => {
  it('returns low score for minimal content', () => {
    const m = measureFaceting(minimalContent)
    expect(m.precision).toBeLessThanOrEqual(10)
    expect(m.hasHighPrecision).toBe(false)
    expect(m.hasExact).toBe(false)
    expect(m.hasAccurate).toBe(false)
    expect(m.hasNoApproximate).toBe(true)
    expect(m.hasPrecise).toBe(false)
    expect(m.hasNoVague).toBe(true)
    expect(m.hasCorrect).toBe(false)
    expect(m.hasNoAlmostRight).toBe(true)
    expect(m.hasSharp).toBe(false)
    expect(m.hasNoSloppy).toBe(true)
    expect(m.hasDefined).toBe(false)
    expect(m.approximateCount).toBe(0)
    expect(m.sloppyCount).toBe(0)
  })

  it('returns high score for rich content', () => {
    const m = measureFaceting(richContent)
    expect(m.precision).toBe(100)
    expect(m.hasHighPrecision).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasCorrect).toBe(true)
    expect(m.hasSharp).toBe(true)
    expect(m.hasDefined).toBe(true)
    expect(m.cut).toBe('ideal-facet')
  })
})

// ─── Enduring Measure ──────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns low score for minimal content', () => {
    const m = measureEnduring(minimalContent)
    expect(m.resilience).toBeLessThanOrEqual(10)
    expect(m.hasHighResilience).toBe(false)
    expect(m.hasTested).toBe(false)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasDefensive).toBe(false)
    expect(m.hasNoNaive).toBe(true)
    expect(m.hasRobust).toBe(false)
    expect(m.untestedCount).toBe(0)
    expect(m.bareCrashCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureEnduring(moderateContent)
    expect(m.resilience).toBeGreaterThan(10)
    expect(m.resilience).toBeLessThan(70)
  })

  it('returns high score for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBe(100)
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.frost).toBe('permafrost-proof')
  })

  it('detects var as untested', () => {
    const m = measureEnduring('var x = 1')
    expect(m.hasNoUntested).toBe(false)
    expect(m.untestedCount).toBe(1)
  })
})

// ─── Elevating Measure ─────────────────────────────────────────────

describe('measureElevating', () => {
  it('returns low score for minimal content', () => {
    const m = measureElevating(minimalContent)
    expect(m.wisdom).toBeLessThanOrEqual(10)
    expect(m.hasHighWisdom).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellArchitected).toBe(false)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hasPatterned).toBe(false)
    expect(m.hasNoReinvented).toBe(true)
    expect(m.hasPrincipled).toBe(false)
    expect(m.hasNoHacky).toBe(true)
    expect(m.hasVisionary).toBe(false)
    expect(m.hasNoTunnelVision).toBe(true)
    expect(m.hasStrategic).toBe(false)
    expect(m.adHocCount).toBe(0)
    expect(m.hackyCount).toBe(0)
  })

  it('returns high score for rich content', () => {
    const m = measureElevating(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasVisionary).toBe(true)
    expect(m.hasStrategic).toBe(true)
    expect(m.summit).toBe('panoramic-view')
  })
})

// ─── Classification Functions ──────────────────────────────────────

describe('classifyPeakCondition', () => {
  it('classifies crystal-pinnacle', () => expect(classifyPeakCondition(90)).toBe('crystal-pinnacle'))
  it('classifies gem-peak', () => expect(classifyPeakCondition(75)).toBe('gem-peak'))
  it('classifies proper-summit', () => expect(classifyPeakCondition(60)).toBe('proper-summit'))
  it('classifies rocky-ridge', () => expect(classifyPeakCondition(45)).toBe('rocky-ridge'))
  it('classifies gravel-slope', () => expect(classifyPeakCondition(30)).toBe('gravel-slope'))
  it('classifies dust', () => expect(classifyPeakCondition(10)).toBe('dust'))
})

describe('classifyRangeCondition', () => {
  it('classifies crystal-kingdom', () => expect(classifyRangeCondition(80)).toBe('crystal-kingdom'))
  it('classifies gem-mountains', () => expect(classifyRangeCondition(65)).toBe('gem-mountains'))
  it('classifies proper-range', () => expect(classifyRangeCondition(50)).toBe('proper-range'))
  it('classifies rocky-hills', () => expect(classifyRangeCondition(35)).toBe('rocky-hills'))
  it('classifies eroded-peaks', () => expect(classifyRangeCondition(20)).toBe('eroded-peaks'))
  it('classifies void', () => expect(classifyRangeCondition(5)).toBe('void'))
})

describe('classifyAlpinistGrade', () => {
  it('classifies mountain-master', () => expect(classifyAlpinistGrade(85)).toBe('mountain-master'))
  it('classifies expert-climber', () => expect(classifyAlpinistGrade(70)).toBe('expert-climber'))
  it('classifies skilled-alpinist', () => expect(classifyAlpinistGrade(55)).toBe('skilled-alpinist'))
  it('classifies apprentice', () => expect(classifyAlpinistGrade(40)).toBe('apprentice'))
  it('classifies novice', () => expect(classifyAlpinistGrade(25)).toBe('novice'))
  it('classifies flatlander', () => expect(classifyAlpinistGrade(10)).toBe('flatlander'))
})

describe('classifyRangeType', () => {
  it('returns no-range for empty', () => {
    expect(classifyRangeType([])).toBe('no-range')
  })

  it('returns himalayas for all crystal-pinnacle', () => {
    const peaks = [
      { ...analyzeCrystalPeak(richContent, 'a.ts'), condition: 'crystal-pinnacle' as const },
      { ...analyzeCrystalPeak(richContent, 'b.ts'), condition: 'crystal-pinnacle' as const },
    ]
    expect(classifyRangeType(peaks)).toBe('himalayas')
  })
})

// ─── analyzeCrystalPeak ────────────────────────────────────────────

describe('analyzeCrystalPeak', () => {
  it('analyzes minimal content', () => {
    const peak = analyzeCrystalPeak(minimalContent, 'mini.ts')
    expect(peak.file).toBe('mini.ts')
    expect(peak.qualityScore).toBeLessThanOrEqual(10)
    expect(peak.condition).toBe('dust')
    expect(peak.crystallineStructure).toBeLessThanOrEqual(10)
    expect(peak.peakClarity).toBeLessThanOrEqual(10)
    expect(peak.facetPrecision).toBeLessThanOrEqual(10)
    expect(peak.frostResilience).toBeLessThanOrEqual(10)
    expect(peak.summitWisdom).toBeLessThanOrEqual(10)
  })

  it('analyzes moderate content', () => {
    const peak = analyzeCrystalPeak(moderateContent, 'mod.ts')
    expect(peak.file).toBe('mod.ts')
    expect(peak.qualityScore).toBeGreaterThan(20)
    expect(peak.qualityScore).toBeLessThan(70)
  })

  it('analyzes rich content', () => {
    const peak = analyzeCrystalPeak(richContent, 'rich.ts')
    expect(peak.file).toBe('rich.ts')
    expect(peak.qualityScore).toBe(100)
    expect(peak.condition).toBe('crystal-pinnacle')
    expect(peak.crystallineStructure).toBe(100)
    expect(peak.peakClarity).toBe(100)
    expect(peak.facetPrecision).toBe(100)
    expect(peak.frostResilience).toBe(100)
    expect(peak.summitWisdom).toBe(100)
  })
})

// ─── analyzeCrystalRange ───────────────────────────────────────────

describe('analyzeCrystalRange', () => {
  it('handles empty peaks', () => {
    const range = analyzeCrystalRange([], 'empty')
    expect(range.directory).toBe('empty')
    expect(range.peaks).toHaveLength(0)
    expect(range.avgStructure).toBe(0)
    expect(range.avgClarity).toBe(0)
    expect(range.avgWisdom).toBe(0)
    expect(range.crystalPinnacleCount).toBe(0)
    expect(range.dustCount).toBe(0)
    expect(range.rangeType).toBe('no-range')
    expect(range.condition).toBe('void')
  })

  it('classifies range with rich peaks', () => {
    const peak = analyzeCrystalPeak(richContent, 'rich.ts')
    const range = analyzeCrystalRange([peak], 'src')
    expect(range.rangeType).toBe('himalayas')
    expect(range.crystalPinnacleCount).toBe(1)
    expect(range.dustCount).toBe(0)
    expect(range.avgStructure).toBe(100)
    expect(range.condition).toBe('crystal-kingdom')
  })

  it('classifies range with mixed peaks', () => {
    const rich = analyzeCrystalPeak(richContent, 'rich.ts')
    const minimal = analyzeCrystalPeak(minimalContent, 'mini.ts')
    const range = analyzeCrystalRange([rich, minimal], 'src')
    expect(range.peaks).toHaveLength(2)
    expect(range.crystalPinnacleCount).toBe(1)
    expect(range.dustCount).toBe(1)
  })
})

// ─── buildCrystalMountainResult ────────────────────────────────────

describe('buildCrystalMountainResult', async () => {
  it('handles empty input', async () => {
    const result = await buildCrystalMountainResult([], [])
    expect(result.peaks).toHaveLength(0)
    expect(result.ranges).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallAltitude).toBe(0)
    expect(result.stats.alpinistGrade).toBe('flatlander')
    expect(result.massif.isCrystalline).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildCrystalMountainResult(['test.ts'], [richContent])
    expect(result.peaks).toHaveLength(1)
    expect(result.peaks[0].condition).toBe('crystal-pinnacle')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.crystalPinnacleCount).toBe(1)
    expect(result.stats.dustCount).toBe(0)
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildCrystalMountainResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.peaks).toHaveLength(2)
    expect(result.ranges).toHaveLength(2)
    expect(result.stats.totalRanges).toBe(2)
  })

  it('computes overall stats correctly for rich content', async () => {
    const result = await buildCrystalMountainResult(['rich.ts'], [richContent])
    expect(result.stats.overallAltitude).toBe(100)
    expect(result.stats.alpinistGrade).toBe('mountain-master')
    expect(result.stats.bestPeak).toBe('rich.ts')
    expect(result.stats.mostStructured).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.mostPrecise).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
  })

  it('computes massif correctly', async () => {
    const result = await buildCrystalMountainResult(['rich.ts'], [richContent])
    expect(result.massif.avgStructure).toBe(100)
    expect(result.massif.avgClarity).toBe(100)
    expect(result.massif.avgWisdom).toBe(100)
    expect(result.massif.isCrystalline).toBe(true)
    expect(result.massif.overallAltitude).toBe(100)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', async () => {
  it('returns perfect message when all good', async () => {
    const result = await buildCrystalMountainResult(['rich.ts'], [richContent])
    const recs = generateRecommendations(result.peaks, result.ranges, result.massif, result.stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('crystalline perfection')
  })

  it('recommends improving structure when low', async () => {
    const result = await buildCrystalMountainResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('structure') || r.includes('Crystallize'))).toBe(true)
  })

  it('recommends improving clarity when low', async () => {
    const result = await buildCrystalMountainResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('clarity') || r.includes('Ascend'))).toBe(true)
  })

  it('recommends improving precision when low', async () => {
    const result = await buildCrystalMountainResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('precision') || r.includes('facet'))).toBe(true)
  })

  it('recommends improving resilience when low', async () => {
    const result = await buildCrystalMountainResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('resilience') || r.includes('frost'))).toBe(true)
  })

  it('recommends improving wisdom when low', async () => {
    const result = await buildCrystalMountainResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('wisdom') || r.includes('summit'))).toBe(true)
  })

  it('notes dust files', async () => {
    const result = await buildCrystalMountainResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('dust'))).toBe(true)
  })

  it('lists specific dust files when <=3', async () => {
    const result = await buildCrystalMountainResult(
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
    expect(typeof colorGrade('crystal-pinnacle')).toBe('string')
    expect(typeof colorGrade('dust')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatPeakTable', () => {
  it('formats a peak', () => {
    const peak = analyzeCrystalPeak(richContent, 'rich.ts')
    const output = formatPeakTable(peak)
    expect(output).toContain('rich.ts')
    expect(output).toContain('Crystalline Structure')
    expect(output).toContain('Peak Clarity')
    expect(output).toContain('Facet Precision')
    expect(output).toContain('Frost Resilience')
    expect(output).toContain('Summit Wisdom')
  })
})

describe('formatPeaksTable', () => {
  it('returns message for empty peaks', () => {
    expect(formatPeaksTable([])).toContain('No crystal peaks')
  })

  it('formats multiple peaks', () => {
    const peaks = [
      analyzeCrystalPeak(richContent, 'rich.ts'),
      analyzeCrystalPeak(minimalContent, 'mini.ts'),
    ]
    const output = formatPeaksTable(peaks)
    expect(output).toContain('rich.ts')
    expect(output).toContain('mini.ts')
  })
})

describe('formatRangeTable', () => {
  it('formats a range', () => {
    const peak = analyzeCrystalPeak(richContent, 'rich.ts')
    const range = analyzeCrystalRange([peak], 'src')
    const output = formatRangeTable(range)
    expect(output).toContain('src')
    expect(output).toContain('Type')
  })
})

describe('formatRangesTable', () => {
  it('returns message for empty ranges', () => {
    expect(formatRangesTable([])).toContain('No crystal ranges')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildCrystalMountainResult(['rich.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Crystal Mountain Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Alpinist Grade')
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
    const result = await buildCrystalMountainResult(['rich.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Crystal Peak Analysis')
    expect(output).toContain('Crystal Ranges')
    expect(output).toContain('Crystal Mountain Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildCrystalMountainResult(['rich.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.peaks).toHaveLength(1)
    expect(parsed.stats.alpinistGrade).toBe('mountain-master')
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with var and any in structuring', () => {
    const m = measureStructuring('var x: any = 1 as any')
    expect(m.hasNoChaotic).toBe(false)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('handles content with debugger in structuring', () => {
    const m = measureStructuring('function f() { debugger }')
    expect(m.hasNoHaphazard).toBe(false)
  })

  it('handles content with eval in ascending', () => {
    const m = measureAscending('eval("1")')
    expect(m.hasNoArcane).toBe(false)
  })

  it('handles content with var in faceting', () => {
    const m = measureFaceting('var x = 1')
    expect(m.hasNoVague).toBe(false)
    expect(m.sloppyCount).toBe(1)
  })

  it('handles content with var in enduring', () => {
    const m = measureEnduring('var x = 1')
    expect(m.hasNoUntested).toBe(false)
    expect(m.untestedCount).toBe(1)
  })

  it('handles content with eval in elevating', () => {
    const m = measureElevating('eval("1")')
    expect(m.hasNoHacky).toBe(false)
  })

  it('peak quality score is average of 5 measures', () => {
    const peak = analyzeCrystalPeak(richContent, 'rich.ts')
    const expected = Math.round(
      peak.crystallineStructure * 0.2 +
      peak.peakClarity * 0.2 +
      peak.facetPrecision * 0.2 +
      peak.frostResilience * 0.2 +
      peak.summitWisdom * 0.2,
    )
    expect(peak.qualityScore).toBe(expected)
  })

  it('overall altitude is average of structure, clarity, wisdom', async () => {
    const result = await buildCrystalMountainResult(['rich.ts'], [richContent])
    const expectedAltitude = Math.round((100 + 100 + 100) / 3)
    expect(result.stats.overallAltitude).toBe(expectedAltitude)
  })
})
