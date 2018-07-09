import babel from 'rollup-plugin-babel';

export default {
  input: './test/test-observer.js',
  output: {
    file: './dist/test-observer.js',
    format: 'cjs'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**' // 只编译我们的源代码
    })
  ]
};