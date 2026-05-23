import { describe, expect, it } from 'vitest'

import {
  measureNeedle,
  measureAlignment,
  measureCardinal,
  measureDeclination,
  measureBearing,
  measureNavigation,
  classifyCondition,
  analyzeCompassReading,
  classifyRoseType,
  analyzeCompassRose,
  classifyNavigatorGrade,
  generateRecommendations,
  buildMagneticCompassResult,
} from '../src/commands/magnetic-compass-helpers.js'
import {
  scoreColor,
  accuracyColor,
  alignmentQualityColor,
  clarityColor,
  declinationColor,
  bearingColor,
  ratingColor,
  conditionColor,
  navigatorGradeColor,
  roseTypeColor,
  roseConditionColor,
  formatMagneticCompassJson,
  formatMagneticCompassTable,
} from '../src/commands/magnetic-compass-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH_CONTENT = `export interface User { id: number; name: string }
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

const MEDIUM_CONTENT = `function hello(name) {
  console.log('hello', name)
  return name
}
`

const EMPTY_CONTENT = ''

// ─── measureNeedle ─────────────────────────────────────────────────────────

describe('measureNeedle', () => {
  it('returns high precision for rich content', () => {
    const result = measureNeedle(RICH_CONTENT)
    expect(result.precision).toBe(100)
    expect(result.accuracy).toBe('surveyor-grade')
  })

  it('returns medium precision for simple content', () => {
    const result = measureNeedle(MEDIUM_CONTENT)
    expect(result.precision).toBe(47)
    expect(result.accuracy).toBe('toy-compass')
  })

  it('returns baseline precision for empty content', () => {
    const result = measureNeedle(EMPTY_CONTENT)
    expect(result.precision).toBe(42)
    expect(result.accuracy).toBe('toy-compass')
  })

  it('detects type definitions', () => {
    const result = measureNeedle('export type Config = { debug: boolean }')
    expect(result.precision).toBeGreaterThanOrEqual(45)
  })

  it('detects interfaces', () => {
    const result = measureNeedle('export interface Options { verbose: boolean }')
    expect(result.precision).toBeGreaterThanOrEqual(45)
  })

  it('detects classes', () => {
    const result = measureNeedle('class Service {}')
    expect(result.precision).toBeGreaterThanOrEqual(44)
  })
})

// ─── measureAlignment ──────────────────────────────────────────────────────

describe('measureAlignment', () => {
  it('returns high level for rich content', () => {
    const result = measureAlignment(RICH_CONTENT)
    expect(result.level).toBe(100)
    expect(result.quality).toBe('perfect-alignment')
  })

  it('returns medium level for simple content', () => {
    const result = measureAlignment(MEDIUM_CONTENT)
    expect(result.level).toBe(48)
    expect(result.quality).toBe('weak-field')
  })

  it('returns baseline level for empty content', () => {
    const result = measureAlignment(EMPTY_CONTENT)
    expect(result.level).toBe(43)
    expect(result.quality).toBe('weak-field')
  })

  it('detects async/await patterns', () => {
    const result = measureAlignment('async function go() { await fetch("/") }')
    expect(result.level).toBeGreaterThanOrEqual(55)
  })

  it('detects imports', () => {
    const result = measureAlignment("import { x } from 'y'")
    expect(result.level).toBeGreaterThanOrEqual(45)
  })
})

// ─── measureCardinal ───────────────────────────────────────────────────────

describe('measureCardinal', () => {
  it('returns high direction for rich content', () => {
    const result = measureCardinal(RICH_CONTENT)
    expect(result.direction).toBe(100)
    expect(result.clarity).toBe('true-north')
  })

  it('returns medium direction for simple content', () => {
    const result = measureCardinal(MEDIUM_CONTENT)
    expect(result.direction).toBe(37)
    expect(result.clarity).toBe('vague-heading')
  })

  it('returns baseline direction for empty content', () => {
    const result = measureCardinal(EMPTY_CONTENT)
    expect(result.direction).toBe(42)
    expect(result.clarity).toBe('vague-heading')
  })

  it('detects export statements', () => {
    const result = measureCardinal('export const x = 1')
    expect(result.direction).toBeGreaterThanOrEqual(47)
  })
})

