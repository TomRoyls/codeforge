export const BEST_PRACTICES: Record<string, string[]> = {
  'consistent-imports': [
    'Pick one style: Decide between default vs named imports and stick to it',
    'Enforce via config: Use import ordering rules in your linter config',
    'Automate formatting: Use tools like organize-imports to keep imports tidy',
  ],
  curly: [
    'Always use braces: Prevents bugs when adding statements later',
    'Consistency matters: Mixed brace styles confuse readers',
    'Reduce merge conflicts: Braces make diffs cleaner in version control',
  ],
  'eq-eq-eq': [
    'Use strict equality: === checks both type and value',
    'Avoid type coercion: == performs unpredictable implicit conversions',
    'Be explicit: If you need coercion, write it explicitly',
  ],
  'explicit-return-type': [
    'Document intent: Return types serve as documentation for callers',
    'Catch mistakes: Explicit types catch accidental type changes',
    'Enforce contracts: Public APIs benefit from explicit return types',
  ],
  'max-complexity': [
    'Keep cyclomatic complexity low: Aim for under 10 per function',
    'One decision per function: Each function should handle one concern',
    'Use lookup tables: Replace complex if/else with data structures',
  ],
  'max-depth': [
    'Prefer flat code: Shallow code is easier to understand and test',
    'Use guard clauses: Check preconditions early and return',
    'Name things well: Good names make code self-documenting',
  ],
  'max-file-size': [
    'Keep files small: Large files are hard to navigate and maintain',
    'One concept per file: Group related functionality cohesively',
    'Split by responsibility: Separate concerns into dedicated modules',
  ],
  'max-lines': [
    'One file, one responsibility: Keep files focused and cohesive',
    'Testability matters: Smaller files are easier to test thoroughly',
    'Navigation ease: Developers can find code faster in smaller files',
  ],
  'max-lines-per-function': [
    'Functions should do one thing: Long functions hide complexity',
    'Extract helpers: Break long functions into smaller named pieces',
    'Improve readability: Shorter functions are easier to understand',
  ],
  'max-params': [
    'Keep functions focused: Each function should do one thing well',
    'Use descriptive names: Parameter names should indicate their purpose',
    'Consider immutability: Use readonly or const where appropriate',
  ],
  'max-union-size': [
    'Limit union members: Large unions make types hard to reason about',
    'Use discriminated unions: Group related types with a common field',
    'Refactor to objects: Replace large unions with more structured types',
  ],
  'no-alert': [
    'Use custom UI: Build proper notification components',
    'Non-blocking feedback: Alerts freeze the browser and annoy users',
    'Accessibility: Custom dialogs work better with screen readers',
  ],
  'no-array-constructor': [
    'Use literal syntax: [] is shorter, clearer, and safer',
    'Avoid edge cases: new Array(5) creates a sparse array',
    'Consistency: Array literals are the community standard',
  ],
  'no-await-in-loop': [
    'Batch async operations: Use Promise.all for independent operations',
    'Improve performance: Sequential awaits waste time in loops',
    'Structure for parallelism: Refactor loops into concurrent patterns',
  ],
  'no-barrel-imports': [
    'Import directly: Reference specific files instead of barrel files',
    'Reduce bundle size: Barrel files can pull in unused code',
    'Faster compilation: Direct imports avoid re-export chain lookups',
  ],
  'no-bitwise': [
    'Avoid confusion: Bitwise ops often indicate typos like | instead of ||',
    'Be explicit: Use boolean operators for logical comparisons',
    'Document intent: If bitwise is needed, add a clear comment',
  ],
  'no-caller': [
    'Never use arguments.callee: It breaks in strict mode',
    'Never use arguments.caller: It is non-standard and deprecated',
    'Use named functions: Named function expressions provide self-reference',
  ],
  'no-circular-deps': [
    'Design clear boundaries: Modules should form a directed acyclic graph',
    'Extract shared code: Move mutual dependencies to a third module',
    'Use dependency injection: Pass dependencies instead of importing them',
  ],
  'no-cond-assign': [
    'Avoid confusion: = in conditions looks like a typo for ===',
    'Use explicit assignment: Move assignments before the condition',
    'Be intentional: If deliberate, wrap in extra parentheses',
  ],
  'no-console': [
    'Production-ready logging: Use structured logging from the start',
    'Debugging tools: Use debug builds or flags instead of console',
    'Error handling: Let the caller decide how to handle errors',
  ],
  'no-console-log': [
    'Use proper logging: Replace console.log with a logging framework',
    'Remove debug code: Debug logs should not reach production',
    'Structured output: Log structured data, not arbitrary strings',
  ],
  'no-const-assign': [
    'Use const by default: Declare variables that do not change as const',
    'Use let for reassignment: Only use let when you must reassign',
    'Readability: const signals the variable will not change',
  ],
  'no-debugger': [
    'Remove before commit: Debugger statements should not be in production',
    'Use breakpoints: IDE debuggers are more powerful and flexible',
    'Add to git hooks: Prevent debugger statements from being committed',
  ],
  'no-delete-var': [
    'Never delete variables: It is disallowed in strict mode',
    'Set to undefined: If you must clear a value, assign undefined',
    'Use proper scoping: Design code so deletion is unnecessary',
  ],
  'no-dupe-keys': [
    'Check for duplicates: Duplicate keys in objects cause silent overwrites',
    'Use linting: Let tools catch duplicate keys automatically',
    'Review merge results: Object spreads can introduce duplicate keys',
  ],
  'no-duplicate-case': [
    'Review switch statements: Duplicate cases indicate a logic error',
    'Consolidate logic: Merge duplicate cases into a single case',
    'Use a map instead: Replace long switches with lookup tables',
  ],
  'no-duplicate-imports': [
    'Merge imports: Combine multiple imports from the same module',
    'Use auto-organize: IDE tools can merge import statements',
    'Clean imports: Review imports before committing changes',
  ],
  'no-else-return': [
    'Simplify control flow: Return early to avoid unnecessary else blocks',
    'Reduce nesting: Early returns flatten your function structure',
    'Improve readability: Less indentation makes code easier to scan',
  ],
  'no-empty': [
    'Add a comment: Empty blocks should explain why they are empty',
    'Handle explicitly: Empty catch blocks often hide real bugs',
    'Use throw or log: If intentional, document with a comment',
  ],
  'no-empty-catch': [
    'Handle errors: Empty catch blocks silently swallow problems',
    'At least log: If you must ignore, log the error for debugging',
    'Be specific: Catch specific errors instead of catching everything',
  ],
  'no-empty-function': [
    'Avoid stubs: Empty functions often indicate incomplete implementation',
    'Use noop utility: If intentional, create a named noop function',
    'Add a comment: Document why the function body is intentionally empty',
  ],
  'no-eval': [
    'Avoid dynamic code: Prefer static code that can be analyzed',
    'Validate input: Never trust user input to code execution paths',
    'Use safe alternatives: JSON.parse() for data, Function() is still risky',
  ],
  'no-explicit-any': [
    'Use proper types: Avoid any and define the expected shape',
    'Use unknown: If type is truly unknown, use unknown instead',
    'Gradual typing: Use type assertions to narrow from unknown',
  ],
  'no-fallthrough': [
    'Explicit break: Every case should end with break, return, or throw',
    'Document intentional fallthrough: Add a comment if deliberate',
    'Use eslint comment: Mark intentional fallthrough explicitly',
  ],
  'no-floating-promises': [
    'Always handle promises: Unhandled rejections can crash your app',
    'Use void operator: If intentionally floating, use void to signal it',
    'Add .catch(): Even fire-and-forget promises should handle errors',
  ],
  'no-implicit-coercion': [
    'Be explicit: Write Number(x) instead of +x or ~~x',
    'Readability: Explicit conversions communicate intent clearly',
    'Avoid surprises: Implicit coercion has confusing edge cases',
  ],
  'no-implied-eval': [
    'Avoid string execution: setTimeout with strings is like eval',
    'Use function references: Pass functions, not strings, to timers',
    'Security: String-based execution is a common attack vector',
  ],
  'no-irregular-whitespace': [
    'Use regular spaces only: Non-breaking spaces cause subtle bugs',
    'Check copy-paste: Irregular whitespace often comes from pasted text',
    'Configure editor: Enable whitespace visibility in your editor',
  ],
  'no-loop-func': [
    'Move functions out: Functions in loops create new closures per iteration',
    'Use let: Block scoping with let can fix some closure issues',
    'Extract to helper: Move the inner function outside the loop',
  ],
  'no-magic-numbers': [
    'Name constants: Replace raw numbers with named constants',
    'Document meaning: Every number should explain its significance',
    'Group related values: Use enums or config objects for sets of numbers',
  ],
  'no-misused-promises': [
    'Return values from conditions: Promises in boolean context are always true',
    'Handle void returns: Do not pass async functions where void is expected',
    'Use proper typing: Ensure promise-returning functions are awaited',
  ],
  'no-nested-ternary': [
    'Avoid deep nesting: Nested ternaries are hard to read and debug',
    'Use if/else: Convert complex ternaries to readable if statements',
    'Extract variables: Break complex expressions into named variables',
  ],
  'no-new-func': [
    'Avoid new Function: It is equivalent to eval and has same risks',
    'Use closures: Create functions dynamically with closures instead',
    'Prefer static code: Dynamically generated code is hard to debug',
  ],
  'no-non-null-assertion': [
    'Handle null properly: Check for null instead of asserting it away',
    'Use optional chaining: ?. operator safely handles null values',
    'Trust the type system: If a type includes null, respect it',
  ],
  'no-param-reassign': [
    'Treat params as read-only: Reassigning parameters confuses readers',
    'Use local variables: Create a new variable for the modified value',
    'Functional purity: Not reassigning params makes functions predictable',
  ],
  'no-promise-as-boolean': [
    'Always await first: A promise in a condition is always truthy',
    'Check the resolved value: Await the promise then check the result',
    'Avoid silent bugs: This pattern never does what you expect',
  ],
  'no-prototype-builtins': [
    'Use Object.hasOwn: Modern alternative to hasOwnProperty',
    'Avoid prototype lookup: Direct prototype methods can miss own props',
    'Safer access: Object methods work regardless of prototype chain',
  ],
  'no-redeclare': [
    'One declaration per name: Redeclaring variables is confusing',
    'Use block scope: Different blocks can have same-named variables',
    'Check imports: Redeclaration often comes from multiple import sources',
  ],
  'no-self-assign': [
    'Review assignments: Self-assignment is always a mistake or unnecessary',
    'Check variable names: Often a typo where a different name was intended',
    'Remove dead code: If intentional, it has no effect and should be removed',
  ],
  'no-shadow': [
    'Use unique names: Shadowed variables create confusion about scope',
    'Rename inner variables: Give inner variables descriptive, distinct names',
    'Avoid ambiguity: Readers should always know which variable is referenced',
  ],
  'no-sparse-arrays': [
    'Use explicit undefined: Replace holes with undefined for clarity',
    'Avoid empty slots: Sparse arrays behave unexpectedly with map and forEach',
    'Use Array.from: Create arrays of known size with explicit values',
  ],
  'no-throw-literal': [
    'Always throw Error objects: Error objects capture stack traces',
    'Use new Error: Throw new Error(msg) not throw msg',
    'Enable catch handling: Error objects support instanceof checks',
  ],
  'no-undef': [
    'Define before use: All variables must be declared before usage',
    'Check imports: Missing imports are the most common cause',
    'Check spelling: Typos in variable names trigger this rule',
  ],
  'no-unreachable': [
    'Remove dead code: Code after return, throw, or break never executes',
    'Review control flow: Unreachable code indicates a logic error',
    'Simplify: Remove the unreachable code or fix the control flow',
  ],
  'no-unsafe-assignment': [
    'Type unknown values: Avoid assigning any to typed variables',
    'Use type guards: Narrow types before assigning unknown values',
    'Validate external data: Validate input from APIs before assigning',
  ],
  'no-unsafe-call': [
    'Narrow types first: Ensure the value is callable before calling it',
    'Use type guards: Check the type before making a function call',
    'Avoid any: Values typed as any bypass type safety on calls',
  ],
  'no-unsafe-finally': [
    'Do not return in finally: It overrides return values in try/catch',
    'Do not throw in finally: It swallows exceptions from try/catch',
    'Keep finally simple: Use finally only for cleanup, not control flow',
  ],
  'no-unsafe-member-access': [
    'Check before access: Ensure the object has the expected shape',
    'Use optional chaining: ?. operator safely handles undefined values',
    'Avoid any: Member access on any bypasses all type checking',
  ],
  'no-unsafe-negation': [
    'Check your parens: Negating the condition instead of the value is a bug',
    'Use strict equality: !x === y is different from x !== y',
    'Review logic: Ensure you are negating the right expression',
  ],
  'no-unsafe-regex': [
    'Avoid catastrophic backtracking: Some patterns cause exponential matching',
    'Test with large inputs: Regex DoS can freeze your application',
    'Limit repetition: Avoid nested quantifiers like (a+)+ in patterns',
  ],
  'no-unsafe-return': [
    'Return correct types: Ensure return values match the declared type',
    'Avoid returning any: any return values bypass type safety for callers',
    'Use type guards: Narrow types before returning unknown values',
  ],
  'no-unsafe-type-assertion': [
    'Prefer type guards: Use type narrowing instead of forceful assertions',
    'Validate at runtime: Type assertions have no runtime effect',
    'Use unknown first: Narrow from unknown instead of any to target type',
  ],
  'no-unused-exports': [
    'Remove dead exports: Unused exported code adds maintenance burden',
    'Review before export: Only export what is consumed externally',
    'Use tree-shaking: But do not rely on it to mask unnecessary exports',
  ],
  'no-unused-vars': [
    'Remove unused declarations: Dead code adds noise and confusion',
    'Use underscore prefix: Prefix intentionally unused params with _',
    'Review destructuring: Unused destructured variables often indicate typos',
  ],
  'no-useless-concat': [
    'Use template literals: String concatenation with + is harder to read',
    'Avoid empty strings: Concatenating empty strings has no effect',
    'Simplify expressions: Merge adjacent string literals into one',
  ],
  'no-var': [
    'Use const by default: const prevents accidental reassignment',
    'Use let when needed: let provides proper block scoping',
    'Avoid hoisting surprises: var hoisting causes confusing bugs',
  ],
  'object-shorthand': [
    'Use shorthand properties: { name } instead of { name: name }',
    'Use shorthand methods: { foo() {} } instead of { foo: function() {} }',
    'Keep code concise: Shorthand syntax is the modern community standard',
  ],
  'prefer-array-find': [
    'Use .find(): Replaces filter with [0] pattern',
    'Clearer intent: find explicitly states you want one match',
    'Better performance: find stops at the first match',
  ],
  'prefer-array-flat': [
    'Use .flat(): Replaces manual flatten implementations',
    'Default depth 1: .flat() flattens one level by default',
    'Use .flat(Infinity): Flatten all levels with Infinity argument',
  ],
  'prefer-async-await': [
    'Use async/await: Cleaner than raw Promise chains',
    'Linear readability: async/await reads top-to-bottom like sync code',
    'Better error handling: try/catch works naturally with await',
  ],
  'prefer-at-method': [
    'Use .at(): Access array elements with negative indices',
    'Replace slice tricks: .at(-1) is cleaner than arr[arr.length - 1]',
    'Works on strings: .at() also works on string types',
  ],
  'prefer-const': [
    'Use const by default: Declare variables that do not change as const',
    'Prevents bugs: const prevents accidental reassignment',
    'Signals intent: const tells readers the value will not change',
  ],
  'prefer-date-now': [
    'Use Date.now(): Faster than new Date().getTime()',
    'No object creation: Date.now() returns a number directly',
    'Consistent style: One standard way to get the current timestamp',
  ],
  'prefer-default-export': [
    'One export per file: Modules with one export should use default',
    'Clearer imports: Default imports are shorter and more common',
    'Signal intent: Default export identifies the main module purpose',
  ],
  'prefer-for-of': [
    'Use for-of: Cleaner than indexed for loops for iteration',
    'No index needed: When you only need values, for-of is ideal',
    'Works with iterables: for-of works with any iterable, not just arrays',
  ],
  'prefer-function-type': [
    'Use function type: interface with single call signature can be simplified',
    'Use type keyword: type Fn = () => void instead of interface Fn',
    'Cleaner syntax: Function types are more concise than call-signature interfaces',
  ],
  'prefer-includes': [
    'Use .includes(): Replaces indexOf checks with clearer intent',
    'Boolean result: .includes() returns boolean directly',
    'Works with NaN: .includes() correctly finds NaN unlike indexOf',
  ],
  'prefer-nullish-coalescing': [
    'Use ??: Nullish coalescing handles null and undefined only',
    'Unlike ||: || treats 0 and empty string as falsy, ?? does not',
    'Safer defaults: ?? preserves valid falsy values like 0 and ""',
  ],
  'prefer-number-properties': [
    'Use Number.isNaN: Safer than global isNaN which coerces to number',
    'Use Number.isFinite: Unlike global isFinite, rejects non-numeric values',
    'Namespace consistency: Use Number methods over global functions',
  ],
  'prefer-object-has-own': [
    'Use Object.hasOwn: Modern replacement for hasOwnProperty',
    'Shorter syntax: Object.hasOwn(obj, key) is more concise',
    'Safer: Works with objects created with null as prototype',
  ],
  'prefer-readonly': [
    'Mark immutable properties: Use readonly for properties that never change',
    'Prevent mutations: Readonly properties catch accidental writes at compile time',
    'Document intent: Readonly signals that a value should not be modified',
  ],
  'prefer-rest-params': [
    'Use rest parameters: ...args instead of the arguments object',
    'Real array: Rest params are actual arrays, not array-like',
    'Works with arrow functions: arguments is unavailable in arrows',
  ],
  'prefer-spread': [
    'Use spread operator: ... instead of Function.prototype.apply',
    'Works with any iterable: Spread works with sets, maps, and strings',
    'Cleaner syntax: [...arr] is more readable than Array.from(arr)',
  ],
  'prefer-string-replace-all': [
    'Use .replaceAll(): Replaces all occurrences without regex tricks',
    'No regex needed: .replaceAll() uses plain string matching',
    'Clearer intent: The name explicitly states all matches are replaced',
  ],
  'prefer-template': [
    'Use template literals: Backtick strings for concatenation and interpolation',
    'Multiline support: Template literals span multiple lines naturally',
    // eslint-disable-next-line no-template-curly-in-string
    'Expression interpolation: Embed expressions directly with ${expr}',
  ],
  'require-await': [
    'Remove async if unused: Functions without await do not need async',
    'Avoid unnecessary promises: Async functions always return a promise',
    'Keep it simple: Only mark functions async when they truly await',
  ],
  'require-return-type': [
    'Explicit returns: Exported functions should declare return types',
    'API contracts: Return types serve as documentation for callers',
    'Catch mistakes: Explicit types catch accidental return type changes',
  ],
  'restrict-template-expressions': [
    'Type template values: Only allow specific types in template expressions',
    'Avoid toString surprises: Objects in templates use their toString method',
    'Explicit conversion: Use String() or .toString() intentionally',
  ],
  'sort-keys': [
    'Sort object keys: Alphabetical ordering makes keys easy to find',
    'Reduce diff noise: Sorted keys produce cleaner git diffs',
    'Consistent style: Everyone writes keys in the same order',
  ],
  'strict-boolean-expressions': [
    'Be explicit in conditions: Do not rely on truthy and falsy coercion',
    'Check for null explicitly: if (x !== null) instead of if (x)',
    'Handle edge cases: 0, empty string, and NaN may be valid values',
  ],
  'use-isnan': [
    'Use Number.isNaN: The only reliable way to check for NaN',
    'NaN is not equal to itself: x === NaN always returns false',
    'Check with isNaN: if (Number.isNaN(x)) instead of if (x === NaN)',
  ],
  'valid-typeof': [
    'Compare to valid strings: typeof only returns specific string values',
    'Avoid typos: typeof x === "strng" is always false',
    'Use as const: Store comparison strings in constants to catch typos',
  ],
}
