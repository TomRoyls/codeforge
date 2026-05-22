import { describe, expect, it } from 'vitest'

import {
  analyzeRouteNetwork,
  analyzeTradeRoute,
  buildSpiceRouteResult,
  classifyCondition,
  classifyMerchantGrade,
  classifyNetworkCondition,
  classifyNetworkType,
  generateRecommendations,
  measureCargo,
  measureEfficiency,
  measureExchange,
  measureJourney,
  measureRoute,
  measureWaypoint,
} from '../src/commands/spice-route-helpers.js'

import {
  conditionColor,
  formatSpiceRouteJson,
  formatSpiceRouteTable,
  gradeColor,
  networkTypeColor,
  scoreColor,
} from '../src/commands/spice-route-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface AuroraConfig {
  readonly id: string
  name: string
  intensity: number
  colors: string[]
  isActive: boolean
}

export class AuroraCalculator<T extends AuroraConfig> {
  private configs: T[] = []
  protected maxIntensity: number = 100

  constructor(initialConfigs?: T[]) {
    if (initialConfigs) {
      this.configs = initialConfigs
    }
  }

  async calculateIntensity(config: T): Promise<number> {
    try {
      const base = config.intensity
      const multiplier = config.isActive ? 2.0 : 0.5
      const result = Math.min(this.maxIntensity, base * multiplier)
      return Math.round(result)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      }
      return 0
    }
  }

  static createDefault(): AuroraCalculator<AuroraConfig> {
    return new AuroraCalculator<AuroraConfig>()
  }
}

/** Calculates aurora brightness */
export function calculateBrightness(colors: string[]): number {
  const green = colors.filter(c => c.includes('green'))
  return green.length * 10
}

export type AuroraPhase = 'dawn' | 'dusk' | 'night' | 'peak'
export enum AuroraType { BAND = 'band', CURTAIN = 'curtain', CORONA = 'corona' }
`

const EMPTY = ''

const MEDIUM = `export class Calculator {
  private value: number = 0

  constructor(initial: number) {
    this.value = initial
  }

  add(x: number): number {
    return this.value + x
  }

  subtract(x: number): number {
    return this.value - x
  }
}

export interface Config {
  name: string
  max: number
}

