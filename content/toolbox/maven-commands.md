---
title: Maven 常用命令速查
---

## 项目构建

```bash
# 清理 + 编译
mvn clean compile

# 清理 + 打包（跳过测试）
mvn clean package -DskipTests

# 清理 + 安装到本地仓库
mvn clean install -DskipTests

# 打包为可执行 JAR
mvn clean package spring-boot:repackage
```

## 依赖管理

```bash
# 查看依赖树
mvn dependency:tree

# 查看依赖冲突
mvn dependency:tree -Dverbose

# 下载源码
mvn dependency:sources

# 排除某个依赖
mvn dependency:tree -Dincludes=org.springframework:*
```

## 测试

```bash
# 运行所有测试
mvn test

# 运行单个测试类
mvn test -Dtest=MyTest

# 运行单个测试方法
mvn test -Dtest=MyTest#myMethod

# 跳过测试
mvn package -DskipTests
```

## 发布

```bash
# 发布到本地仓库
mvn install

# 发布到远程仓库
mvn deploy

# 版本升级
mvn versions:set -DnewVersion=1.2.0
```

## 其他

```bash
# 查看插件信息
mvn help:describe -Dplugin=compiler

# 生成站点文档
mvn site

# 检查依赖更新
mvn versions:display-dependency-updates
```
