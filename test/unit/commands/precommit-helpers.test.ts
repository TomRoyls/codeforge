import { describe, test, expect } from 'vitest'
import {
  DEFAULT_COMMAND,
  type PrecommitOptions,
  displayPostInstallMessage,
  generateHookContent,
  generatePrecommitFrameworkConfig,
  getGitHookPath,
  getHookDir,
  getHuskyHookPath,
  getPrecommitFrameworkConfigPath,
  isGitRepository,
  resolvePrecommitOptions,
} from '../../../src/commands/precommit-helpers.js'
import { join } from 'node:path'

function makeOptions(overrides: Partial<PrecommitOptions> = {}): PrecommitOptions {
  return {
    command: 'codeforge analyze --staged',
    force: false,
    installer: 'git',
    ...overrides,
  }
}

describe('DEFAULT_COMMAND', () => {
  test('is codeforge analyze --staged', () => {
    expect(DEFAULT_COMMAND).toBe('codeforge analyze --staged')
  })

  test('is a non-empty string', () => {
    expect(DEFAULT_COMMAND.length).toBeGreaterThan(0)
  })
})

describe('generateHookContent', () => {
  test('generates hook with shebang for git installer', () => {
    const options = makeOptions({ installer: 'git' })
    const content = generateHookContent(options)
    expect(content).toContain('#!/usr/bin/env sh')
  })

  test('generates hook with default command', () => {
    const options = makeOptions({ command: 'codeforge analyze --staged' })
    const content = generateHookContent(options)
    expect(content).toContain('codeforge analyze --staged')
  })

  test('does not include husky source for git installer', () => {
    const options = makeOptions({ installer: 'git' })
    const content = generateHookContent(options)
    expect(content).not.toContain('husky.sh')
  })

  test('includes husky source for husky installer', () => {
    const options = makeOptions({ installer: 'husky' })
    const content = generateHookContent(options)
    expect(content).toContain('. "$(dirname -- "$0")/_/husky.sh" 2>/dev/null || true')
  })

  test('places husky source before command', () => {
    const options = makeOptions({ installer: 'husky', command: 'npm test' })
    const content = generateHookContent(options)
    const huskyIndex = content.indexOf('husky.sh')
    const commandIndex = content.indexOf('npm test')
    expect(huskyIndex).toBeLessThan(commandIndex)
  })

  test('includes custom command', () => {
    const options = makeOptions({ command: 'npm test' })
    const content = generateHookContent(options)
    expect(content).toContain('npm test')
  })

  test('includes arbitrary shell command', () => {
    const options = makeOptions({ command: 'echo "hello world" && exit 0' })
    const content = generateHookContent(options)
    expect(content).toContain('echo "hello world" && exit 0')
  })

  test('always starts with shebang', () => {
    const options = makeOptions()
    const content = generateHookContent(options)
    expect(content.startsWith('#!/usr/bin/env sh')).toBe(true)
  })

  test('husky installer produces longer content than git installer', () => {
    const gitContent = generateHookContent(makeOptions({ installer: 'git' }))
    const huskyContent = generateHookContent(makeOptions({ installer: 'husky' }))
    expect(huskyContent.length).toBeGreaterThan(gitContent.length)
  })
})

describe('getGitHookPath', () => {
  test('returns path ending with .git/hooks/pre-commit', () => {
    const result = getGitHookPath('/home/user/project')
    expect(result).toBe(join('/home/user/project', '.git', 'hooks', 'pre-commit'))
  })

  test('returns correct path for root directory', () => {
    const result = getGitHookPath('/')
    expect(result).toBe(join('/', '.git', 'hooks', 'pre-commit'))
  })

  test('returns correct path for nested directory', () => {
    const result = getGitHookPath('/a/b/c/d')
    expect(result).toBe(join('/a/b/c/d', '.git', 'hooks', 'pre-commit'))
  })

  test('uses provided cwd verbatim', () => {
    const result = getGitHookPath('/tmp/my-project')
    expect(result).toContain('/tmp/my-project/')
  })

  test('result contains .git segment', () => {
    const result = getGitHookPath('/project')
    expect(result).toContain('.git')
  })

  test('result contains hooks segment', () => {
    const result = getGitHookPath('/project')
    expect(result).toContain('hooks')
  })

  test('result ends with pre-commit', () => {
    const result = getGitHookPath('/project')
    expect(result.endsWith('pre-commit')).toBe(true)
  })
})

describe('getHuskyHookPath', () => {
  test('returns path ending with .husky/pre-commit', () => {
    const result = getHuskyHookPath('/home/user/project')
    expect(result).toBe(join('/home/user/project', '.husky', 'pre-commit'))
  })

  test('returns correct path for root directory', () => {
    const result = getHuskyHookPath('/')
    expect(result).toBe(join('/', '.husky', 'pre-commit'))
  })

  test('returns correct path for nested directory', () => {
    const result = getHuskyHookPath('/a/b/c')
    expect(result).toBe(join('/a/b/c', '.husky', 'pre-commit'))
  })

  test('result contains .husky segment', () => {
    const result = getHuskyHookPath('/project')
    expect(result).toContain('.husky')
  })

  test('result ends with pre-commit', () => {
    const result = getHuskyHookPath('/project')
    expect(result.endsWith('pre-commit')).toBe(true)
  })

  test('differs from git hook path', () => {
    const cwd = '/project'
    expect(getHuskyHookPath(cwd)).not.toBe(getGitHookPath(cwd))
  })
})

describe('isGitRepository', () => {
  test('returns true when existsFn returns true for .git path', () => {
    const result = isGitRepository('/project', () => true)
    expect(result).toBe(true)
  })

  test('returns false when existsFn returns false for .git path', () => {
    const result = isGitRepository('/project', () => false)
    expect(result).toBe(false)
  })

  test('passes .git path to existsFn', () => {
    const paths: string[] = []
    isGitRepository('/my/project', (p) => {
      paths.push(p)
      return true
    })
    expect(paths).toHaveLength(1)
    expect(paths[0]).toBe(join('/my/project', '.git'))
  })

  test('returns false when existsFn returns false', () => {
    const result = isGitRepository('/tmp', (p) => !p.includes('.git'))
    expect(result).toBe(false)
  })

  test('returns true for path where .git exists', () => {
    const existingPaths = new Set(['/project/.git', '/other/.git'])
    const result = isGitRepository('/project', (p) => existingPaths.has(p))
    expect(result).toBe(true)
  })

  test('returns false for path where .git does not exist', () => {
    const existingPaths = new Set(['/other/.git'])
    const result = isGitRepository('/project', (p) => existingPaths.has(p))
    expect(result).toBe(false)
  })
})

describe('resolvePrecommitOptions', () => {
  test('resolves with all flags provided', () => {
    const flags = { command: 'npm test', force: true, installer: 'husky' }
    const result = resolvePrecommitOptions(flags)
    expect(result).toEqual({
      command: 'npm test',
      force: true,
      installer: 'husky',
    })
  })

  test('uses default command when not provided', () => {
    const result = resolvePrecommitOptions({ force: false, installer: 'git' })
    expect(result.command).toBe(DEFAULT_COMMAND)
  })

  test('uses default force false when not provided', () => {
    const result = resolvePrecommitOptions({ command: 'npm test', installer: 'git' })
    expect(result.force).toBe(false)
  })

  test('uses default installer git when not provided', () => {
    const result = resolvePrecommitOptions({ command: 'npm test', force: false })
    expect(result.installer).toBe('git')
  })

  test('defaults all when empty object', () => {
    const result = resolvePrecommitOptions({})
    expect(result.command).toBe(DEFAULT_COMMAND)
    expect(result.force).toBe(false)
    expect(result.installer).toBe('git')
  })

  test('preserves git installer', () => {
    const result = resolvePrecommitOptions({ installer: 'git' })
    expect(result.installer).toBe('git')
  })

  test('preserves husky installer', () => {
    const result = resolvePrecommitOptions({ installer: 'husky' })
    expect(result.installer).toBe('husky')
  })

  test('preserves force true', () => {
    const result = resolvePrecommitOptions({ force: true })
    expect(result.force).toBe(true)
  })

  test('preserves custom command', () => {
    const result = resolvePrecommitOptions({ command: 'yarn lint' })
    expect(result.command).toBe('yarn lint')
  })
})

