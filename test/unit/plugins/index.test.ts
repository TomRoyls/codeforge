import { describe, test, expect } from 'vitest';

describe('plugins/index', () => {
  describe('exports types from types.js', () => {
    test('exports Severity type', () => {
      const severity: import('../../../src/plugins/types.js').Severity = 'error';
      expect(severity).toBe('error');
    });

    test('exports RuleType type', () => {
      const ruleType: import('../../../src/plugins/types.js').RuleType = 'problem';
      expect(ruleType).toBe('problem');
    });

    test('exports RuleSchema type', () => {
      const schema: import('../../../src/plugins/types.js').RuleSchema = [];
      expect(Array.isArray(schema)).toBe(true);
    });

    test('exports RuleMeta interface', () => {
      const meta: import('../../../src/plugins/types.js').RuleMeta = {
        type: 'problem',
        severity: 'error',
        docs: { description: 'test' },
      };
      expect(meta.type).toBe('problem');
      expect(meta.severity).toBe('error');
    });

    test('exports Position interface', () => {
      const pos: import('../../../src/plugins/types.js').Position = { line: 1, column: 0 };
      expect(pos.line).toBe(1);
      expect(pos.column).toBe(0);
    });

    test('exports Range type', () => {
      const range: import('../../../src/plugins/types.js').Range = [0, 10];
      expect(range).toHaveLength(2);
      expect(range[0]).toBe(0);
      expect(range[1]).toBe(10);
    });

    test('exports SourceLocation interface', () => {
      const loc: import('../../../src/plugins/types.js').SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 10 },
      };
      expect(loc.start.line).toBe(1);
      expect(loc.end.column).toBe(10);
    });

    test('exports ReportDescriptor interface', () => {
      const descriptor: import('../../../src/plugins/types.js').ReportDescriptor = {
        message: 'test',
      };
      expect(descriptor.message).toBe('test');
    });

    test('exports FixDescriptor interface', () => {
      const fix: import('../../../src/plugins/types.js').FixDescriptor = {
        range: [0, 10],
        text: 'replacement',
      };
      expect(fix.text).toBe('replacement');
    });

    test('exports SuggestionDescriptor interface', () => {
      const suggestion: import('../../../src/plugins/types.js').SuggestionDescriptor = {
        desc: 'description',
        message: 'message',
        fix: { range: [0, 10], text: 'replacement' },
      };
      expect(suggestion.desc).toBe('description');
    });

    test('exports RuleVisitor type', () => {
      const visitor: import('../../../src/plugins/types.js').RuleVisitor = {};
      expect(typeof visitor).toBe('object');
    });

    test('exports RuleDefinition interface', () => {
      const definition: import('../../../src/plugins/types.js').RuleDefinition = {
        meta: {
          type: 'problem',
          severity: 'error',
          docs: { description: 'test' },
        },
        create: () => ({}),
      };
      expect(definition.meta.type).toBe('problem');
    });

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
      };
      expect(transformCtx.workspaceRoot).toBe('/');
    });

    test('exports TransformFunction type', () => {
      const transformFn: import('../../../src/plugins/types.js').TransformFunction = (
        source,
        _context
      ) => source;
      expect(typeof transformFn).toBe('function');
    });

    test('exports TransformDefinition interface', () => {
      const transformDef: import('../../../src/plugins/types.js').TransformDefinition = {
        name: 'test-transform',
        transform: (source) => source,
      };
      expect(transformDef.name).toBe('test-transform');
    });

    test('exports HookContext interface', () => {
      const hookCtx: import('../../../src/plugins/types.js').HookContext = {
        logger: {
          debug: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
        },
        timestamp: new Date(),
      };
      expect(hookCtx.timestamp).toBeInstanceOf(Date);
    });

    test('exports PluginHooks interface', () => {
      const hooks: import('../../../src/plugins/types.js').PluginHooks = {};
      expect(typeof hooks).toBe('object');
    });

    test('exports Logger interface', () => {
      const logger: import('../../../src/plugins/types.js').Logger = {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      };
      expect(typeof logger.debug).toBe('function');
    });

    test('exports PluginConfig interface', () => {
      const config: import('../../../src/plugins/types.js').PluginConfig = {
        options: {},
        rules: {},
        transforms: [],
      };
      expect(Array.isArray(config.transforms)).toBe(true);
    });

    test('exports Plugin interface', () => {
      const plugin: import('../../../src/plugins/types.js').Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
      };
      expect(plugin.name).toBe('test-plugin');
      expect(plugin.version).toBe('1.0.0');
    });

    test('exports PluginManifest interface', () => {
      const manifest: import('../../../src/plugins/types.js').PluginManifest = {
        name: 'test-plugin',
        version: '1.0.0',
        main: 'index.js',
      };
      expect(manifest.name).toBe('test-plugin');
      expect(manifest.main).toBe('index.js');
    });

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
      };
      expect(pluginCtx.workspaceRoot).toBe('/');
    });

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
      };
      expect(ruleCtx.workspaceRoot).toBe('/');
    });
  });

  describe('exports error classes from types.js', () => {
    test('exports PluginError class', async () => {
      const { PluginError } = await import('../../../src/plugins/index.js');
      const error = new PluginError('test-plugin', 'test error', 'TEST_CODE');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('PluginError');
      expect(error.pluginName).toBe('test-plugin');
      expect(error.code).toBe('TEST_CODE');
    });

    test('exports PluginLoadError class', async () => {
      const { PluginLoadError, PluginError } = await import('../../../src/plugins/index.js');
      const error = new PluginLoadError('test-plugin', 'load failed');
      expect(error).toBeInstanceOf(PluginError);
      expect(error.name).toBe('PluginLoadError');
      expect(error.code).toBe('PLUGIN_LOAD_ERROR');
    });

    test('exports RuleExecutionError class', async () => {
      const { RuleExecutionError, PluginError } = await import('../../../src/plugins/index.js');
      const error = new RuleExecutionError('test-plugin', 'test-rule', 'rule failed');
      expect(error).toBeInstanceOf(PluginError);
      expect(error.name).toBe('RuleExecutionError');
      expect(error.ruleName).toBe('test-rule');
      expect(error.code).toBe('RULE_EXECUTION_ERROR');
    });

    test('exports TransformExecutionError class', async () => {
      const { TransformExecutionError, PluginError } = await import('../../../src/plugins/index.js');
      const error = new TransformExecutionError(
        'test-plugin',
        'test-transform',
        'transform failed'
      );
      expect(error).toBeInstanceOf(PluginError);
      expect(error.name).toBe('TransformExecutionError');
      expect(error.transformName).toBe('test-transform');
      expect(error.code).toBe('TRANSFORM_EXECUTION_ERROR');
    });

    test('exports HookExecutionError class', async () => {
      const { HookExecutionError, PluginError } = await import('../../../src/plugins/index.js');
      const error = new HookExecutionError('test-plugin', 'test-hook', 'hook failed');
      expect(error).toBeInstanceOf(PluginError);
      expect(error.name).toBe('HookExecutionError');
      expect(error.hookName).toBe('test-hook');
      expect(error.code).toBe('HOOK_EXECUTION_ERROR');
    });
  });

  describe('exports context functions from context.js', () => {
    test('exports createPluginContext function', async () => {
      const { createPluginContext } = await import('../../../src/plugins/index.js');
      expect(typeof createPluginContext).toBe('function');
    });

    test('exports createRuleContext function', async () => {
      const { createRuleContext } = await import('../../../src/plugins/index.js');
      expect(typeof createRuleContext).toBe('function');
    });

    test('exports createDefaultLogger function', async () => {
      const { createDefaultLogger } = await import('../../../src/plugins/index.js');
      expect(typeof createDefaultLogger).toBe('function');
    });

    test('exports createSilentLogger function', async () => {
      const { createSilentLogger } = await import('../../../src/plugins/index.js');
      expect(typeof createSilentLogger).toBe('function');
    });

    test('createPluginContext works', async () => {
      const { createPluginContext, createDefaultLogger } = await import('../../../src/plugins/index.js');
      const context = createPluginContext({
        logger: createDefaultLogger(),
        config: {},
        workspaceRoot: '/workspace',
      });
      expect(context.workspaceRoot).toBe('/workspace');
    });

    test('createDefaultLogger works', async () => {
      const { createDefaultLogger } = await import('../../../src/plugins/index.js');
      const logger = createDefaultLogger();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    test('createSilentLogger works', async () => {
      const { createSilentLogger } = await import('../../../src/plugins/index.js');
      const logger = createSilentLogger();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('exports registry utilities from registry.js', () => {
    test('exports PluginRegistry class', async () => {
      const { PluginRegistry } = await import('../../../src/plugins/index.js');
      const registry = new PluginRegistry();
      expect(registry).toBeInstanceOf(PluginRegistry);
      expect(registry.size).toBe(0);
    });

    test('exports isPluginName function', async () => {
      const { isPluginName } = await import('../../../src/plugins/index.js');
      expect(typeof isPluginName).toBe('function');
      expect(isPluginName('codeforge-plugin-test')).toBe(true);
      expect(isPluginName('random-package')).toBe(false);
    });

    test('exports parsePluginName function', async () => {
      const { parsePluginName } = await import('../../../src/plugins/index.js');
      expect(typeof parsePluginName).toBe('function');
      const result = parsePluginName('codeforge-plugin-test');
      expect(result.scope).toBeNull();
      expect(result.name).toBe('codeforge-plugin-test');
    });

    test('exports PLUGIN_PATTERNS constant', async () => {
      const { PLUGIN_PATTERNS } = await import('../../../src/plugins/index.js');
      expect(PLUGIN_PATTERNS).toBeDefined();
      expect(PLUGIN_PATTERNS.prefix).toBe('codeforge-plugin-');
      expect(PLUGIN_PATTERNS.scoped).toBeInstanceOf(RegExp);
    });
  });

  describe('exports PluginManager from manager.js', () => {
    test('exports PluginManager class', async () => {
      const { PluginManager } = await import('../../../src/plugins/index.js');
      const manager = new PluginManager({ workspaceRoot: '/workspace' });
      expect(manager).toBeInstanceOf(PluginManager);
      expect(manager.getWorkspaceRoot()).toBe('/workspace');
    });
  });

  describe('all exports are available together', () => {
    test('can import all exports at once', async () => {
      const exports = await import('../../../src/plugins/index.js');

      expect(exports).toBeDefined();

      expect(exports.PluginManager).toBeInstanceOf(Function);
      expect(exports.PluginRegistry).toBeInstanceOf(Function);
      expect(exports.PluginError).toBeInstanceOf(Function);
      expect(exports.PluginLoadError).toBeInstanceOf(Function);
      expect(exports.RuleExecutionError).toBeInstanceOf(Function);
      expect(exports.TransformExecutionError).toBeInstanceOf(Function);
      expect(exports.HookExecutionError).toBeInstanceOf(Function);

      expect(typeof exports.createPluginContext).toBe('function');
      expect(typeof exports.createRuleContext).toBe('function');
      expect(typeof exports.createDefaultLogger).toBe('function');
      expect(typeof exports.createSilentLogger).toBe('function');
      expect(typeof exports.isPluginName).toBe('function');
      expect(typeof exports.parsePluginName).toBe('function');

      expect(exports.PLUGIN_PATTERNS).toBeDefined();
    });
  });

  describe('exports maintain type safety', () => {
    test('error classes extend Error', async () => {
      const {
        PluginError,
        PluginLoadError,
        RuleExecutionError,
        TransformExecutionError,
        HookExecutionError,
      } = await import('../../../src/plugins/index.js');

      const pluginError = new PluginError('test', 'message', 'CODE');
      expect(pluginError).toBeInstanceOf(Error);
      expect(pluginError.stack).toBeDefined();

      const loadError = new PluginLoadError('test', 'message');
      expect(loadError).toBeInstanceOf(PluginError);
      expect(loadError).toBeInstanceOf(Error);

      const ruleError = new RuleExecutionError('test', 'rule', 'message');
      expect(ruleError).toBeInstanceOf(PluginError);
      expect(ruleError).toBeInstanceOf(Error);

      const transformError = new TransformExecutionError('test', 'transform', 'message');
      expect(transformError).toBeInstanceOf(PluginError);
      expect(transformError).toBeInstanceOf(Error);

      const hookError = new HookExecutionError('test', 'hook', 'message');
      expect(hookError).toBeInstanceOf(PluginError);
      expect(hookError).toBeInstanceOf(Error);
    });
  });
});
