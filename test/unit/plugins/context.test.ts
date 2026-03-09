import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createPluginContext,
  createRuleContext,
  createDefaultLogger,
  createSilentLogger,
  type PluginContextOptions,
  type RuleContextOptions,
} from '../../../src/plugins/context.js';
import type { Logger, PluginConfig } from '../../../src/plugins/types.js';

function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

function createMockConfig(): PluginConfig {
  return {
    options: { testOption: true },
    rules: { 'test-rule': 'error' },
  };
}

describe('createPluginContext', () => {
  let mockLogger: Logger;
  let mockConfig: PluginConfig;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockConfig = createMockConfig();
  });

  describe('creates context with logger', () => {
    test('returns context with provided logger', () => {
      const options: PluginContextOptions = {
        logger: mockLogger,
        config: mockConfig,
        workspaceRoot: '/workspace',
      };

      const context = createPluginContext(options);

      expect(context.logger).toBe(mockLogger);
    });

    test('logger methods are callable from context', () => {
      const options: PluginContextOptions = {
        logger: mockLogger,
        config: mockConfig,
        workspaceRoot: '/workspace',
      };

      const context = createPluginContext(options);
      context.logger.info('test message');

      expect(mockLogger.info).toHaveBeenCalledWith('test message');
    });
  });

  describe('creates context with config', () => {
    test('returns context with provided config', () => {
      const options: PluginContextOptions = {
        logger: mockLogger,
        config: mockConfig,
        workspaceRoot: '/workspace',
      };

      const context = createPluginContext(options);

      expect(context.config).toBe(mockConfig);
    });

    test('config options are accessible from context', () => {
      const configWithRules: PluginConfig = {
        options: { verbose: true },
        rules: { 'rule-a': 'warn', 'rule-b': ['error', { option: 'value' }] },
      };

      const options: PluginContextOptions = {
        logger: mockLogger,
        config: configWithRules,
        workspaceRoot: '/workspace',
      };

      const context = createPluginContext(options);

      expect(context.config.options).toEqual({ verbose: true });
      expect(context.config.rules).toEqual({
        'rule-a': 'warn',
        'rule-b': ['error', { option: 'value' }],
      });
    });

    test('handles empty config', () => {
      const emptyConfig: PluginConfig = {};

      const options: PluginContextOptions = {
        logger: mockLogger,
        config: emptyConfig,
        workspaceRoot: '/workspace',
      };

      const context = createPluginContext(options);

      expect(context.config).toEqual({});
    });
  });

  describe('creates context with workspaceRoot', () => {
    test('returns context with provided workspaceRoot', () => {
      const options: PluginContextOptions = {
        logger: mockLogger,
        config: mockConfig,
        workspaceRoot: '/path/to/workspace',
      };

      const context = createPluginContext(options);

      expect(context.workspaceRoot).toBe('/path/to/workspace');
    });

    test('handles relative paths', () => {
      const options: PluginContextOptions = {
        logger: mockLogger,
        config: mockConfig,
        workspaceRoot: './relative/path',
      };

      const context = createPluginContext(options);

      expect(context.workspaceRoot).toBe('./relative/path');
    });

    test('handles empty string workspaceRoot', () => {
      const options: PluginContextOptions = {
        logger: mockLogger,
        config: mockConfig,
        workspaceRoot: '',
      };

      const context = createPluginContext(options);

      expect(context.workspaceRoot).toBe('');
    });
  });
});

