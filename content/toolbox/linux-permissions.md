---
title: "权限管理"
---

# 权限管理命令

## 查看权限

```bash
ls -la
# drwxr-xr-x  2 user group 4096 Jan 1 12:00 dir
# -rw-r--r--  1 user group  256 Jan 1 12:00 file.txt
```

权限位说明：`rwx` = 读(4) 写(2) 执行(1)

## 修改权限

```bash
# 数字方式
chmod 755 script.sh    # rwxr-xr-x
chmod 644 config.txt   # rw-r--r--

# 符号方式
chmod +x script.sh     # 添加执行权限
chmod u+w file.txt     # 用户添加写权限
chmod go-r file.txt    # 组和其他移除读权限
```

## 修改所有者

```bash
# 修改文件所有者
chown user:group file.txt

# 递归修改目录
chown -R user:group /path/to/dir
```

## sudo

```bash
# 以 root 权限执行
sudo command

# 切换到 root 用户
sudo -i
```
