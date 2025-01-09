// eslint-disable-next-line import/no-commonjs
module.exports = {
  root: true,
  extends: ['@modern-js-app'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['../tsconfig.json'],
  },
  rules: {
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'max-lines': 'off',
    'no-case-declarations': 'off',
  },
};
