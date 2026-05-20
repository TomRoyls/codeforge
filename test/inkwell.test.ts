import { describe, it, expect } from 'vitest'
import {
  identifyFlourishes,
  identifyBlemishes,
  identifyInkBlots,
  identifyDrySpots,
  identifySmudges,
  analyzeStroke,
  analyzeInkBottle,
  computeManuscriptCondition,
  classifyPenmanshipGrade,
  generateRecommendations,
  buildInkwellResult,
  type InkStroke,
  type InkBottle,
  type InkwellStats,
  type InkwellResult,
} from '../src/commands/inkwell-helpers.js'
import { formatInkwellTable, formatInkwellJson } from '../src/commands/inkwell-format-helpers.js'

// ─── identifyFlourishes ─────────────────────────────────────────────────────

describe('identifyFlourishes', () => {
  it('detects optional chaining', () => {
    const flourishes = identifyFlourishes('const x = obj?.prop')
    expect(flourishes).toContain('optional-chaining')
  })

  it('detects destructuring', () => {
    const flourishes = identifyFlourishes('const { a, b } = obj')
    expect(flourishes).toContain('destructuring')
  })

  it('detects guard clauses', () => {
    const flourishes = identifyFlourishes('if (!x) return null')
    expect(flourishes).toContain('guard-clauses')
  })

  it('detects JSDoc documentation', () => {
    const code = '/** docs */\nfunction foo() {}'
    expect(identifyFlourishes(code)).toContain('jsdoc-documentation')
  })

  it('detects type definitions', () => {
    expect(identifyFlourishes('interface User { name: string }')).toContain('type-definitions')
  })

  it('returns empty for plain code', () => {
    expect(identifyFlourishes('const x = 1')).toEqual([])
  })
})

// ─── identifyBlemishes ──────────────────────────────────────────────────────

describe('identifyBlemishes', () => {
  it('detects nested ternary', () => {
    const code = 'const x = a ? b ? c : d : e'
    expect(identifyBlemishes(code)).toContain('nested-ternary')
  })

  it('detects console usage', () => {
    expect(identifyBlemishes('console.log("hi")')).toContain('console-usage')
  })

  it('detects any type', () => {
    expect(identifyBlemishes('const x: any = 1')).toContain('any-type')
  })

  it('returns empty for clean code', () => {
    expect(identifyBlemishes('const x = 1')).toEqual([])
  })

  it('detects magic numbers', () => {
    expect(identifyBlemishes('const x = 100 + 200')).toContain('magic-numbers')
  })
})

// ─── identifyInkBlots ───────────────────────────────────────────────────────

describe('identifyInkBlots', () => {
  it('detects var usage', () => {
    expect(identifyInkBlots('var x = 1')).toContain('var-usage')
  })

  it('detects loose equality', () => {
    expect(identifyInkBlots('if (x == 1)')).toContain('loose-equality')
  })

  it('detects eval usage', () => {
    expect(identifyInkBlots('eval("1+1")')).toContain('eval-usage')
  })

  it('returns empty for clean code', () => {
    expect(identifyInkBlots('const x = 1')).toEqual([])
  })
})

// ─── identifyDrySpots ───────────────────────────────────────────────────────

describe('identifyDrySpots', () => {
  it('detects missing JSDoc', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}'
    expect(identifyDrySpots(code)).toContain('missing-jsdoc')
  })

  it('returns empty for well-documented code', () => {
    const code = '/** docs */\nfunction a() {}'
    expect(identifyDrySpots(code)).toEqual([])
  })
})

// ─── identifySmudges ────────────────────────────────────────────────────────

describe('identifySmudges', () => {
  it('detects mixed indentation', () => {
    const code = '  spaces\n\ttabs'
    expect(identifySmudges(code)).toContain('mixed-indentation')
  })

  it('returns empty for consistent formatting', () => {
    expect(identifySmudges('const x = 1;\nconst y = 2;')).toEqual([])
  })
})

// ─── analyzeStroke ──────────────────────────────────────────────────────────

