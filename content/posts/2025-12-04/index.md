---
title: "MyBatis工作原理笔记"
date: 2025-12-04
author: "Guo"
tags: ["学习笔记", "MyBatis", "orm"]
comments: true
toc: true
---

## 1. MyBatis 架构概述

### 1.1 什么是 MyBatis

MyBatis 是一款优秀的**半自动化 ORM 框架**，它避免了几乎所有的 JDBC 代码和手动设置参数以及获取结果集的工作。

### 1.2 整体架构图

```mermaid
flowchart TB
    subgraph Application["应用层"]
        A[Mapper Interface] 
        B[SqlSession API]
    end
    
    subgraph Interface["接口层"]
        C[SqlSession]
    end
    
    subgraph Core["核心处理层"]
        D[Configuration]
        E[MappedStatement]
        F[Executor]
        G[StatementHandler]
        H[ParameterHandler]
        I[ResultSetHandler]
    end
    
    subgraph Foundation["基础支撑层"]
        J[DataSource]
        K[Transaction]
        L[Cache]
        M[Logging]
        N[TypeHandler]
        O[Reflection]
    end
    
    subgraph DB["数据库层"]
        P[(Database)]
    end
    
    A --> C
    B --> C
    C --> F
    D --> F
    E --> F
    F --> G
    G --> H
    G --> I
    H --> N
    I --> N
    G --> P
    F --> L
    F --> K
    K --> J
    J --> P
```

### 1.3 三层架构说明

```mermaid
flowchart LR
    subgraph Layer1["接口层"]
        direction TB
        S1[SqlSession]
        S2["提供API给应用程序调用"]
    end
    
    subgraph Layer2["核心处理层"]
        direction TB
        C1[配置解析]
        C2[参数映射]
        C3[SQL解析]
        C4[SQL执行]
        C5[结果映射]
    end
    
    subgraph Layer3["基础支撑层"]
        direction TB
        B1[连接管理]
        B2[事务管理]
        B3[缓存机制]
        B4[类型转换]
    end
    
    Layer1 --> Layer2 --> Layer3
```

------

## 2. 核心组件详解

### 2.1 核心组件关系图

```mermaid
flowchart TB
    subgraph Config["Configuration 全局配置"]
        C1[Environment<br/>数据源/事务管理器]
        C2[MapperRegistry<br/>Mapper注册表]
        C3[MappedStatements<br/>SQL映射]
        C4[TypeHandlerRegistry<br/>类型处理器]
        C5[TypeAliasRegistry<br/>类型别名]
        C6[InterceptorChain<br/>拦截器链]
        C7[Cache<br/>缓存配置]
    end
    
    Config --> SSF[SqlSessionFactory<br/>创建SqlSession的工厂]
    SSF --> SS[SqlSession<br/>执行SQL/获取Mapper/管理事务]
    
    SS --> E[Executor<br/>执行器]
    SS --> MP[Mapper Proxy<br/>Mapper代理]
    SS --> TX[Transaction<br/>事务]
    
    E --> SH[StatementHandler]
    SH --> PH[ParameterHandler]
    SH --> RH[ResultSetHandler]
```

### 2.2 核心组件类图

```mermaid
classDiagram
    class SqlSessionFactoryBuilder {
        +build(InputStream) SqlSessionFactory
        +build(Configuration) SqlSessionFactory
    }
    
    class SqlSessionFactory {
        <<interface>>
        +openSession() SqlSession
        +getConfiguration() Configuration
    }
    
    class DefaultSqlSessionFactory {
        -Configuration configuration
        +openSession() SqlSession
    }
    
    class SqlSession {
        <<interface>>
        +selectOne(String, Object) T
        +selectList(String, Object) List
        +insert(String, Object) int
        +update(String, Object) int
        +delete(String, Object) int
        +getMapper(Class) T
        +commit() void
        +rollback() void
        +close() void
    }
    
    class DefaultSqlSession {
        -Configuration configuration
        -Executor executor
    }
    
    class Configuration {
        -Environment environment
        -MapperRegistry mapperRegistry
        -Map~String, MappedStatement~ mappedStatements
        -TypeHandlerRegistry typeHandlerRegistry
        -InterceptorChain interceptorChain
    }
    
    SqlSessionFactoryBuilder ..> SqlSessionFactory : creates
    SqlSessionFactory <|.. DefaultSqlSessionFactory
    SqlSession <|.. DefaultSqlSession
    DefaultSqlSessionFactory --> Configuration
    DefaultSqlSession --> Configuration
    DefaultSqlSession --> Executor
```

### 2.3 Executor 继承体系

```mermaid
classDiagram
    class Executor {
        <<interface>>
        +update(MappedStatement, Object) int
        +query(MappedStatement, Object, RowBounds, ResultHandler) List
        +commit(boolean) void
        +rollback(boolean) void
        +createCacheKey() CacheKey
    }
    
    class BaseExecutor {
        <<abstract>>
        #Transaction transaction
        #PerpetualCache localCache
        #doUpdate()* int
        #doQuery()* List
    }
    
    class SimpleExecutor {
        +doQuery() List
        +doUpdate() int
    }
    
    class ReuseExecutor {
        -Map~String, Statement~ statementMap
        +doQuery() List
    }
    
    class BatchExecutor {
        -List~Statement~ statementList
        +doUpdate() int
    }
    
    class CachingExecutor {
        -Executor delegate
        -TransactionalCacheManager tcm
        +query() List
    }
    
    Executor <|.. BaseExecutor
    Executor <|.. CachingExecutor
    BaseExecutor <|-- SimpleExecutor
    BaseExecutor <|-- ReuseExecutor
    BaseExecutor <|-- BatchExecutor
    CachingExecutor o-- Executor : 装饰
```

------

## 3. 初始化流程

### 3.1 初始化时序图

