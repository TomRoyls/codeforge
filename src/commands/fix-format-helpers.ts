/**
 * Formatting and output helpers for the fix command.
 *
 * Extracted from fix-helpers.ts — handles summary formatting,
 * CI/JSON output, and result aggregation with display formatting.
 */
import chalk from 'chalk'

import type { FileFixResult , FixFlags , FixSummary } from './fix-helpers.js'

export function printSummary(results: FixSummary, flags: FixFlags): string[] {
  const lines: string[] = []

  lines.push(chalk.bold('\n📊 Fix Summary\n'))

  if (flags['dry-run']) {
    lines.push(chalk.dim('  Mode: Dry run (no files modified)'))
  }

  lines.push(chalk.green(`  Fixes applied: ${results.totalFixesApplied}`))

  if (results.totalFixesSkipped > 0) {
    lines.push(chalk.yellow(`  Fixes skipped: ${results.totalFixesSkipped} (conflicts)`))
  }

  if (!flags['dry-run']) {
    lines.push(
      chalk.blue(`  Files modified: ${results.filesModified.length}`),
      chalk.dim(`  Files unchanged: ${results.filesUnchanged.length}`),
    )
  } else if (results.totalFixesApplied > 0) {
    lines.push(chalk.blue(`  Files would be modified: ${results.filesModified.length}`))
  }

  if (results.totalFixesApplied === 0 && results.totalFixesSkipped === 0) {
    lines.push(chalk.green('\n✨ No violations found to fix!'))
  } else if (!flags['dry-run'] && results.totalFixesApplied > 0) {
    lines.push(chalk.green('\n✨ Fixes applied successfully!'))
  }

  return lines
}

export function outputFixResults(
  results: FixSummary,
  flags: FixFlags,
  ciMode: boolean,
): { jsonOutput?: string; summaryLines: string[] } {
  if (ciMode) {
    return {
      jsonOutput: JSON.stringify(
        {
          dryRun: flags['dry-run'],
          filesModified: results.filesModified,
          filesUnchanged: results.filesUnchanged,
          summary: {
            fixesApplied: results.totalFixesApplied,
            fixesSkipped: results.totalFixesSkipped,
          },
        },
        null,
        2,
      ),
      summaryLines: [],
    }
  }

  return {
    summaryLines: printSummary(results, flags),
  }
}

export function aggregateResults(
  results: FileFixResult[],
  flags: FixFlags,
): { logLines: string[]; summary: FixSummary } {
  const logLines: string[] = []
  let totalFixesApplied = 0
  let totalFixesSkipped = 0
  const filesModified: string[] = []
  const filesUnchanged: string[] = []

  for (const result of results) {
    if (result.status === 'error') {
      logLines.push(chalk.red(`  ✗ Error processing ${result.file}: ${result.error}`))
    } else if (result.status === 'processed') {
      totalFixesApplied += result.fixesApplied
      totalFixesSkipped += result.fixesSkipped

      if (!flags['dry-run'] && result.fixesApplied > 0) {
        filesModified.push(result.file)

        if (flags.verbose) {
          logLines.push(
            chalk.green(`  ✓ Fixed ${result.fixesApplied} violation(s) in ${result.file}`),
          )
        }
      } else if (flags['dry-run'] && result.fixesApplied > 0 && flags.verbose) {
        logLines.push(
          chalk.dim(`  ○ Would fix ${result.fixesApplied} violation(s) in ${result.file}`),
        )
      }

      if (result.conflicts.length > 0 && flags.verbose) {
        for (const conflict of result.conflicts) {
          logLines.push(
            chalk.yellow(
              `  ⚠ Skipped ${conflict.ruleId} (conflicts with ${conflict.conflictingRule}) in ${result.file}`,
            ),
          )
        }
      }
    } else {
      filesUnchanged.push(result.file)
    }
  }

  return {
    logLines,
    summary: { filesModified, filesUnchanged, totalFixesApplied, totalFixesSkipped },
  }
}
