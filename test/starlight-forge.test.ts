import { describe, it, expect } from 'vitest'
import {
  measureIgniting,
  measureHardening,
  measurePatterning,
  measureClarifying,
  measureKnowing,
  analyzeStarlightIngot,
  analyzeStarlightNursery,
  classifyIngotCondition,
  classifyNurseryType,
  classifyNurseryCondition,
  classifyAstronomerGrade,
  generateRecommendations,
  buildStarlightForgeResult,
  gatherFiles,
} from '../src/commands/starlight-forge-helpers.js'
import {
  colorScore,
  colorGrade,
  formatIngotTable,
  formatIngotsTable,
  formatNurseryTable,
  formatNurseriesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/starlight-forge-format-helpers.js'

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

// ─── measureIgniting ───────────────────────────────────────────────

describe('measureIgniting', () => {
  it('returns low forging for minimal content', () => {
    const m = measureIgniting(minimalContent)
    expect(m.forging).toBeLessThanOrEqual(15)
    expect(m.hasHighForging).toBe(false)
    expect(m.hasCreative).toBe(false)
    expect(m.hasNoFormulaic).toBe(true)
    expect(m.hasTransformative).toBe(false)
    expect(m.hasNoBoilerplate).toBe(true)
    expect(m.hasInnovative).toBe(false)
    expect(m.hasExpressive).toBe(false)
    expect(m.hasPowerful).toBe(false)
    expect(m.hasDynamic).toBe(false)
    expect(m.formulaicCount).toBe(0)
    expect(m.boilerplateCount).toBe(0)
  })

  it('returns moderate forging for moderate content', () => {
    const m = measureIgniting(moderateContent)
    expect(m.forging).toBeGreaterThan(20)
    expect(m.hasCreative).toBe(true)
  })

  it('returns high forging for rich content', () => {
    const m = measureIgniting(richContent)
    expect(m.forging).toBeGreaterThan(60)
    expect(m.hasCreative).toBe(true)
    expect(m.hasTransformative).toBe(true)
    expect(m.hasNoBoilerplate).toBe(true)
    expect(m.hasInnovative).toBe(true)
    expect(m.hasDynamic).toBe(true)
  })

  it('detects var as formulaic', () => {
    const m = measureIgniting('var x = 1')
    expect(m.hasNoFormulaic).toBe(false)
    expect(m.formulaicCount).toBe(1)
  })

  it('no boilerplate when no default exports', () => {
    const m = measureIgniting('export function foo() {}')
    expect(m.hasNoBoilerplate).toBe(true)
    expect(m.boilerplateCount).toBe(0)
  })
})

// ─── measureHardening ──────────────────────────────────────────────

describe('measureHardening', () => {
  it('returns low hardness for minimal content', () => {
    const m = measureHardening(minimalContent)
    expect(m.hardness).toBeLessThanOrEqual(15)
    expect(m.hasHighHardness).toBe(false)
    expect(m.hasTested).toBe(false)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasRobust).toBe(false)
    expect(m.hasDefensive).toBe(false)
    expect(m.untestedCount).toBe(0)
    expect(m.bareCrashCount).toBe(0)
  })

  it('returns high hardness for rich content', () => {
    const m = measureHardening(richContent)
    expect(m.hardness).toBeGreaterThan(60)
    expect(m.hasTested).toBe(true)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasRobust).toBe(true)
  })

  it('detects var as untested', () => {
    const m = measureHardening('var x = 1')
    expect(m.hasNoUntested).toBe(false)
    expect(m.untestedCount).toBe(1)
  })

  it('detects debugger as bare crash', () => {
    const m = measureHardening('function f() { debugger }')
    expect(m.hasNoNaive).toBe(false)
    expect(m.bareCrashCount).toBe(1)
  })

  it('detects bare throw', () => {
    const m = measureHardening('throw "error"')
    expect(m.hasNoBareCrash).toBe(false)
    expect(m.bareCrashCount).toBe(1)
  })

  it('hardness is within 0-100', () => {
    const m = measureHardening(richContent)
    expect(m.hardness).toBeLessThanOrEqual(100)
    expect(m.hardness).toBeGreaterThanOrEqual(0)
  })
})