```mermaid
sequenceDiagram
    autonumber
    participant Client as 客户端
    participant Builder as SqlSessionFactoryBuilder
    participant XMLConfig as XMLConfigBuilder
    participant Config as Configuration
    participant XMLMapper as XMLMapperBuilder
    
    Client->>Builder: build(inputStream)
    Builder->>XMLConfig: new XMLConfigBuilder(inputStream)
    XMLConfig->>Config: new Configuration()
    Builder->>XMLConfig: parse()
    
    activate XMLConfig
    XMLConfig->>Config: 解析 properties
    XMLConfig->>Config: 解析 settings
    XMLConfig->>Config: 解析 typeAliases
    XMLConfig->>Config: 解析 plugins
    XMLConfig->>Config: 解析 environments
    XMLConfig->>Config: 解析 typeHandlers
    
    XMLConfig->>XMLMapper: 解析 mappers
    XMLMapper->>Config: 注册 MappedStatement
    XMLMapper->>Config: 注册 ResultMap
    XMLMapper-->>XMLConfig: 完成
    deactivate XMLConfig
    
    XMLConfig-->>Builder: 返回 Configuration
    Builder->>Builder: new DefaultSqlSessionFactory(config)
    Builder-->>Client: 返回 SqlSessionFactory
```

### 3.2 配置文件解析流程

```mermaid
flowchart TB
    A[mybatis-config.xml] --> B[XMLConfigBuilder]
    
    B --> C{解析各节点}
    
    C --> D[properties<br/>外部属性]
    C --> E[settings<br/>全局设置]
    C --> F[typeAliases<br/>类型别名]
    C --> G[plugins<br/>插件]
    C --> H[environments<br/>环境配置]
    C --> I[typeHandlers<br/>类型处理器]
    C --> J[mappers<br/>映射器]
    
    J --> K{mapper配置方式}
    K --> L[resource<br/>XML文件路径]
    K --> M[class<br/>Mapper接口]
    K --> N[package<br/>包扫描]
    
    L --> O[XMLMapperBuilder]
    M --> P[MapperAnnotationBuilder]
    N --> P
    
    O --> Q[解析Mapper.xml]
    P --> R[解析注解]
    
    Q --> S[MappedStatement]
    R --> S
    
    S --> T[Configuration]
```

### 3.3 MappedStatement 结构

```mermaid
classDiagram
    class MappedStatement {
        -String id
        -SqlCommandType sqlCommandType
        -SqlSource sqlSource
        -ParameterMap parameterMap
        -List~ResultMap~ resultMaps
        -Cache cache
        -boolean useCache
        -boolean flushCacheRequired
        -StatementType statementType
        -Integer timeout
        -Integer fetchSize
    }
    
    class SqlSource {
        <<interface>>
        +getBoundSql(Object) BoundSql
    }
    
    class StaticSqlSource {
        -String sql
    }
    
    class DynamicSqlSource {
        -SqlNode rootSqlNode
    }
    
    class RawSqlSource {
        -SqlSource sqlSource
    }
    
    class BoundSql {
        -String sql
        -List~ParameterMapping~ parameterMappings
        -Object parameterObject
        -Map additionalParameters
    }
    
    MappedStatement --> SqlSource
    SqlSource <|.. StaticSqlSource
    SqlSource <|.. DynamicSqlSource
    SqlSource <|.. RawSqlSource
    SqlSource ..> BoundSql : creates
```

### 3.4 初始化源码解析

```java
/**
 * SqlSessionFactoryBuilder - 入口类
 */
public class SqlSessionFactoryBuilder {
    
    public SqlSessionFactory build(InputStream inputStream) {
        return build(inputStream, null, null);
    }
    
    public SqlSessionFactory build(InputStream inputStream, 
                                   String environment, 
                                   Properties properties) {
        try {
            // 1. 创建 XML 配置解析器
            XMLConfigBuilder parser = new XMLConfigBuilder(
                inputStream, environment, properties);
            
            // 2. 解析配置文件，返回 Configuration 对象
            Configuration config = parser.parse();
            
            // 3. 创建 DefaultSqlSessionFactory
            return build(config);
        } catch (Exception e) {
            throw ExceptionFactory.wrapException("Error building SqlSession.", e);
        }
    }
    
    public SqlSessionFactory build(Configuration config) {
        return new DefaultSqlSessionFactory(config);
    }
}

/**
 * XMLConfigBuilder - 解析 mybatis-config.xml
 */
public class XMLConfigBuilder extends BaseBuilder {
    
    public Configuration parse() {
        if (parsed) {
            throw new BuilderException("Each XMLConfigBuilder can only be used once.");
        }
        parsed = true;
        
        // 从根节点 <configuration> 开始解析
        parseConfiguration(parser.evalNode("/configuration"));
        
        return configuration;
    }
    
    private void parseConfiguration(XNode root) {
        try {
            // 按顺序解析各个子节点
            propertiesElement(root.evalNode("properties"));
            Properties settings = settingsAsProperties(root.evalNode("settings"));
            typeAliasesElement(root.evalNode("typeAliases"));
            pluginElement(root.evalNode("plugins"));
            objectFactoryElement(root.evalNode("objectFactory"));
            settingsElement(settings);
            environmentsElement(root.evalNode("environments"));
            typeHandlerElement(root.evalNode("typeHandlers"));
            mapperElement(root.evalNode("mappers"));  // ⭐ 解析 Mapper
        } catch (Exception e) {
            throw new BuilderException("Error parsing SQL Mapper Configuration.", e);
        }
    }
}
```

------

## 4. SQL 执行流程

### 4.1 SQL 执行时序图

