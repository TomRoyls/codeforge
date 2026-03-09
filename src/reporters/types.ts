/**
 * Severity levels for violations
 */
export type Severity = 'error' | 'info' | 'warning';

/**
 * Represents a single violation found during analysis
 */
export interface Violation {
  /** Column number (1-indexed) */
  column: number;
  /** End column (optional, for ranges) */
  endColumn?: number;
  /** End line (optional, for ranges) */
  endLine?: number;
  /** Absolute or relative file path */
  filePath: string;
  /** Line number (1-indexed) */
  line: number;
  /** Human-readable violation message */
  message: string;
  /** Additional metadata */
  meta?: Record<string, unknown>;
  /** The rule ID that triggered this violation */
  ruleId: string;
  /** Severity level of the violation */
  severity: Severity;
  /** Source code snippet (optional) */
  source?: string;
  /** Suggested fix (optional) */
  suggestion?: string;
}

/**
 * Timing statistics for analysis
 */
export interface AnalysisStats {
  /** Time spent analyzing (ms) */
  analysisTime: number;
  /** Time spent parsing the file (ms) */
  parseTime: number;
  /** Total processing time (ms) */
  totalTime: number;
}

/**
 * Result of analyzing a single file
 */
export interface FileAnalysisResult {
  /** Path to the analyzed file */
  filePath: string;
  /** Timing statistics */
  stats: AnalysisStats;
  /** List of violations found */
  violations: Violation[];
}

/**
 * Complete analysis result containing all files
 */
export interface AnalysisResult {
  /** All file results */
  files: FileAnalysisResult[];
  /** Aggregated statistics */
  summary: {
    /** Total errors */
    errorCount: number;
    /** Files with violations */
    filesWithViolations: number;
    /** Total info messages */
    infoCount: number;
    /** Total files analyzed */
    totalFiles: number;
    /** Total processing time (ms) */
    totalTime: number;
    /** Total warnings */
    warningCount: number;
  };
  /** Analysis timestamp */
  timestamp: string;
  /** CodeForge version */
  version?: string;
}

/**
 * Options for configuring reporters
 */
export interface ReporterOptions {
  /** Use colored output (where applicable) */
  color?: boolean;
  /** Show only errors (filter warnings/info) */
  errorsOnly?: boolean;
  /** Include source code snippets */
  includeSource?: boolean;
  /** Output file path (optional) */
  outputPath?: string;
  /** Pretty print JSON output */
  pretty?: boolean;
  /** Quiet mode - minimal output */
  quiet?: boolean;
  /** Verbose mode - detailed output */
  verbose?: boolean;
}

/**
 * Base interface for all reporters
 */
export interface Reporter {
  /** Clean up resources (optional) */
  dispose?: () => Promise<void> | void;
  /** Format a single violation as a string */
  format(violation: Violation): string;
  /** Initialize the reporter (optional) */
  init?: () => Promise<void> | void;
  /** Reporter name/identifier */
  readonly name: string;
  /** Report analysis results */
  report(results: AnalysisResult): void;
}

/**
 * Factory function type for creating reporters
 */
export type ReporterFactory = (options: ReporterOptions) => Reporter;

/**
 * Registry entry for a reporter
 */
export interface ReporterRegistryEntry {
  /** Description */
  description?: string;
  /** Factory function */
  factory: ReporterFactory;
  /** Reporter name */
  name: string;
}
