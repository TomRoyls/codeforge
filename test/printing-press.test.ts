import { describe, expect, it } from 'vitest'
import {
  analyzePrintedPage,
  analyzePrintShop,
  buildPrintingPressResult,
  classifyPageCondition,
  classifyPublisherGrade,
  classifyShopCondition,
  classifyShopType,
  generateRecommendations,
  measureBinding,
  measureCirculation,
  measureInk,
  measurePaper,
  measurePlate,
  measurePrint,
  measureTypeface,
  type PrintedPage,
} from '../src/commands/printing-press-helpers.js'
import {
  formatPrintingPressCsv,
  formatPrintingPressJson,
  formatPrintingPressTable,
} from '../src/commands/printing-press-format-helpers.js'

describe('measureTypeface', () => {
  it('returns full clarity for empty content', () => {
    const tf = measureTypeface('')
    expect(tf.clarity).toBe(100)
    expect(tf.style).toBe('serif')
  })

  it('detects serif for high clarity code', () => {
    const code = 'function processData(input: string): number { return input.length }'
    const tf = measureTypeface(code)
    expect(tf.clarity).toBeGreaterThan(50)
    expect(tf.isReadable).toBe(true)
  })

  it('detects hieroglyph for low clarity code', () => {
    const code = 'const x = 1'
    const tf = measureTypeface(code)
    expect(tf.style).toBe('hieroglyph')
  })

  it('detects consistent font when naming convention is uniform', () => {
    const code = 'function processData() {}\nfunction validateInput() {}'
    const tf = measureTypeface(code)
    expect(tf.hasConsistentFont).toBe(true)
  })

  it('detects orphans from undefined references', () => {
    const code = Array.from({ length: 5 }, (_, i) => `const x${i}: number | undefined = ${i}`).join('\n')
    const tf = measureTypeface(code)
    expect(tf.hasOrphans).toBe(true)
  })

  it('detects ligatures from classes and interfaces', () => {
    const code = 'class Service {}\ninterface IService {}'
    const tf = measureTypeface(code)
    expect(tf.hasLigatures).toBe(true)
  })

  it('detects readable code', () => {
    const code = 'export function process(data: string): string { return data }'
    const tf = measureTypeface(code)
    expect(tf.isReadable).toBe(true)
  })
})

describe('measureInk', () => {
  it('returns full quality for empty content', () => {
    const ink = measureInk('')
    expect(ink.quality).toBe(100)
  })

  it('detects dark ink from thorough documentation', () => {
    const code = [
      '/** Doc 1 */',
      '/** Doc 2 */',
      '/** Doc 3 */',
      '// comment',
      '// another',
      'function a() {}',
      'function b() {}',
      'function c() {}',
      'function d() {}',
      'function e() {}',
      'function f() {}',
      'function g() {}',
      'function h() {}',
      'function i() {}',
      'function j() {}',
      'function k() {}',
    ].join('\n')
    const ink = measureInk(code)
    expect(ink.isDark).toBe(true)
  })

  it('detects faded ink from sparse documentation', () => {
    const code = Array.from({ length: 30 }, (_, i) => `function fn${i}() {}`).join('\n')
    const ink = measureInk(code)
    expect(ink.isFaded).toBe(true)
  })

  it('detects smudged ink from comments without JSDoc', () => {
    const code = [
      '// some comment',
      'function a() {}',
      'function b() {}',
      'function c() {}',
      'function d() {}',
      'function e() {}',
      'function f() {}',
      'function g() {}',
      'function h() {}',
      'function i() {}',
      'function j() {}',
      'function k() {}',
    ].join('\n')
    const ink = measureInk(code)
    expect(ink.isSmudged).toBe(true)
  })

  it('detects illustrations from code examples', () => {
    const code = [
      '/**',
      ' * @example',
      ' * const x = 1',
       ' */',
      'function core() {}',
    ].join('\n')
    const ink = measureInk(code)
    expect(ink.hasIllustrations).toBe(true)
    expect(ink.illustrationCount).toBe(1)
  })
})

