# CodeForge Rules Documentation

This document contains documentation for all 209 available rules.

## Overview

| Category | Rules | Fixable |
|----------|-------|--------|
| dependencies | 4 | 4 |
| patterns | 147 | 40 |
| style | 27 | 14 |
| complexity | 5 | 5 |
| performance | 8 | 4 |
| security | 12 | 2 |
| correctness | 6 | 0 |

## Rules by Category

### dependencies

- [consistent-imports](./consistent-imports.md) `fixable` - Enforce consistent import style across the codebase. Choose between default imports, namespace imports, or named imports.
- [no-barrel-imports](./no-barrel-imports.md) `fixable` - Disallow imports from barrel files (index.ts/index.js). Importing from barrel files can cause performance issues, circular dependencies, and make the dependency graph harder to understand.
- [no-circular-deps](./no-circular-deps.md) `recommended` `fixable` - Disallow circular dependencies between modules. Circular dependencies can lead to runtime issues, make code harder to understand, and can cause problems with bundlers and tree-shaking.
- [no-unused-exports](./no-unused-exports.md) `recommended` `fixable` - Disallow exports that are never imported by other modules. Unused exports indicate dead code or missing documentation.

### patterns

- [consistent-type-exports](./consistent-type-exports.md) `recommended` - Enforce consistent usage of type exports. Use `export type` for types to make the export intent clear.
- [constructor-super](./constructor-super.md) `recommended` - Require super() calls in constructors of derived classes.
- [default-case](./default-case.md) - Require default case in switch statements.
- [eq-eq-eq](./eq-eq-eq.md) `recommended` `fixable` - Require strict equality operators (=== and !==) instead of loose equality operators (== and !=). Loose equality can lead to unexpected type coercion.
- [explicit-module-boundary-types](./explicit-module-boundary-types.md) `recommended` - Require explicit return types on exported functions. Explicit return types on module boundaries improve API documentation and help catch type errors at compile time.
- [for-direction](./for-direction.md) `recommended` - Enforce for loop update clause to move the counter in the right direction.
- [getter-return](./getter-return.md) `recommended` - Enforce return statements in getters.
- [max-file-size](./max-file-size.md) `recommended` - Enforce a maximum file size. Large files are harder to understand and maintain. Consider splitting large files into smaller, focused modules.
- [max-union-size](./max-union-size.md) `recommended` - Enforce a maximum number of types in a union type. Large unions can indicate poor type design and make code harder to understand.
- [no-alert](./no-alert.md) `recommended` - Disallow the use of alert, confirm, and prompt browser dialogs.
- [no-array-constructor](./no-array-constructor.md) `recommended` `fixable` - Disallow Array constructor. Use array literals [] instead of new Array() for consistency and to avoid confusing behavior with single numeric arguments.
- [no-async-promise-executor](./no-async-promise-executor.md) `recommended` `fixable` - Disallow async functions as Promise executors. Async functions already return Promises, so wrapping them in new Promise() is redundant and can cause unhandled rejections.
- [no-async-without-await](./no-async-without-await.md) `fixable` - Disallow async functions that lack await expressions. Async functions without await are usually unnecessary and add overhead.
- [no-bitwise](./no-bitwise.md) `recommended` - Disallow bitwise operators (&, |, ^, ~, >>>, etc.). Bitwise operators are often mistaken for logical operators (& vs &&, | vs ||) and can indicate typos.
- [no-case-declarations](./no-case-declarations.md) `recommended` - Disallow lexical declarations in switch case clauses without blocks.
- [no-class-assign](./no-class-assign.md) `recommended` - Disallow reassigning class declarations.
- [no-compare-neg-zero](./no-compare-neg-zero.md) `recommended` `fixable` - Disallow comparing against -0. The comparison x === -0 (or x == -0) returns true for both 0 and -0 because JavaScript treats them as equal. Use Object.is(x, -0) to distinguish -0 from 0.
- [no-cond-assign](./no-cond-assign.md) `recommended` - Disallow assignment operators in conditional expressions.
- [no-confusing-void-expression](./no-confusing-void-expression.md) `recommended` - Disallow void expressions used in confusing ways. Void expressions always evaluate to undefined, which can be confusing when used in return statements, template literals, or arithmetic operations.
- [no-console-log](./no-console-log.md) `recommended` `fixable` - Disallow console.log and similar console methods in production code. Use a proper logging library instead.
- [no-const-assign](./no-const-assign.md) `recommended` `fixable` - Report when a const variable is reassigned. Const variables cannot be reassigned after declaration.
- [no-constant-condition](./no-constant-condition.md) `recommended` `fixable` - Disallow constant conditions in control flow statements. Conditions that always evaluate to the same value are likely mistakes.
- [no-constructor-return](./no-constructor-return.md) `recommended` - Disallow returning values from constructors. Constructors should only initialize the object, not return values.
- [no-control-regex](./no-control-regex.md) `recommended` - Disallow control characters in regular expressions.
- [no-debugger](./no-debugger.md) `recommended` - Disallow the use of debugger statements.
- [no-delete-var](./no-delete-var.md) `recommended` - Disallow deleting variables.
- [no-div-regex](./no-div-regex.md) `recommended` - Disallow ambiguous regex notation (= /foo/). The = operator can be confused with division. Use RegExp() or explicit comparison.
- [no-dupe-args](./no-dupe-args.md) `recommended` - Disallow duplicate arguments in function definitions.
- [no-dupe-class-members](./no-dupe-class-members.md) `recommended` - Disallow duplicate class members.
- [no-dupe-keys](./no-dupe-keys.md) `recommended` - Disallow duplicate keys in object literals.
- [no-duplicate-case](./no-duplicate-case.md) `recommended` - Disallow duplicate case labels in switch statements.
- [no-duplicate-code](./no-duplicate-code.md) - Disallow duplicate code blocks. Duplicated code increases maintenance burden and can indicate missing abstractions.
- [no-duplicate-imports](./no-duplicate-imports.md) `recommended` `fixable` - Detect duplicate imports from the same module. Multiple imports from the same module should be combined into a single import statement.
- [no-empty](./no-empty.md) `recommended` `fixable` - Disallow empty block statements. Empty blocks can be confusing and along indicate incomplete code.
- [no-empty-pattern](./no-empty-pattern.md) `recommended` - Disallow empty destructuring patterns.
- [no-empty-static-block](./no-empty-static-block.md) `recommended` - Disallow empty static blocks.
- [no-ex-assign](./no-ex-assign.md) `recommended` - Disallow reassigning exceptions in catch clauses.
- [no-explicit-any](./no-explicit-any.md) `recommended` `fixable` - Disallow usage of the any type in TypeScript. Use more specific types for better type safety.
- [no-extra-boolean-cast](./no-extra-boolean-cast.md) `recommended` - Disallow unnecessary boolean casts.
- [no-fallthrough](./no-fallthrough.md) `recommended` - Disallow fallthrough in switch statements.
- [no-floating-promises](./no-floating-promises.md) `recommended` - Require Promise-like statements to be handled appropriately. Floating Promises can cause unhandled rejections and race conditions.
- [no-func-assign](./no-func-assign.md) `recommended` - Disallow reassigning function declarations.
- [no-global-assign](./no-global-assign.md) `recommended` - Disallow assignment to native objects or read-only global variables.
- [no-implicit-coercion](./no-implicit-coercion.md) `recommended` `fixable` - Disallow implicit type coercion. Use explicit conversion functions like Number(), String(), and Boolean() instead of shorthand patterns like +x, x + "", and !!x for better readability.
- [no-import-assign](./no-import-assign.md) `recommended` - Disallow assignment to import bindings.
- [no-inferrable-types](./no-inferrable-types.md) `recommended` - Disallow explicit type declarations in variables where the type can be easily inferred from the initial value.
- [no-invalid-regexp](./no-invalid-regexp.md) `recommended` - Disallow invalid regular expression strings in RegExp constructors.
- [no-irregular-whitespace](./no-irregular-whitespace.md) `recommended` - Disallow irregular whitespace characters.
- [no-iterator](./no-iterator.md) `recommended` - Disallow use of __iterator__, __defineIterator__, __defineSetter__, and custom iterator symbol patterns. These are non-standard or deprecated features.
- [no-loop-func](./no-loop-func.md) `recommended` - Disallow function declarations inside loops. Functions created inside loops capture loop variables and can lead to unexpected behavior. Move the function outside the loop or use let/const for the loop variable.
- [no-loss-of-precision](./no-loss-of-precision.md) `recommended` - Disallow floating-point arithmetic that may lose precision. JavaScript uses IEEE 754 floating-point numbers, which can produce unexpected results (e.g., 0.1 + 0.2 !== 0.3). Consider using integer arithmetic, a precision library, or rounding.
- [no-misleading-character-class](./no-misleading-character-class.md) `recommended` - Disallow characters made with multiple code points in character class syntax.
- [no-misused-promises](./no-misused-promises.md) `recommended` - Disallow Promises in places not designed to handle them, such as async callbacks passed to non-Promise-aware methods and await in non-async functions.
- [no-new-native-nonconstructor](./no-new-native-nonconstructor.md) `recommended` - Disallow new operators with global non-constructor functions.
- [no-new-wrappers](./no-new-wrappers.md) `recommended` - Disallow new String(), new Number(), new Boolean(), new Symbol(), and new BigInt(). These create object wrappers instead of primitives, which can lead to unexpected behavior.
- [no-non-null-assertion](./no-non-null-assertion.md) `recommended` `fixable` - Disallow the use of non-null assertion operator (!). Using this operator can lead to runtime errors if the value is actually null or undefined.
- [no-nonoctal-decimal-escape](./no-nonoctal-decimal-escape.md) `recommended` - Disallow \8 and \9 escape sequences in string literals.
- [no-obj-calls](./no-obj-calls.md) `recommended` - Disallow calling global object properties as functions.
- [no-object-constructor](./no-object-constructor.md) `recommended` `fixable` - Disallow Object constructors. Using new Object() is redundant; use object literals {} instead for better readability and conciseness.
- [no-octal](./no-octal.md) `recommended` - Disallow octal literals.
- [no-param-reassign](./no-param-reassign.md) `recommended` - Report when a function parameter is reassigned or modified.
- [no-promise-as-boolean](./no-promise-as-boolean.md) `recommended` - Disallow Promises in boolean contexts. Promises are always truthy, so using them in if statements, &&, ||, or ! conditions is almost always a bug. Use await or .then() to resolve the Promise first.
- [no-prototype-builtins](./no-prototype-builtins.md) `recommended` - Disallow calling some Object.prototype methods directly on objects.
- [no-redeclare](./no-redeclare.md) `recommended` - Disallow redeclaring variables.
- [no-regex-spaces](./no-regex-spaces.md) `recommended` `fixable` - Disallow multiple consecutive spaces in regular expressions. Use \s+ or {N} quantifier instead for clarity.
- [no-return-assign](./no-return-assign.md) `recommended` - Disallow assignment operators in return statements. Return statements like `return a = b` are confusing - did you mean to assign or compare? Always assign before returning.
- [no-return-await](./no-return-await.md) `recommended` - Disallow unnecessary return await. In async functions, return await is redundant and slightly slower than returning the Promise directly.
- [no-same-side-conditions](./no-same-side-conditions.md) `recommended` `fixable` - Disallow conditions where both sides of a logical operator are the same. Expressions like `a && a` or `a || a` are redundant.
- [no-self-assign](./no-self-assign.md) `recommended` - Disallow assignments where both sides are exactly the same.
- [no-sequences](./no-sequences.md) `recommended` - Disallow the use of the comma operator. Sequence expressions using the comma operator can be confusing and lead to subtle bugs.
- [no-setter-return](./no-setter-return.md) `recommended` - Disallow returning values from setters.
- [no-shadow](./no-shadow.md) `recommended` - Disallow variable shadowing. Variable shadowing can lead to confusion and bugs when an outer scope variable becomes inaccessible.
- [no-shadow-restricted-names](./no-shadow-restricted-names.md) `recommended` - Disallow identifiers from shadowing restricted names.
- [no-sparse-arrays](./no-sparse-arrays.md) `recommended` - Disallow sparse arrays.
- [no-string-concat](./no-string-concat.md) `recommended` - Disallow string concatenation with the + operator. Use template literals or array join() for better readability, especially with multiple strings.
- [no-thenable](./no-thenable.md) `recommended` - Disallow use of .then() method. Prefer async/await syntax for better readability and error handling.
- [no-this-before-super](./no-this-before-super.md) `recommended` - Disallow this/super before super() calling.
- [no-throw-sync](./no-throw-sync.md) `recommended` - Disallow throwing synchronous errors in async functions. Use Promise.reject() or return a rejected Promise for consistent async error handling.
- [no-type-only-return](./no-type-only-return.md) `recommended` - Disallow functions that have a return type annotation but return nothing or undefined. This often indicates a bug where the return value was forgotten.
- [no-unassigned-vars](./no-unassigned-vars.md) `recommended` - Disallow variables that are read but never assigned.
- [no-undef](./no-undef.md) `recommended` - Disallow undeclared variables.
- [no-unexpected-multiline](./no-unexpected-multiline.md) `recommended` - Disallow confusing multiline expressions.
- [no-unfinished-todos](./no-unfinished-todos.md) - Detect unfinished TODO/FIXME/HACK comments that should be addressed
- [no-unnecessary-condition](./no-unnecessary-condition.md) `recommended` - Disallow conditions that are always truthy or always falsy. These conditions are unnecessary and likely indicate a mistake.
- [no-unnecessary-escape-in-regexp](./no-unnecessary-escape-in-regexp.md) `recommended` `fixable` - Disallow unnecessary escape characters in regular expressions. Escaping characters that don't need to be escaped makes the pattern harder to read.
- [no-unnecessary-qualifier](./no-unnecessary-qualifier.md) `recommended` `fixable` - Disallow unnecessary namespace qualifiers. When a member is imported directly, using the qualified form (e.g., A.B) is unnecessary. Use the unqualified name (e.g., B) instead.
- [no-unnecessary-slice](./no-unnecessary-slice.md) `recommended` `fixable` - Disallow unnecessary array.slice() calls. Calling .slice(0), .slice(undefined), or .slice() without arguments creates unnecessary overhead. Remove the slice call or use spread syntax if a shallow copy is needed.
- [no-unnecessary-string-concat](./no-unnecessary-string-concat.md) `recommended` `fixable` - Disallow unnecessary string concatenation with empty strings. Using "".concat(str) or str.concat("") is redundant and should be simplified to just str.
- [no-unnecessary-template-expression](./no-unnecessary-template-expression.md) `recommended` `fixable` - Disallow unnecessary template literals. Template literals without expressions or multi-line content should be regular strings for better readability. Use template literals when you need interpolation or multi-line strings.
- [no-unnecessary-type-arguments](./no-unnecessary-type-arguments.md) `recommended` - Disallow explicit type arguments that can be inferred by TypeScript. Explicit type arguments are unnecessary when TypeScript can infer them from the context.
- [no-unneeded-ternary](./no-unneeded-ternary.md) `recommended` - Disallow ternary expressions that can be simplified. Ternary expressions like `x ? true : false` should use `!!x` or `Boolean(x)`, and `x ? false : true` should use `!x`. Identical branches should be simplified.
- [no-unreachable](./no-unreachable.md) `recommended` - Disallow unreachable code.
- [no-unsafe-assignment](./no-unsafe-assignment.md) `recommended` - Disallow assigning values with `any` type to variables with specific types. This prevents unsafe type assignments that bypass type safety.
- [no-unsafe-declaration-merging](./no-unsafe-declaration-merging.md) `recommended` - Disallow unsafe declaration merging between classes, interfaces, and functions. Declaration merging can lead to confusing code and unexpected type behavior.
- [no-unsafe-finally](./no-unsafe-finally.md) `recommended` - Disallow control flow statements in finally blocks.
- [no-unsafe-negation](./no-unsafe-negation.md) `recommended` - Disallow negating the left operand of relational operators.
- [no-unsafe-optional-chaining](./no-unsafe-optional-chaining.md) `recommended` - Disallow use of optional chaining where undefined is not allowed.
- [no-unused-expressions](./no-unused-expressions.md) `recommended` - Disallow unused expressions that have no effect
- [no-unused-labels](./no-unused-labels.md) `recommended` - Disallow unused labels.
- [no-unused-private-members](./no-unused-private-members.md) `recommended` - Disallow unused private class members. Private properties and methods that are declared but never used within the class may indicate dead code or incomplete implementation.
- [no-useless-assignment](./no-useless-assignment.md) `recommended` - Disallow redundant assignments.
- [no-useless-backreference](./no-useless-backreference.md) `recommended` - Disallow useless backreferences in regular expressions.
- [no-useless-concat](./no-useless-concat.md) `recommended` - Disallow useless string concatenation with empty strings. Concatenating with an empty string is unnecessary and can be removed.
- [no-useless-constructor](./no-useless-constructor.md) `recommended` - Disallow useless constructors that are empty or only pass through to super().
- [no-useless-escape](./no-useless-escape.md) `recommended` - Disallow unnecessary escape characters.
- [no-useless-fallback-in-spread](./no-useless-fallback-in-spread.md) `recommended` `fixable` - Detect useless fallbacks in spread patterns. Spreading undefined/null is safe and adds no properties, so `{ ...obj || {} }` is redundant and can be simplified to `{ ...obj }`.
- [no-var](./no-var.md) `recommended` - Disallow the use of 'var' declarations. Use 'let' or 'const' instead.
- [no-var-requires](./no-var-requires.md) `recommended` - Disallow require statements using var. Use ES6 import statements instead for better static analysis and tree shaking.
- [no-void](./no-void.md) `recommended` `fixable` - Disallow the void operator. The void operator evaluates an expression and returns undefined. It is often confusing and rarely necessary.
- [no-with](./no-with.md) `recommended` - Disallow with statements.
- [object-shorthand](./object-shorthand.md) `recommended` - Require object literal shorthand for methods. Instead of { method: function() {} }, use { method() { } } for cleaner, more concise code.
- [prefer-array-flat](./prefer-array-flat.md) `recommended` `fixable` - Prefer Array.flat() over manual flattening patterns. Use arr.flat() instead of reduce with concat or nested for loops.
- [prefer-async-await](./prefer-async-await.md) `recommended` - Prefer async/await syntax over Promise .then()/.catch() chains for better readability and error handling.
- [prefer-at-context](./prefer-at-context.md) `recommended` `fixable` - Prefer arrow functions over .bind(this) for preserving context. Arrow functions automatically capture `this` from the enclosing scope, making the code cleaner and more readable.
- [prefer-at-method](./prefer-at-method.md) `recommended` `fixable` - Prefer .at() method for negative indexing. Use arr.at(-1) instead of arr[arr.length - 1] for better readability.
- [prefer-const](./prefer-const.md) `recommended` `fixable` - Require const declarations for variables that are never reassigned. Using const makes code more predictable and signals intent more clearly.
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
- [prefer-promise-reject-errors](./prefer-promise-reject-errors.md) `recommended` - Prefer using reject() in Promise executors to handle errors properly. Executors with only resolve() may swallow errors.
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
- [preserve-caught-error](./preserve-caught-error.md) `recommended` - Require using caught error variables.
- [require-await](./require-await.md) `recommended` `fixable` - Require async functions to contain await expressions. An async function without await is usually a mistake or unnecessary async overhead.
- [require-return-type](./require-return-type.md) - Require explicit return type annotations on functions. Explicit return types improve code readability and help catch type errors.
- [require-yield](./require-yield.md) `recommended` - Require yield in generator functions.
- [restrict-template-expressions](./restrict-template-expressions.md) `recommended` - Restrict template expressions to specific types. Prevents accidental string coercion of non-string values which can lead to unexpected output.
- [sort-keys](./sort-keys.md) `recommended` - Enforce alphabetical sorting of object literal keys for better readability and consistency.
- [use-isnan](./use-isnan.md) `recommended` - Require calls to isNaN() when checking for NaN.
- [valid-typeof](./valid-typeof.md) `recommended` - Enforce comparing typeof expressions against valid strings.

