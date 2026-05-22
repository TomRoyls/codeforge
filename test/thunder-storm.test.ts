import { describe, expect, it } from 'vitest'

import {
  analyzeStormCell,
  analyzeStormCluster,
  buildThunderStormResult,
  classifyClusterCondition,
  classifyClusterType,
  classifyCondition,
  classifyMeteorologistGrade,
  countAccessModifiers,
  countAny,
  countArrows,
  countAsync,
  countClasses,
  countCommentedCode,
  countConsole,
  countDeepNested,
  countEnums,
  countExports,
  countFinally,
  countFunctions,
  countGenerics,
  countImportKeywords,
  countInterfaces,
  countJSDoc,
  countReadonly,
  countReexports,
  countStatic,
  countTernaries,
  countThrow,
  countTodos,
  countTryCatch,
  countTypeAliases,
  generateRecommendations,
  measureLightning,
  measurePressure,
  measureRainfall,
  measureStorm,
  measureThunder,
  measureWind,
} from '../src/commands/thunder-storm-helpers.js'

import { formatThunderStormJson, formatThunderStormTable } from '../src/commands/thunder-storm-format-helpers.js'

import type { StormCell } from '../src/commands/thunder-storm-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `/**
 * Complex module with full TypeScript features.
 * @example advanced usage
 */
export interface Animal {
  name: string
  age: number
}

export type Species = 'mammal' | 'bird' | 'reptile'

export enum Habitat {
  Forest = 'forest',
  Ocean = 'ocean',
  Desert = 'desert',
}

export class Creature {
  private readonly id: string
  protected name: string
  public species: Species

  static readonly MAX_AGE = 200

  constructor(id: string, name: string, species: Species) {
    this.id = id
    this.name = name
    this.species = species
  }

