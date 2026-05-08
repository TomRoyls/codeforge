import type { MatchPattern } from './types.js'

export class PatternCompiler {
  compile(pattern: MatchPattern): MatchPattern {
    const errors = this.validate(pattern)
    if (errors.length > 0) {
      throw new Error(`Invalid pattern: ${errors.join(', ')}`)
    }
    return this.deepClone(pattern)
  }

  compileFromObject(obj: Record<string, unknown>): MatchPattern {
    const pattern: MatchPattern = {
      type: typeof obj.type === 'string' ? obj.type : '',
    }
    if (typeof obj.value === 'string') {
      pattern.value = obj.value
    }
    if (obj.properties && typeof obj.properties === 'object' && obj.properties !== null) {
      pattern.properties = obj.properties as Record<string, string>
    }
    if (Array.isArray(obj.children)) {
      pattern.children = (obj.children as Record<string, unknown>[]).map(
        (child) => this.compileFromObject(child),
      )
    }
    if (typeof obj.captureName === 'string') {
      pattern.captureName = obj.captureName
    }
    return this.compile(pattern)
  }

  validate(pattern: MatchPattern): string[] {
    const errors: string[] = []
    if (!pattern.type || pattern.type.length === 0) {
      errors.push('Pattern must have a non-empty type')
    }
    if (pattern.children) {
      for (const child of pattern.children) {
        errors.push(...this.validate(child))
      }
    }
    return errors
  }

  getCaptureNames(pattern: MatchPattern): string[] {
    const names: string[] = []
    if (pattern.captureName) {
      names.push(pattern.captureName)
    }
    if (pattern.children) {
      for (const child of pattern.children) {
        names.push(...this.getCaptureNames(child))
      }
    }
    return names
  }

  private deepClone(pattern: MatchPattern): MatchPattern {
    const cloned: MatchPattern = {
      type: pattern.type,
    }
    if (pattern.value !== undefined) {
      cloned.value = pattern.value
    }
    if (pattern.properties) {
      cloned.properties = { ...pattern.properties }
    }
    if (pattern.captureName) {
      cloned.captureName = pattern.captureName
    }
    if (pattern.children) {
      cloned.children = pattern.children.map((child) => this.deepClone(child))
    }
    return cloned
  }
}
