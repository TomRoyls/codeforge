/**
 * CreateRule command - generates a new CodeForge lint rule scaffold.
 *
 * Creates a rule file and test file following CodeForge conventions
 * with proper TypeScript types and visitor patterns.
 *
 * Features:
 * - Rule file generation with proper structure
 * - Test file generation with basic tests
 * - Category validation
 * - TypeScript-specific AST helpers option
 * - Auto-fixable flag support
 *
 * @example
 * ```bash
 * codeforge create-rule no-foo-bar --category patterns
 * codeforge create-rule max-depth --category complexity --severity error
 * codeforge create-rule no-eval --category security --fixable
 * ```
 */
/* eslint-disable perfectionist/sort-classes */
import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import {
  buildDefaultDescription,
  buildRuleContent,
  buildTestContent,
  isValidCategory as helperIsValidCategory,
  isValidRuleName as helperIsValidRuleName,
  VALID_CATEGORIES,
  VALID_SEVERITIES,
  type ValidCategory,
  type ValidSeverity,
} from './create-rule-helpers.js'

export default class CreateRule extends Command {
  static override description = 'Generate a new CodeForge lint rule scaffold'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> no-foo-bar --category patterns',
      description: 'Create a patterns rule named "no-foo-bar"',
    },
    {
      command:
        '<%= config.bin %> <%= command.id %> max-depth --category complexity --severity error',
      description: 'Create a complexity rule with error severity',
    },
    {
      command: '<%= config.bin %> <%= command.id %> no-eval --category security --fixable',
      description: 'Create an auto-fixable security rule',
    },
    {
      command:
        '<%= config.bin %> <%= command.id %> prefer-const --category best-practices --typescript',
      description: 'Create a rule with TypeScript-specific AST helpers',
    },
  ]

  static override args = {
    name: Args.string({
      description: 'Rule name in kebab-case (e.g., no-foo-bar)',
      required: true,
    }),
  }

  static override flags = {
    category: Flags.string({
      char: 'c',
      description: 'Rule category',
      options: [...VALID_CATEGORIES],
      required: true,
    }),
    description: Flags.string({
      char: 'd',
      description: 'Rule description',
    }),
    fixable: Flags.boolean({
      default: false,
      description: 'Whether the rule is auto-fixable',
    }),
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Overwrite existing files',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output directory for the rule file',
    }),
    severity: Flags.string({
      default: 'warning',
      description: 'Default severity level',
      options: [...VALID_SEVERITIES],
    }),
    typescript: Flags.boolean({
      default: false,
      description: 'Generate with TypeScript-specific AST helpers',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CreateRule)
    const ruleName = args.name as string
    const category = flags.category as ValidCategory
    const severity = flags.severity as ValidSeverity
    const description = flags.description ?? buildDefaultDescription(ruleName)
    const { fixable } = flags

    // Determine output directories
    const projectRoot = resolve(process.cwd())
    const ruleOutputDir = flags.output ?? join(projectRoot, 'src', 'rules', category)
    const testOutputDir = join(projectRoot, 'test', 'unit', 'rules', category)

    // Validate rule name
    if (!helperIsValidRuleName(ruleName)) {
      this.error(
        'Rule name must be lowercase, start with a letter, and contain only alphanumeric characters and hyphens (e.g., no-foo-bar)',
      )
    }

    // Validate category
    if (!helperIsValidCategory(category)) {
      this.error(`Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`)
    }

    // Validate severity
    if (!VALID_SEVERITIES.includes(severity)) {
      this.error(`Invalid severity "${severity}". Must be one of: ${VALID_SEVERITIES.join(', ')}`)
    }

    // Determine file paths
    const ruleFilePath = join(ruleOutputDir, `${ruleName}.ts`)
    const testFilePath = join(testOutputDir, `${ruleName}.test.ts`)

    // Check if files exist
    if (!flags.force) {
      if (existsSync(ruleFilePath)) {
        this.error(`Rule file "${ruleFilePath}" already exists. Use --force to overwrite.`)
      }

      if (existsSync(testFilePath)) {
        this.error(`Test file "${testFilePath}" already exists. Use --force to overwrite.`)
      }
    }

    this.log(chalk.blue(`\n🚀 Creating CodeForge rule: ${chalk.bold(ruleName)}\n`))

    try {
      // Create directories if needed
      this.log(chalk.dim('Creating directory structure...'))
      if (!existsSync(ruleOutputDir)) {
        mkdirSync(ruleOutputDir, { recursive: true })
      }

      if (!existsSync(testOutputDir)) {
        mkdirSync(testOutputDir, { recursive: true })
      }

      this.log(chalk.dim('✓ Directory structure created'))

      // Generate rule file
      this.log(chalk.dim('Generating rule file...'))
      const ruleContent = buildRuleContent({
        category,
        description,
        fixable,
        ruleName,
        severity,
        typescript: flags.typescript,
      })
      writeFileSync(ruleFilePath, ruleContent)
      this.log(chalk.dim('✓ Rule file created'))

      // Generate test file
      this.log(chalk.dim('Generating test file...'))
      const testContent = buildTestContent(ruleName, category)
      writeFileSync(testFilePath, testContent)
      this.log(chalk.dim('✓ Test file created'))

      this.log(chalk.green('\n✅ Rule created successfully!\n'))
      this.log(chalk.dim('  Rule file:'), `src/rules/${category}/${ruleName}.ts`)
      this.log(chalk.dim('  Test file:'), `test/unit/rules/${category}/${ruleName}.test.ts`)
      this.log('')
      this.log(chalk.dim('Next steps:'))
      this.log(chalk.dim('  1. Implement the visitor logic in the rule file'))
      this.log(
        chalk.dim(`  2. Run tests: npx vitest run test/unit/rules/${category}/${ruleName}.test.ts`),
      )
      this.log(chalk.dim('  3. Register in src/rules/index.ts if needed'))
    } catch (error) {
      this.error(`Failed to create rule: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // @ts-expect-error used by tests via type assertion
  private isValidRuleName(name: string): boolean {
    return helperIsValidRuleName(name)
  }

  // @ts-expect-error used by tests via type assertion
  private isValidCategory(category: string): boolean {
    return helperIsValidCategory(category)
  }
}
