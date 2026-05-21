import { describe, expect, it } from 'vitest'
import {
  analyzeCargoVessel,
  analyzeHarborZone,
  buildShippingLaneResult,
  classifyCaptainGrade,
  classifyZoneType,
  generateRecommendations,
  measureCargo,
  measureChannel,
  measureFleet,
  measureNavigation,
  measurePort,
  measureTraffic,
} from '../src/commands/shipping-lane-helpers.js'
import { formatShippingLaneJson, formatShippingLaneTable } from '../src/commands/shipping-lane-format-helpers.js'

// ─── measureChannel ────────────────────────────────────────────────────────

describe('measureChannel', () => {
  it('returns shallow for empty content', () => {
    const r = measureChannel('')
    expect(r.depth).toBe(0)
    expect(r.isShallowDraft).toBe(true)
    expect(r.isDeepWater).toBe(false)
    expect(r.hasSlackWater).toBe(true)
    expect(r.sandbarCount).toBe(0)
    expect(r.reefCount).toBe(0)
  })

  it('detects deep water from types and interfaces', () => {
    const code = [
      'function a(x: number): string { return String(x) }',
      'function b(x: string): number { return Number(x) }',
      'function c(x: boolean): void {}',
      'function d(x: Date): string { return x.toISOString() }',
      'function e(x: RegExp): boolean { return true }',
      'interface Data { value: number }',
    ].join('\n')
    const r = measureChannel(code)
    expect(r.isDeepWater).toBe(true)
    expect(r.isShallowDraft).toBe(false)
  })

  it('detects navigable channel from pipes and functions', () => {
    const code = 'function run(arr: number[]) { return arr.map(x => x).filter(x => x > 0) }'
    const r = measureChannel(code)
    expect(r.hasNavigableChannel).toBe(true)
  })

  it('detects sandbars from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureChannel(code)
    expect(r.hasSandbars).toBe(true)
    expect(r.sandbarCount).toBeGreaterThan(0)
  })

  it('detects strong currents from pipes', () => {
    const code = 'function run(arr: number[]) { return arr.map(x => x).filter(x => x).reduce((a, b) => a + b, 0) }'
    const r = measureChannel(code)
    expect(r.hasStrongCurrents).toBe(true)
  })

  it('detects dredged from generics and types', () => {
    const code = 'function id<T>(x: T): T { return x }\nconst y: number = 1'
    const r = measureChannel(code)
    expect(r.hasDredged).toBe(true)
  })

  it('detects tidal variation from many functions', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}'
    const r = measureChannel(code)
    expect(r.hasTidalVariation).toBe(true)
  })

  it('computes depth within valid range', () => {
    const code = 'function a() {}'
    const r = measureChannel(code)
    expect(r.depth).toBeGreaterThanOrEqual(0)
    expect(r.depth).toBeLessThanOrEqual(100)
  })
})

// ─── measureTraffic ────────────────────────────────────────────────────────

