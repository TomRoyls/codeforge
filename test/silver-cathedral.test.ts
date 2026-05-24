import { describe, it, expect } from 'vitest'
import {
  measurePurifying,
  measureArchitecting,
  measureResonating,
  measureTempering,
  measureIlluminating,
  analyzeSilverPillar,
  analyzeSilverNave,
  classifyPillarCondition,
  classifyNaveType,
  classifyNaveCondition,
  classifyBishopGrade,
  generateRecommendations,
  buildSilverCathedralResult,
  gatherFiles,
} from '../src/commands/silver-cathedral-helpers.js'
import {
  colorScore,
  colorGrade,
  formatPillarTable,
  formatPillarsTable,
  formatNaveTable,
  formatNavesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/silver-cathedral-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const minimalContent = 'const x = 1'

const moderateContent = `export interface Foo {
  bar: string
}

export function greet(name: string): string {
  return 'hello ' + name
}

const foo: Foo = { bar: 'baz' }
`

const richContent = `/**
 * A type alias for string or number
 */
type StringOrNumber = string | number

export enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

export interface Widget<T> {
  readonly id: string
  name: string
  value: T
  optional?: boolean
}

export class Processor {
  private status: string = 'idle'

  async process(input: string): Promise<string> {
    try {
      this.status = 'running'
      return input.toUpperCase()
    } catch (err) {
      throw new Error('Processing failed')
    }
  }
}

export function findWidget(widgets: Widget<string>[], id: string): Widget<string> | undefined {
  return widgets.find(w => w.id === id)
}

const DEFAULT_COLOR = Color.Red
`

// ─── Purifying Measure ─────────────────────────────────────────────

describe('measurePurifying', () => {
  it('returns low score for minimal content', () => {
    const m = measurePurifying(minimalContent)
    expect(m.purity).toBeLessThanOrEqual(10)
    expect(m.hasHighPurity).toBe(false)
    expect(m.hasReadable).toBe(false)
    expect(m.hasTransparent).toBe(false)
    expect(m.hasClear).toBe(false)
    expect(m.hasClean).toBe(false)
    expect(m.hasPristine).toBe(false)
    expect(m.hasLuminous).toBe(false)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasNoDeadCode).toBe(true)
    expect(m.hasNoTarnished).toBe(true)
    expect(m.obfuscatedCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measurePurifying(moderateContent)
    expect(m.purity).toBeGreaterThan(20)
    expect(m.purity).toBeLessThan(70)
    expect(m.hasReadable).toBe(true)
    expect(m.hasClear).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measurePurifying(richContent)
    expect(m.purity).toBe(100)
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasPristine).toBe(true)
    expect(m.hasLuminous).toBe(true)
    expect(m.moon).toBe('full-moon')
  })

  it('detects any as obfuscated', () => {
    const m = measurePurifying('const x: any = 1 as any')
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.obfuscatedCount).toBe(2)
  })

  it('detects var as cryptic', () => {
    const m = measurePurifying('var x = 1')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBe(1)
  })
})

// ─── Architecting Measure ──────────────────────────────────────────

describe('measureArchitecting', () => {
  it('returns low score for minimal content', () => {
    const m = measureArchitecting(minimalContent)
    expect(m.architecture).toBeLessThanOrEqual(10)
    expect(m.hasHighArchitecture).toBe(false)
    expect(m.hasStructured).toBe(false)
    expect(m.hasWellOrganized).toBe(false)
    expect(m.hasModular).toBe(false)
    expect(m.hasLayered).toBe(false)
    expect(m.hasBalanced).toBe(false)
    expect(m.hasSound).toBe(false)
    expect(m.chaoticCount).toBe(0)
    expect(m.monolithicCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureArchitecting(moderateContent)
    expect(m.architecture).toBeGreaterThan(20)
    expect(m.architecture).toBeLessThan(70)
    expect(m.hasStructured).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureArchitecting(richContent)
    expect(m.architecture).toBe(100)
    expect(m.hasHighArchitecture).toBe(true)
    expect(m.hasStructured).toBe(true)
    expect(m.hasWellOrganized).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasLayered).toBe(true)
    expect(m.hasBalanced).toBe(true)
    expect(m.hasSound).toBe(true)
    expect(m.vault).toBe('flying-buttress')
  })

  it('detects var as chaotic', () => {
    const m = measureArchitecting('var x = 1')
    expect(m.hasNoChaotic).toBe(false)
    expect(m.chaoticCount).toBe(1)
  })
})