describe('measurePlate', () => {
  it('returns full quality for empty content', () => {
    const plate = measurePlate('')
    expect(plate.quality).toBe(100)
  })

  it('detects engraving from interfaces', () => {
    const code = 'interface Config { name: string }'
    const plate = measurePlate(code)
    expect(plate.hasEngraving).toBe(true)
  })

  it('detects woodcut from functions without interfaces', () => {
    const code = 'function process() {}'
    const plate = measurePlate(code)
    expect(plate.hasWoodcut).toBe(true)
  })

  it('detects lithograph from classes and interfaces', () => {
    const code = 'class Service {}\ninterface IService {}'
    const plate = measurePlate(code)
    expect(plate.hasLithograph).toBe(true)
  })

  it('detects photogravure from all three patterns', () => {
    const code = 'class Service {}\ninterface IService {}\ntype Config = {}'
    const plate = measurePlate(code)
    expect(plate.hasPhotogravure).toBe(true)
  })

  it('detects plate wear from deprecated patterns', () => {
    const code = '/** @deprecated */\nfunction old() {}'
    const plate = measurePlate(code)
    expect(plate.hasPlateWear).toBe(true)
  })

  it('detects plate marks from TODOs', () => {
    const code = 'function a() {}\n// TODO: fix'
    const plate = measurePlate(code)
    expect(plate.hasPlateMarks).toBe(true)
  })
})

describe('measurePaper', () => {
  it('calculates weight from line count', () => {
    const code = Array.from({ length: 30 }, (_, i) => `const x${i} = ${i}`).join('\n')
    const paper = measurePaper(code)
    expect(paper.weight).toBe(10)
  })

  it('detects acid-free paper with no deprecation', () => {
    const paper = measurePaper('function clean() {}')
    expect(paper.isAcidFree).toBe(true)
  })

  it('detects foxing from deprecated code', () => {
    const code = '/** @deprecated */\nfunction old() {}'
    const paper = measurePaper(code)
    expect(paper.hasFoxing).toBe(true)
  })

  it('detects smooth code from low nesting', () => {
    const paper = measurePaper('const x = 1')
    expect(paper.isSmooth).toBe(true)
  })

  it('detects tooth from deep nesting', () => {
    const code = 'function a() {\n  function b() {\n    function c() {\n      function d() {\n        return 1\n      }\n    }\n  }\n}'
    const paper = measurePaper(code)
    expect(paper.hasTooth).toBe(true)
  })
})

describe('measureBinding', () => {
  it('returns hardcover for high quality', () => {
    const code = [
      'import { a } from "./x"',
      'export function b() {}',
      'export function c() {}',
      'export function d() {}',
      'class Service {}',
      'interface IConfig {}',
      'try { b() } catch(e) {}',
      "it('works', () => {})",
    ].join('\n')
    const binding = measureBinding(code)
    expect(binding.quality).toBeGreaterThan(60)
    expect(binding.hasBibliography).toBe(true)
    expect(binding.hasTableOfContents).toBe(true)
  })

  it('detects loose pages when functions are not exported', () => {
    const code = 'function hidden() {}'
    const binding = measureBinding(code)
    expect(binding.hasLoosePages).toBe(true)
  })

  it('detects dog ears from tests', () => {
    const code = "it('test', () => {})"
    const binding = measureBinding(code)
    expect(binding.hasDogEars).toBe(true)
  })

  it('detects glossary from type definitions', () => {
    const code = 'interface Config {}\ntype Options = {}'
    const binding = measureBinding(code)
    expect(binding.hasGlossary).toBe(true)
  })

  it('detects index from multiple exports', () => {
    const code = 'export function a() {}\nexport function b() {}'
    const binding = measureBinding(code)
    expect(binding.hasIndex).toBe(true)
  })
})