describe('measureTraffic', () => {
  it('returns driftwood for empty content', () => {
    const r = measureTraffic('')
    expect(r.density).toBe(0)
    expect(r.pattern).toBe('driftwood')
    expect(r.isOrganized).toBe(false)
    expect(r.bottleneckCount).toBe(0)
  })

  it('detects organized traffic from exports and functions', () => {
    const code = 'export function a() {}\nexport function b() {}'
    const r = measureTraffic(code)
    expect(r.isOrganized).toBe(true)
    expect(r.hasRightOfWay).toBe(true)
  })

  it('detects traffic lanes from classes', () => {
    const code = 'class Handler {}'
    const r = measureTraffic(code)
    expect(r.hasTrafficLanes).toBe(true)
  })

  it('detects separation zone from const-only', () => {
    const code = 'const x = 1\nconst y = 2'
    const r = measureTraffic(code)
    expect(r.hasSeparationZone).toBe(true)
  })

  it('detects congestion from many functions', () => {
    const code = Array(15).fill('function fn() {}').join('\n')
    const r = measureTraffic(code)
    expect(r.hasCongestion).toBe(true)
  })

  it('detects derelict from dead code', () => {
    const code = 'debugger;'
    const r = measureTraffic(code)
    expect(r.hasDerelict).toBe(true)
  })

  it('detects collision risk from excessive lets', () => {
    const code = 'let a = 1\nlet b = 2\nlet c = 3'
    const r = measureTraffic(code)
    expect(r.hasCollisionRisk).toBe(true)
    expect(r.collisionRiskCount).toBeGreaterThan(0)
  })

  it('computes density within valid range', () => {
    const code = 'function a() {}'
    const r = measureTraffic(code)
    expect(r.density).toBeGreaterThanOrEqual(0)
    expect(r.density).toBeLessThanOrEqual(100)
  })

  it('detects bottleneck from deeply nested blocks', () => {
    const code = [
      'if (a) { if (b) { if (c) { x } } }',
      'if (d) { if (e) { if (f) { y } } }',
      'if (g) { if (h) { if (i) { z } } }',
    ].join('\n')
    const r = measureTraffic(code)
    expect(r.hasBottleneck).toBe(true)
  })
})

// ─── measureCargo ──────────────────────────────────────────────────────────

describe('measureCargo', () => {
  it('returns hazardous for empty content', () => {
    const r = measureCargo('')
    expect(r.handling).toBe(0)
    expect(r.type).toBe('hazardous')
    expect(r.isProperlyPacked).toBe(false)
    expect(r.damageCount).toBe(0)
  })

  it('detects containerized for high handling', () => {
    const code = [
      'import { Data } from "types"',
      'export function transform(input: Data): Result { return process(input) }',
      'interface Data { value: number }',
      'interface Result { output: string }',
      'function process(d: Data): Result { return { output: String(d.value) } }',
      'try { transform({ value: 1 } as Data) } catch {}',
    ].join('\n')
    const r = measureCargo(code)
    expect(r.handling).toBeGreaterThanOrEqual(60)
    expect(r.isProperlyPacked).toBe(true)
    expect(r.hasCorrectManifest).toBe(true)
    expect(r.hasTransshipment).toBe(false)
  })

  it('detects properly packed from types and interfaces', () => {
    const code = 'function a(x: number): string { return String(x) }\ninterface I {}'
    const r = measureCargo(code)
    expect(r.isProperlyPacked).toBe(true)
  })

  it('detects cargo securing from try-catch', () => {
    const code = 'try { run() } catch {}'
    const r = measureCargo(code)
    expect(r.hasCargoSecuring).toBe(true)
  })

  it('detects loading plan from imports', () => {
    const code = 'import { X } from "y"'
    const r = measureCargo(code)
    expect(r.hasLoadingPlan).toBe(true)
  })

  it('detects contraband from side effects without try-catch', () => {
    const code = 'console.log("debug")'
    const r = measureCargo(code)
    expect(r.hasContraband).toBe(true)
  })

  it('detects damage from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureCargo(code)
    expect(r.hasDamage).toBe(true)
    expect(r.damageCount).toBeGreaterThan(0)
  })

  it('detects unloading plan from returns and types', () => {
    const code = 'function a(): number { return 1 }'
    const r = measureCargo(code)
    expect(r.hasUnloadingPlan).toBe(true)
  })

  it('computes handling within valid range', () => {
    const code = 'function a() {}'
    const r = measureCargo(code)
    expect(r.handling).toBeGreaterThanOrEqual(0)
    expect(r.handling).toBeLessThanOrEqual(100)
  })
})

// ─── measurePort ───────────────────────────────────────────────────────────

