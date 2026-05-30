import { describe, expect, it } from 'vitest'

import { CodePrinter } from '../../../src/core/ast-printer/code-printer.js'

describe('CodePrinter', () => {
  it('writes text to current line', () => {
    const printer = new CodePrinter()
    printer.write('hello')
    expect(printer.getResult()).toBe('hello\n')
  })

  it('writeLine adds a line', () => {
    const printer = new CodePrinter()
    printer.writeLine('hello')
    printer.writeLine('world')
    expect(printer.getResult()).toBe('hello\nworld\n')
  })

  it('indents text', () => {
    const printer = new CodePrinter()
    printer.writeLine('root')
    printer.indent()
    printer.writeIndent()
    printer.writeLine('child')
    expect(printer.getResult()).toContain('  child')
  })

  it('dedents text', () => {
    const printer = new CodePrinter()
    printer.indent()
    printer.indent()
    printer.dedent()
    printer.writeIndent()
    printer.writeLine('text')
    expect(printer.getResult()).toContain('  text')
  })

  it('dedent does not go below 0', () => {
    const printer = new CodePrinter()
    printer.dedent()
    expect(printer.getIndentLevel()).toBe(0)
  })

  it('newLine starts a new line', () => {
    const printer = new CodePrinter()
    printer.write('a')
    printer.newLine()
    printer.write('b')
    expect(printer.getResult()).toBe('a\nb\n')
  })

  it('reset clears state', () => {
    const printer = new CodePrinter()
    printer.write('text')
    printer.indent()
    printer.reset()
    expect(printer.getResult()).toBe('\n')
    expect(printer.getIndentLevel()).toBe(0)
  })

  it('getLineCount counts lines', () => {
    const printer = new CodePrinter()
    printer.writeLine('a')
    printer.writeLine('b')
    expect(printer.getLineCount()).toBe(2)
  })

  it('getLineCount includes current line', () => {
    const printer = new CodePrinter()
    printer.writeLine('a')
    printer.write('current')
    expect(printer.getLineCount()).toBe(2)
  })

  it('getOptions returns options copy', () => {
    const printer = new CodePrinter({ indentSize: 4 })
    const opts = printer.getOptions()
    expect(opts.indentSize).toBe(4)
  })

  it('getIndentLevel returns current indent', () => {
    const printer = new CodePrinter()
    expect(printer.getIndentLevel()).toBe(0)
    printer.indent()
    expect(printer.getIndentLevel()).toBe(1)
  })

  it('supports tab indentation', () => {
    const printer = new CodePrinter({ indentStyle: 'tab' })
    printer.indent()
    printer.writeIndent()
    printer.writeLine('code')
    expect(printer.getResult()).toContain('\tcode')
  })

  it('compress mode joins lines', () => {
    const printer = new CodePrinter({ compress: true })
    printer.writeLine('a')
    printer.writeLine('b')
    const result = printer.getResult()
    expect(result).not.toContain('\n')
    expect(result).toContain('a b')
  })

  it('trailing newline option', () => {
    const printer = new CodePrinter({ trailingNewline: true })
    printer.writeLine('code')
    expect(printer.getResult()).toMatch(/\n$/)
  })

  it('no trailing newline when disabled', () => {
    const printer = new CodePrinter({ trailingNewline: false })
    printer.writeLine('code')
    expect(printer.getResult()).not.toMatch(/\n$/)
  })

  it('wrapText wraps long lines', () => {
    const printer = new CodePrinter()
    const lines = printer.wrapText('a b c d e f g h i j k l m n o p', 20)
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(22)
    }
  })

  it('wrapText returns single line for short text', () => {
    const printer = new CodePrinter()
    const lines = printer.wrapText('short text')
    expect(lines).toHaveLength(1)
  })

  it('wrapText respects indent', () => {
    const printer = new CodePrinter()
    printer.indent()
    const lines = printer.wrapText('hello world', 20)
    expect(lines[0]).toMatch(/^\s{2}/)
  })

  it('custom indent size', () => {
    const printer = new CodePrinter({ indentSize: 4 })
    printer.indent()
    printer.writeIndent()
    printer.writeLine('code')
    expect(printer.getResult()).toContain('    code')
  })

  it('multiple indent levels', () => {
    const printer = new CodePrinter()
    printer.indent()
    printer.indent()
    printer.indent()
    printer.writeIndent()
    printer.writeLine('deep')
    expect(printer.getResult()).toContain('      deep')
  })
})
