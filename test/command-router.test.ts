import { describe, it, expect } from 'vitest'
import { RouteMatcher } from '../src/core/command-router/route-matcher.js'
import { CommandRouter } from '../src/core/command-router/command-router.js'
import type { CommandRoute, RouteMatch, Middleware, RouteParams } from '../src/core/command-router/types.js'

function makeRoute(path: string, description = '', children: CommandRoute[] = [], middlewares: Middleware[] = []): CommandRoute {
  return { path, handler: () => `handled:${path}`, description, children, middlewares }
}

// ─── RouteMatcher.isMatch ──────────────────────────────────────────
describe('RouteMatcher.isMatch', () => {
  const matcher = new RouteMatcher()

  it('matches exact path', () => {
    expect(matcher.isMatch('analyze', ['analyze'])).toBe(true)
  })

  it('matches multi-segment path', () => {
    expect(matcher.isMatch('config/validate', ['config', 'validate'])).toBe(true)
  })

  it('rejects wrong segment count', () => {
    expect(matcher.isMatch('analyze', ['analyze', 'extra'])).toBe(false)
  })

  it('rejects wrong segment value', () => {
    expect(matcher.isMatch('analyze', ['build'])).toBe(false)
  })

  it('matches dynamic segment (:param)', () => {
    expect(matcher.isMatch(':id', ['123'])).toBe(true)
  })

  it('matches mixed static and dynamic segments', () => {
    expect(matcher.isMatch('user/:id', ['user', '42'])).toBe(true)
  })

  it('rejects partial mismatch with dynamic', () => {
    expect(matcher.isMatch('user/:id', ['item', '42'])).toBe(false)
  })

  it('handles leading slash in route path', () => {
    expect(matcher.isMatch('/analyze', ['analyze'])).toBe(true)
  })
})

// ─── RouteMatcher.extractParams ────────────────────────────────────
describe('RouteMatcher.extractParams', () => {
  const matcher = new RouteMatcher()

  it('extracts single param', () => {
    expect(matcher.extractParams(':id', ['123'])).toEqual({ id: '123' })
  })

  it('extracts multiple params', () => {
    expect(matcher.extractParams('user/:userId/post/:postId', ['user', '5', 'post', '99'])).toEqual({
      userId: '5',
      postId: '99',
    })
  })

  it('returns empty for no params', () => {
    expect(matcher.extractParams('analyze', ['analyze'])).toEqual({})
  })

  it('returns empty when input shorter than route', () => {
    expect(matcher.extractParams('user/:id', ['user'])).toEqual({})
  })
})

// ─── RouteMatcher.match ────────────────────────────────────────────
describe('RouteMatcher.match', () => {
  const matcher = new RouteMatcher()

  it('matches from route list', () => {
    const routes = [makeRoute('analyze'), makeRoute('build')]
    const result = matcher.match(routes, ['build'])
    expect(result).toBeDefined()
    expect(result!.route.path).toBe('build')
  })

  it('returns undefined for no match', () => {
    const routes = [makeRoute('analyze')]
    expect(matcher.match(routes, ['build'])).toBeUndefined()
  })

  it('returns correct params', () => {
    const routes = [makeRoute('user/:id')]
    const result = matcher.match(routes, ['user', '42'])
    expect(result).toBeDefined()
    expect(result!.params.named).toEqual({ id: '42' })
    expect(result!.params.command).toBe('user 42')
  })

  it('searches children when no top-level match', () => {
    const parent = makeRoute('config', 'config', [makeRoute('config/validate', 'validate')])
    const routes = [makeRoute('analyze'), parent]
    const result = matcher.match(routes, ['config', 'validate'])
    expect(result).toBeDefined()
    expect(result!.route.path).toBe('config/validate')
  })
})

// ─── RouteMatcher.findAllMatches ───────────────────────────────────
describe('RouteMatcher.findAllMatches', () => {
  const matcher = new RouteMatcher()

  it('finds all matching routes including children', () => {
    const child = makeRoute('x', 'dup')
    const routes = [makeRoute('x', 'top', [child])]
    const results = matcher.findAllMatches(routes, ['x'])
    expect(results).toHaveLength(2)
  })

  it('returns empty array when no matches', () => {
    const results = matcher.findAllMatches([makeRoute('a')], ['b'])
    expect(results).toHaveLength(0)
  })
})

// ─── CommandRouter register/unregister ─────────────────────────────
describe('CommandRouter register/unregister', () => {
  it('register adds a route', () => {
    const router = new CommandRouter()
    router.register(makeRoute('analyze'))
    expect(router.getRoutes()).toHaveLength(1)
  })

  it('unregister removes a route by path', () => {
    const router = new CommandRouter()
    router.register(makeRoute('analyze'))
    router.register(makeRoute('build'))
    router.unregister('analyze')
    expect(router.getRoutes()).toHaveLength(1)
    expect(router.getRoutes()[0]!.path).toBe('build')
  })

  it('unregister removes from children recursively', () => {
    const router = new CommandRouter()
    router.register(makeRoute('config', '', [makeRoute('config/validate'), makeRoute('config/visualize')]))
    router.unregister('config/validate')
    const route = router.findRoute('config')
    expect(route!.children).toHaveLength(1)
    expect(route!.children[0]!.path).toBe('config/visualize')
  })

  it('getRoutes returns a copy', () => {
    const router = new CommandRouter()
    router.register(makeRoute('a'))
    const routes = router.getRoutes()
    routes.push(makeRoute('b'))
    expect(router.getRoutes()).toHaveLength(1)
  })
})

