export function capitalize(str: string): string {
  if (str.length === 0) return str
  return str[0]!.toUpperCase() + str.slice(1)
}

export function camelCase(str: string): string {
  return str
    .replace(/[_\s-]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^[A-Z]/, (char: string) => char.toLowerCase())
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
}

export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - suffix.length) + suffix
}

export function trimLines(str: string): string {
  return str
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function indent(str: string, spaces: number): string {
  const prefix = ' '.repeat(spaces)
  return str
    .split('\n')
    .map((line) => (line.length > 0 ? prefix + line : line))
    .join('\n')
}

export function isBlank(str: string): boolean {
  return str.trim().length === 0
}

export function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

/** Escapes special regex characters in a string so it can be used in a RegExp constructor */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Counts the number of lines in a string (handles trailing newlines correctly) */
export function countLines(str: string): number {
  return str.split('\n').length
}

/** Wraps text to a given column width, preserving existing newlines */
export function wordWrap(str: string, width: number): string {
  if (width < 1) return str
  const lines = str.split('\n')
  return lines
    .map((line) => {
      if (line.length <= width) return line
      const wrapped: string[] = []
      let remaining = line
      while (remaining.length > width) {
        let breakAt = remaining.lastIndexOf(' ', width)
        if (breakAt <= 0) breakAt = width
        wrapped.push(remaining.slice(0, breakAt))
        remaining = remaining.slice(breakAt).trimStart()
      }
      if (remaining.length > 0) wrapped.push(remaining)
      return wrapped.join('\n')
    })
    .join('\n')
}
