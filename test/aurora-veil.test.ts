import { describe, expect, it } from 'vitest'

import {
  analyzeAuroraCurtain,
  analyzeAuroraRegion,
  buildAuroraVeilResult,
  classifyAstronomerGrade,
  classifyCondition,
  classifyRegionCondition,
  classifyRegionType,
  generateRecommendations,
  measureGrandeur,
  measureIonosphere,
  measureLuminosity,
  measureMagnetic,
  measureParticle,
  measureSpectrum,
} from '../src/commands/aurora-veil-helpers.js'

import {
  conditionColor,
  formatAuroraVeilJson,
  formatAuroraVeilTable,
  gradeColor,
  regionTypeColor,
  scoreColor,
} from '../src/commands/aurora-veil-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface AuroraConfig {
  readonly id: string
  name: string
  intensity: number
  colors: string[]
  isActive: boolean
}

export class AuroraCalculator<T extends AuroraConfig> {
  private configs: T[] = []
  protected maxIntensity: number = 100

  constructor(initialConfigs?: T[]) {
    if (initialConfigs) {
      this.configs = initialConfigs
    }
  }

  async calculateIntensity(config: T): Promise<number> {
    try {
      const base = config.intensity
      const multiplier = config.isActive ? 2.0 : 0.5
      const result = Math.min(this.maxIntensity, base * multiplier)
      return Math.round(result)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      }
      return 0
    }
  }

  static createDefault(): AuroraCalculator<AuroraConfig> {
    return new AuroraCalculator<AuroraConfig>()
  }
}

/** Calculates aurora brightness */
export function calculateBrightness(colors: string[]): number {
  const green = colors.filter(c => c.includes('green'))
  return green.length * 10
}

export type AuroraPhase = 'dawn' | 'dusk' | 'night' | 'peak'
export enum AuroraType { BAND = 'band', CURTAIN = 'curtain', CORONA = 'corona' }
`

const EMPTY = ''

const MEDIUM = `export class Calculator {
  private value: number = 0

  constructor(initial: number) {
    this.value = initial
  }

  add(x: number): number {
    return this.value + x
  }

  subtract(x: number): number {
    return this.value - x
  }
}

export interface Config {
  name: string
  max: number
}

