import { describe, expect, it } from 'vitest'

import {
  analyzeHearthCircle,
  analyzeHearthEmber,
  buildEmberHearthResult,
  classifyCircleCondition,
  classifyCircleType,
  classifyCondition,
  classifyKeeperGrade,
  generateRecommendations,
  measureAsh,
  measureComfort,
  measureFuel,
  measurePersistence,
  measureSmoke,
  measureWarmth,
} from '../src/commands/ember-hearth-helpers.js'

import {
  ashColor,
  circleColor,
  comfortColor,
  conditionColor,
  fuelColor,
  glowColor,
  gradeColor,
  persistenceColor,
  scoreColor,
  smokeColor,
  formatEmberHearthJson,
  formatEmberHearthTable,
} from '../src/commands/ember-hearth-format-helpers.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const RICH_CONTENT = `
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
export { Foo } from './foo'
// TODO: fix later
`

const EMPTY_CONTENT = ''

const MEDIUM_CONTENT = 'const x = 1\n'

// ─── measureWarmth ──────────────────────────────────────────────────────────

describe('measureWarmth', () => {
  it('returns high warmth for rich content', () => {
    const result = measureWarmth(RICH_CONTENT)
    expect(result.level).toBe(92)
    expect(result.glow).toBe('warm')
    expect(result.hasHighWarmth).toBe(true)
    expect(result.hasWelcoming).toBe(true)
    expect(result.hasNoHostility).toBe(true)
    expect(result.hasGentleCurve).toBe(true)
    expect(result.hasNoSharpEdges).toBe(false)
    expect(result.hasComfortable).toBe(true)
    expect(result.hasNoIntimidation).toBe(true)
    expect(result.hasApproachable).toBe(true)
    expect(result.hostilityCount).toBe(0)
    expect(result.barrierCount).toBe(1)
  })

  it('returns low warmth for empty content', () => {
    const result = measureWarmth(EMPTY_CONTENT)
    expect(result.level).toBe(38)
    expect(result.glow).toBe('cool')
    expect(result.hasHighWarmth).toBe(false)
    expect(result.hasNoHostility).toBe(true)
    expect(result.hasNoBarrier).toBe(true)
  })

  it('returns cool for medium content', () => {
    const result = measureWarmth(MEDIUM_CONTENT)
    expect(result.level).toBe(38)
    expect(result.glow).toBe('cool')
  })
})

// ─── measurePersistence ─────────────────────────────────────────────────────

describe('measurePersistence', () => {
  it('returns high persistence for rich content', () => {
    const result = measurePersistence(RICH_CONTENT)
    expect(result.level).toBe(95)
    expect(result.state).toBe('smoldering')
    expect(result.hasHighPersistence).toBe(true)
    expect(result.hasLongBurn).toBe(true)
    expect(result.hasConsistent).toBe(true)
    expect(result.hasNoSuffocation).toBe(true)
    expect(result.hasSteadyGlow).toBe(true)
    expect(result.hasProperVentilation).toBe(true)
    expect(result.hasNoBackdraft).toBe(true)
    expect(result.flameoutCount).toBe(1)
    expect(result.backdraftCount).toBe(0)
  })

  it('returns low persistence for empty content', () => {
    const result = measurePersistence(EMPTY_CONTENT)
    expect(result.level).toBe(30)
    expect(result.state).toBe('extinguished')
    expect(result.hasHighPersistence).toBe(false)
  })

  it('returns extinguished for medium content', () => {
    const result = measurePersistence(MEDIUM_CONTENT)
    expect(result.level).toBe(30)
    expect(result.state).toBe('extinguished')
  })
})

// ─── measureFuel ────────────────────────────────────────────────────────────

describe('measureFuel', () => {
  it('returns high quality for rich content', () => {
    const result = measureFuel(RICH_CONTENT)
    expect(result.quality).toBe(90)
    expect(result.type).toBe('charcoal')
    expect(result.hasHighEfficiency).toBe(true)
    expect(result.hasCleanBurn).toBe(true)
    expect(result.hasNoSmoke).toBe(true)
    expect(result.hasProperCombustion).toBe(true)
    expect(result.hasHighEnergy).toBe(true)
    expect(result.hasNoSparks).toBe(true)
    expect(result.hasSustained).toBe(true)
    expect(result.wasteCount).toBe(1)
    expect(result.sparkCount).toBe(0)
  })

  it('returns low quality for empty content', () => {
    const result = measureFuel(EMPTY_CONTENT)
    expect(result.quality).toBe(40)
    expect(result.type).toBe('dung')
    expect(result.hasHighEfficiency).toBe(false)
  })

  it('returns dung for medium content', () => {
    const result = measureFuel(MEDIUM_CONTENT)
    expect(result.quality).toBe(40)
    expect(result.type).toBe('dung')
  })
})

// ─── measureSmoke ───────────────────────────────────────────────────────────

describe('measureSmoke', () => {
  it('returns high quality for rich content', () => {
    const result = measureSmoke(RICH_CONTENT)
    expect(result.quality).toBe(95)
    expect(result.clarity).toBe('clear')
    expect(result.hasClearOutput).toBe(true)
    expect(result.hasNoNoise).toBe(true)
    expect(result.hasInformative).toBe(true)
    expect(result.hasNoPollution).toBe(true)
    expect(result.hasProperDrift).toBe(true)
    expect(result.hasNoObstruction).toBe(true)
    expect(result.hasVisible).toBe(true)
    expect(result.hasNoIrritation).toBe(true)
    expect(result.hasProperChimney).toBe(true)
    expect(result.noiseCount).toBe(0)
    expect(result.pollutionCount).toBe(0)
  })

  it('returns low quality for empty content', () => {
    const result = measureSmoke(EMPTY_CONTENT)
    expect(result.quality).toBe(37)
    expect(result.clarity).toBe('toxic')
    expect(result.hasClearOutput).toBe(false)
  })

  it('returns toxic for medium content', () => {
    const result = measureSmoke(MEDIUM_CONTENT)
    expect(result.quality).toBe(37)
    expect(result.clarity).toBe('toxic')
  })
})

// ─── measureAsh ─────────────────────────────────────────────────────────────

describe('measureAsh', () => {
  it('returns high utility for rich content', () => {
    const result = measureAsh(RICH_CONTENT)
    expect(result.utility).toBe(90)
    expect(result.type).toBe('gray-ash')
    expect(result.hasProperCleanup).toBe(true)
    expect(result.hasProperDisposal).toBe(true)
    expect(result.hasRecyclable).toBe(true)
    expect(result.hasNoContamination).toBe(true)
    expect(result.hasProperMaintenance).toBe(true)
    expect(result.hasNoBlockage).toBe(true)
    expect(result.residueCount).toBe(1)
    expect(result.buildupCount).toBe(1)
  })

  it('returns low utility for empty content', () => {
    const result = measureAsh(EMPTY_CONTENT)
    expect(result.utility).toBe(40)
    expect(result.type).toBe('clinker')
    expect(result.hasProperCleanup).toBe(false)
  })

  it('returns clinker for medium content', () => {
    const result = measureAsh(MEDIUM_CONTENT)
    expect(result.utility).toBe(40)
    expect(result.type).toBe('clinker')
  })
})

// ─── measureComfort ─────────────────────────────────────────────────────────

describe('measureComfort', () => {
  it('returns high comfort for rich content', () => {
    const result = measureComfort(RICH_CONTENT)
    expect(result.score).toBe(90)
    expect(result.level).toBe('adequate')
    expect(result.hasHighComfort).toBe(true)
    expect(result.hasCozy).toBe(true)
    expect(result.hasReliable).toBe(true)
    expect(result.hasPeaceful).toBe(true)
    expect(result.hasNoStress).toBe(true)
    expect(result.hasNourishing).toBe(true)
    expect(result.hasNoFear).toBe(true)
    expect(result.hasProtective).toBe(true)
    expect(result.hasNoDanger).toBe(true)
    expect(result.hasGathering).toBe(true)
    expect(result.anxietyCount).toBe(1)
    expect(result.stressCount).toBe(0)
  })

  it('returns low comfort for empty content', () => {
    const result = measureComfort(EMPTY_CONTENT)
    expect(result.score).toBe(40)
    expect(result.level).toBe('cold')
    expect(result.hasHighComfort).toBe(false)
  })

  it('returns cold for medium content', () => {
    const result = measureComfort(MEDIUM_CONTENT)
    expect(result.score).toBe(40)
    expect(result.level).toBe('cold')
  })
})

// ─── analyzeHearthEmber ─────────────────────────────────────────────────────

describe('analyzeHearthEmber', () => {
  it('returns eternal-flame for rich content', () => {
    const result = analyzeHearthEmber(RICH_CONTENT, 'rich.ts')
    expect(result.emberWarmth).toBe(92)
    expect(result.hearthPersistence).toBe(95)
    expect(result.fuelQuality).toBe(90)
    expect(result.smokeQuality).toBe(95)
    expect(result.ashUtility).toBe(90)
    expect(result.hearthComfort).toBe(90)
    expect(result.qualityScore).toBe(92)
    expect(result.condition).toBe('eternal-flame')
    expect(result.file).toBe('rich.ts')
  })

  it('returns banked-coals for empty content', () => {
    const result = analyzeHearthEmber(EMPTY_CONTENT, 'empty.ts')
    expect(result.emberWarmth).toBe(38)
    expect(result.hearthPersistence).toBe(30)
    expect(result.fuelQuality).toBe(40)
    expect(result.smokeQuality).toBe(37)
    expect(result.ashUtility).toBe(40)
    expect(result.hearthComfort).toBe(40)
    expect(result.qualityScore).toBe(38)
    expect(result.condition).toBe('banked-coals')
  })

  it('returns banked-coals for medium content', () => {
    const result = analyzeHearthEmber(MEDIUM_CONTENT, 'medium.ts')
    expect(result.qualityScore).toBe(38)
    expect(result.condition).toBe('banked-coals')
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies eternal-flame for 80+', () => {
    const e = { qualityScore: 80 } as any
    expect(classifyCondition(e)).toBe('eternal-flame')
  })

  it('classifies roaring-fire for 65-79', () => {
    const e = { qualityScore: 65 } as any
    expect(classifyCondition(e)).toBe('roaring-fire')
  })

  it('classifies steady-hearth for 50-64', () => {
    const e = { qualityScore: 50 } as any
    expect(classifyCondition(e)).toBe('steady-hearth')
  })

  it('classifies banked-coals for 35-49', () => {
    const e = { qualityScore: 35 } as any
    expect(classifyCondition(e)).toBe('banked-coals')
  })

  it('classifies dying-ember for 20-34', () => {
    const e = { qualityScore: 20 } as any
    expect(classifyCondition(e)).toBe('dying-ember')
  })

  it('classifies cold-ash for <20', () => {
    const e = { qualityScore: 10 } as any
    expect(classifyCondition(e)).toBe('cold-ash')
  })
})

// ─── classifyCircleType ─────────────────────────────────────────────────────

describe('classifyCircleType', () => {
  it('returns darkness for empty embers', () => {
    expect(classifyCircleType([])).toBe('darkness')
  })

  it('returns great-hall for high avg with eternal count', () => {
    const embers = Array.from({ length: 5 }, () => ({
      qualityScore: 90, condition: 'eternal-flame',
    }) as any)
    expect(classifyCircleType(embers)).toBe('great-hall')
  })

  it('returns family-hearth for avg >= 60', () => {
    const embers = [{ qualityScore: 60, condition: 'banked-coals' } as any]
    expect(classifyCircleType(embers)).toBe('family-hearth')
  })

  it('returns campfire for avg >= 45', () => {
    const embers = [{ qualityScore: 45, condition: 'banked-coals' } as any]
    expect(classifyCircleType(embers)).toBe('campfire')
  })

  it('returns fire-pit for avg >= 30', () => {
    const embers = [{ qualityScore: 30, condition: 'cold-ash' } as any]
    expect(classifyCircleType(embers)).toBe('fire-pit')
  })

  it('returns candle for avg >= 15', () => {
    const embers = [{ qualityScore: 15, condition: 'cold-ash' } as any]
    expect(classifyCircleType(embers)).toBe('candle')
  })

  it('returns darkness for avg < 15', () => {
    const embers = [{ qualityScore: 5, condition: 'cold-ash' } as any]
    expect(classifyCircleType(embers)).toBe('darkness')
  })
})

// ─── classifyCircleCondition ────────────────────────────────────────────────

describe('classifyCircleCondition', () => {
  it('classifies ancestral-hall for 80+', () => {
    expect(classifyCircleCondition(80)).toBe('ancestral-hall')
  })
  it('classifies warm-home for 65-79', () => {
    expect(classifyCircleCondition(65)).toBe('warm-home')
  })
  it('classifies campsite for 50-64', () => {
    expect(classifyCircleCondition(50)).toBe('campsite')
  })
  it('classifies shelter for 35-49', () => {
    expect(classifyCircleCondition(35)).toBe('shelter')
  })
  it('classifies ruins for 20-34', () => {
    expect(classifyCircleCondition(20)).toBe('ruins')
  })
  it('classifies void for <20', () => {
    expect(classifyCircleCondition(10)).toBe('void')
  })
})

// ─── classifyKeeperGrade ────────────────────────────────────────────────────

describe('classifyKeeperGrade', () => {
  it('returns hearth-master for 80+', () => {
    expect(classifyKeeperGrade(80)).toBe('hearth-master')
  })
  it('returns firekeeper for 65-79', () => {
    expect(classifyKeeperGrade(65)).toBe('firekeeper')
  })
  it('returns stoker for 50-64', () => {
    expect(classifyKeeperGrade(50)).toBe('stoker')
  })
  it('returns tender for 35-49', () => {
    expect(classifyKeeperGrade(35)).toBe('tender')
  })
  it('returns lighter for 20-34', () => {
    expect(classifyKeeperGrade(20)).toBe('lighter')
  })
  it('returns ice-walker for <20', () => {
    expect(classifyKeeperGrade(10)).toBe('ice-walker')
  })
})

// ─── analyzeHearthCircle ────────────────────────────────────────────────────

describe('analyzeHearthCircle', () => {
  it('returns darkness for empty embers', () => {
    const result = analyzeHearthCircle([], 'empty-dir')
    expect(result.directory).toBe('empty-dir')
    expect(result.embers).toEqual([])
    expect(result.avgWarmth).toBe(0)
    expect(result.avgPersistence).toBe(0)
    expect(result.avgComfort).toBe(0)
    expect(result.eternalCount).toBe(0)
    expect(result.coldAshCount).toBe(0)
    expect(result.warmCount).toBe(0)
    expect(result.comfortableCount).toBe(0)
    expect(result.circleType).toBe('darkness')
    expect(result.condition).toBe('void')
  })

  it('analyzes circle with embers', () => {
    const e1 = analyzeHearthEmber(RICH_CONTENT, 'rich.ts')
    const result = analyzeHearthCircle([e1], 'src')
    expect(result.avgWarmth).toBe(92)
    expect(result.avgPersistence).toBe(95)
    expect(result.avgComfort).toBe(90)
    expect(result.eternalCount).toBe(1)
    expect(result.coldAshCount).toBe(0)
    expect(result.warmCount).toBe(1)
    expect(result.comfortableCount).toBe(1)
  })
})

// ─── buildEmberHearthResult ─────────────────────────────────────────────────

describe('buildEmberHearthResult', () => {
  it('returns empty result for no files', () => {
    const result = buildEmberHearthResult([], [])
    expect(result.embers).toEqual([])
    expect(result.circles).toEqual([])
    expect(result.home.overallWarmth).toBe(0)
    expect(result.home.isWarm).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalCircles).toBe(0)
    expect(result.stats.keeperGrade).toBe('ice-walker')
  })

  it('returns correct stats for rich + medium files', () => {
    const result = buildEmberHearthResult(
      ['rich.ts', 'medium.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalCircles).toBe(1)
    expect(result.stats.avgEmberWarmth).toBe(65)
    expect(result.stats.avgHearthPersistence).toBe(63)
    expect(result.stats.avgFuelQuality).toBe(65)
    expect(result.stats.avgSmokeQuality).toBe(66)
    expect(result.stats.avgAshUtility).toBe(65)
    expect(result.stats.avgHearthComfort).toBe(65)
    expect(result.stats.overallWarmth).toBe(65)
    expect(result.stats.keeperGrade).toBe('firekeeper')
    expect(result.stats.eternalFlameCount).toBe(1)
    expect(result.stats.bankedCoalsCount).toBe(1)
    expect(result.stats.bestEmber).toBe('rich.ts')
    expect(result.stats.warmest).toBe('rich.ts')
    expect(result.stats.mostPersistent).toBe('rich.ts')
    expect(result.stats.mostEfficient).toBe('rich.ts')
    expect(result.stats.clearestOutput).toBe('rich.ts')
    expect(result.stats.mostComfortable).toBe('rich.ts')
    expect(result.home.overallWarmth).toBe(65)
    expect(result.home.isWarm).toBe(true)
  })

  it('returns sanctuary recommendation for high scores', () => {
    const result = buildEmberHearthResult(['rich.ts'], [RICH_CONTENT])
    expect(result.recommendations).toContain('Eternal hearth achieved — your code is a warm sanctuary')
  })

  it('computes circles by directory', () => {
    const result = buildEmberHearthResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.circles.length).toBe(2)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends stoking warmth when low', () => {
    const embers = [analyzeHearthEmber(EMPTY_CONTENT, 'empty.ts')]
    const circles: any[] = []
    const home = { avgWarmth: 30, avgPersistence: 50, avgComfort: 50, isWarm: false, overallWarmth: 40 }
    const stats = {
      totalFiles: 1, totalCircles: 0, avgEmberWarmth: 30, avgHearthPersistence: 50,
      avgFuelQuality: 50, avgSmokeQuality: 50, avgAshUtility: 50, avgHearthComfort: 50,
      eternalFlameCount: 0, roaringFireCount: 0, steadyHearthCount: 0,
      bankedCoalsCount: 1, dyingEmberCount: 0, coldAshCount: 0,
      hasHighWarmthCount: 0, hasHighPersistenceCount: 0, hasHighEfficiencyCount: 0,
      hasClearOutputCount: 0, hasProperCleanupCount: 0, hasHighComfortCount: 0,
      overallWarmth: 40, keeperGrade: 'tender' as const,
      bestEmber: 'empty.ts', warmest: 'empty.ts', mostPersistent: 'empty.ts',
      mostEfficient: 'empty.ts', clearestOutput: 'empty.ts', mostComfortable: 'empty.ts',
    }
    const recs = generateRecommendations(embers, circles, home, stats)
    expect(recs).toContain('Stoke the embers — make your code more approachable')
  })

  it('recommends eternal hearth when all scores are high', () => {
    const embers = [analyzeHearthEmber(RICH_CONTENT, 'rich.ts')]
    const result = buildEmberHearthResult(['rich.ts'], [RICH_CONTENT])
    const recs = generateRecommendations(embers, result.circles, result.home, result.stats)
    expect(recs).toContain('Eternal hearth achieved — your code is a warm sanctuary')
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns green for high score', () => {
    expect(scoreColor(90)).toContain('90')
  })
  it('returns yellow for medium score', () => {
    expect(scoreColor(70)).toContain('70')
  })
  it('returns orange for low score', () => {
    expect(scoreColor(45)).toContain('45')
  })
  it('returns red for very low score', () => {
    expect(scoreColor(20)).toContain('20')
  })
})

describe('conditionColor', () => {
  it('colors eternal-flame', () => {
    expect(conditionColor('eternal-flame')).toContain('eternal-flame')
  })
  it('colors cold-ash', () => {
    expect(conditionColor('cold-ash')).toContain('cold-ash')
  })
  it('passes through unknown conditions', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

describe('gradeColor', () => {
  it('colors hearth-master', () => {
    expect(gradeColor('hearth-master')).toContain('hearth-master')
  })
  it('colors ice-walker', () => {
    expect(gradeColor('ice-walker')).toContain('ice-walker')
  })
  it('passes through unknown grades', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })
})

describe('glowColor', () => {
  it('colors radiant', () => {
    expect(glowColor('radiant')).toContain('radiant')
  })
  it('colors cold', () => {
    expect(glowColor('cold')).toContain('cold')
  })
})

describe('persistenceColor', () => {
  it('colors eternal-flame state', () => {
    expect(persistenceColor('eternal-flame')).toContain('eternal-flame')
  })
  it('colors extinguished', () => {
    expect(persistenceColor('extinguished')).toContain('extinguished')
  })
})

describe('fuelColor', () => {
  it('colors hardwood', () => {
    expect(fuelColor('hardwood')).toContain('hardwood')
  })
  it('colors wet-leaves', () => {
    expect(fuelColor('wet-leaves')).toContain('wet-leaves')
  })
})

describe('smokeColor', () => {
  it('colors clear', () => {
    expect(smokeColor('clear')).toContain('clear')
  })
  it('colors choking', () => {
    expect(smokeColor('choking')).toContain('choking')
  })
})

describe('ashColor', () => {
  it('colors useful-ash', () => {
    expect(ashColor('useful-ash')).toContain('useful-ash')
  })
  it('colors toxic-residue', () => {
    expect(ashColor('toxic-residue')).toContain('toxic-residue')
  })
})

describe('comfortColor', () => {
  it('colors sanctuary', () => {
    expect(comfortColor('sanctuary')).toContain('sanctuary')
  })
  it('colors barren', () => {
    expect(comfortColor('barren')).toContain('barren')
  })
})

describe('circleColor', () => {
  it('colors great-hall', () => {
    expect(circleColor('great-hall')).toContain('great-hall')
  })
  it('colors darkness', () => {
    expect(circleColor('darkness')).toContain('darkness')
  })
})

// ─── JSON Formatter ──────────────────────────────────────────────────────────

describe('formatEmberHearthJson', () => {
  it('returns valid JSON', () => {
    const result = buildEmberHearthResult([], [])
    const json = formatEmberHearthJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.embers).toEqual([])
    expect(parsed.home.overallWarmth).toBe(0)
  })
})

// ─── Table Formatter ─────────────────────────────────────────────────────────

describe('formatEmberHearthTable', () => {
  it('includes Ember Hearth Analysis header', () => {
    const result = buildEmberHearthResult([], [])
    const table = formatEmberHearthTable(result, false)
    expect(table).toContain('Ember Hearth Analysis')
  })

  it('includes statistics in table output', () => {
    const result = buildEmberHearthResult(['rich.ts'], [RICH_CONTENT])
    const table = formatEmberHearthTable(result, false)
    expect(table).toContain('Total Files')
    expect(table).toContain('Keeper Grade')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildEmberHearthResult(['rich.ts'], [RICH_CONTENT])
    const table = formatEmberHearthTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('rich.ts')
  })

  it('includes recommendations', () => {
    const result = buildEmberHearthResult(['rich.ts'], [RICH_CONTENT])
    const table = formatEmberHearthTable(result, false)
    expect(table).toContain('Recommendations')
  })
})
