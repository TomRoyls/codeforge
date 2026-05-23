import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildEmberHearthIiResult, type EmberHearthIiResult } from './ember-hearth-ii-helpers.js'
import { formatEmberHearthIiJson, formatEmberHearthIiTable } from './ember-hearth-ii-format-helpers.js'

export default class EmberHearthIi extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for ember hearth II metrics',
      required: false,
    }),
  }

  static override description = 'Analyze code warmth deep, burn quality, ash wisdom, fire tending, spark generation, and forge temperature'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory for ember hearth II metrics',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show per-file ember details',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
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
      description: 'Show per-file ember details',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(EmberHearthIi)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
      ],
    })

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing ember hearth II...'

    const files: string[] = []
    const contents: string[] = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        files.push(file.path)
        contents.push('')
      }
    }

    const result: EmberHearthIiResult = buildEmberHearthIiResult(files, contents)

    spinner.succeed(`Analyzed ${files.length} files across ${result.circles.length} circles`)

    const outputData =
      format === 'json'
        ? formatEmberHearthIiJson(result)
        : formatEmberHearthIiTable(result, verbose)

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

export { buildEmberHearthIiResult } from './ember-hearth-ii-helpers.js'
export type { EmberHearthIiResult, GlowingEmber, HearthCircle, Forge, BlacksmithGrade, EmberHearthIiStats, EmberCondition, CircleType, CircleCondition, WarmMeasure, BurningMeasure, WiseMeasure, TendingMeasure, SparkingMeasure, ForgingMeasure } from './ember-hearth-ii-helpers.js'
export { formatEmberHearthIiJson, formatEmberHearthIiTable } from './ember-hearth-ii-format-helpers.js'
