export const RULE_SUGGESTIONS = {
  noArrayConstructor: ' Use array literal [] instead of new Array().',
  noArrayDestructuring: ' For large arrays, use concat() or slice() instead of spread operator.',
  noAsyncPromiseExecutor: ' Use the async function directly or refactor the executor.',
  noAsyncWithoutAwait: ' Remove the async keyword if no await is present.',
  noCaseDeclarations: ' Move the declaration to an outer block.',
  useLoggingLibrary: "Use a logging library instead of debugger statements.",
  noConsoleLog: "Use a logging library like winston or pino for production code.",
  useStrictEquality: "Use strict equality (===) to avoid unexpected type coercion.",
  preferObjectSpread: "Use object spread (...) instead of Object.assign() for better readability.",
  preferOptionalChain: "Use optional chaining (?.) for safer property access.",
  noEval: "Avoid eval() for security. Use JSON.parse() for JSON or Function() constructor.",
  preferConst: "Use const for variables that are never reassigned.",
} as const
