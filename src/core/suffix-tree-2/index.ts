import type {
  SuffixTreeEndRef,
  SuffixTreeNode,
  SuffixTreeOptions,
  SuffixTreeSerialized,
  SuffixTreeSerializedNode,
} from "./types.js";

function createNode(
  start: number,
  endRef: SuffixTreeEndRef,
  suffixIndex: number,
): SuffixTreeNode {
  return {
    children: new Map(),
    suffixLink: null,
    start,
    endRef,
    suffixIndex,
  };
}

export class SuffixTree {
  private text: string;
  private root: SuffixTreeNode;
  private globalEnd: SuffixTreeEndRef;
  private readonly terminator: string;

  constructor(text: string, options?: SuffixTreeOptions) {
    this.terminator = options?.terminator ?? "$";
    if (text.includes(this.terminator)) {
      throw new Error(
        `Text contains terminator character '${this.terminator}'`,
      );
    }
    this.text = text + this.terminator;
    this.globalEnd = { value: -1 };
    this.root = createNode(-1, { value: -1 }, -1);
    this.root.suffixLink = this.root;
    this.build();
    this.setSuffixIndices(this.root, 0);
  }

  private build(): void {
    const n = this.text.length;
    let activeNode = this.root;
    let activeEdge = -1;
    let activeLength = 0;
    let remaining = 0;
    let lastNewNode: SuffixTreeNode | null = null;

    for (let i = 0; i < n; i++) {
      this.globalEnd.value = i;
      remaining++;

      while (remaining > 0) {
        if (activeLength === 0) {
          activeEdge = i;
        }

        const edgeChar = this.text[activeEdge]!;
        const child = activeNode.children.get(edgeChar);

        if (child === undefined) {
          const leaf = createNode(i, this.globalEnd, -1);
          activeNode.children.set(edgeChar, leaf);

          if (lastNewNode !== null) {
            lastNewNode.suffixLink = activeNode;
            lastNewNode = null;
          }
        } else {
          const edgeLen = this.edgeLength(child);

          if (activeLength >= edgeLen) {
            activeEdge += edgeLen;
            activeLength -= edgeLen;
            activeNode = child;
            continue;
          }

          if (
            this.text[child.start + activeLength]! === this.text[i]!
          ) {
            if (lastNewNode !== null && activeNode !== this.root) {
              lastNewNode.suffixLink = activeNode;
            }
            activeLength++;
            break;
          }

          const splitEnd: SuffixTreeEndRef = {
            value: child.start + activeLength - 1,
          };
          const split = createNode(child.start, splitEnd, -1);
          split.suffixLink = this.root;

          const leaf = createNode(i, this.globalEnd, -1);

          split.children.set(this.text[i]!, leaf);
          split.children.set(
            this.text[child.start + activeLength]!,
            child,
          );

          child.start += activeLength;

          activeNode.children.set(edgeChar, split);

          if (lastNewNode !== null) {
            lastNewNode.suffixLink = split;
          }
          lastNewNode = split;
        }

        remaining--;

        if (activeNode === this.root && activeLength > 0) {
          activeLength--;
          activeEdge = i - remaining + 1;
        } else if (
          activeNode.suffixLink !== null &&
          activeNode !== this.root
        ) {
          activeNode = activeNode.suffixLink;
        } else {
          activeNode = this.root;
        }
      }
    }
  }

  private edgeLength(node: SuffixTreeNode): number {
    return node.endRef.value - node.start + 1;
  }

  private setSuffixIndices(node: SuffixTreeNode, depth: number): void {
    if (node.children.size === 0) {
      node.suffixIndex = this.text.length - depth;
      return;
    }
    for (const [, child] of node.children) {
      this.setSuffixIndices(child, depth + this.edgeLength(child));
    }
  }

  private findPatternEnd(
    pattern: string,
  ): SuffixTreeNode | undefined {
    if (pattern.length === 0) return undefined;

    let node: SuffixTreeNode = this.root;
    let patIdx = 0;

    while (patIdx < pattern.length) {
      const char = pattern[patIdx]!;
      const child = node.children.get(char);
      if (child === undefined) return undefined;

      const edgeLen = this.edgeLength(child);
      const patRemaining = pattern.length - patIdx;

      if (patRemaining <= edgeLen) {
        for (let k = 0; k < patRemaining; k++) {
          if (
            this.text[child.start + k] !== pattern[patIdx + k]
          ) {
            return undefined;
          }
        }
        return child;
      }

      for (let k = 0; k < edgeLen; k++) {
        if (
          this.text[child.start + k] !== pattern[patIdx + k]
        ) {
          return undefined;
        }
      }
      patIdx += edgeLen;
      node = child;
    }

    return node;
  }

