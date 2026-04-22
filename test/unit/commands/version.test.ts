import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs'

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
}))

describe('Version Command', () => {
  let Version: typeof import('../../../src/commands/version.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.2.3' }))

    Version = (await import('../../../src/commands/version.js')).default
  })

  afterEach(() => {
    mockConsoleLog.mockRestore()
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Version.description).toBe('Show current version of CodeForge')
    })

    test('has examples defined', () => {
      expect(Version.examples).toBeDefined()
      expect(Version.examples.length).toBeGreaterThan(0)
    })
  })

  describe('run', () => {
    test('logs current version', async () => {
      const command = new Version([], {} as never)
      await command.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Current version:')
      expect(output).toContain('1.2.3')
    })

    test('reads package.json file', async () => {
      const command = new Version([], {} as never)
      await command.run()

      expect(fs.readFileSync).toHaveBeenCalled()
    })

    test('handles missing version field', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}))

      const command = new Version([], {} as never)
      await command.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Current version:')
      expect(output).toContain('0.0.0')
    })
  })

  describe('Command metadata - description', () => {
    test('description is a string', () => {
      expect(typeof Version.description).toBe('string')
    })

    test('description is non-empty', () => {
      expect(Version.description.length).toBeGreaterThan(0)
    })

    test('description mentions version', () => {
      expect(Version.description.toLowerCase()).toContain('version')
    })

    test('description mentions CodeForge', () => {
      expect(Version.description).toContain('CodeForge')
    })

    test('description starts with capital letter', () => {
      expect(Version.description[0]).toBe(Version.description[0].toUpperCase())
    })

    test('description does not end with period', () => {
      expect(Version.description.endsWith('.')).toBe(false)
    })
  })

  describe('Command metadata - examples', () => {
    test('examples is an array', () => {
      expect(Array.isArray(Version.examples)).toBe(true)
    })

    test('has exactly one example', () => {
      expect(Version.examples.length).toBe(1)
    })

    test('example has command property', () => {
      const example = Version.examples[0]
      expect(example).toHaveProperty('command')
    })

    test('example has description property', () => {
      const example = Version.examples[0]
      expect(example).toHaveProperty('description')
    })

    test('example command contains bin placeholder', () => {
      const example = Version.examples[0]
      expect(example.command).toContain('<%= config.bin %>')
    })

    test('example command contains command id placeholder', () => {
      const example = Version.examples[0]
      expect(example.command).toContain('<%= command.id %>')
    })

    test('example description is a string', () => {
      const example = Version.examples[0]
      expect(typeof example.description).toBe('string')
    })

    test('example description is non-empty', () => {
      const example = Version.examples[0]
      expect(example.description.length).toBeGreaterThan(0)
    })

    test('example description mentions version', () => {
      const example = Version.examples[0]
      expect(example.description.toLowerCase()).toContain('version')
    })
  })

  describe('Command instantiation', () => {
    test('can be instantiated with empty args', () => {
      const command = new Version([], {} as never)
      expect(command).toBeDefined()
    })

    test('instance has run method', () => {
      const command = new Version([], {} as never)
      expect(typeof command.run).toBe('function')
    })

    test('run method returns a promise', () => {
      const command = new Version([], {} as never)
      const result = command.run()
      expect(result).toBeInstanceOf(Promise)
      return result.catch(() => {})
    })

    test('can be instantiated with undefined args', () => {
      const command = new Version(undefined as never, {} as never)
      expect(command).toBeDefined()
    })

    test('multiple instances are independent', async () => {
      const command1 = new Version([], {} as never)
      const command2 = new Version([], {} as never)
      await command1.run()
      await command2.run()
      expect(mockConsoleLog).toHaveBeenCalledTimes(2)
    })
  })

  describe('run - basic version output', () => {
    test('output contains "Current version:" prefix', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Current version:')
    })

    test('output contains the version number from package.json', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('1.2.3')
    })

    test('calls log exactly once', async () => {
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
    })

    test('output format is "Current version: X.Y.Z"', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.2.3')
    })
  })

  describe('run - semver versions', () => {
    test('handles major.minor.patch format', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0')
    })

    test('handles version 0.0.0', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '0.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('handles version 0.0.1', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '0.0.1' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.1')
    })

    test('handles version 0.1.0', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '0.1.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.1.0')
    })

    test('handles version 1.0.0', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0')
    })

    test('handles version 10.20.30', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '10.20.30' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 10.20.30')
    })

    test('handles version with large major number', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '999.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 999.0.0')
    })

    test('handles version with large minor number', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.999.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.999.0')
    })

    test('handles version with large patch number', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.999' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.999')
    })
  })

  describe('run - prerelease versions', () => {
    test('handles alpha prerelease', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-alpha' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-alpha')
    })

    test('handles beta prerelease', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-beta' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-beta')
    })

    test('handles rc prerelease', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-rc.1' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-rc.1')
    })

    test('handles canary prerelease', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '2.0.0-canary.3' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 2.0.0-canary.3')
    })

    test('handles alpha with dot notation', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '3.1.0-alpha.1' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 3.1.0-alpha.1')
    })

    test('handles beta with dot notation', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '3.1.0-beta.2' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 3.1.0-beta.2')
    })

    test('handles dev prerelease', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-dev' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-dev')
    })

    test('handles next prerelease tag', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '5.0.0-next.7' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 5.0.0-next.7')
    })
  })

  describe('run - build metadata versions', () => {
    test('handles version with build metadata', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0+build.123' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0+build.123')
    })

    test('handles version with prerelease and build metadata', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ version: '1.0.0-alpha+build.001' }),
      )
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-alpha+build.001')
    })
  })

  describe('run - non-standard version strings', () => {
    test('handles single number version', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1')
    })

    test('handles two-part version', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.2' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.2')
    })

    test('handles version with v prefix', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: 'v1.2.3' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: v1.2.3')
    })

    test('handles version with leading zero', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '01.02.03' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 01.02.03')
    })

    test('handles empty string version as falsy fallback', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('handles version with dash separator', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1-2-3' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1-2-3')
    })

    test('handles version with text suffix', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.2.3-final' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.2.3-final')
    })

    test('handles very long version string', async () => {
      const longVersion = '1.2.3-alpha.beta.gamma.delta.epsilon.zeta.eta.theta.iota.kappa'
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: longVersion }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe(`Current version: ${longVersion}`)
    })
  })

  describe('run - missing or falsy version field', () => {
    test('falls back to 0.0.0 when version is undefined', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('falls back to 0.0.0 when version is null', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: null }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('falls back to 0.0.0 when version is false', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: false }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('falls back to 0.0.0 when version is 0', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: 0 }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('falls back to 0.0.0 when version is empty string', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('falls back to 0.0.0 when package.json has no version key', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ name: 'test' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('uses actual string version when present alongside other fields', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ name: 'codeforge', version: '4.5.6', description: 'test' }),
      )
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 4.5.6')
    })
  })

  describe('run - truthy non-string version values', () => {
    test('uses numeric version 1 as string', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: 1 }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1')
    })

    test('uses numeric version 42 as string', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: 42 }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 42')
    })

    test('uses numeric version 1.5 as string', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: 1.5 }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.5')
    })
  })

  describe('run - package.json contents variations', () => {
    test('reads version from complex package.json', async () => {
      const pkg = {
        name: 'codeforge',
        version: '7.8.9',
        description: 'A tool',
        main: 'index.js',
        scripts: { test: 'vitest' },
        dependencies: { lodash: '4.17.21' },
      }
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(pkg))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 7.8.9')
    })

    test('reads version from package.json with only version field', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '2.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 2.0.0')
    })

    test('reads version from deeply nested package.json', async () => {
      const pkg = {
        name: 'codeforge',
        version: '3.3.3',
        config: { nested: { deep: { value: true } } },
      }
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(pkg))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 3.3.3')
    })
  })

  describe('run - readFileSync behavior', () => {
    test('calls readFileSync exactly once', async () => {
      const command = new Version([], {} as never)
      await command.run()
      expect(fs.readFileSync).toHaveBeenCalledTimes(1)
    })

    test('calls readFileSync with utf8 encoding', async () => {
      const command = new Version([], {} as never)
      await command.run()
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.any(String), 'utf8')
    })

    test('calls readFileSync with a string path', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const callArgs = vi.mocked(fs.readFileSync).mock.calls[0]
      expect(typeof callArgs[0]).toBe('string')
    })

    test('path argument ends with package.json', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const callArgs = vi.mocked(fs.readFileSync).mock.calls[0]
      expect(callArgs[0]).toContain('package.json')
    })
  })

  describe('run - consecutive invocations', () => {
    test('produces consistent output on multiple runs', async () => {
      const command = new Version([], {} as never)
      await command.run()
      await command.run()
      await command.run()
      const calls = mockConsoleLog.mock.calls
      expect(calls.length).toBe(3)
      expect(calls[0][0]).toBe(calls[1][0])
      expect(calls[1][0]).toBe(calls[2][0])
    })

    test('reflects changed version between runs', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0' }))
      const command1 = new Version([], {} as never)
      await command1.run()

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '2.0.0' }))
      const command2 = new Version([], {} as never)
      await command2.run()

      const calls = mockConsoleLog.mock.calls
      expect(calls[0][0]).toBe('Current version: 1.0.0')
      expect(calls[1][0]).toBe('Current version: 2.0.0')
    })

    test('handles version changing from defined to undefined', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '5.0.0' }))
      const command1 = new Version([], {} as never)
      await command1.run()

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}))
      const command2 = new Version([], {} as never)
      await command2.run()

      const calls = mockConsoleLog.mock.calls
      expect(calls[0][0]).toBe('Current version: 5.0.0')
      expect(calls[1][0]).toBe('Current version: 0.0.0')
    })

    test('handles version changing from undefined to defined', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}))
      const command1 = new Version([], {} as never)
      await command1.run()

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '9.9.9' }))
      const command2 = new Version([], {} as never)
      await command2.run()

      const calls = mockConsoleLog.mock.calls
      expect(calls[0][0]).toBe('Current version: 0.0.0')
      expect(calls[1][0]).toBe('Current version: 9.9.9')
    })
  })

  describe('run - parallel command instances', () => {
    test('two commands can run concurrently', async () => {
      const command1 = new Version([], {} as never)
      const command2 = new Version([], {} as never)
      await Promise.all([command1.run(), command2.run()])
      expect(mockConsoleLog).toHaveBeenCalledTimes(2)
    })

    test('three commands can run concurrently', async () => {
      const command1 = new Version([], {} as never)
      const command2 = new Version([], {} as never)
      const command3 = new Version([], {} as never)
      await Promise.all([command1.run(), command2.run(), command3.run()])
      expect(mockConsoleLog).toHaveBeenCalledTimes(3)
    })

    test('concurrent commands produce same output', async () => {
      const command1 = new Version([], {} as never)
      const command2 = new Version([], {} as never)
      await Promise.all([command1.run(), command2.run()])
      const calls = mockConsoleLog.mock.calls
      expect(calls[0][0]).toBe(calls[1][0])
    })
  })

  describe('run - output format verification', () => {
    test('output starts with "Current version: "', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output.startsWith('Current version: ')).toBe(true)
    })

    test('output contains exactly one colon', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      const colonCount = output.split(':').length - 1
      expect(colonCount).toBe(1)
    })

    test('output has space after colon', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toContain(': ')
    })

    test('version value appears after the prefix', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      const prefix = 'Current version: '
      expect(output.startsWith(prefix)).toBe(true)
      const versionPart = output.slice(prefix.length)
      expect(versionPart).toBe('1.2.3')
    })
  })

  describe('run - special characters in version', () => {
    test('handles version with underscore', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-alpha_test' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-alpha_test')
    })

    test('handles version with plus sign', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0+build' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0+build')
    })

    test('handles version with dot in prerelease', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ version: '1.0.0-alpha.1.beta.2' }),
      )
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-alpha.1.beta.2')
    })

    test('handles version with uppercase letters', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-RC1' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-RC1')
    })

    test('handles version with all uppercase', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-ALPHA' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-ALPHA')
    })

    test('handles version with mixed case', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-Alpha' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-Alpha')
    })
  })

  describe('run - JSON parsing edge cases', () => {
    test('handles package.json with whitespace-only version', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '   ' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version:    ')
    })

    test('handles package.json with tab in version', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0\tbeta' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0\tbeta')
    })

    test('handles package.json with newline in version', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0\n' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0\n')
    })

    test('throws error on invalid JSON', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('not valid json {{{')
      const command = new Version([], {} as never)
      await expect(command.run()).rejects.toThrow()
    })

    test('throws error on malformed JSON', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('{version: "1.0.0"}')
      const command = new Version([], {} as never)
      await expect(command.run()).rejects.toThrow()
    })

    test('throws error on incomplete JSON', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('{"version": "1.0.0"')
      const command = new Version([], {} as never)
      await expect(command.run()).rejects.toThrow()
    })

    test('handles empty JSON object', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('{}')
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('handles JSON array (non-object)', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('[]')
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('throws error when JSON root is null', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('null')
      const command = new Version([], {} as never)
      await expect(command.run()).rejects.toThrow()
    })

    test('handles JSON number root', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('42')
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('handles JSON string root', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('"hello"')
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('handles JSON boolean root', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('true')
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })
  })

  describe('run - readFileSync error handling', () => {
    test('propagates error when readFileSync throws', async () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('ENOENT: no such file')
      })
      const command = new Version([], {} as never)
      await expect(command.run()).rejects.toThrow('ENOENT: no such file')
    })

    test('propagates permission error', async () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('EACCES: permission denied')
      })
      const command = new Version([], {} as never)
      await expect(command.run()).rejects.toThrow('EACCES: permission denied')
    })

    test('does not log when readFileSync throws', async () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('file error')
      })
      const command = new Version([], {} as never)
      try {
        await command.run()
      } catch {
        // expected
      }
      expect(mockConsoleLog).not.toHaveBeenCalled()
    })

    test('propagates TypeError', async () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new TypeError('invalid argument')
      })
      const command = new Version([], {} as never)
      await expect(command.run()).rejects.toThrow(TypeError)
    })
  })

  describe('run - specific version strings from real packages', () => {
    test('handles typical npm version: 0.1.0', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '0.1.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.1.0')
    })

    test('handles typical npm version: 1.0.0', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0')
    })

    test('handles typical npm version: 2.0.0-rc.0', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '2.0.0-rc.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 2.0.0-rc.0')
    })

    test('handles typical npm version: 4.17.21', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '4.17.21' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 4.17.21')
    })

    test('handles typical npm version: 18.17.0', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '18.17.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 18.17.0')
    })

    test('handles typical npm version: 20.11.1', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '20.11.1' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 20.11.1')
    })

    test('handles typical npm version: 100.0.0', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '100.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 100.0.0')
    })
  })

  describe('run - output does not include extra data', () => {
    test('does not include package name in output', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ name: 'my-secret-package', version: '1.0.0' }),
      )
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).not.toContain('my-secret-package')
    })

    test('does not include description in output', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ version: '1.0.0', description: 'secret description' }),
      )
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).not.toContain('secret description')
    })

    test('does not include dependencies in output', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ version: '1.0.0', dependencies: { lodash: '4.17.21' } }),
      )
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).not.toContain('lodash')
    })

    test('does not include author in output', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ version: '1.0.0', author: 'John Doe' }),
      )
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).not.toContain('John Doe')
    })

    test('does not include license in output', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ version: '1.0.0', license: 'MIT' }),
      )
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).not.toContain('MIT')
    })
  })

  describe('module import behavior', () => {
    test('default export is a class', async () => {
      const mod = await import('../../../src/commands/version.js')
      expect(typeof mod.default).toBe('function')
    })

    test('default export has static description', async () => {
      const mod = await import('../../../src/commands/version.js')
      expect(mod.default.description).toBeDefined()
    })

    test('default export has static examples', async () => {
      const mod = await import('../../../src/commands/version.js')
      expect(mod.default.examples).toBeDefined()
    })

    test('can create instance from imported default', async () => {
      const mod = await import('../../../src/commands/version.js')
      const command = new mod.default([], {} as never)
      expect(command).toBeDefined()
    })
  })

  describe('run - default version fallback behavior', () => {
    test('fallback 0.0.0 is used when version is NaN', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: NaN }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('fallback 0.0.0 is used when version is undefined', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: undefined }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0')
    })

    test('boolean true is used as version string', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: true }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: true')
    })

    test('array version is used as string', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: [1, 2, 3] }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1,2,3')
    })

    test('object version is used as string', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: { major: 1 } }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: [object Object]')
    })
  })

  describe('run - many rapid sequential invocations', () => {
    test('handles 5 rapid sequential runs', async () => {
      for (let i = 0; i < 5; i++) {
        const command = new Version([], {} as never)
        await command.run()
      }
      expect(mockConsoleLog).toHaveBeenCalledTimes(5)
    })

    test('handles 10 rapid sequential runs', async () => {
      for (let i = 0; i < 10; i++) {
        const command = new Version([], {} as never)
        await command.run()
      }
      expect(mockConsoleLog).toHaveBeenCalledTimes(10)
    })

    test('all 5 rapid runs produce same output', async () => {
      for (let i = 0; i < 5; i++) {
        const command = new Version([], {} as never)
        await command.run()
      }
      const calls = mockConsoleLog.mock.calls
      for (let i = 1; i < calls.length; i++) {
        expect(calls[i][0]).toBe(calls[0][0])
      }
    })
  })

  describe('run - alternating version values', () => {
    test('handles alternating versions correctly', async () => {
      const versions = ['1.0.0', '2.0.0', '1.0.0', '3.0.0', '2.0.0']
      for (const v of versions) {
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: v }))
        const command = new Version([], {} as never)
        await command.run()
      }
      const calls = mockConsoleLog.mock.calls
      expect(calls[0][0]).toBe('Current version: 1.0.0')
      expect(calls[1][0]).toBe('Current version: 2.0.0')
      expect(calls[2][0]).toBe('Current version: 1.0.0')
      expect(calls[3][0]).toBe('Current version: 3.0.0')
      expect(calls[4][0]).toBe('Current version: 2.0.0')
    })
  })

  describe('run - whitespace handling in JSON', () => {
    test('handles JSON with leading whitespace', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('  {"version": "1.0.0"}')
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0')
    })

    test('handles JSON with trailing whitespace', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('{"version": "1.0.0"}  ')
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0')
    })

    test('handles JSON with newlines', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('{\n  "version": "1.0.0"\n}')
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0')
    })

    test('handles pretty-printed JSON', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ version: '1.0.0', name: 'test' }, null, 2),
      )
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0')
    })

    test('handles JSON with tab indentation', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0' }, null, '\t'))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0')
    })
  })

  describe('run - version with special semver patterns', () => {
    test('handles version 0.0.0-semver', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '0.0.0-semver' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 0.0.0-semver')
    })

    test('handles version 1.0.0-0', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-0')
    })

    test('handles version 1.0.0-0.3.7', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-0.3.7' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-0.3.7')
    })

    test('handles version 1.0.0-x.7.z.92', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-x.7.z.92' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-x.7.z.92')
    })

    test('handles version 1.0.0-alpha+001', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-alpha+001' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-alpha+001')
    })

    test('handles version 1.0.0+20130313144700', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ version: '1.0.0+20130313144700' }),
      )
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0+20130313144700')
    })

    test('handles version 1.0.0-beta+exp.sha.5114f85', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ version: '1.0.0-beta+exp.sha.5114f85' }),
      )
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version: 1.0.0-beta+exp.sha.5114f85')
    })
  })

  describe('run - command run returns void', () => {
    test('run resolves to undefined', async () => {
      const command = new Version([], {} as never)
      const result = await command.run()
      expect(result).toBeUndefined()
    })
  })

  describe('run - mock state isolation', () => {
    test('changing mock between runs is respected', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0' }))
      const command1 = new Version([], {} as never)
      await command1.run()

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '2.0.0' }))
      const command2 = new Version([], {} as never)
      await command2.run()

      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1.0.0')
      expect(mockConsoleLog.mock.calls[1][0]).toBe('Current version: 2.0.0')
    })

    test('clearing mock does not affect new Version instance', async () => {
      const command1 = new Version([], {} as never)
      await command1.run()
      vi.clearAllMocks()
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '3.0.0' }))

      const command2 = new Version([], {} as never)
      await command2.run()
      expect(fs.readFileSync).toHaveBeenCalledTimes(1)
    })
  })

  describe('run - many distinct versions', () => {
    const versions = [
      '0.0.1',
      '0.1.0',
      '1.0.0',
      '1.0.1',
      '1.1.0',
      '2.0.0',
      '2.1.0',
      '2.1.1',
      '3.0.0',
      '3.0.1',
      '3.1.0',
      '3.1.1',
      '4.0.0',
      '4.0.1',
      '4.1.0',
      '5.0.0',
      '5.1.0',
      '6.0.0',
      '7.0.0',
      '8.0.0',
      '9.0.0',
      '10.0.0',
      '11.0.0',
      '12.0.0',
      '13.0.0',
      '14.0.0',
      '15.0.0',
      '16.0.0',
      '17.0.0',
      '18.0.0',
      '19.0.0',
      '20.0.0',
      '21.0.0',
      '22.0.0',
      '23.0.0',
      '24.0.0',
      '25.0.0',
      '26.0.0',
      '27.0.0',
      '28.0.0',
      '29.0.0',
      '30.0.0',
      '31.0.0',
      '32.0.0',
      '33.0.0',
      '34.0.0',
      '35.0.0',
      '36.0.0',
      '37.0.0',
      '38.0.0',
      '39.0.0',
      '40.0.0',
      '41.0.0',
      '42.0.0',
      '43.0.0',
    ]

    for (const v of versions) {
      test(`handles version ${v}`, async () => {
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: v }))
        const command = new Version([], {} as never)
        await command.run()
        const output = mockConsoleLog.mock.calls[0][0]
        expect(output).toBe(`Current version: ${v}`)
      })
    }
  })

  describe('run - whitespace-only version treated as falsy', () => {
    test('single space version is passed through', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: ' ' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version:  ')
    })

    test('multiple spaces version is passed through', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '   ' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output).toBe('Current version:    ')
    })
  })

  describe('run - command class hierarchy', () => {
    test('Version is a function (class)', () => {
      expect(typeof Version).toBe('function')
    })

    test('Version has prototype property run', () => {
      expect(Version.prototype).toHaveProperty('run')
    })

    test('run is an async method', () => {
      const command = new Version([], {} as never)
      expect(command.run()).toBeInstanceOf(Promise)
      return command.run().catch(() => {})
    })

    test('static description is defined on class', () => {
      expect(Version).toHaveProperty('description')
    })

    test('static examples is defined on class', () => {
      expect(Version).toHaveProperty('examples')
    })
  })

  describe('run - readFileSync call details', () => {
    test('readFileSync is called before log', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const fsCallOrder = vi.mocked(fs.readFileSync).mock.invocationCallOrder[0]
      const logCallOrder = mockConsoleLog.mock.invocationCallOrder[0]
      expect(fsCallOrder).toBeLessThan(logCallOrder)
    })

    test('readFileSync receives exactly two arguments', async () => {
      const command = new Version([], {} as never)
      await command.run()
      expect(vi.mocked(fs.readFileSync).mock.calls[0].length).toBe(2)
    })

    test('second argument to readFileSync is utf8', async () => {
      const command = new Version([], {} as never)
      await command.run()
      expect(vi.mocked(fs.readFileSync).mock.calls[0][1]).toBe('utf8')
    })

    test('first argument contains a path separator', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const path = vi.mocked(fs.readFileSync).mock.calls[0][0]
      expect(path).toContain('/')
    })

    test('readFileSync call count does not accumulate across separate runs', async () => {
      vi.clearAllMocks()
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0' }))
      const command1 = new Version([], {} as never)
      await command1.run()
      expect(fs.readFileSync).toHaveBeenCalledTimes(1)

      const command2 = new Version([], {} as never)
      await command2.run()
      expect(fs.readFileSync).toHaveBeenCalledTimes(2)
    })
  })

  describe('run - output string structure', () => {
    test('output contains exactly one space after colon', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      const prefix = 'Current version: '
      expect(output.slice(0, prefix.length)).toBe(prefix)
    })

    test('output prefix is 17 characters', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output.indexOf('1.2.3')).toBe(17)
    })

    test('output ends with the version string', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '4.5.6' }))
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output.endsWith('4.5.6')).toBe(true)
    })

    test('output has no trailing newline', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output.endsWith('\n')).toBe(false)
    })

    test('output has no leading whitespace', async () => {
      const command = new Version([], {} as never)
      await command.run()
      const output = mockConsoleLog.mock.calls[0][0]
      expect(output[0]).not.toBe(' ')
    })
  })

  describe('run - each describe block is independent', () => {
    test('version 99.99.99 is output correctly', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '99.99.99' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 99.99.99')
    })

    test('version 0.0.0 is output correctly', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '0.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 0.0.0')
    })

    test('mock is reset between tests - part 1', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '100.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 100.0.0')
    })

    test('mock is reset between tests - part 2', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '200.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 200.0.0')
    })

    test('mock is reset between tests - part 3', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '300.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 300.0.0')
    })

    test('mock is reset between tests - part 4', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '400.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 400.0.0')
    })

    test('mock is reset between tests - part 5', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '500.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 500.0.0')
    })

    test('mock is reset between tests - part 6', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '600.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 600.0.0')
    })

    test('mock is reset between tests - part 7', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '700.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 700.0.0')
    })

    test('mock is reset between tests - part 8', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '800.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 800.0.0')
    })

    test('mock is reset between tests - part 9', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '900.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 900.0.0')
    })

    test('mock is reset between tests - part 10', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1000.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1000.0.0')
    })
  })

  describe('run - prerelease versions batch 2', () => {
    const prereleaseVersions = [
      '1.0.0-alpha.1',
      '1.0.0-alpha.2',
      '1.0.0-alpha.10',
      '1.0.0-beta.1',
      '1.0.0-beta.2',
      '1.0.0-beta.10',
      '1.0.0-rc.1',
      '1.0.0-rc.2',
      '1.0.0-rc.10',
      '2.0.0-alpha.1',
      '2.0.0-beta.1',
      '2.0.0-rc.1',
    ]

    for (const v of prereleaseVersions) {
      test(`handles prerelease version ${v}`, async () => {
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: v }))
        const command = new Version([], {} as never)
        await command.run()
        const output = mockConsoleLog.mock.calls[0][0]
        expect(output).toBe(`Current version: ${v}`)
      })
    }
  })

  describe('run - patch versions batch', () => {
    const patchVersions = [
      '1.0.1',
      '1.0.2',
      '1.0.3',
      '1.0.4',
      '1.0.5',
      '1.0.6',
      '1.0.7',
      '1.0.8',
      '1.0.9',
      '1.0.10',
    ]

    for (const v of patchVersions) {
      test(`handles patch version ${v}`, async () => {
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: v }))
        const command = new Version([], {} as never)
        await command.run()
        const output = mockConsoleLog.mock.calls[0][0]
        expect(output).toBe(`Current version: ${v}`)
      })
    }
  })

  describe('run - minor versions batch', () => {
    const minorVersions = [
      '1.1.0',
      '1.2.0',
      '1.3.0',
      '1.4.0',
      '1.5.0',
      '1.6.0',
      '1.7.0',
      '1.8.0',
      '1.9.0',
      '1.10.0',
    ]

    for (const v of minorVersions) {
      test(`handles minor version ${v}`, async () => {
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: v }))
        const command = new Version([], {} as never)
        await command.run()
        const output = mockConsoleLog.mock.calls[0][0]
        expect(output).toBe(`Current version: ${v}`)
      })
    }
  })

  describe('run - log is called on command instance', () => {
    test('uses this.log not console.log directly for first call arg', async () => {
      const command = new Version([], {} as never)
      const logSpy = vi.spyOn(command, 'log')
      await command.run()
      expect(logSpy).toHaveBeenCalledWith('Current version: 1.2.3')
      logSpy.mockRestore()
    })
  })

  describe('run - version field types in package.json', () => {
    test('handles integer version 100', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: 100 }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 100')
    })

    test('handles float version 1.23', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: 1.23 }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1.23')
    })

    test('handles negative version string', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '-1.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: -1.0.0')
    })

    test('handles version string with spaces', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0 beta' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1.0.0 beta')
    })

    test('handles version string with hash', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-abc123' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1.0.0-abc123')
    })

    test('handles version string with date', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '2024.01.15' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 2024.01.15')
    })

    test('handles very short version "0"', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 0')
    })

    test('handles very short version "1"', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1')
    })

    test('handles version with tilde', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0~beta1' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1.0.0~beta1')
    })

    test('handles version with caret', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '^1.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: ^1.0.0')
    })

    test('handles version with equals sign', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '>=1.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: >=1.0.0')
    })

    test('handles single letter version', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: 'a' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: a')
    })

    test('handles unicode version string', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-α' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1.0.0-α')
    })

    test('handles version with emoji', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0-🚀' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1.0.0-🚀')
    })

    test('handles version with parentheses', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0(1)' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1.0.0(1)')
    })

    test('handles version starting with dot', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '.1.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: .1.0')
    })

    test('handles version ending with dot', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1.0.')
    })

    test('handles version with multiple dots', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0.0' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1.0.0.0')
    })

    test('handles version with only dots', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '...' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: ...')
    })

    test('handles version with asterisk', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '*' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: *')
    })

    test('handles version with x-range', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.x.x' }))
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 1.x.x')
    })

    test('handles very long numeric version parts', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ version: '9999999.9999999.9999999' }),
      )
      const command = new Version([], {} as never)
      await command.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Current version: 9999999.9999999.9999999')
    })
  })
})