  async describe(): Promise<string> {
    try {
      return \`\${this.name} is a \${this.species}\`
    } catch {
      return 'unknown'
    }
  }
}

export function greet(name: string): string {
  return \`Hello \${name}\`
}

const arrow = (x: number) => x * 2

export { Creature }
export type { Animal } from './types.js'

`

const EMPTY = `// minimal file with nothing much
var x = 1
`

const MEDIUM = `export interface Config {
  name: string
}

export type Mode = 'dev' | 'prod'

export class AppConfig {
  private mode: Mode
  
  constructor(mode: Mode) {
    this.mode = mode
  }
}

export function init() {
  return new AppConfig('dev')
}

const setup = () => init()
`

// ─── Counter Tests ──────────────────────────────────────────────────────────

describe('thunder-storm counters', () => {
  it('countExports', () => {
    expect(countExports(RICH)).toBe(7)
    expect(countExports(EMPTY)).toBe(0)
  })

  it('countImportKeywords', () => {
    expect(countImportKeywords(EMPTY)).toBe(0)
  })

  it('countFunctions', () => {
    expect(countFunctions(RICH)).toBe(1)
    expect(countFunctions(EMPTY)).toBe(0)
  })

  it('countArrows', () => {
    expect(countArrows(RICH)).toBe(1)
    expect(countArrows(EMPTY)).toBe(0)
  })

  it('countClasses', () => {
    expect(countClasses(RICH)).toBe(1)
    expect(countClasses(EMPTY)).toBe(0)
  })

  it('countInterfaces', () => {
    expect(countInterfaces(RICH)).toBe(1)
    expect(countInterfaces(EMPTY)).toBe(0)
  })

  it('countTypeAliases', () => {
    expect(countTypeAliases(RICH)).toBe(1)
    expect(countTypeAliases(EMPTY)).toBe(0)
  })

  it('countEnums', () => {
    expect(countEnums(RICH)).toBe(1)
    expect(countEnums(EMPTY)).toBe(0)
  })

  it('countJSDoc', () => {
    expect(countJSDoc(RICH)).toBe(1)
    expect(countJSDoc(EMPTY)).toBe(0)
  })

  it('countAsync', () => {
    expect(countAsync(RICH)).toBe(1)
    expect(countAsync(EMPTY)).toBe(0)
  })

  it('countTryCatch', () => {
    expect(countTryCatch(RICH)).toBe(1)
    expect(countTryCatch(EMPTY)).toBe(0)
  })

  it('countDeepNested', () => {
    expect(countDeepNested(RICH)).toBe(1)
    expect(countDeepNested(EMPTY)).toBe(0)
  })

  it('countTernaries', () => {
    expect(countTernaries(RICH)).toBe(0)
    expect(countTernaries(EMPTY)).toBe(0)
  })

  it('countConsole', () => {
    expect(countConsole(RICH)).toBe(0)
    expect(countConsole(EMPTY)).toBe(0)
  })

  it('countTodos', () => {
    expect(countTodos(RICH)).toBe(0)
    expect(countTodos(EMPTY)).toBe(0)
  })

  it('countAny', () => {
    expect(countAny(RICH)).toBe(0)
    expect(countAny(EMPTY)).toBe(0)
  })

  it('countCommentedCode', () => {
    expect(countCommentedCode(RICH)).toBe(0)
    expect(countCommentedCode(EMPTY)).toBe(0)
  })

  it('countGenerics', () => {
    expect(countGenerics(RICH)).toBe(1)
    expect(countGenerics(EMPTY)).toBe(0)
  })

  it('countAccessModifiers', () => {
    expect(countAccessModifiers(RICH)).toBe(3)
    expect(countAccessModifiers(EMPTY)).toBe(0)
  })

  it('countStatic', () => {
    expect(countStatic(RICH)).toBe(1)
    expect(countStatic(EMPTY)).toBe(0)
  })

  it('countReadonly', () => {
    expect(countReadonly(RICH)).toBe(2)
    expect(countReadonly(EMPTY)).toBe(0)
  })

  it('countThrow', () => {
    expect(countThrow(RICH)).toBe(0)
    expect(countThrow(EMPTY)).toBe(0)
  })

  it('countFinally', () => {
    expect(countFinally(RICH)).toBe(0)
    expect(countFinally(EMPTY)).toBe(0)
  })
})

// ─── Measure Tests ──────────────────────────────────────────────────────────

describe('measureLightning', () => {
  it('RICH: has sheet lightning with intensity 65', () => {
    const result = measureLightning(RICH)
    expect(result.intensity).toBe(65)
    expect(result.type).toBe('sheet')
    expect(result.hasHighImpact).toBe(true)
    expect(result.hasNoMisfire).toBe(true)
    expect(result.hasNoStrayVoltage).toBe(true)
    expect(result.hasProperChannel).toBe(true)
    expect(result.hasReturnStroke).toBe(true)
    expect(result.hasSteppedLeader).toBe(true)
    expect(result.hasNoFlashover).toBe(true)
    expect(result.hasCloudToCloud).toBe(false)
    expect(result.hasGroundStrike).toBe(false)
    expect(result.hasPositiveStrike).toBe(false)
    expect(result.misfireCount).toBe(0)
    expect(result.strayVoltageCount).toBe(0)
  })

  it('EMPTY: has ball lightning with intensity 20', () => {
    const result = measureLightning(EMPTY)
    expect(result.intensity).toBe(20)
    expect(result.type).toBe('ball')
    expect(result.hasHighImpact).toBe(false)
    expect(result.hasProperChannel).toBe(false)
  })
})

describe('measureThunder', () => {
  it('RICH: has loud thunder with resonance 70', () => {
    const result = measureThunder(RICH)
    expect(result.resonance).toBe(70)
    expect(result.volume).toBe('loud')
    expect(result.hasWideReach).toBe(true)
    expect(result.hasLowFrequency).toBe(true)
    expect(result.hasClap).toBe(true)
    expect(result.hasRoll).toBe(true)
    expect(result.hasReverberation).toBe(true)
    expect(result.hasNoEchoChamber).toBe(false)
    expect(result.hasNoDeadZone).toBe(true)
    expect(result.hasNoInterference).toBe(true)
    expect(result.hasProperPropagation).toBe(false)
    expect(result.echoChamberCount).toBe(1)
    expect(result.deadZoneCount).toBe(0)
  })

  it('EMPTY: has rumble thunder with resonance 30', () => {
    const result = measureThunder(EMPTY)
    expect(result.resonance).toBe(30)
    expect(result.volume).toBe('rumble')
    expect(result.hasWideReach).toBe(false)
  })
})

describe('measureWind', () => {
  it('RICH: has tornado wind with force 75', () => {
    const result = measureWind(RICH)
    expect(result.force).toBe(75)
    expect(result.scale).toBe('tornado')
    expect(result.hasHighVelocity).toBe(true)
    expect(result.hasGustFront).toBe(true)
    expect(result.hasDownburst).toBe(true)
    expect(result.hasUplift).toBe(true)
    expect(result.hasConvergence).toBe(true)
    expect(result.hasDivergence).toBe(true)
    expect(result.hasNoCrosswind).toBe(true)
    expect(result.hasNoTurbulence).toBe(false)
    expect(result.hasProperDirection).toBe(false)
    expect(result.crosswindCount).toBe(0)
    expect(result.turbulenceCount).toBe(1)
  })

  it('EMPTY: has breeze wind with force 20', () => {
    const result = measureWind(EMPTY)
    expect(result.force).toBe(20)
    expect(result.scale).toBe('breeze')
    expect(result.hasHighVelocity).toBe(false)
  })
})

describe('measureRainfall', () => {
  it('RICH: has torrential rainfall with volume 90', () => {
    const result = measureRainfall(RICH)
    expect(result.volume).toBe(90)
    expect(result.intensity).toBe('torrential')
    expect(result.hasHighOutput).toBe(true)
    expect(result.hasProperDrainage).toBe(true)
    expect(result.hasNoFlooding).toBe(true)
    expect(result.hasNoDrought).toBe(true)
    expect(result.hasEvenDistribution).toBe(true)
    expect(result.hasPercolation).toBe(true)
    expect(result.hasRunoff).toBe(true)
    expect(result.hasNoErosion).toBe(true)
    expect(result.hasNoContamination).toBe(true)
    expect(result.floodingCount).toBe(0)
    expect(result.contaminationCount).toBe(0)
  })

  it('EMPTY: has drizzle rainfall with volume 20', () => {
    const result = measureRainfall(EMPTY)
    expect(result.volume).toBe(20)
    expect(result.intensity).toBe('drizzle')
    expect(result.hasHighOutput).toBe(false)
  })
})

describe('measurePressure', () => {
  it('RICH: has ridge pressure with level 75', () => {
    const result = measurePressure(RICH)
    expect(result.level).toBe(75)
    expect(result.system).toBe('ridge')
    expect(result.hasProperComplexity).toBe(true)
    expect(result.hasIsobarClarity).toBe(true)
    expect(result.hasFrontalSystem).toBe(true)
    expect(result.hasNoStagnation).toBe(true)
    expect(result.hasConvectionCell).toBe(true)
    expect(result.hasAdiabatic).toBe(true)
    expect(result.hasNoBarometricExtremes).toBe(false)
    expect(result.hasNoSupercell).toBe(false)
    expect(result.stagnationCount).toBe(0)
    expect(result.supercellCount).toBe(1)
  })

  it('EMPTY: has trough pressure with level 35', () => {
    const result = measurePressure(EMPTY)
    expect(result.level).toBe(35)
    expect(result.system).toBe('trough')
    expect(result.hasProperComplexity).toBe(false)
  })
})

describe('measureStorm', () => {
  it('RICH: has supercell storm with category 80', () => {
    const result = measureStorm(RICH)
    expect(result.category).toBe(80)
    expect(result.classification).toBe('supercell')
    expect(result.isPowerful).toBe(true)
    expect(result.hasOrganizedStructure).toBe(true)
    expect(result.hasRotation).toBe(true)
    expect(result.hasHookEcho).toBe(true)
    expect(result.hasMesocyclone).toBe(true)
    expect(result.hasProperLifeCycle).toBe(true)
    expect(result.hasCumulonimbus).toBe(true)
    expect(result.hasNoDissipation).toBe(true)
    expect(result.hasNoAnvilSpreading).toBe(false)
    expect(result.hasNoFunnelCloud).toBe(false)
    expect(result.dissipationCount).toBe(0)
    expect(result.funnelCount).toBe(1)
  })

  it('EMPTY: has clear-sky storm with category 30', () => {
    const result = measureStorm(EMPTY)
    expect(result.category).toBe(30)
    expect(result.classification).toBe('clear-sky')
    expect(result.isPowerful).toBe(false)
    expect(result.hasOrganizedStructure).toBe(false)
  })
})

// ─── Classifier Tests ───────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies all conditions correctly', () => {
    expect(classifyCondition(85)).toBe('category-5')
    expect(classifyCondition(70)).toBe('category-4')
    expect(classifyCondition(55)).toBe('category-3')
    expect(classifyCondition(40)).toBe('category-2')
    expect(classifyCondition(25)).toBe('tropical-storm')
    expect(classifyCondition(10)).toBe('clear-day')
  })
})

