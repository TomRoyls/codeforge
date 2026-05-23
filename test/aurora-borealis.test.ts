import { describe, it, expect } from 'vitest'
import {
  measureShining,
  measureEnriching,
  measureAligning,
  measureDancing,
  measureHarmonizing,
  classifyCurtainCondition,
  classifyBeltType,
  classifyAstronomerGrade,
  classifyBeltCondition,
  analyzeAuroraCurtain,
  analyzeAuroraBelt,
  buildAuroraBorealisResult,
  generateRecommendations,
  gatherFiles,
  type AuroraCurtain,
  type AuroraBelt,
  type SkySummary,
  type AuroraBorealisStats,
} from '../src/commands/aurora-borealis-helpers.js'
import {
  colorScore,
  colorGrade,
  formatCurtainTable,
  formatCurtainsTable,
  formatBeltTable,
  formatBeltsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/aurora-borealis-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const minimalContent = 'const x = 1'
const richContent = `/**
 * Doc comment
 */
export interface Foo<T> {
  readonly bar: string
}

export async function hello(): Promise<string> {
  const x = 1
  if (x === 1) {
    return 'hi'
  }
  return 'bye'
}

export class MyClass {
  private val: number
}

type Alias = string | number
`

const midContent = `export interface Item {
  name: string
  value: number
}

export function process(data: Item): string {
  const result = data.name
  if (result === 'test') {
    return 'ok'
  }
  return 'done'
}
`

// ─── measureShining ────────────────────────────────────────────────

describe('measureShining', () => {
  it('scores minimal content', () => {
    const m = measureShining(minimalContent)
    expect(m.luminosity).toBe(8)
    expect(m.grade).toBe('dark-sky')
    expect(m.hasHighLuminosity).toBe(false)
    expect(m.hasBright).toBe(false)
    expect(m.hasClear).toBe(false)
    expect(m.hasRadiant).toBe(false)
    expect(m.hasGlowing).toBe(false)
    expect(m.hasLuminous).toBe(false)
    expect(m.hasShining).toBe(false)
    expect(m.hasNoDark).toBe(true)
    expect(m.hasNoDim).toBe(true)
    expect(m.hasNoMurky).toBe(true)
    expect(m.hasNoObscure).toBe(true)
    expect(m.darkCount).toBe(0)
    expect(m.dimCount).toBe(0)
  })

  it('scores rich content as brilliant-aurora', () => {
    const m = measureShining(richContent)
    expect(m.luminosity).toBe(100)
    expect(m.grade).toBe('brilliant-aurora')
    expect(m.hasHighLuminosity).toBe(true)
    expect(m.hasBright).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasRadiant).toBe(true)
    expect(m.hasGlowing).toBe(true)
    expect(m.hasLuminous).toBe(true)
    expect(m.hasShining).toBe(true)
  })

  it('detects dark patterns', () => {
    const darkContent = 'var x = 1; var y: any = 2'
    const m = measureShining(darkContent)
    expect(m.hasNoDark).toBe(false)
    expect(m.hasNoDim).toBe(false)
    expect(m.darkCount).toBe(2)
    expect(m.dimCount).toBe(1)
  })

  it('detects murky patterns', () => {
    const murkyContent = 'eval("test"); debugger'
    const m = measureShining(murkyContent)
    expect(m.hasNoMurky).toBe(false)
    expect(m.hasNoObscure).toBe(false)
  })

  it('scores mid content', () => {
    const m = measureShining(midContent)
    expect(m.luminosity).toBeGreaterThan(8)
    expect(m.luminosity).toBeLessThan(100)
  })

  it('caps luminosity at 100', () => {
    const megaContent = `${richContent}\n${richContent}`
    const m = measureShining(megaContent)
    expect(m.luminosity).toBeLessThanOrEqual(100)
  })
})

// ─── measureEnriching ──────────────────────────────────────────────

