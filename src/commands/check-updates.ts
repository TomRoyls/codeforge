/**
 * CheckUpdates command - checks for outdated dependencies and security vulnerabilities.
 *
 * Analyzes project dependencies to identify outdated packages and potential
 * security vulnerabilities, with options to update or fix automatically.
 *
 * Features:
 * - Outdated package detection
 * - Security vulnerability auditing
 * - Automatic dependency updates
 * - Automatic vulnerability fixes
 * - JSON output for CI/CD integration
 *
 * @example
 * ```bash
 * codeforge check-updates
 * codeforge check-updates --update
 * codeforge check-updates --fix-security
 * ```
 */
import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

import { CLIError, SystemError } from '../utils/errors.js'

const execAsync = promisify(exec)

interface OutdatedPackage {
  current: string
  dependent: string
  latest: string
  name: string
  wanted: string
}

interface AuditMetadata {
  vulnerabilities: {
    critical: number
    high: number
    info: number
    low: number
    moderate: number
    total: number
  }
}

export default class CheckUpdates extends Command {
  static override description = 'Check for outdated dependencies and security vulnerabilities'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Check for outdated dependencies',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --json',
      description: 'Output results as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --no-security',
      description: 'Skip security vulnerability checks',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --update',
      description: 'Update outdated dependencies to latest versions',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --fix-security',
      description: 'Fix security vulnerabilities automatically',
    },
  ]

  static override flags = {
    fixSecurity: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Fix security vulnerabilities automatically',
    }),
    json: Flags.boolean({
      description: 'Output results as JSON',
    }),
    security: Flags.boolean({
      allowNo: true,
      char: 's',
      default: true,
      description: 'Include security vulnerability checks',
    }),
    update: Flags.boolean({
      char: 'u',
      default: false,
      description: 'Update outdated dependencies to latest versions',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(CheckUpdates)
    const includeSecurity = flags.security

    if (flags.update) {
      await this.updateDependencies()
    }

    if (flags.fixSecurity && includeSecurity) {
      await this.fixSecurityVulnerabilities()
    }

    await (flags.json ? this.runJson(includeSecurity) : this.runHumanReadable(includeSecurity))
  }

  private async fixSecurityVulnerabilities(): Promise<void> {
    this.log('Fixing security vulnerabilities...\n')
    try {
      const { stdout } = await execAsync('npm audit fix')
      if (stdout.trim()) {
        this.log(stdout)
      }

      this.log(chalk.green('✓ Security vulnerabilities fixed!\n'))
    } catch (error) {
      const err = error as Error
      throw new SystemError('Failed to fix security vulnerabilities', {
        cause: err,
        code: 'E503',
        context: { command: 'npm audit fix', errorMessage: err.message },
      })
    }
  }

  private async getOutdatedPackages(): Promise<OutdatedPackage[]> {
    try {
      const { stdout } = await execAsync('npm outdated --json || true')
      if (!stdout.trim()) return []

      const data = JSON.parse(stdout)
      return Object.entries(data).map(([name, info]) => ({
        current: (info as { current: string }).current,
        dependent: (info as { dependent: string }).dependent,
        latest: (info as { latest: string }).latest,
        name,
        wanted: (info as { wanted: string }).wanted,
      }))
    } catch (error) {
      const err = error as Error
      throw new SystemError('Failed to check for outdated packages', {
        cause: err,
        code: 'E504',
        context: { command: 'npm outdated', errorMessage: err.message },
      })
    }
  }

  private async getSecurityAudit(): Promise<AuditMetadata> {
    try {
      const { stdout } = await execAsync('npm audit --json')
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
    } catch (error) {
      if (error instanceof CLIError) throw error
      const err = error as Error
      throw new SystemError('Failed to run security audit', {
        cause: err,
        code: 'E505',
        context: { command: 'npm audit', errorMessage: err.message },
      })
    }
  }

  private async runHumanReadable(includeSecurity: boolean): Promise<void> {
    this.log('Checking for outdated dependencies...\n')

    try {
      const outdated = await this.getOutdatedPackages()

      if (outdated.length === 0) {
        this.log(chalk.green('✓ All dependencies are up to date!'))
      } else {
        this.log(chalk.yellow(`Found ${outdated.length} outdated dependencies:\n`))
        for (const pkg of outdated) {
          this.log(
            `  ${chalk.cyan(pkg.name)} ${chalk.dim(pkg.current)} → ${chalk.green(pkg.latest)}`,
          )
        }

        this.log(chalk.dim(`\n  Run ${chalk.cyan('npm update')} to update dependencies`))
      }
    } catch (error) {
      if (error instanceof SystemError) {
        this.log(chalk.dim(error.message))
        this.log(
          chalk.dim(
            `Could not check for outdated dependencies: ${error.cause?.message ?? 'unknown error'}`,
          ),
        )
      } else {
        throw error
      }
    }

    if (includeSecurity) {
      this.log('\nChecking for security vulnerabilities...\n')
      try {
        const audit = await this.getSecurityAudit()

        if (audit.vulnerabilities.total === 0) {
          this.log(chalk.green('✓ No security vulnerabilities found!'))
        } else {
          const { critical, high, info, low, moderate } = audit.vulnerabilities
          this.log(chalk.red(`Found ${audit.vulnerabilities.total} security vulnerabilities:\n`))
          if (critical > 0) this.log(`  ${chalk.red.bold('Critical')}: ${critical}`)
          if (high > 0) this.log(`  ${chalk.red('High')}: ${high}`)
          if (moderate > 0) this.log(`  ${chalk.yellow('Moderate')}: ${moderate}`)
          if (low > 0) this.log(`  ${chalk.dim('Low')}: ${low}`)
          if (info > 0) this.log(`  ${chalk.blue('Info')}: ${info}`)
          this.log(chalk.dim(`\n  Run ${chalk.cyan('npm audit fix')} to fix vulnerabilities`))
        }
      } catch (error) {
        if (error instanceof SystemError) {
          this.log(chalk.dim(error.message))
          this.log(
            chalk.dim(
              `Could not check for security vulnerabilities: ${error.cause?.message ?? 'unknown error'}`,
            ),
          )
        } else {
          throw error
        }
      }
    }
  }

  private async runJson(includeSecurity: boolean): Promise<void> {
    const result = {
      error: null as null | string,
      outdated: [] as OutdatedPackage[],
      security: null as AuditMetadata['vulnerabilities'] | null,
    }

    try {
      result.outdated = await this.getOutdatedPackages()
    } catch (error) {
      const err = error as Error
      result.error = `Failed to check outdated packages: ${err.message}`
    }

    if (includeSecurity) {
      try {
        const audit = await this.getSecurityAudit()
        result.security = audit.vulnerabilities
      } catch (error) {
        const err = error as Error
        result.error = result.error
          ? `${result.error}; Failed to check security: ${err.message}`
          : `Failed to check security: ${err.message}`
      }
    }

    this.log(JSON.stringify(result, null, 2))
  }

  private async updateDependencies(): Promise<void> {
    this.log('Updating outdated dependencies...\n')
    try {
      const { stdout } = await execAsync('npm update')
      if (stdout.trim()) {
        this.log(stdout)
      }

      this.log(chalk.green('✓ Dependencies updated!\n'))
    } catch (error) {
      const err = error as Error
      throw new SystemError('Failed to update dependencies', {
        cause: err,
        code: 'E506',
        context: { command: 'npm update', errorMessage: err.message },
      })
    }
  }
}
