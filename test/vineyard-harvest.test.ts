import { describe, expect, it } from 'vitest'

import {
  analyzeVineyardBlock,
  analyzeVineyardGrape,
  buildVineyardHarvestResult,
  classifyBlockCondition,
  classifyBlockType,
  classifyCondition,
  classifyWinemakerGrade,
  generateRecommendations,
  measureBarrel,
  measureCellar,
  measureRipeness,
  measureTerroir,
  measureVintage,
  measureYield,
} from '../src/commands/vineyard-harvest-helpers.js'
import {
  conditionColor,
  formatVineyardHarvestJson,
  formatVineyardHarvestTable,
  gradeColor,
  regionColor,
  scoreColor,
  stageColor,
  volumeColor,
} from '../src/commands/vineyard-harvest-format-helpers.js'

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

// ─── measureRipeness ────────────────────────────────────────────────────────

describe('measureRipeness', () => {
  it('RICH: returns correct level and stage', () => {
    const result = measureRipeness(RICH)
    expect(result.level).toBe(82)
    expect(result.stage).toBe('veraison')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureRipeness(RICH)
    expect(result.hasProperRipeness).toBe(true)
    expect(result.hasProperSugar).toBe(true)
    expect(result.hasProperAcid).toBe(false)
    expect(result.hasProperTannins).toBe(true)
    expect(result.hasNoOverripeness).toBe(false)
    expect(result.hasNoGreenPepper).toBe(false)
    expect(result.hasProperPhenolic).toBe(true)
    expect(result.hasEvenRipening).toBe(false)
    expect(result.hasNoSunburn).toBe(false)
    expect(result.hasProperSkin).toBe(true)
  })

  it('RICH: returns correct counters', () => {
    const result = measureRipeness(RICH)
    expect(result.overripenessCount).toBe(2)
    expect(result.sunburnCount).toBe(2)
  })

  it('EMPTY: returns correct level and stage', () => {
    const result = measureRipeness(EMPTY)
    expect(result.level).toBe(38)
    expect(result.stage).toBe('unripe')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureRipeness(EMPTY)
    expect(result.hasProperRipeness).toBe(false)
    expect(result.hasNoOverripeness).toBe(true)
    expect(result.hasNoSunburn).toBe(true)
    expect(result.hasProperAcid).toBe(true)
  })

  it('MEDIUM: returns correct level and stage', () => {
    const result = measureRipeness(MEDIUM)
    expect(result.level).toBe(63)
    expect(result.stage).toBe('unripe')
    expect(result.sunburnCount).toBe(1)
  })
})

// ─── measureYield ───────────────────────────────────────────────────────────

describe('measureYield', () => {
  it('RICH: returns correct quality and volume', () => {
    const result = measureYield(RICH)
    expect(result.quality).toBe(90)
    expect(result.volume).toBe('generous')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureYield(RICH)
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasConsistentQuality).toBe(true)
    expect(result.hasProperClusterSize).toBe(true)
    expect(result.hasNoMillerandage).toBe(true)
    expect(result.hasNoCoulure).toBe(false)
    expect(result.hasProperConcentration).toBe(true)
    expect(result.hasNoDilution).toBe(false)
    expect(result.hasCleanFruit).toBe(true)
    expect(result.hasNoBotrytis).toBe(false)
    expect(result.hasProperBunches).toBe(true)
  })

  it('RICH: returns correct counters', () => {
    const result = measureYield(RICH)
    expect(result.millerandageCount).toBe(0)
    expect(result.coulureCount).toBe(2)
  })

  it('EMPTY: returns correct quality and volume', () => {
    const result = measureYield(EMPTY)
    expect(result.quality).toBe(40)
    expect(result.volume).toBe('poor')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureYield(EMPTY)
    expect(result.hasNoMillerandage).toBe(true)
    expect(result.hasNoCoulure).toBe(true)
    expect(result.hasNoDilution).toBe(true)
    expect(result.hasCleanFruit).toBe(true)
  })

  it('MEDIUM: returns correct quality and volume', () => {
    const result = measureYield(MEDIUM)
    expect(result.quality).toBe(65)
    expect(result.volume).toBe('poor')
  })
})

// ─── measureVintage ─────────────────────────────────────────────────────────

