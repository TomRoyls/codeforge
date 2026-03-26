import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import { createInterface } from 'node:readline'

import { type RuleViolation } from '../ast/visitor.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { allRules, getRuleCategory } from '../rules/index.js'
import {
  MAX_FILES_TO_PROCESS,
  SEVERITY_ERROR,
  SEVERITY_INFO,
  SEVERITY_WARNING,
  TABLE_DASH_SEPARATOR_WIDTH,
} from '../utils/constants.js'

interface FixResult {
  applied: number
  skipped: number
  total: number
}

export default class Interactive extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Interactively review and fix violations'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Start interactive fix mode for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Start interactive fix mode for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --severity error',
      description: 'Only review error-level violations',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --auto-safe',
      description: 'Automatically apply safe fixes, ask for others',
    },
  ]

  static override flags = {
    'auto-safe': Flags.boolean({
      default: false,
      description: 'Automatically apply safe fixes without prompting',
    }),
    severity: Flags.string({
      default: 'warning',
      description: 'Minimum severity level to review',
      options: ['error', 'warning', 'info'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed violation information',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Interactive)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const violations = await this.collectViolations(targetPath)
    const filtered = this.filterBySeverity(
      violations,
      flags.severity as 'error' | 'info' | 'warning',
    )

    if (filtered.length === 0) {
      this.log(chalk.green('No violations found!'))
      return
    }

    this.log('')
    this.log(chalk.bold(`  Found ${filtered.length} violations to review`))
    this.log(chalk.gray('  Press Enter to review each violation, q to quit'))
    this.log('')

    const result = await this.reviewViolations(filtered, flags['auto-safe'], flags.verbose)

    this.log('')
    this.log(chalk.bold('  Summary:'))
    this.log(`    Applied: ${chalk.green(result.applied.toString())}`)
    this.log(`    Skipped: ${chalk.yellow(result.skipped.toString())}`)
    this.log(`    Total:   ${result.total}`)
    this.log('')
  }

  private async applyFix(filePath: string, violation: RuleViolation): Promise<boolean> {
    if (!violation.suggestion) {
      return false
    }

    try {
      const content = await fs.readFile(filePath, 'utf8')
      const lines = content.split('\n')
      const lineIndex = violation.range.start.line - 1

      if (lineIndex < 0 || lineIndex >= lines.length) {
        return false
      }

      const originalLine = lines[lineIndex]
      if (originalLine === undefined) {
        return false
      }

      lines[lineIndex] = violation.suggestion
      await fs.writeFile(filePath, lines.join('\n'), 'utf8')
      return true
    } catch {
      return false
    }
  }

  private async collectViolations(targetPath: string): Promise<RuleViolation[]> {
    const files = await discoverFiles({
      cwd: targetPath,
      ignore: ['node_modules', 'dist', 'coverage', '.git'],
      patterns: [],
    })

    const parser = new Parser()
    await parser.initialize()

    const registry = new RuleRegistry()
    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
    }

    const allViolations: RuleViolation[] = []
    const filesToProcess = files.slice(0, MAX_FILES_TO_PROCESS)

    const parseResults = await Promise.all(
      filesToProcess.map(async (file) => {
        try {
          return {
            filePath: file.path,
            parseResult: await parser.parseFile(file.absolutePath),
          }
        } catch {
          return null
        }
      }),
    )

    for (const result of parseResults) {
      if (!result) continue

      const violations = registry.runRules(result.parseResult.sourceFile)
      allViolations.push(
        ...violations.map((v) => ({
          ...v,
          filePath: result.filePath,
        })),
      )
    }

    parser.dispose()
    return allViolations
  }

  private displayViolation(
    violation: RuleViolation,
    index: number,
    total: number,
    verbose: boolean,
  ): void {
    this.log('')
    this.log(chalk.bold(`  Violation ${index + 1}/${total}`))
    this.log(chalk.gray('  ' + '─'.repeat(TABLE_DASH_SEPARATOR_WIDTH)))
    this.log(`  ${chalk.red('File:')} ${violation.filePath}:${violation.range.start.line}`)
    this.log(`  ${chalk.red('Rule:')} ${violation.ruleId}`)
    this.log(`  ${chalk.red('Severity:')} ${this.formatSeverity(violation.severity)}`)
    this.log(`  ${chalk.red('Message:')} ${violation.message}`)

    if (verbose && violation.suggestion) {
      this.log(`  ${chalk.green('Suggestion:')} ${violation.suggestion}`)
    }

    this.log('')
  }

  private filterBySeverity(
    violations: RuleViolation[],
    minSeverity: 'error' | 'info' | 'warning',
  ): RuleViolation[] {
    const severityOrder = { error: SEVERITY_ERROR, info: SEVERITY_INFO, warning: SEVERITY_WARNING }

    return violations.filter((v) => severityOrder[v.severity] >= severityOrder[minSeverity])
  }

  private formatSeverity(severity: 'error' | 'info' | 'warning'): string {
    switch (severity) {
      case 'error': {
        return chalk.red('error')
      }

      case 'info': {
        return chalk.blue('info')
      }

      case 'warning': {
        return chalk.yellow('warning')
      }
    }
  }

  private async processViolation(
    violations: RuleViolation[],
    index: number,
    result: FixResult,
    options: { autoSafe: boolean; verbose: boolean },
  ): Promise<FixResult> {
    if (index >= violations.length) {
      return result
    }

    const violation = violations[index]
    if (!violation) {
      return this.processViolation(violations, index + 1, result, options)
    }

    this.displayViolation(violation, index, violations.length, options.verbose)

    const hasFix = Boolean(violation.suggestion)

    if (options.autoSafe && hasFix) {
      const success = await this.applyFix(violation.filePath, violation)
      if (success) {
        this.log(chalk.green('  ✓ Fix applied automatically'))
        result.applied++
      } else {
        this.log(chalk.yellow('  ⚠ Could not apply fix'))
        result.skipped++
      }

      return this.processViolation(violations, index + 1, result, options)
    }

    const promptOptions = hasFix ? '[Y]es / [n]o / [s]kip / [q]uit' : '[s]kip / [q]uit'
    const answer = await this.promptUser(`  Apply fix? ${promptOptions}: `)

    if (answer === 'q' || answer === 'quit') {
      result.skipped += violations.length - index
      return result
    }

    if (answer === 's' || answer === 'skip' || (!hasFix && answer === '')) {
      this.log(chalk.gray('  → Skipped'))
      result.skipped++
      return this.processViolation(violations, index + 1, result, options)
    }

    if (hasFix && (answer === 'y' || answer === 'yes' || answer === '')) {
      const success = await this.applyFix(violation.filePath, violation)
      if (success) {
        this.log(chalk.green('  ✓ Fix applied'))
        result.applied++
      } else {
        this.log(chalk.red('  ✗ Could not apply fix'))
        result.skipped++
      }
    } else {
      this.log(chalk.gray('  → Skipped'))
      result.skipped++
    }

    return this.processViolation(violations, index + 1, result, options)
  }

  private async promptUser(prompt: string): Promise<string> {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        rl.close()
        resolve(answer.trim().toLowerCase())
      })
    })
  }

  private async reviewViolations(
    violations: RuleViolation[],
    autoSafe: boolean,
    verbose: boolean,
  ): Promise<FixResult> {
    const result = await this.processViolation(
      violations,
      0,
      { applied: 0, skipped: 0, total: violations.length },
      { autoSafe, verbose },
    )
    return result
  }
}
