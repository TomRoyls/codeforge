import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildTypesResult,
  computeTypeCoverage,
  extractTypeAnnotations,
  extractTypeDefs,
  type TypesResult,
} from './types-helpers.js'
import { formatTypesCsv, formatTypesJson, formatTypesTable } from './types-format-helpers.js'

export default class Types extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze TypeScript types in',
      required: false,
    }),
  }

  static override description = 'Analyze TypeScript type usage and complexity'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze types in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze types in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze types for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10',
      description: 'Show top 10 most complex types',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed type analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output types.csv',
      description: 'Export type analysis to CSV file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '.ts,.tsx',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
    }),
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
    top: Flags.integer({
      default: 20,
      description: 'Show top N most complex types',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Types)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { top, verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const extensions = flags.ext
      .split(',')
      .map((e: string) => e.trim())
      .filter(Boolean)

    const patterns = extensions.map((ext: string) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns,
    })

    const filteredFiles = discoveredFiles.filter((f) => {
      const ext = extname(f.path).toLowerCase()
      return extensions.includes(ext)
    })

    spinner.text = 'Analyzing types...'

    const allAnnotations = []
    const allTypeDefs = []
    let totalCoverage = 0
    let coverageCount = 0

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        const annotations = extractTypeAnnotations(content, file.path)
        const typeDefs = extractTypeDefs(content, file.path)
        const coverage = computeTypeCoverage(content)
        allAnnotations.push(...annotations)
        allTypeDefs.push(...typeDefs)
        totalCoverage += coverage
        coverageCount++
      } catch {
        continue
      }
    }

    const result: TypesResult = buildTypesResult(allAnnotations, allTypeDefs, { top })

    result.typeCoverage = coverageCount > 0 ? Math.round(totalCoverage / coverageCount) : 100

    spinner.succeed(
      `Analyzed ${filteredFiles.length} files, found ${result.totalAnnotations} type annotations and ${result.totalTypeDefs} type definitions`,
    )

    const outputData =
      format === 'json'
        ? formatTypesJson(result)
        : format === 'csv'
          ? formatTypesCsv(result)
          : formatTypesTable(result, verbose)

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

export { buildTypesResult, computeTypeComplexity, computeTypeCoverage, extractTypeAnnotations, extractTypeDefs } from './types-helpers.js'
export type { BuildTypesResultOptions, TypeAnnotation, TypeInfo, TypesResult } from './types-helpers.js'
export { formatTypesCsv, formatTypesJson, formatTypesTable } from './types-format-helpers.js'