describe('measureVintage', () => {
  it('RICH: returns correct character and year', () => {
    const result = measureVintage(RICH)
    expect(result.character).toBe(85)
    expect(result.year).toBe('excellent')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureVintage(RICH)
    expect(result.hasDistinctiveCharacter).toBe(true)
    expect(result.hasUniqueExpression).toBe(true)
    expect(result.hasProperComplexity).toBe(true)
    expect(result.hasNoBlandness).toBe(false)
    expect(result.hasMemorableQuality).toBe(true)
    expect(result.hasNoGeneric).toBe(false)
    expect(result.hasDepth).toBe(true)
    expect(result.hasNoOneDimensional).toBe(false)
    expect(result.hasProperFinish).toBe(true)
    expect(result.hasNoShortFinish).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureVintage(RICH)
    expect(result.blandCount).toBe(2)
    expect(result.genericCount).toBe(2)
  })

  it('EMPTY: returns correct character and year', () => {
    const result = measureVintage(EMPTY)
    expect(result.character).toBe(39)
    expect(result.year).toBe('average')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureVintage(EMPTY)
    expect(result.hasDistinctiveCharacter).toBe(false)
    expect(result.hasNoBlandness).toBe(true)
    expect(result.hasNoGeneric).toBe(true)
    expect(result.hasNoShortFinish).toBe(true)
  })

  it('MEDIUM: returns correct character and year', () => {
    const result = measureVintage(MEDIUM)
    expect(result.character).toBe(62)
    expect(result.year).toBe('average')
    expect(result.hasNoBlandness).toBe(false)
  })
})

// ─── measureBarrel ──────────────────────────────────────────────────────────

describe('measureBarrel', () => {
  it('RICH: returns correct aging and type', () => {
    const result = measureBarrel(RICH)
    expect(result.aging).toBe(90)
    expect(result.type).toBe('american-oak')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureBarrel(RICH)
    expect(result.hasProperRefinement).toBe(true)
    expect(result.hasSubtleComplexity).toBe(true)
    expect(result.hasNoOverOak).toBe(true)
    expect(result.hasNoOveroxidation).toBe(false)
    expect(result.hasProperMicrooxygenation).toBe(true)
    expect(result.hasNoVA).toBe(true)
    expect(result.hasProperToast).toBe(true)
    expect(result.hasNoTCA).toBe(true)
    expect(result.hasLees).toBe(true)
    expect(result.hasNoBrett).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureBarrel(RICH)
    expect(result.overOakCount).toBe(0)
    expect(result.brettCount).toBe(2)
  })

  it('EMPTY: returns correct aging and type', () => {
    const result = measureBarrel(EMPTY)
    expect(result.aging).toBe(30)
    expect(result.type).toBe('plastic')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureBarrel(EMPTY)
    expect(result.hasProperRefinement).toBe(false)
    expect(result.hasNoOverOak).toBe(true)
    expect(result.hasNoBrett).toBe(true)
  })

  it('MEDIUM: returns correct aging and type', () => {
    const result = measureBarrel(MEDIUM)
    expect(result.aging).toBe(52)
    expect(result.type).toBe('concrete')
  })
})

// ─── measureTerroir ─────────────────────────────────────────────────────────

describe('measureTerroir', () => {
  it('RICH: returns correct expression and region', () => {
    const result = measureTerroir(RICH)
    expect(result.expression).toBe(85)
    expect(result.region).toBe('napa')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureTerroir(RICH)
    expect(result.hasClearTerroir).toBe(true)
    expect(result.hasSoilExpression).toBe(true)
    expect(result.hasClimateExpression).toBe(true)
    expect(result.hasAspectExpression).toBe(true)
    expect(result.hasNoHomogenization).toBe(false)
    expect(result.hasProperMinerality).toBe(false)
    expect(result.hasNoManipulation).toBe(true)
    expect(result.hasAuthentic).toBe(true)
    expect(result.hasNoIndustrial).toBe(false)
    expect(result.hasSenseOfPlace).toBe(true)
  })

  it('RICH: returns correct counters', () => {
    const result = measureTerroir(RICH)
    expect(result.homogenizationCount).toBe(2)
    expect(result.manipulationCount).toBe(0)
  })

  it('EMPTY: returns correct expression and region', () => {
    const result = measureTerroir(EMPTY)
    expect(result.expression).toBe(39)
    expect(result.region).toBe('generic')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureTerroir(EMPTY)
    expect(result.hasClearTerroir).toBe(false)
    expect(result.hasNoHomogenization).toBe(true)
    expect(result.hasNoManipulation).toBe(true)
    expect(result.hasAuthentic).toBe(false)
    expect(result.hasNoIndustrial).toBe(true)
  })

  it('MEDIUM: returns correct expression and region', () => {
    const result = measureTerroir(MEDIUM)
    expect(result.expression).toBe(62)
    expect(result.region).toBe('generic')
  })
})

