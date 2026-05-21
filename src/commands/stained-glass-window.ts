import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildStainedGlassWindowResult } from './stained-glass-window-helpers.js'
import type { StainedGlassWindowResult } from './stained-glass-window-helpers.js'
import { formatStainedGlassWindowJson, formatStainedGlassWindowTable } from './stained-glass-window-format-helpers.js'

export default class StainedGlassWindow extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze transparency and light transmission',
      required: false,
    }),
  }

  static override description = 'Analyze code transparency and light transmission like a stained glass window'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze window transparency in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output stained glass window analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed pane and bay analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output window.json',
      description: 'Export analysis to file',
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
      description: 'Show detailed pane and bay analysis',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(StainedGlassWindow)

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
      ? discoveredFiles.filter((f) => {
          const ext = f.path.slice(f.path.lastIndexOf('.')).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing stained glass window...'

    const contents: string[] = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: StainedGlassWindowResult = buildStainedGlassWindowResult(
      filteredFiles.map((f) => f.path),
      contents,
      { ext: flags.ext, format, verbose },
    )

    spinner.succeed(`Analyzed ${filteredFiles.length} panes across ${result.bays.length} bays`)

    const outputData =
      format === 'json'
        ? formatStainedGlassWindowJson(result)
        : formatStainedGlassWindowTable(result, verbose)

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

export { buildStainedGlassWindowResult, analyzeWindowPane, analyzeWindowBay, classifyGlassType, classifyFrameMaterial, classifyGlazierGrade, measureLightTransmission, assessFrame, assessLeading, assessGlass, generateRecommendations } from './stained-glass-window-helpers.js'
export type { StainedGlassWindowResult, StainedGlassWindowStats, CathedralInfo, WindowPane, WindowBay, GlassInfo, FrameInfo, LeadingInfo, LightInfo, GlassType, GlassCondition, FrameMaterial, PaneOrientation, PanePosition, PaneIllumination, BayType, BayCondition, GlazierGrade } from './stained-glass-window-helpers.js'
export { formatStainedGlassWindowJson, formatStainedGlassWindowTable } from './stained-glass-window-format-helpers.js'
