---
title: Nginx 常用命令速查
---

## 服务管理

```bash
# 启动
nginx
systemctl start nginx

# 停止
nginx -s stop
systemctl stop nginx

# 优雅停止
nginx -s quit

# 重新加载配置
nginx -s reload
systemctl reload nginx

# 重启
systemctl restart nginx
```

## 配置检查

```bash
# 测试配置是否正确
nginx -t

# 查看编译参数
nginx -V

# 查看版本
nginx -v
```

## 日志查看

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log

# 统计访问量
awk '{print $1}' access.log | sort | uniq -c | sort -rn

# 统计 404 错误
awk '$9 == 404 {print $7}' access.log | sort | uniq -c | sort -rn

# 统计 IP 访问 Top 10
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10
```

## 常用配置片段

```nginx
# 反向代理
location /api/ {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# 静态资源
location /static/ {
    root /var/www/html;
    expires 30d;
}

# HTTPS 配置
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}

# HTTP 跳转 HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```
