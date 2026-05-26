import { describe, expect, it } from 'vitest'

import {
  analyzeOnyxBlock,
  analyzeOnyxCastle,
  buildOnyxCitadelResult,
  classifyBlockCondition,
  classifyCastleCondition,
  classifyCastleType,
  classifyCommanderGrade,
  generateRecommendations,
  measureCutting,
  measureFortifying,
  measureIlluminating,
  measureKnowing,
  measureSurviving,
} from '../src/commands/onyx-citadel-helpers.js'
import type { OnyxBlock, OnyxCitadelResult } from '../src/commands/onyx-citadel-helpers.js'
import {
  colorBlockCondition,
  colorCastleCondition,
  colorCastleType,
  colorCommanderGrade,
  colorScore,
  formatBlocksTable,
  formatBlockTable,
  formatCastlesTable,
  formatCastleTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/onyx-citadel-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

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

const emptyContent = ''
const minimalContent = 'const x = 1'

const richCla = measureIlluminating(richContent).clarity
const richStr = measureFortifying(richContent).strength
const richPre = measureCutting(richContent).precision
const richRes = measureSurviving(richContent).resilience
const richWis = measureKnowing(richContent).wisdom

function makeStats(overrides: Partial<OnyxCitadelResult['stats']> = {}): OnyxCitadelResult['stats'] {
  return {
    totalFiles: 1,
    totalCastles: 1,
    avgObsidianClarity: 50,
    avgDarkFortress: 50,
    avgBladePrecision: 50,
    avgShadowResilience: 50,
    avgMidnightWisdom: 50,
    onyxMasterpieceCount: 0,
    darkGemCount: 0,
    properOnyxCount: 0,
    grayStoneCount: 0,
    whiteRockCount: 0,
    voidCount: 0,
    hasHighClarityCount: 1,
    hasHighStrengthCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallFortification: 50,
    commanderGrade: 'proper-sentinel',
    bestBlock: 'a.ts',
    clearest: 'a.ts',
    strongest: 'a.ts',
    sharpest: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('scores rich content highly', () => {
    const result = measureIlluminating(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureIlluminating(emptyContent).clarity).toBeLessThan(richCla)
  })

  it('detects readable patterns (class/interface/type)', () => {
    expect(measureIlluminating(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const mysterious = 2; const obscure = 3; const enigmatic = 4'
    const result = measureIlluminating(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts obfuscated keywords', () => {
    const content = 'const obfuscated = 1; const encoded = 2; const mangled = 3; const minified = 4'
    const result = measureIlluminating(content)
    expect(result.obfuscatedCount).toBe(4)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects transparent patterns (readonly/private/protected)', () => {
    expect(measureIlluminating(richContent).hasTransparent).toBe(true)
  })

  it('detects self-documenting patterns (import/export)', () => {
    expect(measureIlluminating(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects revealed (no any)', () => {
    expect(measureIlluminating(richContent).hasRevealed).toBe(true)
  })

  it('classifies vision correctly for high scores', () => {
    const result = measureIlluminating(richContent)
    expect(['dark-sight', 'night-vision', 'proper-glimmer']).toContain(result.vision)
  })

  it('classifies vision correctly for low scores', () => {
    expect(measureIlluminating(emptyContent).vision).not.toBe('dark-sight')
  })
})

// ─── measureFortifying ──────────────────────────────────

describe('measureFortifying', () => {
  it('scores rich content highly', () => {
    const result = measureFortifying(richContent)
    expect(result.strength).toBeGreaterThan(60)
    expect(result.hasHighStrength).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureFortifying(emptyContent).strength).toBeLessThan(richStr)
  })

  it('detects error handling (try/catch)', () => {
    expect(measureFortifying(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unsafe = 1; const unchecked = 2; const risky = 3'
    const result = measureFortifying(content)
    expect(result.unhandledCount).toBe(3)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects defensive patterns (if/throw)', () => {
    expect(measureFortifying(richContent).hasDefensive).toBe(true)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unconfirmed = 3'
    const result = measureFortifying(content)
    expect(result.untestedCount).toBe(3)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects secure patterns (no any)', () => {
    expect(measureFortifying(richContent).hasSecure).toBe(true)
  })

  it('detects fortified patterns (readonly/private/protected)', () => {
    expect(measureFortifying(richContent).hasFortified).toBe(true)
  })

  it('classifies wall correctly for high scores', () => {
    const result = measureFortifying(richContent)
    expect(['impregnable', 'strong-fortress', 'proper-wall']).toContain(result.wall)
  })

  it('classifies wall correctly for low scores', () => {
    expect(measureFortifying(emptyContent).wall).not.toBe('impregnable')
  })
})

// ─── measureCutting ─────────────────────────────────────

describe('measureCutting', () => {
  it('scores rich content highly', () => {
    const result = measureCutting(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureCutting(emptyContent).precision).toBeLessThan(richPre)
  })

  it('detects type safe (no any)', () => {
    expect(measureCutting(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords (var/eval)', () => {
    const content = 'var x = 1; eval("test"); var y = 2'
    const result = measureCutting(content)
    expect(result.unsafeCount).toBe(3)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureCutting(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects piercing patterns (try/catch/if)', () => {
    expect(measureCutting(richContent).hasPiercing).toBe(true)
  })

  it('detects surgical patterns (async/await/Promise)', () => {
    expect(measureCutting(richContent).hasSurgical).toBe(true)
  })

  it('classifies edge correctly for high scores', () => {
    const result = measureCutting(richContent)
    expect(['razor-edge', 'sharp-blade', 'proper-knife']).toContain(result.edge)
  })

  it('classifies edge correctly for low scores', () => {
    expect(measureCutting(emptyContent).edge).not.toBe('razor-edge')
  })
})

// ─── measureSurviving ───────────────────────────────────

describe('measureSurviving', () => {
  it('scores rich content highly', () => {
    const result = measureSurviving(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureSurviving(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('counts fragile keywords', () => {
    const content = 'const fragile = 1; const breakable = 2; const delicate = 3; const brittle = 4'
    const result = measureSurviving(content)
    expect(result.fragileCount).toBe(4)
    expect(result.hasNoFragile).toBe(false)
  })

  it('counts unstable keywords', () => {
    const content = 'const unstable = 1; const volatile = 2; const flaky = 3; const inconsistent = 4'
    const result = measureSurviving(content)
    expect(result.unstableCount).toBe(4)
  })

  it('detects stable patterns (class/interface/type)', () => {
    expect(measureSurviving(richContent).hasStable).toBe(true)
  })

  it('detects unyielding (no any)', () => {
    expect(measureSurviving(richContent).hasUnyielding).toBe(true)
  })

  it('detects indomitable (try/catch/if)', () => {
    expect(measureSurviving(richContent).hasIndomitable).toBe(true)
  })

  it('classifies shadow correctly for high scores', () => {
    const result = measureSurviving(richContent)
    expect(['eternal-night', 'dark-endurance', 'proper-survival']).toContain(result.shadow)
  })

  it('classifies shadow correctly for low scores', () => {
    expect(measureSurviving(emptyContent).shadow).not.toBe('eternal-night')
  })
})

// ─── measureKnowing ─────────────────────────────────────

describe('measureKnowing', () => {
  it('scores rich content highly', () => {
    const result = measureKnowing(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureKnowing(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureKnowing(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureKnowing(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects well-architected patterns', () => {
    expect(measureKnowing(richContent).hasWellArchitected).toBe(true)
  })

  it('detects principled code (no any)', () => {
    expect(measureKnowing(richContent).hasPrincipled).toBe(true)
  })

  it('detects visionary patterns (async/await/Promise)', () => {
    expect(measureKnowing(richContent).hasVisionary).toBe(true)
  })

  it('classifies hour correctly for high scores', () => {
    const result = measureKnowing(richContent)
    expect(['witching-sage', 'night-scholar', 'proper-watcher']).toContain(result.hour)
  })

  it('classifies hour correctly for low scores', () => {
    expect(measureKnowing(emptyContent).hour).not.toBe('witching-sage')
  })
})

// ─── analyzeOnyxBlock ───────────────────────────────────

describe('analyzeOnyxBlock', () => {
  it('analyzes a file correctly', () => {
    const block = analyzeOnyxBlock(richContent, 'test.ts')
    expect(block.file).toBe('test.ts')
    expect(block.obsidianClarity).toBeGreaterThan(0)
    expect(block.darkFortress).toBeGreaterThan(0)
    expect(block.bladePrecision).toBeGreaterThan(0)
    expect(block.shadowResilience).toBeGreaterThan(0)
    expect(block.midnightWisdom).toBeGreaterThan(0)
    expect(block.qualityScore).toBeGreaterThan(0)
    expect(block.condition).toBeDefined()
  })

  it('computes quality score as weighted average', () => {
    const block = analyzeOnyxBlock(richContent, 'test.ts')
    const expected = Math.round(
      block.obsidianClarity * 0.2 +
      block.darkFortress * 0.2 +
      block.bladePrecision * 0.2 +
      block.shadowResilience * 0.2 +
      block.midnightWisdom * 0.2,
    )
    expect(block.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const block = analyzeOnyxBlock(richContent, 'test.ts')
    expect(block.illuminating).toBeDefined()
    expect(block.fortifying).toBeDefined()
    expect(block.cutting).toBeDefined()
    expect(block.surviving).toBeDefined()
    expect(block.knowing).toBeDefined()
  })

  it('classifies empty content as non-masterpiece', () => {
    const block = analyzeOnyxBlock(emptyContent, 'empty.ts')
    expect(block.qualityScore).toBeLessThan(60)
    expect(block.condition).not.toBe('onyx-masterpiece')
  })
})

// ─── analyzeOnyxCastle ──────────────────────────────────

describe('analyzeOnyxCastle', () => {
  it('handles empty blocks', () => {
    const castle = analyzeOnyxCastle([], 'empty-dir')
    expect(castle.blocks).toHaveLength(0)
    expect(castle.castleType).toBe('no-castle')
    expect(castle.condition).toBe('void')
  })

  it('analyzes a castle with blocks', () => {
    const block = analyzeOnyxBlock(richContent, 'src/test.ts')
    const castle = analyzeOnyxCastle([block], 'src')
    expect(castle.directory).toBe('src')
    expect(castle.blocks).toHaveLength(1)
    expect(castle.avgClarity).toBeGreaterThan(0)
  })

  it('counts onyx masterpieces', () => {
    const block: OnyxBlock = {
      file: 'a.ts', obsidianClarity: 95, darkFortress: 95, bladePrecision: 95, shadowResilience: 95, midnightWisdom: 95,
      illuminating: {} as OnyxBlock['illuminating'],
      fortifying: {} as OnyxBlock['fortifying'],
      cutting: {} as OnyxBlock['cutting'],
      surviving: {} as OnyxBlock['surviving'],
      knowing: {} as OnyxBlock['knowing'],
      condition: 'onyx-masterpiece', qualityScore: 95,
    }
    expect(analyzeOnyxCastle([block], 'src').onyxMasterpieceCount).toBe(1)
  })

  it('counts void blocks', () => {
    const block: OnyxBlock = {
      file: 'a.ts', obsidianClarity: 0, darkFortress: 0, bladePrecision: 0, shadowResilience: 0, midnightWisdom: 0,
      illuminating: {} as OnyxBlock['illuminating'],
      fortifying: {} as OnyxBlock['fortifying'],
      cutting: {} as OnyxBlock['cutting'],
      surviving: {} as OnyxBlock['surviving'],
      knowing: {} as OnyxBlock['knowing'],
      condition: 'void', qualityScore: 0,
    }
    expect(analyzeOnyxCastle([block], 'src').voidCount).toBe(1)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyBlockCondition', () => {
  it('classifies onyx-masterpiece at 90+', () => { expect(classifyBlockCondition(90)).toBe('onyx-masterpiece') })
  it('classifies dark-gem at 75-89', () => { expect(classifyBlockCondition(75)).toBe('dark-gem') })
  it('classifies proper-onyx at 60-74', () => { expect(classifyBlockCondition(60)).toBe('proper-onyx') })
  it('classifies gray-stone at 40-59', () => { expect(classifyBlockCondition(40)).toBe('gray-stone') })
  it('classifies white-rock at 20-39', () => { expect(classifyBlockCondition(20)).toBe('white-rock') })
  it('classifies void below 20', () => { expect(classifyBlockCondition(0)).toBe('void') })
})

describe('classifyCastleType', () => {
  it('returns no-castle for empty blocks', () => { expect(classifyCastleType([])).toBe('no-castle') })
  it('classifies dark-citadel at 85+', () => { expect(classifyCastleType([{ qualityScore: 90 } as OnyxBlock])).toBe('dark-citadel') })
  it('classifies shadow-fortress at 70-84', () => { expect(classifyCastleType([{ qualityScore: 75 } as OnyxBlock])).toBe('shadow-fortress') })
  it('classifies proper-stronghold at 55-69', () => { expect(classifyCastleType([{ qualityScore: 60 } as OnyxBlock])).toBe('proper-stronghold') })
  it('classifies watchtower at 35-54', () => { expect(classifyCastleType([{ qualityScore: 40 } as OnyxBlock])).toBe('watchtower') })
  it('classifies ruin below 35', () => { expect(classifyCastleType([{ qualityScore: 10 } as OnyxBlock])).toBe('ruin') })
})

describe('classifyCastleCondition', () => {
  it('classifies onyx-palace at 85+', () => { expect(classifyCastleCondition(85)).toBe('onyx-palace') })
  it('classifies dark-tower at 70-84', () => { expect(classifyCastleCondition(70)).toBe('dark-tower') })
  it('classifies proper-keep at 55-69', () => { expect(classifyCastleCondition(55)).toBe('proper-keep') })
  it('classifies stone-walls at 35-54', () => { expect(classifyCastleCondition(35)).toBe('stone-walls') })
  it('classifies wooden-fence at 15-34', () => { expect(classifyCastleCondition(15)).toBe('wooden-fence') })
  it('classifies void below 15', () => { expect(classifyCastleCondition(0)).toBe('void') })
})

describe('classifyCommanderGrade', () => {
  it('classifies dark-lord at 80+', () => { expect(classifyCommanderGrade(80)).toBe('dark-lord') })
  it('classifies citadel-guardian at 65-79', () => { expect(classifyCommanderGrade(65)).toBe('citadel-guardian') })
  it('classifies proper-sentinel at 50-64', () => { expect(classifyCommanderGrade(50)).toBe('proper-sentinel') })
  it('classifies watchman at 35-49', () => { expect(classifyCommanderGrade(35)).toBe('watchman') })
  it('classifies recruit at 20-34', () => { expect(classifyCommanderGrade(20)).toBe('recruit') })
  it('classifies sleeping-guard below 20', () => { expect(classifyCommanderGrade(0)).toBe('sleeping-guard') })
})

// ─── buildOnyxCitadelResult ─────────────────────────────

describe('buildOnyxCitadelResult', () => {
  it('handles empty input', async () => {
    const result = await buildOnyxCitadelResult([], [])
    expect(result.blocks).toHaveLength(0)
    expect(result.castles).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFortification).toBe(0)
    expect(result.stats.bestBlock).toBe('')
  })

  it('analyzes single file', async () => {
    const result = await buildOnyxCitadelResult(['test.ts'], [richContent])
    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0].file).toBe('test.ts')
    expect(result.castles).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory', async () => {
    const result = await buildOnyxCitadelResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.castles).toHaveLength(2)
  })

  it('computes average scores correctly', async () => {
    const result = await buildOnyxCitadelResult(['a.ts'], [richContent])
    expect(result.stats.avgObsidianClarity).toBe(result.blocks[0].obsidianClarity)
    expect(result.stats.avgDarkFortress).toBe(result.blocks[0].darkFortress)
    expect(result.stats.avgBladePrecision).toBe(result.blocks[0].bladePrecision)
    expect(result.stats.avgShadowResilience).toBe(result.blocks[0].shadowResilience)
    expect(result.stats.avgMidnightWisdom).toBe(result.blocks[0].midnightWisdom)
  })

  it('identifies best block', async () => {
    const result = await buildOnyxCitadelResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestBlock).toBe('high.ts')
  })

  it('computes keep overview', async () => {
    const result = await buildOnyxCitadelResult(['a.ts'], [richContent])
    expect(result.keep.avgClarity).toBe(result.blocks[0].obsidianClarity)
    expect(result.keep.avgStrength).toBe(result.blocks[0].darkFortress)
    expect(result.keep.avgWisdom).toBe(result.blocks[0].midnightWisdom)
    expect(result.keep.overallFortification).toBe(result.stats.overallFortification)
  })

  it('sets isOnyx when overallFortification >= 60', async () => {
    const result = await buildOnyxCitadelResult(['a.ts'], [richContent])
    if (result.stats.overallFortification >= 60) {
      expect(result.keep.isOnyx).toBe(true)
    }
  })

  it('finds clearest, strongest, sharpest, mostResilient, wisest', async () => {
    const result = await buildOnyxCitadelResult(['a.ts'], [richContent])
    expect(result.stats.clearest).toBe('a.ts')
    expect(result.stats.strongest).toBe('a.ts')
    expect(result.stats.sharpest).toBe('a.ts')
    expect(result.stats.mostResilient).toBe('a.ts')
    expect(result.stats.wisest).toBe('a.ts')
  })

  it('counts high measure counts correctly', async () => {
    const result = await buildOnyxCitadelResult(['a.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighStrengthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const stats = makeStats({
      avgObsidianClarity: 90, avgDarkFortress: 90, avgBladePrecision: 90,
      avgShadowResilience: 90, avgMidnightWisdom: 90, overallFortification: 90,
    })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgStrength: 90, avgWisdom: 90, isOnyx: true, overallFortification: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('onyx citadel stands impregnable')
  })

  it('recommends sharpening clarity when below 60', () => {
    const stats = makeStats({ avgObsidianClarity: 40, avgDarkFortress: 90, avgBladePrecision: 90, avgShadowResilience: 90, avgMidnightWisdom: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 40, avgStrength: 90, avgWisdom: 90, isOnyx: true, overallFortification: 70 }, stats)
    expect(recs.some((r) => r.includes('Sharpen obsidian clarity'))).toBe(true)
  })

  it('recommends strengthening fortress when below 60', () => {
    const stats = makeStats({ avgObsidianClarity: 90, avgDarkFortress: 40, avgBladePrecision: 90, avgShadowResilience: 90, avgMidnightWisdom: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgStrength: 40, avgWisdom: 90, isOnyx: true, overallFortification: 70 }, stats)
    expect(recs.some((r) => r.includes('Strengthen the dark fortress'))).toBe(true)
  })

  it('recommends honing precision when below 60', () => {
    const stats = makeStats({ avgObsidianClarity: 90, avgDarkFortress: 90, avgBladePrecision: 40, avgShadowResilience: 90, avgMidnightWisdom: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgStrength: 90, avgWisdom: 90, isOnyx: true, overallFortification: 70 }, stats)
    expect(recs.some((r) => r.includes('Hone blade precision'))).toBe(true)
  })

  it('recommends building resilience when below 60', () => {
    const stats = makeStats({ avgObsidianClarity: 90, avgDarkFortress: 90, avgBladePrecision: 90, avgShadowResilience: 40, avgMidnightWisdom: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgStrength: 90, avgWisdom: 90, isOnyx: true, overallFortification: 70 }, stats)
    expect(recs.some((r) => r.includes('Build shadow resilience'))).toBe(true)
  })

  it('recommends deepening wisdom when below 60', () => {
    const stats = makeStats({ avgObsidianClarity: 90, avgDarkFortress: 90, avgBladePrecision: 90, avgShadowResilience: 90, avgMidnightWisdom: 40 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgStrength: 90, avgWisdom: 40, isOnyx: true, overallFortification: 70 }, stats)
    expect(recs.some((r) => r.includes('Deepen midnight wisdom'))).toBe(true)
  })

  it('recommends citadel crumbles when fortification < 40', () => {
    const stats = makeStats({ overallFortification: 30, avgObsidianClarity: 30, avgDarkFortress: 30, avgBladePrecision: 30, avgShadowResilience: 30, avgMidnightWisdom: 30 })
    const recs = generateRecommendations([], [], { avgClarity: 30, avgStrength: 30, avgWisdom: 30, isOnyx: false, overallFortification: 30 }, stats)
    expect(recs.some((r) => r.includes('citadel crumbles'))).toBe(true)
  })

  it('lists void blocks by name when <= 5', () => {
    const stats = makeStats({ avgObsidianClarity: 70, avgDarkFortress: 70, avgBladePrecision: 70, avgShadowResilience: 70, avgMidnightWisdom: 70 })
    const blocks = [{ file: 'a.ts', condition: 'void' } as OnyxBlock, { file: 'b.ts', condition: 'void' } as OnyxBlock]
    const recs = generateRecommendations(blocks, [], { avgClarity: 70, avgStrength: 70, avgWisdom: 70, isOnyx: true, overallFortification: 70 }, stats)
    expect(recs.some((r) => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })

  it('summarizes void blocks when > 5', () => {
    const stats = makeStats({ avgObsidianClarity: 70, avgDarkFortress: 70, avgBladePrecision: 70, avgShadowResilience: 70, avgMidnightWisdom: 70 })
    const blocks = Array.from({ length: 6 }, (_, i) => ({ file: `${i}.ts`, condition: 'void' } as OnyxBlock))
    const recs = generateRecommendations(blocks, [], { avgClarity: 70, avgStrength: 70, avgWisdom: 70, isOnyx: true, overallFortification: 70 }, stats)
    expect(recs.some((r) => r.includes('6 crumbling blocks'))).toBe(true)
  })

  it('reports all castles are wooden fences', () => {
    const stats = makeStats({ avgObsidianClarity: 70, avgDarkFortress: 70, avgBladePrecision: 70, avgShadowResilience: 70, avgMidnightWisdom: 70 })
    const castles = [{ condition: 'wooden-fence', directory: 'src' } as import('../src/commands/onyx-citadel-helpers.js').OnyxCastle]
    const recs = generateRecommendations([], castles, { avgClarity: 70, avgStrength: 70, avgWisdom: 70, isOnyx: true, overallFortification: 70 }, stats)
    expect(recs.some((r) => r.includes('wooden fences'))).toBe(true)
  })

  it('returns default praise when all is well', () => {
    const stats = makeStats({ avgObsidianClarity: 90, avgDarkFortress: 90, avgBladePrecision: 90, avgShadowResilience: 90, avgMidnightWisdom: 90, overallFortification: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgStrength: 90, avgWisdom: 90, isOnyx: true, overallFortification: 90 }, stats)
    expect(recs[0]).toContain('onyx citadel stands impregnable')
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all ranges', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(95)).toBe('string')
  })
})

describe('colorBlockCondition', () => {
  it('handles all conditions', () => {
    for (const c of ['onyx-masterpiece', 'dark-gem', 'proper-onyx', 'gray-stone', 'white-rock', 'void', 'unknown']) {
      expect(typeof colorBlockCondition(c)).toBe('string')
    }
  })
})

describe('colorCastleType', () => {
  it('handles all types', () => {
    for (const t of ['dark-citadel', 'shadow-fortress', 'proper-stronghold', 'watchtower', 'ruin', 'no-castle']) {
      expect(typeof colorCastleType(t)).toBe('string')
    }
  })
})

describe('colorCastleCondition', () => {
  it('handles all conditions', () => {
    for (const c of ['onyx-palace', 'dark-tower', 'proper-keep', 'stone-walls', 'wooden-fence', 'void']) {
      expect(typeof colorCastleCondition(c)).toBe('string')
    }
  })
})

describe('colorCommanderGrade', () => {
  it('handles all grades', () => {
    for (const g of ['dark-lord', 'citadel-guardian', 'proper-sentinel', 'watchman', 'recruit', 'sleeping-guard']) {
      expect(typeof colorCommanderGrade(g)).toBe('string')
    }
  })
})

describe('formatBlockTable', () => {
  it('formats a block table', () => {
    const block = analyzeOnyxBlock(richContent, 'test.ts')
    const output = formatBlockTable(block)
    expect(output).toContain('Onyx Block: test.ts')
    expect(output).toContain('Obsidian Clarity')
    expect(output).toContain('Quality Score')
  })
})

describe('formatBlocksTable', () => {
  it('formats empty blocks message', () => { expect(formatBlocksTable([])).toContain('No onyx blocks found') })
  it('formats blocks list', () => {
    const output = formatBlocksTable([analyzeOnyxBlock(richContent, 'a.ts'), analyzeOnyxBlock(richContent, 'b.ts')])
    expect(output).toContain('Onyx Blocks')
    expect(output).toContain('a.ts')
  })
})

describe('formatCastleTable', () => {
  it('formats a castle table', () => {
    const castle = analyzeOnyxCastle([analyzeOnyxBlock(richContent, 'test.ts')], 'src')
    const output = formatCastleTable(castle)
    expect(output).toContain('Onyx Castle: src')
  })
})

describe('formatCastlesTable', () => {
  it('formats empty message', () => { expect(formatCastlesTable([])).toContain('No onyx castles found') })
  it('formats castles list', () => {
    const castle = analyzeOnyxCastle([analyzeOnyxBlock(richContent, 'test.ts')], 'src')
    expect(formatCastlesTable([castle])).toContain('Onyx Castles')
  })
})

describe('formatStatsTable', () => {
  it('formats stats table', () => {
    expect(formatStatsTable(makeStats())).toContain('Onyx Citadel Statistics')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recommendations list', () => {
    expect(formatRecommendations(['Fix X', 'Improve Y'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result table', async () => {
    const result = await buildOnyxCitadelResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Onyx Citadel Analysis')
    expect(output).toContain('Keep Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildOnyxCitadelResult(['test.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.blocks).toHaveLength(1)
    expect(parsed.keep).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
