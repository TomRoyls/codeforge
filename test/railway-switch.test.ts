import { describe, expect, it } from 'vitest'
import {
  analyzeRailwayDivision,
  analyzeRailwaySegment,
  buildRailwaySwitchResult,
  classifyDivisionType,
  classifyStationMasterGrade,
  generateRecommendations,
  measureSafety,
  measureSignal,
  measureSwitching,
  measureTimetable,
  measureTrack,
  measureYard,
} from '../src/commands/railway-switch-helpers.js'
import { formatRailwaySwitchJson, formatRailwaySwitchTable } from '../src/commands/railway-switch-format-helpers.js'

// ─── measureTrack ───────────────────────────────────────────────────────────

describe('measureTrack', () => {
  it('returns monorail gauge for empty content', () => {
    const r = measureTrack('')
    expect(r.quality).toBe(20)
    expect(r.gauge).toBe('monorail')
    expect(r.isWellLaid).toBe(false)
    expect(r.hasContinuousRail).toBe(false)
    expect(r.deadEndCount).toBe(0)
    expect(r.spurCount).toBe(0)
  })

  it('detects curves from branches', () => {
    const code = 'if (x) { a() }'
    const r = measureTrack(code)
    expect(r.hasCurve).toBe(true)
  })

  it('detects gradient from loops', () => {
    const code = 'for (let i = 0; i < 10; i++) {}'
    const r = measureTrack(code)
    expect(r.hasGradient).toBe(true)
  })

  it('detects switchback from nested ifs', () => {
    const code = 'if (x) { if (y) { a() } }'
    const r = measureTrack(code)
    expect(r.hasSwitchback).toBe(true)
  })

  it('detects proper ballast from types', () => {
    const code = 'type X = { a: number }'
    const r = measureTrack(code)
    expect(r.hasProperBallast).toBe(true)
  })

  it('detects continuous rail from returns', () => {
    const code = 'function a() { return 1 }'
    const r = measureTrack(code)
    expect(r.hasContinuousRail).toBe(true)
  })

  it('detects level crossing from imports', () => {
    const code = 'import { X } from "y"'
    const r = measureTrack(code)
    expect(r.hasLevelCrossing).toBe(true)
  })

  it('detects rail gap from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureTrack(code)
    expect(r.hasRailGap).toBe(true)
  })

  it('computes quality within valid range', () => {
    const code = 'if (x) { a() } else { b() }'
    const r = measureTrack(code)
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })

  it('detects well laid track', () => {
    const code = [
      'export function a(): void {}',
      'function b(): number { return 1 }',
      'function c(): string { return "" }',
      'interface I { x: number }',
      'if (x) { a() } else { b() }',
    ].join('\n')
    const r = measureTrack(code)
    expect(r.isWellLaid).toBe(true)
  })
})

// ─── measureSwitching ───────────────────────────────────────────────────────

