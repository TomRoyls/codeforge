/**
 * Configuration constants for CodeForge CLI
 */

// ============================================================================
// SEVERITY LEVELS
// ============================================================================

/** Severity level for informational messages */
export const SEVERITY_INFO = 1
/** Severity level for warnings */
export const SEVERITY_WARNING = 2
/** Severity level for errors */
export const SEVERITY_ERROR = 3

// ============================================================================
// FILE PROCESSING LIMITS
// ============================================================================

/** Maximum number of files to process in interactive/diff/debt/health commands */
export const MAX_FILES_TO_PROCESS = 100
/** Maximum number of files for organize-imports command */
export const MAX_ORGANIZE_IMPORTS_FILES = 200

// ============================================================================
// DISPLAY/UI LIMITS
// ============================================================================

/** Maximum violations to show in watch mode and console reporter */
export const MAX_VIOLATIONS_TO_SHOW = 3
/** Maximum violations to show in diff command (added/removed) */
export const MAX_DIFF_VIOLATIONS = 20
/** Maximum debt history entries to retain */
export const MAX_DEBT_HISTORY_ENTRIES = 30
/** Maximum recommendations to display in debt/health reports */
export const MAX_RECOMMENDATIONS = 5
/** Maximum unmapped rules to show in migrate command */
export const MAX_UNMAPPED_RULES_TO_SHOW = 10
/** Maximum top suggestions in suggest-rules command */
export const MAX_TOP_SUGGESTIONS = 15
/** Maximum top files to show in stats command */
export const MAX_TOP_STATS_FILES = 10
/** Maximum top rules to show in doctor command */
export const MAX_TOP_RULES_SHOWN = 5
/** Source snippet lines to show in console reporter */
export const SOURCE_SNIPPET_LINES = 3

// ============================================================================
// FORMATTING/PADDING VALUES
// ============================================================================

/** Table dash separator width for interactive/debt commands */
export const TABLE_DASH_SEPARATOR_WIDTH = 40
/** Line clear width for benchmark command */
export const LINE_CLEAR_WIDTH = 80
/** Table separator width for benchmark command */
export const BENCHMARK_TABLE_SEPARATOR_WIDTH = 90
/** Date field padding width for debt history */
export const DATE_FIELD_WIDTH = 20
/** Rule ID field padding width for suggest-rules */
export const RULE_ID_FIELD_WIDTH = 30
/** Score field padding width */
export const SCORE_FIELD_WIDTH = 3
/** Metric field padding width for benchmark */
export const METRIC_FIELD_WIDTH = 12
/** Total field padding width for benchmark */
export const TOTAL_FIELD_WIDTH = 14

// ============================================================================
// DECIMAL PRECISION
// ============================================================================

/** Default decimal precision for percentages and scores */
export const DECIMAL_PRECISION_DEFAULT = 2
/** Decimal precision for time measurements */
export const DECIMAL_PRECISION_TIME = 3

// ============================================================================
// DEBT SCORING WEIGHTS
// ============================================================================

/** Weight for security violations in debt calculation */
export const DEBT_WEIGHT_SECURITY = 5
/** Weight for complexity violations in debt calculation */
export const DEBT_WEIGHT_COMPLEXITY = 3
/** Weight for dependency violations in debt calculation */
export const DEBT_WEIGHT_DEPENDENCIES = 2
/** Weight for pattern violations in debt calculation */
export const DEBT_WEIGHT_PATTERNS = 1
/** Weight for documentation issues in debt calculation */
export const DEBT_WEIGHT_DOCUMENTATION = 1
/** Cost in minutes per debt point */
export const DEBT_COST_PER_POINT_MINUTES = 15
/** Overall debt threshold for high-priority recommendation */
export const DEBT_OVERALL_THRESHOLD_HIGH = 20
/** Complexity threshold for high-priority recommendation */
export const DEBT_COMPLEXITY_THRESHOLD_HIGH = 10
/** Security threshold for high-priority recommendation */
export const DEBT_SECURITY_THRESHOLD_HIGH = 5
/** Dependencies threshold for high-priority recommendation */
export const DEBT_DEPENDENCIES_THRESHOLD_HIGH = 5

// ============================================================================
// HEALTH SCORE THRESHOLDS
// ============================================================================

/** Minimum score for grade A */
export const HEALTH_SCORE_THRESHOLD_A = 90
/** Minimum score for grade B */
export const HEALTH_SCORE_THRESHOLD_B = 80
/** Minimum score for grade C */
export const HEALTH_SCORE_THRESHOLD_C = 70
/** Minimum score for grade D */
export const HEALTH_SCORE_THRESHOLD_D = 60
/** Maximum possible health score */
export const HEALTH_SCORE_MAX = 100

// ============================================================================
// PERFORMANCE THRESHOLDS
// ============================================================================

/** Average time threshold for slow rule warning (ms) */
export const PERFORMANCE_SLOW_THRESHOLD_MS = 50
/** Average time threshold for very slow rule warning (ms) */
export const PERFORMANCE_VERY_SLOW_THRESHOLD_MS = 100

// ============================================================================
// GENERAL CONFIGURATION
// ============================================================================

export const DEFAULT_DEBOUNCE_MS = 300
export const DEFAULT_MAX_LINES = 300
export const DEFAULT_MAX_FILE_SIZE_LINES = 500
export const FILE_COUNT_THRESHOLD = 1000
export const TIME_FORMAT_THRESHOLD_MS = 1000
export const DEFAULT_FIX_PRIORITY = 10
export const DEFAULT_CONCURRENCY =
  typeof process !== 'undefined' && process.env.UV_THREADPOOL_SIZE
    ? parseInt(process.env.UV_THREADPOOL_SIZE, 10)
    : 4

// ============================================================================
// DEFAULTS FOR COMMANDS
// ============================================================================

/** Default iterations for benchmark command */
export const DEFAULT_BENCHMARK_ITERATIONS = 3
/** Default top results for benchmark command */
export const DEFAULT_BENCHMARK_TOP = 20
/** Default max warnings threshold for analyze command */
export const DEFAULT_MAX_WARNINGS = 10
/** Default fix priority */
export const FIX_PRIORITY_DEFAULT = 10

// ============================================================================
// MEMORY/BYTE CONSTANTS
// ============================================================================

/** Bytes per kilobyte */
export const BYTES_PER_KB = 1024
/** Random bytes buffer size for unique IDs */
export const RANDOM_BYTES_LENGTH = 8

// ============================================================================
// FILE PERMISSIONS
// ============================================================================

/** File permission for executable scripts (rwxr-xr-x) */
export const FILE_PERMISSION_EXECUTABLE = 0o755
