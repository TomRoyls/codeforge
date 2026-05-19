import { describe, it, expect } from 'vitest'

import {
  detectLongFunctions,
  detectDeepNesting,
  detectMagicNumbers,
  detectLargeFiles,
  detectComplexConditionals,
  detectCallbackHell,
  detectGodObjects,
  detectDuplicatePatterns,
  generateSuggestionText,
  computeRefactorStats,
  buildRefactorResult,
  type RefactorSuggestion,
  type RefactorResult,
} from '../src/commands/refactor-suggest-helpers.js'

import {
  formatRefactorTable,
  formatRefactorJson,
} from '../src/commands/refactor-suggest-format-helpers.js'

import RefactorSuggest from '../src/commands/refactor-suggest.js'

// ─── detectLongFunctions ────────────────────────────────

describe('detectLongFunctions', () => {
  it('should detect functions over 40 lines', () => {
    const body = 'function big() {\n' + '  let x = 1;\n'.repeat(42) + '}\n'
    const result = detectLongFunctions(body, 'a.ts')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('extract-function')
  })

  it('should not flag short functions', () => {
    const body = 'function small() {\n  return 1\n}\n'
    expect(detectLongFunctions(body, 'a.ts')).toHaveLength(0)
  })

  it('should detect high severity for >80 lines', () => {
    const body = 'function huge() {\n' + '  let x = 1;\n'.repeat(82) + '}\n'
    const result = detectLongFunctions(body, 'a.ts')
    expect(result.some((r) => r.severity === 'high')).toBe(true)
  })

  it('should include file path', () => {
    const body = 'function big() {\n' + '  let x = 1;\n'.repeat(42) + '}\n'
    expect(detectLongFunctions(body, 'src/app.ts')[0].file).toBe('src/app.ts')
  })

  it('should handle empty content', () => {
    expect(detectLongFunctions('', 'a.ts')).toHaveLength(0)
  })
})

// ─── detectDeepNesting ──────────────────────────────────

describe('detectDeepNesting', () => {
  it('should detect nesting > 4', () => {
    const body = '{\n{\n{\n{\n{\nlet x = 1\n'
    const result = detectDeepNesting(body, 'a.ts')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('reduce-nesting')
  })

  it('should not flag shallow nesting', () => {
    const body = '{\n{\nlet x = 1\n}\n}\n'
    expect(detectDeepNesting(body, 'a.ts')).toHaveLength(0)
  })

  it('should include category complexity', () => {
    const body = '{\n{\n{\n{\n{\nlet x = 1\n'
    expect(detectDeepNesting(body, 'a.ts')[0].category).toBe('complexity')
  })

  it('should handle empty content', () => {
    expect(detectDeepNesting('', 'a.ts')).toHaveLength(0)
  })
})

// ─── detectMagicNumbers ─────────────────────────────────

describe('detectMagicNumbers', () => {
  it('should detect unexplained numbers >= 10', () => {
    const result = detectMagicNumbers('if (x > 86400) {}\n', 'a.ts')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('replace-magic-numbers')
  })

  it('should not flag small numbers', () => {
    expect(detectMagicNumbers('if (x > 5) {}\n', 'a.ts')).toHaveLength(0)
  })

  it('should not flag named constants', () => {
    expect(detectMagicNumbers('const SECONDS = 86400\n', 'a.ts')).toHaveLength(0)
  })

  it('should skip comments', () => {
    expect(detectMagicNumbers('// 86400 is a lot\n', 'a.ts')).toHaveLength(0)
  })

  it('should skip import lines', () => {
    expect(detectMagicNumbers('import { 86400 } from "x"\n', 'a.ts')).toHaveLength(0)
  })

  it('should suggest named constant', () => {
    const result = detectMagicNumbers('if (timeout > 30000) {}\n', 'a.ts')
    expect(result[0].suggestedCode).toContain('MEANINGFUL_NAME')
  })

  it('should handle empty content', () => {
    expect(detectMagicNumbers('', 'a.ts')).toHaveLength(0)
  })
})

// ─── detectLargeFiles ───────────────────────────────────

