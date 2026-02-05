import{_ as s,o as a,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const S=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/89 - 开源实战五（下）：总结MyBatis框架中用到的10种设计模式.md","filePath":"books/design-pattern/89 - 开源实战五（下）：总结MyBatis框架中用到的10种设计模式.md"}'),l={name:"books/design-pattern/89 - 开源实战五（下）：总结MyBatis框架中用到的10种设计模式.md"};function i(t,n,c,o,r,u){return a(),p("div",null,[...n[0]||(n[0]=[e(`<p>上节课，我带你剖析了利用职责链模式和动态代理模式实现MyBatis Plugin。至此，我们已经学习了三种职责链常用的应用场景：过滤器（Servlet Filter）、拦截器（Spring Interceptor）、插件（MyBatis Plugin）。</p><p>今天，我们再对MyBatis用到的设计模式做一个总结。它用到的设计模式也不少，就我所知的不下十几种。有些我们前面已经讲到，有些比较简单。有了前面这么多讲的学习和训练，我想你现在应该已经具备了一定的研究和分析能力，能够自己做查缺补漏，把提到的所有源码都搞清楚。所以，在今天的课程中，如果有哪里有疑问，你尽可以去查阅源码，自己先去学习一下，有不懂的地方，再到评论区和大家一起交流。</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="sqlsessionfactorybuilder-为什么要用建造者模式来创建sqlsessionfactory" tabindex="-1">SqlSessionFactoryBuilder：为什么要用建造者模式来创建SqlSessionFactory？ <a class="header-anchor" href="#sqlsessionfactorybuilder-为什么要用建造者模式来创建sqlsessionfactory" aria-label="Permalink to &quot;SqlSessionFactoryBuilder：为什么要用建造者模式来创建SqlSessionFactory？&quot;">&amp;ZeroWidthSpace;</a></h2><p>在<a href="https://time.geekbang.org/column/article/239239" target="_blank" rel="noreferrer">第87讲</a>中，我们通过一个查询用户的例子展示了用MyBatis进行数据库编程。为了方便你查看，我把相关的代码重新摘抄到这里。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class MyBatisDemo {</span></span>
<span class="line"><span>  public static void main(String[] args) throws IOException {</span></span>
<span class="line"><span>    Reader reader = Resources.getResourceAsReader(&quot;mybatis.xml&quot;);</span></span>
<span class="line"><span>    SqlSessionFactory sessionFactory = new SqlSessionFactoryBuilder().build(reader);</span></span>
<span class="line"><span>    SqlSession session = sessionFactory.openSession();</span></span>
<span class="line"><span>    UserMapper userMapper = session.getMapper(UserMapper.class);</span></span>
<span class="line"><span>    UserDo userDo = userMapper.selectById(8);</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>针对这段代码，请你思考一下下面这个问题。</p><p>之前讲到建造者模式的时候，我们使用Builder类来创建对象，一般都是先级联一组setXXX()方法来设置属性，然后再调用build()方法最终创建对象。但是，在上面这段代码中，通过SqlSessionFactoryBuilder来创建SqlSessionFactory并不符合这个套路。它既没有setter方法，而且build()方法也并非无参，需要传递参数。除此之外，从上面的代码来看，SqlSessionFactory对象的创建过程也并不复杂。那直接通过构造函数来创建SqlSessionFactory不就行了吗？为什么还要借助建造者模式创建SqlSessionFactory呢？</p><p>要回答这个问题，我们就要先看下SqlSessionFactoryBuilder类的源码。我把源码摘抄到了这里，如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SqlSessionFactoryBuilder {</span></span>
<span class="line"><span>  public SqlSessionFactory build(Reader reader) {</span></span>
<span class="line"><span>    return build(reader, null, null);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public SqlSessionFactory build(Reader reader, String environment) {</span></span>
<span class="line"><span>    return build(reader, environment, null);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public SqlSessionFactory build(Reader reader, Properties properties) {</span></span>
<span class="line"><span>    return build(reader, null, properties);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public SqlSessionFactory build(Reader reader, String environment, Properties properties) {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      XMLConfigBuilder parser = new XMLConfigBuilder(reader, environment, properties);</span></span>
<span class="line"><span>      return build(parser.parse());</span></span>
<span class="line"><span>    } catch (Exception e) {</span></span>
<span class="line"><span>      throw ExceptionFactory.wrapException(&quot;Error building SqlSession.&quot;, e);</span></span>
<span class="line"><span>    } finally {</span></span>
<span class="line"><span>      ErrorContext.instance().reset();</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        reader.close();</span></span>
<span class="line"><span>      } catch (IOException e) {</span></span>
<span class="line"><span>        // Intentionally ignore. Prefer previous error.</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public SqlSessionFactory build(InputStream inputStream) {</span></span>
<span class="line"><span>    return build(inputStream, null, null);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public SqlSessionFactory build(InputStream inputStream, String environment) {</span></span>
<span class="line"><span>    return build(inputStream, environment, null);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public SqlSessionFactory build(InputStream inputStream, Properties properties) {</span></span>
<span class="line"><span>    return build(inputStream, null, properties);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public SqlSessionFactory build(InputStream inputStream, String environment, Properties properties) {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      XMLConfigBuilder parser = new XMLConfigBuilder(inputStream, environment, properties);</span></span>
<span class="line"><span>      return build(parser.parse());</span></span>
<span class="line"><span>    } catch (Exception e) {</span></span>
<span class="line"><span>      throw ExceptionFactory.wrapException(&quot;Error building SqlSession.&quot;, e);</span></span>
<span class="line"><span>    } finally {</span></span>
<span class="line"><span>      ErrorContext.instance().reset();</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        inputStream.close();</span></span>
<span class="line"><span>      } catch (IOException e) {</span></span>
<span class="line"><span>        // Intentionally ignore. Prefer previous error.</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>  public SqlSessionFactory build(Configuration config) {</span></span>
<span class="line"><span>    return new DefaultSqlSessionFactory(config);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>SqlSessionFactoryBuilder类中有大量的build()重载函数。为了方便你查看，以及待会儿跟SqlSessionFactory类的代码作对比，我把重载函数定义抽象出来，贴到这里。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SqlSessionFactoryBuilder {</span></span>
<span class="line"><span>  public SqlSessionFactory build(Reader reader);</span></span>
<span class="line"><span>  public SqlSessionFactory build(Reader reader, String environment);</span></span>
<span class="line"><span>  public SqlSessionFactory build(Reader reader, Properties properties);</span></span>
<span class="line"><span>  public SqlSessionFactory build(Reader reader, String environment, Properties properties);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  public SqlSessionFactory build(InputStream inputStream);</span></span>
<span class="line"><span>  public SqlSessionFactory build(InputStream inputStream, String environment);</span></span>
<span class="line"><span>  public SqlSessionFactory build(InputStream inputStream, Properties properties);</span></span>
<span class="line"><span>  public SqlSessionFactory build(InputStream inputStream, String environment, Properties properties);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 上面所有的方法最终都调用这个方法    </span></span>
<span class="line"><span>  public SqlSessionFactory build(Configuration config);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们知道，如果一个类包含很多成员变量，而构建对象并不需要设置所有的成员变量，只需要选择性地设置其中几个就可以。为了满足这样的构建需求，我们就要定义多个包含不同参数列表的构造函数。为了避免构造函数过多、参数列表过长，我们一般通过无参构造函数加setter方法或者通过建造者模式来解决。</p><p>从建造者模式的设计初衷上来看，SqlSessionFactoryBuilder虽然带有Builder后缀，但不要被它的名字所迷惑，它并不是标准的建造者模式。一方面，原始类SqlSessionFactory的构建只需要一个参数，并不复杂。另一方面，Builder类SqlSessionFactoryBuilder仍然定义了n多包含不同参数列表的构造函数。</p><p>实际上，SqlSessionFactoryBuilder设计的初衷只不过是为了简化开发。因为构建SqlSessionFactory需要先构建Configuration，而构建Configuration是非常复杂的，需要做很多工作，比如配置的读取、解析、创建n多对象等。为了将构建SqlSessionFactory的过程隐藏起来，对程序员透明，MyBatis就设计了SqlSessionFactoryBuilder类封装这些构建细节。</p><h2 id="sqlsessionfactory-到底属于工厂模式还是建造器模式" tabindex="-1">SqlSessionFactory：到底属于工厂模式还是建造器模式？ <a class="header-anchor" href="#sqlsessionfactory-到底属于工厂模式还是建造器模式" aria-label="Permalink to &quot;SqlSessionFactory：到底属于工厂模式还是建造器模式？&quot;">&amp;ZeroWidthSpace;</a></h2><p>在刚刚那段MyBatis示例代码中，我们通过SqlSessionFactoryBuilder创建了SqlSessionFactory，然后再通过SqlSessionFactory创建了SqlSession。刚刚我们讲了SqlSessionFactoryBuilder，现在我们再来看下SqlSessionFactory。</p><p>从名字上，你可能已经猜到，SqlSessionFactory是一个工厂类，用到的设计模式是工厂模式。不过，它跟SqlSessionFactoryBuilder类似，名字有很大的迷惑性。实际上，它也并不是标准的工厂模式。为什么这么说呢？我们先来看下SqlSessionFactory类的源码。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface SqlSessionFactory {</span></span>
<span class="line"><span>  SqlSession openSession();</span></span>
<span class="line"><span>  SqlSession openSession(boolean autoCommit);</span></span>
<span class="line"><span>  SqlSession openSession(Connection connection);</span></span>
<span class="line"><span>  SqlSession openSession(TransactionIsolationLevel level);</span></span>
<span class="line"><span>  SqlSession openSession(ExecutorType execType);</span></span>
<span class="line"><span>  SqlSession openSession(ExecutorType execType, boolean autoCommit);</span></span>
<span class="line"><span>  SqlSession openSession(ExecutorType execType, TransactionIsolationLevel level);</span></span>
<span class="line"><span>  SqlSession openSession(ExecutorType execType, Connection connection);</span></span>
<span class="line"><span>  Configuration getConfiguration();</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>SqlSessionFactory是一个接口，DefaultSqlSessionFactory是它唯一的实现类。DefaultSqlSessionFactory源码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DefaultSqlSessionFactory implements SqlSessionFactory {</span></span>
<span class="line"><span>  private final Configuration configuration;</span></span>
<span class="line"><span>  public DefaultSqlSessionFactory(Configuration configuration) {</span></span>
<span class="line"><span>    this.configuration = configuration;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public SqlSession openSession() {</span></span>
<span class="line"><span>    return openSessionFromDataSource(configuration.getDefaultExecutorType(), null, false);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public SqlSession openSession(boolean autoCommit) {</span></span>
<span class="line"><span>    return openSessionFromDataSource(configuration.getDefaultExecutorType(), null, autoCommit);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public SqlSession openSession(ExecutorType execType) {</span></span>
<span class="line"><span>    return openSessionFromDataSource(execType, null, false);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public SqlSession openSession(TransactionIsolationLevel level) {</span></span>
<span class="line"><span>    return openSessionFromDataSource(configuration.getDefaultExecutorType(), level, false);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public SqlSession openSession(ExecutorType execType, TransactionIsolationLevel level) {</span></span>
<span class="line"><span>    return openSessionFromDataSource(execType, level, false);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public SqlSession openSession(ExecutorType execType, boolean autoCommit) {</span></span>
<span class="line"><span>    return openSessionFromDataSource(execType, null, autoCommit);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public SqlSession openSession(Connection connection) {</span></span>
<span class="line"><span>    return openSessionFromConnection(configuration.getDefaultExecutorType(), connection);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public SqlSession openSession(ExecutorType execType, Connection connection) {</span></span>
<span class="line"><span>    return openSessionFromConnection(execType, connection);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Configuration getConfiguration() {</span></span>
<span class="line"><span>    return configuration;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private SqlSession openSessionFromDataSource(ExecutorType execType, TransactionIsolationLevel level, boolean autoCommit) {</span></span>
<span class="line"><span>    Transaction tx = null;</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      final Environment environment = configuration.getEnvironment();</span></span>
<span class="line"><span>      final TransactionFactory transactionFactory = getTransactionFactoryFromEnvironment(environment);</span></span>
<span class="line"><span>      tx = transactionFactory.newTransaction(environment.getDataSource(), level, autoCommit);</span></span>
<span class="line"><span>      final Executor executor = configuration.newExecutor(tx, execType);</span></span>
<span class="line"><span>      return new DefaultSqlSession(configuration, executor, autoCommit);</span></span>
<span class="line"><span>    } catch (Exception e) {</span></span>
<span class="line"><span>      closeTransaction(tx); // may have fetched a connection so lets call close()</span></span>
<span class="line"><span>      throw ExceptionFactory.wrapException(&quot;Error opening session.  Cause: &quot; + e, e);</span></span>
<span class="line"><span>    } finally {</span></span>
<span class="line"><span>      ErrorContext.instance().reset();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private SqlSession openSessionFromConnection(ExecutorType execType, Connection connection) {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      boolean autoCommit;</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        autoCommit = connection.getAutoCommit();</span></span>
<span class="line"><span>      } catch (SQLException e) {</span></span>
<span class="line"><span>        // Failover to true, as most poor drivers</span></span>
<span class="line"><span>        // or databases won&#39;t support transactions</span></span>
<span class="line"><span>        autoCommit = true;</span></span>
<span class="line"><span>      }      </span></span>
<span class="line"><span>      final Environment environment = configuration.getEnvironment();</span></span>
<span class="line"><span>      final TransactionFactory transactionFactory = getTransactionFactoryFromEnvironment(environment);</span></span>
<span class="line"><span>      final Transaction tx = transactionFactory.newTransaction(connection);</span></span>
<span class="line"><span>      final Executor executor = configuration.newExecutor(tx, execType);</span></span>
<span class="line"><span>      return new DefaultSqlSession(configuration, executor, autoCommit);</span></span>
<span class="line"><span>    } catch (Exception e) {</span></span>
<span class="line"><span>      throw ExceptionFactory.wrapException(&quot;Error opening session.  Cause: &quot; + e, e);</span></span>
<span class="line"><span>    } finally {</span></span>
<span class="line"><span>      ErrorContext.instance().reset();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //...省略部分代码...</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>从SqlSessionFactory和DefaultSqlSessionFactory的源码来看，它的设计非常类似刚刚讲到的SqlSessionFactoryBuilder，通过重载多个openSession()函数，支持通过组合autoCommit、Executor、Transaction等不同参数，来创建SqlSession对象。标准的工厂模式通过type来创建继承同一个父类的不同子类对象，而这里只不过是通过传递进不同的参数，来创建同一个类的对象。所以，它更像建造者模式。</p><p>虽然设计思路基本一致，但一个叫xxxBuilder（SqlSessionFactoryBuilder），一个叫xxxFactory（SqlSessionFactory）。而且，叫xxxBuilder的也并非标准的建造者模式，叫xxxFactory的也并非标准的工厂模式。所以，我个人觉得，MyBatis对这部分代码的设计还是值得优化的。</p><p>实际上，这两个类的作用只不过是为了创建SqlSession对象，没有其他作用。所以，我更建议参照Spring的设计思路，把SqlSessionFactoryBuilder和SqlSessionFactory的逻辑，放到一个叫“ApplicationContext”的类中。让这个类来全权负责读入配置文件，创建Congfiguration，生成SqlSession。</p><h2 id="baseexecutor-模板模式跟普通的继承有什么区别" tabindex="-1">BaseExecutor：模板模式跟普通的继承有什么区别？ <a class="header-anchor" href="#baseexecutor-模板模式跟普通的继承有什么区别" aria-label="Permalink to &quot;BaseExecutor：模板模式跟普通的继承有什么区别？&quot;">&amp;ZeroWidthSpace;</a></h2><p>如果去查阅SqlSession与DefaultSqlSession的源码，你会发现，SqlSession执行SQL的业务逻辑，都是委托给了Executor来实现。Executor相关的类主要是用来执行SQL。其中，Executor本身是一个接口；BaseExecutor是一个抽象类，实现了Executor接口；而BatchExecutor、SimpleExecutor、ReuseExecutor三个类继承BaseExecutor抽象类。</p><p>那BatchExecutor、SimpleExecutor、ReuseExecutor三个类跟BaseExecutor是简单的继承关系，还是模板模式关系呢？怎么来判断呢？我们看一下BaseExecutor的源码就清楚了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class BaseExecutor implements Executor {</span></span>
<span class="line"><span>  //...省略其他无关代码...</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public int update(MappedStatement ms, Object parameter) throws SQLException {</span></span>
<span class="line"><span>    ErrorContext.instance().resource(ms.getResource()).activity(&quot;executing an update&quot;).object(ms.getId());</span></span>
<span class="line"><span>    if (closed) {</span></span>
<span class="line"><span>      throw new ExecutorException(&quot;Executor was closed.&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    clearLocalCache();</span></span>
<span class="line"><span>    return doUpdate(ms, parameter);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public List&lt;BatchResult&gt; flushStatements(boolean isRollBack) throws SQLException {</span></span>
<span class="line"><span>    if (closed) {</span></span>
<span class="line"><span>      throw new ExecutorException(&quot;Executor was closed.&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return doFlushStatements(isRollBack);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private &lt;E&gt; List&lt;E&gt; queryFromDatabase(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {</span></span>
<span class="line"><span>    List&lt;E&gt; list;</span></span>
<span class="line"><span>    localCache.putObject(key, EXECUTION_PLACEHOLDER);</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      list = doQuery(ms, parameter, rowBounds, resultHandler, boundSql);</span></span>
<span class="line"><span>    } finally {</span></span>
<span class="line"><span>      localCache.removeObject(key);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    localCache.putObject(key, list);</span></span>
<span class="line"><span>    if (ms.getStatementType() == StatementType.CALLABLE) {</span></span>
<span class="line"><span>      localOutputParameterCache.putObject(key, parameter);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return list;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public &lt;E&gt; Cursor&lt;E&gt; queryCursor(MappedStatement ms, Object parameter, RowBounds rowBounds) throws SQLException {</span></span>
<span class="line"><span>    BoundSql boundSql = ms.getBoundSql(parameter);</span></span>
<span class="line"><span>    return doQueryCursor(ms, parameter, rowBounds, boundSql);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected abstract int doUpdate(MappedStatement ms, Object parameter) throws SQLException;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected abstract List&lt;BatchResult&gt; doFlushStatements(boolean isRollback) throws SQLException;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected abstract &lt;E&gt; List&lt;E&gt; doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) throws SQLException;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected abstract &lt;E&gt; Cursor&lt;E&gt; doQueryCursor(MappedStatement ms, Object parameter, RowBounds rowBounds, BoundSql boundSql) throws SQLException;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>模板模式基于继承来实现代码复用。如果抽象类中包含模板方法，模板方法调用有待子类实现的抽象方法，那这一般就是模板模式的代码实现。而且，在命名上，模板方法与抽象方法一般是一一对应的，抽象方法在模板方法前面多一个“do”，比如，在BaseExecutor类中，其中一个模板方法叫update()，那对应的抽象方法就叫doUpdate()。</p><h2 id="sqlnode-如何利用解释器模式来解析动态sql" tabindex="-1">SqlNode：如何利用解释器模式来解析动态SQL？ <a class="header-anchor" href="#sqlnode-如何利用解释器模式来解析动态sql" aria-label="Permalink to &quot;SqlNode：如何利用解释器模式来解析动态SQL？&quot;">&amp;ZeroWidthSpace;</a></h2><p>支持配置文件中编写动态SQL，是MyBatis一个非常强大的功能。所谓动态SQL，就是在SQL中可以包含在trim、if、#{}等语法标签，在运行时根据条件来生成不同的SQL。这么说比较抽象，我举个例子解释一下。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;update id=&quot;update&quot; parameterType=&quot;com.xzg.cd.a89.User&quot;</span></span>
<span class="line"><span>   UPDATE user</span></span>
<span class="line"><span>   &lt;trim prefix=&quot;SET&quot; prefixOverrides=&quot;,&quot;&gt;</span></span>
<span class="line"><span>       &lt;if test=&quot;name != null and name != &#39;&#39;&quot;&gt;</span></span>
<span class="line"><span>           name = #{name}</span></span>
<span class="line"><span>       &lt;/if&gt;</span></span>
<span class="line"><span>       &lt;if test=&quot;age != null and age != &#39;&#39;&quot;&gt;</span></span>
<span class="line"><span>           , age = #{age}</span></span>
<span class="line"><span>       &lt;/if&gt;</span></span>
<span class="line"><span>       &lt;if test=&quot;birthday != null and birthday != &#39;&#39;&quot;&gt;</span></span>
<span class="line"><span>           , birthday = #{birthday}</span></span>
<span class="line"><span>       &lt;/if&gt;</span></span>
<span class="line"><span>   &lt;/trim&gt;</span></span>
<span class="line"><span>   where id = \${id}</span></span>
<span class="line"><span>&lt;/update&gt;</span></span></code></pre></div><p>显然，动态SQL的语法规则是MyBatis自定义的。如果想要根据语法规则，替换掉动态SQL中的动态元素，生成真正可以执行的SQL语句，MyBatis还需要实现对应的解释器。这一部分功能就可以看做是解释器模式的应用。实际上，如果你去查看它的代码实现，你会发现，它跟我们在前面讲解释器模式时举的那两个例子的代码结构非常相似。</p><p>我们前面提到，解释器模式在解释语法规则的时候，一般会把规则分割成小的单元，特别是可以嵌套的小单元，针对每个小单元来解析，最终再把解析结果合并在一起。这里也不例外。MyBatis把每个语法小单元叫SqlNode。SqlNode的定义如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface SqlNode {</span></span>
<span class="line"><span> boolean apply(DynamicContext context);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>对于不同的语法小单元，MyBatis定义不同的SqlNode实现类。</p><p><img src="https://static001.geekbang.org/resource/image/03/9f/0365945b91a00e3b98d0c09b2665f59f.png?wh=414%2A203" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>整个解释器的调用入口在DynamicSqlSource.getBoundSql方法中，它调用了rootSqlNode.apply(context)方法。因为整体的代码结构跟<a href="https://time.geekbang.org/column/article/225904" target="_blank" rel="noreferrer">第72讲</a>中的例子基本一致，所以每个SqlNode实现类的代码，我就不带你一块阅读了，感兴趣的话你可以自己去看下。</p><h2 id="errorcontext-如何实现一个线程唯一的单例模式" tabindex="-1">ErrorContext：如何实现一个线程唯一的单例模式？ <a class="header-anchor" href="#errorcontext-如何实现一个线程唯一的单例模式" aria-label="Permalink to &quot;ErrorContext：如何实现一个线程唯一的单例模式？&quot;">&amp;ZeroWidthSpace;</a></h2><p>在单例模式那一部分我们讲到，单例模式是进程唯一的。同时，我们还讲到单例模式的几种变形，比如线程唯一的单例、集群唯一的单例等。在MyBatis中，ErrorContext这个类就是标准单例的变形：线程唯一的单例。</p><p>它的代码实现我贴到下面了。它基于Java中的ThreadLocal来实现。如果不熟悉ThreadLocal，你可以回过头去看下<a href="https://time.geekbang.org/column/article/196790" target="_blank" rel="noreferrer">第43讲</a>中线程唯一的单例的实现方法。实际上，这里的ThreadLocal就相当于那里的ConcurrentHashMap。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ErrorContext {</span></span>
<span class="line"><span>  private static final String LINE_SEPARATOR = System.getProperty(&quot;line.separator&quot;,&quot;\\n&quot;);</span></span>
<span class="line"><span>  private static final ThreadLocal&lt;ErrorContext&gt; LOCAL = new ThreadLocal&lt;ErrorContext&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private ErrorContext stored;</span></span>
<span class="line"><span>  private String resource;</span></span>
<span class="line"><span>  private String activity;</span></span>
<span class="line"><span>  private String object;</span></span>
<span class="line"><span>  private String message;</span></span>
<span class="line"><span>  private String sql;</span></span>
<span class="line"><span>  private Throwable cause;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private ErrorContext() {</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static ErrorContext instance() {</span></span>
<span class="line"><span>    ErrorContext context = LOCAL.get();</span></span>
<span class="line"><span>    if (context == null) {</span></span>
<span class="line"><span>      context = new ErrorContext();</span></span>
<span class="line"><span>      LOCAL.set(context);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return context;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="cache-为什么要用装饰器模式而不设计成继承子类" tabindex="-1">Cache：为什么要用装饰器模式而不设计成继承子类？ <a class="header-anchor" href="#cache-为什么要用装饰器模式而不设计成继承子类" aria-label="Permalink to &quot;Cache：为什么要用装饰器模式而不设计成继承子类？&quot;">&amp;ZeroWidthSpace;</a></h2><p>我们前面提到，MyBatis是一个ORM框架。实际上，它不只是简单地完成了对象和数据库数据之间的互相转化，还提供了很多其他功能，比如缓存、事务等。接下来，我们再讲讲它的缓存实现。</p><p>在MyBatis中，缓存功能由接口Cache定义。PerpetualCache类是最基础的缓存类，是一个大小无限的缓存。除此之外，MyBatis还设计了9个包裹PerpetualCache类的装饰器类，用来实现功能增强。它们分别是：FifoCache、LoggingCache、LruCache、ScheduledCache、SerializedCache、SoftCache、SynchronizedCache、WeakCache、TransactionalCache。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface Cache {</span></span>
<span class="line"><span>  String getId();</span></span>
<span class="line"><span>  void putObject(Object key, Object value);</span></span>
<span class="line"><span>  Object getObject(Object key);</span></span>
<span class="line"><span>  Object removeObject(Object key);</span></span>
<span class="line"><span>  void clear();</span></span>
<span class="line"><span>  int getSize();</span></span>
<span class="line"><span>  ReadWriteLock getReadWriteLock();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class PerpetualCache implements Cache {</span></span>
<span class="line"><span>  private final String id;</span></span>
<span class="line"><span>  private Map&lt;Object, Object&gt; cache = new HashMap&lt;Object, Object&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public PerpetualCache(String id) {</span></span>
<span class="line"><span>    this.id = id;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public String getId() {</span></span>
<span class="line"><span>    return id;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public int getSize() {</span></span>
<span class="line"><span>    return cache.size();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void putObject(Object key, Object value) {</span></span>
<span class="line"><span>    cache.put(key, value);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Object getObject(Object key) {</span></span>
<span class="line"><span>    return cache.get(key);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Object removeObject(Object key) {</span></span>
<span class="line"><span>    return cache.remove(key);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void clear() {</span></span>
<span class="line"><span>    cache.clear();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReadWriteLock getReadWriteLock() {</span></span>
<span class="line"><span>    return null;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //省略部分代码...</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这9个装饰器类的代码结构都类似，我只将其中的LruCache的源码贴到这里。从代码中我们可以看出，它是标准的装饰器模式的代码实现。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class LruCache implements Cache {</span></span>
<span class="line"><span>  private final Cache delegate;</span></span>
<span class="line"><span>  private Map&lt;Object, Object&gt; keyMap;</span></span>
<span class="line"><span>  private Object eldestKey;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public LruCache(Cache delegate) {</span></span>
<span class="line"><span>    this.delegate = delegate;</span></span>
<span class="line"><span>    setSize(1024);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public String getId() {</span></span>
<span class="line"><span>    return delegate.getId();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public int getSize() {</span></span>
<span class="line"><span>    return delegate.getSize();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void setSize(final int size) {</span></span>
<span class="line"><span>    keyMap = new LinkedHashMap&lt;Object, Object&gt;(size, .75F, true) {</span></span>
<span class="line"><span>      private static final long serialVersionUID = 4267176411845948333L;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      protected boolean removeEldestEntry(Map.Entry&lt;Object, Object&gt; eldest) {</span></span>
<span class="line"><span>        boolean tooBig = size() &gt; size;</span></span>
<span class="line"><span>        if (tooBig) {</span></span>
<span class="line"><span>          eldestKey = eldest.getKey();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return tooBig;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void putObject(Object key, Object value) {</span></span>
<span class="line"><span>    delegate.putObject(key, value);</span></span>
<span class="line"><span>    cycleKeyList(key);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Object getObject(Object key) {</span></span>
<span class="line"><span>    keyMap.get(key); //touch</span></span>
<span class="line"><span>    return delegate.getObject(key);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Object removeObject(Object key) {</span></span>
<span class="line"><span>    return delegate.removeObject(key);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void clear() {</span></span>
<span class="line"><span>    delegate.clear();</span></span>
<span class="line"><span>    keyMap.clear();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReadWriteLock getReadWriteLock() {</span></span>
<span class="line"><span>    return null;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void cycleKeyList(Object key) {</span></span>
<span class="line"><span>    keyMap.put(key, key);</span></span>
<span class="line"><span>    if (eldestKey != null) {</span></span>
<span class="line"><span>      delegate.removeObject(eldestKey);</span></span>
<span class="line"><span>      eldestKey = null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>之所以MyBatis采用装饰器模式来实现缓存功能，是因为装饰器模式采用了组合，而非继承，更加灵活，能够有效地避免继承关系的组合爆炸。关于这一点，你可以回过头去看下<a href="https://time.geekbang.org/column/article/169593" target="_blank" rel="noreferrer">第10讲</a>的内容。</p><h2 id="propertytokenizer-如何利用迭代器模式实现一个属性解析器" tabindex="-1">PropertyTokenizer：如何利用迭代器模式实现一个属性解析器？ <a class="header-anchor" href="#propertytokenizer-如何利用迭代器模式实现一个属性解析器" aria-label="Permalink to &quot;PropertyTokenizer：如何利用迭代器模式实现一个属性解析器？&quot;">&amp;ZeroWidthSpace;</a></h2><p>前面我们讲到，迭代器模式常用来替代for循环遍历集合元素。Mybatis的PropertyTokenizer类实现了Java Iterator接口，是一个迭代器，用来对配置属性进行解析。具体的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// person[0].birthdate.year 会被分解为3个PropertyTokenizer对象。其中，第一个PropertyTokenizer对象的各个属性值如注释所示。\b</span></span>
<span class="line"><span>public class PropertyTokenizer implements Iterator&lt;PropertyTokenizer&gt; {</span></span>
<span class="line"><span>  private String name; // person</span></span>
<span class="line"><span>  private final String indexedName; // person[0]</span></span>
<span class="line"><span>  private String index; // 0</span></span>
<span class="line"><span>  private final String children; // birthdate.year</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public PropertyTokenizer(String fullname) {</span></span>
<span class="line"><span>    int delim = fullname.indexOf(&#39;.&#39;);</span></span>
<span class="line"><span>    if (delim &gt; -1) {</span></span>
<span class="line"><span>      name = fullname.substring(0, delim);</span></span>
<span class="line"><span>      children = fullname.substring(delim + 1);</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      name = fullname;</span></span>
<span class="line"><span>      children = null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    indexedName = name;</span></span>
<span class="line"><span>    delim = name.indexOf(&#39;[&#39;);</span></span>
<span class="line"><span>    if (delim &gt; -1) {</span></span>
<span class="line"><span>      index = name.substring(delim + 1, name.length() - 1);</span></span>
<span class="line"><span>      name = name.substring(0, delim);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public String getName() {</span></span>
<span class="line"><span>    return name;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public String getIndex() {</span></span>
<span class="line"><span>    return index;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public String getIndexedName() {</span></span>
<span class="line"><span>    return indexedName;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public String getChildren() {</span></span>
<span class="line"><span>    return children;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean hasNext() {</span></span>
<span class="line"><span>    return children != null;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public PropertyTokenizer next() {</span></span>
<span class="line"><span>    return new PropertyTokenizer(children);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void remove() {</span></span>
<span class="line"><span>    throw new UnsupportedOperationException(&quot;Remove is not supported, as it has no meaning in the context of properties.&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>实际上，PropertyTokenizer类也并非标准的迭代器类。它将配置的解析、解析之后的元素、迭代器，这三部分本该放到三个类中的代码，都耦合在一个类中，所以看起来稍微有点难懂。不过，这样做的好处是能够做到惰性解析。我们不需要事先将整个配置，解析成多个PropertyTokenizer对象。只有当我们在调用next()函数的时候，才会解析其中部分配置。</p><h2 id="log-如何使用适配器模式来适配不同的日志框架" tabindex="-1">Log：如何使用适配器模式来适配不同的日志框架？ <a class="header-anchor" href="#log-如何使用适配器模式来适配不同的日志框架" aria-label="Permalink to &quot;Log：如何使用适配器模式来适配不同的日志框架？&quot;">&amp;ZeroWidthSpace;</a></h2><p>\b在适配器模式那节课中我们讲过，Slf4j框架为了统一各个不同的日志框架（Log4j、JCL、Logback等），提供了一套统一的日志接口。不过，MyBatis并没有直接使用Slf4j提供的统一日志规范，而是自己又重复造轮子，定义了一套自己的日志访问接口。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface Log {</span></span>
<span class="line"><span>  boolean isDebugEnabled();</span></span>
<span class="line"><span>  boolean isTraceEnabled();</span></span>
<span class="line"><span>  void error(String s, Throwable e);</span></span>
<span class="line"><span>  void error(String s);</span></span>
<span class="line"><span>  void debug(String s);</span></span>
<span class="line"><span>  void trace(String s);</span></span>
<span class="line"><span>  void warn(String s);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>针对Log接口，MyBatis还提供了各种不同的实现类，分别使用不同的日志框架来实现Log接口。</p><p><img src="https://static001.geekbang.org/resource/image/95/14/95946f9e9c524cc06279114f7a654f14.png?wh=476%2A227" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>这几个实现类的代码结构基本上一致。我把其中的Log4jImpl的源码贴到了这里。我们知道，在适配器模式中，传递给适配器构造函数的是被适配的类对象，而这里是clazz（相当于日志名称name），所以，从代码实现上来讲，它并非标准的适配器模式。但是，从应用场景上来看，这里确实又起到了适配的作用，是典型的适配器模式的应用场景。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import org.apache.ibatis.logging.Log;</span></span>
<span class="line"><span>import org.apache.log4j.Level;</span></span>
<span class="line"><span>import org.apache.log4j.Logger;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class Log4jImpl implements Log {</span></span>
<span class="line"><span>  private static final String FQCN = Log4jImpl.class.getName();</span></span>
<span class="line"><span>  private final Logger log;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public Log4jImpl(String clazz) {</span></span>
<span class="line"><span>    log = Logger.getLogger(clazz);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean isDebugEnabled() {</span></span>
<span class="line"><span>    return log.isDebugEnabled();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean isTraceEnabled() {</span></span>
<span class="line"><span>    return log.isTraceEnabled();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void error(String s, Throwable e) {</span></span>
<span class="line"><span>    log.log(FQCN, Level.ERROR, s, e);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void error(String s) {</span></span>
<span class="line"><span>    log.log(FQCN, Level.ERROR, s, null);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void debug(String s) {</span></span>
<span class="line"><span>    log.log(FQCN, Level.DEBUG, s, null);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void trace(String s) {</span></span>
<span class="line"><span>    log.log(FQCN, Level.TRACE, s, null);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void warn(String s) {</span></span>
<span class="line"><span>    log.log(FQCN, Level.WARN, s, null);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们一块来总结回顾一下，你需要重点掌握的内容。</p><p>今天，我们讲到了MyBatis中用到的8种设计模式，它们分别是：建造者模式、工厂模式、模板模式、解释器模式、单例模式、装饰器模式、迭代器模式、适配器模式。加上上一节课中讲到的职责链和动态代理，我们总共讲了10种设计模式。</p><p>还是那句老话，你不需要记忆哪个类用到了哪个模式，因为不管你看多少遍，甚至记住并没有什么用。我希望你不仅仅只是把文章看了，更希望你能动手把MyBatis源码下载下来，自己去阅读一下相关的源码，锻炼自己阅读源码的能力。这比单纯看文章效果要好很多倍。</p><p>除此之外，从这两节课的讲解中，不知道你有没有发现，MyBatis对很多设计模式的实现，都并非标准的代码实现，都做了比较多的自我改进。实际上，这就是所谓的灵活应用，只借鉴不照搬，根据具体问题针对性地去解决。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>今天我们提到，SqlSessionFactoryBuilder跟SqlSessionFactory虽然名字后缀不同，但是设计思路一致，都是为了隐藏SqlSession的创建细节。从这一点上来看，命名有点不够统一。而且，我们还提到，SqlSessionFactoryBuilder并非标准的建造者模式，SqlSessionFactory也并非标准的工厂模式。对此你有什么看法呢？</p><p>欢迎留言和我分享你的想法。如果有收获，也欢迎你把这篇文章分享给你的朋友。 精选留言（15） Henry 👍（4） 💬（1）SqlSessionFactoryBuilder 需要根据复杂配置才能构建出可用的SqlSessionFactory，符合builder模式的设计思想。SqlSessionFactory 设计意图用于生产SqlSession，也符合factory模式的思想；2020-11-13javaadu 👍（54） 💬（9）课后思考：我理解这就是mybatis的代码写得烂，不符合最小惊奇原则2020-05-27皮特尔 👍（22） 💬（0）可能是这个项目刚开始写的时候没想到会火，作者就不怎么在意代码质量，随随便便就写了；后来发现问题想改的时候，又因为历史原因不能改了2020-06-07Heaven 👍（19） 💬（0）设计思想比设计模式更重要,只要符合其设计的本意,没什么大不了的2020-05-27小晏子 👍（12） 💬（1）我认为非典型的建造者和工厂模式挺好的，我们并不是学院派，没必要追求典型的代码实现，既然这么做也可以简化开发并满足那些设计原则，那么就可以了。2020-05-27Jxin 👍（7） 💬（0）前者隐藏的是初始化的细节，后者隐藏的选择的回话类型的细节。前者感觉建造者模式有点牵强，更像是初始化的配置类。后者工厂模式倒是没什么毛病，虽然不是标准的工厂模式。但我确实通过不同的选择，拿到了不同功能的对象。至于这些对象是同个父类的子类的对象，还是同个类不同参数的对象，我觉得只是实现方式的问题，场景上这个工厂模式并无不妥。2020-05-27jaryoung 👍（6） 💬（0）个人还是喜欢大而全的玩意： 引用文章的一句话： 实际上，这两个类的作用只不过是为了创建 SqlSession 对象，没有其他作用。所以，我更建议参照 Spring 的设计思路，把 SqlSessionFactoryBuilder 和 SqlSessionFactory 的逻辑，放到一个叫“ApplicationContext”的类中。让这个类来全权负责读入配置文件，创建 Congfiguration，生成 SqlSession。</p><p>修改前： public class MyBatisDemo { public static void main(String[] args) throws IOException { Reader reader = Resources.getResourceAsReader(&quot;mybatis.xml&quot;); SqlSessionFactory sessionFactory = new SqlSessionFactoryBuilder().build(reader); SqlSession session = sessionFactory.openSession(); UserMapper userMapper = session.getMapper(UserMapper.class); UserDo userDo = userMapper.selectById(8); //... }</p><p>}</p><p>修改后： public class MyBatisDemo { public static void main(String[] args) throws IOException { ApplicationContext applicationContext = new ApplicationContext(&quot;test-config.xml&quot;); SqlSession session = applicationContext.openSession(); UserMapper userMapper = session.getMapper(UserMapper.class); UserDo userDo = userMapper.selectById(8); //... }</p><p>}</p><p>使用越简单，背后逻辑越复杂，也可能是封装的必要性吧。 public class ApplicationContext {</p><pre><code>private Reader reader;

public ApplicationContext(String path) {
    try {
        reader = Resources.getResourceAsReader(path);
    } catch (IOException e) {
        e.printStackTrace();
    }
    Assert.that(reader == null, &amp;quot;reader can&amp;#39;t null&amp;quot;);
}

public ApplicationContext() {
    this(&amp;quot;mybatis-config.xml&amp;quot;);
}
public SqlSession openSession() {
    SqlSessionFactory sessionFactory = new SqlSessionFactoryBuilder().build(reader);
    return sessionFactory.openSession();
}
</code></pre><p>} 2020-05-27jiangjing 👍（4） 💬（0）软件开发是个迭代的过程，一开始是足够好用，设计没有求全求美；后面则不断优化和增强功能。 然后就是大家都熟悉怎么用了，有点小瑕疵但无关大局的代码就这么保留着吧，提供确定性2020-05-28辣么大 👍（3） 💬（0）这两个源码倒是很容易读。在github上看了他们10年前的这两个类的代码，重载了一些函数，但结构是一样的。我想应该是命名的习惯吧。当时也没考虑那么多。2020-05-29Mq 👍（2） 💬（0）理解设计模式适用范围跟使用方式的也能理解这个代码，不理解的，也能通过名称理解代码的意图，思想到位就行了，也不一定每个人都理解得那么多规则2020-05-28Yeyw 👍（1） 💬（0）感觉是历史代码，在很多项目都有应用，不好做变更2021-04-22笨鸟 👍（1） 💬（0）思想正确,过程可以稍加不同2021-02-04Geek_7e0e83 👍（0） 💬（0）命名不统一，这个看作者的想法了。因人而异 无关对错。重要的是 符合 设计原则和设计思想，这样就能写出高质量代码。而设计模式，只是实现的一个方式。可以不用太抠实现是否标准2022-11-19我是曾经那个少年 👍（0） 💬（0）我们写在所学的设计模式，只不过是上个世纪90年代由Erich Gamma、Richard Helm、Raplh Johnson和Jonhn Vlissides四个人总结提炼出来的。</p><p>他是一个哲学观，具体到实践我们只要做到我们的代码分层简单，高内聚，低耦合就可以了。2021-12-12Geek_558387 👍（0） 💬（0）设计模式的精髓就是编码思想, 本子来说就相当于内功心法，并没有固定招式，实际上是可以照着心法自由发挥，唯一不变的就是变化, 是一套没有招式的武功，跟张无忌学太极一回事主要靠意会 ...2020-09-29</p>`,76)])])}const g=s(l,[["render",i]]);export{S as __pageData,g as default};
