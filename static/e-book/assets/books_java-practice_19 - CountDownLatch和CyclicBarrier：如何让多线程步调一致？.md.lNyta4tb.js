import{_ as s,o as n,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const g=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/java-practice/19 - CountDownLatch和CyclicBarrier：如何让多线程步调一致？.md","filePath":"books/java-practice/19 - CountDownLatch和CyclicBarrier：如何让多线程步调一致？.md"}'),c={name:"books/java-practice/19 - CountDownLatch和CyclicBarrier：如何让多线程步调一致？.md"};function l(r,a,i,t,o,d){return n(),p("div",null,[...a[0]||(a[0]=[e(`<p>前几天老板突然匆匆忙忙过来，说对账系统最近越来越慢了，能不能快速优化一下。我了解了对账系统的业务后，发现还是挺简单的，用户通过在线商城下单，会生成电子订单，保存在订单库；之后物流会生成派送单给用户发货，派送单保存在派送单库。为了防止漏派送或者重复派送，对账系统每天还会校验是否存在异常订单。</p><p>对账系统的处理逻辑很简单，你可以参考下面的对账系统流程图。目前对账系统的处理逻辑是首先查询订单，然后查询派送单，之后对比订单和派送单，将差异写入差异库。</p><p><img src="https://static001.geekbang.org/resource/image/06/fe/068418bdc371b8a1b4b740428a3b3ffe.png?wh=1142%2A626" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>对账系统流程图</p><p>对账系统的代码抽象之后，也很简单，核心代码如下，就是在一个单线程里面循环查询订单、派送单，然后执行对账，最后将写入差异库。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>while(存在未对账订单){</span></span>
<span class="line"><span>  // 查询未对账订单</span></span>
<span class="line"><span>  pos = getPOrders();</span></span>
<span class="line"><span>  // 查询派送单</span></span>
<span class="line"><span>  dos = getDOrders();</span></span>
<span class="line"><span>  // 执行对账操作</span></span>
<span class="line"><span>  diff = check(pos, dos);</span></span>
<span class="line"><span>  // 差异写入差异库</span></span>
<span class="line"><span>  save(diff);</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="利用并行优化对账系统" tabindex="-1">利用并行优化对账系统 <a class="header-anchor" href="#利用并行优化对账系统" aria-label="Permalink to &quot;利用并行优化对账系统&quot;">&amp;ZeroWidthSpace;</a></h2><p>老板要我优化性能，那我就首先要找到这个对账系统的瓶颈所在。</p><p>目前的对账系统，由于订单量和派送单量巨大，所以查询未对账订单getPOrders()和查询派送单getDOrders()相对较慢，那有没有办法快速优化一下呢？目前对账系统是单线程执行的，图形化后是下图这个样子。对于串行化的系统，优化性能首先想到的是能否<strong>利用多线程并行处理</strong>。</p><p><img src="https://static001.geekbang.org/resource/image/cd/a5/cd997c259e4165c046e79e766abfe2a5.png?wh=1142%2A507" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>对账系统单线程执行示意图</p><p>所以，这里你应该能够看出来这个对账系统里的瓶颈：查询未对账订单getPOrders()和查询派送单getDOrders()是否可以并行处理呢？显然是可以的，因为这两个操作并没有先后顺序的依赖。这两个最耗时的操作并行之后，执行过程如下图所示。对比一下单线程的执行示意图，你会发现同等时间里，并行执行的吞吐量近乎单线程的2倍，优化效果还是相对明显的。</p><p><img src="https://static001.geekbang.org/resource/image/a5/3b/a563c39ece918578ad2ff33ab5f3743b.png?wh=1142%2A567" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>对账系统并行执行示意图</p><p>思路有了，下面我们再来看看如何用代码实现。在下面的代码中，我们创建了两个线程T1和T2，并行执行查询未对账订单getPOrders()和查询派送单getDOrders()这两个操作。在主线程中执行对账操作check()和差异写入save()两个操作。不过需要注意的是：主线程需要等待线程T1和T2执行完才能执行check()和save()这两个操作，为此我们通过调用T1.join()和T2.join()来实现等待，当T1和T2线程退出时，调用T1.join()和T2.join()的主线程就会从阻塞态被唤醒，从而执行之后的check()和save()。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>while(存在未对账订单){</span></span>
<span class="line"><span>  // 查询未对账订单</span></span>
<span class="line"><span>  Thread T1 = new Thread(()-&gt;{</span></span>
<span class="line"><span>    pos = getPOrders();</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  T1.start();</span></span>
<span class="line"><span>  // 查询派送单</span></span>
<span class="line"><span>  Thread T2 = new Thread(()-&gt;{</span></span>
<span class="line"><span>    dos = getDOrders();</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  T2.start();</span></span>
<span class="line"><span>  // 等待T1、T2结束</span></span>
<span class="line"><span>  T1.join();</span></span>
<span class="line"><span>  T2.join();</span></span>
<span class="line"><span>  // 执行对账操作</span></span>
<span class="line"><span>  diff = check(pos, dos);</span></span>
<span class="line"><span>  // 差异写入差异库</span></span>
<span class="line"><span>  save(diff);</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="用countdownlatch实现线程等待" tabindex="-1">用CountDownLatch实现线程等待 <a class="header-anchor" href="#用countdownlatch实现线程等待" aria-label="Permalink to &quot;用CountDownLatch实现线程等待&quot;">&amp;ZeroWidthSpace;</a></h2><p>经过上面的优化之后，基本上可以跟老板汇报收工了，但还是有点美中不足，相信你也发现了，while循环里面每次都会创建新的线程，而创建线程可是个耗时的操作。所以最好是创建出来的线程能够循环利用，估计这时你已经想到线程池了，是的，线程池就能解决这个问题。</p><p>而下面的代码就是用线程池优化后的：我们首先创建了一个固定大小为2的线程池，之后在while循环里重复利用。一切看上去都很顺利，但是有个问题好像无解了，那就是主线程如何知道getPOrders()和getDOrders()这两个操作什么时候执行完。前面主线程通过调用线程T1和T2的join()方法来等待线程T1和T2退出，但是在线程池的方案里，线程根本就不会退出，所以join()方法已经失效了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 创建2个线程的线程池</span></span>
<span class="line"><span>Executor executor = </span></span>
<span class="line"><span>  Executors.newFixedThreadPool(2);</span></span>
<span class="line"><span>while(存在未对账订单){</span></span>
<span class="line"><span>  // 查询未对账订单</span></span>
<span class="line"><span>  executor.execute(()-&gt; {</span></span>
<span class="line"><span>    pos = getPOrders();</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  // 查询派送单</span></span>
<span class="line"><span>  executor.execute(()-&gt; {</span></span>
<span class="line"><span>    dos = getDOrders();</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  /* ？？如何实现等待？？*/</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 执行对账操作</span></span>
<span class="line"><span>  diff = check(pos, dos);</span></span>
<span class="line"><span>  // 差异写入差异库</span></span>
<span class="line"><span>  save(diff);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>那如何解决这个问题呢？你可以开动脑筋想出很多办法，最直接的办法是弄一个计数器，初始值设置成2，当执行完<code>pos = getPOrders();</code>这个操作之后将计数器减1，执行完<code>dos = getDOrders();</code>之后也将计数器减1，在主线程里，等待计数器等于0；当计数器等于0时，说明这两个查询操作执行完了。等待计数器等于0其实就是一个条件变量，用管程实现起来也很简单。</p><p>不过我并不建议你在实际项目中去实现上面的方案，因为Java并发包里已经提供了实现类似功能的工具类：<strong>CountDownLatch</strong>，我们直接使用就可以了。下面的代码示例中，在while循环里面，我们首先创建了一个CountDownLatch，计数器的初始值等于2，之后在<code>pos = getPOrders();</code>和<code>dos = getDOrders();</code>两条语句的后面对计数器执行减1操作，这个对计数器减1的操作是通过调用 <code>latch.countDown();</code> 来实现的。在主线程中，我们通过调用 <code>latch.await()</code> 来实现对计数器等于0的等待。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 创建2个线程的线程池</span></span>
<span class="line"><span>Executor executor = </span></span>
<span class="line"><span>  Executors.newFixedThreadPool(2);</span></span>
<span class="line"><span>while(存在未对账订单){</span></span>
<span class="line"><span>  // 计数器初始化为2</span></span>
<span class="line"><span>  CountDownLatch latch = </span></span>
<span class="line"><span>    new CountDownLatch(2);</span></span>
<span class="line"><span>  // 查询未对账订单</span></span>
<span class="line"><span>  executor.execute(()-&gt; {</span></span>
<span class="line"><span>    pos = getPOrders();</span></span>
<span class="line"><span>    latch.countDown();</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  // 查询派送单</span></span>
<span class="line"><span>  executor.execute(()-&gt; {</span></span>
<span class="line"><span>    dos = getDOrders();</span></span>
<span class="line"><span>    latch.countDown();</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 等待两个查询操作结束</span></span>
<span class="line"><span>  latch.await();</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 执行对账操作</span></span>
<span class="line"><span>  diff = check(pos, dos);</span></span>
<span class="line"><span>  // 差异写入差异库</span></span>
<span class="line"><span>  save(diff);</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="进一步优化性能" tabindex="-1">进一步优化性能 <a class="header-anchor" href="#进一步优化性能" aria-label="Permalink to &quot;进一步优化性能&quot;">&amp;ZeroWidthSpace;</a></h2><p>经过上面的重重优化之后，长出一口气，终于可以交付了。不过在交付之前还需要再次审视一番，看看还有没有优化的余地，仔细看还是有的。</p><p>前面我们将getPOrders()和getDOrders()这两个查询操作并行了，但这两个查询操作和对账操作check()、save()之间还是串行的。很显然，这两个查询操作和对账操作也是可以并行的，也就是说，在执行对账操作的时候，可以同时去执行下一轮的查询操作，这个过程可以形象化地表述为下面这幅示意图。</p><p><img src="https://static001.geekbang.org/resource/image/e6/8b/e663d90f49d9666e618ac1370ccca58b.png?wh=1142%2A624" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>完全并行执行示意图</p><p>那接下来我们再来思考一下如何实现这步优化，两次查询操作能够和对账操作并行，对账操作还依赖查询操作的结果，这明显有点生产者-消费者的意思，两次查询操作是生产者，对账操作是消费者。既然是生产者-消费者模型，那就需要有个队列，来保存生产者生产的数据，而消费者则从这个队列消费数据。</p><p>不过针对对账这个项目，我设计了两个队列，并且两个队列的元素之间还有对应关系。具体如下图所示，订单查询操作将订单查询结果插入订单队列，派送单查询操作将派送单插入派送单队列，这两个队列的元素之间是有一一对应的关系的。两个队列的好处是，对账操作可以每次从订单队列出一个元素，从派送单队列出一个元素，然后对这两个元素执行对账操作，这样数据一定不会乱掉。</p><p><img src="https://static001.geekbang.org/resource/image/22/da/22e8ba1c04a3bc2605b98376ed6832da.png?wh=1142%2A453" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>双队列示意图</p><p>下面再来看如何用双队列来实现完全的并行。一个最直接的想法是：一个线程T1执行订单的查询工作，一个线程T2执行派送单的查询工作，当线程T1和T2都各自生产完1条数据的时候，通知线程T3执行对账操作。这个想法虽看上去简单，但其实还隐藏着一个条件，那就是线程T1和线程T2的工作要步调一致，不能一个跑得太快，一个跑得太慢，只有这样才能做到各自生产完1条数据的时候，通知线程T3。</p><p>下面这幅图形象地描述了上面的意图：线程T1和线程T2只有都生产完1条数据的时候，才能一起向下执行，也就是说，线程T1和线程T2要互相等待，步调要一致；同时当线程T1和T2都生产完一条数据的时候，还要能够通知线程T3执行对账操作。</p><p><img src="https://static001.geekbang.org/resource/image/65/ad/6593a10a393d9310a8f864730f7426ad.png?wh=1142%2A569" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>同步执行示意图</p><h2 id="用cyclicbarrier实现线程同步" tabindex="-1">用CyclicBarrier实现线程同步 <a class="header-anchor" href="#用cyclicbarrier实现线程同步" aria-label="Permalink to &quot;用CyclicBarrier实现线程同步&quot;">&amp;ZeroWidthSpace;</a></h2><p>下面我们就来实现上面提到的方案。这个方案的难点有两个：一个是线程T1和T2要做到步调一致，另一个是要能够通知到线程T3。</p><p>你依然可以利用一个计数器来解决这两个难点，计数器初始化为2，线程T1和T2生产完一条数据都将计数器减1，如果计数器大于0则线程T1或者T2等待。如果计数器等于0，则通知线程T3，并唤醒等待的线程T1或者T2，与此同时，将计数器重置为2，这样线程T1和线程T2生产下一条数据的时候就可以继续使用这个计数器了。</p><p>同样，还是建议你不要在实际项目中这么做，因为Java并发包里也已经提供了相关的工具类：<strong>CyclicBarrier</strong>。在下面的代码中，我们首先创建了一个计数器初始值为2的CyclicBarrier，你需要注意的是创建CyclicBarrier的时候，我们还传入了一个回调函数，当计数器减到0的时候，会调用这个回调函数。</p><p>线程T1负责查询订单，当查出一条时，调用 <code>barrier.await()</code> 来将计数器减1，同时等待计数器变成0；线程T2负责查询派送单，当查出一条时，也调用 <code>barrier.await()</code> 来将计数器减1，同时等待计数器变成0；当T1和T2都调用 <code>barrier.await()</code> 的时候，计数器会减到0，此时T1和T2就可以执行下一条语句了，同时会调用barrier的回调函数来执行对账操作。</p><p>非常值得一提的是，CyclicBarrier的计数器有自动重置的功能，当减到0的时候，会自动重置你设置的初始值。这个功能用起来实在是太方便了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 订单队列</span></span>
<span class="line"><span>Vector&lt;P&gt; pos;</span></span>
<span class="line"><span>// 派送单队列</span></span>
<span class="line"><span>Vector&lt;D&gt; dos;</span></span>
<span class="line"><span>// 执行回调的线程池 </span></span>
<span class="line"><span>Executor executor = </span></span>
<span class="line"><span>  Executors.newFixedThreadPool(1);</span></span>
<span class="line"><span>final CyclicBarrier barrier =</span></span>
<span class="line"><span>  new CyclicBarrier(2, ()-&gt;{</span></span>
<span class="line"><span>    executor.execute(()-&gt;check());</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>void check(){</span></span>
<span class="line"><span>  P p = pos.remove(0);</span></span>
<span class="line"><span>  D d = dos.remove(0);</span></span>
<span class="line"><span>  // 执行对账操作</span></span>
<span class="line"><span>  diff = check(p, d);</span></span>
<span class="line"><span>  // 差异写入差异库</span></span>
<span class="line"><span>  save(diff);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>void checkAll(){</span></span>
<span class="line"><span>  // 循环查询订单库</span></span>
<span class="line"><span>  Thread T1 = new Thread(()-&gt;{</span></span>
<span class="line"><span>    while(存在未对账订单){</span></span>
<span class="line"><span>      // 查询订单库</span></span>
<span class="line"><span>      pos.add(getPOrders());</span></span>
<span class="line"><span>      // 等待</span></span>
<span class="line"><span>      barrier.await();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  T1.start();  </span></span>
<span class="line"><span>  // 循环查询运单库</span></span>
<span class="line"><span>  Thread T2 = new Thread(()-&gt;{</span></span>
<span class="line"><span>    while(存在未对账订单){</span></span>
<span class="line"><span>      // 查询运单库</span></span>
<span class="line"><span>      dos.add(getDOrders());</span></span>
<span class="line"><span>      // 等待</span></span>
<span class="line"><span>      barrier.await();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  T2.start();</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">&amp;ZeroWidthSpace;</a></h2><p>CountDownLatch和CyclicBarrier是Java并发包提供的两个非常易用的线程同步工具类，这两个工具类用法的区别在这里还是有必要再强调一下：<strong>CountDownLatch主要用来解决一个线程等待多个线程的场景</strong>，可以类比旅游团团长要等待所有的游客到齐才能去下一个景点；而<strong>CyclicBarrier是一组线程之间互相等待</strong>，更像是几个驴友之间不离不弃。除此之外CountDownLatch的计数器是不能循环利用的，也就是说一旦计数器减到0，再有线程调用await()，该线程会直接通过。但<strong>CyclicBarrier的计数器是可以循环利用的</strong>，而且具备自动重置的功能，一旦计数器减到0会自动重置到你设置的初始值。除此之外，CyclicBarrier还可以设置回调函数，可以说是功能丰富。</p><p>本章的示例代码中有两处用到了线程池，你现在只需要大概了解即可，因为线程池相关的知识咱们专栏后面还会有详细介绍。另外，线程池提供了Future特性，我们也可以利用Future特性来实现线程之间的等待，这个后面我们也会详细介绍。</p><h2 id="课后思考" tabindex="-1">课后思考 <a class="header-anchor" href="#课后思考" aria-label="Permalink to &quot;课后思考&quot;">&amp;ZeroWidthSpace;</a></h2><p>本章最后的示例代码中，CyclicBarrier的回调函数我们使用了一个固定大小的线程池，你觉得是否有必要呢？</p><p>欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。 精选留言（15） 张申傲 👍（257） 💬（13）我觉得老师的问题其实是两个: 1.为啥要用线程池，而不是在回调函数中直接调用？ 2.线程池为啥使用单线程的？</p><p>我的考虑: 1.使用线程池是为了异步操作，否则回掉函数是同步调用的，也就是本次对账操作执行完才能进行下一轮的检查。 2.线程数量固定为1，防止了多线程并发导致的数据不一致，因为订单和派送单是两个队列，只有单线程去两个队列中取消息才不会出现消息不匹配的问题。2019-05-23J.M.Liu 👍（183） 💬（10）老师，CyclicBarrier的回调函数在哪个线程执行啊？主线程吗？比如这里的最后一段代码中，循环会在回调的时候阻塞吗？ 如果是这样的话，那check函数岂不是可以直接作为回调函数了呀，并不需要线程池了啊2019-04-12undifined 👍（80） 💬（5）线程池大小为1是必要的，如果设置为多个，有可能会两个线程 A 和 B 同时查询，A 的订单先返回，B 的派送单先返回，造成队列中的数据不匹配；所以1个线程实现生产数据串行执行，保证数据安全</p><p>如果用Future 的话可以更方便一些：</p><pre><code>    CompletableFuture&amp;lt;List&amp;gt; pOrderFuture = CompletableFuture.supplyAsync(this::getPOrders);
    CompletableFuture&amp;lt;List&amp;gt; dOrderFuture = CompletableFuture.supplyAsync(this::getDOrders);
    pOrderFuture.thenCombine(dOrderFuture, this::check)
                .thenAccept(this::save);
</code></pre><p>老师这样理解对吗，谢谢老师 2019-04-11空知 👍（68） 💬（7）老师,关于CyclicBarrier回调函数,请教下 自己写了个 CyclicBarrier的例子,回调函数总是在计数器归0时候执行,但是线程T1 T2要等回调函数执行结束之后才会再次执行...看了下CyclicBarrier 的源码,当内部计数器 index == 0时候,</p><p>final Runnable command = barrierCommand;</p><p>if (command != null)</p><pre><code>command.run();
</code></pre><p>没有开启子线程吧.也就是说 对账还是同步执行的,结束之后才是下一次的查询2019-04-11曾轼麟 👍（65） 💬（4）老师推荐您使用ThreadPoolExecutor去实现线程池，并且实现里面的RejectedExecutionHandler和ThreadFactory，这样可以方便当调用订单查询和派送单查询的时候出现full gc的时候 dump文件 可以快速定位出现问题的线程是哪个业务线程，如果是CountDownLatch，建议设置超时时间，避免由于业务死锁没有调用countDown()导致现线程睡死的情况2019-04-13波波 👍（28） 💬（8）思考题中，如果生产者比较快，消费者比较慢，生产者通知的时候，消费者还在对账，这个时候会怎么处理？会不会导致消费者错失通知，导致队列满了，但是消费者却没有收到通知。2019-04-11nanquanmama 👍（19） 💬（1）最后的那个例子，业务逻辑的部分已经变得很不直观，并发控制的逻辑掩盖住了业务逻辑。请问一下老师，实际项目开发中，并发控制逻辑如何做，才能和业务逻辑分离出来？2019-04-11... ... 👍（18） 💬（3）追问：如果线程池是单线程的话。那假如生产者速度快运check函数执行时间。那是不是就会出现堵塞情况了。久而久之，是不是会出现队列内存溢出2019-04-12Adam 👍（15） 💬（1）如果生产者比较快，消费者check还没对账完 会不会照成 队列越来越多 最后内存溢出了 ，有没有什么好的方案解决呢？2019-06-14忍者无敌1995 👍（14） 💬（2）有，如果为线程池有多个线程，则由于check()函数里面的两个remove并不是原子操作，可能导致消费错乱。假设订单队列中有P1，P2；派送队列中有D1,D2；两个线程T1,T2同时执行check，可能出现T1消费到P1,D2，T2消费到P2，D1，就是T1先执行pos.remove(0), 而后T2执行pos.remove(0);dos.remov(0);然后T1才执行dos.remove(0)的场景2019-05-01木偶人King 👍（14） 💬（1）老师，最后checkAll（） 这里为什么new 了两个Thread 而不是使用线程池</p><p>2019-04-11iron_man 👍（13） 💬（3）王老师，cyclicbarrier，具体是在什么时候清零计数器呢？是在所有线程await返回后还是在回调函数调用后？await和回掉函数的调用顺序是怎样的2019-04-11王盛武 👍（12） 💬（2）undefind同学的意思差不多对。 只有一个线程的线程池，是因为，订单队列和派单队列读取数据存在竞态条件。 如果要开多个线程，则需要一个lock进行同步那两个remove方法。 个人推荐的思路是，如果生产者速度比消费者快的情况下，放入一个双向的阻塞队列尾部，每次从双向队列头部取两个对象，根据对象属性来区别订单类型，也能开多个线程进行check操作。 但本文业务里check速度很快，所以这个场景只需要开1个线程的线程池是合理的。2019-04-11梦典 👍（11） 💬（1）1.回调处理交给新开辟的线程执行，让当前处理继续进行，无需等待 2.使用线程池解决新开辟线程创建和销毁的开销问题 3.单线程使得两个队列的出队无需同步2019-09-25aguan(^･ｪ･^) 👍（11） 💬（2）老师，问一个业务逻辑的问题，在从两个队列中分别取订单和派送单的做比较的时候，怎么保证这订单和派送单是一一对应的关系呢？如果派送单有漏单，那如何对账比较取结果时的数据是一一对应关系？2019-04-18</p>`,58)])])}const u=s(c,[["render",l]]);export{g as __pageData,u as default};
