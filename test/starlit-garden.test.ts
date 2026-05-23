import { describe, expect, it } from 'vitest'
import {
  measureWondrous,
  measureConstellation,
  measureCelestial,
  measureNocturnal,
  measureBlooming,
  measureGuiding,
  classifyCondition,
  classifyPlotType,
  classifyPlotCondition,
  classifyAstronomerGrade,
  analyzeStarFlower,
  analyzeGardenPlot,
  buildStarlitGardenResult,
} from '../src/commands/starlit-garden-helpers.js'
import {
  scoreColor,
  aweColor,
  patternColor,
  orderColor,
  radianceColor,
  bloomColor,
  brightnessColor,
  conditionColor,
  gradeColor,
  formatStarlitGardenJson,
  formatStarlitGardenTable,
} from '../src/commands/starlit-garden-format-helpers.js'

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

// ─── measureWondrous ───────────────────────────────────────────────────────

describe('measureWondrous', () => {
  it('returns correct inspiration for RICH content', () => {
    const result = measureWondrous(RICH)
    expect(result.inspiration).toBe(78)
  })

  it('returns correct awe for RICH content', () => {
    const result = measureWondrous(RICH)
    expect(result.awe).toBe('inspiring')
  })

  it('detects high inspiration', () => {
    const result = measureWondrous(RICH)
    expect(result.hasHighInspiration).toBe(true)
  })

  it('detects clever code', () => {
    const result = measureWondrous(RICH)
    expect(result.hasClever).toBe(true)
  })

  it('detects elegant code', () => {
    const result = measureWondrous(RICH)
    expect(result.hasElegant).toBe(true)
  })

  it('detects no plodding code', () => {
    const result = measureWondrous(RICH)
    expect(result.hasNoPlodding).toBe(true)
    expect(result.ploddingCount).toBe(0)
  })

  it('detects innovative code', () => {
    const result = measureWondrous(RICH)
    expect(result.hasInnovative).toBe(true)
  })

  it('detects no boring code', () => {
    const result = measureWondrous(RICH)
    expect(result.hasNoBoring).toBe(true)
    expect(result.boringCount).toBe(0)
  })

  it('detects beautiful code', () => {
    const result = measureWondrous(RICH)
    expect(result.hasBeautiful).toBe(true)
  })

  it('detects impressive code', () => {
    const result = measureWondrous(RICH)
    expect(result.hasImpressive).toBe(true)
  })

  it('returns zero for empty content', () => {
    const result = measureWondrous(EMPTY)
    expect(result.inspiration).toBe(0)
    expect(result.awe).toBe('uninspiring')
  })

  it('detects plodding patterns with for loops', () => {
    const result = measureWondrous('for (let i = 0; i < 10; i++) {}')
    expect(result.hasNoPlodding).toBe(false)
    expect(result.ploddingCount).toBe(1)
  })
})

// ─── measureConstellation ──────────────────────────────────────────────────

describe('measureConstellation', () => {
  it('returns correct mapping for RICH content', () => {
    const result = measureConstellation(RICH)
    expect(result.mapping).toBe(87)
  })

  it('returns correct pattern for RICH content', () => {
    const result = measureConstellation(RICH)
    expect(result.pattern).toBe('perfect-constellation')
  })

  it('detects high mapping', () => {
    const result = measureConstellation(RICH)
    expect(result.hasHighMapping).toBe(true)
  })

  it('detects organized code', () => {
    const result = measureConstellation(RICH)
    expect(result.hasOrganized).toBe(true)
  })

  it('detects patterned code', () => {
    const result = measureConstellation(RICH)
    expect(result.hasPatterned).toBe(true)
  })

  it('detects no chaos', () => {
    const result = measureConstellation(RICH)
    expect(result.hasNoChaos).toBe(true)
    expect(result.chaosCount).toBe(0)
  })

  it('detects structured code', () => {
    const result = measureConstellation(RICH)
    expect(result.hasStructured).toBe(true)
  })

  it('detects clear code', () => {
    const result = measureConstellation(RICH)
    expect(result.hasClear).toBe(true)
  })

  it('detects mapped code', () => {
    const result = measureConstellation(RICH)
    expect(result.hasMapped).toBe(true)
  })

  it('returns zero for empty content', () => {
    const result = measureConstellation(EMPTY)
    expect(result.mapping).toBe(0)
    expect(result.pattern).toBe('void')
  })

  it('detects chaos with any keyword', () => {
    const result = measureConstellation('const x: any = 1')
    expect(result.hasNoChaos).toBe(false)
    expect(result.chaosCount).toBe(1)
  })

  it('detects randomness with TODO', () => {
    const result = measureConstellation('// TODO: fix this')
    expect(result.hasNoRandomness).toBe(false)
    expect(result.randomnessCount).toBe(1)
  })
})

