export class DoubleArrayTrie2 {
  private base: number[] = [];
  private check: number[] = [];
  private _size: number = 0;
  private tail: string[] = [];

  constructor() {
    this.base.push(1);
    this.check.push(-1);
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.base = [1];
    this.check = [-1];
    this._size = 0;
    this.tail = [];
  }

  insert(word: string): boolean {
    if (word === '') {
      if (this.tail[0] === '') {
        return false;
      }
      this.tail[0] = '';
      this._size++;
      return true;
    }

    const chars = this.stringToCodes(word);
    let s = 0;
    let i = 0;

    while (i < chars.length) {
      const t = this.base[s]! + chars[i];
      this.ensureCapacity(t);

      if (this.check[t]! !== s) {
        const remaining = chars.slice(i);
        this.addWord(s, remaining);
        this._size++;
        return true;
      }

      if (this.base[t]! < 0) {
        const tailIndex = -this.base[t]!;
        const tailStr = this.tail[tailIndex]!;
        const tailCodes = this.stringToCodesFromTail(tailStr);
        const remaining = chars.slice(i + 1);

        if (this.codesEqual(tailCodes, remaining)) {
          return false;
        }

        this.splitAndAdd(t, tailIndex, tailCodes, remaining, s);
        this._size++;
        return true;
      }

      s = t;
      i++;
    }

    const tailIndex = this.tail.length;
    this.tail.push('');
    this.base[s]! = -tailIndex;
    this._size++;
    return true;
  }

  has(word: string): boolean {
    if (word === '') {
      return this.tail[0] === '';
    }

    const chars = this.stringToCodes(word);
    let s = 0;

    for (let i = 0; i < chars.length; i++) {
      const t = this.base[s]! + chars[i];
      if (t >= this.base.length || this.check[t]! !== s) {
        return false;
      }

      if (this.base[t]! < 0) {
        const tailIndex = -this.base[t]!;
        const tailStr = this.tail[tailIndex]!;
        const tailCodes = this.stringToCodesFromTail(tailStr);
        const remaining = chars.slice(i + 1);
        return this.codesEqual(tailCodes, remaining);
      }

      s = t;
    }

    return this.base[s]! < 0;
  }

  delete(word: string): boolean {
    if (word === '') {
      if (this.tail[0] !== '') {
        return false;
      }
      this.tail[0] = undefined!;
      this._size--;
      return true;
    }

    const chars = this.stringToCodes(word);
    let s = 0;

    for (let i = 0; i < chars.length; i++) {
      const t = this.base[s]! + chars[i];
      if (t >= this.base.length || this.check[t]! !== s) {
        return false;
      }
      s = t;
    }

    if (this.base[s]! >= 0) {
      return false;
    }

    const tailIndex = -this.base[s]!;
    this.tail[tailIndex]! = undefined!;
    this.base[s]! = 0;
    this.check[s]! = -1;
    this._size--;
    return true;
  }

  startsWith(prefix: string): string[] {
    if (prefix === '') {
      return this.toArray();
    }

    const chars = this.stringToCodes(prefix);
    let s = 0;

    for (let i = 0; i < chars.length; i++) {
      const t = this.base[s]! + chars[i];
      if (t >= this.base.length || this.check[t]! !== s) {
        return [];
      }
      s = t;
    }

    const results: string[] = [];
    this.collectWords(s, prefix, results);
    return results;
  }

  toArray(): string[] {
    const results: string[] = [];
    if (this.tail[0] === '') {
      results.push('');
    }
    this.collectWords(0, '', results);
    return results.sort();
  }

  private addWord(parent: number, chars: number[]): void {
    if (chars.length === 0) {
      const tailIndex = this.tail.length;
      this.tail.push('');
      this.base[parent]! = -tailIndex;
      return;
    }

    const children = this.getChildren(parent);
    if (children.length === 0) {
      const base = this.findBase([chars[0]]);
      this.base[parent]! = base;
      const t = base + chars[0];
      this.ensureCapacity(t);
      this.check[t]! = parent;

      if (chars.length === 1) {
        const tailIndex = this.tail.length;
        this.tail.push('');
        this.base[t]! = -tailIndex;
      } else {
        const tailIndex = this.tail.length;
        this.tail.push(this.codesToString(chars.slice(1)));
        this.base[t]! = -tailIndex;
      }
    } else {
      children.push(chars[0]);
      const base = this.findBase(children);
      this.rebase(parent, children, base);
      const t = base + chars[0];
      this.ensureCapacity(t);
      this.check[t]! = parent;

      if (chars.length === 1) {
        const tailIndex = this.tail.length;
        this.tail.push('');
        this.base[t]! = -tailIndex;
      } else {
        const tailIndex = this.tail.length;
        this.tail.push(this.codesToString(chars.slice(1)));
        this.base[t]! = -tailIndex;
      }
    }
  }

