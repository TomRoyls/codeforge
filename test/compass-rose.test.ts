import { describe, it, expect } from 'vitest'
import {
  measureDirecting, measureBearing, measureNavigating, measureOrienting, measureCharting,
  classifyBearingCondition, classifyChartType, classifyCaptainGrade, classifyChartCondition,
  generateRecommendations, analyzeCompassBearing, analyzeNavigationChart,
  buildCompassRoseResult,
} from '../src/commands/compass-rose-helpers.js'
import {
  colorScore, colorGrade, formatBearingTable, formatBearingsTable,
  formatChartTable, formatChartsTable, formatStatsTable,
  formatRecommendations, formatResultTable, formatResultJson,
} from '../src/commands/compass-rose-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const EMPTY = ''

const RICH = [
  '/**',
  ' * Doc comment',
  ' */',
  'export interface Foo<T> { readonly bar: string }',
  'export type Result = string | number',
  'export class MyClass {',
  '  private x: number = 0',
  '}',
  'export const fn = async (): Promise<string> => {',
  '  const a: string = \'hello\'',
  '  if (a === \'test\') { return a }',
  '  return \'world\'',
  '}',
  'import path from \'node:path\'',
].join('\n')

const MINIMAL = 'const x = 1'

const BAD = 'export var x: any = 1; var y: any = 2; debugger;'

// ─── measureDirecting ──────────────────────────────────────────────

describe('measureDirecting', () => {
  it('returns clarity=0 and spinning-compass for empty content', () => {
    const m = measureDirecting(EMPTY)
    expect(m.clarity).toBe(0)
    expect(m.grade).toBe('spinning-compass')
  })

  it('returns clarity=100 and true-north for rich content', () => {
    const m = measureDirecting(RICH)
    expect(m.clarity).toBe(100)
    expect(m.grade).toBe('true-north')
  })

  it('returns clarity=8 for minimal content (only const)', () => {
    expect(measureDirecting(MINIMAL).clarity).toBe(8)
  })

  it('detects confused and aimless in bad content', () => {
    const m = measureDirecting(BAD)
    expect(m.confusedCount).toBe(2)
    expect(m.aimlessCount).toBe(2)
    expect(m.hasNoConfused).toBe(false)
    expect(m.hasNoAimless).toBe(false)
  })

  it('sets hasHighClarity=true for rich content', () => {
    expect(measureDirecting(RICH).hasHighClarity).toBe(true)
  })

  it('sets hasHighClarity=false for empty content', () => {
    expect(measureDirecting(EMPTY).hasHighClarity).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureDirecting(RICH)
    expect(m.hasFocused).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasPurposeful).toBe(true)
    expect(m.hasDirected).toBe(true)
    expect(m.hasIntentional).toBe(true)
    expect(m.hasResolute).toBe(true)
  })

  it('detects debugger via hasNoRandom=false for bad content', () => {
    expect(measureDirecting(BAD).hasNoRandom).toBe(false)
  })

  it('has no wandering for clean content', () => {
    expect(measureDirecting(RICH).hasNoWandering).toBe(true)
    expect(measureDirecting(MINIMAL).hasNoWandering).toBe(true)
  })
})

// ─── measureBearing ────────────────────────────────────────────────

