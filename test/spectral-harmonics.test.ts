import { describe, expect, it } from 'vitest'
import {
  measureResonating,
  measureHarmonic,
  measureOvertone,
  measureWaveform,
  measureFrequency,
  classifyCondition,
  classifyChamberType,
  classifyChamberCondition,
  classifyConductorGrade,
  analyzeSpectralWave,
  analyzeResonanceChamber,
  buildSpectralHarmonicsResult,
  generateRecommendations,
} from '../src/commands/spectral-harmonics-helpers.js'
import {
  scoreColor,
  gradeColor,
  chordColor,
  seriesColor,
  shapeColor,
  spectrumColor,
  conditionColor,
  conductorGradeColor,
  formatSpectralHarmonicsJson,
  formatSpectralHarmonicsTable,
} from '../src/commands/spectral-harmonics-format-helpers.js'
import type { SpectralWave } from '../src/commands/spectral-harmonics-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `import { Something } from 'module'
import type { TypeA } from 'types'

/** Doc comment */
export interface Config {
  readonly name: string
  readonly value: number
}

export type Result<T> = {
  readonly data: T
  readonly error?: string
}

export class Processor {
  private data: Config[]

  constructor() {
    this.data = []
  }

  async process(input: Config): Promise<Result<Config>> {
    try {
      const result = input?.value ?? 0
      if (result !== null) {
        return { data: input }
      }
      return { data: input, error: 'empty' }
    } catch (err) {
      return { data: input, error: String(err) }
    }
  }
}

export function helper(config: Config): void {
  const x = config?.name ?? 'default'
  console.log(x === 'test' ? 'yes' : 'no')
}`

const MINIMAL = `const x = 1`

const MODERATE = `export interface Item {
  name: string
}

export function process(item: Item): string {
  return item.name
}