// ─── CommandRouter middleware ───────────────────────────────────────
describe('CommandRouter middleware', () => {
  it('use adds global middleware', () => {
    const router = new CommandRouter()
    let called = false
    router.use((_params, next) => { called = true; return next() })
    router.register(makeRoute('test'))
    router.execute(['test'])
    expect(called).toBe(true)
  })

  it('global middleware runs before handler', () => {
    const router = new CommandRouter()
    const order: string[] = []
    router.use((_params, next) => { order.push('mw1'); return next() })
    router.use((_params, next) => { order.push('mw2'); return next() })
    router.register({ path: 'test', handler: () => { order.push('handler'); return 'done' }, description: '', children: [], middlewares: [] })
    router.execute(['test'])
    expect(order).toEqual(['mw1', 'mw2', 'handler'])
  })

  it('route-level middleware runs after global', () => {
    const router = new CommandRouter()
    const order: string[] = []
    router.use((_params, next) => { order.push('global'); return next() })
    router.register({
      path: 'test',
      handler: () => { order.push('handler'); return 'done' },
      description: '',
      children: [],
      middlewares: [(_params, next) => { order.push('route-mw'); return next() }],
    })
    router.execute(['test'])
    expect(order).toEqual(['global', 'route-mw', 'handler'])
  })

  it('middleware can short-circuit', () => {
    const router = new CommandRouter()
    let handlerCalled = false
    router.use(() => 'blocked')
    router.register({ path: 'test', handler: () => { handlerCalled = true; return 'done' }, description: '', children: [], middlewares: [] })
    const result = router.execute(['test'])
    expect(result).toBe('blocked')
    expect(handlerCalled).toBe(false)
  })
})

// ─── CommandRouter resolve ─────────────────────────────────────────
describe('CommandRouter resolve', () => {
  it('resolves a registered route', () => {
    const router = new CommandRouter()
    router.register(makeRoute('analyze'))
    const match = router.resolve(['analyze'])
    expect(match).toBeDefined()
    expect(match!.route.path).toBe('analyze')
  })

  it('returns undefined for unknown route', () => {
    const router = new CommandRouter()
    router.register(makeRoute('analyze'))
    expect(router.resolve(['unknown'])).toBeUndefined()
  })
})

// ─── CommandRouter execute ─────────────────────────────────────────
describe('CommandRouter execute', () => {
  it('executes handler and returns result', () => {
    const router = new CommandRouter()
    router.register(makeRoute('test'))
    expect(router.execute(['test'])).toBe('handled:test')
  })

  it('passes args to handler', () => {
    const router = new CommandRouter()
    let received: RouteParams | undefined
    router.register({ path: 'test', handler: (p) => { received = p; return 'ok' }, description: '', children: [], middlewares: [] })
    router.execute(['test'], ['arg1', 'arg2'])
    expect(received!.args).toEqual(['arg1', 'arg2'])
    expect(received!.command).toBe('test')
  })

  it('returns undefined for no match', () => {
    const router = new CommandRouter()
    expect(router.execute(['missing'])).toBeUndefined()
  })

  it('passes named params to handler', () => {
    const router = new CommandRouter()
    let received: RouteParams | undefined
    router.register({ path: 'user/:id', handler: (p) => { received = p; return 'ok' }, description: '', children: [], middlewares: [] })
    router.execute(['user', '42'])
    expect(received!.named).toEqual({ id: '42' })
  })
})

// ─── CommandRouter findRoute ───────────────────────────────────────
describe('CommandRouter findRoute', () => {
  it('finds a route by path', () => {
    const router = new CommandRouter()
    router.register(makeRoute('analyze'))
    expect(router.findRoute('analyze')).toBeDefined()
    expect(router.findRoute('analyze')!.path).toBe('analyze')
  })

  it('searches children recursively', () => {
    const router = new CommandRouter()
    router.register(makeRoute('config', '', [makeRoute('config/validate')]))
    expect(router.findRoute('config/validate')).toBeDefined()
  })

  it('returns undefined for missing route', () => {
    const router = new CommandRouter()
    expect(router.findRoute('missing')).toBeUndefined()
  })
})

// ─── CommandRouter listCommands ────────────────────────────────────
describe('CommandRouter listCommands', () => {
  it('lists all registered command paths', () => {
    const router = new CommandRouter()
    router.register(makeRoute('analyze'))
    router.register(makeRoute('build'))
    expect(router.listCommands()).toEqual(['analyze', 'build'])
  })

  it('includes children', () => {
    const router = new CommandRouter()
    router.register(makeRoute('config', '', [makeRoute('config/validate'), makeRoute('config/visualize')]))
    expect(router.listCommands()).toEqual(['config', 'config/validate', 'config/visualize'])
  })

  it('returns empty array when no routes', () => {
    const router = new CommandRouter()
    expect(router.listCommands()).toEqual([])
  })
})

// ─── CommandRouter getHelp ─────────────────────────────────────────
describe('CommandRouter getHelp', () => {
  it('returns help for all routes', () => {
    const router = new CommandRouter()
    router.register(makeRoute('analyze', 'Analyze code'))
    router.register(makeRoute('build', 'Build project'))
    const help = router.getHelp()
    expect(help).toContain('analyze - Analyze code')
    expect(help).toContain('build - Build project')
    expect(help).toContain('\n')
  })

  it('returns help for specific route', () => {
    const router = new CommandRouter()
    router.register(makeRoute('analyze', 'Analyze code'))
    expect(router.getHelp('analyze')).toBe('analyze - Analyze code')
  })

  it('returns empty string for missing route', () => {
    const router = new CommandRouter()
    expect(router.getHelp('missing')).toBe('')
  })

  it('includes children in full help', () => {
    const router = new CommandRouter()
    router.register(makeRoute('config', 'Config cmd', [makeRoute('config/validate', 'Validate config')]))
    const help = router.getHelp()
    expect(help).toContain('config/validate - Validate config')
  })
})
