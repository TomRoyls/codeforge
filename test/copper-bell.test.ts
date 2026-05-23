import { describe, it, expect } from 'vitest'
import {
  measureResonating,
  measurePurifying,
  measureRinging,
  measureAging,
  measureSwinging,
  classifyBellCondition,
  classifyTowerType,
  classifyBellFounderGrade,
  classifyTowerCondition,
  analyzeBellTone,
  analyzeBellTower,
  buildCopperBellResult,
  generateRecommendations,
} from '../src/commands/copper-bell-helpers.js'
import {
  colorScore,
  colorGrade,
  formatToneTable,
  formatTonesTable,
  formatTowerTable,
  formatTowersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/copper-bell-format-helpers.js'

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
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('cracked-bell')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureResonating(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.grade).toBe('cracked-bell')
    expect(m.hasLasting).toBe(false)
    expect(m.hasNoFading).toBe(true)
    expect(m.hasNoBrief).toBe(true)
    expect(m.fadingCount).toBe(0)
    expect(m.briefCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureResonating(richContent)
    expect(m.quality).toBe(100)
    expect(m.grade).toBe('temple-bell')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasLasting).toBe(true)
    expect(m.hasPersistent).toBe(true)
    expect(m.hasSustained).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasImpactful).toBe(true)
  })

  it('detects fading var usage', () => {
    const m = measureResonating('var x = 1')
    expect(m.fadingCount).toBe(1)
    expect(m.hasNoFading).toBe(false)
  })

  it('detects brief any usage', () => {
    const m = measureResonating('const x: any = 1')
    expect(m.briefCount).toBe(1)
    expect(m.hasNoBrief).toBe(false)
  })

  it('detects transient eval usage', () => {
    const m = measureResonating('eval("1")')
    expect(m.hasNoTransient).toBe(false)
  })

  it('detects shallow debugger usage', () => {
    const m = measureResonating('debugger')
    expect(m.hasNoShallow).toBe(false)
  })
})

// ─── measurePurifying ──────────────────────────────────────────────

describe('measurePurifying', () => {
  it('returns 0 for empty content', () => {
    const m = measurePurifying('')
    expect(m.purity).toBe(0)
    expect(m.tone).toBe('noise')
    expect(m.hasHighPurity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measurePurifying(minimalContent)
    expect(m.purity).toBe(8)
    expect(m.tone).toBe('noise')
    expect(m.hasClear).toBe(false)
    expect(m.hasNoMuddy).toBe(true)
    expect(m.hasNoMuffled).toBe(true)
    expect(m.muddyCount).toBe(0)
    expect(m.muffledCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measurePurifying(richContent)
    expect(m.purity).toBe(100)
    expect(m.tone).toBe('pure-chime')
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasDistinct).toBe(true)
    expect(m.hasPure).toBe(true)
    expect(m.hasCrisp).toBe(true)
    expect(m.hasSharp).toBe(true)
  })

  it('detects muddy var usage', () => {
    const m = measurePurifying('var x = 1')
    expect(m.muddyCount).toBe(1)
    expect(m.hasNoMuddy).toBe(false)
  })

  it('detects muffled any usage', () => {
    const m = measurePurifying('const x: any = 1')
    expect(m.muffledCount).toBe(1)
    expect(m.hasNoMuffled).toBe(false)
  })

  it('detects polluted eval usage', () => {
    const m = measurePurifying('eval("1")')
    expect(m.hasNoPolluted).toBe(false)
  })

  it('detects dull debugger usage', () => {
    const m = measurePurifying('debugger')
    expect(m.hasNoDull).toBe(false)
  })
})

// ─── measureRinging ────────────────────────────────────────────────

describe('measureRinging', () => {
  it('returns 0 for empty content', () => {
    const m = measureRinging('')
    expect(m.clarity).toBe(0)
    expect(m.ring).toBe('silent')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureRinging(minimalContent)
    expect(m.clarity).toBe(0)
    expect(m.ring).toBe('silent')
    expect(m.hasLoud).toBe(false)
    expect(m.whisperCount).toBe(0)
    expect(m.vagueCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureRinging(richContent)
    expect(m.clarity).toBe(100)
    expect(m.ring).toBe('crystal-chime')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasLoud).toBe(true)
    expect(m.hasDistinct).toBe(true)
    expect(m.hasDefinite).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasNoticeable).toBe(true)
    expect(m.hasMarked).toBe(true)
  })

  it('detects whisper var usage', () => {
    const m = measureRinging('var x = 1')
    expect(m.whisperCount).toBe(1)
    expect(m.hasNoWhisper).toBe(false)
  })

  it('detects vague any usage', () => {
    const m = measureRinging('const x: any = 1')
    expect(m.vagueCount).toBe(1)
    expect(m.hasNoVague).toBe(false)
  })

  it('detects ambiguous eval usage', () => {
    const m = measureRinging('eval("1")')
    expect(m.hasNoAmbiguous).toBe(false)
  })

  it('detects invisible debugger usage', () => {
    const m = measureRinging('debugger')
    expect(m.hasNoInvisible).toBe(false)
  })
})

