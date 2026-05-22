import { describe, expect, it } from 'vitest'

import {
  analyzeCaravanStop,
  analyzeTradeRoute,
  buildSilkRoadResult,
  classifyCondition,
  classifyMerchantGrade,
  classifyRouteCondition,
  classifyRouteType,
  generateRecommendations,
  measureBridge,
  measureCaravan,
  measureCulture,
  measureOasis,
  measureProsperity,
  measureTrade,
} from '../src/commands/silk-road-helpers.js'

import {
  conditionColor,
  engineeringColor,
  formationColor,
  formatSilkRoadJson,
  formatSilkRoadTable,
  gradeColor,
  influenceColor,
  oasisColor,
  routeColor,
  routeTypeColor,
  scoreColor,
  wealthColor,
} from '../src/commands/silk-road-format-helpers.js'

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

// ─── measureTrade ────────────────────────────────────────────────────────────

describe('measureTrade', () => {
  it('returns high quality for rich content', () => {
    const result = measureTrade(RICH_CONTENT)
    expect(result.quality).toBe(95)
    expect(result.route).toBe('major-route')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasProperConnections).toBe(true)
    expect(result.hasNoTollgate).toBe(true)
    expect(result.hasNoSmuggling).toBe(true)
    expect(result.hasProperCustoms).toBe(true)
    expect(result.hasNoContraband).toBe(true)
    expect(result.hasOpenTrade).toBe(true)
    expect(result.tollgateCount).toBe(0)
    expect(result.smugglingCount).toBe(0)
  })

  it('returns low quality for empty content', () => {
    const result = measureTrade(EMPTY_CONTENT)
    expect(result.quality).toBe(30)
    expect(result.route).toBe('dead-end')
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasNoTollgate).toBe(true)
  })

  it('returns dead-end for medium content', () => {
    const result = measureTrade(MEDIUM_CONTENT)
    expect(result.quality).toBe(30)
    expect(result.route).toBe('dead-end')
  })
})

// ─── measureCulture ──────────────────────────────────────────────────────────

describe('measureCulture', () => {
  it('returns high richness for rich content', () => {
    const result = measureCulture(RICH_CONTENT)
    expect(result.richness).toBe(90)
    expect(result.influence).toBe('regional')
    expect(result.hasRichCulture).toBe(true)
    expect(result.hasDiversePatterns).toBe(true)
    expect(result.hasCrossPollination).toBe(true)
    expect(result.hasAdaptive).toBe(true)
    expect(result.hasNoStagnation).toBe(true)
    expect(result.hasKnowledgeTransfer).toBe(true)
    expect(result.hasNoHoarding).toBe(true)
    expect(result.impositionCount).toBe(1)
    expect(result.hoardingCount).toBe(0)
  })

  it('returns low richness for empty content', () => {
    const result = measureCulture(EMPTY_CONTENT)
    expect(result.richness).toBe(40)
    expect(result.influence).toBe('isolated')
    expect(result.hasRichCulture).toBe(false)
    expect(result.hasNoCulturalImposition).toBe(true)
  })

  it('returns isolated for medium content', () => {
    const result = measureCulture(MEDIUM_CONTENT)
    expect(result.richness).toBe(40)
    expect(result.influence).toBe('isolated')
  })
})

// ─── measureCaravan ──────────────────────────────────────────────────────────

describe('measureCaravan', () => {
  it('returns high strength for rich content', () => {
    const result = measureCaravan(RICH_CONTENT)
    expect(result.strength).toBe(90)
    expect(result.formation).toBe('traveling-party')
    expect(result.hasHighStrength).toBe(true)
    expect(result.hasProperFormation).toBe(true)
    expect(result.hasPackAnimals).toBe(true)
    expect(result.hasProperPacing).toBe(true)
    expect(result.hasNoOverloading).toBe(true)
    expect(result.hasGuardDetail).toBe(true)
    expect(result.stragglerCount).toBe(1)
    expect(result.banditCount).toBe(1)
  })

  it('returns low strength for empty content', () => {
    const result = measureCaravan(EMPTY_CONTENT)
    expect(result.strength).toBe(40)
    expect(result.formation).toBe('lonely-traveler')
    expect(result.hasHighStrength).toBe(false)
  })

  it('returns lonely-traveler for medium content', () => {
    const result = measureCaravan(MEDIUM_CONTENT)
    expect(result.strength).toBe(40)
    expect(result.formation).toBe('lonely-traveler')
  })
})

// ─── measureOasis ────────────────────────────────────────────────────────────

