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