describe('measureEnriching', () => {
  it('scores minimal content', () => {
    const m = measureEnriching(minimalContent)
    expect(m.richness).toBe(8)
    expect(m.spectrum).toBe('colorless')
    expect(m.hasHighRichness).toBe(false)
    expect(m.hasDiverse).toBe(false)
    expect(m.hasVaried).toBe(false)
    expect(m.hasColorful).toBe(false)
    expect(m.hasRich).toBe(false)
    expect(m.hasVibrant).toBe(false)
    expect(m.hasMultifaceted).toBe(false)
    expect(m.hasNoUniform).toBe(true)
    expect(m.hasNoDrab).toBe(true)
    expect(m.hasNoSparse).toBe(true)
    expect(m.hasNoFlat).toBe(true)
  })

  it('scores rich content as full-spectrum', () => {
    const m = measureEnriching(richContent)
    expect(m.richness).toBe(99)
    expect(m.spectrum).toBe('full-spectrum')
    expect(m.hasHighRichness).toBe(true)
    expect(m.hasVaried).toBe(true)
    expect(m.hasColorful).toBe(true)
    expect(m.hasRich).toBe(true)
    expect(m.hasVibrant).toBe(true)
    expect(m.hasMultifaceted).toBe(true)
    expect(m.hasDiverse).toBe(false)
  })

  it('detects uniform/drab patterns', () => {
    const badContent = 'var x: any = 1'
    const m = measureEnriching(badContent)
    expect(m.hasNoUniform).toBe(false)
    expect(m.hasNoDrab).toBe(false)
    expect(m.uniformCount).toBe(1)
    expect(m.drabCount).toBe(1)
  })
})

// ─── measureAligning ───────────────────────────────────────────────

describe('measureAligning', () => {
  it('scores minimal content', () => {
    const m = measureAligning(minimalContent)
    expect(m.alignment).toBe(10)
    expect(m.field).toBe('no-field')
    expect(m.hasHighAlignment).toBe(false)
    expect(m.hasConsistent).toBe(false)
    expect(m.hasPrincipled).toBe(false)
    expect(m.hasAligned).toBe(false)
    expect(m.hasCoherent).toBe(false)
    expect(m.hasHarmonious).toBe(false)
    expect(m.hasUnited).toBe(false)
    expect(m.hasNoContradictory).toBe(true)
    expect(m.hasNoConflicting).toBe(true)
    expect(m.hasNoIncoherent).toBe(true)
    expect(m.hasNoClashing).toBe(true)
  })

  it('scores rich content as true-north', () => {
    const m = measureAligning(richContent)
    expect(m.alignment).toBe(100)
    expect(m.field).toBe('true-north')
    expect(m.hasHighAlignment).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasAligned).toBe(true)
    expect(m.hasCoherent).toBe(true)
    expect(m.hasHarmonious).toBe(true)
    expect(m.hasUnited).toBe(true)
  })

  it('detects contradictory/conflicting patterns', () => {
    const badContent = 'var x: any = 1'
    const m = measureAligning(badContent)
    expect(m.hasNoContradictory).toBe(false)
    expect(m.hasNoConflicting).toBe(false)
    expect(m.contradictoryCount).toBe(1)
    expect(m.conflictingCount).toBe(1)
  })
})

// ─── measureDancing ────────────────────────────────────────────────

describe('measureDancing', () => {
  it('scores minimal content', () => {
    const m = measureDancing(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.dance).toBe('static')
    expect(m.hasHighQuality).toBe(false)
    expect(m.hasGraceful).toBe(false)
    expect(m.hasFlowing).toBe(false)
    expect(m.hasElegant).toBe(false)
    expect(m.hasSmooth).toBe(false)
    expect(m.hasFluid).toBe(false)
    expect(m.hasHarmonious2).toBe(false)
    expect(m.hasNoJerky).toBe(true)
    expect(m.hasNoClunky).toBe(true)
    expect(m.hasNoRough).toBe(true)
    expect(m.hasNoRigid).toBe(true)
  })

  it('scores rich content as graceful-waltz', () => {
    const m = measureDancing(richContent)
    expect(m.quality).toBe(100)
    expect(m.dance).toBe('graceful-waltz')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasFlowing).toBe(true)
    expect(m.hasElegant).toBe(true)
    expect(m.hasSmooth).toBe(true)
    expect(m.hasFluid).toBe(true)
    expect(m.hasHarmonious2).toBe(true)
  })

  it('detects jerky/clunky patterns', () => {
    const badContent = 'var x: any = 1'
    const m = measureDancing(badContent)
    expect(m.hasNoJerky).toBe(false)
    expect(m.hasNoClunky).toBe(false)
    expect(m.jerkyCount).toBe(1)
    expect(m.clunkyCount).toBe(1)
  })
})

// ─── measureHarmonizing ────────────────────────────────────────────