describe('analyzeStroke', () => {
  it('returns an InkStroke with all required fields', () => {
    const stroke = analyzeStroke('const x = 1', 'test.ts')
    expect(stroke).toHaveProperty('file')
    expect(stroke).toHaveProperty('strokeQuality')
    expect(stroke).toHaveProperty('inkDensity')
    expect(stroke).toHaveProperty('flow')
    expect(stroke).toHaveProperty('penmanship')
    expect(stroke).toHaveProperty('inkColor')
    expect(stroke).toHaveProperty('strokeType')
    expect(stroke).toHaveProperty('manuscript')
    expect(stroke).toHaveProperty('blemishes')
    expect(stroke).toHaveProperty('flourishes')
    expect(stroke).toHaveProperty('inkBlots')
    expect(stroke).toHaveProperty('drySpots')
    expect(stroke).toHaveProperty('smudges')
    expect(stroke).toHaveProperty('classification')
    expect(stroke).toHaveProperty('readabilityScore')
  })

  it('stores the file path', () => {
    const stroke = analyzeStroke('const x = 1', 'my-file.ts')
    expect(stroke.file).toBe('my-file.ts')
  })

  it('classifies well-written code highly', () => {
    const good = '/** Adds two numbers */\nexport function add(a: number, b: number): number {\n  return a + b\n}\n'
    const stroke = analyzeStroke(good, 'math.ts')
    expect(stroke.strokeQuality).toBeGreaterThan(30)
    expect(stroke.flourishes.length).toBeGreaterThan(0)
  })

  it('classifies messy code poorly', () => {
    const bad = 'var x=1;var y=2;console.log(x==y);eval("x+y")'
    const stroke = analyzeStroke(bad, 'bad.ts')
    expect(stroke.blemishes.length).toBeGreaterThan(0)
    expect(stroke.inkBlots.length).toBeGreaterThan(0)
  })

  it('computes manuscript metrics', () => {
    const code = 'function a() {\n  return 1\n}\n\nfunction b() {\n  return 2\n}'
    const stroke = analyzeStroke(code, 'funcs.ts')
    expect(stroke.manuscript.paragraphs).toBeGreaterThan(0)
    expect(stroke.manuscript.sentences).toBeGreaterThan(0)
  })

  it('scores empty content low', () => {
    const stroke = analyzeStroke('', 'empty.ts')
    expect(stroke.strokeQuality).toBeLessThan(50)
  })

  it('assigns inkColor based on readability', () => {
    const bad = 'var x = eval("1")'
    const stroke = analyzeStroke(bad, 'bad.ts')
    expect(['red', 'invisible', 'blue']).toContain(stroke.inkColor)
  })

  it('assigns classification based on readability', () => {
    const stroke = analyzeStroke('', 'empty.ts')
    expect(['scribble', 'illegible', 'rough-draft', 'legible']).toContain(stroke.classification)
  })

  it('detects dry spots in undocumented code', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}'
    const stroke = analyzeStroke(code, 'nodoc.ts')
    expect(stroke.drySpots.length).toBeGreaterThan(0)
  })
})

// ─── analyzeInkBottle ───────────────────────────────────────────────────────

describe('analyzeInkBottle', () => {
  const makeStroke = (file: string, quality: number): InkStroke => ({
    file,
    strokeQuality: quality,
    inkDensity: 50,
    flow: 50,
    penmanship: 50,
    inkColor: 'black',
    strokeType: 'regular',
    manuscript: { paragraphs: 1, sentences: 5, words: 20, punctuation: 3, avgSentenceLength: 4, avgParagraphCohesion: 50 },
    blemishes: [],
    flourishes: [],
    inkBlots: [],
    drySpots: [],
    smudges: [],
    classification: 'legible',
    readabilityScore: 50,
  })

  it('returns an InkBottle with all required fields', () => {
    const bottle = analyzeInkBottle([makeStroke('a.ts', 50)], 'src')
    expect(bottle).toHaveProperty('directory')
    expect(bottle).toHaveProperty('strokes')
    expect(bottle).toHaveProperty('inkQuality')
    expect(bottle).toHaveProperty('bottleFullness')
    expect(bottle).toHaveProperty('dominantInkColor')
    expect(bottle).toHaveProperty('dominantStrokeType')
    expect(bottle).toHaveProperty('avgReadability')
    expect(bottle).toHaveProperty('totalBlemishes')
    expect(bottle).toHaveProperty('totalFlourishes')
    expect(bottle).toHaveProperty('totalInkBlots')
    expect(bottle).toHaveProperty('totalDrySpots')
    expect(bottle).toHaveProperty('totalSmudges')
    expect(bottle).toHaveProperty('condition')
  })

  it('computes average ink quality', () => {
    const bottle = analyzeInkBottle([makeStroke('a.ts', 60), makeStroke('b.ts', 80)], 'src')
    expect(bottle.inkQuality).toBe(70)
  })

  it('stores the directory path', () => {
    const bottle = analyzeInkBottle([], 'my/dir')
    expect(bottle.directory).toBe('my/dir')
  })

  it('handles empty strokes', () => {
    const bottle = analyzeInkBottle([], 'empty')
    expect(bottle.inkQuality).toBe(0)
    expect(bottle.condition).toBe('ruined')
  })
})

