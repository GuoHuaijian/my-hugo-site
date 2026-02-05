import{_ as a,o as i,c as n,ae as p}from"./chunks/framework.Iv6F95cJ.js";const c=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/left-ear/109 - Go编程模式：Functional Options.md","filePath":"books/left-ear/109 - Go编程模式：Functional Options.md"}'),l={name:"books/left-ear/109 - Go编程模式：Functional Options.md"};function t(e,s,h,k,r,d){return i(),n("div",null,[...s[0]||(s[0]=[p(`<p>你好，我是陈皓，网名左耳朵耗子。</p><p>这节课，我们来讨论一下Functional Options这个编程模式。这是一个函数式编程的应用案例，编程技巧也很好，是目前Go语言中最流行的一种编程模式。</p><p>但是，在正式讨论这个模式之前，我们先来看看要解决什么样的问题。</p><h2 id="配置选项问题" tabindex="-1">配置选项问题 <a class="header-anchor" href="#配置选项问题" aria-label="Permalink to &quot;配置选项问题&quot;">&amp;ZeroWidthSpace;</a></h2><p>在编程中，我们经常需要对一个对象（或是业务实体）进行相关的配置。比如下面这个业务实体（注意，这只是一个示例）：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type Server struct {</span></span>
<span class="line"><span>    Addr     string</span></span>
<span class="line"><span>    Port     int</span></span>
<span class="line"><span>    Protocol string</span></span>
<span class="line"><span>    Timeout  time.Duration</span></span>
<span class="line"><span>    MaxConns int</span></span>
<span class="line"><span>    TLS      *tls.Config</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>在这个 <code>Server</code> 对象中，我们可以看到：</p><ul><li>要有侦听的IP地址 <code>Addr</code> 和端口号 <code>Port</code> ，这两个配置选项是必填的（当然，IP地址和端口号都可以有默认值，不过这里我们用于举例，所以是没有默认值，而且不能为空，需要是必填的）。</li><li>然后，还有协议 <code>Protocol</code> 、 <code>Timeout</code> 和<code>MaxConns</code> 字段，这几个字段是不能为空的，但是有默认值的，比如，协议是TCP，超时<code>30</code>秒 和 最大链接数<code>1024</code>个。</li><li>还有一个 <code>TLS</code> ，这个是安全链接，需要配置相关的证书和私钥。这个是可以为空的。</li></ul><p>所以，针对这样的配置，我们需要有多种不同的创建不同配置 <code>Server</code> 的函数签名，如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>func NewDefaultServer(addr string, port int) (*Server, error) {</span></span>
<span class="line"><span>  return &amp;Server{addr, port, &quot;tcp&quot;, 30 * time.Second, 100, nil}, nil</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func NewTLSServer(addr string, port int, tls *tls.Config) (*Server, error) {</span></span>
<span class="line"><span>  return &amp;Server{addr, port, &quot;tcp&quot;, 30 * time.Second, 100, tls}, nil</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func NewServerWithTimeout(addr string, port int, timeout time.Duration) (*Server, error) {</span></span>
<span class="line"><span>  return &amp;Server{addr, port, &quot;tcp&quot;, timeout, 100, nil}, nil</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func NewTLSServerWithMaxConnAndTimeout(addr string, port int, maxconns int, timeout time.Duration, tls *tls.Config) (*Server, error) {</span></span>
<span class="line"><span>  return &amp;Server{addr, port, &quot;tcp&quot;, 30 * time.Second, maxconns, tls}, nil</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>因为Go语言不支持重载函数，所以，你得用不同的函数名来应对不同的配置选项。</p><h2 id="配置对象方案" tabindex="-1">配置对象方案 <a class="header-anchor" href="#配置对象方案" aria-label="Permalink to &quot;配置对象方案&quot;">&amp;ZeroWidthSpace;</a></h2><p>要解决这个问题，最常见的方式是使用一个配置对象，如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type Config struct {</span></span>
<span class="line"><span>    Protocol string</span></span>
<span class="line"><span>    Timeout  time.Duration</span></span>
<span class="line"><span>    Maxconns int</span></span>
<span class="line"><span>    TLS      *tls.Config</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们把那些非必输的选项都移到一个结构体里，这样一来， <code>Server</code> 对象就会变成：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type Server struct {</span></span>
<span class="line"><span>    Addr string</span></span>
<span class="line"><span>    Port int</span></span>
<span class="line"><span>    Conf *Config</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>于是，我们就只需要一个 <code>NewServer()</code> 的函数了，在使用前需要构造 <code>Config</code> 对象。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>func NewServer(addr string, port int, conf *Config) (*Server, error) {</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>//Using the default configuratrion</span></span>
<span class="line"><span>srv1, _ := NewServer(&quot;localhost&quot;, 9000, nil) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>conf := ServerConfig{Protocol:&quot;tcp&quot;, Timeout: 60*time.Duration}</span></span>
<span class="line"><span>srv2, _ := NewServer(&quot;locahost&quot;, 9000, &amp;conf)</span></span></code></pre></div><p>这段代码算是不错了，大多数情况下，我们可能就止步于此了。但是，对于有洁癖的、有追求的程序员来说，他们会看到其中不太好的一点，那就是<code>Config</code> 并不是必需的，所以，你需要判断是否是 <code>nil</code> 或是 Empty—— <code>Config{}</code>会让我们的代码感觉不太干净。</p><h2 id="builder模式" tabindex="-1">Builder模式 <a class="header-anchor" href="#builder模式" aria-label="Permalink to &quot;Builder模式&quot;">&amp;ZeroWidthSpace;</a></h2><p>如果你是一个Java程序员，熟悉设计模式的一定会很自然地使用Builder模式。比如下面的代码：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>User user = new User.Builder()</span></span>
<span class="line"><span>  .name(&quot;Hao Chen&quot;)</span></span>
<span class="line"><span>  .email(&quot;haoel@hotmail.com&quot;)</span></span>
<span class="line"><span>  .nickname(&quot;左耳朵&quot;)</span></span>
<span class="line"><span>  .build();</span></span></code></pre></div><p>仿照这个模式，我们可以把刚刚的代码改写成下面的样子（注：下面的代码没有考虑出错处理，其中关于出错处理的更多内容，你可以再回顾下<a href="https://time.geekbang.org/column/article/332602" target="_blank" rel="noreferrer">上节课</a>）：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>//使用一个builder类来做包装</span></span>
<span class="line"><span>type ServerBuilder struct {</span></span>
<span class="line"><span>  Server</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (sb *ServerBuilder) Create(addr string, port int) *ServerBuilder {</span></span>
<span class="line"><span>  sb.Server.Addr = addr</span></span>
<span class="line"><span>  sb.Server.Port = port</span></span>
<span class="line"><span>  //其它代码设置其它成员的默认值</span></span>
<span class="line"><span>  return sb</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (sb *ServerBuilder) WithProtocol(protocol string) *ServerBuilder {</span></span>
<span class="line"><span>  sb.Server.Protocol = protocol </span></span>
<span class="line"><span>  return sb</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (sb *ServerBuilder) WithMaxConn( maxconn int) *ServerBuilder {</span></span>
<span class="line"><span>  sb.Server.MaxConns = maxconn</span></span>
<span class="line"><span>  return sb</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (sb *ServerBuilder) WithTimeOut( timeout time.Duration) *ServerBuilder {</span></span>
<span class="line"><span>  sb.Server.Timeout = timeout</span></span>
<span class="line"><span>  return sb</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (sb *ServerBuilder) WithTLS( tls *tls.Config) *ServerBuilder {</span></span>
<span class="line"><span>  sb.Server.TLS = tls</span></span>
<span class="line"><span>  return sb</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func (sb *ServerBuilder) Build() (Server) {</span></span>
<span class="line"><span>  return  sb.Server</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这样一来，就可以使用这样的方式了：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>sb := ServerBuilder{}</span></span>
<span class="line"><span>server, err := sb.Create(&quot;127.0.0.1&quot;, 8080).</span></span>
<span class="line"><span>  WithProtocol(&quot;udp&quot;).</span></span>
<span class="line"><span>  WithMaxConn(1024).</span></span>
<span class="line"><span>  WithTimeOut(30*time.Second).</span></span>
<span class="line"><span>  Build()</span></span></code></pre></div><p>这种方式也很清楚，不需要额外的Config类，使用链式的函数调用的方式来构造一个对象，只需要多加一个Builder类。你可能会觉得，这个Builder类似乎有点多余，我们似乎可以直接在<code>Server</code> 上进行这样的 Builder 构造，的确是这样的。但是，在处理错误的时候可能就有点麻烦，不如一个包装类更好一些。</p><p>如果我们想省掉这个包装的结构体，就要请出Functional Options上场了：函数式编程。</p><h2 id="functional-options" tabindex="-1">Functional Options <a class="header-anchor" href="#functional-options" aria-label="Permalink to &quot;Functional Options&quot;">&amp;ZeroWidthSpace;</a></h2><p>首先，我们定义一个函数类型：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type Option func(*Server)</span></span></code></pre></div><p>然后，我们可以使用函数式的方式定义一组如下的函数：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>func Protocol(p string) Option {</span></span>
<span class="line"><span>    return func(s *Server) {</span></span>
<span class="line"><span>        s.Protocol = p</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>func Timeout(timeout time.Duration) Option {</span></span>
<span class="line"><span>    return func(s *Server) {</span></span>
<span class="line"><span>        s.Timeout = timeout</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>func MaxConns(maxconns int) Option {</span></span>
<span class="line"><span>    return func(s *Server) {</span></span>
<span class="line"><span>        s.MaxConns = maxconns</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>func TLS(tls *tls.Config) Option {</span></span>
<span class="line"><span>    return func(s *Server) {</span></span>
<span class="line"><span>        s.TLS = tls</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这组代码传入一个参数，然后返回一个函数，返回的这个函数会设置自己的 <code>Server</code> 参数。例如，当我们调用其中的一个函数 <code>MaxConns(30)</code> 时，其返回值是一个 <code>func(s* Server) { s.MaxConns = 30 }</code> 的函数。</p><p>这个叫高阶函数。在数学上，这有点像是计算长方形面积的公式为： <code>rect(width, height) = width * height;</code> 这个函数需要两个参数，我们包装一下，就可以变成计算正方形面积的公式：<code>square(width) = rect(width, width)</code> 。也就是说，<code>squre(width)</code>返回了另外一个函数，这个函数就是<code>rect(w,h)</code> ，只不过它的两个参数是一样的，即：<code>f(x) = g(x, x)</code>。</p><p>好了，现在我们再定一个 <code>NewServer()</code>的函数，其中，有一个可变参数 <code>options</code> ，它可以传出多个上面的函数，然后使用一个for-loop来设置我们的 <code>Server</code> 对象。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>func NewServer(addr string, port int, options ...func(*Server)) (*Server, error) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  srv := Server{</span></span>
<span class="line"><span>    Addr:     addr,</span></span>
<span class="line"><span>    Port:     port,</span></span>
<span class="line"><span>    Protocol: &quot;tcp&quot;,</span></span>
<span class="line"><span>    Timeout:  30 * time.Second,</span></span>
<span class="line"><span>    MaxConns: 1000,</span></span>
<span class="line"><span>    TLS:      nil,</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  for _, option := range options {</span></span>
<span class="line"><span>    option(&amp;srv)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //...</span></span>
<span class="line"><span>  return &amp;srv, nil</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>于是，我们在创建 <code>Server</code> 对象的时候，就可以像下面这样：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>s1, _ := NewServer(&quot;localhost&quot;, 1024)</span></span>
<span class="line"><span>s2, _ := NewServer(&quot;localhost&quot;, 2048, Protocol(&quot;udp&quot;))</span></span>
<span class="line"><span>s3, _ := NewServer(&quot;0.0.0.0&quot;, 8080, Timeout(300*time.Second), MaxConns(1000))</span></span></code></pre></div><p>怎么样，是不是高度整洁和优雅？这不但解决了“使用 <code>Config</code> 对象方式的需要有一个config参数，但在不需要的时候，是放 <code>nil</code> 还是放 <code>Config{}</code>”的选择困难问题，也不需要引用一个Builder的控制对象，直接使用函数式编程，在代码阅读上也很优雅。</p><p>所以，以后，你要玩类似的代码时，我强烈推荐你使用Functional Options这种方式，这种方式至少带来了6个好处：</p><ul><li>直觉式的编程；</li><li>高度的可配置化；</li><li>很容易维护和扩展；</li><li>自文档；</li><li>新来的人很容易上手；</li><li>没有什么令人困惑的事（是nil 还是空）。</li></ul><h2 id="参考文档" tabindex="-1">参考文档 <a class="header-anchor" href="#参考文档" aria-label="Permalink to &quot;参考文档&quot;">&amp;ZeroWidthSpace;</a></h2><ul><li><a href="http://commandcenter.blogspot.com.au/2014/01/self-referential-functions-and-design.html" target="_blank" rel="noreferrer">Self referential functions and design</a>， by Rob Pike</li></ul><p>好了，这节课就到这里。如果你觉得今天的内容对你有所帮助，欢迎你帮我分享给更多人。 精选留言（15） 汪辉 👍（9） 💬（0）之前看到mq的初始化可选配置的时候有用到Functional Options这个模式，没想到在这里找到源头了。2021-01-19Geek_a754be 👍（7） 💬（1）之前在公司自研的微服务框架里面看到大规模使用，原来有个学名叫Functional Options2021-02-09萧 👍（3） 💬（0）太强了，受益匪浅2021-02-18后青春期的Keats 👍（0） 💬（0）雅，太雅了 必要参数放在入参列表，非必要参数以函数式编程可变参的形式传入。2024-08-29紫陌桑田 👍（0） 💬（0）各种初始化对象时用的特别多，相比于 builder 模式，省了不少代码，而且更为优雅2024-07-11Geek_sevn 👍（0） 💬（0）如沐春风2023-07-30辰星 👍（0） 💬（0）太强了2022-12-04拉欧 👍（0） 💬（0）option 意味选项，本身就有函数的意思2022-04-14Geek_Huahui 👍（0） 💬（0）真的牛逼2022-03-14今年也没有猫 👍（0） 💬（0）简单理解 就是一种闭包的组织形式。2022-02-04方勇(gopher) 👍（0） 💬（0）确实很多中间件的传参都这么设计，有时候可能要考虑，函数放在client端，还是server端2021-12-17青阳 👍（0） 💬（0）和函数科里化是一回事吗2021-11-12图个啥呢 👍（0） 💬（0）厉害了！2021-06-25👻 小二 👍（0） 💬（0）这种接口也很友好， 就是苦了作者</p><div class="language-go vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">package</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quot;crypto</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">#</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">47</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;tls</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quot;time</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Option</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	Timeout </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Duration</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	TLS     </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tls</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Config</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">option </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Option</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SetTimeOut</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">timeout</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Duration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Option</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	option.Timeout </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">amp;timeout</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> option</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">option </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Option</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SetTLS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">tls</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tls</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Option</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	option.TLS </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> tls</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> option</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MergeOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ...*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Option</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Option</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">#</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">47</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">#</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">47</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;把option合并起来</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nil</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Server</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	Addr    </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	Port    </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	Timeout </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Duration</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	TLS     </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tls</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Config</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NewOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Option</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Option</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NewServer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">addr</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">port</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ...*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Option</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Server</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	srv </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Server</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		Addr:    addr,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		Port:    port,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		Timeout: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">30</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> time.Second,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		TLS:     </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	op </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MergeOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> op.Timeout </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		srv.Timeout </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">op.Timeout</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> op.TLS </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		srv.TLS </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> op.TLS</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">#</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">47</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">#</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">47</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">amp;srv, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">nil</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	_, _ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NewServer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quot;</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">127.0.0.1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quot;, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">80</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	_, _ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NewServer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quot;</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">127.0.0.1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quot;, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">80</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">NewOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SetTimeOut</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	_, _ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NewServer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quot;</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">127.0.0.1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quot;, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">80</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">NewOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SetTimeOut</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SetTLS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`&lt;/p&gt;2021-06-10&lt;/li&gt;&lt;br/&gt;&lt;li&gt;&lt;span&gt;轻飘飘过&lt;/span&gt; 👍（0） 💬（0）&lt;p&gt;对比js的...解构和函数式编程的compose?&lt;/p&gt;2021-05-20&lt;/li&gt;&lt;br/&gt;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&lt;/ul&gt;</span></span></code></pre></div>`,46)])])}const E=a(l,[["render",t]]);export{c as __pageData,E as default};
