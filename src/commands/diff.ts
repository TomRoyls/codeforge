/**
 * Diff command — compare violations between git branches or commits.
 *
 * @example
 * ```bash
 * codeforge diff
 * codeforge diff main feature-branch
 * codeforge diff abc123 def456
 * codeforge diff --json
 * codeforge diff --verbose
 * ```
 */
import { Args, Command, Flags } from '@oclif/core'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import type { RuleViolation } from '../ast/visitor.js'
import {
  buildDiffReport as buildDiffReportHelper,
  createViolationKey as createViolationKeyHelper,
  displayDiffReport as displayDiffReportHelper,
  type ViolationDiffReport,
} from './diff-helpers.js'

export {
  buildDiffResult,
  type DiffLine,
  type DiffOptions,
  type DiffResult,
  type DiffSummary,
  type FileDiff,
} from './diff-helpers.js'
export { formatDiffJson, formatDiffTable } from './diff-format-helpers.js'

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

  createViolationKey(v: {
    filePath: string
    range: { start: { line: number } }
    ruleId: string
  }): string {
    return createViolationKeyHelper(v as RuleViolation)
  }

  isGitRepository(path: string): boolean {
    try {
      execSync('git rev-parse --git-dir', { cwd: path })
      return true
    } catch {
      return false
    }
  }

  displayReport(report: Record<string, unknown>, verbose: boolean): void {
    displayDiffReportHelper(
      report as unknown as ViolationDiffReport,
      verbose,
      (msg: unknown) => this.log(msg as string),
    )
  }

  async analyzeDiff(
    targetPath: string,
    baseRef: string,
    headRef: string,
  ): Promise<ViolationDiffReport> {
    const base = await this.getViolationsAtRef(targetPath, baseRef)
    const head = await this.getViolationsAtRef(targetPath, headRef)
    return buildDiffReportHelper(baseRef, headRef, base as unknown as RuleViolation[], head as unknown as RuleViolation[])
  }

  async getViolationsAtRef(
    targetPath: string,
    ref: string,
  ): Promise<Array<Record<string, unknown>>> {
    const tmpDir = `/tmp/codeforge-diff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    let worktreeCreated = false
    let extractionSucceeded = false

    try {
      try {
        execSync(`git worktree add ${tmpDir} ${ref}`, { cwd: targetPath })
        worktreeCreated = true
        extractionSucceeded = true
      } catch {}

      if (!extractionSucceeded) {
        try {
          execSync(`git archive ${ref} | tar -x -C ${tmpDir}`, { cwd: targetPath })
          extractionSucceeded = true
        } catch {}
      }

      if (extractionSucceeded) {
        return await this.analyzeViolations(tmpDir)
      }

      return await this.analyzeViolations(targetPath)
    } finally {
      if (worktreeCreated) {
        try {
          execSync(`git worktree remove ${tmpDir}`, { cwd: targetPath })
        } catch {
          try {
            execSync(`rm -rf ${tmpDir}`)
          } catch {}
        }
      } else {
        try {
          execSync(`rm -rf ${tmpDir}`)
        } catch {}
      }
    }
  }

  async analyzeViolations(targetPath: string): Promise<Array<Record<string, unknown>>> {
    if (!existsSync(targetPath)) {
      return []
    }
    return []
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Diff)

    const targetPath = resolve(flags.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    if (!this.isGitRepository(targetPath)) {
      this.error('Not a git repository', { exit: 1 })
    }

    const report = await this.analyzeDiff(
      targetPath,
      args.base as string,
      args.head as string,
    )

    if (flags.json) {
      this.log(JSON.stringify(report, null, 2))
    } else {
      this.displayReport(report as unknown as Record<string, unknown>, flags.verbose as boolean)
    }
  }
}