// ─── computeManuscriptCondition ──────────────────────────────────────────────

describe('computeManuscriptCondition', () => {
  const makeStroke = (classification: InkStroke['classification'], readability: number): InkStroke => ({
    file: 'test.ts',
    strokeQuality: readability,
    inkDensity: readability,
    flow: readability,
    penmanship: readability,
    inkColor: 'black',
    strokeType: 'regular',
    manuscript: { paragraphs: 1, sentences: 1, words: 1, punctuation: 0, avgSentenceLength: 1, avgParagraphCohesion: 50 },
    blemishes: [],
    flourishes: [],
    inkBlots: [],
    drySpots: [],
    smudges: [],
    classification,
    readabilityScore: readability,
  })

  it('returns damaged for empty strokes', () => {
    expect(computeManuscriptCondition([])).toBe('damaged')
  })

  it('returns pristine for high quality', () => {
    const strokes = [makeStroke('masterwork', 90), makeStroke('fine-craft', 85)]
    expect(computeManuscriptCondition(strokes)).toBe('pristine')
  })

  it('returns fair for moderate quality', () => {
    const strokes = [makeStroke('legible', 50)]
    expect(computeManuscriptCondition(strokes)).toBe('fair')
  })

  it('returns damaged for very low quality', () => {
    const strokes = [makeStroke('illegible', 5)]
    expect(computeManuscriptCondition(strokes)).toBe('damaged')
  })
})

// ─── classifyPenmanshipGrade ────────────────────────────────────────────────

describe('classifyPenmanshipGrade', () => {
  it('returns A for high quality', () => {
    expect(classifyPenmanshipGrade(85)).toBe('A')
  })

  it('returns B for good quality', () => {
    expect(classifyPenmanshipGrade(65)).toBe('B')
  })

  it('returns C for moderate quality', () => {
    expect(classifyPenmanshipGrade(45)).toBe('C')
  })

  it('returns D for low quality', () => {
    expect(classifyPenmanshipGrade(25)).toBe('D')
  })

  it('returns F for very low quality', () => {
    expect(classifyPenmanshipGrade(10)).toBe('F')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: InkwellStats = {
    totalFiles: 5, totalBottles: 1,
    avgStrokeQuality: 60, avgInkDensity: 50, avgFlow: 60, avgPenmanship: 60, avgReadability: 60,
    masterworks: 1, fineCrafts: 2, scribbles: 0, illegibles: 0,
    totalBlemishes: 2, totalFlourishes: 3, totalInkBlots: 1, totalDrySpots: 1, totalSmudges: 0,
    overallInkQuality: 58, dominantInkColor: 'black',
    manuscriptCondition: 'fair', penmanshipGrade: 'B',
    bestWrittenFile: 'a.ts', worstWrittenFile: 'b.ts',
  }

  it('recommends maintaining standards for healthy codebase', () => {
    const stats = { ...baseStats }
    const recs = generateRecommendations([], [], stats)
    expect(recs).toContain('Ink quality is excellent - maintain current writing standards')
  })

  it('warns about scribbles exceeding masterworks', () => {
    const stats = { ...baseStats, scribbles: 5, masterworks: 1 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('scribbles'))).toBe(true)
  })

  it('warns about ink blots', () => {
    const stats = { ...baseStats, totalInkBlots: 8 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('ink blots'))).toBe(true)
  })

  it('warns about dry spots', () => {
    const stats = { ...baseStats, totalDrySpots: 5 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('dry spots'))).toBe(true)
  })

  it('warns about smudges', () => {
    const stats = { ...baseStats, totalSmudges: 3 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('smudges'))).toBe(true)
  })

  it('warns about illegibles', () => {
    const stats = { ...baseStats, illegibles: 2 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('illegible'))).toBe(true)
  })
})

