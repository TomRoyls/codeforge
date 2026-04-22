import chalk from 'chalk'

import type { CheckResult, DoctorResult } from './doctor-helpers.js'

export function colorMessage(status: CheckResult['status'], message: string): string {
  switch (status) {
    case 'error': {
      return chalk.red(message)
    }

    case 'ok': {
      return message
    }

    case 'warning': {
      return chalk.yellow(message)
    }
  }
}

export function getStatusSymbol(status: CheckResult['status']): string {
  switch (status) {
    case 'error': {
      return chalk.red('✗')
    }

    case 'ok': {
      return chalk.green('✓')
    }

    case 'warning': {
      return chalk.yellow('⚠')
    }
  }
}

export function displayResults(results: DoctorResult, verbose: boolean): string[] {
  const lines: string[] = []

  for (const check of results.checks) {
    const symbol = getStatusSymbol(check.status)
    const coloredMessage = colorMessage(check.status, check.message)

    lines.push(`${symbol} ${coloredMessage}`)

    if (verbose && check.details) {
      lines.push(chalk.gray(`  ${check.details}`))
    }
  }

  lines.push('')

  if (results.errors > 0) {
    lines.push(chalk.red(`Found ${results.errors} error(s), ${results.warnings} warning(s)`))
  } else if (results.warnings > 0) {
    lines.push(
      chalk.yellow(
        `All checks passed! (${results.warnings} warning${results.warnings > 1 ? 's' : ''})`,
      ),
    )
  } else {
    lines.push(chalk.green('All checks passed!'))
  }

  return lines
}