describe('createRuleContext', () => {
  let mockLogger: Logger;
  let mockConfig: PluginConfig;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockConfig = createMockConfig();
  });

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
    };
  }

  describe('creates context with file path', () => {
    test('returns context with correct filePath', () => {
      const options = createDefaultRuleOptions();
      const context = createRuleContext(options);

      expect(context.getFilePath()).toBe('/workspace/file.ts');
    });

    test('getFilePath returns string', () => {
      const options = createDefaultRuleOptions();
      const context = createRuleContext(options);

      expect(typeof context.getFilePath()).toBe('string');
    });
  });

  describe('creates context with source file', () => {
    test('returns context with correct source', () => {
      const options = createDefaultRuleOptions();
      const context = createRuleContext(options);

      expect(context.getSource()).toBe('const x = 1;');
    });

    test('getSource returns string', () => {
      const options = createDefaultRuleOptions();
      const context = createRuleContext(options);

      expect(typeof context.getSource()).toBe('string');
    });

    test('handles empty source', () => {
      const options: RuleContextOptions = {
        ...createDefaultRuleOptions(),
        source: '',
      };

      const context = createRuleContext(options);

      expect(context.getSource()).toBe('');
    });
  });

  describe('provides violation tracking', () => {
    test('report adds violation to collector', () => {
      const options = createDefaultRuleOptions();
      const context = createRuleContext(options);

      context.report({ message: 'Test violation' });

      expect(context.collector.reports).toHaveLength(1);
      expect(context.collector.reports[0].message).toBe('Test violation');
    });

    test('report tracks multiple violations', () => {
      const options = createDefaultRuleOptions();
      const context = createRuleContext(options);

      context.report({ message: 'First violation' });
      context.report({ message: 'Second violation' });
      context.report({ message: 'Third violation' });

      expect(context.collector.reports).toHaveLength(3);
    });

    test('report throws on invalid message', () => {
      const options = createDefaultRuleOptions();
      const context = createRuleContext(options);

      expect(() => context.report({ message: '' })).toThrow(TypeError);
    });

    test('report throws on non-string message', () => {
      const options = createDefaultRuleOptions();
      const context = createRuleContext(options);

      // @ts-expect-error Testing invalid input
      expect(() => context.report({ message: null })).toThrow(TypeError);
    });

    test('clear removes all violations', () => {
      const options = createDefaultRuleOptions();
      const context = createRuleContext(options);

      context.report({ message: 'Test violation' });
      context.report({ message: 'Another violation' });
      expect(context.collector.reports).toHaveLength(2);

      context.collector.clear();

      expect(context.collector.reports).toHaveLength(0);
    });

    test('report preserves location data', () => {
      const options = createDefaultRuleOptions();
      const context = createRuleContext(options);

      context.report({
        message: 'Test violation',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      });

      expect(context.collector.reports[0].loc).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 10 },
      });
    });
  });

  describe('provides AST access', () => {
    test('getAST returns provided AST', () => {
      const ast = { type: 'Program', body: [] };
      const options: RuleContextOptions = {
        ...createDefaultRuleOptions(),
        ast,
      };

      const context = createRuleContext(options);

      expect(context.getAST()).toBe(ast);
    });

    test('getTokens returns provided tokens', () => {
      const tokens = [{ type: 'Keyword', value: 'const' }];
      const options: RuleContextOptions = {
        ...createDefaultRuleOptions(),
        tokens,
      };

      const context = createRuleContext(options);

      expect(context.getTokens()).toBe(tokens);
    });

    test('getComments returns provided comments', () => {
      const comments = [{ type: 'Line', value: 'comment' }];
      const options: RuleContextOptions = {
        ...createDefaultRuleOptions(),
        comments,
      };

      const context = createRuleContext(options);

      expect(context.getComments()).toBe(comments);
    });
  });

  describe('parserServices', () => {
    test('includes parserServices when provided', () => {
      const parserServices = {
        program: {},
        esTreeNodeToTSNodeMap: new Map(),
        tsNodeToESTreeNodeMap: new Map(),
      };

      const options: RuleContextOptions = {
        ...createDefaultRuleOptions(),
        parserServices,
      };

      const context = createRuleContext(options);

      expect(context.parserServices).toBe(parserServices);
    });

    test('handles undefined parserServices', () => {
      const options = createDefaultRuleOptions();
      const context = createRuleContext(options);

      expect(context.parserServices).toBeUndefined();
    });
  });
});

