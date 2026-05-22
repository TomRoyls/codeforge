import { describe, it, expect } from 'vitest'

import {
  measureHardness,
  measureCrystal,
  measureWeather,
  measureFoundation,
  measureSummit,
  measureExposure,
  classifyCondition,
  analyzeRockFormation,
  analyzeMountainRange,
  classifyRangeType,
  classifyClimberGrade,
  generateRecommendations,
  buildGranitePeakResult,
} from '../src/commands/granite-peak-helpers.js'

import {
  scoreColor,
  conditionColor,
  gradeColor,
  hardnessGradeColor,
  crystalSystemColor,
  weatherGradeColor,
  foundationTypeColor,
  summitElevationColor,
  exposureQualityColor,
  rangeTypeColor,
  rangeConditionColor,
  formatGranitePeakJson,
  formatGranitePeakTable,
} from '../src/commands/granite-peak-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `/**
 * Module description
 */
import { readFileSync } from 'fs'
import type { PathLike } from 'fs'
import type { BufferEncoding } from 'fs'
export interface Config {
  name: string
  version?: string
}
export type Status = 'active' | 'inactive'
export class Runner {
  private config: Config
  constructor(config: Config) {
    this.config = config
  }
  async execute(): Promise<string> {
    try {
      const data = readFileSync(this.config.name, 'utf-8')
      return data
    } catch (error) {
      throw new Error('Failed')
    }
  }
}
export function createRunner(config: Config): Runner {
  return new Runner(config)
}
export { Runner }
`

const EMPTY = ''

const MEDIUM = `import { foo } from 'bar'
export interface Foo {
  x: number
}
export function hello(): void {
  console.log('hello')
}
`

// ─── measureHardness ────────────────────────────────────────────────────────

describe('measureHardness', () => {
  it('returns high score for rich content', () => {
    const result = measureHardness(RICH)
    expect(result.level).toBe(80)
    expect(result.grade).toBe('granite-hard')
    expect(result.hasHighLevel).toBe(true)
    expect(result.hasImpactResistant).toBe(true)
    expect(result.hasNoCracks).toBe(true)
    expect(result.hasDenseStructure).toBe(true)
    expect(result.hasNoFractures).toBe(true)
    expect(result.hasAbrasionResistant).toBe(true)
    expect(result.hasNoChipping).toBe(true)
    expect(result.hasSolid).toBe(false)
    expect(result.hasNoWeathering).toBe(true)
    expect(result.hasCompressive).toBe(false)
    expect(result.crackCount).toBe(0)
    expect(result.fractureCount).toBe(0)
  })

  it('returns low score for empty content', () => {
    const result = measureHardness(EMPTY)
    expect(result.level).toBe(43)
    expect(result.grade).toBe('shale-weak')
    expect(result.hasHighLevel).toBe(false)
    expect(result.hasImpactResistant).toBe(false)
  })

  it('returns medium score for partial content', () => {
    const result = measureHardness(MEDIUM)
    expect(result.level).toBe(58)
    expect(result.hasDenseStructure).toBe(true)
    expect(result.hasNoCracks).toBe(true)
  })
})

// ─── measureCrystal ─────────────────────────────────────────────────────────

describe('measureCrystal', () => {
  it('returns perfect hexagonal for rich content', () => {
    const result = measureCrystal(RICH)
    expect(result.structure).toBe(100)
    expect(result.system).toBe('perfect-hexagonal')
    expect(result.hasHighStructure).toBe(true)
    expect(result.hasProperGrain).toBe(true)
    expect(result.hasInterlocking).toBe(true)
    expect(result.hasNoVoids).toBe(true)
    expect(result.hasUniformTexture).toBe(true)
    expect(result.hasNoInclusions).toBe(true)
    expect(result.hasProperOrientation).toBe(true)
    expect(result.hasNoMisalignment).toBe(true)
    expect(result.hasEquigranular).toBe(true)
    expect(result.hasNoXenoliths).toBe(true)
    expect(result.voidCount).toBe(0)
    expect(result.inclusionCount).toBe(0)
  })

  it('returns massive for empty content', () => {
    const result = measureCrystal(EMPTY)
    expect(result.structure).toBe(40)
    expect(result.system).toBe('massive')
    expect(result.hasHighStructure).toBe(false)
  })

  it('returns correct values for medium content', () => {
    const result = measureCrystal(MEDIUM)
    expect(result.structure).toBe(67)
    expect(result.hasInterlocking).toBe(true)
    expect(result.hasProperOrientation).toBe(true)
  })
})

// ─── measureWeather ─────────────────────────────────────────────────────────

describe('measureWeather', () => {
  it('returns weatherproof for rich content', () => {
    const result = measureWeather(RICH)
    expect(result.resistance).toBe(90)
    expect(result.grade).toBe('weatherproof')
    expect(result.hasHighResistance).toBe(true)
    expect(result.hasFreezeThawResistant).toBe(true)
    expect(result.hasNoErosion).toBe(true)
    expect(result.hasChemicalResistant).toBe(true)
    expect(result.hasNoExfoliation).toBe(true)
    expect(result.hasUVDegradationResistant).toBe(true)
    expect(result.hasNoSpalling).toBe(true)
    expect(result.hasAcidResistant).toBe(true)
    expect(result.hasNoPitting).toBe(true)
    expect(result.hasBiologicalResistant).toBe(false)
    expect(result.erosionCount).toBe(0)
    expect(result.spallingCount).toBe(0)
  })

  it('returns crumbling for empty content', () => {
    const result = measureWeather(EMPTY)
    expect(result.resistance).toBe(43)
    expect(result.grade).toBe('crumbling')
    expect(result.hasHighResistance).toBe(false)
  })

  it('returns susceptible for medium content', () => {
    const result = measureWeather(MEDIUM)
    expect(result.resistance).toBe(68)
    expect(result.grade).toBe('susceptible')
    expect(result.hasChemicalResistant).toBe(true)
    expect(result.hasAcidResistant).toBe(true)
  })
})

// ─── measureFoundation ──────────────────────────────────────────────────────

describe('measureFoundation', () => {
  it('returns bedrock for rich content', () => {
    const result = measureFoundation(RICH)
    expect(result.depth).toBe(89)
    expect(result.type).toBe('bedrock')
    expect(result.hasHighDepth).toBe(true)
    expect(result.hasSolidBase).toBe(true)
    expect(result.hasProperSettling).toBe(true)
    expect(result.hasNoShifting).toBe(true)
    expect(result.hasDeepRoots).toBe(true)
    expect(result.hasNoErosion).toBe(true)
    expect(result.hasProperDrainage).toBe(true)
    expect(result.hasNoWaterDamage).toBe(true)
    expect(result.hasLoadDistribution).toBe(false)
    expect(result.hasNoSubsidence).toBe(true)
    expect(result.shiftingCount).toBe(0)
    expect(result.subsidenceCount).toBe(0)
  })

  it('returns loose-gravel for empty content', () => {
    const result = measureFoundation(EMPTY)
    expect(result.depth).toBe(40)
    expect(result.type).toBe('loose-gravel')
    expect(result.hasHighDepth).toBe(false)
  })

  it('returns loose-gravel for medium content', () => {
    const result = measureFoundation(MEDIUM)
    expect(result.depth).toBe(57)
    expect(result.type).toBe('loose-gravel')
    expect(result.hasProperSettling).toBe(true)
  })
})

// ─── measureSummit ──────────────────────────────────────────────────────────

describe('measureSummit', () => {
  it('returns everest-class for rich content', () => {
    const result = measureSummit(RICH)
    expect(result.quality).toBe(90)
    expect(result.elevation).toBe('everest-class')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasClearView).toBe(true)
    expect(result.hasNoBlindSpots).toBe(true)
    expect(result.hasProperExposure).toBe(true)
    expect(result.hasNoAvalanche).toBe(true)
    expect(result.hasStable).toBe(true)
    expect(result.hasNoOverhanging).toBe(true)
    expect(result.hasCleanLines).toBe(true)
    expect(result.hasNoClutter).toBe(true)
    expect(result.hasMajestic).toBe(false)
    expect(result.avalancheCount).toBe(0)
    expect(result.overhangingCount).toBe(0)
  })

  it('returns hummock for empty content', () => {
    const result = measureSummit(EMPTY)
    expect(result.quality).toBe(53)
    expect(result.elevation).toBe('hummock')
    expect(result.hasHighQuality).toBe(false)
  })

  it('returns hummock for medium content', () => {
    const result = measureSummit(MEDIUM)
    expect(result.quality).toBe(56)
    expect(result.elevation).toBe('hummock')
    expect(result.hasProperExposure).toBe(true)
  })
})

// ─── measureExposure ────────────────────────────────────────────────────────

describe('measureExposure', () => {
  it('returns master-climber for rich content', () => {
    const result = measureExposure(RICH)
    expect(result.handling).toBe(100)
    expect(result.quality).toBe('master-climber')
    expect(result.hasHighHandling).toBe(true)
    expect(result.hasProperAnchoring).toBe(true)
    expect(result.hasNoFallRisk).toBe(true)
    expect(result.hasRopeProtection).toBe(true)
    expect(result.hasNoSlipHazards).toBe(true)
    expect(result.hasProperRoute).toBe(true)
    expect(result.hasNoDeadEnds).toBe(true)
    expect(result.hasSafetyEquipment).toBe(true)
    expect(result.hasNoExposure).toBe(true)
    expect(result.hasEmergencyPlan).toBe(true)
    expect(result.fallRiskCount).toBe(0)
    expect(result.slipHazardCount).toBe(0)
  })

  it('returns exposed for empty content', () => {
    const result = measureExposure(EMPTY)
    expect(result.handling).toBe(53)
    expect(result.quality).toBe('exposed')
    expect(result.hasHighHandling).toBe(false)
  })

  it('returns experienced for medium content', () => {
    const result = measureExposure(MEDIUM)
    expect(result.handling).toBe(78)
    expect(result.quality).toBe('experienced')
    expect(result.hasHighHandling).toBe(true)
    expect(result.hasProperRoute).toBe(true)
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns matterhorn for quality >= 80', () => {
    const f = { ...analyzeRockFormation(RICH, 'r.ts'), qualityScore: 80 }
    expect(classifyCondition(f as any)).toBe('matterhorn')
  })

  it('returns half-dome for quality >= 65', () => {
    const f = { ...analyzeRockFormation(RICH, 'r.ts'), qualityScore: 65 }
    expect(classifyCondition(f as any)).toBe('half-dome')
  })

  it('returns granite-tor for quality >= 50', () => {
    const f = { ...analyzeRockFormation(RICH, 'r.ts'), qualityScore: 50 }
    expect(classifyCondition(f as any)).toBe('granite-tor')
  })

  it('returns weathered-crag for quality >= 35', () => {
    const f = { ...analyzeRockFormation(RICH, 'r.ts'), qualityScore: 35 }
    expect(classifyCondition(f as any)).toBe('weathered-crag')
  })

  it('returns gravel-pile for quality >= 20', () => {
    const f = { ...analyzeRockFormation(RICH, 'r.ts'), qualityScore: 20 }
    expect(classifyCondition(f as any)).toBe('gravel-pile')
  })

  it('returns dust for quality < 20', () => {
    const f = { ...analyzeRockFormation(RICH, 'r.ts'), qualityScore: 10 }
    expect(classifyCondition(f as any)).toBe('dust')
  })
})

// ─── analyzeRockFormation ───────────────────────────────────────────────────

describe('analyzeRockFormation', () => {
  it('returns correct formation for rich content', () => {
    const f = analyzeRockFormation(RICH, 'rich.ts')
    expect(f.file).toBe('rich.ts')
    expect(f.rockHardness).toBe(80)
    expect(f.crystallineStructure).toBe(100)
    expect(f.weatherResistance).toBe(90)
    expect(f.foundationDepth).toBe(89)
    expect(f.summitQuality).toBe(90)
    expect(f.exposureHandling).toBe(100)
    expect(f.qualityScore).toBe(91)
    expect(f.condition).toBe('matterhorn')
  })

  it('returns correct formation for empty content', () => {
    const f = analyzeRockFormation(EMPTY, 'empty.ts')
    expect(f.file).toBe('empty.ts')
    expect(f.rockHardness).toBe(43)
    expect(f.crystallineStructure).toBe(40)
    expect(f.weatherResistance).toBe(43)
    expect(f.foundationDepth).toBe(40)
    expect(f.summitQuality).toBe(53)
    expect(f.exposureHandling).toBe(53)
    expect(f.qualityScore).toBe(46)
    expect(f.condition).toBe('weathered-crag')
  })

  it('returns correct formation for medium content', () => {
    const f = analyzeRockFormation(MEDIUM, 'medium.ts')
    expect(f.file).toBe('medium.ts')
    expect(f.rockHardness).toBe(58)
    expect(f.crystallineStructure).toBe(67)
    expect(f.weatherResistance).toBe(68)
    expect(f.foundationDepth).toBe(57)
    expect(f.summitQuality).toBe(56)
    expect(f.exposureHandling).toBe(78)
    expect(f.qualityScore).toBe(64)
    expect(f.condition).toBe('granite-tor')
  })
})

// ─── classifyClimberGrade ───────────────────────────────────────────────────

describe('classifyClimberGrade', () => {
  it('returns master-alpinist for 80+', () => {
    expect(classifyClimberGrade(80)).toBe('master-alpinist')
    expect(classifyClimberGrade(100)).toBe('master-alpinist')
  })

  it('returns mountaineer for 65-79', () => {
    expect(classifyClimberGrade(65)).toBe('mountaineer')
    expect(classifyClimberGrade(79)).toBe('mountaineer')
  })

  it('returns climber for 50-64', () => {
    expect(classifyClimberGrade(50)).toBe('climber')
    expect(classifyClimberGrade(64)).toBe('climber')
  })

  it('returns hiker for 35-49', () => {
    expect(classifyClimberGrade(35)).toBe('hiker')
    expect(classifyClimberGrade(49)).toBe('hiker')
  })

  it('returns walker for 20-34', () => {
    expect(classifyClimberGrade(20)).toBe('walker')
    expect(classifyClimberGrade(34)).toBe('walker')
  })

  it('returns armchair for < 20', () => {
    expect(classifyClimberGrade(0)).toBe('armchair')
    expect(classifyClimberGrade(19)).toBe('armchair')
  })
})

// ─── classifyRangeType ──────────────────────────────────────────────────────

describe('classifyRangeType', () => {
  it('returns flatland for empty formations', () => {
    expect(classifyRangeType([])).toBe('flatland')
  })

  it('returns himalayan-range for high avg + 30% matterhorn', () => {
    const rf = analyzeRockFormation(RICH, 'r.ts')
    const mf = analyzeRockFormation(MEDIUM, 'm.ts')
    expect(classifyRangeType([rf, mf])).toBe('himalayan-range')
  })

  it('returns himalayan-range for single rich formation', () => {
    const rf = analyzeRockFormation(RICH, 'r.ts')
    expect(classifyRangeType([rf])).toBe('himalayan-range')
  })

  it('returns alpine-chain for medium formations', () => {
    const mf = analyzeRockFormation(MEDIUM, 'm.ts')
    expect(classifyRangeType([mf])).toBe('alpine-chain')
  })
})

// ─── analyzeMountainRange ───────────────────────────────────────────────────

describe('analyzeMountainRange', () => {
  it('returns flatland for empty formations', () => {
    const r = analyzeMountainRange([], 'empty-dir')
    expect(r.directory).toBe('empty-dir')
    expect(r.rangeType).toBe('flatland')
    expect(r.condition).toBe('plains')
    expect(r.formations).toEqual([])
    expect(r.avgHardness).toBe(0)
    expect(r.matterhornCount).toBe(0)
  })

  it('returns correct range for rich + medium', () => {
    const rf = analyzeRockFormation(RICH, 'r.ts')
    const mf = analyzeRockFormation(MEDIUM, 'm.ts')
    const r = analyzeMountainRange([rf, mf], 'src')
    expect(r.directory).toBe('src')
    expect(r.rangeType).toBe('himalayan-range')
    expect(r.condition).toBe('majestic-range')
    expect(r.avgHardness).toBe(69)
    expect(r.avgCrystal).toBe(84)
    expect(r.avgSummit).toBe(73)
    expect(r.matterhornCount).toBe(1)
    expect(r.dustCount).toBe(0)
    expect(r.hardCount).toBe(1)
    expect(r.stableCount).toBe(1)
  })
})

// ─── buildGranitePeakResult ─────────────────────────────────────────────────

describe('buildGranitePeakResult', () => {
  it('returns correct result for empty file', () => {
    const r = buildGranitePeakResult(['empty.ts'], [EMPTY])
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.totalRanges).toBe(1)
    expect(r.stats.avgRockHardness).toBe(43)
    expect(r.stats.avgCrystallineStructure).toBe(40)
    expect(r.stats.avgWeatherResistance).toBe(43)
    expect(r.stats.avgFoundationDepth).toBe(40)
    expect(r.stats.avgSummitQuality).toBe(53)
    expect(r.stats.avgExposureHandling).toBe(53)
    expect(r.stats.weatheredCragCount).toBe(1)
    expect(r.stats.overallSolidity).toBe(46)
    expect(r.stats.climberGrade).toBe('hiker')
    expect(r.stats.bestFormation).toBe('empty.ts')
    expect(r.mountain.overallSolidity).toBe(46)
    expect(r.mountain.isSolid).toBe(false)
    expect(r.formations).toHaveLength(1)
    expect(r.ranges).toHaveLength(1)
    expect(r.ranges[0].rangeType).toBe('rocky-ridge')
    expect(r.ranges[0].condition).toBe('rolling-hills')
  })

  it('returns correct result for rich + medium', () => {
    const r = buildGranitePeakResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.totalRanges).toBe(1)
    expect(r.stats.avgRockHardness).toBe(69)
    expect(r.stats.avgCrystallineStructure).toBe(84)
    expect(r.stats.avgWeatherResistance).toBe(79)
    expect(r.stats.avgFoundationDepth).toBe(73)
    expect(r.stats.avgSummitQuality).toBe(73)
    expect(r.stats.avgExposureHandling).toBe(89)
    expect(r.stats.matterhornCount).toBe(1)
    expect(r.stats.graniteTorCount).toBe(1)
    expect(r.stats.overallSolidity).toBe(78)
    expect(r.stats.climberGrade).toBe('mountaineer')
    expect(r.stats.bestFormation).toBe('rich.ts')
    expect(r.stats.hardest).toBe('rich.ts')
    expect(r.stats.bestStructured).toBe('rich.ts')
    expect(r.stats.mostResilient).toBe('rich.ts')
    expect(r.stats.deepestFoundation).toBe('rich.ts')
    expect(r.stats.highestQuality).toBe('rich.ts')
    expect(r.stats.hasHighHardnessCount).toBe(1)
    expect(r.stats.hasHighStructureCount).toBe(1)
    expect(r.stats.hasHighResistanceCount).toBe(1)
    expect(r.stats.hasHighDepthCount).toBe(1)
    expect(r.stats.hasHighQualityCount).toBe(1)
    expect(r.stats.hasHighHandlingCount).toBe(2)
    expect(r.mountain.overallSolidity).toBe(78)
    expect(r.mountain.isSolid).toBe(true)
    expect(r.mountain.avgHardness).toBe(69)
    expect(r.mountain.avgCrystal).toBe(84)
    expect(r.mountain.avgSummit).toBe(73)
    expect(r.ranges).toHaveLength(1)
    expect(r.ranges[0].rangeType).toBe('himalayan-range')
    expect(r.ranges[0].condition).toBe('majestic-range')
    expect(r.formations).toHaveLength(2)
    expect(r.recommendations).toHaveLength(0)
  })

  it('handles no files', () => {
    const r = buildGranitePeakResult([], [])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.totalRanges).toBe(0)
    expect(r.stats.overallSolidity).toBe(0)
    expect(r.stats.climberGrade).toBe('armchair')
    expect(r.formations).toHaveLength(0)
    expect(r.ranges).toHaveLength(0)
    expect(r.mountain.isSolid).toBe(false)
    expect(r.stats.bestFormation).toBe('')
  })

  it('splits files into different directories for ranges', () => {
    const r = buildGranitePeakResult(
      ['src/a.ts', 'lib/b.ts'],
      [RICH, MEDIUM],
    )
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.totalRanges).toBe(2)
    expect(r.ranges[0].directory).toBe('src')
    expect(r.ranges[1].directory).toBe('lib')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for low scores', () => {
    const r = buildGranitePeakResult(['e.ts'], [EMPTY])
    expect(r.recommendations.length).toBeGreaterThan(0)
    expect(r.recommendations).toContain('Increase rock hardness — add interfaces and types for proper code robustness')
    expect(r.recommendations).toContain('Improve crystalline structure — organize code with proper interlocking patterns')
    expect(r.recommendations).toContain('Boost weather resistance — add error handling to protect against code erosion')
    expect(r.recommendations).toContain('Deepen foundations — stabilize dependencies with proper exports and imports')
  })

  it('generates no recommendations for high scores', () => {
    const r = buildGranitePeakResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(r.recommendations).toHaveLength(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('formatGranitePeakJson', () => {
  it('returns valid JSON string', () => {
    const r = buildGranitePeakResult(['r.ts'], [RICH])
    const json = formatGranitePeakJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.formations).toHaveLength(1)
  })
})

describe('formatGranitePeakTable', () => {
  it('returns formatted string with key labels', () => {
    const r = buildGranitePeakResult(['r.ts'], [RICH])
    const table = formatGranitePeakTable(r, false)
    expect(table).toContain('Granite Peak Analysis')
    expect(table).toContain('Mountain Overview')
    expect(table).toContain('Statistics')
    expect(table).toContain('Condition Counts')
  })

  it('includes per-file details in verbose mode', () => {
    const r = buildGranitePeakResult(['r.ts'], [RICH])
    const table = formatGranitePeakTable(r, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('r.ts')
  })

  it('omits per-file details when not verbose', () => {
    const r = buildGranitePeakResult(['r.ts'], [RICH])
    const table = formatGranitePeakTable(r, false)
    expect(table).not.toContain('Per-File Details')
  })

  it('shows recommendations when present', () => {
    const r = buildGranitePeakResult(['e.ts'], [EMPTY])
    const table = formatGranitePeakTable(r, false)
    expect(table).toContain('Recommendations')
  })

  it('shows highlights when bestFormation exists', () => {
    const r = buildGranitePeakResult(['r.ts'], [RICH])
    const table = formatGranitePeakTable(r, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Formation')
  })
})

// ─── Color Helpers ──────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns a string for various scores', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(70)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns colored strings for all conditions', () => {
    const conditions = ['matterhorn', 'half-dome', 'granite-tor', 'weathered-crag', 'gravel-pile', 'dust']
    for (const c of conditions) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })
})

describe('gradeColor', () => {
  it('returns colored strings for all grades', () => {
    const grades = ['master-alpinist', 'mountaineer', 'climber', 'hiker', 'walker', 'armchair']
    for (const g of grades) {
      expect(typeof gradeColor(g)).toBe('string')
    }
  })
})

describe('hardnessGradeColor', () => {
  it('returns colored strings for all hardness grades', () => {
    const grades = ['diamond-class', 'granite-hard', 'basalt-firm', 'sandstone-soft', 'shale-weak', 'clay-crumble']
    for (const g of grades) {
      expect(typeof hardnessGradeColor(g)).toBe('string')
    }
  })
})

describe('crystalSystemColor', () => {
  it('returns colored strings for all crystal systems', () => {
    const systems = ['perfect-hexagonal', 'well-crystallized', 'granular', 'porphyritic', 'massive', 'amorphous']
    for (const s of systems) {
      expect(typeof crystalSystemColor(s)).toBe('string')
    }
  })
})

describe('weatherGradeColor', () => {
  it('returns colored strings for all weather grades', () => {
    const grades = ['weatherproof', 'weather-resistant', 'moderate-weathering', 'susceptible', 'crumbling', 'dissolving']
    for (const g of grades) {
      expect(typeof weatherGradeColor(g)).toBe('string')
    }
  })
})

describe('foundationTypeColor', () => {
  it('returns colored strings for all foundation types', () => {
    const types = ['bedrock', 'deep-regolith', 'stable-substrate', 'shallow-soil', 'loose-gravel', 'quicksand']
    for (const t of types) {
      expect(typeof foundationTypeColor(t)).toBe('string')
    }
  })
})

describe('summitElevationColor', () => {
  it('returns colored strings for all summit elevations', () => {
    const elevations = ['everest-class', 'high-summit', 'alpine-peak', 'foothill', 'hummock', 'depression']
    for (const e of elevations) {
      expect(typeof summitElevationColor(e)).toBe('string')
    }
  })
})

describe('exposureQualityColor', () => {
  it('returns colored strings for all exposure qualities', () => {
    const qualities = ['master-climber', 'experienced', 'properly-equipped', 'underprepared', 'exposed', 'fatal-fall']
    for (const q of qualities) {
      expect(typeof exposureQualityColor(q)).toBe('string')
    }
  })
})

describe('rangeTypeColor', () => {
  it('returns colored strings for all range types', () => {
    const types = ['himalayan-range', 'alpine-chain', 'rocky-ridge', 'hill-country', 'moraine', 'flatland']
    for (const t of types) {
      expect(typeof rangeTypeColor(t)).toBe('string')
    }
  })
})

describe('rangeConditionColor', () => {
  it('returns colored strings for all range conditions', () => {
    const conditions = ['majestic-range', 'solid-mountains', 'rolling-hills', 'eroding-peaks', 'rubble', 'plains']
    for (const c of conditions) {
      expect(typeof rangeConditionColor(c)).toBe('string')
    }
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with any type annotations', () => {
    const anyContent = 'const x: any = 1\neval("test")\ntry {} catch (e) {}'
    const h = measureHardness(anyContent)
    expect(h.crackCount).toBeGreaterThan(0)
    expect(h.fractureCount).toBeGreaterThan(0)
  })

  it('handles content with TODO and FIXME markers', () => {
    const debtContent = '// TODO: fix this\n// FIXME: broken\n// HACK: workaround'
    const c = measureCrystal(debtContent)
    expect(c.inclusionCount).toBeGreaterThan(0)
    expect(c.hasNoXenoliths).toBe(false)
  })

  it('handles content with console statements', () => {
    const consoleContent = "console.log('hello')\nconsole.error('bad')"
    const s = measureSummit(consoleContent)
    expect(s.hasNoBlindSpots).toBe(false)
    expect(s.avalancheCount).toBe(0)
  })

  it('qualityScore formula uses correct weights', () => {
    const f = analyzeRockFormation(RICH, 'r.ts')
    const expected = Math.round(
      80 * 0.15 + 100 * 0.15 + 90 * 0.2 + 89 * 0.15 + 90 * 0.2 + 100 * 0.15,
    )
    expect(f.qualityScore).toBe(expected)
  })
})
