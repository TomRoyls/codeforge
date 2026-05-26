import { describe, expect, it } from 'vitest'

import {
  analyzeObsidianCavern,
  analyzeObsidianShard,
  buildObsidianMirrorResult,
  classifyCavernCondition,
  classifyCavernType,
  classifyMirrorGrade,
  classifyShardCondition,
  generateRecommendations,
  measureCutting,
  measureFathoming,
  measureReflecting,
  measureRevealing,
  measureSurviving,
} from '../src/commands/obsidian-reflection-helpers.js'
import type { ObsidianMirrorResult, ObsidianShard } from '../src/commands/obsidian-reflection-helpers.js'
import {
  colorCavernType,
  colorCondition,
  colorMirrorGrade,
  colorScore,
  colorShardCondition,
  formatCavernsTable,
  formatCavernTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatShardsTable,
  formatShardTable,
  formatStatsTable,
} from '../src/commands/obsidian-reflection-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

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

const emptyContent = ''
const minimalContent = 'const x = 1'

const richRevealing = measureRevealing(richContent).clarity
const richReflecting = measureReflecting(richContent).honesty
const richCutting = measureCutting(richContent).precision
const richSurviving = measureSurviving(richContent).resilience
const richFathoming = measureFathoming(richContent).wisdom

function makeStats(overrides: Partial<ObsidianMirrorResult['stats']> = {}): ObsidianMirrorResult['stats'] {
  return {
    totalFiles: 1,
    totalCaverns: 1,
    avgVolcanicClarity: 50,
    avgDarkReflection: 50,
    avgEdgePrecision: 50,
    avgVoidResilience: 50,
    avgAbyssWisdom: 50,
    obsidianMasterpieceCount: 0,
    volcanicGemCount: 0,
    properGlassCount: 0,
    cloudyStoneCount: 0,
    roughRockCount: 0,
    voidCount: 0,
    hasHighClarityCount: 1,
    hasHighHonestyCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallDepth: 50,
    mirrorGrade: 'proper-gazer',
    bestShard: 'a.ts',
    clearest: 'a.ts',
    mostHonest: 'a.ts',
    sharpest: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content highly', () => {
    const result = measureRevealing(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureRevealing(emptyContent)
    expect(result.clarity).toBeLessThan(richRevealing)
    expect(result.hasHighClarity).toBe(false)
  })

  it('scores minimal content moderately', () => {
    const result = measureRevealing(minimalContent)
    expect(result.clarity).toBeGreaterThan(0)
  })

  it('detects readable patterns', () => {
    const result = measureRevealing(richContent)
    expect(result.hasReadable).toBe(true)
  })

  it('detects no cryptic content in clean code', () => {
    const result = measureRevealing(richContent)
    expect(result.hasNoCryptic).toBe(true)
    expect(result.crypticCount).toBe(0)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const mysterious = 2; const obscure = 3'
    const result = measureRevealing(content)
    expect(result.crypticCount).toBe(3)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects self-documenting patterns', () => {
    const result = measureRevealing(richContent)
    expect(result.hasSelfDocumenting).toBe(true)
  })

  it('detects clear type annotations', () => {
    const result = measureRevealing(richContent)
    expect(result.hasClear).toBe(true)
  })

  it('counts obfuscated keywords', () => {
    const content = 'const obfuscated = 1; const encoded = 2'
    const result = measureRevealing(content)
    expect(result.obfuscatedCount).toBe(2)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects transparent patterns', () => {
    const result = measureRevealing(richContent)
    expect(result.hasTransparent).toBe(true)
  })

  it('detects exposed patterns (try/catch/if)', () => {
    const result = measureRevealing(richContent)
    expect(result.hasExposed).toBe(true)
  })

  it('classifies mirror correctly for high scores', () => {
    const result = measureRevealing(richContent)
    expect(['flawless-reflection', 'clear-glass', 'proper-surface']).toContain(result.mirror)
  })

  it('classifies mirror correctly for low scores', () => {
    const result = measureRevealing(emptyContent)
    expect(result.mirror).not.toBe('flawless-reflection')
  })
})

// ─── measureReflecting ──────────────────────────────────

