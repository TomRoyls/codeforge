import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildImpactResult, type ImpactResult } from './impact-helpers.js'
import { formatImpactCsv, formatImpactJson, formatImpactTable } from './impact-format-helpers.js'

export default class Impact extends Command {
  static override args = {
    file: Args.string({
      description: 'File to analyze impact for',
      required: true,
    }),
  }

  static override description = 'Analyze change impact for a specific file'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> src/core.ts',
      description: 'Analyze impact of changes to src/core.ts',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/core.ts --format json',
      description: 'Output impact analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/core.ts --depth 5',
      description: 'Trace dependencies up to 5 levels deep',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/core.ts --verbose',
      description: 'Show full dependency chain tree',
    },
  ]

  static override flags = {
    depth: Flags.integer({
      char: 'd',
      default: 3,
      description: 'Maximum depth for dependency tracing',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show full dependency chain tree',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Impact)

    const targetFile = resolve(args.file as string)

    if (!existsSync(targetFile)) {
      this.error(`File not found: ${targetFile}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { verbose } = flags
    const depth = flags.depth

    const spinner = ora('Discovering files...').start()

    const cwd = resolve('.')
    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']

    const discoveredFiles = await discoverFiles({
      cwd,
      ignore: defaultIgnore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    spinner.text = 'Analyzing impact...'

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

    const relativeTarget = targetFile.replace(cwd + '/', '')
    const target = files.includes(relativeTarget) ? relativeTarget : files.find((f) => f.endsWith(relativeTarget)) ?? relativeTarget

    const result: ImpactResult = buildImpactResult(target, files, contents, { depth, verbose })

    spinner.succeed(`Impact: ${result.stats.blastRadius} files affected (effort: ${result.stats.estimatedEffort})`)

    const outputData =
      format === 'json'
        ? formatImpactJson(result)
        : format === 'csv'
          ? formatImpactCsv(result)
          : formatImpactTable(result, verbose)

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

export { buildImpactResult, extractImports, extractExports, buildReverseDependencyMap, computeDirectDependents, computeIndirectDependents, computeImpactChains, computeRiskLevel, estimateEffort, findUnusedExports, resolveImportPath, matchFile } from './impact-helpers.js'
export type { ImpactResult, ImpactNode, ImpactChain, ImpactStats, ImpactOptions } from './impact-helpers.js'
export { formatImpactCsv, formatImpactJson, formatImpactTable, formatImpactTree, formatBlastRadiusGauge, formatDirectDependents } from './impact-format-helpers.js'