describe('measureOasis', () => {
  it('returns high stability for rich content', () => {
    const result = measureOasis(RICH_CONTENT)
    expect(result.stability).toBe(90)
    expect(result.condition).toBe('well')
    expect(result.hasHighStability).toBe(true)
    expect(result.hasFreshWater).toBe(true)
    expect(result.hasProperShade).toBe(true)
    expect(result.hasAbundant).toBe(true)
    expect(result.hasProperRest).toBe(true)
    expect(result.hasNoOvercrowding).toBe(true)
    expect(result.hasSafeHarbor).toBe(true)
    expect(result.hasNoQuicksand).toBe(true)
    expect(result.contaminationCount).toBe(1)
    expect(result.quicksandCount).toBe(0)
  })

  it('returns low stability for empty content', () => {
    const result = measureOasis(EMPTY_CONTENT)
    expect(result.stability).toBe(40)
    expect(result.condition).toBe('mirage')
    expect(result.hasHighStability).toBe(false)
  })

  it('returns mirage for medium content', () => {
    const result = measureOasis(MEDIUM_CONTENT)
    expect(result.stability).toBe(40)
    expect(result.condition).toBe('mirage')
  })
})

// ─── measureBridge ───────────────────────────────────────────────────────────

describe('measureBridge', () => {
  it('returns high quality for rich content', () => {
    const result = measureBridge(RICH_CONTENT)
    expect(result.quality).toBe(92)
    expect(result.engineering).toBe('masterpiece')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasProperSpan).toBe(true)
    expect(result.hasSolidFoundation).toBe(true)
    expect(result.hasNoCracks).toBe(true)
    expect(result.hasProperLoad).toBe(true)
    expect(result.hasNoSagging).toBe(true)
    expect(result.hasClearPassage).toBe(true)
    expect(result.hasNoTolls).toBe(true)
    expect(result.hasProperLighting).toBe(true)
    expect(result.hasNoDeadEnd).toBe(true)
    expect(result.crackCount).toBe(0)
    expect(result.deadEndCount).toBe(0)
  })

  it('returns low quality for empty content', () => {
    const result = measureBridge(EMPTY_CONTENT)
    expect(result.quality).toBe(38)
    expect(result.engineering).toBe('dangerous')
    expect(result.hasHighQuality).toBe(false)
  })

  it('returns dangerous for medium content', () => {
    const result = measureBridge(MEDIUM_CONTENT)
    expect(result.quality).toBe(38)
    expect(result.engineering).toBe('dangerous')
  })
})

// ─── measureProsperity ───────────────────────────────────────────────────────

describe('measureProsperity', () => {
  it('returns high prosperity for rich content', () => {
    const result = measureProsperity(RICH_CONTENT)
    expect(result.level).toBe(90)
    expect(result.wealth).toBe('thriving')
    expect(result.hasHighProsperity).toBe(true)
    expect(result.hasSurplus).toBe(true)
    expect(result.hasGrowing).toBe(true)
    expect(result.hasNoInflation).toBe(true)
    expect(result.hasStable).toBe(true)
    expect(result.hasNoRecession).toBe(true)
    expect(result.hasDiversified).toBe(true)
    expect(result.hasNoCollapse).toBe(true)
    expect(result.debtCount).toBe(1)
    expect(result.recessionCount).toBe(0)
  })

  it('returns low prosperity for empty content', () => {
    const result = measureProsperity(EMPTY_CONTENT)
    expect(result.level).toBe(40)
    expect(result.wealth).toBe('struggling')
    expect(result.hasHighProsperity).toBe(false)
  })

  it('returns struggling for medium content', () => {
    const result = measureProsperity(MEDIUM_CONTENT)
    expect(result.level).toBe(40)
    expect(result.wealth).toBe('struggling')
  })
})

// ─── analyzeCaravanStop ──────────────────────────────────────────────────────