```mermaid
sequenceDiagram
    autonumber
    participant Client as 客户端
    participant SS as SqlSession
    participant E as Executor
    participant SH as StatementHandler
    participant PH as ParameterHandler
    participant TH as TypeHandler
    participant RH as ResultSetHandler
    participant DB as Database
    
    Client->>SS: selectList(statementId, parameter)
    SS->>SS: getMappedStatement(id)
    SS->>E: query(ms, parameter, rowBounds, resultHandler)
    
    alt 缓存命中
        E->>E: 查询一级缓存
        E-->>SS: 返回缓存结果
    else 缓存未命中
        E->>E: 创建 CacheKey
        E->>SH: prepare(connection, timeout)
        SH->>DB: prepareStatement(sql)
        DB-->>SH: PreparedStatement
        
        E->>SH: parameterize(statement)
        SH->>PH: setParameters(ps)
        
        loop 遍历参数映射
            PH->>TH: setParameter(ps, i, value, jdbcType)
            TH->>DB: ps.setXxx(i, value)
        end
        
        E->>SH: query(statement, resultHandler)
        SH->>DB: ps.execute()
        DB-->>SH: ResultSet
        
        SH->>RH: handleResultSets(ps)
        
        loop 遍历结果集
            RH->>TH: getResult(rs, columnName)
            TH-->>RH: Java对象
        end
        
        RH-->>SH: List<Object>
        SH-->>E: List<Object>
        
        E->>E: 放入一级缓存
    end
    
    E-->>SS: List<Object>
    SS-->>Client: List<Object>
```

### 4.2 执行器工作流程

```mermaid
flowchart TB
    A[SqlSession.selectList] --> B[获取 MappedStatement]
    B --> C[Executor.query]
    
    C --> D{二级缓存开启?}
    D -->|是| E[CachingExecutor]
    D -->|否| F[BaseExecutor]
    
    E --> G{二级缓存命中?}
    G -->|是| H[返回缓存结果]
    G -->|否| F
    
    F --> I{一级缓存命中?}
    I -->|是| J[返回缓存结果]
    I -->|否| K[queryFromDatabase]
    
    K --> L[doQuery - 由子类实现]
    
    L --> M{Executor类型}
    M -->|SimpleExecutor| N[每次创建新Statement]
    M -->|ReuseExecutor| O[复用Statement]
    M -->|BatchExecutor| P[批量执行]
    
    N --> Q[StatementHandler.prepare]
    O --> Q
    P --> Q
    
    Q --> R[ParameterHandler.setParameters]
    R --> S[StatementHandler.query]
    S --> T[ResultSetHandler.handleResultSets]
    T --> U[返回结果并缓存]
```

### 4.3 四大处理器协作

```mermaid
flowchart LR
    subgraph Executor["Executor 执行器"]
        E1[管理事务]
        E2[管理缓存]
        E3[创建Handler]
    end
    
    subgraph StatementHandler["StatementHandler"]
        S1[prepare<br/>创建Statement]
        S2[parameterize<br/>委托参数处理]
        S3[query/update<br/>执行SQL]
    end
    
    subgraph ParameterHandler["ParameterHandler"]
        P1[setParameters<br/>设置SQL参数]
    end
    
    subgraph ResultSetHandler["ResultSetHandler"]
        R1[handleResultSets<br/>处理结果集]
        R2[映射到Java对象]
    end
    
    subgraph TypeHandler["TypeHandler"]
        T1[setParameter<br/>Java→JDBC]
        T2[getResult<br/>JDBC→Java]
    end
    
    Executor --> StatementHandler
    StatementHandler --> ParameterHandler
    StatementHandler --> ResultSetHandler
    ParameterHandler --> TypeHandler
    ResultSetHandler --> TypeHandler
```

### 4.4 DefaultSqlSession 核心代码

```java
/**
 * DefaultSqlSession - SQL 执行入口
 */
public class DefaultSqlSession implements SqlSession {
    
    private final Configuration configuration;
    private final Executor executor;
    
    @Override
    public <E> List<E> selectList(String statement, Object parameter) {
        return this.selectList(statement, parameter, RowBounds.DEFAULT);
    }
    
    @Override
    public <E> List<E> selectList(String statement, Object parameter, 
                                  RowBounds rowBounds) {
        try {
            // 1. 获取 MappedStatement
            MappedStatement ms = configuration.getMappedStatement(statement);
            
            // 2. 调用 Executor 执行查询
            return executor.query(ms, wrapCollection(parameter), 
                                  rowBounds, Executor.NO_RESULT_HANDLER);
        } catch (Exception e) {
            throw ExceptionFactory.wrapException("Error querying database.", e);
        }
    }
    
    @Override
    public int update(String statement, Object parameter) {
        try {
            dirty = true;
            MappedStatement ms = configuration.getMappedStatement(statement);
            return executor.update(ms, wrapCollection(parameter));
        } catch (Exception e) {
            throw ExceptionFactory.wrapException("Error updating database.", e);
        }
    }
    
    @Override
    public <T> T getMapper(Class<T> type) {
        return configuration.getMapper(type, this);
    }
}
```

### 4.5 SimpleExecutor 执行逻辑

```java
/**
 * SimpleExecutor - 简单执行器
 */
public class SimpleExecutor extends BaseExecutor {
    
    @Override
    public <E> List<E> doQuery(MappedStatement ms, Object parameter,
                               RowBounds rowBounds, ResultHandler resultHandler,
                               BoundSql boundSql) throws SQLException {
        Statement stmt = null;
        try {
            Configuration configuration = ms.getConfiguration();
            
            // 1. 创建 StatementHandler
            StatementHandler handler = configuration.newStatementHandler(
                wrapper, ms, parameter, rowBounds, resultHandler, boundSql);
            
            // 2. 预处理 Statement
            stmt = prepareStatement(handler, ms.getStatementLog());
            
            // 3. 执行查询
            return handler.query(stmt, resultHandler);
            
        } finally {
            closeStatement(stmt);
        }
    }
    
    private Statement prepareStatement(StatementHandler handler, Log statementLog)
            throws SQLException {
        Statement stmt;
        
        // 1. 获取数据库连接
        Connection connection = getConnection(statementLog);
        
        // 2. 创建 Statement
        stmt = handler.prepare(connection, transaction.getTimeout());
        
        // 3. 设置参数
        handler.parameterize(stmt);
        
        return stmt;
    }
}
```

