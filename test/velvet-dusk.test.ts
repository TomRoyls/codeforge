import { describe, it, expect } from 'vitest'

import {
  measureSoothing,
  measureComforting,
  measureDraping,
  measureContemplating,
  measurePersisting,
  analyzeVelvetFold,
  analyzeVelvetCurtain,
  buildVelvetDuskResult,
  classifyFoldCondition,
  classifyCurtainType,
  classifyCurtainCondition,
  classifyWeaverGrade,
  generateRecommendations,
  type VelvetFold,
} from '../src/commands/velvet-dusk-helpers.js'

import {
  colorScore,
  colorCondition,
  colorCurtainCondition,
  formatFoldTable,
  formatFoldsTable,
  formatCurtainTable,
  formatCurtainsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/velvet-dusk-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const emptyContent = ''

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

// ─── measureSoothing ────────────────────────────────────

describe('measureSoothing', () => {
  it('returns all fields', () => {
    const result = measureSoothing(richContent)
    expect(result).toHaveProperty('softness')
    expect(result).toHaveProperty('texture')
    expect(result).toHaveProperty('hasHighSoftness')
    expect(result).toHaveProperty('hasApproachable')
    expect(result).toHaveProperty('hasNoHostile')
    expect(result).toHaveProperty('hasReadable')
    expect(result).toHaveProperty('hasNoCryptic')
    expect(result).toHaveProperty('hasWelcoming')
    expect(result).toHaveProperty('hasNoIntimidating')
    expect(result).toHaveProperty('hasGentle')
    expect(result).toHaveProperty('hasNoHarsh')
    expect(result).toHaveProperty('hasComfortable')
    expect(result).toHaveProperty('hasSmooth')
    expect(result).toHaveProperty('hasInviting')
    expect(result).toHaveProperty('hasWarm')
    expect(result).toHaveProperty('hasKind')
    expect(result).toHaveProperty('hasForgiving')
    expect(result).toHaveProperty('hasGracious')
    expect(result).toHaveProperty('hostileCount')
    expect(result).toHaveProperty('crypticCount')
  })

  it('detects approachable code', () => {
    expect(measureSoothing(richContent).hasApproachable).toBe(true)
  })

  it('detects hostile patterns', () => {
    const result = measureSoothing('hostile aggressive violent brutal')
    expect(result.hostileCount).toBeGreaterThan(0)
    expect(result.hasNoHostile).toBe(false)
  })

  it('detects readable code', () => {
    expect(measureSoothing(richContent).hasReadable).toBe(true)
  })

  it('detects cryptic names', () => {
    const result = measureSoothing('const a = 1')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects welcoming code (import/export)', () => {
    expect(measureSoothing(richContent).hasWelcoming).toBe(true)
  })

  it('detects intimidating patterns', () => {
    expect(measureSoothing('monolithic god.object enterprise').hasNoIntimidating).toBe(false)
  })

  it('detects smooth code (no any)', () => {
    expect(measureSoothing(richContent).hasSmooth).toBe(true)
  })

  it('detects gracious code (documentation)', () => {
    expect(measureSoothing(richContent).hasGracious).toBe(true)
  })

  it('classifies texture correctly for rich content', () => {
    expect(measureSoothing(richContent).texture).toBe('silk-velvet')
  })

  it('classifies texture correctly for empty content', () => {
    const result = measureSoothing(emptyContent)
    expect(result.softness).toBeLessThan(50)
    expect(result.hasApproachable).toBe(false)
    expect(result.hasReadable).toBe(false)
  })
})

// ─── measureComforting ──────────────────────────────────

describe('measureComforting', () => {
  it('returns all fields', () => {
    const result = measureComforting(richContent)
    expect(result).toHaveProperty('comfort')
    expect(result).toHaveProperty('embrace')
    expect(result).toHaveProperty('hasHighComfort')
    expect(result).toHaveProperty('hasErrorHandled')
    expect(result).toHaveProperty('hasNoUnhandled')
    expect(result).toHaveProperty('hasDefensive')
    expect(result).toHaveProperty('hasRobust')
    expect(result).toHaveProperty('hasForgiving')
    expect(result).toHaveProperty('hasPatient')
    expect(result).toHaveProperty('hasReassuring')
    expect(result).toHaveProperty('hasSupportive')
    expect(result).toHaveProperty('hasSafe')
    expect(result).toHaveProperty('hasProtective')
    expect(result).toHaveProperty('hasGentle')
    expect(result).toHaveProperty('hasUnderstanding')
    expect(result).toHaveProperty('hasAccepting')
    expect(result).toHaveProperty('hasNurturing')
    expect(result).toHaveProperty('hasCaring')
    expect(result).toHaveProperty('unhandledCount')
    expect(result).toHaveProperty('hostileCount')
  })

  it('detects error handling', () => {
    expect(measureComforting(richContent).hasErrorHandled).toBe(true)
  })

  it('detects unhandled (any)', () => {
    const result = measureComforting('const x: any = 1')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects forgiving code (no any)', () => {
    expect(measureComforting(richContent).hasForgiving).toBe(true)
  })

  it('detects hostile patterns', () => {
    const result = measureComforting('hostile aggressive brutal')
    expect(result.hostileCount).toBeGreaterThan(0)
  })

  it('detects vulnerable patterns', () => {
    expect(measureComforting('vulnerable exploit inject').hasCaring).toBe(false)
  })

  it('classifies embrace correctly for rich content', () => {
    expect(measureComforting(richContent).embrace).toBe('safe-haven')
  })
})

// ─── measureDraping ─────────────────────────────────────

describe('measureDraping', () => {
  it('returns all fields', () => {
    const result = measureDraping(richContent)
    expect(result).toHaveProperty('elegance')
    expect(result).toHaveProperty('drape')
    expect(result).toHaveProperty('hasHighElegance')
    expect(result).toHaveProperty('hasElegant')
    expect(result).toHaveProperty('hasNoClunky')
    expect(result).toHaveProperty('hasRefined')
    expect(result).toHaveProperty('hasPolished')
    expect(result).toHaveProperty('hasGraceful')
    expect(result).toHaveProperty('hasSubtle')
    expect(result).toHaveProperty('hasTasteful')
    expect(result).toHaveProperty('hasSophisticated')
    expect(result).toHaveProperty('hasHarmonious')
    expect(result).toHaveProperty('hasBalanced')
    expect(result).toHaveProperty('hasAesthetic')
    expect(result).toHaveProperty('hasCrafted')
    expect(result).toHaveProperty('hasDeliberate')
    expect(result).toHaveProperty('hasArtistic')
    expect(result).toHaveProperty('hasBeautiful')
    expect(result).toHaveProperty('clunkyCount')
    expect(result).toHaveProperty('roughCount')
  })

  it('detects elegant code', () => {
    expect(measureDraping(richContent).hasElegant).toBe(true)
  })

  it('detects clunky patterns', () => {
    const result = measureDraping('clunky ugly hacky gross')
    expect(result.clunkyCount).toBeGreaterThan(0)
    expect(result.hasNoClunky).toBe(false)
  })

  it('detects rough patterns', () => {
    const result = measureDraping('rough crude primitive raw')
    expect(result.roughCount).toBeGreaterThan(0)
  })

  it('detects subtle code (no any)', () => {
    expect(measureDraping(richContent).hasSubtle).toBe(true)
  })

  it('detects artistic code (no var/eval)', () => {
    expect(measureDraping(richContent).hasArtistic).toBe(true)
  })

  it('detects var as non-artistic', () => {
    expect(measureDraping('var x = 1').hasArtistic).toBe(false)
  })

  it('classifies drape correctly for rich content', () => {
    expect(measureDraping(richContent).drape).toBe('haute-couture')
  })
})

// ─── measureContemplating ───────────────────────────────

describe('measureContemplating', () => {
  it('returns all fields', () => {
    const result = measureContemplating(richContent)
    expect(result).toHaveProperty('wisdom')
    expect(result).toHaveProperty('insight')
    expect(result).toHaveProperty('hasHighWisdom')
    expect(result).toHaveProperty('hasWellArchitected')
    expect(result).toHaveProperty('hasNoHacked')
    expect(result).toHaveProperty('hasPrincipled')
    expect(result).toHaveProperty('hasDeep')
    expect(result).toHaveProperty('hasProven')
    expect(result).toHaveProperty('hasReflective')
    expect(result).toHaveProperty('hasContemplative')
    expect(result).toHaveProperty('hasInsightful')
    expect(result).toHaveProperty('hasStrategic')
    expect(result).toHaveProperty('hasMature')
    expect(result).toHaveProperty('hasEvolved')
    expect(result).toHaveProperty('hasPatient')
    expect(result).toHaveProperty('hasThoughtful')
    expect(result).toHaveProperty('hasMindful')
    expect(result).toHaveProperty('hasWise')
    expect(result).toHaveProperty('hackedCount')
    expect(result).toHaveProperty('shallowCount')
  })

  it('detects well-architected code', () => {
    expect(measureContemplating(richContent).hasWellArchitected).toBe(true)
  })

  it('detects hacked patterns', () => {
    const result = measureContemplating('hack: workaround monkey')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const result = measureContemplating('shallow superficial skin.deep')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('detects contemplative code (documentation)', () => {
    expect(measureContemplating(richContent).hasContemplative).toBe(true)
  })

  it('detects evolved code (no any)', () => {
    expect(measureContemplating(richContent).hasEvolved).toBe(true)
  })

  it('classifies insight correctly for rich content', () => {
    expect(measureContemplating(richContent).insight).toBe('night-philosopher')
  })
})

// ─── measurePersisting ──────────────────────────────────

describe('measurePersisting', () => {
  it('returns all fields', () => {
    const result = measurePersisting(richContent)
    expect(result).toHaveProperty('resilience')
    expect(result).toHaveProperty('endurance')
    expect(result).toHaveProperty('hasHighResilience')
    expect(result).toHaveProperty('hasTested')
    expect(result).toHaveProperty('hasNoUntested')
    expect(result).toHaveProperty('hasStable')
    expect(result).toHaveProperty('hasNoVolatile')
    expect(result).toHaveProperty('hasConsistent')
    expect(result).toHaveProperty('hasEnduring')
    expect(result).toHaveProperty('hasReliable')
    expect(result).toHaveProperty('hasPatient')
    expect(result).toHaveProperty('hasPersistent')
    expect(result).toHaveProperty('hasUnyielding')
    expect(result).toHaveProperty('hasResolute')
    expect(result).toHaveProperty('hasSteadfast')
    expect(result).toHaveProperty('hasTireless')
    expect(result).toHaveProperty('hasIndomitable')
    expect(result).toHaveProperty('hasUnfailing')
    expect(result).toHaveProperty('untestedCount')
    expect(result).toHaveProperty('volatileCount')
  })

  it('detects tested code', () => {
    expect(measurePersisting(richContent).hasTested).toBe(true)
  })

  it('detects untested patterns (eval)', () => {
    const result = measurePersisting('eval("code")')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects volatile patterns', () => {
    const result = measurePersisting('volatile unstable fragile')
    expect(result.volatileCount).toBeGreaterThan(0)
    expect(result.hasNoVolatile).toBe(false)
  })

  it('detects consistent code (no any)', () => {
    expect(measurePersisting(richContent).hasConsistent).toBe(true)
  })

  it('detects indomitable code (no vulnerable)', () => {
    expect(measurePersisting(richContent).hasIndomitable).toBe(true)
  })

  it('classifies endurance correctly for rich content', () => {
    expect(measurePersisting(richContent).endurance).toBe('eternal-night')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyFoldCondition', () => {
  it('returns velvet-masterpiece for 90+', () => {
    expect(classifyFoldCondition(90)).toBe('velvet-masterpiece')
  })
  it('returns midnight-silk for 75-89', () => {
    expect(classifyFoldCondition(75)).toBe('midnight-silk')
  })
  it('returns proper-fabric for 60-74', () => {
    expect(classifyFoldCondition(60)).toBe('proper-fabric')
  })
  it('returns coarse-weave for 40-59', () => {
    expect(classifyFoldCondition(40)).toBe('coarse-weave')
  })
  it('returns torn-rag for 20-39', () => {
    expect(classifyFoldCondition(20)).toBe('torn-rag')
  })
  it('returns void for 0-19', () => {
    expect(classifyFoldCondition(0)).toBe('void')
  })
})

describe('classifyCurtainType', () => {
  it('returns no-covering for empty', () => {
    expect(classifyCurtainType([])).toBe('no-covering')
  })
  it('returns grand-curtain for high avg', () => {
    const folds = [{ qualityScore: 90 }].map((f) => ({ ...f } as VelvetFold))
    expect(classifyCurtainType(folds)).toBe('grand-curtain')
  })
  it('returns velvet-drape for 70-84', () => {
    const folds = [{ qualityScore: 70 }].map((f) => ({ ...f } as VelvetFold))
    expect(classifyCurtainType(folds)).toBe('velvet-drape')
  })
  it('returns proper-blinds for 55-69', () => {
    const folds = [{ qualityScore: 55 }].map((f) => ({ ...f } as VelvetFold))
    expect(classifyCurtainType(folds)).toBe('proper-blinds')
  })
  it('returns bedsheet for 35-54', () => {
    const folds = [{ qualityScore: 35 }].map((f) => ({ ...f } as VelvetFold))
    expect(classifyCurtainType(folds)).toBe('bedsheet')
  })
})

describe('classifyCurtainCondition', () => {
  it('returns velvet-theater for 85+', () => {
    expect(classifyCurtainCondition(85)).toBe('velvet-theater')
  })
  it('returns silk-parlor for 70-84', () => {
    expect(classifyCurtainCondition(70)).toBe('silk-parlor')
  })
  it('returns proper-room for 55-69', () => {
    expect(classifyCurtainCondition(55)).toBe('proper-room')
  })
  it('returns bare-walls for 35-54', () => {
    expect(classifyCurtainCondition(35)).toBe('bare-walls')
  })
  it('returns ruin for 15-34', () => {
    expect(classifyCurtainCondition(15)).toBe('ruin')
  })
  it('returns void for 0-14', () => {
    expect(classifyCurtainCondition(0)).toBe('void')
  })
})

describe('classifyWeaverGrade', () => {
  it('returns master-weaver for 80+', () => {
    expect(classifyWeaverGrade(80)).toBe('master-weaver')
  })
  it('returns velvet-artisan for 65-79', () => {
    expect(classifyWeaverGrade(65)).toBe('velvet-artisan')
  })
  it('returns proper-tailor for 50-64', () => {
    expect(classifyWeaverGrade(50)).toBe('proper-tailor')
  })
  it('returns apprentice for 35-49', () => {
    expect(classifyWeaverGrade(35)).toBe('apprentice')
  })
  it('returns novice for 20-34', () => {
    expect(classifyWeaverGrade(20)).toBe('novice')
  })
  it('returns rag-picker for 0-19', () => {
    expect(classifyWeaverGrade(0)).toBe('rag-picker')
  })
})

// ─── analyzeVelvetFold ──────────────────────────────────

describe('analyzeVelvetFold', () => {
  it('returns a complete fold', () => {
    const fold = analyzeVelvetFold(richContent, 'app.ts')
    expect(fold.file).toBe('app.ts')
    expect(fold.softnessQuality).toBeGreaterThanOrEqual(0)
    expect(fold.darkComfort).toBeGreaterThanOrEqual(0)
    expect(fold.shadowElegance).toBeGreaterThanOrEqual(0)
    expect(fold.nocturnalWisdom).toBeGreaterThanOrEqual(0)
    expect(fold.nightResilience).toBeGreaterThanOrEqual(0)
    expect(fold.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('computes qualityScore as 0.2 weighted average', () => {
    const fold = analyzeVelvetFold(richContent, 'test.ts')
    const expected = Math.round(
      fold.softnessQuality * 0.2 +
      fold.darkComfort * 0.2 +
      fold.shadowElegance * 0.2 +
      fold.nocturnalWisdom * 0.2 +
      fold.nightResilience * 0.2,
    )
    expect(fold.qualityScore).toBe(expected)
  })

  it('handles empty content', () => {
    expect(analyzeVelvetFold(emptyContent, 'e.ts').qualityScore).toBeLessThan(40)
  })

  it('sets celebration when content references itself', () => {
    const fold = analyzeVelvetFold('// velvet-dusk command\n' + richContent, 'self.ts')
    expect(fold.celebration).toContain('Milestone #590')
  })

  it('does not set celebration for normal content', () => {
    const fold = analyzeVelvetFold(richContent, 'app.ts')
    expect(fold.celebration).toBeUndefined()
  })
})

// ─── analyzeVelvetCurtain ───────────────────────────────

describe('analyzeVelvetCurtain', () => {
  it('returns empty curtain for no folds', () => {
    const curtain = analyzeVelvetCurtain([], 'src')
    expect(curtain.curtainType).toBe('no-covering')
    expect(curtain.condition).toBe('void')
  })

  it('computes averages from folds', () => {
    const fold = analyzeVelvetFold(richContent, 'app.ts')
    const curtain = analyzeVelvetCurtain([fold], 'src')
    expect(curtain.avgSoftness).toBe(fold.softnessQuality)
  })
})

// ─── buildVelvetDuskResult ──────────────────────────────

describe('buildVelvetDuskResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildVelvetDuskResult([], [])
    expect(result.folds).toHaveLength(0)
    expect(result.night.isVelvet).toBe(false)
    expect(result.stats.weaverGrade).toBe('rag-picker')
  })

  it('returns complete result for rich content', async () => {
    const result = await buildVelvetDuskResult(['app.ts'], [richContent])
    expect(result.folds).toHaveLength(1)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into curtains by directory', async () => {
    const result = await buildVelvetDuskResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    expect(result.curtains).toHaveLength(2)
  })

  it('computes all stats fields', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], [richContent])
    expect(result.stats.avgSoftnessQuality).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgDarkComfort).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgShadowElegance).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgNocturnalWisdom).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgNightResilience).toBeGreaterThanOrEqual(0)
    expect(typeof result.stats.bestFold).toBe('string')
    expect(typeof result.stats.softest).toBe('string')
    expect(typeof result.stats.mostComforting).toBe('string')
    expect(typeof result.stats.mostElegant).toBe('string')
    expect(typeof result.stats.wisest).toBe('string')
    expect(typeof result.stats.mostResilient).toBe('string')
  })

  it('scores rich content at max (100)', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], [richContent])
    const fold = result.folds[0]
    expect(fold.softnessQuality).toBe(100)
    expect(fold.darkComfort).toBe(100)
    expect(fold.shadowElegance).toBe(100)
    expect(fold.nocturnalWisdom).toBe(100)
    expect(fold.nightResilience).toBe(100)
    expect(fold.qualityScore).toBe(100)
  })

  it('sets night.isVelvet when depth >= 60', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], [richContent])
    expect(result.night.isVelvet).toBe(true)
  })

  it('files in root map to . curtain', async () => {
    const result = await buildVelvetDuskResult(['app.ts'], [richContent])
    expect(result.curtains[0].directory).toBe('.')
  })

  it('sets bestFold to highest qualityScore', async () => {
    const result = await buildVelvetDuskResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestFold).toBe('rich.ts')
  })

  it('tracks all condition counts', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], [richContent])
    expect(result.stats.velvetMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.midnightSilkCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properFabricCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.coarseWeaveCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.tornRagCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
  })

  it('tracks high-measure counts', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], [richContent])
    expect(result.stats.hasHighSoftnessCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighComfortCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighEleganceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
  })

  it('computes softest, mostComforting, mostElegant, wisest, mostResilient', async () => {
    const result = await buildVelvetDuskResult(
      ['low.ts', 'high.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.softest).toBe('high.ts')
    expect(result.stats.mostComforting).toBe('high.ts')
    expect(result.stats.mostElegant).toBe('high.ts')
    expect(result.stats.wisest).toBe('high.ts')
    expect(result.stats.mostResilient).toBe('high.ts')
  })

  it('sets stats celebration when self-referencing', async () => {
    const selfContent = '// velvet-darkness\n' + richContent
    const result = await buildVelvetDuskResult(['a.ts'], [selfContent])
    expect(result.stats.celebration).toContain('Milestone #590')
  })

  it('does not set stats celebration for normal content', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], [richContent])
    expect(result.stats.celebration).toBeUndefined()
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece when all >= 90', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends softness when quality low', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], ['var x = 1'])
    const hasRec = result.recommendations.some((r) => r.includes('Soften'))
    expect(hasRec).toBe(true)
  })

  it('recommends comfort when low', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], ['var x = 1'])
    const hasRec = result.recommendations.some((r) => r.includes('comfort') || r.includes('Deepen'))
    expect(hasRec).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorCondition('velvet-masterpiece')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorCurtainCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorCurtainCondition('velvet-theater')).toBe('string')
    expect(typeof colorCurtainCondition('void')).toBe('string')
  })
})

