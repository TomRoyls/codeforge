/**
 * @fileoverview Import style consistency rule for CodeForge
 * Enforces consistent import style across the codebase
 * @module rules/dependencies/consistent-imports
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js';

type ImportStyle = 'default' | 'namespace' | 'named';

interface ImportStatement {
  readonly kind: 'default' | 'namespace' | 'named' | 'mixed';
  readonly source: string;
  readonly location: SourceLocation;
  readonly namedCount: number;
  readonly hasDefault: boolean;
  readonly hasNamespace: boolean;
}

interface ConsistentImportsOptions {
  readonly prefer: ImportStyle;
  readonly namespaceThreshold?: number;
  readonly exclude?: readonly string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function analyzeImport(node: any): ImportStatement | null {
  if (!node || typeof node !== 'object') {
    return null;
  }

  if (node.type !== 'ImportDeclaration' || !node.source?.value) {
    return null;
  }

  const location: SourceLocation = {
    start: {
      line: node.loc?.start?.line ?? 1,
      column: node.loc?.start?.column ?? 0,
    },
    end: {
      line: node.loc?.end?.line ?? 1,
      column: node.loc?.end?.column ?? 0,
    },
  };

  let hasDefault = false;
  let hasNamespace = false;
  let namedCount = 0;

  if (node.specifiers) {
    for (const spec of node.specifiers) {
      switch (spec.type) {
        case 'ImportDefaultSpecifier':
          hasDefault = true;
          break;
        case 'ImportNamespaceSpecifier':
          hasNamespace = true;
          break;
        case 'ImportSpecifier':
          namedCount++;
          break;
      }
    }
  }

  let kind: ImportStatement['kind'];
  if (hasDefault && namedCount > 0) {
    kind = 'mixed';
  } else if (hasDefault) {
    kind = 'default';
  } else if (hasNamespace) {
    kind = 'namespace';
  } else {
    kind = 'named';
  }

  return {
    kind,
    source: node.source.value,
    location,
    namedCount,
    hasDefault,
    hasNamespace,
  };
}

function isExcluded(source: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      const regex = new RegExp(pattern.slice(1, -1));
      return regex.test(source);
    }
    return source === pattern || source.includes(pattern);
  });
}

function generateSuggestion(
  importInfo: ImportStatement,
  prefer: ImportStyle
): string {
  const { source } = importInfo;

  switch (prefer) {
    case 'namespace':
      return `import * as namespace from '${source}';`;
    case 'default':
      return `import module from '${source}';`;
    case 'named':
      return `import { /* names */ } from '${source}';`;
    default:
      return '';
  }
}

/**
 * Rule: consistent-imports
 * Enforces consistent import style across the codebase.
 */
export const consistentImportsRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Enforce consistent import style across the codebase. Choose between default imports, namespace imports, or named imports.',
      category: 'dependencies',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/consistent-imports',
    },
    schema: [
      {
        type: 'object',
        properties: {
          prefer: {
            type: 'string',
            enum: ['default', 'namespace', 'named'],
            default: 'named',
          },
          namespaceThreshold: {
            type: 'number',
            minimum: 1,
            default: 5,
          },
          exclude: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options;
    const options: ConsistentImportsOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0
        ? rawOptions[0]
        : { prefer: 'named' }
    ) as ConsistentImportsOptions;
    const prefer = options.prefer ?? 'named';
    const namespaceThreshold = options.namespaceThreshold ?? 5;
    const exclude = options.exclude ?? [];

    return {
      ImportDeclaration(node: unknown): void {
        const importInfo = analyzeImport(node);
        if (!importInfo) return;

        if (isExcluded(importInfo.source, exclude)) {
          return;
        }

        switch (prefer) {
          case 'namespace':
            if (
              importInfo.kind === 'named' &&
              importInfo.namedCount >= namespaceThreshold
            ) {
              context.report({
                node,
                message: `Use namespace import instead of multiple named imports from '${importInfo.source}'`,
                loc: importInfo.location,
                suggest: [
                  {
                    desc: 'Convert to namespace import',
                    message: `Convert to namespace import`,
                    fix: {
                      range: [0, 0],
                      text: generateSuggestion(importInfo, 'namespace'),
                    },
                  },
                ],
              });
            }
            break;

          case 'default':
            if (importInfo.kind === 'named' && importInfo.namedCount === 1) {
              context.report({
                node,
                message: `Consider using default import from '${importInfo.source}' if the module exports a default`,
                loc: importInfo.location,
              });
            } else if (
              importInfo.kind === 'namespace' ||
              (importInfo.kind === 'named' && importInfo.namedCount > 1)
            ) {
              context.report({
                node,
                message: `Prefer default imports over ${importInfo.kind} imports`,
                loc: importInfo.location,
              });
            }
            break;

          case 'named':
            if (importInfo.kind === 'namespace') {
              context.report({
                node,
                message: `Use named imports instead of namespace import from '${importInfo.source}'`,
                loc: importInfo.location,
              });
            } else if (
              importInfo.kind === 'mixed' &&
              importInfo.namedCount > 0
            ) {
              context.report({
                node,
                message: `Separate default and named imports into separate statements`,
                loc: importInfo.location,
              });
            }
            break;
        }
      },

      CallExpression(node: unknown): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const n = node as any;

        if (
          n.callee?.type === 'Identifier' &&
          n.callee.name === 'require' &&
          n.arguments?.[0]?.type === 'StringLiteral'
        ) {
          const source = n.arguments[0].value;

          if (isExcluded(source, exclude)) {
            return;
          }

          if (prefer === 'named' || prefer === 'default') {
            context.report({
              node,
              message: `Use ES module ${prefer} imports instead of require()`,
              loc: {
                start: {
                  line: n.loc?.start?.line ?? 1,
                  column: n.loc?.start?.column ?? 0,
                },
                end: {
                  line: n.loc?.end?.line ?? 1,
                  column: n.loc?.end?.column ?? 0,
                },
              },
            });
          }
        }
      },
    };
  },
};

export default consistentImportsRule;
