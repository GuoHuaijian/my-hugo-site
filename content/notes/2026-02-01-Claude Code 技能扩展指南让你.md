---
title: "Claude Code 技能扩展指南：让你的 AI 编码助手更强大"
date: "2026-02-01"
author: "Guo"
tags: ["Claude Code", "Skills", "工具"]
cover: "/content/covers/2026-02-01-Claude Code 技能扩展指南让你.png"
---


在日常开发中，我尝试过不少AI编程工具——GitHub Copilot、Cursor、Trae、Kiro……每个都有自己的亮点：有的补全快如闪电，有的理解上下文很深，有的对中文场景特别友好。

但用着用着，我发现一个关键真相：**模型的原始能力很重要，但真正决定代码质量的，往往是配置的深度和上下文的丰富度**。

一个被精心调教过的“第二梯队”模型，完全能稳定输出风格统一、考虑周全、生产可用的代码——甚至在很多场景下，干得比没配置好的顶级模型还漂亮。更重要的是，市场上的顶级模型（Claude、GPT、Gemini 等）价格普遍偏贵，而通过深度配置，二线模型的性价比往往更高。

正因如此，我日常主力组合是 **Claude Code + GLM4.7**：Claude Code 提供强大的交互和技能扩展能力，GLM4.7 则在中文理解、长上下文和成本上极具优势，性价比和综合能力都很舒服，
有时候也会根据日常任务的特点切换不同的模型和工具。最近深入玩 Claude Code 时，我发现它的 **Skills（技能）功能** 特别强大：你可以自定义一套“专属规则”，让 Claude 严格按你的风格写代码、自动化流程、甚至生成可视化报告。

今天我就把官方文档精炼+实战化，带大家从零上手 Claude Code 的技能系统。看完这篇，你就能给自己配出一个真正听话、高效的 AI 编码搭档。

