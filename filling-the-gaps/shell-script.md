# Shell Script

## 变量的设置规则
1. 语法:
变量名仅包含英文与数字。变量值不能包含空格符，如需要加上空格符则使用引号。
```sh
myname="This is myname."
```
2. 拼接变量
拼接变量可使用单引号（`）或$
```sh
version=`(uname -r)`
PATH=$PATH:/usr/local/hello
```
3. 导出变量
```sh
export PATH
```
4. 取消变量
```sh
unset myname
```

## 环境变量
1. env:
```env```可以导出所有的环境变量。解析如下（仅记录认为用处比较大的例子）：
- PATH:执行文件查找的路径，常见于配置AndroidSDK路径，rvm包路径等等
- RANDOM:0~32767之间的随机数
2. set:
```set```可以导出当前的所有变量。解析如下：
- $: ```echo $$```可以输出当前shell的pid
- ?: ```echo $?```可以输出上一条命令的回传码。假如成功则为0，失败则为对应的错误码。
3. export:
```export xxxx```可以将自定义变量导出为环境变量。常见于开启子进程时，子进程会继承父进程的环境变量，但不会继承自定义变量。为了传递变量，可以将自定义变量导出为环境变量。
```export```

## read与declare
1. read:
```read```可以与用户交互，读取键盘输入
- -p: 接提示符
- -t: 输入超时时间
2. declare:
其参数包含：
- -a: 声明变量为数组。shell script的数组Index以1开始。
- -i: 声明变量为数字。
```sh
#未声明为数字时，默认为字符串类型
sum=1+2+3
echo $sum
#1+2+3
```
```sh
#声明为数字时
declare -i sum
sum=1+2+3
echo $sum
#6
```
- -x: 与export作用相同
- -r: 设置为readonly