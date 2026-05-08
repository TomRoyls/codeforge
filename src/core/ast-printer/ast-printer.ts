import type { ASTNode, PrintOptions, PrintResult } from './types.js'
import { DEFAULT_PRINT_OPTIONS } from './types.js'
import { CodePrinter } from './code-printer.js'

export class ASTPrinter {
  print(node: ASTNode, options: Partial<PrintOptions> = {}): PrintResult {
    const opts: PrintOptions = { ...DEFAULT_PRINT_OPTIONS, ...options }
    const printer = new CodePrinter(opts)
    const mapping: PrintResult['mapping'] = []
    this.printNode(node, printer, opts, mapping)
    const code = printer.getResult()
    return {
      code,
      lines: printer.getLineCount(),
      mapping,
    }
  }

  printProgram(body: ASTNode[]): PrintResult {
    const mapping: PrintResult['mapping'] = []
    const printer = new CodePrinter()
    for (let i = 0; i < body.length; i++) {
      this.printNode(body[i]!, printer, DEFAULT_PRINT_OPTIONS, mapping)
      if (i < body.length - 1) {
        printer.newLine()
      }
    }
    const code = printer.getResult()
    return {
      code,
      lines: printer.getLineCount(),
      mapping,
    }
  }

  printFunction(
    name: string,
    params: string[],
    body: string,
    options: Partial<PrintOptions> = {},
  ): string {
    const opts: PrintOptions = { ...DEFAULT_PRINT_OPTIONS, ...options }
    const printer = new CodePrinter(opts)
    const semi = opts.semicolons ? ';' : ''
    const paramsStr = params.join(', ')
    printer.writeIndent()
    printer.write(`function ${name}(${paramsStr}) {`)
    printer.newLine()
    printer.indent()
    const bodyLines = body.split('\n')
    for (const line of bodyLines) {
      printer.writeIndent()
      printer.writeLine(line + semi)
    }
    printer.dedent()
    printer.writeIndent()
    printer.write('}')
    return printer.getResult()
  }

  printClass(
    name: string,
    methods: string[],
    properties: string[],
    options: Partial<PrintOptions> = {},
  ): string {
    const opts: PrintOptions = { ...DEFAULT_PRINT_OPTIONS, ...options }
    const printer = new CodePrinter(opts)
    printer.writeIndent()
    printer.write(`class ${name} {`)
    printer.newLine()
    printer.indent()
    for (const prop of properties) {
      printer.writeIndent()
      printer.writeLine(prop)
    }
    if (properties.length > 0 && methods.length > 0) {
      printer.newLine()
    }
    for (const method of methods) {
      printer.writeIndent()
      printer.writeLine(method)
    }
    printer.dedent()
    printer.writeIndent()
    printer.write('}')
    return printer.getResult()
  }

