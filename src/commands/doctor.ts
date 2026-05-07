import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import {
  checkConfigExists,
  checkConfigValid,
  checkFileCount,
  checkFilePatterns,
  checkMemory,
  checkNodeVersion,
  checkPackageJson,
  checkRulesValid,
  checkTsConfig,
  checkTypeScript,
  displayResults,
  type DoctorResult,
  colorMessage as helperColorMessage,
  fileExists as helperFileExists,
  getStatusSymbol as helperGetStatusSymbol,
} from './doctor-helpers.js'

export default class Doctor extends Command {
  static override description = 'Diagnose configuration and environment issues'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Run all diagnostic checks',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --json',
      description: 'Output results as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed information',
    },
  ]

  static override flags = {
    json: Flags.boolean({
      char: 'j',
      default: false,
      description: 'Output results as JSON',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed information',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Doctor)
    const cwd = process.cwd()

    if (!flags.json) {
      this.log('')
      this.log(chalk.bold('CodeForge Doctor - Diagnosing your setup...'))
      this.log('')
    }

    const results: DoctorResult = {
      checks: [],
      errors: 0,
      passed: true,
      warnings: 0,
    }

    // Environment checks
    await checkNodeVersion(results)
    await checkMemory(results)
    await checkTypeScript(results, cwd)

    // Configuration checks
    await checkConfigExists(results, cwd)
    await checkConfigValid(results, cwd)
    await checkRulesValid(results, cwd)
    await checkFilePatterns(results, cwd)

    // Project health checks
    await checkFileCount(results, cwd)
    await checkTsConfig(results, cwd)
    await checkPackageJson(results, cwd)

    // Count errors and warnings
    results.errors = results.checks.filter((c) => c.status === 'error').length
    results.warnings = results.checks.filter((c) => c.status === 'warning').length
    results.passed = results.errors === 0

    if (flags.json) {
      this.log(JSON.stringify(results, null, 2))
    } else {
      for (const line of displayResults(results, flags.verbose)) {
        this.log(line)
      }

      if (flags.verbose) {
        await this.fileExists(process.cwd())
        this.getStatusSymbol('ok')
        this.colorMessage('ok', '')
      }
    }

    // Exit with error code if there are errors
    if (!results.passed) {
      this.exit(1)
    }
  }

  private colorMessage(status: string, message: string): string {
    return helperColorMessage(status as 'error' | 'ok' | 'warning', message)
  }

  private fileExists(filePath: string): Promise<boolean> {
    return helperFileExists(filePath)
  }

  private getStatusSymbol(status: string): string {
    return helperGetStatusSymbol(status as 'error' | 'ok' | 'warning')
  }
}