// ─── measureAging ──────────────────────────────────────────────────

describe('measureAging', () => {
  it('returns 0 for empty content', () => {
    const m = measureAging('')
    expect(m.wisdom).toBe(0)
    expect(m.patina).toBe('rusted')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureAging(minimalContent)
    expect(m.wisdom).toBe(10)
    expect(m.patina).toBe('rusted')
    expect(m.hasMature).toBe(false)
    expect(m.degeneratingCount).toBe(0)
    expect(m.deterioratingCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureAging(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.patina).toBe('beautiful-patina')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasSeasoned).toBe(true)
    expect(m.hasExperienced).toBe(true)
    expect(m.hasWellWorn).toBe(true)
    expect(m.hasAntique).toBe(true)
  })

  it('detects degenerating var usage', () => {
    const m = measureAging('var x = 1')
    expect(m.degeneratingCount).toBe(1)
    expect(m.hasNoDegenerating).toBe(false)
  })

  it('detects deteriorating any usage', () => {
    const m = measureAging('const x: any = 1')
    expect(m.deterioratingCount).toBe(1)
    expect(m.hasNoDeteriorating).toBe(false)
  })

  it('detects naive eval usage', () => {
    const m = measureAging('eval("1")')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects worn out debugger usage', () => {
    const m = measureAging('debugger')
    expect(m.hasNoWornOut).toBe(false)
  })
})

// ─── measureSwinging ───────────────────────────────────────────────