describe('classifyClusterCondition', () => {
  it('classifies all cluster conditions correctly', () => {
    expect(classifyClusterCondition(85)).toBe('apocalyptic')
    expect(classifyClusterCondition(70)).toBe('severe')
    expect(classifyClusterCondition(55)).toBe('moderate')
    expect(classifyClusterCondition(40)).toBe('mild')
    expect(classifyClusterCondition(25)).toBe('fair')
    expect(classifyClusterCondition(10)).toBe('sunny')
  })
})

describe('classifyMeteorologistGrade', () => {
  it('classifies all grades correctly', () => {
    expect(classifyMeteorologistGrade(85)).toBe('chief-meteorologist')
    expect(classifyMeteorologistGrade(70)).toBe('senior-forecaster')
    expect(classifyMeteorologistGrade(55)).toBe('meteorologist')
    expect(classifyMeteorologistGrade(40)).toBe('weather-observer')
    expect(classifyMeteorologistGrade(25)).toBe('storm-chaser')
    expect(classifyMeteorologistGrade(10)).toBe('umbrella-carrier')
  })
})

describe('classifyClusterType', () => {
  it('classifies hurricane for high quality with many cat5', () => {
    const cells = [
      { qualityScore: 85, condition: 'category-5' },
      { qualityScore: 80, condition: 'category-5' },
      { qualityScore: 70, condition: 'category-4' },
    ] as StormCell[]
    expect(classifyClusterType(cells)).toBe('hurricane')
  })

  it('classifies typhoon for avg >= 60', () => {
    const cells = [
      { qualityScore: 60, condition: 'category-3' },
      { qualityScore: 65, condition: 'category-4' },
    ] as StormCell[]
    expect(classifyClusterType(cells)).toBe('typhoon')
  })

  it('classifies cyclone for avg >= 45', () => {
    const cells = [{ qualityScore: 45, condition: 'category-2' }] as StormCell[]
    expect(classifyClusterType(cells)).toBe('cyclone')
  })

  it('classifies drought for empty cells', () => {
    expect(classifyClusterType([])).toBe('drought')
  })
})