describe('measureBearing', () => {
  it('returns accuracy=0 and broken-compass for empty content', () => {
    const m = measureBearing(EMPTY)
    expect(m.accuracy).toBe(0)
    expect(m.compass).toBe('broken-compass')
  })

  it('returns accuracy=100 and gyroscopic for rich content', () => {
    const m = measureBearing(RICH)
    expect(m.accuracy).toBe(100)
    expect(m.compass).toBe('gyroscopic')
  })

  it('returns accuracy=8 for minimal content (only const)', () => {
    expect(measureBearing(MINIMAL).accuracy).toBe(8)
  })

  it('detects wrong and imprecise in bad content', () => {
    const m = measureBearing(BAD)
    expect(m.wrongCount).toBe(2)
    expect(m.impreciseCount).toBe(2)
    expect(m.hasNoWrong).toBe(false)
    expect(m.hasNoImprecise).toBe(false)
  })

  it('sets hasHighAccuracy=true for rich content', () => {
    expect(measureBearing(RICH).hasHighAccuracy).toBe(true)
  })

  it('sets hasHighAccuracy=false for empty content', () => {
    expect(measureBearing(EMPTY).hasHighAccuracy).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureBearing(RICH)
    expect(m.hasCorrect).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasTrue).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasReliable).toBe(true)
  })

  it('detects debugger via hasNoApproximate=false for bad content', () => {
    expect(measureBearing(BAD).hasNoApproximate).toBe(false)
  })

  it('has no false positives for clean content', () => {
    expect(measureBearing(RICH).hasNoFalse).toBe(true)
  })
})

// ─── measureNavigating ─────────────────────────────────────────────

describe('measureNavigating', () => {
  it('returns quality=0 and unmarked-trail for empty content', () => {
    const m = measureNavigating(EMPTY)
    expect(m.quality).toBe(0)
    expect(m.nav).toBe('unmarked-trail')
  })

  it('returns quality=100 and gps-grade for rich content', () => {
    const m = measureNavigating(RICH)
    expect(m.quality).toBe(100)
    expect(m.nav).toBe('gps-grade')
  })

  it('returns quality=8 for minimal content (only const)', () => {
    expect(measureNavigating(MINIMAL).quality).toBe(8)
  })

  it('detects hidden and obscured in bad content', () => {
    const m = measureNavigating(BAD)
    expect(m.hiddenCount).toBe(2)
    expect(m.obscuredCount).toBe(2)
    expect(m.hasNoHidden).toBe(false)
    expect(m.hasNoObscured).toBe(false)
  })

  it('sets hasHighQuality=true for rich content', () => {
    expect(measureNavigating(RICH).hasHighQuality).toBe(true)
  })

  it('sets hasHighQuality=false for empty content', () => {
    expect(measureNavigating(EMPTY).hasHighQuality).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureNavigating(RICH)
    expect(m.hasDiscoverable).toBe(true)
    expect(m.hasFindable).toBe(true)
    expect(m.hasAccessible).toBe(true)
    expect(m.hasIntuitive).toBe(true)
    expect(m.hasApproachable).toBe(true)
    expect(m.hasWelcoming).toBe(true)
  })

  it('detects debugger via hasNoDaunting=false for bad content', () => {
    expect(measureNavigating(BAD).hasNoDaunting).toBe(false)
  })

  it('has no cryptic for clean content', () => {
    expect(measureNavigating(RICH).hasNoCryptic).toBe(true)
  })
})

// ─── measureOrienting ──────────────────────────────────────────────

describe('measureOrienting', () => {
  it('returns stability=0 and tumbling for empty content', () => {
    const m = measureOrienting(EMPTY)
    expect(m.stability).toBe(0)
    expect(m.orientation).toBe('tumbling')
  })

  it('returns stability=100 and rock-steady for rich content', () => {
    const m = measureOrienting(RICH)
    expect(m.stability).toBe(100)
    expect(m.orientation).toBe('rock-steady')
  })

  it('returns stability=10 for minimal content (only const)', () => {
    expect(measureOrienting(MINIMAL).stability).toBe(10)
  })

  it('detects fluctuating and erratic in bad content', () => {
    const m = measureOrienting(BAD)
    expect(m.fluctuatingCount).toBe(2)
    expect(m.erraticCount).toBe(2)
    expect(m.hasNoFluctuating).toBe(false)
    expect(m.hasNoErratic).toBe(false)
  })

  it('sets hasHighStability=true for rich content', () => {
    expect(measureOrienting(RICH).hasHighStability).toBe(true)
  })

  it('sets hasHighStability=false for empty content', () => {
    expect(measureOrienting(EMPTY).hasHighStability).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureOrienting(RICH)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasReliable).toBe(true)
    expect(m.hasUniform).toBe(true)
    expect(m.hasPredictable).toBe(true)
    expect(m.hasSteady).toBe(true)
  })

  it('detects debugger via hasNoVolatile=false for bad content', () => {
    expect(measureOrienting(BAD).hasNoVolatile).toBe(false)
  })

  it('has no inconsistent for clean content', () => {
    expect(measureOrienting(RICH).hasNoInconsistent).toBe(true)
  })
})

