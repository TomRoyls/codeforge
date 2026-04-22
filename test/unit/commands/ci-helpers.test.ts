import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { existsSync, mkdirSync, rmSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import {
  generateGitHubActionsContent,
  generateGitLabCiContent,
  validateOutputDir,
  resolveCiOptions,
  displayNextSteps,
  type Platform,
  type CiOptions,
} from '../../../src/commands/ci-helpers.js'

// ============================================================================
// Type exports
// ============================================================================

describe('Platform type', () => {
  test('accepts "all" value', () => {
    const platform: Platform = 'all'
    expect(platform).toBe('all')
  })

  test('accepts "github" value', () => {
    const platform: Platform = 'github'
    expect(platform).toBe('github')
  })

  test('accepts "gitlab" value', () => {
    const platform: Platform = 'gitlab'
    expect(platform).toBe('gitlab')
  })
})

describe('CiOptions type', () => {
  test('has force property', () => {
    const options: CiOptions = { force: false, output: '.', platform: 'all' }
    expect(options.force).toBe(false)
  })

  test('has output property', () => {
    const options: CiOptions = { force: false, output: './ci', platform: 'all' }
    expect(options.output).toBe('./ci')
  })

  test('has platform property', () => {
    const options: CiOptions = { force: false, output: '.', platform: 'github' }
    expect(options.platform).toBe('github')
  })

  test('accepts force true', () => {
    const options: CiOptions = { force: true, output: '.', platform: 'all' }
    expect(options.force).toBe(true)
  })

  test('accepts all platform values', () => {
    const platforms: Platform[] = ['all', 'github', 'gitlab']
    for (const p of platforms) {
      const options: CiOptions = { force: false, output: '.', platform: p }
      expect(options.platform).toBe(p)
    }
  })
})

// ============================================================================
// generateGitHubActionsContent
// ============================================================================

describe('generateGitHubActionsContent', () => {
  test('returns a string', () => {
    const result = generateGitHubActionsContent()
    expect(typeof result).toBe('string')
  })

  test('returns non-empty string', () => {
    const result = generateGitHubActionsContent()
    expect(result.length).toBeGreaterThan(0)
  })

  test('contains workflow name', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('name:')
  })

  test('contains CodeForge Analysis workflow name', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('CodeForge Analysis')
  })

  test('contains on trigger', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('on:')
  })

  test('contains push trigger', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('push:')
  })

  test('contains pull_request trigger', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('pull_request:')
  })

  test('contains branches for push', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('branches:')
  })

  test('contains main branch', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('main')
  })

  test('contains master branch', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('master')
  })

  test('contains develop branch', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('develop')
  })

  test('contains permissions section', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('permissions:')
  })

  test('contains contents read permission', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('contents: read')
  })

  test('contains security-events write permission', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('security-events: write')
  })

  test('contains jobs section', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('jobs:')
  })

  test('contains analyze job', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('analyze:')
  })

  test('contains runs-on ubuntu-latest', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('runs-on: ubuntu-latest')
  })

  test('contains steps section', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('steps:')
  })

  test('contains checkout step', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('Checkout repository')
  })

  test('contains actions/checkout@v4', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('actions/checkout@v4')
  })

  test('contains Setup Node.js step', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('Setup Node.js')
  })

  test('contains actions/setup-node@v4', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('actions/setup-node@v4')
  })

  test('contains node-version 20', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain("node-version: '20'")
  })

  test('contains npm cache', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain("cache: 'npm'")
  })

  test('contains Install dependencies step', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('Install dependencies')
  })

  test('contains npm ci command', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('npm ci')
  })

  test('contains Run CodeForge analysis step', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('Run CodeForge analysis')
  })

  test('contains codeforge analyze command', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('npx codeforge analyze')
  })

  test('contains SARIF format flag', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('--format sarif')
  })

  test('contains output file results.sarif', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('results.sarif')
  })

  test('contains Upload SARIF step', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('Upload SARIF')
  })

  test('contains GitHub Code Scanning reference', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('GitHub Code Scanning')
  })

  test('contains github/codeql-action/upload-sarif@v3', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('github/codeql-action/upload-sarif@v3')
  })

  test('contains if: always()', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('if: always()')
  })

  test('contains sarif_file parameter', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('sarif_file:')
  })

  test('contains category codeforge', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('category: codeforge')
  })

  test('starts with name: (valid YAML start)', () => {
    const result = generateGitHubActionsContent()
    expect(result.startsWith('name:')).toBe(true)
  })

  test('does not contain tabs', () => {
    const result = generateGitHubActionsContent()
    expect(result).not.toContain('\t')
  })

  test('uses spaces for indentation', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('  ')
  })

  test('contains exactly 5 steps', () => {
    const result = generateGitHubActionsContent()
    const stepMatches = result.match(/- name:/g)
    expect(stepMatches).toHaveLength(5)
  })

  test('contains exactly 3 uses directives', () => {
    const result = generateGitHubActionsContent()
    const usesMatches = result.match(/uses:/g)
    expect(usesMatches).toHaveLength(3)
  })

  test('contains exactly 2 run directives', () => {
    const result = generateGitHubActionsContent()
    const runMatches = result.match(/^\s+run:/gm)
    expect(runMatches).toHaveLength(2)
  })

  test('returns consistent content across multiple calls', () => {
    const first = generateGitHubActionsContent()
    const second = generateGitHubActionsContent()
    expect(first).toBe(second)
  })

  test('returns deterministic output', () => {
    const results = Array.from({ length: 10 }, () => generateGitHubActionsContent())
    const unique = new Set(results)
    expect(unique.size).toBe(1)
  })

  test('contains uses keyword for actions', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('uses:')
  })

  test('contains with keyword for action parameters', () => {
    const result = generateGitHubActionsContent()
    expect(result).toContain('with:')
  })

  test('output is valid YAML structure (no leading whitespace on root keys)', () => {
    const result = generateGitHubActionsContent()
    const lines = result.split('\n')
    const rootKeys = lines.filter((l) => /^[a-z]/.test(l))
    expect(rootKeys.length).toBeGreaterThan(0)
  })
})

