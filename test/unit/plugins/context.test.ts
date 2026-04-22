import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  createPluginContext,
  createRuleContext,
  createDefaultLogger,
  createSilentLogger,
  type PluginContextOptions,
  type RuleContextOptions,
} from '../../../src/plugins/context.js'
import type { Logger, PluginConfig } from '../../../src/plugins/types.js'

function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}

function createMockConfig(): PluginConfig {
  return {
    options: { testOption: true },
    rules: { 'test-rule': 'error' },
  }
}

describe('createPluginContext', () => {
  let mockLogger: Logger
  let mockConfig: PluginConfig

  beforeEach(() => {
    mockLogger = createMockLogger()
    mockConfig = createMockConfig()
  })

  describe('creates context with logger', () => {
    test('returns context with provided logger', () => {
      const options: PluginContextOptions = {
        logger: mockLogger,
        config: mockConfig,
        workspaceRoot: '/workspace',
      }

      const context = createPluginContext(options)

      expect(context.logger).toBe(mockLogger)
    })

    test('logger methods are callable from context', () => {
      const options: PluginContextOptions = {
        logger: mockLogger,
        config: mockConfig,
        workspaceRoot: '/workspace',
      }

      const context = createPluginContext(options)
      context.logger.info('test message')

      expect(mockLogger.info).toHaveBeenCalledWith('test message')
    })
  })

  describe('creates context with config', () => {
    test('returns context with provided config', () => {
      const options: PluginContextOptions = {
        logger: mockLogger,
        config: mockConfig,
        workspaceRoot: '/workspace',
      }

      const context = createPluginContext(options)

      expect(context.config).toBe(mockConfig)
    })

    test('config options are accessible from context', () => {
      const configWithRules: PluginConfig = {
        options: { verbose: true },
        rules: { 'rule-a': 'warn', 'rule-b': ['error', { option: 'value' }] },
      }

      const options: PluginContextOptions = {
        logger: mockLogger,
        config: configWithRules,
        workspaceRoot: '/workspace',
      }

      const context = createPluginContext(options)

      expect(context.config.options).toEqual({ verbose: true })
      expect(context.config.rules).toEqual({
        'rule-a': 'warn',
        'rule-b': ['error', { option: 'value' }],
      })
    })

    test('handles empty config', () => {
      const emptyConfig: PluginConfig = {}

      const options: PluginContextOptions = {
        logger: mockLogger,
        config: emptyConfig,
        workspaceRoot: '/workspace',
      }

      const context = createPluginContext(options)

      expect(context.config).toEqual({})
    })
  })

  describe('creates context with workspaceRoot', () => {
    test('returns context with provided workspaceRoot', () => {
      const options: PluginContextOptions = {
        logger: mockLogger,
        config: mockConfig,
        workspaceRoot: '/path/to/workspace',
      }

      const context = createPluginContext(options)

      expect(context.workspaceRoot).toBe('/path/to/workspace')
    })

    test('handles relative paths', () => {
      const options: PluginContextOptions = {
        logger: mockLogger,
        config: mockConfig,
        workspaceRoot: './relative/path',
      }

      const context = createPluginContext(options)

      expect(context.workspaceRoot).toBe('./relative/path')
    })

    test('handles empty string workspaceRoot', () => {
      const options: PluginContextOptions = {
        logger: mockLogger,
        config: mockConfig,
        workspaceRoot: '',
      }

      const context = createPluginContext(options)

      expect(context.workspaceRoot).toBe('')
    })
  })
})

describe('createRuleContext', () => {
  let mockLogger: Logger
  let mockConfig: PluginConfig

  beforeEach(() => {
    mockLogger = createMockLogger()
    mockConfig = createMockConfig()
  })

  function createDefaultRuleOptions(): RuleContextOptions {
    return {
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/workspace',
      source: 'const x = 1;',
      filePath: '/workspace/file.ts',
      ast: { type: 'Program' },
      tokens: [],
      comments: [],
    }
  }

  describe('creates context with file path', () => {
    test('returns context with correct filePath', () => {
      const options = createDefaultRuleOptions()
      const context = createRuleContext(options)

      expect(context.getFilePath()).toBe('/workspace/file.ts')
    })

    test('getFilePath returns string', () => {
      const options = createDefaultRuleOptions()
      const context = createRuleContext(options)

      expect(typeof context.getFilePath()).toBe('string')
    })
  })

  describe('creates context with source file', () => {
    test('returns context with correct source', () => {
      const options = createDefaultRuleOptions()
      const context = createRuleContext(options)

      expect(context.getSource()).toBe('const x = 1;')
    })

    test('getSource returns string', () => {
      const options = createDefaultRuleOptions()
      const context = createRuleContext(options)

      expect(typeof context.getSource()).toBe('string')
    })

    test('handles empty source', () => {
      const options: RuleContextOptions = {
        ...createDefaultRuleOptions(),
        source: '',
      }

      const context = createRuleContext(options)

      expect(context.getSource()).toBe('')
    })
  })

  describe('provides violation tracking', () => {
    test('report adds violation to collector', () => {
      const options = createDefaultRuleOptions()
      const context = createRuleContext(options)

      context.report({ message: 'Test violation' })

      expect(context.collector.reports).toHaveLength(1)
      expect(context.collector.reports[0].message).toBe('Test violation')
    })

    test('report tracks multiple violations', () => {
      const options = createDefaultRuleOptions()
      const context = createRuleContext(options)

      context.report({ message: 'First violation' })
      context.report({ message: 'Second violation' })
      context.report({ message: 'Third violation' })

      expect(context.collector.reports).toHaveLength(3)
    })

    test('report throws on invalid message', () => {
      const options = createDefaultRuleOptions()
      const context = createRuleContext(options)

      expect(() => context.report({ message: '' })).toThrow(TypeError)
    })

    test('report throws on non-string message', () => {
      const options = createDefaultRuleOptions()
      const context = createRuleContext(options)

      // @ts-expect-error Testing invalid input
      expect(() => context.report({ message: null })).toThrow(TypeError)
    })

    test('clear removes all violations', () => {
      const options = createDefaultRuleOptions()
      const context = createRuleContext(options)

      context.report({ message: 'Test violation' })
      context.report({ message: 'Another violation' })
      expect(context.collector.reports).toHaveLength(2)

      context.collector.clear()

      expect(context.collector.reports).toHaveLength(0)
    })

    test('report preserves location data', () => {
      const options = createDefaultRuleOptions()
      const context = createRuleContext(options)

      context.report({
        message: 'Test violation',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      })

      expect(context.collector.reports[0].loc).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 10 },
      })
    })
  })

  describe('provides AST access', () => {
    test('getAST returns provided AST', () => {
      const ast = { type: 'Program', body: [] }
      const options: RuleContextOptions = {
        ...createDefaultRuleOptions(),
        ast,
      }

      const context = createRuleContext(options)

      expect(context.getAST()).toBe(ast)
    })

    test('getTokens returns provided tokens', () => {
      const tokens = [{ type: 'Keyword', value: 'const' }]
      const options: RuleContextOptions = {
        ...createDefaultRuleOptions(),
        tokens,
      }

      const context = createRuleContext(options)

      expect(context.getTokens()).toBe(tokens)
    })

    test('getComments returns provided comments', () => {
      const comments = [{ type: 'Line', value: 'comment' }]
      const options: RuleContextOptions = {
        ...createDefaultRuleOptions(),
        comments,
      }

      const context = createRuleContext(options)

      expect(context.getComments()).toBe(comments)
    })
  })

  describe('parserServices', () => {
    test('includes parserServices when provided', () => {
      const parserServices = {
        program: {},
        esTreeNodeToTSNodeMap: new Map(),
        tsNodeToESTreeNodeMap: new Map(),
      }

      const options: RuleContextOptions = {
        ...createDefaultRuleOptions(),
        parserServices,
      }

      const context = createRuleContext(options)

      expect(context.parserServices).toBe(parserServices)
    })

    test('handles undefined parserServices', () => {
      const options = createDefaultRuleOptions()
      const context = createRuleContext(options)

      expect(context.parserServices).toBeUndefined()
    })
  })
})

