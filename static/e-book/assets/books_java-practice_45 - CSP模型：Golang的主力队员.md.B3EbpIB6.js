import{_ as a,o as s,c as p,ae as l}from"./chunks/framework.Iv6F95cJ.js";const u=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/java-practice/45 - CSP模型：Golang的主力队员.md","filePath":"books/java-practice/45 - CSP模型：Golang的主力队员.md"}'),e={name:"books/java-practice/45 - CSP模型：Golang的主力队员.md"};function t(c,n,o,i,r,h){return s(),p("div",null,[...n[0]||(n[0]=[l(`<p>Golang是一门号称从语言层面支持并发的编程语言，支持并发是Golang一个非常重要的特性。在上一篇文章<a href="https://time.geekbang.org/column/article/99787" target="_blank" rel="noreferrer">《44 | 协程：更轻量级的线程》</a>中我们介绍过，Golang支持协程，协程可以类比Java中的线程，解决并发问题的难点就在于线程（协程）之间的协作。</p><p>那Golang是如何解决协作问题的呢？</p><p>总的来说，Golang提供了两种不同的方案：一种方案支持协程之间以共享内存的方式通信，Golang提供了管程和原子类来对协程进行同步控制，这个方案与Java语言类似；另一种方案支持协程之间以消息传递（Message-Passing）的方式通信，本质上是要避免共享，Golang的这个方案是基于<strong>CSP</strong>（Communicating Sequential Processes）模型实现的。Golang比较推荐的方案是后者。</p><h2 id="什么是csp模型" tabindex="-1">什么是CSP模型 <a class="header-anchor" href="#什么是csp模型" aria-label="Permalink to &quot;什么是CSP模型&quot;">&amp;ZeroWidthSpace;</a></h2><p>我们在<a href="https://time.geekbang.org/column/article/98903" target="_blank" rel="noreferrer">《42 | Actor模型：面向对象原生的并发模型》</a>中介绍了Actor模型，Actor模型中Actor之间就是不能共享内存的，彼此之间通信只能依靠消息传递的方式。Golang实现的CSP模型和Actor模型看上去非常相似，Golang程序员中有句格言：“<strong>不要以共享内存方式通信，要以通信方式共享内存</strong>（Don’t communicate by sharing memory, share memory by communicating）。”虽然Golang中协程之间，也能够以共享内存的方式通信，但是并不推荐；而推荐的以通信的方式共享内存，实际上指的就是协程之间以消息传递方式来通信。</p><p>下面我们先结合一个简单的示例，看看Golang中协程之间是如何以消息传递的方式实现通信的。我们示例的目标是打印从1累加到100亿的结果，如果使用单个协程来计算，大概需要4秒多的时间。单个协程，只能用到CPU中的一个核，为了提高计算性能，我们可以用多个协程来并行计算，这样就能发挥多核的优势了。</p><p>在下面的示例代码中，我们用了4个子协程来并行执行，这4个子协程分别计算[1, 25亿]、(25亿, 50亿]、(50亿, 75亿]、(75亿, 100亿]，最后再在主协程中汇总4个子协程的计算结果。主协程要汇总4个子协程的计算结果，势必要和4个子协程之间通信，<strong>Golang中协程之间通信推荐的是使用channel</strong>，channel你可以形象地理解为现实世界里的管道。另外，calc()方法的返回值是一个只能接收数据的channel ch，它创建的子协程会把计算结果发送到这个ch中，而主协程也会将这个计算结果通过ch读取出来。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import (</span></span>
<span class="line"><span>	&quot;fmt&quot;</span></span>
<span class="line"><span>	&quot;time&quot;</span></span>
<span class="line"><span>)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func main() {</span></span>
<span class="line"><span>    // 变量声明</span></span>
<span class="line"><span>	var result, i uint64</span></span>
<span class="line"><span>    // 单个协程执行累加操作</span></span>
<span class="line"><span>	start := time.Now()</span></span>
<span class="line"><span>	for i = 1; i &lt;= 10000000000; i++ {</span></span>
<span class="line"><span>		result += i</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>	// 统计计算耗时</span></span>
<span class="line"><span>	elapsed := time.Since(start)</span></span>
<span class="line"><span>	fmt.Printf(&quot;执行消耗的时间为:&quot;, elapsed)</span></span>
<span class="line"><span>	fmt.Println(&quot;, result:&quot;, result)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 4个协程共同执行累加操作</span></span>
<span class="line"><span>	start = time.Now()</span></span>
<span class="line"><span>	ch1 := calc(1, 2500000000)</span></span>
<span class="line"><span>	ch2 := calc(2500000001, 5000000000)</span></span>
<span class="line"><span>	ch3 := calc(5000000001, 7500000000)</span></span>
<span class="line"><span>	ch4 := calc(7500000001, 10000000000)</span></span>
<span class="line"><span>    // 汇总4个协程的累加结果</span></span>
<span class="line"><span>	result = &lt;-ch1 + &lt;-ch2 + &lt;-ch3 + &lt;-ch4</span></span>
<span class="line"><span>	// 统计计算耗时</span></span>
<span class="line"><span>	elapsed = time.Since(start)</span></span>
<span class="line"><span>	fmt.Printf(&quot;执行消耗的时间为:&quot;, elapsed)</span></span>
<span class="line"><span>	fmt.Println(&quot;, result:&quot;, result)</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>// 在协程中异步执行累加操作，累加结果通过channel传递</span></span>
<span class="line"><span>func calc(from uint64, to uint64) &lt;-chan uint64 {</span></span>
<span class="line"><span>    // channel用于协程间的通信</span></span>
<span class="line"><span>	ch := make(chan uint64)</span></span>
<span class="line"><span>    // 在协程中执行累加操作</span></span>
<span class="line"><span>	go func() {</span></span>
<span class="line"><span>		result := from</span></span>
<span class="line"><span>		for i := from + 1; i &lt;= to; i++ {</span></span>
<span class="line"><span>			result += i</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>        // 将结果写入channel</span></span>
<span class="line"><span>		ch &lt;- result</span></span>
<span class="line"><span>	}()</span></span>
<span class="line"><span>    // 返回结果是用于通信的channel</span></span>
<span class="line"><span>	return ch</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="csp模型与生产者-消费者模式" tabindex="-1">CSP模型与生产者-消费者模式 <a class="header-anchor" href="#csp模型与生产者-消费者模式" aria-label="Permalink to &quot;CSP模型与生产者-消费者模式&quot;">&amp;ZeroWidthSpace;</a></h2><p>你可以简单地把Golang实现的CSP模型类比为生产者-消费者模式，而channel可以类比为生产者-消费者模式中的阻塞队列。不过，需要注意的是Golang中channel的容量可以是0，容量为0的channel在Golang中被称为<strong>无缓冲的channel</strong>，容量大于0的则被称为<strong>有缓冲的channel</strong>。</p><p>无缓冲的channel类似于Java中提供的SynchronousQueue，主要用途是在两个协程之间做数据交换。比如上面累加器的示例代码中，calc()方法内部创建的channel就是无缓冲的channel。</p><p>而创建一个有缓冲的channel也很简单，在下面的示例代码中，我们创建了一个容量为4的channel，同时创建了4个协程作为生产者、4个协程作为消费者。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 创建一个容量为4的channel </span></span>
<span class="line"><span>ch := make(chan int, 4)</span></span>
<span class="line"><span>// 创建4个协程，作为生产者</span></span>
<span class="line"><span>for i := 0; i &lt; 4; i++ {</span></span>
<span class="line"><span>	go func() {</span></span>
<span class="line"><span>		ch &lt;- 7</span></span>
<span class="line"><span>	}()</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>// 创建4个协程，作为消费者</span></span>
<span class="line"><span>for i := 0; i &lt; 4; i++ {</span></span>
<span class="line"><span>    go func() {</span></span>
<span class="line"><span>    	o := &lt;-ch</span></span>
<span class="line"><span>    	fmt.Println(&quot;received:&quot;, o)</span></span>
<span class="line"><span>    }()</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>Golang中的channel是语言层面支持的，所以可以使用一个左向箭头（&lt;-）来完成向channel发送数据和读取数据的任务，使用上还是比较简单的。Golang中的channel是支持双向传输的，所谓双向传输，指的是一个协程既可以通过它发送数据，也可以通过它接收数据。</p><p>不仅如此，Golang中还可以将一个双向的channel变成一个单向的channel，在累加器的例子中，calc()方法中创建了一个双向channel，但是返回的就是一个只能接收数据的单向channel，所以主协程中只能通过它接收数据，而不能通过它发送数据，如果试图通过它发送数据，编译器会提示错误。对比之下，双向变单向的功能，如果以SDK方式实现，还是很困难的。</p><h2 id="csp模型与actor模型的区别" tabindex="-1">CSP模型与Actor模型的区别 <a class="header-anchor" href="#csp模型与actor模型的区别" aria-label="Permalink to &quot;CSP模型与Actor模型的区别&quot;">&amp;ZeroWidthSpace;</a></h2><p>同样是以消息传递的方式来避免共享，那Golang实现的CSP模型和Actor模型有什么区别呢？</p><p>第一个最明显的区别就是：<strong>Actor模型中没有channel</strong>。虽然Actor模型中的 mailbox 和 channel 非常像，看上去都像个FIFO队列，但是区别还是很大的。Actor模型中的mailbox对于程序员来说是“透明”的，mailbox明确归属于一个特定的Actor，是Actor模型中的内部机制；而且Actor之间是可以直接通信的，不需要通信中介。但CSP模型中的 channel 就不一样了，它对于程序员来说是“可见”的，是通信的中介，传递的消息都是直接发送到 channel 中的。</p><p>第二个区别是：Actor模型中发送消息是<strong>非阻塞</strong>的，而CSP模型中是<strong>阻塞</strong>的。Golang实现的CSP模型，channel是一个阻塞队列，当阻塞队列已满的时候，向channel中发送数据，会导致发送消息的协程阻塞。</p><p>第三个区别则是关于消息送达的。在<a href="https://time.geekbang.org/column/article/98903" target="_blank" rel="noreferrer">《42 | Actor模型：面向对象原生的并发模型》</a>这篇文章中，我们介绍过Actor模型理论上不保证消息百分百送达，而在Golang实现的<strong>CSP模型中，是能保证消息百分百送达的</strong>。不过这种百分百送达也是有代价的，那就是有可能会导致<strong>死锁</strong>。</p><p>比如，下面这段代码就存在死锁问题，在主协程中，我们创建了一个无缓冲的channel ch，然后从ch中接收数据，此时主协程阻塞，main()方法中的主协程阻塞，整个应用就阻塞了。这就是Golang中最简单的一种死锁。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>func main() {</span></span>
<span class="line"><span>    // 创建一个无缓冲的channel  </span></span>
<span class="line"><span>    ch := make(chan int)</span></span>
<span class="line"><span>    // 主协程会阻塞在此处，发生死锁</span></span>
<span class="line"><span>    &lt;- ch </span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">&amp;ZeroWidthSpace;</a></h2><p>Golang中虽然也支持传统的共享内存的协程间通信方式，但是推荐的还是使用CSP模型，以通信的方式共享内存。</p><p>Golang中实现的CSP模型功能上还是很丰富的，例如支持select语句，select语句类似于网络编程里的多路复用函数select()，只要有一个channel能够发送成功或者接收到数据就可以跳出阻塞状态。鉴于篇幅原因，我就点到这里，不详细介绍那么多了。</p><p>CSP模型是托尼·霍尔（Tony Hoare）在1978年提出的，不过这个模型这些年一直都在发展，其理论远比Golang的实现复杂得多，如果你感兴趣，可以参考霍尔写的<a href="http://www.usingcsp.com/cspbook.pdf" target="_blank" rel="noreferrer">Communicating Sequential Processes</a>这本电子书。另外，霍尔在并发领域还有一项重要成就，那就是提出了霍尔管程模型，这个你应该很熟悉了，Java领域解决并发问题的理论基础就是它。</p><p>Java领域可以借助第三方的类库<a href="https://www.cs.kent.ac.uk/projects/ofa/jcsp/" target="_blank" rel="noreferrer">JCSP</a>来支持CSP模型，相比Golang的实现，JCSP更接近理论模型，如果你感兴趣，可以下载学习。不过需要注意的是，JCSP并没有经过广泛的生产环境检验，所以并不建议你在生产环境中使用。</p><p>欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。 精选留言（15） Sunqc 👍（29） 💬（1）会反复看这些内容，每次看感觉都不一样，另外老师推荐的 并发编程的艺术，还有图解java多线程模式，结合这些书看加深理解。持续关注并发编程2019-06-11zhangtnty 👍（10） 💬（1）王老师辛苦了👍2019-06-11QQ怪 👍（6） 💬（1）更本看不够啊，不想老师停更2019-06-11叫我天才好了 👍（4） 💬（1）第一遍只能说让我理解了并发的处理，还是要多复习几遍。加油吧，不拼一下你永远不知道你的潜力有多大，感谢老师的分享。2019-09-06宁悦 👍（3） 💬（1）今天看完了整个系列，觉得老师讲的非常好，自己也在看图解java多线程，加深理解。感谢老师2020-03-28helloworld 👍（3） 💬（1）终于看完了。对Java领域的并发编程有了更深一层的认识。认真对待专栏的每一节课程，\b学原理，看示例程序，思考课后的问题。尤其是第一部分关于Java多线程编程相关的理论介绍是让我 收获最大的。工作中对于Java中的各种队列了解不是很多，在这个专栏中学习了。至于专栏中关于并发设计模式和案例分析两部分的讲解，感觉了解即可。专栏虽然结束了，但是对于并发的 学习没有结束，继续！2019-09-25知行合一 👍（3） 💬（1）订了十几个专栏，老师讲的是最通熟易懂的，虽然有些知识点由于自己不够熟悉还需要多看几遍，找相关的书籍多加研习。谢谢老师！真心希望以后还能学习老师的新专栏2019-07-22党 👍（3） 💬（1）现在golang也很火 golang和java 以后怎么选2019-07-01马哲富 👍（3） 💬（1）2个星期看完了，还得慢慢消化，谢谢王老师，老师辛苦了！2019-06-21海涛 👍（2） 💬（1）学的比较晚也比较慢，准备开始刷第二遍2019-12-13jery 👍（2） 💬（2）想问老师一个问题，问题描述：集群中有A、B两台机器，集群与另一系统C进行通信。 系统C作为服务端最大并发数为50。如何保证集群中两台机器并 发向C发起请求控制在50并发之内。 我的思考:解决方法1：A、B两台机器平分50个并发。2.建一张表，实时监控正在执行任务任务的线程数，让A、B并发总数不大于50.2019-08-01J.M.Liu 👍（2） 💬（1）全程跟完的，飞机起飞关机前，打卡。感谢老师2019-06-12竹马彦四郎的好朋友影法師 👍（1） 💬（1）2021年原地过年，把这个专栏刷掉了~ 嘿嘿，喜欢，~其实都知道，但是不系统，谢谢王老师提纲挈领，吾辈获益良多！2021-02-18爱读书的张先生 👍（1） 💬（1）记录一下，终于看完了，感谢王老师。2020-07-02kimoti 👍（1） 💬（1）坚持到了最后一篇,感谢王老师2020-06-01</p>`,28)])])}const m=a(e,[["render",t]]);export{u as __pageData,m as default};
