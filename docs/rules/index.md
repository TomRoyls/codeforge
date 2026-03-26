# CodeForge Rules Documentation

Welcome to the comprehensive documentation for all CodeForge rules. CodeForge provides over 100 rules organized into categories to help you write cleaner, safer, and more maintainable code.

## Overview

CodeForge rules are organized into the following categories:

| Category           | Description                                         | Rule Count |
| ------------------ | --------------------------------------------------- | ---------- |
| **Complexity**     | Manage code complexity and maintainability          | 5          |
| **Dependencies**   | Manage module dependencies and imports              | 4          |
| **Performance**    | Optimize code for better runtime performance        | 6          |
| **Security**       | Detect security vulnerabilities and risky patterns  | 5          |
| **Correctness**    | Catch bugs and logic errors                         | 2          |
| **Best Practices** | Enforce modern JavaScript/TypeScript best practices | 4          |
| **Patterns**       | Promote idiomatic code patterns                     | 100+       |

---

## Complexity Rules

Manage code complexity and maintainability by limiting function size, depth, and parameter count.

| Rule                                                           | Fixable | Recommended | Description                                                    |
| -------------------------------------------------------------- | ------- | ----------- | -------------------------------------------------------------- |
| [max-complexity](complexity/max-complexity.md)                 | Yes     | Yes         | Enforce a maximum cyclomatic complexity                        |
| [max-depth](complexity/max-depth.md)                           | Yes     | Yes         | Enforce a maximum depth for nested blocks                      |
| [max-lines](complexity/max-lines.md)                           | Yes     | Yes         | Enforce a maximum number of lines per file                     |
| [max-lines-per-function](complexity/max-lines-per-function.md) | Yes     | Yes         | Enforce a maximum number of lines per function                 |
| [max-params](complexity/max-params.md)                         | Yes     | Yes         | Enforce a maximum number of parameters in function definitions |

---

## Dependencies Rules

Manage module dependencies and imports to prevent circular dependencies and improve code organization.

| Rule                                                     | Fixable | Recommended | Description                                    |
| -------------------------------------------------------- | ------- | ----------- | ---------------------------------------------- |
| [no-circular-deps](dependencies/no-circular-deps.md)     | Yes     | Yes         | Disallow circular dependencies between modules |
| [no-unused-exports](dependencies/no-unused-exports.md)   | Yes     | Yes         | Disallow unused exports in modules             |
| [consistent-imports](dependencies/consistent-imports.md) | Yes     | Yes         | Enforce consistent import ordering and style   |
| [no-barrel-imports](dependencies/no-barrel-imports.md)   | Yes     | Yes         | Disallow importing from barrel files           |

---

## Performance Rules

Optimize code for better runtime performance by suggesting modern, efficient patterns.

| Rule                                                          | Fixable | Recommended | Description                                                |
| ------------------------------------------------------------- | ------- | ----------- | ---------------------------------------------------------- |
| [no-await-in-loop](performance/no-await-in-loop.md)           | Yes     | Yes         | Disallow await inside loops (prefers Promise.all)          |
| [no-sync-in-async](performance/no-sync-in-async.md)           | Yes     | Yes         | Disallow synchronous operations in async functions         |
| [prefer-math-trunc](performance/prefer-math-trunc.md)         | Yes     | Yes         | Prefer Math.trunc() over bitwise OR for integer truncation |
| [prefer-object-spread](performance/prefer-object-spread.md)   | Yes     | Yes         | Prefer object spread operator over Object.assign           |
| [prefer-optional-chain](performance/prefer-optional-chain.md) | Yes     | Yes         | Prefer optional chaining over chained && checks            |
| [no-misused-promises](patterns/no-misused-promises.md)        | Yes     | Yes         | Disallow misused promises and async functions              |

---

## Security Rules

Detect security vulnerabilities and risky code patterns that could lead to exploits.

