import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildRadarResult } from './radar-helpers.js'
import { formatRadarJson, formatRadarOutput } from './radar-format-helpers.js'

export default class Radar extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Generate project quality radar chart'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show radar chart for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output radar analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --verbose',
      description: 'Show detailed findings per dimension',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ignore "**/test/**"',
      description: 'Ignore test directory',
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
      description: 'Show detailed findings per dimension',
    }),
  }

  override async run(): Promise<void> {
    const { args, flags } = await this.parse(Radar)
    const targetPath = resolve(args.path ?? '.')

    if (!existsSync(targetPath)) {
      this.error(`Path does not exist: ${targetPath}`)
    }

    const spinner = ora('Generating quality radar...').start()

    try {
      const extensions = flags.ext
        ? flags.ext.split(',').map((e) => e.trim())
        : ['.ts', '.tsx', '.js', '.jsx', '.mjs']

      const files = await discoverFiles({ cwd: targetPath, patterns: extensions.map(e => `**/*${e}`), ignore: flags.ignore ?? [] })

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

      const result = buildRadarResult(filePaths, contents, { verbose: flags.verbose })

      spinner.succeed(`Radar analysis complete (${result.chart.overall}/100 ${result.chart.overallGrade}).`)

      const output = flags.format === 'json'
        ? formatRadarJson(result)
        : formatRadarOutput(result)

      if (flags.output) {
        await fs.writeFile(flags.output, output, 'utf-8')
        this.log(`Output written to ${flags.output}`)
      } else {
        this.log(output)
      }
    } catch (error: unknown) {
      spinner.fail('Radar analysis failed.')
      this.error(error instanceof Error ? error.message : String(error))
    }
  }
}