// ─── buildInkwellResult ─────────────────────────────────────────────────────

describe('buildInkwellResult', () => {
  it('returns an InkwellResult with all required fields', () => {
    const result = buildInkwellResult(['test.ts'], ['const x = 1'], {})
    expect(result).toHaveProperty('strokes')
    expect(result).toHaveProperty('bottles')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('creates one stroke per file', () => {
    const result = buildInkwellResult(
      ['a.ts', 'b.ts', 'c.ts'],
      ['const a = 1', 'const b = 2', 'const c = 3'],
      {},
    )
    expect(result.strokes).toHaveLength(3)
  })

  it('groups strokes into bottles by directory', () => {
    const result = buildInkwellResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      ['const a = 1', 'const b = 2', 'const c = 3'],
      {},
    )
    expect(result.bottles).toHaveLength(2)
  })

  it('computes comprehensive stats', () => {
    const result = buildInkwellResult(['a.ts'], ['const x = 1'], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.penmanshipGrade).toBeDefined()
    expect(result.stats.manuscriptCondition).toBeDefined()
    expect(result.stats.overallInkQuality).toBeGreaterThanOrEqual(0)
    expect(result.stats.bestWrittenFile).toBe('a.ts')
    expect(result.stats.worstWrittenFile).toBe('a.ts')
  })

  it('handles empty input', () => {
    const result = buildInkwellResult([], [], {})
    expect(result.strokes).toEqual([])
    expect(result.bottles).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
  })

  it('generates recommendations', () => {
    const result = buildInkwellResult(['a.ts'], ['const x = 1'], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── format helpers ─────────────────────────────────────────────────────────

describe('format helpers', () => {
  const result: InkwellResult = {
    strokes: [{
      file: 'test.ts', strokeQuality: 70, inkDensity: 60, flow: 65, penmanship: 75,
      inkColor: 'black', strokeType: 'regular',
      manuscript: { paragraphs: 2, sentences: 5, words: 30, punctuation: 8, avgSentenceLength: 6, avgParagraphCohesion: 70 },
      blemishes: [], flourishes: ['destructuring'], inkBlots: [], drySpots: [], smudges: [],
      classification: 'legible', readabilityScore: 68,
    }],
    bottles: [{
      directory: 'src', strokes: [], inkQuality: 70, bottleFullness: 60,
      dominantInkColor: 'black', dominantStrokeType: 'regular', avgReadability: 68,
      totalBlemishes: 0, totalFlourishes: 1, totalInkBlots: 0, totalDrySpots: 0, totalSmudges: 0,
      condition: 'good',
    }],
    stats: {
      totalFiles: 1, totalBottles: 1,
      avgStrokeQuality: 70, avgInkDensity: 60, avgFlow: 65, avgPenmanship: 75, avgReadability: 68,
      masterworks: 0, fineCrafts: 0, scribbles: 0, illegibles: 0,
      totalBlemishes: 0, totalFlourishes: 1, totalInkBlots: 0, totalDrySpots: 0, totalSmudges: 0,
      overallInkQuality: 68, dominantInkColor: 'black',
      manuscriptCondition: 'fair', penmanshipGrade: 'B',
      bestWrittenFile: 'test.ts', worstWrittenFile: 'test.ts',
    },
    recommendations: ['Ink quality is excellent - maintain current writing standards'],
  }

  it('formatInkwellTable returns a string', () => {
    const output = formatInkwellTable(result, false)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  it('formatInkwellTable includes file names', () => {
    const output = formatInkwellTable(result, false)
    expect(output).toContain('test.ts')
  })

  it('formatInkwellTable verbose shows more detail', () => {
    const terse = formatInkwellTable(result, false)
    const verbose = formatInkwellTable(result, true)
    expect(verbose.length).toBeGreaterThanOrEqual(terse.length)
  })

  it('formatInkwellJson returns valid JSON', () => {
    const output = formatInkwellJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.strokes).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('formatInkwellTable shows recommendations', () => {
    const output = formatInkwellTable(result, false)
    expect(output).toContain('Recommendations')
  })

  it('formatInkwellTable handles empty strokes', () => {
    const empty: InkwellResult = {
      strokes: [], bottles: [],
      stats: {
        totalFiles: 0, totalBottles: 0,
        avgStrokeQuality: 0, avgInkDensity: 0, avgFlow: 0, avgPenmanship: 0, avgReadability: 0,
        masterworks: 0, fineCrafts: 0, scribbles: 0, illegibles: 0,
        totalBlemishes: 0, totalFlourishes: 0, totalInkBlots: 0, totalDrySpots: 0, totalSmudges: 0,
        overallInkQuality: 0, dominantInkColor: 'black',
        manuscriptCondition: 'damaged', penmanshipGrade: 'F',
        bestWrittenFile: 'none', worstWrittenFile: 'none',
      },
      recommendations: ['Ink quality is excellent - maintain current writing standards'],
    }
    const output = formatInkwellTable(empty, false)
    expect(output).toContain('No files analyzed')
  })
})

// ─── additional coverage ────────────────────────────────────────────────────

describe('additional coverage', () => {
  it('identifyFlourishes detects readonly properties', () => {
    expect(identifyFlourishes('export interface Config { readonly name: string }')).toContain('readonly-properties')
  })

  it('identifyBlemishes detects long lines', () => {
    const longLine = 'const x = '.padEnd(150, 'a')
    expect(identifyBlemishes(longLine)).toContain('long-lines')
  })

  it('identifyInkBlots detects deep nesting', () => {
    const deeplyNested = '    '.repeat(10) + 'const x = 1'
    expect(identifyInkBlots(deeplyNested)).toContain('deep-nesting')
  })

  it('identifyInkBlots detects loose inequality', () => {
    expect(identifyInkBlots('if (x != null)')).toContain('loose-inequality')
  })

  it('analyzeStroke handles code with exports', () => {
    const code = '/** Adds two numbers */\nexport function add(a: number, b: number): number {\n  if (a === 0) return b\n  return a + b\n}\n'
    const stroke = analyzeStroke(code, 'math.ts')
    expect(stroke.manuscript.paragraphs).toBeGreaterThan(0)
    expect(stroke.flourishes.length).toBeGreaterThan(0)
  })

  it('analyzeInkBottle determines dominant ink color', () => {
    const strokes: InkStroke[] = [
      { file: 'a.ts', strokeQuality: 80, inkDensity: 80, flow: 80, penmanship: 80, inkColor: 'gold', strokeType: 'bold', manuscript: { paragraphs: 1, sentences: 1, words: 1, punctuation: 0, avgSentenceLength: 1, avgParagraphCohesion: 50 }, blemishes: [], flourishes: [], inkBlots: [], drySpots: [], smudges: [], classification: 'masterwork', readabilityScore: 80 },
      { file: 'b.ts', strokeQuality: 40, inkDensity: 40, flow: 40, penmanship: 40, inkColor: 'blue', strokeType: 'light', manuscript: { paragraphs: 1, sentences: 1, words: 1, punctuation: 0, avgSentenceLength: 1, avgParagraphCohesion: 50 }, blemishes: [], flourishes: [], inkBlots: [], drySpots: [], smudges: [], classification: 'legible', readabilityScore: 40 },
    ]
    const bottle = analyzeInkBottle(strokes, 'src')
    expect(bottle.dominantInkColor).toBe('gold')
  })

  it('buildInkwellResult identifies best and worst written files', () => {
    const good = '/** Well documented */\nexport function calculate(x: number): number {\n  return x * 2\n}\n'
    const bad = 'var x=eval("1");console.log(x==1)'
    const result = buildInkwellResult(['good.ts', 'bad.ts'], [good, bad], {})
    expect(result.stats.bestWrittenFile).toBe('good.ts')
    expect(result.stats.worstWrittenFile).toBe('bad.ts')
  })

  it('classifyPenmanshipGrade returns correct boundary values', () => {
    expect(classifyPenmanshipGrade(80)).toBe('A')
    expect(classifyPenmanshipGrade(79)).toBe('B')
    expect(classifyPenmanshipGrade(60)).toBe('B')
    expect(classifyPenmanshipGrade(59)).toBe('C')
    expect(classifyPenmanshipGrade(40)).toBe('C')
    expect(classifyPenmanshipGrade(39)).toBe('D')
    expect(classifyPenmanshipGrade(20)).toBe('D')
    expect(classifyPenmanshipGrade(19)).toBe('F')
  })
})
