module.exports = [
  {
    ignores: ['node_modules/**', 'public/**', '.cache/**'],
  },
  {
    files: ['bin/**/*.js', 'src/**/*.js', 'test/**/*.js', 'gatsby-*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        URL: 'readonly',
        URLSearchParams: 'readonly',
        console: 'readonly',
        crypto: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        process: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        window: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['bin/**/*.js', 'gatsby-*.js', 'test/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        __dirname: 'readonly',
        exports: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
      },
    },
  },
]
