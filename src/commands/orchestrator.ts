import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildOrchestratorResult } from './orchestrator-helpers.js'
import { formatOrchestratorJson, formatOrchestratorOutput } from './orchestrator-format-helpers.js'

export default class Orchestrator extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Analyze function orchestration and coordination patterns'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze orchestration patterns in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output orchestration analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --verbose',
      description: 'Show all functions and patterns',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
  ]

  static override flags = {
    ext: Flags.string({
      description: 'Comma-separated file extensions (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'console',
      description: 'Output format (console, json)',
    }),
    help: Flags.help({ char: 'h' }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show all functions and patterns',
    }),
  }

  override async run(): Promise<void> {
    const { args, flags } = await this.parse(Orchestrator)
    const targetPath = resolve(args.path ?? '.')

    if (!existsSync(targetPath)) {
      this.error(`Path does not exist: ${targetPath}`)
    }

    const spinner = ora('Analyzing function orchestration...').start()

    try {
      const extensions = flags.ext
        ? flags.ext.split(',').map((e) => e.trim())
        : ['.ts', '.tsx', '.js', '.jsx', '.mjs']

      const files = await discoverFiles(targetPath, {
        extensions,
        ignore: flags.ignore,
      })

      if (files.length === 0) {
        spinner.warn('No source files found.')
        return
      }

      const contents: string[] = []
      const filePaths: string[] = []

      for (const file of files) {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf-8')
          contents.push(content)
          filePaths.push(file.path)
        } catch {
          // skip unreadable files
        }
      }

      const result = buildOrchestratorResult(filePaths, contents, { verbose: flags.verbose })

      spinner.succeed(`Orchestration analysis complete (${result.stats.totalFunctions} functions).`)

      const output = flags.format === 'json'
        ? formatOrchestratorJson(result)
        : formatOrchestratorOutput(result)

      if (flags.output) {
        await fs.writeFile(flags.output, output, 'utf-8')
        this.log(`Output written to ${flags.output}`)
      } else {
        this.log(output)
      }
    } catch (error: unknown) {
      spinner.fail('Orchestration analysis failed.')
      this.error(error instanceof Error ? error.message : String(error))
    }
  }
}