// ─── Resonating Measure ────────────────────────────────────────────

describe('measureResonating', () => {
  it('returns low score for minimal content', () => {
    const m = measureResonating(minimalContent)
    expect(m.clarity).toBeLessThanOrEqual(10)
    expect(m.hasHighClarity).toBe(false)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasWellNamed).toBe(false)
    expect(m.hasClearIntent).toBe(false)
    expect(m.hasExpressive).toBe(false)
    expect(m.hasCommunicative).toBe(false)
    expect(m.hasResonant).toBe(false)
    expect(m.crypticCount).toBe(0)
    expect(m.ambiguousCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureResonating(moderateContent)
    expect(m.clarity).toBeGreaterThan(20)
    expect(m.clarity).toBeLessThan(70)
    expect(m.hasWellNamed).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureResonating(richContent)
    expect(m.clarity).toBe(100)
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasWellNamed).toBe(true)
    expect(m.hasClearIntent).toBe(true)
    expect(m.hasExpressive).toBe(true)
    expect(m.hasCommunicative).toBe(true)
    expect(m.hasResonant).toBe(true)
    expect(m.bell).toBe('crystal-chime')
  })
})

// ─── Tempering Measure ─────────────────────────────────────────────

describe('measureTempering', () => {
  it('returns low score for minimal content', () => {
    const m = measureTempering(minimalContent)
    expect(m.strength).toBeLessThanOrEqual(10)
    expect(m.hasHighStrength).toBe(false)
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasTested).toBe(false)
    expect(m.hasFlexible).toBe(false)
    expect(m.hasExtensible).toBe(false)
    expect(m.hasResilient).toBe(false)
    expect(m.hasAdaptive).toBe(false)
    expect(m.unsafeCount).toBe(0)
    expect(m.fragileCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureTempering(moderateContent)
    expect(m.strength).toBeGreaterThan(10)
    expect(m.strength).toBeLessThan(70)
    expect(m.hasResilient).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureTempering(richContent)
    expect(m.strength).toBe(100)
    expect(m.hasHighStrength).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasFlexible).toBe(true)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasAdaptive).toBe(true)
    expect(m.temper).toBe('master-tempered')
  })

  it('detects var as unsafe', () => {
    const m = measureTempering('var x = 1')
    expect(m.hasNoUnsafe).toBe(false)
    expect(m.unsafeCount).toBe(1)
  })
})

// ─── Illuminating Measure ──────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns low score for minimal content', () => {
    const m = measureIlluminating(minimalContent)
    expect(m.wisdom).toBeLessThanOrEqual(10)
    expect(m.hasHighWisdom).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellCommented).toBe(false)
    expect(m.hasJSDoc).toBe(false)
    expect(m.hasExplained).toBe(false)
    expect(m.hasIlluminated).toBe(false)
    expect(m.hasGuiding).toBe(false)
    expect(m.undocumentedCount).toBe(0)
    expect(m.bareCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureIlluminating(moderateContent)
    expect(m.wisdom).toBeGreaterThan(10)
    expect(m.wisdom).toBeLessThan(70)
  })

  it('returns high score for rich content', () => {
    const m = measureIlluminating(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellCommented).toBe(true)
    expect(m.hasJSDoc).toBe(true)
    expect(m.hasExplained).toBe(true)
    expect(m.hasIlluminated).toBe(true)
    expect(m.hasGuiding).toBe(true)
    expect(m.candle).toBe('eternal-flame')
  })

  it('detects var as undocumented', () => {
    const m = measureIlluminating('var x = 1')
    expect(m.hasNoUndocumented).toBe(false)
    expect(m.undocumentedCount).toBe(1)
  })
})

// ─── Classification Functions ──────────────────────────────────────

