import type { SourceFile } from "ts-morph";

import type { RuleViolation } from "../ast/visitor.js";
import type { FileFixReport, FixableViolation, FixReport, FixResult, TextChange } from "./types.js";

import { createFixContext } from "./context.js";

export type FixFunction = (context: {
  getNodeByRange: (range: { end: { column: number; line: number; }; start: { column: number; line: number; }; }) => unknown;
  sourceFile: SourceFile;
  violation: RuleViolation;
}) => FixResult | null;

export interface RuleWithFix {
  fix: FixFunction;
  id: string;
  priority: number;
}

export function applyFixesToFile(
  sourceFile: SourceFile,
  violations: RuleViolation[],
  rulesWithFixes: Map<string, RuleWithFix>,
  dryRun = false,
): FileFixReport {
  const filePath = sourceFile.getFilePath();
  const fixableViolations: FixableViolation[] = [];
  
  for (const violation of violations) {
    const rule = rulesWithFixes.get(violation.ruleId);
    if (rule) {
      fixableViolations.push({
        priority: rule.priority,
        range: violation.range,
        violation,
      });
    }
  }
  
  fixableViolations.sort((a, b) => a.priority - b.priority);
  
  const rangesApplied: Array<{ end: number; ruleId: string; start: number; }> = [];
  const changes: TextChange[] = [];
  const conflicts: Array<{ conflictingRule: string; reason: string; ruleId: string; }> = [];
  let fixesApplied = 0;
  let fixesSkipped = 0;
  
  for (const { range, violation } of fixableViolations) {
    const rule = rulesWithFixes.get(violation.ruleId);
    if (!rule) continue;
    
    const startPos = getPosFromRange(sourceFile, range);
    const endPos = getPosFromRangeEnd(sourceFile, range);
    
    const hasConflict = rangesApplied.some(
      (r) => (startPos >= r.start && startPos < r.end) || (endPos > r.start && endPos <= r.end) || (startPos <= r.start && endPos >= r.end),
    );
    
    if (hasConflict) {
      const conflictingRule = rangesApplied.find(
        (r) => (startPos >= r.start && startPos < r.end) || (endPos > r.start && endPos <= r.end),
      )?.ruleId ?? "unknown";
      
      conflicts.push({
        conflictingRule,
        reason: "Overlapping fix range",
        ruleId: violation.ruleId,
      });
      fixesSkipped++;
      continue;
    }
    
    const context = createFixContext(sourceFile, violation);
    const result = rule.fix({
      getNodeByRange: context.getNodeByRange,
      sourceFile,
      violation,
    });
    
    if (result && result.applied) {
      changes.push(...result.changes);
      rangesApplied.push({ end: endPos, ruleId: violation.ruleId, start: startPos });
      fixesApplied++;
    } else if (result?.conflict) {
      conflicts.push({
        conflictingRule: result.conflict.conflictingRule,
        reason: result.conflict.reason,
        ruleId: violation.ruleId,
      });
      fixesSkipped++;
    }
  }
  
  if (!dryRun && changes.length > 0) {
    applyTextChanges(sourceFile, changes);
  }
  
  return {
    changes,
    conflicts,
    filePath,
    fixesApplied,
    fixesSkipped,
  };
}

export function applyFixesToFiles(
  filesWithViolations: Array<{ sourceFile: SourceFile; violations: RuleViolation[] }>,
  rulesWithFixes: Map<string, RuleWithFix>,
  dryRun = false,
): FixReport {
  const fileReports: FileFixReport[] = [];
  let totalFixesApplied = 0;
  let totalFixesSkipped = 0;
  
  for (const { sourceFile, violations } of filesWithViolations) {
    const report = applyFixesToFile(sourceFile, violations, rulesWithFixes, dryRun);
    fileReports.push(report);
    totalFixesApplied += report.fixesApplied;
    totalFixesSkipped += report.fixesSkipped;
  }
  
  return {
    fileReports,
    filesProcessed: filesWithViolations.length,
    totalFixesApplied,
    totalFixesSkipped,
  };
}

function getPosFromRange(sourceFile: SourceFile, range: { start: { column: number; line: number; } }): number {
  const fullText = sourceFile.getFullText();
  const lines = fullText.split("\n");
  
  let pos = 0;
  for (let i = 0; i < range.start.line - 1 && i < lines.length; i++) {
    pos += lines[i]!.length + 1;
  }
  
  return pos + range.start.column - 1;
}

function getPosFromRangeEnd(sourceFile: SourceFile, range: { end: { column: number; line: number; } }): number {
  const fullText = sourceFile.getFullText();
  const lines = fullText.split("\n");
  
  let pos = 0;
  for (let i = 0; i < range.end.line - 1 && i < lines.length; i++) {
    pos += lines[i]!.length + 1;
  }
  
  return pos + range.end.column - 1;
}

function applyTextChanges(sourceFile: SourceFile, changes: TextChange[]): void {
  const sortedChanges = [...changes].sort((a, b) => b.start - a.start);
  
  for (const change of sortedChanges) {
    sourceFile.replaceText([change.start, change.end], change.newText);
  }
}

export interface TextChangeOptions {
  endColumn: number;
  endLine: number;
  newText: string;
  sourceFile: SourceFile;
  startColumn: number;
  startLine: number;
}

export function createTextChange(options: TextChangeOptions): TextChange {
  const { endColumn, endLine, newText, sourceFile, startColumn, startLine } = options;
  const fullText = sourceFile.getFullText();
  const lines = fullText.split("\n");

  let startPos = 0;
  for (let i = 0; i < startLine - 1 && i < lines.length; i++) {
    startPos += lines[i]!.length + 1;
  }

  startPos += startColumn - 1;

  let endPos = 0;
  for (let i = 0; i < endLine - 1 && i < lines.length; i++) {
    endPos += lines[i]!.length + 1;
  }

  endPos += endColumn - 1;

  const oldText = fullText.slice(startPos, endPos);

  return {
    end: endPos,
    newText,
    oldText,
    start: startPos,
  };
}