// ─── measureDeclination ────────────────────────────────────────────────────

describe('measureDeclination', () => {
  it('returns high correction for rich content', () => {
    const result = measureDeclination(RICH_CONTENT)
    expect(result.correction).toBe(90)
    expect(result.accuracy).toBe('well-adjusted')
  })

  it('returns medium correction for simple content', () => {
    const result = measureDeclination(MEDIUM_CONTENT)
    expect(result.correction).toBe(48)
    expect(result.accuracy).toBe('uncorrected')
  })

  it('returns baseline correction for empty content', () => {
    const result = measureDeclination(EMPTY_CONTENT)
    expect(result.correction).toBe(43)
    expect(result.accuracy).toBe('uncorrected')
  })

  it('detects error handling', () => {
    const result = measureDeclination('try { x() } catch(e) {}')
    expect(result.correction).toBeGreaterThanOrEqual(35)
  })
})

// ─── measureBearing ────────────────────────────────────────────────────────

describe('measureBearing', () => {
  it('returns high stability for rich content', () => {
    const result = measureBearing(RICH_CONTENT)
    expect(result.stability).toBe(100)
    expect(result.quality).toBe('rock-steady')
  })

  it('returns medium stability for simple content', () => {
    const result = measureBearing(MEDIUM_CONTENT)
    expect(result.stability).toBe(48)
    expect(result.quality).toBe('drifting')
  })

  it('returns baseline stability for empty content', () => {
    const result = measureBearing(EMPTY_CONTENT)
    expect(result.stability).toBe(43)
    expect(result.quality).toBe('drifting')
  })

  it('detects private members', () => {
    const result = measureBearing('class X { private data = 1 }')
    expect(result.stability).toBeGreaterThanOrEqual(48)
  })
})

// ─── measureNavigation ─────────────────────────────────────────────────────

describe('measureNavigation', () => {
  it('returns high skill for rich content', () => {
    const result = measureNavigation(RICH_CONTENT)
    expect(result.skill).toBe(100)
    expect(result.rating).toBe('master-navigator')
  })

  it('returns medium skill for simple content', () => {
    const result = measureNavigation(MEDIUM_CONTENT)
    expect(result.skill).toBe(37)
    expect(result.rating).toBe('learner')
  })

  it('returns baseline skill for empty content', () => {
    const result = measureNavigation(EMPTY_CONTENT)
    expect(result.skill).toBe(43)
    expect(result.rating).toBe('learner')
  })

  it('detects promises', () => {
    const result = measureNavigation('const p = new Promise((r) => r(1))')
    expect(result.skill).toBeGreaterThanOrEqual(47)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies master-compass for high scores', () => {
    const reading = analyzeCompassReading(RICH_CONTENT, 'a.ts')
    expect(classifyCondition(reading)).toBe('master-compass')
  })

  it('classifies basic-tool for medium scores', () => {
    const reading = analyzeCompassReading(MEDIUM_CONTENT, 'a.ts')
    expect(classifyCondition(reading)).toBe('basic-tool')
  })

  it('classifies basic-tool for empty scores', () => {
    const reading = analyzeCompassReading(EMPTY_CONTENT, 'a.ts')
    expect(classifyCondition(reading)).toBe('basic-tool')
  })
})

// ─── analyzeCompassReading ─────────────────────────────────────────────────