describe('classifyPillarCondition', () => {
  it('classifies holy-relic', () => expect(classifyPillarCondition(90)).toBe('holy-relic'))
  it('classifies blessed-silver', () => expect(classifyPillarCondition(75)).toBe('blessed-silver'))
  it('classifies proper-shrine', () => expect(classifyPillarCondition(60)).toBe('proper-shrine'))
  it('classifies tarnished-altar', () => expect(classifyPillarCondition(45)).toBe('tarnished-altar'))
  it('classifies rusted-iron', () => expect(classifyPillarCondition(30)).toBe('rusted-iron'))
  it('classifies dust', () => expect(classifyPillarCondition(10)).toBe('dust'))
})

describe('classifyNaveCondition', () => {
  it('classifies sacred-ground', () => expect(classifyNaveCondition(80)).toBe('sacred-ground'))
  it('classifies blessed-hall', () => expect(classifyNaveCondition(65)).toBe('blessed-hall'))
  it('classifies proper-sanctuary', () => expect(classifyNaveCondition(50)).toBe('proper-sanctuary'))
  it('classifies secular-building', () => expect(classifyNaveCondition(35)).toBe('secular-building'))
  it('classifies abandoned-ruin', () => expect(classifyNaveCondition(20)).toBe('abandoned-ruin'))
  it('classifies void', () => expect(classifyNaveCondition(5)).toBe('void'))
})

describe('classifyBishopGrade', () => {
  it('classifies archbishop', () => expect(classifyBishopGrade(85)).toBe('archbishop'))
  it('classifies bishop', () => expect(classifyBishopGrade(70)).toBe('bishop'))
  it('classifies abbot', () => expect(classifyBishopGrade(55)).toBe('abbot'))
  it('classifies prior', () => expect(classifyBishopGrade(40)).toBe('prior'))
  it('classifies novice', () => expect(classifyBishopGrade(25)).toBe('novice'))
  it('classifies pilgrim', () => expect(classifyBishopGrade(10)).toBe('pilgrim'))
})

describe('classifyNaveType', () => {
  it('returns no-nave for empty', () => {
    expect(classifyNaveType([])).toBe('no-nave')
  })

  it('returns grand-cathedral for all holy-relic', () => {
    const pillars = [
      { ...analyzeSilverPillar(richContent, 'a.ts'), condition: 'holy-relic' as const },
      { ...analyzeSilverPillar(richContent, 'b.ts'), condition: 'holy-relic' as const },
    ]
    expect(classifyNaveType(pillars)).toBe('grand-cathedral')
  })
})

// ─── analyzeSilverPillar ───────────────────────────────────────────

describe('analyzeSilverPillar', () => {
  it('analyzes minimal content', () => {
    const pillar = analyzeSilverPillar(minimalContent, 'mini.ts')
    expect(pillar.file).toBe('mini.ts')
    expect(pillar.qualityScore).toBeLessThanOrEqual(10)
    expect(pillar.condition).toBe('dust')
    expect(pillar.lunarPurity).toBeLessThanOrEqual(10)
    expect(pillar.vaultArchitecture).toBeLessThanOrEqual(10)
    expect(pillar.bellClarity).toBeLessThanOrEqual(10)
    expect(pillar.silverStrength).toBeLessThanOrEqual(10)
    expect(pillar.candleWisdom).toBeLessThanOrEqual(10)
  })

  it('analyzes moderate content', () => {
    const pillar = analyzeSilverPillar(moderateContent, 'mod.ts')
    expect(pillar.file).toBe('mod.ts')
    expect(pillar.qualityScore).toBeGreaterThan(20)
    expect(pillar.qualityScore).toBeLessThan(70)
  })

  it('analyzes rich content', () => {
    const pillar = analyzeSilverPillar(richContent, 'rich.ts')
    expect(pillar.file).toBe('rich.ts')
    expect(pillar.qualityScore).toBe(100)
    expect(pillar.condition).toBe('holy-relic')
    expect(pillar.lunarPurity).toBe(100)
    expect(pillar.vaultArchitecture).toBe(100)
    expect(pillar.bellClarity).toBe(100)
    expect(pillar.silverStrength).toBe(100)
    expect(pillar.candleWisdom).toBe(100)
  })
})

// ─── analyzeSilverNave ─────────────────────────────────────────────

