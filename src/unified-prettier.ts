import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { MessageChannel, receiveMessageOnPort, Worker } from 'node:worker_threads'

import { type Options } from 'prettier'
import { type Plugin } from 'unified'

import { type Payload, type Response } from './worker.js'

let worker: Worker

/**
 * A unified plugin to format output using Prettier.
 */
const unifiedPrettier: Plugin<[Options?]> = function unifiedPrettier(options) {
  const compiler = this.compiler || this.Compiler

  assert(compiler, 'unified-prettier needs another compiler to be registered first')

  this.Compiler = undefined
  this.compiler = (tree, file) => {
    const content = compiler(tree, file)

    if (!file.path) {
      return content
    }

    const filepath = resolve(file.cwd, file.path)

    const signal = new Int32Array(new SharedArrayBuffer(4))
    const { port1: localPort, port2: workerPort } = new MessageChannel()

    if (!worker) {
      worker = new Worker(new URL('worker.js', import.meta.url))
      worker.unref()
    }

    worker.postMessage(
      {
        content: String(content),
        filepath,
        options,
        port: workerPort,
        signal
      } satisfies Payload,
      [workerPort]
    )

    Atomics.wait(signal, 0, 0)

    const { message } = receiveMessageOnPort(localPort) as {
      /**
       * The response from the web worker.
       */
      message: Response
    }

    if ('error' in message) {
      throw message.error
    }

    return message.result
  }
}

export default unifiedPrettier
