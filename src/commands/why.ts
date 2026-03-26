import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getRule, getRuleCategory } from '../rules/index.js'

export default class Why extends Command {
  static override args = {
    ruleId: Args.string({
      description: 'Rule ID to explain',
      required: true,
    }),
  }

  static override description = 'Explain why a specific rule violation occurs and how to fix it'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> max-params',
      description: 'Explain the max-params rule',
    },
    {
      command: '<%= config.bin %> <%= command.id %> no-console',
      description: 'Explain the no-console rule',
    },
  ]

  static override flags = {
    violation: Flags.string({
      char: 'v',
      description: 'Specific violation message to explain',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Why)

    const ruleId = args.ruleId as string
    const rule = getRule(ruleId)
    const ruleMeta = rule?.meta

    if (!ruleMeta) {
      this.error(
        `Rule '${ruleId}' not found. Run '${this.config.bin} rules' to see available rules.`,
      )
    }

    this.log('')
    this.log(chalk.bold(`Rule: ${chalk.cyan(ruleId)}`))
    this.log(chalk.gray(`Category: ${getRuleCategory(ruleId)}`))
    this.log('')

    if (ruleMeta.description) {
      this.log(chalk.bold('Description:'))
      this.log(`  ${ruleMeta.description}`)
      this.log('')
    }

    this.log(chalk.bold('Common violations:'))
    this.showCommonViolations(ruleId)
    this.log('')

    this.log(chalk.bold('How to fix:'))
    this.showHowToFix(ruleId)
    this.log('')

    if (flags.violation) {
      this.log(chalk.bold('Your specific violation:'))
      this.log(`  "${flags.violation}"`)
      this.log('')
      this.analyzeViolation(ruleId, flags.violation)
    }

    this.log(chalk.bold('Best practices:'))
    this.showBestPractices(ruleId)
    this.log('')

    this.log(
      chalk.gray('Run ') +
        chalk.cyan(`${this.config.bin} explain ${ruleId}`) +
        chalk.gray(' for more details.'),
    )
  }

  private analyzeViolation(_ruleId: string, violation: string): void {
    const suggestions: string[] = []

    if (violation.includes('parameter')) {
      suggestions.push(
        'Consider grouping related parameters into an options object with descriptive property names', 'If some parameters are optional, use default values or overloading'
      )
    }

    if (violation.includes('nested') || violation.includes('depth')) {
      suggestions.push('Look for opportunities to return early and reduce nesting', 
        'Consider if the nested logic can be extracted to a well-named helper function',
      )
    }

    if (violation.includes('long') || violation.includes('line')) {
      suggestions.push(
        'Identify distinct responsibilities and extract to separate functions or modules', 'Look for repeated code that can be deduplicated'
      )
    }

    if (suggestions.length === 0) {
      suggestions.push('Review the rule documentation for specific guidance on this violation')
    }

    for (const suggestion of suggestions) {
      this.log(`  • ${suggestion}`)
    }
  }

  private showBestPractices(ruleId: string): void {
    const practices: Record<string, string[]> = {
      'max-depth': [
        'Prefer flat code: Shallow code is easier to understand and test',
        'Use guard clauses: Check preconditions early and return',
        'Name things well: Good names make code self-documenting',
      ],
      'max-lines': [
        'One file, one responsibility: Keep files focused and cohesive',
        'Testability matters: Smaller files are easier to test thoroughly',
        'Navigation ease: Developers can find code faster in smaller files',
      ],
      'max-params': [
        'Keep functions focused: Each function should do one thing well',
        'Use descriptive names: Parameter names should indicate their purpose',
        'Consider immutability: Use readonly or const where appropriate',
      ],
      'no-console': [
        'Production-ready logging: Use structured logging from the start',
        'Debugging tools: Use debug builds or flags instead of console',
        'Error handling: Let the caller decide how to handle errors',
      ],
    }

    const practiceList = practices[ruleId] || ['Follow general code quality guidelines']

    for (const practice of practiceList) {
      this.log(`  • ${practice}`)
    }
  }

  private showCommonViolations(ruleId: string): void {
    const commonViolations: Record<string, string[]> = {
      'max-depth': [
        'Nested if statements too deep - extract to helper functions',
        'Nested loops indicate complex logic - consider early returns',
        'Deep callback nesting - use async/await or named functions',
      ],
      'max-lines': [
        'File is too long - split into smaller modules',
        'Function is too long - extract helper functions',
        'Class is too long - consider separation of concerns',
      ],
      'max-params': [
        'Function has too many parameters - consider using an options object',
        'Constructor has too many parameters - consider builder pattern',
        'Method has many parameters for simple operations - split into smaller methods',
      ],
      'no-console': [
        'console.log used for debugging - remove or use proper logger',
        'console.error for error handling - throw errors or use error handling',
        'console.warn for warnings - use structured logging',
      ],
    }

    const violations = commonViolations[ruleId] || [
      'Various violations may occur depending on usage',
    ]

    for (const violation of violations) {
      this.log(`  • ${violation}`)
    }
  }

  private showHowToFix(ruleId: string): void {
    const fixes: Record<string, string[]> = {
      'max-depth': [
        'Extract to helper functions: Move nested logic to separate functions',
        'Use early returns: Return early to reduce nesting',
        'Use guard clauses: Check conditions upfront',
        'Apply polymorphism: Use inheritance or strategy pattern',
      ],
      'max-lines': [
        'Split into modules: One responsibility per file',
        'Extract utilities: Move shared code to utility functions',
        'Use composition: Combine smaller pieces instead of one large file',
        'Apply single responsibility: Each file does one thing well',
      ],
      'max-params': [
        'Use an options object: Pass related parameters as a single object',
        'Apply builder pattern: Construct complex objects step by step',
        'Use partial application: Create specialized versions of functions',
        'Split the function: Break into smaller, focused functions',
      ],
      'no-console': [
        'Use a logger: Replace console.* with structured logging',
        'Throw errors: Let callers handle error conditions',
        'Return result objects: Return success/failure instead of logging',
        'Use debugging tools: Use proper debug logging that can be disabled',
      ],
    }

    const fixList = fixes[ruleId] || ['Check the rule documentation for specific fixes']

    for (const fix of fixList) {
      this.log(`  • ${fix}`)
    }
  }
}
