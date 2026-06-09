export class GraphColoring2 {
  constructor() {}

  colorGreedy(adjacencyList: Map<string, string[]>): Map<string, number> {
    const coloring: Map<string, number> = new Map();
    const vertices = [...adjacencyList.keys()];

    for (const vertex of vertices) {
      const neighbors = adjacencyList.get(vertex) ?? [];
      const usedColors = new Set<number>();

      for (const neighbor of neighbors) {
        const neighborColor = coloring.get(neighbor);
        if (neighborColor !== undefined) {
          usedColors.add(neighborColor);
        }
      }

      let color = 0;
      while (usedColors.has(color)) {
        color++;
      }

      coloring.set(vertex, color);
    }

    return coloring;
  }

  colorBacktracking(adjacencyList: Map<string, string[]>, maxColors: number): Map<string, number> | null {
    const vertices = [...adjacencyList.keys()];
    const coloring: Map<string, number> = new Map();

    const backtrack = (index: number): boolean => {
      if (index === vertices.length) {
        return true;
      }

      const vertex = vertices[index]!;
      const neighbors = adjacencyList.get(vertex) ?? [];

      for (let color = 0; color < maxColors; color++) {
        let valid = true;

        for (const neighbor of neighbors) {
          const neighborColor = coloring.get(neighbor);
          if (neighborColor === color) {
            valid = false;
            break;
          }
        }

        if (valid) {
          coloring.set(vertex, color);

          if (backtrack(index + 1)) {
            return true;
          }

          coloring.delete(vertex);
        }
      }

      return false;
    };

    if (backtrack(0)) {
      return coloring;
    }

    return null;
  }

  chromaticNumber(adjacencyList: Map<string, string[]>): number {
    if (adjacencyList.size === 0) {
      return 0;
    }

    let lowerBound = 1;
    let upperBound = adjacencyList.size;

    const greedyColoring = this.colorGreedy(adjacencyList);
    upperBound = this.getColorCount(greedyColoring);

    for (let colors = lowerBound; colors <= upperBound; colors++) {
      const result = this.colorBacktracking(adjacencyList, colors);
      if (result !== null) {
        return colors;
      }
    }

    return upperBound;
  }

  isValid(adjacencyList: Map<string, string[]>, coloring: Map<string, number>): boolean {
    for (const [vertex, neighbors] of adjacencyList.entries()) {
      const vertexColor = coloring.get(vertex);

      if (vertexColor === undefined) {
        return false;
      }

      for (const neighbor of neighbors) {
        const neighborColor = coloring.get(neighbor);

        if (neighborColor !== undefined && neighborColor === vertexColor) {
          return false;
        }
      }
    }

    return true;
  }

  getColorCount(coloring: Map<string, number>): number {
    return new Set(coloring.values()).size;
  }

  toString(): string {
    return `GraphColoring2()`
  }
}