/** Helper function */
export function process(input: string): string {
  return input.toUpperCase()
}
`

// ─── measureRoute ──────────────────────────────────────────────────────────

describe('measureRoute', () => {
  it('returns clarity 90 for RICH fixture', () => {
    expect(measureRoute(RICH).clarity).toBe(90)
  })

  it('returns clarity 37 for EMPTY fixture', () => {
    expect(measureRoute(EMPTY).clarity).toBe(37)
  })

  it('returns clarity 90 for MEDIUM fixture', () => {
    expect(measureRoute(MEDIUM).clarity).toBe(90)
  })

  it('returns type maritime for RICH', () => {
    expect(measureRoute(RICH).type).toBe('maritime')
  })

  it('returns type salt-route for EMPTY', () => {
    expect(measureRoute(EMPTY).type).toBe('salt-route')
  })

  it('returns type silk-road for MEDIUM', () => {
    expect(measureRoute(MEDIUM).type).toBe('silk-road')
  })

  it('hasClearFlow true for RICH', () => {
    expect(measureRoute(RICH).hasClearFlow).toBe(true)
  })

  it('hasClearFlow false for EMPTY', () => {
    expect(measureRoute(EMPTY).hasClearFlow).toBe(false)
  })

  it('hasNoDeadEnds true for RICH', () => {
    expect(measureRoute(RICH).hasNoDeadEnds).toBe(true)
  })

  it('hasNoBanditZones false for RICH (deepNested)', () => {
    expect(measureRoute(RICH).hasNoBanditZones).toBe(false)
  })

  it('hasProperSignage true for RICH', () => {
    expect(measureRoute(RICH).hasProperSignage).toBe(true)
  })

  it('hasRestStops true for RICH', () => {
    expect(measureRoute(RICH).hasRestStops).toBe(true)
  })

  it('hasCaravanCapacity true for RICH', () => {
    expect(measureRoute(RICH).hasCaravanCapacity).toBe(true)
  })

  it('hasNoTollPoints false for RICH (console)', () => {
    expect(measureRoute(RICH).hasNoTollPoints).toBe(false)
  })

  it('deadEndCount is 0 for RICH', () => {
    expect(measureRoute(RICH).deadEndCount).toBe(0)
  })

  it('tollPointCount is 1 for RICH', () => {
    expect(measureRoute(RICH).tollPointCount).toBe(1)
  })
})

// ─── measureCargo ──────────────────────────────────────────────────────────

describe('measureCargo', () => {
  it('returns value 91 for RICH', () => {
    expect(measureCargo(RICH).value).toBe(91)
  })

  it('returns value 26 for EMPTY', () => {
    expect(measureCargo(EMPTY).value).toBe(26)
  })

  it('returns value 76 for MEDIUM', () => {
    expect(measureCargo(MEDIUM).value).toBe(76)
  })

  it('returns type cinnamon for RICH', () => {
    expect(measureCargo(RICH).type).toBe('cinnamon')
  })

  it('returns type sawdust for EMPTY', () => {
    expect(measureCargo(EMPTY).type).toBe('sawdust')
  })

  it('returns type nutmeg for MEDIUM', () => {
    expect(measureCargo(MEDIUM).type).toBe('nutmeg')
  })

  it('hasHighValue true for RICH', () => {
    expect(measureCargo(RICH).hasHighValue).toBe(true)
  })

  it('hasTradeSecret true for RICH', () => {
    expect(measureCargo(RICH).hasTradeSecret).toBe(true)
  })

  it('hasNoContamination false for RICH (console)', () => {
    expect(measureCargo(RICH).hasNoContamination).toBe(false)
  })

  it('isProperlyPackaged true for RICH', () => {
    expect(measureCargo(RICH).isProperlyPackaged).toBe(true)
  })

  it('contaminationCount is 1 for RICH', () => {
    expect(measureCargo(RICH).contaminationCount).toBe(1)
  })

  it('contrabandCount is 0 for RICH', () => {
    expect(measureCargo(RICH).contrabandCount).toBe(0)
  })

  it('hasProperLabeling true for RICH', () => {
    expect(measureCargo(RICH).hasProperLabeling).toBe(true)
  })
})

// ─── measureWaypoint ───────────────────────────────────────────────────────

describe('measureWaypoint', () => {
  it('returns quality 92 for RICH', () => {
    expect(measureWaypoint(RICH).quality).toBe(92)
  })

  it('returns quality 32 for EMPTY', () => {
    expect(measureWaypoint(EMPTY).quality).toBe(32)
  })

  it('returns quality 79 for MEDIUM', () => {
    expect(measureWaypoint(MEDIUM).quality).toBe(79)
  })

  it('returns type customs-house for RICH', () => {
    expect(measureWaypoint(RICH).type).toBe('customs-house')
  })

  it('returns type bandit-camp for EMPTY', () => {
    expect(measureWaypoint(EMPTY).type).toBe('bandit-camp')
  })

  it('returns type caravanserai for MEDIUM', () => {
    expect(measureWaypoint(MEDIUM).type).toBe('caravanserai')
  })

  it('hasQualityControl true for RICH', () => {
    expect(measureWaypoint(RICH).hasQualityControl).toBe(true)
  })

  it('hasNoCorruptOfficials false for RICH', () => {
    expect(measureWaypoint(RICH).hasNoCorruptOfficials).toBe(false)
  })

  it('hasNoBlockage false for RICH', () => {
    expect(measureWaypoint(RICH).hasNoBlockage).toBe(false)
  })

  it('corruptCount is 1 for RICH', () => {
    expect(measureWaypoint(RICH).corruptCount).toBe(1)
  })

  it('blockageCount is 1 for RICH', () => {
    expect(measureWaypoint(RICH).blockageCount).toBe(1)
  })

  it('hasProperSecurity true for RICH', () => {
    expect(measureWaypoint(RICH).hasProperSecurity).toBe(true)
  })
})

// ─── measureEfficiency ─────────────────────────────────────────────────────

describe('measureEfficiency', () => {
  it('returns level 91 for RICH', () => {
    expect(measureEfficiency(RICH).level).toBe(91)
  })

  it('returns level 30 for EMPTY', () => {
    expect(measureEfficiency(EMPTY).level).toBe(30)
  })

  it('returns level 77 for MEDIUM', () => {
    expect(measureEfficiency(MEDIUM).level).toBe(77)
  })

  it('returns mode caravan for RICH', () => {
    expect(measureEfficiency(RICH).mode).toBe('caravan')
  })

  it('returns mode abandoned for EMPTY', () => {
    expect(measureEfficiency(EMPTY).mode).toBe('abandoned')
  })

  it('returns mode clipper-ship for MEDIUM', () => {
    expect(measureEfficiency(MEDIUM).mode).toBe('clipper-ship')
  })

  it('hasHighEfficiency true for RICH', () => {
    expect(measureEfficiency(RICH).hasHighEfficiency).toBe(true)
  })

  it('hasNoWaste false for RICH', () => {
    expect(measureEfficiency(RICH).hasNoWaste).toBe(false)
  })

  it('wasteCount is 1 for RICH', () => {
    expect(measureEfficiency(RICH).wasteCount).toBe(1)
  })

  it('stormCount is 1 for RICH', () => {
    expect(measureEfficiency(RICH).stormCount).toBe(1)
  })

  it('hasWindAssistance true for RICH', () => {
    expect(measureEfficiency(RICH).hasWindAssistance).toBe(true)
  })
})

// ─── measureExchange ───────────────────────────────────────────────────────

describe('measureExchange', () => {
  it('returns level 80 for RICH', () => {
    expect(measureExchange(RICH).level).toBe(80)
  })

  it('returns level 27 for EMPTY', () => {
    expect(measureExchange(EMPTY).level).toBe(27)
  })

  it('returns level 71 for MEDIUM', () => {
    expect(measureExchange(MEDIUM).level).toBe(71)
  })

  it('returns culture dialect for RICH', () => {
    expect(measureExchange(RICH).culture).toBe('dialect')
  })

  it('returns culture xenophobic for EMPTY', () => {
    expect(measureExchange(EMPTY).culture).toBe('xenophobic')
  })

  it('returns culture isolated for MEDIUM', () => {
    expect(measureExchange(MEDIUM).culture).toBe('isolated')
  })

  it('hasCulturalExchange true for RICH', () => {
    expect(measureExchange(RICH).hasCulturalExchange).toBe(true)
  })

  it('hasNoTradeBarrier false for RICH', () => {
    expect(measureExchange(RICH).hasNoTradeBarrier).toBe(false)
  })

  it('hasDiplomaticRelations false for RICH (no imports)', () => {
    expect(measureExchange(RICH).hasDiplomaticRelations).toBe(false)
  })

  it('barrierCount is 1 for RICH', () => {
    expect(measureExchange(RICH).barrierCount).toBe(1)
  })

  it('embargoCount is 0 for RICH', () => {
    expect(measureExchange(RICH).embargoCount).toBe(0)
  })
})

// ─── measureJourney ────────────────────────────────────────────────────────

describe('measureJourney', () => {
  it('returns success 98 for RICH', () => {
    expect(measureJourney(RICH).success).toBe(98)
  })

  it('returns success 26 for EMPTY', () => {
    expect(measureJourney(EMPTY).success).toBe(26)
  })

  it('returns success 76 for MEDIUM', () => {
    expect(measureJourney(MEDIUM).success).toBe(76)
  })

  it('returns status broke-even for RICH', () => {
    expect(measureJourney(RICH).status).toBe('broke-even')
  })

  it('returns status never-left for EMPTY', () => {
    expect(measureJourney(EMPTY).status).toBe('never-left')
  })

  it('returns status partial-loss for MEDIUM', () => {
    expect(measureJourney(MEDIUM).status).toBe('partial-loss')
  })

  it('isSuccessful true for RICH', () => {
    expect(measureJourney(RICH).isSuccessful).toBe(true)
  })

  it('hasCompleteJourney true for RICH', () => {
    expect(measureJourney(RICH).hasCompleteJourney).toBe(true)
  })

  it('hasNoPirates false for RICH', () => {
    expect(measureJourney(RICH).hasNoPirates).toBe(false)
  })

  it('hasTreasure true for RICH', () => {
    expect(measureJourney(RICH).hasTreasure).toBe(true)
  })

  it('hasLegacy true for RICH', () => {
    expect(measureJourney(RICH).hasLegacy).toBe(true)
  })

  it('pirateCount is 2 for RICH', () => {
    expect(measureJourney(RICH).pirateCount).toBe(2)
  })

  it('desertionCount is 0 for RICH', () => {
    expect(measureJourney(RICH).desertionCount).toBe(0)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns golden-age for qualityScore >= 80', () => {
    const route = { qualityScore: 91 } as any
    expect(classifyCondition(route)).toBe('golden-age')
  })

  it('returns prosperous for qualityScore >= 65', () => {
    const route = { qualityScore: 78 } as any
    expect(classifyCondition(route)).toBe('prosperous')
  })

  it('returns thriving for qualityScore >= 50', () => {
    const route = { qualityScore: 55 } as any
    expect(classifyCondition(route)).toBe('thriving')
  })

  it('returns surviving for qualityScore >= 35', () => {
    const route = { qualityScore: 40 } as any
    expect(classifyCondition(route)).toBe('surviving')
  })

  it('returns struggling for qualityScore >= 20', () => {
    const route = { qualityScore: 30 } as any
    expect(classifyCondition(route)).toBe('struggling')
  })

  it('returns collapsed for qualityScore < 20', () => {
    const route = { qualityScore: 10 } as any
    expect(classifyCondition(route)).toBe('collapsed')
  })
})

// ─── analyzeTradeRoute ─────────────────────────────────────────────────────

describe('analyzeTradeRoute', () => {
  it('returns qualityScore 91 for RICH', () => {
    const result = analyzeTradeRoute(RICH, 'rich.ts')
    expect(result.qualityScore).toBe(91)
  })

  it('returns qualityScore 30 for EMPTY', () => {
    const result = analyzeTradeRoute(EMPTY, 'empty.ts')
    expect(result.qualityScore).toBe(30)
  })

  it('returns qualityScore 78 for MEDIUM', () => {
    const result = analyzeTradeRoute(MEDIUM, 'medium.ts')
    expect(result.qualityScore).toBe(78)
  })

  it('returns golden-age condition for RICH', () => {
    expect(analyzeTradeRoute(RICH, 'rich.ts').condition).toBe('golden-age')
  })

  it('returns struggling condition for EMPTY', () => {
    expect(analyzeTradeRoute(EMPTY, 'empty.ts').condition).toBe('struggling')
  })

  it('returns prosperous condition for MEDIUM', () => {
    expect(analyzeTradeRoute(MEDIUM, 'medium.ts').condition).toBe('prosperous')
  })

  it('stores correct file path', () => {
    expect(analyzeTradeRoute(RICH, 'my-file.ts').file).toBe('my-file.ts')
  })

  it('routeClarity matches route clarity', () => {
    const result = analyzeTradeRoute(RICH, 'rich.ts')
    expect(result.routeClarity).toBe(90)
  })

  it('cargoValue matches cargo value', () => {
    const result = analyzeTradeRoute(RICH, 'rich.ts')
    expect(result.cargoValue).toBe(91)
  })
})

// ─── classifyNetworkType ───────────────────────────────────────────────────

describe('classifyNetworkType', () => {
  it('returns dead-end for empty array', () => {
    expect(classifyNetworkType([])).toBe('dead-end')
  })

  it('returns grand-trunk for high quality with enough golden-age', () => {
    const routes = Array.from({ length: 5 }, () => ({ qualityScore: 90, condition: 'golden-age' } as any))
    expect(classifyNetworkType(routes)).toBe('grand-trunk')
  })

  it('returns maritime-network for avgQuality >= 60', () => {
    const routes = [{ qualityScore: 64, condition: 'prosperous' } as any]
    expect(classifyNetworkType(routes)).toBe('maritime-network')
  })

  it('returns silk-network for avgQuality >= 45', () => {
    const routes = [{ qualityScore: 50, condition: 'thriving' } as any]
    expect(classifyNetworkType(routes)).toBe('silk-network')
  })

  it('returns regional-trade for avgQuality >= 30', () => {
    const routes = [{ qualityScore: 35, condition: 'surviving' } as any]
    expect(classifyNetworkType(routes)).toBe('regional-trade')
  })

  it('returns local-market for avgQuality >= 15', () => {
    const routes = [{ qualityScore: 20, condition: 'struggling' } as any]
    expect(classifyNetworkType(routes)).toBe('local-market')
  })
})

// ─── classifyNetworkCondition ──────────────────────────────────────────────

describe('classifyNetworkCondition', () => {
  it('returns global-emporium for avg >= 80', () => {
    expect(classifyNetworkCondition(85)).toBe('global-emporium')
  })

  it('returns trading-bloc for avg >= 65', () => {
    expect(classifyNetworkCondition(70)).toBe('trading-bloc')
  })

  it('returns merchant-guild for avg >= 50', () => {
    expect(classifyNetworkCondition(55)).toBe('merchant-guild')
  })

  it('returns village-market for avg >= 35', () => {
    expect(classifyNetworkCondition(40)).toBe('village-market')
  })

  it('returns barter-system for avg >= 20', () => {
    expect(classifyNetworkCondition(25)).toBe('barter-system')
  })

  it('returns subsistence for avg < 20', () => {
    expect(classifyNetworkCondition(10)).toBe('subsistence')
  })
})

// ─── classifyMerchantGrade ─────────────────────────────────────────────────

describe('classifyMerchantGrade', () => {
  it('returns grand-merchant for >= 80', () => {
    expect(classifyMerchantGrade(85)).toBe('grand-merchant')
  })

  it('returns master-trader for >= 65', () => {
    expect(classifyMerchantGrade(70)).toBe('master-trader')
  })

  it('returns merchant for >= 50', () => {
    expect(classifyMerchantGrade(55)).toBe('merchant')
  })

  it('returns peddler for >= 35', () => {
    expect(classifyMerchantGrade(40)).toBe('peddler')
  })

  it('returns hawker for >= 20', () => {
    expect(classifyMerchantGrade(25)).toBe('hawker')
  })

  it('returns beggar for < 20', () => {
    expect(classifyMerchantGrade(15)).toBe('beggar')
  })
})

// ─── analyzeRouteNetwork ───────────────────────────────────────────────────

describe('analyzeRouteNetwork', () => {
  it('returns dead-end network for empty routes', () => {
    const result = analyzeRouteNetwork([], 'empty-dir')
    expect(result.networkType).toBe('dead-end')
    expect(result.condition).toBe('subsistence')
    expect(result.routes).toHaveLength(0)
  })

  it('computes correct averages for single route', () => {
    const route = analyzeTradeRoute(RICH, 'rich.ts')
    const result = analyzeRouteNetwork([route], 'src')
    expect(result.avgClarity).toBe(90)
    expect(result.avgEfficiency).toBe(91)
    expect(result.avgSuccess).toBe(98)
    expect(result.goldenAgeCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns praise when all averages are high', () => {
    const routes = [analyzeTradeRoute(RICH, 'rich.ts')]
    const result = buildSpiceRouteResult(['rich.ts'], [RICH])
    const recs = generateRecommendations(routes, result.networks, result.world, result.stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('Golden age')
  })

  it('suggests improving route clarity when low', () => {
    const stats = {
      avgRouteClarity: 30, avgCargoValue: 80, avgWaypointQuality: 80,
      avgTradeEfficiency: 80, avgCulturalExchange: 80, avgJourneySuccess: 80,
      collapsedCount: 0, isSuccessfulCount: 1, overallProsperity: 80,
    } as any
    const recs = generateRecommendations([], [], { overallProsperity: 80 } as any, stats)
    expect(recs.some((r) => r.includes('route clarity'))).toBe(true)
  })

  it('warns about collapsed routes', () => {
    const routes = Array.from({ length: 4 }, () => ({ condition: 'collapsed' } as any))
    const stats = {
      avgRouteClarity: 80, avgCargoValue: 80, avgWaypointQuality: 80,
      avgTradeEfficiency: 80, avgCulturalExchange: 80, avgJourneySuccess: 80,
      collapsedCount: 3, isSuccessfulCount: 1, overallProsperity: 80,
    } as any
    const recs = generateRecommendations(routes, [], { overallProsperity: 80 } as any, stats)
    expect(recs.some((r) => r.includes('collapsed'))).toBe(true)
  })
})

// ─── buildSpiceRouteResult ─────────────────────────────────────────────────

describe('buildSpiceRouteResult', () => {
  it('returns empty result for no files', () => {
    const result = buildSpiceRouteResult([], [])
    expect(result.routes).toHaveLength(0)
    expect(result.networks).toHaveLength(0)
    expect(result.world.overallProsperity).toBe(0)
    expect(result.world.isProsperous).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes single RICH file correctly', () => {
    const result = buildSpiceRouteResult(['rich.ts'], [RICH])
    expect(result.routes).toHaveLength(1)
    expect(result.routes[0].qualityScore).toBe(91)
    expect(result.routes[0].condition).toBe('golden-age')
    expect(result.stats.goldenAgeCount).toBe(1)
    expect(result.stats.isSuccessfulCount).toBe(1)
  })

  it('computes correct 3-file mix overall values', () => {
    const result = buildSpiceRouteResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )

    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalNetworks).toBe(1)
    expect(result.world.overallProsperity).toBe(66)
    expect(result.world.isProsperous).toBe(true)
    expect(result.world.avgClarity).toBe(72)
    expect(result.world.avgEfficiency).toBe(66)
    expect(result.world.avgSuccess).toBe(67)

    expect(result.stats.avgRouteClarity).toBe(72)
    expect(result.stats.avgCargoValue).toBe(64)
    expect(result.stats.avgWaypointQuality).toBe(68)
    expect(result.stats.avgTradeEfficiency).toBe(66)
    expect(result.stats.avgCulturalExchange).toBe(59)
    expect(result.stats.avgJourneySuccess).toBe(67)

    expect(result.stats.goldenAgeCount).toBe(1)
    expect(result.stats.prosperousCount).toBe(1)
    expect(result.stats.thrivingCount).toBe(0)
    expect(result.stats.survivingCount).toBe(0)
    expect(result.stats.strugglingCount).toBe(1)
    expect(result.stats.collapsedCount).toBe(0)

    expect(result.stats.hasClearFlowCount).toBe(2)
    expect(result.stats.hasHighValueCount).toBe(1)
    expect(result.stats.hasQualityControlCount).toBe(2)
    expect(result.stats.hasHighEfficiencyCount).toBe(2)
    expect(result.stats.hasCulturalExchangeCount).toBe(1)
    expect(result.stats.isSuccessfulCount).toBe(1)

    expect(result.stats.merchantGrade).toBe('master-trader')
    expect(result.stats.bestRoute).toBe('src/rich.ts')
    expect(result.stats.clearest).toBe('src/rich.ts')
    expect(result.stats.mostValuable).toBe('src/rich.ts')
    expect(result.stats.bestWaypoints).toBe('src/rich.ts')
    expect(result.stats.mostEfficient).toBe('src/rich.ts')
    expect(result.stats.mostExchanged).toBe('src/rich.ts')

    expect(result.networks).toHaveLength(1)
    expect(result.networks[0].networkType).toBe('maritime-network')
    expect(result.networks[0].condition).toBe('trading-bloc')
  })

  it('creates separate networks for different directories', () => {
    const result = buildSpiceRouteResult(
      ['src/a.ts', 'lib/b.ts'],
      [RICH, EMPTY],
    )
    expect(result.networks).toHaveLength(2)
  })
})

// ─── format-helpers ────────────────────────────────────────────────────────

describe('format-helpers', () => {
  it('scoreColor returns string for any score', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(70)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    expect(typeof conditionColor('golden-age')).toBe('string')
    expect(typeof conditionColor('prosperous')).toBe('string')
    expect(typeof conditionColor('thriving')).toBe('string')
    expect(typeof conditionColor('surviving')).toBe('string')
    expect(typeof conditionColor('struggling')).toBe('string')
    expect(typeof conditionColor('collapsed')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
  })

  it('gradeColor returns string for all grades', () => {
    expect(typeof gradeColor('grand-merchant')).toBe('string')
    expect(typeof gradeColor('master-trader')).toBe('string')
    expect(typeof gradeColor('merchant')).toBe('string')
    expect(typeof gradeColor('peddler')).toBe('string')
    expect(typeof gradeColor('hawker')).toBe('string')
    expect(typeof gradeColor('beggar')).toBe('string')
  })

  it('networkTypeColor returns string for all types', () => {
    expect(typeof networkTypeColor('grand-trunk')).toBe('string')
    expect(typeof networkTypeColor('maritime-network')).toBe('string')
    expect(typeof networkTypeColor('silk-network')).toBe('string')
    expect(typeof networkTypeColor('regional-trade')).toBe('string')
    expect(typeof networkTypeColor('local-market')).toBe('string')
    expect(typeof networkTypeColor('dead-end')).toBe('string')
  })

  it('formatSpiceRouteJson returns valid JSON', () => {
    const result = buildSpiceRouteResult(['test.ts'], [RICH])
    const json = formatSpiceRouteJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.routes).toHaveLength(1)
  })

  it('formatSpiceRouteTable returns string with sections', () => {
    const result = buildSpiceRouteResult(['test.ts'], [RICH])
    const table = formatSpiceRouteTable(result, false)
    expect(table).toContain('Spice Route Analysis')
    expect(table).toContain('World Overview')
    expect(table).toContain('Statistics')
    expect(table).toContain('Grades')
  })

  it('formatSpiceRouteTable includes per-route breakdown when verbose', () => {
    const result = buildSpiceRouteResult(['test.ts'], [RICH])
    const table = formatSpiceRouteTable(result, true)
    expect(table).toContain('Per-Route Breakdown')
  })

  it('formatSpiceRouteTable omits per-route when not verbose', () => {
    const result = buildSpiceRouteResult(['test.ts'], [RICH])
    const table = formatSpiceRouteTable(result, false)
    expect(table).not.toContain('Per-Route Breakdown')
  })

  it('formatSpiceRouteTable shows recommendations', () => {
    const result = buildSpiceRouteResult(['test.ts'], [RICH])
    const table = formatSpiceRouteTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('formatSpiceRouteTable shows networks', () => {
    const result = buildSpiceRouteResult(['src/test.ts'], [RICH])
    const table = formatSpiceRouteTable(result, false)
    expect(table).toContain('Networks')
  })
})
