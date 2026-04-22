import { type RuleViolation } from '../ast/visitor.js'
import { compareWithBaseline, loadBaseline, saveBaseline } from '../core/baseline.js'

export interface BaselineSaveResult {
  messages: string[]
  path: string
}

export interface BaselineCompareResult {
  exitCode: number
  messages: string[]
  noBaseline: boolean
}

export interface FixApplicationResult {
  dryRunDiffs: string[]
  fixesApplied: number
  fixesSkipped: number
  spinnerMessage: string
}

export async function saveBaselineReport(
  violations: RuleViolation[],
  output: string | undefined,
): Promise<BaselineSaveResult> {
  const baselinePath = await saveBaseline(violations, output)
  return {
    messages: [`Baseline saved to ${baselinePath}`, `  Total violations: ${violations.length}`],
    path: baselinePath,
  }
}

export async function loadBaselineReport(
  output: string | undefined,
): Promise<{ found: boolean; violations?: RuleViolation[] }> {
  const baselineFile = await loadBaseline(output)
  if (!baselineFile) return { found: false }
  return { found: true, violations: baselineFile.violations as RuleViolation[] }
}

export async function compareWithBaselineReport(
  violations: RuleViolation[],
  output: string | undefined,
): Promise<BaselineCompareResult> {
  const baselineData = await loadBaselineReport(output)
  if (!baselineData.found) {
    return {
      exitCode: 1,
      messages: ['No baseline file found. Run with --baseline save first.'],
      noBaseline: true,
    }
  }

  const result = compareWithBaseline(violations, baselineData.violations!)
  const messages: string[] = [
    '',
    'Baseline Comparison Results:',
    `  Regressions (new violations): ${result.regressions.length}`,
    `  Improvements (fixed violations): ${result.improvements.length}`,
    `  Unchanged: ${result.unchanged}`,
  ]

  if (result.regressions.length > 0) {
    messages.push('', 'Regressions:')
    for (const v of result.regressions) {
      messages.push(
        `  ${v.filePath}:${v.range.start.line}:${v.range.start.column} - ${v.ruleId}: ${v.message}`,
      )
    }
  }

  return {
    exitCode: result.regressions.length > 0 ? 1 : 0,
    messages,
    noBaseline: false,
  }
}
