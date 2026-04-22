import type { RuleDefinition } from '../rules/types.js'

export interface RuleDoc {
  category: string
  deprecated: boolean
  description: string
  fixable: boolean
  name: string
  recommended: boolean
}

export function generateRuleDoc(
  ruleId: string,
  ruleDef: RuleDefinition,
  getRuleCategoryFn: (ruleId: string) => string,
): RuleDoc {
  const { meta } = ruleDef
  return {
    category: meta.category ?? getRuleCategoryFn(ruleId),
    deprecated: meta.deprecated ?? false,
    description: meta.description,
    fixable: Boolean(ruleDef.fix || meta.fixable),
    name: ruleId,
    recommended: meta.recommended ?? false,
  }
}

export function generateRuleMarkdown(rule: RuleDoc): string {
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

export function getBadges(rule: RuleDoc): string {
  const badges: string[] = []
  if (rule.recommended) badges.push(' `recommended`')
  if (rule.fixable) badges.push(' `fixable`')
  if (rule.deprecated) badges.push(' `deprecated`')
  return badges.join('')
}

export function groupByCategory(rules: RuleDoc[]): Record<string, RuleDoc[]> {
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

export function generateIndexContent(rules: RuleDoc[]): string {
  const categories = groupByCategory(rules)
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
      const badges = getBadges(rule)
      content += `- [${rule.name}](./${rule.name}.md)${badges} - ${rule.description}\n`
    }

    content += '\n'
  }

  return content
}

export function generateSingleFileContent(rules: RuleDoc[]): string {
  const categories = groupByCategory(rules)

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
      content += generateRuleMarkdown(rule)
      content += '\n---\n\n'
    }
  }

  return content
}

export function buildRuleDocsFromLoaded(
  loadedRules: Record<string, RuleDefinition>,
  getRuleCategoryFn: (ruleId: string) => string,
): RuleDoc[] {
  const rules: RuleDoc[] = []

  for (const [ruleId, ruleDef] of Object.entries(loadedRules)) {
    rules.push(generateRuleDoc(ruleId, ruleDef, getRuleCategoryFn))
  }

  return rules.sort((a, b) => a.name.localeCompare(b.name))
}
