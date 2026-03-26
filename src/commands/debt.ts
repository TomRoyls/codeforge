import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { type RuleViolation } from '../ast/visitor.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { allRules, getRuleCategory } from '../rules/index.js'
import {
  DATE_FIELD_WIDTH,
  DEBT_COMPLEXITY_THRESHOLD_HIGH,
  DEBT_COST_PER_POINT_MINUTES,
  DEBT_DEPENDENCIES_THRESHOLD_HIGH,
  DEBT_OVERALL_THRESHOLD_HIGH,
  DEBT_SECURITY_THRESHOLD_HIGH,
  DEBT_WEIGHT_COMPLEXITY,
  DEBT_WEIGHT_DEPENDENCIES,
  DEBT_WEIGHT_DOCUMENTATION,
  DEBT_WEIGHT_PATTERNS,
  DEBT_WEIGHT_SECURITY,
  MAX_DEBT_HISTORY_ENTRIES,
  MAX_FILES_TO_PROCESS,
  MAX_RECOMMENDATIONS,
  TABLE_DASH_SEPARATOR_WIDTH,
} from '../utils/constants.js'

interface DebtBreakdown {
  complexity: number
  dependencies: number
  documentation: number
  patterns: number
  security: number
}

interface DebtHistoryEntry {
  breakdown: DebtBreakdown
  filesAnalyzed: number
  overall: number
  timestamp: string
}

interface DebtReport {
  breakdown: DebtBreakdown
  filesAnalyzed: number
  interest: {
    annual: number
    monthly: number
    weekly: number
  }
  overall: number
  path: string
  trend: {
    change: number
    direction: 'decreasing' | 'increasing' | 'stable'
    previous: null | number
  }
}

const WEEKS_PER_YEAR = 52

