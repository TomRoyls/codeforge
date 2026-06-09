export class LindenmayerSystem2 {
  private axiom: string;
  private rules: Map<string, string>;
  private current: string;

  constructor(axiom: string, rules: Map<string, string>) {
    this.axiom = axiom;
    this.rules = new Map(rules);
    this.current = axiom;
  }

  iterate(n: number): string {
    for (let i = 0; i < n; i++) {
      this.iterateOnce();
    }
    return this.getCurrent();
  }

  iterateOnce(): string {
    let result = '';
    for (const char of this.current) {
      const successor = this.rules.get(char);
      if (successor !== undefined) {
        result += successor;
      } else {
        result += char;
      }
    }
    this.current = result;
    return this.getCurrent();
  }

  getCurrent(): string {
    return this.current;
  }

  reset(): void {
    this.current = this.axiom;
  }

  getAxiom(): string {
    return this.axiom;
  }

  getRules(): Map<string, string> {
    return new Map(this.rules);
  }

  addRule(predecessor: string, successor: string): void {
    this.rules.set(predecessor, successor);
  }

  removeRule(predecessor: string): boolean {
    return this.rules.delete(predecessor);
  }

  toString(): string {
    return `LindenmayerSystem2()`
  }
}
