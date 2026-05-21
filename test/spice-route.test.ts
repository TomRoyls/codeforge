import { describe, expect, it } from 'vitest'
import {
  analyzeTradeRoute,
  analyzeTradeWaypoint,
  buildSpiceRouteResult,
  classifyMerchantGrade,
  classifyRouteCondition,
  classifyRouteType,
  classifyWaypointCondition,
  generateRecommendations,
  measureCargo,
  measureCaravan,
  measureRoute,
  measureSafety,
  measureTolls,
  measureTrade,
  measureTrust,
  type TradeWaypoint,
} from '../src/commands/spice-route-helpers.js'
import {
  formatSpiceRouteCsv,
  formatSpiceRouteJson,
  formatSpiceRouteTable,
} from '../src/commands/spice-route-format-helpers.js'

describe('measureCargo', () => {
  it('returns zero values for empty content', () => {
    const cargo = measureCargo('')
    expect(cargo.value).toBe(0)
    expect(cargo.weight).toBe(0)
    expect(cargo.type).toBe('salt')
  })

  it('detects gold cargo for high-value modules', () => {
    const code = [
      'export function core1() {}',
      'export function core2() {}',
      'export function core3() {}',
      'export function core4() {}',
      'export function core5() {}',
      'export class Engine {}',
      'export class Builder {}',
      'export interface ICore {}',
      'export interface IBuilder {}',
      'export type Config = {}',
      'export type Options = {}',
      'export type Result = {}',
    ].join('\n')
    const cargo = measureCargo(code)
    expect(cargo.type).toBe('gold')
    expect(cargo.value).toBeGreaterThan(60)
    expect(cargo.isValuable).toBe(true)
  })

  it('detects gems for moderately valuable code', () => {
    const code = [
      'export class Service {}',
      'export function run() {}',
      'export interface Config {}',
    ].join('\n')
    const cargo = measureCargo(code)
    expect(cargo.value).toBeGreaterThan(30)
  })

  it('detects silk for exotic code with many types', () => {
    const code = [
      'export type A = string',
      'export type B = number',
      'export type C = boolean',
      'export type D = object',
      'function run() {}',
    ].join('\n')
    const cargo = measureCargo(code)
    expect(cargo.isExotic).toBe(true)
  })

  it('detects salt for low-value code', () => {
    const code = 'const x = 1\nconst y = 2'
    const cargo = measureCargo(code)
    expect(cargo.type).toBe('salt')
    expect(cargo.isCommon).toBe(true)
  })

  it('marks perishable for high export count', () => {
    const code = [
      'export function a() {}',
      'export function b() {}',
      'export function c() {}',
      'export function d() {}',
      'export function e() {}',
      'export function f() {}',
    ].join('\n')
    const cargo = measureCargo(code)
    expect(cargo.isPerishable).toBe(true)
  })

  it('marks fragile for code without error handling', () => {
    const code = [
      'function process(data) {',
      '  return data.map(x => x.value)',
      '}',
      'function validate(input) {',
      '  return input.length > 0',
      '}',
      'function transform(item) {',
      '  return { ...item, done: true }',
      '}',
      'function extra() {',
      '  return 1',
      '}',
    ].join('\n')
    const cargo = measureCargo(code)
    expect(cargo.isFragile).toBe(true)
  })

  it('marks durable for stable low-value code', () => {
    const code = 'function helper() { return 1 }'
    const cargo = measureCargo(code)
    expect(cargo.isDurable).toBe(true)
  })

  it('calculates weight based on lines of code', () => {
    const code = Array.from({ length: 50 }, (_, i) => `const line${i} = ${i}`).join('\n')
    const cargo = measureCargo(code)
    expect(cargo.weight).toBe(10)
  })
})

