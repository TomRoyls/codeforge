import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildBlueprintResult } from './blueprint-helpers.js'
import type { BlueprintResult } from './blueprint-helpers.js'
import { formatBlueprintJson, formatBlueprintTable } from './blueprint-format-helpers.js'

export default class Blueprint extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze architectural blueprint',
      required: false,
    }),
  }

  static override description = 'Analyze code architectural blueprint'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze blueprint in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output blueprint analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed room and utility analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output blueprint.json',
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
      description: 'Show detailed room and utility analysis',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Blueprint)

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

    spinner.text = 'Analyzing architectural blueprint...'

    const contents: string[] = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: BlueprintResult = buildBlueprintResult(
      filteredFiles.map((f) => f.path),
      contents,
      { ext: flags.ext, format, verbose },
    )

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.floors.length} floors`)

    const outputData =
      format === 'json'
        ? formatBlueprintJson(result)
        : formatBlueprintTable(result, verbose)

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

export { buildBlueprintResult, analyzeBlueprintRoom, analyzeBlueprintFloor, measureScaleAccuracy, measureDimensionConsistency, measureRoomOrganization, classifyRoomType, classifyArchitectGrade, classifyBuildingType, classifyArchitecturalStyle, classifyRoomCondition, classifyFloorCondition, classifyFloorPlan, inspectCodeCompliance, assessZoning, measureUtilities, generateRecommendations } from './blueprint-helpers.js'
export type { BlueprintResult, BlueprintStats, BlueprintRoom, BlueprintFloor, BuildingInfo, WallInfo, DimensionInfo, UtilityInfo, ConnectionInfo, ZoningInfo, ComplianceInfo, RoomType, RoomCondition, FloorPlan, FloorCondition } from './blueprint-helpers.js'
export { formatBlueprintJson, formatBlueprintTable } from './blueprint-format-helpers.js'
