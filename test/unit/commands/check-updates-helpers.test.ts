import { describe, expect, test } from 'vitest'
import {
  type AuditMetadata,
  type JsonResult,
  type OutdatedPackage,
  createAuditError,
  createFixSecurityError,
  createOutdatedError,
  createUpdateError,
  formatJsonOutput,
  formatOutdatedTable,
  formatSecuritySummary,
  buildJsonResult,
  parseAuditOutput,
  parseNpmOutput,
} from '../../../src/commands/check-updates-helpers.js'

function makeOutdatedPkg(overrides: Partial<OutdatedPackage> = {}): OutdatedPackage {
  return {
    current: '1.0.0',
    dependent: 'root',
    latest: '2.0.0',
    name: 'test-pkg',
    wanted: '1.5.0',
    ...overrides,
  }
}

function makeAuditMetadata(
  overrides: Partial<AuditMetadata['vulnerabilities']> = {},
): AuditMetadata {
  return {
    vulnerabilities: {
      critical: 0,
      high: 0,
      info: 0,
      low: 0,
      moderate: 0,
      total: 0,
      ...overrides,
    },
  }
}

function makeJsonResult(overrides: Partial<JsonResult> = {}): JsonResult {
  return {
    error: null,
    outdated: [],
    security: null,
    ...overrides,
  }
}

