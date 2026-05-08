import type { MinifyOptions, MinifyResult, MinifyRule } from './types.js'
import { DEFAULT_MINIFY_OPTIONS } from './types.js'
import { MinifierEngine } from './minifier-engine.js'

export class CodeMinifier {
  private options: MinifyOptions
  private engine: MinifierEngine

  constructor(options?: Partial<MinifyOptions>) {
    this.options = { ...DEFAULT_MINIFY_OPTIONS, ...options }
    this.engine = new MinifierEngine()
    const defaultRules = MinifierEngine.getDefaultRules()
    for (const rule of defaultRules) {
      this.engine.addRule(rule)
    }
  }

  minify(code: string): MinifyResult {
    const originalSize = code.length
    const rulesApplied = this.selectRules()
    const engineCopy = new MinifierEngine()
    for (const ruleName of rulesApplied) {
      const rule = this.engine.getRules().find((r) => r.name === ruleName)
      if (rule) {
        engineCopy.addRule(rule)
      }
    }
    const minified = engineCopy.apply(code)
    const minifiedSize = minified.length
    const savings = originalSize > 0 ? Math.round(((originalSize - minifiedSize) / originalSize) * 10000) / 100 : 0
    return {
      original: code,
      minified,
      originalSize,
      minifiedSize,
      savings,
      rulesApplied,
    }
  }

  minifyFile(content: string): MinifyResult {
    return this.minify(content)
  }

  minifyBatch(files: Map<string, string>): Map<string, MinifyResult> {
    const results = new Map<string, MinifyResult>()
    for (const [path, content] of files) {
      results.set(path, this.minify(content))
    }
    return results
  }

  getOptions(): MinifyOptions {
    return { ...this.options }
  }

  estimateSavings(code: string): number {
    const result = this.minify(code)
    return result.savings
  }

  getDefaultRules(): MinifyRule[] {
    return MinifierEngine.getDefaultRules()
  }

  private selectRules(): string[] {
    const rules: string[] = []
    if (this.options.removeComments) {
      rules.push('remove-single-line-comments')
      rules.push('remove-multi-line-comments')
    }
    if (this.options.removeWhitespace) {
      rules.push('collapse-whitespace')
      rules.push('trim-lines')
      rules.push('remove-empty-lines')
    }
    if (this.options.collapseBooleans) {
      rules.push('collapse-booleans')
    }
    rules.push('shorten-undefined')
    rules.push('remove-console')
    return rules
  }
}

export type { MinifyOptions, MinifyResult, MinifyRule } from './types.js'
export { DEFAULT_MINIFY_OPTIONS } from './types.js'
export { MinifierEngine } from './minifier-engine.js'
