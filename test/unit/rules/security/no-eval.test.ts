import { describe, test, expect, beforeEach, vi } from 'vitest';
import { noEvalRule } from '../../../../src/rules/security/no-eval.js';
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

function createEvalCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'eval' },
    arguments: [{ type: 'Literal', value: 'code' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  };
}

function createFunctionCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'Function' },
    arguments: [{ type: 'Literal', value: 'return 1' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  };
}

function createNewFunction(line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Function' },
    arguments: [{ type: 'Literal', value: 'return 1' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  };
}

function createMemberEvalCall(objectName = 'window', line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: 'eval' },
    },
    arguments: [{ type: 'Literal', value: 'code' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  };
}

function createWithStatement(line = 1, column = 0): unknown {
  return {
    type: 'WithStatement',
    object: { type: 'Identifier', name: 'obj' },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  };
}

function createSafeCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'console' },
    property: { type: 'Identifier', name: 'log' },
    arguments: [{ type: 'Literal', value: 'hello' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  };
}

describe('no-eval rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noEvalRule.meta.type).toBe('problem');
    });

    test('should have error severity', () => {
      expect(noEvalRule.meta.severity).toBe('error');
    });

    test('should be recommended', () => {
      expect(noEvalRule.meta.docs?.recommended).toBe(true);
    });

    test('should have correct category', () => {
      expect(noEvalRule.meta.docs?.category).toBe('security');
    });

    test('should have schema defined', () => {
      expect(noEvalRule.meta.schema).toBeDefined();
    });

    test('should have correct description', () => {
      expect(noEvalRule.meta.docs?.description).toContain('eval()');
    });

    test('should mention security in description', () => {
      expect(noEvalRule.meta.docs?.description.toLowerCase()).toContain('security');
    });
  });

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext();
      const visitor = noEvalRule.create(context);

      expect(visitor).toHaveProperty('CallExpression');
      expect(visitor).toHaveProperty('WithStatement');
      expect(visitor).toHaveProperty('NewExpression');
    });

    test('should report direct eval() call', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      visitor.CallExpression(createEvalCall());

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('eval');
      expect(reports[0].message).toContain('security');
    });

    test('should report Function constructor call', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      visitor.CallExpression(createFunctionCall());

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('Function');
    });

    test('should report new Function() expression', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      visitor.NewExpression(createNewFunction());

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('Function');
    });

    test('should report member expression eval call', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      visitor.CallExpression(createMemberEvalCall('window'));

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('eval');
    });

    test('should report global.eval call', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      visitor.CallExpression(createMemberEvalCall('global'));

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('eval');
    });

    test('should report with statement by default', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      visitor.WithStatement(createWithStatement());

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('with');
    });

    test('should not report safe calls', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      visitor.CallExpression(createSafeCall());

      expect(reports.length).toBe(0);
    });

    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockContext();
      const visitor = noEvalRule.create(context);

      expect(() => visitor.CallExpression(null)).not.toThrow();
    });

    test('should handle undefined node gracefully in CallExpression', () => {
      const { context } = createMockContext();
      const visitor = noEvalRule.create(context);

      expect(() => visitor.CallExpression(undefined)).not.toThrow();
    });

    test('should handle null node gracefully in NewExpression', () => {
      const { context } = createMockContext();
      const visitor = noEvalRule.create(context);

      expect(() => visitor.NewExpression(null)).not.toThrow();
    });

    test('should handle null node gracefully in WithStatement', () => {
      const { context } = createMockContext();
      const visitor = noEvalRule.create(context);

      expect(() => visitor.WithStatement(null)).not.toThrow();
    });

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext();
      const visitor = noEvalRule.create(context);

      expect(() => visitor.CallExpression('string')).not.toThrow();
      expect(() => visitor.CallExpression(123)).not.toThrow();
    });

    test('should report correct location', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      visitor.CallExpression(createEvalCall(5, 10));

      expect(reports[0].loc?.start.line).toBe(5);
      expect(reports[0].loc?.start.column).toBe(10);
    });
  });

  describe('options', () => {
    test('should respect allowIndirect option for member expression eval', () => {
      const { context, reports } = createMockContext({ allowIndirect: true });
      const visitor = noEvalRule.create(context);

      visitor.CallExpression(createMemberEvalCall('window'));

      expect(reports.length).toBe(0);
    });

    test('should still report direct eval with allowIndirect', () => {
      const { context, reports } = createMockContext({ allowIndirect: true });
      const visitor = noEvalRule.create(context);

      visitor.CallExpression(createEvalCall());

      expect(reports.length).toBe(1);
    });

    test('should respect allowWith option', () => {
      const { context, reports } = createMockContext({ allowWith: true });
      const visitor = noEvalRule.create(context);

      visitor.WithStatement(createWithStatement());

      expect(reports.length).toBe(0);
    });

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({});
      const visitor = noEvalRule.create(context);

      visitor.CallExpression(createEvalCall());

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

      const visitor = noEvalRule.create(context);

      expect(() => visitor.CallExpression(createEvalCall())).not.toThrow();
    });
  });

  describe('edge cases', () => {
    test('should handle node without loc', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
      };

      expect(() => visitor.CallExpression(node)).not.toThrow();
      expect(reports.length).toBe(1);
    });

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      const node = { type: 'CallExpression', arguments: [] };

      expect(() => visitor.CallExpression(node)).not.toThrow();
      expect(reports.length).toBe(0);
    });

    test('should handle member expression without property', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
        },
        arguments: [],
      };

      expect(() => visitor.CallExpression(node)).not.toThrow();
      expect(reports.length).toBe(0);
    });

    test('should not report other dangerous timer functions (setTimeout without string)', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'ArrowFunctionExpression', body: {} }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      };

      expect(() => visitor.CallExpression(node)).not.toThrow();
      expect(reports.length).toBe(0);
    });

    test('should handle NewExpression with non-Identifier callee', () => {
      const { context, reports } = createMockContext();
      const visitor = noEvalRule.create(context);

      const node = {
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' } },
        arguments: [],
      };

      expect(() => visitor.NewExpression(node)).not.toThrow();
      expect(reports.length).toBe(0);
    });
  });
});
