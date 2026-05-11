export interface SuffixTreeEndRef {
  value: number;
}

export interface SuffixTreeNode {
  children: Map<string, SuffixTreeNode>;
  suffixLink: SuffixTreeNode | null;
  start: number;
  endRef: SuffixTreeEndRef;
  suffixIndex: number;
}

export interface SuffixTreeOptions {
  terminator?: string;
}

export interface SuffixTreeSerializedNode {
  children: Record<string, SuffixTreeSerializedNode>;
  start: number;
  end: number;
  suffixIndex: number;
}

export interface SuffixTreeSerialized {
  text: string;
  root: SuffixTreeSerializedNode;
}
