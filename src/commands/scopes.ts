import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildScopesResult, type ScopesOptions, type ScopesResult } from './scopes-helpers.js'
import { formatScopesJson, formatScopesTable } from './scopes-format-helpers.js'

export default class Scopes extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze module scopes',
      required: false,
    }),
  }

  static override description = 'Analyze module boundaries and dependency scopes'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze scopes in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze scopes in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze scopes for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed coupling info with dependency matrix',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --depth 3',
      description: 'Limit dependency depth analysis to 3',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output scopes.json',
      description: 'Export scopes analysis to JSON file',
    },
  ]

  static override flags = {
    depth: Flags.integer({
      default: 5,
      description: 'Max dependency depth to analyze',
    }),
    ext: Flags.string({
      char: 'e',
      default: '.ts,.tsx,.js,.jsx',
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
      description: 'Show detailed coupling info',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Scopes)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

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

    spinner.text = 'Analyzing module scopes...'

    const contentReader = async (filePath: string): Promise<string> => {
      return fs.readFile(resolve(targetPath, filePath), 'utf8')
    }

    const options: ScopesOptions = {
      maxDepth: flags.depth,
    }

    const result: ScopesResult = await buildScopesResult(discoveredFiles, contentReader, options)

    spinner.succeed(
      `Analyzed ${discoveredFiles.length} files across ${result.stats.totalModules} modules`,
    )

    const outputData = format === 'json' ? formatScopesJson(result) : formatScopesTable(result, verbose)

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

export { buildScopesResult, buildDependencyMatrix, computeCohesionScore, computeCouplingScore, computeInstability, detectCircularDependencies, detectLayerViolations, extractImports, resolveModulePath, buildModuleMap } from './scopes-helpers.js'
export type { CircularDependency, LayerViolation, ModuleInfo, ScopeStats, ScopesOptions, ScopesResult } from './scopes-helpers.js'
export { formatScore, formatScopesJson, formatScopesTable } from './scopes-format-helpers.js'
