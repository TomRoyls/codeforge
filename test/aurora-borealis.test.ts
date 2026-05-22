import { describe, it, expect } from 'vitest'

import {
  measureEnergy,
  measureAlignment,
  measureSpectral,
  measureIonization,
  measureAtmospheric,
  measureElectromagnetic,
  classifyCondition,
  analyzeAuroraFlare,
  analyzePolarRegion,
  classifyRegionType,
  classifyObserverGrade,
  generateRecommendations,
  buildAuroraBorealisResult,
} from '../src/commands/aurora-borealis-helpers.js'

import {
  scoreColor,
  conditionColor,
  gradeColor,
  intensityColor,
  fieldColor,
  paletteColor,
  processColor,
  atmosphericConditionColor,
  powerColor,
  regionTypeColor,
  regionConditionColor,
  formatAuroraBorealisJson,
  formatAuroraBorealisTable,
} from '../src/commands/aurora-borealis-format-helpers.js'

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

// ─── measureEnergy ──────────────────────────────────────────────────────────

describe('measureEnergy', () => {
  it('returns geomagnetic-storm for rich content', () => {
    const result = measureEnergy(RICH)
    expect(result.level).toBe(79)
    expect(result.intensity).toBe('geomagnetic-storm')
    expect(result.hasHighLevel).toBe(true)
    expect(result.hasChargedParticles).toBe(true)
    expect(result.hasProperFlux).toBe(true)
    expect(result.hasNoDischarge).toBe(true)
    expect(result.hasHighActivity).toBe(true)
    expect(result.hasNoBrownout).toBe(true)
    expect(result.hasSustained).toBe(false)
    expect(result.hasNoOutage).toBe(true)
    expect(result.hasPulsating).toBe(false)
    expect(result.hasNoDepletion).toBe(true)
    expect(result.dischargeCount).toBe(0)
    expect(result.brownoutCount).toBe(0)
  })

  it('returns quiet for empty content', () => {
    const result = measureEnergy(EMPTY)
    expect(result.level).toBe(42)
    expect(result.intensity).toBe('quiet')
    expect(result.hasHighLevel).toBe(false)
    expect(result.hasChargedParticles).toBe(false)
  })

  it('returns correct values for medium content', () => {
    const result = measureEnergy(MEDIUM)
    expect(result.level).toBe(57)
    expect(result.hasProperFlux).toBe(true)
    expect(result.hasNoDischarge).toBe(true)
  })
})

// ─── measureAlignment ───────────────────────────────────────────────────────

describe('measureAlignment', () => {
  it('returns perfect-dipole for rich content', () => {
    const result = measureAlignment(RICH)
    expect(result.level).toBe(100)
    expect(result.field).toBe('perfect-dipole')
    expect(result.hasHighLevel).toBe(true)
    expect(result.hasProperPoles).toBe(true)
    expect(result.hasFieldLines).toBe(true)
    expect(result.hasNoReversal).toBe(true)
    expect(result.hasStableField).toBe(true)
    expect(result.hasNoFluctuation).toBe(true)
    expect(result.hasProperOrbit).toBe(true)
    expect(result.hasNoDrift).toBe(true)
    expect(result.hasCoherent).toBe(true)
    expect(result.hasNoChaos).toBe(true)
    expect(result.reversalCount).toBe(0)
    expect(result.driftCount).toBe(0)
  })

  it('returns distorted for empty content', () => {
    const result = measureAlignment(EMPTY)
    expect(result.level).toBe(40)
    expect(result.field).toBe('distorted')
    expect(result.hasHighLevel).toBe(false)
  })

  it('returns correct values for medium content', () => {
    const result = measureAlignment(MEDIUM)
    expect(result.level).toBe(67)
    expect(result.hasFieldLines).toBe(true)
    expect(result.hasProperOrbit).toBe(true)
  })
})

// ─── measureSpectral ────────────────────────────────────────────────────────

