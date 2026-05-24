import { describe, it, expect } from 'vitest'
import {
  measureForming,
  measureHoning,
  measureReflecting,
  measureKnowing,
  measureEmerging,
  analyzeObsidianShard,
  analyzeObsidianCave,
  classifyShardCondition,
  classifyCaveType,
  classifyCaveCondition,
  classifyLapidaryGrade,
  generateRecommendations,
  buildObsidianDawnResult,
  gatherFiles,
} from '../src/commands/obsidian-dawn-helpers.js'
import {
  colorScore,
  colorGrade,
  formatShardTable,
  formatShardsTable,
  formatCaveTable,
  formatCavesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/obsidian-dawn-format-helpers.js'

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

// ─── Forming Measure ───────────────────────────────────────────────

describe('measureForming', () => {
  it('returns low score for minimal content', () => {
    const m = measureForming(minimalContent)
    expect(m.clarity).toBeLessThanOrEqual(10)
    expect(m.hasHighClarity).toBe(false)
    expect(m.hasReadable).toBe(false)
    expect(m.hasTransparent).toBe(false)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasClear).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasNoMystery).toBe(true)
    expect(m.hasUnderstandable).toBe(false)
    expect(m.hasNoArcane).toBe(true)
    expect(m.hasVisible).toBe(false)
    expect(m.obfuscatedCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureForming(moderateContent)
    expect(m.clarity).toBeGreaterThan(20)
    expect(m.clarity).toBeLessThan(70)
    expect(m.hasReadable).toBe(true)
    expect(m.hasClear).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureForming(richContent)
    expect(m.clarity).toBe(100)
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.volcano).toBe('crystal-flow')
  })

  it('detects any as obfuscated', () => {
    const m = measureForming('const x: any = 1 as any')
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.obfuscatedCount).toBe(2)
  })

  it('detects var as cryptic', () => {
    const m = measureForming('var x = 1')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBe(1)
  })
})

// ─── Honing Measure ────────────────────────────────────────────────

describe('measureHoning', () => {
  it('returns low score for minimal content', () => {
    const m = measureHoning(minimalContent)
    expect(m.sharpness).toBeLessThanOrEqual(10)
    expect(m.hasHighSharpness).toBe(false)
    expect(m.hasPrecise).toBe(false)
    expect(m.hasExact).toBe(false)
    expect(m.hasNoApproximate).toBe(true)
    expect(m.hasDecisive).toBe(false)
    expect(m.hasNoAmbiguous).toBe(true)
    expect(m.hasSharp).toBe(false)
    expect(m.approximateCount).toBe(0)
    expect(m.vagueCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureHoning(moderateContent)
    expect(m.sharpness).toBeGreaterThan(20)
    expect(m.sharpness).toBeLessThan(70)
  })

  it('returns high score for rich content', () => {
    const m = measureHoning(richContent)
    expect(m.sharpness).toBe(100)
    expect(m.hasHighSharpness).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasDecisive).toBe(true)
    expect(m.hasSharp).toBe(true)
    expect(m.hasDefined).toBe(true)
    expect(m.hasCrystalline).toBe(true)
    expect(m.edge).toBe('surgical-blade')
  })

  it('detects any as approximate', () => {
    const m = measureHoning('const x: any = 1')
    expect(m.hasNoApproximate).toBe(false)
    expect(m.approximateCount).toBe(1)
  })
})

// ─── Reflecting Measure ────────────────────────────────────────────

