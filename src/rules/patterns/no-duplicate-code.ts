/**
 * @fileoverview Disallow duplicate code blocks
 * @module rules/pokies/no-duplicate-code
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js';

interface CodeBlock {
  readonly hash: string;
  readonly startLine: number;
  readonly endLine: number;
  readonly filePath: string;
  readonly content: string;
}

interface NoDuplicateCodeOptions {
  readonly minLines?: number;
  readonly minTokens?: number;
  readonly ignoreComments?: boolean;
  readonly ignoreImports?: boolean;
  readonly threshold?: number;
}

function normalizeCode(code: string): string {
  return code
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    start: { line: 1, column: 0 },
    end: { line: 1, column: 1 },
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
      line: typeof start?.line === 'number' ? start.line : 1,
      column: typeof start?.column === 'number' ? start.column : 0,
    },
    end: {
      line: typeof end?.line === 'number' ? end.line : 1,
      column: typeof end?.column === 'number' ? end.column : 0,
    },
  };
}

function getBlockContent(node: unknown, source: string): string | null {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const n = node as Record<string, unknown>;
  const loc = n.loc as Record<string, unknown> | undefined;

  if (!loc) {
    return null;
  }

  const start = loc.start as Record<string, unknown> | undefined;
  const end = loc.end as Record<string, unknown> | undefined;

  if (typeof start?.line !== 'number' || typeof end?.line !== 'number') {
    return null;
  }

  const lines = source.split('\n');
  const startLine = Math.max(0, start.line - 1);
  const endLine = Math.min(lines.length, end.line);
  
  return lines.slice(startLine, endLine).join('\n');
}

function isImportOrExport(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false;
  }
  const n = node as Record<string, unknown>;
  return (
    n.type === 'ImportDeclaration' ||
    n.type === 'ExportNamedDeclaration' ||
    n.type === 'ExportDefaultDeclaration' ||
    n.type === 'ExportAllDeclaration'
  );
}

function isComment(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false;
  }
  const n = node as Record<string, unknown>;
  return n.type === 'Block' || n.type === 'Line';
}

/**
 * Rule: no-duplicate-code
 * Detects duplicate code blocks within a file or across files
 */
export const noDuplicateCodeRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow duplicate code blocks. Duplicated code increases maintenance burden and can indicate missing abstractions.',
      category: 'patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-duplicate-code',
    },
    schema: [
      {
        type: 'object',
        properties: {
          minLines: {
            type: 'number',
            minimum: 2,
            default: 5,
          },
          minTokens: {
            type: 'number',
            minimum: 10,
            default: 50,
          },
          ignoreComments: {
            type: 'boolean',
            default: true,
          },
          ignoreImports: {
            type: 'boolean',
            default: true,
          },
          threshold: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            default: 70,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options;
    const options: NoDuplicateCodeOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0
        ? rawOptions[0]
        : {}
    ) as NoDuplicateCodeOptions;

    const minLines = options.minLines ?? 5;
    const ignoreComments = options.ignoreComments ?? true;
    const ignoreImports = options.ignoreImports ?? true;

    const codeBlocks: CodeBlock[] = [];
    const filePath = context.getFilePath();
    const source = context.getSource();

    return {
      BlockStatement(node: unknown): void {
        if (ignoreImports && isImportOrExport(node)) {
          return;
        }
        if (ignoreComments && isComment(node)) {
          return;
        }

        const content = getBlockContent(node, source);
        if (!content) {
          return;
        }

        const lines = content.split('\n');
        if (lines.length < minLines) {
          return;
        }

        const location = extractLocation(node);
        const normalized = normalizeCode(content);
        const hash = hashContent(normalized);

        codeBlocks.push({
          hash,
          startLine: location.start.line,
          endLine: location.end.line,
          filePath,
          content: content.slice(0, 100),
        });
      },

      FunctionDeclaration(node: unknown): void {
        if (ignoreImports && isImportOrExport(node)) {
          return;
        }

        const content = getBlockContent(node, source);
        if (!content) {
          return;
        }

        const lines = content.split('\n');
        if (lines.length < minLines) {
          return;
        }

        const location = extractLocation(node);
        const normalized = normalizeCode(content);
        const hash = hashContent(normalized);

        codeBlocks.push({
          hash,
          startLine: location.start.line,
          endLine: location.end.line,
          filePath,
          content: content.slice(0, 100),
        });
      },

      ClassDeclaration(node: unknown): void {
        const content = getBlockContent(node, source);
        if (!content) {
          return;
        }

        const lines = content.split('\n');
        if (lines.length < minLines) {
          return;
        }

        const location = extractLocation(node);
        const normalized = normalizeCode(content);
        const hash = hashContent(normalized);

        codeBlocks.push({
          hash,
          startLine: location.start.line,
          endLine: location.end.line,
          filePath,
          content: content.slice(0, 100),
        });
      },

      'Program:exit'(): void {
        // Group blocks by hash
        const groups = new Map<string, CodeBlock[]>();
        for (const block of codeBlocks) {
          const existing = groups.get(block.hash) ?? [];
          existing.push(block);
          groups.set(block.hash, existing);
        }

        // Report duplicates
        for (const [, blocks] of groups) {
          if (blocks.length > 1) {
            const original = blocks[0]!;
            for (let i = 1; i < blocks.length; i++) {
              const duplicate = blocks[i]!;

              context.report({
                message: `Duplicate code block detected (lines ${duplicate.startLine}-${duplicate.endLine}). Original block at lines ${original.startLine}-${original.endLine}. Consider extracting to a shared function.`,
                loc: {
                  start: { line: duplicate.startLine, column: 0 },
                  end: { line: duplicate.endLine, column: 0 },
                },
              });
            }
          }
        }
      },
    };
  },
};

export default noDuplicateCodeRule;