describe('createDefaultLogger', () => {
  let consoleSpies: {
    debug: ReturnType<typeof vi.spyOn>
    info: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    consoleSpies = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    }
  })

  afterEach(() => {
    Object.values(consoleSpies).forEach((spy) => spy.mockRestore())
  })

  describe('logs to console', () => {
    test('debug logs with [DEBUG] prefix', () => {
      const logger = createDefaultLogger()
      logger.debug('test message')

      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] test message')
    })

    test('info logs with [INFO] prefix', () => {
      const logger = createDefaultLogger()
      logger.info('info message')

      expect(consoleSpies.info).toHaveBeenCalledWith('[INFO] info message')
    })

    test('warn logs with [WARN] prefix', () => {
      const logger = createDefaultLogger()
      logger.warn('warning message')

      expect(consoleSpies.warn).toHaveBeenCalledWith('[WARN] warning message')
    })

    test('error logs with [ERROR] prefix', () => {
      const logger = createDefaultLogger()
      logger.error('error message')

      expect(consoleSpies.error).toHaveBeenCalledWith('[ERROR] error message')
    })

    test('passes additional arguments to console methods', () => {
      const logger = createDefaultLogger()
      const extraArg = { key: 'value' }

      logger.info('message', extraArg, 123)

      expect(consoleSpies.info).toHaveBeenCalledWith('[INFO] message', extraArg, 123)
    })

    test('handles multiple additional arguments', () => {
      const logger = createDefaultLogger()

      logger.debug('msg', 'arg1', 'arg2', 'arg3')

      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] msg', 'arg1', 'arg2', 'arg3')
    })

    test('handles empty message', () => {
      const logger = createDefaultLogger()
      logger.debug('')

      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] ')
    })

    test('handles long message', () => {
      const logger = createDefaultLogger()
      const longMsg = 'x'.repeat(1000)
      logger.info(longMsg)

      expect(consoleSpies.info).toHaveBeenCalledWith(`[INFO] ${longMsg}`)
    })

    test('handles special characters in message', () => {
      const logger = createDefaultLogger()
      logger.warn('message with \n newlines \t tabs')

      expect(consoleSpies.warn).toHaveBeenCalledWith('[WARN] message with \n newlines \t tabs')
    })

    test('debug passes no extra args correctly', () => {
      const logger = createDefaultLogger()
      logger.debug('only message')

      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] only message')
    })

    test('info passes object arg', () => {
      const logger = createDefaultLogger()
      const obj = { a: 1, b: 2 }
      logger.info('msg', obj)

      expect(consoleSpies.info).toHaveBeenCalledWith('[INFO] msg', obj)
    })

    test('error passes array arg', () => {
      const logger = createDefaultLogger()
      logger.error('msg', [1, 2, 3])

      expect(consoleSpies.error).toHaveBeenCalledWith('[ERROR] msg', [1, 2, 3])
    })

    test('warn passes number arg', () => {
      const logger = createDefaultLogger()
      logger.warn('msg', 42)

      expect(consoleSpies.warn).toHaveBeenCalledWith('[WARN] msg', 42)
    })

    test('debug passes boolean arg', () => {
      const logger = createDefaultLogger()
      logger.debug('msg', true, false)

      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] msg', true, false)
    })

    test('each log level uses correct console method', () => {
      const logger = createDefaultLogger()
      logger.debug('d')
      logger.info('i')
      logger.warn('w')
      logger.error('e')

      expect(consoleSpies.debug).toHaveBeenCalledTimes(1)
      expect(consoleSpies.info).toHaveBeenCalledTimes(1)
      expect(consoleSpies.warn).toHaveBeenCalledTimes(1)
      expect(consoleSpies.error).toHaveBeenCalledTimes(1)
    })
  })

  describe('logger interface', () => {
    test('returns object with all required methods', () => {
      const logger = createDefaultLogger()

      expect(logger).toHaveProperty('debug')
      expect(logger).toHaveProperty('info')
      expect(logger).toHaveProperty('warn')
      expect(logger).toHaveProperty('error')

      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
    })

    test('has exactly 4 methods', () => {
      const logger = createDefaultLogger()
      const keys = Object.keys(logger)
      expect(keys).toHaveLength(4)
    })

    test('methods are distinct functions', () => {
      const logger = createDefaultLogger()
      expect(logger.debug).not.toBe(logger.info)
      expect(logger.info).not.toBe(logger.warn)
      expect(logger.warn).not.toBe(logger.error)
    })

    test('creates independent instances', () => {
      const logger1 = createDefaultLogger()
      const logger2 = createDefaultLogger()
      expect(logger1).not.toBe(logger2)
    })

    test('methods do not return values', () => {
      const logger = createDefaultLogger()
      expect(logger.debug('test')).toBeUndefined()
      expect(logger.info('test')).toBeUndefined()
      expect(logger.warn('test')).toBeUndefined()
      expect(logger.error('test')).toBeUndefined()
    })

    test('all methods accept single string argument', () => {
      expect(() => createDefaultLogger().debug('a')).not.toThrow()
      expect(() => createDefaultLogger().info('a')).not.toThrow()
      expect(() => createDefaultLogger().warn('a')).not.toThrow()
      expect(() => createDefaultLogger().error('a')).not.toThrow()
    })

    test('handles unicode messages', () => {
      const logger = createDefaultLogger()
      expect(() => logger.info('日本語テスト')).not.toThrow()
      expect(() => logger.info('🎉')).not.toThrow()
    })

    test('handles multiline messages', () => {
      const logger = createDefaultLogger()
      expect(() => logger.info('line1\nline2\nline3')).not.toThrow()
    })

    test('handles messages with quotes', () => {
      const logger = createDefaultLogger()
      expect(() => logger.info('msg with "quotes"')).not.toThrow()
      expect(() => logger.info("msg with 'quotes'")).not.toThrow()
    })
  })
})

