import { describe, it, expect, beforeEach } from 'vitest'

import {
  resetCounter,
  checkNoTypeAssertion,
  checkNoTsIgnore,
  checkNoEmptyCatch,
  checkNoConsoleLog,
  checkMaxComplexity,
  checkMaxFileLength,
  checkMaxFunctionLength,
  checkMaxNesting,
  checkNoMagicNumbers,
  checkRequireJsdoc,
  checkNoAnyType,
  checkNoVar,
  checkPreferConst,
  checkNoHardcodedStrings,
  checkConsistentReturn,
  computeFileScore,
  computeGrade,
  estimateFixTime,
  reviewFile,
  generateRecommendations,
  buildReviewResult,
  type ReviewFinding,
  type ReviewStats,
} from '../src/commands/review-helpers.js'

import {
  formatFindingsTable,
  formatFileGrades,
  formatCategoryBreakdown,
  formatTopIssues,
  formatStatsLine,
  formatRecommendations,
  formatReviewResultTable,
  formatReviewJson,
  formatReviewCsv,
} from '../src/commands/review-format-helpers.js'

beforeEach(() => { resetCounter() })

// ─── checkNoTypeAssertion ─────────────────────────────────────────────────────

describe('checkNoTypeAssertion', () => {
  it('finds as any', () => {
    const findings = checkNoTypeAssertion('const x = y as any', 'app.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.rule).toBe('no-type-assertion')
    expect(findings[0]!.severity).toBe('error')
    expect(findings[0]!.line).toBe(1)
  })

  it('finds multiple as any on different lines', () => {
    const code = 'const a = b as any\nconst c = d as any'
    const findings = checkNoTypeAssertion(code, 'app.ts')
    expect(findings.length).toBe(2)
    expect(findings[0]!.line).toBe(1)
    expect(findings[1]!.line).toBe(2)
  })

  it('ignores safe code', () => {
    expect(checkNoTypeAssertion('const x: string = "hi"', 'app.ts')).toEqual([])
  })
})

// ─── checkNoTsIgnore ──────────────────────────────────────────────────────────

describe('checkNoTsIgnore', () => {
  it('finds @ts-ignore', () => {
    const findings = checkNoTsIgnore('// @ts-ignore\nconst x = 1', 'a.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.rule).toBe('no-ts-ignore')
    expect(findings[0]!.severity).toBe('error')
  })

  it('finds @ts-expect-error', () => {
    const findings = checkNoTsIgnore('// @ts-expect-error\nconst x = 1', 'a.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.message).toContain('ts-expect-error')
  })

  it('ignores normal comments', () => {
    expect(checkNoTsIgnore('// regular comment', 'a.ts')).toEqual([])
  })
})

// ─── checkNoEmptyCatch ────────────────────────────────────────────────────────

describe('checkNoEmptyCatch', () => {
  it('finds empty catch on single line', () => {
    const findings = checkNoEmptyCatch('try { foo() } catch (e) { }', 'a.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.rule).toBe('no-empty-catch')
    expect(findings[0]!.severity).toBe('warning')
  })

  it('ignores catch with code', () => {
    expect(checkNoEmptyCatch('try { foo() } catch (e) { handleError(e) }', 'a.ts')).toEqual([])
  })
})

// ─── checkNoConsoleLog ────────────────────────────────────────────────────────

describe('checkNoConsoleLog', () => {
  it('finds console.log in source files', () => {
    const findings = checkNoConsoleLog('console.log("debug")', 'app.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.rule).toBe('no-console-log')
    expect(findings[0]!.severity).toBe('warning')
  })

  it('ignores console.log in test files', () => {
    expect(checkNoConsoleLog('console.log("debug")', 'app.test.ts')).toEqual([])
  })

  it('ignores console.log in spec files', () => {
    expect(checkNoConsoleLog('console.log("debug")', 'app.spec.ts')).toEqual([])
  })

  it('ignores console.log in __tests__', () => {
    expect(checkNoConsoleLog('console.log("debug")', '__tests__/foo.ts')).toEqual([])
  })
})

// ─── checkMaxFileLength ───────────────────────────────────────────────────────

describe('checkMaxFileLength', () => {
  it('flags files over 400 lines', () => {
    const content = Array(401).fill('x').join('\n')
    const findings = checkMaxFileLength(content, 'big.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.rule).toBe('max-file-length')
    expect(findings[0]!.message).toContain('401')
  })

  it('allows files at 400 lines', () => {
    const content = Array(400).fill('x').join('\n')
    expect(checkMaxFileLength(content, 'ok.ts')).toEqual([])
  })

  it('allows short files', () => {
    expect(checkMaxFileLength('const x = 1', 'sm.ts')).toEqual([])
  })
})

// ─── checkMaxNesting ──────────────────────────────────────────────────────────

describe('checkMaxNesting', () => {
  it('flags nesting > 4', () => {
    const code = 'function f() {\nif(a){if(b){if(c){if(d){if(e){\n}}}}}\n}'
    const findings = checkMaxNesting(code, 'a.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.rule).toBe('max-nesting')
  })

  it('allows nesting <= 4', () => {
    expect(checkMaxNesting('if(a){if(b){if(c){}}}', 'a.ts')).toEqual([])
  })
})

// ─── checkNoMagicNumbers ──────────────────────────────────────────────────────

describe('checkNoMagicNumbers', () => {
  it('finds magic numbers', () => {
    const findings = checkNoMagicNumbers('const x = 42', 'a.ts')
    expect(findings.some((f) => f.message.includes('42'))).toBe(true)
  })

  it('excludes common numbers 0, 1, -1, 2', () => {
    const findings = checkNoMagicNumbers('const x = 0\nconst y = 1\nconst z = -1\nconst w = 2', 'a.ts')
    expect(findings).toEqual([])
  })

  it('ignores comment lines', () => {
    expect(checkNoMagicNumbers('// the answer is 42', 'a.ts')).toEqual([])
  })

  it('finds negative magic numbers beyond -1', () => {
    const findings = checkNoMagicNumbers('const x = -99', 'a.ts')
    expect(findings.some((f) => f.message.includes('-99'))).toBe(true)
  })
})

// ─── checkRequireJsdoc ────────────────────────────────────────────────────────

describe('checkRequireJsdoc', () => {
  it('finds exported function without JSDoc', () => {
    const findings = checkRequireJsdoc('export function foo() {}', 'a.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.rule).toBe('require-jsdoc')
    expect(findings[0]!.severity).toBe('info')
  })

  it('accepts exported function with JSDoc', () => {
    const code = '/** docs */\nexport function foo() {}'
    expect(checkRequireJsdoc(code, 'a.ts')).toEqual([])
  })

  it('ignores non-exported functions', () => {
    expect(checkRequireJsdoc('function foo() {}', 'a.ts')).toEqual([])
  })
})

// ─── checkNoAnyType ───────────────────────────────────────────────────────────

describe('checkNoAnyType', () => {
  it('finds explicit any type annotation', () => {
    const findings = checkNoAnyType('const x: any = 1', 'a.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.rule).toBe('no-any-type')
    expect(findings[0]!.severity).toBe('error')
  })

  it('finds multiple any annotations', () => {
    const findings = checkNoAnyType('const x: any = 1\nconst y: any = 2', 'a.ts')
    expect(findings.length).toBe(2)
  })

  it('ignores safe types', () => {
    expect(checkNoAnyType('const x: string = "hi"', 'a.ts')).toEqual([])
  })
})

// ─── checkNoVar ───────────────────────────────────────────────────────────────

describe('checkNoVar', () => {
  it('finds var usage', () => {
    const findings = checkNoVar('var x = 1', 'a.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.rule).toBe('no-var')
    expect(findings[0]!.severity).toBe('warning')
  })

  it('ignores const and let', () => {
    expect(checkNoVar('const x = 1\nlet y = 2', 'a.ts')).toEqual([])
  })

  it('ignores var in words like variable', () => {
    expect(checkNoVar('const variable = 1', 'a.ts')).toEqual([])
  })
})

// ─── checkPreferConst ─────────────────────────────────────────────────────────

describe('checkPreferConst', () => {
  it('flags let that is never reassigned', () => {
    const findings = checkPreferConst('let x = 1\nconsole.log(x)', 'a.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.rule).toBe('prefer-const')
    expect(findings[0]!.severity).toBe('info')
  })

  it('does not flag let that is reassigned', () => {
    const code = 'let x = 1\nx = 2'
    const findings = checkPreferConst(code, 'a.ts')
    expect(findings).toEqual([])
  })

  it('does not flag let that is incremented', () => {
    const code = 'let i = 0\ni++'
    const findings = checkPreferConst(code, 'a.ts')
    expect(findings).toEqual([])
  })
})

// ─── checkNoHardcodedStrings ──────────────────────────────────────────────────

describe('checkNoHardcodedStrings', () => {
  it('finds long hardcoded strings', () => {
    const findings = checkNoHardcodedStrings(`const msg = 'this is a very long hardcoded string in code'`, 'a.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.rule).toBe('no-hardcoded-strings')
  })

  it('ignores short strings', () => {
    expect(checkNoHardcodedStrings(`const msg = 'short'`, 'a.ts')).toEqual([])
  })

  it('ignores path-like strings', () => {
    expect(checkNoHardcodedStrings(`const p = 'src/commands/helpers.ts'`, 'a.ts')).toEqual([])
  })

  it('skips test files', () => {
    expect(checkNoHardcodedStrings(`const msg = 'this is a very long hardcoded string in code'`, 'a.test.ts')).toEqual([])
  })
})

// ─── checkConsistentReturn ────────────────────────────────────────────────────

describe('checkConsistentReturn', () => {
  it('flags mixed return patterns', () => {
    const code = 'function f(x) {\n  if (x) { return 1; }\n  return;\n}'
    const findings = checkConsistentReturn(code, 'a.ts')
    expect(findings.length).toBe(1)
    expect(findings[0]!.rule).toBe('consistent-return')
  })

  it('allows consistent value returns', () => {
    const code = 'function f(x) {\nif (x) return 1;\nreturn 0;\n}'
    expect(checkConsistentReturn(code, 'a.ts')).toEqual([])
  })

  it('allows functions with no returns', () => {
    expect(checkConsistentReturn('function f() {\nconsole.log("hi")\n}', 'a.ts')).toEqual([])
  })
})

// ─── computeFileScore ─────────────────────────────────────────────────────────

describe('computeFileScore', () => {
  it('returns 100 for no findings', () => {
    expect(computeFileScore([], 100)).toBe(100)
  })

  it('deducts 10 for each error', () => {
    const f: ReviewFinding = { id: 'RV01', rule: 'test', file: 'a.ts', line: 1, column: 1, severity: 'error', category: 'correctness', message: 'm', suggestion: 's', effort: 'easy' }
    expect(computeFileScore([f], 100)).toBe(90)
  })

  it('deducts 5 for each warning', () => {
    const f: ReviewFinding = { id: 'RV01', rule: 'test', file: 'a.ts', line: 1, column: 1, severity: 'warning', category: 'style', message: 'm', suggestion: 's', effort: 'easy' }
    expect(computeFileScore([f], 100)).toBe(95)
  })

  it('deducts 1 for each info', () => {
    const f: ReviewFinding = { id: 'RV01', rule: 'test', file: 'a.ts', line: 1, column: 1, severity: 'info', category: 'style', message: 'm', suggestion: 's', effort: 'easy' }
    expect(computeFileScore([f], 100)).toBe(99)
  })

  it('never goes below 0', () => {
    const findings = Array(20).fill({ id: 'RV01', rule: 'test', file: 'a.ts', line: 1, column: 1, severity: 'error', category: 'correctness', message: 'm', suggestion: 's', effort: 'easy' })
    expect(computeFileScore(findings as ReviewFinding[], 100)).toBe(0)
  })
})

// ─── computeGrade ─────────────────────────────────────────────────────────────

describe('computeGrade', () => {
  it('returns A for >= 90', () => {
    expect(computeGrade(90)).toBe('A')
    expect(computeGrade(100)).toBe('A')
  })

  it('returns B for >= 80', () => {
    expect(computeGrade(80)).toBe('B')
    expect(computeGrade(89)).toBe('B')
  })

  it('returns C for >= 70', () => {
    expect(computeGrade(70)).toBe('C')
    expect(computeGrade(79)).toBe('C')
  })

  it('returns D for >= 60', () => {
    expect(computeGrade(60)).toBe('D')
    expect(computeGrade(69)).toBe('D')
  })

  it('returns F for < 60', () => {
    expect(computeGrade(0)).toBe('F')
    expect(computeGrade(59)).toBe('F')
  })
})

// ─── estimateFixTime ──────────────────────────────────────────────────────────

describe('estimateFixTime', () => {
  it('returns 0 minutes for empty', () => {
    expect(estimateFixTime([])).toBe('0 minutes')
  })

  it('estimates trivial effort', () => {
    const f: ReviewFinding = { id: 'RV01', rule: 'test', file: 'a.ts', line: 1, column: 1, severity: 'info', category: 'style', message: 'm', suggestion: 's', effort: 'trivial' }
    expect(estimateFixTime([f])).toBe('~2 minutes')
  })

  it('estimates hours for many findings', () => {
    const findings: ReviewFinding[] = Array(10).fill({ id: 'RV01', rule: 'test', file: 'a.ts', line: 1, column: 1, severity: 'warning', category: 'style', message: 'm', suggestion: 's', effort: 'medium' })
    expect(estimateFixTime(findings)).toContain('h')
  })
})

// ─── reviewFile ───────────────────────────────────────────────────────────────

describe('reviewFile', () => {
  it('returns clean review for good code', () => {
    const review = reviewFile('/** docs */\nexport function add(a: number, b: number) {\n  return a + b\n}\n', 'clean.ts')
    expect(review.file).toBe('clean.ts')
    expect(review.score).toBeGreaterThanOrEqual(90)
    expect(review.grade).toBe('A')
  })

  it('detects multiple issues in bad code', () => {
    const review = reviewFile('var x: any = y as any\nconsole.log(x)\n', 'bad.ts')
    expect(review.findings.length).toBeGreaterThan(0)
    expect(review.score).toBeLessThan(100)
  })

  it('computes finding density', () => {
    const review = reviewFile('var x = 1\nconsole.log(x)\n', 'mid.ts')
    expect(review.findingDensity).toBeGreaterThanOrEqual(0)
  })

  it('counts lines correctly', () => {
    const code = 'line1\nline2\nline3'
    const review = reviewFile(code, 'three.ts')
    expect(review.lines).toBe(3)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: ReviewStats = { totalFiles: 1, totalFindings: 0, infoCount: 0, warningCount: 0, errorCount: 0, averageScore: 100, overallGrade: 'A', filesWithErrors: 0, mostCommonFinding: 'none', estimatedFixTime: '0 minutes' }

  it('returns clean message for no findings', () => {
    const recs = generateRecommendations([], emptyStats)
    expect(recs).toEqual(['Code looks good! No significant issues found.'])
  })

  it('recommends fixing errors', () => {
    const stats = { ...emptyStats, errorCount: 3 }
    const f: ReviewFinding = { id: 'RV01', rule: 'no-var', file: 'a.ts', line: 1, column: 1, severity: 'error', category: 'correctness', message: 'm', suggestion: 's', effort: 'easy' }
    const recs = generateRecommendations([f, f, f], stats)
    expect(recs.some((r) => r.includes('3 error'))).toBe(true)
  })

  it('identifies most common rule', () => {
    const f: ReviewFinding = { id: 'RV01', rule: 'no-var', file: 'a.ts', line: 1, column: 1, severity: 'warning', category: 'style', message: 'm', suggestion: 's', effort: 'easy' }
    const recs = generateRecommendations([f, f], emptyStats)
    expect(recs.some((r) => r.includes('no-var'))).toBe(true)
  })
})

// ─── buildReviewResult ────────────────────────────────────────────────────────

describe('buildReviewResult', () => {
  it('returns empty result for no files', () => {
    const result = buildReviewResult([], [])
    expect(result.files).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.findings).toEqual([])
  })

  it('reviews a single file', () => {
    const result = buildReviewResult(['a.ts'], ['const x = 1;'])
    expect(result.files.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('reviews multiple files', () => {
    const result = buildReviewResult(['a.ts', 'b.ts'], ['var x = 1;', 'const y = 2;'])
    expect(result.files.length).toBe(2)
  })

  it('computes category breakdown', () => {
    const result = buildReviewResult(['a.ts'], ['var x = 1; console.log(x);'])
    expect(Object.keys(result.categoryBreakdown).length).toBeGreaterThan(0)
  })

  it('generates top issues sorted by severity', () => {
    const result = buildReviewResult(['a.ts'], ['var x: any = y as any\nconsole.log(x)\n'])
    if (result.topIssues.length > 1) {
      expect(result.topIssues[0]!.severity).toBe('error')
    }
  })

  it('generates recommendations', () => {
    const result = buildReviewResult(['a.ts'], ['var x = 1;'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('respects severity filter warning', () => {
    const result = buildReviewResult(['a.ts'], ['var x = 1; console.log(x)'], { severity: 'warning' })
    const hasInfo = result.findings.some((f) => f.severity === 'info')
    expect(hasInfo).toBe(false)
  })

  it('respects severity filter error', () => {
    const result = buildReviewResult(['a.ts'], ['var x: any = 1; console.log(x)'], { severity: 'error' })
    const hasNonError = result.findings.some((f) => f.severity !== 'error')
    expect(hasNonError).toBe(false)
  })

  it('computes stats correctly', () => {
    const result = buildReviewResult(['a.ts'], ['var x: any = y as any\n'])
    expect(result.stats.totalFindings).toBeGreaterThan(0)
    expect(result.stats.errorCount).toBeGreaterThan(0)
    expect(result.stats.averageScore).toBeLessThan(100)
  })

  it('computes filesWithErrors', () => {
    const result = buildReviewResult(['a.ts', 'b.ts'], ['var x: any = 1', 'const y = 2;'])
    expect(result.stats.filesWithErrors).toBe(1)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatFindingsTable', () => {
  it('shows clean message for no findings', () => {
    const output = formatFindingsTable([])
    expect(output).toContain('No findings')
  })

  it('renders findings', () => {
    const result = buildReviewResult(['a.ts'], ['var x = 1; console.log(x)\n'])
    const output = formatFindingsTable(result.findings)
    expect(output).toContain('a.ts')
  })
})

describe('formatFileGrades', () => {
  it('returns empty for no files', () => {
    expect(formatFileGrades([])).toBe('')
  })

  it('renders file grades', () => {
    const result = buildReviewResult(['a.ts'], ['const x = 1;'])
    const output = formatFileGrades(result.files)
    expect(output).toContain('a.ts')
    expect(output).toContain('File Grades')
  })
})

describe('formatCategoryBreakdown', () => {
  it('returns empty for empty breakdown', () => {
    expect(formatCategoryBreakdown({})).toBe('')
  })

  it('renders breakdown chart', () => {
    const output = formatCategoryBreakdown({ style: 5, complexity: 3 })
    expect(output).toContain('Category Breakdown')
    expect(output).toContain('style')
    expect(output).toContain('█')
  })
})

describe('formatTopIssues', () => {
  it('returns empty for no issues', () => {
    expect(formatTopIssues([])).toBe('')
  })

  it('renders top issues', () => {
    const result = buildReviewResult(['a.ts'], ['var x = 1;\nconsole.log(x)\n'])
    const output = formatTopIssues(result.topIssues)
    expect(output).toContain('Top Issues')
  })
})

describe('formatStatsLine', () => {
  it('renders stats', () => {
    const stats: ReviewStats = { totalFiles: 10, totalFindings: 5, infoCount: 2, warningCount: 2, errorCount: 1, averageScore: 85, overallGrade: 'B', filesWithErrors: 1, mostCommonFinding: 'no-var', estimatedFixTime: '~15 minutes' }
    const output = formatStatsLine(stats)
    expect(output).toContain('Files: 10')
    expect(output).toContain('Score: 85/100')
    expect(output).toContain('Fix Time')
  })
})

describe('formatRecommendations', () => {
  it('returns empty for no recs', () => {
    expect(formatRecommendations([])).toBe('')
  })

  it('renders recommendations', () => {
    const output = formatRecommendations(['Fix errors', 'Improve docs'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Fix errors')
  })
})

describe('formatReviewResultTable', () => {
  it('renders full result', () => {
    const result = buildReviewResult(['a.ts'], ['const x = 1;'])
    const output = formatReviewResultTable(result, false)
    expect(output).toContain('Score')
    expect(output).toContain('File Grades')
  })

  it('shows all findings in verbose mode', () => {
    const result = buildReviewResult(['a.ts'], ['var x = 1;\nconsole.log(x)\n'])
    const output = formatReviewResultTable(result, true)
    expect(output).toContain('Findings')
  })
})

describe('formatReviewJson', () => {
  it('returns valid JSON', () => {
    const result = buildReviewResult(['a.ts'], ['const x = 1;'])
    const output = formatReviewJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('files')
    expect(parsed).toHaveProperty('stats')
  })
})

describe('formatReviewCsv', () => {
  it('includes header', () => {
    const result = buildReviewResult([], [])
    const output = formatReviewCsv(result)
    expect(output).toContain('file,line,column,severity,rule')
  })

  it('includes data rows', () => {
    const result = buildReviewResult(['a.ts'], ['var x = 1;'])
    if (result.findings.length > 0) {
      const output = formatReviewCsv(result)
      const lines = output.split('\n')
      expect(lines.length).toBeGreaterThan(1)
    }
  })
})
