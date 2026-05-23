import { describe, it, expect } from 'vitest'
import {
  measureBeautiful,
  measureBlossom,
  measureGrowth,
  measureFragrant,
  measurePollinating,
  measureSeasonal,
  analyzePetal,
  classifyPetalCondition,
  classifyBouquetType,
  classifyBouquetCondition,
  classifyGardenerGrade,
  analyzeBouquet,
  buildPetalBloomResult,
} from '../src/commands/petal-bloom-helpers.js'
import {
  scoreColor,
  formColor,
  stageColor,
  capacityColor,
  scentColor,
  spreadColor,
  phaseColor,
  conditionColor,
  gradeColor,
  bouquetTypeColor,
  bouquetConditionColor,
  formatPetalBloomJson,
  formatPetalBloomTable,
} from '../src/commands/petal-bloom-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface User { id: number; name: string }
export type UserRole = 'admin' | 'user'
export class UserService {
  private users: Map<number, User> = new Map()
  async getUser(id: number): Promise<User | null> {
    try {
      const user = this.users.get(id)
      return user ?? null
    } catch (error) {
      return null
    }
  }
}
import { injectable } from 'tsyringe'
/** Documentation */
export async function processUser(user: User): Promise<void> {
  await Promise.resolve(user)
}
`

const MEDIUM = `function hello(name) {
  console.log('hello', name)
  return name
}
`

const EMPTY = ''

// ─── measureBeautiful ───────────────────────────────────────────────────────

describe('measureBeautiful', () => {
  it('returns orchid-perfection for rich code', () => {
    const r = measureBeautiful(RICH)
    expect(r.form).toBe('orchid-perfection')
    expect(r.elegance).toBe(94)
  })

  it('returns wilted for empty content', () => {
    const r = measureBeautiful(EMPTY)
    expect(r.form).toBe('wilted')
    expect(r.elegance).toBe(0)
  })

  it('detects interfaces giving hasGraceful', () => {
    const r = measureBeautiful('interface Foo { x: number }')
    expect(r.hasGraceful).toBe(true)
  })

  it('detects exports + imports giving hasHarmonious', () => {
    const r = measureBeautiful('import { x } from "y"\nexport const z = x')
    expect(r.hasHarmonious).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureBeautiful(RICH)
    expect(typeof r.hasHighElegance).toBe('boolean')
    expect(typeof r.hasNoUgliness).toBe('boolean')
    expect(typeof r.hasProportioned).toBe('boolean')
  })

  it('counts ugliness patterns', () => {
    const r = measureBeautiful('var x: any = 1')
    expect(r.uglinessCount).toBeGreaterThan(0)
    expect(r.hasNoUgliness).toBe(false)
  })

  it('counts clumsiness patterns', () => {
    const r = measureBeautiful('eval("code")')
    expect(r.clumsinessCount).toBeGreaterThan(0)
  })
})

// ─── measureBlossom ─────────────────────────────────────────────────────────

describe('measureBlossom', () => {
  it('returns opening for rich code', () => {
    const r = measureBlossom(RICH)
    expect(r.stage).toBe('opening')
    expect(r.development).toBe(69)
  })

  it('returns dead-seed for empty content', () => {
    const r = measureBlossom(EMPTY)
    expect(r.stage).toBe('dead-seed')
    expect(r.development).toBe(0)
  })

  it('detects async giving hasExpanding', () => {
    const r = measureBlossom('async function foo() {}')
    expect(r.hasExpanding).toBe(true)
  })

  it('detects exports + error handling giving hasFlourishing', () => {
    const r = measureBlossom('export function foo() { try {} catch(e) {} }')
    expect(r.hasFlourishing).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureBlossom(RICH)
    expect(typeof r.hasHighDevelopment).toBe('boolean')
    expect(typeof r.hasNoStagnation).toBe('boolean')
    expect(typeof r.hasMature).toBe('boolean')
  })

  it('counts stagnation patterns', () => {
    const r = measureBlossom('TODO: fix\nFIXME: broken')
    expect(r.stagnationCount).toBeGreaterThan(0)
  })

  it('counts regression patterns', () => {
    const r = measureBlossom('var x = 1;\narguments[0]')
    expect(r.regressionCount).toBeGreaterThan(0)
  })
})

// ─── measureGrowth ──────────────────────────────────────────────────────────

describe('measureGrowth', () => {
  it('returns healthy-shrub for rich code', () => {
    const r = measureGrowth(RICH)
    expect(r.capacity).toBe('healthy-shrub')
    expect(r.potential).toBe(52)
  })

  it('returns barren-soil for empty content', () => {
    const r = measureGrowth(EMPTY)
    expect(r.capacity).toBe('barren-soil')
    expect(r.potential).toBe(0)
  })

  it('detects interfaces giving hasExtensible', () => {
    const r = measureGrowth('interface Foo<T> { x: T }')
    expect(r.hasExtensible).toBe(true)
  })

  it('detects exports + imports giving hasModular', () => {
    const r = measureGrowth('import { x } from "y"\nexport const z = x')
    expect(r.hasModular).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureGrowth(RICH)
    expect(typeof r.hasHighPotential).toBe('boolean')
    expect(typeof r.hasNoRigidity).toBe('boolean')
    expect(typeof r.hasNoBrittleness).toBe('boolean')
  })

  it('counts rigidity patterns', () => {
    const r = measureGrowth('var x = 1')
    expect(r.rigidityCount).toBeGreaterThan(0)
  })
})

// ─── measureFragrant ────────────────────────────────────────────────────────

describe('measureFragrant', () => {
  it('returns sweet-fragrance for rich code', () => {
    const r = measureFragrant(RICH)
    expect(r.scent).toBe('sweet-fragrance')
    expect(r.appeal).toBe(67)
  })

  it('returns unpleasant for empty content', () => {
    const r = measureFragrant(EMPTY)
    expect(r.scent).toBe('unpleasant')
    expect(r.appeal).toBe(0)
  })

  it('detects JSDoc giving hasInviting', () => {
    const r = measureFragrant('/** docs */\nfunction foo() {}')
    expect(r.hasInviting).toBe(true)
  })

  it('detects typed params giving hasClear', () => {
    const r = measureFragrant('function foo(x: number) {}')
    expect(r.hasClear).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureFragrant(RICH)
    expect(typeof r.hasHighAppeal).toBe('boolean')
    expect(typeof r.hasNoRepellent).toBe('boolean')
    expect(typeof r.hasWelcoming).toBe('boolean')
  })

  it('counts repellent patterns', () => {
    const r = measureFragrant('console.log("debug")')
    expect(r.repellentCount).toBeGreaterThan(0)
    expect(r.hasNoRepellent).toBe(false)
  })
})

// ─── measurePollinating ─────────────────────────────────────────────────────

describe('measurePollinating', () => {
  it('returns wide-spread for rich code', () => {
    const r = measurePollinating(RICH)
    expect(r.spread).toBe('wide-spread')
    expect(r.reuse).toBe(67)
  })

  it('returns walled-garden for empty content', () => {
    const r = measurePollinating(EMPTY)
    expect(r.spread).toBe('walled-garden')
    expect(r.reuse).toBe(0)
  })

  it('detects exports giving hasShareable', () => {
    const r = measurePollinating('export function foo() {}')
    expect(r.hasShareable).toBe(true)
  })

  it('detects imports + exports giving hasConnector', () => {
    const r = measurePollinating('import { x } from "y"\nexport const z = x')
    expect(r.hasConnector).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measurePollinating(RICH)
    expect(typeof r.hasHighReuse).toBe('boolean')
    expect(typeof r.hasNoSilos).toBe('boolean')
    expect(typeof r.hasCommunity).toBe('boolean')
  })

  it('counts silo patterns', () => {
    const r = measurePollinating('require("fs")\nmodule.exports = {}')
    expect(r.siloCount).toBeGreaterThan(0)
  })
})

// ─── measureSeasonal ────────────────────────────────────────────────────────

describe('measureSeasonal', () => {
  it('returns long-season for rich code', () => {
    const r = measureSeasonal(RICH)
    expect(r.phase).toBe('long-season')
    expect(r.rhythm).toBe(71)
  })

  it('returns never-blooms for empty content', () => {
    const r = measureSeasonal(EMPTY)
    expect(r.phase).toBe('never-blooms')
    expect(r.rhythm).toBe(0)
  })

  it('detects async + await giving hasProperTiming', () => {
    const r = measureSeasonal('async function foo() { await bar() }')
    expect(r.hasProperTiming).toBe(true)
  })

  it('detects error handling + const giving hasRhythmic', () => {
    const r = measureSeasonal('const x = 1; try {} catch(e) {}')
    expect(r.hasRhythmic).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureSeasonal(RICH)
    expect(typeof r.hasHighRhythm).toBe('boolean')
    expect(typeof r.hasNoPremature).toBe('boolean')
    expect(typeof r.hasNatural).toBe('boolean')
  })

  it('counts premature patterns', () => {
    const r = measureSeasonal('var x: any = 1')
    expect(r.prematureCount).toBeGreaterThan(0)
  })
})

// ─── analyzePetal (RICH fixture) ────────────────────────────────────────────

describe('analyzePetal - RICH fixture', () => {
  const p = analyzePetal(RICH, 'rich.ts')

  it('has correct beauty', () => expect(p.beauty).toBe(94))
  it('has correct blossoming', () => expect(p.blossoming).toBe(69))
  it('has correct growth potential', () => expect(p.growthPotential).toBe(52))
  it('has correct fragrance', () => expect(p.fragrance).toBe(67))
  it('has correct pollination', () => expect(p.pollination).toBe(67))
  it('has correct seasonal rhythm', () => expect(p.seasonalRhythm).toBe(71))
  it('has correct quality score', () => expect(p.qualityScore).toBe(71))
  it('has correct condition', () => expect(p.condition).toBe('growing-plant'))
  it('has correct file', () => expect(p.file).toBe('rich.ts'))
  it('has orchid-perfection form', () => expect(p.beautiful.form).toBe('orchid-perfection'))
  it('has opening stage', () => expect(p.blossom.stage).toBe('opening'))
  it('has healthy-shrub capacity', () => expect(p.growth.capacity).toBe('healthy-shrub'))
  it('has sweet-fragrance scent', () => expect(p.fragrant.scent).toBe('sweet-fragrance'))
  it('has wide-spread spread', () => expect(p.pollinating.spread).toBe('wide-spread'))
  it('has long-season phase', () => expect(p.seasonal.phase).toBe('long-season'))
})

// ─── analyzePetal (MEDIUM fixture) ──────────────────────────────────────────

describe('analyzePetal - MEDIUM fixture', () => {
  const p = analyzePetal(MEDIUM, 'medium.ts')

  it('has correct beauty', () => expect(p.beauty).toBe(0))
  it('has correct blossoming', () => expect(p.blossoming).toBe(8))
  it('has correct growth potential', () => expect(p.growthPotential).toBe(0))
  it('has correct fragrance', () => expect(p.fragrance).toBe(0))
  it('has correct pollination', () => expect(p.pollination).toBe(7))
  it('has correct seasonal rhythm', () => expect(p.seasonalRhythm).toBe(0))
  it('has correct quality score', () => expect(p.qualityScore).toBe(2))
  it('has dried-arrangement condition', () => expect(p.condition).toBe('dried-arrangement'))
})

// ─── analyzePetal (EMPTY fixture) ───────────────────────────────────────────

describe('analyzePetal - EMPTY fixture', () => {
  const p = analyzePetal(EMPTY, 'empty.ts')

  it('has zero beauty', () => expect(p.beauty).toBe(0))
  it('has zero blossoming', () => expect(p.blossoming).toBe(0))
  it('has zero growth potential', () => expect(p.growthPotential).toBe(0))
  it('has zero fragrance', () => expect(p.fragrance).toBe(0))
  it('has zero pollination', () => expect(p.pollination).toBe(0))
  it('has zero seasonal rhythm', () => expect(p.seasonalRhythm).toBe(0))
  it('has zero quality score', () => expect(p.qualityScore).toBe(0))
  it('has dried-arrangement condition', () => expect(p.condition).toBe('dried-arrangement'))
})

// ─── classifyPetalCondition ─────────────────────────────────────────────────

describe('classifyPetalCondition', () => {
  it('classifies 90 as prize-bloom', () => expect(classifyPetalCondition(90)).toBe('prize-bloom'))
  it('classifies 75 as healthy-flower', () => expect(classifyPetalCondition(75)).toBe('healthy-flower'))
  it('classifies 60 as growing-plant', () => expect(classifyPetalCondition(60)).toBe('growing-plant'))
  it('classifies 45 as fading-petals', () => expect(classifyPetalCondition(45)).toBe('fading-petals'))
  it('classifies 30 as wilting', () => expect(classifyPetalCondition(30)).toBe('wilting'))
  it('classifies 10 as dried-arrangement', () => expect(classifyPetalCondition(10)).toBe('dried-arrangement'))
})

// ─── classifyGardenerGrade ──────────────────────────────────────────────────

describe('classifyGardenerGrade', () => {
  it('classifies 90 as master-gardener', () => expect(classifyGardenerGrade(90)).toBe('master-gardener'))
  it('classifies 75 as expert-botanist', () => expect(classifyGardenerGrade(75)).toBe('expert-botanist'))
  it('classifies 50 as skilled-horticulturist', () => expect(classifyGardenerGrade(50)).toBe('skilled-horticulturist'))
  it('classifies 35 as weekend-gardener', () => expect(classifyGardenerGrade(35)).toBe('weekend-gardener'))
  it('classifies 20 as plant-novice', () => expect(classifyGardenerGrade(20)).toBe('plant-novice'))
  it('classifies 5 as brown-thumb', () => expect(classifyGardenerGrade(5)).toBe('brown-thumb'))
})

// ─── classifyBouquetType ────────────────────────────────────────────────────

describe('classifyBouquetType', () => {
  it('returns barren-ground for empty petals', () => {
    expect(classifyBouquetType([])).toBe('barren-ground')
  })

  it('classifies rich petals', () => {
    const petals = [analyzePetal(RICH, 'r.ts')]
    const result = classifyBouquetType(petals)
    expect(typeof result).toBe('string')
  })

  it('classifies empty petals as barren-ground', () => {
    const petals = [analyzePetal(EMPTY, 'e.ts')]
    expect(classifyBouquetType(petals)).toBe('barren-ground')
  })

  it('returns a valid type', () => {
    const petals = [analyzePetal(RICH, 'a.ts'), analyzePetal(MEDIUM, 'b.ts')]
    const valid = ['botanical-garden', 'flower-arrangement', 'wildflower-meadow', 'potted-plants', 'dried-flowers', 'barren-ground']
    expect(valid).toContain(classifyBouquetType(petals))
  })
})

// ─── analyzeBouquet ─────────────────────────────────────────────────────────

describe('analyzeBouquet', () => {
  it('analyzes single petal', () => {
    const p = analyzePetal(RICH, 'a.ts')
    const bouquet = analyzeBouquet([p], '.')
    expect(bouquet.directory).toBe('.')
    expect(bouquet.petals).toHaveLength(1)
    expect(typeof bouquet.bouquetType).toBe('string')
  })

  it('computes avgBeauty from petals', () => {
    const p1 = analyzePetal(RICH, 'a.ts')
    const p2 = analyzePetal(MEDIUM, 'b.ts')
    const bouquet = analyzeBouquet([p1, p2], 'src')
    expect(bouquet.avgBeauty).toBe(Math.round((94 + 0) / 2))
    expect(bouquet.directory).toBe('src')
  })

  it('returns barren-ground for no petals', () => {
    const bouquet = analyzeBouquet([], 'empty')
    expect(bouquet.bouquetType).toBe('barren-ground')
    expect(bouquet.condition).toBe('dead-garden')
    expect(bouquet.avgBeauty).toBe(0)
  })
})

// ─── buildPetalBloomResult (RICH + MEDIUM) ──────────────────────────────────

describe('buildPetalBloomResult - RICH + MEDIUM', () => {
  const result = buildPetalBloomResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])

  it('has 2 total files', () => expect(result.stats.totalFiles).toBe(2))
  it('has 1 total bouquet', () => expect(result.stats.totalBouquets).toBe(1))
  it('has correct avg beauty', () => expect(result.stats.avgBeauty).toBe(47))
  it('has correct avg blossoming', () => expect(result.stats.avgBlossoming).toBe(39))
  it('has correct avg growth potential', () => expect(result.stats.avgGrowthPotential).toBe(26))
  it('has correct avg fragrance', () => expect(result.stats.avgFragrance).toBe(34))
  it('has correct avg pollination', () => expect(result.stats.avgPollination).toBe(37))
  it('has correct avg seasonal rhythm', () => expect(result.stats.avgSeasonalRhythm).toBe(36))
  it('has overall bloom of 37', () => expect(result.stats.overallBloom).toBe(37))
  it('has gardener grade weekend-gardener', () => expect(result.stats.gardenerGrade).toBe('weekend-gardener'))
  it('has 0 prize blooms', () => expect(result.stats.prizeBloomCount).toBe(0))
  it('has 1 growing plant', () => expect(result.stats.growingPlantCount).toBe(1))
  it('has 1 dried arrangement', () => expect(result.stats.driedArrangementCount).toBe(1))
  it('garden avgBeauty is 47', () => expect(result.garden.avgBeauty).toBe(47))
  it('garden overallBloom is 37', () => expect(result.garden.overallBloom).toBe(37))
  it('garden isBlooming is false', () => expect(result.garden.isBlooming).toBe(false))
  it('has bestPetal rich.ts', () => expect(result.stats.bestPetal).toBe('rich.ts'))
  it('has mostBeautiful rich.ts', () => expect(result.stats.mostBeautiful).toBe('rich.ts'))
  it('has mostReusable rich.ts', () => expect(result.stats.mostReusable).toBe('rich.ts'))
  it('has 1 bouquet', () => expect(result.bouquets).toHaveLength(1))
  it('bouquet has directory .', () => expect(result.bouquets[0].directory).toBe('.'))
  it('bouquet has type dried-flowers', () => expect(result.bouquets[0].bouquetType).toBe('dried-flowers'))
  it('bouquet has condition fading-garden', () => expect(result.bouquets[0].condition).toBe('fading-garden'))
  it('has 2 petals', () => expect(result.petals).toHaveLength(2))
  it('has recommendations', () => expect(Array.isArray(result.recommendations)).toBe(true))
})

// ─── buildPetalBloomResult (4x EMPTY) ───────────────────────────────────────

describe('buildPetalBloomResult - 4x EMPTY', () => {
  const result = buildPetalBloomResult(
    ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
    [EMPTY, EMPTY, EMPTY, EMPTY],
  )

  it('has 4 total files', () => expect(result.stats.totalFiles).toBe(4))
  it('has 1 total bouquet', () => expect(result.stats.totalBouquets).toBe(1))
  it('has zero avg beauty', () => expect(result.stats.avgBeauty).toBe(0))
  it('has zero overall bloom', () => expect(result.stats.overallBloom).toBe(0))
  it('has gardener grade brown-thumb', () => expect(result.stats.gardenerGrade).toBe('brown-thumb'))
  it('garden avgBeauty is 0', () => expect(result.garden.avgBeauty).toBe(0))
  it('garden isBlooming is false', () => expect(result.garden.isBlooming).toBe(false))
  it('has 4 dried arrangements', () => expect(result.stats.driedArrangementCount).toBe(4))
  it('has 4 petals', () => expect(result.petals).toHaveLength(4))
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns a string', () => expect(typeof scoreColor(50)).toBe('string'))
})

describe('formColor', () => {
  it('colors orchid-perfection', () => expect(typeof formColor('orchid-perfection')).toBe('string'))
  it('handles unknown', () => expect(formColor('unknown')).toBe('unknown'))
})

describe('stageColor', () => {
  it('colors full-bloom', () => expect(typeof stageColor('full-bloom')).toBe('string'))
  it('handles unknown', () => expect(stageColor('unknown')).toBe('unknown'))
})

describe('capacityColor', () => {
  it('colors unlimited-canopy', () => expect(typeof capacityColor('unlimited-canopy')).toBe('string'))
  it('handles unknown', () => expect(capacityColor('unknown')).toBe('unknown'))
})

describe('scentColor', () => {
  it('colors intoxicating', () => expect(typeof scentColor('intoxicating')).toBe('string'))
  it('handles unknown', () => expect(scentColor('unknown')).toBe('unknown'))
})

describe('spreadColor', () => {
  it('colors cross-pollination', () => expect(typeof spreadColor('cross-pollination')).toBe('string'))
  it('handles unknown', () => expect(spreadColor('unknown')).toBe('unknown'))
})

describe('phaseColor', () => {
  it('colors perpetual-bloom', () => expect(typeof phaseColor('perpetual-bloom')).toBe('string'))
  it('handles unknown', () => expect(phaseColor('unknown')).toBe('unknown'))
})

describe('conditionColor', () => {
  it('colors prize-bloom', () => expect(typeof conditionColor('prize-bloom')).toBe('string'))
  it('handles unknown', () => expect(conditionColor('unknown')).toBe('unknown'))
})

describe('gradeColor', () => {
  it('colors master-gardener', () => expect(typeof gradeColor('master-gardener')).toBe('string'))
  it('handles unknown', () => expect(gradeColor('unknown')).toBe('unknown'))
})

describe('bouquetTypeColor', () => {
  it('colors botanical-garden', () => expect(typeof bouquetTypeColor('botanical-garden')).toBe('string'))
  it('handles unknown', () => expect(bouquetTypeColor('unknown')).toBe('unknown'))
})

describe('bouquetConditionColor', () => {
  it('colors spectacular-bloom', () => expect(typeof bouquetConditionColor('spectacular-bloom')).toBe('string'))
  it('handles unknown', () => expect(bouquetConditionColor('unknown')).toBe('unknown'))
})

// ─── JSON Formatter ─────────────────────────────────────────────────────────

describe('formatPetalBloomJson', () => {
  it('returns valid JSON', () => {
    const result = buildPetalBloomResult(['a.ts'], [RICH])
    const json = formatPetalBloomJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.petals).toHaveLength(1)
  })
})

// ─── Table Formatter ────────────────────────────────────────────────────────

describe('formatPetalBloomTable', () => {
  it('returns string with Petal Bloom header', () => {
    const result = buildPetalBloomResult(['a.ts'], [RICH])
    const table = formatPetalBloomTable(result, false)
    expect(table).toContain('Petal Bloom')
    expect(table).toContain('Garden Overview')
    expect(table).toContain('Statistics')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildPetalBloomResult(['a.ts'], [RICH])
    const table = formatPetalBloomTable(result, true)
    expect(table).toContain('Per-File Petals')
    expect(table).toContain('a.ts')
  })

  it('hides per-file details in non-verbose mode', () => {
    const result = buildPetalBloomResult(['a.ts'], [RICH])
    const table = formatPetalBloomTable(result, false)
    expect(table).not.toContain('Per-File Petals')
  })
})
