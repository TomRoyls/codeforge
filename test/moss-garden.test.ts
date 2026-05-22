import { describe, expect, it } from 'vitest'

import {
  measureVitality,
  measureRhizoid,
  measureCushion,
  measureSporophyte,
  measureMoisture,
  measureSerenity,
  analyzeMossCushion,
  analyzeMossColony,
  classifyCondition,
  classifyColonyType,
  classifyColonyCondition,
  classifyGardenerGrade,
  generateRecommendations,
  buildMossGardenResult,
} from '../src/commands/moss-garden-helpers.js'

import {
  formatMossGardenJson,
  formatMossGardenTable,
  scoreColor,
  conditionColor,
  gradeColor,
  speciesColor,
} from '../src/commands/moss-garden-format-helpers.js'

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

// ─── Vitality Tests ─────────────────────────────────────────────────────────

describe('measureVitality', () => {
  it('RICH: level=91, species=polytrichum', () => {
    const v = measureVitality(RICH)
    expect(v.level).toBe(91)
    expect(v.species).toBe('polytrichum')
  })

  it('RICH: hasHighVitality=true, hasProperGrowth=true', () => {
    const v = measureVitality(RICH)
    expect(v.hasHighVitality).toBe(true)
    expect(v.hasProperGrowth).toBe(true)
  })

  it('RICH: hasProperColoration=true, hasNoBrowning=true', () => {
    const v = measureVitality(RICH)
    expect(v.hasProperColoration).toBe(true)
    expect(v.hasNoBrowning).toBe(true)
  })

  it('RICH: hasProperHydration=false (console used)', () => {
    const v = measureVitality(RICH)
    expect(v.hasProperHydration).toBe(false)
  })

  it('RICH: hasNoDieback=false (deepNested), browningCount=0, diebackCount=2', () => {
    const v = measureVitality(RICH)
    expect(v.hasNoDieback).toBe(false)
    expect(v.browningCount).toBe(0)
    expect(v.diebackCount).toBe(2)
  })

  it('RICH: hasClonalGrowth=true, hasProperColony=true', () => {
    const v = measureVitality(RICH)
    expect(v.hasClonalGrowth).toBe(true)
    expect(v.hasProperColony).toBe(true)
  })

  it('EMPTY: level=38, species=ceratodon', () => {
    const v = measureVitality(EMPTY)
    expect(v.level).toBe(38)
    expect(v.species).toBe('ceratodon')
  })

  it('EMPTY: all structure flags false', () => {
    const v = measureVitality(EMPTY)
    expect(v.hasHighVitality).toBe(false)
    expect(v.hasProperStructure).toBe(false)
    expect(v.hasProperGrowth).toBe(false)
  })

  it('MEDIUM: level=64, species=ceratodon', () => {
    const v = measureVitality(MEDIUM)
    expect(v.level).toBe(64)
    expect(v.species).toBe('ceratodon')
  })
})

// ─── Rhizoid Tests ──────────────────────────────────────────────────────────

describe('measureRhizoid', () => {
  it('RICH: depth=88, type=extensive', () => {
    const r = measureRhizoid(RICH)
    expect(r.depth).toBe(88)
    expect(r.type).toBe('extensive')
  })

  it('RICH: hasDeepRoots=true, hasNoRootRot=true', () => {
    const r = measureRhizoid(RICH)
    expect(r.hasDeepRoots).toBe(true)
    expect(r.hasNoRootRot).toBe(true)
  })

  it('RICH: hasNoErosion=false, erosionCount=2', () => {
    const r = measureRhizoid(RICH)
    expect(r.hasNoErosion).toBe(false)
    expect(r.erosionCount).toBe(2)
  })

  it('RICH: hasNutrientAbsorption=true, hasCapillaryAction=true', () => {
    const r = measureRhizoid(RICH)
    expect(r.hasNutrientAbsorption).toBe(true)
    expect(r.hasCapillaryAction).toBe(true)
  })

  it('EMPTY: depth=35, type=surface', () => {
    const r = measureRhizoid(EMPTY)
    expect(r.depth).toBe(35)
    expect(r.type).toBe('surface')
  })

  it('MEDIUM: depth=58, type=surface', () => {
    const r = measureRhizoid(MEDIUM)
    expect(r.depth).toBe(58)
    expect(r.type).toBe('surface')
  })
})

// ─── Cushion Tests ──────────────────────────────────────────────────────────

