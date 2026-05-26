import { describe, expect, it } from 'vitest'

import {
  analyzeJadeArtifact,
  analyzeJadeDynasty,
  buildJadeEmpireResult,
  classifyArtifactCondition,
  classifyArtisanGrade,
  classifyDynastyCondition,
  classifyDynastyType,
  generateRecommendations,
  measureMeditating,
  measurePurifying,
  measureCarving,
  measureContinuing,
  measureKnowing,
  type JadeArtifact,
  type JadeDynasty,
  type JadeEmpireResult,
} from '../src/commands/jade-empire-helpers.js'

import {
  colorScore,
  colorDynastyCondition,
  formatArtifactTable,
  formatArtifactsTable,
  formatDynastyTable,
  formatDynastiesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/jade-empire-format-helpers.js'

// ─── Test fixtures ──────────────────────────────────────

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

const poorContent = 'var x = eval("1+2") any global hack'

// ─── measureMeditating ──────────────────────────────────

describe('measureMeditating', () => {
  it('scores rich content highly', () => {
    const result = measureMeditating(richContent)
    expect(result.serenity).toBeGreaterThan(60)
    expect(result.hasHighSerenity).toBe(true)
  })

  it('scores empty content poorly', () => {
    const result = measureMeditating(emptyContent)
    expect(result.serenity).toBeLessThan(50)
  })

  it('detects cryptic content', () => {
    const result = measureMeditating('cryptic mysterious obscure enigmatic code')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects chaotic content', () => {
    const result = measureMeditating('chaotic messy disorganized tangled code')
    expect(result.chaoticCount).toBeGreaterThan(0)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('classifies calm for rich content', () => {
    const result = measureMeditating(richContent)
    expect(['nirvana-stone', 'tranquil-jade', 'proper-calm']).toContain(result.calm)
  })

  it('has all boolean fields', () => {
    const result = measureMeditating(richContent)
    expect(typeof result.hasReadable).toBe('boolean')
    expect(typeof result.hasClear).toBe('boolean')
    expect(typeof result.hasOrganized).toBe('boolean')
    expect(typeof result.hasCalm).toBe('boolean')
    expect(typeof result.hasPeaceful).toBe('boolean')
    expect(typeof result.hasComposed).toBe('boolean')
    expect(typeof result.hasTranquil).toBe('boolean')
    expect(typeof result.hasSerene).toBe('boolean')
    expect(typeof result.hasGentle).toBe('boolean')
    expect(typeof result.hasQuiet).toBe('boolean')
    expect(typeof result.hasHarmonious).toBe('boolean')
    expect(typeof result.hasBalanced).toBe('boolean')
  })
})

// ─── measurePurifying ───────────────────────────────────

describe('measurePurifying', () => {
  it('scores rich content highly', () => {
    const result = measurePurifying(richContent)
    expect(result.purity).toBeGreaterThan(60)
    expect(result.hasHighPurity).toBe(true)
  })

  it('detects hack content', () => {
    const result = measurePurifying('hack HACK code')
    expect(result.hackCount).toBeGreaterThan(0)
    expect(result.hasNoHack).toBe(false)
  })

  it('detects workaround content', () => {
    const result = measurePurifying('workaround WORKAROUND code')
    expect(result.workaroundCount).toBeGreaterThan(0)
    expect(result.hasNoWorkaround).toBe(false)
  })

  it('detects TODO content', () => {
    const result = measurePurifying('TODO FIXME XXX code')
    expect(result.hasNoTodo).toBe(false)
  })

  it('classifies grade for rich content', () => {
    const result = measurePurifying(richContent)
    expect(['imperial-jade', 'fine-nephrite', 'proper-jade']).toContain(result.grade)
  })

  it('has clean booleans for rich content', () => {
    const result = measurePurifying(richContent)
    expect(result.hasClean).toBe(true)
    expect(result.hasUnblemished).toBe(true)
    expect(result.hasPristine).toBe(true)
    expect(result.hasSpotless).toBe(true)
  })
})

// ─── measureCarving ─────────────────────────────────────

describe('measureCarving', () => {
  it('scores rich content highly', () => {
    const result = measureCarving(richContent)
    expect(result.mastery).toBeGreaterThan(60)
    expect(result.hasHighMastery).toBe(true)
  })

  it('detects monolithic content', () => {
    const result = measureCarving('monolithic god.object mega code')
    expect(result.monolithicCount).toBeGreaterThan(0)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects spaghetti content', () => {
    const result = measureCarving('spaghetti callback.hell pyramid code')
    expect(result.spaghettiCount).toBeGreaterThan(0)
    expect(result.hasNoSpaghetti).toBe(false)
  })

  it('classifies skill for rich content', () => {
    const result = measureCarving(richContent)
    expect(['master-carver', 'skilled-artisan', 'proper-craftsman']).toContain(result.skill)
  })
})

// ─── measureContinuing ──────────────────────────────────

describe('measureContinuing', () => {
  it('scores rich content well', () => {
    const result = measureContinuing(richContent)
    expect(result.continuity).toBeGreaterThan(50)
  })

  it('detects fragile content', () => {
    const result = measureContinuing('fragile brittle delicate breakable code')
    expect(result.fragileCount).toBeGreaterThan(0)
    expect(result.hasNoFragile).toBe(false)
  })

  it('has hasEvolved checking extends/implements/abstract', () => {
    const result = measureContinuing('class X extends Y {}')
    expect(result.hasEvolved).toBe(true)
  })

  it('richContent does not match extends so hasEvolved is false', () => {
    const result = measureContinuing(richContent)
    expect(result.hasEvolved).toBe(false)
  })

  it('classifies era correctly', () => {
    const result = measureContinuing(richContent)
    expect(['eternal-dynasty', 'lasting-reign', 'proper-era', 'brief-period']).toContain(result.era)
  })
})

// ─── measureKnowing ─────────────────────────────────────

describe('measureKnowing', () => {
  it('scores rich content highly', () => {
    const result = measureKnowing(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('detects hacked content', () => {
    const result = measureKnowing('hack workaround kludge code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects shallow content', () => {
    const result = measureKnowing('shallow superficial trivial code')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('classifies insight for rich content', () => {
    const result = measureKnowing(richContent)
    expect(['jade-emperor', 'sage-counsel', 'proper-scholar']).toContain(result.insight)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyArtifactCondition', () => {
  it('returns imperial-masterpiece for 90+', () => { expect(classifyArtifactCondition(90)).toBe('imperial-masterpiece') })
  it('returns royal-jade for 75-89', () => { expect(classifyArtifactCondition(75)).toBe('royal-jade') })
  it('returns proper-nephrite for 60-74', () => { expect(classifyArtifactCondition(60)).toBe('proper-nephrite') })
  it('returns common-stone for 40-59', () => { expect(classifyArtifactCondition(40)).toBe('common-stone') })
  it('returns river-rock for 20-39', () => { expect(classifyArtifactCondition(20)).toBe('river-rock') })
  it('returns void below 20', () => { expect(classifyArtifactCondition(0)).toBe('void') })
})

describe('classifyDynastyType', () => {
  function makeArtifact(score: number): JadeArtifact {
    return {
      file: 'test.ts', imperialSerenity: score, jadePurity: score, carvingMastery: score,
      dynastyContinuity: score, emeraldWisdom: score, qualityScore: score,
      condition: classifyArtifactCondition(score),
      meditating: {} as JadeArtifact['meditating'],
      purifying: {} as JadeArtifact['purifying'],
      carving: {} as JadeArtifact['carving'],
      continuing: {} as JadeArtifact['continuing'],
      knowing: {} as JadeArtifact['knowing'],
    }
  }

  it('returns no-dynasty for empty artifacts', () => { expect(classifyDynastyType([])).toBe('no-dynasty') })
  it('returns golden-age for high scores', () => { expect(classifyDynastyType([makeArtifact(90)])).toBe('golden-age') })
  it('returns dark-age for low scores', () => { expect(classifyDynastyType([makeArtifact(10)])).toBe('dark-age') })
})

describe('classifyDynastyCondition', () => {
  it('returns jade-palace for 85+', () => { expect(classifyDynastyCondition(85)).toBe('jade-palace') })
  it('returns noble-court for 70-84', () => { expect(classifyDynastyCondition(70)).toBe('noble-court') })
  it('returns proper-temple for 55-69', () => { expect(classifyDynastyCondition(55)).toBe('proper-temple') })
  it('returns stone-workshop for 35-54', () => { expect(classifyDynastyCondition(35)).toBe('stone-workshop') })
  it('returns clay-hut for 15-34', () => { expect(classifyDynastyCondition(15)).toBe('clay-hut') })
  it('returns void below 15', () => { expect(classifyDynastyCondition(0)).toBe('void') })
})

describe('classifyArtisanGrade', () => {
  it('returns jade-emperor for 80+', () => { expect(classifyArtisanGrade(80)).toBe('jade-emperor') })
  it('returns master-artisan for 65-79', () => { expect(classifyArtisanGrade(65)).toBe('master-artisan') })
  it('returns proper-craftsman for 50-64', () => { expect(classifyArtisanGrade(50)).toBe('proper-craftsman') })
  it('returns apprentice for 35-49', () => { expect(classifyArtisanGrade(35)).toBe('apprentice') })
  it('returns novice for 20-34', () => { expect(classifyArtisanGrade(20)).toBe('novice') })
  it('returns stone-breaker below 20', () => { expect(classifyArtisanGrade(0)).toBe('stone-breaker') })
})

// ─── analyzeJadeArtifact ────────────────────────────────

describe('analyzeJadeArtifact', () => {
  it('returns a complete JadeArtifact', () => {
    const artifact = analyzeJadeArtifact(richContent, 'test.ts')
    expect(artifact.file).toBe('test.ts')
    expect(typeof artifact.imperialSerenity).toBe('number')
    expect(typeof artifact.jadePurity).toBe('number')
    expect(typeof artifact.carvingMastery).toBe('number')
    expect(typeof artifact.dynastyContinuity).toBe('number')
    expect(typeof artifact.emeraldWisdom).toBe('number')
    expect(typeof artifact.qualityScore).toBe('number')
    expect(artifact.meditating).toBeDefined()
    expect(artifact.purifying).toBeDefined()
    expect(artifact.carving).toBeDefined()
    expect(artifact.continuing).toBeDefined()
    expect(artifact.knowing).toBeDefined()
  })

  it('computes qualityScore as weighted average', () => {
    const artifact = analyzeJadeArtifact(richContent, 'test.ts')
    const expected = Math.round(
      artifact.imperialSerenity * 0.2 +
      artifact.jadePurity * 0.2 +
      artifact.carvingMastery * 0.2 +
      artifact.dynastyContinuity * 0.2 +
      artifact.emeraldWisdom * 0.2,
    )
    expect(artifact.qualityScore).toBe(expected)
  })

  it('scores rich content highly', () => {
    const artifact = analyzeJadeArtifact(richContent, 'test.ts')
    expect(artifact.qualityScore).toBeGreaterThan(60)
  })

  it('scores empty content low', () => {
    const artifact = analyzeJadeArtifact(emptyContent, 'empty.ts')
    expect(artifact.qualityScore).toBeLessThan(50)
  })
})

// ─── analyzeJadeDynasty ─────────────────────────────────

describe('analyzeJadeDynasty', () => {
  it('returns empty dynasty for no artifacts', () => {
    const dynasty = analyzeJadeDynasty([], 'src')
    expect(dynasty.directory).toBe('src')
    expect(dynasty.artifacts).toHaveLength(0)
    expect(dynasty.dynastyType).toBe('no-dynasty')
    expect(dynasty.condition).toBe('void')
  })

  it('computes averages from artifacts', () => {
    const artifact = analyzeJadeArtifact(richContent, 'test.ts')
    const dynasty = analyzeJadeDynasty([artifact], 'src')
    expect(dynasty.avgSerenity).toBe(artifact.imperialSerenity)
  })
})

// ─── buildJadeEmpireResult ──────────────────────────────

describe('buildJadeEmpireResult', () => {
  it('returns complete result for empty input', async () => {
    const result = await buildJadeEmpireResult([], [])
    expect(result.artifacts).toHaveLength(0)
    expect(result.dynasties).toHaveLength(0)
    expect(result.empire.overallHarmony).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('returns complete result for single file', async () => {
    const result = await buildJadeEmpireResult(['test.ts'], [richContent])
    expect(result.artifacts).toHaveLength(1)
    expect(result.artifacts[0].file).toBe('test.ts')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.overallHarmony).toBeGreaterThan(0)
    expect(result.stats.artisanGrade).toBeDefined()
  })

  it('returns complete result for multiple dirs', async () => {
    const result = await buildJadeEmpireResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, poorContent],
    )
    expect(result.artifacts).toHaveLength(3)
    expect(result.dynasties).toHaveLength(2)
  })

  it('computes stats correctly', async () => {
    const result = await buildJadeEmpireResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(typeof result.stats.bestArtifact).toBe('string')
    expect(typeof result.stats.mostSerene).toBe('string')
    expect(typeof result.stats.purest).toBe('string')
    expect(typeof result.stats.mostMasterful).toBe('string')
    expect(typeof result.stats.mostEnduring).toBe('string')
    expect(typeof result.stats.wisest).toBe('string')
  })

  it('computes empire overview', async () => {
    const result = await buildJadeEmpireResult(['a.ts'], [richContent])
    expect(typeof result.empire.avgSerenity).toBe('number')
    expect(typeof result.empire.avgMastery).toBe('number')
    expect(typeof result.empire.avgWisdom).toBe('number')
    expect(typeof result.empire.isJade).toBe('boolean')
  })

  it('generates recommendations', async () => {
    const result = await buildJadeEmpireResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  function makeStats(overrides: Partial<JadeEmpireResult['stats']> = {}): JadeEmpireResult['stats'] {
    return {
      totalFiles: 1, totalDynasties: 1,
      avgImperialSerenity: 50, avgJadePurity: 50, avgCarvingMastery: 50,
      avgDynastyContinuity: 50, avgEmeraldWisdom: 50,
      imperialMasterpieceCount: 0, royalJadeCount: 0, properNephriteCount: 1,
      commonStoneCount: 0, riverRockCount: 0, voidCount: 0,
      hasHighSerenityCount: 0, hasHighPurityCount: 0, hasHighMasteryCount: 0,
      hasHighContinuityCount: 0, hasHighWisdomCount: 0,
      overallHarmony: 50,
      artisanGrade: 'proper-craftsman',
      bestArtifact: 'a.ts', mostSerene: 'a.ts', purest: 'a.ts',
      mostMasterful: 'a.ts', mostEnduring: 'a.ts', wisest: 'a.ts',
      ...overrides,
    }
  }

  it('returns masterpiece message when all scores >= 90', () => {
    const stats = makeStats({
      avgImperialSerenity: 92, avgJadePurity: 91, avgCarvingMastery: 90,
      avgDynastyContinuity: 93, avgEmeraldWisdom: 90,
    })
    const recs = generateRecommendations([], [], { avgSerenity: 92, avgMastery: 90, avgWisdom: 90, isJade: true, overallHarmony: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfect harmony')
  })

  it('recommends serenity improvement when low', () => {
    const stats = makeStats({ avgImperialSerenity: 40 })
    const recs = generateRecommendations([], [], { avgSerenity: 40, avgMastery: 50, avgWisdom: 50, isJade: false, overallHarmony: 40 }, stats)
    expect(recs.some((r) => r.includes('serenity'))).toBe(true)
  })

  it('recommends purity improvement when low', () => {
    const stats = makeStats({ avgJadePurity: 40 })
    const recs = generateRecommendations([], [], { avgSerenity: 50, avgMastery: 50, avgWisdom: 50, isJade: false, overallHarmony: 40 }, stats)
    expect(recs.some((r) => r.includes('Purify'))).toBe(true)
  })

  it('recommends mastery improvement when low', () => {
    const stats = makeStats({ avgCarvingMastery: 40 })
    const recs = generateRecommendations([], [], { avgSerenity: 50, avgMastery: 40, avgWisdom: 50, isJade: false, overallHarmony: 40 }, stats)
    expect(recs.some((r) => r.includes('carving mastery'))).toBe(true)
  })

  it('recommends continuity improvement when low', () => {
    const stats = makeStats({ avgDynastyContinuity: 40 })
    const recs = generateRecommendations([], [], { avgSerenity: 50, avgMastery: 50, avgWisdom: 50, isJade: false, overallHarmony: 40 }, stats)
    expect(recs.some((r) => r.includes('dynasty continuity'))).toBe(true)
  })

  it('recommends wisdom improvement when low', () => {
    const stats = makeStats({ avgEmeraldWisdom: 40 })
    const recs = generateRecommendations([], [], { avgSerenity: 50, avgMastery: 50, avgWisdom: 40, isJade: false, overallHarmony: 40 }, stats)
    expect(recs.some((r) => r.includes('emerald wisdom'))).toBe(true)
  })

  it('warns about overall low harmony', () => {
    const stats = makeStats({ overallHarmony: 30 })
    const recs = generateRecommendations([], [], { avgSerenity: 30, avgMastery: 30, avgWisdom: 30, isJade: false, overallHarmony: 30 }, stats)
    expect(recs.some((r) => r.includes('crumbled'))).toBe(true)
  })

  it('lists void artifacts', () => {
    const artifact: JadeArtifact = {
      file: 'bad.ts', imperialSerenity: 0, jadePurity: 0, carvingMastery: 0,
      dynastyContinuity: 0, emeraldWisdom: 0, qualityScore: 0,
      condition: 'void',
      meditating: {} as JadeArtifact['meditating'],
      purifying: {} as JadeArtifact['purifying'],
      carving: {} as JadeArtifact['carving'],
      continuing: {} as JadeArtifact['continuing'],
      knowing: {} as JadeArtifact['knowing'],
    }
    const recs = generateRecommendations([artifact], [], { avgSerenity: 0, avgMastery: 0, avgWisdom: 0, isJade: false, overallHarmony: 0 }, makeStats({ overallHarmony: 0 }))
    expect(recs.some((r) => r.includes('bad.ts'))).toBe(true)
  })

  it('warns about many void artifacts', () => {
    const artifacts: JadeArtifact[] = Array.from({ length: 6 }, (_, i) => ({
      file: `bad${i}.ts`, imperialSerenity: 0, jadePurity: 0, carvingMastery: 0,
      dynastyContinuity: 0, emeraldWisdom: 0, qualityScore: 0,
      condition: 'void' as const,
      meditating: {} as JadeArtifact['meditating'],
      purifying: {} as JadeArtifact['purifying'],
      carving: {} as JadeArtifact['carving'],
      continuing: {} as JadeArtifact['continuing'],
      knowing: {} as JadeArtifact['knowing'],
    }))
    const recs = generateRecommendations(artifacts, [], { avgSerenity: 0, avgMastery: 0, avgWisdom: 0, isJade: false, overallHarmony: 0 }, makeStats({ overallHarmony: 0 }))
    expect(recs.some((r) => r.includes('6 river rocks'))).toBe(true)
  })

  it('warns when all dynasties are poor', () => {
    const dynasty: JadeDynasty = {
      directory: 'src', artifacts: [], avgSerenity: 0, avgMastery: 0, avgWisdom: 0,
      imperialMasterpieceCount: 0, voidCount: 0, dynastyType: 'dark-age', condition: 'void',
    }
    const recs = generateRecommendations([], [dynasty], { avgSerenity: 0, avgMastery: 0, avgWisdom: 0, isJade: false, overallHarmony: 0 }, makeStats({ overallHarmony: 0 }))
    expect(recs.some((r) => r.includes('clay huts'))).toBe(true)
  })

  it('gives positive feedback when no issues', () => {
    const stats = makeStats({
      avgImperialSerenity: 70, avgJadePurity: 70, avgCarvingMastery: 70,
      avgDynastyContinuity: 70, avgEmeraldWisdom: 70, overallHarmony: 70,
    })
    const recs = generateRecommendations([], [], { avgSerenity: 70, avgMastery: 70, avgWisdom: 70, isJade: true, overallHarmony: 70 }, stats)
    expect(recs.some((r) => r.includes('imperial harmony'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns strings for all ranges', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(25)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(75)).toBe('string')
    expect(typeof colorScore(95)).toBe('string')
  })
})

describe('colorDynastyCondition', () => {
  it('handles all conditions', () => {
    expect(typeof colorDynastyCondition('jade-palace')).toBe('string')
    expect(typeof colorDynastyCondition('noble-court')).toBe('string')
    expect(typeof colorDynastyCondition('proper-temple')).toBe('string')
    expect(typeof colorDynastyCondition('stone-workshop')).toBe('string')
    expect(typeof colorDynastyCondition('clay-hut')).toBe('string')
    expect(typeof colorDynastyCondition('void')).toBe('string')
    expect(typeof colorDynastyCondition('unknown')).toBe('string')
  })
})

describe('formatArtifactTable', () => {
  it('formats an artifact', () => {
    const artifact = analyzeJadeArtifact(richContent, 'test.ts')
    const result = formatArtifactTable(artifact)
    expect(result).toContain('Jade Artifact')
    expect(result).toContain('test.ts')
  })
})

describe('formatArtifactsTable', () => {
  it('handles empty artifacts', () => { expect(formatArtifactsTable([])).toContain('No jade artifacts') })
  it('formats multiple artifacts', () => {
    const a1 = analyzeJadeArtifact(richContent, 'a.ts')
    const a2 = analyzeJadeArtifact(richContent, 'b.ts')
    expect(formatArtifactsTable([a1, a2])).toContain('Jade Artifacts')
  })
})

describe('formatDynastyTable', () => {
  it('formats a dynasty', () => {
    const artifact = analyzeJadeArtifact(richContent, 'test.ts')
    const dynasty = analyzeJadeDynasty([artifact], 'src')
    expect(formatDynastyTable(dynasty)).toContain('Jade Dynasty')
  })
})

describe('formatDynastiesTable', () => {
  it('handles empty dynasties', () => { expect(formatDynastiesTable([])).toContain('No jade dynasties') })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildJadeEmpireResult(['a.ts'], [richContent])
    expect(formatStatsTable(result.stats)).toContain('Jade Empire Statistics')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recommendations', () => {
    const result = formatRecommendations(['Fix X', 'Improve Y'])
    expect(result).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildJadeEmpireResult(['a.ts'], [richContent])
    expect(formatResultTable(result)).toContain('Jade Empire Analysis')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildJadeEmpireResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.artifacts).toHaveLength(1)
  })
})

// ─── Integration ────────────────────────────────────────

describe('rich content integration', () => {
  it('all measures score rich content well', async () => {
    const result = await buildJadeEmpireResult(['test.ts'], [richContent])
    expect(result.artifacts[0].imperialSerenity).toBeGreaterThan(60)
    expect(result.artifacts[0].jadePurity).toBeGreaterThan(60)
    expect(result.artifacts[0].carvingMastery).toBeGreaterThan(60)
    expect(result.stats.overallHarmony).toBeGreaterThan(60)
  })

  it('meditating booleans match richContent', () => {
    const result = measureMeditating(richContent)
    expect(result.hasReadable).toBe(true)
    expect(result.hasClear).toBe(true)
    expect(result.hasCalm).toBe(true)
    expect(result.hasTranquil).toBe(true)
    expect(result.hasBalanced).toBe(true)
  })

  it('purifying booleans match richContent', () => {
    const result = measurePurifying(richContent)
    expect(result.hasClean).toBe(true)
    expect(result.hasNoHack).toBe(true)
    expect(result.hasNoWorkaround).toBe(true)
    expect(result.hasNoTodo).toBe(true)
    expect(result.hasUnblemished).toBe(true)
  })

  it('carving booleans match richContent', () => {
    const result = measureCarving(richContent)
    expect(result.hasWellStructured).toBe(true)
    expect(result.hasModular).toBe(true)
    expect(result.hasTypeSafe).toBe(true)
    expect(result.hasPolished).toBe(true)
    expect(result.hasElegant).toBe(true)
  })

  it('knowing booleans match richContent', () => {
    const result = measureKnowing(richContent)
    expect(result.hasWellArchitected).toBe(true)
    expect(result.hasPrincipled).toBe(true)
    expect(result.hasMature).toBe(true)
    expect(result.hasInsightful).toBe(true)
    expect(result.hasComprehensive).toBe(true)
  })
})
