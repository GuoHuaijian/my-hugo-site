# 快速开始

## 环境要求

| 工具 | 版本要求 |
|------|---------|
| JDK | 21+ |
| Maven | 3.8.1+ |
| MySQL | 8.0+（示例工程需要） |
| Redis | 6.0+（示例工程需要） |

## 1. 克隆仓库

```bash
git clone https://github.com/GuoHuaijian/SlothBoot.git
cd sloth-boot
```

## 2. 构建全量模块

```bash
mvn clean verify
```

## 3. 启动示例工程

```bash
# 修改 example 配置文件中的 MySQL / Redis 地址
vim sloth-boot-example/sloth-boot-example-service/src/main/resources/application.yml

# 启动
mvn -pl sloth-boot-example/sloth-boot-example-service spring-boot:run
```

## 4. 验证运行

```bash
# 健康检查
curl http://localhost:8080/actuator/health

# API 文档
open http://localhost:8080/doc.html
```

## 5. Docker 一键启动（推荐）

```bash
# 一键启动 MySQL + Redis + 示例服务
docker-compose up -d

# 查看日志
docker-compose logs -f sloth-example
```

启动后访问：
- 健康检查: http://localhost:8080/actuator/health
- API 文档: http://localhost:8080/doc.html
- AI 对话: http://localhost:8080/ai/chat?prompt=你好

## 推荐阅读顺序

`common-core` → `starter-web` → `starter-redis` → `starter-mybatis` → `example-service`

## Maven 集成

### 方式一：继承 sloth-boot-parent

```xml
<parent>
    <groupId>com.sloth.boot</groupId>
    <artifactId>sloth-boot-parent</artifactId>
    <version>${sloth.version}</version>
</parent>
```

### 方式二：引入 BOM

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.sloth.boot</groupId>
            <artifactId>sloth-boot-dependencies</artifactId>
            <version>${sloth.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 按需引入 Starter

```xml
<!-- 最精简：只需要统一返回和异常处理 -->
<dependency>
    <groupId>com.sloth.boot</groupId>
    <artifactId>sloth-boot-starter-web</artifactId>
</dependency>

<!-- 标准 Web 应用 -->
<dependency>
    <groupId>com.sloth.boot</groupId>
    <artifactId>sloth-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>com.sloth.boot</groupId>
    <artifactId>sloth-boot-starter-mybatis</artifactId>
</dependency>
<dependency>
    <groupId>com.sloth.boot</groupId>
    <artifactId>sloth-boot-starter-redis</artifactId>
</dependency>
<dependency>
    <groupId>com.sloth.boot</groupId>
    <artifactId>sloth-boot-starter-auth</artifactId>
</dependency>
```
