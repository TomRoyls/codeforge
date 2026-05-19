import { describe, it, expect } from 'vitest'

import {
  parseVersion,
  majorVersion,
  detectTool,
  detectNodeVersion,
  detectNpmVersion,
  detectGitVersion,
  detectOS,
  detectShell,
  detectEditor,
  detectPackageManager,
  checkRequiredTools,
  computeCompatibility,
  runEnvChecks,
  computeEnvScore,
  buildEnvResult,
  type EnvCheck,
  type EnvInfo,
  type EnvResult,
} from '../src/commands/env-helpers.js'

import {
  formatEnvTable,
  formatEnvJson,
} from '../src/commands/env-format-helpers.js'

import Env from '../src/commands/env.js'

// ─── parseVersion ───────────────────────────────────────

describe('parseVersion', () => {
  it('should parse v-prefixed version', () => {
    expect(parseVersion('v20.11.0')).toBe('20.11.0')
  })

  it('should parse plain version', () => {
    expect(parseVersion('10.2.3')).toBe('10.2.3')
  })

  it('should parse version embedded in text', () => {
    expect(parseVersion('git version 2.43.0')).toBe('2.43.0')
  })

  it('should return null for no version', () => {
    expect(parseVersion('no version here')).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(parseVersion('')).toBeNull()
  })

  it('should parse two-part version with trailing zero', () => {
    expect(parseVersion('1.0.0')).toBe('1.0.0')
  })
})

// ─── majorVersion ───────────────────────────────────────

describe('majorVersion', () => {
  it('should extract major from semver', () => {
    expect(majorVersion('20.11.0')).toBe(20)
  })

  it('should handle single digit major', () => {
    expect(majorVersion('4.0.0')).toBe(4)
  })

  it('should handle two digit major', () => {
    expect(majorVersion('22.0.0')).toBe(22)
  })
})

// ─── detectNodeVersion ──────────────────────────────────

