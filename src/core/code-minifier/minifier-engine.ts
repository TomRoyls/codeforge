import type { MinifyRule } from './types.js'

export class MinifierEngine {
  private rules: MinifyRule[] = []

  addRule(rule: MinifyRule): void {
    this.rules.push(rule)
  }

  removeRule(name: string): void {
    this.rules = this.rules.filter((r) => r.name !== name)
  }

  apply(code: string, options?: Partial<{ rulesToApply: string[] }>): string {
    const rulesToApply = options?.rulesToApply
    let result = code
    for (const rule of this.rules) {
      if (rulesToApply !== undefined) {
        if (!rulesToApply.includes(rule.name)) continue
      }
      result = rule.apply(result)
    }
    return result
  }

  getRules(): MinifyRule[] {
    return [...this.rules]
  }

  static getDefaultRules(): MinifyRule[] {
    return [
      {
        name: 'remove-single-line-comments',
        apply: (code: string): string => {
          const lines = code.split('\n')
          return lines
            .map((line) => {
              const singleQuoteIdx: number[] = []
              const doubleQuoteIdx: number[] = []
              const backtickIdx: number[] = []

              let inSingle = false
              let inDouble = false
              let inBacktick = false
              let inEscape = false

              for (let i = 0; i < line.length; i++) {
                const ch = line[i]!
                if (inEscape) {
                  inEscape = false
                  continue
                }
                if (ch === '\\' && (inSingle || inDouble || inBacktick)) {
                  inEscape = true
                  continue
                }
                if (ch === "'" && !inDouble && !inBacktick) {
                  inSingle = !inSingle
                  singleQuoteIdx.push(i)
                }
                if (ch === '"' && !inSingle && !inBacktick) {
                  inDouble = !inDouble
                  doubleQuoteIdx.push(i)
                }
                if (ch === '`' && !inSingle && !inDouble) {
                  inBacktick = !inBacktick
                  backtickIdx.push(i)
                }
              }

              for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === '/' && line[i + 1] === '/') {
                  const beforeSlash = line.substring(0, i)
                  if (beforeSlash.includes(':')) {
                    continue
                  }

                  let inString = false
                  let sqCount = 0
                  let dqCount = 0
                  let btCount = 0
                  for (let j = 0; j < i; j++) {
                    const c = beforeSlash[j]!
                    if (c === "'") sqCount++
                    if (c === '"') dqCount++
                    if (c === '`') btCount++
                  }
                  inString = (sqCount % 2 !== 0) || (dqCount % 2 !== 0) || (btCount % 2 !== 0)

                  if (!inString) {
                    const trailing = line.substring(i + 2).trim()
                    if (trailing.length > 0) {
                      return line.substring(0, i).replace(/\s+$/, '')
                    }
                    return line.substring(0, i).replace(/\s+$/, '')
                  }
                }
              }
              return line
            })
            .join('\n')
        },
      },
      {
        name: 'remove-multi-line-comments',
        apply: (code: string): string => {
          return code.replace(/\/\*[\s\S]*?\*\//g, '')
        },
      },
      {
        name: 'collapse-whitespace',
        apply: (code: string): string => {
          const lines = code.split('\n')
          return lines
            .map((line) => {
              let result = ''
              let inSingle = false
              let inDouble = false
              let inBacktick = false
              let i = 0
              while (i < line.length) {
                const ch = line[i]!
                if (ch === '\\' && (inSingle || inDouble || inBacktick)) {
                  result += ch
                  const next = line[i + 1]
                  if (next !== undefined) {
                    result += next
                    i += 2
                    continue
                  }
                  i++
                  continue
                }
                if (ch === "'" && !inDouble && !inBacktick) {
                  inSingle = !inSingle
                  result += ch
                  i++
                  continue
                }
                if (ch === '"' && !inSingle && !inBacktick) {
                  inDouble = !inDouble
                  result += ch
                  i++
                  continue
                }
                if (ch === '`' && !inSingle && !inDouble) {
                  inBacktick = !inBacktick
                  result += ch
                  i++
                  continue
                }
                if (!inSingle && !inDouble && !inBacktick && (ch === ' ' || ch === '\t')) {
                  let j = i
                  while (j < line.length && (line[j] === ' ' || line[j] === '\t')) {
                    j++
                  }
                  result += ' '
                  i = j
                  continue
                }
                result += ch
                i++
              }
              return result
            })
            .join('\n')
        },
      },
      {
        name: 'trim-lines',
        apply: (code: string): string => {
          return code
            .split('\n')
            .map((line) => line.trim())
            .join('\n')
        },
      },
      {
        name: 'remove-empty-lines',
        apply: (code: string): string => {
          return code.replace(/\n\s*\n/g, '\n')
        },
      },
      {
        name: 'collapse-booleans',
        apply: (code: string): string => {
          return code
            .split('\n')
            .map((line) => {
              let result = ''
              let inSingle = false
              let inDouble = false
              let inBacktick = false
              let i = 0
              while (i < line.length) {
                const ch = line[i]!
                if (ch === '\\' && (inSingle || inDouble || inBacktick)) {
                  result += ch
                  const next = line[i + 1]
                  if (next !== undefined) {
                    result += next
                    i += 2
                    continue
                  }
                  i++
                  continue
                }
                if (ch === "'" && !inDouble && !inBacktick) {
                  inSingle = !inSingle
                  result += ch
                  i++
                  continue
                }
                if (ch === '"' && !inSingle && !inBacktick) {
                  inDouble = !inDouble
                  result += ch
                  i++
                  continue
                }
                if (ch === '`' && !inSingle && !inDouble) {
                  inBacktick = !inBacktick
                  result += ch
                  i++
                  continue
                }
                if (!inSingle && !inDouble && !inBacktick) {
                  if (line.substring(i, i + 4) === 'true') {
                    const before = i > 0 ? line[i - 1] ?? '' : ''
                    const after = line[i + 4] ?? ''
                    if (/[a-zA-Z0-9_$]/.test(before) || /[a-zA-Z0-9_$]/.test(after)) {
                      result += 'true'
                      i += 4
                      continue
                    }
                    result += '!0'
                    i += 4
                    continue
                  }
                  if (line.substring(i, i + 5) === 'false') {
                    const before = i > 0 ? line[i - 1] ?? '' : ''
                    const after = line[i + 5] ?? ''
                    if (/[a-zA-Z0-9_$]/.test(before) || /[a-zA-Z0-9_$]/.test(after)) {
                      result += 'false'
                      i += 5
                      continue
                    }
                    result += '!1'
                    i += 5
                    continue
                  }
                }
                result += ch
                i++
              }
              return result
            })
            .join('\n')
        },
      },
      {
        name: 'shorten-undefined',
        apply: (code: string): string => {
          return code
            .split('\n')
            .map((line) => {
              let result = ''
              let inSingle = false
              let inDouble = false
              let inBacktick = false
              let i = 0
              while (i < line.length) {
                const ch = line[i]!
                if (ch === '\\' && (inSingle || inDouble || inBacktick)) {
                  result += ch
                  const next = line[i + 1]
                  if (next !== undefined) {
                    result += next
                    i += 2
                    continue
                  }
                  i++
                  continue
                }
                if (ch === "'" && !inDouble && !inBacktick) {
                  inSingle = !inSingle
                  result += ch
                  i++
                  continue
                }
                if (ch === '"' && !inSingle && !inBacktick) {
                  inDouble = !inDouble
                  result += ch
                  i++
                  continue
                }
                if (ch === '`' && !inSingle && !inDouble) {
                  inBacktick = !inBacktick
                  result += ch
                  i++
                  continue
                }
                if (!inSingle && !inDouble && !inBacktick && line.substring(i, i + 9) === 'undefined') {
                  const before = i > 0 ? line[i - 1] ?? '' : ''
                  const after = line[i + 9] ?? ''
                  if (/[a-zA-Z0-9_$]/.test(before) || /[a-zA-Z0-9_$]/.test(after)) {
                    result += 'undefined'
                    i += 9
                    continue
                  }
                  result += 'void 0'
                  i += 9
                  continue
                }
                result += ch
                i++
              }
              return result
            })
            .join('\n')
        },
      },
      {
        name: 'remove-console',
        apply: (code: string): string => {
          return code.replace(/^[ \t]*console\.(log|warn|error|info|debug)\([^)]*\);?\s*$/gm, '')
        },
      },
    ]
  }
}
