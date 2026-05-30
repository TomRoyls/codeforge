import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { writeFile } from 'node:fs/promises'
import ora from 'ora'

import {
  buildDependenciesResult,
  categorizeVersionType,
  type DependenciesResult,
} from './dependencies-helpers.js'
import {
  formatDependenciesCsv,
  formatDependenciesJson,
  formatDependenciesTable,
} from './dependencies-format-helpers.js'

/**
 * Analyze npm package.json dependencies for outdated, unused, missing,
 * version ranges, dependency tree depth, and health metrics.
 *
 * @example
 * codeforge dependencies
 * codeforge dependencies --format json
 * codeforge dependencies --type deps --depth 2
 * codeforge dependencies --verbose
 */
export default class Dependencies extends Command {
  static override description =
    'Analyze npm package.json dependencies'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze dependencies in current project',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output dependency analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --type deps',
      description: 'Analyze only production dependencies',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --depth 5 --verbose',
      description: 'Show detailed dependency tree up to depth 5',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output deps.csv',
      description: 'Export dependency analysis to CSV',
    },
  ]

  static override flags = {
    'check-updates': Flags.boolean({
      default: false,
      description: 'Show version constraint analysis (simplified, no registry calls)',
    }),
    depth: Flags.integer({
      default: 3,
      description: 'Max dependency tree depth to show',
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
    type: Flags.string({
      default: 'all',
      description: 'Which dependency types to analyze',
      options: ['all', 'deps', 'devDeps'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output including dependency tree',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Dependencies)

    const format = flags.format as 'csv' | 'json' | 'table'
    const verbose = flags.verbose
    const depth = flags.depth

    const spinner = ora('Analyzing npm dependencies...').start()

    const result = buildDependenciesResult(process.cwd(), {
      maxDepth: depth,
      typeFilter: flags.type,
    })

    spinner.succeed(
      `Analyzed ${result.dependencies.length} dependencies (health: ${result.summary.healthScore}/100)`,
    )

    if (flags['check-updates']) {
      this.displayConstraintWarnings(result)
    }

    const outputData =
      format === 'json'
        ? formatDependenciesJson(result)
        : format === 'csv'
          ? formatDependenciesCsv(result)
          : formatDependenciesTable(result, verbose, depth)

    if (flags.output) {
      try {
        await writeFile(flags.output, outputData, 'utf8')
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

  private displayConstraintWarnings(result: DependenciesResult): void {
    const exactCount = result.dependencies.filter(
      (d) => categorizeVersionType(d.parsedRange) === 'exact',
    ).length
    const anyCount = result.dependencies.filter(
      (d) => categorizeVersionType(d.parsedRange) === 'any',
    ).length
    if (exactCount > 0) {
      this.log(chalk.yellow(`  ⚠ ${exactCount} exact version(s) pinned — consider using ranges`))
    }
    if (anyCount > 0) {
      this.log(chalk.red(`  ⚠ ${anyCount} wildcard version(s) — pin to specific ranges`))
    }
  }
}

export {
  buildDependenciesResult,
  categorizeVersionType,
  extractDependencies,
  parsePackageJson,
  parseVersionRange,
  calculateHealthScore,
  calculateMaxDepth,
  buildDependencyTree,
} from './dependencies-helpers.js'
export type {
  DependenciesResult,
  DependencyInfo,
  DependencyTree,
  SemverRange,
} from './dependencies-helpers.js'
export {
  formatDependenciesCsv,
  formatDependenciesJson,
  formatDependenciesTable,
  formatHealthBar,
  formatDependencyTree,
} from './dependencies-format-helpers.js'
