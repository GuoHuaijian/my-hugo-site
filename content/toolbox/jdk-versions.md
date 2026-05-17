---
title: JDK 版本速查
---

## JDK 8 (LTS)

- Lambda 表达式
- Stream API
- `Optional`
- 新的 Date/Time API (`java.time`)
- 默认方法（接口）

## JDK 11 (LTS)

- 局部变量类型推断 `var`
- HTTP Client API
- `String` 新方法：`isBlank()`, `lines()`, `strip()`
- 单文件运行 `java MyClass.java`

## JDK 17 (LTS)

- Sealed Classes（密封类）
- Pattern Matching for `instanceof`
- `switch` 表达式增强
- 新的 macOS 渲染管道

## JDK 21 (LTS)

- **Virtual Threads（虚拟线程）** — Project Loom
- **Record Patterns**
- **Pattern Matching for `switch`**
- Sequenced Collections

## JDK 22+

- Unnamed Variables (`_`)
- Statement Micro-Benchmarks
- 结构化并发（预览）
- 外部函数与内存 API（预览）

## 升级建议

| 当前版本 | 推荐目标 | 注意事项 |
|---------|---------|---------|
| JDK 8   | JDK 17  | 检查废弃 API，模块化兼容性 |
| JDK 11  | JDK 21  | 虚拟线程可大幅提升并发性能 |
| JDK 17  | JDK 21  | 几乎无缝，享受新特性 |
