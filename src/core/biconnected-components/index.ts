export class BiconnectedComponents {
  private adjacencyList: Map<number, number[]>;
  private vertices: number;
  private edges: number;

  constructor(vertices: number) {
    this.adjacencyList = new Map();
    this.vertices = vertices;
    this.edges = 0;

    for (let i = 0; i < vertices; i++) {
      this.adjacencyList.set(i, []);
    }
  }

  addEdge(u: number, v: number): void {
    this.adjacencyList.get(u)!.push(v);
    this.adjacencyList.get(v)!.push(u);
    this.edges++;
  }

  findComponents(): number[][] {
    const components: number[][] = [];
    const discoveryTime = new Array<number>(this.vertices).fill(-1);
    const lowLink = new Array<number>(this.vertices).fill(0);
    const parent = new Array<number | null>(this.vertices).fill(null);
    const timeRef = { value: 0 };
    const stack: number[] = [];

    for (let i = 0; i < this.vertices; i++) {
      if (discoveryTime[i] === -1) {
        this.dfs(i, discoveryTime, lowLink, parent, timeRef, components, stack);
      }
    }

    return components;
  }

  private dfs(
    u: number,
    discoveryTime: number[],
    lowLink: number[],
    parent: (number | null)[],
    timeRef: { value: number },
    components: number[][],
    stack: number[]
  ): void {
    let children = 0;
    discoveryTime[u] = timeRef.value;
    lowLink[u] = timeRef.value;
    timeRef.value++;
    stack.push(u);

    for (const v of this.adjacencyList.get(u)!) {
      if (discoveryTime[v] === -1) {
        parent[v] = u;
        children++;
        this.dfs(v, discoveryTime, lowLink, parent, timeRef, components, stack);
        const lowV = lowLink[v]!;
        lowLink[u] = Math.min(lowLink[u]!, lowV);

        const isRootWithMultipleChildren = parent[u] === null && children > 1;
        const isArticulation = parent[u] !== null && lowV >= discoveryTime[u];

        if (isRootWithMultipleChildren || isArticulation) {
          this.popComponent(stack, lowLink, discoveryTime, u, v, components);
        }
      } else if (v !== parent[u]) {
        const discV = discoveryTime[v]!;
        lowLink[u] = Math.min(lowLink[u]!, discV);
      }
    }

    if (parent[u] === null) {
      this.popRemaining(stack, lowLink, discoveryTime, u, components);
    }
  }

  private popComponent(
    stack: number[],
    _lowLink: number[],
    discoveryTime: number[],
    u: number,
    _v: number,
    components: number[][]
  ): void {
    const component: number[] = [];
    let w: number | null = null;
    do {
      w = stack.pop()!;
      component.unshift(w);
    } while (w !== u && discoveryTime[w]! >= discoveryTime[u]!);
    component.unshift(u);
    if (component.length >= 2 && !this.componentExists(component, components)) {
      for (let i = 0; i < component.length - 1; i++) {
        components.push([component[i]!, component[i + 1]!]);
      }
    }
  }

  private popRemaining(
    stack: number[],
    _lowLink: number[],
    _discoveryTime: number[],
    u: number,
    components: number[][]
  ): void {
    while (stack.length > 0) {
      const w = stack.pop()!;
      const edge: number[] = [u, w];
      if (!this.componentExists(edge, components)) {
        components.push(edge);
      }
    }
  }

  private componentExists(newComponent: number[], components: number[][]): boolean {
    for (const component of components) {
      if (component.length !== newComponent.length) {
        continue;
      }
      let match = true;
      for (let i = 0; i < newComponent.length - 1; i++) {
        const edge1 = [newComponent[i]!, newComponent[i + 1]!];
        let found = false;
        for (let j = 0; j < component.length - 1; j++) {
          const edge2 = [component[j]!, component[j + 1]!];
          if ((edge1[0] === edge2[0] && edge1[1] === edge2[1]) || (edge1[0] === edge2[1] && edge1[1] === edge2[0])) {
            found = true;
            break;
          }
        }
        if (!found) {
          match = false;
          break;
        }
      }
      if (match) {
        return true;
      }
    }
    return false;
  }

  getArticulationPoints(): number[] {
    const articulationPoints: number[] = [];
    const discoveryTime = new Array<number>(this.vertices).fill(-1);
    const lowLink = new Array<number>(this.vertices).fill(0);
    const parent = new Array<number | null>(this.vertices).fill(null);
    const timeRef = { value: 0 };

    for (let i = 0; i < this.vertices; i++) {
      if (discoveryTime[i] === -1) {
        this.findArticulationDFS(i, discoveryTime, lowLink, parent, timeRef, articulationPoints);
      }
    }

    return articulationPoints;
  }

  private findArticulationDFS(
    u: number,
    discoveryTime: number[],
    lowLink: number[],
    parent: (number | null)[],
    timeRef: { value: number },
    articulationPoints: number[]
  ): void {
    let children = 0;
    discoveryTime[u] = timeRef.value;
    lowLink[u] = timeRef.value;
    timeRef.value++;

    for (const v of this.adjacencyList.get(u)!) {
      if (discoveryTime[v] === -1) {
        parent[v] = u;
        children++;
        this.findArticulationDFS(v, discoveryTime, lowLink, parent, timeRef, articulationPoints);
        const lowV = lowLink[v]!;
        lowLink[u] = Math.min(lowLink[u]!, lowV);

        const isRootWithMultipleChildren = parent[u] === null && children > 1;
        const isArticulation = parent[u] !== null && lowV >= discoveryTime[u]!;

        if (isRootWithMultipleChildren || isArticulation) {
          if (!articulationPoints.includes(u)) {
            articulationPoints.push(u);
          }
        }
      } else if (v !== parent[u]) {
        const discV = discoveryTime[v]!;
        lowLink[u] = Math.min(lowLink[u]!, discV);
      }
    }
  }

  isBiconnected(): boolean {
    const components = this.findComponents();
    const articulationPoints = this.getArticulationPoints();
    if (this.edges === 0) {
      return articulationPoints.length === 0;
    }
    return components.length === 1 && articulationPoints.length === 0;
  }

  getComponentCount(): number {
    return this.findComponents().length;
  }

  getVertexCount(): number {
    return this.vertices;
  }

  getEdgeCount(): number {
    return this.edges;
  }

  hasArticulationPoint(v: number): boolean {
    return this.getArticulationPoints().includes(v);
  }

  getTimeComplexity(): string {
    return 'O(V + E)';
  }

  clear(): void {
    this.edges = 0
  }

  toString(): string {
    return `BiconnectedComponents()`
  }

  get [Symbol.toStringTag](): string {
    return 'BiconnectedComponents'
  }
}