describe('analyzeCompassReading', () => {
  it('returns correct values for rich content', () => {
    const result = analyzeCompassReading(RICH_CONTENT, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.qualityScore).toBe(99)
    expect(result.condition).toBe('master-compass')
    expect(result.needlePrecision).toBe(100)
    expect(result.magneticAlignment).toBe(100)
    expect(result.cardinalDirection).toBe(100)
    expect(result.declinationCorrection).toBe(90)
    expect(result.bearingStability).toBe(100)
    expect(result.navigationSkill).toBe(100)
    expect(result.needle.accuracy).toBe('surveyor-grade')
    expect(result.alignment.quality).toBe('perfect-alignment')
    expect(result.cardinal.clarity).toBe('true-north')
    expect(result.declination.accuracy).toBe('well-adjusted')
    expect(result.bearing.quality).toBe('rock-steady')
    expect(result.navigation.rating).toBe('master-navigator')
  })

  it('returns correct values for medium content', () => {
    const result = analyzeCompassReading(MEDIUM_CONTENT, 'medium.ts')
    expect(result.file).toBe('medium.ts')
    expect(result.qualityScore).toBe(45)
    expect(result.condition).toBe('basic-tool')
    expect(result.needlePrecision).toBe(47)
    expect(result.magneticAlignment).toBe(48)
    expect(result.cardinalDirection).toBe(37)
    expect(result.declinationCorrection).toBe(48)
    expect(result.bearingStability).toBe(48)
    expect(result.navigationSkill).toBe(37)
  })

  it('returns correct values for empty content', () => {
    const result = analyzeCompassReading(EMPTY_CONTENT, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.qualityScore).toBe(43)
    expect(result.condition).toBe('basic-tool')
    expect(result.needlePrecision).toBe(42)
    expect(result.magneticAlignment).toBe(43)
    expect(result.cardinalDirection).toBe(42)
    expect(result.declinationCorrection).toBe(43)
    expect(result.bearingStability).toBe(43)
    expect(result.navigationSkill).toBe(43)
  })

  it('qualityScore is weighted sum', () => {
    const result = analyzeCompassReading(RICH_CONTENT, 'r.ts')
    const expected = Math.round(
      result.needlePrecision * 0.15 +
      result.magneticAlignment * 0.2 +
      result.cardinalDirection * 0.15 +
      result.declinationCorrection * 0.15 +
      result.bearingStability * 0.2 +
      result.navigationSkill * 0.15,
    )
    expect(result.qualityScore).toBe(expected)
  })
})

// ─── classifyRoseType ──────────────────────────────────────────────────────

describe('classifyRoseType', () => {
  it('returns master-rose for rich readings', () => {
    const reading = analyzeCompassReading(RICH_CONTENT, 'a.ts')
    expect(classifyRoseType([reading])).toBe('master-rose')
  })

  it('returns full-compass for mixed rich+medium', () => {
    const r = analyzeCompassReading(RICH_CONTENT, 'a.ts')
    const m = analyzeCompassReading(MEDIUM_CONTENT, 'b.ts')
    expect(classifyRoseType([r, m])).toBe('full-compass')
  })

  it('returns nautical-compass for medium', () => {
    const m = analyzeCompassReading(MEDIUM_CONTENT, 'a.ts')
    expect(classifyRoseType([m])).toBe('nautical-compass')
  })

  it('returns pocket-compass for empty', () => {
    const e = analyzeCompassReading(EMPTY_CONTENT, 'a.ts')
    expect(classifyRoseType([e])).toBe('pocket-compass')
  })

  it('returns pocket-compass for multiple empty', () => {
    const e = analyzeCompassReading(EMPTY_CONTENT, 'a.ts')
    expect(classifyRoseType([e, e, e, e])).toBe('pocket-compass')
  })
})

// ─── analyzeCompassRose ────────────────────────────────────────────────────

describe('analyzeCompassRose', () => {
  it('returns rose with correct directory', () => {
    const readings = [analyzeCompassReading(RICH_CONTENT, 'src/a.ts')]
    const rose = analyzeCompassRose(readings, 'src')
    expect(rose.directory).toBe('src')
  })

  it('computes average score from readings', () => {
    const readings = [analyzeCompassReading(RICH_CONTENT, 'a.ts')]
    const rose = analyzeCompassRose(readings, '.')
    expect(rose.roseType).toBe('master-rose')
  })

  it('returns full-compass for mixed content', () => {
    const readings = [
      analyzeCompassReading(RICH_CONTENT, 'a.ts'),
      analyzeCompassReading(MEDIUM_CONTENT, 'b.ts'),
    ]
    const rose = analyzeCompassRose(readings, '.')
    expect(rose.roseType).toBe('full-compass')
  })
})

