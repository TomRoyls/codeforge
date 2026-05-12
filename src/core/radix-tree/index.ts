interface RadixTreeNode {
  children: Map<string, RadixTreeNode>;
  isEndOfWord: boolean;
}

export class RadixTree {
  private root: RadixTreeNode;
  private _size: number;

  constructor() {
    this.root = { children: new Map(), isEndOfWord: false };
    this._size = 0;
  }

  insert(word: string): void {
    if (word.length === 0) return;
    let node = this.root;
    let i = 0;

    while (i < word.length) {
      let found = false;
      for (const [edge, child] of node.children) {
        const commonPrefix = this.getCommonPrefix(word.slice(i), edge);

        if (commonPrefix.length > 0) {
          found = true;

          if (commonPrefix.length === edge.length) {
            i += edge.length;
            node = child;
            break;
          }

          const splitEdge = edge.slice(commonPrefix.length);
          const newNode: RadixTreeNode = {
            children: new Map(),
            isEndOfWord: false
          };

          newNode.children.set(splitEdge, child);
          node.children.delete(edge);
          node.children.set(commonPrefix, newNode);

          if (commonPrefix.length === word.length - i) {
            newNode.isEndOfWord = true;
            this._size++;
            return;
          }

          i += commonPrefix.length;
          node = newNode;
          break;
        }
      }

      if (!found) {
        node.children.set(word.slice(i), {
          children: new Map(),
          isEndOfWord: true
        });
        this._size++;
        return;
      }
    }

    if (!node.isEndOfWord) {
      node.isEndOfWord = true;
      this._size++;
    }
  }

  remove(word: string): boolean {
    if (word.length === 0) return false;
    const path: Array<{ node: RadixTreeNode; edge: string; parent: RadixTreeNode | null }> = [];
    let node = this.root;
    let i = 0;

    while (i < word.length) {
      let found = false;
      for (const [edge, child] of node.children) {
        const commonPrefix = this.getCommonPrefix(word.slice(i), edge);

        if (commonPrefix.length > 0 && commonPrefix.length === edge.length) {
          path.push({ node, edge, parent: path.length > 0 ? path[path.length - 1]!.node : null });
          i += edge.length;
          node = child;
          found = true;
          break;
        }
      }

      if (!found) return false;
    }

    if (!node.isEndOfWord) return false;

    node.isEndOfWord = false;
    this._size--;

    if (node.children.size === 0 && path.length > 0) {
      const last = path[path.length - 1];
      if (!last) return true;
      last.node.children.delete(last.edge);

      if (last.node.children.size === 1 && !last.node.isEndOfWord) {
        const [siblingEntry] = Array.from(last.node.children.entries());
        if (siblingEntry) {
          const [siblingEdge, siblingNode] = siblingEntry;
          if (path.length > 1) {
            const parent = path[path.length - 2];
            if (!parent) return true;
            const mergedEdge = parent.node.children.get(last.edge);
            if (mergedEdge) {
              parent.node.children.delete(last.edge);
              parent.node.children.set(mergedEdge + siblingEdge, siblingNode);
            }
          }
        }
      }
    } else if (node.children.size === 1 && path.length > 0) {
      const [childEntry] = Array.from(node.children.entries());
      if (childEntry) {
        const [childEdge, childNode] = childEntry;
        const last = path[path.length - 1];
        if (!last) return true;
        last.node.children.delete(last.edge);
        last.node.children.set(last.edge + childEdge, childNode);
      }
    }

    return true;
  }

  search(word: string): boolean {
    if (word.length === 0) return false;
    const node = this.findNode(word);
    return node !== null && node.isEndOfWord;
  }

  hasWord(word: string): boolean {
    return this.search(word);
  }

  startsWith(prefix: string): boolean {
    if (prefix.length === 0) return true;
    return this.startsWithHelper(prefix, this.root, 0);
  }

  private startsWithHelper(prefix: string, node: RadixTreeNode, startIndex: number): boolean {
    if (startIndex >= prefix.length) return true;

    for (const [edge, child] of node.children) {
      if (edge.startsWith(prefix.slice(startIndex))) {
        return true;
      }
      if (prefix.slice(startIndex).startsWith(edge)) {
        return this.startsWithHelper(prefix, child, startIndex + edge.length);
      }
    }

    return false;
  }

  getAllWords(prefix: string = ''): string[] {
    const node = prefix.length === 0 ? this.root : this.findNode(prefix);
    if (node === null) return [];
    const words: string[] = [];
    this.collectWords(node, prefix, words);
    if (prefix.length > 0 && node.isEndOfWord) {
      words.unshift(prefix);
    }
    return words;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.root = { children: new Map(), isEndOfWord: false };
    this._size = 0;
  }

  forEach(callback: (word: string) => void): void {
    this.getAllWords().forEach(callback);
  }

  longestCommonPrefix(): string {
    if (this._size === 0) return '';
    if (this._size === 1) return this.getAllWords()[0] || '';

    const words = this.getAllWords();
    let lcp = words[0] ?? '';

    for (let i = 1; i < words.length; i++) {
      const currentWord = words[i];
      if (currentWord === undefined) break;
      lcp = this.getCommonPrefix(lcp, currentWord);
      if (lcp.length === 0) break;
    }

    return lcp;
  }

  private findNode(word: string): RadixTreeNode | null {
    let node = this.root;
    let i = 0;

    while (i < word.length) {
      let found = false;
      for (const [edge, child] of node.children) {
        if (word.slice(i).startsWith(edge)) {
          i += edge.length;
          node = child;
          found = true;
          break;
        }
      }
      if (!found) return null;
    }

    return node;
  }

  private collectWords(node: RadixTreeNode, prefix: string, words: string[]): void {
    for (const [edge, child] of node.children) {
      const newPrefix = prefix + edge;
      if (child.isEndOfWord) {
        words.push(newPrefix);
      }
      this.collectWords(child, newPrefix, words);
    }
  }

  private getCommonPrefix(str1: string, str2: string): string {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.slice(0, i);
  }
}
