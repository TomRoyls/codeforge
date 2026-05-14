import { describe, it, expect, beforeEach } from 'vitest';
import { AliasMap2 } from '../src/core/alias-map-2/index.js';

describe('AliasMap2', () => {
    let map: AliasMap2<string>;

    beforeEach(() => {
        map = new AliasMap2<string>();
    });

    describe('constructor', () => {
        it('should create an empty map', () => {
            const newMap = new AliasMap2<string>();
            expect(newMap.size).toBe(0);
            expect(newMap.keys()).toEqual([]);
            expect(newMap.values()).toEqual([]);
        });
    });

    describe('set and get', () => {
        it('should set and get values', () => {
            map.set('key1', 'value1');
            expect(map.get('key1')).toBe('value1');
        });

        it('should return undefined for non-existent keys', () => {
            expect(map.get('nonexistent')).toBeUndefined();
        });

        it('should overwrite existing values', () => {
            map.set('key1', 'value1');
            map.set('key1', 'value2');
            expect(map.get('key1')).toBe('value2');
        });

        it('should get values through aliases', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            expect(map.get('alias1')).toBe('value1');
        });
    });

    describe('has', () => {
        it('should return true for existing keys', () => {
            map.set('key1', 'value1');
            expect(map.has('key1')).toBe(true);
        });

        it('should return false for non-existent keys', () => {
            expect(map.has('nonexistent')).toBe(false);
        });

        it('should return true for aliases pointing to existing keys', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            expect(map.has('alias1')).toBe(true);
        });

        it('should return false for aliases pointing to non-existent keys', () => {
            map.addAlias('alias1', 'nonexistent');
            expect(map.has('alias1')).toBe(false);
        });
    });

    describe('delete', () => {
        it('should delete existing keys', () => {
            map.set('key1', 'value1');
            expect(map.delete('key1')).toBe(true);
            expect(map.has('key1')).toBe(false);
        });

        it('should return false for non-existent keys', () => {
            expect(map.delete('nonexistent')).toBe(false);
        });

        it('should delete aliases', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            expect(map.delete('alias1')).toBe(true);
            expect(map.has('alias1')).toBe(false);
            expect(map.has('key1')).toBe(true);
        });

        it('should remove aliases when deleting their target key', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'key1');
            map.delete('key1');
            expect(map.getAliases('key1')).toEqual([]);
            expect(map.has('alias1')).toBe(false);
            expect(map.has('alias2')).toBe(false);
        });

        it('should work with alias chains', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'alias1');
            expect(map.delete('alias2')).toBe(true);
            expect(map.has('alias1')).toBe(true);
        });
    });

    describe('addAlias', () => {
        it('should add alias to existing key', () => {
            map.set('key1', 'value1');
            expect(map.addAlias('alias1', 'key1')).toBe(true);
            expect(map.get('alias1')).toBe('value1');
        });

        it('should return false when alias already exists as a key', () => {
            map.set('key1', 'value1');
            map.set('alias1', 'value2');
            expect(map.addAlias('alias1', 'key1')).toBe(false);
        });

        it('should return false when alias already exists as an alias', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            expect(map.addAlias('alias1', 'key1')).toBe(false);
        });

        it('should return false when target key does not exist', () => {
            expect(map.addAlias('alias1', 'nonexistent')).toBe(false);
        });

        it('should return false for self-alias', () => {
            map.set('key1', 'value1');
            expect(map.addAlias('key1', 'key1')).toBe(false);
        });

        it('should support alias chains', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'alias1');
            expect(map.get('alias2')).toBe('value1');
        });

        it('should handle alias to alias', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            expect(map.addAlias('alias2', 'alias1')).toBe(true);
            expect(map.get('alias2')).toBe('value1');
        });
    });

    describe('removeAlias', () => {
        it('should remove existing alias', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            expect(map.removeAlias('alias1')).toBe(true);
            expect(map.has('alias1')).toBe(false);
        });

        it('should return false for non-existent alias', () => {
            expect(map.removeAlias('nonexistent')).toBe(false);
        });

        it('should not affect target key when removing alias', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.removeAlias('alias1');
            expect(map.has('key1')).toBe(true);
            expect(map.get('key1')).toBe('value1');
        });
    });

    describe('getAliases', () => {
        it('should return empty array for key with no aliases', () => {
            map.set('key1', 'value1');
            expect(map.getAliases('key1')).toEqual([]);
        });

        it('should return all aliases for a key', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'key1');
            map.addAlias('alias3', 'key1');
            const aliases = map.getAliases('key1');
            expect(aliases).toContain('alias1');
            expect(aliases).toContain('alias2');
            expect(aliases).toContain('alias3');
            expect(aliases.length).toBe(3);
        });

        it('should return aliases for keys in a chain', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'alias1');
            expect(map.getAliases('alias1')).toContain('alias2');
        });

        it('should return empty array for non-existent key', () => {
            expect(map.getAliases('nonexistent')).toEqual([]);
        });
    });

    describe('resolve', () => {
        it('should return key if no alias exists', () => {
            map.set('key1', 'value1');
            expect(map.resolve('key1')).toBe('key1');
        });

        it('should resolve single alias', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            expect(map.resolve('alias1')).toBe('key1');
        });

        it('should resolve alias chains', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'alias1');
            map.addAlias('alias3', 'alias2');
            expect(map.resolve('alias3')).toBe('key1');
        });

        it('should handle circular aliases by returning last key', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'alias1');
            (map as any).aliases.set('key1', 'alias2');
            expect(map.resolve('key1')).toBe('key1');
        });

        it('should return input key if not found in map or aliases', () => {
            expect(map.resolve('nonexistent')).toBe('nonexistent');
        });
    });

    describe('size', () => {
        it('should return 0 for empty map', () => {
            expect(map.size).toBe(0);
        });

        it('should return count of keys (not aliases)', () => {
            map.set('key1', 'value1');
            map.set('key2', 'value2');
            map.set('key3', 'value3');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'key2');
            expect(map.size).toBe(3);
        });

        it('should update when keys are added', () => {
            expect(map.size).toBe(0);
            map.set('key1', 'value1');
            expect(map.size).toBe(1);
            map.set('key2', 'value2');
            expect(map.size).toBe(2);
        });

        it('should update when keys are deleted', () => {
            map.set('key1', 'value1');
            map.set('key2', 'value2');
            expect(map.size).toBe(2);
            map.delete('key1');
            expect(map.size).toBe(1);
        });

        it('should update to 0 after clear', () => {
            map.set('key1', 'value1');
            map.set('key2', 'value2');
            map.clear();
            expect(map.size).toBe(0);
        });
    });

    describe('clear', () => {
        it('should clear all keys and values', () => {
            map.set('key1', 'value1');
            map.set('key2', 'value2');
            map.clear();
            expect(map.size).toBe(0);
            expect(map.keys()).toEqual([]);
            expect(map.values()).toEqual([]);
        });

        it('should clear all aliases', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'key1');
            map.clear();
            expect(map.get('alias1')).toBeUndefined();
            expect(map.get('alias2')).toBeUndefined();
        });

        it('should work on empty map', () => {
            expect(() => map.clear()).not.toThrow();
            expect(map.size).toBe(0);
        });
    });

    describe('keys', () => {
        it('should return empty array for empty map', () => {
            expect(map.keys()).toEqual([]);
        });

        it('should return all keys', () => {
            map.set('key1', 'value1');
            map.set('key2', 'value2');
            map.set('key3', 'value3');
            const keys = map.keys();
            expect(keys).toContain('key1');
            expect(keys).toContain('key2');
            expect(keys).toContain('key3');
            expect(keys.length).toBe(3);
        });

        it('should not include aliases', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'key1');
            const keys = map.keys();
            expect(keys).toContain('key1');
            expect(keys).not.toContain('alias1');
            expect(keys).not.toContain('alias2');
            expect(keys.length).toBe(1);
        });
    });

    describe('values', () => {
        it('should return empty array for empty map', () => {
            expect(map.values()).toEqual([]);
        });

        it('should return all values', () => {
            map.set('key1', 'value1');
            map.set('key2', 'value2');
            map.set('key3', 'value3');
            const values = map.values();
            expect(values).toContain('value1');
            expect(values).toContain('value2');
            expect(values).toContain('value3');
            expect(values.length).toBe(3);
        });
    });

    describe('entries', () => {
        it('should return empty array for empty map', () => {
            expect(map.entries()).toEqual([]);
        });

        it('should return all key-value pairs', () => {
            map.set('key1', 'value1');
            map.set('key2', 'value2');
            map.set('key3', 'value3');
            const entries = map.entries();
            expect(entries.length).toBe(3);
            expect(entries).toContainEqual(['key1', 'value1']);
            expect(entries).toContainEqual(['key2', 'value2']);
            expect(entries).toContainEqual(['key3', 'value3']);
        });

        it('should not include alias entries', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            const entries = map.entries();
            expect(entries.length).toBe(1);
            expect(entries).toContainEqual(['key1', 'value1']);
        });
    });

    describe('edge cases', () => {
        it('should handle alias to non-existent key gracefully', () => {
            map.set('key1', 'value1');
            expect(map.addAlias('alias1', 'nonexistent')).toBe(false);
            expect(map.get('alias1')).toBeUndefined();
        });

        it('should detect and handle circular aliases', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'alias1');
            (map as any).aliases.set('key1', 'alias2');
            expect(map.resolve('key1')).toBe('key1');
            expect(map.resolve('alias1')).toBe('key1');
            expect(map.resolve('alias2')).toBe('key1');
        });

        it('should prevent self-alias', () => {
            map.set('key1', 'value1');
            expect(map.addAlias('key1', 'key1')).toBe(false);
            expect(map.get('key1')).toBe('value1');
        });

        it('should handle multiple aliases to same key', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'key1');
            map.addAlias('alias3', 'key1');
            expect(map.get('alias1')).toBe('value1');
            expect(map.get('alias2')).toBe('value1');
            expect(map.get('alias3')).toBe('value1');
            expect(map.getAliases('key1').length).toBe(3);
        });

        it('should handle complex alias chains', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'alias1');
            map.addAlias('alias3', 'alias2');
            map.addAlias('alias4', 'alias3');
            expect(map.get('alias4')).toBe('value1');
            expect(map.resolve('alias4')).toBe('key1');
        });

        it('should work with different value types', () => {
            const numberMap = new AliasMap2<number>();
            numberMap.set('key1', 42);
            expect(numberMap.get('key1')).toBe(42);

            const objectMap = new AliasMap2<{ value: number }>();
            objectMap.set('key1', { value: 42 });
            expect(objectMap.get('key1')).toEqual({ value: 42 });
        });

        it('should handle deleting keys with chained aliases', () => {
            map.set('key1', 'value1');
            map.addAlias('alias1', 'key1');
            map.addAlias('alias2', 'alias1');
            map.delete('alias1');
            expect(map.has('key1')).toBe(true);
            expect(map.has('alias2')).toBe(false);
        });
    });
});
