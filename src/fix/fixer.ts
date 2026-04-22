/**
 * Fixer module - applies automatic fixes to source code violations.
 *
 * This module provides the core functionality for applying automatic fixes to
 * code violations detected by rules. It handles conflict detection, range-based
 * text manipulation, and dry-run mode for previewing changes.
 *
 * @module fix/fixer
 * @example
 * ```typescript
 * import { applyFixesToFile, type RuleWithFix } from './fix/fixer.js'
 *
 * const rulesWithFixes = new Map<string, RuleWithFix>()
 * rulesWithFixes.set('prefer-const', {
 *   id: 'prefer-const',
 *   fix: (context) => { ... },
 *   priority: 1
 * })
 *
 * const report = applyFixesToFile(sourceFile, violations, rulesWithFixes, false)
 * console.log(`Applied ${report.fixesApplied} fixes`)
 * ```
 */
import type { SourceFile } from 'ts-morph'

import type { RuleViolation } from '../ast/visitor.js'
import type { FileFixReport, FixableViolation, FixReport, FixResult, TextChange } from './types.js'

import { createFixContext } from './context.js'

/**
 * Function type for applying a fix to a specific violation.
 *
 * @param context - The fix context containing source file, violation, and node lookup
 * @param context.sourceFile - The TypeScript source file being fixed
 * @param context.violation - The rule violation to fix
 * @param context.getNodeByRange - Helper to get AST node at a specific range
 * @returns The fix result containing changes, or null if fix cannot be applied
 */
export type FixFunction = (context: {
  getNodeByRange: (range: {
    end: { column: number; line: number }
    start: { column: number; line: number }
  }) => unknown
  sourceFile: SourceFile
  violation: RuleViolation
}) => FixResult | null

/**
 * Represents a rule with automatic fix capability.
 */
export interface RuleWithFix {
  fix: FixFunction
  id: string
  priority: number
}

/**
 * Applies automatic fixes to all fixable violations in a single source file.
 *
 * This function:
 * 1. Identifies which violations have associated fixes
 * 2. Sorts fixes by priority (higher priority first)
 * 3. Detects and skips conflicting fixes (overlapping ranges)
 * 4. Applies non-conflicting fixes to the source file
 *
 * @param sourceFile - The TypeScript source file to fix
 * @param violations - Array of violations detected in the file
 * @param rulesWithFixes - Map of rule IDs to their fix implementations
 * @param dryRun - If true, preview changes without modifying the file
 * @returns A detailed report of fixes applied and conflicts detected
 *
 * @example
 * ```typescript
 * const report = applyFixesToFile(sourceFile, violations, rulesWithFixes, true)
 * console.log(`Would apply ${report.fixesApplied} fixes`)
 * console.log(`Skipped ${report.fixesSkipped} conflicting fixes`)
 * ```
 */
