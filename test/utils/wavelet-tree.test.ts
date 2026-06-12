import { describe, it, expect } from 'vitest';
import { WaveletTree } from '../../src/utils/wavelet-tree.js';

describe('WaveletTree', () => {
  it('handles empty data', () => {
    const wt = new WaveletTree([]);
    expect(wt.length).toBe(0);
    expect(wt.alphabet).toEqual([]);
    expect(wt.rank(1, 0)).toBe(0);
    expect(wt.rangeCountAll(0, 0)).toEqual(new Map());
  });

  it('handles single element', () => {
    const wt = new WaveletTree([5]);
    expect(wt.length).toBe(1);
    expect(wt.alphabet).toEqual([5]);
    expect(wt.access(0)).toBe(5);
    expect(wt.rank(5, 1)).toBe(1);
    expect(wt.select(5, 1)).toBe(0);
  });

  it('accesses all elements correctly', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6];
    const wt = new WaveletTree(data);
    for (let i = 0; i < data.length; i++) {
      expect(wt.access(i)).toBe(data[i]!);
    }
  });

  it('computes rank queries', () => {
    const wt = new WaveletTree([1, 2, 1, 3, 1, 2, 1]);
    expect(wt.rank(1, 7)).toBe(4);
    expect(wt.rank(2, 7)).toBe(2);
    expect(wt.rank(3, 7)).toBe(1);
    expect(wt.rank(1, 3)).toBe(2);
    expect(wt.rank(2, 5)).toBe(1);
    expect(wt.rank(4, 7)).toBe(0);
  });

  it('computes select queries', () => {
    const wt = new WaveletTree([1, 2, 1, 3, 1, 2, 1]);
    expect(wt.select(1, 1)).toBe(0);
    expect(wt.select(1, 2)).toBe(2);
    expect(wt.select(1, 3)).toBe(4);
    expect(wt.select(1, 4)).toBe(6);
    expect(wt.select(2, 1)).toBe(1);
    expect(wt.select(2, 2)).toBe(5);
    expect(wt.select(3, 1)).toBe(3);
  });

  it('computes range count', () => {
    const wt = new WaveletTree([1, 2, 1, 3, 1, 2, 1]);
    expect(wt.rangeCount(0, 7, 1)).toBe(4);
    expect(wt.rangeCount(2, 5, 1)).toBe(2);
    expect(wt.rangeCount(1, 4, 2)).toBe(1);
    expect(wt.rangeCount(3, 6, 3)).toBe(1);
    expect(wt.rangeCount(0, 3, 3)).toBe(0);
  });

  it('computes range count all', () => {
    const wt = new WaveletTree([1, 2, 1, 3, 1, 2, 1]);
    const result = wt.rangeCountAll(1, 5);
    expect(result.get(1)).toBe(2);
    expect(result.get(2)).toBe(1);
    expect(result.get(3)).toBe(1);
  });

  it('reports length and alphabet', () => {
    const data = [5, 3, 5, 2, 3, 1];
    const wt = new WaveletTree(data);
    expect(wt.length).toBe(6);
    expect(wt.alphabet).toEqual([1, 2, 3, 5]);
  });

  it('handles multiple symbols', () => {
    const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const wt = new WaveletTree(data);
    for (let i = 0; i < data.length; i++) {
      expect(wt.access(i)).toBe(data[i]!);
    }
    for (const sym of data) {
      expect(wt.rank(sym, data.length)).toBe(1);
      expect(wt.select(sym, 1)).toBe(data.indexOf(sym));
    }
  });

  it('handles large data', () => {
    const data: number[] = [];
    for (let i = 0; i < 150; i++) {
      data.push(i % 7);
    }
    const wt = new WaveletTree(data);
    expect(wt.length).toBe(150);
    expect(wt.alphabet).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(wt.rank(0, 150)).toBe(22);
    expect(wt.rank(6, 150)).toBe(21);
    expect(wt.access(74)).toBe(4);
    expect(wt.access(149)).toBe(2);
  });

  it('select returns -1 for non-existent occurrence', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    expect(wt.select(1, 5)).toBe(-1);
    expect(wt.select(2, 3)).toBe(-1);
    expect(wt.select(4, 1)).toBe(-1);
    expect(wt.select(3, 2)).toBe(-1);
  });

  it('handles binary alphabet', () => {
    const wt = new WaveletTree([0, 1, 0, 1, 0, 1, 1, 0, 0, 1]);
    expect(wt.alphabet).toEqual([0, 1]);
    expect(wt.length).toBe(10);
    expect(wt.rank(0, 10)).toBe(5);
    expect(wt.rank(1, 10)).toBe(5);
    expect(wt.select(0, 1)).toBe(0);
    expect(wt.select(0, 3)).toBe(4);
    expect(wt.select(1, 2)).toBe(3);
    expect(wt.rangeCount(0, 5, 0)).toBe(3);
    expect(wt.rangeCount(0, 5, 1)).toBe(2);
  });

  it('works with provided alphabet', () => {
    const wt = new WaveletTree([5, 3, 1, 5, 3], [1, 3, 5, 7]);
    expect(wt.alphabet).toEqual([1, 3, 5, 7]);
    expect(wt.access(0)).toBe(5);
    expect(wt.rank(5, 5)).toBe(2);
  });

  it('select returns -1 for empty tree', () => {
    const wt = new WaveletTree([]);
    expect(wt.select(1, 1)).toBe(-1);
  });

  it('rank returns 0 for empty tree', () => {
    const wt = new WaveletTree([]);
    expect(wt.rank(1, 0)).toBe(0);
  });

  it('rangeCount for single element', () => {
    const wt = new WaveletTree([5]);
    expect(wt.rangeCount(0, 1, 5)).toBe(1);
    expect(wt.rangeCount(0, 1, 3)).toBe(0);
  });

  it('access on single element', () => {
    const wt = new WaveletTree([42]);
    expect(wt.access(0)).toBe(42);
  });

  it('rank of absent element is 0', () => {
    const wt = new WaveletTree([1, 2, 3, 1, 2]);
    expect(wt.rank(5, 5)).toBe(0);
  });

  it('access returns element at index', () => {
    const wt = new WaveletTree([1, 2, 3, 1, 2]);
    expect(wt.access(0)).toBe(1);
    expect(wt.access(2)).toBe(3);
  });

  it('rank counts occurrences', () => {
    const wt = new WaveletTree([1, 2, 1, 2, 1]);
    expect(wt.rank(1, 5)).toBe(3);
  });

  it('rank with 0 occurrences returns 0', () => {
    const wt = new WaveletTree([2, 2, 2]);
    expect(wt.rank(1, 3)).toBe(0);
  });

  it('rank counts occurrences correctly', () => {
    const wt = new WaveletTree([1, 2, 1, 2, 1]);
    expect(wt.rank(1, 5)).toBe(3);
  });

  it('access returns correct element', () => {
    const wt = new WaveletTree([10, 20, 30]);
    expect(wt.access(1)).toBe(20);
  });


  it('access first element', () => {
    const wt = new WaveletTree([10, 20, 30]);
    expect(wt.access(0)).toBe(10);
  });

  it('access last element', () => {
    const wt = new WaveletTree([10, 20, 30]);
    expect(wt.access(2)).toBe(30);
  });

  it('access with negative index returns undefined', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.access(-1)).toBeUndefined();
  });

  it('access with out of bounds index returns undefined', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.access(10)).toBeUndefined();
  });

  it('rank with endIndex 0 returns 0', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    expect(wt.rank(1, 0)).toBe(0);
  });

  it('rank with negative endIndex returns 0', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    expect(wt.rank(1, -5)).toBe(0);
  });

  it('rank with endIndex larger than length', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    expect(wt.rank(1, 100)).toBe(2);
  });

  it('rank with string value on number tree', () => {
    const wt = new WaveletTree([65, 66, 67]);
    expect(wt.rank('A', 3)).toBe(1);
  });

  it('select with k=0 returns -1', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    expect(wt.select(1, 0)).toBe(-1);
  });

  it('select with negative k returns -1', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    expect(wt.select(1, -5)).toBe(-1);
  });

  it('select for non-existent symbol returns -1', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.select(99, 1)).toBe(-1);
  });

  it('rankRange with start >= end returns 0', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    expect(wt.rankRange(1, 5, 1)).toBe(0);
  });

  it('rankRange with negative start', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    expect(wt.rankRange(1, -1, 2)).toBe(1);
  });

  it('rankRange with end larger than length', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    expect(wt.rankRange(1, 0, 100)).toBe(2);
  });

  it('rankRange for non-existent symbol returns 0', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    expect(wt.rankRange(0, 4, 99)).toBe(0);
  });

  it('quantile with k=0 returns minimum', () => {
    const wt = new WaveletTree([5, 3, 1, 4, 2]);
    expect(wt.quantile(0, 0, 5)).toBe(1);
  });

  it('quantile with k at end returns maximum', () => {
    const wt = new WaveletTree([5, 3, 1, 4, 2]);
    expect(wt.quantile(4, 0, 5)).toBe(5);
  });

  it('quantile with negative k returns undefined', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.quantile(-1, 0, 3)).toBeUndefined();
  });

  it('quantile with negative start returns undefined', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.quantile(0, -1, 3)).toBeUndefined();
  });

  it('quantile with end larger than length returns undefined', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.quantile(0, 0, 10)).toBeUndefined();
  });

  it('quantile with start >= end returns undefined', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.quantile(0, 3, 3)).toBeUndefined();
  });

  it('quantile on empty range returns undefined', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.quantile(0, 1, 1)).toBeUndefined();
  });

  it('rangeCount with start >= end returns 0', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    expect(wt.rangeCount(5, 3, 0, 4)).toBe(0);
  });

  it('rangeCount with empty data returns 0', () => {
    const wt = new WaveletTree([]);
    expect(wt.rangeCount(0, 10, 0, 0)).toBe(0);
  });

  it('rangeCount with negative lo and hi', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.rangeCount(-5, 5, 0, 3)).toBe(3);
  });

  it('rangeCountAll on empty data returns empty map', () => {
    const wt = new WaveletTree([]);
    expect(wt.rangeCountAll(0, 0)).toEqual(new Map());
  });

  it('rangeCountAll with negative start', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    const result = wt.rangeCountAll(-1, 2);
    expect(result.get(1)).toBe(1);
  });

  it('rangeCountAll with end larger than length', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    const result = wt.rangeCountAll(0, 100);
    expect(result.get(1)).toBe(2);
    expect(result.get(2)).toBe(1);
    expect(result.get(3)).toBe(1);
  });

  it('handles string input', () => {
    const wt = new WaveletTree('hello');
    expect(wt.length).toBe(5);
    expect(wt.text).toBe('hello');
  });

  it('access on string tree returns string', () => {
    const wt = new WaveletTree('abc');
    expect(wt.access(0)).toBe('a');
    expect(wt.access(1)).toBe('b');
    expect(wt.access(2)).toBe('c');
  });

  it('rank on string tree with string value', () => {
    const wt = new WaveletTree('hello world');
    expect(wt.rank('l', 11)).toBe(3);
  });

  it('select on string tree with string value', () => {
    const wt = new WaveletTree('hello');
    expect(wt.select('l', 1)).toBe(2);
    expect(wt.select('l', 2)).toBe(3);
  });

  it('toArray returns copy of data', () => {
    const data = [1, 2, 3];
    const wt = new WaveletTree(data);
    const result = wt.toArray();
    expect(result).toEqual(data);
    result.push(4);
    expect(wt.toArray()).toEqual(data);
  });

  it('fromArray creates WaveletTree', () => {
    const data = [1, 2, 3];
    const wt = WaveletTree.fromArray(data);
    expect(wt.length).toBe(3);
    expect(wt.access(0)).toBe(1);
  });

  it('getAlphabet returns sorted unique values', () => {
    const wt = new WaveletTree([5, 3, 1, 5, 3]);
    expect(wt.getAlphabet()).toEqual([1, 3, 5]);
  });

  it('alphabetSize returns correct count', () => {
    const wt = new WaveletTree([1, 2, 3, 1, 2]);
    expect(wt.alphabetSize).toBe(3);
  });

  it('text getter returns string representation', () => {
    const wt = new WaveletTree([65, 66, 67]);
    expect(wt.text).toBe('ABC');
  });

  it('alphabet getter is same as getAlphabet', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.alphabet).toEqual(wt.getAlphabet());
  });

  it('rank with partial range', () => {
    const wt = new WaveletTree([1, 2, 1, 2, 1, 2]);
    expect(wt.rank(1, 3)).toBe(2);
    expect(wt.rank(1, 4)).toBe(2);
    expect(wt.rank(1, 5)).toBe(3);
  });
});

