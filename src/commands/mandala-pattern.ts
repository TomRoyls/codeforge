import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildMandalaPatternResult } from './mandala-pattern-helpers.js'
import { formatMandalaPatternJSON, formatMandalaPatternReport } from './mandala-pattern-format-helpers.js'

export default class MandalaPattern extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for code symmetry and beauty',
      required: false,
    }),
  }

  static override description = 'Analyze code symmetry, balance, and beauty like a mandala pattern'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory for mandala patterns',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory with JSON output',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed per-ring metrics',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
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
      description: 'Show detailed per-file metrics',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MandalaPattern)

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
          const ext = '.' + f.path.split('.').pop()?.toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing mandala patterns...'

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

    const result = buildMandalaPatternResult(files, contents, {})

    spinner.succeed(`Analyzed ${files.length} files across ${result.gardens.length} mandala gardens`)

    const outputData = format === 'json'
      ? formatMandalaPatternJSON(result)
      : formatMandalaPatternReport(result)

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

    void verbose
  }
}

export {
  analyzeMandalaGarden,
  analyzeMandalaRing,
  buildMandalaPatternResult,
  classifyArtistGrade,
  classifyGardenCondition,
  classifyGardenType,
  classifyMandalaCondition,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDescriptiveNames,
  countErrorHandling,
  countExports,
  countFunctions,
  countImports,
  countInterfaces,
  countJSDoc,
  countLoc,
  countTodos,
  countTypeAnnotations,
  generateRecommendations,
  maxNesting,
  measureColors,
  measureCompleteness,
  measureGeometry,
  measureMeditation,
  measurePattern,
  measureRing,
  measureSymmetry,
} from './mandala-pattern-helpers.js'
export type {
  ArtistGrade,
  ColorMeasure,
  CompletenessMeasure,
  GardenCondition,
  GardenType,
  GeometryMeasure,
  MandalaCondition,
  MandalaGarden,
  MandalaPatternResult,
  MandalaPatternStats,
  MandalaRing,
  MeditationMeasure,
  MonasteryMeasure,
  PatternMeasure,
  RingMeasure,
  SymmetryMeasure,
  SymmetryType,
} from './mandala-pattern-helpers.js'
export { formatMandalaPatternJSON, formatMandalaPatternReport } from './mandala-pattern-format-helpers.js'
