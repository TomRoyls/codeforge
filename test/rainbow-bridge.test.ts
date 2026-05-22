import { describe, it, expect } from 'vitest'

import {
  measureBridge,
  measureSpectrum,
  measureTransition,
  measureAtmosphere,
  measureVision,
  measureLuminance,
  classifyCondition,
  analyzeBridgeSpan,
  analyzeRainbowArc,
  classifyArcType,
  classifyArchitectGrade,
  generateRecommendations,
  buildRainbowBridgeResult,
} from '../src/commands/rainbow-bridge-helpers.js'

import {
  scoreColor,
  conditionColor,
  gradeColor,
  spanColor,
  spectrumColor,
  eleganceColor,
  atmosphereColor,
  visionClarityColor,
  brightnessColor,
  arcTypeColor,
  arcConditionColor,
  formatRainbowBridgeJson,
  formatRainbowBridgeTable,
} from '../src/commands/rainbow-bridge-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────

const RICH = `
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

const EMPTY = ''

const MEDIUM = 'const x = 1\n'

// ─── measureBridge ────────────────────────────────────────────

describe('measureBridge', () => {
  it('measures rich content', () => {
    const result = measureBridge(RICH)
    expect(result.strength).toBe(57)
    expect(result.span).toBe('rope-bridge')
    expect(result.hasHighStrength).toBe(false)
    expect(result.hasSolidPillars).toBe(true)
    expect(result.hasProperCabling).toBe(false)
    expect(result.hasNoStructuralWeakness).toBe(true)
    expect(result.hasLoadDistribution).toBe(false)
    expect(result.hasNoSinglePoint).toBe(true)
    expect(result.hasProperSpan).toBe(true)
    expect(result.hasNoSagging).toBe(true)
    expect(result.hasExpansionJoints).toBe(false)
    expect(result.hasNoCorrosion).toBe(false)
    expect(result.weaknessCount).toBe(0)
    expect(result.corrosionCount).toBe(1)
  })

  it('measures empty content', () => {
    const result = measureBridge(EMPTY)
    expect(result.strength).toBe(40)
    expect(result.span).toBe('plank')
    expect(result.hasHighStrength).toBe(false)
    expect(result.hasSolidPillars).toBe(false)
    expect(result.hasProperSpan).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureBridge(MEDIUM)
    expect(result.strength).toBe(45)
    expect(result.span).toBe('plank')
  })
})

// ─── measureSpectrum ──────────────────────────────────────────

describe('measureSpectrum', () => {
  it('measures rich content', () => {
    const result = measureSpectrum(RICH)
    expect(result.breadth).toBe(70)
    expect(result.colors).toBe('rich-palette')
    expect(result.hasHighBreadth).toBe(true)
    expect(result.hasRed).toBe(true)
    expect(result.hasOrange).toBe(true)
    expect(result.hasYellow).toBe(true)
    expect(result.hasGreen).toBe(true)
    expect(result.hasBlue).toBe(false)
    expect(result.hasIndigo).toBe(false)
    expect(result.hasViolet).toBe(true)
    expect(result.hasNoColorBlindness).toBe(true)
    expect(result.hasProperDistribution).toBe(true)
    expect(result.hasNoMonochrome).toBe(true)
    expect(result.missingColorCount).toBe(2)
    expect(result.monochromeCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureSpectrum(EMPTY)
    expect(result.breadth).toBe(0)
    expect(result.colors).toBe('invisible')
    expect(result.hasHighBreadth).toBe(false)
    expect(result.missingColorCount).toBe(7)
  })

  it('measures medium content', () => {
    const result = measureSpectrum(MEDIUM)
    expect(result.breadth).toBe(5)
    expect(result.colors).toBe('invisible')
  })
})

// ─── measureTransition ────────────────────────────────────────

describe('measureTransition', () => {
  it('measures rich content', () => {
    const result = measureTransition(RICH)
    expect(result.grace).toBe(88)
    expect(result.elegance).toBe('waltz')
    expect(result.hasHighGrace).toBe(true)
    expect(result.hasFluidMotion).toBe(false)
    expect(result.hasProperPacing).toBe(true)
    expect(result.hasNoJarring).toBe(true)
    expect(result.hasSmoothHandoff).toBe(true)
    expect(result.hasNoAbrupt).toBe(true)
    expect(result.hasProperCrescendo).toBe(true)
    expect(result.hasNoChaos).toBe(true)
    expect(result.hasNaturalFlow).toBe(true)
    expect(result.hasNoDeadStop).toBe(true)
    expect(result.jarringCount).toBe(0)
    expect(result.abruptCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureTransition(EMPTY)
    expect(result.grace).toBe(40)
    expect(result.elegance).toBe('clumsy')
    expect(result.hasHighGrace).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureTransition(MEDIUM)
    expect(result.grace).toBe(45)
    expect(result.elegance).toBe('clumsy')
  })
})

// ─── measureAtmosphere ────────────────────────────────────────

describe('measureAtmosphere', () => {
  it('measures rich content', () => {
    const result = measureAtmosphere(RICH)
    expect(result.clarity).toBe(90)
    expect(result.condition).toBe('clear-sky')
    expect(result.hasHighClarity).toBe(true)
    expect(result.hasGoodVisibility).toBe(true)
    expect(result.hasNoFog).toBe(true)
    expect(result.hasProperLighting).toBe(true)
    expect(result.hasNoGlare).toBe(true)
    expect(result.hasCleanAir).toBe(false)
    expect(result.hasNoSmog).toBe(true)
    expect(result.hasWideHorizon).toBe(true)
    expect(result.hasNoBlindSpots).toBe(true)
    expect(result.hasBreathable).toBe(true)
    expect(result.fogCount).toBe(0)
    expect(result.smogCount).toBe(1)
  })

  it('measures empty content', () => {
    const result = measureAtmosphere(EMPTY)
    expect(result.clarity).toBe(63)
    expect(result.condition).toBe('foggy')
    expect(result.hasHighClarity).toBe(false)
    expect(result.hasProperLighting).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureAtmosphere(MEDIUM)
    expect(result.clarity).toBe(68)
    expect(result.condition).toBe('foggy')
  })
})

// ─── measureVision ────────────────────────────────────────────

describe('measureVision', () => {
  it('measures rich content', () => {
    const result = measureVision(RICH)
    expect(result.quality).toBe(68)
    expect(result.clarity).toBe('near-sighted')
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasDepth).toBe(true)
    expect(result.hasBreadth).toBe(false)
    expect(result.hasNoBlindSpots).toBe(true)
    expect(result.hasProperPerspective).toBe(true)
    expect(result.hasNoDistortion).toBe(true)
    expect(result.hasForesight).toBe(false)
    expect(result.hasNoMyopia).toBe(false)
    expect(result.hasHolisticView).toBe(true)
    expect(result.hasNoTunnelVision).toBe(true)
    expect(result.blindSpotCount).toBe(0)
    expect(result.myopiaCount).toBe(1)
  })

  it('measures empty content', () => {
    const result = measureVision(EMPTY)
    expect(result.quality).toBe(40)
    expect(result.clarity).toBe('tunnel-vision')
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasDepth).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureVision(MEDIUM)
    expect(result.quality).toBe(45)
    expect(result.clarity).toBe('tunnel-vision')
  })
})

// ─── measureLuminance ─────────────────────────────────────────

describe('measureLuminance', () => {
  it('measures rich content', () => {
    const result = measureLuminance(RICH)
    expect(result.level).toBe(90)
    expect(result.brightness).toBe('blinding')
    expect(result.hasHighLuminance).toBe(true)
    expect(result.hasRadiance).toBe(true)
    expect(result.hasProperGlow).toBe(true)
    expect(result.hasNoShadow).toBe(true)
    expect(result.hasWarmLight).toBe(false)
    expect(result.hasNoDarkness).toBe(true)
    expect(result.hasConsistent).toBe(true)
    expect(result.hasNoFlickering).toBe(true)
    expect(result.hasInviting).toBe(true)
    expect(result.hasNoHarsh).toBe(true)
    expect(result.shadowCount).toBe(0)
    expect(result.flickeringCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureLuminance(EMPTY)
    expect(result.level).toBe(40)
    expect(result.brightness).toBe('dark')
    expect(result.hasHighLuminance).toBe(false)
    expect(result.hasRadiance).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureLuminance(MEDIUM)
    expect(result.level).toBe(45)
    expect(result.brightness).toBe('dark')
  })
})

// ─── analyzeBridgeSpan ────────────────────────────────────────

describe('analyzeBridgeSpan', () => {
  it('analyzes rich content', () => {
    const result = analyzeBridgeSpan(RICH, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.bridgeStrength).toBe(57)
    expect(result.spectrumBreadth).toBe(70)
    expect(result.transitionGrace).toBe(88)
    expect(result.atmosphericClarity).toBe(90)
    expect(result.visionQuality).toBe(68)
    expect(result.luminance).toBe(90)
    expect(result.qualityScore).toBe(76)
    expect(result.condition).toBe('vibrant-arc')
  })

  it('analyzes empty content', () => {
    const result = analyzeBridgeSpan(EMPTY, 'empty.ts')
    expect(result.bridgeStrength).toBe(40)
    expect(result.spectrumBreadth).toBe(0)
    expect(result.transitionGrace).toBe(40)
    expect(result.atmosphericClarity).toBe(63)
    expect(result.visionQuality).toBe(40)
    expect(result.luminance).toBe(40)
    expect(result.qualityScore).toBe(37)
    expect(result.condition).toBe('faded-arch')
  })

  it('analyzes medium content', () => {
    const result = analyzeBridgeSpan(MEDIUM, 'medium.ts')
    expect(result.bridgeStrength).toBe(45)
    expect(result.spectrumBreadth).toBe(5)
    expect(result.transitionGrace).toBe(45)
    expect(result.atmosphericClarity).toBe(68)
    expect(result.visionQuality).toBe(45)
    expect(result.luminance).toBe(45)
    expect(result.qualityScore).toBe(42)
    expect(result.condition).toBe('faded-arch')
  })

  it('returns consistent results on repeated calls', () => {
    const a = analyzeBridgeSpan(RICH, 'a.ts')
    const b = analyzeBridgeSpan(RICH, 'a.ts')
    expect(a.qualityScore).toBe(b.qualityScore)
    expect(a.bridgeStrength).toBe(b.bridgeStrength)
    expect(a.condition).toBe(b.condition)
  })
})

// ─── classifyCondition ────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies vibrant-arc', () => {
    const s = analyzeBridgeSpan(RICH, 'rich.ts')
    expect(classifyCondition(s)).toBe('vibrant-arc')
  })
  it('classifies faded-arch for empty', () => {
    const s = analyzeBridgeSpan(EMPTY, 'empty.ts')
    expect(classifyCondition(s)).toBe('faded-arch')
  })
  it('classifies faded-arch for medium', () => {
    const s = analyzeBridgeSpan(MEDIUM, 'medium.ts')
    expect(classifyCondition(s)).toBe('faded-arch')
  })
})

// ─── classifyArcType ──────────────────────────────────────────

describe('classifyArcType', () => {
  it('classifies rich as double-rainbow', () => {
    const s = analyzeBridgeSpan(RICH, 'rich.ts')
    expect(classifyArcType([s])).toBe('double-rainbow')
  })
  it('classifies empty as sun-dog', () => {
    const s = analyzeBridgeSpan(EMPTY, 'empty.ts')
    expect(classifyArcType([s])).toBe('sun-dog')
  })
  it('classifies mixed as single-arc', () => {
    const r = analyzeBridgeSpan(RICH, 'rich.ts')
    const e = analyzeBridgeSpan(EMPTY, 'empty.ts')
    const m = analyzeBridgeSpan(MEDIUM, 'medium.ts')
    expect(classifyArcType([r, e, m])).toBe('single-arc')
  })
})

// ─── classifyArchitectGrade ───────────────────────────────────

describe('classifyArchitectGrade', () => {
  it('returns bridge-architect for 80+', () => {
    expect(classifyArchitectGrade(90)).toBe('bridge-architect')
  })
  it('returns rainbow-weaver for 65+', () => {
    expect(classifyArchitectGrade(75)).toBe('rainbow-weaver')
  })
  it('returns span-builder for 50+', () => {
    expect(classifyArchitectGrade(55)).toBe('span-builder')
  })
  it('returns apprentice for 35+', () => {
    expect(classifyArchitectGrade(35)).toBe('apprentice')
  })
  it('returns observer for 20+', () => {
    expect(classifyArchitectGrade(20)).toBe('observer')
  })
  it('returns colorblind for below 20', () => {
    expect(classifyArchitectGrade(10)).toBe('colorblind')
  })
})

// ─── analyzeRainbowArc ────────────────────────────────────────

describe('analyzeRainbowArc', () => {
  it('analyzes an arc with multiple spans', () => {
    const r = analyzeBridgeSpan(RICH, 'rich.ts')
    const m = analyzeBridgeSpan(MEDIUM, 'medium.ts')
    const arc = analyzeRainbowArc([r, m], 'src')
    expect(arc.directory).toBe('src')
    expect(arc.spans).toHaveLength(2)
    expect(arc.avgStrength).toBe(51)
    expect(arc.avgSpectrum).toBe(38)
    expect(arc.avgVision).toBe(57)
    expect(arc.divineCount).toBe(0)
    expect(arc.noBridgeCount).toBe(0)
    expect(arc.strongCount).toBe(0)
    expect(arc.diverseCount).toBe(1)
    expect(arc.arcType).toBe('single-arc')
    expect(arc.condition).toBe('steady-span')
  })
})

// ─── generateRecommendations ──────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty array for rich content', () => {
    const s = analyzeBridgeSpan(RICH, 'rich.ts')
    const recs = generateRecommendations(
      [s],
      [{ directory: 'src', spans: [s], avgStrength: s.bridgeStrength, avgSpectrum: s.spectrumBreadth, avgVision: s.visionQuality, divineCount: 0, noBridgeCount: 0, strongCount: 0, diverseCount: 1, arcType: 'double-rainbow', condition: 'vibrant-arc' }],
      { avgStrength: s.bridgeStrength, avgSpectrum: s.spectrumBreadth, avgVision: s.visionQuality, isConnected: true, overallConnection: s.qualityScore },
      { totalFiles: 1, totalArcs: 1, avgBridgeStrength: s.bridgeStrength, avgSpectrumBreadth: s.spectrumBreadth, avgTransitionGrace: s.transitionGrace, avgAtmosphericClarity: s.atmosphericClarity, avgVisionQuality: s.visionQuality, avgLuminance: s.luminance, divineRainbowCount: 0, vibrantArcCount: 1, paintedBridgeCount: 0, fadedArchCount: 0, mistyOutlineCount: 0, noBridgeCount: 0, hasHighStrengthCount: 0, hasHighBreadthCount: 1, hasHighGraceCount: 1, hasHighClarityCount: 1, hasHighQualityCount: 0, hasHighLuminanceCount: 1, overallConnection: s.qualityScore, architectGrade: 'rainbow-weaver', bestSpan: 'rich.ts', strongest: 'rich.ts', mostDiverse: 'rich.ts', mostGraceful: 'rich.ts', clearest: 'rich.ts', brightest: 'rich.ts' },
    )
    expect(recs).toEqual([])
  })
})

// ─── buildRainbowBridgeResult ─────────────────────────────────

describe('buildRainbowBridgeResult', () => {
  it('builds result for rich content', () => {
    const result = buildRainbowBridgeResult(['rich.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalArcs).toBe(1)
    expect(result.stats.avgBridgeStrength).toBe(57)
    expect(result.stats.avgSpectrumBreadth).toBe(70)
    expect(result.stats.avgTransitionGrace).toBe(88)
    expect(result.stats.avgAtmosphericClarity).toBe(90)
    expect(result.stats.avgVisionQuality).toBe(68)
    expect(result.stats.avgLuminance).toBe(90)
    expect(result.stats.overallConnection).toBe(76)
    expect(result.stats.architectGrade).toBe('rainbow-weaver')
    expect(result.stats.vibrantArcCount).toBe(1)
    expect(result.stats.hasHighBreadthCount).toBe(1)
    expect(result.stats.bestSpan).toBe('rich.ts')
    expect(result.sky.isConnected).toBe(true)
  })

  it('builds result for empty content', () => {
    const result = buildRainbowBridgeResult(['empty.ts'], [EMPTY])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgBridgeStrength).toBe(40)
    expect(result.stats.avgSpectrumBreadth).toBe(0)
    expect(result.stats.avgTransitionGrace).toBe(40)
    expect(result.stats.avgAtmosphericClarity).toBe(63)
    expect(result.stats.avgVisionQuality).toBe(40)
    expect(result.stats.avgLuminance).toBe(40)
    expect(result.stats.overallConnection).toBe(37)
    expect(result.stats.architectGrade).toBe('apprentice')
    expect(result.stats.fadedArchCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(0)
    expect(result.sky.isConnected).toBe(false)
  })

  it('builds result for mixed content', () => {
    const result = buildRainbowBridgeResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalArcs).toBe(1)
    expect(result.stats.avgBridgeStrength).toBe(51)
    expect(result.stats.avgSpectrumBreadth).toBe(38)
    expect(result.stats.avgTransitionGrace).toBe(67)
    expect(result.stats.avgAtmosphericClarity).toBe(79)
    expect(result.stats.avgVisionQuality).toBe(57)
    expect(result.stats.avgLuminance).toBe(68)
    expect(result.stats.overallConnection).toBe(59)
    expect(result.stats.architectGrade).toBe('span-builder')
    expect(result.stats.vibrantArcCount).toBe(1)
    expect(result.stats.fadedArchCount).toBe(1)
    expect(result.stats.bestSpan).toBe('rich.ts')
    expect(result.sky.overallConnection).toBe(59)
  })

  it('returns spans and arcs arrays', () => {
    const result = buildRainbowBridgeResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.spans).toHaveLength(2)
    expect(result.arcs).toHaveLength(1)
    expect(result.spans[0].file).toBe('rich.ts')
    expect(result.spans[1].file).toBe('medium.ts')
  })
})

// ─── Format Helpers ───────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for high scores', () => { expect(typeof scoreColor(90)).toBe('string') })
  it('returns string for medium scores', () => { expect(typeof scoreColor(70)).toBe('string') })
  it('returns string for low scores', () => { expect(typeof scoreColor(30)).toBe('string') })
})

describe('conditionColor', () => {
  it('colors divine-rainbow', () => { expect(typeof conditionColor('divine-rainbow')).toBe('string') })
  it('colors vibrant-arc', () => { expect(typeof conditionColor('vibrant-arc')).toBe('string') })
  it('colors painted-bridge', () => { expect(typeof conditionColor('painted-bridge')).toBe('string') })
  it('colors faded-arch', () => { expect(typeof conditionColor('faded-arch')).toBe('string') })
  it('colors misty-outline', () => { expect(typeof conditionColor('misty-outline')).toBe('string') })
  it('colors no-bridge', () => { expect(typeof conditionColor('no-bridge')).toBe('string') })
  it('colors unknown', () => { expect(typeof conditionColor('unknown')).toBe('string') })
})

describe('gradeColor', () => {
  it('colors bridge-architect', () => { expect(typeof gradeColor('bridge-architect')).toBe('string') })
  it('colors rainbow-weaver', () => { expect(typeof gradeColor('rainbow-weaver')).toBe('string') })
  it('colors colorblind', () => { expect(typeof gradeColor('colorblind')).toBe('string') })
})

describe('spanColor', () => {
  it('colors bifrost', () => { expect(typeof spanColor('bifrost')).toBe('string') })
  it('colors broken', () => { expect(typeof spanColor('broken')).toBe('string') })
})

describe('spectrumColor', () => {
  it('colors full-spectrum', () => { expect(typeof spectrumColor('full-spectrum')).toBe('string') })
  it('colors invisible', () => { expect(typeof spectrumColor('invisible')).toBe('string') })
})

describe('eleganceColor', () => {
  it('colors ballet', () => { expect(typeof eleganceColor('ballet')).toBe('string') })
  it('colors falling', () => { expect(typeof eleganceColor('falling')).toBe('string') })
})

describe('atmosphereColor', () => {
  it('colors crystal-clear', () => { expect(typeof atmosphereColor('crystal-clear')).toBe('string') })
  it('colors opaque', () => { expect(typeof atmosphereColor('opaque')).toBe('string') })
})

describe('visionClarityColor', () => {
  it('colors panoramic', () => { expect(typeof visionClarityColor('panoramic')).toBe('string') })
  it('colors blind', () => { expect(typeof visionClarityColor('blind')).toBe('string') })
})

describe('brightnessColor', () => {
  it('colors blinding', () => { expect(typeof brightnessColor('blinding')).toBe('string') })
  it('colors void', () => { expect(typeof brightnessColor('void')).toBe('string') })
})

describe('arcTypeColor', () => {
  it('colors grand-rainbow', () => { expect(typeof arcTypeColor('grand-rainbow')).toBe('string') })
  it('colors no-light', () => { expect(typeof arcTypeColor('no-light')).toBe('string') })
})

describe('arcConditionColor', () => {
  it('colors celestial-bridge', () => { expect(typeof arcConditionColor('celestial-bridge')).toBe('string') })
  it('colors darkness', () => { expect(typeof arcConditionColor('darkness')).toBe('string') })
})

// ─── JSON Formatter ───────────────────────────────────────────

describe('formatRainbowBridgeJson', () => {
  it('returns valid JSON string', () => {
    const result = buildRainbowBridgeResult(['rich.ts'], [RICH])
    const json = formatRainbowBridgeJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.overallConnection).toBe(76)
    expect(parsed.spans).toHaveLength(1)
  })
})

// ─── Table Formatter ─────────────────────────────────────────

describe('formatRainbowBridgeTable', () => {
  it('returns a non-empty string', () => {
    const result = buildRainbowBridgeResult(['rich.ts'], [RICH])
    const table = formatRainbowBridgeTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('returns verbose table with more content', () => {
    const result = buildRainbowBridgeResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    const brief = formatRainbowBridgeTable(result, false)
    const verbose = formatRainbowBridgeTable(result, true)
    expect(verbose.length).toBeGreaterThan(brief.length)
  })
})

// ─── Additional Coverage ──────────────────────────────────────

describe('edge cases', () => {
  it('handles empty rainbow arc', () => {
    const arc = analyzeRainbowArc([], 'empty-dir')
    expect(arc.directory).toBe('empty-dir')
    expect(arc.spans).toHaveLength(0)
    expect(arc.avgStrength).toBe(0)
    expect(arc.arcType).toBe('no-light')
    expect(arc.condition).toBe('darkness')
  })

  it('empty build has zero stats', () => {
    const result = buildRainbowBridgeResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallConnection).toBe(0)
    expect(result.stats.architectGrade).toBe('colorblind')
    expect(result.spans).toHaveLength(0)
    expect(result.arcs).toHaveLength(0)
    expect(result.sky.isConnected).toBe(false)
  })

  it('tracks best-per-file stats correctly', () => {
    const result = buildRainbowBridgeResult(['rich.ts', 'empty.ts'], [RICH, EMPTY])
    expect(result.stats.bestSpan).toBe('rich.ts')
    expect(result.stats.strongest).toBe('rich.ts')
    expect(result.stats.mostDiverse).toBe('rich.ts')
    expect(result.stats.mostGraceful).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.brightest).toBe('rich.ts')
  })
})