  private collectLeafIndices(node: SuffixTreeNode): number[] {
    const result: number[] = [];
    this.collectLeafIndicesHelper(node, result);
    return result;
  }

  private collectLeafIndicesHelper(
    node: SuffixTreeNode,
    result: number[],
  ): void {
    if (node.suffixIndex >= 0) {
      result.push(node.suffixIndex);
      return;
    }
    for (const [, child] of node.children) {
      this.collectLeafIndicesHelper(child, result);
    }
  }

  private countLeaves(node: SuffixTreeNode): number {
    if (node.suffixIndex >= 0) return 1;
    let count = 0;
    for (const [, child] of node.children) {
      count += this.countLeaves(child);
    }
    return count;
  }

  private findAnyLeafSuffixIndex(node: SuffixTreeNode): number {
    let current = node;
    while (current.suffixIndex < 0) {
      current = current.children.values().next().value!;
    }
    return current.suffixIndex;
  }

  private countNodes(node: SuffixTreeNode): number {
    let count = 1;
    for (const [, child] of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  private serializeNode(node: SuffixTreeNode): SuffixTreeSerializedNode {
    const children: Record<string, SuffixTreeSerializedNode> = {};
    for (const [key, child] of node.children) {
      children[key] = this.serializeNode(child);
    }
    return {
      children,
      start: node.start,
      end: node.endRef.value,
      suffixIndex: node.suffixIndex,
    };
  }

  search(pattern: string): number[] {
    if (pattern.length === 0) return [];
    const node = this.findPatternEnd(pattern);
    if (node === undefined) return [];
    return this.collectLeafIndices(node);
  }

  has(pattern: string): boolean {
    if (pattern.length === 0) return true;
    return this.findPatternEnd(pattern) !== undefined;
  }

  isSubstring(pattern: string): boolean {
    return this.has(pattern);
  }

  count(pattern: string): number {
    if (pattern.length === 0) return 0;
    const node = this.findPatternEnd(pattern);
    if (node === undefined) return 0;
    return this.countLeaves(node);
  }

  findAll(pattern: string): number[] {
    return this.search(pattern);
  }

  longestRepeatedSubstring(): string {
    let maxDepth = 0;
    let maxSuffixStart = -1;

    const dfs = (node: SuffixTreeNode, depth: number): void => {
      if (node.suffixIndex >= 0) return;

      if (depth > maxDepth && node !== this.root) {
        maxDepth = depth;
        maxSuffixStart = this.findAnyLeafSuffixIndex(node);
      }

      for (const [, child] of node.children) {
        dfs(child, depth + this.edgeLength(child));
      }
    };

    dfs(this.root, 0);

    if (maxSuffixStart < 0) return "";
    return this.text.substring(
      maxSuffixStart,
      maxSuffixStart + maxDepth,
    );
  }

  longestCommonSubstring(other: string): string {
    if (other.length === 0) return "";

    let maxLen = 0;
    let maxPos = -1;

    for (let start = 0; start < other.length; start++) {
      let node = this.root;
      let matched = 0;
      let j = start;

      while (j < other.length) {
        const char = other[j]!;
        const child = node.children.get(char);
        if (child === undefined) break;

        const edgeLen = this.edgeLength(child);
        const limit = Math.min(edgeLen, other.length - j);
        let k = 0;

        while (
          k < limit &&
          this.text[child.start + k] === other[j + k]
        ) {
          k++;
        }

        matched += k;
        j += k;

        if (matched > maxLen) {
          maxLen = matched;
          maxPos = start;
        }

        if (k < edgeLen) break;
        node = child;
      }
    }

    if (maxPos < 0) return "";
    return other.substring(maxPos, maxPos + maxLen);
  }

  get leaves(): number[] {
    const result: number[] = [];
    this.collectLeafIndicesHelper(this.root, result);
    return result;
  }

  get size(): number {
    return this.text.length;
  }

  get nodeCount(): number {
    return this.countNodes(this.root);
  }

  toObject(): SuffixTreeSerialized {
    return {
      text: this.text,
      root: this.serializeNode(this.root),
    };
  }

  static fromObject(obj: SuffixTreeSerialized): SuffixTree {
    const fullText = obj.text;
    const terminator = fullText[fullText.length - 1]!;
    const originalText = fullText.slice(0, -1);
    return new SuffixTree(originalText, { terminator });
  }
}