describe('measureCushion', () => {
  it('RICH: density=88, form=mat', () => {
    const c = measureCushion(RICH)
    expect(c.density).toBe(88)
    expect(c.form).toBe('mat')
  })

  it('RICH: hasProperDensity=true, hasNoGap=false, gapCount=2', () => {
    const c = measureCushion(RICH)
    expect(c.hasProperDensity).toBe(true)
    expect(c.hasNoGap).toBe(false)
    expect(c.gapCount).toBe(2)
  })

  it('RICH: hasNoBarePatches=false, barePatchCount=2', () => {
    const c = measureCushion(RICH)
    expect(c.hasNoBarePatches).toBe(false)
    expect(c.barePatchCount).toBe(2)
  })

  it('RICH: hasInterwoven=true, hasProperCompactness=true', () => {
    const c = measureCushion(RICH)
    expect(c.hasInterwoven).toBe(true)
    expect(c.hasProperCompactness).toBe(true)
  })

  it('EMPTY: density=37, form=stringy', () => {
    const c = measureCushion(EMPTY)
    expect(c.density).toBe(37)
    expect(c.form).toBe('stringy')
  })

  it('MEDIUM: density=65, form=stringy', () => {
    const c = measureCushion(MEDIUM)
    expect(c.density).toBe(65)
    expect(c.form).toBe('stringy')
  })
})

// ─── Sporophyte Tests ───────────────────────────────────────────────────────

describe('measureSporophyte', () => {
  it('RICH: maturity=87, stage=mature-capsule', () => {
    const s = measureSporophyte(RICH)
    expect(s.maturity).toBe(87)
    expect(s.stage).toBe('mature-capsule')
  })

  it('RICH: isMature=true, hasProperDevelopment=true', () => {
    const s = measureSporophyte(RICH)
    expect(s.isMature).toBe(true)
    expect(s.hasProperDevelopment).toBe(true)
  })

  it('RICH: hasSporeProduction=false, hasNoAbortion=false, abortionCount=4', () => {
    const s = measureSporophyte(RICH)
    expect(s.hasSporeProduction).toBe(false)
    expect(s.hasNoAbortion).toBe(false)
    expect(s.abortionCount).toBe(4)
  })

  it('RICH: hasGermination=true, hasProperCycle=true', () => {
    const s = measureSporophyte(RICH)
    expect(s.hasGermination).toBe(true)
    expect(s.hasProperCycle).toBe(true)
  })

  it('EMPTY: maturity=46, stage=spore', () => {
    const s = measureSporophyte(EMPTY)
    expect(s.maturity).toBe(46)
    expect(s.stage).toBe('spore')
  })

  it('MEDIUM: maturity=63, stage=spore', () => {
    const s = measureSporophyte(MEDIUM)
    expect(s.maturity).toBe(63)
    expect(s.stage).toBe('spore')
  })
})

// ─── Moisture Tests ─────────────────────────────────────────────────────────

describe('measureMoisture', () => {
  it('RICH: retention=90, state=damp', () => {
    const m = measureMoisture(RICH)
    expect(m.retention).toBe(90)
    expect(m.state).toBe('damp')
  })

  it('RICH: hasProperRetention=true, hasSelfRegulation=true', () => {
    const m = measureMoisture(RICH)
    expect(m.hasProperRetention).toBe(true)
    expect(m.hasSelfRegulation).toBe(true)
  })

  it('RICH: hasNoDesiccation=false, desiccationCount=2', () => {
    const m = measureMoisture(RICH)
    expect(m.hasNoDesiccation).toBe(false)
    expect(m.desiccationCount).toBe(2)
  })

  it('RICH: hasCapillary=true, hasNoRunoff=false', () => {
    const m = measureMoisture(RICH)
    expect(m.hasCapillary).toBe(true)
    expect(m.hasNoRunoff).toBe(false)
  })

  it('EMPTY: retention=30, state=fossilized', () => {
    const m = measureMoisture(EMPTY)
    expect(m.retention).toBe(30)
    expect(m.state).toBe('fossilized')
  })

  it('MEDIUM: retention=52, state=desiccated', () => {
    const m = measureMoisture(MEDIUM)
    expect(m.retention).toBe(52)
    expect(m.state).toBe('desiccated')
  })
})

// ─── Serenity Tests ─────────────────────────────────────────────────────────