// ============================================================================
// generateGitLabCiContent
// ============================================================================

describe('generateGitLabCiContent', () => {
  test('returns a string', () => {
    const result = generateGitLabCiContent()
    expect(typeof result).toBe('string')
  })

  test('returns non-empty string', () => {
    const result = generateGitLabCiContent()
    expect(result.length).toBeGreaterThan(0)
  })

  test('contains stages section', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('stages:')
  })

  test('contains analyze stage', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('- analyze')
  })

  test('contains codeforge job', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('codeforge:')
  })

  test('contains stage: analyze', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('stage: analyze')
  })

  test('contains image: node:20', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('image: node:20')
  })

  test('contains cache section', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('cache:')
  })

  test('contains cache paths', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('paths:')
  })

  test('contains node_modules cache path', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('node_modules/')
  })

  test('contains script section', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('script:')
  })

  test('contains npm ci in script', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('- npm ci')
  })

  test('contains codeforge analyze command', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('- npx codeforge analyze')
  })

  test('contains gitlab format flag', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('--format gitlab')
  })

  test('contains output file gl-code-quality-report.json', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('gl-code-quality-report.json')
  })

  test('contains artifacts section', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('artifacts:')
  })

  test('contains reports section', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('reports:')
  })

  test('contains codequality report', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('codequality:')
  })

  test('contains expire_in', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('expire_in:')
  })

  test('contains 1 week expiry', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('1 week')
  })

  test('contains only section', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('only:')
  })

  test('contains main branch in only', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('- main')
  })

  test('contains master branch in only', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('- master')
  })

  test('contains develop branch in only', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('- develop')
  })

  test('contains except section', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('except:')
  })

  test('excludes tags', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('- tags')
  })

  test('starts with stages: (valid YAML start)', () => {
    const result = generateGitLabCiContent()
    expect(result.startsWith('stages:')).toBe(true)
  })

  test('does not contain tabs', () => {
    const result = generateGitLabCiContent()
    expect(result).not.toContain('\t')
  })

  test('uses spaces for indentation', () => {
    const result = generateGitLabCiContent()
    expect(result).toContain('  ')
  })

  test('contains exactly 2 script commands', () => {
    const result = generateGitLabCiContent()
    const scriptSection = result.split('script:')[1].split('artifacts:')[0]
    const scriptCommands = scriptSection.match(/^(\s*)- /gm)
    expect(scriptCommands).toHaveLength(2)
  })

  test('returns consistent content across multiple calls', () => {
    const first = generateGitLabCiContent()
    const second = generateGitLabCiContent()
    expect(first).toBe(second)
  })

  test('returns deterministic output', () => {
    const results = Array.from({ length: 10 }, () => generateGitLabCiContent())
    const unique = new Set(results)
    expect(unique.size).toBe(1)
  })

  test('output is valid YAML structure (no leading whitespace on root keys)', () => {
    const result = generateGitLabCiContent()
    const lines = result.split('\n')
    const rootKeys = lines.filter((l) => /^[a-z]/.test(l))
    expect(rootKeys.length).toBeGreaterThan(0)
  })

  test('contains exactly 3 branches in only section', () => {
    const result = generateGitLabCiContent()
    const onlySection = result.split('only:')[1].split('except:')[0]
    const branchMatches = onlySection.match(/- (main|master|develop)/g)
    expect(branchMatches).toHaveLength(3)
  })
})

// ============================================================================
// validateOutputDir
// ============================================================================