describe('measureCirculation', () => {
  it('returns full reach for empty content', () => {
    const circ = measureCirculation('')
    expect(circ.reach).toBe(100)
  })

  it('detects translations from type annotations', () => {
    const code = 'function process(x: number): string { return String(x) }'
    const circ = measureCirculation(code)
    expect(circ.hasTranslations).toBe(true)
  })

  it('detects public domain from exports', () => {
    const code = 'export function api() {}'
    const circ = measureCirculation(code)
    expect(circ.isPublicDomain).toBe(true)
  })

  it('detects rare manuscript from undocumented internal code', () => {
    const code = Array.from({ length: 8 }, (_, i) => `const x${i} = ${i}`).join('\n')
    const circ = measureCirculation(code)
    expect(circ.isRareManuscript).toBe(true)
  })

  it('detects errata from TODOs', () => {
    const code = 'function a() {}\n// TODO: fix'
    const circ = measureCirculation(code)
    expect(circ.hasErrata).toBe(true)
    expect(circ.errataCount).toBe(1)
  })

  it('detects annotations from comments', () => {
    const code = '// This is important\nfunction a() {}'
    const circ = measureCirculation(code)
    expect(circ.hasAnnotations).toBe(true)
  })
})

describe('measurePrint', () => {
  it('returns full run for empty content', () => {
    const print = measurePrint('')
    expect(print.run).toBe(100)
    expect(print.isComplete).toBe(true)
  })

  it('detects full color from comprehensive documentation', () => {
    const code = [
      '/** Doc 1 */',
      '/** Doc 2 */',
      '/** Doc 3 */',
      '/**',
      ' * @example',
      ' * const x = 1',
      ' */',
      '/**',
      ' * @example',
      ' * const y = 2',
      ' */',
      'function a() {}',
    ].join('\n')
    const print = measurePrint(code)
    expect(print.hasFullColor).toBe(true)
  })

  it('detects blank pages from undocumented code', () => {
    const code = Array.from({ length: 15 }, (_, i) => `const x${i} = ${i}`).join('\n')
    const print = measurePrint(code)
    expect(print.hasBlankPages).toBe(true)
  })

  it('detects black and white from comments only', () => {
    const code = '// a comment\nfunction a() {}'
    const print = measurePrint(code)
    expect(print.isBlackAndWhite).toBe(true)
  })

  it('detects spot color from some JSDoc', () => {
    const code = '/** Doc */\nfunction a() {}'
    const print = measurePrint(code)
    expect(print.hasSpotColor).toBe(true)
  })
})

describe('classifyPageCondition', () => {
  it('classifies gutenberg-bible for top scores', () => {
    expect(classifyPageCondition(85, 80, 80)).toBe('gutenberg-bible')
  })

  it('classifies first-edition for good doc quality', () => {
    expect(classifyPageCondition(65, 60, 55)).toBe('first-edition')
  })

  it('classifies quality-print for moderate scores', () => {
    expect(classifyPageCondition(50, 50, 45)).toBe('quality-print')
  })

  it('classifies mass-market for low scores', () => {
    expect(classifyPageCondition(35, 35, 30)).toBe('mass-market')
  })

  it('classifies mimeograph for very low scores', () => {
    expect(classifyPageCondition(20, 20, 20)).toBe('mimeograph')
  })

  it('classifies smudged-manuscript for critically low scores', () => {
    expect(classifyPageCondition(5, 5, 5)).toBe('smudged-manuscript')
  })
})

describe('classifyShopType', () => {
  it('returns typewriter for empty pages', () => {
    expect(classifyShopType([])).toBe('typewriter')
  })

  it('classifies royal-press for high doc quality', () => {
    const pages = Array.from({ length: 10 }, () => ({
      documentationQuality: 75, condition: 'gutenberg-bible',
    } as unknown as PrintedPage))
    expect(classifyShopType(pages)).toBe('royal-press')
  })

  it('classifies fanzine for many smudged manuscripts', () => {
    const pages = Array.from({ length: 6 }, () => ({
      documentationQuality: 20, condition: 'smudged-manuscript',
    } as unknown as PrintedPage))
    expect(classifyShopType(pages)).toBe('fanzine')
  })
})

describe('classifyShopCondition', () => {
  it('returns prestigious-press for top scores', () => {
    expect(classifyShopCondition(85, 85)).toBe('prestigious-press')
  })

  it('returns quality-publisher for good scores', () => {
    expect(classifyShopCondition(65, 65)).toBe('quality-publisher')
  })

  it('returns handwritten for critically low scores', () => {
    expect(classifyShopCondition(5, 5)).toBe('handwritten')
  })
})