describe('measureSwinging', () => {
  it('returns 0 for empty content', () => {
    const m = measureSwinging('')
    expect(m.responsiveness).toBe(0)
    expect(m.swing).toBe('stuck')
    expect(m.hasHighResponsiveness).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureSwinging(minimalContent)
    expect(m.responsiveness).toBe(8)
    expect(m.swing).toBe('stuck')
    expect(m.hasReactive).toBe(false)
    expect(m.delayedCount).toBe(0)
    expect(m.sluggishCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureSwinging(richContent)
    expect(m.responsiveness).toBe(100)
    expect(m.swing).toBe('instant-response')
    expect(m.hasHighResponsiveness).toBe(true)
    expect(m.hasReactive).toBe(true)
    expect(m.hasResponsive).toBe(true)
    expect(m.hasQuick).toBe(true)
    expect(m.hasImmediate).toBe(true)
    expect(m.hasPrompt).toBe(true)
    expect(m.hasNimble).toBe(true)
  })

  it('detects delayed var usage', () => {
    const m = measureSwinging('var x = 1')
    expect(m.delayedCount).toBe(1)
    expect(m.hasNoDelayed).toBe(false)
  })

  it('detects sluggish any usage', () => {
    const m = measureSwinging('const x: any = 1')
    expect(m.sluggishCount).toBe(1)
    expect(m.hasNoSluggish).toBe(false)
  })

  it('detects laggy eval usage', () => {
    const m = measureSwinging('eval("1")')
    expect(m.hasNoLaggy).toBe(false)
  })

  it('detects stalled debugger usage', () => {
    const m = measureSwinging('debugger')
    expect(m.hasNoStalled).toBe(false)
  })
})

// ─── classifyBellCondition ─────────────────────────────────────────

describe('classifyBellCondition', () => {
  it('classifies grand-cathedral-bell for 85+', () => {
    expect(classifyBellCondition(85)).toBe('grand-cathedral-bell')
    expect(classifyBellCondition(100)).toBe('grand-cathedral-bell')
  })

  it('classifies church-bell for 70-84', () => {
    expect(classifyBellCondition(70)).toBe('church-bell')
    expect(classifyBellCondition(84)).toBe('church-bell')
  })

  it('classifies proper-handbell for 55-69', () => {
    expect(classifyBellCondition(55)).toBe('proper-handbell')
    expect(classifyBellCondition(69)).toBe('proper-handbell')
  })

  it('classifies doorbell for 40-54', () => {
    expect(classifyBellCondition(40)).toBe('doorbell')
    expect(classifyBellCondition(54)).toBe('doorbell')
  })

  it('classifies broken-clapper for 25-39', () => {
    expect(classifyBellCondition(25)).toBe('broken-clapper')
    expect(classifyBellCondition(39)).toBe('broken-clapper')
  })

  it('classifies silent-metal for 0-24', () => {
    expect(classifyBellCondition(0)).toBe('silent-metal')
    expect(classifyBellCondition(24)).toBe('silent-metal')
  })
})

// ─── classifyTowerType ─────────────────────────────────────────────

describe('classifyTowerType', () => {
  it('returns no-bells for empty tones', () => {
    expect(classifyTowerType([])).toBe('no-bells')
  })

  it('classifies bell-tower for high avg + high cathedral ratio', () => {
    const tones = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeBellTone(richContent, `f${i}.ts`),
    }))
    expect(classifyTowerType(tones)).toBe('bell-tower')
  })

  it('classifies no-bells for low scores', () => {
    const tones = [analyzeBellTone('', 'a.ts')]
    expect(classifyTowerType(tones)).toBe('no-bells')
  })

  it('classifies clock-tower for mid-high scores', () => {
    const tones = Array.from({ length: 3 }, () => ({
      ...analyzeBellTone(richContent, 'f.ts'),
      qualityScore: 65,
      condition: 'church-bell' as const,
    }))
    expect(classifyTowerType(tones)).toBe('clock-tower')
  })

  it('classifies chime-set for very low scores', () => {
    const tones = Array.from({ length: 3 }, () => ({
      ...analyzeBellTone(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'silent-metal' as const,
    }))
    expect(classifyTowerType(tones)).toBe('chime-set')
  })
})

// ─── classifyBellFounderGrade ──────────────────────────────────────

describe('classifyBellFounderGrade', () => {
  it('classifies master-bell-founder for 80+', () => {
    expect(classifyBellFounderGrade(80)).toBe('master-bell-founder')
    expect(classifyBellFounderGrade(100)).toBe('master-bell-founder')
  })

  it('classifies expert-founder for 65-79', () => {
    expect(classifyBellFounderGrade(65)).toBe('expert-founder')
    expect(classifyBellFounderGrade(79)).toBe('expert-founder')
  })

  it('classifies skilled-bell-maker for 50-64', () => {
    expect(classifyBellFounderGrade(50)).toBe('skilled-bell-maker')
    expect(classifyBellFounderGrade(64)).toBe('skilled-bell-maker')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyBellFounderGrade(35)).toBe('apprentice')
    expect(classifyBellFounderGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyBellFounderGrade(20)).toBe('novice')
    expect(classifyBellFounderGrade(34)).toBe('novice')
  })

  it('classifies tin-ear for 0-19', () => {
    expect(classifyBellFounderGrade(0)).toBe('tin-ear')
    expect(classifyBellFounderGrade(19)).toBe('tin-ear')
  })
})

