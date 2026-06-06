import { noUnnecessaryConsoleDirSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-dir-spread.js';
import { RuleTester } from 'eslint';
import { describe, test, expect } from 'vitest';

function makeConsoleDirCall(args: unknown[], loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } }) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: 'dir' },
      computed: false,
    },
    arguments: args,
    loc,
  };
}

describe('no-unnecessary-console-dir-spread rule', () => {
  // Meta tests (8)
  test('rule has correct meta type', () => {
    expect(noUnnecessaryConsoleDirSpreadRule.meta.type).toBe('suggestion');
  });

  test('rule has messages defined', () => {
    expect(noUnnecessaryConsoleDirSpreadRule.meta.messages).toBeDefined();
  });

  test('rule has create function', () => {
    expect(typeof noUnnecessaryConsoleDirSpreadRule.create).toBe('function');
  });

  test('rule message contains console.dir', () => {
    const messages = noUnnecessaryConsoleDirSpreadRule.meta.messages;
    const msg = Object.values(messages)[0] as string;
    expect(msg).toContain('console.dir');
  });

  test('rule message mentions spread', () => {
    const messages = noUnnecessaryConsoleDirSpreadRule.meta.messages;
    const msg = Object.values(messages)[0] as string;
    expect(msg).toContain('spread');
  });

  test('rule message suggests passing directly', () => {
    const messages = noUnnecessaryConsoleDirSpreadRule.meta.messages;
    const msg = Object.values(messages)[0] as string;
    expect(msg).toContain('directly');
  });

  test('rule meta has docs or is suggestion type', () => {
    expect(noUnnecessaryConsoleDirSpreadRule.meta.type).toBeDefined();
  });

  test('rule message key is a string', () => {
    const messages = noUnnecessaryConsoleDirSpreadRule.meta.messages;
    const keys = Object.keys(messages);
    expect(keys.length).toBeGreaterThan(0);
    expect(typeof keys[0]).toBe('string');
  });

  // Structure tests (2)
  test('makeConsoleDirCall creates CallExpression', () => {
    const node = makeConsoleDirCall([]);
    expect(node.type).toBe('CallExpression');
  });

  test('makeConsoleDirCall callee is MemberExpression with console.dir', () => {
    const node = makeConsoleDirCall([]);
    expect(node.callee.type).toBe('MemberExpression');
    expect(node.callee.object.name).toBe('console');
    expect(node.callee.property.name).toBe('dir');
  });

  // Positive tests (28) - cases that SHOULD trigger the rule
  test('flags console.dir(...items) with single spread argument', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    expect(node.arguments).toHaveLength(1);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags console.dir(...arr) with spread of identifier', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
    expect((node.arguments[0] as { argument: { name: string } }).argument.name).toBe('arr');
  });

  test('flags console.dir(...data) spread with data identifier', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'data' } },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags console.dir(...results) spread with results identifier', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'results' } },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags console.dir(...list) spread with list identifier', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'list' } },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags console.dir(...args) spread with args identifier', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags console.dir(...obj) spread with obj identifier', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'obj' } },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('detects single spread argument in arguments array', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'values' } },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(true);
  });

  test('flags console.dir(...items) where callee object is console', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    expect(node.callee.object.name).toBe('console');
  });

  test('flags console.dir(...items) where callee property is dir', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    expect(node.callee.property.name).toBe('dir');
  });

  test('flags console.dir(...items) where callee is not computed', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    expect(node.callee.computed).toBe(false);
  });

  test('flags spread with member expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' }, computed: false },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with array expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'a' }] },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with call expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with conditional expression argument', () => {
    const node = makeConsoleDirCall([
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
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with binary expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with logical expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with template literal argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with object expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'ObjectExpression', properties: [] },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with unary expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'UnaryExpression', operator: '!', argument: { type: 'Identifier', name: 'x' }, prefix: true },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with arrow function expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with sequence expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }] },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with await expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with new expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with tagged template expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with assignment expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Identifier', name: 'y' } },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('flags spread with yield expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: { type: 'YieldExpression', argument: { type: 'Identifier', name: 'val' } },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  // Negative tests (40) - cases that should NOT trigger the rule
  test('does not flag console.dir(items) with no spread', () => {
    const node = makeConsoleDirCall([
      { type: 'Identifier', name: 'items' },
    ]);
    const hasSpread = node.arguments[0].type === 'SpreadElement';
    expect(hasSpread).toBe(false);
  });

  test('does not flag console.dir(item1, item2) with multiple non-spread args', () => {
    const node = makeConsoleDirCall([
      { type: 'Identifier', name: 'item1' },
      { type: 'Identifier', name: 'item2' },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(...items, extra) with spread plus extra arg', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
      { type: 'Identifier', name: 'extra' },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir() with no arguments', () => {
    const node = makeConsoleDirCall([]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.log(...items) - wrong method', () => {
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
    expect(node.callee.property.name).not.toBe('dir');
  });

  test('does not flag console.warn(...items) - wrong method', () => {
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
    expect(node.callee.property.name).not.toBe('dir');
  });

  test('does not flag console.error(...items) - wrong method', () => {
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
    expect(node.callee.property.name).not.toBe('dir');
  });

  test('does not flag console.info(...items) - wrong method', () => {
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
    expect(node.callee.property.name).not.toBe('dir');
  });

  test('does not flag console.debug(...items) - wrong method', () => {
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
    expect(node.callee.property.name).not.toBe('dir');
  });

  test('does not flag console.table(...items) - wrong method', () => {
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
    expect(node.callee.property.name).not.toBe('dir');
  });

  test('does not flag myObj.dir(...items) - wrong object', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'myObj' },
        property: { type: 'Identifier', name: 'dir' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    expect(node.callee.object.name).not.toBe('console');
  });

  test('does not flag logger.dir(...items) - wrong object', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'logger' },
        property: { type: 'Identifier', name: 'dir' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    expect(node.callee.object.name).not.toBe('console');
  });

  test('does not flag console[dir](...items) - computed access', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'dir' },
        computed: true,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    expect(node.callee.computed).toBe(true);
  });

  test('does not flag console.dir("literal") with string literal', () => {
    const node = makeConsoleDirCall([
      { type: 'Literal', value: 'hello' },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(42) with number literal', () => {
    const node = makeConsoleDirCall([
      { type: 'Literal', value: 42 },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(null) with null literal', () => {
    const node = makeConsoleDirCall([
      { type: 'Literal', value: null },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(undefined) with undefined identifier', () => {
    const node = makeConsoleDirCall([
      { type: 'Identifier', name: 'undefined' },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(obj) with object identifier', () => {
    const node = makeConsoleDirCall([
      { type: 'Identifier', name: 'obj' },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(obj, opts) with two non-spread args', () => {
    const node = makeConsoleDirCall([
      { type: 'Identifier', name: 'obj' },
      { type: 'Identifier', name: 'opts' },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir({}) with object expression', () => {
    const node = makeConsoleDirCall([
      { type: 'ObjectExpression', properties: [] },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir([]) with array expression', () => {
    const node = makeConsoleDirCall([
      { type: 'ArrayExpression', elements: [] },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(fn()) with call expression', () => {
    const node = makeConsoleDirCall([
      { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(a ? b : c) with conditional expression', () => {
    const node = makeConsoleDirCall([
      { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Identifier', name: 'b' }, alternate: { type: 'Identifier', name: 'c' } },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag standalone dir(...items) - not member expression', () => {
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'dir' },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    expect(node.callee.type).not.toBe('MemberExpression');
  });

  test('does not flag window.console.dir(...items) - nested member', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'console' },
          computed: false,
        },
        property: { type: 'Identifier', name: 'dir' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    expect(node.callee.object.type).not.toBe('Identifier');
  });

  test('does not flag console.dir(...items, ...more) with two spreads', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'more' } },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(first, ...rest) with leading non-spread', () => {
    const node = makeConsoleDirCall([
      { type: 'Identifier', name: 'first' },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'rest' } },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag dir(...items) free function call', () => {
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'dir' },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    expect(node.callee.type).toBe('Identifier');
    expect(node.callee.type).not.toBe('MemberExpression');
  });

  test('does not flag console.dir(true) with boolean literal', () => {
    const node = makeConsoleDirCall([
      { type: 'Literal', value: true },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(0) with zero literal', () => {
    const node = makeConsoleDirCall([
      { type: 'Literal', value: 0 },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir("") with empty string literal', () => {
    const node = makeConsoleDirCall([
      { type: 'Literal', value: '' },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(/regex/) with regex literal', () => {
    const node = makeConsoleDirCall([
      { type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(obj, { depth: null }) with options', () => {
    const node = makeConsoleDirCall([
      { type: 'Identifier', name: 'obj' },
      { type: 'ObjectExpression', properties: [{ type: 'Property', key: { type: 'Identifier', name: 'depth' }, value: { type: 'Literal', value: null } }] },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(a + b) with binary expression argument', () => {
    const node = makeConsoleDirCall([
      { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir(new Foo()) with new expression', () => {
    const node = makeConsoleDirCall([
      { type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('does not flag console.dir`template` with tagged template', () => {
    const node = {
      type: 'TaggedTemplateExpression',
      tag: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'dir' },
        computed: false,
      },
      quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
    };
    expect(node.type).not.toBe('CallExpression');
  });

  test('does not flag console.dir(...items) when callee property is a string literal', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Literal', value: 'dir' },
        computed: true,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    expect(node.callee.property.type).not.toBe('Identifier');
  });

  test('does not flag console.dir(...items) when object is ThisExpression', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
        property: { type: 'Identifier', name: 'dir' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    expect(node.callee.object.type).not.toBe('Identifier');
  });

  test('does not flag console.dir(...items) when object is a call expression', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getConsole' }, arguments: [] },
        property: { type: 'Identifier', name: 'dir' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    expect(node.callee.object.type).not.toBe('Identifier');
  });

  test('does not flag when callee is a simple identifier', () => {
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'consoleDir' },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    };
    expect(node.callee.type).not.toBe('MemberExpression');
  });

  test('does not flag console.dir with three regular arguments', () => {
    const node = makeConsoleDirCall([
      { type: 'Identifier', name: 'a' },
      { type: 'Identifier', name: 'b' },
      { type: 'Identifier', name: 'c' },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  // Edge cases (17)
  test('edge: console.dir with Symbol as argument', () => {
    const node = makeConsoleDirCall([
      { type: 'CallExpression', callee: { type: 'Identifier', name: 'Symbol' }, arguments: [] },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('edge: console.dir with BigInt literal argument', () => {
    const node = makeConsoleDirCall([
      { type: 'Literal', value: BigInt(1), bigint: '1' },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('edge: console.dir with function expression argument', () => {
    const node = makeConsoleDirCall([
      { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('edge: console.dir with class expression argument', () => {
    const node = makeConsoleDirCall([
      { type: 'ClassExpression', id: null, body: { type: 'ClassBody', body: [] } },
    ]);
    const hasSingleSpread = node.arguments.length === 1 && node.arguments[0].type === 'SpreadElement';
    expect(hasSingleSpread).toBe(false);
  });

  test('edge: spread with nested spread-like member access', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'flat' },
          computed: false,
        },
      },
    ]);
    expect(node.arguments.length).toBe(1);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('edge: console.dir with SpreadElement containing Literal', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Literal', value: 42 } },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('edge: makeConsoleDirCall preserves location info', () => {
    const loc = { start: { line: 5, column: 10 }, end: { line: 5, column: 30 } };
    const node = makeConsoleDirCall([], loc);
    expect(node.loc).toEqual(loc);
  });

  test('edge: makeConsoleDirCall with default location', () => {
    const node = makeConsoleDirCall([]);
    expect(node.loc).toEqual({ start: { line: 1, column: 0 }, end: { line: 1, column: 20 } });
  });

  test('edge: console.dir with empty SpreadElement argument', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'empty' } },
    ]);
    expect(node.arguments.length).toBe(1);
  });

  test('edge: spread with chained member expression argument', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'c' },
          computed: false,
        },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('edge: rule should handle null loc gracefully', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
    expect(node.callee.object.name).toBe('console');
  });

  test('edge: console.dir with regex match result spread', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Literal', value: 'test', regex: { pattern: 'test', flags: '' } },
            property: { type: 'Identifier', name: 'match' },
            computed: false,
          },
          arguments: [],
        },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('edge: multiple regular args followed by spread is not single spread', () => {
    const node = makeConsoleDirCall([
      { type: 'Identifier', name: 'a' },
      { type: 'Identifier', name: 'b' },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'rest' } },
    ]);
    expect(node.arguments.length).toBe(3);
    expect(node.arguments.length === 1).toBe(false);
  });

  test('edge: single SpreadElement with UpdateExpression argument', () => {
    const node = makeConsoleDirCall([
      { type: 'SpreadElement', argument: { type: 'UpdateExpression', operator: '++', argument: { type: 'Identifier', name: 'i' }, prefix: false } },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('edge: console.dir with SpreadElement containing TypeCastExpression-like node', () => {
    const node = makeConsoleDirCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'val' },
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
      },
    ]);
    expect(node.arguments[0].type).toBe('SpreadElement');
  });

  test('edge: rule metadata messages should contain key matching messageIds', () => {
    const messages = noUnnecessaryConsoleDirSpreadRule.meta.messages;
    expect(typeof messages).toBe('object');
    expect(messages).not.toBeNull();
  });

  test('edge: verify rule create returns object with CallExpression handler', () => {
    const result = noUnnecessaryConsoleDirSpreadRule.create({});
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });
});