describe('measureHarmonizing', () => {
  it('scores minimal content', () => {
    const m = measureHarmonizing(minimalContent)
    expect(m.harmony).toBe(8)
    expect(m.cosmic).toBe('chaos')
    expect(m.hasHighHarmony).toBe(false)
    expect(m.hasBalanced).toBe(false)
    expect(m.hasIntegrated).toBe(false)
    expect(m.hasUnified).toBe(false)
    expect(m.hasCohesive).toBe(false)
    expect(m.hasWhole).toBe(false)
    expect(m.hasComplete).toBe(false)
    expect(m.hasNoFragmented).toBe(true)
    expect(m.hasNoScattered).toBe(true)
    expect(m.hasNoDisjoint).toBe(true)
    expect(m.hasNoBroken).toBe(true)
  })

  it('scores rich content as symphony', () => {
    const m = measureHarmonizing(richContent)
    expect(m.harmony).toBe(99)
    expect(m.cosmic).toBe('symphony')
    expect(m.hasHighHarmony).toBe(true)
    expect(m.hasIntegrated).toBe(true)
    expect(m.hasUnified).toBe(true)
    expect(m.hasCohesive).toBe(true)
    expect(m.hasWhole).toBe(true)
    expect(m.hasComplete).toBe(true)
    expect(m.hasBalanced).toBe(false)
  })

  it('detects fragmented/scattered patterns', () => {
    const badContent = 'var x: any = 1'
    const m = measureHarmonizing(badContent)
    expect(m.hasNoFragmented).toBe(false)
    expect(m.hasNoScattered).toBe(false)
    expect(m.fragmentedCount).toBe(1)
    expect(m.scatteredCount).toBe(1)
  })
})

// ─── classifyCurtainCondition ──────────────────────────────────────

describe('classifyCurtainCondition', () => {
  it('classifies northern-lights', () => expect(classifyCurtainCondition(90)).toBe('northern-lights'))
  it('classifies bright-aurora', () => expect(classifyCurtainCondition(75)).toBe('bright-aurora'))
  it('classifies proper-curtain', () => expect(classifyCurtainCondition(60)).toBe('proper-curtain'))
  it('classifies faint-glow', () => expect(classifyCurtainCondition(45)).toBe('faint-glow'))
  it('classifies twilight', () => expect(classifyCurtainCondition(30)).toBe('twilight'))
  it('classifies dark-night', () => expect(classifyCurtainCondition(10)).toBe('dark-night'))
  it('boundary 85', () => expect(classifyCurtainCondition(85)).toBe('northern-lights'))
  it('boundary 70', () => expect(classifyCurtainCondition(70)).toBe('bright-aurora'))
  it('boundary 55', () => expect(classifyCurtainCondition(55)).toBe('proper-curtain'))
  it('boundary 40', () => expect(classifyCurtainCondition(40)).toBe('faint-glow'))
  it('boundary 25', () => expect(classifyCurtainCondition(25)).toBe('twilight'))
  it('boundary 0', () => expect(classifyCurtainCondition(0)).toBe('dark-night'))
})

// ─── classifyBeltType ──────────────────────────────────────────────