// ─── measureCharting ───────────────────────────────────────────────

describe('measureCharting', () => {
  it('returns precision=0 and no-map for empty content', () => {
    const m = measureCharting(EMPTY)
    expect(m.precision).toBe(0)
    expect(m.chart).toBe('no-map')
  })

  it('returns precision=100 and detailed-chart for rich content', () => {
    const m = measureCharting(RICH)
    expect(m.precision).toBe(100)
    expect(m.chart).toBe('detailed-chart')
  })

  it('returns precision=8 for minimal content (only const)', () => {
    expect(measureCharting(MINIMAL).precision).toBe(8)
  })

  it('detects undocumented and unmarked in bad content', () => {
    const m = measureCharting(BAD)
    expect(m.undocumentedCount).toBe(2)
    expect(m.unmarkedCount).toBe(2)
    expect(m.hasNoUndocumented).toBe(false)
    expect(m.hasNoUnmarked).toBe(false)
  })

  it('sets hasHighPrecision=true for rich content', () => {
    expect(measureCharting(RICH).hasHighPrecision).toBe(true)
  })

  it('sets hasHighPrecision=false for empty content', () => {
    expect(measureCharting(EMPTY).hasHighPrecision).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureCharting(RICH)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasDescribed).toBe(true)
    expect(m.hasAnnotated).toBe(true)
    expect(m.hasExplained).toBe(true)
    expect(m.hasDetailed).toBe(true)
    expect(m.hasMapped).toBe(true)
  })

  it('detects debugger via hasNoVague=false for bad content', () => {
    expect(measureCharting(BAD).hasNoVague).toBe(false)
  })

  it('has no unexplained for clean content', () => {
    expect(measureCharting(RICH).hasNoUnexplained).toBe(true)
  })
})

// ─── classifyBearingCondition ──────────────────────────────────────

describe('classifyBearingCondition', () => {
  it('returns master-navigator for 90', () => {
    expect(classifyBearingCondition(90)).toBe('master-navigator')
  })
  it('returns skilled-pilot for 75', () => {
    expect(classifyBearingCondition(75)).toBe('skilled-pilot')
  })
  it('returns proper-helmsman for 60', () => {
    expect(classifyBearingCondition(60)).toBe('proper-helmsman')
  })
  it('returns lost-sailor for 45', () => {
    expect(classifyBearingCondition(45)).toBe('lost-sailor')
  })
  it('returns drifting-raft for 30', () => {
    expect(classifyBearingCondition(30)).toBe('drifting-raft')
  })
  it('returns shipwreck for 10', () => {
    expect(classifyBearingCondition(10)).toBe('shipwreck')
  })
})

// ─── classifyCaptainGrade ──────────────────────────────────────────

describe('classifyCaptainGrade', () => {
  it('returns fleet-admiral for 85', () => {
    expect(classifyCaptainGrade(85)).toBe('fleet-admiral')
  })
  it('returns sea-captain for 70', () => {
    expect(classifyCaptainGrade(70)).toBe('sea-captain')
  })
  it('returns first-mate for 55', () => {
    expect(classifyCaptainGrade(55)).toBe('first-mate')
  })
  it('returns deck-hand for 40', () => {
    expect(classifyCaptainGrade(40)).toBe('deck-hand')
  })
  it('returns cabin-boy for 25', () => {
    expect(classifyCaptainGrade(25)).toBe('cabin-boy')
  })
  it('returns landlubber for 10', () => {
    expect(classifyCaptainGrade(10)).toBe('landlubber')
  })
})