describe('measureSerenity', () => {
  it('RICH: score=88, atmosphere=temple-moss', () => {
    const s = measureSerenity(RICH)
    expect(s.score).toBe(88)
    expect(s.atmosphere).toBe('temple-moss')
  })

  it('RICH: hasHighSerenity=true, hasQuietBeauty=true', () => {
    const s = measureSerenity(RICH)
    expect(s.hasHighSerenity).toBe(true)
    expect(s.hasQuietBeauty).toBe(true)
  })

  it('RICH: hasNoChaos=false, hasHarmony=false (console)', () => {
    const s = measureSerenity(RICH)
    expect(s.hasNoChaos).toBe(false)
    expect(s.hasHarmony).toBe(false)
  })

  it('RICH: noiseCount=0, chaosCount=2', () => {
    const s = measureSerenity(RICH)
    expect(s.noiseCount).toBe(0)
    expect(s.chaosCount).toBe(2)
  })

  it('EMPTY: score=30, atmosphere=barren-rock', () => {
    const s = measureSerenity(EMPTY)
    expect(s.score).toBe(30)
    expect(s.atmosphere).toBe('barren-rock')
  })

  it('MEDIUM: score=55, atmosphere=crack-in-sidewalk', () => {
    const s = measureSerenity(MEDIUM)
    expect(s.score).toBe(55)
    expect(s.atmosphere).toBe('crack-in-sidewalk')
  })
})

// ─── Cushion Analysis Tests ─────────────────────────────────────────────────

describe('analyzeMossCushion', () => {
  it('RICH: qualityScore=89, condition=kyoto-garden', () => {
    const c = analyzeMossCushion(RICH, 'rich.ts')
    expect(c.qualityScore).toBe(89)
    expect(c.condition).toBe('kyoto-garden')
  })

  it('RICH: all six measure scores', () => {
    const c = analyzeMossCushion(RICH, 'rich.ts')
    expect(c.growthVitality).toBe(91)
    expect(c.rhizoidDepth).toBe(88)
    expect(c.cushionDensity).toBe(88)
    expect(c.sporophyteMaturity).toBe(87)
    expect(c.moistureRetention).toBe(90)
    expect(c.gardenSerenity).toBe(88)
  })

  it('EMPTY: qualityScore=36, condition=forest-floor', () => {
    const c = analyzeMossCushion(EMPTY, 'empty.ts')
    expect(c.qualityScore).toBe(36)
    expect(c.condition).toBe('forest-floor')
  })

  it('MEDIUM: qualityScore=59, condition=zen-garden', () => {
    const c = analyzeMossCushion(MEDIUM, 'medium.ts')
    expect(c.qualityScore).toBe(59)
    expect(c.condition).toBe('zen-garden')
  })
})

// ─── Condition Classification Tests ─────────────────────────────────────────

describe('classifyCondition', () => {
  it('kyoto-garden for score >= 80', () => {
    const c = analyzeMossCushion(RICH, 'test.ts')
    expect(classifyCondition(c)).toBe('kyoto-garden')
  })

  it('temple-moss for score 65-79', () => {
    expect(classifyCondition({ qualityScore: 70 } as any)).toBe('temple-moss')
  })

  it('zen-garden for score 50-64', () => {
    expect(classifyCondition({ qualityScore: 55 } as any)).toBe('zen-garden')
  })

  it('forest-floor for score 35-49', () => {
    expect(classifyCondition({ qualityScore: 40 } as any)).toBe('forest-floor')
  })

  it('crack-moss for score 20-34', () => {
    expect(classifyCondition({ qualityScore: 25 } as any)).toBe('crack-moss')
  })

  it('dust for score < 20', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('dust')
  })
})

// ─── Colony Classification Tests ────────────────────────────────────────────

describe('classifyColonyType', () => {
  it('sacred-garden for avg >= 75 with 30% kyoto', () => {
    const cushions = [analyzeMossCushion(RICH, 'a.ts')]
    expect(classifyColonyType(cushions)).toBe('sacred-garden')
  })

  it('barren for empty array', () => {
    expect(classifyColonyType([])).toBe('barren')
  })
})

