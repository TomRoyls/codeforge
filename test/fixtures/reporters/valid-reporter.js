export default function createTestReporter(options) {
  return {
    name: 'test-reporter',
    format(v) { return v.message },
    report(results) { /* no-op */ }
  }
}
