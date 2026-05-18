import { describe, it, expect } from 'vitest'
import {
  SEVERITY_INFO,
  SEVERITY_WARNING,
  SEVERITY_ERROR,
  MAX_FILES_TO_PROCESS,
  MAX_ORGANIZE_IMPORTS_FILES,
  MAX_VIOLATIONS_TO_SHOW,
  MAX_DIFF_VIOLATIONS,
  MAX_DEBT_HISTORY_ENTRIES,
  MAX_RECOMMENDATIONS,
  MAX_UNMAPPED_RULES_TO_SHOW,
  MAX_TOP_SUGGESTIONS,
  MAX_TOP_STATS_FILES,
  MAX_TOP_RULES_SHOWN,
  SOURCE_SNIPPET_LINES,
  TABLE_DASH_SEPARATOR_WIDTH,
  LINE_CLEAR_WIDTH,
  BENCHMARK_TABLE_SEPARATOR_WIDTH,
  DATE_FIELD_WIDTH,
  RULE_ID_FIELD_WIDTH,
  SCORE_FIELD_WIDTH,
  METRIC_FIELD_WIDTH,
  TOTAL_FIELD_WIDTH,
  DECIMAL_PRECISION_DEFAULT,
  DECIMAL_PRECISION_TIME,
  DEBT_WEIGHT_SECURITY,
  DEBT_WEIGHT_COMPLEXITY,
  DEBT_WEIGHT_DEPENDENCIES,
  DEBT_WEIGHT_PATTERNS,
  DEBT_WEIGHT_DOCUMENTATION,
  DEBT_COST_PER_POINT_MINUTES,
  DEBT_OVERALL_THRESHOLD_HIGH,
  DEBT_COMPLEXITY_THRESHOLD_HIGH,
  DEBT_SECURITY_THRESHOLD_HIGH,
  DEBT_DEPENDENCIES_THRESHOLD_HIGH,
  HEALTH_SCORE_THRESHOLD_A,
  HEALTH_SCORE_THRESHOLD_B,
  HEALTH_SCORE_THRESHOLD_C,
  HEALTH_SCORE_THRESHOLD_D,
  HEALTH_SCORE_MAX,
  PERFORMANCE_SLOW_THRESHOLD_MS,
  PERFORMANCE_VERY_SLOW_THRESHOLD_MS,
  DEFAULT_DEBOUNCE_MS,
  DEFAULT_MAX_LINES,
  DEFAULT_MAX_FILE_SIZE_LINES,
  FILE_COUNT_THRESHOLD,
  TIME_FORMAT_THRESHOLD_MS,
  DEFAULT_FIX_PRIORITY,
  DEFAULT_CONCURRENCY,
  DEFAULT_BENCHMARK_ITERATIONS,
  DEFAULT_BENCHMARK_TOP,
  DEFAULT_MAX_WARNINGS,
  FIX_PRIORITY_DEFAULT,
  BYTES_PER_KB,
  RANDOM_BYTES_LENGTH,
  FILE_PERMISSION_EXECUTABLE,
  DEFAULT_IGNORE_PATTERNS,
  DEFAULT_FILE_PATTERNS,
  TEST_FUNCTIONS,
  TEST_CASE_FUNCTIONS,
  DESCRIBE_FUNCTIONS,
  HOOK_FUNCTIONS,
  TEST_AND_HOOK_FUNCTIONS,
  TEST_SKIP_METHODS,
  X_PREFIX_SKIP_FUNCTIONS,
  EQUALITY_MATCHERS,
  REGEX_SPECIAL_CHARS,
  DANGEROUS_FUNCTIONS,
  MUTATING_ARRAY_METHODS,
} from '../src/utils/constants.js'

// ─── Severity Levels ──────────────────────────────────
describe('SEVERITY levels', () => {
  it('SEVERITY_INFO is 1', () => {
    expect(SEVERITY_INFO).toBe(1)
  })

  it('SEVERITY_WARNING is 2', () => {
    expect(SEVERITY_WARNING).toBe(2)
  })

  it('SEVERITY_ERROR is 3', () => {
    expect(SEVERITY_ERROR).toBe(3)
  })

  it('severity levels are ordered ascending', () => {
    expect(SEVERITY_INFO).toBeLessThan(SEVERITY_WARNING)
    expect(SEVERITY_WARNING).toBeLessThan(SEVERITY_ERROR)
  })

  it('all severity levels are distinct', () => {
    const levels = new Set([SEVERITY_INFO, SEVERITY_WARNING, SEVERITY_ERROR])
    expect(levels.size).toBe(3)
  })

  it('all severity levels are positive integers', () => {
    for (const level of [SEVERITY_INFO, SEVERITY_WARNING, SEVERITY_ERROR]) {
      expect(Number.isInteger(level)).toBe(true)
      expect(level).toBeGreaterThan(0)
    }
  })
})

// ─── File Processing Limits ───────────────────────────
describe('file processing limits', () => {
  it('MAX_FILES_TO_PROCESS is 100', () => {
    expect(MAX_FILES_TO_PROCESS).toBe(100)
  })

  it('MAX_ORGANIZE_IMPORTS_FILES is 200', () => {
    expect(MAX_ORGANIZE_IMPORTS_FILES).toBe(200)
  })

  it('organize-imports limit is larger than general limit', () => {
    expect(MAX_ORGANIZE_IMPORTS_FILES).toBeGreaterThan(MAX_FILES_TO_PROCESS)
  })

  it('all limits are positive integers', () => {
    for (const limit of [MAX_FILES_TO_PROCESS, MAX_ORGANIZE_IMPORTS_FILES]) {
      expect(Number.isInteger(limit)).toBe(true)
      expect(limit).toBeGreaterThan(0)
    }
  })
})