describe('measureRoute', () => {
  it('returns high efficiency for clean imports and exports', () => {
    const code = 'import { x } from "./a"\nexport { y }'
    const route = measureRoute(code)
    expect(route.inboundPaths).toBe(1)
    expect(route.outboundPaths).toBe(1)
    expect(route.totalPaths).toBe(2)
    expect(route.efficiency).toBeGreaterThan(50)
  })

  it('detects direct routes when imports are used', () => {
    const code = 'import { x } from "./a"\nconst y = x\nconst z = x\nconsole.log(y, z)'
    const route = measureRoute(code)
    expect(route.hasDirectRoutes).toBe(true)
  })

  it('detects dead ends for unused imports', () => {
    const code = 'import { unused } from "./a"'
    const route = measureRoute(code)
    expect(route.hasDeadEnds).toBe(true)
    expect(route.deadEndCount).toBeGreaterThan(0)
  })

  it('detects piracy from circular re-exports', () => {
    const code = 'export * from "./a"\nexport * from "./b"'
    const route = measureRoute(code)
    expect(route.hasPiracy).toBe(true)
    expect(route.circuitousCount).toBe(2)
  })

  it('returns 100 efficiency for content with no imports', () => {
    const code = 'const x = 1'
    const route = measureRoute(code)
    expect(route.efficiency).toBe(100)
  })

  it('counts total paths correctly', () => {
    const code = 'import { a } from "./x"\nimport { b } from "./y"\nexport { c }\nexport { d }'
    const route = measureRoute(code)
    expect(route.totalPaths).toBe(4)
  })
})

describe('measureTolls', () => {
  it('returns zero tolls for code without middleware', () => {
    const tolls = measureTolls('function hello() { return 1 }')
    expect(tolls.count).toBe(0)
    expect(tolls.isReasonable).toBe(true)
  })

  it('detects middleware patterns', () => {
    const code = 'app.use(middleware())\napp.use(auth())'
    const tolls = measureTolls(code)
    expect(tolls.count).toBeGreaterThanOrEqual(2)
    expect(tolls.hasLegitimateTolls).toBe(true)
  })

  it('detects excessive tolls', () => {
    const code = Array.from({ length: 7 }, (_, i) => `app.use(mw${i}())`).join('\n')
    const tolls = measureTolls(code)
    expect(tolls.hasExcessiveTolls).toBe(true)
    expect(tolls.excessiveCount).toBeGreaterThan(0)
  })

  it('detects toll fraud when no error handling', () => {
    const code = 'app.use(middleware())'
    const tolls = measureTolls(code)
    expect(tolls.hasTollFraud).toBe(true)
  })

  it('reports reasonable for 3 or fewer middleware', () => {
    const code = 'app.use(a())\napp.use(b())\napp.use(c())'
    const tolls = measureTolls(code)
    expect(tolls.isReasonable).toBe(true)
  })
})

describe('measureTrade', () => {
  it('returns zero volume for empty code', () => {
    const trade = measureTrade('')
    expect(trade.volume).toBe(0)
    expect(trade.exportCount).toBe(0)
    expect(trade.importCount).toBe(0)
  })

  it('detects wholesale exports', () => {
    const code = [
      'export function a() {}',
      'export function b() {}',
      'export function c() {}',
    ].join('\n')
    const trade = measureTrade(code)
    expect(trade.hasWholesale).toBe(true)
    expect(trade.exportCount).toBe(3)
  })

  it('detects retail exports', () => {
    const code = 'export function sole() {}'
    const trade = measureTrade(code)
    expect(trade.hasRetail).toBe(true)
  })

  it('detects trade hub when many imports and exports', () => {
    const code = [
      'import { a } from "./x"',
      'import { b } from "./y"',
      'import { c } from "./z"',
      'export function d() {}',
      'export function e() {}',
      'export function f() {}',
    ].join('\n')
    const trade = measureTrade(code)
    expect(trade.isTradeHub).toBe(true)
  })

  it('detects embargo for unexported functions', () => {
    const code = 'function a() {}\nfunction b() {}'
    const trade = measureTrade(code)
    expect(trade.hasEmbargo).toBe(true)
  })

  it('detects monopoly for many functions with many exports', () => {
    const code = [
      'export function a() {}',
      'export function b() {}',
      'export function c() {}',
      'export function d() {}',
      'export function e() {}',
    ].join('\n')
    const trade = measureTrade(code)
    expect(trade.hasMonopoly).toBe(true)
  })
})

