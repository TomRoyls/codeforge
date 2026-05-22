import { describe, expect, it } from 'vitest'

import {
  analyzeLanternFlame,
  analyzeLanternProcession,
  buildLanternGlowResult,
  classifyCondition,
  classifyLanternKeeperGrade,
  classifyProcessionCondition,
  classifyProcessionType,
  generateRecommendations,
  measureCraftsmanship,
  measureGlow,
  measureGuidance,
  measureReach,
  measureStability,
  measureWarmth,
} from '../src/commands/lantern-glow-helpers.js'
import {
  brightnessColor,
  conditionColor,
  formatLanternGlowJson,
  formatLanternGlowTable,
  gradeColor,
  scoreColor,
  stabilityColor,
  warmthColor,
} from '../src/commands/lantern-glow-format-helpers.js'

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

// ─── measureGlow ────────────────────────────────────────────────────────────

describe('measureGlow', () => {
  it('RICH: returns correct intensity and brightness', () => {
    const result = measureGlow(RICH)
    expect(result.intensity).toBe(82)
    expect(result.brightness).toBe('steady')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureGlow(RICH)
    expect(result.hasHighIntensity).toBe(true)
    expect(result.hasProperIllumination).toBe(true)
    expect(result.hasNoDarkSpots).toBe(false)
    expect(result.hasEvenLight).toBe(false)
    expect(result.hasProperDiffusion).toBe(true)
    expect(result.hasNoGlare).toBe(true)
    expect(result.hasClearBeam).toBe(true)
    expect(result.hasNoShadow).toBe(false)
    expect(result.hasWarmTone).toBe(true)
    expect(result.hasNoHarshLight).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureGlow(RICH)
    expect(result.darkSpotCount).toBe(2)
    expect(result.shadowCount).toBe(3)
  })

  it('EMPTY: returns correct intensity and brightness', () => {
    const result = measureGlow(EMPTY)
    expect(result.intensity).toBe(38)
    expect(result.brightness).toBe('flickering')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureGlow(EMPTY)
    expect(result.hasHighIntensity).toBe(false)
    expect(result.hasNoDarkSpots).toBe(true)
    expect(result.hasNoShadow).toBe(true)
    expect(result.hasNoGlare).toBe(true)
  })

  it('MEDIUM: returns correct intensity and brightness', () => {
    const result = measureGlow(MEDIUM)
    expect(result.intensity).toBe(63)
    expect(result.brightness).toBe('flickering')
    expect(result.darkSpotCount).toBe(1)
  })
})

// ─── measureWarmth ──────────────────────────────────────────────────────────

describe('measureWarmth', () => {
  it('RICH: returns correct level and quality', () => {
    const result = measureWarmth(RICH)
    expect(result.level).toBe(90)
    expect(result.quality).toBe('candle')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureWarmth(RICH)
    expect(result.hasHighWarmth).toBe(true)
    expect(result.hasWelcoming).toBe(true)
    expect(result.hasApproachable).toBe(true)
    expect(result.hasNoHostility).toBe(false)
    expect(result.hasComfortable).toBe(true)
    expect(result.hasInviting).toBe(true)
    expect(result.hasNoIntimidation).toBe(true)
    expect(result.hasGentle).toBe(true)
    expect(result.hasNoRejection).toBe(true)
    expect(result.hasNurturing).toBe(true)
    expect(result.hasNoColdness).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureWarmth(RICH)
    expect(result.hostilityCount).toBe(2)
    expect(result.intimidationCount).toBe(0)
  })

  it('EMPTY: returns correct level and quality', () => {
    const result = measureWarmth(EMPTY)
    expect(result.level).toBe(40)
    expect(result.quality).toBe('ember')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureWarmth(EMPTY)
    expect(result.hasNoHostility).toBe(true)
    expect(result.hasNoIntimidation).toBe(true)
    expect(result.hasNoRejection).toBe(true)
  })

  it('MEDIUM: returns correct level and quality', () => {
    const result = measureWarmth(MEDIUM)
    expect(result.level).toBe(65)
    expect(result.quality).toBe('ember')
  })
})

// ─── measureGuidance ────────────────────────────────────────────────────────

