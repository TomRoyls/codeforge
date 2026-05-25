import { describe, it, expect } from 'vitest'

import {
  measureStriking,
  measureCommanding,
  measureWeathering,
  measureIgniting,
  measureIlluminating,
  analyzeLightningBolt,
  analyzeThunderForge,
  buildLightningAnvilResult,
  classifyBoltCondition,
  classifyForgeType,
  classifyForgeCondition,
  classifyStormCallerGrade,
  generateRecommendations,
  type LightningBolt,
} from '../src/commands/lightning-anvil-helpers.js'

import {
  colorScore,
  colorCondition,
  colorForgeCondition,
  formatBoltTable,
  formatBoltsTable,
  formatForgeTable,
  formatForgesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/lightning-anvil-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const emptyContent = ''

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

// ─── measureStriking ────────────────────────────────────

describe('measureStriking', () => {
  it('returns all fields', () => {
    const result = measureStriking(richContent)
    expect(result).toHaveProperty('speed')
    expect(result).toHaveProperty('velocity')
    expect(result).toHaveProperty('hasHighSpeed')
    expect(result).toHaveProperty('hasEfficient')
    expect(result).toHaveProperty('hasNoWasteful')
    expect(result).toHaveProperty('hasFast')
    expect(result).toHaveProperty('hasNoSlow')
    expect(result).toHaveProperty('hasOptimized')
    expect(result).toHaveProperty('hasNoUnoptimized')
    expect(result).toHaveProperty('hasLean')
    expect(result).toHaveProperty('hasDirect')
    expect(result).toHaveProperty('hasQuick')
    expect(result).toHaveProperty('hasResponsive')
    expect(result).toHaveProperty('hasSnappy')
    expect(result).toHaveProperty('hasImmediate')
    expect(result).toHaveProperty('hasSwift')
    expect(result).toHaveProperty('hasRapid')
    expect(result).toHaveProperty('hasAccelerated')
    expect(result).toHaveProperty('wastefulCount')
    expect(result).toHaveProperty('slowCount')
  })

  it('detects wasteful patterns', () => {
    const result = measureStriking('hack: workaround for bypass')
    expect(result.wastefulCount).toBeGreaterThan(0)
    expect(result.hasNoWasteful).toBe(false)
  })

  it('detects slow patterns (var)', () => {
    const result = measureStriking('var x = 1; var y = 2')
    expect(result.slowCount).toBe(2)
    expect(result.hasNoSlow).toBe(false)
  })

  it('detects efficient code', () => {
    const result = measureStriking(richContent)
    expect(result.hasEfficient).toBe(true)
  })

  it('detects fast code (const)', () => {
    const result = measureStriking(richContent)
    expect(result.hasFast).toBe(true)
  })

  it('detects unoptimized (eval)', () => {
    const result = measureStriking('eval("code")')
    expect(result.hasNoUnoptimized).toBe(false)
  })

  it('detects responsive code (async)', () => {
    const result = measureStriking(richContent)
    expect(result.hasResponsive).toBe(true)
  })

  it('classifies velocity correctly', () => {
    const result = measureStriking(richContent)
    expect(result.velocity).toBeDefined()
  })
})

// ─── measureCommanding ──────────────────────────────────

describe('measureCommanding', () => {
  it('returns all fields', () => {
    const result = measureCommanding(richContent)
    expect(result).toHaveProperty('authority')
    expect(result).toHaveProperty('thunder')
    expect(result).toHaveProperty('hasHighAuthority')
    expect(result).toHaveProperty('hasWellStructured')
    expect(result).toHaveProperty('hasNoChaotic')
    expect(result).toHaveProperty('hasConfident')
    expect(result).toHaveProperty('hasNoHesitant')
    expect(result).toHaveProperty('hasClear')
    expect(result).toHaveProperty('hasDecisive')
    expect(result).toHaveProperty('hasDocumented')
    expect(result).toHaveProperty('hasTyped')
    expect(result).toHaveProperty('hasAssertive')
    expect(result).toHaveProperty('hasDirect')
    expect(result).toHaveProperty('hasStrong')
    expect(result).toHaveProperty('hasCommanding')
    expect(result).toHaveProperty('hasAuthoritative')
    expect(result).toHaveProperty('hasBold')
    expect(result).toHaveProperty('hasFirm')
    expect(result).toHaveProperty('chaoticCount')
    expect(result).toHaveProperty('hesitantCount')
  })

  it('detects chaotic patterns (var, eval)', () => {
    const result = measureCommanding('var x = 1; eval("y")')
    expect(result.chaoticCount).toBe(2)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects confident code (export)', () => {
    const result = measureCommanding(richContent)
    expect(result.hasConfident).toBe(true)
  })

  it('detects hesitant patterns', () => {
    const result = measureCommanding('uncertain tentative maybe')
    expect(result.hesitantCount).toBe(3)
    expect(result.hasNoHesitant).toBe(false)
  })

  it('detects documented code', () => {
    const result = measureCommanding(richContent)
    expect(result.hasDocumented).toBe(true)
  })

  it('detects assertive code (try, catch)', () => {
    const result = measureCommanding(richContent)
    expect(result.hasAssertive).toBe(true)
  })

  it('classifies thunder correctly', () => {
    const result = measureCommanding(richContent)
    expect(result.thunder).toBeDefined()
  })
})

// ─── measureWeathering ──────────────────────────────────

describe('measureWeathering', () => {
  it('returns all fields', () => {
    const result = measureWeathering(richContent)
    expect(result).toHaveProperty('resilience')
    expect(result).toHaveProperty('shelter')
    expect(result).toHaveProperty('hasHighResilience')
    expect(result).toHaveProperty('hasErrorHandled')
    expect(result).toHaveProperty('hasNoUnhandled')
    expect(result).toHaveProperty('hasDefensive')
    expect(result).toHaveProperty('hasRobust')
    expect(result).toHaveProperty('hasTested')
    expect(result).toHaveProperty('hasNoUntested')
    expect(result).toHaveProperty('hasGrounded')
    expect(result).toHaveProperty('hasShielded')
    expect(result).toHaveProperty('hasProtected')
    expect(result).toHaveProperty('hasSafe')
    expect(result).toHaveProperty('hasHardened')
    expect(result).toHaveProperty('hasEnduring')
    expect(result).toHaveProperty('hasReinforced')
    expect(result).toHaveProperty('hasStormproof')
    expect(result).toHaveProperty('hasImpervious')
    expect(result).toHaveProperty('unhandledCount')
    expect(result).toHaveProperty('untestedCount')
  })

  it('detects error handling', () => {
    const result = measureWeathering(richContent)
    expect(result.hasErrorHandled).toBe(true)
  })

  it('detects unhandled (any)', () => {
    const result = measureWeathering('const x: any = 1')
    expect(result.unhandledCount).toBe(1)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects untested (eval)', () => {
    const result = measureWeathering('eval("code")')
    expect(result.untestedCount).toBe(1)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects grounded code', () => {
    const result = measureWeathering(richContent)
    expect(result.hasGrounded).toBe(true)
  })

  it('detects stormproof code (async)', () => {
    const result = measureWeathering(richContent)
    expect(result.hasStormproof).toBe(true)
  })

  it('detects vulnerable patterns', () => {
    const result = measureWeathering('vulnerable exploit inject')
    expect(result.hasProtected).toBe(false)
  })

  it('classifies shelter correctly', () => {
    const result = measureWeathering(richContent)
    expect(result.shelter).toBeDefined()
  })
})

// ─── measureIgniting ────────────────────────────────────

describe('measureIgniting', () => {
  it('returns all fields', () => {
    const result = measureIgniting(richContent)
    expect(result).toHaveProperty('precision')
    expect(result).toHaveProperty('spark')
    expect(result).toHaveProperty('hasHighPrecision')
    expect(result).toHaveProperty('hasTypeSafe')
    expect(result).toHaveProperty('hasNoUnsafe')
    expect(result).toHaveProperty('hasAccurate')
    expect(result).toHaveProperty('hasNoApproximate')
    expect(result).toHaveProperty('hasPrecise')
    expect(result).toHaveProperty('hasExact')
    expect(result).toHaveProperty('hasClean')
    expect(result).toHaveProperty('hasNoDirty')
    expect(result).toHaveProperty('hasCorrect')
    expect(result).toHaveProperty('hasFaithful')
    expect(result).toHaveProperty('hasSharp')
    expect(result).toHaveProperty('hasCrisp')
    expect(result).toHaveProperty('hasDefined')
    expect(result).toHaveProperty('hasTargeted')
    expect(result).toHaveProperty('hasFocused')
    expect(result).toHaveProperty('unsafeCount')
    expect(result).toHaveProperty('approximateCount')
  })

  it('detects type-safe code', () => {
    const result = measureIgniting(richContent)
    expect(result.hasTypeSafe).toBe(true)
    expect(result.hasNoUnsafe).toBe(true)
  })

  it('detects unsafe patterns (any)', () => {
    const result = measureIgniting('const x: any = 1')
    expect(result.unsafeCount).toBe(1)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects approximate patterns', () => {
    const result = measureIgniting('roughly approximately guesstimate')
    expect(result.approximateCount).toBe(3)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects precise code', () => {
    const result = measureIgniting(richContent)
    expect(result.hasPrecise).toBe(true)
  })

  it('detects dirty patterns', () => {
    const result = measureIgniting('dirty hacky gross code')
    expect(result.hasNoDirty).toBe(false)
  })

  it('detects crisp code (no var/eval)', () => {
    const result = measureIgniting(richContent)
    expect(result.hasCrisp).toBe(true)
  })

  it('classifies spark correctly', () => {
    const result = measureIgniting(richContent)
    expect(result.spark).toBeDefined()
  })
})

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('returns all fields', () => {
    const result = measureIlluminating(richContent)
    expect(result).toHaveProperty('wisdom')
    expect(result).toHaveProperty('flash')
    expect(result).toHaveProperty('hasHighWisdom')
    expect(result).toHaveProperty('hasWellArchitected')
    expect(result).toHaveProperty('hasNoHacked')
    expect(result).toHaveProperty('hasPrincipled')
    expect(result).toHaveProperty('hasDeep')
    expect(result).toHaveProperty('hasInsightful')
    expect(result).toHaveProperty('hasProven')
    expect(result).toHaveProperty('hasStrategic')
    expect(result).toHaveProperty('hasMature')
    expect(result).toHaveProperty('hasPatterned')
    expect(result).toHaveProperty('hasIlluminating')
    expect(result).toHaveProperty('hasRevealing')
    expect(result).toHaveProperty('hasEnlightened')
    expect(result).toHaveProperty('hasVisionary')
    expect(result).toHaveProperty('hasClairvoyant')
    expect(result).toHaveProperty('hasOmniscient')
    expect(result).toHaveProperty('hackedCount')
    expect(result).toHaveProperty('shallowCount')
  })

  it('detects hacked patterns', () => {
    const result = measureIlluminating('hack: workaround using monkey patch')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects insightful code (documentation)', () => {
    const result = measureIlluminating(richContent)
    expect(result.hasInsightful).toBe(true)
  })

  it('detects clairvoyant code (no any)', () => {
    const result = measureIlluminating(richContent)
    expect(result.hasClairvoyant).toBe(true)
  })

  it('detects shallow patterns', () => {
    const result = measureIlluminating('shallow superficial skin-deep')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('detects omniscient code (try, catch, if)', () => {
    const result = measureIlluminating(richContent)
    expect(result.hasOmniscient).toBe(true)
  })

  it('classifies flash correctly', () => {
    const result = measureIlluminating(richContent)
    expect(result.flash).toBeDefined()
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyBoltCondition', () => {
  it('returns lightning-masterpiece for 90+', () => {
    expect(classifyBoltCondition(90)).toBe('lightning-masterpiece')
    expect(classifyBoltCondition(100)).toBe('lightning-masterpiece')
  })
  it('returns storm-forged for 75-89', () => {
    expect(classifyBoltCondition(75)).toBe('storm-forged')
  })
  it('returns proper-bolt for 60-74', () => {
    expect(classifyBoltCondition(60)).toBe('proper-bolt')
  })
  it('returns weak-spark for 40-59', () => {
    expect(classifyBoltCondition(40)).toBe('weak-spark')
  })
  it('returns dead-wire for 20-39', () => {
    expect(classifyBoltCondition(20)).toBe('dead-wire')
  })
  it('returns void for 0-19', () => {
    expect(classifyBoltCondition(0)).toBe('void')
  })
})

describe('classifyForgeType', () => {
  it('returns no-forge for empty', () => {
    expect(classifyForgeType([])).toBe('no-forge')
  })
  it('returns storm-foundry for high avg', () => {
    const bolts = [{ qualityScore: 90 }, { qualityScore: 90 }].map((t) => ({ ...t } as LightningBolt))
    expect(classifyForgeType(bolts)).toBe('storm-foundry')
  })
  it('returns dead-circuit for low avg', () => {
    const bolts = [{ qualityScore: 10 }].map((t) => ({ ...t } as LightningBolt))
    expect(classifyForgeType(bolts)).toBe('dead-circuit')
  })
})

describe('classifyForgeCondition', () => {
  it('returns lightning-hall for 85+', () => {
    expect(classifyForgeCondition(85)).toBe('lightning-hall')
  })
  it('returns void for 0-14', () => {
    expect(classifyForgeCondition(0)).toBe('void')
  })
})

describe('classifyStormCallerGrade', () => {
  it('returns thunder-god for 80+', () => {
    expect(classifyStormCallerGrade(80)).toBe('thunder-god')
  })
  it('returns grounded-mortal for 0-19', () => {
    expect(classifyStormCallerGrade(0)).toBe('grounded-mortal')
  })
  it('returns storm-caller for 65-79', () => {
    expect(classifyStormCallerGrade(65)).toBe('storm-caller')
  })
  it('returns lightning-tamer for 50-64', () => {
    expect(classifyStormCallerGrade(50)).toBe('lightning-tamer')
  })
  it('returns apprentice for 35-49', () => {
    expect(classifyStormCallerGrade(35)).toBe('apprentice')
  })
  it('returns novice for 20-34', () => {
    expect(classifyStormCallerGrade(20)).toBe('novice')
  })
})

// ─── analyzeLightningBolt ───────────────────────────────

describe('analyzeLightningBolt', () => {
  it('returns a complete bolt', () => {
    const bolt = analyzeLightningBolt(richContent, 'app.ts')
    expect(bolt.file).toBe('app.ts')
    expect(bolt.lightningSpeed).toBeGreaterThanOrEqual(0)
    expect(bolt.thunderAuthority).toBeGreaterThanOrEqual(0)
    expect(bolt.stormResilience).toBeGreaterThanOrEqual(0)
    expect(bolt.sparkPrecision).toBeGreaterThanOrEqual(0)
    expect(bolt.boltWisdom).toBeGreaterThanOrEqual(0)
    expect(bolt.qualityScore).toBeGreaterThanOrEqual(0)
    expect(bolt.condition).toBeDefined()
  })

  it('computes qualityScore as 0.2 weighted average', () => {
    const bolt = analyzeLightningBolt(richContent, 'test.ts')
    const expected = Math.round(
      bolt.lightningSpeed * 0.2 +
      bolt.thunderAuthority * 0.2 +
      bolt.stormResilience * 0.2 +
      bolt.sparkPrecision * 0.2 +
      bolt.boltWisdom * 0.2,
    )
    expect(bolt.qualityScore).toBe(expected)
  })

  it('handles empty content', () => {
    const bolt = analyzeLightningBolt(emptyContent, 'empty.ts')
    expect(bolt.qualityScore).toBeLessThan(40)
  })
})

// ─── analyzeThunderForge ────────────────────────────────

describe('analyzeThunderForge', () => {
  it('returns empty forge for no bolts', () => {
    const forge = analyzeThunderForge([], 'src')
    expect(forge.directory).toBe('src')
    expect(forge.bolts).toHaveLength(0)
    expect(forge.avgSpeed).toBe(0)
    expect(forge.forgeType).toBe('no-forge')
    expect(forge.condition).toBe('void')
  })

  it('computes averages from bolts', () => {
    const bolt = analyzeLightningBolt(richContent, 'app.ts')
    const forge = analyzeThunderForge([bolt], 'src')
    expect(forge.avgSpeed).toBe(bolt.lightningSpeed)
    expect(forge.avgWisdom).toBe(bolt.boltWisdom)
  })
})

// ─── buildLightningAnvilResult ──────────────────────────

describe('buildLightningAnvilResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildLightningAnvilResult([], [])
    expect(result.bolts).toHaveLength(0)
    expect(result.forges).toHaveLength(0)
    expect(result.storm.isLightning).toBe(false)
    expect(result.stats.stormCallerGrade).toBe('grounded-mortal')
  })

  it('returns complete result for rich content', async () => {
    const result = await buildLightningAnvilResult(['app.ts'], [richContent])
    expect(result.bolts).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into forges by directory', async () => {
    const result = await buildLightningAnvilResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.forges).toHaveLength(2)
  })

  it('computes all stats fields', async () => {
    const result = await buildLightningAnvilResult(['a.ts'], [richContent])
    expect(result.stats.avgLightningSpeed).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgThunderAuthority).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgStormResilience).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgSparkPrecision).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgBoltWisdom).toBeGreaterThanOrEqual(0)
    expect(result.stats.lightningMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.stormForgedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properBoltCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.weakSparkCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.deadWireCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
    expect(typeof result.stats.bestBolt).toBe('string')
    expect(typeof result.stats.fastest).toBe('string')
    expect(typeof result.stats.mostAuthoritative).toBe('string')
    expect(typeof result.stats.mostResilient).toBe('string')
    expect(typeof result.stats.mostPrecise).toBe('string')
    expect(typeof result.stats.wisest).toBe('string')
  })

  it('sets bestBolt to highest qualityScore file', async () => {
    const result = await buildLightningAnvilResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestBolt).toBe('rich.ts')
  })

  it('sets fastest to highest lightningSpeed file', async () => {
    const result = await buildLightningAnvilResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.fastest).toBe('rich.ts')
  })

  it('scores rich content at max (100)', async () => {
    const result = await buildLightningAnvilResult(['a.ts'], [richContent])
    const bolt = result.bolts[0]
    expect(bolt.lightningSpeed).toBe(100)
    expect(bolt.thunderAuthority).toBe(100)
    expect(bolt.stormResilience).toBe(100)
    expect(bolt.sparkPrecision).toBe(100)
    expect(bolt.boltWisdom).toBe(100)
    expect(bolt.qualityScore).toBe(100)
  })

  it('sets storm.isLightning when voltage >= 60', async () => {
    const result = await buildLightningAnvilResult(['a.ts'], [richContent])
    expect(result.storm.isLightning).toBe(true)
  })

  it('files in root map to . forge', async () => {
    const result = await buildLightningAnvilResult(['app.ts'], [richContent])
    expect(result.forges[0].directory).toBe('.')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all >= 90', async () => {
    const result = await buildLightningAnvilResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends acceleration when speed is low', async () => {
    const result = await buildLightningAnvilResult(['a.ts'], ['var x = 1'])
    const hasRec = result.recommendations.some((r) => r.includes('Accelerate'))
    expect(hasRec).toBe(true)
  })

  it('returns default when scores are good', async () => {
    const result = await buildLightningAnvilResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorCondition('lightning-masterpiece')).toBe('string')
    expect(typeof colorCondition('storm-forged')).toBe('string')
    expect(typeof colorCondition('proper-bolt')).toBe('string')
    expect(typeof colorCondition('weak-spark')).toBe('string')
    expect(typeof colorCondition('dead-wire')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorForgeCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorForgeCondition('lightning-hall')).toBe('string')
    expect(typeof colorForgeCondition('storm-cathedral')).toBe('string')
    expect(typeof colorForgeCondition('proper-workshop')).toBe('string')
    expect(typeof colorForgeCondition('dark-shed')).toBe('string')
    expect(typeof colorForgeCondition('ruins')).toBe('string')
    expect(typeof colorForgeCondition('void')).toBe('string')
    expect(typeof colorForgeCondition('unknown')).toBe('string')
  })
})

