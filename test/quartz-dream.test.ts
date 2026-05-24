import { describe, it, expect } from 'vitest'
import {
  measureClarifying,
  measureResonating,
  measureVibrating,
  measureSplitting,
  measureTuning,
  classifySpanCondition,
  classifyDreamType,
  classifyDreamCondition,
  classifyTunerGrade,
  analyzeQuartzVibration,
  analyzeCrystalDream,
  buildQuartzDreamResult,
  generateRecommendations,
} from '../src/commands/quartz-dream-helpers.js'
import {
  colorScore,
  colorGrade,
  formatVibrationTable,
  formatVibrationsTable,
  formatDreamTable,
  formatDreamsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/quartz-dream-format-helpers.js'
import type {
  QuartzVibration,
  QuartzDreamStats,
  QuartzDreamResult,
  QuartzSpectrum,
} from '../src/commands/quartz-dream-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const emptyContent = ''

const minimalContent = `const x = 1`

const moderateContent = `
import { foo } from 'bar'
export interface User {
  name: string
  age: number
}
export type UserRole = 'admin' | 'user'
export function getUser(id: string): User | null {
  if (id === '1') return { name: 'test', age: 20 }
  return null
}
const users: User[] = []
`

const richContent = `
import { z } from 'zod'
import type { Config } from './config.js'

/**
 * User configuration interface
 */
export interface UserConfig {
  readonly name: string
  readonly age: number
  readonly role: UserRole
  nickname?: string
}

export type UserRole = 'admin' | 'user' | 'moderator'
export type Maybe<T> = T | null

/**
 * Create a new user with validation
 */
export async function createUser(input: string): Promise<UserConfig> {
  const config: Config = JSON.parse(input)
  if (config.name === undefined || config.name === null) {
    throw new Error('Name required')
  }
  try {
    const result = await validateConfig(config)
    return result ?? defaultValue()
  } catch (error) {
    return handleDefault(config)
  }
}

export function handleDefault(config: Config): UserConfig {
  return config ?? { name: 'default', age: 0, role: 'user' }
}

export function defaultValue(): UserConfig {
  return { name: 'default', age: 0, role: 'user' }
}

enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}

switch (status) {
  case Status.Active:
    break
  case Status.Inactive:
    break
  default:
    break
}

const filtered = users.filter(u => u.age > 18).map(u => u.name)
const total = users.reduce((sum, u) => sum + u.age, 0)
`

const poorContent = `var x = 1; var y = 2; any; eval("test"); debugger;`

// ─── measureClarifying ────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 clarity for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.grade).toBe('opaque')
    expect(m.hasHighClarity).toBe(false)
  })

  it('returns low clarity for minimal content', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
  })

  it('returns moderate clarity for moderate content', () => {
    const m = measureClarifying(moderateContent)
    expect(m.clarity).toBeGreaterThan(30)
    expect(m.hasReadable).toBe(true)
    expect(m.hasOrganized).toBe(true)
  })

  it('returns high clarity for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(70)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasClear).toBe(true)
  })

  it('detects obfuscated code', () => {
    const m = measureClarifying(poorContent)
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('detects cryptic code', () => {
    const m = measureClarifying(poorContent)
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('classifies grade correctly', () => {
    expect(measureClarifying(richContent).grade).not.toBe('opaque')
    expect(measureClarifying(emptyContent).grade).toBe('opaque')
  })
})

// ─── measureResonating ────────────────────────────────────────────

describe('measureResonating', () => {
  it('returns 0 purity for empty content', () => {
    const m = measureResonating(emptyContent)
    expect(m.purity).toBe(0)
    expect(m.resonance).toBe('silence')
    expect(m.hasHighPurity).toBe(false)
  })

  it('detects high signal in moderate content', () => {
    const m = measureResonating(moderateContent)
    expect(m.hasHighSignal).toBe(true)
    expect(m.hasPurposeful).toBe(true)
  })

  it('detects dead code in poor content', () => {
    const m = measureResonating(poorContent)
    expect(m.deadCodeCount).toBeGreaterThan(0)
    expect(m.hasNoDeadCode).toBe(false)
    expect(m.fillerCount).toBeGreaterThan(0)
    expect(m.hasNoFiller).toBe(false)
  })

  it('detects essential code in rich content', () => {
    const m = measureResonating(richContent)
    expect(m.hasEssential).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasFocused).toBe(true)
  })

  it('classifies resonance correctly', () => {
    expect(measureResonating(emptyContent).resonance).toBe('silence')
    expect(measureResonating(richContent).resonance).not.toBe('silence')
  })

  it('detects low noise', () => {
    const m = measureResonating(richContent)
    expect(m.hasLowNoise).toBe(true)
  })
})

// ─── measureVibrating ─────────────────────────────────────────────

describe('measureVibrating', () => {
  it('returns 0 quality for empty content', () => {
    const m = measureVibrating(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.vibration).toBe('flatline')
    expect(m.hasHighQuality).toBe(false)
  })

  it('detects optimized patterns in rich content', () => {
    const m = measureVibrating(richContent)
    expect(m.hasOptimized).toBe(true)
    expect(m.hasEfficient).toBe(true)
  })

  it('detects rhythmic patterns in rich content', () => {
    const m = measureVibrating(richContent)
    expect(m.hasRhythmic).toBe(true)
    expect(m.hasSmooth).toBe(true)
  })

  it('detects wasteful code in poor content', () => {
    const m = measureVibrating(poorContent)
    expect(m.wastefulCount).toBeGreaterThan(0)
    expect(m.hasNoWasteful).toBe(false)
    expect(m.sluggishCount).toBeGreaterThan(0)
    expect(m.hasNoSluggish).toBe(false)
  })

  it('classifies vibration correctly', () => {
    expect(measureVibrating(emptyContent).vibration).toBe('flatline')
    expect(measureVibrating(richContent).vibration).not.toBe('flatline')
  })

  it('detects performant patterns', () => {
    const m = measureVibrating(moderateContent)
    expect(m.hasConsistent).toBe(true)
  })
})

// ─── measureSplitting ─────────────────────────────────────────────

describe('measureSplitting', () => {
  it('returns 0 diversity for empty content', () => {
    const m = measureSplitting(emptyContent)
    expect(m.diversity).toBe(0)
    expect(m.prism).toBe('no-prism')
    expect(m.hasHighDiversity).toBe(false)
  })

  it('detects type handling in rich content', () => {
    const m = measureSplitting(richContent)
    expect(m.hasTypeHandling).toBe(true)
    expect(m.hasCaseCoverage).toBe(true)
  })

  it('detects polymorphic patterns in rich content', () => {
    const m = measureSplitting(richContent)
    expect(m.hasPolymorphic).toBe(true)
    expect(m.hasGeneric).toBe(true)
  })

  it('detects adaptive patterns in rich content', () => {
    const m = measureSplitting(richContent)
    expect(m.hasAdaptive).toBe(true)
    expect(m.hasFlexible).toBe(true)
  })

  it('detects single path in poor content', () => {
    const m = measureSplitting(poorContent)
    expect(m.singlePathCount).toBeGreaterThan(0)
    expect(m.hasNoSinglePath).toBe(false)
  })

  it('classifies prism correctly', () => {
    expect(measureSplitting(emptyContent).prism).toBe('no-prism')
    expect(measureSplitting(richContent).prism).not.toBe('no-prism')
  })
})

// ─── measureTuning ────────────────────────────────────────────────

describe('measureTuning', () => {
  it('returns 0 precision for empty content', () => {
    const m = measureTuning(emptyContent)
    expect(m.precision).toBe(0)
    expect(m.tuning).toBe('no-tuning')
    expect(m.hasHighPrecision).toBe(false)
  })

  it('detects accurate config in moderate content', () => {
    const m = measureTuning(moderateContent)
    expect(m.hasAccurateConfig).toBe(true)
  })

  it('detects configurable patterns in rich content', () => {
    const m = measureTuning(richContent)
    expect(m.hasConfigurable).toBe(true)
    expect(m.hasParameterized).toBe(true)
  })

  it('detects hardcoded values in poor content', () => {
    const m = measureTuning(poorContent)
    expect(m.hardcodedCount).toBeGreaterThan(0)
    expect(m.hasNoHardcoded).toBe(false)
  })

  it('detects magic numbers in poor content', () => {
    const m = measureTuning(poorContent)
    expect(m.magicNumberCount).toBeGreaterThan(0)
    expect(m.hasNoMagicNumbers).toBe(false)
  })

  it('classifies tuning correctly', () => {
    expect(measureTuning(emptyContent).tuning).toBe('no-tuning')
    expect(measureTuning(richContent).tuning).not.toBe('no-tuning')
  })

  it('detects precise patterns in rich content', () => {
    const m = measureTuning(richContent)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasConstants).toBe(true)
  })
})

