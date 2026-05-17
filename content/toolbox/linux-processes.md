---
title: "进程管理"
---

# 进程管理命令

## 查看进程

```bash
# 查看所有进程
ps aux

# 查看特定进程
ps aux | grep nginx

# 实时查看（类似任务管理器）
top

# 增强版 top
htop
```

## 终止进程

```bash
# 优雅终止
kill <PID>

# 强制终止
kill -9 <PID>

# 按名称终止
pkill nginx
killall nginx
```

## 服务管理 (systemd)

```bash
# 启动/停止/重启服务
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx

# 查看服务状态
systemctl status nginx

# 查看所有服务
systemctl list-units --type=service
```

## 后台运行

```bash
# 后台运行
nohup command &

# 查看后台任务
jobs

# 切换到前台
fg %1
```