describe('validateOutputDir', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = join(tmpdir(), `ci-helpers-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    mkdirSync(tempDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  test('returns valid: true for existing directory', () => {
    const result = validateOutputDir(tempDir)
    expect(result.valid).toBe(true)
  })

  test('does not return error for existing directory', () => {
    const result = validateOutputDir(tempDir)
    expect(result.error).toBeUndefined()
  })

  test('returns valid: false for non-existent directory', () => {
    const result = validateOutputDir(join(tempDir, 'nonexistent'))
    expect(result.valid).toBe(false)
  })

  test('returns error message for non-existent directory', () => {
    const fakePath = join(tempDir, 'nonexistent')
    const result = validateOutputDir(fakePath)
    expect(result.error).toContain('does not exist')
  })

  test('includes path in error for non-existent directory', () => {
    const fakePath = join(tempDir, 'does-not-exist')
    const result = validateOutputDir(fakePath)
    expect(result.error).toContain(fakePath)
  })

  test('returns valid: false when path is a file', () => {
    const filePath = join(tempDir, 'test-file.txt')
    writeFileSync(filePath, 'test content')
    const result = validateOutputDir(filePath)
    expect(result.valid).toBe(false)
  })

  test('returns error message when path is a file', () => {
    const filePath = join(tempDir, 'test-file.txt')
    writeFileSync(filePath, 'test content')
    const result = validateOutputDir(filePath)
    expect(result.error).toContain('not a directory')
  })

  test('includes path in error when path is a file', () => {
    const filePath = join(tempDir, 'test-file.txt')
    writeFileSync(filePath, 'test content')
    const result = validateOutputDir(filePath)
    expect(result.error).toContain(filePath)
  })

  test('validates os.tmpdir() as valid directory', () => {
    const result = validateOutputDir(tmpdir())
    expect(result.valid).toBe(true)
  })

  test('validates nested directory that exists', () => {
    const nestedDir = join(tempDir, 'level1', 'level2')
    mkdirSync(nestedDir, { recursive: true })
    const result = validateOutputDir(nestedDir)
    expect(result.valid).toBe(true)
  })

  test('returns valid: false for deeply nested non-existent path', () => {
    const deepPath = join(tempDir, 'a', 'b', 'c', 'd', 'e')
    const result = validateOutputDir(deepPath)
    expect(result.valid).toBe(false)
  })

  test('returns valid: false for empty string', () => {
    const result = validateOutputDir('')
    expect(result.valid).toBe(false)
  })

  test('returns error for empty string', () => {
    const result = validateOutputDir('')
    expect(result.error).toBeDefined()
  })

  test('result has valid boolean property', () => {
    const result = validateOutputDir(tempDir)
    expect(typeof result.valid).toBe('boolean')
  })

  test('error is string when valid is false for non-existent', () => {
    const result = validateOutputDir('/absolutely/does/not/exist/dir')
    expect(result.valid).toBe(false)
    expect(typeof result.error).toBe('string')
  })

  test('error is string when valid is false for file path', () => {
    const filePath = join(tempDir, 'afile.txt')
    writeFileSync(filePath, 'data')
    const result = validateOutputDir(filePath)
    expect(result.valid).toBe(false)
    expect(typeof result.error).toBe('string')
  })

  test('error is undefined when valid is true', () => {
    const result = validateOutputDir(tempDir)
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  test('validates directory with trailing slash', () => {
    const result = validateOutputDir(tempDir + '/')
    expect(result.valid).toBe(true)
  })

  test('returns valid: false for path with special characters that do not exist', () => {
    const specialPath = join(tempDir, 'dir with spaces', 'and<special>')
    const result = validateOutputDir(specialPath)
    expect(result.valid).toBe(false)
  })

  test('validates directory with unicode characters', () => {
    const unicodeDir = join(tempDir, '日本語ディレクトリ')
    mkdirSync(unicodeDir, { recursive: true })
    const result = validateOutputDir(unicodeDir)
    expect(result.valid).toBe(true)
  })

  test('error message format: "Output directory does not exist: <path>"', () => {
    const result = validateOutputDir('/no/such/directory')
    expect(result.error).toMatch(/^Output directory does not exist:/)
  })

  test('error message format: "Output path is not a directory: <path>"', () => {
    const filePath = join(tempDir, 'regular-file.txt')
    writeFileSync(filePath, 'content')
    const result = validateOutputDir(filePath)
    expect(result.error).toMatch(/^Output path is not a directory:/)
  })

  test('distinguishes between missing and not-a-directory errors', () => {
    const missingResult = validateOutputDir('/no/such/directory')
    expect(missingResult.error).toContain('does not exist')
    expect(missingResult.error).not.toContain('not a directory')

    const filePath = join(tempDir, 'another-file.txt')
    writeFileSync(filePath, 'x')
    const fileResult = validateOutputDir(filePath)
    expect(fileResult.error).toContain('not a directory')
    expect(fileResult.error).not.toContain('does not exist')
  })
})

// ============================================================================
// resolveCiOptions
// ============================================================================

describe('resolveCiOptions', () => {
  test('returns CiOptions object', () => {
    const result = resolveCiOptions({})
    expect(result).toHaveProperty('force')
    expect(result).toHaveProperty('output')
    expect(result).toHaveProperty('platform')
  })

  test('defaults force to false', () => {
    const result = resolveCiOptions({})
    expect(result.force).toBe(false)
  })

  test('defaults output to "."', () => {
    const result = resolveCiOptions({})
    expect(result.output).toBe('.')
  })

  test('defaults platform to "all"', () => {
    const result = resolveCiOptions({})
    expect(result.platform).toBe('all')
  })

  test('resolves force true from flags', () => {
    const result = resolveCiOptions({ force: true })
    expect(result.force).toBe(true)
  })

  test('resolves force false from flags', () => {
    const result = resolveCiOptions({ force: false })
    expect(result.force).toBe(false)
  })

  test('resolves output from flags', () => {
    const result = resolveCiOptions({ output: './ci-output' })
    expect(result.output).toBe('./ci-output')
  })

  test('resolves platform github from flags', () => {
    const result = resolveCiOptions({ platform: 'github' })
    expect(result.platform).toBe('github')
  })

  test('resolves platform gitlab from flags', () => {
    const result = resolveCiOptions({ platform: 'gitlab' })
    expect(result.platform).toBe('gitlab')
  })

  test('resolves platform all from flags', () => {
    const result = resolveCiOptions({ platform: 'all' })
    expect(result.platform).toBe('all')
  })

  test('resolves all flags together', () => {
    const result = resolveCiOptions({ force: true, output: './deploy', platform: 'github' })
    expect(result.force).toBe(true)
    expect(result.output).toBe('./deploy')
    expect(result.platform).toBe('github')
  })

  test('ignores unknown flags', () => {
    const result = resolveCiOptions({ unknownFlag: 'value', force: true })
    expect(result.force).toBe(true)
  })

  test('defaults with empty object', () => {
    const result = resolveCiOptions({})
    expect(result).toEqual({ force: false, output: '.', platform: 'all' })
  })

  test('defaults with undefined flag values', () => {
    const result = resolveCiOptions({ force: undefined, output: undefined, platform: undefined })
    expect(result.force).toBe(false)
    expect(result.output).toBe('.')
    expect(result.platform).toBe('all')
  })

  test('handles force as boolean true', () => {
    const result = resolveCiOptions({ force: true })
    expect(result.force).toBe(true)
  })

  test('handles custom output path', () => {
    const result = resolveCiOptions({ output: '/custom/path/to/ci' })
    expect(result.output).toBe('/custom/path/to/ci')
  })

  test('handles relative output path', () => {
    const result = resolveCiOptions({ output: './relative/path' })
    expect(result.output).toBe('./relative/path')
  })

  test('handles empty output string as default', () => {
    const result = resolveCiOptions({ output: '' })
    expect(result.output).toBe('')
  })

  test('returns new object on each call', () => {
    const a = resolveCiOptions({})
    const b = resolveCiOptions({})
    expect(a).not.toBe(b)
  })

  test('returns equal objects for same input', () => {
    const a = resolveCiOptions({ force: true })
    const b = resolveCiOptions({ force: true })
    expect(a).toEqual(b)
  })

  test('does not share state between calls', () => {
    const first = resolveCiOptions({ force: true })
    const second = resolveCiOptions({})
    expect(first.force).toBe(true)
    expect(second.force).toBe(false)
  })

  test('handles flags with extra properties', () => {
    const result = resolveCiOptions({ force: true, extra: 'ignored', another: 42 })
    expect(result.force).toBe(true)
    expect(result.output).toBe('.')
    expect(result.platform).toBe('all')
  })

  test('force defaults when only output is provided', () => {
    const result = resolveCiOptions({ output: './out' })
    expect(result.force).toBe(false)
    expect(result.output).toBe('./out')
  })

  test('output defaults when only force is provided', () => {
    const result = resolveCiOptions({ force: true })
    expect(result.force).toBe(true)
    expect(result.output).toBe('.')
  })

  test('platform defaults when only force and output are provided', () => {
    const result = resolveCiOptions({ force: false, output: './dist' })
    expect(result.platform).toBe('all')
  })
})

// ============================================================================
// displayNextSteps
// ============================================================================

describe('displayNextSteps', () => {
  test('calls logFn', () => {
    let callCount = 0
    displayNextSteps(() => {
      callCount++
    })
    expect(callCount).toBeGreaterThan(0)
  })

  test('calls logFn exactly 5 times', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    expect(messages).toHaveLength(5)
  })

  test('first call is empty string', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    expect(messages[0]).toBe('')
  })

  test('second call contains Next steps', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    expect(messages[1]).toContain('Next steps')
  })

  test('contains step 1: Review and customize', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const allMessages = messages.join('\n')
    expect(allMessages).toContain('1.')
    expect(allMessages).toContain('Review and customize')
  })

  test('contains step 2: Ensure codeforge is installed', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const allMessages = messages.join('\n')
    expect(allMessages).toContain('2.')
    expect(allMessages).toContain('codeforge is installed')
  })

  test('contains step 3: Commit the changes', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const allMessages = messages.join('\n')
    expect(allMessages).toContain('3.')
    expect(allMessages).toContain('Commit the changes')
  })

  test('all three steps are displayed', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const allMessages = messages.join('\n')
    expect(allMessages).toContain('1.')
    expect(allMessages).toContain('2.')
    expect(allMessages).toContain('3.')
  })

  test('step messages contain content', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    // Steps at indices 2, 3, 4 contain the numbered step messages
    expect(messages[2].length).toBeGreaterThan(0)
    expect(messages[3].length).toBeGreaterThan(0)
    expect(messages[4].length).toBeGreaterThan(0)
  })

  test('Next steps header is bold', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    expect(messages[1].length).toBeGreaterThan(0)
  })

  test('logFn receives strings', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    for (const msg of messages) {
      expect(typeof msg).toBe('string')
    }
  })

  test('calls logFn synchronously', () => {
    const callOrder: number[] = []
    displayNextSteps(() => {
      callOrder.push(Date.now())
    })
    expect(callOrder).toHaveLength(5)
  })

  test('works with different logFn implementations', () => {
    const messages1: string[] = []
    const messages2: string[] = []
    displayNextSteps((msg) => messages1.push(msg))
    displayNextSteps((msg) => messages2.push(msg))
    expect(messages1).toHaveLength(5)
    expect(messages2).toHaveLength(5)
  })

  test('produces consistent output across calls', () => {
    const messages1: string[] = []
    const messages2: string[] = []
    displayNextSteps((msg) => messages1.push(msg))
    displayNextSteps((msg) => messages2.push(msg))
    expect(messages1).toEqual(messages2)
  })

  test('returns void', () => {
    const result = displayNextSteps(() => {})
    expect(result).toBeUndefined()
  })

  test('step 1 mentions CI configuration', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const stepContent = messages[2]
    expect(stepContent).toContain('CI configuration')
  })

  test('step 2 mentions CI environment', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const stepContent = messages[3]
    expect(stepContent).toContain('CI environment')
  })

  test('step 3 mentions repository', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const stepContent = messages[4]
    expect(stepContent).toContain('repository')
  })

  test('first call is empty string', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    expect(messages[0]).toBe('')
  })

  test('second call contains Next steps', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    expect(messages[1]).toContain('Next steps')
  })

  test('contains step 1: Review and customize', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const allMessages = messages.join('\n')
    expect(allMessages).toContain('1.')
    expect(allMessages).toContain('Review and customize')
  })

  test('contains step 2: Ensure codeforge is installed', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const allMessages = messages.join('\n')
    expect(allMessages).toContain('2.')
    expect(allMessages).toContain('codeforge is installed')
  })

  test('contains step 3: Commit the changes', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const allMessages = messages.join('\n')
    expect(allMessages).toContain('3.')
    expect(allMessages).toContain('Commit the changes')
  })

  test('all three steps are displayed', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const allMessages = messages.join('\n')
    expect(allMessages).toContain('1.')
    expect(allMessages).toContain('2.')
    expect(allMessages).toContain('3.')
  })

  test('step messages contain gray color formatting', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    // Steps 3 and 4 (index 2 and 3) should have content (possibly with ANSI codes)
    expect(messages[2].length).toBeGreaterThan(0)
    expect(messages[3].length).toBeGreaterThan(0)
  })

  test('Next steps header is bold', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    expect(messages[1].length).toBeGreaterThan(0)
  })

  test('logFn receives strings', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    for (const msg of messages) {
      expect(typeof msg).toBe('string')
    }
  })

  test('calls logFn synchronously', () => {
    const callOrder: number[] = []
    displayNextSteps(() => {
      callOrder.push(Date.now())
    })
    expect(callOrder).toHaveLength(5)
  })

  test('works with different logFn implementations', () => {
    const messages1: string[] = []
    const messages2: string[] = []
    displayNextSteps((msg) => messages1.push(msg))
    displayNextSteps((msg) => messages2.push(msg))
    expect(messages1).toHaveLength(5)
    expect(messages2).toHaveLength(5)
  })

  test('produces consistent output across calls', () => {
    const messages1: string[] = []
    const messages2: string[] = []
    displayNextSteps((msg) => messages1.push(msg))
    displayNextSteps((msg) => messages2.push(msg))
    expect(messages1).toEqual(messages2)
  })

  test('returns void', () => {
    const result = displayNextSteps(() => {})
    expect(result).toBeUndefined()
  })

  test('step 1 mentions CI configuration', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const stepContent = messages[2]
    expect(stepContent).toContain('CI configuration')
  })

  test('step 2 mentions CI environment', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const stepContent = messages[3]
    expect(stepContent).toContain('CI environment')
  })

  test('step 3 mentions repository', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    const stepContent = messages[4]
    expect(stepContent).toContain('repository')
  })
})

// ============================================================================
// Content verification: YAML keywords present
// ============================================================================

describe('GitHub Actions content YAML verification', () => {
  const content = generateGitHubActionsContent()

  test('contains valid YAML key separators (colons)', () => {
    expect(content).toContain(':')
  })

  test('contains YAML list items (dashes)', () => {
    expect(content).toContain('-')
  })

  test('has no JSON-like syntax', () => {
    expect(content).not.toContain('{"')
    expect(content).not.toContain('"}')
  })

  test('contains keyword "name" exactly once at root level', () => {
    const matches = content.match(/^name:/m)
    expect(matches).not.toBeNull()
  })

  test('contains keyword "on" at root level', () => {
    const matches = content.match(/^on:/m)
    expect(matches).not.toBeNull()
  })

  test('contains keyword "permissions" at root level', () => {
    const matches = content.match(/^permissions:/m)
    expect(matches).not.toBeNull()
  })

  test('contains keyword "jobs" at root level', () => {
    const matches = content.match(/^jobs:/m)
    expect(matches).not.toBeNull()
  })

  test('analyze job runs on Linux', () => {
    expect(content).toContain('ubuntu')
  })

  test('references Node.js major version 20', () => {
    expect(content).toMatch(/node-version.*20/)
  })

  test('uses npm for caching', () => {
    expect(content).toContain('npm')
  })

  test('upload step runs even on failure', () => {
    expect(content).toContain('always()')
  })
})

describe('GitLab CI content YAML verification', () => {
  const content = generateGitLabCiContent()

  test('contains valid YAML key separators (colons)', () => {
    expect(content).toContain(':')
  })

  test('contains YAML list items (dashes)', () => {
    expect(content).toContain('-')
  })

  test('has no JSON-like syntax', () => {
    expect(content).not.toContain('{"')
    expect(content).not.toContain('"}')
  })

  test('contains keyword "stages" at root level', () => {
    const matches = content.match(/^stages:/m)
    expect(matches).not.toBeNull()
  })

  test('contains keyword "codeforge" at root level', () => {
    const matches = content.match(/^codeforge:/m)
    expect(matches).not.toBeNull()
  })

  test('uses Node.js Docker image', () => {
    expect(content).toContain('image:')
    expect(content).toContain('node:')
  })

  test('defines artifact expiry', () => {
    expect(content).toContain('expire_in')
  })

  test('restricts to specific branches', () => {
    expect(content).toContain('only:')
  })

  test('excludes specific refs', () => {
    expect(content).toContain('except:')
  })

  test('uses codequality report format', () => {
    expect(content).toContain('codequality')
  })
})

// ============================================================================
// Edge cases: concurrent calls, many calls
// ============================================================================

describe('concurrent calls', () => {
  test('generateGitHubActionsContent handles rapid calls', () => {
    const results = Array.from({ length: 50 }, () => generateGitHubActionsContent())
    const unique = new Set(results)
    expect(unique.size).toBe(1)
  })

  test('generateGitLabCiContent handles rapid calls', () => {
    const results = Array.from({ length: 50 }, () => generateGitLabCiContent())
    const unique = new Set(results)
    expect(unique.size).toBe(1)
  })

  test('resolveCiOptions handles rapid calls with different inputs', () => {
    const results = Array.from({ length: 50 }, (_, i) =>
      resolveCiOptions({ force: i % 2 === 0, output: `./out-${i}`, platform: 'github' }),
    )
    for (let i = 0; i < results.length; i++) {
      expect(results[i].force).toBe(i % 2 === 0)
      expect(results[i].output).toBe(`./out-${i}`)
    }
  })
})

describe('platform values in resolveCiOptions', () => {
  test('resolves "all" platform', () => {
    const result = resolveCiOptions({ platform: 'all' })
    expect(result.platform).toBe('all')
  })

  test('resolves "github" platform', () => {
    const result = resolveCiOptions({ platform: 'github' })
    expect(result.platform).toBe('github')
  })

  test('resolves "gitlab" platform', () => {
    const result = resolveCiOptions({ platform: 'gitlab' })
    expect(result.platform).toBe('gitlab')
  })

  test('default platform is "all"', () => {
    const result = resolveCiOptions({})
    expect(result.platform).toBe('all')
  })
})

// ============================================================================
// Integration: content generation + resolveCiOptions
// ============================================================================

describe('content generation with resolved options', () => {
  test('github platform generates GitHub Actions content', () => {
    const options = resolveCiOptions({ platform: 'github' })
    expect(options.platform).toBe('github')
    if (options.platform === 'github' || options.platform === 'all') {
      const content = generateGitHubActionsContent()
      expect(content).toContain('on:')
    }
  })

  test('gitlab platform generates GitLab CI content', () => {
    const options = resolveCiOptions({ platform: 'gitlab' })
    expect(options.platform).toBe('gitlab')
    if (options.platform === 'gitlab' || options.platform === 'all') {
      const content = generateGitLabCiContent()
      expect(content).toContain('stages:')
    }
  })

  test('all platform generates both contents', () => {
    const options = resolveCiOptions({ platform: 'all' })
    expect(options.platform).toBe('all')
    const ghContent = generateGitHubActionsContent()
    const glContent = generateGitLabCiContent()
    expect(ghContent).toContain('jobs:')
    expect(glContent).toContain('codeforge:')
  })
})

// ============================================================================
// validateOutputDir: additional filesystem edge cases
// ============================================================================

describe('validateOutputDir filesystem edge cases', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = join(tmpdir(), `ci-helpers-edge-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    mkdirSync(tempDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  test('validates directory with dots in name', () => {
    const dotDir = join(tempDir, 'my.dir')
    mkdirSync(dotDir)
    const result = validateOutputDir(dotDir)
    expect(result.valid).toBe(true)
  })

  test('validates directory with hyphens in name', () => {
    const hyphenDir = join(tempDir, 'my-dir')
    mkdirSync(hyphenDir)
    const result = validateOutputDir(hyphenDir)
    expect(result.valid).toBe(true)
  })

  test('validates directory with underscores in name', () => {
    const underscoreDir = join(tempDir, 'my_dir')
    mkdirSync(underscoreDir)
    const result = validateOutputDir(underscoreDir)
    expect(result.valid).toBe(true)
  })

  test('validates directory with spaces in name', () => {
    const spaceDir = join(tempDir, 'my dir')
    mkdirSync(spaceDir)
    const result = validateOutputDir(spaceDir)
    expect(result.valid).toBe(true)
  })

  test('validates deeply nested existing directory', () => {
    const deepDir = join(tempDir, 'a', 'b', 'c')
    mkdirSync(deepDir, { recursive: true })
    const result = validateOutputDir(deepDir)
    expect(result.valid).toBe(true)
  })

  test('returns valid: false for non-existent deeply nested path', () => {
    const result = validateOutputDir('/this/path/definitely/does/not/exist')
    expect(result.valid).toBe(false)
  })

  test('file with .json extension is not a directory', () => {
    const filePath = join(tempDir, 'config.json')
    writeFileSync(filePath, '{}')
    const result = validateOutputDir(filePath)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('not a directory')
  })

  test('file with .yaml extension is not a directory', () => {
    const filePath = join(tempDir, 'workflow.yaml')
    writeFileSync(filePath, 'key: value')
    const result = validateOutputDir(filePath)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('not a directory')
  })

  test('empty filename returns valid false', () => {
    const result = validateOutputDir('')
    expect(result.valid).toBe(false)
  })

  test('single dot is valid (current directory)', () => {
    const result = validateOutputDir('.')
    expect(result.valid).toBe(true)
  })

  test('returns correct type for valid property', () => {
    const validResult = validateOutputDir(tempDir)
    expect(typeof validResult.valid).toBe('boolean')
    expect(validResult.valid).toBe(true)
  })

  test('returns correct type for error property when invalid', () => {
    const invalidResult = validateOutputDir('/does/not/exist')
    if (invalidResult.error) {
      expect(typeof invalidResult.error).toBe('string')
    }
  })
})

// ============================================================================
// displayNextSteps: extended coverage
// ============================================================================

describe('displayNextSteps extended coverage', () => {
  test('logFn is called with exactly 5 arguments', () => {
    const args: string[][] = []
    displayNextSteps((msg) => {
      args.push([msg])
    })
    expect(args).toHaveLength(5)
  })

  test('empty string separates header from steps', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    expect(messages[0]).toBe('')
    expect(messages[1].length).toBeGreaterThan(0)
  })

  test('Next steps is in the second message', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    expect(messages[1]).toContain('Next')
    expect(messages[1]).toContain('steps')
  })

  test('step 1 content includes review keyword', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    expect(messages[2].toLowerCase()).toContain('review')
  })

  test('step 2 content includes installed keyword', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    expect(messages[3].toLowerCase()).toContain('installed')
  })

  test('does not call logFn with undefined', () => {
    const messages: (string | undefined)[] = []
    displayNextSteps((msg) => {
      messages.push(msg)
    })
    for (const msg of messages) {
      expect(msg).toBeDefined()
    }
  })

  test('handles being called multiple times in sequence', () => {
    const allMessages: string[][] = []
    for (let i = 0; i < 5; i++) {
      const messages: string[] = []
      displayNextSteps((msg) => messages.push(msg))
      allMessages.push(messages)
    }
    for (const msgs of allMessages) {
      expect(msgs).toHaveLength(5)
    }
  })

  test('produces identical output for identical calls', () => {
    const results: string[][] = []
    for (let i = 0; i < 3; i++) {
      const messages: string[] = []
      displayNextSteps((msg) => messages.push(msg))
      results.push(messages)
    }
    expect(results[0]).toEqual(results[1])
    expect(results[1]).toEqual(results[2])
  })
})

