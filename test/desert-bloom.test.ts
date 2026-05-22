import { describe, expect, it } from 'vitest'

import {
  analyzeDesertFlower,
  buildDesertBloomResult,
  measureAdaptation,
  measureBloom,
  measureDrought,
  measureHeat,
  measureSeed,
  measureStorage,
} from '../src/commands/desert-bloom-helpers.js'
import {
  conditionColor,
  formatDesertBloomJson,
  formatDesertBloomTable,
  gradeColor,
  scoreColor,
  strategyColor,
} from '../src/commands/desert-bloom-format-helpers.js'

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

// ─── measureDrought ─────────────────────────────────────────────────────────

describe('measureDrought', () => {
  it('RICH: returns correct tolerance and strategy', () => {
    const result = measureDrought(RICH)
    expect(result.tolerance).toBe(90)
    expect(result.strategy).toBe('ephemeral')
    expect(result.transpirationCount).toBe(2)
    expect(result.bloatCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureDrought(RICH)
    expect(result.hasHighTolerance).toBe(true)
    expect(result.hasWaterConservation).toBe(false)
    expect(result.hasNoWastefulGrowth).toBe(false)
    expect(result.hasEfficientMetabolism).toBe(true)
    expect(result.hasCrassulacean).toBe(true)
    expect(result.hasNoTranspiration).toBe(false)
    expect(result.hasProperStomata).toBe(false)
    expect(result.hasNoOverconsumption).toBe(true)
    expect(result.hasXerophytic).toBe(true)
    expect(result.hasNoBloat).toBe(false)
  })

  it('EMPTY: returns correct scores', () => {
    const result = measureDrought(EMPTY)
    expect(result.tolerance).toBe(40)
    expect(result.strategy).toBe('wilted')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureDrought(EMPTY)
    expect(result.hasNoTranspiration).toBe(true)
    expect(result.hasNoBloat).toBe(true)
    expect(result.hasHighTolerance).toBe(false)
  })

  it('MEDIUM: returns correct scores', () => {
    const result = measureDrought(MEDIUM)
    expect(result.tolerance).toBe(65)
    expect(result.strategy).toBe('wilted')
  })
})

// ─── measureHeat ────────────────────────────────────────────────────────────

describe('measureHeat', () => {
  it('RICH: returns correct resistance and tolerance', () => {
    const result = measureHeat(RICH)
    expect(result.resistance).toBe(95)
    expect(result.tolerance).toBe('mesophile')
    expect(result.thermalShockCount).toBe(2)
    expect(result.heatStressCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureHeat(RICH)
    expect(result.hasHighResistance).toBe(true)
    expect(result.hasSunscreen).toBe(true)
    expect(result.hasHeatDissipation).toBe(true)
    expect(result.hasNoThermalShock).toBe(false)
    expect(result.hasReflectiveSurface).toBe(true)
    expect(result.hasNoSunScald).toBe(false)
    expect(result.hasProperInsulation).toBe(true)
    expect(result.hasNoHeatStress).toBe(false)
    expect(result.hasShade).toBe(true)
    expect(result.hasNoDehydration).toBe(true)
  })

  it('EMPTY: returns correct scores', () => {
    const result = measureHeat(EMPTY)
    expect(result.resistance).toBe(25)
    expect(result.tolerance).toBe('scorched')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureHeat(EMPTY)
    expect(result.hasNoThermalShock).toBe(true)
    expect(result.hasNoHeatStress).toBe(true)
    expect(result.hasHighResistance).toBe(false)
  })

  it('MEDIUM: returns correct scores', () => {
    const result = measureHeat(MEDIUM)
    expect(result.resistance).toBe(55)
    expect(result.tolerance).toBe('wilting')
  })
})

// ─── measureStorage ─────────────────────────────────────────────────────────

describe('measureStorage', () => {
  it('RICH: returns correct capacity and type', () => {
    const result = measureStorage(RICH)
    expect(result.capacity).toBe(90)
    expect(result.type).toBe('succulent')
    expect(result.leakageCount).toBe(2)
    expect(result.stagnationCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureStorage(RICH)
    expect(result.hasHighEfficiency).toBe(true)
    expect(result.hasProperCaching).toBe(true)
    expect(result.hasNoLeakage).toBe(false)
    expect(result.hasEfficientRetrieval).toBe(true)
    expect(result.hasNoEvaporation).toBe(false)
    expect(result.hasProperCapacity).toBe(true)
    expect(result.hasNoOverflow).toBe(false)
    expect(result.hasCompression).toBe(true)
    expect(result.hasQuickRelease).toBe(true)
    expect(result.hasNoStagnation).toBe(false)
  })

  it('EMPTY: returns correct scores', () => {
    const result = measureStorage(EMPTY)
    expect(result.capacity).toBe(30)
    expect(result.type).toBe('evaporated')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureStorage(EMPTY)
    expect(result.hasNoLeakage).toBe(true)
    expect(result.hasNoStagnation).toBe(true)
    expect(result.hasHighEfficiency).toBe(false)
  })

  it('MEDIUM: returns correct scores', () => {
    const result = measureStorage(MEDIUM)
    expect(result.capacity).toBe(55)
    expect(result.type).toBe('seed-coat')
  })
})

// ─── measureBloom ───────────────────────────────────────────────────────────

describe('measureBloom', () => {
  it('RICH: returns correct quality and rarity', () => {
    const result = measureBloom(RICH)
    expect(result.quality).toBe(90)
    expect(result.rarity).toBe('seasonal')
    expect(result.misTimingCount).toBe(2)
    expect(result.falseBloomCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureBloom(RICH)
    expect(result.hasSpectacularBloom).toBe(true)
    expect(result.hasVibrantDisplay).toBe(true)
    expect(result.hasProperTiming).toBe(false)
    expect(result.hasNoMisTiming).toBe(false)
    expect(result.hasAttracts).toBe(true)
    expect(result.hasProperDuration).toBe(true)
    expect(result.hasNoWastedBloom).toBe(false)
    expect(result.hasFragrance).toBe(true)
    expect(result.hasProperScale).toBe(true)
    expect(result.hasNoFalseBloom).toBe(false)
  })

  it('EMPTY: returns correct scores', () => {
    const result = measureBloom(EMPTY)
    expect(result.quality).toBe(30)
    expect(result.rarity).toBe('never-blooms')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureBloom(EMPTY)
    expect(result.hasNoMisTiming).toBe(true)
    expect(result.hasNoWastedBloom).toBe(true)
    expect(result.hasSpectacularBloom).toBe(false)
  })

  it('MEDIUM: returns correct scores', () => {
    const result = measureBloom(MEDIUM)
    expect(result.quality).toBe(55)
    expect(result.rarity).toBe('rare')
  })
})

// ─── measureSeed ────────────────────────────────────────────────────────────

describe('measureSeed', () => {
  it('RICH: returns correct vitality and bank', () => {
    const result = measureSeed(RICH)
    expect(result.vitality).toBe(85)
    expect(result.bank).toBe('canopy-bank')
    expect(result.predationCount).toBe(0)
    expect(result.moldCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureSeed(RICH)
    expect(result.hasHighVitality).toBe(true)
    expect(result.hasLongevity).toBe(false)
    expect(result.hasProperDormancy).toBe(true)
    expect(result.hasNoPrematureGermination).toBe(false)
    expect(result.hasProperDispersal).toBe(false)
    expect(result.hasGerminationTrigger).toBe(true)
    expect(result.hasNoSeedPredation).toBe(true)
    expect(result.hasProperCoating).toBe(true)
    expect(result.hasNoMold).toBe(false)
    expect(result.hasResilience).toBe(true)
  })

  it('EMPTY: returns correct scores', () => {
    const result = measureSeed(EMPTY)
    expect(result.vitality).toBe(30)
    expect(result.bank).toBe('barren')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureSeed(EMPTY)
    expect(result.hasNoSeedPredation).toBe(true)
    expect(result.hasNoMold).toBe(true)
    expect(result.hasHighVitality).toBe(false)
  })

  it('MEDIUM: returns correct scores', () => {
    const result = measureSeed(MEDIUM)
    expect(result.vitality).toBe(55)
    expect(result.bank).toBe('scatter')
  })
})

// ─── measureAdaptation ──────────────────────────────────────────────────────

describe('measureAdaptation', () => {
  it('RICH: returns correct level and type', () => {
    const result = measureAdaptation(RICH)
    expect(result.level).toBe(91)
    expect(result.type).toBe('saguaro')
    expect(result.fragilityCount).toBe(0)
    expect(result.vulnerabilityCount).toBe(4)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureAdaptation(RICH)
    expect(result.hasHighAdaptation).toBe(true)
    expect(result.hasExtremeSurvival).toBe(true)
    expect(result.hasSparseEfficiency).toBe(true)
    expect(result.hasNoOverdependence).toBe(false)
    expect(result.hasHarshConditionSurvival).toBe(true)
    expect(result.hasNoFragility).toBe(true)
    expect(result.hasProperResourcefulness).toBe(true)
    expect(result.hasNoWastefulness).toBe(false)
    expect(result.hasMinimalist).toBe(true)
    expect(result.hasNoVulnerability).toBe(false)
  })

  it('EMPTY: returns correct scores', () => {
    const result = measureAdaptation(EMPTY)
    expect(result.level).toBe(29)
    expect(result.type).toBe('dust')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureAdaptation(EMPTY)
    expect(result.hasNoFragility).toBe(true)
    expect(result.hasNoVulnerability).toBe(true)
    expect(result.hasHighAdaptation).toBe(false)
  })

  it('MEDIUM: returns correct scores', () => {
    const result = measureAdaptation(MEDIUM)
    expect(result.level).toBe(53)
    expect(result.type).toBe('tumbleweed')
  })
})

// ─── analyzeDesertFlower ────────────────────────────────────────────────────

describe('analyzeDesertFlower', () => {
  it('RICH: returns correct aggregate scores', () => {
    const flower = analyzeDesertFlower(RICH, 'rich.ts')
    expect(flower.droughtTolerance).toBe(90)
    expect(flower.heatResistance).toBe(95)
    expect(flower.waterStorage).toBe(90)
    expect(flower.rareBloomQuality).toBe(90)
    expect(flower.seedBankVitality).toBe(85)
    expect(flower.desertAdaptation).toBe(91)
    expect(flower.qualityScore).toBe(90)
  })

  it('RICH: returns correct condition and classifications', () => {
    const flower = analyzeDesertFlower(RICH, 'rich.ts')
    expect(flower.condition).toBe('superbloom')
    expect(flower.drought.strategy).toBe('ephemeral')
    expect(flower.heat.tolerance).toBe('mesophile')
    expect(flower.storage.type).toBe('succulent')
    expect(flower.bloom.rarity).toBe('seasonal')
    expect(flower.seed.bank).toBe('canopy-bank')
    expect(flower.adaptation.type).toBe('saguaro')
  })

  it('EMPTY: returns correct all fields', () => {
    const flower = analyzeDesertFlower(EMPTY, 'empty.ts')
    expect(flower.qualityScore).toBe(31)
    expect(flower.condition).toBe('tumbleweed')
    expect(flower.droughtTolerance).toBe(40)
    expect(flower.heatResistance).toBe(25)
    expect(flower.drought.strategy).toBe('wilted')
    expect(flower.heat.tolerance).toBe('scorched')
    expect(flower.storage.type).toBe('evaporated')
    expect(flower.bloom.rarity).toBe('never-blooms')
    expect(flower.seed.bank).toBe('barren')
    expect(flower.adaptation.type).toBe('dust')
  })

  it('MEDIUM: returns correct all fields', () => {
    const flower = analyzeDesertFlower(MEDIUM, 'medium.ts')
    expect(flower.qualityScore).toBe(56)
    expect(flower.condition).toBe('desert-marigold')
    expect(flower.drought.strategy).toBe('wilted')
    expect(flower.heat.tolerance).toBe('wilting')
    expect(flower.storage.type).toBe('seed-coat')
    expect(flower.bloom.rarity).toBe('rare')
    expect(flower.seed.bank).toBe('scatter')
    expect(flower.adaptation.type).toBe('tumbleweed')
  })
})

// ─── buildDesertBloomResult ─────────────────────────────────────────────────

describe('buildDesertBloomResult', () => {
  it('SINGLE RICH: returns correct desert', () => {
    const result = buildDesertBloomResult(['rich.ts'], [RICH])
    expect(result.desert.overallResilience).toBe(90)
    expect(result.desert.avgTolerance).toBe(90)
    expect(result.desert.avgEfficiency).toBe(90)
    expect(result.desert.avgResilience).toBe(91)
    expect(result.desert.isResilient).toBe(true)
  })

  it('SINGLE RICH: returns correct stats', () => {
    const result = buildDesertBloomResult(['rich.ts'], [RICH])
    expect(result.stats.desertRangerGrade).toBe('desert-sage')
    expect(result.stats.avgDroughtTolerance).toBe(90)
    expect(result.stats.avgHeatResistance).toBe(95)
    expect(result.stats.avgWaterStorage).toBe(90)
    expect(result.stats.avgRareBloomQuality).toBe(90)
    expect(result.stats.avgSeedBankVitality).toBe(85)
    expect(result.stats.avgDesertAdaptation).toBe(91)
    expect(result.stats.superbloomCount).toBe(1)
  })

  it('EMPTY: returns correct empty result', () => {
    const result = buildDesertBloomResult([], [])
    expect(result.desert.overallResilience).toBe(0)
    expect(result.stats.desertRangerGrade).toBe('snowbird')
    expect(result.oases).toHaveLength(0)
    expect(result.flowers).toHaveLength(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('MIXED: returns correct desert', () => {
    const result = buildDesertBloomResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.stats.overallResilience).toBe(59)
    expect(result.desert.isResilient).toBe(false)
  })

  it('MIXED: returns correct stats counts', () => {
    const result = buildDesertBloomResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.stats.desertRangerGrade).toBe('botanist')
    expect(result.stats.avgDroughtTolerance).toBe(65)
    expect(result.stats.avgHeatResistance).toBe(58)
    expect(result.stats.avgWaterStorage).toBe(58)
    expect(result.stats.avgRareBloomQuality).toBe(58)
    expect(result.stats.avgSeedBankVitality).toBe(57)
    expect(result.stats.avgDesertAdaptation).toBe(58)
    expect(result.stats.superbloomCount).toBe(1)
    expect(result.stats.dustDevilCount).toBe(0)
  })

  it('MIXED: returns correct oasis', () => {
    const result = buildDesertBloomResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.oases).toHaveLength(1)
    expect(result.oases[0].oasisType).toBe('wadi')
    expect(result.oases[0].condition).toBe('conservation-area')
    expect(result.oases[0].superbloomCount).toBe(1)
  })

  it('MIXED: returns correct highlights', () => {
    const result = buildDesertBloomResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.stats.bestFlower).toBe('a.ts')
    expect(result.stats.mostResilient).toBe('a.ts')
    expect(result.stats.mostEfficient).toBe('a.ts')
    expect(result.stats.mostImpactful).toBe('a.ts')
    expect(result.stats.mostPotential).toBe('a.ts')
    expect(result.stats.mostAdapted).toBe('a.ts')
  })

  it('MIXED: generates recommendations', () => {
    const result = buildDesertBloomResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── scoreColor ─────────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns green for >= 80', () => { expect(scoreColor(90)).toContain('90') })
  it('returns yellow for >= 60', () => { expect(scoreColor(70)).toContain('70') })
  it('returns orange for >= 40', () => { expect(scoreColor(50)).toContain('50') })
  it('returns red for < 40', () => { expect(scoreColor(20)).toContain('20') })
})

// ─── conditionColor ─────────────────────────────────────────────────────────

describe('conditionColor', () => {
  it('colors superbloom', () => { expect(conditionColor('superbloom')).toContain('superbloom') })
  it('colors saguaro-bloom', () => { expect(conditionColor('saguaro-bloom')).toContain('saguaro-bloom') })
  it('colors desert-marigold', () => { expect(conditionColor('desert-marigold')).toContain('desert-marigold') })
  it('colors prickly-pear', () => { expect(conditionColor('prickly-pear')).toContain('prickly-pear') })
  it('colors tumbleweed', () => { expect(conditionColor('tumbleweed')).toContain('tumbleweed') })
  it('colors dust-devil', () => { expect(conditionColor('dust-devil')).toContain('dust-devil') })
  it('passes through unknown', () => { expect(conditionColor('unknown')).toBe('unknown') })
})

// ─── gradeColor ─────────────────────────────────────────────────────────────

describe('gradeColor', () => {
  it('colors desert-sage', () => { expect(gradeColor('desert-sage')).toContain('desert-sage') })
  it('colors ranger', () => { expect(gradeColor('ranger')).toContain('ranger') })
  it('colors botanist', () => { expect(gradeColor('botanist')).toContain('botanist') })
  it('colors hiker', () => { expect(gradeColor('hiker')).toContain('hiker') })
  it('colors tourist', () => { expect(gradeColor('tourist')).toContain('tourist') })
  it('colors snowbird', () => { expect(gradeColor('snowbird')).toContain('snowbird') })
  it('passes through unknown', () => { expect(gradeColor('unknown')).toBe('unknown') })
})

// ─── strategyColor ──────────────────────────────────────────────────────────

describe('strategyColor', () => {
  it('colors succulent', () => { expect(strategyColor('succulent')).toContain('succulent') })
  it('colors deep-root', () => { expect(strategyColor('deep-root')).toContain('deep-root') })
  it('colors ephemeral', () => { expect(strategyColor('ephemeral')).toContain('ephemeral') })
  it('colors dormant', () => { expect(strategyColor('dormant')).toContain('dormant') })
  it('colors wilted', () => { expect(strategyColor('wilted')).toContain('wilted') })
  it('colors dead', () => { expect(strategyColor('dead')).toContain('dead') })
  it('passes through unknown', () => { expect(strategyColor('unknown')).toBe('unknown') })
})

// ─── formatDesertBloomJson ──────────────────────────────────────────────────

describe('formatDesertBloomJson', () => {
  it('returns valid JSON string', () => {
    const result = buildDesertBloomResult(['a.ts'], [RICH])
    const json = formatDesertBloomJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.desert.overallResilience).toBe(90)
    expect(parsed.flowers).toHaveLength(1)
  })
})

// ─── formatDesertBloomTable ─────────────────────────────────────────────────

describe('formatDesertBloomTable', () => {
  it('returns formatted table string', () => {
    const result = buildDesertBloomResult(['a.ts'], [RICH])
    const table = formatDesertBloomTable(result, false)
    expect(table).toContain('Desert Bloom Analysis')
    expect(table).toContain('Desert Overview')
    expect(table).toContain('Statistics')
    expect(table).toContain('Condition Counts')
  })

  it('includes per-file details in verbose mode', () => {
    const result = buildDesertBloomResult(['a.ts'], [RICH])
    const table = formatDesertBloomTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('a.ts')
  })

  it('shows recommendations when present', () => {
    const result = buildDesertBloomResult([], [])
    const table = formatDesertBloomTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('shows highlights when bestFlower exists', () => {
    const result = buildDesertBloomResult(['a.ts'], [RICH])
    const table = formatDesertBloomTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Flower')
  })
})
