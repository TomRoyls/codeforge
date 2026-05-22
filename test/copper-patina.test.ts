import { describe, expect, it } from 'vitest'

import {
  analyzeCopperArtifact,
  analyzeCopperCollection,
  buildCopperPatinaResult,
  classifyAppraiserGrade,
  classifyCollectionCondition,
  classifyCollectionType,
  classifyCondition,
  generateRecommendations,
  measureAdaptation,
  measureAntique,
  measureIntegrity,
  measureOxidation,
  measurePatina,
  measureVerdigris,
} from '../src/commands/copper-patina-helpers.js'
import {
  collectionTypeColor,
  conditionColor,
  formatCopperPatinaJson,
  formatCopperPatinaTable,
  gradeColor,
  integrityColor,
  oxidationColor,
  patinaColor,
  scoreColor,
} from '../src/commands/copper-patina-format-helpers.js'

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

// ─── measurePatina ──────────────────────────────────────────────────────────

describe('measurePatina', () => {
  it('RICH: returns correct quality and color', () => {
    const result = measurePatina(RICH)
    expect(result.quality).toBe(82)
    expect(result.color).toBe('copper-brown')
  })

  it('RICH: returns correct booleans', () => {
    const result = measurePatina(RICH)
    expect(result.hasGracefulAging).toBe(true)
    expect(result.hasProtectiveLayer).toBe(true)
    expect(result.hasNoCorrosion).toBe(false)
    expect(result.hasProperOxidation).toBe(true)
    expect(result.hasNoPitting).toBe(false)
    expect(result.hasEvenDevelopment).toBe(false)
    expect(result.hasNoSpots).toBe(true)
    expect(result.hasNaturalFinish).toBe(true)
    expect(result.hasNoArtificial).toBe(false)
    expect(result.hasPatina).toBe(true)
  })

  it('RICH: returns correct counters', () => {
    const result = measurePatina(RICH)
    expect(result.corrosionCount).toBe(2)
    expect(result.pittingCount).toBe(3)
  })

  it('EMPTY: returns correct quality and color', () => {
    const result = measurePatina(EMPTY)
    expect(result.quality).toBe(38)
    expect(result.color).toBe('tarnished')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measurePatina(EMPTY)
    expect(result.hasGracefulAging).toBe(false)
    expect(result.hasNoCorrosion).toBe(true)
    expect(result.hasNoPitting).toBe(true)
    expect(result.hasNoSpots).toBe(true)
  })

  it('MEDIUM: returns correct quality and color', () => {
    const result = measurePatina(MEDIUM)
    expect(result.quality).toBe(63)
    expect(result.color).toBe('tarnished')
    expect(result.corrosionCount).toBe(1)
  })
})

// ─── measureOxidation ───────────────────────────────────────────────────────

describe('measureOxidation', () => {
  it('RICH: returns correct depth and stage', () => {
    const result = measureOxidation(RICH)
    expect(result.depth).toBe(90)
    expect(result.stage).toBe('developing')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureOxidation(RICH)
    expect(result.hasDeepMaturity).toBe(true)
    expect(result.hasProperEvolution).toBe(true)
    expect(result.hasLayeredDevelopment).toBe(true)
    expect(result.hasNoRapidDegradation).toBe(true)
    expect(result.hasProperTimeline).toBe(true)
    expect(result.hasNoRegression).toBe(true)
    expect(result.hasGradualImprovement).toBe(true)
    expect(result.hasNoReversal).toBe(false)
    expect(result.hasHistoricalLayers).toBe(true)
    expect(result.hasNoStripping).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureOxidation(RICH)
    expect(result.degradationCount).toBe(0)
    expect(result.reversalCount).toBe(2)
  })

  it('EMPTY: returns correct depth and stage', () => {
    const result = measureOxidation(EMPTY)
    expect(result.depth).toBe(30)
    expect(result.stage).toBe('unexposed')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureOxidation(EMPTY)
    expect(result.hasDeepMaturity).toBe(false)
    expect(result.hasNoRapidDegradation).toBe(true)
    expect(result.hasNoReversal).toBe(true)
  })

  it('MEDIUM: returns correct depth and stage', () => {
    const result = measureOxidation(MEDIUM)
    expect(result.depth).toBe(52)
    expect(result.stage).toBe('bare-metal')
  })
})