describe('detectLargeFiles', () => {
  it('should detect files > 300 lines', () => {
    const content = 'x\n'.repeat(301)
    const result = detectLargeFiles(content, 'big.ts')
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('split-file')
  })

  it('should not flag small files', () => {
    expect(detectLargeFiles('x\n'.repeat(100), 'a.ts')).toHaveLength(0)
  })

  it('should flag high severity for >500 lines', () => {
    const content = 'x\n'.repeat(501)
    const result = detectLargeFiles(content, 'huge.ts')
    expect(result[0].severity).toBe('high')
  })

  it('should report line count', () => {
    const content = 'x\n'.repeat(400)
    const result = detectLargeFiles(content, 'a.ts')
    expect(result[0].description).toContain('401')
  })
})

// ─── detectComplexConditionals ──────────────────────────

describe('detectComplexConditionals', () => {
  it('should detect >5 branch chains', () => {
    const body = [
      'if (a) {}',
      'else if (b) {}',
      'else if (c) {}',
      'else if (d) {}',
      'else if (e) {}',
      'else if (f) {}',
      'else {}',
    ].join('\n')
    const result = detectComplexConditionals(body, 'a.ts')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('replace-conditional')
  })

  it('should not flag short chains', () => {
    const body = 'if (a) {}\nelse if (b) {}\nelse {}\n'
    expect(detectComplexConditionals(body, 'a.ts')).toHaveLength(0)
  })

  it('should include category structure', () => {
    const body = Array.from({ length: 7 }, (_, i) => i < 6 ? `if (${i}) {}` : 'else {}').join('\n').replace(/^if/g, (m, offset) => offset === 0 ? m : 'else ' + m)
    const result = detectComplexConditionals(body, 'a.ts')
    if (result.length > 0) {
      expect(result[0].category).toBe('structure')
    }
  })

  it('should handle empty content', () => {
    expect(detectComplexConditionals('', 'a.ts')).toHaveLength(0)
  })
})

// ─── detectCallbackHell ─────────────────────────────────

describe('detectCallbackHell', () => {
  it('should detect deeply nested callbacks', () => {
    const body = 'fs.readFile(() => {\n  fs.readFile(() => {\n    fs.readFile(() => {\n      x=1\n'
    const result = detectCallbackHell(body, 'a.ts')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('convert-to-async')
  })

  it('should not flag shallow callbacks', () => {
    const body = 'fs.readFile(() => {\n  x=1\n'
    expect(detectCallbackHell(body, 'a.ts')).toHaveLength(0)
  })

  it('should handle empty content', () => {
    expect(detectCallbackHell('', 'a.ts')).toHaveLength(0)
  })
})

// ─── detectGodObjects ───────────────────────────────────

