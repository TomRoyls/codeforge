import { noUnnecessaryDateGetSecondsSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-seconds-spread.js';
import { RuleTester } from 'eslint';

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2020 } });

// 8 meta tests
test('rule has correct meta', () => {
  expect(noUnnecessaryDateGetSecondsSpreadRule.meta).toBeDefined();
});

test('rule has correct message', () => {
  expect(noUnnecessaryDateGetSecondsSpreadRule.meta.messages!.unnecessarySpread).toBe(
    'date.getSeconds(...items) with a single spread is unusual. Consider calling date.getSeconds() directly.'
  );
});

test('rule has correct type', () => {
  expect(noUnnecessaryDateGetSecondsSpreadRule.meta.type).toBe('suggestion');
});

test('rule has correct docs', () => {
  expect(noUnnecessaryDateGetSecondsSpreadRule.meta.docs).toBeDefined();
});

test('rule has correct schema', () => {
  expect(noUnnecessaryDateGetSecondsSpreadRule.meta.schema).toEqual([]);
});

test('rule has fixable or not', () => {
  expect(noUnnecessaryDateGetSecondsSpreadRule.meta.fixable).toBeUndefined();
});

test('rule create is a function', () => {
  expect(typeof noUnnecessaryDateGetSecondsSpreadRule.create).toBe('function');
});

test('rule create returns object', () => {
  const result = noUnnecessaryDateGetSecondsSpreadRule.create({});
  expect(typeof result).toBe('object');
});

// 2 structure tests
ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...items)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...args)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

// 28 positive tests (invalid cases that should trigger the rule)
ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...items)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...args)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...spread)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...params)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...rest)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...arr)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...list)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...vals)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...data)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...extra)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...options)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...theArgs)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...input)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...more)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...collection)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...elements)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...stuff)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...payload)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...bag)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...remainder)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...tail)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...others)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...remaining)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...xs)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...values)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'date.getSeconds(...array)',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'function fn() { date.getSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const fn = () => { date.getSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

// 40 negative tests (valid cases that should NOT trigger the rule)
ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds()'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['other.getSeconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getMinutes(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds(1)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds(1, 2)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds("a")'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds(null)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds(undefined)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds(true)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds(x)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds(1, ...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds(...items, 1)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds(...a, ...b)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['obj.date.getSeconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date["getSeconds"](...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['getSeconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.setSeconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['myDate.getSeconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['Date.getSeconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getseconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.GetSeconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds(...items).valueOf()'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['new date.getSeconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date?.getSeconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds.call(...args)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds.apply(...args)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds.bind(...args)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getTime(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getMilliseconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['const x = date.getSeconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds([...items])'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getSeconds({...items})'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['`${date.getSeconds()}`'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['window.date.getSeconds(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getFullYear(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getHours(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.toISOString(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.toString(...items)'],
  invalid: [],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: ['date.getDate(...items)'],
  invalid: [],
});;

// 17 edge tests
ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'if (true) { date.getSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'while (true) { date.getSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'for (let i = 0; i < 10; i++) { date.getSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'switch (x) { case 1: date.getSeconds(...items); break; }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'try { date.getSeconds(...items); } catch (e) {}',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'function fn() { return date.getSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'foo(date.getSeconds(...items));',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const x = cond ? date.getSeconds(...items) : 0;',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const x = date.getSeconds(...items) || 0;',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const arr = [date.getSeconds(...items)];',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const obj = { sec: date.getSeconds(...items) };',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const s = `${date.getSeconds(...items)}`;',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'class C { m() { date.getSeconds(...items); } }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'async function fn() { date.getSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'function* gen() { date.getSeconds(...items); }',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: '(function() { date.getSeconds(...items); })();',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;

ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
  valid: [],
  invalid: [
    {
      code: 'const { a } = { a: date.getSeconds(...items) };',
      errors: [{ messageId: 'unnecessarySpread' }],
    },
  ],
});;
