import { describe, it, expect } from 'vitest'
import {
  measureStrengthening, measureWeaving, measureDyeing, measureLooming, measureCounting,
  classifyStrandCondition, classifyLoomType, classifyWeaverGrade, classifyFabricCondition,
  generateRecommendations, analyzeSilkStrand, analyzeSilkLoom,
  buildSilkThreadResult,
} from '../src/commands/silk-thread-helpers.js'
import {
  colorScore, colorGrade, formatStrandTable, formatStrandsTable,
  formatLoomTable, formatLoomsTable, formatStatsTable,
  formatRecommendations, formatResultTable, formatResultJson,
} from '../src/commands/silk-thread-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const EMPTY = ''

const RICH = [
  '/**',
  ' * Doc comment',
  ' */',
  'export interface Foo<T> { readonly bar: string }',
  'export type Result = string | number',
  'export class MyClass {',
  '  private x: number = 0',
  '}',
  'export const fn = async (): Promise<string> => {',
  '  const a: string = \'hello\'',
  '  if (a === \'test\') { return a }',
  '  return \'world\'',
  '}',
  'import path from \'node:path\'',
].join('\n')

const MINIMAL = 'const x = 1'

const BAD = 'export var x: any = 1; var y: any = 2; debugger;'

// ─── measureStrengthening ──────────────────────────────────────────

describe('measureStrengthening', () => {
  it('returns tensile=0 and snapped for empty content', () => {
    const m = measureStrengthening(EMPTY)
    expect(m.tensile).toBe(0)
    expect(m.grade).toBe('snapped')
  })

  it('returns tensile=100 and spider-silk for rich content', () => {
    const m = measureStrengthening(RICH)
    expect(m.tensile).toBe(100)
    expect(m.grade).toBe('spider-silk')
  })

  it('returns tensile=8 for minimal content (only const)', () => {
    expect(measureStrengthening(MINIMAL).tensile).toBe(8)
  })

  it('detects fragile and breakable in bad content', () => {
    const m = measureStrengthening(BAD)
    expect(m.fragileCount).toBe(2)
    expect(m.breakableCount).toBe(2)
    expect(m.hasNoFragile).toBe(false)
    expect(m.hasNoBreakable).toBe(false)
  })

  it('sets hasHighTensile=true for rich content', () => {
    expect(measureStrengthening(RICH).hasHighTensile).toBe(true)
  })

  it('sets hasHighTensile=false for empty content', () => {
    expect(measureStrengthening(EMPTY).hasHighTensile).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureStrengthening(RICH)
    expect(m.hasStrong).toBe(true)
    expect(m.hasDurable).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasTough).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasSturdy).toBe(true)
  })

  it('detects debugger via hasNoFlimsy=false for bad content', () => {
    expect(measureStrengthening(BAD).hasNoFlimsy).toBe(false)
  })

  it('has no weak for clean content', () => {
    expect(measureStrengthening(RICH).hasNoWeak).toBe(true)
    expect(measureStrengthening(MINIMAL).hasNoWeak).toBe(true)
  })
})

// ─── measureWeaving ────────────────────────────────────────────────

describe('measureWeaving', () => {
  it('returns quality=0 and unraveled for empty content', () => {
    const m = measureWeaving(EMPTY)
    expect(m.quality).toBe(0)
    expect(m.weave).toBe('unraveled')
  })

  it('returns quality=100 and damask for rich content', () => {
    const m = measureWeaving(RICH)
    expect(m.quality).toBe(100)
    expect(m.weave).toBe('damask')
  })

  it('returns quality=8 for minimal content (only const)', () => {
    expect(measureWeaving(MINIMAL).quality).toBe(8)
  })

  it('detects separated and fragmented in bad content', () => {
    const m = measureWeaving(BAD)
    expect(m.separatedCount).toBe(2)
    expect(m.fragmentedCount).toBe(2)
    expect(m.hasNoSeparated).toBe(false)
    expect(m.hasNoFragmented).toBe(false)
  })

  it('sets hasHighQuality=true for rich content', () => {
    expect(measureWeaving(RICH).hasHighQuality).toBe(true)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureWeaving(RICH)
    expect(m.hasIntegrated).toBe(true)
    expect(m.hasConnected).toBe(true)
    expect(m.hasCohesive).toBe(true)
    expect(m.hasWoven).toBe(true)
    expect(m.hasInterlocked).toBe(true)
    expect(m.hasSeamless).toBe(true)
  })

  it('detects debugger via hasNoGapping=false for bad content', () => {
    expect(measureWeaving(BAD).hasNoGapping).toBe(false)
  })

  it('has no loose for clean content', () => {
    expect(measureWeaving(RICH).hasNoLoose).toBe(true)
  })
})

