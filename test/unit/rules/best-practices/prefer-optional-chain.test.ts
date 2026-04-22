/**
 * @fileoverview Tests for prefer-optional-chain rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferOptionalChain,
  preferOptionalChainRule,
} from '../../../../src/rules/best-practices/prefer-optional-chain.js'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('prefer-optional-chain rule', () => {
  describe('rule metadata', () => {
    it('should have correct name', () => {
      expect(preferOptionalChainRule.meta.name).toBe('prefer-optional-chain')
    })
    it('should have correct category', () => {
      expect(preferOptionalChainRule.meta.category).toBe('style')
    })
    it('should be fixable', () => {
      expect(preferOptionalChainRule.meta.fixable).toBe('code')
    })
    it('should have a description', () => {
      expect(preferOptionalChainRule.meta.description).toBeDefined()
    })
    it('should include optional chaining in description', () => {
      expect(preferOptionalChainRule.meta.description).toContain('optional chaining')
    })
    it('should not be recommended by default', () => {
      expect(preferOptionalChainRule.meta.recommended).toBe(false)
    })
    it('should have defaultOptions as empty object', () => {
      expect(preferOptionalChainRule.defaultOptions).toEqual({})
    })
    it('should export create function', () => {
      expect(typeof preferOptionalChainRule.create).toBe('function')
    })
    it('should have meta as an object', () => {
      expect(typeof preferOptionalChainRule.meta).toBe('object')
    })
    it('should have string name in meta', () => {
      expect(typeof preferOptionalChainRule.meta.name).toBe('string')
    })
  })

  describe('detecting explicit null checks with &&', () => {
    it('should detect obj && obj.foo pattern', () => {
      const sf = createSourceFile('const x = obj && obj.foo;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect obj && obj.foo && obj.foo.bar pattern', () => {
      const sf = createSourceFile('const x = obj && obj.foo && obj.foo.bar;')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should report correct ruleId', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)[0].ruleId).toBe('prefer-optional-chain')
    })
    it('should report info severity', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)[0].severity).toBe('info')
    })
    it('should include optional chaining in message', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)[0].message).toContain('optional chaining')
    })
    it('should provide suggestion with optional chain', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toContain('?.')
    })
    it('should detect data && data.value', () => {
      const sf = createSourceFile('const val = data && data.value;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect config && config.settings', () => {
      const sf = createSourceFile('const s = config && config.settings;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect item && item.name', () => {
      const sf = createSourceFile('const n = item && item.name;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect nested: obj.prop && obj.prop.nested', () => {
      const sf = createSourceFile('const x = obj.prop && obj.prop.nested;')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should detect in return statement', () => {
      const sf = createSourceFile('function f() { return obj && obj.foo; }')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in if condition', () => {
      const sf = createSourceFile('if (obj && obj.prop) { console.log(obj.prop); }')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should detect in ternary', () => {
      const sf = createSourceFile('const x = (obj && obj.prop) ? obj.prop : null;')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should detect in assignment', () => {
      const sf = createSourceFile('let x; x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in function argument', () => {
      const sf = createSourceFile('fn(obj && obj.prop);')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in array element', () => {
      const sf = createSourceFile('const arr = [obj && obj.prop];')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in object property', () => {
      const sf = createSourceFile('const o = { val: obj && obj.prop };')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in logical OR left', () => {
      const sf = createSourceFile('const x = (obj && obj.prop) || defaultVal;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in nullish coalescing left', () => {
      const sf = createSourceFile('const x = (obj && obj.prop) ?? defaultVal;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect user && user.name', () => {
      const sf = createSourceFile('const name = user && user.name;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect response && response.data', () => {
      const sf = createSourceFile('const data = response && response.data;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect window && window.location', () => {
      const sf = createSourceFile('const loc = window && window.location;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect error && error.message', () => {
      const sf = createSourceFile('const msg = error && error.message;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect props && props.onChange', () => {
      const sf = createSourceFile('const h = props && props.onChange;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect state && state.count', () => {
      const sf = createSourceFile('const c = state && state.count;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect result && result.value', () => {
      const sf = createSourceFile('const v = result && result.value;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect e && e.target', () => {
      const sf = createSourceFile('const t = e && e.target;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect arr && arr.length', () => {
      const sf = createSourceFile('const len = arr && arr.length;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect ctx && ctx.request', () => {
      const sf = createSourceFile('const r = ctx && ctx.request;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect node && node.firstChild', () => {
      const sf = createSourceFile('const child = node && node.firstChild;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect element && element.id', () => {
      const sf = createSourceFile('const id = element && element.id;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect req && req.params', () => {
      const sf = createSourceFile('const p = req && req.params;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect db && db.query', () => {
      const sf = createSourceFile('const q = db && db.query;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect cache && cache.get', () => {
      const sf = createSourceFile('const g = cache && cache.get;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect token && token.expires', () => {
      const sf = createSourceFile('const exp = token && token.expires;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect options && options.enabled', () => {
      const sf = createSourceFile('const en = options && options.enabled;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect params && params.id', () => {
      const sf = createSourceFile('const pid = params && params.id;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect query && query.search', () => {
      const sf = createSourceFile('const s = query && query.search;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect headers && headers.authorization', () => {
      const sf = createSourceFile('const auth = headers && headers.authorization;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect body && body.data', () => {
      const sf = createSourceFile('const d = body && body.data;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect payload && payload.type', () => {
      const sf = createSourceFile('const t = payload && payload.type;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect env && env.NODE_ENV', () => {
      const sf = createSourceFile('const e = env && env.NODE_ENV;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect settings && settings.theme', () => {
      const sf = createSourceFile('const t = settings && settings.theme;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect plugin && plugin.name', () => {
      const sf = createSourceFile('const n = plugin && plugin.name;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect service && service.url', () => {
      const sf = createSourceFile('const u = service && service.url;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect client && client.id', () => {
      const sf = createSourceFile('const cid = client && client.id;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect store && store.dispatch', () => {
      const sf = createSourceFile('const d = store && store.dispatch;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect instance && instance.state', () => {
      const sf = createSourceFile('const s = instance && instance.state;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect err && err.code', () => {
      const sf = createSourceFile('const c = err && err.code;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect doc && doc.title', () => {
      const sf = createSourceFile('const t = doc && doc.title;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect event && event.type', () => {
      const sf = createSourceFile('const t = event && event.type;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect path && path.dirname', () => {
      const sf = createSourceFile('const d = path && path.dirname;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect socket && socket.id', () => {
      const sf = createSourceFile('const sid = socket && socket.id;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect map && map.size', () => {
      const sf = createSourceFile('const s = map && map.size;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect set && set.size', () => {
      const sf = createSourceFile('const s = set && set.size;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect model && model.schema', () => {
      const sf = createSourceFile('const s = model && model.schema;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
  })

  describe('detecting with property access on left', () => {
    it('should detect this.data && this.data.value', () => {
      const sf = createSourceFile('const v = this.data && this.data.value;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect self.name && self.name.length', () => {
      const sf = createSourceFile('const l = self.name && self.name.length;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect module.exports && module.exports.default', () => {
      const sf = createSourceFile('const d = module.exports && module.exports.default;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect app.config && app.config.port', () => {
      const sf = createSourceFile('const p = app.config && app.config.port;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect user.profile && user.profile.avatar', () => {
      const sf = createSourceFile('const a = user.profile && user.profile.avatar;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect req.body && req.body.data', () => {
      const sf = createSourceFile('const d = req.body && req.body.data;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect ctx.request && ctx.request.url', () => {
      const sf = createSourceFile('const u = ctx.request && ctx.request.url;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect node.firstChild && node.firstChild.value', () => {
      const sf = createSourceFile('const v = node.firstChild && node.firstChild.value;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
  })

  describe('violation properties', () => {
    it('should have range property', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)[0].range).toBeDefined()
    })
    it('should have filePath property', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)[0].filePath).toBeDefined()
    })
    it('should have suggestion property', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(typeof analyzePreferOptionalChain(sf)[0].suggestion).toBe('string')
    })
    it('should suggest obj?.prop for obj && obj.prop', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toContain('obj?.prop')
    })
    it('should include filePath with test.ts', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)[0].filePath).toContain('test.ts')
    })
    it('should suggestion starts with Replace with:', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toContain('Replace with:')
    })
    it('should message contain null check', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)[0].message).toContain('null check')
    })
    it('should have string filePath', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(typeof analyzePreferOptionalChain(sf)[0].filePath).toBe('string')
    })
    it('should have string message', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(typeof analyzePreferOptionalChain(sf)[0].message).toBe('string')
    })
    it('should have string severity', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(typeof analyzePreferOptionalChain(sf)[0].severity).toBe('string')
    })
    it('should have string suggestion', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(typeof analyzePreferOptionalChain(sf)[0].suggestion).toBe('string')
    })
    it('should have string ruleId', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(typeof analyzePreferOptionalChain(sf)[0].ruleId).toBe('string')
    })
    it('should all violations have correct ruleId in multi-violation file', () => {
      const sf = createSourceFile('const a = obj1 && obj1.prop;\nconst b = obj2 && obj2.prop;')
      const violations = analyzePreferOptionalChain(sf)
      for (const v of violations) {
        expect(v.ruleId).toBe('prefer-optional-chain')
      }
    })
    it('should all violations have info severity in multi-violation file', () => {
      const sf = createSourceFile('const a = obj1 && obj1.prop;\nconst b = obj2 && obj2.prop;')
      const violations = analyzePreferOptionalChain(sf)
      for (const v of violations) {
        expect(v.severity).toBe('info')
      }
    })
    it('should all violations have same message text', () => {
      const sf = createSourceFile('const a = obj1 && obj1.prop;\nconst b = obj2 && obj2.prop;')
      const violations = analyzePreferOptionalChain(sf)
      const firstMsg = violations[0].message
      for (const v of violations) {
        expect(v.message).toBe(firstMsg)
      }
    })
    it('should different violations have different ranges', () => {
      const sf = createSourceFile('const a = obj1 && obj1.prop;\nconst b = obj2 && obj2.prop;')
      const violations = analyzePreferOptionalChain(sf)
      if (violations.length >= 2) {
        expect(violations[0].range).not.toEqual(violations[1].range)
      }
    })
    it('should different violations have different suggestions', () => {
      const sf = createSourceFile('const a = obj1 && obj1.prop;\nconst b = obj2 && obj2.val;')
      const violations = analyzePreferOptionalChain(sf)
      if (violations.length >= 2) {
        expect(violations[0].suggestion).not.toBe(violations[1].suggestion)
      }
    })
  })

  describe('suggestion generation', () => {
    it('should suggest a?.b for a && a.b', () => {
      const sf = createSourceFile('const x = a && a.b;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toBe('Replace with: a?.b')
    })
    it('should suggest obj?.prop for obj && obj.prop', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toBe('Replace with: obj?.prop')
    })
    it('should suggest _obj?.prop for _obj && _obj.prop', () => {
      const sf = createSourceFile('const x = _obj && _obj.prop;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toBe('Replace with: _obj?.prop')
    })
    it('should suggest $el?.val for $el && $el.val', () => {
      const sf = createSourceFile('const x = $el && $el.val;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toBe('Replace with: $el?.val')
    })
    it('should suggest data?.value for data && data.value', () => {
      const sf = createSourceFile('const x = data && data.value;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toBe('Replace with: data?.value')
    })
    it('should suggest obj?.prop?.nested for obj.prop && obj.prop.nested', () => {
      const sf = createSourceFile('const x = obj.prop && obj.prop.nested;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toBe('Replace with: obj?.prop?.nested')
    })
    it('should suggest foo?.bar?.baz for foo.bar && foo.bar.baz', () => {
      const sf = createSourceFile('const x = foo.bar && foo.bar.baz;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toBe('Replace with: foo?.bar?.baz')
    })
    it('should suggest a?.b?.c?.d for a.b.c && a.b.c.d', () => {
      const sf = createSourceFile('const x = a.b.c && a.b.c.d;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toBe('Replace with: a?.b?.c?.d')
    })
    it('should suggest config?.settings for config && config.settings', () => {
      const sf = createSourceFile('const x = config && config.settings;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toBe('Replace with: config?.settings')
    })
    it('should suggest arr?.length for arr && arr.length', () => {
      const sf = createSourceFile('const x = arr && arr.length;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toBe('Replace with: arr?.length')
    })
    it('should suggest error?.message for error && error.message', () => {
      const sf = createSourceFile('const x = error && error.message;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toBe('Replace with: error?.message')
    })
    it('should suggest window?.location for window && window.location', () => {
      const sf = createSourceFile('const x = window && window.location;')
      expect(analyzePreferOptionalChain(sf)[0].suggestion).toBe('Replace with: window?.location')
    })
  })

  describe('valid code - no violations', () => {
    it('should not flag optional chaining', () => {
      const sf = createSourceFile('const x = obj?.foo?.bar?.baz;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag simple identifier', () => {
      const sf = createSourceFile('const x = obj;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag property access without &&', () => {
      const sf = createSourceFile('const x = obj.prop;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag different objects in &&', () => {
      const sf = createSourceFile('const x = obj && other.prop;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag || operator', () => {
      const sf = createSourceFile('const x = obj || obj.prop;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag === null check', () => {
      const sf = createSourceFile('const x = obj === null;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag !== null check', () => {
      const sf = createSourceFile('const x = obj !== null;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag typeof check', () => {
      const sf = createSourceFile("const x = typeof obj === 'undefined';")
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag ternary without &&', () => {
      const sf = createSourceFile('const x = obj ? obj.prop : null;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag empty file', () => {
      const sf = createSourceFile('')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag numeric literal', () => {
      const sf = createSourceFile('const x = 42;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag string literal', () => {
      const sf = createSourceFile('const x = "hello";')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag boolean literal', () => {
      const sf = createSourceFile('const x = true;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag object literal', () => {
      const sf = createSourceFile('const x = { a: 1 };')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag array literal', () => {
      const sf = createSourceFile('const x = [1, 2, 3];')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag arrow function', () => {
      const sf = createSourceFile('const fn = () => 42;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag class declaration', () => {
      const sf = createSourceFile('class Foo {}')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag import statement', () => {
      const sf = createSourceFile("import { x } from 'y';")
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag interface declaration', () => {
      const sf = createSourceFile('interface Foo { bar: string; }')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag type alias', () => {
      const sf = createSourceFile('type Foo = { bar: string };')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag nullish coalescing alone', () => {
      const sf = createSourceFile('const x = obj ?? { prop: 1 };')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag logical NOT', () => {
      const sf = createSourceFile('const x = !obj;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag && without property access on right', () => {
      const sf = createSourceFile('const x = obj && fn();')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag && with element access on right', () => {
      const sf = createSourceFile('const x = obj && obj[0];')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag && with different identifiers', () => {
      const sf = createSourceFile('const x = foo && bar.baz;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag nested && without matching pattern', () => {
      const sf = createSourceFile('const x = a && b && c;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag function call result', () => {
      const sf = createSourceFile('const x = fn() && fn().prop;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag const assertion', () => {
      const sf = createSourceFile('const x = { a: 1 } as const;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && obj.method()', () => {
      const sf = createSourceFile('const x = obj && obj.method();')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && obj()', () => {
      const sf = createSourceFile('const x = obj && obj();')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag this && this.prop', () => {
      const sf = createSourceFile('const x = this && this.prop;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && obj["key"]', () => {
      const sf = createSourceFile('const x = obj && obj["key"];')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && 42', () => {
      const sf = createSourceFile('const x = obj && 42;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && "hello"', () => {
      const sf = createSourceFile('const x = obj && "hello";')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && true', () => {
      const sf = createSourceFile('const x = obj && true;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && null', () => {
      const sf = createSourceFile('const x = obj && null;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && undefined', () => {
      const sf = createSourceFile('const x = obj && undefined;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && { a: 1 }', () => {
      const sf = createSourceFile('const x = obj && { a: 1 };')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && [1, 2]', () => {
      const sf = createSourceFile('const x = obj && [1, 2];')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && new Foo()', () => {
      const sf = createSourceFile('const x = obj && new Foo();')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && typeof obj', () => {
      const sf = createSourceFile('const x = obj && typeof obj;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && void 0', () => {
      const sf = createSourceFile('const x = obj && void 0;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && (a, b)', () => {
      const sf = createSourceFile('const x = obj && (a, b);')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && delete obj.prop', () => {
      const sf = createSourceFile('const x = obj && delete obj.prop;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && `hello`', () => {
      const sf = createSourceFile('const x = obj && `hello`;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && (x = 1)', () => {
      const sf = createSourceFile('const x = obj && (y = 1);')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && a + b', () => {
      const sf = createSourceFile('const x = obj && a + b;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && a - b', () => {
      const sf = createSourceFile('const x = obj && a - b;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && a * b', () => {
      const sf = createSourceFile('const x = obj && a * b;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && a / b', () => {
      const sf = createSourceFile('const x = obj && a / b;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && a % b', () => {
      const sf = createSourceFile('const x = obj && a % b;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && a === b', () => {
      const sf = createSourceFile('const x = obj && a === b;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && a !== b', () => {
      const sf = createSourceFile('const x = obj && a !== b;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should not flag obj && a > b', () => {
      const sf = createSourceFile('const x = obj && a > b;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle multiple violations in same file', () => {
      const sf = createSourceFile(
        'const a = obj1 && obj1.prop;\nconst b = obj2 && obj2.prop;\nconst c = obj3 && obj3.prop;',
      )
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(3)
    })
    it('should handle mixed valid and invalid', () => {
      const sf = createSourceFile('const a = obj?.prop;\nconst b = obj && obj.prop;\nconst c = 42;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle single letter variable names', () => {
      const sf = createSourceFile('const x = a && a.b;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle long variable names', () => {
      const sf = createSourceFile(
        'const x = veryLongVariableName && veryLongVariableName.property;',
      )
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle underscore prefixed names', () => {
      const sf = createSourceFile('const x = _obj && _obj.prop;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle dollar sign names', () => {
      const sf = createSourceFile('const x = $obj && $obj.prop;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle camelCase properties', () => {
      const sf = createSourceFile('const x = obj && obj.myProperty;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle UPPER_CASE properties', () => {
      const sf = createSourceFile('const x = obj && obj.CONSTANT;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle code with comments', () => {
      const sf = createSourceFile('// comment\nconst x = obj && obj.prop; /* inline */')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle arrow function', () => {
      const sf = createSourceFile('const fn = () => obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle async function', () => {
      const sf = createSourceFile('async function fn() { return obj && obj.prop; }')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle generator function', () => {
      const sf = createSourceFile('function* fn() { yield obj && obj.prop; }')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle try-catch', () => {
      const sf = createSourceFile('try { const x = obj && obj.prop; } catch(e) {}')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle while loop', () => {
      const sf = createSourceFile('while (obj && obj.prop) { break; }')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should handle do-while', () => {
      const sf = createSourceFile('do {} while (obj && obj.prop);')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle type annotations', () => {
      const sf = createSourceFile('const x: string | undefined = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle file with only whitespace', () => {
      const sf = createSourceFile('   \n  \n  ')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should handle file with only comments', () => {
      const sf = createSourceFile('// comment\n/* block */')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should handle satisfies expression', () => {
      const sf = createSourceFile('const x = {} satisfies Record<string, unknown>;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should handle switch statement', () => {
      const sf = createSourceFile('switch(obj && obj.prop) { case "a": break; }')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle for loop', () => {
      const sf = createSourceFile('for (let i = 0; i < (obj && obj.prop); i++) {}')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle for-in loop', () => {
      const sf = createSourceFile('for (const k in (obj && obj.prop)) {}')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle for-of loop', () => {
      const sf = createSourceFile('for (const x of (obj && obj.prop)) {}')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle template literal expression', () => {
      const sf = createSourceFile('const s = `${obj && obj.prop}`;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle namespace with violation', () => {
      const sf = createSourceFile('namespace NS { const x = obj && obj.prop; }')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle abstract class without violation', () => {
      const sf = createSourceFile('abstract class Foo { abstract bar: string; }')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should handle generic function with violation', () => {
      const sf = createSourceFile('function fn<T>(x: T) { return x && x.prop; }')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle async arrow function with violation', () => {
      const sf = createSourceFile('const fn = async () => { return obj && obj.prop; }')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle nested functions', () => {
      const sf = createSourceFile(
        'function outer() { function inner() { return obj && obj.prop; } }',
      )
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle immediately invoked function', () => {
      const sf = createSourceFile('(function() { return obj && obj.prop; })();')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle conditional expression', () => {
      const sf = createSourceFile('const x = condition ? (obj && obj.prop) : null;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should handle enum declaration', () => {
      const sf = createSourceFile('enum Direction { Up, Down, Left, Right }')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should handle destructuring assignment', () => {
      const sf = createSourceFile('const { a, b } = obj;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
    it('should handle spread in array', () => {
      const sf = createSourceFile('const x = [...arr];')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(0)
    })
  })

  describe('rule create function', () => {
    it('should return visitor and onComplete', () => {
      const result = preferOptionalChainRule.create({})
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })
    it('should return violations array from onComplete', () => {
      const result = preferOptionalChainRule.create({})
      expect(Array.isArray(result.onComplete())).toBe(true)
    })
    it('should have visitNode in visitor', () => {
      const result = preferOptionalChainRule.create({})
      expect(typeof result.visitor.visitNode).toBe('function')
    })
  })

  describe('deeply nested patterns', () => {
    it('should detect a && a.b && a.b.c', () => {
      const sf = createSourceFile('const x = a && a.b && a.b.c;')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should detect obj.val && obj.val.nested && obj.val.nested.deep', () => {
      const sf = createSourceFile('const x = obj.val && obj.val.nested && obj.val.nested.deep;')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should detect two-level nesting: foo.bar && foo.bar.baz', () => {
      const sf = createSourceFile('const x = foo.bar && foo.bar.baz;')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should detect three-level nesting: a.b.c && a.b.c.d', () => {
      const sf = createSourceFile('const x = a.b.c && a.b.c.d;')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should detect a.b && a.b.c && a.b.c.d', () => {
      const sf = createSourceFile('const x = a.b && a.b.c && a.b.c.d;')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should detect four-level nesting: a.b.c.d && a.b.c.d.e', () => {
      const sf = createSourceFile('const x = a.b.c.d && a.b.c.d.e;')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(1)
    })
    it('should detect deeply chained property access on left: x.y.z.w && x.y.z.w.v', () => {
      const sf = createSourceFile('const x = x.y.z.w && x.y.z.w.v;')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('multiple occurrences', () => {
    it('should detect two separate patterns', () => {
      const sf = createSourceFile('const a = obj1 && obj1.prop;\nconst b = obj2 && obj2.prop;')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(2)
    })
    it('should detect three separate patterns', () => {
      const sf = createSourceFile('const a = x && x.a;\nconst b = y && y.b;\nconst c = z && z.c;')
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(3)
    })
    it('should detect five separate patterns', () => {
      const sf = createSourceFile(
        'const a = a1 && a1.a;\nconst b = b1 && b1.b;\nconst c = c1 && c1.c;\nconst d = d1 && d1.d;\nconst e = e1 && e1.e;',
      )
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(5)
    })
    it('should detect patterns in different scopes', () => {
      const sf = createSourceFile(
        'function fn1() { return obj && obj.prop; }\nfunction fn2() { return data && data.value; }\nconst arrow = () => item && item.name;',
      )
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(3)
    })
    it('should detect ten separate patterns', () => {
      const sf = createSourceFile(
        'const a = a1 && a1.a;\nconst b = b1 && b1.b;\nconst c = c1 && c1.c;\nconst d = d1 && d1.d;\nconst e = e1 && e1.e;\nconst f = f1 && f1.f;\nconst g = g1 && g1.g;\nconst h = h1 && h1.h;\nconst i = i1 && i1.i;\nconst j = j1 && j1.j;',
      )
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(10)
    })
    it('should detect patterns in class methods', () => {
      const sf = createSourceFile(
        'class Foo { method1() { return obj && obj.prop; } method2() { return data && data.value; } }',
      )
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(2)
    })
    it('should detect pattern after valid code', () => {
      const sf = createSourceFile(
        'const a = obj?.prop;\nconst b = [1, 2, 3];\nconst c = item && item.name;',
      )
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
  })

  describe('real-world patterns', () => {
    it('should detect in React component', () => {
      const sf = createSourceFile('const Component = ({ user }) => { return user && user.name; }')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in Express handler', () => {
      const sf = createSourceFile(
        'app.get("/api", (req, res) => { const body = req && req.body; });',
      )
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in error handler', () => {
      const sf = createSourceFile('catch (err) { const msg = err && err.message; }')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in config access', () => {
      const sf = createSourceFile(
        'const port = config && config.port;\nconst host = config && config.host;',
      )
      expect(analyzePreferOptionalChain(sf).length).toBeGreaterThanOrEqual(2)
    })
    it('should detect in event handler', () => {
      const sf = createSourceFile(
        'button.addEventListener("click", (e) => { const target = e && e.target; });',
      )
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in JSON parsing', () => {
      const sf = createSourceFile('const data = parsed && parsed.result;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in API response handling', () => {
      const sf = createSourceFile('const status = response && response.status;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in DOM manipulation', () => {
      const sf = createSourceFile('const el = document && document.body;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in database query result', () => {
      const sf = createSourceFile('const rows = result && result.rows;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in middleware pattern', () => {
      const sf = createSourceFile('const next = middleware && middleware.next;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should detect in callback pattern', () => {
      const sf = createSourceFile('const cb = callback && callback.fn;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
  })

  describe('with options parameter', () => {
    it('should work with empty options', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf, {})).toHaveLength(1)
    })
    it('should work with no options argument', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf)).toHaveLength(1)
    })
    it('should work with undefined options', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      expect(analyzePreferOptionalChain(sf, undefined)).toHaveLength(1)
    })
    it('should detect same violations with empty options and without options', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      const withOpts = analyzePreferOptionalChain(sf, {})
      const sf2 = createSourceFile('const x = obj && obj.prop;')
      const withoutOpts = analyzePreferOptionalChain(sf2)
      expect(withOpts.length).toBe(withoutOpts.length)
    })
    it('should return same ruleId regardless of options', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      const v = analyzePreferOptionalChain(sf, {})
      expect(v[0].ruleId).toBe('prefer-optional-chain')
    })
    it('should return same severity regardless of options', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      const v = analyzePreferOptionalChain(sf, {})
      expect(v[0].severity).toBe('info')
    })
  })

  describe('range validation', () => {
    it('should have range with start property', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      const range = analyzePreferOptionalChain(sf)[0].range
      expect(range).toHaveProperty('start')
    })
    it('should have range with end property', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      const range = analyzePreferOptionalChain(sf)[0].range
      expect(range).toHaveProperty('end')
    })
    it('should have numeric range start line', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      const range = analyzePreferOptionalChain(sf)[0].range
      expect(typeof range.start.line).toBe('number')
    })
    it('should have numeric range end line', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      const range = analyzePreferOptionalChain(sf)[0].range
      expect(typeof range.end.line).toBe('number')
    })
    it('should have range start line less than or equal to range end line', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      const range = analyzePreferOptionalChain(sf)[0].range
      expect(range.start.line).toBeLessThanOrEqual(range.end.line)
    })
  })

  describe('severity and ruleId consistency', () => {
    it('should always have prefer-optional-chain as ruleId', () => {
      const codes = [
        'const x = obj && obj.prop;',
        'const x = a && a.b;',
        'const x = data && data.value;',
      ]
      for (const code of codes) {
        const sf = createSourceFile(code)
        const violations = analyzePreferOptionalChain(sf)
        for (const v of violations) {
          expect(v.ruleId).toBe('prefer-optional-chain')
        }
      }
    })
    it('should always have info severity', () => {
      const codes = [
        'const x = obj && obj.prop;',
        'const x = a && a.b;',
        'const x = data && data.value;',
      ]
      for (const code of codes) {
        const sf = createSourceFile(code)
        const violations = analyzePreferOptionalChain(sf)
        for (const v of violations) {
          expect(v.severity).toBe('info')
        }
      }
    })
    it('should always have consistent message across violations', () => {
      const sf = createSourceFile('const a = obj1 && obj1.prop;\nconst b = obj2 && obj2.val;')
      const violations = analyzePreferOptionalChain(sf)
      const messages = violations.map((v) => v.message)
      const unique = [...new Set(messages)]
      expect(unique).toHaveLength(1)
    })
    it('should always have string filePath', () => {
      const sf = createSourceFile('const x = obj && obj.prop;')
      const violations = analyzePreferOptionalChain(sf)
      for (const v of violations) {
        expect(typeof v.filePath).toBe('string')
        expect(v.filePath.length).toBeGreaterThan(0)
      }
    })
    it('should always have suggestion starting with Replace with:', () => {
      const sf = createSourceFile('const a = obj1 && obj1.prop;\nconst b = obj2 && obj2.val;')
      const violations = analyzePreferOptionalChain(sf)
      for (const v of violations) {
        expect(v.suggestion).toContain('Replace with:')
      }
    })
  })
})