// ─── Cell Analysis Tests ────────────────────────────────────────────────────

describe('analyzeStormCell', () => {
  it('RICH: produces correct cell', () => {
    const cell = analyzeStormCell(RICH, 'src/rich.ts')
    expect(cell.file).toBe('src/rich.ts')
    expect(cell.qualityScore).toBe(75)
    expect(cell.condition).toBe('category-4')
    expect(cell.lightningIntensity).toBe(65)
    expect(cell.thunderResonance).toBe(70)
    expect(cell.windForce).toBe(75)
    expect(cell.rainfallVolume).toBe(90)
    expect(cell.atmosphericPressure).toBe(75)
    expect(cell.stormCategory).toBe(80)
  })

  it('EMPTY: produces correct cell', () => {
    const cell = analyzeStormCell(EMPTY, 'src/empty.ts')
    expect(cell.file).toBe('src/empty.ts')
    expect(cell.qualityScore).toBe(26)
    expect(cell.condition).toBe('tropical-storm')
    expect(cell.lightningIntensity).toBe(20)
    expect(cell.thunderResonance).toBe(30)
    expect(cell.windForce).toBe(20)
    expect(cell.rainfallVolume).toBe(20)
    expect(cell.atmosphericPressure).toBe(35)
    expect(cell.stormCategory).toBe(30)
  })

  it('MEDIUM: produces correct cell', () => {
    const cell = analyzeStormCell(MEDIUM, 'src/medium.ts')
    expect(cell.file).toBe('src/medium.ts')
    expect(cell.qualityScore).toBe(65)
    expect(cell.condition).toBe('category-4')
    expect(cell.lightningIntensity).toBe(55)
    expect(cell.thunderResonance).toBe(80)
    expect(cell.windForce).toBe(55)
    expect(cell.rainfallVolume).toBe(55)
    expect(cell.atmosphericPressure).toBe(70)
    expect(cell.stormCategory).toBe(70)
  })
})

