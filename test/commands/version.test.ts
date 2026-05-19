import { describe, expect, it, vi } from 'vitest'

import Version from '../../src/commands/version.js'

// ─── Command Setup ───

describe('Version Command', () => {
  it('has correct static description', () => {
    expect(Version.description).toBe('Show current version of CodeForge')
  })

  it('has static examples defined', () => {
    expect(Version.examples).toBeInstanceOf(Array)
    expect(Version.examples).toHaveLength(2)
    expect(Version.examples[0].description).toBe('Show current version')
  })

  it('examples array contains proper structure', () => {
    for (const example of Version.examples) {
      expect(example.command).toContain('<%= config.bin %>')
      expect(example.command).toContain('<%= command.id %>')
      expect(typeof example.description).toBe('string')
    }
  })
})

// ─── Run Method ───

describe('Version.run', () => {
  it('logs version with correct format', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: { json: false } })

    await cmd.run()

    expect(logSpy).toHaveBeenCalledTimes(1)
    const logged = logSpy.mock.calls[0]![0] as string
    expect(logged).toMatch(/^codeforge\/[\d.]+\s+\S+\s+node-/)
  })

  it('includes version from package.json', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: { json: false } })

    await cmd.run()

    const logged = logSpy.mock.calls[0]![0] as string
    const versionMatch = logged.match(/codeforge\/(\d+\.\d+\.\d+)/)
    expect(versionMatch).not.toBeNull()
  })

  it('handles missing version gracefully by using default', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: { json: false } })

    await cmd.run()

    const logged = logSpy.mock.calls[0]![0] as string
    expect(logged).toContain('codeforge/')
  })

  it('logs exactly once in default mode', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: { json: false } })

    await cmd.run()

    expect(logSpy).toHaveBeenCalledTimes(1)
  })

  it('logs JSON when --json flag is set', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: { json: true } })

    await cmd.run()

    expect(logSpy).toHaveBeenCalledTimes(1)
    const logged = logSpy.mock.calls[0]![0] as string
    const parsed = JSON.parse(logged)
    expect(parsed).toHaveProperty('codeforge')
    expect(parsed).toHaveProperty('node')
    expect(parsed).toHaveProperty('platform')
    expect(parsed).toHaveProperty('arch')
    expect(parsed).toHaveProperty('os')
  })
})

// ─── Output Format ───

describe('Version Output', () => {
  it('output starts with "codeforge/" prefix', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: { json: false } })

    await cmd.run()

    const logged = logSpy.mock.calls[0]![0] as string
    expect(logged.startsWith('codeforge/')).toBe(true)
  })

  it('output is a single string', async () => {
    const cmd = new Version([], {} as never)
    const logSpy = vi.spyOn(cmd, 'log')
    vi.spyOn(cmd, 'parse' as never).mockResolvedValue({ args: {}, flags: { json: false } })

    await cmd.run()

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(typeof logSpy.mock.calls[0]![0]).toBe('string')
  })
})