describe('createSilentLogger', () => {
  describe('suppresses all output', () => {
    test('debug does not throw', () => {
      const logger = createSilentLogger()

      expect(() => logger.debug('message')).not.toThrow()
    })

    test('info does not throw', () => {
      const logger = createSilentLogger()

      expect(() => logger.info('message')).not.toThrow()
    })

    test('warn does not throw', () => {
      const logger = createSilentLogger()

      expect(() => logger.warn('message')).not.toThrow()
    })

    test('error does not throw', () => {
      const logger = createSilentLogger()

      expect(() => logger.error('message')).not.toThrow()
    })

    test('returns object with all required methods', () => {
      const logger = createSilentLogger()

      expect(logger).toHaveProperty('debug')
      expect(logger).toHaveProperty('info')
      expect(logger).toHaveProperty('warn')
      expect(logger).toHaveProperty('error')
    })

    test('all methods return undefined', () => {
      const logger = createSilentLogger()

      expect(logger.debug('test')).toBeUndefined()
      expect(logger.info('test')).toBeUndefined()
      expect(logger.warn('test')).toBeUndefined()
      expect(logger.error('test')).toBeUndefined()
    })
  })
})

describe('context immutability', () => {
  test('plugin context properties are accessible', () => {
    const mockLogger = createMockLogger()
    const options: PluginContextOptions = {
      logger: mockLogger,
      config: { rules: { test: 'error' } },
      workspaceRoot: '/workspace',
    }

    const context = createPluginContext(options)

    expect(context.logger).toBeDefined()
    expect(context.config).toBeDefined()
    expect(context.workspaceRoot).toBeDefined()
  })

  test('rule context properties are accessible', () => {
    const mockLogger = createMockLogger()
    const options: RuleContextOptions = {
      logger: mockLogger,
      config: {},
      workspaceRoot: '/workspace',
      source: 'code',
      filePath: '/file.ts',
      ast: {},
      tokens: [],
      comments: [],
    }

    const context = createRuleContext(options)

    expect(context.logger).toBeDefined()
    expect(context.config).toBeDefined()
    expect(context.workspaceRoot).toBeDefined()
    expect(context.report).toBeDefined()
    expect(context.getSource).toBeDefined()
    expect(context.getFilePath).toBeDefined()
    expect(context.getAST).toBeDefined()
    expect(context.getTokens).toBeDefined()
    expect(context.getComments).toBeDefined()
    expect(context.collector).toBeDefined()
  })
})

describe('createPluginContext - additional', () => {
  let mockLogger: Logger
  let mockConfig: PluginConfig

  beforeEach(() => {
    mockLogger = createMockLogger()
    mockConfig = createMockConfig()
  })

  test('returns exactly 3 properties', () => {
    const context = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/ws',
    })
    const keys = Object.keys(context)
    expect(keys).toHaveLength(3)
    expect(keys).toContain('logger')
    expect(keys).toContain('config')
    expect(keys).toContain('workspaceRoot')
  })

  test('stores same logger reference', () => {
    const context = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/ws',
    })
    expect(context.logger).toBe(mockLogger)
    expect(context.logger.debug).toBe(mockLogger.debug)
    expect(context.logger.info).toBe(mockLogger.info)
  })

  test('stores same config reference', () => {
    const context = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      config: mockConfig,
      workspaceRoot: '/ws',
    })
    expect(context.config).toBe(mockConfig)
  })

  test('handles workspaceRoot with trailing slash', () => {
    const context = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/workspace/',
    })
    expect(context.workspaceRoot).toBe('/workspace/')
  })

  test('handles workspaceRoot with spaces', () => {
    const context = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/path/to/my project',
    })
    expect(context.workspaceRoot).toBe('/path/to/my project')
  })

  test('handles workspaceRoot with unicode', () => {
    const context = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/Users/ユーザー/project',
    })
    expect(context.workspaceRoot).toBe('/Users/ユーザー/project')
  })

  test('handles workspaceRoot with dots', () => {
    const context = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '.',
    })
    expect(context.workspaceRoot).toBe('.')
  })

  test('handles workspaceRoot with double dots', () => {
    const context = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '..',
    })
    expect(context.workspaceRoot).toBe('..')
  })

  test('creates independent contexts from same options', () => {
    const options = {
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/ws',
    }
    const ctx1 = createPluginContext(options)
    const ctx2 = createPluginContext(options)
    expect(ctx1).not.toBe(ctx2)
  })

  test('config with nested options object', () => {
    const nestedConfig: PluginConfig = {
      options: { a: { b: { c: 1 } } },
    }
    const context = createPluginContext({
      logger: mockLogger,
      config: nestedConfig,
      workspaceRoot: '/ws',
    })
    expect(context.config).toBe(nestedConfig)
  })

  test('config with many rules', () => {
    const manyRules: PluginConfig = {
      rules: Object.fromEntries(
        Array.from({ length: 50 }, (_, i) => [`rule-${i}`, i % 2 === 0 ? 'error' : 'warn']),
      ),
    }
    const context = createPluginContext({
      logger: mockLogger,
      config: manyRules,
      workspaceRoot: '/ws',
    })
    expect(Object.keys(context.config.rules || {})).toHaveLength(50)
  })

  test('config with only options', () => {
    const config: PluginConfig = { options: { flag: true } }
    const context = createPluginContext({
      logger: mockLogger,
      config,
      workspaceRoot: '/ws',
    })
    expect(context.config.options).toEqual({ flag: true })
  })

  test('config with only rules', () => {
    const config: PluginConfig = { rules: { r: 'error' } }
    const context = createPluginContext({
      logger: mockLogger,
      config,
      workspaceRoot: '/ws',
    })
    expect(context.config.rules).toEqual({ r: 'error' })
  })

  test('logger debug is callable through context', () => {
    const context = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/ws',
    })
    context.logger.debug('test')
    expect(mockLogger.debug).toHaveBeenCalledWith('test')
  })

  test('logger error is callable through context', () => {
    const context = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/ws',
    })
    context.logger.error('err')
    expect(mockLogger.error).toHaveBeenCalledWith('err')
  })

  test('logger warn is callable through context', () => {
    const context = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/ws',
    })
    context.logger.warn('warn')
    expect(mockLogger.warn).toHaveBeenCalledWith('warn')
  })
})