// ─── classifySpanCondition ────────────────────────────────────────

describe('classifySpanCondition', () => {
  it('classifies master-crystal', () => {
    expect(classifySpanCondition(90)).toBe('master-crystal')
    expect(classifySpanCondition(85)).toBe('master-crystal')
  })

  it('classifies tuned-quartz', () => {
    expect(classifySpanCondition(75)).toBe('tuned-quartz')
    expect(classifySpanCondition(70)).toBe('tuned-quartz')
  })

  it('classifies proper-crystal', () => {
    expect(classifySpanCondition(60)).toBe('proper-crystal')
    expect(classifySpanCondition(55)).toBe('proper-crystal')
  })

  it('classifies cloudy-quartz', () => {
    expect(classifySpanCondition(45)).toBe('cloudy-quartz')
    expect(classifySpanCondition(40)).toBe('cloudy-quartz')
  })

  it('classifies cracked-crystal', () => {
    expect(classifySpanCondition(30)).toBe('cracked-crystal')
    expect(classifySpanCondition(25)).toBe('cracked-crystal')
  })

  it('classifies dust', () => {
    expect(classifySpanCondition(15)).toBe('dust')
    expect(classifySpanCondition(0)).toBe('dust')
  })
})

// ─── classifyDreamType ────────────────────────────────────────────

