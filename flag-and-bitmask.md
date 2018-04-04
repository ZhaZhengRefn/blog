# 标志位与掩码

## 背景：

### 1.标志位
例如有4个标志位： 
- 标志位A: 我们有ant
- 标志位B: 我们有bat
- 标志位C: 我们有cat
- 标志位D: 我们有dog

当一个位被置位时，他的值为1，相反被清除时，他的值为0。
现在我们以位序列DCBA表示我们拥有的动物的标志位：
```js
const flag = 7//(7).toString(2) ===> 0111，表示拥有ABC
```

### 2.掩码
```js
const FLAG_A = parseInt('0001', 2)//1
const FLAG_B = parseInt('0010', 2)//2
const FLAG_C = parseInt('0100', 2)//4
const FLAG_D = parseInt('1000', 2)//8
```

### 3.标志位的多种操作
1. 置位多个标志位:
```js
const flag = FLAG_A | FLAG_B//拥有ant 与 bat
```
2. 判断某个标志位是否被置位:
```js
const flag = 12//1100
// 是否拥有dog
const hasFlagD = flag & FLAG_D
// 拥有ant或dog之一
const mask = FLAG_A || FLAG_D
const hasFlagAorD = flag & mask
```
3. 清除标志位:
```js
// 非运算得出清除标志位的掩码
const mask = ~(FLAG_A | FLAG_C)//0101 => 1010
// 与运算清除标志位
const flag = 11//1011
const clear = flag & mask// 1011 & 1010 => 1010
```
4. 切换标志位:
```js
const mask = FLAG_A | FLAG_C//0101
const flag = 4//0100
const switchFlag = flag ^ mask//0100 ^ 0101 => 0001
```