### style

- [curly](./curly.md) `recommended` `fixable` - Require curly braces for all control statements (if, for, while, do, with) for better code readability and maintainability.
- [explicit-return-type](./explicit-return-type.md) - Require explicit return types on functions
- [no-console](./no-console.md) `recommended` - Detect console usage in production code that should use proper logging
- [no-duplicate-else-if](./no-duplicate-else-if.md) `recommended` - Disallow duplicate conditions in if-else chains. Duplicate conditions in if-else chains are usually a bug as only the first matching branch will be executed.
- [no-else-return](./no-else-return.md) `recommended` `fixable` - Disallow unnecessary else blocks after return statements. If a block contains a return, the else block can be removed and its body unindented.
- [no-focused-tests](./no-focused-tests.md) `recommended` - Detect focused tests (.only() calls) that can mask failures in CI by running only a subset of tests
- [no-lonely-if](./no-lonely-if.md) `recommended` `fixable` - Disallow if statements as the only statement in an else block. Use 'else if' instead for better readability.
- [no-magic-numbers](./no-magic-numbers.md) `fixable` - Disallow magic numbers that should be named constants
- [no-multi-spaces](./no-multi-spaces.md) `fixable` - Disallow multiple spaces except for indentation. Multiple spaces can be confusing and may indicate errors.
- [no-nested-ternary](./no-nested-ternary.md) `recommended` `fixable` - Do not nest ternary expressions. Use if-else or switch statements instead.
- [no-simplifiable-pattern](./no-simplifiable-pattern.md) `recommended` `fixable` - Disallow ternary expressions that can be simplified to a boolean conversion or negation.
- [no-skipped-tests](./no-skipped-tests.md) `recommended` - Detect skipped or focused tests that may hide issues or cause inconsistent test runs
- [no-unnecessary-type-assertion](./no-unnecessary-type-assertion.md) `fixable` - Disallow type assertions that are redundant because TypeScript can already infer the same type
- [no-unused-vars](./no-unused-vars.md) `recommended` - Disallow unused variables. Variables that are declared but never used may indicate incomplete code or refactoring leftovers.
- [no-useless-comparison](./no-useless-comparison.md) `recommended` - Disallow useless comparisons that are always true or false
- [prefer-array-some](./prefer-array-some.md) - Suggests using Array.prototype.some() instead of indexOf checks
- [prefer-arrow-callback](./prefer-arrow-callback.md) `fixable` - Enforce using arrow functions for callbacks
- [prefer-const-assertions](./prefer-const-assertions.md) `fixable` - Enforce using const assertions for better type inference on objects and array literals
- [prefer-default-export](./prefer-default-export.md) - Enforce using default export when a module only exports one declaration
- [prefer-exponent-operator](./prefer-exponent-operator.md) `fixable` - Enforce using the exponent operator (**) instead of Math.pow()
- [prefer-flat-map](./prefer-flat-map.md) `fixable` - Enforce using .flat() instead of .reduce((acc, val) => acc.concat(val), []) for flattening arrays
- [prefer-for-of](./prefer-for-of.md) `fixable` - Prefer for-of loop over for loop with index when only iterating values
- [prefer-regex-literal](./prefer-regex-literal.md) `recommended` - Enforce using regex literals instead of RegExp constructor
- [prefer-string-start-end](./prefer-string-start-end.md) - Prefer template literals over string concatenation
- [prefer-string-template](./prefer-string-template.md) - Suggests using template literals instead of string concatenation
- [prefer-ternary-operator](./prefer-ternary-operator.md) `fixable` - Suggest using ternary operator instead of verbose if-else for simple assignments. Using ternary operator makes the code more concise and readable for simple conditional assignments.
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
- [no-return-or-await](./no-return-or-await.md) `recommended` - Disallow async functions that never use await or return. Async functions should perform asynchronous operations.
- [no-sync-in-async](./no-sync-in-async.md) `recommended` `fixable` - Disallow synchronous operations in async functions for better performance
- [prefer-array-find](./prefer-array-find.md) `recommended` - Enforce using find() method instead of filter()[0] or filter().shift() for finding a single element
- [prefer-math-trunc](./prefer-math-trunc.md) - Prefer Math.trunc() over bitwise operations (| 0, >> 0) for truncating numbers. Math.trunc() is more readable, handles large numbers correctly, and is explicit about intent.
- [prefer-object-spread](./prefer-object-spread.md) `recommended` `fixable` - Enforce using object spread syntax ({ ...source }) instead of Object.assign({}, source) for immutable object operations. Object spread is more concise, readable, and provides better type inference in TypeScript.
- [prefer-optional-chain](./prefer-optional-chain.md) `recommended` `fixable` - Enforce using optional chain operator (?.) instead of chained && checks for property access and method calls. Optional chaining is more concise and readable.

