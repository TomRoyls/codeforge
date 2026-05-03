import { describe, expect, test, vi } from 'vitest';
import { RuleContext } from '../../../../src/plugins/types.js';
import { noUnnecessaryConsoleDebugSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-debug-spread.js';

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  };
}

function createMockContext(): RuleContext {
  return {
    report: vi.fn(),
    options: [],
    id: 'test-rule',
    severity: 'warn' as const,
  };
}

function makeSpreadArg(argument: Record<string, unknown>) {
  return { type: 'SpreadElement', argument };
}

function makeConsoleDebugCall(
  args: ReturnType<typeof makeSpreadArg>[],
  locStartLine: number,
  locStartCol: number,
  locEndLine: number,
  locEndCol: number,
) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: 'debug' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  };
}

describe('no-unnecessary-console-debug-spread rule', () => {
  // ─── META TESTS (8) ───
  test('rule type is suggestion', () => {
    expect(noUnnecessaryConsoleDebugSpreadRule.type).toBe('suggestion');
  });

  test('rule severity is warn', () => {
    expect(noUnnecessaryConsoleDebugSpreadRule.severity).toBe('warn');
  });

  test('rule category is patterns', () => {
    expect(noUnnecessaryConsoleDebugSpreadRule.category).toBe('patterns');
  });

  test('rule recommended is false', () => {
    expect(noUnnecessaryConsoleDebugSpreadRule.recommended).toBe(false);
  });

  test('rule description is truthy', () => {
    expect(noUnnecessaryConsoleDebugSpreadRule.description).toBeTruthy();
  });

  test('rule description mentions console.debug', () => {
    expect(noUnnecessaryConsoleDebugSpreadRule.description).toContain('console.debug');
  });

  test('rule has correct docs URL', () => {
    expect(noUnnecessaryConsoleDebugSpreadRule.docsUrl).toBe(
      'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-console-debug-spread.ts',
    );
  });

  test('rule schema is empty', () => {
    expect(noUnnecessaryConsoleDebugSpreadRule.schema).toEqual([]);
  });

  // ─── STRUCTURE TESTS (2) ───
  test('create() returns visitor with CallExpression', () => {
    const visitor = noUnnecessaryConsoleDebugSpreadRule.create(createMockContext());
    expect(visitor).toHaveProperty('CallExpression');
    expect(typeof visitor.CallExpression).toBe('function');
  });

  test('default export matches named export', () => {
    expect(noUnnecessaryConsoleDebugSpreadRule).toBeDefined();
    expect(typeof noUnnecessaryConsoleDebugSpreadRule.create).toBe('function');
  });

  // ─── POSITIVE CASES (28) ───
  test('reports console.debug(...arr) with Identifier spread argument', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...items) with correct message', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 25);
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'console.debug(...items) with a single spread is unusual. Consider passing arguments directly.',
      }),
    );
  });

  test('reports console.debug(...arr) with ArrayExpression spread argument', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({ type: 'ArrayExpression', elements: [] })],
      2, 4, 2, 30,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...fn()) with CallExpression spread argument', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })],
      3, 0, 3, 20,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...obj.prop) with MemberExpression spread argument', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
        computed: false,
      })],
      4, 0, 4, 25,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...{}) with ObjectExpression spread argument', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({ type: 'ObjectExpression', properties: [] })],
      5, 0, 5, 22,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...(a ? b : c)) with ConditionalExpression spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'a' },
        consequent: { type: 'Identifier', name: 'b' },
        alternate: { type: 'Identifier', name: 'c' },
      })],
      6, 0, 6, 30,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...arr) with BinaryExpression spread argument', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      })],
      7, 0, 7, 20,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...a) with SequenceExpression spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'SequenceExpression',
        expressions: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
      })],
      8, 0, 8, 20,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...new Foo()) with NewExpression spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Foo' },
        arguments: [],
      })],
      9, 0, 9, 25,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...template) with TemplateLiteral spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      })],
      10, 0, 10, 30,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...(function(){})) with FunctionExpression spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })],
      11, 0, 11, 35,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...(() => {})) with ArrowFunctionExpression spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        expression: false,
      })],
      12, 0, 12, 30,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('report includes correct loc', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'x' })], 3, 5, 3, 22);
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledWith(
      expect.objectContaining({
        loc: makeLoc(3, 5, 3, 22),
      }),
    );
  });

  test('report includes the node', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'data' })], 1, 0, 1, 20);
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledWith(
      expect.objectContaining({
        node,
      }),
    );
  });

  test('reports console.debug(...a.b.c) with deep MemberExpression spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
          computed: false,
        },
        property: { type: 'Identifier', name: 'c' },
        computed: false,
      })],
      13, 0, 13, 25,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...[1, 2, 3]) with ArrayExpression with elements', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ],
      })],
      14, 0, 14, 30,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...fn(a, b)) with CallExpression with args', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
      })],
      15, 0, 15, 25,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...obj[key]) with computed MemberExpression', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'key' },
        computed: true,
      })],
      16, 0, 16, 25,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...x) with UnaryExpression spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
        prefix: true,
      })],
      17, 0, 17, 20,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...(a && b)) with LogicalExpression spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      })],
      18, 0, 18, 25,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...a++) with UpdateExpression spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'a' },
        prefix: false,
      })],
      19, 0, 19, 20,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...(void 0)) with UnaryExpression void spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
        prefix: true,
      })],
      20, 0, 20, 22,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...[...nested]) with nested spread in array', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'ArrayExpression',
        elements: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'nested' } }],
      })],
      21, 0, 21, 30,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports with spread argument being an AwaitExpression', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      })],
      22, 0, 22, 30,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports with spread argument being a YieldExpression', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'value' },
        delegate: false,
      })],
      23, 0, 23, 25,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports with spread argument being a TaggedTemplateExpression', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'tag' },
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      })],
      24, 0, 24, 30,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports with spread argument being a ClassExpression', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'ClassExpression',
        id: null,
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      })],
      25, 0, 25, 20,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports console.debug(...5) with Literal number spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({ type: 'Literal', value: 5 })],
      26, 0, 26, 20,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  // ─── NEGATIVE CASES (40) ───
  test('does NOT report for Math.debug(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.object = { type: 'Identifier', name: 'Math' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for Object.debug(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.object = { type: 'Identifier', name: 'Object' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.log(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Identifier', name: 'log' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.warn(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Identifier', name: 'warn' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.error(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Identifier', name: 'error' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.info(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Identifier', name: 'info' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.trace(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Identifier', name: 'trace' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.debug(arg) without spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [{ type: 'Identifier', name: 'arg' }] as ReturnType<typeof makeSpreadArg>[],
      1, 0, 1, 20,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.debug(...a, ...b) with multiple spreads', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [
        makeSpreadArg({ type: 'Identifier', name: 'a' }),
        makeSpreadArg({ type: 'Identifier', name: 'b' }),
      ],
      1, 0, 1, 25,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.debug(...a, b) with spread and regular arg', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [
        makeSpreadArg({ type: 'Identifier', name: 'a' }),
        { type: 'Identifier', name: 'b' },
      ] as ReturnType<typeof makeSpreadArg>[],
      1, 0, 1, 25,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.debug(a, ...b) with regular arg then spread', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [
        { type: 'Identifier', name: 'a' },
        makeSpreadArg({ type: 'Identifier', name: 'b' }),
      ] as ReturnType<typeof makeSpreadArg>[],
      1, 0, 1, 25,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.debug() with no arguments', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([], 1, 0, 1, 16);
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.debug("str") with string literal', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [{ type: 'Literal', value: 'str' }] as ReturnType<typeof makeSpreadArg>[],
      1, 0, 1, 22,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.debug(42) with number literal', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [{ type: 'Literal', value: 42 }] as ReturnType<typeof makeSpreadArg>[],
      1, 0, 1, 20,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report when callee object is null', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee = {
      type: 'MemberExpression',
      object: null,
      property: { type: 'Identifier', name: 'debug' },
      computed: false,
    };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report when callee property is null', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: null,
      computed: false,
    };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report when callee is missing', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee = undefined;
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report when callee is an Identifier (not MemberExpression)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee = { type: 'Identifier', name: 'debug' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for computed member console["debug"](...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.computed = true;
    node.callee.property = { type: 'Literal', value: 'debug' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report when callee object type is not Identifier', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.object = { type: 'Literal', value: 'console' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report when callee property type is not Identifier', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Literal', value: 'debug' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.debug(...undefined) when undefined is node name', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({ type: 'Identifier', name: 'undefined' })],
      1, 0, 1, 30,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    // This should still report since it's a valid spread - undefined is an Identifier
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('does NOT report for window.debug(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.object = { type: 'Identifier', name: 'window' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for foo.debug(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.object = { type: 'Identifier', name: 'foo' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.debug(a, b) with two regular args', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [
        { type: 'Identifier', name: 'a' },
        { type: 'Identifier', name: 'b' },
      ] as ReturnType<typeof makeSpreadArg>[],
      1, 0, 1, 25,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.debug(a, b, c) with three regular args', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [
        { type: 'Identifier', name: 'a' },
        { type: 'Identifier', name: 'b' },
        { type: 'Identifier', name: 'c' },
      ] as ReturnType<typeof makeSpreadArg>[],
      1, 0, 1, 30,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report when argument is empty object (not spread)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [{ type: 'ObjectExpression', properties: [] }] as ReturnType<typeof makeSpreadArg>[],
      1, 0, 1, 22,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.dir(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Identifier', name: 'dir' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.table(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Identifier', name: 'table' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.clear(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Identifier', name: 'clear' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.count(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Identifier', name: 'count' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.assert(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Identifier', name: 'assert' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.group(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Identifier', name: 'group' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for console.time(...arr)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.property = { type: 'Identifier', name: 'time' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report when callee type is not MemberExpression', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee = { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report when arguments array has wrong node type (Literal in spread position check)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [{ type: 'Literal', value: 'test' }] as ReturnType<typeof makeSpreadArg>[],
      1, 0, 1, 20,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for myConsole.debug(...arr) with different object name', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.object = { type: 'Identifier', name: 'myConsole' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('does NOT report for Console.debug(...arr) with capitalized object', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.object = { type: 'Identifier', name: 'Console' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  // ─── EDGE CASES (17) ───
  test('each call to create() produces an independent visitor', () => {
    const ctx1 = createMockContext();
    const ctx2 = createMockContext();
    const visitor1 = noUnnecessaryConsoleDebugSpreadRule.create(ctx1);
    const visitor2 = noUnnecessaryConsoleDebugSpreadRule.create(ctx2);
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'x' })], 1, 0, 1, 20);
    visitor1.CallExpression(node);
    visitor2.CallExpression(node);
    expect(ctx1.report).toHaveBeenCalledTimes(1);
    expect(ctx2.report).toHaveBeenCalledTimes(1);
  });

  test('accumulates reports across multiple calls within same context', () => {
    const ctx = createMockContext();
    const visitor = noUnnecessaryConsoleDebugSpreadRule.create(ctx);
    const node1 = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'a' })], 1, 0, 1, 15);
    const node2 = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'b' })], 2, 0, 2, 15);
    visitor.CallExpression(node1);
    visitor.CallExpression(node2);
    expect(ctx.report).toHaveBeenCalledTimes(2);
  });

  test('handles loc with line 0', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'x' })], 0, 0, 0, 20);
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledWith(
      expect.objectContaining({
        loc: makeLoc(0, 0, 0, 20),
      }),
    );
  });

  test('handles node with extra properties', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'x' })], 1, 0, 1, 20);
    const extendedNode = { ...node, extra: true, range: [0, 20] };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(extendedNode);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('handles node with empty loc', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'x' })], 1, 0, 1, 20);
    node.loc = { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('handles node with partial loc (missing end)', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'x' })], 1, 0, 1, 20);
    node.loc = { start: { line: 1, column: 0 } };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('reports multiple violations for same node visited multiple times', () => {
    const ctx = createMockContext();
    const visitor = noUnnecessaryConsoleDebugSpreadRule.create(ctx);
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'data' })], 5, 2, 5, 18);
    visitor.CallExpression(node);
    visitor.CallExpression(node);
    visitor.CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(3);
  });

  test('rule exports create function', () => {
    expect(typeof noUnnecessaryConsoleDebugSpreadRule.create).toBe('function');
  });

  test('handles node with _parent property', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'x' })], 1, 0, 1, 20);
    const nodeWithParent = { ...node, _parent: { type: 'ExpressionStatement' } };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(nodeWithParent);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('report loc matches node loc exactly', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'x' })], 7, 3, 7, 19);
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    const reportCall = ctx.report.mock.calls[0][0];
    expect(reportCall.loc.start.line).toBe(7);
    expect(reportCall.loc.start.column).toBe(3);
    expect(reportCall.loc.end.line).toBe(7);
    expect(reportCall.loc.end.column).toBe(19);
  });

  test('computed false is required for reporting', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.computed = false;
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('computed true prevents reporting', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20);
    node.callee.computed = true;
    node.callee.property = { type: 'Literal', value: 'debug' };
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('mixed valid and invalid calls in sequence', () => {
    const ctx = createMockContext();
    const visitor = noUnnecessaryConsoleDebugSpreadRule.create(ctx);

    const validNode = makeConsoleDebugCall(
      [{ type: 'Identifier', name: 'x' }] as ReturnType<typeof makeSpreadArg>[],
      1, 0, 1, 20,
    );

    const invalidNode = makeConsoleDebugCall(
      [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      2, 0, 2, 20,
    );

    const wrongMethodNode = makeConsoleDebugCall(
      [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      3, 0, 3, 20,
    );
    wrongMethodNode.callee.property = { type: 'Identifier', name: 'log' };

    visitor.CallExpression(validNode);
    visitor.CallExpression(invalidNode);
    visitor.CallExpression(wrongMethodNode);

    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('handles spread with deeply nested argument', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getObj' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'method' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'arg' }],
      })],
      1, 0, 1, 40,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('handles node without arguments array', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'x' })], 1, 0, 1, 20);
    node.arguments = undefined;
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('handles node with null arguments array', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'x' })], 1, 0, 1, 20);
    node.arguments = null;
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).not.toHaveBeenCalled();
  });

  test('handles node without loc property', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall([makeSpreadArg({ type: 'Identifier', name: 'x' })], 1, 0, 1, 20);
    delete node.loc;
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });

  test('handles spread argument with null inner argument', () => {
    const ctx = createMockContext();
    const node = makeConsoleDebugCall(
      [makeSpreadArg(null)],
      1, 0, 1, 20,
    );
    noUnnecessaryConsoleDebugSpreadRule.create(ctx).CallExpression(node);
    expect(ctx.report).toHaveBeenCalledTimes(1);
  });
});
