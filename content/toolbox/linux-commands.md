---
title: Linux 常用命令速查
---

## 文件与目录

```bash
# 查看当前目录
ls -la
ls -lh

# 切换目录
cd /path/to/dir
cd ~
cd ..

# 创建 / 删除
mkdir -p /path/to/dir
rm -rf /path/to/dir
rm -f file.txt

# 复制 / 移动
cp -r source/ dest/
mv old.txt new.txt

# 查找文件
find / -name "*.log"
find . -type f -size +100M
```

## 文本处理

```bash
# 查看文件
cat file.txt
tail -f app.log
tail -n 100 app.log

# 搜索内容
grep -rn "keyword" /path/
grep -i "error" app.log

# 统计行数
wc -l file.txt

# 查看前/后 N 行
head -n 20 file.txt
tail -n 20 file.txt
```

## 权限管理

```bash
# 修改权限
chmod 755 script.sh
chmod +x script.sh

# 修改所有者
chown user:group file.txt

# 使用 sudo
sudo command
```

## 进程管理

```bash
# 查看进程
ps -ef | grep java
ps aux

# 查看资源占用
top
htop

# 结束进程
kill -9 <pid>
killall java

# 系统服务
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
systemctl status nginx
systemctl enable nginx
```

## 网络

```bash
# 查看端口占用
netstat -tlnp | grep 8080
ss -tlnp | grep 8080

# 下载文件
curl -O https://example.com/file.zip
wget https://example.com/file.zip

# SSH 连接
ssh user@host
ssh -p 2222 user@host

# 测试端口连通性
telnet host 8080
nc -zv host 8080
```

## 磁盘与内存

```bash
# 磁盘使用
df -h
du -sh /path/

# 内存使用
free -h

# CPU 信息
lscpu
```
