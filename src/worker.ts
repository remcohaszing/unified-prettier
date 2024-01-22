import { type MessagePort, parentPort } from 'node:worker_threads'

import { format, getFileInfo, type Options, resolveConfig } from 'prettier'

/**
 * @internal
 */
export type Response = { error: unknown } | { result: string }

/**
 * @internal
 */
export interface Payload {
  content: string
  filepath: string
  options: Options | undefined
  port: MessagePort
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
