import chalk from 'chalk'

type IgnoreAction = 'add' | 'list' | 'remove'

export interface IgnoreOptions {
  action: IgnoreAction
  file: string
  pattern?: string
}

/**
 * Extract non-empty, non-comment patterns from ignore file content.
 */
export function extractPatterns(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
}

/**
 * Check if a pattern already exists in the file lines (exact match ignoring whitespace).
 */
export function isDuplicatePattern(lines: string[], pattern: string): boolean {
  const trimmedPattern = pattern.trim()
  return lines.some((line) => line.trim() === trimmedPattern)
}

/**
 * Add a pattern to file content. Returns the new content.
 */
export function addPatternToContent(content: string, pattern: string): string {
  return content.trim() === '' ? pattern : `${content}\n${pattern}`
}

/**
 * Remove a pattern from file content. Returns the new content and whether it was found.
 */
export function removePatternFromContent(
  content: string,
  pattern: string,
): { content: string; found: boolean } {
  const lines = content.split('\n')
  const trimmedPattern = pattern.trim()

  const lineIndex = lines.findIndex((line) => line.trim() === trimmedPattern)

  if (lineIndex === -1) {
    return { content, found: false }
  }

  lines.splice(lineIndex, 1)
  return { content: lines.join('\n'), found: true }
}

/**
 * Resolve parsed args and flags into an IgnoreOptions object.
 */
export function resolveIgnoreOptions(
  args: Record<string, unknown>,
  flags: Record<string, unknown>,
): IgnoreOptions {
  return {
    action: args.action as IgnoreAction,
    file: flags.file as string,
    pattern: args.pattern as string | undefined,
  }
}

/**
 * Display a list of ignore patterns using the provided log function.
 */
export function formatPatternList(
  patterns: string[],
  filePath: string,
  logFn: (msg: string) => void,
): void {
  logFn(chalk.bold('Ignore Patterns'))
  logFn('')
  logFn(chalk.gray(`File: ${filePath}`))
  logFn('')

  if (patterns.length === 0) {
    logFn(chalk.gray('(empty)'))
  } else {
    for (const pattern of patterns) {
      logFn(`  ${pattern}`)
    }
  }

  logFn('')
  logFn(chalk.gray(`${patterns.length} pattern${patterns.length === 1 ? '' : 's'} found`))
}

/**
 * Display a "no ignore file" message using the provided log function.
 */
export function formatNoFileMessage(filePath: string, logFn: (msg: string) => void): void {
  logFn(chalk.gray(`No ignore file found at ${filePath}`))
  logFn(chalk.gray('Use "codeforge ignore add <pattern>" to create one'))
}

/**
 * Display a successful add result using the provided log function.
 */
export function formatAddResult(
  pattern: string,
  filePath: string,
  logFn: (msg: string) => void,
): void {
  logFn(chalk.green(`✓ Added pattern "${pattern}" to ${filePath}`))
}

/**
 * Display a duplicate pattern warning using the provided log function.
 */
export function formatDuplicateWarning(pattern: string, logFn: (msg: string) => void): void {
  logFn(chalk.yellow(`Pattern "${pattern}" already exists in ignore file`))
}

/**
 * Display a successful remove result using the provided log function.
 */
export function formatRemoveResult(
  pattern: string,
  filePath: string,
  logFn: (msg: string) => void,
): void {
  logFn(chalk.green(`✓ Removed pattern "${pattern}" from ${filePath}`))
}
