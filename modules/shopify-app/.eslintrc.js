module.exports = {
  'env': {
    'es6': true,
    'mocha': true,
    'node': true
  },
  'plugins': [
    'promise',
    'security'
  ],
  'extends': [
    'eslint:recommended',
    'plugin:promise/recommended',
    'plugin:security/recommended',
    'plugin:react/recommended'
  ],
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'sourceType': 'module',
    'ecmaVersion': 2018
  },
  'settings': {
    'react': {
      'version': 'detect'
    }
  },
  'rules': {
    'indent': [
      'error',
      2, {
        'SwitchCase': 1,
        'ignoredNodes': [
          'TemplateLiteral'
        ]
      }
    ],
    'linebreak-style': [
      'off',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'no-console': [
      'off'
    ],
    'object-curly-spacing': [
      'error',
      'always', {
        'arraysInObjects': true,
        'objectsInObjects': true,
      }
    ],
    'array-bracket-spacing': [
      'error',
      'always'
    ],
    'key-spacing': 'error',
    'block-spacing': [
      'error',
      'always'
    ],
    'comma-spacing': 'error',
    'template-tag-spacing': [
      'error',
      'never'
    ],
    'object-shorthand': 'error',
    'security/detect-object-injection': 'off',
    'no-unused-vars': [
      'error', {
        'args': 'none'
      } ],
    'arrow-spacing': 'error',
    'space-before-blocks': 'error',
    'keyword-spacing': 'error',
    'react/prop-types': 'off',
    'eol-last': 'error',
  }
}