describe('classifyDreamType', () => {
  it('returns no-dream for empty vibrations', () => {
    expect(classifyDreamType([])).toBe('no-dream')
  })

  it('returns crystal-cathedral for high quality vibrations', () => {
    const vibes: QuartzVibration[] = Array.from({ length: 5 }, (_, i) => ({
      file: `f${i}.ts`, crystallineClarity: 90, resonancePurity: 90,
      vibrationQuality: 90, prismDiversity: 90, tuningPrecision: 90,
      clarifying: {} as any, resonating: {} as any, vibrating: {} as any,
      splitting: {} as any, tuning: {} as any,
      condition: 'master-crystal', qualityScore: 90,
    }))
    expect(classifyDreamType(vibes)).toBe('crystal-cathedral')
  })

  it('returns no-dream for low quality vibrations', () => {
    const vibes: QuartzVibration[] = Array.from({ length: 3 }, (_, i) => ({
      file: `f${i}.ts`, crystallineClarity: 5, resonancePurity: 5,
      vibrationQuality: 5, prismDiversity: 5, tuningPrecision: 5,
      clarifying: {} as any, resonating: {} as any, vibrating: {} as any,
      splitting: {} as any, tuning: {} as any,
      condition: 'dust', qualityScore: 5,
    }))
    expect(classifyDreamType(vibes)).toBe('no-dream')
  })
})

// ─── classifyDreamCondition ───────────────────────────────────────

describe('classifyDreamCondition', () => {
  it('classifies transcendent-dream', () => {
    expect(classifyDreamCondition(80)).toBe('transcendent-dream')
  })

  it('classifies beautiful-vision', () => {
    expect(classifyDreamCondition(65)).toBe('beautiful-vision')
  })

  it('classifies decent-dream', () => {
    expect(classifyDreamCondition(50)).toBe('decent-dream')
  })

  it('classifies fuzzy-dream', () => {
    expect(classifyDreamCondition(35)).toBe('fuzzy-dream')
  })

  it('classifies nightmare', () => {
    expect(classifyDreamCondition(20)).toBe('nightmare')
  })

  it('classifies void', () => {
    expect(classifyDreamCondition(5)).toBe('void')
  })
})

// ─── classifyTunerGrade ───────────────────────────────────────────