| Rule                                                             | Fixable | Recommended | Description                                              |
| ---------------------------------------------------------------- | ------- | ----------- | -------------------------------------------------------- |
| [no-deprecated-api](security/no-deprecated-api.md)               | Yes     | Yes         | Disallow use of deprecated APIs                          |
| [no-dynamic-delete](security/no-dynamic-delete.md)               | Yes     | Yes         | Disallow deleting dynamically computed object properties |
| [no-eval](security/no-eval.md)                                   | Yes     | Yes         | Disallow use of eval() and similar dangerous functions   |
| [no-unsafe-return](security/no-unsafe-return.md)                 | Yes     | Yes         | Disallow returning unsafe values in certain contexts     |
| [no-unsafe-type-assertion](security/no-unsafe-type-assertion.md) | Yes     | Yes         | Disallow unsafe type assertions                          |

---

## Correctness Rules

Catch bugs and logic errors that could lead to runtime issues.

| Rule                                                                          | Fixable | Recommended | Description                                                       |
| ----------------------------------------------------------------------------- | ------- | ----------- | ----------------------------------------------------------------- |
| [no-throw-literal](correctness/no-throw-literal.md)                           | Yes     | Yes         | Disallow throwing literals as exceptions                          |
| [no-constant-binary-expression](correctness/no-constant-binary-expression.md) | Yes     | Yes         | Disallow expressions where the operation doesn't change the value |

---

## Best Practices Rules

Enforce modern JavaScript/TypeScript best practices for better code quality.

| Rule                                                                             | Fixable | Recommended | Description                                           |
| -------------------------------------------------------------------------------- | ------- | ----------- | ----------------------------------------------------- |
| [no-magic-numbers](best-practices/no-magic-numbers.md)                           | Yes     | No          | Disallow magic numbers that should be named constants |
| [prefer-const-assertions](best-practices/prefer-const-assertions.md)             | Yes     | Yes         | Prefer const assertions over type assertions          |
| [no-unnecessary-type-assertion](best-practices/no-unnecessary-type-assertion.md) | Yes     | Yes         | Disallow unnecessary type assertions                  |
| [strict-boolean-expressions](best-practices/strict-boolean-expressions.md)       | Yes     | Yes         | Restrict allowable boolean expressions                |

---

## Patterns Rules (100+ Rules)

Promote idiomatic code patterns and modern JavaScript/TypeScript features.

### Modern Language Features

