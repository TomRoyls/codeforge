function testFunc(lineNumber: number, column: number) {
  return {
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 15 },
    },
  }
}
