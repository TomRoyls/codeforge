import { Args, Command } from '@oclif/core'
import chalk from 'chalk'

import { allRules, getRuleCategory } from '../rules/index.js'

interface RuleExample {
  bad: string
  description: string
  good: string
}

export default class Explain extends Command {
  static override args = {
    'rule-id': Args.string({
      description: 'The ID of the rule to explain',
      name: 'rule-id',
      required: true,
    }),
  }

  static override description = 'Explain a specific rule in detail'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> no-eval',
      description: 'Explain the no-eval rule',
    },
    {
      command: '<%= config.bin %> <%= command.id %> prefer-const',
      description: 'Explain the prefer-const rule',
    },
  ]

  async run(): Promise<void> {
    const { args } = await this.parse(Explain)
    const ruleId = args['rule-id']

    const rule = allRules[ruleId]

    if (!rule) {
      this.error(
        `Rule '${ruleId}' not found. Run '${this.config.bin} rules' to see available rules.`,
      )
    }

    const category = rule.meta.category ?? getRuleCategory(ruleId)

    this.displayHeader(ruleId, category)

    this.displayDescription(rule.meta)

    this.displaySeverity(rule.meta)

    this.displayFixable(rule.meta)

    this.displayMetadata(rule.meta)

    const examples = this.getExamples(ruleId)
    if (examples) {
      this.displayExamples(examples)
    }

    this.displayBestPractices(ruleId)

    this.displayRelatedRules(ruleId, category)

    this.displayUrl(rule.meta)
  }

  private displayBestPractices(ruleId: string): void {
    this.log(chalk.bold('Best Practices'))

    const practices = this.getBestPractices(ruleId)
    for (const practice of practices) {
      this.log(`• ${practice}`)
    }

    this.log('')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private displayDescription(meta: any): void {
    const description = meta.docs?.description ?? meta.description ?? 'No description available'

    this.log(chalk.bold('Description'))
    this.log(description)
    this.log('')
  }

  private displayExamples(examples: RuleExample[]): void {
    this.log(chalk.bold('Examples'))

    for (const example of examples) {
      this.log('')
      this.log(chalk.yellow(example.description))
      this.log('')

      this.log(chalk.red('❌ Bad'))
      this.log(chalk.gray(example.bad))
      this.log('')

      this.log(chalk.green('✅ Good'))
      this.log(chalk.gray(example.good))
      this.log('')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private displayFixable(meta: any): void {
    const fixable = meta.fixable ?? meta.docs?.fixable ?? false
    const fixableText = fixable ? chalk.green('Yes') : chalk.gray('No')

    this.log(chalk.bold('Auto-fixable'))
    this.log(fixableText)
    this.log('')
  }

  private displayHeader(ruleId: string, category: string): void {
    const title = chalk.bold.white(ruleId)
    const categoryBadge = chalk.cyan(`[${category}]`)

    this.log('')
    this.log(`${title} ${categoryBadge}`)
    this.log(chalk.gray('─'.repeat(ruleId.length + category.length + 3)))
    this.log('')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private displayMetadata(meta: any): void {
    const recommended = meta.docs?.recommended ?? meta.recommended ?? false
    const recommendedText = recommended ? chalk.cyan('Yes') : chalk.gray('No')

    this.log(chalk.bold('Recommended'))
    this.log(recommendedText)
    this.log('')
  }

  private displayRelatedRules(ruleId: string, category: string): void {
    const related = this.getRelatedRules(ruleId, category)

    if (related.length > 0) {
      this.log(chalk.bold('Related Rules'))
      for (const relatedRule of related) {
        this.log(`• ${chalk.cyan(relatedRule)}`)
      }

      this.log('')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private displaySeverity(meta: any): void {
    const severity = meta.severity ?? meta.docs?.severity ?? 'error'
    let severityText: string

    switch (severity) {
      case 'error': {
        severityText = chalk.red('Error')
        break
      }

      case 'info': {
        severityText = chalk.blue('Info')
        break
      }

      case 'warning': {
        severityText = chalk.yellow('Warning')
        break
      }

      default: {
        severityText = chalk.gray(severity)
      }
    }

    this.log(chalk.bold('Severity'))
    this.log(severityText)
    this.log('')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private displayUrl(meta: any): void {
    const url = meta.docs?.url

    if (url) {
      this.log(chalk.bold('Documentation'))
      this.log(chalk.underline(url))
      this.log('')
    }
  }

  private getBestPractices(ruleId: string): string[] {
    const bestPracticesMap: Record<string, string[]> = {
      'no-console-log': [
        'Use a proper logging library (e.g., winston, pino) for structured logging',
        'Configure log levels based on environment (development vs production)',
        'Remove or disable console statements before deploying to production',
        'Use debuggers or testing tools during development instead of console',
      ],
      'no-duplicate-imports': [
        'Combine all imports from the same module into a single import statement',
        'Use named imports (import { a, b } from "./mod") instead of multiple imports',
        'Organize imports consistently across the codebase',
        'Consider using auto-fix tools to consolidate duplicate imports',
      ],
      'no-eval': [
        'Use proper JavaScript functions instead of dynamic code execution',
        'Avoid passing user input to eval() or Function()',
        'Use JSON.parse() for parsing JSON data',
        'Use object property access instead of dynamic evaluation',
      ],
      'no-unused-vars': [
        'Remove unused imports and variables to keep code clean',
        'Use tools like ESLint auto-fix to remove unused code',
        'Consider using prefix underscore for intentionally unused parameters',
        'Review unused code to ensure it was meant to be kept',
      ],
      'prefer-const': [
        'Use const by default for variables that are not reassigned',
        'Only use let when you need to reassign a variable',
        'Consider using const for array/object references even if you modify their contents',
        'Use const with arrow functions for cleaner callbacks',
      ],
    }

    return (
      bestPracticesMap[ruleId] ?? [
        'Follow the rule consistently throughout your codebase',
        'Enable auto-fix when available to automatically correct violations',
        'Review violations to understand the underlying issues',
        'Consider the rule in the context of your specific use case',
      ]
    )
  }

  private getExamples(ruleId: string): null | RuleExample[] {
    const examplesMap: Record<string, RuleExample[]> = {
      'no-console-log': [
        {
          bad: 'function calculate() {\n  console.log("Calculating...");\n  return 42;\n}',
          description: 'Using console.log in production code',
          good: 'function calculate() {\n  // Use proper logging library\n  logger.info("Calculating...");\n  return 42;\n}',
        },
      ],
      'no-duplicate-imports': [
        {
          bad: 'import { add } from "./math";\nimport { subtract } from "./math";',
          description: 'Importing the same module multiple times',
          good: 'import { add, subtract } from "./math";',
        },
      ],
      'no-eval': [
        {
          bad: 'const code = "return 1 + 1";\nconst result = eval(code);',
          description: 'Using eval() to execute code strings',
          good: 'const result = 1 + 1;',
        },
        {
          bad: 'const sum = new Function("a", "b", "return a + b");',
          description: 'Using Function() constructor',
          good: 'function sum(a: number, b: number) {\n  return a + b;\n}',
        },
      ],
      'no-unused-vars': [
        {
          bad: 'function process(data: string) {\n  const result = data.toUpperCase();\n  // result is never used\n}',
          description: 'Declaring variables that are never used',
          good: 'function process(data: string) {\n  return data.toUpperCase();\n}',
        },
      ],
      'prefer-const': [
        {
          bad: 'let name = "Alice";\nconsole.log(name);',
          description: 'Using let for variables that are never reassigned',
          good: 'const name = "Alice";\nconsole.log(name);',
        },
        {
          bad: 'let count = 0;\nfor (let i = 0; i < 10; i++) {\n  count++;\n}',
          description: 'Using let for variables that are reassigned',
          good: 'const count = Array.from({ length: 10 }, (_, i) => i + 1).length;',
        },
      ],
    }

    return examplesMap[ruleId] ?? null
  }

  private getRelatedRules(ruleId: string, category: string): string[] {
    const relatedRulesMap: Record<string, string[]> = {
      'no-console-log': ['no-debugger', 'no-alert'],
      'no-duplicate-imports': ['no-unused-vars', 'consistent-imports'],
      'no-eval': ['no-implied-eval', 'no-new-func', 'no-script-url'],
      'no-unused-vars': ['no-duplicate-imports', 'no-unused-exports'],
      'prefer-const': ['no-var', 'no-const-assign'],
    }

    const categoryRules = Object.entries(allRules)
      .filter(([id, rule]) => {
        const ruleCategory = rule.meta.category ?? getRuleCategory(id)
        return ruleCategory === category && id !== ruleId
      })
      .map(([id]) => id)
      .slice(0, 5)

    return relatedRulesMap[ruleId] ?? categoryRules
  }
}
