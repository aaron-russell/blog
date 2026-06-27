const tsParser = require('@typescript-eslint/parser')

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'public/**', '.astro/**', '.cache/**'],
  },
  {
    files: [
      'astro.config.mjs',
      'bin/**/*.js',
      'functions/**/*.js',
      'src/**/*.{js,mjs}',
      'test/**/*.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
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
    files: ['functions/**/*.ts', 'src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
      },
      sourceType: 'module',
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
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['bin/**/*.js', 'test/**/*.js'],
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