// ─── measureVerdigris ───────────────────────────────────────────────────────

describe('measureVerdigris', () => {
  it('RICH: returns correct beauty and style', () => {
    const result = measureVerdigris(RICH)
    expect(result.beauty).toBe(85)
    expect(result.style).toBe('artistic')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureVerdigris(RICH)
    expect(result.hasDistinctiveCharacter).toBe(true)
    expect(result.hasUniqueIdentity).toBe(true)
    expect(result.hasNoBlandness).toBe(false)
    expect(result.hasRichTexture).toBe(true)
    expect(result.hasNoUniformity).toBe(false)
    expect(result.hasExpressive).toBe(true)
    expect(result.hasNoGeneric).toBe(false)
    expect(result.hasMemorable).toBe(true)
    expect(result.hasNoCookieCutter).toBe(false)
    expect(result.hasPersonality).toBe(true)
  })

  it('RICH: returns correct counters', () => {
    const result = measureVerdigris(RICH)
    expect(result.blandCount).toBe(2)
    expect(result.genericCount).toBe(2)
  })

  it('EMPTY: returns correct beauty and style', () => {
    const result = measureVerdigris(EMPTY)
    expect(result.beauty).toBe(40)
    expect(result.style).toBe('utilitarian')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureVerdigris(EMPTY)
    expect(result.hasNoBlandness).toBe(true)
    expect(result.hasNoGeneric).toBe(true)
    expect(result.hasNoCookieCutter).toBe(true)
  })

  it('MEDIUM: returns correct beauty and style', () => {
    const result = measureVerdigris(MEDIUM)
    expect(result.beauty).toBe(65)
    expect(result.style).toBe('utilitarian')
  })
})

// ─── measureIntegrity ───────────────────────────────────────────────────────

describe('measureIntegrity', () => {
  it('RICH: returns correct level and state', () => {
    const result = measureIntegrity(RICH)
    expect(result.level).toBe(85)
    expect(result.state).toBe('strong')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureIntegrity(RICH)
    expect(result.hasHighIntegrity).toBe(true)
    expect(result.hasNoStressCracks).toBe(true)
    expect(result.hasProperSupport).toBe(true)
    expect(result.hasNoFatigue).toBe(false)
    expect(result.hasReinforced).toBe(true)
    expect(result.hasNoWeakJoints).toBe(false)
    expect(result.hasProperAnchoring).toBe(true)
    expect(result.hasNoLoosening).toBe(true)
    expect(result.hasLoadBearing).toBe(true)
    expect(result.hasNoDeformation).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureIntegrity(RICH)
    expect(result.stressCrackCount).toBe(0)
    expect(result.fatigueCount).toBe(3)
  })

  it('EMPTY: returns correct level and state', () => {
    const result = measureIntegrity(EMPTY)
    expect(result.level).toBe(40)
    expect(result.state).toBe('fragile')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureIntegrity(EMPTY)
    expect(result.hasHighIntegrity).toBe(false)
    expect(result.hasNoStressCracks).toBe(true)
    expect(result.hasNoFatigue).toBe(true)
  })

  it('MEDIUM: returns correct level and state', () => {
    const result = measureIntegrity(MEDIUM)
    expect(result.level).toBe(65)
    expect(result.state).toBe('fragile')
  })
})

// ─── measureAdaptation ──────────────────────────────────────────────────────