describe('measureSafety', () => {
  it('returns high level for empty content', () => {
    const safety = measureSafety('')
    expect(safety.level).toBe(100)
  })

  it('detects escorts from try-catch', () => {
    const code = 'try { doWork() } catch(e) { handle(e) }'
    const safety = measureSafety(code)
    expect(safety.hasEscorts).toBe(true)
    expect(safety.level).toBeGreaterThanOrEqual(50)
  })

  it('detects naval patrol from comprehensive error handling', () => {
    const code = [
      'try { a() } catch(e) {}',
      'try { b() } catch(e) {}',
      'try { c() } catch(e) {}',
    ].join('\n')
    const safety = measureSafety(code)
    expect(safety.hasNavalPatrol).toBe(true)
  })

  it('detects safe harbors from catch calls', () => {
    const code = 'promise.catch(err => log(err))'
    const safety = measureSafety(code)
    expect(safety.hasSafeHarbors).toBe(true)
  })

  it('detects pirate zones for large unprotected code', () => {
    const code = Array.from({ length: 30 }, (_, i) => `const x${i} = ${i}`).join('\n')
    const safety = measureSafety(code)
    expect(safety.hasPirateZones).toBe(true)
    expect(safety.pirateZoneCount).toBe(1)
  })

  it('detects shipwrecks from TODO and FIXME', () => {
    const code = '// TODO: fix this\n// FIXME: broken'
    const safety = measureSafety(code)
    expect(safety.hasShipwrecks).toBe(true)
    expect(safety.shipwreckCount).toBe(2)
  })

  it('detects storm warnings from deprecation', () => {
    const code = '/** @deprecated */\nfunction old() {}'
    const safety = measureSafety(code)
    expect(safety.hasStormWarnings).toBe(true)
  })
})

describe('measureTrust', () => {
  it('returns 100 level for empty content', () => {
    const trust = measureTrust('')
    expect(trust.level).toBe(100)
  })

  it('detects guild seal from type annotations', () => {
    const code = 'function greet(name: string): void {}'
    const trust = measureTrust(code)
    expect(trust.hasGuildSeal).toBe(true)
  })

  it('detects letter of credit from tests', () => {
    const code = "it('works', () => { expect(1).toBe(1) })"
    const trust = measureTrust(code)
    expect(trust.hasLetterOfCredit).toBe(true)
  })

  it('detects merchant charter from JSDoc', () => {
    const code = '/** Documentation */\nfunction documented() {}'
    const trust = measureTrust(code)
    expect(trust.hasMerchantCharter).toBe(true)
  })

  it('detects broken promise from any types', () => {
    const code = 'function process(data: any): any {}'
    const trust = measureTrust(code)
    expect(trust.hasBrokenPromise).toBe(true)
  })

  it('detects trusted merchant when fully documented', () => {
    const code = [
      '/** Docs */',
      'function calc(x: number): number { return x }',
      "it('works', () => { expect(calc(1)).toBe(1) })",
    ].join('\n')
    const trust = measureTrust(code)
    expect(trust.isTrustedMerchant).toBe(true)
  })

  it('detects reliable weights when all functions are typed', () => {
    const code = 'function add(a: number, b: number): number { return a + b }'
    const trust = measureTrust(code)
    expect(trust.hasReliableWeights).toBe(true)
  })
})

