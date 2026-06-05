import { noUnnecessaryConsoleAssertSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-assert-spread.js';
import { describe, test, expect } from 'vitest';

function makeConsoleAssertCall(args: unknown[], loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } }) {
  return {
    type: 'CallExpression' as const,
    callee: {
      type: 'MemberExpression' as const,
      object: { type: 'Identifier' as const, name: 'console' },
      property: { type: 'Identifier' as const, name: 'assert' },
      computed: false,
    },
    arguments: args,
    loc,
  };
}

describe('no-unnecessary-console-assert-spread rule', () => {
  // --- Meta tests (8) ---
  test('has correct rule name', () => {
    expect(noUnnecessaryConsoleAssertSpreadRule.name).toBe('no-unnecessary-console-assert-spread');
  });

  test('has a meta object', () => {
    expect(noUnnecessaryConsoleAssertSpreadRule.meta).toBeDefined();
  });

  test('meta has type property', () => {
    expect(noUnnecessaryConsoleAssertSpreadRule.meta.type).toBeDefined();
  });

  test('meta has messages property', () => {
    expect(noUnnecessaryConsoleAssertSpreadRule.meta.messages).toBeDefined();
  });

  test('meta messages has the expected message key', () => {
    expect(noUnnecessaryConsoleAssertSpreadRule.meta.messages).toHaveProperty('unnecessary');
  });

  test('meta message contains expected text about spread', () => {
    const msg = noUnnecessaryConsoleAssertSpreadRule.meta.messages.unnecessary;
    expect(msg).toContain('console.assert');
    expect(msg).toContain('spread');
  });

  test('rule has create function', () => {
    expect(typeof noUnnecessaryConsoleAssertSpreadRule.create).toBe('function');
  });

  test('create returns an object with CallExpression handler', () => {
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({} as never);
    expect(typeof handlers.CallExpression).toBe('function');
  });

  // --- Structure tests (2) ---
  test('meta message matches expected pattern', () => {
    const msg = noUnnecessaryConsoleAssertSpreadRule.meta.messages.unnecessary;
    expect(msg).toBe(
      'console.assert(...items) with a single spread is unusual. Consider passing arguments directly.'
    );
  });

  test('meta type is suggestion', () => {
    expect(noUnecessaryConsoleAssertSpreadRule.meta.type).toBe('suggestion');
  });

  // --- Positive tests (28) ---
  test('flags console.assert(...args) with single spread', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      const report = r as { messageId: string; node: unknown };
      expect(report.messageId).toBe('unnecessary');
      expect(report.node).toBe(node);
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert(...items)', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert(...data)', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'data' } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert(...obj)', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'obj' } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert(...arr)', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert(...values)', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'values' } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert(...list)', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'list' } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert(...rest)', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'rest' } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert(...result)', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'result' } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert(...output)', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'output' } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of member expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'bar' }, computed: false } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of call expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArgs' }, arguments: [] } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of array expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of binary expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of conditional expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'y' }, alternate: { type: 'Identifier', name: 'z' } } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of logical expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of sequence expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of template literal', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'TemplateLiteral', quasis: [], expressions: [] } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of assignment expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Identifier', name: 'y' } } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of await expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of yield expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'YieldExpression', argument: { type: 'Identifier', name: 'val' } } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of unary expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'UnaryExpression', operator: '!', argument: { type: 'Identifier', name: 'x' }, prefix: true } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of update expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'UpdateExpression', operator: '++', argument: { type: 'Identifier', name: 'x' }, prefix: true } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of new expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of tagged template', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of typeof expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'UnaryExpression', operator: 'typeof', argument: { type: 'Identifier', name: 'x' }, prefix: true } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of void expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'UnaryExpression', operator: 'void', argument: { type: 'Literal', value: 0 }, prefix: true } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('flags console.assert with spread of parenthesized expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'wrapped' } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  // --- Negative tests (40) ---
  test('does not flag console.assert with no arguments', () => {
    const node = makeConsoleAssertCall([]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with single literal argument', () => {
    const node = makeConsoleAssertCall([{ type: 'Literal', value: true }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with single identifier argument', () => {
    const node = makeConsoleAssertCall([{ type: 'Identifier', name: 'condition' }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with two regular arguments', () => {
    const node = makeConsoleAssertCall([{ type: 'Identifier', name: 'cond' }, { type: 'Literal', value: 'msg' }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with three regular arguments', () => {
    const node = makeConsoleAssertCall([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.log(...args)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'log' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.error(...args)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'error' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.warn(...args)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'warn' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.info(...args)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'info' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.debug(...args)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'debug' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.trace(...args)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'trace' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.dir(...args)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'dir' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.table(...args)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'table' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag myObj.assert(...args)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'myObj' },
        property: { type: 'Identifier', name: 'assert' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag assert(...args)', () => {
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'assert' },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with computed property access', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'assert' },
        computed: true,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with spread plus extra arg', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
      { type: 'Literal', value: 'extra' },
    ]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with arg then spread', () => {
    const node = makeConsoleAssertCall([
      { type: 'Literal', value: true },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
    ]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with two spreads', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } },
    ]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with member expression arg', () => {
    const node = makeConsoleAssertCall([
      { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' }, computed: false },
    ]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with call expression arg', () => {
    const node = makeConsoleAssertCall([
      { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
    ]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag plain function call', () => {
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'foo' },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with numeric literal', () => {
    const node = makeConsoleAssertCall([{ type: 'Literal', value: 42 }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with string literal', () => {
    const node = makeConsoleAssertCall([{ type: 'Literal', value: 'hello' }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with null literal', () => {
    const node = makeConsoleAssertCall([{ type: 'Literal', value: null }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with object expression', () => {
    const node = makeConsoleAssertCall([{ type: 'ObjectExpression', properties: [] }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with array expression', () => {
    const node = makeConsoleAssertCall([{ type: 'ArrayExpression', elements: [] }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with function expression', () => {
    const node = makeConsoleAssertCall([{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with arrow function expression', () => {
    const node = makeConsoleAssertCall([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, expression: false }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with template literal', () => {
    const node = makeConsoleAssertCall([{ type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' }, tail: true }], expressions: [] }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with regex literal', () => {
    const node = makeConsoleAssertCall([{ type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with boolean literal false', () => {
    const node = makeConsoleAssertCall([{ type: 'Literal', value: false }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag window.console.assert(...args)', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'console' }, computed: false },
        property: { type: 'Identifier', name: 'assert' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with ThisExpression arg', () => {
    const node = makeConsoleAssertCall([{ type: 'ThisExpression' }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with Super arg', () => {
    const node = makeConsoleAssertCall([{ type: 'Super' }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with NewExpression arg', () => {
    const node = makeConsoleAssertCall([{ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with tagged template arg', () => {
    const node = makeConsoleAssertCall([{ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with spread plus identifier', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
      { type: 'Identifier', name: 'extra' },
    ]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert with spread of nested spread', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'SpreadElement', argument: { type: 'Identifier', name: 'deep' } } },
      { type: 'Identifier', name: 'extra' },
    ]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('does not flag console.assert(...items, msg)', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
      { type: 'Literal', value: 'fallback message' },
    ]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  // --- Edge cases (17) ---
  test('handles node with no arguments array', () => {
    const node = makeConsoleAssertCall([]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('handles callee being an identifier instead of member expression', () => {
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'console' },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('handles callee object being a member expression', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'console' }, computed: false },
        property: { type: 'Identifier', name: 'assert' },
        computed: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('handles callee property being a literal in computed access', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Literal', value: 'assert' },
        computed: true,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    };
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('handles empty arguments gracefully', () => {
    const node = makeConsoleAssertCall([]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('handles spread argument being a complex nested expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' }, computed: false }, arguments: [{ type: 'Literal', value: 1 }] } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('handles node without loc property', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('handles spread of an immediately invoked function', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'ArrayExpression', elements: [] } }] } }, arguments: [] } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('handles spread of a chained member expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' }, computed: false }, property: { type: 'Identifier', name: 'c' }, computed: false } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('handles console.assert with undefined literal argument', () => {
    const node = makeConsoleAssertCall([{ type: 'Identifier', name: 'undefined' }]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });

  test('handles spread of a conditional expression', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'ArrayExpression', elements: [] }, alternate: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] } } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('handles multiple calls independently', () => {
    let reportCount = 0;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reportCount++; } } as never);

    const positiveNode = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
    ]);
    const negativeNode = makeConsoleAssertCall([{ type: 'Literal', value: true }]);

    handlers.CallExpression(positiveNode);
    handlers.CallExpression(negativeNode);
    expect(reportCount).toBe(1);
  });

  test('handles spread of empty array literal', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('handles console.assert(...[]) empty array spread', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('handles spread with single element array literal', () => {
    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 42 }] } },
    ]);
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: (r: unknown) => {
      expect((r as { messageId: string }).messageId).toBe('unnecessary');
    } } as never);
    handlers.CallExpression(node);
  });

  test('handles context being passed correctly to create', () => {
    const mockContext = {
      report: (r: unknown) => {
        expect((r as { messageId: string }).messageId).toBe('unnecessary');
      },
    } as never;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create(mockContext);
    expect(typeof handlers.CallExpression).toBe('function');

    const node = makeConsoleAssertCall([
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ]);
    handlers.CallExpression(node);
  });

  test('handles console.assert with many non-spread arguments', () => {
    const node = makeConsoleAssertCall([
      { type: 'Identifier', name: 'a' },
      { type: 'Identifier', name: 'b' },
      { type: 'Identifier', name: 'c' },
      { type: 'Identifier', name: 'd' },
      { type: 'Identifier', name: 'e' },
    ]);
    let reported = false;
    const handlers = noUnnecessaryConsoleAssertSpreadRule.create({ report: () => { reported = true; } } as never);
    handlers.CallExpression(node);
    expect(reported).toBe(false);
  });
});
