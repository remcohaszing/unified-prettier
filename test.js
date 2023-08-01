import assert from 'node:assert/strict'
import { test } from 'node:test'

import { unified } from 'unified'

import unifiedPrettier from './index.js'

/**
 * @typedef Root
 * @property {'root'} type
 * @property {string} value
 */

/**
 * @this {import('unified').FrozenProcessor<void, Root, Root>}
 */
function valueStringify() {
  this.Compiler = (node) => node.value
}

/**
 * @this {import('unified').FrozenProcessor<void, Root, Root>}
 */
function valueStringifyClass() {
  this.Compiler = class {
    /**
     * @param {Root} node
     *   The node to compile.
     */
    constructor(node) {
      this.node = node
    }

    compile() {
      return this.node.value
    }
  }
}

test('function compiler', () => {
  const result = unified()
    .use(valueStringify)
    .use(unifiedPrettier)
    .stringify({ type: 'root', value: '__example__\n\n' }, { path: 'markdown.md' })

  assert.equal(result, '**example**\n')
})

test('class compiler', () => {
  const result = unified()
    .use(valueStringifyClass)
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
    new Error('unified-prettier needs another compiler to be registered first')
  )
})

test('handle errors', () => {
  const processor = unified().use(valueStringify).use(unifiedPrettier)

  assert.throws(
    () => processor.stringify({ type: 'root', value: 'invalid(' }, { path: 'javascript.js' }),
    /Unexpected token/
  )
})