// ─── measureCelestial ──────────────────────────────────────────────────────

describe('measureCelestial', () => {
  it('returns correct organization for RICH content', () => {
    const result = measureCelestial(RICH)
    expect(result.organization).toBe(28)
  })

  it('returns correct order for RICH content', () => {
    const result = measureCelestial(RICH)
    expect(result.order).toBe('tumbling')
  })

  it('detects layered code', () => {
    const result = measureCelestial(RICH)
    expect(result.hasLayered).toBe(true)
  })

  it('detects systematic code', () => {
    const result = measureCelestial(RICH)
    expect(result.hasSystematic).toBe(true)
  })

  it('detects no flatness', () => {
    const result = measureCelestial(RICH)
    expect(result.hasNoFlatness).toBe(true)
  })

  it('detects no mixed up code', () => {
    const result = measureCelestial(RICH)
    expect(result.hasNoMixedUp).toBe(true)
  })

  it('returns zero for empty content', () => {
    const result = measureCelestial(EMPTY)
    expect(result.organization).toBe(0)
    expect(result.order).toBe('chaotic-orbit')
  })

  it('detects hierarchical code', () => {
    const result = measureCelestial('export class Foo extends Bar implements Baz {}')
    expect(result.hasHierarchical).toBe(true)
    expect(result.hasCategorized).toBe(false)
  })
})

// ─── measureNocturnal ──────────────────────────────────────────────────────

describe('measureNocturnal', () => {
  it('returns correct beauty for RICH content', () => {
    const result = measureNocturnal(RICH)
    expect(result.beauty).toBe(40)
  })

  it('returns correct radiance for RICH content', () => {
    const result = measureNocturnal(RICH)
    expect(result.radiance).toBe('dim-glow')
  })

  it('detects graceful code', () => {
    const result = measureNocturnal(RICH)
    expect(result.hasGraceful).toBe(true)
  })

  it('detects refined code', () => {
    const result = measureNocturnal(RICH)
    expect(result.hasRefined).toBe(true)
  })

  it('detects no harshness', () => {
    const result = measureNocturnal(RICH)
    expect(result.hasNoHarshness).toBe(true)
  })

  it('returns zero for empty content', () => {
    const result = measureNocturnal(EMPTY)
    expect(result.beauty).toBe(0)
    expect(result.radiance).toBe('pitch-black')
  })

  it('detects elegant with arrow + destructuring', () => {
    const result = measureNocturnal('const { x } = obj; const fn = () => {}')
    expect(result.hasElegant).toBe(true)
  })
})

// ─── measureBlooming ───────────────────────────────────────────────────────

describe('measureBlooming', () => {
  it('returns correct nightValue for RICH content', () => {
    const result = measureBlooming(RICH)
    expect(result.nightValue).toBe(92)
  })

  it('returns correct bloom for RICH content', () => {
    const result = measureBlooming(RICH)
    expect(result.bloom).toBe('night-orchid')
  })

  it('detects high night value', () => {
    const result = measureBlooming(RICH)
    expect(result.hasHighNightValue).toBe(true)
  })

  it('detects valuable code', () => {
    const result = measureBlooming(RICH)
    expect(result.hasValuable).toBe(true)
  })

  it('detects useful code', () => {
    const result = measureBlooming(RICH)
    expect(result.hasUseful).toBe(true)
  })

  it('detects essential code', () => {
    const result = measureBlooming(RICH)
    expect(result.hasEssential).toBe(true)
  })

  it('detects no dead code', () => {
    const result = measureBlooming(RICH)
    expect(result.hasNoDeadCode).toBe(true)
    expect(result.deadCodeCount).toBe(0)
  })

  it('detects no waste', () => {
    const result = measureBlooming(RICH)
    expect(result.hasNoWaste).toBe(true)
    expect(result.fillerCount).toBe(0)
  })

  it('returns zero for empty content', () => {
    const result = measureBlooming(EMPTY)
    expect(result.nightValue).toBe(0)
    expect(result.bloom).toBe('never-blooms')
  })

  it('detects waste with console.log', () => {
    const result = measureBlooming("console.log('x')")
    expect(result.hasNoWaste).toBe(false)
    expect(result.fillerCount).toBe(1)
  })
})