// ─── measurePatterning ─────────────────────────────────────────────

describe('measurePatterning', () => {
  it('returns low pattern for minimal content', () => {
    const m = measurePatterning(minimalContent)
    expect(m.pattern).toBeLessThanOrEqual(15)
    expect(m.hasHighPattern).toBe(false)
    expect(m.hasStructured).toBe(false)
    expect(m.hasModular).toBe(false)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasNoMonolithic).toBe(true)
    expect(m.chaoticCount).toBe(0)
    expect(m.monolithicCount).toBe(0)
  })

  it('returns high pattern for rich content', () => {
    const m = measurePatterning(richContent)
    expect(m.pattern).toBeGreaterThan(50)
    expect(m.hasStructured).toBe(true)
    expect(m.hasModular).toBe(false)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasNoMonolithic).toBe(true)
  })

  it('detects var as chaotic', () => {
    const m = measurePatterning('var x = 1')
    expect(m.hasNoChaotic).toBe(false)
    expect(m.chaoticCount).toBe(1)
  })

  it('pattern is within 0-100', () => {
    const m = measurePatterning(richContent)
    expect(m.pattern).toBeLessThanOrEqual(100)
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns low clarity for minimal content', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBeLessThanOrEqual(15)
    expect(m.hasHighClarity).toBe(false)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasVisible).toBe(false)
    expect(m.hasLuminous).toBe(false)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('returns moderate clarity for moderate content', () => {
    const m = measureClarifying(moderateContent)
    expect(m.clarity).toBeGreaterThan(20)
    expect(m.hasReadable).toBe(true)
    expect(m.hasVisible).toBe(true)
  })

  it('returns high clarity for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeGreaterThan(70)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
  })

  it('detects eval as cryptic', () => {
    const m = measureClarifying('eval("1")')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBe(1)
  })

  it('detects debugger as obfuscated', () => {
    const m = measureClarifying('function f() { debugger }')
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.obfuscatedCount).toBe(1)
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns low wisdom for minimal content', () => {
    const m = measureKnowing(minimalContent)
    expect(m.wisdom).toBeLessThanOrEqual(15)
    expect(m.hasHighWisdom).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellArchitected).toBe(false)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hasNoHacky).toBe(true)
    expect(m.adHocCount).toBe(0)
    expect(m.hackyCount).toBe(0)
  })

  it('returns high wisdom for rich content', () => {
    const m = measureKnowing(richContent)
    expect(m.wisdom).toBeGreaterThan(50)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasNoAdHoc).toBe(true)
  })

  it('detects var as adHoc', () => {
    const m = measureKnowing('var x = 1')
    expect(m.hasNoAdHoc).toBe(false)
    expect(m.adHocCount).toBe(1)
  })

  it('detects as any as hacky', () => {
    const m = measureKnowing('const x = y as any')
    expect(m.hasNoHacky).toBe(false)
    expect(m.hackyCount).toBe(1)
  })
})

// ─── Classification Functions ──────────────────────────────────────

describe('classifyIngotCondition', () => {
  it('classifies stellar-masterpiece', () => expect(classifyIngotCondition(92)).toBe('stellar-masterpiece'))
  it('classifies bright-star', () => expect(classifyIngotCondition(78)).toBe('bright-star'))
  it('classifies proper-body', () => expect(classifyIngotCondition(65)).toBe('proper-body'))
  it('classifies dim-object', () => expect(classifyIngotCondition(45)).toBe('dim-object'))
  it('classifies dark-matter', () => expect(classifyIngotCondition(25)).toBe('dark-matter'))
  it('classifies void', () => expect(classifyIngotCondition(10)).toBe('void'))
})

