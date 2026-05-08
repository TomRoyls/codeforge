import type { ScaffoldTemplate } from './types.js'

export class TemplateProcessor {
  process(template: string, variables: Record<string, string>): string {
    return template.replace(
      /\{\{(\w+)(?::([^}]*))?\}\}/g,
      (fullMatch: string, varName: string, defaultVal: string | undefined) => {
        const value = variables[varName]
        if (value !== undefined) {
          return value
        }
        if (defaultVal !== undefined) {
          return defaultVal
        }
        return fullMatch
      },
    )
  }

  processPath(path: string, variables: Record<string, string>): string {
    return this.process(path, variables)
  }

  validateVariables(template: ScaffoldTemplate, provided: Record<string, string>): string[] {
    const missing: string[] = []
    for (const v of template.variables) {
      if (v.required && provided[v.name] === undefined) {
        missing.push(v.name)
      }
    }
    return missing
  }

  extractVariables(template: string): string[] {
    const regex = /\{\{(\w+)(?::[^}]*)?\}\}/g
    const names = new Set<string>()
    let match: RegExpExecArray | null
    while ((match = regex.exec(template)) !== null) {
      const name = match[1]
      if (name !== undefined) {
        names.add(name)
      }
    }
    return Array.from(names)
  }
}