describe('measureReflecting', () => {
  it('returns low score for minimal content', () => {
    const m = measureReflecting(minimalContent)
    expect(m.depth).toBeLessThanOrEqual(10)
    expect(m.hasHighDepth).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellCommented).toBe(false)
    expect(m.hasNoUndocumented).toBe(true)
    expect(m.hasIntrospective).toBe(false)
    expect(m.hasNoShallow).toBe(true)
    expect(m.hasSelfAware).toBe(false)
    expect(m.hasNoBlind).toBe(true)
    expect(m.hasReflective).toBe(false)
    expect(m.hasNoOpaque).toBe(true)
    expect(m.hasInsightful).toBe(false)
    expect(m.undocumentedCount).toBe(0)
    expect(m.shallowCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureReflecting(moderateContent)
    expect(m.depth).toBeGreaterThan(20)
    expect(m.depth).toBeLessThan(70)
  })

  it('returns high score for rich content', () => {
    const m = measureReflecting(richContent)
    expect(m.depth).toBe(100)
    expect(m.hasHighDepth).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellCommented).toBe(true)
    expect(m.hasIntrospective).toBe(true)
    expect(m.hasSelfAware).toBe(true)
    expect(m.hasReflective).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.mirror).toBe('scrying-mirror')
  })
})

// ─── Knowing Measure ───────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns low score for minimal content', () => {
    const m = measureKnowing(minimalContent)
    expect(m.wisdom).toBeLessThanOrEqual(10)
    expect(m.hasHighWisdom).toBe(false)
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasEdgeCaseCovered).toBe(false)
    expect(m.hasNoSinglePath).toBe(true)
    expect(m.hasValidated).toBe(false)
    expect(m.hasNoTrusting).toBe(true)
    expect(m.hasDefensive).toBe(false)
    expect(m.hasNoNaive).toBe(true)
    expect(m.hasBattleTested).toBe(false)
    expect(m.hasNoOptimistic).toBe(false)
    expect(m.bareCrashCount).toBe(0)
    expect(m.singlePathCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureKnowing(moderateContent)
    expect(m.wisdom).toBeGreaterThan(10)
    expect(m.wisdom).toBeLessThan(70)
  })

  it('returns high score for rich content', () => {
    const m = measureKnowing(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasEdgeCaseCovered).toBe(true)
    expect(m.hasValidated).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasBattleTested).toBe(true)
    expect(m.hasNoOptimistic).toBe(true)
    expect(m.darkness).toBe('ancient-wisdom')
  })

  it('detects var as bareCrash', () => {
    const m = measureKnowing('var x = 1')
    expect(m.hasNoBareCrash).toBe(false)
    expect(m.bareCrashCount).toBe(1)
  })
})

// ─── Emerging Measure ──────────────────────────────────────────────

describe('measureEmerging', () => {
  it('returns low score for minimal content', () => {
    const m = measureEmerging(minimalContent)
    expect(m.emergence).toBeLessThanOrEqual(10)
    expect(m.hasHighEmergence).toBe(false)
    expect(m.hasSimplified).toBe(false)
    expect(m.hasNoOverComplex).toBe(true)
    expect(m.hasAbstracted).toBe(false)
    expect(m.hasNoConcreteSoup).toBe(true)
    expect(m.hasClean).toBe(false)
    expect(m.hasNoSpaghetti).toBe(true)
    expect(m.hasElegant).toBe(false)
    expect(m.hasNoClunky).toBe(true)
    expect(m.hasClear).toBe(false)
    expect(m.hasNoMurky).toBe(false)
    expect(m.overComplexCount).toBe(0)
    expect(m.spaghettiCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureEmerging(moderateContent)
    expect(m.emergence).toBeGreaterThan(20)
    expect(m.emergence).toBeLessThan(70)
    expect(m.hasSimplified).toBe(true)
    expect(m.hasAbstracted).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureEmerging(richContent)
    expect(m.emergence).toBe(100)
    expect(m.hasHighEmergence).toBe(true)
    expect(m.hasSimplified).toBe(true)
    expect(m.hasAbstracted).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasElegant).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasNoMurky).toBe(true)
    expect(m.dawn).toBe('sunrise-revelation')
  })

  it('detects var as overComplex', () => {
    const m = measureEmerging('var x = 1')
    expect(m.hasNoOverComplex).toBe(false)
    expect(m.overComplexCount).toBe(1)
  })
})

// ─── Classification Functions ──────────────────────────────────────