// ─── classifyChartCondition ────────────────────────────────────────

describe('classifyChartCondition', () => {
  it('returns chart-room for 80', () => {
    expect(classifyChartCondition(80)).toBe('chart-room')
  })
  it('returns navigation-station for 65', () => {
    expect(classifyChartCondition(65)).toBe('navigation-station')
  })
  it('returns wheelhouse for 50', () => {
    expect(classifyChartCondition(50)).toBe('wheelhouse')
  })
  it('returns deck for 35', () => {
    expect(classifyChartCondition(35)).toBe('deck')
  })
  it('returns lifeboat for 20', () => {
    expect(classifyChartCondition(20)).toBe('lifeboat')
  })
  it('returns adrift for 5', () => {
    expect(classifyChartCondition(5)).toBe('adrift')
  })
})

// ─── classifyChartType ─────────────────────────────────────────────

describe('classifyChartType', () => {
  it('returns blank-page for empty bearings', () => {
    expect(classifyChartType([])).toBe('blank-page')
  })

  it('returns admiralty-chart for all master-navigator high scores', () => {
    const bearing = analyzeCompassBearing(RICH, 'a.ts')
    expect(classifyChartType([bearing])).toBe('admiralty-chart')
  })

  it('returns scratched-rock for medium-low quality scores', () => {
    const bearing = analyzeCompassBearing('export function foo(): void {}', 'mid.ts')
    expect(classifyChartType([bearing])).toBe('scratched-rock')
  })

  it('returns blank-page for shipwreck zero scores', () => {
    const bearing = analyzeCompassBearing(EMPTY, 'empty.ts')
    expect(classifyChartType([bearing])).toBe('blank-page')
  })
})

// ─── analyzeCompassBearing ─────────────────────────────────────────

describe('analyzeCompassBearing', () => {
  it('returns qualityScore=0 and shipwreck for empty content', () => {
    const b = analyzeCompassBearing(EMPTY, 'empty.ts')
    expect(b.qualityScore).toBe(0)
    expect(b.condition).toBe('shipwreck')
    expect(b.file).toBe('empty.ts')
  })

  it('returns qualityScore=100 and master-navigator for rich content', () => {
    const b = analyzeCompassBearing(RICH, 'rich.ts')
    expect(b.qualityScore).toBe(100)
    expect(b.condition).toBe('master-navigator')
  })

  it('returns qualityScore=8 and shipwreck for minimal content', () => {
    const b = analyzeCompassBearing(MINIMAL, 'min.ts')
    expect(b.qualityScore).toBe(8)
    expect(b.condition).toBe('shipwreck')
  })

  it('returns qualityScore=9 and shipwreck for bad content', () => {
    const b = analyzeCompassBearing(BAD, 'bad.ts')
    expect(b.qualityScore).toBe(9)
    expect(b.condition).toBe('shipwreck')
  })

  it('sets all five directional score fields', () => {
    const b = analyzeCompassBearing(RICH, 'a.ts')
    expect(b.directionalClarity).toBe(100)
    expect(b.bearingAccuracy).toBe(100)
    expect(b.navigationQuality).toBe(100)
    expect(b.orientationStability).toBe(100)
    expect(b.chartingPrecision).toBe(100)
  })

  it('contains all five measure sub-objects', () => {
    const b = analyzeCompassBearing(RICH, 'a.ts')
    expect(b.directing.grade).toBe('true-north')
    expect(b.bearing.compass).toBe('gyroscopic')
    expect(b.navigating.nav).toBe('gps-grade')
    expect(b.orienting.orientation).toBe('rock-steady')
    expect(b.charting.chart).toBe('detailed-chart')
  })

  it('rich content scores higher than empty content', () => {
    const rich = analyzeCompassBearing(RICH, 'r.ts')
    const empty = analyzeCompassBearing(EMPTY, 'e.ts')
    expect(rich.qualityScore).toBeGreaterThan(empty.qualityScore)
  })
})

// ─── analyzeNavigationChart ────────────────────────────────────────