describe('createRuleContext - additional', () => {
  let mockLogger: Logger
  let mockConfig: PluginConfig

  beforeEach(() => {
    mockLogger = createMockLogger()
    mockConfig = createMockConfig()
  })

  function makeOpts(overrides: Partial<RuleContextOptions> = {}): RuleContextOptions {
    return {
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/workspace',
      source: 'const x = 1;',
      filePath: '/workspace/file.ts',
      ast: { type: 'Program' },
      tokens: [],
      comments: [],
      ...overrides,
    }
  }

  describe('getSource variations', () => {
    test('returns source code', () => {
      const ctx = createRuleContext(makeOpts({ source: 'let y = 2;' }))
      expect(ctx.getSource()).toBe('let y = 2;')
    })

    test('returns multiline source', () => {
      const src = 'const a = 1;\nconst b = 2;\nconst c = 3;'
      const ctx = createRuleContext(makeOpts({ source: src }))
      expect(ctx.getSource()).toBe(src)
    })

    test('returns source with special chars', () => {
      const src = 'const s = "hello\nworld";'
      const ctx = createRuleContext(makeOpts({ source: src }))
      expect(ctx.getSource()).toBe(src)
    })

    test('returns empty source', () => {
      const ctx = createRuleContext(makeOpts({ source: '' }))
      expect(ctx.getSource()).toBe('')
    })

    test('getSource returns same string on multiple calls', () => {
      const ctx = createRuleContext(makeOpts())
      const s1 = ctx.getSource()
      const s2 = ctx.getSource()
      expect(s1).toBe(s2)
    })
  })

  describe('getFilePath variations', () => {
    test('returns absolute path', () => {
      const ctx = createRuleContext(makeOpts({ filePath: '/abs/path/file.ts' }))
      expect(ctx.getFilePath()).toBe('/abs/path/file.ts')
    })

    test('returns relative path', () => {
      const ctx = createRuleContext(makeOpts({ filePath: './relative/file.ts' }))
      expect(ctx.getFilePath()).toBe('./relative/file.ts')
    })

    test('returns path with extension .tsx', () => {
      const ctx = createRuleContext(makeOpts({ filePath: '/app/component.tsx' }))
      expect(ctx.getFilePath()).toBe('/app/component.tsx')
    })

    test('returns path with extension .js', () => {
      const ctx = createRuleContext(makeOpts({ filePath: '/app/module.js' }))
      expect(ctx.getFilePath()).toBe('/app/module.js')
    })

    test('returns same path on multiple calls', () => {
      const ctx = createRuleContext(makeOpts())
      expect(ctx.getFilePath()).toBe(ctx.getFilePath())
    })
  })

  describe('getAST variations', () => {
    test('returns null ast', () => {
      const ctx = createRuleContext(makeOpts({ ast: null }))
      expect(ctx.getAST()).toBeNull()
    })

    test('returns undefined ast', () => {
      const ctx = createRuleContext(makeOpts({ ast: undefined }))
      expect(ctx.getAST()).toBeUndefined()
    })

    test('returns complex ast object', () => {
      const ast = { type: 'Program', body: [{ type: 'VariableDeclaration' }] }
      const ctx = createRuleContext(makeOpts({ ast }))
      expect(ctx.getAST()).toBe(ast)
    })

    test('returns same reference on multiple calls', () => {
      const ast = { type: 'Program' }
      const ctx = createRuleContext(makeOpts({ ast }))
      expect(ctx.getAST()).toBe(ctx.getAST())
    })
  })

  describe('getTokens variations', () => {
    test('returns empty array', () => {
      const ctx = createRuleContext(makeOpts({ tokens: [] }))
      expect(ctx.getTokens()).toEqual([])
    })

    test('returns array of tokens', () => {
      const tokens = [
        { type: 'Keyword', value: 'const' },
        { type: 'Identifier', value: 'x' },
      ]
      const ctx = createRuleContext(makeOpts({ tokens }))
      expect(ctx.getTokens()).toBe(tokens)
      expect(ctx.getTokens()).toHaveLength(2)
    })

    test('returns same reference', () => {
      const tokens = [{ type: 'Punctuator', value: '=' }]
      const ctx = createRuleContext(makeOpts({ tokens }))
      expect(ctx.getTokens()).toBe(ctx.getTokens())
    })
  })

  describe('getComments variations', () => {
    test('returns empty array', () => {
      const ctx = createRuleContext(makeOpts({ comments: [] }))
      expect(ctx.getComments()).toEqual([])
    })

    test('returns array of comments', () => {
      const comments = [{ type: 'Line', value: ' comment' }]
      const ctx = createRuleContext(makeOpts({ comments }))
      expect(ctx.getComments()).toBe(comments)
    })

    test('returns same reference', () => {
      const comments = [{ type: 'Block', value: ' block ' }]
      const ctx = createRuleContext(makeOpts({ comments }))
      expect(ctx.getComments()).toBe(ctx.getComments())
    })
  })

  describe('report function - additional', () => {
    test('report accepts message with severity', () => {
      const ctx = createRuleContext(makeOpts())
      ctx.report({ message: 'test', severity: 'error' })
      expect(ctx.collector.reports[0].severity).toBe('error')
    })

    test('report accepts message with ruleId', () => {
      const ctx = createRuleContext(makeOpts())
      ctx.report({ message: 'test', ruleId: 'my-rule' })
      expect(ctx.collector.reports[0].ruleId).toBe('my-rule')
    })

    test('report accepts message with fix', () => {
      const ctx = createRuleContext(makeOpts())
      ctx.report({ message: 'test', fix: { range: [0, 5], text: 'const' } })
      expect(ctx.collector.reports[0].fix).toEqual({ range: [0, 5], text: 'const' })
    })

    test('report stores in order', () => {
      const ctx = createRuleContext(makeOpts())
      ctx.report({ message: 'first' })
      ctx.report({ message: 'second' })
      ctx.report({ message: 'third' })
      expect(ctx.collector.reports[0].message).toBe('first')
      expect(ctx.collector.reports[1].message).toBe('second')
      expect(ctx.collector.reports[2].message).toBe('third')
    })

    test('report throws on undefined message', () => {
      const ctx = createRuleContext(makeOpts())
      expect(() => ctx.report({ message: undefined as unknown as string })).toThrow(TypeError)
    })

    test('report throws on number message', () => {
      const ctx = createRuleContext(makeOpts())
      expect(() => ctx.report({ message: 42 as unknown as string })).toThrow(TypeError)
    })

    test('report with single-character message', () => {
      const ctx = createRuleContext(makeOpts())
      ctx.report({ message: 'x' })
      expect(ctx.collector.reports).toHaveLength(1)
      expect(ctx.collector.reports[0].message).toBe('x')
    })

    test('report with very long message', () => {
      const ctx = createRuleContext(makeOpts())
      const longMsg = 'a'.repeat(10000)
      ctx.report({ message: longMsg })
      expect(ctx.collector.reports[0].message).toBe(longMsg)
    })

    test('report with message containing html', () => {
      const ctx = createRuleContext(makeOpts())
      ctx.report({ message: '<script>alert("x")</script>' })
      expect(ctx.collector.reports[0].message).toBe('<script>alert("x")</script>')
    })

    test('report with message containing unicode', () => {
      const ctx = createRuleContext(makeOpts())
      ctx.report({ message: 'エラーが発生しました' })
      expect(ctx.collector.reports[0].message).toBe('エラーが発生しました')
    })

    test('clear and report again works', () => {
      const ctx = createRuleContext(makeOpts())
      ctx.report({ message: 'first batch' })
      ctx.collector.clear()
      ctx.report({ message: 'second batch' })
      expect(ctx.collector.reports).toHaveLength(1)
      expect(ctx.collector.reports[0].message).toBe('second batch')
    })

    test('report does not throw on valid descriptor with all fields', () => {
      const ctx = createRuleContext(makeOpts())
      expect(() =>
        ctx.report({
          message: 'full report',
          severity: 'warning',
          ruleId: 'test-rule',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          fix: { range: [0, 5] as [number, number], text: 'hello' },
        }),
      ).not.toThrow()
    })
  })

  describe('collector', () => {
    test('collector has reports array', () => {
      const ctx = createRuleContext(makeOpts())
      expect(Array.isArray(ctx.collector.reports)).toBe(true)
    })

    test('collector has clear function', () => {
      const ctx = createRuleContext(makeOpts())
      expect(typeof ctx.collector.clear).toBe('function')
    })

    test('reports start empty', () => {
      const ctx = createRuleContext(makeOpts())
      expect(ctx.collector.reports).toHaveLength(0)
    })

    test('clear on empty reports is safe', () => {
      const ctx = createRuleContext(makeOpts())
      expect(() => ctx.collector.clear()).not.toThrow()
    })

    test('clear removes all entries', () => {
      const ctx = createRuleContext(makeOpts())
      for (let i = 0; i < 10; i++) {
        ctx.report({ message: `violation ${i}` })
      }
      ctx.collector.clear()
      expect(ctx.collector.reports).toHaveLength(0)
    })

    test('clear resets array length to 0', () => {
      const ctx = createRuleContext(makeOpts())
      ctx.report({ message: 'test' })
      ctx.collector.clear()
      expect(ctx.collector.reports.length).toBe(0)
    })

    test('multiple clears are safe', () => {
      const ctx = createRuleContext(makeOpts())
      ctx.report({ message: 'test' })
      ctx.collector.clear()
      ctx.collector.clear()
      ctx.collector.clear()
      expect(ctx.collector.reports).toHaveLength(0)
    })

    test('reports after clear are independent', () => {
      const ctx = createRuleContext(makeOpts())
      ctx.report({ message: 'before clear' })
      const reportsBeforeRef = ctx.collector.reports
      ctx.collector.clear()
      ctx.report({ message: 'after clear' })
      expect(ctx.collector.reports).toHaveLength(1)
    })
  })

  describe('workspaceRoot', () => {
    test('has workspaceRoot', () => {
      const ctx = createRuleContext(makeOpts({ workspaceRoot: '/root' }))
      expect(ctx.workspaceRoot).toBe('/root')
    })

    test('workspaceRoot is same reference as input', () => {
      const ctx = createRuleContext(makeOpts({ workspaceRoot: '/ws' }))
      expect(ctx.workspaceRoot).toBe('/ws')
    })
  })

  describe('logger in rule context', () => {
    test('logger is accessible', () => {
      const ctx = createRuleContext(makeOpts())
      expect(ctx.logger).toBe(mockLogger)
    })

    test('can call logger through context', () => {
      const ctx = createRuleContext(makeOpts())
      ctx.logger.info('test')
      expect(mockLogger.info).toHaveBeenCalledWith('test')
    })
  })

  describe('config in rule context', () => {
    test('config is accessible', () => {
      const ctx = createRuleContext(makeOpts())
      expect(ctx.config).toBe(mockConfig)
    })
  })

  describe('parserServices variations', () => {
    test('parserServices with partial object', () => {
      const ctx = createRuleContext(
        makeOpts({ parserServices: { program: {} } as RuleContextOptions['parserServices'] }),
      )
      expect(ctx.parserServices).toBeDefined()
      expect(ctx.parserServices!.program).toBeDefined()
    })

    test('parserServices undefined by default', () => {
      const ctx = createRuleContext(makeOpts())
      expect(ctx.parserServices).toBeUndefined()
    })

    test('parserServices null is preserved', () => {
      const ctx = createRuleContext(
        makeOpts({ parserServices: null as RuleContextOptions['parserServices'] }),
      )
      expect(ctx.parserServices).toBeNull()
    })
  })
})

