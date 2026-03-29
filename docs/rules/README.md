# CodeForge Rules Documentation

This document contains documentation for all 111 available rules.

## Overview

| Category | Rules | Fixable |
|----------|-------|--------|
| style | 92 | 53 |
| complexity | 5 | 5 |
| performance | 6 | 4 |
| correctness | 2 | 0 |
| security | 6 | 2 |

## Rules by Category

### style

- [consistent-imports](./consistent-imports.md) `fixable` - Enforce consistent import style across the codebase. Choose between default imports, namespace imports, or named imports.
- [consistent-type-exports](./consistent-type-exports.md) `recommended` - Enforce consistent usage of type exports. Use `export type` for types to make the export intent clear.
- [curly](./curly.md) `recommended` `fixable` - Require curly braces for all control statements (if, for, while, do, with) for better code readability and maintainability.
- [eq-eq-eq](./eq-eq-eq.md) `recommended` `fixable` - Require strict equality operators (=== and !==) instead of loose equality operators (== and !=). Loose equality can lead to unexpected type coercion.
- [explicit-module-boundary-types](./explicit-module-boundary-types.md) `recommended` - Require explicit return types on exported functions. Explicit return types on module boundaries improve API documentation and help catch type errors at compile time.
- [max-file-size](./max-file-size.md) `recommended` - Enforce a maximum file size. Large files are harder to understand and maintain. Consider splitting large files into smaller, focused modules.
- [max-union-size](./max-union-size.md) `recommended` - Enforce a maximum number of types in a union type. Large unions can indicate poor type design and make code harder to understand.
- [no-array-constructor](./no-array-constructor.md) `recommended` `fixable` - Disallow Array constructor. Use array literals [] instead of new Array() for consistency and to avoid confusing behavior with single numeric arguments.
- [no-async-promise-executor](./no-async-promise-executor.md) `recommended` `fixable` - Disallow async functions as Promise executors. Async functions already return Promises, so wrapping them in new Promise() is redundant and can cause unhandled rejections.
- [no-async-without-await](./no-async-without-await.md) `fixable` - Disallow async functions that lack await expressions. Async functions without await are usually unnecessary and add overhead.
- [no-barrel-imports](./no-barrel-imports.md) `fixable` - Disallow imports from barrel files (index.ts/index.js). Importing from barrel files can cause performance issues, circular dependencies, and make the dependency graph harder to understand.
- [no-circular-deps](./no-circular-deps.md) `recommended` `fixable` - Disallow circular dependencies between modules. Circular dependencies can lead to runtime issues, make code harder to understand, and can cause problems with bundlers and tree-shaking.
- [no-compare-neg-zero](./no-compare-neg-zero.md) `recommended` `fixable` - Disallow comparing against -0. The comparison x === -0 (or x == -0) returns true for both 0 and -0 because JavaScript treats them as equal. Use Object.is(x, -0) to distinguish -0 from 0.
- [no-confusing-void-expression](./no-confusing-void-expression.md) `recommended` - Disallow void expressions used in confusing ways. Void expressions always evaluate to undefined, which can be confusing when used in return statements, template literals, or arithmetic operations.
- [no-console-log](./no-console-log.md) `recommended` `fixable` - Disallow console.log and similar console methods in production code. Use a proper logging library instead.
- [no-const-assign](./no-const-assign.md) `recommended` `fixable` - Report when a const variable is reassigned. Const variables cannot be reassigned after declaration.
- [no-constant-condition](./no-constant-condition.md) `recommended` `fixable` - Disallow constant conditions in control flow statements. Conditions that always evaluate to the same value are likely mistakes.
- [no-duplicate-code](./no-duplicate-code.md) - Disallow duplicate code blocks. Duplicated code increases maintenance burden and can indicate missing abstractions.
- [no-duplicate-else-if](./no-duplicate-else-if.md) `recommended` - Disallow duplicate conditions in if-else chains. Duplicate conditions in if-else chains are usually a bug as only the first matching branch will be executed.
- [no-duplicate-imports](./no-duplicate-imports.md) `recommended` `fixable` - Detect duplicate imports from the same module. Multiple imports from the same module should be combined into a single import statement.
- [no-else-return](./no-else-return.md) `recommended` `fixable` - Disallow unnecessary else blocks after return statements. If a block contains a return, the else block can be removed and its body unindented.
- [no-empty](./no-empty.md) `recommended` `fixable` - Disallow empty block statements. Empty blocks can be confusing and along indicate incomplete code.
- [no-explicit-any](./no-explicit-any.md) `recommended` `fixable` - Disallow usage of the any type in TypeScript. Use more specific types for better type safety.
- [no-floating-promises](./no-floating-promises.md) `recommended` - Require Promise-like statements to be handled appropriately. Floating Promises can cause unhandled rejections and race conditions.
- [no-implicit-coercion](./no-implicit-coercion.md) `recommended` `fixable` - Disallow implicit type coercion. Use explicit conversion functions like Number(), String(), and Boolean() instead of shorthand patterns like +x, x + "", and !!x for better readability.
- [no-inferrable-types](./no-inferrable-types.md) `recommended` - Disallow explicit type declarations in variables where the type can be easily inferred from the initial value.
- [no-lonely-if](./no-lonely-if.md) `recommended` `fixable` - Disallow if statements as the only statement in an else block. Use 'else if' instead for better readability.
- [no-loss-of-precision](./no-loss-of-precision.md) `recommended` - Disallow floating-point arithmetic that may lose precision. JavaScript uses IEEE 754 floating-point numbers, which can produce unexpected results (e.g., 0.1 + 0.2 !== 0.3). Consider using integer arithmetic, a precision library, or rounding.
- [no-magic-numbers](./no-magic-numbers.md) `fixable` - Disallow magic numbers that should be named constants
- [no-misused-promises](./no-misused-promises.md) `recommended` - Disallow Promises in places not designed to handle them, such as async callbacks passed to non-Promise-aware methods and await in non-async functions.
- [no-multi-spaces](./no-multi-spaces.md) `fixable` - Disallow multiple spaces except for indentation. Multiple spaces can be confusing and may indicate errors.
- [no-nested-ternary](./no-nested-ternary.md) `recommended` `fixable` - Do not nest ternary expressions. Use if-else or switch statements instead.
- [no-non-null-assertion](./no-non-null-assertion.md) `recommended` `fixable` - Disallow the use of non-null assertion operator (!). Using this operator can lead to runtime errors if the value is actually null or undefined.
- [no-object-constructor](./no-object-constructor.md) `recommended` `fixable` - Disallow Object constructors. Using new Object() is redundant; use object literals {} instead for better readability and conciseness.
- [no-param-reassign](./no-param-reassign.md) `recommended` - Report when a function parameter is reassigned or modified.
- [no-promise-as-boolean](./no-promise-as-boolean.md) `recommended` - Disallow Promises in boolean contexts. Promises are always truthy, so using them in if statements, &&, ||, or ! conditions is almost always a bug. Use await or .then() to resolve the Promise first.
- [no-return-await](./no-return-await.md) `recommended` - Disallow unnecessary return await. In async functions, return await is redundant and slightly slower than returning the Promise directly.
- [no-same-side-conditions](./no-same-side-conditions.md) `recommended` `fixable` - Disallow conditions where both sides of a logical operator are the same. Expressions like `a && a` or `a || a` are redundant.
- [no-shadow](./no-shadow.md) `recommended` - Disallow variable shadowing. Variable shadowing can lead to confusion and bugs when an outer scope variable becomes inaccessible.
- [no-simplifiable-pattern](./no-simplifiable-pattern.md) `recommended` `fixable` - Disallow ternary expressions that can be simplified to a boolean conversion or negation.
- [no-string-concat](./no-string-concat.md) `recommended` - Disallow string concatenation with the + operator. Use template literals or array join() for better readability, especially with multiple strings.
- [no-throw-sync](./no-throw-sync.md) `recommended` - Disallow throwing synchronous errors in async functions. Use Promise.reject() or return a rejected Promise for consistent async error handling.
- [no-type-only-return](./no-type-only-return.md) `recommended` - Disallow functions that have a return type annotation but return nothing or undefined. This often indicates a bug where the return value was forgotten.
- [no-unnecessary-condition](./no-unnecessary-condition.md) `recommended` - Disallow conditions that are always truthy or always falsy. These conditions are unnecessary and likely indicate a mistake.
- [no-unnecessary-escape-in-regexp](./no-unnecessary-escape-in-regexp.md) `recommended` `fixable` - Disallow unnecessary escape characters in regular expressions. Escaping characters that don't need to be escaped makes the pattern harder to read.
- [no-unnecessary-qualifier](./no-unnecessary-qualifier.md) `recommended` `fixable` - Disallow unnecessary namespace qualifiers. When a member is imported directly, using the qualified form (e.g., A.B) is unnecessary. Use the unqualified name (e.g., B) instead.
- [no-unnecessary-slice](./no-unnecessary-slice.md) `recommended` `fixable` - Disallow unnecessary array.slice() calls. Calling .slice(0), .slice(undefined), or .slice() without arguments creates unnecessary overhead. Remove the slice call or use spread syntax if a shallow copy is needed.
- [no-unnecessary-string-concat](./no-unnecessary-string-concat.md) `recommended` `fixable` - Disallow unnecessary string concatenation with empty strings. Using "".concat(str) or str.concat("") is redundant and should be simplified to just str.
- [no-unnecessary-template-expression](./no-unnecessary-template-expression.md) `recommended` `fixable` - Disallow unnecessary template literals. Template literals without expressions or multi-line content should be regular strings for better readability. Use template literals when you need interpolation or multi-line strings.
- [no-unnecessary-type-arguments](./no-unnecessary-type-arguments.md) `recommended` - Disallow explicit type arguments that can be inferred by TypeScript. Explicit type arguments are unnecessary when TypeScript can infer them from the context.
- [no-unnecessary-type-assertion](./no-unnecessary-type-assertion.md) `fixable` - Disallow type assertions that are redundant because TypeScript can already infer the same type
- [no-unsafe-assignment](./no-unsafe-assignment.md) `recommended` - Disallow assigning values with `any` type to variables with specific types. This prevents unsafe type assignments that bypass type safety.
- [no-unsafe-declaration-merging](./no-unsafe-declaration-merging.md) `recommended` - Disallow unsafe declaration merging between classes, interfaces, and functions. Declaration merging can lead to confusing code and unexpected type behavior.
- [no-unused-exports](./no-unused-exports.md) `recommended` `fixable` - Disallow exports that are never imported by other modules. Unused exports indicate dead code or missing documentation.
- [no-unused-private-members](./no-unused-private-members.md) `recommended` - Disallow unused private class members. Private properties and methods that are declared but never used within the class may indicate dead code or incomplete implementation.
- [no-unused-vars](./no-unused-vars.md) `recommended` - Disallow unused variables. Variables that are declared but never used may indicate incomplete code or refactoring leftovers.
- [no-useless-fallback-in-spread](./no-useless-fallback-in-spread.md) `recommended` `fixable` - Detect useless fallbacks in spread patterns. Spreading undefined/null is safe and adds no properties, so `{ ...obj || {} }` is redundant and can be simplified to `{ ...obj }`.
- [no-var-requires](./no-var-requires.md) `recommended` - Disallow require statements using var. Use ES6 import statements instead for better static analysis and tree shaking.
- [no-void](./no-void.md) `recommended` `fixable` - Disallow the void operator. The void operator evaluates an expression and returns undefined. It is often confusing and rarely necessary.
- [prefer-array-flat](./prefer-array-flat.md) `recommended` `fixable` - Prefer Array.flat() over manual flattening patterns. Use arr.flat() instead of reduce with concat or nested for loops.
- [prefer-async-await](./prefer-async-await.md) `recommended` - Prefer async/await syntax over Promise .then()/.catch() chains for better readability and error handling.
- [prefer-at-context](./prefer-at-context.md) `recommended` `fixable` - Prefer arrow functions over .bind(this) for preserving context. Arrow functions automatically capture `this` from the enclosing scope, making the code cleaner and more readable.
- [prefer-at-method](./prefer-at-method.md) `recommended` `fixable` - Prefer .at() method for negative indexing. Use arr.at(-1) instead of arr[arr.length - 1] for better readability.
- [prefer-const](./prefer-const.md) `recommended` `fixable` - Require const declarations for variables that are never reassigned. Using const makes code more predictable and signals intent more clearly.
- [prefer-const-assertions](./prefer-const-assertions.md) `fixable` - Enforce using const assertions for better type inference on objects and array literals
- [prefer-date-now](./prefer-date-now.md) `recommended` `fixable` - Prefer Date.now() over new Date().getTime(). Date.now() is more concise and avoids creating an unnecessary Date object.
- [prefer-enum-initializers](./prefer-enum-initializers.md) - Require all enum members to have explicit values. Explicit values make the code more predictable and prevent accidental value changes when members are added or reordered.
- [prefer-exponentiation-operator](./prefer-exponentiation-operator.md) `recommended` `fixable` - Prefer the exponentiation operator (**) over Math.pow() for better readability. The ** operator is more concise and clearer for exponentiation operations.
- [prefer-function-type](./prefer-function-type.md) `fixable` - Prefer function type over interface with a single call signature. Function types are more concise and idiomatic for callable types.
- [prefer-includes](./prefer-includes.md) `recommended` - Prefer .includes() over .indexOf() comparisons for better readability. Use array.includes(x) instead of array.indexOf(x) >= 0.
- [prefer-literal-enum-member](./prefer-literal-enum-member.md) - Require enum members to be literal values. Computed values in enums can lead to unpredictable behavior and reduce type safety.
- [prefer-nullish-coalescing](./prefer-nullish-coalescing.md) `recommended` `fixable` - Suggest using the nullish coalescing operator (`??`) instead of `||` for null/undefined checks. The `??` operator only falls through on null/undefined, whereas `||` also falls through on falsy values like 0, '', and false.
- [prefer-number-properties](./prefer-number-properties.md) `recommended` - Prefer Number.isNaN() and Number.isFinite() over isNaN(), isFinite(), and direct NaN/Infinity comparisons. The global isNaN() coerces values, while Number.isNaN() does not. Direct comparisons with NaN always return false.
- [prefer-numeric-literals](./prefer-numeric-literals.md) `fixable` - Prefer numeric literals over parseInt with specific radix values. Use 0b... for binary (radix 2), 0o... for octal (radix 8), or 0x... for hexadecimal (radix 16).
- [prefer-object-has-own](./prefer-object-has-own.md) `recommended` - Prefer Object.hasOwn() over hasOwnProperty() and propertyIsEnumerable() for safer property checking. Use Object.hasOwn(obj, prop) instead of obj.hasOwnProperty(prop) or Object.prototype.hasOwnProperty.call(obj, prop).
- [prefer-prototype-methods](./prefer-prototype-methods.md) `recommended` `fixable` - Prefer modern alternatives over prototype method calls. Use spread syntax instead of Array.prototype.slice.call(), and Object.hasOwn() instead of Object.prototype.hasOwnProperty.call().
- [prefer-readonly](./prefer-readonly.md) - Suggest using readonly for arrays and objects that are never modified for better immutability guarantees.
- [prefer-readonly-parameter](./prefer-readonly-parameter.md) `fixable` - Suggest using readonly for array/object parameters that are not modified within the function.
- [prefer-regex-literals](./prefer-regex-literals.md) `recommended` - Prefer regex literals over RegExp constructor. Regex literals are more readable and performant. Only use new RegExp() when the pattern is dynamic.
- [prefer-regexp-exec](./prefer-regexp-exec.md) `recommended` `fixable` - Prefer RegExp.exec() or String.matchAll() over String.match() with global flag. Using str.match(/regex/g) can lead to bugs with stateful regex lastIndex, and str.matchAll(regex) or regex.exec(str) in a loop are more explicit.
- [prefer-rest-params](./prefer-rest-params.md) `recommended` `fixable` - Prefer rest parameters (...args) instead of the arguments object. Rest parameters provide better readability and work with arrow functions.
- [prefer-spread](./prefer-spread.md) `recommended` `fixable` - Prefer spread syntax over .apply() and .concat(). Use ...args instead of fn.apply(this, args), and [...arr1, ...arr2] instead of arr1.concat(arr2).
- [prefer-string-replace-all](./prefer-string-replace-all.md) - Prefer String.prototype.replaceAll() over .replace() with a global regex. replaceAll() is more readable and explicit about replacing all occurrences.
- [prefer-string-slice](./prefer-string-slice.md) `recommended` - Prefer String.slice() over substring() and substr(). slice() is more consistent and supports negative indices for counting from the end of the string.
- [prefer-string-slice-over-substring](./prefer-string-slice-over-substring.md) `recommended` - Prefer String.slice() over substring() and substr(). slice() is more consistent and supports negative indices for counting from the end of the string.
- [prefer-string-starts-ends-with](./prefer-string-starts-ends-with.md) `recommended` `fixable` - Prefer String.startsWith() and String.endsWith() over regex or indexOf patterns for better readability.
- [prefer-template](./prefer-template.md) `recommended` `fixable` - Prefer template literals over string concatenation. Use backticks (`Hello ${name}`) instead of + operator ("Hello " + name) for better readability.
- [prefer-ternary-operator](./prefer-ternary-operator.md) `fixable` - Suggest using ternary operator instead of verbose if-else for simple assignments. Using ternary operator makes the code more concise and readable for simple conditional assignments.
- [require-await](./require-await.md) `recommended` `fixable` - Require async functions to contain await expressions. An async function without await is usually a mistake or unnecessary async overhead.
- [require-return-type](./require-return-type.md) - Require explicit return type annotations on functions. Explicit return types improve code readability and help catch type errors.
- [restrict-template-expressions](./restrict-template-expressions.md) `recommended` - Restrict template expressions to specific types. Prevents accidental string coercion of non-string values which can lead to unexpected output.
- [strict-boolean-expressions](./strict-boolean-expressions.md) - Enforce explicit boolean comparisons in conditions to avoid bugs with falsy values

