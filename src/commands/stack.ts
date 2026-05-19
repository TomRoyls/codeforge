import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { analyzeStack } from './stack-helpers.js'
import { formatStackJson, formatStackTable } from './stack-format-helpers.js'

export default class Stack extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Detect the technology stack used in a project'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze stack in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze stack as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detection evidence',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output stack.json',
      description: 'Export stack to JSON file',
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
      description: 'Show detected evidence for each technology',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Stack)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Analyzing technology stack...').start()

    const result = await analyzeStack(targetPath)

    spinner.succeed(
      `Detected ${result.technologies.length} technologies across ${result.languages.length} languages`,
    )

    const outputData = format === 'json' ? formatStackJson(result) : formatStackTable(result, verbose)

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

export { analyzeStack, detectFromFilesystem, detectFromPackageJson, detectLanguages, detectPackageManager, detectProjectType } from './stack-helpers.js'
export type { DetectedTech, LanguageEntry, StackResult } from './stack-helpers.js'
export { formatStackJson, formatStackTable } from './stack-format-helpers.js'