describe('createDefaultLogger - additional', () => {
  let consoleSpies: {
    debug: ReturnType<typeof vi.spyOn>
    info: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    consoleSpies = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    }
  })

  afterEach(() => {
    Object.values(consoleSpies).forEach((spy) => spy.mockRestore())
  })

  describe('prefix formatting', () => {
    test('debug prefix is exactly [DEBUG]', () => {
      const logger = createDefaultLogger()
      logger.debug('msg')
      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] msg')
    })

    test('info prefix is exactly [INFO]', () => {
      const logger = createDefaultLogger()
      logger.info('msg')
      expect(consoleSpies.info).toHaveBeenCalledWith('[INFO] msg')
    })

    test('warn prefix is exactly [WARN]', () => {
      const logger = createDefaultLogger()
      logger.warn('msg')
      expect(consoleSpies.warn).toHaveBeenCalledWith('[WARN] msg')
    })

    test('error prefix is exactly [ERROR]', () => {
      const logger = createDefaultLogger()
      logger.error('msg')
      expect(consoleSpies.error).toHaveBeenCalledWith('[ERROR] msg')
    })
  })

  describe('argument forwarding', () => {
    test('debug forwards null arg', () => {
      const logger = createDefaultLogger()
      logger.debug('msg', null)
      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] msg', null)
    })

    test('debug forwards undefined arg', () => {
      const logger = createDefaultLogger()
      logger.debug('msg', undefined)
      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] msg', undefined)
    })

    test('info forwards Error object', () => {
      const logger = createDefaultLogger()
      const err = new Error('test')
      logger.info('msg', err)
      expect(consoleSpies.info).toHaveBeenCalledWith('[INFO] msg', err)
    })

    test('warn forwards nested object', () => {
      const logger = createDefaultLogger()
      const obj = { a: { b: { c: 1 } } }
      logger.warn('msg', obj)
      expect(consoleSpies.warn).toHaveBeenCalledWith('[WARN] msg', obj)
    })

    test('error forwards mixed types', () => {
      const logger = createDefaultLogger()
      logger.error('msg', 1, 'two', true, null, { key: 'val' })
      expect(consoleSpies.error).toHaveBeenCalledWith('[ERROR] msg', 1, 'two', true, null, {
        key: 'val',
      })
    })

    test('debug with no extra args', () => {
      const logger = createDefaultLogger()
      logger.debug('only msg')
      expect(consoleSpies.debug).toHaveBeenCalledTimes(1)
      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] only msg')
    })
  })

  describe('call isolation', () => {
    test('debug call does not affect info', () => {
      const logger = createDefaultLogger()
      logger.debug('d')
      expect(consoleSpies.info).not.toHaveBeenCalled()
    })

    test('info call does not affect warn', () => {
      const logger = createDefaultLogger()
      logger.info('i')
      expect(consoleSpies.warn).not.toHaveBeenCalled()
    })

    test('warn call does not affect error', () => {
      const logger = createDefaultLogger()
      logger.warn('w')
      expect(consoleSpies.error).not.toHaveBeenCalled()
    })

    test('each method tracks its own calls', () => {
      const logger = createDefaultLogger()
      logger.debug('d1')
      logger.debug('d2')
      logger.info('i1')
      logger.warn('w1')
      logger.warn('w2')
      logger.warn('w3')
      expect(consoleSpies.debug).toHaveBeenCalledTimes(2)
      expect(consoleSpies.info).toHaveBeenCalledTimes(1)
      expect(consoleSpies.warn).toHaveBeenCalledTimes(3)
    })
  })

  describe('edge cases', () => {
    test('handles emoji in message', () => {
      const logger = createDefaultLogger()
      expect(() => logger.info('🎉 Success!')).not.toThrow()
    })

    test('handles tab characters', () => {
      const logger = createDefaultLogger()
      expect(() => logger.info('col1\tcol2\tcol3')).not.toThrow()
    })

    test('handles carriage return', () => {
      const logger = createDefaultLogger()
      expect(() => logger.info('line1\r\nline2')).not.toThrow()
    })

    test('handles backslash', () => {
      const logger = createDefaultLogger()
      expect(() => logger.info('path\\to\\file')).not.toThrow()
    })

    test('handles single character message', () => {
      const logger = createDefaultLogger()
      logger.debug('a')
      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] a')
    })

    test('handles very long message', () => {
      const logger = createDefaultLogger()
      const msg = 'x'.repeat(100000)
      expect(() => logger.info(msg)).not.toThrow()
    })

    test('multiple loggers are independent', () => {
      const l1 = createDefaultLogger()
      const l2 = createDefaultLogger()
      l1.info('from l1')
      expect(consoleSpies.info).toHaveBeenCalledTimes(1)
      l2.info('from l2')
      expect(consoleSpies.info).toHaveBeenCalledTimes(2)
    })
  })
})