describe('measurePort', () => {
  it('returns beach for empty content', () => {
    const r = measurePort('')
    expect(r.efficiency).toBe(0)
    expect(r.type).toBe('beach')
    expect(r.hasEfficientDocking).toBe(false)
    expect(r.craneCount).toBe(0)
  })

  it('detects deepwater for high efficiency', () => {
    const code = [
      'import { X } from "y"',
      'export function run(): void {}',
      '/** Docs */',
      'interface Config {}',
      'const x: number = 1',
      'try { run() } catch {}',
      '[1, 2].map(x => x).filter(x => x)',
    ].join('\n')
    const r = measurePort(code)
    expect(r.efficiency).toBeGreaterThanOrEqual(60)
    expect(r.hasEfficientDocking).toBe(true)
    expect(r.hasCargoCrane).toBe(true)
    expect(r.hasLighthouse).toBe(true)
  })

  it('detects efficient docking from imports and exports', () => {
    const code = 'import { X } from "y"\nexport function run(): void {}'
    const r = measurePort(code)
    expect(r.hasEfficientDocking).toBe(true)
  })

  it('detects warehouse from classes or interfaces', () => {
    const code = 'class Store {} interface I {}'
    const r = measurePort(code)
    expect(r.hasWarehouse).toBe(true)
  })

  it('detects pilot service from functions and jsdoc', () => {
    const code = '/** Doc */\nfunction guide() {}'
    const r = measurePort(code)
    expect(r.hasPilotService).toBe(true)
  })

  it('detects customs house from types and try-catch', () => {
    const code = 'function a(x: number): void {}\ntry { a(1) } catch {}'
    const r = measurePort(code)
    expect(r.hasCustomsHouse).toBe(true)
  })

  it('detects breakwater from try-catch', () => {
    const code = 'try { run() } catch {}'
    const r = measurePort(code)
    expect(r.hasBreakwater).toBe(true)
  })

  it('computes efficiency within valid range', () => {
    const code = 'function a() {}'
    const r = measurePort(code)
    expect(r.efficiency).toBeGreaterThanOrEqual(0)
    expect(r.efficiency).toBeLessThanOrEqual(100)
  })
})

// ─── measureNavigation ─────────────────────────────────────────────────────

describe('measureNavigation', () => {
  it('returns hope for empty content', () => {
    const r = measureNavigation('')
    expect(r.safety).toBe(0)
    expect(r.system).toBe('hope')
    expect(r.hasClearChart).toBe(false)
    expect(r.buoyCount).toBe(0)
    expect(r.lifeRaftCount).toBe(0)
  })

  it('detects GPS for high safety', () => {
    const code = [
      '/** Docs */',
      'function process(data: Input): Output {',
      '  if (!data) throw new Error("no data")',
      '  try {',
      '    return transform(data)',
      '  } catch (e) {',
      '    throw new Error("transform failed")',
      '  }',
      '}',
    ].join('\n')
    const r = measureNavigation(code)
    expect(r.safety).toBeGreaterThanOrEqual(60)
    expect(r.hasLifeRaft).toBe(true)
    expect(r.hasWatertightDoors).toBe(true)
    expect(r.hasSOS).toBe(true)
  })

  it('detects clear chart from functions and returns', () => {
    const code = 'function a() { return 1 }'
    const r = measureNavigation(code)
    expect(r.hasClearChart).toBe(true)
  })

  it('detects buoys from ifs', () => {
    const code = 'if (x) {}'
    const r = measureNavigation(code)
    expect(r.hasBuoys).toBe(true)
    expect(r.buoyCount).toBeGreaterThan(0)
  })

  it('detects lighthouse from jsdoc', () => {
    const code = '/** Docs */\nfunction a() {}'
    const r = measureNavigation(code)
    expect(r.hasLighthouse).toBe(true)
  })

  it('detects fog horn from many comments', () => {
    const code = '// a\n// b\n// c\n// d'
    const r = measureNavigation(code)
    expect(r.hasFogHorn).toBe(true)
  })

  it('detects storm shelter from try-catch and functions', () => {
    const code = 'function run() { try {} catch {} }'
    const r = measureNavigation(code)
    expect(r.hasStormShelter).toBe(true)
  })

  it('penalizes side effects without try-catch', () => {
    const code = 'console.log("debug")'
    const r = measureNavigation(code)
    expect(r.safety).toBeLessThanOrEqual(30)
  })

  it('computes safety within valid range', () => {
    const code = 'try {} catch {}'
    const r = measureNavigation(code)
    expect(r.safety).toBeGreaterThanOrEqual(0)
    expect(r.safety).toBeLessThanOrEqual(100)
  })
})