describe('classifyShardCondition', () => {
  it('classifies volcanic-masterpiece', () => expect(classifyShardCondition(90)).toBe('volcanic-masterpiece'))
  it('classifies razor-obsidian', () => expect(classifyShardCondition(75)).toBe('razor-obsidian'))
  it('classifies proper-glass', () => expect(classifyShardCondition(60)).toBe('proper-glass'))
  it('classifies rough-stone', () => expect(classifyShardCondition(45)).toBe('rough-stone'))
  it('classifies gravel', () => expect(classifyShardCondition(30)).toBe('gravel'))
  it('classifies dust', () => expect(classifyShardCondition(10)).toBe('dust'))
})

describe('classifyCaveCondition', () => {
  it('classifies magnificent-grotto', () => expect(classifyCaveCondition(80)).toBe('magnificent-grotto'))
  it('classifies beautiful-cavern', () => expect(classifyCaveCondition(65)).toBe('beautiful-cavern'))
  it('classifies proper-cave', () => expect(classifyCaveCondition(50)).toBe('proper-cave'))
  it('classifies rough-tunnel', () => expect(classifyCaveCondition(35)).toBe('rough-tunnel'))
  it('classifies collapsed-mine', () => expect(classifyCaveCondition(20)).toBe('collapsed-mine'))
  it('classifies void', () => expect(classifyCaveCondition(5)).toBe('void'))
})

describe('classifyLapidaryGrade', () => {
  it('classifies master-flintknapper', () => expect(classifyLapidaryGrade(85)).toBe('master-flintknapper'))
  it('classifies expert-knapper', () => expect(classifyLapidaryGrade(70)).toBe('expert-knapper'))
  it('classifies skilled-shaper', () => expect(classifyLapidaryGrade(55)).toBe('skilled-shaper'))
  it('classifies apprentice', () => expect(classifyLapidaryGrade(40)).toBe('apprentice'))
  it('classifies novice', () => expect(classifyLapidaryGrade(25)).toBe('novice'))
  it('classifies rock-collector', () => expect(classifyLapidaryGrade(10)).toBe('rock-collector'))
})

describe('classifyCaveType', () => {
  it('returns no-cave for empty', () => {
    expect(classifyCaveType([])).toBe('no-cave')
  })

  it('returns volcanic-chamber for all volcanic-masterpiece', () => {
    const shards = [
      { ...analyzeObsidianShard(richContent, 'a.ts'), condition: 'volcanic-masterpiece' as const },
      { ...analyzeObsidianShard(richContent, 'b.ts'), condition: 'volcanic-masterpiece' as const },
    ]
    expect(classifyCaveType(shards)).toBe('volcanic-chamber')
  })
})

// ─── analyzeObsidianShard ──────────────────────────────────────────

describe('analyzeObsidianShard', () => {
  it('analyzes minimal content', () => {
    const shard = analyzeObsidianShard(minimalContent, 'mini.ts')
    expect(shard.file).toBe('mini.ts')
    expect(shard.qualityScore).toBeLessThanOrEqual(10)
    expect(shard.condition).toBe('dust')
    expect(shard.volcanicClarity).toBeLessThanOrEqual(10)
    expect(shard.edgeSharpness).toBeLessThanOrEqual(10)
    expect(shard.mirrorDepth).toBeLessThanOrEqual(10)
    expect(shard.darkWisdom).toBeLessThanOrEqual(10)
    expect(shard.dawnEmergence).toBeLessThanOrEqual(10)
  })

  it('analyzes moderate content', () => {
    const shard = analyzeObsidianShard(moderateContent, 'mod.ts')
    expect(shard.file).toBe('mod.ts')
    expect(shard.qualityScore).toBeGreaterThan(20)
    expect(shard.qualityScore).toBeLessThan(70)
  })

  it('analyzes rich content', () => {
    const shard = analyzeObsidianShard(richContent, 'rich.ts')
    expect(shard.file).toBe('rich.ts')
    expect(shard.qualityScore).toBe(100)
    expect(shard.condition).toBe('volcanic-masterpiece')
    expect(shard.volcanicClarity).toBe(100)
    expect(shard.edgeSharpness).toBe(100)
    expect(shard.mirrorDepth).toBe(100)
    expect(shard.darkWisdom).toBe(100)
    expect(shard.dawnEmergence).toBe(100)
  })
})