// ─── measureDyeing ─────────────────────────────────────────────────

describe('measureDyeing', () => {
  it('returns consistency=0 and bleached for empty content', () => {
    const m = measureDyeing(EMPTY)
    expect(m.consistency).toBe(0)
    expect(m.dye).toBe('bleached')
  })

  it('returns consistency=100 and uniform-color for rich content', () => {
    const m = measureDyeing(RICH)
    expect(m.consistency).toBe(100)
    expect(m.dye).toBe('uniform-color')
  })

  it('returns consistency=10 for minimal content (only const)', () => {
    expect(measureDyeing(MINIMAL).consistency).toBe(10)
  })

  it('detects mismatched and clashing in bad content', () => {
    const m = measureDyeing(BAD)
    expect(m.mismatchedCount).toBe(2)
    expect(m.clashingCount).toBe(2)
    expect(m.hasNoMismatched).toBe(false)
    expect(m.hasNoClashing).toBe(false)
  })

  it('sets hasHighConsistency=true for rich content', () => {
    expect(measureDyeing(RICH).hasHighConsistency).toBe(true)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureDyeing(RICH)
    expect(m.hasUniform).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasHarmonious).toBe(true)
    expect(m.hasEven).toBe(true)
    expect(m.hasMatching).toBe(true)
    expect(m.hasCoherent).toBe(true)
  })

  it('detects debugger via hasNoConflicting=false for bad content', () => {
    expect(measureDyeing(BAD).hasNoConflicting).toBe(false)
  })

  it('has no uneven for clean content', () => {
    expect(measureDyeing(RICH).hasNoUneven).toBe(true)
  })
})

// ─── measureLooming ────────────────────────────────────────────────

describe('measureLooming', () => {
  it('returns precision=0 and broken-loom for empty content', () => {
    const m = measureLooming(EMPTY)
    expect(m.precision).toBe(0)
    expect(m.loom).toBe('broken-loom')
  })

  it('returns precision=100 and master-loom for rich content', () => {
    const m = measureLooming(RICH)
    expect(m.precision).toBe(100)
    expect(m.loom).toBe('master-loom')
  })

  it('returns precision=8 for minimal content (only const)', () => {
    expect(measureLooming(MINIMAL).precision).toBe(8)
  })

  it('detects imprecise and sloppy in bad content', () => {
    const m = measureLooming(BAD)
    expect(m.impreciseCount).toBe(2)
    expect(m.sloppyCount).toBe(2)
    expect(m.hasNoImprecise).toBe(false)
    expect(m.hasNoSloppy).toBe(false)
  })

  it('sets hasHighPrecision=true for rich content', () => {
    expect(measureLooming(RICH).hasHighPrecision).toBe(true)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureLooming(RICH)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasCalibrated).toBe(true)
    expect(m.hasSharp).toBe(true)
    expect(m.hasDefined).toBe(true)
  })

  it('detects debugger via hasNoBlurred=false for bad content', () => {
    expect(measureLooming(BAD).hasNoBlurred).toBe(false)
  })

  it('has no misaligned for clean content', () => {
    expect(measureLooming(RICH).hasNoMisaligned).toBe(true)
  })
})

// ─── measureCounting ───────────────────────────────────────────────

describe('measureCounting', () => {
  it('returns density=0 and gauze for empty content', () => {
    const m = measureCounting(EMPTY)
    expect(m.density).toBe(0)
    expect(m.count).toBe('gauze')
  })

  it('returns density=100 and egyptian-cotton for rich content', () => {
    const m = measureCounting(RICH)
    expect(m.density).toBe(100)
    expect(m.count).toBe('egyptian-cotton')
  })

  it('returns density=8 for minimal content (only const)', () => {
    expect(measureCounting(MINIMAL).density).toBe(8)
  })

  it('detects sparse and thin in bad content', () => {
    const m = measureCounting(BAD)
    expect(m.sparseCount).toBe(2)
    expect(m.thinCount).toBe(2)
    expect(m.hasNoSparse).toBe(false)
    expect(m.hasNoThin).toBe(false)
  })

  it('sets hasHighDensity=true for rich content', () => {
    expect(measureCounting(RICH).hasHighDensity).toBe(true)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureCounting(RICH)
    expect(m.hasDense).toBe(true)
    expect(m.hasSubstantial).toBe(true)
    expect(m.hasRich).toBe(true)
    expect(m.hasAdequate).toBe(true)
    expect(m.hasFull).toBe(true)
    expect(m.hasPlush).toBe(true)
  })

  it('detects debugger via hasNoEmpty=false for bad content', () => {
    expect(measureCounting(BAD).hasNoEmpty).toBe(false)
  })

  it('has no meager for clean content', () => {
    expect(measureCounting(RICH).hasNoMeager).toBe(true)
  })
})