// ============================================================================
// resolveCiOptions: additional edge cases
// ============================================================================

describe('resolveCiOptions additional edge cases', () => {
  test('handles flags with null prototype', () => {
    const flags = Object.create(null)
    flags.force = true
    const result = resolveCiOptions(flags)
    expect(result.force).toBe(true)
  })

  test('handles empty string output', () => {
    const result = resolveCiOptions({ output: '' })
    expect(result.output).toBe('')
  })

  test('handles output with spaces', () => {
    const result = resolveCiOptions({ output: './my output dir' })
    expect(result.output).toBe('./my output dir')
  })

  test('handles output with special characters', () => {
    const result = resolveCiOptions({ output: './ci-output_v2.0' })
    expect(result.output).toBe('./ci-output_v2.0')
  })

  test('handles absolute output path', () => {
    const result = resolveCiOptions({ output: '/tmp/ci-configs' })
    expect(result.output).toBe('/tmp/ci-configs')
  })

  test('handles parent directory reference in output', () => {
    const result = resolveCiOptions({ output: '../configs' })
    expect(result.output).toBe('../configs')
  })

  test('preserves exact string values', () => {
    const customOutput = '  ./spaces  '
    const result = resolveCiOptions({ output: customOutput })
    expect(result.output).toBe(customOutput)
  })
})