// ─── Build Result Tests ─────────────────────────────────────────────────────

describe('buildThunderStormResult', () => {
  it('RICH+EMPTY+MEDIUM: produces correct 3-file result', () => {
    const result = buildThunderStormResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.atmosphere.overallPower).toBe(55)
    expect(result.atmosphere.avgIntensity).toBe(47)
    expect(result.atmosphere.avgReach).toBe(60)
    expect(result.atmosphere.avgPower).toBe(60)
    expect(result.atmosphere.isElectrifying).toBe(false)
    expect(result.cells.length).toBe(3)
    expect(result.clusters.length).toBe(1)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalClusters).toBe(1)
    expect(result.stats.category5Count).toBe(0)
    expect(result.stats.category4Count).toBe(2)
    expect(result.stats.category3Count).toBe(0)
    expect(result.stats.category2Count).toBe(0)
    expect(result.stats.tropicalStormCount).toBe(1)
    expect(result.stats.clearDayCount).toBe(0)
    expect(result.stats.hasHighImpactCount).toBe(2)
    expect(result.stats.hasWideReachCount).toBe(2)
    expect(result.stats.hasHighVelocityCount).toBe(2)
    expect(result.stats.hasHighOutputCount).toBe(2)
    expect(result.stats.hasProperComplexityCount).toBe(2)
    expect(result.stats.isPowerfulCount).toBe(2)
    expect(result.stats.overallPower).toBe(55)
    expect(result.stats.meteorologistGrade).toBe('meteorologist')
    expect(result.stats.bestCell).toBe('src/rich.ts')
    expect(result.stats.mostIntense).toBe('src/rich.ts')
    expect(result.stats.widestReach).toBe('src/medium.ts')
    expect(result.stats.fastest).toBe('src/rich.ts')
    expect(result.stats.highestOutput).toBe('src/rich.ts')
    expect(result.stats.mostPowerful).toBe('src/rich.ts')
  })

  it('EMPTY: produces zero result', () => {
    const result = buildThunderStormResult([], [])
    expect(result.atmosphere.overallPower).toBe(0)
    expect(result.atmosphere.isElectrifying).toBe(false)
    expect(result.cells.length).toBe(0)
    expect(result.clusters.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.meteorologistGrade).toBe('umbrella-carrier')
    expect(result.stats.bestCell).toBe('')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into separate clusters by directory', () => {
    const result = buildThunderStormResult(
      ['src/foo/a.ts', 'src/bar/b.ts'],
      [RICH, EMPTY],
    )
    expect(result.clusters.length).toBe(2)
    expect(result.clusters[0].directory).toBe('src/foo')
    expect(result.clusters[1].directory).toBe('src/bar')
  })

  it('handles file without directory separator as dot directory', () => {
    const result = buildThunderStormResult(
      ['simple.ts'],
      [EMPTY],
    )
    expect(result.clusters.length).toBe(1)
    expect(result.clusters[0].directory).toBe('.')
  })
})