describe('analyzeNavigationChart', () => {
  it('returns blank-page and adrift for empty bearings', () => {
    const c = analyzeNavigationChart([], 'src')
    expect(c.directory).toBe('src')
    expect(c.bearings).toHaveLength(0)
    expect(c.chartType).toBe('blank-page')
    expect(c.condition).toBe('adrift')
    expect(c.avgClarity).toBe(0)
    expect(c.avgAccuracy).toBe(0)
    expect(c.avgStability).toBe(0)
  })

  it('returns admiralty-chart and chart-room for rich bearings', () => {
    const bearing = analyzeCompassBearing(RICH, 'a.ts')
    const c = analyzeNavigationChart([bearing], 'src')
    expect(c.chartType).toBe('admiralty-chart')
    expect(c.condition).toBe('chart-room')
    expect(c.masterNavigatorCount).toBe(1)
    expect(c.shipwreckCount).toBe(0)
  })

  it('computes correct averages from mixed bearings', () => {
    const rich = analyzeCompassBearing(RICH, 'a.ts')
    const empty = analyzeCompassBearing(EMPTY, 'b.ts')
    const c = analyzeNavigationChart([rich, empty], 'src')
    expect(c.avgClarity).toBe(50)
    expect(c.avgAccuracy).toBe(50)
    expect(c.avgStability).toBe(50)
    expect(c.masterNavigatorCount).toBe(1)
    expect(c.shipwreckCount).toBe(1)
  })

  it('preserves bearings array', () => {
    const b1 = analyzeCompassBearing(RICH, 'a.ts')
    const b2 = analyzeCompassBearing(MINIMAL, 'b.ts')
    const c = analyzeNavigationChart([b1, b2], 'lib')
    expect(c.bearings).toHaveLength(2)
    expect(c.directory).toBe('lib')
  })
})

// ─── buildCompassRoseResult ────────────────────────────────────────

