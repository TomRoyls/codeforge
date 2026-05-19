import { Command, Flags } from '@oclif/core'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildLicenseResult, type LicenseOptions, type LicenseResult } from './license-helpers.js'
import { formatLicenseCsv, formatLicenseJson, formatLicenseTable } from './license-format-helpers.js'

export default class License extends Command {
  static override description = 'Detect and analyze project licenses'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Detect project license',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --deps',
      description: 'Include dependency license analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --deps --check',
      description: 'Check for license compatibility issues',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output license info as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output licenses.csv',
      description: 'Export license info to CSV file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed license information',
    },
  ]

  static override flags = {
    check: Flags.boolean({
      default: false,
      description: 'Check for license compatibility issues',
    }),
    deps: Flags.boolean({
      default: false,
      description: 'Include dependency license analysis',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(License)

    const projectDir = resolve('.')
    const format = flags.format as 'csv' | 'json' | 'table'

    const spinner = ora('Analyzing licenses...').start()

    const options: LicenseOptions = {
      check: flags.check,
      deps: flags.deps,
      verbose: flags.verbose,
    }

    const result: LicenseResult = await buildLicenseResult(projectDir, options)

    const depMsg = options.deps ? ` and ${result.summary.totalDeps} dependencies` : ''
    spinner.succeed(`License analysis complete${depMsg}`)

    const outputData =
      format === 'json'
        ? formatLicenseJson(result)
        : format === 'csv'
          ? formatLicenseCsv(result)
          : formatLicenseTable(result, flags.verbose)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(outputData)
    }
  }
}

export { buildLicenseResult, checkLicenseCompatibility, detectLicenseFromText, findLicenseFiles, readPackageJsonLicense, scanDependencyLicenses } from './license-helpers.js'
export type { DepLicense, LicenseBreakdown, LicenseCheckIssue, LicenseInfo, LicenseFile, LicenseOptions, LicenseResult, LicenseSummary, ProjectLicense } from './license-helpers.js'
export { formatLicenseCsv, formatLicenseJson, formatLicenseTable } from './license-format-helpers.js'
