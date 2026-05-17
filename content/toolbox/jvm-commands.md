---
title: JVM 调优命令速查
---

## 进程查看

```bash
# 查看 Java 进程
jps -l
jps -v

# 查看进程信息
jinfo <pid>
```

## 内存分析

```bash
# 查看 GC 统计
jstat -gc <pid> 1000 10

# 查看类加载
jstat -class <pid>

# 查看编译统计
jstat -compiler <pid>

# 导出堆快照
jmap -dump:format=b,file=heap.hprof <pid>

# 查看堆内存使用
jmap -heap <pid>

# 查看对象统计
jmap -histo <pid> | head -20
```

## 线程分析

```bash
# 导出线程快照
jstack <pid> > thread.dump

# 查看线程数
jstack <pid> | grep "java.lang.Thread.State" | wc -l

# 查看死锁
jstack -l <pid> | grep -A 10 "deadlock"
```

## 远程监控

```bash
# 启动 JMX
java -Dcom.sun.management.jmxremote \
     -Dcom.sun.management.jmxremote.port=9999 \
     -Dcom.sun.management.jmxremote.authenticate=false \
     -Dcom.sun.management.jmxremote.ssl=false \
     -jar app.jar

# 使用 jconsole 连接
jconsole host:9999

# 使用 jvisualvm 连接
jvisualvm
```

## GC 日志

```bash
# JDK 8
-XX:+PrintGCDetails -XX:+PrintGCDateStamps \
-Xloggc:/path/to/gc.log

# JDK 9+
-Xlog:gc*:file=/path/to/gc.log:time,uptime,level,tags
```

## 常用 JVM 参数

```bash
# 堆内存
-Xms2g -Xmx2g

# 新生代
-Xmn512m

# GC 选择器
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200

# 元空间
-XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m

# OOM 时自动导出堆
-XX:+HeapDumpOnOutOfMemoryError \
-XX:HeapDumpPath=/path/to/dump/
```