describe('measureCaravan', () => {
  it('returns zero size for no imports', () => {
    const caravan = measureCaravan('const x = 1')
    expect(caravan.size).toBe(0)
    expect(caravan.isOverloaded).toBe(false)
  })

  it('counts import size correctly', () => {
    const code = 'import { a } from "./x"\nimport { b } from "./y"'
    const caravan = measureCaravan(code)
    expect(caravan.size).toBe(2)
  })

  it('detects scouts from type guards', () => {
    const code = "if (typeof x === 'string') { process(x) }"
    const caravan = measureCaravan(code)
    expect(caravan.hasScouts).toBe(true)
  })

  it('detects guards from validation', () => {
    const code = 'function validate(input) { return true }'
    const caravan = measureCaravan(code)
    expect(caravan.hasGuards).toBe(true)
  })

  it('detects overloaded caravan', () => {
    const code = Array.from({ length: 12 }, (_, i) => `import { m${i} } from "./m${i}"`).join('\n')
    const caravan = measureCaravan(code)
    expect(caravan.isOverloaded).toBe(true)
  })

  it('detects lost cargo from unused imports', () => {
    const code = 'import { unused } from "./a"'
    const caravan = measureCaravan(code)
    expect(caravan.hasLostCargo).toBe(true)
  })

  it('detects pack animals from helper patterns', () => {
    const code = 'const utilHelper = () => {}'
    const caravan = measureCaravan(code)
    expect(caravan.hasPackAnimals).toBe(true)
  })
})

describe('classifyWaypointCondition', () => {
  it('classifies silk-road-hub for high scores', () => {
    expect(classifyWaypointCondition(80, 80, 80)).toBe('silk-road-hub')
  })

  it('classifies major-port for good scores', () => {
    expect(classifyWaypointCondition(65, 65, 65)).toBe('major-port')
  })

  it('classifies trading-post for moderate scores', () => {
    expect(classifyWaypointCondition(50, 50, 50)).toBe('trading-post')
  })

  it('classifies waystation for low scores', () => {
    expect(classifyWaypointCondition(30, 30, 30)).toBe('waystation')
  })

  it('classifies ghost-town for very low scores', () => {
    expect(classifyWaypointCondition(10, 10, 35)).toBe('ghost-town')
  })

  it('classifies shipwreck for critically low safety', () => {
    expect(classifyWaypointCondition(5, 5, 5)).toBe('shipwreck')
  })
})

describe('classifyRouteType', () => {
  it('returns dead-route for empty waypoints', () => {
    expect(classifyRouteType([])).toBe('dead-route')
  })

  it('classifies silk-road for high value and hub ratio', () => {
    const waypoints = Array.from({ length: 10 }, () => ({
      cargoValue: 70, routeEfficiency: 80, routeSafety: 70, condition: 'silk-road-hub',
    } as unknown as TradeWaypoint))
    expect(classifyRouteType(waypoints)).toBe('silk-road')
  })

  it('classifies maritime-highway for moderate value and safety', () => {
    const waypoints = Array.from({ length: 5 }, () => ({
      cargoValue: 55, routeEfficiency: 60, routeSafety: 60, condition: 'major-port',
    } as unknown as TradeWaypoint))
    expect(classifyRouteType(waypoints)).toBe('maritime-highway')
  })

  it('classifies dead-route for very low value', () => {
    const waypoints = Array.from({ length: 3 }, () => ({
      cargoValue: 5, routeEfficiency: 5, routeSafety: 5, condition: 'shipwreck',
    } as unknown as TradeWaypoint))
    expect(classifyRouteType(waypoints)).toBe('dead-route')
  })
})

