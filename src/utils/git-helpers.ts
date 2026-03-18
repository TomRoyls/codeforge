import { execSync } from 'node:child_process'

export function isGitRepository(cwd: string): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return true
  } catch {
    return false
  }
}

export function getStagedFiles(cwd: string): string[] {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    return output
      .trim()
      .split('\n')
      .filter((line) => line.length > 0)
  } catch {
    return []
  }
}

export function getGitRoot(cwd: string): string | null {
  try {
    return execSync('git rev-parse --show-toplevel', {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
  } catch {
    return null
  }
}