describe('measureSwitching', () => {
  it('returns derail for empty content', () => {
    const r = measureSwitching('')
    expect(r.reliability).toBe(40)
    expect(r.type).toBe('derail')
    expect(r.isReliable).toBe(false)
    expect(r.failureCount).toBe(0)
    expect(r.wrongRouteCount).toBe(0)
  })

  it('detects points from if/else', () => {
    const code = 'if (x) { a() } else { b() }'
    const r = measureSwitching(code)
    expect(r.type).toBe('points')
    expect(r.hasNormalPosition).toBe(true)
    expect(r.hasFacingPoint).toBe(true)
  })

  it('detects slip from switch', () => {
    const code = 'switch (x) { case 1: a(); break; case 2: b(); break; }'
    const r = measureSwitching(code)
    expect(r.type).toBe('slip')
    expect(r.hasTrailingPoint).toBe(true)
  })

  it('detects double-slip from switch with many cases', () => {
    const code = 'switch (x) { case 1: a(); case 2: b(); case 3: c(); case 4: d(); }'
    const r = measureSwitching(code)
    expect(r.type).toBe('double-slip')
  })

  it('detects crossover from else-if chains', () => {
    const code = 'if (a) {} else if (b) {} else if (c) {} else if (d) {}'
    const r = measureSwitching(code)
    expect(r.type).toBe('crossover')
    expect(r.hasReversePosition).toBe(true)
  })

  it('detects points failure from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureSwitching(code)
    expect(r.hasPointsFailure).toBe(true)
    expect(r.failureCount).toBeGreaterThan(0)
  })

  it('detects wrong route from excessive ternaries', () => {
    const code = 'const a = x ? 1 : 2\nconst b = y ? 3 : 4\nconst c = z ? 5 : 6\nconst d = w ? 7 : 8\nif (m) {}'
    const r = measureSwitching(code)
    expect(r.hasWrongRoute).toBe(true)
    expect(r.wrongRouteCount).toBeGreaterThan(0)
  })

  it('detects proper alignment', () => {
    const code = 'if (x) { a() } else { b() }'
    const r = measureSwitching(code)
    expect(r.hasProperAlignment).toBe(true)
  })

  it('computes reliability within valid range', () => {
    const code = 'if (x) { a() }'
    const r = measureSwitching(code)
    expect(r.reliability).toBeGreaterThanOrEqual(0)
    expect(r.reliability).toBeLessThanOrEqual(100)
  })
})

// ─── measureSignal ──────────────────────────────────────────────────────────

describe('measureSignal', () => {
  it('returns none system for empty content', () => {
    const r = measureSignal('')
    expect(r.clarity).toBe(25)
    expect(r.system).toBe('mechanical')
    expect(r.hasClearAspect).toBe(false)
    expect(r.missingSignalCount).toBeGreaterThanOrEqual(0)
  })

  it('detects green signal from jsdoc', () => {
    const code = '/** Doc */\nfunction a() {}'
    const r = measureSignal(code)
    expect(r.hasGreenSignal).toBe(true)
    expect(r.hasDistantSignal).toBe(true)
  })

  it('detects yellow signal from ternaries', () => {
    const code = 'const x = a ? 1 : 2'
    const r = measureSignal(code)
    expect(r.hasYellowSignal).toBe(true)
  })

  it('detects yellow signal from anys', () => {
    const code = 'function a(x: any): any { return x }'
    const r = measureSignal(code)
    expect(r.hasYellowSignal).toBe(true)
  })

  it('detects home signal from exports', () => {
    const code = 'export function a() {}'
    const r = measureSignal(code)
    expect(r.hasHomeSignal).toBe(true)
  })

  it('detects calling on from limited ternaries', () => {
    const code = 'const x = a ? 1 : 2'
    const r = measureSignal(code)
    expect(r.hasCallingOn).toBe(true)
  })

  it('detects shunt signal from functions with ifs', () => {
    const code = 'function a() { if (x) {} }'
    const r = measureSignal(code)
    expect(r.hasShuntSignal).toBe(true)
  })

  it('detects banner repeater from many comments', () => {
    const code = Array(7).fill('// comment').join('\n')
    const r = measureSignal(code)
    expect(r.hasBannerRepeater).toBe(true)
  })

  it('detects interlocked from if/else', () => {
    const code = 'if (x) { a() } else { b() }'
    const r = measureSignal(code)
    expect(r.isInterlocked).toBe(true)
  })

  it('computes clarity within valid range', () => {
    const code = 'if (x) {}'
    const r = measureSignal(code)
    expect(r.clarity).toBeGreaterThanOrEqual(0)
    expect(r.clarity).toBeLessThanOrEqual(100)
  })
})

// ─── measureTimetable ───────────────────────────────────────────────────────