describe('classifyRouteCondition', () => {
  it('returns golden-age for top scores', () => {
    expect(classifyRouteCondition(90, 90)).toBe('golden-age')
  })

  it('returns prosperous-trade for good scores', () => {
    expect(classifyRouteCondition(70, 70)).toBe('prosperous-trade')
  })

  it('returns active-commerce for moderate scores', () => {
    expect(classifyRouteCondition(55, 55)).toBe('active-commerce')
  })

  it('returns declining-trade for low scores', () => {
    expect(classifyRouteCondition(40, 40)).toBe('declining-trade')
  })

  it('returns dangerous-passage for very low scores', () => {
    expect(classifyRouteCondition(25, 25)).toBe('dangerous-passage')
  })

  it('returns abandoned-route for critically low scores', () => {
    expect(classifyRouteCondition(5, 5)).toBe('abandoned-route')
  })
})

describe('classifyMerchantGrade', () => {
  it('returns grand-merchant for top health', () => {
    expect(classifyMerchantGrade(90)).toBe('grand-merchant')
  })

  it('returns guild-master for high health', () => {
    expect(classifyMerchantGrade(75)).toBe('guild-master')
  })

  it('returns merchant for moderate health', () => {
    expect(classifyMerchantGrade(60)).toBe('merchant')
  })

  it('returns trader for low health', () => {
    expect(classifyMerchantGrade(45)).toBe('trader')
  })

  it('returns peddler for very low health', () => {
    expect(classifyMerchantGrade(25)).toBe('peddler')
  })

  it('returns beggar for critically low health', () => {
    expect(classifyMerchantGrade(10)).toBe('beggar')
  })
})

describe('analyzeTradeWaypoint', () => {
  it('handles empty content', () => {
    const wp = analyzeTradeWaypoint('', 'empty.ts')
    expect(wp.cargoValue).toBe(0)
    expect(wp.qualityScore).toBeLessThanOrEqual(100)
    expect(wp.condition).toBeDefined()
  })

  it('produces well-structured waypoint for rich code', () => {
    const code = [
      '/** Core module */',
      'import { config } from "./config"',
      'export function process(data: string): string { return data }',
      'export function validate(input: unknown): boolean { return true }',
      'try { process("test") } catch(e) { throw e }',
    ].join('\n')
    const wp = analyzeTradeWaypoint(code, 'core.ts')
    expect(wp.cargoValue).toBeGreaterThan(0)
    expect(wp.route.inboundPaths).toBeGreaterThan(0)
    expect(wp.trade.exportCount).toBeGreaterThan(0)
    expect(wp.safety.hasEscorts).toBe(true)
    expect(wp.trust.hasGuildSeal).toBe(true)
    expect(wp.qualityScore).toBeGreaterThan(0)
  })

  it('calculates quality score from all measures', () => {
    const code = '/** Docs */\nexport function f(x: number): number { return x }'
    const wp = analyzeTradeWaypoint(code, 'f.ts')
    expect(wp.qualityScore).toBeGreaterThan(0)
    expect(wp.qualityScore).toBeLessThanOrEqual(100)
  })
})

describe('analyzeTradeRoute', () => {
  it('returns abandoned-route for empty waypoints', () => {
    const route = analyzeTradeRoute([], 'empty')
    expect(route.routeType).toBe('dead-route')
    expect(route.condition).toBe('abandoned-route')
    expect(route.waypoints).toHaveLength(0)
  })

  it('aggregates waypoint data into route averages', () => {
    const code = 'export function a() {}'
    const wp = analyzeTradeWaypoint(code, 'src/a.ts')
    const route = analyzeTradeRoute([wp], 'src')
    expect(route.avgCargoValue).toBe(wp.cargoValue)
    expect(route.directory).toBe('src')
    expect(route.waypoints).toHaveLength(1)
  })
})