// ─── measureGuiding ────────────────────────────────────────────────────────

describe('measureGuiding', () => {
  it('returns correct light for RICH content', () => {
    const result = measureGuiding(RICH)
    expect(result.light).toBe(31)
  })

  it('returns correct brightness for RICH content', () => {
    const result = measureGuiding(RICH)
    expect(result.brightness).toBe('dying-ember')
  })

  it('detects documented code', () => {
    const result = measureGuiding(RICH)
    expect(result.hasDocumented).toBe(true)
  })

  it('detects no undocumented code', () => {
    const result = measureGuiding(RICH)
    expect(result.hasNoUndocumented).toBe(true)
    expect(result.undocumentedCount).toBe(0)
  })

  it('detects no mystery code', () => {
    const result = measureGuiding(RICH)
    expect(result.hasNoMystery).toBe(true)
    expect(result.mysteryCount).toBe(0)
  })

  it('returns zero for empty content', () => {
    const result = measureGuiding(EMPTY)
    expect(result.light).toBe(0)
    expect(result.brightness).toBe('darkness')
  })

  it('detects examples in documentation', () => {
    const result = measureGuiding('/** @example foo() */\nexport function foo(): void {}')
    expect(result.hasExamples).toBe(true)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies celestial-masterpiece at 85+', () => {
    expect(classifyCondition(85)).toBe('celestial-masterpiece')
  })
  it('classifies starlit-paradise at 70-84', () => {
    expect(classifyCondition(70)).toBe('starlit-paradise')
  })
  it('classifies moonlit-garden at 55-69', () => {
    expect(classifyCondition(55)).toBe('moonlit-garden')
  })
  it('classifies twilight-patch at 40-54', () => {
    expect(classifyCondition(40)).toBe('twilight-patch')
  })
  it('classifies dark-corner at 25-39', () => {
    expect(classifyCondition(25)).toBe('dark-corner')
  })
  it('classifies lightless-void below 25', () => {
    expect(classifyCondition(0)).toBe('lightless-void')
  })
})

// ─── classifyPlotType ──────────────────────────────────────────────────────

describe('classifyPlotType', () => {
  it('returns barren-soil for empty flowers', () => {
    expect(classifyPlotType([])).toBe('barren-soil')
  })

  it('returns correct type for mixed flowers', () => {
    const rich = analyzeStarFlower(RICH, 'rich.ts')
    const medium = analyzeStarFlower(MEDIUM, 'medium.ts')
    expect(classifyPlotType([rich, medium])).toBe('window-box')
  })
})

// ─── classifyPlotCondition ─────────────────────────────────────────────────

describe('classifyPlotCondition', () => {
  it('classifies paradise-under-stars at 75+', () => {
    expect(classifyPlotCondition(75)).toBe('paradise-under-stars')
  })
  it('classifies beautiful-night-garden at 60-74', () => {
    expect(classifyPlotCondition(60)).toBe('beautiful-night-garden')
  })
  it('classifies pleasant-evening-garden at 45-59', () => {
    expect(classifyPlotCondition(45)).toBe('pleasant-evening-garden')
  })
  it('classifies dimly-lit-patch at 30-44', () => {
    expect(classifyPlotCondition(30)).toBe('dimly-lit-patch')
  })
  it('classifies dark-weeds at 15-29', () => {
    expect(classifyPlotCondition(15)).toBe('dark-weeds')
  })
  it('classifies lightless below 15', () => {
    expect(classifyPlotCondition(0)).toBe('lightless')
  })
})

