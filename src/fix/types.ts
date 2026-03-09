import type { Node, SourceFile } from "ts-morph";

import type { Range, RuleViolation } from "../ast/visitor.js";

export interface TextChange {
  end: number;
  newText: string;
  oldText: string;
  start: number;
}

export interface FixResult {
  applied: boolean;
  changes: TextChange[];
  conflict?: {
    conflictingRule: string;
    reason: string;
  };
}

export interface FixContext {
  getNodeByPosition(position: number): Node | undefined;
  getNodeByRange(range: Range): Node | undefined;
  sourceFile: SourceFile;
  violation: RuleViolation;
}

export interface FileFixReport {
  changes: TextChange[];
  conflicts: Array<{
    conflictingRule: string;
    reason: string;
    ruleId: string;
  }>;
  filePath: string;
  fixesApplied: number;
  fixesSkipped: number;
}

export interface FixReport {
  fileReports: FileFixReport[];
  filesProcessed: number;
  totalFixesApplied: number;
  totalFixesSkipped: number;
}

export interface FixableViolation {
  priority: number;
  range: Range;
  violation: RuleViolation;
}