| Rule                                                                         | Fixable | Recommended | Description                                                        |
| ---------------------------------------------------------------------------- | ------- | ----------- | ------------------------------------------------------------------ |
| [prefer-optional-chain](performance/prefer-optional-chain.md)                | Yes     | Yes         | Prefer optional chaining over chained && checks                    |
| [prefer-nullish-coalescing](patterns/prefer-nullish-coalescing.md)           | Yes     | Yes         | Prefer nullish coalescing over logical OR for fallbacks            |
| [prefer-const](patterns/prefer-const.md)                                     | Yes     | Yes         | Require const declarations for variables that are never reassigned |
| [prefer-template](patterns/prefer-template.md)                               | Yes     | Yes         | Prefer template literals over string concatenation                 |
| [prefer-spread](patterns/prefer-spread.md)                                   | Yes     | Yes         | Prefer spread operator over Array.from and Array.apply             |
| [prefer-array-flat](patterns/prefer-array-flat.md)                           | Yes     | Yes         | Prefer Array.flat() over nested loops for flattening               |
| [prefer-string-replace-all](patterns/prefer-string-replace-all.md)           | Yes     | Yes         | Prefer String.replaceAll() over global regex replace               |
| [prefer-string-slice](patterns/prefer-string-slice.md)                       | Yes     | Yes         | Prefer String.slice() over String.substring()                      |
| [prefer-string-starts-ends-with](patterns/prefer-string-starts-ends-with.md) | Yes     | Yes         | Prefer String.startsWith() and endsWith() over indexOf/lastIndexOf |
| [prefer-exponentiation-operator](patterns/prefer-exponentiation-operator.md) | Yes     | Yes         | Prefer exponentiation operator over Math.pow                       |
| [prefer-includes](patterns/prefer-includes.md)                               | Yes     | Yes         | Prefer Array.includes() over indexOf when checking for existence   |
| [prefer-object-has-own](patterns/prefer-object-has-own.md)                   | Yes     | Yes         | Prefer Object.hasOwn() over Object.prototype.hasOwnProperty.call   |
| [prefer-date-now](patterns/prefer-date-now.md)                               | Yes     | Yes         | Prefer Date.now() over new Date().getTime()                        |
| [prefer-number-properties](patterns/prefer-number-properties.md)             | Yes     | Yes         | Prefer Number methods over global functions                        |
| [prefer-numeric-literals](patterns/prefer-numeric-literals.md)               | Yes     | Yes         | Prefer numeric literals for numbers with leading zeros             |
| [prefer-rest-params](patterns/prefer-rest-params.md)                         | Yes     | Yes         | Prefer rest parameters over arguments                              |
| [prefer-async-await](patterns/prefer-async-await.md)                         | Yes     | Yes         | Prefer async/await over promise chaining                           |
| [prefer-function-type](patterns/prefer-function-type.md)                     | Yes     | Yes         | Prefer function type over callable interface                       |
| [prefer-literal-enum-member](patterns/prefer-literal-enum-member.md)         | Yes     | Yes         | Prefer literal enum members over computed ones                     |
| [prefer-enum-initializers](patterns/prefer-enum-initializers.md)             | Yes     | Yes         | Prefer explicitly initialized enum members                         |
| [prefer-readonly](patterns/prefer-readonly.md)                               | Yes     | Yes         | Prefer readonly for properties that are never modified             |
| [prefer-readonly-parameter](patterns/prefer-readonly-parameter.md)           | Yes     | Yes         | Prefer readonly modifier for parameters that are never reassigned  |
| [prefer-prototype-methods](patterns/prefer-prototype-methods.md)             | Yes     | Yes         | Prefer built-in prototype methods over standalone functions        |
| [prefer-at-method](patterns/prefer-at-method.md)                             | Yes     | Yes         | Prefer the Array.at() method for negative indexing                 |
| [prefer-at-context](patterns/prefer-at-context.md)                           | Yes     | Yes         | Prefer using the context.at() method in async iterators            |

### Code Quality

| Rule                                                                                 | Fixable | Recommended | Description                                         |
| ------------------------------------------------------------------------------------ | ------- | ----------- | --------------------------------------------------- |
| [no-console-log](patterns/no-console-log.md)                                         | No      | Yes         | Disallow console.log statements                     |
| [no-debugger](patterns/no-debugger.md)                                               | No      | Yes         | Disallow debugger statements                        |
| [no-duplicate-code](patterns/no-duplicate-code.md)                                   | Yes     | No          | Disallow duplicate code                             |
| [no-duplicate-imports](patterns/no-duplicate-imports.md)                             | Yes     | Yes         | Disallow duplicate imports                          |
| [no-duplicate-else-if](patterns/no-duplicate-else-if.md)                             | No      | No          | Disallow duplicate conditions in if-else-if chains  |
| [no-unused-vars](patterns/no-unused-vars.md)                                         | Yes     | Yes         | Disallow unused variables                           |
| [no-unused-private-members](patterns/no-unused-private-members.md)                   | Yes     | Yes         | Disallow unused private class members               |
| [no-unused-labels](patterns/no-unused-labels.md)                                     | Yes     | Yes         | Disallow unused labels                              |
| [no-explicit-any](patterns/no-explicit-any.md)                                       | No      | No          | Disallow explicit any types                         |
| [no-non-null-assertion](patterns/no-non-null-assertion.md)                           | No      | Yes         | Disallow non-null assertions                        |
| [no-unnecessary-type-assertion](best-practices/no-unnecessary-type-assertion.md)     | Yes     | Yes         | Disallow unnecessary type assertions                |
| [no-inferrable-types](patterns/no-inferrable-types.md)                               | Yes     | Yes         | Disallow type annotations for easily inferred types |
| [no-unnecessary-type-arguments](patterns/no-unnecessary-type-arguments.md)           | Yes     | Yes         | Disallow unnecessary type arguments                 |
| [no-unnecessary-qualifier](patterns/no-unnecessary-qualifier.md)                     | Yes     | Yes         | Disallow unnecessary namespace qualifiers           |
| [no-unnecessary-condition](patterns/no-unnecessary-condition.md)                     | Yes     | Yes         | Disallow unnecessary conditions                     |
| [no-constant-condition](patterns/no-constant-condition.md)                           | Yes     | Yes         | Disallow constant conditions in control flow        |
| [no-unnecessary-template-expression](patterns/no-unnecessary-template-expression.md) | Yes     | Yes         | Disallow unnecessary template expressions           |
| [no-unnecessary-string-concat](patterns/no-unnecessary-string-concat.md)             | Yes     | Yes         | Disallow unnecessary string concatenation           |
| [no-unnecessary-slice](patterns/no-unnecessary-slice.md)                             | Yes     | Yes         | Disallow unnecessary string/Array slice operations  |
| [no-unnecessary-escape-in-regexp](patterns/no-unnecessary-escape-in-regexp.md)       | Yes     | Yes         | Disallow unnecessary escapes in regular expressions |