describe('measureTimetable', () => {
  it('returns low adherence for empty content', () => {
    const r = measureTimetable('')
    expect(r.adherence).toBe(35)
    expect(r.isOnSchedule).toBe(false)
    expect(r.hasRegularService).toBe(false)
    expect(r.delayCount).toBe(0)
    expect(r.cancellationCount).toBe(0)
  })

  it('detects regular service from typed functions', () => {
    const code = 'function a(): void {}\ntype X = number'
    const r = measureTimetable(code)
    expect(r.hasRegularService).toBe(true)
  })

  it('detects express from async', () => {
    const code = 'async function run() {}'
    const r = measureTimetable(code)
    expect(r.hasExpress).toBe(true)
  })

  it('detects local from functions', () => {
    const code = 'function a() {}'
    const r = measureTimetable(code)
    expect(r.hasLocal).toBe(true)
  })

  it('detects freight from promises', () => {
    const code = 'async function a() {}\nasync function b() {}'
    const r = measureTimetable(code)
    expect(r.hasFreight).toBe(true)
  })

  it('detects delay from console statements', () => {
    const code = 'console.log("debug")'
    const r = measureTimetable(code)
    expect(r.hasDelay).toBe(true)
    expect(r.delayCount).toBeGreaterThan(0)
  })

  it('detects cancellation from any types', () => {
    const code = 'function bad(x: any) { return x }'
    const r = measureTimetable(code)
    expect(r.hasCancellation).toBe(true)
    expect(r.cancellationCount).toBeGreaterThan(0)
  })

  it('detects buffer time from jsdoc', () => {
    const code = '/** Doc */\nfunction a() {}'
    const r = measureTimetable(code)
    expect(r.hasBufferTime).toBe(true)
  })

  it('detects on schedule', () => {
    const code = 'function a(): void {}\ntype X = number'
    const r = measureTimetable(code)
    expect(r.isOnSchedule).toBe(true)
  })

  it('computes adherence within valid range', () => {
    const code = 'function a() {}'
    const r = measureTimetable(code)
    expect(r.adherence).toBeGreaterThanOrEqual(0)
    expect(r.adherence).toBeLessThanOrEqual(100)
  })
})

// ─── measureYard ────────────────────────────────────────────────────────────

describe('measureYard', () => {
  it('returns siding for empty content', () => {
    const r = measureYard('')
    expect(r.efficiency).toBe(15)
    expect(r.type).toBe('siding')
    expect(r.isWellOrganized).toBe(false)
    expect(r.sidingCount).toBe(0)
  })

  it('detects through track from exports', () => {
    const code = 'export function a() {}'
    const r = measureYard(code)
    expect(r.hasThroughTrack).toBe(true)
    expect(r.hasDepartureRoad).toBe(true)
  })

  it('detects siding from multiple functions', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}'
    const r = measureYard(code)
    expect(r.hasSiding).toBe(true)
  })

  it('detects head shunt from classes', () => {
    const code = 'class Handler {}'
    const r = measureYard(code)
    expect(r.hasHeadShunt).toBe(true)
  })

  it('detects hump from array methods', () => {
    const code = 'arr.map(x => x)'
    const r = measureYard(code)
    expect(r.hasHump).toBe(true)
  })

  it('detects rolling road from map and filter', () => {
    const code = 'arr.map(x => x).filter(x => x)'
    const r = measureYard(code)
    expect(r.hasRollingRoad).toBe(true)
  })

  it('detects arrival road from imports', () => {
    const code = 'import { X } from "y"'
    const r = measureYard(code)
    expect(r.hasArrivalRoad).toBe(true)
  })

  it('detects repair shop from class with functions', () => {
    const code = 'class Handler {}\nfunction helper() {}'
    const r = measureYard(code)
    expect(r.hasRepairShop).toBe(true)
  })

  it('detects roundhouse from multiple classes', () => {
    const code = 'class A {}\nclass B {}'
    const r = measureYard(code)
    expect(r.hasRoundhouse).toBe(true)
  })

  it('detects well organized', () => {
    const code = [
      'export function a(): void {}',
      'function b(): void {}',
      'function c(): void {}',
      'class Handler {}',
    ].join('\n')
    const r = measureYard(code)
    expect(r.isWellOrganized).toBe(true)
  })

  it('computes efficiency within valid range', () => {
    const code = 'function a() {}'
    const r = measureYard(code)
    expect(r.efficiency).toBeGreaterThanOrEqual(0)
    expect(r.efficiency).toBeLessThanOrEqual(100)
  })
})

