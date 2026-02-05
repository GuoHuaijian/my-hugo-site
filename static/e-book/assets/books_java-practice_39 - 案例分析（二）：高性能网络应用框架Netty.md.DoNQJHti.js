import{_ as a,o as s,c as e,ae as p}from"./chunks/framework.Iv6F95cJ.js";const g=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/java-practice/39 - 案例分析（二）：高性能网络应用框架Netty.md","filePath":"books/java-practice/39 - 案例分析（二）：高性能网络应用框架Netty.md"}'),t={name:"books/java-practice/39 - 案例分析（二）：高性能网络应用框架Netty.md"};function o(r,n,l,c,i,d){return s(),e("div",null,[...n[0]||(n[0]=[p(`<p>Netty是一个高性能网络应用框架，应用非常普遍，目前在Java领域里，Netty基本上成为网络程序的标配了。Netty框架功能丰富，也非常复杂，今天我们主要分析Netty框架中的线程模型，而<strong>线程模型直接影响着网络程序的性能</strong>。</p><p>在介绍Netty的线程模型之前，我们首先需要把问题搞清楚，了解网络编程性能的瓶颈在哪里，然后再看Netty的线程模型是如何解决这个问题的。</p><h2 id="网络编程性能的瓶颈" tabindex="-1">网络编程性能的瓶颈 <a class="header-anchor" href="#网络编程性能的瓶颈" aria-label="Permalink to &quot;网络编程性能的瓶颈&quot;">&amp;ZeroWidthSpace;</a></h2><p>在<a href="https://time.geekbang.org/column/article/95098" target="_blank" rel="noreferrer">《33 | Thread-Per-Message模式：最简单实用的分工方法》</a>中，我们写过一个简单的网络程序echo，采用的是阻塞式I/O（BIO）。BIO模型里，所有read()操作和write()操作都会阻塞当前线程的，如果客户端已经和服务端建立了一个连接，而迟迟不发送数据，那么服务端的read()操作会一直阻塞，所以<strong>使用BIO模型，一般都会为每个socket分配一个独立的线程</strong>，这样就不会因为线程阻塞在一个socket上而影响对其他socket的读写。BIO的线程模型如下图所示，每一个socket都对应一个独立的线程；为了避免频繁创建、消耗线程，可以采用线程池，但是socket和线程之间的对应关系并不会变化。</p><p><img src="https://static001.geekbang.org/resource/image/e7/e2/e712c37ea0483e9dde0d6efe76e687e2.png?wh=1138%2A393" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>BIO的线程模型</p><p>BIO这种线程模型适用于socket连接不是很多的场景；但是现在的互联网场景，往往需要服务器能够支撑十万甚至百万连接，而创建十万甚至上百万个线程显然并不现实，所以BIO线程模型无法解决百万连接的问题。如果仔细观察，你会发现互联网场景中，虽然连接多，但是每个连接上的请求并不频繁，所以线程大部分时间都在等待I/O就绪。也就是说线程大部分时间都阻塞在那里，这完全是浪费，如果我们能够解决这个问题，那就不需要这么多线程了。</p><p>顺着这个思路，我们可以将线程模型优化为下图这个样子，可以用一个线程来处理多个连接，这样线程的利用率就上来了，同时所需的线程数量也跟着降下来了。这个思路很好，可是使用BIO相关的API是无法实现的，这是为什么呢？因为BIO相关的socket读写操作都是阻塞式的，而一旦调用了阻塞式API，在I/O就绪前，调用线程会一直阻塞，也就无法处理其他的socket连接了。</p><p><img src="https://static001.geekbang.org/resource/image/ea/1f/eafed0787b82b0b428e1ec0927029f1f.png?wh=1135%2A448" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>理想的线程模型图</p><p>好在Java里还提供了非阻塞式（NIO）API，<strong>利用非阻塞式API就能够实现一个线程处理多个连接了</strong>。那具体如何实现呢？现在普遍都是<strong>采用Reactor模式</strong>，包括Netty的实现。所以，要想理解Netty的实现，接下来我们就需要先了解一下Reactor模式。</p><h2 id="reactor模式" tabindex="-1">Reactor模式 <a class="header-anchor" href="#reactor模式" aria-label="Permalink to &quot;Reactor模式&quot;">&amp;ZeroWidthSpace;</a></h2><p>下面是Reactor模式的类结构图，其中Handle指的是I/O句柄，在Java网络编程里，它本质上就是一个网络连接。Event Handler很容易理解，就是一个事件处理器，其中handle_event()方法处理I/O事件，也就是每个Event Handler处理一个I/O Handle；get_handle()方法可以返回这个I/O的Handle。Synchronous Event Demultiplexer可以理解为操作系统提供的I/O多路复用API，例如POSIX标准里的select()以及Linux里面的epoll()。</p><p><img src="https://static001.geekbang.org/resource/image/a7/40/a7ba3c8d6c49e50d9288baf0c03fa240.png?wh=1142%2A571" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>Reactor模式类结构图</p><p>Reactor模式的核心自然是<strong>Reactor这个类</strong>，其中register_handler()和remove_handler()这两个方法可以注册和删除一个事件处理器；<strong>handle_events()方式是核心</strong>，也是Reactor模式的发动机，这个方法的核心逻辑如下：首先通过同步事件多路选择器提供的select()方法监听网络事件，当有网络事件就绪后，就遍历事件处理器来处理该网络事件。由于网络事件是源源不断的，所以在主程序中启动Reactor模式，需要以 <code>while(true){}</code> 的方式调用handle_events()方法。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void Reactor::handle_events(){</span></span>
<span class="line"><span>  //通过同步事件多路选择器提供的</span></span>
<span class="line"><span>  //select()方法监听网络事件</span></span>
<span class="line"><span>  select(handlers);</span></span>
<span class="line"><span>  //处理网络事件</span></span>
<span class="line"><span>  for(h in handlers){</span></span>
<span class="line"><span>    h.handle_event();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>// 在主程序中启动事件循环</span></span>
<span class="line"><span>while (true) {</span></span>
<span class="line"><span>  handle_events();</span></span></code></pre></div><h2 id="netty中的线程模型" tabindex="-1">Netty中的线程模型 <a class="header-anchor" href="#netty中的线程模型" aria-label="Permalink to &quot;Netty中的线程模型&quot;">&amp;ZeroWidthSpace;</a></h2><p>Netty的实现虽然参考了Reactor模式，但是并没有完全照搬，<strong>Netty中最核心的概念是事件循环（EventLoop）</strong>，其实也就是Reactor模式中的Reactor，<strong>负责监听网络事件并调用事件处理器进行处理</strong>。在4.x版本的Netty中，网络连接和EventLoop是稳定的多对1关系，而EventLoop和Java线程是1对1关系，这里的稳定指的是关系一旦确定就不再发生变化。也就是说一个网络连接只会对应唯一的一个EventLoop，而一个EventLoop也只会对应到一个Java线程，所以<strong>一个网络连接只会对应到一个Java线程</strong>。</p><p>一个网络连接对应到一个Java线程上，有什么好处呢？最大的好处就是对于一个网络连接的事件处理是单线程的，这样就<strong>避免了各种并发问题</strong>。</p><p>Netty中的线程模型可以参考下图，这个图和前面我们提到的理想的线程模型图非常相似，核心目标都是用一个线程处理多个网络连接。</p><p><img src="https://static001.geekbang.org/resource/image/03/04/034756f1d76bb3af09e125de9f3c2f04.png?wh=1137%2A563" alt="" loading="lazy" referrerpolicy="no-referrer"></p><p>Netty中的线程模型</p><p>Netty中还有一个核心概念是<strong>EventLoopGroup</strong>，顾名思义，一个EventLoopGroup由一组EventLoop组成。实际使用中，一般都会创建两个EventLoopGroup，一个称为bossGroup，一个称为workerGroup。为什么会有两个EventLoopGroup呢？</p><p>这个和socket处理网络请求的机制有关，socket处理TCP网络连接请求，是在一个独立的socket中，每当有一个TCP连接成功建立，都会创建一个新的socket，之后对TCP连接的读写都是由新创建处理的socket完成的。也就是说<strong>处理TCP连接请求和读写请求是通过两个不同的socket完成的</strong>。上面我们在讨论网络请求的时候，为了简化模型，只是讨论了读写请求，而没有讨论连接请求。</p><p><strong>在Netty中，bossGroup就用来处理连接请求的，而workerGroup是用来处理读写请求的</strong>。bossGroup处理完连接请求后，会将这个连接提交给workerGroup来处理， workerGroup里面有多个EventLoop，那新的连接会交给哪个EventLoop来处理呢？这就需要一个负载均衡算法，Netty中目前使用的是<strong>轮询算法</strong>。</p><p>下面我们用Netty重新实现以下echo程序的服务端，近距离感受一下Netty。</p><h2 id="用netty实现echo程序服务端" tabindex="-1">用Netty实现Echo程序服务端 <a class="header-anchor" href="#用netty实现echo程序服务端" aria-label="Permalink to &quot;用Netty实现Echo程序服务端&quot;">&amp;ZeroWidthSpace;</a></h2><p>下面的示例代码基于Netty实现了echo程序服务端：首先创建了一个事件处理器（等同于Reactor模式中的事件处理器），然后创建了bossGroup和workerGroup，再之后创建并初始化了ServerBootstrap，代码还是很简单的，不过有两个地方需要注意一下。</p><p>第一个，如果NettybossGroup只监听一个端口，那bossGroup只需要1个EventLoop就可以了，多了纯属浪费。</p><p>第二个，默认情况下，Netty会创建“2*CPU核数”个EventLoop，由于网络连接与EventLoop有稳定的关系，所以事件处理器在处理网络事件的时候是不能有阻塞操作的，否则很容易导致请求大面积超时。如果实在无法避免使用阻塞操作，那可以通过线程池来异步处理。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>//事件处理器</span></span>
<span class="line"><span>final EchoServerHandler serverHandler </span></span>
<span class="line"><span>  = new EchoServerHandler();</span></span>
<span class="line"><span>//boss线程组  </span></span>
<span class="line"><span>EventLoopGroup bossGroup </span></span>
<span class="line"><span>  = new NioEventLoopGroup(1); </span></span>
<span class="line"><span>//worker线程组  </span></span>
<span class="line"><span>EventLoopGroup workerGroup </span></span>
<span class="line"><span>  = new NioEventLoopGroup();</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>  ServerBootstrap b = new ServerBootstrap();</span></span>
<span class="line"><span>  b.group(bossGroup, workerGroup)</span></span>
<span class="line"><span>   .channel(NioServerSocketChannel.class)</span></span>
<span class="line"><span>   .childHandler(new ChannelInitializer&lt;SocketChannel&gt;() {</span></span>
<span class="line"><span>     @Override</span></span>
<span class="line"><span>     public void initChannel(SocketChannel ch){</span></span>
<span class="line"><span>       ch.pipeline().addLast(serverHandler);</span></span>
<span class="line"><span>     }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  //bind服务端端口  </span></span>
<span class="line"><span>  ChannelFuture f = b.bind(9090).sync();</span></span>
<span class="line"><span>  f.channel().closeFuture().sync();</span></span>
<span class="line"><span>} finally {</span></span>
<span class="line"><span>  //终止工作线程组</span></span>
<span class="line"><span>  workerGroup.shutdownGracefully();</span></span>
<span class="line"><span>  //终止boss线程组</span></span>
<span class="line"><span>  bossGroup.shutdownGracefully();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>//socket连接处理器</span></span>
<span class="line"><span>class EchoServerHandler extends </span></span>
<span class="line"><span>    ChannelInboundHandlerAdapter {</span></span>
<span class="line"><span>  //处理读事件  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void channelRead(</span></span>
<span class="line"><span>    ChannelHandlerContext ctx, Object msg){</span></span>
<span class="line"><span>      ctx.write(msg);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //处理读完成事件</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void channelReadComplete(</span></span>
<span class="line"><span>    ChannelHandlerContext ctx){</span></span>
<span class="line"><span>      ctx.flush();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //处理异常事件</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void exceptionCaught(</span></span>
<span class="line"><span>    ChannelHandlerContext ctx,  Throwable cause) {</span></span>
<span class="line"><span>      cause.printStackTrace();</span></span>
<span class="line"><span>      ctx.close();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">&amp;ZeroWidthSpace;</a></h2><p>Netty是一个款优秀的网络编程框架，性能非常好，为了实现高性能的目标，Netty做了很多优化，例如优化了ByteBuffer、支持零拷贝等等，和并发编程相关的就是它的线程模型了。Netty的线程模型设计得很精巧，每个网络连接都关联到了一个线程上，这样做的好处是：对于一个网络连接，读写操作都是单线程执行的，从而避免了并发程序的各种问题。</p><p>你要想深入理解Netty的线程模型，还需要对网络相关知识有一定的理解，关于Java IO的演进过程，你可以参考<a href="http://gee.cs.oswego.edu/dl/cpjslides/nio.pdf" target="_blank" rel="noreferrer">Scalable IO in Java</a>，至于TCP/IP网络编程的知识你可以参考韩国尹圣雨写的经典教程——《TCP/IP网络编程》。</p><p>欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。 精选留言（15） 那只羊 👍（34） 💬（1）QQ怪：Netty可以先从《Netty实战》开始，虽然翻译得一般，但是对于它的整体及各个组件你都能了解到；再就是调试源码来了解它了；最后应用到项目中去啦，比如实现一个简单的RPC，一个IM之类的2019-05-28QQ怪 👍（17） 💬（1）老师，学习netty除了学习老师的专栏还有什么从入门到专精的学习路线吗？2019-05-28墙角儿的花 👍（10） 💬（1）这是我读过的最好的netty基本原理介绍2019-09-09Sunqc 👍（5） 💬（2）我想知道老师后续有发布新的课程吗，喜欢你的课程2019-05-28张德 👍（4） 💬（1）谢谢老师讲这个reactor模式 我最近要优化的系统主体就是采用这个模式 今天看了一天都云里雾里的 看到这篇文章瞬间有了一种有章可循的感觉2019-05-29蓝山 👍（2） 💬（1）网络通信程序性能设计重点要关注三个方面： 1、网络传输方式：同步阻塞方式、异步非阻塞方式； 2、数据序列化：Java序列化（基本不能考虑）、protobuf、jason、Avro等等； 3、网络IO处理线程模型：同步阻塞IO、同步非阻塞IO、IO多路复用（Reactor模式）、AIO异步IO； Netty在应对解决上述三个问题中提供了比较完善的方案。采用IO多路复用机制实现网络传输，同时配合灵活的reactor实现模式，支持通过编码灵活选择不同的reactor模式以应对不同负载和性能要求的场景。同时提供了完善的异步事件驱动实现和API，为开发人员提供了如何获取数据、数据编解码、编解码之后业务处理线程具体在哪个线程执行、编解码之后消息如何派发等等灵活且方便的机制。同时在协议层面直接支持了通用的网络通讯协议，同时对于扩展针对个性化性能需求的私有化协议定制提供了便利的开发工具支持。2020-09-01sswrock 👍（1） 💬（1）看了 Doug Lee的 “Scalable IO in Java”，对于做个Swing GUI开发的人豁然开朗， 感谢宝哥 和 DougLee2019-12-01潭州太守 👍（1） 💬（1）老师，Reactor可以理解是Actor模式的一种吗2019-06-04党 👍（0） 💬（1）反过来说的话就是一个线程有多个EventLoop 一个EventLoop有多个网络连接 对吧2019-09-24墙角儿的花 👍（0） 💬（1）问下老师，im服务端除了用netty，是不是用go的协程也好，连接和协程1对1服务，感觉这个场景下go协程并发能力绝对在netty之上啊2019-09-09锦 👍（0） 💬（2）问下老师零拷贝是怎么实现的呢？2019-05-30晓杰 👍（0） 💬（1）之前做的充电桩也是用的netty，但是只能单机部署，因为netty用的是长连接，但是在分布式框架中网络连接是随机的，请问老师这种情况怎么解决2019-05-28王维 👍（59） 💬（3）分享一下我之前学Netty的学习笔记，主要是源码分析：https://wangwei.one/tags/Netty/2019-05-29侧耳倾听 👍（27） 💬（3）你如果对java nio比较了解的话，应该就明白netty的线程模型。tomcat是在收到请求的时候，为每一个请求创建一个线程处理该次请求，消耗的是服务器的线程池，当并发连接数大的时候，性能下降很快。ngix相较于tomcat的区别就在于处理请求连接的线程只有一个，相当于一个分发器，只负责接受请求，不负责处理请求，连接建立成功后，为该连接分发一个工作线程处理请求和返回结果。这样子的话，服务器的最大并发数就没有了限制，受限的就是服务器的硬件所能支持的最大并发，这一块可以通过横向或者纵向扩展来解决。netty的线程模型也是如此，一个负责接受，一个负责处理，就是之前讲述的Work thread模式2020-04-23周治慧 👍（7） 💬（5）没太明白netty的线程模型，老师说一个socket对应一个Java线程，一个Java线程对应一个eventGroup，那图中不应该是一个socket对应一个eventgroup吗2019-05-28</p>`,36)])])}const u=a(t,[["render",o]]);export{g as __pageData,u as default};
