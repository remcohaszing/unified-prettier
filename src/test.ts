import assert, { AssertionError } from 'node:assert/strict'
import { test } from 'node:test'

import { type Plugin, unified } from 'unified'
import unifiedPrettier from 'unified-prettier'

interface Root {
  type: 'root'
  value: string
}

const valueStringify: Plugin<[], Root, string> = function valueStringify() {
  this.compiler = (node) => (node as Root).value
}

const valueStringifyUpperCase: Plugin<[], Root, string> = function valueStringifyUpperCase() {
  this.Compiler = (node) => (node as Root).value
}

test('lower case compiler', () => {
  const result = unified()
    .use(valueStringify)
    .use(unifiedPrettier)
    .stringify({ type: 'root', value: '__example__\n\n' }, { path: 'markdown.md' })

  assert.equal(result, '**example**\n')
})

test('upper case compiler', () => {
  const result = unified()
    .use(valueStringifyUpperCase)
    .use(unifiedPrettier)
    .stringify({ type: 'root', value: '__example__\n\n' }, { path: 'markdown.md' })

  assert.equal(result, '**example**\n')
})

test('prettier ignored', () => {
  const result = unified()
    .use(valueStringify)
    .use(unifiedPrettier)
    .stringify({ type: 'root', value: '__example__\n\n' }, { path: 'node_modules/are/ignored.md' })

  assert.equal(result, '__example__\n\n')
})

test('ignore missing prettier parser', () => {
  const result = unified()
    .use(valueStringify)
    .use(unifiedPrettier)
    .stringify({ type: 'root', value: '__example__\n\n' }, { path: 'unknown.parser' })

  assert.equal(result, '__example__\n\n')
})

test('accept prettier options', () => {
  const result = unified()
    .use(valueStringify)
    .use(unifiedPrettier, { singleQuote: false })
    .stringify({ type: 'root', value: "console.log('')" }, { path: 'javascript.js' })

  assert.equal(result, 'console.log("")\n')
})

test('error if there is no compiler', () => {
  assert.throws(
    () => unified().use(unifiedPrettier).freeze(),
    new AssertionError({
      expected: true,
      message: 'unified-prettier needs another compiler to be registered first',
      operator: '=='
    })
  )
})

test('handle errors', () => {
  const processor = unified().use(valueStringify).use(unifiedPrettier)

  assert.throws(
    () => processor.stringify({ type: 'root', value: 'invalid(' }, { path: 'javascript.js' }),
    /Unexpected token/
  )
})