### Control Flow & Structure

| Rule                                                                     | Fixable | Recommended | Description                                                       |
| ------------------------------------------------------------------------ | ------- | ----------- | ----------------------------------------------------------------- |
| [curly](patterns/curly.md)                                               | Yes     | Yes         | Enforce consistent brace style for all control statements         |
| [no-else-return](patterns/no-else-return.md)                             | Yes     | Yes         | Disallow else blocks after if statements with returns             |
| [no-lonely-if](patterns/no-lonely-if.md)                                 | Yes     | Yes         | Disallow if statements as the only statement in an else block     |
| [no-nested-ternary](patterns/no-nested-ternary.md)                       | Yes     | Yes         | Disallow nested ternary expressions                               |
| [no-fallthrough](patterns/no-fallthrough.md)                             | No      | Yes         | Disallow fallthrough in switch cases                              |
| [no-duplicate-case](patterns/no-duplicate-case.md)                       | No      | Yes         | Disallow duplicate cases in switch statements                     |
| [no-unreachable](patterns/no-unreachable.md)                             | No      | Yes         | Disallow unreachable code after return, throw, break, or continue |
| [no-return-await](patterns/no-return-await.md)                           | Yes     | Yes         | Disallow unnecessary return await                                 |
| [prefer-ternary-operator](patterns/prefer-ternary-operator.md)           | Yes     | Yes         | Prefer ternary operator over if-else for simple assignments       |
| [no-confusing-void-expression](patterns/no-confusing-void-expression.md) | No      | Yes         | Disallow confusing void expressions                               |
| [no-void](patterns/no-void.md)                                           | Yes     | No          | Disallow the void operator                                        |

### Errors & Exception Handling

| Rule                                                       | Fixable | Recommended | Description                                                |
| ---------------------------------------------------------- | ------- | ----------- | ---------------------------------------------------------- |
| [no-floating-promises](patterns/no-floating-promises.md)   | No      | Yes         | Disallow floating promises (unhandled promises)            |
| [no-misused-promises](patterns/no-misused-promises.md)     | Yes     | Yes         | Disallow misused promises and async functions              |
| [no-promise-as-boolean](patterns/no-promise-as-boolean.md) | No      | Yes         | Disallow using promises as boolean conditions              |
| [no-throw-sync](patterns/no-throw-sync.md)                 | Yes     | Yes         | Disallow throwing exceptions in synchronous code paths     |
| [use-isnan](patterns/use-isnan.md)                         | No      | Yes         | Require using isNaN() to check for NaN                     |
| [valid-typeof](patterns/valid-typeof.md)                   | Yes     | Yes         | Enforce comparing typeof expressions against valid strings |

### Object & Array Operations