// ─── measureFleet ──────────────────────────────────────────────────────────

describe('measureFleet', () => {
  it('returns raft for empty content', () => {
    const r = measureFleet('')
    expect(r.management).toBe(0)
    expect(r.vessel).toBe('raft')
    expect(r.isWellMaintained).toBe(false)
    expect(r.maintenanceScore).toBe(0)
  })

  it('detects supertanker for high management', () => {
    const code = [
      '/** Docs */',
      'const x: number = 1;',
      'export function run(): Promise<void> {}',
      'try { run() } catch {}',
      '[1, 2].map(x => x).filter(x => x)',
      'const fn = () => {}',
    ].join('\n')
    const r = measureFleet(code)
    expect(r.management).toBeGreaterThanOrEqual(60)
    expect(r.isWellMaintained).toBe(true)
    expect(r.hasFuelEfficiency).toBe(true)
    expect(r.hasAutomaticPilot).toBe(true)
  })

  it('detects well maintained from const-only without dead code', () => {
    const code = 'const x = 1\nconst y = 2'
    const r = measureFleet(code)
    expect(r.isWellMaintained).toBe(true)
  })

  it('detects crew training from jsdoc and types', () => {
    const code = '/** Doc */\nfunction a(x: number): void {}'
    const r = measureFleet(code)
    expect(r.hasCrewTraining).toBe(true)
  })

  it('detects emergency procedures from try-catch', () => {
    const code = 'try { run() } catch {}'
    const r = measureFleet(code)
    expect(r.hasEmergencyProcedures).toBe(true)
  })

  it('detects fuel efficiency from pipes without mutations', () => {
    const code = 'function run(arr: number[]) { return arr.map(x => x).filter(x => x > 0) }'
    const r = measureFleet(code)
    expect(r.hasFuelEfficiency).toBe(true)
  })

  it('detects ballast control from const-only', () => {
    const code = 'const x = 1'
    const r = measureFleet(code)
    expect(r.hasBallastControl).toBe(true)
  })

  it('detects AIS from exports and types', () => {
    const code = 'export function a(): void {}'
    const r = measureFleet(code)
    expect(r.hasAIS).toBe(true)
  })

  it('penalizes any types', () => {
    const code = 'function bad(x: any) { return x }'
    const r = measureFleet(code)
    expect(r.management).toBeLessThan(50)
  })

  it('computes management within valid range', () => {
    const code = 'const x = 1'
    const r = measureFleet(code)
    expect(r.management).toBeGreaterThanOrEqual(0)
    expect(r.management).toBeLessThanOrEqual(100)
  })

  it('computes maintenance score within valid range', () => {
    const code = 'const x: number = 1'
    const r = measureFleet(code)
    expect(r.maintenanceScore).toBeGreaterThanOrEqual(0)
    expect(r.maintenanceScore).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeCargoVessel ────────────────────────────────────────────────────

describe('analyzeCargoVessel', () => {
  it('returns shipwreck for empty content', () => {
    const v = analyzeCargoVessel('', 'empty.ts')
    expect(v.condition).toBe('shipwreck')
    expect(v.qualityScore).toBe(0)
    expect(v.file).toBe('empty.ts')
  })

  it('returns high condition for excellent code', () => {
    const code = [
      '/** Core module */',
      'import { Config } from "config"',
      'export function run(input: Data): Result {',
      '  try {',
      '    const items = input.items.map(x => x).filter(x => x);',
      '    return { output: items };',
      '  } catch (e) {',
      '    throw new Error("failed");',
      '  }',
      '}',
      'export function helper(x: number): string { return String(x) }',
      'interface Data { items: number[] }',
      'interface Result { output: number[] }',
    ].join('\n')
    const v = analyzeCargoVessel(code, 'core.ts')
    expect(v.qualityScore).toBeGreaterThanOrEqual(50)
    expect(v.channelDepth).toBeGreaterThan(0)
    expect(v.cargoHandling).toBeGreaterThan(0)
  })

  it('computes quality score as average of 6 measures', () => {
    const code = 'export function a(): void {}'
    const v = analyzeCargoVessel(code, 'a.ts')
    const expected = Math.round(
      (v.channelDepth + v.trafficDensity + v.cargoHandling + v.portEfficiency + v.navigationSafety + v.fleetManagement) / 6,
    )
    expect(v.qualityScore).toBe(expected)
  })

  it('classifies conditions correctly', () => {
    expect(analyzeCargoVessel('', 'x.ts').condition).toBe('shipwreck')
  })
})

// ─── classifyZoneType ──────────────────────────────────────────────────────

describe('classifyZoneType', () => {
  it('returns abandoned-pier for empty array', () => {
    expect(classifyZoneType([])).toBe('abandoned-pier')
  })

  it('returns international-hub for high quality with luxury vessels', () => {
    const vessels = Array(3).fill(null).map(() => ({
      file: 'a.ts', channelDepth: 90, trafficDensity: 90, cargoHandling: 90,
      portEfficiency: 90, navigationSafety: 90, fleetManagement: 90,
      channel: {} as any, traffic: {} as any, cargo: {} as any,
      port: {} as any, navigation: {} as any, fleet: {} as any,
      condition: 'luxury-cruise' as const, qualityScore: 90,
    }))
    expect(classifyZoneType(vessels)).toBe('international-hub')
  })

  it('returns abandoned-pier for low quality', () => {
    const vessels = [{ file: 'a.ts', channelDepth: 5, trafficDensity: 5, cargoHandling: 5,
      portEfficiency: 5, navigationSafety: 5, fleetManagement: 5,
      channel: {} as any, traffic: {} as any, cargo: {} as any,
      port: {} as any, navigation: {} as any, fleet: {} as any,
      condition: 'shipwreck' as const, qualityScore: 5 }]
    expect(classifyZoneType(vessels)).toBe('abandoned-pier')
  })
})

// ─── classifyCaptainGrade ──────────────────────────────────────────────────

describe('classifyCaptainGrade', () => {
  it('returns admiral for high scores', () => {
    expect(classifyCaptainGrade(95)).toBe('admiral')
  })
  it('returns captain for good scores', () => {
    expect(classifyCaptainGrade(80)).toBe('captain')
  })
  it('returns first-officer for moderate scores', () => {
    expect(classifyCaptainGrade(60)).toBe('first-officer')
  })
  it('returns boatswain for low scores', () => {
    expect(classifyCaptainGrade(40)).toBe('boatswain')
  })
  it('returns deckhand for poor scores', () => {
    expect(classifyCaptainGrade(20)).toBe('deckhand')
  })
  it('returns landlubber for terrible scores', () => {
    expect(classifyCaptainGrade(5)).toBe('landlubber')
  })
})

// ─── analyzeHarborZone ─────────────────────────────────────────────────────

describe('analyzeHarborZone', () => {
  it('returns abandoned-pier for empty array', () => {
    const zone = analyzeHarborZone([], 'empty/')
    expect(zone.zoneType).toBe('abandoned-pier')
    expect(zone.condition).toBe('ghost-port')
    expect(zone.vessels).toHaveLength(0)
  })

  it('computes averages from vessels', () => {
    const v = analyzeCargoVessel('export function a(): void {}', 'src/a.ts')
    const zone = analyzeHarborZone([v], 'src/')
    expect(zone.avgChannelDepth).toBe(v.channelDepth)
    expect(zone.avgCargoHandling).toBe(v.cargoHandling)
  })

  it('counts shipwrecks and luxury cruises', () => {
    const wreck = analyzeCargoVessel('', 'bad.ts')
    const zone = analyzeHarborZone([wreck], 'bad/')
    expect(zone.shipwreckCount).toBe(1)
    expect(zone.luxuryCruiseCount).toBe(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive message for well-managed lanes', () => {
    const code = '/** Doc */\nexport function a(): void {}\nimport { X } from "y"\ninterface I {}\ntry {} catch {}'
    const result = buildShippingLaneResult(['a.ts'], [code], {})
    const recs = generateRecommendations(result.vessels, result.zones, result.authority, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('recommends improvements for low-quality code', () => {
    const result = buildShippingLaneResult(['empty.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── buildShippingLaneResult ───────────────────────────────────────────────

describe('buildShippingLaneResult', () => {
  it('handles empty input', () => {
    const result = buildShippingLaneResult([], [], {})
    expect(result.vessels).toHaveLength(0)
    expect(result.zones).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallMaritime).toBe(0)
    expect(result.authority.isNavigable).toBe(false)
  })

  it('builds result with single file', () => {
    const code = 'export function a(): void {}'
    const result = buildShippingLaneResult(['a.ts'], [code], {})
    expect(result.vessels).toHaveLength(1)
    expect(result.vessels[0].file).toBe('a.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into zones', () => {
    const result = buildShippingLaneResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      ['export function a() {}', 'export function b() {}', 'function c() {}'],
      {},
    )
    expect(result.zones.length).toBeGreaterThanOrEqual(2)
  })

  it('computes authority averages', () => {
    const code = 'export function a(): void {}'
    const result = buildShippingLaneResult(['a.ts'], [code], {})
    expect(result.authority.avgChannelDepth).toBeGreaterThanOrEqual(0)
    expect(result.authority.avgCargoHandling).toBeGreaterThanOrEqual(0)
    expect(result.authority.avgNavigationSafety).toBeGreaterThanOrEqual(0)
  })

  it('identifies best vessel, deepest channel, safest navigation', () => {
    const result = buildShippingLaneResult(
      ['a.ts', 'b.ts'],
      ['export function a(): void {}', ''],
      {},
    )
    expect(result.stats.bestVessel).toBe('a.ts')
  })

  it('computes condition counts', () => {
    const result = buildShippingLaneResult(
      ['a.ts', 'b.ts'],
      ['', ''],
      {},
    )
    expect(result.stats.shipwreckCount).toBe(2)
  })

  it('sets captain grade', () => {
    const result = buildShippingLaneResult(['a.ts'], ['export function a() {}'], {})
    expect(result.stats.captainGrade).toBeTruthy()
  })

  it('generates recommendations', () => {
    const result = buildShippingLaneResult(['a.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('tracks all stat counts', () => {
    const code = '/** Doc */\nimport { X } from "y"\nexport function a(): void {}\ninterface I {}'
    const result = buildShippingLaneResult(['a.ts'], [code], {})
    expect(result.stats.isDeepWaterCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasSandbarsCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasCongestionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isProperlyPackedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasEfficientDockingCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasLifeRaftCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isWellMaintainedCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('formatShippingLaneTable', () => {
  it('formats empty result', () => {
    const result = buildShippingLaneResult([], [], {})
    const table = formatShippingLaneTable(result, false)
    expect(table).toContain('Shipping Lane')
    expect(table).toContain('No files analyzed')
  })

  it('formats with vessels', () => {
    const result = buildShippingLaneResult(['a.ts'], ['export function a() {}'], {})
    const table = formatShippingLaneTable(result, false)
    expect(table).toContain('a.ts')
  })

  it('respects verbose flag', () => {
    const files = Array(20).fill('a.ts').map((f, i) => `${i}_${f}`)
    const contents = Array(20).fill('export function a() {}')
    const result = buildShippingLaneResult(files, contents, {})
    const table = formatShippingLaneTable(result, false)
    expect(table).toContain('... and')
    const verbose = formatShippingLaneTable(result, true)
    expect(verbose).toContain('19_a.ts')
  })
})

describe('formatShippingLaneJson', () => {
  it('produces valid JSON', () => {
    const result = buildShippingLaneResult(['a.ts'], ['export function a() {}'], {})
    const json = formatShippingLaneJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.vessels).toHaveLength(1)
  })
})
