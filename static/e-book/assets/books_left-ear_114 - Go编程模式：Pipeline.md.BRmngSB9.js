import{_ as a,o as s,c as p,ae as e}from"./chunks/framework.Iv6F95cJ.js";const d=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/left-ear/114 - Go编程模式：Pipeline.md","filePath":"books/left-ear/114 - Go编程模式：Pipeline.md"}'),l={name:"books/left-ear/114 - Go编程模式：Pipeline.md"};function i(t,n,c,o,r,h){return s(),p("div",null,[...n[0]||(n[0]=[e(`<p>你好，我是陈皓，网名左耳朵耗子。</p><p>这节课，我着重介绍一下Go编程中的Pipeline模式。对于Pipeline，用过Unix/Linux命令行的人都不会陌生，<strong>它是一种把各种命令拼接起来完成一个更强功能的技术方法</strong>。</p><p>现在的流式处理、函数式编程、应用网关对微服务进行简单的API编排，其实都是受Pipeline这种技术方式的影响。Pipeline可以很容易地把代码按单一职责的原则拆分成多个高内聚低耦合的小模块，然后轻松地把它们拼装起来，去完成比较复杂的功能。</p><h2 id="http-处理" tabindex="-1">HTTP 处理 <a class="header-anchor" href="#http-处理" aria-label="Permalink to &quot;HTTP 处理&quot;">&amp;ZeroWidthSpace;</a></h2><p>这种Pipeline的模式，我在<a href="https://time.geekbang.org/column/article/332608" target="_blank" rel="noreferrer">上节课</a>中有过一个示例，我们再复习一下。</p><p>上节课，我们有很多 <code>WithServerHead()</code> 、<code>WithBasicAuth()</code> 、<code>WithDebugLog()</code>这样的小功能代码，在需要实现某个HTTP API 的时候，我们就可以很轻松地把它们组织起来。</p><p>原来的代码是下面这个样子：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>http.HandleFunc(&quot;/v1/hello&quot;, WithServerHeader(WithAuthCookie(hello)))</span></span>
<span class="line"><span>http.HandleFunc(&quot;/v2/hello&quot;, WithServerHeader(WithBasicAuth(hello)))</span></span>
<span class="line"><span>http.HandleFunc(&quot;/v3/hello&quot;, WithServerHeader(WithBasicAuth(WithDebugLog(hello))))</span></span></code></pre></div><p>通过一个代理函数：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type HttpHandlerDecorator func(http.HandlerFunc) http.HandlerFunc</span></span>
<span class="line"><span>func Handler(h http.HandlerFunc, decors ...HttpHandlerDecorator) http.HandlerFunc {</span></span>
<span class="line"><span>    for i := range decors {</span></span>
<span class="line"><span>        d := decors[len(decors)-1-i] // iterate in reverse</span></span>
<span class="line"><span>        h = d(h)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return h</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们就可以移除不断的嵌套，像下面这样使用了：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>http.HandleFunc(&quot;/v4/hello&quot;, Handler(hello,</span></span>
<span class="line"><span>                WithServerHeader, WithBasicAuth, WithDebugLog))</span></span></code></pre></div><h2 id="channel-管理" tabindex="-1">Channel 管理 <a class="header-anchor" href="#channel-管理" aria-label="Permalink to &quot;Channel 管理&quot;">&amp;ZeroWidthSpace;</a></h2><p>当然，如果你要写出一个<a href="https://coolshell.cn/articles/17929.html#%E6%B3%9B%E5%9E%8B%E7%9A%84%E4%BF%AE%E9%A5%B0%E5%99%A8" target="_blank" rel="noreferrer">泛型的Pipeline框架</a>并不容易，可以使用<a href="https://coolshell.cn/articles/21179.html" target="_blank" rel="noreferrer">Go Generation</a>实现，但是，我们别忘了，Go语言最具特色的 Go Routine 和 Channel 这两个神器完全可以用来构造这种编程。</p><p>Rob Pike在 <a href="https://blog.golang.org/pipelines" target="_blank" rel="noreferrer">Go Concurrency Patterns: Pipelines and cancellation</a> 这篇博客中介绍了一种编程模式，下面我们来学习下。</p><h3 id="channel转发函数" tabindex="-1">Channel转发函数 <a class="header-anchor" href="#channel转发函数" aria-label="Permalink to &quot;Channel转发函数&quot;">&amp;ZeroWidthSpace;</a></h3><p>首先，我们需要一个 <code>echo()</code>函数，它会把一个整型数组放到一个Channel中，并返回这个Channel。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>func echo(nums []int) &lt;-chan int {</span></span>
<span class="line"><span>  out := make(chan int)</span></span>
<span class="line"><span>  go func() {</span></span>
<span class="line"><span>    for _, n := range nums {</span></span>
<span class="line"><span>      out &lt;- n</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    close(out)</span></span>
<span class="line"><span>  }()</span></span>
<span class="line"><span>  return out</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>然后，我们依照这个模式，就可以写下下面的函数。</p><h3 id="平方函数" tabindex="-1">平方函数 <a class="header-anchor" href="#平方函数" aria-label="Permalink to &quot;平方函数&quot;">&amp;ZeroWidthSpace;</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>func sq(in &lt;-chan int) &lt;-chan int {</span></span>
<span class="line"><span>  out := make(chan int)</span></span>
<span class="line"><span>  go func() {</span></span>
<span class="line"><span>    for n := range in {</span></span>
<span class="line"><span>      out &lt;- n * n</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    close(out)</span></span>
<span class="line"><span>  }()</span></span>
<span class="line"><span>  return out</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="过滤奇数函数" tabindex="-1">过滤奇数函数 <a class="header-anchor" href="#过滤奇数函数" aria-label="Permalink to &quot;过滤奇数函数&quot;">&amp;ZeroWidthSpace;</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>func odd(in &lt;-chan int) &lt;-chan int {</span></span>
<span class="line"><span>  out := make(chan int)</span></span>
<span class="line"><span>  go func() {</span></span>
<span class="line"><span>    for n := range in {</span></span>
<span class="line"><span>      if n%2 != 0 {</span></span>
<span class="line"><span>        out &lt;- n</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    close(out)</span></span>
<span class="line"><span>  }()</span></span>
<span class="line"><span>  return out</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="求和函数" tabindex="-1">求和函数 <a class="header-anchor" href="#求和函数" aria-label="Permalink to &quot;求和函数&quot;">&amp;ZeroWidthSpace;</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>func sum(in &lt;-chan int) &lt;-chan int {</span></span>
<span class="line"><span>  out := make(chan int)</span></span>
<span class="line"><span>  go func() {</span></span>
<span class="line"><span>    var sum = 0</span></span>
<span class="line"><span>    for n := range in {</span></span>
<span class="line"><span>      sum += n</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    out &lt;- sum</span></span>
<span class="line"><span>    close(out)</span></span>
<span class="line"><span>  }()</span></span>
<span class="line"><span>  return out</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>用户端的代码如下所示（注：你可能会觉得，sum()，odd() 和 sq()太过于相似，其实，你可以通过Map/Reduce编程模式或者是Go Generation的方式合并一下）：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>var nums = []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}</span></span>
<span class="line"><span>for n := range sum(sq(odd(echo(nums)))) {</span></span>
<span class="line"><span>  fmt.Println(n)</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>上面的代码类似于我们执行了Unix/Linux命令： <code>echo $nums | sq | sum</code>。同样，如果你不想有那么多的函数嵌套，就可以使用一个代理函数来完成。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>type EchoFunc func ([]int) (&lt;- chan int) </span></span>
<span class="line"><span>type PipeFunc func (&lt;- chan int) (&lt;- chan int) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>func pipeline(nums []int, echo EchoFunc, pipeFns ... PipeFunc) &lt;- chan int {</span></span>
<span class="line"><span>  ch  := echo(nums)</span></span>
<span class="line"><span>  for i := range pipeFns {</span></span>
<span class="line"><span>    ch = pipeFns[i](ch)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return ch</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>然后，就可以这样做了：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>var nums = []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}    </span></span>
<span class="line"><span>for n := range pipeline(nums, gen, odd, sq, sum) {</span></span>
<span class="line"><span>    fmt.Println(n)</span></span>
<span class="line"><span>  }</span></span></code></pre></div><h2 id="fan-in-out" tabindex="-1">Fan in/Out <a class="header-anchor" href="#fan-in-out" aria-label="Permalink to &quot;Fan in/Out&quot;">&amp;ZeroWidthSpace;</a></h2><p><strong>动用Go语言的 Go Routine和 Channel还有一个好处，就是可以写出1对多，或多对1的Pipeline，也就是Fan In/ Fan Out</strong>。下面，我们来看一个Fan in的示例。</p><p>假设我们要通过并发的方式对一个很长的数组中的质数进行求和运算，我们想先把数组分段求和，然后再把它们集中起来。</p><p>下面是我们的主函数：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>func makeRange(min, max int) []int {</span></span>
<span class="line"><span>  a := make([]int, max-min+1)</span></span>
<span class="line"><span>  for i := range a {</span></span>
<span class="line"><span>    a[i] = min + i</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return a</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func main() {</span></span>
<span class="line"><span>  nums := makeRange(1, 10000)</span></span>
<span class="line"><span>  in := echo(nums)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  const nProcess = 5</span></span>
<span class="line"><span>  var chans [nProcess]&lt;-chan int</span></span>
<span class="line"><span>  for i := range chans {</span></span>
<span class="line"><span>    chans[i] = sum(prime(in))</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  for n := range sum(merge(chans[:])) {</span></span>
<span class="line"><span>    fmt.Println(n)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>再看我们的 <code>prime()</code> 函数的实现 ：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>func is_prime(value int) bool {</span></span>
<span class="line"><span>  for i := 2; i &lt;= int(math.Floor(float64(value) / 2)); i++ {</span></span>
<span class="line"><span>    if value%i == 0 {</span></span>
<span class="line"><span>      return false</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return value &gt; 1</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func prime(in &lt;-chan int) &lt;-chan int {</span></span>
<span class="line"><span>  out := make(chan int)</span></span>
<span class="line"><span>  go func ()  {</span></span>
<span class="line"><span>    for n := range in {</span></span>
<span class="line"><span>      if is_prime(n) {</span></span>
<span class="line"><span>        out &lt;- n</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    close(out)</span></span>
<span class="line"><span>  }()</span></span>
<span class="line"><span>  return out</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我来简单解释下这段代码。</p><ul><li>首先，我们制造了从1到10000的数组；</li><li>然后，把这堆数组全部 <code>echo</code>到一个Channel里—— <code>in</code>；</li><li>此时，生成 5 个 Channel，接着都调用 <code>sum(prime(in))</code> ，于是，每个Sum的Go Routine都会开始计算和；</li><li>最后，再把所有的结果再求和拼起来，得到最终的结果。</li></ul><p>其中的merge代码如下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>func merge(cs []&lt;-chan int) &lt;-chan int {</span></span>
<span class="line"><span>  var wg sync.WaitGroup</span></span>
<span class="line"><span>  out := make(chan int)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  wg.Add(len(cs))</span></span>
<span class="line"><span>  for _, c := range cs {</span></span>
<span class="line"><span>    go func(c &lt;-chan int) {</span></span>
<span class="line"><span>      for n := range c {</span></span>
<span class="line"><span>        out &lt;- n</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      wg.Done()</span></span>
<span class="line"><span>    }(c)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  go func() {</span></span>
<span class="line"><span>    wg.Wait()</span></span>
<span class="line"><span>    close(out)</span></span>
<span class="line"><span>  }()</span></span>
<span class="line"><span>  return out</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>整个程序的结构如下图所示：</p><p><img src="https://static001.geekbang.org/resource/image/f9/b3/f9d2b599620d5bc191194ff239f0a1b3.jpg?wh=3875%2A2250" alt="" loading="lazy" referrerpolicy="no-referrer"></p><h2 id="参考文档" tabindex="-1">参考文档 <a class="header-anchor" href="#参考文档" aria-label="Permalink to &quot;参考文档&quot;">&amp;ZeroWidthSpace;</a></h2><p>如果你还想了解更多类似的与并发相关的技术，我再给你推荐一些资源：</p><ul><li><a href="https://www.youtube.com/watch?v=f6kdp27TYZs" target="_blank" rel="noreferrer">Go Concurrency Patterns – Rob Pike – 2012 Google I/O presents the basics of Go‘s concurrency primitives and several ways to apply them.</a></li><li><a href="https://blog.golang.org/advanced-go-concurrency-patterns" target="_blank" rel="noreferrer">Advanced Go Concurrency Patterns – Rob Pike – 2013 Google I/O</a><br><a href="https://blog.golang.org/advanced-go-concurrency-patterns" target="_blank" rel="noreferrer">covers more complex uses of Go’s primitives, especially select.</a></li><li><a href="https://swtch.com/~rsc/thread/squint.pdf" target="_blank" rel="noreferrer">Squinting at Power Series – Douglas McIlroy’s paper</a><br><a href="https://swtch.com/~rsc/thread/squint.pdf" target="_blank" rel="noreferrer">shows how Go-like concurrency provides elegant support for complex calculations.</a></li></ul><p>好了，这节课就到这里。如果你觉得今天的内容对你有所帮助，欢迎你帮我分享给更多人。 精选留言（5） Geek_Fantasy 👍（5） 💬（0）判断一个数是否是质数的方法可以优化一下。只需要枚举到value的平方根就可以，可以把复杂度从O(n)降到O(sqrt(n))。2021-01-20ano 👍（0） 💬（0）merge 中的 wg.Wait() 为什么必须要放到一个单独的 goroutine 中呢？2022-09-03Geek_ce6971 👍（0） 💬（0）pipeline 最后返回 &lt;- chan 类型，就像 java stream编程的输出流2022-01-29方勇(gopher) 👍（0） 💬（0）Pipeline使用场景还是很多的，在做任务发布的时候会经常用到2021-12-27你为啥那么牛 👍（0） 💬（1）没看明白 你是怎么分组的2021-08-16</p>`,48)])])}const g=a(l,[["render",i]]);export{d as __pageData,g as default};