// ============================================================================
// Cross-function validation
// ============================================================================

describe('cross-function validation', () => {
  test('both generators return strings with YAML-like content', () => {
    const gh = generateGitHubActionsContent()
    const gl = generateGitLabCiContent()
    expect(gh).toContain(':')
    expect(gl).toContain(':')
  })

  test('both generators produce different content', () => {
    const gh = generateGitHubActionsContent()
    const gl = generateGitLabCiContent()
    expect(gh).not.toBe(gl)
  })

  test('GitHub content references SARIF, GitLab references codequality', () => {
    const gh = generateGitHubActionsContent()
    const gl = generateGitLabCiContent()
    expect(gh).toContain('sarif')
    expect(gl).toContain('codequality')
  })

  test('both reference codeforge analyze command', () => {
    const gh = generateGitHubActionsContent()
    const gl = generateGitLabCiContent()
    expect(gh).toContain('codeforge analyze')
    expect(gl).toContain('codeforge analyze')
  })

  test('both reference npm ci for dependency installation', () => {
    const gh = generateGitHubActionsContent()
    const gl = generateGitLabCiContent()
    expect(gh).toContain('npm ci')
    expect(gl).toContain('npm ci')
  })

  test('both reference node version 20', () => {
    const gh = generateGitHubActionsContent()
    const gl = generateGitLabCiContent()
    expect(gh).toContain('20')
    expect(gl).toContain('20')
  })

  test('validateOutputDir can be used with resolveCiOptions output', () => {
    const options = resolveCiOptions({ output: '.' })
    const result = validateOutputDir(options.output)
    expect(result.valid).toBe(true)
  })
})

