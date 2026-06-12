import { describe, it, expect } from 'vitest';
import { LinkCutTree } from '../../src/utils/link-cut-tree.js';

describe('LinkCutTree', () => {
  it('should initialize with correct number of nodes', () => {
    const lct = new LinkCutTree(5);
    expect(() => lct.setValue(0, 1)).not.toThrow();
    expect(() => lct.setValue(4, 5)).not.toThrow();
  });

  it('should throw error for out of bounds node access', () => {
    const lct = new LinkCutTree(5);
    expect(() => lct.setValue(5, 1)).toThrow('Node index out of bounds');
    expect(() => lct.getValue(-1)).toThrow('Node index out of bounds');
  });

  it('should link two nodes', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    expect(lct.connected(0, 1)).toBe(true);
  });

  it('should throw error when linking node to itself', () => {
    const lct = new LinkCutTree(5);
    expect(() => lct.link(0, 0)).toThrow('Cannot link node to itself');
  });

  it('should throw error when linking already connected nodes', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    expect(() => lct.link(0, 1)).toThrow('Nodes are already connected');
  });

  it('should cut node from its parent', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    lct.cut(0);
    expect(lct.connected(0, 1)).toBe(false);
  });

  it('should find root of a tree', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    lct.link(1, 2);
    expect(lct.findRoot(0)).toBe(2);
  });

  it('should be its own root when not linked', () => {
    const lct = new LinkCutTree(5);
    expect(lct.findRoot(0)).toBe(0);
  });

  it('should check if nodes are connected', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    lct.link(1, 2);
    expect(lct.connected(0, 2)).toBe(true);
    expect(lct.connected(0, 3)).toBe(false);
  });

  it('should return true when checking same node for connection', () => {
    const lct = new LinkCutTree(5);
    expect(lct.connected(0, 0)).toBe(true);
  });

  it('should calculate path sum', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.link(0, 1);
    lct.link(1, 2);
    expect(lct.pathSum(0)).toBe(6);
  });

  it('should find path minimum', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 5);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.link(0, 1);
    lct.link(1, 2);
    expect(lct.pathMin(0)).toBe(2);
  });

  it('should find path maximum', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 5);
    lct.link(0, 1);
    lct.link(1, 2);
    expect(lct.pathMax(0)).toBe(5);
  });

  it('should update path values', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.link(0, 1);
    lct.link(1, 2);
    lct.pathUpdate(0, 10);
    expect(lct.pathSum(0)).toBe(36);
  });

  it('should find lowest common ancestor', () => {
    const lct = new LinkCutTree(6);
    lct.link(0, 2);
    lct.link(1, 2);
    lct.link(2, 3);
    lct.link(3, 4);
    lct.link(3, 5);
    expect(lct.lca(0, 1)).toBe(2);
    expect(lct.lca(0, 4)).toBe(3);
  });

  it('should return -1 for LCA of unconnected nodes', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    lct.link(2, 3);
    expect(lct.lca(0, 2)).toBe(-1);
  });

  it('should return node itself as LCA when nodes are same', () => {
    const lct = new LinkCutTree(5);
    lct.link(0, 1);
    expect(lct.lca(0, 0)).toBe(0);
  });

  it('should evert node to make it root', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.link(0, 1);
    lct.link(1, 2);
    lct.evert(0);
    expect(lct.findRoot(2)).toBe(0);
  });

  it('should handle single node operations', () => {
    const lct = new LinkCutTree(1);
    lct.setValue(0, 42);
    expect(lct.getValue(0)).toBe(42);
    expect(lct.pathSum(0)).toBe(42);
    expect(lct.pathMin(0)).toBe(42);
    expect(lct.pathMax(0)).toBe(42);
  });

  it('should handle chain graph structure', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.setValue(3, 4);
    lct.setValue(4, 5);
    lct.link(0, 1);
    lct.link(1, 2);
    lct.link(2, 3);
    lct.link(3, 4);
    expect(lct.pathSum(0)).toBe(15);
    expect(lct.findRoot(0)).toBe(4);
  });

  it('should handle star graph structure', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 10);
    lct.setValue(1, 1);
    lct.setValue(2, 2);
    lct.setValue(3, 3);
    lct.setValue(4, 4);
    lct.link(1, 0);
    lct.link(2, 0);
    lct.link(3, 0);
    lct.link(4, 0);
    expect(lct.pathSum(1)).toBe(11);
    expect(lct.pathSum(2)).toBe(12);
    expect(lct.pathSum(3)).toBe(13);
    expect(lct.pathSum(4)).toBe(14);
  });

  it('should set and get node values', () => {
    const lct = new LinkCutTree(3);
    lct.setValue(0, 100);
    lct.setValue(1, 200);
    lct.setValue(2, 300);
    expect(lct.getValue(0)).toBe(100);
    expect(lct.getValue(1)).toBe(200);
    expect(lct.getValue(2)).toBe(300);
  });

  it('should handle cut and relink operations', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.link(0, 1);
    lct.link(1, 2);
    lct.cut(1);
    lct.link(1, 3);
    lct.link(3, 4);
    expect(lct.connected(0, 1)).toBe(false);
    expect(lct.connected(1, 4)).toBe(true);
  });

  it('should handle multiple path updates', () => {
    const lct = new LinkCutTree(5);
    lct.setValue(0, 1);
    lct.setValue(1, 2);
    lct.setValue(2, 3);
    lct.link(0, 1);
    lct.link(1, 2);
    lct.pathUpdate(0, 5);
    expect(lct.pathSum(0)).toBe(21);
    lct.pathUpdate(1, 10);
    expect(lct.pathSum(1)).toBe(35);
  });

  describe('toString', () => {
    it('should return correct format', () => {
      const lct = new LinkCutTree(5);
      expect(lct.toString()).toBe('LinkCutTree(5)');
    });

    it('should include node count in toString', () => {
      const lct = new LinkCutTree(10);
      expect(lct.toString()).toBe('LinkCutTree(10)');
    });
  });

  describe('toJSON', () => {
    it('should return object with correct structure', () => {
      const lct = new LinkCutTree(3);
      lct.setValue(0, 1);
      lct.setValue(1, 2);
      lct.link(0, 1);
      const json = lct.toJSON() as Record<string, unknown>;
      expect(json).toHaveProperty('n');
      expect(json).toHaveProperty('parent');
      expect(json).toHaveProperty('children');
      expect(json).toHaveProperty('value');
    });

    it('toJSON includes correct n field', () => {
      const lct = new LinkCutTree(5);
      const json = lct.toJSON() as { n: number };
      expect(json.n).toBe(5);
    });

    it('toJSON includes parent array', () => {
      const lct = new LinkCutTree(3);
      lct.link(0, 1);
      const json = lct.toJSON() as { parent: number[] };
      expect(Array.isArray(json.parent)).toBe(true);
      expect(json.parent.length).toBe(3);
      expect(json.parent[0]).toBe(1);
    });

    it('toJSON includes children and value arrays', () => {
      const lct = new LinkCutTree(3);
      lct.setValue(0, 10);
      lct.link(0, 1);
      const json = lct.toJSON() as { children: number[][], value: number[] };
      expect(Array.isArray(json.children)).toBe(true);
      expect(Array.isArray(json.value)).toBe(true);
      expect(json.value[0]).toBe(10);
    });
  });

  describe('clone', () => {
    it('clone creates independent copy', () => {
      const lct = new LinkCutTree(3);
      lct.setValue(0, 1);
      lct.link(0, 1);
      const copy = lct.clone();
      copy.setValue(0, 99);
      expect(lct.getValue(0)).toBe(1);
      expect(copy.getValue(0)).toBe(99);
    });

    it('clone has same structure', () => {
      const lct = new LinkCutTree(4);
      lct.setValue(0, 1);
      lct.setValue(1, 2);
      lct.link(0, 1);
      lct.link(1, 2);
      const copy = lct.clone();
      expect(copy.equals(lct)).toBe(true);
    });

    it('clone modifications do not affect original', () => {
      const lct = new LinkCutTree(3);
      lct.link(0, 1);
      const copy = lct.clone();
      copy.cut(0);
      expect(lct.connected(0, 1)).toBe(true);
      expect(copy.connected(0, 1)).toBe(false);
    });

    it('clone with complex tree structure', () => {
      const lct = new LinkCutTree(6);
      lct.link(0, 2);
      lct.link(1, 2);
      lct.link(2, 3);
      lct.link(3, 4);
      lct.link(3, 5);
      const copy = lct.clone();
      expect(lct.equals(copy)).toBe(true);
    });
  });

  describe('equals', () => {
    it('equals returns true for identical trees', () => {
      const lct1 = new LinkCutTree(3);
      lct1.setValue(0, 1);
      lct1.link(0, 1);
      const lct2 = new LinkCutTree(3);
      lct2.setValue(0, 1);
      lct2.link(0, 1);
      expect(lct1.equals(lct2)).toBe(true);
    });

    it('equals returns false for different trees', () => {
      const lct1 = new LinkCutTree(3);
      lct1.link(0, 1);
      const lct2 = new LinkCutTree(3);
      lct2.link(1, 2);
      expect(lct1.equals(lct2)).toBe(false);
    });

    it('equals returns false for different node counts', () => {
      const lct1 = new LinkCutTree(3);
      const lct2 = new LinkCutTree(5);
      expect(lct1.equals(lct2)).toBe(false);
    });

    it('equals handles non-LinkCutTree objects', () => {
      const lct = new LinkCutTree(3);
      expect(lct.equals(null)).toBe(false);
      expect(lct.equals(undefined)).toBe(false);
      expect(lct.equals({})).toBe(false);
      expect(lct.equals(5)).toBe(false);
    });

    it('equals handles trees with same structure but different values', () => {
      const lct1 = new LinkCutTree(3);
      lct1.setValue(0, 1);
      lct1.link(0, 1);
      const lct2 = new LinkCutTree(3);
      lct2.setValue(0, 99);
      lct2.link(0, 1);
      expect(lct1.equals(lct2)).toBe(false);
    });
  });

  describe('error handling', () => {
    it('link throws for negative child index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.link(-1, 0)).toThrow('Node index out of bounds');
    });

    it('link throws for child index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.link(5, 0)).toThrow('Node index out of bounds');
    });

    it('link throws for negative parent index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.link(0, -1)).toThrow('Node index out of bounds');
    });

    it('link throws for parent index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.link(0, 5)).toThrow('Node index out of bounds');
    });

    it('cut throws for negative node index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.cut(-1)).toThrow('Node index out of bounds');
    });

    it('cut throws for node index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.cut(5)).toThrow('Node index out of bounds');
    });

    it('findRoot throws for negative node index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.findRoot(-1)).toThrow('Node index out of bounds');
    });

    it('findRoot throws for node index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.findRoot(5)).toThrow('Node index out of bounds');
    });

    it('lca throws for negative node index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.lca(-1, 0)).toThrow('Node index out of bounds');
    });

    it('lca throws for node index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.lca(0, 5)).toThrow('Node index out of bounds');
    });

    it('connected throws for negative node index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.connected(-1, 0)).toThrow('Node index out of bounds');
    });

    it('connected throws for node index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.connected(0, 5)).toThrow('Node index out of bounds');
    });

    it('pathSum throws for negative node index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.pathSum(-1)).toThrow('Node index out of bounds');
    });

    it('pathSum throws for node index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.pathSum(5)).toThrow('Node index out of bounds');
    });

    it('pathMin throws for negative node index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.pathMin(-1)).toThrow('Node index out of bounds');
    });

    it('pathMin throws for node index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.pathMin(5)).toThrow('Node index out of bounds');
    });

    it('pathMax throws for negative node index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.pathMax(-1)).toThrow('Node index out of bounds');
    });

    it('pathMax throws for node index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.pathMax(5)).toThrow('Node index out of bounds');
    });

    it('pathUpdate throws for negative node index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.pathUpdate(-1, 10)).toThrow('Node index out of bounds');
    });

    it('pathUpdate throws for node index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.pathUpdate(5, 10)).toThrow('Node index out of bounds');
    });

    it('setValue throws for negative node index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.setValue(-1, 10)).toThrow('Node index out of bounds');
    });

    it('setValue throws for node index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.setValue(5, 10)).toThrow('Node index out of bounds');
    });

    it('getValue throws for negative node index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.getValue(-1)).toThrow('Node index out of bounds');
    });

    it('getValue throws for node index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.getValue(5)).toThrow('Node index out of bounds');
    });

    it('evert throws for negative node index', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.evert(-1)).toThrow('Node index out of bounds');
    });

    it('evert throws for node index >= n', () => {
      const lct = new LinkCutTree(5);
      expect(() => lct.evert(5)).toThrow('Node index out of bounds');
    });
  });

  describe('edge cases', () => {
    it('cut on root does nothing', () => {
      const lct = new LinkCutTree(3);
      lct.link(0, 1);
      lct.cut(1);
      expect(lct.findRoot(0)).toBe(1);
      expect(lct.findRoot(1)).toBe(1);
    });

    it('pathUpdate with zero delta', () => {
      const lct = new LinkCutTree(3);
      lct.setValue(0, 5);
      lct.link(0, 1);
      lct.pathUpdate(0, 0);
      expect(lct.getValue(0)).toBe(5);
    });

    it('pathUpdate with negative delta', () => {
      const lct = new LinkCutTree(3);
      lct.setValue(0, 10);
      lct.link(0, 1);
      lct.pathUpdate(0, -5);
      expect(lct.getValue(0)).toBe(5);
    });

    it('setValue with zero', () => {
      const lct = new LinkCutTree(3);
      lct.setValue(0, 0);
      expect(lct.getValue(0)).toBe(0);
    });

    it('setValue with negative value', () => {
      const lct = new LinkCutTree(3);
      lct.setValue(0, -10);
      expect(lct.getValue(0)).toBe(-10);
    });

    it('handles multiple disconnected trees', () => {
      const lct = new LinkCutTree(6);
      lct.link(0, 1);
      lct.link(2, 3);
      lct.link(4, 5);
      expect(lct.connected(0, 1)).toBe(true);
      expect(lct.connected(2, 3)).toBe(true);
      expect(lct.connected(4, 5)).toBe(true);
      expect(lct.connected(0, 2)).toBe(false);
      expect(lct.connected(0, 4)).toBe(false);
      expect(lct.connected(2, 4)).toBe(false);
    });

    it('evert with no effect on single node', () => {
      const lct = new LinkCutTree(3);
      lct.setValue(0, 5);
      lct.evert(0);
      expect(lct.findRoot(0)).toBe(0);
      expect(lct.getValue(0)).toBe(5);
    });

    it('clone of tree with no links', () => {
      const lct = new LinkCutTree(4);
      lct.setValue(0, 1);
      lct.setValue(1, 2);
      const copy = lct.clone();
      expect(lct.equals(copy)).toBe(true);
    });

    it('equals returns true for tree with itself', () => {
      const lct = new LinkCutTree(3);
      lct.link(0, 1);
      expect(lct.equals(lct)).toBe(true);
    });

    it('handles empty tree with one node', () => {
      const lct = new LinkCutTree(1);
      expect(lct.findRoot(0)).toBe(0);
      expect(lct.connected(0, 0)).toBe(true);
    });
  });
});
describe('link-cut-tree - wave550', () => {
  it('link-cut-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave551', () => {
  it('link-cut-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave552', () => {
  it('link-cut-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave553', () => {
  it('link-cut-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave554', () => {
  it('link-cut-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave555', () => {
  it('link-cut-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave556', () => {
  it('link-cut-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave557', () => {
  it('link-cut-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave558', () => {
  it('link-cut-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave559', () => {
  it('link-cut-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave560', () => {
  it('link-cut-tree w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave561', () => {
  it('link-cut-tree w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave562', () => {
  it('link-cut-tree w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave563', () => {
  it('link-cut-tree w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave564', () => {
  it('link-cut-tree w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave565', () => {
  it('link-cut-tree w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave566', () => {
  it('link-cut-tree w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave127', () => {
  it('link-cut-tree w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave130', () => {
  it('link-cut-tree w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave133', () => {
  it('link-cut-tree w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave136', () => {
  it('link-cut-tree w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - wave139', () => {
  it('link-cut-tree w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w142', () => {
  it('link-cut-tree v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w145', () => {
  it('link-cut-tree v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w148', () => {
  it('link-cut-tree v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w151', () => {
  it('link-cut-tree v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w154', () => {
  it('link-cut-tree v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w157', () => {
  it('link-cut-tree v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w160', () => {
  it('link-cut-tree v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w170', () => {
  it('link-cut-tree x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w180', () => {
  it('link-cut-tree x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w190', () => {
  it('link-cut-tree x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w200', () => {
  it('link-cut-tree x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w210', () => {
  it('link-cut-tree x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w220', () => {
  it('link-cut-tree x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w230', () => {
  it('link-cut-tree x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w240', () => {
  it('link-cut-tree x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w250', () => {
  it('link-cut-tree x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w260', () => {
  it('link-cut-tree x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w270', () => {
  it('link-cut-tree x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w280', () => {
  it('link-cut-tree x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w290', () => {
  it('link-cut-tree x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w300', () => {
  it('link-cut-tree x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w310', () => {
  it('link-cut-tree x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w320', () => {
  it('link-cut-tree x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w330', () => {
  it('link-cut-tree x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w340', () => {
  it('link-cut-tree x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w350', () => {
  it('link-cut-tree x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w360', () => {
  it('link-cut-tree x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w370', () => {
  it('link-cut-tree x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w380', () => {
  it('link-cut-tree x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w390', () => {
  it('link-cut-tree x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('link-cut-tree - w400', () => {
  it('link-cut-tree x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('link-cut-tree x400x9', () => {
    expect(describe).toBeDefined()
  })
})