// ─── classifyTowerCondition ────────────────────────────────────────

describe('classifyTowerCondition', () => {
  it('classifies pealing-glory for 75+', () => {
    expect(classifyTowerCondition(75)).toBe('pealing-glory')
  })

  it('classifies clear-ringing for 60-74', () => {
    expect(classifyTowerCondition(60)).toBe('clear-ringing')
  })

  it('classifies decent-chiming for 45-59', () => {
    expect(classifyTowerCondition(45)).toBe('decent-chiming')
  })

  it('classifies muffled-sound for 30-44', () => {
    expect(classifyTowerCondition(30)).toBe('muffled-sound')
  })

  it('classifies silent-tower for 15-29', () => {
    expect(classifyTowerCondition(15)).toBe('silent-tower')
  })

  it('classifies collapsed for 0-14', () => {
    expect(classifyTowerCondition(0)).toBe('collapsed')
  })
})

// ─── analyzeBellTone ───────────────────────────────────────────────

describe('analyzeBellTone', () => {
  it('analyzes minimal content', () => {
    const tone = analyzeBellTone(minimalContent, 'minimal.ts')
    expect(tone.file).toBe('minimal.ts')
    expect(tone.resonanceQuality).toBe(8)
    expect(tone.tonePurity).toBe(8)
    expect(tone.clarityRing).toBe(0)
    expect(tone.patinaWisdom).toBe(10)
    expect(tone.swingResponsiveness).toBe(8)
    expect(tone.qualityScore).toBe(7)
    expect(tone.condition).toBe('silent-metal')
    expect(tone.resonating.grade).toBe('cracked-bell')
    expect(tone.purifying.tone).toBe('noise')
    expect(tone.ringing.ring).toBe('silent')
    expect(tone.aging.patina).toBe('rusted')
    expect(tone.swinging.swing).toBe('stuck')
  })

  it('analyzes rich content', () => {
    const tone = analyzeBellTone(richContent, 'rich.ts')
    expect(tone.file).toBe('rich.ts')
    expect(tone.resonanceQuality).toBe(100)
    expect(tone.tonePurity).toBe(100)
    expect(tone.clarityRing).toBe(100)
    expect(tone.patinaWisdom).toBe(100)
    expect(tone.swingResponsiveness).toBe(100)
    expect(tone.qualityScore).toBe(100)
    expect(tone.condition).toBe('grand-cathedral-bell')
    expect(tone.resonating.grade).toBe('temple-bell')
    expect(tone.purifying.tone).toBe('pure-chime')
    expect(tone.ringing.ring).toBe('crystal-chime')
    expect(tone.aging.patina).toBe('beautiful-patina')
    expect(tone.swinging.swing).toBe('instant-response')
  })

  it('computes qualityScore as weighted average', () => {
    const tone = analyzeBellTone('export const x = 1', 'mid.ts')
    const expected = Math.round(
      tone.resonanceQuality * 0.2 +
      tone.tonePurity * 0.2 +
      tone.clarityRing * 0.2 +
      tone.patinaWisdom * 0.2 +
      tone.swingResponsiveness * 0.2,
    )
    expect(tone.qualityScore).toBe(expected)
  })
})

// ─── analyzeBellTower ──────────────────────────────────────────────

describe('analyzeBellTower', () => {
  it('returns empty tower for empty tones', () => {
    const tower = analyzeBellTower([], 'empty-dir')
    expect(tower.directory).toBe('empty-dir')
    expect(tower.tones).toHaveLength(0)
    expect(tower.avgResonance).toBe(0)
    expect(tower.towerType).toBe('no-bells')
    expect(tower.condition).toBe('collapsed')
  })

  it('analyzes tower with rich tones', () => {
    const tones = [
      analyzeBellTone(richContent, 'dir/a.ts'),
      analyzeBellTone(richContent, 'dir/b.ts'),
    ]
    const tower = analyzeBellTower(tones, 'dir')
    expect(tower.avgResonance).toBe(100)
    expect(tower.grandCathedralBellCount).toBe(2)
    expect(tower.silentMetalCount).toBe(0)
    expect(tower.towerType).toBe('bell-tower')
  })

  it('analyzes tower with mixed tones', () => {
    const tones = [
      analyzeBellTone(richContent, 'dir/a.ts'),
      analyzeBellTone(minimalContent, 'dir/b.ts'),
    ]
    const tower = analyzeBellTower(tones, 'dir')
    expect(tower.grandCathedralBellCount).toBe(1)
    expect(tower.silentMetalCount).toBe(1)
  })
})

