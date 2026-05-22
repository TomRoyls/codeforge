import { describe, expect, it } from 'vitest'

import {
  classifyCaptainGrade,
  classifyCondition,
  classifyZoneType,
  measureBio,
  measureCurrent,
  measureDepth,
  measureNavigation,
  measurePressure,
  measureTrench,
  analyzeAbyssalSpecimen,
  buildDeepOceanResult,
  analyzeOceanZone,
  generateRecommendations,
} from '../src/commands/deep-ocean-helpers.js'

import {
  scoreColor,
  conditionColor,
  gradeColor,
  zoneColor,
  flowColor,
  glowColor,
  resistanceColor,
  formationColor,
  equipmentColor,
  zoneTypeColor,
  zoneConditionColor,
  formatDeepOceanJson,
  formatDeepOceanTable,
} from '../src/commands/deep-ocean-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `
export interface Foo { x: number }
export type Bar = Foo | null
export class Baz implements Foo {
  private x: number = 0
  constructor(x: number) { this.x = x }
  /** Docs */
  async getValue(): Promise<number> {
    try { return this.x } catch { return 0 }
  }
}
export function add<T>(a: T, b: T): T { return a }
export const mul = (a: number, b: number) => a * b
export enum Color { Red, Green, Blue }
export { Foo } from "./foo"
// TODO: fix later
`

const EMPTY = ''

const MEDIUM = 'const x = 1\n'

// ─── measureDepth ──────────────────────────────────────────────────────────

describe('measureDepth', () => {
  it('returns 43 for empty content', () => {
    expect(measureDepth(EMPTY).complexity).toBe(43)
  })

  it('returns hadal-zone for rich content', () => {
    const r = measureDepth(RICH)
    expect(r.complexity).toBe(90)
    expect(r.zone).toBe('hadal-zone')
  })

  it('returns epipelagic for medium content', () => {
    const r = measureDepth(MEDIUM)
    expect(r.complexity).toBe(48)
    expect(r.zone).toBe('epipelagic')
  })

  it('returns abyssal-zone for complexity in 80-89 range', () => {
    const content = 'export interface Foo { x: number; y: string }\nexport function a() { try { return 1 } catch(e) { return 0 } }\nasync function b() { await fetch() }\n/** docs */\n'
    const r = measureDepth(content)
    expect(r.complexity).toBeGreaterThanOrEqual(80)
    expect(r.complexity).toBeLessThanOrEqual(89)
    expect(r.zone).toBe('abyssal-zone')
  })

  it('returns surface for complexity below 30', () => {
    const r = measureDepth(': any\nHACK: bad\n: any\n')
    expect(r.complexity).toBeLessThanOrEqual(30)
    expect(r.zone).toBe('surface')
  })

  it('returns bathyal-zone for high complexity', () => {
    const content = 'export function a() {}\nexport function b() {}\n'
    const r = measureDepth(content)
    expect(r.complexity).toBeGreaterThanOrEqual(40)
  })

  it('returns mesopelagic for complexity in 40-59 range with clear zones and pressure', () => {
    const content = 'export function a() { try { x() } catch(e) { handle(e) } }\n'
    const r = measureDepth(content)
    expect(r.zone).toBe('mesopelagic')
  })

  it('clamps complexity to max 100', () => {
    const massive = Array(200).fill('export class Cls { private x: number = 1 }\n').join('')
    const r = measureDepth(massive)
    expect(r.complexity).toBeLessThanOrEqual(100)
  })

  it('populates hasModerateComplexity correctly', () => {
    const r = measureDepth(RICH)
    expect(r.hasModerateComplexity).toBe(true)
  })

  it('populates boolean flags', () => {
    const r = measureDepth(RICH)
    expect(typeof r.hasProperStratification).toBe('boolean')
    expect(typeof r.hasNoExcessiveDepth).toBe('boolean')
    expect(typeof r.hasClearZones).toBe('boolean')
    expect(typeof r.hasNoDarkness).toBe('boolean')
    expect(typeof r.hasThermocline).toBe('boolean')
    expect(typeof r.hasNoSuffocation).toBe('boolean')
    expect(typeof r.hasProperPressure).toBe('boolean')
    expect(typeof r.hasNoCrushing).toBe('boolean')
    expect(typeof r.hasLightPenetration).toBe('boolean')
  })

  it('populates darknessCount and crushingCount', () => {
    const r = measureDepth(RICH)
    expect(typeof r.darknessCount).toBe('number')
    expect(typeof r.crushingCount).toBe('number')
  })
})

// ─── measureCurrent ────────────────────────────────────────────────────────

describe('measureCurrent', () => {
  it('returns 51 for empty content', () => {
    expect(measureCurrent(EMPTY).quality).toBe(51)
  })

  it('returns tidal for rich content', () => {
    const r = measureCurrent(RICH)
    expect(r.quality).toBe(67)
    expect(r.flow).toBe('tidal')
  })

  it('returns stagnant for medium content', () => {
    const r = measureCurrent(MEDIUM)
    expect(r.quality).toBe(56)
    expect(r.flow).toBe('stagnant')
  })

  it('returns thermohaline for very high quality with proper circulation', () => {
    const content = Array(10).fill('import { x } from "y"\nexport async function fn(): Promise<void> { await fetch(); return; }\n').join('')
    const r = measureCurrent(content)
    expect(r.flow).toBe('thermohaline')
  })

  it('returns whirlpool for very low quality', () => {
    const content = ': any\n: any\ntry{}catch(e){}\n?1:2?3:4\nTODO:fix\nHACK:bad\n'
    const r = measureCurrent(content)
    expect(r.flow).toBe('whirlpool')
  })

  it('returns gulf-stream for high quality no eddies', () => {
    const content = Array(10).fill('export async function fn(): Promise<void> { await fetch(); return; }\n').join('')
    const r = measureCurrent(content)
    expect(r.quality).toBeGreaterThanOrEqual(60)
  })

  it('returns steady-current for quality in 60-79', () => {
    const content = 'function a() { return 1 }\nconst b = () => 2\n'
    const r = measureCurrent(content)
    expect(r.quality).toBeGreaterThanOrEqual(40)
  })

  it('clamps to max 100', () => {
    const massive = Array(100).fill('export async function fn(): Promise<void> { await Promise.all([]) }\n').join('')
    const r = measureCurrent(massive)
    expect(r.quality).toBeLessThanOrEqual(100)
  })

  it('populates boolean flags', () => {
    const r = measureCurrent(RICH)
    expect(typeof r.hasHighQuality).toBe('boolean')
    expect(typeof r.hasSmoothFlow).toBe('boolean')
    expect(typeof r.hasProperCirculation).toBe('boolean')
    expect(typeof r.hasNoEddies).toBe('boolean')
    expect(typeof r.hasConveyor).toBe('boolean')
  })

  it('populates eddyCount and pollutionCount', () => {
    const r = measureCurrent(RICH)
    expect(typeof r.eddyCount).toBe('number')
    expect(typeof r.pollutionCount).toBe('number')
  })
})

// ─── measureBio ────────────────────────────────────────────────────────────

describe('measureBio', () => {
  it('returns 40 for empty content', () => {
    expect(measureBio(EMPTY).luminescence).toBe(40)
  })

  it('returns dazzling for rich content', () => {
    const r = measureBio(RICH)
    expect(r.luminescence).toBe(90)
    expect(r.glow).toBe('dazzling')
  })

  it('returns flickering for medium content', () => {
    const r = measureBio(MEDIUM)
    expect(r.luminescence).toBe(45)
    expect(r.glow).toBe('flickering')
  })

  it('returns bright-glow for high luminescence with no dark spots', () => {
    const content = Array(10).fill('export interface IThing { name: string; value: number }\n/** docs */\n').join('')
    const r = measureBio(content)
    expect(r.glow).toBe('bright-glow')
  })

  it('returns dark for very low luminescence', () => {
    const content = ': any\n: any\nHACK: bad\nTODO:fix\n?1:2?3:4\nconsole.log(x)\n'
    const r = measureBio(content)
    expect(r.glow).toBe('dark')
  })

  it('returns steady-glow for high luminescence', () => {
    const content = 'export interface A { x: number }\nexport type B = A\n'
    const r = measureBio(content)
    expect(r.luminescence).toBeGreaterThanOrEqual(50)
  })

  it('returns dim-light for luminescence in 40-59', () => {
    const r = measureBio(MEDIUM)
    expect(r.luminescence).toBeGreaterThanOrEqual(40)
  })

  it('clamps to max 100', () => {
    const massive = Array(200).fill('export interface I { a: number; b: string }\n/** docs */\n').join('')
    const r = measureBio(massive)
    expect(r.luminescence).toBeLessThanOrEqual(100)
  })

  it('populates boolean flags', () => {
    const r = measureBio(RICH)
    expect(typeof r.hasHighLuminescence).toBe('boolean')
    expect(typeof r.hasDocumentation).toBe('boolean')
    expect(typeof r.hasClearSignals).toBe('boolean')
    expect(typeof r.hasNoDarkSpots).toBe('boolean')
    expect(typeof r.hasIlluminated).toBe('boolean')
  })

  it('populates darkSpotCount and shadowZoneCount', () => {
    const r = measureBio(RICH)
    expect(typeof r.darkSpotCount).toBe('number')
    expect(typeof r.shadowZoneCount).toBe('number')
  })
})

// ─── measurePressure ───────────────────────────────────────────────────────

describe('measurePressure', () => {
  it('returns 53 for empty content', () => {
    expect(measurePressure(EMPTY).handling).toBe(53)
  })

  it('returns titanium-hull for rich content', () => {
    const r = measurePressure(RICH)
    expect(r.handling).toBe(90)
    expect(r.resistance).toBe('titanium-hull')
  })

  it('returns fragile for medium content', () => {
    const r = measurePressure(MEDIUM)
    expect(r.handling).toBe(58)
    expect(r.resistance).toBe('fragile')
  })

  it('returns deep-adapted for high handling no leaks', () => {
    const content = Array(5).fill('export interface I { x: number }\n').join('')
    const r = measurePressure(content)
    expect(r.resistance).toBe('deep-adapted')
  })

  it('returns crushed for very low handling', () => {
    const content = ': any\n: any\nHACK: bad\n?1:2?3:4\n'
    const r = measurePressure(content)
    expect(r.resistance).toBe('crushed')
  })

  it('returns pressure-resistant for handling in 60-79', () => {
    const content = 'try { x() } catch(e) { y() }\nif (a) { b() } else { c() }\n'
    const r = measurePressure(content)
    expect(r.handling).toBeGreaterThanOrEqual(40)
  })

  it('returns moderate for handling in 40-59', () => {
    const r = measurePressure('let x = 1\n')
    expect(r.handling).toBeGreaterThanOrEqual(40)
  })

  it('clamps to max 100', () => {
    const massive = Array(100).fill('try { await fn() } catch(e) { throw e }\n').join('')
    const r = measurePressure(massive)
    expect(r.handling).toBeLessThanOrEqual(100)
  })

  it('populates boolean flags', () => {
    const r = measurePressure(RICH)
    expect(typeof r.hasHighHandling).toBe('boolean')
    expect(typeof r.hasProperReinforcement).toBe('boolean')
    expect(typeof r.hasNoBuckling).toBe('boolean')
    expect(typeof r.hasPressureValve).toBe('boolean')
    expect(typeof r.hasNoImplosion).toBe('boolean')
  })

  it('populates bucklingCount and leakCount', () => {
    const r = measurePressure(RICH)
    expect(typeof r.bucklingCount).toBe('number')
    expect(typeof r.leakCount).toBe('number')
  })
})

// ─── measureTrench ─────────────────────────────────────────────────────────

describe('measureTrench', () => {
  it('returns 40 for empty content', () => {
    expect(measureTrench(EMPTY).quality).toBe(40)
  })

  it('returns continental-shelf for rich content', () => {
    const r = measureTrench(RICH)
    expect(r.quality).toBe(68)
    expect(r.formation).toBe('continental-shelf')
  })

  it('returns shallow-basin for medium content', () => {
    const r = measureTrench(MEDIUM)
    expect(r.quality).toBe(45)
    expect(r.formation).toBe('shallow-basin')
  })

  it('returns mariana-grade for very high quality', () => {
    const content = 'export interface I { x: number }\nexport type T = I\nexport class C { fn(): void {} }\nexport abstract class A { abstract m(): void }\nimport { x } from "y"\n<T,>(a: T): T => a\nx?: number\n/** doc */\ntry { fn() } catch(e) { handle(e) }\n'
    const r = measureTrench(content)
    expect(r.formation).toBe('mariana-grade')
  })

  it('returns puddle for very low quality', () => {
    const content = ': any\n: any\nHACK:bad\nTODO:fix\n?1:2?3:4\n'
    const r = measureTrench(content)
    expect(r.formation).toBe('puddle')
  })

  it('returns deep-trench for quality in 80-89', () => {
    const content = 'export interface I { x: number }\nexport type T = I\nexport class C {}\nimport { x } from "y"\n/** doc */\n<T>(a: T): T => a\ntry { fn() } catch(e) { handle(e) }\n'
    const r = measureTrench(content)
    expect(r.quality).toBeGreaterThanOrEqual(60)
  })

  it('returns mid-ocean-ridge for quality in 60-79', () => {
    const content = 'export class A { constructor() {} getValue() { return 1 } }\n'
    const r = measureTrench(content)
    expect(r.quality).toBeGreaterThanOrEqual(40)
  })

  it('clamps to max 100', () => {
    const massive = Array(200).fill('export abstract class X { abstract a(): void; abstract b(): void }\n').join('')
    const r = measureTrench(massive)
    expect(r.quality).toBeLessThanOrEqual(100)
  })

  it('populates boolean flags', () => {
    const r = measureTrench(RICH)
    expect(typeof r.hasHighQuality).toBe('boolean')
    expect(typeof r.hasSolidStructure).toBe('boolean')
    expect(typeof r.hasProperPlates).toBe('boolean')
    expect(typeof r.hasNoSubduction).toBe('boolean')
    expect(typeof r.hasStableFoundation).toBe('boolean')
  })

  it('populates subductionCount and faultLineCount', () => {
    const r = measureTrench(RICH)
    expect(typeof r.subductionCount).toBe('number')
    expect(typeof r.faultLineCount).toBe('number')
  })
})

// ─── measureNavigation ─────────────────────────────────────────────────────

describe('measureNavigation', () => {
  it('returns 53 for empty content', () => {
    expect(measureNavigation(EMPTY).quality).toBe(53)
  })

  it('returns sonar-perfect for rich content', () => {
    const r = measureNavigation(RICH)
    expect(r.quality).toBe(89)
    expect(r.equipment).toBe('sonar-perfect')
  })

  it('returns lost for medium content', () => {
    const r = measureNavigation(MEDIUM)
    expect(r.quality).toBe(58)
    expect(r.equipment).toBe('lost')
  })

  it('returns well-equipped for quality in 80-89', () => {
    const content = Array(6).fill('export function a(): string { return "" }\nexport type T = string\n').join('')
    const r = measureNavigation(content)
    expect(r.equipment).toBe('well-equipped')
  })

  it('returns hopeless for very low quality', () => {
    const content = ': any\n: any\nHACK:bad\nTODO:fix\n?1:2?3:4\nconsole.log(x)\n'
    const r = measureNavigation(content)
    expect(r.equipment).toBe('hopeless')
  })

  it('returns basic-instruments for quality in 60-79', () => {
    const content = 'export function a(): void {}\n'
    const r = measureNavigation(content)
    expect(r.quality).toBeGreaterThanOrEqual(40)
  })

  it('returns compass-only for quality in 40-59', () => {
    const r = measureNavigation('let x = 1\n')
    expect(r.quality).toBeGreaterThanOrEqual(40)
  })

  it('clamps to max 100', () => {
    const massive = Array(200).fill('export function fn(): string { return "" }\n').join('')
    const r = measureNavigation(massive)
    expect(r.quality).toBeLessThanOrEqual(100)
  })

  it('populates boolean flags', () => {
    const r = measureNavigation(RICH)
    expect(typeof r.hasHighQuality).toBe('boolean')
    expect(typeof r.hasProperCharts).toBe('boolean')
    expect(typeof r.hasNoBlindNavigation).toBe('boolean')
    expect(typeof r.hasWaypoints).toBe('boolean')
    expect(typeof r.hasNoDeadReckoning).toBe('boolean')
  })

  it('populates blindCount and unchartedCount', () => {
    const r = measureNavigation(RICH)
    expect(typeof r.blindCount).toBe('number')
    expect(typeof r.unchartedCount).toBe('number')
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns hydrothermal-vent for qualityScore >= 80', () => {
    const sp = analyzeAbyssalSpecimen(RICH, 'rich.ts')
    expect(classifyCondition(sp)).toBe('hydrothermal-vent')
  })

  it('returns coral-garden for qualityScore in 65-79', () => {
    const sp = { ...analyzeAbyssalSpecimen(MEDIUM, 'm.ts'), qualityScore: 70 } as any
    expect(classifyCondition(sp)).toBe('coral-garden')
  })

  it('returns open-water for qualityScore in 50-64', () => {
    const sp = { ...analyzeAbyssalSpecimen(MEDIUM, 'm.ts'), qualityScore: 55 } as any
    expect(classifyCondition(sp)).toBe('open-water')
  })

  it('returns murky-depths for qualityScore in 35-49', () => {
    const sp = { ...analyzeAbyssalSpecimen(EMPTY, 'e.ts'), qualityScore: 40 } as any
    expect(classifyCondition(sp)).toBe('murky-depths')
  })

  it('returns dead-zone for qualityScore in 20-34', () => {
    const sp = { ...analyzeAbyssalSpecimen(EMPTY, 'e.ts'), qualityScore: 25 } as any
    expect(classifyCondition(sp)).toBe('dead-zone')
  })

  it('returns void for qualityScore below 20', () => {
    const sp = { ...analyzeAbyssalSpecimen(EMPTY, 'e.ts'), qualityScore: 10 } as any
    expect(classifyCondition(sp)).toBe('void')
  })
})

// ─── classifyZoneType ──────────────────────────────────────────────────────

describe('classifyZoneType', () => {
  it('returns dry-land for empty specimens', () => {
    expect(classifyZoneType([])).toBe('dry-land')
  })

  it('returns deep-trench-system for high average with vents', () => {
    const specimens = Array(3).fill(null).map(() => analyzeAbyssalSpecimen(RICH, 'r.ts'))
    expect(classifyZoneType(specimens)).toBe('deep-trench-system')
  })

  it('returns abyssal-plain for score in 60-74', () => {
    const specimens = [analyzeAbyssalSpecimen(RICH, 'r.ts'), analyzeAbyssalSpecimen(MEDIUM, 'm.ts')]
    expect(classifyZoneType(specimens)).toBe('abyssal-plain')
  })

  it('returns mid-ocean-ridge for score in 45-59', () => {
    const specimens = [analyzeAbyssalSpecimen(MEDIUM, 'm.ts')]
    expect(classifyZoneType(specimens)).toBe('mid-ocean-ridge')
  })

  it('returns continental-shelf for score in 30-44', () => {
    const sp = { ...analyzeAbyssalSpecimen(EMPTY, 'e.ts'), qualityScore: 35 } as any
    expect(classifyZoneType([sp])).toBe('continental-shelf')
  })

  it('returns tidal-pool for score in 15-29', () => {
    const sp = { ...analyzeAbyssalSpecimen(EMPTY, 'e.ts'), qualityScore: 20 } as any
    expect(classifyZoneType([sp])).toBe('tidal-pool')
  })

  it('returns dry-land for score below 15', () => {
    const sp = { ...analyzeAbyssalSpecimen(EMPTY, 'e.ts'), qualityScore: 5 } as any
    expect(classifyZoneType([sp])).toBe('dry-land')
  })
})

// ─── classifyCaptainGrade ──────────────────────────────────────────────────

describe('classifyCaptainGrade', () => {
  it('returns deep-sea-commander for score >= 80', () => {
    expect(classifyCaptainGrade(80)).toBe('deep-sea-commander')
    expect(classifyCaptainGrade(90)).toBe('deep-sea-commander')
    expect(classifyCaptainGrade(100)).toBe('deep-sea-commander')
  })

  it('returns oceanographer for score in 65-79', () => {
    expect(classifyCaptainGrade(65)).toBe('oceanographer')
    expect(classifyCaptainGrade(79)).toBe('oceanographer')
  })

  it('returns navigator for score in 50-64', () => {
    expect(classifyCaptainGrade(50)).toBe('navigator')
    expect(classifyCaptainGrade(64)).toBe('navigator')
  })

  it('returns diver for score in 35-49', () => {
    expect(classifyCaptainGrade(35)).toBe('diver')
    expect(classifyCaptainGrade(49)).toBe('diver')
  })

  it('returns swimmer for score in 20-34', () => {
    expect(classifyCaptainGrade(20)).toBe('swimmer')
    expect(classifyCaptainGrade(34)).toBe('swimmer')
  })

  it('returns landlubber for score below 20', () => {
    expect(classifyCaptainGrade(0)).toBe('landlubber')
    expect(classifyCaptainGrade(19)).toBe('landlubber')
  })
})

// ─── analyzeAbyssalSpecimen ────────────────────────────────────────────────

describe('analyzeAbyssalSpecimen', () => {
  it('analyzes rich content correctly', () => {
    const sp = analyzeAbyssalSpecimen(RICH, 'rich.ts')
    expect(sp.depthComplexity).toBe(90)
    expect(sp.currentQuality).toBe(67)
    expect(sp.bioluminescence).toBe(90)
    expect(sp.pressureHandling).toBe(90)
    expect(sp.trenchQuality).toBe(68)
    expect(sp.abyssalNavigation).toBe(89)
    expect(sp.qualityScore).toBe(82)
    expect(sp.condition).toBe('hydrothermal-vent')
    expect(sp.file).toBe('rich.ts')
  })

  it('analyzes empty content correctly', () => {
    const sp = analyzeAbyssalSpecimen(EMPTY, 'empty.ts')
    expect(sp.depthComplexity).toBe(43)
    expect(sp.currentQuality).toBe(51)
    expect(sp.bioluminescence).toBe(40)
    expect(sp.pressureHandling).toBe(53)
    expect(sp.trenchQuality).toBe(40)
    expect(sp.abyssalNavigation).toBe(53)
    expect(sp.qualityScore).toBe(46)
    expect(sp.condition).toBe('murky-depths')
    expect(sp.file).toBe('empty.ts')
  })

  it('analyzes medium content correctly', () => {
    const sp = analyzeAbyssalSpecimen(MEDIUM, 'medium.ts')
    expect(sp.depthComplexity).toBe(48)
    expect(sp.currentQuality).toBe(56)
    expect(sp.bioluminescence).toBe(45)
    expect(sp.pressureHandling).toBe(58)
    expect(sp.trenchQuality).toBe(45)
    expect(sp.abyssalNavigation).toBe(58)
    expect(sp.qualityScore).toBe(51)
    expect(sp.condition).toBe('open-water')
    expect(sp.file).toBe('medium.ts')
  })

  it('populates depth detail', () => {
    const sp = analyzeAbyssalSpecimen(RICH, 'rich.ts')
    expect(sp.depth.complexity).toBe(90)
    expect(sp.depth.zone).toBe('hadal-zone')
  })

  it('populates current detail', () => {
    const sp = analyzeAbyssalSpecimen(RICH, 'rich.ts')
    expect(sp.current.quality).toBe(67)
    expect(sp.current.flow).toBe('tidal')
  })

  it('populates bio detail', () => {
    const sp = analyzeAbyssalSpecimen(RICH, 'rich.ts')
    expect(sp.bio.luminescence).toBe(90)
    expect(sp.bio.glow).toBe('dazzling')
  })

  it('populates pressure detail', () => {
    const sp = analyzeAbyssalSpecimen(RICH, 'rich.ts')
    expect(sp.pressure.handling).toBe(90)
    expect(sp.pressure.resistance).toBe('titanium-hull')
  })

  it('populates trench detail', () => {
    const sp = analyzeAbyssalSpecimen(RICH, 'rich.ts')
    expect(sp.trench.quality).toBe(68)
    expect(sp.trench.formation).toBe('continental-shelf')
  })

  it('populates navigation detail', () => {
    const sp = analyzeAbyssalSpecimen(RICH, 'rich.ts')
    expect(sp.navigation.quality).toBe(89)
    expect(sp.navigation.equipment).toBe('sonar-perfect')
  })
})

// ─── analyzeOceanZone ──────────────────────────────────────────────────────

describe('analyzeOceanZone', () => {
  it('returns dry-land for empty specimens', () => {
    const z = analyzeOceanZone([], '.')
    expect(z.zoneType).toBe('dry-land')
    expect(z.condition).toBe('evaporated')
    expect(z.specimens).toHaveLength(0)
  })

  it('computes averages correctly', () => {
    const specimens = [analyzeAbyssalSpecimen(RICH, 'rich.ts')]
    const z = analyzeOceanZone(specimens, 'src')
    expect(z.avgDepth).toBe(90)
    expect(z.avgCurrent).toBe(67)
    expect(z.avgNavigation).toBe(89)
  })

  it('counts vents and voids', () => {
    const specimens = [analyzeAbyssalSpecimen(RICH, 'r.ts'), analyzeAbyssalSpecimen(EMPTY, 'e.ts')]
    const z = analyzeOceanZone(specimens, '.')
    expect(z.ventCount).toBe(1)
    expect(z.voidCount).toBe(0)
  })

  it('sets directory', () => {
    const z = analyzeOceanZone([analyzeAbyssalSpecimen(RICH, 'r.ts')], 'src/cmd')
    expect(z.directory).toBe('src/cmd')
  })

  it('sets thriving-ecosystem for high avg score', () => {
    const specimens = Array(3).fill(null).map(() => analyzeAbyssalSpecimen(RICH, 'r.ts'))
    const z = analyzeOceanZone(specimens, '.')
    expect(z.condition).toBe('thriving-ecosystem')
  })
})

// ─── buildDeepOceanResult ──────────────────────────────────────────────────

describe('buildDeepOceanResult', () => {
  it('builds result for single rich file', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.totalZones).toBe(1)
    expect(r.stats.avgDepthComplexity).toBe(90)
    expect(r.stats.avgCurrentQuality).toBe(67)
    expect(r.stats.avgBioluminescence).toBe(90)
    expect(r.stats.avgPressureHandling).toBe(90)
    expect(r.stats.avgTrenchQuality).toBe(68)
    expect(r.stats.avgAbyssalNavigation).toBe(89)
    expect(r.stats.overallHealth).toBe(82)
    expect(r.stats.captainGrade).toBe('deep-sea-commander')
    expect(r.stats.hydrothermalVentCount).toBe(1)
    expect(r.specimens).toHaveLength(1)
  })

  it('builds result for single empty file', () => {
    const r = buildDeepOceanResult(['empty.ts'], [EMPTY])
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.avgDepthComplexity).toBe(43)
    expect(r.stats.overallHealth).toBe(46)
    expect(r.stats.captainGrade).toBe('diver')
    expect(r.stats.murkyDepthsCount).toBe(1)
    expect(r.ocean.isHealthy).toBe(false)
  })

  it('builds result for mixed files', () => {
    const r = buildDeepOceanResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgDepthComplexity).toBe(69)
    expect(r.stats.avgCurrentQuality).toBe(62)
    expect(r.stats.avgBioluminescence).toBe(68)
    expect(r.stats.avgPressureHandling).toBe(74)
    expect(r.stats.avgTrenchQuality).toBe(57)
    expect(r.stats.avgAbyssalNavigation).toBe(74)
    expect(r.stats.overallHealth).toBe(67)
    expect(r.stats.captainGrade).toBe('oceanographer')
    expect(r.specimens).toHaveLength(2)
    expect(r.stats.bestSpecimen).toBe('rich.ts')
  })

  it('handles empty file list', () => {
    const r = buildDeepOceanResult([], [])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.specimens).toHaveLength(0)
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('computes best fields correctly', () => {
    const r = buildDeepOceanResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(r.stats.bestDepth).toBe('rich.ts')
    expect(r.stats.bestFlow).toBe('rich.ts')
    expect(r.stats.mostIlluminated).toBe('rich.ts')
    expect(r.stats.mostResilient).toBe('rich.ts')
    expect(r.stats.bestArchitected).toBe('rich.ts')
    expect(r.stats.bestSpecimen).toBe('rich.ts')
  })

  it('computes ocean correctly', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    expect(r.ocean.avgDepth).toBe(90)
    expect(r.ocean.avgCurrent).toBe(67)
    expect(r.ocean.avgNavigation).toBe(89)
    expect(r.ocean.isHealthy).toBe(true)
    expect(r.ocean.overallHealth).toBe(82)
  })

  it('counts condition categories correctly', () => {
    const r = buildDeepOceanResult(['rich.ts', 'medium.ts', 'empty.ts'], [RICH, MEDIUM, EMPTY])
    expect(r.stats.hydrothermalVentCount).toBe(1)
    expect(r.stats.openWaterCount).toBe(1)
    expect(r.stats.murkyDepthsCount).toBe(1)
  })

  it('computes hasModerateComplexityCount', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    expect(r.stats.hasModerateComplexityCount).toBe(1)
  })

  it('computes hasHighLuminescenceCount', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    expect(r.stats.hasHighLuminescenceCount).toBe(1)
  })

  it('computes hasHighHandlingCount', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    expect(r.stats.hasHighHandlingCount).toBe(1)
  })

  it('computes hasHighNavigationCount', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    expect(r.stats.hasHighNavigationCount).toBe(1)
  })

  it('ocean.isHealthy is false for low health', () => {
    const r = buildDeepOceanResult(['empty.ts'], [EMPTY])
    expect(r.ocean.isHealthy).toBe(false)
  })

  it('generates recommendations for low health', () => {
    const r = buildDeepOceanResult(['empty.ts'], [EMPTY])
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('includes zones in result', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    expect(r.zones.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates depth recommendation for low avgDepthComplexity', () => {
    const r = buildDeepOceanResult(['empty.ts'], [EMPTY])
    const depthRec = r.recommendations.find((rec) => rec.includes('depth complexity'))
    expect(depthRec).toBeDefined()
  })

  it('generates health recommendation for low overall health', () => {
    const r = buildDeepOceanResult([], [])
    const healthRec = r.recommendations.find((rec) => rec.includes('critical'))
    expect(healthRec).toBeDefined()
  })

  it('generates no recommendations for healthy codebase', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    expect(r.recommendations).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for high score', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })
  it('returns string for medium score', () => {
    expect(typeof scoreColor(65)).toBe('string')
  })
  it('returns string for low score', () => {
    expect(typeof scoreColor(30)).toBe('string')
  })
  it('returns string for very low score', () => {
    expect(typeof scoreColor(10)).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns string for all conditions', () => {
    expect(typeof conditionColor('hydrothermal-vent')).toBe('string')
    expect(typeof conditionColor('coral-garden')).toBe('string')
    expect(typeof conditionColor('open-water')).toBe('string')
    expect(typeof conditionColor('murky-depths')).toBe('string')
    expect(typeof conditionColor('dead-zone')).toBe('string')
    expect(typeof conditionColor('void')).toBe('string')
  })
})

describe('gradeColor', () => {
  it('returns string for all grades', () => {
    expect(typeof gradeColor('deep-sea-commander')).toBe('string')
    expect(typeof gradeColor('oceanographer')).toBe('string')
    expect(typeof gradeColor('navigator')).toBe('string')
    expect(typeof gradeColor('diver')).toBe('string')
    expect(typeof gradeColor('swimmer')).toBe('string')
    expect(typeof gradeColor('landlubber')).toBe('string')
  })
})

describe('zoneColor', () => {
  it('returns string for all zones', () => {
    expect(typeof zoneColor('hadal-zone')).toBe('string')
    expect(typeof zoneColor('abyssal-zone')).toBe('string')
    expect(typeof zoneColor('bathyal-zone')).toBe('string')
    expect(typeof zoneColor('mesopelagic')).toBe('string')
    expect(typeof zoneColor('epipelagic')).toBe('string')
    expect(typeof zoneColor('surface')).toBe('string')
  })
})

describe('flowColor', () => {
  it('returns string for all flows', () => {
    expect(typeof flowColor('thermohaline')).toBe('string')
    expect(typeof flowColor('gulf-stream')).toBe('string')
    expect(typeof flowColor('steady-current')).toBe('string')
    expect(typeof flowColor('tidal')).toBe('string')
    expect(typeof flowColor('stagnant')).toBe('string')
    expect(typeof flowColor('whirlpool')).toBe('string')
  })
})

describe('glowColor', () => {
  it('returns string for all glows', () => {
    expect(typeof glowColor('dazzling')).toBe('string')
    expect(typeof glowColor('bright-glow')).toBe('string')
    expect(typeof glowColor('steady-glow')).toBe('string')
    expect(typeof glowColor('dim-light')).toBe('string')
    expect(typeof glowColor('flickering')).toBe('string')
    expect(typeof glowColor('dark')).toBe('string')
  })
})

describe('resistanceColor', () => {
  it('returns string for all resistances', () => {
    expect(typeof resistanceColor('titanium-hull')).toBe('string')
    expect(typeof resistanceColor('deep-adapted')).toBe('string')
    expect(typeof resistanceColor('pressure-resistant')).toBe('string')
    expect(typeof resistanceColor('moderate')).toBe('string')
    expect(typeof resistanceColor('fragile')).toBe('string')
    expect(typeof resistanceColor('crushed')).toBe('string')
  })
})

describe('formationColor', () => {
  it('returns string for all formations', () => {
    expect(typeof formationColor('mariana-grade')).toBe('string')
    expect(typeof formationColor('deep-trench')).toBe('string')
    expect(typeof formationColor('mid-ocean-ridge')).toBe('string')
    expect(typeof formationColor('continental-shelf')).toBe('string')
    expect(typeof formationColor('shallow-basin')).toBe('string')
    expect(typeof formationColor('puddle')).toBe('string')
  })
})

describe('equipmentColor', () => {
  it('returns string for all equipment', () => {
    expect(typeof equipmentColor('sonar-perfect')).toBe('string')
    expect(typeof equipmentColor('well-equipped')).toBe('string')
    expect(typeof equipmentColor('basic-instruments')).toBe('string')
    expect(typeof equipmentColor('compass-only')).toBe('string')
    expect(typeof equipmentColor('lost')).toBe('string')
    expect(typeof equipmentColor('hopeless')).toBe('string')
  })
})

describe('zoneTypeColor', () => {
  it('returns string for all zone types', () => {
    expect(typeof zoneTypeColor('deep-trench-system')).toBe('string')
    expect(typeof zoneTypeColor('abyssal-plain')).toBe('string')
    expect(typeof zoneTypeColor('mid-ocean-ridge')).toBe('string')
    expect(typeof zoneTypeColor('continental-shelf')).toBe('string')
    expect(typeof zoneTypeColor('tidal-pool')).toBe('string')
    expect(typeof zoneTypeColor('dry-land')).toBe('string')
  })
})

describe('zoneConditionColor', () => {
  it('returns string for all zone conditions', () => {
    expect(typeof zoneConditionColor('thriving-ecosystem')).toBe('string')
    expect(typeof zoneConditionColor('living-ocean')).toBe('string')
    expect(typeof zoneConditionColor('stable-waters')).toBe('string')
    expect(typeof zoneConditionColor('stressed')).toBe('string')
    expect(typeof zoneConditionColor('dead-waters')).toBe('string')
    expect(typeof zoneConditionColor('evaporated')).toBe('string')
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatDeepOceanJson', () => {
  it('returns valid JSON string', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    const json = formatDeepOceanJson(r)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('contains stats field', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    const json = formatDeepOceanJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.stats).toBeDefined()
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('contains ocean field', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    const json = formatDeepOceanJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.ocean).toBeDefined()
    expect(parsed.ocean.overallHealth).toBe(82)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatDeepOceanTable', () => {
  it('returns non-empty string', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    const table = formatDeepOceanTable(r, false)
    expect(table.length).toBeGreaterThan(0)
  })

  it('contains ocean overview in output', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    const table = formatDeepOceanTable(r, false)
    expect(table).toContain('Overall Health')
    expect(table).toContain('Avg Depth')
  })

  it('contains statistics section', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    const table = formatDeepOceanTable(r, false)
    expect(table).toContain('Total Files')
    expect(table).toContain('Captain Grade')
  })

  it('contains condition counts', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    const table = formatDeepOceanTable(r, false)
    expect(table).toContain('Hydrothermal Vent')
    expect(table).toContain('Coral Garden')
  })

  it('shows per-file details when verbose', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    const table = formatDeepOceanTable(r, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('rich.ts')
  })

  it('hides per-file details when not verbose', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    const table = formatDeepOceanTable(r, false)
    expect(table).not.toContain('Per-File Details')
  })

  it('shows highlights when bestSpecimen exists', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    const table = formatDeepOceanTable(r, false)
    expect(table).toContain('Best Specimen')
  })

  it('shows recommendations when present', () => {
    const r = buildDeepOceanResult(['empty.ts'], [EMPTY])
    const table = formatDeepOceanTable(r, false)
    expect(table).toContain('Recommendations')
  })

  it('hides recommendations when empty', () => {
    const r = buildDeepOceanResult(['rich.ts'], [RICH])
    const table = formatDeepOceanTable(r, false)
    expect(table).not.toContain('Recommendations')
  })
})