describe('classifyNurseryCondition', () => {
  it('classifies magnificent-cosmos', () => expect(classifyNurseryCondition(88)).toBe('magnificent-cosmos'))
  it('classifies beautiful-constellation', () => expect(classifyNurseryCondition(72)).toBe('beautiful-constellation'))
  it('classifies proper-galaxy', () => expect(classifyNurseryCondition(58)).toBe('proper-galaxy'))
  it('classifies dim-cluster', () => expect(classifyNurseryCondition(38)).toBe('dim-cluster'))
  it('classifies dark-void', () => expect(classifyNurseryCondition(18)).toBe('dark-void'))
  it('classifies void', () => expect(classifyNurseryCondition(5)).toBe('void'))
})

describe('classifyAstronomerGrade', () => {
  it('classifies stellar-architect', () => expect(classifyAstronomerGrade(88)).toBe('stellar-architect'))
  it('classifies star-forger', () => expect(classifyAstronomerGrade(72)).toBe('star-forger'))
  it('classifies cosmic-smith', () => expect(classifyAstronomerGrade(58)).toBe('cosmic-smith'))
  it('classifies apprentice', () => expect(classifyAstronomerGrade(42)).toBe('apprentice'))
  it('classifies novice', () => expect(classifyAstronomerGrade(22)).toBe('novice'))
  it('classifies groundling', () => expect(classifyAstronomerGrade(8)).toBe('groundling'))
})

describe('classifyNurseryType', () => {
  it('returns no-nursery for empty', () => {
    expect(classifyNurseryType([])).toBe('no-nursery')
  })
})

// ─── analyzeStarlightIngot ─────────────────────────────────────────

describe('analyzeStarlightIngot', () => {
  it('analyzes minimal content', () => {
    const ingot = analyzeStarlightIngot(minimalContent, 'mini.ts')
    expect(ingot.file).toBe('mini.ts')
    expect(ingot.qualityScore).toBeLessThanOrEqual(20)
    expect(ingot.condition).toBe('void')
    expect(ingot.celestialForging).toBeLessThanOrEqual(15)
    expect(ingot.starHardness).toBeLessThanOrEqual(15)
    expect(ingot.constellationPattern).toBeLessThanOrEqual(15)
    expect(ingot.nebulaClarity).toBeLessThanOrEqual(15)
    expect(ingot.cosmicWisdom).toBeLessThanOrEqual(15)
  })

  it('analyzes rich content', () => {
    const ingot = analyzeStarlightIngot(richContent, 'rich.ts')
    expect(ingot.file).toBe('rich.ts')
    expect(ingot.qualityScore).toBeGreaterThan(40)
    expect(ingot.condition).not.toBe('void')
    expect(ingot.celestialForging).toBeGreaterThan(50)
    expect(ingot.nebulaClarity).toBeGreaterThan(50)
    expect(ingot.cosmicWisdom).toBeGreaterThan(50)
  })

  it('quality score is average of 5 measures', () => {
    const ingot = analyzeStarlightIngot(richContent, 'rich.ts')
    const expected = Math.round(
      ingot.celestialForging * 0.2 +
      ingot.starHardness * 0.2 +
      ingot.constellationPattern * 0.2 +
      ingot.nebulaClarity * 0.2 +
      ingot.cosmicWisdom * 0.2,
    )
    expect(ingot.qualityScore).toBe(expected)
  })
})

// ─── analyzeStarlightNursery ───────────────────────────────────────

