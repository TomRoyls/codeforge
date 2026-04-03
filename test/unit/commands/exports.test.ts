import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Exports Command', () => {
  let Exports: typeof import('../../../src/commands/exports.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let tempDir: string

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Exports = (await import('../../../src/commands/exports.js')).default
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const os = await import('node:os')
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-exports-'))
  })

  afterEach(async () => {
    mockConsoleLog.mockRestore()
    const fs = await import('node:fs/promises')
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Exports.description).toBe('Analyze and list exports from TypeScript/JavaScript files')
    })

    test('has examples defined', () => {
      expect(Exports.examples).toBeDefined()
      expect(Exports.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Exports.flags).toBeDefined()
      expect(Exports.flags.ext).toBeDefined()
      expect(Exports.flags.format).toBeDefined()
      expect(Exports.flags.ignore).toBeDefined()
      expect(Exports.flags.output).toBeDefined()
      expect(Exports.flags.type).toBeDefined()
      expect(Exports.flags.unused).toBeDefined()
      expect(Exports.flags.verbose).toBeDefined()
    })

    test('has path argument', () => {
      expect(Exports.args).toBeDefined()
      expect(Exports.args.path).toBeDefined()
    })

    test('path argument has default value', () => {
      expect(Exports.args.path.default).toBe('.')
    })

    test('format flag has default console', () => {
      expect(Exports.flags.format.default).toBe('console')
    })

    test('format flag has correct options', () => {
      expect(Exports.flags.format.options).toContain('console')
      expect(Exports.flags.format.options).toContain('json')
      expect(Exports.flags.format.options).toContain('markdown')
    })

    test('unused flag has default false', () => {
      expect(Exports.flags.unused.default).toBe(false)
    })

    test('verbose flag has default false', () => {
      expect(Exports.flags.verbose.default).toBe(false)
    })
  })

  describe('Flag characters', () => {
    test('format flag has char f', () => {
      expect(Exports.flags.format.char).toBe('f')
    })

    test('ignore flag has char i', () => {
      expect(Exports.flags.ignore.char).toBe('i')
    })

    test('output flag has char o', () => {
      expect(Exports.flags.output.char).toBe('o')
    })

    test('type flag has char t', () => {
      expect(Exports.flags.type.char).toBe('t')
    })

    test('unused flag has char u', () => {
      expect(Exports.flags.unused.char).toBe('u')
    })

    test('verbose flag has char v', () => {
      expect(Exports.flags.verbose.char).toBe('v')
    })
  })

  describe('Export types', () => {
    test('type flag has correct options', () => {
      expect(Exports.flags.type.options).toContain('class')
      expect(Exports.flags.type.options).toContain('const')
      expect(Exports.flags.type.options).toContain('function')
      expect(Exports.flags.type.options).toContain('interface')
      expect(Exports.flags.type.options).toContain('type')
    })
  })
})