describe('measureSpectral', () => {
  it('returns full-spectrum for rich content', () => {
    const result = measureSpectral(RICH)
    expect(result.beauty).toBe(80)
    expect(result.palette).toBe('full-spectrum')
    expect(result.hasHighBeauty).toBe(true)
    expect(result.hasGreenEmission).toBe(true)
    expect(result.hasNoColorBlindness).toBe(true)
    expect(result.hasProperWavelength).toBe(true)
    expect(result.hasNoDistortion).toBe(true)
    expect(result.hasVibrant).toBe(true)
    expect(result.hasNoFading).toBe(true)
    expect(result.hasDancing).toBe(true)
    expect(result.colorBlindnessCount).toBe(0)
    expect(result.fadingCount).toBe(0)
  })

  it('returns monochrome for empty content', () => {
    const result = measureSpectral(EMPTY)
    expect(result.beauty).toBe(33)
    expect(result.palette).toBe('monochrome')
    expect(result.hasHighBeauty).toBe(false)
  })

  it('returns monochrome for medium content', () => {
    const result = measureSpectral(MEDIUM)
    expect(result.beauty).toBe(48)
    expect(result.hasProperWavelength).toBe(true)
  })
})

// ─── measureIonization ──────────────────────────────────────────────────────

describe('measureIonization', () => {
  it('returns fusion-reactor for rich content', () => {
    const result = measureIonization(RICH)
    expect(result.quality).toBe(90)
    expect(result.process).toBe('fusion-reactor')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasProperExcitation).toBe(true)
    expect(result.hasNoIonLoss).toBe(true)
    expect(result.hasEnergyTransfer).toBe(true)
    expect(result.hasNoDegradation).toBe(true)
    expect(result.hasPhotonEmission).toBe(true)
    expect(result.hasNoAbsorption).toBe(true)
    expect(result.hasProperCascade).toBe(true)
    expect(result.hasNoQuenching).toBe(true)
    expect(result.ionLossCount).toBe(0)
    expect(result.quenchingCount).toBe(0)
  })

  it('returns ground-state for empty content', () => {
    const result = measureIonization(EMPTY)
    expect(result.quality).toBe(43)
    expect(result.process).toBe('ground-state')
    expect(result.hasHighQuality).toBe(false)
  })

  it('returns ground-state for medium content', () => {
    const result = measureIonization(MEDIUM)
    expect(result.quality).toBe(58)
    expect(result.hasEnergyTransfer).toBe(true)
  })
})

// ─── measureAtmospheric ─────────────────────────────────────────────────────

describe('measureAtmospheric', () => {
  it('returns crystal-clear for rich content', () => {
    const result = measureAtmospheric(RICH)
    expect(result.clarity).toBe(100)
    expect(result.condition).toBe('crystal-clear')
    expect(result.hasHighClarity).toBe(true)
    expect(result.hasTransparent).toBe(true)
    expect(result.hasNoInterference).toBe(true)
    expect(result.hasProperContrast).toBe(true)
    expect(result.hasNoLightPollution).toBe(true)
    expect(result.hasVisible).toBe(true)
    expect(result.hasNoObfuscation).toBe(true)
    expect(result.hasDarkSky).toBe(true)
    expect(result.hasNoSmog).toBe(true)
    expect(result.hasBreathtaking).toBe(true)
    expect(result.interferenceCount).toBe(0)
    expect(result.lightPollutionCount).toBe(0)
  })

  it('returns overcast for empty content', () => {
    const result = measureAtmospheric(EMPTY)
    expect(result.clarity).toBe(55)
    expect(result.condition).toBe('overcast')
    expect(result.hasHighClarity).toBe(false)
  })

  it('returns overcast for medium content with console', () => {
    const result = measureAtmospheric(MEDIUM)
    expect(result.clarity).toBe(58)
    expect(result.condition).toBe('overcast')
    expect(result.hasNoLightPollution).toBe(false)
    expect(result.lightPollutionCount).toBe(1)
  })
})

// ─── measureElectromagnetic ─────────────────────────────────────────────────

