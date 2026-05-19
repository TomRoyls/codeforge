import { describe, expect, it } from 'vitest'

import Style from '../src/commands/style.js'
import {
  analyzeFileStyle,
  buildStyleResult,
  computeConsistency,
  computeDominantStyle,
  detectBraceStyle,
  detectIndentation,
  detectQuotes,
  detectSemicolons,
  detectTrailingCommas,
  type FileStyle,
  stripComments,
  type StyleChoice,
  type StyleConsistency,
  type StyleResult,
} from '../src/commands/style-helpers.js'
import { formatFileStyle, formatStyleJson, formatStyleTable } from '../src/commands/style-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeFileStyle(overrides: Partial<FileStyle> = {}): FileStyle {
  return {
    avgLineLength: 40,
    consistency: 80,
    emptyLines: 5,
    filePath: 'test.ts',
    linesAnalyzed: 20,
    longLines: 0,
    maxLineLength: 80,
    style: {
      braceStyle: 'same-line',
      indentation: 'spaces-2',
      quotes: 'single',
      semicolons: 'always',
      trailingCommas: 'always',
    },
    ...overrides,
  }
}

function makeStyleChoice(overrides: Partial<StyleChoice> = {}): StyleChoice {
  return {
    braceStyle: 'same-line',
    indentation: 'spaces-2',
    quotes: 'single',
    semicolons: 'always',
    trailingCommas: 'always',
    ...overrides,
  }
}