describe('generateRecommendations', () => {
  it('returns positive recommendation for healthy network', () => {
    const recs = generateRecommendations([], [], {
      avgCargoValue: 80, avgRouteEfficiency: 80, avgSafety: 80, avgTrust: 80,
      isProsperous: true, overallTradeHealth: 80,
    }, {
      hasPiracyCount: 0, hasDeadEndsCount: 0, hasExcessiveTollsCount: 0,
      hasPirateZonesCount: 0, hasShipwrecksCount: 0,
      ghostTownCount: 0, isTrustedMerchantCount: 5, totalFiles: 10,
    } as any)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs[0]).toContain('excellent condition')
  })

  it('recommends fixing piracy', () => {
    const recs = generateRecommendations([], [], {
      avgCargoValue: 70, avgRouteEfficiency: 70, avgSafety: 70, avgTrust: 70,
      isProsperous: true, overallTradeHealth: 70,
    }, {
      hasPiracyCount: 3, hasDeadEndsCount: 0, hasExcessiveTollsCount: 0,
      hasPirateZonesCount: 0, hasShipwrecksCount: 0,
      ghostTownCount: 0, isTrustedMerchantCount: 5, totalFiles: 10,
    } as any)
    expect(recs.some((r) => r.includes('circular import'))).toBe(true)
  })

  it('recommends error handling for pirate zones', () => {
    const recs = generateRecommendations([], [], {
      avgCargoValue: 60, avgRouteEfficiency: 60, avgSafety: 40, avgTrust: 60,
      isProsperous: false, overallTradeHealth: 50,
    }, {
      hasPiracyCount: 0, hasDeadEndsCount: 0, hasExcessiveTollsCount: 0,
      hasPirateZonesCount: 2, hasShipwrecksCount: 0,
      ghostTownCount: 0, isTrustedMerchantCount: 5, totalFiles: 10,
    } as any)
    expect(recs.some((r) => r.includes('error handling'))).toBe(true)
  })

  it('recommends cleaning up dead ends', () => {
    const recs = generateRecommendations([], [], {
      avgCargoValue: 60, avgRouteEfficiency: 50, avgSafety: 60, avgTrust: 60,
      isProsperous: false, overallTradeHealth: 55,
    }, {
      hasPiracyCount: 0, hasDeadEndsCount: 5, hasExcessiveTollsCount: 0,
      hasPirateZonesCount: 0, hasShipwrecksCount: 0,
      ghostTownCount: 0, isTrustedMerchantCount: 5, totalFiles: 10,
    } as any)
    expect(recs.some((r) => r.includes('unused imports'))).toBe(true)
  })

  it('warns about critically low health', () => {
    const recs = generateRecommendations([], [], {
      avgCargoValue: 20, avgRouteEfficiency: 20, avgSafety: 20, avgTrust: 20,
      isProsperous: false, overallTradeHealth: 20,
    }, {
      hasPiracyCount: 0, hasDeadEndsCount: 0, hasExcessiveTollsCount: 0,
      hasPirateZonesCount: 0, hasShipwrecksCount: 0,
      ghostTownCount: 0, isTrustedMerchantCount: 5, totalFiles: 10,
    } as any)
    expect(recs.some((r) => r.includes('critically low'))).toBe(true)
  })
})

describe('buildSpiceRouteResult', () => {
  it('returns valid result for empty input', () => {
    const result = buildSpiceRouteResult([], [], {})
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalRoutes).toBe(0)
    expect(result.waypoints).toHaveLength(0)
    expect(result.routes).toHaveLength(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes a single file', () => {
    const code = '/** Core */\nexport function main(x: number): number { return x }\ntry { main(1) } catch(e) {}'
    const result = buildSpiceRouteResult(['core.ts'], [code], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.waypoints).toHaveLength(1)
    expect(result.waypoints[0].file).toBe('core.ts')
    expect(result.waypoints[0].cargoValue).toBeGreaterThan(0)
  })

  it('groups files by directory', () => {
    const code = 'export function a() {}'
    const result = buildSpiceRouteResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [code, code, code],
      {},
    )
    expect(result.routes.length).toBe(2)
  })

  it('computes network averages', () => {
    const code = '/** Docs */\nexport function core(): void {}'
    const result = buildSpiceRouteResult(['a.ts', 'b.ts'], [code, code], {})
    expect(result.network.avgCargoValue).toBeGreaterThan(0)
    expect(result.network.avgRouteEfficiency).toBeGreaterThan(0)
    expect(result.network.overallTradeHealth).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const code = 'export function a() {}'
    const result = buildSpiceRouteResult(['a.ts'], [code], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.merchantGrade).toBeDefined()
    expect(result.stats.mostValuable).toBe('a.ts')
  })

  it('classifies merchant grade based on health', () => {
    const richCode = [
      '/** Docs */',
      'export function core1(x: number): number { return x }',
      'export function core2(x: string): string { return x }',
      'export function core3(x: boolean): boolean { return x }',
      'export class Service {}',
      'export interface ICore {}',
      'try { core1(1) } catch(e) {}',
      "it('test', () => {})",
    ].join('\n')
    const result = buildSpiceRouteResult(['core.ts'], [richCode], {})
    expect(result.network.overallTradeHealth).toBeGreaterThan(40)
    expect(result.stats.merchantGrade).toBeDefined()
  })
})