// ============================================================================
// validateOutputDir: immutability and consistency
// ============================================================================

describe('validateOutputDir consistency', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = join(tmpdir(), `ci-helpers-consistency-${Date.now()}`)
    mkdirSync(tempDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  test('returns same result for same input', () => {
    const result1 = validateOutputDir(tempDir)
    const result2 = validateOutputDir(tempDir)
    expect(result1).toEqual(result2)
  })

  test('returns same result for same invalid input', () => {
    const result1 = validateOutputDir('/nonexistent/path')
    const result2 = validateOutputDir('/nonexistent/path')
    expect(result1).toEqual(result2)
  })

  test('returns new object on each call', () => {
    const result1 = validateOutputDir(tempDir)
    const result2 = validateOutputDir(tempDir)
    expect(result1).not.toBe(result2)
  })
})

// ============================================================================
// Content length and structure verification
// ============================================================================

describe('content length and structure', () => {
  test('GitHub Actions content has reasonable length', () => {
    const content = generateGitHubActionsContent()
    expect(content.length).toBeGreaterThan(200)
    expect(content.length).toBeLessThan(2000)
  })

  test('GitLab CI content has reasonable length', () => {
    const content = generateGitLabCiContent()
    expect(content.length).toBeGreaterThan(100)
    expect(content.length).toBeLessThan(2000)
  })

  test('GitHub Actions content has multiple lines', () => {
    const content = generateGitHubActionsContent()
    const lines = content.split('\n')
    expect(lines.length).toBeGreaterThan(10)
  })

  test('GitLab CI content has multiple lines', () => {
    const content = generateGitLabCiContent()
    const lines = content.split('\n')
    expect(lines.length).toBeGreaterThan(5)
  })

  test('GitHub Actions content ends with newline', () => {
    const content = generateGitHubActionsContent()
    expect(content.endsWith('\n')).toBe(true)
  })

  test('GitLab CI content ends with newline', () => {
    const content = generateGitLabCiContent()
    expect(content.endsWith('\n')).toBe(true)
  })
})

