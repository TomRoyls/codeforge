import { increment } from '../../utils/map-helpers.js'

export interface Vertex {
  x: number;
  y: number;
  z: number;
}

export interface Edge {
  v1: number;
  v2: number;
  leftFace: number | null;
  rightFace: number | null;
  leftPrev: number | null;
  leftNext: number | null;
  rightPrev: number | null;
  rightNext: number | null;
}

export interface Face {
  edges: number[];
}

export class WingedEdgeMesh {
  private vertices: Vertex[];
  private edges: Edge[];
  private faces: (Face | null)[];
  private vertexEdges: Map<number, Set<number>>;

  constructor() {
    this.vertices = [];
    this.edges = [];
    this.faces = [];
    this.vertexEdges = new Map();
  }

  addVertex(x: number, y: number, z: number): number {
    const vertex: Vertex = { x, y, z };
    this.vertices.push(vertex);
    this.vertexEdges.set(this.vertices.length - 1, new Set());
    return this.vertices.length - 1;
  }

  addEdge(v1: number, v2: number): number {
    const edge: Edge = {
      v1,
      v2,
      leftFace: null,
      rightFace: null,
      leftPrev: null,
      leftNext: null,
      rightPrev: null,
      rightNext: null,
    };
    this.edges.push(edge);
    const edgeId = this.edges.length - 1;
    this.vertexEdges.get(v1)!.add(edgeId);
    this.vertexEdges.get(v2)!.add(edgeId);
    return edgeId;
  }

  addFace(edgeIds: number[]): number {
    const face: Face = { edges: edgeIds };
    this.faces.push(face);
    const faceId = this.faces.length - 1;

    for (let i = 0; i < edgeIds.length; i++) {
      const currentEdgeId = edgeIds[i]!;
      const nextEdgeId = edgeIds[(i + 1) % edgeIds.length]!;
      const prevEdgeId = edgeIds[(i - 1 + edgeIds.length) % edgeIds.length]!;

      const edge = this.edges[currentEdgeId]!;

      if (edge.leftFace === null) {
        edge.leftFace = faceId;
        edge.leftPrev = prevEdgeId;
        edge.leftNext = nextEdgeId;
      } else {
        edge.rightFace = faceId;
        edge.rightPrev = prevEdgeId;
        edge.rightNext = nextEdgeId;
      }
    }

    return faceId;
  }

  getVertexCount(): number {
    return this.vertices.length;
  }

  getEdgeCount(): number {
    return this.edges.length;
  }

  getFaceCount(): number {
    let count = 0;
    for (const face of this.faces) {
      if (face !== null) {
        count++;
      }
    }
    return count;
  }

  getVertex(id: number): Vertex | undefined {
    return this.vertices[id];
  }

  getEdgeVertices(edgeId: number): [number, number] | undefined {
    const edge = this.edges[edgeId];
    if (!edge) {
      return undefined;
    }
    return [edge.v1, edge.v2];
  }

  getEdgeFaces(edgeId: number): number[] {
    const edge = this.edges[edgeId];
    if (!edge) {
      return [];
    }
    const faces: number[] = [];
    if (edge.leftFace !== null) {
      faces.push(edge.leftFace);
    }
    if (edge.rightFace !== null) {
      faces.push(edge.rightFace);
    }
    return faces;
  }

  getAdjacentEdges(edgeId: number): number[] {
    const edge = this.edges[edgeId];
    if (!edge) {
      return [];
    }
    const adjacent: number[] = [];
    if (edge.leftPrev !== null) {
      adjacent.push(edge.leftPrev);
    }
    if (edge.leftNext !== null) {
      adjacent.push(edge.leftNext);
    }
    if (edge.rightPrev !== null) {
      adjacent.push(edge.rightPrev);
    }
    if (edge.rightNext !== null) {
      adjacent.push(edge.rightNext);
    }
    return adjacent;
  }

  getVertexEdges(vertexId: number): number[] {
    const edgeSet = this.vertexEdges.get(vertexId);
    if (!edgeSet) {
      return [];
    }
    return Array.from(edgeSet);
  }

  getFaceEdges(faceId: number): number[] {
    const face = this.faces[faceId];
    if (!face) {
      return [];
    }
    return [...face.edges];
  }

  removeFace(faceId: number): boolean {
    const face = this.faces[faceId];
    if (!face) {
      return false;
    }

    for (const edgeId of face.edges) {
      const edge = this.edges[edgeId]!;
      if (edge.leftFace === faceId) {
        edge.leftFace = null;
        edge.leftPrev = null;
        edge.leftNext = null;
      } else if (edge.rightFace === faceId) {
        edge.rightFace = null;
        edge.rightPrev = null;
        edge.rightNext = null;
      }
    }

    this.faces[faceId] = null;
    return true;
  }

  isManifold(): boolean {
    for (let i = 0; i < this.faces.length; i++) {
      const face = this.faces[i];
      if (!face) {
        continue;
      }

      const edgeIds = face.edges;
      if (edgeIds.length < 3) {
        return false;
      }

      const vertexCount = new Map<number, number>();
      for (const edgeId of edgeIds) {
        const edge = this.edges[edgeId];
        if (!edge) {
          return false;
        }

increment(vertexCount, edge.v1);
  increment(vertexCount, edge.v2);
      }

      for (const count of vertexCount.values()) {
        if (count !== 2) {
          return false;
        }
      }
    }

    return true;
  }

  getTimeComplexity(): string {
    return 'addVertex: O(1), addEdge: O(1), addFace: O(k) where k is face edge count, getVertex: O(1), getEdgeVertices: O(1), getEdgeFaces: O(1), getAdjacentEdges: O(1), getVertexEdges: O(degree), getFaceEdges: O(1), removeFace: O(k), isManifold: O(E), getTimeComplexity: O(1)';
  }
}
