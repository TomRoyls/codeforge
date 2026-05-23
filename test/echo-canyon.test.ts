import { describe, it, expect } from 'vitest'
import {
  measureResonating,
  measureClarifying,
  measureForming,
  measurePurifying,
  measureDetecting,
  classifyEchoCondition,
  classifyCanyonType,
  classifyAcousticGrade,
  classifyCanyonCondition,
  analyzeCanyonEcho,
  analyzeCanyonSystem,
  buildEchoCanyonResult,
  generateRecommendations,
} from '../src/commands/echo-canyon-helpers.js'
import {
  colorScore,
  colorGrade,
  formatEchoTable,
  formatEchoesTable,
  formatCanyonTable,
  formatCanyonsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/echo-canyon-format-helpers.js'

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
    const result = readFileSync(input, 'utf8')
    if (result === 'test') {
      return JSON.parse(result) as Result
    }
    return {} as Result
  }
}

export const defaultConfig: Options = { name: 'test' }
`

// ─── measureResonating ─────────────────────────────────────────────

describe('measureResonating', () => {
  it('returns 0 for empty content', () => {
    const m = measureResonating('')
    expect(m.depth).toBe(0)
    expect(m.grade).toBe('silence')
    expect(m.hasHighDepth).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureResonating(minimalContent)
    expect(m.depth).toBe(8)
    expect(m.grade).toBe('silence')
    expect(m.hasLasting).toBe(false)
    expect(m.hasNoFleeting).toBe(true)
    expect(m.hasNoShallow).toBe(true)
    expect(m.hasNoBrief).toBe(true)
    expect(m.hasNoFlat).toBe(true)
    expect(m.fleetingCount).toBe(0)
    expect(m.shallowCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureResonating(richContent)
    expect(m.depth).toBe(100)
    expect(m.grade).toBe('deep-canyon')
    expect(m.hasHighDepth).toBe(true)
    expect(m.hasLasting).toBe(true)
    expect(m.hasPersistent).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasResonant).toBe(true)
    expect(m.hasImpactful).toBe(true)
  })

  it('detects fleeting var usage', () => {
    const m = measureResonating('var x = 1')
    expect(m.fleetingCount).toBe(1)
    expect(m.hasNoFleeting).toBe(false)
  })

  it('detects shallow any usage', () => {
    const m = measureResonating('const x: any = 1')
    expect(m.shallowCount).toBe(1)
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects eval as brief', () => {
    const m = measureResonating('eval("1")')
    expect(m.hasNoBrief).toBe(false)
  })

  it('detects debugger as flat', () => {
    const m = measureResonating('debugger')
    expect(m.hasNoFlat).toBe(false)
  })

  it('classifies strong-echo correctly', () => {
    const content = '/** doc */\nexport interface Foo {}\nexport class Bar {}\nimport { x } from "y"\nconst z: string = "a"\nasync function f(): Promise<void> {}\ntype T = string\n'
    const m = measureResonating(content)
    expect(m.depth).toBeGreaterThanOrEqual(70)
    if (m.depth >= 70 && m.depth < 85) {
      expect(m.grade).toBe('strong-echo')
    }
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 for empty content', () => {
    const m = measureClarifying('')
    expect(m.clarity).toBe(0)
    expect(m.echo).toBe('no-echo')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBe(0)
    expect(m.echo).toBe('no-echo')
    expect(m.hasClear).toBe(false)
    expect(m.hasNoBlurred).toBe(true)
    expect(m.hasNoMuddy).toBe(true)
    expect(m.blurredCount).toBe(0)
    expect(m.muddyCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBe(100)
    expect(m.echo).toBe('crystal-clear')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasDistinct).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasExplicit).toBe(true)
  })

  it('detects blurred var usage', () => {
    const m = measureClarifying('var x = 1')
    expect(m.blurredCount).toBe(1)
    expect(m.hasNoBlurred).toBe(false)
  })

  it('detects muddy any usage', () => {
    const m = measureClarifying('const x: any = 1')
    expect(m.muddyCount).toBe(1)
    expect(m.hasNoMuddy).toBe(false)
  })

  it('detects eval as ambiguous', () => {
    const m = measureClarifying('eval("1")')
    expect(m.hasNoAmbiguous).toBe(false)
  })

  it('detects debugger as opaque', () => {
    const m = measureClarifying('debugger')
    expect(m.hasNoOpaque).toBe(false)
  })
})

// ─── measureForming ────────────────────────────────────────────────

describe('measureForming', () => {
  it('returns 0 for empty content', () => {
    const m = measureForming('')
    expect(m.quality).toBe(0)
    expect(m.wall).toBe('no-boundary')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureForming(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.wall).toBe('no-boundary')
    expect(m.hasDefined).toBe(false)
    expect(m.hasNoUnbounded).toBe(true)
    expect(m.hasNoLeaking).toBe(true)
    expect(m.unboundedCount).toBe(0)
    expect(m.leakingCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureForming(richContent)
    expect(m.quality).toBe(100)
    expect(m.wall).toBe('granite-cliff')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasDefined).toBe(true)
    expect(m.hasBound).toBe(true)
    expect(m.hasEncapsulated).toBe(true)
    expect(m.hasContained).toBe(true)
    expect(m.hasScoped).toBe(true)
    expect(m.hasIsolated).toBe(true)
  })

  it('detects unbounded var usage', () => {
    const m = measureForming('var x = 1')
    expect(m.unboundedCount).toBe(1)
    expect(m.hasNoUnbounded).toBe(false)
  })

  it('detects leaking any usage', () => {
    const m = measureForming('const x: any = 1')
    expect(m.leakingCount).toBe(1)
    expect(m.hasNoLeaking).toBe(false)
  })

  it('detects eval as spilling', () => {
    const m = measureForming('eval("1")')
    expect(m.hasNoSpilling).toBe(false)
  })

  it('detects debugger as global', () => {
    const m = measureForming('debugger')
    expect(m.hasNoGlobal).toBe(false)
  })
})

// ─── measurePurifying ──────────────────────────────────────────────

describe('measurePurifying', () => {
  it('returns 0 for empty content', () => {
    const m = measurePurifying('')
    expect(m.purity).toBe(0)
    expect(m.acoustic).toBe('white-noise')
    expect(m.hasHighPurity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measurePurifying(minimalContent)
    expect(m.purity).toBe(10)
    expect(m.acoustic).toBe('white-noise')
    expect(m.hasClean).toBe(false)
    expect(m.hasNoPolluted).toBe(true)
    expect(m.hasNoDistracted).toBe(true)
    expect(m.pollutedCount).toBe(0)
    expect(m.distractedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measurePurifying(richContent)
    expect(m.purity).toBe(100)
    expect(m.acoustic).toBe('pure-tone')
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasPure).toBe(true)
    expect(m.hasFocused).toBe(true)
    expect(m.hasSignal).toBe(true)
    expect(m.hasEssential).toBe(true)
    expect(m.hasConcentrated).toBe(true)
  })

  it('detects polluted var usage', () => {
    const m = measurePurifying('var x = 1')
    expect(m.pollutedCount).toBe(1)
    expect(m.hasNoPolluted).toBe(false)
  })

  it('detects distracted any usage', () => {
    const m = measurePurifying('const x: any = 1')
    expect(m.distractedCount).toBe(1)
    expect(m.hasNoDistracted).toBe(false)
  })

  it('detects eval as noise', () => {
    const m = measurePurifying('eval("1")')
    expect(m.hasNoNoise).toBe(false)
  })

  it('detects debugger as cluttered', () => {
    const m = measurePurifying('debugger')
    expect(m.hasNoCluttered).toBe(false)
  })
})

// ─── measureDetecting ──────────────────────────────────────────────

describe('measureDetecting', () => {
  it('returns 0 for empty content', () => {
    const m = measureDetecting('')
    expect(m.sensitivity).toBe(0)
    expect(m.detection).toBe('deaf')
    expect(m.hasHighSensitivity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureDetecting(minimalContent)
    expect(m.sensitivity).toBe(0)
    expect(m.detection).toBe('deaf')
    expect(m.hasSensitive).toBe(false)
    expect(m.hasNoOblivious).toBe(true)
    expect(m.hasNoBlind).toBe(true)
    expect(m.obliviousCount).toBe(0)
    expect(m.blindCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureDetecting(richContent)
    expect(m.sensitivity).toBe(100)
    expect(m.detection).toBe('sonar-grade')
    expect(m.hasHighSensitivity).toBe(true)
    expect(m.hasSensitive).toBe(true)
    expect(m.hasAttentive).toBe(true)
    expect(m.hasObservant).toBe(true)
    expect(m.hasPerceptive).toBe(true)
    expect(m.hasVigilant).toBe(true)
    expect(m.hasAlert).toBe(true)
  })

  it('detects oblivious var usage', () => {
    const m = measureDetecting('var x = 1')
    expect(m.obliviousCount).toBe(1)
    expect(m.hasNoOblivious).toBe(false)
  })

  it('detects blind any usage', () => {
    const m = measureDetecting('const x: any = 1')
    expect(m.blindCount).toBe(1)
    expect(m.hasNoBlind).toBe(false)
  })

  it('detects eval as unaware', () => {
    const m = measureDetecting('eval("1")')
    expect(m.hasNoUnaware).toBe(false)
  })

  it('detects debugger as negligent', () => {
    const m = measureDetecting('debugger')
    expect(m.hasNoNegligent).toBe(false)
  })
})

// ─── classifyEchoCondition ──────────────────────────────────────────

describe('classifyEchoCondition', () => {
  it('classifies grand-canyon for 85+', () => {
    expect(classifyEchoCondition(85)).toBe('grand-canyon')
    expect(classifyEchoCondition(100)).toBe('grand-canyon')
  })

  it('classifies echo-valley for 70-84', () => {
    expect(classifyEchoCondition(70)).toBe('echo-valley')
    expect(classifyEchoCondition(84)).toBe('echo-valley')
  })

  it('classifies proper-gorge for 55-69', () => {
    expect(classifyEchoCondition(55)).toBe('proper-gorge')
    expect(classifyEchoCondition(69)).toBe('proper-gorge')
  })

  it('classifies shallow-ravine for 40-54', () => {
    expect(classifyEchoCondition(40)).toBe('shallow-ravine')
    expect(classifyEchoCondition(54)).toBe('shallow-ravine')
  })

  it('classifies silent-hollow for 25-39', () => {
    expect(classifyEchoCondition(25)).toBe('silent-hollow')
    expect(classifyEchoCondition(39)).toBe('silent-hollow')
  })

  it('classifies flat-plain for 0-24', () => {
    expect(classifyEchoCondition(0)).toBe('flat-plain')
    expect(classifyEchoCondition(24)).toBe('flat-plain')
  })
})

// ─── classifyCanyonType ──────────────────────────────────────────────

describe('classifyCanyonType', () => {
  it('returns flat-ground for empty echoes', () => {
    expect(classifyCanyonType([])).toBe('flat-ground')
  })

  it('classifies grand-canyon for high avg + high grand ratio', () => {
    const echoes = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeCanyonEcho(richContent, `f${i}.ts`),
    }))
    expect(classifyCanyonType(echoes)).toBe('grand-canyon')
  })

  it('classifies flat-ground for low scores', () => {
    const echoes = [analyzeCanyonEcho('', 'a.ts')]
    expect(classifyCanyonType(echoes)).toBe('flat-ground')
  })

  it('classifies deep-gorge for mid-high scores', () => {
    const echoes = Array.from({ length: 3 }, () => ({
      ...analyzeCanyonEcho(richContent, 'f.ts'),
      qualityScore: 65,
      condition: 'echo-valley' as const,
    }))
    expect(classifyCanyonType(echoes)).toBe('deep-gorge')
  })

  it('classifies river-valley for mid scores', () => {
    const echoes = Array.from({ length: 3 }, () => ({
      ...analyzeCanyonEcho(richContent, 'f.ts'),
      qualityScore: 50,
      condition: 'proper-gorge' as const,
    }))
    expect(classifyCanyonType(echoes)).toBe('river-valley')
  })

  it('classifies shallow-ravine for low-mid scores', () => {
    const echoes = Array.from({ length: 3 }, () => ({
      ...analyzeCanyonEcho(richContent, 'f.ts'),
      qualityScore: 35,
      condition: 'shallow-ravine' as const,
    }))
    expect(classifyCanyonType(echoes)).toBe('shallow-ravine')
  })

  it('classifies ditch for very low scores', () => {
    const echoes = Array.from({ length: 3 }, () => ({
      ...analyzeCanyonEcho(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'silent-hollow' as const,
    }))
    expect(classifyCanyonType(echoes)).toBe('ditch')
  })
})

// ─── classifyAcousticGrade ─────────────────────────────────────────

describe('classifyAcousticGrade', () => {
  it('classifies acoustic-engineer for 80+', () => {
    expect(classifyAcousticGrade(80)).toBe('acoustic-engineer')
    expect(classifyAcousticGrade(100)).toBe('acoustic-engineer')
  })

  it('classifies sound-designer for 65-79', () => {
    expect(classifyAcousticGrade(65)).toBe('sound-designer')
    expect(classifyAcousticGrade(79)).toBe('sound-designer')
  })

  it('classifies audio-technician for 50-64', () => {
    expect(classifyAcousticGrade(50)).toBe('audio-technician')
    expect(classifyAcousticGrade(64)).toBe('audio-technician')
  })

  it('classifies listener for 35-49', () => {
    expect(classifyAcousticGrade(35)).toBe('listener')
    expect(classifyAcousticGrade(49)).toBe('listener')
  })

  it('classifies deaf-ear for 20-34', () => {
    expect(classifyAcousticGrade(20)).toBe('deaf-ear')
    expect(classifyAcousticGrade(34)).toBe('deaf-ear')
  })

  it('classifies mute for 0-19', () => {
    expect(classifyAcousticGrade(0)).toBe('mute')
    expect(classifyAcousticGrade(19)).toBe('mute')
  })
})

// ─── classifyCanyonCondition ────────────────────────────────────────

describe('classifyCanyonCondition', () => {
  it('classifies perfect-acoustics for 75+', () => {
    expect(classifyCanyonCondition(75)).toBe('perfect-acoustics')
    expect(classifyCanyonCondition(100)).toBe('perfect-acoustics')
  })

  it('classifies great-echoes for 60-74', () => {
    expect(classifyCanyonCondition(60)).toBe('great-echoes')
    expect(classifyCanyonCondition(74)).toBe('great-echoes')
  })

  it('classifies decent-reverb for 45-59', () => {
    expect(classifyCanyonCondition(45)).toBe('decent-reverb')
    expect(classifyCanyonCondition(59)).toBe('decent-reverb')
  })

  it('classifies poor-acoustics for 30-44', () => {
    expect(classifyCanyonCondition(30)).toBe('poor-acoustics')
    expect(classifyCanyonCondition(44)).toBe('poor-acoustics')
  })

  it('classifies dead-sound for 15-29', () => {
    expect(classifyCanyonCondition(15)).toBe('dead-sound')
    expect(classifyCanyonCondition(29)).toBe('dead-sound')
  })

  it('classifies silent for 0-14', () => {
    expect(classifyCanyonCondition(0)).toBe('silent')
    expect(classifyCanyonCondition(14)).toBe('silent')
  })
})

// ─── analyzeCanyonEcho ──────────────────────────────────────────────

describe('analyzeCanyonEcho', () => {
  it('analyzes minimal content', () => {
    const echo = analyzeCanyonEcho(minimalContent, 'minimal.ts')
    expect(echo.file).toBe('minimal.ts')
    expect(echo.resonanceDepth).toBe(8)
    expect(echo.echoClarity).toBe(0)
    expect(echo.wallFormation).toBe(8)
    expect(echo.acousticPurity).toBe(10)
    expect(echo.whisperDetection).toBe(0)
    expect(echo.qualityScore).toBe(5)
    expect(echo.condition).toBe('flat-plain')
    expect(echo.resonating.grade).toBe('silence')
    expect(echo.clarifying.echo).toBe('no-echo')
    expect(echo.forming.wall).toBe('no-boundary')
    expect(echo.purifying.acoustic).toBe('white-noise')
    expect(echo.detecting.detection).toBe('deaf')
  })

  it('analyzes rich content', () => {
    const echo = analyzeCanyonEcho(richContent, 'rich.ts')
    expect(echo.file).toBe('rich.ts')
    expect(echo.resonanceDepth).toBe(100)
    expect(echo.echoClarity).toBe(100)
    expect(echo.wallFormation).toBe(100)
    expect(echo.acousticPurity).toBe(100)
    expect(echo.whisperDetection).toBe(100)
    expect(echo.qualityScore).toBe(100)
    expect(echo.condition).toBe('grand-canyon')
    expect(echo.resonating.grade).toBe('deep-canyon')
    expect(echo.clarifying.echo).toBe('crystal-clear')
    expect(echo.forming.wall).toBe('granite-cliff')
    expect(echo.purifying.acoustic).toBe('pure-tone')
    expect(echo.detecting.detection).toBe('sonar-grade')
  })

  it('computes qualityScore as weighted average', () => {
    const echo = analyzeCanyonEcho('export const x = 1', 'mid.ts')
    const expected = Math.round(
      echo.resonanceDepth * 0.2 +
      echo.echoClarity * 0.2 +
      echo.wallFormation * 0.2 +
      echo.acousticPurity * 0.2 +
      echo.whisperDetection * 0.2,
    )
    expect(echo.qualityScore).toBe(expected)
  })
})

// ─── analyzeCanyonSystem ────────────────────────────────────────────

describe('analyzeCanyonSystem', () => {
  it('returns silent system for empty echoes', () => {
    const system = analyzeCanyonSystem([], 'empty-dir')
    expect(system.directory).toBe('empty-dir')
    expect(system.echoes).toHaveLength(0)
    expect(system.avgDepth).toBe(0)
    expect(system.avgClarity).toBe(0)
    expect(system.avgPurity).toBe(0)
    expect(system.grandCanyonCount).toBe(0)
    expect(system.flatPlainCount).toBe(0)
    expect(system.canyonType).toBe('flat-ground')
    expect(system.condition).toBe('silent')
  })

  it('analyzes system with rich echoes', () => {
    const echoes = [
      analyzeCanyonEcho(richContent, 'dir/a.ts'),
      analyzeCanyonEcho(richContent, 'dir/b.ts'),
    ]
    const system = analyzeCanyonSystem(echoes, 'dir')
    expect(system.directory).toBe('dir')
    expect(system.echoes).toHaveLength(2)
    expect(system.avgDepth).toBe(100)
    expect(system.avgClarity).toBe(100)
    expect(system.avgPurity).toBe(100)
    expect(system.grandCanyonCount).toBe(2)
    expect(system.flatPlainCount).toBe(0)
    expect(system.canyonType).toBe('grand-canyon')
  })

  it('analyzes system with mixed echoes', () => {
    const echoes = [
      analyzeCanyonEcho(richContent, 'dir/a.ts'),
      analyzeCanyonEcho(minimalContent, 'dir/b.ts'),
    ]
    const system = analyzeCanyonSystem(echoes, 'dir')
    expect(system.grandCanyonCount).toBe(1)
    expect(system.flatPlainCount).toBe(1)
  })
})

// ─── buildEchoCanyonResult ──────────────────────────────────────────

describe('buildEchoCanyonResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildEchoCanyonResult([], [])
    expect(result.echoes).toHaveLength(0)
    expect(result.canyons).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalCanyons).toBe(0)
    expect(result.stats.overallAcoustics).toBe(0)
    expect(result.stats.acousticGrade).toBe('mute')
    expect(result.landscape.isResonant).toBe(false)
    expect(result.landscape.overallAcoustics).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildEchoCanyonResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.echoes).toHaveLength(2)
    expect(result.canyons).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalCanyons).toBe(1)
    expect(result.stats.avgResonanceDepth).toBe(100)
    expect(result.stats.avgEchoClarity).toBe(100)
    expect(result.stats.avgWallFormation).toBe(100)
    expect(result.stats.avgAcousticPurity).toBe(100)
    expect(result.stats.avgWhisperDetection).toBe(100)
    expect(result.stats.grandCanyonCount).toBe(2)
    expect(result.stats.echoValleyCount).toBe(0)
    expect(result.stats.properGorgeCount).toBe(0)
    expect(result.stats.shallowRavineCount).toBe(0)
    expect(result.stats.silentHollowCount).toBe(0)
    expect(result.stats.flatPlainCount).toBe(0)
    expect(result.stats.hasHighDepthCount).toBe(2)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.hasHighQualityCount).toBe(2)
    expect(result.stats.hasHighPurityCount).toBe(2)
    expect(result.stats.hasHighSensitivityCount).toBe(2)
    expect(result.stats.overallAcoustics).toBe(100)
    expect(result.stats.acousticGrade).toBe('acoustic-engineer')
    expect(result.landscape.isResonant).toBe(true)
    expect(result.landscape.overallAcoustics).toBe(100)
    expect(result.stats.bestEcho).toBeTruthy()
    expect(result.stats.deepest).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.bestWalled).toBeTruthy()
    expect(result.stats.purest).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildEchoCanyonResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.canyons).toHaveLength(2)
    const dirs = result.canyons.map(c => c.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes landscape overall acoustics correctly', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [minimalContent])
    expect(result.landscape.overallAcoustics).toBe(Math.round((8 + 0 + 10) / 3))
  })

  it('sets isResonant when avgDepth >= 60', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [richContent])
    expect(result.landscape.isResonant).toBe(true)
  })

  it('sets isResonant false when avgDepth < 60', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [minimalContent])
    expect(result.landscape.isResonant).toBe(false)
  })

  it('picks best echo by qualityScore', async () => {
    const result = await buildEchoCanyonResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestEcho).toBe('high.ts')
    expect(result.stats.deepest).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.bestWalled).toBe('high.ts')
    expect(result.stats.purest).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildEchoCanyonResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.grandCanyonCount).toBe(1)
    expect(result.stats.flatPlainCount).toBe(1)
    expect(result.stats.totalFiles).toBe(2)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your code canyon echoes with perfect acoustics! Every whisper finds its wall and every resonance carries deep',
    ])
  })

  it('recommends improving resonance depth when low', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('resonance'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving echo clarity when low', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Clarify'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving wall formation when low', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('wall'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving acoustic purity when low', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('acoustic'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving whisper detection when low', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('detection'))
    expect(rec).toBeTruthy()
  })

  it('warns about flat-plain files', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('flat plain'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall acoustics', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Overall canyon acoustics'))
    expect(rec).toBeTruthy()
  })

  it('lists specific flat-plain files to transform', async () => {
    const result = await buildEchoCanyonResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Transform these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all canyons are flat/ditch', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('flat ground or ditches'))
    expect(rec).toBeTruthy()
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for score 90', () => {
    expect(typeof colorScore(90)).toBe('string')
  })

  it('returns a string for score 50', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns a string for score 10', () => {
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for grand-canyon', () => {
    expect(typeof colorGrade('grand-canyon')).toBe('string')
  })

  it('returns a string for flat-plain', () => {
    expect(typeof colorGrade('flat-plain')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatEchoTable', () => {
  it('formats an echo', () => {
    const echo = analyzeCanyonEcho(richContent, 'test.ts')
    const output = formatEchoTable(echo)
    expect(output).toContain('test.ts')
    expect(output).toContain('Resonance Depth')
    expect(output).toContain('Echo Clarity')
    expect(output).toContain('Wall Formation')
    expect(output).toContain('Acoustic Purity')
    expect(output).toContain('Whisper Detection')
  })
})

describe('formatEchoesTable', () => {
  it('handles empty echoes', () => {
    const output = formatEchoesTable([])
    expect(output).toContain('No canyon echoes')
  })

  it('formats multiple echoes', () => {
    const echoes = [
      analyzeCanyonEcho(richContent, 'a.ts'),
      analyzeCanyonEcho(minimalContent, 'b.ts'),
    ]
    const output = formatEchoesTable(echoes)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatCanyonTable', () => {
  it('formats a canyon', () => {
    const echoes = [analyzeCanyonEcho(richContent, 'dir/a.ts')]
    const canyon = analyzeCanyonSystem(echoes, 'dir')
    const output = formatCanyonTable(canyon)
    expect(output).toContain('dir')
    expect(output).toContain('Canyon')
  })
})

describe('formatCanyonsTable', () => {
  it('handles empty canyons', () => {
    const output = formatCanyonsTable([])
    expect(output).toContain('No canyon systems')
  })

  it('formats multiple canyons', () => {
    const echoes = [analyzeCanyonEcho(richContent, 'src/a.ts')]
    const canyons = [analyzeCanyonSystem(echoes, 'src')]
    const output = formatCanyonsTable(canyons)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Echo Canyon Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Acoustic Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Canyon Echo Analysis')
    expect(output).toContain('Canyon System Analysis')
    expect(output).toContain('Echo Canyon Statistics')
    expect(output).toContain('Landscape')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildEchoCanyonResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.echoes).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.landscape.isResonant).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const echo = analyzeCanyonEcho('   \n\t  ', 'blank.ts')
    expect(echo.resonanceDepth).toBe(0)
    expect(echo.qualityScore).toBe(0)
    expect(echo.condition).toBe('flat-plain')
  })

  it('handles content with only comments', () => {
    const echo = analyzeCanyonEcho('// just a comment\n/* block */', 'comment.ts')
    expect(echo.resonanceDepth).toBe(0)
    expect(echo.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildEchoCanyonResult(['big.ts'], [longContent])
    expect(result.echoes).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildEchoCanyonResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.grandCanyonCount).toBe(50)
  })

  it('handles single file canyon', async () => {
    const result = await buildEchoCanyonResult(['single.ts'], [richContent])
    expect(result.canyons).toHaveLength(1)
    expect(result.canyons[0]!.echoes).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const echo = analyzeCanyonEcho(richContent, 'cap.ts')
    expect(echo.qualityScore).toBeLessThanOrEqual(100)
    expect(echo.resonanceDepth).toBeLessThanOrEqual(100)
    expect(echo.echoClarity).toBeLessThanOrEqual(100)
    expect(echo.wallFormation).toBeLessThanOrEqual(100)
    expect(echo.acousticPurity).toBeLessThanOrEqual(100)
    expect(echo.whisperDetection).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildEchoCanyonResult([], [])
    const r2 = await buildEchoCanyonResult(['a.ts'], [richContent])
    const r3 = await buildEchoCanyonResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