describe('measureGuidance', () => {
  it('RICH: returns correct quality and type', () => {
    const result = measureGuidance(RICH)
    expect(result.quality).toBe(85)
    expect(result.type).toBe('trail-marker')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureGuidance(RICH)
    expect(result.hasHighGuidance).toBe(true)
    expect(result.hasClearDirections).toBe(true)
    expect(result.hasProperSignage).toBe(true)
    expect(result.hasNoAmbiguity).toBe(false)
    expect(result.hasPathway).toBe(false)
    expect(result.hasWarning).toBe(true)
    expect(result.hasNoMisdirection).toBe(false)
    expect(result.hasLandmark).toBe(true)
    expect(result.hasNoBlindAlley).toBe(false)
    expect(result.hasProperMapping).toBe(true)
    expect(result.hasNoLostTravelers).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureGuidance(RICH)
    expect(result.ambiguityCount).toBe(2)
    expect(result.misdirectionCount).toBe(2)
  })

  it('EMPTY: returns correct quality and type', () => {
    const result = measureGuidance(EMPTY)
    expect(result.quality).toBe(39)
    expect(result.type).toBe('cairn')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureGuidance(EMPTY)
    expect(result.hasNoAmbiguity).toBe(true)
    expect(result.hasNoMisdirection).toBe(true)
    expect(result.hasNoBlindAlley).toBe(true)
  })

  it('MEDIUM: returns correct quality and type', () => {
    const result = measureGuidance(MEDIUM)
    expect(result.quality).toBe(62)
    expect(result.type).toBe('cairn')
  })
})

// ─── measureStability ───────────────────────────────────────────────────────

describe('measureStability', () => {
  it('RICH: returns correct level and state', () => {
    const result = measureStability(RICH)
    expect(result.level).toBe(90)
    expect(result.state).toBe('stable')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureStability(RICH)
    expect(result.hasHighStability).toBe(true)
    expect(result.hasConsistentFlame).toBe(true)
    expect(result.hasNoFlickering).toBe(true)
    expect(result.hasWindResistance).toBe(true)
    expect(result.hasNoGuttering).toBe(false)
    expect(result.hasFuelReserve).toBe(true)
    expect(result.hasNoSputtering).toBe(true)
    expect(result.hasProperDraft).toBe(true)
    expect(result.hasNoBlowout).toBe(false)
    expect(result.hasSelfRelighting).toBe(true)
    expect(result.hasNoBurnout).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureStability(RICH)
    expect(result.flickeringCount).toBe(0)
    expect(result.blowoutCount).toBe(2)
  })

  it('EMPTY: returns correct level and state', () => {
    const result = measureStability(EMPTY)
    expect(result.level).toBe(30)
    expect(result.state).toBe('extinguished')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureStability(EMPTY)
    expect(result.hasHighStability).toBe(false)
    expect(result.hasNoFlickering).toBe(true)
    expect(result.hasNoBlowout).toBe(true)
  })

  it('MEDIUM: returns correct level and state', () => {
    const result = measureStability(MEDIUM)
    expect(result.level).toBe(52)
    expect(result.state).toBe('unstable')
  })
})

// ─── measureReach ───────────────────────────────────────────────────────────

describe('measureReach', () => {
  it('RICH: returns correct distance and range', () => {
    const result = measureReach(RICH)
    expect(result.distance).toBe(80)
    expect(result.range).toBe('candle-glow')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureReach(RICH)
    expect(result.hasHighReach).toBe(true)
    expect(result.hasWideIllumination).toBe(true)
    expect(result.hasDistantVisibility).toBe(false)
    expect(result.hasNoObscurity).toBe(false)
    expect(result.hasProperProjection).toBe(true)
    expect(result.hasNoDiminishing).toBe(false)
    expect(result.hasLongRange).toBe(true)
    expect(result.hasNoLocalOnly).toBe(false)
    expect(result.hasProperSpread).toBe(true)
    expect(result.hasNoIsolation).toBe(false)
    expect(result.hasBeacon).toBe(true)
  })

  it('RICH: returns correct counters', () => {
    const result = measureReach(RICH)
    expect(result.obscuringCount).toBe(2)
    expect(result.isolationCount).toBe(3)
  })

  it('EMPTY: returns correct distance and range', () => {
    const result = measureReach(EMPTY)
    expect(result.distance).toBe(44)
    expect(result.range).toBe('spark')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureReach(EMPTY)
    expect(result.hasNoObscurity).toBe(true)
    expect(result.hasNoIsolation).toBe(true)
  })

  it('MEDIUM: returns correct distance and range', () => {
    const result = measureReach(MEDIUM)
    expect(result.distance).toBe(67)
    expect(result.range).toBe('spark')
  })
})