// ─── classifyStrandCondition ───────────────────────────────────────

describe('classifyStrandCondition', () => {
  it('returns master-weaver for 90', () => {
    expect(classifyStrandCondition(90)).toBe('master-weaver')
  })
  it('returns fine-silk for 75', () => {
    expect(classifyStrandCondition(75)).toBe('fine-silk')
  })
  it('returns proper-thread for 60', () => {
    expect(classifyStrandCondition(60)).toBe('proper-thread')
  })
  it('returns cotton-yarn for 45', () => {
    expect(classifyStrandCondition(45)).toBe('cotton-yarn')
  })
  it('returns burlap for 30', () => {
    expect(classifyStrandCondition(30)).toBe('burlap')
  })
  it('returns shredded for 10', () => {
    expect(classifyStrandCondition(10)).toBe('shredded')
  })
})

// ─── classifyWeaverGrade ───────────────────────────────────────────

describe('classifyWeaverGrade', () => {
  it('returns master-weaver for 85', () => {
    expect(classifyWeaverGrade(85)).toBe('master-weaver')
  })
  it('returns silk-merchant for 70', () => {
    expect(classifyWeaverGrade(70)).toBe('silk-merchant')
  })
  it('returns skilled-tailor for 55', () => {
    expect(classifyWeaverGrade(55)).toBe('skilled-tailor')
  })
  it('returns seamstress for 40', () => {
    expect(classifyWeaverGrade(40)).toBe('seamstress')
  })
  it('returns apprentice for 25', () => {
    expect(classifyWeaverGrade(25)).toBe('apprentice')
  })
  it('returns rag-picker for 10', () => {
    expect(classifyWeaverGrade(10)).toBe('rag-picker')
  })
})

// ─── classifyFabricCondition ───────────────────────────────────────

describe('classifyFabricCondition', () => {
  it('returns luxury-fabric for 80', () => {
    expect(classifyFabricCondition(80)).toBe('luxury-fabric')
  })
  it('returns fine-textile for 65', () => {
    expect(classifyFabricCondition(65)).toBe('fine-textile')
  })
  it('returns decent-cloth for 50', () => {
    expect(classifyFabricCondition(50)).toBe('decent-cloth')
  })
  it('returns rough-fabric for 35', () => {
    expect(classifyFabricCondition(35)).toBe('rough-fabric')
  })
  it('returns tattered for 20', () => {
    expect(classifyFabricCondition(20)).toBe('tattered')
  })
  it('returns threads for 5', () => {
    expect(classifyFabricCondition(5)).toBe('threads')
  })
})

// ─── classifyLoomType ──────────────────────────────────────────────

describe('classifyLoomType', () => {
  it('returns no-loom for empty strands', () => {
    expect(classifyLoomType([])).toBe('no-loom')
  })

  it('returns silk-mill for all master-weaver high scores', () => {
    const strand = analyzeSilkStrand(RICH, 'a.ts')
    expect(classifyLoomType([strand])).toBe('silk-mill')
  })

  it('returns distaff for medium-low quality scores', () => {
    const strand = analyzeSilkStrand('export function foo(): void {}', 'mid.ts')
    expect(classifyLoomType([strand])).toBe('distaff')
  })

  it('returns no-loom for shredded zero scores', () => {
    const strand = analyzeSilkStrand(EMPTY, 'empty.ts')
    expect(classifyLoomType([strand])).toBe('no-loom')
  })
})

// ─── analyzeSilkStrand ─────────────────────────────────────────────

