import { noUnnecessaryDateGetUTCSecondsSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-utc-seconds-spread.js';
import { RuleTester } from 'eslint';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

// 8 meta tests
test('rule has correct meta', () => {
  expect(noUnnecessaryDateGetUTCSecondsSpreadRule.meta).toBeDefined();
});

test('rule has correct message', () => {
  expect(noUnnecessaryDateGetUTCSecondsSpreadRule.meta.messages!.unnecessarySpread).toBe(
    'date.getUTCSeconds(...items) with a single spread is unusual. Consider calling date.getUTCSeconds() directly.'
  );
});

test('rule has correct type', () => {
  expect(noUnnecessaryDateGetUTCSecondsSpreadRule.meta.type).toBe('suggestion');
});

test('rule has correct docs', () => {
  expect(noUnnecessaryDateGetUTCSecondsSpreadRule.meta.docs).toBeDefined();
});

test('rule has correct schema', () => {
  expect(noUnnecessaryDateGetUTCSecondsSpreadRule.meta.schema).toEqual([]);
});

test('rule has fixable or not', () => {
  expect(noUnnecessaryDateGetUTCSecondsSpreadRule.meta.fixable).toBeUndefined();
});

test('rule create is a function', () => {
  expect(typeof noUnnecessaryDateGetUTCSecondsSpreadRule.create).toBe('function');
});

test('rule create returns object', () => {
  const result = noUnnecessaryDateGetUTCSecondsSpreadRule.create({});
  expect(typeof result).toBe('object');
});

// 2 structure tests
ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...items)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...args)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

// 28 positive tests (invalid cases that should trigger the rule)
ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...items)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...args)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...spread)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...params)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...rest)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...arr)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...list)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...vals)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...data)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...extra)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...options)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...theArgs)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...input)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...more)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...collection)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...elements)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...stuff)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...payload)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...bag)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...remainder)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...tail)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...others)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...remaining)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...xs)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...values)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getUTCSeconds(...array)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'function fn() { date.getUTCSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const fn = () => { date.getUTCSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

// 40 negative tests (valid cases that should NOT trigger the rule)
ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds()'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['other.getUTCSeconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCMinutes(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds(1)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds(1, 2)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds("a")'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds(null)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds(undefined)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds(true)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds(x)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds(1, ...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds(...items, 1)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds(...a, ...b)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['obj.date.getUTCSeconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date["getUTCSeconds"](...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['getUTCSeconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.setUTCSeconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['myDate.getUTCSeconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['Date.getUTCSeconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getutcseconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.GetUTCSeconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds(...items).valueOf()'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['new date.getUTCSeconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date?.getUTCSeconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds.call(...args)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds.apply(...args)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds.bind(...args)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getTime(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getMilliseconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['const x = date.getUTCSeconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds([...items])'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCSeconds({...items})'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['`${date.getUTCSeconds()}`'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['window.date.getUTCSeconds(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCFullYear(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getUTCHours(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.toISOString(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.toString(...items)'],
  invalid: [],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: ['date.getDate(...items)'],
  invalid: [],
});

// 17 edge tests
ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'if (true) { date.getUTCSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'while (true) { date.getUTCSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'for (let i = 0; i < 10; i++) { date.getUTCSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'switch (x) { case 1: date.getUTCSeconds(...items); break; }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'try { date.getUTCSeconds(...items); } catch (e) {}',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'function fn() { return date.getUTCSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'foo(date.getUTCSeconds(...items));',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const x = cond ? date.getUTCSeconds(...items) : 0;',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const x = date.getUTCSeconds(...items) || 0;',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const arr = [date.getUTCSeconds(...items)];',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const obj = { sec: date.getUTCSeconds(...items) };',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const s = `${date.getUTCSeconds(...items)}`;',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'class C { m() { date.getUTCSeconds(...items); } }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'async function fn() { date.getUTCSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'function* gen() { date.getUTCSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: '(function() { date.getUTCSeconds(...items); })();',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});

ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const { a } = { a: date.getUTCSeconds(...items) };',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});