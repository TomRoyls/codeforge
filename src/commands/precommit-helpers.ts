import chalk from 'chalk'
import { join } from 'node:path'

export interface PrecommitOptions {
  command: string
  force: boolean
  installer: 'git' | 'husky' | 'pre-commit-framework'
}

export const DEFAULT_COMMAND = 'codeforge analyze --staged'

export function generateHookContent(options: PrecommitOptions): string {
  const huskySource =
    options.installer === 'husky' ? '. "$(dirname -- "$0")/_/husky.sh" 2>/dev/null || true\n\n' : ''

  return `#!/usr/bin/env sh
 ${huskySource}${options.command}
`
}

export function getGitHookPath(cwd: string): string {
  return join(cwd, '.git', 'hooks', 'pre-commit')
}

export function getHuskyHookPath(cwd: string): string {
  return join(cwd, '.husky', 'pre-commit')
}

export function isGitRepository(cwd: string, existsFn: (path: string) => boolean): boolean {
  return existsFn(join(cwd, '.git'))
}

export function resolvePrecommitOptions(flags: Record<string, unknown>): PrecommitOptions {
  return {
    command: (flags.command as string) ?? DEFAULT_COMMAND,
    force: (flags.force as boolean) ?? false,
    installer: (flags.installer as 'git' | 'husky' | 'pre-commit-framework') ?? 'git',
  }
}

export function getHookDir(options: PrecommitOptions, cwd: string): string {
  return options.installer === 'husky' ? join(cwd, '.husky') : options.installer === 'pre-commit-framework' ? cwd : join(cwd, '.git', 'hooks')
}

export function getPrecommitFrameworkConfigPath(cwd: string): string {
  return join(cwd, '.pre-commit-config.yaml')
}

export function generatePrecommitFrameworkConfig(options: PrecommitOptions): string {
  return `repos:
  - repo: local
    hooks:
      - id: codeforge
        name: CodeForge
        entry: ${options.command}
        language: system
        types: [file]
        stages: [pre-commit]
`
}

export function displayPostInstallMessage(
  options: PrecommitOptions,
  hookPath: string,
  logFn: (msg: string) => void,
): void {
  logFn(chalk.green(`✓ Created pre-commit hook at ${hookPath}`))
  logFn('')
  logFn(chalk.bold('Hook configuration:'))
  logFn(chalk.gray(`  Installer: ${options.installer}`))
  logFn(chalk.gray(`  Command: ${options.command}`))
  logFn('')
  logFn(chalk.bold('Next steps:'))
  if (options.installer === 'husky') {
    logFn(chalk.gray('  1. Ensure husky is installed (npm install husky --save-dev)'))
    logFn(chalk.gray('  2. Run `git commit` to trigger the hook'))
  } else if (options.installer === 'pre-commit-framework') {
    logFn(chalk.gray('  1. Install pre-commit framework: `pip install pre-commit`'))
    logFn(chalk.gray('  2. Run `pre-commit install` to install git hooks'))
    logFn(chalk.gray('  3. Run `git commit` to trigger the hook'))
  } else {
    logFn(chalk.gray('  1. Run `git commit` to trigger the hook'))
  }
}