| Rule                                                         | Fixable | Recommended | Description                                                        |
| ------------------------------------------------------------ | ------- | ----------- | ------------------------------------------------------------------ |
| [no-array-constructor](patterns/no-array-constructor.md)     | Yes     | Yes         | Disallow Array constructor                                         |
| [no-object-constructor](patterns/no-object-constructor.md)   | Yes     | Yes         | Disallow Object constructor                                        |
| [no-array-destructuring](patterns/no-array-destructuring.md) | No      | No          | Disallow array destructuring (in certain contexts)                 |
| [no-string-concat](patterns/no-string-concat.md)             | Yes     | Yes         | Disallow string concatenation when template literals are available |
| [no-sparse-arrays](patterns/no-sparse-arrays.md)             | No      | Yes         | Disallow sparse arrays                                             |
| [no-duplicate-keys](patterns/no-dupe-keys.md)                | No      | Yes         | Disallow duplicate keys in object literals                         |
| [no-dupe-args](patterns/no-dupe-args.md)                     | No      | Yes         | Disallow duplicate arguments in function definitions               |
| [no-dupe-class-members](patterns/no-dupe-class-members.md)   | No      | Yes         | Disallow duplicate class members                                   |
| [no-param-reassign](patterns/no-param-reassign.md)           | No      | Yes         | Disallow reassigning function parameters                           |
| [no-this-before-super](patterns/no-this-before-super.md)     | No      | Yes         | Disallow this/super before calling super() in constructors         |
| [no-class-assign](patterns/no-class-assign.md)               | No      | Yes         | Disallow modifying class declarations                              |

### Regular Expressions

| Rule                                                                       | Fixable | Recommended | Description                                        |
| -------------------------------------------------------------------------- | ------- | ----------- | -------------------------------------------------- |
| [no-control-regex](patterns/no-control-regex.md)                           | No      | Yes         | Disallow control characters in regular expressions |
| [no-empty-character-class](patterns/no-empty-character-class.md)           | No      | Yes         | Disallow empty character classes in regex          |
| [no-invalid-regexp](patterns/no-invalid-regexp.md)                         | No      | Yes         | Disallow invalid regular expression strings        |
| [no-misleading-character-class](patterns/no-misleading-character-class.md) | No      | Yes         | Disallow misleading character class in regex       |
| [no-regex-spaces](patterns/no-regex-spaces.md)                             | No      | Yes         | Disallow multiple spaces in regular expressions    |
| [prefer-regex-literals](patterns/prefer-regex-literals.md)                 | Yes     | Yes         | Prefer regex literals over RegExp constructor      |
| [prefer-regexp-exec](patterns/prefer-regexp-exec.md)                       | Yes     | Yes         | Prefer RegExp.exec() over String.match             |

### Variable & Scope

| Rule                                                                 | Fixable | Recommended | Description                                              |
| -------------------------------------------------------------------- | ------- | ----------- | -------------------------------------------------------- |
| [no-shadow](patterns/no-shadow.md)                                   | No      | No          | Disallow variable shadowing                              |
| [no-shadow-restricted-names](patterns/no-shadow-restricted-names.md) | No      | Yes         | Disallow shadowing of restricted names                   |
| [no-const-assign](patterns/no-const-assign.md)                       | No      | Yes         | Disallow reassigning const variables                     |
| [no-global-assign](patterns/no-global-assign.md)                     | No      | Yes         | Disallow assignment to native objects                    |
| [no-func-assign](patterns/no-func-assign.md)                         | No      | Yes         | Disallow reassigning function declarations               |
| [no-import-assign](patterns/no-import-assign.md)                     | No      | Yes         | Disallow assignment to imported bindings                 |
| [no-ex-assign](patterns/no-ex-assign.md)                             | No      | Yes         | Disallow reassigning exception variables in catch blocks |
| [no-delete-var](patterns/no-delete-var.md)                           | No      | Yes         | Disallow deleting variables                              |
| [no-redeclare](patterns/no-redeclare.md)                             | No      | Yes         | Disallow variable redeclaration                          |
| [no-undef](patterns/no-undef.md)                                     | No      | Yes         | Disallow undeclared variables                            |
| [no-unassigned-vars](patterns/no-unassigned-vars.md)                 | Yes     | Yes         | Disallow declared but unused variables                   |