// ─── Display/UI Limits ────────────────────────────────
describe('display/UI limits', () => {
  it('MAX_VIOLATIONS_TO_SHOW is 3', () => {
    expect(MAX_VIOLATIONS_TO_SHOW).toBe(3)
  })

  it('MAX_DIFF_VIOLATIONS is 20', () => {
    expect(MAX_DIFF_VIOLATIONS).toBe(20)
  })

  it('MAX_DEBT_HISTORY_ENTRIES is 30', () => {
    expect(MAX_DEBT_HISTORY_ENTRIES).toBe(30)
  })

  it('MAX_RECOMMENDATIONS is 5', () => {
    expect(MAX_RECOMMENDATIONS).toBe(5)
  })

  it('MAX_UNMAPPED_RULES_TO_SHOW is 10', () => {
    expect(MAX_UNMAPPED_RULES_TO_SHOW).toBe(10)
  })

  it('MAX_TOP_SUGGESTIONS is 15', () => {
    expect(MAX_TOP_SUGGESTIONS).toBe(15)
  })

  it('MAX_TOP_STATS_FILES is 10', () => {
    expect(MAX_TOP_STATS_FILES).toBe(10)
  })

  it('MAX_TOP_RULES_SHOWN is 5', () => {
    expect(MAX_TOP_RULES_SHOWN).toBe(5)
  })

  it('SOURCE_SNIPPET_LINES is 3', () => {
    expect(SOURCE_SNIPPET_LINES).toBe(3)
  })

  it('all display limits are positive integers', () => {
    const limits = [
      MAX_VIOLATIONS_TO_SHOW,
      MAX_DIFF_VIOLATIONS,
      MAX_DEBT_HISTORY_ENTRIES,
      MAX_RECOMMENDATIONS,
      MAX_UNMAPPED_RULES_TO_SHOW,
      MAX_TOP_SUGGESTIONS,
      MAX_TOP_STATS_FILES,
      MAX_TOP_RULES_SHOWN,
      SOURCE_SNIPPET_LINES,
    ]
    for (const limit of limits) {
      expect(Number.isInteger(limit)).toBe(true)
      expect(limit).toBeGreaterThan(0)
    }
  })

  it('diff violations limit exceeds watch mode limit', () => {
    expect(MAX_DIFF_VIOLATIONS).toBeGreaterThan(MAX_VIOLATIONS_TO_SHOW)
  })
})

// ─── Formatting/Padding Values ────────────────────────
describe('formatting/padding values', () => {
  it('TABLE_DASH_SEPARATOR_WIDTH is 40', () => {
    expect(TABLE_DASH_SEPARATOR_WIDTH).toBe(40)
  })

  it('LINE_CLEAR_WIDTH is 80', () => {
    expect(LINE_CLEAR_WIDTH).toBe(80)
  })

  it('BENCHMARK_TABLE_SEPARATOR_WIDTH is 90', () => {
    expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBe(90)
  })

  it('DATE_FIELD_WIDTH is 20', () => {
    expect(DATE_FIELD_WIDTH).toBe(20)
  })

  it('RULE_ID_FIELD_WIDTH is 30', () => {
    expect(RULE_ID_FIELD_WIDTH).toBe(30)
  })

  it('SCORE_FIELD_WIDTH is 3', () => {
    expect(SCORE_FIELD_WIDTH).toBe(3)
  })

  it('METRIC_FIELD_WIDTH is 12', () => {
    expect(METRIC_FIELD_WIDTH).toBe(12)
  })

  it('TOTAL_FIELD_WIDTH is 14', () => {
    expect(TOTAL_FIELD_WIDTH).toBe(14)
  })

  it('all formatting values are positive integers', () => {
    const values = [
      TABLE_DASH_SEPARATOR_WIDTH,
      LINE_CLEAR_WIDTH,
      BENCHMARK_TABLE_SEPARATOR_WIDTH,
      DATE_FIELD_WIDTH,
      RULE_ID_FIELD_WIDTH,
      SCORE_FIELD_WIDTH,
      METRIC_FIELD_WIDTH,
      TOTAL_FIELD_WIDTH,
    ]
    for (const v of values) {
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThan(0)
    }
  })

  it('benchmark separator is wider than dash separator', () => {
    expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBeGreaterThan(TABLE_DASH_SEPARATOR_WIDTH)
  })

  it('total field width is greater than metric field width', () => {
    expect(TOTAL_FIELD_WIDTH).toBeGreaterThan(METRIC_FIELD_WIDTH)
  })
})

// ─── Decimal Precision ────────────────────────────────
describe('decimal precision', () => {
  it('DECIMAL_PRECISION_DEFAULT is 2', () => {
    expect(DECIMAL_PRECISION_DEFAULT).toBe(2)
  })

  it('DECIMAL_PRECISION_TIME is 3', () => {
    expect(DECIMAL_PRECISION_TIME).toBe(3)
  })

  it('time precision is higher than default', () => {
    expect(DECIMAL_PRECISION_TIME).toBeGreaterThan(DECIMAL_PRECISION_DEFAULT)
  })

  it('both precisions are positive integers', () => {
    expect(Number.isInteger(DECIMAL_PRECISION_DEFAULT)).toBe(true)
    expect(DECIMAL_PRECISION_DEFAULT).toBeGreaterThan(0)
    expect(Number.isInteger(DECIMAL_PRECISION_TIME)).toBe(true)
    expect(DECIMAL_PRECISION_TIME).toBeGreaterThan(0)
  })
})

