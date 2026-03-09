import type { Node, SourceFile } from "ts-morph";

import type { Range, RuleViolation } from "../ast/visitor.js";
import type { FixContext } from "./types.js";

export function createFixContext(sourceFile: SourceFile, violation: RuleViolation): FixContext {
  return {
    getNodeByPosition(position: number): Node | undefined {
      let foundNode: Node | undefined;
      
      function findNode(node: Node): void {
        const start = node.getStart();
        const end = node.getEnd();
        
        if (start <= position && position < end) {
          foundNode = node;
          node.forEachChild(findNode);
        }
      }
      
      sourceFile.forEachChild(findNode);
      return foundNode;
    },
    getNodeByRange(range: Range): Node | undefined {
      const startPos = getPosFromLineCol(sourceFile, range.start.line, range.start.column);
      const endPos = getPosFromLineCol(sourceFile, range.end.line, range.end.column);
      
      let foundNode: Node | undefined;
      
      function findNode(node: Node): void {
        const nodeStart = node.getStart();
        const nodeEnd = node.getEnd();
        
        if (nodeStart === startPos && nodeEnd === endPos) {
          foundNode = node;
          return;
        }
        
        if (nodeStart <= startPos && nodeEnd >= endPos) {
          node.forEachChild(findNode);
        }
      }
      
      sourceFile.forEachChild(findNode);
      return foundNode;
    },
    sourceFile,
    violation,
  };
}

function getPosFromLineCol(sourceFile: SourceFile, line: number, column: number): number {
  const fullText = sourceFile.getFullText();
  const lines = fullText.split("\n");
  
  let pos = 0;
  for (let i = 0; i < line - 1 && i < lines.length; i++) {
    pos += lines[i]!.length + 1;
  }
  
  pos += column - 1;
  return Math.min(pos, fullText.length);
}