describe('createSilentLogger - additional', () => {
  test('has exactly 4 methods', () => {
    const logger = createSilentLogger()
    expect(Object.keys(logger)).toHaveLength(4)
  })

  test('debug returns undefined', () => {
    const logger = createSilentLogger()
    expect(logger.debug('msg')).toBeUndefined()
  })

  test('info returns undefined', () => {
    const logger = createSilentLogger()
    expect(logger.info('msg')).toBeUndefined()
  })

  test('warn returns undefined', () => {
    const logger = createSilentLogger()
    expect(logger.warn('msg')).toBeUndefined()
  })

  test('error returns undefined', () => {
    const logger = createSilentLogger()
    expect(logger.error('msg')).toBeUndefined()
  })

  test('all methods are functions', () => {
    const logger = createSilentLogger()
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
  })

  test('methods are distinct', () => {
    const logger = createSilentLogger()
    expect(logger.debug).not.toBe(logger.info)
    expect(logger.info).not.toBe(logger.warn)
    expect(logger.warn).not.toBe(logger.error)
    expect(logger.debug).not.toBe(logger.error)
  })

  test('creates independent instances', () => {
    const l1 = createSilentLogger()
    const l2 = createSilentLogger()
    expect(l1).not.toBe(l2)
    expect(l1.debug).not.toBe(l2.debug)
  })

  test('does not write to console', () => {
    const debugSpy = vi.spyOn(console, 'debug')
    const infoSpy = vi.spyOn(console, 'info')
    const warnSpy = vi.spyOn(console, 'warn')
    const errorSpy = vi.spyOn(console, 'error')

    const logger = createSilentLogger()
    logger.debug('d')
    logger.info('i')
    logger.warn('w')
    logger.error('e')

    expect(debugSpy).not.toHaveBeenCalled()
    expect(infoSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()

    debugSpy.mockRestore()
    infoSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  test('handles many calls without error', () => {
    const logger = createSilentLogger()
    expect(() => {
      for (let i = 0; i < 1000; i++) {
        logger.debug(`msg ${i}`)
        logger.info(`msg ${i}`)
        logger.warn(`msg ${i}`)
        logger.error(`msg ${i}`)
      }
    }).not.toThrow()
  })

  test('debug with many args returns undefined', () => {
    const logger = createSilentLogger()
    expect(logger.debug('a', 'b', 'c', 'd', 'e')).toBeUndefined()
  })

  test('info with object arg returns undefined', () => {
    const logger = createSilentLogger()
    expect(logger.info('msg', { key: 'val' })).toBeUndefined()
  })

  test('can be used as Logger type', () => {
    const logger: Logger = createSilentLogger()
    expect(() => logger.debug('ok')).not.toThrow()
  })

  test('works with empty string message', () => {
    const logger = createSilentLogger()
    expect(() => logger.debug('')).not.toThrow()
  })

  test('works with no side effects', () => {
    const logger = createSilentLogger()
    const arr: number[] = []
    logger.debug('msg')
    expect(arr).toHaveLength(0)
  })
})

describe('ReportCollector', () => {
  test('reports array is mutable', () => {
    const mockLogger = createMockLogger()
    const ctx = createRuleContext({
      logger: mockLogger,
      config: {},
      workspaceRoot: '/ws',
      source: '',
      filePath: '',
      ast: null,
      tokens: [],
      comments: [],
    })
    ctx.report({ message: 'test' })
    expect(ctx.collector.reports.length).toBe(1)
  })

  test('clear does not break subsequent reports', () => {
    const mockLogger = createMockLogger()
    const ctx = createRuleContext({
      logger: mockLogger,
      config: {},
      workspaceRoot: '/ws',
      source: '',
      filePath: '',
      ast: null,
      tokens: [],
      comments: [],
    })
    ctx.report({ message: 'before' })
    ctx.collector.clear()
    ctx.report({ message: 'after' })
    expect(ctx.collector.reports).toHaveLength(1)
    expect(ctx.collector.reports[0].message).toBe('after')
  })

  test('collector is own property of context', () => {
    const mockLogger = createMockLogger()
    const ctx = createRuleContext({
      logger: mockLogger,
      config: {},
      workspaceRoot: '/ws',
      source: '',
      filePath: '',
      ast: null,
      tokens: [],
      comments: [],
    })
    expect(ctx).toHaveProperty('collector')
    expect(ctx.collector).toBeDefined()
  })

  test('separate contexts have separate collectors', () => {
    const mockLogger = createMockLogger()
    const opts = {
      logger: mockLogger,
      config: {},
      workspaceRoot: '/ws',
      source: '',
      filePath: '',
      ast: null,
      tokens: [],
      comments: [],
    }
    const ctx1 = createRuleContext(opts)
    const ctx2 = createRuleContext(opts)
    ctx1.report({ message: 'for ctx1' })
    ctx2.report({ message: 'for ctx2' })
    ctx2.report({ message: 'another for ctx2' })
    expect(ctx1.collector.reports).toHaveLength(1)
    expect(ctx2.collector.reports).toHaveLength(2)
  })

  test('report preserves all descriptor properties', () => {
    const mockLogger = createMockLogger()
    const ctx = createRuleContext({
      logger: mockLogger,
      config: {},
      workspaceRoot: '/ws',
      source: '',
      filePath: '',
      ast: null,
      tokens: [],
      comments: [],
    })
    const descriptor = {
      message: 'full descriptor',
      severity: 'warning' as const,
      ruleId: 'test-rule',
      loc: {
        start: { line: 10, column: 5 },
        end: { line: 10, column: 15 },
      },
    }
    ctx.report(descriptor)
    expect(ctx.collector.reports[0]).toEqual(descriptor)
  })
})

describe('createPluginContext - edge cases', () => {
  let mockLogger: Logger
  let mockConfig: PluginConfig

  beforeEach(() => {
    mockLogger = createMockLogger()
    mockConfig = createMockConfig()
  })

  test('workspaceRoot with forward slash only', () => {
    const ctx = createPluginContext({ logger: mockLogger, config: mockConfig, workspaceRoot: '/' })
    expect(ctx.workspaceRoot).toBe('/')
  })

  test('workspaceRoot with Windows path', () => {
    const ctx = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: 'C:\\Users\\project',
    })
    expect(ctx.workspaceRoot).toBe('C:\\Users\\project')
  })

  test('config with array rule config', () => {
    const config: PluginConfig = { rules: { rule: ['error', { opt: true }] } }
    const ctx = createPluginContext({ logger: mockLogger, config, workspaceRoot: '/ws' })
    expect(ctx.config.rules!['rule']).toEqual(['error', { opt: true }])
  })

  test('config with off rule', () => {
    const config: PluginConfig = { rules: { disabled: 'off' } }
    const ctx = createPluginContext({ logger: mockLogger, config, workspaceRoot: '/ws' })
    expect(ctx.config.rules!['disabled']).toBe('off')
  })

  test('context logger supports variadic args', () => {
    const ctx = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/ws',
    })
    ctx.logger.info('a', 'b', 'c')
    expect(mockLogger.info).toHaveBeenCalledWith('a', 'b', 'c')
  })

  test('context logger error method works', () => {
    const ctx = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/ws',
    })
    ctx.logger.error('err msg', { code: 500 })
    expect(mockLogger.error).toHaveBeenCalledWith('err msg', { code: 500 })
  })

  test('context logger warn method works', () => {
    const ctx = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/ws',
    })
    ctx.logger.warn('warning')
    expect(mockLogger.warn).toHaveBeenCalledWith('warning')
  })

  test('workspaceRoot does not normalize path', () => {
    const ctx = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/a/../b',
    })
    expect(ctx.workspaceRoot).toBe('/a/../b')
  })

  test('workspaceRoot with query string', () => {
    const ctx = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/path?q=1',
    })
    expect(ctx.workspaceRoot).toBe('/path?q=1')
  })

  test('multiple contexts share same logger reference', () => {
    const ctx1 = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/a',
    })
    const ctx2 = createPluginContext({
      logger: mockLogger,
      config: mockConfig,
      workspaceRoot: '/b',
    })
    expect(ctx1.logger).toBe(ctx2.logger)
  })
})