// ─── Debt Scoring Weights ─────────────────────────────
describe('debt scoring weights', () => {
  it('DEBT_WEIGHT_SECURITY is 5', () => {
    expect(DEBT_WEIGHT_SECURITY).toBe(5)
  })

  it('DEBT_WEIGHT_COMPLEXITY is 3', () => {
    expect(DEBT_WEIGHT_COMPLEXITY).toBe(3)
  })

  it('DEBT_WEIGHT_DEPENDENCIES is 2', () => {
    expect(DEBT_WEIGHT_DEPENDENCIES).toBe(2)
  })

  it('DEBT_WEIGHT_PATTERNS is 1', () => {
    expect(DEBT_WEIGHT_PATTERNS).toBe(1)
  })

  it('DEBT_WEIGHT_DOCUMENTATION is 1', () => {
    expect(DEBT_WEIGHT_DOCUMENTATION).toBe(1)
  })

  it('security has the highest weight', () => {
    expect(DEBT_WEIGHT_SECURITY).toBeGreaterThan(DEBT_WEIGHT_COMPLEXITY)
    expect(DEBT_WEIGHT_SECURITY).toBeGreaterThan(DEBT_WEIGHT_DEPENDENCIES)
    expect(DEBT_WEIGHT_SECURITY).toBeGreaterThan(DEBT_WEIGHT_PATTERNS)
    expect(DEBT_WEIGHT_SECURITY).toBeGreaterThan(DEBT_WEIGHT_DOCUMENTATION)
  })

  it('complexity is the second highest weight', () => {
    expect(DEBT_WEIGHT_COMPLEXITY).toBeGreaterThan(DEBT_WEIGHT_DEPENDENCIES)
    expect(DEBT_WEIGHT_COMPLEXITY).toBeGreaterThan(DEBT_WEIGHT_PATTERNS)
  })

  it('all weights are positive integers', () => {
    const weights = [
      DEBT_WEIGHT_SECURITY,
      DEBT_WEIGHT_COMPLEXITY,
      DEBT_WEIGHT_DEPENDENCIES,
      DEBT_WEIGHT_PATTERNS,
      DEBT_WEIGHT_DOCUMENTATION,
    ]
    for (const w of weights) {
      expect(Number.isInteger(w)).toBe(true)
      expect(w).toBeGreaterThan(0)
    }
  })

  it('DEBT_COST_PER_POINT_MINUTES is 15', () => {
    expect(DEBT_COST_PER_POINT_MINUTES).toBe(15)
  })

  it('DEBT_OVERALL_THRESHOLD_HIGH is 20', () => {
    expect(DEBT_OVERALL_THRESHOLD_HIGH).toBe(20)
  })

  it('DEBT_COMPLEXITY_THRESHOLD_HIGH is 10', () => {
    expect(DEBT_COMPLEXITY_THRESHOLD_HIGH).toBe(10)
  })

  it('DEBT_SECURITY_THRESHOLD_HIGH is 5', () => {
    expect(DEBT_SECURITY_THRESHOLD_HIGH).toBe(5)
  })

  it('DEBT_DEPENDENCIES_THRESHOLD_HIGH is 5', () => {
    expect(DEBT_DEPENDENCIES_THRESHOLD_HIGH).toBe(5)
  })

  it('overall threshold is the highest threshold', () => {
    expect(DEBT_OVERALL_THRESHOLD_HIGH).toBeGreaterThanOrEqual(DEBT_COMPLEXITY_THRESHOLD_HIGH)
    expect(DEBT_OVERALL_THRESHOLD_HIGH).toBeGreaterThanOrEqual(DEBT_SECURITY_THRESHOLD_HIGH)
    expect(DEBT_OVERALL_THRESHOLD_HIGH).toBeGreaterThanOrEqual(DEBT_DEPENDENCIES_THRESHOLD_HIGH)
  })

  it('security and dependencies thresholds are equal', () => {
    expect(DEBT_SECURITY_THRESHOLD_HIGH).toBe(DEBT_DEPENDENCIES_THRESHOLD_HIGH)
  })

  it('all debt thresholds are positive integers', () => {
    const thresholds = [
      DEBT_COST_PER_POINT_MINUTES,
      DEBT_OVERALL_THRESHOLD_HIGH,
      DEBT_COMPLEXITY_THRESHOLD_HIGH,
      DEBT_SECURITY_THRESHOLD_HIGH,
      DEBT_DEPENDENCIES_THRESHOLD_HIGH,
    ]
    for (const t of thresholds) {
      expect(Number.isInteger(t)).toBe(true)
      expect(t).toBeGreaterThan(0)
    }
  })
})

