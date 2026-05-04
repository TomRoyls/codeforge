import { describe, test, expect } from 'vitest';
import { Linter } from 'eslint';
import { noUnnecessaryDateParseSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-parse-spread.js';

const RULE_NAME = 'no-unnecessary-date-parse-spread';
const MESSAGE_ID = 'unnecessarySpread';
const MESSAGE =
  'Date.parse(...items) with a single spread is unusual. Consider passing the date string directly.';

function makeDateParseCall(spreadArg: string): string {
  return `Date.parse(...${spreadArg})`;
}

function lintCode(code: string): Array<{ messageId: string | undefined; message: string }> {
  const linter = new Linter();
  linter.defineRule(RULE_NAME, noUnnecessaryDateParseSpreadRule);
  const results = linter.verify(code, {
    rules: { [RULE_NAME]: 'error' },
    parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  });
  return results.flatMap((r) =>
    r.messages.map((m) => ({ messageId: m.messageId, message: m.message })),
  );
}

describe('no-unnecessary-date-parse-spread rule', () => {
  test('rule has a meta property', () => {
    expect(noUnnecessaryDateParseSpreadRule.meta).toBeDefined();
  });

  test('rule meta.type is "suggestion"', () => {
    expect(noUnnecessaryDateParseSpreadRule.meta?.type).toBe('suggestion');
  });

  test('rule meta has docs property', () => {
    expect(noUnnecessaryDateParseSpreadRule.meta?.docs).toBeDefined();
  });

  test('rule meta.docs.description is a non-empty string', () => {
    const desc = noUnnecessaryDateParseSpreadRule.meta?.docs?.description;
    expect(typeof desc).toBe('string');
    expect(desc!.length).toBeGreaterThan(0);
  });

  test('rule meta has messages object', () => {
    expect(noUnnecessaryDateParseSpreadRule.meta?.messages).toBeDefined();
    expect(typeof noUnnecessaryDateParseSpreadRule.meta?.messages).toBe('object');
  });

  test('rule meta.messages contains "unnecessarySpread" key', () => {
    expect(noUnnecessaryDateParseSpreadRule.meta?.messages).toHaveProperty(MESSAGE_ID);
  });

  test('rule message references Date.parse', () => {
    const msg = noUnnecessaryDateParseSpreadRule.meta?.messages?.[MESSAGE_ID];
    expect(msg).toContain('Date.parse');
  });

  test('rule message references spread', () => {
    const msg = noUnnecessaryDateParseSpreadRule.meta?.messages?.[MESSAGE_ID];
    expect(msg).toContain('spread');
  });

  test('rule exports a create function', () => {
    expect(typeof noUnnecessaryDateParseSpreadRule.create).toBe('function');
  });

  test('makeDateParseCall helper generates correct syntax', () => {
    expect(makeDateParseCall('items')).toBe('Date.parse(...items)');
    expect(makeDateParseCall('arr')).toBe('Date.parse(...arr)');
    expect(makeDateParseCall('dateStrings')).toBe('Date.parse(...dateStrings)');
  });

  test('flags Date.parse(...items)', () => {
    const errors = lintCode('Date.parse(...items)');
    expect(errors).toHaveLength(1);
    expect(errors[0].messageId).toBe(MESSAGE_ID);
  });

  test('flags Date.parse(...arr)', () => {
    const errors = lintCode('Date.parse(...arr)');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...dates)', () => {
    const errors = lintCode('Date.parse(...dates)');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...dateStrings)', () => {
    const errors = lintCode('Date.parse(...dateStrings)');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...values)', () => {
    const errors = lintCode('Date.parse(...values)');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...x)', () => {
    const errors = lintCode('Date.parse(...x)');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(..._arr)', () => {
    const errors = lintCode('Date.parse(..._arr)');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...$items)', () => {
    const errors = lintCode('Date.parse(...$items)');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in const declaration', () => {
    const errors = lintCode('const result = Date.parse(...items);');
    expect(errors).toHaveLength(1);
    expect(errors[0].messageId).toBe(MESSAGE_ID);
  });

  test('flags Date.parse(...items) in if condition', () => {
    const errors = lintCode('if (Date.parse(...items)) {}');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) as return value', () => {
    const errors = lintCode('function f() { return Date.parse(...items); }');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) as function argument', () => {
    const errors = lintCode('fn(Date.parse(...items));');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in binary expression', () => {
    const errors = lintCode('Date.parse(...items) > 0');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in logical expression', () => {
    const errors = lintCode('Date.parse(...items) || fallback');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in array literal', () => {
    const errors = lintCode('[Date.parse(...items)]');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in object property', () => {
    const errors = lintCode('({ ts: Date.parse(...items) })');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in ternary expression', () => {
    const errors = lintCode('Date.parse(...items) ? a : b');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in var declaration', () => {
    const errors = lintCode('var x = Date.parse(...items);');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in let declaration', () => {
    const errors = lintCode('let y = Date.parse(...items);');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in arrow function', () => {
    const errors = lintCode('const fn = () => Date.parse(...items);');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...[i]) in map callback', () => {
    const errors = lintCode('items.map(i => Date.parse(...[i]));');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in try block', () => {
    const errors = lintCode('try { Date.parse(...items); } catch(e) {}');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in while loop', () => {
    const errors = lintCode('while(false) { Date.parse(...items); }');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in for loop', () => {
    const errors = lintCode('for(;;) { Date.parse(...items); break; }');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) as expression statement', () => {
    const errors = lintCode('Date.parse(...items);');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) with void operator', () => {
    const errors = lintCode('void Date.parse(...items);');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in assignment expression', () => {
    const errors = lintCode('x = Date.parse(...items);');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in template expression', () => {
    const errors = lintCode('`${Date.parse(...items)}`');
    expect(errors).toHaveLength(1);
  });

  test('allows Date.parse with string literal', () => {
    const errors = lintCode('Date.parse("2024-01-01")');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with variable argument', () => {
    const errors = lintCode('Date.parse(str)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with no arguments', () => {
    const errors = lintCode('Date.parse()');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with two spread arguments', () => {
    const errors = lintCode('Date.parse(...a, ...b)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with spread and extra string argument', () => {
    const errors = lintCode('Date.parse(...items, "extra")');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with string then spread', () => {
    const errors = lintCode('Date.parse("first", ...items)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag Something.parse(...items)', () => {
    const errors = lintCode('Something.parse(...items)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag Date.something(...items)', () => {
    const errors = lintCode('Date.something(...items)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with two string arguments', () => {
    const errors = lintCode('Date.parse(str1, str2)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag indirect call (0, Date.parse)(...items)', () => {
    const errors = lintCode('(0, Date.parse)(...items)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag computed member Date["parse"](...items)', () => {
    const errors = lintCode('Date["parse"](...items)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag plain function call foo(...items)', () => {
    const errors = lintCode('foo(...items)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag Math.max(...items)', () => {
    const errors = lintCode('Math.max(...items)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with empty template literal', () => {
    const errors = lintCode('Date.parse(``)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with number argument', () => {
    const errors = lintCode('Date.parse(123)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with null argument', () => {
    const errors = lintCode('Date.parse(null)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with undefined argument', () => {
    const errors = lintCode('Date.parse(undefined)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with spread and number', () => {
    const errors = lintCode('Date.parse(...items, 0)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with spread and null', () => {
    const errors = lintCode('Date.parse(...items, null)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag standalone parse(...items)', () => {
    const errors = lintCode('parse(...items)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse(items) without spread', () => {
    const errors = lintCode('Date.parse(items)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag new Date(...items)', () => {
    const errors = lintCode('new Date(...items)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag Date.UTC(...items)', () => {
    const errors = lintCode('Date.UTC(...items)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag Date.now()', () => {
    const errors = lintCode('Date.now()');
    expect(errors).toHaveLength(0);
  });

  test('does not flag Date.parse.call(null, ...items)', () => {
    const errors = lintCode('Date.parse.call(null, ...items)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag Date.parse.apply(null, items)', () => {
    const errors = lintCode('Date.parse.apply(null, items)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag OtherClass.parse(...items)', () => {
    const errors = lintCode('OtherClass.parse(...items)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with template literal string', () => {
    const errors = lintCode('Date.parse(`string`)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with array literal argument', () => {
    const errors = lintCode('Date.parse([...items])');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with object argument', () => {
    const errors = lintCode('Date.parse({})');
    expect(errors).toHaveLength(0);
  });

  test('does not flag window.Date.parse(...items)', () => {
    const errors = lintCode('window.Date.parse(...items)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with boolean argument', () => {
    const errors = lintCode('Date.parse(true)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with two number arguments', () => {
    const errors = lintCode('Date.parse(123, 456)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with concatenated string', () => {
    const errors = lintCode('Date.parse(str + "T00:00:00")');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with template expression argument', () => {
    const errors = lintCode('Date.parse(`${str}`)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with new Date() argument', () => {
    const errors = lintCode('Date.parse(new Date())');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with regex argument', () => {
    const errors = lintCode('Date.parse(/regex/)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with three arguments', () => {
    const errors = lintCode('Date.parse(str1, str2, str3)');
    expect(errors).toHaveLength(0);
  });

  test('does not flag MyDate.parse(...items)', () => {
    const errors = lintCode('MyDate.parse(...items)');
    expect(errors).toHaveLength(0);
  });

  test('allows Date.parse with spread and undefined', () => {
    const errors = lintCode('Date.parse(...items, undefined)');
    expect(errors).toHaveLength(0);
  });

  test('flags Date.parse(...[dateString]) with spread of array literal', () => {
    const errors = lintCode('Date.parse(...[dateString])');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items.map(i => i)) with spread of call expression', () => {
    const errors = lintCode('Date.parse(...items.map(i => i))');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...getItems()) with spread of function call', () => {
    const errors = lintCode('Date.parse(...getItems())');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...obj.dates) with spread of member expression', () => {
    const errors = lintCode('Date.parse(...obj.dates)');
    expect(errors).toHaveLength(1);
  });

  test('flags both occurrences when Date.parse(...items) appears twice', () => {
    const errors = lintCode('Date.parse(...items); Date.parse(...items);');
    expect(errors).toHaveLength(2);
  });

  test('flags Date.parse(...items) inside async function', () => {
    const errors = lintCode('async function f() { Date.parse(...items); }');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) inside generator function', () => {
    const errors = lintCode('function* f() { Date.parse(...items); }');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) inside class method', () => {
    const errors = lintCode('class C { method() { Date.parse(...items); } }');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) inside static class method', () => {
    const errors = lintCode('class C { static method() { Date.parse(...items); } }');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...(items)) with parentheses around identifier', () => {
    const errors = lintCode('Date.parse(...(items))');
    expect(errors).toHaveLength(1);
  });

  test('flags only spread when mixed with normal Date.parse call', () => {
    const errors = lintCode('Date.parse("2024-01-01"); Date.parse(...items);');
    expect(errors).toHaveLength(1);
    expect(errors[0].messageId).toBe(MESSAGE_ID);
  });

  test('flags Date.parse(...items) inside nested function', () => {
    const errors = lintCode(
      'function outer() { function inner() { Date.parse(...items); } }',
    );
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) inside block scope', () => {
    const errors = lintCode('{ Date.parse(...items); }');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in exported function', () => {
    const errors = lintCode('export function foo() { Date.parse(...items); }');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) in IIFE', () => {
    const errors = lintCode('(function() { Date.parse(...items); })()');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) as default parameter value', () => {
    const errors = lintCode('function foo(ts = Date.parse(...items)) {}');
    expect(errors).toHaveLength(1);
  });

  test('flags Date.parse(...items) inside Promise callback', () => {
    const errors = lintCode('Promise.resolve().then(() => Date.parse(...items));');
    expect(errors).toHaveLength(1);
  });
});
