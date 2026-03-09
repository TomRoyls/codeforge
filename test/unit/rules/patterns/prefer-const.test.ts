import { describe, test, expect, beforeEach, vi } from 'vitest';
import { preferConstRule } from '../../../../src/rules/patterns/prefer-const.js';
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js';

interface ReportDescriptor {
  message: string;
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } };
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'let x = 1;'
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

function createLetDeclaration(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'let',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: varName },
        init: { type: 'Literal', value: 1 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  };
}

function createVarDeclaration(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: varName },
        init: { type: 'Literal', value: 1 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  };
}

function createConstDeclaration(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: varName },
        init: { type: 'Literal', value: 1 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  };
}

function createDestructuringDeclaration(kind: 'let' | 'var', names: string[], line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind,
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: names.map((name) => ({
            type: 'Property',
            key: { type: 'Identifier', name },
            value: { type: 'Identifier', name },
          })),
        },
        init: { type: 'Identifier', name: 'obj' },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  };
}

function createAssignment(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: { type: 'Identifier', name: varName },
    right: { type: 'Literal', value: 2 },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  };
}

function createUpdateExpression(varName: string, line = 1, column = 0): unknown {
  return {
    type: 'UpdateExpression',
    operator: '++',
    argument: { type: 'Identifier', name: varName },
    prefix: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  };
}

