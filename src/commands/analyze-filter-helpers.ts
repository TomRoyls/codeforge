import type { FileReport } from './analyze-helpers.js'

import { type RuleViolation } from '../ast/visitor.js'
import { getProfileSeverityOverrides } from '../utils/command-helpers.js'
import { logger, LogLevel } from '../utils/logger.js'

/**
 * Applies severity overrides from a profile to violations and file reports.
 */
export function applyProfileOverrides(
  violations: RuleViolation[],
  fileReports: FileReport[],
  profile: string | undefined,
): { fileReports: FileReport[]; violations: RuleViolation[] } {
  if (!profile) return { fileReports, violations }

  const overrides = getProfileSeverityOverrides(profile as 'lenient' | 'moderate' | 'strict')
  const mappedViolations = violations.map((v) => {
    const override = overrides[v.ruleId]
    return override ? { ...v, severity: override } : v
  })
  const mappedReports = fileReports.map((report) => ({
    ...report,
    violations: report.violations.map((v) => {
      const override = overrides[v.ruleId]
      return override ? { ...v, severity: override } : v
    }),
  }))

  return { fileReports: mappedReports, violations: mappedViolations }
}

/**
 * Configures the logger based on verbose and quiet flags.
 */
export function configureLogging(verbose: boolean, quiet: boolean): void {
  if (verbose) {
    logger.setLevel(LogLevel.DEBUG)
  } else if (quiet) {
    logger.setLevel(LogLevel.SILENT)
  }
}

/**
 * Determines the exit code based on summary and flags.
 */
export function determineExitCode(
  summary: { errors: number; warnings: number },
  failOnWarnings: boolean,
  maxWarnings: number,
): number {
  if (summary.errors > 0) {
    return 1
  }

  if (failOnWarnings && summary.warnings > 0) {
    return 2
  }

  if (maxWarnings >= 0 && summary.warnings > maxWarnings) {
    return 1
  }

  return 0
}

/**
 * Filters violations by minimum severity level.
 */
export function filterBySeverity(
  violations: RuleViolation[],
  minLevel: 'error' | 'info' | 'warning',
): RuleViolation[] {
  const severityOrder = { error: 3, info: 1, warning: 2 }
  const minOrder = severityOrder[minLevel]

  return violations.filter((v) => {
    const vOrder = severityOrder[v.severity as keyof typeof severityOrder] ?? 0
    return vOrder >= minOrder
  })
}

/**
 * Filters file reports by minimum severity level.
 */
export function filterFileReports(
  fileReports: FileReport[],
  minLevel: 'error' | 'info' | 'warning',
): FileReport[] {
  const severityOrder = { error: 3, info: 1, warning: 2 }
  const minOrder = severityOrder[minLevel]

  return fileReports
    .map((report) => ({
      ...report,
      violations: report.violations.filter((v) => {
        const vOrder = severityOrder[v.severity as keyof typeof severityOrder] ?? 0
        return vOrder >= minOrder
      }),
    }))
    .filter((report) => report.violations.length > 0)
}