// ─── Health Score Thresholds ──────────────────────────
describe('health score thresholds', () => {
  it('HEALTH_SCORE_THRESHOLD_A is 90', () => {
    expect(HEALTH_SCORE_THRESHOLD_A).toBe(90)
  })

  it('HEALTH_SCORE_THRESHOLD_B is 80', () => {
    expect(HEALTH_SCORE_THRESHOLD_B).toBe(80)
  })

  it('HEALTH_SCORE_THRESHOLD_C is 70', () => {
    expect(HEALTH_SCORE_THRESHOLD_C).toBe(70)
  })

  it('HEALTH_SCORE_THRESHOLD_D is 60', () => {
    expect(HEALTH_SCORE_THRESHOLD_D).toBe(60)
  })

  it('HEALTH_SCORE_MAX is 100', () => {
    expect(HEALTH_SCORE_MAX).toBe(100)
  })

  it('thresholds decrease monotonically from A to D', () => {
    expect(HEALTH_SCORE_THRESHOLD_A).toBeGreaterThan(HEALTH_SCORE_THRESHOLD_B)
    expect(HEALTH_SCORE_THRESHOLD_B).toBeGreaterThan(HEALTH_SCORE_THRESHOLD_C)
    expect(HEALTH_SCORE_THRESHOLD_C).toBeGreaterThan(HEALTH_SCORE_THRESHOLD_D)
  })

  it('max score is greater than or equal to grade A threshold', () => {
    expect(HEALTH_SCORE_MAX).toBeGreaterThanOrEqual(HEALTH_SCORE_THRESHOLD_A)
  })

  it('grade D threshold is above zero', () => {
    expect(HEALTH_SCORE_THRESHOLD_D).toBeGreaterThan(0)
  })

  it('all thresholds are multiples of 10', () => {
    const thresholds = [
      HEALTH_SCORE_THRESHOLD_A,
      HEALTH_SCORE_THRESHOLD_B,
      HEALTH_SCORE_THRESHOLD_C,
      HEALTH_SCORE_THRESHOLD_D,
      HEALTH_SCORE_MAX,
    ]
    for (const t of thresholds) {
      expect(t % 10).toBe(0)
    }
  })

  it('all thresholds are positive integers', () => {
    const thresholds = [
      HEALTH_SCORE_THRESHOLD_A,
      HEALTH_SCORE_THRESHOLD_B,
      HEALTH_SCORE_THRESHOLD_C,
      HEALTH_SCORE_THRESHOLD_D,
      HEALTH_SCORE_MAX,
    ]
    for (const t of thresholds) {
      expect(Number.isInteger(t)).toBe(true)
      expect(t).toBeGreaterThan(0)
    }
  })
})

// ─── Performance Thresholds ───────────────────────────
describe('performance thresholds', () => {
  it('PERFORMANCE_SLOW_THRESHOLD_MS is 50', () => {
    expect(PERFORMANCE_SLOW_THRESHOLD_MS).toBe(50)
  })

  it('PERFORMANCE_VERY_SLOW_THRESHOLD_MS is 100', () => {
    expect(PERFORMANCE_VERY_SLOW_THRESHOLD_MS).toBe(100)
  })

  it('very slow threshold is greater than slow threshold', () => {
    expect(PERFORMANCE_VERY_SLOW_THRESHOLD_MS).toBeGreaterThan(PERFORMANCE_SLOW_THRESHOLD_MS)
  })

  it('both thresholds are positive integers', () => {
    expect(Number.isInteger(PERFORMANCE_SLOW_THRESHOLD_MS)).toBe(true)
    expect(PERFORMANCE_SLOW_THRESHOLD_MS).toBeGreaterThan(0)
    expect(Number.isInteger(PERFORMANCE_VERY_SLOW_THRESHOLD_MS)).toBe(true)
    expect(PERFORMANCE_VERY_SLOW_THRESHOLD_MS).toBeGreaterThan(0)
  })
})

// ─── General Configuration ────────────────────────────
describe('general configuration', () => {
  it('DEFAULT_DEBOUNCE_MS is 300', () => {
    expect(DEFAULT_DEBOUNCE_MS).toBe(300)
  })

  it('DEFAULT_MAX_LINES is 300', () => {
    expect(DEFAULT_MAX_LINES).toBe(300)
  })

  it('DEFAULT_MAX_FILE_SIZE_LINES is 500', () => {
    expect(DEFAULT_MAX_FILE_SIZE_LINES).toBe(500)
  })

  it('FILE_COUNT_THRESHOLD is 1000', () => {
    expect(FILE_COUNT_THRESHOLD).toBe(1000)
  })

  it('TIME_FORMAT_THRESHOLD_MS is 1000', () => {
    expect(TIME_FORMAT_THRESHOLD_MS).toBe(1000)
  })

  it('DEFAULT_FIX_PRIORITY is 10', () => {
    expect(DEFAULT_FIX_PRIORITY).toBe(10)
  })

  it('DEFAULT_CONCURRENCY is a positive integer', () => {
    expect(Number.isInteger(DEFAULT_CONCURRENCY)).toBe(true)
    expect(DEFAULT_CONCURRENCY).toBeGreaterThan(0)
  })

  it('DEFAULT_CONCURRENCY defaults to 4 without UV_THREADPOOL_SIZE', () => {
    expect(DEFAULT_CONCURRENCY).toBe(4)
  })

  it('all general config values are positive integers', () => {
    const values = [
      DEFAULT_DEBOUNCE_MS,
      DEFAULT_MAX_LINES,
      DEFAULT_MAX_FILE_SIZE_LINES,
      FILE_COUNT_THRESHOLD,
      TIME_FORMAT_THRESHOLD_MS,
      DEFAULT_FIX_PRIORITY,
    ]
    for (const v of values) {
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThan(0)
    }
  })
})

