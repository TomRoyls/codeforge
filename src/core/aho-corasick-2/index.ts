interface TrieNode {
  children: Map<string, number>;
  fail: number;
  output: string[];
}

export class AhoCorasick2 {
  private nodes: TrieNode[];
  private patternList: string[];

  constructor(patterns: string[]) {
    this.nodes = [{ children: new Map<string, number>(), fail: 0, output: [] }];
    this.patternList = [];
    this.buildTrie(patterns);
    this.buildFailureLinks();
  }

  private buildTrie(patterns: string[]): void {
    this.patternList = [...patterns];
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i]!;
      let current = 0;
      for (let j = 0; j < pattern.length; j++) {
        const char = pattern[j]!;
        const children = this.nodes[current]!.children;
        if (!children.has(char)) {
          children.set(char, this.nodes.length);
          this.nodes.push({ children: new Map<string, number>(), fail: 0, output: [] });
        }
        current = children.get(char)!;
      }
      this.nodes[current]!.output.push(pattern);
    }
  }

  private buildFailureLinks(): void {
    const queue: number[] = [];
    const root = this.nodes[0]!;

    const rootChildrenKeys = Array.from(root.children.keys());
    for (let i = 0; i < rootChildrenKeys.length; i++) {
      const char = rootChildrenKeys[i]!;
      const next = root.children.get(char)!;
      this.nodes[next]!.fail = 0;
      queue.push(next);
    }

    let _qi = 0;
    while (_qi < queue.length) {
      const current = queue[_qi++]!;
      const currentNode = this.nodes[current]!;
      const childrenKeys = Array.from(currentNode.children.keys());

      for (let i = 0; i < childrenKeys.length; i++) {
        const char = childrenKeys[i]!;
        const next = currentNode.children.get(char)!;
        queue.push(next);

        let fail = currentNode.fail;
        while (fail !== 0 && !this.nodes[fail]!.children.has(char)) {
          fail = this.nodes[fail]!.fail;
        }

        if (fail !== 0 || this.nodes[0]!.children.has(char)) {
          const nextFail = this.nodes[fail]!.children.get(char);
          if (nextFail !== undefined) {
            this.nodes[next]!.fail = nextFail;
            this.nodes[next]!.output.push(...this.nodes[nextFail]!.output);
          }
        }
      }
    }
  }

  search(text: string): Array<{ pattern: string; startIndex: number; endIndex: number }> {
    const result: Array<{ pattern: string; startIndex: number; endIndex: number }> = [];
    let current = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i]!;
      while (current !== 0 && !this.nodes[current]!.children.has(char)) {
        current = this.nodes[current]!.fail;
      }

      const next = this.nodes[current]!.children.get(char);
      if (next !== undefined) {
        current = next;
      }

      const outputs = this.nodes[current]!.output;
      for (let j = 0; j < outputs.length; j++) {
        const pattern = outputs[j]!;
        const startIndex = i - pattern.length + 1;
        result.push({ pattern, startIndex, endIndex: i });
      }
    }

    return result;
  }

  hasMatch(text: string): boolean {
    let current = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i]!;
      while (current !== 0 && !this.nodes[current]!.children.has(char)) {
        current = this.nodes[current]!.fail;
      }

      const next = this.nodes[current]!.children.get(char);
      if (next !== undefined) {
        current = next;
      }

      if (this.nodes[current]!.output.length > 0) {
        return true;
      }
    }

    return false;
  }

  patterns(): string[] {
    return [...this.patternList];
  }

  addPattern(pattern: string): void {
    this.patternList.push(pattern);
    this.nodes = [{ children: new Map<string, number>(), fail: 0, output: [] }];
    this.buildTrie(this.patternList);
    this.buildFailureLinks();
  }
}