// ─── analyzeObsidianCave ───────────────────────────────────────────

describe('analyzeObsidianCave', () => {
  it('handles empty shards', () => {
    const cave = analyzeObsidianCave([], 'empty')
    expect(cave.directory).toBe('empty')
    expect(cave.shards).toHaveLength(0)
    expect(cave.avgClarity).toBe(0)
    expect(cave.avgSharpness).toBe(0)
    expect(cave.avgWisdom).toBe(0)
    expect(cave.volcanicMasterpieceCount).toBe(0)
    expect(cave.dustCount).toBe(0)
    expect(cave.caveType).toBe('no-cave')
    expect(cave.condition).toBe('void')
  })

  it('classifies cave with rich shards', () => {
    const shard = analyzeObsidianShard(richContent, 'rich.ts')
    const cave = analyzeObsidianCave([shard], 'src')
    expect(cave.caveType).toBe('volcanic-chamber')
    expect(cave.volcanicMasterpieceCount).toBe(1)
    expect(cave.dustCount).toBe(0)
    expect(cave.avgClarity).toBe(100)
    expect(cave.condition).toBe('magnificent-grotto')
  })

  it('classifies cave with mixed shards', () => {
    const rich = analyzeObsidianShard(richContent, 'rich.ts')
    const minimal = analyzeObsidianShard(minimalContent, 'mini.ts')
    const cave = analyzeObsidianCave([rich, minimal], 'src')
    expect(cave.shards).toHaveLength(2)
    expect(cave.volcanicMasterpieceCount).toBe(1)
    expect(cave.dustCount).toBe(1)
  })
})

// ─── buildObsidianDawnResult ───────────────────────────────────────