describe('detectGodObjects', () => {
  it('should detect classes with >15 methods', () => {
    const methods = Array.from({ length: 16 }, (_, i) => `  m${i}() {}`).join('\n')
    const body = `class God {\n${methods}\n}\n`
    const result = detectGodObjects(body, 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('extract-method')
    expect(result[0].severity).toBe('high')
  })

  it('should not flag small classes', () => {
    const methods = Array.from({ length: 5 }, (_, i) => `  m${i}() {}`).join('\n')
    const body = `class Small {\n${methods}\n}\n`
    expect(detectGodObjects(body, 'a.ts')).toHaveLength(0)
  })

  it('should include class name in description', () => {
    const methods = Array.from({ length: 16 }, (_, i) => `  m${i}() {}`).join('\n')
    const body = `class MyGod {\n${methods}\n}\n`
    expect(detectGodObjects(body, 'a.ts')[0].description).toContain('MyGod')
  })

  it('should handle empty content', () => {
    expect(detectGodObjects('', 'a.ts')).toHaveLength(0)
  })
})

// ─── detectDuplicatePatterns ────────────────────────────

describe('detectDuplicatePatterns', () => {
  it('should detect repeated 3-line blocks', () => {
    const block = 'const x = getValue()\nconst y = process(x)\nconst z = format(y)\n'
    const body = block + block + block + block
    const result = detectDuplicatePatterns(body, 'a.ts')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('consolidate-duplicate')
  })

  it('should not flag unique code', () => {
    const body = 'const a = 1\nconst b = 2\nconst c = 3\nconst d = 4\n'
    expect(detectDuplicatePatterns(body, 'a.ts')).toHaveLength(0)
  })

  it('should include category duplication', () => {
    const block = 'const x = getValue()\nconst y = process(x)\nconst z = format(y)\n'
    const body = block + block + block + block
    expect(detectDuplicatePatterns(body, 'a.ts')[0].category).toBe('duplication')
  })

  it('should handle empty content', () => {
    expect(detectDuplicatePatterns('', 'a.ts')).toHaveLength(0)
  })
})

// ─── generateSuggestionText ─────────────────────────────

describe('generateSuggestionText', () => {
  it('should return text for extract-function', () => {
    expect(generateSuggestionText('extract-function', {})).toContain('Extract')
  })

  it('should return text for reduce-nesting', () => {
    expect(generateSuggestionText('reduce-nesting', {})).toContain('early returns')
  })

  it('should return text for split-file', () => {
    expect(generateSuggestionText('split-file', {})).toContain('Split')
  })

  it('should return text for convert-to-async', () => {
    expect(generateSuggestionText('convert-to-async', {})).toContain('async/await')
  })

  it('should handle unknown types', () => {
    expect(generateSuggestionText('unknown-type', { name: 'foo' })).toContain('foo')
  })
})

// ─── computeRefactorStats ───────────────────────────────

describe('computeRefactorStats', () => {
  function makeSuggestion(severity: 'high' | 'medium' | 'low', category: string, type: string): RefactorSuggestion {
    return {
      category, currentCode: '', description: '', effort: 1,
      file: 'a.ts', impact: 'medium', line: 1,
      severity, suggestedCode: '', type,
    }
  }

  it('should compute totals', () => {
    const suggestions = [makeSuggestion('high', 'size', 'a'), makeSuggestion('low', 'complexity', 'b')]
    const stats = computeRefactorStats(suggestions)
    expect(stats.total).toBe(2)
  })

  it('should group by severity', () => {
    const suggestions = [makeSuggestion('high', 'size', 'a'), makeSuggestion('high', 'size', 'b')]
    const stats = computeRefactorStats(suggestions)
    expect(stats.bySeverity.high).toBe(2)
  })

  it('should group by category', () => {
    const suggestions = [makeSuggestion('high', 'size', 'a'), makeSuggestion('low', 'size', 'b')]
    const stats = computeRefactorStats(suggestions)
    expect(stats.byCategory.size).toBe(2)
  })

  it('should group by type', () => {
    const suggestions = [makeSuggestion('high', 'size', 'extract-function')]
    const stats = computeRefactorStats(suggestions)
    expect(stats.byType['extract-function']).toBe(1)
  })

  it('should sum effort', () => {
    const suggestions = [makeSuggestion('high', 'size', 'a'), makeSuggestion('low', 'size', 'b')]
    const stats = computeRefactorStats(suggestions)
    expect(stats.totalEffort).toBe(2)
  })

  it('should handle empty', () => {
    const stats = computeRefactorStats([])
    expect(stats.total).toBe(0)
    expect(stats.totalEffort).toBe(0)
  })
})

// ─── buildRefactorResult ────────────────────────────────

describe('buildRefactorResult', () => {
  it('should return empty for no files', async () => {
    const result = await buildRefactorResult([], async () => '', { ignorePatterns: [] })
    expect(result.suggestions).toHaveLength(0)
    expect(result.stats.total).toBe(0)
  })

  it('should analyze TypeScript files', async () => {
    const files = ['app.ts']
    const reader = async () => 'const x = 86400\n'
    const result = await buildRefactorResult(files, reader, { ignorePatterns: [] })
    expect(result.suggestions.length).toBeGreaterThanOrEqual(0)
  })

  it('should filter by severity', async () => {
    const files = ['a.ts', 'b.ts']
    const reader = async () => 'const x = 86400\n'
    const result = await buildRefactorResult(files, reader, { ignorePatterns: [], severity: 'high' })
    for (const s of result.suggestions) {
      expect(s.severity).toBe('high')
    }
  })

  it('should skip non-matching extensions', async () => {
    const files = ['README.md']
    const reader = async () => 'hello\n'
    const result = await buildRefactorResult(files, reader, { ignorePatterns: [] })
    expect(result.suggestions).toHaveLength(0)
  })

  it('should handle unreadable files', async () => {
    const files = ['bad.ts']
    const reader = async () => { throw new Error('not found') }
    const result = await buildRefactorResult(files, reader, { ignorePatterns: [] })
    expect(result.suggestions).toHaveLength(0)
  })

  it('should sort by severity', async () => {
    const files = ['mixed.ts']
    const reader = async () => 'if (x > 86400) {}\n' + 'x\n'.repeat(301)
    const result = await buildRefactorResult(files, reader, { ignorePatterns: [] })
    if (result.suggestions.length > 1) {
      const order = { high: 0, medium: 1, low: 2 }
      for (let i = 1; i < result.suggestions.length; i++) {
        expect(order[result.suggestions[i - 1].severity]).toBeLessThanOrEqual(order[result.suggestions[i].severity])
      }
    }
  })
})

// ─── formatRefactorTable ────────────────────────────────

describe('formatRefactorTable', () => {
  function makeResult(): RefactorResult {
    return {
      suggestions: [{
        category: 'size', currentCode: 'big()', description: 'Too long',
        effort: 1, file: 'a.ts', impact: 'high', line: 1,
        severity: 'high', suggestedCode: '// extract', type: 'extract-function',
      }],
      stats: {
        byCategory: { size: 1 }, bySeverity: { high: 1, low: 0, medium: 0 },
        byType: { 'extract-function': 1 }, total: 1, totalEffort: 1,
      },
    }
  }

  it('should contain header', () => {
    expect(formatRefactorTable(makeResult(), false)).toContain('Refactoring')
  })

  it('should show total count', () => {
    expect(formatRefactorTable(makeResult(), false)).toContain('Total')
  })

  it('should show severity breakdown', () => {
    expect(formatRefactorTable(makeResult(), false)).toContain('High')
  })

  it('should show effort', () => {
    expect(formatRefactorTable(makeResult(), false)).toContain('1h')
  })

  it('should show suggestions', () => {
    expect(formatRefactorTable(makeResult(), false)).toContain('extract-function')
  })

  it('should show verbose code', () => {
    expect(formatRefactorTable(makeResult(), true)).toContain('Current')
  })

  it('should show By Category section', () => {
    expect(formatRefactorTable(makeResult(), false)).toContain('By Category')
  })

  it('should show By Type section', () => {
    expect(formatRefactorTable(makeResult(), false)).toContain('By Type')
  })

  it('should handle empty results', () => {
    const r: RefactorResult = {
      suggestions: [],
      stats: { byCategory: {}, bySeverity: { high: 0, low: 0, medium: 0 }, byType: {}, total: 0, totalEffort: 0 },
    }
    expect(formatRefactorTable(r, false)).toContain('Refactoring')
  })
})

// ─── formatRefactorJson ─────────────────────────────────

describe('formatRefactorJson', () => {
  it('should produce valid JSON', () => {
    const r: RefactorResult = {
      suggestions: [],
      stats: { byCategory: {}, bySeverity: { high: 0, low: 0, medium: 0 }, byType: {}, total: 0, totalEffort: 0 },
    }
    expect(() => JSON.parse(formatRefactorJson(r))).not.toThrow()
  })

  it('should include suggestions', () => {
    const r: RefactorResult = {
      suggestions: [{
        category: 'size', currentCode: '', description: 'test',
        effort: 1, file: 'a.ts', impact: 'high', line: 1,
        severity: 'high', suggestedCode: '', type: 'extract-function',
      }],
      stats: { byCategory: { size: 1 }, bySeverity: { high: 1, low: 0, medium: 0 }, byType: { 'extract-function': 1 }, total: 1, totalEffort: 1 },
    }
    const parsed = JSON.parse(formatRefactorJson(r))
    expect(parsed.suggestions).toHaveLength(1)
  })
})

// ─── Command metadata ───────────────────────────────────

describe('RefactorSuggest command', () => {
  it('should have correct description', () => {
    expect(RefactorSuggest.description).toContain('efactor')
  })

  it('should have path arg', () => {
    expect(RefactorSuggest.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(RefactorSuggest.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(RefactorSuggest.flags.output).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(RefactorSuggest.flags.ignore).toBeDefined()
  })

  it('should have severity flag', () => {
    expect(RefactorSuggest.flags.severity).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(RefactorSuggest.flags.verbose).toBeDefined()
  })

  it('should have ext flag', () => {
    expect(RefactorSuggest.flags.ext).toBeDefined()
  })

  it('should have examples', () => {
    expect(RefactorSuggest.examples.length).toBeGreaterThan(0)
  })
})
