/**
 * GeneratePlugin command - generates a new CodeForge plugin scaffold.
 *
 * Creates a complete plugin structure with package.json, TypeScript config,
 * sample rule implementation, tests, and documentation.
 *
 * Features:
 * - TypeScript and JavaScript plugin support
 * - Sample rule scaffolding
 * - Complete project structure (src, test, dist)
 * - Custom rule name specification
 * - Readme and .gitignore generation
 *
 * @example
 * ```bash
 * codeforge generate-plugin my-plugin
 * codeforge generate-plugin my-plugin --typescript
 * codeforge generate-plugin my-plugin --rule custom-rule
 * ```
 */
/* eslint-disable perfectionist/sort-classes */
/* eslint-disable perfectionist/sort-objects */
import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync, statSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { join, resolve } from 'node:path'

import {
  buildGitignoreContent,
  buildPackageJson,
  buildPluginFileContent,
  buildReadmeContent,
  buildRuleFileContent,
  buildRuleTestContent,
  buildTsConfig,
  getDirectoryPaths,
  isValidPluginName as isValidPluginNameHelper,
  toCamelCase as toCamelCaseHelper,
} from './generate-plugin-helpers.js'

export default class GeneratePlugin extends Command {
  static override description = 'Generate a new CodeForge plugin scaffold'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> my-plugin',
      description: 'Generate a plugin named "my-plugin"',
    },
    {
      command: '<%= config.bin %> <%= command.id %> my-plugin --typescript',
      description: 'Generate a TypeScript plugin',
    },
    {
      command: '<%= config.bin %> <%= command.id %> my-plugin --rule custom-rule',
      description: 'Generate plugin with a custom rule',
    },
  ]

  static override args = {
    name: Args.string({
      description: 'Plugin name (e.g., codeforge-plugin-custom)',
      required: true,
    }),
  }

  static override flags = {
    typescript: Flags.boolean({
      char: 't',
      default: true,
      description: 'Generate TypeScript plugin',
    }),
    rule: Flags.string({
      char: 'r',
      default: 'sample-rule',
      description: 'Name of the initial rule to create',
    }),
    output: Flags.string({
      char: 'o',
      default: '.',
      description: 'Output directory for the plugin',
    }),
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Overwrite existing plugin directory',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(GeneratePlugin)
    const pluginName = args.name as string
    const outputBase = flags.output.startsWith('/')
      ? flags.output
      : resolve(process.cwd(), flags.output)
    const outputDir = join(outputBase, pluginName)

    // Validate plugin name
    if (!isValidPluginNameHelper(pluginName)) {
      this.error(
        'Plugin name must be lowercase, alphanumeric with hyphens (e.g., codeforge-plugin-custom)',
      )
    }

    // Validate output base directory exists
    if (!existsSync(outputBase)) {
      this.error(`Output directory does not exist: ${outputBase}`)
    }

    if (!statSync(outputBase).isDirectory()) {
      this.error(`Output path is not a directory: ${outputBase}`)
    }

    // Check if plugin directory exists
    if (existsSync(outputDir) && !flags.force) {
      this.error(`Directory "${outputDir}" already exists. Use --force to overwrite.`)
    }

    this.log(chalk.blue(`\n🚀 Generating CodeForge plugin: ${chalk.bold(pluginName)}\n`))

    try {
      // Create directory structure
      this.log(chalk.dim('Creating directory structure...'))
      await Promise.all(getDirectoryPaths(outputDir).map((dir) => fs.mkdir(dir, { recursive: true })))

      this.log(chalk.dim('✓ Directory structure created'))

      // Generate files
      this.log(chalk.dim('Generating package.json...'))
      await fs.writeFile(
        join(outputDir, 'package.json'),
        JSON.stringify(buildPackageJson(pluginName), null, 2),
      )

      this.log(chalk.dim('Generating tsconfig.json...'))
      await fs.writeFile(join(outputDir, 'tsconfig.json'), JSON.stringify(buildTsConfig(), null, 2))

      this.log(chalk.dim('Generating plugin entry file...'))
      await fs.writeFile(
        join(outputDir, 'src', 'index.ts'),
        buildPluginFileContent(pluginName, flags.rule),
      )

      this.log(chalk.dim('Generating rule file...'))
      await fs.writeFile(
        join(outputDir, 'src', 'rules', `${flags.rule}.ts`),
        buildRuleFileContent(flags.rule),
      )

      this.log(chalk.dim('Generating rule tests...'))
      await fs.writeFile(
        join(outputDir, 'test', 'rules', `${flags.rule}.test.ts`),
        buildRuleTestContent(flags.rule),
      )

      this.log(chalk.dim('Generating README...'))
      await fs.writeFile(
        join(outputDir, 'README.md'),
        buildReadmeContent(pluginName, flags.rule),
      )

      this.log(chalk.dim('Generating .gitignore...'))
      await fs.writeFile(join(outputDir, '.gitignore'), buildGitignoreContent())

      this.log(chalk.green('\n✅ Plugin generated successfully!\n'))
      this.log(chalk.dim('Next steps:'))
      this.log(chalk.dim(`  cd ${pluginName}`))
      this.log(chalk.dim('  npm install'))
      this.log(chalk.dim('  npm test'))
      this.log(chalk.dim('\nThen add the plugin to your CodeForge config:'))
      this.log(chalk.dim(`  plugins: ["./${pluginName}"]`))
    } catch (error) {
      this.error(
        `Failed to generate plugin: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  isValidPluginName(name: string): boolean {
    return isValidPluginNameHelper(name)
  }

  toCamelCase(str: string): string {
    return toCamelCaseHelper(str)
  }
}