describe('analyzeCaravanStop', () => {
  it('returns golden-city for rich content', () => {
    const result = analyzeCaravanStop(RICH_CONTENT, 'rich.ts')
    expect(result.tradeRouteQuality).toBe(95)
    expect(result.culturalRichness).toBe(90)
    expect(result.caravanStrength).toBe(90)
    expect(result.oasisStability).toBe(90)
    expect(result.bridgeQuality).toBe(92)
    expect(result.mercantileProsperity).toBe(90)
    expect(result.qualityScore).toBe(91)
    expect(result.condition).toBe('golden-city')
    expect(result.file).toBe('rich.ts')
  })

  it('returns outpost for empty content', () => {
    const result = analyzeCaravanStop(EMPTY_CONTENT, 'empty.ts')
    expect(result.tradeRouteQuality).toBe(30)
    expect(result.culturalRichness).toBe(40)
    expect(result.caravanStrength).toBe(40)
    expect(result.oasisStability).toBe(40)
    expect(result.bridgeQuality).toBe(38)
    expect(result.mercantileProsperity).toBe(40)
    expect(result.qualityScore).toBe(38)
    expect(result.condition).toBe('outpost')
  })

  it('returns outpost for medium content', () => {
    const result = analyzeCaravanStop(MEDIUM_CONTENT, 'medium.ts')
    expect(result.qualityScore).toBe(38)
    expect(result.condition).toBe('outpost')
  })
})

// ─── classifyCondition ───────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies golden-city for 80+', () => {
    expect(classifyCondition({ qualityScore: 80 } as any)).toBe('golden-city')
  })
  it('classifies trading-post for 65-79', () => {
    expect(classifyCondition({ qualityScore: 65 } as any)).toBe('trading-post')
  })
  it('classifies waystation for 50-64', () => {
    expect(classifyCondition({ qualityScore: 50 } as any)).toBe('waystation')
  })
  it('classifies outpost for 35-49', () => {
    expect(classifyCondition({ qualityScore: 35 } as any)).toBe('outpost')
  })
  it('classifies ruins for 20-34', () => {
    expect(classifyCondition({ qualityScore: 20 } as any)).toBe('ruins')
  })
  it('classifies ghost-town for <20', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('ghost-town')
  })
})

// ─── classifyRouteType ───────────────────────────────────────────────────────

describe('classifyRouteType', () => {
  it('returns wilderness for empty stops', () => {
    expect(classifyRouteType([])).toBe('wilderness')
  })
  it('returns imperial-network for high avg with golden count', () => {
    const stops = Array.from({ length: 5 }, () => ({
      qualityScore: 90, condition: 'golden-city',
    }) as any)
    expect(classifyRouteType(stops)).toBe('imperial-network')
  })
  it('returns major-route for avg >= 60', () => {
    expect(classifyRouteType([{ qualityScore: 60, condition: 'outpost' } as any])).toBe('major-route')
  })
  it('returns regional-path for avg >= 45', () => {
    expect(classifyRouteType([{ qualityScore: 45, condition: 'ruins' } as any])).toBe('regional-path')
  })
  it('returns local-road for avg >= 30', () => {
    expect(classifyRouteType([{ qualityScore: 30, condition: 'ghost-town' } as any])).toBe('local-road')
  })
  it('returns trail for avg >= 15', () => {
    expect(classifyRouteType([{ qualityScore: 15, condition: 'ghost-town' } as any])).toBe('trail')
  })
  it('returns wilderness for avg < 15', () => {
    expect(classifyRouteType([{ qualityScore: 5, condition: 'ghost-town' } as any])).toBe('wilderness')
  })
})

// ─── classifyRouteCondition ──────────────────────────────────────────────────

describe('classifyRouteCondition', () => {
  it('classifies golden-age for 80+', () => { expect(classifyRouteCondition(80)).toBe('golden-age') })
  it('classifies prosperous-era for 65-79', () => { expect(classifyRouteCondition(65)).toBe('prosperous-era') })
  it('classifies stable-trade for 50-64', () => { expect(classifyRouteCondition(50)).toBe('stable-trade') })
  it('classifies declining for 35-49', () => { expect(classifyRouteCondition(35)).toBe('declining') })
  it('classifies abandoned for 20-34', () => { expect(classifyRouteCondition(20)).toBe('abandoned') })
  it('classifies lost for <20', () => { expect(classifyRouteCondition(10)).toBe('lost') })
})

// ─── classifyMerchantGrade ───────────────────────────────────────────────────

describe('classifyMerchantGrade', () => {
  it('returns grand-merchant for 80+', () => { expect(classifyMerchantGrade(80)).toBe('grand-merchant') })
  it('returns master-trader for 65-79', () => { expect(classifyMerchantGrade(65)).toBe('master-trader') })
  it('returns merchant for 50-64', () => { expect(classifyMerchantGrade(50)).toBe('merchant') })
  it('returns peddler for 35-49', () => { expect(classifyMerchantGrade(35)).toBe('peddler') })
  it('returns beggar for 20-34', () => { expect(classifyMerchantGrade(20)).toBe('beggar') })
  it('returns bandit for <20', () => { expect(classifyMerchantGrade(10)).toBe('bandit') })
})

