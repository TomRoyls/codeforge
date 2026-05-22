import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildLabyrinthDepthsResult,
  type LabyrinthDepthsResult,
} from './labyrinth-depths-helpers.js'
import { formatLabyrinthDepthsJson, formatLabyrinthDepthsTable } from './labyrinth-depths-format-helpers.js'

export default class LabyrinthDepths extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze labyrinth depth patterns',
      required: false,
    }),
  }

  static override description = 'Analyze code complexity, maze structure, and navigability like a labyrinth'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze labyrinth depths in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze labyrinth depths in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show per-file breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output labyrinth.json',
      description: 'Export labyrinth analysis to JSON file',
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
      description: 'Show per-file breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(LabyrinthDepths)

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
        '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.json',
        '**/*.css', '**/*.html', '**/*.md', '**/*.py', '**/*.rs',
        '**/*.go', '**/*.java', '**/*.rb', '**/*.sh',
        '**/*.yaml', '**/*.yml', '**/*.xml', '**/*.sql',
      ],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => extensions.includes(extname(f.path).toLowerCase()))
      : discoveredFiles

    spinner.text = 'Analyzing labyrinth depths...'

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

    const result: LabyrinthDepthsResult = buildLabyrinthDepthsResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.levels.length} labyrinth levels`)

    const outputData =
      format === 'json'
        ? formatLabyrinthDepthsJson(result)
        : formatLabyrinthDepthsTable(result, verbose)

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

export { buildLabyrinthDepthsResult } from './labyrinth-depths-helpers.js'
export type { LabyrinthDepthsResult, LabyrinthChamber, LabyrinthLevel, MazeMeasure, ThreadMeasure, MinotaurMeasure, ExitMeasure, DepthMeasure, TheseusMeasure } from './labyrinth-depths-helpers.js'
export { formatLabyrinthDepthsJson, formatLabyrinthDepthsTable } from './labyrinth-depths-format-helpers.js'