describe('classifyColonyCondition', () => {
  it('world-heritage for avg >= 80', () => {
    expect(classifyColonyCondition(85)).toBe('world-heritage')
  })

  it('national-garden for avg 65-79', () => {
    expect(classifyColonyCondition(70)).toBe('national-garden')
  })

  it('monastery-garden for avg 50-64', () => {
    expect(classifyColonyCondition(55)).toBe('monastery-garden')
  })

  it('courtyard for avg 35-49', () => {
    expect(classifyColonyCondition(40)).toBe('courtyard')
  })

  it('alley for avg 20-34', () => {
    expect(classifyColonyCondition(25)).toBe('alley')
  })

  it('parking-lot for avg < 20', () => {
    expect(classifyColonyCondition(10)).toBe('parking-lot')
  })
})

describe('classifyGardenerGrade', () => {
  it('zen-master for >= 80', () => {
    expect(classifyGardenerGrade(85)).toBe('zen-master')
  })

  it('master-gardener for 65-79', () => {
    expect(classifyGardenerGrade(70)).toBe('master-gardener')
  })

  it('gardener for 50-64', () => {
    expect(classifyGardenerGrade(55)).toBe('gardener')
  })

  it('groundskeeper for 35-49', () => {
    expect(classifyGardenerGrade(40)).toBe('groundskeeper')
  })

  it('amateur for 20-34', () => {
    expect(classifyGardenerGrade(25)).toBe('amateur')
  })

  it('concrete-paver for < 20', () => {
    expect(classifyGardenerGrade(10)).toBe('concrete-paver')
  })
})

// ─── Colony Analysis Tests ──────────────────────────────────────────────────

describe('analyzeMossColony', () => {
  it('returns barren colony for empty cushions', () => {
    const col = analyzeMossColony([], 'testdir')
    expect(col.colonyType).toBe('barren')
    expect(col.condition).toBe('parking-lot')
    expect(col.avgVitality).toBe(0)
  })

  it('RICH single: sacred-garden, world-heritage', () => {
    const cushions = [analyzeMossCushion(RICH, 'a.ts')]
    const col = analyzeMossColony(cushions, '.')
    expect(col.colonyType).toBe('sacred-garden')
    expect(col.condition).toBe('world-heritage')
    expect(col.kyotoCount).toBe(1)
  })
})

// ─── Build Result Tests ─────────────────────────────────────────────────────

describe('buildMossGardenResult', () => {
  it('RICH single: landscape isSerene=true, overallSerenity=89', () => {
    const r = buildMossGardenResult(['rich.ts'], [RICH])
    expect(r.landscape.isSerene).toBe(true)
    expect(r.landscape.overallSerenity).toBe(89)
    expect(r.landscape.avgVitality).toBe(91)
  })

  it('RICH single: gardenerGrade=zen-master', () => {
    const r = buildMossGardenResult(['rich.ts'], [RICH])
    expect(r.stats.gardenerGrade).toBe('zen-master')
  })

  it('RICH single: stats have correct counts', () => {
    const r = buildMossGardenResult(['rich.ts'], [RICH])
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.totalColonies).toBe(1)
    expect(r.stats.kyotoGardenCount).toBe(1)
    expect(r.stats.hasHighVitalityCount).toBe(1)
    expect(r.stats.hasDeepRootsCount).toBe(1)
  })

  it('RICH single: bestCushion=rich.ts, mostVital=rich.ts', () => {
    const r = buildMossGardenResult(['rich.ts'], [RICH])
    expect(r.stats.bestCushion).toBe('rich.ts')
    expect(r.stats.mostVital).toBe('rich.ts')
    expect(r.stats.deepestRooted).toBe('rich.ts')
    expect(r.stats.densest).toBe('rich.ts')
    expect(r.stats.mostMature).toBe('rich.ts')
    expect(r.stats.mostSerene).toBe('rich.ts')
  })

  it('empty: all zeros, concrete-paver', () => {
    const r = buildMossGardenResult([], [])
    expect(r.cushions).toHaveLength(0)
    expect(r.colonies).toHaveLength(0)
    expect(r.landscape.overallSerenity).toBe(0)
    expect(r.landscape.isSerene).toBe(false)
    expect(r.stats.gardenerGrade).toBe('concrete-paver')
  })

  it('empty: 7 recommendations for empty input', () => {
    const r = buildMossGardenResult([], [])
    expect(r.recommendations).toHaveLength(7)
  })

  it('mixed: overallSerenity=61, isSerene=false', () => {
    const r = buildMossGardenResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(r.landscape.overallSerenity).toBe(61)
    expect(r.landscape.isSerene).toBe(false)
  })

  it('mixed: correct avg scores', () => {
    const r = buildMossGardenResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(r.stats.avgGrowthVitality).toBe(64)
    expect(r.stats.avgRhizoidDepth).toBe(60)
    expect(r.stats.avgCushionDensity).toBe(63)
    expect(r.stats.avgSporophyteMaturity).toBe(65)
    expect(r.stats.avgMoistureRetention).toBe(57)
    expect(r.stats.avgGardenSerenity).toBe(58)
  })

  it('mixed: condition counts', () => {
    const r = buildMossGardenResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(r.stats.kyotoGardenCount).toBe(1)
    expect(r.stats.zenGardenCount).toBe(1)
    expect(r.stats.forestFloorCount).toBe(1)
    expect(r.stats.dustCount).toBe(0)
  })

  it('mixed: gardenerGrade=gardener', () => {
    const r = buildMossGardenResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(r.stats.gardenerGrade).toBe('gardener')
  })

  it('mixed: colony=temple-grounds, monastery-garden', () => {
    const r = buildMossGardenResult(['a.ts', 'b.ts', 'c.ts'], [RICH, EMPTY, MEDIUM])
    expect(r.colonies[0].colonyType).toBe('temple-grounds')
    expect(r.colonies[0].condition).toBe('monastery-garden')
  })
})

