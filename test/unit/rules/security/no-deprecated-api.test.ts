import { describe, test, expect, beforeEach, vi } from 'vitest';
import { noDeprecatedApiRule } from '../../../../src/rules/security/no-deprecated-api.js';
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js';

interface ReportDescriptor {
  message: string;
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } };
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;'
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = [];

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      });
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext;

  return { context, reports };
}

function createDeprecatedCall(functionName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: functionName },
    arguments: [{ type: 'Literal', value: 'test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  };
}

function createMethodCall(objectName: string, methodName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  };
}

function createNewBuffer(args: unknown[] = [], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Buffer' },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  };
}

function createMemberExpression(objectName: string, propertyName: string, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: objectName },
    property: { type: 'Identifier', name: propertyName },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  };
}

function createSafeCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'safeFunction' },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  };
}

describe('no-deprecated-api rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noDeprecatedApiRule.meta.type).toBe('problem');
    });

    test('should have warn severity', () => {
      expect(noDeprecatedApiRule.meta.severity).toBe('warn');
    });

    test('should be recommended', () => {
      expect(noDeprecatedApiRule.meta.docs?.recommended).toBe(true);
    });

    test('should have correct category', () => {
      expect(noDeprecatedApiRule.meta.docs?.category).toBe('security');
    });

    test('should have schema defined', () => {
      expect(noDeprecatedApiRule.meta.schema).toBeDefined();
    });

    test('should have correct description', () => {
      expect(noDeprecatedApiRule.meta.docs?.description).toContain('deprecated');
    });
  });

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      expect(visitor).toHaveProperty('CallExpression');
      expect(visitor).toHaveProperty('NewExpression');
      expect(visitor).toHaveProperty('MemberExpression');
    });

    test('should report escape() call', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      visitor.CallExpression(createDeprecatedCall('escape'));

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('escape');
      expect(reports[0].message).toContain('deprecated');
    });

    test('should report unescape() call', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      visitor.CallExpression(createDeprecatedCall('unescape'));

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('unescape');
    });

    test('should report date.getYear() call', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      visitor.CallExpression(createMethodCall('date', 'getYear'));

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('getYear');
    });

    test('should report date.setYear() call', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      visitor.CallExpression(createMethodCall('date', 'setYear'));

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('setYear');
    });

    test('should report date.toGMTString() call', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      visitor.CallExpression(createMethodCall('date', 'toGMTString'));

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('toGMTString');
    });

    test('should report new Buffer() expression', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      visitor.NewExpression(createNewBuffer());

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('Buffer');
    });

    test('should report __proto__ access', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      visitor.MemberExpression(createMemberExpression('obj', '__proto__'));

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('__proto__');
    });

    test('should report __defineGetter__ call', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      visitor.MemberExpression(createMemberExpression('obj', '__defineGetter__'));

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('__defineGetter__');
    });

    test('should report __defineSetter__ call', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      visitor.MemberExpression(createMemberExpression('obj', '__defineSetter__'));

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('__defineSetter__');
    });

    test('should not report safe calls', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      visitor.CallExpression(createSafeCall());

      expect(reports.length).toBe(0);
    });

    test('should suggest replacement in message', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      visitor.CallExpression(createDeprecatedCall('escape'));

      expect(reports[0].message).toContain('encodeURIComponent');
    });
  });

  describe('options', () => {
    test('should respect ignoreApis option', () => {
      const { context, reports } = createMockContext({ ignoreApis: ['escape'] });
      const visitor = noDeprecatedApiRule.create(context);

      visitor.CallExpression(createDeprecatedCall('escape'));

      expect(reports.length).toBe(0);
    });

    test('should respect additionalApis option', () => {
      const { context, reports } = createMockContext({
        additionalApis: [
          { name: 'oldFunction', reason: 'Use newFunction instead', replacement: 'newFunction' },
        ],
      });
      const visitor = noDeprecatedApiRule.create(context);

      visitor.CallExpression(createDeprecatedCall('oldFunction'));

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('oldFunction');
    });

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({});
      const visitor = noDeprecatedApiRule.create(context);

      visitor.CallExpression(createDeprecatedCall('escape'));

      expect(reports.length).toBe(1);
    });

    test('should handle undefined options', () => {
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext;

      const visitor = noDeprecatedApiRule.create(context);

      expect(() => visitor.CallExpression(createDeprecatedCall('escape'))).not.toThrow();
    });
  });

  describe('edge cases', () => {
    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      expect(() => visitor.CallExpression(null)).not.toThrow();
    });

    test('should handle null node gracefully in NewExpression', () => {
      const { context } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      expect(() => visitor.NewExpression(null)).not.toThrow();
    });

    test('should handle null node gracefully in MemberExpression', () => {
      const { context } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      expect(() => visitor.MemberExpression(null)).not.toThrow();
    });

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'escape' },
        arguments: [],
      };

      expect(() => visitor.CallExpression(node)).not.toThrow();
      expect(reports.length).toBe(1);
    });

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      const node = { type: 'CallExpression', arguments: [] };

      expect(() => visitor.CallExpression(node)).not.toThrow();
      expect(reports.length).toBe(0);
    });

    test('should handle member expression without property', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
        },
        arguments: [],
      };

      expect(() => visitor.CallExpression(node)).not.toThrow();
      expect(reports.length).toBe(0);
    });

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      expect(() => visitor.CallExpression('string')).not.toThrow();
      expect(() => visitor.CallExpression(123)).not.toThrow();
    });

    test('should report correct location', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      visitor.CallExpression(createDeprecatedCall('escape', 5, 10));

      expect(reports[0].loc?.start.line).toBe(5);
      expect(reports[0].loc?.start.column).toBe(10);
    });

    test('should handle NewExpression with non-Identifier callee', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      const node = {
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' } },
        arguments: [],
      };

      expect(() => visitor.NewExpression(node)).not.toThrow();
      expect(reports.length).toBe(0);
    });

    test('should handle MemberExpression without object', () => {
      const { context, reports } = createMockContext();
      const visitor = noDeprecatedApiRule.create(context);

      const node = {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: '__proto__' },
      };

      expect(() => visitor.MemberExpression(node)).not.toThrow();
    });
  });
});
