import { describe, it, expect } from 'vitest'
import {
  measureTransmitting,
  measureOscillating,
  measureResonating,
  measureSupporting,
  measureChanneling,
  classifyCondition,
  classifySeamType,
  classifySeamCondition,
  classifyMinerGrade,
  analyzeQuartzCrystal,
  analyzeQuartzSeam,
  buildQuartzMeridianResult,
  generateRecommendations,
} from '../src/commands/quartz-meridian-helpers.js'
import {
  colorScore,
  colorCondition,
  colorSeamCondition,
  formatCrystalTable,
  formatCrystalsTable,
  formatSeamTable,
  formatSeamsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/quartz-meridian-format-helpers.js'

// ─── Test Fixtures ──────────────────────────────────────────────────

const minimalContent = 'const x = 1'

const richContent = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/** Documentation */
export interface Config {
  readonly name: string
  private?: boolean
}

export type Options = Record<string, unknown>

export class Analyzer<T> {
  async analyze(input: string): Promise<Result> {
    try {
      const result = readFileSync(input, 'utf8')
      if (result === 'test') {
        return JSON.parse(result) as Result
      }
      return {} as Result
    } catch (err) {
      throw new Error('fail')
    }
  }
}

export const defaultConfig: Options = { name: 'test' }
`

// ─── measureTransmitting ──────────────────────────────────────────

describe('measureTransmitting', () => {
  it('returns 0 for empty content', () => {
    const m = measureTransmitting('')
    expect(m.clarity).toBe(0)
    expect(m.crystal).toBe('no-clarity')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureTransmitting(richContent)
    expect(m.clarity).toBe(100)
    expect(m.crystal).toBe('flawless-quartz')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasDirect).toBe(true)
  })

  it('detects cryptic eval usage', () => {
    const m = measureTransmitting('eval("code")')
    expect(m.crypticCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated any usage', () => {
    const m = measureTransmitting('const x: any = 1')
    expect(m.obfuscatedCount).toBe(1)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('detects mystery patterns', () => {
    const m = measureTransmitting('// mystery magic unexplained')
    expect(m.hasNoMystery).toBe(false)
  })

  it('detects hidden ts-ignore', () => {
    const m = measureTransmitting('// @ts-ignore')
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects arcane patterns', () => {
    const m = measureTransmitting('// arcane esoteric cryptic')
    expect(m.hasNoArcane).toBe(false)
  })

  it('detects invisible patterns', () => {
    const m = measureTransmitting('// invisible hidden concealed')
    expect(m.hasNoInvisible).toBe(false)
  })

  it('detects undocumented functions', () => {
    const m = measureTransmitting('function foo() { return 1 }')
    expect(m.hasNoUndocumented).toBe(false)
  })
})

// ─── measureOscillating ──────────────────────────────────────────

describe('measureOscillating', () => {
  it('returns low score for empty content', () => {
    const m = measureOscillating('')
    expect(m.quality).toBe(0)
    expect(m.frequency).toBe('no-vibration')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureOscillating(richContent)
    expect(m.quality).toBe(100)
    expect(m.frequency).toBe('perfect-resonance')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasPredictable).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasUniform).toBe(true)
    expect(m.hasReliable).toBe(true)
    expect(m.hasHarmonious).toBe(true)
    expect(m.hasRhythmic).toBe(true)
  })

  it('detects erratic var patterns', () => {
    const m = measureOscillating('var x = 1')
    expect(m.erraticCount).toBe(1)
    expect(m.hasNoErratic).toBe(false)
  })

  it('detects surprising patterns', () => {
    const m = measureOscillating('// surprising unexpected random')
    expect(m.hasNoSurprising).toBe(false)
  })

  it('detects untested var patterns', () => {
    const m = measureOscillating('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects volatile patterns', () => {
    const m = measureOscillating('// volatile unstable changing')
    expect(m.hasNoVolatile).toBe(false)
  })

  it('detects mixed any patterns', () => {
    const m = measureOscillating('const x: any = 1')
    expect(m.hasNoMixed).toBe(false)
  })

  it('detects flaky patterns', () => {
    const m = measureOscillating('// flaky intermittent sometimes')
    expect(m.hasNoFlaky).toBe(false)
  })

  it('detects discordant patterns', () => {
    const m = measureOscillating('// discordant clashing conflicting')
    expect(m.hasNoDiscordant).toBe(false)
  })
})

// ─── measureResonating ──────────────────────────────────────────

describe('measureResonating', () => {
  it('returns score greater than 0 for empty content', () => {
    const m = measureResonating('')
    expect(m.purity).toBeGreaterThan(0)
    expect(m.hasHighPurity).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureResonating(richContent)
    expect(m.purity).toBe(100)
    expect(m.tone).toBe('pure-signal')
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasHonest).toBe(true)
    expect(m.hasPure).toBe(true)
    expect(m.hasNoContaminated).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasNoiseFree).toBe(true)
  })

  it('detects unsafe any usage', () => {
    const m = measureResonating('const x: any = 1')
    expect(m.unsafeCount).toBe(1)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects dirty patterns', () => {
    const m = measureResonating('// dirty messy hacky')
    expect(m.hasClean).toBe(false)
    expect(m.hasNoDirty).toBe(false)
  })

  it('detects wrong patterns', () => {
    const m = measureResonating('// wrong incorrect mistake')
    expect(m.hasNoWrong).toBe(false)
  })

  it('detects contradictory patterns', () => {
    const m = measureResonating('// contradict conflict clash')
    expect(m.contradictoryCount).toBe(3)
    expect(m.hasNoContradictory).toBe(false)
  })

  it('detects deceptive patterns', () => {
    const m = measureResonating('// cheat fake deceive')
    expect(m.hasNoDeceptive).toBe(false)
  })

  it('detects contaminated ts-expect-error', () => {
    const m = measureResonating('// @ts-expect-error')
    expect(m.hasNoContaminated).toBe(false)
  })

  it('detects rough patterns', () => {
    const m = measureResonating('// rough unpolished crude')
    expect(m.hasNoRough).toBe(false)
  })

  it('noise free requires no ts-ignore and no ts-expect-error', () => {
    const m = measureResonating(richContent)
    expect(m.hasNoiseFree).toBe(true)
    const m2 = measureResonating('// @ts-ignore')
    expect(m2.hasNoiseFree).toBe(false)
  })
})

// ─── measureSupporting ──────────────────────────────────────────

describe('measureSupporting', () => {
  it('returns low score for empty content', () => {
    const m = measureSupporting('')
    expect(m.strength).toBe(0)
    expect(m.lattice).toBe('no-strength')
    expect(m.hasHighStrength).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureSupporting(richContent)
    expect(m.strength).toBe(100)
    expect(m.lattice).toBe('diamond-lattice')
    expect(m.hasHighStrength).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasEnduring).toBe(true)
  })

  it('detects chaotic patterns', () => {
    const m = measureSupporting('// chaotic mess tangle')
    expect(m.chaoticCount).toBe(3)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects monolithic patterns', () => {
    const m = measureSupporting('// monolithic giant massive')
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('detects scattered patterns', () => {
    const m = measureSupporting('// scattered fragmented dispersed')
    expect(m.hasNoScattered).toBe(false)
  })

  it('detects wasteful patterns', () => {
    const m = measureSupporting('// wasteful inefficient bloated')
    expect(m.hasNoWasteful).toBe(false)
  })

  it('detects fragile var patterns', () => {
    const m = measureSupporting('var x = 1')
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects bare crash eval usage', () => {
    const m = measureSupporting('eval("code")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })
})

// ─── measureChanneling ──────────────────────────────────────────

describe('measureChanneling', () => {
  it('returns 0 for empty content', () => {
    const m = measureChanneling('')
    expect(m.wisdom).toBe(0)
    expect(m.vein).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureChanneling(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.vein).toBe('ancant-channel')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasConnected).toBe(true)
  })

  it('detects hacked patterns', () => {
    const m = measureChanneling('// hack workaround monkey')
    expect(m.hackedCount).toBe(3)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects ad hoc any usage', () => {
    const m = measureChanneling('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('detects experimental patterns', () => {
    const m = measureChanneling('// experimental beta alpha')
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects reinvented patterns', () => {
    const m = measureChanneling('// reinvent rewrote redone')
    expect(m.hasNoReinvented).toBe(false)
  })

  it('detects shallow ts-ignore', () => {
    const m = measureChanneling('// @ts-ignore')
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measureChanneling('// naive simple basic')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects obvious patterns', () => {
    const m = measureChanneling('// trivial obvious duh')
    expect(m.hasNoObvious).toBe(false)
  })
})

// ─── Classifiers ──────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies all levels', () => {
    expect(classifyCondition(90)).toBe('quartz-masterpiece')
    expect(classifyCondition(75)).toBe('crystal-vein')
    expect(classifyCondition(60)).toBe('proper-mineral')
    expect(classifyCondition(40)).toBe('dull-stone')
    expect(classifyCondition(20)).toBe('cracked-rock')
    expect(classifyCondition(0)).toBe('void')
  })
})

describe('classifySeamType', () => {
  it('returns no-seam for empty crystals', () => {
    expect(classifySeamType([])).toBe('no-seam')
  })
})

describe('classifySeamCondition', () => {
  it('classifies all levels', () => {
    expect(classifySeamCondition(85)).toBe('crystal-cathedral')
    expect(classifySeamCondition(70)).toBe('quartz-cavern')
    expect(classifySeamCondition(55)).toBe('proper-mine')
    expect(classifySeamCondition(35)).toBe('dull-tunnel')
    expect(classifySeamCondition(15)).toBe('collapsed-shaft')
    expect(classifySeamCondition(0)).toBe('void')
  })
})

describe('classifyMinerGrade', () => {
  it('classifies all levels', () => {
    expect(classifyMinerGrade(80)).toBe('crystal-master')
    expect(classifyMinerGrade(65)).toBe('vein-reader')
    expect(classifyMinerGrade(50)).toBe('stone-cutter')
    expect(classifyMinerGrade(35)).toBe('apprentice')
    expect(classifyMinerGrade(20)).toBe('novice')
    expect(classifyMinerGrade(0)).toBe('rock-basher')
  })
})

// ─── analyzeQuartzCrystal ──────────────────────────────────────────

describe('analyzeQuartzCrystal', () => {
  it('analyzes empty content', () => {
    const c = analyzeQuartzCrystal('', 'empty.ts')
    expect(c.file).toBe('empty.ts')
    expect(c.qualityScore).toBeGreaterThan(0)
    expect(c.condition).toBe('void')
  })

  it('analyzes rich content', () => {
    const c = analyzeQuartzCrystal(richContent, 'rich.ts')
    expect(c.crystallineClarity).toBe(100)
    expect(c.vibrationQuality).toBe(100)
    expect(c.resonancePurity).toBe(100)
    expect(c.structureStrength).toBe(100)
    expect(c.veinWisdom).toBe(100)
    expect(c.qualityScore).toBe(100)
    expect(c.condition).toBe('quartz-masterpiece')
  })

  it('computes qualityScore as weighted average', () => {
    const c = analyzeQuartzCrystal('export function add(): number { return 1 }', 'mid.ts')
    expect(c.qualityScore).toBeGreaterThan(0)
    expect(c.qualityScore).toBeLessThanOrEqual(100)
  })

  it('includes all measures', () => {
    const c = analyzeQuartzCrystal(richContent, 'all.ts')
    expect(c.transmitting).toBeDefined()
    expect(c.oscillating).toBeDefined()
    expect(c.resonating).toBeDefined()
    expect(c.supporting).toBeDefined()
    expect(c.channeling).toBeDefined()
  })
})

// ─── analyzeQuartzSeam ──────────────────────────────────────────

describe('analyzeQuartzSeam', () => {
  it('returns empty seam for no crystals', () => {
    const s = analyzeQuartzSeam([], 'src')
    expect(s.directory).toBe('src')
    expect(s.crystals).toHaveLength(0)
    expect(s.avgClarity).toBe(0)
    expect(s.seamType).toBe('no-seam')
    expect(s.condition).toBe('void')
  })

  it('computes averages from crystals', () => {
    const crystals = [
      analyzeQuartzCrystal(richContent, 'src/a.ts'),
      analyzeQuartzCrystal(richContent, 'src/b.ts'),
    ]
    const s = analyzeQuartzSeam(crystals, 'src')
    expect(s.avgClarity).toBe(100)
    expect(s.avgStrength).toBe(100)
    expect(s.avgWisdom).toBe(100)
    expect(s.quartzMasterpieceCount).toBe(2)
    expect(s.voidCount).toBe(0)
  })
})

// ─── buildQuartzMeridianResult ──────────────────────────────────────────

describe('buildQuartzMeridianResult', () => {
  it('handles empty input', async () => {
    const r = await buildQuartzMeridianResult([], [])
    expect(r.crystals).toHaveLength(0)
    expect(r.seams).toHaveLength(0)
    expect(r.geode.isQuartz).toBe(false)
    expect(r.stats.totalFiles).toBe(0)
  })

  it('analyzes single file', async () => {
    const r = await buildQuartzMeridianResult(['test.ts'], [richContent])
    expect(r.crystals).toHaveLength(1)
    expect(r.seams).toHaveLength(1)
    expect(r.geode.isQuartz).toBe(true)
  })

  it('groups files by directory', async () => {
    const r = await buildQuartzMeridianResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(r.crystals).toHaveLength(3)
    expect(r.seams).toHaveLength(2)
  })

  it('computes stats correctly', async () => {
    const r = await buildQuartzMeridianResult(['good.ts', 'bad.ts'], [richContent, ''])
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.overallLuminosity).toBeGreaterThan(0)
    expect(r.stats.minerGrade).toBeDefined()
  })

  it('computes high counts', async () => {
    const r = await buildQuartzMeridianResult(['a.ts'], [richContent])
    expect(r.stats.hasHighClarityCount).toBeGreaterThan(0)
    expect(r.stats.hasHighQualityCount).toBeGreaterThan(0)
    expect(r.stats.hasHighPurityCount).toBeGreaterThan(0)
    expect(r.stats.hasHighStrengthCount).toBeGreaterThan(0)
    expect(r.stats.hasHighWisdomCount).toBeGreaterThan(0)
  })

  it('finds best crystal and extremes', async () => {
    const r = await buildQuartzMeridianResult(['high.ts', 'low.ts'], [richContent, ''])
    expect(r.stats.bestCrystal).toBe('high.ts')
    expect(r.stats.clearest).toBe('high.ts')
    expect(r.stats.mostRhythmic).toBe('high.ts')
    expect(r.stats.purest).toBe('high.ts')
    expect(r.stats.strongest).toBe('high.ts')
    expect(r.stats.wisest).toBe('high.ts')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends perfection for all-100 stats', () => {
    const crystals = [analyzeQuartzCrystal(richContent, 'a.ts')]
    const seams = [analyzeQuartzSeam(crystals, '.')]
    const geode = { avgClarity: 100, avgStrength: 100, avgWisdom: 100, isQuartz: true, overallLuminosity: 100 }
    const stats = {
      totalFiles: 1, totalSeams: 1,
      avgCrystallineClarity: 100, avgVibrationQuality: 100, avgResonancePurity: 100,
      avgStructureStrength: 100, avgVeinWisdom: 100,
      quartzMasterpieceCount: 1, crystalVeinCount: 0, properMineralCount: 0,
      dullStoneCount: 0, crackedRockCount: 0, voidCount: 0,
      hasHighClarityCount: 1, hasHighQualityCount: 1, hasHighPurityCount: 1,
      hasHighStrengthCount: 1, hasHighWisdomCount: 1,
      overallLuminosity: 100, minerGrade: 'crystal-master' as const,
      bestCrystal: 'a.ts', clearest: 'a.ts', mostRhythmic: 'a.ts',
      purest: 'a.ts', strongest: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(crystals, seams, geode, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfect crystalline luminosity')
  })

  it('recommends polishing when clarity is low', () => {
    const crystals = [analyzeQuartzCrystal('', 'a.ts')]
    const seams = [analyzeQuartzSeam(crystals, '.')]
    const geode = { avgClarity: 0, avgStrength: 0, avgWisdom: 0, isQuartz: false, overallLuminosity: 0 }
    const stats = {
      totalFiles: 1, totalSeams: 1,
      avgCrystallineClarity: 0, avgVibrationQuality: 0, avgResonancePurity: 0,
      avgStructureStrength: 0, avgVeinWisdom: 0,
      quartzMasterpieceCount: 0, crystalVeinCount: 0, properMineralCount: 0,
      dullStoneCount: 0, crackedRockCount: 0, voidCount: 1,
      hasHighClarityCount: 0, hasHighQualityCount: 0, hasHighPurityCount: 0,
      hasHighStrengthCount: 0, hasHighWisdomCount: 0,
      overallLuminosity: 0, minerGrade: 'rock-basher' as const,
      bestCrystal: 'a.ts', clearest: 'a.ts', mostRhythmic: 'a.ts',
      purest: 'a.ts', strongest: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(crystals, seams, geode, stats)
    expect(recs.some((r) => r.includes('crystalline clarity'))).toBe(true)
  })

  it('recommends complete restoration when all seams poor', () => {
    const crystals = [analyzeQuartzCrystal('', 'a.ts')]
    const seams = [analyzeQuartzSeam(crystals, '.')]
    const geode = { avgClarity: 0, avgStrength: 0, avgWisdom: 0, isQuartz: false, overallLuminosity: 0 }
    const stats = {
      totalFiles: 1, totalSeams: 1,
      avgCrystallineClarity: 0, avgVibrationQuality: 0, avgResonancePurity: 0,
      avgStructureStrength: 0, avgVeinWisdom: 0,
      quartzMasterpieceCount: 0, crystalVeinCount: 0, properMineralCount: 0,
      dullStoneCount: 0, crackedRockCount: 0, voidCount: 1,
      hasHighClarityCount: 0, hasHighQualityCount: 0, hasHighPurityCount: 0,
      hasHighStrengthCount: 0, hasHighWisdomCount: 0,
      overallLuminosity: 0, minerGrade: 'rock-basher' as const,
      bestCrystal: 'a.ts', clearest: 'a.ts', mostRhythmic: 'a.ts',
      purest: 'a.ts', strongest: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(crystals, seams, geode, stats)
    expect(recs.some((r) => r.includes('complete restoration'))).toBe(true)
  })
})

// ─── Format Helpers ──────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns string for all conditions', () => {
    expect(typeof colorCondition('quartz-masterpiece')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorSeamCondition', () => {
  it('returns string for all seam conditions', () => {
    expect(typeof colorSeamCondition('crystal-cathedral')).toBe('string')
    expect(typeof colorSeamCondition('void')).toBe('string')
  })
})

describe('formatCrystalTable', () => {
  it('formats a crystal', () => {
    const c = analyzeQuartzCrystal(richContent, 'test.ts')
    const out = formatCrystalTable(c)
    expect(out).toContain('test.ts')
    expect(out).toContain('Crystalline Clarity')
  })
})

describe('formatCrystalsTable', () => {
  it('handles empty crystals', () => {
    expect(formatCrystalsTable([])).toContain('No quartz crystals')
  })

  it('formats multiple crystals', () => {
    const crystals = [
      analyzeQuartzCrystal(richContent, 'a.ts'),
      analyzeQuartzCrystal(richContent, 'b.ts'),
    ]
    const out = formatCrystalsTable(crystals)
    expect(out).toContain('Quartz Crystals')
    expect(out).toContain('a.ts')
    expect(out).toContain('b.ts')
  })
})

describe('formatSeamTable', () => {
  it('formats a seam', () => {
    const crystals = [analyzeQuartzCrystal(richContent, 'src/a.ts')]
    const s = analyzeQuartzSeam(crystals, 'src')
    const out = formatSeamTable(s)
    expect(out).toContain('src')
    expect(out).toContain('Seam Type')
  })
})

describe('formatSeamsTable', () => {
  it('handles empty seams', () => {
    expect(formatSeamsTable([])).toContain('No quartz seams')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const r = await buildQuartzMeridianResult(['a.ts'], [richContent])
    const out = formatStatsTable(r.stats)
    expect(out).toContain('Total Files')
    expect(out).toContain('Miner Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const out = formatRecommendations(['Fix A'])
    expect(out).toContain('Recommendations')
    expect(out).toContain('Fix A')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const r = await buildQuartzMeridianResult(['a.ts'], [richContent])
    const out = formatResultTable(r)
    expect(out).toContain('Quartz Meridian Analysis')
    expect(out).toContain('Geode Overview')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const r = await buildQuartzMeridianResult(['a.ts'], [richContent])
    const json = formatResultJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.crystals).toHaveLength(1)
    expect(parsed.geode).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────

describe('integration', () => {
  it('end-to-end with mixed content', async () => {
    const r = await buildQuartzMeridianResult(
      ['good.ts', 'bad.ts', 'ok.ts'],
      [richContent, '', 'export function test(): void { return }'],
    )
    expect(r.crystals).toHaveLength(3)
    expect(r.stats.totalFiles).toBe(3)
    expect(r.geode.overallLuminosity).toBeGreaterThan(0)
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('handles root-level files', async () => {
    const r = await buildQuartzMeridianResult(['a.ts'], [richContent])
    expect(r.seams).toHaveLength(1)
    expect(r.seams[0].directory).toBe('.')
  })

  it('handles files in same directory', async () => {
    const r = await buildQuartzMeridianResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, richContent],
    )
    expect(r.seams).toHaveLength(1)
    expect(r.seams[0].crystals).toHaveLength(2)
  })
})