describe('classifyTunerGrade', () => {
  it('classifies crystal-master', () => {
    expect(classifyTunerGrade(85)).toBe('crystal-master')
    expect(classifyTunerGrade(80)).toBe('crystal-master')
  })

  it('classifies expert-tuner', () => {
    expect(classifyTunerGrade(70)).toBe('expert-tuner')
    expect(classifyTunerGrade(65)).toBe('expert-tuner')
  })

  it('classifies skilled-resonator', () => {
    expect(classifyTunerGrade(55)).toBe('skilled-resonator')
    expect(classifyTunerGrade(50)).toBe('skilled-resonator')
  })

  it('classifies apprentice', () => {
    expect(classifyTunerGrade(40)).toBe('apprentice')
    expect(classifyTunerGrade(35)).toBe('apprentice')
  })

  it('classifies novice', () => {
    expect(classifyTunerGrade(25)).toBe('novice')
    expect(classifyTunerGrade(20)).toBe('novice')
  })

  it('classifies dissonant', () => {
    expect(classifyTunerGrade(10)).toBe('dissonant')
    expect(classifyTunerGrade(0)).toBe('dissonant')
  })
})

// ─── analyzeQuartzVibration ───────────────────────────────────────

describe('analyzeQuartzVibration', () => {
  it('returns a complete vibration object', () => {
    const v = analyzeQuartzVibration(moderateContent, 'test.ts')
    expect(v.file).toBe('test.ts')
    expect(v.crystallineClarity).toBeGreaterThan(0)
    expect(v.resonancePurity).toBeGreaterThan(0)
    expect(v.vibrationQuality).toBeGreaterThanOrEqual(0)
    expect(v.prismDiversity).toBeGreaterThanOrEqual(0)
    expect(v.tuningPrecision).toBeGreaterThan(0)
    expect(v.qualityScore).toBeGreaterThan(0)
    expect(v.condition).toBeDefined()
  })

  it('includes all measure objects', () => {
    const v = analyzeQuartzVibration(richContent, 'rich.ts')
    expect(v.clarifying).toBeDefined()
    expect(v.resonating).toBeDefined()
    expect(v.vibrating).toBeDefined()
    expect(v.splitting).toBeDefined()
    expect(v.tuning).toBeDefined()
  })

  it('handles empty content', () => {
    const v = analyzeQuartzVibration(emptyContent, 'empty.ts')
    expect(v.qualityScore).toBe(0)
    expect(v.condition).toBe('dust')
  })

  it('computes quality score as average of 5 measures', () => {
    const v = analyzeQuartzVibration(richContent, 'rich.ts')
    const expected = Math.round(
      v.crystallineClarity * 0.2 +
      v.resonancePurity * 0.2 +
      v.vibrationQuality * 0.2 +
      v.prismDiversity * 0.2 +
      v.tuningPrecision * 0.2,
    )
    expect(v.qualityScore).toBe(expected)
  })
})

// ─── analyzeCrystalDream ─────────────────────────────────────────

