import { describe, expect, it } from 'vitest'

import {
  measureEmission,
  measurePattern,
  measureEnergy,
  measureColor,
  measureMovement,
  measureIllumination,
  analyzeCurtainRay,
  analyzeCurtainDisplay,
  classifyCondition,
  classifyDisplayType,
  classifyDisplayCondition,
  classifyAuroraGrade,
  generateRecommendations,
  buildAuroraCurtainResult,
} from '../src/commands/aurora-curtain-helpers.js'

import {
  formatAuroraCurtainJson,
  formatAuroraCurtainTable,
  scoreColor,
  conditionColor,
  gradeColor,
  brightnessColor,
} from '../src/commands/aurora-curtain-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `export interface Item {
  name: string
  value: number
}

export type ItemMap = Record<string, Item>

export enum Status {
  Active = 'active',
  Inactive = 'inactive',
}

export class Container<T> {
  private items: T[] = []
  protected backup: T[] = []

  add(item: T): void {
    this.items.push(item)
  }

  remove(index: number): T {
    return this.items.splice(index, 1)[0]
  }
}

export function processItems(items: Item[]): ItemMap {
  const result: ItemMap = {}
  for (const item of items) {
    result[item.name] = item
  }
  return result
}

export const createItem = (name: string, value: number): Item => ({ name, value })

export async function fetchItems(): Promise<Item[]> {
  try {
    const data = await Promise.resolve([{ name: 'test', value: 1 }])
    return data
  } catch {
    console.error('Failed')
    return []
  }
}

export { Container, processItems }

/**
 * Documentation block
 */
export function documented(): void {
  if (true) {
    if (true) {
      if (true) {
        console.error('deep')
      }
    }
  }
}
`

const EMPTY = ''

const MEDIUM = `export class Simple {
  getName(): string {
    return 'test'
  }
}

