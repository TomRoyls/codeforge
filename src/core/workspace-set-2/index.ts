export class WorkspaceSet2<T> {
  private workspaces: Map<string, Set<T>>;

  constructor() {
    this.workspaces = new Map<string, Set<T>>();
  }

  createWorkspace(name: string): void {
    if (!this.workspaces.has(name)) {
      this.workspaces.set(name, new Set<T>());
    }
  }

  deleteWorkspace(name: string): boolean {
    return this.workspaces.delete(name);
  }

  hasWorkspace(name: string): boolean {
    return this.workspaces.has(name);
  }

  addToWorkspace(workspace: string, item: T): void {
    if (!this.workspaces.has(workspace)) {
      this.createWorkspace(workspace);
    }
    const ws = this.workspaces.get(workspace);
    if (ws) {
      ws.add(item);
    }
  }

  removeFromWorkspace(workspace: string, item: T): boolean {
    const ws = this.workspaces.get(workspace);
    if (ws) {
      return ws.delete(item);
    }
    return false;
  }

  getWorkspace(name: string): Set<T> {
    const ws = this.workspaces.get(name);
    return ws ? new Set(ws) : new Set<T>();
  }

  getWorkspaceNames(): string[] {
    return Array.from(this.workspaces.keys());
  }

  workspaceSize(name: string): number {
    const ws = this.workspaces.get(name);
    return ws ? ws.size : 0;
  }

  totalItems(): number {
    let total = 0;
    for (const ws of this.workspaces.values()) {
      total += ws.size;
    }
    return total;
  }

  moveItem(item: T, from: string, to: string): boolean {
    if (from === to) {
      return true;
    }
    const fromWs = this.workspaces.get(from);
    if (fromWs && fromWs.has(item)) {
      fromWs.delete(item);
      this.addToWorkspace(to, item);
      return true;
    }
    return false;
  }

  clear(): void {
    this.workspaces.clear();
  }

  clearWorkspace(name: string): void {
    const ws = this.workspaces.get(name);
    if (ws) {
      ws.clear();
    }
  }

  toString(): string {
    return `WorkspaceSet2()`
  }
}
