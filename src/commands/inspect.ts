import { Args, Command, Flags } from '@oclif/core'
import { existsSync, statSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { analyzeFile, type FileInspection } from './inspect-helpers.js'
import { formatInspectionOutput } from './inspect-format-helpers.js'

export default class Inspect extends Command {
  static override args = {
    file: Args.string({
      description: 'Path to the file to inspect',
      required: true,
    }),
  }

  static override description = 'Perform deep analysis of a single source file'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> src/index.ts',
      description: 'Inspect a TypeScript file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/app.ts --format json',
      description: 'Inspect file and output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/utils.ts --verbose',
      description: 'Inspect file with detailed line numbers',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/main.ts --format json --output report.json',
      description: 'Inspect file and save JSON to file',
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed information including line numbers',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Inspect)

    const targetPath = resolve(args.file as string)

    if (!existsSync(targetPath)) {
      this.error(`File not found: ${targetPath}`, { exit: 1 })
    }

    const stat = statSync(targetPath)
    if (!stat.isFile()) {
      this.error(`Path is not a file: ${targetPath}`, { exit: 1 })
    }

    const spinner = ora('Analyzing file...').start()

    const content = await fs.readFile(targetPath, 'utf8')
    const inspection: FileInspection = analyzeFile(content, targetPath)

    spinner.succeed(`Analysis complete for ${targetPath}`)

    const format = flags.format as 'json' | 'table'
    const outputData = formatInspectionOutput(inspection, format, flags.verbose)

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

export { analyzeFile, type FileInspection } from './inspect-helpers.js'
export { formatInspectionOutput, formatInspectionTable } from './inspect-format-helpers.js'
