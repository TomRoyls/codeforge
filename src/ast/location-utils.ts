/**
 * Shared AST utility functions for extracting source locations
 */

export interface SourceLocation {
  end: { column: number; line: number; }
  start: { column: number; line: number; }
}

/**
 * Extract source location from an AST node
 * @param node - The AST node (can be any object with a loc property)
 * @param defaultLine - Default line number if location not found (default: 1)
 * @returns SourceLocation with start and end positions
 */
export function extractLocation(node: unknown, defaultLine: number = 1): SourceLocation {
  const defaultLoc: SourceLocation = {
    end: { column: 1, line: defaultLine },
    start: { column: 0, line: defaultLine },
  }

  if (!node || typeof node !== 'object') {
    return defaultLoc
  }

  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined

  if (!loc) {
    return defaultLoc
  }

  const start = loc.start as Record<string, unknown> | undefined
  const end = loc.end as Record<string, unknown> | undefined

  return {
    end: {
      column: typeof end?.column === 'number' ? end.column : 0,
      line: typeof end?.line === 'number' ? end.line : defaultLine,
    },
    start: {
      column: typeof start?.column === 'number' ? start.column : 0,
      line: typeof start?.line === 'number' ? start.line : defaultLine,
    },
  }
}
