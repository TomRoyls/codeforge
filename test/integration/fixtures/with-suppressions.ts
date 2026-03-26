// Integration test fixture with suppression comments

// codeforge-disable-next-line max-complexity
function suppressedComplexFunction(a: number, b: number, c: number) {
  if (a > 0) {
    if (b > 0) {
      if (c > 0) {
        return a + b + c
      }
    }
  }
  return 0
}

// This violation should NOT be suppressed (no suppression comment)
function notSuppressedFunction(x: number) {
  if (x > 0) {
    if (x > 10) {
      if (x > 100) {
        return x * 2
      }
    }
  }
  return x
}

// codeforge-disable-next-line no-console
console.log('This should be suppressed')

// This console should NOT be suppressed
console.error('This should appear')

// codeforge-disable no-eval
const suppressedEval = eval('1 + 1')
const anotherSuppressedEval = eval('2 + 2')
// codeforge-enable no-eval

// This eval should NOT be suppressed (after enable)
const notSuppressedEval = eval('3 + 3')

export {
  suppressedComplexFunction,
  notSuppressedFunction,
  suppressedEval,
  anotherSuppressedEval,
  notSuppressedEval,
}