------

## 5. 动态代理机制

### 5.1 Mapper 代理原理图

```mermaid
flowchart TB
    subgraph Application["应用层"]
        A[UserMapper<br/>接口定义]
        B["mapper.selectById(1)"]
    end
    
    subgraph Proxy["代理层"]
        C[MapperProxyFactory<br/>创建代理]
        D[MapperProxy<br/>InvocationHandler]
        E[MapperMethod<br/>方法执行器]
    end
    
    subgraph SqlSession["SqlSession层"]
        F[selectOne]
        G[selectList]
        H[insert]
        I[update]
        J[delete]
    end
    
    A -->|getMapper| C
    C -->|Proxy.newProxyInstance| D
    B -->|invoke| D
    D -->|cachedInvoker| E
    
    E -->|SELECT| F
    E -->|SELECT returnMany| G
    E -->|INSERT| H
    E -->|UPDATE| I
    E -->|DELETE| J
```

### 5.2 动态代理时序图

```mermaid
sequenceDiagram
    autonumber
    participant Client as 客户端
    participant SS as SqlSession
    participant MR as MapperRegistry
    participant MPF as MapperProxyFactory
    participant MP as MapperProxy
    participant MM as MapperMethod
    
    Client->>SS: getMapper(UserMapper.class)
    SS->>MR: getMapper(type, sqlSession)
    MR->>MPF: newInstance(sqlSession)
    
    Note over MPF: 创建 MapperProxy
    MPF->>MP: new MapperProxy(sqlSession, mapperInterface, methodCache)
    
    Note over MPF: JDK动态代理
    MPF->>MPF: Proxy.newProxyInstance(classLoader, interfaces, mapperProxy)
    MPF-->>Client: 返回代理对象
    
    Client->>MP: selectById(1)
    MP->>MP: invoke(proxy, method, args)
    
    alt Object方法
        MP->>MP: method.invoke(this, args)
    else 接口默认方法
        MP->>MP: invokeDefaultMethod()
    else 普通方法
        MP->>MP: cachedInvoker(method)
        MP->>MM: new MapperMethod(interface, method, config)
        MP->>MM: execute(sqlSession, args)
        
        MM->>MM: 判断SQL类型
        MM->>SS: selectOne/selectList/insert/update/delete
        SS-->>MM: 结果
        MM-->>MP: 结果
    end
    
    MP-->>Client: 结果
```

### 5.3 MapperProxy 类结构

```mermaid
classDiagram
    class MapperProxy~T~ {
        -SqlSession sqlSession
        -Class~T~ mapperInterface
        -Map~Method, MapperMethodInvoker~ methodCache
        +invoke(Object proxy, Method method, Object[] args) Object
        -cachedInvoker(Method method) MapperMethodInvoker
    }
    
    class MapperProxyFactory~T~ {
        -Class~T~ mapperInterface
        -Map~Method, MapperMethodInvoker~ methodCache
        +newInstance(SqlSession sqlSession) T
        #newInstance(MapperProxy~T~ mapperProxy) T
    }
    
    class MapperMethod {
        -SqlCommand command
        -MethodSignature method
        +execute(SqlSession sqlSession, Object[] args) Object
    }
    
    class SqlCommand {
        -String name
        -SqlCommandType type
    }
    
    class MethodSignature {
        -boolean returnsMany
        -boolean returnsMap
        -boolean returnsVoid
        -Class~?~ returnType
        -ParamNameResolver paramNameResolver
    }
    
    class MapperMethodInvoker {
        <<interface>>
        +invoke(Object, Method, Object[], SqlSession) Object
    }
    
    class PlainMethodInvoker {
        -MapperMethod mapperMethod
    }
    
    MapperProxyFactory ..> MapperProxy : creates
    MapperProxy ..|> InvocationHandler
    MapperProxy --> MapperMethodInvoker
    MapperMethodInvoker <|.. PlainMethodInvoker
    PlainMethodInvoker --> MapperMethod
    MapperMethod --> SqlCommand
    MapperMethod --> MethodSignature
```

### 5.4 MapperProxy 源码解析

```java
/**
 * MapperProxy - Mapper 接口的代理处理器
 */
public class MapperProxy<T> implements InvocationHandler, Serializable {
    
    private final SqlSession sqlSession;
    private final Class<T> mapperInterface;
    private final Map<Method, MapperMethodInvoker> methodCache;
    
    /**
     * 代理方法调用入口
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) 
            throws Throwable {
        try {
            // 1. 如果是 Object 类的方法，直接调用
            if (Object.class.equals(method.getDeclaringClass())) {
                return method.invoke(this, args);
            }
            
            // 2. 如果是接口的默认方法（Java 8+）
            if (method.isDefault()) {
                return invokeDefaultMethod(proxy, method, args);
            }
            
        } catch (Throwable t) {
            throw ExceptionUtil.unwrapThrowable(t);
        }
        
        // 3. 获取或创建 MapperMethodInvoker，然后执行
        final MapperMethodInvoker invoker = cachedInvoker(method);
        return invoker.invoke(proxy, method, args, sqlSession);
    }
    
    /**
     * 缓存方法调用器
     */
    private MapperMethodInvoker cachedInvoker(Method method) throws Throwable {
        return methodCache.computeIfAbsent(method, m -> {
            if (m.isDefault()) {
                return new DefaultMethodInvoker(getMethodHandle(method));
            } else {
                return new PlainMethodInvoker(
                    new MapperMethod(mapperInterface, method, 
                                    sqlSession.getConfiguration()));
            }
        });
    }
}

/**
 * MapperMethod - 封装方法执行逻辑
 */
public class MapperMethod {
    
    private final SqlCommand command;
    private final MethodSignature method;
    
    /**
     * 执行方法
     */
    public Object execute(SqlSession sqlSession, Object[] args) {
        Object result;
        
        switch (command.getType()) {
            case INSERT: {
                Object param = method.convertArgsToSqlCommandParam(args);
                result = rowCountResult(sqlSession.insert(command.getName(), param));
                break;
            }
            case UPDATE: {
                Object param = method.convertArgsToSqlCommandParam(args);
                result = rowCountResult(sqlSession.update(command.getName(), param));
                break;
            }
            case DELETE: {
                Object param = method.convertArgsToSqlCommandParam(args);
                result = rowCountResult(sqlSession.delete(command.getName(), param));
                break;
            }
            case SELECT:
                if (method.returnsVoid() && method.hasResultHandler()) {
                    executeWithResultHandler(sqlSession, args);
                    result = null;
                } else if (method.returnsMany()) {
                    result = executeForMany(sqlSession, args);
                } else if (method.returnsMap()) {
                    result = executeForMap(sqlSession, args);
                } else {
                    Object param = method.convertArgsToSqlCommandParam(args);
                    result = sqlSession.selectOne(command.getName(), param);
                }
                break;
            default:
                throw new BindingException("Unknown execution method for: " 
                    + command.getName());
        }
        
        return result;
    }
}
```

