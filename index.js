import { resolve } from 'node:path'
import { MessageChannel, receiveMessageOnPort, Worker } from 'node:worker_threads'

/** @type {Worker} */
let worker

/**
 * A unified plugin to format output using Prettier.
 *
 * @param {import('prettier').Options | undefined} [options]
 *   Options to pass to Prettier.
 * @this {import('unified').FrozenProcessor}
 */
export default function unifiedPrettier(options) {
  const { Compiler } = this

  if (!Compiler) {
    throw new Error('unified-prettier needs another compiler to be registered first')
  }

  this.Compiler = (tree, file) => {
    /** @type {unknown} */
    let content
    if (Compiler.prototype?.compile) {
      const compiler = new /** @type {any} */ (Compiler)(tree, file)
      content = compiler.compile()
    } else {
      content = /** @type {import('unified').CompilerFunction} */ (Compiler)(tree, file)
    }

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
