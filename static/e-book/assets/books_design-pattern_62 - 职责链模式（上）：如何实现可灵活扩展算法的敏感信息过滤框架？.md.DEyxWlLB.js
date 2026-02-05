import{_ as s,o as a,c as p,ae as l}from"./chunks/framework.Iv6F95cJ.js";const u=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/design-pattern/62 - 职责链模式（上）：如何实现可灵活扩展算法的敏感信息过滤框架？.md","filePath":"books/design-pattern/62 - 职责链模式（上）：如何实现可灵活扩展算法的敏感信息过滤框架？.md"}'),e={name:"books/design-pattern/62 - 职责链模式（上）：如何实现可灵活扩展算法的敏感信息过滤框架？.md"};function i(c,n,t,r,d,o){return a(),p("div",null,[...n[0]||(n[0]=[l(`<p>前几节课中，我们学习了模板模式、策略模式，今天，我们来学习职责链模式。这三种模式具有相同的作用：复用和扩展，在实际的项目开发中比较常用，特别是框架开发中，我们可以利用它们来提供框架的扩展点，能够让框架的使用者在不修改框架源码的情况下，基于扩展点定制化框架的功能。</p><p>今天，我们主要讲解职责链模式的原理和实现。除此之外，我还会利用职责链模式，带你实现一个可以灵活扩展算法的敏感词过滤框架。下一节课，我们会更加贴近实战，通过剖析Servlet Filter、Spring Interceptor来看，如何利用职责链模式实现框架中常用的过滤器、拦截器。</p><p>话不多说，让我们正式开始今天的学习吧！</p><h2 id="职责链模式的原理和实现" tabindex="-1">职责链模式的原理和实现 <a class="header-anchor" href="#职责链模式的原理和实现" aria-label="Permalink to &quot;职责链模式的原理和实现&quot;">&amp;ZeroWidthSpace;</a></h2><p>职责链模式的英文翻译是Chain Of Responsibility Design Pattern。在GoF的《设计模式》中，它是这么定义的：</p><blockquote><p>Avoid coupling the sender of a request to its receiver by giving more than one object a chance to handle the request. Chain the receiving objects and pass the request along the chain until an object handles it.</p></blockquote><p>翻译成中文就是：将请求的发送和接收解耦，让多个接收对象都有机会处理这个请求。将这些接收对象串成一条链，并沿着这条链传递这个请求，直到链上的某个接收对象能够处理它为止。</p><p>这么说比较抽象，我用更加容易理解的话来进一步解读一下。</p><p>在职责链模式中，多个处理器（也就是刚刚定义中说的“接收对象”）依次处理同一个请求。一个请求先经过A处理器处理，然后再把请求传递给B处理器，B处理器处理完后再传递给C处理器，以此类推，形成一个链条。链条上的每个处理器各自承担各自的处理职责，所以叫作职责链模式。</p><p>关于职责链模式，我们先来看看它的代码实现。结合代码实现，你会更容易理解它的定义。职责链模式有多种实现方式，我们这里介绍两种比较常用的。</p><p>第一种实现方式如下所示。其中，Handler是所有处理器类的抽象父类，handle()是抽象方法。每个具体的处理器类（HandlerA、HandlerB）的handle()函数的代码结构类似，如果它能处理该请求，就不继续往下传递；如果不能处理，则交由后面的处理器来处理（也就是调用successor.handle()）。HandlerChain是处理器链，从数据结构的角度来看，它就是一个记录了链头、链尾的链表。其中，记录链尾是为了方便添加处理器。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class Handler {</span></span>
<span class="line"><span>  protected Handler successor = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void setSuccessor(Handler successor) {</span></span>
<span class="line"><span>    this.successor = successor;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public abstract void handle();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class HandlerA extends Handler {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void handle() {</span></span>
<span class="line"><span>    boolean handled = false;</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>    if (!handled &amp;&amp; successor != null) {</span></span>
<span class="line"><span>      successor.handle();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class HandlerB extends Handler {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void handle() {</span></span>
<span class="line"><span>    boolean handled = false;</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>    if (!handled &amp;&amp; successor != null) {</span></span>
<span class="line"><span>      successor.handle();</span></span>
<span class="line"><span>    } </span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class HandlerChain {</span></span>
<span class="line"><span>  private Handler head = null;</span></span>
<span class="line"><span>  private Handler tail = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void addHandler(Handler handler) {</span></span>
<span class="line"><span>    handler.setSuccessor(null);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (head == null) {</span></span>
<span class="line"><span>      head = handler;</span></span>
<span class="line"><span>      tail = handler;</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    tail.setSuccessor(handler);</span></span>
<span class="line"><span>    tail = handler;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void handle() {</span></span>
<span class="line"><span>    if (head != null) {</span></span>
<span class="line"><span>      head.handle();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用举例</span></span>
<span class="line"><span>public class Application {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    HandlerChain chain = new HandlerChain();</span></span>
<span class="line"><span>    chain.addHandler(new HandlerA());</span></span>
<span class="line"><span>    chain.addHandler(new HandlerB());</span></span>
<span class="line"><span>    chain.handle();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>实际上，上面的代码实现不够优雅。处理器类的handle()函数，不仅包含自己的业务逻辑，还包含对下一个处理器的调用，也就是代码中的successor.handle()。一个不熟悉这种代码结构的程序员，在添加新的处理器类的时候，很有可能忘记在handle()函数中调用successor.handle()，这就会导致代码出现bug。</p><p>针对这个问题，我们对代码进行重构，利用模板模式，将调用successor.handle()的逻辑从具体的处理器类中剥离出来，放到抽象父类中。这样具体的处理器类只需要实现自己的业务逻辑就可以了。重构之后的代码如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class Handler {</span></span>
<span class="line"><span>  protected Handler successor = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void setSuccessor(Handler successor) {</span></span>
<span class="line"><span>    this.successor = successor;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public final void handle() {</span></span>
<span class="line"><span>    boolean handled = doHandle();</span></span>
<span class="line"><span>    if (successor != null &amp;&amp; !handled) {</span></span>
<span class="line"><span>      successor.handle();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected abstract boolean doHandle();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class HandlerA extends Handler {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected boolean doHandle() {</span></span>
<span class="line"><span>    boolean handled = false;</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>    return handled;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class HandlerB extends Handler {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected boolean doHandle() {</span></span>
<span class="line"><span>    boolean handled = false;</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>    return handled;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// HandlerChain和Application代码不变</span></span></code></pre></div><p>我们再来看第二种实现方式，代码如下所示。这种实现方式更加简单。HandlerChain类用数组而非链表来保存所有的处理器，并且需要在HandlerChain的handle()函数中，依次调用每个处理器的handle()函数。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface IHandler {</span></span>
<span class="line"><span>  boolean handle();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class HandlerA implements IHandler {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean handle() {</span></span>
<span class="line"><span>    boolean handled = false;</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>    return handled;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class HandlerB implements IHandler {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean handle() {</span></span>
<span class="line"><span>    boolean handled = false;</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>    return handled;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class HandlerChain {</span></span>
<span class="line"><span>  private List&lt;IHandler&gt; handlers = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void addHandler(IHandler handler) {</span></span>
<span class="line"><span>    this.handlers.add(handler);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void handle() {</span></span>
<span class="line"><span>    for (IHandler handler : handlers) {</span></span>
<span class="line"><span>      boolean handled = handler.handle();</span></span>
<span class="line"><span>      if (handled) {</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用举例</span></span>
<span class="line"><span>public class Application {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    HandlerChain chain = new HandlerChain();</span></span>
<span class="line"><span>    chain.addHandler(new HandlerA());</span></span>
<span class="line"><span>    chain.addHandler(new HandlerB());</span></span>
<span class="line"><span>    chain.handle();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>在GoF给出的定义中，如果处理器链上的某个处理器能够处理这个请求，那就不会继续往下传递请求。实际上，职责链模式还有一种变体，那就是请求会被所有的处理器都处理一遍，不存在中途终止的情况。这种变体也有两种实现方式：用链表存储处理器和用数组存储处理器，跟上面的两种实现方式类似，只需要稍微修改即可。</p><p>我这里只给出其中一种实现方式，如下所示。另外一种实现方式你对照着上面的实现自行修改。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class Handler {</span></span>
<span class="line"><span>  protected Handler successor = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void setSuccessor(Handler successor) {</span></span>
<span class="line"><span>    this.successor = successor;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public final void handle() {</span></span>
<span class="line"><span>    doHandle();</span></span>
<span class="line"><span>    if (successor != null) {</span></span>
<span class="line"><span>      successor.handle();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected abstract void doHandle();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class HandlerA extends Handler {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected void doHandle() {</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class HandlerB extends Handler {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected void doHandle() {</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class HandlerChain {</span></span>
<span class="line"><span>  private Handler head = null;</span></span>
<span class="line"><span>  private Handler tail = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void addHandler(Handler handler) {</span></span>
<span class="line"><span>    handler.setSuccessor(null);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (head == null) {</span></span>
<span class="line"><span>      head = handler;</span></span>
<span class="line"><span>      tail = handler;</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    tail.setSuccessor(handler);</span></span>
<span class="line"><span>    tail = handler;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void handle() {</span></span>
<span class="line"><span>    if (head != null) {</span></span>
<span class="line"><span>      head.handle();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用举例</span></span>
<span class="line"><span>public class Application {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    HandlerChain chain = new HandlerChain();</span></span>
<span class="line"><span>    chain.addHandler(new HandlerA());</span></span>
<span class="line"><span>    chain.addHandler(new HandlerB());</span></span>
<span class="line"><span>    chain.handle();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="职责链模式的应用场景举例" tabindex="-1">职责链模式的应用场景举例 <a class="header-anchor" href="#职责链模式的应用场景举例" aria-label="Permalink to &quot;职责链模式的应用场景举例&quot;">&amp;ZeroWidthSpace;</a></h2><p>职责链模式的原理和实现讲完了，我们再通过一个实际的例子，来学习一下职责链模式的应用场景。</p><p>对于支持UGC（User Generated Content，用户生成内容）的应用（比如论坛）来说，用户生成的内容（比如，在论坛中发表的帖子）可能会包含一些敏感词（比如涉黄、广告、反动等词汇）。针对这个应用场景，我们就可以利用职责链模式来过滤这些敏感词。</p><p>对于包含敏感词的内容，我们有两种处理方式，一种是直接禁止发布，另一种是给敏感词打马赛克（比如，用***替换敏感词）之后再发布。第一种处理方式符合GoF给出的职责链模式的定义，第二种处理方式是职责链模式的变体。</p><p>我们这里只给出第一种实现方式的代码示例，如下所示，并且，我们只给出了代码实现的骨架，具体的敏感词过滤算法并没有给出，你可以参看我的另一个专栏<a href="https://time.geekbang.org/column/intro/100017301" target="_blank" rel="noreferrer">《数据结构与算法之美》</a>中多模式字符串匹配的相关章节自行实现。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface SensitiveWordFilter {</span></span>
<span class="line"><span>  boolean doFilter(Content content);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class SexyWordFilter implements SensitiveWordFilter {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean doFilter(Content content) {</span></span>
<span class="line"><span>    boolean legal = true;</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>    return legal;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// PoliticalWordFilter、AdsWordFilter类代码结构与SexyWordFilter类似</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class SensitiveWordFilterChain {</span></span>
<span class="line"><span>  private List&lt;SensitiveWordFilter&gt; filters = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void addFilter(SensitiveWordFilter filter) {</span></span>
<span class="line"><span>    this.filters.add(filter);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // return true if content doesn&#39;t contain sensitive words.</span></span>
<span class="line"><span>  public boolean filter(Content content) {</span></span>
<span class="line"><span>    for (SensitiveWordFilter filter : filters) {</span></span>
<span class="line"><span>      if (!filter.doFilter(content)) {</span></span>
<span class="line"><span>        return false;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return true;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class ApplicationDemo {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    SensitiveWordFilterChain filterChain = new SensitiveWordFilterChain();</span></span>
<span class="line"><span>    filterChain.addFilter(new AdsWordFilter());</span></span>
<span class="line"><span>    filterChain.addFilter(new SexyWordFilter());</span></span>
<span class="line"><span>    filterChain.addFilter(new PoliticalWordFilter());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    boolean legal = filterChain.filter(new Content());</span></span>
<span class="line"><span>    if (!legal) {</span></span>
<span class="line"><span>      // 不发表</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      // 发表</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>看了上面的实现，你可能会说，我像下面这样也可以实现敏感词过滤功能，而且代码更加简单，为什么非要使用职责链模式呢？这是不是过度设计呢？</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SensitiveWordFilter {</span></span>
<span class="line"><span>  // return true if content doesn&#39;t contain sensitive words.</span></span>
<span class="line"><span>  public boolean filter(Content content) {</span></span>
<span class="line"><span>    if (!filterSexyWord(content)) {</span></span>
<span class="line"><span>      return false;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (!filterAdsWord(content)) {</span></span>
<span class="line"><span>      return false;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (!filterPoliticalWord(content)) {</span></span>
<span class="line"><span>      return false;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return true;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private boolean filterSexyWord(Content content) {</span></span>
<span class="line"><span>    //....</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private boolean filterAdsWord(Content content) {</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private boolean filterPoliticalWord(Content content) {</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们前面多次讲过，应用设计模式主要是为了应对代码的复杂性，让其满足开闭原则，提高代码的扩展性。这里应用职责链模式也不例外。实际上，我们在讲解<a href="https://time.geekbang.org/column/article/214014" target="_blank" rel="noreferrer">策略模式</a>的时候，也讲过类似的问题，比如，为什么要用策略模式？当时的给出的理由，与现在应用职责链模式的理由，几乎是一样的，你可以结合着当时的讲解一块来看下。</p><p><strong>首先，我们来看，职责链模式如何应对代码的复杂性。</strong></p><p>将大块代码逻辑拆分成函数，将大类拆分成小类，是应对代码复杂性的常用方法。应用职责链模式，我们把各个敏感词过滤函数继续拆分出来，设计成独立的类，进一步简化了SensitiveWordFilter类，让SensitiveWordFilter类的代码不会过多，过复杂。</p><p><strong>其次，我们再来看，职责链模式如何让代码满足开闭原则，提高代码的扩展性。</strong></p><p>当我们要扩展新的过滤算法的时候，比如，我们还需要过滤特殊符号，按照非职责链模式的代码实现方式，我们需要修改SensitiveWordFilter的代码，违反开闭原则。不过，这样的修改还算比较集中，也是可以接受的。而职责链模式的实现方式更加优雅，只需要新添加一个Filter类，并且通过addFilter()函数将它添加到FilterChain中即可，其他代码完全不需要修改。</p><p>不过，你可能会说，即便使用职责链模式来实现，当添加新的过滤算法的时候，还是要修改客户端代码（ApplicationDemo），这样做也没有完全符合开闭原则。</p><p>实际上，细化一下的话，我们可以把上面的代码分成两类：框架代码和客户端代码。其中，ApplicationDemo属于客户端代码，也就是使用框架的代码。除ApplicationDemo之外的代码属于敏感词过滤框架代码。</p><p>假设敏感词过滤框架并不是我们开发维护的，而是我们引入的一个第三方框架，我们要扩展一个新的过滤算法，不可能直接去修改框架的源码。这个时候，利用职责链模式就能达到开篇所说的，在不修改框架源码的情况下，基于职责链模式提供的扩展点，来扩展新的功能。换句话说，我们在框架这个代码范围内实现了开闭原则。</p><p>除此之外，利用职责链模式相对于不用职责链的实现方式，还有一个好处，那就是配置过滤算法更加灵活，可以只选择使用某几个过滤算法。</p><h2 id="重点回顾" tabindex="-1">重点回顾 <a class="header-anchor" href="#重点回顾" aria-label="Permalink to &quot;重点回顾&quot;">&amp;ZeroWidthSpace;</a></h2><p>好了，今天的内容到此就讲完了。我们一块儿总结回顾一下，你需要重点掌握的内容。</p><p>在职责链模式中，多个处理器依次处理同一个请求。一个请求先经过A处理器处理，然后再把请求传递给B处理器，B处理器处理完后再传递给C处理器，以此类推，形成一个链条。链条上的每个处理器各自承担各自的处理职责，所以叫作职责链模式。</p><p>在GoF的定义中，一旦某个处理器能处理这个请求，就不会继续将请求传递给后续的处理器了。当然，在实际的开发中，也存在对这个模式的变体，那就是请求不会中途终止传递，而是会被所有的处理器都处理一遍。</p><p>职责链模式有两种常用的实现。一种是使用链表来存储处理器，另一种是使用数组来存储处理器，后面一种实现方式更加简单。</p><h2 id="课堂讨论" tabindex="-1">课堂讨论 <a class="header-anchor" href="#课堂讨论" aria-label="Permalink to &quot;课堂讨论&quot;">&amp;ZeroWidthSpace;</a></h2><p>今天讲到利用职责链模式，我们可以让框架代码满足开闭原则。添加一个新的处理器，只需要修改客户端代码。如果我们希望客户端代码也满足开闭原则，不修改任何代码，你有什么办法可以做到呢？</p><p>欢迎留言和我分享你的想法。如果有收获，也欢迎你把这篇文章分享给你的朋友。 精选留言（15） Mew151 👍（10） 💬（9）Handler类的这个成员变量： protected Handler successor = null; 是不是命名为next更好一些，看这块理解了半天2020-08-05Geek_78eadb 👍（6） 💬（3）UGC 的职责链实现和观察者模式太像了（如果用观察者实现，我感觉是一样的，可能没学精吧），不知道大家有没有同感！2020-11-24托尼斯威特 👍（1） 💬（3）handler 处理顺序有时候是有要求的. 可是责任链模式本身没有能力限制顺序. 比如chain中handler的顺序是 A -&gt; B -&gt; C, 这时候有人不小心修改成了 A-&gt; C-&gt; B , 就会造成bug. 如何防止这种bug呢? 2020-07-29xk_ 👍（1） 💬（1）为什么用数组来存贮处理器会更简单呢？2020-04-26布凡 👍（0） 💬（1）第一段代码中的handled参数没用吧，没有赋值，然后if中一直为true，第二段才会通过doHandle来处理2020-05-13布凡 👍（0） 💬（3）职责链模式感觉好难理解，head 中保存A→B→C 然后tail 中保存 B→C 这个地方是怎么实现的呢？2020-05-13Michael 👍（115） 💬（2）之前在公司做的一个关于金融日历的需求，就用到了老师说的指责链模式，一个用户有各种金融日历提醒，每个提醒逻辑不一样，通过给各个提醒服务打上注解标记，通过spring ioc容器中动态获取提醒服务对象，再利用Java中的future，并行调用，最终得到的提醒汇聚成了一个提醒列表，再通过排序规则返给前端，之前这么做了，代码复合开闭原则了，但不知道是责任链模式，老师讲了，才恍然大悟，是责任链的变体，所有链条都执行一遍。2020-03-25小晏子 👍（73） 💬（8）如果希望客户端代码也满足开闭原则，不修改任何代码，那么有个办法是不需要用户手动添加处理器，让框架代码能自动发现处理器，然后自动调用，要实现这个，就需要框架代码中自动发现接口实现类，可以通过注解和反射实现，然后将所有实现类都放到调用链中。这有个问题就是不够灵活，所有调用链可能都被执行，用户不能自由选择和组合处理器。2020-03-25tingye 👍（41） 💬（2）通过配置文件配置需要的处理器，客户端代码也可以不改，通过反射动态加载2020-03-25Zexho 👍（18） 💬（5）职责链模式和策略模式我觉得很像，本质上都可以当做 if else 的解耦行为。两者的不同主要体现判断的条件下：策略模式在传入参数的时候就可以根据参数先进行判断，然后觉得使用哪一个策略；但是职责链模式的参数是无法提前判断的，先要由链路上的函数处理。就像敏感词汇，不经过一系列的判断，是无法提前知道的。2020-05-13吴小智 👍（17） 💬（23）职责链模式和装饰器模式太像了...2020-03-25徐同学呀 👍（15） 💬（1）在项目开发中，无意用到过滤链思维，也就是老师说的职责链模式的变体。理解更深刻了。 收获总结： 标准的职责链模式，链上的处理器顺序执行，有一个处理器可以处理，就终止传递执行 变体的职责链模式，链上的处理器会顺序执行，不会终止。</p><p>职责链模式的两种实现方式： 1.链表，只记录head和tail，结合模板方法模式，显式调用下一个处理器，具体处理器只要实现自己的处理逻辑即可。 2.数组列表，将处理器放进一个list里，Java的arraylist底层就是一个数组，for循环调用所有的处理器2020-03-25link 👍（13） 💬（0）okhttp对于 request和response的处理过程，非常经典的职责链模式。2020-06-11djfhchdh 👍（9） 💬（0）通过配置文件，配置需要的过滤处理器，利用java的反射机制，动态的加载处理器类，创建处理器对象。2020-03-25Liam 👍（8） 💬（0）1 工厂模式创建chain 2 使用配置文件或注解添加节点 3 反射自动装配chain2020-03-25</p>`,46)])])}const b=s(e,[["render",i]]);export{u as __pageData,b as default};