------

## 6. 缓存机制

### 6.1 两级缓存架构

```mermaid
flowchart TB
    subgraph Session1["SqlSession 1"]
        L1A[一级缓存<br/>PerpetualCache]
    end
    
    subgraph Session2["SqlSession 2"]
        L1B[一级缓存<br/>PerpetualCache]
    end
    
    subgraph Session3["SqlSession 3"]
        L1C[一级缓存<br/>PerpetualCache]
    end
    
    subgraph L2Cache["二级缓存 (Mapper Namespace级别)"]
        subgraph NS1["UserMapper Namespace"]
            C1[SynchronizedCache]
            C2[LoggingCache]
            C3[SerializedCache]
            C4[LruCache]
            C5[PerpetualCache]
            C1 --> C2 --> C3 --> C4 --> C5
        end
        
        subgraph NS2["OrderMapper Namespace"]
            D1[SynchronizedCache]
            D2[LoggingCache]
            D3[PerpetualCache]
            D1 --> D2 --> D3
        end
    end
    
    Session1 --> L2Cache
    Session2 --> L2Cache
    Session3 --> L2Cache
    
    L2Cache --> DB[(Database)]
    
    style L1A fill:#e1f5fe
    style L1B fill:#e1f5fe
    style L1C fill:#e1f5fe
    style L2Cache fill:#fff3e0
```

### 6.2 缓存查询流程

```mermaid
flowchart TB
    A[查询请求] --> B{二级缓存开启?}
    
    B -->|是| C[CachingExecutor]
    B -->|否| D[BaseExecutor]
    
    C --> E{二级缓存命中?}
    E -->|是| F[返回二级缓存结果]
    E -->|否| D
    
    D --> G{一级缓存命中?}
    G -->|是| H[返回一级缓存结果]
    G -->|否| I[查询数据库]
    
    I --> J[结果放入一级缓存]
    J --> K{二级缓存开启?}
    
    K -->|是| L[暂存到TransactionalCache]
    K -->|否| M[返回结果]
    
    L --> N{事务提交?}
    N -->|是| O[刷新到二级缓存]
    N -->|否| P[事务回滚清空]
    
    O --> M
    P --> M
```

### 6.3 缓存装饰器模式

```mermaid
classDiagram
    class Cache {
        <<interface>>
        +getId() String
        +putObject(Object key, Object value) void
        +getObject(Object key) Object
        +removeObject(Object key) Object
        +clear() void
        +getSize() int
    }
    
    class PerpetualCache {
        -String id
        -Map~Object, Object~ cache
        +putObject() void
        +getObject() Object
    }
    
    class LruCache {
        -Cache delegate
        -Map keyMap
        -Object eldestKey
    }
    
    class FifoCache {
        -Cache delegate
        -Deque~Object~ keyList
    }
    
    class SoftCache {
        -Cache delegate
        -Deque~Object~ hardLinksToAvoidGC
    }
    
    class WeakCache {
        -Cache delegate
    }
    
    class SynchronizedCache {
        -Cache delegate
    }
    
    class LoggingCache {
        -Cache delegate
        -int requests
        -int hits
    }
    
    class SerializedCache {
        -Cache delegate
    }
    
    class ScheduledCache {
        -Cache delegate
        -long clearInterval
    }
    
    Cache <|.. PerpetualCache
    Cache <|.. LruCache
    Cache <|.. FifoCache
    Cache <|.. SoftCache
    Cache <|.. WeakCache
    Cache <|.. SynchronizedCache
    Cache <|.. LoggingCache
    Cache <|.. SerializedCache
    Cache <|.. ScheduledCache
    
    LruCache o-- Cache
    FifoCache o-- Cache
    SoftCache o-- Cache
    WeakCache o-- Cache
    SynchronizedCache o-- Cache
    LoggingCache o-- Cache
    SerializedCache o-- Cache
    ScheduledCache o-- Cache
```

### 6.4 一级缓存实现