describe('buildCompassRoseResult', () => {
  it('returns correct structure for single rich file', async () => {
    const result = await buildCompassRoseResult(['a.ts'], [RICH])
    expect(result.bearings).toHaveLength(1)
    expect(result.charts).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.captainGrade).toBe('fleet-admiral')
    expect(result.fleet.isNavigable).toBe(true)
    expect(result.fleet.overallNavigation).toBe(100)
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('handles empty files array', async () => {
    const result = await buildCompassRoseResult([], [])
    expect(result.bearings).toHaveLength(0)
    expect(result.charts).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalCharts).toBe(0)
    expect(result.stats.bestBearing).toBe('')
    expect(result.stats.clearest).toBe('')
    expect(result.stats.mostAccurate).toBe('')
    expect(result.fleet.isNavigable).toBe(false)
    expect(result.fleet.overallNavigation).toBe(0)
  })

  it('groups bearings into charts by directory', async () => {
    const result = await buildCompassRoseResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MINIMAL, BAD],
    )
    expect(result.charts).toHaveLength(2)
  })

  it('identifies best bearing and clearest file', async () => {
    const result = await buildCompassRoseResult(
      ['good.ts', 'bad.ts'],
      [RICH, EMPTY],
    )
    expect(result.stats.bestBearing).toBe('good.ts')
    expect(result.stats.clearest).toBe('good.ts')
    expect(result.stats.mostAccurate).toBe('good.ts')
    expect(result.stats.mostNavigable).toBe('good.ts')
    expect(result.stats.mostStable).toBe('good.ts')
  })

  it('handles missing contents gracefully', async () => {
    const result = await buildCompassRoseResult(['a.ts'], [])
    expect(result.bearings).toHaveLength(1)
    expect(result.bearings[0].qualityScore).toBe(0)
  })

  it('computes all stat fields for mixed content', async () => {
    const result = await buildCompassRoseResult(
      ['a.ts', 'b.ts'],
      [RICH, BAD],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.avgDirectionalClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgBearingAccuracy).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgNavigationQuality).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgOrientationStability).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgChartingPrecision).toBeGreaterThanOrEqual(0)
    expect(result.stats.masterNavigatorCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.skilledPilotCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properHelmsmanCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.lostSailorCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.driftingRaftCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.shipwreckCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighAccuracyCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighQualityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighStabilityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallNavigation).toBeGreaterThanOrEqual(0)
    expect(typeof result.stats.captainGrade).toBe('string')
  })

  it('computes fleet summary correctly', async () => {
    const result = await buildCompassRoseResult(['a.ts'], [RICH])
    expect(result.fleet.avgClarity).toBe(100)
    expect(result.fleet.avgAccuracy).toBe(100)
    expect(result.fleet.avgStability).toBe(100)
    expect(result.fleet.isNavigable).toBe(true)
    expect(result.fleet.overallNavigation).toBe(100)
  })

  it('handles single file with no directory path', async () => {
    const result = await buildCompassRoseResult(['single.ts'], [MINIMAL])
    expect(result.charts).toHaveLength(1)
    expect(result.charts[0].directory).toBe('.')
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('gives positive recommendation for all high scores', async () => {
    const result = await buildCompassRoseResult(['a.ts'], [RICH])
    expect(result.recommendations).toEqual(
      expect.arrayContaining([expect.stringContaining('true north')]),
    )
  })

  it('warns about shipwreck files', async () => {
    const result = await buildCompassRoseResult(['a.ts'], [EMPTY])
    expect(result.recommendations).toEqual(
      expect.arrayContaining([expect.stringContaining('shipwreck')]),
    )
  })

  it('provides improvement suggestions for low scores', async () => {
    const result = await buildCompassRoseResult(['a.ts'], [BAD])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('warns about poor fleet navigation', async () => {
    const result = await buildCompassRoseResult(['a.ts'], [EMPTY])
    expect(result.recommendations).toEqual(
      expect.arrayContaining([expect.stringContaining('poor')]),
    )
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('compass-rose formatters', () => {
  it('colorScore returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })

  it('colorGrade returns a string for known grades', () => {
    expect(typeof colorGrade('master-navigator')).toBe('string')
    expect(typeof colorGrade('shipwreck')).toBe('string')
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })

  it('formatBearingTable returns string with file info', () => {
    const b = analyzeCompassBearing(RICH, 'test.ts')
    const table = formatBearingTable(b)
    expect(table).toContain('test.ts')
    expect(typeof table).toBe('string')
  })

  it('formatBearingsTable handles empty array', () => {
    expect(formatBearingsTable([])).toContain('No compass bearings')
  })

  it('formatBearingsTable shows header for non-empty', () => {
    const b = analyzeCompassBearing(RICH, 'a.ts')
    const table = formatBearingsTable([b])
    expect(table).toContain('Compass Rose')
  })

  it('formatChartTable returns string', () => {
    const b = analyzeCompassBearing(RICH, 'a.ts')
    const c = analyzeNavigationChart([b], 'src')
    const table = formatChartTable(c)
    expect(table).toContain('src')
    expect(typeof table).toBe('string')
  })

  it('formatChartsTable handles empty array', () => {
    expect(formatChartsTable([])).toContain('No navigation charts')
  })

  it('formatStatsTable returns string with statistics', async () => {
    const result = await buildCompassRoseResult(['a.ts'], [RICH])
    const table = formatStatsTable(result.stats)
    expect(table).toContain('Fleet Statistics')
    expect(table).toContain('Total Files')
    expect(typeof table).toBe('string')
  })

  it('formatRecommendations handles empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatRecommendations shows items', () => {
    const table = formatRecommendations(['item one', 'item two'])
    expect(table).toContain('item one')
    expect(table).toContain('item two')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildCompassRoseResult(['a.ts'], [RICH])
    const table = formatResultTable(result)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildCompassRoseResult(['a.ts', 'b.ts'], [RICH, MINIMAL])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.bearings).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.fleet).toBeDefined()
    expect(parsed.charts).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