### complexity

- [max-complexity](./max-complexity.md) `recommended` `fixable` - Enforce a maximum cyclomatic complexity threshold for functions
- [max-depth](./max-depth.md) `recommended` `fixable` - Enforce a maximum nesting depth for code blocks
- [max-lines](./max-lines.md) `fixable` - Enforce a maximum number of lines per file
- [max-lines-per-function](./max-lines-per-function.md) `recommended` `fixable` - Enforce a maximum number of lines per function
- [max-params](./max-params.md) `recommended` `fixable` - Enforce a maximum number of parameters in function definitions

### performance

- [no-array-destructuring](./no-array-destructuring.md) - Avoid spread operator on arrays in array literals for better performance with large arrays. Use arr.concat() or arr.slice() instead of [...arr] for copying arrays.
- [no-await-in-loop](./no-await-in-loop.md) `recommended` `fixable` - Disallow await inside of loops for better performance
- [no-sync-in-async](./no-sync-in-async.md) `recommended` `fixable` - Disallow synchronous operations in async functions for better performance
- [prefer-math-trunc](./prefer-math-trunc.md) - Prefer Math.trunc() over bitwise operations (| 0, >> 0) for truncating numbers. Math.trunc() is more readable, handles large numbers correctly, and is explicit about intent.
- [prefer-object-spread](./prefer-object-spread.md) `recommended` `fixable` - Enforce using object spread syntax ({ ...source }) instead of Object.assign({}, source) for immutable object operations. Object spread is more concise, readable, and provides better type inference in TypeScript.
- [prefer-optional-chain](./prefer-optional-chain.md) `recommended` `fixable` - Enforce using optional chain operator (?.) instead of chained && checks for property access and method calls. Optional chaining is more concise and readable.