// ─── buildCopperBellResult ─────────────────────────────────────────

describe('buildCopperBellResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildCopperBellResult([], [])
    expect(result.tones).toHaveLength(0)
    expect(result.towers).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallResonance).toBe(0)
    expect(result.stats.bellFounderGrade).toBe('tin-ear')
    expect(result.carillon.isRinging).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildCopperBellResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.tones).toHaveLength(2)
    expect(result.towers).toHaveLength(1)
    expect(result.stats.avgResonanceQuality).toBe(100)
    expect(result.stats.avgTonePurity).toBe(100)
    expect(result.stats.avgClarityRing).toBe(100)
    expect(result.stats.avgPatinaWisdom).toBe(100)
    expect(result.stats.avgSwingResponsiveness).toBe(100)
    expect(result.stats.grandCathedralBellCount).toBe(2)
    expect(result.stats.silentMetalCount).toBe(0)
    expect(result.stats.hasHighQualityCount).toBe(2)
    expect(result.stats.hasHighPurityCount).toBe(2)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.hasHighWisdomCount).toBe(2)
    expect(result.stats.hasHighResponsivenessCount).toBe(2)
    expect(result.stats.overallResonance).toBe(100)
    expect(result.stats.bellFounderGrade).toBe('master-bell-founder')
    expect(result.carillon.isRinging).toBe(true)
    expect(result.stats.bestTone).toBeTruthy()
    expect(result.stats.mostResonant).toBeTruthy()
    expect(result.stats.purest).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostResponsive).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildCopperBellResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.towers).toHaveLength(2)
    const dirs = result.towers.map(t => t.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall resonance correctly', async () => {
    const result = await buildCopperBellResult(['a.ts'], [minimalContent])
    expect(result.carillon.overallResonance).toBe(Math.round((8 + 8 + 8) / 3))
  })

  it('sets isRinging when avgResonance >= 60', async () => {
    const result = await buildCopperBellResult(['a.ts'], [richContent])
    expect(result.carillon.isRinging).toBe(true)
  })

  it('sets isRinging false when avgResonance < 60', async () => {
    const result = await buildCopperBellResult(['a.ts'], [minimalContent])
    expect(result.carillon.isRinging).toBe(false)
  })

  it('picks best tone by qualityScore', async () => {
    const result = await buildCopperBellResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestTone).toBe('high.ts')
    expect(result.stats.mostResonant).toBe('high.ts')
    expect(result.stats.purest).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.mostResponsive).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildCopperBellResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.grandCathedralBellCount).toBe(1)
    expect(result.stats.silentMetalCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildCopperBellResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your bell carillon is pealing gloriously! Every tone rings with perfect clarity',
    ])
  })

  it('recommends improving resonance when low', async () => {
    const result = await buildCopperBellResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('resonance quality'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving tone purity when low', async () => {
    const result = await buildCopperBellResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('tone'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving clarity ring when low', async () => {
    const result = await buildCopperBellResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('clarity ring'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving patina wisdom when low', async () => {
    const result = await buildCopperBellResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('patina wisdom'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving swing responsiveness when low', async () => {
    const result = await buildCopperBellResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('swing responsiveness'))
    expect(rec).toBeTruthy()
  })

  it('warns about silent metal files', async () => {
    const result = await buildCopperBellResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('silent metal'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall resonance', async () => {
    const result = await buildCopperBellResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Overall bell resonance'))
    expect(rec).toBeTruthy()
  })

  it('lists specific silent metal files', async () => {
    const result = await buildCopperBellResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Resound'))
    expect(rec).toBeTruthy()
  })

  it('warns when all towers are chime sets/no-bells', async () => {
    const result = await buildCopperBellResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('chime sets or silent'))
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
  it('returns a string for grand-cathedral-bell', () => {
    expect(typeof colorGrade('grand-cathedral-bell')).toBe('string')
  })

  it('returns a string for silent-metal', () => {
    expect(typeof colorGrade('silent-metal')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatToneTable', () => {
  it('formats a tone', () => {
    const tone = analyzeBellTone(richContent, 'test.ts')
    const output = formatToneTable(tone)
    expect(output).toContain('test.ts')
    expect(output).toContain('Resonance')
    expect(output).toContain('Tone Purity')
    expect(output).toContain('Clarity Ring')
    expect(output).toContain('Patina Wisdom')
    expect(output).toContain('Swing')
  })
})

describe('formatTonesTable', () => {
  it('handles empty tones', () => {
    const output = formatTonesTable([])
    expect(output).toContain('No bell tones')
  })

  it('formats multiple tones', () => {
    const tones = [
      analyzeBellTone(richContent, 'a.ts'),
      analyzeBellTone(minimalContent, 'b.ts'),
    ]
    const output = formatTonesTable(tones)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatTowerTable', () => {
  it('formats a tower', () => {
    const tones = [analyzeBellTone(richContent, 'dir/a.ts')]
    const tower = analyzeBellTower(tones, 'dir')
    const output = formatTowerTable(tower)
    expect(output).toContain('dir')
    expect(output).toContain('Tower')
  })
})

describe('formatTowersTable', () => {
  it('handles empty towers', () => {
    const output = formatTowersTable([])
    expect(output).toContain('No bell towers')
  })

  it('formats multiple towers', () => {
    const tones = [analyzeBellTone(richContent, 'src/a.ts')]
    const towers = [analyzeBellTower(tones, 'src')]
    const output = formatTowersTable(towers)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildCopperBellResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Copper Bell Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Founder Grade')
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
    const result = await buildCopperBellResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Copper Bell Analysis')
    expect(output).toContain('Bell Tower Analysis')
    expect(output).toContain('Copper Bell Statistics')
    expect(output).toContain('Carillon')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildCopperBellResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.tones).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.carillon.isRinging).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const tone = analyzeBellTone('   \n\t  ', 'blank.ts')
    expect(tone.resonanceQuality).toBe(0)
    expect(tone.qualityScore).toBe(0)
    expect(tone.condition).toBe('silent-metal')
  })

  it('handles content with only comments', () => {
    const tone = analyzeBellTone('// just a comment\n/* block */', 'comment.ts')
    expect(tone.resonanceQuality).toBe(0)
    expect(tone.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildCopperBellResult(['big.ts'], [longContent])
    expect(result.tones).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildCopperBellResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.grandCathedralBellCount).toBe(50)
  })

  it('handles single file tower', async () => {
    const result = await buildCopperBellResult(['single.ts'], [richContent])
    expect(result.towers).toHaveLength(1)
    expect(result.towers[0]!.tones).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const tone = analyzeBellTone(richContent, 'cap.ts')
    expect(tone.qualityScore).toBeLessThanOrEqual(100)
    expect(tone.resonanceQuality).toBeLessThanOrEqual(100)
    expect(tone.tonePurity).toBeLessThanOrEqual(100)
    expect(tone.clarityRing).toBeLessThanOrEqual(100)
    expect(tone.patinaWisdom).toBeLessThanOrEqual(100)
    expect(tone.swingResponsiveness).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildCopperBellResult([], [])
    const r2 = await buildCopperBellResult(['a.ts'], [richContent])
    const r3 = await buildCopperBellResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
