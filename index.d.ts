import { type Options } from 'prettier'
import { type Plugin } from 'unified'

/**
 * A unified plugin to format output using Prettier.
 *
 * @param options
 *   Options to pass to Prettier.
 */
declare const unifiedPrettier: Plugin<[Options?]>

export default unifiedPrettier