describe('measureReflecting', () => {
  it('scores rich content highly', () => {
    const result = measureReflecting(richContent)
    expect(result.honesty).toBeGreaterThan(50)
  })

  it('scores empty content below rich', () => {
    const result = measureReflecting(emptyContent)
    expect(result.honesty).toBeLessThan(richReflecting)
  })

  it('detects hack keywords', () => {
    const content = 'const hack = 1; const kludge = 2; const anotherHack = 3'
    const result = measureReflecting(content)
    expect(result.hackCount).toBe(2)
    expect(result.hasNoHack).toBe(false)
  })

  it('detects workaround keywords', () => {
    const content = 'const workaround = true; // workaround: fix this'
    const result = measureReflecting(content)
    expect(result.workaroundCount).toBe(2)
    expect(result.hasNoWorkaround).toBe(false)
  })

  it('detects no hack in clean code', () => {
    const result = measureReflecting(richContent)
    expect(result.hasNoHack).toBe(true)
    expect(result.hackCount).toBe(0)
  })

  it('detects no debug code in clean code', () => {
    const result = measureReflecting(richContent)
    expect(result.hasNoDebugCode).toBe(true)
  })

  it('detects genuine code (no any)', () => {
    const result = measureReflecting(richContent)
    expect(result.hasGenuine).toBe(true)
  })

  it('detects candid patterns (import/export)', () => {
    const result = measureReflecting(richContent)
    expect(result.hasCandid).toBe(true)
  })

  it('detects truthful patterns (class/interface/type)', () => {
    const result = measureReflecting(richContent)
    expect(result.hasTruthful).toBe(true)
  })

  it('classifies truth correctly for high scores', () => {
    const result = measureReflecting(richContent)
    expect(['brutal-truth', 'honest-mirror', 'proper-reflection']).toContain(result.truth)
  })

  it('classifies truth correctly for low scores', () => {
    const result = measureReflecting(emptyContent)
    expect(result.truth).not.toBe('brutal-truth')
  })
})

// ─── measureCutting ─────────────────────────────────────

