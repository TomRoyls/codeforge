import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildCodeExplanation, type ExplainOptions } from './explain-code-helpers.js'
import { formatExplainCsv, formatExplainJson, formatExplainTable } from './explain-code-format-helpers.js'

export default class ExplainCode extends Command {
  static override args = {
    file: Args.string({
      description: 'Source file to explain',
      required: true,
    }),
  }

  static override description = 'Generate a structured explanation of source code'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> src/commands/count.ts',
      description: 'Explain a TypeScript file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/foo.ts --format json',
      description: 'Output explanation as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/foo.ts --line 42',
      description: 'Explain only the section at line 42',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/foo.ts --function parseConfig',
      description: 'Explain only the parseConfig function',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/foo.ts --verbose',
      description: 'Show detailed section info with call graph',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/foo.ts --format csv --output explain.csv',
      description: 'Export explanation to CSV',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
    }),
    function: Flags.string({
      char: 'F',
      description: 'Explain only a specific function by name',
    }),
    line: Flags.integer({
      char: 'l',
      description: 'Explain only the section at a specific line number',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed section info',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ExplainCode)

    const targetPath = resolve(args.file as string)

    if (!existsSync(targetPath)) {
      this.error(`File not found: ${targetPath}`, { exit: 1 })
    }

    const spinner = ora('Analyzing file...').start()

    let content: string
    try {
      content = await fs.readFile(targetPath, 'utf8')
    } catch {
      spinner.fail(`Failed to read file: ${targetPath}`)
      this.error(`Failed to read file: ${targetPath}`, { exit: 1 })
    }

    const options: ExplainOptions = {
      functionName: flags.function,
      line: flags.line,
      verbose: flags.verbose,
    }

    const explanation = buildCodeExplanation(targetPath, content, options)

    const format = flags.format as 'csv' | 'json' | 'table'
    spinner.succeed(`Explained ${explanation.sections.length} sections in ${explanation.file}`)

    const outputData =
      format === 'json'
        ? formatExplainJson(explanation)
        : format === 'csv'
          ? formatExplainCsv(explanation)
          : formatExplainTable(explanation, flags.verbose)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Explanation written to ${flags.output}`)
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

export { buildCodeExplanation } from './explain-code-helpers.js'
export type { CodeExplanation, CodeSection, ExplainOptions, FileMetrics } from './explain-code-helpers.js'
export { formatExplainCsv, formatExplainJson, formatExplainTable } from './explain-code-format-helpers.js'
