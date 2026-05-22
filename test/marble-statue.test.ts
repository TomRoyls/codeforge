import { describe, expect, it } from 'vitest'

import {
  analyzeMarbleBlock,
  buildMarbleStatueResult,
  measureChisel,
  measureForm,
  measureMastery,
  measureMaterial,
  measureProportion,
  measureSurface,
} from '../src/commands/marble-statue-helpers.js'
import {
  conditionColor,
  formatMarbleStatueJson,
  formatMarbleStatueTable,
  gradeColor,
  scoreColor,
  styleColor,
} from '../src/commands/marble-statue-format-helpers.js'

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

// ─── measureForm ────────────────────────────────────────────────────────────

describe('measureForm', () => {
  it('RICH: returns correct scores and style', () => {
    const result = measureForm(RICH)
    expect(result.quality).toBe(88)
    expect(result.style).toBe('renaissance')
    expect(result.imbalanceCount).toBe(2)
    expect(result.clutterCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureForm(RICH)
    expect(result.hasBeautifulForm).toBe(true)
    expect(result.hasProperPose).toBe(true)
    expect(result.hasDynamicTension).toBe(true)
    expect(result.hasProperVolume).toBe(true)
    expect(result.hasNoImbalance).toBe(false)
    expect(result.hasSpatialAwareness).toBe(false)
    expect(result.hasProperSilhouette).toBe(true)
    expect(result.hasNoClutter).toBe(false)
    expect(result.hasGracefulLines).toBe(true)
    expect(result.hasNoAwkwardness).toBe(false)
  })

  it('EMPTY: returns correct scores and style', () => {
    const result = measureForm(EMPTY)
    expect(result.quality).toBe(37)
    expect(result.style).toBe('modern')
    expect(result.imbalanceCount).toBe(0)
    expect(result.clutterCount).toBe(0)
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureForm(EMPTY)
    expect(result.hasBeautifulForm).toBe(false)
    expect(result.hasProperPose).toBe(false)
    expect(result.hasDynamicTension).toBe(false)
    expect(result.hasProperVolume).toBe(false)
    expect(result.hasNoImbalance).toBe(true)
    expect(result.hasSpatialAwareness).toBe(false)
    expect(result.hasProperSilhouette).toBe(false)
    expect(result.hasNoClutter).toBe(true)
    expect(result.hasGracefulLines).toBe(false)
    expect(result.hasNoAwkwardness).toBe(true)
  })

  it('MEDIUM: returns correct scores and style', () => {
    const result = measureForm(MEDIUM)
    expect(result.quality).toBe(65)
    expect(result.style).toBe('modern')
    expect(result.clutterCount).toBe(1)
  })

  it('MEDIUM: returns correct booleans', () => {
    const result = measureForm(MEDIUM)
    expect(result.hasNoImbalance).toBe(true)
    expect(result.hasNoClutter).toBe(false)
    expect(result.hasNoAwkwardness).toBe(true)
  })
})

// ─── measureChisel ──────────────────────────────────────────────────────────

describe('measureChisel', () => {
  it('RICH: returns correct scores and technique', () => {
    const result = measureChisel(RICH)
    expect(result.precision).toBe(88)
    expect(result.technique).toBe('pointing')
    expect(result.gougeCount).toBe(0)
    expect(result.overcutCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureChisel(RICH)
    expect(result.hasHighPrecision).toBe(true)
    expect(result.hasCleanCuts).toBe(true)
    expect(result.hasNoChiselMarks).toBe(true)
    expect(result.hasProperDepth).toBe(true)
    expect(result.hasSharpEdges).toBe(true)
    expect(result.hasNoOvercutting).toBe(false)
    expect(result.hasNoUndercutting).toBe(true)
    expect(result.hasProperDetail).toBe(true)
    expect(result.hasNoGouging).toBe(true)
    expect(result.hasRefinedFinish).toBe(false)
  })

  it('EMPTY: returns correct scores and technique', () => {
    const result = measureChisel(EMPTY)
    expect(result.precision).toBe(35)
    expect(result.technique).toBe('scratching')
    expect(result.gougeCount).toBe(0)
    expect(result.overcutCount).toBe(0)
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureChisel(EMPTY)
    expect(result.hasHighPrecision).toBe(false)
    expect(result.hasCleanCuts).toBe(false)
    expect(result.hasNoChiselMarks).toBe(true)
    expect(result.hasProperDepth).toBe(false)
    expect(result.hasSharpEdges).toBe(false)
    expect(result.hasNoOvercutting).toBe(true)
    expect(result.hasNoUndercutting).toBe(false)
    expect(result.hasNoGouging).toBe(true)
    expect(result.hasRefinedFinish).toBe(false)
  })

  it('MEDIUM: returns correct scores and technique', () => {
    const result = measureChisel(MEDIUM)
    expect(result.precision).toBe(58)
    expect(result.technique).toBe('scratching')
  })

  it('MEDIUM: returns correct booleans', () => {
    const result = measureChisel(MEDIUM)
    expect(result.hasNoChiselMarks).toBe(true)
    expect(result.hasNoOvercutting).toBe(true)
    expect(result.hasNoUndercutting).toBe(true)
    expect(result.hasNoGouging).toBe(true)
    expect(result.hasRefinedFinish).toBe(false)
  })
})

// ─── measureSurface ─────────────────────────────────────────────────────────

describe('measureSurface', () => {
  it('RICH: returns correct scores and quality', () => {
    const result = measureSurface(RICH)
    expect(result.finish).toBe(90)
    expect(result.quality).toBe('honed')
    expect(result.scratchCount).toBe(2)
    expect(result.pittingCount).toBe(0)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureSurface(RICH)
    expect(result.hasHighFinish).toBe(true)
    expect(result.hasSmoothSurface).toBe(true)
    expect(result.hasNoScratches).toBe(false)
    expect(result.hasProperLuster).toBe(true)
    expect(result.hasNoPitting).toBe(true)
    expect(result.hasUniformTexture).toBe(false)
    expect(result.hasProperSheen).toBe(true)
    expect(result.hasNoToolingMarks).toBe(false)
    expect(result.hasTranslucency).toBe(true)
    expect(result.hasNoVeining).toBe(true)
  })

  it('EMPTY: returns correct scores and quality', () => {
    const result = measureSurface(EMPTY)
    expect(result.finish).toBe(30)
    expect(result.quality).toBe('raw')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureSurface(EMPTY)
    expect(result.hasNoScratches).toBe(true)
    expect(result.hasNoPitting).toBe(true)
    expect(result.hasUniformTexture).toBe(true)
    expect(result.hasNoToolingMarks).toBe(true)
    expect(result.hasNoVeining).toBe(true)
    expect(result.hasHighFinish).toBe(false)
    expect(result.hasSmoothSurface).toBe(false)
  })

  it('MEDIUM: returns correct scores and quality', () => {
    const result = measureSurface(MEDIUM)
    expect(result.finish).toBe(52)
    expect(result.quality).toBe('rough')
  })

  it('MEDIUM: returns correct booleans', () => {
    const result = measureSurface(MEDIUM)
    expect(result.hasNoScratches).toBe(true)
    expect(result.hasNoPitting).toBe(true)
    expect(result.hasUniformTexture).toBe(false)
    expect(result.hasNoToolingMarks).toBe(false)
    expect(result.hasNoVeining).toBe(true)
  })
})

// ─── measureProportion ──────────────────────────────────────────────────────

describe('measureProportion', () => {
  it('RICH: returns correct scores and system', () => {
    const result = measureProportion(RICH)
    expect(result.harmony).toBe(87)
    expect(result.system).toBe('classical-canon')
    expect(result.disproportionCount).toBe(0)
    expect(result.compressionCount).toBe(4)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureProportion(RICH)
    expect(result.hasProperProportion).toBe(true)
    expect(result.hasGoldenSection).toBe(true)
    expect(result.hasProperScale).toBe(true)
    expect(result.hasNoDisproportion).toBe(true)
    expect(result.hasSymmetry).toBe(false)
    expect(result.hasProperRhythm).toBe(true)
    expect(result.hasNoElongation).toBe(false)
    expect(result.hasProperWeight).toBe(true)
    expect(result.hasNoCompression).toBe(false)
    expect(result.hasHumanScale).toBe(true)
  })

  it('EMPTY: returns correct scores and system', () => {
    const result = measureProportion(EMPTY)
    expect(result.harmony).toBe(46)
    expect(result.system).toBe('approximate')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureProportion(EMPTY)
    expect(result.hasNoDisproportion).toBe(true)
    expect(result.hasSymmetry).toBe(false)
    expect(result.hasNoElongation).toBe(true)
    expect(result.hasNoCompression).toBe(true)
    expect(result.hasProperProportion).toBe(false)
  })

  it('MEDIUM: returns correct scores and system', () => {
    const result = measureProportion(MEDIUM)
    expect(result.harmony).toBe(63)
    expect(result.system).toBe('approximate')
    expect(result.compressionCount).toBe(1)
  })

  it('MEDIUM: returns correct booleans', () => {
    const result = measureProportion(MEDIUM)
    expect(result.hasNoDisproportion).toBe(true)
    expect(result.hasNoCompression).toBe(false)
    expect(result.hasHumanScale).toBe(true)
  })
})

// ─── measureMaterial ────────────────────────────────────────────────────────

describe('measureMaterial', () => {
  it('RICH: returns correct scores and type', () => {
    const result = measureMaterial(RICH)
    expect(result.quality).toBe(91)
    expect(result.type).toBe('statuario')
    expect(result.flawCount).toBe(0)
    expect(result.inclusionCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureMaterial(RICH)
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasPureGrain).toBe(true)
    expect(result.hasNoFlaws).toBe(true)
    expect(result.hasProperVeining).toBe(true)
    expect(result.hasNoCracks).toBe(false)
    expect(result.hasProperDensity).toBe(true)
    expect(result.hasNoStaining).toBe(false)
    expect(result.hasTranslucence).toBe(true)
    expect(result.hasNoInclusions).toBe(false)
    expect(result.hasProperHardness).toBe(true)
  })

  it('EMPTY: returns correct scores and type', () => {
    const result = measureMaterial(EMPTY)
    expect(result.quality).toBe(32)
    expect(result.type).toBe('travertine')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureMaterial(EMPTY)
    expect(result.hasNoFlaws).toBe(true)
    expect(result.hasNoCracks).toBe(true)
    expect(result.hasNoStaining).toBe(true)
    expect(result.hasNoInclusions).toBe(true)
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasPureGrain).toBe(false)
  })

  it('MEDIUM: returns correct scores and type', () => {
    const result = measureMaterial(MEDIUM)
    expect(result.quality).toBe(55)
    expect(result.type).toBe('travertine')
  })

  it('MEDIUM: returns correct booleans', () => {
    const result = measureMaterial(MEDIUM)
    expect(result.hasNoStaining).toBe(false)
    expect(result.hasNoInclusions).toBe(true)
  })
})

// ─── measureMastery ─────────────────────────────────────────────────────────

describe('measureMastery', () => {
  it('RICH: returns correct scores and level', () => {
    const result = measureMastery(RICH)
    expect(result.score).toBe(88)
    expect(result.level).toBe('bernini')
    expect(result.amateurCount).toBe(0)
    expect(result.overworkingCount).toBe(2)
  })

  it('RICH: returns correct booleans', () => {
    const result = measureMastery(RICH)
    expect(result.hasArtisticMastery).toBe(true)
    expect(result.hasVision).toBe(true)
    expect(result.hasExecution).toBe(true)
    expect(result.hasExpression).toBe(false)
    expect(result.hasNoAmateur).toBe(true)
    expect(result.hasTimelessQuality).toBe(false)
    expect(result.hasOriginalVoice).toBe(true)
    expect(result.hasNoDerivative).toBe(true)
    expect(result.hasProperRestraint).toBe(true)
    expect(result.hasNoOverworking).toBe(false)
  })

  it('EMPTY: returns correct scores and level', () => {
    const result = measureMastery(EMPTY)
    expect(result.score).toBe(30)
    expect(result.level).toBe('vandal')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureMastery(EMPTY)
    expect(result.hasNoAmateur).toBe(true)
    expect(result.hasNoDerivative).toBe(true)
    expect(result.hasNoOverworking).toBe(true)
    expect(result.hasArtisticMastery).toBe(false)
    expect(result.hasVision).toBe(false)
  })

  it('MEDIUM: returns correct scores and level', () => {
    const result = measureMastery(MEDIUM)
    expect(result.score).toBe(55)
    expect(result.level).toBe('student')
  })

  it('MEDIUM: returns correct booleans', () => {
    const result = measureMastery(MEDIUM)
    expect(result.hasNoAmateur).toBe(true)
    expect(result.hasNoDerivative).toBe(true)
    expect(result.hasProperRestraint).toBe(true)
    expect(result.hasNoOverworking).toBe(false)
  })
})

// ─── analyzeMarbleBlock ─────────────────────────────────────────────────────

describe('analyzeMarbleBlock', () => {
  it('RICH: returns correct aggregate scores', () => {
    const block = analyzeMarbleBlock(RICH, 'rich.ts')
    expect(block.sculpturalForm).toBe(88)
    expect(block.chiselPrecision).toBe(88)
    expect(block.surfaceFinish).toBe(90)
    expect(block.proportionalHarmony).toBe(87)
    expect(block.marbleQuality).toBe(91)
    expect(block.artisticMastery).toBe(88)
    expect(block.qualityScore).toBe(89)
  })

  it('RICH: returns correct condition and styles', () => {
    const block = analyzeMarbleBlock(RICH, 'rich.ts')
    expect(block.condition).toBe('david')
    expect(block.form.style).toBe('renaissance')
    expect(block.chisel.technique).toBe('pointing')
    expect(block.surface.quality).toBe('honed')
    expect(block.proportion.system).toBe('classical-canon')
    expect(block.material.type).toBe('statuario')
    expect(block.mastery.level).toBe('bernini')
  })

  it('EMPTY: returns correct all fields', () => {
    const block = analyzeMarbleBlock(EMPTY, 'empty.ts')
    expect(block.qualityScore).toBe(35)
    expect(block.condition).toBe('kouros')
    expect(block.sculpturalForm).toBe(37)
    expect(block.chiselPrecision).toBe(35)
    expect(block.surfaceFinish).toBe(30)
    expect(block.proportionalHarmony).toBe(46)
    expect(block.marbleQuality).toBe(32)
    expect(block.artisticMastery).toBe(30)
    expect(block.form.style).toBe('modern')
    expect(block.chisel.technique).toBe('scratching')
    expect(block.surface.quality).toBe('raw')
    expect(block.proportion.system).toBe('approximate')
    expect(block.material.type).toBe('travertine')
    expect(block.mastery.level).toBe('vandal')
  })

  it('MEDIUM: returns correct all fields', () => {
    const block = analyzeMarbleBlock(MEDIUM, 'medium.ts')
    expect(block.qualityScore).toBe(58)
    expect(block.condition).toBe('venus')
    expect(block.form.style).toBe('modern')
    expect(block.chisel.technique).toBe('scratching')
    expect(block.surface.quality).toBe('rough')
    expect(block.proportion.system).toBe('approximate')
    expect(block.material.type).toBe('travertine')
    expect(block.mastery.level).toBe('student')
  })
})

// ─── buildMarbleStatueResult ────────────────────────────────────────────────

describe('buildMarbleStatueResult', () => {
  it('SINGLE RICH: returns correct studio', () => {
    const result = buildMarbleStatueResult(['rich.ts'], [RICH])
    expect(result.studio.overallMastery).toBe(89)
    expect(result.studio.avgForm).toBe(88)
    expect(result.studio.avgFinish).toBe(90)
    expect(result.studio.avgMastery).toBe(88)
    expect(result.studio.isMasterwork).toBe(true)
  })

  it('SINGLE RICH: returns correct stats', () => {
    const result = buildMarbleStatueResult(['rich.ts'], [RICH])
    expect(result.stats.sculptorGrade).toBe('divine-sculptor')
    expect(result.stats.avgSculpturalForm).toBe(88)
    expect(result.stats.avgChiselPrecision).toBe(88)
    expect(result.stats.avgSurfaceFinish).toBe(90)
    expect(result.stats.avgProportionalHarmony).toBe(87)
    expect(result.stats.avgMarbleQuality).toBe(91)
    expect(result.stats.avgArtisticMastery).toBe(88)
    expect(result.stats.davidCount).toBe(1)
    expect(result.stats.rubbleCount).toBe(0)
  })

  it('EMPTY: returns correct empty result', () => {
    const result = buildMarbleStatueResult([], [])
    expect(result.studio.overallMastery).toBe(0)
    expect(result.stats.sculptorGrade).toBe('vandal')
    expect(result.galleries).toHaveLength(0)
    expect(result.blocks).toHaveLength(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('MIXED: returns correct studio', () => {
    const result = buildMarbleStatueResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.studio.overallMastery).toBe(61)
    expect(result.studio.isMasterwork).toBe(false)
  })

  it('MIXED: returns correct stats counts', () => {
    const result = buildMarbleStatueResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.stats.sculptorGrade).toBe('sculptor')
    expect(result.stats.avgSculpturalForm).toBe(63)
    expect(result.stats.avgChiselPrecision).toBe(60)
    expect(result.stats.avgSurfaceFinish).toBe(57)
    expect(result.stats.avgProportionalHarmony).toBe(65)
    expect(result.stats.avgMarbleQuality).toBe(59)
    expect(result.stats.avgArtisticMastery).toBe(58)
    expect(result.stats.davidCount).toBe(1)
    expect(result.stats.venusCount).toBe(1)
    expect(result.stats.kourosCount).toBe(1)
    expect(result.stats.pietaCount).toBe(0)
    expect(result.stats.bustCount).toBe(0)
    expect(result.stats.rubbleCount).toBe(0)
  })

  it('MIXED: returns correct gallery', () => {
    const result = buildMarbleStatueResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.galleries).toHaveLength(1)
    expect(result.galleries[0].galleryType).toBe('louvre')
    expect(result.galleries[0].condition).toBe('art-institute')
    expect(result.galleries[0].blocks).toHaveLength(3)
    expect(result.galleries[0].davidCount).toBe(1)
  })

  it('MIXED: returns correct highlights', () => {
    const result = buildMarbleStatueResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.stats.bestBlock).toBe('a.ts')
    expect(result.stats.mostBeautiful).toBe('a.ts')
    expect(result.stats.mostPrecise).toBe('a.ts')
    expect(result.stats.bestPolished).toBe('a.ts')
    expect(result.stats.bestProportioned).toBe('a.ts')
    expect(result.stats.finestMarble).toBe('a.ts')
  })

  it('MIXED: generates recommendations', () => {
    const result = buildMarbleStatueResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── scoreColor ─────────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns green for >= 80', () => {
    const result = scoreColor(90)
    expect(result).toContain('90')
  })

  it('returns yellow for >= 60', () => {
    const result = scoreColor(70)
    expect(result).toContain('70')
  })

  it('returns orange for >= 40', () => {
    const result = scoreColor(50)
    expect(result).toContain('50')
  })

  it('returns red for < 40', () => {
    const result = scoreColor(20)
    expect(result).toContain('20')
  })
})