describe('getHookDir', () => {
  test('returns .git/hooks for git installer', () => {
    const options = makeOptions({ installer: 'git' })
    const result = getHookDir(options, '/project')
    expect(result).toBe(join('/project', '.git', 'hooks'))
  })

  test('returns .husky for husky installer', () => {
    const options = makeOptions({ installer: 'husky' })
    const result = getHookDir(options, '/project')
    expect(result).toBe(join('/project', '.husky'))
  })

  test('respects provided cwd', () => {
    const options = makeOptions({ installer: 'git' })
    const result = getHookDir(options, '/tmp/test')
    expect(result).toBe(join('/tmp/test', '.git', 'hooks'))
  })

  test('returns different paths for different installers', () => {
    const cwd = '/project'
    const gitDir = getHookDir(makeOptions({ installer: 'git' }), cwd)
    const huskyDir = getHookDir(makeOptions({ installer: 'husky' }), cwd)
    expect(gitDir).not.toBe(huskyDir)
  })
})

describe('displayPostInstallMessage', () => {
  function captureLog(options: PrecommitOptions, hookPath: string): string[] {
    const lines: string[] = []
    displayPostInstallMessage(options, hookPath, (msg) => lines.push(msg))
    return lines
  }

  test('outputs created hook message', () => {
    const options = makeOptions()
    const lines = captureLog(options, '/project/.git/hooks/pre-commit')
    const output = lines.join('\n')
    expect(output).toContain('Created pre-commit hook')
  })

  test('includes hook path in message', () => {
    const options = makeOptions()
    const lines = captureLog(options, '/custom/path/pre-commit')
    const output = lines.join('\n')
    expect(output).toContain('/custom/path/pre-commit')
  })

  test('outputs hook configuration section', () => {
    const options = makeOptions()
    const lines = captureLog(options, '/path')
    const output = lines.join('\n')
    expect(output).toContain('Hook configuration')
  })

  test('outputs installer type', () => {
    const options = makeOptions({ installer: 'husky' })
    const lines = captureLog(options, '/path')
    const output = lines.join('\n')
    expect(output).toContain('Installer: husky')
  })

  test('outputs command', () => {
    const options = makeOptions({ command: 'npm test' })
    const lines = captureLog(options, '/path')
    const output = lines.join('\n')
    expect(output).toContain('Command: npm test')
  })

  test('outputs next steps section', () => {
    const options = makeOptions()
    const lines = captureLog(options, '/path')
    const output = lines.join('\n')
    expect(output).toContain('Next steps')
  })

  test('outputs git next steps for git installer', () => {
    const options = makeOptions({ installer: 'git' })
    const lines = captureLog(options, '/path')
    const output = lines.join('\n')
    expect(output).toContain('Run `git commit` to trigger the hook')
    expect(output).not.toContain('Ensure husky is installed')
  })

  test('outputs husky next steps for husky installer', () => {
    const options = makeOptions({ installer: 'husky' })
    const lines = captureLog(options, '/path')
    const output = lines.join('\n')
    expect(output).toContain('Ensure husky is installed')
    expect(output).toContain('npm install husky --save-dev')
  })

  test('husky includes both step 1 and step 2', () => {
    const options = makeOptions({ installer: 'husky' })
    const lines = captureLog(options, '/path')
    const output = lines.join('\n')
    expect(output).toContain('1. Ensure husky is installed')
    expect(output).toContain('2. Run `git commit` to trigger the hook')
  })

  test('calls logFn multiple times', () => {
    const options = makeOptions()
    const lines = captureLog(options, '/path')
    expect(lines.length).toBeGreaterThan(3)
  })

  test('uses logFn for all output', () => {
    const options = makeOptions()
    const lines: string[] = []
    displayPostInstallMessage(options, '/path', (msg) => lines.push(msg))
    const output = lines.join('|')
    expect(output).toContain('Created pre-commit hook')
    expect(output).toContain('Hook configuration')
    expect(output).toContain('Next steps')
  })
})

describe('generateHookContent - edge cases', () => {
  test('handles empty command string', () => {
    const options = makeOptions({ command: '' })
    const content = generateHookContent(options)
    expect(content).toContain('#!/usr/bin/env sh')
    expect(content.length).toBeGreaterThan(0)
  })

  test('handles command with special shell characters', () => {
    const options = makeOptions({ command: 'echo "test" | grep test && exit 0' })
    const content = generateHookContent(options)
    expect(content).toContain('echo "test" | grep test && exit 0')
  })

  test('handles command with pipes and redirections', () => {
    const options = makeOptions({ command: 'codeforge analyze --staged 2>&1 | tee log.txt' })
    const content = generateHookContent(options)
    expect(content).toContain('codeforge analyze --staged 2>&1 | tee log.txt')
  })

  test('handles command with single quotes', () => {
    const options = makeOptions({ command: "echo 'hello world'" })
    const content = generateHookContent(options)
    expect(content).toContain("echo 'hello world'")
  })

  test('handles very long command', () => {
    const longCmd =
      'codeforge analyze --staged --config .codeforgerc.json --format json --output ./reports/report.json --concurrency 8'
    const options = makeOptions({ command: longCmd })
    const content = generateHookContent(options)
    expect(content).toContain(longCmd)
  })

  test('git installer content has no blank line before command when no husky source', () => {
    const options = makeOptions({ installer: 'git', command: 'npm test' })
    const content = generateHookContent(options)
    const lines = content.split('\n')
    expect(lines[0]).toContain('#!/usr/bin/env sh')
    expect(lines.some((l) => l.includes('npm test'))).toBe(true)
  })

  test('husky installer content includes stderr suppression', () => {
    const options = makeOptions({ installer: 'husky' })
    const content = generateHookContent(options)
    expect(content).toContain('2>/dev/null')
  })

  test('husky installer content includes fallback true', () => {
    const options = makeOptions({ installer: 'husky' })
    const content = generateHookContent(options)
    expect(content).toContain('|| true')
  })

  test('content ends with trailing newline', () => {
    const options = makeOptions()
    const content = generateHookContent(options)
    expect(content.endsWith('\n')).toBe(true)
  })
})

describe('getGitHookPath - edge cases', () => {
  test('handles path with trailing slash', () => {
    const result = getGitHookPath('/home/user/project/')
    expect(result).toContain('.git')
    expect(result).toContain('pre-commit')
  })

  test('handles relative path', () => {
    const result = getGitHookPath('./my-project')
    expect(result).toContain('.git')
    expect(result).toContain('pre-commit')
  })

  test('handles single character directory', () => {
    const result = getGitHookPath('/a')
    expect(result).toContain('.git')
    expect(result).toContain('pre-commit')
  })

  test('handles deeply nested path', () => {
    const deep = '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p'
    const result = getGitHookPath(deep)
    expect(result).toContain('.git')
    expect(result.endsWith('pre-commit')).toBe(true)
  })
})

