import { type MessagePort, parentPort } from 'node:worker_threads'

import { format, getFileInfo, type Options, resolveConfig } from 'prettier'

/**
 * @internal
 */
export type Response =
  | {
      /**
       * The error thas has occurred.
       */
      error: unknown
    }
  | {
      /**
       * The success result.
       */
      result: string
    }

/**
 * @internal
 */
export interface Payload {
  /**
   * The content to format.
   */
  content: string

  /**
   * The file path to use for looking up the Prettier configuration.
   */
  filepath: string

  /**
   * Prettier options that were passed manually.
   */
  options: Options | undefined

  /**
   * The port to use to communicate from a worker to the main thread.
   */
  port: MessagePort

  /**
   * The signal to use to communicate from a worker to the main thread.
   */
  signal: Int32Array
}

parentPort!.addListener(
  'message',
  async ({ content, filepath, options, port, signal }: Payload) => {
    let response: Response

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