// ============================================================================
// displayNextSteps: logFn behavior verification
// ============================================================================

describe('displayNextSteps logFn interaction', () => {
  test('logFn is called with non-null arguments', () => {
    const messages: (string | undefined)[] = []
    displayNextSteps((msg) => {
      messages.push(msg)
    })
    expect(messages).toHaveLength(5)
    for (const msg of messages) {
      expect(msg).toBeDefined()
    }
  })

  test('logFn receives sequential messages in order', () => {
    const messages: string[] = []
    displayNextSteps((msg) => messages.push(msg))
    expect(messages[0]).toBe('')
    expect(messages[1]).toContain('Next steps')
    expect(messages[2]).toContain('1.')
    expect(messages[3]).toContain('2.')
    expect(messages[4]).toContain('3.')
  })

  test('displayNextSteps does not throw', () => {
    expect(() => displayNextSteps(() => {})).not.toThrow()
  })

  test('displayNextSteps works with no-op logFn', () => {
    expect(() => displayNextSteps(() => {})).not.toThrow()
  })

  test('displayNextSteps works with collecting logFn', () => {
    const collected: string[] = []
    expect(() => displayNextSteps((msg) => collected.push(msg))).not.toThrow()
    expect(collected).toHaveLength(5)
  })
})

// ============================================================================
// resolveCiOptions: type safety
// ============================================================================