// ─── measureCraftsmanship ───────────────────────────────────────────────────

describe('measureCraftsmanship', () => {
  it('RICH: returns correct quality and make', () => {
    const result = measureCraftsmanship(RICH)
    expect(result.quality).toBe(85)
    expect(result.make).toBe('masterwork')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureCraftsmanship(RICH)
    expect(result.hasHighCraftsmanship).toBe(true)
    expect(result.hasProperConstruction).toBe(true)
    expect(result.hasNoDefects).toBe(true)
    expect(result.hasProperMaterials).toBe(false)
    expect(result.hasBeautifulDesign).toBe(true)
    expect(result.hasNoShoddyWork).toBe(false)
    expect(result.hasProperFinish).toBe(true)
    expect(result.hasDurable).toBe(true)
    expect(result.hasNoFragility).toBe(false)
    expect(result.hasLegacy).toBe(true)
    expect(result.hasTimeless).toBe(true)
  })

  it('RICH: returns correct counters', () => {
    const result = measureCraftsmanship(RICH)
    expect(result.defectCount).toBe(0)
    expect(result.shoddyCount).toBe(2)
  })

  it('EMPTY: returns correct quality and make', () => {
    const result = measureCraftsmanship(EMPTY)
    expect(result.quality).toBe(40)
    expect(result.make).toBe('hasty')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureCraftsmanship(EMPTY)
    expect(result.hasNoDefects).toBe(true)
    expect(result.hasNoShoddyWork).toBe(true)
  })

  it('MEDIUM: returns correct quality and make', () => {
    const result = measureCraftsmanship(MEDIUM)
    expect(result.quality).toBe(65)
    expect(result.make).toBe('hasty')
  })
})

// ─── analyzeLanternFlame ────────────────────────────────────────────────────

describe('analyzeLanternFlame', () => {
  it('RICH: returns correct quality score and condition', () => {
    const flame = analyzeLanternFlame(RICH, 'test.ts')
    expect(flame.qualityScore).toBe(86)
    expect(flame.condition).toBe('sky-lantern')
    expect(flame.file).toBe('test.ts')
  })

  it('RICH: returns correct measure scores', () => {
    const flame = analyzeLanternFlame(RICH, 'test.ts')
    expect(flame.glowIntensity).toBe(82)
    expect(flame.lanternWarmth).toBe(90)
    expect(flame.guidanceQuality).toBe(85)
    expect(flame.flameStability).toBe(90)
    expect(flame.lightReach).toBe(80)
    expect(flame.lanternCraftsmanship).toBe(85)
  })

  it('EMPTY: returns correct quality score and condition', () => {
    const flame = analyzeLanternFlame(EMPTY, 'empty.ts')
    expect(flame.qualityScore).toBe(38)
    expect(flame.condition).toBe('oil-lamp')
  })

  it('MEDIUM: returns correct quality score and condition', () => {
    const flame = analyzeLanternFlame(MEDIUM, 'medium.ts')
    expect(flame.qualityScore).toBe(62)
    expect(flame.condition).toBe('paper-lantern')
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies sky-lantern at 80+', () => {
    const flame = { qualityScore: 85, condition: 'extinguished' } as ReturnType<typeof analyzeLanternFlame>
    expect(classifyCondition(flame)).toBe('sky-lantern')
  })
  it('classifies stone-lantern at 65-79', () => {
    const flame = { qualityScore: 70, condition: 'extinguished' } as ReturnType<typeof analyzeLanternFlame>
    expect(classifyCondition(flame)).toBe('stone-lantern')
  })
  it('classifies paper-lantern at 50-64', () => {
    const flame = { qualityScore: 55, condition: 'extinguished' } as ReturnType<typeof analyzeLanternFlame>
    expect(classifyCondition(flame)).toBe('paper-lantern')
  })
  it('classifies oil-lamp at 35-49', () => {
    const flame = { qualityScore: 40, condition: 'extinguished' } as ReturnType<typeof analyzeLanternFlame>
    expect(classifyCondition(flame)).toBe('oil-lamp')
  })
  it('classifies candle-stub at 20-34', () => {
    const flame = { qualityScore: 25, condition: 'extinguished' } as ReturnType<typeof analyzeLanternFlame>
    expect(classifyCondition(flame)).toBe('candle-stub')
  })
  it('classifies extinguished below 20', () => {
    const flame = { qualityScore: 10, condition: 'extinguished' } as ReturnType<typeof analyzeLanternFlame>
    expect(classifyCondition(flame)).toBe('extinguished')
  })
})

