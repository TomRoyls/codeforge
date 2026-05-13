function defaultCompare(a, b) {
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
}
function binarySearchPile(piles, value, compare) {
    if (piles.length === 0)
        return 0;
    let left = 0;
    let right = piles.length;
    while (left < right) {
        const mid = (left + right) >>> 1;
        const top = piles[mid][piles[mid].length - 1];
        if (compare(top, value) < 0) {
            left = mid + 1;
        }
        else {
            right = mid;
        }
    }
    return left;
}
function buildPiles(arr, compare) {
    const piles = [];
    const nodes = [];
    for (const value of arr) {
        const pileIndex = binarySearchPile(piles, value, compare);
        if (pileIndex === piles.length) {
            piles.push([value]);
        }
        else {
            piles[pileIndex].push(value);
        }
        const prevIndex = pileIndex > 0 ? nodes.length - 1 : -1;
        const prev = prevIndex >= 0 ? nodes[prevIndex] : null;
        nodes.push({
            value,
            prev,
            pileIndex,
        });
    }
    return { piles, nodes };
}
function extractLIS(nodes) {
    if (nodes.length === 0)
        return [];
    const n = nodes.length;
    const lengths = new Array(n).fill(1);
    const prev = new Array(n).fill(-1);
    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            if (nodes[j].pileIndex < nodes[i].pileIndex && lengths[j] + 1 > lengths[i]) {
                lengths[i] = lengths[j] + 1;
                prev[i] = j;
            }
        }
    }
    let maxIndex = 0;
    for (let i = 1; i < n; i++) {
        if (lengths[i] > lengths[maxIndex]) {
            maxIndex = i;
        }
    }
    const lis = [];
    let current = maxIndex;
    while (current !== -1) {
        lis.unshift(nodes[current].value);
        current = prev[current];
    }
    return lis;
}
function mergePiles(piles, compare) {
    if (piles.length === 0)
        return [];
    if (piles.length === 1)
        return [...piles[0]];
    const result = [];
    const indices = new Array(piles.length).fill(0);
    const totalElements = piles.reduce((sum, pile) => sum + pile.length, 0);
    for (let count = 0; count < totalElements; count++) {
        let minValue = null;
        let minPileIndex = -1;
        for (let i = 0; i < piles.length; i++) {
            const idx = indices[i];
            const pile = piles[i];
            if (idx < pile.length) {
                const value = pile[idx];
                if (minValue === null || compare(value, minValue) < 0) {
                    minValue = value;
                    minPileIndex = i;
                }
            }
        }
        if (minPileIndex === -1)
            break;
        result.push(minValue);
        indices[minPileIndex]++;
    }
    return result;
}
export class PatienceSort3 {
    compare;
    currentPiles = [];
    constructor(compare) {
        this.compare = compare ?? (defaultCompare);
    }
    sort(arr) {
        if (arr.length <= 1)
            return [...arr];
        const { piles } = buildPiles(arr, this.compare);
        this.currentPiles = piles;
        return mergePiles(piles, this.compare);
    }
    sortDescending(arr) {
        if (arr.length <= 1)
            return [...arr];
        const descendingCompare = (a, b) => this.compare(b, a);
        const { piles } = buildPiles(arr, descendingCompare);
        this.currentPiles = piles;
        return mergePiles(piles, descendingCompare);
    }
    isSorted(arr) {
        for (let i = 1; i < arr.length; i++) {
            if (this.compare(arr[i - 1], arr[i]) > 0) {
                return false;
            }
        }
        return true;
    }
    getPiles() {
        return this.currentPiles.map((pile) => [...pile]);
    }
    getLongestIncreasingSubsequence(arr) {
        if (arr.length === 0)
            return [];
        const { nodes } = buildPiles(arr, this.compare);
        return extractLIS(nodes);
    }
    getTimeComplexity() {
        return 'O(n log n)';
    }
    getSpaceComplexity() {
        return 'O(n)';
    }
}