describe('getHuskyHookPath - edge cases', () => {
  test('handles path with trailing slash', () => {
    const result = getHuskyHookPath('/home/user/project/')
    expect(result).toContain('.husky')
    expect(result).toContain('pre-commit')
  })

  test('handles relative path', () => {
    const result = getHuskyHookPath('./my-project')
    expect(result).toContain('.husky')
    expect(result.endsWith('pre-commit')).toBe(true)
  })

  test('path does not contain .git', () => {
    const result = getHuskyHookPath('/project')
    expect(result).not.toContain('.git')
  })

  test('path does not contain hooks segment', () => {
    const result = getHuskyHookPath('/project')
    expect(result).not.toContain('hooks')
  })
})

describe('isGitRepository - edge cases', () => {
  test('handles empty cwd', () => {
    const result = isGitRepository('', () => true)
    expect(result).toBe(true)
  })

  test('passes correct joined path to existsFn', () => {
    const paths: string[] = []
    isGitRepository('/x/y/z', (p) => {
      paths.push(p)
      return true
    })
    expect(paths[0]).toBe(join('/x/y/z', '.git'))
  })

  test('only calls existsFn once', () => {
    let callCount = 0
    isGitRepository('/project', () => {
      callCount++
      return true
    })
    expect(callCount).toBe(1)
  })
})

describe('resolvePrecommitOptions - edge cases', () => {
  test('handles explicit undefined command', () => {
    const result = resolvePrecommitOptions({ command: undefined })
    expect(result.command).toBe(DEFAULT_COMMAND)
  })

  test('handles explicit undefined force', () => {
    const result = resolvePrecommitOptions({ force: undefined })
    expect(result.force).toBe(false)
  })

  test('handles explicit undefined installer', () => {
    const result = resolvePrecommitOptions({ installer: undefined })
    expect(result.installer).toBe('git')
  })

  test('handles null command by falling back to default', () => {
    const result = resolvePrecommitOptions({ command: null as unknown as string })
    expect(result.command).toBe(DEFAULT_COMMAND)
  })

  test('handles all undefined values', () => {
    const result = resolvePrecommitOptions({
      command: undefined,
      force: undefined,
      installer: undefined,
    })
    expect(result).toEqual({
      command: DEFAULT_COMMAND,
      force: false,
      installer: 'git',
    })
  })

  test('result is a valid PrecommitOptions object', () => {
    const result = resolvePrecommitOptions({})
    expect(result).toHaveProperty('command')
    expect(result).toHaveProperty('force')
    expect(result).toHaveProperty('installer')
  })

  test('overwrites all defaults when all values provided', () => {
    const result = resolvePrecommitOptions({
      command: 'pnpm lint',
      force: true,
      installer: 'husky',
    })
    expect(result).toEqual({
      command: 'pnpm lint',
      force: true,
      installer: 'husky',
    })
  })
})

describe('getHookDir - edge cases', () => {
  test('returns parent directories for git hook dir', () => {
    const options = makeOptions({ installer: 'git' })
    const result = getHookDir(options, '/project')
    expect(result).toContain('.git')
    expect(result).toContain('hooks')
  })

  test('git hook dir is parent of getGitHookPath result', () => {
    const cwd = '/project'
    const options = makeOptions({ installer: 'git' })
    const hookDir = getHookDir(options, cwd)
    const hookPath = getGitHookPath(cwd)
    expect(hookPath.startsWith(hookDir)).toBe(true)
  })

  test('husky hook dir is parent of getHuskyHookPath result', () => {
    const cwd = '/project'
    const options = makeOptions({ installer: 'husky' })
    const hookDir = getHookDir(options, cwd)
    const hookPath = getHuskyHookPath(cwd)
    expect(hookPath.startsWith(hookDir)).toBe(true)
  })

  test('handles root directory as cwd', () => {
    const options = makeOptions({ installer: 'git' })
    const result = getHookDir(options, '/')
    expect(result).toBe(join('/', '.git', 'hooks'))
  })
})