// ─── Recommendations Tests ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends flattening turbulence for 3-file mix', () => {
    const result = buildThunderStormResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.recommendations).toContain('1 cell/cells have deep nesting turbulence — flatten nested structures')
  })

  it('warns about low storm power for empty', () => {
    const result = buildThunderStormResult(['src/empty.ts'], [EMPTY])
    expect(result.recommendations.some((r) => r.includes('low'))).toBe(true)
  })
})

// ─── Format Helpers Tests ───────────────────────────────────────────────────

describe('formatThunderStormJson', () => {
  it('returns valid JSON string', () => {
    const result = buildThunderStormResult(['src/rich.ts'], [RICH])
    const json = formatThunderStormJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.cells.length).toBe(1)
    expect(parsed.atmosphere.overallPower).toBe(result.atmosphere.overallPower)
  })
})

describe('formatThunderStormTable', () => {
  it('returns formatted table string', () => {
    const result = buildThunderStormResult(['src/rich.ts'], [RICH])
    const table = formatThunderStormTable(result, false)
    expect(table).toContain('Thunder Storm Analysis')
    expect(table).toContain('Atmosphere Overview')
    expect(table).toContain('Statistics')
  })

  it('includes per-cell breakdown when verbose', () => {
    const result = buildThunderStormResult(['src/rich.ts'], [RICH])
    const table = formatThunderStormTable(result, true)
    expect(table).toContain('Per-Cell Breakdown')
    expect(table).toContain('src/rich.ts')
  })

  it('includes clusters section when clusters exist', () => {
    const result = buildThunderStormResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const table = formatThunderStormTable(result, false)
    expect(table).toContain('Clusters')
  })

  it('includes recommendations section', () => {
    const result = buildThunderStormResult(['src/empty.ts'], [EMPTY])
    const table = formatThunderStormTable(result, false)
    expect(table).toContain('Recommendations')
  })
})

// ─── Additional Measure Tests ───────────────────────────────────────────────

describe('measureLightning MEDIUM', () => {
  it('MEDIUM: has sheet lightning with intensity 55', () => {
    const result = measureLightning(MEDIUM)
    expect(result.intensity).toBe(55)
    expect(result.type).toBe('sheet')
    expect(result.hasHighImpact).toBe(true)
    expect(result.hasProperChannel).toBe(true)
    expect(result.hasSteppedLeader).toBe(true)
    expect(result.hasReturnStroke).toBe(false)
    expect(result.hasCloudToCloud).toBe(false)
    expect(result.hasGroundStrike).toBe(false)
  })
})

describe('measureThunder MEDIUM', () => {
  it('MEDIUM: has deafening thunder with resonance 80', () => {
    const result = measureThunder(MEDIUM)
    expect(result.resonance).toBe(80)
    expect(result.volume).toBe('deafening')
    expect(result.hasWideReach).toBe(true)
    expect(result.hasLowFrequency).toBe(true)
    expect(result.hasClap).toBe(true)
    expect(result.hasRoll).toBe(true)
    expect(result.hasNoEchoChamber).toBe(true)
    expect(result.hasNoDeadZone).toBe(true)
    expect(result.hasProperPropagation).toBe(false)
  })
})

