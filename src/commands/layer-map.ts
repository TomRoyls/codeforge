import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildLayerMapResult, type LayerMapResult } from './layer-map-helpers.js'
import { formatLayerMapCsv, formatLayerMapJson, formatLayerMapTable } from './layer-map-format-helpers.js'

export default class LayerMap extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to map architectural layers for',
      required: false,
    }),
  }

  static override description = 'Map architectural layers and detect layering violations'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Map layers in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Map layers in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show per-file layer breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output layers.csv',
      description: 'Export layer map to CSV',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
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
      description: 'Show per-file layer breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(LayerMap)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
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
        '**/*.py',
        '**/*.rs',
        '**/*.go',
        '**/*.java',
      ],
    })

    spinner.text = 'Analyzing layers...'

    const files: string[] = []
    const contents: string[] = []

    for (const file of discoveredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        // skip unreadable files
      }
    }

    const result: LayerMapResult = buildLayerMapResult(files, contents, { verbose })

    spinner.succeed(`Mapped ${result.stats.totalLayers} layers across ${result.stats.totalFiles} files`)

    const outputData =
      format === 'json'
        ? formatLayerMapJson(result)
        : format === 'csv'
          ? formatLayerMapCsv(result)
          : formatLayerMapTable(result, verbose)

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

export { buildLayerMapResult, detectLayer, buildLayers, analyzeLayerDependencies, detectLayerViolations, computeLayerBalance, computeHealthScore } from './layer-map-helpers.js'
export type { ArchLayer, LayerDependency, LayerViolation, LayerMapResult, LayerMapStats, LayerMapOptions, LayerName } from './layer-map-helpers.js'
export { formatLayerMapCsv, formatLayerMapJson, formatLayerMapTable, formatLayerDiagram, formatHealthMeter, formatBalanceMeter } from './layer-map-format-helpers.js'