describe('analyzeSilkStrand', () => {
  it('returns qualityScore=0 and shredded for empty content', () => {
    const st = analyzeSilkStrand(EMPTY, 'empty.ts')
    expect(st.qualityScore).toBe(0)
    expect(st.condition).toBe('shredded')
    expect(st.file).toBe('empty.ts')
  })

  it('returns qualityScore=100 and master-weaver for rich content', () => {
    const st = analyzeSilkStrand(RICH, 'rich.ts')
    expect(st.qualityScore).toBe(100)
    expect(st.condition).toBe('master-weaver')
  })

  it('returns qualityScore=8 and shredded for minimal content', () => {
    const st = analyzeSilkStrand(MINIMAL, 'min.ts')
    expect(st.qualityScore).toBe(8)
    expect(st.condition).toBe('shredded')
  })

  it('returns qualityScore=9 and shredded for bad content', () => {
    const st = analyzeSilkStrand(BAD, 'bad.ts')
    expect(st.qualityScore).toBe(9)
    expect(st.condition).toBe('shredded')
  })

  it('sets all five quality score fields', () => {
    const st = analyzeSilkStrand(RICH, 'a.ts')
    expect(st.tensileStrength).toBe(100)
    expect(st.weaveQuality).toBe(100)
    expect(st.dyeConsistency).toBe(100)
    expect(st.loomPrecision).toBe(100)
    expect(st.threadCount).toBe(100)
  })

  it('contains all five measure sub-objects', () => {
    const st = analyzeSilkStrand(RICH, 'a.ts')
    expect(st.strengthening.grade).toBe('spider-silk')
    expect(st.weaving.weave).toBe('damask')
    expect(st.dyeing.dye).toBe('uniform-color')
    expect(st.looming.loom).toBe('master-loom')
    expect(st.counting.count).toBe('egyptian-cotton')
  })

  it('rich content scores higher than empty content', () => {
    const rich = analyzeSilkStrand(RICH, 'r.ts')
    const empty = analyzeSilkStrand(EMPTY, 'e.ts')
    expect(rich.qualityScore).toBeGreaterThan(empty.qualityScore)
  })
})

// ─── analyzeSilkLoom ───────────────────────────────────────────────

describe('analyzeSilkLoom', () => {
  it('returns no-loom and threads for empty strands', () => {
    const l = analyzeSilkLoom([], 'src')
    expect(l.directory).toBe('src')
    expect(l.strands).toHaveLength(0)
    expect(l.loomType).toBe('no-loom')
    expect(l.condition).toBe('threads')
    expect(l.avgTensile).toBe(0)
    expect(l.avgWeave).toBe(0)
    expect(l.avgDensity).toBe(0)
  })

  it('returns silk-mill and luxury-fabric for rich strands', () => {
    const strand = analyzeSilkStrand(RICH, 'a.ts')
    const l = analyzeSilkLoom([strand], 'src')
    expect(l.loomType).toBe('silk-mill')
    expect(l.condition).toBe('luxury-fabric')
    expect(l.masterWeaverCount).toBe(1)
    expect(l.shreddedCount).toBe(0)
  })

  it('computes correct averages from mixed strands', () => {
    const rich = analyzeSilkStrand(RICH, 'a.ts')
    const empty = analyzeSilkStrand(EMPTY, 'b.ts')
    const l = analyzeSilkLoom([rich, empty], 'src')
    expect(l.avgTensile).toBe(50)
    expect(l.avgWeave).toBe(50)
    expect(l.avgDensity).toBe(50)
    expect(l.masterWeaverCount).toBe(1)
    expect(l.shreddedCount).toBe(1)
  })

  it('preserves strands array', () => {
    const s1 = analyzeSilkStrand(RICH, 'a.ts')
    const s2 = analyzeSilkStrand(MINIMAL, 'b.ts')
    const l = analyzeSilkLoom([s1, s2], 'lib')
    expect(l.strands).toHaveLength(2)
    expect(l.directory).toBe('lib')
  })
})

// ─── buildSilkThreadResult ─────────────────────────────────────────

