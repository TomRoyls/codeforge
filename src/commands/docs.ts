import { Command, Flags } from '@oclif/core'
import * as fs from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { allRules, getRuleCategory } from '../rules/index.js'

interface RuleDoc {
  category: string
  deprecated: boolean
  description: string
  fixable: boolean
  name: string
  recommended: boolean
}

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
      options: ['complexity', 'dependencies', 'performance', 'security', 'patterns'],
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

    const rules = this.getRules()

    const filteredRules = flags.category
      ? rules.filter((r) => r.category === flags.category)
      : rules

    if (filteredRules.length === 0) {
      this.log('No rules found matching the criteria')
      return
    }

    const outputDir = resolve(flags.output)

    await fs.mkdir(outputDir, { recursive: true })

    if (flags.single) {
      await this.generateSingleFile(filteredRules, outputDir)
    } else {
      await this.generatePerRuleFiles(filteredRules, outputDir)
      await this.generateIndexFile(filteredRules, outputDir)
    }

    this.log(`Generated documentation for ${filteredRules.length} rules in ${outputDir}`)
  }

  private async generateIndexFile(rules: RuleDoc[], outputDir: string): Promise<void> {
    const categories = this.groupByCategory(rules)
    let content = '# CodeForge Rules Documentation\n\n'
    content += `This document contains documentation for all ${rules.length} available rules.\n\n`
    content += '## Overview\n\n'
    content += '| Category | Rules | Fixable |\n'
    content += '|----------|-------|--------|\n'

    for (const [category, categoryRules] of Object.entries(categories)) {
      const fixable = categoryRules.filter((r) => r.fixable).length
      content += `| ${category} | ${categoryRules.length} | ${fixable} |\n`
    }

    content += '\n## Rules by Category\n\n'

    for (const [category, categoryRules] of Object.entries(categories)) {
      content += `### ${category}\n\n`
      for (const rule of categoryRules) {
        const badges = this.getBadges(rule)
        content += `- [${rule.name}](./${rule.name}.md)${badges} - ${rule.description}\n`
      }

      content += '\n'
    }

    await fs.writeFile(join(outputDir, 'README.md'), content)
  }

  private async generatePerRuleFiles(rules: RuleDoc[], outputDir: string): Promise<void> {
    await Promise.all(
      rules.map(async (rule) => {
        const content = this.generateRuleMarkdown(rule)
        await fs.writeFile(join(outputDir, `${rule.name}.md`), content)
      }),
    )
  }

  private generateRuleDoc(ruleId: string, ruleDef: (typeof allRules)[string]): RuleDoc {
    const { meta } = ruleDef
    return {
      category: meta.category ?? getRuleCategory(ruleId),
      deprecated: meta.deprecated ?? false,
      description: meta.description,
      fixable: Boolean(ruleDef.fix || meta.fixable),
      name: ruleId,
      recommended: meta.recommended ?? false,
    }
  }

  private generateRuleMarkdown(rule: RuleDoc): string {
    const badges: string[] = []
    if (rule.recommended) {
      badges.push('![Recommended](https://img.shields.io/badge/-recommended-blue)')
    }

    if (rule.fixable) {
      badges.push('![Fixable](https://img.shields.io/badge/-fixable-green)')
    }

    if (rule.deprecated) {
      badges.push('![Deprecated](https://img.shields.io/badge/-deprecated-red)')
    }

    const badgesSection = badges.length > 0 ? badges.join(' ') + '\n\n' : ''
    const fixableNote = rule.fixable
      ? `This rule is auto-fixable. Run \`codeforge fix --rules ${rule.name}\` to apply fixes.\n`
      : ''

    const jsonExample = `{
  "rules": {
    "${rule.name}": "error"
  }
}`

    return `# ${rule.name}

${badgesSection}| Property | Value |
|----------|-------|
| Category | ${rule.category} |
| Fixable | ${rule.fixable ? 'Yes' : 'No'} |
| Recommended | ${rule.recommended ? 'Yes' : 'No'} |
| Deprecated | ${rule.deprecated ? 'Yes' : 'No'} |

## Description

${rule.description}

## How to Use

Enable this rule in your configuration:

\`\`\`json
${jsonExample}
\`\`\`

${fixableNote}`
  }

  private async generateSingleFile(rules: RuleDoc[], outputDir: string): Promise<void> {
    const categories = this.groupByCategory(rules)

    let content = '# CodeForge Rules Documentation\n\n'
    content += `This document contains documentation for all ${rules.length} available rules.\n\n`
    content += '## Table of Contents\n\n'

    for (const category of Object.keys(categories)) {
      content += `- [${category}](#${category.toLowerCase()})\n`
    }

    content += '\n---\n\n'

    for (const [category, categoryRules] of Object.entries(categories)) {
      content += `## ${category}\n\n`
      for (const rule of categoryRules) {
        content += this.generateRuleMarkdown(rule)
        content += '\n---\n\n'
      }
    }

    await fs.writeFile(join(outputDir, 'RULES.md'), content)
  }

  private getBadges(rule: RuleDoc): string {
    const badges: string[] = []
    if (rule.recommended) badges.push(' `recommended`')
    if (rule.fixable) badges.push(' `fixable`')
    if (rule.deprecated) badges.push(' `deprecated`')
    return badges.join('')
  }

  private getRules(): RuleDoc[] {
    const rules: RuleDoc[] = []

    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      rules.push(this.generateRuleDoc(ruleId, ruleDef))
    }

    return rules.sort((a, b) => a.name.localeCompare(b.name))
  }

  private groupByCategory(rules: RuleDoc[]): Record<string, RuleDoc[]> {
    const groups: Record<string, RuleDoc[]> = {}

    for (const rule of rules) {
      const group = groups[rule.category]
      if (group) {
        group.push(rule)
      } else {
        groups[rule.category] = [rule]
      }
    }

    for (const category of Object.keys(groups)) {
      const group = groups[category]
      if (group) {
        groups[category] = group.sort((a, b) => a.name.localeCompare(b.name))
      }
    }

    return groups
  }
}
