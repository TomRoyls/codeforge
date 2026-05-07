/**
 * Docs command - generates markdown documentation for all rules.
 *
 * Creates comprehensive markdown documentation for CodeForge rules, with options
 * to filter by category and output to a custom directory.
 *
 * Features:
 * - Per-rule documentation with examples
 * - Category-based filtering
 * - Badge generation (recommended, fixable, deprecated)
 * - Index and TOC generation
 * - Single-file or multi-file output modes
 *
 * @example
 * ```bash
 * codeforge docs
 * codeforge docs --category complexity
 * codeforge docs --single
 * ```
 */
import { Command, Flags } from '@oclif/core'
import * as fs from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { getRuleCategory } from '../rules/categories.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'

import {
  buildRuleDocsFromLoaded,
  type RuleDoc,
  generateIndexContent,
  generateRuleMarkdown as generateRuleMarkdownHelper,
  generateSingleFileContent,
  getBadges as getBadgesHelper,
  groupByCategory as groupByCategoryHelper,
} from './docs-helpers.js'

export default class Docs extends Command {
  static override description = 'Generate markdown documentation for all rules'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Generate docs to ./docs/rules',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --output ./documentation',
      description: 'Generate docs to custom directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --category complexity',
      description: 'Generate docs only for complexity rules',
    },
  ]

  static override flags = {
    category: Flags.string({
      char: 'c',
      description: 'Filter rules by category',
      options: [
        'complexity',
        'correctness',
        'dependencies',
        'patterns',
        'performance',
        'security',
        'style',
        'testing',
      ],
    }),
    output: Flags.string({
      char: 'o',
      default: 'docs/rules',
      description: 'Output directory for generated documentation',
    }),
    single: Flags.boolean({
      default: false,
      description: 'Generate a single combined file instead of per-rule files',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Docs)

    const rules = await this.getRules()

    const filteredRules = flags.category
      ? rules.filter((r) => r.category === flags.category)
      : rules

    if (filteredRules.length === 0) {
      this.log('No rules found matching the criteria')
      return
    }

    const outputDir = resolve(flags.output)

    try {
      await fs.mkdir(outputDir, { recursive: true })
    } catch (mkdirError) {
      this.error(
        `Failed to create output directory ${outputDir}: ${mkdirError instanceof Error ? mkdirError.message : String(mkdirError)}`,
      )
    }

    if (flags.single) {
      await this.generateSingleFile(filteredRules, outputDir)
    } else {
      await this.generatePerRuleFiles(filteredRules, outputDir)
      await this.generateIndexFile(filteredRules, outputDir)
    }

    this.log(`Generated documentation for ${filteredRules.length} rules in ${outputDir}`)
  }

  private async generateIndexFile(rules: RuleDoc[], outputDir: string): Promise<void> {
    const content = generateIndexContent(rules)
    try {
      await fs.writeFile(join(outputDir, 'README.md'), content)
    } catch (writeError) {
      this.warn(
        `Failed to write index file: ${writeError instanceof Error ? writeError.message : String(writeError)}`,
      )
    }
  }

  private async generatePerRuleFiles(rules: RuleDoc[], outputDir: string): Promise<void> {
    await Promise.all(
      rules.map(async (rule) => {
        const content = this.generateRuleMarkdown(rule)
        try {
          await fs.writeFile(join(outputDir, `${rule.name}.md`), content)
        } catch (writeError) {
          this.warn(
            `Failed to write doc for rule ${rule.name}: ${writeError instanceof Error ? writeError.message : String(writeError)}`,
          )
        }
      }),
    )
  }

  private async generateSingleFile(rules: RuleDoc[], outputDir: string): Promise<void> {
    const content = generateSingleFileContent(rules)
    try {
      await fs.writeFile(join(outputDir, 'RULES.md'), content)
    } catch (writeError) {
      this.error(
        `Failed to write combined rules doc: ${writeError instanceof Error ? writeError.message : String(writeError)}`,
      )
    }
  }

  generateRuleMarkdown(rule: RuleDoc): string {
    return generateRuleMarkdownHelper(rule)
  }

  getBadges(rule: RuleDoc): string {
    return getBadgesHelper(rule)
  }

  groupByCategory(rules: RuleDoc[]): Record<string, RuleDoc[]> {
    return groupByCategoryHelper(rules)
  }

  private async getRules(): Promise<RuleDoc[]> {
    const allRules = await lazyRuleLoader.loadAllRules()
    return buildRuleDocsFromLoaded(allRules, getRuleCategory)
  }
}
