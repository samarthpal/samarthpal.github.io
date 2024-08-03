module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['build', '.eslintrc.cjs'],
  parserOptions: {
    requireConfigFile: false, // Use if you don't have a Babel config file
    babelOptions: {
      presets: ['@babel/preset-react'] // Include Babel presets/plugins you are using
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  settings: { react: { version: 'detect' } },
  plugins: ['react', 'react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'warn',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/prop-types': 'off',
    'no-unused-vars': 'warn'
  }
}
