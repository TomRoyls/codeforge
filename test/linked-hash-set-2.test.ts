import { describe, it, expect } from 'vitest';
import { LinkedHashSet } from '../src/core/linked-hash-set-2';

describe('LinkedHashSet', () => {
  describe('empty set', () => {
    it('should be empty when constructed', () => {
      const set = new LinkedHashSet<number>();
      expect(set.isEmpty()).toBe(true);
      expect(set.size()).toBe(0);
      expect(set.values()).toEqual([]);
      expect(set.first()).toBeUndefined();
      expect(set.last()).toBeUndefined();
    });
  });

  describe('add and has', () => {
    it('should add values and check presence', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);

      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(true);
      expect(set.has(3)).toBe(true);
      expect(set.has(4)).toBe(false);
      expect(set.size()).toBe(3);
    });

    it('should not allow duplicates', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(1);
      set.add(3);
      set.add(2);

      expect(set.size()).toBe(3);
      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(true);
      expect(set.has(3)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete existing values', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);

      expect(set.delete(2)).toBe(true);
      expect(set.has(2)).toBe(false);
      expect(set.size()).toBe(2);
      expect(set.has(1)).toBe(true);
      expect(set.has(3)).toBe(true);
    });

    it('should return false for non-existent values', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);

      expect(set.delete(3)).toBe(false);
      expect(set.size()).toBe(2);
    });

    it('should delete head', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);

      expect(set.delete(1)).toBe(true);
      expect(set.first()).toBe(2);
      expect(set.size()).toBe(2);
    });

    it('should delete tail', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);

      expect(set.delete(3)).toBe(true);
      expect(set.last()).toBe(2);
      expect(set.size()).toBe(2);
    });

    it('should delete middle node', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);

      expect(set.delete(2)).toBe(true);
      expect(set.values()).toEqual([1, 3, 4]);
      expect(set.delete(3)).toBe(true);
      expect(set.values()).toEqual([1, 4]);
    });
  });

  describe('insertion order', () => {
    it('should maintain insertion order', () => {
      const set = new LinkedHashSet<number>();
      set.add(3);
      set.add(1);
      set.add(4);
      set.add(1);
      set.add(2);

      expect(set.values()).toEqual([3, 1, 4, 2]);
    });

    it('should maintain order after deletions', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      set.add(5);

      set.delete(2);
      set.delete(4);

      expect(set.values()).toEqual([1, 3, 5]);
    });

    it('should maintain order after adding after delete', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);

      set.delete(2);
      set.add(4);

      expect(set.values()).toEqual([1, 3, 4]);
    });
  });

  describe('first and last', () => {
    it('should return first and last elements', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);

      expect(set.first()).toBe(1);
      expect(set.last()).toBe(3);
    });

    it('should update first after head deletion', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);

      set.delete(1);
      expect(set.first()).toBe(2);
    });

    it('should update last after tail deletion', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);

      set.delete(3);
      expect(set.last()).toBe(2);
    });

    it('should handle single element', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);

      expect(set.first()).toBe(1);
      expect(set.last()).toBe(1);
    });
  });

  describe('forEach', () => {
    it('should iterate in insertion order', () => {
      const set = new LinkedHashSet<number>();
      set.add(3);
      set.add(1);
      set.add(4);
      set.add(2);

      const result: number[] = [];
      set.forEach((value) => {
        result.push(value);
      });

      expect(result).toEqual([3, 1, 4, 2]);
    });

    it('should iterate over empty set', () => {
      const set = new LinkedHashSet<number>();
      const result: number[] = [];
      set.forEach((value) => {
        result.push(value);
      });

      expect(result).toEqual([]);
    });
  });

  describe('toArray', () => {
    it('should return array in insertion order', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);

      expect(set.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);

      set.clear();

      expect(set.isEmpty()).toBe(true);
      expect(set.size()).toBe(0);
      expect(set.values()).toEqual([]);
      expect(set.first()).toBeUndefined();
      expect(set.last()).toBeUndefined();
      expect(set.has(1)).toBe(false);
      expect(set.has(2)).toBe(false);
      expect(set.has(3)).toBe(false);
    });

    it('should work after clearing and adding again', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);

      set.clear();
      set.add(3);
      set.add(4);

      expect(set.size()).toBe(2);
      expect(set.values()).toEqual([3, 4]);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      const set = new LinkedHashSet<number>();

      expect(set.size()).toBe(0);

      set.add(1);
      expect(set.size()).toBe(1);

      set.add(2);
      expect(set.size()).toBe(2);

      set.add(3);
      expect(set.size()).toBe(3);

      set.delete(2);
      expect(set.size()).toBe(2);

      set.clear();
      expect(set.size()).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return correct empty state', () => {
      const set = new LinkedHashSet<number>();

      expect(set.isEmpty()).toBe(true);

      set.add(1);
      expect(set.isEmpty()).toBe(false);

      set.delete(1);
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('large datasets', () => {
    it('should handle many elements', () => {
      const set = new LinkedHashSet<number>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        set.add(i);
      }

      expect(set.size()).toBe(count);

      for (let i = 0; i < count; i++) {
        expect(set.has(i)).toBe(true);
      }

      const values = set.values();
      expect(values.length).toBe(count);
      expect(values[0]).toBe(0);
      expect(values[count - 1]).toBe(count - 1);
    });

    it('should handle deletions in large set', () => {
      const set = new LinkedHashSet<number>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        set.add(i);
      }

      for (let i = 0; i < count; i += 2) {
        set.delete(i);
      }

      expect(set.size()).toBe(count / 2);

      const values = set.values();
      expect(values).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87, 89, 91, 93, 95, 97, 99, 101, 103, 105, 107, 109, 111, 113, 115, 117, 119, 121, 123, 125, 127, 129, 131, 133, 135, 137, 139, 141, 143, 145, 147, 149, 151, 153, 155, 157, 159, 161, 163, 165, 167, 169, 171, 173, 175, 177, 179, 181, 183, 185, 187, 189, 191, 193, 195, 197, 199, 201, 203, 205, 207, 209, 211, 213, 215, 217, 219, 221, 223, 225, 227, 229, 231, 233, 235, 237, 239, 241, 243, 245, 247, 249, 251, 253, 255, 257, 259, 261, 263, 265, 267, 269, 271, 273, 275, 277, 279, 281, 283, 285, 287, 289, 291, 293, 295, 297, 299, 301, 303, 305, 307, 309, 311, 313, 315, 317, 319, 321, 323, 325, 327, 329, 331, 333, 335, 337, 339, 341, 343, 345, 347, 349, 351, 353, 355, 357, 359, 361, 363, 365, 367, 369, 371, 373, 375, 377, 379, 381, 383, 385, 387, 389, 391, 393, 395, 397, 399, 401, 403, 405, 407, 409, 411, 413, 415, 417, 419, 421, 423, 425, 427, 429, 431, 433, 435, 437, 439, 441, 443, 445, 447, 449, 451, 453, 455, 457, 459, 461, 463, 465, 467, 469, 471, 473, 475, 477, 479, 481, 483, 485, 487, 489, 491, 493, 495, 497, 499, 501, 503, 505, 507, 509, 511, 513, 515, 517, 519, 521, 523, 525, 527, 529, 531, 533, 535, 537, 539, 541, 543, 545, 547, 549, 551, 553, 555, 557, 559, 561, 563, 565, 567, 569, 571, 573, 575, 577, 579, 581, 583, 585, 587, 589, 591, 593, 595, 597, 599, 601, 603, 605, 607, 609, 611, 613, 615, 617, 619, 621, 623, 625, 627, 629, 631, 633, 635, 637, 639, 641, 643, 645, 647, 649, 651, 653, 655, 657, 659, 661, 663, 665, 667, 669, 671, 673, 675, 677, 679, 681, 683, 685, 687, 689, 691, 693, 695, 697, 699, 701, 703, 705, 707, 709, 711, 713, 715, 717, 719, 721, 723, 725, 727, 729, 731, 733, 735, 737, 739, 741, 743, 745, 747, 749, 751, 753, 755, 757, 759, 761, 763, 765, 767, 769, 771, 773, 775, 777, 779, 781, 783, 785, 787, 789, 791, 793, 795, 797, 799, 801, 803, 805, 807, 809, 811, 813, 815, 817, 819, 821, 823, 825, 827, 829, 831, 833, 835, 837, 839, 841, 843, 845, 847, 849, 851, 853, 855, 857, 859, 861, 863, 865, 867, 869, 871, 873, 875, 877, 879, 881, 883, 885, 887, 889, 891, 893, 895, 897, 899, 901, 903, 905, 907, 909, 911, 913, 915, 917, 919, 921, 923, 925, 927, 929, 931, 933, 935, 937, 939, 941, 943, 945, 947, 949, 951, 953, 955, 957, 959, 961, 963, 965, 967, 969, 971, 973, 975, 977, 979, 981, 983, 985, 987, 989, 991, 993, 995, 997, 999]);
    });
  });

  describe('string values', () => {
    it('should work with strings', () => {
      const set = new LinkedHashSet<string>();
      set.add('apple');
      set.add('banana');
      set.add('cherry');

      expect(set.has('apple')).toBe(true);
      expect(set.has('banana')).toBe(true);
      expect(set.has('cherry')).toBe(true);
      expect(set.values()).toEqual(['apple', 'banana', 'cherry']);
    });
  });

  describe('object values', () => {
    it('should work with objects (same reference)', () => {
      const set = new LinkedHashSet<object>();
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const obj3 = { id: 3 };

      set.add(obj1);
      set.add(obj2);
      set.add(obj3);

      expect(set.has(obj1)).toBe(true);
      expect(set.has(obj2)).toBe(true);
      expect(set.has(obj3)).toBe(true);
      expect(set.size()).toBe(3);
    });

    it('should handle first and last', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.first()).toBe(1);
      expect(set.last()).toBe(3);
    });

    it('should handle forEach iteration order', () => {
      const set = new LinkedHashSet<number>();
      set.add(10);
      set.add(20);
      set.add(30);
      const items: number[] = [];
      set.forEach(v => items.push(v));
      expect(items).toEqual([10, 20, 30]);
    });

    it('should handle clear then re-add', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.clear();
      expect(set.isEmpty()).toBe(true);
      set.add(3);
      expect(set.size()).toBe(1);
      expect(set.first()).toBe(3);
    });

    it('should handle delete first and last', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(1);
      expect(set.first()).toBe(2);
      set.delete(3);
      expect(set.last()).toBe(2);
    });

    it('should handle has on missing element', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      expect(set.has(1)).toBe(true);
      expect(set.has(99)).toBe(false);
    });

    it('should handle toArray', () => {
      const set = new LinkedHashSet<number>();
      set.add(10);
      set.add(20);
      set.add(30);
      expect(set.toArray()).toEqual([10, 20, 30]);
    });

    it('should handle first and last', () => {
      const set = new LinkedHashSet<number>();
      set.add(10);
      set.add(20);
      set.add(30);
      expect(set.first()).toBe(10);
      expect(set.last()).toBe(30);
    });

    it('should handle clear', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.clear();
      expect(set.size()).toBe(0);
    });

    it('should handle values', () => {
      const set = new LinkedHashSet<number>();
      set.add(10);
      set.add(20);
      set.add(30);
      expect(set.values()).toEqual([10, 20, 30]);
    });

    it('should handle contains', () => {
      const set = new LinkedHashSet<number>();
      set.add(5);
      expect(set.has(5)).toBe(true);
      expect(set.has(99)).toBe(false);
    });

    it('should handle delete', () => {
      const set = new LinkedHashSet<number>();
      set.add(10);
      set.add(20);
      expect(set.delete(10)).toBe(true);
      expect(set.has(10)).toBe(false);
    });

    it('should handle isEmpty', () => {
      const set = new LinkedHashSet<number>();
      expect(set.isEmpty()).toBe(true);
      set.add(1);
      expect(set.isEmpty()).toBe(false);
    });

    it('should handle toArray', () => {
      const set = new LinkedHashSet<number>();
      set.add(10);
      set.add(20);
      set.add(30);
      const arr = set.toArray();
      expect(arr.length).toBe(3);
      expect(arr).toContain(10);
    });

    it('should handle forEach', () => {
      const set = new LinkedHashSet<number>();
      set.add(10);
      set.add(20);
      set.add(30);
      const values: number[] = [];
      set.forEach((v) => values.push(v));
      expect(values.length).toBe(3);
    });

    it('should handle delete', () => {
      const set = new LinkedHashSet<number>();
      set.add(10);
      set.add(20);
      set.add(30);
      expect(set.delete(20)).toBe(true);
      expect(set.has(20)).toBe(false);
      expect(set.size()).toBe(2);
    });
  });
});
