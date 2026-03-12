import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs/promises'
import { join } from 'node:path'

import type { CodeForgeConfig } from '../config/types.js'
import type { RuleSeverity } from '../rules/types.js'

import {
  detectESLintConfig,
  migrateESLintConfig,
  readESLintConfig,
} from '../core/migrators/eslint.js'

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
      options: ['eslint'],
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
      return
    }

    this.log(chalk.green(`✓ Found: ${configPath}`))

    const config = await readESLintConfig(configPath)

    if (!config) {
      this.error('Could not parse ESLint configuration. JS configs require manual conversion.')
      return
    }

    this.log(chalk.gray('Migrating rules...'))

    const result = migrateESLintConfig(config)

    const codeforgeConfig: CodeForgeConfig = {
      files: ['**/*.ts', '**/*.tsx'],
      ignore: ['**/node_modules/**', '**/dist/**'],
      rules: result.rules as Record<string, [RuleSeverity, Record<string, unknown>] | RuleSeverity>,
    }

    this.log('')
    this.log(chalk.bold('Migration Summary:'))
    this.log(chalk.gray(`  Mapped rules: ${Object.keys(result.rules).length}`))
    this.log(chalk.gray(`  Unmapped rules: ${result.unmapped.length}`))

    if (result.unmapped.length > 0) {
      this.log('')
      this.log(chalk.yellow('Unmapped ESLint rules:'))
      for (const rule of result.unmapped.slice(0, 10)) {
        this.log(chalk.gray(`  - ${rule}`))
      }

      if (result.unmapped.length > 10) {
        this.log(chalk.gray(`  ... and ${result.unmapped.length - 10} more`))
      }
    }

    if (flags.dryRun) {
      this.log('')
      this.log(chalk.bold('Generated config (dry run):'))
      this.log(chalk.gray(JSON.stringify(codeforgeConfig, null, 2)))
      return
    }

    const outputPath = join(cwd, flags.output)

    if (!flags.force) {
      try {
        await fs.access(outputPath)
        this.error(`Config already exists: ${flags.output}. Use --force to overwrite.`)
        return
      } catch {
        // File doesn't exist
      }
    }

    await fs.writeFile(outputPath, JSON.stringify(codeforgeConfig, null, 2), 'utf8')

    this.log('')
    this.log(chalk.green(`✓ Created ${flags.output}`))
    this.log('')
    this.log(chalk.bold('Next steps:'))
    this.log(chalk.gray('  1. Review the generated configuration'))
    this.log(chalk.gray('  2. Run `codeforge analyze` to check your code'))
    this.log(chalk.gray('  3. Address any unmapped rules manually'))
  }
}
