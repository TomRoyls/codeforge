import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildValidationResult } from './validate-helpers.js'
import { formatValidationJson, formatValidationTable } from './validate-format-helpers.js'

export default class Validate extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to validate',
      required: false,
    }),
  }

  static override description = 'Validate codebase against configurable rules'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Run all validation rules',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --rules NO_CONSOLE,NO_TODO',
      description: 'Run specific rules only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Validate TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show fix suggestions',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output report.json',
      description: 'Export results as JSON',
    },
  ]

  static override flags = {
    ext: Flags.string({
      char: 'e',
      default: '',
      description: 'Comma-separated file extensions to validate (e.g., ".ts,.tsx")',
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
    rules: Flags.string({
      char: 'r',
      description: 'Comma-separated rule IDs to enable',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show fix suggestions',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Validate)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Validating codebase...').start()

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
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    const rules = flags.rules
      ? flags.rules.split(',').map((r) => r.trim()).filter(Boolean)
      : null

    const contentReader = async (filePath: string) => {
      const absolute = resolve(targetPath, filePath)
      return fs.readFile(absolute, 'utf8')
    }

    const result = await buildValidationResult(
      filteredFiles.map((f) => f.path),
      contentReader,
      {
        extensions,
        ignorePatterns: ignore,
        rules,
      },
    )

    spinner.succeed(
      `Validation complete: ${result.stats.errors} errors, ${result.stats.warnings} warnings`,
    )

    const outputData =
      format === 'json' ? formatValidationJson(result) : formatValidationTable(result, verbose)

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

    if (result.stats.errors > 0) {
      this.exit(1)
    }
  }
}

export {
  getBuiltinRules,
  checkMaxFileLength,
  checkNoConsole,
  checkRequireJSDoc,
  checkNoTodo,
  checkMaxFunctionLength,
  checkMaxParams,
  checkNamingConvention,
  checkImportOrder,
  checkNoTypeAny,
  checkExplicitReturnTypes,
  checkNoHardcodedStrings,
  checkConsistentNaming,
  computeValidationStats,
  buildValidationResult,
} from './validate-helpers.js'
export type {
  Violation,
  ValidationRule,
  ValidationStats,
  ValidationResult,
  ValidateOptions,
  ContentReader,
} from './validate-helpers.js'
export { formatSeverity, formatValidationTable, formatValidationJson } from './validate-format-helpers.js'