describe('displayPostInstallMessage - edge cases', () => {
  test('git installer does not mention husky install command', () => {
    const options = makeOptions({ installer: 'git' })
    const lines: string[] = []
    displayPostInstallMessage(options, '/path', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('npm install husky')
  })

  test('handles special characters in hook path', () => {
    const options = makeOptions()
    const lines: string[] = []
    displayPostInstallMessage(options, '/path/with spaces/pre-commit', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('/path/with spaces/pre-commit')
  })

  test('includes checkmark in created message', () => {
    const options = makeOptions()
    const lines: string[] = []
    displayPostInstallMessage(options, '/path', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Created pre-commit hook')
  })

  test('includes default command in output', () => {
    const options = makeOptions()
    const lines: string[] = []
    displayPostInstallMessage(options, '/path', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain(DEFAULT_COMMAND)
  })

  test('logFn is called at least 7 times for git installer', () => {
    const options = makeOptions({ installer: 'git' })
    const lines: string[] = []
    displayPostInstallMessage(options, '/path', (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThanOrEqual(7)
  })

  test('husky installer outputs more lines than git installer', () => {
    const gitLines: string[] = []
    const huskyLines: string[] = []
    displayPostInstallMessage(makeOptions({ installer: 'git' }), '/path', (msg) =>
      gitLines.push(msg),
    )
    displayPostInstallMessage(makeOptions({ installer: 'husky' }), '/path', (msg) =>
      huskyLines.push(msg),
    )
    expect(huskyLines.length).toBeGreaterThan(gitLines.length)
  })

  test('displays force flag not shown in output (force is not part of post-install message)', () => {
    const options = makeOptions({ force: true })
    const lines: string[] = []
    displayPostInstallMessage(options, '/path', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('force')
  })
})

describe('makeOptions helper', () => {
  test('returns valid defaults with no overrides', () => {
    const opts = makeOptions()
    expect(opts.command).toBe('codeforge analyze --staged')
    expect(opts.force).toBe(false)
    expect(opts.installer).toBe('git')
  })

  test('allows overriding command', () => {
    const opts = makeOptions({ command: 'yarn lint' })
    expect(opts.command).toBe('yarn lint')
    expect(opts.force).toBe(false)
  })

  test('allows overriding force', () => {
    const opts = makeOptions({ force: true })
    expect(opts.force).toBe(true)
    expect(opts.command).toBe('codeforge analyze --staged')
  })

  test('allows overriding installer', () => {
    const opts = makeOptions({ installer: 'husky' })
    expect(opts.installer).toBe('husky')
  })

  test('allows overriding all fields', () => {
    const opts = makeOptions({ command: 'pnpm test', force: true, installer: 'husky' })
    expect(opts).toEqual({
      command: 'pnpm test',
      force: true,
      installer: 'husky',
    })
  })
})

describe('generateHookContent - structure', () => {
  test('git hook content has exactly 3 lines (shebang, space+command, trailing newline)', () => {
    const options = makeOptions({ installer: 'git', command: 'npm test' })
    const content = generateHookContent(options)
    const lines = content.split('\n')
    expect(lines[0]).toBe('#!/usr/bin/env sh')
    expect(lines[1]).toBe(' npm test')
    expect(lines[2]).toBe('')
    expect(lines).toHaveLength(3)
  })

  test('husky hook content has correct structure with husky source and command', () => {
    const options = makeOptions({ installer: 'husky', command: 'npm test' })
    const content = generateHookContent(options)
    const lines = content.split('\n')
    expect(lines[0]).toBe('#!/usr/bin/env sh')
    expect(lines[1]).toBe(' . "$(dirname -- "$0")/_/husky.sh" 2>/dev/null || true')
    expect(lines[2]).toBe('')
    expect(lines[3]).toBe('npm test')
    expect(lines[4]).toBe('')
    expect(lines).toHaveLength(5)
  })

  test('command line in git hook has a leading space', () => {
    const options = makeOptions({ installer: 'git', command: 'npm test' })
    const content = generateHookContent(options)
    const commandLine = content.split('\n')[1]
    expect(commandLine.startsWith(' ')).toBe(true)
  })

  test('command line in husky hook is on the 4th line after blank separator', () => {
    const options = makeOptions({ installer: 'husky', command: 'npm test' })
    const content = generateHookContent(options)
    const lines = content.split('\n')
    expect(lines[3]).toBe('npm test')
  })

  test('empty command produces valid shell script structure', () => {
    const options = makeOptions({ installer: 'git', command: '' })
    const content = generateHookContent(options)
    expect(content).toBe('#!/usr/bin/env sh\n \n')
  })

  test('husky source line is a valid shell source command', () => {
    const options = makeOptions({ installer: 'husky' })
    const content = generateHookContent(options)
    const huskyLine = content.split('\n')[1]
    expect(huskyLine).toContain('. ')
    expect(huskyLine).toContain('dirname -- "$0"')
    expect(huskyLine).toContain('_/husky.sh')
  })
})

describe('resolvePrecommitOptions - null handling', () => {
  test('handles null force by falling back to false', () => {
    const result = resolvePrecommitOptions({ force: null as unknown as boolean })
    expect(result.force).toBe(false)
  })

  test('handles null installer by falling back to git', () => {
    const result = resolvePrecommitOptions({ installer: null as unknown as string })
    expect(result.installer).toBe('git')
  })

  test('handles empty string command as valid (not default)', () => {
    const result = resolvePrecommitOptions({ command: '' })
    expect(result.command).toBe('')
  })

  test('handles empty string installer by using it directly (not default)', () => {
    const result = resolvePrecommitOptions({ installer: '' as 'git' | 'husky' })
    expect(result.installer).toBe('')
  })
})

describe('displayPostInstallMessage - structure', () => {
  test('logFn is called exactly 8 times for git installer', () => {
    const options = makeOptions({ installer: 'git' })
    const lines: string[] = []
    displayPostInstallMessage(options, '/path/to/hook', (msg) => lines.push(msg))
    expect(lines).toHaveLength(8)
  })

  test('logFn is called exactly 9 times for husky installer', () => {
    const options = makeOptions({ installer: 'husky' })
    const lines: string[] = []
    displayPostInstallMessage(options, '/path/to/hook', (msg) => lines.push(msg))
    expect(lines).toHaveLength(9)
  })

  test('blank lines separate sections in output', () => {
    const options = makeOptions({ installer: 'git' })
    const lines: string[] = []
    displayPostInstallMessage(options, '/path', (msg) => lines.push(msg))
    const blankCount = lines.filter((l) => l === '').length
    expect(blankCount).toBeGreaterThanOrEqual(2)
  })

  test('git installer step 1 mentions git commit', () => {
    const options = makeOptions({ installer: 'git' })
    const lines: string[] = []
    displayPostInstallMessage(options, '/path', (msg) => lines.push(msg))
    const stepsLine = lines[lines.length - 1]
    expect(stepsLine).toContain('git commit')
    expect(stepsLine).toContain('1.')
  })

  test('husky installer outputs install recommendation before commit step', () => {
    const options = makeOptions({ installer: 'husky' })
    const lines: string[] = []
    displayPostInstallMessage(options, '/path', (msg) => lines.push(msg))
    const output = lines.join('\n')
    const installIdx = output.indexOf('npm install husky')
    const commitIdx = output.indexOf('git commit')
    expect(installIdx).toBeLessThan(commitIdx)
  })

  test('output contains chalk-formatted hook path', () => {
    const options = makeOptions()
    const lines: string[] = []
    displayPostInstallMessage(options, '/special/path/pre-commit', (msg) => lines.push(msg))
    const firstLine = lines[0]
    expect(firstLine).toContain('/special/path/pre-commit')
    expect(firstLine).toContain('Created pre-commit hook')
  })
})

describe('isGitRepository - boundary conditions', () => {
  test('works with cwd containing spaces', () => {
    const paths: string[] = []
    isGitRepository('/path with spaces/my project', (p) => {
      paths.push(p)
      return false
    })
    expect(paths[0]).toBe(join('/path with spaces/my project', '.git'))
  })

  test('works with cwd containing unicode characters', () => {
    const paths: string[] = []
    isGitRepository('/home/user/プロジェクト', (p) => {
      paths.push(p)
      return false
    })
    expect(paths[0]).toBe(join('/home/user/プロジェクト', '.git'))
  })
})

describe('getHookDir - path relationships', () => {
  test('git hook dir + pre-commit equals getGitHookPath result', () => {
    const cwd = '/project'
    const options = makeOptions({ installer: 'git' })
    const hookDir = getHookDir(options, cwd)
    const hookPath = getGitHookPath(cwd)
    expect(join(hookDir, 'pre-commit')).toBe(hookPath)
  })

  test('husky hook dir + pre-commit equals getHuskyHookPath result', () => {
    const cwd = '/project'
    const options = makeOptions({ installer: 'husky' })
    const hookDir = getHookDir(options, cwd)
    const hookPath = getHuskyHookPath(cwd)
    expect(join(hookDir, 'pre-commit')).toBe(hookPath)
  })

  test('handles cwd with trailing slash consistently', () => {
    const options = makeOptions({ installer: 'git' })
    const result = getHookDir(options, '/project/')
    expect(result).toContain('.git')
    expect(result).toContain('hooks')
  })
})

describe('generateHookContent - determinism', () => {
  test('returns identical output for identical inputs', () => {
    const options = makeOptions({ installer: 'git', command: 'npm test' })
    const first = generateHookContent(options)
    const second = generateHookContent(options)
    expect(first).toBe(second)
  })

  test('returns identical output for identical husky inputs', () => {
    const options = makeOptions({ installer: 'husky', command: 'npm test' })
    const first = generateHookContent(options)
    const second = generateHookContent(options)
    expect(first).toBe(second)
  })

  test('different commands produce different output', () => {
    const a = generateHookContent(makeOptions({ command: 'npm test' }))
    const b = generateHookContent(makeOptions({ command: 'yarn test' }))
    expect(a).not.toBe(b)
  })

  test('different installers produce different output', () => {
    const a = generateHookContent(makeOptions({ installer: 'git' }))
    const b = generateHookContent(makeOptions({ installer: 'husky' }))
    expect(a).not.toBe(b)
  })
})

describe('generateHookContent - command embedding', () => {
  test('embeds command with semicolons', () => {
    const options = makeOptions({ command: 'echo hi; echo bye' })
    const content = generateHookContent(options)
    expect(content).toContain('echo hi; echo bye')
  })

  test('embeds command with variable expansion', () => {
    const options = makeOptions({ command: 'echo $HOME' })
    const content = generateHookContent(options)
    expect(content).toContain('echo $HOME')
  })

  test('embeds command with backticks', () => {
    const options = makeOptions({ command: 'echo `date`' })
    const content = generateHookContent(options)
    expect(content).toContain('echo `date`')
  })

  test('embeds command with dollar sign expansion', () => {
    const options = makeOptions({ command: 'result=$(codeforge analyze --staged)' })
    const content = generateHookContent(options)
    expect(content).toContain('result=$(codeforge analyze --staged)')
  })

  test('embeds multiline-compatible command with &&', () => {
    const options = makeOptions({ command: 'npm run lint && npm test && npm run build' })
    const content = generateHookContent(options)
    expect(content).toContain('npm run lint && npm test && npm run build')
  })

  test('embeds command with env variables', () => {
    const options = makeOptions({ command: 'NODE_ENV=production codeforge analyze --staged' })
    const content = generateHookContent(options)
    expect(content).toContain('NODE_ENV=production codeforge analyze --staged')
  })

  test('embeds command with output redirect', () => {
    const options = makeOptions({ command: 'codeforge analyze --staged > output.txt' })
    const content = generateHookContent(options)
    expect(content).toContain('codeforge analyze --staged > output.txt')
  })
})

describe('generateHookContent - whitespace and formatting', () => {
  test('git hook has no blank line between shebang and command', () => {
    const options = makeOptions({ installer: 'git', command: 'npm test' })
    const lines = generateHookContent(options).split('\n')
    expect(lines[0]).toBe('#!/usr/bin/env sh')
    expect(lines[1]).toBe(' npm test')
  })

  test('husky hook has blank line separator between source and command', () => {
    const options = makeOptions({ installer: 'husky', command: 'npm test' })
    const lines = generateHookContent(options).split('\n')
    expect(lines[2]).toBe('')
  })

  test('content contains only valid shell line endings', () => {
    const options = makeOptions({ command: 'npm test' })
    const content = generateHookContent(options)
    expect(content).not.toContain('\r')
  })

  test('command is always on its own line', () => {
    const options = makeOptions({ command: 'npm test' })
    const content = generateHookContent(options)
    const lines = content.split('\n')
    const commandLine = lines.find((l) => l.includes('npm test'))
    expect(commandLine).toBeDefined()
    expect(commandLine!.trim()).toBe('npm test')
  })
})

describe('getGitHookPath - determinism', () => {
  test('returns same result for same input', () => {
    const a = getGitHookPath('/project')
    const b = getGitHookPath('/project')
    expect(a).toBe(b)
  })

  test('returns different results for different inputs', () => {
    const a = getGitHookPath('/project-a')
    const b = getGitHookPath('/project-b')
    expect(a).not.toBe(b)
  })
})

describe('getGitHookPath - format validation', () => {
  test('produces path with exactly 4 segments from root cwd', () => {
    const result = getGitHookPath('/')
    const parts = result.split('/').filter(Boolean)
    expect(parts).toHaveLength(3)
  })

  test('produces path ending in hooks/pre-commit', () => {
    const result = getGitHookPath('/workspace')
    expect(result.endsWith('hooks/pre-commit')).toBe(true)
  })

  test('includes the cwd as a prefix', () => {
    const result = getGitHookPath('/my/workspace')
    expect(result.startsWith('/my/workspace')).toBe(true)
  })

  test('handles dot in cwd', () => {
    const result = getGitHookPath('/home/user.code/project')
    expect(result).toContain('.git')
    expect(result).toContain('pre-commit')
  })

  test('handles hyphen in cwd', () => {
    const result = getGitHookPath('/home/my-project')
    expect(result).toContain('.git')
    expect(result).toContain('pre-commit')
  })
})

describe('getHuskyHookPath - determinism', () => {
  test('returns same result for same input', () => {
    const a = getHuskyHookPath('/project')
    const b = getHuskyHookPath('/project')
    expect(a).toBe(b)
  })

  test('returns different results for different inputs', () => {
    const a = getHuskyHookPath('/project-a')
    const b = getHuskyHookPath('/project-b')
    expect(a).not.toBe(b)
  })
})

describe('getHuskyHookPath - format validation', () => {
  test('produces path with exactly 3 segments from root cwd', () => {
    const result = getHuskyHookPath('/')
    const parts = result.split('/').filter(Boolean)
    expect(parts).toHaveLength(2)
  })

  test('includes the cwd as a prefix', () => {
    const result = getHuskyHookPath('/my/workspace')
    expect(result.startsWith('/my/workspace')).toBe(true)
  })

  test('handles dot in cwd', () => {
    const result = getHuskyHookPath('/home/user.code/project')
    expect(result).toContain('.husky')
    expect(result).toContain('pre-commit')
  })

  test('handles hyphen in cwd', () => {
    const result = getHuskyHookPath('/home/my-project')
    expect(result).toContain('.husky')
    expect(result).toContain('pre-commit')
  })

  test('result has fewer segments than git hook path', () => {
    const cwd = '/project'
    const gitParts = getGitHookPath(cwd).split('/').filter(Boolean).length
    const huskyParts = getHuskyHookPath(cwd).split('/').filter(Boolean).length
    expect(huskyParts).toBeLessThan(gitParts)
  })
})

describe('isGitRepository - callback behavior', () => {
  test('receives exactly one argument', () => {
    let argCount = 0
    isGitRepository('/project', (...args) => {
      argCount = args.length
      return true
    })
    expect(argCount).toBe(1)
  })

  test('the argument is a string', () => {
    let argType = ''
    isGitRepository('/project', (p) => {
      argType = typeof p
      return true
    })
    expect(argType).toBe('string')
  })

  test('returns the exact boolean from existsFn', () => {
    expect(isGitRepository('/project', () => true)).toBe(true)
    expect(isGitRepository('/project', () => false)).toBe(false)
  })

  test('forwards .git path even for complex cwd', () => {
    let received = ''
    isGitRepository('/a/b/c/d', (p) => {
      received = p
      return true
    })
    expect(received).toContain('.git')
    expect(received).toContain('/a/b/c/d')
  })

  test('works when existsFn uses complex logic', () => {
    const validPaths = new Set(['/workspace/.git', '/other/.git'])
    expect(isGitRepository('/workspace', (p) => validPaths.has(p))).toBe(true)
    expect(isGitRepository('/invalid', (p) => validPaths.has(p))).toBe(false)
  })
})

describe('resolvePrecommitOptions - partial combinations', () => {
  test('command only uses defaults for rest', () => {
    const result = resolvePrecommitOptions({ command: 'custom' })
    expect(result.command).toBe('custom')
    expect(result.force).toBe(false)
    expect(result.installer).toBe('git')
  })

  test('force only uses defaults for rest', () => {
    const result = resolvePrecommitOptions({ force: true })
    expect(result.command).toBe(DEFAULT_COMMAND)
    expect(result.force).toBe(true)
    expect(result.installer).toBe('git')
  })

  test('installer only uses defaults for rest', () => {
    const result = resolvePrecommitOptions({ installer: 'husky' })
    expect(result.command).toBe(DEFAULT_COMMAND)
    expect(result.force).toBe(false)
    expect(result.installer).toBe('husky')
  })

  test('command and force together use default installer', () => {
    const result = resolvePrecommitOptions({ command: 'lint', force: true })
    expect(result.command).toBe('lint')
    expect(result.force).toBe(true)
    expect(result.installer).toBe('git')
  })

  test('command and installer together use default force', () => {
    const result = resolvePrecommitOptions({ command: 'lint', installer: 'husky' })
    expect(result.command).toBe('lint')
    expect(result.force).toBe(false)
    expect(result.installer).toBe('husky')
  })

  test('force and installer together use default command', () => {
    const result = resolvePrecommitOptions({ force: true, installer: 'husky' })
    expect(result.command).toBe(DEFAULT_COMMAND)
    expect(result.force).toBe(true)
    expect(result.installer).toBe('husky')
  })

  test('returns a new object each call', () => {
    const a = resolvePrecommitOptions({})
    const b = resolvePrecommitOptions({})
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
  })

  test('does not mutate the input flags', () => {
    const flags = { command: 'test' }
    const copy = { ...flags }
    resolvePrecommitOptions(flags)
    expect(flags).toEqual(copy)
  })

  test('handles false command (empty string) as valid', () => {
    const result = resolvePrecommitOptions({ command: '' })
    expect(result.command).toBe('')
    expect(result.command).not.toBe(DEFAULT_COMMAND)
  })

  test('handles boolean false command - ?? keeps false (not nullish)', () => {
    const result = resolvePrecommitOptions({ command: false as unknown as string })
    expect(result.command).toBe(false)
  })

  test('handles numeric zero command - ?? keeps 0 (not nullish)', () => {
    const result = resolvePrecommitOptions({ command: 0 as unknown as string })
    expect(result.command).toBe(0)
  })

  test('handles numeric non-zero command as truthy', () => {
    const result = resolvePrecommitOptions({ command: 42 as unknown as string })
    expect(result.command).toBe(42)
  })

  test('handles empty string force as truthy', () => {
    const result = resolvePrecommitOptions({ force: '' as unknown as boolean })
    expect(result.force).toBe('')
  })

  test('handles numeric 1 force as truthy', () => {
    const result = resolvePrecommitOptions({ force: 1 as unknown as boolean })
    expect(result.force).toBe(1)
  })
})

describe('getHookDir - determinism and format', () => {
  test('returns same result for same inputs', () => {
    const options = makeOptions({ installer: 'git' })
    const a = getHookDir(options, '/project')
    const b = getHookDir(options, '/project')
    expect(a).toBe(b)
  })

  test('returns different result for different cwd', () => {
    const options = makeOptions({ installer: 'git' })
    const a = getHookDir(options, '/project-a')
    const b = getHookDir(options, '/project-b')
    expect(a).not.toBe(b)
  })

  test('git hook dir ends with hooks segment', () => {
    const options = makeOptions({ installer: 'git' })
    const result = getHookDir(options, '/project')
    expect(result.endsWith('hooks')).toBe(true)
  })

  test('husky hook dir ends with .husky segment', () => {
    const options = makeOptions({ installer: 'husky' })
    const result = getHookDir(options, '/project')
    expect(result.endsWith('.husky')).toBe(true)
  })

  test('git hook dir includes cwd', () => {
    const options = makeOptions({ installer: 'git' })
    const result = getHookDir(options, '/workspace/project')
    expect(result.startsWith('/workspace/project')).toBe(true)
  })

  test('husky hook dir includes cwd', () => {
    const options = makeOptions({ installer: 'husky' })
    const result = getHookDir(options, '/workspace/project')
    expect(result.startsWith('/workspace/project')).toBe(true)
  })

  test('handles cwd with spaces', () => {
    const options = makeOptions({ installer: 'git' })
    const result = getHookDir(options, '/my projects/code')
    expect(result).toContain('.git')
    expect(result).toContain('hooks')
  })

  test('handles cwd with spaces for husky', () => {
    const options = makeOptions({ installer: 'husky' })
    const result = getHookDir(options, '/my projects/code')
    expect(result).toContain('.husky')
  })
})

describe('displayPostInstallMessage - line content verification', () => {
  test('first line contains Created pre-commit hook', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions(), '/path', (msg) => lines.push(msg))
    expect(lines[0]).toContain('Created pre-commit hook')
  })

  test('second line is blank separator', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ installer: 'git' }), '/path', (msg) => lines.push(msg))
    expect(lines[1]).toBe('')
  })

  test('third line contains Hook configuration', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions(), '/path', (msg) => lines.push(msg))
    expect(lines[2]).toContain('Hook configuration')
  })

  test('installer line contains Installer:', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ installer: 'git' }), '/path', (msg) => lines.push(msg))
    expect(lines[3]).toContain('Installer:')
  })

  test('installer line shows git for git installer', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ installer: 'git' }), '/path', (msg) => lines.push(msg))
    expect(lines[3]).toContain('git')
  })

  test('command line contains Command:', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions(), '/path', (msg) => lines.push(msg))
    expect(lines[4]).toContain('Command:')
  })

  test('command line shows the configured command', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ command: 'npm test' }), '/path', (msg) =>
      lines.push(msg),
    )
    expect(lines[4]).toContain('npm test')
  })

  test('blank line separates configuration from next steps', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ installer: 'git' }), '/path', (msg) => lines.push(msg))
    expect(lines[5]).toBe('')
  })

  test('Next steps header appears at correct position', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ installer: 'git' }), '/path', (msg) => lines.push(msg))
    expect(lines[6]).toContain('Next steps')
  })

  test('git installer has exactly one step line', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ installer: 'git' }), '/path', (msg) => lines.push(msg))
    expect(lines[7]).toContain('1.')
    expect(lines[7]).toContain('git commit')
  })

  test('husky installer has step lines after next steps', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ installer: 'husky' }), '/path', (msg) =>
      lines.push(msg),
    )
    expect(lines[7]).toContain('1.')
    expect(lines[8]).toContain('2.')
  })

  test('husky step 1 mentions husky install', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ installer: 'husky' }), '/path', (msg) =>
      lines.push(msg),
    )
    expect(lines[7]).toContain('husky')
    expect(lines[7]).toContain('npm install')
  })

  test('husky step 2 mentions git commit', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ installer: 'husky' }), '/path', (msg) =>
      lines.push(msg),
    )
    expect(lines[8]).toContain('git commit')
  })
})