// ─── measureCellar ──────────────────────────────────────────────────────────

describe('measureCellar', () => {
  it('RICH: returns correct quality and grade', () => {
    const result = measureCellar(RICH)
    expect(result.quality).toBe(85)
    expect(result.grade).toBe('grand-cru')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureCellar(RICH)
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasAgingPotential).toBe(false)
    expect(result.hasProperStructure).toBe(true)
    expect(result.hasNoFlaws).toBe(true)
    expect(result.hasCellarWorthy).toBe(true)
    expect(result.hasNoCorked).toBe(false)
    expect(result.hasProperBalance).toBe(false)
    expect(result.hasNoHeatDamage).toBe(false)
    expect(result.hasIntegration).toBe(true)
    expect(result.hasNoPremature).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureCellar(RICH)
    expect(result.flawCount).toBe(0)
    expect(result.corkedCount).toBe(2)
  })

  it('EMPTY: returns correct quality and grade', () => {
    const result = measureCellar(EMPTY)
    expect(result.quality).toBe(40)
    expect(result.grade).toBe('table-wine')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureCellar(EMPTY)
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasNoFlaws).toBe(true)
    expect(result.hasNoCorked).toBe(true)
    expect(result.hasNoPremature).toBe(true)
  })

  it('MEDIUM: returns correct quality and grade', () => {
    const result = measureCellar(MEDIUM)
    expect(result.quality).toBe(65)
    expect(result.grade).toBe('table-wine')
  })
})

// ─── analyzeVineyardGrape ───────────────────────────────────────────────────

describe('analyzeVineyardGrape', () => {
  it('RICH: returns correct quality score and condition', () => {
    const grape = analyzeVineyardGrape(RICH, 'test.ts')
    expect(grape.qualityScore).toBe(86)
    expect(grape.condition).toBe('chateau-margaux')
    expect(grape.file).toBe('test.ts')
  })

  it('RICH: returns correct measure scores', () => {
    const grape = analyzeVineyardGrape(RICH, 'test.ts')
    expect(grape.grapeRipeness).toBe(82)
    expect(grape.yieldQuality).toBe(90)
    expect(grape.vintageCharacter).toBe(85)
    expect(grape.barrelAging).toBe(90)
    expect(grape.terroirExpression).toBe(85)
    expect(grape.cellarQuality).toBe(85)
  })

  it('EMPTY: returns correct quality score and condition', () => {
    const grape = analyzeVineyardGrape(EMPTY, 'empty.ts')
    expect(grape.qualityScore).toBe(37)
    expect(grape.condition).toBe('chateau-neuf')
  })

  it('MEDIUM: returns correct quality score and condition', () => {
    const grape = analyzeVineyardGrape(MEDIUM, 'medium.ts')
    expect(grape.qualityScore).toBe(61)
    expect(grape.condition).toBe('opus-one')
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies chateau-margaux at 80+', () => {
    const grape = { qualityScore: 85, condition: 'grape-juice' } as ReturnType<typeof analyzeVineyardGrape>
    expect(classifyCondition(grape)).toBe('chateau-margaux')
  })

  it('classifies romanee-conti at 65-79', () => {
    const grape = { qualityScore: 70, condition: 'grape-juice' } as ReturnType<typeof analyzeVineyardGrape>
    expect(classifyCondition(grape)).toBe('romanee-conti')
  })

  it('classifies opus-one at 50-64', () => {
    const grape = { qualityScore: 55, condition: 'grape-juice' } as ReturnType<typeof analyzeVineyardGrape>
    expect(classifyCondition(grape)).toBe('opus-one')
  })

  it('classifies chateau-neuf at 35-49', () => {
    const grape = { qualityScore: 40, condition: 'grape-juice' } as ReturnType<typeof analyzeVineyardGrape>
    expect(classifyCondition(grape)).toBe('chateau-neuf')
  })

  it('classifies box-wine at 20-34', () => {
    const grape = { qualityScore: 25, condition: 'grape-juice' } as ReturnType<typeof analyzeVineyardGrape>
    expect(classifyCondition(grape)).toBe('box-wine')
  })

  it('classifies grape-juice below 20', () => {
    const grape = { qualityScore: 10, condition: 'grape-juice' } as ReturnType<typeof analyzeVineyardGrape>
    expect(classifyCondition(grape)).toBe('grape-juice')
  })
})