```java
/**
 * 一级缓存 - BaseExecutor 中的实现
 */
public abstract class BaseExecutor implements Executor {
    
    // 一级缓存
    protected PerpetualCache localCache;
    
    @Override
    public <E> List<E> query(MappedStatement ms, Object parameter, 
                             RowBounds rowBounds, ResultHandler resultHandler,
                             CacheKey key, BoundSql boundSql) throws SQLException {
        
        // 如果配置了 flushCache=true，清空缓存
        if (queryStack == 0 && ms.isFlushCacheRequired()) {
            clearLocalCache();
        }
        
        List<E> list;
        try {
            queryStack++;
            
            // 从一级缓存获取结果
            list = resultHandler == null 
                   ? (List<E>) localCache.getObject(key) 
                   : null;
                   
            if (list != null) {
                // 缓存命中
                handleLocallyCachedOutputParameters(ms, key, parameter, boundSql);
            } else {
                // 缓存未命中，查询数据库
                list = queryFromDatabase(ms, parameter, rowBounds, 
                                         resultHandler, key, boundSql);
            }
        } finally {
            queryStack--;
        }
        
        return list;
    }
    
    /**
     * 创建缓存 Key
     */
    @Override
    public CacheKey createCacheKey(MappedStatement ms, Object parameterObject,
                                   RowBounds rowBounds, BoundSql boundSql) {
        CacheKey cacheKey = new CacheKey();
        
        // 缓存 Key 由以下几部分组成
        cacheKey.update(ms.getId());                // Statement ID
        cacheKey.update(rowBounds.getOffset());     // 分页偏移
        cacheKey.update(rowBounds.getLimit());      // 分页大小
        cacheKey.update(boundSql.getSql());         // SQL 语句
        
        // 参数值
        List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
        for (ParameterMapping pm : parameterMappings) {
            if (pm.getMode() != ParameterMode.OUT) {
                Object value = /* 获取参数值 */;
                cacheKey.update(value);
            }
        }
        
        return cacheKey;
    }
}
```

### 6.5 二级缓存实现

```java
/**
 * 二级缓存 - CachingExecutor (装饰器模式)
 */
public class CachingExecutor implements Executor {
    
    private final Executor delegate;              // 被装饰的执行器
    private final TransactionalCacheManager tcm = new TransactionalCacheManager();
    
    @Override
    public <E> List<E> query(MappedStatement ms, Object parameterObject, 
                             RowBounds rowBounds, ResultHandler resultHandler,
                             CacheKey key, BoundSql boundSql) throws SQLException {
        
        // 获取 MappedStatement 对应的二级缓存
        Cache cache = ms.getCache();
        
        if (cache != null) {
            flushCacheIfRequired(ms);
            
            if (ms.isUseCache() && resultHandler == null) {
                // 从二级缓存获取结果
                List<E> list = (List<E>) tcm.getObject(cache, key);
                
                if (list == null) {
                    // 二级缓存未命中，查询一级缓存/数据库
                    list = delegate.query(ms, parameterObject, rowBounds, 
                                          resultHandler, key, boundSql);
                    
                    // 将结果放入二级缓存（暂存）
                    tcm.putObject(cache, key, list);
                }
                
                return list;
            }
        }
        
        return delegate.query(ms, parameterObject, rowBounds, 
                             resultHandler, key, boundSql);
    }
    
    @Override
    public void commit(boolean required) throws SQLException {
        delegate.commit(required);
        tcm.commit();  // 提交时才真正写入二级缓存
    }
    
    @Override
    public void rollback(boolean required) throws SQLException {
        try {
            delegate.rollback(required);
        } finally {
            if (required) {
                tcm.rollback();  // 回滚时清空暂存区
            }
        }
    }
}
```

### 6.6 缓存配置示例

```xml
<!-- 开启二级缓存 -->
<mapper namespace="com.example.mapper.UserMapper">
    
    <!-- 配置二级缓存 -->
    <cache 
        eviction="LRU"           
        flushInterval="60000"    
        size="1024"              
        readOnly="false"/>       
    
    <!-- 
        eviction: 淘汰策略 (LRU/FIFO/SOFT/WEAK)
        flushInterval: 刷新间隔（毫秒）
        size: 缓存数量
        readOnly: 只读（true返回相同实例，false返回拷贝）
    -->
    
    <select id="selectById" resultType="User" useCache="true">
        SELECT * FROM user WHERE id = #{id}
    </select>
    
    <update id="updateById" flushCache="true">
        UPDATE user SET name = #{name} WHERE id = #{id}
    </update>
    
</mapper>
```

------

## 7. 插件机制

### 7.1 插件原理

```mermaid
flowchart TB
    subgraph Interceptable["可拦截的四大对象"]
        E[Executor<br/>执行器]
        SH[StatementHandler<br/>语句处理器]
        PH[ParameterHandler<br/>参数处理器]
        RH[ResultSetHandler<br/>结果集处理器]
    end
    
    subgraph InterceptMethods["可拦截方法"]
        E1[update, query, commit<br/>rollback, flushStatements...]
        SH1[prepare, parameterize<br/>batch, update, query]
        PH1[getParameterObject<br/>setParameters]
        RH1[handleResultSets<br/>handleOutputParameters]
    end
    
    E --- E1
    SH --- SH1
    PH --- PH1
    RH --- RH1
    
    subgraph Plugin["插件机制"]
        P1[Interceptor 接口]
        P2[Plugin 代理工具]
        P3[InterceptorChain 责任链]
    end
    
    Plugin --> Interceptable
```

### 7.2 插件执行流程

```mermaid
sequenceDiagram
    autonumber
    participant Config as Configuration
    participant Chain as InterceptorChain
    participant Plugin as Plugin
    participant Interceptor as 自定义Interceptor
    participant Target as 目标对象
    
    Config->>Config: newExecutor()
    Config->>Chain: pluginAll(executor)
    
    loop 遍历所有拦截器
        Chain->>Interceptor: plugin(target)
        Interceptor->>Plugin: wrap(target, this)
        
        Plugin->>Plugin: 解析@Intercepts注解
        Plugin->>Plugin: 获取签名方法
        
        alt 需要代理
            Plugin->>Plugin: Proxy.newProxyInstance()
            Plugin-->>Interceptor: 代理对象
        else 不需要代理
            Plugin-->>Interceptor: 原对象
        end
        
        Interceptor-->>Chain: 代理/原对象
    end
    
    Chain-->>Config: 最终代理对象
    
    Note over Config,Target: 方法调用时
    
    Config->>Plugin: invoke(proxy, method, args)
    
    alt 方法需要拦截
        Plugin->>Interceptor: intercept(Invocation)
        Interceptor->>Interceptor: 前置处理
        Interceptor->>Target: invocation.proceed()
        Target-->>Interceptor: 结果
        Interceptor->>Interceptor: 后置处理
        Interceptor-->>Plugin: 结果
    else 方法不需要拦截
        Plugin->>Target: method.invoke(target, args)
        Target-->>Plugin: 结果
    end
    
    Plugin-->>Config: 结果
```