describe('analyzeCrystalDream', () => {
  it('returns empty dream for no vibrations', () => {
    const d = analyzeCrystalDream([], 'empty-dir')
    expect(d.directory).toBe('empty-dir')
    expect(d.vibrations).toEqual([])
    expect(d.avgClarity).toBe(0)
    expect(d.dreamType).toBe('no-dream')
    expect(d.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const v1 = analyzeQuartzVibration(richContent, 'rich.ts')
    const v2 = analyzeQuartzVibration(moderateContent, 'mod.ts')
    const d = analyzeCrystalDream([v1, v2], 'src')
    expect(d.avgClarity).toBe(Math.round((v1.crystallineClarity + v2.crystallineClarity) / 2))
    expect(d.avgPurity).toBe(Math.round((v1.resonancePurity + v2.resonancePurity) / 2))
    expect(d.avgPrecision).toBe(Math.round((v1.tuningPrecision + v2.tuningPrecision) / 2))
  })

  it('counts master crystals and dust', () => {
    const v1 = analyzeQuartzVibration(richContent, 'rich.ts')
    const v2 = analyzeQuartzVibration(emptyContent, 'empty.ts')
    const d = analyzeCrystalDream([v1, v2], 'mixed')
    expect(d.masterCrystalCount + d.dustCount).toBeLessThanOrEqual(2)
  })

  it('classifies dream type based on vibrations', () => {
    const d = analyzeCrystalDream([analyzeQuartzVibration(richContent, 'r.ts')], 'src')
    expect(d.dreamType).not.toBe('no-dream')
  })
})

// ─── buildQuartzDreamResult ───────────────────────────────────────

describe('buildQuartzDreamResult', () => {
  it('returns a complete result for multiple files', async () => {
    const result = await buildQuartzDreamResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    expect(result.vibrations).toHaveLength(2)
    expect(result.dreams).toHaveLength(1)
    expect(result.spectrum).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildQuartzDreamResult([], [])
    expect(result.vibrations).toHaveLength(0)
    expect(result.dreams).toHaveLength(0)
    expect(result.spectrum.overallResonance).toBe(0)
    expect(result.spectrum.isTranscendent).toBe(false)
    expect(result.stats.tunerGrade).toBe('dissonant')
  })

  it('computes spectrum correctly', async () => {
    const result = await buildQuartzDreamResult(
      ['rich.ts', 'mod.ts'],
      [richContent, moderateContent],
    )
    expect(result.spectrum.avgClarity).toBeGreaterThan(0)
    expect(result.spectrum.avgPurity).toBeGreaterThan(0)
    expect(result.spectrum.avgPrecision).toBeGreaterThan(0)
    expect(result.spectrum.overallResonance).toBeGreaterThan(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildQuartzDreamResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalDreams).toBe(1)
    expect(result.stats.bestVibration).toBeDefined()
    expect(result.stats.clearest).toBeDefined()
    expect(result.stats.purest).toBeDefined()
    expect(result.stats.bestRhythm).toBeDefined()
    expect(result.stats.mostDiverse).toBeDefined()
  })

  it('groups vibrations by directory', async () => {
    const result = await buildQuartzDreamResult(
      ['src/a.ts', 'test/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.dreams).toHaveLength(2)
  })

  it('tracks high count metrics', async () => {
    const result = await buildQuartzDreamResult(
      ['rich.ts'],
      [richContent],
    )
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPurityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighQualityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighDiversityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
  })

  it('tracks condition counts', async () => {
    const result = await buildQuartzDreamResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.masterCrystalCount + result.stats.tunedQuartzCount +
      result.stats.properCrystalCount + result.stats.cloudyQuartzCount +
      result.stats.crackedCrystalCount + result.stats.dustCount).toBe(2)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns success message for high quality', () => {
    const vibes = [analyzeQuartzVibration(richContent, 'r.ts')]
    const dreams = [analyzeCrystalDream(vibes, 'src')]
    const spectrum: QuartzSpectrum = {
      avgClarity: 90, avgPurity: 90, avgPrecision: 90,
      isTranscendent: true, overallResonance: 90,
    }
    const stats: Partial<QuartzDreamStats> = {
      avgCrystallineClarity: 90, avgResonancePurity: 90, avgVibrationQuality: 90,
      avgPrismDiversity: 90, avgTuningPrecision: 90, dustCount: 0,
      overallResonance: 90,
    }
    const recs = generateRecommendations(vibes, dreams, spectrum, stats as QuartzDreamStats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('crystal master')
  })

  it('returns low clarity recommendation', () => {
    const stats: Partial<QuartzDreamStats> = {
      avgCrystallineClarity: 30, avgResonancePurity: 60, avgVibrationQuality: 60,
      avgPrismDiversity: 60, avgTuningPrecision: 60, dustCount: 0,
      overallResonance: 60,
    }
    const recs = generateRecommendations([], [], { avgClarity: 30, avgPurity: 60, avgPrecision: 60, isTranscendent: false, overallResonance: 60 }, stats as QuartzDreamStats)
    expect(recs.some(r => r.includes('crystalline clarity'))).toBe(true)
  })

  it('returns dust recommendation', () => {
    const stats: Partial<QuartzDreamStats> = {
      avgCrystallineClarity: 70, avgResonancePurity: 70, avgVibrationQuality: 70,
      avgPrismDiversity: 70, avgTuningPrecision: 70, dustCount: 2,
      overallResonance: 70,
    }
    const recs = generateRecommendations([], [], { avgClarity: 70, avgPurity: 70, avgPrecision: 70, isTranscendent: true, overallResonance: 70 }, stats as QuartzDreamStats)
    expect(recs.some(r => r.includes('dust'))).toBe(true)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for any grade', () => {
    expect(typeof colorGrade('master-crystal')).toBe('string')
    expect(typeof colorGrade('dust')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatVibrationTable', () => {
  it('formats a single vibration', () => {
    const v = analyzeQuartzVibration(richContent, 'test.ts')
    const output = formatVibrationTable(v)
    expect(output).toContain('test.ts')
    expect(output).toContain('Crystalline Clarity')
    expect(output).toContain('Resonance Purity')
    expect(output).toContain('Score')
  })
})

describe('formatVibrationsTable', () => {
  it('formats empty vibrations', () => {
    const output = formatVibrationsTable([])
    expect(output).toContain('No quartz vibrations')
  })

  it('formats multiple vibrations', () => {
    const vibes = [
      analyzeQuartzVibration(richContent, 'a.ts'),
      analyzeQuartzVibration(moderateContent, 'b.ts'),
    ]
    const output = formatVibrationsTable(vibes)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatDreamTable', () => {
  it('formats a dream', () => {
    const vibes = [analyzeQuartzVibration(richContent, 'a.ts')]
    const dream = analyzeCrystalDream(vibes, 'src')
    const output = formatDreamTable(dream)
    expect(output).toContain('src')
    expect(output).toContain('Type')
    expect(output).toContain('Master Crystals')
  })
})

describe('formatDreamsTable', () => {
  it('formats empty dreams', () => {
    const output = formatDreamsTable([])
    expect(output).toContain('No crystal dreams')
  })

  it('formats multiple dreams', () => {
    const d1 = analyzeCrystalDream([analyzeQuartzVibration(richContent, 'a.ts')], 'src')
    const d2 = analyzeCrystalDream([analyzeQuartzVibration(moderateContent, 'b.ts')], 'test')
    const output = formatDreamsTable([d1, d2])
    expect(output).toContain('src')
    expect(output).toContain('test')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildQuartzDreamResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Resonance')
    expect(output).toContain('Tuner Grade')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Improve clarity', 'Fix bugs'])
    expect(output).toContain('Improve clarity')
    expect(output).toContain('Fix bugs')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildQuartzDreamResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Quartz Dream Analysis')
    expect(output).toContain('Crystal Dreams')
    expect(output).toContain('Quartz Dream Statistics')
    expect(output).toContain('Spectrum')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildQuartzDreamResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.vibrations).toHaveLength(1)
    expect(parsed.spectrum).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────

describe('integration', () => {
  it('handles diverse file set', async () => {
    const result = await buildQuartzDreamResult(
      ['rich.ts', 'mod.ts', 'empty.ts', 'poor.ts'],
      [richContent, moderateContent, emptyContent, poorContent],
    )
    expect(result.vibrations).toHaveLength(4)
    expect(result.stats.totalFiles).toBe(4)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('produces consistent results for same input', async () => {
    const r1 = await buildQuartzDreamResult(['a.ts'], [richContent])
    const r2 = await buildQuartzDreamResult(['a.ts'], [richContent])
    expect(r1.stats.overallResonance).toBe(r2.stats.overallResonance)
    expect(r1.stats.tunerGrade).toBe(r2.stats.tunerGrade)
  })

  it('vibration scores are within 0-100 range', async () => {
    const result = await buildQuartzDreamResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    for (const v of result.vibrations) {
      expect(v.crystallineClarity).toBeGreaterThanOrEqual(0)
      expect(v.crystallineClarity).toBeLessThanOrEqual(100)
      expect(v.resonancePurity).toBeGreaterThanOrEqual(0)
      expect(v.resonancePurity).toBeLessThanOrEqual(100)
      expect(v.vibrationQuality).toBeGreaterThanOrEqual(0)
      expect(v.vibrationQuality).toBeLessThanOrEqual(100)
      expect(v.prismDiversity).toBeGreaterThanOrEqual(0)
      expect(v.prismDiversity).toBeLessThanOrEqual(100)
      expect(v.tuningPrecision).toBeGreaterThanOrEqual(0)
      expect(v.tuningPrecision).toBeLessThanOrEqual(100)
      expect(v.qualityScore).toBeGreaterThanOrEqual(0)
      expect(v.qualityScore).toBeLessThanOrEqual(100)
    }
  })
})