### security

- [no-caller](./no-caller.md) `recommended` - Disallow the use of arguments.caller and arguments.callee. These are non-standard, deprecated, and pose security risks by exposing call stacks.
- [no-deprecated-api](./no-deprecated-api.md) `recommended` `fixable` - Disallow the use of deprecated APIs. Using deprecated APIs may cause issues when upgrading runtime environments.
- [no-dynamic-delete](./no-dynamic-delete.md) - Disallow dynamic property deletion (delete obj[dynamicKey]). Dynamic deletion can bypass security checks, indicate poor design, and make code harder to analyze. Use static property deletion or Map/Set instead.
- [no-eval](./no-eval.md) `recommended` `fixable` - Disallow the use of eval() and similar methods which can execute arbitrary code strings. These functions pose security risks and can lead to code injection vulnerabilities.
- [no-extend-native](./no-extend-native.md) `recommended` - Disallow extending native objects. Modifying prototypes of built-in objects can cause unexpected behavior and conflicts with other code.
- [no-implied-eval](./no-implied-eval.md) `recommended` - Disallow implied eval via setTimeout/setInterval/execScript with string arguments. Using strings as the first argument to setTimeout/setInterval/execScript is equivalent to using eval, which poses security risks.
- [no-new-func](./no-new-func.md) `recommended` - Disallow new Function() and Function() calls. Creating functions at runtime from strings is a security risk similar to eval().
- [no-unsafe-call](./no-unsafe-call.md) `recommended` - Disallow unsafe calls on values that are explicitly cast as any.
- [no-unsafe-member-access](./no-unsafe-member-access.md) `recommended` - Disallow unsafe member access on values that are explicitly cast as any.
- [no-unsafe-regex](./no-unsafe-regex.md) `recommended` - Detect potentially unsafe regular expression patterns that can cause ReDoS (catastrophic backtracking), injection vulnerabilities, or security issues.
- [no-unsafe-return](./no-unsafe-return.md) `recommended` - Disallow unsafe return of values that bypass type safety. Returning any or unknown typed values without proper type narrowing can introduce runtime errors.
- [no-unsafe-type-assertion](./no-unsafe-type-assertion.md) `recommended` - Warn on unsafe type assertions (casting to/from any, unknown, or unrelated types). Type assertions bypass TypeScript safety checks and can hide type errors.

### correctness

- [no-constant-binary-expression](./no-constant-binary-expression.md) `recommended` - Disallow comparisons with constant binary values (true/false, 0/1). These are likely mistakes where a variable was intended, the boolean literal. Use the variable directly or fix the comparison.
- [no-empty-catch](./no-empty-catch.md) `recommended` - Disallow empty catch clauses that may hide errors silently
- [no-empty-character-class](./no-empty-character-class.md) `recommended` - Disallow empty character classes in regular expressions
- [no-empty-function](./no-empty-function.md) `recommended` - Disallow empty functions. Empty functions may indicate missing implementation or unintended behavior. Consider adding a comment if the empty body is deliberate.
- [no-throw-literal](./no-throw-literal.md) `recommended` - Disallow throwing literals as exceptions. Only Error objects should be thrown for proper error handling and stack traces.
- [no-useless-catch](./no-useless-catch.md) `recommended` - Disallow useless catch clauses that only rethrow the caught error unchanged