describe('analyzeSilverNave', () => {
  it('handles empty pillars', () => {
    const nave = analyzeSilverNave([], 'empty')
    expect(nave.directory).toBe('empty')
    expect(nave.pillars).toHaveLength(0)
    expect(nave.avgPurity).toBe(0)
    expect(nave.avgArchitecture).toBe(0)
    expect(nave.avgWisdom).toBe(0)
    expect(nave.holyRelicCount).toBe(0)
    expect(nave.dustCount).toBe(0)
    expect(nave.naveType).toBe('no-nave')
    expect(nave.condition).toBe('void')
  })

  it('classifies nave with rich pillars', () => {
    const pillar = analyzeSilverPillar(richContent, 'rich.ts')
    const nave = analyzeSilverNave([pillar], 'src')
    expect(nave.naveType).toBe('grand-cathedral')
    expect(nave.holyRelicCount).toBe(1)
    expect(nave.dustCount).toBe(0)
    expect(nave.avgPurity).toBe(100)
    expect(nave.condition).toBe('sacred-ground')
  })

  it('classifies nave with mixed pillars', () => {
    const rich = analyzeSilverPillar(richContent, 'rich.ts')
    const minimal = analyzeSilverPillar(minimalContent, 'mini.ts')
    const nave = analyzeSilverNave([rich, minimal], 'src')
    expect(nave.pillars).toHaveLength(2)
    expect(nave.holyRelicCount).toBe(1)
    expect(nave.dustCount).toBe(1)
  })
})

// ─── buildSilverCathedralResult ────────────────────────────────────

describe('buildSilverCathedralResult', async () => {
  it('handles empty input', async () => {
    const result = await buildSilverCathedralResult([], [])
    expect(result.pillars).toHaveLength(0)
    expect(result.naves).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallHoliness).toBe(0)
    expect(result.stats.bishopGrade).toBe('pilgrim')
    expect(result.diocese.isSacred).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildSilverCathedralResult(['test.ts'], [richContent])
    expect(result.pillars).toHaveLength(1)
    expect(result.pillars[0].condition).toBe('holy-relic')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.holyRelicCount).toBe(1)
    expect(result.stats.dustCount).toBe(0)
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildSilverCathedralResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.pillars).toHaveLength(2)
    expect(result.naves).toHaveLength(2)
    expect(result.stats.totalNaves).toBe(2)
  })

  it('computes overall stats correctly for rich content', async () => {
    const result = await buildSilverCathedralResult(['rich.ts'], [richContent])
    expect(result.stats.overallHoliness).toBe(100)
    expect(result.stats.bishopGrade).toBe('archbishop')
    expect(result.stats.bestPillar).toBe('rich.ts')
    expect(result.stats.purest).toBe('rich.ts')
    expect(result.stats.bestArchitecture).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
  })

  it('computes diocese correctly', async () => {
    const result = await buildSilverCathedralResult(['rich.ts'], [richContent])
    expect(result.diocese.avgPurity).toBe(100)
    expect(result.diocese.avgArchitecture).toBe(100)
    expect(result.diocese.avgWisdom).toBe(100)
    expect(result.diocese.isSacred).toBe(true)
    expect(result.diocese.overallHoliness).toBe(100)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', async () => {
  it('returns perfect message when all good', async () => {
    const result = await buildSilverCathedralResult(['rich.ts'], [richContent])
    const recs = generateRecommendations(result.pillars, result.naves, result.diocese, result.stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('sacred perfection')
  })

  it('recommends improving purity when low', async () => {
    const result = await buildSilverCathedralResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('purity') || r.includes('moonlight'))).toBe(true)
  })

  it('recommends improving architecture when low', async () => {
    const result = await buildSilverCathedralResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('architecture') || r.includes('vault'))).toBe(true)
  })

  it('recommends improving clarity when low', async () => {
    const result = await buildSilverCathedralResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('clarity') || r.includes('bell'))).toBe(true)
  })

  it('recommends improving strength when low', async () => {
    const result = await buildSilverCathedralResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('strength') || r.includes('temper'))).toBe(true)
  })

  it('recommends improving wisdom when low', async () => {
    const result = await buildSilverCathedralResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('candle') || r.includes('wisdom'))).toBe(true)
  })

  it('notes dust files', async () => {
    const result = await buildSilverCathedralResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('dust'))).toBe(true)
  })

  it('lists specific dust files when <=3', async () => {
    const result = await buildSilverCathedralResult(
      ['a.ts', 'b.ts'],
      [minimalContent, minimalContent],
    )
    expect(result.recommendations.some(r => r.includes('a.ts') || r.includes('b.ts'))).toBe(true)
  })
})

