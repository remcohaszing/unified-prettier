import config from '@remcohaszing/eslint'

export default [
  ...config,
  {
    rules: {
      'func-style': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'n/no-extraneous-import': 'off',
      'unicorn/require-post-message-target-origin': 'off'
    }
  }
]