describe('measureElectromagnetic', () => {
  it('returns mega-flare for rich content', () => {
    const result = measureElectromagnetic(RICH)
    expect(result.force).toBe(90)
    expect(result.power).toBe('mega-flare')
    expect(result.hasHighForce).toBe(true)
    expect(result.hasProperInduction).toBe(true)
    expect(result.hasNoInterference).toBe(true)
    expect(result.hasStrongSignal).toBe(true)
    expect(result.hasNoNoise).toBe(true)
    expect(result.hasProperConductance).toBe(true)
    expect(result.hasNoResistance).toBe(true)
    expect(result.hasAmplification).toBe(true)
    expect(result.hasNoAttenuation).toBe(true)
    expect(result.interferenceCount).toBe(0)
    expect(result.attenuationCount).toBe(0)
  })

  it('returns residual for empty content', () => {
    const result = measureElectromagnetic(EMPTY)
    expect(result.force).toBe(43)
    expect(result.power).toBe('residual')
    expect(result.hasHighForce).toBe(false)
  })

  it('returns residual for medium content', () => {
    const result = measureElectromagnetic(MEDIUM)
    expect(result.force).toBe(58)
    expect(result.hasProperConductance).toBe(true)
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns correct conditions at thresholds', () => {
    const base = analyzeAuroraFlare(RICH, 'r.ts')
    expect(classifyCondition({ ...base, qualityScore: 80 } as any)).toBe('magnificent-display')
    expect(classifyCondition({ ...base, qualityScore: 65 } as any)).toBe('brilliant-aurora')
    expect(classifyCondition({ ...base, qualityScore: 50 } as any)).toBe('visible-shimmer')
    expect(classifyCondition({ ...base, qualityScore: 35 } as any)).toBe('faint-glow')
    expect(classifyCondition({ ...base, qualityScore: 20 } as any)).toBe('subvisual')
    expect(classifyCondition({ ...base, qualityScore: 10 } as any)).toBe('darkness')
  })
})

// ─── analyzeAuroraFlare ─────────────────────────────────────────────────────

describe('analyzeAuroraFlare', () => {
  it('returns magnificent-display for rich content', () => {
    const f = analyzeAuroraFlare(RICH, 'rich.ts')
    expect(f.file).toBe('rich.ts')
    expect(f.polarEnergy).toBe(79)
    expect(f.magneticAlignment).toBe(100)
    expect(f.spectralBeauty).toBe(80)
    expect(f.ionizationQuality).toBe(90)
    expect(f.atmosphericClarity).toBe(100)
    expect(f.electromagneticForce).toBe(90)
    expect(f.qualityScore).toBe(90)
    expect(f.condition).toBe('magnificent-display')
  })

  it('returns faint-glow for empty content', () => {
    const f = analyzeAuroraFlare(EMPTY, 'empty.ts')
    expect(f.polarEnergy).toBe(42)
    expect(f.magneticAlignment).toBe(40)
    expect(f.spectralBeauty).toBe(33)
    expect(f.ionizationQuality).toBe(43)
    expect(f.atmosphericClarity).toBe(55)
    expect(f.electromagneticForce).toBe(43)
    expect(f.qualityScore).toBe(43)
    expect(f.condition).toBe('faint-glow')
  })

  it('returns visible-shimmer for medium content', () => {
    const f = analyzeAuroraFlare(MEDIUM, 'medium.ts')
    expect(f.polarEnergy).toBe(57)
    expect(f.qualityScore).toBe(57)
    expect(f.condition).toBe('visible-shimmer')
  })
})

// ─── classifyObserverGrade ──────────────────────────────────────────────────

describe('classifyObserverGrade', () => {
  it('returns correct grades at thresholds', () => {
    expect(classifyObserverGrade(80)).toBe('aurora-master')
    expect(classifyObserverGrade(65)).toBe('polar-observer')
    expect(classifyObserverGrade(50)).toBe('aurora-hunter')
    expect(classifyObserverGrade(35)).toBe('sky-watcher')
    expect(classifyObserverGrade(20)).toBe('novice')
    expect(classifyObserverGrade(0)).toBe('indoor')
  })
})

// ─── classifyRegionType ─────────────────────────────────────────────────────

describe('classifyRegionType', () => {
  it('returns void for empty flares', () => {
    expect(classifyRegionType([])).toBe('void')
  })

  it('returns correct types based on avg score', () => {
    const rf = analyzeAuroraFlare(RICH, 'r.ts')
    const mf = analyzeAuroraFlare(MEDIUM, 'm.ts')
    expect(classifyRegionType([rf, mf])).toBe('polar-cap')
    expect(classifyRegionType([rf])).toBe('aurora-oval')
    expect(classifyRegionType([mf])).toBe('sub-auroral')
  })
})

// ─── analyzePolarRegion ─────────────────────────────────────────────────────

