---
title: "文本处理"
---

# 文本处理命令

## 搜索与过滤

```bash
# 搜索包含关键词的行
grep "error" logfile.txt

# 忽略大小写
grep -i "error" logfile.txt

# 显示行号
grep -n "error" logfile.txt

# 递归搜索目录
grep -r "TODO" ./src
```

## 流编辑器 sed

```bash
# 替换文本
sed 's/old/new/g' file.txt

# 删除空行
sed '/^$/d' file.txt

# 原地修改文件
sed -i 's/old/new/g' file.txt
```

## 文本处理 awk

```bash
# 打印第一列
awk '{print $1}' file.txt

# 过滤条件
awk '$3 > 100 {print $1, $3}' data.csv

# 计算总和
awk '{sum += $1} END {print sum}' numbers.txt
```

## 查找与处理

```bash
# 查找并执行命令
find . -name "*.log" -exec rm {} \;

# 查找并替换
find . -name "*.txt" -exec sed -i 's/old/new/g' {} \;

# 统计行数
wc -l file.txt

# 排序去重
sort file.txt | uniq
```