describe('formatFoldTable', () => {
  it('formats a fold', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], [richContent])
    const output = formatFoldTable(result.folds[0])
    expect(output).toContain('Velvet Fold')
    expect(output).toContain('Softness Quality')
  })

  it('includes celebration when present', async () => {
    const selfContent = '// velvet-dusk\n' + richContent
    const result = await buildVelvetDuskResult(['a.ts'], [selfContent])
    const output = formatFoldTable(result.folds[0])
    expect(output).toContain('Milestone #590')
  })
})

describe('formatFoldsTable', () => {
  it('returns no folds for empty', () => {
    expect(formatFoldsTable([])).toContain('No velvet folds')
  })
})

describe('formatCurtainTable', () => {
  it('formats a curtain', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], [richContent])
    expect(formatCurtainTable(result.curtains[0])).toContain('Velvet Curtain')
  })
})

describe('formatCurtainsTable', () => {
  it('returns no curtains for empty', () => {
    expect(formatCurtainsTable([])).toContain('No velvet curtains')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Weaver Grade')
    expect(output).toContain('Best Fold')
  })

  it('includes celebration when present', async () => {
    const selfContent = '// velvet-darkness\n' + richContent
    const result = await buildVelvetDuskResult(['a.ts'], [selfContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Milestone #590')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Velvet Dusk Analysis')
    expect(output).toContain('Night Overview')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildVelvetDuskResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.folds).toHaveLength(1)
  })

  it('includes celebration in JSON when present', async () => {
    const selfContent = '// velvet-night\n' + richContent
    const result = await buildVelvetDuskResult(['a.ts'], [selfContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.stats.celebration).toContain('Milestone #590')
  })
})
