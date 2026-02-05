import{_ as a,o as s,c as e,ae as p}from"./chunks/framework.Iv6F95cJ.js";const d=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/88 - 开源实战五（中）：如何利用职责链与代理模式实现MyBatis Plugin？.md","filePath":"books/design-pattern/88 - 开源实战五（中）：如何利用职责链与代理模式实现MyBatis Plugin？.md"}'),t={name:"books/design-pattern/88 - 开源实战五（中）：如何利用职责链与代理模式实现MyBatis Plugin？.md"};function l(i,n,r,c,o,u){return s(),e("div",null,[...n[0]||(n[0]=[p(`<p>上节课，我们对MyBatis框架做了简单的背景介绍，并且通过对比各种ORM框架，学习了代码的易用性、性能、灵活性之间的关系。一般来讲，框架提供的高级功能越多，那性能损耗就会越大；框架用起来越简单，提供越简化的使用方式，那灵活性也就越低。</p><p>接下来的两节课，我们再学习一下MyBatis用到一些经典设计模式。其中，今天，我们主要讲解MyBatis Plugin。尽管名字叫Plugin（插件），但它实际上跟之前讲到的Servlet Filter（过滤器）、Spring Interceptor（拦截器）类似，设计的初衷都是为了框架的扩展性，用到的主要设计模式都是职责链模式。</p><p>不过，相对于Servlet Filter和Spring Interceptor，MyBatis Plugin中职责链模式的代码实现稍微有点复杂。它是借助动态代理模式来实现的职责链。今天我就带你看下，如何利用这两个模式实现MyBatis Plugin。</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="mybatis-plugin功能介绍" tabindex="-1">MyBatis Plugin功能介绍 <a class="header-anchor" href="#mybatis-plugin功能介绍" aria-label="Permalink to &quot;MyBatis Plugin功能介绍&quot;">&amp;ZeroWidthSpace;</a></h2><p>实际上，MyBatis Plugin跟Servlet Filter、Spring Interceptor的功能是类似的，都是在不需要修改原有流程代码的情况下，拦截某些方法调用，在拦截的方法调用的前后，执行一些额外的代码逻辑。它们的唯一区别在于拦截的位置是不同的。Servlet Filter主要拦截Servlet请求，Spring Interceptor主要拦截Spring管理的Bean方法（比如Controller类的方法等），而MyBatis Plugin主要拦截的是MyBatis在执行SQL的过程中涉及的一些方法。</p><p>MyBatis Plugin使用起来比较简单，我们通过一个例子来快速看下。</p><p>假设我们需要统计应用中每个SQL的执行耗时，如果使用MyBatis Plugin来实现的话，我们只需要定义一个SqlCostTimeInterceptor类，让它实现MyBatis的Interceptor接口，并且，在MyBatis的全局配置文件中，简单声明一下这个插件就可以了。具体的代码和配置如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Intercepts({</span></span>
<span class="line"><span>        @Signature(type = StatementHandler.class, method = &quot;query&quot;, args = {Statement.class, ResultHandler.class}),</span></span>
<span class="line"><span>        @Signature(type = StatementHandler.class, method = &quot;update&quot;, args = {Statement.class}),</span></span>
<span class="line"><span>        @Signature(type = StatementHandler.class, method = &quot;batch&quot;, args = {Statement.class})})</span></span>
<span class="line"><span>public class SqlCostTimeInterceptor implements Interceptor {</span></span>
<span class="line"><span>  private static Logger logger = LoggerFactory.getLogger(SqlCostTimeInterceptor.class);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Object intercept(Invocation invocation) throws Throwable {</span></span>
<span class="line"><span>    Object target = invocation.getTarget();</span></span>
<span class="line"><span>    long startTime = System.currentTimeMillis();</span></span>
<span class="line"><span>    StatementHandler statementHandler = (StatementHandler) target;</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      return invocation.proceed();</span></span>
<span class="line"><span>    } finally {</span></span>
<span class="line"><span>      long costTime = System.currentTimeMillis() - startTime;</span></span>
<span class="line"><span>      BoundSql boundSql = statementHandler.getBoundSql();</span></span>
<span class="line"><span>      String sql = boundSql.getSql();</span></span>
<span class="line"><span>      logger.info(&quot;执行 SQL：[ {} ]执行耗时[ {} ms]&quot;, sql, costTime);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Object plugin(Object target) {</span></span>
<span class="line"><span>    return Plugin.wrap(target, this);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void setProperties(Properties properties) {</span></span>
<span class="line"><span>    System.out.println(&quot;插件配置的信息：&quot;+properties);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>&lt;!-- MyBatis全局配置文件：mybatis-config.xml --&gt;</span></span>
<span class="line"><span>&lt;plugins&gt;</span></span>
<span class="line"><span>  &lt;plugin interceptor=&quot;com.xzg.cd.a88.SqlCostTimeInterceptor&quot;&gt;</span></span>
<span class="line"><span>    &lt;property name=&quot;someProperty&quot; value=&quot;100&quot;/&gt;</span></span>
<span class="line"><span>  &lt;/plugin&gt;</span></span>
<span class="line"><span>&lt;/plugins&gt;</span></span></code></pre></div><p>因为待会我会详细地介绍MyBatis Plugin的底层实现原理，所以，这里暂时不对上面的代码做详细地解释。现在，我们只重点看下@Intercepts注解这一部分。</p><p>我们知道，不管是拦截器、过滤器还是插件，都需要明确地标明拦截的目标方法。@Intercepts注解实际上就是起了这个作用。其中，@Intercepts注解又可以嵌套@Signature注解。一个@Signature注解标明一个要拦截的目标方法。如果要拦截多个方法，我们可以像例子中那样，编写多条@Signature注解。</p><p>@Signature注解包含三个元素：type、method、args。其中，type指明要拦截的类、method指明方法名、args指明方法的参数列表。通过指定这三个元素，我们就能完全确定一个要拦截的方法。</p><p>默认情况下，MyBatis Plugin允许拦截的方法有下面这样几个：</p><p><img src="https://static001.geekbang.org/resource/image/cd/d1/cd0aae4a0758ac0913ad28988a6718d1.jpg?wh=1723%2A763" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>为什么默认允许拦截的是这样几个类的方法呢？</p><p>MyBatis底层是通过Executor类来执行SQL的。Executor类会创建StatementHandler、ParameterHandler、ResultSetHandler三个对象，并且，首先使用ParameterHandler设置SQL中的占位符参数，然后使用StatementHandler执行SQL语句，最后使用ResultSetHandler封装执行结果。所以，我们只需要拦截Executor、ParameterHandler、ResultSetHandler、StatementHandler这几个类的方法，基本上就能满足我们对整个SQL执行流程的拦截了。</p><p>实际上，除了统计SQL的执行耗时，利用MyBatis Plugin，我们还可以做很多事情，比如分库分表、自动分页、数据脱敏、加密解密等等。如果感兴趣的话，你可以自己实现一下。</p><h2 id="mybatis-plugin的设计与实现" tabindex="-1">MyBatis Plugin的设计与实现 <a class="header-anchor" href="#mybatis-plugin的设计与实现" aria-label="Permalink to &quot;MyBatis Plugin的设计与实现&quot;">&amp;ZeroWidthSpace;</a></h2><p>刚刚我们简单介绍了MyBatis Plugin是如何使用的。现在，我们再剖析一下源码，看看如此简洁的使用方式，底层是如何实现的，隐藏了哪些复杂的设计。</p><p>相对于Servlet Filter、Spring Interceptor中职责链模式的代码实现，MyBatis Plugin的代码实现还是蛮有技巧的，因为它是借助动态代理来实现职责链的。</p><p>在<a href="https://time.geekbang.org/column/article/216278" target="_blank" rel="noreferrer">第62节</a>和<a href="https://time.geekbang.org/column/article/217395" target="_blank" rel="noreferrer">第63节</a>中，我们讲到，职责链模式的实现一般包含处理器（Handler）和处理器链（HandlerChain）两部分。这两个部分对应到Servlet Filter的源码就是Filter和FilterChain，对应到Spring Interceptor的源码就是HandlerInterceptor和HandlerExecutionChain，对应到MyBatis Plugin的源码就是Interceptor和InterceptorChain。除此之外，MyBatis Plugin还包含另外一个非常重要的类：Plugin。它用来生成被拦截对象的动态代理。</p><p>集成了MyBatis的应用在启动的时候，MyBatis框架会读取全局配置文件（前面例子中的mybatis-config.xml文件），解析出Interceptor（也就是例子中的SqlCostTimeInterceptor），并且将它注入到Configuration类的InterceptorChain对象中。这部分逻辑对应到源码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XMLConfigBuilder extends BaseBuilder {</span></span>
<span class="line"><span>  //解析配置</span></span>
<span class="line"><span>  private void parseConfiguration(XNode root) {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>     //省略部分代码...</span></span>
<span class="line"><span>      pluginElement(root.evalNode(&quot;plugins&quot;)); //解析插件</span></span>
<span class="line"><span>    } catch (Exception e) {</span></span>
<span class="line"><span>      throw new BuilderException(&quot;Error parsing SQL Mapper Configuration. Cause: &quot; + e, e);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  //解析插件</span></span>
<span class="line"><span>   private void pluginElement(XNode parent) throws Exception {</span></span>
<span class="line"><span>    if (parent != null) {</span></span>
<span class="line"><span>      for (XNode child : parent.getChildren()) {</span></span>
<span class="line"><span>        String interceptor = child.getStringAttribute(&quot;interceptor&quot;);</span></span>
<span class="line"><span>        Properties properties = child.getChildrenAsProperties();</span></span>
<span class="line"><span>        //创建Interceptor类对象</span></span>
<span class="line"><span>        Interceptor interceptorInstance = (Interceptor) resolveClass(interceptor).newInstance();</span></span>
<span class="line"><span>        //调用Interceptor上的setProperties()方法设置properties</span></span>
<span class="line"><span>        interceptorInstance.setProperties(properties);</span></span>
<span class="line"><span>        //下面这行代码会调用InterceptorChain.addInterceptor()方法</span></span>
<span class="line"><span>        configuration.addInterceptor(interceptorInstance);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Configuration类的addInterceptor()方法的代码如下所示</span></span>
<span class="line"><span>public void addInterceptor(Interceptor interceptor) {</span></span>
<span class="line"><span>  interceptorChain.addInterceptor(interceptor);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们再来看Interceptor和InterceptorChain这两个类的代码，如下所示。Interceptor的setProperties()方法就是一个单纯的setter方法，主要是为了方便通过配置文件配置Interceptor的一些属性值，没有其他作用。Interceptor类中intecept()和plugin()函数，以及InterceptorChain类中的pluginAll()函数，是最核心的三个函数，我们待会再详细解释。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Invocation {</span></span>
<span class="line"><span>  private final Object target;</span></span>
<span class="line"><span>  private final Method method;</span></span>
<span class="line"><span>  private final Object[] args;</span></span>
<span class="line"><span>  // 省略构造函数和getter方法...</span></span>
<span class="line"><span>  public Object proceed() throws InvocationTargetException, IllegalAccessException {</span></span>
<span class="line"><span>    return method.invoke(target, args);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>public interface Interceptor {</span></span>
<span class="line"><span>  Object intercept(Invocation invocation) throws Throwable;</span></span>
<span class="line"><span>  Object plugin(Object target);</span></span>
<span class="line"><span>  void setProperties(Properties properties);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class InterceptorChain {</span></span>
<span class="line"><span>  private final List&lt;Interceptor&gt; interceptors = new ArrayList&lt;Interceptor&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public Object pluginAll(Object target) {</span></span>
<span class="line"><span>    for (Interceptor interceptor : interceptors) {</span></span>
<span class="line"><span>      target = interceptor.plugin(target);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return target;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void addInterceptor(Interceptor interceptor) {</span></span>
<span class="line"><span>    interceptors.add(interceptor);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  public List&lt;Interceptor&gt; getInterceptors() {</span></span>
<span class="line"><span>    return Collections.unmodifiableList(interceptors);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>解析完配置文件之后，所有的Interceptor都加载到了InterceptorChain中。接下来，我们再来看下，这些拦截器是在什么时候被触发执行的？又是如何被触发执行的呢？</p><p>前面我们提到，在执行SQL的过程中，MyBatis会创建Executor、StatementHandler、ParameterHandler、ResultSetHandler这几个类的对象，对应的创建代码在Configuration类中，如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public Executor newExecutor(Transaction transaction, ExecutorType executorType) {</span></span>
<span class="line"><span>  executorType = executorType == null ? defaultExecutorType : executorType;</span></span>
<span class="line"><span>  executorType = executorType == null ? ExecutorType.SIMPLE : executorType;</span></span>
<span class="line"><span>  Executor executor;</span></span>
<span class="line"><span>  if (ExecutorType.BATCH == executorType) {</span></span>
<span class="line"><span>    executor = new BatchExecutor(this, transaction);</span></span>
<span class="line"><span>  } else if (ExecutorType.REUSE == executorType) {</span></span>
<span class="line"><span>    executor = new ReuseExecutor(this, transaction);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    executor = new SimpleExecutor(this, transaction);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  if (cacheEnabled) {</span></span>
<span class="line"><span>    executor = new CachingExecutor(executor);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  executor = (Executor) interceptorChain.pluginAll(executor);</span></span>
<span class="line"><span>  return executor;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public ParameterHandler newParameterHandler(MappedStatement mappedStatement, Object parameterObject, BoundSql boundSql) {</span></span>
<span class="line"><span>  ParameterHandler parameterHandler = mappedStatement.getLang().createParameterHandler(mappedStatement, parameterObject, boundSql);</span></span>
<span class="line"><span>  parameterHandler = (ParameterHandler) interceptorChain.pluginAll(parameterHandler);</span></span>
<span class="line"><span>  return parameterHandler;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public ResultSetHandler newResultSetHandler(Executor executor, MappedStatement mappedStatement, RowBounds rowBounds, ParameterHandler parameterHandler,</span></span>
<span class="line"><span>    ResultHandler resultHandler, BoundSql boundSql) {</span></span>
<span class="line"><span>  ResultSetHandler resultSetHandler = new DefaultResultSetHandler(executor, mappedStatement, parameterHandler, resultHandler, boundSql, rowBounds);</span></span>
<span class="line"><span>  resultSetHandler = (ResultSetHandler) interceptorChain.pluginAll(resultSetHandler);</span></span>
<span class="line"><span>  return resultSetHandler;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public StatementHandler newStatementHandler(Executor executor, MappedStatement mappedStatement, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {</span></span>
<span class="line"><span>  StatementHandler statementHandler = new RoutingStatementHandler(executor, mappedStatement, parameterObject, rowBounds, resultHandler, boundSql);</span></span>
<span class="line"><span>  statementHandler = (StatementHandler) interceptorChain.pluginAll(statementHandler);</span></span>
<span class="line"><span>  return statementHandler;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>从上面的代码中，我们可以发现，这几个类对象的创建过程都调用了InteceptorChain的pluginAll()方法。这个方法的代码前面已经给出了。你可以回过头去再看一眼。它的代码实现很简单，嵌套调用InterceptorChain上每个Interceptor的plugin()方法。plugin()是一个接口方法（不包含实现代码），需要由用户给出具体的实现代码。在之前的例子中，SQLTimeCostInterceptor的plugin()方法通过直接调用Plugin的wrap()方法来实现。wrap()方法的代码实现如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 借助Java InvocationHandler实现的动态代理模式</span></span>
<span class="line"><span>public class Plugin implements InvocationHandler {</span></span>
<span class="line"><span>  private final Object target;</span></span>
<span class="line"><span>  private final Interceptor interceptor;</span></span>
<span class="line"><span>  private final Map&lt;Class&lt;?&gt;, Set&lt;Method&gt;&gt; signatureMap;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private Plugin(Object target, Interceptor interceptor, Map&lt;Class&lt;?&gt;, Set&lt;Method&gt;&gt; signatureMap) {</span></span>
<span class="line"><span>    this.target = target;</span></span>
<span class="line"><span>    this.interceptor = interceptor;</span></span>
<span class="line"><span>    this.signatureMap = signatureMap;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // wrap()静态方法，用来生成target的动态代理，</span></span>
<span class="line"><span>  // 动态代理对象=target对象+interceptor对象。</span></span>
<span class="line"><span>  public static Object wrap(Object target, Interceptor interceptor) {</span></span>
<span class="line"><span>    Map&lt;Class&lt;?&gt;, Set&lt;Method&gt;&gt; signatureMap = getSignatureMap(interceptor);</span></span>
<span class="line"><span>    Class&lt;?&gt; type = target.getClass();</span></span>
<span class="line"><span>    Class&lt;?&gt;[] interfaces = getAllInterfaces(type, signatureMap);</span></span>
<span class="line"><span>    if (interfaces.length &gt; 0) {</span></span>
<span class="line"><span>      return Proxy.newProxyInstance(</span></span>
<span class="line"><span>          type.getClassLoader(),</span></span>
<span class="line"><span>          interfaces,</span></span>
<span class="line"><span>          new Plugin(target, interceptor, signatureMap));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return target;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 调用target上的f()方法，会触发执行下面这个方法。</span></span>
<span class="line"><span>  // 这个方法包含：执行interceptor的intecept()方法 + 执行target上f()方法。</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      Set&lt;Method&gt; methods = signatureMap.get(method.getDeclaringClass());</span></span>
<span class="line"><span>      if (methods != null &amp;&amp; methods.contains(method)) {</span></span>
<span class="line"><span>        return interceptor.intercept(new Invocation(target, method, args));</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      return method.invoke(target, args);</span></span>
<span class="line"><span>    } catch (Exception e) {</span></span>
<span class="line"><span>      throw ExceptionUtil.unwrapThrowable(e);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static Map&lt;Class&lt;?&gt;, Set&lt;Method&gt;&gt; getSignatureMap(Interceptor interceptor) {</span></span>
<span class="line"><span>    Intercepts interceptsAnnotation = interceptor.getClass().getAnnotation(Intercepts.class);</span></span>
<span class="line"><span>    // issue #251</span></span>
<span class="line"><span>    if (interceptsAnnotation == null) {</span></span>
<span class="line"><span>      throw new PluginException(&quot;No @Intercepts annotation was found in interceptor &quot; + interceptor.getClass().getName());      </span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    Signature[] sigs = interceptsAnnotation.value();</span></span>
<span class="line"><span>    Map&lt;Class&lt;?&gt;, Set&lt;Method&gt;&gt; signatureMap = new HashMap&lt;Class&lt;?&gt;, Set&lt;Method&gt;&gt;();</span></span>
<span class="line"><span>    for (Signature sig : sigs) {</span></span>
<span class="line"><span>      Set&lt;Method&gt; methods = signatureMap.get(sig.type());</span></span>
<span class="line"><span>      if (methods == null) {</span></span>
<span class="line"><span>        methods = new HashSet&lt;Method&gt;();</span></span>
<span class="line"><span>        signatureMap.put(sig.type(), methods);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        Method method = sig.type().getMethod(sig.method(), sig.args());</span></span>
<span class="line"><span>        methods.add(method);</span></span>
<span class="line"><span>      } catch (NoSuchMethodException e) {</span></span>
<span class="line"><span>        throw new PluginException(&quot;Could not find method on &quot; + sig.type() + &quot; named &quot; + sig.method() + &quot;. Cause: &quot; + e, e);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return signatureMap;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static Class&lt;?&gt;[] getAllInterfaces(Class&lt;?&gt; type, Map&lt;Class&lt;?&gt;, Set&lt;Method&gt;&gt; signatureMap) {</span></span>
<span class="line"><span>    Set&lt;Class&lt;?&gt;&gt; interfaces = new HashSet&lt;Class&lt;?&gt;&gt;();</span></span>
<span class="line"><span>    while (type != null) {</span></span>
<span class="line"><span>      for (Class&lt;?&gt; c : type.getInterfaces()) {</span></span>
<span class="line"><span>        if (signatureMap.containsKey(c)) {</span></span>
<span class="line"><span>          interfaces.add(c);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      type = type.getSuperclass();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return interfaces.toArray(new Class&lt;?&gt;[interfaces.size()]);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>实际上，Plugin是借助Java InvocationHandler实现的动态代理类。用来代理给target对象添加Interceptor功能。其中，要代理的target对象就是Executor、StatementHandler、ParameterHandler、ResultSetHandler这四个类的对象。wrap()静态方法是一个工具函数，用来生成target对象的动态代理对象。</p><p>当然，只有interceptor与target互相匹配的时候，wrap()方法才会返回代理对象，否则就返回target对象本身。怎么才算是匹配呢？那就是interceptor通过@Signature注解要拦截的类包含target对象，具体可以参看wrap()函数的代码实现（上面一段代码中的第16~19行）。</p><p>MyBatis中的职责链模式的实现方式比较特殊。它对同一个目标对象嵌套多次代理（也就是InteceptorChain中的pluginAll()函数要执行的任务）。每个代理对象（Plugin对象）代理一个拦截器（Interceptor对象）功能。为了方便你查看，我将pluginAll()函数的代码又拷贝到了下面。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public Object pluginAll(Object target) {</span></span>
<span class="line"><span>  // 嵌套代理</span></span>
<span class="line"><span>  for (Interceptor interceptor : interceptors) {</span></span>
<span class="line"><span>    target = interceptor.plugin(target);</span></span>
<span class="line"><span>    // 上面这行代码等于下面这行代码，target(代理对象)=target(目标对象)+interceptor(拦截器功能)</span></span>
<span class="line"><span>    // target = Plugin.wrap(target, interceptor);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return target;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// MyBatis像下面这样创建target(Executor、StatementHandler、ParameterHandler、ResultSetHandler），相当于多次嵌套代理</span></span>
<span class="line"><span>Object target = interceptorChain.pluginAll(target);</span></span></code></pre></div><p>当执行Executor、StatementHandler、ParameterHandler、ResultSetHandler这四个类上的某个方法的时候，MyBatis会嵌套执行每层代理对象（Plugin对象）上的invoke()方法。而invoke()方法会先执行代理对象中的interceptor的intecept()函数，然后再执行被代理对象上的方法。就这样，一层一层地把代理对象上的intercept()函数执行完之后，MyBatis才最终执行那4个原始类对象上的方法。</p><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天内容到此就讲完了。我们来一块总结回顾一下，你需要重点掌握的内容。</p><p>今天，我们带你剖析了如何利用职责链模式和动态代理模式来实现MyBatis Plugin。至此，我们就已经学习了三种职责链常用的应用场景：过滤器（Servlet Filter）、拦截器（Spring Interceptor）、插件（MyBatis Plugin）。</p><p>职责链模式的实现一般包含处理器和处理器链两部分。这两个部分对应到Servlet Filter的源码就是Filter和FilterChain，对应到Spring Interceptor的源码就是HandlerInterceptor和HandlerExecutionChain，对应到MyBatis Plugin的源码就是Interceptor和InterceptorChain。除此之外，MyBatis Plugin还包含另外一个非常重要的类：Plugin类。它用来生成被拦截对象的动态代理。</p><p>在这三种应用场景中，职责链模式的实现思路都不大一样。其中，Servlet Filter采用递归来实现拦截方法前后添加逻辑。Spring Interceptor的实现比较简单，把拦截方法前后要添加的逻辑放到两个方法中实现。MyBatis Plugin采用嵌套动态代理的方法来实现，实现思路很有技巧。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>Servlet Filter、Spring Interceptor可以用来拦截用户自己定义的类的方法，而MyBatis Plugin默认可以拦截的只有Executor、StatementHandler、ParameterHandler、ResultSetHandler这四个类的方法，而且这四个类是MyBatis实现的类，并非用户自己定义的类。那MyBatis Plugin为什么不像Servlet Filter、Spring Interceptor那样，提供拦截用户自定义类的方法的功能呢？</p><p>欢迎留言和我分享你的想法。如果有收获，也欢迎你把这篇文章分享给你的朋友。 精选留言（15） test 👍（36） 💬（0）思考题：因为用mybatis就是为了使用数据库。2020-05-25Monday 👍（31） 💬（0）精彩，看了源码，Mybatis分布工具PageHelper也通过Plugin方式实现的。 @Intercepts({@Signature( type = Executor.class, method = &quot;query&quot;, args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class} )}) public class PageHelper implements Interceptor {...}2020-05-26your problem？ 👍（20） 💬（0）思考题：YAGNI，单一职责原则，MyBatis就是负责简化以及通用数据库的处理，没有必要支持过多无关的东西2020-05-25小晏子 👍（11） 💬（0）我感觉这要从mybatis的使用场景考虑，mybatis主要用于简化数据库操作，所以对于SQL语句的解析才是其本质，而不需要额外支持其他的东西，所以不需要拦截用户自定义类的方法2020-05-25J.Smile 👍（10） 💬（0）Springaop中的前置通知，后置通知，异常通知也是基于动态代理的职责链模式。2020-05-30Lambor 👍（7） 💬（2）MyBatis 每次SQL执行都会创建 Executor 等对象，再通过 pluginAll 方法创建一个代理的职责链，然后递归调用每个代理对象，最后调用 Executor 对象的方法。个人认为这个代理职责链主要就是控制 Executor 的方法在最后一步执行，这种职责链+代理的实现方式虽然巧妙，但感觉得不偿失，每次SQL调用都会创建一个新的嵌套代理调用链，这本身就是有性能消耗的，而且是作为底层框架，这点性能还是要考虑的。感觉采用 ApplicationFilterChain 的那种方式会更好，固定的一个拦截器链路，不用每次创建代理。2020-05-27Monday 👍（4） 💬（1）看第一篇以为听懂了，再第二篇，发现根本没懂。如果换成是我要实现sql耗时的操作，走两步就行 1、写一个切面拦截StatementHander的某些方法，在执行sql前后加开始结束时间就行。 2、上一点中拦截哪些方法，还是需要一个类似Plugin中的getSignatureMap方法的解析，没感觉到Plugin类其他的价值。。2020-05-26ljx 👍（3） 💬（0）感觉自己变强了，一年前看这段源码觉得云里雾里，只能理解个大概，如今再看是如此清晰。。。2022-03-11高乐 👍（3） 💬（0）请问老师，动态代理后的代理类是final的吧，应该无法再次被动态代理吧？那这个嵌套代理是怎么实现的？2021-11-16Heaven 👍（3） 💬（0）职责单一,我用Mybatis就是为了更快更好的处理数据库之间的关系,所以专注于这四类是必然的,之前咱自己也看过Mybatis源码,但是并没有看出来是利用代理和职责链实现的整体执行过程2020-05-26M 👍（2） 💬（0）pluginAll()方法的设计，有点像观察者模式，所有的观察者注册到被观察者中，被观察者必须等到所有的观察者执行完之后才能够执行2021-04-06Molyt 👍（1） 💬（0）这一节课更看不懂了，难顶（捂脸哭.jpg）2022-04-30我是曾经那个少年 👍（1） 💬（0）数据库的执行前我们一般能做的就是：</p><ol><li>对数据库参数字段的一些处理，。</li><li>对数据库响应结果的一些处理。</li><li>或者动态概要SQL语句。 数据库ORM组件也就是处理这些东西，没有其他的业务扩展的需要。2021-12-12Henry 👍（1） 💬（0）mybatis的拦截的范围粒度比较大，针对的是特定类型的sql查询及参数和返回结果处理。拦截用户自定义的方法可以通过spring aop进行更细粒度的方法拦截。2020-11-12Edward Lee 👍（1） 💬（0）Mybatis 需要更专注于数据库操作方面的代理，而更具体的方法代理可以交由 Spring 这类 AOP 框架配置实现，Mybatis 就不必再重复造轮子了。</li></ol><p>对于 Mybatis 以动态代理的方式实现拦截器感觉到新颖，看似使用动态代理会影响效率，实则是提升了执行效率。这是因为只有在系统启动的时候会慢一些，在实际执行的过程中就不需要额外的匹配及判断过滤规则了，当然，动态代理还需要额外的内存开销。2020-06-20</p>`,45)])])}const m=a(t,[["render",l]]);export{d as __pageData,m as default};