// ─── classifyBlockType ──────────────────────────────────────────────────────

describe('classifyBlockType', () => {
  it('returns wild for empty array', () => {
    expect(classifyBlockType([])).toBe('wild')
  })

  it('returns grand-cru for high avg with 30%+ chateau-margaux', () => {
    const grapes = [
      { qualityScore: 85, condition: 'chateau-margaux' },
      { qualityScore: 85, condition: 'chateau-margaux' },
      { qualityScore: 80, condition: 'chateau-margaux' },
    ] as ReturnType<typeof analyzeVineyardGrape>[]
    expect(classifyBlockType(grapes)).toBe('grand-cru')
  })

  it('returns premier-cru for avg 60+', () => {
    const grapes = [
      { qualityScore: 60, condition: 'opus-one' },
    ] as ReturnType<typeof analyzeVineyardGrape>[]
    expect(classifyBlockType(grapes)).toBe('premier-cru')
  })

  it('returns village for avg 45+', () => {
    const grapes = [
      { qualityScore: 45, condition: 'chateau-neuf' },
    ] as ReturnType<typeof analyzeVineyardGrape>[]
    expect(classifyBlockType(grapes)).toBe('village')
  })

  it('returns regional for avg 30+', () => {
    const grapes = [
      { qualityScore: 35, condition: 'chateau-neuf' },
    ] as ReturnType<typeof analyzeVineyardGrape>[]
    expect(classifyBlockType(grapes)).toBe('regional')
  })

  it('returns table for avg 15+', () => {
    const grapes = [
      { qualityScore: 20, condition: 'box-wine' },
    ] as ReturnType<typeof analyzeVineyardGrape>[]
    expect(classifyBlockType(grapes)).toBe('table')
  })

  it('returns wild for avg below 15', () => {
    const grapes = [
      { qualityScore: 10, condition: 'grape-juice' },
    ] as ReturnType<typeof analyzeVineyardGrape>[]
    expect(classifyBlockType(grapes)).toBe('wild')
  })
})

// ─── classifyBlockCondition ─────────────────────────────────────────────────

describe('classifyBlockCondition', () => {
  it('returns first-growth-estate at 80+', () => {
    expect(classifyBlockCondition(85)).toBe('first-growth-estate')
  })
  it('returns grand-cru-domaine at 65+', () => {
    expect(classifyBlockCondition(70)).toBe('grand-cru-domaine')
  })
  it('returns family-winery at 50+', () => {
    expect(classifyBlockCondition(55)).toBe('family-winery')
  })
  it('returns cooperative at 35+', () => {
    expect(classifyBlockCondition(40)).toBe('cooperative')
  })
  it('returns bulk-producer at 20+', () => {
    expect(classifyBlockCondition(25)).toBe('bulk-producer')
  })
  it('returns vinegar-factory below 20', () => {
    expect(classifyBlockCondition(10)).toBe('vinegar-factory')
  })
})

// ─── classifyWinemakerGrade ─────────────────────────────────────────────────

describe('classifyWinemakerGrade', () => {
  it('returns master-sommelier at 80+', () => {
    expect(classifyWinemakerGrade(85)).toBe('master-sommelier')
  })
  it('returns winemaker at 65+', () => {
    expect(classifyWinemakerGrade(70)).toBe('winemaker')
  })
  it('returns cellar-master at 50+', () => {
    expect(classifyWinemakerGrade(55)).toBe('cellar-master')
  })
  it('returns viticulturist at 35+', () => {
    expect(classifyWinemakerGrade(40)).toBe('viticulturist')
  })
  it('returns grape-picker at 20+', () => {
    expect(classifyWinemakerGrade(25)).toBe('grape-picker')
  })
  it('returns grape-stomper below 20', () => {
    expect(classifyWinemakerGrade(10)).toBe('grape-stomper')
  })
})

// ─── analyzeVineyardBlock ───────────────────────────────────────────────────