describe('buildObsidianDawnResult', async () => {
  it('handles empty input', async () => {
    const result = await buildObsidianDawnResult([], [])
    expect(result.shards).toHaveLength(0)
    expect(result.caves).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallLuminosity).toBe(0)
    expect(result.stats.lapidaryGrade).toBe('rock-collector')
    expect(result.volcano.isVolcanic).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildObsidianDawnResult(['test.ts'], [richContent])
    expect(result.shards).toHaveLength(1)
    expect(result.shards[0].condition).toBe('volcanic-masterpiece')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.volcanicMasterpieceCount).toBe(1)
    expect(result.stats.dustCount).toBe(0)
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildObsidianDawnResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.shards).toHaveLength(2)
    expect(result.caves).toHaveLength(2)
    expect(result.stats.totalCaves).toBe(2)
  })

  it('computes overall stats correctly for rich content', async () => {
    const result = await buildObsidianDawnResult(['rich.ts'], [richContent])
    expect(result.stats.overallLuminosity).toBe(100)
    expect(result.stats.lapidaryGrade).toBe('master-flintknapper')
    expect(result.stats.bestShard).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.sharpest).toBe('rich.ts')
    expect(result.stats.deepest).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
  })

  it('computes volcano correctly', async () => {
    const result = await buildObsidianDawnResult(['rich.ts'], [richContent])
    expect(result.volcano.avgClarity).toBe(100)
    expect(result.volcano.avgSharpness).toBe(100)
    expect(result.volcano.avgWisdom).toBe(100)
    expect(result.volcano.isVolcanic).toBe(true)
    expect(result.volcano.overallLuminosity).toBe(100)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', async () => {
  it('returns perfect message when all good', async () => {
    const result = await buildObsidianDawnResult(['rich.ts'], [richContent])
    const recs = generateRecommendations(result.shards, result.caves, result.volcano, result.stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('volcanic perfection')
  })

  it('recommends improving clarity when low', async () => {
    const result = await buildObsidianDawnResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('clarity') || r.includes('obsidian'))).toBe(true)
  })

  it('recommends improving sharpness when low', async () => {
    const result = await buildObsidianDawnResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('sharp') || r.includes('edge'))).toBe(true)
  })

  it('recommends improving depth when low', async () => {
    const result = await buildObsidianDawnResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('mirror') || r.includes('depth'))).toBe(true)
  })

  it('recommends improving wisdom when low', async () => {
    const result = await buildObsidianDawnResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('wisdom') || r.includes('error'))).toBe(true)
  })

  it('recommends improving emergence when low', async () => {
    const result = await buildObsidianDawnResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('dawn') || r.includes('emerge'))).toBe(true)
  })

  it('notes dust files', async () => {
    const result = await buildObsidianDawnResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('dust'))).toBe(true)
  })

  it('lists specific dust files when <=3', async () => {
    const result = await buildObsidianDawnResult(
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
    expect(typeof colorGrade('volcanic-masterpiece')).toBe('string')
    expect(typeof colorGrade('dust')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatShardTable', () => {
  it('formats a shard', () => {
    const shard = analyzeObsidianShard(richContent, 'rich.ts')
    const output = formatShardTable(shard)
    expect(output).toContain('rich.ts')
    expect(output).toContain('Volcanic Clarity')
    expect(output).toContain('Edge Sharpness')
    expect(output).toContain('Mirror Depth')
    expect(output).toContain('Dark Wisdom')
    expect(output).toContain('Dawn Emergence')
  })
})

describe('formatShardsTable', () => {
  it('returns message for empty shards', () => {
    expect(formatShardsTable([])).toContain('No obsidian shards')
  })

  it('formats multiple shards', () => {
    const shards = [
      analyzeObsidianShard(richContent, 'rich.ts'),
      analyzeObsidianShard(minimalContent, 'mini.ts'),
    ]
    const output = formatShardsTable(shards)
    expect(output).toContain('rich.ts')
    expect(output).toContain('mini.ts')
  })
})

describe('formatCaveTable', () => {
  it('formats a cave', () => {
    const shard = analyzeObsidianShard(richContent, 'rich.ts')
    const cave = analyzeObsidianCave([shard], 'src')
    const output = formatCaveTable(cave)
    expect(output).toContain('src')
    expect(output).toContain('Type')
  })
})

describe('formatCavesTable', () => {
  it('returns message for empty caves', () => {
    expect(formatCavesTable([])).toContain('No obsidian caves')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildObsidianDawnResult(['rich.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Obsidian Dawn Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Lapidary Grade')
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
    const result = await buildObsidianDawnResult(['rich.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Obsidian Shard Analysis')
    expect(output).toContain('Obsidian Caves')
    expect(output).toContain('Obsidian Dawn Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildObsidianDawnResult(['rich.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.shards).toHaveLength(1)
    expect(parsed.stats.lapidaryGrade).toBe('master-flintknapper')
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with var and any in forming', () => {
    const m = measureForming('var x: any = 1 as any')
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('handles content with debugger in forming', () => {
    const m = measureForming('function f() { debugger }')
    expect(m.hasNoArcane).toBe(false)
  })

  it('handles content with eval in honing', () => {
    const m = measureHoning('eval("1")')
    expect(m.hasNoVague).toBe(false)
  })

  it('handles content with debugger in reflecting', () => {
    const m = measureReflecting('function f() { debugger }')
    expect(m.hasNoOpaque).toBe(false)
  })

  it('handles content with var in knowing', () => {
    const m = measureKnowing('var x = 1')
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('handles content with debugger in emerging', () => {
    const m = measureEmerging('function f() { debugger }')
    expect(m.hasNoClunky).toBe(false)
  })

  it('shard quality score is average of 5 measures', () => {
    const shard = analyzeObsidianShard(richContent, 'rich.ts')
    const expected = Math.round(
      shard.volcanicClarity * 0.2 +
      shard.edgeSharpness * 0.2 +
      shard.mirrorDepth * 0.2 +
      shard.darkWisdom * 0.2 +
      shard.dawnEmergence * 0.2,
    )
    expect(shard.qualityScore).toBe(expected)
  })

  it('overall luminosity is average of clarity, sharpness, wisdom', async () => {
    const result = await buildObsidianDawnResult(['rich.ts'], [richContent])
    const expectedLuminosity = Math.round((100 + 100 + 100) / 3)
    expect(result.stats.overallLuminosity).toBe(expectedLuminosity)
  })
})