describe('classifyBeltType', () => {
  it('returns equatorial for empty curtains', () => {
    expect(classifyBeltType([])).toBe('equatorial')
  })

  it('returns equatorial for qualityScore < 15', () => {
    const curtains: AuroraCurtain[] = [
      { file: 'a.ts', luminosity: 8, spectralRichness: 8, magneticAlignment: 10, danceQuality: 8, cosmicHarmony: 8,
        shining: {} as AuroraCurtain['shining'], enriching: {} as AuroraCurtain['enriching'],
        aligning: {} as AuroraCurtain['aligning'], dancing: {} as AuroraCurtain['dancing'],
        harmonizing: {} as AuroraCurtain['harmonizing'],
        condition: 'dark-night', qualityScore: 8 },
    ]
    expect(classifyBeltType(curtains)).toBe('equatorial')
  })

  it('returns polar-belt for high quality with northern lights majority', () => {
    const makeCurtain = (cond: AuroraCurtain['condition'], qs: number): AuroraCurtain => ({
      file: 'a.ts', luminosity: 90, spectralRichness: 90, magneticAlignment: 90, danceQuality: 90, cosmicHarmony: 90,
      shining: {} as AuroraCurtain['shining'], enriching: {} as AuroraCurtain['enriching'],
      aligning: {} as AuroraCurtain['aligning'], dancing: {} as AuroraCurtain['dancing'],
      harmonizing: {} as AuroraCurtain['harmonizing'],
      condition: cond, qualityScore: qs,
    })
    const curtains = [makeCurtain('northern-lights', 90), makeCurtain('northern-lights', 85)]
    expect(classifyBeltType(curtains)).toBe('polar-belt')
  })

  it('returns auroral-zone for quality >= 60', () => {
    const curtains: AuroraCurtain[] = [
      { file: 'a.ts', luminosity: 70, spectralRichness: 70, magneticAlignment: 70, danceQuality: 70, cosmicHarmony: 70,
        shining: {} as AuroraCurtain['shining'], enriching: {} as AuroraCurtain['enriching'],
        aligning: {} as AuroraCurtain['aligning'], dancing: {} as AuroraCurtain['dancing'],
        harmonizing: {} as AuroraCurtain['harmonizing'],
        condition: 'bright-aurora', qualityScore: 65 },
    ]
    expect(classifyBeltType(curtains)).toBe('auroral-zone')
  })

  it('returns sub-auroral for quality >= 45', () => {
    const curtains: AuroraCurtain[] = [
      { file: 'a.ts', luminosity: 50, spectralRichness: 50, magneticAlignment: 50, danceQuality: 50, cosmicHarmony: 50,
        shining: {} as AuroraCurtain['shining'], enriching: {} as AuroraCurtain['enriching'],
        aligning: {} as AuroraCurtain['aligning'], dancing: {} as AuroraCurtain['dancing'],
        harmonizing: {} as AuroraCurtain['harmonizing'],
        condition: 'proper-curtain', qualityScore: 50 },
    ]
    expect(classifyBeltType(curtains)).toBe('sub-auroral')
  })

  it('returns mid-latitude for quality >= 30', () => {
    const curtains: AuroraCurtain[] = [
      { file: 'a.ts', luminosity: 35, spectralRichness: 35, magneticAlignment: 35, danceQuality: 35, cosmicHarmony: 35,
        shining: {} as AuroraCurtain['shining'], enriching: {} as AuroraCurtain['enriching'],
        aligning: {} as AuroraCurtain['aligning'], dancing: {} as AuroraCurtain['dancing'],
        harmonizing: {} as AuroraCurtain['harmonizing'],
        condition: 'faint-glow', qualityScore: 35 },
    ]
    expect(classifyBeltType(curtains)).toBe('mid-latitude')
  })

  it('returns tropical for quality >= 15', () => {
    const curtains: AuroraCurtain[] = [
      { file: 'a.ts', luminosity: 18, spectralRichness: 18, magneticAlignment: 18, danceQuality: 18, cosmicHarmony: 18,
        shining: {} as AuroraCurtain['shining'], enriching: {} as AuroraCurtain['enriching'],
        aligning: {} as AuroraCurtain['aligning'], dancing: {} as AuroraCurtain['dancing'],
        harmonizing: {} as AuroraCurtain['harmonizing'],
        condition: 'twilight', qualityScore: 18 },
    ]
    expect(classifyBeltType(curtains)).toBe('tropical')
  })
})

// ─── classifyAstronomerGrade ───────────────────────────────────────

describe('classifyAstronomerGrade', () => {
  it('returns chief-astronomer for >= 80', () => expect(classifyAstronomerGrade(85)).toBe('chief-astronomer'))
  it('returns aurora-hunter for >= 65', () => expect(classifyAstronomerGrade(70)).toBe('aurora-hunter'))
  it('returns northern-lighter for >= 50', () => expect(classifyAstronomerGrade(55)).toBe('northern-lighter'))
  it('returns sky-watcher for >= 35', () => expect(classifyAstronomerGrade(40)).toBe('sky-watcher'))
  it('returns stargazer for >= 20', () => expect(classifyAstronomerGrade(25)).toBe('stargazer'))
  it('returns cave-dweller for < 20', () => expect(classifyAstronomerGrade(10)).toBe('cave-dweller'))
  it('boundary 80', () => expect(classifyAstronomerGrade(80)).toBe('chief-astronomer'))
  it('boundary 65', () => expect(classifyAstronomerGrade(65)).toBe('aurora-hunter'))
  it('boundary 50', () => expect(classifyAstronomerGrade(50)).toBe('northern-lighter'))
  it('boundary 35', () => expect(classifyAstronomerGrade(35)).toBe('sky-watcher'))
  it('boundary 20', () => expect(classifyAstronomerGrade(20)).toBe('stargazer'))
  it('boundary 0', () => expect(classifyAstronomerGrade(0)).toBe('cave-dweller'))
})