describe('analyzeStarlightNursery', () => {
  it('handles empty ingots', () => {
    const nursery = analyzeStarlightNursery([], 'empty')
    expect(nursery.directory).toBe('empty')
    expect(nursery.ingots).toHaveLength(0)
    expect(nursery.avgForging).toBe(0)
    expect(nursery.avgHardness).toBe(0)
    expect(nursery.avgWisdom).toBe(0)
    expect(nursery.nurseryType).toBe('no-nursery')
    expect(nursery.condition).toBe('void')
  })

  it('classifies nursery with rich ingots', () => {
    const ingot = analyzeStarlightIngot(richContent, 'rich.ts')
    const nursery = analyzeStarlightNursery([ingot], 'src')
    expect(nursery.ingots).toHaveLength(1)
    expect(nursery.voidCount).toBe(0)
    expect(nursery.avgForging).toBeGreaterThan(0)
    expect(nursery.nurseryType).not.toBe('no-nursery')
  })

  it('classifies nursery with mixed ingots', () => {
    const rich = analyzeStarlightIngot(richContent, 'rich.ts')
    const minimal = analyzeStarlightIngot(minimalContent, 'mini.ts')
    const nursery = analyzeStarlightNursery([rich, minimal], 'src')
    expect(nursery.ingots).toHaveLength(2)
    expect(nursery.voidCount).toBe(1)
  })
})

// ─── buildStarlightForgeResult ─────────────────────────────────────

