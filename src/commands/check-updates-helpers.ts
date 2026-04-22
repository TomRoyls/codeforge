import chalk from 'chalk'

import { CLIError, SystemError } from '../utils/errors.js'

export interface OutdatedPackage {
  current: string
  dependent: string
  latest: string
  name: string
  wanted: string
}

export interface AuditMetadata {
  vulnerabilities: {
    critical: number
    high: number
    info: number
    low: number
    moderate: number
    total: number
  }
}

export interface JsonResult {
  error: null | string
  outdated: OutdatedPackage[]
  security: AuditMetadata['vulnerabilities'] | null
}

export function parseNpmOutput(stdout: string): OutdatedPackage[] {
  if (!stdout.trim()) return []

  const data = JSON.parse(stdout)
  return Object.entries(data).map(([name, info]) => ({
    current: (info as { current: string }).current,
    dependent: (info as { dependent: string }).dependent,
    latest: (info as { latest: string }).latest,
    name,
    wanted: (info as { wanted: string }).wanted,
  }))
}

export function parseAuditOutput(stdout: string): AuditMetadata {
  const data = JSON.parse(stdout)
  if (!data.metadata?.vulnerabilities) {
    throw new CLIError('Invalid audit response format: missing metadata', {
      code: 'E004',
      suggestions: [
        'Ensure you are running this command in a Node.js project directory',
        'Check that npm is properly installed',
        'Try running "npm audit" manually to see the raw output',
      ],
    })
  }

  return {
    vulnerabilities: data.metadata.vulnerabilities,
  }
}

export function formatOutdatedTable(
  outdated: OutdatedPackage[],
  logFn: (msg: string) => void,
): void {
  if (outdated.length === 0) {
    logFn(chalk.green('✓ All dependencies are up to date!'))
  } else {
    logFn(chalk.yellow(`Found ${outdated.length} outdated dependencies:\n`))
    for (const pkg of outdated) {
      logFn(`  ${chalk.cyan(pkg.name)} ${chalk.dim(pkg.current)} → ${chalk.green(pkg.latest)}`)
    }

    logFn(chalk.dim(`\n  Run ${chalk.cyan('npm update')} to update dependencies`))
  }
}

export function formatSecuritySummary(audit: AuditMetadata, logFn: (msg: string) => void): void {
  if (audit.vulnerabilities.total === 0) {
    logFn(chalk.green('✓ No security vulnerabilities found!'))
  } else {
    const { critical, high, info, low, moderate } = audit.vulnerabilities
    logFn(chalk.red(`Found ${audit.vulnerabilities.total} security vulnerabilities:\n`))
    if (critical > 0) logFn(`  ${chalk.red.bold('Critical')}: ${critical}`)
    if (high > 0) logFn(`  ${chalk.red('High')}: ${high}`)
    if (moderate > 0) logFn(`  ${chalk.yellow('Moderate')}: ${moderate}`)
    if (low > 0) logFn(`  ${chalk.dim('Low')}: ${low}`)
    if (info > 0) logFn(`  ${chalk.blue('Info')}: ${info}`)
    logFn(chalk.dim(`\n  Run ${chalk.cyan('npm audit fix')} to fix vulnerabilities`))
  }
}

export function buildJsonResult(
  outdated: OutdatedPackage[],
  security: AuditMetadata['vulnerabilities'] | null,
  outdatedError: null | string,
  securityError: null | string,
): JsonResult {
  let error: null | string = outdatedError
  if (securityError) {
    error = error ? `${error}; ${securityError}` : securityError
  }

  return {
    error,
    outdated,
    security,
  }
}

export function formatJsonOutput(result: JsonResult): string {
  return JSON.stringify(result, null, 2)
}

export function createOutdatedError(cause: Error): SystemError {
  return new SystemError('Failed to check for outdated packages', {
    cause,
    code: 'E504',
    context: { command: 'npm outdated', errorMessage: cause.message },
  })
}

export function createAuditError(cause: Error): SystemError {
  return new SystemError('Failed to run security audit', {
    cause,
    code: 'E505',
    context: { command: 'npm audit', errorMessage: cause.message },
  })
}

export function createUpdateError(cause: Error): SystemError {
  return new SystemError('Failed to update dependencies', {
    cause,
    code: 'E506',
    context: { command: 'npm update', errorMessage: cause.message },
  })
}

export function createFixSecurityError(cause: Error): SystemError {
  return new SystemError('Failed to fix security vulnerabilities', {
    cause,
    code: 'E503',
    context: { command: 'npm audit fix', errorMessage: cause.message },
  })
}
