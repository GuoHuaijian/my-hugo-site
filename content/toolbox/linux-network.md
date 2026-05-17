---
title: "网络工具"
---

# 网络工具命令

## HTTP 请求

```bash
# 发送 GET 请求
curl https://api.example.com

# 发送 POST 请求
curl -X POST -H "Content-Type: application/json" \
  -d '{"key": "value"}' https://api.example.com

# 下载文件
wget https://example.com/file.zip
curl -O https://example.com/file.zip
```

## 网络诊断

```bash
# 测试连通性
ping google.com

# 追踪路由
traceroute google.com

# 端口扫描
nmap 192.168.1.1

# DNS 查询
dig example.com
nslookup example.com
```

## 查看网络状态

```bash
# 查看监听端口
netstat -tulpn
ss -tulpn

# 查看网络连接
netstat -an

# 查看 IP 地址
ip addr
ifconfig
```

## SSH

```bash
# 远程登录
ssh user@host

# 指定端口
ssh -p 2222 user@host

# 端口转发
ssh -L 8080:localhost:3000 user@host

# 密钥登录
ssh -i ~/.ssh/id_rsa user@host
```