describe('buildStarlightForgeResult', async () => {
  it('handles empty input', async () => {
    const result = await buildStarlightForgeResult([], [])
    expect(result.ingots).toHaveLength(0)
    expect(result.nurseries).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallLuminosity).toBe(0)
    expect(result.stats.astronomerGrade).toBe('groundling')
    expect(result.cosmos.isStellar).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildStarlightForgeResult(['test.ts'], [richContent])
    expect(result.ingots).toHaveLength(1)
    expect(result.ingots[0].condition).not.toBe('void')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.voidCount).toBe(0)
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildStarlightForgeResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.ingots).toHaveLength(2)
    expect(result.nurseries).toHaveLength(2)
    expect(result.stats.totalNurseries).toBe(2)
  })

  it('computes cosmos correctly', async () => {
    const result = await buildStarlightForgeResult(['rich.ts'], [richContent])
    expect(result.cosmos.avgForging).toBeGreaterThan(0)
    expect(result.cosmos.avgHardness).toBeGreaterThan(0)
    expect(result.cosmos.avgWisdom).toBeGreaterThan(0)
    expect(typeof result.cosmos.isStellar).toBe('boolean')
    expect(result.cosmos.overallLuminosity).toBeGreaterThan(0)
  })

  it('computes overall luminosity as avg of forging, hardness, wisdom', async () => {
    const result = await buildStarlightForgeResult(['rich.ts'], [richContent])
    const expected = Math.round(
      (result.stats.avgCelestialForging + result.stats.avgStarHardness + result.stats.avgCosmicWisdom) / 3,
    )
    expect(result.stats.overallLuminosity).toBe(expected)
  })

  it('tracks condition counts', async () => {
    const result = await buildStarlightForgeResult(
      ['rich.ts', 'mini.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.voidCount).toBe(1)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('identifies best ingot and extremes', async () => {
    const result = await buildStarlightForgeResult(['rich.ts'], [richContent])
    expect(result.stats.bestIngot).toBe('rich.ts')
    expect(result.stats.mostForged).toBe('rich.ts')
    expect(result.stats.hardest).toBe('rich.ts')
    expect(result.stats.bestPatterned).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', async () => {
  it('returns steady message when quality is good', async () => {
    const result = await buildStarlightForgeResult(['rich.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('recommends improving forging when low', async () => {
    const result = await buildStarlightForgeResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('forge') || r.includes('Ignite'))).toBe(true)
  })

  it('recommends improving hardness when low', async () => {
    const result = await buildStarlightForgeResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('Harden') || r.includes('error'))).toBe(true)
  })

  it('recommends improving pattern when low', async () => {
    const result = await buildStarlightForgeResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('pattern') || r.includes('constellation'))).toBe(true)
  })

  it('recommends improving clarity when low', async () => {
    const result = await buildStarlightForgeResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('nebula') || r.includes('Clear'))).toBe(true)
  })

  it('recommends improving wisdom when low', async () => {
    const result = await buildStarlightForgeResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('wisdom') || r.includes('cosmic'))).toBe(true)
  })

  it('notes void files', async () => {
    const result = await buildStarlightForgeResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('void') || r.includes('Void'))).toBe(true)
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
    expect(typeof colorGrade('stellar-masterpiece')).toBe('string')
    expect(typeof colorGrade('void')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatIngotTable', () => {
  it('formats an ingot', () => {
    const ingot = analyzeStarlightIngot(richContent, 'rich.ts')
    const output = formatIngotTable(ingot)
    expect(output).toContain('rich.ts')
    expect(output).toContain('Celestial Forging')
    expect(output).toContain('Star Hardness')
    expect(output).toContain('Constellation Pattern')
    expect(output).toContain('Nebula Clarity')
    expect(output).toContain('Cosmic Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatIngotsTable', () => {
  it('returns message for empty ingots', () => {
    expect(formatIngotsTable([])).toContain('No starlight ingots')
  })
})

describe('formatNurseryTable', () => {
  it('formats a nursery', () => {
    const ingot = analyzeStarlightIngot(richContent, 'rich.ts')
    const nursery = analyzeStarlightNursery([ingot], 'src')
    const output = formatNurseryTable(nursery)
    expect(output).toContain('src')
    expect(output).toContain('Avg Forge')
  })
})

describe('formatNurseriesTable', () => {
  it('returns message for empty nurseries', () => {
    expect(formatNurseriesTable([])).toContain('No starlight nurseries')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildStarlightForgeResult(['rich.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Starlight Forge Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Astronomer Grade')
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
    const result = await buildStarlightForgeResult(['rich.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Starlight Ingot Analysis')
    expect(output).toContain('Starlight Nurseries')
    expect(output).toContain('Starlight Forge Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildStarlightForgeResult(['rich.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.ingots).toHaveLength(1)
    expect(parsed.stats.astronomerGrade).toBeDefined()
    expect(parsed.cosmos.overallLuminosity).toBeGreaterThan(0)
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('all scores within 0-100 for varied content', () => {
    const contents = ['', 'x', minimalContent, moderateContent, richContent, 'eval("x") as any var z']
    for (const c of contents) {
      expect(measureIgniting(c).forging).toBeGreaterThanOrEqual(0)
      expect(measureIgniting(c).forging).toBeLessThanOrEqual(100)
      expect(measureHardening(c).hardness).toBeGreaterThanOrEqual(0)
      expect(measureHardening(c).hardness).toBeLessThanOrEqual(100)
      expect(measurePatterning(c).pattern).toBeGreaterThanOrEqual(0)
      expect(measurePatterning(c).pattern).toBeLessThanOrEqual(100)
      expect(measureClarifying(c).clarity).toBeGreaterThanOrEqual(0)
      expect(measureClarifying(c).clarity).toBeLessThanOrEqual(100)
      expect(measureKnowing(c).wisdom).toBeGreaterThanOrEqual(0)
      expect(measureKnowing(c).wisdom).toBeLessThanOrEqual(100)
    }
  })

  it('multi-dir creates multiple nurseries', async () => {
    const result = await buildStarlightForgeResult(
      ['src/a.ts', 'lib/b.ts', 'src/c.ts'],
      [richContent, moderateContent, minimalContent],
    )
    expect(result.nurseries).toHaveLength(2)
    const srcNursery = result.nurseries.find(n => n.directory === 'src')
    expect(srcNursery).toBeDefined()
    expect(srcNursery!.ingots).toHaveLength(2)
  })

  it('overall luminosity matches cosmos', async () => {
    const result = await buildStarlightForgeResult(['rich.ts'], [richContent])
    expect(result.stats.overallLuminosity).toBe(result.cosmos.overallLuminosity)
  })
})
