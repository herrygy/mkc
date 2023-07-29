module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    'vue/setup-compiler-macros': true
  },
  extends: [
    'plugin:vue/essential',
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 13,
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: [
    'vue',
    '@typescript-eslint'
  ],
  rules: {
    'no-unused-vars': 'off',
    "vue/no-multiple-template-root": 0,
    'no-undef': "off",
    'vue/multi-word-component-names': 0,
    "eqeqeq": "off",
    "vue/no-v-model-argument": 0,
  }
}
