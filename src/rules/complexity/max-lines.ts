import type { RuleDefinition, RuleOptions } from "../types.js";
import {
  type FunctionLikeNode,
  type RuleViolation,
  type VisitorContext,
  getNodeRange,
  getFunctionName,
  traverseAST,
} from "../../ast/visitor.js";
import type { SourceFile } from "ts-morph";

interface MaxLinesOptions extends RuleOptions {
  max?: number;
  skipBlankLines?: boolean;
  skipComments?: boolean;
}

interface MaxLinesPerFunctionOptions extends RuleOptions {
  max?: number;
  skipBlankLines?: boolean;
  skipComments?: boolean;
}

function countLines(
  sourceFile: SourceFile,
  options: { skipBlankLines?: boolean; skipComments?: boolean } = {},
): number {
  const text = sourceFile.getFullText();
  const lines = text.split("\n");

  if (!options.skipBlankLines && !options.skipComments) {
    return lines.length;
  }

  const commentRanges = options.skipComments
    ? sourceFile.getDescendants().flatMap((node) => {
        const leading = node.getLeadingCommentRanges();
        const trailing = node.getTrailingCommentRanges();
        return [...leading, ...trailing];
      })
    : [];

  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      if (!options.skipBlankLines) {
        count++;
      }
      continue;
    }

    if (options.skipComments) {
      const lineStart = getTextPosition(text, i);
      const isComment = commentRanges.some(
        (range) => lineStart >= range.getPos() && lineStart < range.getEnd(),
      );
      if (isComment) continue;
    }

    count++;
  }

  return count;
}

function countFunctionLines(
  node: FunctionLikeNode,
  options: { skipBlankLines?: boolean; skipComments?: boolean } = {},
): number {
  const startLine = node.getStartLineNumber();
  const endLine = node.getEndLineNumber();

  if (!options.skipBlankLines && !options.skipComments) {
    return endLine - startLine + 1;
  }

  const sourceFile = node.getSourceFile();
  const text = sourceFile.getFullText();
  const lines = text.split("\n");

  const commentRanges = options.skipComments
    ? node.getDescendants().flatMap((child) => {
        const leading = child.getLeadingCommentRanges();
        const trailing = child.getTrailingCommentRanges();
        return [...leading, ...trailing];
      })
    : [];

  let count = 0;
  for (let i = startLine - 1; i < endLine; i++) {
    const line = lines[i];
    if (!line) {
      if (!options.skipBlankLines) {
        count++;
      }
      continue;
    }

    if (options.skipComments) {
      const lineStart = getTextPosition(text, i);
      const isComment = commentRanges.some(
        (range) => lineStart >= range.getPos() && lineStart < range.getEnd(),
      );
      if (isComment) continue;
    }

    count++;
  }

  return count;
}

function getTextPosition(text: string, lineIndex: number): number {
  const lines = text.split("\n");
  let pos = 0;
  for (let i = 0; i < lineIndex; i++) {
    pos += (lines[i]?.length ?? 0) + 1;
  }
  return pos;
}

export const maxLinesRule: RuleDefinition<MaxLinesOptions> = {
  meta: {
    name: "max-lines",
    description: "Enforce a maximum number of lines per file",
    category: "complexity",
    recommended: false,
  },
  defaultOptions: {
    max: 300,
    skipBlankLines: true,
    skipComments: true,
  },
  create: (options: MaxLinesOptions) => {
    const violations: RuleViolation[] = [];
    const maxLines = options.max ?? 300;

    return {
      visitor: {
        visitSourceFile: (node: SourceFile, _context: VisitorContext) => {
          const lineCount = countLines(node, {
            skipBlankLines: options.skipBlankLines,
            skipComments: options.skipComments,
          });

          if (lineCount > maxLines) {
            const range = getNodeRange(node);
            violations.push({
              ruleId: "max-lines",
              severity: "warning",
              message: `File has ${lineCount} lines. Maximum allowed is ${maxLines}.`,
              filePath: node.getFilePath(),
              range,
              suggestion:
                "Consider splitting this file into smaller, focused modules.",
            });
          }
        },
      },
      onComplete: () => violations,
    };
  },
};

export const maxLinesPerFunctionRule: RuleDefinition<MaxLinesPerFunctionOptions> = {
  meta: {
    name: "max-lines-per-function",
    description: "Enforce a maximum number of lines per function",
    category: "complexity",
    recommended: true,
  },
  defaultOptions: {
    max: 50,
    skipBlankLines: true,
    skipComments: true,
  },
  create: (options: MaxLinesPerFunctionOptions) => {
    const violations: RuleViolation[] = [];
    const maxLines = options.max ?? 50;

    return {
      visitor: {
        visitFunction: (node: FunctionLikeNode) => {
          const lineCount = countFunctionLines(node, {
            skipBlankLines: options.skipBlankLines,
            skipComments: options.skipComments,
          });
          const name = getFunctionName(node);

          if (lineCount > maxLines) {
            const range = getNodeRange(node);
            violations.push({
              ruleId: "max-lines-per-function",
              severity: "warning",
              message: `Function '${name}' has ${lineCount} lines. Maximum allowed is ${maxLines}.`,
              filePath: node.getSourceFile().getFilePath(),
              range,
              suggestion:
                "Consider breaking this function into smaller, single-responsibility functions.",
            });
          }
        },
      },
      onComplete: () => violations,
    };
  },
};

export function analyzeMaxLines(
  sourceFile: SourceFile,
  maxLines: number = 300,
  options: { skipBlankLines?: boolean; skipComments?: boolean } = {},
): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const lineCount = countLines(sourceFile, options);

  if (lineCount > maxLines) {
    const range = getNodeRange(sourceFile);
    violations.push({
      ruleId: "max-lines",
      severity: "warning",
      message: `File has ${lineCount} lines. Maximum allowed is ${maxLines}.`,
      filePath: sourceFile.getFilePath(),
      range,
      suggestion: "Consider splitting this file into smaller, focused modules.",
    });
  }

  return violations;
}

export function analyzeMaxLinesPerFunction(
  sourceFile: SourceFile,
  maxLines: number = 50,
  options: { skipBlankLines?: boolean; skipComments?: boolean } = {},
): RuleViolation[] {
  const violations: RuleViolation[] = [];

  traverseAST(
    sourceFile,
    {
      visitFunction: (node: FunctionLikeNode) => {
        const lineCount = countFunctionLines(node, options);
        const name = getFunctionName(node);

        if (lineCount > maxLines) {
          const range = getNodeRange(node);
          violations.push({
            ruleId: "max-lines-per-function",
            severity: "warning",
            message: `Function '${name}' has ${lineCount} lines. Maximum allowed is ${maxLines}.`,
            filePath: sourceFile.getFilePath(),
            range,
            suggestion:
              "Consider breaking this function into smaller, single-responsibility functions.",
          });
        }
      },
    },
    violations,
  );

  return violations;
}