describe('measureCutting', () => {
  it('scores rich content highly', () => {
    const result = measureCutting(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    const result = measureCutting(emptyContent)
    expect(result.precision).toBeLessThan(richCutting)
  })

  it('detects type safety', () => {
    const result = measureCutting(richContent)
    expect(result.hasTypeSafe).toBe(true)
  })

  it('counts unsafe patterns', () => {
    const content = 'var x = 1; eval("test"); var y = 2'
    const result = measureCutting(content)
    expect(result.unsafeCount).toBe(3)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects no unsafe in clean code', () => {
    const result = measureCutting(richContent)
    expect(result.hasNoUnsafe).toBe(true)
    expect(result.unsafeCount).toBe(0)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3'
    const result = measureCutting(content)
    expect(result.approximateCount).toBe(3)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects exact patterns', () => {
    const result = measureCutting(richContent)
    expect(result.hasExact).toBe(true)
  })

  it('detects sharp patterns (import/export)', () => {
    const result = measureCutting(richContent)
    expect(result.hasSharp).toBe(true)
  })

  it('classifies blade correctly for high scores', () => {
    const result = measureCutting(richContent)
    expect(['surgical-obsidian', 'razor-edge', 'proper-knife']).toContain(result.blade)
  })

  it('classifies blade correctly for low scores', () => {
    const result = measureCutting(emptyContent)
    expect(result.blade).not.toBe('surgical-obsidian')
  })
})

// ─── measureSurviving ───────────────────────────────────

describe('measureSurviving', () => {
  it('scores rich content highly', () => {
    const result = measureSurviving(richContent)
    expect(result.resilience).toBeGreaterThan(50)
  })

  it('scores empty content below rich', () => {
    const result = measureSurviving(emptyContent)
    expect(result.resilience).toBeLessThan(richSurviving)
    expect(result.hasHighResilience).toBe(false)
  })

  it('detects error handling', () => {
    const result = measureSurviving(richContent)
    expect(result.hasErrorHandled).toBe(true)
  })

  it('counts unhandled patterns', () => {
    const content = 'const unsafe = 1; const unchecked = 2; const risky = 3'
    const result = measureSurviving(content)
    expect(result.unhandledCount).toBe(3)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects no unhandled in clean code', () => {
    const result = measureSurviving(richContent)
    expect(result.hasNoUnhandled).toBe(true)
  })

  it('counts untested patterns', () => {
    const content = 'eval("test"); new Function("x", "return x")'
    const result = measureSurviving(content)
    expect(result.untestedCount).toBe(2)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects stable patterns (const/readonly)', () => {
    const result = measureSurviving(richContent)
    expect(result.hasStable).toBe(true)
  })

  it('classifies depth correctly for high scores', () => {
    const result = measureSurviving(richContent)
    expect(['bottomless-void', 'dark-fortress', 'proper-shelter', 'fragile-glass']).toContain(result.depth)
  })

  it('classifies depth correctly for low scores', () => {
    const result = measureSurviving(emptyContent)
    expect(result.depth).not.toBe('bottomless-void')
  })
})

// ─── measureFathoming ───────────────────────────────────

describe('measureFathoming', () => {
  it('scores rich content highly', () => {
    const result = measureFathoming(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    const result = measureFathoming(emptyContent)
    expect(result.wisdom).toBeLessThan(richFathoming)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureFathoming(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects no hacked in clean code', () => {
    const result = measureFathoming(richContent)
    expect(result.hasNoHacked).toBe(true)
    expect(result.hackedCount).toBe(0)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureFathoming(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects well-architected patterns', () => {
    const result = measureFathoming(richContent)
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects principled code (no any)', () => {
    const result = measureFathoming(richContent)
    expect(result.hasPrincipled).toBe(true)
  })

  it('detects deep type annotations', () => {
    const result = measureFathoming(richContent)
    expect(result.hasDeep).toBe(true)
  })

  it('classifies depth correctly for high scores', () => {
    const result = measureFathoming(richContent)
    expect(['bottomless-sage', 'deep-thinker', 'proper-philosopher']).toContain(result.depth)
  })

  it('classifies depth correctly for low scores', () => {
    const result = measureFathoming(emptyContent)
    expect(result.depth).not.toBe('bottomless-sage')
  })
})

// ─── analyzeObsidianShard ───────────────────────────────

describe('analyzeObsidianShard', () => {
  it('analyzes a file correctly', () => {
    const shard = analyzeObsidianShard(richContent, 'test.ts')
    expect(shard.file).toBe('test.ts')
    expect(shard.volcanicClarity).toBeGreaterThan(0)
    expect(shard.darkReflection).toBeGreaterThan(0)
    expect(shard.edgePrecision).toBeGreaterThan(0)
    expect(shard.voidResilience).toBeGreaterThan(0)
    expect(shard.abyssWisdom).toBeGreaterThan(0)
    expect(shard.qualityScore).toBeGreaterThan(0)
    expect(shard.condition).toBeDefined()
  })

  it('computes quality score as weighted average', () => {
    const shard = analyzeObsidianShard(richContent, 'test.ts')
    const expected = Math.round(
      shard.volcanicClarity * 0.2 +
      shard.darkReflection * 0.2 +
      shard.edgePrecision * 0.2 +
      shard.voidResilience * 0.2 +
      shard.abyssWisdom * 0.2,
    )
    expect(shard.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const shard = analyzeObsidianShard(richContent, 'test.ts')
    expect(shard.revealing).toBeDefined()
    expect(shard.reflecting).toBeDefined()
    expect(shard.cutting).toBeDefined()
    expect(shard.surviving).toBeDefined()
    expect(shard.fathoming).toBeDefined()
  })

  it('classifies empty content as non-masterpiece', () => {
    const shard = analyzeObsidianShard(emptyContent, 'empty.ts')
    expect(shard.qualityScore).toBeLessThan(60)
    expect(shard.condition).not.toBe('obsidian-masterpiece')
  })
})

// ─── analyzeObsidianCavern ──────────────────────────────

describe('analyzeObsidianCavern', () => {
  it('handles empty shards', () => {
    const cavern = analyzeObsidianCavern([], 'empty-dir')
    expect(cavern.shards).toHaveLength(0)
    expect(cavern.cavernType).toBe('no-cavern')
    expect(cavern.condition).toBe('void')
  })

  it('analyzes a cavern with shards', () => {
    const shard = analyzeObsidianShard(richContent, 'src/test.ts')
    const cavern = analyzeObsidianCavern([shard], 'src')
    expect(cavern.directory).toBe('src')
    expect(cavern.shards).toHaveLength(1)
    expect(cavern.avgClarity).toBeGreaterThan(0)
  })

  it('counts obsidian masterpieces', () => {
    const shard: ObsidianShard = {
      file: 'a.ts',
      volcanicClarity: 95, darkReflection: 95, edgePrecision: 95, voidResilience: 95, abyssWisdom: 95,
      revealing: {} as ObsidianShard['revealing'],
      reflecting: {} as ObsidianShard['reflecting'],
      cutting: {} as ObsidianShard['cutting'],
      surviving: {} as ObsidianShard['surviving'],
      fathoming: {} as ObsidianShard['fathoming'],
      condition: 'obsidian-masterpiece',
      qualityScore: 95,
    }
    const cavern = analyzeObsidianCavern([shard], 'src')
    expect(cavern.obsidianMasterpieceCount).toBe(1)
  })

  it('counts void shards', () => {
    const shard: ObsidianShard = {
      file: 'a.ts',
      volcanicClarity: 0, darkReflection: 0, edgePrecision: 0, voidResilience: 0, abyssWisdom: 0,
      revealing: {} as ObsidianShard['revealing'],
      reflecting: {} as ObsidianShard['reflecting'],
      cutting: {} as ObsidianShard['cutting'],
      surviving: {} as ObsidianShard['surviving'],
      fathoming: {} as ObsidianShard['fathoming'],
      condition: 'void',
      qualityScore: 0,
    }
    const cavern = analyzeObsidianCavern([shard], 'src')
    expect(cavern.voidCount).toBe(1)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyShardCondition', () => {
  it('classifies obsidian-masterpiece at 90+', () => {
    expect(classifyShardCondition(90)).toBe('obsidian-masterpiece')
    expect(classifyShardCondition(100)).toBe('obsidian-masterpiece')
  })

  it('classifies volcanic-gem at 75-89', () => {
    expect(classifyShardCondition(75)).toBe('volcanic-gem')
    expect(classifyShardCondition(89)).toBe('volcanic-gem')
  })

  it('classifies proper-glass at 60-74', () => {
    expect(classifyShardCondition(60)).toBe('proper-glass')
    expect(classifyShardCondition(74)).toBe('proper-glass')
  })

  it('classifies cloudy-stone at 40-59', () => {
    expect(classifyShardCondition(40)).toBe('cloudy-stone')
    expect(classifyShardCondition(59)).toBe('cloudy-stone')
  })

  it('classifies rough-rock at 20-39', () => {
    expect(classifyShardCondition(20)).toBe('rough-rock')
    expect(classifyShardCondition(39)).toBe('rough-rock')
  })

  it('classifies void below 20', () => {
    expect(classifyShardCondition(0)).toBe('void')
    expect(classifyShardCondition(19)).toBe('void')
  })
})

describe('classifyCavernType', () => {
  it('returns no-cavern for empty shards', () => {
    expect(classifyCavernType([])).toBe('no-cavern')
  })

  it('classifies mirror-chamber for high avg', () => {
    const shards = [{ qualityScore: 90 } as ObsidianShard]
    expect(classifyCavernType(shards)).toBe('mirror-chamber')
  })

  it('classifies dark-gallery for 70-84 avg', () => {
    const shards = [{ qualityScore: 75 } as ObsidianShard]
    expect(classifyCavernType(shards)).toBe('dark-gallery')
  })

  it('classifies proper-cave for 55-69 avg', () => {
    const shards = [{ qualityScore: 60 } as ObsidianShard]
    expect(classifyCavernType(shards)).toBe('proper-cave')
  })

  it('classifies shallow-hollow for 35-54 avg', () => {
    const shards = [{ qualityScore: 40 } as ObsidianShard]
    expect(classifyCavernType(shards)).toBe('shallow-hollow')
  })

  it('classifies surface-crack for low avg', () => {
    const shards = [{ qualityScore: 10 } as ObsidianShard]
    expect(classifyCavernType(shards)).toBe('surface-crack')
  })
})

describe('classifyCavernCondition', () => {
  it('classifies obsidian-palace at 85+', () => {
    expect(classifyCavernCondition(85)).toBe('obsidian-palace')
    expect(classifyCavernCondition(100)).toBe('obsidian-palace')
  })

  it('classifies dark-vault at 70-84', () => {
    expect(classifyCavernCondition(70)).toBe('dark-vault')
    expect(classifyCavernCondition(84)).toBe('dark-vault')
  })

  it('classifies proper-chamber at 55-69', () => {
    expect(classifyCavernCondition(55)).toBe('proper-chamber')
    expect(classifyCavernCondition(69)).toBe('proper-chamber')
  })

  it('classifies stone-cellar at 35-54', () => {
    expect(classifyCavernCondition(35)).toBe('stone-cellar')
    expect(classifyCavernCondition(54)).toBe('stone-cellar')
  })

  it('classifies dirt-hole at 15-34', () => {
    expect(classifyCavernCondition(15)).toBe('dirt-hole')
    expect(classifyCavernCondition(34)).toBe('dirt-hole')
  })

  it('classifies void below 15', () => {
    expect(classifyCavernCondition(0)).toBe('void')
    expect(classifyCavernCondition(14)).toBe('void')
  })
})

describe('classifyMirrorGrade', () => {
  it('classifies seer at 80+', () => {
    expect(classifyMirrorGrade(80)).toBe('seer')
    expect(classifyMirrorGrade(100)).toBe('seer')
  })

  it('classifies mirror-master at 65-79', () => {
    expect(classifyMirrorGrade(65)).toBe('mirror-master')
    expect(classifyMirrorGrade(79)).toBe('mirror-master')
  })

  it('classifies proper-gazer at 50-64', () => {
    expect(classifyMirrorGrade(50)).toBe('proper-gazer')
    expect(classifyMirrorGrade(64)).toBe('proper-gazer')
  })

  it('classifies apprentice at 35-49', () => {
    expect(classifyMirrorGrade(35)).toBe('apprentice')
    expect(classifyMirrorGrade(49)).toBe('apprentice')
  })

  it('classifies novice at 20-34', () => {
    expect(classifyMirrorGrade(20)).toBe('novice')
    expect(classifyMirrorGrade(34)).toBe('novice')
  })

  it('classifies blind-folded below 20', () => {
    expect(classifyMirrorGrade(0)).toBe('blind-folded')
    expect(classifyMirrorGrade(19)).toBe('blind-folded')
  })
})

// ─── buildObsidianMirrorResult ──────────────────────────

describe('buildObsidianMirrorResult', () => {
  it('handles empty input', async () => {
    const result = await buildObsidianMirrorResult([], [])
    expect(result.shards).toHaveLength(0)
    expect(result.caverns).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallDepth).toBe(0)
    expect(result.stats.bestShard).toBe('')
  })

  it('analyzes single file', async () => {
    const result = await buildObsidianMirrorResult(['test.ts'], [richContent])
    expect(result.shards).toHaveLength(1)
    expect(result.shards[0].file).toBe('test.ts')
    expect(result.caverns).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory', async () => {
    const result = await buildObsidianMirrorResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.caverns).toHaveLength(2)
  })

  it('computes average scores correctly', async () => {
    const result = await buildObsidianMirrorResult(['a.ts'], [richContent])
    expect(result.stats.avgVolcanicClarity).toBe(result.shards[0].volcanicClarity)
    expect(result.stats.avgDarkReflection).toBe(result.shards[0].darkReflection)
    expect(result.stats.avgEdgePrecision).toBe(result.shards[0].edgePrecision)
    expect(result.stats.avgVoidResilience).toBe(result.shards[0].voidResilience)
    expect(result.stats.avgAbyssWisdom).toBe(result.shards[0].abyssWisdom)
  })

  it('identifies best shard', async () => {
    const result = await buildObsidianMirrorResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestShard).toBe('high.ts')
  })

  it('computes abyss overview', async () => {
    const result = await buildObsidianMirrorResult(['a.ts'], [richContent])
    expect(result.abyss.avgClarity).toBe(result.shards[0].volcanicClarity)
    expect(result.abyss.avgPrecision).toBe(result.shards[0].edgePrecision)
    expect(result.abyss.avgWisdom).toBe(result.shards[0].abyssWisdom)
    expect(result.abyss.overallDepth).toBe(result.stats.overallDepth)
  })

  it('sets isObsidian when overallDepth >= 60', async () => {
    const result = await buildObsidianMirrorResult(['a.ts'], [richContent])
    if (result.stats.overallDepth >= 60) {
      expect(result.abyss.isObsidian).toBe(true)
    }
  })

  it('finds clearest, most honest, sharpest, most resilient, wisest', async () => {
    const result = await buildObsidianMirrorResult(['a.ts'], [richContent])
    expect(result.stats.clearest).toBe('a.ts')
    expect(result.stats.mostHonest).toBe('a.ts')
    expect(result.stats.sharpest).toBe('a.ts')
    expect(result.stats.mostResilient).toBe('a.ts')
    expect(result.stats.wisest).toBe('a.ts')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const stats = makeStats({
      avgVolcanicClarity: 90, avgDarkReflection: 90, avgEdgePrecision: 90,
      avgVoidResilience: 90, avgAbyssWisdom: 90, overallDepth: 90,
    })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isObsidian: true, overallDepth: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('obsidian mirror reflects absolute truth')
  })

  it('recommends polishing clarity when below 60', () => {
    const stats = makeStats({ avgVolcanicClarity: 40, avgDarkReflection: 90, avgEdgePrecision: 90, avgVoidResilience: 90, avgAbyssWisdom: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 40, avgPrecision: 90, avgWisdom: 90, isObsidian: false, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('Polish volcanic clarity'))).toBe(true)
  })

  it('recommends facing dark reflection when below 60', () => {
    const stats = makeStats({ avgVolcanicClarity: 90, avgDarkReflection: 40, avgEdgePrecision: 90, avgVoidResilience: 90, avgAbyssWisdom: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isObsidian: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('Face the dark reflection'))).toBe(true)
  })

  it('recommends sharpening edge when below 60', () => {
    const stats = makeStats({ avgVolcanicClarity: 90, avgDarkReflection: 90, avgEdgePrecision: 40, avgVoidResilience: 90, avgAbyssWisdom: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 40, avgWisdom: 90, isObsidian: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('Sharpen the obsidian edge'))).toBe(true)
  })

  it('recommends strengthening void when below 60', () => {
    const stats = makeStats({ avgVolcanicClarity: 90, avgDarkReflection: 90, avgEdgePrecision: 90, avgVoidResilience: 40, avgAbyssWisdom: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isObsidian: false, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('Strengthen void resilience'))).toBe(true)
  })

  it('recommends fathoming abyss when below 60', () => {
    const stats = makeStats({ avgVolcanicClarity: 90, avgDarkReflection: 90, avgEdgePrecision: 90, avgVoidResilience: 90, avgAbyssWisdom: 40 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 40, isObsidian: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('Fathom the abyss'))).toBe(true)
  })

  it('recommends mirror shatters when depth < 40', () => {
    const stats = makeStats({ overallDepth: 30, avgVolcanicClarity: 30, avgDarkReflection: 30, avgEdgePrecision: 30, avgVoidResilience: 30, avgAbyssWisdom: 30 })
    const recs = generateRecommendations([], [], { avgClarity: 30, avgPrecision: 30, avgWisdom: 30, isObsidian: false, overallDepth: 30 }, stats)
    expect(recs.some((r) => r.includes('mirror shatters'))).toBe(true)
  })

  it('lists void shards by name when <= 5', () => {
    const stats = makeStats({ avgVolcanicClarity: 70, avgDarkReflection: 70, avgEdgePrecision: 70, avgVoidResilience: 70, avgAbyssWisdom: 70 })
    const shards = [
      { file: 'a.ts', condition: 'void' } as ObsidianShard,
      { file: 'b.ts', condition: 'void' } as ObsidianShard,
    ]
    const recs = generateRecommendations(shards, [], { avgClarity: 70, avgPrecision: 70, avgWisdom: 70, isObsidian: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })

  it('summarizes void shards when > 5', () => {
    const stats = makeStats({ avgVolcanicClarity: 70, avgDarkReflection: 70, avgEdgePrecision: 70, avgVoidResilience: 70, avgAbyssWisdom: 70 })
    const shards = Array.from({ length: 6 }, (_, i) => ({ file: `${i}.ts`, condition: 'void' } as ObsidianShard))
    const recs = generateRecommendations(shards, [], { avgClarity: 70, avgPrecision: 70, avgWisdom: 70, isObsidian: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('6 rough shards'))).toBe(true)
  })

  it('reports all caverns are dirt holes', () => {
    const stats = makeStats({ avgVolcanicClarity: 70, avgDarkReflection: 70, avgEdgePrecision: 70, avgVoidResilience: 70, avgAbyssWisdom: 70 })
    const caverns = [{ condition: 'dirt-hole', directory: 'src' } as import('../src/commands/obsidian-reflection-helpers.js').ObsidianCavern]
    const recs = generateRecommendations([], caverns, { avgClarity: 70, avgPrecision: 70, avgWisdom: 70, isObsidian: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('dirt holes'))).toBe(true)
  })

  it('returns default praise when all is well', () => {
    const stats = makeStats({ avgVolcanicClarity: 90, avgDarkReflection: 90, avgEdgePrecision: 90, avgVoidResilience: 90, avgAbyssWisdom: 90, overallDepth: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isObsidian: true, overallDepth: 90 }, stats)
    expect(recs[0]).toContain('obsidian mirror reflects absolute truth')
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all ranges', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(25)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(75)).toBe('string')
    expect(typeof colorScore(95)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns colored string for all conditions', () => {
    const conditions = ['obsidian-palace', 'dark-vault', 'proper-chamber', 'stone-cellar', 'dirt-hole', 'void']
    for (const c of conditions) {
      expect(typeof colorCondition(c)).toBe('string')
    }
  })

  it('handles unknown condition', () => {
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorShardCondition', () => {
  it('returns colored string for all shard conditions', () => {
    const conditions = ['obsidian-masterpiece', 'volcanic-gem', 'proper-glass', 'cloudy-stone', 'rough-rock', 'void']
    for (const c of conditions) {
      expect(typeof colorShardCondition(c)).toBe('string')
    }
  })
})

describe('colorCavernType', () => {
  it('returns colored string for all cavern types', () => {
    const types = ['mirror-chamber', 'dark-gallery', 'proper-cave', 'shallow-hollow', 'surface-crack', 'no-cavern']
    for (const t of types) {
      expect(typeof colorCavernType(t)).toBe('string')
    }
  })
})

describe('colorMirrorGrade', () => {
  it('returns colored string for all grades', () => {
    const grades = ['seer', 'mirror-master', 'proper-gazer', 'apprentice', 'novice', 'blind-folded']
    for (const g of grades) {
      expect(typeof colorMirrorGrade(g)).toBe('string')
    }
  })
})

describe('formatShardTable', () => {
  it('formats a shard table', () => {
    const shard = analyzeObsidianShard(richContent, 'test.ts')
    const output = formatShardTable(shard)
    expect(output).toContain('Obsidian Shard: test.ts')
    expect(output).toContain('Volcanic Clarity')
    expect(output).toContain('Quality Score')
  })
})

describe('formatShardsTable', () => {
  it('formats empty shards message', () => {
    expect(formatShardsTable([])).toContain('No obsidian shards found')
  })

  it('formats shards list', () => {
    const shards = [analyzeObsidianShard(richContent, 'a.ts'), analyzeObsidianShard(richContent, 'b.ts')]
    const output = formatShardsTable(shards)
    expect(output).toContain('Obsidian Shards')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatCavernTable', () => {
  it('formats a cavern table', () => {
    const cavern = analyzeObsidianCavern([analyzeObsidianShard(richContent, 'test.ts')], 'src')
    const output = formatCavernTable(cavern)
    expect(output).toContain('Obsidian Cavern: src')
    expect(output).toContain('Shards')
  })
})

describe('formatCavernsTable', () => {
  it('formats empty caverns message', () => {
    expect(formatCavernsTable([])).toContain('No obsidian caverns found')
  })

  it('formats caverns list', () => {
    const cavern = analyzeObsidianCavern([analyzeObsidianShard(richContent, 'test.ts')], 'src')
    const output = formatCavernsTable([cavern])
    expect(output).toContain('Obsidian Caverns')
  })
})

describe('formatStatsTable', () => {
  it('formats stats table', () => {
    const stats = makeStats()
    const output = formatStatsTable(stats)
    expect(output).toContain('Obsidian Mirror Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Mirror Grade')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations list', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result table', async () => {
    const result = await buildObsidianMirrorResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Obsidian Mirror Analysis')
    expect(output).toContain('Abyss Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildObsidianMirrorResult(['test.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.shards).toHaveLength(1)
    expect(parsed.abyss).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