const result = process({ name: 'test' })`

const POOR = `var x: any = 1
var y: any = 2
function bad(a: any): any {
  return a
}`

const EMPTY = ''

// ─── measureResonating ──────────────────────────────────────────────────────

describe('measureResonating', () => {
  it('scores RICH content with purity=100', () => {
    const result = measureResonating(RICH)
    expect(result.purity).toBe(100)
    expect(result.grade).toBe('pure-tone')
    expect(result.hasHighPurity).toBe(true)
  })

  it('scores RICH content with all boolean flags true', () => {
    const result = measureResonating(RICH)
    expect(result.hasClear).toBe(true)
    expect(result.hasResonant).toBe(true)
    expect(result.hasPure).toBe(true)
    expect(result.hasHarmonic).toBe(true)
    expect(result.hasClean).toBe(true)
    expect(result.hasBalanced).toBe(true)
    expect(result.hasNoDissonance).toBe(true)
    expect(result.hasNoClutter).toBe(true)
    expect(result.hasNoMud).toBe(true)
    expect(result.hasNoNoise).toBe(true)
  })

  it('scores MINIMAL content with purity=10', () => {
    const result = measureResonating(MINIMAL)
    expect(result.purity).toBe(10)
    expect(result.grade).toBe('cacophony')
    expect(result.hasHighPurity).toBe(false)
  })

  it('scores MINIMAL content booleans', () => {
    const result = measureResonating(MINIMAL)
    expect(result.hasClear).toBe(false)
    expect(result.hasResonant).toBe(false)
    expect(result.dissonanceCount).toBe(0)
    expect(result.clutterCount).toBe(0)
  })

  it('scores MODERATE content with purity=48', () => {
    const result = measureResonating(MODERATE)
    expect(result.purity).toBe(48)
    expect(result.grade).toBe('muffled-sound')
  })

  it('scores MODERATE content booleans', () => {
    const result = measureResonating(MODERATE)
    expect(result.hasClear).toBe(true)
    expect(result.hasResonant).toBe(true)
    expect(result.hasPure).toBe(false)
  })

  it('detects var dissonance in POOR content', () => {
    const result = measureResonating(POOR)
    expect(result.dissonanceCount).toBe(2)
    expect(result.clutterCount).toBe(4)
    expect(result.hasNoDissonance).toBe(false)
    expect(result.hasNoClutter).toBe(false)
  })

  it('scores EMPTY content with purity=0', () => {
    const result = measureResonating(EMPTY)
    expect(result.purity).toBe(0)
    expect(result.grade).toBe('cacophony')
    expect(result.dissonanceCount).toBe(0)
  })
})

// ─── measureHarmonic ────────────────────────────────────────────────────────

describe('measureHarmonic', () => {
  it('scores RICH content with resonance=100', () => {
    const result = measureHarmonic(RICH)
    expect(result.resonance).toBe(100)
    expect(result.chord).toBe('perfect-chord')
    expect(result.hasHighResonance).toBe(true)
  })

  it('scores RICH content with all boolean flags true', () => {
    const result = measureHarmonic(RICH)
    expect(result.hasInTune).toBe(true)
    expect(result.hasHarmonious).toBe(true)
    expect(result.hasResonant).toBe(true)
    expect(result.hasComplementary).toBe(true)
    expect(result.hasSympathetic).toBe(true)
    expect(result.hasPhaseAligned).toBe(true)
    expect(result.hasNoClash).toBe(true)
    expect(result.hasNoInterference).toBe(true)
  })

  it('scores MINIMAL content with resonance=8', () => {
    const result = measureHarmonic(MINIMAL)
    expect(result.resonance).toBe(8)
    expect(result.chord).toBe('discord')
    expect(result.hasHighResonance).toBe(false)
  })

  it('scores MODERATE content with resonance=49', () => {
    const result = measureHarmonic(MODERATE)
    expect(result.resonance).toBe(49)
    expect(result.chord).toBe('power-chord')
    expect(result.hasHarmonious).toBe(true)
    expect(result.hasPhaseAligned).toBe(true)
  })

  it('detects var and any in POOR content', () => {
    const result = measureHarmonic(POOR)
    expect(result.clashCount).toBe(2)
    expect(result.interferenceCount).toBe(4)
    expect(result.hasNoClash).toBe(false)
    expect(result.hasNoBeatFrequency).toBe(false)
  })

  it('scores EMPTY content with resonance=0', () => {
    const result = measureHarmonic(EMPTY)
    expect(result.resonance).toBe(0)
    expect(result.chord).toBe('discord')
  })
})

// ─── measureOvertone ────────────────────────────────────────────────────────

describe('measureOvertone', () => {
  it('scores RICH content with richness=100', () => {
    const result = measureOvertone(RICH)
    expect(result.richness).toBe(100)
    expect(result.series).toBe('full-harmonic-series')
    expect(result.hasHighRichness).toBe(true)
  })

  it('scores RICH content with all boolean flags true', () => {
    const result = measureOvertone(RICH)
    expect(result.hasDeep).toBe(true)
    expect(result.hasLayered).toBe(true)
    expect(result.hasComplex).toBe(true)
    expect(result.hasMultidimensional).toBe(true)
    expect(result.hasRich).toBe(true)
    expect(result.hasTextured).toBe(true)
  })

  it('scores MINIMAL content with richness=0', () => {
    const result = measureOvertone(MINIMAL)
    expect(result.richness).toBe(0)
    expect(result.series).toBe('dead-tone')
  })

  it('scores MODERATE content with richness=18', () => {
    const result = measureOvertone(MODERATE)
    expect(result.richness).toBe(18)
    expect(result.series).toBe('dead-tone')
  })

  it('detects var and any in POOR content', () => {
    const result = measureOvertone(POOR)
    expect(result.flatnessCount).toBe(2)
    expect(result.shallowCount).toBe(4)
    expect(result.hasNoFlatness).toBe(false)
    expect(result.hasNoShallow).toBe(false)
  })
})

// ─── measureWaveform ────────────────────────────────────────────────────────

describe('measureWaveform', () => {
  it('scores RICH content with clarity=100', () => {
    const result = measureWaveform(RICH)
    expect(result.clarity).toBe(100)
    expect(result.shape).toBe('perfect-sine')
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores RICH content with all boolean flags true', () => {
    const result = measureWaveform(RICH)
    expect(result.hasSmooth).toBe(true)
    expect(result.hasClean).toBe(true)
    expect(result.hasDefined).toBe(true)
    expect(result.hasCrisp).toBe(true)
    expect(result.hasPrecise).toBe(true)
  })

  it('scores MINIMAL content with clarity=18', () => {
    const result = measureWaveform(MINIMAL)
    expect(result.clarity).toBe(18)
    expect(result.shape).toBe('static')
  })

  it('scores MODERATE content with clarity=70', () => {
    const result = measureWaveform(MODERATE)
    expect(result.clarity).toBe(70)
    expect(result.shape).toBe('clean-wave')
    expect(result.hasHighClarity).toBe(true)
    expect(result.hasCrisp).toBe(true)
    expect(result.hasPrecise).toBe(true)
  })

  it('detects var and any in POOR content', () => {
    const result = measureWaveform(POOR)
    expect(result.artifactCount).toBe(2)
    expect(result.blurCount).toBe(4)
    expect(result.hasNoJagged).toBe(false)
    expect(result.hasNoArtifact).toBe(false)
  })
})

// ─── measureFrequency ───────────────────────────────────────────────────────

describe('measureFrequency', () => {
  it('scores RICH content with distribution=100', () => {
    const result = measureFrequency(RICH)
    expect(result.distribution).toBe(100)
    expect(result.spectrum).toBe('full-spectrum')
    expect(result.hasHighDistribution).toBe(true)
  })

  it('scores RICH content with all boolean flags true', () => {
    const result = measureFrequency(RICH)
    expect(result.hasDiverse).toBe(true)
    expect(result.hasVaried).toBe(true)
    expect(result.hasRich).toBe(true)
    expect(result.hasColorful).toBe(true)
    expect(result.hasDynamic).toBe(true)
  })

  it('scores MINIMAL content with distribution=8', () => {
    const result = measureFrequency(MINIMAL)
    expect(result.distribution).toBe(8)
    expect(result.spectrum).toBe('white-noise')
  })

  it('scores MODERATE content with distribution=26', () => {
    const result = measureFrequency(MODERATE)
    expect(result.distribution).toBe(26)
    expect(result.spectrum).toBe('single-tone')
  })

  it('detects var and any in POOR content', () => {
    const result = measureFrequency(POOR)
    expect(result.monotoneCount).toBe(2)
    expect(result.repetitiveCount).toBe(4)
    expect(result.hasNoMonotone).toBe(false)
    expect(result.hasNoRepetitive).toBe(false)
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns pure-resonance for score >= 85', () => {
    expect(classifyCondition(90)).toBe('pure-resonance')
    expect(classifyCondition(85)).toBe('pure-resonance')
  })

  it('returns harmonic-balance for score >= 70', () => {
    expect(classifyCondition(75)).toBe('harmonic-balance')
    expect(classifyCondition(70)).toBe('harmonic-balance')
  })

  it('returns clean-tone for score >= 55', () => {
    expect(classifyCondition(60)).toBe('clean-tone')
    expect(classifyCondition(55)).toBe('clean-tone')
  })

  it('returns muffled-sound for score >= 40', () => {
    expect(classifyCondition(45)).toBe('muffled-sound')
    expect(classifyCondition(40)).toBe('muffled-sound')
  })

  it('returns distorted for score >= 25', () => {
    expect(classifyCondition(30)).toBe('distorted')
    expect(classifyCondition(25)).toBe('distorted')
  })

  it('returns noise-floor for score < 25', () => {
    expect(classifyCondition(15)).toBe('noise-floor')
    expect(classifyCondition(0)).toBe('noise-floor')
  })
})

// ─── classifyChamberType ────────────────────────────────────────────────────

describe('classifyChamberType', () => {
  it('returns anechoic for empty waves', () => {
    expect(classifyChamberType([])).toBe('anechoic')
  })

  it('returns concert-hall for high quality with high pure-resonance ratio', () => {
    const waves: SpectralWave[] = [
      { qualityScore: 90, condition: 'pure-resonance' } as SpectralWave,
      { qualityScore: 80, condition: 'pure-resonance' } as SpectralWave,
    ]
    expect(classifyChamberType(waves)).toBe('concert-hall')
  })

  it('returns studio-room for avgQs >= 60', () => {
    const waves: SpectralWave[] = [
      { qualityScore: 65, condition: 'clean-tone' } as SpectralWave,
    ]
    expect(classifyChamberType(waves)).toBe('studio-room')
  })

  it('returns practice-room for avgQs >= 45', () => {
    const waves: SpectralWave[] = [
      { qualityScore: 50, condition: 'muffled-sound' } as SpectralWave,
    ]
    expect(classifyChamberType(waves)).toBe('practice-room')
  })

  it('returns garage-space for avgQs >= 30', () => {
    const waves: SpectralWave[] = [
      { qualityScore: 35, condition: 'distorted' } as SpectralWave,
    ]
    expect(classifyChamberType(waves)).toBe('garage-space')
  })

  it('returns closet-booth for avgQs >= 15', () => {
    const waves: SpectralWave[] = [
      { qualityScore: 20, condition: 'noise-floor' } as SpectralWave,
    ]
    expect(classifyChamberType(waves)).toBe('closet-booth')
  })

  it('returns anechoic for very low avgQs', () => {
    const waves: SpectralWave[] = [
      { qualityScore: 5, condition: 'noise-floor' } as SpectralWave,
    ]
    expect(classifyChamberType(waves)).toBe('anechoic')
  })
})

// ─── classifyChamberCondition ───────────────────────────────────────────────

describe('classifyChamberCondition', () => {
  it('returns perfect-acoustics for avgQs >= 75', () => {
    expect(classifyChamberCondition(80)).toBe('perfect-acoustics')
    expect(classifyChamberCondition(75)).toBe('perfect-acoustics')
  })

  it('returns great-sound for avgQs >= 60', () => {
    expect(classifyChamberCondition(65)).toBe('great-sound')
    expect(classifyChamberCondition(60)).toBe('great-sound')
  })

  it('returns good-room for avgQs >= 45', () => {
    expect(classifyChamberCondition(50)).toBe('good-room')
    expect(classifyChamberCondition(45)).toBe('good-room')
  })

  it('returns dead-room for avgQs >= 30', () => {
    expect(classifyChamberCondition(35)).toBe('dead-room')
    expect(classifyChamberCondition(30)).toBe('dead-room')
  })

  it('returns echo-chamber for avgQs >= 15', () => {
    expect(classifyChamberCondition(20)).toBe('echo-chamber')
    expect(classifyChamberCondition(15)).toBe('echo-chamber')
  })

  it('returns reverberant for avgQs < 15', () => {
    expect(classifyChamberCondition(10)).toBe('reverberant')
    expect(classifyChamberCondition(0)).toBe('reverberant')
  })
})

// ─── classifyConductorGrade ─────────────────────────────────────────────────

describe('classifyConductorGrade', () => {
  it('returns maestro for >= 80', () => {
    expect(classifyConductorGrade(90)).toBe('maestro')
    expect(classifyConductorGrade(80)).toBe('maestro')
  })

  it('returns virtuoso for >= 65', () => {
    expect(classifyConductorGrade(70)).toBe('virtuoso')
    expect(classifyConductorGrade(65)).toBe('virtuoso')
  })

  it('returns concert-master for >= 50', () => {
    expect(classifyConductorGrade(55)).toBe('concert-master')
    expect(classifyConductorGrade(50)).toBe('concert-master')
  })

  it('returns section-player for >= 35', () => {
    expect(classifyConductorGrade(40)).toBe('section-player')
    expect(classifyConductorGrade(35)).toBe('section-player')
  })

  it('returns student-musician for >= 20', () => {
    expect(classifyConductorGrade(25)).toBe('student-musician')
    expect(classifyConductorGrade(20)).toBe('student-musician')
  })

  it('returns tone-deaf for < 20', () => {
    expect(classifyConductorGrade(10)).toBe('tone-deaf')
    expect(classifyConductorGrade(0)).toBe('tone-deaf')
  })
})

// ─── analyzeSpectralWave ────────────────────────────────────────────────────

describe('analyzeSpectralWave', () => {
  it('analyzes RICH content correctly', () => {
    const wave = analyzeSpectralWave(RICH, 'rich.ts')
    expect(wave.file).toBe('rich.ts')
    expect(wave.spectralPurity).toBe(100)
    expect(wave.harmonicResonance).toBe(100)
    expect(wave.overtoneRichness).toBe(100)
    expect(wave.waveformClarity).toBe(100)
    expect(wave.frequencyDistribution).toBe(100)
    expect(wave.qualityScore).toBe(100)
    expect(wave.condition).toBe('pure-resonance')
  })

  it('analyzes MINIMAL content correctly', () => {
    const wave = analyzeSpectralWave(MINIMAL, 'minimal.ts')
    expect(wave.file).toBe('minimal.ts')
    expect(wave.spectralPurity).toBe(10)
    expect(wave.harmonicResonance).toBe(8)
    expect(wave.overtoneRichness).toBe(0)
    expect(wave.waveformClarity).toBe(18)
    expect(wave.frequencyDistribution).toBe(8)
    expect(wave.qualityScore).toBe(9)
    expect(wave.condition).toBe('noise-floor')
  })

  it('analyzes MODERATE content correctly', () => {
    const wave = analyzeSpectralWave(MODERATE, 'moderate.ts')
    expect(wave.spectralPurity).toBe(48)
    expect(wave.harmonicResonance).toBe(49)
    expect(wave.overtoneRichness).toBe(18)
    expect(wave.waveformClarity).toBe(70)
    expect(wave.frequencyDistribution).toBe(26)
    expect(wave.qualityScore).toBe(42)
    expect(wave.condition).toBe('muffled-sound')
  })

  it('analyzes POOR content correctly', () => {
    const wave = analyzeSpectralWave(POOR, 'poor.ts')
    expect(wave.spectralPurity).toBe(10)
    expect(wave.harmonicResonance).toBe(10)
    expect(wave.overtoneRichness).toBe(0)
    expect(wave.waveformClarity).toBe(18)
    expect(wave.frequencyDistribution).toBe(0)
    expect(wave.qualityScore).toBe(8)
    expect(wave.condition).toBe('noise-floor')
  })

  it('analyzes EMPTY content correctly', () => {
    const wave = analyzeSpectralWave(EMPTY, 'empty.ts')
    expect(wave.qualityScore).toBe(0)
    expect(wave.condition).toBe('noise-floor')
  })

  it('computes qualityScore as equal-weighted average of 5 measures', () => {
    const wave = analyzeSpectralWave(MINIMAL, 'test.ts')
    const expected = Math.round(10 * 0.2 + 8 * 0.2 + 0 * 0.2 + 18 * 0.2 + 8 * 0.2)
    expect(wave.qualityScore).toBe(expected)
  })
})

// ─── analyzeResonanceChamber ────────────────────────────────────────────────

describe('analyzeResonanceChamber', () => {
  it('returns default values for empty waves', () => {
    const chamber = analyzeResonanceChamber([], 'empty-dir')
    expect(chamber.directory).toBe('empty-dir')
    expect(chamber.waves).toEqual([])
    expect(chamber.avgPurity).toBe(0)
    expect(chamber.avgResonance).toBe(0)
    expect(chamber.avgClarity).toBe(0)
    expect(chamber.pureResonanceCount).toBe(0)
    expect(chamber.noiseFloorCount).toBe(0)
    expect(chamber.chamberType).toBe('anechoic')
    expect(chamber.condition).toBe('reverberant')
  })

  it('computes chamber averages for RICH waves', () => {
    const waves = [analyzeSpectralWave(RICH, 'a.ts'), analyzeSpectralWave(RICH, 'b.ts')]
    const chamber = analyzeResonanceChamber(waves, 'src')
    expect(chamber.avgPurity).toBe(100)
    expect(chamber.avgResonance).toBe(100)
    expect(chamber.avgClarity).toBe(100)
    expect(chamber.pureResonanceCount).toBe(2)
    expect(chamber.noiseFloorCount).toBe(0)
    expect(chamber.chamberType).toBe('concert-hall')
    expect(chamber.condition).toBe('perfect-acoustics')
  })
})

// ─── buildSpectralHarmonicsResult ───────────────────────────────────────────

describe('buildSpectralHarmonicsResult', () => {
  it('handles empty input', () => {
    const result = buildSpectralHarmonicsResult([], [])
    expect(result.waves).toEqual([])
    expect(result.chambers).toEqual([])
    expect(result.spectrum.avgPurity).toBe(0)
    expect(result.spectrum.overallHarmonicity).toBe(0)
    expect(result.spectrum.isHarmonious).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.conductorGrade).toBe('tone-deaf')
    expect(result.stats.bestWave).toBe('')
  })

  it('handles single RICH file in subdir', () => {
    const result = buildSpectralHarmonicsResult(['src/rich.ts'], [RICH])
    expect(result.waves).toHaveLength(1)
    expect(result.chambers).toHaveLength(1)
    expect(result.chambers[0].directory).toBe('src')
    expect(result.spectrum.avgPurity).toBe(100)
    expect(result.spectrum.isHarmonious).toBe(true)
    expect(result.spectrum.overallHarmonicity).toBe(100)
    expect(result.stats.conductorGrade).toBe('maestro')
    expect(result.stats.bestWave).toBe('src/rich.ts')
  })

  it('computes correct stats for mixed files', () => {
    const result = buildSpectralHarmonicsResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.waves).toHaveLength(4)
    expect(result.stats.totalFiles).toBe(4)
    expect(result.stats.avgSpectralPurity).toBe(42)
    expect(result.stats.avgHarmonicResonance).toBe(42)
    expect(result.stats.avgOvertoneRichness).toBe(30)
    expect(result.stats.avgWaveformClarity).toBe(52)
    expect(result.stats.avgFrequencyDistribution).toBe(34)
    expect(result.stats.pureResonanceCount).toBe(1)
    expect(result.stats.noiseFloorCount).toBe(2)
    expect(result.stats.muffledSoundCount).toBe(1)
    expect(result.stats.overallHarmonicity).toBe(45)
    expect(result.stats.conductorGrade).toBe('section-player')
    expect(result.stats.bestWave).toBe('rich.ts')
    expect(result.stats.purest).toBe('rich.ts')
    expect(result.stats.mostResonant).toBe('rich.ts')
    expect(result.stats.richest).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
  })

  it('computes overallHarmonicity as avg of purity, resonance, clarity', () => {
    const result = buildSpectralHarmonicsResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.spectrum.avgPurity).toBe(42)
    expect(result.spectrum.avgResonance).toBe(42)
    expect(result.spectrum.avgClarity).toBe(52)
    expect(result.spectrum.overallHarmonicity).toBe(45)
  })

  it('groups files into chambers by directory', () => {
    const result = buildSpectralHarmonicsResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MINIMAL, MODERATE],
    )
    expect(result.chambers).toHaveLength(2)
    const dirs = result.chambers.map((c) => c.directory)
    expect(dirs).toContain('src')
    expect(dirs).toContain('lib')
  })

  it('counts high boolean flags correctly for mixed files', () => {
    const result = buildSpectralHarmonicsResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.stats.hasHighPurityCount).toBe(1)
    expect(result.stats.hasHighResonanceCount).toBe(1)
    expect(result.stats.hasHighRichnessCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.hasHighDistributionCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message for high-quality code', () => {
    const result = buildSpectralHarmonicsResult(['src/rich.ts'], [RICH])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('perfectly tuned')
  })

  it('returns recommendations for low-quality code', () => {
    const result = buildSpectralHarmonicsResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
    const joined = result.recommendations.join(' ')
    expect(joined).toContain('spectral purity')
    expect(joined).toContain('resonance')
    expect(joined).toContain('overtones')
    expect(joined).toContain('frequency distribution')
  })

  it('recommends cleaning up noise-floor files', () => {
    const result = buildSpectralHarmonicsResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    const joined = result.recommendations.join(' ')
    expect(joined).toContain('noise floor')
  })

  it('returns recommendations for empty input', () => {
    const result = buildSpectralHarmonicsResult([], [])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('format-helpers', () => {
  it('scoreColor returns a string', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(60)).toBe('string')
    expect(typeof scoreColor(40)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('gradeColor returns a string for each grade', () => {
    expect(typeof gradeColor('pure-tone')).toBe('string')
    expect(typeof gradeColor('clear-harmonic')).toBe('string')
    expect(typeof gradeColor('clean-note')).toBe('string')
    expect(typeof gradeColor('muffled-sound')).toBe('string')
    expect(typeof gradeColor('distorted-noise')).toBe('string')
    expect(typeof gradeColor('cacophony')).toBe('string')
    expect(typeof gradeColor('unknown')).toBe('string')
  })

  it('chordColor returns a string for each chord', () => {
    expect(typeof chordColor('perfect-chord')).toBe('string')
    expect(typeof chordColor('major-triad')).toBe('string')
    expect(typeof chordColor('minor-triad')).toBe('string')
    expect(typeof chordColor('power-chord')).toBe('string')
    expect(typeof chordColor('broken-chord')).toBe('string')
    expect(typeof chordColor('discord')).toBe('string')
    expect(typeof chordColor('unknown')).toBe('string')
  })

  it('seriesColor returns a string for each series', () => {
    expect(typeof seriesColor('full-harmonic-series')).toBe('string')
    expect(typeof seriesColor('rich-overtones')).toBe('string')
    expect(typeof seriesColor('proper-overtones')).toBe('string')
    expect(typeof seriesColor('thin-tone')).toBe('string')
    expect(typeof seriesColor('flat-note')).toBe('string')
    expect(typeof seriesColor('dead-tone')).toBe('string')
    expect(typeof seriesColor('unknown')).toBe('string')
  })

  it('shapeColor returns a string for each shape', () => {
    expect(typeof shapeColor('perfect-sine')).toBe('string')
    expect(typeof shapeColor('clean-wave')).toBe('string')
    expect(typeof shapeColor('proper-waveform')).toBe('string')
    expect(typeof shapeColor('distorted-wave')).toBe('string')
    expect(typeof shapeColor('noisy-signal')).toBe('string')
    expect(typeof shapeColor('static')).toBe('string')
    expect(typeof shapeColor('unknown')).toBe('string')
  })

  it('spectrumColor returns a string for each spectrum', () => {
    expect(typeof spectrumColor('full-spectrum')).toBe('string')
    expect(typeof spectrumColor('wide-band')).toBe('string')
    expect(typeof spectrumColor('proper-band')).toBe('string')
    expect(typeof spectrumColor('narrow-band')).toBe('string')
    expect(typeof spectrumColor('single-tone')).toBe('string')
    expect(typeof spectrumColor('white-noise')).toBe('string')
    expect(typeof spectrumColor('unknown')).toBe('string')
  })

  it('conditionColor returns a string for each condition', () => {
    expect(typeof conditionColor('pure-resonance')).toBe('string')
    expect(typeof conditionColor('harmonic-balance')).toBe('string')
    expect(typeof conditionColor('clean-tone')).toBe('string')
    expect(typeof conditionColor('muffled-sound')).toBe('string')
    expect(typeof conditionColor('distorted')).toBe('string')
    expect(typeof conditionColor('noise-floor')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
  })

  it('conductorGradeColor returns a string for each grade', () => {
    expect(typeof conductorGradeColor('maestro')).toBe('string')
    expect(typeof conductorGradeColor('virtuoso')).toBe('string')
    expect(typeof conductorGradeColor('concert-master')).toBe('string')
    expect(typeof conductorGradeColor('section-player')).toBe('string')
    expect(typeof conductorGradeColor('student-musician')).toBe('string')
    expect(typeof conductorGradeColor('tone-deaf')).toBe('string')
    expect(typeof conductorGradeColor('unknown')).toBe('string')
  })

  it('formatSpectralHarmonicsJson returns valid JSON', () => {
    const result = buildSpectralHarmonicsResult(['rich.ts'], [RICH])
    const json = formatSpectralHarmonicsJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.waves).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formatSpectralHarmonicsTable returns string with section headers', () => {
    const result = buildSpectralHarmonicsResult(['rich.ts'], [RICH])
    const table = formatSpectralHarmonicsTable(result, false)
    expect(table).toContain('Spectral Harmonics Analysis')
    expect(table).toContain('Spectrum:')
    expect(table).toContain('Statistics:')
    expect(table).toContain('Highlights:')
    expect(typeof table).toBe('string')
  })

  it('formatSpectralHarmonicsTable with verbose shows per-file waves', () => {
    const result = buildSpectralHarmonicsResult(['rich.ts'], [RICH])
    const table = formatSpectralHarmonicsTable(result, true)
    expect(table).toContain('Per-File Waves:')
    expect(table).toContain('rich.ts')
  })

  it('formatSpectralHarmonicsTable shows recommendations', () => {
    const result = buildSpectralHarmonicsResult(['rich.ts'], [RICH])
    const table = formatSpectralHarmonicsTable(result, false)
    expect(table).toContain('Recommendations:')
  })

  it('formatSpectralHarmonicsTable shows condition counts', () => {
    const result = buildSpectralHarmonicsResult(
      ['rich.ts', 'minimal.ts'],
      [RICH, MINIMAL],
    )
    const table = formatSpectralHarmonicsTable(result, false)
    expect(table).toContain('Condition Counts:')
    expect(table).toContain('Pure Resonance:')
    expect(table).toContain('Noise Floor:')
  })

  it('formatSpectralHarmonicsTable handles empty result', () => {
    const result = buildSpectralHarmonicsResult([], [])
    const table = formatSpectralHarmonicsTable(result, false)
    expect(table).toContain('Spectral Harmonics Analysis')
    expect(table).toContain('Total Files:')
    expect(table).toContain('0')
  })
})
