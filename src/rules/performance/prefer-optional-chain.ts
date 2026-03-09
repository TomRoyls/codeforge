/**
 * @fileoverview Enforce using optional chain operator instead of chained && checks
 * @module rules/performance/prefer-optional-chain
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js';

interface OptionalChainMatch {
  readonly leftText: string;
  readonly rightText: string;
  readonly location: SourceLocation;
  readonly suggestion: string;
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

function getNodeText(node: unknown, source: string): string {
  if (!node || typeof node !== 'object') {
    return '';
  }

  const n = node as Record<string, unknown>;
  
  if (Array.isArray(n.range) && n.range.length === 2) {
    const start = n.range[0] as number;
    const end = n.range[1] as number;
    return source.slice(start, end);
  }

  if (typeof n.start === 'number' && typeof n.end === 'number') {
    return source.slice(n.start, n.end);
  }

  return '';
}

function isPropertyAccessExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false;
  }

  const n = node as Record<string, unknown>;
  return n.type === 'MemberExpression' && n.computed !== true;
}

function isCallExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false;
  }

  const n = node as Record<string, unknown>;
  return n.type === 'CallExpression';
}

function getCallExpressionCallee(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const n = node as Record<string, unknown>;
  return n.callee;
}

function getPropertyAccessObject(node: unknown): unknown {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const n = node as Record<string, unknown>;
  return n.object;
}

function getPropertyName(node: unknown): string | null {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const n = node as Record<string, unknown>;
  const property = n.property as Record<string, unknown> | undefined;

  if (property && property.type === 'Identifier' && typeof property.name === 'string') {
    return property.name;
  }

  return null;
}

function nodesMatch(node1: unknown, node2: unknown, source: string): boolean {
  if (!node1 || !node2) {
    return false;
  }

  const text1 = getNodeText(node1, source);
  const text2 = getNodeText(node2, source);

  if (text1 && text2) {
    return text1 === text2;
  }

  const n1 = node1 as Record<string, unknown>;
  const n2 = node2 as Record<string, unknown>;

  if (n1.type !== n2.type) {
    return false;
  }

  if (n1.type === 'Identifier') {
    return n1.name === n2.name;
  }

  if (n1.type === 'MemberExpression') {
    return (
      nodesMatch(n1.object, n2.object, source) &&
      nodesMatch(n1.property, n2.property, source)
    );
  }

  return false;
}

function checkOptionalChainPattern(
  node: unknown,
  source: string
): OptionalChainMatch | null {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const n = node as Record<string, unknown>;

  if (n.type !== 'LogicalExpression' && n.type !== 'BinaryExpression') {
    return null;
  }

  if (n.operator !== '&&') {
    return null;
  }

  const left = n.left;
  const right = n.right;

  if (!left || !right) {
    return null;
  }

  const leftText = getNodeText(left, source);
  const rightText = getNodeText(right, source);

  if (!leftText || !rightText) {
    return null;
  }

  if (isPropertyAccessExpression(right)) {
    const rightObject = getPropertyAccessObject(right);
    
    if (rightObject && nodesMatch(left, rightObject, source)) {
      const propertyName = getPropertyName(right);
      if (propertyName) {
        return {
          leftText,
          rightText,
          location: extractLocation(node),
          suggestion: `${leftText}?.${propertyName}`,
        };
      }
    }
  }

  if (isCallExpression(right)) {
    const callee = getCallExpressionCallee(right);
    
    if (callee && isPropertyAccessExpression(callee)) {
      const calleeObject = getPropertyAccessObject(callee);
      
      if (calleeObject && nodesMatch(left, calleeObject, source)) {
        const methodName = getPropertyName(callee);
        if (methodName) {
          const argsMatch = rightText.match(/\(.*\)$/);
          const args = argsMatch ? argsMatch[0] : '()';
          return {
            leftText,
            rightText,
            location: extractLocation(node),
            suggestion: `${leftText}?.${methodName}${args}`,
          };
        }
      }
    }
  }

  return null;
}

export const preferOptionalChainRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Enforce using optional chain operator (?.) instead of chained && checks for property access and method calls. Optional chaining is more concise and readable.',
      category: 'performance',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-optional-chain',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      LogicalExpression(node: unknown): void {
        const source = context.getSource();
        const match = checkOptionalChainPattern(node, source);

        if (match) {
          context.report({
            node,
            message: `Prefer optional chaining (${match.suggestion}) instead of ${match.leftText} && ${match.rightText}.`,
            loc: match.location,
            suggest: [
              {
                desc: `Use optional chaining: ${match.suggestion}`,
                message: 'Use optional chaining operator',
                fix: {
                  range: [0, source.length] as const,
                  text: match.suggestion,
                },
              },
            ],
          });
        }
      },

      BinaryExpression(node: unknown): void {
        const source = context.getSource();
        const match = checkOptionalChainPattern(node, source);

        if (match) {
          context.report({
            node,
            message: `Prefer optional chaining (${match.suggestion}) instead of ${match.leftText} && ${match.rightText}.`,
            loc: match.location,
            suggest: [
              {
                desc: `Use optional chaining: ${match.suggestion}`,
                message: 'Use optional chaining operator',
                fix: {
                  range: [0, source.length] as const,
                  text: match.suggestion,
                },
              },
            ],
          });
        }
      },
    };
  },
};

export default preferOptionalChainRule;
