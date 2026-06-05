export const COMMON_VIOLATIONS: Record<string, string[]> = {
  'consistent-imports': [
    'Mixing default and named import styles for the same module',
    'Some files using import { x } while others use import x from',
    'Inconsistent import ordering across the codebase',
  ],
  curly: [
    'Single-line if without braces - risk when adding lines later',
    'Missing braces on else clause after braced if statement',
    'Mixed brace styles: some statements with, some without braces',
  ],
  'eq-eq-eq': [
    'Using == to compare different types - relies on implicit coercion',
    'Comparing to null with == - catches both null and undefined',
    'Comparing to undefined with == - often a typo for strict equality',
  ],
  'explicit-return-type': [
    'Exported function with no return type annotation specified',
    'Arrow function in module scope with inferred but complex return type',
    'Method returning a complex type that should be explicitly documented',
  ],
  'max-complexity': [
    'Function with too many branches - extract to helper functions',
    'Long switch statement with many cases - use a lookup table',
    'Nested conditions and loops driving complexity too high',
  ],
  'max-depth': [
    'Nested if statements too deep - extract to helper functions',
    'Nested loops indicate complex logic - consider early returns',
    'Deep callback nesting - use async/await or named functions',
  ],
  'max-file-size': [
    'File exceeds size limit - split into focused modules',
    'Utility file grew too large - group by feature instead',
    'Mixed concerns in one file - separate responsibilities',
  ],
  'max-lines': [
    'File is too long - split into smaller modules',
    'Function is too long - extract helper functions',
    'Class is too long - consider separation of concerns',
  ],
  'max-lines-per-function': [
    'Function body exceeds line limit - extract helper functions',
    'Too much logic in one function - break into smaller pieces',
    'Long setup and teardown code - extract setup and cleanup helpers',
  ],
  'max-params': [
    'Function has too many parameters - consider using an options object',
    'Constructor has too many parameters - consider builder pattern',
    'Method has many parameters for simple operations - split into smaller methods',
  ],
  'max-union-size': [
    'Union type has too many members - refactor to a discriminated union',
    'String union grew beyond limit - consider an enum instead',
    'Complex union making type checking difficult - simplify the type',
  ],
  'no-alert': [
    'alert() used for user notifications - use a toast component',
    'confirm() used for user choices - use a modal dialog',
    'prompt() used for user input - use a form component',
  ],
  'no-array-constructor': [
    'new Array() used instead of array literal syntax []',
    'new Array(1, 2, 3) instead of [1, 2, 3]',
    'new Array(5) creating a sparse array unintentionally',
  ],
  'no-await-in-loop': [
    'await inside a for loop - use Promise.all for independent operations',
    'Sequential API calls in a loop - batch them concurrently',
    'await in forEach callback - use for-of or Promise.all',
  ],
  'no-barrel-imports': [
    'Importing from index.ts barrel file - import from the source module',
    'Re-exporting everything through a barrel file - import directly',
    'Deep import via barrel file causing unnecessary module loading',
  ],
  'no-bitwise': [
    'Using | instead of || for logical OR - likely a typo',
    'Using & instead of && for logical AND - likely a typo',
    'Using ^ when && was intended - bitwise XOR is rarely needed',
  ],
  'no-caller': [
    'arguments.callee used for recursion - use named function expressions',
    'arguments.caller used to inspect the call stack - remove this usage',
    'Strict mode violation: arguments.callee is not allowed',
  ],
  'no-circular-deps': [
    'Module A imports B which imports A back - extract shared code',
    'Circular import chain through multiple modules - restructure',
    'Two-way imports causing initialization order issues',
  ],
  'no-cond-assign': [
    'Assignment in if condition - likely meant === comparison',
    'Variable assigned inside while condition - confusing to read',
    'Assignment in ternary condition - use separate statement',
  ],
  'no-console': [
    'console.log used for debugging - remove or use proper logger',
    'console.error for error handling - throw errors or use error handling',
    'console.warn for warnings - use structured logging',
    'console.log left in production code - remove debug statements',
    'console.log for error reporting - use proper error handling',
    'console.log for performance timing - use performance API',
  ],
  'no-const-assign': [
    'Reassigning a const variable - change to let if reassignment needed',
    'Modifying a const-declared variable - use let instead',
    'Push to const array is fine - but full reassignment is not',
  ],
  'no-debugger': [
    'debugger statement left in code - remove before committing',
    'debugger used instead of IDE breakpoints - use proper tools',
    'debugger in catch block - use proper error logging instead',
  ],
  'no-delete-var': [
    'delete used on a variable - variables cannot be deleted',
    'delete on function parameter - restructure to avoid this',
    'delete used in strict mode - it throws or does nothing',
  ],
  'no-dupe-keys': [
    'Object literal has duplicate key - second one silently overwrites first',
    'Spread creates duplicate keys - check object merge logic',
    'Computed property collides with existing key - review names',
  ],
  'no-duplicate-case': [
    'Switch statement has two identical case labels - merge them',
    'Duplicate case after refactoring - forgot to remove old one',
    'Case label matches the default - remove the duplicate case',
  ],
  'no-duplicate-imports': [
    'Multiple import statements from the same module - merge them',
    'Separate type and value imports from same path - combine',
    'Import added at different locations in the file - consolidate',
  ],
  'no-else-return': [
    'else block after an if that returns - unnecessary else block',
    'if-else chain where each branch returns - remove else keywords',
    'Guard clause followed by else - remove else, reduce nesting',
  ],
  'no-empty': [
    'Empty block statement with no code - add implementation or comment',
    'Empty if body - likely a logic error or missing implementation',
    'Empty switch case - use comment to indicate intentional fallthrough',
  ],
  'no-empty-catch': [
    'Empty catch block swallows errors silently - add error handling',
    'catch block with no code - at minimum log the error',
    'Catching error but ignoring it - handle or re-throw',
  ],
  'no-empty-function': [
    'Function with empty body - likely needs implementation',
    'Callback function with no code - remove or add a comment',
    'Class method with empty body - mark as abstract or implement',
  ],
  'no-eval': [
    'eval() used to parse JSON - use JSON.parse() instead',
    'new Function() used for dynamic templates - use template literals',
    'eval() used for computation - write the expression directly',
  ],
  'no-explicit-any': [
    'Parameter typed as any - define the expected shape',
    'Return type is any - specify the actual return type',
    'Variable declared as any - use unknown or a proper type',
  ],
  'no-fallthrough': [
    'Switch case without break - execution falls to next case',
    'Missing break after case block - add break or comment',
    'Intentional fallthrough without comment - add a comment',
  ],
  'no-floating-promises': [
    'Promise without .then() or await - error is silently lost',
    'Async function called without await - result is ignored',
    'Promise returned but not awaited in calling code',
  ],
  'no-implicit-coercion': [
    'Using +x to convert to number - use Number(x) explicitly',
    'Using !!x to convert to boolean - use Boolean(x) explicitly',
    'Using x + "" to convert to string - use String(x) explicitly',
  ],
  'no-implied-eval': [
    'setTimeout with string argument - pass a function instead',
    'setInterval with string argument - use a function reference',
    'new Function() for dynamic code - use closures instead',
  ],
  'no-irregular-whitespace': [
    'Non-breaking space (U+00A0) in code - replace with regular space',
    'Zero-width space in string literal - invisible but causes bugs',
    'Full-width space from copy-paste - use regular ASCII space',
  ],
  'no-loop-func': [
    'Function created inside a loop that closes over loop variable',
    'Callback defined in loop body capturing mutable variable',
    'Arrow function in loop referencing let variable - extract it',
  ],
  'no-magic-numbers': [
    'Raw number in condition without explanation - name it',
    'Numeric literal in business logic - extract to named constant',
    'Array index with magic number - use named constant or enum',
  ],
  'no-misused-promises': [
    'Promise passed to a boolean condition - always evaluates to true',
    'Async function used where a synchronous callback is expected',
    'Promise returned from a non-async function signature',
  ],
  'no-nested-ternary': [
    'Ternary inside another ternary - use if/else or extract variable',
    'Chained ternaries for multi-way condition - use a lookup or switch',
    'Nested ternary making line too long - extract helper function',
  ],
  'no-new-func': [
    'new Function() used for dynamic code - equivalent to eval',
    'Function constructor building code from strings - use closures',
    'new Function() for template evaluation - use template literals',
  ],
  'no-non-null-assertion': [
    'Using ! postfix to assert a value is non-null - check instead',
    'Non-null assertion on a possibly undefined value - use optional chain',
    'Asserting ! on optional property - handle the undefined case',
  ],
  'no-param-reassign': [
    'Directly modifying a function parameter - use a local variable',
    'Mutating properties of a parameter object - clone first',
    'Reassigning parameter to change type - use a new variable',
  ],
  'no-promise-as-boolean': [
    'Using promise directly in an if condition - await it first',
    'Passing promise to a function expecting boolean - await and pass result',
    'Negating a promise with ! operator - always false',
  ],
  'no-prototype-builtins': [
    'obj.hasOwnProperty() called directly - use Object.hasOwn instead',
    'Object.prototype.hasOwnProperty.call() - use Object.hasOwn',
    'obj.isPrototypeOf() called directly - use Object methods',
  ],
  'no-redeclare': [
    'Variable declared twice in the same scope - rename one',
    'Function and variable with the same name - use different names',
    'Re-importing a name that was already imported - remove duplicate',
  ],
  'no-self-assign': [
    'Variable assigned to itself - likely a typo in the variable name',
    'Property assigned to itself in destructuring - check variable names',
    'Self-assignment in a loop - remove the useless statement',
  ],
  'no-shadow': [
    'Inner variable has same name as outer variable - rename inner one',
    'Catch parameter shadows outer variable - use different name like err',
    'Loop variable shadows function parameter - use distinct names',
  ],
  'no-sparse-arrays': [
    'Array literal with empty slot like [1,,3] - use undefined explicitly',
    'Trailing comma creating sparse array - remove extra comma',
    'Array constructor with gaps - fill with undefined or use literal',
  ],
  'no-throw-literal': [
    'Throwing a string instead of an Error object - use new Error()',
    'Throwing a number or boolean - throw an Error instance instead',
    'Throwing undefined - create a proper Error with a message',
  ],
  'no-undef': [
    'Using a variable that was never declared - check spelling',
    'Missing import for an identifier used in the file',
    'Referencing a global that is not in the config globals list',
  ],
  'no-unreachable': [
    'Code after a return statement - remove the dead code',
    'Statement after throw in catch block - move above the throw',
    'Code after break in switch case - remove or restructure',
  ],
  'no-unsafe-assignment': [
    'Assigning any value to a typed variable - validate first',
    'Destructuring from an untyped source into typed variables',
    'Assigning result of any-typed function to a specific type',
  ],
  'no-unsafe-call': [
    'Calling a value typed as any - narrow the type first',
    'Invoking a function from an untyped import - add type declaration',
    'Calling method on an any-typed variable - type the variable',
  ],
  'no-unsafe-finally': [
    'Return statement inside finally block - overrides try return value',
    'Throw statement inside finally block - swallows try exceptions',
    'Break or continue in finally - unexpected control flow',
  ],
  'no-unsafe-member-access': [
    'Accessing property on a value typed as any - narrow the type',
    'Dot access on unknown value without type checking',
    'Chained member access on any-typed intermediate value',
  ],
  'no-unsafe-negation': [
    'Negating the comparison result instead of the operand - fix parens',
    '!key in object instead of !(key in object) - incorrect precedence',
    '!x instanceof Class instead of !(x instanceof Class)',
  ],
  'no-unsafe-regex': [
    'Regex with nested quantifiers like (a+)+ - causes exponential backtracking',
    'Pattern with overlapping alternatives causing catastrophic backtracking',
    'Complex regex that could hang on certain input strings',
  ],
  'no-unsafe-return': [
    'Returning an any-typed value from a typed function - cast safely',
    'Function returns untyped data without proper type narrowing',
    'Returning value from untyped source without validation',
  ],
  'no-unsafe-type-assertion': [
    'Force casting between unrelated types - use type guards instead',
    'as unknown as T double assertion - restructure to avoid this',
    'Type assertion overriding a null check - handle null properly',
  ],
  'no-unused-exports': [
    'Exported function never imported by any other module - remove it',
    'Exported type not used outside its declaration file - make it private',
    'Re-exported symbol that no consumer actually imports',
  ],
  'no-unused-vars': [
    'Declared variable never read - remove or prefix with underscore',
    'Import that is never used in the file - remove the import',
    'Destructured value that is never referenced - remove from pattern',
  ],
  'no-useless-concat': [
    'Concatenating two string literals - merge into one string',
    'Joining strings with + when template literal is clearer',
    'Concatenating empty string - has no effect, remove it',
  ],
  'no-var': [
    'var declaration found - replace with const or let',
    'var used in a for loop - use let for the loop variable',
    'var at function top level - use const or let with block scope',
  ],
  'object-shorthand': [
    '{ x: x } instead of { x } - use shorthand property syntax',
    '{ method: function() {} } instead of { method() {} }',
    '{ compute: compute } instead of { compute } - use shorthand',
  ],
  'prefer-array-find': [
    'arr.filter(x => condition)[0] - use arr.find(x => condition)',
    'Checking length after filter to get first match - use find',
    'Manual loop to find first matching element - use .find()',
  ],
  'prefer-array-flat': [
    'Using reduce + concat to flatten - use .flat() instead',
    'Manual flatten implementation with loops - use .flat()',
    'Spread inside concat for flattening - use .flat() directly',
  ],
  'prefer-async-await': [
    'Using .then() chain instead of async/await syntax',
    'Nested .then() callbacks - refactor to async/await',
    'Promise constructor wrapping an async operation - use async function',
  ],
  'prefer-at-method': [
    'arr[arr.length - 1] to get last element - use arr.at(-1)',
    'Using slice to get last element - use .at(-1)',
    'Manual index calculation for nth-from-last - use .at(-n)',
  ],
  'prefer-const': [
    'Variable declared with let but never reassigned - use const',
    'Loop variable declared with let but never modified - use const',
    'let used for values that only need to be set once - use const',
  ],
  'prefer-date-now': [
    'new Date().getTime() instead of Date.now() - use Date.now()',
    'new Date().valueOf() for timestamp - use Date.now()',
    'Number(new Date()) for timestamp - use Date.now()',
  ],
  'prefer-default-export': [
    'Named export as sole export in module - use default export',
    'File with one main export plus utility types - default the main one',
    'Single function exported with named export - make it default',
  ],
  'prefer-for-of': [
    'Using indexed for loop to iterate array - use for-of',
    'for loop with array index only to access elements - use for-of',
    'forEach with manual index tracking - use for-of with entries()',
  ],
  'prefer-function-type': [
    'Interface with single call signature - use type alias instead',
    'interface Foo { (): string } - use type Foo = () => string',
    'Call signature in interface when function type is simpler',
  ],
  'prefer-includes': [
    'arr.indexOf(x) !== -1 - use arr.includes(x)',
    'arr.indexOf(x) > -1 - use arr.includes(x)',
    'String.prototype.indexOf check for substring - use .includes()',
  ],
  'prefer-nullish-coalescing': [
    'Using || for default when value could be 0 or "" - use ??',
    'x != null ? x : default instead of x ?? default',
    'Checking undefined and null separately instead of using ??',
  ],
  'prefer-number-properties': [
    'isNaN() global function used - use Number.isNaN() instead',
    'isFinite() global function used - use Number.isFinite()',
    'parseInt() without radix - always specify the radix argument',
  ],
  'prefer-object-has-own': [
    'Object.prototype.hasOwnProperty.call(obj, key) - use Object.hasOwn',
    'obj.hasOwnProperty(key) - use Object.hasOwn(obj, key)',
    'Manual hasOwnProperty check - use Object.hasOwn',
  ],
  'prefer-readonly': [
    'Property that is only set in constructor - mark as readonly',
    'Public property never modified after initialization - add readonly',
    'Mutable property that should be immutable - use readonly modifier',
  ],
  'prefer-rest-params': [
    'Using arguments object in a function - use ...args rest params',
    'Array.from(arguments) to get real array - use ...args',
    'Accessing arguments.length for variadic functions - use rest params',
  ],
  'prefer-spread': [
    'Function.prototype.apply(context, args) - use func(...args)',
    'Array.prototype.concat to merge arrays - use spread [...a, ...b]',
    'Array.from(iterable) when spread works - use [...iterable]',
  ],
  'prefer-string-replace-all': [
    'Using .replace() with /g regex for replacing all - use .replaceAll()',
    'Splitting and joining to replace all occurrences - use .replaceAll()',
    'While loop calling .replace() until no matches - use .replaceAll()',
  ],
  'prefer-template': [
    'String concatenation with + operator - use template literals',
    'Array join to build a string - use template literal',
    'Concatenating variables and strings with + - use backtick interpolation',
  ],
  'require-await': [
    'Async function with no await inside - remove async keyword',
    'Async arrow function that does not use await - make it sync',
    'Marked async but only returns a value directly - remove async',
  ],
  'require-return-type': [
    'Exported function missing return type annotation - add the type',
    'Public method without explicit return type - declare it',
    'Arrow function in module boundary without return type',
  ],
  'restrict-template-expressions': [
    'Object interpolated in template without toString control',
    'any-typed value in template expression - narrow the type',
    'Complex object in template producing [object Object] - convert first',
  ],
  'sort-keys': [
    'Object properties not in alphabetical order - sort them',
    'Keys added at different times in random order - reorder',
    'Inconsistent key ordering across similar objects',
  ],
  'strict-boolean-expressions': [
    'Using truthy check for nullable type - use explicit null check',
    'if (value) when value could be 0 or empty string - be explicit',
    'Treating array or object as boolean - check .length or specific prop',
  ],
  'use-isnan': [
    'Comparing directly to NaN with === - always false, use isNaN',
    'x === NaN in a condition - use Number.isNaN(x) instead',
    'Using NaN in a switch case - use Number.isNaN to check',
  ],
  'valid-typeof': [
    'Comparing typeof result to a misspelled string like "strng"',
    'typeof x === "numer" instead of "number" - typo in comparison',
    'typeof compared to a value that is not a valid typeof result',
  ],
}