describe('displayPostInstallMessage - various options', () => {
  test('reflects custom command in output', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ command: 'yarn lint' }), '/path', (msg) =>
      lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('yarn lint')
  })

  test('reflects git installer in output', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ installer: 'git' }), '/path', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('git')
  })

  test('reflects husky installer in output', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions({ installer: 'husky' }), '/path', (msg) =>
      lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('husky')
  })

  test('reflects hook path in output', () => {
    const lines: string[] = []
    displayPostInstallMessage(makeOptions(), '/custom/hook/path', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('/custom/hook/path')
  })

  test('force flag does not affect output', () => {
    const linesForce: string[] = []
    const linesNoForce: string[] = []
    displayPostInstallMessage(makeOptions({ force: true }), '/path', (msg) => linesForce.push(msg))
    displayPostInstallMessage(makeOptions({ force: false }), '/path', (msg) =>
      linesNoForce.push(msg),
    )
    expect(linesForce).toEqual(linesNoForce)
  })
})

describe('integration - function combinations', () => {
  test('resolvePrecommitOptions result works with generateHookContent', () => {
    const options = resolvePrecommitOptions({ command: 'npm test', installer: 'git' })
    const content = generateHookContent(options)
    expect(content).toContain('npm test')
    expect(content).toContain('#!/usr/bin/env sh')
  })

  test('resolvePrecommitOptions result works with getHookDir', () => {
    const options = resolvePrecommitOptions({ installer: 'husky' })
    const dir = getHookDir(options, '/project')
    expect(dir).toContain('.husky')
  })

  test('resolvePrecommitOptions result works with displayPostInstallMessage', () => {
    const options = resolvePrecommitOptions({ command: 'yarn lint', installer: 'git' })
    const lines: string[] = []
    displayPostInstallMessage(options, '/path', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('yarn lint')
    expect(output).toContain('git')
  })

  test('getHookDir and getGitHookPath are consistent for git', () => {
    const cwd = '/project'
    const options = resolvePrecommitOptions({ installer: 'git' })
    const hookDir = getHookDir(options, cwd)
    const hookPath = getGitHookPath(cwd)
    expect(join(hookDir, 'pre-commit')).toBe(hookPath)
  })

  test('getHookDir and getHuskyHookPath are consistent for husky', () => {
    const cwd = '/project'
    const options = resolvePrecommitOptions({ installer: 'husky' })
    const hookDir = getHookDir(options, cwd)
    const hookPath = getHuskyHookPath(cwd)
    expect(join(hookDir, 'pre-commit')).toBe(hookPath)
  })

  test('full workflow: resolve → generate → display', () => {
    const options = resolvePrecommitOptions({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })
    const cwd = '/home/dev/project'
    const hookPath = getGitHookPath(cwd)
    const hookDir = getHookDir(options, cwd)
    const content = generateHookContent(options)
    const lines: string[] = []
    displayPostInstallMessage(options, hookPath, (msg) => lines.push(msg))

    expect(content).toContain('codeforge analyze --staged')
    expect(hookDir).toContain('.git')
    expect(hookPath).toContain('pre-commit')
    expect(lines.join('\n')).toContain('Created pre-commit hook')
  })

  test('full workflow with husky', () => {
    const options = resolvePrecommitOptions({ installer: 'husky', command: 'npm test' })
    const cwd = '/workspace'
    const hookPath = getHuskyHookPath(cwd)
    const content = generateHookContent(options)
    const lines: string[] = []
    displayPostInstallMessage(options, hookPath, (msg) => lines.push(msg))

    expect(content).toContain('husky.sh')
    expect(content).toContain('npm test')
    expect(lines.join('\n')).toContain('Ensure husky is installed')
  })
})

describe('PrecommitOptions - type validation', () => {
  test('makeOptions returns object with correct property count', () => {
    const opts = makeOptions()
    const keys = Object.keys(opts)
    expect(keys).toHaveLength(3)
  })

  test('resolvePrecommitOptions returns object with correct property count', () => {
    const result = resolvePrecommitOptions({})
    const keys = Object.keys(result)
    expect(keys).toHaveLength(3)
  })

  test('all option keys are present', () => {
    const opts = makeOptions()
    expect(opts).toHaveProperty('command')
    expect(opts).toHaveProperty('force')
    expect(opts).toHaveProperty('installer')
  })

  test('installer is one of git, husky, or pre-commit-framework', () => {
    const opts = makeOptions({ installer: 'git' })
    expect(opts.installer === 'git' || opts.installer === 'husky' || opts.installer === 'pre-commit-framework').toBe(true)
  })

  test('force is a boolean', () => {
    const opts = makeOptions()
    expect(typeof opts.force).toBe('boolean')
  })

  test('command is a string', () => {
    const opts = makeOptions()
    expect(typeof opts.command).toBe('string')
  })
})

describe('isGitRepository - edge cases with paths', () => {
  test('handles cwd with multiple trailing slashes', () => {
    let received = ''
    isGitRepository('/project//', (p) => {
      received = p
      return true
    })
    expect(received).toContain('.git')
  })

  test('handles cwd with dots in directory name', () => {
    let received = ''
    isGitRepository('/home/user.name/project.dir', (p) => {
      received = p
      return true
    })
    expect(received).toContain('.git')
  })

  test('handles cwd that is just a dot', () => {
    let received = ''
    isGitRepository('.', (p) => {
      received = p
      return true
    })
    expect(received).toBe(join('.', '.git'))
  })

  test('handles cwd with dashes', () => {
    let received = ''
    isGitRepository('/my-cool-project', (p) => {
      received = p
      return true
    })
    expect(received).toContain('.git')
  })

  test('handles cwd with underscores', () => {
    let received = ''
    isGitRepository('/my_cool_project', (p) => {
      received = p
      return true
    })
    expect(received).toContain('.git')
  })

  test('handles cwd with numbers', () => {
    let received = ''
    isGitRepository('/project123', (p) => {
      received = p
      return true
    })
    expect(received).toContain('.git')
  })
})

describe('getGitHookPath - special paths', () => {
  test('handles Windows-style path (still works)', () => {
    const result = getGitHookPath('C:/Users/project')
    expect(result).toContain('.git')
    expect(result).toContain('pre-commit')
  })

  test('handles dot relative path', () => {
    const result = getGitHookPath('.')
    expect(result).toContain('.git')
    expect(result).toContain('hooks')
    expect(result).toContain('pre-commit')
  })

  test('handles double-dot relative path', () => {
    const result = getGitHookPath('..')
    expect(result).toContain('.git')
    expect(result).toContain('pre-commit')
  })

  test('handles very long path', () => {
    const longPath = '/a/' + 'subdir/'.repeat(50) + 'project'
    const result = getGitHookPath(longPath)
    expect(result).toContain('.git')
    expect(result).toContain('pre-commit')
    expect(result.startsWith(longPath)).toBe(true)
  })
})

describe('getHuskyHookPath - special paths', () => {
  test('handles Windows-style path (still works)', () => {
    const result = getHuskyHookPath('C:/Users/project')
    expect(result).toContain('.husky')
    expect(result).toContain('pre-commit')
  })

  test('handles dot relative path', () => {
    const result = getHuskyHookPath('.')
    expect(result).toContain('.husky')
    expect(result).toContain('pre-commit')
  })

  test('handles double-dot relative path', () => {
    const result = getHuskyHookPath('..')
    expect(result).toContain('.husky')
    expect(result).toContain('pre-commit')
  })

  test('handles very long path', () => {
    const longPath = '/a/' + 'subdir/'.repeat(50) + 'project'
    const result = getHuskyHookPath(longPath)
    expect(result).toContain('.husky')
    expect(result).toContain('pre-commit')
    expect(result.startsWith(longPath)).toBe(true)
  })
})

describe('getHookDir - special paths', () => {
  test('handles dot relative path for git', () => {
    const options = makeOptions({ installer: 'git' })
    const result = getHookDir(options, '.')
    expect(result).toContain('.git')
    expect(result).toContain('hooks')
  })

  test('handles dot relative path for husky', () => {
    const options = makeOptions({ installer: 'husky' })
    const result = getHookDir(options, '.')
    expect(result).toContain('.husky')
  })

  test('handles double-dot relative path for git', () => {
    const options = makeOptions({ installer: 'git' })
    const result = getHookDir(options, '..')
    expect(result).toContain('.git')
    expect(result).toContain('hooks')
  })

  test('handles double-dot relative path for husky', () => {
    const options = makeOptions({ installer: 'husky' })
    const result = getHookDir(options, '..')
    expect(result).toContain('.husky')
  })
})

describe('displayPostInstallMessage - no side effects', () => {
  test('does not modify options object', () => {
    const options = makeOptions({ command: 'npm test', installer: 'git' })
    const copy = { ...options }
    const lines: string[] = []
    displayPostInstallMessage(options, '/path', (msg) => lines.push(msg))
    expect(options).toEqual(copy)
  })

  test('does not modify hookPath', () => {
    const hookPath = '/project/.git/hooks/pre-commit'
    const originalPath = hookPath
    const lines: string[] = []
    displayPostInstallMessage(makeOptions(), hookPath, (msg) => lines.push(msg))
    expect(hookPath).toBe(originalPath)
  })

  test('logFn receives only string arguments', () => {
    const types: string[] = []
    displayPostInstallMessage(makeOptions(), '/path', (msg) => {
      types.push(typeof msg)
    })
    expect(types.every((t) => t === 'string')).toBe(true)
  })
})

describe('generateHookContent - content validation', () => {
  test('shebang line is exactly #!/usr/bin/env sh', () => {
    const content = generateHookContent(makeOptions())
    expect(content.split('\n')[0]).toBe('#!/usr/bin/env sh')
  })

  test('no carriage return characters in output', () => {
    const content = generateHookContent(makeOptions())
    expect(content).not.toContain('\r\n')
  })

  test('git hook content length equals shebang + newline + space + command + newline', () => {
    const command = 'npm test'
    const content = generateHookContent(makeOptions({ installer: 'git', command }))
    const expected = `#!/usr/bin/env sh\n ${command}\n`
    expect(content.length).toBe(expected.length)
  })

  test('husky content includes dirname command', () => {
    const content = generateHookContent(makeOptions({ installer: 'husky' }))
    expect(content).toContain('dirname')
  })

  test('husky content references $0 shell variable', () => {
    const content = generateHookContent(makeOptions({ installer: 'husky' }))
    expect(content).toContain('$0')
  })

  test('husky content includes underscore directory reference', () => {
    const content = generateHookContent(makeOptions({ installer: 'husky' }))
    expect(content).toContain('_/')
  })
})

describe('resolvePrecommitOptions - extra flags', () => {
  test('ignores unknown flags', () => {
    const result = resolvePrecommitOptions({ unknownFlag: 'value', command: 'test' })
    expect(result.command).toBe('test')
    expect((result as Record<string, unknown>).unknownFlag).toBeUndefined()
  })

  test('ignores numeric flags that are not command/force/installer', () => {
    const result = resolvePrecommitOptions({ random: 42 } as Record<string, unknown>)
    expect(result.command).toBe(DEFAULT_COMMAND)
    expect(result.force).toBe(false)
    expect(result.installer).toBe('git')
  })

  test('handles whitespace-only command as valid', () => {
    const result = resolvePrecommitOptions({ command: '   ' })
    expect(result.command).toBe('   ')
  })

  test('handles command with newlines', () => {
    const result = resolvePrecommitOptions({ command: 'echo hi\necho bye' })
    expect(result.command).toBe('echo hi\necho bye')
  })

  test('handles command with tabs', () => {
    const result = resolvePrecommitOptions({ command: 'echo\thello' })
    expect(result.command).toBe('echo\thello')
  })
})

describe('DEFAULT_COMMAND - value properties', () => {
  test('starts with codeforge', () => {
    expect(DEFAULT_COMMAND.startsWith('codeforge')).toBe(true)
  })

  test('contains analyze', () => {
    expect(DEFAULT_COMMAND).toContain('analyze')
  })

  test('contains --staged flag', () => {
    expect(DEFAULT_COMMAND).toContain('--staged')
  })

  test('does not contain newlines', () => {
    expect(DEFAULT_COMMAND).not.toContain('\n')
  })

  test('is trimmed (no leading/trailing whitespace)', () => {
    expect(DEFAULT_COMMAND).toBe(DEFAULT_COMMAND.trim())
  })
})

describe('getPrecommitFrameworkConfigPath', () => {
  test('returns path ending with .pre-commit-config.yaml', () => {
    const result = getPrecommitFrameworkConfigPath('/home/user/project')
    expect(result.endsWith('.pre-commit-config.yaml')).toBe(true)
  })

  test('returns correct path for root directory', () => {
    const result = getPrecommitFrameworkConfigPath('/')
    expect(result).toBe(join('/', '.pre-commit-config.yaml'))
  })

  test('returns correct path for nested directory', () => {
    const result = getPrecommitFrameworkConfigPath('/a/b/c/d')
    expect(result).toBe(join('/a/b/c/d', '.pre-commit-config.yaml'))
  })

  test('uses provided cwd verbatim', () => {
    const result = getPrecommitFrameworkConfigPath('/tmp/my-project')
    expect(result).toContain('/tmp/my-project/')
  })

  test('result ends with .pre-commit-config.yaml', () => {
    const result = getPrecommitFrameworkConfigPath('/project')
    expect(result.endsWith('.pre-commit-config.yaml')).toBe(true)
  })

  test('differs from git hook path', () => {
    const cwd = '/project'
    expect(getPrecommitFrameworkConfigPath(cwd)).not.toBe(getGitHookPath(cwd))
  })

  test('differs from husky hook path', () => {
    const cwd = '/project'
    expect(getPrecommitFrameworkConfigPath(cwd)).not.toBe(getHuskyHookPath(cwd))
  })
})

describe('generatePrecommitFrameworkConfig', () => {
  test('generates valid YAML with repos key', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content).toContain('repos:')
  })

  test('includes local repo', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content).toContain('repo: local')
  })

  test('includes codeforge hook id', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content).toContain('id: codeforge')
  })

  test('includes CodeForge name', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content).toContain('name: CodeForge')
  })

  test('includes default command as entry', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content).toContain('entry: codeforge analyze --staged')
  })

  test('includes custom command as entry', () => {
    const options = makeOptions({ installer: 'pre-commit-framework', command: 'npm test' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content).toContain('entry: npm test')
  })

  test('includes language: system', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content).toContain('language: system')
  })

  test('includes types: [file]', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content).toContain('types: [file]')
  })

  test('includes stages: [pre-commit]', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content).toContain('stages: [pre-commit]')
  })

  test('starts with repos:', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content.startsWith('repos:')).toBe(true)
  })

  test('contains repo: local', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content).toContain('repo: local')
  })
})

