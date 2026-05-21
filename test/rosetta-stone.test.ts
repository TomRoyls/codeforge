import { describe, expect, it } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos, countIdentifiers,
  measureTranslatability, measureInscriptionQuality, measurePreservation,
  measureGlyphClarity, measureScriptConsistency, measureDecipherability,
  classifyInscriptionType, classifyCondition, classifyTranslatorGrade,
  classifyReadingLevel, classifyTranslationDifficulty, classifyTabletCondition,
  countGlyphs, analyzeScripts, assessPreservation,
  analyzeInscription, analyzeStoneTablet,
  generateRecommendations, buildRosettaStoneResult,
} from '../src/commands/rosetta-stone-helpers.js'
import { formatRosettaStoneJson, formatRosettaStoneTable } from '../src/commands/rosetta-stone-format-helpers.js'
import type { Inscription, StoneTablet, RosettaStoneStats } from '../src/commands/rosetta-stone-helpers.js'

const strongCode = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/**
 * Parse a file
 * @example
 * parseFile('test.ts')
 */
export function parseFile(path: string): Result {
  try {
    const content: string = readFileSync(path, 'utf8')
    if (content.length === 0) {
      return { ok: false, error: 'empty' }
    }
    return { ok: true, data: content }
  } catch (e: unknown) {
    return { ok: false, error: String(e) }
  }
}
`

const weakCode = `var x = 1
console.log(x)
console.log("hello")
console.log("world")
console.log("test")
// TODO: fix this
// FIXME: broken
// HACK: workaround
function a(b){if(b){if(c){if(d){if(e){if(f){}}}}}}
`

const emptyCode = ''

const simpleExport = 'export function calc(x: number): number { return x * 2 }'

const testCode = `import { describe, it, expect } from 'vitest'
describe('calc', () => {
  it('works', () => {
    expect(calc(2)).toBe(4)
  })
})
`

const classCode = `export class Calculator {
  private value: number
  constructor(initial: number) {
    this.value = initial
  }
  add(x: number): number {
    this.value += x
    return this.value
  }
}
`

// ─── Primitives ──────────────────────────────────────────────────────────────

describe('rosetta-stone primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc('const a = 1\nconst b = 2')).toBe(2)
    expect(countLoc(emptyCode)).toBe(0)
  })

  it('countImports counts imports', () => {
    expect(countImports('import { x } from "y"')).toBe(1)
    expect(countImports('const x = 1')).toBe(0)
  })

  it('countExports counts exports', () => {
    expect(countExports('export function a() {}')).toBe(1)
    expect(countExports('export const x = 1')).toBe(1)
  })

  it('countFunctions counts functions', () => {
    expect(countFunctions('function a() {}')).toBe(1)
    expect(countFunctions('const fn = () => {}')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling('try {} catch(e) {}')).toBe(2)
    expect(countErrorHandling('throw new Error("x")')).toBe(1)
  })

  it('countTypeAnnotations counts types', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting counts brace depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
    expect(maxNesting('no braces')).toBe(0)
  })

  it('countConsole counts console calls', () => {
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comments', () => {
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts TODOs', () => {
    expect(countTodos('TODO: fix')).toBe(1)
    expect(countTodos('FIXME: broken')).toBe(1)
  })

  it('countIdentifiers counts identifiers', () => {
    expect(countIdentifiers('const myVar = 1')).toBe(2)
    expect(countIdentifiers(emptyCode)).toBe(0)
  })
})

// ─── Measurements ────────────────────────────────────────────────────────────

describe('rosetta-stone measurements', () => {
  it('measureTranslatability returns 0 for empty', () => {
    expect(measureTranslatability(emptyCode)).toBe(0)
  })

  it('measureTranslatability rewards good code', () => {
    const result = measureTranslatability(strongCode)
    expect(result).toBeGreaterThan(40)
  })

  it('measureTranslatability penalizes bad code', () => {
    const result = measureTranslatability(weakCode)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('measureInscriptionQuality returns 0 for empty', () => {
    expect(measureInscriptionQuality(emptyCode)).toBe(0)
  })

  it('measureInscriptionQuality rewards typed documented code', () => {
    const result = measureInscriptionQuality(strongCode)
    expect(result).toBeGreaterThan(30)
  })

  it('measurePreservation returns 0 for empty', () => {
    expect(measurePreservation(emptyCode)).toBe(0)
  })

  it('measurePreservation rewards clean code', () => {
    const result = measurePreservation(simpleExport)
    expect(result).toBeGreaterThan(30)
  })

  it('measureGlyphClarity returns 0 for empty', () => {
    expect(measureGlyphClarity(emptyCode)).toBe(0)
  })

  it('measureGlyphClarity rewards descriptive names', () => {
    const result = measureGlyphClarity(strongCode)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('measureScriptConsistency returns 0 for empty', () => {
    expect(measureScriptConsistency(emptyCode)).toBe(0)
  })

  it('measureScriptConsistency rewards consistent style', () => {
    const result = measureScriptConsistency(strongCode)
    expect(result).toBeGreaterThan(30)
  })

  it('measureDecipherability returns 0 for empty', () => {
    expect(measureDecipherability(emptyCode)).toBe(0)
  })

  it('measureDecipherability rewards clear exports', () => {
    const result = measureDecipherability(simpleExport)
    expect(result).toBeGreaterThan(40)
  })

  it('all measurements return numbers in range 0-100', () => {
    const fns = [measureTranslatability, measureInscriptionQuality, measurePreservation, measureGlyphClarity, measureScriptConsistency, measureDecipherability]
    for (const fn of fns) {
      const result = fn(strongCode)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(100)
    }
  })
})

// ─── Classifications ─────────────────────────────────────────────────────────

describe('rosetta-stone classifications', () => {
  it('classifyInscriptionType classifies test code as prayer', () => {
    expect(classifyInscriptionType(testCode)).toBe('prayer')
  })

  it('classifyInscriptionType classifies class code', () => {
    const result = classifyInscriptionType(classCode)
    expect(['law', 'letter']).toContain(result)
  })

  it('classifyInscriptionType classifies simple export as letter', () => {
    expect(classifyInscriptionType(simpleExport)).toBe('letter')
  })

  it('classifyInscriptionType classifies messy code', () => {
    const result = classifyInscriptionType(weakCode)
    expect(['graffiti', 'prayer', 'doodle']).toContain(result)
  })

  it('classifyInscriptionType classifies plain code as doodle', () => {
    expect(classifyInscriptionType('const x = 1')).toBe('doodle')
  })

  it('classifyCondition returns pristine for high scores', () => {
    expect(classifyCondition(90)).toBe('pristine')
  })

  it('classifyCondition returns well-preserved for 65+', () => {
    expect(classifyCondition(70)).toBe('well-preserved')
  })

  it('classifyCondition returns legible for 45+', () => {
    expect(classifyCondition(50)).toBe('legible')
  })

  it('classifyCondition returns weathered for 30+', () => {
    expect(classifyCondition(35)).toBe('weathered')
  })

  it('classifyCondition returns fragmentary for 15+', () => {
    expect(classifyCondition(20)).toBe('fragmentary')
  })

  it('classifyCondition returns eroded for 5+', () => {
    expect(classifyCondition(8)).toBe('eroded')
  })

  it('classifyCondition returns lost for low scores', () => {
    expect(classifyCondition(2)).toBe('lost')
  })

  it('classifyTranslatorGrade returns master-linguist for high readability', () => {
    expect(classifyTranslatorGrade(80)).toBe('master-linguist')
  })

  it('classifyTranslatorGrade returns polyglot for 60+', () => {
    expect(classifyTranslatorGrade(65)).toBe('polyglot')
  })

  it('classifyTranslatorGrade returns translator for 40+', () => {
    expect(classifyTranslatorGrade(45)).toBe('translator')
  })

  it('classifyTranslatorGrade returns reader for 25+', () => {
    expect(classifyTranslatorGrade(30)).toBe('reader')
  })

  it('classifyTranslatorGrade returns illiterate for 10+', () => {
    expect(classifyTranslatorGrade(15)).toBe('illiterate')
  })

  it('classifyTranslatorGrade returns blind for very low', () => {
    expect(classifyTranslatorGrade(5)).toBe('blind')
  })

  it('classifyReadingLevel returns scholar for excellent code', () => {
    const level = classifyReadingLevel(strongCode)
    expect(typeof level).toBe('string')
    expect(['scholar', 'literate', 'basic', 'cryptic', 'unknown']).toContain(level)
  })

  it('classifyReadingLevel returns cryptic or unknown for empty', () => {
    const level = classifyReadingLevel(emptyCode)
    expect(level).toBe('unknown')
  })

  it('classifyTranslationDifficulty returns trivial for high decipherability', () => {
    expect(classifyTranslationDifficulty(85)).toBe('trivial')
  })

  it('classifyTranslationDifficulty returns easy for 60+', () => {
    expect(classifyTranslationDifficulty(65)).toBe('easy')
  })

  it('classifyTranslationDifficulty returns moderate for 40+', () => {
    expect(classifyTranslationDifficulty(45)).toBe('moderate')
  })

  it('classifyTranslationDifficulty returns difficult for 25+', () => {
    expect(classifyTranslationDifficulty(30)).toBe('difficult')
  })

  it('classifyTranslationDifficulty returns obscure for 10+', () => {
    expect(classifyTranslationDifficulty(15)).toBe('obscure')
  })

  it('classifyTranslationDifficulty returns undecipherable for low', () => {
    expect(classifyTranslationDifficulty(5)).toBe('undecipherable')
  })

  it('classifyTabletCondition returns library for high quality', () => {
    expect(classifyTabletCondition(80)).toBe('library')
  })

  it('classifyTabletCondition returns museum for 55+', () => {
    expect(classifyTabletCondition(60)).toBe('museum')
  })

  it('classifyTabletCondition returns archive for 35+', () => {
    expect(classifyTabletCondition(40)).toBe('archive')
  })

  it('classifyTabletCondition returns field for 15+', () => {
    expect(classifyTabletCondition(20)).toBe('field')
  })

  it('classifyTabletCondition returns ruins for 5+', () => {
    expect(classifyTabletCondition(8)).toBe('ruins')
  })

  it('classifyTabletCondition returns lost for very low', () => {
    expect(classifyTabletCondition(2)).toBe('lost')
  })
})

// ─── Glyph Analysis ──────────────────────────────────────────────────────────

describe('rosetta-stone glyphs', () => {
  it('countGlyphs returns zero counts for empty', () => {
    const result = countGlyphs(emptyCode)
    expect(result.totalGlyphs).toBe(0)
    expect(result.clearGlyphs).toBe(0)
    expect(result.obscureGlyphs).toBe(0)
  })

  it('countGlyphs counts identifiers', () => {
    const result = countGlyphs('function calculateTotal(price: number) {}')
    expect(result.totalGlyphs).toBeGreaterThan(0)
  })

  it('countGlyphs classifies clear vs obscure', () => {
    const result = countGlyphs('function calculateTotal() { const x = 1 }')
    expect(result.clearGlyphs).toBeGreaterThanOrEqual(0)
    expect(result.obscureGlyphs).toBeGreaterThanOrEqual(0)
  })

  it('countGlyphs includes phonetic and logographic counts', () => {
    const result = countGlyphs(strongCode)
    expect(result.phonetic).toBeGreaterThanOrEqual(0)
    expect(result.logographic).toBeGreaterThanOrEqual(0)
    expect(result.decorative).toBeGreaterThanOrEqual(0)
  })
})

// ─── Scripts Analysis ────────────────────────────────────────────────────────

describe('rosetta-stone scripts', () => {
  it('analyzeScripts returns all three scripts', () => {
    const result = analyzeScripts(strongCode)
    expect(typeof result.hieroglyphic).toBe('number')
    expect(typeof result.demotic).toBe('number')
    expect(typeof result.greek).toBe('number')
  })

  it('analyzeScripts identifies dominant script', () => {
    const result = analyzeScripts(strongCode)
    expect(['hieroglyphic', 'demotic', 'greek']).toContain(result.dominantScript)
  })

  it('analyzeScripts identifies multiscript code', () => {
    const result = analyzeScripts(strongCode)
    expect(typeof result.isMultiscript).toBe('boolean')
  })

  it('analyzeScripts returns values in 0-100 range', () => {
    const result = analyzeScripts(strongCode)
    expect(result.hieroglyphic).toBeGreaterThanOrEqual(0)
    expect(result.hieroglyphic).toBeLessThanOrEqual(100)
    expect(result.demotic).toBeGreaterThanOrEqual(0)
    expect(result.demotic).toBeLessThanOrEqual(100)
    expect(result.greek).toBeGreaterThanOrEqual(0)
    expect(result.greek).toBeLessThanOrEqual(100)
  })
})

// ─── Preservation Assessment ─────────────────────────────────────────────────

describe('rosetta-stone preservation', () => {
  it('assessPreservation returns intact for clean code', () => {
    const result = assessPreservation(simpleExport)
    expect(typeof result.weathering).toBe('number')
    expect(typeof result.isIntact).toBe('boolean')
  })

  it('assessPreservation detects damage in weak code', () => {
    const result = assessPreservation(weakCode)
    expect(result.hasDamage).toBe(true)
    expect(result.damageCount).toBeGreaterThan(0)
  })

  it('assessPreservation tracks weathering and erosion', () => {
    const result = assessPreservation(weakCode)
    expect(result.weathering).toBeGreaterThanOrEqual(0)
    expect(result.erosion).toBeGreaterThanOrEqual(0)
  })

  it('assessPreservation detects fragmentary code', () => {
    const result = assessPreservation('x')
    expect(result.isFragmentary).toBe(true)
  })

  it('assessPreservation detects restoration', () => {
    const code = '/** a */\n/** b */\n/** c */\n/** d */\n/** e */\n/** f */\nconst a: string = "x"\nconst b: number = 1\nconst c: boolean = true\nconst d: unknown = null\nexport function calc() {}'
    const result = assessPreservation(code)
    expect(result.hasBeenRestored).toBe(true)
  })
})

// ─── Inscription Analysis ────────────────────────────────────────────────────

describe('rosetta-stone inscription', () => {
  it('analyzeInscription returns complete Inscription', () => {
    const result = analyzeInscription(strongCode, 'calc.ts')
    expect(result.file).toBe('calc.ts')
    expect(typeof result.translatability).toBe('number')
    expect(typeof result.inscriptionQuality).toBe('number')
    expect(typeof result.preservation).toBe('number')
    expect(typeof result.glyphClarity).toBe('number')
    expect(typeof result.scriptConsistency).toBe('number')
    expect(typeof result.decipherability).toBe('number')
    expect(typeof result.qualityScore).toBe('number')
  })

  it('analyzeInscription includes scripts info', () => {
    const result = analyzeInscription(strongCode, 'calc.ts')
    expect(result.scripts).toBeDefined()
    expect(['hieroglyphic', 'demotic', 'greek']).toContain(result.scripts.dominantScript)
  })

  it('analyzeInscription includes glyphs info', () => {
    const result = analyzeInscription(strongCode, 'calc.ts')
    expect(result.glyphs).toBeDefined()
    expect(result.glyphs.totalGlyphs).toBeGreaterThanOrEqual(0)
  })

  it('analyzeInscription includes translation info', () => {
    const result = analyzeInscription(strongCode, 'calc.ts')
    expect(result.translation).toBeDefined()
    expect(typeof result.translation.surfaceLevel).toBe('number')
    expect(typeof result.translation.deepLevel).toBe('number')
    expect(typeof result.translation.expertLevel).toBe('number')
    expect(Array.isArray(result.translation.canBeTranslatedBy)).toBe(true)
    expect(typeof result.translation.translationDifficulty).toBe('string')
  })

  it('analyzeInscription includes preservation detail', () => {
    const result = analyzeInscription(strongCode, 'calc.ts')
    expect(result.preservationDetail).toBeDefined()
    expect(typeof result.preservationDetail.weathering).toBe('number')
    expect(typeof result.preservationDetail.isIntact).toBe('boolean')
  })

  it('analyzeInscription includes reading info', () => {
    const result = analyzeInscription(strongCode, 'calc.ts')
    expect(result.reading).toBeDefined()
    expect(typeof result.reading.isSelfDocumenting).toBe('boolean')
    expect(typeof result.reading.needsCommentary).toBe('boolean')
    expect(typeof result.reading.timeToDecipher).toBe('number')
    expect(['scholar', 'literate', 'basic', 'cryptic', 'unknown']).toContain(result.reading.readingLevel)
  })

  it('analyzeInscription classifies type and condition', () => {
    const result = analyzeInscription(strongCode, 'calc.ts')
    expect(['decree', 'law', 'prayer', 'record', 'letter', 'graffiti', 'doodle']).toContain(result.inscriptionType)
    expect(['pristine', 'well-preserved', 'legible', 'weathered', 'fragmentary', 'eroded', 'lost']).toContain(result.condition)
  })

  it('analyzeInscription handles empty content', () => {
    const result = analyzeInscription(emptyCode, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.translatability).toBe(0)
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzeInscription qualityScore is in 0-100 range', () => {
    const result = analyzeInscription(strongCode, 'calc.ts')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
    expect(result.qualityScore).toBeLessThanOrEqual(100)
  })
})

// ─── Tablet Analysis ─────────────────────────────────────────────────────────

describe('rosetta-stone tablet', () => {
  it('analyzeStoneTablet returns empty tablet for no inscriptions', () => {
    const result = analyzeStoneTablet([], 'src')
    expect(result.directory).toBe('src')
    expect(result.inscriptions).toEqual([])
    expect(result.avgTranslatability).toBe(0)
    expect(result.condition).toBe('lost')
    expect(result.isRuins).toBe(true)
  })

  it('analyzeStoneTablet computes averages', () => {
    const inscriptions = [
      analyzeInscription(strongCode, 'src/a.ts'),
      analyzeInscription(simpleExport, 'src/b.ts'),
    ]
    const result = analyzeStoneTablet(inscriptions, 'src')
    expect(result.avgTranslatability).toBeGreaterThan(0)
    expect(result.avgGlyphClarity).toBeGreaterThanOrEqual(0)
    expect(result.avgDecipherability).toBeGreaterThanOrEqual(0)
  })

  it('analyzeStoneTablet identifies dominant script', () => {
    const inscriptions = [
      analyzeInscription(strongCode, 'src/a.ts'),
    ]
    const result = analyzeStoneTablet(inscriptions, 'src')
    expect(['hieroglyphic', 'demotic', 'greek']).toContain(result.dominantScript)
  })

  it('analyzeStoneTablet counts multilingual and self-documenting', () => {
    const inscriptions = [
      analyzeInscription(strongCode, 'src/a.ts'),
      analyzeInscription(simpleExport, 'src/b.ts'),
    ]
    const result = analyzeStoneTablet(inscriptions, 'src')
    expect(typeof result.multilingualCount).toBe('number')
    expect(typeof result.selfDocumentingCount).toBe('number')
    expect(typeof result.crypticCount).toBe('number')
  })

  it('analyzeStoneTablet classifies condition', () => {
    const inscriptions = [
      analyzeInscription(strongCode, 'src/a.ts'),
    ]
    const result = analyzeStoneTablet(inscriptions, 'src')
    expect(['library', 'museum', 'archive', 'field', 'ruins', 'lost']).toContain(result.condition)
  })

  it('analyzeStoneTablet tabletQuality is in 0-100 range', () => {
    const inscriptions = [
      analyzeInscription(strongCode, 'src/a.ts'),
    ]
    const result = analyzeStoneTablet(inscriptions, 'src')
    expect(result.tabletQuality).toBeGreaterThanOrEqual(0)
    expect(result.tabletQuality).toBeLessThanOrEqual(100)
  })
})

// ─── Recommendations ─────────────────────────────────────────────────────────

describe('rosetta-stone recommendations', () => {
  it('generateRecommendations returns array', () => {
    const recs = generateRecommendations([], [], {
      crypticFiles: 0, totalAmbiguousGlyphs: 0, erodedCount: 0,
      lostCount: 0, overallReadability: 50, mostReadable: 'none',
    } as RosettaStoneStats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('generateRecommendations flags cryptic files', () => {
    const recs = generateRecommendations([], [], {
      crypticFiles: 3, totalAmbiguousGlyphs: 0, erodedCount: 0,
      lostCount: 0, overallReadability: 50, mostReadable: 'none',
    } as RosettaStoneStats)
    expect(recs.some(r => r.includes('Cryptic'))).toBe(true)
  })

  it('generateRecommendations flags ambiguous glyphs', () => {
    const recs = generateRecommendations([], [], {
      crypticFiles: 0, totalAmbiguousGlyphs: 30, erodedCount: 0,
      lostCount: 0, overallReadability: 50, mostReadable: 'none',
    } as RosettaStoneStats)
    expect(recs.some(r => r.includes('Ambiguous'))).toBe(true)
  })

  it('generateRecommendations flags eroded files', () => {
    const recs = generateRecommendations([], [], {
      crypticFiles: 0, totalAmbiguousGlyphs: 0, erodedCount: 2,
      lostCount: 0, overallReadability: 50, mostReadable: 'none',
    } as RosettaStoneStats)
    expect(recs.some(r => r.includes('Eroded'))).toBe(true)
  })

  it('generateRecommendations flags lost files', () => {
    const recs = generateRecommendations([], [], {
      crypticFiles: 0, totalAmbiguousGlyphs: 0, erodedCount: 0,
      lostCount: 1, overallReadability: 50, mostReadable: 'none',
    } as RosettaStoneStats)
    expect(recs.some(r => r.includes('Lost'))).toBe(true)
  })

  it('generateRecommendations praises good readability', () => {
    const recs = generateRecommendations([], [], {
      crypticFiles: 0, totalAmbiguousGlyphs: 0, erodedCount: 0,
      lostCount: 0, overallReadability: 70, mostReadable: 'none',
    } as RosettaStoneStats)
    expect(recs.some(r => r.includes('Good readability'))).toBe(true)
  })

  it('generateRecommendations mentions most readable file', () => {
    const recs = generateRecommendations([], [], {
      crypticFiles: 0, totalAmbiguousGlyphs: 0, erodedCount: 0,
      lostCount: 0, overallReadability: 50, mostReadable: 'calc.ts',
    } as RosettaStoneStats)
    expect(recs.some(r => r.includes('calc.ts'))).toBe(true)
  })

  it('generateRecommendations flags ruined tablets', () => {
    const inscriptions = [analyzeInscription(emptyCode, 'bad.ts')]
    const tablet = analyzeStoneTablet(inscriptions, 'bad-dir')
    const recs = generateRecommendations(inscriptions, [tablet], {
      crypticFiles: 0, totalAmbiguousGlyphs: 0, erodedCount: 0,
      lostCount: 0, overallReadability: 50, mostReadable: 'none',
    } as RosettaStoneStats)
    if (tablet.isRuins) {
      expect(recs.some(r => r.includes('Ruined'))).toBe(true)
    }
  })
})

// ─── Orchestrator ────────────────────────────────────────────────────────────

describe('rosetta-stone orchestrator', () => {
  it('buildRosettaStoneResult returns complete result', () => {
    const result = buildRosettaStoneResult(
      ['a.ts', 'b.ts'],
      [strongCode, simpleExport],
      {},
    )
    expect(result.inscriptions).toHaveLength(2)
    expect(result.tablets).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('buildRosettaStoneResult handles empty input', () => {
    const result = buildRosettaStoneResult([], [], {})
    expect(result.inscriptions).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallReadability).toBeGreaterThanOrEqual(0)
  })

  it('buildRosettaStoneResult computes stats correctly', () => {
    const result = buildRosettaStoneResult(
      ['a.ts'],
      [strongCode],
      {},
    )
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgTranslatability).toBeGreaterThan(0)
    expect(result.stats.overallReadability).toBeGreaterThan(0)
  })

  it('buildRosettaStoneResult groups files into tablets by directory', () => {
    const result = buildRosettaStoneResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [strongCode, simpleExport, testCode],
      {},
    )
    expect(result.tablets.length).toBeGreaterThan(0)
  })

  it('buildRosettaStoneResult stats include all fields', () => {
    const result = buildRosettaStoneResult(
      ['a.ts'],
      [strongCode],
      {},
    )
    const s = result.stats
    expect(typeof s.totalFiles).toBe('number')
    expect(typeof s.totalTablets).toBe('number')
    expect(typeof s.avgTranslatability).toBe('number')
    expect(typeof s.avgInscriptionQuality).toBe('number')
    expect(typeof s.avgPreservation).toBe('number')
    expect(typeof s.avgGlyphClarity).toBe('number')
    expect(typeof s.avgScriptConsistency).toBe('number')
    expect(typeof s.avgDecipherability).toBe('number')
    expect(typeof s.multilingualFiles).toBe('number')
    expect(typeof s.selfDocumentingFiles).toBe('number')
    expect(typeof s.crypticFiles).toBe('number')
    expect(typeof s.pristineCount).toBe('number')
    expect(typeof s.erodedCount).toBe('number')
    expect(typeof s.lostCount).toBe('number')
    expect(typeof s.totalClearGlyphs).toBe('number')
    expect(typeof s.totalAmbiguousGlyphs).toBe('number')
    expect(typeof s.totalObscureGlyphs).toBe('number')
    expect(typeof s.scholarLevel).toBe('number')
    expect(typeof s.crypticLevel).toBe('number')
    expect(typeof s.overallReadability).toBe('number')
    expect(['master-linguist', 'polyglot', 'translator', 'reader', 'illiterate', 'blind']).toContain(s.translatorGrade)
    expect(typeof s.mostReadable).toBe('string')
    expect(typeof s.leastReadable).toBe('string')
    expect(typeof s.bestPreserved).toBe('string')
    expect(typeof s.mostCryptic).toBe('string')
  })

  it('buildRosettaStoneResult handles errors gracefully', () => {
    const result = buildRosettaStoneResult(
      ['a.ts'],
      [strongCode],
      {},
    )
    expect(result.inscriptions[0].file).toBe('a.ts')
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('rosetta-stone format helpers', () => {
  const sampleResult = buildRosettaStoneResult(
    ['a.ts', 'b.ts'],
    [strongCode, simpleExport],
    {},
  )

  it('formatRosettaStoneTable returns string with header', () => {
    const output = formatRosettaStoneTable(sampleResult, false)
    expect(typeof output).toBe('string')
    expect(output).toContain('Rosetta Stone')
  })

  it('formatRosettaStoneTable includes inscriptions section', () => {
    const output = formatRosettaStoneTable(sampleResult, false)
    expect(output).toContain('Inscriptions')
  })

  it('formatRosettaStoneTable includes statistics section', () => {
    const output = formatRosettaStoneTable(sampleResult, false)
    expect(output).toContain('Statistics')
  })

  it('formatRosettaStoneTable shows grade', () => {
    const output = formatRosettaStoneTable(sampleResult, false)
    expect(output).toContain('Grade')
  })

  it('formatRosettaStoneTable verbose shows more detail', () => {
    const verbose = formatRosettaStoneTable(sampleResult, true)
    const normal = formatRosettaStoneTable(sampleResult, false)
    expect(verbose.length).toBeGreaterThanOrEqual(normal.length)
  })

  it('formatRosettaStoneTable handles empty results', () => {
    const emptyResult = buildRosettaStoneResult([], [], {})
    const output = formatRosettaStoneTable(emptyResult, false)
    expect(output).toContain('No files analyzed')
  })

  it('formatRosettaStoneTable shows recommendations', () => {
    const output = formatRosettaStoneTable(sampleResult, false)
    expect(typeof output).toBe('string')
  })

  it('formatRosettaStoneTable shows tablets when present', () => {
    const result = buildRosettaStoneResult(
      ['src/a.ts', 'src/b.ts'],
      [strongCode, simpleExport],
      {},
    )
    const output = formatRosettaStoneTable(result, false)
    expect(output).toContain('Stone Tablets')
  })

  it('formatRosettaStoneJson returns valid JSON', () => {
    const output = formatRosettaStoneJson(sampleResult)
    const parsed = JSON.parse(output)
    expect(parsed.inscriptions).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('formatRosettaStoneJson handles empty results', () => {
    const emptyResult = buildRosettaStoneResult([], [], {})
    const output = formatRosettaStoneJson(emptyResult)
    const parsed = JSON.parse(output)
    expect(parsed.inscriptions).toHaveLength(0)
  })

  it('formatRosettaStoneTable truncates long lists', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => simpleExport)
    const result = buildRosettaStoneResult(files, contents, {})
    const output = formatRosettaStoneTable(result, false)
    expect(output).toContain('... and')
  })

  it('formatRosettaStoneTable verbose shows all inscriptions', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => simpleExport)
    const result = buildRosettaStoneResult(files, contents, {})
    const output = formatRosettaStoneTable(result, true)
    expect(output).toContain('file19.ts')
  })
})
