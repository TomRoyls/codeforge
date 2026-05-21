import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildMagnifyingLensResult } from './magnifying-lens-helpers.js'
import type { MagnifyingLensResult } from './magnifying-lens-helpers.js'
import { formatMagnifyingLensJson, formatMagnifyingLensTable } from './magnifying-lens-format-helpers.js'

export default class MagnifyingLens extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to scrutinize code details',
      required: false,
    }),
  }

  static override description = 'Analyze code detail under magnification'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Scrutinize code in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output gemstone inspection as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed inclusion and facet info',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output inspection.json',
      description: 'Export inspection to file',
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
      description: 'Show detailed inclusion and facet info',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MagnifyingLens)

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

    spinner.text = 'Inspecting gemstones under magnification...'

    const contents: string[] = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: MagnifyingLensResult = buildMagnifyingLensResult(
      filteredFiles.map((f) => f.path),
      contents,
      { ext: flags.ext, format, verbose },
    )

    spinner.succeed(`Inspected ${filteredFiles.length} files across ${result.displays.length} displays`)

    const outputData =
      format === 'json'
        ? formatMagnifyingLensJson(result)
        : formatMagnifyingLensTable(result, verbose)

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

export { buildMagnifyingLensResult, inspectGemstone, analyzeGemDisplay, classifyGemType, classifyClarityGrade, classifyCutGrade, classifyColorGrade, classifyGemologistGrade, classifyDisplayGrade, classifyCondition, detectInclusions, analyzeFacets, measureLoupeFindings, measureCutAngles, measureLightPerformance, appraiseValue, measureClarity, measureBrilliance, measureCutQuality, measureCaratWeight, measureFacetPrecision, measureHardness, measureLuster, countMeaningfulLines, countBranches, countErrorHandling, measureNamingQuality, countDuplicateLines, countTodoMarkers, countConsoleStatements, countEmptyCatchBlocks, countDeepNesting, generateRecommendations } from './magnifying-lens-helpers.js'
export type { MagnifyingLensResult, MagnifyingLensStats, GemstoneInspection, GemDisplay, Inclusion, Facets, LoupeFindings, CutAngles, LightPerformance, Appraisal } from './magnifying-lens-helpers.js'
export { formatMagnifyingLensJson, formatMagnifyingLensTable } from './magnifying-lens-format-helpers.js'