### 7.3 插件类结构

```mermaid
classDiagram
    class Interceptor {
        <<interface>>
        +intercept(Invocation invocation) Object
        +plugin(Object target) Object
        +setProperties(Properties properties) void
    }
    
    class Plugin {
        -Object target
        -Interceptor interceptor
        -Map~Class, Set~Method~~ signatureMap
        +wrap(Object target, Interceptor interceptor)$ Object
        +invoke(Object proxy, Method method, Object[] args) Object
    }
    
    class Invocation {
        -Object target
        -Method method
        -Object[] args
        +proceed() Object
        +getTarget() Object
        +getMethod() Method
        +getArgs() Object[]
    }
    
    class InterceptorChain {
        -List~Interceptor~ interceptors
        +pluginAll(Object target) Object
        +addInterceptor(Interceptor interceptor) void
    }
    
    class Intercepts {
        <<annotation>>
        +value() Signature[]
    }
    
    class Signature {
        <<annotation>>
        +type() Class
        +method() String
        +args() Class[]
    }
    
    Interceptor ..> Plugin : 使用
    Plugin ..> Invocation : 创建
    InterceptorChain o-- Interceptor
    Interceptor ..> Intercepts : 标注
    Intercepts *-- Signature
```

### 7.4 自定义插件示例

```java
/**
 * SQL 执行时间统计插件
 */
@Intercepts({
    @Signature(
        type = Executor.class, 
        method = "query",
        args = {MappedStatement.class, Object.class, 
                RowBounds.class, ResultHandler.class}
    ),
    @Signature(
        type = Executor.class, 
        method = "update",
        args = {MappedStatement.class, Object.class}
    )
})
public class SqlExecutionTimePlugin implements Interceptor {
    
    private static final Logger log = LoggerFactory.getLogger(
        SqlExecutionTimePlugin.class);
    
    private long slowSqlThreshold = 1000; // 慢 SQL 阈值（毫秒）
    
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        // 1. 获取执行信息
        MappedStatement ms = (MappedStatement) invocation.getArgs()[0];
        String sqlId = ms.getId();
        
        // 2. 记录开始时间
        long startTime = System.currentTimeMillis();
        
        try {
            // 3. 执行原方法
            return invocation.proceed();
        } finally {
            // 4. 计算执行时间
            long executionTime = System.currentTimeMillis() - startTime;
            
            // 5. 慢 SQL 告警
            if (executionTime > slowSqlThreshold) {
                log.warn("慢SQL告警 - ID: {}, 耗时: {}ms", sqlId, executionTime);
            } else {
                log.debug("SQL执行 - ID: {}, 耗时: {}ms", sqlId, executionTime);
            }
        }
    }
    
    @Override
    public Object plugin(Object target) {
        // 只代理 Executor
        if (target instanceof Executor) {
            return Plugin.wrap(target, this);
        }
        return target;
    }
    
    @Override
    public void setProperties(Properties properties) {
        String threshold = properties.getProperty("slowSqlThreshold");
        if (threshold != null) {
            this.slowSqlThreshold = Long.parseLong(threshold);
        }
    }
}

/**
 * 分页插件示例
 */
@Intercepts({
    @Signature(
        type = StatementHandler.class, 
        method = "prepare", 
        args = {Connection.class, Integer.class}
    )
})
public class PaginationPlugin implements Interceptor {
    
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        StatementHandler statementHandler = (StatementHandler) invocation.getTarget();
        
        // 使用 MetaObject 操作对象属性
        MetaObject metaObject = SystemMetaObject.forObject(statementHandler);
        
        // 获取原始 SQL
        String sql = (String) metaObject.getValue("delegate.boundSql.sql");
        
        // 获取参数对象
        Object parameterObject = metaObject.getValue("delegate.boundSql.parameterObject");
        
        // 判断是否需要分页
        if (parameterObject instanceof PageParam) {
            PageParam page = (PageParam) parameterObject;
            
            // 修改 SQL
            String pageSql = sql + " LIMIT " + page.getOffset() 
                           + ", " + page.getPageSize();
            
            metaObject.setValue("delegate.boundSql.sql", pageSql);
        }
        
        return invocation.proceed();
    }
}
```

### 7.5 Plugin 核心源码

```java
/**
 * Plugin - 创建代理对象的工具类
 */
public class Plugin implements InvocationHandler {
    
    private final Object target;
    private final Interceptor interceptor;
    private final Map<Class<?>, Set<Method>> signatureMap;
    
    /**
     * 包装目标对象
     */
    public static Object wrap(Object target, Interceptor interceptor) {
        // 1. 获取拦截器的签名信息
        Map<Class<?>, Set<Method>> signatureMap = getSignatureMap(interceptor);
        
        // 2. 获取目标对象的类型
        Class<?> type = target.getClass();
        
        // 3. 获取目标对象需要被代理的接口
        Class<?>[] interfaces = getAllInterfaces(type, signatureMap);
        
        // 4. 如果有需要代理的接口，创建代理对象
        if (interfaces.length > 0) {
            return Proxy.newProxyInstance(
                type.getClassLoader(),
                interfaces,
                new Plugin(target, interceptor, signatureMap));
        }
        
        return target;
    }
    
    /**
     * 代理方法调用
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) 
            throws Throwable {
        try {
            // 获取当前接口的可拦截方法
            Set<Method> methods = signatureMap.get(method.getDeclaringClass());
            
            // 如果当前方法需要被拦截
            if (methods != null && methods.contains(method)) {
                // 调用拦截器的 intercept 方法
                return interceptor.intercept(new Invocation(target, method, args));
            }
            
            // 不需要拦截，直接调用原方法
            return method.invoke(target, args);
            
        } catch (Exception e) {
            throw ExceptionUtil.unwrapThrowable(e);
        }
    }
    
    /**
     * 解析 @Intercepts 注解获取签名信息
     */
    private static Map<Class<?>, Set<Method>> getSignatureMap(Interceptor interceptor) {
        Intercepts interceptsAnnotation = interceptor.getClass()
            .getAnnotation(Intercepts.class);
            
        if (interceptsAnnotation == null) {
            throw new PluginException("No @Intercepts annotation was found");
        }
        
        Signature[] sigs = interceptsAnnotation.value();
        Map<Class<?>, Set<Method>> signatureMap = new HashMap<>();
        
        for (Signature sig : sigs) {
            Set<Method> methods = signatureMap.computeIfAbsent(
                sig.type(), k -> new HashSet<>());
            
            Method method = sig.type().getMethod(sig.method(), sig.args());
            methods.add(method);
        }
        
        return signatureMap;
    }
}
```

