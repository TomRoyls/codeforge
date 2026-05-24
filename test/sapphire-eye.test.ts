import { describe, it, expect } from 'vitest'
import {
  measureSeeing,
  measureHardening,
  measureColoring,
  measureShining,
  measureCalming,
  classifySapphireCondition,
  classifyVaultType,
  classifySeerGrade,
  classifyVaultCondition,
  analyzeSapphireGaze,
  analyzeSapphireVault,
  buildSapphireEyeResult,
  generateRecommendations,
} from '../src/commands/sapphire-eye-helpers.js'
import {
  colorScore,
  colorGrade,
  formatGazeTable,
  formatGazesTable,
  formatVaultTable,
  formatVaultsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/sapphire-eye-format-helpers.js'

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

// ─── measureSeeing ──────────────────────────────────────────────────

describe('measureSeeing', () => {
  it('returns 0 for empty content', () => {
    const m = measureSeeing('')
    expect(m.clarity).toBe(0)
    expect(m.grade).toBe('blind')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureSeeing(minimalContent)
    expect(m.clarity).toBe(8)
    expect(m.grade).toBe('blind')
    expect(m.hasInsightful).toBe(false)
    expect(m.obliviousCount).toBe(0)
    expect(m.reactiveCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureSeeing(richContent)
    expect(m.clarity).toBe(100)
    expect(m.grade).toBe('all-seeing')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasPerceptive).toBe(true)
    expect(m.hasForesighted).toBe(true)
    expect(m.hasObservant).toBe(true)
    expect(m.hasAware).toBe(true)
    expect(m.hasDiscerning).toBe(true)
  })

  it('detects oblivious var usage', () => {
    const m = measureSeeing('var x = 1')
    expect(m.obliviousCount).toBe(1)
    expect(m.hasNoOblivious).toBe(false)
  })

  it('detects reactive any usage', () => {
    const m = measureSeeing('const x: any = 1')
    expect(m.reactiveCount).toBe(1)
    expect(m.hasNoReactive).toBe(false)
  })

  it('detects blind eval usage', () => {
    const m = measureSeeing('eval("1")')
    expect(m.hasNoBlind).toBe(false)
  })

  it('detects unaware debugger usage', () => {
    const m = measureSeeing('debugger')
    expect(m.hasNoUnaware).toBe(false)
  })
})

// ─── measureHardening ───────────────────────────────────────────────

describe('measureHardening', () => {
  it('returns 0 for empty content', () => {
    const m = measureHardening('')
    expect(m.grade).toBe(0)
    expect(m.hardness).toBe('talc-soft')
    expect(m.hasHighGrade).toBe(false)
  })

  it('scores minimal content at 0', () => {
    const m = measureHardening(minimalContent)
    expect(m.grade).toBe(0)
    expect(m.hardness).toBe('talc-soft')
    expect(m.hasRobust).toBe(false)
    expect(m.fragileCount).toBe(0)
    expect(m.brittleCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureHardening(richContent)
    expect(m.grade).toBe(100)
    expect(m.hardness).toBe('diamond-level')
    expect(m.hasHighGrade).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasDurable).toBe(true)
    expect(m.hasTough).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasSolid).toBe(true)
    expect(m.hasSturdy).toBe(true)
  })

  it('detects fragile var usage', () => {
    const m = measureHardening('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects brittle any usage', () => {
    const m = measureHardening('const x: any = 1')
    expect(m.brittleCount).toBe(1)
    expect(m.hasNoBrittle).toBe(false)
  })

  it('detects breakable eval usage', () => {
    const m = measureHardening('eval("1")')
    expect(m.hasNoBreakable).toBe(false)
  })

  it('detects weak debugger usage', () => {
    const m = measureHardening('debugger')
    expect(m.hasNoWeak).toBe(false)
  })
})

// ─── measureColoring ────────────────────────────────────────────────

describe('measureColoring', () => {
  it('returns 0 for empty content', () => {
    const m = measureColoring('')
    expect(m.royalty).toBe(0)
    expect(m.color).toBe('colorless')
    expect(m.hasHighRoyalty).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureColoring(minimalContent)
    expect(m.royalty).toBe(8)
    expect(m.color).toBe('colorless')
    expect(m.hasElegant).toBe(false)
    expect(m.crudeCount).toBe(0)
    expect(m.clunkyCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureColoring(richContent)
    expect(m.royalty).toBe(100)
    expect(m.color).toBe('royal-blue')
    expect(m.hasHighRoyalty).toBe(true)
    expect(m.hasElegant).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasSophisticated).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasNoble).toBe(true)
    expect(m.hasPolished).toBe(true)
  })

  it('detects crude var usage', () => {
    const m = measureColoring('var x = 1')
    expect(m.crudeCount).toBe(1)
    expect(m.hasNoCrude).toBe(false)
  })

  it('detects clunky any usage', () => {
    const m = measureColoring('const x: any = 1')
    expect(m.clunkyCount).toBe(1)
    expect(m.hasNoClunky).toBe(false)
  })

  it('detects harsh eval usage', () => {
    const m = measureColoring('eval("1")')
    expect(m.hasNoHarsh).toBe(false)
  })

  it('detects common debugger usage', () => {
    const m = measureColoring('debugger')
    expect(m.hasNoCommon).toBe(false)
  })
})

// ─── measureShining ────────────────────────────────────────────────

describe('measureShining', () => {
  it('returns 0 for empty content', () => {
    const m = measureShining('')
    expect(m.level).toBe(0)
    expect(m.brilliance).toBe('no-light')
    expect(m.hasHighLevel).toBe(false)
  })

  it('scores minimal content at 0', () => {
    const m = measureShining(minimalContent)
    expect(m.level).toBe(0)
    expect(m.brilliance).toBe('no-light')
    expect(m.hasImpactful).toBe(false)
    expect(m.weakCount).toBe(0)
    expect(m.dimCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureShining(richContent)
    expect(m.level).toBe(100)
    expect(m.brilliance).toBe('star-sapphire')
    expect(m.hasHighLevel).toBe(true)
    expect(m.hasImpactful).toBe(true)
    expect(m.hasStriking).toBe(true)
    expect(m.hasDazzling).toBe(true)
    expect(m.hasVivid).toBe(true)
    expect(m.hasBrilliant).toBe(true)
    expect(m.hasRadiant).toBe(true)
  })

  it('detects weak var usage', () => {
    const m = measureShining('var x = 1')
    expect(m.weakCount).toBe(1)
    expect(m.hasNoWeak).toBe(false)
  })

  it('detects dim any usage', () => {
    const m = measureShining('const x: any = 1')
    expect(m.dimCount).toBe(1)
    expect(m.hasNoDim).toBe(false)
  })

  it('detects faint eval usage', () => {
    const m = measureShining('eval("1")')
    expect(m.hasNoFaint).toBe(false)
  })

  it('detects flat debugger usage', () => {
    const m = measureShining('debugger')
    expect(m.hasNoFlat).toBe(false)
  })
})

// ─── measureCalming ─────────────────────────────────────────────────

describe('measureCalming', () => {
  it('returns 0 for empty content', () => {
    const m = measureCalming('')
    expect(m.depth).toBe(0)
    expect(m.calm).toBe('chaotic')
    expect(m.hasHighDepth).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureCalming(minimalContent)
    expect(m.depth).toBe(8)
    expect(m.calm).toBe('chaotic')
    expect(m.hasSerene).toBe(false)
    expect(m.erraticCount).toBe(0)
    expect(m.chaoticCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureCalming(richContent)
    expect(m.depth).toBe(100)
    expect(m.calm).toBe('ocean-depth')
    expect(m.hasHighDepth).toBe(true)
    expect(m.hasSerene).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasPeaceful).toBe(true)
    expect(m.hasComposed).toBe(true)
    expect(m.hasTranquil).toBe(true)
    expect(m.hasSteady).toBe(true)
  })

  it('detects erratic var usage', () => {
    const m = measureCalming('var x = 1')
    expect(m.erraticCount).toBe(1)
    expect(m.hasNoErratic).toBe(false)
  })

  it('detects chaotic any usage', () => {
    const m = measureCalming('const x: any = 1')
    expect(m.chaoticCount).toBe(1)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects frantic eval usage', () => {
    const m = measureCalming('eval("1")')
    expect(m.hasNoFrantic).toBe(false)
  })

  it('detects agitated debugger usage', () => {
    const m = measureCalming('debugger')
    expect(m.hasNoAgitated).toBe(false)
  })
})

// ─── classifySapphireCondition ──────────────────────────────────────

describe('classifySapphireCondition', () => {
  it('classifies star-sapphire for 85+', () => {
    expect(classifySapphireCondition(85)).toBe('star-sapphire')
    expect(classifySapphireCondition(100)).toBe('star-sapphire')
  })

  it('classifies royal-gem for 70+', () => {
    expect(classifySapphireCondition(70)).toBe('royal-gem')
  })

  it('classifies proper-sapphire for 55+', () => {
    expect(classifySapphireCondition(55)).toBe('proper-sapphire')
  })

  it('classifies industrial-corundum for 40+', () => {
    expect(classifySapphireCondition(40)).toBe('industrial-corundum')
  })

  it('classifies cloudy-stone for 25+', () => {
    expect(classifySapphireCondition(25)).toBe('cloudy-stone')
  })

  it('classifies gravel for below 25', () => {
    expect(classifySapphireCondition(0)).toBe('gravel')
    expect(classifySapphireCondition(24)).toBe('gravel')
  })
})

// ─── classifyVaultType ──────────────────────────────────────────────

describe('classifyVaultType', () => {
  it('returns no-vault for empty gazes', () => {
    expect(classifyVaultType([])).toBe('no-vault')
  })

  it('returns no-vault for low quality', () => {
    const gazes = [analyzeSapphireGaze(minimalContent, 'a.ts')]
    expect(classifyVaultType(gazes)).toBe('no-vault')
  })

  it('returns royal-treasury for high quality', () => {
    const gazes = [analyzeSapphireGaze(richContent, 'a.ts'), analyzeSapphireGaze(richContent, 'b.ts')]
    expect(classifyVaultType(gazes)).toBe('royal-treasury')
  })

  it('returns display-case for low-mid quality', () => {
    const gazes = [analyzeSapphireGaze('export const x: string = "hi"', 'a.ts')]
    expect(classifyVaultType(gazes)).toBe('display-case')
  })
})

// ─── classifyVaultCondition ─────────────────────────────────────────

describe('classifyVaultCondition', () => {
  it('classifies crown-jewels for 75+', () => {
    expect(classifyVaultCondition(75)).toBe('crown-jewels')
  })

  it('classifies precious-collection for 60+', () => {
    expect(classifyVaultCondition(60)).toBe('precious-collection')
  })

  it('classifies decent-gems for 45+', () => {
    expect(classifyVaultCondition(45)).toBe('decent-gems')
  })

  it('classifies common-stones for 30+', () => {
    expect(classifyVaultCondition(30)).toBe('common-stones')
  })

  it('classifies fakes for 15+', () => {
    expect(classifyVaultCondition(15)).toBe('fakes')
  })

  it('classifies empty for below 15', () => {
    expect(classifyVaultCondition(0)).toBe('empty')
  })
})

// ─── classifySeerGrade ──────────────────────────────────────────────

describe('classifySeerGrade', () => {
  it('classifies oracle for 80+', () => {
    expect(classifySeerGrade(80)).toBe('oracle')
    expect(classifySeerGrade(100)).toBe('oracle')
  })

  it('classifies royal-seer for 65+', () => {
    expect(classifySeerGrade(65)).toBe('royal-seer')
  })

  it('classifies skilled-diviner for 50+', () => {
    expect(classifySeerGrade(50)).toBe('skilled-diviner')
  })

  it('classifies apprentice for 35+', () => {
    expect(classifySeerGrade(35)).toBe('apprentice')
  })

  it('classifies novice for 20+', () => {
    expect(classifySeerGrade(20)).toBe('novice')
  })

  it('classifies blind-fortune-teller for below 20', () => {
    expect(classifySeerGrade(0)).toBe('blind-fortune-teller')
  })
})

// ─── analyzeSapphireGaze ────────────────────────────────────────────

describe('analyzeSapphireGaze', () => {
  it('analyzes minimal content', () => {
    const gaze = analyzeSapphireGaze(minimalContent, 'test.ts')
    expect(gaze.file).toBe('test.ts')
    expect(gaze.visionClarity).toBe(8)
    expect(gaze.hardnessGrade).toBe(0)
    expect(gaze.colorRoyalty).toBe(8)
    expect(gaze.brillianceLevel).toBe(0)
    expect(gaze.calmDepth).toBe(8)
    expect(gaze.qualityScore).toBe(5)
    expect(gaze.condition).toBe('gravel')
  })

  it('analyzes rich content', () => {
    const gaze = analyzeSapphireGaze(richContent, 'rich.ts')
    expect(gaze.visionClarity).toBe(100)
    expect(gaze.hardnessGrade).toBe(100)
    expect(gaze.colorRoyalty).toBe(100)
    expect(gaze.brillianceLevel).toBe(100)
    expect(gaze.calmDepth).toBe(100)
    expect(gaze.qualityScore).toBe(100)
    expect(gaze.condition).toBe('star-sapphire')
  })

  it('analyzes empty content', () => {
    const gaze = analyzeSapphireGaze('', 'empty.ts')
    expect(gaze.qualityScore).toBe(0)
    expect(gaze.condition).toBe('gravel')
  })

  it('preserves all measure objects', () => {
    const gaze = analyzeSapphireGaze(richContent, 'test.ts')
    expect(gaze.seeing).toBeDefined()
    expect(gaze.hardening).toBeDefined()
    expect(gaze.coloring).toBeDefined()
    expect(gaze.shining).toBeDefined()
    expect(gaze.calming).toBeDefined()
  })
})

// ─── analyzeSapphireVault ───────────────────────────────────────────

describe('analyzeSapphireVault', () => {
  it('handles empty gazes', () => {
    const vault = analyzeSapphireVault([], 'empty')
    expect(vault.directory).toBe('empty')
    expect(vault.gazes).toHaveLength(0)
    expect(vault.avgClarity).toBe(0)
    expect(vault.avgHardness).toBe(0)
    expect(vault.avgCalm).toBe(0)
    expect(vault.starSapphireCount).toBe(0)
    expect(vault.gravelCount).toBe(0)
    expect(vault.vaultType).toBe('no-vault')
    expect(vault.condition).toBe('empty')
  })

  it('analyzes single gaze vault', () => {
    const gazes = [analyzeSapphireGaze(richContent, 'dir/a.ts')]
    const vault = analyzeSapphireVault(gazes, 'dir')
    expect(vault.gazes).toHaveLength(1)
    expect(vault.avgClarity).toBe(100)
    expect(vault.starSapphireCount).toBe(1)
    expect(vault.gravelCount).toBe(0)
  })

  it('analyzes mixed quality vault', () => {
    const gazes = [
      analyzeSapphireGaze(richContent, 'dir/a.ts'),
      analyzeSapphireGaze(minimalContent, 'dir/b.ts'),
    ]
    const vault = analyzeSapphireVault(gazes, 'dir')
    expect(vault.gazes).toHaveLength(2)
    expect(vault.avgClarity).toBe(54)
    expect(vault.gravelCount).toBe(1)
  })
})

// ─── buildSapphireEyeResult ────────────────────────────────────────

describe('buildSapphireEyeResult', () => {
  it('handles empty input', async () => {
    const result = await buildSapphireEyeResult([], [])
    expect(result.gazes).toHaveLength(0)
    expect(result.vaults).toHaveLength(0)
    expect(result.crown.avgClarity).toBe(0)
    expect(result.crown.isWise).toBe(false)
    expect(result.crown.overallWisdom).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalVaults).toBe(0)
    expect(result.stats.seerGrade).toBe('blind-fortune-teller')
  })

  it('handles single rich file', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [richContent])
    expect(result.gazes).toHaveLength(1)
    expect(result.gazes[0]!.condition).toBe('star-sapphire')
    expect(result.crown.isWise).toBe(true)
    expect(result.crown.overallWisdom).toBe(100)
    expect(result.stats.starSapphireCount).toBe(1)
    expect(result.stats.seerGrade).toBe('oracle')
    expect(result.stats.bestGaze).toBe('a.ts')
    expect(result.stats.clearest).toBe('a.ts')
    expect(result.stats.hardest).toBe('a.ts')
    expect(result.stats.mostRoyal).toBe('a.ts')
    expect(result.stats.mostBrilliant).toBe('a.ts')
  })

  it('handles single minimal file', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [minimalContent])
    expect(result.gazes).toHaveLength(1)
    expect(result.gazes[0]!.qualityScore).toBe(5)
    expect(result.crown.isWise).toBe(false)
    expect(result.stats.gravelCount).toBe(1)
  })

  it('groups files by directory into vaults', async () => {
    const result = await buildSapphireEyeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.vaults).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalVaults).toBe(2)
  })

  it('computes overallWisdom as avg of clarity, hardness, calm', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [richContent])
    expect(result.crown.overallWisdom).toBe(Math.round((100 + 100 + 100) / 3))
  })

  it('computes overallWisdom for minimal content', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [minimalContent])
    expect(result.crown.overallWisdom).toBe(Math.round((8 + 0 + 8) / 3))
  })

  it('tracks high counts for each measure', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighGradeCount).toBe(1)
    expect(result.stats.hasHighRoyaltyCount).toBe(1)
    expect(result.stats.hasHighLevelCount).toBe(1)
    expect(result.stats.hasHighDepthCount).toBe(1)
  })

  it('tracks condition counts', async () => {
    const result = await buildSapphireEyeResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, minimalContent, 'export interface Foo<T> {}'],
    )
    expect(typeof result.stats.starSapphireCount).toBe('number')
    expect(typeof result.stats.royalGemCount).toBe('number')
    expect(typeof result.stats.properSapphireCount).toBe('number')
    expect(typeof result.stats.industrialCorundumCount).toBe('number')
    expect(typeof result.stats.cloudyStoneCount).toBe('number')
    expect(typeof result.stats.gravelCount).toBe('number')
    expect(result.stats.gravelCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends vision improvement', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('vision clarity'))
    expect(rec).toBeTruthy()
  })

  it('recommends hardness improvement', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Harden'))
    expect(rec).toBeTruthy()
  })

  it('recommends royalty improvement', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('color royalty'))
    expect(rec).toBeTruthy()
  })

  it('recommends brilliance improvement', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('brilliance'))
    expect(rec).toBeTruthy()
  })

  it('recommends calm improvement', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('calm'))
    expect(rec).toBeTruthy()
  })

  it('warns about gravel files', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('gravel'))
    expect(rec).toBeTruthy()
  })

  it('praises oracle-quality collection', async () => {
    const files = Array.from({ length: 10 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 10 }, () => richContent)
    const result = await buildSapphireEyeResult(files, contents)
    const rec = result.recommendations.find(r => r.includes('oracle-quality'))
    expect(rec).toBeTruthy()
  })

  it('warns when all vaults are display cases or empty', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('display cases or empty'))
    expect(rec).toBeTruthy()
  })

  it('suggests polishing specific gravel files', async () => {
    const result = await buildSapphireEyeResult(
      ['a.ts', 'b.ts'],
      [minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Polish these gravel'))
    expect(rec).toBeTruthy()
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────

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
  it('returns a string for star-sapphire', () => {
    expect(typeof colorGrade('star-sapphire')).toBe('string')
  })
  it('returns a string for gravel', () => {
    expect(typeof colorGrade('gravel')).toBe('string')
  })
  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatGazeTable', () => {
  it('formats a gaze', () => {
    const gaze = analyzeSapphireGaze(richContent, 'test.ts')
    const output = formatGazeTable(gaze)
    expect(output).toContain('test.ts')
    expect(output).toContain('Vision')
    expect(output).toContain('Hardness')
    expect(output).toContain('Royalty')
    expect(output).toContain('Brilliance')
    expect(output).toContain('Calm')
  })
})

describe('formatGazesTable', () => {
  it('handles empty gazes', () => {
    expect(formatGazesTable([])).toContain('No sapphire gazes')
  })
  it('formats multiple gazes', () => {
    const gazes = [analyzeSapphireGaze(richContent, 'a.ts'), analyzeSapphireGaze(minimalContent, 'b.ts')]
    const output = formatGazesTable(gazes)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatVaultTable', () => {
  it('formats a vault', () => {
    const gazes = [analyzeSapphireGaze(richContent, 'dir/a.ts')]
    const vault = analyzeSapphireVault(gazes, 'dir')
    const output = formatVaultTable(vault)
    expect(output).toContain('dir')
    expect(output).toContain('Vault')
  })
})

describe('formatVaultsTable', () => {
  it('handles empty vaults', () => {
    expect(formatVaultsTable([])).toContain('No sapphire vaults')
  })
  it('formats multiple vaults', () => {
    const gazes = [analyzeSapphireGaze(richContent, 'src/a.ts')]
    const vaults = [analyzeSapphireVault(gazes, 'src')]
    expect(formatVaultsTable(vaults)).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Sapphire Eye Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Seer Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X', 'Improve Y'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Sapphire Eye Analysis')
    expect(output).toContain('Sapphire Vault Analysis')
    expect(output).toContain('Sapphire Eye Statistics')
    expect(output).toContain('Crown')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.gazes).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.crown.isWise).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const gaze = analyzeSapphireGaze('   \n\t  ', 'blank.ts')
    expect(gaze.visionClarity).toBe(0)
    expect(gaze.qualityScore).toBe(0)
    expect(gaze.condition).toBe('gravel')
  })

  it('handles content with only comments', () => {
    const gaze = analyzeSapphireGaze('// just a comment\n/* block */', 'comment.ts')
    expect(gaze.visionClarity).toBe(0)
    expect(gaze.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const result = await buildSapphireEyeResult(['big.ts'], [richContent.repeat(100)])
    expect(result.gazes).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildSapphireEyeResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.starSapphireCount).toBe(50)
  })

  it('handles single file vault', async () => {
    const result = await buildSapphireEyeResult(['single.ts'], [richContent])
    expect(result.vaults).toHaveLength(1)
    expect(result.vaults[0]!.gazes).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const gaze = analyzeSapphireGaze(richContent, 'cap.ts')
    expect(gaze.qualityScore).toBeLessThanOrEqual(100)
    expect(gaze.visionClarity).toBeLessThanOrEqual(100)
    expect(gaze.hardnessGrade).toBeLessThanOrEqual(100)
    expect(gaze.colorRoyalty).toBeLessThanOrEqual(100)
    expect(gaze.brillianceLevel).toBeLessThanOrEqual(100)
    expect(gaze.calmDepth).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildSapphireEyeResult([], [])
    const r2 = await buildSapphireEyeResult(['a.ts'], [richContent])
    const r3 = await buildSapphireEyeResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })

  it('seer grade tracked in stats', async () => {
    const result = await buildSapphireEyeResult(['a.ts'], [richContent])
    expect(result.stats.seerGrade).toBe('oracle')
  })

  it('best gaze tracks highest quality score', async () => {
    const result = await buildSapphireEyeResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestGaze).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.hardest).toBe('high.ts')
    expect(result.stats.mostRoyal).toBe('high.ts')
    expect(result.stats.mostBrilliant).toBe('high.ts')
  })
})
