import { describe, test, expect } from 'vitest';
import { noUnnecessaryConsoleTraceSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-trace-spread.js';

const MESSAGE =
  'console.trace(...items) with a single spread is unusual. Consider passing arguments directly.';
const DESCRIPTION =
  'Warn about console.trace(...items) with spread which is likely a mistake.';
const DOCS_URL =
  'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-console-trace-spread.ts';

function makeConsoleTraceCall(args: unknown[]) {
  return {
    type: 'ExpressionStatement' as const,
    expression: {
      type: 'CallExpression' as const,
      callee: {
        type: 'MemberExpression' as const,
        object: { type: 'Identifier' as const, name: 'console' },
        property: { type: 'Identifier' as const, name: 'trace' },
        computed: false,
        optional: false,
      },
      arguments: args,
      optional: false,
    },
  };
}

function makeSpreadArgument(expression: unknown) {
  return { type: 'SpreadElement' as const, argument: expression };
}

function makeIdentifier(name: string) {
  return { type: 'Identifier' as const, name };
}

function makeLiteral(value: unknown) {
  return { type: 'Literal' as const, value };
}

function makeArrayExpression(elements: unknown[]) {
  return { type: 'ArrayExpression' as const, elements };
}

function makeCallExpression(callee: unknown, args: unknown[]) {
  return { type: 'CallExpression' as const, callee, arguments: args, optional: false };
}

function makeMemberExpression(obj: unknown, prop: unknown, computed = false) {
  return {
    type: 'MemberExpression' as const,
    object: obj,
    property: prop,
    computed,
    optional: false,
  };
}

function makeOtherCall(callee: unknown, args: unknown[]) {
  return {
    type: 'ExpressionStatement' as const,
    expression: {
      type: 'CallExpression' as const,
      callee,
      arguments: args,
      optional: false,
    },
  };
}

describe('no-unnecessary-console-trace-spread rule', () => {
  // ─── META (8 tests) ────────────────────────────────────────────────────
  test('has correct meta message', () => {
    expect(noUnnecessaryConsoleTraceSpreadRule.meta.message).toBe(MESSAGE);
  });

  test('has correct meta description', () => {
    expect(noUnnecessaryConsoleTraceSpreadRule.meta.description).toBe(DESCRIPTION);
  });

  test('has correct meta docsUrl', () => {
    expect(noUnnecessaryConsoleTraceSpreadRule.meta.docsUrl).toBe(DOCS_URL);
  });

  test('export name is noUnnecessaryConsoleTraceSpreadRule', () => {
    expect(noUnnecessaryConsoleTraceSpreadRule).toBeDefined();
  });

  test('rule has meta property', () => {
    expect(noUnnecessaryConsoleTraceSpreadRule).toHaveProperty('meta');
  });

  test('meta message is a non-empty string', () => {
    expect(typeof noUnnecessaryConsoleTraceSpreadRule.meta.message).toBe('string');
    expect(noUnnecessaryConsoleTraceSpreadRule.meta.message.length).toBeGreaterThan(0);
  });

  test('meta description is a non-empty string', () => {
    expect(typeof noUnnecessaryConsoleTraceSpreadRule.meta.description).toBe('string');
    expect(noUnnecessaryConsoleTraceSpreadRule.meta.description.length).toBeGreaterThan(0);
  });

  test('meta docsUrl is a valid URL string', () => {
    expect(typeof noUnnecessaryConsoleTraceSpreadRule.meta.docsUrl).toBe('string');
    expect(noUnnecessaryConsoleTraceSpreadRule.meta.docsUrl).toMatch(/^https?:\/\//);
  });

  // ─── STRUCTURE (2 tests) ───────────────────────────────────────────────
  test('rule is an object with expected shape', () => {
    expect(typeof noUnnecessaryConsoleTraceSpreadRule).toBe('object');
    expect(noUnnecessaryConsoleTraceSpreadRule).not.toBeNull();
  });

  test('rule meta contains message, description, and docsUrl keys', () => {
    const { meta } = noUnnecessaryConsoleTraceSpreadRule;
    expect(meta).toHaveProperty('message');
    expect(meta).toHaveProperty('description');
    expect(meta).toHaveProperty('docsUrl');
  });

  // ─── POSITIVE (28 tests) ───────────────────────────────────────────────
  test('flags console.trace(...items) with single spread of identifier', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('items'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...arr) with single spread of identifier named arr', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('arr'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...data) with single spread of identifier named data', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('data'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...args) with single spread of identifier named args', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('args'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...result) with single spread of identifier named result', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('result'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...list) with single spread of identifier named list', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('list'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...values) with single spread of identifier named values', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('values'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...elements) with single spread of identifier named elements', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('elements'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...array) with single spread of identifier named array', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('array'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...collection) with single spread of identifier', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('collection'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...obj.items) with spread of member expression', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeMemberExpression(makeIdentifier('obj'), makeIdentifier('items'))),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...this.items) with spread of this.member', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(
        makeMemberExpression({ type: 'ThisExpression' as const }, makeIdentifier('items')),
      ),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...foo.bar.baz) with spread of nested member expression', () => {
    const inner = makeMemberExpression(makeIdentifier('foo'), makeIdentifier('bar'));
    const outer = makeMemberExpression(inner, makeIdentifier('baz'));
    const node = makeConsoleTraceCall([makeSpreadArgument(outer)]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...getItems()) with spread of call expression result', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeCallExpression(makeIdentifier('getItems'), [])),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...factory.produce()) with spread of method call result', () => {
    const callee = makeMemberExpression(makeIdentifier('factory'), makeIdentifier('produce'));
    const node = makeConsoleTraceCall([makeSpreadArgument(makeCallExpression(callee, []))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...[1, 2, 3]) with spread of array literal', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeArrayExpression([makeLiteral(1), makeLiteral(2), makeLiteral(3)])),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...[]) with spread of empty array literal', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeArrayExpression([]))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...obj["items"]) with spread of computed member expression', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(
        makeMemberExpression(makeIdentifier('obj'), makeLiteral('items'), true),
      ),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...items) where items is a short identifier name', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('x'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...items) where items is a single letter identifier', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('a'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...window.data) with spread of global member', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeMemberExpression(makeIdentifier('window'), makeIdentifier('data'))),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...state.errors) with spread of state member', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeMemberExpression(makeIdentifier('state'), makeIdentifier('errors'))),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...config.entries) with spread of config member', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(
        makeMemberExpression(makeIdentifier('config'), makeIdentifier('entries')),
      ),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...args.map(Number)) with spread of method call on identifier', () => {
    const mapCallee = makeMemberExpression(makeIdentifier('args'), makeIdentifier('map'));
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeCallExpression(mapCallee, [makeIdentifier('Number')])),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...Object.values(obj)) with spread of Object.values call', () => {
    const ovCallee = makeMemberExpression(makeIdentifier('Object'), makeIdentifier('values'));
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeCallExpression(ovCallee, [makeIdentifier('obj')])),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...Array.from(set)) with spread of Array.from call', () => {
    const afCallee = makeMemberExpression(makeIdentifier('Array'), makeIdentifier('from'));
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeCallExpression(afCallee, [makeIdentifier('set')])),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...String.prototype.match.call(str, re)) with spread of complex call', () => {
    const sp = makeMemberExpression(makeIdentifier('String'), makeIdentifier('prototype'));
    const match = makeMemberExpression(sp, makeIdentifier('match'));
    const call = makeMemberExpression(match, makeIdentifier('call'));
    const node = makeConsoleTraceCall([
      makeSpreadArgument(
        makeCallExpression(call, [makeIdentifier('str'), makeIdentifier('re')]),
      ),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...(yield value)) with spread of yield expression', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument({ type: 'YieldExpression' as const, argument: makeIdentifier('value'), delegate: false }),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  // ─── NEGATIVE (40 tests) ───────────────────────────────────────────────
  test('does not flag console.trace() with no arguments', () => {
    const node = makeConsoleTraceCall([]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace("message") with a single literal string argument', () => {
    const node = makeConsoleTraceCall([makeLiteral('message')]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(42) with a single literal number argument', () => {
    const node = makeConsoleTraceCall([makeLiteral(42)]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(true) with a single literal boolean argument', () => {
    const node = makeConsoleTraceCall([makeLiteral(true)]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(null) with a null literal argument', () => {
    const node = makeConsoleTraceCall([makeLiteral(null)]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(undefined) with undefined argument', () => {
    const node = makeConsoleTraceCall([makeIdentifier('undefined')]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(items) with a single identifier argument (no spread)', () => {
    const node = makeConsoleTraceCall([makeIdentifier('items')]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(obj.items) with a single member expression argument (no spread)', () => {
    const arg = makeMemberExpression(makeIdentifier('obj'), makeIdentifier('items'));
    const node = makeConsoleTraceCall([arg]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace("msg", ...items) with literal plus spread (two args)', () => {
    const node = makeConsoleTraceCall([makeLiteral('msg'), makeSpreadArgument(makeIdentifier('items'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(...items, "msg") with spread plus literal (two args)', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('items')), makeLiteral('msg')]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(...a, ...b) with two spread arguments', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeIdentifier('a')),
      makeSpreadArgument(makeIdentifier('b')),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(...items, 42) with spread plus number', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('items')), makeLiteral(42)]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.log(...items) - different console method (log)', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('log')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.error(...items) - different console method (error)', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('error')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.warn(...items) - different console method (warn)', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('warn')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.info(...items) - different console method (info)', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('info')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.debug(...items) - different console method (debug)', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('debug')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.dir(...items) - different console method (dir)', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('dir')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.table(...items) - different console method (table)', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('table')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.group(...items) - different console method (group)', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('group')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.groupEnd() - different console method', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('groupEnd')),
      [],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.time("label") - different console method', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('time')),
      [makeLiteral('label')],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.timeEnd("label") - different console method', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('timeEnd')),
      [makeLiteral('label')],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.assert(cond, msg) - different console method', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('assert')),
      [makeIdentifier('cond'), makeLiteral('msg')],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.count("label") - different console method', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('count')),
      [makeLiteral('label')],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.countReset("label") - different console method', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('countReset')),
      [makeLiteral('label')],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.clear() - different console method', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('clear')),
      [],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag myTrace(...items) - not on console object', () => {
    const node = makeOtherCall(makeIdentifier('myTrace'), [
      makeSpreadArgument(makeIdentifier('items')),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag logger.trace(...items) - different object name', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('logger'), makeIdentifier('trace')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag tracer.trace(...items) - different object name', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('tracer'), makeIdentifier('trace')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag obj.trace(...items) - different object name', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('obj'), makeIdentifier('trace')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(arg1, arg2) with two regular arguments', () => {
    const node = makeConsoleTraceCall([makeIdentifier('arg1'), makeIdentifier('arg2')]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace("a", "b", "c") with three regular arguments', () => {
    const node = makeConsoleTraceCall([makeLiteral('a'), makeLiteral('b'), makeLiteral('c')]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(...items, extra, more) with spread and two more args', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeIdentifier('items')),
      makeIdentifier('extra'),
      makeIdentifier('more'),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console["trace"](...items) - computed property access', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeLiteral('trace'), true),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag a plain function call trace(...items)', () => {
    const node = makeOtherCall(makeIdentifier('trace'), [
      makeSpreadArgument(makeIdentifier('items')),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(fn()) with a call expression argument (no spread)', () => {
    const node = makeConsoleTraceCall([
      makeCallExpression(makeIdentifier('fn'), []),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace({...obj}) with an object expression argument', () => {
    const node = makeConsoleTraceCall([
      { type: 'ObjectExpression' as const, properties: [] },
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag console.trace(/regex/) with a regex literal argument', () => {
    const node = makeConsoleTraceCall([{ type: 'Literal' as const, value: /regex/, regex: { pattern: 'regex', flags: '' } }]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  // ─── EDGE (17 tests) ───────────────────────────────────────────────────
  test('flags console.trace(...items) - spread of items with underscores in name', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeIdentifier('my_debug_items')),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...$items) - spread of identifier with $ prefix', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('$items'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(..._items) - spread of identifier with _ prefix', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('_items'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...items123) - spread of identifier with trailing numbers', () => {
    const node = makeConsoleTraceCall([makeSpreadArgument(makeIdentifier('items123'))]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...JSON.parse(str)) with spread of JSON.parse call', () => {
    const jpCallee = makeMemberExpression(makeIdentifier('JSON'), makeIdentifier('parse'));
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeCallExpression(jpCallee, [makeIdentifier('str')])),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...new Set(arr)) with spread of new expression', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument({
        type: 'NewExpression' as const,
        callee: makeIdentifier('Set'),
        arguments: [makeIdentifier('arr')],
      }),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('flags console.trace(...a?.b) with spread of optional chain', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(
        makeMemberExpression(makeIdentifier('a'), makeIdentifier('b')),
      ),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('does not flag non-ExpressionStatement node type', () => {
    const node = {
      type: 'VariableDeclaration',
      declarations: [],
      kind: 'const' as const,
    };
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag ExpressionStatement with non-CallExpression expression', () => {
    const node = {
      type: 'ExpressionStatement' as const,
      expression: { type: 'Identifier' as const, name: 'foo' },
    };
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag CallExpression with non-MemberExpression callee', () => {
    const node = {
      type: 'ExpressionStatement' as const,
      expression: {
        type: 'CallExpression' as const,
        callee: { type: 'Identifier' as const, name: 'trace' },
        arguments: [makeSpreadArgument(makeIdentifier('items'))],
        optional: false,
      },
    };
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag when callee object is not an Identifier', () => {
    const node = makeOtherCall(
      {
        type: 'MemberExpression' as const,
        object: { type: 'ThisExpression' as const },
        property: { type: 'Identifier' as const, name: 'trace' },
        computed: false,
        optional: false,
      },
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag when callee property is not an Identifier', () => {
    const node = makeOtherCall(
      {
        type: 'MemberExpression' as const,
        object: { type: 'Identifier' as const, name: 'console' },
        property: { type: 'Literal' as const, value: 'trace' },
        computed: true,
        optional: false,
      },
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag when callee object name is not "console"', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('Console'), makeIdentifier('trace')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag when callee property name is not "trace"', () => {
    const node = makeOtherCall(
      makeMemberExpression(makeIdentifier('console'), makeIdentifier('Trace')),
      [makeSpreadArgument(makeIdentifier('items'))],
    );
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('flags console.trace(...template) with spread of identifier named template', () => {
    const node = makeConsoleTraceCall([
      makeSpreadArgument(makeIdentifier('template')),
    ]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(true);
  });

  test('does not flag console.trace(...items) when argument count is 0', () => {
    const node = makeConsoleTraceCall([]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });

  test('does not flag when single argument is not a SpreadElement', () => {
    const node = makeConsoleTraceCall([{ type: 'ArrayExpression' as const, elements: [] }]);
    expect(noUnnecessaryConsoleTraceSpreadRule.check(node)).toBe(false);
  });
});