function makeStyleResult(overrides: Partial<StyleResult> = {}): StyleResult {
  return {
    avgLineLength: 40,
    consistency: {
      braceStyle: 100,
      indentation: 100,
      lineLength: 100,
      overall: 100,
      quotes: 100,
      semicolons: 100,
      trailingCommas: 100,
    },
    dominant: makeStyleChoice(),
    files: [makeFileStyle()],
    lineLengthViolationPercentage: 0,
    lineLengthViolations: 0,
    totalFiles: 1,
    totalLines: 20,
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Style command - static metadata', () => {
  it('has a description', () => {
    expect(Style.description).toBe('Analyze code style consistency')
  })

  it('has examples array', () => {
    expect(Array.isArray(Style.examples)).toBe(true)
    expect(Style.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Style.args.path).toBeDefined()
    expect(Style.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Style.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Style command - flags', () => {
  it('has format flag with options', () => {
    expect(Style.flags.format.options).toContain('json')
    expect(Style.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(Style.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Style.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Style.flags.ignore).toBeDefined()
    expect(Style.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag with default', () => {
    expect(Style.flags.ext).toBeDefined()
    expect(Style.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has verbose flag defaulting to false', () => {
    expect(Style.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Style command - class structure', () => {
  it('exports a default class', () => {
    expect(Style).toBeDefined()
    expect(typeof Style).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Style.prototype.run).toBe('function')
  })
})

// ─── detectIndentation ──────────────────────────────────

describe('detectIndentation', () => {
  it('detects tabs', () => {
    const content = 'const x = 1\n\tconst y = 2\n\t\tconst z = 3'
    expect(detectIndentation(content)).toBe('tabs')
  })

  it('detects spaces-2', () => {
    const content = 'const x = 1\n  const y = 2\n    const z = 3'
    expect(detectIndentation(content)).toBe('spaces-2')
  })

  it('detects spaces-4', () => {
    const content = 'const x = 1\n    const y = 2\n        const z = 3'
    expect(detectIndentation(content)).toBe('spaces-4')
  })

  it('detects mixed indentation', () => {
    const content = 'const x = 1\n  const y = 2\n\t\tconst z = 3'
    expect(detectIndentation(content)).toBe('mixed')
  })

  it('returns unknown for empty content', () => {
    expect(detectIndentation('')).toBe('unknown')
  })

  it('returns unknown for no indented lines', () => {
    expect(detectIndentation('const x = 1\nconst y = 2')).toBe('unknown')
  })

  it('handles single indented line with tabs', () => {
    expect(detectIndentation('\tconst x = 1')).toBe('tabs')
  })

  it('handles 8-space indent as spaces-4', () => {
    const content = 'if (true) {\n        const x = 1\n}'
    expect(detectIndentation(content)).toBe('spaces-4')
  })
})

// ─── detectQuotes ───────────────────────────────────────

describe('detectQuotes', () => {
  it('detects single quotes', () => {
    const content = "const x = 'hello'\nconst y = 'world'"
    expect(detectQuotes(content)).toBe('single')
  })

  it('detects double quotes', () => {
    const content = 'const x = "hello"\nconst y = "world"'
    expect(detectQuotes(content)).toBe('double')
  })

  it('detects backticks', () => {
    const content = 'const x = `hello`\nconst y = `world`'
    expect(detectQuotes(content)).toBe('backtick')
  })

  it('detects mixed quotes', () => {
    const content = "const x = 'hello'\nconst y = \"world\""
    expect(detectQuotes(content)).toBe('mixed')
  })

  it('returns unknown for no strings', () => {
    expect(detectQuotes('const x = 1')).toBe('unknown')
  })

  it('ignores quotes in comments', () => {
    const content = "const x = 'hello' // 'comment'"
    expect(detectQuotes(content)).toBe('single')
  })

  it('handles escaped quotes', () => {
    const content = "const x = 'it\\'s here'"
    expect(detectQuotes(content)).toBe('single')
  })
})

// ─── stripComments ──────────────────────────────────────

describe('stripComments', () => {
  it('removes line comments', () => {
    expect(stripComments('const x = 1 // comment')).toBe('const x = 1 ')
  })

  it('removes block comments', () => {
    expect(stripComments('const x = /* note */ 1')).toBe('const x =  1')
  })

  it('removes multi-line block comments', () => {
    const input = '/*\n * comment\n */\nconst x = 1'
    expect(stripComments(input)).toBe('\nconst x = 1')
  })
})

// ─── detectSemicolons ───────────────────────────────────

describe('detectSemicolons', () => {
  it('detects always', () => {
    const content = 'const x = 1;\nconst y = 2;\nconst z = 3;'
    expect(detectSemicolons(content)).toBe('always')
  })

  it('detects never', () => {
    const content = 'const x = 1\nconst y = 2\nconst z = 3'
    expect(detectSemicolons(content)).toBe('never')
  })

  it('detects mixed', () => {
    const content = 'const x = 1;\nconst y = 2\nconst z = 3;'
    expect(detectSemicolons(content)).toBe('mixed')
  })

  it('returns unknown for no statements', () => {
    expect(detectSemicolons('')).toBe('unknown')
  })

  it('skips comment lines', () => {
    const content = '// comment\nconst x = 1;'
    expect(detectSemicolons(content)).toBe('always')
  })

  it('skips import/export lines', () => {
    const content = "import { x } from 'y'\nconst z = 1;"
    expect(detectSemicolons(content)).toBe('always')
  })

  it('skips function/class declarations without semicolons', () => {
    const content = 'function foo() {\n  return 1;\n}\nclass Bar {}'
    expect(detectSemicolons(content)).toBe('always')
  })
})

// ─── detectTrailingCommas ───────────────────────────────

describe('detectTrailingCommas', () => {
  it('detects always with trailing commas', () => {
    const content = 'const x = [\n  1,\n  2,\n  3,\n]'
    expect(detectTrailingCommas(content)).toBe('always')
  })

  it('detects never without trailing commas', () => {
    const content = 'const x = [\n  1,\n  2,\n  3\n]'
    expect(detectTrailingCommas(content)).toBe('never')
  })

  it('returns unknown for no commas', () => {
    expect(detectTrailingCommas('const x = 1')).toBe('unknown')
  })

  it('returns mixed for partially trailing', () => {
    const content = 'const a = [\n  1,\n  2,\n]\nconst b = {\nx: 1\n}'
    expect(detectTrailingCommas(content)).toBe('mixed')
  })
})

// ─── detectBraceStyle ───────────────────────────────────

describe('detectBraceStyle', () => {
  it('detects same-line', () => {
    const content = 'function foo() {\n  return 1\n}\nif (x) {\n  y()\n}'
    expect(detectBraceStyle(content)).toBe('same-line')
  })

  it('detects next-line', () => {
    const content = 'function foo()\n{\n  return 1\n}\nif (x)\n{\n  y()\n}'
    expect(detectBraceStyle(content)).toBe('next-line')
  })

  it('detects mixed brace style', () => {
    const content = 'function foo() {\n  return 1\n}\nfunction bar()\n{\n  return 2\n}'
    expect(detectBraceStyle(content)).toBe('mixed')
  })

  it('returns unknown for no braces', () => {
    expect(detectBraceStyle('const x = 1')).toBe('unknown')
  })

  it('detects same-line with else', () => {
    const content = 'if (x) {\n  y()\n} else {\n  z()\n}'
    expect(detectBraceStyle(content)).toBe('same-line')
  })

  it('detects class brace style', () => {
    const content = 'class Foo {\n  constructor() {}\n}'
    expect(detectBraceStyle(content)).toBe('same-line')
  })
})

// ─── analyzeFileStyle ───────────────────────────────────

describe('analyzeFileStyle', () => {
  it('detects correct style', () => {
    const content = "const x = 'hello';\nconst y = 'world';"
    const result = analyzeFileStyle(content, 'test.ts')
    expect(result.style.semicolons).toBe('always')
    expect(result.style.quotes).toBe('single')
  })

  it('counts lines correctly', () => {
    const content = 'line 1\nline 2\nline 3'
    const result = analyzeFileStyle(content, 'test.ts')
    expect(result.linesAnalyzed).toBe(3)
  })

  it('detects long lines', () => {
    const longLine = 'x'.repeat(150)
    const content = `short\n${longLine}\nshort`
    const result = analyzeFileStyle(content, 'test.ts')
    expect(result.longLines).toBe(1)
    expect(result.maxLineLength).toBe(150)
  })

  it('counts empty lines', () => {
    const content = 'line 1\n\nline 2\n\n'
    const result = analyzeFileStyle(content, 'test.ts')
    expect(result.emptyLines).toBe(3)
  })

  it('computes avg line length', () => {
    const content = '1234\n12345678'
    const result = analyzeFileStyle(content, 'test.ts')
    expect(result.avgLineLength).toBe(6)
  })

  it('returns filePath correctly', () => {
    const result = analyzeFileStyle('const x = 1', 'foo/bar.ts')
    expect(result.filePath).toBe('foo/bar.ts')
  })

  it('computes consistency score', () => {
    const content = "const x = 'hello';\nconst y = 'world';"
    const result = analyzeFileStyle(content, 'test.ts')
    expect(result.consistency).toBeGreaterThanOrEqual(0)
    expect(result.consistency).toBeLessThanOrEqual(100)
  })

  it('handles empty file', () => {
    const result = analyzeFileStyle('', 'empty.ts')
    expect(result.linesAnalyzed).toBe(1)
    expect(result.emptyLines).toBe(1)
  })
})

// ─── computeDominantStyle ───────────────────────────────

describe('computeDominantStyle', () => {
  it('finds correct majority', () => {
    const files = [
      makeFileStyle({ style: makeStyleChoice({ indentation: 'tabs' }) }),
      makeFileStyle({ style: makeStyleChoice({ indentation: 'tabs' }) }),
      makeFileStyle({ style: makeStyleChoice({ indentation: 'spaces-2' }) }),
    ]
    const dominant = computeDominantStyle(files)
    expect(dominant.indentation).toBe('tabs')
  })

  it('handles tie-breaking', () => {
    const files = [
      makeFileStyle({ style: makeStyleChoice({ quotes: 'single' }) }),
      makeFileStyle({ style: makeStyleChoice({ quotes: 'double' }) }),
    ]
    const dominant = computeDominantStyle(files)
    expect(['single', 'double']).toContain(dominant.quotes)
  })

  it('returns unknown for empty files', () => {
    const dominant = computeDominantStyle([])
    expect(dominant.indentation).toBe('unknown')
    expect(dominant.quotes).toBe('unknown')
    expect(dominant.semicolons).toBe('unknown')
  })

  it('finds dominant quotes', () => {
    const files = [
      makeFileStyle({ style: makeStyleChoice({ quotes: 'single' }) }),
      makeFileStyle({ style: makeStyleChoice({ quotes: 'single' }) }),
      makeFileStyle({ style: makeStyleChoice({ quotes: 'single' }) }),
    ]
    const dominant = computeDominantStyle(files)
    expect(dominant.quotes).toBe('single')
  })

  it('finds dominant braceStyle', () => {
    const files = [
      makeFileStyle({ style: makeStyleChoice({ braceStyle: 'next-line' }) }),
      makeFileStyle({ style: makeStyleChoice({ braceStyle: 'next-line' }) }),
    ]
    const dominant = computeDominantStyle(files)
    expect(dominant.braceStyle).toBe('next-line')
  })
})

// ─── computeConsistency ─────────────────────────────────

describe('computeConsistency', () => {
  it('returns 100% for fully consistent', () => {
    const style = makeStyleChoice()
    const files = [makeFileStyle({ style }), makeFileStyle({ style })]
    const dominant = makeStyleChoice()
    const consistency = computeConsistency(files, dominant)
    expect(consistency.indentation).toBe(100)
    expect(consistency.quotes).toBe(100)
    expect(consistency.semicolons).toBe(100)
  })

  it('returns 0 for fully inconsistent', () => {
    const files = [
      makeFileStyle({
        style: makeStyleChoice({
          braceStyle: 'next-line',
          indentation: 'tabs',
          quotes: 'double',
          semicolons: 'never',
          trailingCommas: 'never',
        }),
      }),
    ]
    const dominant = makeStyleChoice()
    const consistency = computeConsistency(files, dominant)
    expect(consistency.indentation).toBe(0)
    expect(consistency.quotes).toBe(0)
    expect(consistency.semicolons).toBe(0)
  })

  it('returns partial consistency', () => {
    const style1 = makeStyleChoice()
    const style2 = makeStyleChoice({ indentation: 'tabs' })
    const files = [makeFileStyle({ style: style1 }), makeFileStyle({ style: style2 })]
    const dominant = makeStyleChoice()
    const consistency = computeConsistency(files, dominant)
    expect(consistency.indentation).toBe(50)
  })

  it('handles empty files array', () => {
    const dominant = makeStyleChoice()
    const consistency = computeConsistency([], dominant)
    expect(consistency.overall).toBe(0)
  })

  it('returns overall as weighted average', () => {
    const style = makeStyleChoice()
    const files = [makeFileStyle({ style }), makeFileStyle({ style })]
    const dominant = makeStyleChoice()
    const consistency = computeConsistency(files, dominant)
    expect(consistency.overall).toBeGreaterThanOrEqual(0)
    expect(consistency.overall).toBeLessThanOrEqual(100)
  })

  it('computes lineLength score', () => {
    const files = [
      makeFileStyle({ linesAnalyzed: 100, longLines: 0 }),
      makeFileStyle({ linesAnalyzed: 100, longLines: 10 }),
    ]
    const dominant = makeStyleChoice()
    const consistency = computeConsistency(files, dominant)
    expect(consistency.lineLength).toBe(50)
  })
})

// ─── buildStyleResult ───────────────────────────────────

describe('buildStyleResult', () => {
  it('builds full result', () => {
    const files = [
      makeFileStyle({
        avgLineLength: 30,
        filePath: 'a.ts',
        linesAnalyzed: 10,
        longLines: 0,
      }),
      makeFileStyle({
        avgLineLength: 50,
        filePath: 'b.ts',
        linesAnalyzed: 20,
        longLines: 1,
      }),
    ]
    const result = buildStyleResult(files)
    expect(result.totalFiles).toBe(2)
    expect(result.totalLines).toBe(30)
    expect(result.lineLengthViolations).toBe(1)
    expect(result.dominant.indentation).toBe('spaces-2')
  })

  it('handles empty results', () => {
    const result = buildStyleResult([])
    expect(result.totalFiles).toBe(0)
    expect(result.totalLines).toBe(0)
    expect(result.dominant.indentation).toBe('unknown')
  })

  it('computes avgLineLength', () => {
    const files = [
      makeFileStyle({ avgLineLength: 20, linesAnalyzed: 10 }),
      makeFileStyle({ avgLineLength: 40, linesAnalyzed: 10 }),
    ]
    const result = buildStyleResult(files)
    expect(result.avgLineLength).toBe(30)
  })

  it('computes lineLengthViolationPercentage', () => {
    const files = [
      makeFileStyle({ linesAnalyzed: 100, longLines: 5 }),
    ]
    const result = buildStyleResult(files)
    expect(result.lineLengthViolationPercentage).toBe(5)
  })
})

// ─── formatStyleTable ───────────────────────────────────

describe('formatStyleTable', () => {
  it('includes dominant style section', () => {
    const result = makeStyleResult()
    const output = formatStyleTable(result, false)
    expect(output).toContain('Dominant Style')
    expect(output).toContain('Indentation')
    expect(output).toContain('Quotes')
    expect(output).toContain('Semicolons')
  })

  it('includes consistency section', () => {
    const result = makeStyleResult()
    const output = formatStyleTable(result, false)
    expect(output).toContain('Consistency Scores')
    expect(output).toContain('Overall')
  })

  it('includes line length section', () => {
    const result = makeStyleResult()
    const output = formatStyleTable(result, false)
    expect(output).toContain('Line Length')
    expect(output).toContain('Total lines')
  })

  it('shows per-file breakdown when verbose', () => {
    const result = makeStyleResult()
    const output = formatStyleTable(result, true)
    expect(output).toContain('Per-File Breakdown')
    expect(output).toContain('test.ts')
  })

  it('hides per-file breakdown when not verbose', () => {
    const result = makeStyleResult()
    const output = formatStyleTable(result, false)
    expect(output).not.toContain('Per-File Breakdown')
  })

  it('shows files analyzed count', () => {
    const result = makeStyleResult()
    const output = formatStyleTable(result, false)
    expect(output).toContain('Files analyzed')
  })
})

// ─── formatStyleJson ────────────────────────────────────

describe('formatStyleJson', () => {
  it('produces valid JSON', () => {
    const result = makeStyleResult()
    const output = formatStyleJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalFiles).toBe(result.totalFiles)
    expect(parsed.totalLines).toBe(result.totalLines)
  })

  it('includes all fields', () => {
    const result = makeStyleResult()
    const output = formatStyleJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('dominant')
    expect(parsed).toHaveProperty('consistency')
    expect(parsed).toHaveProperty('files')
    expect(parsed).toHaveProperty('avgLineLength')
    expect(parsed).toHaveProperty('lineLengthViolations')
  })

  it('is pretty-printed', () => {
    const result = makeStyleResult()
    const output = formatStyleJson(result)
    expect(output).toContain('\n')
    expect(output).toContain('  ')
  })
})

// ─── formatFileStyle ────────────────────────────────────

describe('formatFileStyle', () => {
  it('includes file path', () => {
    const file = makeFileStyle()
    const output = formatFileStyle(file)
    expect(output).toContain('test.ts')
  })

  it('includes style info', () => {
    const file = makeFileStyle()
    const output = formatFileStyle(file)
    expect(output).toContain('spaces-2')
    expect(output).toContain('single')
    expect(output).toContain('always')
  })

  it('includes consistency', () => {
    const file = makeFileStyle()
    const output = formatFileStyle(file)
    expect(output).toContain('80%')
  })
})