// ─── Recommendations Tests ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('RICH single: zen mastery recommendation', () => {
    const r = buildMossGardenResult(['rich.ts'], [RICH])
    expect(r.recommendations).toHaveLength(1)
    expect(r.recommendations[0]).toContain('Zen garden mastery')
  })

  it('empty: all improvement recommendations', () => {
    const r = buildMossGardenResult([], [])
    expect(r.recommendations.some((rec) => rec.includes('vitality'))).toBe(true)
    expect(r.recommendations.some((rec) => rec.includes('rhizoid'))).toBe(true)
    expect(r.recommendations.some((rec) => rec.includes('cushion'))).toBe(true)
    expect(r.recommendations.some((rec) => rec.includes('sporophyte'))).toBe(true)
  })
})

// ─── Format Helpers Tests ───────────────────────────────────────────────────

describe('formatMossGardenJson', () => {
  it('returns valid JSON string', () => {
    const r = buildMossGardenResult(['rich.ts'], [RICH])
    const json = formatMossGardenJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.cushions).toHaveLength(1)
    expect(parsed.stats.gardenerGrade).toBe('zen-master')
  })
})

describe('formatMossGardenTable', () => {
  it('returns string with Moss Garden header', () => {
    const r = buildMossGardenResult(['rich.ts'], [RICH])
    const table = formatMossGardenTable(r, false)
    expect(table).toContain('Moss Garden')
    expect(table).toContain('Overall Serenity')
  })

  it('verbose mode includes per-file details', () => {
    const r = buildMossGardenResult(['rich.ts'], [RICH])
    const table = formatMossGardenTable(r, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('rich.ts')
  })

  it('includes recommendations when present', () => {
    const r = buildMossGardenResult([], [])
    const table = formatMossGardenTable(r, false)
    expect(table).toContain('Recommendations')
  })
})

describe('scoreColor', () => {
  it('returns string for high score', () => {
    const result = scoreColor(90)
    expect(typeof result).toBe('string')
  })

  it('returns string for medium score', () => {
    const result = scoreColor(60)
    expect(typeof result).toBe('string')
  })

  it('returns string for low score', () => {
    const result = scoreColor(30)
    expect(typeof result).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns colored string for each condition', () => {
    const conditions = ['kyoto-garden', 'temple-moss', 'zen-garden', 'forest-floor', 'crack-moss', 'dust']
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
    const grades = ['zen-master', 'master-gardener', 'gardener', 'groundskeeper', 'amateur', 'concrete-paver']
    for (const grade of grades) {
      expect(typeof gradeColor(grade)).toBe('string')
    }
  })
})

describe('speciesColor', () => {
  it('returns colored string for each species', () => {
    const speciesList = ['sphagnum', 'polytrichum', 'bryum', 'hypnum', 'ceratodon', 'dust']
    for (const sp of speciesList) {
      expect(typeof speciesColor(sp)).toBe('string')
    }
  })

  it('returns plain string for unknown species', () => {
    expect(speciesColor('unknown')).toBe('unknown')
  })
})