describe('measureWind MEDIUM', () => {
  it('MEDIUM: has gale wind with force 55', () => {
    const result = measureWind(MEDIUM)
    expect(result.force).toBe(55)
    expect(result.scale).toBe('gale')
    expect(result.hasHighVelocity).toBe(true)
    expect(result.hasUplift).toBe(true)
    expect(result.hasDivergence).toBe(true)
    expect(result.hasDownburst).toBe(false)
    expect(result.hasGustFront).toBe(false)
    expect(result.hasNoTurbulence).toBe(true)
    expect(result.hasNoCrosswind).toBe(true)
  })
})

describe('measureRainfall MEDIUM', () => {
  it('MEDIUM: has moderate rainfall with volume 55', () => {
    const result = measureRainfall(MEDIUM)
    expect(result.volume).toBe(55)
    expect(result.intensity).toBe('moderate')
    expect(result.hasHighOutput).toBe(true)
    expect(result.hasEvenDistribution).toBe(true)
    expect(result.hasProperDrainage).toBe(false)
    expect(result.hasPercolation).toBe(false)
  })
})

describe('measurePressure MEDIUM', () => {
  it('MEDIUM: has ridge pressure with level 70', () => {
    const result = measurePressure(MEDIUM)
    expect(result.level).toBe(70)
    expect(result.system).toBe('ridge')
    expect(result.hasProperComplexity).toBe(true)
    expect(result.hasIsobarClarity).toBe(true)
    expect(result.hasFrontalSystem).toBe(true)
    expect(result.hasNoBarometricExtremes).toBe(true)
    expect(result.hasConvectionCell).toBe(false)
    expect(result.hasAdiabatic).toBe(false)
  })
})

describe('measureStorm MEDIUM', () => {
  it('MEDIUM: has squall-line storm with category 70', () => {
    const result = measureStorm(MEDIUM)
    expect(result.category).toBe(70)
    expect(result.classification).toBe('squall-line')
    expect(result.isPowerful).toBe(true)
    expect(result.hasOrganizedStructure).toBe(true)
    expect(result.hasRotation).toBe(true)
    expect(result.hasHookEcho).toBe(true)
    expect(result.hasMesocyclone).toBe(false)
    expect(result.hasCumulonimbus).toBe(false)
    expect(result.hasNoDissipation).toBe(true)
  })
})

describe('buildThunderStormResult single file', () => {
  it('RICH: produces correct single-file result', () => {
    const result = buildThunderStormResult(['src/rich.ts'], [RICH])
    expect(result.cells.length).toBe(1)
    expect(result.cells[0].qualityScore).toBe(75)
    expect(result.cells[0].condition).toBe('category-4')
    expect(result.atmosphere.overallPower).toBe(75)
    expect(result.atmosphere.isElectrifying).toBe(true)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.category4Count).toBe(1)
    expect(result.stats.meteorologistGrade).toBe('senior-forecaster')
    expect(result.stats.bestCell).toBe('src/rich.ts')
  })
})

describe('analyzeStormCluster', () => {
  it('computes cluster averages correctly', () => {
    const cells = [
      analyzeStormCell(RICH, 'src/rich.ts'),
      analyzeStormCell(EMPTY, 'src/empty.ts'),
    ]
    const cluster = analyzeStormCluster(cells, 'src')
    expect(cluster.directory).toBe('src')
    expect(cluster.cells.length).toBe(2)
    expect(cluster.avgIntensity).toBe(43)
    expect(cluster.avgPower).toBe(51)
    expect(cluster.clusterType).toBe('cyclone')
    expect(cluster.cat5Count).toBe(0)
    expect(cluster.clearDayCount).toBe(0)
  })

  it('computes cluster counts correctly for mixed cells', () => {
    const cells = [
      analyzeStormCell(RICH, 'src/rich.ts'),
      analyzeStormCell(MEDIUM, 'src/medium.ts'),
    ]
    const cluster = analyzeStormCluster(cells, 'src')
    expect(cluster.highImpactCount).toBe(2)
    expect(cluster.powerfulCount).toBe(2)
    expect(cluster.cat5Count).toBe(0)
    expect(cluster.condition).toBe('severe')
  })
})
