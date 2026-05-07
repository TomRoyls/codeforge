/**
 * Debt command - tracks and analyzes technical debt in a codebase.
 *
 * Calculates technical debt based on violations and estimates the time cost
 * to address the debt, with trend tracking over time.
 *
 * Features:
 * - Weighted debt scoring by category
 * - Time cost estimation (hours/weeks/months)
 * - Historical trend tracking
 * - Improvement recommendations
 * - Debt snapshot saving for comparison
 *
 * @example
 * ```bash
 * codeforge debt
 * codeforge debt --history
 * codeforge debt --save
 * ```
 */
import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { join, resolve } from 'node:path'
import ora from 'ora'

import { type RuleViolation } from '../ast/visitor.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import {
  DATE_FIELD_WIDTH,
  MAX_FILES_TO_PROCESS,
  TABLE_DASH_SEPARATOR_WIDTH,
} from '../utils/constants.js'
import { logger } from '../utils/logger.js'
import {
  appendHistoryEntry,
  calculateBreakdown as calcBreakdown,
  calculateInterest as calcInterest,
  calculateOverall as calcOverall,
  computeTrend,
  type DebtBreakdown,
  getDebtColor as debtColorFn,
  type DebtHistoryEntry,
  type DebtReport,
  formatDebt as fmtDebt,
  getRecommendations as getRecs,
  getHistoryPath as histPath,
  setupDebtRuleRegistry,
} from './debt-helpers.js'

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
      description: 'Save debt snapshot for trend tracking',
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

    const registry = await setupDebtRuleRegistry()

    const allViolations: RuleViolation[] = []
    const filesToProcess = files.slice(0, MAX_FILES_TO_PROCESS)

    const spinner = ora('Analyzing technical debt...').start()
    let completedCount = 0
    const totalFiles = filesToProcess.length

    const parseResults = await Promise.all(
      filesToProcess.map(async (file) => {
        try {
          const result = {
            filePath: file.path,
            parseResult: await parser.parseFile(file.absolutePath),
          }
          completedCount++
          spinner.text = `Analyzing technical debt... (${completedCount}/${totalFiles})`
          return result
        } catch (error) {
          logger.debug(`Failed to parse file ${file.path} during debt analysis: ${error}`)
          completedCount++
          spinner.text = `Analyzing technical debt... (${completedCount}/${totalFiles})`
          return null
        }
      }),
    )

    spinner.succeed(`Analyzed ${totalFiles} files`)

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
    return calcBreakdown(violations)
  }

  private calculateInterest(debtPoints: number): DebtReport['interest'] {
    return calcInterest(debtPoints)
  }

  private calculateOverall(breakdown: DebtBreakdown, filesCount: number): number {
    return calcOverall(breakdown, filesCount)
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
    return fmtDebt(score)
  }

  private getDebtColor(score: number) {
    return debtColorFn(score)
  }

  private getHistoryPath(targetPath: string): string {
    return histPath(targetPath)
  }

  private getRecommendations(report: DebtReport): string[] {
    return getRecs(report)
  }

  private async getTrend(targetPath: string, current: number): Promise<DebtReport['trend']> {
    try {
      const content = await fs.readFile(this.getHistoryPath(targetPath), 'utf8')
      const history: DebtHistoryEntry[] = JSON.parse(content)
      return computeTrend(history, current)
    } catch (error) {
      logger.debug(`Failed to read debt history from ${this.getHistoryPath(targetPath)}: ${error}`)
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
    } catch (error) {
      logger.debug(`Failed to read existing debt history, starting fresh: ${error}`)
      history = []
    }

    const updated = appendHistoryEntry(history, report, new Date().toISOString())

    try {
      await fs.mkdir(historyDir, { recursive: true })
      await fs.writeFile(historyPath, JSON.stringify(updated, null, 2), 'utf8')
    } catch (error) {
      this.warn(
        `Failed to save debt history to ${historyPath}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
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
    } catch (error) {
      logger.debug(`Failed to read debt history for display: ${error}`)
      this.log('')
      this.log(chalk.yellow('  No history found.'))
      this.log(chalk.gray('  Run `codeforge debt --save` to start tracking debt over time.'))
      this.log('')
    }
  }
}
