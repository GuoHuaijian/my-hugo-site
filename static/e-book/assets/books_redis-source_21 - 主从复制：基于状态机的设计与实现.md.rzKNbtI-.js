import{_ as n,o as a,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const _=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/redis-source/21 - 主从复制：基于状态机的设计与实现.md","filePath":"books/redis-source/21 - 主从复制：基于状态机的设计与实现.md"}'),t={name:"books/redis-source/21 - 主从复制：基于状态机的设计与实现.md"};function i(r,s,l,o,c,E){return a(),p("div",null,[...s[0]||(s[0]=[e(`<p>你好，我是蒋德钧。这节课，我想跟你聊聊Redis是如何基于状态机的设计思路，来实现主从复制的。</p><p>主从复制技术我们应该都比较熟悉，因为在使用Redis或MySQL数据库时，我们经常会使用主从复制来实现主从节点间的数据同步，以此提升服务的高可用性。</p><p>从原理上来说，Redis的主从复制主要包括了<strong>全量复制、增量复制和长连接同步</strong>三种情况。全量复制传输RDB文件，增量复制传输主从断连期间的命令，而长连接同步则是把主节点正常收到的请求传输给从节点。</p><p>这三种情况看似简单，但是在实现的时候，我们通常都需要考虑主从连接建立、主从握手和验证、复制情况判断和数据传输等多种不同状态下的逻辑处理。</p><p>那么，<strong>如何才能高效地实现主从复制呢？</strong></p><p>实际上，Redis是采用了<strong>基于状态机</strong>的设计思想，来清晰地实现不同状态及状态间的跳转。而在我们实现网络功能的时候，这种设计和实现方法其实非常重要，它可以避免我们在处理不同状态时的逻辑冲突或遗漏。所以今天这节课，我就来给你介绍下如何基于状态机实现主从复制。</p><p>不过这里我也要说明一点，因为主从复制的状态比较多，如果一下子就学习每个状态细节，我们其实会很容易混淆不同状态的区别和转换关系。所以在今天的课程中，我会先给你介绍下复制整体过程的四个阶段，然后，我们再来逐一学习每个阶段中的状态与变化。</p><h2 id="主从复制的四大阶段" tabindex="-1">主从复制的四大阶段 <a class="header-anchor" href="#主从复制的四大阶段" aria-label="Permalink to &quot;主从复制的四大阶段&quot;">&amp;ZeroWidthSpace;</a></h2><p>首先，我们可以根据主从复制时的关键事件，把整个复制过程分成四个阶段，分别是初始化、建立连接、主从握手、复制类型判断与执行。下面，我们就来依次了解下每个阶段的主要工作。</p><p><strong>1.初始化阶段</strong></p><p>当我们把一个Redis实例A设置为另一个实例B的从库时，实例A会完成初始化操作，主要是获得了主库的IP和端口号。而这个初始化过程，我们可以用三种方式来设置。</p><ul><li>方式一：在实例A上执行replicaof masterip masterport的主从复制命令，指明实例B的IP（masterip）和端口号（masterport）。</li><li>方式二：在实例A的配置文件中设置replicaof masterip masterport，实例A可以通过解析文件获得主库IP和端口号。</li><li>方式三：在实例A启动时，设置启动参数–replicaof [masterip] [masterport]。实例A解析启动参数，就能获得主库的IP和端口号。</li></ul><p><strong>2.建立连接阶段</strong></p><p>接下来，一旦实例A获得了主库IP和端口号，该实例就会尝试和主库建立TCP网络连接，并且会在建立好的网络连接上，监听是否有主库发送的命令。</p><p><strong>3.主从握手阶段</strong></p><p>当实例A和主库建立好连接之后，实例A就开始和主库进行握手。简单来说，握手过程就是主从库间相互发送PING-PONG消息，同时从库根据配置信息向主库进行验证。最后，从库把自己的IP、端口号，以及对无盘复制和PSYNC 2协议的支持情况发给主库。</p><p>那么，和前两个阶段相比，主从握手阶段要执行的操作会比较多，涉及的状态也比较多，所以我们需要先掌握这个阶段要完成的操作，一会儿我就来给你具体介绍。</p><p><strong>4.复制类型判断与执行阶段</strong></p><p>这样，等到主从库之间的握手完成后，从库就会给主库发送PSYNC命令。紧接着，主库会根据从库发送的命令参数作出相应的三种回复，分别是<strong>执行全量复制、执行增量复制、发生错误</strong>。最后，从库在收到上述回复后，就会根据回复的复制类型，开始执行具体的复制操作。</p><p>下图展示了主从复制的整体过程及四个阶段，你可以看下。</p><p><img src="https://static001.geekbang.org/resource/image/c0/c4/c0e917700f6146712bf9a74830d9d4c4.jpg?wh=1920x740" alt="图片" loading="lazy" referrerpolicy="no-referrer"></p><p>好，了解了主从复制的主要阶段后，接下来，我们就具体学习下Redis是如何使用不同的状态及转换，来让从库完成和主库的数据复制操作的。</p><h2 id="基于状态机的主从复制实现" tabindex="-1">基于状态机的主从复制实现 <a class="header-anchor" href="#基于状态机的主从复制实现" aria-label="Permalink to &quot;基于状态机的主从复制实现&quot;">&amp;ZeroWidthSpace;</a></h2><p>首先你要知道，基于状态机实现主从复制的好处，就是当你在开发程序时，只需要考虑清楚在不同状态下具体要执行的操作，以及状态之间的跳转条件就行了。所以，Redis源码中采用的基于状态机跳转的设计思路和主从复制的实现，就是很值得你学习的一点。</p><p>**那么，主从复制中的状态机具体对应的是什么呢？**这就和Redis实例的数据结构有关了。</p><p>每一个Redis实例在代码中都对应一个<strong>redisServer结构体</strong>，这个结构体包含了和Redis实例相关的各种配置，比如实例的RDB、AOF配置、主从复制配置、切片集群配置等。然后，与主从复制状态机相关的变量是<strong>repl_state</strong>，Redis在进行主从复制时，从库就是根据这个变量值的变化，来实现不同阶段的执行和跳转。下面代码显示了redisServer结构体中从库进行复制相关的变量，你可以看下。</p><div class="language-plain vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>struct redisServer {</span></span>
<span class="line"><span>   ...</span></span>
<span class="line"><span>   /* 复制相关(slave) */</span></span>
<span class="line"><span>    char *masterauth;               /* 用于和主库进行验证的密码*/</span></span>
<span class="line"><span>    char *masterhost;               /* 主库主机名 */</span></span>
<span class="line"><span>    int masterport;                 /* 主库端口号r */</span></span>
<span class="line"><span>    …</span></span>
<span class="line"><span>    client *master;        /* 从库上用来和主库连接的客户端 */</span></span>
<span class="line"><span>    client *cached_master; /* 从库上缓存的主库信息 */</span></span>
<span class="line"><span>    int repl_state;          /* 从库的复制状态机 */</span></span>
<span class="line"><span>   ...</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>好，接下来，我们就按照主从复制的四个阶段，来依次学习每个阶段中状态机的变迁，以及相应的代码实现。</p><h3 id="初始化阶段" tabindex="-1"><strong>初始化阶段</strong> <a class="header-anchor" href="#初始化阶段" aria-label="Permalink to &quot;**初始化阶段**&quot;">&amp;ZeroWidthSpace;</a></h3><p>首先，当一个实例启动后，就会调用server.c中的initServerConfig函数，初始化redisServer结构体。此时，实例会把状态机的初始状态设置为<strong>REPL_STATE_NONE</strong>，如下所示：</p><div class="language-plain vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void initServerConfig(void) {</span></span>
<span class="line"><span>   …</span></span>
<span class="line"><span>   server.repl_state = REPL_STATE_NONE;</span></span>
<span class="line"><span>   …</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>然后，一旦实例执行了replicaof masterip masterport命令，就会调用replication.c中的 <strong>replicaofCommand函数</strong>进行处理。replicaof命令携带的masterip和masterport参数对应了主库的IP和端口号，replicaofCommand函数如果判断发现实例并没有记录过主库的IP和端口号，就表明当前实例可以和设置的主库进行连接。<br> 紧接着，replicaofCommand函数会调用replicationSetMaster函数设置主库的信息。这部分的代码逻辑如下所示：</p><div class="language-plain vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/* 检查是否已记录主库信息，如果已经记录了，那么直接返回连接已建立的消息 */</span></span>
<span class="line"><span> if (server.masterhost &amp;&amp; !strcasecmp(server.masterhost,c-&gt;argv[1]-&gt;ptr)&amp;&amp; server.masterport == port) {</span></span>
<span class="line"><span>    serverLog(LL_NOTICE,&quot;REPLICAOF would result into synchronization with the master we are already connected with. No operation performed.&quot;);</span></span>
<span class="line"><span>  addReplySds(c,sdsnew(&quot;+OK Already connected to specified master\\r\\n&quot;));</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  /* 如果没有记录主库的IP和端口号，设置主库的信息 */</span></span>
<span class="line"><span>  replicationSetMaster(c-&gt;argv[1]-&gt;ptr, port);</span></span></code></pre></div><p>而replicationSetMaster函数除了会记录主库的IP、端口号之外，还会把从库实例的状态机设置为<strong>REPL_STATE_CONNECT</strong>。此时，主从复制的初始化阶段就完成了，状态机会从REPL_STATE_NONE变迁为REPL_STATE_CONNECT。这个过程如下所示：<br><img src="https://static001.geekbang.org/resource/image/7c/e1/7c46c8f72f4391d29a6bcdyy8a64e6e1.jpg?wh=1920x749" alt="图片" loading="lazy" referrerpolicy="no-referrer"></p><h3 id="建立连接阶段" tabindex="-1"><strong>建立连接阶段</strong> <a class="header-anchor" href="#建立连接阶段" aria-label="Permalink to &quot;**建立连接阶段**&quot;">&amp;ZeroWidthSpace;</a></h3><p>接着，我们来了解下建立连接阶段的状态机变化。</p><p>当从库实例进入这个阶段时，状态已经变成了REPL_STATE_CONNECT。那么，<strong>从库是何时开始和主库建立网络连接的呢？</strong></p><p>这就和Redis的<strong>周期性任务</strong>执行相关了。所谓周期性任务，我们在<a href="https://time.geekbang.org/column/article/408857" target="_blank" rel="noreferrer">第11讲</a>中已经初步了解过，就是指Redis实例在运行时，按照一定时间周期重复执行的任务。Redis的周期性任务很多，其中之一就是replicationCron()任务。这个任务的执行频率是每1000ms执行一次，如下面的代码所示：</p><div class="language-plain vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int serverCron(struct aeEventLoop *eventLoop, long long id, void *clientData) {</span></span>
<span class="line"><span>   …</span></span>
<span class="line"><span>   run_with_period(1000) replicationCron();</span></span>
<span class="line"><span>   …</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>replicationCron()任务的函数实现逻辑是在server.c中，在该任务中，一个重要的判断就是，检查从库的复制状态机状态。如果状态机状态是REPL_STATE_CONNECT，那么从库就开始和主库建立连接。连接的建立是通过调用<strong>connectWithMaster()函数</strong>来完成的。</p><div class="language-plain vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>replicationCron() {</span></span>
<span class="line"><span>   …</span></span>
<span class="line"><span>   /* 如果从库实例的状态是REPL_STATE_CONNECT，那么从库通过connectWithMaster和主库建立连接 */</span></span>
<span class="line"><span>    if (server.repl_state == REPL_STATE_CONNECT) {</span></span>
<span class="line"><span>        serverLog(LL_NOTICE,&quot;Connecting to MASTER %s:%d&quot;,</span></span>
<span class="line"><span>            server.masterhost, server.masterport);</span></span>
<span class="line"><span>        if (connectWithMaster() == C_OK) {</span></span>
<span class="line"><span>            serverLog(LL_NOTICE,&quot;MASTER &lt;-&gt; REPLICA sync started&quot;);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    …</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这样，当从库实例调用connectWithMaster函数后，会先通过anetTcpNonBlockBestEffortBindConnect函数和主库建立连接。一旦连接建立成功后，从库实例就会在连接上创建读写事件，并且注册对读写事件进行处理的函数syncWithMaster。<br> 最后，connectWithMaster函数会将从库实例的状态机置为REPL_STATE_CONNECTING。下面的代码显示了这部分的逻辑，你可以看下。</p><div class="language-plain vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int connectWithMaster(void) {</span></span>
<span class="line"><span>    int fd;</span></span>
<span class="line"><span>    //从库和主库建立连接</span></span>
<span class="line"><span> fd = anetTcpNonBlockBestEffortBindConnect(NULL, server.masterhost,server.masterport,NET_FIRST_BIND_ADDR);</span></span>
<span class="line"><span>    …</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>//在建立的连接上注册读写事件，对应的回调函数是syncWithMaster</span></span>
<span class="line"><span> if(aeCreateFileEvent(server.el,fd,AE_READABLE|AE_WRITABLE,syncWithMaster, NULL) ==AE_ERR)</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>        close(fd);</span></span>
<span class="line"><span>        serverLog(LL_WARNING,&quot;Can&#39;t create readable event for SYNC&quot;);</span></span>
<span class="line"><span>        return C_ERR;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>    //完成连接后，将状态机设置为REPL_STATE_CONNECTING</span></span>
<span class="line"><span>    …</span></span>
<span class="line"><span>    server.repl_state = REPL_STATE_CONNECTING;</span></span>
<span class="line"><span>    return C_OK;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>所以，当从库实例的状态变为REPL_STATE_CONNECTING时，建立连接的阶段就完成了。这个初始化阶段和建立连接阶段的状态机变迁如下图所示，你可以参考下。<br><img src="https://static001.geekbang.org/resource/image/dd/aa/dd6176abeb3ba492f15a93bd0b4a84aa.jpg?wh=1920x738" alt="图片" loading="lazy" referrerpolicy="no-referrer"></p><h3 id="主从握手阶段" tabindex="-1"><strong>主从握手阶段</strong> <a class="header-anchor" href="#主从握手阶段" aria-label="Permalink to &quot;**主从握手阶段**&quot;">&amp;ZeroWidthSpace;</a></h3><p>接下来，当主从库建立网络连接后，从库实例其实并没有立即开始进行数据同步，而是会先和主库之间进行握手通信。</p><p>握手通信的目的，主要包括从库和主库进行验证，以及从库将自身的IP和端口号发给主库。如我前面所说，这个阶段涉及的状态变迁会比较多，不过其变迁的逻辑实际上是比较清晰的。</p><p>首先，在建立连接阶段的最后，从库实例的状态机处于<strong>REPL_STATE_CONNECTING</strong>状态。一旦主库和从库的连接建立后，从库实例的syncWithMaster函数就会被回调。在这个函数中，如果从库实例的状态是REPL_STATE_CONNECTING，那么实例会发送PING消息给主库，并将状态机置为<strong>REPL_STATE_RECEIVE_PONG</strong>。</p><p>当从库收到主库返回的PONG消息后，接下来，从库会依次给主库发送验证信息、端口号、IP、对RDB文件和无盘复制的支持情况。每一次的握手通信发送消息时，都会对应从库的一组状态变迁。比如，当从库要给主库发送验证信息前，会将自身状态机置为REPL_STATE_SEND_AUTH，然后，从库给主库发送实际的验证信息。验证信息发送完成后，从库状态机会变迁为REPL_STATE_RECEIVE_AUTH，并开始读取主库返回验证结果信息。</p><p>这样一来，当从库对端口号、IP，以及对RDB文件和无盘复制的支持情况进行握手时，也就是在SEND和RECEIVE两种状态间变迁。为了便于你掌握这些状态的变迁，这里我放了一张图，其中显示了从初始化阶段到主从握手阶段的各状态变化，你可以参考下。</p><p><img src="https://static001.geekbang.org/resource/image/c2/cf/c2946565d547bd52063ff1a79ec426cf.jpg?wh=1920x1080" alt="图片" loading="lazy" referrerpolicy="no-referrer"></p><h3 id="复制类型判断与执行阶段" tabindex="-1"><strong>复制类型判断与执行阶段</strong> <a class="header-anchor" href="#复制类型判断与执行阶段" aria-label="Permalink to &quot;**复制类型判断与执行阶段**&quot;">&amp;ZeroWidthSpace;</a></h3><p>当从库和主库完成握手后，从库会读取主库返回的CAPA消息响应，此时，状态机为<strong>REPL_STATE_RECEIVE_CAPA</strong>。紧接着，从库的状态变迁为<strong>REPL_STATE_SEND_PSYNC</strong>，表明要开始向主库发送PSYNC命令，开始实际的数据同步。</p><p>此时，从库会调用slaveTryPartialResynchronization函数，向主库发送PSYNC命令，并且状态机的状态会置为<strong>REPL_STATE_RECEIVE_PSYNC</strong>。下面的代码显示了这三个状态的变迁：</p><div class="language-plain vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>    /* 从库状态机进入REPL_STATE_RECEIVE_CAPA. */</span></span>
<span class="line"><span>    if (server.repl_state == REPL_STATE_RECEIVE_CAPA) {</span></span>
<span class="line"><span>	…</span></span>
<span class="line"><span>	//读取主库返回的CAPA消息响应</span></span>
<span class="line"><span>       server.repl_state = REPL_STATE_SEND_PSYNC;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>	//从库状态机变迁为REPL_STATE_SEND_PSYNC后，开始调用slaveTryPartialResynchronization函数向主库发送PSYNC命令，进行数据同步</span></span>
<span class="line"><span>	if (server.repl_state == REPL_STATE_SEND_PSYNC) {</span></span>
<span class="line"><span>	     if (slaveTryPartialResynchronization(fd,0) == PSYNC_WRITE_ERROR)      </span></span>
<span class="line"><span>	     {</span></span>
<span class="line"><span>	           …</span></span>
<span class="line"><span>	     }</span></span>
<span class="line"><span>	     server.repl_state = REPL_STATE_RECEIVE_PSYNC;</span></span>
<span class="line"><span>	        return;</span></span>
<span class="line"><span>	}</span></span></code></pre></div><p>然后，从库调用的slaveTryPartialResynchronization函数，负责向主库发送数据同步的命令。主库收到命令后，会根据从库发送的主库ID、复制进度值offset，来判断是进行全量复制还是增量复制，或者是返回错误。<br> 以下代码就展示了slaveTryPartialResynchronization函数的基本分支，你可以看到从库会根据主库的回复消息，将slaveTryPartialResynchronization函数的返回值置为不同结果，分别对应了全量复制、增量复制，或是不支持PSYNC。</p><div class="language-plain vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int slaveTryPartialResynchronization(int fd, int read_reply) {</span></span>
<span class="line"><span>   …</span></span>
<span class="line"><span>   //发送PSYNC命令</span></span>
<span class="line"><span>   if (!read_reply) {</span></span>
<span class="line"><span>      //从库第一次和主库同步时，设置offset为-1</span></span>
<span class="line"><span>	server.master_initial_offset = -1;</span></span>
<span class="line"><span>	…</span></span>
<span class="line"><span>	//调用sendSynchronousCommand发送PSYNC命令</span></span>
<span class="line"><span>	reply =</span></span>
<span class="line"><span>	sendSynchronousCommand(SYNC_CMD_WRITE,fd,&quot;PSYNC&quot;,psync_replid,psync_offset,NULL);</span></span>
<span class="line"><span>	 …</span></span>
<span class="line"><span>	 //发送命令后，等待主库响应</span></span>
<span class="line"><span>	 return PSYNC_WAIT_REPLY;</span></span>
<span class="line"><span>   }</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>  //读取主库的响应</span></span>
<span class="line"><span>  reply = sendSynchronousCommand(SYNC_CMD_READ,fd,NULL);</span></span>
<span class="line"><span> </span></span>
<span class="line"><span> //主库返回FULLRESYNC，全量复制</span></span>
<span class="line"><span>  if (!strncmp(reply,&quot;+FULLRESYNC&quot;,11)) {</span></span>
<span class="line"><span>   …</span></span>
<span class="line"><span>   return PSYNC_FULLRESYNC;</span></span>
<span class="line"><span>   }</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>  //主库返回CONTINUE，执行增量复制</span></span>
<span class="line"><span>  if (!strncmp(reply,&quot;+ CONTINUE&quot;,11)) {</span></span>
<span class="line"><span>	…</span></span>
<span class="line"><span>	return PSYNC_CONTINUE;</span></span>
<span class="line"><span>   }</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>  //主库返回错误信息</span></span>
<span class="line"><span>  if (strncmp(reply,&quot;-ERR&quot;,4)) {</span></span>
<span class="line"><span>     …</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return PSYNC_NOT_SUPPORTED;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>因为slaveTryPartialResynchronization是在syncWithMaster函数中调用的，当该函数返回PSYNC命令不同的结果时，syncWithMaster函数就会根据结果值执行不同处理。<br> 其中，值得关注的是<strong>全量复制</strong>，当主库对从库的PSYNC命令返回FULLRESYNC时，从库会在和主库的网络连接上注册readSyncBulkPayload回调函数，并将状态机置为<strong>REPL_STATE_TRANSFER</strong>，表示开始进行实际的数据同步，比如主库把RDB文件传输给从库。</p><div class="language-plain vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>//读取PSYNC命令的返回结果</span></span>
<span class="line"><span>psync_result = slaveTryPartialResynchronization(fd,1);</span></span>
<span class="line"><span>//PSYNC结果还没有返回，先从syncWithMaster函数返回处理其他操作</span></span>
<span class="line"><span>if (psync_result == PSYNC_WAIT_REPLY) return;</span></span>
<span class="line"><span>//如果PSYNC结果是PSYNC_CONTINUE，从syncWithMaster函数返回，后续执行增量复制</span></span>
<span class="line"><span>if (psync_result == PSYNC_CONTINUE) {</span></span>
<span class="line"><span>       …</span></span>
<span class="line"><span>       return;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>//如果执行全量复制的话，针对连接上的读事件，创建readSyncBulkPayload回调函数</span></span>
<span class="line"><span>if (aeCreateFileEvent(server.el,fd, AE_READABLE,readSyncBulkPayload,NULL)</span></span>
<span class="line"><span>            == AE_ERR)</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>       …</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>//将从库状态机置为REPL_STATE_TRANSFER</span></span>
<span class="line"><span>    server.repl_state = REPL_STATE_TRANSFER;</span></span></code></pre></div><p>好了，到这里，我们就学习了从库在复制类型判断和执行阶段的状态机变迁。我把主从复制各阶段的状态变迁整合在一起，画了下面这张图，以便你更好地掌握。</p><p><img src="https://static001.geekbang.org/resource/image/f6/97/f6e25eb125f0d70694d92597dca3e197.jpg?wh=1920x1080" alt="图片" loading="lazy" referrerpolicy="no-referrer"></p><h2 id="小结" tabindex="-1">小结 <a class="header-anchor" href="#小结" aria-label="Permalink to &quot;小结&quot;">&amp;ZeroWidthSpace;</a></h2><p>主从复制是Redis、MySQL等数据库或存储系统，用来实现高可用性的方法。要实现主从复制，则需要应对整个过程中Redis在不同状态下的各种处理逻辑，因此，如何正确实现主从复制，并且不遗漏可能的状态，是我们在实际开发中需要面对的问题。</p><p>这节课我们学习了Redis主从复制的设计思想与实现方法。Redis采用了<strong>状态机驱动</strong>的方法，为从库实例设置状态变量。在整个复制过程中，代码逻辑会根据从库状态机的变迁，处理不同状态下的情况。</p><p>为了便于你掌握主从复制的实现，我将整个过程分解成四个阶段：初始化、建立连接、主从握手、复制类型判断与执行。在每个阶段中，从库的状态会不断变化，完成和主库建立网络连接、交换配置信息、发送同步命令，并根据主库对同步请求的返回结果，执行全量同步或增量同步。</p><p>状态机驱动的设计方法是一种通用的设计方法，在涉及网络通信的场景中应用广泛。Redis对主从复制的实现为我们提供了良好的参考示例，当你需要自行设计和实现网络功能时，就可以把状态机驱动的方法使用起来。</p><h2 id="每课一问" tabindex="-1">每课一问 <a class="header-anchor" href="#每课一问" aria-label="Permalink to &quot;每课一问&quot;">&amp;ZeroWidthSpace;</a></h2><p>这节课我们介绍的状态机是当实例为从库时会使用的。那么，当一个实例是主库时，为什么不需要使用一个状态机来实现主库在主从复制时的流程流转呢？ 精选留言（4） Kaito 👍（30） 💬（0）1、Redis 主从复制分为 4 个阶段：</p><ul><li>初始化</li><li>建立连接</li><li>主从握手</li><li>数据传输（全量/增量复制）</li></ul><p>2、主从复制流程由于是是「从库」发起的，所以重点要看从库的执行流程</p><p>3、从库发起复制的方式有 3 个：</p><ul><li>执行 slaveof / replicaof 命令</li><li>配置文件配置了主库的 ip port</li><li>启动实例时指定了主库的 ip port</li></ul><p>4、建议从 slaveof / replicaof 命令跟源码进去，来看整个主从复制的流程（入口在 replication.c 的 replicaofCommand 函数）</p><p>5、从库执行这个命令后，会先在 server 结构体上，记录主库的 ip port，然后把 server.repl_state 从 REPL_STATE_NONE 改为 REPL_STATE_CONNECT，「复制状态机」启动</p><p>6、随后从库会在定时任务（server.c 的 serverCron 函数）中会检测 server.repl_state 的状态，然后向主库发起复制请求（replication.c 的 replicationCron 函数），进入复制流程（replication.c 的 connectWithMaster 函数）</p><p>7、从库会与主库建立连接（REPL_STATE_CONNECTING），注册读事件（syncWithMaster 函数），之后主从进入握手认证阶段，从库会告知主库自己的 ip port 等信息，在这期间会流转多个状态（server.h 中定义的复制状态）：</p><p>#define REPL_STATE_RECEIVE_PONG 3 /* Wait for PING reply <em>/ #define REPL_STATE_SEND_AUTH 4 /</em> Send AUTH to master <em>/ #define REPL_STATE_RECEIVE_AUTH 5 /</em> Wait for AUTH reply <em>/ #define REPL_STATE_SEND_PORT 6 /</em> Send REPLCONF listening-port <em>/ #define REPL_STATE_RECEIVE_PORT 7 /</em> Wait for REPLCONF reply <em>/ #define REPL_STATE_SEND_IP 8 /</em> Send REPLCONF ip-address <em>/ #define REPL_STATE_RECEIVE_IP 9 /</em> Wait for REPLCONF reply <em>/ #define REPL_STATE_SEND_CAPA 10 /</em> Send REPLCONF capa <em>/ #define REPL_STATE_RECEIVE_CAPA 11 /</em> Wait for REPLCONF reply */</p><p>8、完成握手后，从库向主库发送 PSYNC 命令和自己的 offset，首先尝试「增量同步」，如果 offset = -1，主库返回 FULLRESYNC 表示「全量同步」数据，否则返回 CONTINUE 增量同步</p><p>9、如果是全量同步，主库会先生成 RDB，从库等待，主库完成 RDB 后发给从库，从库接收 RDB，然后清空实例数据，加载 RDB，之后读取主库发来的「增量」数据</p><p>10、如果是增量同步，从库只需接收主库传来的增量数据即可</p><p>课后题：当一个实例是主库时，为什么不需要使用状态机来实现主库在主从复制时的流程流转？</p><p>因为复制数据的发起方是从库，从库要求复制数据会经历多个阶段（发起连接、握手认证、请求数据），而主库只需要「被动」接收从库的请求，根据需要「响应数据」即可完成整个流程，所以主库不需要状态机流转。2021-09-21曾轼麟 👍（12） 💬（0）首先回答老师的问题：主库为什么不需要状态机？ 在整个复制同步的过程中，我们理解整个流程是这样的：从库初始化-&gt;从库发起建立连接-&gt;主从握手-&gt;复制类型判断与执行，整个流程中会有以下几个特点和场景: 1、整个流程中，发起方本身是从库。 2、主库无需知道每个从库的所属的环节和状态（响应式）。 3、主库随时可能会因为灾备切换（状态丢失）。</p><p>那么如果主库维护了状态机，那么会出现一下几个问题需要处理： 1、主库的状态机是否需要灾备转移？ 2、主库需要给每个从库的client维护一个状态机进行冗余。</p><p>综合来说，主库增加状态机在功能上没办法带来较大的优化，还有可能会带来一些不必要的问题，所以主库没必要维护一套状态机。</p><p>总结： 本篇文章老师主要介绍了主从复制中，基于状态机的实现。在大多中间件，如kafka也是有多套状态机实现的，其主要的目的有以下几个点： 1、维护众多状态的先后顺序和扭转变化逻辑 2、确定状态的边界（有多少种状态） 3、维护当前状态。</p><p>在5.0以及之前Redis版本中状态是统一维护在server.h文件中的宏定义里面的，如下所示： #define REPL_STATE_NONE 0 /* No active replication <em>/ #define REPL_STATE_CONNECT 1 /</em> Must connect to master <em>/ #define REPL_STATE_CONNECTING 2 /</em> Connecting to master <em>/ /</em> --- Handshake states, must be ordered --- <em>/ #define REPL_STATE_RECEIVE_PONG 3 /</em> Wait for PING reply <em>/ #define REPL_STATE_SEND_AUTH 4 /</em> Send AUTH to master <em>/ #define REPL_STATE_RECEIVE_AUTH 5 /</em> Wait for AUTH reply */ 等等.....</p><p>而在之后的版本中，维护了类似repl_state这样一套状态枚举 typedef enum { REPL_STATE_NONE = 0, /* No active replication <em>/ REPL_STATE_CONNECT, /</em> Must connect to master <em>/ REPL_STATE_CONNECTING, /</em> Connecting to master <em>/ /</em> --- Handshake states, must be ordered --- <em>/ REPL_STATE_RECEIVE_PING_REPLY, /</em> Wait for PING reply <em>/ REPL_STATE_SEND_HANDSHAKE, /</em> Send handshake sequence to master <em>/ REPL_STATE_RECEIVE_AUTH_REPLY, /</em> Wait for AUTH reply <em>/ REPL_STATE_RECEIVE_PORT_REPLY, /</em> Wait for REPLCONF reply <em>/ REPL_STATE_RECEIVE_IP_REPLY, /</em> Wait for REPLCONF reply <em>/ REPL_STATE_RECEIVE_CAPA_REPLY, /</em> Wait for REPLCONF reply <em>/ REPL_STATE_SEND_PSYNC, /</em> Send PSYNC <em>/ REPL_STATE_RECEIVE_PSYNC_REPLY, /</em> Wait for PSYNC reply <em>/ /</em> --- End of handshake states --- <em>/ REPL_STATE_TRANSFER, /</em> Receiving .rdb from master <em>/ REPL_STATE_CONNECTED, /</em> Connected to master */ } repl_state;2021-09-22夏天 👍（2） 💬（2）补充几点：</p><p>1.增量同步，主库在每次执行完命令后，会将命令写到 buf 中。由 replicationCron 中的 replicationFeedSlaves，每 100ms 发送一次。2022-02-19lhgdy 👍（0） 💬（3）为什么需要上报 ip 和端口？ 按说服务端是可以通过 fd 获取对端的 ip 和端口的？2021-09-22</p>`,88)])])}const T=n(t,[["render",i]]);export{_ as __pageData,T as default};