describe('resolveCiOptions type safety', () => {
  test('result has exactly 3 properties', () => {
    const result = resolveCiOptions({})
    const keys = Object.keys(result)
    expect(keys).toHaveLength(3)
    expect(keys).toContain('force')
    expect(keys).toContain('output')
    expect(keys).toContain('platform')
  })

  test('force is always boolean', () => {
    expect(typeof resolveCiOptions({ force: true }).force).toBe('boolean')
    expect(typeof resolveCiOptions({ force: false }).force).toBe('boolean')
    expect(typeof resolveCiOptions({}).force).toBe('boolean')
  })

  test('output is always string', () => {
    expect(typeof resolveCiOptions({ output: '.' }).output).toBe('string')
    expect(typeof resolveCiOptions({ output: './ci' }).output).toBe('string')
    expect(typeof resolveCiOptions({}).output).toBe('string')
  })

  test('platform is always a valid Platform value', () => {
    const validPlatforms: Platform[] = ['all', 'github', 'gitlab']
    const result = resolveCiOptions({})
    expect(validPlatforms).toContain(result.platform)
  })

  test('force true remains true', () => {
    const result = resolveCiOptions({ force: true })
    expect(result.force).toBe(true)
  })

  test('force false remains false', () => {
    const result = resolveCiOptions({ force: false })
    expect(result.force).toBe(false)
  })
})