// ─── Defaults for Commands ────────────────────────────
describe('defaults for commands', () => {
  it('DEFAULT_BENCHMARK_ITERATIONS is 3', () => {
    expect(DEFAULT_BENCHMARK_ITERATIONS).toBe(3)
  })

  it('DEFAULT_BENCHMARK_TOP is 20', () => {
    expect(DEFAULT_BENCHMARK_TOP).toBe(20)
  })

  it('DEFAULT_MAX_WARNINGS is 10', () => {
    expect(DEFAULT_MAX_WARNINGS).toBe(10)
  })

  it('FIX_PRIORITY_DEFAULT is 10', () => {
    expect(FIX_PRIORITY_DEFAULT).toBe(10)
  })

  it('FIX_PRIORITY_DEFAULT matches DEFAULT_FIX_PRIORITY', () => {
    expect(FIX_PRIORITY_DEFAULT).toBe(DEFAULT_FIX_PRIORITY)
  })

  it('all command defaults are positive integers', () => {
    const defaults = [
      DEFAULT_BENCHMARK_ITERATIONS,
      DEFAULT_BENCHMARK_TOP,
      DEFAULT_MAX_WARNINGS,
      FIX_PRIORITY_DEFAULT,
    ]
    for (const d of defaults) {
      expect(Number.isInteger(d)).toBe(true)
      expect(d).toBeGreaterThan(0)
    }
  })
})

// ─── Memory/Byte Constants ────────────────────────────
describe('memory/byte constants', () => {
  it('BYTES_PER_KB is 1024', () => {
    expect(BYTES_PER_KB).toBe(1024)
  })

  it('RANDOM_BYTES_LENGTH is 8', () => {
    expect(RANDOM_BYTES_LENGTH).toBe(8)
  })

  it('BYTES_PER_KB is a power of 2', () => {
    expect(BYTES_PER_KB & (BYTES_PER_KB - 1)).toBe(0)
  })

  it('both constants are positive integers', () => {
    expect(Number.isInteger(BYTES_PER_KB)).toBe(true)
    expect(BYTES_PER_KB).toBeGreaterThan(0)
    expect(Number.isInteger(RANDOM_BYTES_LENGTH)).toBe(true)
    expect(RANDOM_BYTES_LENGTH).toBeGreaterThan(0)
  })
})

// ─── File Permissions ─────────────────────────────────
describe('file permissions', () => {
  it('FILE_PERMISSION_EXECUTABLE is 0o755', () => {
    expect(FILE_PERMISSION_EXECUTABLE).toBe(0o755)
  })

  it('FILE_PERMISSION_EXECUTABLE is a valid octal permission', () => {
    expect(FILE_PERMISSION_EXECUTABLE).toBeGreaterThan(0)
    expect(FILE_PERMISSION_EXECUTABLE).toBeLessThanOrEqual(0o777)
  })

  it('FILE_PERMISSION_EXECUTABLE has owner read/write/execute', () => {
    expect(FILE_PERMISSION_EXECUTABLE & 0o700).toBe(0o700)
  })

  it('FILE_PERMISSION_EXECUTABLE has group read/execute', () => {
    expect(FILE_PERMISSION_EXECUTABLE & 0o050).toBe(0o050)
  })

  it('FILE_PERMISSION_EXECUTABLE has others read/execute', () => {
    expect(FILE_PERMISSION_EXECUTABLE & 0o005).toBe(0o005)
  })
})

// ─── Default Ignore Patterns ──────────────────────────
describe('DEFAULT_IGNORE_PATTERNS', () => {
  it('is an array', () => {
    expect(Array.isArray(DEFAULT_IGNORE_PATTERNS)).toBe(true)
  })

  it('has 7 entries', () => {
    expect(DEFAULT_IGNORE_PATTERNS).toHaveLength(7)
  })

  it('includes node_modules', () => {
    expect(DEFAULT_IGNORE_PATTERNS).toContain('node_modules/**')
  })

  it('includes dist', () => {
    expect(DEFAULT_IGNORE_PATTERNS).toContain('dist/**')
  })

  it('includes coverage', () => {
    expect(DEFAULT_IGNORE_PATTERNS).toContain('coverage/**')
  })

  it('includes .git', () => {
    expect(DEFAULT_IGNORE_PATTERNS).toContain('.git/**')
  })

  it('includes minified JS', () => {
    expect(DEFAULT_IGNORE_PATTERNS).toContain('*.min.js')
  })

  it('includes minified TS', () => {
    expect(DEFAULT_IGNORE_PATTERNS).toContain('*.min.ts')
  })

  it('includes vendor', () => {
    expect(DEFAULT_IGNORE_PATTERNS).toContain('vendor/**')
  })

  it('all entries are non-empty strings', () => {
    for (const pattern of DEFAULT_IGNORE_PATTERNS) {
      expect(typeof pattern).toBe('string')
      expect(pattern.length).toBeGreaterThan(0)
    }
  })

  it('all entries are unique', () => {
    expect(new Set(DEFAULT_IGNORE_PATTERNS).size).toBe(DEFAULT_IGNORE_PATTERNS.length)
  })
})