describe('measureAdaptation', () => {
  it('RICH: returns correct level and environment', () => {
    const result = measureAdaptation(RICH)
    expect(result.level).toBe(85)
    expect(result.environment).toBe('industrial')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureAdaptation(RICH)
    expect(result.hasHighAdaptation).toBe(true)
    expect(result.hasEnvironmentalResponse).toBe(true)
    expect(result.hasClimateResistance).toBe(true)
    expect(result.hasNoBrittleness).toBe(false)
    expect(result.hasFlexibility).toBe(true)
    expect(result.hasNoStiffness).toBe(false)
    expect(result.hasThermalAdaptation).toBe(true)
    expect(result.hasNoSensitivity).toBe(false)
    expect(result.hasChemicalResistance).toBe(false)
    expect(result.hasNoVulnerability).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureAdaptation(RICH)
    expect(result.brittlenessCount).toBe(2)
    expect(result.sensitivityCount).toBe(2)
  })

  it('EMPTY: returns correct level and environment', () => {
    const result = measureAdaptation(EMPTY)
    expect(result.level).toBe(39)
    expect(result.environment).toBe('indoor')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureAdaptation(EMPTY)
    expect(result.hasHighAdaptation).toBe(false)
    expect(result.hasNoBrittleness).toBe(true)
    expect(result.hasNoSensitivity).toBe(true)
  })

  it('MEDIUM: returns correct level and environment', () => {
    const result = measureAdaptation(MEDIUM)
    expect(result.level).toBe(62)
    expect(result.environment).toBe('indoor')
  })
})

// ─── measureAntique ─────────────────────────────────────────────────────────

describe('measureAntique', () => {
  it('RICH: returns correct value and appraisal', () => {
    const result = measureAntique(RICH)
    expect(result.value).toBe(85)
    expect(result.appraisal).toBe('collectors-item')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureAntique(RICH)
    expect(result.hasHighValue).toBe(true)
    expect(result.hasProvenance).toBe(false)
    expect(result.hasNoForgery).toBe(true)
    expect(result.hasAuthentic).toBe(true)
    expect(result.hasHistoricalSignificance).toBe(true)
    expect(result.hasNoReproduction).toBe(false)
    expect(result.hasRarity).toBe(true)
    expect(result.hasNoDamage).toBe(false)
    expect(result.hasProperRestoration).toBe(true)
    expect(result.hasInvestmentGrade).toBe(true)
  })

  it('RICH: returns correct counters', () => {
    const result = measureAntique(RICH)
    expect(result.forgeryCount).toBe(0)
    expect(result.damageCount).toBe(2)
  })

  it('EMPTY: returns correct value and appraisal', () => {
    const result = measureAntique(EMPTY)
    expect(result.value).toBe(40)
    expect(result.appraisal).toBe('used')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureAntique(EMPTY)
    expect(result.hasHighValue).toBe(false)
    expect(result.hasNoForgery).toBe(true)
    expect(result.hasNoDamage).toBe(true)
  })

  it('MEDIUM: returns correct value and appraisal', () => {
    const result = measureAntique(MEDIUM)
    expect(result.value).toBe(65)
    expect(result.appraisal).toBe('used')
  })
})

// ─── analyzeCopperArtifact ──────────────────────────────────────────────────