// ─── classifyAstronomerGrade ───────────────────────────────────────────────

describe('classifyAstronomerGrade', () => {
  it('classifies master-astronomer at 80+', () => {
    expect(classifyAstronomerGrade(80)).toBe('master-astronomer')
  })
  it('classifies expert-stargazer at 65-79', () => {
    expect(classifyAstronomerGrade(65)).toBe('expert-stargazer')
  })
  it('classifies skilled-observer at 50-64', () => {
    expect(classifyAstronomerGrade(50)).toBe('skilled-observer')
  })
  it('classifies amateur-astronomer at 35-49', () => {
    expect(classifyAstronomerGrade(35)).toBe('amateur-astronomer')
  })
  it('classifies casual-gazer at 20-34', () => {
    expect(classifyAstronomerGrade(20)).toBe('casual-gazer')
  })
  it('classifies cloudy-night below 20', () => {
    expect(classifyAstronomerGrade(0)).toBe('cloudy-night')
  })
})

// ─── analyzeStarFlower ─────────────────────────────────────────────────────

describe('analyzeStarFlower', () => {
  it('returns correct values for RICH content', () => {
    const result = analyzeStarFlower(RICH, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.wonder).toBe(78)
    expect(result.constellationMapping).toBe(87)
    expect(result.celestialOrganization).toBe(28)
    expect(result.nocturnalBeauty).toBe(40)
    expect(result.nightBloom).toBe(92)
    expect(result.guidingLight).toBe(31)
    expect(result.qualityScore).toBe(59)
    expect(result.condition).toBe('moonlit-garden')
  })

  it('returns correct values for MEDIUM content', () => {
    const result = analyzeStarFlower(MEDIUM, 'medium.ts')
    expect(result.wonder).toBe(0)
    expect(result.constellationMapping).toBe(0)
    expect(result.celestialOrganization).toBe(0)
    expect(result.nocturnalBeauty).toBe(0)
    expect(result.nightBloom).toBe(15)
    expect(result.guidingLight).toBe(0)
    expect(result.qualityScore).toBe(2)
    expect(result.condition).toBe('lightless-void')
  })

  it('returns correct values for EMPTY content', () => {
    const result = analyzeStarFlower(EMPTY, 'empty.ts')
    expect(result.wonder).toBe(0)
    expect(result.qualityScore).toBe(0)
    expect(result.condition).toBe('lightless-void')
  })

  it('includes all measure objects', () => {
    const result = analyzeStarFlower(RICH, 'rich.ts')
    expect(result.wondrous).toBeDefined()
    expect(result.constellation).toBeDefined()
    expect(result.celestial).toBeDefined()
    expect(result.nocturnal).toBeDefined()
    expect(result.blooming).toBeDefined()
    expect(result.guiding).toBeDefined()
  })
})

// ─── analyzeGardenPlot ─────────────────────────────────────────────────────

describe('analyzeGardenPlot', () => {
  it('returns empty plot for no flowers', () => {
    const result = analyzeGardenPlot([], '.')
    expect(result.directory).toBe('.')
    expect(result.flowers).toEqual([])
    expect(result.plotType).toBe('barren-soil')
    expect(result.condition).toBe('lightless')
  })

  it('returns correct plot for RICH+MEDIUM', () => {
    const rich = analyzeStarFlower(RICH, 'rich.ts')
    const medium = analyzeStarFlower(MEDIUM, 'medium.ts')
    const result = analyzeGardenPlot([rich, medium], '.')
    expect(result.avgWonder).toBe(39)
    expect(result.avgOrganization).toBe(14)
    expect(result.avgGuidingLight).toBe(16)
    expect(result.celestialMasterpieceCount).toBe(0)
    expect(result.lightlessVoidCount).toBe(1)
    expect(result.starlitCount).toBe(0)
    expect(result.moonlitCount).toBe(1)
    expect(result.plotType).toBe('window-box')
    expect(result.condition).toBe('dimly-lit-patch')
  })
})

