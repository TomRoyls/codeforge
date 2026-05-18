import { describe, expect, it, vi } from 'vitest'

import Version from '../../src/commands/version.js'

// ─── Command Setup ───

describe('Version Command', () => {
  it('has correct static description', () => {
    expect(Version.description).toBe('Show current version of CodeForge')
  })

  it('has static examples defined', () => {
    expect(Version.examples).toBeInstanceOf(Array)
    expect(Version.examples).toHaveLength(1)
    expect(Version.examples[0].description).toBe('Show current version')
  })

  it('examples array contains proper structure', () => {
    const example = Version.examples[0]!
    expect(example.command).toContain('<%= config.bin %>')
    expect(example.command).toContain('<%= command.id %>')
    expect(typeof example.description).toBe('string')
  })
})

// ─── Run Method ───

describe('Version.run', () => {
  it('logs version with correct format', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')

    await cmd.run()

    expect(logSpy).toHaveBeenCalledTimes(1)
    const logged = logSpy.mock.calls[0]![0] as string
    expect(logged).toMatch(/^Current version: [\d.]+$/)
  })

  it('includes version from package.json', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')

    await cmd.run()

    const logged = logSpy.mock.calls[0]![0] as string
    const version = logged.split(': ')[1]
    expect(version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('handles missing version gracefully by using default', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')

    await cmd.run()

    const logged = logSpy.mock.calls[0]![0] as string
    expect(logged).toContain('Current version:')
  })

  it('logs exactly once', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')

    await cmd.run()

    expect(logSpy).toHaveBeenCalledTimes(1)
  })
})

// ─── Output Format ───

describe('Version Output', () => {
  it('output starts with "Current version:" prefix', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')

    await cmd.run()

    const logged = logSpy.mock.calls[0]![0] as string
    expect(logged.startsWith('Current version:')).toBe(true)
  })

  it('output is a single string', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')

    await cmd.run()

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(typeof logSpy.mock.calls[0]![0]).toBe('string')
  })
})