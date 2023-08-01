import { type Options } from 'prettier'
import { type FrozenProcessor } from 'unified'

/**
 * A unified plugin to format output using Prettier.
 *
 * @param options
 *   Options to pass to Prettier.
 */
export default function unifiedPrettier<Processor extends FrozenProcessor<void, void, void, void>>(
  this: Processor,
  options?: Options | undefined
): undefined
