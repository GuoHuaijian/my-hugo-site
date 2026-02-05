import{_ as s,o as a,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const d=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/java-practice/38 - 案例分析（一）：高性能限流器Guava RateLimiter.md","filePath":"books/java-practice/38 - 案例分析（一）：高性能限流器Guava RateLimiter.md"}'),l={name:"books/java-practice/38 - 案例分析（一）：高性能限流器Guava RateLimiter.md"};function i(t,n,r,c,o,g){return a(),p("div",null,[...n[0]||(n[0]=[e(`<p>从今天开始，我们就进入案例分析模块了。 这个模块我们将分析四个经典的开源框架，看看它们是如何处理并发问题的，通过这四个案例的学习，相信你会对如何解决并发问题有个更深入的认识。</p><p>首先我们来看看<strong>Guava RateLimiter是如何解决高并发场景下的限流问题的</strong>。Guava是Google开源的Java类库，提供了一个工具类RateLimiter。我们先来看看RateLimiter的使用，让你对限流有个感官的印象。假设我们有一个线程池，它每秒只能处理两个任务，如果提交的任务过快，可能导致系统不稳定，这个时候就需要用到限流。</p><p>在下面的示例代码中，我们创建了一个流速为2个请求/秒的限流器，这里的流速该怎么理解呢？直观地看，2个请求/秒指的是每秒最多允许2个请求通过限流器，其实在Guava中，流速还有更深一层的意思：是一种匀速的概念，2个请求/秒等价于1个请求/500毫秒。</p><p>在向线程池提交任务之前，调用 <code>acquire()</code> 方法就能起到限流的作用。通过示例代码的执行结果，任务提交到线程池的时间间隔基本上稳定在500毫秒。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>//限流器流速：2个请求/秒</span></span>
<span class="line"><span>RateLimiter limiter = </span></span>
<span class="line"><span>  RateLimiter.create(2.0);</span></span>
<span class="line"><span>//执行任务的线程池</span></span>
<span class="line"><span>ExecutorService es = Executors</span></span>
<span class="line"><span>  .newFixedThreadPool(1);</span></span>
<span class="line"><span>//记录上一次执行时间</span></span>
<span class="line"><span>prev = System.nanoTime();</span></span>
<span class="line"><span>//测试执行20次</span></span>
<span class="line"><span>for (int i=0; i&lt;20; i++){</span></span>
<span class="line"><span>  //限流器限流</span></span>
<span class="line"><span>  limiter.acquire();</span></span>
<span class="line"><span>  //提交任务异步执行</span></span>
<span class="line"><span>  es.execute(()-&gt;{</span></span>
<span class="line"><span>    long cur=System.nanoTime();</span></span>
<span class="line"><span>    //打印时间间隔：毫秒</span></span>
<span class="line"><span>    System.out.println(</span></span>
<span class="line"><span>      (cur-prev)/1000_000);</span></span>
<span class="line"><span>    prev = cur;</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>输出结果：</span></span>
<span class="line"><span>...</span></span>
<span class="line"><span>500</span></span>
<span class="line"><span>499</span></span>
<span class="line"><span>499</span></span>
<span class="line"><span>500</span></span>
<span class="line"><span>499</span></span></code></pre></div><h2 id="经典限流算法-令牌桶算法" tabindex="-1">经典限流算法：令牌桶算法 <a class="header-anchor" href="#经典限流算法-令牌桶算法" aria-label="Permalink to &quot;经典限流算法：令牌桶算法&quot;">&amp;ZeroWidthSpace;</a></h2><p>Guava的限流器使用上还是很简单的，那它是如何实现的呢？Guava采用的是<strong>令牌桶算法</strong>，其<strong>核心是要想通过限流器，必须拿到令牌</strong>。也就是说，只要我们能够限制发放令牌的速率，那么就能控制流速了。令牌桶算法的详细描述如下：</p><ol><li>令牌以固定的速率添加到令牌桶中，假设限流的速率是 r/秒，则令牌每 1/r 秒会添加一个；</li><li>假设令牌桶的容量是 b ，如果令牌桶已满，则新的令牌会被丢弃；</li><li>请求能够通过限流器的前提是令牌桶中有令牌。</li></ol><p>这个算法中，限流的速率 r 还是比较容易理解的，但令牌桶的容量 b 该怎么理解呢？b 其实是burst的简写，意义是<strong>限流器允许的最大突发流量</strong>。比如b=10，而且令牌桶中的令牌已满，此时限流器允许10个请求同时通过限流器，当然只是突发流量而已，这10个请求会带走10个令牌，所以后续的流量只能按照速率 r 通过限流器。</p><p>令牌桶这个算法，如何用Java实现呢？很可能你的直觉会告诉你生产者-消费者模式：一个生产者线程定时向阻塞队列中添加令牌，而试图通过限流器的线程则作为消费者线程，只有从阻塞队列中获取到令牌，才允许通过限流器。</p><p>这个算法看上去非常完美，而且实现起来非常简单，如果并发量不大，这个实现并没有什么问题。可实际情况却是使用限流的场景大部分都是高并发场景，而且系统压力已经临近极限了，此时这个实现就有问题了。问题就出在定时器上，在高并发场景下，当系统压力已经临近极限的时候，定时器的精度误差会非常大，同时定时器本身会创建调度线程，也会对系统的性能产生影响。</p><p>那还有什么好的实现方式呢？当然有，Guava的实现就没有使用定时器，下面我们就来看看它是如何实现的。</p><h2 id="guava如何实现令牌桶算法" tabindex="-1">Guava如何实现令牌桶算法 <a class="header-anchor" href="#guava如何实现令牌桶算法" aria-label="Permalink to &quot;Guava如何实现令牌桶算法&quot;">&amp;ZeroWidthSpace;</a></h2><p>Guava实现令牌桶算法，用了一个很简单的办法，其关键是<strong>记录并动态计算下一令牌发放的时间</strong>。下面我们以一个最简单的场景来介绍该算法的执行过程。假设令牌桶的容量为 b=1，限流速率 r = 1个请求/秒，如下图所示，如果当前令牌桶中没有令牌，下一个令牌的发放时间是在第3秒，而在第2秒的时候有一个线程T1请求令牌，此时该如何处理呢？</p><p><img src="https://static001.geekbang.org/resource/image/39/ce/391179821a55fc798c9c17a6991c1dce.png?wh=1142%2A478" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>线程T1请求令牌示意图</p><p>对于这个请求令牌的线程而言，很显然需要等待1秒，因为1秒以后（第3秒）它就能拿到令牌了。此时需要注意的是，下一个令牌发放的时间也要增加1秒，为什么呢？因为第3秒发放的令牌已经被线程T1预占了。处理之后如下图所示。</p><p><img src="https://static001.geekbang.org/resource/image/1a/87/1a4069c830e18de087ba7f490aa78087.png?wh=1142%2A284" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>线程T1请求结束示意图</p><p>假设T1在预占了第3秒的令牌之后，马上又有一个线程T2请求令牌，如下图所示。</p><p><img src="https://static001.geekbang.org/resource/image/2c/2e/2cf695d0888a93e1e2d020d9514f5a2e.png?wh=1142%2A367" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>线程T2请求令牌示意图</p><p>很显然，由于下一个令牌产生的时间是第4秒，所以线程T2要等待两秒的时间，才能获取到令牌，同时由于T2预占了第4秒的令牌，所以下一令牌产生时间还要增加1秒，完全处理之后，如下图所示。</p><p><img src="https://static001.geekbang.org/resource/image/68/f7/68c09a96049aacda7936c52b801c22f7.png?wh=1142%2A377" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>线程T2请求结束示意图</p><p>上面线程T1、T2都是在<strong>下一令牌产生时间之前</strong>请求令牌，如果线程在<strong>下一令牌产生时间之后</strong>请求令牌会如何呢？假设在线程T1请求令牌之后的5秒，也就是第7秒，线程T3请求令牌，如下图所示。</p><p><img src="https://static001.geekbang.org/resource/image/e3/5c/e3125d72eb3d84eabf6de6ab987e695c.png?wh=1142%2A342" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>线程T3请求令牌示意图</p><p>由于在第5秒已经产生了一个令牌，所以此时线程T3可以直接拿到令牌，而无需等待。在第7秒，实际上限流器能够产生3个令牌，第5、6、7秒各产生一个令牌。由于我们假设令牌桶的容量是1，所以第6、7秒产生的令牌就丢弃了，其实等价地你也可以认为是保留的第7秒的令牌，丢弃的第5、6秒的令牌，也就是说第7秒的令牌被线程T3占有了，于是下一令牌的的产生时间应该是第8秒，如下图所示。</p><p><img src="https://static001.geekbang.org/resource/image/ba/fc/baf159d05b2abf650839e29a2399a4fc.png?wh=1142%2A344" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>线程T3请求结束示意图</p><p>通过上面简要地分析，你会发现，我们<strong>只需要记录一个下一令牌产生的时间，并动态更新它，就能够轻松完成限流功能</strong>。我们可以将上面的这个算法代码化，示例代码如下所示，依然假设令牌桶的容量是1。关键是<strong>reserve()方法</strong>，这个方法会为请求令牌的线程预分配令牌，同时返回该线程能够获取令牌的时间。其实现逻辑就是上面提到的：如果线程请求令牌的时间在下一令牌产生时间之后，那么该线程立刻就能够获取令牌；反之，如果请求时间在下一令牌产生时间之前，那么该线程是在下一令牌产生的时间获取令牌。由于此时下一令牌已经被该线程预占，所以下一令牌产生的时间需要加上1秒。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class SimpleLimiter {</span></span>
<span class="line"><span>  //下一令牌产生时间</span></span>
<span class="line"><span>  long next = System.nanoTime();</span></span>
<span class="line"><span>  //发放令牌间隔：纳秒</span></span>
<span class="line"><span>  long interval = 1000_000_000;</span></span>
<span class="line"><span>  //预占令牌，返回能够获取令牌的时间</span></span>
<span class="line"><span>  synchronized long reserve(long now){</span></span>
<span class="line"><span>    //请求时间在下一令牌产生时间之后</span></span>
<span class="line"><span>    //重新计算下一令牌产生时间</span></span>
<span class="line"><span>    if (now &gt; next){</span></span>
<span class="line"><span>      //将下一令牌产生时间重置为当前时间</span></span>
<span class="line"><span>      next = now;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //能够获取令牌的时间</span></span>
<span class="line"><span>    long at=next;</span></span>
<span class="line"><span>    //设置下一令牌产生时间</span></span>
<span class="line"><span>    next += interval;</span></span>
<span class="line"><span>    //返回线程需要等待的时间</span></span>
<span class="line"><span>    return Math.max(at, 0L);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //申请令牌</span></span>
<span class="line"><span>  void acquire() {</span></span>
<span class="line"><span>    //申请令牌时的时间</span></span>
<span class="line"><span>    long now = System.nanoTime();</span></span>
<span class="line"><span>    //预占令牌</span></span>
<span class="line"><span>    long at=reserve(now);</span></span>
<span class="line"><span>    long waitTime=max(at-now, 0);</span></span>
<span class="line"><span>    //按照条件等待</span></span>
<span class="line"><span>    if(waitTime &gt; 0) {</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        TimeUnit.NANOSECONDS</span></span>
<span class="line"><span>          .sleep(waitTime);</span></span>
<span class="line"><span>      }catch(InterruptedException e){</span></span>
<span class="line"><span>        e.printStackTrace();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>如果令牌桶的容量大于1，又该如何处理呢？按照令牌桶算法，令牌要首先从令牌桶中出，所以我们需要按需计算令牌桶中的数量，当有线程请求令牌时，先从令牌桶中出。具体的代码实现如下所示。我们增加了一个<strong>resync()方法</strong>，在这个方法中，如果线程请求令牌的时间在下一令牌产生时间之后，会重新计算令牌桶中的令牌数，<strong>新产生的令牌的计算公式是：(now-next)/interval</strong>，你可对照上面的示意图来理解。reserve()方法中，则增加了先从令牌桶中出令牌的逻辑，不过需要注意的是，如果令牌是从令牌桶中出的，那么next就无需增加一个 interval 了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class SimpleLimiter {</span></span>
<span class="line"><span>  //当前令牌桶中的令牌数量</span></span>
<span class="line"><span>  long storedPermits = 0;</span></span>
<span class="line"><span>  //令牌桶的容量</span></span>
<span class="line"><span>  long maxPermits = 3;</span></span>
<span class="line"><span>  //下一令牌产生时间</span></span>
<span class="line"><span>  long next = System.nanoTime();</span></span>
<span class="line"><span>  //发放令牌间隔：纳秒</span></span>
<span class="line"><span>  long interval = 1000_000_000;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  //请求时间在下一令牌产生时间之后,则</span></span>
<span class="line"><span>  // 1.重新计算令牌桶中的令牌数</span></span>
<span class="line"><span>  // 2.将下一个令牌发放时间重置为当前时间</span></span>
<span class="line"><span>  void resync(long now) {</span></span>
<span class="line"><span>    if (now &gt; next) {</span></span>
<span class="line"><span>      //新产生的令牌数</span></span>
<span class="line"><span>      long newPermits=(now-next)/interval;</span></span>
<span class="line"><span>      //新令牌增加到令牌桶</span></span>
<span class="line"><span>      storedPermits=min(maxPermits, </span></span>
<span class="line"><span>        storedPermits + newPermits);</span></span>
<span class="line"><span>      //将下一个令牌发放时间重置为当前时间</span></span>
<span class="line"><span>      next = now;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //预占令牌，返回能够获取令牌的时间</span></span>
<span class="line"><span>  synchronized long reserve(long now){</span></span>
<span class="line"><span>    resync(now);</span></span>
<span class="line"><span>    //能够获取令牌的时间</span></span>
<span class="line"><span>    long at = next;</span></span>
<span class="line"><span>    //令牌桶中能提供的令牌</span></span>
<span class="line"><span>    long fb=min(1, storedPermits);</span></span>
<span class="line"><span>    //令牌净需求：首先减掉令牌桶中的令牌</span></span>
<span class="line"><span>    long nr = 1 - fb;</span></span>
<span class="line"><span>    //重新计算下一令牌产生时间</span></span>
<span class="line"><span>    next = next + nr*interval;</span></span>
<span class="line"><span>    //重新计算令牌桶中的令牌</span></span>
<span class="line"><span>    this.storedPermits -= fb;</span></span>
<span class="line"><span>    return at;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //申请令牌</span></span>
<span class="line"><span>  void acquire() {</span></span>
<span class="line"><span>    //申请令牌时的时间</span></span>
<span class="line"><span>    long now = System.nanoTime();</span></span>
<span class="line"><span>    //预占令牌</span></span>
<span class="line"><span>    long at=reserve(now);</span></span>
<span class="line"><span>    long waitTime=max(at-now, 0);</span></span>
<span class="line"><span>    //按照条件等待</span></span>
<span class="line"><span>    if(waitTime &gt; 0) {</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        TimeUnit.NANOSECONDS</span></span>
<span class="line"><span>          .sleep(waitTime);</span></span>
<span class="line"><span>      }catch(InterruptedException e){</span></span>
<span class="line"><span>        e.printStackTrace();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">&amp;ZeroWidthSpace;</a></h2><p>经典的限流算法有两个，一个是<strong>令牌桶算法（Token Bucket）</strong>，另一个是<strong>漏桶算法（Leaky Bucket）</strong>。令牌桶算法是定时向令牌桶发送令牌，请求能够从令牌桶中拿到令牌，然后才能通过限流器；而漏桶算法里，请求就像水一样注入漏桶，漏桶会按照一定的速率自动将水漏掉，只有漏桶里还能注入水的时候，请求才能通过限流器。令牌桶算法和漏桶算法很像一个硬币的正反面，所以你可以参考令牌桶算法的实现来实现漏桶算法。</p><p>上面我们介绍了Guava是如何实现令牌桶算法的，我们的示例代码是对Guava RateLimiter的简化，Guava RateLimiter扩展了标准的令牌桶算法，比如还能支持预热功能。对于按需加载的缓存来说，预热后缓存能支持5万TPS的并发，但是在预热前5万TPS的并发直接就把缓存击垮了，所以如果需要给该缓存限流，限流器也需要支持预热功能，在初始阶段，限制的流速 r 很小，但是动态增长的。预热功能的实现非常复杂，Guava构建了一个积分函数来解决这个问题，如果你感兴趣，可以继续深入研究。</p><p>欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。 精选留言（15） null 👍（71） 💬（7）re：为什么令牌是从令牌桶中出的，那么 next 就无需增加一个 interval？</p><p>next 变量的意思是下一个令牌的生成时间，可以理解为当前线程请求的令牌的生成时刻，如第一张图所示：线程 T1 的令牌的生成时刻是第三秒。</p><p>线程 T 请求时，存在三种场景：</p><ol><li>桶里有剩余令牌。</li><li>刚创建令牌，线程同时请求。</li><li>桶里无剩余令牌。</li></ol><p>场景 2 可以想象成线程请求的同时令牌刚好生成，没来得及放入桶内就被线程 T 拿走了。因此将场景 2 和场景 3 合并成一种情况，那就是桶里没令牌。即线程请求时，桶里可分为有令牌和没令牌。</p><p>“桶里没令牌”，线程 T 需要等待；需要等待则意味着 now(线程 T 请求时刻) 小于等于 next(线程 T 所需的令牌的生成时刻)。这里可以想象一下线程 T 在苦苦等待令牌生成的场景，只要线程 T 等待那么久之后，就会被放行。放行这一刻令牌同时生成，立马被线程拿走，令牌没放入桶里。对应到代码就是 resync 方法没有进入 if 语句内。</p><p>“桶里有令牌”，线程 T 不需要等待。说明线程 T 对应的令牌已经早早生成，已在桶内。代码就是：now &gt; next（请求时刻大于对应令牌的生成时刻）。因此在分配令牌给线程之前，需要计算线程 T 迟到了多久，迟到的这段时间，有多少个令牌生成¹；然后放入桶内，满了则丢弃²；未来的线程的令牌在这个时刻已经生成放入桶内³（即 resync 方法的逻辑）。线程无需等待，所以不需要增加一个 interval 了。</p><p>角标分别对应 resync 方法内的代码： ¹: long newPermits=(now-next)/interval; ²: storedPermits=min(maxPermits, storedPermits + newPermits); ³: next = now;2019-08-09花儿少年 👍（27） 💬（7）很精髓的就是reserve方法，我来试着稍微解释一下 首先肯定是计算令牌桶里面的令牌数量 然后取令牌桶中的令牌数量storedPermits 与当前的需要的令牌数量 1 做比较，大于等于 1，说明令牌桶至少有一个令牌，此时下一令牌的获取是不需要等待的，表现为 next 不需要变化；而当令牌桶中的令牌没有了即storedPermits等于 0 时，next 就会变化为下一个令牌的获取时间，注意 nr 的值变化2019-06-18梦倚栏杆 👍（19） 💬（4）有个疑问：高并发情况下单独一个线程维护一个队列放令牌，性能上扛不住，那么获取令牌时每次加锁去计算性能就可以抗的主？是根据什么依据来判断性能的呢？2019-12-13Darren 👍（17） 💬（2）老师，请教一下，限流器和信号量为什么感觉一样的，那为什么2个还都存在？是因为业务场景不同吗？请老师解惑下2019-05-26zsh0103 👍（8） 💬（1）老师好，问个问题。文中代码b=3，r=1/s时，如果在next之后同时来了3个请求，应该时都可以获得令牌的对吧。就是说这3个请求都可以执行。那岂不是违背了r=1/s的限制吗。 2019-05-26刘鸿博 👍（5） 💬（2）newPermits, storePermits, fb, nr 都应该是double, 而不是long. 2019-08-26高源 👍（5） 💬（1）还有就是老师我问一下因为我不是在互联网公司工作接触高并发场景少，我又喜欢学习研究提高自己，是不是得多看多练，实战2019-05-25爱吃回锅肉的瘦子 👍（4） 💬（1）老师，有没什么资料推荐关于guava预热功能呢？主要网上资料太繁杂，不知道要如何甄别哪些是比较经典的2019-05-26小强（jacky） 👍（3） 💬（1）老师请教个问题，maxPermits/next 的变量在程序里面，不同线程之间存在依赖关系，这不是数据竞争吗？为啥这里没有加对应的锁？2020-10-14锦 👍（3） 💬（2）很精彩！老师应该去讲数据结构与算法:)2019-05-25xzy 👍（1） 💬（1）不知道课程结束后，老师还会出来答疑不？2020-11-11一个慢慢爬行的普通人 👍（1） 💬（1）老师，我刚刚应该是想错了，线程池任务提交频繁是不是导致线程池存储任务队列不断扩大，从而可能会导致系统不稳定，但是这方面线程池也可以用有界队列来控制，所以不太清楚是什么能够导致系统不稳定2019-09-16韩大 👍（1） 💬（1）guava的ratelimit好像是阻塞的，而不是抛弃请求，这样会不会导致用户响应时间过长的问题？2019-08-16一一 👍（0） 💬（1）老师你好，请问在高并发场景下定时器与线程睡眠的差距是怎样的？2021-09-26白 👍（0） 💬（1）令牌桶的平滑特性这里怎么体现呢？ 比如1秒钟10个令牌这个算法里会在第一毫秒耗尽，而不是平滑的分散在1秒里吧？2020-04-24</p>`,46)])])}const u=s(l,[["render",i]]);export{d as __pageData,u as default};