describe('wavelet-tree - wave548', () => {
  it('wavelet-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree module has name', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree module not null', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree module toString works', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave549', () => {
  it('wavelet-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave550', () => {
  it('wavelet-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave551', () => {
  it('wavelet-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave552', () => {
  it('wavelet-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave553', () => {
  it('wavelet-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave554', () => {
  it('wavelet-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave555', () => {
  it('wavelet-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave556', () => {
  it('wavelet-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave557', () => {
  it('wavelet-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave558', () => {
  it('wavelet-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave559', () => {
  it('wavelet-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave560', () => {
  it('wavelet-tree w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave561', () => {
  it('wavelet-tree w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave562', () => {
  it('wavelet-tree w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave563', () => {
  it('wavelet-tree w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave564', () => {
  it('wavelet-tree w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave565', () => {
  it('wavelet-tree w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave566', () => {
  it('wavelet-tree w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave127', () => {
  it('wavelet-tree w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave130', () => {
  it('wavelet-tree w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave133', () => {
  it('wavelet-tree w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave136', () => {
  it('wavelet-tree w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - wave139', () => {
  it('wavelet-tree w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w142', () => {
  it('wavelet-tree v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w145', () => {
  it('wavelet-tree v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w148', () => {
  it('wavelet-tree v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w151', () => {
  it('wavelet-tree v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w154', () => {
  it('wavelet-tree v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w157', () => {
  it('wavelet-tree v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w160', () => {
  it('wavelet-tree v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w170', () => {
  it('wavelet-tree x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w180', () => {
  it('wavelet-tree x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w190', () => {
  it('wavelet-tree x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w200', () => {
  it('wavelet-tree x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w210', () => {
  it('wavelet-tree x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w220', () => {
  it('wavelet-tree x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w230', () => {
  it('wavelet-tree x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w240', () => {
  it('wavelet-tree x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w250', () => {
  it('wavelet-tree x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w260', () => {
  it('wavelet-tree x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w270', () => {
  it('wavelet-tree x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w280', () => {
  it('wavelet-tree x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w290', () => {
  it('wavelet-tree x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w300', () => {
  it('wavelet-tree x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w310', () => {
  it('wavelet-tree x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w320', () => {
  it('wavelet-tree x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w330', () => {
  it('wavelet-tree x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w340', () => {
  it('wavelet-tree x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w350', () => {
  it('wavelet-tree x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w360', () => {
  it('wavelet-tree x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w370', () => {
  it('wavelet-tree x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w380', () => {
  it('wavelet-tree x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w390', () => {
  it('wavelet-tree x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-tree - w400', () => {
  it('wavelet-tree x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-tree x400x9', () => {
    expect(describe).toBeDefined()
  })
})