export function helper(): void {
  console.log('debug')
}
`

// ─── Emission Tests ─────────────────────────────────────────────────────────

describe('measureEmission', () => {
  it('RICH: level=91, brightness=brilliant', () => {
    const e = measureEmission(RICH)
    expect(e.level).toBe(91)
    expect(e.brightness).toBe('brilliant')
  })

  it('RICH: hasHighEmission=true, hasProperIntensity=true', () => {
    const e = measureEmission(RICH)
    expect(e.hasHighEmission).toBe(true)
    expect(e.hasProperIntensity).toBe(true)
  })

  it('RICH: hasNoDimSpots=true, hasNoFlickering=true', () => {
    const e = measureEmission(RICH)
    expect(e.hasNoDimSpots).toBe(true)
    expect(e.hasNoFlickering).toBe(true)
  })

  it('RICH: hasProperSpectrum=false (console), hasNoBlackout=false (deepNested)', () => {
    const e = measureEmission(RICH)
    expect(e.hasProperSpectrum).toBe(false)
    expect(e.hasNoBlackout).toBe(false)
  })

  it('RICH: hasRadiant=true, dimSpotCount=0, blackoutCount=2', () => {
    const e = measureEmission(RICH)
    expect(e.hasRadiant).toBe(true)
    expect(e.dimSpotCount).toBe(0)
    expect(e.blackoutCount).toBe(2)
  })

  it('EMPTY: level=38, brightness=faint', () => {
    const e = measureEmission(EMPTY)
    expect(e.level).toBe(38)
    expect(e.brightness).toBe('faint')
  })

  it('EMPTY: all structure flags false', () => {
    const e = measureEmission(EMPTY)
    expect(e.hasHighEmission).toBe(false)
    expect(e.hasConsistentOutput).toBe(false)
    expect(e.hasRadiant).toBe(false)
  })

  it('MEDIUM: level=64', () => {
    const e = measureEmission(MEDIUM)
    expect(e.level).toBe(64)
  })
})

// ─── Pattern Tests ──────────────────────────────────────────────────────────

describe('measurePattern', () => {
  it('RICH: quality=88, type=band', () => {
    const p = measurePattern(RICH)
    expect(p.quality).toBe(88)
    expect(p.type).toBe('band')
  })

  it('RICH: hasBeautifulPattern=true, hasCoherentForm=true', () => {
    const p = measurePattern(RICH)
    expect(p.hasBeautifulPattern).toBe(true)
    expect(p.hasCoherentForm).toBe(true)
  })

  it('RICH: hasNoBreakup=false, breakupCount=2', () => {
    const p = measurePattern(RICH)
    expect(p.hasNoBreakup).toBe(false)
    expect(p.breakupCount).toBe(2)
  })

  it('RICH: hasNoFragmentation=false, fragmentationCount=2', () => {
    const p = measurePattern(RICH)
    expect(p.hasNoFragmentation).toBe(false)
    expect(p.fragmentationCount).toBe(2)
  })

  it('EMPTY: quality=37, type=patchy', () => {
    const p = measurePattern(EMPTY)
    expect(p.quality).toBe(37)
    expect(p.type).toBe('patchy')
  })

  it('MEDIUM: quality=65', () => {
    const p = measurePattern(MEDIUM)
    expect(p.quality).toBe(65)
  })
})

// ─── Energy Tests ───────────────────────────────────────────────────────────

describe('measureEnergy', () => {
  it('RICH: transformation=88, source=magnetosphere', () => {
    const e = measureEnergy(RICH)
    expect(e.transformation).toBe(88)
    expect(e.source).toBe('magnetosphere')
  })

  it('RICH: hasHighEfficiency=true, hasNoWaste=true', () => {
    const e = measureEnergy(RICH)
    expect(e.hasHighEfficiency).toBe(true)
    expect(e.hasNoWaste).toBe(true)
  })

  it('RICH: hasNoLeakage=false, leakageCount=2', () => {
    const e = measureEnergy(RICH)
    expect(e.hasNoLeakage).toBe(false)
    expect(e.leakageCount).toBe(2)
  })

  it('RICH: hasProperTransfer=true, hasEfficientCoupling=true', () => {
    const e = measureEnergy(RICH)
    expect(e.hasProperTransfer).toBe(true)
    expect(e.hasEfficientCoupling).toBe(true)
  })

  it('EMPTY: transformation=35, source=static', () => {
    const e = measureEnergy(EMPTY)
    expect(e.transformation).toBe(35)
    expect(e.source).toBe('static')
  })

  it('MEDIUM: transformation=58', () => {
    const e = measureEnergy(MEDIUM)
    expect(e.transformation).toBe(58)
  })
})

// ─── Color Tests ────────────────────────────────────────────────────────────

describe('measureColor', () => {
  it('RICH: dynamics=87, palette=full-spectrum', () => {
    const c = measureColor(RICH)
    expect(c.dynamics).toBe(87)
    expect(c.palette).toBe('full-spectrum')
  })

  it('RICH: hasRichColors=true, all phases true', () => {
    const c = measureColor(RICH)
    expect(c.hasRichColors).toBe(true)
    expect(c.hasGreenPhase).toBe(true)
    expect(c.hasBluePhase).toBe(true)
    expect(c.hasRedPhase).toBe(true)
    expect(c.hasPurplePhase).toBe(true)
  })

  it('RICH: hasNoColorBlindness=true, hasNoFading=true', () => {
    const c = measureColor(RICH)
    expect(c.hasNoColorBlindness).toBe(true)
    expect(c.hasNoFading).toBe(true)
  })

  it('RICH: hasNoStaticDisplay=false, staticCount=4', () => {
    const c = measureColor(RICH)
    expect(c.hasNoStaticDisplay).toBe(false)
    expect(c.staticCount).toBe(4)
  })

  it('EMPTY: dynamics=46, palette=monochrome', () => {
    const c = measureColor(EMPTY)
    expect(c.dynamics).toBe(46)
    expect(c.palette).toBe('monochrome')
  })

  it('MEDIUM: dynamics=63', () => {
    const c = measureColor(MEDIUM)
    expect(c.dynamics).toBe(63)
  })
})

// ─── Movement Tests ─────────────────────────────────────────────────────────

describe('measureMovement', () => {
  it('RICH: quality=88, style=dancing', () => {
    const m = measureMovement(RICH)
    expect(m.quality).toBe(88)
    expect(m.style).toBe('dancing')
  })

  it('RICH: hasGracefulMovement=true, hasProperRhythm=true', () => {
    const m = measureMovement(RICH)
    expect(m.hasGracefulMovement).toBe(true)
    expect(m.hasProperRhythm).toBe(true)
  })

  it('RICH: hasNoStuttering=true, hasDynamic=true', () => {
    const m = measureMovement(RICH)
    expect(m.hasNoStuttering).toBe(true)
    expect(m.hasDynamic).toBe(true)
  })

  it('RICH: hasFluidMotion=false (console), hasNoJerking=false', () => {
    const m = measureMovement(RICH)
    expect(m.hasFluidMotion).toBe(false)
    expect(m.hasNoJerking).toBe(false)
  })

  it('RICH: stutteringCount=0, stallingCount=2', () => {
    const m = measureMovement(RICH)
    expect(m.stutteringCount).toBe(0)
    expect(m.stallingCount).toBe(2)
  })

  it('EMPTY: quality=30, style=frozen', () => {
    const m = measureMovement(EMPTY)
    expect(m.quality).toBe(30)
    expect(m.style).toBe('frozen')
  })

  it('MEDIUM: quality=55', () => {
    const m = measureMovement(MEDIUM)
    expect(m.quality).toBe(55)
  })
})

// ─── Illumination Tests ─────────────────────────────────────────────────────

describe('measureIllumination', () => {
  it('RICH: power=90, reach=local', () => {
    const i = measureIllumination(RICH)
    expect(i.power).toBe(90)
    expect(i.reach).toBe('local')
  })

  it('RICH: hasHighIllumination=true, hasProperFocusing=true', () => {
    const i = measureIllumination(RICH)
    expect(i.hasHighIllumination).toBe(true)
    expect(i.hasProperFocusing).toBe(true)
  })

  it('RICH: hasAtmospheric=true, hasLastingImpression=true', () => {
    const i = measureIllumination(RICH)
    expect(i.hasAtmospheric).toBe(true)
    expect(i.hasLastingImpression).toBe(true)
  })

  it('RICH: hasDeepPenetration=false (no reExport from)', () => {
    const i = measureIllumination(RICH)
    expect(i.hasDeepPenetration).toBe(false)
  })

  it('EMPTY: power=30, reach=dark', () => {
    const i = measureIllumination(EMPTY)
    expect(i.power).toBe(30)
    expect(i.reach).toBe('dark')
  })

  it('MEDIUM: power=52', () => {
    const i = measureIllumination(MEDIUM)
    expect(i.power).toBe(52)
  })
})

// ─── Ray Analysis Tests ─────────────────────────────────────────────────────

describe('analyzeCurtainRay', () => {
  it('RICH: qualityScore=89, condition=northern-lights', () => {
    const r = analyzeCurtainRay(RICH, 'rich.ts')
    expect(r.qualityScore).toBe(89)
    expect(r.condition).toBe('northern-lights')
  })

  it('RICH: all six scores', () => {
    const r = analyzeCurtainRay(RICH, 'rich.ts')
    expect(r.lightEmission).toBe(91)
    expect(r.curtainPattern).toBe(88)
    expect(r.energyTransformation).toBe(88)
    expect(r.colorDynamics).toBe(87)
    expect(r.movementQuality).toBe(88)
    expect(r.illuminationPower).toBe(90)
  })

  it('EMPTY: qualityScore=36, condition=quiet-arc', () => {
    const r = analyzeCurtainRay(EMPTY, 'empty.ts')
    expect(r.qualityScore).toBe(36)
    expect(r.condition).toBe('quiet-arc')
  })

  it('MEDIUM: qualityScore=59, condition=substorm-peak', () => {
    const r = analyzeCurtainRay(MEDIUM, 'medium.ts')
    expect(r.qualityScore).toBe(59)
    expect(r.condition).toBe('substorm-peak')
  })
})

// ─── Condition Classification Tests ─────────────────────────────────────────

describe('classifyCondition', () => {
  it('northern-lights for score >= 80', () => {
    const r = analyzeCurtainRay(RICH, 'test.ts')
    expect(classifyCondition(r)).toBe('northern-lights')
  })

  it('aurora-australis for score 65-79', () => {
    expect(classifyCondition({ qualityScore: 70 } as any)).toBe('aurora-australis')
  })

  it('substorm-peak for score 50-64', () => {
    expect(classifyCondition({ qualityScore: 55 } as any)).toBe('substorm-peak')
  })

  it('quiet-arc for score 35-49', () => {
    expect(classifyCondition({ qualityScore: 40 } as any)).toBe('quiet-arc')
  })

  it('clouded-over for score 20-34', () => {
    expect(classifyCondition({ qualityScore: 25 } as any)).toBe('clouded-over')
  })

  it('light-pollution for score < 20', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('light-pollution')
  })
})

// ─── Display Classification Tests ───────────────────────────────────────────

describe('classifyDisplayType', () => {
  it('grand-display for avg >= 75 with 30% northern-lights', () => {
    const rays = [analyzeCurtainRay(RICH, 'a.ts')]
    expect(classifyDisplayType(rays)).toBe('grand-display')
  })

  it('overcast for empty array', () => {
    expect(classifyDisplayType([])).toBe('overcast')
  })
})

describe('classifyDisplayCondition', () => {
  it('observatory for avg >= 80', () => {
    expect(classifyDisplayCondition(85)).toBe('observatory')
  })

  it('aurora-station for avg 65-79', () => {
    expect(classifyDisplayCondition(70)).toBe('aurora-station')
  })

  it('dark-sky for avg 50-64', () => {
    expect(classifyDisplayCondition(55)).toBe('dark-sky')
  })

  it('suburban for avg 35-49', () => {
    expect(classifyDisplayCondition(40)).toBe('suburban')
  })

  it('urban for avg 20-34', () => {
    expect(classifyDisplayCondition(25)).toBe('urban')
  })

  it('daylight for avg < 20', () => {
    expect(classifyDisplayCondition(10)).toBe('daylight')
  })
})

describe('classifyAuroraGrade', () => {
  it('chief-aurora-hunter for >= 80', () => {
    expect(classifyAuroraGrade(85)).toBe('chief-aurora-hunter')
  })

  it('aurora-photographer for 65-79', () => {
    expect(classifyAuroraGrade(70)).toBe('aurora-photographer')
  })

  it('sky-watcher for 50-64', () => {
    expect(classifyAuroraGrade(55)).toBe('sky-watcher')
  })

  it('stargazer for 35-49', () => {
    expect(classifyAuroraGrade(40)).toBe('stargazer')
  })

  it('cloud-gazer for 20-34', () => {
    expect(classifyAuroraGrade(25)).toBe('cloud-gazer')
  })

  it('cave-dweller for < 20', () => {
    expect(classifyAuroraGrade(10)).toBe('cave-dweller')
  })
})

// ─── Display Analysis Tests ─────────────────────────────────────────────────

describe('analyzeCurtainDisplay', () => {
  it('returns overcast display for empty rays', () => {
    const d = analyzeCurtainDisplay([], 'testdir')
    expect(d.displayType).toBe('overcast')
    expect(d.condition).toBe('daylight')
    expect(d.avgEmission).toBe(0)
  })

  it('RICH single: grand-display, observatory', () => {
    const rays = [analyzeCurtainRay(RICH, 'a.ts')]
    const d = analyzeCurtainDisplay(rays, '.')
    expect(d.displayType).toBe('grand-display')
    expect(d.condition).toBe('observatory')
    expect(d.northernLightsCount).toBe(1)
  })
})

// ─── Build Result Tests ─────────────────────────────────────────────────────

describe('buildAuroraCurtainResult', () => {
  it('RICH single: isBreathtaking=true, overallRadiance=89', () => {
    const r = buildAuroraCurtainResult(['rich.ts'], [RICH])
    expect(r.atmosphere.isBreathtaking).toBe(true)
    expect(r.atmosphere.overallRadiance).toBe(89)
    expect(r.atmosphere.avgEmission).toBe(91)
  })

  it('RICH single: auroraGrade=chief-aurora-hunter', () => {
    const r = buildAuroraCurtainResult(['rich.ts'], [RICH])
    expect(r.stats.auroraGrade).toBe('chief-aurora-hunter')
  })

  it('RICH single: stats have correct counts', () => {
    const r = buildAuroraCurtainResult(['rich.ts'], [RICH])
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.totalDisplays).toBe(1)
    expect(r.stats.northernLightsCount).toBe(1)
    expect(r.stats.hasHighEmissionCount).toBe(1)
    expect(r.stats.hasGracefulMovementCount).toBe(1)
  })

  it('RICH single: bestRay, brightest, etc all = rich.ts', () => {
    const r = buildAuroraCurtainResult(['rich.ts'], [RICH])
    expect(r.stats.bestRay).toBe('rich.ts')
    expect(r.stats.brightest).toBe('rich.ts')
    expect(r.stats.bestPattern).toBe('rich.ts')
    expect(r.stats.mostEfficient).toBe('rich.ts')
    expect(r.stats.mostColorful).toBe('rich.ts')
    expect(r.stats.mostGraceful).toBe('rich.ts')
  })

  it('empty: all zeros, cave-dweller', () => {
    const r = buildAuroraCurtainResult([], [])
    expect(r.rays).toHaveLength(0)
    expect(r.displays).toHaveLength(0)
    expect(r.atmosphere.overallRadiance).toBe(0)
    expect(r.atmosphere.isBreathtaking).toBe(false)
    expect(r.stats.auroraGrade).toBe('cave-dweller')
  })

  it('empty: 7 recommendations', () => {
    const r = buildAuroraCurtainResult([], [])
    expect(r.recommendations).toHaveLength(7)
  })

  it('mixed: overallRadiance=61, isBreathtaking=false', () => {
    const r = buildAuroraCurtainResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(r.atmosphere.overallRadiance).toBe(61)
    expect(r.atmosphere.isBreathtaking).toBe(false)
  })

  it('mixed: correct avg scores', () => {
    const r = buildAuroraCurtainResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(r.stats.avgLightEmission).toBe(64)
    expect(r.stats.avgCurtainPattern).toBe(63)
    expect(r.stats.avgEnergyTransformation).toBe(60)
    expect(r.stats.avgColorDynamics).toBe(65)
    expect(r.stats.avgMovementQuality).toBe(58)
    expect(r.stats.avgIlluminationPower).toBe(57)
  })

  it('mixed: condition counts', () => {
    const r = buildAuroraCurtainResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(r.stats.northernLightsCount).toBe(1)
    expect(r.stats.substormPeakCount).toBe(1)
    expect(r.stats.quietArcCount).toBe(1)
    expect(r.stats.lightPollutionCount).toBe(0)
  })

  it('mixed: auroraGrade=sky-watcher', () => {
    const r = buildAuroraCurtainResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(r.stats.auroraGrade).toBe('sky-watcher')
  })

  it('mixed: display=coronal-ejection, dark-sky', () => {
    const r = buildAuroraCurtainResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(r.displays[0].displayType).toBe('coronal-ejection')
    expect(r.displays[0].condition).toBe('dark-sky')
  })

  it('mixed: breathtaking recommendation', () => {
    const r = buildAuroraCurtainResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(r.recommendations).toHaveLength(1)
    expect(r.recommendations[0]).toContain('Breathtaking aurora')
  })
})

// ─── Recommendations Tests ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('RICH single: breathtaking recommendation', () => {
    const r = buildAuroraCurtainResult(['rich.ts'], [RICH])
    expect(r.recommendations).toHaveLength(1)
    expect(r.recommendations[0]).toContain('Breathtaking aurora')
  })

  it('empty: all improvement recommendations', () => {
    const r = buildAuroraCurtainResult([], [])
    expect(r.recommendations.some((rec) => rec.includes('emission'))).toBe(true)
    expect(r.recommendations.some((rec) => rec.includes('pattern'))).toBe(true)
    expect(r.recommendations.some((rec) => rec.includes('energy'))).toBe(true)
  })
})

// ─── Format Helpers Tests ───────────────────────────────────────────────────

describe('formatAuroraCurtainJson', () => {
  it('returns valid JSON string', () => {
    const r = buildAuroraCurtainResult(['rich.ts'], [RICH])
    const json = formatAuroraCurtainJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.rays).toHaveLength(1)
    expect(parsed.stats.auroraGrade).toBe('chief-aurora-hunter')
  })
})

describe('formatAuroraCurtainTable', () => {
  it('returns string with Aurora Curtain header', () => {
    const r = buildAuroraCurtainResult(['rich.ts'], [RICH])
    const table = formatAuroraCurtainTable(r, false)
    expect(table).toContain('Aurora Curtain')
    expect(table).toContain('Overall Radiance')
  })

  it('verbose mode includes per-file details', () => {
    const r = buildAuroraCurtainResult(['rich.ts'], [RICH])
    const table = formatAuroraCurtainTable(r, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('rich.ts')
  })

  it('includes recommendations when present', () => {
    const r = buildAuroraCurtainResult([], [])
    const table = formatAuroraCurtainTable(r, false)
    expect(table).toContain('Recommendations')
  })
})

describe('scoreColor', () => {
  it('returns string for high score', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('returns string for medium score', () => {
    expect(typeof scoreColor(60)).toBe('string')
  })

  it('returns string for low score', () => {
    expect(typeof scoreColor(30)).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns colored string for each condition', () => {
    const conditions = ['northern-lights', 'aurora-australis', 'substorm-peak', 'quiet-arc', 'clouded-over', 'light-pollution']
    for (const cond of conditions) {
      expect(typeof conditionColor(cond)).toBe('string')
    }
  })

  it('returns plain string for unknown condition', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

describe('gradeColor', () => {
  it('returns colored string for each grade', () => {
    const grades = ['chief-aurora-hunter', 'aurora-photographer', 'sky-watcher', 'stargazer', 'cloud-gazer', 'cave-dweller']
    for (const grade of grades) {
      expect(typeof gradeColor(grade)).toBe('string')
    }
  })
})

describe('brightnessColor', () => {
  it('returns colored string for each brightness', () => {
    const levels = ['dazzling', 'brilliant', 'bright', 'visible', 'faint', 'invisible']
    for (const b of levels) {
      expect(typeof brightnessColor(b)).toBe('string')
    }
  })

  it('returns plain string for unknown brightness', () => {
    expect(brightnessColor('unknown')).toBe('unknown')
  })
})