  private splitAndAdd(t: number, _tailIndex: number, tailCodes: number[], remaining: number[], _parent: number): void {
    const matchLen = this.findCommonPrefixLength(tailCodes, remaining);

    if (matchLen === tailCodes.length) {
      const newTailIndex = this.tail.length;
      this.tail.push(this.codesToString(remaining));
      this.base[t]! = -newTailIndex;
    } else if (matchLen === 0) {
      const base = this.findBase([tailCodes[0], remaining[0]]);
      this.base[t]! = base;

      const t1 = base + tailCodes[0];
      this.ensureCapacity(t1);
      const tailIndex1 = this.tail.length;
      this.tail.push(this.codesToString(tailCodes.slice(1)));
      this.base[t1]! = -tailIndex1;
      this.check[t1]! = t;

      const t2 = base + remaining[0];
      this.ensureCapacity(t2);
      const tailIndex2 = this.tail.length;
      this.tail.push(this.codesToString(remaining.slice(1)));
      this.base[t2]! = -tailIndex2;
      this.check[t2]! = t;
    } else {
      const base = this.findBase([tailCodes[0]]);
      this.base[t]! = base;

      const t1 = base + tailCodes[0];
      this.ensureCapacity(t1);
      const tailIndex1 = this.tail.length;
      this.tail.push(this.codesToString(tailCodes.slice(matchLen)));
      this.base[t1]! = -tailIndex1;
      this.check[t1]! = t;

      if (matchLen < remaining.length) {
        const t2 = base + remaining[0];
        this.ensureCapacity(t2);
        const tailIndex2 = this.tail.length;
        this.tail.push(this.codesToString(remaining.slice(matchLen)));
        this.base[t2]! = -tailIndex2;
        this.check[t2]! = t;
      } else {
        const t2 = base + remaining[0];
        this.ensureCapacity(t2);
        const tailIndex2 = this.tail.length;
        this.tail.push('');
        this.base[t2]! = -tailIndex2;
        this.check[t2]! = t;
      }
    }
  }

  private stringToCodes(str: string): number[] {
    return str.split('').map(c => c.charCodeAt(0));
  }

  private stringToCodesFromTail(tail: string): number[] {
    if (tail === '') {
      return [];
    }
    return tail.split(',').map(s => parseInt(s, 10));
  }

  private codesToString(codes: number[]): string {
    return codes.join(',');
  }

  private codesEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  private ensureCapacity(index: number): void {
    while (index >= this.base.length) {
      this.base.push(0);
      this.check.push(-1);
    }
  }

  private findBase(codes: number[]): number {
    let base = 1;
    while (true) {
      let available = true;
      for (const code of codes) {
        const t = base + code;
        this.ensureCapacity(t);
        if (this.check[t]! !== -1) {
          available = false;
          break;
        }
      }
      if (available) {
        return base;
      }
      base++;
    }
  }

  private getChildren(parent: number): number[] {
    const children: number[] = [];
    const base = this.base[parent]!;

    if (base <= 0) {
      return children;
    }

    for (let code = 0; code < 128; code++) {
      const t = base + code;
      if (t < this.base.length && this.check[t]! === parent) {
        children.push(code);
      }
    }

    return children;
  }

  private rebase(parent: number, children: number[], newBase: number): void {
    const oldBase = this.base[parent]!;
    this.base[parent]! = newBase;

    for (const child of children) {
      const oldT = oldBase + child;
      const newT = newBase + child;
      this.ensureCapacity(newT);
      this.base[newT]! = this.base[oldT]!;
      this.check[newT]! = parent;
      this.base[oldT]! = 0;
      this.check[oldT]! = -1;
    }
  }

  private findCommonPrefixLength(a: number[], b: number[]): number {
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      if (a[i] !== b[i]) {
        return i;
      }
    }
    return minLen;
  }

  private collectWords(state: number, prefix: string, results: string[]): void {
    const base = this.base[state]!;

    if (base < 0) {
      const tailIndex = -base;
      const tailStr = this.tail[tailIndex];
      if (tailStr === undefined) {
        return;
      }
      if (tailStr === '') {
        results.push(prefix);
      } else {
        const tailCodes = this.stringToCodesFromTail(tailStr);
        const tailWord = tailCodes.map(c => String.fromCharCode(c)).join('');
        results.push(prefix + tailWord);
      }
      return;
    }

    if (base <= 0) {
      return;
    }

    for (let code = 0; code < 128; code++) {
      const t = base + code;
      if (t < this.base.length && this.check[t]! === state) {
        const char = String.fromCharCode(code);
        this.collectWords(t, prefix + char, results);
      }
    }
  }
}