export default class Debt extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Track and analyze technical debt in your codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show technical debt analysis for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Show debt analysis for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --json',
      description: 'Output debt analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --history',
      description: 'Show debt trend history',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --save',
      description: 'Save current debt snapshot for trend tracking',
    },
  ]

  static override flags = {
    history: Flags.boolean({
      default: false,
      description: 'Show debt trend history',
    }),
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
    save: Flags.boolean({
      default: false,
      description: 'Save debt snapshot for trend tracking',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Debt)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    if (flags.history) {
      await this.showHistory(targetPath)
      return
    }

    const report = await this.analyzeDebt(targetPath)

    if (flags.save) {
      await this.saveHistory(targetPath, report)
      this.log(chalk.green('✓ Debt snapshot saved'))
      this.log('')
    }

    if (flags.json) {
      this.log(JSON.stringify(report, null, 2))
    } else {
      this.displayReport(report, flags.verbose)
    }
  }

  private async analyzeDebt(targetPath: string): Promise<DebtReport> {
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

    const breakdown = this.calculateBreakdown(allViolations)
    const overall = this.calculateOverall(breakdown, filesToProcess.length)
    const interest = this.calculateInterest(overall)
    const trend = await this.getTrend(targetPath, overall)

    return {
      breakdown,
      filesAnalyzed: filesToProcess.length,
      interest,
      overall,
      path: targetPath,
      trend,
    }
  }

  private calculateBreakdown(violations: RuleViolation[]): DebtBreakdown {
    const weights = {
      complexity: DEBT_WEIGHT_COMPLEXITY,
      dependencies: DEBT_WEIGHT_DEPENDENCIES,
      documentation: DEBT_WEIGHT_DOCUMENTATION,
      patterns: DEBT_WEIGHT_PATTERNS,
      security: DEBT_WEIGHT_SECURITY,
    }

    const counts = {
      complexity: 0,
      dependencies: 0,
      documentation: 0,
      patterns: 0,
      security: 0,
    }

    for (const v of violations) {
      const category = getRuleCategory(v.ruleId)
      if (category in counts) {
        counts[category as keyof typeof counts]++
      }
    }

    const undocumented = violations.filter(
      (v) => v.ruleId.includes('documentation') || v.ruleId.includes('jsdoc'),
    ).length

    return {
      complexity: counts.complexity * weights.complexity,
      dependencies: counts.dependencies * weights.dependencies,
      documentation: counts.documentation * weights.documentation + undocumented,
      patterns: counts.patterns * weights.patterns,
      security: counts.security * weights.security,
    }
  }

  private calculateInterest(debtPoints: number): DebtReport['interest'] {
    const hoursPerPoint = DEBT_COST_PER_POINT_MINUTES / 60
    const weeklyHours = debtPoints * hoursPerPoint

    return {
      annual: Math.round(weeklyHours * WEEKS_PER_YEAR),
      monthly: Math.round(weeklyHours * 4),
      weekly: Math.round(weeklyHours),
    }
  }

  private calculateOverall(breakdown: DebtBreakdown, filesCount: number): number {
    const total =
      breakdown.complexity +
      breakdown.dependencies +
      breakdown.documentation +
      breakdown.patterns +
      breakdown.security

    const normalizedFiles = Math.max(filesCount, 1)

    return Math.round(total / normalizedFiles)
  }

  private displayReport(report: DebtReport, verbose: boolean): void {
    const colorFn = this.getDebtColor(report.overall)

    this.log('')
    this.log(chalk.bold('  Technical Debt Analysis'))
    this.log('')

    this.log(`  ${colorFn(`  Debt Score: ${report.overall}`)}`)

    if (report.trend.previous !== null) {
      const trendIcon =
        report.trend.direction === 'decreasing'
          ? '↓'
          : report.trend.direction === 'increasing'
            ? '↑'
            : '→'
      const trendColor =
        report.trend.direction === 'decreasing'
          ? chalk.green
          : report.trend.direction === 'increasing'
            ? chalk.red
            : chalk.yellow

      this.log(
        `  ${trendColor(`Trend: ${trendIcon} ${report.trend.change > 0 ? '+' : ''}${report.trend.change}`)}`,
      )
    }

    this.log('')

    if (verbose) {
      this.log(chalk.gray('  Category Breakdown:'))
      this.log(`    Complexity:     ${this.formatDebt(report.breakdown.complexity)}`)
      this.log(`    Dependencies:   ${this.formatDebt(report.breakdown.dependencies)}`)
      this.log(`    Documentation:  ${this.formatDebt(report.breakdown.documentation)}`)
      this.log(`    Patterns:       ${this.formatDebt(report.breakdown.patterns)}`)
      this.log(`    Security:       ${this.formatDebt(report.breakdown.security)}`)
      this.log('')

      this.log(chalk.gray('  Debt Interest (time cost):'))
      this.log(`    Weekly:   ${report.interest.weekly}h`)
      this.log(`    Monthly:  ${report.interest.monthly}h`)
      this.log(`    Annual:   ${report.interest.annual}h`)
      this.log('')

      this.log(chalk.gray('  Analysis:'))
      this.log(`    Files analyzed: ${report.filesAnalyzed}`)
      this.log('')
    }

    const recommendations = this.getRecommendations(report)
    if (recommendations.length > 0) {
      this.log(chalk.gray('  Recommendations:'))
      for (const rec of recommendations) {
        this.log(`    ${chalk.yellow('•')} ${rec}`)
      }

      this.log('')
    }
  }

  private formatDebt(score: number): string {
    const colorFn = this.getDebtColor(score)
    return colorFn(score.toString().padStart(3))
  }

  private getDebtColor(score: number) {
    if (score <= 5) return chalk.green
    if (score <= 15) return chalk.yellow

    return chalk.red
  }

  private getHistoryPath(targetPath: string): string {
    return join(targetPath, '.codeforge', 'debt-history.json')
  }

  private getRecommendations(report: DebtReport): string[] {
    const recommendations: string[] = []

    if (report.breakdown.security > DEBT_SECURITY_THRESHOLD_HIGH) {
      recommendations.push('Address security issues - these have the highest debt cost')
    }

    if (report.breakdown.complexity > DEBT_COMPLEXITY_THRESHOLD_HIGH) {
      recommendations.push('Reduce code complexity by refactoring large functions')
    }

    if (report.breakdown.dependencies > DEBT_DEPENDENCIES_THRESHOLD_HIGH) {
      recommendations.push('Review and clean up circular dependencies')
    }

    if (report.breakdown.documentation > DEBT_COMPLEXITY_THRESHOLD_HIGH) {
      recommendations.push('Add JSDoc comments to improve code maintainability')
    }

    if (report.overall > DEBT_OVERALL_THRESHOLD_HIGH) {
      recommendations.push('Consider dedicating time to debt reduction in your next sprint')
    }

    return recommendations.slice(0, MAX_RECOMMENDATIONS)
  }

  private async getTrend(targetPath: string, current: number): Promise<DebtReport['trend']> {
    try {
      const historyPath = this.getHistoryPath(targetPath)
      const content = await fs.readFile(historyPath, 'utf8')
      const history: DebtHistoryEntry[] = JSON.parse(content)

      if (history.length === 0) {
        return { change: 0, direction: 'stable', previous: null }
      }

      const previous = history.at(-1)!.overall
      const change = current - previous

      let direction: DebtReport['trend']['direction'] = 'stable'
      if (change < -1) {
        direction = 'decreasing'
      } else if (change > 1) {
        direction = 'increasing'
      }

      return { change, direction, previous }
    } catch {
      return { change: 0, direction: 'stable', previous: null }
    }
  }

  private async saveHistory(targetPath: string, report: DebtReport): Promise<void> {
    const historyPath = this.getHistoryPath(targetPath)
    const historyDir = join(targetPath, '.codeforge')

    let history: DebtHistoryEntry[] = []

    try {
      const content = await fs.readFile(historyPath, 'utf8')
      history = JSON.parse(content)
    } catch {
      history = []
    }

    const entry: DebtHistoryEntry = {
      breakdown: report.breakdown,
      filesAnalyzed: report.filesAnalyzed,
      overall: report.overall,
      timestamp: new Date().toISOString(),
    }

    history.push(entry)

    if (history.length > MAX_DEBT_HISTORY_ENTRIES) {
      history = history.slice(-MAX_DEBT_HISTORY_ENTRIES)
    }

    await fs.mkdir(historyDir, { recursive: true })
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2), 'utf8')
  }

  private async showHistory(targetPath: string): Promise<void> {
    try {
      const historyPath = this.getHistoryPath(targetPath)
      const content = await fs.readFile(historyPath, 'utf8')
      const history: DebtHistoryEntry[] = JSON.parse(content)

      this.log('')
      this.log(chalk.bold('  Technical Debt History'))
      this.log('')

      if (history.length === 0) {
        this.log(chalk.yellow('  No history found. Run `codeforge debt --save` to start tracking.'))
        this.log('')
        return
      }

      this.log(chalk.gray('  Date                 | Debt | Trend'))
      this.log(chalk.gray('  ' + '-'.repeat(TABLE_DASH_SEPARATOR_WIDTH)))

      for (let i = history.length - 1; i >= 0; i--) {
        const entry = history[i]!
        const date = new Date(entry.timestamp).toLocaleDateString()
        const colorFn = this.getDebtColor(entry.overall)

        let trendStr = '-'
        if (i > 0) {
          const prev = history[i - 1]!.overall
          const change = entry.overall - prev

          if (change < 0) {
            trendStr = chalk.green(`↓ ${Math.abs(change)}`)
          } else if (change > 0) {
            trendStr = chalk.red(`↑ ${change}`)
          }
        }

        this.log(
          `  ${date.padEnd(DATE_FIELD_WIDTH)} | ${colorFn(entry.overall.toString().padStart(4))} | ${trendStr}`,
        )
      }

      this.log('')

      const latest = history.at(-1)!
      const oldest = history.at(0)!
      const totalChange = latest.overall - oldest.overall

      if (totalChange < 0) {
        this.log(
          chalk.green(`  Debt reduced by ${Math.abs(totalChange)} points since tracking started`),
        )
      } else if (totalChange > 0) {
        this.log(chalk.red(`  Debt increased by ${totalChange} points since tracking started`))
      } else {
        this.log(chalk.yellow('  Debt has remained stable'))
      }

      this.log('')
    } catch {
      this.log('')
      this.log(chalk.yellow('  No history found.'))
      this.log(chalk.gray('  Run `codeforge debt --save` to start tracking debt over time.'))
      this.log('')
    }
  }
}