// ─── Default File Patterns ────────────────────────────
describe('DEFAULT_FILE_PATTERNS', () => {
  it('is an array', () => {
    expect(Array.isArray(DEFAULT_FILE_PATTERNS)).toBe(true)
  })

  it('has 4 entries', () => {
    expect(DEFAULT_FILE_PATTERNS).toHaveLength(4)
  })

  it('includes TypeScript files', () => {
    expect(DEFAULT_FILE_PATTERNS).toContain('**/*.ts')
  })

  it('includes TSX files', () => {
    expect(DEFAULT_FILE_PATTERNS).toContain('**/*.tsx')
  })

  it('includes JavaScript files', () => {
    expect(DEFAULT_FILE_PATTERNS).toContain('**/*.js')
  })

  it('includes JSX files', () => {
    expect(DEFAULT_FILE_PATTERNS).toContain('**/*.jsx')
  })

  it('all entries are non-empty strings', () => {
    for (const pattern of DEFAULT_FILE_PATTERNS) {
      expect(typeof pattern).toBe('string')
      expect(pattern.length).toBeGreaterThan(0)
    }
  })

  it('all entries are unique', () => {
    expect(new Set(DEFAULT_FILE_PATTERNS).size).toBe(DEFAULT_FILE_PATTERNS.length)
  })

  it('all entries use globstar prefix', () => {
    for (const pattern of DEFAULT_FILE_PATTERNS) {
      expect(pattern.startsWith('**/')).toBe(true)
    }
  })
})

// ─── Testing Framework Constants ──────────────────────
describe('TEST_FUNCTIONS', () => {
  it('is a Set', () => {
    expect(TEST_FUNCTIONS).toBeInstanceOf(Set)
  })

  it('has exactly 3 entries', () => {
    expect(TEST_FUNCTIONS.size).toBe(3)
  })

  it('contains describe', () => {
    expect(TEST_FUNCTIONS.has('describe')).toBe(true)
  })

  it('contains it', () => {
    expect(TEST_FUNCTIONS.has('it')).toBe(true)
  })

  it('contains test', () => {
    expect(TEST_FUNCTIONS.has('test')).toBe(true)
  })

  it('does not contain beforeEach', () => {
    expect(TEST_FUNCTIONS.has('beforeEach')).toBe(false)
  })
})

describe('TEST_CASE_FUNCTIONS', () => {
  it('is a Set', () => {
    expect(TEST_CASE_FUNCTIONS).toBeInstanceOf(Set)
  })

  it('has exactly 2 entries', () => {
    expect(TEST_CASE_FUNCTIONS.size).toBe(2)
  })

  it('contains it', () => {
    expect(TEST_CASE_FUNCTIONS.has('it')).toBe(true)
  })

  it('contains test', () => {
    expect(TEST_CASE_FUNCTIONS.has('test')).toBe(true)
  })

  it('is a subset of TEST_FUNCTIONS', () => {
    for (const fn of TEST_CASE_FUNCTIONS) {
      expect(TEST_FUNCTIONS.has(fn)).toBe(true)
    }
  })
})

describe('DESCRIBE_FUNCTIONS', () => {
  it('is a Set', () => {
    expect(DESCRIBE_FUNCTIONS).toBeInstanceOf(Set)
  })

  it('has exactly 3 entries', () => {
    expect(DESCRIBE_FUNCTIONS.size).toBe(3)
  })

  it('contains context', () => {
    expect(DESCRIBE_FUNCTIONS.has('context')).toBe(true)
  })

  it('contains describe', () => {
    expect(DESCRIBE_FUNCTIONS.has('describe')).toBe(true)
  })

  it('contains suite', () => {
    expect(DESCRIBE_FUNCTIONS.has('suite')).toBe(true)
  })

  it('does not contain it', () => {
    expect(DESCRIBE_FUNCTIONS.has('it')).toBe(false)
  })
})

describe('HOOK_FUNCTIONS', () => {
  it('is a Set', () => {
    expect(HOOK_FUNCTIONS).toBeInstanceOf(Set)
  })

  it('has exactly 4 entries', () => {
    expect(HOOK_FUNCTIONS.size).toBe(4)
  })

  it('contains afterAll', () => {
    expect(HOOK_FUNCTIONS.has('afterAll')).toBe(true)
  })

  it('contains afterEach', () => {
    expect(HOOK_FUNCTIONS.has('afterEach')).toBe(true)
  })

  it('contains beforeAll', () => {
    expect(HOOK_FUNCTIONS.has('beforeAll')).toBe(true)
  })

  it('contains beforeEach', () => {
    expect(HOOK_FUNCTIONS.has('beforeEach')).toBe(true)
  })

  it('is disjoint from TEST_FUNCTIONS', () => {
    for (const fn of HOOK_FUNCTIONS) {
      expect(TEST_FUNCTIONS.has(fn)).toBe(false)
    }
  })
})

describe('TEST_AND_HOOK_FUNCTIONS', () => {
  it('is a Set', () => {
    expect(TEST_AND_HOOK_FUNCTIONS).toBeInstanceOf(Set)
  })

  it('has exactly 6 entries', () => {
    expect(TEST_AND_HOOK_FUNCTIONS.size).toBe(6)
  })

  it('contains all test case functions', () => {
    expect(TEST_AND_HOOK_FUNCTIONS.has('it')).toBe(true)
    expect(TEST_AND_HOOK_FUNCTIONS.has('test')).toBe(true)
  })

  it('contains all hook functions', () => {
    expect(TEST_AND_HOOK_FUNCTIONS.has('afterAll')).toBe(true)
    expect(TEST_AND_HOOK_FUNCTIONS.has('afterEach')).toBe(true)
    expect(TEST_AND_HOOK_FUNCTIONS.has('beforeAll')).toBe(true)
    expect(TEST_AND_HOOK_FUNCTIONS.has('beforeEach')).toBe(true)
  })

  it('is the union of TEST_CASE_FUNCTIONS and HOOK_FUNCTIONS', () => {
    const union = new Set([...TEST_CASE_FUNCTIONS, ...HOOK_FUNCTIONS])
    expect(TEST_AND_HOOK_FUNCTIONS).toEqual(union)
  })
})

