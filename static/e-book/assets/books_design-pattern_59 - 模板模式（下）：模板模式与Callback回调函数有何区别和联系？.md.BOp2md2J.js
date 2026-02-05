import{_ as n,o as a,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const h=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/59 - 模板模式（下）：模板模式与Callback回调函数有何区别和联系？.md","filePath":"books/design-pattern/59 - 模板模式（下）：模板模式与Callback回调函数有何区别和联系？.md"}'),l={name:"books/design-pattern/59 - 模板模式（下）：模板模式与Callback回调函数有何区别和联系？.md"};function t(i,s,c,o,r,u){return a(),p("div",null,[...s[0]||(s[0]=[e(`<p>上一节课中，我们学习了模板模式的原理、实现和应用。它常用在框架开发中，通过提供功能扩展点，让框架用户在不修改框架源码的情况下，基于扩展点定制化框架的功能。除此之外，模板模式还可以起到代码复用的作用。</p><p>复用和扩展是模板模式的两大作用，实际上，还有另外一个技术概念，也能起到跟模板模式相同的作用，那就是<strong>回调</strong>（Callback）。今天我们今天就来看一下，回调的原理、实现和应用，以及它跟模板模式的区别和联系。</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="回调的原理解析" tabindex="-1">回调的原理解析 <a class="header-anchor" href="#回调的原理解析" aria-label="Permalink to &quot;回调的原理解析&quot;">&amp;ZeroWidthSpace;</a></h2><p>相对于普通的函数调用来说，回调是一种双向调用关系。A类事先注册某个函数F到B类，A类在调用B类的P函数的时候，B类反过来调用A类注册给它的F函数。这里的F函数就是“回调函数”。A调用B，B反过来又调用A，这种调用机制就叫作“回调”。</p><p>A类如何将回调函数传递给B类呢？不同的编程语言，有不同的实现方法。C语言可以使用函数指针，Java则需要使用包裹了回调函数的类对象，我们简称为回调对象。这里我用Java语言举例说明一下。代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface ICallback {</span></span>
<span class="line"><span>  void methodToCallback();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class BClass {</span></span>
<span class="line"><span>  public void process(ICallback callback) {</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>    callback.methodToCallback();</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class AClass {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    BClass b = new BClass();</span></span>
<span class="line"><span>    b.process(new ICallback() { //回调对象</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void methodToCallback() {</span></span>
<span class="line"><span>        System.out.println(&quot;Call back me.&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>上面就是Java语言中回调的典型代码实现。从代码实现中，我们可以看出，回调跟模板模式一样，也具有复用和扩展的功能。除了回调函数之外，BClass类的process()函数中的逻辑都可以复用。如果ICallback、BClass类是框架代码，AClass是使用框架的客户端代码，我们可以通过ICallback定制process()函数，也就是说，框架因此具有了扩展的能力。</p><p>实际上，回调不仅可以应用在代码设计上，在更高层次的架构设计上也比较常用。比如，通过三方支付系统来实现支付功能，用户在发起支付请求之后，一般不会一直阻塞到支付结果返回，而是注册回调接口（类似回调函数，一般是一个回调用的URL）给三方支付系统，等三方支付系统执行完成之后，将结果通过回调接口返回给用户。</p><p>回调可以分为同步回调和异步回调（或者延迟回调）。同步回调指在函数返回之前执行回调函数；异步回调指的是在函数返回之后执行回调函数。上面的代码实际上是同步回调的实现方式，在process()函数返回之前，执行完回调函数methodToCallback()。而上面支付的例子是异步回调的实现方式，发起支付之后不需要等待回调接口被调用就直接返回。从应用场景上来看，同步回调看起来更像模板模式，异步回调看起来更像观察者模式。</p><h2 id="应用举例一-jdbctemplate" tabindex="-1">应用举例一：JdbcTemplate <a class="header-anchor" href="#应用举例一-jdbctemplate" aria-label="Permalink to &quot;应用举例一：JdbcTemplate&quot;">&amp;ZeroWidthSpace;</a></h2><p>Spring提供了很多Template类，比如，JdbcTemplate、RedisTemplate、RestTemplate。尽管都叫作xxxTemplate，但它们并非基于模板模式来实现的，而是基于回调来实现的，确切地说应该是同步回调。而同步回调从应用场景上很像模板模式，所以，在命名上，这些类使用Template（模板）这个单词作为后缀。</p><p>这些Template类的设计思路都很相近，所以，我们只拿其中的JdbcTemplate来举例分析一下。对于其他Template类，你可以阅读源码自行分析。</p><p>在前面的章节中，我们也多次提到，Java提供了JDBC类库来封装不同类型的数据库操作。不过，直接使用JDBC来编写操作数据库的代码，还是有点复杂的。比如，下面这段是使用JDBC来查询用户信息的代码。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JdbcDemo {</span></span>
<span class="line"><span>  public User queryUser(long id) {</span></span>
<span class="line"><span>    Connection conn = null;</span></span>
<span class="line"><span>    Statement stmt = null;</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      //1.加载驱动</span></span>
<span class="line"><span>      Class.forName(&quot;com.mysql.jdbc.Driver&quot;);</span></span>
<span class="line"><span>      conn = DriverManager.getConnection(&quot;jdbc:mysql://localhost:3306/demo&quot;, &quot;xzg&quot;, &quot;xzg&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      //2.创建statement类对象，用来执行SQL语句</span></span>
<span class="line"><span>      stmt = conn.createStatement();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      //3.ResultSet类，用来存放获取的结果集</span></span>
<span class="line"><span>      String sql = &quot;select * from user where id=&quot; + id;</span></span>
<span class="line"><span>      ResultSet resultSet = stmt.executeQuery(sql);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      String eid = null, ename = null, price = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      while (resultSet.next()) {</span></span>
<span class="line"><span>        User user = new User();</span></span>
<span class="line"><span>        user.setId(resultSet.getLong(&quot;id&quot;));</span></span>
<span class="line"><span>        user.setName(resultSet.getString(&quot;name&quot;));</span></span>
<span class="line"><span>        user.setTelephone(resultSet.getString(&quot;telephone&quot;));</span></span>
<span class="line"><span>        return user;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    } catch (ClassNotFoundException e) {</span></span>
<span class="line"><span>      // TODO: log...</span></span>
<span class="line"><span>    } catch (SQLException e) {</span></span>
<span class="line"><span>      // TODO: log...</span></span>
<span class="line"><span>    } finally {</span></span>
<span class="line"><span>      if (conn != null)</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          conn.close();</span></span>
<span class="line"><span>        } catch (SQLException e) {</span></span>
<span class="line"><span>          // TODO: log...</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      if (stmt != null)</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          stmt.close();</span></span>
<span class="line"><span>        } catch (SQLException e) {</span></span>
<span class="line"><span>          // TODO: log...</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return null;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><p>queryUser()函数包含很多流程性质的代码，跟业务无关，比如，加载驱动、创建数据库连接、创建statement、关闭连接、关闭statement、处理异常。针对不同的SQL执行请求，这些流程性质的代码是相同的、可以复用的，我们不需要每次都重新敲一遍。</p><p>针对这个问题，Spring提供了JdbcTemplate，对JDBC进一步封装，来简化数据库编程。使用JdbcTemplate查询用户信息，我们只需要编写跟这个业务有关的代码，其中包括，查询用户的SQL语句、查询结果与User对象之间的映射关系。其他流程性质的代码都封装在了JdbcTemplate类中，不需要我们每次都重新编写。我用JdbcTemplate重写了上面的例子，代码简单了很多，如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JdbcTemplateDemo {</span></span>
<span class="line"><span>  private JdbcTemplate jdbcTemplate;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public User queryUser(long id) {</span></span>
<span class="line"><span>    String sql = &quot;select * from user where id=&quot;+id;</span></span>
<span class="line"><span>    return jdbcTemplate.query(sql, new UserRowMapper()).get(0);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  class UserRowMapper implements RowMapper&lt;User&gt; {</span></span>
<span class="line"><span>    public User mapRow(ResultSet rs, int rowNum) throws SQLException {</span></span>
<span class="line"><span>      User user = new User();</span></span>
<span class="line"><span>      user.setId(rs.getLong(&quot;id&quot;));</span></span>
<span class="line"><span>      user.setName(rs.getString(&quot;name&quot;));</span></span>
<span class="line"><span>      user.setTelephone(rs.getString(&quot;telephone&quot;));</span></span>
<span class="line"><span>      return user;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>那JdbcTemplate底层具体是如何实现的呢？我们来看一下它的源码。因为JdbcTemplate代码比较多，我只摘抄了部分相关代码，贴到了下面。其中，JdbcTemplate通过回调的机制，将不变的执行流程抽离出来，放到模板方法execute()中，将可变的部分设计成回调StatementCallback，由用户来定制。query()函数是对execute()函数的二次封装，让接口用起来更加方便。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public &lt;T&gt; List&lt;T&gt; query(String sql, RowMapper&lt;T&gt; rowMapper) throws DataAccessException {</span></span>
<span class="line"><span> return query(sql, new RowMapperResultSetExtractor&lt;T&gt;(rowMapper));</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Override</span></span>
<span class="line"><span>public &lt;T&gt; T query(final String sql, final ResultSetExtractor&lt;T&gt; rse) throws DataAccessException {</span></span>
<span class="line"><span> Assert.notNull(sql, &quot;SQL must not be null&quot;);</span></span>
<span class="line"><span> Assert.notNull(rse, &quot;ResultSetExtractor must not be null&quot;);</span></span>
<span class="line"><span> if (logger.isDebugEnabled()) {</span></span>
<span class="line"><span>  logger.debug(&quot;Executing SQL query [&quot; + sql + &quot;]&quot;);</span></span>
<span class="line"><span> }</span></span>
<span class="line"><span></span></span>
<span class="line"><span> class QueryStatementCallback implements StatementCallback&lt;T&gt;, SqlProvider {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public T doInStatement(Statement stmt) throws SQLException {</span></span>
<span class="line"><span>   ResultSet rs = null;</span></span>
<span class="line"><span>   try {</span></span>
<span class="line"><span>    rs = stmt.executeQuery(sql);</span></span>
<span class="line"><span>    ResultSet rsToUse = rs;</span></span>
<span class="line"><span>    if (nativeJdbcExtractor != null) {</span></span>
<span class="line"><span>     rsToUse = nativeJdbcExtractor.getNativeResultSet(rs);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return rse.extractData(rsToUse);</span></span>
<span class="line"><span>   }</span></span>
<span class="line"><span>   finally {</span></span>
<span class="line"><span>    JdbcUtils.closeResultSet(rs);</span></span>
<span class="line"><span>   }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public String getSql() {</span></span>
<span class="line"><span>   return sql;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span> }</span></span>
<span class="line"><span></span></span>
<span class="line"><span> return execute(new QueryStatementCallback());</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Override</span></span>
<span class="line"><span>public &lt;T&gt; T execute(StatementCallback&lt;T&gt; action) throws DataAccessException {</span></span>
<span class="line"><span> Assert.notNull(action, &quot;Callback object must not be null&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span> Connection con = DataSourceUtils.getConnection(getDataSource());</span></span>
<span class="line"><span> Statement stmt = null;</span></span>
<span class="line"><span> try {</span></span>
<span class="line"><span>  Connection conToUse = con;</span></span>
<span class="line"><span>  if (this.nativeJdbcExtractor != null &amp;&amp;</span></span>
<span class="line"><span>    this.nativeJdbcExtractor.isNativeConnectionNecessaryForNativeStatements()) {</span></span>
<span class="line"><span>   conToUse = this.nativeJdbcExtractor.getNativeConnection(con);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  stmt = conToUse.createStatement();</span></span>
<span class="line"><span>  applyStatementSettings(stmt);</span></span>
<span class="line"><span>  Statement stmtToUse = stmt;</span></span>
<span class="line"><span>  if (this.nativeJdbcExtractor != null) {</span></span>
<span class="line"><span>   stmtToUse = this.nativeJdbcExtractor.getNativeStatement(stmt);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  T result = action.doInStatement(stmtToUse);</span></span>
<span class="line"><span>  handleWarnings(stmt);</span></span>
<span class="line"><span>  return result;</span></span>
<span class="line"><span> }</span></span>
<span class="line"><span> catch (SQLException ex) {</span></span>
<span class="line"><span>  // Release Connection early, to avoid potential connection pool deadlock</span></span>
<span class="line"><span>  // in the case when the exception translator hasn&#39;t been initialized yet.</span></span>
<span class="line"><span>  JdbcUtils.closeStatement(stmt);</span></span>
<span class="line"><span>  stmt = null;</span></span>
<span class="line"><span>  DataSourceUtils.releaseConnection(con, getDataSource());</span></span>
<span class="line"><span>  con = null;</span></span>
<span class="line"><span>  throw getExceptionTranslator().translate(&quot;StatementCallback&quot;, getSql(action), ex);</span></span>
<span class="line"><span> }</span></span>
<span class="line"><span> finally {</span></span>
<span class="line"><span>  JdbcUtils.closeStatement(stmt);</span></span>
<span class="line"><span>  DataSourceUtils.releaseConnection(con, getDataSource());</span></span>
<span class="line"><span> }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="应用举例二-setclicklistener" tabindex="-1">应用举例二：setClickListener(） <a class="header-anchor" href="#应用举例二-setclicklistener" aria-label="Permalink to &quot;应用举例二：setClickListener(）&quot;">&amp;ZeroWidthSpace;</a></h2><p>在客户端开发中，我们经常给控件注册事件监听器，比如下面这段代码，就是在Android应用开发中，给Button控件的点击事件注册监听器。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Button button = (Button)findViewById(R.id.button);</span></span>
<span class="line"><span>button.setOnClickListener(new OnClickListener() {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void onClick(View v) {</span></span>
<span class="line"><span>    System.out.println(&quot;I am clicked.&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>从代码结构上来看，事件监听器很像回调，即传递一个包含回调函数（onClick()）的对象给另一个函数。从应用场景上来看，它又很像观察者模式，即事先注册观察者（OnClickListener），当用户点击按钮的时候，发送点击事件给观察者，并且执行相应的onClick()函数。</p><p>我们前面讲到，回调分为同步回调和异步回调。这里的回调算是异步回调，我们往setOnClickListener()函数中注册好回调函数之后，并不需要等待回调函数执行。这也印证了我们前面讲的，异步回调比较像观察者模式。</p><h2 id="应用举例三-addshutdownhook" tabindex="-1">应用举例三：addShutdownHook() <a class="header-anchor" href="#应用举例三-addshutdownhook" aria-label="Permalink to &quot;应用举例三：addShutdownHook()&quot;">&amp;ZeroWidthSpace;</a></h2><p>Hook可以翻译成“钩子”，那它跟Callback有什么区别呢？</p><p>网上有人认为Hook就是Callback，两者说的是一回事儿，只是表达不同而已。而有人觉得Hook是Callback的一种应用。Callback更侧重语法机制的描述，Hook更加侧重应用场景的描述。我个人比较认可后面一种说法。不过，这个也不重要，我们只需要见了代码能认识，遇到场景会用就可以了。</p><p>Hook比较经典的应用场景是Tomcat和JVM的shutdown hook。接下来，我们拿JVM来举例说明一下。JVM提供了Runtime.addShutdownHook(Thread hook)方法，可以注册一个JVM关闭的Hook。当应用程序关闭的时候，JVM会自动调用Hook代码。代码示例如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ShutdownHookDemo {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static class ShutdownHook extends Thread {</span></span>
<span class="line"><span>    public void run() {</span></span>
<span class="line"><span>      System.out.println(&quot;I am called during shutting down.&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    Runtime.getRuntime().addShutdownHook(new ShutdownHook());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们再来看addShutdownHook()的代码实现，如下所示。这里我只给出了部分相关代码。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Runtime {</span></span>
<span class="line"><span>  public void addShutdownHook(Thread hook) {</span></span>
<span class="line"><span>    SecurityManager sm = System.getSecurityManager();</span></span>
<span class="line"><span>    if (sm != null) {</span></span>
<span class="line"><span>      sm.checkPermission(new RuntimePermission(&quot;shutdownHooks&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ApplicationShutdownHooks.add(hook);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class ApplicationShutdownHooks {</span></span>
<span class="line"><span>    /* The set of registered hooks */</span></span>
<span class="line"><span>    private static IdentityHashMap&lt;Thread, Thread&gt; hooks;</span></span>
<span class="line"><span>    static {</span></span>
<span class="line"><span>            hooks = new IdentityHashMap&lt;&gt;();</span></span>
<span class="line"><span>        } catch (IllegalStateException e) {</span></span>
<span class="line"><span>            hooks = null;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    static synchronized void add(Thread hook) {</span></span>
<span class="line"><span>        if(hooks == null)</span></span>
<span class="line"><span>            throw new IllegalStateException(&quot;Shutdown in progress&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        if (hook.isAlive())</span></span>
<span class="line"><span>            throw new IllegalArgumentException(&quot;Hook already running&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        if (hooks.containsKey(hook))</span></span>
<span class="line"><span>            throw new IllegalArgumentException(&quot;Hook previously registered&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        hooks.put(hook, hook);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    static void runHooks() {</span></span>
<span class="line"><span>        Collection&lt;Thread&gt; threads;</span></span>
<span class="line"><span>        synchronized(ApplicationShutdownHooks.class) {</span></span>
<span class="line"><span>            threads = hooks.keySet();</span></span>
<span class="line"><span>            hooks = null;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        for (Thread hook : threads) {</span></span>
<span class="line"><span>            hook.start();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        for (Thread hook : threads) {</span></span>
<span class="line"><span>            while (true) {</span></span>
<span class="line"><span>                try {</span></span>
<span class="line"><span>                    hook.join();</span></span>
<span class="line"><span>                    break;</span></span>
<span class="line"><span>                } catch (InterruptedException ignored) {</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>从代码中我们可以发现，有关Hook的逻辑都被封装到ApplicationShutdownHooks类中了。当应用程序关闭的时候，JVM会调用这个类的runHooks()方法，创建多个线程，并发地执行多个Hook。我们在注册完Hook之后，并不需要等待Hook执行完成，所以，这也算是一种异步回调。</p><h2 id="模板模式-vs-回调" tabindex="-1">模板模式 VS 回调 <a class="header-anchor" href="#模板模式-vs-回调" aria-label="Permalink to &quot;模板模式 VS 回调&quot;">&amp;ZeroWidthSpace;</a></h2><p>回调的原理、实现和应用到此就都讲完了。接下来，我们从应用场景和代码实现两个角度，来对比一下模板模式和回调。</p><p>从应用场景上来看\b，同步回调跟模板模式几乎一致。它们都是在一个大的算法骨架中，自由替换其中的某个步骤，起到代码复用和扩展的目的。而异步回调跟模板模式有较大差别，更像是观察者模式。</p><p>从代码实现上来看，回调和模板模式完全不同。回调基于组合关系来实现，把一个对象传递给另一个对象，是一种对象之间的关系；模板模式基于继承关系来实现，子类重写父类的抽象方法，是一种类之间的关系。</p><p>前面我们也讲到，组合优于继承。实际上，这里也不例外。在代码实现上，回调相对于模板模式会更加灵活，主要体现在下面几点。</p><ul><li>像Java这种只支持单继承的语言，基于模板模式编写的子类，已经继承了一个父类，不再具有继承的能力。</li><li>回调可以使用匿名类来创建回调对象，可以不用事先定义类；而模板模式针对不同的实现都要定义不同的子类。</li><li>如果某个类中定义了多个模板方法，每个方法都有对应的抽象方法，那即便我们只用到其中的一个模板方法，子类也必须实现所有的抽象方法。而回调就更加灵活，我们只需要往用到的模板方法中注入回调对象即可。</li></ul><p>还记得上一节课的课堂讨论题目吗？看到这里，相信你应该有了答案了吧？</p><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们一块来总结回顾一下，你需要重点掌握的内容。</p><p>今天，我们重点介绍了回调。它跟模板模式具有相同的作用：代码复用和扩展。在一些框架、类库、组件等的设计中经常会用到。</p><p>相对于普通的函数调用，回调是一种双向调用关系。A类事先注册某个函数F到B类，A类在调用B类的P函数的时候，B类反过来调用A类注册给它的F函数。这里的F函数就是“回调函数”。A调用B，B反过来又调用A，这种调用机制就叫作“回调”。</p><p>回调可以细分为同步回调和异步回调。从应用场景上来看，同步回调看起来更像模板模式，异步回调看起来更像观察者模式。回调跟模板模式的区别，更多的是在代码实现上，而非应用场景上。回调基于组合关系来实现，模板模式基于继承关系来实现，回调比模板模式更加灵活。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>对于Callback和Hook的区别，你有什么不同的理解吗？在你熟悉的编程语言中，有没有提供相应的语法概念？是叫Callback，还是Hook呢？</p><p>欢迎留言和我分享你的想法。如果有收获，欢迎你把这篇文章分享给你的朋友。 精选留言（15） Java垒墙工程师 👍（3） 💬（2）回调的方式是不是打乱了系统调用的层次？相互依赖，依赖关系变得复杂2020-08-25吴小智 👍（109） 💬（1）模板方法和回调应用场景是一致的，都是定义好算法骨架，并对外开放扩展点，符合开闭原则；两者的却别是代码的实现上不同，模板方法是通过继承来实现，是自己调用自己；回调是类之间的组合。2020-03-18L!en6o 👍（79） 💬（4）曾经重构代码对这模板模式和callback就很疑惑。个人觉得callback更加灵活，适合算法逻辑较少的场景，实现一两个方法很舒服。比如Guava 的Futures.addCallback 回调 onSuccess onFailure方法。而模板模式适合更加复杂的场景，并且子类可以复用父类提供的方法，根据场景判断是否需要重写更加方便。2020-03-19小晏子 👍（62） 💬（3）callback和hook不是一个层面的东西，callback是程序设计方面的一种技术手段，是编程语言成面的东西，hook是通过这种技术手段实现的功能扩展点，其基本原理就是callback。比如windows api中提供的各种事件通知机制，其本身是windows开放给用户可以扩展自己想要的功能的扩展点，而实现这些功能的手段是callback。 只要编程语言支持传递函数作为参数，都可以支持callback设计，比如c，golang，javascript，python等。另外一些框架中提供的功能扩展点我们称之为hook，比如vue在其实例生命周期中提供的各种hook函数。2020-03-18剑八 👍（44） 💬（5）模板方法就是定义一个流程，每个流程结点可变的就是一个抽象spi，由不同实现去现。 解决的是一个复用与扩展问题。复用的是这个流程本身以及某些结点可以是默认实现。扩展的是有些结点是可以有不同实现的场景。 回调是一种交互方式，由调用者告诉被调用者：你做完后还要做一个事情，这个事情是什么。然后被调用者做完后就可以做这个指定的事情。回调倒不用强制和模板方法概念合在一起。2020-07-05柠檬C 👍（20） 💬（2）个人看法：模板模式关注点还是在类与对象上，通过继承与多态实现算法的扩展 回调关注点在方法上，虽然在java语言中不得不以匿名内部类的形式出现，但本质是将方法当做参数一样传递，有点函数式编程的意思了2020-03-19pedro 👍（12） 💬（2）callback应该偏语言层面，hook偏业务层面，二者一个是概念，一个是具体的落地方式。2020-03-18写代码的 👍（11） 💬（2）虽然模板模式和回调很像，甚至和可以互相替换，但是为了让它们的功能和名称更契合，我觉得按照这样原则来使用这两种方法是不是会更好些：如果预留的扩展点必须实现，因为这些扩展点包含和这个类本身相关的关键功能性代码，不实现的话这个类就是个半成品，无法使用，那么使用模板模式，因为模板模式使用的抽象类可以在与语言层面强制这些扩展点必须被实现；如果预留的扩展点可以不实现，或者这些扩展点的实现逻辑甚至可以和这个类完全无关，那么就使用回调,，回调使用的组合关系恰好可以让类和扩展点的实现进行解耦，比如按钮上的事件回调，回调中的逻辑和按钮这个类本身的功能并没有什么关系，甚至回调可以传 null。2020-08-30辣么大 👍（6） 💬（1）什么是“回调 ”？A注册一个函数到B，B执行某个函数时，会调用A注册的这个函数。 我见过的应用一般完全结束（关闭，收尾等）时用hook，其他情况用callback或者on...listener。这种区别更多是语意上的，不是实现上的。2020-03-24前端西瓜哥 👍（6） 💬（0）Callback 是在一个方法的执行中，调用嵌入的其他方法的机制，能很好地起到代码复用和框架扩展的作用。在 JavaScript 中，因为函数可以直接作为另一个函数的参数，所以能经常看到回调函数的身影，比如定时器 setTimeout(callback, delay)、Ajax 请求成功或失败对应的回调函数等。不过如果滥用回调的话，会在某些场景下会因为嵌套过多导致回调地狱。</p><p>Hook 本质上也是回调，但它往往和一些场景性的行为绑定在一起。在浏览器环境中，我们可以通过 img.onload = func1 来让图片在加载完后执行函数 func1，某种意义上算是一种 Hook。此外在 js 的 vue 框架中，也提供了组件生命周期的 Hook，比如 beforeDestory 钩子函数会在组件即将被销毁前执行，常用于销毁一些当前组件才会用到的定时器。2020-03-19肖臧 👍（5） 💬（0）补充一下ResultSetExtractor类的extractData方法会回调RowMapper类的mapRow方法，在这里把ResultSet转成Entity实例，下面是具体的代码： public List&lt;T&gt; extractData(ResultSet rs) throws SQLException { List&lt;T&gt; results = (this.rowsExpected &gt; 0 ? new ArrayList&lt;&gt;(this.rowsExpected) : new ArrayList&lt;&gt;()); int rowNum = 0; while (rs.next()) { results.add(this.rowMapper.mapRow(rs, rowNum++)); } return results; }2020-06-08Michael 👍（5） 💬（1）swift和OC的闭包也属于回调2020-03-19黄林晴 👍（5） 💬（4）打卡 回调接口如果定义了多个方法，不也需要全部实现吗</p><p>课后思考: android 中有个hook 概念，多用于反射修改源码机制，进行插件化相关的开发2020-03-18gevin 👍（3） 💬（0）前面问老师一个在开发中，对模版模式和回调的使用如何取舍的问题。我自己思考如下：</p><ol><li>如果我们的业务场景是针对老师文中所说的“业务算法”，那两种方式都可以，如果回调不是太复杂，不会导致整个业务逻辑的混乱，那么回调可能是更优雅的一种方案</li><li>有时我们面向的业务本身，可能就是一种模板，比如定义一种业务流程，具体实现是对这种模板的个性化，或者我们对场景是对一种工业加工工艺的数字化实现，这些场景，可以直接套用模版模式的逻辑，回调不能直观体现业务逻辑，就不用考虑了。2020-09-16Richie 👍（3） 💬（0）Hook机制和观察者模式都是基于Callback来实现的，这两者又有什么区别呢？ 是否可以理解为：</li></ol><ul><li>Hook一般是同步阻塞回调，是对原应用、框架流程的干预和扩展；</li><li>观察者模式一般是异步非阻塞回调，主要实现的语义是当某个事件发生时，我可以做一些其他事情，比如发送通知、比如对事件源做一些额外的处理；</li><li>Hook常用在框架层面，属于固定流程上一定会发生的；</li><li>Event Listener则比较常用在具体应用中，事件是可能发生也可能不发生，而且不确定什么时候会发生的；2020-03-25</li></ul>`,52)])])}const b=n(l,[["render",t]]);export{h as __pageData,b as default};
