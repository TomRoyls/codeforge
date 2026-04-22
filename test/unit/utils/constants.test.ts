import { describe, test, expect } from 'vitest'
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
} from '../../../src/utils/constants.js'

// ============================================================================
// SEVERITY LEVELS
// ============================================================================

describe('constants', () => {
  describe('SEVERITY_INFO', () => {
    test('should be defined', () => {
      expect(SEVERITY_INFO).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof SEVERITY_INFO).toBe('number')
    })

    test('should be 1', () => {
      expect(SEVERITY_INFO).toBe(1)
    })

    test('should be a positive integer', () => {
      expect(SEVERITY_INFO).toBeGreaterThan(0)
      expect(Number.isInteger(SEVERITY_INFO)).toBe(true)
    })
  })

  describe('SEVERITY_WARNING', () => {
    test('should be defined', () => {
      expect(SEVERITY_WARNING).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof SEVERITY_WARNING).toBe('number')
    })

    test('should be 2', () => {
      expect(SEVERITY_WARNING).toBe(2)
    })

    test('should be a positive integer', () => {
      expect(SEVERITY_WARNING).toBeGreaterThan(0)
      expect(Number.isInteger(SEVERITY_WARNING)).toBe(true)
    })
  })

  describe('SEVERITY_ERROR', () => {
    test('should be defined', () => {
      expect(SEVERITY_ERROR).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof SEVERITY_ERROR).toBe('number')
    })

    test('should be 3', () => {
      expect(SEVERITY_ERROR).toBe(3)
    })

    test('should be a positive integer', () => {
      expect(SEVERITY_ERROR).toBeGreaterThan(0)
      expect(Number.isInteger(SEVERITY_ERROR)).toBe(true)
    })
  })

  describe('severity level ordering', () => {
    test('INFO should be less than WARNING', () => {
      expect(SEVERITY_INFO).toBeLessThan(SEVERITY_WARNING)
    })

    test('WARNING should be less than ERROR', () => {
      expect(SEVERITY_WARNING).toBeLessThan(SEVERITY_ERROR)
    })

    test('INFO should be less than ERROR', () => {
      expect(SEVERITY_INFO).toBeLessThan(SEVERITY_ERROR)
    })

    test('all three severity levels should be distinct', () => {
      const levels = new Set([SEVERITY_INFO, SEVERITY_WARNING, SEVERITY_ERROR])
      expect(levels.size).toBe(3)
    })

    test('severity levels should form consecutive integers', () => {
      expect(SEVERITY_WARNING - SEVERITY_INFO).toBe(1)
      expect(SEVERITY_ERROR - SEVERITY_WARNING).toBe(1)
    })
  })

  // ============================================================================
  // FILE PROCESSING LIMITS
  // ============================================================================

  describe('MAX_FILES_TO_PROCESS', () => {
    test('should be defined', () => {
      expect(MAX_FILES_TO_PROCESS).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof MAX_FILES_TO_PROCESS).toBe('number')
    })

    test('should be 100', () => {
      expect(MAX_FILES_TO_PROCESS).toBe(100)
    })

    test('should be a positive integer', () => {
      expect(MAX_FILES_TO_PROCESS).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_FILES_TO_PROCESS)).toBe(true)
    })
  })

  describe('MAX_ORGANIZE_IMPORTS_FILES', () => {
    test('should be defined', () => {
      expect(MAX_ORGANIZE_IMPORTS_FILES).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof MAX_ORGANIZE_IMPORTS_FILES).toBe('number')
    })

    test('should be 200', () => {
      expect(MAX_ORGANIZE_IMPORTS_FILES).toBe(200)
    })

    test('should be a positive integer', () => {
      expect(MAX_ORGANIZE_IMPORTS_FILES).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_ORGANIZE_IMPORTS_FILES)).toBe(true)
    })

    test('should be greater than MAX_FILES_TO_PROCESS', () => {
      expect(MAX_ORGANIZE_IMPORTS_FILES).toBeGreaterThan(MAX_FILES_TO_PROCESS)
    })
  })

  // ============================================================================
  // DISPLAY/UI LIMITS
  // ============================================================================

  describe('MAX_VIOLATIONS_TO_SHOW', () => {
    test('should be defined', () => {
      expect(MAX_VIOLATIONS_TO_SHOW).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof MAX_VIOLATIONS_TO_SHOW).toBe('number')
    })

    test('should be 3', () => {
      expect(MAX_VIOLATIONS_TO_SHOW).toBe(3)
    })

    test('should be a positive integer', () => {
      expect(MAX_VIOLATIONS_TO_SHOW).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_VIOLATIONS_TO_SHOW)).toBe(true)
    })
  })

  describe('MAX_DIFF_VIOLATIONS', () => {
    test('should be defined', () => {
      expect(MAX_DIFF_VIOLATIONS).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof MAX_DIFF_VIOLATIONS).toBe('number')
    })

    test('should be 20', () => {
      expect(MAX_DIFF_VIOLATIONS).toBe(20)
    })

    test('should be a positive integer', () => {
      expect(MAX_DIFF_VIOLATIONS).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_DIFF_VIOLATIONS)).toBe(true)
    })

    test('should be greater than MAX_VIOLATIONS_TO_SHOW', () => {
      expect(MAX_DIFF_VIOLATIONS).toBeGreaterThan(MAX_VIOLATIONS_TO_SHOW)
    })
  })

  describe('MAX_DEBT_HISTORY_ENTRIES', () => {
    test('should be defined', () => {
      expect(MAX_DEBT_HISTORY_ENTRIES).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof MAX_DEBT_HISTORY_ENTRIES).toBe('number')
    })

    test('should be 30', () => {
      expect(MAX_DEBT_HISTORY_ENTRIES).toBe(30)
    })

    test('should be a positive integer', () => {
      expect(MAX_DEBT_HISTORY_ENTRIES).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_DEBT_HISTORY_ENTRIES)).toBe(true)
    })
  })

  describe('MAX_RECOMMENDATIONS', () => {
    test('should be defined', () => {
      expect(MAX_RECOMMENDATIONS).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof MAX_RECOMMENDATIONS).toBe('number')
    })

    test('should be 5', () => {
      expect(MAX_RECOMMENDATIONS).toBe(5)
    })

    test('should be a positive integer', () => {
      expect(MAX_RECOMMENDATIONS).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_RECOMMENDATIONS)).toBe(true)
    })
  })

  describe('MAX_UNMAPPED_RULES_TO_SHOW', () => {
    test('should be defined', () => {
      expect(MAX_UNMAPPED_RULES_TO_SHOW).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof MAX_UNMAPPED_RULES_TO_SHOW).toBe('number')
    })

    test('should be 10', () => {
      expect(MAX_UNMAPPED_RULES_TO_SHOW).toBe(10)
    })

    test('should be a positive integer', () => {
      expect(MAX_UNMAPPED_RULES_TO_SHOW).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_UNMAPPED_RULES_TO_SHOW)).toBe(true)
    })
  })

  describe('MAX_TOP_SUGGESTIONS', () => {
    test('should be defined', () => {
      expect(MAX_TOP_SUGGESTIONS).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof MAX_TOP_SUGGESTIONS).toBe('number')
    })

    test('should be 15', () => {
      expect(MAX_TOP_SUGGESTIONS).toBe(15)
    })

    test('should be a positive integer', () => {
      expect(MAX_TOP_SUGGESTIONS).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_TOP_SUGGESTIONS)).toBe(true)
    })
  })

  describe('MAX_TOP_STATS_FILES', () => {
    test('should be defined', () => {
      expect(MAX_TOP_STATS_FILES).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof MAX_TOP_STATS_FILES).toBe('number')
    })

    test('should be 10', () => {
      expect(MAX_TOP_STATS_FILES).toBe(10)
    })

    test('should be a positive integer', () => {
      expect(MAX_TOP_STATS_FILES).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_TOP_STATS_FILES)).toBe(true)
    })

    test('should equal MAX_UNMAPPED_RULES_TO_SHOW', () => {
      expect(MAX_TOP_STATS_FILES).toBe(MAX_UNMAPPED_RULES_TO_SHOW)
    })
  })

  describe('MAX_TOP_RULES_SHOWN', () => {
    test('should be defined', () => {
      expect(MAX_TOP_RULES_SHOWN).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof MAX_TOP_RULES_SHOWN).toBe('number')
    })

    test('should be 5', () => {
      expect(MAX_TOP_RULES_SHOWN).toBe(5)
    })

    test('should be a positive integer', () => {
      expect(MAX_TOP_RULES_SHOWN).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_TOP_RULES_SHOWN)).toBe(true)
    })

    test('should equal MAX_RECOMMENDATIONS', () => {
      expect(MAX_TOP_RULES_SHOWN).toBe(MAX_RECOMMENDATIONS)
    })
  })

  describe('SOURCE_SNIPPET_LINES', () => {
    test('should be defined', () => {
      expect(SOURCE_SNIPPET_LINES).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof SOURCE_SNIPPET_LINES).toBe('number')
    })

    test('should be 3', () => {
      expect(SOURCE_SNIPPET_LINES).toBe(3)
    })

    test('should be a positive integer', () => {
      expect(SOURCE_SNIPPET_LINES).toBeGreaterThan(0)
      expect(Number.isInteger(SOURCE_SNIPPET_LINES)).toBe(true)
    })

    test('should equal MAX_VIOLATIONS_TO_SHOW', () => {
      expect(SOURCE_SNIPPET_LINES).toBe(MAX_VIOLATIONS_TO_SHOW)
    })
  })

  // ============================================================================
  // FORMATTING/PADDING VALUES
  // ============================================================================

  describe('TABLE_DASH_SEPARATOR_WIDTH', () => {
    test('should be defined', () => {
      expect(TABLE_DASH_SEPARATOR_WIDTH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof TABLE_DASH_SEPARATOR_WIDTH).toBe('number')
    })

    test('should be 40', () => {
      expect(TABLE_DASH_SEPARATOR_WIDTH).toBe(40)
    })

    test('should be a positive integer', () => {
      expect(TABLE_DASH_SEPARATOR_WIDTH).toBeGreaterThan(0)
      expect(Number.isInteger(TABLE_DASH_SEPARATOR_WIDTH)).toBe(true)
    })
  })

  describe('LINE_CLEAR_WIDTH', () => {
    test('should be defined', () => {
      expect(LINE_CLEAR_WIDTH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof LINE_CLEAR_WIDTH).toBe('number')
    })

    test('should be 80', () => {
      expect(LINE_CLEAR_WIDTH).toBe(80)
    })

    test('should be a positive integer', () => {
      expect(LINE_CLEAR_WIDTH).toBeGreaterThan(0)
      expect(Number.isInteger(LINE_CLEAR_WIDTH)).toBe(true)
    })

    test('should be greater than TABLE_DASH_SEPARATOR_WIDTH', () => {
      expect(LINE_CLEAR_WIDTH).toBeGreaterThan(TABLE_DASH_SEPARATOR_WIDTH)
    })
  })

  describe('BENCHMARK_TABLE_SEPARATOR_WIDTH', () => {
    test('should be defined', () => {
      expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof BENCHMARK_TABLE_SEPARATOR_WIDTH).toBe('number')
    })

    test('should be 90', () => {
      expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBe(90)
    })

    test('should be a positive integer', () => {
      expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBeGreaterThan(0)
      expect(Number.isInteger(BENCHMARK_TABLE_SEPARATOR_WIDTH)).toBe(true)
    })

    test('should be greater than LINE_CLEAR_WIDTH', () => {
      expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBeGreaterThan(LINE_CLEAR_WIDTH)
    })

    test('should be greater than TABLE_DASH_SEPARATOR_WIDTH', () => {
      expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBeGreaterThan(TABLE_DASH_SEPARATOR_WIDTH)
    })
  })

  describe('DATE_FIELD_WIDTH', () => {
    test('should be defined', () => {
      expect(DATE_FIELD_WIDTH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DATE_FIELD_WIDTH).toBe('number')
    })

    test('should be 20', () => {
      expect(DATE_FIELD_WIDTH).toBe(20)
    })

    test('should be a positive integer', () => {
      expect(DATE_FIELD_WIDTH).toBeGreaterThan(0)
      expect(Number.isInteger(DATE_FIELD_WIDTH)).toBe(true)
    })
  })

  describe('RULE_ID_FIELD_WIDTH', () => {
    test('should be defined', () => {
      expect(RULE_ID_FIELD_WIDTH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof RULE_ID_FIELD_WIDTH).toBe('number')
    })

    test('should be 30', () => {
      expect(RULE_ID_FIELD_WIDTH).toBe(30)
    })

    test('should be a positive integer', () => {
      expect(RULE_ID_FIELD_WIDTH).toBeGreaterThan(0)
      expect(Number.isInteger(RULE_ID_FIELD_WIDTH)).toBe(true)
    })

    test('should be greater than DATE_FIELD_WIDTH', () => {
      expect(RULE_ID_FIELD_WIDTH).toBeGreaterThan(DATE_FIELD_WIDTH)
    })
  })

  describe('SCORE_FIELD_WIDTH', () => {
    test('should be defined', () => {
      expect(SCORE_FIELD_WIDTH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof SCORE_FIELD_WIDTH).toBe('number')
    })

    test('should be 3', () => {
      expect(SCORE_FIELD_WIDTH).toBe(3)
    })

    test('should be a positive integer', () => {
      expect(SCORE_FIELD_WIDTH).toBeGreaterThan(0)
      expect(Number.isInteger(SCORE_FIELD_WIDTH)).toBe(true)
    })
  })

  describe('METRIC_FIELD_WIDTH', () => {
    test('should be defined', () => {
      expect(METRIC_FIELD_WIDTH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof METRIC_FIELD_WIDTH).toBe('number')
    })

    test('should be 12', () => {
      expect(METRIC_FIELD_WIDTH).toBe(12)
    })

    test('should be a positive integer', () => {
      expect(METRIC_FIELD_WIDTH).toBeGreaterThan(0)
      expect(Number.isInteger(METRIC_FIELD_WIDTH)).toBe(true)
    })

    test('should be greater than SCORE_FIELD_WIDTH', () => {
      expect(METRIC_FIELD_WIDTH).toBeGreaterThan(SCORE_FIELD_WIDTH)
    })
  })

  describe('TOTAL_FIELD_WIDTH', () => {
    test('should be defined', () => {
      expect(TOTAL_FIELD_WIDTH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof TOTAL_FIELD_WIDTH).toBe('number')
    })

    test('should be 14', () => {
      expect(TOTAL_FIELD_WIDTH).toBe(14)
    })

    test('should be a positive integer', () => {
      expect(TOTAL_FIELD_WIDTH).toBeGreaterThan(0)
      expect(Number.isInteger(TOTAL_FIELD_WIDTH)).toBe(true)
    })

    test('should be greater than METRIC_FIELD_WIDTH', () => {
      expect(TOTAL_FIELD_WIDTH).toBeGreaterThan(METRIC_FIELD_WIDTH)
    })
  })

  describe('field width ordering', () => {
    test('SCORE < METRIC < TOTAL field widths', () => {
      expect(SCORE_FIELD_WIDTH).toBeLessThan(METRIC_FIELD_WIDTH)
      expect(METRIC_FIELD_WIDTH).toBeLessThan(TOTAL_FIELD_WIDTH)
    })
  })

  // ============================================================================
  // DECIMAL PRECISION
  // ============================================================================

  describe('DECIMAL_PRECISION_DEFAULT', () => {
    test('should be defined', () => {
      expect(DECIMAL_PRECISION_DEFAULT).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DECIMAL_PRECISION_DEFAULT).toBe('number')
    })

    test('should be 2', () => {
      expect(DECIMAL_PRECISION_DEFAULT).toBe(2)
    })

    test('should be a positive integer', () => {
      expect(DECIMAL_PRECISION_DEFAULT).toBeGreaterThan(0)
      expect(Number.isInteger(DECIMAL_PRECISION_DEFAULT)).toBe(true)
    })
  })

  describe('DECIMAL_PRECISION_TIME', () => {
    test('should be defined', () => {
      expect(DECIMAL_PRECISION_TIME).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DECIMAL_PRECISION_TIME).toBe('number')
    })

    test('should be 3', () => {
      expect(DECIMAL_PRECISION_TIME).toBe(3)
    })

    test('should be a positive integer', () => {
      expect(DECIMAL_PRECISION_TIME).toBeGreaterThan(0)
      expect(Number.isInteger(DECIMAL_PRECISION_TIME)).toBe(true)
    })

    test('should be greater than DECIMAL_PRECISION_DEFAULT', () => {
      expect(DECIMAL_PRECISION_TIME).toBeGreaterThan(DECIMAL_PRECISION_DEFAULT)
    })
  })

  // ============================================================================
  // DEBT SCORING WEIGHTS
  // ============================================================================

  describe('DEBT_WEIGHT_SECURITY', () => {
    test('should be defined', () => {
      expect(DEBT_WEIGHT_SECURITY).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEBT_WEIGHT_SECURITY).toBe('number')
    })

    test('should be 5', () => {
      expect(DEBT_WEIGHT_SECURITY).toBe(5)
    })

    test('should be a positive integer', () => {
      expect(DEBT_WEIGHT_SECURITY).toBeGreaterThan(0)
      expect(Number.isInteger(DEBT_WEIGHT_SECURITY)).toBe(true)
    })
  })

  describe('DEBT_WEIGHT_COMPLEXITY', () => {
    test('should be defined', () => {
      expect(DEBT_WEIGHT_COMPLEXITY).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEBT_WEIGHT_COMPLEXITY).toBe('number')
    })

    test('should be 3', () => {
      expect(DEBT_WEIGHT_COMPLEXITY).toBe(3)
    })

    test('should be a positive integer', () => {
      expect(DEBT_WEIGHT_COMPLEXITY).toBeGreaterThan(0)
      expect(Number.isInteger(DEBT_WEIGHT_COMPLEXITY)).toBe(true)
    })
  })

  describe('DEBT_WEIGHT_DEPENDENCIES', () => {
    test('should be defined', () => {
      expect(DEBT_WEIGHT_DEPENDENCIES).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEBT_WEIGHT_DEPENDENCIES).toBe('number')
    })

    test('should be 2', () => {
      expect(DEBT_WEIGHT_DEPENDENCIES).toBe(2)
    })

    test('should be a positive integer', () => {
      expect(DEBT_WEIGHT_DEPENDENCIES).toBeGreaterThan(0)
      expect(Number.isInteger(DEBT_WEIGHT_DEPENDENCIES)).toBe(true)
    })
  })

  describe('DEBT_WEIGHT_PATTERNS', () => {
    test('should be defined', () => {
      expect(DEBT_WEIGHT_PATTERNS).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEBT_WEIGHT_PATTERNS).toBe('number')
    })

    test('should be 1', () => {
      expect(DEBT_WEIGHT_PATTERNS).toBe(1)
    })

    test('should be a positive integer', () => {
      expect(DEBT_WEIGHT_PATTERNS).toBeGreaterThan(0)
      expect(Number.isInteger(DEBT_WEIGHT_PATTERNS)).toBe(true)
    })
  })

  describe('DEBT_WEIGHT_DOCUMENTATION', () => {
    test('should be defined', () => {
      expect(DEBT_WEIGHT_DOCUMENTATION).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEBT_WEIGHT_DOCUMENTATION).toBe('number')
    })

    test('should be 1', () => {
      expect(DEBT_WEIGHT_DOCUMENTATION).toBe(1)
    })

    test('should be a positive integer', () => {
      expect(DEBT_WEIGHT_DOCUMENTATION).toBeGreaterThan(0)
      expect(Number.isInteger(DEBT_WEIGHT_DOCUMENTATION)).toBe(true)
    })

    test('should equal DEBT_WEIGHT_PATTERNS', () => {
      expect(DEBT_WEIGHT_DOCUMENTATION).toBe(DEBT_WEIGHT_PATTERNS)
    })
  })

  describe('debt weight ordering', () => {
    test('security should have the highest weight', () => {
      expect(DEBT_WEIGHT_SECURITY).toBeGreaterThanOrEqual(DEBT_WEIGHT_COMPLEXITY)
      expect(DEBT_WEIGHT_SECURITY).toBeGreaterThanOrEqual(DEBT_WEIGHT_DEPENDENCIES)
      expect(DEBT_WEIGHT_SECURITY).toBeGreaterThanOrEqual(DEBT_WEIGHT_PATTERNS)
      expect(DEBT_WEIGHT_SECURITY).toBeGreaterThanOrEqual(DEBT_WEIGHT_DOCUMENTATION)
    })

    test('complexity should be second highest weight', () => {
      expect(DEBT_WEIGHT_COMPLEXITY).toBeGreaterThanOrEqual(DEBT_WEIGHT_DEPENDENCIES)
      expect(DEBT_WEIGHT_COMPLEXITY).toBeGreaterThanOrEqual(DEBT_WEIGHT_PATTERNS)
      expect(DEBT_WEIGHT_COMPLEXITY).toBeGreaterThanOrEqual(DEBT_WEIGHT_DOCUMENTATION)
    })

    test('dependencies should be third highest weight', () => {
      expect(DEBT_WEIGHT_DEPENDENCIES).toBeGreaterThanOrEqual(DEBT_WEIGHT_PATTERNS)
      expect(DEBT_WEIGHT_DEPENDENCIES).toBeGreaterThanOrEqual(DEBT_WEIGHT_DOCUMENTATION)
    })

    test('all debt weights should sum to 12', () => {
      const total =
        DEBT_WEIGHT_SECURITY +
        DEBT_WEIGHT_COMPLEXITY +
        DEBT_WEIGHT_DEPENDENCIES +
        DEBT_WEIGHT_PATTERNS +
        DEBT_WEIGHT_DOCUMENTATION
      expect(total).toBe(12)
    })

    test('all debt weights should be distinct except patterns and documentation', () => {
      expect(DEBT_WEIGHT_SECURITY).not.toBe(DEBT_WEIGHT_COMPLEXITY)
      expect(DEBT_WEIGHT_SECURITY).not.toBe(DEBT_WEIGHT_DEPENDENCIES)
      expect(DEBT_WEIGHT_SECURITY).not.toBe(DEBT_WEIGHT_PATTERNS)
      expect(DEBT_WEIGHT_COMPLEXITY).not.toBe(DEBT_WEIGHT_DEPENDENCIES)
      expect(DEBT_WEIGHT_COMPLEXITY).not.toBe(DEBT_WEIGHT_PATTERNS)
      expect(DEBT_WEIGHT_DEPENDENCIES).not.toBe(DEBT_WEIGHT_PATTERNS)
    })
  })

  describe('DEBT_COST_PER_POINT_MINUTES', () => {
    test('should be defined', () => {
      expect(DEBT_COST_PER_POINT_MINUTES).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEBT_COST_PER_POINT_MINUTES).toBe('number')
    })

    test('should be 15', () => {
      expect(DEBT_COST_PER_POINT_MINUTES).toBe(15)
    })

    test('should be a positive integer', () => {
      expect(DEBT_COST_PER_POINT_MINUTES).toBeGreaterThan(0)
      expect(Number.isInteger(DEBT_COST_PER_POINT_MINUTES)).toBe(true)
    })

    test('should represent a reasonable time cost (under 60 minutes)', () => {
      expect(DEBT_COST_PER_POINT_MINUTES).toBeLessThan(60)
    })
  })

  describe('DEBT_OVERALL_THRESHOLD_HIGH', () => {
    test('should be defined', () => {
      expect(DEBT_OVERALL_THRESHOLD_HIGH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEBT_OVERALL_THRESHOLD_HIGH).toBe('number')
    })

    test('should be 20', () => {
      expect(DEBT_OVERALL_THRESHOLD_HIGH).toBe(20)
    })

    test('should be a positive integer', () => {
      expect(DEBT_OVERALL_THRESHOLD_HIGH).toBeGreaterThan(0)
      expect(Number.isInteger(DEBT_OVERALL_THRESHOLD_HIGH)).toBe(true)
    })
  })

  describe('DEBT_COMPLEXITY_THRESHOLD_HIGH', () => {
    test('should be defined', () => {
      expect(DEBT_COMPLEXITY_THRESHOLD_HIGH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEBT_COMPLEXITY_THRESHOLD_HIGH).toBe('number')
    })

    test('should be 10', () => {
      expect(DEBT_COMPLEXITY_THRESHOLD_HIGH).toBe(10)
    })

    test('should be a positive integer', () => {
      expect(DEBT_COMPLEXITY_THRESHOLD_HIGH).toBeGreaterThan(0)
      expect(Number.isInteger(DEBT_COMPLEXITY_THRESHOLD_HIGH)).toBe(true)
    })
  })

  describe('DEBT_SECURITY_THRESHOLD_HIGH', () => {
    test('should be defined', () => {
      expect(DEBT_SECURITY_THRESHOLD_HIGH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEBT_SECURITY_THRESHOLD_HIGH).toBe('number')
    })

    test('should be 5', () => {
      expect(DEBT_SECURITY_THRESHOLD_HIGH).toBe(5)
    })

    test('should be a positive integer', () => {
      expect(DEBT_SECURITY_THRESHOLD_HIGH).toBeGreaterThan(0)
      expect(Number.isInteger(DEBT_SECURITY_THRESHOLD_HIGH)).toBe(true)
    })
  })

  describe('DEBT_DEPENDENCIES_THRESHOLD_HIGH', () => {
    test('should be defined', () => {
      expect(DEBT_DEPENDENCIES_THRESHOLD_HIGH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEBT_DEPENDENCIES_THRESHOLD_HIGH).toBe('number')
    })

    test('should be 5', () => {
      expect(DEBT_DEPENDENCIES_THRESHOLD_HIGH).toBe(5)
    })

    test('should be a positive integer', () => {
      expect(DEBT_DEPENDENCIES_THRESHOLD_HIGH).toBeGreaterThan(0)
      expect(Number.isInteger(DEBT_DEPENDENCIES_THRESHOLD_HIGH)).toBe(true)
    })

    test('should equal DEBT_SECURITY_THRESHOLD_HIGH', () => {
      expect(DEBT_DEPENDENCIES_THRESHOLD_HIGH).toBe(DEBT_SECURITY_THRESHOLD_HIGH)
    })
  })

  describe('debt threshold ordering', () => {
    test('overall threshold should be highest', () => {
      expect(DEBT_OVERALL_THRESHOLD_HIGH).toBeGreaterThan(DEBT_COMPLEXITY_THRESHOLD_HIGH)
      expect(DEBT_OVERALL_THRESHOLD_HIGH).toBeGreaterThan(DEBT_SECURITY_THRESHOLD_HIGH)
      expect(DEBT_OVERALL_THRESHOLD_HIGH).toBeGreaterThan(DEBT_DEPENDENCIES_THRESHOLD_HIGH)
    })

    test('complexity threshold should be second highest', () => {
      expect(DEBT_COMPLEXITY_THRESHOLD_HIGH).toBeGreaterThan(DEBT_SECURITY_THRESHOLD_HIGH)
      expect(DEBT_COMPLEXITY_THRESHOLD_HIGH).toBeGreaterThan(DEBT_DEPENDENCIES_THRESHOLD_HIGH)
    })
  })

  // ============================================================================
  // HEALTH SCORE THRESHOLDS
  // ============================================================================

  describe('HEALTH_SCORE_THRESHOLD_A', () => {
    test('should be defined', () => {
      expect(HEALTH_SCORE_THRESHOLD_A).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof HEALTH_SCORE_THRESHOLD_A).toBe('number')
    })

    test('should be 90', () => {
      expect(HEALTH_SCORE_THRESHOLD_A).toBe(90)
    })

    test('should be a positive integer', () => {
      expect(HEALTH_SCORE_THRESHOLD_A).toBeGreaterThan(0)
      expect(Number.isInteger(HEALTH_SCORE_THRESHOLD_A)).toBe(true)
    })
  })

  describe('HEALTH_SCORE_THRESHOLD_B', () => {
    test('should be defined', () => {
      expect(HEALTH_SCORE_THRESHOLD_B).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof HEALTH_SCORE_THRESHOLD_B).toBe('number')
    })

    test('should be 80', () => {
      expect(HEALTH_SCORE_THRESHOLD_B).toBe(80)
    })

    test('should be a positive integer', () => {
      expect(HEALTH_SCORE_THRESHOLD_B).toBeGreaterThan(0)
      expect(Number.isInteger(HEALTH_SCORE_THRESHOLD_B)).toBe(true)
    })
  })

  describe('HEALTH_SCORE_THRESHOLD_C', () => {
    test('should be defined', () => {
      expect(HEALTH_SCORE_THRESHOLD_C).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof HEALTH_SCORE_THRESHOLD_C).toBe('number')
    })

    test('should be 70', () => {
      expect(HEALTH_SCORE_THRESHOLD_C).toBe(70)
    })

    test('should be a positive integer', () => {
      expect(HEALTH_SCORE_THRESHOLD_C).toBeGreaterThan(0)
      expect(Number.isInteger(HEALTH_SCORE_THRESHOLD_C)).toBe(true)
    })
  })

  describe('HEALTH_SCORE_THRESHOLD_D', () => {
    test('should be defined', () => {
      expect(HEALTH_SCORE_THRESHOLD_D).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof HEALTH_SCORE_THRESHOLD_D).toBe('number')
    })

    test('should be 60', () => {
      expect(HEALTH_SCORE_THRESHOLD_D).toBe(60)
    })

    test('should be a positive integer', () => {
      expect(HEALTH_SCORE_THRESHOLD_D).toBeGreaterThan(0)
      expect(Number.isInteger(HEALTH_SCORE_THRESHOLD_D)).toBe(true)
    })
  })

  describe('HEALTH_SCORE_MAX', () => {
    test('should be defined', () => {
      expect(HEALTH_SCORE_MAX).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof HEALTH_SCORE_MAX).toBe('number')
    })

    test('should be 100', () => {
      expect(HEALTH_SCORE_MAX).toBe(100)
    })

    test('should be a positive integer', () => {
      expect(HEALTH_SCORE_MAX).toBeGreaterThan(0)
      expect(Number.isInteger(HEALTH_SCORE_MAX)).toBe(true)
    })
  })

  describe('health score threshold ordering', () => {
    test('A threshold should be greater than B threshold', () => {
      expect(HEALTH_SCORE_THRESHOLD_A).toBeGreaterThan(HEALTH_SCORE_THRESHOLD_B)
    })

    test('B threshold should be greater than C threshold', () => {
      expect(HEALTH_SCORE_THRESHOLD_B).toBeGreaterThan(HEALTH_SCORE_THRESHOLD_C)
    })

    test('C threshold should be greater than D threshold', () => {
      expect(HEALTH_SCORE_THRESHOLD_C).toBeGreaterThan(HEALTH_SCORE_THRESHOLD_D)
    })

    test('all health thresholds should be less than or equal to HEALTH_SCORE_MAX', () => {
      expect(HEALTH_SCORE_THRESHOLD_A).toBeLessThanOrEqual(HEALTH_SCORE_MAX)
      expect(HEALTH_SCORE_THRESHOLD_B).toBeLessThanOrEqual(HEALTH_SCORE_MAX)
      expect(HEALTH_SCORE_THRESHOLD_C).toBeLessThanOrEqual(HEALTH_SCORE_MAX)
      expect(HEALTH_SCORE_THRESHOLD_D).toBeLessThanOrEqual(HEALTH_SCORE_MAX)
    })

    test('all health score thresholds should be distinct', () => {
      const thresholds = new Set([
        HEALTH_SCORE_THRESHOLD_A,
        HEALTH_SCORE_THRESHOLD_B,
        HEALTH_SCORE_THRESHOLD_C,
        HEALTH_SCORE_THRESHOLD_D,
        HEALTH_SCORE_MAX,
      ])
      expect(thresholds.size).toBe(5)
    })

    test('health thresholds should be separated by 10 points', () => {
      expect(HEALTH_SCORE_THRESHOLD_A - HEALTH_SCORE_THRESHOLD_B).toBe(10)
      expect(HEALTH_SCORE_THRESHOLD_B - HEALTH_SCORE_THRESHOLD_C).toBe(10)
      expect(HEALTH_SCORE_THRESHOLD_C - HEALTH_SCORE_THRESHOLD_D).toBe(10)
    })

    test('D threshold should be above 50 (passing grade)', () => {
      expect(HEALTH_SCORE_THRESHOLD_D).toBeGreaterThan(50)
    })
  })

  // ============================================================================
  // PERFORMANCE THRESHOLDS
  // ============================================================================

  describe('PERFORMANCE_SLOW_THRESHOLD_MS', () => {
    test('should be defined', () => {
      expect(PERFORMANCE_SLOW_THRESHOLD_MS).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof PERFORMANCE_SLOW_THRESHOLD_MS).toBe('number')
    })

    test('should be 50', () => {
      expect(PERFORMANCE_SLOW_THRESHOLD_MS).toBe(50)
    })

    test('should be a positive integer', () => {
      expect(PERFORMANCE_SLOW_THRESHOLD_MS).toBeGreaterThan(0)
      expect(Number.isInteger(PERFORMANCE_SLOW_THRESHOLD_MS)).toBe(true)
    })
  })

  describe('PERFORMANCE_VERY_SLOW_THRESHOLD_MS', () => {
    test('should be defined', () => {
      expect(PERFORMANCE_VERY_SLOW_THRESHOLD_MS).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof PERFORMANCE_VERY_SLOW_THRESHOLD_MS).toBe('number')
    })

    test('should be 100', () => {
      expect(PERFORMANCE_VERY_SLOW_THRESHOLD_MS).toBe(100)
    })

    test('should be a positive integer', () => {
      expect(PERFORMANCE_VERY_SLOW_THRESHOLD_MS).toBeGreaterThan(0)
      expect(Number.isInteger(PERFORMANCE_VERY_SLOW_THRESHOLD_MS)).toBe(true)
    })

    test('should be greater than PERFORMANCE_SLOW_THRESHOLD_MS', () => {
      expect(PERFORMANCE_VERY_SLOW_THRESHOLD_MS).toBeGreaterThan(PERFORMANCE_SLOW_THRESHOLD_MS)
    })

    test('should be exactly double PERFORMANCE_SLOW_THRESHOLD_MS', () => {
      expect(PERFORMANCE_VERY_SLOW_THRESHOLD_MS).toBe(PERFORMANCE_SLOW_THRESHOLD_MS * 2)
    })
  })

  // ============================================================================
  // GENERAL CONFIGURATION
  // ============================================================================

  describe('DEFAULT_DEBOUNCE_MS', () => {
    test('should be defined', () => {
      expect(DEFAULT_DEBOUNCE_MS).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEFAULT_DEBOUNCE_MS).toBe('number')
    })

    test('should be 300 milliseconds', () => {
      expect(DEFAULT_DEBOUNCE_MS).toBe(300)
    })

    test('should be positive', () => {
      expect(DEFAULT_DEBOUNCE_MS).toBeGreaterThan(0)
    })
  })

  describe('DEFAULT_MAX_LINES', () => {
    test('should be defined', () => {
      expect(DEFAULT_MAX_LINES).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEFAULT_MAX_LINES).toBe('number')
    })

    test('should be 300 lines', () => {
      expect(DEFAULT_MAX_LINES).toBe(300)
    })

    test('should be positive', () => {
      expect(DEFAULT_MAX_LINES).toBeGreaterThan(0)
    })
  })

  describe('DEFAULT_MAX_FILE_SIZE_LINES', () => {
    test('should be defined', () => {
      expect(DEFAULT_MAX_FILE_SIZE_LINES).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEFAULT_MAX_FILE_SIZE_LINES).toBe('number')
    })

    test('should be 500 lines', () => {
      expect(DEFAULT_MAX_FILE_SIZE_LINES).toBe(500)
    })

    test('should be greater than DEFAULT_MAX_LINES', () => {
      expect(DEFAULT_MAX_FILE_SIZE_LINES).toBeGreaterThan(DEFAULT_MAX_LINES)
    })

    test('should be positive', () => {
      expect(DEFAULT_MAX_FILE_SIZE_LINES).toBeGreaterThan(0)
    })
  })

  describe('FILE_COUNT_THRESHOLD', () => {
    test('should be defined', () => {
      expect(FILE_COUNT_THRESHOLD).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof FILE_COUNT_THRESHOLD).toBe('number')
    })

    test('should be 1000 files', () => {
      expect(FILE_COUNT_THRESHOLD).toBe(1000)
    })

    test('should be positive', () => {
      expect(FILE_COUNT_THRESHOLD).toBeGreaterThan(0)
    })
  })

  describe('TIME_FORMAT_THRESHOLD_MS', () => {
    test('should be defined', () => {
      expect(TIME_FORMAT_THRESHOLD_MS).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof TIME_FORMAT_THRESHOLD_MS).toBe('number')
    })

    test('should be 1000', () => {
      expect(TIME_FORMAT_THRESHOLD_MS).toBe(1000)
    })

    test('should be a positive integer', () => {
      expect(TIME_FORMAT_THRESHOLD_MS).toBeGreaterThan(0)
      expect(Number.isInteger(TIME_FORMAT_THRESHOLD_MS)).toBe(true)
    })

    test('should represent 1 second in milliseconds', () => {
      expect(TIME_FORMAT_THRESHOLD_MS).toBe(1000)
    })
  })

  describe('DEFAULT_FIX_PRIORITY', () => {
    test('should be defined', () => {
      expect(DEFAULT_FIX_PRIORITY).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEFAULT_FIX_PRIORITY).toBe('number')
    })

    test('should be 10', () => {
      expect(DEFAULT_FIX_PRIORITY).toBe(10)
    })

    test('should be a positive integer', () => {
      expect(DEFAULT_FIX_PRIORITY).toBeGreaterThan(0)
      expect(Number.isInteger(DEFAULT_FIX_PRIORITY)).toBe(true)
    })
  })

  describe('DEFAULT_CONCURRENCY', () => {
    test('should be defined', () => {
      expect(DEFAULT_CONCURRENCY).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEFAULT_CONCURRENCY).toBe('number')
    })

    test('should be a positive integer', () => {
      expect(DEFAULT_CONCURRENCY).toBeGreaterThan(0)
      expect(Number.isInteger(DEFAULT_CONCURRENCY)).toBe(true)
    })

    test('should default to 4 without UV_THREADPOOL_SIZE', () => {
      expect(DEFAULT_CONCURRENCY).toBeGreaterThanOrEqual(4)
    })
  })

  // ============================================================================
  // DEFAULTS FOR COMMANDS
  // ============================================================================

  describe('DEFAULT_BENCHMARK_ITERATIONS', () => {
    test('should be defined', () => {
      expect(DEFAULT_BENCHMARK_ITERATIONS).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEFAULT_BENCHMARK_ITERATIONS).toBe('number')
    })

    test('should be 3', () => {
      expect(DEFAULT_BENCHMARK_ITERATIONS).toBe(3)
    })

    test('should be a positive integer', () => {
      expect(DEFAULT_BENCHMARK_ITERATIONS).toBeGreaterThan(0)
      expect(Number.isInteger(DEFAULT_BENCHMARK_ITERATIONS)).toBe(true)
    })
  })

  describe('DEFAULT_BENCHMARK_TOP', () => {
    test('should be defined', () => {
      expect(DEFAULT_BENCHMARK_TOP).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEFAULT_BENCHMARK_TOP).toBe('number')
    })

    test('should be 20', () => {
      expect(DEFAULT_BENCHMARK_TOP).toBe(20)
    })

    test('should be a positive integer', () => {
      expect(DEFAULT_BENCHMARK_TOP).toBeGreaterThan(0)
      expect(Number.isInteger(DEFAULT_BENCHMARK_TOP)).toBe(true)
    })
  })

  describe('DEFAULT_MAX_WARNINGS', () => {
    test('should be defined', () => {
      expect(DEFAULT_MAX_WARNINGS).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof DEFAULT_MAX_WARNINGS).toBe('number')
    })

    test('should be 10', () => {
      expect(DEFAULT_MAX_WARNINGS).toBe(10)
    })

    test('should be a positive integer', () => {
      expect(DEFAULT_MAX_WARNINGS).toBeGreaterThan(0)
      expect(Number.isInteger(DEFAULT_MAX_WARNINGS)).toBe(true)
    })
  })

  describe('FIX_PRIORITY_DEFAULT', () => {
    test('should be defined', () => {
      expect(FIX_PRIORITY_DEFAULT).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof FIX_PRIORITY_DEFAULT).toBe('number')
    })

    test('should be 10', () => {
      expect(FIX_PRIORITY_DEFAULT).toBe(10)
    })

    test('should be a positive integer', () => {
      expect(FIX_PRIORITY_DEFAULT).toBeGreaterThan(0)
      expect(Number.isInteger(FIX_PRIORITY_DEFAULT)).toBe(true)
    })

    test('should equal DEFAULT_FIX_PRIORITY', () => {
      expect(FIX_PRIORITY_DEFAULT).toBe(DEFAULT_FIX_PRIORITY)
    })
  })

  // ============================================================================
  // MEMORY/BYTE CONSTANTS
  // ============================================================================

  describe('BYTES_PER_KB', () => {
    test('should be defined', () => {
      expect(BYTES_PER_KB).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof BYTES_PER_KB).toBe('number')
    })

    test('should be 1024', () => {
      expect(BYTES_PER_KB).toBe(1024)
    })

    test('should be a positive integer', () => {
      expect(BYTES_PER_KB).toBeGreaterThan(0)
      expect(Number.isInteger(BYTES_PER_KB)).toBe(true)
    })

    test('should be a power of 2', () => {
      expect(BYTES_PER_KB & (BYTES_PER_KB - 1)).toBe(0)
    })
  })

  describe('RANDOM_BYTES_LENGTH', () => {
    test('should be defined', () => {
      expect(RANDOM_BYTES_LENGTH).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof RANDOM_BYTES_LENGTH).toBe('number')
    })

    test('should be 8', () => {
      expect(RANDOM_BYTES_LENGTH).toBe(8)
    })

    test('should be a positive integer', () => {
      expect(RANDOM_BYTES_LENGTH).toBeGreaterThan(0)
      expect(Number.isInteger(RANDOM_BYTES_LENGTH)).toBe(true)
    })

    test('should produce 64-bit unique IDs (8 bytes)', () => {
      expect(RANDOM_BYTES_LENGTH * 8).toBe(64)
    })
  })

  // ============================================================================
  // FILE PERMISSIONS
  // ============================================================================

  describe('FILE_PERMISSION_EXECUTABLE', () => {
    test('should be defined', () => {
      expect(FILE_PERMISSION_EXECUTABLE).toBeDefined()
    })

    test('should be a number', () => {
      expect(typeof FILE_PERMISSION_EXECUTABLE).toBe('number')
    })

    test('should be 0o755 (rwxr-xr-x)', () => {
      expect(FILE_PERMISSION_EXECUTABLE).toBe(0o755)
    })

    test('should be a positive value', () => {
      expect(FILE_PERMISSION_EXECUTABLE).toBeGreaterThan(0)
    })

    test('owner should have read permission', () => {
      expect(FILE_PERMISSION_EXECUTABLE & 0o400).toBe(0o400)
    })

    test('owner should have write permission', () => {
      expect(FILE_PERMISSION_EXECUTABLE & 0o200).toBe(0o200)
    })

    test('owner should have execute permission', () => {
      expect(FILE_PERMISSION_EXECUTABLE & 0o100).toBe(0o100)
    })

    test('group should have read permission', () => {
      expect(FILE_PERMISSION_EXECUTABLE & 0o040).toBe(0o040)
    })

    test('group should not have write permission', () => {
      expect(FILE_PERMISSION_EXECUTABLE & 0o020).toBe(0)
    })

    test('group should have execute permission', () => {
      expect(FILE_PERMISSION_EXECUTABLE & 0o010).toBe(0o010)
    })

    test('others should have read permission', () => {
      expect(FILE_PERMISSION_EXECUTABLE & 0o004).toBe(0o004)
    })

    test('others should not have write permission', () => {
      expect(FILE_PERMISSION_EXECUTABLE & 0o002).toBe(0)
    })

    test('others should have execute permission', () => {
      expect(FILE_PERMISSION_EXECUTABLE & 0o001).toBe(0o001)
    })
  })

  // ============================================================================
  // CROSS-CUTTING RELATIONSHIPS
  // ============================================================================

  describe('cross-constant relationships', () => {
    test('DEFAULT_MAX_WARNINGS should equal MAX_UNMAPPED_RULES_TO_SHOW', () => {
      expect(DEFAULT_MAX_WARNINGS).toBe(MAX_UNMAPPED_RULES_TO_SHOW)
    })

    test('MAX_TOP_STATS_FILES should be less than MAX_FILES_TO_PROCESS', () => {
      expect(MAX_TOP_STATS_FILES).toBeLessThan(MAX_FILES_TO_PROCESS)
    })

    test('MAX_TOP_RULES_SHOWN should be less than MAX_TOP_SUGGESTIONS', () => {
      expect(MAX_TOP_RULES_SHOWN).toBeLessThan(MAX_TOP_SUGGESTIONS)
    })

    test('MAX_TOP_SUGGESTIONS should be less than DEFAULT_BENCHMARK_TOP', () => {
      expect(MAX_TOP_SUGGESTIONS).toBeLessThan(DEFAULT_BENCHMARK_TOP)
    })

    test('MAX_DIFF_VIOLATIONS should be less than MAX_FILES_TO_PROCESS', () => {
      expect(MAX_DIFF_VIOLATIONS).toBeLessThan(MAX_FILES_TO_PROCESS)
    })

    test('DEBT_OVERALL_THRESHOLD_HIGH should be greater than DEBT_COMPLEXITY_THRESHOLD_HIGH + DEBT_SECURITY_THRESHOLD_HIGH', () => {
      expect(DEBT_OVERALL_THRESHOLD_HIGH).toBeGreaterThan(
        DEBT_COMPLEXITY_THRESHOLD_HIGH + DEBT_SECURITY_THRESHOLD_HIGH,
      )
    })

    test('DEFAULT_DEBOUNCE_MS should be less than PERFORMANCE_SLOW_THRESHOLD_MS * 10', () => {
      expect(DEFAULT_DEBOUNCE_MS).toBeLessThan(PERFORMANCE_SLOW_THRESHOLD_MS * 10)
    })

    test('TIME_FORMAT_THRESHOLD_MS should be greater than PERFORMANCE_VERY_SLOW_THRESHOLD_MS', () => {
      expect(TIME_FORMAT_THRESHOLD_MS).toBeGreaterThan(PERFORMANCE_VERY_SLOW_THRESHOLD_MS)
    })

    test('DEFAULT_CONCURRENCY should be reasonable (between 1 and 128)', () => {
      expect(DEFAULT_CONCURRENCY).toBeGreaterThanOrEqual(1)
      expect(DEFAULT_CONCURRENCY).toBeLessThanOrEqual(128)
    })

    test('DECIMAL_PRECISION_TIME should be usable with toFixed', () => {
      const result = (1.234567).toFixed(DECIMAL_PRECISION_TIME)
      expect(result).toBe('1.235')
    })

    test('DECIMAL_PRECISION_DEFAULT should be usable with toFixed', () => {
      const result = (1.234567).toFixed(DECIMAL_PRECISION_DEFAULT)
      expect(result).toBe('1.23')
    })

    test('BYTES_PER_KB multiplied by 1024 should equal 1 MB', () => {
      expect(BYTES_PER_KB * 1024).toBe(1048576)
    })

    test('FILE_COUNT_THRESHOLD should be a power of 10 (1000)', () => {
      expect(FILE_COUNT_THRESHOLD % 1000).toBe(0)
    })

    test('HEALTH_SCORE_MAX should equal 100 (percentage scale)', () => {
      expect(HEALTH_SCORE_MAX).toBe(100)
    })

    test('all numeric constants should be finite', () => {
      const allConstants = [
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
      ]
      for (const c of allConstants) {
        expect(Number.isFinite(c)).toBe(true)
      }
    })

    test('no two display/UI limit constants should have the same value unless intentionally equal', () => {
      const displayLimits = [
        MAX_VIOLATIONS_TO_SHOW,
        MAX_DIFF_VIOLATIONS,
        MAX_DEBT_HISTORY_ENTRIES,
        MAX_RECOMMENDATIONS,
        MAX_UNMAPPED_RULES_TO_SHOW,
        MAX_TOP_SUGGESTIONS,
      ]
      const uniqueValues = new Set(displayLimits)
      expect(uniqueValues.size).toBe(displayLimits.length)
    })

    test('MAX_DEBT_HISTORY_ENTRIES should be the largest display limit', () => {
      expect(MAX_DEBT_HISTORY_ENTRIES).toBeGreaterThanOrEqual(MAX_DIFF_VIOLATIONS)
      expect(MAX_DEBT_HISTORY_ENTRIES).toBeGreaterThanOrEqual(MAX_VIOLATIONS_TO_SHOW)
      expect(MAX_DEBT_HISTORY_ENTRIES).toBeGreaterThanOrEqual(MAX_RECOMMENDATIONS)
      expect(MAX_DEBT_HISTORY_ENTRIES).toBeGreaterThanOrEqual(MAX_UNMAPPED_RULES_TO_SHOW)
      expect(MAX_DEBT_HISTORY_ENTRIES).toBeGreaterThanOrEqual(MAX_TOP_SUGGESTIONS)
    })

    test('formatting widths should all be at least SCORE_FIELD_WIDTH', () => {
      const widths = [
        TABLE_DASH_SEPARATOR_WIDTH,
        LINE_CLEAR_WIDTH,
        BENCHMARK_TABLE_SEPARATOR_WIDTH,
        DATE_FIELD_WIDTH,
        RULE_ID_FIELD_WIDTH,
        METRIC_FIELD_WIDTH,
        TOTAL_FIELD_WIDTH,
      ]
      for (const w of widths) {
        expect(w).toBeGreaterThanOrEqual(SCORE_FIELD_WIDTH)
      }
    })

    test('BENCHMARK_TABLE_SEPARATOR_WIDTH should be the largest formatting width', () => {
      expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBeGreaterThanOrEqual(TABLE_DASH_SEPARATOR_WIDTH)
      expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBeGreaterThanOrEqual(LINE_CLEAR_WIDTH)
      expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBeGreaterThanOrEqual(DATE_FIELD_WIDTH)
      expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBeGreaterThanOrEqual(RULE_ID_FIELD_WIDTH)
      expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBeGreaterThanOrEqual(METRIC_FIELD_WIDTH)
      expect(BENCHMARK_TABLE_SEPARATOR_WIDTH).toBeGreaterThanOrEqual(TOTAL_FIELD_WIDTH)
    })
  })
})
