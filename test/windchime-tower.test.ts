import { describe, expect, it } from 'vitest'
import {
  analyzeChimeElement,
  analyzeTowerLevel,
  buildWindchimeTowerResult,
  classifyCondition,
  classifyLevelType,
  classifyTunerGrade,
  measureAcoustic,
  measureHarmony,
  measureResilience,
  measureResonance,
  measureTone,
  measureWind,
} from '../src/commands/windchime-tower-helpers.js'
import {
  conditionColor,
  fidelityColor,
  formatWindchimeTowerJson,
  formatWindchimeTowerTable,
  gradeColor,
  levelConditionColor,
  levelTypeColor,
  pitchColor,
  scoreColor,
  sensitivityColor,
  strengthColor,
  sustainColor,
  chordColor,
} from '../src/commands/windchime-tower-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `/**
 * Module documentation
 */
import { readFileSync } from 'fs'
import type { Config } from './types'

export interface AudioOptions {
  sampleRate?: number
  channels: number
}

export type AudioFormat = 'wav' | 'mp3'

export class AudioProcessor {
  private config: Config

  constructor(config: Config) {
    this.config = config
  }

  async process(input: Buffer): Promise<Buffer> {
    try {
      const decoded = this.decode(input)
      const filtered = this.filter(decoded)
      return this.encode(filtered)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Processing failed: ' + error.message)
      }
      throw error
    }
  }

  private decode(data: Buffer): Float32Array {
    return new Float32Array(data)
  }

  private filter(data: Float32Array): Float32Array {
    return data.map((sample) => sample * 0.8)
  }

  private encode(data: Float32Array): Buffer {
    return Buffer.from(data.buffer)
  }
}

