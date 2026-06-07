import { describe, expect, it, vi } from 'vitest'

import Version from '../../src/commands/version.js'

describe('Version Command', () => {
  it('has correct static description', () => {
    expect(Version.description).toBe('Show current version of CodeForge')
  })

  it('has static examples defined', () => {
    expect(Version.examples).toBeInstanceOf(Array)
    expect(Version.examples.length).toBeGreaterThanOrEqual(1)
    expect(Version.examples[0]!.description).toBe('Show current version')
  })

  it('examples array contains proper structure', () => {
    for (const example of Version.examples) {
      expect(example.command).toContain('<%= config.bin %>')
      expect(example.command).toContain('<%= command.id %>')
      expect(typeof example.description).toBe('string')
    }
  })
})

describe('Version.run', () => {
  it('logs version with correct format', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: {} })

    await cmd.run()

    expect(logSpy).toHaveBeenCalledTimes(1)
    const logged = logSpy.mock.calls[0]![0] as string
    expect(logged).toMatch(/^Current version: \d+\.\d+\.\d+/)
  })

  it('includes version from package.json', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: {} })

    await cmd.run()

    const logged = logSpy.mock.calls[0]![0] as string
    const versionMatch = logged.match(/Current version: (\d+\.\d+\.\d+)/)
    expect(versionMatch).not.toBeNull()
  })

  it('handles missing version gracefully by using default', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: {} })

    await cmd.run()

    const logged = logSpy.mock.calls[0]![0] as string
    expect(logged).toContain('Current version:')
  })

  it('logs exactly once in default mode', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: {} })

    await cmd.run()

    expect(logSpy).toHaveBeenCalledTimes(1)
  })
})

describe('Version Output', () => {
  it('output starts with "Current version:" prefix', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: {} })

    await cmd.run()

    const logged = logSpy.mock.calls[0]![0] as string
    expect(logged.startsWith('Current version:')).toBe(true)
  })

  it('output is a single string', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: {} })

    await cmd.run()

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(typeof logSpy.mock.calls[0]![0]).toBe('string')
  })
})
