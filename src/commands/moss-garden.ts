import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildMossGardenResult,
  type MossGardenResult,
} from './moss-garden-helpers.js'
import { formatMossGardenJson, formatMossGardenTable } from './moss-garden-format-helpers.js'

export default class MossGarden extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze moss garden patterns',
      required: false,
    }),
  }

  static override description = 'Analyze code growth, patience, resilience, quiet beauty, and continuity like an ancient moss garden'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze moss garden in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze moss garden in src directory as JSON',
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
      command: '<%= config.bin %> <%= command.id %> --format json --output moss.json',
      description: 'Export moss garden analysis to JSON file',
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
    const { args, flags } = await this.parse(MossGarden)

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

    spinner.text = 'Analyzing moss garden...'

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

    const result: MossGardenResult = buildMossGardenResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.colonies.length} moss colonies`)

    const outputData =
      format === 'json'
        ? formatMossGardenJson(result)
        : formatMossGardenTable(result, verbose)

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

export { buildMossGardenResult } from './moss-garden-helpers.js'
export type { MossGardenResult, MossCushion, MossColony, VitalityMeasure, RhizoidMeasure, CushionMeasure, SporophyteMeasure, MoistureMeasure, SerenityMeasure } from './moss-garden-helpers.js'
export { formatMossGardenJson, formatMossGardenTable } from './moss-garden-format-helpers.js'