describe('createRuleContext - integration scenarios', () => {
  let mockLogger: Logger

  beforeEach(() => {
    mockLogger = createMockLogger()
  })

  test('full workflow: create, report multiple, clear, report again', () => {
    const ctx = createRuleContext({
      logger: mockLogger,
      config: {},
      workspaceRoot: '/ws',
      source: 'const x = 1;',
      filePath: '/ws/file.ts',
      ast: { type: 'Program' },
      tokens: [],
      comments: [],
    })

    ctx.report({ message: 'violation 1', severity: 'error' })
    ctx.report({ message: 'violation 2', severity: 'warning' })
    expect(ctx.collector.reports).toHaveLength(2)

    ctx.collector.clear()
    expect(ctx.collector.reports).toHaveLength(0)

    ctx.report({ message: 'after clear', severity: 'info' })
    expect(ctx.collector.reports).toHaveLength(1)
    expect(ctx.collector.reports[0].message).toBe('after clear')
  })

  test('context with all properties set', () => {
    const ast = { type: 'Program', body: [] }
    const tokens = [{ type: 'Keyword', value: 'const' }]
    const comments = [{ type: 'Line', value: ' comment' }]
    const config: PluginConfig = { options: { strict: true }, rules: { rule1: 'error' } }

    const ctx = createRuleContext({
      logger: mockLogger,
      config,
      workspaceRoot: '/project',
      source: 'const x = 1;',
      filePath: '/project/src/index.ts',
      ast,
      tokens,
      comments,
    })

    expect(ctx.logger).toBe(mockLogger)
    expect(ctx.config).toBe(config)
    expect(ctx.workspaceRoot).toBe('/project')
    expect(ctx.getSource()).toBe('const x = 1;')
    expect(ctx.getFilePath()).toBe('/project/src/index.ts')
    expect(ctx.getAST()).toBe(ast)
    expect(ctx.getTokens()).toBe(tokens)
    expect(ctx.getComments()).toBe(comments)
    expect(ctx.collector.reports).toHaveLength(0)
  })

  test('multiple report calls accumulate correctly', () => {
    const ctx = createRuleContext({
      logger: mockLogger,
      config: {},
      workspaceRoot: '/ws',
      source: '',
      filePath: '',
      ast: null,
      tokens: [],
      comments: [],
    })

    for (let i = 0; i < 50; i++) {
      ctx.report({ message: `violation ${i}` })
    }

    expect(ctx.collector.reports).toHaveLength(50)
    expect(ctx.collector.reports[0].message).toBe('violation 0')
    expect(ctx.collector.reports[49].message).toBe('violation 49')
  })

  test('context with null ast still works', () => {
    const ctx = createRuleContext({
      logger: mockLogger,
      config: {},
      workspaceRoot: '/ws',
      source: '',
      filePath: '/file.ts',
      ast: null,
      tokens: [],
      comments: [],
    })
    expect(ctx.getAST()).toBeNull()
    expect(() => ctx.report({ message: 'works' })).not.toThrow()
  })

  test('context with empty everything still works', () => {
    const ctx = createRuleContext({
      logger: mockLogger,
      config: {},
      workspaceRoot: '',
      source: '',
      filePath: '',
      ast: null,
      tokens: [],
      comments: [],
    })
    expect(ctx.getSource()).toBe('')
    expect(ctx.getFilePath()).toBe('')
    expect(ctx.getAST()).toBeNull()
    expect(ctx.getTokens()).toEqual([])
    expect(ctx.getComments()).toEqual([])
    expect(ctx.workspaceRoot).toBe('')
  })

  test('report with loc having only start', () => {
    const ctx = createRuleContext({
      logger: mockLogger,
      config: {},
      workspaceRoot: '/ws',
      source: '',
      filePath: '',
      ast: null,
      tokens: [],
      comments: [],
    })
    ctx.report({ message: 'partial loc', loc: { start: { line: 1, column: 0 } } })
    expect(ctx.collector.reports[0].loc).toEqual({ start: { line: 1, column: 0 } })
  })

  test('getSource returns frozen source value', () => {
    let source = 'let x = 1;'
    const ctx = createRuleContext({
      logger: mockLogger,
      config: {},
      workspaceRoot: '/ws',
      source,
      filePath: '',
      ast: null,
      tokens: [],
      comments: [],
    })
    source = 'changed'
    expect(ctx.getSource()).toBe('let x = 1;')
  })

  test('getFilePath returns frozen path value', () => {
    let filePath = '/original.ts'
    const ctx = createRuleContext({
      logger: mockLogger,
      config: {},
      workspaceRoot: '/ws',
      source: '',
      filePath,
      ast: null,
      tokens: [],
      comments: [],
    })
    filePath = '/changed.ts'
    expect(ctx.getFilePath()).toBe('/original.ts')
  })
})

