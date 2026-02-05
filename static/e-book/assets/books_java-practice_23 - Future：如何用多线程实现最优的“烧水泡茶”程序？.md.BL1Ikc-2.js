import{_ as a,o as n,c as p,ae as t}from"./chunks/framework.Iv6F95cJ.js";const T=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/java-practice/23 - Future：如何用多线程实现最优的“烧水泡茶”程序？.md","filePath":"books/java-practice/23 - Future：如何用多线程实现最优的“烧水泡茶”程序？.md"}'),e={name:"books/java-practice/23 - Future：如何用多线程实现最优的“烧水泡茶”程序？.md"};function l(i,s,r,c,u,o){return n(),p("div",null,[...s[0]||(s[0]=[t(`<p>在上一篇文章<a href="https://time.geekbang.org/column/article/90771" target="_blank" rel="noreferrer">《22 | Executor与线程池：如何创建正确的线程池？》</a>中，我们详细介绍了如何创建正确的线程池，那创建完线程池，我们该如何使用呢？在上一篇文章中，我们仅仅介绍了ThreadPoolExecutor的 <code>void execute(Runnable command)</code> 方法，利用这个方法虽然可以提交任务，但是却没有办法获取任务的执行结果（execute()方法没有返回值）。而很多场景下，我们又都是需要获取任务的执行结果的。那ThreadPoolExecutor是否提供了相关功能呢？必须的，这么重要的功能当然需要提供了。</p><p>下面我们就来介绍一下使用ThreadPoolExecutor的时候，如何获取任务执行结果。</p><h2 id="如何获取任务执行结果" tabindex="-1">如何获取任务执行结果 <a class="header-anchor" href="#如何获取任务执行结果" aria-label="Permalink to &quot;如何获取任务执行结果&quot;">&amp;ZeroWidthSpace;</a></h2><p>Java通过ThreadPoolExecutor提供的3个submit()方法和1个FutureTask工具类来支持获得任务执行结果的需求。下面我们先来介绍这3个submit()方法，这3个方法的方法签名如下。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 提交Runnable任务</span></span>
<span class="line"><span>Future&lt;?&gt; </span></span>
<span class="line"><span>  submit(Runnable task);</span></span>
<span class="line"><span>// 提交Callable任务</span></span>
<span class="line"><span>&lt;T&gt; Future&lt;T&gt; </span></span>
<span class="line"><span>  submit(Callable&lt;T&gt; task);</span></span>
<span class="line"><span>// 提交Runnable任务及结果引用  </span></span>
<span class="line"><span>&lt;T&gt; Future&lt;T&gt; </span></span>
<span class="line"><span>  submit(Runnable task, T result);</span></span></code></pre></div><p>你会发现它们的返回值都是Future接口，Future接口有5个方法，我都列在下面了，它们分别是<strong>取消任务的方法cancel()、判断任务是否已取消的方法isCancelled()、判断任务是否已结束的方法isDone()以及2个获得任务执行结果的get()和get(timeout, unit)</strong>，其中最后一个get(timeout, unit)支持超时机制。通过Future接口的这5个方法你会发现，我们提交的任务不但能够获取任务执行结果，还可以取消任务。不过需要注意的是：这两个get()方法都是阻塞式的，如果被调用的时候，任务还没有执行完，那么调用get()方法的线程会阻塞，直到任务执行完才会被唤醒。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 取消任务</span></span>
<span class="line"><span>boolean cancel(</span></span>
<span class="line"><span>  boolean mayInterruptIfRunning);</span></span>
<span class="line"><span>// 判断任务是否已取消  </span></span>
<span class="line"><span>boolean isCancelled();</span></span>
<span class="line"><span>// 判断任务是否已结束</span></span>
<span class="line"><span>boolean isDone();</span></span>
<span class="line"><span>// 获得任务执行结果</span></span>
<span class="line"><span>get();</span></span>
<span class="line"><span>// 获得任务执行结果，支持超时</span></span>
<span class="line"><span>get(long timeout, TimeUnit unit);</span></span></code></pre></div><p>这3个submit()方法之间的区别在于方法参数不同，下面我们简要介绍一下。</p><ol><li>提交Runnable任务 <code>submit(Runnable task)</code> ：这个方法的参数是一个Runnable接口，Runnable接口的run()方法是没有返回值的，所以 <code>submit(Runnable task)</code> 这个方法返回的Future仅可以用来断言任务已经结束了，类似于Thread.join()。</li><li>提交Callable任务 <code>submit(Callable task)</code>：这个方法的参数是一个Callable接口，它只有一个call()方法，并且这个方法是有返回值的，所以这个方法返回的Future对象可以通过调用其get()方法来获取任务的执行结果。</li><li>提交Runnable任务及结果引用 <code>submit(Runnable task, T result)</code>：这个方法很有意思，假设这个方法返回的Future对象是f，f.get()的返回值就是传给submit()方法的参数result。这个方法该怎么用呢？下面这段示例代码展示了它的经典用法。需要你注意的是Runnable接口的实现类Task声明了一个有参构造函数 <code>Task(Result r)</code> ，创建Task对象的时候传入了result对象，这样就能在类Task的run()方法中对result进行各种操作了。result相当于主线程和子线程之间的桥梁，通过它主子线程可以共享数据。</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ExecutorService executor </span></span>
<span class="line"><span>  = Executors.newFixedThreadPool(1);</span></span>
<span class="line"><span>// 创建Result对象r</span></span>
<span class="line"><span>Result r = new Result();</span></span>
<span class="line"><span>r.setAAA(a);</span></span>
<span class="line"><span>// 提交任务</span></span>
<span class="line"><span>Future&lt;Result&gt; future = </span></span>
<span class="line"><span>  executor.submit(new Task(r), r);  </span></span>
<span class="line"><span>Result fr = future.get();</span></span>
<span class="line"><span>// 下面等式成立</span></span>
<span class="line"><span>fr === r;</span></span>
<span class="line"><span>fr.getAAA() === a;</span></span>
<span class="line"><span>fr.getXXX() === x</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class Task implements Runnable{</span></span>
<span class="line"><span>  Result r;</span></span>
<span class="line"><span>  //通过构造函数传入result</span></span>
<span class="line"><span>  Task(Result r){</span></span>
<span class="line"><span>    this.r = r;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  void run() {</span></span>
<span class="line"><span>    //可以操作result</span></span>
<span class="line"><span>    a = r.getAAA();</span></span>
<span class="line"><span>    r.setXXX(x);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>下面我们再来介绍FutureTask工具类。前面我们提到的Future是一个接口，而FutureTask是一个实实在在的工具类，这个工具类有两个构造函数，它们的参数和前面介绍的submit()方法类似，所以这里我就不再赘述了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>FutureTask(Callable&lt;V&gt; callable);</span></span>
<span class="line"><span>FutureTask(Runnable runnable, V result);</span></span></code></pre></div><p>那如何使用FutureTask呢？其实很简单，FutureTask实现了Runnable和Future接口，由于实现了Runnable接口，所以可以将FutureTask对象作为任务提交给ThreadPoolExecutor去执行，也可以直接被Thread执行；又因为实现了Future接口，所以也能用来获得任务的执行结果。下面的示例代码是将FutureTask对象提交给ThreadPoolExecutor去执行。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 创建FutureTask</span></span>
<span class="line"><span>FutureTask&lt;Integer&gt; futureTask</span></span>
<span class="line"><span>  = new FutureTask&lt;&gt;(()-&gt; 1+2);</span></span>
<span class="line"><span>// 创建线程池</span></span>
<span class="line"><span>ExecutorService es = </span></span>
<span class="line"><span>  Executors.newCachedThreadPool();</span></span>
<span class="line"><span>// 提交FutureTask </span></span>
<span class="line"><span>es.submit(futureTask);</span></span>
<span class="line"><span>// 获取计算结果</span></span>
<span class="line"><span>Integer result = futureTask.get();</span></span></code></pre></div><p>FutureTask对象直接被Thread执行的示例代码如下所示。相信你已经发现了，利用FutureTask对象可以很容易获取子线程的执行结果。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 创建FutureTask</span></span>
<span class="line"><span>FutureTask&lt;Integer&gt; futureTask</span></span>
<span class="line"><span>  = new FutureTask&lt;&gt;(()-&gt; 1+2);</span></span>
<span class="line"><span>// 创建并启动线程</span></span>
<span class="line"><span>Thread T1 = new Thread(futureTask);</span></span>
<span class="line"><span>T1.start();</span></span>
<span class="line"><span>// 获取计算结果</span></span>
<span class="line"><span>Integer result = futureTask.get();</span></span></code></pre></div><h2 id="实现最优的-烧水泡茶-程序" tabindex="-1">实现最优的“烧水泡茶”程序 <a class="header-anchor" href="#实现最优的-烧水泡茶-程序" aria-label="Permalink to &quot;实现最优的“烧水泡茶”程序&quot;">&amp;ZeroWidthSpace;</a></h2><p>记得以前初中语文课文里有一篇著名数学家华罗庚先生的文章《统筹方法》，这篇文章里介绍了一个烧水泡茶的例子，文中提到最优的工序应该是下面这样：</p><p><img src="https://static001.geekbang.org/resource/image/86/ce/86193a2dba88dd15562118cce6d786ce.png?wh=1142%2A567" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>烧水泡茶最优工序</p><p>下面我们用程序来模拟一下这个最优工序。我们专栏前面曾经提到，并发编程可以总结为三个核心问题：分工、同步和互斥。编写并发程序，首先要做的就是分工，所谓分工指的是如何高效地拆解任务并分配给线程。对于烧水泡茶这个程序，一种最优的分工方案可以是下图所示的这样：用两个线程T1和T2来完成烧水泡茶程序，T1负责洗水壶、烧开水、泡茶这三道工序，T2负责洗茶壶、洗茶杯、拿茶叶三道工序，其中T1在执行泡茶这道工序时需要等待T2完成拿茶叶的工序。对于T1的这个等待动作，你应该可以想出很多种办法，例如Thread.join()、CountDownLatch，甚至阻塞队列都可以解决，不过今天我们用Future特性来实现。</p><p><img src="https://static001.geekbang.org/resource/image/9c/8e/9cf7d188af9119a5e76788466b453d8e.png?wh=1142%2A617" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>烧水泡茶最优分工方案</p><p>下面的示例代码就是用这一章提到的Future特性来实现的。首先，我们创建了两个FutureTask——ft1和ft2，ft1完成洗水壶、烧开水、泡茶的任务，ft2完成洗茶壶、洗茶杯、拿茶叶的任务；这里需要注意的是ft1这个任务在执行泡茶任务前，需要等待ft2把茶叶拿来，所以ft1内部需要引用ft2，并在执行泡茶之前，调用ft2的get()方法实现等待。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 创建任务T2的FutureTask</span></span>
<span class="line"><span>FutureTask&lt;String&gt; ft2</span></span>
<span class="line"><span>  = new FutureTask&lt;&gt;(new T2Task());</span></span>
<span class="line"><span>// 创建任务T1的FutureTask</span></span>
<span class="line"><span>FutureTask&lt;String&gt; ft1</span></span>
<span class="line"><span>  = new FutureTask&lt;&gt;(new T1Task(ft2));</span></span>
<span class="line"><span>// 线程T1执行任务ft1</span></span>
<span class="line"><span>Thread T1 = new Thread(ft1);</span></span>
<span class="line"><span>T1.start();</span></span>
<span class="line"><span>// 线程T2执行任务ft2</span></span>
<span class="line"><span>Thread T2 = new Thread(ft2);</span></span>
<span class="line"><span>T2.start();</span></span>
<span class="line"><span>// 等待线程T1执行结果</span></span>
<span class="line"><span>System.out.println(ft1.get());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// T1Task需要执行的任务：</span></span>
<span class="line"><span>// 洗水壶、烧开水、泡茶</span></span>
<span class="line"><span>class T1Task implements Callable&lt;String&gt;{</span></span>
<span class="line"><span>  FutureTask&lt;String&gt; ft2;</span></span>
<span class="line"><span>  // T1任务需要T2任务的FutureTask</span></span>
<span class="line"><span>  T1Task(FutureTask&lt;String&gt; ft2){</span></span>
<span class="line"><span>    this.ft2 = ft2;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  String call() throws Exception {</span></span>
<span class="line"><span>    System.out.println(&quot;T1:洗水壶...&quot;);</span></span>
<span class="line"><span>    TimeUnit.SECONDS.sleep(1);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    System.out.println(&quot;T1:烧开水...&quot;);</span></span>
<span class="line"><span>    TimeUnit.SECONDS.sleep(15);</span></span>
<span class="line"><span>    // 获取T2线程的茶叶  </span></span>
<span class="line"><span>    String tf = ft2.get();</span></span>
<span class="line"><span>    System.out.println(&quot;T1:拿到茶叶:&quot;+tf);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    System.out.println(&quot;T1:泡茶...&quot;);</span></span>
<span class="line"><span>    return &quot;上茶:&quot; + tf;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>// T2Task需要执行的任务:</span></span>
<span class="line"><span>// 洗茶壶、洗茶杯、拿茶叶</span></span>
<span class="line"><span>class T2Task implements Callable&lt;String&gt; {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  String call() throws Exception {</span></span>
<span class="line"><span>    System.out.println(&quot;T2:洗茶壶...&quot;);</span></span>
<span class="line"><span>    TimeUnit.SECONDS.sleep(1);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    System.out.println(&quot;T2:洗茶杯...&quot;);</span></span>
<span class="line"><span>    TimeUnit.SECONDS.sleep(2);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    System.out.println(&quot;T2:拿茶叶...&quot;);</span></span>
<span class="line"><span>    TimeUnit.SECONDS.sleep(1);</span></span>
<span class="line"><span>    return &quot;龙井&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>// 一次执行结果：</span></span>
<span class="line"><span>T1:洗水壶...</span></span>
<span class="line"><span>T2:洗茶壶...</span></span>
<span class="line"><span>T1:烧开水...</span></span>
<span class="line"><span>T2:洗茶杯...</span></span>
<span class="line"><span>T2:拿茶叶...</span></span>
<span class="line"><span>T1:拿到茶叶:龙井</span></span>
<span class="line"><span>T1:泡茶...</span></span>
<span class="line"><span>上茶:龙井</span></span></code></pre></div><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">&amp;ZeroWidthSpace;</a></h2><p>利用Java并发包提供的Future可以很容易获得异步任务的执行结果，无论异步任务是通过线程池ThreadPoolExecutor执行的，还是通过手工创建子线程来执行的。Future可以类比为现实世界里的提货单，比如去蛋糕店订生日蛋糕，蛋糕店都是先给你一张提货单，你拿到提货单之后，没有必要一直在店里等着，可以先去干点其他事，比如看场电影；等看完电影后，基本上蛋糕也做好了，然后你就可以凭提货单领蛋糕了。</p><p>利用多线程可以快速将一些串行的任务并行化，从而提高性能；如果任务之间有依赖关系，比如当前任务依赖前一个任务的执行结果，这种问题基本上都可以用Future来解决。在分析这种问题的过程中，建议你用有向图描述一下任务之间的依赖关系，同时将线程的分工也做好，类似于烧水泡茶最优分工方案那幅图。对照图来写代码，好处是更形象，且不易出错。</p><h2 id="课后思考" tabindex="-1">课后思考 <a class="header-anchor" href="#课后思考" aria-label="Permalink to &quot;课后思考&quot;">&amp;ZeroWidthSpace;</a></h2><p>不久前听说小明要做一个询价应用，这个应用需要从三个电商询价，然后保存在自己的数据库里。核心示例代码如下所示，由于是串行的，所以性能很慢，你来试着优化一下吧。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 向电商S1询价，并保存</span></span>
<span class="line"><span>r1 = getPriceByS1();</span></span>
<span class="line"><span>save(r1);</span></span>
<span class="line"><span>// 向电商S2询价，并保存</span></span>
<span class="line"><span>r2 = getPriceByS2();</span></span>
<span class="line"><span>save(r2);</span></span>
<span class="line"><span>// 向电商S3询价，并保存</span></span>
<span class="line"><span>r3 = getPriceByS3();</span></span>
<span class="line"><span>save(r3);</span></span></code></pre></div><p>欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。 精选留言（15） aroll 👍（107） 💬（14）建议并发编程课程中的Demo代码，尽量少使用System.out.println, 因为其实现有使用隐式锁，一些情况还会有锁粗化产生2019-04-20Joker 👍（19） 💬（5）\`\`\` java ExecutorService futuresPool = Executors.newFixedThreadPool(3); Future&lt;Price&gt; future1 = futuresPool.submit(this::getPriceByS1); Future&lt;Price&gt; future2 = futuresPool.submit(this::getPriceByS2); Future&lt;Price&gt; future3 = futuresPool.submit(this::getPriceByS3);</p><pre><code>    ExecutorService saveThreadPool = Executors.newFixedThreadPool(3);
    saveThreadPool.execute(() -&amp;gt; {
        try {
            Price r1= future1.get();
            save(r1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }

    });
    saveThreadPool.execute(() -&amp;gt; {
        try {
            Price r2= future2.get();
            save(r2);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }

    });
    saveThreadPool.execute(() -&amp;gt; {
        try {
            Price r3= future3.get();
            save(r3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
    });
</code></pre><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>用三个线程把这个并行执行，麻烦老师看看，谢谢&lt;/p&gt;2019-11-06&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;张天屹&lt;/span&gt; 👍（10） 💬（4）&lt;p&gt;我不知道是不是理解错老师意思了，先分析依赖有向图，可以看到三条线，没有入度&amp;gt;1的节点</span></span>
<span class="line"><span>那么启动三个线程即可。</span></span>
<span class="line"><span>图：</span></span>
<span class="line"><span>s1询价 -&amp;gt; s1保存  </span></span>
<span class="line"><span>s2询价 -&amp;gt; s2保存</span></span>
<span class="line"><span>s3询价 -&amp;gt; s3保存  </span></span>
<span class="line"><span>代码：</span></span>
<span class="line"><span>        new Thread(() -&amp;gt; {</span></span>
<span class="line"><span>        	r1 = getPriceByS1();</span></span>
<span class="line"><span>        	save(r1);</span></span>
<span class="line"><span>        }).start();</span></span>
<span class="line"><span>        new Thread(() -&amp;gt; {</span></span>
<span class="line"><span>        	r2 = getPriceByS2();</span></span>
<span class="line"><span>        	save(r2);</span></span>
<span class="line"><span>        }).start();</span></span>
<span class="line"><span>        new Thread(() -&amp;gt; {</span></span>
<span class="line"><span>        	r3 = getPriceByS3();</span></span>
<span class="line"><span>        	save(r3);</span></span>
<span class="line"><span>        }).start();</span></span>
<span class="line"><span>我觉得这里不需要future,除非询价和保存之间还有别的计算工作&lt;/p&gt;2019-04-20&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;魏斌斌&lt;/span&gt; 👍（9） 💬（3）&lt;p&gt;老师，我看了下futruerask的源码，当调用futrue.get()方法，其实最终会调用unsafe方法是当前线程阻塞。但是我不太理解线程阻塞到哪去了，也没看到锁。&lt;/p&gt;2019-06-17&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;Sunqc&lt;/span&gt; 👍（6） 💬（1）&lt;p&gt;老师，你所说的订蛋糕，我这样理解对吗，把任务提交给线程池就是让蛋糕店做蛋糕；去看电影就是主线程做其他事，提货单是对应调用future的get&lt;/p&gt;2019-04-30&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;the only Mia’s&lt;/span&gt; 👍（3） 💬（1）&lt;p&gt;老师，jdk 8提供的CompletableFuture，以后异步处理是不是可以直接用此替代&lt;/p&gt;2020-07-25&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;linqw&lt;/span&gt; 👍（3） 💬（2）&lt;p&gt;课后习题，老师帮忙看下哦</span></span>
<span class="line"><span>public class ExecutorExample {</span></span>
<span class="line"><span>private static final ExecutorService executor;</span></span>
<span class="line"><span>    static {executor = new ThreadPoolExecutor(4, 8, 1, TimeUnit.SECONDS, new ArrayBlockingQueue&amp;lt;Runnable&amp;gt;(1000), runnable -&amp;gt; null, (r, executor) -&amp;gt; {&amp;#47;&amp;#47;根据业务降级策略});</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>static class S1Task implements Callable&amp;lt;String&amp;gt; {</span></span>
<span class="line"><span>        @Override</span></span>
<span class="line"><span>        public String call() throws Exception {return getPriceByS1();}}</span></span>
<span class="line"><span>    static class S2Task implements Callable&amp;lt;String&amp;gt; {</span></span>
<span class="line"><span>        @Overridepublic String call() throws Exception {return getPriceByS2();}}</span></span>
<span class="line"><span>    static class S3Task implements Callable&amp;lt;String&amp;gt; {@Override public String call() throws Exception {return getPriceByS3();}}</span></span>
<span class="line"><span>    static class SaveTask implements Callable&amp;lt;Boolean&amp;gt; {private List&amp;lt;FutureTask&amp;lt;String&amp;gt;&amp;gt; futureTasks; public SaveTask(List&amp;lt;FutureTask&amp;lt;String&amp;gt;&amp;gt; futureTasks) {this.futureTasks = futureTasks;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>        @Override</span></span>
<span class="line"><span>        public Boolean call() throws Exception {</span></span>
<span class="line"><span>            for (FutureTask&amp;lt;String&amp;gt; futureTask : futureTasks) {</span></span>
<span class="line"><span>                String data = futureTask.get(10, TimeUnit.SECONDS);</span></span>
<span class="line"><span>                saveData(data);</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            return Boolean.TRUE;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    private static String getPriceByS1() {</span></span>
<span class="line"><span>        return &amp;quot;fromDb1&amp;quot;;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    private static String getPriceByS2() {</span></span>
<span class="line"><span>        return &amp;quot;fromDb2&amp;quot;;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    private static String getPriceByS3() {</span></span>
<span class="line"><span>        return &amp;quot;fromDb3&amp;quot;;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    private static void saveData(String data) {</span></span>
<span class="line"><span>        &amp;#47;&amp;#47;save data to db</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    public static void main(String[] args) {</span></span>
<span class="line"><span>        S1Task s1Task = new S1Task();FutureTask&amp;lt;String&amp;gt; st1 = new FutureTask&amp;lt;&amp;gt;(s1Task);S2Task s2Task = new S2Task();FutureTask&amp;lt;String&amp;gt; st2 = new FutureTask&amp;lt;&amp;gt;(s2Task);S3Task s3Task = new S3Task();FutureTask&amp;lt;String&amp;gt; st3 = new FutureTask&amp;lt;&amp;gt;(s3Task);List&amp;lt;FutureTask&amp;lt;String&amp;gt;&amp;gt; futureTasks = Lists.&amp;lt;FutureTask&amp;lt;String&amp;gt;&amp;gt;newArrayList(st1, st2, st3);FutureTask&amp;lt;Boolean&amp;gt; saveTask = new FutureTask&amp;lt;&amp;gt;(new SaveTask(futureTasks));executor.submit(st1);executor.submit(st2);executor.submit(st3);executor.submit(saveTask);}}&lt;/p&gt;2019-04-22&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;henry&lt;/span&gt; 👍（3） 💬（1）&lt;p&gt;现在是在主线程串行完成3个询价的任务，执行第一个任务，其它2个任务只能等待执行，如果要提高效率，这个地方需要改进，可以用老师今天讲的futuretask，三个询价任务改成futuretask并行执行，效率会提高&lt;/p&gt;2019-04-20&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;张德&lt;/span&gt; 👍（2） 💬（1）&lt;p&gt;我也同意张天屹同学的观点   这个询价操作如果之间没有联系的话  直接起三个线程就可以了 老师能不能讲一下 用线程池怎么就有关联了？&lt;/p&gt;2019-04-21&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;near&lt;/span&gt; 👍（1） 💬（1）&lt;p&gt;老师，有问题问一下：1.在泡茶的例子中，如果使用线程池创建线程，假设有很多个泡茶任务都要反复调用线程池中的线程，那么在T2提前完成任务，T1获取T2的结果前，T2这个线程会不会被线程池回收？2.假设T1在T2前完成，当T1要获取T2结果时，T1中的代码是阻塞的状态吗？&lt;/p&gt;2020-10-13&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;QQ怪&lt;/span&gt; 👍（1） 💬（1）&lt;p&gt;老师，在提交 Runnable 任务及结果引用的例子里面的x变量是什么?&lt;/p&gt;2019-04-20&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;Geek_31594d&lt;/span&gt; 👍（0） 💬（1）&lt;p&gt;老师，有个一直比较疑虑的地方，future.get获取返回值是去阻塞，如果get使用太多，那么阻塞的地方就会感觉有问题&lt;/p&gt;2021-09-08&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;盛权_vinc&lt;/span&gt; 👍（0） 💬（1）&lt;p&gt;老师，你这个泡茶例子，看你最终的执行结果，洗水壶和洗茶壶并行了，然后才开始烧水洗茶杯，这好像有点违背了最优分工方案的图和现实？&lt;/p&gt;2020-10-20&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;是我！&lt;/span&gt; 👍（0） 💬（1）&lt;p&gt;老师您好：请问这样是否有问题？  </span></span>
<span class="line"><span>public static void main(String[] args) throws Exception {</span></span>
<span class="line"><span>        FutureTask t1 = new FutureTask(new Callable() {</span></span>
<span class="line"><span>            @Override</span></span>
<span class="line"><span>            public String call() {</span></span>
<span class="line"><span>                return &amp;quot;getPriceByS1()&amp;quot;;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        });</span></span>
<span class="line"><span>        FutureTask t2 = new FutureTask(() -&amp;gt; &amp;quot;getPriceByS2()&amp;quot;);</span></span>
<span class="line"><span>        FutureTask t3 = new FutureTask(() -&amp;gt; &amp;quot;getPriceByS3()&amp;quot;);</span></span>
<span class="line"><span>        BlockingQueue&amp;lt;Runnable&amp;gt; blockingQueue = new ArrayBlockingQueue&amp;lt;&amp;gt;(3);</span></span>
<span class="line"><span>        ThreadPoolExecutor poolExecutor =</span></span>
<span class="line"><span>                new ThreadPoolExecutor(10, 10, 10,</span></span>
<span class="line"><span>                        TimeUnit.SECONDS, blockingQueue);</span></span>
<span class="line"><span>        poolExecutor.submit(t1);</span></span>
<span class="line"><span>        save(t1.get().toString());</span></span>
<span class="line"><span>        poolExecutor.submit(t2);</span></span>
<span class="line"><span>        save(t2.get().toString());</span></span>
<span class="line"><span>        poolExecutor.submit(t3);</span></span>
<span class="line"><span>        save(t3.get().toString());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private static void save(String ss) {</span></span>
<span class="line"><span>        System.out.println(&amp;quot;保存&amp;quot; + ss);</span></span>
<span class="line"><span>    }&lt;/p&gt;2019-11-30&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;爱上丘比特&lt;/span&gt; 👍（0） 💬（1）&lt;p&gt;老师，既然get是阻塞方法，那应该何时调用呢？或者说在哪种场景调用避免阻塞主线程？&lt;/p&gt;2019-06-26&lt;/li&gt;&lt;br/&gt;</span></span>
<span class="line"><span>&lt;/ul&gt;</span></span></code></pre></div>`,34)])])}const m=a(e,[["render",l]]);export{T as __pageData,m as default};