> 官方文档：[https://code.claude.com/docs/zh-CN/skills](https://code.claude.com/docs/zh-CN/skills)  
> 建议配合官方文档食用，这篇是精简版+实战向解读。

## 什么是 Skills？

Skills 是 Claude Code 的扩展机制，允许你通过一个 `SKILL.md` 文件给 Claude 添加「专属技能」。这些技能可以是：

- **参考知识**：代码规范、架构指南、领域知识（Claude 会自动参考）
- **任务流程**：代码审查、提交、部署、生成报告等（可以用斜杠命令直接触发）

本质上，你写一份 Markdown 说明，Claude 就会把它当作「工具」来使用。支持自动触发（Claude 觉得合适时自己用）或手动调用（`/skill-name`）。

Skills 遵循开放标准 [Agent Skills](https://agentskills.io)，还能扩展子代理、动态上下文注入、脚本执行等高级功能。

## 快速上手：创建你的第一个技能

我们来做一个简单例子——「用类比和图表解释代码」的技能。

### 步骤 1：创建技能目录（个人技能，跨项目可用）

```bash
mkdir -p ~/.claude/skills/explain-code
```

### 步骤 2：编写 SKILL.md

```yaml
---
name: explain-code
description: 用视觉图表和生活类比解释代码。当用户问“这个代码怎么工作？”时使用。
---

解释代码时，请始终包含：

1. **生活类比**：把代码比作日常生活中的事情
2. **ASCII 图表**：展示流程、结构或关系
3. **逐行讲解**：一步步说明执行过程
4. **常见陷阱**：指出容易出错的地方

保持语气轻松对话式，复杂概念可以用多个类比。
```

### 步骤 3：测试

- 自动触发：直接问 Claude “这个函数怎么工作？”
- 手动触发：输入 `/explain-code src/utils.ts`

Claude 就会按你的模板输出带类比 + 图表的解释。

## 技能存放位置与作用域

| 位置     | 路径                                    | 作用范围          |
|----------|-----------------------------------------|-------------------|
| 个人     | `~/.claude/skills/<name>/SKILL.md`      | 所有项目可用      |
| 项目     | `.claude/skills/<name>/SKILL.md`        | 当前项目专用      |
| 企业     | 通过托管设置配置                        | 组织内所有成员    |
| 插件     | 插件目录下的 skills                     | 启用插件时可用    |

项目技能会覆盖同名的个人技能，非常适合 monorepo 中不同包有各自规范的场景。

## 技能配置核心：YAML 前置元数据

SKILL.md 开头可以用 YAML 配置行为：

```yaml
---
name: my-skill                  # 斜杠命令名称，不写默认用文件夹名
description: 技能作用描述       # 强烈建议写！Claude 靠它决定是否自动触发
disable-model-invocation: true # true = 只有用户能手动触发，防止 Claude 乱跑
user-invocable: false          # false = 隐藏在 / 菜单中，只有 Claude 能自动用
allowed-tools: Read, Grep      # 技能激活时允许使用的工具
context: fork                  # 在子代理中运行（隔离上下文）
agent: Explore                 # 指定子代理类型
---
```

常用组合：

- 想手动控制部署、提交等危险操作 → 加 `disable-model-invocation: true`
- 纯背景知识（如旧系统文档） → 加 `user-invocable: false`

## 参数传递与动态上下文

调用技能时可以带参数：

```
/fix-issue 123
```

在 SKILL.md 中用 `$ARGUMENTS` 接收：

```markdown
修复 GitHub issue $ARGUMENTS，遵循我们的编码规范……
```

更高级的玩法：用 `` !`shell 命令` `` 注入实时数据（命令会在技能运行前执行，输出替换占位符）

```markdown
- PR 变更：!`gh pr diff`
- 评论：!`gh pr view --comments`
```

这样 Claude 就能拿到最新的 PR 内容来总结。

## 支持文件与复杂技能

一个技能目录可以放多个文件，保持主 SKILL.md 简洁：

```
my-skill/
├── SKILL.md
├── reference.md      # 详细规范
├── examples.md       # 使用示例
└── scripts/
    └── visualize.py  # 可执行脚本
```

在主文件中引用它们，Claude 需要时才会加载，避免上下文爆炸。

## 高亮案例：生成交互式代码库可视化

官方给了一个超酷的例子——生成一个可交互的代码库树状图 HTML（带文件大小、类型颜色、折叠目录）。

技能里只写：

```markdown
运行以下脚本生成可视化：
python ~/.claude/skills/codebase-visualizer/scripts/visualize.py .
```

脚本用纯 Python（无第三方依赖）扫描项目，生成自包含 HTML 并自动打开浏览器。效果非常惊艳，特别适合接手新项目时快速概览结构。

这类「技能 + 脚本」的组合，能实现远超普通提示的视觉输出：依赖图、测试覆盖报告、数据库 ER 图……

## 常见问题与调优建议

1. **技能不触发** → 优化 `description`，让它包含用户常用关键词；或者直接用 `/` 手动调用测试。
2. **触发太频繁** → 描述写得更具体，或加 `disable-model-invocation: true`。
3. **技能太多上下文超限** → 只加载描述，完整内容调用时才加载；必要时调大环境变量 `SLASH_COMMAND_TOOL_CHAR_BUDGET`。

## 总结

Claude Code 的 Skills 机制把「AI 助手」真正变成了「可编程的团队成员」。通过几行 Markdown + 可选脚本，你就能：

- 强制统一团队代码风格
- 自动化重复流程
- 注入项目专属知识
- 生成丰富的视觉报告

强烈推荐每个人都建几个常用技能（代码审查、提交信息生成、架构解释），用着用着你就离不开它了。

如果你还在用普通 Chat 界面写代码，试试 Claude Code + Skills，生产力会起飞！

欢迎在评论区分享你写的有趣技能～

（完）

## 彩蛋：分享几个Skills和CLAUDE.md模版

1. 全局级CLAUDE.md
```markdown
# 角色

Java 后端开发工程师

## 技术栈

- 语言：Java 8+
- 框架：Spring Boot、Spring Cloud、MyBatis-Plus
- 数据库：MySQL、Redis
- 构建：Maven
- 其他：偶尔涉及 Vue 前端

## 开发规范

- 遵循阿里巴巴 Java 开发规范
- 遵循 SOLID 设计原则
- 遵循代码整洁之道和重构原则
- 注重代码可读性和可维护性

---

# 交流偏好

- 使用中文交流
- 代码注释使用中文
- 变量、方法、类命名使用英文
- 技术术语保持英文原文

---

# 回复要求

- 简洁直接，不要寒暄和废话
- 代码变更时简述修改原因
- 多文件修改时先说整体思路
- 多种方案时给出推荐及理由
- 不确定时主动询问而非假设
- 不要重复我的问题
- 不要解释基础概念除非我要求

---

# 编码偏好

- 缩进使用 4 空格
- 行宽不超过 120 字符
- 使用 Lombok 减少样板代码
- 使用 Optional 处理可空返回值
- 使用 Stream API 处理集合
- 使用 LocalDateTime 处理时间
- 日志使用 SLF4J

---

# 工作习惯

- 修改前先理解现有代码
- 保持与项目现有风格一致
- 小步迭代，每次只做一件事
- 重要改动先确认方案

---

# 工具

- 构建：Maven
- 版本控制：Git
- IDE：IntelliJ IDEA

---

# 代码文档与注释规范

## 类注释规范

- **所有新建的类必须有类级 Javadoc**
- 注释需包含：类说明、作者、创建日期
- 工具类 / 通用组件类需额外说明使用场景，简单使用示例

## 方法注释规范

- 对外暴露的方法（public / protected）**必须有 Javadoc**
- 注释需说明：
  - 方法用途
  - 关键参数含义
  - 返回值语义
  - 异常（如有）

## 关键逻辑注释原则

- 复杂判断、业务规则、算法步骤必须有行内说明
- 注释解释“为什么这样做”，而不是“代码在做什么”
- 避免废话式注释（如：// set value）
- 不要使用尾行注释
```

2. 项目级CLAUDE.md
```markdown
# 项目名称

<!-- 一句话描述项目用途 -->

## 技术栈

| 类型 | 技术 | 版本 |
|------|------|------|
| 语言 | Java | 17 |
| 框架 | Spring Boot | 3.2.x |
| ORM | MyBatis-Plus | 3.5.x |
| 数据库 | MySQL | 8.0 |
| 缓存 | Redis | 7.x |
| 构建 | Maven | 3.9.x |

## 项目结构

## 常用命令

## 模块说明

| 模块 | 说明 | 负责人 |
|------|------|--------|
| user | 用户管理 | - |
| order | 订单管理 | - |

## 环境信息

| 环境 | 地址 | 备注 |
|------|------|------|
| 开发 | localhost:8080 | - |
| 测试 | - | - |
| 生产 | - | - |

## 核心流程

<!-- 描述关键业务流程，帮助理解项目 -->

## 外部依赖

<!-- 列出依赖的外部服务、中间件、第三方 API -->

## 开发规范

项目遵循以下规范，详见 `.claude/skills/` 目录：

- `ali-java-style.md` - 阿里 Java 规范
- `spring-mybatis-web.md` - Spring + MyBatis 规范
- `database-design.md` - 数据库设计规范
- `refactor-clean-code.md` - 重构与整洁代码

## 项目约定

<!-- 本项目特有的约定，不在通用规范中的内容 -->

## 待办事项

<!-- 项目级别的技术债务或待优化项 -->

- [ ] 

---

# 当前任务

<!-- 记录正在进行的任务，方便上下文恢复 -->

## 任务描述

## 相关文件

## 进度

## 备注

```

3. 阿里巴巴Java开发规范
```markdown
---
name: ali-java-guide
description: 阿里巴巴 Java 开发规范。当编写、修改或审查任何 Java 代码时自动应用，确保命名、格式、OOP 规范、异常处理、日志、并发、安全等符合阿里标准。
---

# 阿里巴巴 Java 开发规范

## 命名

- 类名使用 UpperCamelCase
- 方法名、变量名使用 lowerCamelCase
- 常量使用 UPPER_SNAKE_CASE
- 包名全小写单数形式
- 抽象类使用 Abstract 或 Base 开头
- 异常类使用 Exception 结尾
- 测试类使用 Test 结尾
- 实体类按用途添加后缀：DO/DTO/VO/BO/Query
- POJO 布尔属性不使用 is 开头
- Long 类型数值使用大写 L 后缀

## Service/DAO 方法命名

- 获取单个对象使用 get 或 query 前缀
- 获取多个对象使用 list 前缀
- 获取统计值使用 count 前缀
- 插入使用 save 或 insert 前缀
- 删除使用 remove 或 delete 前缀
- 修改使用 update 前缀

## 常量

- 不允许出现魔法值，必须定义为常量或枚举
- 常量按功能归类到不同的常量类中

## 格式

- 使用 4 个空格缩进，禁止使用 Tab
- 单行字符数不超过 120
- 左大括号前不换行，后换行
- 右大括号前换行，后有 else 等则不换行
- 禁止使用 import *，必须显式导入

## OOP

- 通过类名而非实例访问静态成员
- 所有覆写方法必须添加 @Override 注解
- 包装类型之间的比较使用 equals 方法
- POJO 类属性使用包装类型而非基本类型
- POJO 类必须实现 toString 方法
- 构造方法中禁止加入业务逻辑
- 使用 Objects.equals 比较对象避免 NPE
- 过时的类或方法添加 @Deprecated 注解并注明替代方案

## 日期时间

- 使用 LocalDateTime、LocalDate、LocalTime 处理日期时间
- 使用 DateTimeFormatter 格式化日期时间
- 禁止使用 java.util.Date 和 SimpleDateFormat

## 集合

- 创建集合时指定初始容量
- 作为 Map 键或 Set 元素的对象必须覆写 hashCode 和 equals
- 不在 foreach 循环中进行 add 或 remove 操作
- 使用 Iterator 或 Collection.removeIf 进行遍历删除
- 集合方法返回空集合而非 null
- 使用 Arrays.asList 返回的 List 不可进行 add 或 remove
- ArrayList 的 subList 结果不可强转为 ArrayList

## 并发

- 禁止使用 Executors 创建线程池，使用 ThreadPoolExecutor
- 线程池必须指定有界队列
- SimpleDateFormat 线程不安全，使用 DateTimeFormatter 替代
- 多个资源的加锁顺序保持一致
- 定时任务和异步任务内部必须捕获异常
- 高并发场景使用 LongAdder 替代 AtomicLong

## 控制语句

- if、for、while、do-while 必须使用大括号
- switch 语句必须包含 default 分支
- case 块必须以 break、return 或注释说明 fall through 结尾
- 条件嵌套不超过 3 层，使用卫语句提前返回
- 避免使用取反逻辑运算符

## 注释

- 类必须包含 Javadoc：说明、@author、@date
- 公共方法必须包含 Javadoc：说明、@param、@return、@throws
- 修改代码时同步更新相关注释
- 使用 `// TODO yyyy-MM-dd author: 描述` 格式标记待办
- 使用 `// FIXME yyyy-MM-dd author: 描述` 格式标记缺陷
- 删除无用代码而非注释掉

## 异常

- 禁止出现空的 catch 块，至少记录日志
- 捕获具体的异常类型而非 Exception
- 使用 try-with-resources 关闭资源
- finally 块中禁止使用 return
- 抛出异常时包含上下文信息
- 捕获异常后重新抛出时保留原始 cause
- 不使用异常控制业务流程
- 对外 API 不抛出未声明的异常

## 日志

- 使用 SLF4J 日志门面
- 使用占位符方式拼接日志：`log.info("id={}", id)`
- 记录异常时将异常对象作为最后一个参数
- 禁止在日志中输出敏感信息
- 生产环境禁止输出 DEBUG 级别日志
- 禁止使用 System.out 或 System.err 输出

## 安全

- 用户输入必须进行校验
- SQL 必须使用参数化查询，禁止拼接
- 页面输出用户数据必须进行转义
- 敏感数据禁止明文存储和传输
- 用户密码使用不可逆加密算法存储

## MySQL

- 表名、字段名使用小写字母加下划线
- 表必须包含 id、create_time、update_time 字段
- 逻辑删除字段使用 deleted，类型为 TINYINT
- 金额字段使用 DECIMAL 类型，禁止使用 FLOAT 或 DOUBLE
- 字符串字段使用 VARCHAR 并指定合适的长度
- 字段必须添加 COMMENT 注释
- 主键索引命名 pk_，唯一索引命名 uk_，普通索引命名 idx_
- 单表行数超过 500 万或容量超过 2GB 考虑分表

## SQL

- 禁止使用 SELECT *，必须明确指定字段
- 禁止使用左模糊查询 LIKE '%xxx'
- 禁止在索引列上进行函数运算
- 使用 ISNULL 判断 NULL 值
- 分页查询大偏移量时使用延迟关联或游标分页
- IN 子句中的元素数量控制在 1000 以内
- 禁止使用外键和级联，在应用层处理

## 分层

- Controller 只负责参数校验和调用 Service
- Service 负责业务逻辑和事务控制
- DAO/Mapper 只负责数据访问
- Controller 禁止直接调用 DAO/Mapper
- 下层禁止调用上层
- 同层之间可以相互调用
```
4. Spring-Boot开发实践
```markdown
---
name: spring-boot-best-practices
description: Spring Boot + MyBatis-Plus Web 项目开发最佳实践。当开发 Controller、Service、Mapper、Entity、配置类或处理请求、事务、校验、异常、缓存时使用。
---

# Spring Boot + MyBatis Web 开发规范

## 项目结构

- 按功能分层：controller、service、mapper、entity、dto、vo、config、common
- Controller 类放在 controller 包下，以 Controller 结尾
- Service 接口放在 service 包下，实现类放在 service.impl 包下
- Mapper 接口放在 mapper 包下，XML 文件放在 resources/mapper 下
- 配置类放在 config 包下，以 Config 结尾
- 工具类放在 util 包下，以 Utils 或 Util 结尾
- 常量类放在 constant 包下，以 Constant 结尾
- 枚举类放在 enums 包下，以 Enum 结尾
- 自定义异常放在 exception 包下

## 依赖注入

- 使用构造器注入，配合 @RequiredArgsConstructor
- 禁止使用 @Autowired 字段注入
- 被注入的字段声明为 private final
- 需要延迟加载时使用 @Lazy

## Controller

- 类上添加 @RestController 和 @RequestMapping
- 统一使用 /api/v1 作为路径前缀
- 使用 @GetMapping、@PostMapping 等明确 HTTP 方法
- 路径参数使用 @PathVariable
- 查询参数使用 @RequestParam 或 Query 对象
- 请求体使用 @RequestBody
- 入参对象添加 @Valid 或 @Validated 进行校验
- 返回统一响应对象 Result<T>
- 禁止在 Controller 中编写业务逻辑
- 禁止在 Controller 中直接调用 Mapper

## 参数校验

- 使用 javax.validation 注解进行参数校验
- 字符串非空使用 @NotBlank
- 对象非空使用 @NotNull
- 集合非空使用 @NotEmpty
- 数值范围使用 @Min、@Max 或 @Range
- 字符串长度使用 @Size 或 @Length
- 正则匹配使用 @Pattern
- 嵌套对象校验添加 @Valid
- 分组校验使用 groups 属性
- 自定义校验消息使用 message 属性

## 统一响应

- 定义统一响应类 Result<T> 包含 code、message、data 字段
- 成功响应 code 为 200
- 业务异常 code 使用自定义错误码
- 系统异常 code 为 500
- 提供静态工厂方法 success() 和 fail()

## 异常处理

- 定义业务异常类 BusinessException
- 业务异常包含错误码和错误消息
- 使用 @RestControllerAdvice 定义全局异常处理器
- 分别处理 BusinessException、参数校验异常、系统异常
- 参数校验异常返回第一个错误信息
- 系统异常记录完整堆栈日志
- 系统异常返回通用错误提示，不暴露内部信息

## Service

- 定义 Service 接口，提供 Impl 实现类
- 实现类添加 @Service 注解
- 方法入参使用 DTO 对象
- 方法返回使用 VO 对象或基本类型
- 业务校验失败抛出 BusinessException
- 查询方法添加 @Transactional(readOnly = true)
- 写操作方法添加 @Transactional(rollbackFor = Exception.class)
- 事务方法必须是 public
- 避免在事务方法中进行 RPC 调用或耗时操作
- 避免大事务，事务方法只包含必要的数据库操作

## 对象转换

- 使用 MapStruct 进行对象转换
- 定义 Converter 接口添加 @Mapper(componentModel = "spring")
- 提供 toVO、toEntity、toDTO 等转换方法
- 集合转换方法以 List 结尾
- 禁止手动逐字段 get/set 转换

## Entity

- 添加 @TableName 指定表名
- 主键字段添加 @TableId(type = IdType.ASSIGN_ID)
- 逻辑删除字段添加 @TableLogic
- 创建时间字段添加 @TableField(fill = FieldFill.INSERT)
- 更新时间字段添加 @TableField(fill = FieldFill.INSERT_UPDATE)
- 非表字段添加 @TableField(exist = false)
- 使用 @Data 注解生成 getter/setter

## Mapper

- 继承 BaseMapper<T>
- 添加 @Mapper 注解
- 简单查询使用 MyBatis-Plus 条件构造器
- 复杂查询在 XML 中编写 SQL
- 方法参数超过 1 个时使用 @Param 注解
- 返回单个对象的方法以 select、get、query 开头
- 返回集合的方法以 selectList、list 开头
- 返回数量的方法以 count 开头

## MyBatis XML

- 定义 Base_Column_List 片段列出所有查询字段
- 禁止使用 SELECT *
- 使用 <if> 进行条件判断
- 字符串判断同时检查 null 和空字符串
- 使用 <foreach> 进行集合遍历
- 批量插入的 collection 属性值为 list
- 使用 #{} 进行参数绑定，禁止使用 ${}
- 动态表名或列名必须使用时才使用 ${}，并确保参数来源安全

## 查询规范

- 使用 LambdaQueryWrapper 构建查询条件
- 使用 .select() 指定查询字段
- 条件查询使用 .eq()、.like()、.in() 等方法
- 条件方法第一个参数为 boolean，用于判断是否添加该条件
- 排序使用 .orderByDesc() 或 .orderByAsc()
- 分页使用 Page 对象
- 只查询单条使用 .one() 或 .getOne()
- 查询列表使用 .list() 或 .selectList()

## 分页

- 配置 MybatisPlusInterceptor 添加 PaginationInnerInterceptor
- 使用 Page<T> 作为分页参数
- 接口入参定义 pageNum 和 pageSize
- pageNum 从 1 开始
- pageSize 设置合理上限，如最大 100
- 返回 PageResult 包含 total、list、pageNum、pageSize

## 自动填充

- 实现 MetaObjectHandler 接口
- insertFill 方法填充 createTime 和 updateTime
- updateFill 方法填充 updateTime
- 使用 strictInsertFill 和 strictUpdateFill 方法

## 配置管理

- 通用配置放在 application.yml
- 环境相关配置放在 application-{env}.yml
- 敏感配置使用环境变量或配置中心
- 自定义配置使用 @ConfigurationProperties 绑定
- 配置类添加 @Configuration 和 @EnableConfigurationProperties

## 日期时间处理

- 实体类使用 LocalDateTime 类型
- Jackson 配置全局日期格式 yyyy-MM-dd HH:mm:ss
- Jackson 配置时区 GMT+8
- MyBatis 自动支持 LocalDateTime，无需额外配置

## 接口规范

- GET 用于查询操作
- POST 用于创建操作
- PUT 用于全量更新操作
- PATCH 用于部分更新操作
- DELETE 用于删除操作
- 路径使用小写字母和连字符
- 资源使用名词复数形式
- 避免动词出现在路径中

## 日志

- 使用 @Slf4j 注解
- 入口方法记录入参
- 异常分支记录 warn 或 error 日志
- 关键业务节点记录 info 日志
- 调试信息使用 debug 级别
- 禁止在循环中打印日志

## 缓存

- 使用 Spring Cache 抽象
- 缓存注解添加在 Service 方法上
- 使用 @Cacheable 缓存查询结果
- 使用 @CacheEvict 清除缓存
- 使用 @CachePut 更新缓存
- 缓存 key 使用 SpEL 表达式明确指定
- 设置合理的过期时间

## 安全

- 接口添加权限校验注解
- 用户信息从 SecurityContext 或 ThreadLocal 获取
- 禁止从前端参数获取用户身份信息
- 数据权限在 Service 层校验
- 敏感操作记录审计日志

## 健康检查

- 引入 spring-boot-starter-actuator
- 暴露 health、info、metrics 端点
- 生产环境限制 actuator 访问权限
- 自定义健康检查实现 HealthIndicator

## 常见组件配置

- 跨域使用 @CrossOrigin 或 WebMvcConfigurer 配置
- 拦截器实现 HandlerInterceptor 并在 WebMvcConfigurer 中注册
- 过滤器使用 @WebFilter 或 FilterRegistrationBean 注册
- 异步方法添加 @Async，启动类添加 @EnableAsync
- 定时任务添加 @Scheduled，启动类添加 @EnableScheduling
```
5. MySQL数据库设计
```markdown
---
name: database-design
description: MySQL 数据库设计与 SQL 编写规范。当设计表结构、编写 Entity 类、Mapper XML、SQL 语句或讨论数据库变更时自动应用。
---

# 数据库设计规范

## 命名规范

- 表名、字段名使用小写字母和下划线
- 表名使用单数形式
- 表名不超过 32 个字符
- 字段名不超过 30 个字符
- 禁止使用 MySQL 保留字
- 关联表命名使用两个表名连接，如 user_role
- 索引命名：主键 pk_，唯一索引 uk_，普通索引 idx_
- 外键命名：fk_当前表_关联表

## 表设计

- 每张表必须有主键
- 主键使用 BIGINT UNSIGNED 类型
- 主键字段命名为 id
- 必须包含 create_time 字段，类型 DATETIME，默认 CURRENT_TIMESTAMP
- 必须包含 update_time 字段，类型 DATETIME，默认 CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- 逻辑删除使用 deleted 字段，类型 TINYINT UNSIGNED，默认 0
- 每张表和每个字段必须添加 COMMENT
- 单表字段数不超过 50 个
- 单表行数超过 500 万或容量超过 2GB 考虑分表
- 禁止使用外键约束，在应用层实现引用完整性
- 禁止使用存储过程、触发器、自定义函数

## 字段类型

- 整数优先选择 TINYINT、SMALLINT、INT、BIGINT
- 主键和外键使用 BIGINT UNSIGNED
- 状态、类型等枚举值使用 TINYINT UNSIGNED
- 布尔值使用 TINYINT UNSIGNED，0 表示否，1 表示是
- 金额使用 DECIMAL(M,N)，禁止使用 FLOAT 和 DOUBLE
- 定长字符串使用 CHAR
- 变长字符串使用 VARCHAR，长度按需设置
- VARCHAR 长度不超过 5000，超过使用 TEXT
- 大文本使用 TEXT，禁止使用 BLOB 存储文本
- 二进制数据使用 BLOB
- 日期使用 DATE，时间使用 TIME，日期时间使用 DATETIME
- 时间戳使用 DATETIME，禁止使用 TIMESTAMP
- JSON 数据使用 JSON 类型
- IP 地址使用 INT UNSIGNED 存储，使用 INET_ATON 和 INET_NTOA 转换

## 字段约束

- 字段尽量设置为 NOT NULL
- 为 NOT NULL 字段设置合理的 DEFAULT 值
- 字符串默认空字符串
- 数值默认 0
- 时间字段默认 CURRENT_TIMESTAMP 或应用层生成
- UNIQUE 约束用于业务唯一字段

## 字符集

- 数据库字符集使用 utf8mb4
- 排序规则使用 utf8mb4_general_ci 或 utf8mb4_unicode_ci
- 需要区分大小写使用 utf8mb4_bin
- 存储 emoji 表情必须使用 utf8mb4

## 索引设计

- 主键自动创建聚簇索引
- WHERE、ORDER BY、GROUP BY 中的字段考虑建立索引
- 区分度低于 10% 的字段不单独建立索引
- 联合索引字段数不超过 5 个
- 联合索引遵循最左前缀原则
- 将区分度高的字段放在联合索引左侧
- 覆盖索引优化查询性能
- 频繁更新的字段避免建立索引
- 单表索引数量不超过 5 个
- 禁止建立冗余索引和重复索引
- 长字符串使用前缀索引

## 分表设计

- 水平分表根据业务选择分片键
- 常用分片键：用户 ID、订单 ID、时间
- 分片算法：取模、范围、哈希
- 分表数量建议为 2 的幂次方
- 跨分片查询需要在应用层聚合
- 分布式主键使用雪花算法生成

## SQL 查询

- 禁止使用 SELECT *
- 只查询需要的字段
- 避免使用子查询，优先使用 JOIN
- JOIN 表数量不超过 3 张
- JOIN 字段必须有索引且类型一致
- 禁止使用 LEFT JOIN 代替 WHERE 过滤
- 使用 UNION ALL 代替 UNION，除非需要去重
- IN 子句元素数量不超过 1000
- 禁止使用 OR 连接不同字段，使用 UNION ALL 代替
- 使用 EXISTS 代替 IN 进行子查询判断

## WHERE 条件

- 避免在索引列上使用函数或表达式
- 避免隐式类型转换
- 避免使用 != 或 <>
- 避免使用 NOT IN
- 避免使用左模糊 LIKE '%xxx'
- 使用 BETWEEN 代替多个 AND 条件
- NULL 值判断使用 IS NULL 或 IS NOT NULL
- 字符串比较使用单引号

## 排序与分页

- ORDER BY 字段尽量使用索引
- 避免使用 ORDER BY RAND()
- 深度分页使用游标分页或延迟关联
- 游标分页使用 WHERE id > last_id LIMIT n
- 延迟关联先查主键再关联查详情
- 禁止无 LIMIT 的批量更新或删除

## 写操作

- INSERT 语句明确指定字段名
- 批量 INSERT 单条语句不超过 1000 条
- 超大批量操作分批执行
- UPDATE 和 DELETE 必须有 WHERE 条件
- UPDATE 和 DELETE 先用 SELECT 验证条件
- 避免大事务，单次事务操作行数不超过 10000
- 更新时只更新变化的字段

## 锁

- 尽量使用行锁而非表锁
- 事务中加锁顺序保持一致
- 避免锁等待超时
- 高并发场景使用乐观锁
- 乐观锁使用版本号字段

## 事务

- 事务尽可能小
- 事务内禁止进行 RPC 或 HTTP 调用
- 事务内禁止进行耗时计算
- 只读操作使用只读事务
- 合理设置事务隔离级别

## 备份与安全

- 敏感字段加密存储
- 定期备份数据
- 线上操作先备份再执行
- DDL 变更在低峰期执行
- 大表 DDL 使用 pt-online-schema-change 或 gh-ost

## 常用字段模板

- 主键：id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID'
- 创建时间：create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
- 更新时间：update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
- 逻辑删除：deleted TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除 0否 1是'
- 创建人：create_by BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建人ID'
- 更新人：update_by BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新人ID'
- 排序：sort INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序号'
- 状态：status TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态'
- 备注：remark VARCHAR(500) NOT NULL DEFAULT '' COMMENT '备注'
- 版本号：version INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '乐观锁版本号'
```

6. 代码优化和重构
```markdown
---
name: refactor-optimization
description: 代码重构与整洁代码原则。当代码出现坏味道、需要提升可读性、可维护性、性能，或进行重构优化时使用，提供 SOLID 原则、重构手法和常见优化建议。
---

# 代码重构与整洁代码

## 核心理念

- 代码是写给人看的，顺便让机器执行
- 持续小步重构，而非集中大改
- 重构前确保有测试覆盖
- 每次只做一件事，频繁提交
- 保持代码随时可运行

## SOLID 原则

- 单一职责：一个类只有一个修改的理由
- 开闭原则：对扩展开放，对修改关闭
- 里氏替换：子类可以完全替代父类
- 接口隔离：接口小而专一，不强迫依赖不需要的方法
- 依赖倒置：依赖抽象而非具体实现

## 函数设计

- 函数体不超过 20 行
- 函数只做一件事
- 函数参数不超过 3 个
- 超过 3 个参数封装为对象
- 避免布尔参数，拆分为两个函数
- 避免输出参数
- 函数要么执行命令，要么查询返回，不要同时做
- 避免副作用
- 使用卫语句提前返回，减少嵌套
- 嵌套层级不超过 3 层

## 命名

- 名字要能自解释其用途
- 使用领域术语命名
- 避免缩写，除非是通用缩写
- 避免无意义命名如 data、info、temp
- 布尔变量和方法使用 is、has、can、should 开头
- 集合变量使用复数形式
- 方法名使用动词或动词短语
- 类名使用名词或名词短语
- 名字长度与作用域成正比

## 注释

- 好的代码是自解释的，尽量减少注释
- 用命名和提取方法代替注释
- 删除注释掉的代码
- 删除过时的注释
- 避免废话注释
- 保留必要的警示注释
- 保留解释为什么这样做的注释
- 公共 API 保留完整的文档注释

## 代码坏味道

- 重复代码：相同或相似的代码出现多处
- 过长方法：方法超过 20 行
- 过大类：类超过 200 行或职责过多
- 过长参数列表：参数超过 3 个
- 发散式变化：一个类因多个原因被修改
- 霰弹式修改：一个变化需要修改多个类
- 依恋情结：方法过度使用其他类的数据
- 数据泥团：多个数据总是一起出现
- 基本类型偏执：使用基本类型代替小对象
- 重复的 switch：多处相同的条件分支
- 平行继承体系：增加一个子类需要同时增加另一个
- 冗余类：类的功能太少
- 夸夸其谈通用性：过度设计
- 临时字段：字段只在某些情况下使用
- 过度耦合的消息链：连续调用多个对象
- 中间人：类的大部分方法都委托给其他类
- 不恰当的亲密：类之间过度访问彼此的私有部分
- 异曲同工的类：功能相同但接口不同
- 不完美的库类：库类缺少需要的方法
- 纯数据类：只有字段没有行为
- 被拒绝的遗赠：子类不需要父类的某些方法
- 过多的注释：用注释掩盖糟糕的代码

## 提取重构

- 重复代码提取为方法
- 过长方法按职责拆分为多个方法
- 复杂条件表达式提取为方法
- 相关字段和方法提取为新类
- 数据泥团提取为参数对象或数据类
- 可复用逻辑提取为工具方法
- 业务逻辑从控制器提取到服务层
- 数据访问逻辑提取到仓储层

## 内联重构

- 无意义的中间变量内联
- 只被调用一次的简单方法内联
- 过度委托的中间人内联
- 内联后再重新组织代码结构

## 移动重构

- 方法移动到使用其数据最多的类
- 字段移动到使用它最多的类
- 相关方法移动到同一个类
- 将方法上移到父类或下移到子类
- 将字段上移到父类或下移到子类

## 重命名重构

- 变量重命名以表达其含义
- 方法重命名以表达其行为
- 类重命名以表达其职责
- 参数重命名以表达其用途
- 包重命名以反映模块职责

## 简化条件

- 分解复杂的条件表达式
- 合并重复的条件片段
- 移除控制标记，使用 break 或 return
- 用卫语句替代嵌套条件
- 用多态替代条件分支
- 引入断言明确假设条件
- 用 Optional 替代 null 检查

## 简化方法调用

- 方法改名使其自解释
- 添加参数传递必要信息
- 移除未使用的参数
- 将查询与修改分离
- 参数化方法合并相似方法
- 用显式方法替代参数控制行为
- 保持对象完整而非传递多个字段
- 用方法对象替代过长方法

## 处理继承

- 优先使用组合而非继承
- 提取公共行为到父类
- 提取差异行为到子类
- 用委托替代继承
- 用策略模式替代继承层次
- 折叠不必要的继承层次

## 性能优化

- 先保证正确性，再优化性能
- 用性能分析工具定位瓶颈
- 只优化热点代码
- 避免过早优化
- 缓存重复计算的结果
- 延迟加载非必需的数据
- 批量处理替代循环单条处理
- 使用合适的数据结构
- 避免在循环中创建对象
- 使用 StringBuilder 拼接字符串
- 使用基本类型替代包装类型进行计算
- Stream 的短路操作放前面

## 并发优化

- 缩小同步代码块范围
- 使用并发集合替代同步集合
- 使用原子类替代锁
- 使用 ThreadLocal 避免共享
- 读多写少场景使用读写锁
- 使用线程池管理线程

## 数据库优化

- 避免循环查询，使用批量查询
- 使用索引覆盖查询
- 避免大事务
- 合理使用缓存减少查询
- 分页查询避免深度分页
- 延迟加载非必需的关联数据

## 重构时机

- 添加新功能前先重构
- 修复缺陷时顺便重构
- 代码评审时发现问题
- 理解代码时顺便整理
- 重复做同样修改时
- 代码难以理解时
- 性能需要优化时

## 重构边界

- 不重构即将废弃的代码
- 不重构运行正常且不需修改的代码
- 不在紧急发布前重构
- 不在没有测试覆盖时大规模重构
- 接口变更需要考虑兼容性
- 公共 API 变更需要版本控制
```