describe('formatBoltTable', () => {
  it('formats a bolt', async () => {
    const result = await buildLightningAnvilResult(['a.ts'], [richContent])
    const output = formatBoltTable(result.bolts[0])
    expect(output).toContain('Lightning Bolt')
    expect(output).toContain('a.ts')
    expect(output).toContain('Lightning Speed')
  })
})

describe('formatBoltsTable', () => {
  it('returns no bolts message for empty', () => {
    expect(formatBoltsTable([])).toContain('No lightning bolts')
  })
  it('formats bolts', async () => {
    const result = await buildLightningAnvilResult(['a.ts'], [richContent])
    expect(formatBoltsTable(result.bolts)).toContain('Lightning Bolts')
  })
})

describe('formatForgeTable', () => {
  it('formats a forge', async () => {
    const result = await buildLightningAnvilResult(['a.ts'], [richContent])
    const output = formatForgeTable(result.forges[0])
    expect(output).toContain('Thunder Forge')
    expect(output).toContain('Bolts')
  })
})

describe('formatForgesTable', () => {
  it('returns no forges message for empty', () => {
    expect(formatForgesTable([])).toContain('No thunder forges')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildLightningAnvilResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Lightning Anvil Statistics')
    expect(output).toContain('Storm Caller Grade')
    expect(output).toContain('Best Bolt')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    expect(formatRecommendations(['A', 'B'])).toContain('Recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildLightningAnvilResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Lightning Anvil Analysis')
    expect(output).toContain('Storm Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildLightningAnvilResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.bolts).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