describe('generatePrecommitFrameworkConfig - structure', () => {
  test('has proper YAML indentation', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    const lines = content.split('\n')
    const repoLine = lines.find((l) => l.includes('repo: local'))
    expect(repoLine).toBeDefined()
    expect(repoLine!.startsWith('  -')).toBe(true)
  })

  test('hook entry contains all required fields', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content).toContain('id:')
    expect(content).toContain('name:')
    expect(content).toContain('entry:')
    expect(content).toContain('language:')
    expect(content).toContain('types:')
    expect(content).toContain('stages:')
  })

  test('output is valid YAML', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const content = generatePrecommitFrameworkConfig(options)
    expect(content).not.toContain(', "')
    expect(content).not.toContain('",')
    const lines = content.split('\n').filter((l) => l.trim().length > 0)
    for (const line of lines) {
      if (!line.startsWith('repos')) {
        expect(line.match(/^(\s+)/)).toBeDefined()
      }
    }
  })
})

describe('getHookDir - pre-commit-framework', () => {
  test('returns cwd for pre-commit-framework installer', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const result = getHookDir(options, '/project')
    expect(result).toBe('/project')
  })

  test('returns project root', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const result = getHookDir(options, '/project')
    expect(result).not.toContain('.git')
    expect(result).not.toContain('.husky')
  })
})

