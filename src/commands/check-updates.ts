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

import {
  type AuditMetadata,
  type OutdatedPackage,
  buildJsonResult,
  createAuditError,
  createFixSecurityError,
  createOutdatedError,
  createUpdateError,
  formatJsonOutput,
  formatOutdatedTable,
  formatSecuritySummary,
  parseAuditOutput,
  parseNpmOutput,
} from './check-updates-helpers.js'

const execAsync = promisify(exec)

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
      throw createFixSecurityError(error as Error)
    }
  }

  private async getOutdatedPackages(): Promise<OutdatedPackage[]> {
    try {
      const { stdout } = await execAsync('npm outdated --json || true')
      return parseNpmOutput(stdout)
    } catch (error) {
      throw createOutdatedError(error as Error)
    }
  }

  private async getSecurityAudit(): Promise<AuditMetadata> {
    try {
      const { stdout } = await execAsync('npm audit --json')
      return parseAuditOutput(stdout)
    } catch (error) {
      if (error instanceof CLIError) throw error
      throw createAuditError(error as Error)
    }
  }

  private async runHumanReadable(includeSecurity: boolean): Promise<void> {
    this.log('Checking for outdated dependencies...\n')

    try {
      const outdated = await this.getOutdatedPackages()
      formatOutdatedTable(outdated, (msg) => this.log(msg))
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
        formatSecuritySummary(audit, (msg) => this.log(msg))
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
    let outdated: OutdatedPackage[] = []
    let outdatedError: null | string = null

    try {
      outdated = await this.getOutdatedPackages()
    } catch (error) {
      outdatedError = `Failed to check outdated packages: ${(error as Error).message}`
    }

    let security: AuditMetadata['vulnerabilities'] | null = null
    let securityError: null | string = null

    if (includeSecurity) {
      try {
        const audit = await this.getSecurityAudit()
        security = audit.vulnerabilities
      } catch (error) {
        securityError = `Failed to check security: ${(error as Error).message}`
      }
    }

    const result = buildJsonResult(outdated, security, outdatedError, securityError)
    this.log(formatJsonOutput(result))
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
      throw createUpdateError(error as Error)
    }
  }
}