describe('TEST_SKIP_METHODS', () => {
  it('is a Set', () => {
    expect(TEST_SKIP_METHODS).toBeInstanceOf(Set)
  })

  it('has exactly 2 entries', () => {
    expect(TEST_SKIP_METHODS.size).toBe(2)
  })

  it('contains only', () => {
    expect(TEST_SKIP_METHODS.has('only')).toBe(true)
  })

  it('contains skip', () => {
    expect(TEST_SKIP_METHODS.has('skip')).toBe(true)
  })
})

describe('X_PREFIX_SKIP_FUNCTIONS', () => {
  it('is a Set', () => {
    expect(X_PREFIX_SKIP_FUNCTIONS).toBeInstanceOf(Set)
  })

  it('has exactly 3 entries', () => {
    expect(X_PREFIX_SKIP_FUNCTIONS.size).toBe(3)
  })

  it('contains xdescribe', () => {
    expect(X_PREFIX_SKIP_FUNCTIONS.has('xdescribe')).toBe(true)
  })

  it('contains xit', () => {
    expect(X_PREFIX_SKIP_FUNCTIONS.has('xit')).toBe(true)
  })

  it('contains xtest', () => {
    expect(X_PREFIX_SKIP_FUNCTIONS.has('xtest')).toBe(true)
  })

  it('all entries start with x', () => {
    for (const fn of X_PREFIX_SKIP_FUNCTIONS) {
      expect(fn.startsWith('x')).toBe(true)
    }
  })
})

describe('EQUALITY_MATCHERS', () => {
  it('is a Set', () => {
    expect(EQUALITY_MATCHERS).toBeInstanceOf(Set)
  })

  it('has exactly 3 entries', () => {
    expect(EQUALITY_MATCHERS.size).toBe(3)
  })

  it('contains toBe', () => {
    expect(EQUALITY_MATCHERS.has('toBe')).toBe(true)
  })

  it('contains toEqual', () => {
    expect(EQUALITY_MATCHERS.has('toEqual')).toBe(true)
  })

  it('contains toStrictEqual', () => {
    expect(EQUALITY_MATCHERS.has('toStrictEqual')).toBe(true)
  })

  it('all entries start with "to"', () => {
    for (const m of EQUALITY_MATCHERS) {
      expect(m.startsWith('to')).toBe(true)
    }
  })
})

// ─── Regex Special Characters ─────────────────────────
describe('REGEX_SPECIAL_CHARS', () => {
  it('is a Set', () => {
    expect(REGEX_SPECIAL_CHARS).toBeInstanceOf(Set)
  })

  it('has exactly 15 entries', () => {
    expect(REGEX_SPECIAL_CHARS.size).toBe(15)
  })

  it('contains dollar sign', () => {
    expect(REGEX_SPECIAL_CHARS.has('$')).toBe(true)
  })

  it('contains parentheses', () => {
    expect(REGEX_SPECIAL_CHARS.has('(')).toBe(true)
    expect(REGEX_SPECIAL_CHARS.has(')')).toBe(true)
  })

  it('contains asterisk', () => {
    expect(REGEX_SPECIAL_CHARS.has('*')).toBe(true)
  })

  it('contains plus', () => {
    expect(REGEX_SPECIAL_CHARS.has('+')).toBe(true)
  })

  it('contains dot', () => {
    expect(REGEX_SPECIAL_CHARS.has('.')).toBe(true)
  })

  it('contains forward slash', () => {
    expect(REGEX_SPECIAL_CHARS.has('/')).toBe(true)
  })

  it('contains question mark', () => {
    expect(REGEX_SPECIAL_CHARS.has('?')).toBe(true)
  })

  it('contains square brackets', () => {
    expect(REGEX_SPECIAL_CHARS.has('[')).toBe(true)
    expect(REGEX_SPECIAL_CHARS.has(']')).toBe(true)
  })

  it('contains backslash', () => {
    expect(REGEX_SPECIAL_CHARS.has('\\')).toBe(true)
  })

  it('contains caret', () => {
    expect(REGEX_SPECIAL_CHARS.has('^')).toBe(true)
  })

  it('contains curly braces', () => {
    expect(REGEX_SPECIAL_CHARS.has('{')).toBe(true)
    expect(REGEX_SPECIAL_CHARS.has('}')).toBe(true)
  })

  it('contains pipe', () => {
    expect(REGEX_SPECIAL_CHARS.has('|')).toBe(true)
  })

  it('all entries are single characters', () => {
    for (const ch of REGEX_SPECIAL_CHARS) {
      expect(ch).toHaveLength(1)
    }
  })

  it('does not contain non-special characters', () => {
    expect(REGEX_SPECIAL_CHARS.has('a')).toBe(false)
    expect(REGEX_SPECIAL_CHARS.has('0')).toBe(false)
    expect(REGEX_SPECIAL_CHARS.has(' ')).toBe(false)
  })
})

