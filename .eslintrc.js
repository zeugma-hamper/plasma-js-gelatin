module.exports = {
  'extends': ['eslint:recommended', 'google'],
  'env': {
    'node': true,
    'es6': true,
  },
  'rules': {
    'indent': ['error', 2],
    // TEMPORARY rule.  Everything ought to be annotated with jsdoc.
    'require-jsdoc': 'off',
    'no-console': 'off',
  }
};
