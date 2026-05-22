import { describe, expect, it } from 'vitest'
import {
  measureTransparency,
  measureSpectrum,
  measureRefraction,
  measureDispersion,
  measurePurity,
  measureLuminous,
  analyzeLightBeam,
  analyzeLightSpectrum,
  classifyCondition,
  classifySpectrumType,
  classifySpectrumCondition,
  classifyOpticianGrade,
  generateRecommendations,
  buildPrismLightResult,
} from '../src/commands/prism-light-helpers.js'
import {
  scoreColor,
  conditionColor,
  gradeColor,
  spectrumTypeColor,
  formatPrismLightJson,
  formatPrismLightTable,
} from '../src/commands/prism-light-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `/**
 * Well-documented module with classes, interfaces, types, and full type safety.
 * @example createApp(config)
 */

import type { Config } from './config.js'
import type { Logger } from './logger.js'
import { EventEmitter } from 'events'
import { promisify } from 'util'

export interface AppConfig {
  name: string
  version: string
  debug: boolean
}

export interface ServerConfig extends AppConfig {
  port: number
  host: string
}

export type ConfigType = AppConfig | ServerConfig

export enum Status {
  Idle = 'idle',
  Running = 'running',
  Stopped = 'stopped',
}

/**
 * Application class
 * @example const app = new Application(config)
 */
export class Application extends EventEmitter {
  private config: ServerConfig
  private status: Status = Status.Idle
  protected logger: Logger
  static readonly defaultPort = 3000

  constructor(config: ServerConfig) {
    super()
    this.config = config
  }

  async start(): Promise<void> {
    try {
      this.status = Status.Running
      if (this.config.debug) {
        process.stdout.write('Starting...')
      }
    } catch (err) {
      this.status = Status.Stopped
    }
  }

  stop(): void {
    this.status = Status.Stopped
  }
}

export function createApp(config: ServerConfig): Application {
  return new Application(config)
}

export const createServer = (config: ServerConfig): Application => {
  return new Application(config)
}

export type { Config, Logger }
`

const EMPTY = ''

const MEDIUM = `
import { something } from 'lib'

function processItem(item) {
  if (item) {
    return item.value
  }
  return null
}