describe('classifyPublisherGrade', () => {
  it('returns master-publisher for top publishing', () => {
    expect(classifyPublisherGrade(90)).toBe('master-publisher')
  })

  it('returns publisher for high publishing', () => {
    expect(classifyPublisherGrade(70)).toBe('publisher')
  })

  it('returns editor for moderate publishing', () => {
    expect(classifyPublisherGrade(55)).toBe('editor')
  })

  it('returns typesetter for low publishing', () => {
    expect(classifyPublisherGrade(40)).toBe('typesetter')
  })

  it('returns proofreader for very low publishing', () => {
    expect(classifyPublisherGrade(25)).toBe('proofreader')
  })

  it('returns scribe for critically low publishing', () => {
    expect(classifyPublisherGrade(10)).toBe('scribe')
  })
})

describe('analyzePrintedPage', () => {
  it('handles empty content', () => {
    const page = analyzePrintedPage('', 'empty.ts')
    expect(page.typeClarity).toBe(100)
    expect(page.qualityScore).toBeLessThanOrEqual(100)
    expect(page.condition).toBeDefined()
  })

  it('produces well-structured page for documented code', () => {
    const code = [
      '/** Core module documentation */',
      'export function process(data: string): string {',
      '  try {',
      '    return data.toUpperCase()',
      '  } catch(e) {',
      '    throw e',
      '  }',
      '}',
    ].join('\n')
    const page = analyzePrintedPage(code, 'core.ts')
    expect(page.typeClarity).toBeGreaterThan(0)
    expect(page.documentationQuality).toBeGreaterThan(0)
    expect(page.circulation.hasTranslations).toBe(true)
    expect(page.qualityScore).toBeGreaterThan(0)
  })

  it('calculates quality score from all measures', () => {
    const code = 'export function f(x: number): number { return x }'
    const page = analyzePrintedPage(code, 'f.ts')
    expect(page.qualityScore).toBeGreaterThan(0)
    expect(page.qualityScore).toBeLessThanOrEqual(100)
  })
})

describe('analyzePrintShop', () => {
  it('returns handwritten for empty pages', () => {
    const shop = analyzePrintShop([], 'empty')
    expect(shop.shopType).toBe('typewriter')
    expect(shop.condition).toBe('handwritten')
    expect(shop.pages).toHaveLength(0)
  })

  it('aggregates page data into shop averages', () => {
    const code = 'export function a() {}'
    const page = analyzePrintedPage(code, 'src/a.ts')
    const shop = analyzePrintShop([page], 'src')
    expect(shop.avgTypeClarity).toBe(page.typeClarity)
    expect(shop.directory).toBe('src')
    expect(shop.pages).toHaveLength(1)
  })
})

describe('generateRecommendations', () => {
  it('returns positive recommendation for healthy library', () => {
    const recs = generateRecommendations([], [], {
      avgTypeClarity: 80, avgDocQuality: 80, avgBinding: 80,
      totalIllustrations: 10, isWellDocumented: true, overallPublishing: 80,
    }, {
      smudgedManuscriptCount: 0, blankPagesCount: 0, hieroglyphFontCount: 0,
      hasErrataCount: 0, hasTranslationsCount: 8, hasIllustrationsCount: 5,
      hasColophonCount: 2, totalFiles: 10, avgDocQuality: 80,
    } as any)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs[0]).toContain('high-quality')
  })

  it('warns about smudged manuscripts', () => {
    const recs = generateRecommendations([], [], {
      avgTypeClarity: 60, avgDocQuality: 60, avgBinding: 60,
      totalIllustrations: 0, isWellDocumented: false, overallPublishing: 60,
    }, {
      smudgedManuscriptCount: 2, blankPagesCount: 0, hieroglyphFontCount: 0,
      hasErrataCount: 0, hasTranslationsCount: 5, hasIllustrationsCount: 3,
      hasColophonCount: 1, totalFiles: 10, avgDocQuality: 60,
    } as any)
    expect(recs.some((r) => r.includes('smudged'))).toBe(true)
  })

  it('warns about low publishing quality', () => {
    const recs = generateRecommendations([], [], {
      avgTypeClarity: 25, avgDocQuality: 25, avgBinding: 25,
      totalIllustrations: 0, isWellDocumented: false, overallPublishing: 25,
    }, {
      smudgedManuscriptCount: 0, blankPagesCount: 5, hieroglyphFontCount: 0,
      hasErrataCount: 0, hasTranslationsCount: 2, hasIllustrationsCount: 1,
      hasColophonCount: 0, totalFiles: 10, avgDocQuality: 25,
    } as any)
    expect(recs.some((r) => r.includes('low'))).toBe(true)
  })
})

