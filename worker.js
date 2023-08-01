import { parentPort } from 'node:worker_threads'

import { format, getFileInfo, resolveConfig } from 'prettier'

/**
 * @typedef {{ result: string } | { error: unknown }} Response
 */

/**
 * @typedef Payload
 * @property {string} content
 * @property {string} filepath
 * @property {import('prettier').Options | undefined} options
 * @property {import('node:worker_threads').MessagePort} port
 * @property {Int32Array} signal
 */

parentPort?.addListener(
  'message',

  /**
   * @param {Payload} payload
   *   The payload received from the host.
   */
  async ({ content, filepath, options, port, signal }) => {
    /** @type {Response} */
    let response

    try {
      const fileInfo = await getFileInfo(filepath)

      response = {
        result:
          fileInfo.ignored || !fileInfo.inferredParser
            ? content
            : await format(content, {
                ...(await resolveConfig(filepath, { editorconfig: true })),
                ...options,
                filepath
              })
      }
    } catch (error) {
      response = { error }
    }

    try {
      port.postMessage(response, [])
    } finally {
      port.close()
      Atomics.store(signal, 0, 1)
      Atomics.notify(signal, 0)
    }
  }
)
