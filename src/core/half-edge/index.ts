export interface Vertex {
  x: number;
  y: number;
  z: number;
}

export interface HalfEdge {
  next: number | null;
  twin: number | null;
  vertex: number;
  face: number | null;
}

export interface Face {
  halfEdge: number | null;
}

export class HalfEdgeMesh {
  private vertices: Vertex[] = [];
  private halfEdges: (HalfEdge | null)[] = [];
  private faces: (Face | null)[] = [];
  private vertexHalfEdges: (number | null)[] = [];

  addVertex(x: number, y: number, z: number): number {
    const id = this.vertices.length;
    this.vertices.push({ x, y, z });
    this.vertexHalfEdges.push(null);
    return id;
  }

  addFace(vertexIds: number[]): number {
    if (vertexIds.length < 3) {
      throw new Error('Face must have at least 3 vertices');
    }

    const faceId = this.faces.length;
    const faceHalfEdgeIndices: number[] = [];

    for (let i = 0; i < vertexIds.length; i++) {
      const fromVertex = vertexIds[i]!;
      const toVertex = vertexIds[(i + 1) % vertexIds.length]!;

      if (fromVertex < 0 || fromVertex >= this.vertices.length) {
        throw new Error(`Invalid vertex id: ${fromVertex}`);
      }
      if (toVertex < 0 || toVertex >= this.vertices.length) {
        throw new Error(`Invalid vertex id: ${toVertex}`);
      }

      const existingHalfEdge = this.findHalfEdge(fromVertex, toVertex);
      if (existingHalfEdge !== null) {
        throw new Error('Edge already exists');
      }

      const halfEdgeId = this.halfEdges.length;
      this.halfEdges.push({
        next: null,
        twin: null,
        vertex: fromVertex,
        face: faceId,
      });
      faceHalfEdgeIndices.push(halfEdgeId);

      if (this.vertexHalfEdges[fromVertex] === null) {
        this.vertexHalfEdges[fromVertex] = halfEdgeId;
      }
    }

    for (let i = 0; i < faceHalfEdgeIndices.length; i++) {
      const current = faceHalfEdgeIndices[i]!;
      const next = faceHalfEdgeIndices[(i + 1) % faceHalfEdgeIndices.length]!;
      this.halfEdges[current]!.next = next;
    }

    for (let i = 0; i < vertexIds.length; i++) {
      const fromVertex = vertexIds[i]!;
      const toVertex = vertexIds[(i + 1) % vertexIds.length]!;
      const currentHalfEdge = faceHalfEdgeIndices[i]!;

      const twinHalfEdge = this.findHalfEdge(toVertex, fromVertex);
      if (twinHalfEdge !== null) {
        this.halfEdges[currentHalfEdge]!.twin = twinHalfEdge;
        this.halfEdges[twinHalfEdge]!.twin = currentHalfEdge;
      }
    }

    this.faces.push({ halfEdge: faceHalfEdgeIndices[0]! });
    return faceId;
  }

  getVertexCount(): number {
    return this.vertices.length;
  }

  getFaceCount(): number {
    return this.faces.length;
  }

  getEdgeCount(): number {
    const counted = new Set<string>();
    for (const he of this.halfEdges) {
      if (he === null) {
        continue;
      }
      const next = this.halfEdges[he.next!]!;
      if (next === null) {
        continue;
      }
      const edgeKey = `${Math.min(he.vertex, next.vertex)}-${Math.max(he.vertex, next.vertex)}`;
      if (!counted.has(edgeKey)) {
        counted.add(edgeKey);
      }
    }
    return counted.size;
  }

  getVertex(id: number): { x: number; y: number; z: number } | undefined {
    if (id < 0 || id >= this.vertices.length) {
      return undefined;
    }
    return this.vertices[id];
  }

  getFaceVertices(faceId: number): number[] {
    if (faceId < 0 || faceId >= this.faces.length) {
      return [];
    }
    const face = this.faces[faceId]!;
    if (face === null) {
      return [];
    }
    if (face.halfEdge === null) {
      return [];
    }

    const vertices: number[] = [];
    let current = face.halfEdge;
    do {
      const he = this.halfEdges[current!]!;
      if (he === null) {
        break;
      }
      vertices.push(he.vertex);
      current = he.next!;
      if (current === face.halfEdge) {
        break;
      }
    } while (current !== face.halfEdge);

    return vertices;
  }

  getAdjacentFaces(faceId: number): number[] {
    if (faceId < 0 || faceId >= this.faces.length) {
      return [];
    }
    const face = this.faces[faceId]!;
    if (face === null || face.halfEdge === null) {
      return [];
    }

    const adjacentFaces = new Set<number>();
    let current = face.halfEdge;
    do {
      const he = this.halfEdges[current!]!;
      if (he === null) {
        break;
      }
      if (he.twin !== null) {
        const twin = this.halfEdges[he.twin]!;
        if (twin.face !== null) {
          adjacentFaces.add(twin.face);
        }
      }
      current = he.next!;
    } while (current !== face.halfEdge);

    return Array.from(adjacentFaces);
  }