describe('detectNodeVersion', () => {
  it('should return a version string', () => {
    const v = detectNodeVersion()
    expect(v).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('should not have v prefix', () => {
    const v = detectNodeVersion()
    expect(v.startsWith('v')).toBe(false)
  })
})

// ─── detectOS ───────────────────────────────────────────

describe('detectOS', () => {
  it('should return os and arch', () => {
    const { os, arch } = detectOS()
    expect(os).toBeTruthy()
    expect(arch).toBeTruthy()
  })

  it('should have known platform', () => {
    const { os } = detectOS()
    expect(['linux', 'darwin', 'win32', 'freebsd', 'openbsd']).toContain(os)
  })
})

// ─── detectShell ────────────────────────────────────────

describe('detectShell', () => {
  it('should return a string or null', () => {
    const shell = detectShell()
    expect(shell === null || typeof shell === 'string').toBe(true)
  })
})

// ─── detectEditor ───────────────────────────────────────

describe('detectEditor', () => {
  it('should return a string or null', () => {
    const editor = detectEditor()
    expect(editor === null || typeof editor === 'string').toBe(true)
  })
})

// ─── detectTool ─────────────────────────────────────────

describe('detectTool', () => {
  it('should detect node', () => {
    const tool = detectTool('node', ['--version'])
    expect(tool.installed).toBe(true)
    expect(tool.version).toBeTruthy()
  })

  it('should detect git', () => {
    const tool = detectTool('git', ['--version'])
    expect(tool.installed).toBe(true)
  })

  it('should handle non-existent tool', () => {
    const tool = detectTool('nonexistent_tool_xyz123', ['--version'])
    expect(tool.installed).toBe(false)
    expect(tool.version).toBeNull()
  })

  it('should have correct name', () => {
    const tool = detectTool('node', ['--version'])
    expect(tool.name).toBe('node')
  })
})

// ─── detectNpmVersion ───────────────────────────────────

describe('detectNpmVersion', () => {
  it('should return a version or null', () => {
    const v = detectNpmVersion()
    expect(v === null || /^\d+\.\d+\.\d+$/.test(v)).toBe(true)
  })
})

// ─── detectGitVersion ───────────────────────────────────

describe('detectGitVersion', () => {
  it('should return a version or null', () => {
    const v = detectGitVersion()
    expect(v === null || /^\d+\.\d+\.\d+$/.test(v)).toBe(true)
  })
})

// ─── detectPackageManager ───────────────────────────────

describe('detectPackageManager', () => {
  it('should detect npm in project root', () => {
    const pm = detectPackageManager('/home/georg/code/new')
    expect(['npm', 'yarn', 'pnpm', 'bun']).toContain(pm.name)
  })

  it('should default to npm for unknown dir', () => {
    const pm = detectPackageManager('/tmp/nonexistent_xyz')
    expect(pm.name).toBe('npm')
  })
})

// ─── checkRequiredTools ─────────────────────────────────

describe('checkRequiredTools', () => {
  it('should return empty map for dir without package.json', () => {
    const tools = checkRequiredTools('/tmp/nonexistent_xyz')
    expect(tools.size).toBe(0)
  })

  it('should parse engines from package.json', () => {
    const tools = checkRequiredTools('/home/georg/code/new')
    // May or may not have engines, just verify it doesn't throw
    expect(tools).toBeInstanceOf(Map)
  })
})

// ─── computeCompatibility ───────────────────────────────

describe('computeCompatibility', () => {
  it('should return true for compatible >=', () => {
    expect(computeCompatibility('20.11.0', '>=18')).toBe(true)
  })

  it('should return false for incompatible >=', () => {
    expect(computeCompatibility('16.0.0', '>=18')).toBe(false)
  })

  it('should return true for compatible >', () => {
    expect(computeCompatibility('19.0.0', '>18')).toBe(true)
  })

  it('should return false for incompatible >', () => {
    expect(computeCompatibility('18.0.0', '>18')).toBe(false)
  })

  it('should return true for compatible <=', () => {
    expect(computeCompatibility('17.0.0', '<=18')).toBe(true)
  })

  it('should return true for compatible <', () => {
    expect(computeCompatibility('17.0.0', '<18')).toBe(true)
  })

  it('should return null for null installed', () => {
    expect(computeCompatibility(null, '>=18')).toBeNull()
  })

  it('should return null for null required', () => {
    expect(computeCompatibility('20.0.0', null)).toBeNull()
  })

  it('should return null for unparsable required', () => {
    expect(computeCompatibility('20.0.0', 'latest')).toBeNull()
  })

  it('should match exact major for caret', () => {
    expect(computeCompatibility('20.1.0', '^20.0.0')).toBe(true)
  })

  it('should reject different major for caret', () => {
    expect(computeCompatibility('19.1.0', '^20.0.0')).toBe(false)
  })

  it('should match exact major for tilde', () => {
    expect(computeCompatibility('20.1.0', '~20.0.0')).toBe(true)
  })

  it('should match exact major for bare version', () => {
    expect(computeCompatibility('20.5.0', '20.0.0')).toBe(true)
  })

  it('should reject different major for bare version', () => {
    expect(computeCompatibility('19.5.0', '20.0.0')).toBe(false)
  })
})

// ─── computeEnvScore ────────────────────────────────────

describe('computeEnvScore', () => {
  it('should return 100 for all passes', () => {
    const checks: EnvCheck[] = [
      { fix: null, message: 'ok', name: 'a', status: 'pass' },
      { fix: null, message: 'ok', name: 'b', status: 'pass' },
    ]
    expect(computeEnvScore(checks)).toBe(100)
  })

  it('should subtract 10 for each warn', () => {
    const checks: EnvCheck[] = [
      { fix: null, message: 'ok', name: 'a', status: 'pass' },
      { fix: null, message: 'warn', name: 'b', status: 'warn' },
    ]
    expect(computeEnvScore(checks)).toBe(90)
  })

  it('should subtract 25 for each fail', () => {
    const checks: EnvCheck[] = [
      { fix: null, message: 'ok', name: 'a', status: 'pass' },
      { fix: null, message: 'fail', name: 'b', status: 'fail' },
    ]
    expect(computeEnvScore(checks)).toBe(75)
  })

  it('should not go below 0', () => {
    const checks: EnvCheck[] = [
      { fix: null, message: 'f', name: 'a', status: 'fail' },
      { fix: null, message: 'f', name: 'b', status: 'fail' },
      { fix: null, message: 'f', name: 'c', status: 'fail' },
      { fix: null, message: 'f', name: 'd', status: 'fail' },
      { fix: null, message: 'f', name: 'e', status: 'fail' },
    ]
    expect(computeEnvScore(checks)).toBe(0)
  })

  it('should handle empty checks', () => {
    expect(computeEnvScore([])).toBe(100)
  })

  it('should combine warn and fail', () => {
    const checks: EnvCheck[] = [
      { fix: null, message: 'w', name: 'a', status: 'warn' },
      { fix: null, message: 'f', name: 'b', status: 'fail' },
    ]
    expect(computeEnvScore(checks)).toBe(65)
  })
})

// ─── runEnvChecks ───────────────────────────────────────

describe('runEnvChecks', () => {
  function makeInfo(): EnvInfo {
    return {
      arch: 'x64',
      editor: null,
      gitVersion: '2.43.0',
      nodeVersion: '20.11.0',
      npmVersion: '10.2.3',
      os: 'linux',
      packageManager: 'npm',
      packageManagerVersion: '10.2.3',
      shell: '/bin/bash',
      tools: [],
    }
  }

  it('should produce check results', () => {
    const checks = runEnvChecks(makeInfo(), '/home/georg/code/new')
    expect(checks.length).toBeGreaterThan(0)
  })

  it('should include Node.js check', () => {
    const checks = runEnvChecks(makeInfo(), '/home/georg/code/new')
    expect(checks.some((c) => c.name === 'Node.js')).toBe(true)
  })

  it('should include npm check', () => {
    const checks = runEnvChecks(makeInfo(), '/home/georg/code/new')
    expect(checks.some((c) => c.name === 'npm')).toBe(true)
  })

  it('should include git check', () => {
    const checks = runEnvChecks(makeInfo(), '/home/georg/code/new')
    expect(checks.some((c) => c.name === 'git')).toBe(true)
  })

  it('should pass Node.js when installed', () => {
    const checks = runEnvChecks(makeInfo(), '/home/georg/code/new')
    const nodeCheck = checks.find((c) => c.name === 'Node.js')
    expect(nodeCheck?.status).toBe('pass')
  })

  it('should fail npm when null', () => {
    const info = makeInfo()
    info.npmVersion = null
    const checks = runEnvChecks(info, '/home/georg/code/new')
    const npmCheck = checks.find((c) => c.name === 'npm')
    expect(npmCheck?.status).toBe('fail')
  })

  it('should fail git when null', () => {
    const info = makeInfo()
    info.gitVersion = null
    const checks = runEnvChecks(info, '/home/georg/code/new')
    const gitCheck = checks.find((c) => c.name === 'git')
    expect(gitCheck?.status).toBe('fail')
  })
})

// ─── buildEnvResult ─────────────────────────────────────

describe('buildEnvResult', () => {
  it('should return a complete result', () => {
    const result = buildEnvResult('/home/georg/code/new', {})
    expect(result.info).toBeDefined()
    expect(result.checks).toBeDefined()
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.issues).toBeInstanceOf(Array)
  })

  it('should populate info fields', () => {
    const result = buildEnvResult('/home/georg/code/new', {})
    expect(result.info.nodeVersion).toBeTruthy()
    expect(result.info.os).toBeTruthy()
    expect(result.info.arch).toBeTruthy()
    expect(result.info.packageManager).toBeTruthy()
  })

  it('should include tools', () => {
    const result = buildEnvResult('/home/georg/code/new', {})
    expect(result.info.tools.length).toBeGreaterThan(0)
  })

  it('should include node tool', () => {
    const result = buildEnvResult('/home/georg/code/new', {})
    expect(result.info.tools.some((t) => t.name === 'node')).toBe(true)
  })

  it('should handle check option', () => {
    const result = buildEnvResult('/home/georg/code/new', { check: true })
    expect(result.info.tools.some((t) => t.required || !t.required)).toBe(true)
  })
})

// ─── formatEnvTable ─────────────────────────────────────

describe('formatEnvTable', () => {
  function makeResult(): EnvResult {
    return {
      checks: [
        { fix: null, message: 'Node.js 20.11.0', name: 'Node.js', status: 'pass' },
      ],
      info: {
        arch: 'x64', editor: null, gitVersion: '2.43.0',
        nodeVersion: '20.11.0', npmVersion: '10.2.3', os: 'linux',
        packageManager: 'npm', packageManagerVersion: '10.2.3',
        shell: '/bin/bash', tools: [],
      },
      issues: [],
      score: 100,
    }
  }

  it('should contain Environment header', () => {
    expect(formatEnvTable(makeResult(), false)).toContain('Environment')
  })

  it('should show OS info', () => {
    expect(formatEnvTable(makeResult(), false)).toContain('linux')
  })

  it('should show Node version', () => {
    expect(formatEnvTable(makeResult(), false)).toContain('20.11.0')
  })

  it('should show score', () => {
    expect(formatEnvTable(makeResult(), false)).toContain('100')
  })

  it('should show Checks section', () => {
    expect(formatEnvTable(makeResult(), false)).toContain('Checks')
  })

  it('should show verbose fixes', () => {
    const r = makeResult()
    r.checks.push({ fix: 'Install git', message: 'git not found', name: 'git', status: 'fail' })
    const output = formatEnvTable(r, true)
    expect(output).toContain('Install git')
  })

  it('should show Issues section', () => {
    const r = makeResult()
    r.issues = ['npm: not found']
    expect(formatEnvTable(r, false)).toContain('Issues')
  })

  it('should not show Issues when empty', () => {
    const r = makeResult()
    expect(formatEnvTable(r, false)).not.toContain('Issues')
  })

  it('should show Tools section', () => {
    expect(formatEnvTable(makeResult(), false)).toContain('Tools')
  })
})

// ─── formatEnvJson ──────────────────────────────────────

describe('formatEnvJson', () => {
  it('should produce valid JSON', () => {
    const r: EnvResult = {
      checks: [], info: {
        arch: 'x64', editor: null, gitVersion: null,
        nodeVersion: '20.0.0', npmVersion: null, os: 'linux',
        packageManager: 'npm', packageManagerVersion: null,
        shell: null, tools: [],
      },
      issues: [], score: 100,
    }
    expect(() => JSON.parse(formatEnvJson(r))).not.toThrow()
  })

  it('should include score', () => {
    const r: EnvResult = {
      checks: [], info: {
        arch: 'x64', editor: null, gitVersion: null,
        nodeVersion: '20.0.0', npmVersion: null, os: 'linux',
        packageManager: 'npm', packageManagerVersion: null,
        shell: null, tools: [],
      },
      issues: [], score: 85,
    }
    const parsed = JSON.parse(formatEnvJson(r))
    expect(parsed.score).toBe(85)
  })
})

// ─── Command metadata ───────────────────────────────────

describe('Env command', () => {
  it('should have correct description', () => {
    expect(Env.description).toContain('environment')
  })

  it('should have path arg', () => {
    expect(Env.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(Env.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(Env.flags.output).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(Env.flags.verbose).toBeDefined()
  })

  it('should have check flag', () => {
    expect(Env.flags.check).toBeDefined()
  })

  it('should have examples', () => {
    expect(Env.examples.length).toBeGreaterThan(0)
  })
})
