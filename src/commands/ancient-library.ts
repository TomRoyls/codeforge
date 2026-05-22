import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildAncientLibraryResult,
  type AncientLibraryResult,
} from './ancient-library-helpers.js'
import { formatAncientLibraryJson, formatAncientLibraryTable } from './ancient-library-format-helpers.js'

export default class AncientLibrary extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze ancient library patterns',
      required: false,
    }),
  }

  static override description = 'Analyze code knowledge, preservation, and wisdom like an ancient library'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze ancient library in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze ancient library in src directory as JSON',
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
      command: '<%= config.bin %> <%= command.id %> --format json --output library.json',
      description: 'Export ancient library analysis to JSON file',
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
    const { args, flags } = await this.parse(AncientLibrary)

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

    spinner.text = 'Analyzing ancient library...'

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

    const result: AncientLibraryResult = buildAncientLibraryResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.wings.length} library wings`)

    const outputData =
      format === 'json'
        ? formatAncientLibraryJson(result)
        : formatAncientLibraryTable(result, verbose)

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

export { buildAncientLibraryResult } from './ancient-library-helpers.js'
export type { AncientLibraryResult, ManuscriptPage, LibraryWing, ScrollMeasure, ScholarlyMeasure, CatalogMeasure, PreservationMeasure, IlluminationMeasure, WisdomMeasure } from './ancient-library-helpers.js'
export { formatAncientLibraryJson, formatAncientLibraryTable } from './ancient-library-format-helpers.js'