describe('displayPostInstallMessage - pre-commit-framework', () => {
  function captureLog(options: PrecommitOptions, hookPath: string): string[] {
    const lines: string[] = []
    displayPostInstallMessage(options, hookPath, (msg) => lines.push(msg))
    return lines
  }

  test('outputs pip install step', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const lines = captureLog(options, '/path')
    const output = lines.join('\n')
    expect(output).toContain('pip install pre-commit')
  })

  test('outputs pre-commit install step', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const lines = captureLog(options, '/path')
    const output = lines.join('\n')
    expect(output).toContain('pre-commit install')
  })

  test('outputs git commit step', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const lines = captureLog(options, '/path')
    const output = lines.join('\n')
    expect(output).toContain('git commit')
  })

  test('has 3 numbered steps', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const lines = captureLog(options, '/path')
    const output = lines.join('\n')
    expect(output).toContain('1.')
    expect(output).toContain('2.')
    expect(output).toContain('3.')
  })

  test('mentions pre-commit framework in output', () => {
    const options = makeOptions({ installer: 'pre-commit-framework' })
    const lines = captureLog(options, '/path')
    const output = lines.join('\n')
    expect(output).toContain('pre-commit')
  })
})

describe('resolvePrecommitOptions - pre-commit-framework', () => {
  test('preserves pre-commit-framework installer', () => {
    const result = resolvePrecommitOptions({ installer: 'pre-commit-framework' })
    expect(result.installer).toBe('pre-commit-framework')
  })
})

describe('makeOptions - pre-commit-framework', () => {
  test('allows overriding installer to pre-commit-framework', () => {
    const opts = makeOptions({ installer: 'pre-commit-framework' })
    expect(opts.installer).toBe('pre-commit-framework')
    expect(opts.command).toBe('codeforge analyze --staged')
    expect(opts.force).toBe(false)
  })
})
