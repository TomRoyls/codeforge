interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
}

class TrieSet2 {
  private root: TrieNode;
  private count: number;

  constructor() {
    this.root = { children: new Map(), isEnd: false };
    this.count = 0;
  }

  add(word: string): void {
    let node = this.root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i]!;
      if (!node.children.has(char)) {
        node.children.set(char, { children: new Map(), isEnd: false });
      }
      node = node.children.get(char)!;
    }
    if (!node.isEnd) {
      node.isEnd = true;
      this.count++;
    }
  }

  has(word: string): boolean {
    let node = this.root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i]!;
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char)!;
    }
    return node.isEnd;
  }

  delete(word: string): boolean {
    const path: TrieNode[] = [];
    const chars: string[] = [];
    let node = this.root;

    for (let i = 0; i < word.length; i++) {
      const char = word[i]!;
      if (!node.children.has(char)) {
        return false;
      }
      path.push(node);
      chars.push(char);
      node = node.children.get(char)!;
    }

    if (!node.isEnd) {
      return false;
    }

    node.isEnd = false;
    this.count--;

    for (let i = path.length - 1; i >= 0; i--) {
      const parentNode = path[i]!;
      const char = chars[i]!;
      const childNode = parentNode.children.get(char)!;
      if (childNode.children.size === 0 && !childNode.isEnd) {
        parentNode.children.delete(char);
      } else {
        break;
      }
    }

    return true;
  }

  size(): number {
    return this.count;
  }

  clear(): void {
    this.root = { children: new Map(), isEnd: false };
    this.count = 0;
  }

  startsWith(prefix: string): boolean {
    let node = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i]!;
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char)!;
    }
    return true;
  }

  wordsWithPrefix(prefix: string): string[] {
    const words: string[] = [];
    let node = this.root;

    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i]!;
      if (!node.children.has(char)) {
        return words;
      }
      node = node.children.get(char)!;
    }

    this.collectWords(node, prefix, words);
    return words;
  }

  private collectWords(node: TrieNode, prefix: string, words: string[]): void {
    if (node.isEnd) {
      words.push(prefix);
    }

    const entries = Array.from(node.children.entries());
    for (let i = 0; i < entries.length; i++) {
      const [char, childNode] = entries[i]!;
      this.collectWords(childNode, prefix + char, words);
    }
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  toArray(): string[] {
    const words: string[] = [];
    this.collectWords(this.root, '', words);
    return words.sort();
  }
}

export { TrieSet2 };
