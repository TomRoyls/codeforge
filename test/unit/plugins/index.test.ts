import { describe, test, expect } from 'vitest'

describe('plugins/index', () => {
  describe('exports types from types.js', () => {
    test('exports Severity type', () => {
      const severity: import('../../../src/plugins/types.js').Severity = 'error'
      expect(severity).toBe('error')
    })

    test('exports RuleType type', () => {
      const ruleType: import('../../../src/plugins/types.js').RuleType = 'problem'
      expect(ruleType).toBe('problem')
    })

    test('exports RuleSchema type', () => {
      const schema: import('../../../src/plugins/types.js').RuleSchema = []
      expect(Array.isArray(schema)).toBe(true)
    })

    test('exports RuleMeta interface', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'problem',
        severity: 'error',
        docs: { description: 'test' },
      }
      expect(meta.type).toBe('problem')
      expect(meta.severity).toBe('error')
    })

    test('exports Position interface', () => {
      const pos: import('../../../src/plugins/types.js').Position = { line: 1, column: 0 }
      expect(pos.line).toBe(1)
      expect(pos.column).toBe(0)
    })

    test('exports Range type', () => {
      const range: import('../../../src/plugins/types.js').Range = [0, 10]
      expect(range).toHaveLength(2)
      expect(range[0]).toBe(0)
      expect(range[1]).toBe(10)
    })

    test('exports SourceLocation interface', () => {
      const loc: import('../../../src/plugins/types.js').SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 10 },
      }
      expect(loc.start.line).toBe(1)
      expect(loc.end.column).toBe(10)
    })

    test('exports ReportDescriptor interface', () => {
      const descriptor: import('../../../src/plugins/types.js').ReportDescriptor = {
        message: 'test',
      }
      expect(descriptor.message).toBe('test')
    })

    test('exports FixDescriptor interface', () => {
      const fix: import('../../../src/plugins/types.js').FixDescriptor = {
        range: [0, 10],
        text: 'replacement',
      }
      expect(fix.text).toBe('replacement')
    })

    test('exports SuggestionDescriptor interface', () => {
      const suggestion: import('../../../src/plugins/types.js').SuggestionDescriptor = {
        desc: 'description',
        message: 'message',
        fix: { range: [0, 10], text: 'replacement' },
      }
      expect(suggestion.desc).toBe('description')
    })

    test('exports RuleVisitor type', () => {
      const visitor: import('../../../src/plugins/types.js').RuleVisitor = {}
      expect(typeof visitor).toBe('object')
    })

    test('exports RuleDefinition interface', () => {
      const definition: import('../../../src/plugins/types.js').RuleDefinition = {
        meta: {
          type: 'problem',
          severity: 'error',
          docs: { description: 'test' },
        },
        create: () => ({}),
      }
      expect(definition.meta.type).toBe('problem')
    })

    test('exports TransformContext interface', () => {
      const transformCtx: import('../../../src/plugins/types.js').TransformContext = {
        logger: {
          debug: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
        },
        config: {},
        workspaceRoot: '/',
        getSource: () => '',
        getFilePath: () => '',
        reportError: () => {},
      }
      expect(transformCtx.workspaceRoot).toBe('/')
    })

    test('exports TransformFunction type', () => {
      const transformFn: import('../../../src/plugins/types.js').TransformFunction = (
        source,
        _context,
      ) => source
      expect(typeof transformFn).toBe('function')
    })

    test('exports TransformDefinition interface', () => {
      const transformDef: import('../../../src/plugins/types.js').TransformDefinition = {
        name: 'test-transform',
        transform: (source) => source,
      }
      expect(transformDef.name).toBe('test-transform')
    })

    test('exports HookContext interface', () => {
      const hookCtx: import('../../../src/plugins/types.js').HookContext = {
        logger: {
          debug: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
        },
        timestamp: new Date(),
      }
      expect(hookCtx.timestamp).toBeInstanceOf(Date)
    })

    test('exports PluginHooks interface', () => {
      const hooks: import('../../../src/plugins/types.js').PluginHooks = {}
      expect(typeof hooks).toBe('object')
    })

    test('exports Logger interface', () => {
      const logger: import('../../../src/plugins/types.js').Logger = {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      }
      expect(typeof logger.debug).toBe('function')
    })

    test('exports PluginConfig interface', () => {
      const config: import('../../../src/plugins/types.js').PluginConfig = {
        options: {},
        rules: {},
        transforms: [],
      }
      expect(Array.isArray(config.transforms)).toBe(true)
    })

    test('exports Plugin interface', () => {
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
      }
      expect(plugin.name).toBe('test-plugin')
      expect(plugin.version).toBe('1.0.0')
    })

    test('exports PluginManifest interface', () => {
      const manifest: import('../../../src/plugins/types.js').PluginManifest = {
        name: 'test-plugin',
        version: '1.0.0',
        main: 'index.js',
      }
      expect(manifest.name).toBe('test-plugin')
      expect(manifest.main).toBe('index.js')
    })

    test('exports PluginContext interface', () => {
      const pluginCtx: import('../../../src/plugins/types.js').PluginContext = {
        logger: {
          debug: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
        },
        config: {},
        workspaceRoot: '/',
      }
      expect(pluginCtx.workspaceRoot).toBe('/')
    })

    test('exports RuleContext interface', () => {
      const ruleCtx: import('../../../src/plugins/types.js').RuleContext = {
        logger: {
          debug: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
        },
        config: {},
        workspaceRoot: '/',
        report: () => {},
        getSource: () => '',
        getFilePath: () => '',
        getAST: () => ({}),
        getTokens: () => [],
        getComments: () => [],
      }
      expect(ruleCtx.workspaceRoot).toBe('/')
    })
  })

  describe('exports error classes from types.js', () => {
    test('exports PluginError class', async () => {
      const { PluginError } = await import('../../../src/plugins/index.js')
      const error = new PluginError('test-plugin', 'test error', 'TEST_CODE')
      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('PluginError')
      expect(error.pluginName).toBe('test-plugin')
      expect(error.code).toBe('TEST_CODE')
    })

    test('exports PluginLoadError class', async () => {
      const { PluginLoadError, PluginError } = await import('../../../src/plugins/index.js')
      const error = new PluginLoadError('test-plugin', 'load failed')
      expect(error).toBeInstanceOf(PluginError)
      expect(error.name).toBe('PluginLoadError')
      expect(error.code).toBe('PLUGIN_LOAD_ERROR')
    })

    test('exports RuleExecutionError class', async () => {
      const { RuleExecutionError, PluginError } = await import('../../../src/plugins/index.js')
      const error = new RuleExecutionError('test-plugin', 'test-rule', 'rule failed')
      expect(error).toBeInstanceOf(PluginError)
      expect(error.name).toBe('RuleExecutionError')
      expect(error.ruleName).toBe('test-rule')
      expect(error.code).toBe('RULE_EXECUTION_ERROR')
    })

    test('exports TransformExecutionError class', async () => {
      const { TransformExecutionError, PluginError } = await import('../../../src/plugins/index.js')
      const error = new TransformExecutionError('test-plugin', 'test-transform', 'transform failed')
      expect(error).toBeInstanceOf(PluginError)
      expect(error.name).toBe('TransformExecutionError')
      expect(error.transformName).toBe('test-transform')
      expect(error.code).toBe('TRANSFORM_EXECUTION_ERROR')
    })

    test('exports HookExecutionError class', async () => {
      const { HookExecutionError, PluginError } = await import('../../../src/plugins/index.js')
      const error = new HookExecutionError('test-plugin', 'test-hook', 'hook failed')
      expect(error).toBeInstanceOf(PluginError)
      expect(error.name).toBe('HookExecutionError')
      expect(error.hookName).toBe('test-hook')
      expect(error.code).toBe('HOOK_EXECUTION_ERROR')
    })
  })

  describe('exports context functions from context.js', () => {
    test('exports createPluginContext function', async () => {
      const { createPluginContext } = await import('../../../src/plugins/index.js')
      expect(typeof createPluginContext).toBe('function')
    })

    test('exports createRuleContext function', async () => {
      const { createRuleContext } = await import('../../../src/plugins/index.js')
      expect(typeof createRuleContext).toBe('function')
    })

    test('exports createDefaultLogger function', async () => {
      const { createDefaultLogger } = await import('../../../src/plugins/index.js')
      expect(typeof createDefaultLogger).toBe('function')
    })

    test('exports createSilentLogger function', async () => {
      const { createSilentLogger } = await import('../../../src/plugins/index.js')
      expect(typeof createSilentLogger).toBe('function')
    })

    test('createPluginContext works', async () => {
      const { createPluginContext, createDefaultLogger } =
        await import('../../../src/plugins/index.js')
      const context = createPluginContext({
        logger: createDefaultLogger(),
        config: {},
        workspaceRoot: '/workspace',
      })
      expect(context.workspaceRoot).toBe('/workspace')
    })

    test('createDefaultLogger works', async () => {
      const { createDefaultLogger } = await import('../../../src/plugins/index.js')
      const logger = createDefaultLogger()
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
    })

    test('createSilentLogger works', async () => {
      const { createSilentLogger } = await import('../../../src/plugins/index.js')
      const logger = createSilentLogger()
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
    })
  })

  describe('exports registry utilities from registry.js', () => {
    test('exports PluginRegistry class', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      expect(registry).toBeInstanceOf(PluginRegistry)
      expect(registry.size).toBe(0)
    })

    test('exports isPluginName function', async () => {
      const { isPluginName } = await import('../../../src/plugins/index.js')
      expect(typeof isPluginName).toBe('function')
      expect(isPluginName('codeforge-plugin-test')).toBe(true)
      expect(isPluginName('random-package')).toBe(false)
    })

    test('exports parsePluginName function', async () => {
      const { parsePluginName } = await import('../../../src/plugins/index.js')
      expect(typeof parsePluginName).toBe('function')
      const result = parsePluginName('codeforge-plugin-test')
      expect(result.scope).toBeNull()
      expect(result.name).toBe('codeforge-plugin-test')
    })

    test('exports PLUGIN_PATTERNS constant', async () => {
      const { PLUGIN_PATTERNS } = await import('../../../src/plugins/index.js')
      expect(PLUGIN_PATTERNS).toBeDefined()
      expect(PLUGIN_PATTERNS.prefix).toBe('codeforge-plugin-')
      expect(PLUGIN_PATTERNS.scoped).toBeInstanceOf(RegExp)
    })
  })

  describe('exports PluginManager from manager.js', () => {
    test('exports PluginManager class', async () => {
      const { PluginManager } = await import('../../../src/plugins/index.js')
      const manager = new PluginManager({ workspaceRoot: '/workspace' })
      expect(manager).toBeInstanceOf(PluginManager)
      expect(manager.getWorkspaceRoot()).toBe('/workspace')
    })
  })

  describe('all exports are available together', () => {
    test('can import all exports at once', async () => {
      const exports = await import('../../../src/plugins/index.js')

      expect(exports).toBeDefined()

      expect(exports.PluginManager).toBeInstanceOf(Function)
      expect(exports.PluginRegistry).toBeInstanceOf(Function)
      expect(exports.PluginError).toBeInstanceOf(Function)
      expect(exports.PluginLoadError).toBeInstanceOf(Function)
      expect(exports.RuleExecutionError).toBeInstanceOf(Function)
      expect(exports.TransformExecutionError).toBeInstanceOf(Function)
      expect(exports.HookExecutionError).toBeInstanceOf(Function)

      expect(typeof exports.createPluginContext).toBe('function')
      expect(typeof exports.createRuleContext).toBe('function')
      expect(typeof exports.createDefaultLogger).toBe('function')
      expect(typeof exports.createSilentLogger).toBe('function')
      expect(typeof exports.isPluginName).toBe('function')
      expect(typeof exports.parsePluginName).toBe('function')

      expect(exports.PLUGIN_PATTERNS).toBeDefined()
    })
  })

  describe('exports maintain type safety', () => {
    test('error classes extend Error', async () => {
      const {
        PluginError,
        PluginLoadError,
        RuleExecutionError,
        TransformExecutionError,
        HookExecutionError,
      } = await import('../../../src/plugins/index.js')

      const pluginError = new PluginError('test', 'message', 'CODE')
      expect(pluginError).toBeInstanceOf(Error)
      expect(pluginError.stack).toBeDefined()

      const loadError = new PluginLoadError('test', 'message')
      expect(loadError).toBeInstanceOf(PluginError)
      expect(loadError).toBeInstanceOf(Error)

      const ruleError = new RuleExecutionError('test', 'rule', 'message')
      expect(ruleError).toBeInstanceOf(PluginError)
      expect(ruleError).toBeInstanceOf(Error)

      const transformError = new TransformExecutionError('test', 'transform', 'message')
      expect(transformError).toBeInstanceOf(PluginError)
      expect(transformError).toBeInstanceOf(Error)

      const hookError = new HookExecutionError('test', 'hook', 'message')
      expect(hookError).toBeInstanceOf(PluginError)
      expect(hookError).toBeInstanceOf(Error)
    })
  })

  describe('PluginError behavior', () => {
    test('PluginError formats message with plugin name', async () => {
      const { PluginError } = await import('../../../src/plugins/index.js')
      const error = new PluginError('my-plugin', 'something broke', 'TEST_CODE')
      expect(error.message).toBe('[my-plugin] something broke')
    })

    test('PluginError stores cause when provided', async () => {
      const { PluginError } = await import('../../../src/plugins/index.js')
      const cause = new Error('original error')
      const error = new PluginError('my-plugin', 'wrapper', 'CODE', cause)
      expect(error.cause).toBe(cause)
    })

    test('PluginError cause is undefined when not provided', async () => {
      const { PluginError } = await import('../../../src/plugins/index.js')
      const error = new PluginError('my-plugin', 'wrapper', 'CODE')
      expect(error.cause).toBeUndefined()
    })

    test('RuleExecutionError formats message with rule name', async () => {
      const { RuleExecutionError } = await import('../../../src/plugins/index.js')
      const error = new RuleExecutionError('plugin-a', 'no-console', 'should not use console')
      expect(error.message).toContain('no-console')
      expect(error.ruleName).toBe('no-console')
    })

    test('TransformExecutionError formats message with transform name', async () => {
      const { TransformExecutionError } = await import('../../../src/plugins/index.js')
      const error = new TransformExecutionError('plugin-a', 'minify', 'transform failed')
      expect(error.message).toContain('minify')
      expect(error.transformName).toBe('minify')
    })

    test('HookExecutionError formats message with hook name', async () => {
      const { HookExecutionError } = await import('../../../src/plugins/index.js')
      const error = new HookExecutionError('plugin-a', 'onLoad', 'hook crashed')
      expect(error.message).toContain('onLoad')
      expect(error.hookName).toBe('onLoad')
    })

    test('PluginLoadError has default code PLUGIN_LOAD_ERROR', async () => {
      const { PluginLoadError } = await import('../../../src/plugins/index.js')
      const error = new PluginLoadError('test-plugin', 'load failed')
      expect(error.code).toBe('PLUGIN_LOAD_ERROR')
    })

    test('RuleExecutionError has default code RULE_EXECUTION_ERROR', async () => {
      const { RuleExecutionError } = await import('../../../src/plugins/index.js')
      const error = new RuleExecutionError('p', 'rule', 'msg')
      expect(error.code).toBe('RULE_EXECUTION_ERROR')
    })

    test('TransformExecutionError has default code TRANSFORM_EXECUTION_ERROR', async () => {
      const { TransformExecutionError } = await import('../../../src/plugins/index.js')
      const error = new TransformExecutionError('p', 'transform', 'msg')
      expect(error.code).toBe('TRANSFORM_EXECUTION_ERROR')
    })

    test('HookExecutionError has default code HOOK_EXECUTION_ERROR', async () => {
      const { HookExecutionError } = await import('../../../src/plugins/index.js')
      const error = new HookExecutionError('p', 'hook', 'msg')
      expect(error.code).toBe('HOOK_EXECUTION_ERROR')
    })
  })

  describe('createPluginContext behavior', () => {
    test('preserves logger reference', async () => {
      const { createPluginContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const logger = createSilentLogger()
      const context = createPluginContext({ logger, config: {}, workspaceRoot: '/root' })
      expect(context.logger).toBe(logger)
    })

    test('preserves config reference', async () => {
      const { createPluginContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const config = { options: { foo: true }, rules: {}, transforms: [] }
      const context = createPluginContext({
        logger: createSilentLogger(),
        config,
        workspaceRoot: '/root',
      })
      expect(context.config).toBe(config)
    })

    test('stores workspaceRoot', async () => {
      const { createPluginContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createPluginContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/custom/path',
      })
      expect(context.workspaceRoot).toBe('/custom/path')
    })
  })

  describe('createRuleContext behavior', () => {
    test('creates context with all required methods', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: 'const x = 1',
        filePath: '/test.ts',
        ast: { type: 'Program' },
        tokens: [{ type: 'Keyword', value: 'const' }],
        comments: [],
      })
      expect(typeof context.report).toBe('function')
      expect(typeof context.getSource).toBe('function')
      expect(typeof context.getFilePath).toBe('function')
      expect(typeof context.getAST).toBe('function')
      expect(typeof context.getTokens).toBe('function')
      expect(typeof context.getComments).toBe('function')
    })

    test('getSource returns source string', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: 'const x = 1;',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments: [],
      })
      expect(context.getSource()).toBe('const x = 1;')
    })

    test('getFilePath returns file path', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/project/src/index.ts',
        ast: {},
        tokens: [],
        comments: [],
      })
      expect(context.getFilePath()).toBe('/project/src/index.ts')
    })

    test('getAST returns ast object', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const ast = { type: 'Program', body: [] }
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast,
        tokens: [],
        comments: [],
      })
      expect(context.getAST()).toBe(ast)
    })

    test('getTokens returns tokens array', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const tokens = [{ type: 'Keyword', value: 'const' }]
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens,
        comments: [],
      })
      expect(context.getTokens()).toBe(tokens)
    })

    test('getComments returns comments array', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const comments = [{ type: 'Line', value: ' comment' }]
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments,
      })
      expect(context.getComments()).toBe(comments)
    })

    test('report collects report descriptors', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments: [],
      })
      context.report({ message: 'first issue' })
      context.report({ message: 'second issue' })
      expect(context.collector.reports).toHaveLength(2)
      expect(context.collector.reports[0].message).toBe('first issue')
      expect(context.collector.reports[1].message).toBe('second issue')
    })

    test('report throws on missing message', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments: [],
      })
      expect(() => context.report({ message: '' })).toThrow(TypeError)
    })

    test('report throws on non-string message', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments: [],
      })
      expect(() => context.report({ message: undefined as unknown as string })).toThrow(TypeError)
    })

    test('collector clear empties reports', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments: [],
      })
      context.report({ message: 'issue' })
      expect(context.collector.reports).toHaveLength(1)
      context.collector.clear()
      expect(context.collector.reports).toHaveLength(0)
    })
  })

  describe('isPluginName behavior', () => {
    test('returns true for unscoped plugin name', async () => {
      const { isPluginName } = await import('../../../src/plugins/index.js')
      expect(isPluginName('codeforge-plugin-foo')).toBe(true)
    })

    test('returns true for scoped plugin name', async () => {
      const { isPluginName } = await import('../../../src/plugins/index.js')
      expect(isPluginName('@myorg/codeforge-plugin-bar')).toBe(true)
    })

    test('returns false for package without plugin prefix', async () => {
      const { isPluginName } = await import('../../../src/plugins/index.js')
      expect(isPluginName('random-package')).toBe(false)
    })

    test('returns false for scoped package without plugin prefix', async () => {
      const { isPluginName } = await import('../../../src/plugins/index.js')
      expect(isPluginName('@scope/other-package')).toBe(false)
    })

    test('returns false for empty string', async () => {
      const { isPluginName } = await import('../../../src/plugins/index.js')
      expect(isPluginName('')).toBe(false)
    })
  })

  describe('parsePluginName behavior', () => {
    test('parses unscoped plugin name', async () => {
      const { parsePluginName } = await import('../../../src/plugins/index.js')
      const result = parsePluginName('codeforge-plugin-test')
      expect(result.scope).toBeNull()
      expect(result.name).toBe('codeforge-plugin-test')
    })

    test('parses scoped plugin name', async () => {
      const { parsePluginName } = await import('../../../src/plugins/index.js')
      const result = parsePluginName('@myorg/codeforge-plugin-test')
      expect(result.scope).toBe('@myorg')
      expect(result.name).toBe('codeforge-plugin-test')
    })

    test('throws on invalid scoped name with only scope', async () => {
      const { parsePluginName, PluginLoadError } = await import('../../../src/plugins/index.js')
      expect(() => parsePluginName('@scope')).toThrow(PluginLoadError)
    })
  })

  describe('PLUGIN_PATTERNS behavior', () => {
    test('prefix matches unscoped plugin names', async () => {
      const { PLUGIN_PATTERNS } = await import('../../../src/plugins/index.js')
      expect('codeforge-plugin-test'.startsWith(PLUGIN_PATTERNS.prefix)).toBe(true)
    })

    test('scoped regex matches scoped plugin names', async () => {
      const { PLUGIN_PATTERNS } = await import('../../../src/plugins/index.js')
      expect(PLUGIN_PATTERNS.scoped.test('@scope/codeforge-plugin-foo')).toBe(true)
    })

    test('scoped regex does not match non-plugin scoped names', async () => {
      const { PLUGIN_PATTERNS } = await import('../../../src/plugins/index.js')
      expect(PLUGIN_PATTERNS.scoped.test('@scope/other-package')).toBe(false)
    })
  })

  describe('PluginRegistry behavior', () => {
    test('register adds a valid plugin', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
      }
      registry.register(plugin)
      expect(registry.size).toBe(1)
      expect(registry.get('test-plugin')).toBe(plugin)
    })

    test('register throws on missing name', async () => {
      const { PluginRegistry, PluginLoadError } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin = { version: '1.0.0' } as import('../../../src/plugins/types.js').Plugin
      expect(() => registry.register(plugin)).toThrow(PluginLoadError)
    })

    test('register throws on missing version', async () => {
      const { PluginRegistry, PluginLoadError } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin = { name: 'test' } as import('../../../src/plugins/types.js').Plugin
      expect(() => registry.register(plugin)).toThrow(PluginLoadError)
    })

    test('register throws on duplicate plugin', async () => {
      const { PluginRegistry, PluginLoadError } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'dup',
        version: '1.0.0',
      }
      registry.register(plugin)
      expect(() => registry.register(plugin)).toThrow(PluginLoadError)
    })

    test('unregister removes a registered plugin', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'to-remove', version: '1.0.0' })
      expect(registry.has('to-remove')).toBe(true)
      registry.unregister('to-remove')
      expect(registry.has('to-remove')).toBe(false)
      expect(registry.size).toBe(0)
    })

    test('unregister throws for non-existent plugin', async () => {
      const { PluginRegistry, PluginLoadError } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      expect(() => registry.unregister('nonexistent')).toThrow(PluginLoadError)
    })

    test('get returns undefined for non-existent plugin', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      expect(registry.get('missing')).toBeUndefined()
    })

    test('has returns false for non-existent plugin', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      expect(registry.has('missing')).toBe(false)
    })

    test('getAll returns all registered plugins', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const p1: import('../../../src/plugins/types.js').Plugin = { name: 'a', version: '1.0.0' }
      const p2: import('../../../src/plugins/types.js').Plugin = { name: 'b', version: '2.0.0' }
      registry.register(p1)
      registry.register(p2)
      const all = registry.getAll()
      expect(all).toHaveLength(2)
      expect(all).toContain(p1)
      expect(all).toContain(p2)
    })

    test('getNames returns all plugin names', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'alpha', version: '1.0.0' })
      registry.register({ name: 'beta', version: '1.0.0' })
      const names = registry.getNames()
      expect(names).toEqual(expect.arrayContaining(['alpha', 'beta']))
    })

    test('clear removes all plugins', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'a', version: '1.0.0' })
      registry.register({ name: 'b', version: '1.0.0' })
      expect(registry.size).toBe(2)
      registry.clear()
      expect(registry.size).toBe(0)
    })

    test('discover returns empty array for missing node_modules', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const result = await registry.discover('/nonexistent/path')
      expect(result).toEqual([])
    })
  })

  describe('PluginManager behavior', () => {
    test('constructor uses default logger when none provided', async () => {
      const { PluginManager } = await import('../../../src/plugins/index.js')
      const manager = new PluginManager({ workspaceRoot: '/workspace' })
      expect(manager).toBeInstanceOf(PluginManager)
      expect(manager.getWorkspaceRoot()).toBe('/workspace')
    })

    test('constructor uses custom registry when provided', async () => {
      const { PluginManager, PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const manager = new PluginManager({ workspaceRoot: '/workspace', registry })
      expect(manager.getRegistry()).toBe(registry)
    })

    test('loadPlugin loads a pre-registered plugin', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'pre-registered',
        version: '1.0.0',
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      const loaded = await manager.loadPlugin('pre-registered')
      expect(loaded.name).toBe('pre-registered')
      expect(manager.isLoaded('pre-registered')).toBe(true)
    })

    test('loadPlugin returns cached plugin on second call', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'cached',
        version: '1.0.0',
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      const first = await manager.loadPlugin('cached')
      const second = await manager.loadPlugin('cached')
      expect(first).toBe(second)
    })

    test('loadPlugin throws for non-existent plugin', async () => {
      const { PluginManager, PluginLoadError, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        logger: createSilentLogger(),
      })
      await expect(manager.loadPlugin('nonexistent')).rejects.toThrow(PluginLoadError)
    })

    test('unloadPlugin removes loaded plugin', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'removable', version: '1.0.0' })
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('removable')
      expect(manager.isLoaded('removable')).toBe(true)
      manager.unloadPlugin('removable')
      expect(manager.isLoaded('removable')).toBe(false)
    })

    test('unloadPlugin handles non-loaded plugin gracefully', async () => {
      const { PluginManager, createSilentLogger } = await import('../../../src/plugins/index.js')
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        logger: createSilentLogger(),
      })
      expect(() => manager.unloadPlugin('not-loaded')).not.toThrow()
    })

    test('getPlugin returns loaded plugin', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'findable',
        version: '1.0.0',
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('findable')
      expect(manager.getPlugin('findable')).toBe(plugin)
    })

    test('getPlugin returns undefined for non-loaded plugin', async () => {
      const { PluginManager, createSilentLogger } = await import('../../../src/plugins/index.js')
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        logger: createSilentLogger(),
      })
      expect(manager.getPlugin('missing')).toBeUndefined()
    })

    test('getAllPlugins returns all loaded plugins', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const p1: import('../../../src/plugins/types.js').Plugin = { name: 'x', version: '1.0.0' }
      const p2: import('../../../src/plugins/types.js').Plugin = { name: 'y', version: '1.0.0' }
      registry.register(p1)
      registry.register(p2)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('x')
      await manager.loadPlugin('y')
      expect(manager.getAllPlugins()).toHaveLength(2)
    })

    test('getLoadedPluginNames returns names of loaded plugins', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'name-a', version: '1.0.0' })
      registry.register({ name: 'name-b', version: '1.0.0' })
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('name-a')
      await manager.loadPlugin('name-b')
      const names = manager.getLoadedPluginNames()
      expect(names).toEqual(expect.arrayContaining(['name-a', 'name-b']))
    })

    test('getRules collects rules from all loaded plugins', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'rules-plugin',
        version: '1.0.0',
        rules: {
          'my-rule': {
            meta: { type: 'problem', severity: 'error', docs: { description: 'test' } },
            create: () => ({}),
          },
        },
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('rules-plugin')
      const rules = manager.getRules()
      expect(rules['rules-plugin/my-rule']).toBeDefined()
      expect(rules['rules-plugin/my-rule'].meta.type).toBe('problem')
    })

    test('getPluginRules returns rules for specific plugin', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'specific-rules',
        version: '1.0.0',
        rules: {
          'rule-a': {
            meta: { type: 'problem', severity: 'error', docs: { description: 'a' } },
            create: () => ({}),
          },
        },
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('specific-rules')
      const rules = manager.getPluginRules('specific-rules')
      expect(rules).toBeDefined()
      expect(Object.keys(rules ?? {})).toContain('rule-a')
    })

    test('getPluginRules returns undefined for unloaded plugin', async () => {
      const { PluginManager, createSilentLogger } = await import('../../../src/plugins/index.js')
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        logger: createSilentLogger(),
      })
      expect(manager.getPluginRules('missing')).toBeUndefined()
    })

    test('getRule resolves qualified name', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const rule: import('../../../src/plugins/types.js').RuleDefinition = {
        meta: { type: 'suggestion', severity: 'warn', docs: { description: 'test' } },
        create: () => ({}),
      }
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'rule-host',
        version: '1.0.0',
        rules: { 'check-thing': rule },
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('rule-host')
      const found = manager.getRule('rule-host/check-thing')
      expect(found).toBe(rule)
    })

    test('getRule returns undefined for invalid qualified name', async () => {
      const { PluginManager, createSilentLogger } = await import('../../../src/plugins/index.js')
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        logger: createSilentLogger(),
      })
      expect(manager.getRule('invalid')).toBeUndefined()
    })

    test('getRule resolves scoped qualified name', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const rule: import('../../../src/plugins/types.js').RuleDefinition = {
        meta: { type: 'problem', severity: 'error', docs: { description: 'scoped rule' } },
        create: () => ({}),
      }
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: '@org/scoped-plugin',
        version: '1.0.0',
        rules: { 'scoped-rule': rule },
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('@org/scoped-plugin')
      const found = manager.getRule('@org/scoped-plugin/scoped-rule')
      expect(found).toBe(rule)
    })

    test('unloadAll removes all loaded plugins', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'p1', version: '1.0.0' })
      registry.register({ name: 'p2', version: '1.0.0' })
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('p1')
      await manager.loadPlugin('p2')
      expect(manager.getAllPlugins()).toHaveLength(2)
      manager.unloadAll()
      expect(manager.getAllPlugins()).toHaveLength(0)
    })

    test('reloadPlugin unloads and reloads', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'reloadable', version: '1.0.0' })
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('reloadable')
      expect(manager.isLoaded('reloadable')).toBe(true)
      const reloaded = await manager.reloadPlugin('reloadable')
      expect(reloaded.name).toBe('reloadable')
      expect(manager.isLoaded('reloadable')).toBe(true)
    })

    test('getPluginConfig returns config after load', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'config-test', version: '1.0.0' })
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      const config: import('../../../src/plugins/types.js').PluginConfig = {
        options: { debug: true },
        rules: { strict: 'error' },
        transforms: [],
      }
      await manager.loadPlugin('config-test', { config })
      expect(manager.getPluginConfig('config-test')).toBe(config)
    })

    test('setPluginConfig updates config for loaded plugin', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'config-update', version: '1.0.0' })
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('config-update')
      const newConfig = { options: { level: 3 }, rules: {}, transforms: [] }
      manager.setPluginConfig('config-update', newConfig)
      expect(manager.getPluginConfig('config-update')).toBe(newConfig)
    })

    test('setPluginConfig throws for unloaded plugin', async () => {
      const { PluginManager, PluginLoadError, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        logger: createSilentLogger(),
      })
      expect(() =>
        manager.setPluginConfig('missing', { options: {}, rules: {}, transforms: [] }),
      ).toThrow(PluginLoadError)
    })

    test('loadPlugin executes onLoad hook', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      let hookCalled = false
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'hook-plugin',
        version: '1.0.0',
        hooks: {
          onLoad: () => {
            hookCalled = true
          },
        },
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('hook-plugin')
      expect(hookCalled).toBe(true)
    })

    test('loadPlugin uses default config when none provided', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'default-cfg', version: '1.0.0' })
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('default-cfg')
      const config = manager.getPluginConfig('default-cfg')
      expect(config).toBeDefined()
      expect(config!.options).toEqual({})
      expect(config!.rules).toEqual({})
      expect(config!.transforms).toEqual([])
    })

    test('loadPlugin with plugin containing rules loads successfully', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'rules-loaded',
        version: '1.0.0',
        rules: {
          'good-rule': {
            meta: { type: 'problem', severity: 'error', docs: { description: 'test' } },
            create: () => ({}),
          },
        },
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('rules-loaded')
      expect(manager.isLoaded('rules-loaded')).toBe(true)
      expect(manager.getRules()['rules-loaded/good-rule']).toBeDefined()
    })

    test('executeHook runs hook on all loaded plugins', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const called: string[] = []
      const p1: import('../../../src/plugins/types.js').Plugin = {
        name: 'hook-a',
        version: '1.0.0',
        hooks: {
          beforeCheck: () => {
            called.push('a')
          },
        },
      }
      const p2: import('../../../src/plugins/types.js').Plugin = {
        name: 'hook-b',
        version: '1.0.0',
        hooks: {
          beforeCheck: () => {
            called.push('b')
          },
        },
      }
      registry.register(p1)
      registry.register(p2)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('hook-a')
      await manager.loadPlugin('hook-b')
      await manager.executeHook('beforeCheck')
      expect(called).toEqual(expect.arrayContaining(['a', 'b']))
    })

    test('executeHook on single plugin runs only that plugin', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const called: string[] = []
      const p1: import('../../../src/plugins/types.js').Plugin = {
        name: 'single-a',
        version: '1.0.0',
        hooks: {
          afterCheck: () => {
            called.push('a')
          },
        },
      }
      const p2: import('../../../src/plugins/types.js').Plugin = {
        name: 'single-b',
        version: '1.0.0',
        hooks: {
          afterCheck: () => {
            called.push('b')
          },
        },
      }
      registry.register(p1)
      registry.register(p2)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('single-a')
      await manager.loadPlugin('single-b')
      await manager.executeHook(p1, 'afterCheck')
      expect(called).toEqual(['a'])
    })
  })

  describe('Severity type variations', () => {
    test('Severity can be "off"', () => {
      const severity: import('../../../src/plugins/types.js').Severity = 'off'
      expect(severity).toBe('off')
    })

    test('Severity can be "warn"', () => {
      const severity: import('../../../src/plugins/types.js').Severity = 'warn'
      expect(severity).toBe('warn')
    })

    test('Severity can be "error"', () => {
      const severity: import('../../../src/plugins/types.js').Severity = 'error'
      expect(severity).toBe('error')
    })
  })

  describe('RuleType variations', () => {
    test('RuleType can be "problem"', () => {
      const type: import('../../../src/plugins/types.js').RuleType = 'problem'
      expect(type).toBe('problem')
    })

    test('RuleType can be "suggestion"', () => {
      const type: import('../../../src/plugins/types.js').RuleType = 'suggestion'
      expect(type).toBe('suggestion')
    })

    test('RuleType can be "layout"', () => {
      const type: import('../../../src/plugins/types.js').RuleType = 'layout'
      expect(type).toBe('layout')
    })
  })

  describe('RuleMeta optional fields', () => {
    test('RuleMeta with docs.category', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'problem',
        severity: 'error',
        docs: { description: 'test', category: 'security' },
      }
      expect(meta.docs?.category).toBe('security')
    })

    test('RuleMeta with docs.recommended true', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'problem',
        severity: 'error',
        docs: { description: 'test', recommended: true },
      }
      expect(meta.docs?.recommended).toBe(true)
    })

    test('RuleMeta with docs.url', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'problem',
        severity: 'error',
        docs: { description: 'test', url: 'https://example.com/rule' },
      }
      expect(meta.docs?.url).toBe('https://example.com/rule')
    })

    test('RuleMeta with fixable "code"', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'problem',
        severity: 'error',
        docs: { description: 'test' },
        fixable: 'code',
      }
      expect(meta.fixable).toBe('code')
    })

    test('RuleMeta with fixable "whitespace"', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'problem',
        severity: 'error',
        docs: { description: 'test' },
        fixable: 'whitespace',
      }
      expect(meta.fixable).toBe('whitespace')
    })

    test('RuleMeta with requiresTypeChecking true', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'problem',
        severity: 'error',
        docs: { description: 'test' },
        requiresTypeChecking: true,
      }
      expect(meta.requiresTypeChecking).toBe(true)
    })

    test('RuleMeta with schema as array', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'problem',
        severity: 'error',
        docs: { description: 'test' },
        schema: [{ type: 'string' }],
      }
      expect(Array.isArray(meta.schema)).toBe(true)
    })

    test('RuleMeta with schema as object', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'problem',
        severity: 'error',
        docs: { description: 'test' },
        schema: { type: 'object' },
      }
      expect(typeof meta.schema).toBe('object')
    })

    test('RuleMeta with deprecated true', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'problem',
        severity: 'error',
        docs: { description: 'test' },
        deprecated: true,
      }
      expect(meta.deprecated).toBe(true)
    })

    test('RuleMeta with replacedBy', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'problem',
        severity: 'error',
        docs: { description: 'test' },
        deprecated: true,
        replacedBy: ['new-rule'],
      }
      expect(meta.replacedBy).toEqual(['new-rule'])
    })

    test('RuleMeta without optional fields', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'suggestion',
        severity: 'warn',
        docs: { description: 'minimal' },
      }
      expect(meta.fixable).toBeUndefined()
      expect(meta.requiresTypeChecking).toBeUndefined()
      expect(meta.schema).toBeUndefined()
      expect(meta.deprecated).toBeUndefined()
      expect(meta.replacedBy).toBeUndefined()
    })
  })

  describe('ReportDescriptor with optional fields', () => {
    test('ReportDescriptor with loc', () => {
      const desc: import('../../../src/plugins/types.js').ReportDescriptor = {
        message: 'test',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 2, column: 5 },
        },
      }
      expect(desc.loc?.start.line).toBe(1)
      expect(desc.loc?.end.column).toBe(5)
    })

    test('ReportDescriptor with data', () => {
      const desc: import('../../../src/plugins/types.js').ReportDescriptor = {
        message: 'Unexpected {{type}}',
        data: { type: 'foo' },
      }
      expect(desc.data?.type).toBe('foo')
    })

    test('ReportDescriptor with fix', () => {
      const desc: import('../../../src/plugins/types.js').ReportDescriptor = {
        message: 'fixable issue',
        fix: { range: [0, 5], text: 'fixed' },
      }
      expect(desc.fix?.text).toBe('fixed')
    })

    test('ReportDescriptor with suggest', () => {
      const desc: import('../../../src/plugins/types.js').ReportDescriptor = {
        message: 'suggestion',
        suggest: [{ desc: 'Remove', message: 'Remove it', fix: { range: [0, 1], text: '' } }],
      }
      expect(desc.suggest).toHaveLength(1)
      expect(desc.suggest?.[0].desc).toBe('Remove')
    })

    test('ReportDescriptor with node', () => {
      const node = { type: 'Identifier', name: 'x' }
      const desc: import('../../../src/plugins/types.js').ReportDescriptor = {
        message: 'bad node',
        node,
      }
      expect(desc.node).toBe(node)
    })
  })

  describe('TransformDefinition optional fields', () => {
    test('TransformDefinition with description', () => {
      const td: import('../../../src/plugins/types.js').TransformDefinition = {
        name: 'minify',
        description: 'Minifies code',
        transform: (src) => src,
      }
      expect(td.description).toBe('Minifies code')
    })

    test('TransformDefinition with filePatterns', () => {
      const td: import('../../../src/plugins/types.js').TransformDefinition = {
        name: 'ts-transform',
        transform: (src) => src,
        filePatterns: ['*.ts', '*.tsx'],
      }
      expect(td.filePatterns).toEqual(['*.ts', '*.tsx'])
    })
  })

  describe('Plugin interface optional fields', () => {
    test('Plugin with description', () => {
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'desc-plugin',
        version: '1.0.0',
        description: 'A plugin with description',
      }
      expect(plugin.description).toBe('A plugin with description')
    })

    test('Plugin with dependencies', () => {
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'dep-plugin',
        version: '1.0.0',
        dependencies: ['other-plugin'],
      }
      expect(plugin.dependencies).toEqual(['other-plugin'])
    })

    test('Plugin with engines', () => {
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'eng-plugin',
        version: '1.0.0',
        engines: { codeforge: '>=1.0.0' },
      }
      expect(plugin.engines?.codeforge).toBe('>=1.0.0')
    })

    test('Plugin with transforms', () => {
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'tf-plugin',
        version: '1.0.0',
        transforms: {
          myTransform: { name: 'myTransform', transform: (s) => s },
        },
      }
      expect(plugin.transforms?.myTransform).toBeDefined()
    })

    test('Plugin with hooks', () => {
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'hooks-plugin',
        version: '1.0.0',
        hooks: {
          onLoad: () => {},
          onUnload: () => {},
          beforeCheck: () => {},
          afterCheck: () => {},
          beforeTransform: () => {},
          afterTransform: () => {},
          onError: () => {},
        },
      }
      expect(Object.keys(plugin.hooks ?? {})).toHaveLength(7)
    })
  })

  describe('PluginManifest optional fields', () => {
    test('PluginManifest with description', () => {
      const manifest: import('../../../src/plugins/types.js').PluginManifest = {
        name: 'test',
        version: '1.0.0',
        main: 'index.js',
        description: 'A test plugin',
      }
      expect(manifest.description).toBe('A test plugin')
    })

    test('PluginManifest with peerDependencies', () => {
      const manifest: import('../../../src/plugins/types.js').PluginManifest = {
        name: 'test',
        version: '1.0.0',
        main: 'index.js',
        peerDependencies: { codeforge: '>=1.0.0' },
      }
      expect(manifest.peerDependencies?.codeforge).toBe('>=1.0.0')
    })
  })

  describe('PluginConfig edge cases', () => {
    test('PluginConfig with severity array rules', () => {
      const config: import('../../../src/plugins/types.js').PluginConfig = {
        rules: { 'my-rule': ['error', { max: 5 }] },
        transforms: [],
      }
      expect(config.rules?.['my-rule']).toEqual(['error', { max: 5 }])
    })

    test('PluginConfig with string severity rules', () => {
      const config: import('../../../src/plugins/types.js').PluginConfig = {
        rules: { 'my-rule': 'off' },
        transforms: [],
      }
      expect(config.rules?.['my-rule']).toBe('off')
    })

    test('PluginConfig with options', () => {
      const config: import('../../../src/plugins/types.js').PluginConfig = {
        options: { debug: true, level: 3 },
        rules: {},
        transforms: ['ts-transform'],
      }
      expect(config.options?.debug).toBe(true)
      expect(config.transforms).toEqual(['ts-transform'])
    })
  })

  describe('HookContext data field', () => {
    test('HookContext with data', () => {
      const ctx: import('../../../src/plugins/types.js').HookContext = {
        logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        timestamp: new Date(),
        data: { key: 'value' },
      }
      expect(ctx.data).toEqual({ key: 'value' })
    })
  })

  describe('Error classes with cause', () => {
    test('PluginLoadError stores cause when provided', async () => {
      const { PluginLoadError } = await import('../../../src/plugins/index.js')
      const cause = new Error('fs error')
      const error = new PluginLoadError('test', 'load failed', cause)
      expect(error.cause).toBe(cause)
    })

    test('RuleExecutionError stores cause when provided', async () => {
      const { RuleExecutionError } = await import('../../../src/plugins/index.js')
      const cause = new Error('runtime error')
      const error = new RuleExecutionError('p', 'rule', 'msg', cause)
      expect(error.cause).toBe(cause)
    })

    test('TransformExecutionError stores cause when provided', async () => {
      const { TransformExecutionError } = await import('../../../src/plugins/index.js')
      const cause = new Error('transform error')
      const error = new TransformExecutionError('p', 'transform', 'msg', cause)
      expect(error.cause).toBe(cause)
    })

    test('HookExecutionError stores cause when provided', async () => {
      const { HookExecutionError } = await import('../../../src/plugins/index.js')
      const cause = new Error('hook error')
      const error = new HookExecutionError('p', 'hook', 'msg', cause)
      expect(error.cause).toBe(cause)
    })

    test('PluginError message format with special characters', async () => {
      const { PluginError } = await import('../../../src/plugins/index.js')
      const error = new PluginError('p@scope', 'message with "quotes"', 'CODE')
      expect(error.message).toBe('[p@scope] message with "quotes"')
    })

    test('RuleExecutionError message includes rule name in quotes', async () => {
      const { RuleExecutionError } = await import('../../../src/plugins/index.js')
      const error = new RuleExecutionError('p', 'my-rule', 'failed badly')
      expect(error.message).toContain('"my-rule"')
    })

    test('TransformExecutionError message includes transform name in quotes', async () => {
      const { TransformExecutionError } = await import('../../../src/plugins/index.js')
      const error = new TransformExecutionError('p', 'minify', 'crashed')
      expect(error.message).toContain('"minify"')
    })

    test('HookExecutionError message includes hook name in quotes', async () => {
      const { HookExecutionError } = await import('../../../src/plugins/index.js')
      const error = new HookExecutionError('p', 'beforeCheck', 'timeout')
      expect(error.message).toContain('"beforeCheck"')
    })

    test('PluginError stack is non-empty', async () => {
      const { PluginError } = await import('../../../src/plugins/index.js')
      const error = new PluginError('p', 'msg', 'CODE')
      expect(error.stack).toBeTruthy()
      expect(error.stack!.length).toBeGreaterThan(0)
    })

    test('PluginError toString includes name', async () => {
      const { PluginError } = await import('../../../src/plugins/index.js')
      const error = new PluginError('p', 'msg', 'CODE')
      expect(error.toString()).toContain('PluginError')
    })
  })

  describe('createDefaultLogger logging behavior', () => {
    test('createDefaultLogger debug does not throw', async () => {
      const { createDefaultLogger } = await import('../../../src/plugins/index.js')
      const logger = createDefaultLogger()
      expect(() => logger.debug('test-debug', 'arg')).not.toThrow()
    })

    test('createDefaultLogger info does not throw', async () => {
      const { createDefaultLogger } = await import('../../../src/plugins/index.js')
      const logger = createDefaultLogger()
      expect(() => logger.info('test-info', 'arg')).not.toThrow()
    })

    test('createDefaultLogger warn logs to console.warn', async () => {
      const { createDefaultLogger } = await import('../../../src/plugins/index.js')
      const original = console.warn
      const messages: string[] = []
      console.warn = (...args: unknown[]) => messages.push(String(args[0]))
      try {
        const logger = createDefaultLogger()
        logger.warn('test-warn')
        expect(messages.length).toBeGreaterThan(0)
      } finally {
        console.warn = original
      }
    })

    test('createDefaultLogger error logs to console.error', async () => {
      const { createDefaultLogger } = await import('../../../src/plugins/index.js')
      const original = console.error
      const messages: string[] = []
      console.error = (...args: unknown[]) => messages.push(String(args[0]))
      try {
        const logger = createDefaultLogger()
        logger.error('test-error')
        expect(messages.length).toBeGreaterThan(0)
      } finally {
        console.error = original
      }
    })
  })

  describe('createSilentLogger does not throw', () => {
    test('silent logger debug does not throw', async () => {
      const { createSilentLogger } = await import('../../../src/plugins/index.js')
      const logger = createSilentLogger()
      expect(() => logger.debug('msg', 'arg1', 'arg2')).not.toThrow()
    })

    test('silent logger info does not throw', async () => {
      const { createSilentLogger } = await import('../../../src/plugins/index.js')
      const logger = createSilentLogger()
      expect(() => logger.info('msg')).not.toThrow()
    })

    test('silent logger warn does not throw', async () => {
      const { createSilentLogger } = await import('../../../src/plugins/index.js')
      const logger = createSilentLogger()
      expect(() => logger.warn('msg')).not.toThrow()
    })

    test('silent logger error does not throw', async () => {
      const { createSilentLogger } = await import('../../../src/plugins/index.js')
      const logger = createSilentLogger()
      expect(() => logger.error('msg')).not.toThrow()
    })
  })

  describe('RuleContext with parserServices', () => {
    test('createRuleContext preserves parserServices', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const parserServices = {
        program: {},
        esTreeNodeToTSNodeMap: new Map(),
        tsNodeToESTreeNodeMap: new Map(),
      }
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments: [],
        parserServices,
      })
      expect(context.parserServices).toBe(parserServices)
    })

    test('createRuleContext works without parserServices', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments: [],
      })
      expect(context.parserServices).toBeUndefined()
    })
  })

  describe('RuleContext report with complex descriptors', () => {
    test('report with loc', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments: [],
      })
      context.report({
        message: 'loc issue',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(context.collector.reports[0].loc?.start.line).toBe(1)
    })

    test('report with fix', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments: [],
      })
      context.report({
        message: 'fixable',
        fix: { range: [0, 5], text: 'hello' },
      })
      expect(context.collector.reports[0].fix?.text).toBe('hello')
    })

    test('report with suggestions', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments: [],
      })
      context.report({
        message: 'suggested',
        suggest: [{ desc: 'fix', message: 'fix it', fix: { range: [0, 1], text: '' } }],
      })
      expect(context.collector.reports[0].suggest).toHaveLength(1)
    })

    test('report with data', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments: [],
      })
      context.report({
        message: '{{name}} issue',
        data: { name: 'test' },
      })
      expect(context.collector.reports[0].data).toEqual({ name: 'test' })
    })

    test('collector clear allows re-reporting', async () => {
      const { createRuleContext, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const context = createRuleContext({
        logger: createSilentLogger(),
        config: {},
        workspaceRoot: '/root',
        source: '',
        filePath: '/test.ts',
        ast: {},
        tokens: [],
        comments: [],
      })
      context.report({ message: 'first' })
      context.collector.clear()
      context.report({ message: 'second' })
      expect(context.collector.reports).toHaveLength(1)
      expect(context.collector.reports[0].message).toBe('second')
    })
  })

  describe('isPluginName additional edge cases', () => {
    test('returns false for name that partially matches prefix', async () => {
      const { isPluginName } = await import('../../../src/plugins/index.js')
      expect(isPluginName('codeforge-plug')).toBe(false)
    })

    test('returns false for prefix without suffix', async () => {
      const { isPluginName } = await import('../../../src/plugins/index.js')
      expect(isPluginName('codeforge-plugin-')).toBe(true)
    })

    test('returns true for long plugin name', async () => {
      const { isPluginName } = await import('../../../src/plugins/index.js')
      expect(isPluginName('codeforge-plugin-very-long-name-with-many-parts')).toBe(true)
    })

    test('returns false for scoped name without plugin in basename', async () => {
      const { isPluginName } = await import('../../../src/plugins/index.js')
      expect(isPluginName('@scope/other')).toBe(false)
    })

    test('returns false for whitespace-only string', async () => {
      const { isPluginName } = await import('../../../src/plugins/index.js')
      expect(isPluginName('   ')).toBe(false)
    })
  })

  describe('parsePluginName additional edge cases', () => {
    test('parses plain name without scope', async () => {
      const { parsePluginName } = await import('../../../src/plugins/index.js')
      const result = parsePluginName('my-plugin')
      expect(result.scope).toBeNull()
      expect(result.name).toBe('my-plugin')
    })

    test('parses @scope/codeforge-plugin-test correctly', async () => {
      const { parsePluginName } = await import('../../../src/plugins/index.js')
      const result = parsePluginName('@myorg/codeforge-plugin-test')
      expect(result.scope).toBe('@myorg')
      expect(result.name).toBe('codeforge-plugin-test')
    })
  })

  describe('PluginRegistry register additional edge cases', () => {
    test('register plugin with empty string name throws', async () => {
      const { PluginRegistry, PluginLoadError } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      expect(() =>
        registry.register({
          name: '',
          version: '1.0.0',
        } as import('../../../src/plugins/types.js').Plugin),
      ).toThrow(PluginLoadError)
    })

    test('register plugin with empty string version throws', async () => {
      const { PluginRegistry, PluginLoadError } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      expect(() =>
        registry.register({
          name: 'test',
          version: '',
        } as import('../../../src/plugins/types.js').Plugin),
      ).toThrow(PluginLoadError)
    })

    test('register multiple different plugins increases size', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'a', version: '1.0.0' })
      registry.register({ name: 'b', version: '2.0.0' })
      registry.register({ name: 'c', version: '3.0.0' })
      expect(registry.size).toBe(3)
    })

    test('getAll returns empty array after clear', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'x', version: '1.0.0' })
      registry.clear()
      expect(registry.getAll()).toEqual([])
    })

    test('getNames returns empty array after clear', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'y', version: '1.0.0' })
      registry.clear()
      expect(registry.getNames()).toEqual([])
    })

    test('get returns correct plugin after multiple registrations', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const p1: import('../../../src/plugins/types.js').Plugin = { name: 'first', version: '1.0.0' }
      const p2: import('../../../src/plugins/types.js').Plugin = {
        name: 'second',
        version: '2.0.0',
      }
      registry.register(p1)
      registry.register(p2)
      expect(registry.get('first')).toBe(p1)
      expect(registry.get('second')).toBe(p2)
    })
  })

  describe('PluginManager validatePlugin edge cases', () => {
    test('loadPlugin throws for plugin with rule missing meta', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger, PluginLoadError } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin = {
        name: 'bad-rule-plugin',
        version: '1.0.0',
        rules: {
          'bad-rule': { create: () => ({}) },
        },
      } as unknown as import('../../../src/plugins/types.js').Plugin
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await expect(manager.loadPlugin('bad-rule-plugin')).rejects.toThrow(PluginLoadError)
    })

    test('loadPlugin throws for plugin with rule missing create', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger, PluginLoadError } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin = {
        name: 'no-create-plugin',
        version: '1.0.0',
        rules: {
          'no-create-rule': {
            meta: { type: 'problem', severity: 'error', docs: { description: 't' } },
          },
        },
      } as unknown as import('../../../src/plugins/types.js').Plugin
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await expect(manager.loadPlugin('no-create-plugin')).rejects.toThrow(PluginLoadError)
    })

    test('loadPlugin throws for plugin with transform missing transform fn', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger, PluginLoadError } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin = {
        name: 'bad-transform-plugin',
        version: '1.0.0',
        transforms: {
          'bad-tf': { name: 'bad-tf' },
        },
      } as unknown as import('../../../src/plugins/types.js').Plugin
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await expect(manager.loadPlugin('bad-transform-plugin')).rejects.toThrow(PluginLoadError)
    })
  })

  describe('PluginManager getRule parseQualifiedName edge cases', () => {
    test('getRule returns undefined for single-part name', async () => {
      const { PluginManager, createSilentLogger } = await import('../../../src/plugins/index.js')
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        logger: createSilentLogger(),
      })
      expect(manager.getRule('nocomplexname')).toBeUndefined()
    })

    test('getRule returns undefined for three-part non-scoped name', async () => {
      const { PluginManager, createSilentLogger } = await import('../../../src/plugins/index.js')
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        logger: createSilentLogger(),
      })
      expect(manager.getRule('a/b/c')).toBeUndefined()
    })

    test('getRule returns undefined for scoped name with missing rule', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: '@org/p',
        version: '1.0.0',
        rules: {
          'existing-rule': {
            meta: { type: 'problem', severity: 'error', docs: { description: 't' } },
            create: () => ({}),
          },
        },
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('@org/p')
      expect(manager.getRule('@org/p/nonexistent')).toBeUndefined()
    })

    test('getRule returns undefined for empty string', async () => {
      const { PluginManager, createSilentLogger } = await import('../../../src/plugins/index.js')
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        logger: createSilentLogger(),
      })
      expect(manager.getRule('')).toBeUndefined()
    })
  })

  describe('PluginManager with transforms', () => {
    test('loadPlugin with valid transforms succeeds', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'tf-valid',
        version: '1.0.0',
        transforms: {
          'my-tf': { name: 'my-tf', transform: (s) => s.toUpperCase() },
        },
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      const loaded = await manager.loadPlugin('tf-valid')
      expect(loaded.transforms?.['my-tf']).toBeDefined()
    })
  })

  describe('PluginManager reloadPlugin with config', () => {
    test('reloadPlugin applies new config', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'reload-cfg', version: '1.0.0' })
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('reload-cfg', {
        config: { options: { a: 1 }, rules: {}, transforms: [] },
      })
      expect(manager.getPluginConfig('reload-cfg')?.options).toEqual({ a: 1 })
      const newConfig = { options: { b: 2 }, rules: {}, transforms: [] }
      await manager.reloadPlugin('reload-cfg', { config: newConfig })
      expect(manager.getPluginConfig('reload-cfg')?.options).toEqual({ b: 2 })
    })
  })

  describe('PluginManager unloadAll with onUnload hooks', () => {
    test('unloadAll calls onUnload for each plugin', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const unloaded: string[] = []
      const p1: import('../../../src/plugins/types.js').Plugin = {
        name: 'u1',
        version: '1.0.0',
        hooks: {
          onUnload: () => {
            unloaded.push('u1')
          },
        },
      }
      const p2: import('../../../src/plugins/types.js').Plugin = {
        name: 'u2',
        version: '1.0.0',
        hooks: {
          onUnload: () => {
            unloaded.push('u2')
          },
        },
      }
      registry.register(p1)
      registry.register(p2)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('u1')
      await manager.loadPlugin('u2')
      manager.unloadAll()
      expect(unloaded).toEqual(expect.arrayContaining(['u1', 'u2']))
      expect(manager.getAllPlugins()).toHaveLength(0)
    })
  })

  describe('PluginManager executeHook with onError', () => {
    test('executeHook onError passes error to hook', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      let receivedError: Error | undefined
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'err-handler',
        version: '1.0.0',
        hooks: {
          onError: (error: Error) => {
            receivedError = error
          },
        },
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('err-handler')
      const testError = new Error('test error data')
      await manager.executeHook('onError', testError)
      expect(receivedError).toBe(testError)
    })

    test('executeHook onError wraps non-Error data', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      let receivedError: Error | undefined
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'err-wrap',
        version: '1.0.0',
        hooks: {
          onError: (error: Error) => {
            receivedError = error
          },
        },
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('err-wrap')
      await manager.executeHook('onError', 'string-error')
      expect(receivedError).toBeInstanceOf(Error)
      expect(receivedError?.message).toBe('string-error')
    })
  })

  describe('PluginManager executeHook error handling', () => {
    test('executeHook continues when one plugin hook throws', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const called: string[] = []
      const p1: import('../../../src/plugins/types.js').Plugin = {
        name: 'thrower',
        version: '1.0.0',
        hooks: {
          beforeCheck: () => {
            throw new Error('boom')
          },
        },
      }
      const p2: import('../../../src/plugins/types.js').Plugin = {
        name: 'nonthrower',
        version: '1.0.0',
        hooks: {
          beforeCheck: () => {
            called.push('ok')
          },
        },
      }
      registry.register(p1)
      registry.register(p2)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('thrower')
      await manager.loadPlugin('nonthrower')
      await manager.executeHook('beforeCheck')
      expect(called).toContain('ok')
    })

    test('executeSingleHook wraps error in HookExecutionError', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger, HookExecutionError } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'hook-thrower',
        version: '1.0.0',
        hooks: {
          beforeTransform: () => {
            throw new Error('hook fail')
          },
        },
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('hook-thrower')
      await expect(manager.executeHook(plugin, 'beforeTransform')).rejects.toThrow(
        HookExecutionError,
      )
    })
  })

  describe('PluginManager plugin without hooks', () => {
    test('executeHook does not throw for plugin with no hooks', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'no-hooks', version: '1.0.0' })
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('no-hooks')
      await expect(manager.executeHook('beforeCheck')).resolves.toBeUndefined()
    })
  })

  describe('PluginManager getPluginConfig edge cases', () => {
    test('getPluginConfig returns undefined for unloaded plugin', async () => {
      const { PluginManager, createSilentLogger } = await import('../../../src/plugins/index.js')
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        logger: createSilentLogger(),
      })
      expect(manager.getPluginConfig('never-loaded')).toBeUndefined()
    })

    test('config is cleared after unload', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      registry.register({ name: 'cfg-clear', version: '1.0.0' })
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await manager.loadPlugin('cfg-clear', {
        config: { options: { x: 1 }, rules: {}, transforms: [] },
      })
      expect(manager.getPluginConfig('cfg-clear')).toBeDefined()
      manager.unloadPlugin('cfg-clear')
      expect(manager.getPluginConfig('cfg-clear')).toBeUndefined()
    })
  })

  describe('PluginManager loadPlugin with onLoad hook error', () => {
    test('loadPlugin throws when onLoad hook throws', async () => {
      const { PluginManager, PluginRegistry, createSilentLogger, PluginLoadError } =
        await import('../../../src/plugins/index.js')
      const registry = new PluginRegistry()
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'bad-onload',
        version: '1.0.0',
        hooks: {
          onLoad: () => {
            throw new Error('onLoad failed')
          },
        },
      }
      registry.register(plugin)
      const manager = new PluginManager({
        workspaceRoot: '/workspace',
        registry,
        logger: createSilentLogger(),
      })
      await expect(manager.loadPlugin('bad-onload')).rejects.toThrow(PluginLoadError)
    })
  })

  describe('RuleVisitor with methods', () => {
    test('RuleVisitor can have string keyed methods', () => {
      const visitor: import('../../../src/plugins/types.js').RuleVisitor = {
        Identifier: (_node: unknown) => {},
        FunctionDeclaration: (_node: unknown) => {},
      }
      expect(typeof visitor.Identifier).toBe('function')
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })
  })

  describe('TransformContext interface completeness', () => {
    test('TransformContext has reportError method', () => {
      let reportedError: Error | undefined
      const ctx: import('../../../src/plugins/types.js').TransformContext = {
        logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        config: {},
        workspaceRoot: '/',
        getSource: () => 'source',
        getFilePath: () => '/file.ts',
        reportError: (e: Error) => {
          reportedError = e
        },
      }
      const err = new Error('test')
      ctx.reportError(err)
      expect(reportedError).toBe(err)
    })
  })
})