describe('buildPrintingPressResult', () => {
  it('returns valid result for empty input', () => {
    const result = buildPrintingPressResult([], [], {})
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalShops).toBe(0)
    expect(result.pages).toHaveLength(0)
    expect(result.shops).toHaveLength(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes a single file', () => {
    const code = 'export function main(x: number): number { return x }'
    const result = buildPrintingPressResult(['core.ts'], [code], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.pages).toHaveLength(1)
    expect(result.pages[0].file).toBe('core.ts')
    expect(result.pages[0].typeClarity).toBeGreaterThan(0)
  })

  it('groups files by directory', () => {
    const code = 'export function a() {}'
    const result = buildPrintingPressResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [code, code, code],
      {},
    )
    expect(result.shops.length).toBe(2)
  })

  it('computes library averages', () => {
    const code = 'export function core(): void {}'
    const result = buildPrintingPressResult(['a.ts', 'b.ts'], [code, code], {})
    expect(result.library.avgTypeClarity).toBeGreaterThan(0)
    expect(result.library.overallPublishing).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const code = 'export function a() {}'
    const result = buildPrintingPressResult(['a.ts'], [code], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.publisherGrade).toBeDefined()
    expect(result.stats.clearestType).toBe('a.ts')
  })
})

describe('formatPrintingPressTable', () => {
  it('produces non-empty table output', () => {
    const result = buildPrintingPressResult(['a.ts'], ['export function a() {}'], {})
    const output = formatPrintingPressTable(result, false)
    expect(output.length).toBeGreaterThan(0)
    expect(output).toContain('Printing Press Report')
  })

  it('includes verbose details when enabled', () => {
    const result = buildPrintingPressResult(['a.ts'], ['export function a() {}'], {})
    const output = formatPrintingPressTable(result, true)
    expect(output).toContain('Printed Pages')
  })
})

describe('formatPrintingPressJson', () => {
  it('produces valid JSON', () => {
    const result = buildPrintingPressResult(['a.ts'], ['function a() {}'], {})
    const json = formatPrintingPressJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

describe('formatPrintingPressCsv', () => {
  it('produces CSV with headers', () => {
    const result = buildPrintingPressResult(['a.ts'], ['export function a() {}'], {})
    const csv = formatPrintingPressCsv(result)
    const lines = csv.split('\n')
    expect(lines[0]).toContain('file')
    expect(lines.length).toBeGreaterThan(1)
  })
})

describe('integration: full pipeline', () => {
  it('analyzes a realistic multi-file codebase', () => {
    const files = ['src/core.ts', 'src/utils.ts', 'src/api.ts']
    const contents = [
      [
        '/** Core module */',
        'export function process(data: string): string {',
        '  try {',
        '    return data.toUpperCase()',
        '  } catch(e) {',
        '    throw e',
        '  }',
        '}',
      ].join('\n'),
      'function helper() { return 1 }',
      [
        'import { process } from "./core"',
        'export function fetch(url: string): Promise<string> {',
        '  return Promise.resolve(url)',
        '}',
      ].join('\n'),
    ]
    const result = buildPrintingPressResult(files, contents, {})
    expect(result.pages).toHaveLength(3)
    expect(result.shops.length).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.library.overallPublishing).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})
