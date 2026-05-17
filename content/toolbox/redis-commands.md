---
title: Redis 常用命令速查
---

## 连接与服务

```bash
# 连接 Redis
redis-cli
redis-cli -h 127.0.0.1 -p 6379 -a password

# 启动服务
redis-server /etc/redis/redis.conf

# 查看服务状态
redis-cli ping

# 查看信息
redis-cli INFO
redis-cli INFO memory
redis-cli INFO clients
```

## String 类型

```bash
# 设置 / 获取
SET key value
GET key

# 批量操作
MSET k1 v1 k2 v2
MGET k1 k2

# 计数器
INCR counter
DECR counter
INCRBY counter 10

# 设置过期时间
SET key value EX 3600
EXPIRE key 3600
TTL key
```

## Hash 类型

```bash
# 设置 / 获取
HSET user:1 name "张三" age 25
HGET user:1 name
HMGET user:1 name age

# 获取所有字段
HGETALL user:1
HKEYS user:1
HVALS user:1

# 自增
HINCRBY user:1 score 10
```

## List 类型

```bash
# 左右推入
LPUSH mylist "a"
RPUSH mylist "b"

# 弹出
LPOP mylist
RPOP mylist

# 范围查询
LRANGE mylist 0 -1
LRANGE mylist 0 10

# 获取长度
LLEN mylist
```

## Set / ZSet 类型

```bash
# Set
SADD tags "java" "spring" "redis"
SMEMBERS tags
SISMEMBER tags "java"
SCARD tags

# ZSet（有序集合）
ZADD leaderboard 100 "Alice" 80 "Bob"
ZRANGE leaderboard 0 -1 WITHSCORES
ZREVRANGE leaderboard 0 9 WITHSCORES
ZINCRBY leaderboard 10 "Alice"
```

## 管理与维护

```bash
# 查看所有 key
KEYS *
KEYS user:*

# 删除 key
DEL key1 key2

# 查看 key 类型
TYPE key

# 数据库操作
SELECT 1
DBSIZE
FLUSHDB
FLUSHALL

# 持久化
SAVE        # 同步
BGSAVE      # 异步

# 慢查询日志
SLOWLOG GET 10
SLOWLOG LEN
```

## 发布订阅

```bash
# 订阅频道
SUBSCRIBE channel

# 发布消息
PUBLISH channel "hello"
```