### correctness

- [no-constant-binary-expression](./no-constant-binary-expression.md) `recommended` - Disallow comparisons with constant binary values (true/false, 0/1). These are likely mistakes where a variable was intended, the boolean literal. Use the variable directly or fix the comparison.
- [no-throw-literal](./no-throw-literal.md) `recommended` - Disallow throwing literals as exceptions. Only Error objects should be thrown for proper error handling and stack traces.

### security

- [no-deprecated-api](./no-deprecated-api.md) `recommended` `fixable` - Disallow the use of deprecated APIs. Using deprecated APIs may cause issues when upgrading runtime environments.
- [no-dynamic-delete](./no-dynamic-delete.md) - Disallow dynamic property deletion (delete obj[dynamicKey]). Dynamic deletion can bypass security checks, indicate poor design, and make code harder to analyze. Use static property deletion or Map/Set instead.
- [no-eval](./no-eval.md) `recommended` `fixable` - Disallow the use of eval() and similar methods which can execute arbitrary code strings. These functions pose security risks and can lead to code injection vulnerabilities.
- [no-implied-eval](./no-implied-eval.md) `recommended` - Disallow implied eval via setTimeout/setInterval/execScript with string arguments. Using strings as the first argument to setTimeout/setInterval/execScript is equivalent to using eval, which poses security risks.
- [no-unsafe-return](./no-unsafe-return.md) `recommended` - Disallow unsafe return of values that bypass type safety. Returning any or unknown typed values without proper type narrowing can introduce runtime errors.
- [no-unsafe-type-assertion](./no-unsafe-type-assertion.md) `recommended` - Warn on unsafe type assertions (casting to/from any, unknown, or unrelated types). Type assertions bypass TypeScript safety checks and can hide type errors.