describe('analyzeVineyardBlock', () => {
  it('returns empty block for no grapes', () => {
    const block = analyzeVineyardBlock([], '.')
    expect(block.grapes).toEqual([])
    expect(block.blockType).toBe('wild')
    expect(block.condition).toBe('vinegar-factory')
    expect(block.avgRipeness).toBe(0)
    expect(block.avgQuality).toBe(0)
    expect(block.avgVintage).toBe(0)
  })

  it('returns correct block for RICH grapes', () => {
    const grape = analyzeVineyardGrape(RICH, 'test.ts')
    const block = analyzeVineyardBlock([grape], 'src')
    expect(block.avgRipeness).toBe(82)
    expect(block.avgQuality).toBe(90)
    expect(block.avgVintage).toBe(85)
    expect(block.chateauCount).toBe(1)
    expect(block.grapeJuiceCount).toBe(0)
    expect(block.ripeCount).toBe(1)
    expect(block.highQualityCount).toBe(1)
    expect(block.blockType).toBe('grand-cru')
    expect(block.condition).toBe('first-growth-estate')
  })
})

// ─── buildVineyardHarvestResult ─────────────────────────────────────────────

describe('buildVineyardHarvestResult', () => {
  it('RICH: returns correct estate', () => {
    const result = buildVineyardHarvestResult(['test.ts'], [RICH])
    expect(result.estate.overallQuality).toBe(86)
    expect(result.estate.avgRipeness).toBe(82)
    expect(result.estate.avgQuality).toBe(90)
    expect(result.estate.avgVintage).toBe(85)
    expect(result.estate.isExceptional).toBe(true)
  })

  it('RICH: returns correct stats', () => {
    const result = buildVineyardHarvestResult(['test.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalBlocks).toBe(1)
    expect(result.stats.avgGrapeRipeness).toBe(82)
    expect(result.stats.avgYieldQuality).toBe(90)
    expect(result.stats.avgVintageCharacter).toBe(85)
    expect(result.stats.avgBarrelAging).toBe(90)
    expect(result.stats.avgTerroirExpression).toBe(85)
    expect(result.stats.avgCellarQuality).toBe(85)
    expect(result.stats.chateauMargauxCount).toBe(1)
    expect(result.stats.winemakerGrade).toBe('master-sommelier')
    expect(result.stats.bestGrape).toBe('test.ts')
    expect(result.stats.ripest).toBe('test.ts')
    expect(result.stats.highestYield).toBe('test.ts')
    expect(result.stats.mostDistinctive).toBe('test.ts')
    expect(result.stats.mostRefined).toBe('test.ts')
    expect(result.stats.bestTerroir).toBe('test.ts')
  })

  it('RICH: returns exceptional recommendations', () => {
    const result = buildVineyardHarvestResult(['test.ts'], [RICH])
    expect(result.recommendations).toEqual([
      'Exceptional vintage achieved — your cellar rivals Chateau Margaux',
    ])
  })

  it('EMPTY: returns correct estate', () => {
    const result = buildVineyardHarvestResult(['empty.ts'], [EMPTY])
    expect(result.estate.overallQuality).toBe(37)
    expect(result.estate.isExceptional).toBe(false)
  })

  it('EMPTY: returns correct stats', () => {
    const result = buildVineyardHarvestResult(['empty.ts'], [EMPTY])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgBarrelAging).toBe(30)
    expect(result.stats.chateauNeufCount).toBe(1)
    expect(result.stats.winemakerGrade).toBe('viticulturist')
  })

  it('EMPTY: returns improvement recommendations', () => {
    const result = buildVineyardHarvestResult(['empty.ts'], [EMPTY])
    expect(result.recommendations.length).toBe(8)
    expect(result.recommendations[0]).toContain('ripeness')
    expect(result.recommendations[6]).toContain('cellar-worthy')
  })

  it('MIXED: returns correct blended estate', () => {
    const result = buildVineyardHarvestResult(
      ['rich.ts', 'empty.ts', 'medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.estate.overallQuality).toBe(61)
    expect(result.estate.isExceptional).toBe(false)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.chateauMargauxCount).toBe(1)
    expect(result.stats.opusOneCount).toBe(1)
    expect(result.stats.chateauNeufCount).toBe(1)
    expect(result.stats.winemakerGrade).toBe('cellar-master')
  })

  it('MIXED: groups files by directory into blocks', () => {
    const result = buildVineyardHarvestResult(
      ['rich.ts', 'empty.ts', 'medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.blocks.length).toBe(1)
    expect(result.blocks[0].blockType).toBe('premier-cru')
    expect(result.blocks[0].condition).toBe('family-winery')
  })

  it('handles empty input arrays', () => {
    const result = buildVineyardHarvestResult([], [])
    expect(result.grapes).toEqual([])
    expect(result.blocks).toEqual([])
    expect(result.estate.overallQuality).toBe(0)
    expect(result.estate.isExceptional).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestGrape).toBe('')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns exceptional message when all is good', () => {
    const grape = analyzeVineyardGrape(RICH, 'test.ts')
    const result = buildVineyardHarvestResult(['test.ts'], [RICH])
    const recs = generateRecommendations(result.grapes, result.blocks, result.estate, result.stats)
    expect(recs).toContain('Exceptional vintage achieved — your cellar rivals Chateau Margaux')
  })

  it('returns improvement recs for low scores', () => {
    const result = buildVineyardHarvestResult(['empty.ts'], [EMPTY])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string for all ranges', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(70)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    expect(typeof conditionColor('chateau-margaux')).toBe('string')
    expect(typeof conditionColor('romanee-conti')).toBe('string')
    expect(typeof conditionColor('opus-one')).toBe('string')
    expect(typeof conditionColor('chateau-neuf')).toBe('string')
    expect(typeof conditionColor('box-wine')).toBe('string')
    expect(typeof conditionColor('grape-juice')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
  })

  it('gradeColor returns string for all grades', () => {
    expect(typeof gradeColor('master-sommelier')).toBe('string')
    expect(typeof gradeColor('winemaker')).toBe('string')
    expect(typeof gradeColor('cellar-master')).toBe('string')
    expect(typeof gradeColor('viticulturist')).toBe('string')
    expect(typeof gradeColor('grape-picker')).toBe('string')
    expect(typeof gradeColor('grape-stomper')).toBe('string')
  })

  it('stageColor returns string for all stages', () => {
    expect(typeof stageColor('perfect-ripeness')).toBe('string')
    expect(typeof stageColor('ripe')).toBe('string')
    expect(typeof stageColor('veraison')).toBe('string')
    expect(typeof stageColor('green')).toBe('string')
    expect(typeof stageColor('unripe')).toBe('string')
    expect(typeof stageColor('rotten')).toBe('string')
  })

  it('volumeColor returns string for all volumes', () => {
    expect(typeof volumeColor('abundant')).toBe('string')
    expect(typeof volumeColor('generous')).toBe('string')
    expect(typeof volumeColor('moderate')).toBe('string')
    expect(typeof volumeColor('light')).toBe('string')
    expect(typeof volumeColor('poor')).toBe('string')
    expect(typeof volumeColor('crop-failure')).toBe('string')
  })

  it('regionColor returns string for all regions', () => {
    expect(typeof regionColor('bordeaux')).toBe('string')
    expect(typeof regionColor('burgundy')).toBe('string')
    expect(typeof regionColor('napa')).toBe('string')
    expect(typeof regionColor('tuscany')).toBe('string')
    expect(typeof regionColor('generic')).toBe('string')
    expect(typeof regionColor('industrial')).toBe('string')
  })

  it('formatVineyardHarvestJson returns valid JSON', () => {
    const result = buildVineyardHarvestResult(['test.ts'], [RICH])
    const json = formatVineyardHarvestJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.estate.overallQuality).toBe(86)
  })

  it('formatVineyardHarvestTable returns string with header', () => {
    const result = buildVineyardHarvestResult(['test.ts'], [RICH])
    const table = formatVineyardHarvestTable(result, false)
    expect(table).toContain('Vineyard Harvest Analysis')
    expect(table).toContain('Estate Overview')
    expect(table).toContain('Statistics')
  })

  it('formatVineyardHarvestTable with verbose shows per-file details', () => {
    const result = buildVineyardHarvestResult(['test.ts'], [RICH])
    const table = formatVineyardHarvestTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('test.ts')
  })

  it('formatVineyardHarvestTable shows recommendations', () => {
    const result = buildVineyardHarvestResult(['test.ts'], [RICH])
    const table = formatVineyardHarvestTable(result, false)
    expect(table).toContain('Recommendations')
    expect(table).toContain('Exceptional vintage')
  })

  it('formatVineyardHarvestTable shows highlights', () => {
    const result = buildVineyardHarvestResult(['test.ts'], [RICH])
    const table = formatVineyardHarvestTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Grape')
    expect(table).toContain('Ripest')
    expect(table).toContain('Best Terroir')
  })

  it('formatVineyardHarvestTable shows condition counts', () => {
    const result = buildVineyardHarvestResult(['test.ts'], [RICH])
    const table = formatVineyardHarvestTable(result, false)
    expect(table).toContain('Condition Counts')
    expect(table).toContain('Chateau Margaux')
    expect(table).toContain('Grape Juice')
  })
})
