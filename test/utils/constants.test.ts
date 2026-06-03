import { describe, expect, it } from 'vitest'
import {
  SEVERITY_INFO,
  SEVERITY_WARNING,
  SEVERITY_ERROR,
  HEALTH_SCORE_THRESHOLD_A,
  HEALTH_SCORE_THRESHOLD_B,
  HEALTH_SCORE_THRESHOLD_C,
  HEALTH_SCORE_THRESHOLD_D,
  HEALTH_SCORE_MAX,
  TIME_FORMAT_THRESHOLD_MS,
  BYTES_PER_KB,
  DEFAULT_CONCURRENCY,
  DEFAULT_IGNORE_PATTERNS,
  DEFAULT_FILE_PATTERNS,
  TEST_FUNCTIONS,
  TEST_CASE_FUNCTIONS,
  DESCRIBE_FUNCTIONS,
  HOOK_FUNCTIONS,
  DANGEROUS_FUNCTIONS,
  MUTATING_ARRAY_METHODS,
  REGEX_SPECIAL_CHARS,
} from '../../src/utils/constants.js'

// ─── Severity Levels ───

describe('constants severity levels', () => {
  it('has ascending severity order', () => {
    expect(SEVERITY_INFO).toBeLessThan(SEVERITY_WARNING)
    expect(SEVERITY_WARNING).toBeLessThan(SEVERITY_ERROR)
  })
})

// ─── Health Score Thresholds ───

describe('constants health score thresholds', () => {
  it('has descending thresholds', () => {
    expect(HEALTH_SCORE_THRESHOLD_A).toBeGreaterThan(HEALTH_SCORE_THRESHOLD_B)
    expect(HEALTH_SCORE_THRESHOLD_B).toBeGreaterThan(HEALTH_SCORE_THRESHOLD_C)
    expect(HEALTH_SCORE_THRESHOLD_C).toBeGreaterThan(HEALTH_SCORE_THRESHOLD_D)
  })

  it('max score is 100', () => {
    expect(HEALTH_SCORE_MAX).toBe(100)
  })

  it('A threshold is 90', () => {
    expect(HEALTH_SCORE_THRESHOLD_A).toBe(90)
  })

  it('D threshold is 60', () => {
    expect(HEALTH_SCORE_THRESHOLD_D).toBe(60)
  })
})

// ─── Format & Byte Constants ───

describe('constants format and bytes', () => {
  it('TIME_FORMAT_THRESHOLD_MS is 1000', () => {
    expect(TIME_FORMAT_THRESHOLD_MS).toBe(1000)
  })

  it('BYTES_PER_KB is 1024', () => {
    expect(BYTES_PER_KB).toBe(1024)
  })

  it('DEFAULT_CONCURRENCY is a positive number', () => {
    expect(DEFAULT_CONCURRENCY).toBeGreaterThan(0)
  })
})

// ─── Default Patterns ───

describe('constants default patterns', () => {
  it('DEFAULT_IGNORE_PATTERNS includes node_modules', () => {
    expect(DEFAULT_IGNORE_PATTERNS).toContain('node_modules/**')
  })

  it('DEFAULT_IGNORE_PATTERNS includes dist', () => {
    expect(DEFAULT_IGNORE_PATTERNS).toContain('dist/**')
  })

  it('DEFAULT_FILE_PATTERNS includes ts and js', () => {
    expect(DEFAULT_FILE_PATTERNS).toContain('**/*.ts')
    expect(DEFAULT_FILE_PATTERNS).toContain('**/*.js')
  })

  it('patterns are arrays', () => {
    expect(Array.isArray(DEFAULT_IGNORE_PATTERNS)).toBe(true)
    expect(Array.isArray(DEFAULT_FILE_PATTERNS)).toBe(true)
  })
})

// ─── Test Function Sets ───

describe('constants test function sets', () => {
  it('TEST_FUNCTIONS contains core test functions', () => {
    expect(TEST_FUNCTIONS.has('describe')).toBe(true)
    expect(TEST_FUNCTIONS.has('it')).toBe(true)
    expect(TEST_FUNCTIONS.has('test')).toBe(true)
  })

  it('TEST_CASE_FUNCTIONS excludes describe', () => {
    expect(TEST_CASE_FUNCTIONS.has('it')).toBe(true)
    expect(TEST_CASE_FUNCTIONS.has('test')).toBe(true)
    expect(TEST_CASE_FUNCTIONS.has('describe')).toBe(false)
  })

  it('DESCRIBE_FUNCTIONS includes context and suite', () => {
    expect(DESCRIBE_FUNCTIONS.has('context')).toBe(true)
    expect(DESCRIBE_FUNCTIONS.has('suite')).toBe(true)
  })

  it('HOOK_FUNCTIONS has all lifecycle hooks', () => {
    expect(HOOK_FUNCTIONS.has('beforeEach')).toBe(true)
    expect(HOOK_FUNCTIONS.has('afterEach')).toBe(true)
    expect(HOOK_FUNCTIONS.has('beforeAll')).toBe(true)
    expect(HOOK_FUNCTIONS.has('afterAll')).toBe(true)
  })
})

// ─── Security Constants ───

describe('constants security', () => {
  it('DANGEROUS_FUNCTIONS includes eval', () => {
    expect(DANGEROUS_FUNCTIONS.has('eval')).toBe(true)
  })

  it('DANGEROUS_FUNCTIONS includes setTimeout', () => {
    expect(DANGEROUS_FUNCTIONS.has('setTimeout')).toBe(true)
  })

  it('MUTATING_ARRAY_METHODS includes push and pop', () => {
    expect(MUTATING_ARRAY_METHODS.has('push')).toBe(true)
    expect(MUTATING_ARRAY_METHODS.has('pop')).toBe(true)
    expect(MUTATING_ARRAY_METHODS.has('splice')).toBe(true)
  })

  it('MUTATING_ARRAY_METHODS excludes map and filter', () => {
    expect(MUTATING_ARRAY_METHODS.has('map')).toBe(false)
    expect(MUTATING_ARRAY_METHODS.has('filter')).toBe(false)
  })
})

// ─── Regex Special Chars ───

describe('constants regex special chars', () => {
  it('includes dot and star', () => {
    expect(REGEX_SPECIAL_CHARS.has('.')).toBe(true)
    expect(REGEX_SPECIAL_CHARS.has('*')).toBe(true)
  })

  it('includes brackets and parentheses', () => {
    expect(REGEX_SPECIAL_CHARS.has('[')).toBe(true)
    expect(REGEX_SPECIAL_CHARS.has('(')).toBe(true)
  })

  it('includes asterisk and plus', () => {
    expect(REGEX_SPECIAL_CHARS.has('*')).toBe(true)
    expect(REGEX_SPECIAL_CHARS.has('+')).toBe(true)
  })

  it('REGEX_SPECIAL_CHARS does not include letters', () => {
    expect(REGEX_SPECIAL_CHARS.has('a')).toBe(false)
  })
})