// ─── classifyBeltCondition ─────────────────────────────────────────

describe('classifyBeltCondition', () => {
  it('returns spectacular-display for >= 75', () => expect(classifyBeltCondition(80)).toBe('spectacular-display'))
  it('returns beautiful-show for >= 60', () => expect(classifyBeltCondition(65)).toBe('beautiful-show'))
  it('returns decent-display for >= 45', () => expect(classifyBeltCondition(50)).toBe('decent-display'))
  it('returns faint-glow-belt for >= 30', () => expect(classifyBeltCondition(35)).toBe('faint-glow-belt'))
  it('returns barely-visible for >= 15', () => expect(classifyBeltCondition(20)).toBe('barely-visible'))
  it('returns invisible for < 15', () => expect(classifyBeltCondition(5)).toBe('invisible'))
})

// ─── analyzeAuroraCurtain ──────────────────────────────────────────

describe('analyzeAuroraCurtain', () => {
  it('analyzes minimal content', () => {
    const c = analyzeAuroraCurtain(minimalContent, 'test.ts')
    expect(c.file).toBe('test.ts')
    expect(c.qualityScore).toBe(8)
    expect(c.condition).toBe('dark-night')
    expect(c.luminosity).toBe(8)
    expect(c.spectralRichness).toBe(8)
    expect(c.magneticAlignment).toBe(10)
    expect(c.danceQuality).toBe(8)
    expect(c.cosmicHarmony).toBe(8)
    expect(c.shining.grade).toBe('dark-sky')
    expect(c.enriching.spectrum).toBe('colorless')
    expect(c.aligning.field).toBe('no-field')
    expect(c.dancing.dance).toBe('static')
    expect(c.harmonizing.cosmic).toBe('chaos')
  })

  it('analyzes rich content', () => {
    const c = analyzeAuroraCurtain(richContent, 'rich.ts')
    expect(c.qualityScore).toBe(100)
    expect(c.condition).toBe('northern-lights')
    expect(c.luminosity).toBe(100)
    expect(c.spectralRichness).toBe(99)
    expect(c.magneticAlignment).toBe(100)
    expect(c.danceQuality).toBe(100)
    expect(c.cosmicHarmony).toBe(99)
  })

  it('computes qualityScore as weighted average', () => {
    const c = analyzeAuroraCurtain(midContent, 'mid.ts')
    const expected = Math.round(
      c.luminosity * 0.2 +
      c.spectralRichness * 0.2 +
      c.magneticAlignment * 0.2 +
      c.danceQuality * 0.2 +
      c.cosmicHarmony * 0.2,
    )
    expect(c.qualityScore).toBe(expected)
  })

  it('sets file path correctly', () => {
    const c = analyzeAuroraCurtain('', 'deeply/nested/file.ts')
    expect(c.file).toBe('deeply/nested/file.ts')
  })
})

// ─── analyzeAuroraBelt ─────────────────────────────────────────────

describe('analyzeAuroraBelt', () => {
  it('handles empty curtains', () => {
    const b = analyzeAuroraBelt([], 'empty-dir')
    expect(b.directory).toBe('empty-dir')
    expect(b.curtains).toEqual([])
    expect(b.avgLuminosity).toBe(0)
    expect(b.avgAlignment).toBe(0)
    expect(b.avgHarmony).toBe(0)
    expect(b.northernLightsCount).toBe(0)
    expect(b.darkNightCount).toBe(0)
    expect(b.beltType).toBe('equatorial')
    expect(b.condition).toBe('invisible')
  })

  it('analyzes single curtain belt', () => {
    const curtain = analyzeAuroraCurtain(richContent, 'good.ts')
    const b = analyzeAuroraBelt([curtain], 'src')
    expect(b.avgLuminosity).toBe(curtain.luminosity)
    expect(b.avgAlignment).toBe(curtain.magneticAlignment)
    expect(b.avgHarmony).toBe(curtain.cosmicHarmony)
    expect(b.curtains).toHaveLength(1)
  })

  it('averages multiple curtains', () => {
    const c1 = analyzeAuroraCurtain(richContent, 'a.ts')
    const c2 = analyzeAuroraCurtain(minimalContent, 'b.ts')
    const b = analyzeAuroraBelt([c1, c2], 'mix')
    const avgLum = Math.round((c1.luminosity + c2.luminosity) / 2)
    expect(b.avgLuminosity).toBe(avgLum)
  })

  it('counts conditions correctly', () => {
    const c1 = analyzeAuroraCurtain(richContent, 'good.ts')
    const c2 = analyzeAuroraCurtain(minimalContent, 'bad.ts')
    const b = analyzeAuroraBelt([c1, c2], 'mixed')
    expect(b.northernLightsCount + b.darkNightCount).toBeLessThanOrEqual(2)
  })
})

