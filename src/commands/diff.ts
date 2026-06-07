import { Args, Command, Flags } from '@oclif/core'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import type { RuleViolation } from '../ast/visitor.js'

import {
  buildDiffReport,
  createViolationKey as createViolationKeyImpl,
  displayDiffReport,
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

  createViolationKey(violation: RuleViolation): string {
    return createViolationKeyImpl(violation)
  }

  isGitRepository(targetPath: string): boolean {
    try {
      execSync('git rev-parse --git-dir', { cwd: targetPath })
      return true
    } catch {
      return false
    }
  }

  displayReport(report: ViolationDiffReport, verbose: boolean): void {
    displayDiffReport(report, verbose, (msg) => { this.log(msg as string) })
  }

  async analyzeDiff(
    targetPath: string,
    baseRef: string,
    headRef: string,
  ): Promise<ViolationDiffReport> {
    const [baseViolations, headViolations] = await Promise.all([
      this.getViolationsAtRef(targetPath, baseRef),
      this.getViolationsAtRef(targetPath, headRef),
    ])
    return buildDiffReport(baseRef, headRef, baseViolations, headViolations)
  }

  async analyzeViolations(targetPath: string): Promise<RuleViolation[]> {
    if (!existsSync(targetPath)) return []
    return []
  }

  async getViolationsAtRef(
    targetPath: string,
    ref: string,
  ): Promise<RuleViolation[]> {
    const tempDir = `/tmp/codeforge-diff-${Date.now()}`
    let useWorktree = true
    try {
      try {
        execSync(`git worktree add ${tempDir} ${ref}`, { cwd: targetPath })
      } catch {
        useWorktree = false
        try {
          execSync(`git archive ${ref} | tar -x -C ${tempDir}`, { cwd: targetPath })
        } catch {
          return []
        }
      }
      return await this.analyzeViolations(tempDir)
    } finally {
      try {
        if (useWorktree) {
          try {
            execSync(`git worktree remove ${tempDir} --force`, { cwd: targetPath })
          } catch {
            try {
              execSync(`rm -rf ${tempDir}`, { cwd: targetPath })
            } catch {
              // cleanup failure is non-fatal
            }
          }
        } else {
          try {
            execSync(`rm -rf ${tempDir}`, { cwd: targetPath })
          } catch {
            // cleanup failure is non-fatal
          }
        }
      } catch {
        // cleanup failure is non-fatal
      }
    }
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Diff)
    const targetPath = resolve(flags.path)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${flags.path}`, { exit: 1 })
    }

    if (!this.isGitRepository(targetPath)) {
      this.error('Not a git repository', { exit: 1 })
    }

    const report = await this.analyzeDiff(targetPath, args.base, args.head)

    if (flags.json) {
      this.log(JSON.stringify(report, null, 2))
    } else {
      this.displayReport(report, flags.verbose)
    }
  }
}
