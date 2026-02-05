import{_ as n,o as s,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const k=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/java-practice/17 - ReadWriteLock：如何快速实现一个完备的缓存？.md","filePath":"books/java-practice/17 - ReadWriteLock：如何快速实现一个完备的缓存？.md"}'),l={name:"books/java-practice/17 - ReadWriteLock：如何快速实现一个完备的缓存？.md"};function i(c,a,t,r,o,d){return s(),p("div",null,[...a[0]||(a[0]=[e(`<p>前面我们介绍了管程和信号量这两个同步原语在Java语言中的实现，理论上用这两个同步原语中任何一个都可以解决所有的并发问题。那Java SDK并发包里为什么还有很多其他的工具类呢？原因很简单：<strong>分场景优化性能，提升易用性</strong>。</p><p>今天我们就介绍一种非常普遍的并发场景：读多写少场景。实际工作中，为了优化性能，我们经常会使用缓存，例如缓存元数据、缓存基础数据等，这就是一种典型的读多写少应用场景。缓存之所以能提升性能，一个重要的条件就是缓存的数据一定是读多写少的，例如元数据和基础数据基本上不会发生变化（写少），但是使用它们的地方却很多（读多）。</p><p>针对读多写少这种并发场景，Java SDK并发包提供了读写锁——ReadWriteLock，非常容易使用，并且性能很好。</p><p><strong>那什么是读写锁呢？</strong></p><p>读写锁，并不是Java语言特有的，而是一个广为使用的通用技术，所有的读写锁都遵守以下三条基本原则：</p><ol><li>允许多个线程同时读共享变量；</li><li>只允许一个线程写共享变量；</li><li>如果一个写线程正在执行写操作，此时禁止读线程读共享变量。</li></ol><p>读写锁与互斥锁的一个重要区别就是<strong>读写锁允许多个线程同时读共享变量</strong>，而互斥锁是不允许的，这是读写锁在读多写少场景下性能优于互斥锁的关键。但<strong>读写锁的写操作是互斥的</strong>，当一个线程在写共享变量的时候，是不允许其他线程执行写操作和读操作。</p><h2 id="快速实现一个缓存" tabindex="-1">快速实现一个缓存 <a class="header-anchor" href="#快速实现一个缓存" aria-label="Permalink to &quot;快速实现一个缓存&quot;">&amp;ZeroWidthSpace;</a></h2><p>下面我们就实践起来，用ReadWriteLock快速实现一个通用的缓存工具类。</p><p>在下面的代码中，我们声明了一个Cache&lt;K, V&gt;类，其中类型参数K代表缓存里key的类型，V代表缓存里value的类型。缓存的数据保存在Cache类内部的HashMap里面，HashMap不是线程安全的，这里我们使用读写锁ReadWriteLock 来保证其线程安全。ReadWriteLock 是一个接口，它的实现类是ReentrantReadWriteLock，通过名字你应该就能判断出来，它是支持可重入的。下面我们通过rwl创建了一把读锁和一把写锁。</p><p>Cache这个工具类，我们提供了两个方法，一个是读缓存方法get()，另一个是写缓存方法put()。读缓存需要用到读锁，读锁的使用和前面我们介绍的Lock的使用是相同的，都是try{}finally{}这个编程范式。写缓存则需要用到写锁，写锁的使用和读锁是类似的。这样看来，读写锁的使用还是非常简单的。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Cache&lt;K,V&gt; {</span></span>
<span class="line"><span>  final Map&lt;K, V&gt; m =</span></span>
<span class="line"><span>    new HashMap&lt;&gt;();</span></span>
<span class="line"><span>  final ReadWriteLock rwl =</span></span>
<span class="line"><span>    new ReentrantReadWriteLock();</span></span>
<span class="line"><span>  // 读锁</span></span>
<span class="line"><span>  final Lock r = rwl.readLock();</span></span>
<span class="line"><span>  // 写锁</span></span>
<span class="line"><span>  final Lock w = rwl.writeLock();</span></span>
<span class="line"><span>  // 读缓存</span></span>
<span class="line"><span>  V get(K key) {</span></span>
<span class="line"><span>    r.lock();</span></span>
<span class="line"><span>    try { return m.get(key); }</span></span>
<span class="line"><span>    finally { r.unlock(); }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 写缓存</span></span>
<span class="line"><span>  V put(K key, V value) {</span></span>
<span class="line"><span>    w.lock();</span></span>
<span class="line"><span>    try { return m.put(key, v); }</span></span>
<span class="line"><span>    finally { w.unlock(); }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>如果你曾经使用过缓存的话，你应该知道<strong>使用缓存首先要解决缓存数据的初始化问题</strong>。缓存数据的初始化，可以采用一次性加载的方式，也可以使用按需加载的方式。</p><p>如果源头数据的数据量不大，就可以采用一次性加载的方式，这种方式最简单（可参考下图），只需在应用启动的时候把源头数据查询出来，依次调用类似上面示例代码中的put()方法就可以了。</p><p><img src="https://static001.geekbang.org/resource/image/62/1e/627be6e80f96719234007d0a6426771e.png?wh=1142%2A683" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>缓存一次性加载示意图</p><p>如果源头数据量非常大，那么就需要按需加载了，按需加载也叫懒加载，指的是只有当应用查询缓存，并且数据不在缓存里的时候，才触发加载源头相关数据进缓存的操作。下面你可以结合文中示意图看看如何利用ReadWriteLock 来实现缓存的按需加载。</p><p><img src="https://static001.geekbang.org/resource/image/4e/73/4e036a6b38244accfb74a0d18300f073.png?wh=1142%2A685" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>缓存按需加载示意图</p><h2 id="实现缓存的按需加载" tabindex="-1">实现缓存的按需加载 <a class="header-anchor" href="#实现缓存的按需加载" aria-label="Permalink to &quot;实现缓存的按需加载&quot;">&amp;ZeroWidthSpace;</a></h2><p>文中下面的这段代码实现了按需加载的功能，这里我们假设缓存的源头是数据库。需要注意的是，如果缓存中没有缓存目标对象，那么就需要从数据库中加载，然后写入缓存，写缓存需要用到写锁，所以在代码中的⑤处，我们调用了 <code>w.lock()</code> 来获取写锁。</p><p>另外，还需要注意的是，在获取写锁之后，我们并没有直接去查询数据库，而是在代码⑥⑦处，重新验证了一次缓存中是否存在，再次验证如果还是不存在，我们才去查询数据库并更新本地缓存。为什么我们要再次验证呢？</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Cache&lt;K,V&gt; {</span></span>
<span class="line"><span>  final Map&lt;K, V&gt; m =</span></span>
<span class="line"><span>    new HashMap&lt;&gt;();</span></span>
<span class="line"><span>  final ReadWriteLock rwl = </span></span>
<span class="line"><span>    new ReentrantReadWriteLock();</span></span>
<span class="line"><span>  final Lock r = rwl.readLock();</span></span>
<span class="line"><span>  final Lock w = rwl.writeLock();</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>  V get(K key) {</span></span>
<span class="line"><span>    V v = null;</span></span>
<span class="line"><span>    //读缓存</span></span>
<span class="line"><span>    r.lock();         ①</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      v = m.get(key); ②</span></span>
<span class="line"><span>    } finally{</span></span>
<span class="line"><span>      r.unlock();     ③</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //缓存中存在，返回</span></span>
<span class="line"><span>    if(v != null) {   ④</span></span>
<span class="line"><span>      return v;</span></span>
<span class="line"><span>    }  </span></span>
<span class="line"><span>    //缓存中不存在，查询数据库</span></span>
<span class="line"><span>    w.lock();         ⑤</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      //再次验证</span></span>
<span class="line"><span>      //其他线程可能已经查询过数据库</span></span>
<span class="line"><span>      v = m.get(key); ⑥</span></span>
<span class="line"><span>      if(v == null){  ⑦</span></span>
<span class="line"><span>        //查询数据库</span></span>
<span class="line"><span>        v=省略代码无数</span></span>
<span class="line"><span>        m.put(key, v);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    } finally{</span></span>
<span class="line"><span>      w.unlock();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return v; </span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>原因是在高并发的场景下，有可能会有多线程竞争写锁。假设缓存是空的，没有缓存任何东西，如果此时有三个线程T1、T2和T3同时调用get()方法，并且参数key也是相同的。那么它们会同时执行到代码⑤处，但此时只有一个线程能够获得写锁，假设是线程T1，线程T1获取写锁之后查询数据库并更新缓存，最终释放写锁。此时线程T2和T3会再有一个线程能够获取写锁，假设是T2，如果不采用再次验证的方式，此时T2会再次查询数据库。T2释放写锁之后，T3也会再次查询一次数据库。而实际上线程T1已经把缓存的值设置好了，T2、T3完全没有必要再次查询数据库。所以，再次验证的方式，能够避免高并发场景下重复查询数据的问题。</p><h2 id="读写锁的升级与降级" tabindex="-1">读写锁的升级与降级 <a class="header-anchor" href="#读写锁的升级与降级" aria-label="Permalink to &quot;读写锁的升级与降级&quot;">&amp;ZeroWidthSpace;</a></h2><p>上面按需加载的示例代码中，在①处获取读锁，在③处释放读锁，那是否可以在②处的下面增加验证缓存并更新缓存的逻辑呢？详细的代码如下。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>//读缓存</span></span>
<span class="line"><span>r.lock();         ①</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>  v = m.get(key); ②</span></span>
<span class="line"><span>  if (v == null) {</span></span>
<span class="line"><span>    w.lock();</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      //再次验证并更新缓存</span></span>
<span class="line"><span>      //省略详细代码</span></span>
<span class="line"><span>    } finally{</span></span>
<span class="line"><span>      w.unlock();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>} finally{</span></span>
<span class="line"><span>  r.unlock();     ③</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这样看上去好像是没有问题的，先是获取读锁，然后再升级为写锁，对此还有个专业的名字，叫<strong>锁的升级</strong>。可惜ReadWriteLock并不支持这种升级。在上面的代码示例中，读锁还没有释放，此时获取写锁，会导致写锁永久等待，最终导致相关线程都被阻塞，永远也没有机会被唤醒。锁的升级是不允许的，这个你一定要注意。</p><p>不过，虽然锁的升级是不允许的，但是锁的降级却是允许的。以下代码来源自ReentrantReadWriteLock的官方示例，略做了改动。你会发现在代码①处，获取读锁的时候线程还是持有写锁的，这种锁的降级是支持的。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class CachedData {</span></span>
<span class="line"><span>  Object data;</span></span>
<span class="line"><span>  volatile boolean cacheValid;</span></span>
<span class="line"><span>  final ReadWriteLock rwl =</span></span>
<span class="line"><span>    new ReentrantReadWriteLock();</span></span>
<span class="line"><span>  // 读锁  </span></span>
<span class="line"><span>  final Lock r = rwl.readLock();</span></span>
<span class="line"><span>  //写锁</span></span>
<span class="line"><span>  final Lock w = rwl.writeLock();</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  void processCachedData() {</span></span>
<span class="line"><span>    // 获取读锁</span></span>
<span class="line"><span>    r.lock();</span></span>
<span class="line"><span>    if (!cacheValid) {</span></span>
<span class="line"><span>      // 释放读锁，因为不允许读锁的升级</span></span>
<span class="line"><span>      r.unlock();</span></span>
<span class="line"><span>      // 获取写锁</span></span>
<span class="line"><span>      w.lock();</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        // 再次检查状态  </span></span>
<span class="line"><span>        if (!cacheValid) {</span></span>
<span class="line"><span>          data = ...</span></span>
<span class="line"><span>          cacheValid = true;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        // 释放写锁前，降级为读锁</span></span>
<span class="line"><span>        // 降级是可以的</span></span>
<span class="line"><span>        r.lock(); ①</span></span>
<span class="line"><span>      } finally {</span></span>
<span class="line"><span>        // 释放写锁</span></span>
<span class="line"><span>        w.unlock(); </span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 此处仍然持有读锁</span></span>
<span class="line"><span>    try {use(data);} </span></span>
<span class="line"><span>    finally {r.unlock();}</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">&amp;ZeroWidthSpace;</a></h2><p>读写锁类似于ReentrantLock，也支持公平模式和非公平模式。读锁和写锁都实现了 java.util.concurrent.locks.Lock接口，所以除了支持lock()方法外，tryLock()、lockInterruptibly() 等方法也都是支持的。但是有一点需要注意，那就是只有写锁支持条件变量，读锁是不支持条件变量的，读锁调用newCondition()会抛出UnsupportedOperationException异常。</p><p>今天我们用ReadWriteLock实现了一个简单的缓存，这个缓存虽然解决了缓存的初始化问题，但是没有解决缓存数据与源头数据的同步问题，这里的数据同步指的是保证缓存数据和源头数据的一致性。解决数据同步问题的一个最简单的方案就是<strong>超时机制</strong>。所谓超时机制指的是加载进缓存的数据不是长久有效的，而是有时效的，当缓存的数据超过时效，也就是超时之后，这条数据在缓存中就失效了。而访问缓存中失效的数据，会触发缓存重新从源头把数据加载进缓存。</p><p>当然也可以在源头数据发生变化时，快速反馈给缓存，但这个就要依赖具体的场景了。例如MySQL作为数据源头，可以通过近实时地解析binlog来识别数据是否发生了变化，如果发生了变化就将最新的数据推送给缓存。另外，还有一些方案采取的是数据库和缓存的双写方案。</p><p>总之，具体采用哪种方案，还是要看应用的场景。</p><h2 id="课后思考" tabindex="-1">课后思考 <a class="header-anchor" href="#课后思考" aria-label="Permalink to &quot;课后思考&quot;">&amp;ZeroWidthSpace;</a></h2><p>有同学反映线上系统停止响应了，CPU利用率很低，你怀疑有同学一不小心写出了读锁升级写锁的方案，那你该如何验证自己的怀疑呢？</p><p>欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。 精选留言（15） 西西弗与卡夫卡 👍（73） 💬（5）考虑到是线上应用，可采用以下方法</p><ol><li>源代码分析。查找ReentrantReadWriteLock在项目中的引用，看下写锁是否在读锁释放前尝试获取</li><li>如果线上是Web应用，应用服务器比如说是Tomcat，并且开启了JMX，则可以通过JConsole等工具远程查看下线上死锁的具体情况2019-04-06ycfHH 👍（55） 💬（5）问题1：获取写锁的前提是读锁和写锁均未被占用？ 问题2：获取读锁的前提是没有其他线程占用写锁？ 基于以上两点所以只支持锁降级而不允许锁升级。 问题3 高并发下，申请写锁时是不是中断其他线程申请读锁，然后等待已有读锁全部释放再获取写锁？因为如果没有禁止读锁的申请的话在读多写少的情况下写锁可能一直获取不到。 这块不太懂，希望老师能指点一下。2019-05-07缪文 👍（55） 💬（7）老师，感觉这里的读写锁，性能还有可以提升的地方，因为这里可能很多业务都会使用这个缓存懒加载，实际生产环境，写缓存操作可能会比较多，那么不同的缓存key，实际上是没有并发冲突的，所以这里的读写锁可以按key前缀拆分，即使是同一个key，也可以类似ConcurrentHash 一样分段来减少并发冲突2019-04-07sibyl 👍（36） 💬（7）老师好，回答一下有些同学关于读锁有什么用的疑问，您看看对不对，如果对，给个置顶鼓励一下，谢谢老铁啦，啊哈哈</li></ol><p>1、有些同学认为读锁没有用，他们的理由是：读操作又不会修改数据，想读就读呗，无论读的是就值还是新值，反正能读到。</p><p>2、也有同学认为读锁是为了防止多线程读到的数据不一致。</p><p>我认为不是这个原因，只需要问两个问题就知道了，首先问不一致的是什么？然后反问不一致会导致什么问题呢？</p><p>有些同学认为不一致就是有些线程读的是旧值，有些读的是新值，所以不一致。但是反问导致什么问题，就不是很好回答了，可能回答说为了保险吧，哈哈哈。</p><p>实际上即使加读锁，还是会存在有的线程读旧值，有的线程读新值，甚至非公平锁情况下，先开始的线程反而读到新值，而后开始的线程反而读到旧值，所以读锁并不是为了保证多线程读到的值是一样的。</p><p>3、那么读锁的作用是什么呢？</p><p>任何锁表面上是互斥，但本质是都是为了避免原子性问题（如果程序没有原子性问题，那只用volatile来避免可见性和有序性问题就可以了，效率更高），读锁自然也是为了避免原子性问题，比如一个long型参数的写操作并不是原子性的，如果允许同时读和写，那读到的数很可能是就是写操作的中间状态，比如刚写完前32位的中间状态。long型数都如此，而实际上一般读的都是复杂的对象，那中间状态的情况就更多了。</p><p>所以读锁是防止读到写操作的中间状态的值。2020-07-10crazypokerk 👍（29） 💬（5）老师，可不可以这样理解，ReadWirteLock不支持锁的升级，指的是：在不释放读锁的前提下，无法继续获取写锁，但是如果在释放了读锁之后，是可以升级为写锁的。锁的降级就是：在不释放写锁的前提下，获取读锁是可以的。请老师指正，感谢。2019-04-06WhoAmI 👍（20） 💬（4）一般都说线程池有界队列使用ArrayBlockingQueue，无界队列使用LinkedBlockingQueue，我很奇怪，有界无界不是取决于创建的时候传不传capacity参数么，我现在想创建线程池的时候，new LinkedBlockingQueue(2000)这样定义有界队列，请问可以吗？2019-04-06WL 👍（17） 💬（1）老师我们现在的项目全都是集群部署, 感觉在这种情况下是不是单机的Lock,和Synchronized都用不上, 只能采用分布式锁的方案? 那么这种情况下, 如何提高每个实例的并发效率?2019-04-09探索无止境 👍（11） 💬（5）老师你好，我们在项目开发中，如果要实现缓存，会直接采用Redis，感觉更合适，所以不太清楚，实际中ReadWriteLock可以解决哪些问题？2019-08-26文灏 👍（10） 💬（5）王老师你好，有个问题想请教一下。既然允许多个线程同时读，那么这个时候的读锁意义在哪里？2019-05-22随风而逝 👍（9） 💬（2）缓存一致性问题，我们都是双删缓存。老师，读写锁的降级和单独使用有什么区别？或者说有什么优势？2019-04-22刘志兵 👍（9） 💬（2）这里讲的读写锁和丁奇老师讲的mysql中的mdl锁和ddl锁原理好像是一样的，就是读写互斥，写写互斥，读读不互斥，老师讲的这个应该是读写锁的基本原理，mysql是这个锁的一种典型应用吧2019-04-08无言的约定 👍（8） 💬（3）王老师，&quot;&quot;如果一个写线程正在执行写操作，此时禁止读线程读共享变量&quot;&quot; 这句话反过来也成立，是不是意味着读操作和写操作是互斥的，不能同时进行？2019-12-05老杨同志 👍（7） 💬（4）老师，如果读锁的持有时间较长，读操作又比较多，会不会一直拿不到写锁？2019-04-06密码123456 👍（6） 💬（1）系统停止了响应，说明线程可能被占满了。cpu利用率低为什么会推断出，是读锁升级为写锁？是因为锁升级后，线程都是等待状态吗？是不是cpu高是锁竞争？还有怎么验证读锁升级为写锁？2019-04-06guihaiyizhu 👍（4） 💬（1）看了下juc的源码，尝试着分析一波 为啥为啥ReentrantReadWriteLock不能锁的降低不能锁的降低，但是可以锁的升级。 ReentrantReadWriteLock 实现了 ReadWriteLock 的结构。所以会有读锁和写锁两个方法来获取对应的锁。</p><p>先说下 JUC 锁的一般讨论：</p><ol><li>status 表示状态，比如：status 大于0 表示线程可以获得锁，线程等于0 表示需等待其他线程释放锁</li><li>等待队列： 获取不到锁的线程会丢到等待队列。</li><li>LockSuppert.park / unpark: 来作用线程的通信。</li></ol><p>获取锁的大概逻辑可以认为是：1. status 不满足要求， 2. 线程丢到等到队列 3. 调用LockSuppert.park(thread.current)</p><p>可以分析出 判断线程是否可以进入的关键方法即是：status 是否符合要求，也就是 tryAcquire 的方法</p><p>基于此，我们来看ReentrantReadWriteLock 里面读锁写锁的设计了：</p><p>先给出状态定义的代码 static final int SHARED_SHIFT = 16; static final int SHARED_UNIT = (1 &lt;&lt; SHARED_SHIFT); static final int MAX_COUNT = (1 &lt;&lt; SHARED_SHIFT) - 1; static final int EXCLUSIVE_MASK = (1 &lt;&lt; SHARED_SHIFT) - 1; static int sharedCount(int c) { return c &gt;&gt;&gt; SHARED_SHIFT; } static int exclusiveCount(int c) { return c &amp; EXCLUSIVE_MASK; }</p><p>给出结论：status 低16位用来做 排它锁的状态，高16位用来做共享锁的状态</p><p>WriteLock: protected final boolean tryAcquire(int acquires) { Thread current = Thread.currentThread(); int c = getState(); // 获取写锁的status int w = exclusiveCount(c); if (c != 0) { // 如果 c ！= 0 &amp;&amp; w == 0. 说明这个RWLock 被其他写锁占着，所有不会锁的升级 if (w == 0 || current != getExclusiveOwnerThread()) return false; } }</p><p>ReadLock: protected final int tryAcquireShared(int unused) { Thread current = Thread.currentThread(); int c = getState(); // 排它状态不等0 且 current 不是写锁的线程 才不能持有锁， if (exclusiveCount(c) != 0 &amp;&amp; getExclusiveOwnerThread() != current) return -1; // ... return fullTryAcquireShared(current); }2020-06-17</p>`,56)])])}const h=n(l,[["render",i]]);export{k as __pageData,h as default};