describe('createDefaultLogger vs createSilentLogger', () => {
  test('default and silent loggers have same interface shape', () => {
    const defaultLogger = createDefaultLogger()
    const silentLogger = createSilentLogger()
    expect(Object.keys(defaultLogger).sort()).toEqual(Object.keys(silentLogger).sort())
  })

  test('default and silent loggers both have 4 methods', () => {
    const defaultLogger = createDefaultLogger()
    const silentLogger = createSilentLogger()
    expect(Object.keys(defaultLogger)).toHaveLength(4)
    expect(Object.keys(silentLogger)).toHaveLength(4)
  })

  test('both implement Logger interface', () => {
    const dl: Logger = createDefaultLogger()
    const sl: Logger = createSilentLogger()
    expect(typeof dl.debug).toBe('function')
    expect(typeof sl.debug).toBe('function')
  })

  test('default logger methods are not silent', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const logger = createDefaultLogger()
    logger.debug('test')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  test('silent logger methods are no-ops', () => {
    const spy = vi.spyOn(console, 'debug')
    const logger = createSilentLogger()
    logger.debug('test')
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe('createRuleContext - report validation', () => {
  let mockLogger: Logger

  beforeEach(() => {
    mockLogger = createMockLogger()
  })

  function makeCtx() {
    return createRuleContext({
      logger: mockLogger,
      config: {},
      workspaceRoot: '/ws',
      source: '',
      filePath: '',
      ast: null,
      tokens: [],
      comments: [],
    })
  }

  test('report accepts message with only whitespace', () => {
    const ctx = makeCtx()
    expect(() => ctx.report({ message: '   ' })).not.toThrow()
  })

  test('report accepts message with newlines', () => {
    const ctx = makeCtx()
    ctx.report({ message: 'line1\nline2' })
    expect(ctx.collector.reports[0].message).toBe('line1\nline2')
  })

  test('report TypeError message for empty string', () => {
    const ctx = makeCtx()
    try {
      ctx.report({ message: '' })
      expect.unreachable('Should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(TypeError)
    }
  })

  test('report TypeError for boolean message', () => {
    const ctx = makeCtx()
    expect(() => ctx.report({ message: true as unknown as string })).toThrow(TypeError)
  })

  test('report TypeError for object message', () => {
    const ctx = makeCtx()
    expect(() => ctx.report({ message: {} as unknown as string })).toThrow(TypeError)
  })

  test('report does not add on error', () => {
    const ctx = makeCtx()
    try {
      ctx.report({ message: '' })
    } catch {
      // expected
    }
    expect(ctx.collector.reports).toHaveLength(0)
  })

  test('report with severity error', () => {
    const ctx = makeCtx()
    ctx.report({ message: 'err', severity: 'error' })
    expect(ctx.collector.reports[0].severity).toBe('error')
  })

  test('report with severity warning', () => {
    const ctx = makeCtx()
    ctx.report({ message: 'warn', severity: 'warning' })
    expect(ctx.collector.reports[0].severity).toBe('warning')
  })

  test('report with severity info', () => {
    const ctx = makeCtx()
    ctx.report({ message: 'info', severity: 'info' })
    expect(ctx.collector.reports[0].severity).toBe('info')
  })

  test('report with line and column location', () => {
    const ctx = makeCtx()
    ctx.report({
      message: 'loc test',
      loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 20 } },
    })
    expect(ctx.collector.reports[0].loc!.start.line).toBe(5)
    expect(ctx.collector.reports[0].loc!.start.column).toBe(10)
    expect(ctx.collector.reports[0].loc!.end.line).toBe(5)
    expect(ctx.collector.reports[0].loc!.end.column).toBe(20)
  })

  test('report with fix text', () => {
    const ctx = makeCtx()
    ctx.report({ message: 'fix', fix: { range: [0, 1] as [number, number], text: 'a' } })
    expect(ctx.collector.reports[0].fix!.text).toBe('a')
    expect(ctx.collector.reports[0].fix!.range).toEqual([0, 1])
  })

  test('report with multiple fields combined', () => {
    const ctx = makeCtx()
    ctx.report({
      message: 'combined',
      severity: 'error',
      ruleId: 'rule-1',
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
    })
    const r = ctx.collector.reports[0]
    expect(r.message).toBe('combined')
    expect(r.severity).toBe('error')
    expect(r.ruleId).toBe('rule-1')
    expect(r.loc).toBeDefined()
  })

  test('report with ruleId only', () => {
    const ctx = makeCtx()
    ctx.report({ message: 'with rule', ruleId: 'custom-rule' })
    expect(ctx.collector.reports[0].ruleId).toBe('custom-rule')
  })

  test('collector clear then 20 reports', () => {
    const ctx = makeCtx()
    ctx.report({ message: 'initial' })
    ctx.collector.clear()
    for (let i = 0; i < 20; i++) {
      ctx.report({ message: `report-${i}` })
    }
    expect(ctx.collector.reports).toHaveLength(20)
    expect(ctx.collector.reports[19].message).toBe('report-19')
  })

  test('report with numeric message throws TypeError', () => {
    const ctx = makeCtx()
    expect(() => ctx.report({ message: 123 as unknown as string })).toThrow(TypeError)
  })

  test('report does not mutate descriptor', () => {
    const ctx = makeCtx()
    const desc = { message: 'original' }
    ctx.report(desc)
    expect(desc.message).toBe('original')
  })
})