// ─── measureSafety ──────────────────────────────────────────────────────────

describe('measureSafety', () => {
  it('returns low systems for empty content', () => {
    const r = measureSafety('')
    expect(r.systems).toBe(10)
    expect(r.hasAutomaticBrake).toBe(false)
    expect(r.hasTrackCircuit).toBe(false)
    expect(r.hasPTC).toBe(false)
    expect(r.missingSystemCount).toBeGreaterThan(0)
  })

  it('detects automatic brake from try', () => {
    const code = 'try { run() } catch (e) { handle(e) }'
    const r = measureSafety(code)
    expect(r.hasAutomaticBrake).toBe(true)
    expect(r.hasTrackCircuit).toBe(true)
  })

  it('detects AWS from finally', () => {
    const code = 'try {} catch {} finally { cleanup() }'
    const r = measureSafety(code)
    expect(r.hasAWS).toBe(true)
  })

  it('detects TPWS from throw', () => {
    const code = 'throw new Error("fail")'
    const r = measureSafety(code)
    expect(r.hasTPWS).toBe(true)
  })

  it('detects dead mans switch from throw + Error', () => {
    const code = 'throw new Error("fail")'
    const r = measureSafety(code)
    expect(r.hasDeadMansSwitch).toBe(true)
  })

  it('detects catch points from catch + finally', () => {
    const code = 'try {} catch {} finally {}'
    const r = measureSafety(code)
    expect(r.hasCatchPoints).toBe(true)
  })

  it('detects buffer stops from types', () => {
    const code = 'type X = { a: number }'
    const r = measureSafety(code)
    expect(r.hasBufferStops).toBe(true)
  })

  it('detects fire suppression from try/catch/finally', () => {
    const code = 'try { run() } catch (e) { handle(e) } finally { cleanup() }'
    const r = measureSafety(code)
    expect(r.hasFireSuppression).toBe(true)
  })

  it('detects emergency brake from try + throw', () => {
    const code = 'try { run() } catch (e) { throw e }'
    const r = measureSafety(code)
    expect(r.hasEmergencyBrake).toBe(true)
  })

  it('detects PTC from comprehensive safety', () => {
    const code = [
      'try { run() } catch (e) { handle(e) }',
      'interface Config { name: string }',
    ].join('\n')
    const r = measureSafety(code)
    expect(r.hasPTC).toBe(true)
  })

  it('computes systems within valid range', () => {
    const code = 'try {} catch {}'
    const r = measureSafety(code)
    expect(r.systems).toBeGreaterThanOrEqual(0)
    expect(r.systems).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeRailwaySegment ──────────────────────────────────────────────────

describe('analyzeRailwaySegment', () => {
  it('returns narrow-gauge for empty content', () => {
    const seg = analyzeRailwaySegment('', 'empty.ts')
    expect(seg.condition).toBe('narrow-gauge')
    expect(seg.qualityScore).toBeLessThan(30)
    expect(seg.file).toBe('empty.ts')
  })

  it('computes quality score as average of 6 measures', () => {
    const code = 'if (x) { a() } else { b() }'
    const seg = analyzeRailwaySegment(code, 'a.ts')
    const expected = Math.round(
      (seg.trackQuality + seg.switchReliability + seg.signalClarity +
       seg.timetableAdherence + seg.yardEfficiency + seg.safetySystems) / 6,
    )
    expect(seg.qualityScore).toBe(expected)
  })

  it('measures all six dimensions', () => {
    const code = 'export function a(): void { if (x) {} }'
    const seg = analyzeRailwaySegment(code, 'a.ts')
    expect(seg.trackQuality).toBeGreaterThanOrEqual(0)
    expect(seg.switchReliability).toBeGreaterThanOrEqual(0)
    expect(seg.signalClarity).toBeGreaterThanOrEqual(0)
    expect(seg.timetableAdherence).toBeGreaterThanOrEqual(0)
    expect(seg.yardEfficiency).toBeGreaterThanOrEqual(0)
    expect(seg.safetySystems).toBeGreaterThanOrEqual(0)
  })

  it('classifies regional-rail for good quality code', () => {
    const code = [
      '/** Doc */',
      'import { X } from "y"',
      'export function a(): void { if (x) { run() } else { stop() } }',
      'interface Config { name: string }',
      'try { run() } catch (e) { handle(e) }',
    ].join('\n')
    const seg = analyzeRailwaySegment(code, 'good.ts')
    expect(seg.qualityScore).toBeGreaterThanOrEqual(60)
    expect(['regional-rail', 'express-service', 'bullet-train']).toContain(seg.condition)
  })
})

// ─── classifyDivisionType ───────────────────────────────────────────────────

describe('classifyDivisionType', () => {
  it('returns abandoned for empty array', () => {
    expect(classifyDivisionType([])).toBe('abandoned')
  })

  it('returns high-speed for high quality', () => {
    const segs = Array(3).fill(null).map(() => ({
      ...analyzeRailwaySegment('/** Doc */\nexport function a(): void { if (x) {} else {} }', 'a.ts'),
      qualityScore: 90,
    }))
    expect(classifyDivisionType(segs)).toBe('high-speed')
  })

  it('returns abandoned for very low quality', () => {
    const segs = [{ ...analyzeRailwaySegment('', 'x.ts'), qualityScore: 3 }]
    expect(classifyDivisionType(segs)).toBe('abandoned')
  })
})

// ─── classifyStationMasterGrade ─────────────────────────────────────────────

describe('classifyStationMasterGrade', () => {
  it('returns chief-inspector for high scores', () => {
    expect(classifyStationMasterGrade(95)).toBe('chief-inspector')
  })
  it('returns station-master for good scores', () => {
    expect(classifyStationMasterGrade(75)).toBe('station-master')
  })
  it('returns signalman for moderate scores', () => {
    expect(classifyStationMasterGrade(55)).toBe('signalman')
  })
  it('returns pointsman for low scores', () => {
    expect(classifyStationMasterGrade(35)).toBe('pointsman')
  })
  it('returns porter for poor scores', () => {
    expect(classifyStationMasterGrade(18)).toBe('porter')
  })
  it('returns hobo for terrible scores', () => {
    expect(classifyStationMasterGrade(5)).toBe('hobo')
  })
})

// ─── analyzeRailwayDivision ─────────────────────────────────────────────────

describe('analyzeRailwayDivision', () => {
  it('returns abandoned for empty array', () => {
    const div = analyzeRailwayDivision([], 'empty/')
    expect(div.divisionType).toBe('abandoned')
    expect(div.condition).toBe('disused-track')
    expect(div.segments).toHaveLength(0)
  })

  it('computes averages from segments', () => {
    const seg = analyzeRailwaySegment('export function a(): void {}', 'src/a.ts')
    const div = analyzeRailwayDivision([seg], 'src/')
    expect(div.avgTrackQuality).toBe(seg.trackQuality)
    expect(div.avgSwitchReliability).toBe(seg.switchReliability)
  })

  it('counts bullet trains and derailments', () => {
    const good = analyzeRailwaySegment('/** Doc */\nexport function a(): void { if (x) { run() } else { stop() } }\ninterface I {}\ntry { run() } catch (e) { handle(e) }', 'good.ts')
    const bad = analyzeRailwaySegment('', 'bad.ts')
    const div = analyzeRailwayDivision([good, bad], 'mix/')
    expect(div.derailmentCount + div.bulletTrainCount).toBeLessThanOrEqual(2)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive message for healthy railway', () => {
    const code = [
      '/** Doc */',
      'import { X } from "y"',
      'export function a(): void { if (x) {} else {} }',
      'interface I {}',
      'try {} catch {} finally {}',
    ].join('\n')
    const result = buildRailwaySwitchResult(['a.ts'], [code], {})
    const recs = generateRecommendations(result.segments, result.divisions, result.network, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('recommends fixes for low-quality code', () => {
    const result = buildRailwaySwitchResult(['empty.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── buildRailwaySwitchResult ───────────────────────────────────────────────

describe('buildRailwaySwitchResult', () => {
  it('handles empty input', () => {
    const result = buildRailwaySwitchResult([], [], {})
    expect(result.segments).toHaveLength(0)
    expect(result.divisions).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallRailway).toBe(0)
    expect(result.network.isOnRails).toBe(false)
  })

  it('builds result with single file', () => {
    const code = 'export function a(): void {}'
    const result = buildRailwaySwitchResult(['a.ts'], [code], {})
    expect(result.segments).toHaveLength(1)
    expect(result.segments[0].file).toBe('a.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into divisions', () => {
    const result = buildRailwaySwitchResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      ['export function a() {}', 'export function b() {}', 'function c() {}'],
      {},
    )
    expect(result.divisions.length).toBeGreaterThanOrEqual(2)
  })

  it('computes network averages', () => {
    const code = 'export function a(): void { if (x) {} else {} }'
    const result = buildRailwaySwitchResult(['a.ts'], [code], {})
    expect(result.network.avgTrackQuality).toBeGreaterThanOrEqual(0)
    expect(result.network.avgSwitchReliability).toBeGreaterThanOrEqual(0)
    expect(result.network.avgSignalClarity).toBeGreaterThanOrEqual(0)
  })

  it('identifies best segment, track, switching', () => {
    const result = buildRailwaySwitchResult(
      ['a.ts', 'b.ts'],
      ['export function a(): void { if (x) {} else {} }', ''],
      {},
    )
    expect(result.stats.bestSegment).toBe('a.ts')
  })

  it('computes condition counts', () => {
    const result = buildRailwaySwitchResult(
      ['a.ts', 'b.ts'],
      ['', ''],
      {},
    )
    expect(result.stats.derailmentCount + result.stats.narrowGaugeCount).toBeGreaterThanOrEqual(2)
  })

  it('sets station master grade', () => {
    const result = buildRailwaySwitchResult(['a.ts'], ['export function a() {}'], {})
    expect(result.stats.stationMasterGrade).toBeTruthy()
  })

  it('generates recommendations', () => {
    const result = buildRailwaySwitchResult(['a.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('tracks all stat counts', () => {
    const code = '/** Doc */\nimport { X } from "y"\nexport function a(): void { if (x) {} else {} }\ninterface I {}'
    const result = buildRailwaySwitchResult(['a.ts'], [code], {})
    expect(result.stats.isWellLaidCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasDeadEndCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasRailGapCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isReliableCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasPointsFailureCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasClearAspectCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isInterlockedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isOnScheduleCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasDelayCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isWellOrganizedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasAutomaticBrakeCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasBufferStopsCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasEmergencyBrakeCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('formatRailwaySwitchTable', () => {
  it('formats empty result', () => {
    const result = buildRailwaySwitchResult([], [], {})
    const table = formatRailwaySwitchTable(result, false)
    expect(table).toContain('Railway Switch')
    expect(table).toContain('No files analyzed')
  })

  it('formats with segments', () => {
    const result = buildRailwaySwitchResult(['a.ts'], ['export function a() {}'], {})
    const table = formatRailwaySwitchTable(result, false)
    expect(table).toContain('a.ts')
  })

  it('respects verbose flag', () => {
    const files = Array(20).fill('a.ts').map((f, i) => `${i}_${f}`)
    const contents = Array(20).fill('export function a() {}')
    const result = buildRailwaySwitchResult(files, contents, {})
    const table = formatRailwaySwitchTable(result, false)
    expect(table).toContain('... and')
    const verbose = formatRailwaySwitchTable(result, true)
    expect(verbose).toContain('19_a.ts')
  })
})

describe('formatRailwaySwitchJson', () => {
  it('produces valid JSON', () => {
    const result = buildRailwaySwitchResult(['a.ts'], ['export function a() {}'], {})
    const json = formatRailwaySwitchJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.segments).toHaveLength(1)
  })
})
