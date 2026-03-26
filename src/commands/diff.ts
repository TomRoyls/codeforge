import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { type RuleViolation } from '../ast/visitor.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { allRules, getRuleCategory } from '../rules/index.js'
import { MAX_DIFF_VIOLATIONS, MAX_FILES_TO_PROCESS } from '../utils/constants.js'

interface DiffReport {
  added: RuleViolation[]
  base: string
  head: string
  improved: RuleViolation[]
  removed: RuleViolation[]
  summary: {
    addedCount: number
    improvedCount: number
    netChange: number
    removedCount: number
    totalBase: number
    totalHead: number
  }
}

export default class Diff extends Command {
  static override args = {
    base: Args.string({
      default: 'HEAD~1',
      description: 'Base branch or commit to compare from',
      required: false,
    }),
    head: Args.string({
      default: 'HEAD',
      description: 'Head branch or commit to compare to',
      required: false,
    }),
  }

  static override description = 'Compare violations between git branches or commits'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Compare current commit with previous commit',
    },
    {
      command: '<%= config.bin %> <%= command.id %> main feature-branch',
      description: 'Compare main branch with feature branch',
    },
    {
      command: '<%= config.bin %> <%= command.id %> abc123 def456',
      description: 'Compare two specific commits',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --json',
      description: 'Output diff as JSON',
    },
  ]

  static override flags = {
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
    path: Flags.string({
      default: '.',
      description: 'Path to analyze',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed violation changes',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Diff)

    const targetPath = resolve(flags.path)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    if (!this.isGitRepository(targetPath)) {
      this.error('Not a git repository', { exit: 1 })
    }

    const baseRef = args.base as string
    const headRef = args.head as string

    const report = await this.analyzeDiff(targetPath, baseRef, headRef)

    if (flags.json) {
      this.log(JSON.stringify(report, null, 2))
    } else {
      this.displayReport(report, flags.verbose)
    }
  }

  private async analyzeDiff(
    targetPath: string,
    baseRef: string,
    headRef: string,
  ): Promise<DiffReport> {
    const baseViolations = await this.getViolationsAtRef(targetPath, baseRef)
    const headViolations = await this.getViolationsAtRef(targetPath, headRef)

    const baseMap = new Map<string, RuleViolation>()
    for (const v of baseViolations) {
      baseMap.set(this.createViolationKey(v), v)
    }

    const headMap = new Map<string, RuleViolation>()
    for (const v of headViolations) {
      headMap.set(this.createViolationKey(v), v)
    }

    const added: RuleViolation[] = []
    const removed: RuleViolation[] = []
    const improved: RuleViolation[] = []

    for (const [key, v] of headMap) {
      if (!baseMap.has(key)) {
        added.push(v)
      }
    }

    for (const [key, v] of baseMap) {
      if (!headMap.has(key)) {
        removed.push(v)
      }
    }

    const netChange = added.length - removed.length

    return {
      added,
      base: baseRef,
      head: headRef,
      improved,
      removed,
      summary: {
        addedCount: added.length,
        improvedCount: improved.length,
        netChange,
        removedCount: removed.length,
        totalBase: baseViolations.length,
        totalHead: headViolations.length,
      },
    }
  }

  private async analyzeViolations(targetPath: string): Promise<RuleViolation[]> {
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

  private createViolationKey(v: RuleViolation): string {
    return `${v.filePath}:${v.range.start.line}:${v.ruleId}`
  }

  private displayReport(report: DiffReport, verbose: boolean): void {
    this.log('')
    this.log(chalk.bold('  Violation Diff Analysis'))
    this.log('')
    this.log(chalk.gray(`  Comparing: ${report.base} → ${report.head}`))
    this.log('')

    const { summary } = report
    const netColor =
      summary.netChange < 0 ? chalk.green : summary.netChange > 0 ? chalk.red : chalk.gray

    this.log(chalk.gray('  Summary:'))
    this.log(`    Base violations:  ${summary.totalBase}`)
    this.log(`    Head violations:  ${summary.totalHead}`)
    this.log(`    Added:            ${chalk.red(`+${summary.addedCount}`)}`)
    this.log(`    Removed:          ${chalk.green(`-${summary.removedCount}`)}`)
    this.log(
      `    Net change:       ${netColor(summary.netChange >= 0 ? `+${summary.netChange}` : summary.netChange.toString())}`,
    )
    this.log('')

    if (verbose) {
      if (report.added.length > 0) {
        this.log(chalk.red('  Added Violations:'))
        for (const v of report.added.slice(0, MAX_DIFF_VIOLATIONS)) {
          this.log(`    ${chalk.red('+')} ${v.filePath}:${v.range.start.line} [${v.ruleId}]`)
        }

        if (report.added.length > MAX_DIFF_VIOLATIONS) {
          this.log(chalk.gray(`    ... and ${report.added.length - MAX_DIFF_VIOLATIONS} more`))
        }

        this.log('')
      }

      if (report.removed.length > 0) {
        this.log(chalk.green('  Removed Violations:'))
        for (const v of report.removed.slice(0, MAX_DIFF_VIOLATIONS)) {
          this.log(`    ${chalk.green('-')} ${v.filePath}:${v.range.start.line} [${v.ruleId}]`)
        }

        if (report.removed.length > MAX_DIFF_VIOLATIONS) {
          this.log(chalk.gray(`    ... and ${report.removed.length - MAX_DIFF_VIOLATIONS} more`))
        }

        this.log('')
      }
    }

    if (summary.netChange < 0) {
      this.log(
        chalk.green(
          `  ✓ Code quality improved! ${Math.abs(summary.netChange)} violations removed.`,
        ),
      )
    } else if (summary.netChange > 0) {
      this.log(
        chalk.yellow(`  ⚠ Code quality regressed. ${summary.netChange} new violations added.`),
      )
    } else {
      this.log(chalk.gray('  → No net change in violations.'))
    }

    this.log('')
  }

  private async getViolationsAtRef(targetPath: string, ref: string): Promise<RuleViolation[]> {
    const tempDir = join(tmpdir(), `codeforge-diff-${Date.now()}`)

    try {
      execSync(
        `git worktree add "${tempDir}" "${ref}" 2>/dev/null || git clone --branch "${ref}" . "${tempDir}"`,
        {
          cwd: targetPath,
          encoding: 'utf8',
          stdio: 'pipe',
        },
      )
    } catch {
      try {
        execSync(`git archive "${ref}" | tar -x -C "${tempDir}"`, {
          cwd: targetPath,
          encoding: 'utf8',
          stdio: 'pipe',
        })
        await fs.mkdir(tempDir, { recursive: true })
      } catch {
        return this.analyzeViolations(targetPath)
      }
    }

    try {
      const violations = await this.analyzeViolations(tempDir)
      return violations
    } finally {
      try {
        execSync(`git worktree remove "${tempDir}" --force 2>/dev/null || rm -rf "${tempDir}"`, {
          cwd: targetPath,
          encoding: 'utf8',
          stdio: 'pipe',
        })
      } catch (error) {
        error satisfies unknown
      }
    }
  }

  private isGitRepository(targetPath: string): boolean {
    try {
      execSync('git rev-parse --git-dir', { cwd: targetPath, encoding: 'utf8', stdio: 'pipe' })
      return true
    } catch {
      return false
    }
  }
}
