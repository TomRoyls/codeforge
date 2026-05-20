import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildMosaicArtistResult, type MosaicArtistOptions } from './mosaic-artist-helpers.js'
import { formatMosaicArtistJson, formatMosaicArtistTable } from './mosaic-artist-format-helpers.js'

export default class MosaicArtist extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze code mosaic composition',
      required: false,
    }),
  }

  static override description = 'Analyze code as a mosaic artist — composition and artistic quality'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze mosaic in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze mosaic in src as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze mosaic for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed tile breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output mosaic.json',
      description: 'Export mosaic analysis to JSON',
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
      description: 'Show detailed tile breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MosaicArtist)

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
        '**/*.json',
        '**/*.css',
        '**/*.html',
        '**/*.md',
        '**/*.py',
        '**/*.rs',
        '**/*.go',
        '**/*.java',
        '**/*.rb',
        '**/*.sh',
        '**/*.yaml',
        '**/*.yml',
        '**/*.xml',
        '**/*.sql',
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

    spinner.text = 'Analyzing mosaic...'

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

    const options: MosaicArtistOptions = { verbose, format, output: flags.output, ignore }
    const result = buildMosaicArtistResult(files, contents, options)

    spinner.succeed(`Analyzed ${filteredFiles.length} files — ${result.stats.totalTiles} tiles, grade: ${result.stats.overallGrade}`)

    const outputData = format === 'json' ? formatMosaicArtistJson(result) : formatMosaicArtistTable(result, verbose)

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

export { buildMosaicArtistResult } from './mosaic-artist-helpers.js'
export type {
  CodePalette,
  MosaicArtistOptions,
  MosaicArtistResult,
  MosaicSection,
  MosaicStats,
  MosaicTile,
  OverallGrade,
  SectionPattern,
  SectionQuality,
  TileEdge,
  TileShape,
  TileType,
} from './mosaic-artist-helpers.js'
export { formatMosaicArtistJson, formatMosaicArtistTable } from './mosaic-artist-format-helpers.js'
