import { readFile } from 'node:fs/promises'
import { DecoratorExtractor } from './decorator-extractor.js'
import { DecoratorAnalyzer } from './decorator-analyzer.js'
import type { DecoratorReport } from './types.js'

export class DecoratorParser {
  private extractor = new DecoratorExtractor()
  private analyzer = new DecoratorAnalyzer()

  parse(source: string): DecoratorReport {
    const decorators = this.extractor.extract(source)
    return this.analyzer.analyze(decorators, source)
  }

  async parseFile(filePath: string): Promise<DecoratorReport> {
    const source = await readFile(filePath, 'utf-8')
    return this.parse(source)
  }

  getDecoratorNames(source: string): string[] {
    const decorators = this.extractor.extract(source)
    const seen = new Set<string>()
    const names: string[] = []
    for (const d of decorators) {
      if (!seen.has(d.name)) {
        seen.add(d.name)
        names.push(d.name)
      }
    }
    return names
  }

  hasDecorator(source: string, name: string): boolean {
    const decorators = this.extractor.extract(source)
    return decorators.some((d) => d.name === name)
  }

  getDecoratorCount(source: string): number {
    return this.extractor.extract(source).length
  }

  validate(source: string): string[] {
    const errors: string[] = []
    const decorators = this.extractor.extract(source)

    for (const d of decorators) {
      if (d.isFactory) {
        const block = this.extractor.findDecoratorBlock(d.source, d.source.indexOf('('))
        if (d.source.includes('(') && !d.source.includes(')')) {
          if (!block.content.includes(')')) {
            errors.push(`Unclosed parenthesis in decorator @${d.name} at line ${d.line}`)
          }
        }
      }

      if (d.args.length > 0 && d.name.length === 0) {
        errors.push(`Anonymous decorator at line ${d.line}`)
      }
    }

    const lines = source.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!.trim()
      if (line.startsWith('@') && !line.match(/^@[a-zA-Z_]\w*/)) {
        errors.push(`Invalid decorator syntax at line ${i + 1}: "${line}"`)
      }
    }

    return errors
  }
}