export function applyFixesToFile(
  sourceFile: SourceFile,
  violations: RuleViolation[],
  rulesWithFixes: Map<string, RuleWithFix>,
  dryRun = false,
): FileFixReport {
  const filePath = sourceFile.getFilePath()
  const fixableViolations: FixableViolation[] = []

  for (const violation of violations) {
    const rule = rulesWithFixes.get(violation.ruleId)
    if (rule) {
      fixableViolations.push({
        priority: rule.priority,
        range: violation.range,
        violation,
      })
    }
  }

  fixableViolations.sort((a, b) => a.priority - b.priority)

  const rangesApplied: Array<{ end: number; ruleId: string; start: number }> = []
  const changes: TextChange[] = []
  const conflicts: Array<{ conflictingRule: string; reason: string; ruleId: string }> = []
  let fixesApplied = 0
  let fixesSkipped = 0

  // Cache line splits per file to avoid repeated string.split()
  let cachedLines: null | string[] = null
  const getLines = (): string[] => {
    if (!cachedLines) cachedLines = getFileLines(sourceFile)
    return cachedLines
  }

  for (const { range, violation } of fixableViolations) {
    const rule = rulesWithFixes.get(violation.ruleId)
    if (!rule) continue

    const lines = getLines()
    const startPos = getPosFromLineCol(lines, range.start.line, range.start.column)
    const endPos = getPosFromLineCol(lines, range.end.line, range.end.column)

    const hasConflict = rangesApplied.some(
      (r) =>
        (startPos >= r.start && startPos < r.end) ||
        (endPos > r.start && endPos <= r.end) ||
        (startPos <= r.start && endPos >= r.end),
    )

    if (hasConflict) {
      const conflictingRule =
        rangesApplied.find(
          (r) => (startPos >= r.start && startPos < r.end) || (endPos > r.start && endPos <= r.end),
        )?.ruleId ?? 'unknown'

      conflicts.push({
        conflictingRule,
        reason: 'Overlapping fix range',
        ruleId: violation.ruleId,
      })
      fixesSkipped++
      continue
    }

    const context = createFixContext(sourceFile, violation)
    const result = rule.fix({
      getNodeByRange: context.getNodeByRange,
      sourceFile,
      violation,
    })

    if (result && result.applied) {
      changes.push(...result.changes)
      rangesApplied.push({ end: endPos, ruleId: violation.ruleId, start: startPos })
      fixesApplied++
    } else if (result?.conflict) {
      conflicts.push({
        conflictingRule: result.conflict.conflictingRule,
        reason: result.conflict.reason,
        ruleId: violation.ruleId,
      })
      fixesSkipped++
    }
  }

  if (!dryRun && changes.length > 0) {
    applyTextChanges(sourceFile, changes)
  }

  return {
    changes,
    conflicts,
    filePath,
    fixesApplied,
    fixesSkipped,
  }
}

/**
 * Applies automatic fixes to violations across multiple source files.
 *
 * Iterates through all provided files and applies fixes using the provided
 * rule fix implementations. Aggregates results into a comprehensive report.
 *
 * @param filesWithViolations - Array of source files with their violations
 * @param rulesWithFixes - Map of rule IDs to their fix implementations
 * @param dryRun - If true, preview changes without modifying files
 * @returns Aggregated report of all fixes applied across files
 *
 * @example
 * ```typescript
 * const filesWithViolations = [
 *   { sourceFile: file1, violations: violations1 },
 *   { sourceFile: file2, violations: violations2 }
 * ]
 * const report = applyFixesToFiles(filesWithViolations, rulesWithFixes, false)
 * console.log(`Processed ${report.filesProcessed} files`)
 * ```
 */
export function applyFixesToFiles(
  filesWithViolations: Array<{ sourceFile: SourceFile; violations: RuleViolation[] }>,
  rulesWithFixes: Map<string, RuleWithFix>,
  dryRun = false,
): FixReport {
  const fileReports: FileFixReport[] = []
  let totalFixesApplied = 0
  let totalFixesSkipped = 0

  for (const { sourceFile, violations } of filesWithViolations) {
    const report = applyFixesToFile(sourceFile, violations, rulesWithFixes, dryRun)
    fileReports.push(report)
    totalFixesApplied += report.fixesApplied
    totalFixesSkipped += report.fixesSkipped
  }

  return {
    fileReports,
    filesProcessed: filesWithViolations.length,
    totalFixesApplied,
    totalFixesSkipped,
  }
}

function getPosFromLineCol(lines: string[], line: number, column: number): number {
  let pos = 0
  for (let i = 0; i < line - 1 && i < lines.length; i++) {
    pos += lines[i]!.length + 1
  }

  return pos + column - 1
}

function getFileLines(sourceFile: SourceFile): string[] {
  const fullText = sourceFile.getFullText()
  return fullText.split('\n')
}

function applyTextChanges(sourceFile: SourceFile, changes: TextChange[]): void {
  const sortedChanges = [...changes].sort((a, b) => b.start - a.start)

  for (const change of sortedChanges) {
    sourceFile.replaceText([change.start, change.end], change.newText)
  }
}
