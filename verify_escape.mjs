const s1 = '\\\\' + '*'
console.log('String: "\\\\" + "*" =', s1)
console.log('String chars:', [...s1])

const regex1 = new RegExp('^' + s1 + '$')
console.log('Regex:', regex1)
console.log('Regex source:', regex1.source)
console.log('Test "*":', regex1.test('*'))
console.log('Test "a":', regex1.test('a'))

console.log('')

const s2 = '\\\\' + '\\' + '*'
console.log('String: "\\\\" + "\\\\" + "*" =', s2)
console.log('String chars:', [...s2])

const regex2 = new RegExp('^' + s2 + '$')
console.log('Regex:', regex2)
console.log('Regex source:', regex2.source)
console.log('Test "*":', regex2.test('*'))
console.log('Test "a":', regex2.test('a'))
