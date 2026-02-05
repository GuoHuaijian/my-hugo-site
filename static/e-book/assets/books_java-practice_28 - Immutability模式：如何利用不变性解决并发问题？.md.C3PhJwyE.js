import{_ as a,o as s,c as p,ae as l}from"./chunks/framework.Iv6F95cJ.js";const f=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"books/java-practice/28 - Immutability模式：如何利用不变性解决并发问题？.md","filePath":"books/java-practice/28 - Immutability模式：如何利用不变性解决并发问题？.md"}'),e={name:"books/java-practice/28 - Immutability模式：如何利用不变性解决并发问题？.md"};function i(t,n,c,o,r,u){return s(),p("div",null,[...n[0]||(n[0]=[l(`<p>我们曾经说过，“多个线程同时读写同一共享变量存在并发问题”，这里的必要条件之一是读写，如果只有读，而没有写，是没有并发问题的。</p><p>解决并发问题，其实最简单的办法就是让共享变量只有读操作，而没有写操作。这个办法如此重要，以至于被上升到了一种解决并发问题的设计模式：<strong>不变性（Immutability）模式</strong>。所谓<strong>不变性，简单来讲，就是对象一旦被创建之后，状态就不再发生变化</strong>。换句话说，就是变量一旦被赋值，就不允许修改了（没有写操作）；没有修改操作，也就是保持了不变性。</p><h2 id="快速实现具备不可变性的类" tabindex="-1">快速实现具备不可变性的类 <a class="header-anchor" href="#快速实现具备不可变性的类" aria-label="Permalink to &quot;快速实现具备不可变性的类&quot;">&amp;ZeroWidthSpace;</a></h2><p>实现一个具备不可变性的类，还是挺简单的。<strong>将一个类所有的属性都设置成final的，并且只允许存在只读方法，那么这个类基本上就具备不可变性了</strong>。更严格的做法是<strong>这个类本身也是final的</strong>，也就是不允许继承。因为子类可以覆盖父类的方法，有可能改变不可变性，所以推荐你在实际工作中，使用这种更严格的做法。</p><p>Java SDK里很多类都具备不可变性，只是由于它们的使用太简单，最后反而被忽略了。例如经常用到的String和Long、Integer、Double等基础类型的包装类都具备不可变性，这些对象的线程安全性都是靠不可变性来保证的。如果你仔细翻看这些类的声明、属性和方法，你会发现它们都严格遵守不可变类的三点要求：<strong>类和属性都是final的，所有方法均是只读的</strong>。</p><p>看到这里你可能会疑惑，Java的String方法也有类似字符替换操作，怎么能说所有方法都是只读的呢？我们结合String的源代码来解释一下这个问题，下面的示例代码源自Java 1.8 SDK，我略做了修改，仅保留了关键属性value[]和replace()方法，你会发现：String这个类以及它的属性value[]都是final的；而replace()方法的实现，就的确没有修改value[]，而是将替换后的字符串作为返回值返回了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class String {</span></span>
<span class="line"><span>  private final char value[];</span></span>
<span class="line"><span>  // 字符替换</span></span>
<span class="line"><span>  String replace(char oldChar, </span></span>
<span class="line"><span>      char newChar) {</span></span>
<span class="line"><span>    //无需替换，直接返回this  </span></span>
<span class="line"><span>    if (oldChar == newChar){</span></span>
<span class="line"><span>      return this;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    int len = value.length;</span></span>
<span class="line"><span>    int i = -1;</span></span>
<span class="line"><span>    /* avoid getfield opcode */</span></span>
<span class="line"><span>    char[] val = value; </span></span>
<span class="line"><span>    //定位到需要替换的字符位置</span></span>
<span class="line"><span>    while (++i &lt; len) {</span></span>
<span class="line"><span>      if (val[i] == oldChar) {</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //未找到oldChar，无需替换</span></span>
<span class="line"><span>    if (i &gt;= len) {</span></span>
<span class="line"><span>      return this;</span></span>
<span class="line"><span>    } </span></span>
<span class="line"><span>    //创建一个buf[]，这是关键</span></span>
<span class="line"><span>    //用来保存替换后的字符串</span></span>
<span class="line"><span>    char buf[] = new char[len];</span></span>
<span class="line"><span>    for (int j = 0; j &lt; i; j++) {</span></span>
<span class="line"><span>      buf[j] = val[j];</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    while (i &lt; len) {</span></span>
<span class="line"><span>      char c = val[i];</span></span>
<span class="line"><span>      buf[i] = (c == oldChar) ? </span></span>
<span class="line"><span>        newChar : c;</span></span>
<span class="line"><span>      i++;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //创建一个新的字符串返回</span></span>
<span class="line"><span>    //原字符串不会发生任何变化</span></span>
<span class="line"><span>    return new String(buf, true);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>通过分析String的实现，你可能已经发现了，如果具备不可变性的类，需要提供类似修改的功能，具体该怎么操作呢？做法很简单，那就是<strong>创建一个新的不可变对象</strong>，这是与可变对象的一个重要区别，可变对象往往是修改自己的属性。</p><p>所有的修改操作都创建一个新的不可变对象，你可能会有这种担心：是不是创建的对象太多了，有点太浪费内存呢？是的，这样做的确有些浪费，那如何解决呢？</p><h2 id="利用享元模式避免创建重复对象" tabindex="-1">利用享元模式避免创建重复对象 <a class="header-anchor" href="#利用享元模式避免创建重复对象" aria-label="Permalink to &quot;利用享元模式避免创建重复对象&quot;">&amp;ZeroWidthSpace;</a></h2><p>如果你熟悉面向对象相关的设计模式，相信你一定能想到**享元模式（Flyweight Pattern）。利用享元模式可以减少创建对象的数量，从而减少内存占用。**Java语言里面Long、Integer、Short、Byte等这些基本数据类型的包装类都用到了享元模式。</p><p>下面我们就以Long这个类作为例子，看看它是如何利用享元模式来优化对象的创建的。</p><p>享元模式本质上其实就是一个<strong>对象池</strong>，利用享元模式创建对象的逻辑也很简单：创建之前，首先去对象池里看看是不是存在；如果已经存在，就利用对象池里的对象；如果不存在，就会新创建一个对象，并且把这个新创建出来的对象放进对象池里。</p><p>Long这个类并没有照搬享元模式，Long内部维护了一个静态的对象池，仅缓存了[-128,127]之间的数字，这个对象池在JVM启动的时候就创建好了，而且这个对象池一直都不会变化，也就是说它是静态的。之所以采用这样的设计，是因为Long这个对象的状态共有 264 种，实在太多，不宜全部缓存，而[-128,127]之间的数字利用率最高。下面的示例代码出自Java 1.8，valueOf()方法就用到了LongCache这个缓存，你可以结合着来加深理解。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Long valueOf(long l) {</span></span>
<span class="line"><span>  final int offset = 128;</span></span>
<span class="line"><span>  // [-128,127]直接的数字做了缓存</span></span>
<span class="line"><span>  if (l &gt;= -128 &amp;&amp; l &lt;= 127) { </span></span>
<span class="line"><span>    return LongCache</span></span>
<span class="line"><span>      .cache[(int)l + offset];</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return new Long(l);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>//缓存，等价于对象池</span></span>
<span class="line"><span>//仅缓存[-128,127]直接的数字</span></span>
<span class="line"><span>static class LongCache {</span></span>
<span class="line"><span>  static final Long cache[] </span></span>
<span class="line"><span>    = new Long[-(-128) + 127 + 1];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  static {</span></span>
<span class="line"><span>    for(int i=0; i&lt;cache.length; i++)</span></span>
<span class="line"><span>      cache[i] = new Long(i-128);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>前面我们在<a href="https://time.geekbang.org/column/article/87749" target="_blank" rel="noreferrer">《13 | 理论基础模块热点问题答疑》</a>中提到“Integer 和 String 类型的对象不适合做锁”，其实基本上所有的基础类型的包装类都不适合做锁，因为它们内部用到了享元模式，这会导致看上去私有的锁，其实是共有的。例如在下面代码中，本意是A用锁al，B用锁bl，各自管理各自的，互不影响。但实际上al和bl是一个对象，结果A和B共用的是一把锁。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class A {</span></span>
<span class="line"><span>  Long al=Long.valueOf(1);</span></span>
<span class="line"><span>  public void setAX(){</span></span>
<span class="line"><span>    synchronized (al) {</span></span>
<span class="line"><span>      //省略代码无数</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>class B {</span></span>
<span class="line"><span>  Long bl=Long.valueOf(1);</span></span>
<span class="line"><span>  public void setBY(){</span></span>
<span class="line"><span>    synchronized (bl) {</span></span>
<span class="line"><span>      //省略代码无数</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="使用immutability模式的注意事项" tabindex="-1">使用Immutability模式的注意事项 <a class="header-anchor" href="#使用immutability模式的注意事项" aria-label="Permalink to &quot;使用Immutability模式的注意事项&quot;">&amp;ZeroWidthSpace;</a></h2><p>在使用Immutability模式的时候，需要注意以下两点：</p><ol><li>对象的所有属性都是final的，并不能保证不可变性；</li><li>不可变对象也需要正确发布。</li></ol><p>在Java语言中，final修饰的属性一旦被赋值，就不可以再修改，但是如果属性的类型是普通对象，那么这个普通对象的属性是可以被修改的。例如下面的代码中，Bar的属性foo虽然是final的，依然可以通过setAge()方法来设置foo的属性age。所以，<strong>在使用Immutability模式的时候一定要确认保持不变性的边界在哪里，是否要求属性对象也具备不可变性</strong>。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Foo{</span></span>
<span class="line"><span>  int age=0;</span></span>
<span class="line"><span>  int name=&quot;abc&quot;;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>final class Bar {</span></span>
<span class="line"><span>  final Foo foo;</span></span>
<span class="line"><span>  void setAge(int a){</span></span>
<span class="line"><span>    foo.age=a;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>下面我们再看看如何正确地发布不可变对象。不可变对象虽然是线程安全的，但是并不意味着引用这些不可变对象的对象就是线程安全的。例如在下面的代码中，Foo具备不可变性，线程安全，但是类Bar并不是线程安全的，类Bar中持有对Foo的引用foo，对foo这个引用的修改在多线程中并不能保证可见性和原子性。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>//Foo线程安全</span></span>
<span class="line"><span>final class Foo{</span></span>
<span class="line"><span>  final int age=0;</span></span>
<span class="line"><span>  final int name=&quot;abc&quot;;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>//Bar线程不安全</span></span>
<span class="line"><span>class Bar {</span></span>
<span class="line"><span>  Foo foo;</span></span>
<span class="line"><span>  void setFoo(Foo f){</span></span>
<span class="line"><span>    this.foo=f;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>如果你的程序仅仅需要foo保持可见性，无需保证原子性，那么可以将foo声明为volatile变量，这样就能保证可见性。如果你的程序需要保证原子性，那么可以通过原子类来实现。下面的示例代码是合理库存的原子化实现，你应该很熟悉了，其中就是用原子类解决了不可变对象引用的原子性问题。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SafeWM {</span></span>
<span class="line"><span>  class WMRange{</span></span>
<span class="line"><span>    final int upper;</span></span>
<span class="line"><span>    final int lower;</span></span>
<span class="line"><span>    WMRange(int upper,int lower){</span></span>
<span class="line"><span>    //省略构造函数实现</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  final AtomicReference&lt;WMRange&gt;</span></span>
<span class="line"><span>    rf = new AtomicReference&lt;&gt;(</span></span>
<span class="line"><span>      new WMRange(0,0)</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>  // 设置库存上限</span></span>
<span class="line"><span>  void setUpper(int v){</span></span>
<span class="line"><span>    while(true){</span></span>
<span class="line"><span>      WMRange or = rf.get();</span></span>
<span class="line"><span>      // 检查参数合法性</span></span>
<span class="line"><span>      if(v &lt; or.lower){</span></span>
<span class="line"><span>        throw new IllegalArgumentException();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      WMRange nr = new</span></span>
<span class="line"><span>          WMRange(v, or.lower);</span></span>
<span class="line"><span>      if(rf.compareAndSet(or, nr)){</span></span>
<span class="line"><span>        return;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">&amp;ZeroWidthSpace;</a></h2><p>利用Immutability模式解决并发问题，也许你觉得有点陌生，其实你天天都在享受它的战果。Java语言里面的String和Long、Integer、Double等基础类型的包装类都具备不可变性，这些对象的线程安全性都是靠不可变性来保证的。Immutability模式是最简单的解决并发问题的方法，建议当你试图解决一个并发问题时，可以首先尝试一下Immutability模式，看是否能够快速解决。</p><p>具备不变性的对象，只有一种状态，这个状态由对象内部所有的不变属性共同决定。其实还有一种更简单的不变性对象，那就是<strong>无状态</strong>。无状态对象内部没有属性，只有方法。除了无状态的对象，你可能还听说过无状态的服务、无状态的协议等等。无状态有很多好处，最核心的一点就是性能。在多线程领域，无状态对象没有线程安全问题，无需同步处理，自然性能很好；在分布式领域，无状态意味着可以无限地水平扩展，所以分布式领域里面性能的瓶颈一定不是出在无状态的服务节点上。</p><h2 id="课后思考" tabindex="-1">课后思考 <a class="header-anchor" href="#课后思考" aria-label="Permalink to &quot;课后思考&quot;">&amp;ZeroWidthSpace;</a></h2><p>下面的示例代码中，Account的属性是final的，并且只有get方法，那这个类是不是具备不可变性呢？</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class Account{</span></span>
<span class="line"><span>  private final </span></span>
<span class="line"><span>    StringBuffer user;</span></span>
<span class="line"><span>  public Account(String user){</span></span>
<span class="line"><span>    this.user = </span></span>
<span class="line"><span>      new StringBuffer(user);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  public StringBuffer getUser(){</span></span>
<span class="line"><span>    return this.user;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  public String toString(){</span></span>
<span class="line"><span>    return &quot;user&quot;+user;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>欢迎在留言区与我分享你的想法，也欢迎你在留言区记录你的思考过程。感谢阅读，如果你觉得这篇文章对你有帮助的话，也欢迎把它分享给更多的朋友。 精选留言（15） 木卫六 👍（88） 💬（3）这段代码应该是线程安全的，但它不是不可变模式。StringBuffer只是字段引用不可变，值是可以调用StringBuffer的方法改变的，这个需要改成把字段改成String这样的不可变对象来解决。 2019-05-05拯救地球好累 👍（44） 💬（1）---总结---</p><ol><li>不可变类的特点：类、属性都是final的，方法是只读的</li><li>为了解决有些不可变类每次创建一个新对象导致内存浪费的问题：享元模式/对象池</li><li>注意事项：区别引用不可变和实际内容不可变</li><li>更简单的不可变对象：无状态对象2019-07-28炎炎 👍（16） 💬（1）这个专栏一直看到这儿，真的很棒，课后问题也很好，让我对并发编程有了一个整体的了解，之前看书一直看不懂，老师带着梳理一遍，看书也容易多了，非常感谢老师，希望老师再出专栏2019-05-24yang 👍（15） 💬（1）final StringBuffer user;</li></ol><p>StingBuffer 是 引用 类型， 当我们说它final StingBuffer user 不可变时，实际上说的是它user指向堆内存的地址不可变， 但堆内存的user对象，通过sub append 方法实际是可变的……2019-05-13水滴s 👍（10） 💬（2）老师，问下 Bar这个类的foo属性的设值在多线程下为什么会有原子性问题，我理解的只会有可见性问题？2019-12-12第一装甲集群司令克莱斯特 👍（5） 💬（1）随着课程的深入，越来越看不懂了。我不嫌丢人，不藏拙，这专栏，我一定会二刷，三刷，直到啃下来这块硬骨头！2020-07-21发条橙子 。 👍（2） 💬（1）老师五一节日快乐。</p><p>思考题 ： 不可变类的三要素 ：类、属性、方法都是不可变的。 思考题这个类虽然是final ，属性也是final并且没有修改的方法 ， 但是 stringbuffer这个属性的内容是可变的 ， 所以应该没有满足三要素中的属性不可变 ， 应该不属于不可变类 。</p><p>另外老师我有个问题想问下， 我看jdk一些源码里，也用了对象做锁。 例如 我有个变量 final ConcurrentHashMap cache , 有些方法中会对 cache变量 put新的值 ， 但是还有用这个对象做 synchronized(cache) 对象锁 ， 这种做法对么？ 如果对的话，是因为管程只判断对象的首地址没有改变的原因么 ，希望老师指点一下😁2019-05-02pg逆袭的小红帽是谁 👍（1） 💬（1）“String 和 Long、Integer、Double 等基础类型的包装类都具备不可变性，这些对象的线程安全性都是靠不可变性来保证的。” 这里有点不太理解，既然String 和 Long、Integer、Double具备不可变，不可变意味着线程安全，那不就可以说String 和 Long、Integer、Double 是线程安全的了？2022-05-09嗨喽 👍（0） 💬（2）上面得SafeWM类代码会不会有ABA问题呢，老师2019-06-13Jialin 👍（117） 💬（5）根据文章内容,一个类具备不可变属性需要满足&quot;类和属性都必须是 final 的,所有方法均是只读的&quot;,类的属性如果是引用型,该属性对应的类也需要满足不可变类的条件,且不能提供修改该属性的方法, Account类的唯一属性user是final的,提供的方法是可读的,user的类型是StringBuffer,StringBuffer也是final的,这样看来,Account类是不可变性的,但是去看StringBuffer的源码,你会发现StringBuffer类的属性value是可变的&lt;String类中的value定义:private final char value[];StringBuffer类中的value定义:char[] value;&gt;,并且提供了append(Object object)和setCharAt(int index, char ch)修改value. 所以,Account类不具备不可变性2019-05-02张天屹 👍（25） 💬（0）具不具备不可变性看怎么界定边界了，类本身是具备的，StrnigBuffer的引用不可变。但是因为StringBuffer是一个对象，持有非final的char数组，所以底层数组是可变的。但是StringBuffer是并发安全的，因为方法加锁synchronized2019-05-05对象正在输入... 👍（8） 💬（1）不可变类的三个要求 : 类和属性都是 final 的，所有方法均是只读的 这里的StringBuffer传进来的只是个引用，调用方可以修改，所以这个类不具备不可变性。</p><p>2019-05-05汤小高 👍（6） 💬（3）Immutability模原理弄清楚了，但是对于Immutability模式的应用场景还不是很明白，我的疑惑是既然共享变量是只读的，那就没必要加锁了，各个线程都读就行了，为啥还要用Immutability模式了，因为如果共享变量存在读写情况，就会加锁了，也不会用到Immutability模式，希望老师解惑，谢谢2020-06-18Hour 👍（6） 💬（3）//Foo 线程安全 final class Foo{ final int age=0; final int name=&quot;abc&quot;; } //Bar 线程不安全 class Bar { Foo foo; void setFoo(Foo f){ this.foo=f; } } 老师好，对foo的引用和修改在多线程环境中并不能保证原子性和可见性，这句话怎么理解，能用具体的例子说明一下吗？2019-06-01Rayjun 👍（6） 💬（1）不是不可变的，user 逃逸了2019-05-05</p>`,38)])])}const h=a(e,[["render",i]]);export{f as __pageData,h as default};
