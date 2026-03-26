import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import ora, { type Ora } from 'ora'

import { type RuleViolation } from '../ast/visitor.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { allRules, getRuleCategory } from '../rules/index.js'
import {
  HEALTH_SCORE_MAX,
  MAX_FILES_TO_PROCESS,
  MAX_TOP_STATS_FILES,
  SCORE_FIELD_WIDTH,
} from '../utils/constants.js'

interface CategoryScore {
  score: number
  violations: number
  weight: number
}

interface FileScore {
  categories: Record<string, number>
  filePath: string
  score: number
  violations: number
}

interface ScoreReport {
  categories: {
    complexity: CategoryScore
    correctness: CategoryScore
    patterns: CategoryScore
    security: CategoryScore
  }
  overall: number
  path: string
  suggestions: string[]
  summary: {
    filesAnalyzed: number
    totalViolations: number
    violationsPerFile: number
  }
  topFiles: FileScore[]
}

export default class Score extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Calculate aggregate quality score for the codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show quality score for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Show quality score for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --json',
      description: 'Output score as JSON',
    },
  ]

  static override flags = {
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Score)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const spinner = ora('Analyzing codebase...').start()

    const report = await this.analyzeScore(targetPath, spinner)

    spinner.succeed(`Analyzed ${report.summary.filesAnalyzed} files`)

    if (flags.json) {
      this.log(JSON.stringify(report, null, 2))
    } else {
      this.displayReport(report, flags.verbose)
    }
  }

  private async analyzeScore(targetPath: string, spinner: Ora): Promise<ScoreReport> {
    const files = await discoverFiles({
      cwd: targetPath,
      ignore: ['node_modules', 'dist', 'coverage', '.git'],
      patterns: [],
    })

    spinner.text = 'Initializing parser...'

    const parser = new Parser()
    await parser.initialize()

    const registry = new RuleRegistry()
    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
    }

    spinner.text = 'Processing files...'

    const filesToProcess = files.slice(0, MAX_FILES_TO_PROCESS)
    const fileScores: FileScore[] = []
    const allViolations: RuleViolation[] = []
    let totalFunctions = 0
    let documentedFunctions = 0

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
      const violationsWithPath = violations.map((v) => ({
        ...v,
        filePath: result.filePath,
      }))
      allViolations.push(...violationsWithPath)

      const functions = result.parseResult.sourceFile.getFunctions()
      totalFunctions += functions.length
      for (const fn of functions) {
        const docs = fn.getJsDocs()
        if (docs.length > 0) {
          documentedFunctions++
        }
      }

      const categoryCounts: Record<string, number> = {}
      for (const violation of violationsWithPath) {
        const category = getRuleCategory(violation.ruleId)
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      }

      const fileScore: number = this.calculateFileScore(violationsWithPath.length)

      fileScores.push({
        categories: categoryCounts,
        filePath: result.filePath,
        score: fileScore,
        violations: violationsWithPath.length,
      })
    }

    parser.dispose()

    fileScores.sort((a, b) => b.violations - a.violations)

    const complexityViolations = allViolations.filter(
      (v) => getRuleCategory(v.ruleId) === 'complexity',
    )
    const correctnessViolations = allViolations.filter(
      (v) => getRuleCategory(v.ruleId) === 'correctness',
    )
    const securityViolations = allViolations.filter((v) => getRuleCategory(v.ruleId) === 'security')
    const patternsViolations = allViolations.filter((v) => getRuleCategory(v.ruleId) === 'patterns')

    const categories = {
      complexity: this.calculateCategoryScore(complexityViolations.length, 0.3),
      correctness: this.calculateCorrectnessScore(
        correctnessViolations.length,
        totalFunctions,
        documentedFunctions,
        0.25,
      ),
      patterns: this.calculateCategoryScore(patternsViolations.length, 0.15),
      security: this.calculateCategoryScore(securityViolations.length, 0.3),
    }

    const overall = Math.round(
      categories.complexity.score * categories.complexity.weight +
        categories.correctness.score * categories.correctness.weight +
        categories.security.score * categories.security.weight +
        categories.patterns.score * categories.patterns.weight,
    )

    const suggestions = this.generateSuggestions(categories, allViolations, fileScores)

    return {
      categories: {
        complexity: {
          score: Math.round(categories.complexity.score),
          violations: complexityViolations.length,
          weight: categories.complexity.weight,
        },
        correctness: {
          score: Math.round(categories.correctness.score),
          violations: correctnessViolations.length,
          weight: categories.correctness.weight,
        },
        patterns: {
          score: Math.round(categories.patterns.score),
          violations: patternsViolations.length,
          weight: categories.patterns.weight,
        },
        security: {
          score: Math.round(categories.security.score),
          violations: securityViolations.length,
          weight: categories.security.weight,
        },
      },
      overall,
      path: targetPath,
      suggestions,
      summary: {
        filesAnalyzed: filesToProcess.length,
        totalViolations: allViolations.length,
        violationsPerFile:
          filesToProcess.length > 0 ? allViolations.length / filesToProcess.length : 0,
      },
      topFiles: fileScores.slice(0, MAX_TOP_STATS_FILES),
    }
  }

  private calculateCategoryScore(violations: number, weight: number): CategoryScore {
    const score = Math.max(0, 100 - violations * 5)
    return { score, violations, weight }
  }

  private calculateCorrectnessScore(
    violations: number,
    totalFunctions: number,
    documentedFunctions: number,
    weight: number,
  ): CategoryScore {
    const coverage = totalFunctions > 0 ? (documentedFunctions / totalFunctions) * 100 : 50
    const penalty = violations * 5
    const score = Math.max(0, coverage - penalty)
    return { score, violations, weight }
  }

  private calculateFileScore(violations: number): number {
    return Math.max(0, 100 - violations * 3)
  }

  private displayReport(report: ScoreReport, verbose: boolean): void {
    const score = report.overall
    const colorFn = this.getScoreColor(score)

    this.log('')
    this.log(chalk.bold('  Code Quality Score'))
    this.log('')
    this.log(
      `  ${colorFn(`  ${score.toString().padStart(SCORE_FIELD_WIDTH)} / ${HEALTH_SCORE_MAX}`)}  ${this.getGrade(score)}`,
    )
    this.log('')

    this.log(chalk.gray('  Category Scores:'))
    this.log(
      `    Complexity:  ${this.formatScore(report.categories.complexity.score, report.categories.complexity.weight)}`,
    )
    this.log(
      `    Correctness: ${this.formatScore(report.categories.correctness.score, report.categories.correctness.weight)}`,
    )
    this.log(
      `    Security:    ${this.formatScore(report.categories.security.score, report.categories.security.weight)}`,
    )
    this.log(
      `    Patterns:    ${this.formatScore(report.categories.patterns.score, report.categories.patterns.weight)}`,
    )
    this.log('')

    this.log(chalk.gray('  Summary:'))
    this.log(`    Files analyzed: ${report.summary.filesAnalyzed}`)
    this.log(`    Total violations: ${report.summary.totalViolations}`)
    this.log(`    Violations per file: ${report.summary.violationsPerFile.toFixed(2)}`)
    this.log('')

    if (verbose && report.topFiles.length > 0) {
      this.log(chalk.gray('  Top Problematic Files:'))
      for (const file of report.topFiles) {
        this.log(`    ${chalk.yellow(file.filePath)}`)
        this.log(`      Violations: ${file.violations}, Score: ${file.score}/100`)
        if (Object.keys(file.categories).length > 0) {
          const categories = Object.entries(file.categories)
            .map(([cat, count]) => `${cat}: ${count}`)
            .join(', ')
          this.log(`      Categories: ${categories}`)
        }
      }

      this.log('')
    }

    if (report.suggestions.length > 0) {
      this.log(chalk.gray('  Improvement Suggestions:'))
      for (const suggestion of report.suggestions) {
        this.log(`    ${chalk.yellow('•')} ${suggestion}`)
      }

      this.log('')
    }
  }

  private formatScore(score: number, weight: number): string {
    const colorFn = this.getScoreColor(score)
    return colorFn(
      `${score.toString().padStart(SCORE_FIELD_WIDTH)} / ${HEALTH_SCORE_MAX} (weight: ${(weight * 100).toFixed(0)}%)`,
    )
  }

  private generateSuggestions(
    categories: ScoreReport['categories'],
    _allViolations: RuleViolation[],
    fileScores: FileScore[],
  ): string[] {
    const suggestions: string[] = []

    if (categories.complexity.score < 70) {
      suggestions.push(
        `Reduce code complexity - ${categories.complexity.violations} complexity issues found`,
      )
    }

    if (categories.correctness.score < 70) {
      suggestions.push(
        `Improve code correctness - ${categories.correctness.violations} correctness issues found`,
      )
    }

    if (categories.security.score < 80) {
      suggestions.push(
        `Address security concerns - ${categories.security.violations} security issues found (critical)`,
      )
    }

    if (categories.patterns.score < 70) {
      suggestions.push(
        `Refactor code patterns - ${categories.patterns.violations} pattern violations found`,
      )
    }

    const firstFile = fileScores[0]
    if (firstFile && firstFile.violations > 10) {
      suggestions.push(`Focus on ${firstFile.filePath} - it has ${firstFile.violations} violations`)
    }

    return suggestions
  }

  private getGrade(score: number): string {
    if (score >= 90) return '(A)'
    if (score >= 80) return '(B)'
    if (score >= 70) return '(C)'
    if (score >= 60) return '(D)'
    return '(F)'
  }

  private getScoreColor(score: number) {
    if (score >= 80) return chalk.green
    if (score >= 60) return chalk.yellow
    return chalk.red
  }
}
