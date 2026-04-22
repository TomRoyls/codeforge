import chalk from 'chalk'
import { join } from 'node:path'

export interface CleanTarget {
  name: string
  path: string
}

export interface CleanFlags {
  cache?: boolean
  dist?: boolean
}

export function getCleanTargets(flags: CleanFlags, cwd: string): CleanTarget[] {
  if (flags.cache) {
    return [
      { name: 'Cache directory', path: join(cwd, '.cache') },
      { name: 'CodeForge cache', path: join(cwd, '.codeforge') },
    ]
  }

  if (flags.dist) {
    return [{ name: 'Dist directory', path: join(cwd, 'dist') }]
  }

  return [
    { name: 'Dist directory', path: join(cwd, 'dist') },
    { name: 'Cache directory', path: join(cwd, '.cache') },
    { name: 'CodeForge cache', path: join(cwd, '.codeforge') },
    { name: 'Coverage directory', path: join(cwd, 'coverage') },
  ]
}

// eslint-disable-next-line max-params
export function formatTargetStatus(
  target: CleanTarget,
  exists: boolean,
  success: boolean,
  error?: string,
  dryRun?: boolean,
): string {
  if (!exists) {
    return chalk.gray(`  - ${target.name} (not found)`)
  }

  if (dryRun) {
    return chalk.cyan(`  • ${target.name}`)
  }

  if (success) {
    return chalk.green(`  ✓ ${target.name}`)
  }

  const message = error || 'Unknown error'
  return chalk.red(`  ✗ ${target.name}: ${message}`)
}

export function formatCleanSummary(cleaned: number, dryRun: boolean): string {
  if (cleaned > 0) {
    const directoryWord = cleaned === 1 ? 'directory' : 'directories'
    if (dryRun) {
      return chalk.cyan(`Would clean ${cleaned} ${directoryWord}`)
    }

    return chalk.green(`Cleaned ${cleaned} ${directoryWord}`)
  }

  return chalk.yellow('Nothing to clean')
}

export function formatCleanHeader(dryRun: boolean): string {
  if (dryRun) {
    return chalk.bold('Would clean the following:\n')
  }

  return chalk.bold('Cleaning generated files...\n')
}

export function displayCleanResult(
  cleaned: number,
  dryRun: boolean,
  logFn: (msg: string) => void,
): void {
  logFn('')
  logFn(formatCleanSummary(cleaned, dryRun))
}
