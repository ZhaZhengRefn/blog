# Types and Expressions

## Soundness and Completeness
类型检查的有两种方式，称之为soundness与completeness。
soundness表示类型检查器会检查表达式所有有可能出现的值的类型，虽然结果可能会过于臃肿、过程会比较繁琐，但是能检查会当前运行时没有发现的Bug。
completeness表示类型检查器只会检查在当前运行时发生的Bug。而这种方式可能会为Bug留下伏笔。
而Flow在这两种方式中进行了一定的取舍，尽量做到尽善尽美。

## 