describe('buildSilkThreadResult', () => {
  it('returns correct structure for single rich file', async () => {
    const result = await buildSilkThreadResult(['a.ts'], [RICH])
    expect(result.strands).toHaveLength(1)
    expect(result.looms).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.weaverGrade).toBe('master-weaver')
    expect(result.fabric.isFineSilk).toBe(true)
    expect(result.fabric.overallQuality).toBe(100)
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('handles empty files array', async () => {
    const result = await buildSilkThreadResult([], [])
    expect(result.strands).toHaveLength(0)
    expect(result.looms).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalLooms).toBe(0)
    expect(result.stats.bestStrand).toBe('')
    expect(result.stats.strongest).toBe('')
    expect(result.stats.bestWoven).toBe('')
    expect(result.fabric.isFineSilk).toBe(false)
    expect(result.fabric.overallQuality).toBe(0)
  })

  it('groups strands into looms by directory', async () => {
    const result = await buildSilkThreadResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MINIMAL, BAD],
    )
    expect(result.looms).toHaveLength(2)
  })

  it('identifies best strand and strongest file', async () => {
    const result = await buildSilkThreadResult(
      ['good.ts', 'bad.ts'],
      [RICH, EMPTY],
    )
    expect(result.stats.bestStrand).toBe('good.ts')
    expect(result.stats.strongest).toBe('good.ts')
    expect(result.stats.bestWoven).toBe('good.ts')
    expect(result.stats.mostConsistent).toBe('good.ts')
    expect(result.stats.mostPrecise).toBe('good.ts')
  })

  it('handles missing contents gracefully', async () => {
    const result = await buildSilkThreadResult(['a.ts'], [])
    expect(result.strands).toHaveLength(1)
    expect(result.strands[0].qualityScore).toBe(0)
  })

  it('computes all stat fields for mixed content', async () => {
    const result = await buildSilkThreadResult(
      ['a.ts', 'b.ts'],
      [RICH, BAD],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.avgTensileStrength).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgWeaveQuality).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgDyeConsistency).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgLoomPrecision).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgThreadCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.masterWeaverCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.fineSilkCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properThreadCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.cottonYarnCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.burlapCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.shreddedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighTensileCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighQualityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighConsistencyCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighDensityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallQuality).toBeGreaterThanOrEqual(0)
    expect(typeof result.stats.weaverGrade).toBe('string')
  })

  it('computes fabric summary correctly', async () => {
    const result = await buildSilkThreadResult(['a.ts'], [RICH])
    expect(result.fabric.avgTensile).toBe(100)
    expect(result.fabric.avgWeave).toBe(100)
    expect(result.fabric.avgDensity).toBe(100)
    expect(result.fabric.isFineSilk).toBe(true)
    expect(result.fabric.overallQuality).toBe(100)
  })

  it('handles single file with no directory path', async () => {
    const result = await buildSilkThreadResult(['single.ts'], [MINIMAL])
    expect(result.looms).toHaveLength(1)
    expect(result.looms[0].directory).toBe('.')
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('gives positive recommendation for all high scores', async () => {
    const result = await buildSilkThreadResult(['a.ts'], [RICH])
    expect(result.recommendations).toEqual(
      expect.arrayContaining([expect.stringContaining('masterpiece')]),
    )
  })

  it('warns about shredded files', async () => {
    const result = await buildSilkThreadResult(['a.ts'], [EMPTY])
    expect(result.recommendations).toEqual(
      expect.arrayContaining([expect.stringContaining('shredded')]),
    )
  })

  it('provides improvement suggestions for low scores', async () => {
    const result = await buildSilkThreadResult(['a.ts'], [BAD])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('warns about poor fabric quality', async () => {
    const result = await buildSilkThreadResult(['a.ts'], [EMPTY])
    expect(result.recommendations).toEqual(
      expect.arrayContaining([expect.stringContaining('poor')]),
    )
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('silk-thread formatters', () => {
  it('colorScore returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })

  it('colorGrade returns a string for known grades', () => {
    expect(typeof colorGrade('master-weaver')).toBe('string')
    expect(typeof colorGrade('shredded')).toBe('string')
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })

  it('formatStrandTable returns string with file info', () => {
    const st = analyzeSilkStrand(RICH, 'test.ts')
    const table = formatStrandTable(st)
    expect(table).toContain('test.ts')
    expect(typeof table).toBe('string')
  })

  it('formatStrandsTable handles empty array', () => {
    expect(formatStrandsTable([])).toContain('No silk strands')
  })

  it('formatStrandsTable shows header for non-empty', () => {
    const st = analyzeSilkStrand(RICH, 'a.ts')
    const table = formatStrandsTable([st])
    expect(table).toContain('Silk Thread')
  })

  it('formatLoomTable returns string', () => {
    const st = analyzeSilkStrand(RICH, 'a.ts')
    const l = analyzeSilkLoom([st], 'src')
    const table = formatLoomTable(l)
    expect(table).toContain('src')
    expect(typeof table).toBe('string')
  })

  it('formatLoomsTable handles empty array', () => {
    expect(formatLoomsTable([])).toContain('No silk looms')
  })

  it('formatStatsTable returns string with statistics', async () => {
    const result = await buildSilkThreadResult(['a.ts'], [RICH])
    const table = formatStatsTable(result.stats)
    expect(table).toContain('Fabric Statistics')
    expect(table).toContain('Total Files')
    expect(typeof table).toBe('string')
  })

  it('formatRecommendations handles empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatRecommendations shows items', () => {
    const table = formatRecommendations(['item one', 'item two'])
    expect(table).toContain('item one')
    expect(table).toContain('item two')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildSilkThreadResult(['a.ts'], [RICH])
    const table = formatResultTable(result)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildSilkThreadResult(['a.ts', 'b.ts'], [RICH, MINIMAL])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.strands).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.fabric).toBeDefined()
    expect(parsed.looms).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
