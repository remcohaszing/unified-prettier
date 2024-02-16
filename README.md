# unified-prettier

[![github actions](https://github.com/remcohaszing/unified-prettier/actions/workflows/ci.yaml/badge.svg)](https://github.com/remcohaszing/unified-prettier/actions/workflows/ci.yaml)
[![npm version](https://img.shields.io/npm/v/unified-prettier)](https://www.npmjs.com/package/unified-prettier)
[![npm downloads](https://img.shields.io/npm/dm/unified-prettier)](https://www.npmjs.com/package/unified-prettier)
[![codecov](https://codecov.io/gh/remcohaszing/unified-prettier/branch/main/graph/badge.svg)](https://codecov.io/gh/remcohaszing/unified-prettier)

A [unified](https://unifiedjs.com) plugin to format output using [Prettier](https://prettier.io/).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [Options](#options)
- [Related projects](#related-projects)
- [Compatibility](#compatibility)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Installation

```sh
npm install unified-prettier
```

## Usage

This unified plugin takes content from another compiler, and reformats the output using Prettier.
It’s intended to work with
[`unified-engine`](https://github.com/unifiedjs/unified-engine/blob/main/readme.md) implementations,
such as [`remark-cli`](https://github.com/remarkjs/remark/tree/main/packages/remark-cli) and
[`rehype-cli`](https://github.com/rehypejs/rehype/tree/main/packages/rehype-cli).

In your
[configuration file](https://github.com/unifiedjs/unified-engine/blob/main/doc/configure.md), add
`unified-prettier` to the plugins:

```json
{
  "plugins": ["unified-prettier"]
}
```

It can also be used programmatically. Although you’re probably better off passing the output value
to Prettier directly.

The following example formats the readme using Prettier.

```js
import { remark } from 'remark'
import { read } from 'to-vfile'
import unifiedPrettier from 'unified-prettier'

const processor = remark.use(unifiedPrettier)
const file = await read('README.md')

const { value } = await processor.process(file)

console.log(value)
```

The following package formats the readme using Prettier after updating the table of contents.

```js
import { remark } from 'remark'
import remarkToc from 'remark-toc'
import { read } from 'to-vfile'
import unifiedPrettier from 'unified-prettier'

const processor = remark.use(remarkToc).use(unifiedPrettier)
const file = await read('README.md')

const { value } = await processor.process(file)

console.log(value)
```

## API

The default export is a [unified](https://unifiedjs.com) plugin.

### Options

This plugin accepts Prettier [options](https://prettier.io/docs/en/options.html). By default it uses
the options from the Prettier [configuration file](https://prettier.io/docs/en/configuration.html).

## Related projects

- [`prettier`](https://prettier.io) is an opiniated code formatter.
- [`unified`](https://unifiedjs.com) is a tool that transforms content with plugins.
- [`unified-consistency`](https://github.com/remcohaszing/unified-consistency) can be used to report
  output inconsistencies.

## Compatibility

This project is compatible with Node.js 16 or greater, Prettier 3, and unified 11.

## Acknowledgements

Thanks to [@JounQin](https://github.com/JounQin) for giving me the npm package name.

## License

[MIT](LICENSE.md) © [Remco Haszing](https://github.com/remcohaszing)
