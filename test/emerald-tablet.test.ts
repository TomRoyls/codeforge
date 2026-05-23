import { describe, it, expect } from 'vitest'
import {
  measureInscribing,
  measureStrengthening,
  measureDeepening,
  measurePurifying,
  measureTransmuting,
  classifyTabletCondition,
  classifyArchiveType,
  classifySageGrade,
  classifyArchiveCondition,
  analyzeTabletInscription,
  analyzeTabletArchive,
  buildEmeraldTabletResult,
  generateRecommendations,
} from '../src/commands/emerald-tablet-helpers.js'
import {
  colorScore,
  colorGrade,
  formatInscriptionTable,
  formatInscriptionsTable,
  formatArchiveTable,
  formatArchivesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/emerald-tablet-format-helpers.js'

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

// ─── measureInscribing ─────────────────────────────────────────────

describe('measureInscribing', () => {
  it('returns 0 for empty content', () => {
    const m = measureInscribing('')
    expect(m.clarity).toBe(0)
    expect(m.grade).toBe('blank-tablet')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureInscribing(minimalContent)
    expect(m.clarity).toBe(8)
    expect(m.grade).toBe('blank-tablet')
    expect(m.hasDocumented).toBe(false)
    expect(m.undocumentedCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureInscribing(richContent)
    expect(m.clarity).toBe(100)
    expect(m.grade).toBe('divine-script')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasExplicit).toBe(true)
    expect(m.hasExpressive).toBe(true)
    expect(m.hasRevealing).toBe(true)
  })

  it('detects undocumented var usage', () => {
    const m = measureInscribing('var x = 1')
    expect(m.undocumentedCount).toBe(1)
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('detects cryptic any usage', () => {
    const m = measureInscribing('const x: any = 1')
    expect(m.crypticCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects implicit eval usage', () => {
    const m = measureInscribing('eval("1")')
    expect(m.hasNoImplicit).toBe(false)
  })

  it('detects vague debugger usage', () => {
    const m = measureInscribing('debugger')
    expect(m.hasNoVague).toBe(false)
  })

  it('grades faded-text for mid scores', () => {
    const content = '/** doc */ export interface Foo<T> { readonly bar: T }'
    const m = measureInscribing(content)
    expect(m.grade).toBe('faded-text')
  })
})

// ─── measureStrengthening ───────────────────────────────────────────

describe('measureStrengthening', () => {
  it('returns 0 for empty content', () => {
    const m = measureStrengthening('')
    expect(m.strength).toBe(0)
    expect(m.tablet).toBe('dust')
    expect(m.hasHighStrength).toBe(false)
  })

  it('scores minimal content at 0', () => {
    const m = measureStrengthening(minimalContent)
    expect(m.strength).toBe(0)
    expect(m.tablet).toBe('dust')
    expect(m.hasSolid).toBe(false)
    expect(m.fragileCount).toBe(0)
    expect(m.shakyCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureStrengthening(richContent)
    expect(m.strength).toBe(100)
    expect(m.tablet).toBe('adamantine')
    expect(m.hasHighStrength).toBe(true)
    expect(m.hasSolid).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasFoundational).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasResilient).toBe(true)
  })

  it('detects fragile var usage', () => {
    const m = measureStrengthening('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects shaky any usage', () => {
    const m = measureStrengthening('const x: any = 1')
    expect(m.shakyCount).toBe(1)
    expect(m.hasNoShaky).toBe(false)
  })

  it('detects weak eval usage', () => {
    const m = measureStrengthening('eval("1")')
    expect(m.hasNoWeak).toBe(false)
  })

  it('detects unstable debugger usage', () => {
    const m = measureStrengthening('debugger')
    expect(m.hasNoUnstable).toBe(false)
  })
})

// ─── measureDeepening ──────────────────────────────────────────────

describe('measureDeepening', () => {
  it('returns 0 for empty content', () => {
    const m = measureDeepening('')
    expect(m.depth).toBe(0)
    expect(m.enigma).toBe('no-depth')
    expect(m.hasHighDepth).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureDeepening(minimalContent)
    expect(m.depth).toBe(8)
    expect(m.enigma).toBe('no-depth')
    expect(m.hasProfound).toBe(false)
    expect(m.superficialCount).toBe(0)
    expect(m.trivialCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureDeepening(richContent)
    expect(m.depth).toBe(100)
    expect(m.enigma).toBe('profound-mystery')
    expect(m.hasHighDepth).toBe(true)
    expect(m.hasProfound).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasComplex).toBe(true)
    expect(m.hasSubstantive).toBe(true)
    expect(m.hasRich).toBe(true)
    expect(m.hasLayered).toBe(true)
  })

  it('detects superficial var usage', () => {
    const m = measureDeepening('var x = 1')
    expect(m.superficialCount).toBe(1)
    expect(m.hasNoSuperficial).toBe(false)
  })

  it('detects trivial any usage', () => {
    const m = measureDeepening('const x: any = 1')
    expect(m.trivialCount).toBe(1)
    expect(m.hasNoTrivial).toBe(false)
  })

  it('detects shallow eval usage', () => {
    const m = measureDeepening('eval("1")')
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects thin debugger usage', () => {
    const m = measureDeepening('debugger')
    expect(m.hasNoThin).toBe(false)
  })
})

// ─── measurePurifying ──────────────────────────────────────────────

describe('measurePurifying', () => {
  it('returns 0 for empty content', () => {
    const m = measurePurifying('')
    expect(m.purity).toBe(0)
    expect(m.hermetic).toBe('open-wound')
    expect(m.hasHighPurity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measurePurifying(minimalContent)
    expect(m.purity).toBe(8)
    expect(m.hermetic).toBe('open-wound')
    expect(m.hasClean).toBe(false)
    expect(m.leakingCount).toBe(0)
    expect(m.pollutedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measurePurifying(richContent)
    expect(m.purity).toBe(100)
    expect(m.hermetic).toBe('sealed-vessel')
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasIsolated).toBe(true)
    expect(m.hasPure).toBe(true)
    expect(m.hasEncapsulated).toBe(true)
    expect(m.hasSealed).toBe(true)
    expect(m.hasContained).toBe(true)
  })

  it('detects leaking var usage', () => {
    const m = measurePurifying('var x = 1')
    expect(m.leakingCount).toBe(1)
    expect(m.hasNoLeaking).toBe(false)
  })

  it('detects polluted any usage', () => {
    const m = measurePurifying('const x: any = 1')
    expect(m.pollutedCount).toBe(1)
    expect(m.hasNoPolluted).toBe(false)
  })

  it('detects exposed eval usage', () => {
    const m = measurePurifying('eval("1")')
    expect(m.hasNoExposed).toBe(false)
  })

  it('detects breached debugger usage', () => {
    const m = measurePurifying('debugger')
    expect(m.hasNoBreached).toBe(false)
  })
})

// ─── measureTransmuting ────────────────────────────────────────────

describe('measureTransmuting', () => {
  it('returns 0 for empty content', () => {
    const m = measureTransmuting('')
    expect(m.wisdom).toBe(0)
    expect(m.alchemy).toBe('no-transmutation')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores minimal content at 0', () => {
    const m = measureTransmuting(minimalContent)
    expect(m.wisdom).toBe(0)
    expect(m.alchemy).toBe('no-transmutation')
    expect(m.hasTransformative).toBe(false)
    expect(m.stagnantCount).toBe(0)
    expect(m.degradingCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureTransmuting(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.alchemy).toBe('philosopher-stone')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasTransformative).toBe(true)
    expect(m.hasEvolving).toBe(true)
    expect(m.hasImproving).toBe(true)
    expect(m.hasWise).toBe(true)
    expect(m.hasLearned).toBe(true)
    expect(m.hasSagacious).toBe(true)
  })

  it('detects stagnant var usage', () => {
    const m = measureTransmuting('var x = 1')
    expect(m.stagnantCount).toBe(1)
    expect(m.hasNoStagnant).toBe(false)
  })

  it('detects degrading any usage', () => {
    const m = measureTransmuting('const x: any = 1')
    expect(m.degradingCount).toBe(1)
    expect(m.hasNoDegrading).toBe(false)
  })

  it('detects foolish eval usage', () => {
    const m = measureTransmuting('eval("1")')
    expect(m.hasNoFoolish).toBe(false)
  })

  it('detects ignorant debugger usage', () => {
    const m = measureTransmuting('debugger')
    expect(m.hasNoIgnorant).toBe(false)
  })
})

// ─── classifyTabletCondition ───────────────────────────────────────

describe('classifyTabletCondition', () => {
  it('classifies hermetic-masterpiece for 85+', () => {
    expect(classifyTabletCondition(85)).toBe('hermetic-masterpiece')
    expect(classifyTabletCondition(100)).toBe('hermetic-masterpiece')
  })

  it('classifies sacred-tablet for 70+', () => {
    expect(classifyTabletCondition(70)).toBe('sacred-tablet')
  })

  it('classifies proper-scroll for 55+', () => {
    expect(classifyTabletCondition(55)).toBe('proper-scroll')
  })

  it('classifies worn-inscription for 40+', () => {
    expect(classifyTabletCondition(40)).toBe('worn-inscription')
  })

  it('classifies broken-fragment for 25+', () => {
    expect(classifyTabletCondition(25)).toBe('broken-fragment')
  })

  it('classifies dust for below 25', () => {
    expect(classifyTabletCondition(0)).toBe('dust')
    expect(classifyTabletCondition(24)).toBe('dust')
  })
})

// ─── classifyArchiveType ───────────────────────────────────────────

describe('classifyArchiveType', () => {
  it('returns no-archive for empty inscriptions', () => {
    expect(classifyArchiveType([])).toBe('no-archive')
  })

  it('returns no-archive for low quality', () => {
    const inscriptions = [analyzeTabletInscription(minimalContent, 'a.ts')]
    expect(classifyArchiveType(inscriptions)).toBe('no-archive')
  })

  it('returns great-library for high quality with high masterpiece ratio', () => {
    const inscriptions = [analyzeTabletInscription(richContent, 'a.ts'), analyzeTabletInscription(richContent, 'b.ts')]
    expect(classifyArchiveType(inscriptions)).toBe('great-library')
  })

  it('returns scrap-pile for low-mid quality', () => {
    const inscriptions = [analyzeTabletInscription('export const x: string = "hi"', 'a.ts')]
    expect(classifyArchiveType(inscriptions)).toBe('scrap-pile')
  })
})

// ─── classifyArchiveCondition ──────────────────────────────────────

describe('classifyArchiveCondition', () => {
  it('classifies pristine-collection for 75+', () => {
    expect(classifyArchiveCondition(75)).toBe('pristine-collection')
  })

  it('classifies well-preserved for 60+', () => {
    expect(classifyArchiveCondition(60)).toBe('well-preserved')
  })

  it('classifies decent-records for 45+', () => {
    expect(classifyArchiveCondition(45)).toBe('decent-records')
  })

  it('classifies fading-ink for 30+', () => {
    expect(classifyArchiveCondition(30)).toBe('fading-ink')
  })

  it('classifies crumbling-scrolls for 15+', () => {
    expect(classifyArchiveCondition(15)).toBe('crumbling-scrolls')
  })

  it('classifies ruins for below 15', () => {
    expect(classifyArchiveCondition(0)).toBe('ruins')
  })
})

// ─── classifySageGrade ─────────────────────────────────────────────

describe('classifySageGrade', () => {
  it('classifies archmage for 80+', () => {
    expect(classifySageGrade(80)).toBe('archmage')
    expect(classifySageGrade(100)).toBe('archmage')
  })

  it('classifies master-sage for 65+', () => {
    expect(classifySageGrade(65)).toBe('master-sage')
  })

  it('classifies learned-scholar for 50+', () => {
    expect(classifySageGrade(50)).toBe('learned-scholar')
  })

  it('classifies student for 35+', () => {
    expect(classifySageGrade(35)).toBe('student')
  })

  it('classifies novice for 20+', () => {
    expect(classifySageGrade(20)).toBe('novice')
  })

  it('classifies illiterate for below 20', () => {
    expect(classifySageGrade(0)).toBe('illiterate')
  })
})

// ─── analyzeTabletInscription ──────────────────────────────────────

describe('analyzeTabletInscription', () => {
  it('analyzes minimal content', () => {
    const inscription = analyzeTabletInscription(minimalContent, 'test.ts')
    expect(inscription.file).toBe('test.ts')
    expect(inscription.inscriptionClarity).toBe(8)
    expect(inscription.tabletStrength).toBe(0)
    expect(inscription.enigmaticDepth).toBe(8)
    expect(inscription.hermeticPurity).toBe(8)
    expect(inscription.transmutationWisdom).toBe(0)
    expect(inscription.qualityScore).toBe(5)
    expect(inscription.condition).toBe('dust')
  })

  it('analyzes rich content', () => {
    const inscription = analyzeTabletInscription(richContent, 'rich.ts')
    expect(inscription.inscriptionClarity).toBe(100)
    expect(inscription.tabletStrength).toBe(100)
    expect(inscription.enigmaticDepth).toBe(100)
    expect(inscription.hermeticPurity).toBe(100)
    expect(inscription.transmutationWisdom).toBe(100)
    expect(inscription.qualityScore).toBe(100)
    expect(inscription.condition).toBe('hermetic-masterpiece')
  })

  it('analyzes empty content', () => {
    const inscription = analyzeTabletInscription('', 'empty.ts')
    expect(inscription.qualityScore).toBe(0)
    expect(inscription.condition).toBe('dust')
  })

  it('preserves all measure objects', () => {
    const inscription = analyzeTabletInscription(richContent, 'test.ts')
    expect(inscription.inscribing).toBeDefined()
    expect(inscription.strengthening).toBeDefined()
    expect(inscription.deepening).toBeDefined()
    expect(inscription.purifying).toBeDefined()
    expect(inscription.transmuting).toBeDefined()
  })
})

// ─── analyzeTabletArchive ──────────────────────────────────────────

describe('analyzeTabletArchive', () => {
  it('handles empty inscriptions', () => {
    const archive = analyzeTabletArchive([], 'empty')
    expect(archive.directory).toBe('empty')
    expect(archive.inscriptions).toHaveLength(0)
    expect(archive.avgClarity).toBe(0)
    expect(archive.avgStrength).toBe(0)
    expect(archive.avgDepth).toBe(0)
    expect(archive.hermeticMasterpieceCount).toBe(0)
    expect(archive.dustCount).toBe(0)
    expect(archive.archiveType).toBe('no-archive')
    expect(archive.condition).toBe('ruins')
  })

  it('analyzes single inscription archive', () => {
    const inscriptions = [analyzeTabletInscription(richContent, 'dir/a.ts')]
    const archive = analyzeTabletArchive(inscriptions, 'dir')
    expect(archive.inscriptions).toHaveLength(1)
    expect(archive.avgClarity).toBe(100)
    expect(archive.hermeticMasterpieceCount).toBe(1)
    expect(archive.dustCount).toBe(0)
  })

  it('analyzes mixed quality archive', () => {
    const inscriptions = [
      analyzeTabletInscription(richContent, 'dir/a.ts'),
      analyzeTabletInscription(minimalContent, 'dir/b.ts'),
    ]
    const archive = analyzeTabletArchive(inscriptions, 'dir')
    expect(archive.inscriptions).toHaveLength(2)
    expect(archive.avgClarity).toBe(54)
    expect(archive.dustCount).toBe(1)
  })
})

// ─── buildEmeraldTabletResult ──────────────────────────────────────

describe('buildEmeraldTabletResult', () => {
  it('handles empty input', async () => {
    const result = await buildEmeraldTabletResult([], [])
    expect(result.inscriptions).toHaveLength(0)
    expect(result.archives).toHaveLength(0)
    expect(result.library.avgClarity).toBe(0)
    expect(result.library.isEnlightened).toBe(false)
    expect(result.library.overallWisdom).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalArchives).toBe(0)
    expect(result.stats.sageGrade).toBe('illiterate')
  })

  it('handles single rich file', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [richContent])
    expect(result.inscriptions).toHaveLength(1)
    expect(result.inscriptions[0]!.condition).toBe('hermetic-masterpiece')
    expect(result.library.isEnlightened).toBe(true)
    expect(result.library.overallWisdom).toBe(100)
    expect(result.stats.hermeticMasterpieceCount).toBe(1)
    expect(result.stats.sageGrade).toBe('archmage')
    expect(result.stats.bestInscription).toBe('a.ts')
    expect(result.stats.clearest).toBe('a.ts')
    expect(result.stats.strongest).toBe('a.ts')
    expect(result.stats.deepest).toBe('a.ts')
    expect(result.stats.purest).toBe('a.ts')
  })

  it('handles single minimal file', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [minimalContent])
    expect(result.inscriptions).toHaveLength(1)
    expect(result.inscriptions[0]!.qualityScore).toBe(5)
    expect(result.library.isEnlightened).toBe(false)
    expect(result.stats.dustCount).toBe(1)
  })

  it('groups files by directory into archives', async () => {
    const result = await buildEmeraldTabletResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.archives).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalArchives).toBe(2)
  })

  it('computes overallWisdom as avg of clarity, strength, depth', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [richContent])
    expect(result.library.overallWisdom).toBe(Math.round((100 + 100 + 100) / 3))
  })

  it('computes overallWisdom for minimal content', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [minimalContent])
    expect(result.library.overallWisdom).toBe(Math.round((8 + 0 + 8) / 3))
  })

  it('tracks high counts for each measure', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighDepthCount).toBe(1)
    expect(result.stats.hasHighPurityCount).toBe(1)
    expect(result.stats.hasHighWisdomCount).toBe(1)
  })

  it('tracks condition counts', async () => {
    const result = await buildEmeraldTabletResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, minimalContent, 'export interface Foo<T> {}'],
    )
    expect(typeof result.stats.hermeticMasterpieceCount).toBe('number')
    expect(typeof result.stats.sacredTabletCount).toBe('number')
    expect(typeof result.stats.properScrollCount).toBe('number')
    expect(typeof result.stats.wornInscriptionCount).toBe('number')
    expect(typeof result.stats.brokenFragmentCount).toBe('number')
    expect(typeof result.stats.dustCount).toBe('number')
    expect(result.stats.dustCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends clarity improvement', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('inscription clarity'))
    expect(rec).toBeTruthy()
  })

  it('recommends strength improvement', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Strengthen'))
    expect(rec).toBeTruthy()
  })

  it('recommends depth improvement', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('enigmatic') || r.includes('Deepen'))
    expect(rec).toBeTruthy()
  })

  it('recommends purity improvement', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('hermetic') || r.includes('Purify'))
    expect(rec).toBeTruthy()
  })

  it('recommends wisdom improvement', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('transmutation') || r.includes('wisdom'))
    expect(rec).toBeTruthy()
  })

  it('warns about dust files', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('dust'))
    expect(rec).toBeTruthy()
  })

  it('praises archmage-quality collection', async () => {
    const files = Array.from({ length: 10 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 10 }, () => richContent)
    const result = await buildEmeraldTabletResult(files, contents)
    const rec = result.recommendations.find(r => r.includes('archmage-quality'))
    expect(rec).toBeTruthy()
  })

  it('warns when all archives are scrap piles or empty', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('scrap piles or empty'))
    expect(rec).toBeTruthy()
  })

  it('suggests transmuting specific dust files', async () => {
    const result = await buildEmeraldTabletResult(
      ['a.ts', 'b.ts'],
      [minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Transmute these dust'))
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
  it('returns a string for hermetic-masterpiece', () => {
    expect(typeof colorGrade('hermetic-masterpiece')).toBe('string')
  })

  it('returns a string for dust', () => {
    expect(typeof colorGrade('dust')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatInscriptionTable', () => {
  it('formats an inscription', () => {
    const inscription = analyzeTabletInscription(richContent, 'test.ts')
    const output = formatInscriptionTable(inscription)
    expect(output).toContain('test.ts')
    expect(output).toContain('Clarity')
    expect(output).toContain('Strength')
    expect(output).toContain('Depth')
    expect(output).toContain('Purity')
    expect(output).toContain('Wisdom')
  })
})

describe('formatInscriptionsTable', () => {
  it('handles empty inscriptions', () => {
    const output = formatInscriptionsTable([])
    expect(output).toContain('No tablet inscriptions')
  })

  it('formats multiple inscriptions', () => {
    const inscriptions = [
      analyzeTabletInscription(richContent, 'a.ts'),
      analyzeTabletInscription(minimalContent, 'b.ts'),
    ]
    const output = formatInscriptionsTable(inscriptions)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatArchiveTable', () => {
  it('formats an archive', () => {
    const inscriptions = [analyzeTabletInscription(richContent, 'dir/a.ts')]
    const archive = analyzeTabletArchive(inscriptions, 'dir')
    const output = formatArchiveTable(archive)
    expect(output).toContain('dir')
    expect(output).toContain('Archive')
  })
})

describe('formatArchivesTable', () => {
  it('handles empty archives', () => {
    const output = formatArchivesTable([])
    expect(output).toContain('No tablet archives')
  })

  it('formats multiple archives', () => {
    const inscriptions = [analyzeTabletInscription(richContent, 'src/a.ts')]
    const archives = [analyzeTabletArchive(inscriptions, 'src')]
    const output = formatArchivesTable(archives)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Emerald Tablet Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Sage Grade')
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
    const result = await buildEmeraldTabletResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Emerald Tablet Analysis')
    expect(output).toContain('Tablet Archive Analysis')
    expect(output).toContain('Emerald Tablet Statistics')
    expect(output).toContain('Library')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.inscriptions).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.library.isEnlightened).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const inscription = analyzeTabletInscription('   \n\t  ', 'blank.ts')
    expect(inscription.inscriptionClarity).toBe(0)
    expect(inscription.qualityScore).toBe(0)
    expect(inscription.condition).toBe('dust')
  })

  it('handles content with only comments', () => {
    const inscription = analyzeTabletInscription('// just a comment\n/* block */', 'comment.ts')
    expect(inscription.inscriptionClarity).toBe(0)
    expect(inscription.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildEmeraldTabletResult(['big.ts'], [longContent])
    expect(result.inscriptions).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildEmeraldTabletResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.hermeticMasterpieceCount).toBe(50)
  })

  it('handles single file archive', async () => {
    const result = await buildEmeraldTabletResult(['single.ts'], [richContent])
    expect(result.archives).toHaveLength(1)
    expect(result.archives[0]!.inscriptions).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const inscription = analyzeTabletInscription(richContent, 'cap.ts')
    expect(inscription.qualityScore).toBeLessThanOrEqual(100)
    expect(inscription.inscriptionClarity).toBeLessThanOrEqual(100)
    expect(inscription.tabletStrength).toBeLessThanOrEqual(100)
    expect(inscription.enigmaticDepth).toBeLessThanOrEqual(100)
    expect(inscription.hermeticPurity).toBeLessThanOrEqual(100)
    expect(inscription.transmutationWisdom).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildEmeraldTabletResult([], [])
    const r2 = await buildEmeraldTabletResult(['a.ts'], [richContent])
    const r3 = await buildEmeraldTabletResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })

  it('sage grade tracked in stats', async () => {
    const result = await buildEmeraldTabletResult(['a.ts'], [richContent])
    expect(result.stats.sageGrade).toBe('archmage')
  })

  it('best inscription tracks highest quality score', async () => {
    const result = await buildEmeraldTabletResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestInscription).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.strongest).toBe('high.ts')
    expect(result.stats.deepest).toBe('high.ts')
    expect(result.stats.purest).toBe('high.ts')
  })
})
