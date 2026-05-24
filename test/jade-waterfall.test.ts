import { describe, it, expect } from 'vitest'
import {
  measureFlowing,
  measureCascading,
  measurePooling,
  measureCleansing,
  measureKnowing,
  analyzeJadeDrop,
  analyzeJadeBasin,
  classifyDropCondition,
  classifyBasinType,
  classifyBasinCondition,
  classifyNavigatorGrade,
  generateRecommendations,
  buildJadeWaterfallResult,
  gatherFiles,
} from '../src/commands/jade-waterfall-helpers.js'
import {
  colorScore,
  colorGrade,
  formatDropTable,
  formatDropsTable,
  formatBasinTable,
  formatBasinsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/jade-waterfall-format-helpers.js'

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

// ─── measureFlowing ────────────────────────────────────────────────

describe('measureFlowing', () => {
  it('returns low grace for minimal content', () => {
    const m = measureFlowing(minimalContent)
    expect(m.grace).toBeLessThanOrEqual(15)
    expect(m.hasHighGrace).toBe(false)
    expect(m.hasSmoothFlow).toBe(false)
    expect(m.hasNoBottlenecks).toBe(true)
    expect(m.hasStreamlined).toBe(false)
    expect(m.hasDirectPaths).toBe(false)
    expect(m.hasEfficient).toBe(false)
    expect(m.hasGraceful).toBe(false)
    expect(m.hasNoJerky).toBe(true)
    expect(m.bottleneckCount).toBe(0)
    expect(m.tangledCount).toBe(0)
  })

  it('returns high grace for rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.grace).toBeGreaterThan(40)
    expect(m.hasSmoothFlow).toBe(true)
    expect(m.hasStreamlined).toBe(true)
    expect(m.hasNoBottlenecks).toBe(true)
  })

  it('detects var as jerky', () => {
    const m = measureFlowing('var x = 1')
    expect(m.hasNoJerky).toBe(false)
  })

  it('detects pipeline as smooth', () => {
    const m = measureFlowing('const r = [1,2,3].map(x => x * 2).filter(x => x > 2)')
    expect(m.hasSmoothFlow).toBe(true)
    expect(m.hasCleanPipelines).toBe(true)
  })

  it('detects async/await as smooth', () => {
    const m = measureFlowing('async function f() { await g() }')
    expect(m.hasSmoothFlow).toBe(true)
  })

  it('grace is within 0-100', () => {
    const m = measureFlowing(richContent)
    expect(m.grace).toBeLessThanOrEqual(100)
    expect(m.grace).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureCascading ──────────────────────────────────────────────

describe('measureCascading', () => {
  it('returns low clarity for minimal content', () => {
    const m = measureCascading(minimalContent)
    expect(m.clarity).toBeLessThanOrEqual(15)
    expect(m.hasHighClarity).toBe(false)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasVisible).toBe(false)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('returns moderate clarity for moderate content', () => {
    const m = measureCascading(moderateContent)
    expect(m.clarity).toBeGreaterThan(20)
    expect(m.hasReadable).toBe(true)
    expect(m.hasVisible).toBe(true)
  })

  it('returns high clarity for rich content', () => {
    const m = measureCascading(richContent)
    expect(m.clarity).toBeGreaterThan(50)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
  })

  it('detects eval as cryptic', () => {
    const m = measureCascading('eval("1")')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBe(1)
  })

  it('detects debugger as obfuscated', () => {
    const m = measureCascading('function f() { debugger }')
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.obfuscatedCount).toBe(1)
  })

  it('classifies step correctly', () => {
    expect(measureCascading(minimalContent).step).toBe('no-cascade')
  })
})

// ─── measurePooling ────────────────────────────────────────────────

describe('measurePooling', () => {
  it('returns low depth for minimal content', () => {
    const m = measurePooling(minimalContent)
    expect(m.depth).toBeLessThanOrEqual(15)
    expect(m.hasHighDepth).toBe(false)
    expect(m.hasAbstracted).toBe(false)
    expect(m.hasLayered).toBe(false)
    expect(m.hasModular).toBe(false)
    expect(m.overComplexCount).toBe(0)
    expect(m.leakyCount).toBe(0)
  })

  it('returns high depth for rich content', () => {
    const m = measurePooling(richContent)
    expect(m.depth).toBeGreaterThan(40)
    expect(m.hasAbstracted).toBe(true)
    expect(m.hasEncapsulated).toBe(true)
    expect(m.hasNoLeaky).toBe(true)
  })

  it('detects var as leaky', () => {
    const m = measurePooling('var x = 1')
    expect(m.hasNoLeaky).toBe(false)
    expect(m.leakyCount).toBe(1)
  })

  it('detects any as leaky', () => {
    const m = measurePooling('const x: any = 1')
    expect(m.hasNoLeaky).toBe(false)
    expect(m.leakyCount).toBe(1)
  })

  it('depth is within 0-100', () => {
    const m = measurePooling(richContent)
    expect(m.depth).toBeLessThanOrEqual(100)
    expect(m.depth).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureCleansing ──────────────────────────────────────────────

describe('measureCleansing', () => {
  it('returns low purity for minimal content', () => {
    const m = measureCleansing(minimalContent)
    expect(m.purity).toBeLessThanOrEqual(15)
    expect(m.hasHighPurity).toBe(false)
    expect(m.hasCleanOutput).toBe(true)
    expect(m.hasNoSideEffects).toBe(true)
    expect(m.hasPure).toBe(false)
    expect(m.sideEffectCount).toBe(0)
    expect(m.hackyCount).toBe(0)
  })

  it('returns moderate purity for moderate content', () => {
    const m = measureCleansing(moderateContent)
    expect(m.purity).toBeGreaterThan(20)
    expect(m.hasCleanOutput).toBe(true)
  })

  it('returns high purity for rich content', () => {
    const m = measureCleansing(richContent)
    expect(m.purity).toBeGreaterThan(40)
    expect(m.hasNoImpure).toBe(true)
    expect(m.hasNoHacky).toBe(true)
  })

  it('detects eval as side effect', () => {
    const m = measureCleansing('eval("x")')
    expect(m.hasNoSideEffects).toBe(false)
    expect(m.sideEffectCount).toBe(1)
  })

  it('detects as any as hacky', () => {
    const m = measureCleansing('const x = y as any')
    expect(m.hasNoHacky).toBe(false)
    expect(m.hackyCount).toBe(1)
  })

  it('purity is within 0-100', () => {
    const m = measureCleansing(richContent)
    expect(m.purity).toBeLessThanOrEqual(100)
    expect(m.purity).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns low wisdom for minimal content', () => {
    const m = measureKnowing(minimalContent)
    expect(m.wisdom).toBeLessThanOrEqual(15)
    expect(m.hasHighWisdom).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellStructured).toBe(false)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hasNoHacky).toBe(true)
    expect(m.adHocCount).toBe(0)
    expect(m.hackyCount).toBe(0)
  })

  it('returns high wisdom for rich content', () => {
    const m = measureKnowing(richContent)
    expect(m.wisdom).toBeGreaterThan(50)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasNoAdHoc).toBe(true)
  })

  it('detects var as adHoc', () => {
    const m = measureKnowing('var x = 1')
    expect(m.hasNoAdHoc).toBe(false)
    expect(m.adHocCount).toBe(1)
  })

  it('detects as any as hacky', () => {
    const m = measureKnowing('const x = y as any')
    expect(m.hasNoHacky).toBe(false)
    expect(m.hackyCount).toBe(1)
  })

  it('detects debugger as naive', () => {
    const m = measureKnowing('function f() { debugger }')
    expect(m.hasNoNaive).toBe(false)
  })
})

// ─── Classification Functions ──────────────────────────────────────

describe('classifyDropCondition', () => {
  it('classifies jade-masterpiece', () => expect(classifyDropCondition(92)).toBe('jade-masterpiece'))
  it('classifies emerald-falls', () => expect(classifyDropCondition(78)).toBe('emerald-falls'))
  it('classifies proper-waterfall', () => expect(classifyDropCondition(65)).toBe('proper-waterfall'))
  it('classifies murky-cascade', () => expect(classifyDropCondition(45)).toBe('murky-cascade'))
  it('classifies trickle', () => expect(classifyDropCondition(25)).toBe('trickle'))
  it('classifies dry-bed', () => expect(classifyDropCondition(10)).toBe('dry-bed'))
})

describe('classifyBasinCondition', () => {
  it('classifies magnificent-falls', () => expect(classifyBasinCondition(88)).toBe('magnificent-falls'))
  it('classifies beautiful-cascade', () => expect(classifyBasinCondition(72)).toBe('beautiful-cascade'))
  it('classifies proper-waterfall', () => expect(classifyBasinCondition(58)).toBe('proper-waterfall'))
  it('classifies murky-stream', () => expect(classifyBasinCondition(38)).toBe('murky-stream'))
  it('classifies dried-river', () => expect(classifyBasinCondition(18)).toBe('dried-river'))
  it('classifies void', () => expect(classifyBasinCondition(5)).toBe('void'))
})

describe('classifyNavigatorGrade', () => {
  it('classifies master-navigator', () => expect(classifyNavigatorGrade(88)).toBe('master-navigator'))
  it('classifies river-guide', () => expect(classifyNavigatorGrade(72)).toBe('river-guide'))
  it('classifies skilled-rafter', () => expect(classifyNavigatorGrade(58)).toBe('skilled-rafter'))
  it('classifies apprentice', () => expect(classifyNavigatorGrade(42)).toBe('apprentice'))
  it('classifies novice', () => expect(classifyNavigatorGrade(22)).toBe('novice'))
  it('classifies landlubber', () => expect(classifyNavigatorGrade(8)).toBe('landlubber'))
})

describe('classifyBasinType', () => {
  it('returns no-basin for empty', () => {
    expect(classifyBasinType([])).toBe('no-basin')
  })
})

// ─── analyzeJadeDrop ───────────────────────────────────────────────

describe('analyzeJadeDrop', () => {
  it('analyzes minimal content', () => {
    const drop = analyzeJadeDrop(minimalContent, 'mini.ts')
    expect(drop.file).toBe('mini.ts')
    expect(drop.qualityScore).toBeLessThanOrEqual(20)
    expect(drop.condition).toBe('dry-bed')
    expect(drop.flowGrace).toBeLessThanOrEqual(15)
    expect(drop.cascadeClarity).toBeLessThanOrEqual(15)
    expect(drop.poolDepth).toBeLessThanOrEqual(15)
    expect(drop.mistPurity).toBeLessThanOrEqual(15)
    expect(drop.riverWisdom).toBeLessThanOrEqual(15)
  })

  it('analyzes rich content', () => {
    const drop = analyzeJadeDrop(richContent, 'rich.ts')
    expect(drop.file).toBe('rich.ts')
    expect(drop.qualityScore).toBeGreaterThan(30)
    expect(drop.condition).not.toBe('dry-bed')
    expect(drop.flowGrace).toBeGreaterThan(40)
    expect(drop.riverWisdom).toBeGreaterThan(40)
  })

  it('quality score is average of 5 measures', () => {
    const drop = analyzeJadeDrop(richContent, 'rich.ts')
    const expected = Math.round(
      drop.flowGrace * 0.2 +
      drop.cascadeClarity * 0.2 +
      drop.poolDepth * 0.2 +
      drop.mistPurity * 0.2 +
      drop.riverWisdom * 0.2,
    )
    expect(drop.qualityScore).toBe(expected)
  })
})

// ─── analyzeJadeBasin ──────────────────────────────────────────────

describe('analyzeJadeBasin', () => {
  it('handles empty drops', () => {
    const basin = analyzeJadeBasin([], 'empty')
    expect(basin.directory).toBe('empty')
    expect(basin.drops).toHaveLength(0)
    expect(basin.avgGrace).toBe(0)
    expect(basin.avgClarity).toBe(0)
    expect(basin.avgWisdom).toBe(0)
    expect(basin.basinType).toBe('no-basin')
    expect(basin.condition).toBe('void')
  })

  it('classifies basin with rich drops', () => {
    const drop = analyzeJadeDrop(richContent, 'rich.ts')
    const basin = analyzeJadeBasin([drop], 'src')
    expect(basin.drops).toHaveLength(1)
    expect(basin.dryBedCount).toBe(0)
    expect(basin.avgGrace).toBeGreaterThan(0)
    expect(basin.basinType).not.toBe('no-basin')
  })

  it('classifies basin with mixed drops', () => {
    const rich = analyzeJadeDrop(richContent, 'rich.ts')
    const minimal = analyzeJadeDrop(minimalContent, 'mini.ts')
    const basin = analyzeJadeBasin([rich, minimal], 'src')
    expect(basin.drops).toHaveLength(2)
    expect(basin.dryBedCount).toBe(1)
  })
})

// ─── buildJadeWaterfallResult ──────────────────────────────────────

describe('buildJadeWaterfallResult', async () => {
  it('handles empty input', async () => {
    const result = await buildJadeWaterfallResult([], [])
    expect(result.drops).toHaveLength(0)
    expect(result.basins).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFlow).toBe(0)
    expect(result.stats.navigatorGrade).toBe('landlubber')
    expect(result.river.isJade).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildJadeWaterfallResult(['test.ts'], [richContent])
    expect(result.drops).toHaveLength(1)
    expect(result.drops[0].condition).not.toBe('dry-bed')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.dryBedCount).toBe(0)
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildJadeWaterfallResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.drops).toHaveLength(2)
    expect(result.basins).toHaveLength(2)
    expect(result.stats.totalBasins).toBe(2)
  })

  it('computes river correctly', async () => {
    const result = await buildJadeWaterfallResult(['rich.ts'], [richContent])
    expect(result.river.avgGrace).toBeGreaterThan(0)
    expect(result.river.avgClarity).toBeGreaterThan(0)
    expect(result.river.avgWisdom).toBeGreaterThan(0)
    expect(typeof result.river.isJade).toBe('boolean')
    expect(result.river.overallFlow).toBeGreaterThan(0)
  })

  it('computes overall flow as avg of grace, clarity, wisdom', async () => {
    const result = await buildJadeWaterfallResult(['rich.ts'], [richContent])
    const expected = Math.round(
      (result.stats.avgFlowGrace + result.stats.avgCascadeClarity + result.stats.avgRiverWisdom) / 3,
    )
    expect(result.stats.overallFlow).toBe(expected)
  })

  it('tracks condition counts', async () => {
    const result = await buildJadeWaterfallResult(
      ['rich.ts', 'mini.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.dryBedCount).toBe(1)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('identifies best drop and extremes', async () => {
    const result = await buildJadeWaterfallResult(['rich.ts'], [richContent])
    expect(result.stats.bestDrop).toBe('rich.ts')
    expect(result.stats.mostGraceful).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.deepest).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', async () => {
  it('returns steady message when quality is good', async () => {
    const result = await buildJadeWaterfallResult(['rich.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('recommends improving flow when low', async () => {
    const result = await buildJadeWaterfallResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('flow') || r.includes('pipeline'))).toBe(true)
  })

  it('recommends improving clarity when low', async () => {
    const result = await buildJadeWaterfallResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('cascade') || r.includes('doc'))).toBe(true)
  })

  it('recommends improving depth when low', async () => {
    const result = await buildJadeWaterfallResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('pool') || r.includes('interface'))).toBe(true)
  })

  it('recommends improving purity when low', async () => {
    const result = await buildJadeWaterfallResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('mist') || r.includes('eval'))).toBe(true)
  })

  it('recommends improving wisdom when low', async () => {
    const result = await buildJadeWaterfallResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('wisdom') || r.includes('JSDoc'))).toBe(true)
  })

  it('notes dry files', async () => {
    const result = await buildJadeWaterfallResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('dry') || r.includes('Dry'))).toBe(true)
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
    expect(typeof colorGrade('jade-masterpiece')).toBe('string')
    expect(typeof colorGrade('dry-bed')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatDropTable', () => {
  it('formats a drop', () => {
    const drop = analyzeJadeDrop(richContent, 'rich.ts')
    const output = formatDropTable(drop)
    expect(output).toContain('rich.ts')
    expect(output).toContain('Flow Grace')
    expect(output).toContain('Cascade Clarity')
    expect(output).toContain('Pool Depth')
    expect(output).toContain('Mist Purity')
    expect(output).toContain('River Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatDropsTable', () => {
  it('returns message for empty drops', () => {
    expect(formatDropsTable([])).toContain('No jade drops')
  })
})

describe('formatBasinTable', () => {
  it('formats a basin', () => {
    const drop = analyzeJadeDrop(richContent, 'rich.ts')
    const basin = analyzeJadeBasin([drop], 'src')
    const output = formatBasinTable(basin)
    expect(output).toContain('src')
    expect(output).toContain('Avg Grace')
  })
})

describe('formatBasinsTable', () => {
  it('returns message for empty basins', () => {
    expect(formatBasinsTable([])).toContain('No jade basins')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildJadeWaterfallResult(['rich.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Jade Waterfall Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Navigator Grade')
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
    const result = await buildJadeWaterfallResult(['rich.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Jade Drop Analysis')
    expect(output).toContain('Jade Basins')
    expect(output).toContain('Jade Waterfall Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildJadeWaterfallResult(['rich.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.drops).toHaveLength(1)
    expect(parsed.stats.navigatorGrade).toBeDefined()
    expect(parsed.river.overallFlow).toBeGreaterThan(0)
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('all scores within 0-100 for varied content', () => {
    const contents = ['', 'x', minimalContent, moderateContent, richContent, 'eval("x") as any var z']
    for (const c of contents) {
      expect(measureFlowing(c).grace).toBeGreaterThanOrEqual(0)
      expect(measureFlowing(c).grace).toBeLessThanOrEqual(100)
      expect(measureCascading(c).clarity).toBeGreaterThanOrEqual(0)
      expect(measureCascading(c).clarity).toBeLessThanOrEqual(100)
      expect(measurePooling(c).depth).toBeGreaterThanOrEqual(0)
      expect(measurePooling(c).depth).toBeLessThanOrEqual(100)
      expect(measureCleansing(c).purity).toBeGreaterThanOrEqual(0)
      expect(measureCleansing(c).purity).toBeLessThanOrEqual(100)
      expect(measureKnowing(c).wisdom).toBeGreaterThanOrEqual(0)
      expect(measureKnowing(c).wisdom).toBeLessThanOrEqual(100)
    }
  })

  it('multi-dir creates multiple basins', async () => {
    const result = await buildJadeWaterfallResult(
      ['src/a.ts', 'lib/b.ts', 'src/c.ts'],
      [richContent, moderateContent, minimalContent],
    )
    expect(result.basins).toHaveLength(2)
    const srcBasin = result.basins.find(b => b.directory === 'src')
    expect(srcBasin).toBeDefined()
    expect(srcBasin!.drops).toHaveLength(2)
  })

  it('overall flow matches river', async () => {
    const result = await buildJadeWaterfallResult(['rich.ts'], [richContent])
    expect(result.stats.overallFlow).toBe(result.river.overallFlow)
  })
})
