import { describe, it, expect, vi } from 'vitest'
import {
  createPluginContext,
  createRuleContext,
  createDefaultLogger,
  createSilentLogger,
} from '../src/plugins/context.js'
import type { PluginConfig, Logger, ReportDescriptor } from '../src/plugins/types.js'

// ─── Helpers ──────────────────────────────────────────
const mockConfig: PluginConfig = { options: { verbose: true } }
const mockLogger: Logger = {
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
}

// ─── createPluginContext ──────────────────────────────
describe('createPluginContext', () => {
  it('creates context with config, logger, workspaceRoot', () => {
    const ctx = createPluginContext({ config: mockConfig, logger: mockLogger, workspaceRoot: '/project' })
    expect(ctx.config).toBe(mockConfig)
    expect(ctx.logger).toBe(mockLogger)
    expect(ctx.workspaceRoot).toBe('/project')
  })

  it('uses exact references passed in', () => {
    const ctx = createPluginContext({ config: mockConfig, logger: mockLogger, workspaceRoot: '/a' })
    expect(ctx.config).toBe(mockConfig)
    expect(ctx.logger).toBe(mockLogger)
  })

  it('works with minimal config', () => {
    const minimalConfig: PluginConfig = {}
    const ctx = createPluginContext({ config: minimalConfig, logger: mockLogger, workspaceRoot: '.' })
    expect(ctx.config).toBe(minimalConfig)
    expect(ctx.workspaceRoot).toBe('.')
  })
})

// ─── createRuleContext ────────────────────────────────
describe('createRuleContext', () => {
  function makeRuleContext(overrides: Record<string, unknown> = {}) {
    return createRuleContext({
      ast: { type: 'Program' },
      comments: [],
      config: mockConfig,
      filePath: '/test.ts',
      logger: mockLogger,
      source: 'const x = 1',
      tokens: [],
      ...overrides,
    })
  }

  it('exposes config', () => {
    const ctx = makeRuleContext()
    expect(ctx.config).toBe(mockConfig)
  })

  it('exposes logger', () => {
    const ctx = makeRuleContext()
    expect(ctx.logger).toBe(mockLogger)
  })

  it('exposes workspaceRoot', () => {
    const ctx = makeRuleContext({ workspaceRoot: '/project' })
    expect(ctx.workspaceRoot).toBe('/project')
  })

  it('getSource returns source text', () => {
    const ctx = makeRuleContext({ source: 'let y = 2' })
    expect(ctx.getSource()).toBe('let y = 2')
  })

  it('getFilePath returns file path', () => {
    const ctx = makeRuleContext({ filePath: '/src/foo.ts' })
    expect(ctx.getFilePath()).toBe('/src/foo.ts')
  })

  it('getAST returns ast object', () => {
    const ast = { type: 'Program', body: [] }
    const ctx = makeRuleContext({ ast })
    expect(ctx.getAST()).toBe(ast)
  })

  it('getTokens returns tokens array', () => {
    const tokens = [{ type: 'Keyword', value: 'const' }]
    const ctx = makeRuleContext({ tokens })
    expect(ctx.getTokens()).toBe(tokens)
  })

  it('getComments returns comments array', () => {
    const comments = [{ type: 'Line', value: ' comment' }]
    const ctx = makeRuleContext({ comments })
    expect(ctx.getComments()).toBe(comments)
  })

  it('report pushes to collector.reports', () => {
    const ctx = makeRuleContext()
    const desc: ReportDescriptor = { message: 'Something is wrong' }
    ctx.report(desc)
    expect(ctx.collector.reports).toHaveLength(1)
    expect(ctx.collector.reports[0]).toBe(desc)
  })

  it('report throws for empty message', () => {
    const ctx = makeRuleContext()
    expect(() => ctx.report({ message: '' })).toThrow(TypeError)
  })

  it('report throws for non-string message', () => {
    const ctx = makeRuleContext()
    expect(() => ctx.report({ message: 42 as unknown as string })).toThrow(TypeError)
  })

  it('report collects multiple reports', () => {
    const ctx = makeRuleContext()
    ctx.report({ message: 'Error 1' })
    ctx.report({ message: 'Error 2' })
    ctx.report({ message: 'Error 3' })
    expect(ctx.collector.reports).toHaveLength(3)
  })

  it('collector.clear empties reports', () => {
    const ctx = makeRuleContext()
    ctx.report({ message: 'Error 1' })
    ctx.report({ message: 'Error 2' })
    ctx.collector.clear()
    expect(ctx.collector.reports).toHaveLength(0)
  })

  it('report with full descriptor', () => {
    const ctx = makeRuleContext()
    ctx.report({
      message: 'Unused variable',
      data: { name: 'x' },
      loc: {
        start: { line: 1, column: 6 },
        end: { line: 1, column: 7 },
      },
    })
    expect(ctx.collector.reports[0]!.message).toBe('Unused variable')
  })

  it('parserServices passed through when provided', () => {
    const ps = { program: {} }
    const ctx = makeRuleContext({ parserServices: ps })
    expect(ctx.parserServices).toBe(ps)
  })

  it('parserServices undefined when not provided', () => {
    const ctx = makeRuleContext()
    expect(ctx.parserServices).toBeUndefined()
  })
})

// ─── createDefaultLogger ──────────────────────────────
describe('createDefaultLogger', () => {
  it('returns logger with all methods', () => {
    const logger = createDefaultLogger()
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
  })

  it('debug calls console.debug with prefix', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const logger = createDefaultLogger()
    logger.debug('test message')
    expect(spy).toHaveBeenCalledWith('[DEBUG] test message')
    spy.mockRestore()
  })

  it('error calls console.error with prefix', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const logger = createDefaultLogger()
    logger.error('error msg')
    expect(spy).toHaveBeenCalledWith('[ERROR] error msg')
    spy.mockRestore()
  })

  it('info calls console.info with prefix', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const logger = createDefaultLogger()
    logger.info('info msg')
    expect(spy).toHaveBeenCalledWith('[INFO] info msg')
    spy.mockRestore()
  })

  it('warn calls console.warn with prefix', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const logger = createDefaultLogger()
    logger.warn('warn msg')
    expect(spy).toHaveBeenCalledWith('[WARN] warn msg')
    spy.mockRestore()
  })

  it('passes extra args through', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const logger = createDefaultLogger()
    logger.debug('msg', 1, 'two', { three: 3 })
    expect(spy).toHaveBeenCalledWith('[DEBUG] msg', 1, 'two', { three: 3 })
    spy.mockRestore()
  })
})

// ─── createSilentLogger ───────────────────────────────
describe('createSilentLogger', () => {
  it('returns logger with all methods', () => {
    const logger = createSilentLogger()
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
  })

  it('debug does not throw', () => {
    const logger = createSilentLogger()
    expect(() => logger.debug('test')).not.toThrow()
  })

  it('error does not throw', () => {
    const logger = createSilentLogger()
    expect(() => logger.error('test')).not.toThrow()
  })

  it('info does not throw', () => {
    const logger = createSilentLogger()
    expect(() => logger.info('test')).not.toThrow()
  })

  it('warn does not throw', () => {
    const logger = createSilentLogger()
    expect(() => logger.warn('test')).not.toThrow()
  })

  it('does not write to console', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const logger = createSilentLogger()
    logger.debug('a')
    logger.error('b')
    logger.info('c')
    logger.warn('d')

    expect(debugSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
    expect(infoSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()

    debugSpy.mockRestore()
    errorSpy.mockRestore()
    infoSpy.mockRestore()
    warnSpy.mockRestore()
  })
})