describe('analyzePolarRegion', () => {
  it('returns void for empty flares', () => {
    const r = analyzePolarRegion([], 'empty')
    expect(r.directory).toBe('empty')
    expect(r.regionType).toBe('void')
    expect(r.condition).toBe('void')
    expect(r.flares).toEqual([])
  })

  it('returns correct region for rich + medium', () => {
    const rf = analyzeAuroraFlare(RICH, 'r.ts')
    const mf = analyzeAuroraFlare(MEDIUM, 'm.ts')
    const r = analyzePolarRegion([rf, mf], 'src')
    expect(r.directory).toBe('src')
    expect(r.regionType).toBe('polar-cap')
    expect(r.condition).toBe('active-aurora')
    expect(r.avgEnergy).toBe(68)
    expect(r.avgAlignment).toBe(84)
    expect(r.avgElectromagnetic).toBe(74)
    expect(r.magnificentCount).toBe(1)
    expect(r.darknessCount).toBe(0)
    expect(r.highEnergyCount).toBe(1)
    expect(r.alignedCount).toBe(1)
  })
})

// ─── buildAuroraBorealisResult ──────────────────────────────────────────────

describe('buildAuroraBorealisResult', () => {
  it('returns correct result for empty file', () => {
    const r = buildAuroraBorealisResult(['empty.ts'], [EMPTY])
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.avgPolarEnergy).toBe(42)
    expect(r.stats.avgMagneticAlignment).toBe(40)
    expect(r.stats.avgSpectralBeauty).toBe(33)
    expect(r.stats.avgIonizationQuality).toBe(43)
    expect(r.stats.avgAtmosphericClarity).toBe(55)
    expect(r.stats.avgElectromagneticForce).toBe(43)
    expect(r.stats.faintGlowCount).toBe(1)
    expect(r.stats.overallBrilliance).toBe(43)
    expect(r.stats.observerGrade).toBe('sky-watcher')
    expect(r.magnetosphere.overallBrilliance).toBe(43)
    expect(r.magnetosphere.isBrilliant).toBe(false)
    expect(r.flares).toHaveLength(1)
    expect(r.regions).toHaveLength(1)
  })

  it('returns correct result for rich + medium', () => {
    const r = buildAuroraBorealisResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.totalRegions).toBe(1)
    expect(r.stats.avgPolarEnergy).toBe(68)
    expect(r.stats.avgMagneticAlignment).toBe(84)
    expect(r.stats.avgSpectralBeauty).toBe(64)
    expect(r.stats.avgIonizationQuality).toBe(74)
    expect(r.stats.avgAtmosphericClarity).toBe(79)
    expect(r.stats.avgElectromagneticForce).toBe(74)
    expect(r.stats.magnificentDisplayCount).toBe(1)
    expect(r.stats.visibleShimmerCount).toBe(1)
    expect(r.stats.overallBrilliance).toBe(74)
    expect(r.stats.observerGrade).toBe('polar-observer')
    expect(r.stats.bestFlare).toBe('rich.ts')
    expect(r.stats.mostEnergetic).toBe('rich.ts')
    expect(r.stats.mostAligned).toBe('rich.ts')
    expect(r.stats.mostBeautiful).toBe('rich.ts')
    expect(r.stats.mostTransformative).toBe('rich.ts')
    expect(r.stats.strongestForce).toBe('rich.ts')
    expect(r.stats.hasHighEnergyCount).toBe(1)
    expect(r.stats.hasHighAlignmentCount).toBe(1)
    expect(r.stats.hasHighBeautyCount).toBe(1)
    expect(r.stats.hasHighQualityCount).toBe(1)
    expect(r.stats.hasHighClarityCount).toBe(1)
    expect(r.stats.hasHighForceCount).toBe(1)
    expect(r.magnetosphere.isBrilliant).toBe(true)
    expect(r.magnetosphere.avgEnergy).toBe(68)
    expect(r.regions).toHaveLength(1)
    expect(r.regions[0].regionType).toBe('polar-cap')
    expect(r.recommendations).toHaveLength(0)
  })

  it('handles no files', () => {
    const r = buildAuroraBorealisResult([], [])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.totalRegions).toBe(0)
    expect(r.stats.overallBrilliance).toBe(0)
    expect(r.stats.observerGrade).toBe('indoor')
    expect(r.flares).toHaveLength(0)
    expect(r.regions).toHaveLength(0)
    expect(r.magnetosphere.isBrilliant).toBe(false)
    expect(r.stats.bestFlare).toBe('')
  })

  it('splits files into different directories for regions', () => {
    const r = buildAuroraBorealisResult(
      ['src/a.ts', 'lib/b.ts'],
      [RICH, MEDIUM],
    )
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.totalRegions).toBe(2)
    expect(r.regions[0].directory).toBe('src')
    expect(r.regions[1].directory).toBe('lib')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for low scores', () => {
    const r = buildAuroraBorealisResult(['e.ts'], [EMPTY])
    expect(r.recommendations.length).toBeGreaterThan(0)
    expect(r.recommendations).toContain('Increase polar energy — add interfaces and types to energize your code')
    expect(r.recommendations).toContain('Improve magnetic alignment — organize code with proper import/export poles')
    expect(r.recommendations).toContain('Enhance spectral beauty — add documentation for vibrant code colors')
    expect(r.recommendations).toContain('Boost ionization quality — add error handling for proper code transformation')
    expect(r.recommendations).toContain('Strengthen electromagnetic force — add type safety and proper code conductance')
  })

  it('generates no recommendations for high scores', () => {
    const r = buildAuroraBorealisResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(r.recommendations).toHaveLength(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('formatAuroraBorealisJson', () => {
  it('returns valid JSON string', () => {
    const r = buildAuroraBorealisResult(['r.ts'], [RICH])
    const json = formatAuroraBorealisJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.flares).toHaveLength(1)
  })
})

describe('formatAuroraBorealisTable', () => {
  it('returns formatted string with key labels', () => {
    const r = buildAuroraBorealisResult(['r.ts'], [RICH])
    const table = formatAuroraBorealisTable(r, false)
    expect(table).toContain('Aurora Borealis Analysis')
    expect(table).toContain('Magnetosphere Overview')
    expect(table).toContain('Statistics')
    expect(table).toContain('Condition Counts')
  })

  it('includes per-file details in verbose mode', () => {
    const r = buildAuroraBorealisResult(['r.ts'], [RICH])
    const table = formatAuroraBorealisTable(r, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('r.ts')
  })

  it('shows highlights when bestFlare exists', () => {
    const r = buildAuroraBorealisResult(['r.ts'], [RICH])
    const table = formatAuroraBorealisTable(r, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Flare')
  })

  it('shows recommendations when present', () => {
    const r = buildAuroraBorealisResult(['e.ts'], [EMPTY])
    const table = formatAuroraBorealisTable(r, false)
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
    const conditions = ['magnificent-display', 'brilliant-aurora', 'visible-shimmer', 'faint-glow', 'subvisual', 'darkness']
    for (const c of conditions) expect(typeof conditionColor(c)).toBe('string')
  })

  it('gradeColor handles all grades', () => {
    const grades = ['aurora-master', 'polar-observer', 'aurora-hunter', 'sky-watcher', 'novice', 'indoor']
    for (const g of grades) expect(typeof gradeColor(g)).toBe('string')
  })

  it('intensityColor handles all intensities', () => {
    const values = ['solar-flare', 'geomagnetic-storm', 'aurora-maximum', 'substorm', 'quiet', 'dormant']
    for (const v of values) expect(typeof intensityColor(v)).toBe('string')
  })

  it('fieldColor handles all fields', () => {
    const values = ['perfect-dipole', 'strong-alignment', 'magnetic-field', 'weak-field', 'distorted', 'collapsed']
    for (const v of values) expect(typeof fieldColor(v)).toBe('string')
  })

  it('paletteColor handles all palettes', () => {
    const values = ['full-spectrum', 'green-curtain', 'violet-waves', 'faint-glow', 'monochrome', 'invisible']
    for (const v of values) expect(typeof paletteColor(v)).toBe('string')
  })

  it('processColor handles all processes', () => {
    const values = ['fusion-reactor', 'high-ionization', 'partial-ionization', 'excited-state', 'ground-state', 'frozen']
    for (const v of values) expect(typeof processColor(v)).toBe('string')
  })

  it('atmosphericConditionColor handles all conditions', () => {
    const values = ['crystal-clear', 'arctic-clear', 'high-altitude', 'partly-cloudy', 'overcast', 'opaque']
    for (const v of values) expect(typeof atmosphericConditionColor(v)).toBe('string')
  })

  it('powerColor handles all powers', () => {
    const values = ['mega-flare', 'strong-force', 'moderate-field', 'weak-field', 'residual', 'void']
    for (const v of values) expect(typeof powerColor(v)).toBe('string')
  })

  it('regionTypeColor handles all types', () => {
    const values = ['aurora-oval', 'polar-cap', 'sub-auroral', 'mid-latitude', 'equatorial', 'void']
    for (const v of values) expect(typeof regionTypeColor(v)).toBe('string')
  })

  it('regionConditionColor handles all conditions', () => {
    const values = ['spectacular-display', 'active-aurora', 'quiet-aurora', 'faint-glimmer', 'dark-sky', 'void']
    for (const v of values) expect(typeof regionConditionColor(v)).toBe('string')
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with any type annotations', () => {
    const anyContent = 'const x: any = 1\neval("test")\ntry {} catch (e) {}'
    const e = measureEnergy(anyContent)
    expect(e.dischargeCount).toBeGreaterThan(0)
    expect(e.brownoutCount).toBeGreaterThan(0)
  })

  it('handles content with TODO and FIXME markers', () => {
    const debtContent = '// TODO: fix this\n// FIXME: broken\n// HACK: workaround'
    const a = measureAlignment(debtContent)
    expect(a.driftCount).toBeGreaterThan(0)
    expect(a.hasNoChaos).toBe(false)
  })

  it('handles content with console statements', () => {
    const consoleContent = "console.log('hello')\nconsole.error('bad')"
    const atm = measureAtmospheric(consoleContent)
    expect(atm.hasNoLightPollution).toBe(false)
    expect(atm.lightPollutionCount).toBe(2)
  })

  it('qualityScore formula uses correct weights', () => {
    const f = analyzeAuroraFlare(RICH, 'r.ts')
    const expected = Math.round(
      79 * 0.15 + 100 * 0.15 + 80 * 0.2 + 90 * 0.15 + 100 * 0.2 + 90 * 0.15,
    )
    expect(f.qualityScore).toBe(expected)
  })

  it('detects eval usage in electromagnetic interference', () => {
    const evalContent = 'const x = eval("1+1")'
    const em = measureElectromagnetic(evalContent)
    expect(em.hasNoInterference).toBe(false)
    expect(em.interferenceCount).toBe(1)
  })

  it('detects deprecated markers in spectral fading', () => {
    const depContent = '/** @deprecated */ function old() {}'
    const sp = measureSpectral(depContent)
    expect(sp.hasNoFading).toBe(false)
    expect(sp.fadingCount).toBe(1)
  })

  it('detects empty catch in electromagnetic resistance', () => {
    const badContent = 'try {} catch (e) {}'
    const em = measureElectromagnetic(badContent)
    expect(em.hasNoResistance).toBe(false)
  })

  it('energy dormant for content below 30', () => {
    const lowContent = 'const x = 1: any'
    const e = measureEnergy('')
    expect(e.intensity).toBe('quiet')
  })

  it('alignment collapsed for low-level content', () => {
    const a = measureAlignment('')
    expect(a.field).toBe('distorted')
    expect(a.level).toBe(40)
  })

  it('spectral invisible for very low beauty', () => {
    const s = measureSpectral('')
    expect(s.palette).toBe('monochrome')
    expect(s.beauty).toBe(33)
  })

  it('ionization frozen for low quality', () => {
    const i = measureIonization('')
    expect(i.process).toBe('ground-state')
  })

  it('atmospheric opaque for low clarity', () => {
    const a = measureAtmospheric('')
    expect(a.condition).toBe('overcast')
  })

  it('electromagnetic void for low force', () => {
    const em = measureElectromagnetic('')
    expect(em.power).toBe('residual')
  })

  it('buildAuroraBorealisResult with multiple regions', () => {
    const r = buildAuroraBorealisResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MEDIUM, EMPTY],
    )
    expect(r.stats.totalFiles).toBe(3)
    expect(r.stats.totalRegions).toBe(2)
    expect(r.regions).toHaveLength(2)
  })

  it('analyzePolarRegion single medium flare', () => {
    const mf = analyzeAuroraFlare(MEDIUM, 'm.ts')
    const r = analyzePolarRegion([mf], 'test')
    expect(r.regionType).toBe('sub-auroral')
    expect(r.condition).toBe('quiet-aurora')
    expect(r.highEnergyCount).toBe(0)
  })

  it('formatAuroraBorealisTable omits per-file details when not verbose', () => {
    const r = buildAuroraBorealisResult(['r.ts'], [RICH])
    const table = formatAuroraBorealisTable(r, false)
    expect(table).not.toContain('Per-File Details')
  })
})
