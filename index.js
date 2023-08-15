import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { MessageChannel, receiveMessageOnPort, Worker } from 'node:worker_threads'

/** @type {Worker} */
let worker

/**
 * A unified plugin to format output using Prettier.
 *
 * @param {import('prettier').Options | undefined} [options]
 *   Options to pass to Prettier.
 * @this {import('unified').Processor}
 */
export default function unifiedPrettier(options) {
  const compiler = this.compiler || this.Compiler

  assert(compiler, 'unified-prettier needs another compiler to be registered first')

  this.Compiler = undefined
  this.compiler = (tree, file) => {
    const content = compiler(tree, file)

    const filepath = resolve(file.cwd, file.path)

    const signal = new Int32Array(new SharedArrayBuffer(4))
    const { port1: localPort, port2: workerPort } = new MessageChannel()

    if (!worker) {
      worker = new Worker(new URL('worker.js', import.meta.url))
      worker.unref()
    }

    worker.postMessage(
      /** @type {import('./worker.js').Payload} */ ({
        content: String(content),
        filepath,
        options,
        port: workerPort,
        signal
      }),
      [workerPort]
    )

    Atomics.wait(signal, 0, 0)

    const { message } = /** @type {{ message: import('./worker.js').Response }} */ (
      receiveMessageOnPort(localPort)
    )

    if ('error' in message) {
      throw message.error
    }

    return message.result
  }
}