// ─── analyzeTradeRoute ───────────────────────────────────────────────────────

describe('analyzeTradeRoute', () => {
  it('returns wilderness for empty stops', () => {
    const result = analyzeTradeRoute([], 'empty-dir')
    expect(result.directory).toBe('empty-dir')
    expect(result.stops).toEqual([])
    expect(result.avgTrade).toBe(0)
    expect(result.avgCulture).toBe(0)
    expect(result.avgProsperity).toBe(0)
    expect(result.goldenCount).toBe(0)
    expect(result.ghostCount).toBe(0)
    expect(result.cosmopolitanCount).toBe(0)
    expect(result.prosperousCount).toBe(0)
    expect(result.routeType).toBe('wilderness')
    expect(result.condition).toBe('lost')
  })

  it('analyzes route with stops', () => {
    const s1 = analyzeCaravanStop(RICH_CONTENT, 'rich.ts')
    const result = analyzeTradeRoute([s1], 'src')
    expect(result.avgTrade).toBe(95)
    expect(result.avgCulture).toBe(90)
    expect(result.avgProsperity).toBe(90)
    expect(result.goldenCount).toBe(1)
    expect(result.ghostCount).toBe(0)
  })
})

// ─── buildSilkRoadResult ─────────────────────────────────────────────────────

describe('buildSilkRoadResult', () => {
  it('returns empty result for no files', () => {
    const result = buildSilkRoadResult([], [])
    expect(result.stops).toEqual([])
    expect(result.routes).toEqual([])
    expect(result.network.overallProsperity).toBe(0)
    expect(result.network.isProsperous).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalRoutes).toBe(0)
    expect(result.stats.merchantGrade).toBe('bandit')
  })

  it('returns correct stats for rich + medium files', () => {
    const result = buildSilkRoadResult(
      ['rich.ts', 'medium.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalRoutes).toBe(1)
    expect(result.stats.avgTradeRouteQuality).toBe(63)
    expect(result.stats.avgCulturalRichness).toBe(65)
    expect(result.stats.avgCaravanStrength).toBe(65)
    expect(result.stats.avgOasisStability).toBe(65)
    expect(result.stats.avgBridgeQuality).toBe(65)
    expect(result.stats.avgMercantileProsperity).toBe(65)
    expect(result.stats.overallProsperity).toBe(65)
    expect(result.stats.merchantGrade).toBe('master-trader')
    expect(result.stats.goldenCityCount).toBe(1)
    expect(result.stats.outpostCount).toBe(1)
    expect(result.stats.bestStop).toBe('rich.ts')
    expect(result.stats.bestConnected).toBe('rich.ts')
    expect(result.stats.mostDiverse).toBe('rich.ts')
    expect(result.stats.mostCohesive).toBe('rich.ts')
    expect(result.stats.mostStable).toBe('rich.ts')
    expect(result.stats.bestAPI).toBe('rich.ts')
    expect(result.network.overallProsperity).toBe(65)
    expect(result.network.isProsperous).toBe(true)
  })

  it('returns golden recommendation for high scores', () => {
    const result = buildSilkRoadResult(['rich.ts'], [RICH_CONTENT])
    expect(result.recommendations).toContain('Golden city achieved — your silk road spans the known world')
  })

  it('computes routes by directory', () => {
    const result = buildSilkRoadResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.routes.length).toBe(2)
  })
})

// ─── generateRecommendations ─────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends improving trade when low', () => {
    const stops = [analyzeCaravanStop(EMPTY_CONTENT, 'empty.ts')]
    const routes: any[] = []
    const network = { avgTrade: 30, avgCulture: 50, avgProsperity: 50, isProsperous: false, overallProsperity: 40 }
    const stats = {
      totalFiles: 1, totalRoutes: 0, avgTradeRouteQuality: 30, avgCulturalRichness: 50,
      avgCaravanStrength: 50, avgOasisStability: 50, avgBridgeQuality: 50, avgMercantileProsperity: 50,
      goldenCityCount: 0, tradingPostCount: 0, waystationCount: 0,
      outpostCount: 1, ruinsCount: 0, ghostTownCount: 0,
      hasHighTradeCount: 0, hasRichCultureCount: 0, hasHighStrengthCount: 0,
      hasHighStabilityCount: 0, hasHighBridgeCount: 0, hasHighProsperityCount: 0,
      overallProsperity: 40, merchantGrade: 'peddler' as const,
      bestStop: 'empty.ts', bestConnected: 'empty.ts', mostDiverse: 'empty.ts',
      mostCohesive: 'empty.ts', mostStable: 'empty.ts', bestAPI: 'empty.ts',
    }
    const recs = generateRecommendations(stops, routes, network, stats)
    expect(recs).toContain('Improve trade route quality — strengthen code connections')
  })

  it('recommends golden city when all scores are high', () => {
    const result = buildSilkRoadResult(['rich.ts'], [RICH_CONTENT])
    const recs = generateRecommendations(result.stops, result.routes, result.network, result.stats)
    expect(recs).toContain('Golden city achieved — your silk road spans the known world')
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns green for high score', () => { expect(scoreColor(90)).toContain('90') })
  it('returns yellow for medium score', () => { expect(scoreColor(70)).toContain('70') })
  it('returns orange for low score', () => { expect(scoreColor(45)).toContain('45') })
  it('returns red for very low score', () => { expect(scoreColor(20)).toContain('20') })
})