export function createProcessor(config: Config): AudioProcessor {
  return new AudioProcessor(config)
}
`

const EMPTY = ''

const MEDIUM = `import { foo } from 'bar'
export function hello() { return 42 }
const x = 'test'
if (x) { console.log('yes') }`

// ─── measureTone ───────────────────────────────────────────────────────────

describe('measureTone', () => {
  it('returns perfect-pitch for rich content', () => {
    const t = measureTone(RICH)
    expect(t.quality).toBe(100)
    expect(t.pitch).toBe('perfect-pitch')
    expect(t.hasHighQuality).toBe(true)
    expect(t.hasPureTone).toBe(true)
    expect(t.hasProperCalibration).toBe(true)
    expect(t.hasNoDissonance).toBe(true)
    expect(t.hasClearSignal).toBe(true)
    expect(t.hasNoNoise).toBe(true)
    expect(t.hasProperFrequency).toBe(true)
    expect(t.hasNoInterference).toBe(true)
    expect(t.hasCleanOutput).toBe(true)
    expect(t.hasNoDistortion).toBe(true)
    expect(t.dissonanceCount).toBe(0)
    expect(t.distortionCount).toBe(0)
  })

  it('returns dissonant for empty content', () => {
    const t = measureTone(EMPTY)
    expect(t.quality).toBe(42)
    expect(t.pitch).toBe('dissonant')
    expect(t.hasHighQuality).toBe(false)
  })

  it('returns values for medium content', () => {
    const t = measureTone(MEDIUM)
    expect(t.quality).toBe(78)
    expect(t.pitch).toBe('well-tuned')
  })
})

// ─── measureResonance ──────────────────────────────────────────────────────

describe('measureResonance', () => {
  it('returns singing-bowl for rich content', () => {
    const r = measureResonance(RICH)
    expect(r.level).toBe(90)
    expect(r.sustain).toBe('singing-bowl')
    expect(r.hasHighLevel).toBe(true)
    expect(r.hasProperSustain).toBe(true)
    expect(r.hasWideReach).toBe(true)
    expect(r.hasNoDamping).toBe(true)
    expect(r.hasHarmonics).toBe(false)
    expect(r.hasNoCancellation).toBe(true)
  })

  it('returns dull-thud for empty content', () => {
    const r = measureResonance(EMPTY)
    expect(r.level).toBe(43)
    expect(r.sustain).toBe('dull-thud')
    expect(r.hasHighLevel).toBe(false)
  })

  it('returns medium values for medium content', () => {
    const r = measureResonance(MEDIUM)
    expect(r.level).toBe(58)
  })
})

// ─── measureWind ───────────────────────────────────────────────────────────

describe('measureWind', () => {
  it('returns highly-sensitive for rich content', () => {
    const w = measureWind(RICH)
    expect(w.responsiveness).toBe(88)
    expect(w.sensitivity).toBe('highly-sensitive')
    expect(w.hasHighResponsiveness).toBe(true)
    expect(w.hasQuickResponse).toBe(false)
    expect(w.hasProperThreshold).toBe(true)
    expect(w.hasNoDeadZone).toBe(true)
    expect(w.hasAdaptive).toBe(true)
    expect(w.hasNoLag).toBe(true)
  })

  it('returns sluggish for empty content', () => {
    const w = measureWind(EMPTY)
    expect(w.responsiveness).toBe(42)
    expect(w.sensitivity).toBe('sluggish')
  })

  it('returns moderate for medium content', () => {
    const w = measureWind(MEDIUM)
    expect(w.responsiveness).toBe(47)
  })
})

// ─── measureHarmony ────────────────────────────────────────────────────────

describe('measureHarmony', () => {
  it('returns major-chord for rich content', () => {
    const h = measureHarmony(RICH)
    expect(h.level).toBe(90)
    expect(h.chord).toBe('major-chord')
    expect(h.hasHighLevel).toBe(true)
    expect(h.hasProperArrangement).toBe(true)
    expect(h.hasComplementary).toBe(true)
    expect(h.hasNoConflicting).toBe(true)
  })

  it('returns tension for empty content', () => {
    const h = measureHarmony(EMPTY)
    expect(h.level).toBe(42)
    expect(h.chord).toBe('tension')
  })

  it('returns values for medium content', () => {
    const h = measureHarmony(MEDIUM)
    expect(h.level).toBe(57)
  })
})

// ─── measureAcoustic ───────────────────────────────────────────────────────

describe('measureAcoustic', () => {
  it('returns high-fidelity for rich content', () => {
    const a = measureAcoustic(RICH)
    expect(a.clarity).toBe(90)
    expect(a.fidelity).toBe('high-fidelity')
    expect(a.hasHighClarity).toBe(true)
    expect(a.hasCleanSignal).toBe(true)
    expect(a.hasProperDynamics).toBe(true)
    expect(a.hasNoMuddying).toBe(true)
    expect(a.hasTransparent).toBe(true)
  })

  it('returns garbled for empty content', () => {
    const a = measureAcoustic(EMPTY)
    expect(a.clarity).toBe(42)
    expect(a.fidelity).toBe('garbled')
  })

  it('returns values for medium content', () => {
    const a = measureAcoustic(MEDIUM)
    expect(a.clarity).toBe(49)
  })
})

// ─── measureResilience ─────────────────────────────────────────────────────

describe('measureResilience', () => {
  it('returns titanium-chime for rich content', () => {
    const r = measureResilience(RICH)
    expect(r.level).toBe(100)
    expect(r.strength).toBe('titanium-chime')
    expect(r.hasHighLevel).toBe(true)
    expect(r.hasCorrosionResistant).toBe(true)
    expect(r.hasProperAnchoring).toBe(true)
    expect(r.hasNoFatigue).toBe(true)
    expect(r.hasWeatherProof).toBe(true)
    expect(r.hasNoBrittleness).toBe(true)
    expect(r.hasImpactResistant).toBe(true)
  })

  it('returns bamboo for empty content', () => {
    const r = measureResilience(EMPTY)
    expect(r.level).toBe(53)
    expect(r.strength).toBe('bamboo')
  })

  it('returns values for medium content', () => {
    const r = measureResilience(MEDIUM)
    expect(r.level).toBe(68)
  })
})

// ─── analyzeChimeElement ───────────────────────────────────────────────────

describe('analyzeChimeElement', () => {
  it('returns celestial-chime for rich content', () => {
    const e = analyzeChimeElement(RICH, 'r.ts')
    expect(e.file).toBe('r.ts')
    expect(e.tonalQuality).toBe(100)
    expect(e.resonance).toBe(90)
    expect(e.windResponsiveness).toBe(88)
    expect(e.structuralHarmony).toBe(90)
    expect(e.acousticClarity).toBe(90)
    expect(e.chimeResilience).toBe(100)
    expect(e.qualityScore).toBe(93)
    expect(e.condition).toBe('celestial-chime')
  })

  it('returns untuned-pipe for empty content', () => {
    const e = analyzeChimeElement(EMPTY, 'e.ts')
    expect(e.file).toBe('e.ts')
    expect(e.qualityScore).toBe(44)
    expect(e.condition).toBe('untuned-pipe')
  })

  it('returns tuned-chime for medium content', () => {
    const e = analyzeChimeElement(MEDIUM, 'm.ts')
    expect(e.qualityScore).toBe(60)
    expect(e.condition).toBe('tuned-chime')
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies based on qualityScore thresholds', () => {
    const base = analyzeChimeElement(RICH, 'r.ts')
    expect(classifyCondition({ ...base, qualityScore: 80 } as typeof base)).toBe('celestial-chime')
    expect(classifyCondition({ ...base, qualityScore: 65 } as typeof base)).toBe('masterwork-bell')
    expect(classifyCondition({ ...base, qualityScore: 50 } as typeof base)).toBe('tuned-chime')
    expect(classifyCondition({ ...base, qualityScore: 35 } as typeof base)).toBe('untuned-pipe')
    expect(classifyCondition({ ...base, qualityScore: 20 } as typeof base)).toBe('rattling-tube')
    expect(classifyCondition({ ...base, qualityScore: 10 } as typeof base)).toBe('silence')
  })
})

// ─── classifyTunerGrade ────────────────────────────────────────────────────

describe('classifyTunerGrade', () => {
  it('classifies based on avg harmony', () => {
    expect(classifyTunerGrade(80)).toBe('master-tuner')
    expect(classifyTunerGrade(65)).toBe('harmonist')
    expect(classifyTunerGrade(50)).toBe('musician')
    expect(classifyTunerGrade(35)).toBe('tuner')
    expect(classifyTunerGrade(20)).toBe('listener')
    expect(classifyTunerGrade(0)).toBe('tone-deaf')
  })
})

// ─── classifyLevelType ─────────────────────────────────────────────────────

describe('classifyLevelType', () => {
  it('returns silent for empty array', () => {
    expect(classifyLevelType([])).toBe('silent')
  })

  it('returns correct type based on avg score', () => {
    const re = analyzeChimeElement(RICH, 'r.ts')
    const me = analyzeChimeElement(MEDIUM, 'm.ts')
    expect(classifyLevelType([re, me])).toBe('cathedral-tower')
    expect(classifyLevelType([re])).toBe('cathedral-tower')
    expect(classifyLevelType([me])).toBe('bell-tower')
  })
})

// ─── analyzeTowerLevel ─────────────────────────────────────────────────────

describe('analyzeTowerLevel', () => {
  it('returns empty level for no elements', () => {
    const l = analyzeTowerLevel([], 'empty')
    expect(l.directory).toBe('empty')
    expect(l.elements).toEqual([])
    expect(l.avgTone).toBe(0)
    expect(l.levelType).toBe('silent')
    expect(l.condition).toBe('silence')
  })

  it('returns correct level for rich + medium', () => {
    const re = analyzeChimeElement(RICH, 'r.ts')
    const me = analyzeChimeElement(MEDIUM, 'm.ts')
    const l = analyzeTowerLevel([re, me], 'src')
    expect(l.avgTone).toBe(89)
    expect(l.avgHarmony).toBe(74)
    expect(l.avgResilience).toBe(84)
    expect(l.celestialCount).toBe(1)
    expect(l.silenceCount).toBe(0)
    expect(l.tunedCount).toBe(1)
    expect(l.levelType).toBe('cathedral-tower')
    expect(l.condition).toBe('symphony-hall')
  })
})

// ─── buildWindchimeTowerResult ─────────────────────────────────────────────

describe('buildWindchimeTowerResult', () => {
  it('handles empty input', () => {
    const r = buildWindchimeTowerResult([], [])
    expect(r.elements).toEqual([])
    expect(r.levels).toEqual([])
    expect(r.tower.overallHarmony).toBe(0)
    expect(r.tower.isHarmonious).toBe(false)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.tunerGrade).toBe('tone-deaf')
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('returns correct result for rich + medium', () => {
    const r = buildWindchimeTowerResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(r.elements.length).toBe(2)
    expect(r.tower.avgTone).toBe(89)
    expect(r.tower.avgHarmony).toBe(74)
    expect(r.tower.avgResilience).toBe(84)
    expect(r.tower.isHarmonious).toBe(true)
    expect(r.tower.overallHarmony).toBe(77)
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgTonalQuality).toBe(89)
    expect(r.stats.avgResonance).toBe(74)
    expect(r.stats.avgWindResponsiveness).toBe(68)
    expect(r.stats.avgStructuralHarmony).toBe(74)
    expect(r.stats.avgAcousticClarity).toBe(70)
    expect(r.stats.avgChimeResilience).toBe(84)
    expect(r.stats.celestialChimeCount).toBe(1)
    expect(r.stats.masterworkBellCount).toBe(0)
    expect(r.stats.tunedChimeCount).toBe(1)
    expect(r.stats.silenceCount).toBe(0)
    expect(r.stats.hasHighToneCount).toBe(2)
    expect(r.stats.hasHighResonanceCount).toBe(1)
    expect(r.stats.hasHighResponsivenessCount).toBe(1)
    expect(r.stats.hasHighHarmonyCount).toBe(1)
    expect(r.stats.hasHighClarityCount).toBe(1)
    expect(r.stats.hasHighResilienceCount).toBe(1)
    expect(r.stats.tunerGrade).toBe('harmonist')
    expect(r.stats.bestElement).toBe('r.ts')
    expect(r.stats.bestTone).toBe('r.ts')
    expect(r.stats.mostResonant).toBe('r.ts')
    expect(r.stats.mostResponsive).toBe('r.ts')
    expect(r.stats.mostHarmonious).toBe('r.ts')
    expect(r.stats.clearest).toBe('r.ts')
  })

  it('generates recommendations for low scores', () => {
    const r = buildWindchimeTowerResult(['e.ts'], [EMPTY])
    expect(r.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string for all levels', () => {
    expect(scoreColor(90)).toContain('90')
    expect(scoreColor(70)).toContain('70')
    expect(scoreColor(50)).toContain('50')
    expect(scoreColor(20)).toContain('20')
  })

  it('conditionColor returns colored string', () => {
    expect(conditionColor('celestial-chime')).toContain('celestial-chime')
    expect(conditionColor('masterwork-bell')).toContain('masterwork-bell')
    expect(conditionColor('silence')).toContain('silence')
  })

  it('gradeColor returns colored string', () => {
    expect(gradeColor('master-tuner')).toContain('master-tuner')
    expect(gradeColor('tone-deaf')).toContain('tone-deaf')
  })

  it('pitchColor returns colored string', () => {
    expect(pitchColor('perfect-pitch')).toContain('perfect-pitch')
    expect(pitchColor('cacophony')).toContain('cacophony')
  })

  it('sustainColor returns colored string', () => {
    expect(sustainColor('singing-bowl')).toContain('singing-bowl')
    expect(sustainColor('dead')).toContain('dead')
  })

  it('sensitivityColor returns colored string', () => {
    expect(sensitivityColor('gossamer')).toContain('gossamer')
    expect(sensitivityColor('unresponsive')).toContain('unresponsive')
  })

  it('chordColor returns colored string', () => {
    expect(chordColor('major-chord')).toContain('major-chord')
    expect(chordColor('discord')).toContain('discord')
  })

  it('fidelityColor returns colored string', () => {
    expect(fidelityColor('high-fidelity')).toContain('high-fidelity')
    expect(fidelityColor('static')).toContain('static')
  })

  it('strengthColor returns colored string', () => {
    expect(strengthColor('titanium-chime')).toContain('titanium-chime')
    expect(strengthColor('glass-shard')).toContain('glass-shard')
  })

  it('levelTypeColor returns colored string', () => {
    expect(levelTypeColor('cathedral-tower')).toContain('cathedral-tower')
    expect(levelTypeColor('silent')).toContain('silent')
  })

  it('levelConditionColor returns colored string', () => {
    expect(levelConditionColor('symphony-hall')).toContain('symphony-hall')
    expect(levelConditionColor('broken')).toContain('broken')
  })

  it('formatWindchimeTowerJson returns valid JSON', () => {
    const r = buildWindchimeTowerResult(['r.ts'], [RICH])
    const json = formatWindchimeTowerJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.elements.length).toBe(1)
    expect(parsed.tower.overallHarmony).toBeGreaterThan(0)
  })

  it('formatWindchimeTowerTable includes overview', () => {
    const r = buildWindchimeTowerResult(['r.ts'], [RICH])
    const table = formatWindchimeTowerTable(r, false)
    expect(table).toContain('Windchime Tower Analysis')
    expect(table).toContain('Overall Harmony')
    expect(table).toContain('Tuner Grade')
  })

  it('formatWindchimeTowerTable includes per-file when verbose', () => {
    const r = buildWindchimeTowerResult(['r.ts'], [RICH])
    const table = formatWindchimeTowerTable(r, true)
    expect(table).toContain('Per-File Details')
  })

  it('formatWindchimeTowerTable omits per-file when not verbose', () => {
    const r = buildWindchimeTowerResult(['r.ts'], [RICH])
    const table = formatWindchimeTowerTable(r, false)
    expect(table).not.toContain('Per-File Details')
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('detects any types as dissonance', () => {
    const badContent = 'const x: any = 1\nconst y: any = 2'
    const t = measureTone(badContent)
    expect(t.hasNoDissonance).toBe(false)
    expect(t.dissonanceCount).toBe(2)
  })

  it('detects eval as dissonance', () => {
    const badContent = 'eval("code")'
    const t = measureTone(badContent)
    expect(t.hasNoDissonance).toBe(false)
    expect(t.dissonanceCount).toBe(1)
  })

  it('detects HACK as noise', () => {
    const hackContent = '// HACK: workaround'
    const t = measureTone(hackContent)
    expect(t.hasNoNoise).toBe(false)
  })

  it('detects TODO in resonance absorption', () => {
    const todoContent = '// TODO: fix this\n// FIXME: broken'
    const r = measureResonance(todoContent)
    expect(r.hasNoAbsorption).toBe(false)
    expect(r.absorptionCount).toBe(2)
  })

  it('detects console in wind saturation', () => {
    const consoleContent = "console.log('hello')"
    const w = measureWind(consoleContent)
    expect(w.hasNoSaturation).toBe(false)
    expect(w.saturationCount).toBe(1)
  })

  it('detects empty catch as distortion', () => {
    const badContent = 'try {} catch (e) {}'
    const t = measureTone(badContent)
    expect(t.hasNoDistortion).toBe(false)
    expect(t.distortionCount).toBe(1)
  })

  it('detects deprecated in acoustic artifacts', () => {
    const depContent = '/** @deprecated */ function old() {}'
    const a = measureAcoustic(depContent)
    expect(a.hasNoArtifacts).toBe(false)
    expect(a.artifactCount).toBe(1)
  })

  it('empty catch in resilience cracking', () => {
    const badContent = 'try {} catch (e) {}'
    const r = measureResilience(badContent)
    expect(r.hasNoCracking).toBe(false)
    expect(r.crackingCount).toBe(1)
  })

  it('nested ternary detected in wind lag', () => {
    const lagContent = 'const x = a ? b ? c : d : e'
    const w = measureWind(lagContent)
    expect(w.hasNoLag).toBe(true)
  })

  it('medium content resonance sustain', () => {
    const r = measureResonance(MEDIUM)
    expect(r.sustain).toBe('dull-thud')
  })

  it('medium content acoustic fidelity', () => {
    const a = measureAcoustic(MEDIUM)
    expect(a.fidelity).toBe('garbled')
  })

  it('medium content wind sensitivity', () => {
    const w = measureWind(MEDIUM)
    expect(w.sensitivity).toBe('sluggish')
  })

  it('empty content has default booleans', () => {
    const t = measureTone(EMPTY)
    expect(t.hasNoDissonance).toBe(true)
    expect(t.hasNoNoise).toBe(true)
    expect(t.hasNoInterference).toBe(true)
    expect(t.hasNoDistortion).toBe(true)
  })

  it('empty content resonance defaults', () => {
    const r = measureResonance(EMPTY)
    expect(r.hasNoDamping).toBe(true)
    expect(r.hasNoAbsorption).toBe(true)
    expect(r.hasNoCancellation).toBe(true)
  })

  it('empty content wind defaults', () => {
    const w = measureWind(EMPTY)
    expect(w.hasNoDeadZone).toBe(true)
    expect(w.hasNoLag).toBe(true)
    expect(w.hasNoSaturation).toBe(true)
    expect(w.hasNoOverreaction).toBe(true)
  })

  it('empty content harmony defaults', () => {
    const h = measureHarmony(EMPTY)
    expect(h.hasNoConflicting).toBe(true)
    expect(h.hasNoClashing).toBe(true)
    expect(h.hasNoDisruption).toBe(true)
    expect(h.hasNoJarring).toBe(true)
  })

  it('empty content acoustic defaults', () => {
    const a = measureAcoustic(EMPTY)
    expect(a.hasNoMuddying).toBe(true)
    expect(a.hasNoObfuscation).toBe(true)
  })

  it('empty content resilience defaults', () => {
    const r = measureResilience(EMPTY)
    expect(r.hasCorrosionResistant).toBe(true)
    expect(r.hasNoFatigue).toBe(true)
    expect(r.hasNoBrittleness).toBe(true)
    expect(r.hasNoDegradation).toBe(true)
  })

  it('detects console as acoustic over-compression', () => {
    const consoleContent = "console.log('x')"
    const a = measureAcoustic(consoleContent)
    expect(a.hasNoOverCompression).toBe(false)
  })

  it('medium content harmony chord', () => {
    const h = measureHarmony(MEDIUM)
    expect(h.chord).toBe('tension')
  })

  it('medium content resilience strength', () => {
    const r = measureResilience(MEDIUM)
    expect(r.strength).toBe('bamboo')
  })
})