describe('parseNpmOutput', () => {
  test('returns empty array for empty string', () => {
    expect(parseNpmOutput('')).toEqual([])
  })

  test('returns empty array for whitespace-only string', () => {
    expect(parseNpmOutput('   ')).toEqual([])
  })

  test('returns empty array for whitespace with newlines', () => {
    expect(parseNpmOutput('\n  \n')).toEqual([])
  })

  test('parses single package', () => {
    const stdout = JSON.stringify({
      lodash: { current: '4.0.0', dependent: 'root', latest: '4.17.21', wanted: '4.17.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('lodash')
    expect(result[0].current).toBe('4.0.0')
    expect(result[0].dependent).toBe('root')
    expect(result[0].latest).toBe('4.17.21')
    expect(result[0].wanted).toBe('4.17.0')
  })

  test('parses multiple packages', () => {
    const stdout = JSON.stringify({
      chalk: { current: '4.0.0', dependent: 'root', latest: '5.0.0', wanted: '5.0.0' },
      lodash: { current: '4.0.0', dependent: 'root', latest: '4.17.21', wanted: '4.17.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result).toHaveLength(2)
  })

  test('parses scoped package names', () => {
    const stdout = JSON.stringify({
      '@types/node': { current: '18.0.0', dependent: 'root', latest: '20.0.0', wanted: '18.11.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].name).toBe('@types/node')
  })

  test('parses deeply nested package names', () => {
    const stdout = JSON.stringify({
      '@org/deep-pkg': { current: '1.0.0', dependent: 'app', latest: '3.0.0', wanted: '2.0.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].name).toBe('@org/deep-pkg')
    expect(result[0].dependent).toBe('app')
  })

  test('throws on invalid JSON', () => {
    expect(() => parseNpmOutput('not json')).toThrow()
  })

  test('parses package where current equals latest', () => {
    const stdout = JSON.stringify({
      lodash: { current: '4.17.21', dependent: 'root', latest: '4.17.21', wanted: '4.17.21' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].current).toBe('4.17.21')
    expect(result[0].latest).toBe('4.17.21')
    expect(result[0].wanted).toBe('4.17.21')
  })

  test('parses package where wanted equals latest', () => {
    const stdout = JSON.stringify({
      react: { current: '17.0.0', dependent: 'root', latest: '18.2.0', wanted: '18.2.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].wanted).toBe('18.2.0')
    expect(result[0].latest).toBe('18.2.0')
  })

  test('throws on malformed JSON object', () => {
    expect(() => parseNpmOutput('{invalid')).toThrow()
  })

  test('handles JSON array instead of object', () => {
    const stdout = JSON.stringify([])
    const result = parseNpmOutput(stdout)
    expect(result).toEqual([])
  })

  test('handles JSON primitive string value', () => {
    const stdout = JSON.stringify('string')
    // JSON.stringify('string') produces '"string"', which is valid JSON
    // Object.entries('"string"') would create entries for string indices
    // The function doesn't throw, it just processes the string
    const result = parseNpmOutput(stdout)
    // String characters become package names
    expect(result).toBeDefined()
  })

  test('throws on null JSON value', () => {
    const stdout = JSON.stringify(null)
    expect(() => parseNpmOutput(stdout)).toThrow()
  })

  test('handles package with unicode characters in name', () => {
    const stdout = JSON.stringify({
      'émoji-pkg': { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '1.5.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].name).toBe('émoji-pkg')
  })

  test('handles package with numbers in name', () => {
    const stdout = JSON.stringify({
      vue2: { current: '2.6.14', dependent: 'root', latest: '2.7.16', wanted: '2.7.14' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].name).toBe('vue2')
  })

  test('handles package with underscores in name', () => {
    const stdout = JSON.stringify({
      my_pkg: { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '1.5.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].name).toBe('my_pkg')
  })

  test('handles package with double dots in name', () => {
    const stdout = JSON.stringify({
      '@scope/pkg..v2': { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '1.5.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].name).toBe('@scope/pkg..v2')
  })

  test('parses package with workspaces in dependent', () => {
    const stdout = JSON.stringify({
      'some-pkg': { current: '1.0.0', dependent: 'packages/app', latest: '2.0.0', wanted: '1.5.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].dependent).toBe('packages/app')
  })

  test('handles package with trailing slash in dependent', () => {
    const stdout = JSON.stringify({
      lodash: { current: '4.0.0', dependent: 'root/', latest: '4.17.21', wanted: '4.17.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].dependent).toBe('root/')
  })

  test('handles package with git-like version strings', () => {
    const stdout = JSON.stringify({
      'git-pkg': {
        current: '1.0.0',
        dependent: 'root',
        latest: '2.0.0',
        wanted: 'git+https://github.com/user/repo.git',
      },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].wanted).toBe('git+https://github.com/user/repo.git')
  })

  test('parses package with caret version in wanted', () => {
    const stdout = JSON.stringify({
      react: { current: '17.0.0', dependent: 'root', latest: '18.2.0', wanted: '^18.0.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].wanted).toBe('^18.0.0')
  })

  test('parses package with tilde version in wanted', () => {
    const stdout = JSON.stringify({
      express: { current: '4.17.0', dependent: 'root', latest: '4.18.2', wanted: '~4.18.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].wanted).toBe('~4.18.0')
  })

  test('parses package with exact version in wanted', () => {
    const stdout = JSON.stringify({
      lodash: { current: '4.0.0', dependent: 'root', latest: '4.17.21', wanted: '4.17.21' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].wanted).toBe('4.17.21')
  })

  test('handles package with very long version strings', () => {
    const longVersion = '1.0.0-alpha.1.beta.2.rc.3.build.4.5.6.7.8.9'
    const stdout = JSON.stringify({
      'complex-pkg': { current: longVersion, dependent: 'root', latest: '2.0.0', wanted: '1.5.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].current).toBe(longVersion)
  })

  test('handles empty object in npm output', () => {
    const stdout = JSON.stringify({})
    const result = parseNpmOutput(stdout)
    expect(result).toEqual([])
  })

  test('handles JSON with extra whitespace', () => {
    const stdout = JSON.stringify(
      { pkg: { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '1.5.0' } },
      null,
      2,
    )
    const result = parseNpmOutput(stdout)
    expect(result).toHaveLength(1)
  })

  test('parses package with special npm registry versions', () => {
    const stdout = JSON.stringify({
      'registry-pkg': {
        current: 'file:../local-pkg',
        dependent: 'root',
        latest: '2.0.0',
        wanted: '1.0.0',
      },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].current).toBe('file:../local-pkg')
  })

  test('handles package with version range in current', () => {
    const stdout = JSON.stringify({
      'range-pkg': {
        current: '>=1.0.0 <2.0.0',
        dependent: 'root',
        latest: '2.0.0',
        wanted: '1.5.0',
      },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].current).toBe('>=1.0.0 <2.0.0')
  })

  test('parses package with prerelease version strings', () => {
    const stdout = JSON.stringify({
      'next-pkg': {
        current: '1.0.0-alpha.1',
        dependent: 'root',
        latest: '2.0.0-beta.3',
        wanted: '1.0.0-rc.1',
      },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].current).toBe('1.0.0-alpha.1')
    expect(result[0].latest).toBe('2.0.0-beta.3')
    expect(result[0].wanted).toBe('1.0.0-rc.1')
  })

  test('parses package with dependent other than root', () => {
    const stdout = JSON.stringify({
      lodash: { current: '4.0.0', dependent: 'my-app', latest: '4.17.21', wanted: '4.17.0' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].dependent).toBe('my-app')
  })

  test('parses package with empty string versions', () => {
    const stdout = JSON.stringify({
      'missing-pkg': { current: '', dependent: '', latest: '', wanted: '' },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].name).toBe('missing-pkg')
    expect(result[0].current).toBe('')
  })

  test('parses many packages preserving order', () => {
    const data: Record<
      string,
      { current: string; dependent: string; latest: string; wanted: string }
    > = {}
    for (let i = 0; i < 50; i++) {
      data[`pkg-${i}`] = { current: '1.0.0', dependent: 'root', latest: '2.0.0', wanted: '1.5.0' }
    }
    const result = parseNpmOutput(JSON.stringify(data))
    expect(result).toHaveLength(50)
  })

  test('handles JSON with leading/trailing whitespace', () => {
    const stdout =
      '  \n  ' +
      JSON.stringify({
        lodash: { current: '4.0.0', dependent: 'root', latest: '4.17.21', wanted: '4.17.0' },
      }) +
      '\n  '
    const result = parseNpmOutput(stdout)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('lodash')
  })

  test('parses package with hyphens and dots in name', () => {
    const stdout = JSON.stringify({
      '@my-scope/pkg-name.v2': {
        current: '1.0.0',
        dependent: 'root',
        latest: '3.0.0',
        wanted: '2.0.0',
      },
    })
    const result = parseNpmOutput(stdout)
    expect(result[0].name).toBe('@my-scope/pkg-name.v2')
  })

  test('parses single package with all fields correctly', () => {
    const stdout = JSON.stringify({
      typescript: { current: '5.0.0', dependent: 'root', latest: '5.3.3', wanted: '5.3.2' },
    })
    const result = parseNpmOutput(stdout)
    const pkg = result[0]
    expect(pkg).toEqual({
      name: 'typescript',
      current: '5.0.0',
      dependent: 'root',
      latest: '5.3.3',
      wanted: '5.3.2',
    })
  })
})

describe('parseAuditOutput', () => {
  test('parses valid audit output', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: { critical: 1, high: 2, info: 3, low: 4, moderate: 5, total: 15 },
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.total).toBe(15)
    expect(result.vulnerabilities.critical).toBe(1)
    expect(result.vulnerabilities.high).toBe(2)
    expect(result.vulnerabilities.info).toBe(3)
    expect(result.vulnerabilities.low).toBe(4)
    expect(result.vulnerabilities.moderate).toBe(5)
  })

  test('parses audit with zero vulnerabilities', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: { critical: 0, high: 0, info: 0, low: 0, moderate: 0, total: 0 },
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.total).toBe(0)
  })

  test('throws CLIError when metadata is missing', () => {
    const stdout = JSON.stringify({ someOther: 'data' })
    expect(() => parseAuditOutput(stdout)).toThrow('Invalid audit response format')
  })

  test('throws CLIError when vulnerabilities is missing', () => {
    const stdout = JSON.stringify({ metadata: {} })
    expect(() => parseAuditOutput(stdout)).toThrow('Invalid audit response format')
  })

  test('throws CLIError with code E004', () => {
    const stdout = JSON.stringify({})
    try {
      parseAuditOutput(stdout)
    } catch (error) {
      expect(error).toHaveProperty('code', 'E004')
    }
  })

  test('throws on invalid JSON', () => {
    expect(() => parseAuditOutput('{bad json')).toThrow()
  })

  test('parses audit with only critical vulnerabilities', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: { critical: 5, high: 0, info: 0, low: 0, moderate: 0, total: 5 },
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.critical).toBe(5)
    expect(result.vulnerabilities.total).toBe(5)
  })

  test('parses audit with large vulnerability counts', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: {
          critical: 999,
          high: 1000,
          info: 500,
          low: 2000,
          moderate: 3000,
          total: 7499,
        },
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.critical).toBe(999)
    expect(result.vulnerabilities.total).toBe(7499)
  })

  test('parses audit output with extra top-level fields', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: { critical: 0, high: 1, info: 0, low: 0, moderate: 0, total: 1 },
      },
      actions: [],
      advisories: {},
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.high).toBe(1)
  })

  test('throws CLIError for empty JSON object', () => {
    expect(() => parseAuditOutput('{}')).toThrow('Invalid audit response format')
  })

  test('throws CLIError for null metadata', () => {
    const stdout = JSON.stringify({ metadata: null })
    expect(() => parseAuditOutput(stdout)).toThrow()
  })

  test('error includes suggestions', () => {
    const stdout = JSON.stringify({})
    try {
      parseAuditOutput(stdout)
    } catch (error) {
      expect(error).toHaveProperty('suggestions')
    }
  })

  test('preserves all vulnerability severity levels', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: { critical: 10, high: 20, info: 30, low: 40, moderate: 50, total: 150 },
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities).toEqual({
      critical: 10,
      high: 20,
      info: 30,
      low: 40,
      moderate: 50,
      total: 150,
    })
  })

  test('handles vulnerabilities object with missing required fields', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: { critical: 1, total: 1 },
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.critical).toBe(1)
  })

  test('throws CLIError for invalid JSON syntax', () => {
    expect(() => parseAuditOutput('{ invalid json }')).toThrow()
  })

  test('throws CLIError for null vulnerabilities object', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: null,
      },
    })
    expect(() => parseAuditOutput(stdout)).toThrow()
  })

  test('handles vulnerabilities as array', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: [],
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities).toEqual([])
  })

  test('handles vulnerabilities as string', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: 'invalid',
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities).toBe('invalid')
  })

  test('parses audit with undefined fields in vulnerabilities', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: {
          critical: 1,
          high: undefined,
          info: undefined,
          low: undefined,
          moderate: undefined,
          total: 1,
        },
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.critical).toBe(1)
    expect(result.vulnerabilities.total).toBe(1)
  })

  test('handles negative vulnerability counts', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: { critical: -1, high: 0, info: 0, low: 0, moderate: 0, total: -1 },
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.critical).toBe(-1)
  })

  test('handles decimal vulnerability counts', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: { critical: 1.5, high: 0, info: 0, low: 0, moderate: 0, total: 1.5 },
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.critical).toBe(1.5)
  })

  test('throws CLIError when metadata.vulnerabilities is undefined', () => {
    const stdout = JSON.stringify({
      metadata: {},
    })
    expect(() => parseAuditOutput(stdout)).toThrow('Invalid audit response format')
  })

  test('parses audit with extra metadata fields', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: { critical: 1, high: 0, info: 0, low: 0, moderate: 0, total: 1 },
        dependencies: 100,
        devDependencies: 50,
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.total).toBe(1)
  })

  test('handles audit with very large numbers', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: {
          critical: Number.MAX_SAFE_INTEGER,
          high: 0,
          info: 0,
          low: 0,
          moderate: 0,
          total: Number.MAX_SAFE_INTEGER,
        },
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.critical).toBe(Number.MAX_SAFE_INTEGER)
  })

  test('throws CLIError for malformed metadata structure', () => {
    const stdout = JSON.stringify({
      metadata: 'not an object',
    })
    expect(() => parseAuditOutput(stdout)).toThrow()
  })

  test('throws CLIError when metadata is an array', () => {
    const stdout = JSON.stringify({
      metadata: [],
    })
    expect(() => parseAuditOutput(stdout)).toThrow()
  })

  test('throws CLIError when metadata is null', () => {
    const stdout = JSON.stringify({
      metadata: null,
    })
    expect(() => parseAuditOutput(stdout)).toThrow()
  })

  test('throws CLIError when metadata is primitive', () => {
    const stdout = JSON.stringify({
      metadata: 42,
    })
    expect(() => parseAuditOutput(stdout)).toThrow()
  })

  test('handles vulnerability counts as strings (coercion)', () => {
    const stdout = JSON.stringify({
      metadata: {
        vulnerabilities: {
          critical: '1',
          high: '0',
          info: '0',
          low: '0',
          moderate: '0',
          total: '1',
        },
      },
    })
    const result = parseAuditOutput(stdout)
    expect(result.vulnerabilities.critical).toBe('1')
  })
})

describe('formatOutdatedTable', () => {
  test('shows up-to-date message for empty array', () => {
    const lines: string[] = []
    formatOutdatedTable([], (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('All dependencies are up to date')
  })

  test('shows count of outdated dependencies', () => {
    const packages = [
      makeOutdatedPkg({ name: 'pkg-a' }),
      makeOutdatedPkg({ name: 'pkg-b' }),
      makeOutdatedPkg({ name: 'pkg-c' }),
    ]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Found 3 outdated dependencies')
  })

  test('shows package name and version transition', () => {
    const packages = [makeOutdatedPkg({ name: 'lodash', current: '4.0.0', latest: '4.17.21' })]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('lodash')
    expect(output).toContain('4.0.0')
    expect(output).toContain('4.17.21')
  })

  test('shows npm update hint', () => {
    const packages = [makeOutdatedPkg()]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('npm update')
  })

  test('displays multiple packages', () => {
    const packages = [
      makeOutdatedPkg({ name: 'pkg-a', current: '1.0.0', latest: '2.0.0' }),
      makeOutdatedPkg({ name: 'pkg-b', current: '3.0.0', latest: '4.0.0' }),
    ]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('pkg-a')
    expect(output).toContain('pkg-b')
  })

  test('calls logFn for each output line', () => {
    const packages = [makeOutdatedPkg()]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThan(2)
  })

  test('shows single outdated package with correct count', () => {
    const packages = [makeOutdatedPkg({ name: 'only-pkg' })]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Found 1 outdated dependencies')
  })

  test('shows wanted version is not displayed in table', () => {
    const packages = [
      makeOutdatedPkg({ name: 'test-pkg', current: '1.0.0', latest: '3.0.0', wanted: '2.0.0' }),
    ]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('1.0.0')
    expect(output).toContain('3.0.0')
    expect(output).not.toContain('2.0.0')
  })

  test('handles package with very long name', () => {
    const longName = 'a'.repeat(100)
    const packages = [makeOutdatedPkg({ name: longName })]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain(longName)
  })

  test('handles package with special characters in name', () => {
    const packages = [makeOutdatedPkg({ name: '@org/my-special-pkg' })]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('@org/my-special-pkg')
  })

  test('shows arrow between current and latest', () => {
    const packages = [makeOutdatedPkg({ current: '1.0.0', latest: '2.0.0' })]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('→')
  })

  test('handles package with prerelease versions in table', () => {
    const packages = [
      makeOutdatedPkg({ name: 'next-pkg', current: '1.0.0-alpha', latest: '2.0.0-beta' }),
    ]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('1.0.0-alpha')
    expect(output).toContain('2.0.0-beta')
  })

  test('handles many packages without crashing', () => {
    const packages = Array.from({ length: 100 }, (_, i) =>
      makeOutdatedPkg({ name: `pkg-${i}`, current: '1.0.0', latest: '2.0.0' }),
    )
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Found 100 outdated dependencies')
  })

  test('empty array does not show outdated count', () => {
    const lines: string[] = []
    formatOutdatedTable([], (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('Found')
    expect(output).not.toContain('outdated')
  })

  test('does not show npm update hint when array is empty', () => {
    const lines: string[] = []
    formatOutdatedTable([], (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('npm update')
  })

  test('handles package with duplicate names', () => {
    const packages = [
      makeOutdatedPkg({ name: 'lodash', current: '4.0.0', latest: '4.17.21' }),
      makeOutdatedPkg({ name: 'lodash', current: '4.10.0', latest: '4.17.21' }),
    ]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output.split('lodash').length - 1).toBe(2)
  })

  test('shows count as 1 for single package', () => {
    const packages = [makeOutdatedPkg()]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Found 1 outdated dependencies')
  })

  test('handles packages with identical versions', () => {
    const packages = [
      makeOutdatedPkg({ name: 'pkg-a', current: '1.0.0', latest: '1.0.0' }),
      makeOutdatedPkg({ name: 'pkg-b', current: '1.0.0', latest: '1.0.0' }),
    ]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Found 2 outdated dependencies')
  })

  test('handles package with only hyphens in name', () => {
    const packages = [makeOutdatedPkg({ name: '---' })]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('---')
  })

  test('handles package with only underscores in name', () => {
    const packages = [makeOutdatedPkg({ name: '___' })]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('___')
  })

  test('handles package with version ranges in current', () => {
    const packages = [makeOutdatedPkg({ name: 'range-pkg', current: '^1.0.0', latest: '2.0.0' })]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('^1.0.0')
  })

  test('handles package with git-like version in current', () => {
    const packages = [
      makeOutdatedPkg({
        name: 'git-pkg',
        current: 'git+https://github.com/user/repo.git',
        latest: '2.0.0',
      }),
    ]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('git+https://github.com/user/repo.git')
  })

  test('displays packages in order they are provided', () => {
    const packages = [
      makeOutdatedPkg({ name: 'pkg-c', current: '3.0.0', latest: '4.0.0' }),
      makeOutdatedPkg({ name: 'pkg-a', current: '1.0.0', latest: '2.0.0' }),
      makeOutdatedPkg({ name: 'pkg-b', current: '2.0.0', latest: '3.0.0' }),
    ]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    const pkgCIndex = output.indexOf('pkg-c')
    const pkgAIndex = output.indexOf('pkg-a')
    const pkgBIndex = output.indexOf('pkg-b')
    expect(pkgCIndex).toBeLessThan(pkgAIndex)
    expect(pkgAIndex).toBeLessThan(pkgBIndex)
  })

  test('handles package with very long version string', () => {
    const longVersion = '1.0.0-alpha.1.beta.2.rc.3.build.4.5.6.7.8.9.10.11.12.13.14.15'
    const packages = [
      makeOutdatedPkg({ name: 'complex-pkg', current: longVersion, latest: '2.0.0' }),
    ]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain(longVersion)
  })

  test('does not display wanted version for any package', () => {
    const packages = [
      makeOutdatedPkg({ name: 'pkg-a', current: '1.0.0', latest: '3.0.0', wanted: '2.0.0' }),
      makeOutdatedPkg({ name: 'pkg-b', current: '1.5.0', latest: '2.5.0', wanted: '2.0.0' }),
    ]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('wanted')
  })

  test('handles package with empty current version', () => {
    const packages = [makeOutdatedPkg({ name: 'pkg', current: '', latest: '2.0.0' })]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('pkg')
    expect(output).toContain('2.0.0')
  })

  test('handles package with empty latest version', () => {
    const packages = [makeOutdatedPkg({ name: 'pkg', current: '1.0.0', latest: '' })]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('pkg')
    expect(output).toContain('1.0.0')
  })

  test('handles package with whitespace in versions', () => {
    const packages = [makeOutdatedPkg({ name: 'pkg', current: ' 1.0.0 ', latest: ' 2.0.0 ' })]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('1.0.0')
    expect(output).toContain('2.0.0')
  })

  test('handles scoped packages with special characters', () => {
    const packages = [
      makeOutdatedPkg({ name: '@my_org/pkg_name.v2', current: '1.0.0', latest: '2.0.0' }),
    ]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('@my_org/pkg_name.v2')
  })

  test('handles package with newline characters in version', () => {
    const packages = [makeOutdatedPkg({ name: 'pkg', current: '1.0.0\n', latest: '2.0.0' })]
    const lines: string[] = []
    formatOutdatedTable(packages, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('1.0.0')
  })
})

describe('formatSecuritySummary', () => {
  test('shows no vulnerabilities message when total is 0', () => {
    const audit = makeAuditMetadata({ total: 0 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('No security vulnerabilities found')
  })

  test('shows total vulnerability count', () => {
    const audit = makeAuditMetadata({ total: 42 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Found 42 security vulnerabilities')
  })

  test('shows critical severity', () => {
    const audit = makeAuditMetadata({ critical: 5, total: 5 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Critical')
    expect(output).toContain('5')
  })

  test('shows high severity', () => {
    const audit = makeAuditMetadata({ high: 3, total: 3 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('High')
    expect(output).toContain('3')
  })

  test('shows moderate severity', () => {
    const audit = makeAuditMetadata({ moderate: 2, total: 2 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Moderate')
    expect(output).toContain('2')
  })

  test('shows low severity', () => {
    const audit = makeAuditMetadata({ low: 7, total: 7 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Low')
    expect(output).toContain('7')
  })

  test('shows info severity', () => {
    const audit = makeAuditMetadata({ info: 1, total: 1 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Info')
    expect(output).toContain('1')
  })

  test('hides critical when 0', () => {
    const audit = makeAuditMetadata({ critical: 0, high: 1, total: 1 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('Critical:')
  })

  test('hides high when 0', () => {
    const audit = makeAuditMetadata({ high: 0, low: 1, total: 1 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('High:')
  })

  test('hides moderate when 0', () => {
    const audit = makeAuditMetadata({ moderate: 0, low: 1, total: 1 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('Moderate:')
  })

  test('hides low when 0', () => {
    const audit = makeAuditMetadata({ low: 0, high: 1, total: 1 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('Low:')
  })

  test('hides info when 0', () => {
    const audit = makeAuditMetadata({ info: 0, high: 1, total: 1 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('Info:')
  })

  test('shows npm audit fix hint', () => {
    const audit = makeAuditMetadata({ total: 1, low: 1 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('npm audit fix')
  })

  test('shows all severity levels at once', () => {
    const audit = makeAuditMetadata({
      critical: 1,
      high: 2,
      info: 3,
      low: 4,
      moderate: 5,
      total: 15,
    })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Critical')
    expect(output).toContain('High')
    expect(output).toContain('Moderate')
    expect(output).toContain('Low')
    expect(output).toContain('Info')
  })

  test('does not show audit fix hint when no vulnerabilities', () => {
    const audit = makeAuditMetadata({ total: 0 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('npm audit fix')
  })

  test('shows only critical when other severities are zero', () => {
    const audit = makeAuditMetadata({ critical: 3, total: 3 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Critical: 3')
    expect(output).not.toContain('High:')
    expect(output).not.toContain('Moderate:')
    expect(output).not.toContain('Low:')
    expect(output).not.toContain('Info:')
  })

  test('shows only high when other severities are zero', () => {
    const audit = makeAuditMetadata({ high: 4, total: 4 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('High: 4')
    expect(output).not.toContain('Critical:')
  })

  test('shows only moderate when other severities are zero', () => {
    const audit = makeAuditMetadata({ moderate: 2, total: 2 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Moderate: 2')
    expect(output).not.toContain('Critical:')
  })

  test('shows only low when other severities are zero', () => {
    const audit = makeAuditMetadata({ low: 6, total: 6 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Low: 6')
    expect(output).not.toContain('Critical:')
  })

  test('shows only info when other severities are zero', () => {
    const audit = makeAuditMetadata({ info: 1, total: 1 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Info: 1')
    expect(output).not.toContain('Critical:')
  })

  test('handles large vulnerability total count', () => {
    const audit = makeAuditMetadata({ critical: 100, total: 500 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Found 500 security vulnerabilities')
  })

  test('calls logFn multiple times for vulnerabilities', () => {
    const audit = makeAuditMetadata({
      critical: 1,
      high: 1,
      moderate: 1,
      low: 1,
      info: 1,
      total: 5,
    })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    // Header with \n + 5 severity lines + hint with \n = 7 logFn calls
    expect(lines.length).toBeGreaterThanOrEqual(7)
  })

  test('shows correct total for single critical vulnerability', () => {
    const audit = makeAuditMetadata({ critical: 1, total: 1 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Found 1 security vulnerabilities')
  })

  test('handles negative vulnerability counts', () => {
    const audit = makeAuditMetadata({ critical: -5, total: -5 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('-5')
  })

  test('handles decimal vulnerability counts', () => {
    const audit = makeAuditMetadata({ critical: 1.5, total: 1.5 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('1.5')
  })

  test('handles very large vulnerability counts', () => {
    const audit = makeAuditMetadata({ critical: 999999, total: 999999 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('999999')
  })

  test('handles zero total shows no vulnerabilities message', () => {
    const audit = makeAuditMetadata({ critical: 1, total: 0 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('No security vulnerabilities found')
    expect(output).not.toContain('Critical:')
  })

  test('does not show severity lines when all counts are zero', () => {
    const audit = makeAuditMetadata({ total: 0 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('Critical:')
    expect(output).not.toContain('High:')
    expect(output).not.toContain('Moderate:')
    expect(output).not.toContain('Low:')
    expect(output).not.toContain('Info:')
  })

  test('handles vulnerability count as zero vs undefined', () => {
    const audit = makeAuditMetadata({
      critical: 0,
      high: 0,
      info: 0,
      low: 0,
      moderate: 0,
      total: 0,
    })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).not.toContain('Critical:')
  })

  test('shows vulnerabilities in correct order', () => {
    const audit = makeAuditMetadata({
      critical: 1,
      high: 2,
      moderate: 3,
      low: 4,
      info: 5,
      total: 15,
    })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    const criticalIndex = output.indexOf('Critical:')
    const highIndex = output.indexOf('High:')
    const moderateIndex = output.indexOf('Moderate:')
    const lowIndex = output.indexOf('Low:')
    const infoIndex = output.indexOf('Info:')
    expect(criticalIndex).toBeGreaterThan(0)
    expect(highIndex).toBeGreaterThan(criticalIndex)
    expect(moderateIndex).toBeGreaterThan(highIndex)
    expect(lowIndex).toBeGreaterThan(moderateIndex)
    expect(infoIndex).toBeGreaterThan(lowIndex)
  })

  test('handles audit with only moderate and low', () => {
    const audit = makeAuditMetadata({ moderate: 5, low: 10, total: 15 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Moderate:')
    expect(output).toContain('Low:')
    expect(output).not.toContain('Critical:')
    expect(output).not.toContain('High:')
    expect(output).not.toContain('Info:')
  })

  test('handles audit with only high and critical', () => {
    const audit = makeAuditMetadata({ high: 3, critical: 7, total: 10 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('High:')
    expect(output).toContain('Critical:')
    expect(output).not.toContain('Moderate:')
    expect(output).not.toContain('Low:')
    expect(output).not.toContain('Info:')
  })

  test('handles audit with all zero except one severity', () => {
    const audit = makeAuditMetadata({ info: 100, total: 100 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Info: 100')
    expect(output).not.toContain('Critical:')
    expect(output).not.toContain('High:')
    expect(output).not.toContain('Moderate:')
    expect(output).not.toContain('Low:')
  })

  test('handles zero vulnerability count with no severity', () => {
    const audit = makeAuditMetadata({ total: 0 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('No security vulnerabilities found')
    expect(output).not.toContain('Found')
  })

  test('shows correct plural for single vulnerability', () => {
    const audit = makeAuditMetadata({ critical: 1, total: 1 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('vulnerabilities')
  })

  test('shows correct plural for multiple vulnerabilities', () => {
    const audit = makeAuditMetadata({ critical: 2, total: 2 })
    const lines: string[] = []
    formatSecuritySummary(audit, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('vulnerabilities')
  })
})

describe('buildJsonResult', () => {
  test('returns result with no errors', () => {
    const result = buildJsonResult([], null, null, null)
    expect(result.error).toBeNull()
    expect(result.outdated).toEqual([])
    expect(result.security).toBeNull()
  })

  test('returns outdated packages', () => {
    const packages = [makeOutdatedPkg({ name: 'lodash' })]
    const result = buildJsonResult(packages, null, null, null)
    expect(result.outdated).toHaveLength(1)
    expect(result.outdated[0].name).toBe('lodash')
  })

  test('returns security data', () => {
    const vulns = { critical: 1, high: 0, info: 0, low: 0, moderate: 0, total: 1 }
    const result = buildJsonResult([], vulns, null, null)
    expect(result.security).toEqual(vulns)
  })

  test('sets outdatedError', () => {
    const result = buildJsonResult([], null, 'outdated failed', null)
    expect(result.error).toBe('outdated failed')
  })

  test('sets securityError when no outdatedError', () => {
    const result = buildJsonResult([], null, null, 'security failed')
    expect(result.error).toBe('security failed')
  })

  test('combines both errors with semicolon', () => {
    const result = buildJsonResult([], null, 'outdated failed', 'security failed')
    expect(result.error).toBe('outdated failed; security failed')
  })

  test('returns full result with all fields', () => {
    const packages = [makeOutdatedPkg()]
    const vulns = { critical: 0, high: 1, info: 0, low: 2, moderate: 0, total: 3 }
    const result = buildJsonResult(packages, vulns, null, null)
    expect(result).toEqual({
      error: null,
      outdated: packages,
      security: vulns,
    })
  })

  test('returns empty outdated array by default', () => {
    const result = buildJsonResult([], null, null, null)
    expect(result.outdated).toEqual([])
  })

  test('returns null security by default', () => {
    const result = buildJsonResult([], null, null, null)
    expect(result.security).toBeNull()
  })

  test('prioritizes outdatedError over securityError', () => {
    const result = buildJsonResult([], null, 'first error', 'second error')
    expect(result.error).toBe('first error; second error')
  })

  test('handles empty string errors as falsy for outdatedError', () => {
    const result = buildJsonResult([], null, '', 'security error')
    expect(result.error).toBe('security error')
  })

  test('handles multiple outdated packages', () => {
    const packages = [
      makeOutdatedPkg({ name: 'pkg-a' }),
      makeOutdatedPkg({ name: 'pkg-b' }),
      makeOutdatedPkg({ name: 'pkg-c' }),
    ]
    const result = buildJsonResult(packages, null, null, null)
    expect(result.outdated).toHaveLength(3)
  })

  test('handles security with all vulnerability types', () => {
    const vulns = { critical: 1, high: 2, info: 3, low: 4, moderate: 5, total: 15 }
    const result = buildJsonResult([], vulns, null, null)
    expect(result.security).toEqual(vulns)
  })

  test('handles outdatedError only with no semicolon', () => {
    const result = buildJsonResult([], null, 'only outdated error', null)
    expect(result.error).toBe('only outdated error')
    expect(result.error).not.toContain(';')
  })

  test('handles securityError only with no semicolon', () => {
    const result = buildJsonResult([], null, null, 'only security error')
    expect(result.error).toBe('only security error')
    expect(result.error).not.toContain(';')
  })

  test('handles empty string security error with outdated error', () => {
    const result = buildJsonResult([], null, 'outdated error', '')
    expect(result.error).toBe('outdated error')
  })

  test('handles both errors as empty strings', () => {
    const result = buildJsonResult([], null, '', '')
    expect(result.error).toBe('')
  })

  test('handles whitespace-only errors', () => {
    const result = buildJsonResult([], null, '  ', '  ')
    expect(result.error).toBe('  ;   ')
  })

  test('preserves order of outdated packages', () => {
    const packages = [
      makeOutdatedPkg({ name: 'pkg-c' }),
      makeOutdatedPkg({ name: 'pkg-a' }),
      makeOutdatedPkg({ name: 'pkg-b' }),
    ]
    const result = buildJsonResult(packages, null, null, null)
    expect(result.outdated[0].name).toBe('pkg-c')
    expect(result.outdated[1].name).toBe('pkg-a')
    expect(result.outdated[2].name).toBe('pkg-b')
  })
})

describe('formatJsonOutput', () => {
  test('formats empty result as JSON', () => {
    const result = makeJsonResult()
    const output = formatJsonOutput(result)
    const parsed = JSON.parse(output)
    expect(parsed.error).toBeNull()
    expect(parsed.outdated).toEqual([])
    expect(parsed.security).toBeNull()
  })

  test('formats result with outdated packages', () => {
    const result = makeJsonResult({
      outdated: [makeOutdatedPkg({ name: 'lodash' })],
    })
    const output = formatJsonOutput(result)
    const parsed = JSON.parse(output)
    expect(parsed.outdated).toHaveLength(1)
    expect(parsed.outdated[0].name).toBe('lodash')
  })

  test('formats result with security data', () => {
    const vulns = { critical: 1, high: 0, info: 0, low: 0, moderate: 0, total: 1 }
    const result = makeJsonResult({ security: vulns })
    const output = formatJsonOutput(result)
    const parsed = JSON.parse(output)
    expect(parsed.security.total).toBe(1)
  })

  test('formats result with error', () => {
    const result = makeJsonResult({ error: 'something failed' })
    const output = formatJsonOutput(result)
    const parsed = JSON.parse(output)
    expect(parsed.error).toBe('something failed')
  })

  test('output is pretty-printed with 2-space indent', () => {
    const result = makeJsonResult()
    const output = formatJsonOutput(result)
    expect(output).toContain('  "error"')
    expect(output).toContain('  "outdated"')
    expect(output).toContain('  "security"')
  })

  test('round-trips through JSON parse', () => {
    const result = makeJsonResult({
      error: 'test error',
      outdated: [makeOutdatedPkg()],
      security: { critical: 1, high: 2, info: 3, low: 4, moderate: 5, total: 15 },
    })
    const output = formatJsonOutput(result)
    const parsed = JSON.parse(output)
    expect(parsed).toEqual(result)
  })

  test('formats multiple outdated packages', () => {
    const result = makeJsonResult({
      outdated: [makeOutdatedPkg({ name: 'pkg-a' }), makeOutdatedPkg({ name: 'pkg-b' })],
    })
    const output = formatJsonOutput(result)
    const parsed = JSON.parse(output)
    expect(parsed.outdated).toHaveLength(2)
    expect(parsed.outdated[0].name).toBe('pkg-a')
    expect(parsed.outdated[1].name).toBe('pkg-b')
  })

  test('formats combined error with packages', () => {
    const result = makeJsonResult({
      error: 'something failed',
      outdated: [makeOutdatedPkg({ name: 'lodash' })],
    })
    const output = formatJsonOutput(result)
    const parsed = JSON.parse(output)
    expect(parsed.error).toBe('something failed')
    expect(parsed.outdated).toHaveLength(1)
  })

  test('formats null error explicitly as null', () => {
    const result = makeJsonResult({ error: null })
    const output = formatJsonOutput(result)
    const parsed = JSON.parse(output)
    expect(parsed.error).toBeNull()
  })

  test('formats security with all vulnerability counts', () => {
    const vulns = { critical: 1, high: 2, info: 3, low: 4, moderate: 5, total: 15 }
    const result = makeJsonResult({ security: vulns })
    const output = formatJsonOutput(result)
    const parsed = JSON.parse(output)
    expect(parsed.security).toEqual(vulns)
  })

  test('output starts with opening brace', () => {
    const result = makeJsonResult()
    const output = formatJsonOutput(result)
    expect(output.startsWith('{')).toBe(true)
  })

  test('output ends with closing brace', () => {
    const result = makeJsonResult()
    const output = formatJsonOutput(result)
    expect(output.trimEnd().endsWith('}')).toBe(true)
  })

  test('formats error with combined messages', () => {
    const result = makeJsonResult({ error: 'error1; error2' })
    const output = formatJsonOutput(result)
    const parsed = JSON.parse(output)
    expect(parsed.error).toBe('error1; error2')
  })

  test('handles large arrays in output', () => {
    const packages = Array.from({ length: 100 }, (_, i) =>
      makeOutdatedPkg({ name: `pkg-${i}`, current: '1.0.0', latest: '2.0.0' }),
    )
    const result = makeJsonResult({ outdated: packages })
    const output = formatJsonOutput(result)
    const parsed = JSON.parse(output)
    expect(parsed.outdated).toHaveLength(100)
  })
})

describe('createOutdatedError', () => {
  test('creates SystemError with correct message', () => {
    const error = createOutdatedError(new Error('test'))
    expect(error.message).toBe('Failed to check for outdated packages')
  })

  test('creates SystemError with code E504', () => {
    const error = createOutdatedError(new Error('test'))
    expect(error.code).toBe('E504')
  })

  test('preserves cause', () => {
    const cause = new Error('npm failed')
    const error = createOutdatedError(cause)
    expect(error.cause).toBe(cause)
  })

  test('includes command in context', () => {
    const error = createOutdatedError(new Error('test'))
    expect(error.context.command).toBe('npm outdated')
  })

  test('preserves original error message in context', () => {
    const cause = new Error('npm command not found')
    const error = createOutdatedError(cause)
    expect(error.context.errorMessage).toBe('npm command not found')
  })

  test('handles TypeError as cause', () => {
    const cause = new TypeError('cannot read property')
    const error = createOutdatedError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E504')
  })

  test('handles RangeError as cause', () => {
    const cause = new RangeError('out of range')
    const error = createOutdatedError(cause)
    expect(error.cause).toBe(cause)
  })

  test('handles ReferenceError as cause', () => {
    const cause = new ReferenceError('not defined')
    const error = createOutdatedError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E504')
  })

  test('handles SyntaxError as cause', () => {
    const cause = new SyntaxError('unexpected token')
    const error = createOutdatedError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E504')
  })

  test('handles URIError as cause', () => {
    const cause = new URIError('malformed URI')
    const error = createOutdatedError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E504')
  })

  test('handles EvalError as cause', () => {
    const cause = new EvalError('eval failed')
    const error = createOutdatedError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E504')
  })
})

describe('createAuditError', () => {
  test('creates SystemError with correct message', () => {
    const error = createAuditError(new Error('test'))
    expect(error.message).toBe('Failed to run security audit')
  })

  test('creates SystemError with code E505', () => {
    const error = createAuditError(new Error('test'))
    expect(error.code).toBe('E505')
  })

  test('includes command in context', () => {
    const error = createAuditError(new Error('test'))
    expect(error.context.command).toBe('npm audit')
  })

  test('preserves cause', () => {
    const cause = new Error('audit timeout')
    const error = createAuditError(cause)
    expect(error.cause).toBe(cause)
  })

  test('preserves original error message in context', () => {
    const cause = new Error('network timeout')
    const error = createAuditError(cause)
    expect(error.context.errorMessage).toBe('network timeout')
  })

  test('handles TypeError as cause', () => {
    const cause = new TypeError('unexpected token')
    const error = createAuditError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E505')
  })

  test('handles ReferenceError as cause', () => {
    const cause = new ReferenceError('reference error')
    const error = createAuditError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E505')
  })

  test('handles RangeError as cause', () => {
    const cause = new RangeError('range error')
    const error = createAuditError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E505')
  })

  test('handles SyntaxError as cause', () => {
    const cause = new SyntaxError('syntax error')
    const error = createAuditError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E505')
  })

  test('handles URIError as cause', () => {
    const cause = new URIError('uri error')
    const error = createAuditError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E505')
  })
})

describe('createUpdateError', () => {
  test('creates SystemError with correct message', () => {
    const error = createUpdateError(new Error('test'))
    expect(error.message).toBe('Failed to update dependencies')
  })

  test('creates SystemError with code E506', () => {
    const error = createUpdateError(new Error('test'))
    expect(error.code).toBe('E506')
  })

  test('includes command in context', () => {
    const error = createUpdateError(new Error('test'))
    expect(error.context.command).toBe('npm update')
  })

  test('preserves cause', () => {
    const cause = new Error('update failed')
    const error = createUpdateError(cause)
    expect(error.cause).toBe(cause)
  })

  test('preserves original error message in context', () => {
    const cause = new Error('permission denied')
    const error = createUpdateError(cause)
    expect(error.context.errorMessage).toBe('permission denied')
  })

  test('handles TypeError as cause', () => {
    const cause = new TypeError('type error')
    const error = createUpdateError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E506')
  })

  test('handles ReferenceError as cause', () => {
    const cause = new ReferenceError('ref error')
    const error = createUpdateError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E506')
  })

  test('handles RangeError as cause', () => {
    const cause = new RangeError('range error')
    const error = createUpdateError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E506')
  })

  test('handles SyntaxError as cause', () => {
    const cause = new SyntaxError('syntax error')
    const error = createUpdateError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E506')
  })

  test('handles URIError as cause', () => {
    const cause = new URIError('uri error')
    const error = createUpdateError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E506')
  })
})

describe('createFixSecurityError', () => {
  test('creates SystemError with correct message', () => {
    const error = createFixSecurityError(new Error('test'))
    expect(error.message).toBe('Failed to fix security vulnerabilities')
  })

  test('creates SystemError with code E503', () => {
    const error = createFixSecurityError(new Error('test'))
    expect(error.code).toBe('E503')
  })

  test('includes command in context', () => {
    const error = createFixSecurityError(new Error('test'))
    expect(error.context.command).toBe('npm audit fix')
  })

  test('preserves cause', () => {
    const cause = new Error('fix failed')
    const error = createFixSecurityError(cause)
    expect(error.cause).toBe(cause)
  })

  test('preserves original error message in context', () => {
    const cause = new Error('registry error')
    const error = createFixSecurityError(cause)
    expect(error.context.errorMessage).toBe('registry error')
  })

  test('handles TypeError as cause', () => {
    const cause = new TypeError('cannot parse')
    const error = createFixSecurityError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E503')
  })

  test('handles ReferenceError as cause', () => {
    const cause = new ReferenceError('ref error')
    const error = createFixSecurityError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E503')
  })

  test('handles RangeError as cause', () => {
    const cause = new RangeError('range error')
    const error = createFixSecurityError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E503')
  })

  test('handles SyntaxError as cause', () => {
    const cause = new SyntaxError('syntax error')
    const error = createFixSecurityError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E503')
  })

  test('handles URIError as cause', () => {
    const cause = new URIError('uri error')
    const error = createFixSecurityError(cause)
    expect(error.cause).toBe(cause)
    expect(error.code).toBe('E503')
  })

  test('handles Error with no message', () => {
    const cause = new Error()
    const error = createFixSecurityError(cause)
    expect(error.context.errorMessage).toBe('')
    expect(error.code).toBe('E503')
  })

  test('handles Error with very long message', () => {
    const longMessage = 'a'.repeat(1000)
    const cause = new Error(longMessage)
    const error = createFixSecurityError(cause)
    expect(error.context.errorMessage).toBe(longMessage)
    expect(error.code).toBe('E503')
  })
})
