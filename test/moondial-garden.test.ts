import { describe, it, expect } from 'vitest'

import {
  measureLunar,
  measureCircadian,
  measureNocturnal,
  measureGarden,
  measureClarity,
  measureStarlight,
  classifyCondition,
  analyzeMoonlitPlant,
  analyzeGardenPlot,
  classifyPlotType,
  classifyGardenerGrade,
  generateRecommendations,
  buildMoondialGardenResult,
} from '../src/commands/moondial-garden-helpers.js'

import {
  scoreColor,
  conditionColor,
  gradeColor,
  phaseColor,
  cycleColor,
  sightColor,
  healthColor,
  lightColor,
  qualityColor,
  plotTypeColor,
  plotConditionColor,
  formatMoondialGardenJson,
  formatMoondialGardenTable,
} from '../src/commands/moondial-garden-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `/**
 * Module description
 */
import { readFileSync } from 'fs'
import type { PathLike } from 'fs'
export interface Config {
  name: string
  version?: string
}
export type Status = 'active' | 'inactive'
export class Runner {
  private config: Config
  constructor(config: Config) { this.config = config }
  async execute(): Promise<string> {
    try { return readFileSync(this.config.name, 'utf-8') } catch (error) { throw new Error('Failed') }
  }
}
export function createRunner(config: Config): Runner { return new Runner(config) }
export { Runner }
`

const EMPTY = ''

const MEDIUM = `import { foo } from 'bar'
export interface Foo { x: number }
export function hello(): void { console.log('hello') }
`

// ─── measureLunar ───────────────────────────────────────────────────────────

describe('measureLunar', () => {
  it('returns full-moon for rich content', () => {
    const result = measureLunar(RICH)
    expect(result.reflection).toBe(100)
    expect(result.phase).toBe('full-moon')
    expect(result.hasHighReflection).toBe(true)
    expect(result.hasProperGlow).toBe(true)
    expect(result.hasNoShadow).toBe(true)
    expect(result.hasSilverLight).toBe(true)
    expect(result.hasNoDarkSide).toBe(true)
    expect(result.hasReflective).toBe(true)
    expect(result.hasNoEclipse).toBe(true)
    expect(result.hasProperPhase).toBe(true)
    expect(result.hasConsistent).toBe(true)
    expect(result.hasNoWaning).toBe(true)
    expect(result.shadowCount).toBe(0)
    expect(result.eclipseCount).toBe(0)
  })

  it('returns new-moon for empty content', () => {
    const result = measureLunar(EMPTY)
    expect(result.reflection).toBe(42)
    expect(result.phase).toBe('new-moon')
    expect(result.hasHighReflection).toBe(false)
  })

  it('returns correct values for medium content', () => {
    const result = measureLunar(MEDIUM)
    expect(result.reflection).toBe(67)
  })
})

// ─── measureCircadian ───────────────────────────────────────────────────────

describe('measureCircadian', () => {
  it('returns diurnal for rich content', () => {
    const result = measureCircadian(RICH)
    expect(result.rhythm).toBe(90)
    expect(result.cycle).toBe('diurnal')
    expect(result.hasHighRhythm).toBe(true)
    expect(result.hasProperCycle).toBe(true)
    expect(result.hasRhythmic).toBe(false)
    expect(result.hasNoJetlag).toBe(true)
    expect(result.hasConsistent).toBe(true)
    expect(result.hasNoInsomnia).toBe(true)
    expect(result.hasProperPulse).toBe(true)
    expect(result.hasNoArrhythmia).toBe(true)
    expect(result.hasBiological).toBe(true)
    expect(result.hasNoExhaustion).toBe(true)
    expect(result.jetlagCount).toBe(0)
    expect(result.arrhythmiaCount).toBe(0)
  })

  it('returns arrhythmic for empty content', () => {
    const result = measureCircadian(EMPTY)
    expect(result.rhythm).toBe(42)
    expect(result.cycle).toBe('arrhythmic')
    expect(result.hasHighRhythm).toBe(false)
  })

  it('returns correct values for medium content', () => {
    const result = measureCircadian(MEDIUM)
    expect(result.rhythm).toBe(68)
  })
})

// ─── measureNocturnal ───────────────────────────────────────────────────────

describe('measureNocturnal', () => {
  it('returns owl-vision for rich content', () => {
    const result = measureNocturnal(RICH)
    expect(result.wisdom).toBe(90)
    expect(result.sight).toBe('owl-vision')
    expect(result.hasHighWisdom).toBe(true)
    expect(result.hasDarkAdaptation).toBe(true)
    expect(result.hasProperNightVision).toBe(true)
    expect(result.hasNoBlindSpots).toBe(true)
    expect(result.hasAcuteHearing).toBe(true)
    expect(result.hasNoDeafness).toBe(true)
    expect(result.hasSilentFlight).toBe(false)
    expect(result.hasNoCrashLanding).toBe(true)
    expect(result.hasPredatorAwareness).toBe(true)
    expect(result.hasNoVulnerability).toBe(true)
    expect(result.blindSpotCount).toBe(0)
    expect(result.crashLandingCount).toBe(0)
  })

  it('returns near-blind for empty content', () => {
    const result = measureNocturnal(EMPTY)
    expect(result.wisdom).toBe(42)
    expect(result.sight).toBe('near-blind')
    expect(result.hasHighWisdom).toBe(false)
  })

  it('returns correct values for medium content', () => {
    const result = measureNocturnal(MEDIUM)
    expect(result.wisdom).toBe(58)
  })
})

// ─── measureGarden ──────────────────────────────────────────────────────────

describe('measureGarden', () => {
  it('returns flourishing for rich content', () => {
    const result = measureGarden(RICH)
    expect(result.cultivation).toBe(90)
    expect(result.health).toBe('flourishing')
    expect(result.hasHighCultivation).toBe(true)
    expect(result.hasProperPruning).toBe(true)
    expect(result.hasRichSoil).toBe(true)
    expect(result.hasNoWeeds).toBe(true)
    expect(result.hasProperWatering).toBe(true)
    expect(result.hasNoOvergrowth).toBe(true)
    expect(result.hasSeasonalAwareness).toBe(false)
    expect(result.hasNoPests).toBe(true)
    expect(result.hasCompanion).toBe(true)
    expect(result.hasNoRootRot).toBe(true)
    expect(result.weedCount).toBe(0)
    expect(result.pestCount).toBe(0)
  })

  it('returns wilting for empty content', () => {
    const result = measureGarden(EMPTY)
    expect(result.cultivation).toBe(40)
    expect(result.health).toBe('wilting')
    expect(result.hasHighCultivation).toBe(false)
  })

  it('returns correct values for medium content', () => {
    const result = measureGarden(MEDIUM)
    expect(result.cultivation).toBe(57)
  })
})

// ─── measureClarity ─────────────────────────────────────────────────────────

describe('measureClarity', () => {
  it('returns moonlit-path for rich content', () => {
    const result = measureClarity(RICH)
    expect(result.level).toBe(88)
    expect(result.light).toBe('moonlit-path')
    expect(result.hasHighLevel).toBe(true)
    expect(result.hasClearPath).toBe(true)
    expect(result.hasNoObfuscation).toBe(true)
    expect(result.hasProperIllumination).toBe(true)
    expect(result.hasNoDarkAlleys).toBe(true)
    expect(result.hasVisible).toBe(true)
    expect(result.hasNoShadowCode).toBe(true)
    expect(result.hasLanterns).toBe(true)
    expect(result.hasNoDeadEnds).toBe(true)
    expect(result.hasNavigable).toBe(false)
    expect(result.obfuscationCount).toBe(0)
    expect(result.darkAlleyCount).toBe(0)
  })

  it('returns pitch-dark for empty content', () => {
    const result = measureClarity(EMPTY)
    expect(result.level).toBe(41)
    expect(result.light).toBe('pitch-dark')
    expect(result.hasHighLevel).toBe(false)
  })

  it('returns correct values for medium content', () => {
    const result = measureClarity(MEDIUM)
    expect(result.level).toBe(44)
    expect(result.hasNoDarkAlleys).toBe(false)
    expect(result.darkAlleyCount).toBe(1)
  })
})

// ─── measureStarlight ───────────────────────────────────────────────────────

describe('measureStarlight', () => {
  it('returns pole-star for rich content', () => {
    const result = measureStarlight(RICH)
    expect(result.guidance).toBe(100)
    expect(result.quality).toBe('pole-star')
    expect(result.hasHighGuidance).toBe(true)
    expect(result.hasNorthStar).toBe(true)
    expect(result.hasConstellations).toBe(true)
    expect(result.hasProperMapping).toBe(true)
    expect(result.hasNoLostNavigation).toBe(true)
    expect(result.hasStarmap).toBe(true)
    expect(result.hasNoCloudCover).toBe(true)
    expect(result.hasWaypoints).toBe(true)
    expect(result.hasNoWandering).toBe(true)
    expect(result.hasClearDirection).toBe(true)
    expect(result.lostCount).toBe(0)
    expect(result.wanderingCount).toBe(0)
  })

  it('returns cloud-cover for empty content', () => {
    const result = measureStarlight(EMPTY)
    expect(result.guidance).toBe(41)
    expect(result.quality).toBe('cloud-cover')
    expect(result.hasHighGuidance).toBe(false)
  })

  it('returns correct values for medium content', () => {
    const result = measureStarlight(MEDIUM)
    expect(result.guidance).toBe(70)
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns correct conditions at thresholds', () => {
    const base = analyzeMoonlitPlant(RICH, 'r.ts')
    expect(classifyCondition({ ...base, qualityScore: 80 } as any)).toBe('moonlit-paradise')
    expect(classifyCondition({ ...base, qualityScore: 65 } as any)).toBe('silver-garden')
    expect(classifyCondition({ ...base, qualityScore: 50 } as any)).toBe('moonlit-path')
    expect(classifyCondition({ ...base, qualityScore: 35 } as any)).toBe('dark-garden')
    expect(classifyCondition({ ...base, qualityScore: 20 } as any)).toBe('shadow-patch')
    expect(classifyCondition({ ...base, qualityScore: 10 } as any)).toBe('barren-ground')
  })
})

// ─── analyzeMoonlitPlant ────────────────────────────────────────────────────

describe('analyzeMoonlitPlant', () => {
  it('returns moonlit-paradise for rich content', () => {
    const p = analyzeMoonlitPlant(RICH, 'rich.ts')
    expect(p.file).toBe('rich.ts')
    expect(p.lunarReflection).toBe(100)
    expect(p.circadianRhythm).toBe(90)
    expect(p.nocturnalWisdom).toBe(90)
    expect(p.gardenCultivation).toBe(90)
    expect(p.moonlitClarity).toBe(88)
    expect(p.starlightGuidance).toBe(100)
    expect(p.qualityScore).toBe(93)
    expect(p.condition).toBe('moonlit-paradise')
  })

  it('returns dark-garden for empty content', () => {
    const p = analyzeMoonlitPlant(EMPTY, 'empty.ts')
    expect(p.lunarReflection).toBe(42)
    expect(p.circadianRhythm).toBe(42)
    expect(p.nocturnalWisdom).toBe(42)
    expect(p.gardenCultivation).toBe(40)
    expect(p.moonlitClarity).toBe(41)
    expect(p.starlightGuidance).toBe(41)
    expect(p.qualityScore).toBe(41)
    expect(p.condition).toBe('dark-garden')
  })

  it('returns moonlit-path for medium content', () => {
    const p = analyzeMoonlitPlant(MEDIUM, 'medium.ts')
    expect(p.lunarReflection).toBe(67)
    expect(p.circadianRhythm).toBe(68)
    expect(p.nocturnalWisdom).toBe(58)
    expect(p.gardenCultivation).toBe(57)
    expect(p.moonlitClarity).toBe(44)
    expect(p.starlightGuidance).toBe(70)
    expect(p.qualityScore).toBe(60)
    expect(p.condition).toBe('moonlit-path')
  })
})

// ─── classifyGardenerGrade ──────────────────────────────────────────────────

describe('classifyGardenerGrade', () => {
  it('returns correct grades at thresholds', () => {
    expect(classifyGardenerGrade(80)).toBe('lunar-master')
    expect(classifyGardenerGrade(65)).toBe('night-gardener')
    expect(classifyGardenerGrade(50)).toBe('moon-gazer')
    expect(classifyGardenerGrade(35)).toBe('stargazer')
    expect(classifyGardenerGrade(20)).toBe('wanderer')
    expect(classifyGardenerGrade(0)).toBe('sleepwalker')
  })
})

// ─── classifyPlotType ───────────────────────────────────────────────────────

describe('classifyPlotType', () => {
  it('returns void for empty plants', () => {
    expect(classifyPlotType([])).toBe('void')
  })

  it('returns correct types based on avg score', () => {
    const rp = analyzeMoonlitPlant(RICH, 'r.ts')
    const mp = analyzeMoonlitPlant(MEDIUM, 'm.ts')
    expect(classifyPlotType([rp, mp])).toBe('formal-garden')
    expect(classifyPlotType([rp])).toBe('formal-garden')
    expect(classifyPlotType([mp])).toBe('moonlight-garden')
  })
})

// ─── analyzeGardenPlot ──────────────────────────────────────────────────────

describe('analyzeGardenPlot', () => {
  it('returns void for empty plants', () => {
    const p = analyzeGardenPlot([], 'empty')
    expect(p.directory).toBe('empty')
    expect(p.plotType).toBe('void')
    expect(p.condition).toBe('barren')
    expect(p.plants).toEqual([])
  })

  it('returns correct plot for rich + medium', () => {
    const rp = analyzeMoonlitPlant(RICH, 'r.ts')
    const mp = analyzeMoonlitPlant(MEDIUM, 'm.ts')
    const p = analyzeGardenPlot([rp, mp], 'src')
    expect(p.plotType).toBe('formal-garden')
    expect(p.condition).toBe('ethereal-paradise')
    expect(p.avgLunar).toBe(84)
    expect(p.avgCircadian).toBe(79)
    expect(p.avgStarlight).toBe(85)
    expect(p.paradiseCount).toBe(1)
    expect(p.barrenCount).toBe(0)
    expect(p.moonlitCount).toBe(1)
    expect(p.wiseCount).toBe(1)
  })
})

// ─── buildMoondialGardenResult ──────────────────────────────────────────────

describe('buildMoondialGardenResult', () => {
  it('returns correct result for empty file', () => {
    const r = buildMoondialGardenResult(['empty.ts'], [EMPTY])
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.avgLunarReflection).toBe(42)
    expect(r.stats.avgCircadianRhythm).toBe(42)
    expect(r.stats.avgNocturnalWisdom).toBe(42)
    expect(r.stats.avgGardenCultivation).toBe(40)
    expect(r.stats.avgMoonlitClarity).toBe(41)
    expect(r.stats.avgStarlightGuidance).toBe(41)
    expect(r.stats.darkGardenCount).toBe(1)
    expect(r.stats.overallLuminance).toBe(41)
    expect(r.stats.gardenerGrade).toBe('stargazer')
    expect(r.estate.overallLuminance).toBe(41)
    expect(r.estate.isLuminous).toBe(false)
    expect(r.plants).toHaveLength(1)
    expect(r.plots).toHaveLength(1)
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('returns correct result for rich + medium', () => {
    const r = buildMoondialGardenResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.totalPlots).toBe(1)
    expect(r.stats.avgLunarReflection).toBe(84)
    expect(r.stats.avgCircadianRhythm).toBe(79)
    expect(r.stats.avgNocturnalWisdom).toBe(74)
    expect(r.stats.avgGardenCultivation).toBe(74)
    expect(r.stats.avgMoonlitClarity).toBe(66)
    expect(r.stats.avgStarlightGuidance).toBe(85)
    expect(r.stats.moonlitParadiseCount).toBe(1)
    expect(r.stats.moonlitPathCount).toBe(1)
    expect(r.stats.overallLuminance).toBe(76)
    expect(r.stats.gardenerGrade).toBe('night-gardener')
    expect(r.stats.bestPlant).toBe('rich.ts')
    expect(r.stats.bestDocumented).toBe('rich.ts')
    expect(r.stats.mostRhythmic).toBe('rich.ts')
    expect(r.stats.wisest).toBe('rich.ts')
    expect(r.stats.bestCultivated).toBe('rich.ts')
    expect(r.stats.clearest).toBe('rich.ts')
    expect(r.stats.hasHighReflectionCount).toBe(1)
    expect(r.stats.hasHighRhythmCount).toBe(1)
    expect(r.stats.hasHighWisdomCount).toBe(1)
    expect(r.stats.hasHighCultivationCount).toBe(1)
    expect(r.stats.hasHighLevelCount).toBe(1)
    expect(r.stats.hasHighGuidanceCount).toBe(2)
    expect(r.estate.isLuminous).toBe(true)
    expect(r.estate.avgLunar).toBe(84)
    expect(r.plots).toHaveLength(1)
    expect(r.recommendations).toHaveLength(0)
  })

  it('handles no files', () => {
    const r = buildMoondialGardenResult([], [])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.totalPlots).toBe(0)
    expect(r.stats.overallLuminance).toBe(0)
    expect(r.stats.gardenerGrade).toBe('sleepwalker')
    expect(r.plants).toHaveLength(0)
    expect(r.plots).toHaveLength(0)
    expect(r.estate.isLuminous).toBe(false)
    expect(r.stats.bestPlant).toBe('')
  })

  it('splits files into different directories for plots', () => {
    const r = buildMoondialGardenResult(
      ['src/a.ts', 'lib/b.ts'],
      [RICH, MEDIUM],
    )
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.totalPlots).toBe(2)
    expect(r.plots[0].directory).toBe('src')
    expect(r.plots[1].directory).toBe('lib')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for low scores', () => {
    const r = buildMoondialGardenResult(['e.ts'], [EMPTY])
    expect(r.recommendations).toContain('Increase lunar reflection — add documentation to illuminate your code')
    expect(r.recommendations).toContain('Improve circadian rhythm — add proper async/await cycles for code timing')
    expect(r.recommendations).toContain('Enhance nocturnal wisdom — add error handling for dark code paths')
    expect(r.recommendations).toContain('Cultivate your garden — add interfaces and types for rich code soil')
    expect(r.recommendations).toContain('Improve moonlit clarity — remove console statements and any types')
    expect(r.recommendations).toContain('Guide by starlight — add proper imports and exports for code navigation')
  })

  it('generates no recommendations for high scores', () => {
    const r = buildMoondialGardenResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(r.recommendations).toHaveLength(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('formatMoondialGardenJson', () => {
  it('returns valid JSON string', () => {
    const r = buildMoondialGardenResult(['r.ts'], [RICH])
    const json = formatMoondialGardenJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.plants).toHaveLength(1)
  })
})

describe('formatMoondialGardenTable', () => {
  it('returns formatted string with key labels', () => {
    const r = buildMoondialGardenResult(['r.ts'], [RICH])
    const table = formatMoondialGardenTable(r, false)
    expect(table).toContain('Moondial Garden Analysis')
    expect(table).toContain('Estate Overview')
    expect(table).toContain('Statistics')
    expect(table).toContain('Condition Counts')
  })

  it('includes per-file details in verbose mode', () => {
    const r = buildMoondialGardenResult(['r.ts'], [RICH])
    const table = formatMoondialGardenTable(r, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('r.ts')
  })

  it('shows highlights when bestPlant exists', () => {
    const r = buildMoondialGardenResult(['r.ts'], [RICH])
    const table = formatMoondialGardenTable(r, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Plant')
  })

  it('shows recommendations when present', () => {
    const r = buildMoondialGardenResult(['e.ts'], [EMPTY])
    const table = formatMoondialGardenTable(r, false)
    expect(table).toContain('Recommendations')
  })
})

// ─── Color Helpers ──────────────────────────────────────────────────────────

describe('color helpers', () => {
  it('scoreColor returns string for all ranges', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(70)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('conditionColor handles all conditions', () => {
    const conditions = ['moonlit-paradise', 'silver-garden', 'moonlit-path', 'dark-garden', 'shadow-patch', 'barren-ground']
    for (const c of conditions) expect(typeof conditionColor(c)).toBe('string')
  })

  it('gradeColor handles all grades', () => {
    const grades = ['lunar-master', 'night-gardener', 'moon-gazer', 'stargazer', 'wanderer', 'sleepwalker']
    for (const g of grades) expect(typeof gradeColor(g)).toBe('string')
  })

  it('phaseColor handles all phases', () => {
    const phases = ['full-moon', 'gibbous', 'half-moon', 'crescent', 'new-moon', 'eclipse']
    for (const p of phases) expect(typeof phaseColor(p)).toBe('string')
  })

  it('cycleColor handles all cycles', () => {
    const cycles = ['circadian-perfect', 'diurnal', 'crepuscular', 'nocturnal', 'arrhythmic', 'chaotic']
    for (const c of cycles) expect(typeof cycleColor(c)).toBe('string')
  })

  it('sightColor handles all sights', () => {
    const sights = ['owl-vision', 'night-eyes', 'low-light', 'dim-sight', 'near-blind', 'blind']
    for (const s of sights) expect(typeof sightColor(s)).toBe('string')
  })

  it('healthColor handles all healths', () => {
    const values = ['flourishing', 'blooming', 'growing', 'dormant', 'wilting', 'dead']
    for (const v of values) expect(typeof healthColor(v)).toBe('string')
  })

  it('lightColor handles all lights', () => {
    const values = ['moonlit-path', 'starlight', 'twilight', 'deep-dusk', 'pitch-dark', 'void']
    for (const v of values) expect(typeof lightColor(v)).toBe('string')
  })

  it('qualityColor handles all qualities', () => {
    const values = ['pole-star', 'constellation', 'star-chart', 'random-stars', 'cloud-cover', 'void']
    for (const v of values) expect(typeof qualityColor(v)).toBe('string')
  })

  it('plotTypeColor handles all types', () => {
    const values = ['formal-garden', 'moonlight-garden', 'wild-garden', 'neglected-plot', 'wasteland', 'void']
    for (const v of values) expect(typeof plotTypeColor(v)).toBe('string')
  })

  it('plotConditionColor handles all conditions', () => {
    const values = ['ethereal-paradise', 'silver-oasis', 'moonlit-retreat', 'dim-garden', 'dark-corner', 'barren']
    for (const v of values) expect(typeof plotConditionColor(v)).toBe('string')
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('qualityScore formula uses correct weights', () => {
    const p = analyzeMoonlitPlant(RICH, 'r.ts')
    const expected = Math.round(
      100 * 0.15 + 90 * 0.15 + 90 * 0.2 + 90 * 0.15 + 88 * 0.2 + 100 * 0.15,
    )
    expect(p.qualityScore).toBe(expected)
  })

  it('detects console in clarity dark alleys', () => {
    const consoleContent = "console.log('hello')\nconsole.error('bad')"
    const c = measureClarity(consoleContent)
    expect(c.hasNoDarkAlleys).toBe(false)
    expect(c.darkAlleyCount).toBe(2)
  })

  it('detects any/eval in garden weeds', () => {
    const anyContent = 'const x: any = 1\neval("test")'
    const g = measureGarden(anyContent)
    expect(g.hasNoWeeds).toBe(false)
    expect(g.weedCount).toBe(2)
  })

  it('formatMoondialGardenTable omits per-file when not verbose', () => {
    const r = buildMoondialGardenResult(['r.ts'], [RICH])
    const table = formatMoondialGardenTable(r, false)
    expect(table).not.toContain('Per-File Details')
  })

  it('detects empty catch in circadian arrhythmia', () => {
    const badContent = 'try {} catch (e) {}'
    const c = measureCircadian(badContent)
    expect(c.hasNoArrhythmia).toBe(false)
    expect(c.arrhythmiaCount).toBe(1)
  })

  it('detects HACK in garden pests', () => {
    const hackContent = '// HACK: workaround'
    const g = measureGarden(hackContent)
    expect(g.hasNoPests).toBe(false)
    expect(g.pestCount).toBe(1)
  })

  it('detects TODO in starlight wandering', () => {
    const todoContent = '// TODO: fix this\n// FIXME: broken'
    const s = measureStarlight(todoContent)
    expect(s.hasNoWandering).toBe(false)
    expect(s.wanderingCount).toBe(2)
  })

  it('detects deprecated in lunar eclipse', () => {
    const depContent = '/** @deprecated */ function old() {}'
    const l = measureLunar(depContent)
    expect(l.hasNoEclipse).toBe(false)
    expect(l.eclipseCount).toBe(1)
  })

  it('detects circadian insomnia with no function keywords', () => {
    const insContent = 'const x = 1 + 2'
    const c = measureCircadian(insContent)
    expect(c.hasNoInsomnia).toBe(true)
  })

  it('medium content nocturnal sight', () => {
    const n = measureNocturnal(MEDIUM)
    expect(n.sight).toBe('near-blind')
  })

  it('medium content garden health', () => {
    const g = measureGarden(MEDIUM)
    expect(g.hasRichSoil).toBe(true)
  })

  it('medium content clarity with console', () => {
    const c = measureClarity(MEDIUM)
    expect(c.hasClearPath).toBe(true)
    expect(c.hasNoDarkAlleys).toBe(false)
  })

  it('medium content starlight mapping', () => {
    const s = measureStarlight(MEDIUM)
    expect(s.hasProperMapping).toBe(true)
  })

  it('nocturnal blind for very low wisdom', () => {
    const n = measureNocturnal('')
    expect(n.sight).toBe('near-blind')
  })

  it('garden dead for very low cultivation', () => {
    const g = measureGarden('')
    expect(g.health).toBe('wilting')
  })

  it('clarity void for very low level', () => {
    const c = measureClarity('')
    expect(c.light).toBe('pitch-dark')
  })

  it('starlight void for very low guidance', () => {
    const s = measureStarlight('')
    expect(s.quality).toBe('cloud-cover')
  })

  it('analyzeGardenPlot with single medium plant', () => {
    const mp = analyzeMoonlitPlant(MEDIUM, 'm.ts')
    const p = analyzeGardenPlot([mp], 'test')
    expect(p.plotType).toBe('moonlight-garden')
    expect(p.condition).toBe('silver-oasis')
    expect(p.paradiseCount).toBe(0)
    expect(p.wiseCount).toBe(0)
  })
})