// ─── buildStarlitGardenResult ──────────────────────────────────────────────

describe('buildStarlitGardenResult', () => {
  it('returns correct stats for RICH+MEDIUM', () => {
    const result = buildStarlitGardenResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalPlots).toBe(1)
    expect(result.stats.avgWonder).toBe(39)
    expect(result.stats.avgConstellationMapping).toBe(44)
    expect(result.stats.avgCelestialOrganization).toBe(14)
    expect(result.stats.avgNocturnalBeauty).toBe(20)
    expect(result.stats.avgNightBloom).toBe(54)
    expect(result.stats.avgGuidingLight).toBe(16)
    expect(result.stats.celestialMasterpieceCount).toBe(0)
    expect(result.stats.starlitParadiseCount).toBe(0)
    expect(result.stats.moonlitGardenCount).toBe(1)
    expect(result.stats.twilightPatchCount).toBe(0)
    expect(result.stats.darkCornerCount).toBe(0)
    expect(result.stats.lightlessVoidCount).toBe(1)
    expect(result.stats.overallLuminosity).toBe(28)
    expect(result.stats.astronomerGrade).toBe('casual-gazer')
  })

  it('returns correct best files', () => {
    const result = buildStarlitGardenResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.bestFlower).toBe('rich.ts')
    expect(result.stats.mostInspiring).toBe('rich.ts')
    expect(result.stats.bestOrganized).toBe('rich.ts')
    expect(result.stats.bestStructured).toBe('rich.ts')
    expect(result.stats.mostBeautiful).toBe('rich.ts')
    expect(result.stats.bestDocumented).toBe('rich.ts')
  })

  it('returns correct high-counts', () => {
    const result = buildStarlitGardenResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.hasHighInspirationCount).toBe(1)
    expect(result.stats.hasHighMappingCount).toBe(1)
    expect(result.stats.hasHighOrganizationCount).toBe(0)
    expect(result.stats.hasHighBeautyCount).toBe(0)
    expect(result.stats.hasHighNightValueCount).toBe(1)
    expect(result.stats.hasHighLightCount).toBe(0)
  })

  it('returns correct observatory data', () => {
    const result = buildStarlitGardenResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.observatory.avgWonder).toBe(39)
    expect(result.observatory.avgOrganization).toBe(29)
    expect(result.observatory.avgGuidingLight).toBe(16)
    expect(result.observatory.isWondrous).toBe(false)
    expect(result.observatory.overallLuminosity).toBe(28)
  })

  it('returns recommendations', () => {
    const result = buildStarlitGardenResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildStarlitGardenResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.flowers).toEqual([])
    expect(result.observatory.overallLuminosity).toBe(0)
    expect(result.stats.astronomerGrade).toBe('cloudy-night')
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string for all ranges', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(60)).toBe('string')
    expect(typeof scoreColor(40)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })

  it('aweColor handles all awe levels', () => {
    expect(typeof aweColor('transcendent-wonder')).toBe('string')
    expect(typeof aweColor('inspiring')).toBe('string')
    expect(typeof aweColor('noteworthy')).toBe('string')
    expect(typeof aweColor('pleasant')).toBe('string')
    expect(typeof aweColor('ordinary')).toBe('string')
    expect(typeof aweColor('uninspiring')).toBe('string')
  })

  it('patternColor handles all patterns', () => {
    expect(typeof patternColor('perfect-constellation')).toBe('string')
    expect(typeof patternColor('clear-star-map')).toBe('string')
    expect(typeof patternColor('recognizable-pattern')).toBe('string')
    expect(typeof patternColor('scattered-stars')).toBe('string')
    expect(typeof patternColor('random-dots')).toBe('string')
    expect(typeof patternColor('void')).toBe('string')
  })

  it('orderColor handles all orders', () => {
    expect(typeof orderColor('celestial-harmony')).toBe('string')
    expect(typeof orderColor('orbital-precision')).toBe('string')
    expect(typeof orderColor('proper-orbits')).toBe('string')
    expect(typeof orderColor('drifting')).toBe('string')
    expect(typeof orderColor('tumbling')).toBe('string')
    expect(typeof orderColor('chaotic-orbit')).toBe('string')
  })

  it('radianceColor handles all radiances', () => {
    expect(typeof radianceColor('moonlit-splendor')).toBe('string')
    expect(typeof radianceColor('starlit-elegance')).toBe('string')
    expect(typeof radianceColor('twilight-charm')).toBe('string')
    expect(typeof radianceColor('dim-glow')).toBe('string')
    expect(typeof radianceColor('dark-shadow')).toBe('string')
    expect(typeof radianceColor('pitch-black')).toBe('string')
  })

  it('bloomColor handles all blooms', () => {
    expect(typeof bloomColor('night-orchid')).toBe('string')
    expect(typeof bloomColor('moonflower')).toBe('string')
    expect(typeof bloomColor('evening-primrose')).toBe('string')
    expect(typeof bloomColor('twilight-jasmine')).toBe('string')
    expect(typeof bloomColor('shade-plant')).toBe('string')
    expect(typeof bloomColor('never-blooms')).toBe('string')
  })

  it('brightnessColor handles all brightness levels', () => {
    expect(typeof brightnessColor('lighthouse-beam')).toBe('string')
    expect(typeof brightnessColor('bright-star')).toBe('string')
    expect(typeof brightnessColor('lantern-glow')).toBe('string')
    expect(typeof brightnessColor('candle-flicker')).toBe('string')
    expect(typeof brightnessColor('dying-ember')).toBe('string')
    expect(typeof brightnessColor('darkness')).toBe('string')
  })

  it('conditionColor handles all conditions', () => {
    expect(typeof conditionColor('celestial-masterpiece')).toBe('string')
    expect(typeof conditionColor('starlit-paradise')).toBe('string')
    expect(typeof conditionColor('moonlit-garden')).toBe('string')
    expect(typeof conditionColor('twilight-patch')).toBe('string')
    expect(typeof conditionColor('dark-corner')).toBe('string')
    expect(typeof conditionColor('lightless-void')).toBe('string')
  })

  it('gradeColor handles all grades', () => {
    expect(typeof gradeColor('master-astronomer')).toBe('string')
    expect(typeof gradeColor('expert-stargazer')).toBe('string')
    expect(typeof gradeColor('skilled-observer')).toBe('string')
    expect(typeof gradeColor('amateur-astronomer')).toBe('string')
    expect(typeof gradeColor('casual-gazer')).toBe('string')
    expect(typeof gradeColor('cloudy-night')).toBe('string')
  })

  it('color helpers return input for unknown values', () => {
    expect(aweColor('unknown')).toBe('unknown')
    expect(patternColor('unknown')).toBe('unknown')
    expect(orderColor('unknown')).toBe('unknown')
    expect(radianceColor('unknown')).toBe('unknown')
    expect(bloomColor('unknown')).toBe('unknown')
    expect(brightnessColor('unknown')).toBe('unknown')
    expect(conditionColor('unknown')).toBe('unknown')
    expect(gradeColor('unknown')).toBe('unknown')
  })

  it('formatStarlitGardenJson returns valid JSON', () => {
    const result = buildStarlitGardenResult(['rich.ts'], [RICH])
    const json = formatStarlitGardenJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formatStarlitGardenTable returns string with header', () => {
    const result = buildStarlitGardenResult(['rich.ts'], [RICH])
    const table = formatStarlitGardenTable(result, false)
    expect(table).toContain('Starlit Garden Analysis')
    expect(table).toContain('Observatory')
    expect(table).toContain('Statistics')
  })

  it('formatStarlitGardenTable includes per-file details when verbose', () => {
    const result = buildStarlitGardenResult(['rich.ts'], [RICH])
    const table = formatStarlitGardenTable(result, true)
    expect(table).toContain('Per-File Flowers')
    expect(table).toContain('rich.ts')
  })

  it('formatStarlitGardenTable includes recommendations', () => {
    const result = buildStarlitGardenResult(['medium.ts'], [MEDIUM])
    const table = formatStarlitGardenTable(result, false)
    expect(table).toContain('Recommendations')
  })
})
