---
title: "文件与目录"
---

# 文件与目录命令

## 列出文件

```bash
# 列出当前目录
ls

# 详细列表（权限、大小、时间）
ls -la

# 按时间排序
ls -lt
```

## 目录操作

```bash
# 切换目录
cd /path/to/dir

# 创建目录
mkdir -p a/b/c

# 删除目录（递归）
rm -rf dir/
```

## 文件操作

```bash
# 复制文件
cp file.txt /dest/

# 移动/重命名
mv old.txt new.txt

# 查看文件内容
cat file.txt

# 分页查看
less file.txt
```

## 查找文件

```bash
# 按名称查找
find /path -name "*.txt"

# 按大小查找（大于 100MB）
find /path -size +100M
```