// ─── classifyProcessionType ─────────────────────────────────────────────────

describe('classifyProcessionType', () => {
  it('returns blackout for empty array', () => {
    expect(classifyProcessionType([])).toBe('blackout')
  })
  it('returns festival-of-lights for high avg with 30%+ sky-lantern', () => {
    const flames = [
      { qualityScore: 85, condition: 'sky-lantern' },
      { qualityScore: 85, condition: 'sky-lantern' },
      { qualityScore: 80, condition: 'sky-lantern' },
    ] as ReturnType<typeof analyzeLanternFlame>[]
    expect(classifyProcessionType(flames)).toBe('festival-of-lights')
  })
  it('returns lantern-parade for avg 60+', () => {
    const flames = [{ qualityScore: 60, condition: 'paper-lantern' }] as ReturnType<typeof analyzeLanternFlame>[]
    expect(classifyProcessionType(flames)).toBe('lantern-parade')
  })
  it('returns guided-tour for avg 45+', () => {
    const flames = [{ qualityScore: 45, condition: 'oil-lamp' }] as ReturnType<typeof analyzeLanternFlame>[]
    expect(classifyProcessionType(flames)).toBe('guided-tour')
  })
  it('returns night-walk for avg 30+', () => {
    const flames = [{ qualityScore: 35, condition: 'oil-lamp' }] as ReturnType<typeof analyzeLanternFlame>[]
    expect(classifyProcessionType(flames)).toBe('night-walk')
  })
  it('returns dark-alley for avg 15+', () => {
    const flames = [{ qualityScore: 20, condition: 'candle-stub' }] as ReturnType<typeof analyzeLanternFlame>[]
    expect(classifyProcessionType(flames)).toBe('dark-alley')
  })
  it('returns blackout for avg below 15', () => {
    const flames = [{ qualityScore: 10, condition: 'extinguished' }] as ReturnType<typeof analyzeLanternFlame>[]
    expect(classifyProcessionType(flames)).toBe('blackout')
  })
})

// ─── classifyProcessionCondition ────────────────────────────────────────────

describe('classifyProcessionCondition', () => {
  it('returns floating-festival at 80+', () => { expect(classifyProcessionCondition(85)).toBe('floating-festival') })
  it('returns illuminated-path at 65+', () => { expect(classifyProcessionCondition(70)).toBe('illuminated-path') })
  it('returns twilight-walk at 50+', () => { expect(classifyProcessionCondition(55)).toBe('twilight-walk') })
  it('returns dim-corridor at 35+', () => { expect(classifyProcessionCondition(40)).toBe('dim-corridor') })
  it('returns dark-tunnel at 20+', () => { expect(classifyProcessionCondition(25)).toBe('dark-tunnel') })
  it('returns void below 20', () => { expect(classifyProcessionCondition(10)).toBe('void') })
})

// ─── classifyLanternKeeperGrade ─────────────────────────────────────────────

describe('classifyLanternKeeperGrade', () => {
  it('returns grand-master at 80+', () => { expect(classifyLanternKeeperGrade(85)).toBe('grand-master') })
  it('returns master-keeper at 65+', () => { expect(classifyLanternKeeperGrade(70)).toBe('master-keeper') })
  it('returns lantern-keeper at 50+', () => { expect(classifyLanternKeeperGrade(55)).toBe('lantern-keeper') })
  it('returns attendant at 35+', () => { expect(classifyLanternKeeperGrade(40)).toBe('attendant') })
  it('returns apprentice at 20+', () => { expect(classifyLanternKeeperGrade(25)).toBe('apprentice') })
  it('returns darkness-dweller below 20', () => { expect(classifyLanternKeeperGrade(10)).toBe('darkness-dweller') })
})

// ─── analyzeLanternProcession ───────────────────────────────────────────────

