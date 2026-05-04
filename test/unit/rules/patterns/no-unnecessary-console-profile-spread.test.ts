import { describe, test, expect } from 'vitest';
import { noUnnecessaryConsoleProfileSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-profile-spread.js';

interface Loc {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

function makeConsoleProfileCall(args: unknown[], loc?: Loc) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: 'profile' },
      computed: false,
    },
    arguments: args,
    ...(loc ? { loc } : {}),
  };
}

describe('no-unnecessary-console-profile-spread rule', () => {
  // 8 meta tests
  test('has the correct rule name', () => {
    expect(noUnnecessaryConsoleProfileSpreadRule.name).toBe('no-unnecessary-console-profile-spread');
  });

  test('has a description in meta', () => {
    expect(noUnnecessaryConsoleProfileSpreadRule.meta.description).toBeDefined();
    expect(typeof noUnnecessaryConsoleProfileSpreadRule.meta.description).toBe('string');
  });

  test('meta description mentions console.profile and spread', () => {
    const desc = noUnnecessaryConsoleProfileSpreadRule.meta.description as string;
    expect(desc.toLowerCase()).toContain('console.profile');
    expect(desc.toLowerCase()).toContain('spread');
  });

  test('has a message defined in meta', () => {
    expect(noUnnecessaryConsoleProfileSpreadRule.meta.message).toBeDefined();
    expect(typeof noUnnecessaryConsoleProfileSpreadRule.meta.message).toBe('string');
  });

  test('message matches expected text', () => {
    expect(noUnnecessaryConsoleProfileSpreadRule.meta.message).toBe(
      'console.profile(...items) with spread is unusual. profile() expects an optional label string.'
    );
  });

  test('rule has a create method', () => {
    expect(typeof noUnnecessaryConsoleProfileSpreadRule.create).toBe('function');
  });

  test('create returns a visitor object', () => {
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({} as never);
    expect(typeof visitor).toBe('object');
    expect(visitor).not.toBeNull();
  });

  test('visitor has a CallExpression handler', () => {
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({} as never);
    expect(typeof visitor.CallExpression).toBe('function');
  });

  // 2 structure tests
  test('makeConsoleProfileCall produces a valid CallExpression with spread argument', () => {
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    expect(node.type).toBe('CallExpression');
    expect(node.callee.type).toBe('MemberExpression');
    expect(node.arguments).toHaveLength(1);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('makeConsoleProfileCall with no loc does not include loc property when not provided', () => {
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    expect(node.loc).toBeUndefined();
  });

  // 28 positive tests (should report)
  test('reports console.profile(...items) with single spread argument', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile(...arr) with single spread of arr variable', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile(...data) with single spread of data variable', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'data' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile(...args) with single spread of args variable', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile(...result) with single spread of result', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'result' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile(...values) with single spread of values', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'values' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile(...list) with single spread of list', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'list' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile(...entries) with single spread of entries', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'entries' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile(...collection) with single spread of collection', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'collection' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile(...elements) with single spread of elements', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'elements' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile(...options) with single spread of options', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'options' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile(...config) with single spread of config', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'config' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile with spread of a member expression obj.prop', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile with spread of a member expression this.items', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'items' },
          computed: false,
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile with spread of array literal [...[1,2,3]] wrapped', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'ArrayExpression',
          elements: [
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
            { type: 'Literal', value: 3 },
          ],
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports console.profile with spread of call expression ...getData()', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getData' },
          arguments: [],
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports with correct message for single spread', () => {
    const reports: Array<{ message: string }> = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r as { message: string }),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    visitor.CallExpression(node);
    expect(reports[0].message).toBe(
      'console.profile(...items) with spread is unusual. profile() expects an optional label string.'
    );
  });

  test('reports and includes the node in the report', () => {
    const reports: Array<{ node: unknown }> = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r as { node: unknown }),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    visitor.CallExpression(node);
    expect(reports[0].node).toBe(node);
  });

  test('reports spread of conditional expression ...(cond ? a : b)', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'cond' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports spread of logical expression ...(x || y)', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports spread of binary expression ...(a + b)', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports spread of template literal ...(`prefix_${name}`)', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports spread of await expression ...(await promise)', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'promise' },
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports spread of yield expression ...(yield generator)', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'YieldExpression',
          argument: { type: 'Identifier', name: 'generator' },
          delegate: false,
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports spread of sequence expression ...(a, b)', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'SequenceExpression',
          expressions: [
            { type: 'Identifier', name: 'a' },
            { type: 'Identifier', name: 'b' },
          ],
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports spread of assignment expression ...(x = items)', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'items' },
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports with computed member expression ...obj[key]', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'key' },
          computed: true,
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('reports spread of new expression ...(new Set(items))', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Set' },
          arguments: [{ type: 'Identifier', name: 'items' }],
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  // 40 negative tests (should NOT report)
  test('does not report console.profile() with no arguments', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile("label") with a single string argument', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([{ type: 'Literal', value: 'label' }]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile("a", "b") with multiple string arguments', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'Literal', value: 'a' },
      { type: 'Literal', value: 'b' },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(variable) with a single identifier argument', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([{ type: 'Identifier', name: 'label' }]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(x, y) with multiple identifier arguments', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'Identifier', name: 'x' },
      { type: 'Identifier', name: 'y' },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(...items, "extra") with spread plus extra arg', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
      { type: 'Literal', value: 'extra' },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile("prefix", ...items) with prefix arg plus spread', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'Literal', value: 'prefix' },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(...items, ...more) with two spreads', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'more' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.log(...items) - wrong method', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'log' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.warn(...items) - wrong method', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'warn' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.error(...items) - wrong method', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'error' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.info(...items) - wrong method', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'info' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.debug(...items) - wrong method', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'debug' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.table(...items) - wrong method', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'table' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profileEnd() - wrong method', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'profileEnd' },
        computed: false,
      },
      arguments: [],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.group(...items) - different method name', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'group' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report myObj.profile(...items) - wrong object', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'myObj' },
        property: { type: 'Identifier', name: 'profile' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report logger.profile(...items) - wrong object', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'logger' },
        property: { type: 'Identifier', name: 'profile' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console["profile"](...items) - computed member', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Literal', value: 'profile' },
        computed: true,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console[profile](...items) - computed with identifier', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'profile' },
        computed: true,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report a plain function call profile(...items)', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'profile' },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(42) with a single number literal', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([{ type: 'Literal', value: 42 }]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(true) with a single boolean literal', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([{ type: 'Literal', value: true }]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(null) with null', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([{ type: 'Literal', value: null }]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(template) with template literal', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'TemplateLiteral', quasis: [], expressions: [] },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(() => {}) with arrow function arg', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        expression: false,
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile({}) with object expression arg', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([{ type: 'ObjectExpression', properties: [] }]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile([]) with array expression arg', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([{ type: 'ArrayExpression', elements: [] }]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(a + b) with binary expression arg', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(getLabel()) with call expression arg', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getLabel' },
        arguments: [],
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(new Label()) with new expression arg', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Label' },
        arguments: [],
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(obj.prop) with member expression arg', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
        computed: false,
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(...items, ...more, label) with three args', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'more' } },
      { type: 'Literal', value: 'label' },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(undefined) with undefined literal', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([{ type: 'Identifier', name: 'undefined' }]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(1, 2, 3) with three numeric args', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'Literal', value: 1 },
      { type: 'Literal', value: 2 },
      { type: 'Literal', value: 3 },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report non-CallExpression nodes', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'ExpressionStatement',
      expression: { type: 'Literal', value: 42 },
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(this.value) with this member expression', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
        property: { type: 'Identifier', name: 'value' },
        computed: false,
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(super.method()) with super call', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Super' },
          property: { type: 'Identifier', name: 'method' },
          computed: false,
        },
        arguments: [],
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(typeof x) with unary expression arg', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: { type: 'Identifier', name: 'x' },
        prefix: true,
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(!flag) with unary not expression arg', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'flag' },
        prefix: true,
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('does not report console.profile(a ? b : c) with conditional expression arg', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'a' },
        consequent: { type: 'Identifier', name: 'b' },
        alternate: { type: 'Identifier', name: 'c' },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  // 17 edge cases
  test('handles node with null arguments array gracefully', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'profile' },
        computed: false,
      },
      arguments: null,
    };
    expect(() => visitor.CallExpression(node)).not.toThrow();
  });

  test('handles node with undefined callee gracefully', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: undefined,
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    expect(() => visitor.CallExpression(node)).not.toThrow();
  });

  test('handles node with non-MemberExpression callee', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'profile' },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('handles node with callee object being a MemberExpression (chained)', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        property: { type: 'Identifier', name: 'profile' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('handles spread element with null argument gracefully', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([{ type: 'SpreadElement', argument: null }]);
    expect(() => visitor.CallExpression(node)).not.toThrow();
  });

  test('handles console.profile with Symbol as property', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'profile' },
        computed: false,
      },
      arguments: [
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'sym' } },
      ],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('handles call with loc information present', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall(
      [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } }
    );
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('does not report when callee property is a Literal (computed access)', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Literal', value: 'profile' },
        computed: true,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('handles empty arguments array without error', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([]);
    expect(() => visitor.CallExpression(node)).not.toThrow();
    expect(reports).toHaveLength(0);
  });

  test('handles arguments with mixed types including non-spread', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      { type: 'Literal', value: 'label' },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('handles console.profile called via Function.prototype.call', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'profile' },
          computed: false,
        },
        property: { type: 'Identifier', name: 'call' },
        computed: false,
      },
      arguments: [
        { type: 'Literal', value: null },
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
      ],
    };
    visitor.CallExpression(node);
    expect(reports).toHaveLength(0);
  });

  test('handles node with missing callee property gracefully', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    expect(() => visitor.CallExpression(node)).not.toThrow();
  });

  test('handles node with missing arguments property gracefully', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'profile' },
        computed: false,
      },
    };
    expect(() => visitor.CallExpression(node)).not.toThrow();
  });

  test('handles console.profile with spread of tagged template', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('handles console.profile with spread of class expression', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'ClassExpression',
          id: null,
          superClass: null,
          body: { type: 'ClassBody', body: [] },
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });

  test('handles console.profile with spread of chained member obj.nested.prop', () => {
    const reports: unknown[] = [];
    const visitor = noUnnecessaryConsoleProfileSpreadRule.create({
      report: (r: unknown) => reports.push(r),
    } as never);
    const node = makeConsoleProfileCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'nested' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'prop' },
          computed: false,
        },
      },
    ]);
    visitor.CallExpression(node);
    expect(reports).toHaveLength(1);
  });
});