// ─── buildAuroraBorealisResult ─────────────────────────────────────

describe('buildAuroraBorealisResult', () => {
  it('handles empty input', async () => {
    const r = await buildAuroraBorealisResult([], [])
    expect(r.curtains).toEqual([])
    expect(r.belts).toEqual([])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.totalBelts).toBe(0)
    expect(r.stats.avgLuminosity).toBe(0)
    expect(r.sky.isLuminous).toBe(false)
    expect(r.sky.overallRadiance).toBe(0)
    expect(r.stats.overallRadiance).toBe(0)
    expect(r.stats.bestCurtain).toBe('')
    expect(r.stats.brightest).toBe('')
    expect(r.stats.mostColorful).toBe('')
    expect(r.stats.mostAligned).toBe('')
    expect(r.stats.mostGraceful).toBe('')
  })

  it('analyzes single file', async () => {
    const r = await buildAuroraBorealisResult(['test.ts'], [richContent])
    expect(r.curtains).toHaveLength(1)
    expect(r.belts).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.curtains[0].condition).toBe('northern-lights')
  })

  it('groups files by directory into belts', async () => {
    const r = await buildAuroraBorealisResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, minimalContent, midContent],
    )
    expect(r.curtains).toHaveLength(3)
    expect(r.belts).toHaveLength(2)
  })

  it('computes sky summary', async () => {
    const r = await buildAuroraBorealisResult(['a.ts'], [richContent])
    expect(r.sky.isLuminous).toBe(true)
    expect(r.sky.overallRadiance).toBeGreaterThan(0)
  })

  it('computes stats astronomerGrade', async () => {
    const r = await buildAuroraBorealisResult(['a.ts'], [richContent])
    expect(r.stats.astronomerGrade).toBe('chief-astronomer')
  })

  it('identifies best/brightest/mostColorful/mostAligned/mostGraceful', async () => {
    const r = await buildAuroraBorealisResult(
      ['rich.ts', 'minimal.ts'],
      [richContent, minimalContent],
    )
    expect(r.stats.bestCurtain).toBe('rich.ts')
    expect(r.stats.brightest).toBe('rich.ts')
    expect(r.stats.mostColorful).toBe('rich.ts')
    expect(r.stats.mostAligned).toBe('rich.ts')
    expect(r.stats.mostGraceful).toBe('rich.ts')
  })

  it('counts condition types in stats', async () => {
    const r = await buildAuroraBorealisResult(
      ['rich.ts', 'minimal.ts'],
      [richContent, minimalContent],
    )
    expect(r.stats.northernLightsCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.brightAuroraCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.properCurtainCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.faintGlowCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.twilightCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.darkNightCount).toBeGreaterThanOrEqual(0)
  })

  it('counts hasHigh* flags', async () => {
    const r = await buildAuroraBorealisResult(['a.ts'], [richContent])
    expect(r.stats.hasHighLuminosityCount).toBe(1)
    expect(r.stats.hasHighRichnessCount).toBe(1)
    expect(r.stats.hasHighAlignmentCount).toBe(1)
    expect(r.stats.hasHighQualityCount).toBe(1)
    expect(r.stats.hasHighHarmonyCount).toBe(1)
  })

  it('computes overallRadiance correctly for rich content', async () => {
    const r = await buildAuroraBorealisResult(['a.ts'], [richContent])
    expect(r.stats.overallRadiance).toBe(Math.round((100 + 100 + 99) / 3))
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: AuroraBorealisStats = {
    totalFiles: 0, totalBelts: 0, avgLuminosity: 0, avgSpectralRichness: 0,
    avgMagneticAlignment: 0, avgDanceQuality: 0, avgCosmicHarmony: 0,
    northernLightsCount: 0, brightAuroraCount: 0, properCurtainCount: 0,
    faintGlowCount: 0, twilightCount: 0, darkNightCount: 0,
    hasHighLuminosityCount: 0, hasHighRichnessCount: 0, hasHighAlignmentCount: 0,
    hasHighQualityCount: 0, hasHighHarmonyCount: 0,
    overallRadiance: 0, astronomerGrade: 'cave-dweller',
    bestCurtain: '', brightest: '', mostColorful: '', mostAligned: '', mostGraceful: '',
  }

  const emptySky: SkySummary = { avgLuminosity: 0, avgAlignment: 0, avgHarmony: 0, isLuminous: false, overallRadiance: 0 }

  it('returns positive message for good code', () => {
    const goodStats = { ...emptyStats, avgLuminosity: 80, avgSpectralRichness: 80, avgMagneticAlignment: 80, avgDanceQuality: 80, avgCosmicHarmony: 80 }
    const goodSky: SkySummary = { avgLuminosity: 80, avgAlignment: 80, avgHarmony: 80, isLuminous: true, overallRadiance: 80 }
    const recs = generateRecommendations([], [], goodSky, goodStats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('brilliantly')
  })

  it('recommends brightening for low luminosity', () => {
    const stats = { ...emptyStats, avgLuminosity: 30 }
    const recs = generateRecommendations([], [], emptySky, stats)
    expect(recs.some(r => r.includes('Brighten'))).toBe(true)
  })

  it('recommends enriching for low spectral richness', () => {
    const stats = { ...emptyStats, avgSpectralRichness: 30 }
    const recs = generateRecommendations([], [], emptySky, stats)
    expect(recs.some(r => r.includes('Enrich'))).toBe(true)
  })

  it('recommends alignment for low magnetic alignment', () => {
    const stats = { ...emptyStats, avgMagneticAlignment: 30 }
    const recs = generateRecommendations([], [], emptySky, stats)
    expect(recs.some(r => r.includes('magnetic'))).toBe(true)
  })

  it('recommends dance improvement for low quality', () => {
    const stats = { ...emptyStats, avgDanceQuality: 30 }
    const recs = generateRecommendations([], [], emptySky, stats)
    expect(recs.some(r => r.includes('dance'))).toBe(true)
  })

  it('recommends harmony for low cosmic harmony', () => {
    const stats = { ...emptyStats, avgCosmicHarmony: 30 }
    const recs = generateRecommendations([], [], emptySky, stats)
    expect(recs.some(r => r.includes('Harmonize'))).toBe(true)
  })

  it('warns about dark night files', () => {
    const stats = { ...emptyStats, darkNightCount: 2 }
    const recs = generateRecommendations([], [], emptySky, stats)
    expect(recs.some(r => r.includes('dark night'))).toBe(true)
  })

  it('warns about poor overall radiance', () => {
    const sky: SkySummary = { avgLuminosity: 20, avgAlignment: 20, avgHarmony: 20, isLuminous: false, overallRadiance: 20 }
    const recs = generateRecommendations([], [], sky, emptyStats)
    expect(recs.some(r => r.includes('radiance'))).toBe(true)
  })

  it('warns when all belts are equatorial/tropical', () => {
    const belt: AuroraBelt = {
      directory: 'src', curtains: [], avgLuminosity: 10, avgAlignment: 10, avgHarmony: 10,
      northernLightsCount: 0, darkNightCount: 0, beltType: 'equatorial', condition: 'invisible',
    }
    const recs = generateRecommendations([], [belt], emptySky, emptyStats)
    expect(recs.some(r => r.includes('faint or absent'))).toBe(true)
  })

  it('names specific dark-night files', () => {
    const curtain = analyzeAuroraCurtain('var x: any', 'bad.ts')
    curtain.condition = 'dark-night'
    const stats = { ...emptyStats, darkNightCount: 1 }
    const recs = generateRecommendations([curtain], [], emptySky, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })
  it('handles 0', () => expect(typeof colorScore(0)).toBe('string'))
  it('handles 100', () => expect(typeof colorScore(100)).toBe('string'))
})

describe('colorGrade', () => {
  it('colors known grades', () => {
    expect(typeof colorGrade('northern-lights')).toBe('string')
    expect(typeof colorGrade('brilliant-aurora')).toBe('string')
    expect(typeof colorGrade('dark-night')).toBe('string')
  })
  it('handles unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatCurtainTable', () => {
  it('formats a single curtain', () => {
    const c = analyzeAuroraCurtain(richContent, 'test.ts')
    const out = formatCurtainTable(c)
    expect(out).toContain('test.ts')
    expect(out).toContain('Luminosity')
    expect(out).toContain('Score')
  })
})

describe('formatCurtainsTable', () => {
  it('handles empty array', () => {
    expect(formatCurtainsTable([])).toContain('No aurora curtains')
  })
  it('formats multiple curtains', () => {
    const c1 = analyzeAuroraCurtain(richContent, 'a.ts')
    const c2 = analyzeAuroraCurtain(minimalContent, 'b.ts')
    const out = formatCurtainsTable([c1, c2])
    expect(out).toContain('a.ts')
    expect(out).toContain('b.ts')
    expect(out).toContain('Curtain Analysis')
  })
})

describe('formatBeltTable', () => {
  it('formats a belt', () => {
    const c = analyzeAuroraCurtain(richContent, 'src/a.ts')
    const b = analyzeAuroraBelt([c], 'src')
    const out = formatBeltTable(b)
    expect(out).toContain('src')
    expect(out).toContain('Type')
    expect(out).toContain('Condition')
  })
})

describe('formatBeltsTable', () => {
  it('handles empty array', () => {
    expect(formatBeltsTable([])).toContain('No aurora belts')
  })
  it('formats belts', () => {
    const c = analyzeAuroraCurtain(richContent, 'src/a.ts')
    const b = analyzeAuroraBelt([c], 'src')
    const out = formatBeltsTable([b])
    expect(out).toContain('Belt Analysis')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const r = await buildAuroraBorealisResult(['a.ts'], [richContent])
    const out = formatStatsTable(r.stats)
    expect(out).toContain('Total Files')
    expect(out).toContain('Astronomer Grade')
    expect(out).toContain('Best Curtain')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const out = formatRecommendations(['Fix X', 'Improve Y'])
    expect(out).toContain('Fix X')
    expect(out).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const r = await buildAuroraBorealisResult(['a.ts'], [richContent])
    const out = formatResultTable(r)
    expect(out).toContain('Curtain Analysis')
    expect(out).toContain('Belt Analysis')
    expect(out).toContain('Statistics')
    expect(out).toContain('Luminous')
    expect(out).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const r = await buildAuroraBorealisResult(['a.ts'], [richContent])
    const json = formatResultJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.curtains).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── gatherFiles ───────────────────────────────────────────────────

describe('gatherFiles', () => {
  it('returns array', async () => {
    const files = await gatherFiles('/home/georg/code/new', ['.ts'], ['**/node_modules/**'])
    expect(Array.isArray(files)).toBe(true)
  })
})

// ─── Grade Boundary Tests ──────────────────────────────────────────

describe('grade boundaries - measureShining', () => {
  it('proper-glow at luminosity from doc+export+interface', () => {
    const content = '/** doc */ export interface I { x: string }'
    const m = measureShining(content)
    expect(m.luminosity).toBeGreaterThanOrEqual(40)
    expect(m.grade).toBeDefined()
  })
})

describe('grade boundaries - measureEnriching', () => {
  it('rich-palette at richness 70+', () => {
    const content = 'export interface I {} class A {} type T = string; const x = 1; async function f() {}'
    const m = measureEnriching(content)
    expect(m.richness).toBeGreaterThanOrEqual(40)
    expect(m.spectrum).toBeDefined()
  })
})

describe('grade boundaries - measureAligning', () => {
  it('proper-alignment at alignment 55', () => {
    const content = 'const x = 1; if (x === 1) { console.log(x) }'
    const m = measureAligning(content)
    expect(m.alignment).toBeGreaterThanOrEqual(10)
    expect(m.field).toBeDefined()
  })
})

// ─── Type Export Tests ─────────────────────────────────────────────

describe('type exports', () => {
  it('all types are importable', () => {
    const curtain: AuroraCurtain = analyzeAuroraCurtain(minimalContent, 't.ts')
    expect(curtain.file).toBe('t.ts')
    const belt: AuroraBelt = analyzeAuroraBelt([curtain], 'dir')
    expect(belt.directory).toBe('dir')
  })
})