describe('analyzeLanternProcession', () => {
  it('returns empty procession for no flames', () => {
    const proc = analyzeLanternProcession([], '.')
    expect(proc.flames).toEqual([])
    expect(proc.processionType).toBe('blackout')
    expect(proc.condition).toBe('void')
    expect(proc.avgGlow).toBe(0)
    expect(proc.avgStability).toBe(0)
    expect(proc.avgCraftsmanship).toBe(0)
  })

  it('returns correct procession for RICH flames', () => {
    const flame = analyzeLanternFlame(RICH, 'test.ts')
    const proc = analyzeLanternProcession([flame], 'src')
    expect(proc.avgGlow).toBe(82)
    expect(proc.avgStability).toBe(90)
    expect(proc.avgCraftsmanship).toBe(85)
    expect(proc.skyLanternCount).toBe(1)
    expect(proc.extinguishedCount).toBe(0)
    expect(proc.highIntensityCount).toBe(1)
    expect(proc.stableCount).toBe(1)
    expect(proc.processionType).toBe('festival-of-lights')
    expect(proc.condition).toBe('floating-festival')
  })
})

// ─── buildLanternGlowResult ─────────────────────────────────────────────────

describe('buildLanternGlowResult', () => {
  it('RICH: returns correct night', () => {
    const result = buildLanternGlowResult(['test.ts'], [RICH])
    expect(result.night.overallIllumination).toBe(86)
    expect(result.night.avgGlow).toBe(82)
    expect(result.night.avgStability).toBe(90)
    expect(result.night.avgCraftsmanship).toBe(85)
    expect(result.night.isIlluminated).toBe(true)
  })

  it('RICH: returns correct stats', () => {
    const result = buildLanternGlowResult(['test.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalProcessions).toBe(1)
    expect(result.stats.avgGlowIntensity).toBe(82)
    expect(result.stats.avgLanternWarmth).toBe(90)
    expect(result.stats.avgGuidanceQuality).toBe(85)
    expect(result.stats.avgFlameStability).toBe(90)
    expect(result.stats.avgLightReach).toBe(80)
    expect(result.stats.avgLanternCraftsmanship).toBe(85)
    expect(result.stats.skyLanternCount).toBe(1)
    expect(result.stats.lanternKeeperGrade).toBe('grand-master')
    expect(result.stats.bestFlame).toBe('test.ts')
    expect(result.stats.brightest).toBe('test.ts')
    expect(result.stats.warmest).toBe('test.ts')
    expect(result.stats.bestGuided).toBe('test.ts')
    expect(result.stats.mostStable).toBe('test.ts')
    expect(result.stats.farthestReach).toBe('test.ts')
  })

  it('RICH: returns magnificent recommendations', () => {
    const result = buildLanternGlowResult(['test.ts'], [RICH])
    expect(result.recommendations).toEqual([
      'Magnificent illumination achieved — your lanterns light the way for all travelers',
    ])
  })

  it('EMPTY: returns correct night', () => {
    const result = buildLanternGlowResult(['empty.ts'], [EMPTY])
    expect(result.night.overallIllumination).toBe(38)
    expect(result.night.isIlluminated).toBe(false)
  })

  it('EMPTY: returns correct stats', () => {
    const result = buildLanternGlowResult(['empty.ts'], [EMPTY])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgFlameStability).toBe(30)
    expect(result.stats.oilLampCount).toBe(1)
    expect(result.stats.lanternKeeperGrade).toBe('attendant')
  })

  it('EMPTY: returns improvement recommendations', () => {
    const result = buildLanternGlowResult(['empty.ts'], [EMPTY])
    expect(result.recommendations.length).toBe(8)
    expect(result.recommendations[0]).toContain('glow intensity')
    expect(result.recommendations[6]).toContain('masterwork')
  })

  it('MIXED: returns correct blended night', () => {
    const result = buildLanternGlowResult(
      ['rich.ts', 'empty.ts', 'medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.night.overallIllumination).toBe(62)
    expect(result.night.isIlluminated).toBe(false)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.skyLanternCount).toBe(1)
    expect(result.stats.paperLanternCount).toBe(1)
    expect(result.stats.oilLampCount).toBe(1)
    expect(result.stats.lanternKeeperGrade).toBe('lantern-keeper')
  })

  it('MIXED: groups files into processions', () => {
    const result = buildLanternGlowResult(
      ['rich.ts', 'empty.ts', 'medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.processions.length).toBe(1)
    expect(result.processions[0].processionType).toBe('lantern-parade')
    expect(result.processions[0].condition).toBe('twilight-walk')
  })

  it('handles empty input arrays', () => {
    const result = buildLanternGlowResult([], [])
    expect(result.flames).toEqual([])
    expect(result.processions).toEqual([])
    expect(result.night.overallIllumination).toBe(0)
    expect(result.night.isIlluminated).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestFlame).toBe('')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns magnificent message when all is good', () => {
    const result = buildLanternGlowResult(['test.ts'], [RICH])
    const recs = generateRecommendations(result.flames, result.processions, result.night, result.stats)
    expect(recs).toContain('Magnificent illumination achieved — your lanterns light the way for all travelers')
  })

  it('returns improvement recs for low scores', () => {
    const result = buildLanternGlowResult(['empty.ts'], [EMPTY])
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
    expect(typeof conditionColor('sky-lantern')).toBe('string')
    expect(typeof conditionColor('stone-lantern')).toBe('string')
    expect(typeof conditionColor('paper-lantern')).toBe('string')
    expect(typeof conditionColor('oil-lamp')).toBe('string')
    expect(typeof conditionColor('candle-stub')).toBe('string')
    expect(typeof conditionColor('extinguished')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
  })

  it('gradeColor returns string for all grades', () => {
    expect(typeof gradeColor('grand-master')).toBe('string')
    expect(typeof gradeColor('master-keeper')).toBe('string')
    expect(typeof gradeColor('lantern-keeper')).toBe('string')
    expect(typeof gradeColor('attendant')).toBe('string')
    expect(typeof gradeColor('apprentice')).toBe('string')
    expect(typeof gradeColor('darkness-dweller')).toBe('string')
  })

  it('brightnessColor returns string for all values', () => {
    expect(typeof brightnessColor('beacon')).toBe('string')
    expect(typeof brightnessColor('bright')).toBe('string')
    expect(typeof brightnessColor('steady')).toBe('string')
    expect(typeof brightnessColor('dim')).toBe('string')
    expect(typeof brightnessColor('flickering')).toBe('string')
    expect(typeof brightnessColor('dark')).toBe('string')
  })

  it('warmthColor returns string for all values', () => {
    expect(typeof warmthColor('hearth')).toBe('string')
    expect(typeof warmthColor('campfire')).toBe('string')
    expect(typeof warmthColor('candle')).toBe('string')
    expect(typeof warmthColor('match')).toBe('string')
    expect(typeof warmthColor('ember')).toBe('string')
    expect(typeof warmthColor('cold')).toBe('string')
  })

  it('stabilityColor returns string for all values', () => {
    expect(typeof stabilityColor('rock-steady')).toBe('string')
    expect(typeof stabilityColor('stable')).toBe('string')
    expect(typeof stabilityColor('mostly-stable')).toBe('string')
    expect(typeof stabilityColor('wavering')).toBe('string')
    expect(typeof stabilityColor('unstable')).toBe('string')
    expect(typeof stabilityColor('extinguished')).toBe('string')
  })

  it('formatLanternGlowJson returns valid JSON', () => {
    const result = buildLanternGlowResult(['test.ts'], [RICH])
    const json = formatLanternGlowJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.night.overallIllumination).toBe(86)
  })

  it('formatLanternGlowTable returns string with header', () => {
    const result = buildLanternGlowResult(['test.ts'], [RICH])
    const table = formatLanternGlowTable(result, false)
    expect(table).toContain('Lantern Glow Analysis')
    expect(table).toContain('Night Overview')
    expect(table).toContain('Statistics')
  })

  it('formatLanternGlowTable with verbose shows per-file details', () => {
    const result = buildLanternGlowResult(['test.ts'], [RICH])
    const table = formatLanternGlowTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('test.ts')
  })

  it('formatLanternGlowTable shows recommendations', () => {
    const result = buildLanternGlowResult(['test.ts'], [RICH])
    const table = formatLanternGlowTable(result, false)
    expect(table).toContain('Recommendations')
    expect(table).toContain('Magnificent')
  })

  it('formatLanternGlowTable shows highlights', () => {
    const result = buildLanternGlowResult(['test.ts'], [RICH])
    const table = formatLanternGlowTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Flame')
    expect(table).toContain('Brightest')
    expect(table).toContain('Farthest Reach')
  })

  it('formatLanternGlowTable shows condition counts', () => {
    const result = buildLanternGlowResult(['test.ts'], [RICH])
    const table = formatLanternGlowTable(result, false)
    expect(table).toContain('Condition Counts')
    expect(table).toContain('Sky Lantern')
    expect(table).toContain('Extinguished')
  })
})