describe('formatSpiceRouteTable', () => {
  it('produces non-empty table output', () => {
    const result = buildSpiceRouteResult(['a.ts'], ['export function a() {}'], {})
    const output = formatSpiceRouteTable(result, false)
    expect(output.length).toBeGreaterThan(0)
    expect(output).toContain('Spice Route Report')
  })

  it('includes verbose details when enabled', () => {
    const result = buildSpiceRouteResult(['a.ts'], ['export function a() {}'], {})
    const output = formatSpiceRouteTable(result, true)
    expect(output).toContain('Trade Waypoints')
  })
})

describe('formatSpiceRouteJson', () => {
  it('produces valid JSON', () => {
    const result = buildSpiceRouteResult(['a.ts'], ['function a() {}'], {})
    const json = formatSpiceRouteJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

describe('formatSpiceRouteCsv', () => {
  it('produces CSV with headers', () => {
    const result = buildSpiceRouteResult(['a.ts'], ['export function a() {}'], {})
    const csv = formatSpiceRouteCsv(result)
    const lines = csv.split('\n')
    expect(lines[0]).toContain('file')
    expect(lines.length).toBeGreaterThan(1)
  })
})

describe('integration: full pipeline', () => {
  it('analyzes a realistic multi-file codebase', () => {
    const files = ['src/core.ts', 'src/utils.ts', 'src/middleware.ts']
    const contents = [
      [
        '/** Core module */',
        'import { config } from "./config"',
        'export function process(data: string): string {',
        '  try {',
        '    return data.toUpperCase()',
        '  } catch(e) {',
        '    throw e',
        '  }',
        '}',
        'export function validate(input: unknown): boolean {',
        '  return typeof input === "string"',
        '}',
        "it('processes data', () => { expect(process('hello')).toBe('HELLO') })",
      ].join('\n'),
      [
        'function helper() { return 1 }',
        'function helper2() { return 2 }',
      ].join('\n'),
      [
        'app.use(logger())',
        'app.use(auth())',
        'app.use(cors())',
        'app.use(rateLimit())',
        'app.use(compress())',
        'app.use(helmet())',
      ].join('\n'),
    ]
    const result = buildSpiceRouteResult(files, contents, {})
    expect(result.waypoints).toHaveLength(3)
    expect(result.routes.length).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.network.overallTradeHealth).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles all cargo types across multiple files', () => {
    const files = ['gold.ts', 'salt.ts']
    const goldCode = Array.from({ length: 6 }, (_, i) =>
      `export function fn${i}() {}`
    ).join('\n') + '\nexport class A {}\nexport class B {}'
    const saltCode = 'const x = 1'
    const result = buildSpiceRouteResult(files, [goldCode, saltCode], {})
    expect(result.stats.goldCargoCount + result.stats.spiceCargoCount + result.stats.silkCargoCount + result.stats.saltCargoCount).toBeDefined()
  })
})