// ─── gatherFiles ───────────────────────────────────────────────────

describe('gatherFiles', () => {
  it('returns empty for non-existent path', async () => {
    const files = await gatherFiles('/nonexistent', ['.ts'], [])
    expect(files).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for any grade', () => {
    expect(typeof colorGrade('holy-relic')).toBe('string')
    expect(typeof colorGrade('dust')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatPillarTable', () => {
  it('formats a pillar', () => {
    const pillar = analyzeSilverPillar(richContent, 'rich.ts')
    const output = formatPillarTable(pillar)
    expect(output).toContain('rich.ts')
    expect(output).toContain('Lunar Purity')
    expect(output).toContain('Vault Architecture')
    expect(output).toContain('Bell Clarity')
    expect(output).toContain('Silver Strength')
    expect(output).toContain('Candle Wisdom')
  })
})

describe('formatPillarsTable', () => {
  it('returns message for empty pillars', () => {
    expect(formatPillarsTable([])).toContain('No silver pillars')
  })

  it('formats multiple pillars', () => {
    const pillars = [
      analyzeSilverPillar(richContent, 'rich.ts'),
      analyzeSilverPillar(minimalContent, 'mini.ts'),
    ]
    const output = formatPillarsTable(pillars)
    expect(output).toContain('rich.ts')
    expect(output).toContain('mini.ts')
  })
})

describe('formatNaveTable', () => {
  it('formats a nave', () => {
    const pillar = analyzeSilverPillar(richContent, 'rich.ts')
    const nave = analyzeSilverNave([pillar], 'src')
    const output = formatNaveTable(nave)
    expect(output).toContain('src')
    expect(output).toContain('Type')
  })
})

describe('formatNavesTable', () => {
  it('returns message for empty naves', () => {
    expect(formatNavesTable([])).toContain('No silver naves')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildSilverCathedralResult(['rich.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Silver Cathedral Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Bishop Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty recs', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['improve X', 'fix Y'])
    expect(output).toContain('improve X')
    expect(output).toContain('fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildSilverCathedralResult(['rich.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Silver Pillar Analysis')
    expect(output).toContain('Silver Naves')
    expect(output).toContain('Silver Cathedral Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildSilverCathedralResult(['rich.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.pillars).toHaveLength(1)
    expect(parsed.stats.bishopGrade).toBe('archbishop')
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with var and any in purifying', () => {
    const m = measurePurifying('var x: any = 1 as any')
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('handles content with debugger', () => {
    const m = measurePurifying('function f() { debugger }')
    expect(m.hasNoTarnished).toBe(false)
  })

  it('handles content with console.log in tempering', () => {
    const m = measureTempering('console.log("hi")')
    expect(m.hasNoHardcoded).toBe(false)
  })

  it('handles content with eval in illuminating', () => {
    const m = measureIlluminating('eval("1")')
    expect(m.hasNoOpaque).toBe(false)
  })

  it('pillar quality score is average of 5 measures', () => {
    const pillar = analyzeSilverPillar(richContent, 'rich.ts')
    const expected = Math.round(
      pillar.lunarPurity * 0.2 +
      pillar.vaultArchitecture * 0.2 +
      pillar.bellClarity * 0.2 +
      pillar.silverStrength * 0.2 +
      pillar.candleWisdom * 0.2,
    )
    expect(pillar.qualityScore).toBe(expected)
  })

  it('overall holiness is average of purity, architecture, wisdom', async () => {
    const result = await buildSilverCathedralResult(['rich.ts'], [richContent])
    const expectedHoliness = Math.round((100 + 100 + 100) / 3)
    expect(result.stats.overallHoliness).toBe(expectedHoliness)
  })
})
