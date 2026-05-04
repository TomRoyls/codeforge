import { Linter } from 'eslint';
import rule from '../../../../src/rules/patterns/no-unnecessary-date-now-spread.js';

function makeDateNowCall(spreadContent: string): string {
  return `Date.now(${spreadContent})`;
}

function lintCode(code: string): Linter.LintMessage[] {
  const linter = new Linter();
  linter.defineRule('no-unnecessary-date-now-spread', rule);
  return linter.verify(code, {
    parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
    rules: { 'no-unnecessary-date-now-spread': 'error' },
  });
}

function lintCodeWithSeverity(
  code: string,
  severity: 'off' | 'warn' | 'error',
): Linter.LintMessage[] {
  const linter = new Linter();
  linter.defineRule('no-unnecessary-date-now-spread', rule);
  return linter.verify(code, {
    parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
    rules: { 'no-unnecessary-date-now-spread': severity },
  });
}

describe('no-unnecessary-date-now-spread rule', () => {
  // ============================================================
  // Meta tests (8)
  // ============================================================
  test('meta: rule has meta property', () => {
    expect(rule.meta).toBeDefined();
  });

  test('meta: meta has type property', () => {
    expect(rule.meta.type).toBeDefined();
  });

  test('meta: meta has docs property', () => {
    expect(rule.meta.docs).toBeDefined();
  });

  test('meta: meta.docs has description string', () => {
    expect(typeof rule.meta.docs.description).toBe('string');
  });

  test('meta: meta.docs has recommended property', () => {
    expect(rule.meta.docs.recommended).toBeDefined();
  });

  test('meta: meta has messages object', () => {
    expect(rule.meta.messages).toBeDefined();
    expect(typeof rule.meta.messages).toBe('object');
  });

  test('meta: meta.messages contains spread warning message', () => {
    const messages = Object.values(rule.meta.messages);
    const hasSpreadMessage = messages.some(
      (msg) => typeof msg === 'string' && msg.includes('spread'),
    );
    expect(hasSpreadMessage).toBe(true);
  });

  test('meta: meta has schema property', () => {
    expect(rule.meta.schema).toBeDefined();
  });

  // ============================================================
  // Structure tests (2)
  // ============================================================
  test('structure: rule exports create function', () => {
    expect(typeof rule.create).toBe('function');
  });

  test('structure: create returns object with CallExpression handler', () => {
    const handlers = rule.create({} as Parameters<typeof rule.create>[0]);
    expect(typeof handlers.CallExpression).toBe('function');
  });

  // ============================================================
  // Positive tests (28) — rule should report
  // ============================================================

  // --- Simple spread variable names (14) ---
  test('positive: Date.now(...items) reports', () => {
    const result = lintCode(makeDateNowCall('...items'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...args) reports', () => {
    const result = lintCode(makeDateNowCall('...args'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...arr) reports', () => {
    const result = lintCode(makeDateNowCall('...arr'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...data) reports', () => {
    const result = lintCode(makeDateNowCall('...data'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...list) reports', () => {
    const result = lintCode(makeDateNowCall('...list'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...rest) reports', () => {
    const result = lintCode(makeDateNowCall('...rest'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...spread) reports', () => {
    const result = lintCode(makeDateNowCall('...spread'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...values) reports', () => {
    const result = lintCode(makeDateNowCall('...values'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...params) reports', () => {
    const result = lintCode(makeDateNowCall('...params'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...array) reports', () => {
    const result = lintCode(makeDateNowCall('...array'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...x) with single letter name reports', () => {
    const result = lintCode(makeDateNowCall('...x'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(..._items) with underscore prefix reports', () => {
    const result = lintCode(makeDateNowCall('..._items'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...items$$) with dollar suffix reports', () => {
    const result = lintCode(makeDateNowCall('...items$$'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...camelCase123) with mixed name reports', () => {
    const result = lintCode(makeDateNowCall('...camelCase123'));
    expect(result).toHaveLength(1);
  });

  // --- Code context variations (7) ---
  test('positive: Date.now(...items) in function body reports', () => {
    const result = lintCode('function foo() { Date.now(...items); }');
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...args) as return value reports', () => {
    const result = lintCode('function foo() { return Date.now(...args); }');
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...params) in variable declaration reports', () => {
    const result = lintCode('const x = Date.now(...params);');
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...data) in if block reports', () => {
    const result = lintCode('if (cond) { Date.now(...data); }');
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...arr) in arrow function body reports', () => {
    const result = lintCode('const fn = () => Date.now(...arr);');
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...values) in class method reports', () => {
    const result = lintCode('class Foo { bar() { Date.now(...values); } }');
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...rest) nested in function call reports', () => {
    const result = lintCode('fn(Date.now(...rest));');
    expect(result).toHaveLength(1);
  });

  // --- Complex spread sources (4) ---
  test('positive: Date.now(...obj.items) with member expression spread reports', () => {
    const result = lintCode(makeDateNowCall('...obj.items'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...getItems()) with function call spread reports', () => {
    const result = lintCode(makeDateNowCall('...getItems()'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...[1, 2, 3]) with array literal spread reports', () => {
    const result = lintCode(makeDateNowCall('...[1, 2, 3]'));
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...arr.slice()) with method call spread reports', () => {
    const result = lintCode(makeDateNowCall('...arr.slice()'));
    expect(result).toHaveLength(1);
  });

  // --- Additional context variations (3) ---
  test('positive: Date.now(...items) in for loop body reports', () => {
    const result = lintCode(
      'for (let i = 0; i < 10; i++) { Date.now(...items); }',
    );
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...items) in try block reports', () => {
    const result = lintCode('try { Date.now(...items); } catch(e) {}');
    expect(result).toHaveLength(1);
  });

  test('positive: Date.now(...items) in ternary expression reports', () => {
    const result = lintCode('cond ? Date.now(...items) : 0;');
    expect(result).toHaveLength(1);
  });

  // ============================================================
  // Negative tests (40) — rule should NOT report
  // ============================================================

  // --- No spread — regular arguments (10) ---
  test('negative: Date.now() with no arguments does not report', () => {
    const result = lintCode('Date.now()');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now(0) with one number arg does not report', () => {
    const result = lintCode('Date.now(0)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now(1, 2) with two number args does not report', () => {
    const result = lintCode('Date.now(1, 2)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now("a", "b", "c") with string args does not report', () => {
    const result = lintCode('Date.now("a", "b", "c")');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now(undefined) with undefined arg does not report', () => {
    const result = lintCode('Date.now(undefined)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now(null) with null arg does not report', () => {
    const result = lintCode('Date.now(null)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now(true) with boolean arg does not report', () => {
    const result = lintCode('Date.now(true)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now({}) with object arg does not report', () => {
    const result = lintCode('Date.now({})');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now([]) with array literal arg does not report', () => {
    const result = lintCode('Date.now([])');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now(x) with variable arg does not report', () => {
    const result = lintCode('Date.now(x)');
    expect(result).toHaveLength(0);
  });

  // --- Wrong callee — object or property mismatch (13) ---
  test('negative: Something.now(...items) with wrong object does not report', () => {
    const result = lintCode('Something.now(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Foo.now(...args) with wrong object does not report', () => {
    const result = lintCode('Foo.now(...args)');
    expect(result).toHaveLength(0);
  });

  test('negative: date.now(...items) with lowercase date does not report', () => {
    const result = lintCode('date.now(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now2(...items) with wrong property does not report', () => {
    const result = lintCode('Date.now2(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.Now(...items) with wrong case property does not report', () => {
    const result = lintCode('Date.Now(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.getNow(...items) with different method does not report', () => {
    const result = lintCode('Date.getNow(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.current(...items) with different method does not report', () => {
    const result = lintCode('Date.current(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.timestamp(...items) with different method does not report', () => {
    const result = lintCode('Date.timestamp(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: now(...items) standalone function does not report', () => {
    const result = lintCode('now(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: myObj.method(...items) general method does not report', () => {
    const result = lintCode('myObj.method(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: console.log(...items) different built-in does not report', () => {
    const result = lintCode('console.log(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Math.max(...items) different built-in does not report', () => {
    const result = lintCode('Math.max(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Array.of(...items) different built-in does not report', () => {
    const result = lintCode('Array.of(...items)');
    expect(result).toHaveLength(0);
  });

  // --- Multiple or mixed spreads — not a single SpreadElement (5) ---
  test('negative: Date.now(...items, ...more) with two spreads does not report', () => {
    const result = lintCode('Date.now(...items, ...more)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now(...a, ...b, ...c) with three spreads does not report', () => {
    const result = lintCode('Date.now(...a, ...b, ...c)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now(...items, 1) with spread and extra arg does not report', () => {
    const result = lintCode('Date.now(...items, 1)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now(1, ...items) with arg before spread does not report', () => {
    const result = lintCode('Date.now(1, ...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now(...items, ...more, 1) with mixed args does not report', () => {
    const result = lintCode('Date.now(...items, ...more, 1)');
    expect(result).toHaveLength(0);
  });

  // --- Different call constructs (12) ---
  test('negative: new Date(...items) constructor call does not report', () => {
    const result = lintCode('new Date(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now reference without call does not report', () => {
    const result = lintCode('const x = Date.now;');
    expect(result).toHaveLength(0);
  });

  test('negative: Date?.now(...items) optional chaining member does not report', () => {
    const result = lintCode('Date?.now(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now?.(...items) optional call does not report', () => {
    const result = lintCode('Date.now?.(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: (0, Date.now)(...items) indirect call does not report', () => {
    const result = lintCode('(0, Date.now)(...items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now.apply(null, items) apply method does not report', () => {
    const result = lintCode('Date.now.apply(null, items)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now.call(null) call method does not report', () => {
    const result = lintCode('Date.now.call(null)');
    expect(result).toHaveLength(0);
  });

  test('negative: Date.now.bind(null) bind method does not report', () => {
    const result = lintCode('Date.now.bind(null)');
    expect(result).toHaveLength(0);
  });

  test('negative: fn(Date.now) passing as callback does not report', () => {
    const result = lintCode('fn(Date.now)');
    expect(result).toHaveLength(0);
  });

  test('negative: [Date.now()] in array literal does not report', () => {
    const result = lintCode('[Date.now()]');
    expect(result).toHaveLength(0);
  });

  test('negative: ({ foo: Date.now() }) in object literal does not report', () => {
    const result = lintCode('({ foo: Date.now() })');
    expect(result).toHaveLength(0);
  });

  test('negative: Object.keys(...items) different built-in does not report', () => {
    const result = lintCode('Object.keys(...items)');
    expect(result).toHaveLength(0);
  });

  // ============================================================
  // Edge case tests (17)
  // ============================================================

  test('edge: Date.now(...items,) with trailing comma still reports', () => {
    const result = lintCode('Date.now(...items,)');
    expect(result).toHaveLength(1);
  });

  test('edge: multiple Date.now(...items) occurrences both report', () => {
    const result = lintCode('Date.now(...items); Date.now(...args);');
    expect(result).toHaveLength(2);
  });

  test('edge: Date.now(...items) and Date.now() in same file — only spread reports', () => {
    const result = lintCode('Date.now(...items); Date.now();');
    expect(result).toHaveLength(1);
  });

  test('edge: error message contains spread wording', () => {
    const result = lintCode('Date.now(...items)');
    expect(result).toHaveLength(1);
    expect(result[0].message).toMatch(/spread/i);
  });

  test('edge: error message references Date.now', () => {
    const result = lintCode('Date.now(...items)');
    expect(result).toHaveLength(1);
    expect(result[0].message).toMatch(/Date\.now/);
  });

  test('edge: error message suggests calling directly', () => {
    const result = lintCode('Date.now(...items)');
    expect(result).toHaveLength(1);
    expect(result[0].message).toMatch(/directly/i);
  });

  test('edge: rule configured as warning still detects pattern', () => {
    const result = lintCodeWithSeverity('Date.now(...items)', 'warn');
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(1);
  });

  test('edge: rule configured as off does not report', () => {
    const result = lintCodeWithSeverity('Date.now(...items)', 'off');
    expect(result).toHaveLength(0);
  });

  test('edge: very long variable name in spread reports', () => {
    const longName = 'a'.repeat(100);
    const result = lintCode(makeDateNowCall(`...${longName}`));
    expect(result).toHaveLength(1);
  });

  test('edge: unicode variable name in spread reports', () => {
    const result = lintCode(makeDateNowCall('...αβγδε'));
    expect(result).toHaveLength(1);
  });

  test('edge: deeply nested function containing Date.now(...items) reports', () => {
    const result = lintCode(
      'function outer() { function inner() { Date.now(...items); } }',
    );
    expect(result).toHaveLength(1);
  });

  test('edge: Date.now(...items) with line comment before reports', () => {
    const result = lintCode('// comment\nDate.now(...items);');
    expect(result).toHaveLength(1);
  });

  test('edge: Date.now(...items) with block comment after reports', () => {
    const result = lintCode('Date.now(...items); /* comment */');
    expect(result).toHaveLength(1);
  });

  test('edge: Date.now(...items) in module export reports', () => {
    const result = lintCode('export const x = Date.now(...items);');
    expect(result).toHaveLength(1);
  });

  test('edge: Date.now(...items) in generator function reports', () => {
    const result = lintCode('function* gen() { Date.now(...items); }');
    expect(result).toHaveLength(1);
  });

  test('edge: Date.now(...items) in async function reports', () => {
    const result = lintCode('async function foo() { Date.now(...items); }');
    expect(result).toHaveLength(1);
  });

  test('edge: Date.now(...items) without semicolon reports', () => {
    const result = lintCode('Date.now(...items)');
    expect(result).toHaveLength(1);
  });
});
