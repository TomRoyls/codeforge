import { describe, it, expect } from 'vitest'

import {
  getBuiltinRules,
  checkMaxFileLength,
  checkNoConsole,
  checkRequireJSDoc,
  checkNoTodo,
  checkMaxFunctionLength,
  checkMaxParams,
  checkNamingConvention,
  checkImportOrder,
  checkNoTypeAny,
  checkExplicitReturnTypes,
  checkNoHardcodedStrings,
  checkConsistentNaming,
  computeValidationStats,
  buildValidationResult,
  type Violation,
  type ValidationResult,
} from '../src/commands/validate-helpers.js'

import {
  formatSeverity,
  formatValidationTable,
  formatValidationJson,
} from '../src/commands/validate-format-helpers.js'

import Validate from '../src/commands/validate.js'

// ─── checkMaxFileLength ───────────────────────────────────

describe('checkMaxFileLength', () => {
  it('should pass for files <= 300 lines', () => {
    const content = 'line'.repeat(1)
    const padded = Array(300).fill('x').join('\n')
    expect(checkMaxFileLength(padded, 'ok.ts')).toHaveLength(0)
  })

  it('should warn for files > 300 lines', () => {
    const content = 'line\n'.repeat(301)
    const violations = checkMaxFileLength(content, 'big.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].rule).toBe('MAX_FILE_LENGTH')
    expect(violations[0].severity).toBe('warning')
  })

  it('should include line count in message', () => {
    const content = 'line\n'.repeat(500)
    const violations = checkMaxFileLength(content, 'big.ts')
    expect(violations[0].message).toContain('501')
  })

  it('should pass for empty file', () => {
    expect(checkMaxFileLength('', 'empty.ts')).toHaveLength(0)
  })
})

// ─── checkNoConsole ───────────────────────────────────────

describe('checkNoConsole', () => {
  it('should detect console.log', () => {
    const violations = checkNoConsole('console.log("hi")\n', 'a.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].rule).toBe('NO_CONSOLE')
  })

  it('should detect console.warn and console.error', () => {
    const code = 'console.warn("w")\nconsole.error("e")\n'
    const violations = checkNoConsole(code, 'a.ts')
    expect(violations).toHaveLength(2)
  })

  it('should pass for clean code', () => {
    expect(checkNoConsole('const x = 1\n', 'clean.ts')).toHaveLength(0)
  })

  it('should report correct line numbers', () => {
    const code = 'const x = 1\nconsole.log("hi")\n'
    const violations = checkNoConsole(code, 'a.ts')
    expect(violations[0].line).toBe(2)
  })
})

// ─── checkRequireJSDoc ────────────────────────────────────

describe('checkRequireJSDoc', () => {
  it('should flag exported function without JSDoc', () => {
    const code = 'export function foo() { return 1 }\n'
    const violations = checkRequireJSDoc(code, 'a.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].rule).toBe('REQUIRE_JSDOC')
  })

  it('should pass for documented function', () => {
    const code = '/** doc */\nexport function foo() { return 1 }\n'
    expect(checkRequireJSDoc(code, 'a.ts')).toHaveLength(0)
  })

  it('should flag async exported function', () => {
    const code = 'export async function bar() {}\n'
    const violations = checkRequireJSDoc(code, 'a.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('bar')
  })

  it('should pass for non-exported function', () => {
    const code = 'function internal() {}\n'
    expect(checkRequireJSDoc(code, 'a.ts')).toHaveLength(0)
  })
})

// ─── checkNoTodo ──────────────────────────────────────────

describe('checkNoTodo', () => {
  it('should detect TODO comments', () => {
    const violations = checkNoTodo('// TODO: fix later\n', 'a.ts')
    expect(violations).toHaveLength(1)
  })

  it('should detect FIXME comments', () => {
    const violations = checkNoTodo('// FIXME: broken\n', 'a.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('FIXME')
  })

  it('should pass for clean code', () => {
    expect(checkNoTodo('const x = 1\n', 'clean.ts')).toHaveLength(0)
  })

  it('should detect multiple TODOs', () => {
    const code = '// TODO: a\nconst x = 1\n// TODO: b\n'
    const violations = checkNoTodo(code, 'a.ts')
    expect(violations).toHaveLength(2)
  })
})

// ─── checkMaxFunctionLength ───────────────────────────────

describe('checkMaxFunctionLength', () => {
  it('should flag functions > 50 lines', () => {
    const body = '  console.log(1)\n'.repeat(51)
    const code = `function longFn() {\n${body}}\n`
    const violations = checkMaxFunctionLength(code, 'a.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].severity).toBe('error')
  })

  it('should pass for short functions', () => {
    const code = 'function short() { return 1 }\n'
    expect(checkMaxFunctionLength(code, 'a.ts')).toHaveLength(0)
  })

  it('should pass for empty file', () => {
    expect(checkMaxFunctionLength('', 'empty.ts')).toHaveLength(0)
  })
})

// ─── checkMaxParams ───────────────────────────────────────

describe('checkMaxParams', () => {
  it('should flag functions with > 5 params', () => {
    const code = 'function many(a, b, c, d, e, f) { return a }\n'
    const violations = checkMaxParams(code, 'a.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].rule).toBe('MAX_PARAMS')
  })

  it('should pass for functions with <= 5 params', () => {
    const code = 'function ok(a, b, c) { return a }\n'
    expect(checkMaxParams(code, 'a.ts')).toHaveLength(0)
  })

  it('should detect arrow functions with many params', () => {
    const code = 'const fn = (a, b, c, d, e, f) => a\n'
    const violations = checkMaxParams(code, 'a.ts')
    expect(violations).toHaveLength(1)
  })
})

// ─── checkNamingConvention ────────────────────────────────

describe('checkNamingConvention', () => {
  it('should flag lowercase class names', () => {
    const code = 'class myClass {}\n'
    const violations = checkNamingConvention(code, 'a.ts')
    expect(violations).toHaveLength(1)
  })

  it('should pass PascalCase class names', () => {
    const code = 'class MyClass {}\n'
    expect(checkNamingConvention(code, 'a.ts')).toHaveLength(0)
  })

  it('should flag camelCase constants', () => {
    const code = 'const myValue = 42\n'
    const violations = checkNamingConvention(code, 'a.ts')
    expect(violations).toHaveLength(1)
  })

  it('should pass UPPER_SNAKE constants', () => {
    const code = 'const MY_VALUE = 42\n'
    expect(checkNamingConvention(code, 'a.ts')).toHaveLength(0)
  })
})

// ─── checkImportOrder ─────────────────────────────────────

describe('checkImportOrder', () => {
  it('should flag relative before external imports', () => {
    const code = [
      "import { a } from './local'",
      "import { b } from 'lodash'",
    ].join('\n')
    const violations = checkImportOrder(code, 'a.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].rule).toBe('IMPORT_ORDER')
  })

  it('should pass correctly ordered imports', () => {
    const code = [
      "import { a } from 'lodash'",
      "import { b } from './local'",
    ].join('\n')
    expect(checkImportOrder(code, 'a.ts')).toHaveLength(0)
  })

  it('should pass for single import', () => {
    const code = "import { a } from 'lodash'\n"
    expect(checkImportOrder(code, 'a.ts')).toHaveLength(0)
  })

  it('should pass empty file', () => {
    expect(checkImportOrder('', 'a.ts')).toHaveLength(0)
  })
})

// ─── checkNoTypeAny ───────────────────────────────────────

describe('checkNoTypeAny', () => {
  it('should detect any type', () => {
    const code = 'const x: any = {}\n'
    const violations = checkNoTypeAny(code, 'a.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].severity).toBe('error')
  })

  it('should pass for proper types', () => {
    const code = 'const x: string = "hello"\n'
    expect(checkNoTypeAny(code, 'a.ts')).toHaveLength(0)
  })

  it('should ignore comments', () => {
    const code = '// const x: any = {}\n'
    expect(checkNoTypeAny(code, 'a.ts')).toHaveLength(0)
  })

  it('should detect multiple any usages', () => {
    const code = 'const x: any = {}\nconst y: any = []\n'
    const violations = checkNoTypeAny(code, 'a.ts')
    expect(violations).toHaveLength(2)
  })
})

// ─── checkExplicitReturnTypes ─────────────────────────────

describe('checkExplicitReturnTypes', () => {
  it('should flag exported function without return type', () => {
    const code = 'export function add(a, b) { return a + b }\n'
    const violations = checkExplicitReturnTypes(code, 'a.ts')
    expect(violations).toHaveLength(1)
  })

  it('should pass for function with return type', () => {
    const code = 'export function add(a: number, b: number): number { return a + b }\n'
    expect(checkExplicitReturnTypes(code, 'a.ts')).toHaveLength(0)
  })

  it('should ignore non-exported functions', () => {
    const code = 'function internal() { return 1 }\n'
    expect(checkExplicitReturnTypes(code, 'a.ts')).toHaveLength(0)
  })
})

// ─── checkNoHardcodedStrings ──────────────────────────────

describe('checkNoHardcodedStrings', () => {
  it('should detect long string literals', () => {
    const longStr = 'x'.repeat(51)
    const code = `console.log("${longStr}")\n`
    const violations = checkNoHardcodedStrings(code, 'a.ts')
    expect(violations).toHaveLength(1)
  })

  it('should pass for short strings', () => {
    const code = 'console.log("short")\n'
    expect(checkNoHardcodedStrings(code, 'a.ts')).toHaveLength(0)
  })

  it('should pass for const declarations', () => {
    const longStr = 'x'.repeat(51)
    const code = `const MSG = "${longStr}"\n`
    expect(checkNoHardcodedStrings(code, 'a.ts')).toHaveLength(0)
  })
})

// ─── checkConsistentNaming ────────────────────────────────

describe('checkConsistentNaming', () => {
  it('should flag PascalCase file names', () => {
    const violations = checkConsistentNaming('', 'MyFile.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].rule).toBe('CONSISTENT_NAMING')
  })

  it('should pass kebab-case file names', () => {
    expect(checkConsistentNaming('', 'my-file.ts')).toHaveLength(0)
  })

  it('should pass test files with PascalCase', () => {
    expect(checkConsistentNaming('', 'MyComponent.test.ts')).toHaveLength(0)
  })

  it('should pass simple lowercase names', () => {
    expect(checkConsistentNaming('', 'index.ts')).toHaveLength(0)
  })
})

// ─── getBuiltinRules ──────────────────────────────────────

describe('getBuiltinRules', () => {
  it('should return 12 rules', () => {
    const rules = getBuiltinRules()
    expect(rules).toHaveLength(12)
  })

  it('should have unique IDs', () => {
    const rules = getBuiltinRules()
    const ids = rules.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should have required rule IDs', () => {
    const rules = getBuiltinRules()
    const ids = rules.map((r) => r.id)
    expect(ids).toContain('MAX_FILE_LENGTH')
    expect(ids).toContain('NO_CONSOLE')
    expect(ids).toContain('NO_TYPE_ANY')
    expect(ids).toContain('IMPORT_ORDER')
  })

  it('should have check functions', () => {
    const rules = getBuiltinRules()
    for (const rule of rules) {
      expect(typeof rule.check).toBe('function')
    }
  })
})

// ─── computeValidationStats ───────────────────────────────

describe('computeValidationStats', () => {
  it('should compute total', () => {
    const violations: Violation[] = [
      { file: 'a.ts', fix: null, line: 1, message: 'x', rule: 'R1', severity: 'error' },
      { file: 'b.ts', fix: null, line: 2, message: 'y', rule: 'R1', severity: 'warning' },
    ]
    const stats = computeValidationStats(violations)
    expect(stats.total).toBe(2)
  })

  it('should count errors and warnings', () => {
    const violations: Violation[] = [
      { file: 'a.ts', fix: null, line: 1, message: 'x', rule: 'R1', severity: 'error' },
      { file: 'b.ts', fix: null, line: 2, message: 'y', rule: 'R2', severity: 'warning' },
      { file: 'c.ts', fix: null, line: 3, message: 'z', rule: 'R1', severity: 'error' },
    ]
    const stats = computeValidationStats(violations)
    expect(stats.errors).toBe(2)
    expect(stats.warnings).toBe(1)
  })

  it('should compute byRule', () => {
    const violations: Violation[] = [
      { file: 'a.ts', fix: null, line: 1, message: 'x', rule: 'R1', severity: 'error' },
      { file: 'b.ts', fix: null, line: 2, message: 'y', rule: 'R1', severity: 'warning' },
      { file: 'c.ts', fix: null, line: 3, message: 'z', rule: 'R2', severity: 'error' },
    ]
    const stats = computeValidationStats(violations)
    expect(stats.byRule['R1']).toBe(2)
    expect(stats.byRule['R2']).toBe(1)
  })

  it('should compute byFile', () => {
    const violations: Violation[] = [
      { file: 'a.ts', fix: null, line: 1, message: 'x', rule: 'R1', severity: 'error' },
      { file: 'a.ts', fix: null, line: 5, message: 'y', rule: 'R2', severity: 'warning' },
    ]
    const stats = computeValidationStats(violations)
    expect(stats.byFile['a.ts']).toBe(2)
  })

  it('should handle empty violations', () => {
    const stats = computeValidationStats([])
    expect(stats.total).toBe(0)
    expect(stats.errors).toBe(0)
    expect(stats.warnings).toBe(0)
  })
})

// ─── buildValidationResult ────────────────────────────────

describe('buildValidationResult', () => {
  it('should return empty result for no files', async () => {
    const result = await buildValidationResult(
      [],
      async () => '',
      { extensions: null, ignorePatterns: [], rules: null },
    )
    expect(result.violations).toHaveLength(0)
    expect(result.stats.total).toBe(0)
  })

  it('should detect violations in provided content', async () => {
    const files = ['test.ts']
    const reader = async () => 'console.log("hello")\n// TODO: fix\n'
    const result = await buildValidationResult(files, reader, {
      extensions: null,
      ignorePatterns: [],
      rules: null,
    })
    expect(result.violations.length).toBeGreaterThan(0)
  })

  it('should filter by rule IDs', async () => {
    const files = ['test.ts']
    const reader = async () => 'console.log("hello")\n// TODO: fix\n'
    const result = await buildValidationResult(files, reader, {
      extensions: null,
      ignorePatterns: [],
      rules: ['NO_CONSOLE'],
    })
    const consoleViolations = result.violations.filter((v) => v.rule === 'NO_CONSOLE')
    const todoViolations = result.violations.filter((v) => v.rule === 'NO_TODO')
    expect(consoleViolations.length).toBeGreaterThan(0)
    expect(todoViolations).toHaveLength(0)
  })

  it('should include active rules in result', async () => {
    const result = await buildValidationResult(
      [],
      async () => '',
      { extensions: null, ignorePatterns: [], rules: ['NO_CONSOLE'] },
    )
    expect(result.rules).toHaveLength(1)
    expect(result.rules[0].id).toBe('NO_CONSOLE')
  })

  it('should use all rules when none specified', async () => {
    const result = await buildValidationResult(
      [],
      async () => '',
      { extensions: null, ignorePatterns: [], rules: null },
    )
    expect(result.rules).toHaveLength(12)
  })

  it('should skip unreadable files', async () => {
    const files = ['missing.ts']
    const reader = async () => { throw new Error('not found') }
    const result = await buildValidationResult(files, reader, {
      extensions: null,
      ignorePatterns: [],
      rules: null,
    })
    expect(result.violations).toHaveLength(0)
  })
})

// ─── formatSeverity ───────────────────────────────────────

describe('formatSeverity', () => {
  it('should contain ERROR for error', () => {
    expect(formatSeverity('error')).toContain('ERROR')
  })

  it('should contain WARN for warning', () => {
    expect(formatSeverity('warning')).toContain('WARN')
  })
})

// ─── formatValidationTable ────────────────────────────────

describe('formatValidationTable', () => {
  function makeResult(overrides: Partial<ValidationResult> = {}): ValidationResult {
    return {
      rules: [],
      stats: { byFile: {}, byRule: {}, errors: 0, total: 0, warnings: 0 },
      violations: [],
      ...overrides,
    }
  }

  it('should contain summary', () => {
    const result = formatValidationTable(makeResult({
      stats: { byFile: {}, byRule: {}, errors: 3, total: 5, warnings: 2 },
    }), false)
    expect(result).toContain('3')
    expect(result).toContain('2')
  })

  it('should show rule breakdown', () => {
    const result = formatValidationTable(makeResult({
      stats: { byFile: {}, byRule: { NO_CONSOLE: 3 }, errors: 0, total: 3, warnings: 3 },
      violations: [{ file: 'a.ts', fix: null, line: 1, message: 'x', rule: 'NO_CONSOLE', severity: 'warning' }],
    }), false)
    expect(result).toContain('NO_CONSOLE')
  })

  it('should show violations table', () => {
    const violations: Violation[] = [
      { file: 'src/app.ts', fix: null, line: 10, message: 'console.log found', rule: 'NO_CONSOLE', severity: 'warning' },
    ]
    const result = formatValidationTable(makeResult({
      stats: { byFile: { 'src/app.ts': 1 }, byRule: { NO_CONSOLE: 1 }, errors: 0, total: 1, warnings: 1 },
      violations,
    }), false)
    expect(result).toContain('src/app.ts')
    expect(result).toContain('console.log found')
  })

  it('should show fix suggestions in verbose mode', () => {
    const violations: Violation[] = [
      { file: 'a.ts', fix: 'Use logger', line: 5, message: 'x', rule: 'NO_CONSOLE', severity: 'warning' },
    ]
    const result = formatValidationTable(makeResult({
      stats: { byFile: {}, byRule: {}, errors: 0, total: 1, warnings: 1 },
      violations,
    }), true)
    expect(result).toContain('Use logger')
  })

  it('should handle empty result', () => {
    const result = formatValidationTable(makeResult(), false)
    expect(result).toContain('Validation')
  })
})

// ─── formatValidationJson ─────────────────────────────────

describe('formatValidationJson', () => {
  it('should produce valid JSON', () => {
    const result: ValidationResult = {
      rules: [],
      stats: { byFile: {}, byRule: {}, errors: 0, total: 0, warnings: 0 },
      violations: [],
    }
    expect(() => JSON.parse(formatValidationJson(result))).not.toThrow()
  })

  it('should contain stats', () => {
    const result: ValidationResult = {
      rules: [],
      stats: { byFile: {}, byRule: {}, errors: 5, total: 10, warnings: 5 },
      violations: [],
    }
    const parsed = JSON.parse(formatValidationJson(result))
    expect(parsed.stats.errors).toBe(5)
    expect(parsed.stats.total).toBe(10)
  })

  it('should serialize violations', () => {
    const violations: Violation[] = [
      { file: 'a.ts', fix: null, line: 1, message: 'test', rule: 'R1', severity: 'error' },
    ]
    const result: ValidationResult = {
      rules: [],
      stats: { byFile: {}, byRule: {}, errors: 1, total: 1, warnings: 0 },
      violations,
    }
    const parsed = JSON.parse(formatValidationJson(result))
    expect(parsed.violations).toHaveLength(1)
    expect(parsed.violations[0].file).toBe('a.ts')
  })
})

// ─── Command metadata ─────────────────────────────────────

describe('Validate command', () => {
  it('should have correct description', () => {
    expect(Validate.description).toContain('Validate')
  })

  it('should have path arg', () => {
    expect(Validate.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(Validate.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(Validate.flags.output).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(Validate.flags.ignore).toBeDefined()
  })

  it('should have ext flag', () => {
    expect(Validate.flags.ext).toBeDefined()
  })

  it('should have rules flag', () => {
    expect(Validate.flags.rules).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(Validate.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(Validate.examples.length).toBeGreaterThan(0)
  })
})
