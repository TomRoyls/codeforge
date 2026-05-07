/**
 * Diff command - compares violations between git branches or commits.
 *
 * Analyzes two git references (branches or commits) and shows how violations
 * have changed between them, useful for code review and regression detection.
 *
 * Features:
 * - Comparison between any two git refs
 * - Added/removed/improved violation tracking
 * - Net change calculation
 * - Verbose mode for detailed changes
 *
 * @example
 * ```bash
 * codeforge diff
 * codeforge diff main feature-branch
 * codeforge diff abc123 def456
 * ```
 */
import { Args, Command, Flags } from '@oclif/core'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { type RuleViolation } from '../ast/visitor.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { getRuleCategory } from '../rules/categories.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'
import { MAX_FILES_TO_PROCESS } from '../utils/constants.js'
import { logger } from '../utils/logger.js'
import {
  buildDiffReport,
  type DiffReport,
  displayDiffReport,
} from './diff-helpers.js'

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

  createViolationKey(v: RuleViolation): string {
    return `${v.filePath}:${v.range.start.line}:${v.ruleId}`
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

    return buildDiffReport(baseRef, headRef, baseViolations, headViolations)
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
    const allRules = await lazyRuleLoader.loadAllRules()
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
        } catch (error) {
          logger.debug(`Failed to parse file ${file.path} during diff analysis: ${error}`)
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

  private displayReport(report: DiffReport, verbose: boolean): void {
    displayDiffReport(report, verbose, (msg) => this.log(msg))
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
    } catch (error) {
      logger.debug(`Failed to checkout git ref "${ref}" via worktree/clone: ${error}`)
      try {
        execSync(`git archive "${ref}" | tar -x -C "${tempDir}"`, {
          cwd: targetPath,
          encoding: 'utf8',
          stdio: 'pipe',
        })
        await fs.mkdir(tempDir, { recursive: true })
      } catch (error) {
        logger.debug(`Failed to checkout git ref "${ref}" via archive: ${error}`)
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
        logger.debug(`Failed to cleanup temp diff directory "${tempDir}": ${error}`)
        error satisfies unknown
      }
    }
  }

  private isGitRepository(targetPath: string): boolean {
    try {
      execSync('git rev-parse --git-dir', { cwd: targetPath, encoding: 'utf8', stdio: 'pipe' })
      return true
    } catch (error) {
      logger.debug(`Git repository check failed for ${targetPath}: ${error}`)
      return false
    }
  }
}