describe('conditionColor', () => {
  it('colors golden-city', () => { expect(conditionColor('golden-city')).toContain('golden-city') })
  it('colors ghost-town', () => { expect(conditionColor('ghost-town')).toContain('ghost-town') })
  it('passes through unknown', () => { expect(conditionColor('unknown')).toBe('unknown') })
})

describe('gradeColor', () => {
  it('colors grand-merchant', () => { expect(gradeColor('grand-merchant')).toContain('grand-merchant') })
  it('colors bandit', () => { expect(gradeColor('bandit')).toContain('bandit') })
  it('passes through unknown', () => { expect(gradeColor('unknown')).toBe('unknown') })
})

describe('routeColor', () => {
  it('colors imperial-highway', () => { expect(routeColor('imperial-highway')).toContain('imperial-highway') })
  it('colors dead-end', () => { expect(routeColor('dead-end')).toContain('dead-end') })
})

describe('influenceColor', () => {
  it('colors cosmopolitan', () => { expect(influenceColor('cosmopolitan')).toContain('cosmopolitan') })
  it('colors hermit', () => { expect(influenceColor('hermit')).toContain('hermit') })
})

describe('formationColor', () => {
  it('colors grand-caravan', () => { expect(formationColor('grand-caravan')).toContain('grand-caravan') })
  it('colors lost', () => { expect(formationColor('lost')).toContain('lost') })
})

describe('oasisColor', () => {
  it('colors lush-oasis', () => { expect(oasisColor('lush-oasis')).toContain('lush-oasis') })
  it('colors poisoned-well', () => { expect(oasisColor('poisoned-well')).toContain('poisoned-well') })
})

describe('engineeringColor', () => {
  it('colors masterpiece', () => { expect(engineeringColor('masterpiece')).toContain('masterpiece') })
  it('colors collapsed', () => { expect(engineeringColor('collapsed')).toContain('collapsed') })
})

describe('wealthColor', () => {
  it('colors golden-age', () => { expect(wealthColor('golden-age')).toContain('golden-age') })
  it('colors destitute', () => { expect(wealthColor('destitute')).toContain('destitute') })
})

describe('routeTypeColor', () => {
  it('colors imperial-network', () => { expect(routeTypeColor('imperial-network')).toContain('imperial-network') })
  it('colors wilderness', () => { expect(routeTypeColor('wilderness')).toContain('wilderness') })
})

// ─── JSON Formatter ──────────────────────────────────────────────────────────

describe('formatSilkRoadJson', () => {
  it('returns valid JSON', () => {
    const result = buildSilkRoadResult([], [])
    const json = formatSilkRoadJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stops).toEqual([])
    expect(parsed.network.overallProsperity).toBe(0)
  })
})

// ─── Table Formatter ─────────────────────────────────────────────────────────

describe('formatSilkRoadTable', () => {
  it('includes Silk Road Analysis header', () => {
    const result = buildSilkRoadResult([], [])
    const table = formatSilkRoadTable(result, false)
    expect(table).toContain('Silk Road Analysis')
  })

  it('includes statistics in table output', () => {
    const result = buildSilkRoadResult(['rich.ts'], [RICH_CONTENT])
    const table = formatSilkRoadTable(result, false)
    expect(table).toContain('Total Files')
    expect(table).toContain('Merchant Grade')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildSilkRoadResult(['rich.ts'], [RICH_CONTENT])
    const table = formatSilkRoadTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('rich.ts')
  })

  it('includes recommendations', () => {
    const result = buildSilkRoadResult(['rich.ts'], [RICH_CONTENT])
    const table = formatSilkRoadTable(result, false)
    expect(table).toContain('Recommendations')
  })
})
