/**
 * Shared AST utility functions for extracting source locations
 */

export interface SourceLocation {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

/**
 * Extract source location from an AST node
 * @param node - The AST node (can be any object with a loc property)
 * @param defaultLine - Default line number if location not found (default: 1)
 * @returns SourceLocation with start and end positions
 */
export function extractLocation(
  node: unknown,
  defaultLine: number = 1
): SourceLocation {
  const defaultLoc: SourceLocation = {
    start: { line: defaultLine, column: 0 },
    end: { line: defaultLine, column: 1 },
  };

  if (!node || typeof node !== 'object') {
    return defaultLoc;
  }

  const n = node as Record<string, unknown>;
  const loc = n.loc as Record<string, unknown> | undefined;

  if (!loc) {
    return defaultLoc;
  }

  const start = loc.start as Record<string, unknown> | undefined;
  const end = loc.end as Record<string, unknown> | undefined;

  return {
    start: {
      line: typeof start?.line === 'number' ? start.line : defaultLine,
      column: typeof start?.column === 'number' ? start.column : 0,
    },
    end: {
      line: typeof end?.line === 'number' ? end.line : defaultLine,
      column: typeof end?.column === 'number' ? end.column : 0,
    },
  };
}

/**
 * Get the body array from an AST
 * @param ast - The AST object
 * @returns Array of body nodes
 */
export function getASTBody(ast: unknown): unknown[] {
  if (!ast || typeof ast !== 'object') {
    return [];
  }

  const a = ast as Record<string, unknown>;
  const body = a.body;
  const programBody = (a.program as Record<string, unknown> | undefined)?.body;

  return Array.isArray(body) ? body : Array.isArray(programBody) ? programBody : [];
}
