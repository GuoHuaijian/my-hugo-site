---
title: MySQL 常用命令速查
---

## 连接与基础

```bash
# 连接数据库
mysql -u root -p
mysql -h 127.0.0.1 -P 3306 -u root -p

# 查看数据库
SHOW DATABASES;

# 使用数据库
USE mydb;

# 查看表
SHOW TABLES;

# 查看表结构
DESC table_name;
SHOW CREATE TABLE table_name;
```

## 数据操作

```sql
-- 备份数据库
mysqldump -u root -p mydb > backup.sql

-- 恢复数据库
mysql -u root -p mydb < backup.sql

-- 备份单表
mysqldump -u root -p mydb table_name > table.sql

-- 导入 SQL 文件
source /path/to/file.sql;
```

## 用户与权限

```sql
-- 创建用户
CREATE USER 'app'@'%' IDENTIFIED BY 'password';

-- 授权
GRANT ALL PRIVILEGES ON mydb.* TO 'app'@'%';
GRANT SELECT, INSERT ON mydb.* TO 'app'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 查看用户权限
SHOW GRANTS FOR 'app'@'%';

-- 删除用户
DROP USER 'app'@'%';
```

## 性能分析

```sql
-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query%';

-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';

-- 查看执行计划
EXPLAIN SELECT * FROM users WHERE id = 1;

-- 查看索引
SHOW INDEX FROM table_name;

-- 查看当前连接
SHOW PROCESSLIST;

-- 查看表大小
SELECT table_name, 
       ROUND(data_length / 1024 / 1024, 2) AS 'data_mb',
       ROUND(index_length / 1024 / 1024, 2) AS 'index_mb'
FROM information_schema.tables
WHERE table_schema = 'mydb'
ORDER BY data_length DESC;
```

## 常用查询

```sql
-- 分页查询
SELECT * FROM users LIMIT 10 OFFSET 20;

-- 去重统计
SELECT COUNT(DISTINCT user_id) FROM orders;

-- 分组统计
SELECT status, COUNT(*) FROM orders GROUP BY status;

-- 时间查询
SELECT * FROM orders WHERE created_at >= '2024-01-01';

-- 批量插入
INSERT INTO users (name, email) VALUES 
  ('Alice', 'alice@example.com'),
  ('Bob', 'bob@example.com');
```
