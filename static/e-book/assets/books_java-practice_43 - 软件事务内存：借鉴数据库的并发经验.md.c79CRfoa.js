import{_ as s,o as a,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const d=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/java-practice/43 - 软件事务内存：借鉴数据库的并发经验.md","filePath":"books/java-practice/43 - 软件事务内存：借鉴数据库的并发经验.md"}'),l={name:"books/java-practice/43 - 软件事务内存：借鉴数据库的并发经验.md"};function i(t,n,c,r,o,g){return a(),p("div",null,[...n[0]||(n[0]=[e(`<p>很多同学反馈说，工作了挺长时间但是没有机会接触并发编程，实际上我们天天都在写并发程序，只不过并发相关的问题都被类似Tomcat这样的Web服务器以及MySQL这样的数据库解决了。尤其是数据库，在解决并发问题方面，可谓成绩斐然，它的<strong>事务机制非常简单易用</strong>，能甩Java里面的锁、原子类十条街。技术无边界，很显然要借鉴一下。</p><p>其实很多编程语言都有从数据库的事务管理中获得灵感，并且总结出了一个新的并发解决方案：<strong>软件事务内存（Software Transactional Memory，简称STM）</strong>。传统的数据库事务，支持4个特性：原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation）和持久性（Durability），也就是大家常说的ACID，STM由于不涉及到持久化，所以只支持ACI。</p><p>STM的使用很简单，下面我们以经典的转账操作为例，看看用STM该如何实现。</p><h2 id="用stm实现转账" tabindex="-1">用STM实现转账 <a class="header-anchor" href="#用stm实现转账" aria-label="Permalink to &quot;用STM实现转账&quot;">&amp;ZeroWidthSpace;</a></h2><p>我们曾经在<a href="https://time.geekbang.org/column/article/85001" target="_blank" rel="noreferrer">《05 | 一不小心就死锁了，怎么办？》</a>这篇文章中，讲到了并发转账的例子，示例代码如下。简单地使用 synchronized 将 transfer() 方法变成同步方法并不能解决并发问题，因为还存在死锁问题。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class UnsafeAccount {</span></span>
<span class="line"><span>  //余额</span></span>
<span class="line"><span>  private long balance;</span></span>
<span class="line"><span>  //构造函数</span></span>
<span class="line"><span>  public UnsafeAccount(long balance) {</span></span>
<span class="line"><span>    this.balance = balance;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //转账</span></span>
<span class="line"><span>  void transfer(UnsafeAccount target, long amt){</span></span>
<span class="line"><span>    if (this.balance &gt; amt) {</span></span>
<span class="line"><span>      this.balance -= amt;</span></span>
<span class="line"><span>      target.balance += amt;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>该转账操作若使用数据库事务就会非常简单，如下面的示例代码所示。如果所有SQL都正常执行，则通过 commit() 方法提交事务；如果SQL在执行过程中有异常，则通过 rollback() 方法回滚事务。数据库保证在并发情况下不会有死锁，而且还能保证前面我们说的原子性、一致性、隔离性和持久性，也就是ACID。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Connection conn = null;</span></span>
<span class="line"><span>try{</span></span>
<span class="line"><span>  //获取数据库连接</span></span>
<span class="line"><span>  conn = DriverManager.getConnection();</span></span>
<span class="line"><span>  //设置手动提交事务</span></span>
<span class="line"><span>  conn.setAutoCommit(false);</span></span>
<span class="line"><span>  //执行转账SQL</span></span>
<span class="line"><span>  ......</span></span>
<span class="line"><span>  //提交事务</span></span>
<span class="line"><span>  conn.commit();</span></span>
<span class="line"><span>} catch (Exception e) {</span></span>
<span class="line"><span>  //出现异常回滚事务</span></span>
<span class="line"><span>  conn.rollback();</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>那如果用STM又该如何实现呢？Java语言并不支持STM，不过可以借助第三方的类库来支持，<a href="https://github.com/pveentjer/Multiverse" target="_blank" rel="noreferrer">Multiverse</a>就是个不错的选择。下面的示例代码就是借助Multiverse实现了线程安全的转账操作，相比较上面线程不安全的UnsafeAccount，其改动并不大，仅仅是将余额的类型从 long 变成了 TxnLong ，将转账的操作放到了 atomic(()-&gt;{}) 中。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Account{</span></span>
<span class="line"><span>  //余额</span></span>
<span class="line"><span>  private TxnLong balance;</span></span>
<span class="line"><span>  //构造函数</span></span>
<span class="line"><span>  public Account(long balance){</span></span>
<span class="line"><span>    this.balance = StmUtils.newTxnLong(balance);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //转账</span></span>
<span class="line"><span>  public void transfer(Account to, int amt){</span></span>
<span class="line"><span>    //原子化操作</span></span>
<span class="line"><span>    atomic(()-&gt;{</span></span>
<span class="line"><span>      if (this.balance.get() &gt; amt) {</span></span>
<span class="line"><span>        this.balance.decrement(amt);</span></span>
<span class="line"><span>        to.balance.increment(amt);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>一个关键的atomic()方法就把并发问题解决了，这个方案看上去比传统的方案的确简单了很多，那它是如何实现的呢？数据库事务发展了几十年了，目前被广泛使用的是<strong>MVCC</strong>（全称是Multi-Version Concurrency Control），也就是多版本并发控制。</p><p>MVCC可以简单地理解为数据库事务在开启的时候，会给数据库打一个快照，以后所有的读写都是基于这个快照的。当提交事务的时候，如果所有读写过的数据在该事务执行期间没有发生过变化，那么就可以提交；如果发生了变化，说明该事务和有其他事务读写的数据冲突了，这个时候是不可以提交的。</p><p>为了记录数据是否发生了变化，可以给每条数据增加一个版本号，这样每次成功修改数据都会增加版本号的值。MVCC的工作原理和我们曾经在<a href="https://time.geekbang.org/column/article/89456" target="_blank" rel="noreferrer">《18 | StampedLock：有没有比读写锁更快的锁？》</a>中提到的乐观锁非常相似。有不少STM的实现方案都是基于MVCC的，例如知名的Clojure STM。</p><p>下面我们就用最简单的代码基于MVCC实现一个简版的STM，这样你会对STM以及MVCC的工作原理有更深入的认识。</p><h2 id="自己实现stm" tabindex="-1">自己实现STM <a class="header-anchor" href="#自己实现stm" aria-label="Permalink to &quot;自己实现STM&quot;">&amp;ZeroWidthSpace;</a></h2><p>我们首先要做的，就是让Java中的对象有版本号，在下面的示例代码中，VersionedRef这个类的作用就是将对象value包装成带版本号的对象。按照MVCC理论，数据的每一次修改都对应着一个唯一的版本号，所以不存在仅仅改变value或者version的情况，用不变性模式就可以很好地解决这个问题，所以VersionedRef这个类被我们设计成了不可变的。</p><p>所有对数据的读写操作，一定是在一个事务里面，TxnRef这个类负责完成事务内的读写操作，读写操作委托给了接口Txn，Txn代表的是读写操作所在的当前事务， 内部持有的curRef代表的是系统中的最新值。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>//带版本号的对象引用</span></span>
<span class="line"><span>public final class VersionedRef&lt;T&gt; {</span></span>
<span class="line"><span>  final T value;</span></span>
<span class="line"><span>  final long version;</span></span>
<span class="line"><span>  //构造方法</span></span>
<span class="line"><span>  public VersionedRef(T value, long version) {</span></span>
<span class="line"><span>    this.value = value;</span></span>
<span class="line"><span>    this.version = version;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>//支持事务的引用</span></span>
<span class="line"><span>public class TxnRef&lt;T&gt; {</span></span>
<span class="line"><span>  //当前数据，带版本号</span></span>
<span class="line"><span>  volatile VersionedRef curRef;</span></span>
<span class="line"><span>  //构造方法</span></span>
<span class="line"><span>  public TxnRef(T value) {</span></span>
<span class="line"><span>    this.curRef = new VersionedRef(value, 0L);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //获取当前事务中的数据</span></span>
<span class="line"><span>  public T getValue(Txn txn) {</span></span>
<span class="line"><span>    return txn.get(this);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //在当前事务中设置数据</span></span>
<span class="line"><span>  public void setValue(T value, Txn txn) {</span></span>
<span class="line"><span>    txn.set(this, value);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>STMTxn是Txn最关键的一个实现类，事务内对于数据的读写，都是通过它来完成的。STMTxn内部有两个Map：inTxnMap，用于保存当前事务中所有读写的数据的快照；writeMap，用于保存当前事务需要写入的数据。每个事务都有一个唯一的事务ID txnId，这个txnId是全局递增的。</p><p>STMTxn有三个核心方法，分别是读数据的get()方法、写数据的set()方法和提交事务的commit()方法。其中，get()方法将要读取数据作为快照放入inTxnMap，同时保证每次读取的数据都是一个版本。set()方法会将要写入的数据放入writeMap，但如果写入的数据没被读取过，也会将其放入 inTxnMap。</p><p>至于commit()方法，我们为了简化实现，使用了互斥锁，所以事务的提交是串行的。commit()方法的实现很简单，首先检查inTxnMap中的数据是否发生过变化，如果没有发生变化，那么就将writeMap中的数据写入（这里的写入其实就是TxnRef内部持有的curRef）；如果发生过变化，那么就不能将writeMap中的数据写入了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>//事务接口</span></span>
<span class="line"><span>public interface Txn {</span></span>
<span class="line"><span>  &lt;T&gt; T get(TxnRef&lt;T&gt; ref);</span></span>
<span class="line"><span>  &lt;T&gt; void set(TxnRef&lt;T&gt; ref, T value);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>//STM事务实现类</span></span>
<span class="line"><span>public final class STMTxn implements Txn {</span></span>
<span class="line"><span>  //事务ID生成器</span></span>
<span class="line"><span>  private static AtomicLong txnSeq = new AtomicLong(0);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  //当前事务所有的相关数据</span></span>
<span class="line"><span>  private Map&lt;TxnRef, VersionedRef&gt; inTxnMap = new HashMap&lt;&gt;();</span></span>
<span class="line"><span>  //当前事务所有需要修改的数据</span></span>
<span class="line"><span>  private Map&lt;TxnRef, Object&gt; writeMap = new HashMap&lt;&gt;();</span></span>
<span class="line"><span>  //当前事务ID</span></span>
<span class="line"><span>  private long txnId;</span></span>
<span class="line"><span>  //构造函数，自动生成当前事务ID</span></span>
<span class="line"><span>  STMTxn() {</span></span>
<span class="line"><span>    txnId = txnSeq.incrementAndGet();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  //获取当前事务中的数据</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public &lt;T&gt; T get(TxnRef&lt;T&gt; ref) {</span></span>
<span class="line"><span>    //将需要读取的数据，加入inTxnMap</span></span>
<span class="line"><span>    if (!inTxnMap.containsKey(ref)) {</span></span>
<span class="line"><span>      inTxnMap.put(ref, ref.curRef);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return (T) inTxnMap.get(ref).value;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //在当前事务中修改数据</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public &lt;T&gt; void set(TxnRef&lt;T&gt; ref, T value) {</span></span>
<span class="line"><span>    //将需要修改的数据，加入inTxnMap</span></span>
<span class="line"><span>    if (!inTxnMap.containsKey(ref)) {</span></span>
<span class="line"><span>      inTxnMap.put(ref, ref.curRef);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    writeMap.put(ref, value);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //提交事务</span></span>
<span class="line"><span>  boolean commit() {</span></span>
<span class="line"><span>    synchronized (STM.commitLock) {</span></span>
<span class="line"><span>    //是否校验通过</span></span>
<span class="line"><span>    boolean isValid = true;</span></span>
<span class="line"><span>    //校验所有读过的数据是否发生过变化</span></span>
<span class="line"><span>    for(Map.Entry&lt;TxnRef, VersionedRef&gt; entry : inTxnMap.entrySet()){</span></span>
<span class="line"><span>      VersionedRef curRef = entry.getKey().curRef;</span></span>
<span class="line"><span>      VersionedRef readRef = entry.getValue();</span></span>
<span class="line"><span>      //通过版本号来验证数据是否发生过变化</span></span>
<span class="line"><span>      if (curRef.version != readRef.version) {</span></span>
<span class="line"><span>        isValid = false;</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //如果校验通过，则所有更改生效</span></span>
<span class="line"><span>    if (isValid) {</span></span>
<span class="line"><span>      writeMap.forEach((k, v) -&gt; {</span></span>
<span class="line"><span>        k.curRef = new VersionedRef(v, txnId);</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return isValid;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>下面我们来模拟实现Multiverse中的原子化操作atomic()。atomic()方法中使用了类似于CAS的操作，如果事务提交失败，那么就重新创建一个新的事务，重新执行。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@FunctionalInterface</span></span>
<span class="line"><span>public interface TxnRunnable {</span></span>
<span class="line"><span>  void run(Txn txn);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>//STM</span></span>
<span class="line"><span>public final class STM {</span></span>
<span class="line"><span>  //私有化构造方法</span></span>
<span class="line"><span>  private STM() {</span></span>
<span class="line"><span>  //提交数据需要用到的全局锁  </span></span>
<span class="line"><span>  static final Object commitLock = new Object();</span></span>
<span class="line"><span>  //原子化提交方法</span></span>
<span class="line"><span>  public static void atomic(TxnRunnable action) {</span></span>
<span class="line"><span>    boolean committed = false;</span></span>
<span class="line"><span>    //如果没有提交成功，则一直重试</span></span>
<span class="line"><span>    while (!committed) {</span></span>
<span class="line"><span>      //创建新的事务</span></span>
<span class="line"><span>      STMTxn txn = new STMTxn();</span></span>
<span class="line"><span>      //执行业务逻辑</span></span>
<span class="line"><span>      action.run(txn);</span></span>
<span class="line"><span>      //提交事务</span></span>
<span class="line"><span>      committed = txn.commit();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}}</span></span></code></pre></div><p>就这样，我们自己实现了STM，并完成了线程安全的转账操作，使用方法和Multiverse差不多，这里就不赘述了，具体代码如下面所示。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Account {</span></span>
<span class="line"><span>  //余额</span></span>
<span class="line"><span>  private TxnRef&lt;Integer&gt; balance;</span></span>
<span class="line"><span>  //构造方法</span></span>
<span class="line"><span>  public Account(int balance) {</span></span>
<span class="line"><span>    this.balance = new TxnRef&lt;Integer&gt;(balance);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //转账操作</span></span>
<span class="line"><span>  public void transfer(Account target, int amt){</span></span>
<span class="line"><span>    STM.atomic((txn)-&gt;{</span></span>
<span class="line"><span>      Integer from = balance.getValue(txn);</span></span>
<span class="line"><span>      balance.setValue(from-amt, txn);</span></span>
<span class="line"><span>      Integer to = target.balance.getValue(txn);</span></span>
<span class="line"><span>      target.balance.setValue(to+amt, txn);</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">&amp;ZeroWidthSpace;</a></h2><p>STM借鉴的是数据库的经验，数据库虽然复杂，但仅仅存储数据，而编程语言除了有共享变量之外，还会执行各种I/O操作，很显然I/O操作是很难支持回滚的。所以，STM也不是万能的。目前支持STM的编程语言主要是函数式语言，函数式语言里的数据天生具备不可变性，利用这种不可变性实现STM相对来说更简单。</p><p>另外，需要说明的是，文中的“自己实现STM”部分我参考了<a href="http://www.codecommit.com/blog/scala/software-transactional-memory-in-scala" target="_blank" rel="noreferrer">Software Transactional Memory in Scala</a>这篇博文以及<a href="https://github.com/epam-mooc/stm-java" target="_blank" rel="noreferrer">一个GitHub项目</a>，目前还很粗糙，并不是一个完备的MVCC。如果你对这方面感兴趣，可以参考<a href="http://www.codecommit.com/blog/scala/improving-the-stm-multi-version-concurrency-control" target="_blank" rel="noreferrer">Improving the STM: Multi-Version Concurrency Control</a> 这篇博文，里面讲到了如何优化，你可以尝试学习下。</p><p>欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。 精选留言（15） M$画像 👍（22） 💬（1）希望王老师再出新品，一定支持。2019-06-24小文同学 👍（20） 💬（9）谢谢老师推荐STM，我所在的游戏项目一直有对象异步入库的需求，为了使用异步入库，放弃了Spring针对数据库的事务。为此不得不编写大量代码去判断某个操作是否可以执行，希望软件事务内存可以为我的需求提供一个新的解决方案。最近几天开始研究相关源码了，希望可以较好的结合现有项目，有可以发布的成果一定在留言区为大家共享。2019-09-06helloworld 👍（6） 💬（4）按照老师自己实现的STM程序，根本不存在commit提交失败的时候吧？因为每一次的commit都是新创建一个STMTxn，新创建STMTxn后，inTxnMap和writeMap都是新的。不知道我考虑的对不对？？2019-09-23黄海峰 👍（2） 💬（1）代码里硬是没看到哪里修改了version。。2019-06-06Geek_039a5c 👍（1） 💬（1）代码还有有点小问题。 STM 这个类的代码 花括号写的不对。 2022-02-05纷繁的烟火 👍（1） 💬（1）最后段代码的 构造参数里的txn在哪呀 找也找不到2020-01-14石头汤 👍（0） 💬（1）是不是 STM.atomic 的 TxnRunnable 的实现必须是幂等的，否则 while 循环那里会产生脏数据？2020-06-11有铭 👍（0） 💬（1）老师，关系数据库也是有死锁的，只是他们往往实现了死锁检测机制，死锁到一定时间就会强制解锁2019-06-06小太阳 👍（12） 💬（2）看了三遍，终于看懂了，很妙。原来精华就在这一段：MVCC 可以简单地理解为数据库事务在开启的时候，会给数据库打一个快照，以后所有的读写都是基于这个快照的。当提交事务的时候，如果所有读写过的数据在该事务执行期间没有发生过变化，那么就可以提交；如果发生了变化，说明该事务和有其他事务读写的数据冲突了，这个时候是不可以提交的。Txn负责维护检测快照，TxnRef负责包装数据使之可以接入Txn，作为快照的key。VersionedRef负责包装数据使之有版本。 另外，最后的代码里忘了判断余额是否够用了。😁2020-07-08松小鼠 👍（11） 💬（5）我公司用的就是这个解决并发问题的，才知道是这种技术2019-06-06DFighting 👍（8） 💬（0）STM的优化有一点是针对大快照的优化吧，因为MySQL对数据库的快照并不是真正存储一份备份数据，类似例子中的map，而是利用version和undolog计算得到的，不然一个100G大小的数据库，每开启一个事物就拷贝一份数据，肯定是不现实的。2019-10-16林添 👍（5） 💬（3）照着实现了一遍，确实可以巧妙。 我觉得类STMTxn的get函数可以改进一下：现在get返回的值，只是最初始的值，如果当前事务更改了值，然后再调用get，最好可以返回最新的值；即当前事务的更改，对自己是可见的。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>    @Override</span></span>
<span class="line"><span>    public &amp;lt;T&amp;gt; T get(TxnRef&amp;lt;T&amp;gt; ref) {</span></span>
<span class="line"><span>        if (!inTxnMap.containsKey(ref)) {</span></span>
<span class="line"><span>            inTxnMap.put(ref, ref.curRef);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        if (writeMap.containsKey(ref)) {</span></span>
<span class="line"><span>            return (T) writeMap.get(ref);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        else {</span></span>
<span class="line"><span>            return (T) inTxnMap.get(ref).value;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>\`\`\`&lt;/p&gt;2019-08-19&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;青菜&lt;/span&gt; 👍（1） 💬（0）&lt;p&gt;老师，理解在提交时版本号都是一样的，都是0，即使修改了也没去修改版本号啊，所以不管怎样都能提交&lt;/p&gt;2020-08-11&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;QQ怪&lt;/span&gt; 👍（1） 💬（0）&lt;p&gt;哔，打卡，涨知识了&lt;/p&gt;2019-06-06&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;黄卫江&lt;/span&gt; 👍（0） 💬（0）&lt;p&gt;核心点：inMap记录所有事务内读取过的值，writeMap暂存所有值的新值，由于inMap的key的curRef是不可变的，所以如果有其他事务改过了值就会找到inMap中的curRef和一开始设置的inMap的value不是一个对象（键值对的值永远是一开始写入的对象）&lt;/p&gt;2023-05-21&lt;/li&gt;&lt;br/&gt;</span></span>
<span class="line"><span>&lt;/ul&gt;</span></span></code></pre></div>`,31)])])}const T=s(l,[["render",i]]);export{d as __pageData,T as default};
