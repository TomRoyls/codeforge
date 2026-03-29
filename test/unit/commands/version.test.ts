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
})