describe('prefer-const rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(preferConstRule.meta.type).toBe('suggestion');
    });

    test('should have warn severity', () => {
      expect(preferConstRule.meta.severity).toBe('warn');
    });

    test('should be recommended', () => {
      expect(preferConstRule.meta.docs?.recommended).toBe(true);
    });

    test('should have correct category', () => {
      expect(preferConstRule.meta.docs?.category).toBe('patterns');
    });

    test('should have schema defined', () => {
      expect(preferConstRule.meta.schema).toBeDefined();
    });

    test('should have correct description', () => {
      expect(preferConstRule.meta.docs?.description).toContain('const');
    });

    test('should be fixable', () => {
      expect(preferConstRule.meta.fixable).toBe('code');
    });
  });

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext();
      const visitor = preferConstRule.create(context);

      expect(visitor).toHaveProperty('VariableDeclaration');
      expect(visitor).toHaveProperty('AssignmentExpression');
      expect(visitor).toHaveProperty('UpdateExpression');
      expect(visitor).toHaveProperty('Program:exit');
    });

    test('should report let declaration that is never reassigned', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      visitor.VariableDeclaration(createLetDeclaration('x'));
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('x');
      expect(reports[0].message).toContain('const');
    });

    test('should report var declaration that is never reassigned', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      visitor.VariableDeclaration(createVarDeclaration('y'));
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('y');
    });

    test('should not report let declaration that is reassigned', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      visitor.VariableDeclaration(createLetDeclaration('x'));
      visitor.AssignmentExpression(createAssignment('x'));
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBe(0);
    });

    test('should not report let declaration that is updated', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      visitor.VariableDeclaration(createLetDeclaration('x'));
      visitor.UpdateExpression(createUpdateExpression('x'));
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBe(0);
    });

    test('should not report const declarations', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      visitor.VariableDeclaration(createConstDeclaration('x'));
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBe(0);
    });

    test('should handle null node gracefully in VariableDeclaration', () => {
      const { context } = createMockContext();
      const visitor = preferConstRule.create(context);

      expect(() => visitor.VariableDeclaration(null)).not.toThrow();
    });

    test('should handle null node gracefully in AssignmentExpression', () => {
      const { context } = createMockContext();
      const visitor = preferConstRule.create(context);

      expect(() => visitor.AssignmentExpression(null)).not.toThrow();
    });

    test('should handle null node gracefully in UpdateExpression', () => {
      const { context } = createMockContext();
      const visitor = preferConstRule.create(context);

      expect(() => visitor.UpdateExpression(null)).not.toThrow();
    });

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext();
      const visitor = preferConstRule.create(context);

      expect(() => visitor.VariableDeclaration('string')).not.toThrow();
      expect(() => visitor.VariableDeclaration(123)).not.toThrow();
    });

    test('should handle destrucuring declarations', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a', 'b']));
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBeGreaterThan(0);
    });
  });

  describe('options', () => {
    test('should respect destructuring option', () => {
      const { context, reports } = createMockContext({ destructuring: 'all' });
      const visitor = preferConstRule.create(context);

      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a', 'b']));
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBeGreaterThan(0);
    });

    test('should respect ignoreDestructuring option', () => {
      const { context, reports } = createMockContext(
        { ignoreDestructuring: true },
        '/src/file.ts',
        'let { a, b } = obj;'
      );
      const visitor = preferConstRule.create(context);

      visitor.VariableDeclaration(createDestructuringDeclaration('let', ['a', 'b']));
      visitor['Program:exit']?.(undefined);
    });

    test('should respect ignoreReadBeforeAssign option', () => {
      const { context, reports } = createMockContext({ ignoreReadBeforeAssign: true });
      const visitor = preferConstRule.create(context);

      expect(visitor).toBeDefined();
    });

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({});
      const visitor = preferConstRule.create(context);

      visitor.VariableDeclaration(createLetDeclaration('x'));
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBe(1);
    });

    test('should handle undefined options', () => {
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'let x = 1;',
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

      const visitor = preferConstRule.create(context);

      expect(() => {
        visitor.VariableDeclaration(createLetDeclaration('x'));
        visitor['Program:exit']?.(undefined);
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    test('should handle node without loc', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
          },
        ],
      };

      expect(() => visitor.VariableDeclaration(node)).not.toThrow();
    });

    test('should handle declaration without id', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [{ type: 'VariableDeclarator' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      };

      expect(() => visitor.VariableDeclaration(node)).not.toThrow();
    });

    test('should handle empty declarations array', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      };

      expect(() => visitor.VariableDeclaration(node)).not.toThrow();
    });

    test('should handle AssignmentExpression without left', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      const node = { type: 'AssignmentExpression', operator: '=' };

      expect(() => visitor.AssignmentExpression(node)).not.toThrow();
    });

    test('should handle UpdateExpression without argument', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      const node = { type: 'UpdateExpression', operator: '++' };

      expect(() => visitor.UpdateExpression(node)).not.toThrow();
    });

    test('should report correct location', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      visitor.VariableDeclaration(createLetDeclaration('x', 5, 10));
      visitor['Program:exit']?.(undefined);

      expect(reports[0].loc?.start.line).toBe(5);
      expect(reports[0].loc?.start.column).toBe(10);
    });

    test('should handle multiple declarations', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      visitor.VariableDeclaration(createLetDeclaration('a'));
      visitor.VariableDeclaration(createLetDeclaration('b'));
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBe(2);
    });

    test('should handle mixed reassigned and non-reassigned', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      visitor.VariableDeclaration(createLetDeclaration('a'));
      visitor.VariableDeclaration(createLetDeclaration('b'));
      visitor.AssignmentExpression(createAssignment('a'));
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBe(1);
      expect(reports[0].message).toContain('b');
    });

    test('should handle array destructuring', () => {
      const { context } = createMockContext();
      const visitor = preferConstRule.create(context);

      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ArrayPattern',
              elements: [
                { type: 'Identifier', name: 'first' },
                { type: 'Identifier', name: 'second' },
              ],
            },
            init: { type: 'Identifier', name: 'arr' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      };

      expect(() => visitor.VariableDeclaration(node)).not.toThrow();
    });

    test('should handle nested object destructuring', () => {
      const { context } = createMockContext();
      const visitor = preferConstRule.create(context);

      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ObjectPattern',
              properties: [
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'nested' },
                  value: {
                    type: 'ObjectPattern',
                    properties: [
                      {
                        type: 'Property',
                        key: { type: 'Identifier', name: 'value' },
                        value: { type: 'Identifier', name: 'value' },
                      },
                    ],
                  },
                },
              ],
            },
            init: { type: 'Identifier', name: 'obj' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      };

      expect(() => visitor.VariableDeclaration(node)).not.toThrow();
    });

    test('should handle rest element in array destructuring', () => {
      const { context, reports } = createMockContext();
      const visitor = preferConstRule.create(context);

      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ArrayPattern',
              elements: [
                { type: 'Identifier', name: 'first' },
                {
                  type: 'RestElement',
                  argument: { type: 'Identifier', name: 'rest' },
                },
              ],
            },
            init: { type: 'Identifier', name: 'arr' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      };

      expect(() => visitor.VariableDeclaration(node)).not.toThrow();
      visitor['Program:exit']?.(undefined);
      expect(reports.length).toBeGreaterThan(0);
    });

    test('should handle rest element in object destructuring', () => {
      const { context } = createMockContext();
      const visitor = preferConstRule.create(context);

      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ObjectPattern',
              properties: [
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'a' },
                  value: { type: 'Identifier', name: 'a' },
                },
                {
                  type: 'RestElement',
                  argument: { type: 'Identifier', name: 'others' },
                },
              ],
            },
            init: { type: 'Identifier', name: 'obj' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      };

      expect(() => visitor.VariableDeclaration(node)).not.toThrow();
    });

    test('should handle assignment pattern in destructuring', () => {
      const { context } = createMockContext();
      const visitor = preferConstRule.create(context);

      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ObjectPattern',
              properties: [
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'a' },
                  value: {
                    type: 'AssignmentPattern',
                    left: { type: 'Identifier', name: 'a' },
                    right: { type: 'Literal', value: 1 },
                  },
                },
              ],
            },
            init: { type: 'Identifier', name: 'obj' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      };

      expect(() => visitor.VariableDeclaration(node)).not.toThrow();
    });

    test('should skip destructured variable when ignoreDestructuring matches object pattern', () => {
      const { context, reports } = createMockContext(
        { ignoreDestructuring: true },
        '/src/file.ts',
        'let { x } = obj;'
      );
      const visitor = preferConstRule.create(context);

      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ObjectPattern',
              properties: [
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'x' },
                  value: { type: 'Identifier', name: 'x' },
                },
              ],
            },
            init: { type: 'Identifier', name: 'obj' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      };

      visitor.VariableDeclaration(node);
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBe(0);
    });

    test('should skip destructured variable when ignoreDestructuring matches array pattern', () => {
      const { context, reports } = createMockContext(
        { ignoreDestructuring: true },
        '/src/file.ts',
        'let [y] = arr;'
      );
      const visitor = preferConstRule.create(context);

      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'ArrayPattern',
              elements: [{ type: 'Identifier', name: 'y' }],
            },
            init: { type: 'Identifier', name: 'arr' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      };

      visitor.VariableDeclaration(node);
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBe(0);
    });
  });
});
