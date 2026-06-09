export class DoubleArrayTrie2 {
  private base: number[] = [];
  private check: number[] = [];
  private _size: number = 0;
  private tail: string[] = [];
  private wordEnd: Set<number> = new Set();
  private hasEmptyStr: boolean = false;

  constructor() {
    this.base.push(1);
    this.check.push(-1);
    this.tail.push('');
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
    this.tail = [''];
    this.wordEnd.clear();
    this.hasEmptyStr = false;
  }

  insert(word: string): boolean {
    if (word === '') {
      if (this.hasEmptyStr) {
        return false;
      }
      this.hasEmptyStr = true;
      this._size++;
      return true;
    }

    const chars = this.stringToCodes(word);
    let s = 0;
    let i = 0;

    while (i < chars.length) {
      const t = this.base[s]! + chars[i]!;
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

        this.splitAndAdd(t, tailCodes, remaining);
        this._size++;
        return true;
      }

      s = t;
      i++;
    }

    if (this.wordEnd.has(s)) {
      return false;
    }
    if (this.base[s]! < 0) {
      const ti = -this.base[s]!;
      if (this.tail[ti] === '') {
        return false;
      }
      return false;
    }

    if (this.base[s]! > 0) {
      this.wordEnd.add(s);
    } else {
      const tailIndex = this.tail.length;
      this.tail.push('');
      this.base[s]! = -tailIndex;
    }
    this._size++;
    return true;
  }

  has(word: string): boolean {
    if (word === '') {
      return this.hasEmptyStr;
    }

    const chars = this.stringToCodes(word);
    let s = 0;

    for (let i = 0; i < chars.length; i++) {
      const t = this.base[s]! + chars[i]!;
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

    if (this.wordEnd.has(s)) {
      return true;
    }
    if (this.base[s]! < 0) {
      const ti = -this.base[s]!;
      return this.tail[ti] === '';
    }
    return false;
  }

  delete(word: string): boolean {
    if (word === '') {
      if (!this.hasEmptyStr) {
        return false;
      }
      this.hasEmptyStr = false;
      this._size--;
      return true;
    }

    const chars = this.stringToCodes(word);
    let s = 0;

    for (let i = 0; i < chars.length; i++) {
      const t = this.base[s]! + chars[i]!;
      if (t >= this.base.length || this.check[t]! !== s) {
        return false;
      }

      if (this.base[t]! < 0) {
        const tailIndex = -this.base[t]!;
        const tailStr = this.tail[tailIndex]!;
        const tailCodes = this.stringToCodesFromTail(tailStr);
        const remaining = chars.slice(i + 1);

        if (!this.codesEqual(tailCodes, remaining)) {
          return false;
        }

        this.tail[tailIndex]! = undefined!;
        this.base[t]! = 0;
        this.check[t]! = -1;
        this._size--;
        return true;
      }

      s = t;
    }

    if (this.wordEnd.has(s)) {
      this.wordEnd.delete(s);
      this._size--;
      return true;
    }

    if (this.base[s]! < 0) {
      const tailIndex = -this.base[s]!;
      if (this.tail[tailIndex] === '') {
        this.tail[tailIndex]! = undefined!;
        this.base[s]! = 0;
        this.check[s]! = -1;
        this._size--;
        return true;
      }
    }

    return false;
  }

  startsWith(prefix: string): string[] {
    if (prefix === '') {
      return this.toArray();
    }

    const chars = this.stringToCodes(prefix);
    let s = 0;

    for (let i = 0; i < chars.length; i++) {
      const t = this.base[s]! + chars[i]!;
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
    if (this.hasEmptyStr) {
      results.push('');
    }
    this.collectWords(0, '', results);
    return results.sort();
  }

  private addWord(parent: number, chars: number[]): void {
    if (chars.length === 0) {
      if (this.base[parent]! > 0) {
        this.wordEnd.add(parent);
      } else {
        const tailIndex = this.tail.length;
        this.tail.push('');
        this.base[parent]! = -tailIndex;
      }
      return;
    }

    const children = this.getChildren(parent);
    if (children.length === 0) {
      const base = this.findBase([chars[0]!]);
      this.base[parent]! = base;
      const t = base + chars[0]!;
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
      const newCode = chars[0]!;
      const allCodes = [...children, newCode];
      const base = this.findBase(allCodes);
      this.rebase(parent, children, base);
      const t = base + newCode;
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

  private splitAndAdd(t: number, tailCodes: number[], remaining: number[]): void {
    const matchLen = this.findCommonPrefixLength(tailCodes, remaining);

    let current = t;
    for (let j = 0; j < matchLen; j++) {
      const code = tailCodes[j]!;
      const base = this.findBase([code]);
      this.base[current]! = base;
      const child = base + code;
      this.ensureCapacity(child);
      this.check[child]! = current;
      current = child;
    }

    const oldRest = tailCodes.slice(matchLen);
    const newRest = remaining.slice(matchLen);

    if (oldRest.length === 0 && newRest.length === 0) {
      if (this.base[current]! > 0) {
        this.wordEnd.add(current);
      } else {
        const tailIndex = this.tail.length;
        this.tail.push('');
        this.base[current]! = -tailIndex;
      }
    } else if (oldRest.length === 0) {
      this.wordEnd.add(current);
      this.addTailChild(current, newRest);
    } else if (newRest.length === 0) {
      this.wordEnd.add(current);
      this.addTailChild(current, oldRest);
    } else {
      const codes = [oldRest[0]!, newRest[0]!];
      const base = this.findBase(codes);
      this.base[current]! = base;

      const t1 = base + oldRest[0]!;
      this.ensureCapacity(t1);
      const tailIndex1 = this.tail.length;
      this.tail.push(this.codesToString(oldRest.slice(1)));
      this.base[t1]! = -tailIndex1;
      this.check[t1]! = current;

      const t2 = base + newRest[0]!;
      this.ensureCapacity(t2);
      const tailIndex2 = this.tail.length;
      this.tail.push(this.codesToString(newRest.slice(1)));
      this.base[t2]! = -tailIndex2;
      this.check[t2]! = current;
    }
  }

  private addTailChild(parent: number, chars: number[]): void {
    const children = this.getChildren(parent);
    if (children.length === 0) {
      const base = this.findBase([chars[0]!]);
      this.base[parent]! = base;
      const t = base + chars[0]!;
      this.ensureCapacity(t);
      this.check[t]! = parent;

      const tailIndex = this.tail.length;
      this.tail.push(this.codesToString(chars.slice(1)));
      this.base[t]! = -tailIndex;
    } else {
      const newCode = chars[0]!;
      const allCodes = [...children, newCode];
      const base = this.findBase(allCodes);
      this.rebase(parent, children, base);
      const t = base + newCode;
      this.ensureCapacity(t);
      this.check[t]! = parent;

      const tailIndex = this.tail.length;
      this.tail.push(this.codesToString(chars.slice(1)));
      this.base[t]! = -tailIndex;
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

    const saved: Array<{
      oldT: number;
      newT: number;
      baseVal: number;
      grandchildren: number[];
    }> = [];

    for (const child of children) {
      const oldT = oldBase + child;
      const newT = newBase + child;
      this.ensureCapacity(newT);
      const childBase = this.base[oldT]!;
      const gc: number[] = [];

      if (childBase > 0) {
        for (let code = 0; code < 128; code++) {
          const gcPos = childBase + code;
          if (gcPos < this.check.length && this.check[gcPos] === oldT) {
            gc.push(gcPos);
          }
        }
      }

      saved.push({ oldT, newT, baseVal: childBase, grandchildren: gc });
    }

    for (const { oldT } of saved) {
      this.base[oldT]! = 0;
      this.check[oldT]! = -1;
    }

    for (const { oldT, newT, baseVal, grandchildren } of saved) {
      this.base[newT]! = baseVal;
      this.check[newT]! = parent;
      for (const gcPos of grandchildren) {
        this.check[gcPos]! = newT;
      }
      if (this.wordEnd.has(oldT)) {
        this.wordEnd.delete(oldT);
        this.wordEnd.add(newT);
      }
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
    if (this.wordEnd.has(state)) {
      results.push(prefix);
    }

    const base = this.base[state]!;

    if (base < 0) {
      const tailIndex = -base;
      const tailStr = this.tail[tailIndex];
      if (tailStr === undefined) {
        return;
      }
      if (tailStr === '') {
        if (!this.wordEnd.has(state)) {
          results.push(prefix);
        }
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

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toString(): string {
    return `${DoubleArrayTrie2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: string, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  static from(items: any[]): DoubleArrayTrie2 {
    const instance = new DoubleArrayTrie2()
    for (const item of items) {
      instance.insert(item)
    }
    return instance
  }
}
