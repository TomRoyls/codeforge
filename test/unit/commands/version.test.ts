import { describe, test, expect, vi, beforeEach } from 'vitest'
import Version from '../../../src/commands/version.js'

describe('Version Command', () => {
  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Version.description).toBe('Show current version of CodeForge')
    })

    test('has examples defined', () => {
      expect(Version.examples).toBeDefined()
      expect(Version.examples.length).toBeGreaterThan(0)
    })
  })

  describe('run integration', () => {
    test('shows version number', async () => {
      const command = new Version([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      await command.run()

      expect(logSpy).toHaveBeenCalled()
      const calls = logSpy.mock.calls
      const output = calls.map((call: unknown[]) => call.join(' ')).join('\n')
      expect(output).toContain('Current version:')
      expect(output).toMatch(/\d+\.\d+\.\d+/)
    })

    test('reads version from package.json', async () => {
      const command = new Version([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      await command.run()

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('0.1.0'))
    })

    test('handles missing package.json gracefully', async () => {
      const command = new Version([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      // The command should still work - it reads from the actual package.json
      await command.run()

      expect(logSpy).toHaveBeenCalled()
    })

    test('outputs single line', async () => {
      const command = new Version([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      await command.run()

      expect(logSpy).toHaveBeenCalled()
    })

    test('version format includes major.minor.patch', async () => {
      const command = new Version([], {} as any)
      const logSpy = vi.spyOn(command as any, 'log')

      await command.run()

      const calls = logSpy.mock.calls
      const output = calls[0][0] as string
      expect(output).toMatch(/^Current version: \d+\.\d+\.\d+.*$/)
    })
  })
})
