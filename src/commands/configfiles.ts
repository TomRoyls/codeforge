import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildConfigFilesResult } from './configfiles-helpers.js'
import { formatConfigFilesJson, formatConfigFilesTable } from './configfiles-format-helpers.js'

export default class ConfigFiles extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for config files',
      required: false,
    }),
  }

  static override description = 'Discover and analyze project configuration files'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze config files in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze config files as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --validate',
      description: 'Validate config file syntax',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed file information',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output configs.json',
      description: 'Export config analysis to JSON file',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    validate: Flags.boolean({
      default: false,
      description: 'Attempt to parse and validate config files',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show full file details',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigFiles)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Scanning for config files...').start()

    const result = await buildConfigFilesResult(targetPath, async () => null, {
      validate: flags.validate,
    })

    spinner.succeed(`Found ${result.totalFiles} config files (${result.coverage}% coverage)`)

    const outputData = format === 'json' ? formatConfigFilesJson(result) : formatConfigFilesTable(result, verbose)

    if (flags.output) {
      const fs = await import('node:fs/promises')
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

export { buildConfigFilesResult } from './configfiles-helpers.js'
export type { ConfigCategory, ConfigFile, ConfigFilesResult, ConfigIssue } from './configfiles-helpers.js'
export { formatConfigFilesJson, formatConfigFilesTable } from './configfiles-format-helpers.js'