describe('createDefaultLogger', () => {
  let consoleSpies: {
    debug: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpies = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    Object.values(consoleSpies).forEach((spy) => spy.mockRestore());
  });

  describe('logs to console', () => {
    test('debug logs with [DEBUG] prefix', () => {
      const logger = createDefaultLogger();
      logger.debug('test message');

      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] test message');
    });

    test('info logs with [INFO] prefix', () => {
      const logger = createDefaultLogger();
      logger.info('info message');

      expect(consoleSpies.info).toHaveBeenCalledWith('[INFO] info message');
    });

    test('warn logs with [WARN] prefix', () => {
      const logger = createDefaultLogger();
      logger.warn('warning message');

      expect(consoleSpies.warn).toHaveBeenCalledWith('[WARN] warning message');
    });

    test('error logs with [ERROR] prefix', () => {
      const logger = createDefaultLogger();
      logger.error('error message');

      expect(consoleSpies.error).toHaveBeenCalledWith('[ERROR] error message');
    });

    test('passes additional arguments to console methods', () => {
      const logger = createDefaultLogger();
      const extraArg = { key: 'value' };

      logger.info('message', extraArg, 123);

      expect(consoleSpies.info).toHaveBeenCalledWith('[INFO] message', extraArg, 123);
    });

    test('handles multiple additional arguments', () => {
      const logger = createDefaultLogger();

      logger.debug('msg', 'arg1', 'arg2', 'arg3');

      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] msg', 'arg1', 'arg2', 'arg3');
    });
  });

  describe('logger interface', () => {
    test('returns object with all required methods', () => {
      const logger = createDefaultLogger();

      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');

      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });
});

describe('createSilentLogger', () => {
  describe('suppresses all output', () => {
    test('debug does not throw', () => {
      const logger = createSilentLogger();

      expect(() => logger.debug('message')).not.toThrow();
    });

    test('info does not throw', () => {
      const logger = createSilentLogger();

      expect(() => logger.info('message')).not.toThrow();
    });

    test('warn does not throw', () => {
      const logger = createSilentLogger();

      expect(() => logger.warn('message')).not.toThrow();
    });

    test('error does not throw', () => {
      const logger = createSilentLogger();

      expect(() => logger.error('message')).not.toThrow();
    });

    test('returns object with all required methods', () => {
      const logger = createSilentLogger();

      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
    });

    test('all methods return undefined', () => {
      const logger = createSilentLogger();

      expect(logger.debug('test')).toBeUndefined();
      expect(logger.info('test')).toBeUndefined();
      expect(logger.warn('test')).toBeUndefined();
      expect(logger.error('test')).toBeUndefined();
    });
  });
});

describe('context immutability', () => {
  test('plugin context properties are accessible', () => {
    const mockLogger = createMockLogger();
    const options: PluginContextOptions = {
      logger: mockLogger,
      config: { rules: { 'test': 'error' } },
      workspaceRoot: '/workspace',
    };

    const context = createPluginContext(options);

    expect(context.logger).toBeDefined();
    expect(context.config).toBeDefined();
    expect(context.workspaceRoot).toBeDefined();
  });

  test('rule context properties are accessible', () => {
    const mockLogger = createMockLogger();
    const options: RuleContextOptions = {
      logger: mockLogger,
      config: {},
      workspaceRoot: '/workspace',
      source: 'code',
      filePath: '/file.ts',
      ast: {},
      tokens: [],
      comments: [],
    };

    const context = createRuleContext(options);

    expect(context.logger).toBeDefined();
    expect(context.config).toBeDefined();
    expect(context.workspaceRoot).toBeDefined();
    expect(context.report).toBeDefined();
    expect(context.getSource).toBeDefined();
    expect(context.getFilePath).toBeDefined();
    expect(context.getAST).toBeDefined();
    expect(context.getTokens).toBeDefined();
    expect(context.getComments).toBeDefined();
    expect(context.collector).toBeDefined();
  });
});
