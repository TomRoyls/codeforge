/**
 * Core types for CodeForge analysis
 */

export type Severity = 'error' | 'warning' | 'info';

export interface Position {
  line: number;
  column: number;
}

export interface SourceLocation {
  file: string;
  start: Position;
  end: Position;
}

export interface Violation {
  ruleId: string;
  severity: Severity;
  message: string;
  location: SourceLocation;
  suggestion?: string;
}

export interface FileResult {
  filePath: string;
  violations: Violation[];
  parseTime: number;
  analysisTime: number;
}

export interface AnalysisResult {
  files: FileResult[];
  summary: AnalysisSummary;
  config: ConfigOptions;
}

export interface AnalysisSummary {
  totalFiles: number;
  totalViolations: number;
  errors: number;
  warnings: number;
  info: number;
  duration: number;
}

export interface ConfigOptions {
  files: string[];
  ignore: string[];
  rules: string[];
  failOnWarnings: boolean;
}

export interface RuleContext {
  filePath: string;
  sourceCode: string;
  report: (violation: Omit<Violation, 'ruleId'>) => void;
}

export interface Rule {
  id: string;
  meta: {
    name: string;
    description: string;
    severity: Severity;
  };
  create: (context: RuleContext) => Record<string, unknown>;
}

export type OutputFormat = 'json' | 'console';

export interface ReporterOptions {
  format: OutputFormat;
  verbose: boolean;
  quiet: boolean;
  outputPath?: string;
}