/** Helper function */
export function process(input: string): string {
  return input.toUpperCase()
}
`

// ─── measureLuminosity ─────────────────────────────────────────────────────

describe('measureLuminosity', () => {
  it('returns level 90 for RICH fixture', () => {
    const result = measureLuminosity(RICH)
    expect(result.level).toBe(90)
  })

  it('returns brightness blinding for RICH fixture', () => {
    const result = measureLuminosity(RICH)
    expect(result.brightness).toBe('blinding')
  })

  it('returns level 37 for EMPTY fixture', () => {
    const result = measureLuminosity(EMPTY)
    expect(result.level).toBe(37)
  })

  it('returns brightness faint for EMPTY fixture', () => {
    const result = measureLuminosity(EMPTY)
    expect(result.brightness).toBe('faint')
  })

  it('returns level 90 for MEDIUM fixture', () => {
    const result = measureLuminosity(MEDIUM)
    expect(result.level).toBe(90)
  })

  it('hasHighLuminosity true for RICH', () => {
    expect(measureLuminosity(RICH).hasHighLuminosity).toBe(true)
  })

  it('hasHighLuminosity false for EMPTY', () => {
    expect(measureLuminosity(EMPTY).hasHighLuminosity).toBe(false)
  })

  it('hasGreenEmission true for RICH', () => {
    expect(measureLuminosity(RICH).hasGreenEmission).toBe(true)
  })

  it('hasGreenEmission false for EMPTY', () => {
    expect(measureLuminosity(EMPTY).hasGreenEmission).toBe(false)
  })

  it('hasRedEmission true for RICH', () => {
    expect(measureLuminosity(RICH).hasRedEmission).toBe(true)
  })

  it('hasBlueEmission true for RICH', () => {
    expect(measureLuminosity(RICH).hasBlueEmission).toBe(true)
  })

  it('hasVioletEmission true for RICH', () => {
    expect(measureLuminosity(RICH).hasVioletEmission).toBe(true)
  })

  it('hasNoLightPollution false for RICH (console.error)', () => {
    expect(measureLuminosity(RICH).hasNoLightPollution).toBe(false)
  })

  it('hasNoLightPollution true for EMPTY', () => {
    expect(measureLuminosity(EMPTY).hasNoLightPollution).toBe(true)
  })

  it('hasProperAltitude true for RICH', () => {
    expect(measureLuminosity(RICH).hasProperAltitude).toBe(true)
  })

  it('hasCurtainForm false for RICH (no imports)', () => {
    expect(measureLuminosity(RICH).hasCurtainForm).toBe(false)
  })

  it('hasNoBreakup false for RICH (deep nesting)', () => {
    expect(measureLuminosity(RICH).hasNoBreakup).toBe(false)
  })

  it('hasNoBreakup true for EMPTY', () => {
    expect(measureLuminosity(EMPTY).hasNoBreakup).toBe(true)
  })

  it('hasPersistent true for RICH', () => {
    expect(measureLuminosity(RICH).hasPersistent).toBe(true)
  })

  it('lightPollutionCount is 1 for RICH', () => {
    expect(measureLuminosity(RICH).lightPollutionCount).toBe(1)
  })

  it('breakupCount is 1 for RICH', () => {
    expect(measureLuminosity(RICH).breakupCount).toBe(1)
  })

  it('MEDIUM hasNoLightPollution true', () => {
    expect(measureLuminosity(MEDIUM).hasNoLightPollution).toBe(true)
  })

  it('MEDIUM hasCurtainForm false (no imports)', () => {
    expect(measureLuminosity(MEDIUM).hasCurtainForm).toBe(false)
  })
})

// ─── measureSpectrum ───────────────────────────────────────────────────────

describe('measureSpectrum', () => {
  it('returns diversity 91 for RICH', () => {
    expect(measureSpectrum(RICH).diversity).toBe(91)
  })

  it('returns diversity 23 for EMPTY', () => {
    expect(measureSpectrum(EMPTY).diversity).toBe(23)
  })

  it('returns diversity 73 for MEDIUM', () => {
    expect(measureSpectrum(MEDIUM).diversity).toBe(73)
  })

  it('palette is tricolor for RICH', () => {
    expect(measureSpectrum(RICH).palette).toBe('tricolor')
  })

  it('palette is invisible for EMPTY', () => {
    expect(measureSpectrum(EMPTY).palette).toBe('invisible')
  })

  it('palette is monochrome for MEDIUM', () => {
    expect(measureSpectrum(MEDIUM).palette).toBe('monochrome')
  })

  it('hasRichSpectrum true for RICH', () => {
    expect(measureSpectrum(RICH).hasRichSpectrum).toBe(true)
  })

  it('hasRichSpectrum false for EMPTY', () => {
    expect(measureSpectrum(EMPTY).hasRichSpectrum).toBe(false)
  })

  it('hasRichSpectrum false for MEDIUM', () => {
    expect(measureSpectrum(MEDIUM).hasRichSpectrum).toBe(false)
  })

  it('hasOxygenGreen true for RICH', () => {
    expect(measureSpectrum(RICH).hasOxygenGreen).toBe(true)
  })

  it('hasOxygenRed true for RICH', () => {
    expect(measureSpectrum(RICH).hasOxygenRed).toBe(true)
  })

  it('hasNitrogenBlue true for RICH', () => {
    expect(measureSpectrum(RICH).hasNitrogenBlue).toBe(true)
  })

  it('hasNitrogenViolet true for RICH', () => {
    expect(measureSpectrum(RICH).hasNitrogenViolet).toBe(true)
  })

  it('hasNoSpectralGap false for RICH (console)', () => {
    expect(measureSpectrum(RICH).hasNoSpectralGap).toBe(false)
  })

  it('hasProperWavelength false for RICH (no imports)', () => {
    expect(measureSpectrum(RICH).hasProperWavelength).toBe(false)
  })

  it('hasContinuousEmission true for RICH', () => {
    expect(measureSpectrum(RICH).hasContinuousEmission).toBe(true)
  })

  it('hasNoAbsorption true for RICH', () => {
    expect(measureSpectrum(RICH).hasNoAbsorption).toBe(true)
  })

  it('hasEmissionPeaks true for RICH', () => {
    expect(measureSpectrum(RICH).hasEmissionPeaks).toBe(true)
  })

  it('gapCount is 1 for RICH', () => {
    expect(measureSpectrum(RICH).gapCount).toBe(1)
  })

  it('MEDIUM hasOxygenGreen true', () => {
    expect(measureSpectrum(MEDIUM).hasOxygenGreen).toBe(true)
  })

  it('MEDIUM hasNoSpectralGap true', () => {
    expect(measureSpectrum(MEDIUM).hasNoSpectralGap).toBe(true)
  })
})

// ─── measureMagnetic ───────────────────────────────────────────────────────

describe('measureMagnetic', () => {
  it('returns deflection 90 for RICH', () => {
    expect(measureMagnetic(RICH).deflection).toBe(90)
  })

  it('returns deflection 30 for EMPTY', () => {
    expect(measureMagnetic(EMPTY).deflection).toBe(30)
  })

  it('returns deflection 78 for MEDIUM', () => {
    expect(measureMagnetic(MEDIUM).deflection).toBe(78)
  })

  it('field is quadrupole for RICH', () => {
    expect(measureMagnetic(RICH).field).toBe('quadrupole')
  })

  it('field is absent for EMPTY', () => {
    expect(measureMagnetic(EMPTY).field).toBe('absent')
  })

  it('field is dipole for MEDIUM', () => {
    expect(measureMagnetic(MEDIUM).field).toBe('dipole')
  })

  it('hasProperStructure true for RICH', () => {
    expect(measureMagnetic(RICH).hasProperStructure).toBe(true)
  })

  it('hasFieldLines true for RICH', () => {
    expect(measureMagnetic(RICH).hasFieldLines).toBe(true)
  })

  it('hasMagnetopause false for RICH (no imports)', () => {
    expect(measureMagnetic(RICH).hasMagnetopause).toBe(false)
  })

  it('hasNoReconnection false for RICH', () => {
    expect(measureMagnetic(RICH).hasNoReconnection).toBe(false)
  })

  it('hasVanAllenBelt true for RICH', () => {
    expect(measureMagnetic(RICH).hasVanAllenBelt).toBe(true)
  })

  it('hasAuroralOval true for RICH', () => {
    expect(measureMagnetic(RICH).hasAuroralOval).toBe(true)
  })

  it('hasNoMagneticStorm false for RICH (console)', () => {
    expect(measureMagnetic(RICH).hasNoMagneticStorm).toBe(false)
  })

  it('hasProperFieldStrength true for RICH', () => {
    expect(measureMagnetic(RICH).hasProperFieldStrength).toBe(true)
  })

  it('hasNoFieldCollapse true for RICH', () => {
    expect(measureMagnetic(RICH).hasNoFieldCollapse).toBe(true)
  })

  it('reconnectionCount is 1 for RICH', () => {
    expect(measureMagnetic(RICH).reconnectionCount).toBe(1)
  })

  it('stormCount is 1 for RICH', () => {
    expect(measureMagnetic(RICH).stormCount).toBe(1)
  })

  it('MEDIUM hasNoMagneticStorm true', () => {
    expect(measureMagnetic(MEDIUM).hasNoMagneticStorm).toBe(true)
  })

  it('EMPTY hasProperStructure false', () => {
    expect(measureMagnetic(EMPTY).hasProperStructure).toBe(false)
  })
})

// ─── measureIonosphere ─────────────────────────────────────────────────────

describe('measureIonosphere', () => {
  it('returns charge 96 for RICH', () => {
    expect(measureIonosphere(RICH).charge).toBe(96)
  })

  it('returns charge 30 for EMPTY', () => {
    expect(measureIonosphere(EMPTY).charge).toBe(30)
  })

  it('returns charge 77 for MEDIUM', () => {
    expect(measureIonosphere(MEDIUM).charge).toBe(77)
  })

  it('layer is d-layer for RICH (blackout from console+deepNested)', () => {
    expect(measureIonosphere(RICH).layer).toBe('d-layer')
  })

  it('layer is dead-zone for EMPTY', () => {
    expect(measureIonosphere(EMPTY).layer).toBe('dead-zone')
  })

  it('layer is f-layer for MEDIUM', () => {
    expect(measureIonosphere(MEDIUM).layer).toBe('f-layer')
  })

  it('hasHighEnergy true for RICH', () => {
    expect(measureIonosphere(RICH).hasHighEnergy).toBe(true)
  })

  it('hasProperIonization true for RICH', () => {
    expect(measureIonosphere(RICH).hasProperIonization).toBe(true)
  })

  it('hasNoAbsorption false for RICH', () => {
    expect(measureIonosphere(RICH).hasNoAbsorption).toBe(false)
  })

  it('hasNoScintillation true for RICH', () => {
    expect(measureIonosphere(RICH).hasNoScintillation).toBe(true)
  })

  it('hasProperConductivity true for RICH', () => {
    expect(measureIonosphere(RICH).hasProperConductivity).toBe(true)
  })

  it('hasPlasmaBubbles true for RICH', () => {
    expect(measureIonosphere(RICH).hasPlasmaBubbles).toBe(true)
  })

  it('hasTravelingWave false for RICH (no imports)', () => {
    expect(measureIonosphere(RICH).hasTravelingWave).toBe(false)
  })

  it('hasProperReflection true for RICH', () => {
    expect(measureIonosphere(RICH).hasProperReflection).toBe(true)
  })

  it('blackoutCount is 2 for RICH', () => {
    expect(measureIonosphere(RICH).blackoutCount).toBe(2)
  })

  it('scintillationCount is 0 for RICH', () => {
    expect(measureIonosphere(RICH).scintillationCount).toBe(0)
  })

  it('MEDIUM hasNoAbsorption true', () => {
    expect(measureIonosphere(MEDIUM).hasNoAbsorption).toBe(true)
  })
})

// ─── measureParticle ───────────────────────────────────────────────────────

describe('measureParticle', () => {
  it('returns collision 91 for RICH', () => {
    expect(measureParticle(RICH).collision).toBe(91)
  })

  it('returns collision 30 for EMPTY', () => {
    expect(measureParticle(EMPTY).collision).toBe(30)
  })

  it('returns collision 77 for MEDIUM', () => {
    expect(measureParticle(MEDIUM).collision).toBe(77)
  })

  it('source is magnetosphere for RICH', () => {
    expect(measureParticle(RICH).source).toBe('magnetosphere')
  })

  it('source is none for EMPTY', () => {
    expect(measureParticle(EMPTY).source).toBe('none')
  })

  it('source is magnetosphere for MEDIUM', () => {
    expect(measureParticle(MEDIUM).source).toBe('magnetosphere')
  })

  it('hasHighInteraction true for RICH', () => {
    expect(measureParticle(RICH).hasHighInteraction).toBe(true)
  })

  it('hasProperPrecipitation true for RICH', () => {
    expect(measureParticle(RICH).hasProperPrecipitation).toBe(true)
  })

  it('hasElectronCascade true for RICH', () => {
    expect(measureParticle(RICH).hasElectronCascade).toBe(true)
  })

  it('hasNoOverIonization false for RICH', () => {
    expect(measureParticle(RICH).hasNoOverIonization).toBe(false)
  })

  it('hasProperEnergy true for RICH', () => {
    expect(measureParticle(RICH).hasProperEnergy).toBe(true)
  })

  it('hasBremsstrahlung false for RICH (no imports)', () => {
    expect(measureParticle(RICH).hasBremsstrahlung).toBe(false)
  })

  it('hasNoParticleLoss false for RICH (console)', () => {
    expect(measureParticle(RICH).hasNoParticleLoss).toBe(false)
  })

  it('hasProperScattering true for RICH', () => {
    expect(measureParticle(RICH).hasProperScattering).toBe(true)
  })

  it('hasNoBeamInstability false for RICH (console)', () => {
    expect(measureParticle(RICH).hasNoBeamInstability).toBe(false)
  })

  it('hasMirroring false for RICH (no imports)', () => {
    expect(measureParticle(RICH).hasMirroring).toBe(false)
  })

  it('overIonizationCount is 1 for RICH', () => {
    expect(measureParticle(RICH).overIonizationCount).toBe(1)
  })

  it('beamInstabilityCount is 1 for RICH', () => {
    expect(measureParticle(RICH).beamInstabilityCount).toBe(1)
  })

  it('EMPTY hasNoOverIonization true', () => {
    expect(measureParticle(EMPTY).hasNoOverIonization).toBe(true)
  })

  it('MEDIUM hasNoOverIonization true', () => {
    expect(measureParticle(MEDIUM).hasNoOverIonization).toBe(true)
  })
})

// ─── measureGrandeur ───────────────────────────────────────────────────────

describe('measureGrandeur', () => {
  it('returns score 98 for RICH', () => {
    expect(measureGrandeur(RICH).score).toBe(98)
  })

  it('returns score 26 for EMPTY', () => {
    expect(measureGrandeur(EMPTY).score).toBe(26)
  })

  it('returns score 76 for MEDIUM', () => {
    expect(measureGrandeur(MEDIUM).score).toBe(76)
  })

  it('display is curtain for RICH', () => {
    expect(measureGrandeur(RICH).display).toBe('curtain')
  })

  it('display is glow for EMPTY', () => {
    expect(measureGrandeur(EMPTY).display).toBe('glow')
  })

  it('display is band for MEDIUM', () => {
    expect(measureGrandeur(MEDIUM).display).toBe('band')
  })

  it('isGrand true for RICH', () => {
    expect(measureGrandeur(RICH).isGrand).toBe(true)
  })

  it('isGrand false for EMPTY', () => {
    expect(measureGrandeur(EMPTY).isGrand).toBe(false)
  })

  it('isGrand false for MEDIUM', () => {
    expect(measureGrandeur(MEDIUM).isGrand).toBe(false)
  })

  it('hasSubstorm true for RICH', () => {
    expect(measureGrandeur(RICH).hasSubstorm).toBe(true)
  })

  it('hasPiPulsations true for RICH', () => {
    expect(measureGrandeur(RICH).hasPiPulsations).toBe(true)
  })

  it('hasNoFadeout true for RICH', () => {
    expect(measureGrandeur(RICH).hasNoFadeout).toBe(true)
  })

  it('hasCrown true for RICH', () => {
    expect(measureGrandeur(RICH).hasCrown).toBe(true)
  })

  it('hasRayedStructure true for RICH', () => {
    expect(measureGrandeur(RICH).hasRayedStructure).toBe(true)
  })

  it('hasNoDisruption false for RICH (console)', () => {
    expect(measureGrandeur(RICH).hasNoDisruption).toBe(false)
  })

  it('hasProperDuration true for RICH', () => {
    expect(measureGrandeur(RICH).hasProperDuration).toBe(true)
  })

  it('hasNoOscillation false for RICH (deepNested)', () => {
    expect(measureGrandeur(RICH).hasNoOscillation).toBe(false)
  })

  it('hasZenith false for RICH (disruption)', () => {
    expect(measureGrandeur(RICH).hasZenith).toBe(false)
  })

  it('fadeoutCount is 0 for RICH', () => {
    expect(measureGrandeur(RICH).fadeoutCount).toBe(0)
  })

  it('disruptionCount is 2 for RICH', () => {
    expect(measureGrandeur(RICH).disruptionCount).toBe(2)
  })

  it('MEDIUM hasCrown false', () => {
    expect(measureGrandeur(MEDIUM).hasCrown).toBe(false)
  })

  it('MEDIUM hasNoDisruption true', () => {
    expect(measureGrandeur(MEDIUM).hasNoDisruption).toBe(true)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns solar-maximum for qualityScore >= 80', () => {
    const curtain = { qualityScore: 93 } as any
    expect(classifyCondition(curtain)).toBe('solar-maximum')
  })

  it('returns storm-peak for qualityScore >= 65', () => {
    const curtain = { qualityScore: 78 } as any
    expect(classifyCondition(curtain)).toBe('storm-peak')
  })

  it('returns active-night for qualityScore >= 50', () => {
    const curtain = { qualityScore: 55 } as any
    expect(classifyCondition(curtain)).toBe('active-night')
  })

  it('returns quiet-arc for qualityScore >= 35', () => {
    const curtain = { qualityScore: 40 } as any
    expect(classifyCondition(curtain)).toBe('quiet-arc')
  })

  it('returns substorm for qualityScore >= 20', () => {
    const curtain = { qualityScore: 23 } as any
    expect(classifyCondition(curtain)).toBe('substorm')
  })

  it('returns clouded-out for qualityScore < 20', () => {
    const curtain = { qualityScore: 10 } as any
    expect(classifyCondition(curtain)).toBe('clouded-out')
  })
})

// ─── analyzeAuroraCurtain ──────────────────────────────────────────────────

describe('analyzeAuroraCurtain', () => {
  it('returns qualityScore 93 for RICH', () => {
    const result = analyzeAuroraCurtain(RICH, 'rich.ts')
    expect(result.qualityScore).toBe(93)
  })

  it('returns qualityScore 29 for EMPTY', () => {
    const result = analyzeAuroraCurtain(EMPTY, 'empty.ts')
    expect(result.qualityScore).toBe(29)
  })

  it('returns qualityScore 78 for MEDIUM', () => {
    const result = analyzeAuroraCurtain(MEDIUM, 'medium.ts')
    expect(result.qualityScore).toBe(78)
  })

  it('returns solar-maximum condition for RICH', () => {
    expect(analyzeAuroraCurtain(RICH, 'rich.ts').condition).toBe('solar-maximum')
  })

  it('returns substorm condition for EMPTY', () => {
    expect(analyzeAuroraCurtain(EMPTY, 'empty.ts').condition).toBe('substorm')
  })

  it('returns storm-peak condition for MEDIUM', () => {
    expect(analyzeAuroraCurtain(MEDIUM, 'medium.ts').condition).toBe('storm-peak')
  })

  it('stores correct file path', () => {
    expect(analyzeAuroraCurtain(RICH, 'my-file.ts').file).toBe('my-file.ts')
  })

  it('curtainLuminosity matches luminosity level', () => {
    const result = analyzeAuroraCurtain(RICH, 'rich.ts')
    expect(result.curtainLuminosity).toBe(90)
  })

  it('colorSpectrum matches spectrum diversity', () => {
    const result = analyzeAuroraCurtain(RICH, 'rich.ts')
    expect(result.colorSpectrum).toBe(91)
  })

  it('magneticDeflection matches magnetic deflection', () => {
    const result = analyzeAuroraCurtain(RICH, 'rich.ts')
    expect(result.magneticDeflection).toBe(90)
  })

  it('ionosphericCharge matches ionosphere charge', () => {
    const result = analyzeAuroraCurtain(RICH, 'rich.ts')
    expect(result.ionosphericCharge).toBe(96)
  })

  it('particleCollision matches particle collision', () => {
    const result = analyzeAuroraCurtain(RICH, 'rich.ts')
    expect(result.particleCollision).toBe(91)
  })

  it('celestialGrandeur matches grandeur score', () => {
    const result = analyzeAuroraCurtain(RICH, 'rich.ts')
    expect(result.celestialGrandeur).toBe(98)
  })
})

// ─── classifyRegionType ────────────────────────────────────────────────────

describe('classifyRegionType', () => {
  it('returns dark-side for empty array', () => {
    expect(classifyRegionType([])).toBe('dark-side')
  })

  it('returns aurora-oval for high quality with enough solar-maximum', () => {
    const curtains = Array.from({ length: 5 }, () => ({ qualityScore: 90, condition: 'solar-maximum' } as any))
    expect(classifyRegionType(curtains)).toBe('aurora-oval')
  })

  it('returns polar-cap for avgQuality >= 60', () => {
    const curtains = [{ qualityScore: 64, condition: 'storm-peak' } as any]
    expect(classifyRegionType(curtains)).toBe('polar-cap')
  })

  it('returns sub-auroral for avgQuality >= 45', () => {
    const curtains = [{ qualityScore: 50, condition: 'active-night' } as any]
    expect(classifyRegionType(curtains)).toBe('sub-auroral')
  })

  it('returns mid-latitude for avgQuality >= 30', () => {
    const curtains = [{ qualityScore: 35, condition: 'quiet-arc' } as any]
    expect(classifyRegionType(curtains)).toBe('mid-latitude')
  })

  it('returns equatorial for avgQuality >= 15', () => {
    const curtains = [{ qualityScore: 20, condition: 'substorm' } as any]
    expect(classifyRegionType(curtains)).toBe('equatorial')
  })

  it('returns dark-side for avgQuality < 15', () => {
    const curtains = [{ qualityScore: 10, condition: 'clouded-out' } as any]
    expect(classifyRegionType(curtains)).toBe('dark-side')
  })
})

// ─── classifyRegionCondition ───────────────────────────────────────────────

describe('classifyRegionCondition', () => {
  it('returns observatory for avg >= 80', () => {
    expect(classifyRegionCondition(85)).toBe('observatory')
  })

  it('returns viewing-station for avg >= 65', () => {
    expect(classifyRegionCondition(70)).toBe('viewing-station')
  })

  it('returns dark-sky-reserve for avg >= 50', () => {
    expect(classifyRegionCondition(55)).toBe('dark-sky-reserve')
  })

  it('returns city-lights for avg >= 35', () => {
    expect(classifyRegionCondition(40)).toBe('city-lights')
  })

  it('returns overcast for avg >= 20', () => {
    expect(classifyRegionCondition(25)).toBe('overcast')
  })

  it('returns daylight for avg < 20', () => {
    expect(classifyRegionCondition(10)).toBe('daylight')
  })
})

// ─── classifyAstronomerGrade ───────────────────────────────────────────────

describe('classifyAstronomerGrade', () => {
  it('returns aurora-hunter for >= 80', () => {
    expect(classifyAstronomerGrade(85)).toBe('aurora-hunter')
  })

  it('returns astrophysicist for >= 65', () => {
    expect(classifyAstronomerGrade(70)).toBe('astrophysicist')
  })

  it('returns astronomer for >= 50', () => {
    expect(classifyAstronomerGrade(55)).toBe('astronomer')
  })

  it('returns sky-watcher for >= 35', () => {
    expect(classifyAstronomerGrade(40)).toBe('sky-watcher')
  })

  it('returns stargazer for >= 20', () => {
    expect(classifyAstronomerGrade(25)).toBe('stargazer')
  })

  it('returns blind-spot for < 20', () => {
    expect(classifyAstronomerGrade(15)).toBe('blind-spot')
  })
})

// ─── analyzeAuroraRegion ───────────────────────────────────────────────────

describe('analyzeAuroraRegion', () => {
  it('returns dark-side region for empty curtains', () => {
    const result = analyzeAuroraRegion([], 'empty-dir')
    expect(result.regionType).toBe('dark-side')
    expect(result.condition).toBe('daylight')
    expect(result.curtains).toHaveLength(0)
  })

  it('computes correct averages for single curtain', () => {
    const curtain = analyzeAuroraCurtain(RICH, 'rich.ts')
    const result = analyzeAuroraRegion([curtain], 'src')
    expect(result.avgLuminosity).toBe(90)
    expect(result.avgStructure).toBe(90)
    expect(result.avgGrandeur).toBe(98)
    expect(result.solarMaximumCount).toBe(1)
    expect(result.cloudedOutCount).toBe(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns praise when all averages are high', () => {
    const curtains = [analyzeAuroraCurtain(RICH, 'rich.ts')]
    const regions: any[] = []
    const sky = { overallGrandeur: 90 } as any
    const stats = {
      avgCurtainLuminosity: 90,
      avgColorSpectrum: 91,
      avgMagneticDeflection: 90,
      avgIonosphericCharge: 96,
      avgParticleCollision: 91,
      avgCelestialGrandeur: 98,
      cloudedOutCount: 0,
      isGrandCount: 1,
    } as any
    const recs = generateRecommendations(curtains, regions, sky, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('Breathtaking')
  })

  it('suggests improving luminosity when low', () => {
    const stats = {
      avgCurtainLuminosity: 30,
      avgColorSpectrum: 80,
      avgMagneticDeflection: 80,
      avgIonosphericCharge: 80,
      avgParticleCollision: 80,
      avgCelestialGrandeur: 80,
      cloudedOutCount: 0,
      isGrandCount: 1,
    } as any
    const recs = generateRecommendations([], [], { overallGrandeur: 80 } as any, stats)
    expect(recs.some((r) => r.includes('luminosity'))).toBe(true)
  })

  it('warns about too many clouded-out files', () => {
    const curtains = Array.from({ length: 4 }, () => ({ condition: 'clouded-out' } as any))
    const stats = {
      avgCurtainLuminosity: 80,
      avgColorSpectrum: 80,
      avgMagneticDeflection: 80,
      avgIonosphericCharge: 80,
      avgParticleCollision: 80,
      avgCelestialGrandeur: 80,
      cloudedOutCount: 3,
      isGrandCount: 1,
    } as any
    const recs = generateRecommendations(curtains, [], { overallGrandeur: 80 } as any, stats)
    expect(recs.some((r) => r.includes('clouded-out'))).toBe(true)
  })

  it('warns when no grand displays', () => {
    const stats = {
      avgCurtainLuminosity: 80,
      avgColorSpectrum: 80,
      avgMagneticDeflection: 80,
      avgIonosphericCharge: 80,
      avgParticleCollision: 80,
      avgCelestialGrandeur: 80,
      cloudedOutCount: 0,
      isGrandCount: 0,
    } as any
    const recs = generateRecommendations([], [], { overallGrandeur: 80 } as any, stats)
    expect(recs.some((r) => r.includes('grand'))).toBe(true)
  })
})

// ─── buildAuroraVeilResult ─────────────────────────────────────────────────

describe('buildAuroraVeilResult', () => {
  it('returns empty result for no files', () => {
    const result = buildAuroraVeilResult([], [])
    expect(result.curtains).toHaveLength(0)
    expect(result.regions).toHaveLength(0)
    expect(result.sky.overallGrandeur).toBe(0)
    expect(result.sky.isBreathtaking).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes single RICH file correctly', () => {
    const result = buildAuroraVeilResult(['rich.ts'], [RICH])
    expect(result.curtains).toHaveLength(1)
    expect(result.curtains[0].qualityScore).toBe(93)
    expect(result.curtains[0].condition).toBe('solar-maximum')
    expect(result.stats.solarMaximumCount).toBe(1)
    expect(result.stats.isGrandCount).toBe(1)
  })

  it('computes correct 3-file mix overall values', () => {
    const result = buildAuroraVeilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )

    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalRegions).toBe(1)
    expect(result.sky.overallGrandeur).toBe(67)
    expect(result.sky.isBreathtaking).toBe(true)
    expect(result.sky.avgLuminosity).toBe(72)
    expect(result.sky.avgStructure).toBe(66)
    expect(result.sky.avgGrandeur).toBe(67)

    expect(result.stats.avgCurtainLuminosity).toBe(72)
    expect(result.stats.avgColorSpectrum).toBe(62)
    expect(result.stats.avgMagneticDeflection).toBe(66)
    expect(result.stats.avgIonosphericCharge).toBe(68)
    expect(result.stats.avgParticleCollision).toBe(66)
    expect(result.stats.avgCelestialGrandeur).toBe(67)

    expect(result.stats.solarMaximumCount).toBe(1)
    expect(result.stats.stormPeakCount).toBe(1)
    expect(result.stats.substormCount).toBe(1)
    expect(result.stats.cloudedOutCount).toBe(0)

    expect(result.stats.hasHighLuminosityCount).toBe(2)
    expect(result.stats.hasRichSpectrumCount).toBe(1)
    expect(result.stats.hasProperStructureCount).toBe(2)
    expect(result.stats.hasHighEnergyCount).toBe(2)
    expect(result.stats.hasHighInteractionCount).toBe(2)
    expect(result.stats.isGrandCount).toBe(1)

    expect(result.stats.astronomerGrade).toBe('astrophysicist')
    expect(result.stats.bestCurtain).toBe('src/rich.ts')
    expect(result.stats.brightest).toBe('src/rich.ts')
    expect(result.stats.mostDiverse).toBe('src/rich.ts')
    expect(result.stats.bestStructured).toBe('src/rich.ts')
    expect(result.stats.mostEnergetic).toBe('src/rich.ts')
    expect(result.stats.grandest).toBe('src/rich.ts')

    expect(result.regions).toHaveLength(1)
    expect(result.regions[0].regionType).toBe('polar-cap')
    expect(result.regions[0].condition).toBe('viewing-station')
  })

  it('creates separate regions for different directories', () => {
    const result = buildAuroraVeilResult(
      ['src/a.ts', 'lib/b.ts'],
      [RICH, EMPTY],
    )
    expect(result.regions).toHaveLength(2)
  })
})

// ─── format-helpers ────────────────────────────────────────────────────────

describe('format-helpers', () => {
  it('scoreColor returns string for any score', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(70)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    expect(typeof conditionColor('solar-maximum')).toBe('string')
    expect(typeof conditionColor('storm-peak')).toBe('string')
    expect(typeof conditionColor('active-night')).toBe('string')
    expect(typeof conditionColor('quiet-arc')).toBe('string')
    expect(typeof conditionColor('substorm')).toBe('string')
    expect(typeof conditionColor('clouded-out')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
  })

  it('gradeColor returns string for all grades', () => {
    expect(typeof gradeColor('aurora-hunter')).toBe('string')
    expect(typeof gradeColor('astrophysicist')).toBe('string')
    expect(typeof gradeColor('astronomer')).toBe('string')
    expect(typeof gradeColor('sky-watcher')).toBe('string')
    expect(typeof gradeColor('stargazer')).toBe('string')
    expect(typeof gradeColor('blind-spot')).toBe('string')
  })

  it('regionTypeColor returns string for all types', () => {
    expect(typeof regionTypeColor('aurora-oval')).toBe('string')
    expect(typeof regionTypeColor('polar-cap')).toBe('string')
    expect(typeof regionTypeColor('sub-auroral')).toBe('string')
    expect(typeof regionTypeColor('mid-latitude')).toBe('string')
    expect(typeof regionTypeColor('equatorial')).toBe('string')
    expect(typeof regionTypeColor('dark-side')).toBe('string')
  })

  it('formatAuroraVeilJson returns valid JSON', () => {
    const result = buildAuroraVeilResult(['test.ts'], [RICH])
    const json = formatAuroraVeilJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.curtains).toHaveLength(1)
  })

  it('formatAuroraVeilTable returns string with sections', () => {
    const result = buildAuroraVeilResult(['test.ts'], [RICH])
    const table = formatAuroraVeilTable(result, false)
    expect(table).toContain('Aurora Veil Analysis')
    expect(table).toContain('Sky Overview')
    expect(table).toContain('Statistics')
    expect(table).toContain('Grades')
  })

  it('formatAuroraVeilTable includes per-curtain breakdown when verbose', () => {
    const result = buildAuroraVeilResult(['test.ts'], [RICH])
    const table = formatAuroraVeilTable(result, true)
    expect(table).toContain('Per-Curtain Breakdown')
  })

  it('formatAuroraVeilTable omits per-curtain when not verbose', () => {
    const result = buildAuroraVeilResult(['test.ts'], [RICH])
    const table = formatAuroraVeilTable(result, false)
    expect(table).not.toContain('Per-Curtain Breakdown')
  })

  it('formatAuroraVeilTable shows recommendations', () => {
    const result = buildAuroraVeilResult(['test.ts'], [RICH])
    const table = formatAuroraVeilTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('formatAuroraVeilTable shows regions', () => {
    const result = buildAuroraVeilResult(['src/test.ts'], [RICH])
    const table = formatAuroraVeilTable(result, false)
    expect(table).toContain('Regions')
  })
})
