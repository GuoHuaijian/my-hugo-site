import{_ as e,o as s,c as a,ae as p}from"./chunks/framework.Iv6F95cJ.js";const d=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/java-practice/25 - CompletionService：如何批量执行异步任务？.md","filePath":"books/java-practice/25 - CompletionService：如何批量执行异步任务？.md"}'),t={name:"books/java-practice/25 - CompletionService：如何批量执行异步任务？.md"};function i(c,n,l,r,o,u){return s(),a("div",null,[...n[0]||(n[0]=[p(`<p>在<a href="https://time.geekbang.org/column/article/91292" target="_blank" rel="noreferrer">《23 | Future：如何用多线程实现最优的“烧水泡茶”程序？》</a>的最后，我给你留了道思考题，如何优化一个询价应用的核心代码？如果采用“ThreadPoolExecutor+Future”的方案，你的优化结果很可能是下面示例代码这样：用三个线程异步执行询价，通过三次调用Future的get()方法获取询价结果，之后将询价结果保存在数据库中。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 创建线程池</span></span>
<span class="line"><span>ExecutorService executor =</span></span>
<span class="line"><span>  Executors.newFixedThreadPool(3);</span></span>
<span class="line"><span>// 异步向电商S1询价</span></span>
<span class="line"><span>Future&lt;Integer&gt; f1 = </span></span>
<span class="line"><span>  executor.submit(</span></span>
<span class="line"><span>    ()-&gt;getPriceByS1());</span></span>
<span class="line"><span>// 异步向电商S2询价</span></span>
<span class="line"><span>Future&lt;Integer&gt; f2 = </span></span>
<span class="line"><span>  executor.submit(</span></span>
<span class="line"><span>    ()-&gt;getPriceByS2());</span></span>
<span class="line"><span>// 异步向电商S3询价</span></span>
<span class="line"><span>Future&lt;Integer&gt; f3 = </span></span>
<span class="line"><span>  executor.submit(</span></span>
<span class="line"><span>    ()-&gt;getPriceByS3());</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>// 获取电商S1报价并保存</span></span>
<span class="line"><span>r=f1.get();</span></span>
<span class="line"><span>executor.execute(()-&gt;save(r));</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>// 获取电商S2报价并保存</span></span>
<span class="line"><span>r=f2.get();</span></span>
<span class="line"><span>executor.execute(()-&gt;save(r));</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>// 获取电商S3报价并保存  </span></span>
<span class="line"><span>r=f3.get();</span></span>
<span class="line"><span>executor.execute(()-&gt;save(r));</span></span></code></pre></div><p>上面的这个方案本身没有太大问题，但是有个地方的处理需要你注意，那就是如果获取电商S1报价的耗时很长，那么即便获取电商S2报价的耗时很短，也无法让保存S2报价的操作先执行，因为这个主线程都阻塞在了 <code>f1.get()</code> 操作上。这点小瑕疵你该如何解决呢？</p><p>估计你已经想到了，增加一个阻塞队列，获取到S1、S2、S3的报价都进入阻塞队列，然后在主线程中消费阻塞队列，这样就能保证先获取到的报价先保存到数据库了。下面的示例代码展示了如何利用阻塞队列实现先获取到的报价先保存到数据库。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 创建阻塞队列</span></span>
<span class="line"><span>BlockingQueue&lt;Integer&gt; bq =</span></span>
<span class="line"><span>  new LinkedBlockingQueue&lt;&gt;();</span></span>
<span class="line"><span>//电商S1报价异步进入阻塞队列  </span></span>
<span class="line"><span>executor.execute(()-&gt;</span></span>
<span class="line"><span>  bq.put(f1.get()));</span></span>
<span class="line"><span>//电商S2报价异步进入阻塞队列  </span></span>
<span class="line"><span>executor.execute(()-&gt;</span></span>
<span class="line"><span>  bq.put(f2.get()));</span></span>
<span class="line"><span>//电商S3报价异步进入阻塞队列  </span></span>
<span class="line"><span>executor.execute(()-&gt;</span></span>
<span class="line"><span>  bq.put(f3.get()));</span></span>
<span class="line"><span>//异步保存所有报价  </span></span>
<span class="line"><span>for (int i=0; i&lt;3; i++) {</span></span>
<span class="line"><span>  Integer r = bq.take();</span></span>
<span class="line"><span>  executor.execute(()-&gt;save(r));</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="利用completionservice实现询价系统" tabindex="-1">利用CompletionService实现询价系统 <a class="header-anchor" href="#利用completionservice实现询价系统" aria-label="Permalink to &quot;利用CompletionService实现询价系统&quot;">&amp;ZeroWidthSpace;</a></h2><p>不过在实际项目中，并不建议你这样做，因为Java SDK并发包里已经提供了设计精良的CompletionService。利用CompletionService不但能帮你解决先获取到的报价先保存到数据库的问题，而且还能让代码更简练。</p><p>CompletionService的实现原理也是内部维护了一个阻塞队列，当任务执行结束就把任务的执行结果加入到阻塞队列中，不同的是CompletionService是把任务执行结果的Future对象加入到阻塞队列中，而上面的示例代码是把任务最终的执行结果放入了阻塞队列中。</p><p><strong>那到底该如何创建CompletionService呢？</strong></p><p>CompletionService接口的实现类是ExecutorCompletionService，这个实现类的构造方法有两个，分别是：</p><ol><li><code>ExecutorCompletionService(Executor executor)</code>；</li><li><code>ExecutorCompletionService(Executor executor, BlockingQueue&gt; completionQueue)</code>。</li></ol><p>这两个构造方法都需要传入一个线程池，如果不指定completionQueue，那么默认会使用无界的LinkedBlockingQueue。任务执行结果的Future对象就是加入到completionQueue中。</p><p>下面的示例代码完整地展示了如何利用CompletionService来实现高性能的询价系统。其中，我们没有指定completionQueue，因此默认使用无界的LinkedBlockingQueue。之后通过CompletionService接口提供的submit()方法提交了三个询价操作，这三个询价操作将会被CompletionService异步执行。最后，我们通过CompletionService接口提供的take()方法获取一个Future对象（前面我们提到过，加入到阻塞队列中的是任务执行结果的Future对象），调用Future对象的get()方法就能返回询价操作的执行结果了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 创建线程池</span></span>
<span class="line"><span>ExecutorService executor = </span></span>
<span class="line"><span>  Executors.newFixedThreadPool(3);</span></span>
<span class="line"><span>// 创建CompletionService</span></span>
<span class="line"><span>CompletionService&lt;Integer&gt; cs = new </span></span>
<span class="line"><span>  ExecutorCompletionService&lt;&gt;(executor);</span></span>
<span class="line"><span>// 异步向电商S1询价</span></span>
<span class="line"><span>cs.submit(()-&gt;getPriceByS1());</span></span>
<span class="line"><span>// 异步向电商S2询价</span></span>
<span class="line"><span>cs.submit(()-&gt;getPriceByS2());</span></span>
<span class="line"><span>// 异步向电商S3询价</span></span>
<span class="line"><span>cs.submit(()-&gt;getPriceByS3());</span></span>
<span class="line"><span>// 将询价结果异步保存到数据库</span></span>
<span class="line"><span>for (int i=0; i&lt;3; i++) {</span></span>
<span class="line"><span>  Integer r = cs.take().get();</span></span>
<span class="line"><span>  executor.execute(()-&gt;save(r));</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="completionservice接口说明" tabindex="-1">CompletionService接口说明 <a class="header-anchor" href="#completionservice接口说明" aria-label="Permalink to &quot;CompletionService接口说明&quot;">&amp;ZeroWidthSpace;</a></h2><p>下面我们详细地介绍一下CompletionService接口提供的方法，CompletionService接口提供的方法有5个，这5个方法的方法签名如下所示。</p><p>其中，submit()相关的方法有两个。一个方法参数是<code>Callable task</code>，前面利用CompletionService实现询价系统的示例代码中，我们提交任务就是用的它。另外一个方法有两个参数，分别是<code>Runnable task</code>和<code>V result</code>，这个方法类似于ThreadPoolExecutor的 <code> Future submit(Runnable task, T result)</code> ，这个方法在<a href="https://time.geekbang.org/column/article/91292" target="_blank" rel="noreferrer">《23 | Future：如何用多线程实现最优的“烧水泡茶”程序？》</a>中我们已详细介绍过，这里不再赘述。</p><p>CompletionService接口其余的3个方法，都是和阻塞队列相关的，take()、poll()都是从阻塞队列中获取并移除一个元素；它们的区别在于如果阻塞队列是空的，那么调用 take() 方法的线程会被阻塞，而 poll() 方法会返回 null 值。 <code>poll(long timeout, TimeUnit unit)</code> 方法支持以超时的方式获取并移除阻塞队列头部的一个元素，如果等待了 timeout unit时间，阻塞队列还是空的，那么该方法会返回 null 值。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Future&lt;V&gt; submit(Callable&lt;V&gt; task);</span></span>
<span class="line"><span>Future&lt;V&gt; submit(Runnable task, V result);</span></span>
<span class="line"><span>Future&lt;V&gt; take() </span></span>
<span class="line"><span>  throws InterruptedException;</span></span>
<span class="line"><span>Future&lt;V&gt; poll();</span></span>
<span class="line"><span>Future&lt;V&gt; poll(long timeout, TimeUnit unit) </span></span>
<span class="line"><span>  throws InterruptedException;</span></span></code></pre></div><h2 id="利用completionservice实现dubbo中的forking-cluster" tabindex="-1">利用CompletionService实现Dubbo中的Forking Cluster <a class="header-anchor" href="#利用completionservice实现dubbo中的forking-cluster" aria-label="Permalink to &quot;利用CompletionService实现Dubbo中的Forking Cluster&quot;">&amp;ZeroWidthSpace;</a></h2><p>Dubbo中有一种叫做<strong>Forking的集群模式</strong>，这种集群模式下，支持<strong>并行地调用多个查询服务，只要有一个成功返回结果，整个服务就可以返回了</strong>。例如你需要提供一个地址转坐标的服务，为了保证该服务的高可用和性能，你可以并行地调用3个地图服务商的API，然后只要有1个正确返回了结果r，那么地址转坐标这个服务就可以直接返回r了。这种集群模式可以容忍2个地图服务商服务异常，但缺点是消耗的资源偏多。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>geocoder(addr) {</span></span>
<span class="line"><span>  //并行执行以下3个查询服务， </span></span>
<span class="line"><span>  r1=geocoderByS1(addr);</span></span>
<span class="line"><span>  r2=geocoderByS2(addr);</span></span>
<span class="line"><span>  r3=geocoderByS3(addr);</span></span>
<span class="line"><span>  //只要r1,r2,r3有一个返回</span></span>
<span class="line"><span>  //则返回</span></span>
<span class="line"><span>  return r1|r2|r3;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>利用CompletionService可以快速实现 Forking 这种集群模式，比如下面的示例代码就展示了具体是如何实现的。首先我们创建了一个线程池executor 、一个CompletionService对象cs和一个<code>Future</code>类型的列表 futures，每次通过调用CompletionService的submit()方法提交一个异步任务，会返回一个Future对象，我们把这些Future对象保存在列表futures中。通过调用 <code>cs.take().get()</code>，我们能够拿到最快返回的任务执行结果，只要我们拿到一个正确返回的结果，就可以取消所有任务并且返回最终结果了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 创建线程池</span></span>
<span class="line"><span>ExecutorService executor =</span></span>
<span class="line"><span>  Executors.newFixedThreadPool(3);</span></span>
<span class="line"><span>// 创建CompletionService</span></span>
<span class="line"><span>CompletionService&lt;Integer&gt; cs =</span></span>
<span class="line"><span>  new ExecutorCompletionService&lt;&gt;(executor);</span></span>
<span class="line"><span>// 用于保存Future对象</span></span>
<span class="line"><span>List&lt;Future&lt;Integer&gt;&gt; futures =</span></span>
<span class="line"><span>  new ArrayList&lt;&gt;(3);</span></span>
<span class="line"><span>//提交异步任务，并保存future到futures </span></span>
<span class="line"><span>futures.add(</span></span>
<span class="line"><span>  cs.submit(()-&gt;geocoderByS1()));</span></span>
<span class="line"><span>futures.add(</span></span>
<span class="line"><span>  cs.submit(()-&gt;geocoderByS2()));</span></span>
<span class="line"><span>futures.add(</span></span>
<span class="line"><span>  cs.submit(()-&gt;geocoderByS3()));</span></span>
<span class="line"><span>// 获取最快返回的任务执行结果</span></span>
<span class="line"><span>Integer r = 0;</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>  // 只要有一个成功返回，则break</span></span>
<span class="line"><span>  for (int i = 0; i &lt; 3; ++i) {</span></span>
<span class="line"><span>    r = cs.take().get();</span></span>
<span class="line"><span>    //简单地通过判空来检查是否成功返回</span></span>
<span class="line"><span>    if (r != null) {</span></span>
<span class="line"><span>      break;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>} finally {</span></span>
<span class="line"><span>  //取消所有任务</span></span>
<span class="line"><span>  for(Future&lt;Integer&gt; f : futures)</span></span>
<span class="line"><span>    f.cancel(true);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>// 返回结果</span></span>
<span class="line"><span>return r;</span></span></code></pre></div><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">&amp;ZeroWidthSpace;</a></h2><p>当需要批量提交异步任务的时候建议你使用CompletionService。CompletionService将线程池Executor和阻塞队列BlockingQueue的功能融合在了一起，能够让批量异步任务的管理更简单。除此之外，CompletionService能够让异步任务的执行结果有序化，先执行完的先进入阻塞队列，利用这个特性，你可以轻松实现后续处理的有序性，避免无谓的等待，同时还可以快速实现诸如Forking Cluster这样的需求。</p><p>CompletionService的实现类ExecutorCompletionService，需要你自己创建线程池，虽看上去有些啰嗦，但好处是你可以让多个ExecutorCompletionService的线程池隔离，这种隔离性能避免几个特别耗时的任务拖垮整个应用的风险。</p><h2 id="课后思考" tabindex="-1">课后思考 <a class="header-anchor" href="#课后思考" aria-label="Permalink to &quot;课后思考&quot;">&amp;ZeroWidthSpace;</a></h2><p>本章使用CompletionService实现了一个询价应用的核心功能，后来又有了新的需求，需要计算出最低报价并返回，下面的示例代码尝试实现这个需求，你看看是否存在问题呢？</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 创建线程池</span></span>
<span class="line"><span>ExecutorService executor = </span></span>
<span class="line"><span>  Executors.newFixedThreadPool(3);</span></span>
<span class="line"><span>// 创建CompletionService</span></span>
<span class="line"><span>CompletionService&lt;Integer&gt; cs = new </span></span>
<span class="line"><span>  ExecutorCompletionService&lt;&gt;(executor);</span></span>
<span class="line"><span>// 异步向电商S1询价</span></span>
<span class="line"><span>cs.submit(()-&gt;getPriceByS1());</span></span>
<span class="line"><span>// 异步向电商S2询价</span></span>
<span class="line"><span>cs.submit(()-&gt;getPriceByS2());</span></span>
<span class="line"><span>// 异步向电商S3询价</span></span>
<span class="line"><span>cs.submit(()-&gt;getPriceByS3());</span></span>
<span class="line"><span>// 将询价结果异步保存到数据库</span></span>
<span class="line"><span>// 并计算最低报价</span></span>
<span class="line"><span>AtomicReference&lt;Integer&gt; m =</span></span>
<span class="line"><span>  new AtomicReference&lt;&gt;(Integer.MAX_VALUE);</span></span>
<span class="line"><span>for (int i=0; i&lt;3; i++) {</span></span>
<span class="line"><span>  executor.execute(()-&gt;{</span></span>
<span class="line"><span>    Integer r = null;</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      r = cs.take().get();</span></span>
<span class="line"><span>    } catch (Exception e) {}</span></span>
<span class="line"><span>    save(r);</span></span>
<span class="line"><span>    m.set(Integer.min(m.get(), r));</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>return m;</span></span></code></pre></div><p>欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。 精选留言（15） 张天屹 👍（139） 💬（11）我觉得问题出在return m这里需要等待三个线程执行完成，但是并没有。 ... AtomicReference&lt;Integer&gt; m = new AtomicReference&lt;&gt;(Integer.MAX_VALUE); CountDownLatch latch = new CountDownLatch(3); for(int i=0; i&lt;3; i++) { executor.execute(()-&gt;{ Integer r = null; try { r = cs.take().get(); } catch(Exception e) {} save(r); m.set(Integer.min(m.get(), r)); latch.countDown(); }); latch.await(); return m; }2019-04-25小华 👍（33） 💬（1）看老师的意图是要等三个比较报假的线程都执行完才能执行主线程的的return m，但是代码无法保证三个线程都执行完，和主线程执行return的顺序，因此，m的值不是准确的，可以加个线程栈栏，线程执行完计数器，来达到这效果2019-04-25西行寺咕哒子 👍（31） 💬（8）试过返回值是2147483647，也就是int的最大值。没有等待操作完成就猴急的返回了。 m.set(Integer.min(m.get(), r)... 这个操作也不是原子操作。 试着自己弄了一下： public Integer run(){ // 创建线程池 ExecutorService executor = Executors.newFixedThreadPool(3); // 创建 CompletionService CompletionService&lt;Integer&gt; cs = new ExecutorCompletionService&lt;&gt;(executor); AtomicReference&lt;Integer&gt; m = new AtomicReference&lt;&gt;(Integer.MAX_VALUE); // 异步向电商 S1 询价 cs.submit(()-&gt;getPriceByS1()); // 异步向电商 S2 询价 cs.submit(()-&gt;getPriceByS2()); // 异步向电商 S3 询价 cs.submit(()-&gt;getPriceByS3()); // 将询价结果异步保存到数据库 // 并计算最低报价 for (int i=0; i&lt;3; i++) { Integer r = logIfError(()-&gt;cs.take().get()); executor.execute(()-&gt; save(r)); m.getAndUpdate(v-&gt;Integer.min(v, r)); } return m.get(); } 不知道可不可行2019-04-25ipofss 👍（17） 💬（2）老师，并发工具类，这整个一章，感觉听完似懂非懂的，因为实践中没用过，我要如何弥补这部分，还是说只要听说过，然后用的时候再去查看demo吗2019-10-23linqw 👍（8） 💬（1）老师stampedLock的获取锁源码，老师能帮忙解惑下么？阻塞的读线程cowait是挂在写节点的下方么？老师能解惑下基于的理论模型 private long acquireWrite(boolean interruptible, long deadline) { WNode node = null, p; for (int spins = -1;😉 { // spin while enqueuing long m, s, ns; //如果当前的state是无锁状态即100000000 if ((m = (s = state) &amp; ABITS) == 0L) { //设置成写锁 if (U.compareAndSwapLong(this, STATE, s, ns = s + WBIT)) return ns; } else if (spins &lt; 0) //当前锁状态为写锁状态，并且队列为空，设置自旋值 spins = (m == WBIT &amp;&amp; wtail == whead) ? SPINS : 0; else if (spins &gt; 0) { //自旋操作，就是让线程在此自旋 if (LockSupport.nextSecondarySeed() &gt;= 0) --spins; } //如果队列尾元素为空，初始化队列 else if ((p = wtail) == null) { // initialize queue WNode hd = new WNode(WMODE, null); if (U.compareAndSwapObject(this, WHEAD, null, hd)) wtail = hd; } //当前要加入的元素为空，初始化当前元素，前置节点为尾节点 else if (node == null) node = new WNode(WMODE, p); //队列的稳定性判断，当前的前置节点是否改变，重新设置<br> else if (node.prev != p) node.prev = p; //将当前节点加入尾节点中<br> else if (U.compareAndSwapObject(this, WTAIL, p, node)) { p.next = node; break; } }</p><pre><code>    2019-04-25Sunqc 👍（3） 💬（1）&amp;#47;&amp;#47; 获取电商 S1 报价并保存
</code></pre><p>r=f1.get(); executor.execute(()-&gt;save(r));</p><p>如果把r=f1.get（）放进execute里应该是也能保证先执行完的先保存2019-05-01黄海峰 👍（3） 💬（1）我实际测试了第一段代码，确实是异步的，f1.get不会阻塞主线程。。。</p><p>public static void main(String[] args) { ExecutorService executor = Executors.newFixedThreadPool(3); Future&lt;Integer&gt; f1 = executor.submit(()-&gt;getPriceByS1()); Future&lt;Integer&gt; f2 = executor.submit(()-&gt;getPriceByS2()); Future&lt;Integer&gt; f3 = executor.submit(()-&gt;getPriceByS3());</p><pre><code>    executor.execute(()-&amp;gt; {
        try {
            save(f1.get());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
    });
    executor.execute(()-&amp;gt; {
        try {
            save(f2.get());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
    });
    executor.execute(()-&amp;gt; {
        try {
            save(f3.get());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
    });
}

private static Integer getPriceByS1() {
    try {
        Thread.sleep(10000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return 1;
}
private static Integer getPriceByS2() {
    try {
        Thread.sleep(1000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return 2;
}
private static Integer getPriceByS3() {
    try {
        Thread.sleep(1000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return 3;
}
private static void save(Integer i) {
    System.out.println(&amp;quot;save &amp;quot; + i);
}2019-04-25Corner 👍（3） 💬（1）1.AtomicReference&amp;lt;Integer&amp;gt;的get方法应该改成使用cas方法
</code></pre><p>2.最后筛选最小结果的任务是异步执行的，应该在return之前做同步，所以最好使用sumit提交该任务便于判断任务的完成 最后请教老师一下，第一个例子中为什么主线程会阻塞在f1.get()方法呢？2019-04-25空空空空 👍（2） 💬（1）算低价的时候是用三个不同的线程去计算，是异步的，因此可能算出来并不是预期的结果 老师，这样理解对吗？2019-04-25梅小西 👍（1） 💬（1）老师讲的挺不错的，看了这个例子，有几点疑问，还希望老师说明下： // 这个是老师例子：</p><p>// 创建线程池 ExecutorService executor = Executors.newFixedThreadPool(3); // 创建CompletionService CompletionService&lt;Integer&gt; cs = new ExecutorCompletionService&lt;&gt;(executor); // 异步向电商S1询价 cs.submit(()-&gt;getPriceByS1()); // 异步向电商S2询价 cs.submit(()-&gt;getPriceByS2()); // 异步向电商S3询价 cs.submit(()-&gt;getPriceByS3()); // 将询价结果异步保存到数据库 for (int i=0; i&lt;3; i++) { Integer r = cs.take().get(); executor.execute(()-&gt;save(r)); }</p><p>首先，CompletionService应该是要绑定泛型，代表异步任务的返回结果，实际应用中，几乎不太可能所有的异步任务的返回类型是一样的，除非设置成Object这种通用型，那又会导致拿到结果后需要强转，代码看起来更难受； 其次，对于返回的结果的处理方式，实际应用中几乎也是不同的，那就要针对每一个take出来的结果做判断，这实际上也是会导致代码很难维护；</p><p>综上，CompletionService 看来能够做批量处理异步任务的事情，实际应用中，我感觉不太实用！</p><p>以上两点是个人见解，有不对之处请老师指教！2019-10-27helloworld 👍（1） 💬（1）老师，冒昧的问下：在文章刚开始的例子，无论是三个询价任务（通过submit方法提交），还是保存询价任务（通过execute方法提交）都是异步的执行执行的啊！如果s1询价的时间过长的话，也不会影响到s2保存保价的先执行啊！他只影响到s1保存询价的动作。老师不知道我说的有么有道理，有问题请老师帮忙指正2019-08-30胡小禾 👍（1） 💬（1）// 创建线程池 ExecutorService executor = Executors.newFixedThreadPool(3); // 创建 CompletionService CompletionService&lt;Integer&gt; cs = new ExecutorCompletionService&lt;&gt;(executor); // 用于保存 Future 对象 List&lt;Future&lt;Integer&gt;&gt; futures = new ArrayList&lt;&gt;(3); // 提交异步任务，并保存 future 到 futures futures.add( cs.submit(()-&gt;geocoderByS1())); futures.add( cs.submit(()-&gt;geocoderByS2())); futures.add( cs.submit(()-&gt;geocoderByS3())); // 获取最快返回的任务执行结果 Integer r = 0; try { // 只要有一个成功返回，则 break for (int i = 0; i &lt; 3; ++i) { r = cs.take().get(); // 简单地通过判空来检查是否成功返回 if (r != null) { break; } } // ********************************** // for 循环其实没有必要吧？ // take() 是阻塞的拿到结果，get()也是阻塞的 // 只要有个任务完成，这个for循环就结束了 } finally { // 取消所有任务 for(Future&lt;Integer&gt; f : futures) f.cancel(true); } // 返回结果 return r; 2019-07-09Joker 👍（0） 💬（1）老师，那个futures保存future就是为了后面取消(<code>cancel()</code>)，对吧2019-11-06倚梦流 👍（0） 💬（1）请问老师，任务操作中包含io操作，比如正在增删读写文件，这时候突然cancel，会有什么不良影响吗？或者任务里面包含数据库操作，如果突然cancel，岂不是需要在异步任务中，进行事务回滚？2019-07-28胡小禾 👍（0） 💬（1）请教下老师，实际生产中，使用BlockingQueue 时， 若重启实例，BQ 的任务可能会丢，对此有何通用方案？2019-07-09</p>`,41)])])}const m=e(t,[["render",i]]);export{d as __pageData,m as default};
