import { resolve } from 'node:path'
import { CompilerFunction, FrozenProcessor } from 'unified'
// @ts-expect-error https://github.com/prettier/prettier-synchronized/pull/11
import prettier from '@prettier/sync'
import { Options } from 'prettier'

function unifiedPrettier<Processor extends FrozenProcessor>(
  this: Processor,
  options?: Options | undefined
): void {
  const { Compiler } = this

  if (!Compiler) {
    throw new Error('unified-prettier needs another compiler to be registered first')
  }

  this.Compiler = (tree, file) => {
    let content: unknown
    if (Compiler.prototype?.compile) {
      const compiler = new (Compiler as any)(tree, file)
      content = compiler.compile()
    } else {
      content = (Compiler as CompilerFunction)(tree, file)
    }

    const filepath = resolve(file.cwd, file.path)
    const fileInfo = prettier.getFileInfo(filepath)

    if (fileInfo.ignored) {
      return content
    }

    if (!fileInfo.inferredParser) {
      return content
    }

    const config = prettier.resolveConfig(filepath, { editorconfig: true })

    return prettier.format(content, { ...config, ...options, filepath })
  }
}

export default unifiedPrettier
