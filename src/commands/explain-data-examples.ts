export interface RuleExample {
  bad: string
  description: string
  good: string
}

export const examplesMap: Record<string, RuleExample[]> = {
  'consistent-imports': [
    {
      bad: 'import foo from "./mod";\nimport { bar } from "./mod";',
      description: 'Mixing default and named import styles for the same module',
      good: 'import foo, { bar } from "./mod";',
    },
  ],
  curly: [
    {
      bad: 'if (condition) doSomething();',
      description: 'Omitting curly braces from control flow bodies',
      good: 'if (condition) {\n  doSomething();\n}',
    },
  ],
  'eq-eq-eq': [
    {
      bad: 'if (value == "hello") {\n  console.log("matched");\n}',
      description: 'Using loose equality (==) which triggers type coercion',
      good: 'if (value === "hello") {\n  console.log("matched");\n}',
    },
  ],
  'max-complexity': [
    {
      bad: 'function classify(x: number) {\n  if (x > 0) {\n    if (x < 10) {\n      if (x % 2 === 0) return "small-even";\n      else return "small-odd";\n    } else {\n      if (x < 100) return "medium";\n      else return "large";\n    }\n  }\n  return "non-positive";\n}',
      description: 'A function with high cyclomatic complexity',
      good: 'function classify(x: number): string {\n  if (x <= 0) return "non-positive";\n  if (x < 10) return x % 2 === 0 ? "small-even" : "small-odd";\n  return x < 100 ? "medium" : "large";\n}',
    },
  ],
  'max-params': [
    {
      bad: 'function createUser(name: string, age: number, email: string, role: string, active: boolean) {\n  // ...\n}',
      description: 'A function with too many parameters',
      good: 'interface UserOptions {\n  name: string;\n  age: number;\n  email: string;\n  role: string;\n  active: boolean;\n}\n\nfunction createUser(options: UserOptions) {\n  // ...\n}',
    },
  ],
  'no-alert': [
    {
      bad: 'function onSubmit() {\n  alert("Form submitted!");\n}',
      description: 'Using alert() for user notifications',
      good: 'function onSubmit() {\n  toast.success("Form submitted!");\n}',
    },
  ],
  'no-await-in-loop': [
    {
      bad: 'for (const url of urls) {\n  const data = await fetch(url);\n  processData(data);\n}',
      description: 'Awaiting inside a loop sequentially',
      good: 'const results = await Promise.all(urls.map(url => fetch(url)));\nresults.forEach(data => processData(data));',
    },
  ],
  'no-circular-deps': [
    {
      bad: '// a.ts\nimport { b } from "./b";\nexport const a = b;\n\n// b.ts\nimport { a } from "./a";\nexport const b = a;',
      description: 'Two modules importing from each other creating a cycle',
      good: '// shared.ts\nexport const shared = "value";\n\n// a.ts\nimport { shared } from "./shared";\nexport const a = shared;',
    },
  ],
  'no-console-log': [
    {
      bad: 'function calculate() {\n  console.log("Calculating...");\n  return 42;\n}',
      description: 'Using console.log in production code',
      good: 'function calculate() {\n  // Use proper logging library\n  logger.info("Calculating...");\n  return 42;\n}',
    },
  ],
  'no-constant-condition': [
    {
      bad: 'if (true) {\n  doSomething();\n}',
      description: 'Using a constant value in a conditional',
      good: 'const shouldProceed = checkCondition();\nif (shouldProceed) {\n  doSomething();\n}',
    },
  ],
  'no-debugger': [
    {
      bad: 'function process(data: string) {\n  debugger;\n  return data.trim();\n}',
      description: 'Leftover debugger statement in source code',
      good: 'function process(data: string) {\n  return data.trim();\n}',
    },
  ],
  'no-duplicate-imports': [
    {
      bad: 'import { add } from "./math";\nimport { subtract } from "./math";',
      description: 'Importing the same module multiple times',
      good: 'import { add, subtract } from "./math";',
    },
  ],
  'no-empty': [
    {
      bad: 'try {\n  doSomething();\n} catch (e) {\n}',
      description: 'An empty catch block with no error handling',
      good: 'try {\n  doSomething();\n} catch (e) {\n  logger.error("Operation failed", e);\n}',
    },
  ],
  'no-eval': [
    {
      bad: 'const code = "return 1 + 1";\nconst result = eval(code);',
      description: 'Using eval() to execute code strings',
      good: 'const result = 1 + 1;',
    },
    {
      bad: 'const sum = new Function("a", "b", "return a + b");',
      description: 'Using Function() constructor',
      good: 'function sum(a: number, b: number) {\n  return a + b;\n}',
    },
  ],
  'no-explicit-any': [
    {
      bad: 'function process(data: any) {\n  return data.value;\n}',
      description: 'Using any type which bypasses type checking',
      good: 'function process(data: { value: string }) {\n  return data.value;\n}',
    },
  ],
  'no-fallthrough': [
    {
      bad: 'switch (action) {\n  case "start":\n    engine.start();\n  case "stop":\n    engine.stop();\n    break;\n}',
      description: 'Missing break statement causing fallthrough',
      good: 'switch (action) {\n  case "start":\n    engine.start();\n    break;\n  case "stop":\n    engine.stop();\n    break;\n}',
    },
  ],
  'no-floating-promises': [
    {
      bad: 'function handleSave() {\n  saveData(); // promise not awaited\n}',
      description: 'Calling an async function without handling the promise',
      good: 'async function handleSave() {\n  await saveData();\n}',
    },
  ],
  'no-implicit-coercion': [
    {
      bad: 'const num = +"42";\nconst str = 42 + "";\nconst bool = !!value;',
      description: 'Using shorthand type coercion operators',
      good: 'const num = Number("42");\nconst str = String(42);\nconst bool = Boolean(value);',
    },
  ],
  'no-implied-eval': [
    {
      bad: String.raw`setTimeout("console.log(\"done\")", 1000);`,
      description: 'Passing a string to setTimeout instead of a function',
      good: 'setTimeout(() => console.log("done"), 1000);',
    },
  ],
  'no-nested-ternary': [
    {
      bad: 'const label = x > 0 ? (x > 10 ? "large" : "small") : "negative";',
      description: 'Nested ternary expressions that are hard to read',
      good: 'const label = getLabel(x);\n\nfunction getLabel(x: number): string {\n  if (x > 10) return "large";\n  if (x > 0) return "small";\n  return "negative";\n}',
    },
  ],
  'no-non-null-assertion': [
    {
      bad: 'const user = users.find(u => u.id === id)!;\nconsole.log(user.name);',
      description: 'Using non-null assertion without proper null check',
      good: 'const user = users.find(u => u.id === id);\nif (user) {\n  console.log(user.name);\n}',
    },
  ],
  'no-param-reassign': [
    {
      bad: 'function addItem(list: string[], item: string) {\n  list.push(item);\n}',
      description: 'Mutating a function parameter directly',
      good: 'function addItem(list: readonly string[], item: string): string[] {\n  return [...list, item];\n}',
    },
  ],
  'no-shadow': [
    {
      bad: 'const count = 5;\nfunction process() {\n  const count = 10;\n  return count;\n}',
      description: 'Inner variable shadowing an outer scope variable',
      good: 'const count = 5;\nfunction process() {\n  const innerCount = 10;\n  return innerCount;\n}',
    },
  ],
  'no-throw-literal': [
    {
      bad: 'throw "Something went wrong";',
      description: 'Throwing a string literal instead of an Error object',
      good: 'throw new Error("Something went wrong");',
    },
  ],
  'no-unsafe-regex': [
    {
      bad: 'const pattern = /(a+)+$/;',
      description: 'A regex vulnerable to catastrophic backtracking',
      good: 'const pattern = /a+$/;',
    },
  ],
  'no-unused-vars': [
    {
      bad: 'function process(data: string) {\n  const result = data.toUpperCase();\n  // result is never used\n}',
      description: 'Declaring variables that are never used',
      good: 'function process(data: string) {\n  return data.toUpperCase();\n}',
    },
  ],
  'no-var': [
    {
      bad: 'var message = "hello";\nvar count = 0;',
      description: 'Using var declarations instead of const/let',
      good: 'const message = "hello";\nconst count = 0;',
    },
  ],
  'object-shorthand': [
    {
      bad: 'const name = "Alice";\nconst user = { name: name, greet: function() { return "hi"; } };',
      description: 'Using verbose property and method syntax',
      good: 'const name = "Alice";\nconst user = { name, greet() { return "hi"; } };',
    },
  ],
  'prefer-arrow-callback': [
    {
      bad: 'const doubled = nums.map(function (n) {\n  return n * 2;\n});',
      description: 'Using function expression as a callback',
      good: 'const doubled = nums.map((n) => n * 2);',
    },
  ],
  'prefer-const': [
    {
      bad: 'let name = "Alice";\nconsole.log(name);',
      description: 'Using let for variables that are never reassigned',
      good: 'const name = "Alice";\nconsole.log(name);',
    },
    {
      bad: 'let count = 0;\nfor (let i = 0; i < 10; i++) {\n  count++;\n}',
      description: 'Using let for variables that are reassigned',
      good: 'const count = Array.from({ length: 10 }, (_, i) => i + 1).length;',
    },
  ],
  'prefer-includes': [
    {
      bad: 'if (fruits.indexOf("apple") !== -1) {\n  console.log("found");\n}',
      description: 'Using indexOf to check for membership',
      good: 'if (fruits.includes("apple")) {\n  console.log("found");\n}',
    },
  ],
  'prefer-nullish-coalescing': [
    {
      bad: 'const port = config.port || 3000;',
      description: 'Using || which treats 0 and "" as falsy',
      good: 'const port = config.port ?? 3000;',
    },
  ],
  'prefer-optional-chain': [
    {
      bad: 'const street = user && user.address && user.address.street;',
      description: 'Manually checking each level of property access',
      good: 'const street = user?.address?.street;',
    },
  ],
  'prefer-readonly': [
    {
      bad: 'function getItems(): string[] {\n  return ["a", "b", "c"];\n}',
      description: 'Returning a mutable array from a non-mutating function',
      good: 'function getItems(): readonly string[] {\n  return ["a", "b", "c"] as const;\n}',
    },
  ],
  'prefer-rest-params': [
    {
      bad: 'function sum() {\n  return Array.from(arguments).reduce((a, b) => a + b, 0);\n}',
      description: 'Using the arguments object instead of rest parameters',
      good: 'function sum(...nums: number[]): number {\n  return nums.reduce((a, b) => a + b, 0);\n}',
    },
  ],
  'prefer-template': [
    {
      bad: 'const greeting = "Hello, " + name + "! You are " + age + " years old.";',
      description: 'Concatenating strings with the + operator',
      // eslint-disable-next-line no-template-curly-in-string
      good: 'const greeting = `Hello, ${name}! You are ${age} years old.`;',
    },
  ],
  'require-await': [
    {
      bad: 'async function fetchData() {\n  return cache.get("key");\n}',
      description: 'An async function with no await expression',
      good: 'async function fetchData() {\n  return await cache.get("key");\n}',
    },
  ],
  'sort-keys': [
    {
      bad: 'const config = {\n  port: 3000,\n  host: "localhost",\n  debug: true,\n};',
      description: 'Object keys in random order',
      good: 'const config = {\n  debug: true,\n  host: "localhost",\n  port: 3000,\n};',
    },
  ],
  'use-isnan': [
    {
      bad: 'if (value === NaN) {\n  console.log("not a number");\n}',
      description: 'Comparing directly with NaN which always returns false',
      good: 'if (Number.isNaN(value)) {\n  console.log("not a number");\n}',
    },
  ],
}
