import { describe, expect, it } from 'vitest'

import {
  analyzeSpringBlossom,
  buildSpringBloomResult,
  measureAdaptation,
  measureBlossom,
  measureBud,
  measureHealth,
  measurePollination,
  measureRoot,
} from '../src/commands/spring-bloom-helpers.js'
import {
  budTypeColor,
  conditionColor,
  formatSpringBloomJson,
  formatSpringBloomTable,
  gradeColor,
  scoreColor,
} from '../src/commands/spring-bloom-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `export interface Item { name: string; value: number }
export type ItemMap = Record<string, Item>
export enum Status { Active = 'active', Inactive = 'inactive' }
export class Container<T> { private items: T[] = []; protected backup: T[] = []; add(item: T): void { this.items.push(item) } remove(index: number): T { return this.items.splice(index, 1)[0] } }
export function processItems(items: Item[]): ItemMap { const result: ItemMap = {}; for (const item of items) { result[item.name] = item } return result }
export const createItem = (name: string, value: number): Item => ({ name, value })
export async function fetchItems(): Promise<Item[]> { try { const data = await Promise.resolve([{ name: 'test', value: 1 }]); return data } catch { console.error('Failed'); return [] } }
export { Container, processItems }
/** Documentation block */ export function documented(): void { if (true) { if (true) { if (true) { console.error('deep') } } } }
`

const EMPTY = ''

const MEDIUM = `export class Simple { getName(): string { return 'test' } }
export function helper(): void { console.log('debug') }`

// ─── measureBud ─────────────────────────────────────────────────────────────

describe('measureBud', () => {
  it('RICH: returns correct vitality and type', () => {
    const result = measureBud(RICH)
    expect(result.vitality).toBe(87)
    expect(result.type).toBe('tulip')
    expect(result.frostbiteCount).toBe(0)
    expect(result.blightCount).toBe(4)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureBud(RICH)
    expect(result.hasHighVitality).toBe(true)
    expect(result.hasProperFormation).toBe(true)
    expect(result.hasNoFrostbite).toBe(true)
    expect(result.hasProperSwelling).toBe(true)
    expect(result.hasProtectiveScales).toBe(true)
    expect(result.hasNoPremature).toBe(false)
    expect(result.hasDormancyRecovery).toBe(true)
    expect(result.hasProperTiming).toBe(false)
    expect(result.hasNoBlight).toBe(false)
    expect(result.hasReadyToOpen).toBe(true)
  })

  it('EMPTY: returns correct scores and type', () => {
    const result = measureBud(EMPTY)
    expect(result.vitality).toBe(33)
    expect(result.type).toBe('dandelion')
    expect(result.frostbiteCount).toBe(0)
    expect(result.blightCount).toBe(0)
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureBud(EMPTY)
    expect(result.hasHighVitality).toBe(false)
    expect(result.hasNoFrostbite).toBe(true)
    expect(result.hasNoBlight).toBe(true)
    expect(result.hasReadyToOpen).toBe(false)
  })

  it('MEDIUM: returns correct scores', () => {
    const result = measureBud(MEDIUM)
    expect(result.vitality).toBe(59)
    expect(result.type).toBe('dandelion')
  })
})

// ─── measureBlossom ─────────────────────────────────────────────────────────

describe('measureBlossom', () => {
  it('RICH: returns correct quality and form', () => {
    const result = measureBlossom(RICH)
    expect(result.quality).toBe(90)
    expect(result.form).toBe('opening')
    expect(result.wiltingCount).toBe(2)
    expect(result.petalDropCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureBlossom(RICH)
    expect(result.hasBeautifulBlossom).toBe(true)
    expect(result.hasProperPetals).toBe(true)
    expect(result.hasVibrantColor).toBe(true)
    expect(result.hasProperFragrance).toBe(true)
    expect(result.hasNoWilting).toBe(false)
    expect(result.hasFullDisplay).toBe(true)
    expect(result.hasProperStructure).toBe(false)
    expect(result.hasNoDeformity).toBe(false)
    expect(result.hasPeakBloom).toBe(true)
    expect(result.hasNoPetalDrop).toBe(false)
  })

  it('EMPTY: returns correct scores', () => {
    const result = measureBlossom(EMPTY)
    expect(result.quality).toBe(30)
    expect(result.form).toBe('dead')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureBlossom(EMPTY)
    expect(result.hasNoWilting).toBe(true)
    expect(result.hasNoPetalDrop).toBe(true)
    expect(result.hasBeautifulBlossom).toBe(false)
  })

  it('MEDIUM: returns correct scores', () => {
    const result = measureBlossom(MEDIUM)
    expect(result.quality).toBe(55)
    expect(result.form).toBe('wilted')
  })
})

// ─── measureRoot ────────────────────────────────────────────────────────────

describe('measureRoot', () => {
  it('RICH: returns correct depth and system', () => {
    const result = measureRoot(RICH)
    expect(result.depth).toBe(90)
    expect(result.system).toBe('fibrous')
    expect(result.rootRotCount).toBe(0)
    expect(result.girdlingCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureRoot(RICH)
    expect(result.hasDeepRoots).toBe(true)
    expect(result.hasProperAnchorage).toBe(true)
    expect(result.hasNutrientAbsorption).toBe(false)
    expect(result.hasNoRootRot).toBe(true)
    expect(result.hasMycorrhizae).toBe(false)
    expect(result.hasProperSpread).toBe(true)
    expect(result.hasNoGirdling).toBe(false)
    expect(result.hasWaterUptake).toBe(true)
    expect(result.hasNoCompaction).toBe(false)
    expect(result.hasStorageCapacity).toBe(true)
  })

  it('EMPTY: returns correct scores', () => {
    const result = measureRoot(EMPTY)
    expect(result.depth).toBe(30)
    expect(result.system).toBe('floating')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureRoot(EMPTY)
    expect(result.hasNoRootRot).toBe(true)
    expect(result.hasNoGirdling).toBe(true)
    expect(result.hasDeepRoots).toBe(false)
  })

  it('MEDIUM: returns correct scores', () => {
    const result = measureRoot(MEDIUM)
    expect(result.depth).toBe(55)
    expect(result.system).toBe('adventitious')
  })
})

// ─── measurePollination ─────────────────────────────────────────────────────

describe('measurePollination', () => {
  it('RICH: returns correct rate and vector', () => {
    const result = measurePollination(RICH)
    expect(result.rate).toBe(80)
    expect(result.vector).toBe('bird')
    expect(result.barrierCount).toBe(2)
    expect(result.sterilityCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measurePollination(RICH)
    expect(result.hasHighPollination).toBe(false)
    expect(result.hasCrossPollination).toBe(false)
    expect(result.hasSelfPollination).toBe(true)
    expect(result.hasAttractants).toBe(true)
    expect(result.hasNoBarriers).toBe(false)
    expect(result.hasProperNectar).toBe(true)
    expect(result.hasPollenTransfer).toBe(false)
    expect(result.hasNoSterility).toBe(false)
    expect(result.hasProperTiming).toBe(true)
    expect(result.hasSeedProduction).toBe(true)
  })

  it('EMPTY: returns correct scores', () => {
    const result = measurePollination(EMPTY)
    expect(result.rate).toBe(28)
    expect(result.vector).toBe('none')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measurePollination(EMPTY)
    expect(result.hasNoBarriers).toBe(true)
    expect(result.hasNoSterility).toBe(true)
    expect(result.hasHighPollination).toBe(false)
  })

  it('MEDIUM: returns correct scores', () => {
    const result = measurePollination(MEDIUM)
    expect(result.rate).toBe(52)
    expect(result.vector).toBe('self')
  })
})

// ─── measureAdaptation ──────────────────────────────────────────────────────

describe('measureAdaptation', () => {
  it('RICH: returns correct level and season', () => {
    const result = measureAdaptation(RICH)
    expect(result.level).toBe(91)
    expect(result.season).toBe('spring-ephemeral')
    expect(result.mismatchCount).toBe(0)
    expect(result.heatStressCount).toBe(4)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureAdaptation(RICH)
    expect(result.hasHighAdaptation).toBe(true)
    expect(result.hasPhenologicalTiming).toBe(false)
    expect(result.hasNoSeasonalMismatch).toBe(true)
    expect(result.hasClimateAdaptation).toBe(true)
    expect(result.hasDroughtTolerance).toBe(true)
    expect(result.hasFrostResistance).toBe(true)
    expect(result.hasNoVernalization).toBe(false)
    expect(result.hasPhotoperiodResponse).toBe(true)
    expect(result.hasNoHeatStress).toBe(false)
    expect(result.hasFlexibleBloom).toBe(true)
  })

  it('EMPTY: returns correct scores', () => {
    const result = measureAdaptation(EMPTY)
    expect(result.level).toBe(29)
    expect(result.season).toBe('annual')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureAdaptation(EMPTY)
    expect(result.hasNoSeasonalMismatch).toBe(true)
    expect(result.hasFrostResistance).toBe(true)
    expect(result.hasHighAdaptation).toBe(false)
  })

  it('MEDIUM: returns correct scores', () => {
    const result = measureAdaptation(MEDIUM)
    expect(result.level).toBe(53)
    expect(result.season).toBe('winter-hardy')
  })
})

// ─── measureHealth ──────────────────────────────────────────────────────────

describe('measureHealth', () => {
  it('RICH: returns correct score and status', () => {
    const result = measureHealth(RICH)
    expect(result.score).toBe(90)
    expect(result.status).toBe('blooming')
    expect(result.diseaseCount).toBe(0)
    expect(result.pestCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureHealth(RICH)
    expect(result.hasGoodHealth).toBe(true)
    expect(result.hasNoDisease).toBe(true)
    expect(result.hasNoPests).toBe(false)
    expect(result.hasProperNutrition).toBe(false)
    expect(result.hasNoFungalInfection).toBe(false)
    expect(result.hasGoodImmuneResponse).toBe(true)
    expect(result.hasNoNutrientDeficiency).toBe(true)
    expect(result.hasProperGrowth).toBe(true)
    expect(result.hasNoChlorosis).toBe(false)
    expect(result.hasVigor).toBe(false)
  })

  it('EMPTY: returns correct scores', () => {
    const result = measureHealth(EMPTY)
    expect(result.score).toBe(35)
    expect(result.status).toBe('dormant')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureHealth(EMPTY)
    expect(result.hasNoDisease).toBe(true)
    expect(result.hasNoPests).toBe(true)
    expect(result.hasGoodHealth).toBe(false)
  })

  it('MEDIUM: returns correct scores', () => {
    const result = measureHealth(MEDIUM)
    expect(result.score).toBe(60)
    expect(result.status).toBe('dormant')
  })
})

// ─── analyzeSpringBlossom ───────────────────────────────────────────────────

describe('analyzeSpringBlossom', () => {
  it('RICH: returns correct aggregate scores', () => {
    const block = analyzeSpringBlossom(RICH, 'rich.ts')
    expect(block.budVitality).toBe(87)
    expect(block.blossomQuality).toBe(90)
    expect(block.rootDepth).toBe(90)
    expect(block.pollinationRate).toBe(80)
    expect(block.seasonalAdaptation).toBe(91)
    expect(block.gardenHealth).toBe(90)
    expect(block.qualityScore).toBe(88)
  })

  it('RICH: returns correct condition and classifications', () => {
    const block = analyzeSpringBlossom(RICH, 'rich.ts')
    expect(block.condition).toBe('cherry-blossom-avenue')
    expect(block.bud.type).toBe('tulip')
    expect(block.blossom.form).toBe('opening')
    expect(block.root.system).toBe('fibrous')
    expect(block.pollination.vector).toBe('bird')
    expect(block.adaptation.season).toBe('spring-ephemeral')
    expect(block.health.status).toBe('blooming')
  })

  it('EMPTY: returns correct all fields', () => {
    const block = analyzeSpringBlossom(EMPTY, 'empty.ts')
    expect(block.qualityScore).toBe(31)
    expect(block.condition).toBe('window-box')
    expect(block.budVitality).toBe(33)
    expect(block.blossomQuality).toBe(30)
    expect(block.rootDepth).toBe(30)
    expect(block.pollinationRate).toBe(28)
    expect(block.seasonalAdaptation).toBe(29)
    expect(block.gardenHealth).toBe(35)
    expect(block.bud.type).toBe('dandelion')
    expect(block.blossom.form).toBe('dead')
    expect(block.root.system).toBe('floating')
    expect(block.pollination.vector).toBe('none')
    expect(block.adaptation.season).toBe('annual')
    expect(block.health.status).toBe('dormant')
  })

  it('MEDIUM: returns correct all fields', () => {
    const block = analyzeSpringBlossom(MEDIUM, 'medium.ts')
    expect(block.qualityScore).toBe(56)
    expect(block.condition).toBe('wildflower-meadow')
    expect(block.bud.type).toBe('dandelion')
    expect(block.blossom.form).toBe('wilted')
    expect(block.root.system).toBe('adventitious')
    expect(block.pollination.vector).toBe('self')
    expect(block.adaptation.season).toBe('winter-hardy')
    expect(block.health.status).toBe('dormant')
  })
})

// ─── buildSpringBloomResult ─────────────────────────────────────────────────

describe('buildSpringBloomResult', () => {
  it('SINGLE RICH: returns correct meadow', () => {
    const result = buildSpringBloomResult(['rich.ts'], [RICH])
    expect(result.meadow.overallBloom).toBe(88)
    expect(result.meadow.avgVitality).toBe(87)
    expect(result.meadow.avgQuality).toBe(90)
    expect(result.meadow.avgHealth).toBe(90)
    expect(result.meadow.isFlourishing).toBe(true)
  })

  it('SINGLE RICH: returns correct stats', () => {
    const result = buildSpringBloomResult(['rich.ts'], [RICH])
    expect(result.stats.gardenerGrade).toBe('master-horticulturist')
    expect(result.stats.avgBudVitality).toBe(87)
    expect(result.stats.avgBlossomQuality).toBe(90)
    expect(result.stats.avgRootDepth).toBe(90)
    expect(result.stats.avgPollinationRate).toBe(80)
    expect(result.stats.avgSeasonalAdaptation).toBe(91)
    expect(result.stats.avgGardenHealth).toBe(90)
    expect(result.stats.cherryBlossomAvenueCount).toBe(1)
  })

  it('EMPTY: returns correct empty result', () => {
    const result = buildSpringBloomResult([], [])
    expect(result.meadow.overallBloom).toBe(0)
    expect(result.stats.gardenerGrade).toBe('concrete-lover')
    expect(result.gardens).toHaveLength(0)
    expect(result.blossoms).toHaveLength(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('MIXED: returns correct meadow', () => {
    const result = buildSpringBloomResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.meadow.overallBloom).toBe(58)
    expect(result.meadow.isFlourishing).toBe(false)
  })

  it('MIXED: returns correct stats counts', () => {
    const result = buildSpringBloomResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.stats.gardenerGrade).toBe('gardener')
    expect(result.stats.avgBudVitality).toBe(60)
    expect(result.stats.avgBlossomQuality).toBe(58)
    expect(result.stats.avgRootDepth).toBe(58)
    expect(result.stats.avgPollinationRate).toBe(53)
    expect(result.stats.avgSeasonalAdaptation).toBe(58)
    expect(result.stats.avgGardenHealth).toBe(62)
    expect(result.stats.cherryBlossomAvenueCount).toBe(1)
    expect(result.stats.wildflowerMeadowCount).toBe(1)
    expect(result.stats.compostCount).toBe(0)
  })

  it('MIXED: returns correct garden', () => {
    const result = buildSpringBloomResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.gardens).toHaveLength(1)
    expect(result.gardens[0].gardenType).toBe('cottage-garden')
    expect(result.gardens[0].condition).toBe('community-garden')
    expect(result.gardens[0].cherryAvenueCount).toBe(1)
  })

  it('MIXED: returns correct highlights', () => {
    const result = buildSpringBloomResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.stats.bestBlossom).toBe('a.ts')
    expect(result.stats.mostVital).toBe('a.ts')
    expect(result.stats.mostBeautiful).toBe('a.ts')
    expect(result.stats.deepestRooted).toBe('a.ts')
    expect(result.stats.mostReusable).toBe('a.ts')
    expect(result.stats.healthiest).toBe('a.ts')
  })

  it('MIXED: generates recommendations', () => {
    const result = buildSpringBloomResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── scoreColor ─────────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns green for >= 80', () => {
    expect(scoreColor(90)).toContain('90')
  })
  it('returns yellow for >= 60', () => {
    expect(scoreColor(70)).toContain('70')
  })
  it('returns orange for >= 40', () => {
    expect(scoreColor(50)).toContain('50')
  })
  it('returns red for < 40', () => {
    expect(scoreColor(20)).toContain('20')
  })
})

// ─── conditionColor ─────────────────────────────────────────────────────────

describe('conditionColor', () => {
  it('colors cherry-blossom-avenue', () => {
    expect(conditionColor('cherry-blossom-avenue')).toContain('cherry-blossom-avenue')
  })
  it('colors tulip-field', () => {
    expect(conditionColor('tulip-field')).toContain('tulip-field')
  })
  it('colors wildflower-meadow', () => {
    expect(conditionColor('wildflower-meadow')).toContain('wildflower-meadow')
  })
  it('colors garden-bed', () => {
    expect(conditionColor('garden-bed')).toContain('garden-bed')
  })
  it('colors window-box', () => {
    expect(conditionColor('window-box')).toContain('window-box')
  })
  it('colors compost', () => {
    expect(conditionColor('compost')).toContain('compost')
  })
  it('passes through unknown condition', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

// ─── gradeColor ─────────────────────────────────────────────────────────────

describe('gradeColor', () => {
  it('colors master-horticulturist', () => {
    expect(gradeColor('master-horticulturist')).toContain('master-horticulturist')
  })
  it('colors head-gardener', () => {
    expect(gradeColor('head-gardener')).toContain('head-gardener')
  })
  it('colors gardener', () => {
    expect(gradeColor('gardener')).toContain('gardener')
  })
  it('colors green-thumb', () => {
    expect(gradeColor('green-thumb')).toContain('green-thumb')
  })
  it('colors plant-owner', () => {
    expect(gradeColor('plant-owner')).toContain('plant-owner')
  })
  it('colors concrete-lover', () => {
    expect(gradeColor('concrete-lover')).toContain('concrete-lover')
  })
  it('passes through unknown grade', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })
})

// ─── budTypeColor ───────────────────────────────────────────────────────────

describe('budTypeColor', () => {
  it('colors cherry-blossom', () => {
    expect(budTypeColor('cherry-blossom')).toContain('cherry-blossom')
  })
  it('colors tulip', () => {
    expect(budTypeColor('tulip')).toContain('tulip')
  })
  it('colors daffodil', () => {
    expect(budTypeColor('daffodil')).toContain('daffodil')
  })
  it('colors lily', () => {
    expect(budTypeColor('lily')).toContain('lily')
  })
  it('colors dandelion', () => {
    expect(budTypeColor('dandelion')).toContain('dandelion')
  })
  it('colors dead-seed', () => {
    expect(budTypeColor('dead-seed')).toContain('dead-seed')
  })
  it('passes through unknown type', () => {
    expect(budTypeColor('unknown')).toBe('unknown')
  })
})

// ─── formatSpringBloomJson ──────────────────────────────────────────────────

describe('formatSpringBloomJson', () => {
  it('returns valid JSON string', () => {
    const result = buildSpringBloomResult(['a.ts'], [RICH])
    const json = formatSpringBloomJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.meadow.overallBloom).toBe(88)
    expect(parsed.blossoms).toHaveLength(1)
  })
})

// ─── formatSpringBloomTable ─────────────────────────────────────────────────

describe('formatSpringBloomTable', () => {
  it('returns formatted table string', () => {
    const result = buildSpringBloomResult(['a.ts'], [RICH])
    const table = formatSpringBloomTable(result, false)
    expect(table).toContain('Spring Bloom Analysis')
    expect(table).toContain('Meadow Overview')
    expect(table).toContain('Statistics')
    expect(table).toContain('Condition Counts')
  })

  it('includes per-file details in verbose mode', () => {
    const result = buildSpringBloomResult(['a.ts'], [RICH])
    const table = formatSpringBloomTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('a.ts')
  })

  it('shows recommendations when present', () => {
    const result = buildSpringBloomResult([], [])
    const table = formatSpringBloomTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('shows highlights when bestBlossom exists', () => {
    const result = buildSpringBloomResult(['a.ts'], [RICH])
    const table = formatSpringBloomTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Blossom')
  })
})