  printObject(
    entries: Array<[string, string]>,
    options: Partial<PrintOptions> = {},
  ): string {
    const opts: PrintOptions = { ...DEFAULT_PRINT_OPTIONS, ...options }
    const printer = new CodePrinter(opts)
    const quote = opts.singleQuotes ? "'" : '"'
    const compress = opts.compress
    if (entries.length === 0) {
      return '{}'
    }
    printer.write('{')
    if (!compress) printer.newLine()
    printer.indent()
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i]!
      const needsQuote = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
      const formattedKey = needsQuote ? `${quote}${key}${quote}` : key
      if (compress) {
        printer.write(`${formattedKey}: ${value}`)
        if (i < entries.length - 1) {
          printer.write(', ')
        }
      } else {
        printer.writeIndent()
        printer.write(`${formattedKey}: ${value}`)
        if (i < entries.length - 1) {
          printer.write(',')
        }
        printer.newLine()
      }
    }
    printer.dedent()
    if (!compress) {
      printer.writeIndent()
    }
    printer.write('}')
    return printer.getResult()
  }

  printArray(items: string[], options: Partial<PrintOptions> = {}): string {
    const opts: PrintOptions = { ...DEFAULT_PRINT_OPTIONS, ...options }
    const printer = new CodePrinter(opts)
    if (items.length === 0) {
      return '[]'
    }
    printer.write('[')
    if (!opts.compress) printer.newLine()
    printer.indent()
    for (let i = 0; i < items.length; i++) {
      if (opts.compress) {
        printer.write(items[i]!)
        if (i < items.length - 1) {
          printer.write(', ')
        }
      } else {
        printer.writeIndent()
        printer.write(items[i]!)
        if (i < items.length - 1) {
          printer.write(',')
        }
        printer.newLine()
      }
    }
    printer.dedent()
    if (!opts.compress) {
      printer.writeIndent()
    }
    printer.write(']')
    return printer.getResult()
  }

  printImport(
    module: string,
    names: string[],
    options: Partial<PrintOptions> = {},
  ): string {
    const opts: PrintOptions = { ...DEFAULT_PRINT_OPTIONS, ...options }
    const quote = opts.singleQuotes ? "'" : '"'
    const semi = opts.semicolons ? ';' : ''
    if (names.length === 0) {
      return `import ${quote}${module}${quote}${semi}`
    }
    if (names.length === 1 && names[0] === '*') {
      return `import * as ${names[0]} from ${quote}${module}${quote}${semi}`
    }
    const namesStr = names.join(', ')
    return `import { ${namesStr} } from ${quote}${module}${quote}${semi}`
  }

  printExport(
    name: string,
    value: string,
    options: Partial<PrintOptions> = {},
  ): string {
    const opts: PrintOptions = { ...DEFAULT_PRINT_OPTIONS, ...options }
    const semi = opts.semicolons ? ';' : ''
    return `export const ${name} = ${value}${semi}`
  }

  private printNode(
    node: ASTNode,
    printer: CodePrinter,
    opts: PrintOptions,
    mapping: PrintResult['mapping'],
  ): void {
    const quote = opts.singleQuotes ? "'" : '"'
    const semi = opts.semicolons ? ';' : ''
    const lineCount = printer.getLineCount()
    const col = printer.getCurrentIndent().length
    mapping.push({ nodeType: node.type, line: lineCount + 1, column: col })

    switch (node.type) {
      case 'Program': {
        const children = node.children ?? []
        for (let i = 0; i < children.length; i++) {
          this.printNode(children[i]!, printer, opts, mapping)
          if (i < children.length - 1) {
            printer.newLine()
          }
        }
        break
      }
      case 'FunctionDeclaration': {
        const name = (node.properties?.name as string) ?? 'anonymous'
        const params = (node.properties?.params as string[]) ?? []
        printer.writeIndent()
        printer.write(`function ${name}(${params.join(', ')}) {`)
        printer.newLine()
        printer.indent()
        for (const child of node.children ?? []) {
          this.printNode(child, printer, opts, mapping)
        }
        printer.dedent()
        printer.writeIndent()
        printer.write(`}${semi}`)
        printer.newLine()
        break
      }
      case 'ClassDeclaration': {
        const name = (node.properties?.name as string) ?? 'Anonymous'
        printer.writeIndent()
        printer.write(`class ${name} {`)
        printer.newLine()
        printer.indent()
        for (const child of node.children ?? []) {
          this.printNode(child, printer, opts, mapping)
        }
        printer.dedent()
        printer.writeIndent()
        printer.write(`}`)
        printer.newLine()
        break
      }
      case 'VariableDeclaration': {
        const kind = (node.properties?.kind as string) ?? 'const'
        const name = (node.properties?.name as string) ?? 'x'
        printer.writeIndent()
        printer.write(`${kind} ${name}`)
        if (node.children && node.children.length > 0) {
          printer.write(' = ')
          for (const child of node.children) {
            this.printNode(child, printer, opts, mapping)
          }
        }
        printer.write(semi)
        printer.newLine()
        break
      }
      case 'ReturnStatement': {
        printer.writeIndent()
        printer.write('return')
        if (node.children && node.children.length > 0) {
          printer.write(' ')
          for (const child of node.children) {
            this.printNode(child, printer, opts, mapping)
          }
        }
        printer.write(semi)
        printer.newLine()
        break
      }
      case 'ExpressionStatement': {
        printer.writeIndent()
        for (const child of node.children ?? []) {
          this.printNode(child, printer, opts, mapping)
        }
        printer.write(semi)
        printer.newLine()
        break
      }
      case 'Literal': {
        const value = node.value ?? ''
        if (typeof node.properties?.raw === 'string') {
          printer.write(node.properties.raw as string)
        } else if (/^-?\d+(\.\d+)?$/.test(value)) {
          printer.write(value)
        } else {
          printer.write(`${quote}${value}${quote}`)
        }
        break
      }
      case 'Identifier': {
        printer.write(node.value ?? 'undefined')
        break
      }
      case 'CallExpression': {
        for (const child of node.children ?? []) {
          this.printNode(child, printer, opts, mapping)
        }
        printer.write('(')
        const args = (node.properties?.arguments as ASTNode[]) ?? []
        for (let i = 0; i < args.length; i++) {
          this.printNode(args[i]!, printer, opts, mapping)
          if (i < args.length - 1) {
            printer.write(', ')
          }
        }
        printer.write(')')
        break
      }
      case 'MemberExpression': {
        const children = node.children ?? []
        if (children.length >= 2) {
          this.printNode(children[0]!, printer, opts, mapping)
          const computed = node.properties?.computed === true
          if (computed) {
            printer.write('[')
            this.printNode(children[1]!, printer, opts, mapping)
            printer.write(']')
          } else {
            printer.write('.')
            this.printNode(children[1]!, printer, opts, mapping)
          }
        }
        break
      }
      case 'BinaryExpression':
      case 'AssignmentExpression': {
        const op = (node.properties?.operator as string) ?? '+'
        const children = node.children ?? []
        if (children.length >= 2) {
          this.printNode(children[0]!, printer, opts, mapping)
          printer.write(` ${op} `)
          this.printNode(children[1]!, printer, opts, mapping)
        }
        break
      }
      case 'ObjectExpression': {
        printer.write('{')
        const children = node.children ?? []
        if (children.length > 0) {
          printer.newLine()
          printer.indent()
          for (let i = 0; i < children.length; i++) {
            this.printNode(children[i]!, printer, opts, mapping)
            if (i < children.length - 1) {
              printer.write(',')
            }
            printer.newLine()
          }
          printer.dedent()
          printer.writeIndent()
        }
        printer.write('}')
        break
      }
      case 'Property': {
        const key = (node.properties?.key as string) ?? (node.value ?? '')
        const computed = node.properties?.computed === true
        const formattedKey = computed ? `[${key}]` : key
        printer.write(`${formattedKey}: `)
        for (const child of node.children ?? []) {
          this.printNode(child, printer, opts, mapping)
        }
        break
      }
      case 'ArrayExpression': {
        printer.write('[')
        const children = node.children ?? []
        if (children.length > 0) {
          printer.newLine()
          printer.indent()
          for (let i = 0; i < children.length; i++) {
            printer.writeIndent()
            this.printNode(children[i]!, printer, opts, mapping)
            if (i < children.length - 1) {
              printer.write(',')
            }
            printer.newLine()
          }
          printer.dedent()
          printer.writeIndent()
        }
        printer.write(']')
        break
      }
      case 'IfStatement': {
        printer.writeIndent()
        printer.write('if (')
        const children = node.children ?? []
        if (children.length > 0) {
          this.printNode(children[0]!, printer, opts, mapping)
        }
        printer.write(') {')
        printer.newLine()
        printer.indent()
        if (children.length > 1) {
          this.printNode(children[1]!, printer, opts, mapping)
        }
        printer.dedent()
        printer.writeIndent()
        printer.write('}')
        if (children.length > 2) {
          printer.write(' else {')
          printer.newLine()
          printer.indent()
          this.printNode(children[2]!, printer, opts, mapping)
          printer.dedent()
          printer.writeIndent()
          printer.write('}')
        }
        printer.newLine()
        break
      }
      case 'BlockStatement': {
        for (const child of node.children ?? []) {
          this.printNode(child, printer, opts, mapping)
        }
        break
      }
      case 'ImportDeclaration': {
        const source = (node.properties?.source as string) ?? ''
        const names = (node.properties?.names as string[]) ?? []
        printer.writeIndent()
        printer.write(this.printImport(source, names, opts))
        printer.newLine()
        break
      }
      case 'ExportNamedDeclaration': {
        printer.writeIndent()
        for (const child of node.children ?? []) {
          this.printNode(child, printer, opts, mapping)
        }
        break
      }
      default: {
        if (node.value !== undefined) {
          printer.write(node.value)
        }
        for (const child of node.children ?? []) {
          this.printNode(child, printer, opts, mapping)
        }
        break
      }
    }
  }
}