export function main() {
  const data = processItem({ value: 42 })
  // TODO: improve this
  return data
}
`

// ─── Transparency Measurement ──────────────────────────────────────────────

describe('measureTransparency', () => {
  it('RICH: returns high level with grade glass', () => {
    const t = measureTransparency(RICH)
    expect(t.level).toBe(100)
    expect(t.grade).toBe('glass')
    expect(t.hasHighTransparency).toBe(true)
    expect(t.hasNoAbsorption).toBe(true)
    expect(t.hasProperTransmission).toBe(true)
    expect(t.hasNoScattering).toBe(false)
    expect(t.hasNoReflection).toBe(true)
    expect(t.hasUniformClarity).toBe(true)
    expect(t.hasProperFocus).toBe(true)
    expect(t.hasNoDistortion).toBe(false)
    expect(t.hasCleanPassage).toBe(true)
    expect(t.hasNoInterference).toBe(true)
    expect(t.absorptionCount).toBe(0)
    expect(t.scatteringCount).toBe(1)
  })

  it('EMPTY: returns low level', () => {
    const t = measureTransparency(EMPTY)
    expect(t.level).toBe(38)
    expect(t.grade).toBe('opaque')
    expect(t.hasHighTransparency).toBe(false)
    expect(t.hasNoAbsorption).toBe(true)
    expect(t.hasNoScattering).toBe(true)
    expect(t.absorptionCount).toBe(0)
    expect(t.scatteringCount).toBe(0)
  })

  it('MEDIUM: returns mid level', () => {
    const t = measureTransparency(MEDIUM)
    expect(t.level).toBe(53)
    expect(t.hasHighTransparency).toBe(false)
    expect(t.hasProperTransmission).toBe(false)
    expect(t.hasNoAbsorption).toBe(false)
    expect(t.absorptionCount).toBe(1)
    expect(t.scatteringCount).toBe(0)
  })
})

// ─── Spectrum Measurement ──────────────────────────────────────────────────

describe('measureSpectrum', () => {
  it('RICH: returns high diversity with partial range', () => {
    const s = measureSpectrum(RICH)
    expect(s.diversity).toBe(100)
    expect(s.range).toBe('partial')
    expect(s.hasRichSpectrum).toBe(true)
    expect(s.hasRedComponent).toBe(true)
    expect(s.hasOrangeComponent).toBe(true)
    expect(s.hasYellowComponent).toBe(true)
    expect(s.hasGreenComponent).toBe(true)
    expect(s.hasBlueComponent).toBe(true)
    expect(s.hasVioletComponent).toBe(true)
    expect(s.hasNoSpectralGaps).toBe(false)
    expect(s.hasContinuousSpectrum).toBe(true)
    expect(s.hasNoEmissionLines).toBe(true)
    expect(s.gapCount).toBe(1)
    expect(s.emissionCount).toBe(0)
  })

  it('EMPTY: returns low diversity', () => {
    const s = measureSpectrum(EMPTY)
    expect(s.diversity).toBe(32)
    expect(s.hasRichSpectrum).toBe(false)
    expect(s.hasNoSpectralGaps).toBe(true)
    expect(s.hasNoEmissionLines).toBe(true)
    expect(s.gapCount).toBe(0)
    expect(s.emissionCount).toBe(0)
  })

  it('MEDIUM: returns mid diversity', () => {
    const s = measureSpectrum(MEDIUM)
    expect(s.diversity).toBe(47)
    expect(s.hasRichSpectrum).toBe(false)
    expect(s.hasNoSpectralGaps).toBe(false)
    expect(s.gapCount).toBe(1)
  })
})

// ─── Refraction Measurement ────────────────────────────────────────────────

describe('measureRefraction', () => {
  it('RICH: returns high index with angle shallow', () => {
    const r = measureRefraction(RICH)
    expect(r.index).toBe(97)
    expect(r.angle).toBe('shallow')
    expect(r.hasProperRefraction).toBe(true)
    expect(r.hasSnellCompliance).toBe(true)
    expect(r.hasNoAberration).toBe(true)
    expect(r.hasProperBending).toBe(true)
    expect(r.hasNoDistortion).toBe(false)
    expect(r.hasAchromatic).toBe(true)
    expect(r.aberrationCount).toBe(0)
    expect(r.distortionCount).toBe(1)
  })

  it('EMPTY: returns low index', () => {
    const r = measureRefraction(EMPTY)
    expect(r.index).toBe(35)
    expect(r.angle).toBe('total-internal')
    expect(r.hasProperRefraction).toBe(false)
    expect(r.hasNoAberration).toBe(true)
    expect(r.aberrationCount).toBe(0)
    expect(r.distortionCount).toBe(0)
  })

  it('MEDIUM: returns mid index', () => {
    const r = measureRefraction(MEDIUM)
    expect(r.index).toBe(55)
    expect(r.hasProperRefraction).toBe(false)
    expect(r.hasNoAberration).toBe(false)
    expect(r.aberrationCount).toBe(1)
    expect(r.distortionCount).toBe(0)
  })
})

// ─── Dispersion Measurement ────────────────────────────────────────────────

describe('measureDispersion', () => {
  it('RICH: returns high accuracy with type zero', () => {
    const d = measureDispersion(RICH)
    expect(d.accuracy).toBe(97)
    expect(d.type).toBe('zero')
    expect(d.hasPreciseDispersion).toBe(true)
    expect(d.hasProperSeparation).toBe(true)
    expect(d.hasNoOverlap).toBe(false)
    expect(d.hasNoBlending).toBe(true)
    expect(d.hasNoBlurring).toBe(true)
    expect(d.hasNoMixing).toBe(true)
    expect(d.hasCleanSeparation).toBe(false)
    expect(d.overlapCount).toBe(3)
    expect(d.blurringCount).toBe(0)
  })

  it('EMPTY: returns low accuracy', () => {
    const d = measureDispersion(EMPTY)
    expect(d.accuracy).toBe(37)
    expect(d.hasPreciseDispersion).toBe(false)
    expect(d.hasNoOverlap).toBe(true)
    expect(d.overlapCount).toBe(0)
    expect(d.blurringCount).toBe(0)
  })

  it('MEDIUM: returns mid accuracy', () => {
    const d = measureDispersion(MEDIUM)
    expect(d.accuracy).toBe(62)
    expect(d.hasPreciseDispersion).toBe(false)
    expect(d.hasProperSeparation).toBe(false)
    expect(d.overlapCount).toBe(0)
    expect(d.blurringCount).toBe(0)
  })
})

// ─── Purity Measurement ────────────────────────────────────────────────────

describe('measurePurity', () => {
  it('RICH: returns high purity with state filtered', () => {
    const p = measurePurity(RICH)
    expect(p.level).toBe(92)
    expect(p.state).toBe('filtered')
    expect(p.hasHighPurity).toBe(true)
    expect(p.hasNoContamination).toBe(true)
    expect(p.hasNoNoise).toBe(true)
    expect(p.hasCleanSignal).toBe(false)
    expect(p.hasProperIsolation).toBe(false)
    expect(p.hasSignalToNoise).toBe(false)
    expect(p.hasNoClutter).toBe(false)
    expect(p.contaminationCount).toBe(0)
    expect(p.clutterCount).toBe(1)
  })

  it('EMPTY: returns low purity', () => {
    const p = measurePurity(EMPTY)
    expect(p.level).toBe(46)
    expect(p.hasHighPurity).toBe(false)
    expect(p.hasNoContamination).toBe(true)
    expect(p.hasNoNoise).toBe(true)
    expect(p.contaminationCount).toBe(0)
    expect(p.clutterCount).toBe(0)
  })

  it('MEDIUM: returns mid purity', () => {
    const p = measurePurity(MEDIUM)
    expect(p.level).toBe(51)
    expect(p.hasHighPurity).toBe(false)
    expect(p.hasNoContamination).toBe(false)
    expect(p.contaminationCount).toBe(1)
    expect(p.clutterCount).toBe(0)
  })
})

// ─── Luminous Measurement ──────────────────────────────────────────────────

describe('measureLuminous', () => {
  it('RICH: returns high intensity with source led', () => {
    const l = measureLuminous(RICH)
    expect(l.intensity).toBe(95)
    expect(l.source).toBe('led')
    expect(l.hasHighIntensity).toBe(true)
    expect(l.hasProperBrightness).toBe(true)
    expect(l.hasNoFlicker).toBe(true)
    expect(l.hasStableOutput).toBe(true)
    expect(l.hasProperIllumination).toBe(true)
    expect(l.hasNoGlare).toBe(false)
    expect(l.hasProperWattage).toBe(true)
    expect(l.flickerCount).toBe(0)
    expect(l.glareCount).toBe(1)
  })

  it('EMPTY: returns low intensity', () => {
    const l = measureLuminous(EMPTY)
    expect(l.intensity).toBe(30)
    expect(l.hasHighIntensity).toBe(false)
    expect(l.hasNoFlicker).toBe(true)
    expect(l.flickerCount).toBe(0)
    expect(l.glareCount).toBe(0)
  })

  it('MEDIUM: returns mid intensity', () => {
    const l = measureLuminous(MEDIUM)
    expect(l.intensity).toBe(50)
    expect(l.hasHighIntensity).toBe(false)
    expect(l.flickerCount).toBe(1)
    expect(l.glareCount).toBe(0)
  })
})

// ─── Beam Analysis ─────────────────────────────────────────────────────────

describe('analyzeLightBeam', () => {
  it('RICH: returns diamond-prism beam', () => {
    const beam = analyzeLightBeam(RICH, 'src/app.ts')
    expect(beam.file).toBe('src/app.ts')
    expect(beam.lightTransparency).toBe(100)
    expect(beam.spectrumDecomposition).toBe(100)
    expect(beam.refractionIndex).toBe(97)
    expect(beam.dispersionAccuracy).toBe(97)
    expect(beam.chromaticPurity).toBe(92)
    expect(beam.luminousIntensity).toBe(95)
    expect(beam.qualityScore).toBe(97)
    expect(beam.condition).toBe('diamond-prism')
  })

  it('EMPTY: returns plastic-prism beam', () => {
    const beam = analyzeLightBeam(EMPTY, 'empty.ts')
    expect(beam.lightTransparency).toBe(38)
    expect(beam.spectrumDecomposition).toBe(32)
    expect(beam.refractionIndex).toBe(35)
    expect(beam.dispersionAccuracy).toBe(37)
    expect(beam.chromaticPurity).toBe(46)
    expect(beam.luminousIntensity).toBe(30)
    expect(beam.qualityScore).toBe(36)
    expect(beam.condition).toBe('plastic-prism')
  })

  it('MEDIUM: returns crystal-prism beam', () => {
    const beam = analyzeLightBeam(MEDIUM, 'src/med.ts')
    expect(beam.lightTransparency).toBe(53)
    expect(beam.spectrumDecomposition).toBe(47)
    expect(beam.refractionIndex).toBe(55)
    expect(beam.dispersionAccuracy).toBe(62)
    expect(beam.chromaticPurity).toBe(51)
    expect(beam.luminousIntensity).toBe(50)
    expect(beam.qualityScore).toBe(53)
    expect(beam.condition).toBe('crystal-prism')
  })
})

// ─── Condition Classification ───────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies diamond-prism at 80+', () => {
    const beam = analyzeLightBeam(RICH, 'test.ts')
    expect(classifyCondition(beam)).toBe('diamond-prism')
  })

  it('does not classify rubble for empty with score >= 20', () => {
    const beam = analyzeLightBeam(EMPTY, 'test.ts')
    expect(beam.qualityScore).toBeGreaterThanOrEqual(20)
    expect(beam.condition).not.toBe('ice-cube')
  })
})

// ─── Spectrum Classification ────────────────────────────────────────────────

describe('classifySpectrumType', () => {
  it('returns darkness for empty beams', () => {
    expect(classifySpectrumType([])).toBe('darkness')
  })

  it('returns rainbow-display for high quality beams', () => {
    const beams = [analyzeLightBeam(RICH, 'a.ts')]
    expect(classifySpectrumType(beams)).toBe('rainbow-display')
  })
})

describe('classifySpectrumCondition', () => {
  it('returns laboratory for avgQuality >= 80', () => {
    expect(classifySpectrumCondition(85)).toBe('laboratory')
  })
  it('returns observatory for avgQuality >= 65', () => {
    expect(classifySpectrumCondition(70)).toBe('observatory')
  })
  it('returns studio for avgQuality >= 50', () => {
    expect(classifySpectrumCondition(55)).toBe('studio')
  })
  it('returns classroom for avgQuality >= 35', () => {
    expect(classifySpectrumCondition(40)).toBe('classroom')
  })
  it('returns basement for avgQuality >= 20', () => {
    expect(classifySpectrumCondition(25)).toBe('basement')
  })
  it('returns cave for avgQuality < 20', () => {
    expect(classifySpectrumCondition(10)).toBe('cave')
  })
})

// ─── Optician Grade ─────────────────────────────────────────────────────────

describe('classifyOpticianGrade', () => {
  it('returns master-optician for >= 80', () => {
    expect(classifyOpticianGrade(85)).toBe('master-optician')
  })
  it('returns optical-engineer for >= 65', () => {
    expect(classifyOpticianGrade(70)).toBe('optical-engineer')
  })
  it('returns optician for >= 50', () => {
    expect(classifyOpticianGrade(55)).toBe('optician')
  })
  it('returns glassblower for >= 35', () => {
    expect(classifyOpticianGrade(40)).toBe('glassblower')
  })
  it('returns lens-grinder for >= 20', () => {
    expect(classifyOpticianGrade(25)).toBe('lens-grinder')
  })
  it('returns cave-dweller for < 20', () => {
    expect(classifyOpticianGrade(10)).toBe('cave-dweller')
  })
})

// ─── Spectrum Analysis ──────────────────────────────────────────────────────

describe('analyzeLightSpectrum', () => {
  it('returns darkness for empty input', () => {
    const spec = analyzeLightSpectrum([], 'empty-dir')
    expect(spec.directory).toBe('empty-dir')
    expect(spec.spectrumType).toBe('darkness')
    expect(spec.condition).toBe('cave')
    expect(spec.beams).toHaveLength(0)
  })

  it('returns rainbow-display for rich beams', () => {
    const beams = [analyzeLightBeam(RICH, 'src/a.ts')]
    const spec = analyzeLightSpectrum(beams, 'src')
    expect(spec.spectrumType).toBe('rainbow-display')
    expect(spec.condition).toBe('laboratory')
    expect(spec.diamondCount).toBe(1)
    expect(spec.transparentCount).toBe(1)
  })
})

// ─── Build Result ───────────────────────────────────────────────────────────

describe('buildPrismLightResult', () => {
  it('RICH single file: returns correct full result', () => {
    const result = buildPrismLightResult(['src/app.ts'], [RICH])
    expect(result.beams).toHaveLength(1)
    expect(result.spectrums).toHaveLength(1)
    expect(result.laboratory.overallBrilliance).toBe(97)
    expect(result.laboratory.isBrilliant).toBe(true)
    expect(result.laboratory.avgTransparency).toBe(100)
    expect(result.laboratory.avgDispersion).toBe(97)
    expect(result.laboratory.avgIntensity).toBe(95)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalSpectrums).toBe(1)
    expect(result.stats.avgLightTransparency).toBe(100)
    expect(result.stats.avgSpectrumDecomposition).toBe(100)
    expect(result.stats.avgRefractionIndex).toBe(97)
    expect(result.stats.avgDispersionAccuracy).toBe(97)
    expect(result.stats.avgChromaticPurity).toBe(92)
    expect(result.stats.avgLuminousIntensity).toBe(95)
    expect(result.stats.diamondPrismCount).toBe(1)
    expect(result.stats.glassPrismCount).toBe(0)
    expect(result.stats.crystalPrismCount).toBe(0)
    expect(result.stats.plasticPrismCount).toBe(0)
    expect(result.stats.crackedGlassCount).toBe(0)
    expect(result.stats.iceCubeCount).toBe(0)
    expect(result.stats.hasHighTransparencyCount).toBe(1)
    expect(result.stats.hasRichSpectrumCount).toBe(1)
    expect(result.stats.hasProperRefractionCount).toBe(1)
    expect(result.stats.hasPreciseDispersionCount).toBe(1)
    expect(result.stats.hasHighPurityCount).toBe(1)
    expect(result.stats.hasHighIntensityCount).toBe(1)
    expect(result.stats.opticianGrade).toBe('master-optician')
    expect(result.stats.bestBeam).toBe('src/app.ts')
    expect(result.stats.mostTransparent).toBe('src/app.ts')
    expect(result.stats.richestSpectrum).toBe('src/app.ts')
    expect(result.stats.bestRefraction).toBe('src/app.ts')
    expect(result.stats.mostPrecise).toBe('src/app.ts')
    expect(result.stats.brightest).toBe('src/app.ts')
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('EMPTY single file: returns correct result', () => {
    const result = buildPrismLightResult(['empty.ts'], [EMPTY])
    expect(result.laboratory.overallBrilliance).toBe(36)
    expect(result.laboratory.isBrilliant).toBe(false)
    expect(result.laboratory.avgTransparency).toBe(38)
    expect(result.laboratory.avgDispersion).toBe(37)
    expect(result.laboratory.avgIntensity).toBe(30)
    expect(result.stats.avgLightTransparency).toBe(38)
    expect(result.stats.avgSpectrumDecomposition).toBe(32)
    expect(result.stats.avgRefractionIndex).toBe(35)
    expect(result.stats.avgDispersionAccuracy).toBe(37)
    expect(result.stats.avgChromaticPurity).toBe(46)
    expect(result.stats.avgLuminousIntensity).toBe(30)
    expect(result.stats.plasticPrismCount).toBe(1)
    expect(result.stats.opticianGrade).toBe('glassblower')
    expect(result.recommendations.length).toBeGreaterThanOrEqual(5)
  })

  it('MEDIUM single file: returns correct result', () => {
    const result = buildPrismLightResult(['src/med.ts'], [MEDIUM])
    expect(result.laboratory.overallBrilliance).toBe(53)
    expect(result.laboratory.isBrilliant).toBe(false)
    expect(result.stats.avgLightTransparency).toBe(53)
    expect(result.stats.avgSpectrumDecomposition).toBe(47)
    expect(result.stats.avgRefractionIndex).toBe(55)
    expect(result.stats.avgDispersionAccuracy).toBe(62)
    expect(result.stats.avgChromaticPurity).toBe(51)
    expect(result.stats.avgLuminousIntensity).toBe(50)
    expect(result.stats.crystalPrismCount).toBe(1)
    expect(result.stats.opticianGrade).toBe('optician')
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2)
  })

  it('empty input: returns zeroed result', () => {
    const result = buildPrismLightResult([], [])
    expect(result.beams).toHaveLength(0)
    expect(result.spectrums).toHaveLength(0)
    expect(result.laboratory.overallBrilliance).toBe(0)
    expect(result.laboratory.isBrilliant).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.opticianGrade).toBe('cave-dweller')
    expect(result.stats.bestBeam).toBe('')
  })

  it('multi-file: groups by directory correctly', () => {
    const result = buildPrismLightResult(
      ['src/app.ts', 'src/utils.ts', 'src/med.ts'],
      [RICH, RICH, MEDIUM],
    )
    expect(result.beams).toHaveLength(3)
    expect(result.spectrums).toHaveLength(1)
    expect(result.spectrums[0].spectrumType).toBe('rainbow-display')
    expect(result.spectrums[0].condition).toBe('laboratory')
    expect(result.laboratory.overallBrilliance).toBe(82)
    expect(result.laboratory.isBrilliant).toBe(true)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.diamondPrismCount).toBe(2)
    expect(result.stats.crystalPrismCount).toBe(1)
    expect(result.stats.hasHighTransparencyCount).toBe(2)
    expect(result.stats.hasRichSpectrumCount).toBe(2)
    expect(result.stats.hasProperRefractionCount).toBe(2)
    expect(result.stats.hasPreciseDispersionCount).toBe(2)
    expect(result.stats.hasHighPurityCount).toBe(2)
    expect(result.stats.hasHighIntensityCount).toBe(2)
    expect(result.stats.opticianGrade).toBe('master-optician')
    expect(result.stats.avgLightTransparency).toBe(84)
    expect(result.stats.avgSpectrumDecomposition).toBe(82)
    expect(result.stats.avgRefractionIndex).toBe(83)
    expect(result.stats.avgDispersionAccuracy).toBe(85)
    expect(result.stats.avgChromaticPurity).toBe(78)
    expect(result.stats.avgLuminousIntensity).toBe(80)
  })
})

// ─── Recommendations ────────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece for good code', () => {
    const result = buildPrismLightResult(['test.ts'], [RICH])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('returns improvement recs for empty code', () => {
    const result = buildPrismLightResult(['test.ts'], [EMPTY])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(5)
    const hasTransparency = result.recommendations.some((r) => r.includes('transparency'))
    expect(hasTransparency).toBe(true)
  })

  it('returns multiple recs for medium code', () => {
    const result = buildPrismLightResult(['test.ts'], [MEDIUM])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2)
    const hasSpectrum = result.recommendations.some((r) => r.includes('spectrum'))
    expect(hasSpectrum).toBe(true)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for all score ranges', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(65)).toBe('string')
    expect(typeof scoreColor(45)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns colored strings for all conditions', () => {
    const conditions = ['diamond-prism', 'glass-prism', 'crystal-prism', 'plastic-prism', 'cracked-glass', 'ice-cube']
    for (const c of conditions) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })
  it('returns unknown unchanged', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

describe('gradeColor', () => {
  it('returns colored strings for all grades', () => {
    const grades = ['master-optician', 'optical-engineer', 'optician', 'glassblower', 'lens-grinder', 'cave-dweller']
    for (const g of grades) {
      expect(typeof gradeColor(g)).toBe('string')
    }
  })
  it('returns unknown unchanged', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })
})

describe('spectrumTypeColor', () => {
  it('returns colored strings for all types', () => {
    const types = ['rainbow-display', 'spectrum-analysis', 'light-show', 'dim-glow', 'shadow-play', 'darkness']
    for (const t of types) {
      expect(typeof spectrumTypeColor(t)).toBe('string')
    }
  })
  it('returns unknown unchanged', () => {
    expect(spectrumTypeColor('unknown')).toBe('unknown')
  })
})

describe('formatPrismLightJson', () => {
  it('returns valid JSON string', () => {
    const result = buildPrismLightResult(['test.ts'], [RICH])
    const json = formatPrismLightJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.beams).toHaveLength(1)
    expect(parsed.laboratory.overallBrilliance).toBe(97)
  })
})

describe('formatPrismLightTable', () => {
  it('returns formatted table string', () => {
    const result = buildPrismLightResult(['test.ts'], [RICH])
    const table = formatPrismLightTable(result, false)
    expect(table).toContain('Prism Light Analysis')
    expect(table).toContain('Statistics')
    expect(table).toContain('Grades & Highlights')
  })

  it('includes per-beam breakdown when verbose', () => {
    const result = buildPrismLightResult(['test.ts'], [RICH])
    const table = formatPrismLightTable(result, true)
    expect(table).toContain('Per-Beam Breakdown')
    expect(table).toContain('test.ts')
  })

  it('includes recommendations', () => {
    const result = buildPrismLightResult(['test.ts'], [EMPTY])
    const table = formatPrismLightTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('includes spectrums section when present', () => {
    const result = buildPrismLightResult(['src/a.ts', 'src/b.ts'], [RICH, MEDIUM])
    const table = formatPrismLightTable(result, false)
    expect(table).toContain('Spectrums')
    expect(table).toContain('src')
  })

  it('shows laboratory overview', () => {
    const result = buildPrismLightResult(['test.ts'], [RICH])
    const table = formatPrismLightTable(result, false)
    expect(table).toContain('Laboratory Overview')
    expect(table).toContain('Overall Brilliance')
    expect(table).toContain('Is Brilliant')
  })

  it('handles empty result table', () => {
    const result = buildPrismLightResult([], [])
    const table = formatPrismLightTable(result, false)
    expect(table).toContain('Prism Light Analysis')
    expect(table).toContain('Statistics')
  })

  it('shows optician grade in table', () => {
    const result = buildPrismLightResult(['test.ts'], [RICH])
    const table = formatPrismLightTable(result, false)
    expect(table).toContain('master-optician')
  })

  it('shows verbose beam measures', () => {
    const result = buildPrismLightResult(['test.ts'], [MEDIUM])
    const table = formatPrismLightTable(result, true)
    expect(table).toContain('opaque')
    expect(table).toContain('monochromatic')
    expect(table).toContain('total-internal')
    expect(table).toContain('chaotic')
    expect(table).toContain('contaminated')
    expect(table).toContain('ember')
  })

  it('shows N/A for empty highlights', () => {
    const result = buildPrismLightResult([], [])
    const table = formatPrismLightTable(result, false)
    expect(table).toContain('N/A')
  })

  it('includes condition counts in table', () => {
    const result = buildPrismLightResult(['test.ts'], [EMPTY])
    const table = formatPrismLightTable(result, false)
    expect(table).toContain('Plastic Prism')
    expect(table).toContain('1')
  })
})