  getVertexNeighbors(vertexId: number): number[] {
    if (vertexId < 0 || vertexId >= this.vertices.length) {
      return [];
    }

    const neighbors = new Set<number>();

    const startHe = this.vertexHalfEdges[vertexId]!;
    if (startHe !== null) {
      let current = startHe;
      const visitedHalfEdges = new Set<number>();

      do {
        if (visitedHalfEdges.has(current)) {
          break;
        }
        visitedHalfEdges.add(current);

        const he = this.halfEdges[current]!;
        if (he === null || he.next === null) {
          break;
        }

        const nextHe = this.halfEdges[he.next]!;
        if (nextHe !== null) {
          neighbors.add(nextHe.vertex);
        }

        if (he.twin !== null) {
          const twin = this.halfEdges[he.twin]!;
          if (twin.next !== null) {
            current = twin.next;
          } else {
            break;
          }
        } else {
          break;
        }
      } while (current !== startHe && current !== null && !visitedHalfEdges.has(current));
    }

    return Array.from(neighbors);
  }

  getVertexFaces(vertexId: number): number[] {
    if (vertexId < 0 || vertexId >= this.vertices.length) {
      return [];
    }

    const faces = new Set<number>();

    const startHe = this.vertexHalfEdges[vertexId]!;
    if (startHe !== null) {
      let current = startHe;
      const visitedHalfEdges = new Set<number>();

      do {
        if (visitedHalfEdges.has(current)) {
          break;
        }
        visitedHalfEdges.add(current);

        const he = this.halfEdges[current]!;
        if (he === null) {
          break;
        }

        if (he.face !== null) {
          faces.add(he.face);
        }

        if (he.twin !== null) {
          const twin = this.halfEdges[he.twin]!;
          if (twin.next !== null) {
            current = twin.next;
          } else {
            break;
          }
        } else {
          break;
        }
      } while (current !== startHe && current !== null && !visitedHalfEdges.has(current));
    }

    return Array.from(faces);
  }

  removeFace(faceId: number): boolean {
    if (faceId < 0 || faceId >= this.faces.length) {
      return false;
    }
    const face = this.faces[faceId]!;
    if (face === null) {
      return false;
    }

    const halfEdgesToRemove: number[] = [];
    if (face.halfEdge !== null) {
      let current = face.halfEdge;
      do {
        halfEdgesToRemove.push(current!);
        const he = this.halfEdges[current!]!;
        if (he === null) {
          break;
        }
        current = he.next!;
      } while (current !== face.halfEdge);
    }

    for (const heId of halfEdgesToRemove) {
      const he = this.halfEdges[heId]!;
      if (he === null) {
        continue;
      }

      if (he.twin !== null) {
        const twin = this.halfEdges[he.twin]!;
        twin.twin = null;
      }

      this.halfEdges[heId] = null;
    }

    this.faces[faceId] = null;
    return true;
  }

  isManifold(): boolean {
    const edgeFaceCount = new Map<string, number>();

    for (let i = 0; i < this.halfEdges.length; i++) {
      const he = this.halfEdges[i]!;
      if (he === null || he.next === null || he.face === null) {
        continue;
      }

      const nextHe = this.halfEdges[he.next]!;
      if (nextHe === null) {
        continue;
      }

      const edgeKey = `${Math.min(he.vertex, nextHe.vertex)}-${Math.max(he.vertex, nextHe.vertex)}`;
      edgeFaceCount.set(edgeKey, (edgeFaceCount.get(edgeKey) || 0) + 1);

      if (he.twin !== null) {
        const twin = this.halfEdges[he.twin]!;
        if (twin.twin !== i) {
          return false;
        }
      }
    }

    const counts = Array.from(edgeFaceCount.values());
    for (const count of counts) {
      if (count > 2) {
        return false;
      }
    }

    return true;
  }

  getBoundaryEdges(): number[][] {
    const boundaries: number[][] = [];
    const visitedHalfEdges = new Set<number>();

    for (let i = 0; i < this.halfEdges.length; i++) {
      const he = this.halfEdges[i]!;
      if (he === null || he.next === null) {
        continue;
      }
      if (he.twin !== null) {
        continue;
      }
      if (visitedHalfEdges.has(i)) {
        continue;
      }

      const boundary: number[] = [];
      let current = i;
      let boundaryComplete = false;

      while (!boundaryComplete) {
        if (visitedHalfEdges.has(current)) {
          break;
        }
        visitedHalfEdges.add(current);

        const currentHe = this.halfEdges[current]!;
        if (currentHe === null || currentHe.next === null) {
          break;
        }

        boundary.push(currentHe.vertex);

        const nextHe = this.halfEdges[currentHe.next]!;
        if (nextHe === null) {
          break;
        }

        if (nextHe.twin === null) {
          current = currentHe.next;
        } else {
          break;
        }

        if (current === i) {
          boundaryComplete = true;
        }
      }

      if (boundary.length > 0) {
        boundaries.push(boundary);
      }
    }

    return boundaries;
  }

  getTimeComplexity(): string {
    return 'O(1) for direct access, O(k) for vertex/face operations where k is the number of incident edges';
  }

  private findHalfEdge(fromVertex: number, toVertex: number): number | null {
    const startHe = this.vertexHalfEdges[fromVertex]!;
    if (startHe === null) {
      return null;
    }

    let current = startHe;
    const visitedHalfEdges = new Set<number>();
    do {
      if (visitedHalfEdges.has(current)) {
        break;
      }
      visitedHalfEdges.add(current);

      const he = this.halfEdges[current]!;
      if (he === null || he.next === null) {
        break;
      }

      const nextHe = this.halfEdges[he.next]!;
      if (nextHe !== null && nextHe.vertex === toVertex && he.vertex === fromVertex) {
        return he.next;
      }

      if (he.twin !== null) {
        const twin = this.halfEdges[he.twin]!;
        if (twin.next !== null) {
          current = twin.next;
        } else {
          break;
        }
      } else {
        break;
      }
    } while (current !== startHe && current !== null && !visitedHalfEdges.has(current));

    return null;
  }
}
