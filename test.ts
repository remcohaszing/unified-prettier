import assert from 'node:assert/strict'
import { test } from 'node:test'

import { type FrozenProcessor, unified } from 'unified'

import unifiedPrettier from './index.js'

interface Root {
  type: 'root'
  value: string
}

function valueStringify(this: FrozenProcessor<void, Root, Root>): void {
  this.Compiler = (node) => node.value
}

function valueStringifyClass(this: FrozenProcessor<void, Root, Root>): void {
  this.Compiler = class {
    node: Root

    constructor(node: Root) {
      this.node = node
    }

    compile(): string {
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