// ─── classifyNavigatorGrade ────────────────────────────────────────────────

describe('classifyNavigatorGrade', () => {
  it('returns master-cartographer for 80+', () => {
    expect(classifyNavigatorGrade(85)).toBe('master-cartographer')
  })

  it('returns master-cartographer for exactly 80', () => {
    expect(classifyNavigatorGrade(80)).toBe('master-cartographer')
  })

  it('returns sea-captain for 65-79', () => {
    expect(classifyNavigatorGrade(72)).toBe('sea-captain')
  })

  it('returns sea-captain for exactly 65', () => {
    expect(classifyNavigatorGrade(65)).toBe('sea-captain')
  })

  it('returns navigator for 50-64', () => {
    expect(classifyNavigatorGrade(55)).toBe('navigator')
  })

  it('returns navigator for exactly 50', () => {
    expect(classifyNavigatorGrade(50)).toBe('navigator')
  })

  it('returns helmsman for 35-49', () => {
    expect(classifyNavigatorGrade(43)).toBe('helmsman')
  })

  it('returns helmsman for exactly 35', () => {
    expect(classifyNavigatorGrade(35)).toBe('helmsman')
  })

  it('returns passenger for 20-34', () => {
    expect(classifyNavigatorGrade(25)).toBe('passenger')
  })

  it('returns passenger for exactly 20', () => {
    expect(classifyNavigatorGrade(20)).toBe('passenger')
  })

  it('returns shipwreck-victim for below 20', () => {
    expect(classifyNavigatorGrade(10)).toBe('shipwreck-victim')
  })

  it('returns shipwreck-victim for 0', () => {
    expect(classifyNavigatorGrade(0)).toBe('shipwreck-victim')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for rich content', () => {
    const result = buildMagneticCompassResult(['a.ts'], [RICH_CONTENT])
    const recs = generateRecommendations(result.readings, result.roses, result.chart, result.stats)
    expect(Array.isArray(recs)).toBe(true)
    expect(recs.length).toBeLessThanOrEqual(5)
  })

  it('returns recommendations for medium content', () => {
    const result = buildMagneticCompassResult(['a.ts'], [MEDIUM_CONTENT])
    const recs = generateRecommendations(result.readings, result.roses, result.chart, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('returns recommendations for empty content', () => {
    const result = buildMagneticCompassResult(['a.ts'], [EMPTY_CONTENT])
    const recs = generateRecommendations(result.readings, result.roses, result.chart, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })
})

// ─── buildMagneticCompassResult (integration) ──────────────────────────────

describe('buildMagneticCompassResult', () => {
  it('handles RICH+MEDIUM correctly', () => {
    const result = buildMagneticCompassResult(
      ['rich.ts', 'medium.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalRoses).toBe(1)
    expect(result.stats.avgNeedlePrecision).toBe(74)
    expect(result.stats.avgMagneticAlignment).toBe(74)
    expect(result.stats.avgCardinalDirection).toBe(69)
    expect(result.stats.avgDeclinationCorrection).toBe(69)
    expect(result.stats.avgBearingStability).toBe(74)
    expect(result.stats.avgNavigationSkill).toBe(69)
    expect(result.stats.masterCompassCount).toBe(1)
    expect(result.stats.basicToolCount).toBe(1)
    expect(result.stats.overallOrientation).toBe(72)
    expect(result.stats.navigatorGrade).toBe('sea-captain')
    expect(result.stats.bestReading).toBe('rich.ts')
    expect(result.stats.mostPrecise).toBe('rich.ts')
    expect(result.stats.mostAligned).toBe('rich.ts')
    expect(result.stats.clearestDirection).toBe('rich.ts')
    expect(result.stats.bestAdjusted).toBe('rich.ts')
    expect(result.stats.mostStable).toBe('rich.ts')
    expect(result.chart.overallOrientation).toBe(72)
    expect(result.chart.avgPrecision).toBe(74)
    expect(result.chart.avgAlignment).toBe(74)
    expect(result.chart.avgNavigation).toBe(69)
    expect(result.chart.isOriented).toBe(true)
    expect(result.readings).toHaveLength(2)
    expect(result.roses).toHaveLength(1)
  })

  it('handles all EMPTY correctly', () => {
    const result = buildMagneticCompassResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [EMPTY_CONTENT, EMPTY_CONTENT, EMPTY_CONTENT, EMPTY_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(4)
    expect(result.stats.totalRoses).toBe(1)
    expect(result.stats.avgNeedlePrecision).toBe(42)
    expect(result.stats.avgMagneticAlignment).toBe(43)
    expect(result.stats.avgCardinalDirection).toBe(42)
    expect(result.stats.avgDeclinationCorrection).toBe(43)
    expect(result.stats.avgBearingStability).toBe(43)
    expect(result.stats.avgNavigationSkill).toBe(43)
    expect(result.stats.masterCompassCount).toBe(0)
    expect(result.stats.basicToolCount).toBe(4)
    expect(result.stats.overallOrientation).toBe(43)
    expect(result.stats.navigatorGrade).toBe('helmsman')
    expect(result.chart.isOriented).toBe(false)
    expect(result.chart.overallOrientation).toBe(43)
  })

  it('handles single rich file', () => {
    const result = buildMagneticCompassResult(['rich.ts'], [RICH_CONTENT])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.readings).toHaveLength(1)
    expect(result.readings[0].qualityScore).toBe(99)
    expect(result.roses).toHaveLength(1)
    expect(result.roses[0].roseType).toBe('master-rose')
  })

  it('handles empty files array', () => {
    const result = buildMagneticCompassResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.readings).toHaveLength(0)
    expect(result.roses).toHaveLength(0)
  })

  it('produces recommendations', () => {
    const result = buildMagneticCompassResult(
      ['medium.ts'],
      [MEDIUM_CONTENT],
    )
    expect(result.recommendations.length).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for high score', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })
  it('returns string for medium score', () => {
    expect(typeof scoreColor(65)).toBe('string')
  })
  it('returns string for low score', () => {
    expect(typeof scoreColor(30)).toBe('string')
  })
  it('returns string for very low score', () => {
    expect(typeof scoreColor(10)).toBe('string')
  })
})

describe('accuracyColor', () => {
  it('colors surveyor-grade', () => {
    expect(typeof accuracyColor('surveyor-grade')).toBe('string')
  })
  it('colors marine-compass', () => {
    expect(typeof accuracyColor('marine-compass')).toBe('string')
  })
  it('colors hiking-compass', () => {
    expect(typeof accuracyColor('hiking-compass')).toBe('string')
  })
  it('colors basic-compass', () => {
    expect(typeof accuracyColor('basic-compass')).toBe('string')
  })
  it('colors toy-compass', () => {
    expect(typeof accuracyColor('toy-compass')).toBe('string')
  })
  it('colors broken', () => {
    expect(typeof accuracyColor('broken')).toBe('string')
  })
  it('passes through unknown', () => {
    expect(accuracyColor('unknown')).toBe('unknown')
  })
})

describe('alignmentQualityColor', () => {
  it('colors all quality levels', () => {
    for (const q of ['perfect-alignment', 'strong-field', 'good-alignment', 'moderate', 'weak-field', 'demagnetized']) {
      expect(typeof alignmentQualityColor(q)).toBe('string')
    }
  })
  it('passes through unknown', () => {
    expect(alignmentQualityColor('other')).toBe('other')
  })
})

describe('clarityColor', () => {
  it('colors all clarity levels', () => {
    for (const c of ['true-north', 'clear-bearing', 'known-direction', 'general-direction', 'vague-heading', 'lost']) {
      expect(typeof clarityColor(c)).toBe('string')
    }
  })
})

describe('declinationColor', () => {
  it('colors all declination levels', () => {
    for (const d of ['surveyor-corrected', 'well-adjusted', 'properly-calibrated', 'approximate', 'uncorrected', 'wildly-off']) {
      expect(typeof declinationColor(d)).toBe('string')
    }
  })
})

describe('bearingColor', () => {
  it('colors all bearing levels', () => {
    for (const b of ['rock-steady', 'stable-bearing', 'reliable', 'mostly-stable', 'drifting', 'spinning']) {
      expect(typeof bearingColor(b)).toBe('string')
    }
  })
})

describe('ratingColor', () => {
  it('colors all rating levels', () => {
    for (const r of ['master-navigator', 'expert-pilot', 'skilled-helmsman', 'competent', 'learner', 'lost-at-sea']) {
      expect(typeof ratingColor(r)).toBe('string')
    }
  })
})

describe('conditionColor', () => {
  it('colors all condition levels', () => {
    for (const c of ['master-compass', 'precision-instrument', 'reliable-compass', 'basic-tool', 'damaged-compass', 'spinning-wheel']) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })
})

describe('navigatorGradeColor', () => {
  it('colors all grade levels', () => {
    for (const g of ['master-cartographer', 'sea-captain', 'navigator', 'helmsman', 'passenger', 'shipwreck-victim']) {
      expect(typeof navigatorGradeColor(g)).toBe('string')
    }
  })
})

describe('roseTypeColor', () => {
  it('colors all type levels', () => {
    for (const t of ['master-rose', 'full-compass', 'nautical-compass', 'pocket-compass', 'toy-compass', 'broken']) {
      expect(typeof roseTypeColor(t)).toBe('string')
    }
  })
})

describe('roseConditionColor', () => {
  it('colors all condition levels', () => {
    for (const c of ['cartographic-quality', 'navigational-aid', 'basic-direction', 'rough-bearing', 'unreliable', 'useless']) {
      expect(typeof roseConditionColor(c)).toBe('string')
    }
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatMagneticCompassJson', () => {
  it('returns valid JSON string', () => {
    const result = buildMagneticCompassResult(['a.ts'], [RICH_CONTENT])
    const json = formatMagneticCompassJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatMagneticCompassTable', () => {
  it('includes chart overview section', () => {
    const result = buildMagneticCompassResult(['a.ts'], [RICH_CONTENT])
    const table = formatMagneticCompassTable(result, false)
    expect(table).toContain('Magnetic Compass Analysis')
    expect(table).toContain('Chart Overview')
  })

  it('includes stats section', () => {
    const result = buildMagneticCompassResult(['a.ts'], [RICH_CONTENT])
    const table = formatMagneticCompassTable(result, false)
    expect(table).toContain('Statistics')
    expect(table).toContain('Navigator Grade')
  })

  it('includes condition counts section', () => {
    const result = buildMagneticCompassResult(['a.ts'], [RICH_CONTENT])
    const table = formatMagneticCompassTable(result, false)
    expect(table).toContain('Condition Counts')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildMagneticCompassResult(['a.ts'], [RICH_CONTENT])
    const table = formatMagneticCompassTable(result, true)
    expect(table).toContain('Per-File Details')
  })

  it('hides per-file details without verbose', () => {
    const result = buildMagneticCompassResult(['a.ts'], [RICH_CONTENT])
    const table = formatMagneticCompassTable(result, false)
    expect(table).not.toContain('Per-File Details')
  })

  it('shows recommendations when present', () => {
    const result = buildMagneticCompassResult(['a.ts'], [MEDIUM_CONTENT])
    if (result.recommendations.length > 0) {
      const table = formatMagneticCompassTable(result, false)
      expect(table).toContain('Recommendations')
    }
  })

  it('shows highlights for best reading', () => {
    const result = buildMagneticCompassResult(
      ['a.ts', 'b.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    const table = formatMagneticCompassTable(result, false)
    expect(table).toContain('Highlights')
  })
})