------

## 8. 总结

### 8.1 MyBatis 完整执行流程

```mermaid
flowchart TB
    subgraph Init["1. 初始化阶段"]
        A1[mybatis-config.xml] --> A2[XMLConfigBuilder]
        A2 --> A3[Configuration]
        A4[Mapper.xml] --> A5[XMLMapperBuilder]
        A5 --> A6[MappedStatement]
        A6 --> A3
        A3 --> A7[SqlSessionFactory]
    end
    
    subgraph Execute["2. 执行阶段"]
        B1[调用Mapper方法] --> B2[MapperProxy<br/>JDK动态代理]
        B2 --> B3[MapperMethod]
        B3 --> B4[SqlSession<br/>selectOne/insert...]
        B4 --> B5[Executor<br/>执行器]
        
        B5 --> B6{缓存}
        B6 -->|命中| B7[返回结果]
        B6 -->|未命中| B8[StatementHandler]
        
        B8 --> B9[ParameterHandler<br/>设置参数]
        B9 --> B10[TypeHandler<br/>类型转换]
        B10 --> B11[(Database)]
        B11 --> B12[ResultSetHandler<br/>结果映射]
        B12 --> B13[TypeHandler<br/>类型转换]
        B13 --> B7
    end
    
    Init --> Execute
```

### 8.2 核心设计模式

```mermaid
mindmap
  root((MyBatis<br/>设计模式))
    创建型
      工厂模式
        SqlSessionFactory
        MapperProxyFactory
      建造者模式
        SqlSessionFactoryBuilder
        XMLConfigBuilder
      单例模式
        Configuration
        ErrorContext
    结构型
      代理模式
        MapperProxy
        Plugin
      装饰器模式
        Cache装饰器
        CachingExecutor
      组合模式
        SqlNode树
        ResultMap
    行为型
      模板方法
        BaseExecutor
        BaseTypeHandler
      策略模式
        Executor类型
        StatementHandler类型
      责任链模式
        插件机制
        InterceptorChain
      迭代器模式
        PropertyTokenizer
```

### 8.3 核心组件职责

| 组件                         | 职责                | 生命周期   |
| ---------------------------- | ------------------- | ---------- |
| **SqlSessionFactoryBuilder** | 解析配置，创建工厂  | 用后即弃   |
| **SqlSessionFactory**        | 创建 SqlSession     | 应用级单例 |
| **SqlSession**               | 执行SQL，获取Mapper | 请求级别   |
| **Executor**                 | 管理缓存，执行SQL   | 请求级别   |
| **StatementHandler**         | 操作Statement       | 单次执行   |
| **ParameterHandler**         | 设置SQL参数         | 单次执行   |
| **ResultSetHandler**         | 处理结果集          | 单次执行   |
| **TypeHandler**              | Java/JDBC类型转换   | 应用级别   |

### 8.4 缓存对比

```mermaid
flowchart LR
    subgraph L1["一级缓存"]
        direction TB
        L1A[作用域: SqlSession]
        L1B[默认开启]
        L1C[无法关闭]
        L1D[事务内有效]
        L1E[HashMap存储]
    end
    
    subgraph L2["二级缓存"]
        direction TB
        L2A[作用域: Mapper Namespace]
        L2B[默认关闭]
        L2C[需手动开启]
        L2D[跨Session有效]
        L2E[装饰器链存储]
    end
    
    L1 -.-> L2
```

### 8.5 关键要点

```java
/**
 * MyBatis 核心要点总结
 */
public class MyBatisSummary {
    
    /*
     * ⭐ 初始化
     *    1. 解析 XML 配置文件 → Configuration
     *    2. 解析 Mapper.xml → MappedStatement
     *    3. 注册 Mapper 接口 → MapperRegistry
     *    4. 创建 SqlSessionFactory
     *
     * ⭐ Mapper 代理
     *    1. getMapper() → MapperProxyFactory.newInstance()
     *    2. JDK 动态代理创建代理对象
     *    3. 方法调用 → MapperProxy.invoke()
     *    4. 解析方法类型 → 调用 SqlSession 对应方法
     *
     * ⭐ SQL 执行
     *    1. Executor: 执行入口，管理缓存
     *    2. StatementHandler: 操作 JDBC Statement
     *    3. ParameterHandler: 设置 SQL 参数
     *    4. ResultSetHandler: 处理查询结果
     *    5. TypeHandler: Java ↔ JDBC 类型转换
     *
     * ⭐ 缓存机制
     *    1. 一级缓存: SqlSession 级别，默认开启
     *    2. 二级缓存: Mapper 级别，需要手动开启
     *    3. 装饰器模式: 灵活组合缓存功能
     *    4. 事务缓存: 保证数据一致性
     *
     * ⭐ 插件机制
     *    1. 基于 JDK 动态代理实现
     *    2. 可拦截: Executor, StatementHandler, 
     *              ParameterHandler, ResultSetHandler
     *    3. 责任链模式处理多个插件
     *    4. 使用 @Intercepts + @Signature 声明拦截点
     */
}
```