### Type Safety

| Rule                                                                         | Fixable | Recommended | Description                                                      |
| ---------------------------------------------------------------------------- | ------- | ----------- | ---------------------------------------------------------------- |
| [explicit-module-boundary-types](patterns/explicit-module-boundary-types.md) | No      | No          | Require explicit return and argument types on exported functions |
| [require-await](patterns/require-await.md)                                   | No      | Yes         | Disallow async functions without await                           |
| [require-yield](patterns/require-yield.md)                                   | No      | Yes         | Disallow generator functions without yield                       |
| [require-return-type](patterns/require-return-type.md)                       | Yes     | No          | Require return type annotations                                  |
| [restrict-template-expressions](patterns/restrict-template-expressions.md)   | No      | No          | Restrict template expressions to simple expressions              |
| [consistent-type-exports](patterns/consistent-type-exports.md)               | Yes     | Yes         | Enforce consistent use of type exports                           |

### Code Style & Formatting

| Rule                                                             | Fixable | Recommended | Description                                   |
| ---------------------------------------------------------------- | ------- | ----------- | --------------------------------------------- |
| [no-multi-spaces](patterns/no-multi-spaces.md)                   | Yes     | Yes         | Disallow multiple spaces                      |
| [no-irregular-whitespace](patterns/no-irregular-whitespace.md)   | No      | Yes         | Disallow irregular whitespace                 |
| [eq-eq-eq](patterns/eq-eq-eq.md)                                 | Yes     | Yes         | Require === and !==                           |
| [no-implicit-coercion](patterns/no-implicit-coercion.md)         | Yes     | Yes         | Disallow implicit type coercion               |
| [no-loss-of-precision](patterns/no-loss-of-precision.md)         | No      | Yes         | Disallow numeric literals that lose precision |
| [no-useless-escape](patterns/no-useless-escape.md)               | Yes     | Yes         | Disallow unnecessary escape characters        |
| [no-useless-catch](patterns/no-useless-catch.md)                 | Yes     | Yes         | Disallow unnecessary catch clauses            |
| [no-useless-assignment](patterns/no-useless-assignment.md)       | Yes     | Yes         | Disallow assignments that have no effect      |
| [no-useless-backreference](patterns/no-useless-backreference.md) | Yes     | Yes         | Disallow useless backreferences in regex      |

### Deprecated & Dangerous Patterns

| Rule                                                                     | Fixable | Recommended | Description                                            |
| ------------------------------------------------------------------------ | ------- | ----------- | ------------------------------------------------------ |
| [no-with](patterns/no-with.md)                                           | No      | Yes         | Disallow with statements                               |
| [no-implied-eval](patterns/no-implied-eval.md)                           | No      | Yes         | Disallow implied eval()                                |
| [no-obj-calls](patterns/no-obj-calls.md)                                 | No      | Yes         | Disallow calling global object properties as functions |
| [no-new-native-nonconstructor](patterns/no-new-native-nonconstructor.md) | No      | Yes         | Disallow new with non-constructor functions            |
| [no-octal](patterns/no-octal.md)                                         | No      | Yes         | Disallow octal literals                                |
| [no-non-octal-decimal-escape](patterns/no-nonoctal-decimal-escape.md)    | No      | Yes         | Disallow non-octal decimal escape sequences            |

### Advanced Patterns

