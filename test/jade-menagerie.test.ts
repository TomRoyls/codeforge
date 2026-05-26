import { describe, expect, it } from 'vitest'

import {
  analyzeJadeCreature,
  analyzeJadeGallery,
  buildJadeMenagerieResult,
  classifyCuratorGrade,
  classifyGalleryCondition,
  classifyGalleryType,
  classifyJadeCondition,
  generateRecommendations,
  measureCalming,
  measureContinuing,
  measureKnowing,
  measurePurifying,
  measureSculpting,
} from '../src/commands/jade-menagerie-helpers.js'
import type { JadeMenagerieResult } from '../src/commands/jade-menagerie-helpers.js'
import {
  colorCuratorGrade,
  colorGalleryCondition,
  colorGalleryType,
  colorJadeCondition,
  colorScore,
  formatCreatureTable,
  formatCreaturesTable,
  formatGalleryTable,
  formatGalleriesTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/jade-menagerie-format-helpers.js'

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

const richSer = measureCalming(richContent).serenity
const richMst = measureSculpting(richContent).mastery
const richPur = measurePurifying(richContent).purity
const richCon = measureContinuing(richContent).continuity
const richWis = measureKnowing(richContent).wisdom

function makeStats(overrides: Partial<JadeMenagerieResult['stats']> = {}): JadeMenagerieResult['stats'] {
  return {
    totalFiles: 1,
    totalGalleries: 1,
    avgImperialSerenity: 50,
    avgCarvingMastery: 50,
    avgJadePurity: 50,
    avgDynastyContinuity: 50,
    avgNephriteWisdom: 50,
    jadeMasterpieceCount: 0,
    imperialCarvingCount: 0,
    properNephriteCount: 0,
    commonStoneCount: 0,
    rawBoulderCount: 0,
    voidCount: 0,
    hasHighSerenityCount: 1,
    hasHighMasteryCount: 1,
    hasHighPurityCount: 1,
    hasHighContinuityCount: 1,
    hasHighWisdomCount: 1,
    overallHarmony: 50,
    curatorGrade: 'proper-keeper',
    bestCreature: 'a.ts',
    mostSerene: 'a.ts',
    mostMasterful: 'a.ts',
    purest: 'a.ts',
    mostEnduring: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureCalming ─────────────────────────────────────

describe('measureCalming', () => {
  it('scores rich content highly', () => {
    const result = measureCalming(richContent)
    expect(result.serenity).toBeGreaterThan(60)
    expect(result.hasHighSerenity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureCalming(emptyContent).serenity).toBeLessThan(richSer)
  })

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureCalming(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureCalming(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts chaotic keywords', () => {
    const content = 'const chaotic = 1; const messy = 2; const disordered = 3; const jumbled = 4'
    const result = measureCalming(content)
    expect(result.chaoticCount).toBe(4)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects hasComposed (JSDoc)', () => {
    expect(measureCalming(richContent).hasComposed).toBe(true)
  })

  it('detects hasTranquil (async/await/Promise)', () => {
    expect(measureCalming(richContent).hasTranquil).toBe(true)
  })

  it('classifies composure correctly for high scores', () => {
    const result = measureCalming(richContent)
    expect(['forbidden-city', 'imperial-garden', 'proper-court']).toContain(result.composure)
  })

  it('classifies composure correctly for low scores', () => {
    expect(measureCalming(emptyContent).composure).not.toBe('forbidden-city')
  })
})

// ─── measureSculpting ───────────────────────────────────

describe('measureSculpting', () => {
  it('scores rich content highly', () => {
    const result = measureSculpting(richContent)
    expect(result.mastery).toBeGreaterThan(60)
    expect(result.hasHighMastery).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureSculpting(emptyContent).mastery).toBeLessThan(richMst)
  })

  it('counts spaghetti keywords', () => {
    const content = 'const spaghetti = 1; const tangled = 2; const twisted = 3; const knotted = 4'
    const result = measureSculpting(content)
    expect(result.spaghettiCount).toBe(4)
    expect(result.hasNoSpaghetti).toBe(false)
  })

  it('counts monolithic keywords', () => {
    const content = 'const monolithic = 1; const god.object = 2; const mega = 3'
    const result = measureSculpting(content)
    expect(result.monolithicCount).toBe(3)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureSculpting(richContent).hasTypeSafe).toBe(true)
  })

  it('detects hasCrafted (JSDoc)', () => {
    expect(measureSculpting(richContent).hasCrafted).toBe(true)
  })

  it('classifies craft correctly for high scores', () => {
    const result = measureSculpting(richContent)
    expect(['master-carver', 'skilled-artisan', 'proper-craftsman']).toContain(result.craft)
  })

  it('classifies craft correctly for low scores', () => {
    expect(measureSculpting(emptyContent).craft).not.toBe('master-carver')
  })
})

// ─── measurePurifying ───────────────────────────────────

describe('measurePurifying', () => {
  it('scores rich content highly', () => {
    const result = measurePurifying(richContent)
    expect(result.purity).toBeGreaterThan(60)
    expect(result.hasHighPurity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measurePurifying(emptyContent).purity).toBeLessThan(richPur)
  })

  it('counts hack keywords', () => {
    const content = 'const hack = 1; const kludge = 2'
    const result = measurePurifying(content)
    expect(result.hackCount).toBe(2)
    expect(result.hasNoHack).toBe(false)
  })

  it('counts workaround keywords', () => {
    const content = 'const workaround = 1; const tempfix = 2; const quickfix = 3'
    const result = measurePurifying(content)
    expect(result.workaroundCount).toBe(3)
    expect(result.hasNoWorkaround).toBe(false)
  })

  it('detects hasNoTodo', () => {
    expect(measurePurifying(richContent).hasNoTodo).toBe(true)
  })

  it('detects hasNoDebugCode', () => {
    expect(measurePurifying(richContent).hasNoDebugCode).toBe(true)
  })

  it('classifies grade correctly for high scores', () => {
    const result = measurePurifying(richContent)
    expect(['imperial-jade', 'fine-nephrite', 'proper-jade']).toContain(result.grade)
  })

  it('classifies grade correctly for low scores', () => {
    expect(measurePurifying(emptyContent).grade).not.toBe('imperial-jade')
  })
})

// ─── measureContinuing ──────────────────────────────────

describe('measureContinuing', () => {
  it('scores rich content highly', () => {
    const result = measureContinuing(richContent)
    expect(result.continuity).toBeGreaterThan(60)
    expect(result.hasHighContinuity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureContinuing(emptyContent).continuity).toBeLessThan(richCon)
  })

  it('detects hasTested (try/catch)', () => {
    expect(measureContinuing(richContent).hasTested).toBe(true)
  })

  it('counts fragile keywords', () => {
    const content = 'const fragile = 1; const brittle = 2; const delicate = 3; const flimsy = 4'
    const result = measureContinuing(content)
    expect(result.fragileCount).toBe(4)
    expect(result.hasNoFragile).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureContinuing(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasDocumented (JSDoc)', () => {
    expect(measureContinuing(richContent).hasDocumented).toBe(true)
  })

  it('classifies era correctly for high scores', () => {
    const result = measureContinuing(richContent)
    expect(['ming-dynasty', 'tang-period', 'proper-era']).toContain(result.era)
  })

  it('classifies era correctly for low scores', () => {
    expect(measureContinuing(emptyContent).era).not.toBe('ming-dynasty')
  })
})

// ─── measureKnowing ─────────────────────────────────────

describe('measureKnowing', () => {
  it('scores rich content highly', () => {
    const result = measureKnowing(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureKnowing(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects hasWellArchitected (class/interface/type)', () => {
    expect(measureKnowing(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureKnowing(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureKnowing(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects hasPrincipled (no any)', () => {
    expect(measureKnowing(richContent).hasPrincipled).toBe(true)
  })

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureKnowing(richContent).hasInsightful).toBe(true)
  })

  it('classifies sage correctly for high scores', () => {
    const result = measureKnowing(richContent)
    expect(['jade-emperor', 'court-scholar', 'proper-artisan']).toContain(result.sage)
  })

  it('classifies sage correctly for low scores', () => {
    expect(measureKnowing(emptyContent).sage).not.toBe('jade-emperor')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyJadeCondition', () => {
  it('returns jade-masterpiece for 90+', () => {
    expect(classifyJadeCondition(90)).toBe('jade-masterpiece')
    expect(classifyJadeCondition(95)).toBe('jade-masterpiece')
  })

  it('returns imperial-carving for 75-89', () => {
    expect(classifyJadeCondition(75)).toBe('imperial-carving')
  })

  it('returns proper-nephrite for 60-74', () => {
    expect(classifyJadeCondition(60)).toBe('proper-nephrite')
  })

  it('returns common-stone for 40-59', () => {
    expect(classifyJadeCondition(40)).toBe('common-stone')
  })

  it('returns raw-boulder for 20-39', () => {
    expect(classifyJadeCondition(20)).toBe('raw-boulder')
  })

  it('returns void below 20', () => {
    expect(classifyJadeCondition(0)).toBe('void')
    expect(classifyJadeCondition(10)).toBe('void')
  })
})

describe('classifyGalleryType', () => {
  it('returns no-gallery for empty creatures', () => {
    expect(classifyGalleryType([])).toBe('no-gallery')
  })

  it('returns imperial-collection for avg >= 85', () => {
    const creatures = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyGalleryType(creatures)).toBe('imperial-collection')
  })

  it('returns empty-case for low avg', () => {
    const creatures = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyGalleryType(creatures)).toBe('empty-case')
  })
})

describe('classifyGalleryCondition', () => {
  it('returns jade-palace for 85+', () => {
    expect(classifyGalleryCondition(85)).toBe('jade-palace')
  })

  it('returns void below 15', () => {
    expect(classifyGalleryCondition(5)).toBe('void')
  })
})

describe('classifyCuratorGrade', () => {
  it('returns imperial-curator for 80+', () => {
    expect(classifyCuratorGrade(80)).toBe('imperial-curator')
  })

  it('returns street-vendor below 20', () => {
    expect(classifyCuratorGrade(5)).toBe('street-vendor')
  })

  it('returns museum-director for 65-79', () => {
    expect(classifyCuratorGrade(65)).toBe('museum-director')
  })

  it('returns proper-keeper for 50-64', () => {
    expect(classifyCuratorGrade(50)).toBe('proper-keeper')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyCuratorGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyCuratorGrade(20)).toBe('novice')
  })
})

// ─── analyzeJadeCreature ────────────────────────────────

describe('analyzeJadeCreature', () => {
  it('creates a creature with all 5 measures', () => {
    const creature = analyzeJadeCreature(richContent, 'app.ts')
    expect(creature.file).toBe('app.ts')
    expect(typeof creature.imperialSerenity).toBe('number')
    expect(typeof creature.carvingMastery).toBe('number')
    expect(typeof creature.jadePurity).toBe('number')
    expect(typeof creature.dynastyContinuity).toBe('number')
    expect(typeof creature.nephriteWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const creature = analyzeJadeCreature(richContent, 'app.ts')
    const expected = Math.round(
      creature.imperialSerenity * 0.2 +
      creature.carvingMastery * 0.2 +
      creature.jadePurity * 0.2 +
      creature.dynastyContinuity * 0.2 +
      creature.nephriteWisdom * 0.2,
    )
    expect(creature.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const creature = analyzeJadeCreature(richContent, 'app.ts')
    expect(creature.condition).toBe(classifyJadeCondition(creature.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richCreature = analyzeJadeCreature(richContent, 'rich.ts')
    const emptyCreature = analyzeJadeCreature(emptyContent, 'empty.ts')
    expect(richCreature.qualityScore).toBeGreaterThan(emptyCreature.qualityScore)
  })
})

// ─── analyzeJadeGallery ────────────────────────────────

describe('analyzeJadeGallery', () => {
  it('returns empty gallery for no creatures', () => {
    const gallery = analyzeJadeGallery([], 'src')
    expect(gallery.directory).toBe('src')
    expect(gallery.creatures).toEqual([])
    expect(gallery.galleryType).toBe('no-gallery')
    expect(gallery.condition).toBe('void')
  })

  it('computes averages from creatures', () => {
    const creatures = [analyzeJadeCreature(richContent, 'a.ts'), analyzeJadeCreature(richContent, 'b.ts')]
    const gallery = analyzeJadeGallery(creatures, 'src')
    expect(gallery.avgSerenity).toBeGreaterThan(0)
    expect(gallery.avgMastery).toBeGreaterThan(0)
    expect(gallery.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildJadeMenagerieResult ──────────────────────────

describe('buildJadeMenagerieResult', () => {
  it('returns full result structure', async () => {
    const result = await buildJadeMenagerieResult(['a.ts'], [richContent])
    expect(result.creatures).toHaveLength(1)
    expect(result.galleries).toHaveLength(1)
    expect(result.palace).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into galleries', async () => {
    const result = await buildJadeMenagerieResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.galleries.length).toBe(2)
  })

  it('computes palace overview', async () => {
    const result = await buildJadeMenagerieResult(['a.ts'], [richContent])
    expect(result.palace.avgSerenity).toBeGreaterThan(0)
    expect(result.palace.isJade).toBe(true)
    expect(result.palace.overallHarmony).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildJadeMenagerieResult([], [])
    expect(result.creatures).toHaveLength(0)
    expect(result.galleries).toHaveLength(0)
    expect(result.palace.overallHarmony).toBe(0)
    expect(result.palace.isJade).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildJadeMenagerieResult(['a.ts'], [richContent])
    const total = result.stats.jadeMasterpieceCount +
      result.stats.imperialCarvingCount +
      result.stats.properNephriteCount +
      result.stats.commonStoneCount +
      result.stats.rawBoulderCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildJadeMenagerieResult(['a.ts'], [richContent])
    expect(result.stats.hasHighSerenityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighMasteryCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPurityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighContinuityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best creature and top performers', async () => {
    const result = await buildJadeMenagerieResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestCreature).toBeTruthy()
    expect(result.stats.mostSerene).toBeTruthy()
    expect(result.stats.mostMasterful).toBeTruthy()
    expect(result.stats.purest).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes curator grade from overall harmony', async () => {
    const result = await buildJadeMenagerieResult(['a.ts'], [richContent])
    expect(result.stats.curatorGrade).toBe(classifyCuratorGrade(result.stats.overallHarmony))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgImperialSerenity: 90,
      avgCarvingMastery: 90,
      avgJadePurity: 90,
      avgDynastyContinuity: 90,
      avgNephriteWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgSerenity: 90, avgMastery: 90, avgWisdom: 90, isJade: true, overallHarmony: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('imperial masterpieces')
  })

  it('recommends serenity when < 60', () => {
    const stats = makeStats({ avgImperialSerenity: 50 })
    const result = generateRecommendations([], [], { avgSerenity: 50, avgMastery: 50, avgWisdom: 50, isJade: false, overallHarmony: 50 }, stats)
    expect(result.some((r) => r.includes('serenity') || r.includes('imperial'))).toBe(true)
  })

  it('recommends mastery when < 60', () => {
    const stats = makeStats({ avgCarvingMastery: 50 })
    const result = generateRecommendations([], [], { avgSerenity: 50, avgMastery: 50, avgWisdom: 50, isJade: false, overallHarmony: 50 }, stats)
    expect(result.some((r) => r.includes('mastery') || r.includes('carving'))).toBe(true)
  })

  it('recommends purity when < 60', () => {
    const stats = makeStats({ avgJadePurity: 50 })
    const result = generateRecommendations([], [], { avgSerenity: 50, avgMastery: 50, avgWisdom: 50, isJade: false, overallHarmony: 50 }, stats)
    expect(result.some((r) => r.includes('purity') || r.includes('jade'))).toBe(true)
  })

  it('recommends continuity when < 60', () => {
    const stats = makeStats({ avgDynastyContinuity: 50 })
    const result = generateRecommendations([], [], { avgSerenity: 50, avgMastery: 50, avgWisdom: 50, isJade: false, overallHarmony: 50 }, stats)
    expect(result.some((r) => r.includes('continuity') || r.includes('dynasty'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgNephriteWisdom: 50 })
    const result = generateRecommendations([], [], { avgSerenity: 50, avgMastery: 50, avgWisdom: 50, isJade: false, overallHarmony: 50 }, stats)
    expect(result.some((r) => r.includes('wisdom') || r.includes('nephrite'))).toBe(true)
  })

  it('warns about disrepair when harmony < 40', () => {
    const stats = makeStats({ overallHarmony: 30 })
    const result = generateRecommendations([], [], { avgSerenity: 30, avgMastery: 30, avgWisdom: 30, isJade: false, overallHarmony: 30 }, stats)
    expect(result.some((r) => r.includes('disrepair'))).toBe(true)
  })

  it('lists void creatures by name when <= 5', () => {
    const creatures = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(creatures, [], { avgSerenity: 50, avgMastery: 50, avgWisdom: 50, isJade: false, overallHarmony: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void creatures when > 5', () => {
    const creatures = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(creatures, [], { avgSerenity: 50, avgMastery: 50, avgWisdom: 50, isJade: false, overallHarmony: 50 }, stats)
    expect(result.some((r) => r.includes('6 raw boulders'))).toBe(true)
  })

  it('warns when all galleries are poor', () => {
    const galleries = [{ condition: 'empty-room' as const, galleryType: 'empty-case' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], galleries as Array<{ condition: string; galleryType: string }>, { avgSerenity: 50, avgMastery: 50, avgWisdom: 50, isJade: false, overallHarmony: 50 }, stats)
    expect(result.some((r) => r.includes('empty rooms'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgImperialSerenity: 70,
      avgCarvingMastery: 70,
      avgJadePurity: 70,
      avgDynastyContinuity: 70,
      avgNephriteWisdom: 70,
      overallHarmony: 70,
    })
    const result = generateRecommendations([], [], { avgSerenity: 70, avgMastery: 70, avgWisdom: 70, isJade: true, overallHarmony: 70 }, stats)
    expect(result.some((r) => r.includes('imperial harmony'))).toBe(true)
  })
})

// ─── Format helpers ──────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns different colors for different ranges', () => {
    expect(colorScore(95)).not.toBe(colorScore(10))
  })
})

describe('colorJadeCondition', () => {
  it('colors jade-masterpiece', () => {
    expect(typeof colorJadeCondition('jade-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorJadeCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorJadeCondition('unknown')).toBe('string')
  })
})

describe('colorGalleryType', () => {
  it('colors imperial-collection', () => {
    expect(typeof colorGalleryType('imperial-collection')).toBe('string')
  })

  it('colors no-gallery', () => {
    expect(typeof colorGalleryType('no-gallery')).toBe('string')
  })
})

describe('colorGalleryCondition', () => {
  it('colors jade-palace', () => {
    expect(typeof colorGalleryCondition('jade-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorGalleryCondition('void')).toBe('string')
  })
})

describe('colorCuratorGrade', () => {
  it('colors imperial-curator', () => {
    expect(typeof colorCuratorGrade('imperial-curator')).toBe('string')
  })

  it('colors street-vendor', () => {
    expect(typeof colorCuratorGrade('street-vendor')).toBe('string')
  })
})

describe('formatCreatureTable', () => {
  it('formats a creature with all measures', () => {
    const creature = analyzeJadeCreature(richContent, 'app.ts')
    const output = formatCreatureTable(creature)
    expect(output).toContain('Jade Creature: app.ts')
    expect(output).toContain('Imperial Serenity')
    expect(output).toContain('Carving Mastery')
    expect(output).toContain('Jade Purity')
    expect(output).toContain('Dynasty Continuity')
    expect(output).toContain('Nephrite Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatCreaturesTable', () => {
  it('shows no creatures message for empty array', () => {
    expect(formatCreaturesTable([])).toContain('No jade creatures')
  })

  it('lists creatures in output', () => {
    const creatures = [analyzeJadeCreature(richContent, 'a.ts')]
    expect(formatCreaturesTable(creatures)).toContain('a.ts')
  })
})

describe('formatGalleryTable', () => {
  it('formats a gallery with all fields', () => {
    const creatures = [analyzeJadeCreature(richContent, 'a.ts')]
    const gallery = analyzeJadeGallery(creatures, 'src')
    const output = formatGalleryTable(gallery)
    expect(output).toContain('Jade Gallery: src')
    expect(output).toContain('Creatures')
    expect(output).toContain('Avg Serenity')
  })
})

describe('formatGalleriesTable', () => {
  it('shows no galleries message for empty array', () => {
    expect(formatGalleriesTable([])).toContain('No jade galleries')
  })

  it('lists galleries in output', () => {
    const creatures = [analyzeJadeCreature(richContent, 'a.ts')]
    const gallery = analyzeJadeGallery(creatures, 'src')
    expect(formatGalleriesTable([gallery])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildJadeMenagerieResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Jade Menagerie Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Curator Grade')
    expect(output).toContain('Best Creature')
  })
})

describe('formatRecommendations', () => {
  it('shows no recommendations message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('lists recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildJadeMenagerieResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Jade Menagerie Analysis')
    expect(output).toContain('Palace Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildJadeMenagerieResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.creatures).toHaveLength(1)
    expect(parsed.palace).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