describe('analyzeCopperArtifact', () => {
  it('RICH: returns correct quality score and condition', () => {
    const artifact = analyzeCopperArtifact(RICH, 'test.ts')
    expect(artifact.qualityScore).toBe(85)
    expect(artifact.condition).toBe('statue-of-liberty')
    expect(artifact.file).toBe('test.ts')
  })

  it('RICH: returns correct measure scores', () => {
    const artifact = analyzeCopperArtifact(RICH, 'test.ts')
    expect(artifact.patinaQuality).toBe(82)
    expect(artifact.oxidationDepth).toBe(90)
    expect(artifact.verdigrisBeauty).toBe(85)
    expect(artifact.structuralIntegrity).toBe(85)
    expect(artifact.environmentalAdaptation).toBe(85)
    expect(artifact.antiqueValue).toBe(85)
  })

  it('EMPTY: returns correct quality score and condition', () => {
    const artifact = analyzeCopperArtifact(EMPTY, 'empty.ts')
    expect(artifact.qualityScore).toBe(38)
    expect(artifact.condition).toBe('penny')
  })

  it('MEDIUM: returns correct quality score and condition', () => {
    const artifact = analyzeCopperArtifact(MEDIUM, 'medium.ts')
    expect(artifact.qualityScore).toBe(62)
    expect(artifact.condition).toBe('weather-vane')
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies statue-of-liberty at 80+', () => {
    const artifact = { qualityScore: 85, condition: 'verdigris-dust' } as ReturnType<typeof analyzeCopperArtifact>
    expect(classifyCondition(artifact)).toBe('statue-of-liberty')
  })
  it('classifies copper-dome at 65-79', () => {
    const artifact = { qualityScore: 70, condition: 'verdigris-dust' } as ReturnType<typeof analyzeCopperArtifact>
    expect(classifyCondition(artifact)).toBe('copper-dome')
  })
  it('classifies weather-vane at 50-64', () => {
    const artifact = { qualityScore: 55, condition: 'verdigris-dust' } as ReturnType<typeof analyzeCopperArtifact>
    expect(classifyCondition(artifact)).toBe('weather-vane')
  })
  it('classifies penny at 35-49', () => {
    const artifact = { qualityScore: 40, condition: 'verdigris-dust' } as ReturnType<typeof analyzeCopperArtifact>
    expect(classifyCondition(artifact)).toBe('penny')
  })
  it('classifies scrap-wire at 20-34', () => {
    const artifact = { qualityScore: 25, condition: 'verdigris-dust' } as ReturnType<typeof analyzeCopperArtifact>
    expect(classifyCondition(artifact)).toBe('scrap-wire')
  })
  it('classifies verdigris-dust below 20', () => {
    const artifact = { qualityScore: 10, condition: 'verdigris-dust' } as ReturnType<typeof analyzeCopperArtifact>
    expect(classifyCondition(artifact)).toBe('verdigris-dust')
  })
})

// ─── classifyCollectionType ─────────────────────────────────────────────────

describe('classifyCollectionType', () => {
  it('returns scrap-heap for empty array', () => {
    expect(classifyCollectionType([])).toBe('scrap-heap')
  })
  it('returns museum for high avg with 30%+ statue-of-liberty', () => {
    const artifacts = [
      { qualityScore: 85, condition: 'statue-of-liberty' },
      { qualityScore: 85, condition: 'statue-of-liberty' },
      { qualityScore: 80, condition: 'statue-of-liberty' },
    ] as ReturnType<typeof analyzeCopperArtifact>[]
    expect(classifyCollectionType(artifacts)).toBe('museum')
  })
  it('returns gallery for avg 60+', () => {
    const artifacts = [{ qualityScore: 60, condition: 'weather-vane' }] as ReturnType<typeof analyzeCopperArtifact>[]
    expect(classifyCollectionType(artifacts)).toBe('gallery')
  })
  it('returns exhibition for avg 45+', () => {
    const artifacts = [{ qualityScore: 45, condition: 'penny' }] as ReturnType<typeof analyzeCopperArtifact>[]
    expect(classifyCollectionType(artifacts)).toBe('exhibition')
  })
  it('returns workshop for avg 30+', () => {
    const artifacts = [{ qualityScore: 35, condition: 'penny' }] as ReturnType<typeof analyzeCopperArtifact>[]
    expect(classifyCollectionType(artifacts)).toBe('workshop')
  })
  it('returns salvage-yard for avg 15+', () => {
    const artifacts = [{ qualityScore: 20, condition: 'scrap-wire' }] as ReturnType<typeof analyzeCopperArtifact>[]
    expect(classifyCollectionType(artifacts)).toBe('salvage-yard')
  })
  it('returns scrap-heap for avg below 15', () => {
    const artifacts = [{ qualityScore: 10, condition: 'verdigris-dust' }] as ReturnType<typeof analyzeCopperArtifact>[]
    expect(classifyCollectionType(artifacts)).toBe('scrap-heap')
  })
})