// ─── Dangerous Functions ──────────────────────────────
describe('DANGEROUS_FUNCTIONS', () => {
  it('is a Set', () => {
    expect(DANGEROUS_FUNCTIONS).toBeInstanceOf(Set)
  })

  it('has exactly 6 entries', () => {
    expect(DANGEROUS_FUNCTIONS.size).toBe(6)
  })

  it('contains eval', () => {
    expect(DANGEROUS_FUNCTIONS.has('eval')).toBe(true)
  })

  it('contains execScript', () => {
    expect(DANGEROUS_FUNCTIONS.has('execScript')).toBe(true)
  })

  it('contains Function', () => {
    expect(DANGEROUS_FUNCTIONS.has('Function')).toBe(true)
  })

  it('contains setImmediate', () => {
    expect(DANGEROUS_FUNCTIONS.has('setImmediate')).toBe(true)
  })

  it('contains setInterval', () => {
    expect(DANGEROUS_FUNCTIONS.has('setInterval')).toBe(true)
  })

  it('contains setTimeout', () => {
    expect(DANGEROUS_FUNCTIONS.has('setTimeout')).toBe(true)
  })

  it('all entries are non-empty strings', () => {
    for (const fn of DANGEROUS_FUNCTIONS) {
      expect(typeof fn).toBe('string')
      expect(fn.length).toBeGreaterThan(0)
    }
  })
})

// ─── Mutating Array Methods ───────────────────────────
describe('MUTATING_ARRAY_METHODS', () => {
  it('is a Set', () => {
    expect(MUTATING_ARRAY_METHODS).toBeInstanceOf(Set)
  })

  it('has exactly 9 entries', () => {
    expect(MUTATING_ARRAY_METHODS.size).toBe(9)
  })

  it('contains copyWithin', () => {
    expect(MUTATING_ARRAY_METHODS.has('copyWithin')).toBe(true)
  })

  it('contains fill', () => {
    expect(MUTATING_ARRAY_METHODS.has('fill')).toBe(true)
  })

  it('contains pop', () => {
    expect(MUTATING_ARRAY_METHODS.has('pop')).toBe(true)
  })

  it('contains push', () => {
    expect(MUTATING_ARRAY_METHODS.has('push')).toBe(true)
  })

  it('contains reverse', () => {
    expect(MUTATING_ARRAY_METHODS.has('reverse')).toBe(true)
  })

  it('contains shift', () => {
    expect(MUTATING_ARRAY_METHODS.has('shift')).toBe(true)
  })

  it('contains sort', () => {
    expect(MUTATING_ARRAY_METHODS.has('sort')).toBe(true)
  })

  it('contains splice', () => {
    expect(MUTATING_ARRAY_METHODS.has('splice')).toBe(true)
  })

  it('contains unshift', () => {
    expect(MUTATING_ARRAY_METHODS.has('unshift')).toBe(true)
  })

  it('does not contain non-mutating methods', () => {
    expect(MUTATING_ARRAY_METHODS.has('map')).toBe(false)
    expect(MUTATING_ARRAY_METHODS.has('filter')).toBe(false)
    expect(MUTATING_ARRAY_METHODS.has('reduce')).toBe(false)
    expect(MUTATING_ARRAY_METHODS.has('forEach')).toBe(false)
    expect(MUTATING_ARRAY_METHODS.has('slice')).toBe(false)
    expect(MUTATING_ARRAY_METHODS.has('concat')).toBe(false)
    expect(MUTATING_ARRAY_METHODS.has('find')).toBe(false)
  })

  it('all entries are non-empty strings', () => {
    for (const method of MUTATING_ARRAY_METHODS) {
      expect(typeof method).toBe('string')
      expect(method.length).toBeGreaterThan(0)
    }
  })
})

// ─── Cross-Constant Relationships ─────────────────────
describe('cross-constant relationships', () => {
  it('DEFAULT_MAX_FILE_SIZE_LINES is greater than DEFAULT_MAX_LINES', () => {
    expect(DEFAULT_MAX_FILE_SIZE_LINES).toBeGreaterThan(DEFAULT_MAX_LINES)
  })

  it('MAX_DIFF_VIOLATIONS is at least as large as MAX_UNMAPPED_RULES_TO_SHOW', () => {
    expect(MAX_DIFF_VIOLATIONS).toBeGreaterThanOrEqual(MAX_UNMAPPED_RULES_TO_SHOW)
  })

  it('PERFORMANCE_VERY_SLOW_THRESHOLD_MS is exactly double PERFORMANCE_SLOW_THRESHOLD_MS', () => {
    expect(PERFORMANCE_VERY_SLOW_THRESHOLD_MS).toBe(PERFORMANCE_SLOW_THRESHOLD_MS * 2)
  })

  it('TIME_FORMAT_THRESHOLD_MS equals 1 second in ms', () => {
    expect(TIME_FORMAT_THRESHOLD_MS).toBe(1000)
  })

  it('BYTES_PER_KB equals 1024', () => {
    expect(BYTES_PER_KB).toBe(1024)
  })

  it('debt thresholds are ordered by severity weight', () => {
    expect(DEBT_OVERALL_THRESHOLD_HIGH).toBeGreaterThanOrEqual(DEBT_COMPLEXITY_THRESHOLD_HIGH)
    expect(DEBT_OVERALL_THRESHOLD_HIGH).toBeGreaterThanOrEqual(DEBT_SECURITY_THRESHOLD_HIGH)
  })

  it('max files to process is less than file count threshold', () => {
    expect(MAX_FILES_TO_PROCESS).toBeLessThan(FILE_COUNT_THRESHOLD)
  })

  it('benchmark top is within file processing limits', () => {
    expect(DEFAULT_BENCHMARK_TOP).toBeLessThanOrEqual(MAX_ORGANIZE_IMPORTS_FILES)
  })
})
