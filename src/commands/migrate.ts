import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs/promises'
import { join } from 'node:path'

import {
  detectBiomeConfig,
  migrateBiomeConfig,
  readBiomeConfig,
} from '../core/migrators/biome.js'
import {
  detectESLintConfig,
  migrateESLintConfig,
  readESLintConfig,
} from '../core/migrators/eslint.js'
import {
  detectTSLintConfig,
  migrateTSLintConfig,
  readTSLintConfig,
} from '../core/migrators/tslint.js'
import { MAX_UNMAPPED_RULES_TO_SHOW } from '../utils/constants.js'
import {
  buildCodeForgeConfig,
  formatDryRunOutput,
  formatMigrationSummary,
  formatNextSteps,
  type MigrationResult,
} from './migrate-helpers.js'

export default class Migrate extends Command {
  static override description = 'Migrate from another linter to CodeForge'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> --from eslint',
      description: 'Migrate from ESLint',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --from eslint --dry-run',
      description: 'Preview migration without writing',
    },
  ]

  static override flags = {
    dryRun: Flags.boolean({
      char: 'd',
      default: false,
      description: 'Preview migration without writing files',
    }),
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Overwrite existing config',
    }),
    from: Flags.string({
      char: 'F',
      description: 'Source linter to migrate from',
      options: ['eslint', 'tslint', 'biome'],
      required: true,
    }),
    output: Flags.string({
      char: 'o',
      default: '.codeforgerc.json',
      description: 'Output config file path',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Migrate)
    const cwd = process.cwd()

    this.log(chalk.bold('\n🔄 CodeForge Migrator\n'))

    if (flags.from === 'eslint') {
      await this.migrateFromESLint(cwd, flags)
    } else if (flags.from === 'tslint') {
      await this.migrateFromTSLint(cwd, flags)
    } else if (flags.from === 'biome') {
      await this.migrateFromBiome(cwd, flags)
    } else {
      this.error(`Unsupported linter: ${flags.from}`)
    }
  }

  private async migrateFromESLint(
    cwd: string,
    flags: { dryRun: boolean; force: boolean; output: string },
  ): Promise<void> {
    this.log(chalk.gray('Detecting ESLint configuration...'))

    const configPath = await detectESLintConfig(cwd)

    if (!configPath) {
      this.error('No ESLint configuration found.')
    }

    this.log(chalk.green(`✓ Found: ${configPath}`))

    const config = await readESLintConfig(configPath)

    if (!config) {
      this.error('Could not parse ESLint configuration. JS configs require manual conversion.')
    }

    this.log(chalk.gray('Migrating rules...'))

    const result = migrateESLintConfig(config) as unknown as MigrationResult
    const codeforgeConfig = buildCodeForgeConfig(result.rules)

    formatMigrationSummary(result, MAX_UNMAPPED_RULES_TO_SHOW, (msg) => this.log(msg))

    if (flags.dryRun) {
      formatDryRunOutput(codeforgeConfig, (msg) => this.log(msg))
      return
    }

    const outputPath = join(cwd, flags.output)

    if (!flags.force) {
      try {
        await fs.access(outputPath)
        this.error(`Config already exists: ${flags.output}. Use --force to overwrite.`)
      } catch {
        // File doesn't exist
      }
    }

    try {
      await fs.writeFile(outputPath, JSON.stringify(codeforgeConfig, null, 2), 'utf8')
    } catch (error) {
      this.error(
        `Failed to write migrated config to ${outputPath}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    this.log('')
    this.log(chalk.green(`✓ Created ${flags.output}`))
    formatNextSteps((msg) => this.log(msg))
  }

  private async migrateFromTSLint(
    cwd: string,
    flags: { dryRun: boolean; force: boolean; output: string },
  ): Promise<void> {
    this.log(chalk.gray('Detecting TSLint configuration...'))

    const configPath = await detectTSLintConfig(cwd)

    if (!configPath) {
      this.error('No TSLint configuration found.')
    }

    this.log(chalk.green(`✓ Found: ${configPath}`))

    const config = await readTSLintConfig(configPath)

    if (!config) {
      this.error('Could not parse TSLint configuration.')
    }

    this.log(chalk.gray('Migrating rules...'))

    const result = migrateTSLintConfig(config) as unknown as MigrationResult
    const codeforgeConfig = buildCodeForgeConfig(result.rules)

    formatMigrationSummary(result, MAX_UNMAPPED_RULES_TO_SHOW, (msg) => this.log(msg))

    if (flags.dryRun) {
      formatDryRunOutput(codeforgeConfig, (msg) => this.log(msg))
      return
    }

    const outputPath = join(cwd, flags.output)

    if (!flags.force) {
      try {
        await fs.access(outputPath)
        this.error(`Config already exists: ${flags.output}. Use --force to overwrite.`)
      } catch {
        // File doesn't exist
      }
    }

    try {
      await fs.writeFile(outputPath, JSON.stringify(codeforgeConfig, null, 2), 'utf8')
    } catch (error) {
      this.error(
        `Failed to write migrated config to ${outputPath}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    this.log('')
    this.log(chalk.green(`✓ Created ${flags.output}`))
    formatNextSteps((msg) => this.log(msg))
  }

  private async migrateFromBiome(
    cwd: string,
    flags: { dryRun: boolean; force: boolean; output: string },
  ): Promise<void> {
    this.log(chalk.gray('Detecting Biome configuration...'))

    const configPath = await detectBiomeConfig(cwd)

    if (!configPath) {
      this.error('No Biome configuration found.')
    }

    this.log(chalk.green(`✓ Found: ${configPath}`))

    const config = await readBiomeConfig(configPath)

    if (!config) {
      this.error('Could not parse Biome configuration.')
    }

    this.log(chalk.gray('Migrating rules...'))

    const result = migrateBiomeConfig(config) as unknown as MigrationResult
    const codeforgeConfig = buildCodeForgeConfig(result.rules)

    formatMigrationSummary(result, MAX_UNMAPPED_RULES_TO_SHOW, (msg) => this.log(msg))

    if (flags.dryRun) {
      formatDryRunOutput(codeforgeConfig, (msg) => this.log(msg))
      return
    }

    const outputPath = join(cwd, flags.output)

    if (!flags.force) {
      try {
        await fs.access(outputPath)
        this.error(`Config already exists: ${flags.output}. Use --force to overwrite.`)
      } catch {
        // File doesn't exist
      }
    }

    try {
      await fs.writeFile(outputPath, JSON.stringify(codeforgeConfig, null, 2), 'utf8')
    } catch (error) {
      this.error(
        `Failed to write migrated config to ${outputPath}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    this.log('')
    this.log(chalk.green(`✓ Created ${flags.output}`))
    formatNextSteps((msg) => this.log(msg))
  }
}