// ─── classifyCollectionCondition ────────────────────────────────────────────

describe('classifyCollectionCondition', () => {
  it('returns national-treasure at 80+', () => { expect(classifyCollectionCondition(85)).toBe('national-treasure') })
  it('returns heritage-collection at 65+', () => { expect(classifyCollectionCondition(70)).toBe('heritage-collection') })
  it('returns art-gallery at 50+', () => { expect(classifyCollectionCondition(55)).toBe('art-gallery') })
  it('returns antique-shop at 35+', () => { expect(classifyCollectionCondition(40)).toBe('antique-shop') })
  it('returns junk-yard at 20+', () => { expect(classifyCollectionCondition(25)).toBe('junk-yard') })
  it('returns recycling below 20', () => { expect(classifyCollectionCondition(10)).toBe('recycling') })
})

// ─── classifyAppraiserGrade ─────────────────────────────────────────────────

describe('classifyAppraiserGrade', () => {
  it('returns chief-curator at 80+', () => { expect(classifyAppraiserGrade(85)).toBe('chief-curator') })
  it('returns master-appraiser at 65+', () => { expect(classifyAppraiserGrade(70)).toBe('master-appraiser') })
  it('returns antique-dealer at 50+', () => { expect(classifyAppraiserGrade(55)).toBe('antique-dealer') })
  it('returns collector at 35+', () => { expect(classifyAppraiserGrade(40)).toBe('collector') })
  it('returns scavenger at 20+', () => { expect(classifyAppraiserGrade(25)).toBe('scavenger') })
  it('returns scrapper below 20', () => { expect(classifyAppraiserGrade(10)).toBe('scrapper') })
})

// ─── analyzeCopperCollection ────────────────────────────────────────────────

describe('analyzeCopperCollection', () => {
  it('returns empty collection for no artifacts', () => {
    const coll = analyzeCopperCollection([], '.')
    expect(coll.artifacts).toEqual([])
    expect(coll.collectionType).toBe('scrap-heap')
    expect(coll.condition).toBe('recycling')
    expect(coll.avgPatina).toBe(0)
    expect(coll.avgIntegrity).toBe(0)
    expect(coll.avgValue).toBe(0)
  })

  it('returns correct collection for RICH artifacts', () => {
    const artifact = analyzeCopperArtifact(RICH, 'test.ts')
    const coll = analyzeCopperCollection([artifact], 'src')
    expect(coll.avgPatina).toBe(82)
    expect(coll.avgIntegrity).toBe(85)
    expect(coll.avgValue).toBe(85)
    expect(coll.statueCount).toBe(1)
    expect(coll.dustCount).toBe(0)
    expect(coll.gracefulCount).toBe(1)
    expect(coll.highIntegrityCount).toBe(1)
    expect(coll.collectionType).toBe('museum')
    expect(coll.condition).toBe('national-treasure')
  })
})

// ─── buildCopperPatinaResult ────────────────────────────────────────────────