| Rule                                                                          | Fixable | Recommended | Description                                                  |
| ----------------------------------------------------------------------------- | ------- | ----------- | ------------------------------------------------------------ |
| [no-case-declarations](patterns/no-case-declarations.md)                      | No      | Yes         | Disallow lexical declarations in switch cases                |
| [no-cond-assign](patterns/no-cond-assign.md)                                  | No      | Yes         | Disallow assignment in conditional expressions               |
| [no-constant-binary-expression](correctness/no-constant-binary-expression.md) | Yes     | Yes         | Disallow constant binary expressions                         |
| [no-empty](patterns/no-empty.md)                                              | No      | Yes         | Disallow empty blocks                                        |
| [no-empty-static-block](patterns/no-empty-static-block.md)                    | No      | Yes         | Disallow empty static blocks                                 |
| [no-empty-pattern](patterns/no-empty-pattern.md)                              | No      | Yes         | Disallow empty destructuring patterns                        |
| [no-unsafe-assignment](patterns/no-unsafe-assignment.md)                      | No      | Yes         | Disallow unsafe assignments                                  |
| [no-unsafe-finally](patterns/no-unsafe-finally.md)                            | No      | Yes         | Disallow unsafe control flow in finally blocks               |
| [no-unsafe-negation](patterns/no-unsafe-negation.md)                          | No      | Yes         | Disallow unsafe negation                                     |
| [no-unsafe-optional-chaining](patterns/no-unsafe-optional-chaining.md)        | No      | Yes         | Disallow unsafe optional chaining                            |
| [no-unsafe-declaration-merging](patterns/no-unsafe-declaration-merging.md)    | No      | Yes         | Disallow unsafe declaration merging                          |
| [no-same-side-conditions](patterns/no-same-side-conditions.md)                | No      | Yes         | Disallow conditions where both sides are equivalent          |
| [no-simplifiable-pattern](patterns/no-simplifiable-pattern.md)                | Yes     | Yes         | Disallow simplifiable patterns                               |
| [no-self-assign](patterns/no-self-assign.md)                                  | No      | Yes         | Disallow assignments where both sides are identical          |
| [no-setter-return](patterns/no-setter-return.md)                              | No      | Yes         | Disallow returning values from setters                       |
| [no-compare-neg-zero](patterns/no-compare-neg-zero.md)                        | No      | Yes         | Disallow comparing against -0                                |
| [no-extra-boolean-cast](patterns/no-extra-boolean-cast.md)                    | Yes     | Yes         | Disallow unnecessary boolean casts                           |
| [no-prototype-builtins](patterns/no-prototype-builtins.md)                    | No      | Yes         | Disallow direct use of Object.prototype built-in methods     |
| [no-useless-fallback-in-spread](patterns/no-useless-fallback-in-spread.md)    | Yes     | Yes         | Disallow useless fallback in spread operators                |
| [no-type-only-return](patterns/no-type-only-return.md)                        | No      | Yes         | Disallow return statements that only return type information |
| [no-unexpected-multiline](patterns/no-unexpected-multiline.md)                | No      | Yes         | Disallow confusing multiline expressions                     |
| [no-var-requires](patterns/no-var-requires.md)                                | No      | Yes         | Disallow using require() in non-CommonJS contexts            |

### File & Function Limits

| Rule                                         | Fixable | Recommended | Description                            |
| -------------------------------------------- | ------- | ----------- | -------------------------------------- |
| [max-file-size](patterns/max-file-size.md)   | No      | No          | Enforce a maximum file size            |
| [max-union-size](patterns/max-union-size.md) | No      | No          | Enforce a maximum size for union types |

---

## Configuration

### Enable Rules

Add rules to your CodeForge configuration file (`.codeforgerc.json`):

```json
{
  "rules": {
    "max-complexity": "error",
    "max-params": ["warn", { "max": 5 }],
    "no-eval": "error",
    "prefer-const": "warn"
  }
}
```

### Rule Severity Levels

- **error**: CodeForge will exit with error code (1) when violations are found
- **warning**: CodeForge will display warnings but won't fail
- **off**: Disable the rule

### Rule Options

Many rules accept configuration options:

```json
{
  "rules": {
    "max-params": ["error", { "max": 5 }],
    "no-magic-numbers": ["warn", { "ignore": [0, 1, -1] }]
  }
}
```

## Auto-Fixable Rules

Rules marked as **Fixable** can be automatically fixed using:

```bash
# Fix all auto-fixable violations
codeforge fix

# Fix specific rules
codeforge fix --rules prefer-const,no-eval

# Preview fixes without applying them
codeforge fix --dry-run
```

---

## Contributing

To contribute new rules or improve existing ones, please refer to the [Contributing Guidelines](../CONTRIBUTING.md).

## License

MIT © CodeForge Team