// ─── conditionColor ─────────────────────────────────────────────────────────

describe('conditionColor', () => {
  it('colors david', () => {
    expect(conditionColor('david')).toContain('david')
  })
  it('colors pieta', () => {
    expect(conditionColor('pieta')).toContain('pieta')
  })
  it('colors venus', () => {
    expect(conditionColor('venus')).toContain('venus')
  })
  it('colors kouros', () => {
    expect(conditionColor('kouros')).toContain('kouros')
  })
  it('colors bust', () => {
    expect(conditionColor('bust')).toContain('bust')
  })
  it('colors rubble', () => {
    expect(conditionColor('rubble')).toContain('rubble')
  })
  it('passes through unknown condition', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

// ─── gradeColor ─────────────────────────────────────────────────────────────

describe('gradeColor', () => {
  it('colors divine-sculptor', () => {
    expect(gradeColor('divine-sculptor')).toContain('divine-sculptor')
  })
  it('colors master-sculptor', () => {
    expect(gradeColor('master-sculptor')).toContain('master-sculptor')
  })
  it('colors sculptor', () => {
    expect(gradeColor('sculptor')).toContain('sculptor')
  })
  it('colors artisan', () => {
    expect(gradeColor('artisan')).toContain('artisan')
  })
  it('colors apprentice', () => {
    expect(gradeColor('apprentice')).toContain('apprentice')
  })
  it('colors vandal', () => {
    expect(gradeColor('vandal')).toContain('vandal')
  })
  it('passes through unknown grade', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })
})

// ─── styleColor ─────────────────────────────────────────────────────────────

describe('styleColor', () => {
  it('colors contrapposto', () => {
    expect(styleColor('contrapposto')).toContain('contrapposto')
  })
  it('colors classical', () => {
    expect(styleColor('classical')).toContain('classical')
  })
  it('colors renaissance', () => {
    expect(styleColor('renaissance')).toContain('renaissance')
  })
  it('colors baroque', () => {
    expect(styleColor('baroque')).toContain('baroque')
  })
  it('colors modern', () => {
    expect(styleColor('modern')).toContain('modern')
  })
  it('colors formless', () => {
    expect(styleColor('formless')).toContain('formless')
  })
  it('passes through unknown style', () => {
    expect(styleColor('unknown')).toBe('unknown')
  })
})

// ─── formatMarbleStatueJson ─────────────────────────────────────────────────

describe('formatMarbleStatueJson', () => {
  it('returns valid JSON string', () => {
    const result = buildMarbleStatueResult(['a.ts'], [RICH])
    const json = formatMarbleStatueJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.studio.overallMastery).toBe(89)
    expect(parsed.blocks).toHaveLength(1)
  })
})

// ─── formatMarbleStatueTable ────────────────────────────────────────────────

describe('formatMarbleStatueTable', () => {
  it('returns formatted table string', () => {
    const result = buildMarbleStatueResult(['a.ts'], [RICH])
    const table = formatMarbleStatueTable(result, false)
    expect(table).toContain('Marble Statue Analysis')
    expect(table).toContain('Studio Overview')
    expect(table).toContain('Statistics')
    expect(table).toContain('Condition Counts')
  })

  it('includes per-file details in verbose mode', () => {
    const result = buildMarbleStatueResult(['a.ts'], [RICH])
    const table = formatMarbleStatueTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('a.ts')
  })

  it('shows recommendations when present', () => {
    const result = buildMarbleStatueResult([], [])
    const table = formatMarbleStatueTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('shows highlights when bestBlock exists', () => {
    const result = buildMarbleStatueResult(['a.ts'], [RICH])
    const table = formatMarbleStatueTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Block')
  })
})