describe('buildCopperPatinaResult', () => {
  it('RICH: returns correct museum', () => {
    const result = buildCopperPatinaResult(['test.ts'], [RICH])
    expect(result.museum.overallValue).toBe(85)
    expect(result.museum.avgPatina).toBe(82)
    expect(result.museum.avgIntegrity).toBe(85)
    expect(result.museum.avgValue).toBe(85)
    expect(result.museum.isHeritage).toBe(true)
  })

  it('RICH: returns correct stats', () => {
    const result = buildCopperPatinaResult(['test.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalCollections).toBe(1)
    expect(result.stats.avgPatinaQuality).toBe(82)
    expect(result.stats.avgOxidationDepth).toBe(90)
    expect(result.stats.avgVerdigrisBeauty).toBe(85)
    expect(result.stats.avgStructuralIntegrity).toBe(85)
    expect(result.stats.avgEnvironmentalAdaptation).toBe(85)
    expect(result.stats.avgAntiqueValue).toBe(85)
    expect(result.stats.statueOfLibertyCount).toBe(1)
    expect(result.stats.appraiserGrade).toBe('chief-curator')
    expect(result.stats.bestArtifact).toBe('test.ts')
    expect(result.stats.bestPatina).toBe('test.ts')
    expect(result.stats.mostMature).toBe('test.ts')
    expect(result.stats.mostCharacter).toBe('test.ts')
    expect(result.stats.strongest).toBe('test.ts')
    expect(result.stats.mostValuable).toBe('test.ts')
  })

  it('RICH: returns magnificent recommendations', () => {
    const result = buildCopperPatinaResult(['test.ts'], [RICH])
    expect(result.recommendations).toEqual([
      'Magnificent patina achieved — your copper artifacts stand the test of time',
    ])
  })

  it('EMPTY: returns correct museum', () => {
    const result = buildCopperPatinaResult(['empty.ts'], [EMPTY])
    expect(result.museum.overallValue).toBe(38)
    expect(result.museum.isHeritage).toBe(false)
  })

  it('EMPTY: returns correct stats', () => {
    const result = buildCopperPatinaResult(['empty.ts'], [EMPTY])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgStructuralIntegrity).toBe(40)
    expect(result.stats.pennyCount).toBe(1)
    expect(result.stats.appraiserGrade).toBe('collector')
  })

  it('EMPTY: returns improvement recommendations', () => {
    const result = buildCopperPatinaResult(['empty.ts'], [EMPTY])
    expect(result.recommendations.length).toBe(8)
    expect(result.recommendations[0]).toContain('patina quality')
    expect(result.recommendations[6]).toContain('museum-piece')
  })

  it('MIXED: returns correct blended museum', () => {
    const result = buildCopperPatinaResult(
      ['rich.ts', 'empty.ts', 'medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.museum.overallValue).toBe(62)
    expect(result.museum.isHeritage).toBe(false)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.statueOfLibertyCount).toBe(1)
    expect(result.stats.weatherVaneCount).toBe(1)
    expect(result.stats.pennyCount).toBe(1)
    expect(result.stats.appraiserGrade).toBe('antique-dealer')
  })

  it('MIXED: groups files into collections', () => {
    const result = buildCopperPatinaResult(
      ['rich.ts', 'empty.ts', 'medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.collections.length).toBe(1)
    expect(result.collections[0].collectionType).toBe('gallery')
    expect(result.collections[0].condition).toBe('art-gallery')
  })

  it('handles empty input arrays', () => {
    const result = buildCopperPatinaResult([], [])
    expect(result.artifacts).toEqual([])
    expect(result.collections).toEqual([])
    expect(result.museum.overallValue).toBe(0)
    expect(result.museum.isHeritage).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestArtifact).toBe('')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns magnificent message when all is good', () => {
    const result = buildCopperPatinaResult(['test.ts'], [RICH])
    const recs = generateRecommendations(result.artifacts, result.collections, result.museum, result.stats)
    expect(recs).toContain('Magnificent patina achieved — your copper artifacts stand the test of time')
  })

  it('returns improvement recs for low scores', () => {
    const result = buildCopperPatinaResult(['empty.ts'], [EMPTY])
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
    expect(typeof conditionColor('statue-of-liberty')).toBe('string')
    expect(typeof conditionColor('copper-dome')).toBe('string')
    expect(typeof conditionColor('weather-vane')).toBe('string')
    expect(typeof conditionColor('penny')).toBe('string')
    expect(typeof conditionColor('scrap-wire')).toBe('string')
    expect(typeof conditionColor('verdigris-dust')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
  })

  it('gradeColor returns string for all grades', () => {
    expect(typeof gradeColor('chief-curator')).toBe('string')
    expect(typeof gradeColor('master-appraiser')).toBe('string')
    expect(typeof gradeColor('antique-dealer')).toBe('string')
    expect(typeof gradeColor('collector')).toBe('string')
    expect(typeof gradeColor('scavenger')).toBe('string')
    expect(typeof gradeColor('scrapper')).toBe('string')
  })

  it('patinaColor returns string for all values', () => {
    expect(typeof patinaColor('verdigris')).toBe('string')
    expect(typeof patinaColor('malachite')).toBe('string')
    expect(typeof patinaColor('copper-brown')).toBe('string')
    expect(typeof patinaColor('shiny-copper')).toBe('string')
    expect(typeof patinaColor('tarnished')).toBe('string')
    expect(typeof patinaColor('corroded')).toBe('string')
  })

  it('oxidationColor returns string for all values', () => {
    expect(typeof oxidationColor('mature-patina')).toBe('string')
    expect(typeof oxidationColor('developing')).toBe('string')
    expect(typeof oxidationColor('early-oxide')).toBe('string')
    expect(typeof oxidationColor('fresh-tarnish')).toBe('string')
    expect(typeof oxidationColor('bare-metal')).toBe('string')
    expect(typeof oxidationColor('unexposed')).toBe('string')
  })

  it('integrityColor returns string for all values', () => {
    expect(typeof integrityColor('solid')).toBe('string')
    expect(typeof integrityColor('strong')).toBe('string')
    expect(typeof integrityColor('stable')).toBe('string')
    expect(typeof integrityColor('weakening')).toBe('string')
    expect(typeof integrityColor('fragile')).toBe('string')
    expect(typeof integrityColor('crumbling')).toBe('string')
  })

  it('collectionTypeColor returns string for all values', () => {
    expect(typeof collectionTypeColor('museum')).toBe('string')
    expect(typeof collectionTypeColor('gallery')).toBe('string')
    expect(typeof collectionTypeColor('exhibition')).toBe('string')
    expect(typeof collectionTypeColor('workshop')).toBe('string')
    expect(typeof collectionTypeColor('salvage-yard')).toBe('string')
    expect(typeof collectionTypeColor('scrap-heap')).toBe('string')
  })

  it('formatCopperPatinaJson returns valid JSON', () => {
    const result = buildCopperPatinaResult(['test.ts'], [RICH])
    const json = formatCopperPatinaJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.museum.overallValue).toBe(85)
  })

  it('formatCopperPatinaTable returns string with header', () => {
    const result = buildCopperPatinaResult(['test.ts'], [RICH])
    const table = formatCopperPatinaTable(result, false)
    expect(table).toContain('Copper Patina Analysis')
    expect(table).toContain('Museum Overview')
    expect(table).toContain('Statistics')
  })

  it('formatCopperPatinaTable with verbose shows per-file details', () => {
    const result = buildCopperPatinaResult(['test.ts'], [RICH])
    const table = formatCopperPatinaTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('test.ts')
  })

  it('formatCopperPatinaTable shows recommendations', () => {
    const result = buildCopperPatinaResult(['test.ts'], [RICH])
    const table = formatCopperPatinaTable(result, false)
    expect(table).toContain('Recommendations')
    expect(table).toContain('Magnificent')
  })

  it('formatCopperPatinaTable shows highlights', () => {
    const result = buildCopperPatinaResult(['test.ts'], [RICH])
    const table = formatCopperPatinaTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Artifact')
    expect(table).toContain('Most Valuable')
  })

  it('formatCopperPatinaTable shows condition counts', () => {
    const result = buildCopperPatinaResult(['test.ts'], [RICH])
    const table = formatCopperPatinaTable(result, false)
    expect(table).toContain('Condition Counts')
    expect(table).toContain('Statue of Liberty')
    expect(table).toContain('Verdigris Dust')
  })
})
